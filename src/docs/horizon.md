# Laravel Horizon

<a name="introduction"></a>
## Introdução

> Nota!
> Antes de mergulhar no Horizon, você deve se familiarizar com o [serviço de fila](docs/queues) básico do Laravel. O Horizon adiciona recursos adicionais à fila do Laravel que podem ser confusos se você ainda não estiver familiarizado com os recursos básicos da fila oferecidos pelo Laravel.

O [Laravel Horizon](https://github.com/laravel/horizon) fornece um belo painel e uma configuração baseada em código para sua fila Redis alimentada por Laravel. O Horizon permite que você monitore facilmente métricas-chave de seu sistema de filas, como taxa de throughput de trabalhos, tempo de execução, e falhas de trabalhos.

Ao usar o Horizon, toda sua configuração do trabalho de fila é armazenada em um único arquivo de configuração simples. Ao definir sua configuração do trabalho de aplicativos em um arquivo controlado por versão, você pode facilmente dimensionar ou modificar seus trabalhadores da fila ao implantar seu aplicativo.

<img src="https://laravel.com/img/docs/horizon-example.png">

<a name="installation"></a>
## Instalação

> [ALERTA]
> O Laravel Horizon exige que você utilize [Redis](https://redis.io) para alimentar sua fila. Por isso, é importante garantir que a conexão da fila esteja definida como 'redis' no arquivo de configuração `config/queue.php` do seu aplicativo.

Você pode instalar o Horizon em seu projeto usando o Composer package manager:

```shell
composer require laravel/horizon
```

Depois da instalação do Horizon, publique seus ativos usando o comando 'horizon:install':

```shell
php artisan horizon:install
```

<a name="configuration"></a>
### Configuração

Depois de publicar os ativos do Horizonte, seu arquivo de configuração primário estará localizado em 'config/horizon.php'. Esse arquivo de configuração permite que você configure as opções para o trabalhador da fila para sua aplicação. Cada opção de configuração inclui uma descrição de sua finalidade, então tenha certeza de explorar totalmente este arquivo.

> [Aviso]
> O Horizon usa uma conexão interna Redis chamada "horizon". Este nome de conexão Redis é reservado e não deve ser atribuído a outra conexão Redis no arquivo de configuração "database.php" ou como valor da opção "use" no arquivo de configuração "horizon.php".

<a name="environments"></a>
#### Ambiente

Depois da instalação, a configuração Horizon principal com a qual você deve se familiarizar é a opção de configuração "meios". Esta opção de configuração é um array de ambientes em que seu aplicativo executa e define as opções do processo trabalhador para cada ambiente. Por padrão, esta entrada contém um "ambiente de produção" e "local". No entanto, você está livre para adicionar mais ambientes conforme necessário:

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

Você também pode definir um ambiente de caractere curinga (`` *'') que será usado quando nenhum outro ambiente correspondente é encontrado:

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

Ao iniciar o Horizon, ele vai utilizar as opções de configuração do processo trabalhador para o ambiente em que seu aplicativo está rodando. Geralmente, o ambiente é determinado pelo valor da variável `APP_ENV` [variável de ambiente]/docs/configuration#determining-the-current-environment]. Por exemplo, o ambiente padrão "local" do Horizon é configurado para iniciar três processos trabalhadores e equilibrar automaticamente os processos trabalhadores atribuídos a cada fila. O ambiente padrão "produção" do Horizon é configurado para iniciar um número máximo de 10 processos trabalhadores e equilibrar automaticamente os processos trabalhadores atribuídos a cada fila.

> [AVERTÊNCIA]
> Você deve garantir que a parte de "ambiente" do arquivo de configuração de seu "horizonte" contém uma entrada para cada [ambiente]/docs/configuration#ambiente-configuração em que você planeja executar o Horizon.

<a name="supervisors"></a>
#### Supervisores

Como você pode ver no arquivo de configuração padrão do Horizon, cada ambiente pode conter um ou mais "supervisores". Por padrão, o arquivo de configuração define este supervisor como `supervisor-1`, mas você é livre para dar a ele qualquer nome que quiser. Cada supervisor é responsável fundamentalmente por "supervisionar" um grupo de processos trabalhistas e cuidar de equilibrar os processos trabalhistas entre as filas.

Você pode adicionar mais supervisores a um determinado ambiente, se quiser definir um novo grupo de processos de trabalho que devem ser executados nesse ambiente. Você pode optar por fazer isso se quiser definir uma estratégia diferente ou número de processos de trabalho para uma determinada fila usada pelo seu aplicativo.

<a name="maintenance-mode"></a>
#### Modo de Manutenção

Enquanto seu aplicativo estiver em [modo de manutenção](/docs/configuration#maintenance-mode), trabalhos enfileirados não serão processados por Horizon a menos que a opção force do supervisor seja definida como true no arquivo de configuração do Horizon.

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

Dentro do arquivo padrão de configuração de Horizon, você notará uma opção de configuração "padrão". Esta opção de configuração especifica os valores padrão para seus aplicativos [supervisores](#supervisors). Os valores padrão da configuração do supervisor serão mesclados com a configuração do supervisor para cada ambiente, permitindo que você evite repetições desnecessárias ao definir seus supervisores.

<a name="balancing-strategies"></a>
### Estratégias de Equilíbrio

Diferente do sistema de filas padrão do Laravel, o Horizon permite escolher entre três estratégias de balanceamento de trabalho: "simple", "auto" e "false". A estratégia "simple" divide as tarefas recebidas igualmente entre os processos de trabalho.

```php
    'balance' => 'simple',
```

A estratégia "auto", que é o padrão no arquivo de configuração, ajusta o número de processos trabalhadores por fila com base na carga de trabalho atual da fila. Por exemplo, se a sua fila "notificações" tiver 1.000 trabalhos pendentes enquanto a sua fila "renderização" estiver vazia, o Horizon irá alocar mais trabalhadores para a sua fila "notificações" até que a fila esteja vazia.

Ao usar a estratégia 'auto', você pode definir as opções de configuração 'minProcesses' e 'maxProcesses' para controlar o número mínimo e máximo de processos do trabalhador que o horizonte deve escalar para cima ou para baixo:

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

O valor da configuração `autoScalingStrategy` determina se o Horizon atribuirá mais processos de trabalho às filas com base na quantidade total de tempo que levará para limpar a fila (Estratégia de Tempo) ou por conta do número total de trabalhos na fila (Estratégia de Tamanho).

Os valores de configuração `balanceMaxShift` e `balanceCooldown` determinam como o Horizon irá se dimensionar para atender à demanda do trabalhador. No exemplo acima, um máximo de um novo processo será criado ou destruído a cada três segundos. Você é livre para ajustar esses valores conforme necessário com base nas necessidades da sua aplicação.

Quando a opção 'balance' é definida como 'false', o comportamento padrão do Laravel será utilizado, no qual as filas serão processadas na ordem em que elas são listadas em sua configuração.

<a name="dashboard-authorization"></a>
### Autorização do Painel de Controle

O painel de controle do Horizon pode ser acessado via rota `/horizon`. Por padrão, você só poderá acessar este painel no ambiente `local`. No entanto, dentro do arquivo `app/Providers/HorizonServiceProvider.php`, há uma definição de [porta de autorização](/docs/authorization#gates). Esta porta autoriza o acesso ao Horizon em ambientes **não-locais**. Você pode modificar essa porta conforme necessário para restringir o acesso à sua instalação do Horizon:

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
#### Estratégias de Autenticação Alternativas

Lembre-se que o Laravel injeta automaticamente o usuário autenticado no fechamento do portão. Se o seu aplicativo estiver fornecendo segurança Horizon através de outro método, como restrições por IP, então os seus usuários Horizon podem não precisar "entrar". Portanto, você vai precisar mudar a assinatura da função `function  (User  $user)`: acima para `function  (User  $user  = null)` para forçar o Laravel a não exigir autenticação.

<a name="silenced-jobs"></a>
### O Silenciado do Trabalho

Às vezes você pode não estar interessado em ver determinados trabalhos enviados pelo seu aplicativo ou por pacotes de terceiros. Em vez de esses trabalhos tomarem espaço na sua lista de trabalhos concluídos, você pode silenciá-los. Para começar, adicione o nome da classe do trabalho à opção "silenciada" no arquivo de configuração "horizon" do seu aplicativo:

```php
    'silenced' => [
        App\Jobs\ProcessPodcast::class,
    ],
```

Alternativamente, o trabalho que você deseja silenciar pode implementar a interface `Laravel\Horizon\Contracts\Silenced`. Se um trabalho implementa esta interface, ele será automaticamente silenciada, mesmo se não estiver presente na matriz de configurações "silenciadas":

```php
    use Laravel\Horizon\Contracts\Silenced;

    class ProcessPodcast implements ShouldQueue, Silenced
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        // ...
    }
```

<a name="upgrading-horizon"></a>
## Upgrade Horizon

Ao atualizar para uma nova versão principal do Horizon, é importante revisar cuidadosamente [o guia de atualização](https://github.com/laravel/horizon/blob/master/UPGRADE.md).

<a name="running-horizon"></a>
## Horizonte de Corrida

Uma vez que você configurou seus supervisores e trabalhadores no arquivo de configuração do seu aplicativo em 'config/horizon.php', você pode iniciar o Horizon usando o comando Artisan 'horizon'. Este único comando iniciará todos os processos dos trabalhadores configurados para o ambiente atual.

```shell
php artisan horizon
```

Você pode pausar o processo do horizonte e instruí-lo a continuar processando trabalhos usando os comandos artisan `horizon:pause` e `horizon:continue`:

```shell
php artisan horizon:pause

php artisan horizon:continue
```

Você também pode pausar e continuar supervisores específicos do Horizontes usando os comandos Artisan `horizon:pause-supervisor` e `horizon:continue-supervisor`:

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

Você pode verificar o estado atual do processo Horizon usando o comando Artisan `horizon:status`:

```shell
php artisan horizon:status
```

Você pode graciosamente terminar o processo do horizonte usando o comando artisan 'horizon:terminate'. Quaisquer trabalhos que estão atualmente sendo processados por ele serão concluídos e então o horizonte irá parar de executar:

```shell
php artisan horizon:terminate
```

<a name="deploying-horizon"></a>
### Deslocando o Horizonte

Quando estiver pronto para implantar o Horizon no servidor real da sua aplicação, configure um monitor de processos para monitorar o comando `php artisan horizon` e reiniciá-lo caso ele encerre inesperadamente. Não se preocupe, vamos discutir como instalar um monitor de processos abaixo.

Durante o processo de implantação da sua aplicação, você deve instruir o processo de horizonte para terminar, para que ele seja reiniciado pelo seu monitor de processos e receber suas alterações de código:

```shell
php artisan horizon:terminate
```

<a name="installing-supervisor"></a>
#### Instalação do Supervisor

Supervisor é um monitor de processos para o sistema operacional Linux e irá reiniciar automaticamente seu processo `horizon` caso ele pare de executar. Para instalar o Supervisor no Ubuntu, você pode usar o seguinte comando. Se não estiver usando o Ubuntu, provavelmente pode instalar o Supervisor usando o gerenciador de pacotes do seu sistema operacional:

```shell
sudo apt-get install supervisor
```

> Nota!
> Se configurar o Supervisor por conta própria parece ser avassalador, considere usar [Laravel Forge](https://forge.laravel.com), que instalará e configurará automaticamente o Supervisor para seus projetos Laravel.

<a name="supervisor-configuration"></a>
#### Configuração do Supervisor

Arquivos de configuração do Supervisor são tipicamente armazenados dentro da pasta `/etc/supervisor/conf.d` do seu servidor. Dentro dessa pasta você pode criar um número arbitrário de arquivos de configuração que instruem o supervisor em como seus processos devem ser monitorados. Por exemplo, vamos criar um arquivo `horizon.conf` que inicia e monitora um processo `horizon`:

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

Ao definir sua configuração do Supervisor, você deve garantir que o valor de 'stopwaitsecs' é maior do que o número de segundos consumidos pelo seu trabalho mais longo em execução. Caso contrário, o Supervisor pode matar o trabalho antes de terminar a processar.

> [AVISO]
> Enquanto os exemplos acima são válidos para servidores baseados em Ubuntu, a localização e a extensão do arquivo esperados dos arquivos de configuração do Supervisor podem variar entre outros sistemas operacionais de servidor. Consulte sua documentação do servidor para mais informações.

<a name="starting-supervisor"></a>
#### Iniciante em supervisão

Uma vez que o arquivo de configuração tenha sido criado, você pode atualizar a configuração do Supervisor e iniciar os processos monitorados usando os seguintes comandos:

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

> Nota:
> Para mais informações sobre como executar o Supervisor, veja a [documentação do Supervisor](http://supervisord.org/index.html).

<a name="tags"></a>
## Tags

O horizonte permite que você atribua "tags" a trabalhos, incluindo eventos de correio, eventos de transmissão, notificações e ouvintes em fila. Na verdade, o Horizon marcará com inteligência e automaticamente a maioria dos trabalhos dependendo do Eloquent modelos anexados ao trabalho. Por exemplo, veja o seguinte trabalho:

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

Se este trabalho é fila com uma instância `App\Models\Video` que tem um atributo 'id' de '1', ele receberá automaticamente a tag 'App\Models\Video:1'. Isso porque o Horizon pesquisará as propriedades do trabalho para qualquer modelo Eloquent. Se modelos Eloquent forem encontrados, o Horizon marcará o trabalho com inteligência usando o nome da classe e a chave primária do modelo:

```php
    use App\Jobs\RenderVideo;
    use App\Models\Video;

    $video = Video::find(1);

    RenderVideo::dispatch($video);
```

<a name="manually-tagging-jobs"></a>
#### Marcando manualmente as tarefas

Se você gostaria de definir manualmente os rótulos para um dos seus objetos que são enfileiráveis, você pode definir um método 'tags' na classe:

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
#### Tag de ouvinte de eventos manualmente

Ao recuperar as tags para um ouvinte de eventos em fila, o Horizon irá automaticamente passar a instância do evento para o método "tags", permitindo que você adicione dados de eventos às tags.

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

> ¡ADVERTENCIA!
> Quando configurando o Horizon para enviar notificações do Slack ou SMS, você deve revisar os [requisitos pré-requisitos para o canal de notificação relevante]/docs/notificações.

Se você gostaria de ser notificado quando um de seus filas tem um tempo longo de espera, você pode usar o método 'Horizon::routeMailNotificationsTo', 'Horizon::routeSlackNotificationsTo', e 'Horizon::routeSmsNotificationsTo'. Você pode chamar esses métodos do método 'boot' de seu provedor 'App\Providers\HorizonServiceProvider':

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
#### Configurando os Limites de Tempo de Aguardo da Notificação

Você pode configurar quantos segundos são considerados um "tempo de espera" no seu arquivo de configuração do 'config/horizon.php' em sua aplicação. A opção de configuração "waits" neste arquivo permite que você controle o limite para um tempo de espera longo, para cada combinação de conexão/fila. Qualquer combinação não definida de conexão/fila será definida como um limite de tempo de espera de 60 segundos:

```php
    'waits' => [
        'redis:critical' => 30,
        'redis:default' => 60,
        'redis:batch' => 120,
    ],
```

<a name="metrics"></a>
## Metrês

O painel de métricas fornece informações sobre o seu trabalho e tempos de espera na fila e a taxa de saída. Para preencher este painel, você deve configurar o comando 'snapshot' do Artisan para ser executado toda vez que cinco minutos em seu arquivo 'routes/console.php':

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('horizon:snapshot')->everyFiveMinutes();
```
<a name="deleting-failed-jobs"></a>
## Excluindo Trabalhos Falhados

Se você deseja excluir um trabalho falho, pode usar o comando 'horizon:forget'. O comando 'horizon:forget' aceita como seu único argumento a ID ou UUID do trabalho falho.

```shell
php artisan horizon:forget 5
```

<a name="clearing-jobs-from-queues"></a>
## Limpeza de trabalhos nas filas

Se você gostaria de excluir todos os trabalhos da fila padrão do seu aplicativo, você pode fazer isso usando o comando artisan `horizon:clear`:

```shell
php artisan horizon:clear
```

Você pode fornecer a opção 'fila' para excluir trabalhos de uma fila específica:

```shell
php artisan horizon:clear --queue=emails
```
