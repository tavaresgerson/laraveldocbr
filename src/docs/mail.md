# E-mail

<a name="introduction"></a>
## Introdução

Enviar e-mail não precisa ser complicado. O Laravel fornece uma API de e-mail simples e limpa, baseada na popular componente [Symfony Mailer](https://symfony.com/doc/current/mailer.html). O Laravel e o Symfony Mailer oferecem drivers para envio de e-mail via SMTP, Mailgun, Postmark, Resend, Amazon SES e sendmail. Você pode iniciar rapidamente o envio de mensagens através de um serviço baseado em nuvem ou local, conforme preferir.

<a name="configuration"></a>
### Configuração

Os serviços de e-mail do Laravel podem ser configurados através do ficheiro `config/mail.php` da aplicação. Cada correspondente configurado neste ficheiro pode ter uma configuração própria única, podendo até dispor de um "transportador" único, permitindo à sua aplicação utilizar serviços de e-mail diferentes para enviar determinados emails. Por exemplo, a aplicação poderá utilizar o Postmark para enviar e-mails transacionais, enquanto que o Amazon SES pode ser usado para enviar e-mails em massa.

No seu arquivo de configuração `mail`, você encontrará uma matriz `mailers` de configurações. Esta matriz contém uma entrada de amostra para cada um dos principais transportes/motores de e-mail suportados pelo Laravel. O valor de configuração "_default_" determina qual o servidor de e-mail será usado por padrão quando a sua aplicação precisar enviar mensagens de e-mails.

<a name="driver-prerequisites"></a>
### Pré-requisitos para driver/transporte

Os drivers baseados em APIs como o Mailgun, Postmark, Resend e MailerSend são geralmente mais simples e rápidos do que enviar mensagens por meio de servidores SMTP. Sempre que possível, recomendamos que você use um desses motoristas.

<a name="mailgun-driver"></a>
#### Driver do Mailgun

Para usar o driver do Mailgun, instale o transporte de envio do Mailgun do Symfony através do Composer:

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

Em seguida, defina a opção `default` no arquivo de configuração `config/mail.php` da sua aplicação para `mailgun` e adicione o seguinte array de configuração ao seu array de `mailers`:

```php
    'mailgun' => [
        'transport' => 'mailgun',
        // 'client' => [
        //     'timeout' => 5,
        // ],
    ],
```

Depois de configurar o sistema de e-mail padrão do seu aplicativo, adicione as seguintes opções ao arquivo de configuração `config/services.php`:

```php
    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],
```

Se você não estiver usando a região [Mailgun dos Estados Unidos](https://documentation.mailgun.com/en/latest/api-intro.html#mailgun-regions), você poderá definir o ponto final da sua região no arquivo de configuração `services`:

```php
    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.eu.mailgun.net'),
        'scheme' => 'https',
    ],
```

<a name="postmark-driver"></a>
#### Driver do Postmark

Para usar o driver do [Postmark](https://postmarkapp.com/), instale o transporte de envio de email Postmark com o Composer:

```shell
composer require symfony/postmark-mailer symfony/http-client
```

Em seguida, defina a opção `default` no arquivo de configuração do aplicativo `config/mail.php` como `postmark`. Depois de configurar o e-mail padrão do seu aplicativo, certifique-se que seu arquivo de configuração `config/services.php` contenha as seguintes opções:

```php
    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],
```

Se você quiser especificar o fluxo de mensagens Postmark que deve ser usado por um determinado mailer, você pode adicionar a opção de configuração `message_stream_id` ao array de configuração do mailer. Este array de configuração pode ser encontrado no arquivo de configuração `config/mail.php` do seu aplicativo:

```php
    'postmark' => [
        'transport' => 'postmark',
        'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
        // 'client' => [
        //     'timeout' => 5,
        // ],
    ],
```

Dessa forma, você também será capaz de criar vários envio de e-mail com fluxos diferentes de mensagens.

<a name="resend-driver"></a>
#### Driver do Resend

Para usar o driver da [Resend](https://resend.com/), instale o PHP SDK da Resend através do Composer:

```shell
composer require resend/resend-php
```

Depois, configure a opção `default` no arquivo de configuração do seu aplicativo `config/mail.php`, definindo-a para `resend`. Depois de configurar o serviço de envio padrão do seu aplicativo, certifique-se que o arquivo de configuração `config/services.php` contenha as seguintes opções:

```php
    'resend' => [
        'key' => env('RESEND_KEY'),
    ],
```

<a name="ses-driver"></a>
#### Driver do SES

Para usar o Amazon SES driver, você deve instalar primeiro o Amazon AWS SDK para PHP. Você pode instalar essa biblioteca através do gerenciador de pacotes Composer:

```shell
composer require aws/aws-sdk-php
```

Em seguida, defina a opção `default` em seu arquivo de configuração `config/mail.php` como `ses`, e verifique se o arquivo de configuração `config/services.php` contém as seguintes opções:

```php
    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],
```

Para utilizar credenciais temporárias da AWS através de um token de sessão, você pode adicionar uma chave "token" na configuração do seu aplicativo no SES:

```php
    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'token' => env('AWS_SESSION_TOKEN'),
    ],
```

Para interagir com as funcionalidades de gestão de assinaturas da [SES](https://docs.aws.amazon.com/ses/latest/dg/sending-email-subscription-management.html), você pode voltar a enviar o cabeçalho `X-Ses-List-Management-Options` no array retornado pela função [`headers`](#headers) de um email:

```php
/**
 * Obtenha os cabeçalhos das mensagens.
 */
public function headers(): Headers
{
    return new Headers(
        text: [
            'X-Ses-List-Management-Options' => 'contactListName=MyContactList;topicName=MyTopic',
        ],
    );
}
```

Se você deseja definir [opções adicionais](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail) que o Laravel deve passar ao método `SendEmail` do SDK AWS quando você enviar um e-mail, você pode definir uma matriz `options` dentro da sua configuração de `ses`:

```php
    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'options' => [
            'ConfigurationSetName' => 'MyConfigurationSet',
            'EmailTags' => [
                ['Name' => 'foo', 'Value' => 'bar'],
            ],
        ],
    ],
```

<a name="mailersend-driver"></a>
#### Driver do MailerSend

O MailerSend, um serviço de e-mail transacional e SMS, mantém seu próprio driver de e-mail baseado em API para o Laravel. O pacote contendo o driver pode ser instalado através do Composer:

```shell
composer require mailersend/laravel-driver
```

Depois que o pacote estiver instalado, adicione a variável de ambiente `MAILERSEND_API_KEY` ao arquivo de configuração do aplicativo com extensão `.env`. Além disso, a variável de ambiente `MAIL_MAILER` deve ser definida como `mailersend`:

```shell
MAIL_MAILER=mailersend
MAIL_FROM_ADDRESS=app@yourdomain.com
MAIL_FROM_NAME="App Name"

MAILERSEND_API_KEY=your-api-key
```

Por último, adicione o MailerSend à matriz `mailers` no arquivo de configuração do seu aplicativo `config/mail.php`:

```php
'mailersend' => [
    'transport' => 'mailersend',
],
```

Para saber mais sobre o MailerSend e como usar os modelos hospedados, consulte a documentação do [Driver MailerSend](https://github.com/mailersend/mailersend-laravel-driver#usage).

<a name="failover-configuration"></a>
### Configuração de Failover

Às vezes, um serviço externo que você configurou para enviar o e-mail do seu aplicativo pode estar inativo. Nesses casos, pode ser útil definir uma ou mais configurações de entrega de e-mail de backup que serão usadas caso seu driver de entrega principal esteja inativo.

Para isso, você deve definir um remetente na pasta de configuração do aplicativo `mail`, que utiliza o transporte `failover`. O array de configuração do remetente `failover` da sua aplicação deve conter um array de remetentes, indicando a ordem em que os remetentes devem ser escolhidos:

```php
    'mailers' => [
        'failover' => [
            'transport' => 'failover',
            'mailers' => [
                'postmark',
                'mailgun',
                'sendmail',
            ],
        ],

        // ...
    ],
```

Definido o seu envio de mensagens para falha, você deve definir este remetente como o remetente padrão usado pela sua aplicação especificando seu nome como valor da chave de configuração `default` dentro do arquivo de configuração `mail` da sua aplicação:

```php
    'default' => env('MAIL_MAILER', 'failover'),
```

<a name="round-robin-configuration"></a>
### Configuração Round Robin

O transporte de `roundrobin` permite distribuir o seu volume de correspondência entre vários remetentes. Para começar, defina um remetente dentro do ficheiro de configuração `mail` da sua aplicação que utilize o transporte de `roundrobin`. A matriz de configuração para o remetente de `roundrobin` da sua aplicação deve conter uma matriz de `mailers` que indica quais os remetentes configurados devem ser utilizados na entrega:

```php
    'mailers' => [
        'roundrobin' => [
            'transport' => 'roundrobin',
            'mailers' => [
                'ses',
                'postmark',
            ],
        ],

        // ...
    ],
```

Depois que seu mailer round robin for definido, você deve defini-lo como o mailer padrão usado pelo seu aplicativo, especificando seu nome como o valor da chave de configuração `default` no arquivo de configuração `mail` do seu aplicativo:

```php
    'default' => env('MAIL_MAILER', 'roundrobin'),
```

O transporte round robin seleciona um remetente aleatório da lista de remetentes configurados e depois alterna para o próximo remetente disponível em cada email subseqüente. Em contraste ao transporte `failover`, que ajuda a atingir *[alta disponibilidade](https://en.wikipedia.org/wiki/High_availability)*, o transporte roundrobin fornece *[balanço de carga](https://pt.wikipedia.org/wiki/Balanceamento_de_carga_(computação))*.

<a name="generating-mailables"></a>
## Gerando _Mailables_

Ao construir aplicativos Laravel, cada tipo de email enviado por seu aplicativo é representado como uma classe "_mailable_". Estas classes são armazenadas no diretório `app/Mail`. Não se preocupe se não ver este diretório em sua aplicação, pois ele será gerado para você ao criar sua primeira classe _mailable_ usando o comando Artisan `make:mail`:

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
## Escrever um e-mail

Depois de gerar uma classe e-mailável, é possível explorar o seu conteúdo. A configuração da classe e-mailável é feita por meio de vários métodos, incluindo os métodos `envelope`, `content` e `attachments`.

O método `envelope` retorna um objeto `Illuminate\Mail\Mailables\Envelope` que define o assunto e, por vezes, os destinatários da mensagem. O método `content` retorna um objeto `Illuminate\Mail\Mailables\Content` que define o template [Blade](/docs/blade) a ser usado para gerar o conteúdo da mensagem.

<a name="configuring-the-sender"></a>
### Configure o remetente

<a name="using-the-envelope"></a>
#### Usando o Envelope

Primeiro vamos explorar a configuração do remetente do e-mail ou, em outras palavras, quem será o endereço de "De". Existem duas maneiras para configurar o remetente. Em primeiro lugar, você pode especificar o endereço "De" no envelope da mensagem:

```php
    use Illuminate\Mail\Mailables\Address;
    use Illuminate\Mail\Mailables\Envelope;

    /**
     * Pegue o envelope da mensagem.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('jeffrey@example.com', 'Jeffrey Way'),
            subject: 'Order Shipped',
        );
    }
```

Caso queira, você também pode especificar um endereço `replyTo`:

```php
    return new Envelope(
        from: new Address('jeffrey@example.com', 'Jeffrey Way'),
        replyTo: [
            new Address('taylor@example.com', 'Taylor Otwell'),
        ],
        subject: 'Order Shipped',
    );
```

<a name="using-a-global-from-address"></a>
#### Usando um endereço global _from_

No entanto, se o seu aplicativo utilizar o mesmo endereço "_from_" (de onde) para todos os seus e-mails, pode ser complicado adicioná-la à cada classe emissora de e-mail que você gerar. Em vez disso, especifique uma direção global de "_from_" no seu arquivo de configuração `config/mail.php`. Esta direção será utilizada se nenhuma outra direção "_from_" tiver sido especificada dentro da classe emissora de e-mail:

```php
    'from' => [
        'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
        'name' => env('MAIL_FROM_NAME', 'Example'),
    ],
```

Além disso, você pode definir um endereço "_reply\_to_" global em seu arquivo de configuração `config/mail.php`:

```php
    'reply_to' => ['address' => 'example@example.com', 'name' => 'App Name'],
```

<a name="configuring-the-view"></a>
### Configuração da visualização

Dentro do método `content` de uma classe que pode ser enviada por e-mail, você pode definir o `view`, ou seja, qual template deve ser utilizado ao renderizar os conteúdos do e-mail. Como cada e-mail normalmente usa um [template Blade](/docs/blade) para renderizar seus conteúdos, você tem todo o poder e a conveniência do motor de templates Blade ao construir o HTML do seu e-mail:

```php
    /**
     * Obtenha a definição do conteúdo da mensagem.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.orders.shipped',
        );
    }
```

::: info NOTA
Você pode criar um diretório `resources/views/emails` para hospedar todos os templates de e-mails. No entanto, você é livre para colocá-los onde quiser dentro do seu diretório `resources/views`.
:::

<a name="plain-text-emails"></a>
#### E-mails em texto simples

Se você quiser definir uma versão de texto simples do seu e-mail, poderá especificar o modelo de texto simples ao criar a definição `Content` da mensagem. Assim como no parâmetro `view`, o parâmetro `text` deve ser um nome de modelo que será usado para renderizar os conteúdos do e-mail. Você pode definir uma versão HTML e texto simples do seu mensagem:

```php
    /**
     * Obtenha a definição do conteúdo da mensagem.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.orders.shipped',
            text: 'mail.orders.shipped-text'
        );
    }
```

Para maior clareza, o parâmetro `html` pode ser usado como um alias do parâmetro `view`:

```php
    return new Content(
        html: 'mail.orders.shipped',
        text: 'mail.orders.shipped-text'
    );
```

<a name="view-data"></a>
### Visualizar dados

<a name="via-public-properties"></a>
#### Por meio de propriedades públicas

Normalmente, você vai querer passar alguns dados para sua _view_ no qual poderá utilizar quando for renderizar o HTML do e-mail. Há duas formas de disponibilizar dados para sua _view_. Primeiro, qualquer propriedade pública definida em sua classe "_mailable_" estará automaticamente disponível na _view_. Assim, por exemplo, você pode passar os dados para o construtor da classe "_mailable_", e definir esses mesmos dados como propriedades públicas na classe:

```php
    <?php

    namespace App\Mail;

    use App\Models\Order;
    use Illuminate\Bus\Queueable;
    use Illuminate\Mail\Mailable;
    use Illuminate\Mail\Mailables\Content;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped extends Mailable
    {
        use Queueable, SerializesModels;

        /**
         * Crie uma nova instância de mensagem.
         */
        public function __construct(
            public Order $order,
        ) {}

        /**
         * Obtenha a definição do conteúdo da mensagem.
         */
        public function content(): Content
        {
            return new Content(
                view: 'mail.orders.shipped',
            );
        }
    }
```

Uma vez definidos os dados de uma propriedade pública, eles estarão automaticamente disponíveis na sua _view_, permitindo-lhe aceder a essas informações como se fossem qualquer outro tipo de dados nos seus modelos Blade:

```php
    <div>
        Price: {{ $order->price }}
    </div>
```

<a name="via-the-with-parameter"></a>
#### Por meio do parâmetro `with`:

Se você deseja personalizar o formato dos dados do e-mail antes de enviá-los para o modelo, poderá passar manualmente os seus dados à visualização através do parâmetro `with` na definição `Content`. Normalmente, você ainda passará os dados pelo construtor da classe que pode ser encaminhada por e-mail; no entanto, você deverá definir estes dados como propriedades `protected` ou `private`, para que não estejam automaticamente disponíveis ao modelo:

```php
    <?php

    namespace App\Mail;

    use App\Models\Order;
    use Illuminate\Bus\Queueable;
    use Illuminate\Mail\Mailable;
    use Illuminate\Mail\Mailables\Content;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped extends Mailable
    {
        use Queueable, SerializesModels;

        /**
         * Crie uma nova instância de mensagem.
         */
        public function __construct(
            protected Order $order,
        ) {}

        /**
         * Obtenha a definição do conteúdo da mensagem.
         */
        public function content(): Content
        {
            return new Content(
                view: 'mail.orders.shipped',
                with: [
                    'orderName' => $this->order->name,
                    'orderPrice' => $this->order->price,
                ],
            );
        }
    }
```

Uma vez passados os dados para o método `with`, eles estão automaticamente disponíveis na sua visualização. Você pode assim, aceder a esses dados como faria com qualquer outro dado em modelos Blade:

```php
    <div>
        Price: {{ $orderPrice }}
    </div>
```

<a name="attachments"></a>
### Anexos

Para adicionar anexos a um e-mail, você adicionará anexos ao array retornado pelo método `attachments` da mensagem. Primeiro, você pode adicionar um anexo fornecendo um caminho de arquivo para o método `fromPath` fornecido pela classe `Attachment`:

```php
    use Illuminate\Mail\Mailables\Attachment;

    /**
     * Obtenha os anexos da mensagem.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromPath('/path/to/file'),
        ];
    }
```

Ao anexar arquivos a uma mensagem, você pode especificar o nome visual e/ou o tipo MIME do anexo utilizando os métodos `as` e `withMime`:

```php
    /**
     * Obtenha os anexos da mensagem.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromPath('/path/to/file')
                    ->as('name.pdf')
                    ->withMime('application/pdf'),
        ];
    }
```

<a name="attaching-files-from-disk"></a>
#### Anexar arquivos do disco

Se você tiver armazenado um arquivo em um de seus [discos do sistema de arquivos](/docs/filesystem), você poderá anexar o arquivo ao e-mail usando o método de anexo `fromStorage`:

```php
    /**
     * Obtenha os anexos da mensagem.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorage('/path/to/file'),
        ];
    }
```

Claro que você também pode especificar o nome do anexo e seu tipo MIME:

```php
    /**
     * Obtenha os anexos da mensagem.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorage('/path/to/file')
                    ->as('name.pdf')
                    ->withMime('application/pdf'),
        ];
    }
```

O método `fromStorageDisk` pode ser usado se você precisar especificar um disco de armazenamento diferente do seu disco padrão.

```php
    /**
     * Obtenha os anexos da mensagem.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorageDisk('s3', '/path/to/file')
                    ->as('name.pdf')
                    ->withMime('application/pdf'),
        ];
    }
```

<a name="raw-data-attachments"></a>
#### Anexos de dados brutos

O método de anexo `fromData` pode ser usado para anexar uma sequência de bytes sem formatação como um anexo. Por exemplo, você poderá usar esse método se gerou um PDF na memória e deseja anexá-lo ao e-mail sem salvar o arquivo no disco rígido. O método `fromData` aceita um bloco de closure que resolve os bytes brutos do dado, assim como o nome que deve ser atribuído ao anexo:

```php
    /**
     * Obtenha os anexos da mensagem.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdf, 'Report.pdf')
                    ->withMime('application/pdf'),
        ];
    }
```

<a name="inline-attachments"></a>
### Anexos inline

Normalmente, o embelezamento de imagens integradas no email é demorado; entretanto, o Laravel disponibiliza uma forma conveniente para anexar imagens aos seus emails. Para incorporar uma imagem inline, utilize a método `embed` na variável `$message` dentro do template de email. O Laravel torna automaticamente a variável `$message` disponível para todos os modelos de email, para não ter de ser passado manualmente:

```blade
<body>
    Here is an image:

    <img src="{{ $message->embed($pathToImage) }}">
</body>
```

 > [Atenção]
 > A variável `$message` não está disponível nos modelos de mensagens em _plain-text_ (texto puro), uma vez que as mensagens em _plain-text_ não utilizam anexos em linha.

<a name="embedding-raw-data-attachments"></a>
#### Incorporação de anexos com dados brutos

Se você já tiver uma string com dados de imagem bruta que deseja inserir em um template de email, poderá chamar o método `embedData` na variável `$message`. Ao chamar o método `embedData`, será necessário fornecer o nome do arquivo que deve ser atribuído à imagem incorporada:

```blade
<body>
    Here is an image from raw data:

    <img src="{{ $message->embedData($data, 'example-image.jpg') }}">
</body>
```

<a name="attachable-objects"></a>
### Objetos anexáveis

Embora vincular arquivos a mensagens por meio de caminhos de string simples seja, muitas vezes, suficiente, em muitos casos as entidades que podem ser vinculadas em sua aplicação são representadas por classes. Por exemplo, se sua aplicação estiver vinculando uma foto a uma mensagem, você também poderá ter um modelo `Photo` que represente essa foto. Nesses casos, não seria mais conveniente passar o modelo `Photo` para o método `attach`? Os objetos que podem ser vinculados permitem que você faça exatamente isso.

Para começar, implemente a interface `Illuminate\Contracts\Mail\Attachable` na classe que será anexada as mensagens. Essa interface determina que sua classe defina um método `toMailAttachment`, que retorne uma instância de `Illuminate\Mail\Attachment`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Contracts\Mail\Attachable;
    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Mail\Attachment;

    class Photo extends Model implements Attachable
    {
        /**
         * Obtenha a representação anexável do modelo.
         */
        public function toMailAttachment(): Attachment
        {
            return Attachment::fromPath('/path/to/file');
        }
    }
```

Depois de definir seu objeto que pode ser anexado, você poderá retornar uma instância desse objeto a partir do método `attachments` ao criar uma mensagem de e-mail:

```php
    /**
     * Obtenha os anexos da mensagem.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [$this->photo];
    }
```

Claro que os dados de anexos podem ser armazenados em um serviço remoto de armazenamento de arquivos, como o Amazon S3. Assim, o Laravel permite a geração de instâncias de anexos com base nos dados armazenados em qualquer um dos [discos do filesystem da aplicação](/docs/filesystem):

```php
    // Crie um anexo de um arquivo no seu disco padrão...
    return Attachment::fromStorage($this->path);

    // Crie um anexo de um arquivo em um disco específico...
    return Attachment::fromStorageDisk('backblaze', $this->path);
```

Além disso, você pode criar instâncias de anexos através dos dados que estão em memória. Para isso, forneça um closure para o método `fromData`. O closure deve retornar os dados brutos que representam a anexo:

```php
    return Attachment::fromData(fn () => $this->content, 'Photo Name');
```

O Laravel também fornece métodos adicionais que você pode usar para personalizar seus anexos. Por exemplo, você pode usar os métodos `as` e `withMime` para customizar o nome do arquivo e o tipo MIME:

```php
    return Attachment::fromPath('/path/to/file')
            ->as('Photo Name')
            ->withMime('image/jpeg');
```

<a name="headers"></a>
### Headers

Às vezes você pode precisar anexar cabeçalhos adicionais à mensagem enviada. Por exemplo, talvez seja necessário definir um `Message-Id` personalizado ou outros cabeçalhos de textos aleatórios.

Para fazer isso, defina um método `headers` no seu objeto que possa ser enviado por e-mail. O método `headers` deve retornar uma instância de `Illuminate\Mail\Mailables\Headers`. Esta classe aceita os parâmetros `messageId`, `references` e `text`. Claro, você pode fornecer apenas os parâmetros que você precisa para a sua mensagem em particular:

```php
    use Illuminate\Mail\Mailables\Headers;

    /**
     * Obtenha os cabeçalhos das mensagens.
     */
    public function headers(): Headers
    {
        return new Headers(
            messageId: 'custom-message-id@example.com',
            references: ['previous-message@example.com'],
            text: [
                'X-Custom-Header' => 'Custom Value',
            ],
        );
    }
```

<a name="tags-and-metadata"></a>
### Tags e metadados

Alguns provedores de e-mail terceirizados, como o Mailgun e o Postmark, oferecem suporte a "tags" (etiquetas) e "metadados", que podem ser usadas para agrupar e rastrear mensagens enviadas por seu aplicativo. Você poderá adicionar tags e metadados à uma mensagem de e-mail através da definição do `Envelope`:

```php
    use Illuminate\Mail\Mailables\Envelope;

    /**
     * Pegue o envelope da mensagem.
     *
     * @return \Illuminate\Mail\Mailables\Envelope
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Order Shipped',
            tags: ['shipment'],
            metadata: [
                'order_id' => $this->order->id,
            ],
        );
    }
```

Se o seu aplicativo estiver a utilizar o driver Mailgun, poderá consultar a documentação da Mailgun para mais informações sobre [etiquetas](https://documentation.mailgun.com/en/latest/user_manual.html#tagging-1) e [metadados](https://documentation.mailgun.com/en/latest/user_manual.html#attaching-data-to-messages). Do mesmo modo, poderá consultar a documentação do Postmark para mais informações sobre o suporte às [etiquetas](https://postmarkapp.com/blog/tags-support-for-smtp) e [metadados](https://postmarkapp.com/support/article/1125-custom-metadata-faq).

Se o seu aplicativo estiver utilizando o Amazon SES para enviar mensagens de e-mail, você deve utilizar o método `metadata` para anexar [tags SES](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) à mensagem.

<a name="customizing-the-symfony-message"></a>
### Personalizando a mensagem do Symfony

As funcionalidades de envio de e-mails do Laravel são fornecidas pelo Symfony Mailer. O Laravel permite o registro de _callbacks_ personalizados que serão acionados com a instância _Message_ do Symfony antes de enviar a mensagem. Isso oferece a possibilidade de personalizar profundamente a mensagem antes dela ser enviada. Para fazer isto, defina um parâmetro `using` na sua definição de `Envelope`:

```php
    use Illuminate\Mail\Mailables\Envelope;
    use Symfony\Component\Mime\Email;
    
    /**
     * Pegue o envelope da mensagem.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Order Shipped',
            using: [
                function (Email $message) {
                    // ...
                },
            ]
        );
    }
```

<a name="markdown-mailables"></a>
## E-mails no formato Markdown

As mensagens transmissíveis por e-mail que utilizam o formato do Markdown permitem tirar partido dos templates e componentes pré-construídos das [notificações por e-mail](/docs/notifications#mail-notifications) nas suas mensagens. Uma vez que as mensagens são escritas em Markdown, o Laravel é capaz de renderizar lindos modelos HTML responsivos para as mensagens, gerando simultaneamente uma versão em texto simples.

<a name="generating-markdown-mailables"></a>
### Geração de e-mails em formato Markdown

Para gerar um e-mail com um modelo correspondente de Markdown, você pode utilizar a opção `--markdown` com o comando `make:mail` do Artisan:

```shell
php artisan make:mail OrderShipped --markdown=mail.orders.shipped
```

Então, ao configurar a definição `Content` enviável dentro do seu método `content`, use o parâmetro `markdown` em vez do parâmetro `view`:

```php
    use Illuminate\Mail\Mailables\Content;

    /**
     * Obtenha a definição do conteúdo da mensagem.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'mail.orders.shipped',
            with: [
                'url' => $this->orderUrl,
            ],
        );
    }
```

<a name="writing-markdown-messages"></a>
### Escrever mensagens no Markdown

Os envios por e-mail com formato Markdown utilizam uma combinação de componentes Blade e sintaxe do Markdown, que permitem a construção fácil de mensagens de e-mail ao mesmo tempo que tiram partido dos componentes pré-construídos da interface de utilização do email do Laravel.

```blade
<x-mail::message>
# Order Shipped

Your order has been shipped!

<x-mail::button :url="$url">
View Order
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
```

::: info NOTA
Não use excesso de indentação ao escrever e-mails em Markdown. Segundo os padrões do Markdown, processadores de texto renderizarão conteúdos com espaços entre linhas como blocos de código.
:::

<a name="button-component"></a>
#### Componente de botão

O componente botão renderiza um link de botão centrado. Ele aceita dois argumentos, uma "url" e uma cor (opcional). As cores suportadas são `primary`, `success` e `error`. Você pode adicionar quantos componentes forem desejados a uma mensagem:

```blade
<x-mail::button :url="$url" color="success">
View Order
</x-mail::button>
```

<a name="panel-component"></a>
#### Componente do painel

O componente do painel exibe o bloco de texto especificado em um painel com uma cor de fundo ligeiramente diferente da do resto da mensagem, permitindo chamar a atenção para determinado bloco de texto.

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### Componente de tabela

O componente de tabelas permite-lhe transformar uma tabela de Markdown numa tabela HTML. Este componente aceita a tabela em formato de Markdown como conteúdo. É suportado o alinhamento das colunas da tabela:

```blade
<x-mail::table>
| Laravel       | Table         | Example  |
| ------------- |:-------------:| --------:|
| Col 2 is      | Centered      | $10      |
| Col 3 is      | Right-Aligned | $20      |
</x-mail::table>
```

<a name="customizing-the-components"></a>
### Personalização dos componentes

É possível exportar todos os componentes de e-mail do Markdown para sua aplicação personalizada. Para fazer o envio dos componentes, você pode usar o comando `vendor:publish` do Artisan para publicar a tag de atributo `laravel-mail`:

```shell
php artisan vendor:publish --tag=laravel-mail
```

Este comando publica os componentes de e-mail do Markdown para o diretório `resources/views/vendor/mail`. O diretório `mail` contém um diretório `html` e outro `text`, cada um deles contendo as respectivas representações de todos os componentes disponíveis. Você pode personalizar esses componentes como quiser.

<a name="customizing-the-css"></a>
#### Personalizar o CSS

Após exportar os componentes, o diretório `resources/views/vendor/mail/html/themes` contém um arquivo `default.css`. Você pode personalizar o CSS neste arquivo e seus estilos serão convertidos automaticamente em estilos CSS inline dentro das representações HTML de suas mensagens de e-mail no Markdown.

Se desejar construir um tema totalmente novo para os componentes do Laravel Markdown, é possível incluir um arquivo de CSS na pasta `html/themes`. Após nomear e salvar seu arquivo de CSS, atualize a opção `theme` na configuração `config/mail.php` da sua aplicação para corresponder ao novo nome do tema.

Para personalizar o tema de um email que pode ser enviado manualmente, você pode definir a propriedade `$theme` da classe do e-mail para o nome do tema que deve ser usado ao enviar esse e-mail.

<a name="sending-mail"></a>
## Enviar e-mails

Para enviar uma mensagem, use o método `to` da [facade](/docs/facades) `Mail`. O método `to` aceita um endereço de e-mail, uma instância de usuário ou uma coleção de usuários. Se você passar um objeto ou uma coleção de objetos, o gerador de mensagens usará suas propriedades `email` e `name` para determinar os destinatários da mensagem. Assegure-se que esses atributos estão disponíveis em seus objetos. Depois de especificar os destinatários, você pode passar uma instância de sua classe que possa ser enviada como e-mail ao método `send`:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Mail\OrderShipped;
    use App\Models\Order;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Mail;

    class OrderShipmentController extends Controller
    {
        /**
         * Envie o pedido fornecido.
         */
        public function store(Request $request): RedirectResponse
        {
            $order = Order::findOrFail($request->order_id);

            // Envie o pedido...

            Mail::to($request->user())->send(new OrderShipped($order));

            return redirect('/orders');
        }
    }
```

Não se limite apenas a especificar os destinatários "_to_" ao enviar uma mensagem. Você pode definir livremente o "para", "cc" e "bcc" usando suas respectivas funções juntas:

```php
    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->send(new OrderShipped($order));
```

<a name="looping-over-recipients"></a>
#### Looping sobre destinatários

Ocasionalmente você poderá precisar enviar um e-mail a vários destinatários, através da execução iterativa de um array de destinatários/endereços de email. Contudo, uma vez que o método `to` insere endereços de e-mail na lista de destinatários do e-mail, cada iteração na loop enviará outro email a todos os destinatários anteriores. Sendo assim, você deve sempre recriar a instância do e-mail para cada destinatário:

```php
    foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
        Mail::to($recipient)->send(new OrderShipped($order));
    }
```

<a name="sending-mail-via-a-specific-mailer"></a>
#### Enviar e-mail através de um remetente específico

Por padrão, o Laravel envia e-mail utilizando o serviço de envio configurado como o remetente `default` no arquivo de configuração do comando `mail` da sua aplicação. No entanto, você pode usar o método `mailer` para enviar uma mensagem usando um serviço de envio específico:

```php
    Mail::mailer('postmark')
            ->to($request->user())
            ->send(new OrderShipped($order));
```

<a name="queueing-mail"></a>
### Fila de E-Mail

<a name="queueing-a-mail-message"></a>
#### Enviar uma mensagem de e-mail

Como o envio de e-mails pode afetar negativamente o tempo de resposta do aplicativo, muitos desenvolvedores optam por agendar os e-mails para o envio no backgroud. O Laravel facilita esse processo com a API [unificada de filas](/docs/queues). Para agendar um e-mail, utilize o método `queue` na facade `Mail`, após especificar os destinatários do e-mail:

```php
    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->queue(new OrderShipped($order));
```

Esse método cuidará automaticamente de colocar um trabalho na fila para que a mensagem seja enviada em segundo plano. Você precisará configurar suas [filas](/docs/queues) antes de usar esse recurso.

<a name="delayed-message-queueing"></a>
#### Fila de mensagens atrasada

Se pretender atrasar a entrega de um e-mail pendente, pode usar o método `later`. Como primeiro argumento, o método `later` aceita uma instância da estrutura `DateTime` que indica quando deve ser enviado o e-mail:

```php
    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->later(now()->addMinutes(10), new OrderShipped($order));
```

<a name="pushing-to-specific-queues"></a>
#### Enviando para filas específicas

Uma vez que todas as classes geradas para envio de email usam o comando `make:mail`, você poderá chamar os métodos `onQueue` e `onConnection` em qualquer instância da classe, permitindo que você especifique o nome da conexão e da fila do seu email:

```php
    $message = (new OrderShipped($order))
                    ->onConnection('sqs')
                    ->onQueue('emails');

    Mail::to($request->user())
        ->cc($moreUsers)
        ->bcc($evenMoreUsers)
        ->queue($message);
```

<a name="queueing-by-default"></a>
#### Filas por padrão

Se houver classes com capacidade de envio que queres que sejam sempre enfileiradas, você pode implementar o contrato `ShouldQueue` na classe. Agora, mesmo que chames o método `send` no envio de e-mail, a mensagem ainda será enfileirada uma vez que implementa o contrato:

```php
    use Illuminate\Contracts\Queue\ShouldQueue;

    class OrderShipped extends Mailable implements ShouldQueue
    {
        // ...
    }
```

<a name="queued-mailables-and-database-transactions"></a>
#### Envio de mensagens com filas e transações de banco de dados

Quando os itens de e-mails agendados são despachados dentro da transação do banco de dados, pode ocorrer a situação em que o item de e-mail é processado pela fila antes de a transação do banco de dados ter sido confirmada. Nesta situação, as alterações que você fez nos modelos ou registros de banco de dados durante a transação podem ainda não estar refletidas no banco de dados. Além disso, os modelos ou registros do banco de dados criados dentro da transação podem ainda não existir no banco de dados. Se o item de e-mail depender desses modelos, é possível que ocorram erros inesperados quando o trabalho que envia o item de e-mail agendado for processado.

Se a opção de configuração `after_commit` da conexão em fila estiver definida como `false`, você poderá indicar que uma determinada mensagem com capacidade de envio deve ser enviada depois que todas as transações de banco de dados em curso forem confirmadas, chamando o método `afterCommit` ao enviar a mensagem:

```php
    Mail::to($request->user())->send(
        (new OrderShipped($order))->afterCommit()
    );
```

Como alternativa, você pode chamar o método `afterCommit` do construtor da sua mensagem:

```php
    <?php

    namespace App\Mail;

    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Mail\Mailable;
    use Illuminate\Queue\SerializesModels;

    class OrderShipped extends Mailable implements ShouldQueue
    {
        use Queueable, SerializesModels;

        /**
         * Crie uma nova instância de mensagem.
         */
        public function __construct()
        {
            $this->afterCommit();
        }
    }
```

::: info NOTA
Para saber mais sobre como contornar esses problemas, revise a documentação sobre [trabalhos enfileirados e transações de banco de dados](/docs/queues#jobs-and-database-transactions).
:::

<a name="rendering-mailables"></a>
## Renderizando E-mails

Por vezes, poderá desejar capturar o conteúdo HTML de um objeto enviável sem o enviar. Para efetuar isto, pode chamar o método `render` do objeto enviável. Este método irá devolver o conteúdo HTML avaliado do objeto como uma string:

```php
    use App\Mail\InvoicePaid;
    use App\Models\Invoice;

    $invoice = Invoice::find(1);

    return (new InvoicePaid($invoice))->render();
```

<a name="previewing-mailables-in-the-browser"></a>
### Visualizando e-mails no Navegador

Ao desenhar o template de um e-mail, é conveniente visualizar rapidamente a versão renderizada do mesmo no seu navegador como se fosse um modelo típico de Blade. Por este motivo, o Laravel permite-lhe retornar qualquer objeto _mailable_ diretamente a partir de uma closure ou _controller_ de rota. Quando o objeto _mailable_ for retornado, será renderizado e exibido no navegador, permitindo-lhe visualizar rapidamente o seu design sem necessidade de enviá-lo para um endereço de correio eletrônico real:

```php
    Route::get('/mailable', function () {
        $invoice = App\Models\Invoice::find(1);

        return new App\Mail\InvoicePaid($invoice);
    });
```

<a name="localizing-mailables"></a>
## Localizando _Mailables_

O Laravel permite-lhe enviar mensagens através de uma localização diferente da atual na solicitação e até mesmo lembrará essa localização se a mensagem tiver sido colocada em fila de espera.

Para conseguir isso, a interface `Mail` disponibiliza o método `locale` para definir o idioma desejado. A aplicação muda de idioma quando o modelo é avaliado e volta ao idioma anterior após sua conclusão:

```php
    Mail::to($request->user())->locale('es')->send(
        new OrderShipped($order)
    );
```

<a name="user-preferred-locales"></a>
### Locais preferidos do utilizador

Às vezes, os aplicativos armazenam o local preferido de cada usuário. Ao implementar o contrato `HasLocalePreference` em um ou mais de seus modelos, você pode instruir o Laravel a usar esse local armazenado ao enviar e-mails:

```php
    use Illuminate\Contracts\Translation\HasLocalePreference;

    class User extends Model implements HasLocalePreference
    {
        /**
         * Obtenha o local preferido do usuário.
         */
        public function preferredLocale(): string
        {
            return $this->locale;
        }
    }
```

Depois de implementada a interface, o Laravel irá automaticamente utilizar o local pré-definido ao enviar e-mails para o modelo. Não será necessário chamar o método `locale`:

```php
    Mail::to($request->user())->send(new OrderShipped($order));
```

<a name="testing-mailables"></a>
## Teste

<a name="testing-mailable-content"></a>
### Teste de conteúdo _Mailable_

O Laravel fornece vários métodos para inspeção da estrutura de seus _mailable_. Além disso, o Laravel oferece várias maneiras convenientes de verificar se seu objeto _mailable_ possui o conteúdo esperado. Estes são: `assertSeeInHtml`, `assertDontSeeInHtml`, `assertSeeInOrderInHtml`, `assertSeeInText`, `assertDontSeeInText`, `assertSeeInOrderInText`, `assertHasAttachment`, `assertHasAttachedData`, `assertHasAttachmentFromStorage` e `assertHasAttachmentFromStorageDisk`.

Como você espera, as afirmações "HTML" afirmam que a versão HTML do seu e-mail contém uma determinada string, enquanto as afirmações "text" afirmam que a versão de texto simples do seu e-mail contém uma determinada string:

::: code-group
```php [Pest]
use App\Mail\InvoicePaid;
use App\Models\User;

test('mailable content', function () {
    $user = User::factory()->create();

    $mailable = new InvoicePaid($user);

    $mailable->assertFrom('jeffrey@example.com');
    $mailable->assertTo('taylor@example.com');
    $mailable->assertHasCc('abigail@example.com');
    $mailable->assertHasBcc('victoria@example.com');
    $mailable->assertHasReplyTo('tyler@example.com');
    $mailable->assertHasSubject('Invoice Paid');
    $mailable->assertHasTag('example-tag');
    $mailable->assertHasMetadata('key', 'value');

    $mailable->assertSeeInHtml($user->email);
    $mailable->assertSeeInHtml('Invoice Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

    $mailable->assertHasAttachment('/path/to/file');
    $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
    $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
});
```

```php [PHPUnit]
use App\Mail\InvoicePaid;
use App\Models\User;

public function test_mailable_content(): void
{
    $user = User::factory()->create();

    $mailable = new InvoicePaid($user);

    $mailable->assertFrom('jeffrey@example.com');
    $mailable->assertTo('taylor@example.com');
    $mailable->assertHasCc('abigail@example.com');
    $mailable->assertHasBcc('victoria@example.com');
    $mailable->assertHasReplyTo('tyler@example.com');
    $mailable->assertHasSubject('Invoice Paid');
    $mailable->assertHasTag('example-tag');
    $mailable->assertHasMetadata('key', 'value');

    $mailable->assertSeeInHtml($user->email);
    $mailable->assertSeeInHtml('Invoice Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

    $mailable->assertHasAttachment('/path/to/file');
    $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
    $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
}
```
:::

<a name="testing-mailable-sending"></a>
### Testando o envio de mensagens

Sugerimos que você teste o conteúdo de seus _mailables_ separadamente dos testes que afirmam que um determinado "mailable" foi enviado para um usuário específico. Normalmente, o conteúdo do "mailable" não é relevante ao código que você está testando, sendo suficiente simplesmente afirmar que o Laravel recebeu instruções para enviar um determinado "mailable".

Você pode usar o método `fake` da facade do `Mail` para impedir que os emails sejam enviados. Depois de chamar o método `fake` da facade do `Mail`, você poderá afirmar que os itens _mailable_ foram instruídos a serem enviados aos usuários e até mesmo inspecionar os dados recebidos pelos itens enviáveis:

```php [Pest]
<?php

use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;

test('orders can be shipped', function () {
    Mail::fake();

    // Realizar envio de pedidos...

    // Afirme que nenhum material postal foi enviado...
    Mail::assertNothingSent();

    // Afirme que um item postal foi enviado...
    Mail::assertSent(OrderShipped::class);

    // Afirmar que um e-mail foi enviado duas vezes...
    Mail::assertSent(OrderShipped::class, 2);

    // Afirmar que um mailing não foi enviado...
    Mail::assertNotSent(AnotherMailable::class);

    // Afirme que 3 correspondências no total foram enviadas...
    Mail::assertSentCount(3);
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Mail::fake();

        // Realizar envio de pedidos...

        // Afirme que nenhum material postal foi enviado...
        Mail::assertNothingSent();

        // Afirme que um item postal foi enviado...
        Mail::assertSent(OrderShipped::class);

        // Afirmar que um e-mail foi enviado duas vezes...
        Mail::assertSent(OrderShipped::class, 2);

        // Afirmar que um mailing não foi enviado...
        Mail::assertNotSent(AnotherMailable::class);

        // Afirme que 3 correspondências no total foram enviadas...
        Mail::assertSentCount(3);
    }
}
```
:::

Se estiver a preparar mensagens para entrega em segundo plano, deverá utilizar o método `assertQueued` em vez do `assertSent`:

```php
    Mail::assertQueued(OrderShipped::class);
    Mail::assertNotQueued(OrderShipped::class);
    Mail::assertNothingQueued();
    Mail::assertQueuedCount(3);
```

Você pode passar uma verificação às funções `assertSent`, `assertNotSent`, `assertQueued` ou `assertNotQueued`, a fim de afirmar que um `mailable` foi enviado e que passa por uma determinada "verificação de verdades". Se pelo menos um `mailable` tiver sido enviado e passar na verificação de verdades, então a assertiva será bem-sucedida:

```php
    Mail::assertSent(function (OrderShipped $mail) use ($order) {
        return $mail->order->id === $order->id;
    });
```

Ao chamar os métodos de declaração da facade `Mail`, a instância _mailable_ aceita pelo _closure_ fornecido expõe métodos úteis para analisar o envio de mensagens:

```php
    Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($user) {
        return $mail->hasTo($user->email) &&
               $mail->hasCc('...') &&
               $mail->hasBcc('...') &&
               $mail->hasReplyTo('...') &&
               $mail->hasFrom('...') &&
               $mail->hasSubject('...');
    });
```

A instância que pode ser enviada por e-mail também inclui vários métodos úteis para analisar os anexos em uma instância que pode ser enviada por correio:

```php
    use Illuminate\Mail\Mailables\Attachment;

    Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
        return $mail->hasAttachment(
            Attachment::fromPath('/path/to/file')
                    ->as('name.pdf')
                    ->withMime('application/pdf')
        );
    });

    Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
        return $mail->hasAttachment(
            Attachment::fromStorageDisk('s3', '/path/to/file')
        );
    });

    Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($pdfData) {
        return $mail->hasAttachment(
            Attachment::fromData(fn () => $pdfData, 'name.pdf')
        );
    });
```

Você deve ter notado que existem duas maneiras de garantir que o e-mail não foi enviado: `assertNotSent` e `assertNotQueued`. Às vezes, você pode querer garantir que nenhum e-mail foi enviado ou colocado na fila. Para isso, você pode usar as seguintes funções:

```php
    Mail::assertNothingOutgoing();

    Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
        return $mail->order->id === $order->id;
    });
