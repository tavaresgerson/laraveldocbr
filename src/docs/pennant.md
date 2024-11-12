# Laravel Pennant

<a name="introduction"></a>
## Introdução

[Laravel Pennant](https://github.com/laravel/pennant) é um pacote de sinalizadores de recursos simples e leve - sem a sujeira. Os sinalizadores de recursos permitem que você implemente incrementalmente novos recursos de aplicativo com confiança, teste A/B novos designs de interface, complemente uma estratégia de desenvolvimento baseada em tronco e muito mais.

<a name="installation"></a>
## Instalação

Primeiro, instale o Pennant em seu projeto usando o gerenciador de pacotes Composer:

```shell
composer require laravel/pennant
```

Em seguida, você deve publicar os arquivos de configuração e migração do Pennant usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

Finalmente, você deve executar as migrações de banco de dados do seu aplicativo. Isso criará uma tabela `features` que Pennant usa para alimentar seu driver `database`:

```shell
php artisan migrate
```

<a name="configuration"></a>
## Configuração

Após publicar os ativos do Pennant, seu arquivo de configuração estará localizado em `config/pennant.php`. Este arquivo de configuração permite que você especifique o mecanismo de armazenamento padrão que será usado pelo Pennant para armazenar valores de sinalizadores de recursos resolvidos.

O Pennant inclui suporte para armazenar valores de sinalizadores de recursos resolvidos em uma matriz na memória por meio do driver `array`. Ou, o Pennant pode armazenar valores de sinalizadores de recursos resolvidos persistentemente em um banco de dados relacional por meio do driver `database`, que é o mecanismo de armazenamento padrão usado pelo Pennant.

<a name="defining-features"></a>
## Definindo recursos

Para definir um recurso, você pode usar o método `define` oferecido pela fachada `Feature`. Você precisará fornecer um nome para o recurso, bem como um *closure* que será invocado para resolver o valor inicial do recurso.

Normalmente, os recursos são definidos em um provedor de serviços usando a fachada `Feature`. O *closure* receberá o "escopo" para a verificação do recurso. Mais comumente, o escopo é o usuário autenticado no momento. Neste exemplo, definiremos um recurso para implementar incrementalmente uma nova API para os usuários do nosso aplicativo:

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
     * Inicialize qualquer serviço de aplicativo.
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

Como você pode ver, temos as seguintes regras para nosso recurso:

- Todos os membros internos da equipe devem usar a nova API.
- Nenhum cliente de alto tráfego deve usar a nova API.
- Caso contrário, o recurso deve ser atribuído aleatoriamente a usuários com uma chance de 1 em 100 de estar ativo.

A primeira vez que o recurso `new-api` for verificado para um determinado usuário, o resultado do *closure* será armazenado pelo driver de armazenamento. Na próxima vez que o recurso for verificado em relação ao mesmo usuário, o valor será recuperado do armazenamento e o *closure* não será invocado.

Por conveniência, se uma definição de recurso retornar apenas uma loteria, você pode omitir o *closure* completamente:

```php
    Feature::define('site-redesign', Lottery::odds(1, 1000));
```

<a name="class-based-features"></a>
### Recursos baseados em classe

O Pennant também permite que você defina recursos baseados em classe. Ao contrário das definições de recursos baseadas em *closure*, não há necessidade de registrar um recurso baseado em classe em um provedor de serviços. Para criar um recurso baseado em classe, você pode invocar o comando Artisan `pennant:feature`. Por padrão, a classe de recurso será colocada no diretório `app/Features` do seu aplicativo:

```shell
php artisan pennant:feature NewApi
```

Ao escrever uma classe de recurso, você só precisa definir um método `resolve`, que será invocado para resolver o valor inicial do recurso para um determinado escopo. Novamente, o escopo normalmente será o usuário autenticado no momento:

```php
<?php

namespace App\Features;

use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * Resolva o valor inicial do recurso.
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

::: info NOTA
As classes de recurso são resolvidas por meio do [container](/docs/container), então você pode injetar dependências no construtor da classe de recurso quando necessário.
:::

#### Personalizando o nome do recurso armazenado

Por padrão, o Pennant armazenará o nome de classe totalmente qualificado da classe de recurso. Se você quiser desacoplar o nome do recurso armazenado da estrutura interna do aplicativo, você pode especificar uma propriedade `$name` na classe de recurso. O valor desta propriedade será armazenado no lugar do nome da classe:

```php
<?php

namespace App\Features;

class NewApi
{
    /**
     * O nome armazenado do recurso.
     *
     * @var string
     */
    public $name = 'new-api';

    // ...
}
```

<a name="checking-features"></a>
## Verificando recursos

Para determinar se um recurso está ativo, você pode usar o método `active` na fachada `Feature`. Por padrão, os recursos são verificados em relação ao usuário autenticado no momento:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Exibir uma listagem do recurso.
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

Embora os recursos sejam verificados em relação ao usuário autenticado no momento por padrão, você pode facilmente verificar o recurso em relação a outro usuário ou [escopo](#escopo). Para fazer isso, use o método `for` oferecido pela fachada `Feature`:

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

O Pennant também oferece alguns métodos de conveniência adicionais que podem ser úteis ao determinar se um recurso está ativo ou não:

```php
// Determinar se todos os recursos fornecidos estão ativos...
Feature::allAreActive(['new-api', 'site-redesign']);

// Determinar se algum dos recursos fornecidos está ativo...
Feature::someAreActive(['new-api', 'site-redesign']);

// Determinar se um recurso está inativo...
Feature::inactive('new-api');

// Determinar se todos os recursos fornecidos estão inativos...
Feature::allAreInactive(['new-api', 'site-redesign']);

// Determinar se algum dos recursos fornecidos está inativo...
Feature::someAreInactive(['new-api', 'site-redesign']);
```

::: info NOTA
Ao usar o Pennant fora de um contexto HTTP, como em um comando Artisan ou um trabalho enfileirado, você normalmente deve [especificar explicitamente o escopo do recurso](#especificando-o-escopo). Como alternativa, você pode definir um [escopo padrão](#escopo-padrão) que considere contextos HTTP autenticados e contextos não autenticados.
:::

<a name="checking-class-based-features"></a>
#### Verificando recursos baseados em classe

Para recursos baseados em classe, você deve fornecer o nome da classe ao verificar o recurso:

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
     * Exibir uma listagem do recurso.
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
### Execução condicional

O método `when` pode ser usado para executar fluentemente um determinado *closure* se um recurso estiver ativo. Além disso, um segundo *closure* pode ser fornecido e será executado se o recurso estiver inativo:

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
         * Exibir uma listagem do recurso.
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

O método `unless` serve como o inverso do método `when`, executando o primeiro *closure* se o recurso estiver inativo:

```php
    return Feature::unless(NewApi::class,
        fn () => $this->resolveLegacyApiResponse($request),
        fn () => $this->resolveNewApiResponse($request),
    );
```

<a name="the-has-features-trait"></a>
### O Trait `HasFeatures`

O trait `HasFeatures` do Pennant pode ser adicionado ao modelo `User` do seu aplicativo (ou qualquer outro modelo que tenha recursos) para fornecer uma maneira fluente e conveniente de verificar recursos diretamente do modelo:

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

Depois que o trait for adicionado ao seu modelo, você pode facilmente verificar recursos invocando o método `features`:

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

Claro, o método `features` fornece acesso a muitos outros métodos convenientes para interagir com recursos:

```php
// Valores...
$value = $user->features()->value('purchase-button')
$values = $user->features()->values(['new-api', 'purchase-button']);

// Estado...
$user->features()->active('new-api');
$user->features()->allAreActive(['new-api', 'server-api']);
$user->features()->someAreActive(['new-api', 'server-api']);

$user->features()->inactive('new-api');
$user->features()->allAreInactive(['new-api', 'server-api']);
$user->features()->someAreInactive(['new-api', 'server-api']);

// Execução condicional...
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
### Diretiva Blade

Para tornar a verificação de recursos no Blade uma experiência perfeita, o Pennant oferece uma diretiva `@feature`:

```blade
@feature('site-redesign')
    <!-- 'site-redesign' is active -->
@else
    <!-- 'site-redesign' is inactive -->
@endfeature
```

<a name="middleware"></a>
### Middleware

O Pennant também inclui um [middleware](/docs/middleware) que pode ser usado para verificar se o usuário atualmente autenticado tem acesso a um recurso antes mesmo de uma rota ser invocada. Você pode atribuir o middleware a uma rota e especificar os recursos necessários para acessar a rota. Se algum dos recursos especificados estiver inativo para o usuário atualmente autenticado, uma resposta HTTP `400 Bad Request` será retornada pela rota. Vários recursos podem ser passados ​​para o método estático `using`.

```php
use Illuminate\Support\Facades\Route;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

Route::get('/api/servers', function () {
    // ...
})->middleware(EnsureFeaturesAreActive::using('new-api', 'servers-api'));
```

<a name="customizing-the-response"></a>
#### Personalizando a resposta

Se você quiser personalizar a resposta retornada pelo middleware quando um dos recursos listados estiver inativo, você pode usar o método `whenInactive` fornecido pelo middleware `EnsureFeaturesAreActive`. Normalmente, esse método deve ser invocado dentro do método `boot` de um dos provedores de serviço do seu aplicativo:

```php
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

/**
 * Inicialize qualquer serviço de aplicativo.
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
### Cache na memória

Ao verificar um recurso, o Pennant criará um cache na memória do resultado. Se você estiver usando o driver `database`, isso significa que verificar novamente o mesmo sinalizador de recurso em uma única solicitação não acionará consultas adicionais ao banco de dados. Isso também garante que o recurso tenha um resultado consistente durante a solicitação.

Se você precisar liberar manualmente o cache na memória, você pode usar o método `flushCache` oferecido pela fachada `Feature`:

```php
    Feature::flushCache();
```

<a name="scope"></a>
## Escopo

<a name="specifying-the-scope"></a>
### Especificando o escopo

Conforme discutido, os recursos são normalmente verificados em relação ao usuário autenticado no momento. No entanto, isso pode nem sempre atender às suas necessidades. Portanto, é possível especificar o escopo que você gostaria de verificar um determinado recurso por meio do método `for` da fachada `Feature`:

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

É claro que os escopos de recursos não são limitados a "usuários". Imagine que você criou uma nova experiência de cobrança que está implementando para equipes inteiras em vez de usuários individuais. Talvez você queira que as equipes mais antigas tenham uma implementação mais lenta do que as equipes mais novas. Seu *closure* de resolução de recurso pode ser parecido com o seguinte:

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

Você notará que o *closure* que definimos não está esperando um `Usuário`, mas sim um modelo `Equipe`. Para determinar se esse recurso está ativo para a equipe de um usuário, você deve passar a equipe para o método `for` oferecido pela fachada `Feature`:

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect()->to('/billing/v2');
}

// ...
```

<a name="default-scope"></a>
### Escopo Padrão

Também é possível personalizar o escopo padrão que o Pennant usa para verificar os recursos. Por exemplo, talvez todos os seus recursos sejam verificados em relação à equipe do usuário atualmente autenticado em vez do usuário. Em vez de ter que chamar `Feature::for($user->team)` toda vez que você verifica um recurso, você pode especificar a equipe como o escopo padrão. Normalmente, isso deve ser feito em um dos provedores de serviço do seu aplicativo:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Feature::resolveScopeUsing(fn ($driver) => Auth::user()?->team);

        // ...
    }
}
```

Se nenhum escopo for explicitamente fornecido por meio do método `for`, a verificação de recurso agora usará a equipe do usuário atualmente autenticado como o escopo padrão:

```php
Feature::active('billing-v2');

