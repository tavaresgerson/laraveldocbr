# Laravel Pennant

<a name="introduction"></a>
## Introdução

O Laravel Pennant é um pacote de sinalização de recursos simples e leve – sem as bagunças. As sinalizações permitem que você lance incrementalmente novos recursos do aplicativo com confiança, teste novas interfaces de usuário com A/B, complemente uma estratégia de desenvolvimento baseada em tronco e muito mais.

<a name="installation"></a>
## Instalação

Primeiro, instale o pacote Pennant em seu projeto usando o gerenciador de pacotes Composer:

```shell
composer require laravel/pennant
```

Em seguida você deve publicar os arquivos de configuração e migração do Pennant usando o comando Artisan vendor:publish:

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

Finalmente, você deve executar as migrações do banco de dados da sua aplicação. Isso criará uma tabela "features" que a Pennant utiliza para alimentar seu driver "database":

```shell
php artisan migrate
```

<a name="configuration"></a>
## Configuração

Após a publicação do arquivo de ativos do Pennant, seu arquivo de configuração estará localizado em 'config/pennant.php'. Este arquivo de configuração permite especificar o mecanismo de armazenamento padrão que será usado pelo Pennant para armazenar valores de sinalizador de recurso resolvidos.

A bandeira do pennant inclui suporte para armazenar valores de sinalizador de recurso resolvidos em um array na memória através do driver "array". Ou, a bandeira do pennant pode armazenar valores de sinalizador de recurso persistentes em um banco de dados relacional via o driver "banco de dados", que é o mecanismo de armazenamento padrão utilizado pelo Pennant.

<a name="defining-features"></a>
## Características Definidoras

Para definir uma característica, você pode usar o método de definição oferecida pela fachada 'Feature'. Você vai precisar fornecer um nome para a característica, assim como uma função de fechamento que será invocada para resolver o valor inicial da característica.

Em geral, as funcionalidades são definidas no provedor de serviços usando o "Feature" facade. O closure receberá um escopo para a verificação da funcionalidade. Geralmente, o escopo é o usuário autenticado no momento. Neste exemplo, vamos definir uma funcionalidade para implementar gradualmente uma nova API aos usuários do nosso aplicativo:

```php
<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Lottery;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::define('new-api', fn (User $user) => match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        });
    }
}
```

Como pode ver, nós temos as seguintes regras para nossa funcionalidade:

- Todos os membros da equipe interna devem estar usando a nova API.
- Os clientes de alto tráfego não devem estar usando a nova API.
- Caso contrário, o recurso deve ser atribuído aleatoriamente aos usuários com uma chance de um em cem de estar ativo.

A primeira vez que o recurso `new-api` é verificado para um determinado usuário, o resultado do closure será armazenado pelo driver de armazenamento. A próxima vez que o recurso é verificado contra o mesmo usuário, o valor será retirado do armazenamento e o closure não será invocado.

Por conveniência, se uma definição de recurso apenas retorna um sorteio, você pode omitir a restrição completamente:

```php
    Feature::define('site-redesign', Lottery::odds(1, 1000));
```

<a name="class-based-features"></a>
### Características baseadas em classes

Pennant também permite definir características baseadas na classe. Ao contrário das definições de recurso baseadas em fechamento, não é necessário registrar um recurso baseado em classe em um provedor de serviços. Para criar um recurso baseado em classe, você pode invocar o comando Artisan do pennant: feature . Por padrão, a classe de recursos será colocada no diretório "app/Features" do seu aplicativo:

```shell
php artisan pennant:feature NewApi
```

Ao escrever uma classe de recurso, você só precisa definir um método 'resolve', que será invocado para resolver o valor inicial do recurso em uma determinada escala. Novamente, a escala será tipicamente o usuário atualmente autenticado.