```

<a name="mail-and-local-development"></a>
## Mail e Desenvolvimento local

Ao desenvolver uma aplicação que envia e-mails, você provavelmente não deseja enviar mensagens de e-mail reais para endereços de e-mail ativos. O Laravel oferece várias formas de "desativar" o envio real de e-mails durante o desenvolvimento local.

<a name="log-driver"></a>
#### Driver do log

Em vez de enviar seus e-mails, o driver de e-mail `log` gravará todas as mensagens de e-mail em seus arquivos de log para inspeção. Normalmente, esse driver seria usado apenas durante o desenvolvimento local. Para obter mais informações sobre como configurar seu aplicativo por ambiente, confira a [documentação de configuração](/docs/configuration#environment-configuration).

<a name="mailtrap"></a>
#### HELO/Mailtrap/Mailpit

Alternativamente, você pode usar um serviço como o [HELO](https://usehelo.com) ou o [Mailtrap](https://mailtrap.io) e o driver `smtp` para enviar suas mensagens de email para uma caixa de e-mail "_fake_" onde poderão ser vistas em um verdadeiro cliente de email. Esta abordagem tem a vantagem de permitir que você analise os emails finais no visualizador de mensagens do Mailtrap.

Se você estiver usando o [Laravel Sail](/docs/sail), poderá visualizar uma prévua das mensagens utilizando a ferramenta [Mailpit](https://github.com/axllent/mailpit). Quando o Sail estiver funcionando, será possível acessar a interface da Mailpit em: `http://localhost:8025`.

