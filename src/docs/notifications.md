# Notificações

<a name="introduction"></a>
## Introdução

 Além de suporte para [envio de e-mails](/docs/mail), o Laravel oferece suporte para envio de notificações através de diversos canais, incluindo e-mail, SMS (por meio da [Vonage](https://www.vonage.com/communications-apis/), antigamente conhecida como Nexmo) e [Slack](https://slack.com). Além disso, existem diversos canais de notificação construídos pela comunidade (https://laravel-notification-channels.com/about/#suggesting-a-new-channel), que permitem envio de notificações através de dezenas de diferentes canais! As notificações também podem ser armazenadas em uma base de dados para que possam ser exibidas na sua interface web.

 Normalmente, as notificações devem ser mensagens curtas e informativas que avisam os utilizadores da ocorrência de algo na sua aplicação. Por exemplo, se estiver a criar uma aplicação de faturamento, pode enviar uma notificação "Fatura Paga" aos seus utilizadores através do email ou canais SMS.

<a name="generating-notifications"></a>
## Gerando notificações

 Em Laravel, cada notificação é representada por uma única classe que é normalmente armazenada no diretório `app/Notifications`. Não se preocupe se não ver este diretório na sua aplicação – será criado para si quando executar o comando Artisan `make:notification`:

```shell
php artisan make:notification InvoicePaid
```

 Este comando colocará uma nova classe de notificação no diretório `app/Notifications`. Cada classe contém um método `via` e um número variável de métodos para construir mensagens, como o `toMail` ou o `toDatabase`, que convertem a notificação em uma mensagem adaptada ao canal específico.

<a name="sending-notifications"></a>
## Envio de notificações

<a name="using-the-notifiable-trait"></a>
### Usando o Comportamento Notificável

 As notificações podem ser enviadas de duas formas: usando o método `notify` da trait `Notifiable`, ou usando a facade [Notification](/docs/facades). A trait `Notifiable` está incluída no modelo `App\Models\User` por padrão na aplicação:

```php
    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;

    class User extends Authenticatable
    {
        use Notifiable;
    }
```

 O método `notify`, fornecido por esse traço, espera receber uma instância de notificação:

```php
    use App\Notifications\InvoicePaid;

    $user->notify(new InvoicePaid($invoice));
```

 > [!NOTA]
 > Lembre-se que você pode usar a característica `Notifiable` em qualquer um de seus modelos. Você não está limitado a incluí-la somente no seu modelo `User`.

<a name="using-the-notification-facade"></a>
### Usando a fachada de notificação

 Em alternativa, você pode enviar notificações através do [facade]("https://github.com/vectorscript/Vue.js-notification#notifications") `Notification`. Este método é útil quando necessário enviar uma notificação para múltiplas entidades notificáveis, como um grupo de usuários. Para enviar notificações através do facade, forneça todas as entidades notificáveis e a instância da notificação para o método `send`:

```php
    use Illuminate\Support\Facades\Notification;

    Notification::send($users, new InvoicePaid($invoice));
```

 Você também pode enviar notificações imediatamente usando o método `sendNow`. Este método envia a notificação imediatamente, mesmo que a notificação implemente a interface `ShouldQueue`:

```php
    Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a name="specifying-delivery-channels"></a>
### Especificando canais de entrega

 Cada tipo de notificação possui um método `via` que determina em quais canais a notificação será entregue. As notificações podem ser enviadas para os canais `mail`, `database`, `broadcast`, `vonage` e `slack`.

 > [!NOTA]
 [Website do canal de notificações da Laravel](http://laravel-notification-channels.com).

 O método `via` recebe uma instância `$notifiable`, que será uma instância da classe para a qual a notificação está sendo enviada. Você pode usar o `$notifiable` para determinar os canais em que a notificação deve ser entregue:

```php
    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return $notifiable->prefers_sms ? ['vonage'] : ['mail', 'database'];
    }
```

<a name="queueing-notifications"></a>
### Notificações de Fila

 > [AVISO]
 Inicie o trabalho de fila.

 O envio de notificações pode demorar tempo, especialmente se o canal precisar fazer uma chamada externa API para entregar a notificação. Para acelerar o tempo de resposta do seu aplicativo, deixe sua notificação ser agendada, adicionando a interface `ShouldQueue` e a trajetória `Queueable` à sua classe. As interfaces e as trajetórias já são importadas para todas as notificações geradas usando o comando `make:notification`, então você pode adicioná-las imediatamente à sua classe de notificação:

```php
    <?php

    namespace App\Notifications;

    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Notifications\Notification;

    class InvoicePaid extends Notification implements ShouldQueue
    {
        use Queueable;

        // ...
    }
```

 Depois que a interface `ShouldQueue` for adicionada à sua notificação, você poderá enviar a notificação normalmente. O Laravel irá detectar a interface `ShouldQueue` na classe e agendar automaticamente o envio da notificação:

```php
    $user->notify(new InvoicePaid($invoice));
```

 Quando as notificações são agendadas, uma tarefa é criada para cada combinação de canal e destinatário. Por exemplo, seis tarefas serão enviadas para a fila se o seu aviso incluir três destinatários e dois canais.

<a name="delaying-notifications"></a>
#### Atrasando notificações

 Se você deseja retardar a entrega da notificação, poderá associar a método `delay` à instanciação de sua notificação:

```php
    $delay = now()->addMinutes(10);

    $user->notify((new InvoicePaid($invoice))->delay($delay));
```

 Você pode passar um array para o método `delay`, especificando a quantidade de atraso dos canais específicos:

```php
    $user->notify((new InvoicePaid($invoice))->delay([
        'mail' => now()->addMinutes(5),
        'sms' => now()->addMinutes(10),
    ]));
```

 Como alternativa, você pode definir um método `withDelay` na própria classe da notificação. O método `withDelay` deverá retornar um array com nomes de canais e valores de atraso:

```php
    /**
     * Determine the notification's delivery delay.
     *
     * @return array<string, \Illuminate\Support\Carbon>
     */
    public function withDelay(object $notifiable): array
    {
        return [
            'mail' => now()->addMinutes(5),
            'sms' => now()->addMinutes(10),
        ];
    }
```

<a name="customizing-the-notification-queue-connection"></a>
#### Personalizar a conexão da fila de notificações

 Por padrão, as notificações agendadas serão agendadas utilizando a conexão de fila padrão da aplicação. Se pretender especificar uma conexão diferente que deve ser utilizada para uma notificação em particular, poderá chamar a método `onConnection` a partir do construtor da sua notificação:

```php
    <?php

    namespace App\Notifications;

    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Notifications\Notification;

    class InvoicePaid extends Notification implements ShouldQueue
    {
        use Queueable;

        /**
         * Create a new notification instance.
         */
        public function __construct()
        {
            $this->onConnection('redis');
        }
    }
```

 Ou, se quiser especificar uma conexão de fila específica que deve ser usada para cada canal de notificação suportado pela notificação, pode definir um método `viaConnections` no seu aviso. Este método deve retornar um array com pares nome do canal/nome da conexão de fila:

```php
    /**
     * Determine which connections should be used for each notification channel.
     *
     * @return array<string, string>
     */
    public function viaConnections(): array
    {
        return [
            'mail' => 'redis',
            'database' => 'sync',
        ];
    }
```

<a name="customizing-notification-channel-queues"></a>
#### Personalização de filas de canais de notificação

 Se desejar especificar uma fila específica que deve ser usada para cada canal de notificações suportado pela notificação, você poderá definir um método `viaQueues` no seu objeto de notificação. Esse método deverá retornar um array de pares nome do canal/nome da fila:

```php
    /**
     * Determine which queues should be used for each notification channel.
     *
     * @return array<string, string>
     */
    public function viaQueues(): array
    {
        return [
            'mail' => 'mail-queue',
            'slack' => 'slack-queue',
        ];
    }
```

<a name="queued-notification-middleware"></a>
#### Gerenciador de notificações em fila

 As notificações em fila podem definir middlewares [assim como tarefas em fila](/docs/queues#job-middleware). Para começar, defina a metodologia `middleware` na sua classe de notificação. A metodologia `middleware` receberá as variáveis `$notifiable` e `$channel`, que permitem personalizar o middleware retornado com base no destino da notificação:

```php
    use Illuminate\Queue\Middleware\RateLimited;

    /**
     * Get the middleware the notification job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(object $notifiable, string $channel)
    {
        return match ($channel) {
            'email' => [new RateLimited('postmark')],
            'slack' => [new RateLimited('slack')],
            default => [],
        };
    }
```

<a name="queued-notifications-and-database-transactions"></a>
#### Notificações em fila e transações de banco de dados

 Quando as notificações agendadas são enviadas durante transações de banco de dados, podem ser processadas na fila antes da confirmação da transação do banco de dados. Nesse caso, quaisquer alterações que efetuar nos modelos ou registos do banco de dados durante a transação do banco de dados podem ainda não estar refletidas no banco de dados. Além disso, os modelos ou registos do banco de dados criados dentro da transação podem não existir no banco de dados. Se a sua notificação depender destes modelos, pode ocorrer um erro inesperado quando o processo que envia as notificações agendadas for executado.

 Se a opção de configuração `after_commit` da conexão da fila estiver definida como `false`, você ainda pode indicar que uma determinada notificação agendada deve ser enviada após o envio de todas as transações do banco de dados em aberto, chamando o método `afterCommit` quando envia a notificação:

```php
    use App\Notifications\InvoicePaid;

    $user->notify((new InvoicePaid($invoice))->afterCommit());
```

 Como alternativa, é possível chamar o método `afterCommit` do construtor da sua notificação:

```php
    <?php

    namespace App\Notifications;

    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Notifications\Notification;

    class InvoicePaid extends Notification implements ShouldQueue
    {
        use Queueable;

        /**
         * Create a new notification instance.
         */
        public function __construct()
        {
            $this->afterCommit();
        }
    }