```php
<?php

namespace App\Features;

use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * Resolve the feature's initial value.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

> Nota! As classes de funcionalidade são resolvidas via o [container]/docs/container, por isso você pode injetar dependências no construtor da classe de funcionalidade quando necessário.

#### Personalizando o Nome da Característica Armazenada

Por padrão, Pennant armazena o nome da classe completo da classe de recurso. Se você gostaria de desacoplar o nome armazenado da estrutura interna do aplicativo, você pode especificar uma propriedade de `$name` na classe de recursos. O valor desta propriedade será armazenado no lugar do nome da classe:

```php
<?php

namespace App\Features;

class NewApi
{
    /**
     * The stored name of the feature.
     *
     * @var string
     */
    public $name = 'new-api';

    // ...
}
```

<a name="checking-features"></a>
## Verificar Recursos

Para determinar se um recurso é ativo, você pode utilizar o método `active` da fachada `Feature`. Por padrão, os recursos são verificados com relação ao usuário atualmente autenticado:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Feature::active('new-api')
                ? $this->resolveNewApiResponse($request)
                : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

Embora os recursos sejam verificados contra o usuário atualmente autenticado por padrão, você pode facilmente verificar o recurso em relação a outro usuário ou [escopo](#scope). Para fazer isso, use o método `for` oferecido pelo `Feature` fachada:

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

A pennant também oferece alguns métodos de conveniência adicionais que podem ser úteis para determinar se um recurso está ativo ou não:

```php
// Determine if all of the given features are active...
Feature::allAreActive(['new-api', 'site-redesign']);

// Determine if any of the given features are active...
Feature::someAreActive(['new-api', 'site-redesign']);

// Determine if a feature is inactive...
Feature::inactive('new-api');

// Determine if all of the given features are inactive...
Feature::allAreInactive(['new-api', 'site-redesign']);

// Determine if any of the given features are inactive...
Feature::someAreInactive(['new-api', 'site-redesign']);
```

> [!Nota]
> Ao utilizar a Pennant fora de um contexto HTTP, como em um comando Artisan ou em um trabalho enfileirado, você normalmente deve especificar explicitamente o escopo da funcionalidade (#especificando-o). Alternativamente, você pode definir um escopo padrão que leve em conta contextos HTTP autenticados e não autenticados.

<a name="checking-class-based-features"></a>
#### Verificando características baseadas em classes

Para atributos baseados em classe, você deve fornecer o nome da classe ao verificar o atributo:

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Feature::active(NewApi::class)
                ? $this->resolveNewApiResponse($request)
                : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

<a name="conditional-execution"></a>
### Execução Condicional

O método "when" pode ser usado para executar um dado fechamento fluentemente caso uma determinada característica esteja ativa. Além disso, um segundo fechamento pode ser fornecido e será executado se a característica estiver inativa:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Features\NewApi;
    use Illuminate\Http\Request;
    use Illuminate\Http\Response;
    use Laravel\Pennant\Feature;

    class PodcastController
    {
        /**
         * Display a listing of the resource.
         */
        public function index(Request $request): Response
        {
            return Feature::when(NewApi::class,
                fn () => $this->resolveNewApiResponse($request),
                fn () => $this->resolveLegacyApiResponse($request),
            );
        }

        // ...
    }
```

O método 'unless' serve como o inverso do método 'when', executando o primeiro encerramento se o recurso estiver inativo:

```php
    return Feature::unless(NewApi::class,
        fn () => $this->resolveLegacyApiResponse($request),
        fn () => $this->resolveNewApiResponse($request),
    );
```

<a name="the-has-features-trait"></a>
### O `HasFeatures` Trait

O trait 'HasFeatures' do Pennant pode ser adicionado ao seu modelo de usuário (ou qualquer outro modelo que tenha funcionalidades) para fornecer uma forma fluida e conveniente de verificar as funcionalidades diretamente do modelo.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Pennant\Concerns\HasFeatures;

class User extends Authenticatable
{
    use HasFeatures;