<a name="using-a-global-to-address"></a>
#### Usando um endereço global para "to"

Por último, você pode especificar um "to" global através do método `alwaysTo`, oferecido pela facade `Mail`. Normalmente, este método deve ser chamado no método `boot` de algum dos fornecedores de serviços da sua aplicação:

```php
    use Illuminate\Support\Facades\Mail;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        if ($this->app->environment('local')) {
            Mail::alwaysTo('taylor@example.com');
        }
    }
```

<a name="events"></a>
## Eventos

O Laravel envia dois eventos durante o envio de mensagens de e-mail. O evento `MessageSending` é enviado antes do envio da mensagem, enquanto o evento `MessageSent` é enviado após a mensagem ter sido enviada. Lembre-se que estes eventos são enviados quando a mensagem está sendo *enviada*, não quando está agendada para ser enviada. Você pode criar [ouvintes de eventos](/docs/events) nesta aplicação, relacionadas com esses eventos:

```php
    use Illuminate\Mail\Events\MessageSending;
    // use Illuminate\Mail\Events\MessageSent;

    class LogMessage
    {
        /**
         * Manipule o evento fornecido.
         */
        public function handle(MessageSending $event): void
        {
            // ...
        }
    }
```

<a name="custom-transports"></a>
## Transporte personalizado