```

 > [!ATENÇÃO]
 [Trabalhos agendados e transações de banco de dados] (/docs/queues#jobs-and-database-transactions).

<a name="determining-if-the-queued-notification-should-be-sent"></a>
#### Decisão de se enviar ou não uma notificação agendada

 Após uma notificação agendada ser enviada para a fila de processamento em segundo plano, ela normalmente é aceita por um trabalhador da fila e enviada ao destinatário pretendido.

 No entanto, se pretender definir o envio da notificação de forma definitiva depois de processada por um trabalhador da fila, pode definir uma função `shouldSend` na classe de notificação. Se esta função retornar `false`, a notificação não será enviada:

```php
    /**
     * Determine if the notification should be sent.
     */
    public function shouldSend(object $notifiable, string $channel): bool
    {
        return $this->invoice->isPaid();
    }
```

<a name="on-demand-notifications"></a>
### Notificações sob demanda

 Às vezes você poderá querer enviar uma notificação para alguém que não está armazenado como "usuário" em sua aplicação. Você pode especificar informações de roteamento da notificação ad-hoc usando o método `route` da interface `Notification` antes do envio da notificação:

```php
    use Illuminate\Broadcasting\Channel;
    use Illuminate\Support\Facades\Notification;

    Notification::route('mail', 'taylor@example.com')
                ->route('vonage', '5555555555')
                ->route('slack', '#slack-channel')
                ->route('broadcast', [new Channel('channel-name')])
                ->notify(new InvoicePaid($invoice));
```

 Se pretender fornecer o nome do destinatário ao enviar uma notificação sob demanda para a rota `mail`, pode fornecer um conjunto de dados que contenha o endereço de e-mail como chave e o nome como valor do primeiro elemento no conjunto:

```php
    Notification::route('mail', [
        'barrett@example.com' => 'Barrett Blair',
    ])->notify(new InvoicePaid($invoice));
```

 Usando o método `routes`, você pode fornecer informações de roteamento ad hoc para múltiplos canais de notificação de uma só vez:

```php
    Notification::routes([
        'mail' => ['barrett@example.com' => 'Barrett Blair'],
        'vonage' => '5555555555',
    ])->notify(new InvoicePaid($invoice));
```

<a name="mail-notifications"></a>
## Notificações por e-mail

<a name="formatting-mail-messages"></a>
### Como formatar mensagens de correio eletrónico

 Se uma notificação suportar o envio por e-mail, você deve definir um método `toMail` na classe de notificação. Este método receberá a entidade `$notifiable` e deverá retornar uma instância do tipo `Illuminate\Notifications\Messages\MailMessage`.

 A classe `MailMessage` contém alguns métodos simples para ajudar você na construção de mensagens de e-mail transacionais. Mensagens de e-mail podem conter linhas de texto, bem como um "chamado à ação". Vamos dar uma olhada no exemplo do método `toMail`:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = url('/invoice/'.$this->invoice->id);

        return (new MailMessage)
                    ->greeting('Hello!')
                    ->line('One of your invoices has been paid!')
                    ->lineIf($this->amount > 0, "Amount paid: {$this->amount}")
                    ->action('View Invoice', $url)
                    ->line('Thank you for using our application!');
    }
```

 > [!ATENÇÃO]
 > Observe que estamos usando `$this->invoice->id` em nosso método `toMail`. É possível enviar qualquer dado para a notificação gerar sua mensagem no construtor da notificação.

 Nesse exemplo, registamos uma saudação, uma linha de texto, um chamado à ação e outra linha de texto. Estes métodos fornecidos pelo objeto `MailMessage` tornam simples e rápido formatar e-mails transacionais pequenas. O canal de correio eletrónico irá depois traduzir os componentes do seu email num modelo bonito, adaptado a várias dimensões com uma contrapartida em texto simples. Veja um exemplo do tipo de e-mail gerado pelo canal `mail`:

<img src="https://laravel.com/img/docs/notification-example-2.png">

 > [!NOTA]
 > Ao enviar notificações por email, certifique-se de definir a opção de configuração `name` em seu arquivo de configuração `config/app.php`. Este valor será usado no cabeçalho e rodapé das mensagens de notificação por email.

<a name="error-messages"></a>
#### Mensagens de Erro

 Algumas notificações informam os utilizadores de erros, como um pagamento de fatura falhado. Pode especificar que uma mensagem de correio está relacionada com um erro chamando a função `error` ao construir a sua mensagem. Quando se chama a função `error` numa mensagem de correio, o botão "Ação" é vermelho em vez de preto:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->error()
                    ->subject('Invoice Payment Failed')
                    ->line('...');
    }
