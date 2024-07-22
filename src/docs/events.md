# Eventos

<a name="introduction"></a>
## Introdução

Os eventos do Laravel proporcionam uma simples implementação de padrões observers, permitindo que você assine e ouça vários eventos ocorridos em sua aplicação. Normalmente, as classes de evento são armazenadas na pasta `app/Events`, enquanto os seus ouvintes são armazenados na `app/Listeners`. Não se preocupe caso você não veja essas pastas em sua aplicação, pois eles serão criados para você ao gerar eventos e ouvintes usando comandos Artisan no console.

Os eventos servem como uma excelente maneira de desacoplar os vários aspectos da sua aplicação, pois um único evento pode ter múltiplos ouvintes que não dependem uns dos outros. Por exemplo, você pode querer enviar uma notificação do Slack para seu usuário a cada vez que uma encomenda for expedida. Em vez de acoplar o código de processamento de ordem ao código de notificação no Slack, você pode criar um `App\Events\OrderShipped` evento que possa ser recebido por um ouvintes e utilizado para enviar uma notificação do Slack.

<a name="generating-events-and-listeners"></a>
## Gerando eventos e ouvinte

Para gerar eventos e ouvinte de maneira rápida é possível utilizar os comandos: `make:event` e `make:listener` do Artisan:

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
## Registro de eventos e ouvintes

<a name="event-discovery"></a>
### Descoberta de eventos

Por padrão, o Laravel irá encontrar e registrar automaticamente seus ouvintes de eventos escaneando o diretório `Listeners` da sua aplicação. Quando o Laravel encontra qualquer método de classe de ouvinte que comece com `handle` ou `__invoke`, o Laravel registrará esses métodos como ouvintes de eventos para o evento que é sugerido por tipo (type-hint) na assinatura do método:

```php
    use App\Events\PodcastProcessed;

    class SendPodcastNotification
    {
        /**
         * Lidar com o evento determinado.
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
### Registro manual de eventos

Usando a facade `Event`, você pode registrar eventos e seus respectivos ouvinte manualmente no método `boot` de seu aplicativo `AppServiceProvider`:

```php
    use App\Domain\Orders\Events\PodcastProcessed;
    use App\Domain\Orders\Listeners\SendPodcastNotification;
    use Illuminate\Support\Facades\Event;

    /**
     * Inicialize qualquer serviço de aplicativo.
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
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Event::listen(function (PodcastProcessed $event) {
            // ...
        });
    }
```

<a name="queuable-anonymous-event-listeners"></a>
#### Ouvintes de eventos anônimos com fila

Ao registrar um ouvinte de eventos baseados em closure, você pode envolver o closure do ouvinte dentro da função `Illuminate\Events\queueable` para instruir o Laravel a executar o ouvinte usando [filas](/docs/queues):

```php
    use App\Events\PodcastProcessed;
    use function Illuminate\Events\queueable;
    use Illuminate\Support\Facades\Event;

    /**
     * Inicialize qualquer serviço de aplicativo.
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

Se você quiser lidar com falhas anônimas de ouvintes enfileirados, você pode fornecer um closure para o método `catch` enquanto define o ouvinte `queueable`. Este closure receberá a instância do evento e a instância `Throwable` que causou a falha do ouvinte:

```php
    use App\Events\PodcastProcessed;
    use function Illuminate\Events\queueable;
    use Illuminate\Support\Facades\Event;
    use Throwable;

    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    })->catch(function (PodcastProcessed $event, Throwable $e) {
        // O ouvinte na fila falhou...
    }));
```

<a name="wildcard-event-listeners"></a>
#### Ouvintes de eventos com caractere wildcard

É também possível registrar ouvintes usando o caractere `*` como parâmetro de substituição, permitindo que este recebam vários eventos no mesmo ouvinte. Os ouvintes de substituição recebem o nome do evento como primeiro argumento e todo o array de dados do evento como segundo argumento:

```php
    Event::listen('event.*', function (string $eventName, array $data) {
        // ...
    });
```

<a name="defining-events"></a>
## Definindo Eventos

Uma classe de evento é essencialmente um recipiente de dados que guarda as informações relacionadas ao evento. Suponhamos que um evento `App\Events\OrderShipped` receba um objeto do [Eloquent ORM](/docs/eloquent):

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
         * Crie uma nova instância de evento.
         */
        public function __construct(
            public Order $order,
        ) {}
    }
