# Prestadores de serviços

<a name="introduction"></a>
## Introdução

 Os provedores de serviços são o local central de todo o inicialização do aplicativo Laravel. Sua própria aplicação, assim como todos os serviços principais do Laravel, são inicializados por meio dos provedores de serviços.

 Mas, o que queremos dizer com "bootstrap" de maneira geral? Queremos dizer **registrar** as coisas, incluindo o registo de ligações entre módulos de servidor, eventos, middleware e até rotas. Os provedores de serviços são o ponto central para configurar a sua aplicação.

 O Laravel usa dezenas de provedores internamente para inicializar seus serviços principais, como o remetente de e-mails, fila, cache, entre outros. Muitos desses provedores são "defereid", ou seja, não serão carregados em todas as solicitações, mas somente quando os serviços oferecidos forem realmente necessários.

 Todos os provedores de serviços definidos pelo usuário estão registrados no arquivo `bootstrap/providers.php`. Na documentação a seguir, você aprenderá como escrever seus próprios provedores de serviços e registrá-los com seu aplicativo Laravel.

 > [!ATENÇÃO]
 [ Ciclo de vida da encomenda](/docs/lifecycle)

<a name="writing-service-providers"></a>
## Fornecedores de serviços de escrita

 Todos os provedores de serviços estendem a classe `Illuminate\Support\ServiceProvider`. A maioria dos provedores contêm um método `register` e outro `boot`. No método `register`, você deve **apenas vincular coisas ao [conjunto de serviços] (/docs/container).** Você nunca deve tentar registrar quaisquer eventos, rotas ou qualquer outra função dentro do método `register`.

 O Artisan CLI pode gerar um novo provedor através do comando `make:provider`. O Laravel irá automaticamente registrar o seu novo provedor no arquivo `bootstrap/providers.php` da sua aplicação:

```shell
php artisan make:provider RiakServiceProvider
```

<a name="the-register-method"></a>
### O método de registo

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
         * Register any application services.
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

<a name="the-bindings-and-singletons-properties"></a>
#### As propriedades `bindings` e `singletons`

 Se o seu provedor de serviços estiver a registrar muitas ligações simples, poderá usar as propriedades `bindings` e `singletons`, em vez de ter de registar manualmente cada ligação do contêiner. O seu provedor de serviços é carregado pelo framework e verifica automaticamente essas propriedades e regista as suas ligações:

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
         * All of the container bindings that should be registered.
         *
         * @var array
         */
        public $bindings = [
            ServerProvider::class => DigitalOceanServerProvider::class,
        ];

        /**
         * All of the container singletons that should be registered.
         *
         * @var array
         */
        public $singletons = [
            DowntimeNotifier::class => PingdomDowntimeNotifier::class,
            ServerProvider::class => ServerToolsProvider::class,
        ];
    }
```

<a name="the-boot-method"></a>
### O método do arranque

 E se precisarmos de registar um [compositor de views](/docs/views#view-composers) no nosso fornecedor de serviços? Isso deve ser feito dentro do método `boot`. Este método é chamado após os outros fornecedores de serviços terem sido registrados, o que significa que você tem acesso a todos os outros serviços que foram registrados pelo framework:

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

<a name="boot-method-dependency-injection"></a>
#### Injeção de dependência do método de inicialização da boot camp

 Você pode indicar as dependências da sua metodologia de inicialização para o provedor do serviço. O contêiner do [serviço](/docs/container) irá injetar automaticamente quaisquer dependências que você necessite:

```php
    use Illuminate\Contracts\Routing\ResponseFactory;

    /**
     * Bootstrap any application services.
     */
    public function boot(ResponseFactory $response): void
    {
        $response->macro('serialized', function (mixed $value) {
            // ...
        });
    }
```

<a name="registering-providers"></a>
## Registo de Prestadores

 Todos os provedores de serviços estão registrados no arquivo de configuração `bootstrap/providers.php`. Este arquivo retorna um array que contém as classes dos provedores de serviços da sua aplicação:

```php
    <?php

    return [
        App\Providers\AppServiceProvider::class,
    ];
```

 Quando você chama o comando do Artisan `make:provider`, o Laravel adicionará automaticamente o provedor gerado ao arquivo `bootstrap/providers.php`. No entanto, se você tiver criado manualmente a classe de provedor, deve adicioná-la manualmente ao array:

```php
    <?php

    return [
        App\Providers\AppServiceProvider::class,
        App\Providers\ComposerServiceProvider::class, // [tl! add]
    ];
```

<a name="deferred-providers"></a>
## Fornecedores diferidos

 Se o seu fornecedor está registrando **apenas** os vínculos no [conjunto de serviços](/docs/container), pode optar por adiar o registo do mesmo até que um dos vínculos registrados seja realmente necessário. A postergação da carga desse fornecedor irá melhorar a performance da sua aplicação, uma vez que não é carregado no sistema de arquivos em cada pedido.

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
         * Register any application services.
         */
        public function register(): void
        {
            $this->app->singleton(Connection::class, function (Application $app) {
                return new Connection($app['config']['riak']);
            });
        }

        /**
         * Get the services provided by the provider.
         *
         * @return array<int, string>
         */
        public function provides(): array
        {
            return [Connection::class];
        }
    }
```