```

<a name="other-mail-notification-formatting-options"></a>
#### Outras opções de formatação do aviso por correio elettrónico

 Em vez de definir as “linhas” do texto na classe de notificação, você pode usar o método `view` para especificar um modelo personalizado que deve ser usado para gerar o e-mail da notificação:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->view(
            'mail.invoice.paid', ['invoice' => $this->invoice]
        );
    }
```

 Você pode especificar uma visualização de texto simples para a mensagem de e-mail passando o nome da visualização como segundo elemento de um array que é passado ao método `view`:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->view(
            ['mail.invoice.paid', 'mail.invoice.paid-text'],
            ['invoice' => $this->invoice]
        );
    }
```

 Se o seu email não tiver uma visualização de texto simples, você pode usar o método `text`:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->text(
            'mail.invoice.paid-text', ['invoice' => $this->invoice]
        );
    }
```

<a name="customizing-the-sender"></a>
### Personalizar o remetente

 Por padrão, o remetente do e-mail é definido no arquivo de configuração `config/mail.php`. No entanto, você pode especificar um endereço remetente para uma notificação específica usando a método `from`:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->from('barrett@example.com', 'Barrett Blair')
                    ->line('...');
    }
```

<a name="customizing-the-recipient"></a>
### Personalizar o destinatário

 Ao enviar notificações via o canal de notificação por e-mail, o sistema de notificação procurará automaticamente uma propriedade `email` na entidade notificável. Você pode personalizar qual endereço de e-mail é usado para distribuir a notificação definindo um método `routeNotificationForMail` na entidade notificável:

```php
    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Notifications\Notification;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * Route notifications for the mail channel.
         *
         * @return  array<string, string>|string
         */
        public function routeNotificationForMail(Notification $notification): array|string
        {
            // Return email address only...
            return $this->email_address;

            // Return email address and name...
            return [$this->email_address => $this->name];
        }
    }
```

<a name="customizing-the-subject"></a>
### Personalizar o Assunto

 Por padrão, o assunto do e-mail é o nome da classe da notificação formatado para "Title Case". Então, se sua classe de notificação for chamada como `InvoicePaid`, o assunto do email será `Invoice Paid`. Caso queira especificar um assunto diferente para a mensagem, você pode chamar o método `subject` ao montar sua mensagem:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Notification Subject')
                    ->line('...');
    }
```

<a name="customizing-the-mailer"></a>
### Personalizando o "Mailer"

 Por padrão, o aviso por email é enviado usando o remetente padrão definido no arquivo de configuração "config/mail.php". No entanto, é possível especificar um remetente diferente durante a execução chamando o método "mailer" ao criar a mensagem:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->mailer('postmark')
                    ->line('...');
    }
```

<a name="customizing-the-templates"></a>
### Personalizar os modelos

 É possível modificar o modelo de e-mail e modelo de texto usado nas notificações por meio da publicação dos recursos do pacote de notificação. Após a execução desse comando, os modelos das notificações estarão localizados no diretório `resources/views/vendor/notifications`:

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
### Anexos

 Para adicionar arquivos anexos a uma notificação por e-mail, utilize o método `attach` ao criar a mensagem. O primeiro argumento do método `attach` aceita o caminho absoluto para o ficheiro:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->greeting('Hello!')
                    ->attach('/path/to/file');
    }
```

 > [!ATENÇÃO]
 [Objetos que podem ser anexados](/docs/mail#attachable-objects). Consulte o guia completo

 Ao anexar arquivos a uma mensagem, você também pode especificar o nome de exibição e/ou o tipo MIME passando um array como segundo argumento ao método attach:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->greeting('Hello!')
                    ->attach('/path/to/file', [
                        'as' => 'name.pdf',
                        'mime' => 'application/pdf',
                    ]);
    }
```

 Diferente do anexo de arquivos em objetos enviáveis por e-mail, você não pode anexar um arquivo diretamente de um disco de armazenamento usando `attachFromStorage`. Deve usar o método `attach` com o caminho absoluto para o arquivo no disco de armazenamento. Como alternativa, você poderia retornar um [enviável por e-mail](/docs/mail#generating-mailables) do método `toMail`:

```php
    use App\Mail\InvoicePaid as InvoicePaidMailable;

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): Mailable
    {
        return (new InvoicePaidMailable($this->invoice))
                    ->to($notifiable->email)
                    ->attachFromStorage('/path/to/file');
    }
```

 Quando necessário, vários arquivos podem ser anexados a uma mensagem usando o método `attachMany`:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->greeting('Hello!')
                    ->attachMany([
                        '/path/to/forge.svg',
                        '/path/to/vapor.svg' => [
                            'as' => 'Logo.svg',
                            'mime' => 'image/svg+xml',
                        ],
                    ]);
    }
```

<a name="raw-data-attachments"></a>
#### Anexos de Dados Brutos

 O método `attachData` pode ser usado para anexar uma string de bytes bruta como um arquivo anexo. Ao chamar o método `attachData`, você deve fornecer o nome do arquivo que deve ser atribuído ao anexo:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->greeting('Hello!')
                    ->attachData($this->pdf, 'name.pdf', [
                        'mime' => 'application/pdf',
                    ]);
    }
