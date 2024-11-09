# Simulação

<a name="introduction"></a>
## Introdução

Ao testar aplicativos Laravel, você pode desejar "simular" certos aspectos do seu aplicativo para que eles não sejam realmente executados durante um determinado teste. Por exemplo, ao testar um controlador que despacha um evento, você pode desejar simular os ouvintes de eventos para que eles não sejam realmente executados durante o teste. Isso permite que você teste apenas a resposta HTTP do controlador sem se preocupar com a execução dos ouvintes de eventos, pois os ouvintes de eventos podem ser testados em seu próprio caso de teste.

O Laravel fornece métodos úteis para simular eventos, trabalhos e outras fachadas prontas para uso. Esses auxiliares fornecem principalmente uma camada de conveniência sobre o Mockery para que você não precise fazer manualmente chamadas complicadas de método do Mockery.

<a name="mocking-objects"></a>
## Objetos de simulação

Ao simular um objeto que será injetado em seu aplicativo por meio do [service container](/docs/container) do Laravel, você precisará vincular sua instância simulada ao contêiner como uma vinculação `instance`. Isso instruirá o contêiner a usar sua instância simulada do objeto em vez de construir o próprio objeto:

::: code-group
```php [Pest]
use App\Service;
use Mockery;
use Mockery\MockInterface;

test('something can be mocked', function () {
    $this->instance(
        Service::class,
        Mockery::mock(Service::class, function (MockInterface $mock) {
            $mock->shouldReceive('process')->once();
        })
    );
});
```

```php [PHPUnit]
use App\Service;
use Mockery;
use Mockery\MockInterface;

public function test_something_can_be_mocked(): void
{
    $this->instance(
        Service::class,
        Mockery::mock(Service::class, function (MockInterface $mock) {
            $mock->shouldReceive('process')->once();
        })
    );
}
```
:::

Para tornar isso mais conveniente, você pode usar o método `mock` fornecido pela classe de caso de teste base do Laravel. Por exemplo, o exemplo a seguir é equivalente ao exemplo acima:

```php
    use App\Service;
    use Mockery\MockInterface;

    $mock = $this->mock(Service::class, function (MockInterface $mock) {
        $mock->shouldReceive('process')->once();
    });
```

Você pode usar o método `partialMock` quando precisar simular apenas alguns métodos de um objeto. Os métodos que não são simulados serão executados normalmente quando chamados:

```php
    use App\Service;
    use Mockery\MockInterface;

    $mock = $this->partialMock(Service::class, function (MockInterface $mock) {
        $mock->shouldReceive('process')->once();
    });
```

