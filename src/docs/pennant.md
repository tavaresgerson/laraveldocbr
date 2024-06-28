# Bandeira do Laravel

<a name="introduction"></a>
## Introdução

 [Laravel Pennant](https://github.com/laravel/pennant) é um pacote de sinalizações de recursos simples e leve - sem o lixo. As sinalizações permitem que você faça o lançamento incremental de novas funcionalidades do aplicativo com confiança, teste A/B de novos designs de interface, complete uma estratégia de desenvolvimento baseada em tronco e muito mais.

<a name="installation"></a>
## Instalação

 Primeiro, instale o Pennant no seu projeto usando o gerenciador de pacotes Composer:

```shell
composer require laravel/pennant
```

 Em seguida, você deve publicar os arquivos de configuração e migração do Pennant usando o comando Vendor: Publish do Artisan.

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

 Por último, você deve executar as migrações de banco de dados do seu aplicativo. Isso criará uma tabela "features" que o driver "database" do Pennant usa para rodá-lo:

```shell
php artisan migrate
```

<a name="configuration"></a>
## Configuração

 Após publicar os recursos de Pennant, o arquivo de configuração estará localizado em `config/pennant.php`. Esse arquivo permite que você especifique o mecanismo de armazenamento padrão a ser utilizado pelo Pennant para armazenar os valores resolvidos do recurso feature flag.

 O Pennant inclui suporte para o armazenamento de valores dos sinais de recurso resolvidos em uma matriz de memória (via o driver `array`). Ou, o Pennant pode armazenar os valores dos sinais de recurso resolvidos de forma persistente em um banco de dados relacional (via o driver `database`), que é o mecanismo padrão de armazenamento usado pelo Pennant.

<a name="defining-features"></a>
## Características importantes

 Para definir um traço, pode utilizar o método `define`, proporcionado pela faca `Feature`. Terá de prever um nome para o traço e um fecho que será invocado para resolver o valor inicial do traço.

 Normalmente, as funcionalidades são definidas num serviço utilizando o fechamento `Feature`. A função recebe o escopo para verificação de funcionalidade. Em geral, esse escopo é o utilizador atualmente autenticado. Neste exemplo, iremos definir uma funcionalidade para a introdução gradual de uma nova API para os utilizadores da nossa aplicação:

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

 Como você pode verificar, temos as seguintes regras para o recurso:

 - Todos os membros da equipe interna devem estar usando a nova API.
 - Não deve ser utilizada pelos clientes de elevado tráfego a nova API.
 - Caso contrário, o recurso deve ser atribuído aleatoriamente aos usuários com uma probabilidade de 1 em 100 de estar ativo.

 A primeira vez que o recurso `new-api` for verificado para um determinado usuário, o resultado do fechamento será armazenado pelo driver de armazenamento. Na próxima vez em que o recurso for verificado contra o mesmo usuário, o valor será recuperado do armazenamento e o fechamento não será invocado.

 Por conveniência, se uma definição de função retornar apenas uma loteria, você pode ignorar totalmente o fechamento:

```php
    Feature::define('site-redesign', Lottery::odds(1, 1000));
```

<a name="class-based-features"></a>
### Características baseadas em classe

 O Pennant permite-lhe também definir recursos baseados em classes. Em contrapartida à definição de recursos baseados em fechamentos, não é necessário registar um recurso baseado numa classe num serviço provider. Para criar um recurso baseado numa classe pode utilizar o comando `pennant:feature` da ferramenta Artisan. Por defeito, a classe de recursos é armazenada no diretório `app/Features` do aplicativo:

```shell
php artisan pennant:feature NewApi
```

 Quando você escreve uma classe de recursos, você só precisa definir um método `resolve`, que será invocado para resolver o valor inicial da característica em um escopo determinado. Novamente, o escopo geralmente é o usuário atualmente autenticado:

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

 As classes de características são resolvidas através do

#### Personalizar o nome da característica armazenada

 Por padrão, o Pennant irá armazenar o nome de classe totalmente qualificado da categoria de recursos. Se pretender desligar o nome de recurso armazenado da estrutura interna do aplicativo, pode especificar uma propriedade `$name` na categoria de recursos. O valor desta propriedade será armazenado no lugar do nome da classe:

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
## Verificando recursos

 Para determinar se um recurso está ativo, você pode usar o método `active` na façanha `Feature`. Por padrão, os recursos são verificados em relação ao usuário autenticado atualmente:

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

 Embora as características sejam verificadas em relação ao usuário atualmente autenticado por padrão, você pode facilmente verificar a característica em relação a outro usuário ou [escopo](#scope). Para fazer isso, use o método `for` oferecido pelo frontal `Feature`:

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

 O utilitário "Pennant" oferece também alguns métodos alternativos de conforto que podem ser úteis na determinação se um recurso está ou não ativo:

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

 > [!ADIÇÃO]
 [Especificar explicitamente o escopo da função] (#defining-the-function-s-scope). Alternativamente, você pode definir um âmbito para a função.

<a name="checking-class-based-features"></a>
#### Verificando recursos baseados em classe

 Para recursos baseados em classes, você deve fornecer o nome da classe ao verificar o recurso.

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
### Execução condicional

 O método `when` pode ser usado para executar fluentemente um fechamento dado se o recurso estiver ativo. Além disso, é possível fornecer um segundo fechamento que será executado caso o recurso esteja inativo:

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

 O método `unless` serve como o inverso do método `when`, executando a primeira regrinha se a funcionalidade estiver inativa:

```php
    return Feature::unless(NewApi::class,
        fn () => $this->resolveLegacyApiResponse($request),
        fn () => $this->resolveNewApiResponse($request),
    );
```

<a name="the-has-features-trait"></a>
### O traço `TemRecursos`

 O traço `HasFeatures` de Pennant pode ser adicionado ao modelo `User` da aplicação (ou qualquer outro modelo que tenha recursos) para fornecer uma forma eficiente e conveniente de verificar recursos diretamente do modelo:

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

 Depois de adicionar o traço ao seu modelo, você poderá verificar facilmente as características usando o método `features`:

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

 É claro que o método features fornece acesso a vários outros métodos convenientes para interação com os recursos:

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
### Diretiva relativa às lâminas

 Para tornar o verificação de recursos no Blade numa experiência sem interrupções, o Pennant oferece uma diretiva `@feature`:

```blade
@feature('site-redesign')
    <!-- 'site-redesign' is active -->
@else
    <!-- 'site-redesign' is inactive -->
@endfeature
```

<a name="middleware"></a>
### Middleware

 O Pennant inclui também um [middleware](/docs/middleware) que pode ser utilizado para verificar se o utilizador actualmente autenticado tem acesso a uma funcionalidade antes de se ligar à rota. Pode atribuir o middleware a uma rota e especifique as funcionalidades necessárias para ter acesso à mesma. Se alguma das funcionalidades especificadas estiver inativa para o utilizador actualmente autenticado, a rota retornará um `400 Bad Request` em resposta HTTP. Pode passar várias funcionalidades ao método estático `using`.

```php
use Illuminate\Support\Facades\Route;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

Route::get('/api/servers', function () {
    // ...
})->middleware(EnsureFeaturesAreActive::using('new-api', 'servers-api'));
```

<a name="customizing-the-response"></a>
#### Personalizar a resposta

 Se desejar personalizar a resposta que é retornada pelo middleware quando um recurso listado estiver inativo, poderá usar o método `whenInactive`, fornecido pelo middleware `EnsureFeaturesAreActive`. Normalmente, este método deve ser invocado na sequência da chamada à função `boot` de um dos provedores de serviços da aplicação:

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
### Cachecliente em memória

 Ao verificar um recurso, o Pennant cria um cache de memória do resultado. Se estiver a usar o driver `database`, isto significa que a verificação repetida do mesmo indicador de recursos num pedido único não desencadeia consultas de base de dados adicionais. Isto garante também que o recurso apresenta um resultado consistente durante toda a duração do pedido.

 Se você precisar limpar manualmente o cache em memória, poderá usar o método `flushCache`, oferecido pela faca `Feature`:

```php
    Feature::flushCache();
```

<a name="scope"></a>
## Alcance

<a name="specifying-the-scope"></a>
### Especificando o âmbito

 Como discutido, as características são normalmente verificadas no que diz respeito ao utilizador atualmente autenticado. No entanto, este método pode não ser sempre o mais adequado às suas necessidades. É possível especificar o âmbito de validação das características utilizando a função `for` da faceta `Feature`:

```php
return Feature::for($user)->active('new-api')
        ? $this->resolveNewApiResponse($request)
        : $this->resolveLegacyApiResponse($request);
```

 O escopo das funcionalidades não é limitado aos "usuários". Suponhamos que você tenha criado uma nova experiência de faturamento, e queira implementá-la para equipes inteiras em vez de usuários individuais. Talvez você prefira um período de implementação mais lento com as equipes mais antigas do que com as novas. A resolução da funcionalidade pode ser feita da seguinte maneira:

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

 Você perceberá que a conclusão que definimos não espera um "Usuário", mas sim o modelo de "Time". Para determinar se esse recurso está ativo para uma equipe do usuário, você deve passar a equipe ao método `for` oferecido pela faca "Feature":

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect()->to('/billing/v2');
}

// ...
```

<a name="default-scope"></a>
### Escopo por Padrão

 É também possível personalizar o escopo padrão que Pennant utiliza para verificar as funcionalidades. Por exemplo, pode ser que todas as suas funcionalidades sejam verificadas contra a equipa do utilizador atualmente autenticado em vez de do próprio utilizador. Em vez de ter de chamar `Feature::for($user->team)` sempre que se verifica uma funcionalidade, pode especificar a equipa como o escopo padrão. Geralmente, isto deve ser feito num dos serviços da aplicação:

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

 Se não for especificamente indicado um escopo através do método `for`, a verificação de recursos utilizará agora a equipa do utilizador actualmente autenticado como o escopo padrão:

```php
Feature::active('billing-v2');

// Is now equivalent to...

Feature::for($user->team)->active('billing-v2');
```

<a name="nullable-scope"></a>
### Escopo Nulo

 Se o escopo for `null` ao verificar um recurso e a definição do recurso não suporte `null` através de um tipo nulo ou incluindo `null` num tipo de união, o Pennant retornará automaticamente `false` como o valor do resultado do recurso.

 Se o escopo for passado à uma função e ser potencialmente `null` (nulo), você deve considerar que a resolução do valor da função será acionada. Isso pode acontecer se você checar uma função dentro de um comando Artisan, um trabalho agendado ou uma rota não autenticada. Dado que normalmente não existe nenhum usuário autenticado nestes contextos, o escopo por padrão será `null`.

 Se você não sempre [especificar explicitamente seu escopo de recursos](#especificando-o-escopo), certifique-se de que o tipo do escopo seja "nuloável" e faça o manuseio do valor de escopo `null` dentro da lógica de definição de recursos:

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
### Identificação do âmbito

 Os drivers de armazenamento `array` e `database` incorporados no Pennant sabem como armazenar corretamente identificadores de escopo para todos os tipos de dados do PHP, bem como modelos Eloquent. No entanto, se o seu aplicativo utilizar um driver externo ao Pennant, esse driver pode não saber como armazenar adequadamente um identificador de um modelo Eloquent ou outros tipos personalizados em sua aplicação.

 Dessa forma, o Pennant permite que você forme os valores de escopo para armazenamento ao implementar o contrato `FeatureScopeable` nos objetos em sua aplicação utilizados como escopos do Pennant.

 Por exemplo, imagine que você esteja usando dois drivers de recursos diferentes em uma única aplicação: o driver interno "database" e um terceirizado "Flag Rocket". O driver "Flag Rocket" não sabe como armazenar corretamente um modelo Eloquent. Em vez disso, ele requer uma instância `FlagRocketUser`. Ao implementar o `toFeatureIdentifier` definido pelo contrato `FeatureScopeable`, podemos personalizar o valor do escopo que pode ser armazenado fornecido a cada driver usado pela nossa aplicação:

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
### Escopo de serialização

 Por padrão, a ferramenta Pennant usará o nome completo da classe ao armazenar uma característica associada a um modelo Eloquent. Se você já estiver usando um [mapa de morfologia Eloquent](https://laravel.com/docs/master/eloquent-relationships#custom-polymorphic-types), poderá optar por fazer com que o Pennant também use esse mapa para desvincular a característica armazenada da estrutura de sua aplicação.

 Para conseguir isso, depois de definir seu mapa de forma Eloquent em um serviço providenciador, você pode invocar o método `useMorphMap` da facade `Feature`:

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
## Valores de recursos ricos

 Até agora, mostramos como recursos estavam em um estado binário, ou seja, ativos ou inativos, mas o Pennant também permite armazenar valores ricos.

 Imagine que você está testando três novas cores para o botão "Comprar agora" de seu aplicativo. Em vez de retornar `true` ou `false` da definição de função, você pode retornar uma string:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

 Você pode recuperar o valor da funcionalidade `purchase-button` usando o método `value`:

```php
$color = Feature::value('purchase-button');
```

 A diretiva Blade incluída na diretiva de Pennant também facilita a exibição condicional do conteúdo com base no valor atual da característica.

```blade
@feature('purchase-button', 'blue-sapphire')
    <!-- 'blue-sapphire' is active -->
@elsefeature('purchase-button', 'seafoam-green')
    <!-- 'seafoam-green' is active -->
@elsefeature('purchase-button', 'tart-orange')
    <!-- 'tart-orange' is active -->
@endfeature
```

 > [!AVISO] Ao usar valores alternativos, é importante saber que um recurso é considerado "ativo" quando tiver qualquer valor diferente de `falso`.

 Quando é feita a chamada do método [`when` condicional](#execucao-condicional), o valor abrangente da funcionalidade será fornecido para o primeiro encerramento:

```php
    Feature::when('purchase-button',
        fn ($color) => /* ... */,
        fn () => /* ... */,
    );
```

 Do mesmo modo, quando se chama o método `unless`, será fornecido um valor rico da característica ao segundo fechamento opcional:

```php
    Feature::unless('purchase-button',
        fn () => /* ... */,
        fn ($color) => /* ... */,
    );
```

<a name="retrieving-multiple-features"></a>
## Recuperação de múltiplas características

 O método `values` permite o acesso a vários elementos de uma determinada esfera:

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
// ]
```

 Ou você pode usar o método `all` para recuperar os valores de todas as características definidas para um determinado escopo:

```php
Feature::all();

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

 No entanto, as características com base em classes são registradas dinamicamente e não são conhecidas pelo Pennant até serem verificadas explicitamente. Isso significa que os recursos da aplicação com base em classes podem não aparecer nos resultados devolvidos pelo método `all`, se ainda não tiverem sido verificados durante a solicitação atual.

 Se pretender garantir que as classes de recursos geográficos sejam sempre incluídas na utilização do método `all`, pode utilizar as capacidades de deteção de recursos da Pennant. Para começar, invocar o método `discover` num dos provedores de serviços da aplicação:

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

 O método `discover` irá registar todas as classes de características na pasta `app/Features` do seu aplicativo. Agora, o método `all` incluirá essas classes nos resultados, independentemente de terem sido verificadas durante o pedido atual:

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
## Carga ansiosa

 Apesar de o Pennant manter um cache de memória de todos os recursos resolvidos para uma única solicitação, ainda é possível encontrar problemas de desempenho. Para minimizar esses problemas, o Pennant oferece a capacidade de carregar valores de recursos em ordem, ou seja, não somente quando são necessários.

 Para ilustrar isto, imagine que estamos verificando se um recurso está ativo numa loop:

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

 Supondo que estejamos usando o driver de banco de dados, esse código executará uma consulta de banco de dados para cada usuário na loop - efetuando potencialmente centenas de consultas. No entanto, usando o método `load` do Pennant, podemos remover esse possível gargalo de desempenho, carregando os valores da característica com antecedência para uma coleção de usuários ou escopos:

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

 Para carregar os valores das funcionalidades apenas quando estas ainda não tenham sido carregadas, poderá utilizar o método `loadMissing`:

```php
Feature::for($users)->loadMissing([
    'new-api',
    'purchase-button',
    'notifications-beta',
]);
```

<a name="updating-values"></a>
## Atualização de Valores

 Quando o valor de um recurso é resolvido pela primeira vez, o motor subjacente armazena o resultado na memória. Isso é necessário para garantir uma experiência consistente aos usuários em vários pedidos. No entanto, pode ser necessário atualizar manualmente o valor armazenado do recurso.

 Para conseguir isso, você pode usar os métodos `activate` e `deactivate` para ativar ou desativar uma funcionalidade:

```php
use Laravel\Pennant\Feature;

// Activate the feature for the default scope...
Feature::activate('new-api');

// Deactivate the feature for the given scope...
Feature::for($user->team)->deactivate('billing-v2');
```

 Também é possível definir manualmente um valor rico para uma característica atribuindo um segundo argumento ao método `ativar`:

```php
Feature::activate('purchase-button', 'seafoam-green');
```

 Para dar instruções ao Pennant para esquecer o valor armazenado de uma característica, você pode usar o método `forget`. Quando a característica for verificada novamente, o Pennant resolverá seu valor pela definição da característica:

```php
Feature::forget('purchase-button');
```

<a name="bulk-updates"></a>
### Atualizações em lote

 Para atualizar os valores armazenados de uma funcionalidade em massa, você pode usar os métodos `ativarParaTodos` e `desativarParaTodos`.

 Por exemplo, suponhamos que agora se confie na estabilidade da funcionalidade `new-api` e tenha sido definido o melhor valor para a cor do botão de compra no fluxo de checkout. É possível atualizar o valor armazenado para todos os utilizadores:

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');

Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

 Como alternativa, você pode desativar o recurso para todos os usuários:

```php
Feature::deactivateForEveryone('new-api');
```

 > [!ATENÇÃO] Isso só atualizará os valores de elementos resolvidos que tenham sido armazenados pelo driver de armazenamento do Pennant. Você também precisará atualizar a definição do elemento em seu aplicativo.

<a name="purging-features"></a>
### Recurso de Purificação

 Às vezes, pode ser útil remover um recurso do armazenamento. Isso é normalmente necessário se você tiver removido o recurso da aplicação ou feito ajustes na definição dele que deseja implementar para todos os usuários.

 Você pode remover todos os valores armazenados de uma característica utilizando o método `purge`:

```php
// Purging a single feature...
Feature::purge('new-api');

// Purging multiple features...
Feature::purge(['new-api', 'purchase-button']);
```

 Se você quiser limpar todas as características do armazenamento, poderá invocar o método `purge` sem nenhum argumento:

```php
Feature::purge();
```

 Como pode ser útil remover recursos como parte do pipeline de implantação da sua aplicação, o Pennant inclui um comando Artianha chamado `pennant:purge` que remove os recursos fornecidos de armazenamento:

```sh
php artisan pennant:purge new-api

php artisan pennant:purge new-api purchase-button
```

 Também é possível limpar todos os recursos _exceto_ aqueles em uma determinada lista de recursos. Por exemplo, imagine que você queria limpar todos os recursos, exceto para os valores dos recursos "new-api" e "purchase-button", que deseja manter no armazenamento. Para fazer isso, você pode passar esses nomes de recurso à opção `--except`:

```sh
php artisan pennant:purge --except=new-api --except=purchase-button
```

 Para maior comodidade, o comando `pennant:purge` também suporta uma opção `--except-registered`. Essa opção indica que todas as funcionalidades exceto aquelas registradas de forma explícita em um provedor de serviços devem ser eliminadas:

```sh
php artisan pennant:purge --except-registered
```

<a name="testing"></a>
## Teste

 Quando você testa códigos que interagem com marcas de recurso, a maneira mais fácil de controlar o valor retornado da marca de recursos em seus testes é simplesmente redefinir as marcas de recursos. Imagine que você tenha definido a seguinte marca de recursos em um dos serviços do aplicativo:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

 Para modificar o valor de retorno do recurso em seus testes, você pode redefinir o recurso no início do teste. O seguinte teste sempre passará, embora a implementação da função `Arr::random()` ainda esteja presente no provedor de serviços:

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

 A mesma abordagem pode ser usada para funcionalidades baseadas em classes:

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

 Se o seu recurso estiver retornando uma instância de `Lottery`, há um punhado de úteis [auxiliares de teste disponíveis](/docs/helpers#testing-lotteries)

<a name="store-configuration"></a>
#### Configuração de armazenamento

 Você pode configurar a loja que o Pennant irá usar durante os testes, definindo a variável de ambiente `PENNANT_STORE` no arquivo do seu aplicativo `phpunit.xml`:

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
## Adicionando controladores de haste personalizados

<a name="implementing-the-driver"></a>
#### Implementação do driver

 Se nenhum dos atuais controladores de armazenamento do Pennant se ajustar às necessidades da sua aplicação, você poderá escrever seu próprio controlador. O seu driver personalizado deve implementar a interface `Laravel\Pennant\Contracts\Driver`:

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

 Agora, precisamos implementar cada um destes métodos usando uma conexão Redis. Para ver como implementar cada um destes métodos, dê uma olhada no `Laravel\Pennant\Drivers\DatabaseDriver` [no código-fonte do Pennant](https://github.com/laravel/pennant/blob/1.x/src/Drivers/DatabaseDriver.php)

 > [!NOTA]
 > O Laravel não vem com uma pasta para conter suas extensões. Você é livre para colocá-las onde quiser. Nesse exemplo, criamos uma pasta "Extensões" para hospedar o `RedisFeatureDriver`.

<a name="registering-the-driver"></a>
#### Registando o condutor

 Depois que o driver foi implementado, você está pronto para registrá-lo com o Laravel. Para adicionar drivers adicionais ao Pennant, é possível usar o método `extend` fornecido pela facade `Feature`. É necessário chamar o método `extend` a partir da metodologia `boot` de um dos [prestadores de serviço] (/docs/providers) do seu aplicativo:

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

 Depois de registrar o driver, você poderá usar o driver `redis` no arquivo de configuração do seu aplicativo em `config/pennant.php`:

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

 O Pennant envia uma variedade de eventos que podem ser úteis ao rastrear bandeiras de recursos em toda a sua aplicação.

### "Laravel\\Pennant\\Events\\FeatureRetrieved"

 Esse evento é disparado sempre que um recurso [for verificado] (#verificando-recursos). Tal evento pode ser útil para criar e controlar métricas relacionadas ao uso do sinalizador de recursos em toda a aplicação.

### `Laravel\Pendente\Eventos\FuncionalidadeResolvera`

 Este evento é enviado pela primeira vez quando o valor de um recurso é resolvido para um escopo específico.

### `Laravel\Pennant\Events\UnknownFeatureResolved`

 Este evento é enviado quando uma característica desconhecida tiver sido resolvida para um escopo específico. Acompanhar este evento pode ser útil se pretender apagar uma marca de função, mas acidentalmente deixar referências espalhadas pela aplicação:

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

### `Laravel\Pennant\Events\DynamicallyRegisteringFeatureClass`

 Este evento é enviado quando uma característica baseada em classes [#class-based-features](class-based-features) é verificada dinamicamente pela primeira vez durante um pedido.

### "Ocorreu um erro inesperado de escopo nulo no Laravel\\Pennant\\Events\\UnexpectedNullScopeEncountered."

 Este evento é disparado quando um escopo `null` é passado para uma definição de funcionalidade que não suporta escopos `nulls <nil-scoped>` (#escopos_nulos).

 Essa situação é tratada de maneira elegante e o recurso retorna `false`. No entanto, se você quiser desativar esse comportamento padrão do recurso, poderá registrar um listeners para esse evento no método `boot` do `AppServiceProvider` de sua aplicação:

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

### `Laravel\Pennant\Events\FeatureUpdated`

 Esse evento é disparado ao atualizar um recurso para um escopo, normalmente chamando `activate` ou `deactivate`.

### `Laravel\Pennant\Events\FeatureUpdatedForAllScopes`

 Este evento é disparado ao atualizar um recurso para todos os escopos, normalmente chamando o método `ativarParaTodos` ou `desativarParaTodos`.

### `Laravel\Pennant\Eventos\CaracterísticaEliminada`

 Este evento é enviado quando se apaga um recurso de escopo, normalmente chamando o método `forget`.

### `Laravel\Pennant\Events\FeaturesPurged`

 Este evento é disparado quando são apagados recursos específicos.

### `Laravel\Pennant\Events\AllFeaturesPurged`

 Este evento é enviado quando são apagadas todas as funcionalidades.
