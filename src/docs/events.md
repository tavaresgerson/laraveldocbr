# Eventos

<a name="introduction"></a>
## Introdução

 Os eventos do Laravel proporcionam uma simples implementação de padrões observers, permitindo que você assine e ouça vários eventos ocorridos em sua aplicação. Normalmente, as classes de evento são armazenadas na pasta `app/Events`, enquanto os seus escutadores são armazenados na `app/Listeners`. Não se preocupe caso você não veja essas pastas em sua aplicação, pois eles serão criados para você ao gerar eventos e escutadores usando comandos do consol.

 Os eventos servem como uma excelente maneira de decouple os vários aspectos da sua aplicação, pois um único evento pode ter múltiplos ouvintes que não dependem uns dos outros. Por exemplo, você pode querer enviar uma notificação do Slack para seu usuário a cada vez que uma encomenda for expedida. Em vez de acoplar o código de processamento de ordem ao código de notificação no Slack, você pode criar um `App\Events\OrderShipped` evento que possa ser recebido por um ouvintes e utilizado para enviar uma notificação do Slack.

<a name="generating-events-and-listeners"></a>
## Gerando eventos e ouvinte

 Para gerar eventos e ouvinte de maneira rápida é possível utilizar os comandos do make:event e make:listener da Artisan:

```shell
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

 Por conveniência, você também pode invocar os comandos Artisan `make:event` e `make:listener` sem argumentos adicionais. Quando você fizer isso, o Laravel solicitará automaticamente o nome da classe e, ao criar um listener, qual evento ele deve ouvir:

```shell
php artisan make:event

php artisan make:listener
```

<a name="registering-events-and-listeners"></a>
## Registo de eventos e leitores

<a name="event-discovery"></a>
### Descoberta de eventos

 Por padrão, o Laravel irá encontrar e registrar os seus eventos ouscutadores automaticamente analisando a sua aplicação na pasta "Listeners". Quando o Laravel encontra uma qualquer método de escuta que comece com "handle" ou "__invoke", o Laravel irá registrar esses métodos como escutas para o evento especificado no tipo do sinalizador do método:

```php
    use App\Events\PodcastProcessed;

    class SendPodcastNotification
    {
        /**
         * Handle the given event.
         */
        public function handle(PodcastProcessed $event): void
        {
            // ...
        }
    }
```

 Se você planeja armazenar seus ouvinte em um diretório diferente ou em vários diretórios, poderá instruir o Laravel a procurar esses diretórios usando o método `withEvents` no arquivo `bootstrap/app.php` do seu aplicativo:

```php
    ->withEvents(discover: [
        __DIR__.'/../app/Domain/Listeners',
    ])
```

 O comando `event:list` pode ser usado para mostrar todos os eventos registrados na aplicação:

```shell
php artisan event:list
```

<a name="event-discovery-in-production"></a>
#### Descoberta de eventos em produção

 Para acelerar seu aplicativo, você deve armazenar em cache um manifesto de todos os controladores do aplicativo usando os comandos `optimize` ou `event:cache`. Tipicamente, esse comando deve ser executado como parte do processo [de implantação da sua aplicação](/docs/deployment#optimization). Esse manifesto será usado pelo framework para acelerar o processo de registro de eventos. O comando `event:clear` pode ser utilizado para destruir o cache de eventos.

<a name="manually-registering-events"></a>
### Registo manual de eventos

 Usando a facade Event, você pode registrar eventos e seus respectivos ouvinte manualmente no método boot de seu aplicativo AppServiceProvider:

```php
    use App\Domain\Orders\Events\PodcastProcessed;
    use App\Domain\Orders\Listeners\SendPodcastNotification;
    use Illuminate\Support\Facades\Event;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(
            PodcastProcessed::class,
            SendPodcastNotification::class,
        );
    }