```

<a name="adding-tags-metadata"></a>
### Adição de tags e metadados

 Alguns provedores de e-mail, como o Mailgun e o Postmark, suportam "etiquetas" e "metadados" em mensagens que podem ser usadas para agrupar e acompanhar os e-mails enviados por sua aplicação. Você pode adicionar etiquetas e metadados à uma mensagem de e-mail via os métodos `tag` e `metadata`:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->greeting('Comment Upvoted!')
                    ->tag('upvote')
                    ->metadata('comment_id', $this->comment->id);
    }
```

 Se o seu aplicativo estiver a utilizar o driver Mailgun, consulte a documentação da Mailgun para obter mais informações sobre [tags](https://documentation.mailgun.com/en/latest/user_manual.html#tagging-1) e [meta-dados](https://documentation.mailgun.com/en/latest/user_manual.html#attaching-data-to-messages). Da mesma forma, a documentação do Postmark pode também ser consultada para obter mais informações sobre o seu suporte para [tags](https://postmarkapp.com/blog/tags-support-for-smtp) e [meta-dados](https://postmarkapp.com/support/article/1125-custom-metadata-faq).

 Se o seu aplicativo estiver a utilizar a Amazon SES para enviar e-mails, deve utilizar o método `metadata` para anexar [tags da SES](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) ao seu pedido.

<a name="customizing-the-symfony-message"></a>
### Personalizando a mensagem do Symfony

 O método `withSymfonyMessage`, da classe `MailMessage`, permite que você registre um closures que será chamado com a instância de Mensagem do Symfony antes do envio da mensagem. Isso oferece uma oportunidade para personalizar profundamente a mensagem antes dela ser entregue:

```php
    use Symfony\Component\Mime\Email;

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->withSymfonyMessage(function (Email $message) {
                        $message->getHeaders()->addTextHeader(
                            'Custom-Header', 'Header Value'
                        );
                    });
    }
```

<a name="using-mailables"></a>
### Usando as cartas de venda

 Se necessário, você poderá retornar um objeto de e-mail completo da metodologia `toMail` da sua notificação. Ao retornar um `Mailable` em vez de uma `MailMessage`, você precisará especificar o destinatário da mensagem usando a metodologia `to` do objeto de e-mail:

```php
    use App\Mail\InvoicePaid as InvoicePaidMailable;
    use Illuminate\Mail\Mailable;

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): Mailable
    {
        return (new InvoicePaidMailable($this->invoice))
                    ->to($notifiable->email);
    }
```

<a name="mailables-and-on-demand-notifications"></a>
#### Mensagens enviáveis e notificações sob demanda

 Se você estiver enviando uma notificação [a pedido](#notificações-a-pedido), a instância `$notifiable` passada ao método `toMail` será uma instância de `Illuminate\Notifications\AnonymousNotifiable`, que oferece um método `routeNotificationFor` que pode ser usado para recuperar o endereço de e-mail para onde a notificação a pedido deve ser enviada:

```php
    use App\Mail\InvoicePaid as InvoicePaidMailable;
    use Illuminate\Notifications\AnonymousNotifiable;
    use Illuminate\Mail\Mailable;

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): Mailable
    {
        $address = $notifiable instanceof AnonymousNotifiable
                ? $notifiable->routeNotificationFor('mail')
                : $notifiable->email;

        return (new InvoicePaidMailable($this->invoice))
                    ->to($address);
    }
```

<a name="previewing-mail-notifications"></a>
### Visualizar notificações de correio eletrónico

 Ao criar um modelo de notificação por e-mail, é conveniente previsualizar rapidamente a mensagem do correio eletrónico renderizada no navegador, como um modelo típico Blade. Por esse motivo, o Laravel permite devolver uma qualquer mensagem de correio eletrónico gerada por um aviso de e-mail diretamente de um fecho de rota ou controlador. Quando é devolvido um `MailMessage`, é renderizado e exibido no navegador, o que permite visualizar rapidamente o seu design sem necessidade de enviá-lo para um endereço de correio eletrónico real:

```php
    use App\Models\Invoice;
    use App\Notifications\InvoicePaid;

    Route::get('/notification', function () {
        $invoice = Invoice::find(1);

        return (new InvoicePaid($invoice))
                    ->toMail($invoice->user);
    });
```

<a name="markdown-mail-notifications"></a>
## Notificações de e-mail com marcação de texto

 As notificações por e-mail em formato de Markdown permitem aproveitar os modelos pré-construídos de notificações, aoЬof proporcionam mais liberdade para escrever mensagens personalizadas. Como as mensagens são escritas no formato Markdown, o Laravel é capaz de renderizar belíssimos templates HTML responiventes para as mensagens e também gerar automaticamente uma contrapartida em texto simples.

<a name="generating-the-message"></a>
### Gerando a mensagem

 Para gerar uma notificação com um modelo correspondente em Markdown, você pode usar a opção `--markdown` do comando de Artisan `make:notification`:

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

 Assim como todas as outras notificações por e-mail, as notificações que utilizem modelos de Markdown devem definir um método `toMail` na sua classe. No entanto, em vez de usar os métodos `line` e `action` para construir a notificação, utilize o método `markdown` para especificar o nome do modelo de Markdown que deve ser utilizado. Pode passar um array de dados disponíveis na segunda argumento:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = url('/invoice/'.$this->invoice->id);

        return (new MailMessage)
                    ->subject('Invoice Paid')
                    ->markdown('mail.invoice.paid', ['url' => $url]);
    }
```

<a name="writing-the-message"></a>
### Escrever a mensagem

 As notificações por correio eletrónico de texto em formato Markdown utilizam uma combinação de componentes Blade e sintaxe do Markdown, que permitem construir facilmente as notificações ao mesmo tempo que se tira partido dos componentes de notificação pré-criados no Laravel:

```blade
<x-mail::message>
# Invoice Paid

Your invoice has been paid!

<x-mail::button :url="$url">
View Invoice
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
```

<a name="button-component"></a>
#### Componente de botão

 O componente de botão exibe um link de botão centrado. O componente aceita dois argumentos, uma `url` e uma cor opcional. São suportadas as cores `primary`, `verde` e `vermelho`. Você pode adicionar quantas componentes de botão desejar a uma notificação:

```blade
<x-mail::button :url="$url" color="green">
View Invoice
</x-mail::button>
```

<a name="panel-component"></a>
#### Componente de painel

 O componente Painel mostra o bloco de texto indicado em um painel com uma cor de fundo ligeiramente diferente da do resto da notificação, permitindo chamar sua atenção para esse bloco de texto:

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### Componente de tabela

 O componente de tabela permite que você transforme uma tabela em formato Markdown em uma tabela HTML. Esse componente aceita a tabela em formato Markdown como conteúdo. O alinhamento das colunas da tabela é suportado usando o sintaxe de alinhamento padrão para tabelas em formato Markdown:

```blade
<x-mail::table>
| Laravel       | Table         | Example  |
| ------------- |:-------------:| --------:|
| Col 2 is      | Centered      | $10      |
| Col 3 is      | Right-Aligned | $20      |
</x-mail::table>
```

<a name="customizing-the-components"></a>
### Personalizando os componentes

 Você pode exportar todos os componentes de notificação em linguagem Markdown para sua própria aplicação e fazer a personalização. Para exportar os componentes, use o comando Artisan `vendor:publish` para publicar a tag de ativo `laravel-mail`:

```shell
php artisan vendor:publish --tag=laravel-mail
```

 Este comando publica os componentes de correio eletrônico em Markdown no diretório `resources/views/vendor/mail`. O diretório `mail` contém um diretório `html` e um `text`, cada um contendo suas respectivas representações de todos os componentes disponíveis. Você pode personalizar esses componentes como preferir.

<a name="customizing-the-css"></a>
#### Personalizar o CSS

 Após exportar os componentes, o diretório `resources/views/vendor/mail/html/themes` conterá um arquivo `default.css`. Você poderá personalizar seu CSS neste arquivo e seus estilos serão automaticamente in-linados dentro das representações HTML de suas notificações em Markdown.

 Se você deseja construir um tema totalmente novo para os componentes de Markdown do Laravel, poderá colocar um arquivo CSS dentro da diretoria `html/themes`. Após nomear e salvar seu arquivo CSS, atualize a opção `theme` do arquivo de configuração `mail` para combinar com o nome do seu novo tema.

 Para personalizar o tema de uma notificação individual, pode chamar a método `theme` ao construir a mensagem de correio da notificação. A método `theme` aceita o nome do tema que deve ser usado quando se envia a notificação:

```php
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->theme('invoice')
                    ->subject('Invoice Paid')
                    ->markdown('mail.invoice.paid', ['url' => $url]);
    }
```

<a name="database-notifications"></a>
## Notificações de base de dados

<a name="database-prerequisites"></a>
### Pré-requisitos

 O canal de notificação do tipo "base de dados" armazena informações da notificação numa tabela da base de dados. Essa tabela inclui informações, como o tipo de notificação e uma estrutura de dados JSON que descreve a notificação.

 Você pode consultar a tabela para exibir as notificações na interface do usuário da sua aplicação. Porém, antes disso, você precisará criar uma tabela de banco de dados para armazenar suas notificações. Você poderá usar o comando `make:notifications-table` para gerar uma [migração](/docs/migrations) com o esquema de tabela adequado:

```shell
php artisan make:notifications-table

