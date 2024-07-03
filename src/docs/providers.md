# Provedores de serviços

## Introdução

Os provedores de serviços são o local central de todo a inicialização do aplicativo Laravel. Sua própria aplicação, assim como todos os serviços principais do Laravel, são inicializados por meio dos provedores de serviços.

Mas, o que queremos dizer com "bootstrap" de maneira geral? Queremos dizer **registrar** as coisas, incluindo o registro de ligações entre módulos de servidor, eventos, middleware e até rotas. Os provedores de serviços são o ponto central para configurar a sua aplicação.

O Laravel usa dezenas de provedores internamente para inicializar seus serviços principais, como o remetente de e-mails, fila, cache, entre outros. Muitos desses provedores são "deferred", ou seja, não serão carregados em todas as solicitações, mas somente quando os serviços oferecidos forem realmente necessários.

Todos os provedores de serviços definidos pelo usuário estão registrados no arquivo `bootstrap/providers.php`. Na documentação a seguir, você aprenderá como escrever seus próprios provedores de serviços e registrá-los com seu aplicativo Laravel.

::: info NOTA
Se você quiser saber mais sobre como o Laravel lida com solicitações e funciona internamente, confira nossa documentação sobre o [ciclo de vida da solicitação](/docs/lifecycle) do Laravel.
:::

## Escrevendo Um Provedor de Serviço

Todos os provedores de serviços estendem a classe `Illuminate\Support\ServiceProvider`. A maioria dos provedores contêm um método `register` e outro `boot`. No método `register`, você deve **apenas vincular coisas ao [conjunto de serviços](/docs/container).** Você nunca deve tentar registrar quaisquer eventos, rotas ou qualquer outra função dentro do método `register`.

O Artisan CLI pode gerar um novo provedor através do comando `make:provider`. O Laravel irá automaticamente registrar o seu novo provedor no arquivo `bootstrap/providers.php` da sua aplicação:

```shell
php artisan make:provider RiakServiceProvider
```

### O método de registro

Conforme mencionado anteriormente, no método `register`, você deve apenas vincular coisas ao [conjunto de serviços do container](/docs/container). Nunca tente registrar nenhum ouvinte de evento, rota ou qualquer outro tipo de funcionalidade no método `register`. Caso contrário, você poderá usar um serviço que é fornecido por um provedor de serviços que ainda não foi carregado.

Vamos dar uma olhada em um provedor de serviços básico. Em qualquer um dos seus métodos do provedor de serviço, você tem sempre acesso à propriedade `$app` que oferece acesso ao container de serviços:

```php
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider
{
    /**
     * Registre quaisquer serviços no aplicativo.
     */
    public function register(): void
    {
        $this->app->singleton(Connection::class, function (Application $app) {
            return new Connection(config('riak'));
        });
    }
}
```

Esse provedor de serviços define somente um método `register`, que em seguida utiliza para definir uma implementação de `App\Services\Riak\Connection` no contêiner do serviço. Se você ainda não estiver familiarizado com o contêiner de serviços do Laravel, confira a [documentação](/docs/container).

#### As propriedades `bindings` e `singletons`

Se o seu provedor de serviços estiver registrando muitas ligações simples, poderá usar as propriedades `bindings` e `singletons`, em vez de ter de registar manualmente cada ligação do contêiner. O seu provedor de serviços é carregado pelo framework e verifica automaticamente essas propriedades e registra as suas ligações:

```php
<?php

namespace App\Providers;

use App\Contracts\DowntimeNotifier;
use App\Contracts\ServerProvider;
use App\Services\DigitalOceanServerProvider;
use App\Services\PingdomDowntimeNotifier;
use App\Services\ServerToolsProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Todas as ligações de contêiner que devem ser registradas.
     *
     * @var array
     */
    public $bindings = [
        ServerProvider::class => DigitalOceanServerProvider::class,
    ];

    /**
     * Todos os singletons de contêiner que devem ser registrados.
     *
     * @var array
     */
    public $singletons = [
        DowntimeNotifier::class => PingdomDowntimeNotifier::class,
        ServerProvider::class => ServerToolsProvider::class,
    ];
}
```

### O método do arranque

E se precisarmos registrar um [compositor de visualizações](/docs/views#view-composers) no nosso fornecedor de serviços? Isso deve ser feito dentro do método `boot`. Este método é chamado após os outros fornecedores de serviços terem sido registrados, o que significa que você tem acesso a todos os outros serviços que foram registrados pelo framework:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        View::composer('view', function () {
            // ...
        });
    }
}
```

#### Injeção de dependência no método de inicialização

Você pode indicar as dependências da sua metodologia de inicialização para o provedor do serviço. O contêiner do [serviço](/docs/container) irá injetar automaticamente quaisquer dependências que você necessite:

```php
    use Illuminate\Contracts\Routing\ResponseFactory;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(ResponseFactory $response): void
    {
        $response->macro('serialized', function (mixed $value) {
            // ...
        });
    }
```

## Registro de Provedores

Todos os provedores de serviços estão registrados no arquivo de configuração `bootstrap/providers.php`. Este arquivo retorna um array que contém as classes dos provedores de serviços da sua aplicação:

```php
    <?php

    return [
        App\Providers\AppServiceProvider::class,
    ];
```

Quando você chama o comando do Artisan `make:provider`, o Laravel adicionará automaticamente o provedor gerado ao arquivo `bootstrap/providers.php`. No entanto, se você criou manualmente a classe de provedor, deve adicioná-la manualmente ao array:

```php
    <?php

    return [
        App\Providers\AppServiceProvider::class,
        App\Providers\ComposerServiceProvider::class, // [tl! add]
    ];
```

## Provedores diferidos

Se o seu provedor está registrando **apenas** os vínculos no [conjunto de serviços](/docs/container), você pode optar por adiar o registo do mesmo até que um dos vínculos registrados seja realmente necessário. A postergação da carga desse fornecedor irá melhorar a performance da sua aplicação, uma vez que não é carregado no sistema de arquivos em cada requisição.

O Laravel compila e armazena uma lista de todos os serviços fornecidos pelos provedores de serviço diferidos, juntamente com o nome da sua classe provedora de serviço. Portanto, só quando você tentar resolver um desses serviços, é que o Laravel carregará o provedor de serviço.

Para adiar a inicialização de um provedor, implemente a interface `\Illuminate\Contracts\Support\DeferrableProvider` e defina o método `provides`. O método `provides` deve retornar os vínculos do contêiner de serviços registrados pelo provedor:

```php
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Support\DeferrableProvider;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider implements DeferrableProvider
{
    /**
     * Registre quaisquer serviços de aplicativo.
     */
    public function register(): void
    {
        $this->app->singleton(Connection::class, function (Application $app) {
            return new Connection($app['config']['riak']);
        });
    }

    /**
     * Obtenha os serviços prestados pelo provedor.
     *
     * @return array<int, string>
     */
    public function provides(): array
    {
        return [Connection::class];
    }
}
```