    // ...
}
```

Depois que o atributo tiver sido adicionado ao seu modelo, você pode facilmente verificar os atributos invocando o método 'atributos':

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

Claro, o método "features" fornece acesso a outros métodos convenientes para interagir com os recursos:

```php
// Values...
$value = $user->features()->value('purchase-button')
$values = $user->features()->values(['new-api', 'purchase-button']);

// State...
$user->features()->active('new-api');
$user->features()->allAreActive(['new-api', 'server-api']);
$user->features()->someAreActive(['new-api', 'server-api']);

$user->features()->inactive('new-api');
$user->features()->allAreInactive(['new-api', 'server-api']);
$user->features()->someAreInactive(['new-api', 'server-api']);

// Conditional execution...
$user->features()->when('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);

$user->features()->unless('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);
```

<a name="blade-directive"></a>
### Diretiva sobre lâminas de barbear

Para tornar o processo de verificação de funcionalidades na Blade uma experiência perfeita, o Pennant oferece um @feature: diretivo:

```blade
@feature('site-redesign')
    <!-- 'site-redesign' is active -->
@else
    <!-- 'site-redesign' is inactive -->
@endfeature
```

<a name="middleware"></a>
### Middleware

A bandeira também inclui um [middleware](/docs/middleware) que pode ser usado para verificar se o usuário autenticado tem acesso a uma funcionalidade antes mesmo de uma rota ser invocada. Você pode atribuir o middleware a uma rota e especificar as funcionalidades que são necessárias para acessar a rota. Se qualquer uma das funcionalidades especificadas estiver inativa para o usuário atualmente autenticado, uma resposta '400 Bad Request' HTTP será retornada pela rota.

```php
use Illuminate\Support\Facades\Route;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

Route::get('/api/servers', function () {
    // ...
})->middleware(EnsureFeaturesAreActive::using('new-api', 'servers-api'));
```

<a name="customizing-the-response"></a>
#### Personalizando a Resposta

Se você gostaria de personalizar a resposta retornada pelo middleware quando uma das funcionalidades listadas está inativa, você pode usar o método 'whenInactive' fornecido por 'EnsureFeaturesAreActive'. Normalmente, esse método deve ser invocado dentro do método 'boot' de um dos seus provedores de serviço:

```php
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    EnsureFeaturesAreActive::whenInactive(
        function (Request $request, array $features) {
            return new Response(status: 403);
        }
    );

    // ...
}
```

<a name="in-memory-cache"></a>
### Cache na Memória

Ao verificar um recurso, Pennant criará uma cache na memória do resultado. Se você estiver usando o driver "database", isso significa que re-verificar o mesmo sinal de recurso dentro de um único pedido não irá acionar consultas adicionais ao banco de dados. Isso também garante que o recurso tenha um resultado consistente por toda a duração do pedido.

Se você precisa limpar manualmente o cache na memória, você pode usar o método `flushCache` oferecido pela fachada `Feature`:

```php
    Feature::flushCache();
```

<a name="scope"></a>
## Amplitude de visão

<a name="specifying-the-scope"></a>
### Especificação de Escopo

Como discutido, as características são tipicamente verificadas contra o usuário atualmente autenticado. No entanto, isso nem sempre pode atender às suas necessidades. Portanto, é possível especificar o escopo que você gostaria de verificar uma determinada característica via o método 'for' da fachada 'Feature':

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

Claro, os escopos de recursos não são limitados aos usuários. Imagine que você construiu uma nova experiência de cobrança e está implementando-a para todas as equipes em vez de indivíduos. Talvez você gostaria que as equipes mais antigas tivessem um lançamento mais lento do que as novas equipes. Sua resolução de encerramento de recurso pode parecer algo assim:

```php
use App\Models\Team;
use Carbon\Carbon;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('billing-v2', function (Team $team) {
    if ($team->created_at->isAfter(new Carbon('1st Jan, 2023'))) {
        return true;
    }

    if ($team->created_at->isAfter(new Carbon('1st Jan, 2019'))) {
        return Lottery::odds(1 / 100);
    }

    return Lottery::odds(1 / 1000);
});
```

Você verá que o fechamento que definimos não está esperando por um 'Usuário', mas sim pelo modelo de 'Equipe'. Para determinar se este recurso é ativo para uma equipe do usuário, você deve passar a equipe ao método 'para' fornecido pela fachada 'Recurso':

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect()->to('/billing/v2');
}

// ...
```

<a name="default-scope"></a>
### Escopo padrão

Também é possível personalizar o escopo padrão que Pennant usa para verificar os recursos. Por exemplo, talvez todos os seus recursos sejam verificados contra a equipe atualmente autenticada em vez do usuário. Em vez de ter que chamar `Feature::for($user->team)` toda vez que verifica um recurso, você pode especificar a equipe como o escopo padrão. Normalmente, isso deve ser feito em um dos seus provedores de serviços de aplicação:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::resolveScopeUsing(fn ($driver) => Auth::user()?->team);

        // ...
    }
}
```

Se nenhuma escala for fornecida explicitamente através do método 'para', a verificação de recursos agora usará a equipe do usuário atualmente autenticado como o escopo padrão.

```php
Feature::active('billing-v2');

