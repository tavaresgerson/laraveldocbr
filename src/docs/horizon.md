# Laravel Horizon

<a name="introduction"></a>
## Introdução

::: info NOTA
Antes de se aprofundar no Laravel Horizon, você deve se familiarizar com os [serviços de fila](/docs/queues) básicos do Laravel. O Horizon aumenta a fila do Laravel com recursos adicionais que podem ser confusos se você ainda não estiver familiarizado com os recursos básicos de fila oferecidos pelo Laravel.
:::

O [Laravel Horizon](https://github.com/laravel/horizon) fornece um belo painel e configuração orientada a código para suas [filas Redis](/docs/queues) com tecnologia Laravel. O Horizon permite que você monitore facilmente as principais métricas do seu sistema de fila, como rendimento de trabalho, tempo de execução e falhas de trabalho.

Ao usar o Horizon, toda a configuração do seu trabalhador de fila é armazenada em um único arquivo de configuração simples. Ao definir a configuração do trabalhador do seu aplicativo em um arquivo controlado por versão, você pode facilmente dimensionar ou modificar os trabalhadores de fila do seu aplicativo ao implantar seu aplicativo.

<img src="/docs/assets/horizon-example.png">

<a name="installation"></a>
## Instalação

::: warning ATENÇÃO
O Laravel Horizon requer que você use [Redis](https://redis.io) para alimentar sua fila. Portanto, você deve garantir que sua conexão de fila esteja definida como `redis` no arquivo de configuração `config/queue.php` do seu aplicativo.
:::

Você pode instalar o Horizon em seu projeto usando o gerenciador de pacotes do Composer:

```shell
composer require laravel/horizon
```

Após instalar o Horizon, publique seus ativos usando o comando Artisan `horizon:install`:

```shell
php artisan horizon:install
```

<a name="configuration"></a>
### Configuração

Após publicar os ativos do Horizon, seu arquivo de configuração principal estará localizado em `config/horizon.php`. Este arquivo de configuração permite que você configure as opções do queue worker para seu aplicativo. Cada opção de configuração inclui uma descrição de sua finalidade, portanto, certifique-se de explorar completamente este arquivo.

::: warning ATENÇÃO
O Horizon usa uma conexão Redis chamada `horizon` internamente. Este nome de conexão Redis é reservado e não deve ser atribuído a outra conexão Redis no arquivo de configuração `database.php` ou como o valor da opção `use` no arquivo de configuração `horizon.php`.
:::

<a name="environments"></a>
#### Ambientes

Após a instalação, a principal opção de configuração do Horizon com a qual você deve se familiarizar é a opção de configuração `environments`. Esta opção de configuração é uma matriz de ambientes nos quais seu aplicativo é executado e define as opções de processo de trabalho para cada ambiente. Por padrão, esta entrada contém um ambiente `production` e `local`. No entanto, você pode adicionar mais ambientes conforme necessário:

```php
    'environments' => [
        'production' => [
            'supervisor-1' => [
                'maxProcesses' => 10,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
        ],

        'local' => [
            'supervisor-1' => [
                'maxProcesses' => 3,
            ],
        ],
    ],
```

Você também pode definir um ambiente curinga (`*`) que será usado quando nenhum outro ambiente correspondente for encontrado:

```php
    'environments' => [
        // ...

        '*' => [
            'supervisor-1' => [
                'maxProcesses' => 3,
            ],
        ],
    ],
```

Quando você inicia o Horizon, ele usa as opções de configuração do processo de trabalho para o ambiente em que seu aplicativo está sendo executado. Normalmente, o ambiente é determinado pelo valor da `APP_ENV` [variável de ambiente](/docs/configuration#determining-the-current-environment). Por exemplo, o ambiente padrão `local` do Horizon é configurado para iniciar três processos de trabalho e equilibrar automaticamente o número de processos de trabalho atribuídos a cada fila. O ambiente padrão `production` é configurado para iniciar no máximo 10 processos de trabalho e equilibrar automaticamente o número de processos de trabalho atribuídos a cada fila.

::: warning ATENÇÃO
Você deve garantir que a parte `environments` do seu arquivo de configuração `horizon` contenha uma entrada para cada [ambiente](/docs/configuration#environment-configuration) no qual você planeja executar o Horizon.
:::

<a name="supervisors"></a>
#### Supervisores

Como você pode ver no arquivo de configuração padrão do Horizon, cada ambiente pode conter um ou mais "supervisores". Por padrão, o arquivo de configuração define esse supervisor como `supervisor-1`; no entanto, você é livre para nomear seus supervisores como quiser. Cada supervisor é essencialmente responsável por "supervisionar" um grupo de processos de trabalho e cuida do balanceamento dos processos de trabalho entre as filas.

Você pode adicionar supervisores adicionais a um determinado ambiente se quiser definir um novo grupo de processos de trabalho que devem ser executados nesse ambiente. Você pode escolher fazer isso se quiser definir uma estratégia de balanceamento diferente ou contagem de processos de trabalho para uma determinada fila usada pelo seu aplicativo.

<a name="maintenance-mode"></a>
#### Modo de manutenção

Enquanto seu aplicativo estiver no [modo de manutenção](/docs/configuration#maintenance-mode), os trabalhos na fila não serão processados ​​pelo Horizon, a menos que a opção `force` do supervisor seja definida como `true` no arquivo de configuração do Horizon:

```php
    'environments' => [
        'production' => [
            'supervisor-1' => [
                // ...
                'force' => true,
            ],
        ],
    ],
```

<a name="default-values"></a>
#### Valores padrão

No arquivo de configuração padrão do Horizon, você notará uma opção de configuração `defaults`. Esta opção de configuração especifica os valores padrão para os [supervisores](#supervisors) do seu aplicativo. Os valores de configuração padrão do supervisor serão mesclados na configuração do supervisor para cada ambiente, permitindo que você evite repetições desnecessárias ao definir seus supervisores.

<a name="balancing-strategies"></a>
### Estratégias de balanceamento

Ao contrário do sistema de fila padrão do Laravel, o Horizon permite que você escolha entre três estratégias de balanceamento de trabalhadores: `simple`, `auto` e `false`. A estratégia `simple` divide os trabalhos recebidos uniformemente entre os processos de trabalho:

```php
    'balance' => 'simple',
```

A estratégia `auto`, que é o padrão do arquivo de configuração, ajusta o número de processos de trabalho por fila com base na carga de trabalho atual da fila. Por exemplo, se sua fila `notifications` tiver 1.000 trabalhos pendentes enquanto sua fila `render` estiver vazia, o Horizon alocará mais trabalhadores para sua fila `notifications` até que a fila esteja vazia.

Ao usar a estratégia `auto`, você pode definir as opções de configuração `minProcesses` e `maxProcesses` para controlar o número mínimo e máximo de processos de trabalho que o Horizon deve aumentar e diminuir para:

```php
    'environments' => [
        'production' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['default'],
                'balance' => 'auto',
                'autoScalingStrategy' => 'time',
                'minProcesses' => 1,
                'maxProcesses' => 10,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
                'tries' => 3,
            ],
        ],
    ],
```

O valor de configuração `autoScalingStrategy` determina se o Horizon atribuirá mais processos de trabalho às filas com base na quantidade total de tempo que levará para limpar a fila (estratégia `time`) ou pelo número total de trabalhos na fila (estratégia `size`).

Os valores de configuração `balanceMaxShift` e `balanceCooldown` determinam a rapidez com que o Horizon será dimensionado para atender à demanda do trabalho. No exemplo acima, no máximo um novo processo será criado ou destruído a cada três segundos. Você está livre para ajustar esses valores conforme necessário com base nas necessidades do seu aplicativo.

Quando a opção `balance` é definida como `false`, o comportamento padrão do Laravel será usado, em que as filas são processadas na ordem em que são listadas na sua configuração.

<a name="dashboard-authorization"></a>
### Autorização do painel

O painel do Horizon pode ser acessado pela rota `/horizon`. Por padrão, você só poderá acessar este painel no ambiente `local`. No entanto, dentro do seu arquivo `app/Providers/HorizonServiceProvider.php`, há uma definição de [portão de autorização](/docs/authorization#gates). Este portão de autorização controla o acesso ao Horizon em ambientes **não locais**. Você é livre para modificar este portão conforme necessário para restringir o acesso à sua instalação do Horizon:

```php
    /**
     * Registre o portão Horizon.
     *
     * Este portão determina quem pode acessar o Horizon em ambientes não locais.
     */
    protected function gate(): void
    {
        Gate::define('viewHorizon', function (User $user) {
            return in_array($user->email, [
                'taylor@laravel.com',
            ]);
        });
    }
```

<a name="alternative-authentication-strategies"></a>
#### Estratégias alternativas de autenticação

Lembre-se de que o Laravel injeta automaticamente o usuário autenticado no *closure* do portão. Se seu aplicativo estiver fornecendo segurança do Horizon por outro método, como restrições de IP, seus usuários do Horizon podem não precisar "fazer login". Portanto, você precisará alterar a assinatura de *closure* `function (User $user)` acima para `function (User $user = null)` para forçar o Laravel a não exigir autenticação.

<a name="silenced-jobs"></a>
### Trabalhos silenciados

Às vezes, você pode não estar interessado em visualizar certos trabalhos despachados pelo seu aplicativo ou pacotes de terceiros. Em vez de esses trabalhos ocuparem espaço na sua lista de "Trabalhos concluídos", você pode silenciá-los. Para começar, adicione o nome da classe do trabalho à opção de configuração `silenced` no arquivo de configuração `horizon` do seu aplicativo:

```php
    'silenced' => [
        App\Jobs\ProcessPodcast::class,
    ],
```

Alternativamente, o trabalho que você deseja silenciar pode implementar a interface `Laravel\Horizon\Contracts\Silenced`. Se um trabalho implementar esta interface, ele será silenciado automaticamente, mesmo que não esteja presente no array de configuração `silenced`:

```php
    use Laravel\Horizon\Contracts\Silenced;

    class ProcessPodcast implements ShouldQueue, Silenced
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        // ...
    }
```

<a name="upgrading-horizon"></a>
## Atualizando o Horizon

Ao atualizar para uma nova versão principal do Horizon, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/horizon/blob/master/UPGRADE.md).

<a name="running-horizon"></a>
## Executando o Horizon

Depois de configurar seus supervisores e workers no arquivo de configuração `config/horizon.php` do seu aplicativo, você pode iniciar o Horizon usando o comando Artisan `horizon`. Este comando único iniciará todos os processos de trabalho configurados para o ambiente atual:

```shell
php artisan horizon
```

Você pode pausar o processo Horizon e instruí-lo a continuar processando trabalhos usando os comandos Artisan `horizon:pause` e ​​`horizon:continue`:

```shell
php artisan horizon:pause

php artisan horizon:continue
```

Você também pode pausar e continuar [supervisores](#supervisors) Horizon específicos usando os comandos Artisan `horizon:pause-supervisor` e `horizon:continue-supervisor`:

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

Você pode verificar o status atual do processo Horizon usando o comando Artisan `horizon:status`:

```shell
php artisan horizon:status
```

Você pode encerrar o processo Horizon normalmente usando o comando Artisan `horizon:terminate`. Todos os trabalhos que estão sendo processados ​​atualmente serão concluídos e o Horizon parará de executar:

```shell
php artisan horizon:terminate
```

<a name="deploying-horizon"></a>
### Implantando o Horizon

Quando estiver pronto para implantar o Horizon no servidor real do seu aplicativo, você deve configurar um monitor de processo para monitorar o comando `php artisan horizon` e reiniciá-lo se ele sair inesperadamente. Não se preocupe, discutiremos como instalar um monitor de processo abaixo.

Durante o processo de implantação do seu aplicativo, você deve instruir o processo do Horizon a encerrar para que ele seja reiniciado pelo seu monitor de processo e receba suas alterações de código:

```shell
php artisan horizon:terminate
```

<a name="installing-supervisor"></a>
#### Instalando o Supervisor

O Supervisor é um monitor de processo para o sistema operacional Linux e reiniciará automaticamente seu processo `horizon` se ele parar de executar. Para instalar o Supervisor no Ubuntu, você pode usar o seguinte comando. Se você não estiver usando o Ubuntu, provavelmente poderá instalar o Supervisor usando o gerenciador de pacotes do seu sistema operacional:

```shell
sudo apt-get install supervisor
```

::: info NOTA
Se configurar o Supervisor sozinho parece complicado, considere usar o [Laravel Forge](https://forge.laravel.com), que instalará e configurará o Supervisor automaticamente para seus projetos Laravel.
:::

<a name="supervisor-configuration"></a>
#### Configuração do Supervisor

Os arquivos de configuração do Supervisor são normalmente armazenados no diretório `/etc/supervisor/conf.d` do seu servidor. Dentro deste diretório, você pode criar qualquer número de arquivos de configuração que instruem o supervisor sobre como seus processos devem ser monitorados. Por exemplo, vamos criar um arquivo `horizon.conf` que inicia e monitora um processo `horizon`:

```ini
[program:horizon]
process_name=%(program_name)s
command=php /home/forge/example.com/artisan horizon
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/example.com/horizon.log
stopwaitsecs=3600
```

Ao definir sua configuração do Supervisor, você deve garantir que o valor de `stopwaitsecs` seja maior que o número de segundos consumidos pelo seu trabalho de execução mais longa. Caso contrário, o Supervisor pode encerrar o trabalho antes que ele termine o processamento.

::: warning ATENÇÃO
Embora os exemplos acima sejam válidos para servidores baseados em Ubuntu, o local e a extensão de arquivo esperados dos arquivos de configuração do Supervisor podem variar entre outros sistemas operacionais de servidor. Consulte a documentação do seu servidor para obter mais informações.
:::

<a name="starting-supervisor"></a>
#### Iniciando o Supervisor

Depois que o arquivo de configuração for criado, você pode atualizar a configuração do Supervisor e iniciar os processos monitorados usando os seguintes comandos:

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

::: info NOTA
Para obter mais informações sobre como executar o Supervisor, consulte a [documentação do Supervisor](http://supervisord.org/index.html).
:::

<a name="tags"></a>
## Tags

O Horizon permite que você atribua "tags" a trabalhos, incluindo mailables, eventos de transmissão, notificações e ouvintes de eventos em fila. Na verdade, o Horizon marcará de forma inteligente e automática a maioria dos trabalhos, dependendo dos modelos Eloquent anexados ao trabalho. Por exemplo, dê uma olhada no seguinte trabalho:

```php
    <?php

    namespace App\Jobs;

    use App\Models\Video;
    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Foundation\Bus\Dispatchable;
    use Illuminate\Queue\InteractsWithQueue;
    use Illuminate\Queue\SerializesModels;

    class RenderVideo implements ShouldQueue
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        /**
         * Crie uma nova instância de trabalho.
         */
        public function __construct(
            public Video $video,
        ) {}

        /**
         * Execute o trabalho.
         */
        public function handle(): void
        {
            // ...
        }
    }
```

Se este trabalho for enfileirado com uma instância `App\Models\Video` que tenha um atributo `id` de `1`, ele receberá automaticamente a tag `App\Models\Video:1`. Isso ocorre porque o Horizon pesquisará as propriedades do trabalho para quaisquer modelos Eloquent. Se modelos Eloquent forem encontrados, o Horizon marcará o trabalho de forma inteligente usando o nome da classe e a chave primária do modelo:

```php
    use App\Jobs\RenderVideo;
    use App\Models\Video;

    $video = Video::find(1);

    RenderVideo::dispatch($video);
```

<a name="manually-tagging-jobs"></a>
#### Marcando trabalhos manualmente

Se você quiser definir manualmente as tags para um dos seus objetos que podem ser enfileirados, você pode definir um método `tags` na classe:

```php
    class RenderVideo implements ShouldQueue
    {
        /**
         * Obtenha as tags que devem ser atribuídas ao trabalho.
         *
         * @return array<int, string>
         */
        public function tags(): array
        {
            return ['render', 'video:'.$this->video->id];
        }
    }
```

<a name="manually-tagging-event-listeners"></a>
#### Marcando manualmente ouvintes de eventos

Ao recuperar as tags para um ouvinte de eventos enfileirado, o Horizon passará automaticamente a instância do evento para o método `tags`, permitindo que você adicione dados de eventos às tags:

```php
    class SendRenderNotifications implements ShouldQueue
    {
        /**
         * Obtenha as tags que devem ser atribuídas ao ouvinte.
         *
         * @return array<int, string>
         */
        public function tags(VideoRendered $event): array
        {
            return ['video:'.$event->video->id];
        }
    }
```

<a name="notifications"></a>
## Notificações

::: warning ATENÇÃO
Ao configurar o Horizon para enviar notificações do Slack ou SMS, você deve revisar os [pré-requisitos para o canal de notificação relevante](/docs/notifications).
:::

Se você quiser ser notificado quando uma de suas filas tiver um longo tempo de espera, você pode usar os métodos `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo` e `Horizon::routeSmsNotificationsTo`. Você pode chamar esses métodos do método `boot` do `App\Providers\HorizonServiceProvider` do seu aplicativo:

```php
    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        parent::boot();

        Horizon::routeSmsNotificationsTo('15556667777');
        Horizon::routeMailNotificationsTo('example@example.com');
        Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
    }
```

<a name="configuring-notification-wait-time-thresholds"></a>
#### Configurando Limites de Tempo de Espera de Notificação

Você pode configurar quantos segundos são considerados uma "longa espera" no arquivo de configuração `config/horizon.php` do seu aplicativo. A opção de configuração `waits` dentro deste arquivo permite que você controle o limite de espera longa para cada combinação de conexão/fila. Qualquer combinação de conexão/fila indefinida terá como padrão um limite de espera longa de 60 segundos:

```php
    'waits' => [
        'redis:critical' => 30,
        'redis:default' => 60,
        'redis:batch' => 120,
    ],
```

<a name="metrics"></a>
## Métricas

O Horizon inclui um painel de métricas que fornece informações sobre seus tempos de espera de trabalho e fila e rendimento. Para preencher este painel, você deve configurar o comando Artisan `snapshot` do Horizon para ser executado a cada cinco minutos no arquivo `routes/console.php` do seu aplicativo:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('horizon:snapshot')->everyFiveMinutes();
```
<a name="deleting-failed-jobs"></a>
## Excluindo trabalhos com falha

Se você quiser excluir um trabalho com falha, pode usar o comando `horizon:forget`. O comando `horizon:forget` aceita o ID ou UUID do trabalho com falha como seu único argumento:

```shell
php artisan horizon:forget 5
```

<a name="clearing-jobs-from-queues"></a>
## Limpando trabalhos de filas

Se você quiser excluir todos os trabalhos da fila padrão do seu aplicativo, você pode fazer isso usando o comando Artisan `horizon:clear`:

```shell
php artisan horizon:clear
```

Você pode fornecer a opção `queue` para excluir trabalhos de uma fila específica:

```shell
php artisan horizon:clear --queue=emails
```
