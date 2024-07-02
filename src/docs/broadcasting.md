# Radiodifusão

<a name="introduction"></a>
## Introdução

 Em muitas aplicações web modernas, os WebSockets são utilizados para implementar interfaces de utilizador em tempo real que se atualizam automaticamente. Normalmente, quando alguns dados são atualizados no servidor, uma mensagem é enviada por meio de uma ligação WebSocket a ser tratada pelo cliente. Os WebSockets proporcionam uma alternativa mais eficiente ao sondar continuamente o servidor da aplicação quanto à alterações dos dados que devem ser refletidas na sua interface gráfica.

 Por exemplo, imagine que seu aplicativo seja capaz de exportar os dados do usuário para um arquivo CSV e enviá-lo por email. No entanto, a criação deste arquivo CSV leva vários minutos, então você opta por criar e enviar o CSV dentro de uma [tarefa agendada](/docs/queues). Quando o CSV tiver sido criado e enviado ao usuário, podemos usar a transmissão de eventos para distribuir um evento `App\Events\UserDataExported` que é recebido pelo nosso JavaScript do aplicativo. Uma vez que o evento é recebido, podemos exibir uma mensagem para o usuário informando que seu CSV foi enviado por email sem que seja necessário atualizar a página.

 Para ajudá-lo a desenvolver esses tipos de recursos, o Laravel facilita a "transmissão" do lado servidor dos [eventos Laravel](/docs/events). Essa transmissão permite que você compartilhe os mesmos nomes e dados entre seu aplicativo Laravel no lado servidor e seu aplicativo JavaScript no lado cliente.

 Os conceitos básicos por trás da transmissão são simples: os clientes se conectam a canais específicos no front-end, enquanto o aplicativo Laravel transmite eventos para esses canais no back-end. Esses eventos podem conter qualquer dado adicional que você deseja disponibilizar ao front-end.

<a name="supported-drivers"></a>
#### Driver suportados

 Por padrão, o Laravel inclui três drivers de transmissão para escolha: [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels) e [Ably](https://ably.com).

 > [!AVISO]
 [eventos e ouvinte](/docs/{{versao}}/events).

<a name="server-side-installation"></a>
## Instalação do servidor

 Para começar a usar o sistema de transmissão de eventos do Laravel, precisamos configurá-lo dentro da aplicação e instalar alguns pacotes.

 A transmissão de eventos é realizada por um driver de transmissão do lado do servidor que transmite seus eventos Laravel para que o Laravel Echo (uma biblioteca JavaScript) os receba no cliente do navegador. Não se preocupe, iremos passar por cada etapa do processo de instalação passo a passo.

<a name="configuration"></a>
### Configuração

 Toda a configuração de transmissão de eventos do aplicativo é armazenada no arquivo de configuração `config/broadcasting.php`. Não se preocupe se este diretório não existir em seu aplicativo; ele será criado quando você executar o comando Artisan `install:broadcasting`.

 O Laravel suporta vários dispositivos de transmissão na caixa: [Laravel Reverb](/docs/reverb), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com) e um driver `log` para desenvolvimento e depuração locais. Além disso, o Laravel inclui um driver `null`, que permite desativar a transmissão durante testes. Um exemplo de configuração está incluído para cada um desses drivers no arquivo de configuração `config/broadcasting.php`.

<a name="installation"></a>
#### Instalação

 Por padrão, a transmissão não está ativada em novos aplicativos do Laravel. Você pode ativar a transmissão usando o comando Artesão `install:broadcasting`:

```shell
php artisan install:broadcasting
```

 O comando `install:broadcasting` criará o arquivo de configuração `config/broadcasting.php`. Além disso, o comando criará o arquivo `routes/channels.php`, onde você pode registrar as rotas e os retornos da autorização do seu aplicativo para transmissão.

<a name="queue-configuration"></a>
#### Configuração da fila

 Antes de transmitir quaisquer eventos, você deve primeiro configurar e executar um [trabalhador de fila](/docs/queues). Todas as transmissões de evento são realizadas por meio de tarefas em fila para que o tempo de resposta do seu aplicativo não seja afetado seriamente por eventos sendo transmitidos.

<a name="reverb"></a>
### Eco

 Ao executar o comando `install:broadcasting`, você será solicitado a instalar [Laravel Reverb](/docs/reverb). Claro que você também poderá instalar o Reverb manualmente usando o gerenciador de pacotes Composer. Uma vez que o Reverb está atualmente em versão beta, será necessário instalar explicitamente a versão beta:

```sh
composer require laravel/reverb:@beta
```

 Quando o pacote estiver instalado, você poderá executar o comando de instalação do Reverb para publicar a configuração, adicionar as variáveis ambiente necessárias e habilitar a transmissão de eventos em sua aplicação:

```sh
php artisan reverb:install
```

 Pode encontrar instruções de instalação e utilização detalhadas do Reverb na [documentação do Reverb] (http://docs.assembla.com/wiki2/display/REVERB/Reverb+Documentation).

<a name="pusher-channels"></a>
### Canais de propaganda

 Se você planeja transmitir seus eventos usando o [Pusher Channels](https://pusher.com/channels), você deve instalar o Pusher Channels PHP SDK através do gerenciador de pacotes Composer:

```shell
composer require pusher/pusher-php-server
```

 Em seguida, você deve configurar suas credenciais do Pusher Channels no arquivo de configuração `config/broadcasting.php`. Uma configuração de exemplo para o Pusher Channels já está incluída nesse arquivo, permitindo especificar rapidamente sua chave, segredo e ID da aplicação. Normalmente, você deve configurar suas credenciais do Pusher Channels no arquivo `.env` do seu aplicativo:

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"
```

 A configuração do `pusher` no arquivo `config/broadcasting.php` permite também que você especifique `opções` adicionais que são suportadas pelo Canal, como por exemplo o Cluster.

 Em seguida, defina a variável de ambiente `BROADCAST_CONNECTION` para `pusher` no arquivo `.env` da sua aplicação:

```ini
BROADCAST_CONNECTION=pusher
```

 Agora você está pronto para instalar e configurar o [Echo Laravel](#client-side-installation), que receberá os eventos de transmissão no lado do cliente.

<a name="ably"></a>
### Ably

 > [!AVISO]
 Consulte o documento do emissor da Ably para Laravel (https://github.com/ably/laravel-broadcaster)

 Se você pretende transmitir seus eventos usando o [Ably](https://ably.com/), deve instalar o SDK do Ably usando o gerenciador de pacotes Composer:

```shell
composer require ably/ably-php
```

 Em seguida, você deverá configurar suas credenciais da Ably no arquivo de configuração `config/broadcasting.php`. Um exemplo de configuração da Ably já está incluído neste arquivo, permitindo que você especifique sua chave rapidamente. Normalmente, esse valor deve ser definido por meio da [variável de ambiente](/docs/v{{ version }}/configuration#environment-configuration):

```ini
ABLY_KEY=your-ably-key
```

 Depois, defina a variável de ambiente `BROADCAST_CONNECTION` em `ably` no arquivo `.env` do seu aplicativo:

```ini
BROADCAST_CONNECTION=ably
```

 Finalmente você estará pronto para instalar e configurar o [Laravel Echo](/#client-side-installation), que irá receber os eventos transmitidos no lado do cliente.

<a name="client-side-installation"></a>
## Instalação no lado do cliente

<a name="client-reverb"></a>
### Efeito reverberação

 [Laravel Echo](https://github.com/laravel/echo) é uma biblioteca JavaScript que facilita a assinatura de canais e o monitoramento de eventos transmitidos pelo seu driver de transmissão no lado servidor. Você pode instalar o Echo através do gerenciador de pacotes NPM. Neste exemplo, também será instalado o pacote `pusher-js`, pois o Reverb utiliza o protocolo Pusher para assinaturas WebSocket, canais e mensagens:

```shell
npm install --save-dev laravel-echo pusher-js
```

 Uma vez que o Echo foi instalado, você está pronto para criar uma nova instância de Echo no JavaScript da sua aplicação. Um ótimo lugar para fazer isso é na parte inferior do arquivo `resources/js/bootstrap.js` incluído com o framework Laravel. Por padrão, uma configuração de exemplo do Echo já está inclusa nesse arquivo - você precisa somente desmarcar a opção e atualizar a opção de configuração "broadcaster" para `reverb`:

```js
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

 Em seguida, você deve compilar os ativos do aplicativo:

```shell
npm run build
```

 > [!AVISO]
 > O transmissor de `reverb` do Laravel Echo requer o laravel-echo v1.16.0+.

<a name="client-pusher-channels"></a>
### Canais do Pusher

 [Laravel Echo](https://github.com/laravel/echo) é uma biblioteca JavaScript que permite inscrever-se em canais e ouvir eventos transmitidos pelo seu driver de transmissão do lado do servidor de forma indolor. Echo também utiliza o pacote NPM `pusher-js` para implementar o protocolo Pusher para assinaturas WebSocket, canais e mensagens.

 O comando Artesiano `install:broadcasting` instala automaticamente os pacotes `laravel-echo` e `pusher-js`, no entanto, você pode também instalá-los manualmente através do NPM:

```shell
npm install --save-dev laravel-echo pusher-js
```

 Depois que o Echo estiver instalado, você estará pronto para criar uma nova instância do Echo em seu aplicativo JavaScript. O comando `install:broadcasting` cria um arquivo de configuração do Echo em `resources/js/echo.js`. Porém, a configuração padrão nesse arquivo é pensada para o Laravel Reverb. Você poderá copiar a configuração abaixo para passar sua própria configuração para Pusher:

```js
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true
});
```

 Em seguida, você deve definir os valores apropriados para as variáveis de ambiente Pusher no arquivo `.env` da sua aplicação. Se essas variáveis ainda não existirem em seu arquivo `.env`, você deve adicioná-las:

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

 Depois de ter ajustado a configuração do Echo de acordo com as necessidades da sua aplicação, pode compilar os ativos da sua aplicação:

```shell
npm run build
```

 > [!ATENÇÃO]
 [Vários idiomas](/docs/vite).

<a name="using-an-existing-client-instance"></a>
#### Usando uma instância de cliente existente

 Se você já tiver uma instância do cliente Pusher Channels pré-configurada que gostaria de usar o Echo, poderá passá-la para ele por meio da opção de configuração `client`:

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const options = {
    broadcaster: 'pusher',
    key: 'your-pusher-channels-key'
}

window.Echo = new Echo({
    ...options,
    client: new Pusher(options.key, options)
});
```

<a name="client-ably"></a>
### A Ably

 > [!ATENÇÃO]
 [confira a documentação do emissor de Laravel do Ably](https://github.com/ably/laravel-broadcaster).

 O [Laravel Echo](https://github.com/laravel/echo) é uma biblioteca JavaScript que simplifica a assinatura de canais e a escuta de eventos transmitidos pelo seu motor de transmissão do lado servidor. O Echo também aproveita o pacote NPM `pusher-js` para implementar o protocolo Pusher para assinaturas WebSocket, canais e mensagens.

 O comando `Artisan install:broadcasting` instala automaticamente os pacotes `laravel-echo` e `pusher-js`; no entanto, é possível instalar esses pacotes manualmente através do NPM.

```shell
npm install --save-dev laravel-echo pusher-js
```

 **Antes de seguir em frente, você deve habilitar o suporte ao protocolo Pusher em suas configurações da aplicação do Ably. Você pode ativar essa funcionalidade na seção "Configurações do adaptador de protocolos" do painel de configuração da sua aplicação do Ably**

 Depois de instalado, você está pronto para criar uma nova instância do Echo no JavaScript da sua aplicação. O comando `install:broadcasting` cria um arquivo de configuração do Echo em `resources/js/echo.js`. Porém, a configuração padrão nesse arquvo é projetada para o Laravel Reverb. Você pode copiar a configuração abaixo para migrar sua configuração para a Ably:

```js
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    wsHost: 'realtime-pusher.ably.io',
    wsPort: 443,
    disableStats: true,
    encrypted: true,
});
```

 Você pode ter notado que nossa configuração do Ably Echo faz referência a uma variável de ambiente `VITE_ABLY_PUBLIC_KEY`. Esse valor deve ser sua chave pública da Ably. Sua chave pública é a parte da sua chave da Ably que aparece antes do sinal de `:`.

 Depois de ajustar as configurações do Echo de acordo com suas necessidades, você pode compilar os ativos da sua aplicação:

```shell
npm run dev
```

 > [!ATENÇÃO]
 [ Você quer dizer "rápido"? (](/docs/{{ version }} /vite)).

<a name="concept-overview"></a>
## Visão Geral de Conceitos

 O transmissão de eventos do Laravel permite que você transmita seus eventos do lado servidor para sua aplicação em JavaScript no lado do cliente usando uma abordagem baseada em driver para WebSockets. Atualmente, o Laravel vem com os drivers [Pusher Channels](https://pusher.com/channels) e [Ably](https://ably.com). Os eventos podem ser facilmente consumidos no lado do cliente usando o pacote JavaScript [Laravel Echo](#client-side-instalação).

 Os eventos são transmitidos através de "canais". Podem ser especificados como públicos ou privados. Qualquer visitante da aplicação pode subscrever um canal público sem qualquer autenticação ou autorização; no entanto, para se poder inscrever num canal privado, é necessário que o utilizador esteja autenticado e autorizado a escutar esse canal.

<a name="using-example-application"></a>
### Usando um aplicativo de exemplo

 Antes de mergulharmos em cada componente da transmissão de um evento, vamos fazer uma visão geral utilizando uma loja de comércio eletrónico como exemplo.

 No nosso aplicativo, assumamos que temos uma página que permite aos utilizadores consultarem o estado de envio das suas encomendas. Assumimos também que é disparado um evento `OrderShipmentStatusUpdated` aquando da conclusão do processamento de atualizações do estado de envio da aplicação:

```php
    use App\Events\OrderShipmentStatusUpdated;

    OrderShipmentStatusUpdated::dispatch($order);
```

<a name="the-shouldbroadcast-interface"></a>
#### A interface `ShouldBroadcast`

 Quando um usuário está visualizando uma de suas encomendas, não queremos que ele tenha que recarregar a página para ver as atualizações do status. Em vez disso, precisamos transmitir as atualizações da aplicação quando forem criadas. Portanto, devemos marcar o evento `OrderShipmentStatusUpdated` com a interface `ShouldBroadcast`. Isto instrui Laravel a transmitir o evento quando ele é acionado:

```php
    <?php

    namespace App\Events;

    use App\Models\Order;
    use Illuminate\Broadcasting\Channel;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Broadcasting\PresenceChannel;
    use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
    use Illuminate\Queue\SerializesModels;

    class OrderShipmentStatusUpdated implements ShouldBroadcast
    {
        /**
         * The order instance.
         *
         * @var \App\Models\Order
         */
        public $order;
    }
```

 A interface `ShouldBroadcast` requer que o nosso evento defina uma método `broadcastOn`. Este método é responsável por retornar os canais em que o evento deve ser transmitido. Uma stub vazia deste método já está definida nas classes de eventos geradas, então só precisamos preencher seus detalhes. Queremos apenas que o criador da ordem possa ver atualizações do status, por isso transmitiremos o evento em um canal privado associado à ordem:

```php
    use Illuminate\Broadcasting\Channel;
    use Illuminate\Broadcasting\PrivateChannel;

    /**
     * Get the channel the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new PrivateChannel('orders.'.$this->order->id);
    }
```

 Se você desejar que o evento seja transmitido em vários canais, poderá devolver um `array`:

```php
    use Illuminate\Broadcasting\PrivateChannel;

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('orders.'.$this->order->id),
            // ...
        ];
    }
```

<a name="example-application-authorizing-channels"></a>
#### Canal de autorização

 Lembre-se de que os usuários precisam ser autorizados para ouvir em canais privados. Podemos definir nossas regras de autorização do canal no arquivo `routes/channels.php` da aplicação. Nesse exemplo, precisamos verificar se o usuário que está tentando ouvir no canal privado `orders.1` é realmente o criador da ordem:

```php
    use App\Models\Order;
    use App\Models\User;

    Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
        return $user->id === Order::findOrNew($orderId)->user_id;
    });
```

 O método `channel` aceita dois argumentos: o nome do canal e um callback que retorna `true` ou `false`, indicando se o usuário está autorizado a escutar no canal.

 Todos os chamadas de volta de autorização recebem o usuário atualmente autenticado como primeiro argumento e quaisquer parâmetros com barra obstrutiva adicionais, como argumentos subsequentes. Nesse exemplo, estamos usando a sinalização "{orderId}" para indicar que a porção "ID" do nome de canal é um wildcard.

<a name="listening-for-event-broadcasts"></a>
#### Escutar transmissões de eventos

 Em seguida, resta apenas ouvir o evento em nosso aplicativo JavaScript. Podemos fazer isso usando [Echo do Laravel] (#client-side-installation). Primeiro, usar o método `private` para assinar no canal privado. Então, podemos usar o método `listen` para ouvir pelo evento `OrderShipmentStatusUpdated`. Por padrão, todas as propriedades públicas do evento serão incluídas no evento de transmissão:

```js
Echo.private(`orders.${orderId}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order);
    });
```

<a name="defining-broadcast-events"></a>
## Definindo eventos de transmissão

 Para informar o Laravel de que um determinado evento deve ser transmitido, você deve implementar a interface `Illuminate\Contracts\Broadcasting\ShouldBroadcast` na classe do evento. Essa interface já é importada para todas as classes de eventos geradas pelo framework, então você pode adicioná-la facilmente a qualquer um dos seus eventos.

 A interface `ShouldBroadcast` exige a implementação de um único método: `broadcastOn`. O método `broadcastOn` deve retornar um canal ou um array de canais no qual o evento deve ser transmitido. Os canais devem ser instâncias do tipo `Channel`, `PrivateChannel` ou `PresenceChannel`. As instâncias do tipo `Channel` representam canais públicos aos quais qualquer usuário pode se inscrever, enquanto que os `PrivateChannels` e `PresenceChannels` representam canais privados, que requerem a autoriazcação dos canais:

```php
    <?php

    namespace App\Events;

    use App\Models\User;
    use Illuminate\Broadcasting\Channel;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Broadcasting\PresenceChannel;
    use Illuminate\Broadcasting\PrivateChannel;
    use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
    use Illuminate\Queue\SerializesModels;

    class ServerCreated implements ShouldBroadcast
    {
        use SerializesModels;

        /**
         * Create a new event instance.
         */
        public function __construct(
            public User $user,
        ) {}

        /**
         * Get the channels the event should broadcast on.
         *
         * @return array<int, \Illuminate\Broadcasting\Channel>
         */
        public function broadcastOn(): array
        {
            return [
                new PrivateChannel('user.'.$this->user->id),
            ];
        }
    }