// Is now equivalent to...

Feature::for($user->team)->active('billing-v2');
```

<a name="nullable-scope"></a>
### Escopo Null

Se o escopo que você fornece ao verificar um recurso é nulo e a definição do recurso não suporta nulos através de um tipo opcional ou colocando nulos em um tipo de união, pennant retornará automaticamente falso como o valor da resposta do recurso.

Então se o escopo que você está passando para um recurso é potencialmente nulo e você deseja que o valor do recurso a resolver seja invocado, você deve tomar conta disso em sua definição de recurso. Um escopo nulo pode ocorrer se você verificar um recurso dentro de um comando Artisan, trabalho agendado ou rota não autenticada. Como geralmente não há um usuário autenticado nesses contextos, o escopo padrão será nulo.

Se você não especificar seu escopo de recurso em cada caso, deve garantir que o tipo do escopo seja "nulável" e lidar com o valor de escopo nulo dentro da lógica de definição de recursos:

```php
use App\Models\User;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('new-api', fn (User $user) => match (true) {// [tl! remove]
Feature::define('new-api', fn (User|null $user) => match (true) {// [tl! add]
    $user === null => true,// [tl! add]
    $user->isInternalTeamMember() => true,
    $user->isHighTrafficCustomer() => false,
    default => Lottery::odds(1 / 100),
});
```

<a name="identifying-scope"></a>
### Identificação do Alcance

Penna's drivers de armazenamento `array` e `database` sabem como armazenar corretamente identificadores de escopo para todos os tipos de dados PHP, bem como modelos Eloquent. No entanto, se a sua aplicação utiliza um driver de Pennon de terceiros, esse driver pode não saber como armazenar corretamente um identificador de modelo Eloquent ou outros tipos personalizados em seu aplicativo.

Em vista disso, Pennan permite-lhe formatar os valores de escopo para armazenamento implementando o contrato `FeatureScopeable` nos objetos utilizados como Pennan escopos na sua aplicação.

Imagine, por exemplo, que você está usando dois drivers diferentes em um único aplicativo: o "database" e o "FlagRocket". O driver de "FlagRocket" não sabe como armazenar corretamente um modelo Eloquent. Em vez disso, ele precisa de uma instância do `FlagRocketUser`. Ao implementar a `toFeatureIdentifier` definida pelo contrato `FeatureScopeable`, podemos personalizar o valor da "escopo-de-armazenagem" fornecido para cada driver usado pelo nosso aplicativo:

```php
<?php

namespace App\Models;

use FlagRocket\FlagRocketUser;
use Illuminate\Database\Eloquent\Model;
use Laravel\Pennant\Contracts\FeatureScopeable;

class User extends Model implements FeatureScopeable
{
    /**
     * Cast the object to a feature scope identifier for the given driver.
     */
    public function toFeatureIdentifier(string $driver): mixed
    {
        return match($driver) {
            'database' => $this,
            'flag-rocket' => FlagRocketUser::fromId($this->flag_rocket_id),
        };
    }
}
```

<a name="serializing-scope"></a>
### Serialização de Alcance

Por padrão, Pennant usará um nome de classe totalmente qualificado ao armazenar um recurso associado a um modelo Eloquent. Se você já estiver usando um [mapa de morfina Eloquent](/docs/eloquent-relationships#custom-polymorphic-types), você pode optar por ter pennant usar o mapa de morfina também para desacoplar o recurso armazenado da estrutura do aplicativo.

Para fazer isso, depois de definir seu mapa de mórfico eloquente em um provedor de serviço, você pode invocar o método `useMorphMap` da fachada 'UseFeature':

```php
use Illuminate\Database\Eloquent\Relations\Relation;
use Laravel\Pennant\Feature;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);

Feature::useMorphMap();
```

<a name="rich-feature-values"></a>
## Valores ricos de características

Até agora, mostramos principalmente características que estão em um estado binário, ou seja, elas são "ativas" ou "inativas", mas a Pennant também permite armazenar valores ricos.

Por exemplo, imagine que você está testando três novas cores para o botão "Compre agora" do seu aplicativo. Em vez de retornar um valor booleano (`true` ou `false`) da definição da funcionalidade, você pode retornar uma string:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

Você pode recuperar o valor do `buy-now` usando o método `value`:

```php
$color = Feature::value('purchase-button');
```

Penna's included Blade directive também torna fácil a renderização condicional de conteúdo com base no valor atual do recurso:

```blade
@feature('purchase-button', 'blue-sapphire')
    <!-- 'blue-sapphire' is active -->
@elsefeature('purchase-button', 'seafoam-green')
    <!-- 'seafoam-green' is active -->
@elsefeature('purchase-button', 'tart-orange')
    <!-- 'tart-orange' is active -->
@endfeature
```

> Nota: Quando se usa valores ricos, é importante saber que um recurso é considerado "ativo" quando tem qualquer valor diferente de 'falso'.

Ao chamar o método [condicional `when`](#conditional-execution), o valor rico da característica será fornecido ao primeiro closure:

```php
    Feature::when('purchase-button',
        fn ($color) => /* ... */,
        fn () => /* ... */,
    );
```

Da mesma forma, ao chamar o método condicional 'a menos que', o valor rico da característica será fornecido para o segundo fechamento opcional:

```php
    Feature::unless('purchase-button',
        fn () => /* ... */,
        fn ($color) => /* ... */,
    );
```

<a name="retrieving-multiple-features"></a>
## Recuperação de Recursos Múltiplos

O método `values` permite o retorno de vários atributos para uma determinada visão.

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
// ]
```

Ou você pode usar o método "all" para obter os valores de todas as características definidas para um determinado escopo.

```php
Feature::all();

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

Porém, os atributos baseados em classes são dinamicamente registrados e não são conhecidos pelo Pennanl até que sejam explicitamente verificados. Isto significa que as funcionalidades baseadas em classe do seu aplicativo podem não aparecer nos resultados retornados pelo método 'all' se ainda não tiverem sido verificadas durante a solicitação atual.

Se você gostaria de garantir que a classe de características sempre seja incluída ao utilizar o método "all", você pode usar as capacidades de descoberta de características do Peníndio. Para começar, invoca o método 'descobrir' em um dos seus provedores de serviços de aplicação:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Laravel\Pennant\Feature;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            Feature::discover();

            // ...
        }
    }
```

O método discover vai registrar todas as classes de funcionalidades no diretório app/Features do seu aplicativo. O método all vai incluir agora essas classes em seus resultados, independentemente se elas foram verificadas na requisição atual.

```php
Feature::all();

// [
//     'App\Features\NewApi' => true,
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

<a name="eager-loading"></a>
## Carregamento em massa

Embora o Pennant mantém um cache na memória de todos os recursos resolvidos para uma única solicitação, ainda é possível encontrar problemas de desempenho. Para aliviar isso, o Pennant oferece a capacidade de carregar com antecedência os valores do recurso.

Para ilustrar isso, imagine que estamos verificando se um recurso está ativo dentro de um loop:

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

Assumindo que estamos usando o driver de banco de dados, este código executará uma consulta ao banco de dados para cada usuário no loop - executando potencialmente centenas de consultas. No entanto, utilizando o método `load` da Pennant, podemos remover este possível gargalo de desempenho carregando os valores de características para um conjunto de usuários ou escopos:

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

Para carregar valores de características apenas quando eles não foram carregados ainda, você pode usar o método `loadMissing`:

```php
Feature::for($users)->loadMissing([
    'new-api',
    'purchase-button',
    'notifications-beta',
]);
```

<a name="updating-values"></a>
## Atualização de Valores

Quando um valor de recurso é resolvido pela primeira vez, o motorista subjacente armazenará o resultado em armazenamento. Isso é frequentemente necessário para garantir uma experiência consistente para seus usuários por meio de solicitações. No entanto, às vezes você pode querer atualizar manualmente o valor do recurso armazenado.

Para conseguir isso, você pode usar os métodos 'activate' e 'deactivate' para alternar uma característica "ligada" ou "desligada".

```php
use Laravel\Pennant\Feature;

// Activate the feature for the default scope...
Feature::activate('new-api');

// Deactivate the feature for the given scope...
Feature::for($user->team)->deactivate('billing-v2');
```

Também é possível definir manualmente um valor rico para um recurso fornecendo um segundo argumento ao método "ativar":

```php
Feature::activate('purchase-button', 'seafoam-green');
```

Para instruir a Bandeira de esquecer o valor armazenado para uma característica, você pode usar o método `esquecer`. Quando a característica é verificada novamente, a Bandeira resolverá o valor da característica de sua definição de recurso:

```php
Feature::forget('purchase-button');
```

<a name="bulk-updates"></a>
### Atualizações em massa

Para atualizar os valores armazenados em lote, você pode usar o método 'activateForEveryone' e 'deactivateForEveryone'.

Por exemplo, imagine que você agora confia na estabilidade do recurso 'nova API' e escolheu a melhor cor para o botão 'comprar' em seu funil de checkout. Você pode atualizar o valor armazenado para todos os usuários:

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');

Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

Alternativamente, você pode desativar a função para todos os usuários:

```php
Feature::deactivateForEveryone('new-api');
```

> Nota: Esta ação apenas atualizará os valores dos recursos que já foram resolvidos e armazenados pelo driver de armazenamento do Pennant. Você também precisará atualizar a definição do recurso no seu aplicativo.

<a name="purging-features"></a>
### Características de purificação

Às vezes, pode ser útil excluir um recurso completo do armazenamento. Isso é tipicamente necessário se você remover o recurso de seu aplicativo ou fez ajustes na definição do recurso que você gostaria de implantar para todos os usuários.

Você pode remover todos os valores armazenados para um recurso usando o método `purge`:

```php
// Purging a single feature...
Feature::purge('new-api');

// Purging multiple features...
Feature::purge(['new-api', 'purchase-button']);
```

Se você gostaria de remover todas as características do armazenamento, você pode invocar o método `purge`: sem nenhum argumento.

```php
Feature::purge();
```

Como pode ser útil remover características como parte de sua configuração de aplicação, Pennão inclui um comando `pennant:purge` Artisan que irá limpar os dados das características fornecidas:

```sh
php artisan pennant:purge new-api

php artisan pennant:purge new-api purchase-button
```

É possível também desabastecer todos os atributos exceto aqueles em uma lista de atributos dados. Por exemplo, imagine que você queria desabastecer todos os atributos e manter os valores para os atributos "new-api" e "purchase-button" no armazenamento. Para fazer isso, é possível passar esses nomes de atributos a opção `--except`:

```sh
php artisan pennant:purge --except=new-api --except=purchase-button
```

Para conveniência, o comando 'pennant:purge' também suporta uma opção '--except-registered'. Essa opção indica que todas as funcionalidades, exceto aquelas explicitamente registradas no provedor de serviços, devem ser apagadas.

```sh
php artisan pennant:purge --except-registered
```

<a name="testing"></a>
## Teste

Quando testando um código que interage com a sinalização de recursos, a maneira mais fácil de controlar o valor retornado da sinalização do recurso em seus testes é simplesmente redefinir a sinalização do recurso. Por exemplo, imagine que você tenha a seguinte sinalização de recursos definida no provedor de serviço de um dos aplicativos:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

Para modificar o valor retornado pela funcionalidade nos testes, você pode redefini-la no início do teste. O seguinte teste sempre passarás, mesmo que a implementação 'Arr::random()' esteja ainda presente no provedor de serviços:

```php tab=Pest
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define('purchase-button', 'seafoam-green');

    expect(Feature::value('purchase-button'))->toBe('seafoam-green');
});
```

```php tab=PHPUnit
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define('purchase-button', 'seafoam-green');

    $this->assertSame('seafoam-green', Feature::value('purchase-button'));
}
```

A mesma abordagem pode ser usada para características baseadas em classe:

```php tab=Pest
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define(NewApi::class, true);

    expect(Feature::value(NewApi::class))->toBeTrue();
});
```

```php tab=PHPUnit
use App\Features\NewApi;
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define(NewApi::class, true);

    $this->assertTrue(Feature::value(NewApi::class));
}
```

Se sua função está retornando um objeto `Lottery`, há uma pequena quantidade de [testadores úteis disponíveis] (/docs/helpers#testing-lotteries) para este caso.

<a name="store-configuration"></a>
#### Configuração de Armazenamento

Você pode configurar a loja que Pennan usará durante o teste definindo a variável de ambiente PENNANT_STORE no arquivo phpunit.xml da sua aplicação:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit colors="true">
    <!-- ... -->
    <php>
        <env name="PENNANT_STORE" value="array"/>
        <!-- ... -->
    </php>
</phpunit>
```