// Agora é equivalente a...

Feature::for($user->team)->active('billing-v2');
```

<a name="nullable-scope"></a>
### Escopo anulável

Se o escopo fornecido ao verificar um recurso for `null` e a definição do recurso não suportar `null` por meio de um tipo anulável ou incluindo `null` em um tipo de união, o Pennant retornará automaticamente `false` como o valor de resultado do recurso.

Portanto, se o escopo que você está passando para um recurso for potencialmente `null` e você quiser que o resolvedor de valor do recurso seja invocado, você deve levar isso em conta na definição do seu recurso. Um escopo `null` pode ocorrer se você verificar um recurso dentro de um comando Artisan, trabalho enfileirado ou rota não autenticada. Como geralmente não há um usuário autenticado nesses contextos, o escopo padrão será `null`.

Se você nem sempre [especifica explicitamente seu escopo de recurso](#especificando-o-escopo), então você deve garantir que o tipo do escopo seja "anulável" e manipular o valor do escopo `null` dentro de sua lógica de definição de recurso:

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
### Identificando o Escopo

Os drivers de armazenamento `array` e `database` integrados do Pennant sabem como armazenar corretamente identificadores de escopo para todos os tipos de dados PHP, bem como modelos Eloquent. No entanto, se seu aplicativo utilizar um driver Pennant de terceiros, esse driver pode não saber como armazenar corretamente um identificador para um modelo Eloquent ou outros tipos personalizados em seu aplicativo.

Em vista disso, o Pennant permite que você formate valores de escopo para armazenamento implementando o contrato `FeatureScopeable` nos objetos em seu aplicativo que são usados ​​como escopos Pennant.

Por exemplo, imagine que você esteja usando dois drivers de recursos diferentes em um único aplicativo: o driver `database` integrado e um driver "Flag Rocket" de terceiros. O driver "Flag Rocket" não sabe como armazenar corretamente um modelo Eloquent. Em vez disso, ele requer uma instância `FlagRocketUser`. Ao implementar o `toFeatureIdentifier` definido pelo contrato `FeatureScopeable`, podemos personalizar o valor do escopo armazenável fornecido a cada driver usado pelo nosso aplicativo:

```php
<?php

