# O Laravel Telescope

<a name="introduction"></a>
## Introdução

 [Laravel Telescope](https://github.com/laravel/telescope) é uma ferramenta maravilhosa para se ter em seu ambiente de desenvolvimento local do Laravel. O Telescope fornece informações sobre solicitações enviadas para o seu aplicativo, exceções, entradas de log, consultas aos bancos de dados, tarefas agendadas, e-mails, notificações, operações em cache, tarefas programadas e muito mais.

<img src="https://laravel.com/img/docs/telescope-example.png">

<a name="installation"></a>
## Instalação

 Você pode usar o gerenciador de pacotes do Composer para instalar o Telescope em seu projeto Laravel:

```shell
composer require laravel/telescope
```

 Depois de instalar o Telescope, publique seus ativos e migrações usando o comando Artisan `telescope:install`. Após a instalação do Telescope, você também deve executar o comando `migrate` para criar as tabelas necessárias para armazenar os dados do Telescope:

```shell
php artisan telescope:install

php artisan migrate
```

 Por último, é possível aceder ao painel do telescópio através da rota `/telescope`.

<a name="local-only-installation"></a>
### Instalação somente local

 Se você planeja usar apenas o Telescope para auxiliar seu desenvolvimento local, pode instalá-lo usando a opção `--dev`:

```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```

 Depois de executar o comando `telescope:install`, deve remover o registro do serviço "TelescopeServiceProvider" no arquivo de configuração da aplicação, `bootstrap/providers.php`. Registe manualmente os fornecedores do Telescope na função `register` da classe `App\Providers\AppServiceProvider`. Garantimos que o ambiente atual é "local" antes de registrar os fornecedores:

```php
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if ($this->app->environment('local')) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }
```

 Por último, você deve impedir que o pacote Telescope seja [automaticamente descoberto] (/docs/packages#package-discovery), adicionando o seguinte ao seu arquivo `composer.json`:

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "laravel/telescope"
        ]
    }
},
```

<a name="configuration"></a>
### Configuração

 Após publicar os recursos do Telescope, seu arquivo de configuração primário estará localizado em `config/telescope.php`. Esse arquivo de configuração permite que você configure suas [opções de vigia](#vigias-disponíveis). Cada opção de configuração inclui uma descrição do seu propósito, por isso certifique-se de explorar detalhadamente esse arquivo.

 Se desejar, você pode desativar completamente a coleta de dados do Telescope usando a opção de configuração "enabled" (Ativado):

```php
    'enabled' => env('TELESCOPE_ENABLED', true),
```

<a name="data-pruning"></a>
### Limpeza de Dados

 Sem a poda, a tabela `telescope_entries` pode acumular registos muito rapidamente. Para mitigar isto, deverá programar o comando Artisan `telescope:prune` diariamente:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('telescope:prune')->daily();
```

 Como padrão, todas as entradas com mais de 24 horas serão eliminadas. Você pode usar a opção `hours` ao chamar o comando para determinar por quanto tempo os dados do Telescope devem permanecer disponíveis. Por exemplo: o comando abaixo irá apagar todas as entradas criadas há mais de 48 horas atrás:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('telescope:prune --hours=48')->daily();
```

<a name="dashboard-authorization"></a>
### Autorização do painel de controle

 É possível acessar o painel do telescópio através da rota `/telescope`. Por padrão, você só poderá acessar esse painel no ambiente `local`. No arquivo `app/Providers/TelescopeServiceProvider.php`, há uma definição de um [portão de autorização](/docs/authorization#gates). Esse portão de autorização controla o acesso ao Telescópio em ambientes **não locais**. Você pode modificar esse portão conforme necessário para restringir o acesso à sua instalação do Telescópio:

```php
    use App\Models\User;

    /**
     * Register the Telescope gate.
     *
     * This gate determines who can access Telescope in non-local environments.
     */
    protected function gate(): void
    {
        Gate::define('viewTelescope', function (User $user) {
            return in_array($user->email, [
                'taylor@laravel.com',
            ]);
        });
    }