```

 O comando `event:list` pode ser usado para listar todos os atalhos registrados em seu aplicativo:

```shell
php artisan event:list
```

<a name="closure-listeners"></a>
### Ouvidores de closure

 Normalmente, os eventos são definidos como classes; contudo, você pode também registrar manualmente eventos baseados em closures no método `boot` do `AppServiceProvider` do aplicativo:

```php
    use App\Events\PodcastProcessed;
    use Illuminate\Support\Facades\Event;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(function (PodcastProcessed $event) {
            // ...
        });
    }
```

<a name="queuable-anonymous-event-listeners"></a>
#### Escutadores de eventos anónimos com fila

 Ao registrar um ouvinte de eventos baseados em closure, você pode envolver o encerramento do ouvinte dentro da função `Illuminate\Events\queueable` para instruir o Laravel a executar o ouvinte usando [filas](/docs/queues):

```php
    use App\Events\PodcastProcessed;
    use function Illuminate\Events\queueable;
    use Illuminate\Support\Facades\Event;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(queueable(function (PodcastProcessed $event) {
            // ...
        }));
    }
```

 Tal como acontece com os trabalhos em fila, você pode usar os métodos `onConnection`, `onQueue` e `delay` para personalizar a execução do ouvinte em fila.

```php
    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    })->onConnection('redis')->onQueue('podcasts')->delay(now()->addSeconds(10)));
```

 Se pretender gerir falhas de um escutador agendado anónimo, pode fornecer uma função anonima para a méthode `catch`, ao definir o escutador `queueable`. Esta função receberá a instância do evento e a instância `Throwable` que causou a falha do escutador:

```php
    use App\Events\PodcastProcessed;
    use function Illuminate\Events\queueable;
    use Illuminate\Support\Facades\Event;
    use Throwable;

    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    })->catch(function (PodcastProcessed $event, Throwable $e) {
        // The queued listener failed...
    }));
```

<a name="wildcard-event-listeners"></a>
#### Escutadores de eventos com caractere wildcard

 É também possível registrar ouvinte usando o caractere `*` como parâmetro de substituição, permitindo que recebam vários eventos no mesmo ouvinte. Os ouvintes de substituição recebem o nome do evento como primeiro argumento e todo o array de dados do evento como segundo argumento:

```php
    Event::listen('event.*', function (string $eventName, array $data) {
        // ...
    });
```

<a name="defining-events"></a>
## Eventos que definem

 Uma classe de evento é essencialmente um recipiente de dados que guarda as informações relacionadas ao evento. Suponhamos que um evento `App\Events\OrderShipped` receba um objeto do [Eloquent ORM] (ORM/Entidade Inteligente):

```php
    <?php

    namespace App\Events;

    use App\Models\Order;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Foundation\Events\Dispatchable;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped
    {
        use Dispatchable, InteractsWithSockets, SerializesModels;

        /**
         * Create a new event instance.
         */
        public function __construct(
            public Order $order,
        ) {}
    }
```

 Como você pode ver, essa classe de evento não contém nenhuma lógica. Ela é um recipiente para a instância `App\Models\Order` que foi comprada. O traço `SerializesModels`, usado pelo evento, graciosamente serializa qualquer modelo Eloquent se o objeto do evento for serializado usando a função `serialize` do PHP, como no caso da utilização de [escutadores agendados](#escutadores-agendados).

<a name="defining-listeners"></a>
## Definindo Audiência

 Em seguida, vamos dar uma olhada no escutador do nosso exemplo de evento. Os escutadores recebem instâncias de eventos em sua `handle` método. O comando da Artisan `make:listener`, quando invocado com a opção `--event`, importará automaticamente as classes de eventos adequadas e indicarão o tipo do evento no método `handle`. Dentro do método `handle`, você poderá executar quaisquer ações necessárias para responder ao evento:

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;

    class SendShipmentNotification
    {
        /**
         * Create the event listener.
         */
        public function __construct()
        {
            // ...
        }

        /**
         * Handle the event.
         */
        public function handle(OrderShipped $event): void
        {
            // Access the order using $event->order...
        }
    }
```

 > [!NOTA]
 [contêiner de serviço](/docs/container), para as dependências serem injetadas automaticamente.