namespace App\Models;

use FlagRocket\FlagRocketUser;
use Illuminate\Database\Eloquent\Model;
use Laravel\Pennant\Contracts\FeatureScopeable;

class User extends Model implements FeatureScopeable
{
    /**
     * Converta o objeto em um identificador de escopo de recurso para o driver fornecido.
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
### Escopo de serialização

Por padrão, o Pennant usará um nome de classe totalmente qualificado ao armazenar um recurso associado a um modelo Eloquent. Se você já estiver usando um [mapa de morph Eloquent](/docs/eloquent-relationships#custom-polymorphic-types), você pode escolher que o Pennant também use o mapa de morph para desacoplar o recurso armazenado da estrutura do seu aplicativo.

Para conseguir isso, depois de definir seu mapa de morph Eloquent em um provedor de serviços, você pode invocar o método `useMorphMap` da fachada `Feature`:

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
## Valores de Recurso Ricos

Até agora, mostramos principalmente os recursos como estando em um estado binário, o que significa que eles são "ativos" ou "inativos", mas o Pennant também permite que você armazene valores ricos.

Por exemplo, imagine que você está testando três novas cores para o botão "Comprar agora" do seu aplicativo. Em vez de retornar `true` ou `false` da definição do recurso, você pode retornar uma string:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

Você pode recuperar o valor do recurso `purchase-button` usando o método `value`:

```php
$color = Feature::value('purchase-button');
```

A diretiva Blade incluída do Pennant também facilita a renderização condicional de conteúdo com base no valor atual do recurso:

```blade
@feature('purchase-button', 'blue-sapphire')
    <!-- 'blue-sapphire' is active -->
@elsefeature('purchase-button', 'seafoam-green')
    <!-- 'seafoam-green' is active -->
@elsefeature('purchase-button', 'tart-orange')
    <!-- 'tart-orange' is active -->
@endfeature
```

::: info NOTA
Ao usar valores ricos, é importante saber que um recurso é considerado "ativo" quando tem qualquer valor diferente de `false`.
:::

Ao chamar o método [conditional `when`](#conditional-execution), o valor rico do recurso será fornecido ao primeiro *closure*:

```php
    Feature::when('purchase-button',
        fn ($color) => /* ... */,
        fn () => /* ... */,
    );
