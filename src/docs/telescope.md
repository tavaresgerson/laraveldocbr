# Laravel Telescope

<a name="introduction"></a>
## Introdução

[Laravel Telescope](https://github.com/laravel/telescope) é uma maravilhosa companhia para o seu ambiente de desenvolvimento Laravel local. O Telescópio fornece informações sobre as solicitações que entram na sua aplicação, exceções, entradas de log, consultas de banco de dados, trabalhos em fila, correio, notificações, operações de cache, tarefas agendadas, despejos de variáveis e muito mais.

<img src="https://laravel.com/img/docs/telescope-example.png">

<a name="installation"></a>
## Instalação

Você pode usar o gerenciador de pacotes do composer para instalar o telescope em seu projeto Laravel:

```shell
composer require laravel/telescope
```

Após instalar o Telescope, publique seus ativos e migrações usando o comando 'telescope:install' do Artisan. Após instalar o Telescope, você também deve executar o comando 'migrate' para criar as tabelas necessárias para armazenar os dados do Telescope.

```shell
php artisan telescope:install

php artisan migrate
```

Finalmente você pode acessar o painel do Telescópio através da rota `/telescope`.

<a name="local-only-installation"></a>
### Instalação Local Só

Se planeja usar o Telescope apenas para ajudar seu desenvolvimento local, você pode instalar o Telescope usando a flag `--dev`:

```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```

Depois de executar o comando 'telescope:install', você deve remover a linha da configuração do provedor de serviços Telescoop na seção "bootstrap/providers.php" do seu arquivo de configuração da aplicação. Em vez disso, registre manualmente os provedores de serviço Telescópio no método "register" da classe "App\Providers\AppServiceProvider". Nós garantiremos que o ambiente atual é 'local' antes de registrar os provedores:

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

Por fim, você também deve evitar que o pacote Telescope seja descoberto automaticamente por [auto-descobrimento de pacotes](doc/packages#package-discovery) adicionando isto ao seu arquivo composer.json:

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

Depois de publicar os ativos do Telescópio, o arquivo de configuração principal será localizado em `config/telescope.php`. Este arquivo de configuração permite configurar suas [opções de observador](#watchers-disponíveis). Cada opção de configuração inclui uma descrição de seu propósito, então tenha certeza de explorar bem este arquivo.

Se desejado, você pode desativar a coleta de dados do Telescópio completamente usando a opção de configuração "habilitado":

```php
    'enabled' => env('TELESCOPE_ENABLED', true),
```

<a name="data-pruning"></a>
### Poda de dados

Sem poda, a tabela "telescope_entries" pode acumular registros muito rapidamente. Para mitigar isto, você deve agendar o comando 'telescope:prune' do Artisan para ser executado diariamente.

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('telescope:prune')->daily();
```

Por padrão, todos os registros mais antigos que 24 horas serão cortados. Você pode usar a opção 'horas' ao chamar o comando para determinar quanto tempo manter dados do Telescópio. Por exemplo, o seguinte comando irá apagar todos os registros criados há mais de 48 horas:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('telescope:prune --hours=48')->daily();
```

<a name="dashboard-authorization"></a>
### Autorização de painel

O painel do Telescópio pode ser acessado através da rota `/telescope`. Por padrão, você só será capaz de acessar este painel na `ambiente local`. Dentro do seu arquivo `app/Providers/TelescopeServiceProvider.php` há uma definição de [porta de autorização](/docs/authorization#gates). Essa porta autoriza o acesso ao Telescópio em **ambientes não locais**. Você é livre para modificar essa porta conforme necessário para restringir o acesso à sua instalação do Telescópio:

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

> [ALERTA!]
> Você deve assegurar-se de que altere sua variável de ambiente `APP_ENV` a `production` em seu ambiente de produção. Caso contrário, sua instalação do Telescope será publicamente acessível.

<a name="upgrading-telescope"></a>
## Aumentar telescópio

Ao atualizar para uma nova versão principal do Telescópio, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/telescope/blob/master/UPGRADE.md).

Além disso, ao atualizar para qualquer versão do Telescópio nova, você deve re-publicar os recursos do Telescópio:

```shell
php artisan telescope:publish
```

Para manter os ativos atualizados e evitar problemas com futuras atualizações, você pode adicionar o comando `vendor:publish --tag=laravel-assets` aos scripts `post-update-cmd` no arquivo `composer.json` da sua aplicação:

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
## Filtrando

<a name="filtering-entries"></a>
### Entradas

Você pode filtrar os dados que é gravada pelo Telescópio via o `filtro` fechamento que é definido em sua classe `App\Providers\TelescopeServiceProvider`. Por padrão, este fechamento registra todos os dados no ambiente `local` e exceções, trabalhos com falha, tarefas programadas, e dados com tags monitorados em todos os outros ambientes:

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
### Batches

Enquanto o 'filter' closure filtra dados para entradas individuais, você pode usar o método 'filterBatch' para registrar um closure que filtra todos os dados para uma solicitação ou comando de console específico. Se o closure retornar 'true', todas as entradas serão registradas pelo Telescópio:

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
## Etiquetagem

O telescópio permite que você procure entradas por "tags". Muitas vezes as tags são nomes de classes Eloquent ou IDs do usuário autenticados que o Telescópio automaticamente anexa às entradas. Ocasionalmente, você pode querer anexar suas próprias tags personalizadas a entradas. Para fazer isso, você pode usar o método `Telescope::tag`. O método `tag` aceita uma função que deve retornar um array de tags. As tags retornadas pela função serão mescladas com as tags que o Telescópio anexaria automaticamente à entrada. Normalmente, você chama o método `tag` dentro do método `register` da sua classe `App\Providers\TelescopeServiceProvider`:

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

Telescópio "observadores" coletam dados de aplicativos quando um pedido ou comando do console é executado. Você pode personalizar a lista de espectadores que você gostaria de ativar dentro do seu arquivo de configuração "config/telescope.php":

```php
    'watchers' => [
        Watchers\CacheWatcher::class => true,
        Watchers\CommandWatcher::class => true,
        ...
    ],
```

Alguns espectadores também permitem que você forneça opções de personalização adicionais:

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

O watchman registra informações sobre os lotes em fila, incluindo as informações de trabalho e conexão.

<a name="cache-watcher"></a>
### CacheWatcher

O Cache Watcher registra dados quando um cache de chave é atingido, perdido, atualizado e esquecido.

<a name="command-watcher"></a>
### Comando Observador

O comando watch registra argumentos, opções, código de saída e a saída sempre que um Artisan é executado. Se você gostaria de excluir certos comandos de serem registrados pelo watch, você pode especificar o comando na opção 'ignore' dentro do seu arquivo 'config/telescope.php':

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
### Olhador de Entulho

O watch da lixeira registra e exibe seus arquivos de variáveis no Telescope. Ao usar o Laravel, as variáveis podem ser registradas usando a função 'dump' global. A aba do Watch deve estar aberta em um navegador para que as lixeiras sejam registradas; caso contrário, o Watch ignorará os arquivos.

<a name="event-watcher"></a>
### Assistente de Eventos

O Event watcher registra os eventos, as informações de retorno e os dados de transmissão para qualquer [eventos](/docs/events) enviados pelo seu aplicativo. Os eventos internos do Laravel são ignorados pelo Event watcher.

<a name="exception-watcher"></a>
### Monitor de Exceção

O Exception Watch registra os dados e rastreamentos de pilha para qualquer exceção que é lançada pela aplicação.

<a name="gate-watcher"></a>
### Guarda da Porta

O observador de portões registra os dados e resultado das [verificações de portão e política](/docs/autorização) por seu aplicativo. Se você gostaria de excluir certas habilidades de serem registradas pelo observador, você pode especificar essas habilidades na opção 'ignore_abilities' em seu arquivo 'config/telescope.php':

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
### HTTP Cliente Vigilante

O HTTP Client Watcher registra as requisições do [HTTP client]('https://docs.cask.io/http/http-client') feitas pelo seu aplicativo.

<a name="job-watcher"></a>
### Acompanhante de emprego

O Job Watch registra os dados e o estado de qualquer [emprego]/[trabalho] enviado por seu aplicativo.

<a name="log-watcher"></a>
### Log Watcher

O Log Watch registra os dados de [logs]/docs/logging para todos os logs escritos por sua aplicação.

Por padrão, o Telescópio irá registrar apenas os logs no nível 'erro' e acima, mas você pode modificar a opção 'nível' em seu arquivo de configuração do Telescópio (config/telescope.php) para alterar esse comportamento.

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
### MailWatcher

O Mail Watcher permite que você veja um pré-visualização de emails enviados por sua aplicação, junto com os dados associados. Você também pode baixar o email como um arquivo .eml.

<a name="model-watcher"></a>
### Assistir a modelos

O model watcher registra a mudança de modelo sempre que um evento [do modelo] Eloquent é enviado. Você pode especificar quais eventos do modelo devem ser registrados através da opção 'eventos' do observador:

```php
    'watchers' => [
        Watchers\ModelWatcher::class => [
            'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
            'events' => ['eloquent.created*', 'eloquent.updated*'],
        ],
        ...
    ],
```

Se você gostaria de registrar o número de modelos hidratados durante um pedido específico, habilite a opção 'hidrações':

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

O monitor de notificações registra todas as [notificações](/docs/notificações) enviadas por seu aplicativo. Se a notificação acionar um e-mail e você tiver o monitor de correio ativado, o e-mail também estará disponível para visualização na tela do monitor de correio.

<a name="query-watcher"></a>
### Query Watcher

O Query Watcher registra o SQL original, os vinculação e o tempo de execução para todas as consultas executadas pelo seu aplicativo. O Query Watcher também marca qualquer consulta mais lenta que 100 milissegundos como "lenta". Você pode personalizar o limite de consulta lenta usando a opção "lenta" do QueryWatcher:

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
### Redis Watcher em Português.

O Redis Watch registra todos os comandos [Redis]/docs/redis] executados pelo seu aplicativo. Se você estiver usando o Redis para cacheamento, os comandos de cache também serão registrados pelo Redis Watch.

<a name="request-watcher"></a>
### Solicitação de observador

O Request Watcher registra a requisição, os cabeçalhos, a sessão e os dados da resposta associados a qualquer requisição tratada pelo aplicativo. Você pode limitar seus dados registrados de resposta através da opção "size_limit" (em quilobytes):

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
### Agendador de Horários

O cronograma de verificação registra o comando e a saída de qualquer [tarefas agendadas]/docs/agendar tarefas executar por sua aplicação.

<a name="view-watcher"></a>
### Visualizador de dados

O WatchView registra o nome [view]/docs/views], caminho, dados e “composers” usados ao renderizar a visão.

<a name="displaying-user-avatars"></a>
## Mostrando Usuário de Avatar

O painel do Telescópio exibe o avatar do usuário para o usuário que foi autenticado quando uma entrada específica foi salva. Por padrão, o Telescópio irá buscar os avatares usando o serviço web Gravatar. No entanto, você pode personalizar a URL do avatar registrando um retorno de chamada na sua classe 'App\Providers\TelescopeServiceProvider'. O retorno de chamada receberá a ID e o endereço de email do usuário e deverá retornar a URL da imagem do avatar do usuário:

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