Da mesma forma, se você quiser [espionar](http://docs.mockery.io/en/latest/reference/spies.html) um objeto, a classe de caso de teste base do Laravel oferece um método `spy` como um wrapper conveniente em torno do método `Mockery::spy`. Os espiões são semelhantes aos mocks; no entanto, os espiões registram qualquer interação entre o espião e o código que está sendo testado, permitindo que você faça afirmações após a execução do código:

```php
    use App\Service;

    $spy = $this->spy(Service::class);

    // ...

    $spy->shouldHaveReceived('process');
```

<a name="mocking-facades"></a>
## Fachadas de Mocking

Ao contrário das chamadas de métodos estáticos tradicionais, [fachadas](/docs/facades) (incluindo [fachadas em tempo real](/docs/facades#fachadas-em-tempo-real)) podem ser simuladas. Isso fornece uma grande vantagem sobre os métodos estáticos tradicionais e garante a mesma testabilidade que você teria se estivesse usando injeção de dependência tradicional. Ao testar, você pode querer simular uma chamada para uma fachada do Laravel que ocorre em um dos seus controladores. Por exemplo, considere a seguinte ação do controlador:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Support\Facades\Cache;

    class UserController extends Controller
    {
        /**
         * Recupere uma lista de todos os usuários do aplicativo.
         */
        public function index(): array
        {
            $value = Cache::get('key');

            return [
                // ...
            ];
        }
    }
```

Podemos simular a chamada para a fachada `Cache` usando o método `shouldReceive`, que retornará uma instância de uma simulação [Mockery](https://github.com/padraic/mockery). Como as fachadas são realmente resolvidas e gerenciadas pelo [contêiner de serviço](/docs/container) do Laravel, elas têm muito mais testabilidade do que uma classe estática típica. Por exemplo, vamos simular nossa chamada para o método `get` da fachada `Cache`:

::: code-group
```php [Pest]
<?php

use Illuminate\Support\Facades\Cache;

test('get index', function () {
    Cache::shouldReceive('get')
                ->once()
                ->with('key')
                ->andReturn('value');

    $response = $this->get('/users');

    // ...
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    public function test_get_index(): void
    {
        Cache::shouldReceive('get')
                    ->once()
                    ->with('key')
                    ->andReturn('value');

        $response = $this->get('/users');

        // ...
    }
}
```
:::

::: warning AVISO
Você não deve simular a fachada `Request`. Em vez disso, passe a entrada que você deseja para os [métodos de teste HTTP](/docs/http-tests) como `get` e `post` ao executar seu teste. Da mesma forma, em vez de zombar da fachada `Config`, chame o método `Config::set` em seus testes.
:::

<a name="facade-spies"></a>
### Facade Spies

Se você quiser [espionar](http://docs.mockery.io/en/latest/reference/spies.html) uma fachada, você pode chamar o método `spy` na fachada correspondente. Os espiões são semelhantes aos mocks; no entanto, os espiões registram qualquer interação entre o espião e o código que está sendo testado, permitindo que você faça afirmações após o código ser executado:

::: code-group
```php [Pest]
<?php

use Illuminate\Support\Facades\Cache;

test('values are be stored in cache', function () {
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->once()->with('name', 'Taylor', 10);
});
```

```php [PHPUnit]
use Illuminate\Support\Facades\Cache;

public function test_values_are_be_stored_in_cache(): void
{
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->once()->with('name', 'Taylor', 10);
}
```
:::

<a name="interacting-with-time"></a>
## Interagindo com o tempo

Ao testar, você pode ocasionalmente precisar modificar o tempo retornado por auxiliares como `now` ou `Illuminate\Support\Carbon::now()`. Felizmente, a classe de teste de recurso base do Laravel inclui auxiliares que permitem que você manipule o tempo atual:

::: code-group
```php [Pest]
test('time can be manipulated', function () {
    // Viaje para o futuro...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // Viaje ao passado...
    $this->travel(-5)->hours();

    // Viaje para um tempo específico...
    $this->travelTo(now()->subHours(6));

    // Retorne ao tempo presente...
    $this->travelBack();
});
```

```php [PHPUnit]
public function test_time_can_be_manipulated(): void
{
    // Viaje para o futuro...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // Viaje ao passado...
    $this->travel(-5)->hours();

    // Viaje para um tempo específico...
    $this->travelTo(now()->subHours(6));

    // Retorne ao tempo presente...
    $this->travelBack();
}
```
:::

Você também pode fornecer um fechamento para os vários métodos de viagem no tempo. O fechamento será invocado com o tempo congelado no tempo especificado. Depois que o fechamento for executado, o tempo será retomado normalmente:

```php
    $this->travel(5)->days(function () {
        // Teste algo cinco dias no futuro...
    });
    
    $this->travelTo(now()->subDays(10), function () {
        // Testar algo durante um determinado momento...
    });
```

O método `freezeTime` pode ser usado para congelar o tempo atual. Da mesma forma, o método `freezeSecond` congelará o tempo atual, mas no início do segundo atual:

```php
    use Illuminate\Support\Carbon;

    // Congele o tempo e retome o tempo normal após executar o fechamento...
    $this->freezeTime(function (Carbon $time) {
        // ...
    });

    // Congela o tempo no segundo atual e retoma o tempo normal após executar o fechamento...
    $this->freezeSecond(function (Carbon $time) {
        // ...
    })
```

Como seria de se esperar, todos os métodos discutidos acima são principalmente úteis para testar o comportamento do aplicativo sensível ao tempo, como bloquear postagens inativas em um fórum de discussão:

::: code-group
```php [Pest]
use App\Models\Thread;

test('forum threads lock after one week of inactivity', function () {
    $thread = Thread::factory()->create();

    $this->travel(1)->week();

    expect($thread->isLockedByInactivity())->toBeTrue();
});
```

```php [PHPUnit]
use App\Models\Thread;

public function test_forum_threads_lock_after_one_week_of_inactivity()
{
    $thread = Thread::factory()->create();

    $this->travel(1)->week();

    $this->assertTrue($thread->isLockedByInactivity());
}
```
:::