```

 Após implementar a interface `ShouldBroadcast`, você só precisa [enviar o evento] (/docs/events), como normalmente faria. Uma vez que o evento tenha sido enviado, um [trabalho agendado] (/docs/queues) irá transmitir automaticamente o evento usando seu driver de transmissão especificado.

<a name="broadcast-name"></a>
### Transmissão de nomes

 Por padrão, o Laravel transmite o evento usando o nome da classe do evento. No entanto, você pode personalizar o nome de transmissão definindo uma método `broadcastAs` no evento:

```php
    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'server.created';
    }
```

 Se você personalizar o nome da transmissão usando o método `broadcastAs`, você deve registrar seu ouvinte com um caractere `.` inicial. Isso instruirá o Echo a não antepor ao evento o namespace do aplicativo:

```js
    .listen('.server.created', function (e) {
        ....
    });
```

<a name="broadcast-data"></a>
### Dados de transmissão

 Quando um evento é transmitido, todas as suas propriedades `public` são automaticamente serializadas e transmitidas como o conteúdo do evento. Isso permite que você acesse qualquer dado público de seu aplicativo JavaScript. Assim, por exemplo, se seu evento tiver uma única propriedade pública `$user` que contenha um modelo Eloquent, a transmissão do evento seria:

```json
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

 No entanto, se pretender um maior controlo sobre o conteúdo do evento transmitido, poderá adicionar a uma `broadcastWith` método ao seu evento. Este método deverá devolver uma matriz com os dados que pretende transmitir como conteúdo do evento:

