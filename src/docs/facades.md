# Fachadas

<a name="introduction"></a>
## Introdução

 Ao percorrer a documentação do Laravel, irá encontrar exemplos de código que interagem com os recursos do Laravel através de "facas". Estes facas proporcionam uma interface estática para classes disponíveis no [conjunto de serviços](/docs/container) da aplicação. O Laravel inclui vários facas, o que permite aceder a quase todos os recursos do mesmo.

 Os facade Laravel servem como "proxies estáticos" para classes subjacentes no serviço contêiner, fornecendo a vantagem de uma sintaxe concisa e expressiva ao mesmo tempo em que mantêm maior testabilidade e flexibilidade do que métodos estáticos tradicionais. É perfeitamente bem se você não compreende totalmente como os facades funcionam - siga em frente e continue aprendendo sobre Laravel.

 Todas as fachadas da Laravel estão definidas no namespace `Illuminate\Support\Facades`. Assim, podemos acessá-las facilmente do seguinte modo:

```php
    use Illuminate\Support\Facades\Cache;
    use Illuminate\Support\Facades\Route;

    Route::get('/cache', function () {
        return Cache::get('key');
    });
```

 Ao longo da documentação do Laravel, muitos dos exemplos usarão facas para demonstrar vários recursos do framework.

<a name="helper-functions"></a>
#### Funções de ajuda

 Para complementar as facetas, o Laravel oferece uma variedade de "funções auxiliares" globais que tornam mais fácil interagir com recursos comuns do Laravel. Algumas funções auxiliares comuns com as quais você pode interagir são: `view`, `response`, `url` e `config`. Cada função auxiliar oferecida pelo Laravel está documentada em conjunto com o recurso correspondente; no entanto, uma lista completa está disponível na [documentação de funções auxiliares](/docs/helpers).

 Por exemplo, em vez de usar a fachada `Illuminate\Support\Facades\Response` para gerar uma resposta JSON, podemos simplesmente usar a função `response`. Como as funções auxiliares estão disponíveis globalmente, não será necessário importar nenhuma classe para utilizá-las:

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

<a name="when-to-use-facades"></a>
## Quando utilizar fachadas

 As facetas têm muitos benefícios. Elas fornecem uma sintaxe concisa e memorável que permite usar recursos do Laravel sem ter de lembrar nomes longos de classes que devem ser injetadas ou configuradas manualmente. Além disso, por causa de seu uso exclusivo dos métodos dinâmicos do PHP, elas são fáceis de testar.

 No entanto, é preciso tomar alguns cuidados ao usar facade. O perigo principal de uma façade é o "creep de escopo". Uma vez que as facades são fáceis de usar e não exigem injeção, pode ser fácil deixar suas classes continuarem a crescer usando muitas facades em uma única classe. O uso da dependência injetada mitiga esse potencial através do feedback visual que um grande construtor fornece quando sua classe está ficando muito grande. Portanto, ao usar façade, preste atenção especial à dimensão de sua classe para que seu escopo de responsabilidade permaneça limitado. Se sua classe está ficando muito grande, considere dividi-la em várias classes menores.

<a name="facades-vs-dependency-injection"></a>
### Faces versus injeção de dependência

 Um dos principais benefícios da injeção de dependência é a capacidade de substituir implementações da classe injetada, o que é útil durante testes, uma vez que podemos injetar um mock ou stub e afirmar se vários métodos foram chamados no stub.

 Normalmente, não é possível simular ou substituir um método de uma classe verdadeiramente estática. No entanto, porque as facades usam métodos dinâmicos para fazer o proxied das chamadas dos métodos para objetos resolvidos do contêiner de serviços, podemos realmente testar facades da mesma maneira que testamos uma instância injetada. Por exemplo, considerando o seguinte caminho:

```php
    use Illuminate\Support\Facades\Cache;

    Route::get('/cache', function () {
        return Cache::get('key');
    });
```

 Usando os métodos de teste de faca Laravel, podemos escrever o seguinte teste para verificar se o método `Cache::get` foi chamado com o argumento esperado:

```php tab=Pest
use Illuminate\Support\Facades\Cache;

test('basic example', function () {
    Cache::shouldReceive('get')
         ->with('key')
         ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
});
```

```php tab=PHPUnit
use Illuminate\Support\Facades\Cache;

/**
 * A basic functional test example.
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

<a name="facades-vs-helper-functions"></a>
### FACADES VERSUS HELPER FUNCTIONS

 Além de facades, Laravel inclui várias funções "ajudantes", capazes de executar tarefas comuns como gerar visualizações, disparar eventos, despachar trabalhos ou enviar respostas HTTP. Muitas dessas funções ajudam equivalentes às correspondecentes facades. Por exemplo:

```php
    return Illuminate\Support\Facades\View::make('profile');

    return view('profile');