```

Da mesma forma, ao chamar o método condicional `unless`, o valor rico do recurso será fornecido ao segundo *closure* opcional:

```php
    Feature::unless('purchase-button',
        fn () => /* ... */,
        fn ($color) => /* ... */,
    );
```

<a name="retrieving-multiple-features"></a>
## Recuperando vários recursos

O método `values` permite a recuperação de vários recursos para um determinado escopo:

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
// ]
```

Ou você pode usar o método `all` para recuperar os valores de todos os recursos definidos para um determinado escopo:

```php
Feature::all();

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

No entanto, os recursos baseados em classe são registrados dinamicamente e não são conhecidos pelo Pennant até que sejam verificados explicitamente. Isso significa que os recursos baseados em classe do seu aplicativo podem não aparecer nos resultados retornados pelo método `all` se eles ainda não tiverem sido verificados durante a solicitação atual.

Se você quiser garantir que as classes de recursos sejam sempre incluídas ao usar o método `all`, você pode usar os recursos de descoberta de recursos do Pennant. Para começar, invoque o método `discover` em um dos provedores de serviço do seu aplicativo:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Laravel\Pennant\Feature;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Inicialize qualquer serviço de aplicativo.
         */
        public function boot(): void
        {
            Feature::discover();

            // ...
        }
    }
```