```php
    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return ['id' => $this->user->id];
    }
```

<a name="broadcast-queue"></a>
### Fila de transmissão

 Por padrão, cada evento de transmissão é colocado na fila padrão para a conexão de fila padrão especificada no seu arquivo de configuração `queue.php`. Você pode personalizar a conexão e o nome usados pelo broadcaster definindo as propriedades `connection` e `queue` em sua classe de evento:

```php
    /**
     * The name of the queue connection to use when broadcasting the event.
     *
     * @var string
     */
    public $connection = 'redis';

    /**
     * The name of the queue on which to place the broadcasting job.
     *
     * @var string
     */
    public $queue = 'default';
```

 Como alternativa, você pode personalizar o nome da fila definindo uma método `broadcastQueue` em seu evento:

```php
    /**
     * The name of the queue on which to place the broadcasting job.
     */
    public function broadcastQueue(): string
    {
        return 'default';
    }
```

 Se você deseja transmitir seu evento usando a fila `sync` ao invés do driver da fila padrão, poderá implementar a interface `ShouldBroadcastNow` em vez de `ShouldBroadcast`:

```php
    <?php

    use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

    class OrderShipmentStatusUpdated implements ShouldBroadcastNow
    {
        // ...
    }
```

<a name="broadcast-conditions"></a>
### Condições de transmissão

 Às vezes, você deseja transmitir seu evento apenas se uma determinada condição estiver verdadeira. Você pode definir essas condições adicionando um método `broadcastWhen` à sua classe de eventos:

```php
    /**
     * Determine if this event should broadcast.
     */
    public function broadcastWhen(): bool
    {
        return $this->order->value > 100;
    }
```

<a name="broadcasting-and-database-transactions"></a>
#### Transmissões e transações de banco de dados

 Quando os eventos de transmissão são enviados dentro da transação de banco de dados, eles podem ser processados pela fila antes que a transação do banco de dados tenha sido commitada. Nesse caso, as atualizações que você fez em modelos ou registros de banco de dados durante a transação de banco de dados podem não estar refletidas no banco de dados ainda. Além disso, qualquer modelo ou registro de banco de dados criado dentro da transação pode não existir mais no banco de dados. Se o seu evento depender desses modelos, erros inesperados podem ocorrer quando o trabalho que transmite o evento é processado.

 Se a opção de configuração `after_commit` da conexão de fila estiver definida como `false`, você ainda poderá indicar que um determinado evento de transmissão deve ser enviado após as transações em curso na base de dados terem sido commitadas, implementando a interface `ShouldDispatchAfterCommit` da classe de evento:

```php
    <?php

    namespace App\Events;

    use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
    use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
    use Illuminate\Queue\SerializesModels;

    class ServerCreated implements ShouldBroadcast, ShouldDispatchAfterCommit
    {
        use SerializesModels;
    }
```

 > [!ATENÇÃO]
 [Trabalhos agendados e transações de base de dados] (/) docs/{{versao}}/queues#jobs-and-database-transactions.

<a name="authorizing-channels"></a>
## Canais autorizados

 Os canais privados exigem que você autorize o usuário atualmente autenticado a ouvir o canal. Isso é feito enviando um pedido HTTP ao seu aplicativo Laravel com o nome do canal e permitindo que seu aplicativo determine se o usuário pode ouvir no canal. Ao usar o [Echo do Laravel](client-side-installation), o pedido HTTP para autorizar assinaturas em canais privados será feito automaticamente.

 Quando a transmissão é ativada, o Laravel automaticamente registra a rota `/broadcasting/auth` para lidar com solicitações de autorização. A rota `/broadcasting/auth` é colocada automaticamente dentro do grupo de middlewares `web`.