php artisan migrate
```

 > [!NOTA]
 [Chaves primárias UUID ou ULID](//docs.laravel.com/eloquent#uuid-and-ulid-keys), você deve substituir o método `morphs` por

<a name="formatting-database-notifications"></a>
### Organizando notificações de banco de dados

 Se uma notificação permitir ser armazenada numa tabela de banco de dados, você deve definir um método `toDatabase` ou `toArray` na classe de notificação. Este método receberá a entidade `$notifiable` e deverá retornar uma matriz simples em PHP. A matriz retornada será codificada como JSON e armazenada na coluna `data` da sua tabela `notifications`. Vejamos um exemplo do método `toArray`:

```php
    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'invoice_id' => $this->invoice->id,
            'amount' => $this->invoice->amount,
        ];
    }
```

 Quando a notificação for armazenada no banco de dados da aplicação, a coluna `type` será preenchida com o nome da classe da notificação. No entanto, você pode personalizar esse comportamento definindo um método `databaseType` na sua classe de notificação:

```php
    /**
     * Get the notification's database type.
     *
     * @return string
     */
    public function databaseType(object $notifiable): string
    {
        return 'invoice-paid';
    }
```

<a name="todatabase-vs-toarray"></a>
#### `paraBancoDeDados` vs. `paraMatriz`

 O método `toArray` é também usado pelo canal `broadcast` para determinar quais dados irão ser transmitidos ao frontend de código JavaScript. Se pretender dois representantes de matriz diferentes para os canais `database` e `broadcast`, deve definir um método `toDatabase` em vez do método `toArray`.

<a name="accessing-the-notifications"></a>
### Acessar as notificações

 Depois que as notificações estiverem armazenadas no banco de dados, você precisa de um meio conveniente para acessá-las em suas entidades notificáveis. O `Illuminate\Notifications\Notifiable` traço, incluído no modelo padrão `App\Models\User` do Laravel, inclui uma [relação Eloquent](/docs/eloquent-relationships) chamada `notificações`, que retorna as notificações para a entidade. Para recuperar notificações, você pode acessar esse método como qualquer outra relação Eloquent:

```php
    $user = App\Models\User::find(1);

    foreach ($user->notifications as $notification) {
        echo $notification->type;
    }
```

 Se você quiser recuperar apenas as notificações "não lidas", poderá usar o relacionamento `unreadNotifications`. Mais uma vez, essas notificações serão ordenadas pelo timestamp `created_at` com as notificações mais recentes no início da coleção:

```php
    $user = App\Models\User::find(1);

    foreach ($user->unreadNotifications as $notification) {
        echo $notification->type;
    }
```

 > [!ATENÇÃO]
 > Para obter acesso às suas notificações do seu aplicativo de JavaScript, você deve definir um controlador de notificação para sua aplicação que retorne as notificações de uma entidade notificável, como o usuário atual. Você pode então fazer uma solicitação HTTP ao URL desse controlador do seu cliente JavaScript.

<a name="marking-notifications-as-read"></a>
### Marcando notificações como lidas

 Normalmente, você deseja marcar uma notificação como "lida" quando o usuário visualiza. O traço `Illuminate\Notifications\Notifiable` fornece um método `markAsRead`, que atualiza a coluna `read_at` do registro de banco de dados da notificação:

```php
    $user = App\Models\User::find(1);

    foreach ($user->unreadNotifications as $notification) {
        $notification->markAsRead();
    }
```

 No entanto, em vez de executar um loop através de cada notificação, você poderá usar o método `markAsRead` diretamente em uma coleção de notificações.

```php
    $user->unreadNotifications->markAsRead();
```

 Você também pode usar uma consulta de atualização em massa para marcar todas as notificações como lidas sem recuperá-las do banco de dados.

```php
    $user = App\Models\User::find(1);

    $user->unreadNotifications()->update(['read_at' => now()]);
```

 Podem remover as notificações da tabela de forma definitiva, desmarcando a casilla "Deletar".

```php
    $user->notifications()->delete();
```

<a name="broadcast-notifications"></a>
## Notificações de transmissão

<a name="broadcast-prerequisites"></a>
### Pré-requisitos

 Antes da transmissão de notificações, deve ser feita uma configuração e familiarização com os serviços de [transmissão de eventos] (https://laravel.com/docs/5.8/broadcasting) do Laravel. A transmissão de eventos fornece uma maneira de reagir a eventos no lado servidor do Laravel por meio da interface gráfica front-end alimentada pelo JavaScript.

<a name="formatting-broadcast-notifications"></a>
### Configurando notificações de transmissão

 O canal `broadcast` transmite notificações usando o serviço de transmissão de eventos do Laravel ([event broadcasting](/docs/broadcasting), na tradução). Isso permite que seu frontend alimentado por JavaScript receba notificações em tempo real. Se uma notificação suportar a transmissão, você pode definir um método `toBroadcast` na classe de notificação. Esse método receberá uma entidade `$notifiable` e deve retornar uma instância da classe `BroadcastMessage`. Se o método `toBroadcast` não existir, será usado o método `toArray` para reunir os dados que deverão ser transmitidos. Os dados retornados serão codificados como JSON e transmitidos ao seu frontend alimentado por JavaScript. Vamos dar uma olhada em um exemplo de método `toBroadcast`:

```php
    use Illuminate\Notifications\Messages\BroadcastMessage;

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'invoice_id' => $this->invoice->id,
            'amount' => $this->invoice->amount,
        ]);
    }
```

<a name="broadcast-queue-configuration"></a>
#### Configuração da fila de difusão

 Todas as notificações de transmissão são agendadas para serem transmitidas. Se você quiser configurar a conexão da fila ou o nome de uma fila que é usado para agendar a operação de transmissão, pode usar os métodos `onConnection` e `onQueue` do `BroadcastMessage`:

```php
    return (new BroadcastMessage($data))
                    ->onConnection('sqs')
                    ->onQueue('broadcasts');
```

<a name="customizing-the-notification-type"></a>
#### Personalizar o Tipo de Notificação

 Além dos dados especificados, todas as notificações de transmissão têm também um campo `type` que contém o nome da classe completo da notificação. Se pretender personalizar o tipo de notificação, pode definir um método `broadcastType` na classe de notificação:

```php
    /**
     * Get the type of the notification being broadcast.
     */
    public function broadcastType(): string
    {
        return 'broadcast.message';
    }
```

<a name="listening-for-notifications"></a>
### Escutar notificações

 As notificações serão transmitidas num canal privado formatado usando uma convenção `{notifiable}.{id}`. Assim, se estiver a enviar uma notificação para uma instância de `App\Models\User` com um ID de `1`, a notificação será transmitida no canal privado `App.Models.User.1`. Quando utilizarmos o [Laravel Echo](/docs/broadcasting#client-side-installation), podemos ouvir facilmente as notificações num canal usando o método `notification`:

```php
    Echo.private('App.Models.User.' + userId)
        .notification((notification) => {
            console.log(notification.type);
        });
```

<a name="customizing-the-notification-channel"></a>
#### Personalização do Canal de Notificação

 Se você quiser personalizar em qual canal as notificações de transmissão serão transmitidas para uma entidade, pode definir um método `receivesBroadcastNotificationsOn` na entidade notificável.

```php
    <?php

    namespace App\Models;

    use Illuminate\Broadcasting\PrivateChannel;
    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * The channels the user receives notification broadcasts on.
         */
        public function receivesBroadcastNotificationsOn(): string
        {
            return 'users.'.$this->id;
        }
    }