O método `discover` registrará todas as classes de recursos no diretório `app/Features` do seu aplicativo. O método `all` agora incluirá essas classes em seus resultados, independentemente de terem sido verificadas durante a solicitação atual:

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
## Carregamento rápido

Embora o Pennant mantenha um cache na memória de todos os recursos resolvidos para uma única solicitação, ainda é possível encontrar problemas de desempenho. Para aliviar isso, o Pennant oferece a capacidade de carregar rapidamente valores de recursos.

Para ilustrar isso, imagine que estamos verificando se um recurso está ativo dentro de um loop:

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

Supondo que estamos usando o driver do banco de dados, este código executará uma consulta ao banco de dados para cada usuário no loop - executando potencialmente centenas de consultas. No entanto, usando o método `load` do Pennant, podemos remover esse potencial gargalo de desempenho carregando antecipadamente os valores de recurso para uma coleção de usuários ou escopos:

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

Para carregar valores de recurso somente quando eles ainda não foram carregados, você pode usar o método `loadMissing`:

```php
Feature::for($users)->loadMissing([
    'new-api',
    'purchase-button',
    'notifications-beta',
]);
```

<a name="updating-values"></a>
## Atualizando valores

Quando o valor de um recurso é resolvido pela primeira vez, o driver subjacente armazenará o resultado no armazenamento. Isso geralmente é necessário para garantir uma experiência consistente para seus usuários em todas as solicitações. No entanto, às vezes, você pode querer atualizar manualmente o valor armazenado do recurso.

Para fazer isso, você pode usar os métodos `activate` e `deactivate` para alternar um recurso "on" ou "off":

```php
use Laravel\Pennant\Feature;

// Ative o recurso para o escopo padrão...
Feature::activate('new-api');

// Desativar o recurso para o escopo fornecido...
Feature::for($user->team)->deactivate('billing-v2');
```

Também é possível definir manualmente um valor rico para um recurso fornecendo um segundo argumento para o método `activate`:

```php
Feature::activate('purchase-button', 'seafoam-green');
```

Para instruir o Pennant a esquecer o valor armazenado para um recurso, você pode usar o método `forget`. Quando o recurso for verificado novamente, o Pennant resolverá o valor do recurso a partir de sua definição de recurso:

```php
Feature::forget('purchase-button');
```

<a name="bulk-updates"></a>
### Atualizações em massa

Para atualizar valores de recursos armazenados em massa, você pode usar os métodos `activateForEveryone` e `deactivateForEveryone`.

Por exemplo, imagine que agora você está confiante na estabilidade do recurso `new-api` e encontrou a melhor cor `'purchase-button'` para seu fluxo de checkout - você pode atualizar o valor armazenado para todos os usuários adequadamente:

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');

Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