<a name="defining-authorization-callbacks"></a>
### Definindo autorizações por callback

 A seguir, precisamos definir a lógica que determina se o usuário autenticado atualmente pode ouvir um canal específico. Isso é feito no arquivo `routes/channels.php` criado pelo comando Artisan `install:broadcasting`. Neste arquivo, você poderá usar o método `Broadcast::channel` para registrar os callbacks de autorização do canal:

```php
    use App\Models\User;

    Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
        return $user->id === Order::findOrNew($orderId)->user_id;
    });
```

 O método `channel` aceita dois argumentos: o nome do canal e um callback que retorna `true` ou `false` indicando se o usuário está autorizado a escutar no canal.

 Todos os retornos de chamada de autorização recebem o usuário atualmente autenticado como seu primeiro argumento e quaisquer parâmetros padrão adicionais como seus argumentos subsequentes. Neste exemplo, estamos utilizando um placeholder "{orderId}" para indicar que a parte do nome do canal entre aspas é um padrão.

 Você pode visualizar uma lista dos chamados de retorno de autorização da transmissão do seu aplicativo usando o comando Artesiano `channel:list`:

```shell
php artisan channel:list
```

<a name="authorization-callback-model-binding"></a>
#### Associação de modelo de callback à autorização

 Assim como as rotas HTTP, as rotas de canais também podem ser benéficas para o [vinculamento do modelo da rota](/docs/routing#route-model-binding) implícito e explícito. Por exemplo, em vez de receber um número de pedido como uma string ou numérica, você pode solicitar a instância atual do modelo `Order` (Pedido):

```php
    use App\Models\Order;
    use App\Models\User;

    Broadcast::channel('orders.{order}', function (User $user, Order $order) {
        return $user->id === $order->user_id;
    });
```

 > [AVERIGOMETE]
 [Escopo de vinculação implícito do modelo](/docs/routing#implicit-model-binding-scoping). No entanto, esse é um problema raro porque a maioria dos canais podem ser vinculados com base na chave primária única de um único modelo.

<a name="authorization-callback-authentication"></a>
#### Autenticação de chamada de autorização

 Os canais de transmissão privada e de presença autenticam o usuário atual através do escudo de autenticação por padrão da aplicação. Se o usuário não estiver autenticado, a autorização de canal será automaticamente negada e o callback de autorização nunca será executado. No entanto, você pode atribuir várias guards personalizadas que devem autenticar a solicitação recebida caso necessário:

```php
    Broadcast::channel('channel', function () {
        // ...
    }, ['guards' => ['web', 'admin']]);
```

<a name="defining-channel-classes"></a>
### Definindo classes de canal

 Se o seu aplicativo estiver consumindo muitos canais diferentes, o arquivo `routes/channels.php` poderá ficar grande demais. Sendo assim, em vez de usar cláusulas para autorizar canais, você pode utilizar classes de canal. Para gerar uma classe de canal, utilize o comando Artisan `make:channel`. Esse comando irá colocar uma nova classe de canal no diretório `App/Broadcasting`.

```shell
php artisan make:channel OrderChannel
```

 Em seguida, registre seu canal em seu arquivo `routes/channels.php`:

```php
    use App\Broadcasting\OrderChannel;

    Broadcast::channel('orders.{order}', OrderChannel::class);
```

 Por último, você pode colocar a lógica de autorização do seu canal na classe "channel". Essa metodologia 'join' irá conter a mesma lógica que normalmente seria colocada em um fechamento de autorização do canal. Você também poderá tirar proveito da vinculação de modelo do canal:

```php
    <?php

    namespace App\Broadcasting;

    use App\Models\Order;
    use App\Models\User;

    class OrderChannel
    {
        /**
         * Create a new channel instance.
         */
        public function __construct()
        {
            // ...
        }

        /**
         * Authenticate the user's access to the channel.
         */
        public function join(User $user, Order $order): array|bool
        {
            return $user->id === $order->user_id;
        }
    }
```

 > [!AVISO]
 [Contêiner de serviço](/docs/container). Então, você pode indicar qualquer dependência necessária pelo seu canal em seu construtor.

<a name="broadcasting-events"></a>
## Transmissão de eventos

 Definido um evento e marcado com a interface `ShouldBroadcast`, só precisa disparar o evento usando o método de envio do evento. O gestor de eventos notará que o evento está marcado com a interface `ShouldBroadcast` e irá agendar o evento para transmissão:

```php
    use App\Events\OrderShipmentStatusUpdated;

    OrderShipmentStatusUpdated::dispatch($order);
```

<a name="only-to-others"></a>
### Somente para outros

 Ao construir um aplicativo que utiliza transmissão de eventos, é possível ocasionalmente ser necessário transmitir um evento a todos os assinantes de um canal dado, exceto pelo usuário atual. É possível fazer isso utilizando o ajudante `broadcast` e o método `toOthers`:

```php
    use App\Events\OrderShipmentStatusUpdated;

    broadcast(new OrderShipmentStatusUpdated($update))->toOthers();
```

 Para compreender melhor quando se pode utilizar o método `toOthers`, vamos imaginar um aplicativo de lista de tarefas onde um utilizador pode criar uma nova tarefa através da introdução do nome da mesma. Ao criar uma tarefa, a sua aplicação pode fazer um pedido para uma URL `/task` que transmite a criação da tarefa e devolve uma representação JSON da nova tarefa. Quando a sua aplicação JavaScript recebe a resposta do ponto final, poderá inserir diretamente a nova tarefa na lista de tarefas:

```js
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

 No entanto, lembre-se de que transmitimos também a criação da tarefa. Se o seu aplicativo JavaScript está atento a esse evento para adicionar tarefas à lista de tarefas, você terá tarefas duplicadas na sua lista: uma do ponto final e outra da transmissão. Você pode resolver isso usando o método `toOthers` para instruir o transmisor a não transmitir o evento ao usuário atual.

 > [!AVISO]
 > O seu evento deve utilizar o traço `Illuminate\Broadcasting\InteractsWithSockets` para chamar o método `toOthers`.

<a name="only-to-others-configuration"></a>
#### Configuração

 Quando você inicializa uma instância do Laravel Echo, um ID de socket é atribuído à conexão. Se você estiver usando uma instância [Axios](https://github.com/mzabriskie/axios) global para fazer solicitações HTTP em seu aplicativo JavaScript, o ID do socket será automaticamente anexado a cada solicitação emitida como um cabeçalho `X-Socket-ID`. Então, quando você chamar o método `toOthers`, Laravel extrairá o ID de socket do cabeçalho e informará ao broadcaster que não irá transmitir para conexões com esse ID de socket.

 Se você não estiver usando uma instância global de Axios, precisará configurar sua aplicação JavaScript manualmente para enviar o cabeçalho `X-Socket-ID` em todos os pedidos. Você poderá obter o ID do socket usando a função `Echo.socketId`:

```js
var socketId = Echo.socketId();
```

<a name="customizing-the-connection"></a>
### Personalização da conexão

 Se o seu aplicativo interagir com várias conexões de transmissão e quiser transmitir um evento usando uma estação de broadcast que não seja a padrão, poderá especificar qual a conexão para onde irá empurrar o evento usando o método `via`:

```php
    use App\Events\OrderShipmentStatusUpdated;

    broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');
```

 Como alternativa, pode especificar a ligação de transmissão do evento chamando o método `broadcastVia` no construtor do evento. No entanto, antes disso, deve assegurar-se de que a classe do evento usa a traço `InteractsWithBroadcasting`:

```php
    <?php

    namespace App\Events;

    use Illuminate\Broadcasting\Channel;
    use Illuminate\Broadcasting\InteractsWithBroadcasting;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Broadcasting\PresenceChannel;
    use Illuminate\Broadcasting\PrivateChannel;
    use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
    use Illuminate\Queue\SerializesModels;

    class OrderShipmentStatusUpdated implements ShouldBroadcast
    {
        use InteractsWithBroadcasting;

        /**
         * Create a new event instance.
         */
        public function __construct()
        {
            $this->broadcastVia('pusher');
        }
    }
```

<a name="anonymous-events"></a>
### Eventos anónimos

 Às vezes, você pode querer transmitir um evento simples para o front-end de seu aplicativo sem criar uma classe de evento específica. Para atender a esse caso, a facade `Broadcast` permite que você transmita "eventos anônimos":

```php
Broadcast::on('orders.'.$order->id)->send();
```

 O exemplo acima irá transmitir o seguinte evento:

```json
{
    "event": "AnonymousEvent",
    "data": "[]",
    "channel": "orders.1"
}
```

 Usando os métodos `as` e `with`, você pode personalizar o nome do evento e seus dados:

```php
Broadcast::on('orders.'.$order->id)
    ->as('OrderPlaced')
    ->with($order)
    ->send();
```

 O exemplo acima transmitirá um evento como o seguinte:

```json
{
    "event": "OrderPlaced",
    "data": "{ id: 1, total: 100 }",
    "channel": "orders.1"
}
```

 Se você desejar transmitir o evento anônimo em um canal privado ou de presença, poderá utilizar os métodos `private` e `presence`:

```php
Broadcast::private('orders.'.$order->id)->send();
Broadcast::presence('channels.'.$channel->id)->send();
```

 A transmissão de um evento anônimo usando o método `send` encaminha o evento para a fila da sua aplicação [Queue] (/docs/{{ version}}/queues) para processamento. No entanto, se você deseja transmitir o evento imediatamente, poderá usar o método `sendNow`:

```php
Broadcast::on('orders.'.$order->id)->sendNow();
```

 Para transmitir o evento a todos os assinantes do canal exceto ao utilizador atualmente autenticado, pode invocar a método `toOthers`:

```php
Broadcast::on('orders.'.$order->id)
    ->toOthers()
    ->send();
```

<a name="receiving-broadcasts"></a>
## Receber transmissões

<a name="listening-for-events"></a>
### Escutando eventos

 Uma vez que [instalou e instanciou o Laravel Echo](#client-side-installation), está pronto para começar a ouvir os eventos que são transmitidos pela aplicação Laravel. Primeiro, use o método `channel` para recuperar uma instância de um canal, em seguida, chame o método `listen` para escutar por um evento especificado:

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```

 Se você quiser escutar eventos em um canal privado, use o método `private`. Você pode continuar chamando o método `listen` para ouvir vários eventos em um único canal:

```js
Echo.private(`orders.${this.order.id}`)
    .listen(/* ... */)
    .listen(/* ... */)
    .listen(/* ... */);
```

<a name="stop-listening-for-events"></a>
#### Interromper a escuta de eventos

 Se você quiser parar de ouvir um determinado evento sem [deixar o canal] (# deixando-um-canal), pode utilizar o método `stopListening`:

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated')
```

<a name="leaving-a-channel"></a>
### Sair de um canal

 Para sair de um canal, você pode chamar o método `leaveChannel` em sua instância Echo:

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

 Se você quiser sair de um canal e também dos canais privados e de presença associados a esse canal, poderá chamar o método `leave`:

```js
Echo.leave(`orders.${this.order.id}`);
```
<a name="namespaces"></a>
### Espaços de nomes

 Você pode ter notado nos exemplos acima que não especificamos o espaço de nomes completo `App\Events` para as classes do evento. Isso porque o Echo assume automaticamente que os eventos estão localizados no espaço de nomes `App\Events`. No entanto, você pode configurar o namespace principal ao instanciar o Echo passando uma opção de configuração `namespace`:

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

 Como alternativa, você poderá anteceder as classes de evento com um ponto (.) ao assiná-las usando o Echo. Isso permitirá sempre especificar o nome da classe totalmente qualificado:

```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        // ...
    });
```

<a name="presence-channels"></a>
## Canais de Presença

 Os canais de presença baseiam-se na segurança dos canais privados e permitem ter conhecimento das pessoas que se encontram inscritas nesse canal. Desta forma, é possível criar funções colaborativas poderosas, como por exemplo avisar ao utilizador quando outro utilizador está a ver a mesma página ou mostrar quem está na sala de chat.

<a name="authorizing-presence-channels"></a>
### Autorizando canais de presença

 Todos os canais de presença também são privados; portanto, os usuários precisam estar [autorizados para acessá-los (Autorizar Canais)]. No entanto, ao definir o retorno do chamado de autorização para canais de presença, você não deve retornar `true` se o usuário estiver autorizado a participar no canal. Em vez disso, você deve retornar um array de dados sobre o usuário.

 Os dados retornados pelo recurso de chamada de autorização estarão disponíveis para os ouvintes do evento do canal de presença em sua aplicação JavaScript. Se o usuário não estiver autorizado a participar no canal de presença, você deve retornar `false` ou `null`:

```php
    use App\Models\User;

    Broadcast::channel('chat.{roomId}', function (User $user, int $roomId) {
        if ($user->canJoinRoom($roomId)) {
            return ['id' => $user->id, 'name' => $user->name];
        }
    });
```

<a name="joining-presence-channels"></a>
### Participar em canais da presença

 Para se juntar a um canal de presença, você pode usar o método `join` do Echo. O método `join` retornará uma implementação de `PresenceChannel`. Com essa implementação, além do método `listen`, você poderá subscrever os eventos `here`, `joining` e `leaving`.

```js
Echo.join(`chat.${roomId}`)
    .here((users) => {
        // ...
    })
    .joining((user) => {
        console.log(user.name);
    })
    .leaving((user) => {
        console.log(user.name);
    })
    .error((error) => {
        console.error(error);
    });
```

 O retorno de chamada `here` será executado imediatamente uma vez que o canal é aderido com sucesso, e receberá um array contendo informações do usuário para todos os outros usuários atualmente inscritos no canal. O método `joining` será executado quando um novo usuário adere a um canal, enquanto o método `leaving` será executado quando um usuário sai do canal. O método `error` será executado quando o ponto final de autenticação retorna um código de status HTTP que não seja 200 ou caso haja problemas para analisar a informação JSON retornada.

<a name="broadcasting-to-presence-channels"></a>
### Transmissão para canais de presença

 Os canais de presença podem receber eventos como os públicos ou privados. Usando um exemplo de uma sala de chat, poderemos querer transmitir eventos `NewMessage` para o canal de presença da sala. Para isso, iremos devolver uma instância do método `broadcastOn` do evento:

```php
    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('chat.'.$this->message->room_id),
        ];
    }