```

 Não há diferença prática entre facadas e funções de ajuda. Ao usar as funções de ajuda, você poderá testá-las exatamente da mesma forma que faria com a facada correspondente. Por exemplo, considere o seguinte caminho:

```php
    Route::get('/cache', function () {
        return cache('key');
    });
```

 O helper `cache` irá chamar o método `get` na classe subjacente da fachada `Cache`. Então, embora estejamos usando a função helper, podemos escrever o seguinte teste para verificar se o método foi chamado com o argumento esperado:

```php
    use Illuminate\Support\Facades\Cache;

    /**
     * A basic functional test example.
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

<a name="how-facades-work"></a>
## Como os Fachadas Funcionam

 Numa aplicação Laravel, um Facade é uma classe que permite o acesso a um objeto do contêiner. A maquinaria que faz isto funcionar está na classe `Facade`. Os facades da Laravel e quaisquer outros facades personalizados criados serão baseados na classe de base `Illuminate\Support\Facades\Facade`.

 A classe base Facade utiliza o método mágico `__callStatic()` para retardar as chamadas da sua interface do container. No exemplo abaixo, é feita uma chamada ao sistema de cache do Laravel. Conforme os dados deste código, pode-se supor que a metodômega "get" está sendo executada na classe Cache:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\Cache;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Show the profile for the given user.
         */
        public function showProfile(string $id): View
        {
            $user = Cache::get('user:'.$id);

            return view('profile', ['user' => $user]);
        }
    }
```

 Observe que no início do arquivo estamos "importando" a fachada Cache. Essa fachada funciona como um proxy para o acesso à implementação subjacente da interface Illuminate\Contracts\Cache\Factory. Todos os chamados feitos usando essa fachada serão passados ao objeto subjacente do serviço de cache do Laravel.

 Se observarmos essa classe `Illuminate\Support\Facades\Cache`, veremos que não há método estático `get`:

```php
    class Cache extends Facade
    {
        /**
         * Get the registered name of the component.
         */
        protected static function getFacadeAccessor(): string
        {
            return 'cache';
        }
    }
```

 Em vez disso, o `Cache` facade estende a classe base `Facade` e define o método `getFacadeAccessor()`. Esse método tem como função retornar o nome de um vínculo do contêiner de serviços. Quando o usuário refere-se a qualquer método estático da `Cache` facade, o Laravel resolve o vínculo `cache` do [contêiner de serviço](/docs/container) e executa o método solicitado (neste caso, `get`) contra esse objeto.

<a name="real-time-facades"></a>
## Fachadas em tempo real

 Usando fachadas em tempo real, você poderá tratar qualquer classe em sua aplicação como se fosse uma fachada. Para ilustrar o uso delas, vamos primeiro analisar um pouco de código que não utiliza fachadas em tempo real. Por exemplo, suponha que nosso modelo `Podcast` tem um método `publish`. No entanto, para publicar o podcast, precisaremos injetar uma instância do tipo `Publisher`:

```php
    <?php

    namespace App\Models;

    use App\Contracts\Publisher;
    use Illuminate\Database\Eloquent\Model;

    class Podcast extends Model
    {
        /**
         * Publish the podcast.
         */
        public function publish(Publisher $publisher): void
        {
            $this->update(['publishing' => now()]);

            $publisher->publish($this);
        }
    }