<a name="adding-custom-pennant-drivers"></a>
## Adicionando os drivers de bandeira personalizados

<a name="implementing-the-driver"></a>
#### Implementando o Motorista

Se nenhum dos drivers de armazenamento existentes do Pennan for adequado para suas necessidades de aplicação, você pode escrever o seu próprio. Seu driver personalizado deve implementar a interface Laravel\Pennant\Contracts\Driver :

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;

class RedisFeatureDriver implements Driver
{
    public function define(string $feature, callable $resolver): void {}
    public function defined(): array {}
    public function getAll(array $features): array {}
    public function get(string $feature, mixed $scope): mixed {}
    public function set(string $feature, mixed $scope, mixed $value): void {}
    public function setForAllScopes(string $feature, mixed $value): void {}
    public function delete(string $feature, mixed $scope): void {}
    public function purge(array|null $features): void {}
}
```

Agora, só precisamos implementar cada um desses métodos usando uma conexão Redis. Para ver como implementar cada um desses métodos, veja o `Laravel\Pennant\Drivers\DatabaseDriver` no código-fonte do Pennant.

> NOTA [1]
> Laravel não vem com um diretório para conter suas extensões. Você é livre para colocá-las em qualquer lugar que quiser. Neste exemplo, criamos um diretório chamado "Extensions" para abrigar o "RedisFeatureDriver".

<a name="registering-the-driver"></a>
#### Registrando o motorista

Uma vez que o driver tenha sido implementado, você está pronto para registrá-lo com Laravel. Para adicionar drivers adicionais a Pennant, você pode usar o método `extend` fornecido pela fachada `Feature`. Você deve chamar o método `extend` do método `boot` de um dos seus provedor de serviços [service provider] da aplicação:

```php
<?php