Alternativamente, você pode desativar o recurso para todos os usuários:

```php
Feature::deactivateForEveryone('new-api');
```

::: info NOTA
Isso atualizará apenas os valores de recurso resolvidos que foram armazenados pelo driver de armazenamento do Pennant. Você também precisará atualizar a definição do recurso em seu aplicativo.
:::

<a name="purging-features"></a>
### Expurgando Recursos

Às vezes, pode ser útil expurgar um recurso inteiro do armazenamento. Isso normalmente é necessário se você removeu o recurso de seu aplicativo ou fez ajustes na definição do recurso que gostaria de implementar para todos os usuários.

Você pode remover todos os valores armazenados para um recurso usando o método `purge`:

```php
// Eliminando um único recurso...
Feature::purge('new-api');

// Eliminando vários recursos...
Feature::purge(['new-api', 'purchase-button']);
```

Se você quiser purgar _todos_ os recursos do armazenamento, você pode invocar o método `purge` sem nenhum argumento:

```php
Feature::purge();
```

Como pode ser útil purgar recursos como parte do pipeline de implantação do seu aplicativo, o Pennant inclui um comando Artisan `pennant:purge` que purgará os recursos fornecidos do armazenamento:

```sh
php artisan pennant:purge new-api

php artisan pennant:purge new-api purchase-button
```

Também é possível purgar todos os recursos _exceto_ aqueles em uma determinada lista de recursos. Por exemplo, imagine que você queira purgar todos os recursos, mas manter os valores para os recursos "new-api" e "purchase-button" no armazenamento. Para fazer isso, você pode passar esses nomes de recursos para a opção `--except`:

```sh
php artisan pennant:purge --except=new-api --except=purchase-button
```

Por conveniência, o comando `pennant:purge` também suporta um sinalizador `--except-registered`. Este sinalizador indica que todos os recursos, exceto aqueles registrados explicitamente em um provedor de serviços, devem ser expurgados:

```sh
php artisan pennant:purge --except-registered
```

<a name="testing"></a>
## Testes

Ao testar código que interage com sinalizadores de recursos, a maneira mais fácil de controlar o valor retornado do sinalizador de recurso em seus testes é simplesmente redefinir o recurso. Por exemplo, imagine que você tem o seguinte recurso definido em um dos provedores de serviços do seu aplicativo:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

Para modificar o valor retornado do recurso em seus testes, você pode redefinir o recurso no início do teste. O teste a seguir sempre passará, mesmo que a implementação `Arr::random()` ainda esteja presente no provedor de serviços:

::: code-group
```php [Pest]
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define('purchase-button', 'seafoam-green');

    expect(Feature::value('purchase-button'))->toBe('seafoam-green');
});
```

```php [PHPUnit]
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define('purchase-button', 'seafoam-green');

    $this->assertSame('seafoam-green', Feature::value('purchase-button'));
}
```
:::

A mesma abordagem pode ser usada para recursos baseados em classe:

::: code-group
```php [Pest]
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define(NewApi::class, true);

    expect(Feature::value(NewApi::class))->toBeTrue();
});
```

```php [PHPUnit]
use App\Features\NewApi;
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define(NewApi::class, true);

    $this->assertTrue(Feature::value(NewApi::class));
}
```
:::