```

 Como acontece com outros eventos, você pode usar o atalho `broadcast` e o método `toOthers` para excluir o usuário atual de receber o envio:

```php
    broadcast(new NewMessage($message));

    broadcast(new NewMessage($message))->toOthers();
```

 Como é típico de outros tipos de evento, você pode escutar eventos enviados para canais de presença usando o método `listen` do Echo:

```js
Echo.join(`chat.${roomId}`)
    .here(/* ... */)
    .joining(/* ... */)
    .leaving(/* ... */)
    .listen('NewMessage', (e) => {
        // ...
    });
```

<a name="model-broadcasting"></a>
## Modelo de transmissão

 > [AVERTISSEMENT]
 > Antes de ler a documentação abaixo sobre transmissão de modelo, recomendamos que você conheça os conceitos gerais dos serviços de transmissão de modelos do Laravel e como criar manualmente e ouvir eventos de transmissão.

 É comum transmitir eventos quando os [modelos Eloquent] (/docs/eloquent) do aplicativo são criados, atualizados ou excluídos. Claro que isso pode ser feito facilmente definindo manualmente [eventos personalizados para alterações de estado de modelos Eloquent] (/docs/eloquent#events) e marcando esses eventos com a interface `ShouldBroadcast`.

 No entanto, se você não estiver usando esses eventos para outros propósitos em sua aplicação, poderá ser cansativo criar classes de evento apenas com o intuito de transmiti-los. Para sanar isso, o Laravel permite que você indique que um modelo Eloquent deve transmitir automaticamente suas mudanças no estado.

 Para começar, seu modelo Eloquent deve usar o traço `Illuminate\Database\Eloquent\BroadcastsEvents`. Além disso, o modelo deve definir um método `broadcastOn`, que retornará um array de canais nos quais os eventos do modelo serão transmitidos:

```php
<?php