namespace App\Providers;

use App\Extensions\RedisFeatureDriver;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::extend('redis', function (Application $app) {
            return new RedisFeatureDriver($app->make('redis'), $app->make('events'), []);
        });
    }
}
```

Uma vez que o motorista foi registrado, você pode usar o `redis` motorista no seu aplicativo 'config/pennant.php' arquivo de configuração:

```php
    'stores' => [

        'redis' => [
            'driver' => 'redis',
            'connection' => null,
        ],

        // ...

    ],
```

<a name="events"></a>
## Eventos

A bandeira envia uma variedade de eventos que podem ser úteis quando rastreando sinalizadores de recursos em todo o seu aplicativo.

### 'Laravel/pennant/events/feature-retrieved'

Este evento é enviado sempre que um [recurso é verificado](#verificando-recursos). Este evento pode ser útil para criar e acompanhar métricas contra o uso de uma bandeira de recurso em todo seu aplicativo.

### 'Laravel\Pennant\Events\FeatureResolved'

Este evento é enviado pela primeira vez que o valor de um atributo é resolvido para um determinado escopo.

### 'Laravel/Pennant/Events/UnknownFeatureResolved'

Este evento é enviado na primeira vez que uma característica desconhecida é resolvida para um escopo específico. Ouvir este evento pode ser útil se você tiver pretendido remover uma bandeira de recurso mas acidentalmente deixou referências erradas a ela espalhadas ao longo do seu aplicativo:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Laravel\Pennant\Events\UnknownFeatureResolved;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(function (UnknownFeatureResolved $event) {
            Log::error("Resolving unknown feature [{$event->feature}].");
        });
    }
}
```