```

 > [AVISO]
 > Você deverá garantir que altere sua variável de ambiente `APP_ENV` para `production` em seu ambiente de produção. Caso contrário, a instalação do Telescope estará disponível publicamente.

<a name="upgrading-telescope"></a>
## Atualização do telescópio

 Ao fazer um upgrade para uma nova versão principal do Telescope, é importante que você releia cuidadosamente o [guia de upgrade](https://github.com/laravel/telescope/blob/master/UPGRADE.md).

 Além disso, quando atualizar para qualquer nova versão do Telescope, você deve republicar os ativos do Telescope.

```shell
php artisan telescope:publish
```

 Para manter os ativos atualizados e evitar problemas em futuras atualizações, você pode adicionar o comando `vendor:publish --tag=laravel-assets` aos scripts de `post-update-cmd` do arquivo `composer.json` da sua aplicação:

```json
{
    "scripts": {
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ]
    }
}
```

<a name="filtering"></a>
## Filtragem

<a name="filtering-entries"></a>
### Entradas

 Você pode filtrar os dados gravados pelo Telescope através da função `filter`, definida em sua classe `App\Providers\TelescopeServiceProvider`. Por padrão, essa função registra todos os dados no ambiente local e também registra exceções, tarefas que falharam, tarefas agendadas e dados com tags monitoradas em outros ambientes:

```php
    use Laravel\Telescope\IncomingEntry;
    use Laravel\Telescope\Telescope;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->hideSensitiveRequestDetails();

        Telescope::filter(function (IncomingEntry $entry) {
            if ($this->app->environment('local')) {
                return true;
            }

            return $entry->isReportableException() ||
                $entry->isFailedJob() ||
                $entry->isScheduledTask() ||
                $entry->isSlowQuery() ||
                $entry->hasMonitoredTag();
        });
    }
```

<a name="filtering-batches"></a>
### Lotes

 Ao passo que o fecho `filter` filtra os dados para entradas individuais, é possível utilizar o método `filterBatch` para registrar um fecho de script que filtre todos os dados relacionados com uma determinada solicitação ou comando do console. Se o fecho retornar `true`, todas as entradas serão gravadas pelo Telescope:

```php
    use Illuminate\Support\Collection;
    use Laravel\Telescope\IncomingEntry;
    use Laravel\Telescope\Telescope;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->hideSensitiveRequestDetails();

        Telescope::filterBatch(function (Collection $entries) {
            if ($this->app->environment('local')) {
                return true;
            }

            return $entries->contains(function (IncomingEntry $entry) {
                return $entry->isReportableException() ||
                    $entry->isFailedJob() ||
                    $entry->isScheduledTask() ||
                    $entry->isSlowQuery() ||
                    $entry->hasMonitoredTag();
                });
        });
    }
```

<a name="tagging"></a>
## Marcação

 O telescópio permite pesquisar entradas por "etiqueta". Muitas vezes as etiquetas são nomes de classes do modelo Eloquent ou IDs de usuários autenticados, que o telescópio adiciona automaticamente às entradas. Ocasionalmente, pode ser necessário associar suas próprias etiquetas personalizadas a uma entrada. Para fazer isso, você deve usar o método `Telescope::tag`. O método `tag` aceita um closure que deverá retornar uma matriz de etiquetas. As etiquetas retornadas pelo closure serão mescladas com quaisquer etiquetas automaticamente adicionadas ao registro pelo telescópio. Normalmente, você deve chamar o método `tag` dentro da ordem de serviços do seu serviço `App\Providers\TelescopeServiceProvider`:

```php
    use Laravel\Telescope\IncomingEntry;
    use Laravel\Telescope\Telescope;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->hideSensitiveRequestDetails();

        Telescope::tag(function (IncomingEntry $entry) {
            return $entry->type === 'request'
                        ? ['status:'.$entry->content['response_status']]
                        : [];
        });
     }