```

<a name="sms-notifications"></a>
## Notificações por SMS

<a name="sms-prerequisites"></a>
### Pré-requisitos

 As notificações SMS em Laravel são suportadas pelo [Vonage](https://www.vonage.com/) (anteriormente conhecido como Nexmo). Antes de poder enviar notificações através do Vonage, é necessário instalar os pacotes `laravel/vonage-notification-channel` e `guzzlehttp/guzzle`:

```php
    composer require laravel/vonage-notification-channel guzzlehttp/guzzle
```

 O pacote inclui um arquivo de configuração [aqui](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php). No entanto, você não é obrigado a exportar esse arquivo de configuração para sua própria aplicação. É possível simplesmente usar as variáveis de ambiente `VONAGE_KEY` e `VONAGE_SECRET` para definir suas chaves pública e secreta do Vonage.

 Depois de definir suas chaves, você deve configurar uma variável de ambiente `VONAGE_SMS_FROM` que define o número do telefone do qual seus mensagens SMS devem ser enviadas por padrão. Você pode gerar este número no painel de controle da Vonage:

```php
    VONAGE_SMS_FROM=15556666666
```

<a name="formatting-sms-notifications"></a>
### Como formatar notificações de SMS

 Se a notificação for enviada como um SMS, você deve definir uma método `toVonage` na classe da notificação. Este método receberá uma entidade `$notifiable` e deverá retornar uma instância do tipo Illuminate\Notifications\Messages\VonageMessage:

```php
    use Illuminate\Notifications\Messages\VonageMessage;

    /**
     * Get the Vonage / SMS representation of the notification.
     */
    public function toVonage(object $notifiable): VonageMessage
    {
        return (new VonageMessage)
                    ->content('Your SMS message content');
    }
```

<a name="unicode-content"></a>
#### Conteúdo Unicode

 Se sua mensagem de SMS conter caracteres unicode, você deve chamar o método `unicode` ao construir a instância da classe `VonageMessage`:

```php
    use Illuminate\Notifications\Messages\VonageMessage;

    /**
     * Get the Vonage / SMS representation of the notification.
     */
    public function toVonage(object $notifiable): VonageMessage
    {
        return (new VonageMessage)
                    ->content('Your unicode message')
                    ->unicode();
    }
```

<a name="customizing-the-from-number"></a>
### Personalizar o número de origem

 Se pretender enviar algumas notificações a partir de um número de telemóvel diferente do indicado pela variável de ambiente `VONAGE_SMS_FROM`, poderá chamar o método `from` numa instância da classe `VonageMessage`:

```php
    use Illuminate\Notifications\Messages\VonageMessage;

    /**
     * Get the Vonage / SMS representation of the notification.
     */
    public function toVonage(object $notifiable): VonageMessage
    {
        return (new VonageMessage)
                    ->content('Your SMS message content')
                    ->from('15554443333');
    }
```

<a name="adding-a-client-reference"></a>
### Adicionar uma referência de cliente

 Se você quiser controlar os custos por usuário, equipe ou cliente, pode adicionar uma "referência do cliente" à notificação. A Vonage permite que você gerencie relatórios com base nessa referência para entender melhor o uso de SMS de um determinado cliente. O nome da referência pode conter até 40 caracteres:

```php
    use Illuminate\Notifications\Messages\VonageMessage;

    /**
     * Get the Vonage / SMS representation of the notification.
     */
    public function toVonage(object $notifiable): VonageMessage
    {
        return (new VonageMessage)
                    ->clientReference((string) $notifiable->id)
                    ->content('Your SMS message content');
    }
```

<a name="routing-sms-notifications"></a>
### Encaminhamento de notificações por SMS

 Para encaminhar as notificações da Vonage para o número correto de telefone, defina um método `routeNotificationForVonage` em sua entidade notificável:

```php
    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Notifications\Notification;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * Route notifications for the Vonage channel.
         */
        public function routeNotificationForVonage(Notification $notification): string
        {
            return $this->phone_number;
        }
    }
```

<a name="slack-notifications"></a>
## Notificações do Slack

<a name="slack-prerequisites"></a>
### Pré-requisitos

 Antes de enviar notificações no Slack, você deve instalar o canal de notificação do Slack via Composer:

```shell
composer require laravel/slack-notification-channel
```

 Você também deve criar um aplicativo [Slack](https://api.slack.com/apps?new_app=1) para seu ambiente de trabalho no Slack.

 Se você precisa apenas enviar notificações para o mesmo ambiente de trabalho do Slack em que a Aplicativo foi criado, deve garantir que sua Aplicativo tenha os escopos `chat:write`, `chat:write.public` e `chat:write.customize`. Esses escopos podem ser adicionados na guia de gerenciamento da "OAuth & Permissões" dentro do Slack.

 Em seguida, copie o “Bot User OAuth Token” do App e coloque-o dentro de uma matriz de configuração `slack` no arquivo de configuração do seu aplicativo `services.php`. Esse token pode ser encontrado na aba "OAuth & Permissions" (OAuth e permissões) em Slack:

```php
    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
```

<a name="slack-app-distribution"></a>
#### Distribuição de Aplicativos

 Se o aplicativo estiver enviando notificações para espaços de trabalho externos no Slack que pertencem a usuários do seu aplicativo, você terá que "distribuir" seu App pelo Slack. A distribuição da sua Aplicação pode ser gerenciada na guia "Gerenciar Distribuição" (Manage Distribution) de sua App no Slack. Depois que a sua App for distribuída, você poderá usar o [Socialite](/docs/socialite) para obter tokens do Bot do Slack em nome dos usuários de seu aplicativo.

<a name="formatting-slack-notifications"></a>
### Organizando notificações do Slack

 Se uma notificação suportar ser enviada como uma mensagem do Slack, você deve definir um método `toSlack` na classe de notificação. Esse método receberá a entidade `$notifiable` e deve retornar uma instância da classe `Illuminate\Notifications\Slack\SlackMessage`. Você pode construir notificações ricas usando [o API do Slack's Block Kit](https://api.slack.com/block-kit). O exemplo a seguir pode ser visualizado no [Construtor de bloco do Slack](https://app.slack.com/block-kit-builder/T01KWS6K23Z#{%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22plain_text%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D).

```php
    use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
    use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
    use Illuminate\Notifications\Slack\BlockKit\Composites\ConfirmObject;
    use Illuminate\Notifications\Slack\SlackMessage;

    /**
     * Get the Slack representation of the notification.
     */
    public function toSlack(object $notifiable): SlackMessage
    {
        return (new SlackMessage)
                ->text('One of your invoices has been paid!')
                ->headerBlock('Invoice Paid')
                ->contextBlock(function (ContextBlock $block) {
                    $block->text('Customer #1234');
                })
                ->sectionBlock(function (SectionBlock $block) {
                    $block->text('An invoice has been paid.');
                    $block->field("*Invoice No:*\n1000")->markdown();
                    $block->field("*Invoice Recipient:*\ntaylor@laravel.com")->markdown();
                })
                ->dividerBlock()
                ->sectionBlock(function (SectionBlock $block) {
                    $block->text('Congratulations!');
                });
    }