<a name="stopping-the-propagation-of-an-event"></a>
#### Interromper a propagação de um evento

 Por vezes, poderá desejar interromper a propagação de um evento para outros leitores. Pode fazê-lo retornando `false` da função `handle` do seu leitor.

<a name="queued-event-listeners"></a>
## Escutadores de eventos em fila

 Ouvir em fila é benéfico se o usuário precisar executar uma tarefa lenta, como enviar um e-mail ou fazer um pedido HTTP. Antes de usar os ouvintes em fila, configure a fila e inicie um assistente de fila no servidor ou no ambiente de desenvolvimento local.

 Para especificar que um listen devem ser priorizados em fila de espera, adicione a interface `ShouldQueue` à classe do listener. Os listeners gerados pelos comandos Artisan `make:listener` já importam essa interface no namespace atual para que você possa usá-la imediatamente:

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        // ...
    }
```

 É isso! Agora, quando um evento gerenciado por este ouvinte for enviado, o ouvinte será automaticamente agendado pelo gerente de eventos usando o [sistema de fila](https://laravel.com/docs/queues). Se nenhuma exceção for lançada quando o ouvinte for executado na fila, o trabalho pendente será automaticamente excluído depois que tiver sido concluído o processamento.

<a name="customizing-the-queue-connection-queue-name"></a>
#### Personalizar a Conexão da Fila, Nome e Demora

 Se quiser personalizar a ligação à fila, o nome da fila ou o tempo de atraso na execução de um evento com uma classe de escuta de eventos, você pode definir as propriedades `$connection`, `$queue` ou `$delay`.

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        /**
         * The name of the connection the job should be sent to.
         *
         * @var string|null
         */
        public $connection = 'sqs';

        /**
         * The name of the queue the job should be sent to.
         *
         * @var string|null
         */
        public $queue = 'listeners';

        /**
         * The time (seconds) before the job should be processed.
         *
         * @var int
         */
        public $delay = 60;
    }
```

 Se você preferir definir a conexão da fila do ouvinte, o nome da fila ou o tempo de atraso na execução, poderá definir os métodos `viaConnection`, `viaQueue` ou `withDelay` no ouvinte:

```php
    /**
     * Get the name of the listener's queue connection.
     */
    public function viaConnection(): string
    {
        return 'sqs';
    }

    /**
     * Get the name of the listener's queue.
     */
    public function viaQueue(): string
    {
        return 'listeners';
    }

    /**
     * Get the number of seconds before the job should be processed.
     */
    public function withDelay(OrderShipped $event): int
    {
        return $event->highPriority ? 0 : 60;
    }
```

<a name="conditionally-queueing-listeners"></a>
#### Participantes em fila condicional

 Às vezes, você pode precisar determinar se um listener deve ser agendado com base em alguns dados disponíveis apenas na execução. Para isso, uma método `shouldQueue` pode ser adicionado para determinar se o listener deve ser agendado. Se o método `shouldQueue` retornar `false`, o listener não será agendado:

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderCreated;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class RewardGiftCard implements ShouldQueue
    {
        /**
         * Reward a gift card to the customer.
         */
        public function handle(OrderCreated $event): void
        {
            // ...
        }

        /**
         * Determine whether the listener should be queued.
         */
        public function shouldQueue(OrderCreated $event): bool
        {
            return $event->order->subtotal >= 5000;
        }
    }
```

<a name="manually-interacting-with-the-queue"></a>
### Interação manual com a fila

 Se você precisar acessar manualmente os métodos `delete` e `release` da fila subjacente do listener, poderá fazer isso usando o traço `Illuminate\Queue\InteractsWithQueue`. Esse traço é importado por padrão em listeners gerados e fornece acesso a esses métodos:

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        use InteractsWithQueue;

        /**
         * Handle the event.
         */
        public function handle(OrderShipped $event): void
        {
            if (true) {
                $this->release(30);
            }
        }
    }
```

