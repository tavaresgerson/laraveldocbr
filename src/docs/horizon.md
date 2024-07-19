# Laravel Horizonte

<a name="introduction"></a>
## Introdução

 > [!AVISO]
 [Serviços de filas](/docs/queues) O Horizon expande o sistema de fila do Laravel com recursos adicionais que podem ser confusos se você ainda não estiver familiarizado com os recursos básicos oferecidos pelo Laravel.

 O Horizontes do Laravel (https://github.com/laravel/horizon) disponibiliza uma bela dashboard e configuração com base em código para seus [filas Redis](/docs/queues). Com o Horizontes, você pode monitorar facilmente métricas chave de seu sistema de filas, tais como tráfego, tempo de execução e falhas do trabalho.

 Ao usar o Horizon, toda a configuração do trabalhador de fila é armazenada em um único arquivo de configuração simples. Ao definir a configuração de trabalhadores da aplicação em um arquivo controlado por versão, você pode facilmente dimensionar ou modificar os trabalhadores de filas quando for implantar sua aplicação.

<img src="https://laravel.com/img/docs/horizon-example.png">

<a name="installation"></a>
## Instalação

 > [!AVISO]
 [Redis] (https://redis.io) para alimentar sua fila. Portanto, você deve garantir que a conexão da sua fila está definida como "redis" no arquivo de configuração `config/queue.php` do aplicativo.

 Você pode instalar o Horizon no seu projeto usando o gerenciador de pacotes Composer da seguinte maneira:

```shell
composer require laravel/horizon
```

 Depois de instalar o Horizon, publique seus ativos usando a ordem do artesão `horizon:install`:

```shell
php artisan horizon:install
```

<a name="configuration"></a>
### Configuração

 Após publicar os recursos do Horizon, seu arquivo de configuração primário estará localizado em `config/horizon.php`. Esse arquivo de configuração permite configurar as opções de funcionamento da fila para o aplicativo. Cada opção de configuração inclui uma descrição sobre a finalidade, por isso certifique-se de explorá-lo detalhadamente.

 > [!ATENÇÃO]
 > O Horizon usa, internamente, uma conexão Redis chamada "horizon". Esse nome de conexão está reservado e não deve ser atribuído a outra conexão Redis no arquivo de configuração `database.php` ou como o valor da opção `use` no arquivo de configuração `horizon.php`.

<a name="environments"></a>
#### Ambientes

 Após a instalação, é importante conhecer o opção de configuração principal do Horizon que você deve familiarizar-se com. Esse recurso é a opção de configuração `environments`. Essa opção de configuração é um conjunto de ambientes nos quais sua aplicação funciona e define as opções de processo de trabalhador para cada ambiente. Por padrão, essa entrada contém os ambientes de "produção" e "local". No entanto, você pode adicionar mais ambientes conforme necessário:

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

 Você também pode definir um ambiente de "sinalizador" (asterisco `*`), que será usado quando nenhum outro ambiente correspondente for encontrado:

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

 Quando você iniciar o Horizon, ele usará as opções de configuração do processo trabalhador para o ambiente que seu aplicativo está executando. Normalmente, o ambiente é determinado pelo valor da variável ambiental `APP_ENV`. Por exemplo, o ambiente Horizon padrão "local" está configurado para iniciar três processos de trabalho e equilibrar automaticamente o número de processos de trabalho atribuídos a cada fila. O ambiente Horizon padrão "produção" está configurado para iniciar, no máximo, dez processos de trabalho e equilibrar automaticamente o número de processos de trabalho atribuídos a cada fila.

 > [AVERTISSEMENT]
 O ambiente [Meio ambiente](/docs/configuration#environment-configuration) no qual você pretende executar o Horizon.

<a name="supervisors"></a>
#### Supervisores

 Como pode ver no ficheiro de configuração padrão do Horizon, cada ambiente pode conter um ou vários "supervisores". Por defeito, o ficheiro de configuração define este supervisor como `supervisor-1`. No entanto, é possível designar os seus próprios nomes aos supervisores. Cada supervisor é essencialmente responsável por "supervisionar" um grupo de processos de trabalhadores e zela pelo equilíbrio dos processos de trabalhador através das filas.

 Pode adicionar supervisores adicionais a um determinado ambiente, se pretender definir um novo grupo de processos de trabalho que devem ser executados nesse ambiente. Tal pode ser útil para definir uma estratégia de equilíbrio diferente ou o número de processos de trabalho para determinada fila utilizada na aplicação.

<a name="maintenance-mode"></a>
#### Modo de Manutenção

 Enquanto o seu aplicativo estiver em [modo de manutenção](/docs/configuration#maintenance-mode), os trabalhos pendentes não serão processados pelo Horizon, a menos que a opção `force` do supervisor seja definida como `true` no ficheiro de configuração do Horizon:

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
#### Valores por padrão

 No arquivo de configuração padrão do Horizon, você verá uma opção de configuração chamada `defaults`. Essa opção especifica os valores padrão para [supervisores] da aplicação. Os valores de configuração padrão do supervisor serão mesclados com a configuração do supervisor para cada ambiente, evitando repetições desnecessárias na definição dos supervisores.

<a name="balancing-strategies"></a>
### Estratégias de equilíbrio

 Diferente do sistema de fila padrão do Laravel, o Horizon permite escolher entre três estratégias de balanceamento de trabalhadores: `simple`, `auto` e `false`. A estratégia `simple` divide os trabalhos recebidos igualmente pelos processos trabalhadores:

```php
    'balance' => 'simple',
```

 A estratégia "auto", que é a predefinida do arquivo de configuração, ajusta o número de processos de trabalho por fila com base na carga de trabalho atual da fila. Por exemplo, se sua fila "notificações" tiver 1000 pedidos pendentes e sua fila "render" estiver vazia, o Horizon alocará mais processos de trabalho para a fila "notificações", até que esta esteja vazia.

 Ao utilizar a estratégia "auto", pode definir as opções de configuração "minProcesses" e "maxProcesses" para controlar o número mínimo e máximo de processos de trabalhadores com os quais Horizon irá escalonar up and down:

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

 O valor da configuração `autoScalingStrategy` determina se o Horizon atribuirá mais processos de trabalho aos ficheiros de saída com base na quantidade total de tempo necessário para limpar os ficheiros de saída (`time` estratégia) ou no número total de tarefas nos ficheiros de saída (`size` estratégia).

 Os valores `balanceMaxShift` e `balanceCooldown` determinam a rapidez com que o Horizon se adapta à procura dos trabalhadores. No exemplo acima, um novo processo será criado ou destruído no máximo uma vez a cada três segundos. Pode modificar estes valores de acordo com as necessidades da sua aplicação.

 Quando a opção `balance` é definida como `false`, será utilizado o comportamento padrão do Laravel, onde as filas são processadas na ordem em que estão listadas na sua configuração.

<a name="dashboard-authorization"></a>
### Autorização no Painel de Controle

 O painel do Horizon pode ser acessado por meio da rota `/horizon`. Por padrão, você somente poderá acessar esse painel no ambiente `local`. No entanto, em seu arquivo `app/Providers/HorizonServiceProvider.php`, há uma definição de [porta de autorização](/docs/authorization#gates). Essa porta de autorização controla o acesso ao Horizon em ambientes **não-locais**. Você pode modificar essa porta conforme necessário para restringir o acesso à sua instalação do Horizon:

```php
    /**
     * Register the Horizon gate.
     *
     * This gate determines who can access Horizon in non-local environments.
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

 Lembre-se de que o Laravel injeta automaticamente o usuário autenticado no closure do gate. Se a aplicação estiver fornecendo segurança para Horizon por meio de outro método, como restrições de IP, pode não ser necessária uma "entrada" dos seus usuários. Sendo assim, você precisará alterar a assinatura do closure acima de `function (User $user)` para `function (User $user = null)`, para forçar o Laravel a não solicitar autenticação.

<a name="silenced-jobs"></a>
### Empregos silenciados

 Às vezes, você pode não ter interesse em visualizar certos trabalhos distribuídos por seu aplicativo ou pacotes de terceiros. Em vez disso, eles ocuparem espaço na lista "Trabalhos concluídos", você poderá silenciar essas tarefas. Para começar, adicione o nome da classe do trabalho à opção de configuração `silenced` do arquivo de configuração do seu aplicativo:

```php
    'silenced' => [
        App\Jobs\ProcessPodcast::class,
    ],
```

 Em alternativa, o trabalho que você deseja silenciar pode implementar a interface `Laravel\Horizon\Contracts\Silenced`. Se um trabalho implementa essa interface, ele será automaticamente silenciado, mesmo se não estiver presente no array de configuração `silenced`:

```php
    use Laravel\Horizon\Contracts\Silenced;

    class ProcessPodcast implements ShouldQueue, Silenced
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        // ...
    }
```

<a name="upgrading-horizon"></a>
## Atingindo um horizonte superior

 Ao fazer o upgrade para uma nova versão principal do Horizon, é importante que você analise [este guia de upgrade](https://github.com/laravel/horizon/blob/master/UPGRADE.md) cuidadosamente.

<a name="running-horizon"></a>
## Cenário correndo

 Depois de configurar os supervisores e trabalhadores no arquivo de configuração do aplicativo `config/horizon.php`, você pode iniciar o Horizon usando o comando de Arquiteto `horizon`. Este único comando iniciará todos os processos de trabalho da área atual configurados:

```shell
php artisan horizon
```

 Você pode pausar o processo do Horizon e instrui-lo a continuar processando os trabalhos usando as ordens do Artesão `horizon:pause` e `horizon:continue`:

```shell
php artisan horizon:pause

php artisan horizon:continue
```

 Você também pode interromper e continuar supervisores específicos do Horizon, usando os comandos de Arquitetura "horizon:pause-supervisor" e "horizon:continue-supervisor":

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

 Pode verificar o estado atual do processo de Horizon utilizando a ordem mágica `horizon:status`:

```shell
php artisan horizon:status
```

 Você pode encerrar o processo do Horizon com graça usando o comando `horizon:terminate`. Todas as tarefas que estiverem sendo executadas serão concluídas, e então o Horizon deixará de ser executado:

```shell
php artisan horizon:terminate
```

<a name="deploying-horizon"></a>
### Implementar o Horizon

 Quando estiver pronto para implantar o Horizon no servidor da aplicação, deve configurar um processo de monitorização para controlar o comando `php artisan horizon` e reiniciá-lo se ele sair inesperadamente. Não se preocupe, vamos discutir como instalar um processo de monitorização abaixo.

 Durante o processo de implantação do seu aplicativo, você deve instruir o processo do Horizon a terminar para que ele seja reiniciado por seu supervisor de processos e receba suas alterações de código:

```shell
php artisan horizon:terminate
```

<a name="installing-supervisor"></a>
#### Instalando o Supervisor

 O Supervisor é um monitor de processos para o sistema operacional Linux e reinicia automaticamente seu processo `horizon` se ele parar de executar. Para instalar o Supervisor no Ubuntu, você pode usar o comando a seguir. Se você não estiver usando o Ubuntu, provavelmente poderá instalar o Supervisor usando o gerenciador de pacotes do seu sistema operacional:

```shell
sudo apt-get install supervisor
```

 > [!ATENÇÃO]
 O [Laravel Forge](https://forge.laravel.com), que irá instalar e configurar automaticamente o Supervisor para os seus projetos Laravel.

<a name="supervisor-configuration"></a>
#### Configuração do supervisor

 Os arquivos de configuração do Supervisor são normalmente armazenados na pasta `/etc/supervisor/conf.d` do seu servidor. Nessa pasta, você pode criar diversos arquivos de configuração que indicam ao Supervisor como os processos devem ser monitorados. Por exemplo, vamos criar um arquivo `horizon.conf` para iniciar e monitorar o processo `horizon`:

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

 Ao definir a sua configuração do supervisor, certifique-se de que o valor do `stopwaitsecs` é superior ao número de segundos consumidos pelo seu trabalho em execução mais longo. Caso contrário, poderá ocorrer o fecho do processo antes de terminar o processamento.

 > [!AVISO]
 > Embora os exemplos acima sejam válidos para servidores baseados no Ubuntu, o local e a extensão de arquivo esperados dos arquivos de configuração do Supervisor podem variar em outros sistemas operacionais de servidor. Consulte a documentação do seu servidor para mais informações.

<a name="starting-supervisor"></a>
#### Gerente de início

 Uma vez criado o arquivo de configuração, você pode atualizar a configuração do Supervisor e iniciar os processos monitorados usando os seguintes comandos:

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

 > [!NOTA]
 [Documentação do Supervisor.](http://supervisord.org/index.html)

<a name="tags"></a>
## Tags

 O Horizon permite que você atribua "etiquetas" aos trabalhos, incluindo material enviável por e-mail, eventos de transmissão, notificações e escutas de evento em fila. Na verdade, o Horizon irá etiquetar inteligentemente e automaticamente a maioria dos trabalhos de acordo com os modelos Eloquent que estiverem vinculados ao trabalho. Por exemplo, confira o seguinte trabalho:

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
         * Create a new job instance.
         */
        public function __construct(
            public Video $video,
        ) {}

        /**
         * Execute the job.
         */
        public function handle(): void
        {
            // ...
        }
    }
```

 Se este trabalho estiver pendentemente com uma instância de `App\Models\Video` que tenha um atributo `id` de `1`, receberá automaticamente a etiqueta `App\Models\Video:1`. Isso ocorre porque Horizon procurará as propriedades do trabalho em busca de qualquer modelo Eloquent. Se forem encontrados modelos Eloquent, Horizon irá inteligentemente etiquetar o trabalho usando o nome da classe e a chave primária do modelo:

```php
    use App\Jobs\RenderVideo;
    use App\Models\Video;

    $video = Video::find(1);

    RenderVideo::dispatch($video);
```

<a name="manually-tagging-jobs"></a>
#### Marcação manual de trabalhos

 Se desejar definir manualmente as tags para um de seus objetos com capacidade de fila, você poderá definir um método `tags` na classe:

```php
    class RenderVideo implements ShouldQueue
    {
        /**
         * Get the tags that should be assigned to the job.
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
#### Marcação manual de eventos para escuta

 Ao recuperar as tags para um evento agendado de um listener, o Horizon passará automaticamente a instância do evento ao método `tags`, permitindo que você adicione dados de eventos às tags:

```php
    class SendRenderNotifications implements ShouldQueue
    {
        /**
         * Get the tags that should be assigned to the listener.
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

 > [ADVERTÊNCIA]
 [Pré-requisitos para a notificação relevante do canal](/docs/notifications).

 Se deseja ser notificado quando uma das suas filas apresentar tempo de espera elevado, pode utilizar as funções `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo` e `Horizon::routeSmsNotificationsTo`. Pode chamar estas funções no método `boot` do seu aplicativo `App\Providers\HorizonServiceProvider`:

```php
    /**
     * Bootstrap any application services.
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
#### Configurar limiares de tempo de espera para notificação

 Pode configurar o número de segundos considerados como "espera demorada" no ficheiro de configuração `config/horizon.php` da aplicação. A opção de configuração `waits`, neste ficheiro, permite controlar o limiar para espera demorada de cada combinação ligação/fila. As combinações de ligação/fila não definidas terão um limiar para espera demorada padrão de 60 segundos:

```php
    'waits' => [
        'redis:critical' => 30,
        'redis:default' => 60,
        'redis:batch' => 120,
    ],
```

<a name="metrics"></a>
## Metas

 O Horizon inclui um painel de métricas que fornece informações sobre o tempo de espera do trabalho e da fila, bem como o rendimento. Para preencher esse painel, você deve configurar o comando snaphot Artisan do Horizon para ser executado a cada cinco minutos no arquivo `routes/console.php` do aplicativo:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('horizon:snapshot')->everyFiveMinutes();
```
<a name="deleting-failed-jobs"></a>
## Excluir tarefas com falha

 Se desejar eliminar um trabalho falhado, pode usar o comando `horizon:forget`. O comando `horizon:forget` aceita o ID ou o UUID do trabalho falhado como único argumento:

```shell
php artisan horizon:forget 5
```

<a name="clearing-jobs-from-queues"></a>
## Limpar tarefas das filas

 Se você desejar excluir todos os trabalhos da fila padrão de seu aplicativo, poderá fazer isso usando o comando `horizon:clear` do módulo Artisan:

```shell
php artisan horizon:clear
```

 Você pode fornecer a opção `queue` para apagar tarefas de uma fila específica:

```shell
php artisan horizon:clear --queue=emails
```
