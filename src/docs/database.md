# Banco de dados: Princípios iniciais

<a name="introduction"></a>
## Introdução

 Quase todas as aplicações web modernas interagem com base de dados. O Laravel torna extremamente fácil a interação com várias bases de dados através do SQL bruto, um [construtor de consulta fluido](/docs/{{version}}/queries), e o [ORM Eloquent](/docs/{{version}}/eloquent). Atualmente, o Laravel fornece suporte interno para cinco bases de dados:

<div class="content-list" markdown="1">

 [Política de versão (https://mariadb.org/about/#maintenance-policy)](
 [Política de versões](https://pt.wikipedia.org/wiki/MySQL#Histórico_de_lançamentos)
 [Política de versões (en)](https://www.postgresql.org/support/versioning/)
 - SQLite 3.35.0+
 [Política de Versões](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server)

</div>

<a name="configuration"></a>
### Configuração

 A configuração dos serviços de base de dados do Laravel está localizada no arquivo de configuração `config/database.php` da aplicação. Neste arquivo, você poderá definir todas as conexões com a base de dados e especificar qual ligação será usada por padrão. A maioria das opções de configuração nesse arquivo são direcionadas pelos valores das variáveis de ambiente da aplicação. Exemplos para a maioria dos sistemas de banco de dados suportados pelo Laravel estão disponíveis neste arquivo.

 Por padrão, a configuração de ambiente [de amostra do Laravel](/docs/{{version}}/configuration#environment-configuration) está pronta para uso com o [Laravel Sail] (/docs/{{version}}/sail), que é uma configuração do Docker para desenvolvimento de aplicações Laravel na máquina local. No entanto, você pode modificar a configuração de banco de dados conforme necessário para o seu banco de dados local.

<a name="sqlite-configuration"></a>
#### Configuração do SQLite

 As bases de dados SQLite estão contidas num único ficheiro no seu sistema de arquivos. Pode criar uma nova base de dados SQLite utilizando o comando `touch` no terminal: `touch database/database.sqlite`. Depois de ter criado a base de dados, pode facilmente configurar as variáveis ambiente para apontarem para esta base de dados colocando o caminho absoluto da mesma na variável de ambiente `DB_DATABASE`:

```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

 Por padrão, as restrições de chave estrangeira são habilitadas para conexões SQLite. Se pretender desativá-las, deve definir a variável ambiental `DB_FOREIGN_KEYS` como `false`:

```ini
DB_FOREIGN_KEYS=false
```

 > [!ATENÇÃO]
 Crie uma aplicação Laravel utilizando o Instalador do Laravel ({{version}}) e selecione SQLite como banco de dados. O Laravel irá criar automaticamente um ficheiro `database/database.sqlite` e executará o modelo por defeito.

<a name="mssql-configuration"></a>
#### Configuração do Microsoft SQL Server

 Para usar um banco de dados Microsoft SQL Server, você precisa garantir que o pacote de extensões PHP "sqlsrv" e "pdo_sqlsrv", bem como qualquer dependência necessária, foram instaladas, como por exemplo, o driver ODBC do Microsoft SQL.

<a name="configuration-using-urls"></a>
#### Configuração utilizando URLs

 Normalmente, as conexões de banco de dados são configuradas utilizando vários valores de configuração, como `host`, `database`, `username` e `password`. Cada um destes valores tem a sua própria variável do ambiente correspondente. Isto significa que ao configurar as informações da ligação de banco de dados num servidor de produção é necessário gerir várias variáveis do ambiente.

 Alguns provedores de bases de dados gerenciadas, como o AWS e o Heroku, disponibilizam uma "URL" do banco de dados única que inclui todas as informações de conexão para o banco de dados numa única string. A URL do exemplo é semelhante à seguinte:

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

 Estes endereços URL seguem tipicamente uma convenção padrão:

```html
driver://username:password@host:port/database?options
```

 Por conveniência, o Laravel suporta esses URLs como alternativa ao configuração do seu banco de dados com várias opções de configuração. Se a opção de configuração `url` (ou a variável de ambiente correspondente `DB_URL`) estiver presente, ela será usada para extrair as informações de conexão e credenciais do banco de dados.

<a name="read-and-write-connections"></a>
### Conexões de Leitura e Gravação

 Às vezes, você poderá desejar usar uma conexão de banco de dados para instruções SELECT e outra para instruções INSERT, UPDATE e DELETE. O Laravel torna isso fácil. As conexões apropriadas serão sempre utilizadas se você estiver usando consultas brutos, o gerador de consulta ou o ORM Eloquent.

 Para ver como as conexões de leitura/gravação devem ser configuradas, vamos dar uma olhada neste exemplo:

```php
    'mysql' => [
        'read' => [
            'host' => [
                '192.168.1.1',
                '196.168.1.2',
            ],
        ],
        'write' => [
            'host' => [
                '196.168.1.3',
            ],
        ],
        'sticky' => true,

        'database' => env('DB_DATABASE', 'laravel'),
        'username' => env('DB_USERNAME', 'root'),
        'password' => env('DB_PASSWORD', ''),
        'unix_socket' => env('DB_SOCKET', ''),
        'charset' => env('DB_CHARSET', 'utf8mb4'),
        'collation' => env('DB_COLLATION', 'utf8mb4_0900_ai_ci'),
        'prefix' => '',
        'prefix_indexes' => true,
        'strict' => true,
        'engine' => null,
        'options' => extension_loaded('pdo_mysql') ? array_filter([
            PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
        ]) : [],
    ],
```

 Observe que foram adicionados três chaves na matriz de configurações: "read", "write" e "sticky". As chaves "read" e "write" possuem valores em matriz, contendo uma única chave "host". O resto das opções do banco de dados para as conexões "read" e "write" será combinado com a matriz principal de configuração do "mysql".

 Você só precisa colocar itens nos arrays "read" e "write" se desejar substituir os valores do array principal "mysql". Sendo assim, nesse caso, o endereço "192.168.1.1" será usado como o host para a conexão "leitura", enquanto que "192.168.1.3" será usado para a conexão "escrita". As credenciais de banco de dados, prefixo, conjunto de caracteres e todas as outras opções do array principal "mysql" serão compartilhadas entre ambas as conexões. Quando existirem vários valores no array de configuração "host", um host de banco de dados será escolhido aleatoriamente para cada solicitação.

<a name="the-sticky-option"></a>
#### Opção "sticky"

 A opção `sticky` é um valor *opcional* que pode ser usado para permitir a leitura imediata de registos escritos na base de dados durante o ciclo de solicitação atual. Se a opção `sticky` estiver ativada e tiver sido realizada uma operação "escrita" contra a base de dados durante o ciclo de solicitação atual, quaisquer operações adicionais de leitura irão usar a conexão "escrita". Isto assegura que todos os dados escritos durante o ciclo de solicitação podem ser imediatamente lidos novamente na base de dados durante essa mesma solicitação. Depende de si decidir se este é o comportamento desejado para a sua aplicação.

<a name="running-queries"></a>
## Executando consultas SQL

 Depois de configurar a conexão com sua base de dados, você poderá executar consultas utilizando o módulo `DB`. O módulo `DB` fornece métodos para cada tipo de query: `select`, `update`, `insert`, `delete` e `statement`.

<a name="running-a-select-query"></a>
#### Executando uma consulta selecionada

 Para executar uma consulta básica de seleção, você pode usar o método `select` na interface `DB`:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\DB;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Show a list of all of the application's users.
         */
        public function index(): View
        {
            $users = DB::select('select * from users where active = ?', [1]);

            return view('user.index', ['users' => $users]);
        }
    }
```

 O primeiro parâmetro passado ao método `select` é a consulta SQL, enquanto o segundo é um mapeamento de parâmetros que têm de ser vinculados à consulta. Normalmente, trata-se dos valores das restrições da cláusula `where`. O mapeamento de parâmetros oferece proteção contra injeção SQL.

 O método `select` sempre retornará um `array` de resultados. Cada resultado dentro do array será um objeto `stdClass` em PHP que representa um registro do banco de dados:

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::select('select * from users');

    foreach ($users as $user) {
        echo $user->name;
    }
```

<a name="selecting-scalar-values"></a>
#### Selecionando valores escalares

 Por vezes, a consulta de uma base de dados pode resultar num valor único escalar. Em vez de ser necessário recuperar o resultado escalar da consulta de um objeto registo, Laravel permite que seja possível recuperar este valor diretamente através do método `scalar`:

```php
    $burgers = DB::scalar(
        "select count(case when food = 'burger' then 1 end) as burgers from menu"
    );
```

<a name="selecting-multiple-result-sets"></a>
#### Seleção de conjuntos de resultados múltiplos

 Se o seu aplicativo solicitar procedimentos armazenados que retornam conjuntos de resultados múltiplos, poderá utilizar a metodologia `selectResultSets` para recuperar todos os conjuntos de resultados retornados pelo procedimento armazenado:

```php
    [$options, $notifications] = DB::selectResultSets(
        "CALL get_user_options_and_notifications(?)", $request->user()->id
    );
```

<a name="using-named-bindings"></a>
#### Usando ligações nomeadas

 Em vez de usar `?` para representar suas vinculações de parâmetros, você pode executar uma consulta usando vinculações nomeadas:

```php
    $results = DB::select('select * from users where id = :id', ['id' => 1]);
```

<a name="running-an-insert-statement"></a>
#### Executando uma instrução de inserção

 Para executar uma declaração `insert`, você pode usar o método `insert` na interface `DB`. Assim como no caso do método `select`, esse método aceita a consulta SQL como primeiro argumento e vinculações como segundo argumento:

 use Facade\Illuminate\Support\DB;

 DB::insert('insert into users (id, nome) values (?, ?)', [1, 'Marc']);

<a name="running-an-update-statement"></a>
#### Executar uma declaração de atualização

 O método `update` deve ser usado para atualizar os registros existentes na base de dados. O número de linhas afetadas pela instrução é retornada pelo método:

```php
    use Illuminate\Support\Facades\DB;

    $affected = DB::update(
        'update users set votes = 100 where name = ?',
        ['Anita']
    );
```

<a name="running-a-delete-statement"></a>
#### Executar uma declaração de exclusão

 O método delete deve ser usado para excluir registos de banco de dados. Tal como na operação update, o número de linhas afetadas é retornado pelo método:

```php
    use Illuminate\Support\Facades\DB;

    $deleted = DB::delete('delete from users');
```

<a name="running-a-general-statement"></a>
#### Realizando uma declaração geral

 Algumas declarações de banco de dados não retornam qualquer valor. Para esses tipos de operações, você pode usar o método `statement` na interface `DB`:

```php
    DB::statement('drop table users');
```

<a name="running-an-unprepared-statement"></a>
#### Execução de uma declaração não preparada

 Às vezes, você pode querer executar uma instrução SQL sem vinculá-la a qualquer valor. É possível usar o método `unprepared` da facada `DB` para isso:

```php
    DB::unprepared('update users set votes = 100 where name = "Dries"');
```

 > [ADVERTÊNCIA]
 > Uma vez que as declarações não preparadas não vinculam parâmetros, podem ser suscetíveis a injeção de SQL. Você nunca deve permitir valores controlados pelo usuário dentro de uma declaração não preparada.

<a name="implicit-commits-in-transactions"></a>
#### Comitês Implícitos

 Ao usar os métodos `statement` e `unprepared` da facade `DB` dentro de transações, você deve ter cuidado para evitar declarações que causem [comités implícitos](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html). Essas declarações farão com que o motor de banco de dados comite indiretamente a transação inteira, deixando o Laravel inconsciente do nível da transação no banco de dados. Um exemplo disso é criar uma tabela de banco de dados:

```php
    DB::unprepared('create table a (col varchar(1) null)');
```

 Consulte o manual do MySQL para saber quais são todas as declarações que originam commit implícitos.

<a name="using-multiple-database-connections"></a>
### Usando conexões de banco de dados múltiplas

 Se o seu aplicativo definir várias conexões no arquivo de configuração `config/database.php`, você poderá acessar cada conexão através do método `connection` fornecido pela faca `DB`. O nome da conexão passado ao método `connection` deve corresponder a uma das conexões listadas no arquivo de configuração `config/database.php` ou configurada em tempo de execução usando o recurso `config`:

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::connection('sqlite')->select(/* ... */);
```

 Você pode obter a instância subjacente da PDO em bruto de uma conexão usando o método `getPdo` em uma instância de conexão:

```php
    $pdo = DB::connection()->getPdo();
```

<a name="listening-for-query-events"></a>
### Ouvindo eventos de consulta

 Se você deseja especificar uma função de fechamento que é invocada para cada consulta SQL executada pelo seu aplicativo, você pode usar o método `listen` da faca `DB`. Este método pode ser útil para registrar consultas ou fazer debug. Você pode registrar sua função de fechamento na consulta no método `boot` de um [fornecedor de serviços](/docs/{{version}}/providers):

```php
    <?php

    namespace App\Providers;

    use Illuminate\Database\Events\QueryExecuted;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Register any application services.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            DB::listen(function (QueryExecuted $query) {
                // $query->sql;
                // $query->bindings;
                // $query->time;
            });
        }
    }
```

<a name="monitoring-cumulative-query-time"></a>
### Monitorando tempo de consulta acumulativo

 Um gargalo comum das performances de aplicações web modernas é o tempo gasto a interrogar os bancos de dados. Felizmente, Laravel permite acionar um fecho ou callback escolhido pelo utilizador quando este tempo for demasiado elevado durante uma única consulta ao banco de dados. Para iniciar, disponibilize o limiar de tempo de consulta (em milésimos) e o fecho para a função `whenQueryingForLongerThan`. Pode invocar esta função na metoda `boot` de um [fornecedor de serviços](/docs/{{version}}/providers):

```php
    <?php

    namespace App\Providers;

    use Illuminate\Database\Connection;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\ServiceProvider;
    use Illuminate\Database\Events\QueryExecuted;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Register any application services.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            DB::whenQueryingForLongerThan(500, function (Connection $connection, QueryExecuted $event) {
                // Notify development team...
            });
        }
    }
```

<a name="database-transactions"></a>
## Transações de banco de dados

 Você pode usar o método `transaction`, oferecido pela facade `DB`, para executar um conjunto de operações dentro de uma transação do banco de dados. Se for lançada uma exceção dentro da finalização da transação, esta será automaticamente revertida e a exceção será novamente lançada. Se o fechamento tiver sucesso, a transação será automaticamente comunicada:

```php
    use Illuminate\Support\Facades\DB;

    DB::transaction(function () {
        DB::update('update users set votes = 1');

        DB::delete('delete from posts');
    });
```

<a name="handling-deadlocks"></a>
#### Lidar com o impasse

 O método `transaction` aceita um segundo parâmetro opcional que define o número de vezes que uma transação deve ser reexecutada quando ocorre um bloqueio. Depois que essas tentativas forem concluídas, é lançado uma exceção:

```php
    use Illuminate\Support\Facades\DB;

    DB::transaction(function () {
        DB::update('update users set votes = 1');

        DB::delete('delete from posts');
    }, 5);
```

<a name="manually-using-transactions"></a>
#### Manualmente usando transações

 Se pretender iniciar uma transação manualmente e ter controlo completo sobre os rollbacks e commits pode usar o método `beginTransaction` fornecido pela interface `DB`:

```php
    use Illuminate\Support\Facades\DB;

    DB::beginTransaction();
```

 É possível efetuar o retrocesso da transação através do método `rollBack`:

```php
    DB::rollBack();
```

 Por fim, você pode comitar uma transação por meio do método `commit`:

```php
    DB::commit();
```

 > [!ATENÇÃO]
 [ construção de consultas](/docs/{{version}}/queries) e

<a name="connecting-to-the-database-cli"></a>
## Conectando-se ao DB CLIs

 Se você deseja se conectar à CLI do seu banco de dados, poderá usar o comando "db" da classe "Artisan":

```shell
php artisan db
```

 Se necessário, você pode especificar um nome de conexão de banco de dados para se conectar a uma conexão que não é a conexão padrão.

```shell
php artisan db mysql
```

<a name="inspecting-your-databases"></a>
## Inspeção de suas bases de dados

 Usando os comandos Artisan `db:show` e `db:table`, é possível obter informações valiosas sobre seu banco de dados e suas tabelas associadas. Para ver uma visão geral do seu banco de dados, incluindo o tamanho, tipo, número de conexões em aberto e um resumo das suas tabelas, você pode usar o comando `db:show`:

```shell
php artisan db:show
```

 Pode especificar qual ligação de base de dados será inspecionada fornecendo o nome da ligação para a ordem através da opção `--database`:

```shell
php artisan db:show --database=pgsql
```

 Se pretender incluir a contagem de linhas e os detalhes das exibições de banco de dados no resultado do comando, pode fornecer as opções `--counts` e `--views`, respetivamente. No caso de bases de dados grandes, a recuperação da contagem de linhas e dos detalhes das exibições pode demorar:

```shell
php artisan db:show --counts --views
```

 Além disso, você pode usar os seguintes métodos do objeto Schema para inspecionar seu banco de dados:

```php
    use Illuminate\Support\Facades\Schema;

    $tables = Schema::getTables();
    $views = Schema::getViews();
    $columns = Schema::getColumns('users');
    $indexes = Schema::getIndexes('users');
    $foreignKeys = Schema::getForeignKeys('users');
```

 Se você deseja inspecionar uma conexão de banco de dados que não é a conexão padrão do aplicativo, poderá usar o método `connection`:

```php
    $columns = Schema::connection('sqlite')->getColumns('users');
```

<a name="table-overview"></a>
#### Visão geral da tabela

 Se você deseja obter uma visão geral de uma tabela específica do seu banco de dados, poderá usar o comando `db:table`, que oferece um resumo geral de uma tabela de banco de dados, incluindo suas colunas, tipos, atributos, chaves e índices.

```shell
php artisan db:table users
```

<a name="monitoring-your-databases"></a>
## Monitorando suas bases de dados

 Usando o comando do artesão `db:monitor`, é possível instruir o Laravel a enviar um evento `Illuminate\Database\Events\DatabaseBusy` se o banco de dados estiver gerenciando mais que um determinado número de conexões em aberto.

 Para começar, você deve agendar o comando `db:monitor` para [executar a cada minuto] (/docs/{{version}}/scheduling). O comando aceita os nomes das configurações de conexão do banco de dados que deseja monitorar, bem como o número máximo de conexões abertas que devem ser toleradas antes da distribuição de um evento:

```shell
php artisan db:monitor --databases=mysql,pgsql --max=100
```

 O agendamento somente deste comando não é suficiente para acionar uma notificação informando o número de conexões em aberto. Quando este comando encontrar um banco de dados com um contador de conexões em aberto que exceder seu limite, um evento `DatabaseBusy` será enviado. Você deve monitorar esse evento no `AppServiceProvider` de sua aplicação para enviar uma notificação para você ou sua equipe de desenvolvimento:

```php
use App\Notifications\DatabaseApproachingMaxConnections;
use Illuminate\Database\Events\DatabaseBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(function (DatabaseBusy $event) {
        Notification::route('mail', 'dev@example.com')
                ->notify(new DatabaseApproachingMaxConnections(
                    $event->connectionName,
                    $event->connections
                ));
    });
}
```