namespace App\Models;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\BroadcastsEvents;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use BroadcastsEvents, HasFactory;

    /**
     * Get the user that the post belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the channels that model events should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>
     */
    public function broadcastOn(string $event): array
    {
        return [$this, $this->user];
    }
}
```

 Após incluir essa característica e definir os canais de transmissão do modelo, esse começará a transmitir automaticamente eventos quando uma instância do modelo for criada, atualizada ou apagada.

 Além disso, talvez tenha reparado que o método `broadcastOn` recebe um argumento de string `$event`. Este argumento contém o tipo de evento que ocorreu no modelo e tem um valor entre `created`, `updated`, `deleted`, `trashed` ou `restored`. Pode determinar, através da varridação deste valor, quais os canais (se houver) aos quais o modelo deve emitir o evento:

```php
/**
 * Get the channels that model events should broadcast on.
 *
 * @return array<string, array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>>
 */
public function broadcastOn(string $event): array
{
    return match ($event) {
        'deleted' => [],
        default => [$this, $this->user],
    };
}
```

<a name="customizing-model-broadcasting-event-creation"></a>
#### Personalização do modelo de criação de eventos de transmissão

 Por vezes, poderá querer personalizar a forma como Laravel cria o evento de transmissão do modelo subjacente. Pode fazer isto definindo um método `newBroadcastableEvent` no seu modelo Eloquent. Este método deve retornar uma instância de `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred`:

```php
use Illuminate\Database\Eloquent\BroadcastableModelEventOccurred;

/**
 * Create a new broadcastable model event for the model.
 */
