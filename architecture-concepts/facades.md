# Facades

## Introdução
Ao longo da documentação do Laravel, você verá exemplos de código que interage com os recursos do Laravel via "fachadas". As fachadas 
fornecem uma interface "estática" para as classes disponíveis no contêiner de serviço do aplicativo. O Laravel vem com muitas fachadas 
que fornecem acesso a quase todos os recursos do Laravel.

As fachadas do Laravel servem como "proxies estáticos" para as classes subjacentes no contêiner de serviço, fornecendo o benefício de uma 
sintaxe concisa e expressiva enquanto mantém mais testabilidade e flexibilidade do que os métodos estáticos tradicionais. É perfeitamente 
normal se você não entende totalmente como as fachadas funcionam sob o capô - apenas siga o fluxo e continue aprendendo sobre o Laravel.

Todas as fachadas do Laravel são definidas no namespace `Illuminate\Support\Facades`. Assim, podemos acessar facilmente uma fachada como esta:

```php
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

Ao longo da documentação do Laravel, muitos dos exemplos usarão fachadas para demonstrar vários recursos do framework.

### Funções auxiliares
Para complementar as fachadas, o Laravel oferece uma variedade de "funções auxiliares" globais que tornam ainda mais fácil interagir com os recursos comuns do Laravel. 
Algumas das funções auxiliares comuns que podemos interagir são `view`, `response`, `url`, `config`, e muito mais. Cada função auxiliar oferecida pelo Laravel é 
documentada com seu recurso correspondente; no entanto, uma lista completa está disponível na documentação do auxiliar dedicado.

Por exemplo, em vez de usar a fachada `Illuminate\Support\Facades\Response` para gerar uma resposta JSON, podemos simplesmente usar a função `response`. Como as 
funções auxiliares estão disponíveis globalmente, você não precisa importar nenhuma classe para usá-las:

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

## Quando usar facades
Facades têm muitos benefícios. Eles fornecem uma sintaxe concisa e memorável que permite usar os recursos do Laravel sem lembrar de
nomes de classes longos que devem ser injetados ou configurados manualmente. Além disso, devido ao uso exclusivo dos métodos 
dinâmicos do PHP, eles são fáceis de testar.

No entanto, alguns cuidados devem ser tomados ao usar facades. O principal perigo das facades é a fluência no escopo da classe. 
Como as facades são muito fáceis de usar e não requerem injeção, pode ser fácil permitir que suas classes continuem a crescer e 
usar muitas facades em uma única classe. Usando injeção de dependência, esse potencial é atenuado pelo feedback visual que um 
grande construtor fornece a você que sua classe está crescendo muito. Portanto, ao usar facades, preste atenção especial ao 
tamanho da sua classe, para que seu escopo de responsabilidade permaneça restrito.

> Ao criar um pacote de terceiros que interaja com o Laravel, é melhor injetar contratos do Laravel em vez de usar facades. 
> Como os pacotes são construídos fora do próprio Laravel, você não terá acesso aos auxiliares de teste de facades do Laravel.

## Facades vs. Injeção de dependência
Um dos principais benefícios da injeção de dependência é a capacidade de trocar implementações da classe injetada. Isso é 
útil durante o teste, pois você pode injetar uma simulação ou esboço e afirmar que vários métodos foram chamados no esboço.

Normalmente, não seria possível mock ou stub de um método de classe verdadeiramente estático. No entanto, como as facades 
usam métodos dinâmicos para proxy de chamadas de método para objetos resolvidos a partir do contêiner de serviço, na verdade 
podemos testar facades da mesma maneira que testamos uma instância de classe injetada. Por exemplo, dada a seguinte rota:

``` php
use Illuminate\Support\Facades\Cache;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

Podemos escrever o seguinte teste para verificar se o método `Cache::get` foi chamado com o argumento que esperávamos:

``` php
use Illuminate\Support\Facades\Cache;

/**
 * A basic functional test example.
 *
 * @return void
 */
public function testBasicExample()
{
    Cache::shouldReceive('get')
         ->with('key')
         ->andReturn('value');

    $this->visit('/cache')
         ->see('value');
}
```
## Facades vs. Funções auxiliares
Além das facades, o Laravel inclui uma variedade de funções "auxiliares" que podem executar tarefas comuns, como gerar 
visualizações, disparar eventos, despachar tarefas ou enviar respostas HTTP. Muitas dessas funções auxiliares executam 
a mesma função que uma facade correspondente. Por exemplo, essa chamada de facade e chamada auxiliar são equivalentes:

``` php
return View::make('profile');

return view('profile');
```