<a name="queued-event-listeners-and-database-transactions"></a>
### Escutadores de eventos em fila e transações de banco de dados

 Quando os eventos agendados são enviados para a execução dentro de transações do banco de dados, estes podem ser processados pela fila antes da transação do banco de dados ter sido confirmada. Neste caso, quaisquer alterações efetuadas nos modelos ou registos no banco de dados durante a transação do banco de dados podem ainda não ser refletidas na base de dados. Além disso, os modelos ou registos criados dentro da transação do banco de dados poderão não existir na base de dados. Se o seu evento agendado depender destes modelos, poderão ocorrer erros inesperados quando o trabalho que envia o evento agendado a ser executado é processado.

 Se a opção de configuração do comando de conclusão da conexão da fila estiver definida como `false`, ainda é possível indicar que um determinado listening de fila deve ser distribuído após todas as transações de banco de dados em aberto terem sido concluídas implementando a interface `ShouldHandleEventsAfterCommit` na classe do listening:

```php
    <?php

    namespace App\Listeners;

    use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;

    class SendShipmentNotification implements ShouldQueue, ShouldHandleEventsAfterCommit
    {
        use InteractsWithQueue;
    }
```

 > [!ATENÇÃO]
 [Tarefas agendadas e transações de banco de dados](/docs/queues#jobs-and-database-transactions).

<a name="handling-failed-jobs"></a>
### Gerenciando trabalhos com falha

 Às vezes, os eventos em fila de espera podem falhar. Se o número máximo de tentativas definido para a sua tarefa exceder a capacidade da fila, o método `failed` será chamado no seu ouvinte. O método `failed` recebe uma instância do evento e um `Throwable` que causou a falha:

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;
    use Throwable;

    class SendShipmentNotification implements ShouldQueue
    {
        use InteractsWithQueue;

        /**
         * Handle the event.
         */
        public function handle(OrderShipped $event): void
        {
            // ...
        }

        /**
         * Handle a job failure.
         */
        public function failed(OrderShipped $event, Throwable $exception): void
        {
            // ...
        }
    }
```

<a name="specifying-queued-listener-maximum-attempts"></a>
#### Especificando o número máximo de tentativas do escuta em fila

 Se um de seus ouvintes na fila estiver encontrando algum erro, é provável que você não queira que ele tente novamente indefinidamente. Portanto, o Laravel oferece várias maneiras de especificar quantas vezes ou por quanto tempo pode ser tentado um ouvinte.

 Você pode definir uma propriedade `$tries` em sua classe de escuta para especificar quantas vezes o escutador pode ser tentado antes que ele seja considerado falhado:

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        use InteractsWithQueue;

        /**
         * The number of times the queued listener may be attempted.
         *
         * @var int
         */
        public $tries = 5;
    }
```

 Como alternativa para definir o número de vezes que um listener é tentado antes de falhar, você pode definir a hora em que o listener não será mais tentado. Isso permite que os testes sejam realizados quantas vezes forem necessários dentro do prazo. Para definir a hora até a qual o listener não deve mais ser tentado, crie uma método `retryUntil` em sua classe de listener. Esse método deverá retornar uma instância `DateTime`:

```php
    use DateTime;

    /**
     * Determine the time at which the listener should timeout.
     */
    public function retryUntil(): DateTime
    {
        return now()->addMinutes(5);
    }
```

<a name="dispatching-events"></a>
## Despachando eventos

 Para enviar um evento, você pode chamar o método estático `dispatch`, no evento. Este método é disponibilizado ao evento pela trajetória `Illuminate\Foundation\Events\Dispatchable`. Quaisquer argumentos passados para o método `dispatch` serão passados para o construtor do evento:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Events\OrderShipped;
    use App\Http\Controllers\Controller;
    use App\Models\Order;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class OrderShipmentController extends Controller
    {
        /**
         * Ship the given order.
         */
        public function store(Request $request): RedirectResponse
        {
            $order = Order::findOrFail($request->order_id);

            // Order shipment logic...

            OrderShipped::dispatch($order);

            return redirect('/orders');
        }
    }
```

 Se você quiser enviar condicionalmente um evento, poderá utilizar os métodos `dispatchIf` e `dispatchUnless`:

```php
    OrderShipped::dispatchIf($condition, $order);

    OrderShipped::dispatchUnless($condition, $order);
```

 > [!AVISO]
 [Ajuda incorporada para testes](#testing) facilita muito o processo.

<a name="dispatching-events-after-database-transactions"></a>
### Enviando eventos após transações de banco de dados

 Às vezes, você pode querer instruir o Laravel para despachar um evento somente após a transação ativa no banco de dados ser confirmada. Para fazer isso, você pode implementar a interface `ShouldDispatchAfterCommit` na classe do evento.

 Essa interface indica ao Laravel que não envia o evento até que a transação atual do banco de dados seja concluída. Se a transação falhar, o evento será descartado. Se nenhuma transação estiver em andamento quando o evento for enviado, ele é enviado imediatamente:

```php
    <?php

    namespace App\Events;

    use App\Models\Order;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
    use Illuminate\Foundation\Events\Dispatchable;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped implements ShouldDispatchAfterCommit
    {
        use Dispatchable, InteractsWithSockets, SerializesModels;

        /**
         * Create a new event instance.
         */
        public function __construct(
            public Order $order,
        ) {}
    }
```

<a name="event-subscribers"></a>
## Assinantes de eventos

<a name="writing-event-subscribers"></a>
### Inscrições de eventos Escritores

 Os assinantes de evento são classes que podem se inscrever em múltiplos eventos dentro da própria classe assinante, permitindo definir vários manipuladores de evento dentro de uma única classe. O método `subscribe` do assinante deve ser chamado com uma instância do evento dispatcher. Você pode chamar o método `listen` no dispatcher passado para registrar os ouvintes de eventos:

```php
    <?php

    namespace App\Listeners;

    use Illuminate\Auth\Events\Login;
    use Illuminate\Auth\Events\Logout;
    use Illuminate\Events\Dispatcher;

    class UserEventSubscriber
    {
        /**
         * Handle user login events.
         */
        public function handleUserLogin(Login $event): void {}

        /**
         * Handle user logout events.
         */
        public function handleUserLogout(Logout $event): void {}

        /**
         * Register the listeners for the subscriber.
         */
        public function subscribe(Dispatcher $events): void
        {
            $events->listen(
                Login::class,
                [UserEventSubscriber::class, 'handleUserLogin']
            );

            $events->listen(
                Logout::class,
                [UserEventSubscriber::class, 'handleUserLogout']
            );
        }
    }
```

 Se os métodos do event listener estiverem definidos no próprio assinante, poderá ser mais conveniente retornar um array de eventos e nomes dos métodos na sua `subscribe` metodo. O Laravel irá automaticamente determinar o nome da classe do assinante ao registrar os event listeners:

```php
    <?php

    namespace App\Listeners;

    use Illuminate\Auth\Events\Login;
    use Illuminate\Auth\Events\Logout;
    use Illuminate\Events\Dispatcher;

    class UserEventSubscriber
    {
        /**
         * Handle user login events.
         */
        public function handleUserLogin(Login $event): void {}

        /**
         * Handle user logout events.
         */
        public function handleUserLogout(Logout $event): void {}

        /**
         * Register the listeners for the subscriber.
         *
         * @return array<string, string>
         */
        public function subscribe(Dispatcher $events): array
        {
            return [
                Login::class => 'handleUserLogin',
                Logout::class => 'handleUserLogout',
            ];
        }
    }
```

<a name="registering-event-subscribers"></a>
### Inscrição de assinantes do evento

 Depois de escrever o assinante, você está pronto para registrá-lo com o dispatcher do evento. Você pode registrar os assinantes usando o método `subscribe` da faca `Event`. Tipicamente, isso deve ser feito dentro do método `boot` do seu `AppServiceProvider`:

```php
    <?php

    namespace App\Providers;

    use App\Listeners\UserEventSubscriber;
    use Illuminate\Support\Facades\Event;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            Event::subscribe(UserEventSubscriber::class);
        }
    }