### 'Laravel/Pennant/Events/DynamicallyRegisteringFeatureClass'

Este evento é enviado quando um [recurso baseado em classe](# recursos baseados em classes) é verificado dinamicamente pela primeira vez durante uma solicitação.

### 'Laravel/Pennant/Events/UnexpectedNullScopeEncountered'

Este evento é disparado quando um escopo nulo é passado para uma definição de recurso que [não suporta escopos nulos](#nullable-scope).

Esta situação é tratada graciosamente e o recurso retornará 'false'. No entanto, se você gostaria de optar por não usar esse comportamento padrão do recurso, você pode registrar um ouvinte para este evento no método 'boot' do seu 'AppServiceProvider':

```php
use Illuminate\Support\Facades\Log;
use Laravel\Pennant\Events\UnexpectedNullScopeEncountered;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(UnexpectedNullScopeEncountered::class, fn () => abort(500));
}

```

### `Laravel/Pennant/FeatureUpdated`

Este evento é enviado quando atualizamos uma funcionalidade em um escopo, geralmente por chamar o método 'activate' ou 'deactivate'.

### 'Laravel\Pennant\Events\FeatureUpdatedForAllScopes'

Este evento é enviado quando atualizamos uma funcionalidade para todos os escopos, geralmente chamando "activateForEveryone" ou "deactivateForEveryone".

### 'Laravel\Pennant\Events\FeatureDeleted'

Este evento é enviado quando uma característica é excluída para um escopo, geralmente por chamar o `esquecer`.

### 'Laravel\Pennant\Events\FeaturesPurged'

Este evento é enviado ao limpar características específicas.

### Laravel/Pennant/Events/AllFeaturesPurged

Este evento é enviado quando todas as características são apagadas.