```

Como você pode ver, essa classe de evento não contém nenhuma lógica. Ela é um recipiente para a instância `App\Models\Order` que foi comprada. A trait `SerializesModels`, usado pelo evento, graciosamente serializa qualquer modelo Eloquent se o objeto do evento for serializado usando a função `serialize` do PHP, como no caso da utilização de [ouvintes agendados](#queued-event-listeners).

<a name="defining-listeners"></a>
## Definindo Ouvintes

Em seguida, vamos dar uma olhada no ouvinte do nosso exemplo de evento. Os ouvintes recebem instâncias de eventos em seu método `handle`. O comando do Artisan `make:listener`, quando invocado com a opção `--event`, importará automaticamente as classes de eventos adequadas e indicarão o tipo do evento no método `handle`. Dentro do método `handle`, você poderá executar quaisquer ações necessárias para responder ao evento:

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;

    class SendShipmentNotification
    {
        /**
         * Crie o ouvinte de evento.
         */
        public function __construct()
        {
            // ...
        }

        /**
         * Lidar com o evento.
         */
        public function handle(OrderShipped $event): void
        {
            // Acesse o pedido usando $event->order...
        }
    }
```

::: info NOTA
Seus ouvintes de eventos também podem sugerir qualquer dependência necessária em seus construtores. Todos os ouvintes de eventos são resolvidos através do [container de serviço](/docs/container) do Laravel, portanto as dependências serão injetadas automaticamente.
:::

<a name="stopping-the-propagation-of-an-event"></a>
#### Interromper a propagação de um evento

Por vezes, poderá desejar interromper a propagação de um evento para outros leitores. Pode fazê-lo retornando `false` da função `handle` do seu leitor.

<a name="queued-event-listeners"></a>
## Ouvintes de eventos em fila

Ouvir em fila é benéfico se o usuário precisar executar uma tarefa lenta, como enviar um e-mail ou fazer um pedido HTTP. Antes de usar os ouvintes em fila, configure a fila e inicie um assistente de fila no servidor ou no ambiente de desenvolvimento local.

Para especificar que um ouvinte deve ser priorizado em uma fila de espera, adicione a interface `ShouldQueue` à classe do listener. Os ouvintes gerados pelos comandos Artisan `make:listener` já importam essa interface no namespace atual para que você possa usá-la imediatamente:

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

É isso! Agora, quando um evento gerenciado por este ouvinte for enviado, o ouvinte será automaticamente agendado pelo gerente de eventos usando o [sistema de fila](/docs/queues). Se nenhuma exceção for lançada quando o ouvinte for executado na fila, o trabalho pendente será automaticamente excluído depois que tiver sido concluído o processamento.

<a name="customizing-the-queue-connection-queue-name"></a>
#### Personalizar a Conexão da Fila, Nome e Demora

Se você quiser personalizar a conexão da fila, o nome da fila ou o tempo de atraso da fila de um ouvinte de evento, você pode definir as propriedades `$connection`, `$queue` ou `$delay` em sua classe de ouvinte:

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderShipped;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class SendShipmentNotification implements ShouldQueue
    {
        /**
         * O nome da conexão para a qual o trabalho deve ser enviado.
         *
         * @var string|null
         */
        public $connection = 'sqs';

        /**
         * O nome da fila para a qual o trabalho deve ser enviado.
         *
         * @var string|null
         */
        public $queue = 'listeners';

        /**
         * O tempo (segundos) antes do trabalho ser processado.
         *
         * @var int
         */
        public $delay = 60;
    }
