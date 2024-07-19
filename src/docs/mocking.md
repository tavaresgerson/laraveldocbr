# Zombaria

<a name="introduction"></a>
## Introdução

 Ao testar aplicações Laravel, pode ser desejável simular determinados aspetos da sua aplicação para que não sejam executadas na prática durante o teste. Por exemplo, quando testa um controlador que envia um evento, talvez seja conveniente simular os escutadores de evento para que eles não sejam realmente executados no decorrer do teste. Isto permite-lhe testar apenas a resposta HTTP do controlador sem preocupações com a execução dos escutadores de eventos, uma vez que estes podem ser testados em um caso de teste específico.

 O Laravel fornece métodos úteis para simular eventos, tarefas e outros tipos de interfaces, o que simplifica a utilização do Mockery, evitando assim ter de efetuar chamadas manuais complicadas ao Mockery.

<a name="mocking-objects"></a>
## Zombar de objetos

 Quando você estiver usando um objeto que será injetado na sua aplicação através do [conjunto de serviços](/docs/container) da Laravel, precisará vincular a instância falsa ao conjunto como uma vinculação `instance`. Isto instruirá o conjunto para usar a instância falsa desse objeto em vez da construção do próprio objeto:

```php tab=Pest
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

```php tab=PHPUnit
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

 Para tornar o processo mais conveniente, você pode usar a metodologia `mock` fornecida pela classe de teste de base do Laravel. Por exemplo, o exemplo abaixo é equivalente ao acima:

```php
    use App\Service;
    use Mockery\MockInterface;

    $mock = $this->mock(Service::class, function (MockInterface $mock) {
        $mock->shouldReceive('process')->once();
    });
```

 É possível usar o método `partialMock` quando é necessário somente falsificar alguns métodos de um objeto. Os métodos que não forem falsificados serão executados normalmente ao ser chamado:

```php
    use App\Service;
    use Mockery\MockInterface;

    $mock = $this->partialMock(Service::class, function (MockInterface $mock) {
        $mock->shouldReceive('process')->once();
    });
```

 Da mesma forma, se você quiser espionar um objeto, a classe de teste base do Laravel oferece uma metodologia `spy` como um wrapper conveniente ao redor da método `Mockery::spy`. Espiões são semelhantes aos mocks; porém, os spies registram qualquer interação entre o espio e o código que está sendo testado, permitindo-lhe fazer asserções depois que o código é executado:

```php
    use App\Service;

    $spy = $this->spy(Service::class);

    // ...

    $spy->shouldHaveReceived('process');
```

<a name="mocking-facades"></a>
## Fachadas de zombaria

 Diferentemente das chamadas de métodos estáticos tradicionais, [facades] (incluindo [facades em tempo real] (/)), podem ser simulados. Isso oferece uma grande vantagem sobre os métodos estáticos tradicionais e concede a você o mesmo grau de testabilidade que teria se você estivesse usando a injeção de dependência tradicional. Durante os testes, muitas vezes você pode querer simular uma chamada para um facade Laravel que ocorre em um de seus controladores. Por exemplo, considere a seguinte ação do controlador:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Support\Facades\Cache;

    class UserController extends Controller
    {
        /**
         * Retrieve a list of all users of the application.
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

 Podemos simular o chamado à interface `Cache`, utilizando o método `shouldReceive`, que devolve uma instância de um mock do [Mockery](https://github.com/padraic/mockery). Uma vez que as interfaces são resolvidas e gerenciadas pelo [conjunto de serviços](/docs/container) do Laravel, eles têm muito mais capacidade de teste do que uma classe estatica típica. Por exemplo, podemos simular o nosso chamado ao método `get` da interface `Cache`:

```php tab=Pest
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

```php tab=PHPUnit
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

 > [!AVISO]
 [Métodos de teste de HTTP](/docs/http-tests), como `get` e `post`, ao executar seu teste. Do mesmo modo, invocar o método `Config::set` nos seus testes em vez de simular a facade `Config`.

<a name="facade-spies"></a>
### Espiões da fachada

 Se você deseja espionar uma facada (http://docs.mockery.io/en/latest/reference/spies.html), você pode chamar o método `spy` na facada correspondente. As espionagens são semelhantes às asserções; no entanto, elas registram qualquer interação entre a espionagem e o código sendo testado, permitindo que você faça afirmações depois que o código for executado:

```php tab=Pest
<?php

use Illuminate\Support\Facades\Cache;

test('values are be stored in cache', function () {
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->once()->with('name', 'Taylor', 10);
});
```

```php tab=PHPUnit
use Illuminate\Support\Facades\Cache;

public function test_values_are_be_stored_in_cache(): void
{
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->once()->with('name', 'Taylor', 10);
}
```

<a name="interacting-with-time"></a>
## Interagir com o tempo

 Durante os testes você pode precisar, ocasionalmente, modificar o tempo retornado por meio de helper como `now` ou `Illuminate\Support\Carbon::now()`. Por sorte, a classe base do Laravel para testes conta com helpers que permitem a manipulação do tempo atual:

```php tab=Pest
test('time can be manipulated', function () {
    // Travel into the future...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // Travel into the past...
    $this->travel(-5)->hours();

    // Travel to an explicit time...
    $this->travelTo(now()->subHours(6));

    // Return back to the present time...
    $this->travelBack();
});
```

```php tab=PHPUnit
public function test_time_can_be_manipulated(): void
{
    // Travel into the future...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // Travel into the past...
    $this->travel(-5)->hours();

    // Travel to an explicit time...
    $this->travelTo(now()->subHours(6));

    // Return back to the present time...
    $this->travelBack();
}
```

 Você também pode fornecer um closure aos vários métodos de viagem no tempo. O closure será invocado com o tempo congelado na hora especificada. Depois que o closure tiver sido executado, o tempo retornará ao normal:

```php
    $this->travel(5)->days(function () {
        // Test something five days into the future...
    });
    
    $this->travelTo(now()->subDays(10), function () {
        // Test something during a given moment...
    });
```

 O método `freezeTime` pode ser usado para congelar o tempo corrente. De forma semelhante, o método `freezeSecond` irá congelar o tempo corrente, mas no início do segundo corrente:

```php
    use Illuminate\Support\Carbon;

    // Freeze time and resume normal time after executing closure...
    $this->freezeTime(function (Carbon $time) {
        // ...
    });

    // Freeze time at the current second and resume normal time after executing closure...
    $this->freezeSecond(function (Carbon $time) {
        // ...
    })
```

 Como é de esperar, todos os métodos discutidos acima são úteis principalmente para testes de comportamentos de aplicações sensíveis ao tempo, como o bloqueio de postagens inativas em fóruns de discussão:

```php tab=Pest
use App\Models\Thread;

test('forum threads lock after one week of inactivity', function () {
    $thread = Thread::factory()->create();

    $this->travel(1)->week();

    expect($thread->isLockedByInactivity())->toBeTrue();
});
```

```php tab=PHPUnit
use App\Models\Thread;

public function test_forum_threads_lock_after_one_week_of_inactivity()
{
    $thread = Thread::factory()->create();

    $this->travel(1)->week();

    $this->assertTrue($thread->isLockedByInactivity());
}
```