```

<a name="available-watchers"></a>
## Assistentes disponíveis

 O telescópio recolhe dados de aplicação quando é executado um comando ou pedido de console. Pode personalizar a lista dos observadores que gostaria de ativar na sua configuração `config/telescope.php`:

```php
    'watchers' => [
        Watchers\CacheWatcher::class => true,
        Watchers\CommandWatcher::class => true,
        ...
    ],
```

 Alguns assistentes também permitem fornecer opções de personalização adicionais:

```php
    'watchers' => [
        Watchers\QueryWatcher::class => [
            'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
            'slow' => 100,
        ],
        ...
    ],
```

<a name="batch-watcher"></a>
### Batch Watcher

 O monitor de lote registra informações sobre os lotes aguardando execução (veja Lotes (/docs/queues#job-batching)), incluindo as informações de conexão e o nome do trabalho.

<a name="cache-watcher"></a>
### O assistente de cache

 O assistente de cache regista os dados quando uma chave do cache é atingida, perdida, actualizada e esquecida.

<a name="command-watcher"></a>
### O Comando Vigia

 O watcher do comando registra os argumentos, opções, código de saída e output sempre que um comando Artisan é executado. Se você deseja excluir determinados comandos da gravação pelo watcher, poderá especificar o comando na opção `ignore` dentro do arquivo `config/telescope.php`:

```php
    'watchers' => [
        Watchers\CommandWatcher::class => [
            'enabled' => env('TELESCOPE_COMMAND_WATCHER', true),
            'ignore' => ['key:generate'],
        ],
        ...
    ],
```

<a name="dump-watcher"></a>
### O "Dump Watcher" é um utilitário que permite-lhe verificar se existem arquivos temporários no seu computador.

 O monitor de dados registra e exibe os dados das variáveis em Telescope. No caso do Laravel, é possível utilizar a função global `dump` para exibir as variáveis. É necessário que o navegador tenha aberto a guia do monitor de dados para que as dumps sejam registradas; caso contrário, os dumps não serão gravados pelo monitor.

<a name="event-watcher"></a>
### O Observador de eventos

 O observador de eventos registra a carga útil, os participantes e os dados de transmissão dos eventos [de sua aplicação](/docs/events). Os eventos internos do Laravel não são considerados pelo Observador de Eventos.

<a name="exception-watcher"></a>
### O Observador de Exceções

 O monitor de exceções regista os dados e o trajeto de chamada para as exceções que poderão ser relatadas pelo seu aplicativo.

<a name="gate-watcher"></a>
### Vigia de Portão

 O gate watcher regista os dados e o resultado das verificações de [portas e políticas](/docs/authorization) da sua aplicação. Se pretender excluir certas capacidades do registro pelo watcher, pode especificar essas capacidades na opção `ignore_abilities` no seu ficheiro `config/telescope.php`:

```php
    'watchers' => [
        Watchers\GateWatcher::class => [
            'enabled' => env('TELESCOPE_GATE_WATCHER', true),
            'ignore_abilities' => ['viewNova'],
        ],
        ...
    ],
```

<a name="http-client-watcher"></a>
### Observador de clientes HTTP

 O observador de cliente HTTP regista as requisições [de um cliente HTTP] enviadas por sua aplicação.

<a name="job-watcher"></a>
### O observador de empregos

 O assistente de tarefas regista os dados e o estado de todas as [tarefas](/docs/queues) enviadas pela sua aplicação.

<a name="log-watcher"></a>
### Assistente de registro

 O espião de log registra os dados de [logs](/docs/logging) de quaisquer logs gerados pelo seu aplicativo.

 Por padrão, o telescópio grava apenas registos ao nível "error" (erro) e superiores. No entanto, pode alterar a opção `level` no ficheiro de configuração do aplicativo `config/telescope.php` para modificar este comportamento:

```php
    'watchers' => [
        Watchers\LogWatcher::class => [
            'enabled' => env('TELESCOPE_LOG_WATCHER', true),
            'level' => 'debug',
        ],

        // ...
    ],