Não há absolutamente nenhuma diferença prática entre facades e funções auxiliares. Ao usar funções auxiliares, você ainda 
pode testá-las exatamente como faria na facade correspondente. Por exemplo, dada a seguinte rota:

``` php
Route::get('/cache', function () {
    return cache('key');
});
```

Sob o capô, o auxiliar de `cache` chama o método `get` na classe subjacente à facade do `Cache`. Portanto, mesmo usando a função 
auxiliar, podemos escrever o seguinte teste para verificar se o método foi chamado com o argumento esperado:

``` php
use Illuminate\Support\Facades\Cache;

/**
 * Um exemplo básico de teste funcional.
 *
 * @return void
 */
public function testBasicExample()
{
    Cache::shouldReceive('get')
         ->with('key')
         ->andReturn('value');

    $this->visit('/cache')
         ->see('value');
}
```

## Como funcionam as facades
Em um aplicativo Laravel, uma facade é uma classe que fornece acesso a um objeto a partir do contêiner. As máquinas 
que fazem esse trabalho estão na classe Facade. As facades do Laravel e quaisquer facades personalizadas criadas 
por você estenderão a classe base `Illuminate\Support\Facades\Facade`.

A classe base `Facade` utiliza o método mágico `__callStatic()` para adiar chamadas da sua facade para um objeto resolvido 
do contêiner. No exemplo abaixo, é feita uma chamada para o sistema de cache do Laravel. Ao olhar para este código, pode-se 
supor que o método estático `get` está sendo chamado na classe `Cache`:

``` php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     *
     * @param  int  $id
     * @return Response
     */
    public function showProfile($id)
    {
        $user = Cache::get('user:'.$id);

        return view('profile', ['user' => $user]);
    }
}
```

Observe que perto da parte superior do arquivo estamos "importando" a fachada do `Cache`. Essa fachada serve como um proxy 
para acessar a implementação subjacente da interface `Illuminate\Contracts\Cache\Factory`. Qualquer chamada que fizermos 
usando a fachada será passada para a instância subjacente do serviço de cache do Laravel.

Se observarmos a classe `Illuminate\Support\Facades\Cache`, você verá que não há método estático `get`:
``` php
class Cache extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor() { return 'cache'; }
}
```

Em vez disso, a facade `Cache` estende a classe `Facade` base e define o método `getFacadeAccessor()`. O trabalho deste método 
é retornar o nome de uma ligação de contêiner de serviço. Quando um usuário faz referência a qualquer método estático na 
facade `Cache`, o Laravel resolve a ligação de cache do contêiner de serviço e executa o método solicitado (nesse caso, `get`) 
nesse objeto.

## Facades em tempo real
Usando facades em tempo real, você pode tratar qualquer classe no seu aplicativo como se fosse uma fachada. Para ilustrar 
como isso pode ser usado, vamos examinar uma alternativa. Por exemplo, vamos supor que nosso model de `Podcast` tenha um método
de `publisher`. No entanto, para publicar o podcast, precisamos injetar uma instância do `Publisher`:

```php
<?php

namespace App;

use App\Contracts\Publisher;
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publish the podcast.
     *
     * @param  Publisher  $publisher
     * @return void
     */
    public function publish(Publisher $publisher)
    {
        $this->update(['publishing' => now()]);

        $publisher->publish($this);
    }
}
```

A injeção de uma implementação do editor no método permite testar facilmente o método isoladamente, pois podemos simular 
o editor injetado. No entanto, exige que sempre passemos uma instância de editor sempre que chamamos o método de publicação. 
Usando facades em tempo real, podemos manter a mesma testabilidade, embora não seja necessário passar explicitamente uma 
instância do `Publisher`. Para gerar uma facade em tempo real, prefixe o espaço para nome da classe importada com `Facades`:

``` php
<?php

namespace App;

use Facades\App\Contracts\Publisher;
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publish the podcast.
     *
     * @return void
     */
    public function publish()
    {
        $this->update(['publishing' => now()]);

        Publisher::publish($this);
    }
}
```

Quando a fachada em tempo real é usada, a implementação do editor será resolvida fora do contêiner de serviço usando a 
parte da interface ou o nome da classe que aparece após o prefixo de Facades. Ao testar, podemos usar os auxiliares de teste 
de fachada do Laravel para simular essa chamada de método:

``` php
<?php

namespace Tests\Feature;

use App\Podcast;
use Tests\TestCase;
use Facades\App\Contracts\Publisher;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PodcastTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A test example.
     *
     * @return void
     */
    public function test_podcast_can_be_published()
    {
        $podcast = factory(Podcast::class)->create();

        Publisher::shouldReceive('publish')->once()->with($podcast);

        $podcast->publish();
    }
}
```

