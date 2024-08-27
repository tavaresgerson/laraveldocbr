# Banco de dados: Começando

<a name="introduction"></a>
## Introdução

Quase todas aplicações web modernas interagem com um banco de dados. O Laravel torna a interação com bancos de dados extremamente simples através de uma variedade de bancos de dados suportados usando SQL cru, um [*query builder* fluente](/docs/queries), e o [ORM Eloquent](/docs/eloquent). Atualmente, o Laravel oferece suporte de primeira classe para cinco bancos de dados.

- MariaDB 10.3+ ([Política de Versão](https://mariadb.org/about/#maintenance-policy))
- MySQL 5.7+ ([Política de Versão](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 10.0+ ([Política de Versão](https://www.postgresql.org/support/versioning/))
- SQLite 3.35.0+
- SQL Server 2017+ ([Política de Versão](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

<a name="configuration"></a>
### Configuração

A configuração para os serviços de banco de dados do Laravel é localizada no arquivo `config/database.php` da sua aplicação. Neste arquivo, você pode definir todas as suas conexões com o banco de dados, bem como especificar qual conexão deve ser usada por padrão. A maioria das opções de configuração dentro deste arquivo são controladas pelos valores das variáveis de ambiente da sua aplicação. Exemplos para os sistemas de bancos de dados suportados pelo Laravel são fornecidos neste arquivo.

Por padrão, a [configuração de ambiente](/docs/configuration#environment-configuration) da amostra do Laravel está pronta para ser usada com o [Laravel Sail](/docs/sail), que é uma configuração Docker para o desenvolvimento de aplicativos Laravel na sua máquina local. No entanto, você é livre para modificar sua configuração do banco de dados conforme necessário para o seu banco de dados local.

<a name="sqlite-configuration"></a>
#### Configuração SQLite

Os bancos de dados SQLite são contidos dentro de um único arquivo em seu sistema de arquivos. Você pode criar um novo banco de dados SQLite usando o comando `touch` no terminal: `touch banco/banco.sqlite`. Depois que o banco de dados foi criado, você pode configurar facilmente suas variáveis de ambiente para apontar para este banco de dados colocando o caminho absoluto do banco de dados na variável de ambiente 'DB_DATABASE':

```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

Por padrão, as restrições de chave estrangeira são ativadas para conexões SQLite. Se você gostaria de desativá-los, você deve definir a variável de ambiente `DB_FOREIGN_KEYS` para `false`:

```ini
DB_FOREIGN_KEYS=false
```

::: info NOTA
Se você utilizar o [installer do Laravel](https://laravel.com/docs/installation#creating-a-laravel-project) para criar seu aplicativo Laravel e selecionar SQLite como seu banco de dados, o Laravel criará automaticamente um arquivo `database/database.sqlite` e executará as migrações padrão do banco de dados para você.
:::

<a name="mssql-configuration"></a>
#### Configuração do Microsoft SQL Server

Para usar um banco de dados do Microsoft SQL Server, você deve garantir que tenha as extensões PHP `sqlsrv` e `pdo_sqlsrv` instaladas, bem como quaisquer dependências que elas possam exigir, tais como o Microsoft SQL ODBC Driver.

<a name="configuration-using-urls"></a>
#### Configuração usando URLs

Tipicamente, conexões de banco de dados são configuradas usando múltiplas configurações como "host", "banco de dados", "usuário" e "senha", etc. Cada uma dessas configurações tem sua própria variável de ambiente correspondente. Isso significa que ao configurar as informações da conexão do seu banco de dados em um servidor de produção, você precisa gerenciar várias variáveis de ambiente.

Alguns provedores de banco de dados, como AWS e Heroku fornecem um único "endereço da web" que contém todas as informações de conexão para o banco de dados em uma única string. Um exemplo de URL de banco de dados pode parecer algo como o seguinte:

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

Estes URLs normalmente seguem um padrão de convenção.

```html
driver://username:password@host:port/database?options
```

Por motivos de conveniência, o Laravel suporta essas URLs como uma alternativa para configurar seu banco de dados com múltiplas opções de configuração. Se a opção de configuração 'url' (ou variável de ambiente correspondente 'DB_URL') estiver presente, ela será usada para extrair informações de conexão e credenciais do banco de dados.

<a name="read-and-write-connections"></a>
### Leia e escreva conexões

Às vezes você pode querer usar uma conexão de banco de dados para instruções SELECT e outra para instruções INSERT, UPDATE e DELETE. Laravel torna isso fácil, e as conexões corretas serão sempre utilizadas caso esteja usando consultas brutas, o construtor de consultas ou o ORM Eloquent.

Para ver como as conexões devem ser configuradas, vamos analisar este exemplo:

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

Observe que foram adicionadas três chaves à matriz de configuração: `read`, `write` e `sticky`. As chaves `read` e `write` têm valores de matriz contendo uma única chave: `host`. O restante das opções do banco de dados para as conexões `read` e `write` serão mescladas da matriz de configuração principal `mysql`.

Você só precisa colocar itens nos arrays `read` e `write` se quiser substituir os valores do array principal do MySQL. Assim, neste caso, 192.168.1.1 será usado como o host para a conexão "read", enquanto que 192.168.1.3 será usada para a conexão `write`. As credenciais de banco de dados, prefixo, conjunto de caracteres e todas as outras opções no array principal MySQL serão compartilhadas entre as duas conexões. Quando múltiplos valores existem no array `host` de configuração, um *host* de banco de dados será escolhido aleatoriamente para cada solicitação.

<a name="the-sticky-option"></a>
#### A Opção `sticky`

A opção `sticky` é um valor *opcional* que pode ser usado para permitir a leitura imediata dos registros que foram gravados no banco de dados durante o ciclo da requisição atual. Se a opção `sticky` estiver habilitada e uma operação `write` tiver sido executada no banco de dados durante o ciclo da requisição atual, qualquer operação subsequente de `read` (leitura) irá usar a conexão `write` (gravação). Isso garante que os dados gravados durante o ciclo da requisição possam ser imediatamente lidos do banco de dados na mesma requisição. Decida se esse é o comportamento desejado para sua aplicação.

<a name="running-queries"></a>
## Executando Consultas SQL

Uma vez que você tenha configurado sua conexão com o banco de dados, você pode executar consultas usando a facade `DB`. A facade `DB` fornece métodos para cada tipo de consulta: `select`, `update`, `insert`, `delete` e `statement`.

<a name="running-a-select-query"></a>
#### Executando uma consulta `SELECT`

Para executar uma consulta básica, você pode usar o método `select` na facade `DB`:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\DB;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Exibe uma lista de todos os usuários do aplicativo.
         */
        public function index(): View
        {
            $users = DB::select('select * from users where active = ?', [1]);

            return view('user.index', ['users' => $users]);
        }
    }
```

O primeiro argumento passado para o método `select` é a consulta SQL, enquanto o segundo argumento é quaisquer parâmetros de *binding* que precisam ser ligados à consulta. Geralmente, estes são os valores para restrições da cláusula `where`. A ligação de parâmetros fornece proteção contra injeção SQL.

O método `select` sempre retornará um `array` de resultados. Cada resultado dentro do `array` será um objeto PHP `stdClass` representando um registro do banco de dados:

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::select('select * from users');

    foreach ($users as $user) {
        echo $user->name;
    }
```

<a name="selecting-scalar-values"></a>
#### Selecionando Valores Scalar

Às vezes, sua consulta de banco de dados pode resultar em um único valor *scalar*. Em vez de ser necessário obter o resultado *scalar* da consulta do registro, o Laravel permite que você obtenha esse valor diretamente usando o método *scalar*:

```php
    $burgers = DB::scalar(
        "select count(case when food = 'burger' then 1 end) as burgers from menu"
    );
```

<a name="selecting-multiple-result-sets"></a>
#### Selecionando Múltiplos Conjuntos de Resultados

Se sua aplicação chama *stored procedures* que retornam múltiplos conjuntos de resultados, você pode usar o método `selectResultSets` para recuperar todos os conjuntos de resultados retornados pelo *stored procedures*:

```php
    [$options, $notifications] = DB::selectResultSets(
        "CALL get_user_options_and_notifications(?)", $request->user()->id
    );
```

<a name="using-named-bindings"></a>
#### Usando Ligações Nomeadas

Em vez de usar '?' para representar suas conexões do parâmetro, você pode executar uma consulta usando as conexões nomeadas:

```php
    $results = DB::select('select * from users where id = :id', ['id' => 1]);
```

<a name="running-an-insert-statement"></a>
#### Executando uma instrução INSERT

Para executar um comando `INSERT`, você pode usar o método `insert` da facade `DB`. Assim como o comando `SELECT`, este método aceita o comando SQL como seu primeiro argumento e os bindings como seu segundo argumento:

```php
use Illuminate\Support\Facades\DB;

DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);
```

<a name="running-an-update-statement"></a>
#### Executando uma declaração de UPDATE.

O método `update` deve ser usado para atualizar registros existentes no banco de dados. O número de linhas afetadas pela declaração é retornado pelo método.

```php
    use Illuminate\Support\Facades\DB;

    $affected = DB::update(
        'update users set votes = 100 where name = ?',
        ['Anita']
    );
```

<a name="running-a-delete-statement"></a>
#### Executando uma declaração DELETE

O método `delete` deve ser usado para apagar os registros do banco de dados. Assim como o método `update`, o número de linhas afetadas será retornado pelo método:

```php
    use Illuminate\Support\Facades\DB;

    $deleted = DB::delete('delete from users');
```

<a name="running-a-general-statement"></a>
#### Executando uma Declaração Geral

Algumas instruções de banco de dados não retornam nenhum valor. Para este tipo de operações, você pode usar o método `statement` da facade `DB`:

```php
    DB::statement('drop table users');
```

<a name="running-an-unprepared-statement"></a>
#### Executar um *Unprepared Statement*

Às vezes você pode querer executar uma instrução SQL sem vincular nenhum valor. Você pode usar o método `unprepared` da facade `DB` para fazer isso:

```php
    DB::unprepared('update users set votes = 100 where name = "Dries"');
```

::: warning ATENÇÃO
Como declarações não preparadas não estão vinculadas a parâmetros, elas podem ser vulneráveis à injeção SQL. Você nunca deve permitir valores controlados pelo usuário dentro de uma declaração *unprepared* (não preparada).
:::

<a name="implicit-commits-in-transactions"></a>
#### *Commits* Implícitos

Ao usar os métodos `statement` e `unprepared` dentro de transações você deve ter cuidado para evitar consultas que causem um [commit implícito](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html). Essas consultas farão com que o motor do banco de dados faça commit indiretamente a toda transação, deixando o Laravel sem saber qual foi o nível de transação do banco de dados. Um exemplo dessas consultas é criar uma tabela no banco de dados:

```php
    DB::unprepared('create table a (col varchar(1) null)');
```

Por favor, veja o [Manual do MySQL para a lista de instruções que disparam um commit implícito](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html).

<a name="using-multiple-database-connections"></a>
### Usando conexões múltiplas de banco de dados

Se a sua aplicação define múltiplas conexões no arquivo de configuração `config/database.php`, você pode acessar cada conexão via o método `connection` fornecido pela facade `DB`. O nome da conexão passado para o método `connection` deve corresponder a uma das conexões listadas no seu arquivo de configuração `config/database.php` ou configuradas em tempo de execução usando o *helper* `config`:

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::connection('sqlite')->select(/* ... */);
```

Você pode acessar a instância PDO bruta e subjacente de uma conexão usando o método `getPdo` em uma instância de conexão:

```php
    $pdo = DB::connection()->getPdo();
```

<a name="listening-for-query-events"></a>
### Ouvindo eventos de consulta

Se quiser especificar um *closure* que é invocado para cada consulta SQL executada por seu aplicativo, você pode usar o método `listen` da facade `DB`. Este método pode ser útil para registrar consultas ou depuração. Você pode registrar o ouvinte da sua consulta do *closure* no método de inicialização de um [provedor de serviço](/docs/providers):

```php
    <?php

    namespace App\Providers;

    use Illuminate\Database\Events\QueryExecuted;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Registre quaisquer serviços de aplicativos.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Inicialize qualquer serviço de aplicativo.
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
### Monitorando o tempo de consulta cumulativa

Um gargalo comum de desempenho dos aplicativos web modernos é o tempo que eles gastam consultando bancos de dados. Felizmente, Laravel pode invocar um *closure* ou retorno de chamada da sua preferência quando gasta muito tempo consultando o banco de dados durante uma única solicitação. Para começar, forneça uma limiar de tempo (em milissegundos) e um *closure* para o método `whenQueryingForLongerThan`. Você pode invocar este método no método `boot` de um [provedor de serviços](/docs/providers):

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
         * Registre quaisquer serviços de aplicativos.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Inicialize qualquer serviço de aplicativo.
         */
        public function boot(): void
        {
            DB::whenQueryingForLongerThan(500, function (Connection $connection, QueryExecuted $event) {
                // Notifique a equipe de desenvolvimento...
            });
        }
    }
```

<a name="database-transactions"></a>
## Transações de Banco de Dados

Você pode usar o método `transaction` fornecido pela facade `DB` para executar um conjunto de operações dentro de uma transação do banco de dados. Se uma exceção for lançada dentro da transação, a transação será automaticamente revertida e a exceção será re-lançada. Se o *closure* for executado com sucesso, a transação será automaticamente confirmada. Você não precisa se preocupar em reverter ou confirmar manualmente ao usar o método `transaction`:

```php
    use Illuminate\Support\Facades\DB;

    DB::transaction(function () {
        DB::update('update users set votes = 1');

        DB::delete('delete from posts');
    });
```

<a name="handling-deadlocks"></a>
#### Tratando Deadlocks

O método `transaction` aceita um argumento opcional que define o número de vezes que uma transação deve ser repetida quando ocorre um impasse. Uma vez que essas tentativas já foram esgotadas, uma exceção será lançada.

```php
    use Illuminate\Support\Facades\DB;

    DB::transaction(function () {
        DB::update('update users set votes = 1');

        DB::delete('delete from posts');
    }, 5);
```

<a name="manually-using-transactions"></a>
#### Usando transações manualmente

Se você gostaria de iniciar uma transação manualmente e ter controle total sobre reverter e confirmar, você pode usar o método `beginTransaction` fornecido pela facade `DB`:

```php
    use Illuminate\Support\Facades\DB;

    DB::beginTransaction();
```

Você pode reverter a transação usando o método `rollBack`:

```php
    DB::rollBack();
```

Por fim, você pode confirmar uma transação usando o método `commit`:

```php
    DB::commit();
```

::: info NOTA
O método de transação da facade `DB` controla as transações para o [*query builder*](/docs/queries) e o [ORM Eloquent](/docs/eloquent).
:::

<a name="connecting-to-the-database-cli"></a>
## Conexão com o Banco de Dados CLI

Se quiser conectar-se a CLI do seu banco de dados, você pode usar o comando `db` no Artisan:

```shell
php artisan db
```

Se necessário, você pode especificar um nome de conexão de banco de dados para se conectar com uma conexão de banco de dados que não seja a conexão padrão:

```shell
php artisan db mysql
```

<a name="inspecting-your-databases"></a>
## Inspeccionando suas bases de dados.

Usando os comandos Artisan `db:show` e `db:table`, você pode obter informações valiosas sobre seu banco de dados e tabelas associadas. Para ver um resumo do seu banco de dados, incluindo tamanho, tipo, número de conexões abertas e resumo das suas tabelas, você pode usar o comando `db:show`:

```shell
php artisan db:show
```

Você pode especificar qual conexão com o banco de dados deve ser verificada, fornecendo o nome da conexão com o banco de dados ao comando através da opção `--database`:

```shell
php artisan db:show --database=pgsql
```

Se você gostaria de incluir contagens de linhas e detalhes da tabela dentro do resultado do comando, você pode fornecer as opções `--counts` e `--views`, respectivamente. Em grandes bancos de dados, a recuperação de contagens de linhas e visualizações pode ser lenta:

```shell
php artisan db:show --counts --views
```

Além disso, você pode usar os seguintes métodos `Schema` para inspecionar seu banco de dados:

```php
    use Illuminate\Support\Facades\Schema;

    $tables = Schema::getTables();
    $views = Schema::getViews();
    $columns = Schema::getColumns('users');
    $indexes = Schema::getIndexes('users');
    $foreignKeys = Schema::getForeignKeys('users');
```

Se você gostaria de inspecionar uma conexão de banco que não é a padrão do seu aplicativo, você pode usar o método `connection`:

```php
    $columns = Schema::connection('sqlite')->getColumns('users');
```

<a name="table-overview"></a>
#### Tabela de Visão Geral

Se você gostaria de obter uma visão geral de uma tabela individual dentro do seu banco de dados, você pode executar o comando no Artisan: `db:table`. Este comando fornece uma visão geral de uma tabela de banco de dados, incluindo suas colunas, tipos, atributos, chaves e índices.

```shell
php artisan db:table users
```

<a name="monitoring-your-databases"></a>
## Monitorando seus Bancos de Dados

Usando o comando `db:monitor` no Artisan, você pode instruir o Laravel a disparar um evento do tipo `Illuminate\Database\Events\DatabaseBusy` se seu banco de dados estiver gerenciando mais conexões do que um número especificado.

Para começar, você deve agendar o comando `db:monitor` para ser executado a cada minuto. O comando aceita os nomes das configurações de conexão de banco de dados que você deseja monitorar, bem como o número máximo de conexões abertas toleradas antes da ocorrência de um evento:

```shell
php artisan db:monitor --databases=mysql,pgsql --max=100
```

Agendar este comando sozinho não é suficiente para acionar uma notificação que o alerte sobre o número de conexões ativas. Quando o comando encontra um banco de dados com uma contagem de conexões ativas que excede seu limite, um evento `DatabaseBusy` será enviado. Você deve ouvir este evento dentro do `AppServiceProvider` de seu aplicativo para enviar uma notificação para você ou sua equipe de desenvolvimento:

```php
use App\Notifications\DatabaseApproachingMaxConnections;
use Illuminate\Database\Events\DatabaseBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Inicialize qualquer serviço de aplicativo.
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