```

<a name="mail-watcher"></a>
### Assistente de correio eletrónico

 O assistente de e-mail permite visualizar uma pré-visualização no navegador dos e-mails enviados pela sua aplicação, bem como os dados associados a estes. Pode também descarregar o e-mail num arquivo .eml

<a name="model-watcher"></a>
### O Assistente de Modelo

 O observador de modelo regista alterações no modelo sempre que um evento de modelo Eloquent (/docs/eloquent#events) for disparado. Pode especificar quais os eventos do modelo que devem ser registrados através da opção `events` do observador:

```php
    'watchers' => [
        Watchers\ModelWatcher::class => [
            'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
            'events' => ['eloquent.created*', 'eloquent.updated*'],
        ],
        ...
    ],
```

 Caso você deseje registrar o número de modelos hidratados durante um determinado pedido, ative a opção "hidratações":

```php
    'watchers' => [
        Watchers\ModelWatcher::class => [
            'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
            'events' => ['eloquent.created*', 'eloquent.updated*'],
            'hydrations' => true,
        ],
        ...
    ],
```

<a name="notification-watcher"></a>
### Notificador

 O monitor de notificações grava todas as [notificações](/docs/notifications) enviadas pela aplicação. Se a notificação acionar um correio eletrónico e o monitor de e-mail estiver ativado, também estará disponível para visualização em antecipação no ecrã do monitor de e-mail.

<a name="query-watcher"></a>
### O Observer de consulta

 O consultor de consultas regista a versão original do SQL, os valores de ligação e o tempo de execução para todas as consultas executadas na aplicação. Além disso, qualquer consulta mais lenta que 100 milésimas de segundo é etiquetada como "lenta". Pode personalizar o limiar de consultas lentas através da opção `slow` do consultor:

```php
    'watchers' => [
        Watchers\QueryWatcher::class => [
            'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
            'slow' => 50,
        ],
        ...
    ],
```

<a name="redis-watcher"></a>
### O assistente do Redis

 O assistente do Redis registra todos os comandos do Redis executados por seu aplicativo. Se você estiver usando o Redis para armazenar dados em cache, os comandos de cache também serão registrados pelo assistente do Redis.

<a name="request-watcher"></a>
### O Observador de Pedidos

 O assistente de solicitação regista os dados da solicitação, cabeçalhos, sessão e resposta associada a todas as solicitações tratadas pela aplicação. É possível limitar os dados da resposta registados através da opção `size_limit` (em quilobytes):

```php
    'watchers' => [
        Watchers\RequestWatcher::class => [
            'enabled' => env('TELESCOPE_REQUEST_WATCHER', true),
            'size_limit' => env('TELESCOPE_RESPONSE_SIZE_LIMIT', 64),
        ],
        ...
    ],
```

<a name="schedule-watcher"></a>
### O assistente de programação

 O assistente de agendamento regista o comando e a saída de todas as tarefas programadas executadas pela aplicação.

<a name="view-watcher"></a>
### Assistente de visualização

 O visualizador de views registra o nome da sua view, o caminho, os dados e os "composers" utilizados na renderização das views.

<a name="displaying-user-avatars"></a>
## Exibição de avatares de usuário

 O painel do Telescope exibe o avatar de usuário para o usuário que foi autenticado quando uma determinada entrada foi salva. Por padrão, o Telescope recupera os avatares usando o serviço web Gravatar. No entanto, você pode personalizar a URL do avatar registrando um callback em sua `App\Providers\TelescopeServiceProvider` classe. O callback receberá o ID e o endereço de email do usuário e deve retornar a URL da imagem do avatar do usuário:

```php
    use App\Models\User;
    use Laravel\Telescope\Telescope;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...

        Telescope::avatar(function (string $id, string $email) {
            return '/avatars/'.User::find($id)->avatar_path;
        });
    }
```