O Laravel inclui uma variedade de transporte de e-mail; no entanto, você deseje escrever os seus próprios transportes para enviar e-mails por meio de outros serviços que o Laravel não suporta. Para começar, defina a classe que estende a `Symfony\Component\Mailer\Transport\AbstractTransport`. Em seguida, implemente as funções `doSend` e `__toString()` em seu transporte:

```php
    use MailchimpTransactional\ApiClient;
    use Symfony\Component\Mailer\SentMessage;
    use Symfony\Component\Mailer\Transport\AbstractTransport;
    use Symfony\Component\Mime\Address;
    use Symfony\Component\Mime\MessageConverter;

    class MailchimpTransport extends AbstractTransport
    {
        /**
         * Crie uma nova instância de transporte do Mailchimp.
         */
        public function __construct(
            protected ApiClient $client,
        ) {
            parent::__construct();
        }

        /**
         * {@inheritDoc}
         */
        protected function doSend(SentMessage $message): void
        {
            $email = MessageConverter::toEmail($message->getOriginalMessage());

            $this->client->messages->send(['message' => [
                'from_email' => $email->getFrom(),
                'to' => collect($email->getTo())->map(function (Address $email) {
                    return ['email' => $email->getAddress(), 'type' => 'to'];
                })->all(),
                'subject' => $email->getSubject(),
                'text' => $email->getTextBody(),
            ]]);
        }

        /**
         * Obtenha a representação em string do transporte.
         */
        public function __toString(): string
        {
            return 'mailchimp';
        }
    }
```

