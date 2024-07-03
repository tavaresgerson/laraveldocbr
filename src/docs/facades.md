# Facades (Fachadas)

## Introdução

Ao percorrer a documentação do Laravel, irá encontrar exemplos de código que interagem com os recursos do Laravel através de "facades". Estas facades proporcionam uma interface estática para classes disponíveis no [conjunto de serviços](/docs/container) da aplicação. O Laravel inclui várias facades, o que permite aceder a quase todos os recursos do mesmo.

Os fachadas do Laravel servem como "proxies estáticos" para classes subjacentes no serviço contêiner, fornecendo a vantagem de uma sintaxe concisa e expressiva ao mesmo tempo em que mantêm maior testabilidade e flexibilidade do que métodos estáticos tradicionais. É perfeitamente normal se você não compreende totalmente como os facades funcionam - siga em frente e continue aprendendo sobre Laravel.

Todas as fachadas da Laravel estão definidas no namespace `Illuminate\Support\Facades`. Assim, podemos acessá-las facilmente do seguinte modo:

```php
    use Illuminate\Support\Facades\Cache;
    use Illuminate\Support\Facades\Route;

    Route::get('/cache', function () {
        return Cache::get('key');
    });
```

Ao longo da documentação do Laravel, muitos dos exemplos usarão facades para demonstrar os vários recursos do framework.

#### Funções de ajuda

Para complementar as fachadas, o Laravel oferece uma variedade de "funções auxiliares" globais que tornam mais fácil interagir com recursos comuns do Laravel. Algumas funções auxiliares comuns com as quais você pode interagir são: `view`, `response`, `url` e `config`. Cada função auxiliar oferecida pelo Laravel está documentada em conjunto com o recurso correspondente; no entanto, uma lista completa está disponível na [documentação de funções auxiliares](/docs/helpers).

Por exemplo, em vez de usar a facade `Illuminate\Support\Facades\Response` para gerar uma resposta JSON, podemos simplesmente usar a função `response`. Como as funções auxiliares estão disponíveis globalmente, não será necessário importar nenhuma classe para utilizá-las:

```php
    use Illuminate\Support\Facades\Response;

    Route::get('/users', function () {
        return Response::json([
            // ...
        ]);
    });

    Route::get('/users', function () {
        return response()->json([
            // ...
        ]);
    });
```

## Quando utilizar fachadas

As fachadas têm muitos benefícios. Elas fornecem uma sintaxe concisa e memorável que permite usar recursos do Laravel sem ter de lembrar nomes longos de classes que devem ser injetadas ou configuradas manualmente. Além disso, por causa de seu uso exclusivo dos métodos dinâmicos do PHP, elas são fáceis de testar.

No entanto, é preciso tomar alguns cuidados ao usar fachadas. O perigo principal é o "creep de escopo". Uma vez que as facades são fáceis de usar e não exigem injeção, pode ser fácil deixar suas classes continuarem a crescer usando muitas facades em uma única classe. O uso da dependência injetada mitiga esse potencial através do feedback visual que um grande construtor fornece quando sua classe está ficando muito grande. Portanto, ao usar facades, preste atenção especial à dimensão de sua classe para que seu escopo de responsabilidade permaneça limitado. Se sua classe está ficando muito grande, considere dividi-la em várias classes menores.

### Facades versus injeção de dependência

Um dos principais benefícios da injeção de dependência é a capacidade de substituir implementações da classe injetada, o que é útil durante testes, uma vez que podemos injetar um mock ou stub e afirmar se vários métodos foram chamados no stub.

Normalmente, não é possível simular ou substituir um método de uma classe verdadeiramente estática. No entanto, as facades usam métodos dinâmicos para fazer o proxie das chamadas dos métodos para objetos resolvidos do contêiner de serviços, podemos realmente testar facades da mesma maneira que testamos uma instância injetada. Por exemplo, considerando o seguinte caminho:

```php
    use Illuminate\Support\Facades\Cache;

    Route::get('/cache', function () {
        return Cache::get('key');
    });
```

Usando os métodos de teste de facades do Laravel, podemos escrever o seguinte teste para verificar se o método `Cache::get` foi chamado com o argumento esperado:

::: code-group
```php [Pest]
use Illuminate\Support\Facades\Cache;

test('basic example', function () {
    Cache::shouldReceive('get')
         ->with('key')
         ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
});
```

```php [PHPUnit]
use Illuminate\Support\Facades\Cache;

/**
 * Um exemplo básico de teste funcional.
 */
public function test_basic_example(): void
{
    Cache::shouldReceive('get')
         ->with('key')
         ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
}
```
:::

### Facades versus funções auxiliares

Além de facades, Laravel inclui várias funções "ajudantes", capazes de executar tarefas comuns como gerar visualizações, disparar eventos, despachar trabalhos ou enviar respostas HTTP. Muitas dessas funções auxiliares são equivalentes às facades. Por exemplo:

```php
    return Illuminate\Support\Facades\View::make('profile');

    return view('profile');
```

Não há diferença prática entre facades e funções de ajuda. Ao usar as funções de ajuda, você poderá testá-las exatamente da mesma forma que faria com a facades correspondente. Por exemplo, considere o seguinte caminho:

```php
    Route::get('/cache', function () {
        return cache('key');
    });
```

O auxiliar `cache` irá chamar o método `get` na classe subjacente da facade `Cache`. Embora estejamos usando a função _helper_ (auxiliar), podemos escrever o seguinte teste para verificar se o método foi chamado com o argumento esperado:

```php
use Illuminate\Support\Facades\Cache;

/**
 * Um exemplo básico de teste funcional.
 */
public function test_basic_example(): void
{
    Cache::shouldReceive('get')
          ->with('key')
          ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
}
```

## Como os facades funcionam

Numa aplicação Laravel, uma Facade é uma classe que permite o acesso a um objeto do contêiner. A maquinaria que faz isto funcionar está na classe `Facade`. Os facades do Laravel e quaisquer outros facades personalizados criados serão baseados na classe base `Illuminate\Support\Facades\Facade`.

A classe base `Facade` faz uso do método mágico `__callStatic()` para adiar chamadas de sua fachada para um objeto resolvido a partir do contêiner. No exemplo abaixo, é feita uma chamada ao sistema de cache do Laravel. Olhando para este código, pode-se assumir que o método estático `get` está sendo chamado na classe `Cache`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Mostre o perfil do usuário fornecido.
     */
    public function showProfile(string $id): View
    {
        $user = Cache::get('user:'.$id);

        return view('profile', ['user' => $user]);
    }
}
```

Observe que no início do arquivo estamos "importando" a facade `Cache`. Essa facade funciona como um proxy para o acesso à implementação subjacente da interface `Illuminate\Contracts\Cache\Factory`. Todas as chamadas feitas usando essa facade serão passados ao objeto subjacente do serviço de cache do Laravel.

Se observarmos essa classe `Illuminate\Support\Facades\Cache`, veremos que não há método estático `get`:

```php
    class Cache extends Facade
    {
        /**
         * Obtenha o nome registrado do componente.
         */
        protected static function getFacadeAccessor(): string
        {
            return 'cache';
        }
    }
```

Em vez disso, a fachada `Cache` estende a classe base `Facade` e define o método `getFacadeAccessor()`. A função deste método é retornar o nome de uma ligação de contêiner de serviço. Quando um usuário faz referência a qualquer método estático na fachada `Cache`, o Laravel resolve a ligação `cache` do [contêiner de serviço](/docs/container) e executa o método solicitado (neste caso, `get`) nesse objeto.

## Facades em tempo real

Usando fachadas em tempo real, você poderá tratar qualquer classe em sua aplicação como se fosse uma fachada. Para ilustrar o uso delas, vamos primeiro analisar um pouco de código que não utiliza fachadas em tempo real. Por exemplo, suponha que nosso modelo `Podcast` tem um método `publish`. No entanto, para publicar o podcast, precisaremos injetar uma instância do tipo `Publisher`:

```php
<?php