```

Se você preferir definir a conexão da fila do ouvinte, o nome da fila ou o tempo de atraso na execução, poderá definir os métodos `viaConnection`, `viaQueue` ou `withDelay` no ouvinte:

```php
    /**
     * Obtenha o nome da conexão da fila do ouvinte.
     */
    public function viaConnection(): string
    {
        return 'sqs';
    }

    /**
     * Obtenha o nome da fila do ouvinte.
     */
    public function viaQueue(): string
    {
        return 'listeners';
    }

    /**
     * Obtenha o número de segundos antes que o trabalho seja processado.
     */
    public function withDelay(OrderShipped $event): int
    {
        return $event->highPriority ? 0 : 60;
    }
```

<a name="conditionally-queueing-listeners"></a>
#### Enfileiramento condicional de ouvintes

Às vezes, você pode precisar determinar se um listener deve ser agendado com base em alguns dados disponíveis apenas na execução. Para isso, uma método `shouldQueue` pode ser adicionado para determinar se o listener deve ser agendado. Se o método `shouldQueue` retornar `false`, o listener não será agendado:

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderCreated;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class RewardGiftCard implements ShouldQueue
    {
        /**
         * Recompense um vale-presente ao cliente.
         */
        public function handle(OrderCreated $event): void
        {
            // ...
        }

        /**
         * Determine se o ouvinte deve ser colocado na fila.
         */
        public function shouldQueue(OrderCreated $event): bool
        {
            return $event->order->subtotal >= 5000;
        }
    }
```

<a name="manually-interacting-with-the-queue"></a>
### Interação manual com a fila

Se você precisar acessar manualmente os métodos `delete` e `release` da fila subjacente do ouvinte, você poderá fazer isso usando o trait `Illuminate\Queue\InteractsWithQueue`. Esse trait é importado por padrão em ouvintes gerados e fornece acesso a esses métodos:

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
         * Lidar com o evento.
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
### Ouvintes de eventos enfileirados e transações de banco de dados

Quando os eventos agendados são enviados para a execução dentro de transações do banco de dados, estes podem ser processados pela fila antes da transação no banco de dados ter sido confirmada. Neste caso, quaisquer alterações efetuadas nos modelos ou registros no banco de dados durante a transação do banco de dados podem ainda não ser refletidas na base de dados. Além disso, os modelos ou registros criados dentro da transação do banco de dados poderão não existir na base de dados. Se o seu evento agendado depender destes modelos, poderão ocorrer erros inesperados quando o trabalho que envia o evento agendado a ser executado é processado.

Se a opção de configuração do comando de conclusão da conexão da fila estiver definida como `false`, ainda é possível indicar que um determinado ouvinte de fila deve ser distribuído após todas as transações de banco de dados em aberto terem sido concluídas implementando a interface `ShouldHandleEventsAfterCommit` na classe do ouvinte:

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

::: info NOTA
Para saber mais sobre como solucionar esses problemas, consulte a documentação sobre [tarefas enfileiradas e transações de banco de dados](/docs/queues#jobs-and-database-transactions).
:::

<a name="handling-failed-jobs"></a>
### Tratamento de trabalhos com falha

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
         * Lidar com o evento.
         */
        public function handle(OrderShipped $event): void
        {
            // ...
        }

        /**
         * Lidar com uma falha de trabalho.
         */
        public function failed(OrderShipped $event, Throwable $exception): void
        {
            // ...
        }
    }
```

<a name="specifying-queued-listener-maximum-attempts"></a>
#### Especificando o número máximo de tentativas do ouvinte em fila

Se um de seus ouvintes na fila estiver encontrando algum erro, é provável que você não queira que ele tente novamente de forma indefinida. Portanto, o Laravel oferece várias maneiras de especificar quantas vezes ou por quanto tempo um ouvinte pode ser repetido.

Você pode definir uma propriedade `$tries` em sua classe de ouvinte para especificar quantas vezes este pode ser tentado novamente antes que ele seja considerado falhado:

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
         * O número de vezes que o listener enfileirado pode ser tentado.
         *
         * @var int
         */
        public $tries = 5;
    }
```