Depois de definir seu transporte personalizado, você pode registrá-lo por meio do método `extend` fornecido pela fachada `Mail`. Normalmente, isso deve ser feito dentro do método `boot` do provedor de serviços `AppServiceProvider` do seu aplicativo. Um argumento `$config` será passado para o fechamento fornecido ao método `extend`. Este argumento conterá o array de configuração definido para o mailer no arquivo de configuração `config/mail.php` do aplicativo:

```php
    use App\Mail\MailchimpTransport;
    use Illuminate\Support\Facades\Mail;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Mail::extend('mailchimp', function (array $config = []) {
            return new MailchimpTransport(/* ... */);
        });
    }
```

Depois de definir e registrar o transporte personalizado, é possível criar uma definição do remetente na configuração da aplicação em `config/mail.php`, que utiliza o novo transporte:

```php
    'mailchimp' => [
        'transport' => 'mailchimp',
        // ...
    ],
```

<a name="additional-symfony-transports"></a>
### Transporte adicional em Symfony

O Laravel inclui suporte para alguns transportes de e-mail mantidos pelo Symfony, como Mailgun e Postmark. No entanto, você pode querer estender o Laravel com suporte para transportes adicionais mantidos pelo Symfony. Você pode fazer isso solicitando o mailer Symfony necessário via Composer e registrando o transporte com o Laravel. Por exemplo, você pode instalar e registrar o _mailer_ Symfony "Brevo" (anteriormente "Sendinblue"):

```
composer require symfony/brevo-mailer symfony/http-client
```

Depois que o pacote de e-mail do Brevo estiver instalado, você pode adicionar uma entrada para suas credenciais da API do Brevo ao arquivo de configuração `services` de seu aplicativo:

```php
    'brevo' => [
        'key' => 'your-api-key',
    ],
```

Depois, você pode usar o método `extend` da facade `Mail` para registrar o transporte com Laravel. Normalmente isso deve ser feito dentro do método `boot` de um serviço prestador:

```php
    use Illuminate\Support\Facades\Mail;
    use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
    use Symfony\Component\Mailer\Transport\Dsn;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Mail::extend('brevo', function () {
            return (new BrevoTransportFactory)->create(
                new Dsn(
                    'brevo+api',
                    'default',
                    config('services.brevo.key')
                )
            );
        });
    }
```

Depois de registrar seu transporte, você pode criar uma definição de remetente na pasta de configurações do aplicativo, `config/mail.php`, que use o novo transporte:

```php
    'brevo' => [
        'transport' => 'brevo',
        // ...
    ],
```