namespace App\Models;

use App\Contracts\Publisher;
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publique o podcast.
     */
    public function publish(Publisher $publisher): void
    {
        $this->update(['publishing' => now()]);

        $publisher->publish($this);
    }
}
```

Injetar uma implementação de editor no método nos permite testar facilmente o método isoladamente, já que podemos simular o editor injetado. No entanto, exige que sempre passemos uma instância do editor cada vez que chamamos o método `publish`. Usando fachadas em tempo real, podemos manter a mesma testabilidade sem sermos obrigados a passar explicitamente uma instância do `Publisher`. Para gerar uma fachada em tempo real, prefixe o namespace da classe importada com `Facades`:

```php
<?php

namespace App\Models;

use App\Contracts\Publisher; // [tl! remove]
use Facades\App\Contracts\Publisher; // [tl! add]
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publique o podcast.
     */
    public function publish(Publisher $publisher): void // [tl! remove]
    public function publish(): void // [tl! add]
    {
        $this->update(['publishing' => now()]);

        $publisher->publish($this); // [tl! remove]
        Publisher::publish($this); // [tl! add]
    }
}
```

Quando a facade em tempo real é utilizada, a implementação do publisher será resolvida fora do container de serviços usando a parte do nome da interface ou classe que aparece após o prefixo "Facades". Durante as provas, podemos usar os auxiliares de teste de fachadas integrados no Laravel para simular este chamado de método:

::: code-group
```php [Pest]
<?php