```

<a name="testing"></a>
## Teste

 Ao testar um código que dispache eventos, você pode querer instruir o Laravel para não executar os controladores do evento, já que o código dos mesmos pode ser testado diretamente e separadamente do código que dispacha o evento correspondente. Claro está que, para testar o próprio controlador, é possível instanciá-lo e chamar a metódia `handle` diretamente no seu teste.

 Usando o método `fake` da facade `Event`, você pode impedir que os ouvinte executem suas ações, e então, testar quais eventos foram enviados pela sua aplicação usando as métricas `assertDispatched`, `assertNotDispatched` e `assertNothingDispatched`:

```php tab=Pest
<?php

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;

test('orders can be shipped', function () {
    Event::fake();

    // Perform order shipping...

    // Assert that an event was dispatched...
    Event::assertDispatched(OrderShipped::class);

    // Assert an event was dispatched twice...
    Event::assertDispatched(OrderShipped::class, 2);

    // Assert an event was not dispatched...
    Event::assertNotDispatched(OrderFailedToShip::class);

    // Assert that no events were dispatched...
    Event::assertNothingDispatched();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test order shipping.
     */
    public function test_orders_can_be_shipped(): void
    {
        Event::fake();

        // Perform order shipping...

        // Assert that an event was dispatched...
        Event::assertDispatched(OrderShipped::class);

        // Assert an event was dispatched twice...
        Event::assertDispatched(OrderShipped::class, 2);

        // Assert an event was not dispatched...
        Event::assertNotDispatched(OrderFailedToShip::class);

        // Assert that no events were dispatched...
        Event::assertNothingDispatched();
    }
}
```

 Pode ser passada uma referência às funções `assertDispatched` ou `assertNotDispatched` para garantir que foi despachado um evento que passa um determinado "teste de veracidade". Se tiver sido despachado pelo menos um evento que passe no teste dado, a declaração é bem-sucedida:

```php
    Event::assertDispatched(function (OrderShipped $event) use ($order) {
        return $event->order->id === $order->id;
    });
```

 Se você gostaria simplesmente de afirmar que um evento está ouvindo em um determinado evento, pode usar o método `assertListening`:

```php
    Event::assertListening(
        OrderShipped::class,
        SendShipmentNotification::class
    );
```

 > [Aviso]
 > Depois de chamar o método `Event::fake()`, nenhum dispositivo será executado. Assim, se os testes utilizarem fatorias de modelo que dependem de eventos, tais como a criação de um UUID durante o evento "criando" do modelo, você deve chamar `Event::fake()` **depois** de usar suas fábricas.

<a name="faking-a-subset-of-events"></a>
### Fazendo uma subconjuntos de eventos

 Se você quer falsificar apenas um conjunto de eventos específico, poderá passá-los para o método `fake` ou `fakeFor`:

```php tab=Pest
test('orders can be processed', function () {
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // Other events are dispatched as normal...
    $order->update([...]);
});
```

```php tab=PHPUnit
/**
 * Test order process.
 */
public function test_orders_can_be_processed(): void
{
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // Other events are dispatched as normal...
    $order->update([...]);
}
```

 É possível falsificar todos os eventos, exceto um conjunto de eventos especificados usando o método `except`:

```php
    Event::fake()->except([
        OrderCreated::class,
    ]);
```

<a name="scoped-event-fakes"></a>
### Eventos com escopo falsificados

 Se você quer apenas fingir os eventos de um trecho do teste, pode usar o método `fakeFor`:

```php tab=Pest
<?php

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Support\Facades\Event;

test('orders can be processed', function () {
    $order = Event::fakeFor(function () {
        $order = Order::factory()->create();

        Event::assertDispatched(OrderCreated::class);

        return $order;
    });

    // Events are dispatched as normal and observers will run ...
    $order->update([...]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test order process.
     */
    public function test_orders_can_be_processed(): void
    {
        $order = Event::fakeFor(function () {
            $order = Order::factory()->create();

            Event::assertDispatched(OrderCreated::class);

            return $order;
        });

        // Events are dispatched as normal and observers will run ...
        $order->update([...]);
    }
}
```