```

<a name="slack-interactivity"></a>
### Interatividade do Slack

 O sistema de notificação Block Kit da Slack fornece recursos poderosos para [interação com o usuário](https://api.slack.com/interactivity/handling). Para utilizar esses recursos, a sua Aplicativo Slack deve ter a "Interatividade" ativada e uma "URL de solicitação" configurada para apontar para uma URL servida pela aplicação. Essas configurações podem ser gerenciadas na aba de gerenciamento da App "Interatividade & Atalhos", dentro do Slack.

 No exemplo a seguir, que utiliza o método `actionsBlock`, a Slack enviará um pedido de tipo `POST` para seu "URL de solicitação" com uma carga útil contendo informações sobre o usuário do Slack que clicou no botão, o ID do botão que foi clicado e outros dados. Sua aplicação poderá determinar a ação a ser tomada com base na carga útil. Além disso, você deve [verificar se o pedido foi feito pela Slack](https://api.slack.com/authentication/verifying-requests-from-slack):

```php
    use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
    use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
    use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
    use Illuminate\Notifications\Slack\SlackMessage;

    /**
     * Get the Slack representation of the notification.
     */
    public function toSlack(object $notifiable): SlackMessage
    {
        return (new SlackMessage)
                ->text('One of your invoices has been paid!')
                ->headerBlock('Invoice Paid')
                ->contextBlock(function (ContextBlock $block) {
                    $block->text('Customer #1234');
                })
                ->sectionBlock(function (SectionBlock $block) {
                    $block->text('An invoice has been paid.');
                })
                ->actionsBlock(function (ActionsBlock $block) {
                     // ID defaults to "button_acknowledge_invoice"...
                    $block->button('Acknowledge Invoice')->primary();

                    // Manually configure the ID...
                    $block->button('Deny')->danger()->id('deny_invoice');
                });
    }
```

<a name="slack-confirmation-modals"></a>
#### Assistentes de confirmação

 Se pretender obrigar os utilizadores a confirmar uma acção antes de esta ser executada, pode chamar a metoda `confirm` ao definir o botão. A `confirm` aceita como parâmetro uma mensagem e um fecho que recebe uma instância da classe `ConfirmObject`:

```php
    use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
    use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
    use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
    use Illuminate\Notifications\Slack\BlockKit\Composites\ConfirmObject;
    use Illuminate\Notifications\Slack\SlackMessage;

    /**
     * Get the Slack representation of the notification.
     */
    public function toSlack(object $notifiable): SlackMessage
    {
        return (new SlackMessage)
                ->text('One of your invoices has been paid!')
                ->headerBlock('Invoice Paid')
                ->contextBlock(function (ContextBlock $block) {
                    $block->text('Customer #1234');
                })
                ->sectionBlock(function (SectionBlock $block) {
                    $block->text('An invoice has been paid.');
                })
                ->actionsBlock(function (ActionsBlock $block) {
                    $block->button('Acknowledge Invoice')
                        ->primary()
                        ->confirm(
                            'Acknowledge the payment and send a thank you email?',
                            function (ConfirmObject $dialog) {
                                $dialog->confirm('Yes');
                                $dialog->deny('No');
                            }
                        );
                });
    }
```

<a name="inspecting-slack-blocks"></a>
#### Inspecionando blocos no Slack

 Se pretender inspecionar rapidamente os blocos que vêm construindo, pode invocar o método `dd` na instância de `SlackMessage`. O método `dd` irá gerar e imprimir um URL para a [Block Kit Builder](https://app.slack.com/block-kit-builder/) do Slack, que mostra uma visualização prévia da carga útil e notificação no seu browser. Pode passar `true` ao método `dd` para imprimir a carga útil sem formatação:

```php
    return (new SlackMessage)
            ->text('One of your invoices has been paid!')
            ->headerBlock('Invoice Paid')
            ->dd();
```

<a name="routing-slack-notifications"></a>
### Encaminhando notificações do Slack

 Para direcionar as notificações do Slack para o grupo e canal Slack correspondentes, defina um método `routeNotificationForSlack` em seu modelo que pode retornar uma de três opções:

 - `null`, que redireciona a canalização para o canal configurado na própria notificação. Você pode usar o método `to` ao criar sua mensagem de "SlackMessage" para configurar o canal dentro da notificação.
 - Uma string que especifica o canal do Slack para o qual a notificação será enviada, por exemplo, `#canal-de-suporte`.
 - Uma instância de `SlackRoute`, que permite especificar um token OAuth e o nome do canal, por exemplo, `SlackRoute::make($this->slack_channel, $this->slack_token)`. Este método deve ser utilizado para enviar notificações para espaços de trabalho externos.

 Por exemplo, ao retornar "#support-channel" a partir do método `routeNotificationForSlack`, o comando enviará a notificação para o canal "#support-channel" no espaço de trabalho associado ao token do Usuário de Bot OAuth localizado no arquivo de configuração `services.php` da sua aplicação:

```php
    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Notifications\Notification;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * Route notifications for the Slack channel.
         */
        public function routeNotificationForSlack(Notification $notification): mixed
        {
            return '#support-channel';
        }
    }
```