use App\Models\Podcast;
use Facades\App\Contracts\Publisher;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('podcast can be published', function () {
    $podcast = Podcast::factory()->create();

    Publisher::shouldReceive('publish')->once()->with($podcast);

    $podcast->publish();
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use App\Models\Podcast;
use Facades\App\Contracts\Publisher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PodcastTest extends TestCase
{
    use RefreshDatabase;

    public function test_podcast_can_be_published(): void
    {
        $podcast = Podcast::factory()->create();

        Publisher::shouldReceive('publish')->once()->with($podcast);

        $podcast->publish();
    }
}
```
:::

## Referência da facade

Abaixo você encontrará cada facade e sua classe subjacente. Esta é uma ferramenta útil para explorar rapidamente a documentação da API de uma determinado raiz de uma facade. A chave [service container](/docs/container) de ligação também está incluída, sempre que aplicável.

| Facade                | Classe                                                                                                                            |  Associado ao contêiner |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------|-------------------------|
| App                   | [Illuminate\Foundation\Application](https://laravel.com/api/Illuminate/Foundation/Application.html)                               | `app`                   |
| Artisan               | [Illuminate\Contracts\Console\Kernel](https://laravel.com/api/Illuminate/Contracts/Console/Kernel.html)                           | `artisan`               |
| Auth                  | [Illuminate\Auth\AuthManager](https://laravel.com/api/Illuminate/Auth/AuthManager.html)                                           | `auth`                  |
| Auth (Instance)       | [Illuminate\Contracts\Auth\Guard](https://laravel.com/api/Illuminate/Contracts/Auth/Guard.html)                                   | `auth.driver`           |
| Blade                 | [Illuminate\View\Compilers\BladeCompiler](https://laravel.com/api/Illuminate/View/Compilers/BladeCompiler.html)                   | `blade.compiler`        |
| Broadcast             | [Illuminate\Contracts\Broadcasting\Factory](https://laravel.com/api/Illuminate/Contracts/Broadcasting/Factory.html)               |                         |
| Broadcast (Instance)  | [Illuminate\Contracts\Broadcasting\Broadcaster](https://laravel.com/api/Illuminate/Contracts/Broadcasting/Broadcaster.html)       |                         |
| Bus                   | [Illuminate\Contracts\Bus\Dispatcher](https://laravel.com/api/Illuminate/Contracts/Bus/Dispatcher.html)                           |                         |
| Cache                 | [Illuminate\Cache\CacheManager](https://laravel.com/api/Illuminate/Cache/CacheManager.html)                                       | `cache`                 |
| Cache (Instance)      | [Illuminate\Cache\Repository](https://laravel.com/api/Illuminate/Cache/Repository.html)                                           | `cache.store`           |
| Config                | [Illuminate\Config\Repository](https://laravel.com/api/Illuminate/Config/Repository.html)                                         | `config`                |
| Cookie                | [Illuminate\Cookie\CookieJar](https://laravel.com/api/Illuminate/Cookie/CookieJar.html)                                           | `cookie`                |
| Crypt                 | [Illuminate\Encryption\Encrypter](https://laravel.com/api/Illuminate/Encryption/Encrypter.html)                                   | `encrypter`             |
| Date                  | [Illuminate\Support\DateFactory](https://laravel.com/api/Illuminate/Support/DateFactory.html)                                     | `date`                  |
| DB                    | [Illuminate\Database\DatabaseManager](https://laravel.com/api/Illuminate/Database/DatabaseManager.html)                           | `db`                    |
| DB (Instance)         | [Illuminate\Database\Connection](https://laravel.com/api/Illuminate/Database/Connection.html)                                     | `db.connection`         |
| Event                 | [Illuminate\Events\Dispatcher](https://laravel.com/api/Illuminate/Events/Dispatcher.html)                                         | `events`                |
| Exceptions            | [Illuminate\Foundation\Exceptions\Handler](https://laravel.com/api/Illuminate/Foundation/Exceptions/Handler.html)                 |                         |
| Exceptions (Instance) | [Illuminate\Contracts\Debug\ExceptionHandler](https://laravel.com/api/Illuminate/Contracts/Debug/ExceptionHandler.html)           |                         |
| File                  | [Illuminate\Filesystem\Filesystem](https://laravel.com/api/Illuminate/Filesystem/Filesystem.html)                                 | `files`                 |
| Gate                  | [Illuminate\Contracts\Auth\Access\Gate](https://laravel.com/api/Illuminate/Contracts/Auth/Access/Gate.html)                       |                         |
| Hash                  | [Illuminate\Contracts\Hashing\Hasher](https://laravel.com/api/Illuminate/Contracts/Hashing/Hasher.html)                           | `hash`                  |
| Http                  | [Illuminate\Http\Client\Factory](https://laravel.com/api/Illuminate/Http/Client/Factory.html)                                     |                         |
| Lang                  | [Illuminate\Translation\Translator](https://laravel.com/api/Illuminate/Translation/Translator.html)                               | `translator`            |
| Log                   | [Illuminate\Log\LogManager](https://laravel.com/api/Illuminate/Log/LogManager.html)                                               | `log`                   |
| Mail                  | [Illuminate\Mail\Mailer](https://laravel.com/api/Illuminate/Mail/Mailer.html)                                                     | `mailer`                |
| Notification          | [Illuminate\Notifications\ChannelManager](https://laravel.com/api/Illuminate/Notifications/ChannelManager.html)                   |                         |
| Password              | [Illuminate\Auth\Passwords\PasswordBrokerManager](https://laravel.com/api/Illuminate/Auth/Passwords/PasswordBrokerManager.html)   | `auth.password`         |
| Password (Instance)   | [Illuminate\Auth\Passwords\PasswordBroker](https://laravel.com/api/Illuminate/Auth/Passwords/PasswordBroker.html)                 | `auth.password.broker`  |
| Pipeline (Instance)   | [Illuminate\Pipeline\Pipeline](https://laravel.com/api/Illuminate/Pipeline/Pipeline.html)                                         |                         |
| Process               | [Illuminate\Process\Factory](https://laravel.com/api/Illuminate/Process/Factory.html)                                             |                         |
| Queue                 | [Illuminate\Queue\QueueManager](https://laravel.com/api/Illuminate/Queue/QueueManager.html)                                       | `queue`                 |
| Queue (Instance)      | [Illuminate\Contracts\Queue\Queue](https://laravel.com/api/Illuminate/Contracts/Queue/Queue.html)                                 | `queue.connection`      |
| Queue (Base Class)    | [Illuminate\Queue\Queue](https://laravel.com/api/Illuminate/Queue/Queue.html)                                                     |                         |
| RateLimiter           | [Illuminate\Cache\RateLimiter](https://laravel.com/api/Illuminate/Cache/RateLimiter.html)                                         |                         |
| Redirect              | [Illuminate\Routing\Redirector](https://laravel.com/api/Illuminate/Routing/Redirector.html)                                       | `redirect`              |
| Redis                 | [Illuminate\Redis\RedisManager](https://laravel.com/api/Illuminate/Redis/RedisManager.html)                                       | `redis`                 |
| Redis (Instance)      | [Illuminate\Redis\Connections\Connection](https://laravel.com/api/Illuminate/Redis/Connections/Connection.html)                   | `redis.connection`      |
| Request               | [Illuminate\Http\Request](https://laravel.com/api/Illuminate/Http/Request.html)                                                   | `request`               |
| Response              | [Illuminate\Contracts\Routing\ResponseFactory](https://laravel.com/api/Illuminate/Contracts/Routing/ResponseFactory.html)         |                         |
| Response (Instance)   | [Illuminate\Http\Response](https://laravel.com/api/Illuminate/Http/Response.html)                                                 |                         |
| Route                 | [Illuminate\Routing\Router](https://laravel.com/api/Illuminate/Routing/Router.html)                                               | `router`                |
| Schedule              | [Illuminate\Console\Scheduling\Schedule](https://laravel.com/api/Illuminate/Console/Scheduling/Schedule.html)                     |                         |
| Schema                | [Illuminate\Database\Schema\Builder](https://laravel.com/api/Illuminate/Database/Schema/Builder.html)                             |                         |
| Session               | [Illuminate\Session\SessionManager](https://laravel.com/api/Illuminate/Session/SessionManager.html)                               | `session`               |
| Session (Instance)    | [Illuminate\Session\Store](https://laravel.com/api/Illuminate/Session/Store.html)                                                 | `session.store`         |
| Storage               | [Illuminate\Filesystem\FilesystemManager](https://laravel.com/api/Illuminate/Filesystem/FilesystemManager.html)                   | `filesystem`            |
| Storage (Instance)    | [Illuminate\Contracts\Filesystem\Filesystem](https://laravel.com/api/Illuminate/Contracts/Filesystem/Filesystem.html)             | `filesystem.disk`       |
| URL                   | [Illuminate\Routing\UrlGenerator](https://laravel.com/api/Illuminate/Routing/UrlGenerator.html)                                   | `url`                   |
| Validator             | [Illuminate\Validation\Factory](https://laravel.com/api/Illuminate/Validation/Factory.html)                                       | `validator`             |
| Validator (Instance)  | [Illuminate\Validation\Validator](https://laravel.com/api/Illuminate/Validation/Validator.html)                                   |                         |
| View                  | [Illuminate\View\Factory](https://laravel.com/api/Illuminate/View/Factory.html)                                                   | `view`                  |
| View (Instance)       | [Illuminate\View\View](https://laravel.com/api/Illuminate/View/View.html)                                                         |                         |
| Vite                  | [Illuminate\Foundation\Vite](https://laravel.com/api/Illuminate/Foundation/Vite.html)                                             |                         |