Como alternativa para definir o número de vezes que um ouvinte é repetido antes de falhar, você pode definir a hora em que o ouvinte não será mais executado. Isso permite que os testes sejam realizados quantas vezes forem necessários dentro do prazo. Para definir a hora até a qual o ouvinte não deve mais ser repetido, crie uma método `retryUntil` em sua classe de ouvinte. Esse método deverá retornar uma instância `DateTime`:

```php
    use DateTime;

    /**
     * Determine o horário em que o ouvinte deve atingir o tempo limite.
     */
    public function retryUntil(): DateTime
    {
        return now()->addMinutes(5);
    }
```

<a name="dispatching-events"></a>
## Despachando eventos

Para enviar um evento, você pode chamar o método estático `dispatch`. Este método é disponibilizado ao evento pela trait `Illuminate\Foundation\Events\Dispatchable`. Quaisquer argumentos passados para o método `dispatch` serão passados para o construtor do evento:

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
         * Envie o pedido determinado.
         */
        public function store(Request $request): RedirectResponse
        {
            $order = Order::findOrFail($request->order_id);

            // Lógica de envio do pedido...

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

::: info NOTA
Ao testar, pode ser útil afirmar que determinados eventos foram despachados sem realmente acionar seus ouvintes. Os [ajudantes de teste integrados](#testing) do Laravel tornam isso muito fácil.
:::

<a name="dispatching-events-after-database-transactions"></a>
### Enviando eventos após transações de banco de dados

Às vezes, você pode querer instruir o Laravel para despachar um evento somente após a transação ativa no banco de dados ser confirmada. Para fazer isso, você pode implementar a interface `ShouldDispatchAfterCommit` na classe do evento.

Esta interface instrui o Laravel a não despachar o evento até que a transação atual do banco de dados seja confirmada. Se a transação falhar, o evento será descartado. Se nenhuma transação de banco de dados estiver em andamento quando o evento for despachado, o evento será despachado imediatamente:

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
         * Crie uma nova instância de evento.
         */
        public function __construct(
            public Order $order,
        ) {}
    }
```

<a name="event-subscribers"></a>
## Assinantes de eventos

<a name="writing-event-subscribers"></a>
### Escrevendo assinantes de eventos

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
         * Lidar com eventos de login do usuário.
         */
        public function handleUserLogin(Login $event): void {}

        /**
         * Lidar com eventos de logout do usuário.
         */
        public function handleUserLogout(Logout $event): void {}

        /**
         * Registre os ouvintes do assinante.
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

Se os métodos do ouvinte de evento estiverem definidos no próprio assinante, poderá ser mais conveniente retornar um array de eventos e nomes dos métodos no seu método `subscribe`. O Laravel irá automaticamente determinar o nome da classe do assinante ao registrar os ouvintes de eventos:

```php
    <?php

    namespace App\Listeners;

    use Illuminate\Auth\Events\Login;
    use Illuminate\Auth\Events\Logout;
    use Illuminate\Events\Dispatcher;

    class UserEventSubscriber
    {
        /**
         * Lidar com eventos de login do usuário.
         */
        public function handleUserLogin(Login $event): void {}

        /**
         * Lidar com eventos de logout do usuário.
         */
        public function handleUserLogout(Logout $event): void {}

        /**
         * Registre os ouvintes do assinante.
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
### Registrando assinantes de eventos

Depois de escrever o assinante, você está pronto para registrá-lo com o despachante de evento. Você pode registrar os assinantes usando o método `subscribe` da facade `Event`. Tipicamente, isso deve ser feito dentro do método `boot` do seu `AppServiceProvider`:

```php
    <?php

    namespace App\Providers;

    use App\Listeners\UserEventSubscriber;
    use Illuminate\Support\Facades\Event;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Inicialize qualquer serviço de aplicativo.
         */
        public function boot(): void
        {
            Event::subscribe(UserEventSubscriber::class);
        }
    }
```

<a name="testing"></a>
## Teste

Ao testar um código que dispache eventos, você pode querer instruir o Laravel para não executar os controladores de eventos, já que o código dos mesmos pode ser testado diretamente e separadamente do código que dispacha o evento correspondente. Claro está que, para testar o próprio controlador, é possível instanciá-lo e chamar o método `handle` diretamente no seu teste.

Usando o método `fake` da facade `Event`, você pode impedir que os ouvinte executem suas ações, e então, testar quais eventos foram enviados pela sua aplicação usando as métricas `assertDispatched`, `assertNotDispatched` e `assertNothingDispatched`:

::: code-group
```php [Pest]
<?php

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;

test('orders can be shipped', function () {
    Event::fake();

    // Realizar envio do pedido...

    // Afirmar que um evento foi despachado...
    Event::assertDispatched(OrderShipped::class);

    // Afirmar que um evento foi despachado duas vezes...
    Event::assertDispatched(OrderShipped::class, 2);

    // Afirmar que um evento não foi despachado...
    Event::assertNotDispatched(OrderFailedToShip::class);

    // Afirme que nenhum evento foi despachado...
    Event::assertNothingDispatched();
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Envio do pedido de teste.
     */
    public function test_orders_can_be_shipped(): void
    {
        Event::fake();

        // Realizar envio do pedido...

        // Afirme que um evento foi despachado...
        Event::assertDispatched(OrderShipped::class);

        // Afirmar que um evento foi despachado duas vezes...
        Event::assertDispatched(OrderShipped::class, 2);

        // Afirmar que um evento não foi despachado...
        Event::assertNotDispatched(OrderFailedToShip::class);

        // Afirme que nenhum evento foi despachado...
        Event::assertNothingDispatched();
    }
}
```
:::

Pode ser passada uma referência às funções `assertDispatched` ou `assertNotDispatched` para garantir que foi despachado um evento que passa num determinado "teste de veracidade". Se tiver sido despachado pelo menos um evento que passe no teste dado, a declaração é bem-sucedida:

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

::: warning ATENÇÃO
Depois de chamar `Event::fake()`, nenhum ouvinte de evento será executado. Portanto, se seus testes usam fábricas de modelos que dependem de eventos, como a criação de um UUID durante o evento `creating` de um modelo, você deve chamar `Event::fake()` **após** usar suas fábricas.
:::

<a name="faking-a-subset-of-events"></a>
### Fingindo um subconjunto de eventos

Se você quer falsificar apenas um conjunto de eventos específico, poderá passá-los para o método `fake` ou `fakeFor`:

::: code-group
```php [Pest]
test('orders can be processed', function () {
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // Outros eventos são despachados normalmente...
    $order->update([...]);
});
```

```php [PHPUnit]
/**
 * Processo de pedido de teste.
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
:::

É possível falsificar todos os eventos, exceto um conjunto de eventos especificados usando o método `except`:

```php
    Event::fake()->except([
        OrderCreated::class,
    ]);
```

<a name="scoped-event-fakes"></a>
### Eventos com escopo falsificado

Se você quer apenas simular os eventos de um trecho do teste, pode usar o método `fakeFor`:

::: code-group
```php [Pest]
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

    // Os eventos são despachados normalmente e os observadores executarão ...
    $order->update([...]);
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Processo de pedido de teste.
     */
    public function test_orders_can_be_processed(): void
    {
        $order = Event::fakeFor(function () {
            $order = Order::factory()->create();

            Event::assertDispatched(OrderCreated::class);

            return $order;
        });

        // Os eventos são despachados normalmente e os observadores executarão ...
        $order->update([...]);
    }
}
```
:::