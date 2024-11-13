# Laravel Telescope

<a name="introduction"></a>
## Introdução

[Laravel Telescope](https://github.com/laravel/telescope) é um companheiro maravilhoso para seu ambiente de desenvolvimento Laravel local. O Telescope fornece insights sobre as solicitações que chegam ao seu aplicativo, exceções, entradas de log, consultas de banco de dados, trabalhos enfileirados, e-mail, notificações, operações de cache, tarefas agendadas, dumps de variáveis ​​e muito mais.

<img src="/docs/assets/telescope-example.png">

<a name="installation"></a>
## Instalação

Você pode usar o gerenciador de pacotes Composer para instalar o Telescope em seu projeto Laravel:

```shell
composer require laravel/telescope
```

Após instalar o Telescope, publique seus ativos e migrações usando o comando Artisan `telescope:install`. Após instalar o Telescope, você também deve executar o comando `migrate` para criar as tabelas necessárias para armazenar os dados do Telescope:

```shell
php artisan telescope:install

php artisan migrate
```

Finalmente, você pode acessar o painel do Telescope pela rota `/telescope`.

<a name="local-only-installation"></a>
### Instalação somente local

Se você planeja usar o Telescope apenas para auxiliar seu desenvolvimento local, você pode instalar o Telescope usando o sinalizador `--dev`:

```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```

Após executar `telescope:install`, você deve remover o registro do provedor de serviços `TelescopeServiceProvider` do arquivo de configuração `bootstrap/providers.php` do seu aplicativo. Em vez disso, registre manualmente os provedores de serviços do Telescope no método `register` da sua classe `App\Providers\AppServiceProvider`. Garantiremos que o ambiente atual seja `local` antes de registrar os provedores:

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

Finalmente, você também deve evitar que o pacote Telescope seja [descoberto automaticamente](/docs/packages#package-discovery) adicionando o seguinte ao seu arquivo `composer.json`:

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

Após publicar os ativos do Telescope, seu arquivo de configuração principal estará localizado em `config/telescope.php`. Este arquivo de configuração permite que você configure suas [opções do observador](#available-watchers). Cada opção de configuração inclui uma descrição de sua finalidade, portanto, certifique-se de explorar completamente este arquivo.

Se desejar, você pode desabilitar a coleta de dados do Telescope completamente usando a opção de configuração `enabled`:

```php
    'enabled' => env('TELESCOPE_ENABLED', true),
```

<a name="data-pruning"></a>
### Poda de Dados

Sem poda, a tabela `telescope_entries` pode acumular registros muito rapidamente. Para atenuar isso, você deve [programar](/docs/scheduling) o comando Artisan `telescope:prune` para ser executado diariamente:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('telescope:prune')->daily();
```

Por padrão, todas as entradas com mais de 24 horas serão podadas. Você pode usar a opção `hours` ao chamar o comando para determinar por quanto tempo reter os dados do Telescope. Por exemplo, o comando a seguir excluirá todos os registros criados há mais de 48 horas:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('telescope:prune --hours=48')->daily();
```

<a name="dashboard-authorization"></a>
### Autorização do painel

O painel do Telescope pode ser acessado pela rota `/telescope`. Por padrão, você só poderá acessar este painel no ambiente `local`. Dentro do seu arquivo `app/Providers/TelescopeServiceProvider.php`, há uma definição de [portão de autorização](/docs/authorization#gates). Este portão de autorização controla o acesso ao Telescope em ambientes **não locais**. Você tem a liberdade de modificar este portão conforme necessário para restringir o acesso à sua instalação do Telescope:

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

> [!AVISO]
> Você deve garantir que altere sua variável de ambiente `APP_ENV` para `production` em seu ambiente de produção. Caso contrário, sua instalação do Telescope estará disponível publicamente.

<a name="upgrading-telescope"></a>
## Atualizando o Telescope

Ao atualizar para uma nova versão principal do Telescope, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/telescope/blob/master/UPGRADE.md).

Além disso, ao atualizar para qualquer nova versão do Telescope, você deve republicar os ativos do Telescope:

```shell
php artisan telescope:publish
```

Para manter os ativos atualizados e evitar problemas em atualizações futuras, você pode adicionar o comando `vendor:publish --tag=laravel-assets` aos scripts `post-update-cmd` no arquivo `composer.json` do seu aplicativo:

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

Você pode filtrar os dados registrados pelo Telescope por meio do fechamento `filter` definido na sua classe `App\Providers\TelescopeServiceProvider`. Por padrão, esse fechamento registra todos os dados no ambiente `local` e exceções, trabalhos com falha, tarefas agendadas e dados com tags monitoradas em todos os outros ambientes:

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

Enquanto o fechamento `filter` filtra dados para entradas individuais, você pode usar o método `filterBatch` para registrar um fechamento que filtra todos os dados para uma determinada solicitação ou comando de console. Se o fechamento retornar `true`, todas as entradas serão registradas pelo Telescope:

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

O Telescope permite que você pesquise entradas por "tag". Frequentemente, as tags são nomes de classe de modelo Eloquent ou IDs de usuário autenticados que o Telescope adiciona automaticamente às entradas. Ocasionalmente, você pode querer anexar suas próprias tags personalizadas às entradas. Para fazer isso, você pode usar o método `Telescope::tag`. O método `tag` aceita um fechamento que deve retornar uma matriz de tags. As tags retornadas pelo fechamento serão mescladas com quaisquer tags que o Telescope anexaria automaticamente à entrada. Normalmente, você deve chamar o método `tag` dentro do método `register` da sua classe `App\Providers\TelescopeServiceProvider`:

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
## Observadores disponíveis

Os "observadores" do Telescope coletam dados do aplicativo quando uma solicitação ou comando do console é executado. Você pode personalizar a lista de observadores que gostaria de habilitar dentro do seu arquivo de configuração `config/telescope.php`:

```php
    'watchers' => [
        Watchers\CacheWatcher::class => true,
        Watchers\CommandWatcher::class => true,
        ...
    ],
```

Alguns observadores também permitem que você forneça opções de personalização adicionais:

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
### Observador de lote

O observador de lote registra informações sobre [lotes](/docs/queues#job-batching) enfileirados, incluindo informações de trabalho e conexão.

<a name="cache-watcher"></a>
### Observador de cache

O observador de cache registra dados quando uma chave de cache é atingida, perdida, atualizada e esquecida.

<a name="command-watcher"></a>
### Observador de comando

O observador de comando registra os argumentos, opções, código de saída e saída sempre que um comando Artisan é executado. Se você quiser excluir certos comandos de serem gravados pelo observador, você pode especificar o comando na opção `ignore` dentro do seu arquivo `config/telescope.php`:

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
### Dump Watcher

O dump watcher registra e exibe seus dumps de variáveis ​​no Telescope. Ao usar o Laravel, as variáveis ​​podem ser despejadas usando a função global `dump`. A aba dump watcher deve estar aberta em um navegador para que o dump seja registrado, caso contrário, os dumps serão ignorados pelo watcher.

<a name="event-watcher"></a>
### Event Watcher

O event watcher registra a carga útil, os ouvintes e os dados de transmissão para quaisquer [eventos](/docs/events) despachados pelo seu aplicativo. Os eventos internos do framework Laravel são ignorados pelo Event watcher.

<a name="exception-watcher"></a>
### Exception Watcher

O exception watcher registra os dados e o rastreamento de pilha para quaisquer exceções reportáveis ​​que são lançadas pelo seu aplicativo.

<a name="gate-watcher"></a>
### Gate Watcher

O gate watcher registra os dados e o resultado das verificações de [gate e política](/docs/authorization) pelo seu aplicativo. Se você quiser excluir certas habilidades de serem registradas pelo watcher, você pode especificá-las na opção `ignore_abilities` no seu arquivo `config/telescope.php`:

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
### HTTP Client Watcher

O HTTP client watcher registra [solicitações de cliente HTTP](/docs/http-client) de saída feitas pelo seu aplicativo.

<a name="job-watcher"></a>
### Job Watcher

O job watcher registra os dados e o status de quaisquer [jobs](/docs/queues) despachados pelo seu aplicativo.

<a name="log-watcher"></a>
### Observador de log

O observador de log registra os [dados de log](/docs/logging) para quaisquer logs escritos pelo seu aplicativo.

Por padrão, o Telescope registrará apenas logs no nível `error` e acima. No entanto, você pode modificar a opção `level` no arquivo de configuração `config/telescope.php` do seu aplicativo para modificar esse comportamento:

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
### Observador de e-mail

O observador de e-mail permite que você visualize uma prévia no navegador de [e-mails](/docs/mail) enviados pelo seu aplicativo junto com seus dados associados. Você também pode baixar o e-mail como um arquivo `.eml`.

<a name="model-watcher"></a>
### Observador de modelo

O observador de modelo registra as alterações do modelo sempre que um [evento de modelo](/docs/eloquent#events) do Eloquent é despachado. Você pode especificar quais eventos de modelo devem ser registrados por meio da opção `events` do observador:

```php
    'watchers' => [
        Watchers\ModelWatcher::class => [
            'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
            'events' => ['eloquent.created*', 'eloquent.updated*'],
        ],
        ...
    ],
```

Se você quiser registrar o número de modelos hidratados durante uma determinada solicitação, habilite a opção `hydrations`:

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
### Observador de notificação

O observador de notificação registra todas as [notificações](/docs/notifications) enviadas pelo seu aplicativo. Se a notificação disparar um e-mail e você tiver o observador de e-mail habilitado, o e-mail também estará disponível para visualização na tela do observador de e-mail.

<a name="query-watcher"></a>
### Observador de consultas

O observador de consultas registra o SQL bruto, as vinculações e o tempo de execução para todas as consultas executadas pelo seu aplicativo. O observador também marca todas as consultas mais lentas do que 100 milissegundos como `lentas`. Você pode personalizar o limite de consultas lentas usando a opção `lentas` do observador:

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
### Observador do Redis

O observador do Redis registra todos os comandos [Redis](/docs/redis) executados pelo seu aplicativo. Se você estiver usando o Redis para cache, os comandos de cache também serão registrados pelo observador do Redis.

<a name="request-watcher"></a>
### Request Watcher

O request watcher registra os dados de solicitação, cabeçalhos, sessão e resposta associados a quaisquer solicitações manipuladas pelo aplicativo. Você pode limitar seus dados de resposta registrados por meio da opção `size_limit` (em quilobytes):

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
### Schedule Watcher

O schedule watcher registra o comando e a saída de quaisquer [tarefas agendadas](/docs/scheduling) executadas pelo seu aplicativo.

<a name="view-watcher"></a>
### View Watcher

O view watcher registra o nome da [view](/docs/views), caminho, dados e "compositores" usados ​​ao renderizar as views.

<a name="displaying-user-avatars"></a>
## Exibindo Avatares do Usuário

O painel do Telescope exibe o avatar do usuário que foi autenticado quando uma determinada entrada foi salva. Por padrão, o Telescope recuperará avatares usando o serviço web Gravatar. No entanto, você pode personalizar a URL do avatar registrando um retorno de chamada na sua classe `App\Providers\TelescopeServiceProvider`. O retorno de chamada receberá o ID e o endereço de e-mail do usuário e deve retornar a URL da imagem do avatar do usuário:

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