## Referência da Classe Facades
Abaixo, você encontrará todas as facades e sua classe subjacente. Essa é uma ferramenta útil para pesquisar rapidamente 
na documentação da API de uma determinada raiz de fachada. A chave de ligação do contêiner de serviço também é incluída 
quando aplicável.

| Facade                | Class                                             | Vinculação de contêiner de serviço    |
|-----------------------|---------------------------------------------------|---------------------------------------|
| App                   | Illuminate\Foundation\Application                 | app                                   |
| Artisan               | Illuminate\Contracts\Console\Kernel	            | artisan                               |
| Auth                  | Illuminate\Auth\AuthManager                       | auth                                  |
| Auth (Instance)       | Illuminate\Contracts\Auth\Guard                   | auth.driver                           |
| Blade                 | Illuminate\View\Compilers\BladeCompiler           | blade.compiler                        |
| Broadcast             | Illuminate\Contracts\Broadcasting\Factory         |                                       |
| Broadcast (Instance)	| Illuminate\Contracts\Broadcasting\Broadcaster     |                                       |
| Bus                   | Illuminate\Contracts\Bus\Dispatcher	            |                                       |
| Cache                 | Illuminate\Cache\CacheManager                     | cache                                 |
| Cache (Instance)	    | Illuminate\Cache\Repository	                    | cache.store                           |
| Config	            | Illuminate\Config\Repository	                    | config                                |
| Cookie	            | Illuminate\Cookie\CookieJar	                    | cookie                                |
| Crypt	                | Illuminate\Encryption\Encrypter	                | encrypter                             |
| Date                  | Illuminate\Support\DateFactory                    | date                                  |
| DB	                | Illuminate\Database\DatabaseManager	            | db                                    |
| DB (Instance)	        | Illuminate\Database\Connection	                | db.connection                         |
| Event	                | Illuminate\Events\Dispatcher	                    | events                                |
| File	                | Illuminate\Filesystem\Filesystem	                | files                                 |
| Gate	                | Illuminate\Contracts\Auth\Access\Gate     	    |                                       |
| Hash	                | Illuminate\Contracts\Hashing\Hasher	            | hash                                  |
| HTTP                  | Illuminate\Http\Client\Factory                    |                                       |
| Lang	                | Illuminate\Translation\Translator	                | translator                            |
| Log	                | Illuminate\Log\LogManager	                        | log                                   |
| Mail	                | Illuminate\Mail\Mailer	                        | mailer                                |
| Notification	        | Illuminate\Notifications\ChannelManager           |                                       |
| Password	            | Illuminate\Auth\Passwords\PasswordBrokerManager	| auth.password                         |
| Password (Instance)	| Illuminate\Auth\Passwords\PasswordBroker	        | auth.password.broker                  |
| Queue	                | Illuminate\Queue\QueueManager	                    | queue                                 |
| Queue (Instance)	    | Illuminate\Contracts\Queue\Queue	                | queue.connection                      |
| Queue (Base Class)	| Illuminate\Queue\Queue                            |                                       |
| Redirect	            | Illuminate\Routing\Redirector	                    | redirect                              |
| Redis	                | Illuminate\Redis\RedisManager	                    | redis                                 |
| Redis (Instance)	    | Illuminate\Redis\Connections\Connection	        | redis.connection                      |
| Request	            | Illuminate\Http\Request	                        | request                               |
| Response	            | Illuminate\Contracts\Routing\ResponseFactory      |                                       |
| Response (Instance)	| Illuminate\Http\Response                          |                                       |
| Route	                | Illuminate\Routing\Router	                        | router                                |
| Schema	            | Illuminate\Database\Schema\Builder                |               	                    |
| Session	            | Illuminate\Session\SessionManager	                | session                               |
| Session (Instance)	| Illuminate\Session\Store	                        | session.store                         |
| Storage	            | Illuminate\Filesystem\FilesystemManager	        | filesystem                            |
| Storage (Instance)	| Illuminate\Contracts\Filesystem\Filesystem	    | filesystem.disk                       |
| URL	                | Illuminate\Routing\UrlGenerator	                | url                                   |
| Validator             | Illuminate\Validation\Factory                     | validator                             |
| Validator (Instance)	| Illuminate\Validation\Validator                   |                                       |
| View                  | Illuminate\View\Factory                           | view                                  |
| View (Instance)       | Illuminate\View\View                              |                                       |