```

 Ao injetar uma implementação de publicador na metodologia permite testar facilmente a metodologia isoladamente dado que pode simular o publicador injetado. No entanto, exige o envio de uma instância do publicador sempre que for invocada a metodologia `publish`. Através das fachadas em tempo real, é possível manter a mesma testabilidade sem ser necessário passar explicitamente uma instância de `Publisher`. Para gerar uma fachada em tempo real, antepôs o prefixo do namespace da classe importada com "Facades":

```php
    <?php

    namespace App\Models;

    use App\Contracts\Publisher; // [tl! remove]
    use Facades\App\Contracts\Publisher; // [tl! add]
    use Illuminate\Database\Eloquent\Model;

    class Podcast extends Model
    {
        /**
         * Publish the podcast.
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

 Quando a fachada em tempo real é utilizada, a implementação do publisher será resolvida fora do container de serviços usando a parte do nome da interface ou classe que aparece após o prefixo "Facades". Durante as provas, podemos usar os ajudantes de teste de fachadas integrados no Laravel para simular este chamado de método:

```php tab=Pest
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

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Models\Podcast;
use Facades\App\Contracts\Publisher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PodcastTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A test example.
     */
    public function test_podcast_can_be_published(): void
    {
        $podcast = Podcast::factory()->create();

        Publisher::shouldReceive('publish')->once()->with($podcast);

        $podcast->publish();
    }
}
```

<a name="facade-class-reference"></a>
## Referência da façade

 Abaixo você encontrará cada facade e sua classe subjacente. Este é uma ferramenta útil para explorar rapidamente a documentação da API de um determinado root de facade. A chave [service container binding](/docs/container) também está incluída, sempre que aplicável.

<div class="overflow-auto">

|  Façade |  Classe |  Associação de serviços a um contêiner |
|-----------------------|-------------|-------------|
|  Aplicativo |  [Illuminate\Foundation\Application](https://laravel.com/api/Illuminate/Foundation/Application.html) |  `aplicativo` |
|  Artesão |  [Illuminate\Contracts\Console\Kernel](https://laravel.com/api/Illuminate/Contracts/Console/Kernel.html) |  `artesão` |
|  Auth |  [Illuminate\Auth\AuthManager](https://laravel.com/api/Illuminate/Auth/AuthManager.html) |  ``autenticação`` |
|  Auth (Instância) |  [Illuminate\Contracts\Auth\Guard](https://laravel.com/api/Illuminate/Contracts/Auth/Guard.html) |  `auth.driver` |
|  Lâmina |  [Illuminate\View\Compilers\BladeCompiler](https://laravel.com/api/Illuminate/View/Compilers/BladeCompiler.html) |  `Blade.Compiler` |
|  Transmissão |  [Illuminate\Contracts\Broadcasting\Factory](https://laravel.com/api/Illuminate/Contracts/Broadcasting/Factory.html) |  |
|  Transmissão (Instância) |  [Illuminate\Contracts\Broadcasting\Broadcaster](https://laravel.com/api/Illuminate/Contracts/Broadcasting/Broadcaster.html) |  &nbsp; |
|  Autocarro |  [Illuminate\Contracts\Bus\Dispatcher](https://laravel.com/api/Illuminate/Contracts/Bus/Dispatcher.html) |  &nbsp; |
|  Arquivo cache |  [Illuminate\Cache\CacheManager](https://laravel.com/api/Illuminate/Cache/CacheManager.html) |  `cache` |
|  Arquivo temporário (instância) |  [Illuminate\Cache\Repository](https://laravel.com/api/Illuminate/Cache/Repository.html) |  `cache.store` |
|  Configuração |  [Illuminate\Config\Repository](https://laravel.com/api/Illuminate%2FConfig%2FRepository.html) |  `config` |
|  Gostaríamos de informar que a utilização deste website pressupõe a aceitação das condições descritas na nossa Política de Privacidade e Utilização de Cookies. |  [Illuminate\Cookie\CookieJar](https://laravel.com/api/Illuminate/Cookie/CookieJar.html) |  "cookie" |
|  Cript |  [Illuminate\Encryption\Encrypter](https://laravel.com/api/Illuminate/Encryption/Encrypter.html) |  “encrypt” |
|  Data |  [Illuminate\Support\DateFactory](https://laravel.com/api/Illuminate/Support/DateFactory.html) |  `data` |
|  DB |  [Illuminate\Database\DatabaseManager](https://laravel.com/api/Illuminate%2FDatabase%2FDatabaseManager.html) |  `db` |
|  DB (Instância) |  [Iluminar\Navegação de banco de dados](https://laravel.com/api/Illuminate/Database/Connection.html) |  `db.connection` |
|  Evento |  [Illuminate\Events\Dispatcher] (https://laravel.com/api/Illuminate/Events/Dispatcher.html) |  `eventos` |
|  Exceções |  [Illuminate\Foundation\Exceptions\Handler] (https://laravel.com/api/Illuminate/Foundation/Exceptions/Handler.html) |  |
|  Exceções (Instância) |  [Illuminate\Contracts\Debug\ExceptionHandler](https://laravel.com/api/Illuminate/Contracts/Debug/ExceptionHandler.html) |  &nbsp; |
|  Arquivo |  [Illuminate\Filesystem\Filesystem](https://laravel.com/api/Illuminate/Filesystem/Filesystem.html) |  "arquivos" |
|  Porta |  [Illuminate\Contracts\Auth\Access\Gate](https://laravel.com/api/Illuminate/Contracts/Auth/Access/Gate.html) |  &nbsp; |
|  Hash |  [Illuminate\Contracts\Hashing\Hasher](https://laravel.com/api/Illuminate/Contracts/Hashing/Hasher.html) |  ``hash'' |
|  Http |  [Illuminate\Http\Client\Factory](https://laravel.com/api/Illuminate%2FHttp%2FClient%2FFactory.html) |  &nbsp; |
|  Lang |  [Iluminar/Tradutor](https://laravel.com/api/Illuminate/Translation/Translator.html) |  "tradutor" |
|  Registo |  [Illuminate\Log\LogManager](https://laravel.com/api/Illuminate/Log/LogManager.html) |  `log` |
|  E-mail |  [Illuminate\Mail\Mailer](https://laravel.com/api/Illuminate/Mail/Mailer.html) |  `Correio eletrónico` |
|  Notificação |  [Illuminate\Notifications\ChannelManager](https://laravel.com/api/Illuminate/Notifications/ChannelManager.html) |  |
|  Senha |  [Illuminate\Auth\Passwords\PasswordBrokerManager](https://laravel.com/api/Illuminate/Auth/Passwords/PasswordBrokerManager.html) |  `aut.senha` |
|  Senha (Instância) |  [Illuminate\Auth\Passwords\PasswordBroker](https://laravel.com/api/Illuminate/Auth/Passwords/PasswordBroker.html) |  `auth.password.broker` |
|  Tubulação (instância) |  [Illuminate\Pipeline\Pipeline](https://laravel.com/api/Illuminate%2FPipeline%2FPipeline.html) |  &nbsp; |
|  Processo |  [Illuminate\Process\Factory](https://laravel.com/api/Illuminate/Process/Factory.html) |  |
|  Fila |  [Illuminate\Queue\QueueManager](https://laravel.com/api/Illuminate/Queue/QueueManager.html) |  "fila" |
|  Fila (instância) |  [Illuminate\Contracts\Queue\Queue](https://laravel.com/api/Illuminate/Contracts/Queue/Queue.html) |  `queue.connection` |
|  Fila (classe base) |  [Illuminate\\Queue\\Queue](https://laravel.com/api/Illuminate/Queue/Queue.html) |  |
|  Limitador de taxa |  [Illuminate\Cache\RateLimiter](https://laravel.com/api/Illuminate/Cache/RateLimiter.html) |  |
|  Redirecionamento |  [Iluminar\Encaminhamento\Redirecionador] (https://laravel.com/api/Illuminate/Encaminhamento/Redirecionador.html) |  `redirecionar` |
|  Redis |  [Illuminate\Redis\RedisManager](https://laravel.com/api/Illuminate/Redis/RedisManager.html) |  `redis` |
|  Redis (Instância) |  [Illuminate\Redis\Connections\Connection](https://laravel.com/api/Illuminate/Redis/Connections/Connection.html) |  `redis.connection` |
|  Pedido |  [Illuminate\Http\Request](https://laravel.com/api/Illuminate/Http/Request.html) |  "solicitação" |
|  Resposta |  [Illuminate\\Contracts\\Routing\\ResponseFactory](https://laravel.com/api/Illuminate/Contracts/Routing/ResponseFactory.html) |  &nbsp; |
|  Resposta (Instância) |  [Illuminate\Http\Response](https://laravel.com/api/Illuminate/Http/Response.html) |  &nbsp; |
|  Percurso |  [Illuminate\Routing\Router](https://laravel.com/api/Illuminate/Routing/Router.html) |  `Router` |
|  Calendário |  [Illuminate\Console\Scheduling\Schedule](https://laravel.com/api/Illuminate/Console/Scheduling/Schedule.html) |  &nbsp; |
|  Esquema |  [Illuminate\Database\Schema\Builder](https://laravel.com/api/Illuminate/Database/Schema/Builder.html) |  &nbsp; |
|  Sessão |  [Illuminate\Session\SessionManager](https://laravel.com/api/Illuminate/Session/SessionManager.html) |  “sessão” |
|  Sessão (instância) |  [Illuminate\Session\Store](https://laravel.com/api/Illuminate/Session/Store.html) |  `session.store` |
|  Armazenamento |  [Illuminate\Filesystem\FilesystemManager](https://laravel.com/api/Illuminate/Filesystem/FilesystemManager.html) |  `filesystem` |
|  Armazenamento (Instância) |  [Illuminate\Contracts\Filesystem\Filesystem](https://laravel.com/api/Illuminate/Contracts/Filesystem/Filesystem.html) |  `filesystem.disk` |
|  URL |  [Illuminate\Routing\UrlGenerator](https://laravel.com/api/Illuminate/Routing/UrlGenerator.html) |  `url` |
|  Validador |  [Illuminate\Validation\Factory](https://laravel.com/api/Illuminate/Validation/Factory.html) |  `validador` |
|  Validador (instância) |  [Illuminate\Validation\Validator](https://laravel.com/api/Illuminate/Validation/Validator.html) |  &nbsp; |
|  Exibição |  [Illuminate\View\Factory](https://laravel.com/api/Illuminate/View/Factory.html) |  `visualização` |
|  Visualização (instância) |  [Illuminate\View\View](https://laravel.com/api/Illuminate/View/View.html) |  &nbsp; |
|  Em breve |  [Illuminate\\Foundation\\Vite] (https://laravel.com/apidocumentation/vitesshow/Illuminate%5CFoundation%5CVite.html) |  |

</div>