protected function newBroadcastableEvent(string $event): BroadcastableModelEventOccurred
{
    return (new BroadcastableModelEventOccurred(
        $this, $event
    ))->dontBroadcastToCurrentUser();
}
```

<a name="model-broadcasting-conventions"></a>
### Modelo de convenções para transmissão de sinais

<a name="model-broadcasting-channel-conventions"></a>
#### Convenções do canal

 Como você deve ter notado, o método `broadcastOn` do exemplo de modelo acima não retornou instâncias de `Channel`. Em vez disso, foram retornadas diretamente instâncias dos modelos Eloquent. Se uma instância de modelo Eloquent for retornada pelo método `broadcastOn` do seu modelo (ou estiver contida em um array retornado pelo método), o Laravel irá automaticamente instanciar uma instância privada do canal usando o nome do modelo e o identificador primário como o nome do canal.

 Portanto, um modelo `App\Models\User` com um `id` de `1` seria convertido em uma instância do tipo `Illuminate\Broadcasting\PrivateChannel`, cujo nome é `App.Models.User.1`. É claro que, para além da devolução das instâncias dos modelos `Eloquent` na sua método `broadcastOn`, pode retornar as instâncias completas do tipo `Channel`, assim poderá controlar todos os nomes do canal:

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channels that model events should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(string $event): array
{
    return [
        new PrivateChannel('user.'.$this->id)
    ];
}
```

 Se pretende devolver uma instância de canal explicitamente através da metodologia `broadcastOn` do seu modelo, pode passar uma instância de modelo Eloquent para o construtor do canal. Quando o fizer, Laravel utilizará as convenções de canal em modelos discutidas anteriormente para converter o modelo Eloquent numa string com o nome do canal:

```php
return [new Channel($this->user)];
```

 Se você precisar determinar o nome do canal de um modelo, poderá chamar o método `broadcastChannel` em qualquer instância de modelo. Por exemplo, este método retorna a string `'App.Models.User.1'` para um modelo `App\Models\User` com um `id` igual a 1:

```php
$user->broadcastChannel()
```

<a name="model-broadcasting-event-conventions"></a>
#### Convenções de eventos

 Como os eventos de transmissão de modelo não estão associados a um evento "real" no diretório `App\Events` do aplicativo, eles recebem um nome e uma carga útil baseadas em convenções. A convenção do Laravel é transmitir o evento usando o nome da classe do modelo (não incluindo o namespace) e o nome do evento do modelo que acionou a transmissão.

 Então, por exemplo, uma atualização do modelo `App\Models\Post` transmitiria um evento para o seu aplicativo de lado do cliente como `PostUpdated`, com o seguinte pagamento:

```json
{
    "model": {
        "id": 1,
        "title": "My first post"
        ...
    },
    ...
    "socket": "someSocketId",
}
```

 A exclusão do modelo `App\Models\User` difundiria um evento chamado `UserDeleted`.

 Se pretender, pode definir um nome e carga útil personalizados de transmissão adicionando os métodos `broadcastAs` e `broadcastWith` ao modelo. Estes métodos recebem o nome do evento/operação do modelo que está a ocorrer, permitindo-lhe personalizar o nome e a carga útil do evento para cada operação de modelo. Se o valor retornado pelo método `broadcastAs` for `null`, Laravel utilizará as convenções de nome da transmissão de eventos do modelo discutidas acima na transmissão dos eventos:

```php
/**
 * The model event's broadcast name.
 */
public function broadcastAs(string $event): string|null
{
    return match ($event) {
        'created' => 'post.created',
        default => null,
    };
}

/**
 * Get the data to broadcast for the model.
 *
 * @return array<string, mixed>
 */
public function broadcastWith(string $event): array
{
    return match ($event) {
        'created' => ['title' => $this->title],
        default => ['model' => $this],
    };
}
```

<a name="listening-for-model-broadcasts"></a>
### Escutar transmissões modelo

 Depois de ter adicionado a característica `BroadcastsEvents` ao seu modelo e definido o método `broadcastOn` do modelo, está pronto para começar a ouvir os eventos do modelo na aplicação do lado do cliente. Antes de continuar, recomendamos consultar toda a documentação sobre [ouvir eventos] (#listening-for-events).

 Primeiro, use o método `private` para recuperar uma instância de um canal. Em seguida, chame o método `listen` para ouvir um evento especificado. Geralmente, o nome do canal passado ao método `private` deve corresponder às convenções de transmissão de modelos de Laravel (ver Convenções de transmissão de modelos).

 Depois de obter uma instância de canal, você pode usar o método `listen` para escutar um determinado evento. Como os eventos do modelo não estão associados a um "evento real" no diretório `App\Events` de sua aplicação, o nome do evento (#convenções de eventos de broadcasting) deve ser prefixado com um `.` para indicar que ele não pertence a um namespace específico. Cada evento de broadcasting de modelo tem uma propriedade `model` que contém todas as propriedades transmissíveis do modelo:

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.PostUpdated', (e) => {
        console.log(e.model);
    });
```

<a name="client-events"></a>
## Eventos para clientes

 > [!NOTA]
 No Pusher [Channels](https://pusher.com/channels), você deve ativar a opção "Eventos do Cliente" na seção "Configurações da App" de seu

 Por vezes poderá pretender transmitir um evento para outros clientes conectados sem ter de ligar à aplicação Laravel. Isto pode ser especialmente útil para notificações "tipo", ou seja, quando deseja alertar os utilizadores da sua aplicação para o facto de outro utilizador estiver a digitar uma mensagem num determinado ecrã.

 Para transmitir eventos do cliente, você pode usar o método `whisper` da Echo:

```js
Echo.private(`chat.${roomId}`)
    .whisper('typing', {
        name: this.user.name
    });
```

 Para se manter atualizado com os eventos do cliente você pode usar o método `listenForWhisper`:

```js
Echo.private(`chat.${roomId}`)
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

<a name="notifications"></a>
## Notificações

 Ao combinar a transmissão de eventos com as notificações ([notificações](/docs/notificações)), sua aplicação JavaScript pode receber novas notificações ao ocorrerem sem necessitar de recarregar a página. Antes de começar, leia a documentação sobre como usar o [canal de notificação de transmissão](/docs/notificações#broadcast-notifications).

 Depois de configurar uma notificação para usar o canal de transmissão, você poderá ouvir os eventos de transmissão usando o método `notification` do Echo. Lembre-se de que o nome do canal deve combinar com a classe da entidade que recebe as notificações:

```js
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

 Neste exemplo, todas as notificações enviadas para as instâncias do `App\Models\User` através do canal de transmissão seriam recebidas pelo callback. Um callback de autorização de canal para o canal `App.Models.User.{id}` está incluído no arquivo de rotas/canais da aplicação.
