# Provedores de Serviço

## Introdução

Os provedores de serviço são o local central de todo o bootstrap de todos os aplicativos Laravel. Seu próprio aplicativo, bem como todos os principais serviços do 
Laravel, são inicializados através de provedores de serviços.

Mas, o que queremos dizer com "bootstrapped"? Em geral, queremos dizer registrar coisas, incluindo registrar ligações de contêineres de serviço, ouvintes de eventos, 
middleware e até mesmo rotas. Os provedores de serviços são o local central para configurar seu aplicativo.

Se você abrir o arquivo `config/app.php` incluído com o Laravel, verá um array `providers`. Essas são todas as classes de provedor de serviço que serão carregadas 
para seu aplicativo. Por padrão, um conjunto de provedores de serviços principais do Laravel estão listados neste array. Esses provedores inicializam os componentes 
principais do Laravel, como o mailer, fila, cache e outros. Muitos desses provedores são provedores "adiados", o que significa que não serão carregados em todas as 
solicitações, mas apenas quando os serviços que fornecem forem realmente necessários.

Nesta visão geral, você aprenderá como escrever seus próprios provedores de serviço e registrá-los com seu aplicativo Laravel.

> Se você gostaria de aprender mais sobre como o Laravel lida com as solicitações e funciona internamente, verifique nossa documentação sobre o ciclo de vida das 
> solicitações do Laravel .

## Provedores de Serviços de Escrita
Todos os provedores de serviço estendem a classe `Illuminate\Support\ServiceProvider`. A maioria dos provedores de serviço contém um método `register` e um `boot`. 
Dentro do método `register`, você só deve vincular coisas ao contêiner de serviço. Você nunca deve tentar registrar quaisquer ouvintes de eventos, rotas ou qualquer 
outra parte da funcionalidade dentro de `register`.

O Artisan CLI pode gerar um novo provedor por meio do comando `make:provider`:

```bash
php artisan make:provider RiakServiceProvider
```

### O Método de Registro
Conforme mencionado anteriormente, dentro do método `register`, você só deve vincular coisas ao contêiner de serviço. Você nunca deve tentar registrar quaisquer 
ouvintes de eventos, rotas ou qualquer outra parte da funcionalidade dentro do método `register`. Caso contrário, você pode acidentalmente usar um serviço fornecido 
por um provedor de serviços que ainda não foi carregado.

Vamos dar uma olhada em um provedor de serviços básico. Em qualquer um dos métodos do seu provedor de serviços, você sempre tem acesso à propriedade `$app` que 
fornece acesso ao contêiner de serviço:

```php
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider
{
    /**
     * Registre quaisquer serviços de aplicativo.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(Connection::class, function ($app) {
            return new Connection(config('riak'));
        });
    }
}
```

Este provedor de serviço apenas define um método `register` e usa esse método para definir uma implementação `App\Services\Riak\Connection` no contêiner de serviço. 
Se você ainda não está familiarizado com o container de serviço do Laravel, verifique nossa documentação.

#### As Propriedades `bindings` e `singletons`
Se o seu provedor de serviços registrar muitas associações simples, você pode desejar usar as propriedades `bindings` e em `singletons` vez de registrar manualmente 
cada associação de contêiner. Quando o provedor de serviços é carregado pela estrutura, ele verifica automaticamente essas propriedades e registra suas ligações:

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
     * Todas as associações de contêiner que devem ser registradas.
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

### O Método de Boot
Então, e se precisarmos registrar um compositor de visualização em nosso provedor de serviços? Isso deve ser feito dentro do método `boot`. Este método é chamado 
depois que todos os outros provedores de serviço forem registrados, o que significa que você tem acesso a todos os outros serviços que foram registrados pela estrutura:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider
{
    /**
     * Inicialize qualquer serviço do aplicativo.
     *
     * @return void
     */
    public function boot()
    {
        View::composer('view', function () {
            //
        });
    }
}
```

### Injeção Durante o Boot
Você pode digitar dependências com typehint para o método `boot` de seu provedor de serviços. O contêiner de serviço injetará automaticamente todas as 
dependências de que você precisa:

```php
use Illuminate\Contracts\Routing\ResponseFactory;

/**
 * Inicialize qualquer serviço do aplicativo.
 *
 * @param  \Illuminate\Contracts\Routing\ResponseFactory  $response
 * @return void
 */
public function boot(ResponseFactory $response)
{
    $response->macro('serialized', function ($value) {
        //
    });
}
```

## Cadastrando Provedores
Todos os provedores de serviço são registrados no arquivo `config/app.php` de configuração. Este arquivo contém uma matriz chamada `providers` onde você pode listar 
os nomes das classes de seus provedores de serviço. Por padrão, um conjunto de provedores de serviços principais do Laravel estão listados neste array. Esses provedores
inicializam os componentes principais do Laravel, como o mailer, fila, cache e outros.

Para registrar seu provedor, adicione-o ao array:

```php
'providers' => [
    // Outros provedores de serviços

    App\Providers\ComposerServiceProvider::class,
],
```

### Provedores Deferidos
Se o seu provedor está apenas registrando ligações no container de serviço, você pode escolher adiar seu registro até que uma das ligações registradas seja 
realmente necessária. Adiar o carregamento de tal provedor melhorará o desempenho de seu aplicativo, uma vez que ele não é carregado do sistema de arquivos 
em todas as solicitações.

O Laravel compila e armazena uma lista de todos os serviços fornecidos por provedores de serviços deferidos, junto com o nome de sua classe de provedor de serviço. 
Então, somente quando você tenta resolver um desses serviços o Laravel carrega o provedor de serviço.

Para adiar o carregamento de um provedor, implemente a interface `\Illuminate\Contracts\Support\DeferrableProvider` e defina um método `provides`. O método `provides`
deve retornar as ligações do contêiner de serviço registradas pelo provedor:

```php
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Support\DeferrableProvider;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider implements DeferrableProvider
{
    /**
     * Registre quaisquer serviços de aplicativo.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(Connection::class, function ($app) {
            return new Connection($app['config']['riak']);
        });
    }

    /**
     * Obtenha os serviços prestados pelo provedor.
     *
     * @return array
     */
    public function provides()
    {
        return [Connection::class];
    }
}
```