<a name="notifying-external-slack-workspaces"></a>
### Notificação de Espaços de Trabalho Externos do Slack

 > [!AVISO]
 [distribuído](slack-app-distribution)

 Obviamente, normalmente você vai querer enviar notificações para os espaços de trabalho do Slack que pertencem aos usuários da sua aplicação. Para fazer isso, primeiro é necessário obter um token OAuth do Slack para o usuário. Aproveite! [Laravel Socialite](/docs/socialite) inclui um driver do Slack que permite autenticar os usuários da sua aplicação com facilidade no Slack e [obter um bot token](/docs/socialite#slack-bot-scopes).

 Uma vez que você tenha obtido o token do bot e armazenado-o no banco de dados da sua aplicação, poderá utilizar a função `SlackRoute::make` para encaminhar uma notificação ao espaço de trabalho do usuário. Além disso, é provável que sua aplicação ofereça a oportunidade para que o usuário especifique em qual canal devem ser enviadas as notificações:

```php
    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Notifications\Notification;
    use Illuminate\Notifications\Slack\SlackRoute;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * Route notifications for the Slack channel.
         */
        public function routeNotificationForSlack(Notification $notification): mixed
        {
            return SlackRoute::make($this->slack_channel, $this->slack_token);
        }
    }
```

<a name="localizing-notifications"></a>
## Localizar as notificações

 O Laravel permite o envio de notificações em uma língua estrangeira diferente da língua corrente no pedido HTTP e até se lembra desta língua se a notificação for agendada.

 Para realizar esta operação, a classe Illuminate\Notifications\Notification oferece um método `locale` para definir o idioma desejado. A aplicação passará para esse idioma quando a notificação estiver sendo avaliada e voltará ao idioma anterior quando a avaliação for concluída:

```php
    $user->notify((new InvoicePaid($invoice))->locale('es'));
```

 A localização de várias entradas a serem notificadas também pode ser feita através da interface frontal `Notification`:

```php
    Notification::locale('es')->send(
        $users, new InvoicePaid($invoice)
    );
```

<a name="user-preferred-locales"></a>
### Localizações preferidas do usuário

 Algumas vezes, os aplicativos armazenam o local preferido de cada usuário. Ao implementar o contrato `HasLocalePreference` em seu modelo notificável, você pode instruir Laravel a usar este local armazenado ao enviar uma notificação:

```php
    use Illuminate\Contracts\Translation\HasLocalePreference;

    class User extends Model implements HasLocalePreference
    {
        /**
         * Get the user's preferred locale.
         */
        public function preferredLocale(): string
        {
            return $this->locale;
        }
    }
```

 Uma vez implementada a interface, o Laravel vai automaticamente utilizar a localização preferida quando enviar notificações e mensagens para os modelos. Não é necessário chamar o método `locale`.

```php
    $user->notify(new InvoicePaid($invoice));
```

<a name="testing"></a>
## Teste

 É possível usar o método `fake` da facade `Notification` para impedir que notificações sejam enviadas. Normalmente, o envio de notificações não está relacionado com o código que você está testando e provavelmente, é suficiente simplesmente afirmar que o Laravel recebeu instruções para enviar uma determinada notificação.

 Depois de invocar o método `fake` da interface principal `Notification`, você pode afirmar que as notificações foram solicitadas para serem enviadas aos usuários e, até mesmo, inspecionar os dados das notificações recebidas:

```php tab=Pest
<?php

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;

test('orders can be shipped', function () {
    Notification::fake();

    // Perform order shipping...

    // Assert that no notifications were sent...
    Notification::assertNothingSent();

    // Assert a notification was sent to the given users...
    Notification::assertSentTo(
        [$user], OrderShipped::class
    );

    // Assert a notification was not sent...
    Notification::assertNotSentTo(
        [$user], AnotherNotification::class
    );

    // Assert that a given number of notifications were sent...
    Notification::assertCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Notification::fake();

        // Perform order shipping...

        // Assert that no notifications were sent...
        Notification::assertNothingSent();

        // Assert a notification was sent to the given users...
        Notification::assertSentTo(
            [$user], OrderShipped::class
        );

        // Assert a notification was not sent...
        Notification::assertNotSentTo(
            [$user], AnotherNotification::class
        );

        // Assert that a given number of notifications were sent...
        Notification::assertCount(3);
    }
}
```

 É possível passar uma verificação às funções `assertSentTo` ou `assertNotSentTo` para afirmar que uma notificação foi enviada com sucesso e passou no "teste de verdade". Se tiver sido enviada, pelo menos, uma notificação que passe no teste de verdade, a assertiva será bem-sucedida:

```php
    Notification::assertSentTo(
        $user,
        function (OrderShipped $notification, array $channels) use ($order) {
            return $notification->order->id === $order->id;
        }
    );
```

<a name="on-demand-notifications"></a>
#### Notificações sob demanda

 Se o código que você está testando enviar notificações sob demanda (#notificações_sob_demande) [, você pode testar se a notificação sob demanda foi enviada usando o método `assertSentOnDemand`]:

```php
    Notification::assertSentOnDemand(OrderShipped::class);
```

 Ao passar um closure como o segundo argumento para o método `assertSentOnDemand`, você pode determinar se uma notificação sob demanda foi enviada ao endereço correto da "rota":

```php
    Notification::assertSentOnDemand(
        OrderShipped::class,
        function (OrderShipped $notification, array $channels, object $notifiable) use ($user) {
            return $notifiable->routes['mail'] === $user->email;
        }
    );
```

<a name="notification-events"></a>
## Eventos de notificação

<a name="notification-sending-event"></a>
#### Notificação de evento de envio

 Quando uma notificação é enviada, o evento `Illuminate\Notifications\Events\NotificationSending` é disparado pelo sistema de notificações. Nele estão contidos a entidade "notificável" e a própria instância da notificação. Pode criar [escutadores de eventos](/docs/events) para este evento na sua aplicação:

```php
    use Illuminate\Notifications\Events\NotificationSending;

    class CheckNotificationStatus
    {
        /**
         * Handle the given event.
         */
        public function handle(NotificationSending $event): void
        {
            // ...
        }
    }
```

 A notificação não é enviada se um evento de ouvinte de eventos para o evento "NotificationSending" retornar `false` na sua metodologia `handle`:

```php
    /**
     * Handle the given event.
     */
    public function handle(NotificationSending $event): bool
    {
        return false;
    }
```

 Dentro de um evento escuta, você pode acessar as propriedades `notifiable`, `notification` e `channel` no evento para saber mais sobre o destinatário da notificação ou sobre ela própria:

```php
    /**
     * Handle the given event.
     */
    public function handle(NotificationSending $event): void
    {
        // $event->channel
        // $event->notifiable
        // $event->notification
    }
```

<a name="notification-sent-event"></a>
#### Notificação enviada para o Evento

 Quando um aviso é enviado, o `Illuminate\Notifications\Events\NotificationSent` [evento](/docs/events) é liberado pelo sistema de notificações. Nele estão a entidade "notificável" e a própria instância da notificação. É possível criar [ouvinte de eventos](/docs/events) para este evento dentro da aplicação:

```php
    use Illuminate\Notifications\Events\NotificationSent;

    class LogNotification
    {
        /**
         * Handle the given event.
         */
        public function handle(NotificationSent $event): void
        {
            // ...
        }
    }
```

 Nos eventos, você pode usar as propriedades `notifiable`, `notification`, `channel` e `response` para obter informações adicionais sobre o destinatário da notificação ou a própria notificação:

```php
    /**
     * Handle the given event.
     */
    public function handle(NotificationSent $event): void
    {
        // $event->channel
        // $event->notifiable
        // $event->notification
        // $event->response
    }
```

<a name="custom-channels"></a>
## Canais Personalizados

 O Laravel vem com alguns canais de notificações, mas você pode querer escrever seus próprios drivers para entregar notificações por outros canais. Isso é simples no Laravel. Para começar, defina uma classe que contenha um método `send`. O método deve receber dois argumentos: um `$notifiable` e uma `$notification`.

 Dentro do método `send`, você pode chamar os métodos na notificação para recuperar um objeto de mensagem compreendido pelo seu canal e, em seguida, enviar a notificação para a instância `$notifiable` como preferir:

```php
    <?php

    namespace App\Notifications;

    use Illuminate\Notifications\Notification;

    class VoiceChannel
    {
        /**
         * Send the given notification.
         */
        public function send(object $notifiable, Notification $notification): void
        {
            $message = $notification->toVoice($notifiable);

            // Send notification to the $notifiable instance...
        }
    }
```

 Uma vez definida a sua classe de canal de notificação, você pode retornar o nome da classe na chamada `via` em qualquer uma das suas notificações. Neste exemplo, o método `toVoice` de sua notificação pode retornar qualquer objeto que você escolher para representar as mensagens de voz. Por exemplo, você pode definir a sua própria classe `Voz` para representar essas mensagens:

```php
    <?php

    namespace App\Notifications;

    use App\Notifications\Messages\VoiceMessage;
    use App\Notifications\VoiceChannel;
    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Notifications\Notification;

    class InvoicePaid extends Notification
    {
        use Queueable;

        /**
         * Get the notification channels.
         */
        public function via(object $notifiable): string
        {
            return VoiceChannel::class;
        }

        /**
         * Get the voice representation of the notification.
         */
        public function toVoice(object $notifiable): VoiceMessage
        {
            // ...
        }
    }
```
