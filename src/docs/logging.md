# Registo

<a name="introduction"></a>
## Introdução

 Para ajudar você a aprender mais sobre o que está acontecendo dentro do seu aplicativo, o Laravel oferece serviços de registro robustos que permitem registrar mensagens em arquivos, no log de erros do sistema e até mesmo no Slack para notificar toda sua equipe.

 O registo no Laravel é baseado em "canais". Cada canal representa uma forma específica de escrever informações de registos. Por exemplo, o canal `single` escreve ficheiros de registo num único ficheiro, enquanto o canal `slack` envia mensagens de registo para Slack. As mensagens de registo podem ser escritas em vários canais com base na sua gravidade.

 O Laravel utiliza a biblioteca [Monolog](https://github.com/Seldaek/monolog), que oferece suporte a vários recursos poderosos de manuseio de logs. É muito fácil configurar esses recursos, o que permite misturá-los e adaptá-los para otimizar o manuseio de logs do seu aplicativo.

<a name="configuration"></a>
## Configuração

 Todas as opções de configuração que controlam o comportamento do registo da aplicação são guardadas no ficheiro de configuração `config/logging.php`. Este ficheiro permite-lhe configurar os canais de registo da sua aplicação, portanto revise cuidadosamente cada um dos canais disponíveis e as respetivas opções. Iremos analisar algumas opções comuns abaixo.

 Por padrão, o Laravel usará o canal `stack` ao registrar mensagens. O canal `stack` é utilizado para agregar vários canais de registo em um único canal. Para mais informações sobre a criação de pilhas, consulte a [documentação abaixo](#construindo-pilhas-de-log).

<a name="available-channel-drivers"></a>
### Driver de Canal Disponível

 Cada canal de registros é alimentado por um "driver". O driver determina como e onde a mensagem de registo é realmente gravada. Os seguintes drivers estão disponíveis em qualquer aplicação Laravel. Uma entrada para a maioria destes drivers já está presente no seu ficheiro de configuração `config/logging.php` da aplicação, então revise este ficheiro para conhecer o conteúdo:

<div class="overflow-auto">

|  Nome |  Descrição |
|-------------|-------------|
|  ``custom'' |  Um driver que chama uma fábrica especificada para criar um canal |
|  “diariamente” |  Um driver do tipo "Monolog" baseado em um 'handler de arquivos rotativos' que faz o gerenciamento diário. |
|  `erro_registo` |  Um `ErroLogHandler` baseado em motor de Monolog |
|  `monólogo` |  Driver de fábrica do Monolog que pode usar qualquer manipulador suportado pelo Monolog |
|  "rastro de papel" |  Um driver Monolog baseado em "SyslogUdpHandler" |
|  “solitário” |  Um único canal de registo baseado em arquivo ou caminho (`StreamHandler`) |
|  "slack" |  Um motorista de `SlackWebhookHandler` baseado em Monolog |
|  "stack" |  Uma embalagem para facilitar a criação de canais multicanal |
|  `syslog` |  O motorista Monolog baseado em `SyslogHandler` |

</div>

 > [!OBSERVAÇÃO]
 Consulte o capítulo sobre a Personalização Avançada do Canal (#monolog-channel-customization) para mais informações sobre os driver `monolog` e `custom`.

<a name="configuring-the-channel-name"></a>
#### Configurando o nome do canal

 Por padrão, o Monolog é iniciado com um "nome de canal" que corresponde ao ambiente atual, como por exemplo, `production` ou `local`. Para alterar este valor, você pode adicionar uma opção de `name` à configuração do seu canal:

```php
    'stack' => [
        'driver' => 'stack',
        'name' => 'channel-name',
        'channels' => ['single', 'slack'],
    ],
```

<a name="channel-prerequisites"></a>
### Requisitos de canal

<a name="configuring-the-single-and-daily-channels"></a>
#### Configurando os canais simples e diários

 Os canais “único” e “diário” têm três opções de configuração adicionais: "bulle", "permissão" e "bloqueio".

<div class="overflow-auto">

|  Nome |  Descrição |  Padrão |
|-------------|-------------|-------------|
|  "bolha" |  Indica se os mensagens devem ser encaminhadas para outros canais após serem tratados |  `verdadeiro` |
|  `bloqueio` |  Tentar bloquear o arquivo de log antes da escrita nele |  `falso` |
|  `autorização` |  As permissões do arquivo de log |  `0644` |

</div>

 Além disso, a política de retenção do canal "daily" pode ser configurada através da variável de ambiente `LOG_DAILY_DAYS` ou definindo a opção de configuração `days`.

<div class="overflow-auto">

|  Nome |  Descrição |  Padrão |
|-------------|-------------------------------------------------------------------|-------------|
|  ``dias'' |  Número de dias em que os arquivos de registo diários devem ser conservados |  ``7`` |

</div>

<a name="configuring-the-papertrail-channel"></a>
#### Configurando o Canal de Papertrail

 O canal `papertrail` requer as opções de configuração `host` e `porta`. Estas podem ser definidas através das variáveis de ambiente `PAPERTRAIL_URL` e `PAPERTRAIL_PORT`. Pode obter estes valores no [Papertrail](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app).

<a name="configuring-the-slack-channel"></a>
#### Configurando o Canal no Slack

 O canal `slack` exige uma opção de configuração `url`. Esse valor pode ser definido através da variável de ambiente `LOG_SLACK_WEBHOOK_URL`. Essa URL deve corresponder a um URL para um [webhook de entrada](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) que você tenha configurado para sua equipe do Slack.

 Por padrão, o Slack só recebe registos a nível crítico ou superior; no entanto, pode alterar isto usando a variável de ambiente LOG_LEVEL ou modificando a opção de configuração "level" no array de configurações do canal de registo do Slack.

<a name="logging-deprecation-warnings"></a>
### Advertências de desativação do registo

 PHP, Laravel e outras bibliotecas frequentemente notificam seus usuários que algumas de suas funcionalidades foram desativadas e serão removidas em uma versão futura. Se você quiser registrar esses avisos de desativação, pode especificar seu canal de registro `deprecations` usando a variável de ambiente `LOG_DEPRECATIONS_CHANNEL`, ou na pasta de configuração `config/logging.php` do seu aplicativo:

```php
    'deprecations' => [
        'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
        'trace' => env('LOG_DEPRECATIONS_TRACE', false),
    ],

    'channels' => [
        // ...
    ]
```

 Ou, você pode definir um canal de logs chamado "deprecations". Se existir um canal de logs com este nome ele será sempre usado para registrar deprecações:

```php
    'channels' => [
        'deprecations' => [
            'driver' => 'single',
            'path' => storage_path('logs/php-deprecation-warnings.log'),
        ],
    ],
```

<a name="building-log-stacks"></a>
## Edifícios em pilha de madeira

 Como mencionado anteriormente, o driver `stack` permite que você combine vários canais em um único canal de logs para mais conveniência. Para ilustrar como usar log stacks, vamos dar uma olhada em uma configuração de exemplo que pode ser vista em um aplicativo em produção:

```php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['syslog', 'slack'], // [tl! add]
        'ignore_exceptions' => false,
    ],

    'syslog' => [
        'driver' => 'syslog',
        'level' => env('LOG_LEVEL', 'debug'),
        'facility' => env('LOG_SYSLOG_FACILITY', LOG_USER),
        'replace_placeholders' => true,
    ],

    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => env('LOG_SLACK_USERNAME', 'Laravel Log'),
        'emoji' => env('LOG_SLACK_EMOJI', ':boom:'),
        'level' => env('LOG_LEVEL', 'critical'),
        'replace_placeholders' => true,
    ],
],
```

 Vamos analisar essa configuração. Primeiro, observe que nosso canal `stack` agrega dois outros canais por meio de sua opção `channels`: `syslog` e `slack`. Assim, ao registrar mensagens, ambos os canais têm a oportunidade de registrar a mensagem. No entanto, como veremos abaixo, se esses canais realmente registram a mensagem pode ser determinado pelo grau/nível da mensagem.

<a name="log-levels"></a>
#### Níveis de registo

 Preste atenção à opção de configuração `level` nas configurações do canal `syslog` e `slack` no exemplo acima. Essa opção determina o nível mínimo que uma mensagem deve ter para ser gravada pelo canal. O Monolog, que é a base dos serviços de registro do Laravel, oferece todos os níveis de registro definidos na [especificação RFC 5424](https://tools.ietf.org/html/rfc5424). Numa ordem decrescente de severidade, esses níveis de log são: **emergency** (emergência), **alert** (aviso), **critical** (crítico), **error** (erro), **warning** (avisando), **notice** (notificação), **info** (informativo) e **debug** (debug).

 Então, imagine que registamos uma mensagem utilizando o método `debug`:

```php
    Log::debug('An informational message.');
```

 Dado nosso nível de configuração, o canal `syslog` escreverá a mensagem no registro do sistema; entretanto, como a mensagem de erro não é crítica ou acima disso, não será enviada para o Slack. No entanto, se registrarmos uma mensagem de emergência, ela será enviada tanto para o registro do sistema quanto para o Slack, já que o nível `emergency` está acima da linha de base para os dois canais:

```php
    Log::emergency('The system is down!');
```

<a name="writing-log-messages"></a>
## Escrever mensagens de registo

 Pode escrever informações nos logs utilizando a `Log` [facade](/docs/facades). Como mencionado anteriormente, o logger fornece os oito níveis de registo definidos na especificação [RFC 5424](https://tools.ietf.org/html/rfc5424): **emergência**, **alerta**, **crítico**, **erro**, **aviso**, **notificação**, **informações** e **debug**:

```php
    use Illuminate\Support\Facades\Log;

    Log::emergency($message);
    Log::alert($message);
    Log::critical($message);
    Log::error($message);
    Log::warning($message);
    Log::notice($message);
    Log::info($message);
    Log::debug($message);
```

 Você pode chamar qualquer um desses métodos para registrar uma mensagem no nível correspondente. Por padrão, a mensagem será escrita no canal de log padrão conforme configurado pelo seu arquivo de configuração `logging`:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\User;
    use Illuminate\Support\Facades\Log;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Show the profile for the given user.
         */
        public function show(string $id): View
        {
            Log::info('Showing the user profile for user: {id}', ['id' => $id]);

            return view('user.profile', [
                'user' => User::findOrFail($id)
            ]);
        }
    }
```

<a name="contextual-information"></a>
### Informações contextuais

 Um conjunto de dados contextuais pode ser passado para os métodos log. Estes dados contextuais são formata e exibidos com a mensagem do log:

```php
    use Illuminate\Support\Facades\Log;

    Log::info('User {id} failed to login.', ['id' => $user->id]);
```

 Ocasionalmente, você pode querer especificar algumas informações contextuais que devem ser incluídas em todas as entradas de log subsequentes num canal particular. Por exemplo, talvez queira registrar um ID do pedido associado a cada solicitação recebida por sua aplicação. Para fazer isso, você pode chamar o método `comContext` da facade `Log`:

```php
    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Log;
    use Illuminate\Support\Str;
    use Symfony\Component\HttpFoundation\Response;

    class AssignRequestId
    {
        /**
         * Handle an incoming request.
         *
         * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
         */
        public function handle(Request $request, Closure $next): Response
        {
            $requestId = (string) Str::uuid();

            Log::withContext([
                'request-id' => $requestId
            ]);

            $response = $next($request);

            $response->headers->set('Request-Id', $requestId);

            return $response;
        }
    }
```

 Se você deseja compartilhar informações contextuais em todos os canais de registro, poderá invocar o método `Log::shareContext()` desta classe. Este método fornecerá as informações contextuais a todos os canais criados e quaisquer canais que sejam criados posteriormente:

```php
    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Log;
    use Illuminate\Support\Str;
    use Symfony\Component\HttpFoundation\Response;

    class AssignRequestId
    {
        /**
         * Handle an incoming request.
         *
         * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
         */
        public function handle(Request $request, Closure $next): Response
        {
            $requestId = (string) Str::uuid();

            Log::shareContext([
                'request-id' => $requestId
            ]);

            // ...
        }
    }
```

 > [!NOTA]
 [ Middleware de emprego](/docs/queues#job-middleware).

<a name="writing-to-specific-channels"></a>
### Escrever em canais específicos

 Às vezes, pode ser necessário registar uma mensagem em um canal que não seja o canal padrão da aplicação. Você pode usar a chamada `channel` no módulo de front-end do `Log` para recuperar e logar em qualquer canal definido no arquivo de configuração:

```php
    use Illuminate\Support\Facades\Log;

    Log::channel('slack')->info('Something happened!');
```

 Se você desejar criar uma pilha de registro sob demanda consistindo em canais múltiplos, poderá usar o método `stack`:

```php
    Log::stack(['single', 'slack'])->info('Something happened!');
```

<a name="on-demand-channels"></a>
#### Canais sob pedido

 Também é possível criar um canal sob demanda fornecendo a configuração na fase de execução sem que essa configuração esteja presente no arquivo de configuração do aplicativo para log. Para fazer isso, você pode passar uma matriz de configurações ao método `build` da facade `Log`:

```php
    use Illuminate\Support\Facades\Log;

    Log::build([
      'driver' => 'single',
      'path' => storage_path('logs/custom.log'),
    ])->info('Something happened!');
```

 Também é possível incluir um canal sob demanda num conjunto de registo sob demanda, através da inclusão da instância do canal sob demanda no array enviado à função `stack`:

```php
    use Illuminate\Support\Facades\Log;

    $channel = Log::build([
      'driver' => 'single',
      'path' => storage_path('logs/custom.log'),
    ]);

    Log::stack(['slack', $channel])->info('Something happened!');
```

<a name="monolog-channel-customization"></a>
## Personalização do canal de monólogo

<a name="customizing-monolog-for-channels"></a>
### Personalizar o Monolog para canais

 Às vezes, você pode precisar ter controle completo sobre como o Monolog é configurado para um canal existente. Por exemplo, talvez você queira configurar uma implementação personalizada do `FormatterInterface` para o canal interno incorporado ao Laravel.

 Para começar, defina uma matriz `tap` na configuração do canal. A matriz `tap` deve conter uma lista de classes que devem ter oportunidade de personalizar (ou "tocar") a instância Monolog após sua criação. Não há um local convencional onde essas classes podem ser colocadas, por isso é possível criar um diretório na aplicação para contê-las:

```php
    'single' => [
        'driver' => 'single',
        'tap' => [App\Logging\CustomizeFormatter::class],
        'path' => storage_path('logs/laravel.log'),
        'level' => env('LOG_LEVEL', 'debug'),
        'replace_placeholders' => true,
    ],
```

 Depois de configurar a opção `tap` em seu canal, você está pronto para definir a classe que personalizará sua instância do Monolog. Essa classe precisa somente de uma única função: `__invoke`, que recebe uma instância da classe `Illuminate\Log\Logger`. A instância `Illuminate\Log\Logger` faz as chamadas proxies para a instância subjacente do Monolog:

```php
    <?php

    namespace App\Logging;

    use Illuminate\Log\Logger;
    use Monolog\Formatter\LineFormatter;

    class CustomizeFormatter
    {
        /**
         * Customize the given logger instance.
         */
        public function __invoke(Logger $logger): void
        {
            foreach ($logger->getHandlers() as $handler) {
                $handler->setFormatter(new LineFormatter(
                    '[%datetime%] %channel%.%level_name%: %message% %context% %extra%'
                ));
            }
        }
    }
```

 > [!AVISO]
 (serviços do) container, portanto, quaisquer dependências necessárias serão automaticamente injetadas no construtor.

<a name="creating-monolog-handler-channels"></a>
### Criando canais de manipuladores de monólogo

 O Monolog tem vários [manipuladores disponíveis](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler) e o Laravel não inclui um canal embutido para cada manipulador. Em alguns casos, pode ser desejável criar um canal personalizado que seja apenas uma instância de um manipulador Monolog específico que não tenha um driver de registo do Laravel correspondente. Estes canais podem ser facilmente criados utilizando o driver `monolog`.

 Ao utilizar o driver `monolog`, a opção de configuração `handler` é utilizada para especificar qual o mão-de-obra que será instanciado. Opcionalmente, os parâmetros do construtor necessários ao manipulador podem ser especificados com a opção de configuração `with`:

```php
    'logentries' => [
        'driver'  => 'monolog',
        'handler' => Monolog\Handler\SyslogUdpHandler::class,
        'with' => [
            'host' => 'my.logentries.internal.datahubhost.company.com',
            'port' => '10000',
        ],
    ],
```

<a name="monolog-formatters"></a>
#### Monologue formateadores

 Quando se utiliza o driver `monolog`, o Monolog `LineFormatter` é utilizado como o formatação padrão. No entanto, pode personalizar o tipo de formatação passada para o gestor através das opções de configuração `formatter` e `formatter_with`:

```php
    'browser' => [
        'driver' => 'monolog',
        'handler' => Monolog\Handler\BrowserConsoleHandler::class,
        'formatter' => Monolog\Formatter\HtmlFormatter::class,
        'formatter_with' => [
            'dateFormat' => 'Y-m-d',
        ],
    ],
```

 Se você estiver usando um manipulador de logs do Monolog que seja capaz de fornecer seu próprio formato, é possível definir o valor da opção de configuração `formatter` como `default`:

```php
    'newrelic' => [
        'driver' => 'monolog',
        'handler' => Monolog\Handler\NewRelicHandler::class,
        'formatter' => 'default',
    ],
```

<a name="monolog-processors"></a>
#### Processadores Monolog

 O Monolog também permite a processamento de mensagens antes do registo, podendo ser criados os próprios processadores ou utilizar-se [os processadores existentes fornecidos pelo Monolog](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Processor).

 Se você gostaria de personalizar os processadores do driver `monolog`, adicione um valor da configuração `processors` à sua configuração do canal:

```php
     'memory' => [
         'driver' => 'monolog',
         'handler' => Monolog\Handler\StreamHandler::class,
         'with' => [
             'stream' => 'php://stderr',
         ],
         'processors' => [
             // Simple syntax...
             Monolog\Processor\MemoryUsageProcessor::class,

             // With options...
             [
                'processor' => Monolog\Processor\PsrLogMessageProcessor::class,
                'with' => ['removeUsedContextFields' => true],
            ],
         ],
     ],
```

<a name="creating-custom-channels-via-factories"></a>
### Criação de canais personalizados através de fábricas

 Se você deseja definir um canal totalmente personalizado no qual tenha controle total sobre a instânciação e a configuração do Monolog, poderá especificar um tipo de driver `custom` em seu arquivo de configuração `config/logging.php`. Sua configuração deve incluir uma opção `via` que contenha o nome da classe de fábrica que será chamada para criar a instância do Monolog:

```php
    'channels' => [
        'example-custom-channel' => [
            'driver' => 'custom',
            'via' => App\Logging\CreateCustomLogger::class,
        ],
    ],
```

 Depois de configurar o canal do driver `custom`, você estará pronto para definir a classe que criará sua instância de Monolog. Essa classe precisa apenas de uma única método `__invoke` que deve retornar a instancia de logador Monolog. O método receberá como único argumento a matriz de configuração do canal:

```php
    <?php

    namespace App\Logging;

    use Monolog\Logger;

    class CreateCustomLogger
    {
        /**
         * Create a custom Monolog instance.
         */
        public function __invoke(array $config): Logger
        {
            return new Logger(/* ... */);
        }
    }
```

<a name="tailing-log-messages-using-pail"></a>
## Arquivando mensagens de registo em ficheiros usando pail

 Muitas vezes você precisa acompanhar seus logs de aplicativos em tempo real. Por exemplo, ao depurar um problema ou quando monitorando os logs do seu aplicativo para tipos específicos de erros.

 O Laravel Pail é um pacote que permite mergulhar diretamente nos arquivos de registros da sua aplicação Laravel do comando de linha de comando. Ao contrário do comando `tail` padrão, o Pail foi projetado para trabalhar com qualquer driver de log, incluindo Sentry ou Flare. Além disso, o Pail fornece um conjunto de filtros úteis que ajudam a encontrar rapidamente o que procura.

<img src="https://laravel.com/img/docs/pail-example.png">

<a name="pail-installation"></a>
### Instalação

 > [AVISO]
 [PHP 8.2+](https://php.net/releases/) e o

 Para começar, instale o Pail no seu projeto usando o gerenciador de pacotes Composer:

```bash
composer require laravel/pail
```

<a name="pail-usage"></a>
### Uso

 Para iniciar a monitorização de logs, execute o comando `pail`:

```bash
php artisan pail
```

 Para aumentar a quantidade de informações exibidas e evitar o truncamento da saída (...), utilize a opção `-v`:

```bash
php artisan pail -v
```

 Para uma exibição detalhada da informação e registros de exceção, utilize a opção "-vv":

```bash
php artisan pail -vv
```

 Para interromper o registo dos ficheiros, pressione `Ctrl+C` em qualquer altura.

<a name="pail-filtering-logs"></a>
### Filtragem de registos

<a name="pail-filtering-logs-filter-option"></a>
#### `--filtro`

 Você pode usar a opção `--filter` para filtrar os logs por tipo, arquivo, mensagem e conteúdo da trajetória de chamada (stack trace):

```bash
php artisan pail --filter="QueryException"
```

<a name="pail-filtering-logs-message-option"></a>
#### `--mensagem`

 Para filtrar registros por apenas a mensagem, pode utilizar a opção `--message`:

```bash
php artisan pail --message="User created"
```

<a name="pail-filtering-logs-level-option"></a>
#### `--nivel`

 A opção `--level` pode ser usada para filtrar os registros por seu nível de registo:

```bash
php artisan pail --level=error
```

<a name="pail-filtering-logs-user-option"></a>
#### `--usuário`

 Para exibir apenas registros que foram escritos enquanto um determinado usuário estiver autenticado, é possível fornecer o ID do usuário à opção `--user`:

```bash
php artisan pail --user=1
```
