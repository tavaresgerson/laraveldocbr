# Imitar

<a name="introduction"></a>
## Introdução

Ao testar aplicações Laravel, você pode querer "simular" certos aspectos da sua aplicação de modo que não sejam realmente executados durante um determinado teste. Por exemplo, quando está testando um controlador que despacha um evento, você pode querer simular os ouvintes do evento para que eles não sejam realmente executados durante o teste. Isso permite que você apenas teste a resposta HTTP do controlador sem se preocupar com a execução dos ouvintes do evento, pois estes podem ser testados em seu próprio caso de teste.

Laravel oferece métodos úteis para simular eventos, trabalhos e outras fachadas de fora da caixa. Esses ajudantes fornecem principalmente uma sobrecarga de conveniência sobre o Mockery para que você não tenha que chamar manualmente chamadas complicadas do Mockery.

<a name="mocking-objects"></a>
## Simulação de Objetos

Quando zombar de um objeto que será injetado em sua aplicação através do [container de serviço](/docs/{{version}}/container), você precisará vincular a instância simulada ao contêiner como uma 'vinculação de instância'. Isso instruirá o contêiner para usar sua instância simulada do objeto em vez de construir o objeto por si só:

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

Para tornar isso mais conveniente, você pode usar o método mock fornecido pela classe caso de teste base do Laravel. Por exemplo, o seguinte exemplo é equivalente ao exemplo acima:

```php
    use App\Service;
    use Mockery\MockInterface;

    $mock = $this->mock(Service::class, function (MockInterface $mock) {
        $mock->shouldReceive('process')->once();
    });
```

Você pode usar o método `partialMock` quando você só precisa de simular alguns métodos de um objeto. Os métodos que não são simulados serão executados normalmente, quando chamados.

```php
    use App\Service;
    use Mockery\MockInterface;

    $mock = $this->partialMock(Service::class, function (MockInterface $mock) {
        $mock->shouldReceive('process')->once();
    });
```

Assim como, se você quiser [espião](http://docs.mockery.io/en/latest/reference/spies.html) em um objeto, a classe de caso base do Laravel oferece um método `spy` como uma camada conveniente em torno do método `Mockery::spy`. Espiões são semelhantes a mocks; no entanto, espiões registram qualquer interação entre o espião e o código sendo testado, permitindo que você faça afirmações após a execução do código:

```php
    use App\Service;

    $spy = $this->spy(Service::class);

    // ...

    $spy->shouldHaveReceived('process');
```

<a name="mocking-facades"></a>
## Falso-Faciales

Diferentemente de chamadas estáticas tradicionais, [facades](/docs/{{version}}/facades) (incluindo [real-time facades](/docs/{{version}}/facades#real-time-facades)) podem ser simuladas. Isso oferece uma grande vantagem sobre métodos estáticos tradicionais e concede a você a mesma testabilidade que teria se estivesse usando injeção de dependência tradicional. Quando estiver testando, é comum querer simular um chamado para uma Laravel facade que ocorre em um de seus controladores. Por exemplo, considere a seguinte ação do controlador:

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

Podemos zombar da chamada para o `Cache` fachada usando o método `shouldReceive`, que retornará uma instância de um [Mockery](https://github.com/padraic/mockery) mock. Desde fachadas são realmente resolvidas e gerenciadas pelo Laravel [container de serviço](/docs/{{version}}/container), eles têm muito mais testabilidade do que uma classe estática típica. Por exemplo, vamos zombar a nossa chamada para o `Cache` fachada' método `get`:

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

> [!Aviso]
> Não deves zombar de qualquer fachada "Request". Em vez disso, passem o input desejado nos [métodos HTTP de teste](https://docs.guzzle.io/3.4/en/master/request-options/#test) como "get" e "post" quando executar o seu teste. Da mesma forma, em vez de zombar da fachada "Config", chamem o método `Config::set` no vosso teste.

<a name="facade-spies"></a>
### Espiões da fachada

Se você gostaria de [espião](http://docs.mockery.io/en/latest/reference/spies.html) sobre uma fachada, você pode chamar o método `spy` sobre a fachada correspondente. Os espiões são semelhantes aos mocks; no entanto, os espiões registram qualquer interação entre o espião e o código que está sendo testado, permitindo-lhe fazer afirmações após o código é executado:

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
## Interação com o Tempo

Ao fazer testes, ocasionalmente você precisará modificar o tempo retornado por ajudantes como 'agora' ou 'Illuminate\Support\Carbon::now()'. Felizmente, a classe de teste base do Laravel inclui ajudantes que permitem que você manipule o horário atual:

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

Você também pode fornecer um fechamento para os diversos métodos de viagem no tempo. O fechamento será invocado com o tempo congelado na hora especificada. Uma vez que o fechamento tenha sido executado, o tempo retomará sua normalidade:

```php
    $this->travel(5)->days(function () {
        // Test something five days into the future...
    });
    
    $this->travelTo(now()->subDays(10), function () {
        // Test something during a given moment...
    });
```

O método `freezeTime` pode ser usado para congelar o horário atual. Da mesma forma, o método `freezeSecond` congela o horário atual mas no início do segundo atual.

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

Como se poderia esperar, todos os métodos discutidos acima são úteis principalmente para testar o comportamento de aplicativos sensíveis ao tempo, como bloquear publicações inativas em um fórum de discussão:

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