Se seu recurso estiver retornando uma instância `Lottery`, há um punhado de [auxiliares de teste disponíveis](/docs/helpers#testing-lotteries) úteis.

<a name="store-configuration"></a>
#### Configuração da Loja

Você pode configurar a loja que o Pennant usará durante os testes definindo a variável de ambiente `PENNANT_STORE` no arquivo `phpunit.xml` do seu aplicativo:

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
## Adicionando Drivers Pennant Personalizados

<a name="implementing-the-driver"></a>
#### Implementando o Driver

Se nenhum dos drivers de armazenamento existentes do Pennant atender às necessidades do seu aplicativo, você pode escrever seu próprio driver de armazenamento. Seu driver personalizado deve implementar a interface `Laravel\Pennant\Contracts\Driver`:

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

Agora, precisamos apenas implementar cada um desses métodos usando uma conexão Redis. Para um exemplo de como implementar cada um desses métodos, dê uma olhada em `Laravel\Pennant\Drivers\DatabaseDriver` no [código-fonte do Pennant](https://github.com/laravel/pennant/blob/1.x/src/Drivers/DatabaseDriver.php)

::: info NOTA
O Laravel não vem com um diretório para conter suas extensões. Você é livre para colocá-las onde quiser. Neste exemplo, criamos um diretório `Extensions` para abrigar o `RedisFeatureDriver`.
:::

<a name="registering-the-driver"></a>
#### Registrando o Driver

Depois que seu driver for implementado, você estará pronto para registrá-lo no Laravel. Para adicionar drivers adicionais ao Pennant, você pode usar o método `extend` fornecido pela fachada `Feature`. Você deve chamar o método `extend` do método `boot` de um dos [provedores de serviço](/docs/providers) do seu aplicativo:

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
     * Registre quaisquer serviços de aplicação.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Feature::extend('redis', function (Application $app) {
            return new RedisFeatureDriver($app->make('redis'), $app->make('events'), []);
        });
    }
}
```

Depois que o driver for registrado, você pode usar o driver `redis` no arquivo de configuração `config/pennant.php` do seu aplicativo:

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

O Pennant despacha uma variedade de eventos que podem ser úteis ao rastrear sinalizadores de recursos em todo o seu aplicativo.

### `Laravel\Pennant\Events\FeatureRetrieved`

Este evento é despachado sempre que um [recurso é verificado](#checking-features). Este evento pode ser útil para criar e rastrear métricas em relação ao uso de um sinalizador de recurso em todo o seu aplicativo.

### `Laravel\Pennant\Events\FeatureResolved`

Este evento é despachado na primeira vez que o valor de um recurso é resolvido para um escopo específico.

### `Laravel\Pennant\Events\UnknownFeatureResolved`

Este evento é despachado na primeira vez que um recurso desconhecido é resolvido para um escopo específico. Ouvir este evento pode ser útil se você pretendeu remover um sinalizador de recurso, mas acidentalmente deixou referências perdidas a ele em todo o seu aplicativo:

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
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Event::listen(function (UnknownFeatureResolved $event) {
            Log::error("Resolving unknown feature [{$event->feature}].");
        });
    }
}
```

### `Laravel\Pennant\Events\DynamicallyRegisteringFeatureClass`

Este evento é despachado quando um [recurso baseado em classe](#class-based-features) é verificado dinamicamente pela primeira vez durante uma solicitação.

### `Laravel\Pennant\Events\UnexpectedNullScopeEncountered`

Este evento é despachado quando um escopo `null` é passado para uma definição de recurso que [não suporta null](#nullable-scope).

Esta situação é tratada graciosamente e o recurso retornará `false`. No entanto, se você quiser optar por não usar o comportamento gracioso padrão deste recurso, você pode registrar um ouvinte para este evento no método `boot` do `AppServiceProvider` do seu aplicativo:

```php
use Illuminate\Support\Facades\Log;
use Laravel\Pennant\Events\UnexpectedNullScopeEncountered;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Event::listen(UnexpectedNullScopeEncountered::class, fn () => abort(500));
}
```

### `Laravel\Pennant\Events\FeatureUpdated`

Este evento é despachado ao atualizar um recurso para um escopo, geralmente chamando `activate` ou `deactivate`.

### `Laravel\Pennant\Events\FeatureUpdatedForAllScopes`

Este evento é despachado ao atualizar um recurso para todos os escopos, geralmente chamando `activateForEveryone` ou `deactivateForEveryone`.

### `Laravel\Pennant\Events\FeatureDeleted`

Este evento é despachado ao excluir um recurso para um escopo, geralmente chamando `forget`.

### `Laravel\Pennant\Events\FeaturesPurged`

Este evento é despachado ao limpar recursos específicos.

### `Laravel\Pennant\Events\AllFeaturesPurged`

Este evento é despachado ao limpar todos os recursos.
