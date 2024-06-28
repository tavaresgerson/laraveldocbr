# Base de dados: Migrações

<a name="introduction"></a>
## Introdução

 As migrações são como o controle de versão para seu banco de dados, permitindo que sua equipe defina e compartilhe a definição do esquema de banco de dados do aplicativo. Se você já teve que informar a um colega que adicionasse manualmente uma coluna ao esquema do banco de dados local depois de fazer o pull das suas alterações do controle de origem, você já experimentou o problema que as migrações de banco de dados resolvem.

 O `Schema` Laravel [Facade](/docs/facades) proporciona suporte independente do sistema de banco de dados para a criação e manipulação de tabelas em todos os sistemas de bancos de dados suportados pelo Laravel. Normalmente, as migrações usam este Facade para criar e modificar tabelas e colunas do banco de dados.

<a name="generating-migrations"></a>
## Gerando Migrações

 Você pode usar o comando `make:migration [Artisan command] ()` para gerar uma migração de banco de dados. O novo arquivo de migração será salvo no diretório `database/migrations`. Cada nome de arquivo contém um timestamp que permite a determinar a ordem das migrações:

```shell
php artisan make:migration create_flights_table
```

 O Laravel usará o nome da migração para tentar adivinhar o nome da tabela e se a migração cria uma nova tabela ou não. Se o Laravel conseguir determinar o nome da tabela a partir do nome da migração, o Laravel preencherá manualmente o arquivo de migração gerado com a tabela especificada. Caso contrário, você poderá simplesmente especificar a tabela no arquivo de migração manualmente.

 Se você deseja especificar um caminho personalizado para a migração gerada, pode usar a opção `--path" ao executar o comando "make:migration". O caminho indicado deve ser relativo ao caminho de base da aplicação.

 > [!ATENÇÃO]
 [Editor de stubs](/docs/artisan#stub-customization).

<a name="squashing-migrations"></a>
### Combater as Migrações

 Ao construir o seu aplicativo, você pode acumular mais e mais migrações ao longo do tempo. Isso pode levar à enchimento da diretora `database/migrations` com potencialmente centenas de migrations. Se preferir, você pode "comprimir" suas migrações em um único arquivo SQL. Para começar, execute o comando `schema:dump`:

```shell
php artisan schema:dump

# Dump the current database schema and prune all existing migrations...
php artisan schema:dump --prune
```

 Ao executar este comando, o Laravel irá escrever um ficheiro "schema" para o diretório `database/schema` do seu aplicativo. O nome deste ficheiro corresponde à ligação de base de dados. Agora, quando tentar migrar a sua base de dados e não tiver sido executado outro tipo de migração, o Laravel irá primeiro executar as declarações SQL do ficheiro "schema" da ligação de base de dados que está a usar. Depois de executar as declarações SQL do ficheiro "schema", o Laravel irá executar todas as outras migrações não contidas na respetiva imagem (schema).

 Se os testes da aplicação utilizarem uma conexão de banco de dados diferente daquela normalmente usada durante o desenvolvimento local, terá de garantir que existem ficheiros de esquema disponíveis para essa conexão de banco de dados, para que os testes consigam criar a base de dados. Talvez seja útil efetuar esta operação após descarregar a conexão de banco de dados normalmente usada durante o desenvolvimento local:

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```

 É aconselhável salvar o arquivo de esquema do banco de dados no controle de origem para que outros novos desenvolvedores em sua equipe possam criar rapidamente a estrutura inicial do banco de dados do aplicativo.

 > [!ATENÇÃO]
 > A função "Squash Migrations" está disponível apenas para os bancos de dados MySQL, PostgreSQL e SQLite e utiliza o cliente de linha de comando do banco de dados.

<a name="migration-structure"></a>
## Estrutura da Migração

 Uma classe de migração contém duas métodos: up e down. O método up é utilizado para adicionar novas tabelas, colunas ou índices ao banco de dados, enquanto o método down deve reverter as operações realizadas pelo método up.

 Nestas duas formas, pode utilizar o construtor de esquema Laravel para criar e modificar tabelas expressivamente. Para saber mais sobre todos os métodos disponíveis no construtor `Schema`, consulte a documentação [sobre criação de tabelas](https://laravel.com/docs/5.8/migrations#creating-tables). Por exemplo, a seguinte migração cria uma tabela `flights`:

```php
    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        /**
         * Run the migrations.
         */
        public function up(): void
        {
            Schema::create('flights', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('airline');
                $table->timestamps();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::drop('flights');
        }
    };
```

<a name="setting-the-migration-connection"></a>
#### Configurando uma conexão de migração

 Se sua migração interagir com uma conexão de banco de dados diferente da conexão padrão do aplicativo, você deve definir a propriedade `$connection` da sua migração:

```php
    /**
     * The database connection that should be used by the migration.
     *
     * @var string
     */
    protected $connection = 'pgsql';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ...
    }
```

<a name="running-migrations"></a>
## Execução de migrações

 Para executar todas as migrações pendentes, execute o comando "migrate" do assistente:

```shell
php artisan migrate
```

 Se você quiser ver quais migrações foram executadas até agora, pode usar o comando `migrate:status`, que é um comando da área de trabalho do Artiest.

```shell
php artisan migrate:status
```

 Se você deseja visualizar as instruções SQL que serão executadas pelas migrações sem realmente rodá-las, poderá fornecer a bandeira `--pretend` ao comando `migrate`:

```shell
php artisan migrate --pretend
```

#### Isolar a execução de migrações

 Se você estiver implantando o aplicativo em vários servidores e executar as migrações como parte do processo de implantação, é provável que não queira que dois servidores tentem migrar o banco de dados ao mesmo tempo. Para evitar isso, você pode usar a opção `isolated` quando invocar o comando `migrate`.

 Se a opção `isolated` for fornecida, o Laravel obterá um bloqueio atómico utilizando o driver de cache da aplicação antes de tentar executar as migrações. Todos os outros tentativas de executar o comando `migrate` enquanto esse bloqueio estiver em vigor não serão executadas; no entanto, o comando ainda irá sair com um código de estado de execução bem-sucedido:

```shell
php artisan migrate --isolated
```

 > [AVISO]
 > Para utilizar esse recurso, a aplicação deve usar como motor de cache o `memcached`, `redis`, `dynamodb`, `database`, `file` ou `array`. Além disso, todos os servidores devem estar comunicando-se com o mesmo servidor de cache central.

<a name="forcing-migrations-to-run-in-production"></a>
#### Fazer com que Migrações execute na produção

 Algumas operações de migração são destrutivas, o que significa que pode resultar na perda de dados. Para proteger os utilizadores contra a execução desses comandos no banco de dados da produção, é solicitada confirmação antes da execução dos comandos. Se pretender executar os comandos sem uma mensagem de aviso, use a bandeira `--force`:

```shell
php artisan migrate --force
```

<a name="rolling-back-migrations"></a>
### Reduzindo as Migrações

 Para anular a operação de migração mais recente, pode utilizar o comando do Artisan `rollback`. Este comando cancela a última "migração em lote", que pode incluir vários ficheiros de migrações:

```shell
php artisan migrate:rollback
```

 Pode efetuar o regresso de um número limitado de migrações ao fornecer a opção `step` ao comando `rollback`. Por exemplo, o seguinte comando reverterá as cinco últimas migrações:

```shell
php artisan migrate:rollback --step=5
```

 Você pode voltar atrás em uma "lote" específica de migrações, fornecendo a opção `batch` ao comando `rollback`, onde a opção `batch` corresponde à um valor do lote dentro da tabela `migrations` da aplicação. Por exemplo, o seguinte comando fará uma reversão em todas as migrações de lote três:

```shell
 php artisan migrate:rollback --batch=3
 ```

 Se você deseja ver as instruções SQL que serão executadas pelas migrações sem efetivamente rodá-las, forneça a bandeira `--pretend` ao comando `migrate:rollback`:

```shell
php artisan migrate:rollback --pretend
```

 O comando `migrate:reset` fará o retrocesso de todas as migrações do seu aplicativo:

```shell
php artisan migrate:reset
```

<a name="roll-back-migrate-using-a-single-command"></a>
#### Reduzir e migrar com um único comando

 O comando `migrate:refresh` desfaz todas as suas migrações e, em seguida, executa o comando `migrate`. Esse comando refaz efetivamente todo seu banco de dados.

```shell
php artisan migrate:refresh

# Refresh the database and run all database seeds...
php artisan migrate:refresh --seed
```

 Você pode desfazer e remigrar um número limitado de migrações fornecendo a opção `step` para o comando `refresh`. Por exemplo, o comando abaixo irá desfazer e remigrar as últimas cinco migrações:

```shell
php artisan migrate:refresh --step=5
```

<a name="drop-all-tables-migrate"></a>
#### Soltar todas as tabelas e migrar

 O comando `migrate:fresh` abandonará todas as tabelas do banco de dados e, em seguida, executará o comando `migrate`:

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

 Por padrão, o comando `migrate:fresh` apenas remove as tabelas da conexão de banco de dados por padrão. No entanto, pode utilizar a opção `--database` para especificar a conexão de banco de dados que será migrada. O nome da conexão do banco de dados deve corresponder ao definido na [conta-lo da aplicação "database"] [arquivo de configuração] (/docs/configuration):

```shell
php artisan migrate:fresh --database=admin
```

 > [AVERIGEMENTO DE ALERTA]
 > O comando `migrate:fresh` elimina todas as tabelas do banco de dados, independentemente do seu prefixo. Este comando deve ser utilizado com precaução ao desenvolver em um banco de dados compartilhado por outras aplicações.

<a name="tables"></a>
## Tabelas

<a name="creating-tables"></a>
### Criando tabelas

 Para criar uma nova tabela de banco de dados, use o método `create` na facade `Schema`. O método `create` aceita dois argumentos: o primeiro é o nome da tabela e o segundo é um fecho que recebe um objeto `Blueprint` que pode ser usado para definir a nova tabela.

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email');
        $table->timestamps();
    });
```

 Ao criar a tabela, pode utilizar qualquer um dos métodos de coluna do construtor de esquema (#Criando Colunas) para definir as colunas da tabela.

<a name="determining-table-column-existence"></a>
#### Determinar a existência de tabelas/colunas

 Pode determinar a existência de uma tabela, coluna ou índice usando os métodos `hasTable`, `hasColumn` e `hasIndex`:

```php
    if (Schema::hasTable('users')) {
        // The "users" table exists...
    }

    if (Schema::hasColumn('users', 'email')) {
        // The "users" table exists and has an "email" column...
    }

    if (Schema::hasIndex('users', ['email'], 'unique')) {
        // The "users" table exists and has a unique index on the "email" column...
    }
```

<a name="database-connection-table-options"></a>
#### Conexão de Base de Dados e Opções de Tabelas

 Se desejar executar uma operação de esquema numa conexão de base de dados que não seja a conexão padrão da aplicação, utilize o método `connection`:

```php
    Schema::connection('sqlite')->create('users', function (Blueprint $table) {
        $table->id();
    });
```

 Além disso, podem ser utilizadas outras propriedades e métodos para definir outros aspetos da criação de uma tabela. A propriedade `engine` pode ser utilizada para especificar o motor de armazenamento do banco de dados MySQL:

```php
    Schema::create('users', function (Blueprint $table) {
        $table->engine('InnoDB');

        // ...
    });
```

 As propriedades `charset` e `collation` podem ser utilizadas para especificar o conjunto de caracteres e a colocação para a tabela criada quando se utiliza o MySQL:

```php
    Schema::create('users', function (Blueprint $table) {
        $table->charset('utf8mb4');
        $table->collation('utf8mb4_unicode_ci');

        // ...
    });
```

 O método `temporário` pode ser utilizado para indicar que a tabela deve ser temporária. As tabelas temporárias são visíveis somente à sessão de base de dados da conexão atual e são automaticamente excluídas quando a conexão é fechada:

```php
    Schema::create('calculations', function (Blueprint $table) {
        $table->temporary();

        // ...
    });
```

 Se você quiser adicionar um "comentário" em uma tabela de banco de dados, pode invocar o método `comment` na instância da tabela. Atualmente os comentários de tabelas são suportados apenas pelo MySQL e pelo PostgreSQL:

```php
    Schema::create('calculations', function (Blueprint $table) {
        $table->comment('Business calculations');

        // ...
    });
```

<a name="updating-tables"></a>
### Atualização de tabelas

 A função `table` da facade `Schema` pode ser utilizada para atualizar tabelas existentes. Assim como na função `create`, a função `table` aceita dois argumentos: o nome da tabela e um closure que recebe uma instância de `Blueprint` que você poderá usar para adicionar colunas ou índices à tabela.

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->integer('votes');
    });
```

<a name="renaming-and-dropping-tables"></a>
### Rename/Drop Tables

 Para renomear uma tabela de banco de dados existente, utilize o método `rename`:

```php
    use Illuminate\Support\Facades\Schema;

    Schema::rename($from, $to);
```

 Para remover uma tabela existente, poderá utilizar os métodos `drop` ou `dropIfExists`:

```php
    Schema::drop('users');

    Schema::dropIfExists('users');
```

<a name="renaming-tables-with-foreign-keys"></a>
#### Renomeando tabelas com chaves estrangeiras

 Antes de renomear uma tabela, você deve verificar se quaisquer restrições de chave estrangeira da tabela têm um nome explícito em seus arquivos de migração em vez de deixar o Laravel atribuir um nome baseado em convenções. Caso contrário, o nome das restrições de chave estrangeira se referirá ao antigo nome da tabela.

<a name="columns"></a>
## Colunas

<a name="creating-columns"></a>
### Criando colunas

 É possível utilizar o método `table` da facade `Schema` para efetuar a atualização de tabelas existentes. Assim como o método `create`, o método `table` aceita dois argumentos: o nome da tabela e um fechamento que recebe uma instância `Illuminate\Database\Schema\Blueprint`, utilizada para adicionar colunas na tabela:

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->integer('votes');
    });
```

<a name="available-column-types"></a>
### Tipos de coluna disponíveis

 O esquema de modelo do construtor de esquemas disponibiliza vários métodos que correspondem aos diferentes tipos de colunas que pode adicionar às suas tabelas de banco de dados. Os métodos estão listados na tabela a seguir:

<style>
 <p>.método-de-coleta-list & gt; p {
 colunas: 10.8em 3; -moz-colunas: 10.8em 3; -webkit-colunas: 10.8em 3;
 }

 .collection-method-list a {
 display: bloqueio;
 Overflow: oculto;
 texto-transbordante: elipse;
 espaço-em-branco: agora;
 }

 .collection-method código{
 tamanho da fonte: 14px;
 }

 .method-de-coleta:not(.primeiro-metodo-de-coleta) {
 margem superior: 50px;
 }
</style>

<div class="collection-method-list" markdown="1">

 [incrementosGrandes] (#método de coluna incrementosGrandes)
 [BigInt](#método-de-coluna-BigInt)
 [binário (#método de coluna binária)](/themes/#coluna-binaria)
 [verdadeiro/falso](#método-de-coluna-booleana)
 [char](#method_column_char)
 [dateTimeTz](#método-coluna-datetimeTz)
 [dataEHora](#método-coluna-dataEhora)
 [data (#método-coluna-data)](/date/)
 [ decimal (método de coluna decimal)
 [double (#método-coluna-duplo)
 [enum (método coluna enum)]
 [flutuante] (#método_coluna_flutuante)
 [foreignId(#coluna_método_foreignId)
 [foreignIdFor(# método de coluna foreignIdFor)]
 [ulid_stranger](#método de coluna ulidStranger)
 [foreignUuid](#método-de-coluna-foreignUuid)
 [Geografia](#método-coluna-geografia)
 [Geometria do método de coluna](#geometry-of-the-column-method)
 [id (identificador da coluna)](#método-coluna-id)
 [incrementos] (#método de incremento da coluna)
 [inteiro (método #column-integer)](/column-integer)
 [endereçoIP#método-coluna-endereçoIp]
 [JSON (Método de coluna JSON)](#método-de-coluna-json)
 [jsonb (#método de coluna jsonb)](/plugins/ess_sql_dump/reference%20-%20JSONB%20function)
 [longText (#método de coluna longText)](/pt/column-method-longtext/)
 [macAddress (#método-coluna-macAddress)]
 [incrementos médios (#mediumIncrements)]
 [mediumInteger (# método da coluna mediumInteger)]
 [textoMediano (#método de coluna textoMediano)](/column-method-medianotexte)
 [Morfismos](#método de coluna morfismos)
 [morfesNulos](#método-coluna-morfesNulos)
 [nullableTimestamps (# método de coluna nullableTimestamps?)
 [nullableUlidMorphs (# método de coluna nullableUlidMorphs)
 [morphsNumericosPodemSerOmissos (# método de coluna morfologiaNumericaPodeSerOmitida?)]
 [recallToken](#method-column-recallToken)
 [definir](#método-de-coluna-definir)
 [pequenos incrementos](#método de coluna pequenos incrementos)
 [pequeno número intero] (#método de coluna smallInteger)
 [softDeletesTz (#método-coluna softDeletesTz)]
 [Soft Deletes (Método de coluna softDeletes)]
 [String#método de coluna (string)](/api/0.2/column_method_string)
 [Texto do método da coluna]
 [timeTz (#método-coluna timeTz)](/@@@column-method-timeTz)
 [hora](#método-de-coluna-hora)
 [timestampTz](#método-coluna-timestampTz)
 [A timestamp do método da coluna.#coluna-método-timestamp]
 [timestampsTz (#método-coluna-timestampsTz)]
 [Pontos de tempo] (#timestamps-coluna-método)
 [tinyIncrements](#método-coluna-tinyIncrements)
 [Tiny integer (#méthode column-tinyInteger)](/tinyinteger/)
 [tinyText (#column-method-tinyText)]
 [unsignedBigInteger (#método de coluna unsignedBigInteger)
 [numeroBinario](#método-de-coluna numberBinario)
 [medianaInteiroNegativo (# método de coluna medianaInteiroNegativo)
 [smallUnsignedInteger (# método de coluna smallUnsignedInteger)
 [unsignedTinyInteger](#método de coluna unsignedTinyInteger)
 [ulidMorphs (#método de coluna ulidMorphs)]
 [uuidMorphs (# método de coluna uuidMorphs)]
 [ulid(#method-coluna-ulid)]
 [UUID] (#método-coluna-UUID)
 [ano (#an-método-ano)]

</div>

<a name="column-method-bigIncrements"></a>
#### `bigIncrements()` {.collection-method .first-collection-method}

 O método bigIncrements cria uma coluna equivalente com incremento automático `UNSIGNED BIGINT` (chave primária):

```php
    $table->bigIncrements('id');
```

<a name="column-method-bigInteger"></a>
#### `bigInteger()` {.collection-method}

 O método `bigInteger` cria uma coluna equivalente à de tipo `BIGINT`:

```php
    $table->bigInteger('votes');
```

<a name="column-method-binary"></a>
#### `binary()` {.collection-method}

 O método "binário" cria uma coluna equivalente a BLOB:

```php
    $table->binary('photo');
```

 Ao utilizar o MySQL, MariaDB ou o SQL Server, podem ser passados argumentos `length` e `fixed` para criar uma coluna equivalente a `VARBINARY` ou `BINARY`:

```php
    $table->binary('data', length: 16); // VARBINARY(16)

    $table->binary('data', length: 16, fixed: true); // BINARY(16)
```

<a name="column-method-boolean"></a>
#### `boolean()` {.collection-method}

 O método `boolean` cria uma coluna equivalente a `BOOLEAN`:

```php
    $table->boolean('confirmed');
```

<a name="column-method-char"></a>
#### `char()` {.collection-method}

 O método `char` cria uma coluna de tipo `CHAR` equivalente com um determinado comprimento:

```php
    $table->char('name', length: 100);
```

<a name="column-method-dateTimeTz"></a>
#### `dateTimeTz()` {.collection-method}

 O método `dateTimeTz` cria uma coluna equivalente à do tipo de dados `DATETIME` (com fuso horário), com opcionalmente, precisão em segundos fracionários.

```php
    $table->dateTimeTz('created_at', precision: 0);
```

<a name="column-method-dateTime"></a>
#### `dateTime()` {.collection-method}

 O método `dateTime` cria uma coluna equivalente de `DATETIME` com precisão opcional de segundos fracionários.

```php
    $table->dateTime('created_at', precision: 0);
```

<a name="column-method-date"></a>
#### `date({.collection-method})`

 O método `date` cria uma coluna equivalente à `DATA`:

```php
    $table->date('created_at');
```

<a name="column-method-decimal"></a>
#### `Decimal()`{.collection-method}

 O método `decimal` cria uma coluna equivalente `DECIMAL` com o grau de precisão (nível total de dígitos) e escala (nível de dígitos decimais) especificados:

```php
    $table->decimal('amount', total: 8, places: 2);
```

<a name="column-method-double"></a>
#### `double( ){ .collection-method }`

 O método `double` cria uma coluna equivalente de tipo `DOUBLE`:

```php
    $table->double('amount');
```

<a name="column-method-enum"></a>
#### `enum()` {.collection-method}

 O método `enum` cria uma coluna com valores válidos equivalentes a um `ENUM`:

```php
    $table->enum('difficulty', ['easy', 'hard']);
```

<a name="column-method-float"></a>
#### `float()` {.collection-method}

 O método float cria uma coluna equivalente `FLOAT` com o número de casas decimais especificado:

```php
    $table->float('amount', precision: 53);
```

<a name="column-method-foreignId"></a>
#### `foreignId()` {.collection-method}

 O método `foreignId` cria uma coluna equivalente de tipo `UNSIGNED BIGINT`:

```php
    $table->foreignId('user_id');
```

<a name="column-method-foreignIdFor"></a>
#### `foreignIdFor()` {.collection-method}

 O método `foreignIdFor` adiciona uma coluna equivalente a `{coluna}_id` para um modelo de classe específico. O tipo da coluna será `BIGINT NÃO ASSINADA`, `CHAR(36)` ou `CHAR(26)`, dependendo do tipo de chave no modelo:

```php
    $table->foreignIdFor(User::class);
```

<a name="column-method-foreignUlid"></a>
#### `foreignUlid()` {.collection-method}

 O método `foreignUlid` cria uma coluna equivalente para o campo `ULID`:

```php
    $table->foreignUlid('user_id');
```

<a name="column-method-foreignUuid"></a>
#### foreignUuid() {.collection-method}

 O método `foreignUuid` cria uma coluna equivalente de `UUID`:

```php
    $table->foreignUuid('user_id');
```

<a name="column-method-geography"></a>
#### `geography()` {.collection-method}

 O método `geography` cria uma coluna equivalente a `GEOGRAPHY`, com o tipo espacial e SRID (Identificador do Sistema de Referência Espacial) indicados:

```php
    $table->geography('coordinates', subtype: 'point', srid: 4326);
```

 > [!NOTA]
 A extensão do [PostGIS](https://postgis.net) antes da metodologia `geography` pode ser usada.

<a name="column-method-geometry"></a>
#### `geometry()` {.collection-method}

 O método `geometry` cria uma coluna equivalente `GEOMETRY` com o tipo espacial e SRID especificados (Identificador do Sistema de Referência Espacial):

```php
    $table->geometry('positions', subtype: 'point', srid: 0);
```

 > [!ATENÇÃO]
 Antes de usar a extensão [O que é o PostGIS?](https://postgis.net), deve ser utilizado o método geometry.

<a name="column-method-id"></a>
#### `id()` {.collection-method}

 O método `id` é um alias do método `bigIncrements`. Por padrão, o método irá criar uma coluna com o nome "id". No entanto, pode passar um nome de coluna caso pretenda atribuir um nome diferente a essa coluna:

```php
    $table->id();
```

<a name="column-method-increments"></a>
#### `incrementar()` {.collection-method}

 O método `increments` cria uma coluna equivalente de incremento automático para um ID principal num inteiro sem signo:

```php
    $table->increments('id');
```

<a name="column-method-integer"></a>
#### `inteiro()` {.collection-method}

 O método `integer` cria uma coluna equivalente a `INTEIRO`:

```php
    $table->integer('votes');
```

<a name="column-method-ipAddress"></a>
#### `ipAddress()` {.collection-method}

 O método `ipAddress` cria uma coluna equivalente a `VARCHAR`:

```php
    $table->ipAddress('visitor');
```

 Quando se utiliza o PostgreSQL, será criada uma coluna `INET`.

<a name="column-method-json"></a>
#### `json()` {.collection-method}

 O método `json` cria uma coluna equivalente `JSON`:

```php
    $table->json('options');
```

<a name="column-method-jsonb"></a>
#### `jsonb()` {.metodo de coleção}

 O método `jsonb` cria uma coluna equivalente `JSONB`:

```php
    $table->jsonb('options');
```

<a name="column-method-longText"></a>
#### `longText()` {.collection-method}

 O método `longText` cria uma coluna equivalente a `LONGTEXT`:

```php
    $table->longText('description');
```

 Ao utilizar o MySQL ou MariaDB, pode ser aplicado um conjunto de caracteres "binary" para criar uma coluna equivalente a LONGBLOB:

```php
    $table->longText('data')->charset('binary'); // LONGBLOB
```

<a name="column-method-macAddress"></a>
#### `macAddress()` {.collection-method}

 O método `macAddress` cria uma coluna cujo objetivo é guardar um endereço MAC. Alguns sistemas de base de dados, tais como o PostgreSQL, possuem um tipo de coluna dedicado para este tipo de dados; outros utilizam uma coluna que representa estes valores através de strings:

```php
    $table->macAddress('device');
```

<a name="column-method-mediumIncrements"></a>
#### `medioIncrementos()` {.metodo de coleção}

 O método `mediumIncrements` cria uma coluna de equivalente com incremento automático do tipo `MEDIUMINT NÃO ASSINADA` como chave primária:

```php
    $table->mediumIncrements('id');
```

<a name="column-method-mediumInteger"></a>
#### `medioInteger()` {.collection-method}

 O método `mediumInteger` cria uma coluna equivalente a uma `MÉDIA INTEIRA`:

```php
    $table->mediumInteger('votes');
```

<a name="column-method-mediumText"></a>
#### `.método de coleção`{.texto-medio}

 O método `mediumText` cria uma coluna equivalente ao tipo de dados `MEDIUMTEXT`:

```php
    $table->mediumText('description');
```

 Ao utilizar o MySQL ou o MariaDB, você pode aplicar um conjunto de caracteres `binary` à coluna para criar uma coluna equivalente a `MEDIUMBLOB`:

```php
    $table->mediumText('data')->charset('binary'); // MEDIUMBLOB
```

<a name="column-method-morphs"></a>
#### `morfos()` {.collection-method}

 O método `morphs` é um método de conveniência que adiciona uma coluna equivalente a `{column}_id` e uma coluna equivalente ao tipo de dados `{column}_type`, convertida para o tipo `VARCHAR`. Dependendo do tipo de chave do modelo, o tipo da coluna será `UNSIGNED BIGINT`, `CHAR(36)` ou `CHAR(26)`.

 Esse método é destinado ao uso ao definir as colunas necessárias para um relacionamento [polimórfico Eloquent] (/docs/eloquent-relationships). No exemplo a seguir, seriam criadas as colunas `taggable_id` e `taggable_type`:

```php
    $table->morphs('taggable');
```

<a name="column-method-nullableTimestamps"></a>
#### `nullableTimestamps()` {.collection-method}

 O método `nullableTimestamps` é um alias do método [timestamps (Método de Timestamps)](/pt/docs/en/design-patterns/database-schema/timestamps):

```php
    $table->nullableTimestamps(precision: 0);
```

<a name="column-method-nullableMorphs"></a>
#### `nullableMorphs()` {.collection-method}

 O método é semelhante ao método [morphs](#método-morphs-em-colunas), mas as colunas criadas serão "nuloáveis":

```php
    $table->nullableMorphs('taggable');
```

<a name="column-method-nullableUlidMorphs"></a>
#### `nullableUlidMorphs()` {.collection-method}

 O método é semelhante ao método [ulidMorphs](#método-coluna-ulidMorphs); no entanto, as colunas que são criadas serão "nuloável":

```php
    $table->nullableUlidMorphs('taggable');
```

<a name="column-method-nullableUuidMorphs"></a>
#### `nullableUuidMorphs()` {.collection-method}

 O método é semelhante ao método [uuidMorphs (](#método-coluna-uuidMorphs), porém as colunas criadas serão de tipo "nulo":

```php
    $table->nullableUuidMorphs('taggable');
```

<a name="column-method-rememberToken"></a>
#### `rememberToken()`{.collection-method}

 O método `rememberToken` cria uma coluna de tipo `VARCHAR(100)` nula, que destina-se a armazenar o atual "token" de autenticação ("remember me") no momento:

```php
    $table->rememberToken();
```

<a name="column-method-set"></a>
#### `set()` {.collection-method}

 O método `set` cria uma coluna equivalente de tipo `SET` com a lista dada de valores válidos:

```php
    $table->set('flavors', ['strawberry', 'vanilla']);
```

<a name="column-method-smallIncrements"></a>
#### `smallIncrements()` {.collection-method}

 O método `smallIncrements` cria uma coluna equivalente que tenha um número crescente de forma automática, com o tipo correspondente ao de `SMALLINT NÃO ASSINADA`:

```php
    $table->smallIncrements('id');
```

<a name="column-method-smallInteger"></a>
#### `smallInteger()`{.collection-method}

 O método `smallInteger` cria uma coluna equivalente de tipo `SMALLINT`:

```php
    $table->smallInteger('votes');
```

<a name="column-method-softDeletesTz"></a>
#### `softDeletesTz()` {.collection-method}

 O método `softDeletesTz` adiciona uma coluna equivalente ao `TIMESTAMP` (`deleted_at`) com fuso horário nulo, opcional e de precisão secundária. Esta coluna destina-se a armazenar o `deleted_at timestamp` necessário para as funções "soft delete" da Eloquent:

```php
    $table->softDeletesTz('deleted_at', precision: 0);
```

<a name="column-method-softDeletes"></a>
#### `softDeletes()` {.collection-method}

 O método `softDeletes` adiciona uma coluna equivalente a um campo `deleted_at` de tipo TIMESTAMP, nulo pelo padrão e com uma precisão opcional de fração de segundo. Esta coluna destina-se a armazenar o valor do timestamp `deleted_at`, necessário para as funcionalidades de "exclusão suave" da Eloquent:

```php
    $table->softDeletes('deleted_at', precision: 0);
```

<a name="column-method-string"></a>
#### `string()` {.collection-method}

 O método `string` cria uma coluna equivalente a `VARCHAR` com o comprimento indicado:

```php
    $table->string('name', length: 100);
```

<a name="column-method-text"></a>
#### `text()` {.collection-method}

 O método `text` cria uma coluna equivalente de tipo `TEXT`:

```php
    $table->text('description');
```

 Ao utilizar o MySQL ou o MariaDB, pode ser aplicado um conjunto de caracteres "binário" à coluna para criar uma coluna equivalente a BLOB:

```php
    $table->text('data')->charset('binary'); // BLOB
```

<a name="column-method-timeTz"></a>
#### `timeTz()` {.collection-method}

 O método `timeTz` cria uma coluna equivalente a um `TIME` (com fuso horário), com uma precisão opcional em segundos fracionários.

```php
    $table->timeTz('sunrise', precision: 0);
```

<a name="column-method-time"></a>
#### `time()` {.collection-method}

 O método `time` cria uma coluna equivalente TIME com uma precisão de segundo fracionário opcional:

```php
    $table->time('sunrise', precision: 0);
```

<a name="column-method-timestampTz"></a>
#### `timestampTz()` {.collection-method}

 O método `timestampTz` cria uma coluna equivalente a `TIMESTAMP` (com fuso-horário), com precisão de segundo fracionário opcional.

```php
    $table->timestampTz('added_at', precision: 0);
```

<a name="column-method-timestamp"></a>
#### `timestamp()` {.collection-method}

 O método `timestamp` cria uma coluna equivalente `TIMESTAMP` com uma precisão opcional de segundos fracionários:

```php
    $table->timestamp('added_at', precision: 0);
```

<a name="column-method-timestampsTz"></a>
#### `timestampsTz()` {.collection-method}

 O método `timestampsTz` cria as colunas equivalentes `created_at` e `updated_at` como `TIMESTAMP` (com fuso horário):

```php
    $table->timestampsTz(precision: 0);
```

<a name="column-method-timestamps"></a>
#### `timestamps()` {.collection-method}

 O método `timestamps` cria colunas equivalentes a `created_at` e `updated_at` como `TIMESTAMP` com uma precisão opcional de segundos fracionados.

```php
    $table->timestamps(precision: 0);
```

<a name="column-method-tinyIncrements"></a>
#### `tinyIncrements()` {.collection-method}

 O método `tinyIncrements` cria uma coluna equivalente com incremento automático e equivalente a um `TINYINT NÃO ASSINADO`.

```php
    $table->tinyIncrements('id');
```

<a name="column-method-tinyInteger"></a>
#### `tinyInteger()` {.collection-method}

 O método `tinyInteger` cria uma coluna equivalente a `TINYINT`:

```php
    $table->tinyInteger('votes');
```

<a name="column-method-tinyText"></a>
#### `tinyText()` {.collection-method}

 O método `tinyText` cria uma coluna equivalente para o tipo de dados `TINYTEXT`:

```php
    $table->tinyText('notes');
```

 Ao utilizar o MySQL ou o MariaDB, pode aplicar um conjunto de caracteres "binário" à coluna para criar uma coluna equivalente ao tipo "TINYBLOB":

```php
    $table->tinyText('data')->charset('binary'); // TINYBLOB
```

<a name="column-method-unsignedBigInteger"></a>
#### `unsignedBigInteger()` {.collection-method}

 O método `unsignedBigInteger` cria uma coluna equivalente a `BIGINT sem sinal`:

```php
    $table->unsignedBigInteger('votes');
```

<a name="column-method-unsignedInteger"></a>
#### `unsignedInteger()` {.collection-method}

 O método `unsignedInteger` cria uma coluna equivalente a `INTEIRO NÃO ASSINADO`:

```php
    $table->unsignedInteger('votes');
```

<a name="column-method-unsignedMediumInteger"></a>
#### `unsignedMediumInteger()` {.collection-method}

 O método `unsignedMediumInteger` cria uma coluna equivalente a "NUMERO DE PEQUENO RANGE SINALIZADO":

```php
    $table->unsignedMediumInteger('votes');
```

<a name="column-method-unsignedSmallInteger"></a>
#### `unsignedSmallInteger()` {.collection-method}

 O método `unsignedSmallInteger` cria uma coluna equivalente a "UNSIGNED SMALLINT":

```php
    $table->unsignedSmallInteger('votes');
```

<a name="column-method-unsignedTinyInteger"></a>
#### `unsignedTinyInteger()`{.collection-method}

 O método `unsignedTinyInteger` cria uma coluna equivalente a `UNSIGNED TINYINT`:

```php
    $table->unsignedTinyInteger('votes');
```

<a name="column-method-ulidMorphs"></a>
#### `ulidMorphs()` {.collection-method}

 O método `ulidMorphs` é um método conveniente que adiciona uma coluna equivalente ao identificador de coluna, um equivalente de tipo de dados "{coluna}" convertido para "CHAR (26)" e um equivalente do tipo de dados "{coluna}" convertido para "VARCHAR".

 Esse método é usado quando se define as colunas necessárias para um relacionamento polimórfico [Eloquent] (/) que utilizam identificadores ULID. No exemplo a seguir, as colunas `taggable_id` e `taggable_type` seriam criadas:

```php
    $table->ulidMorphs('taggable');
```

<a name="column-method-uuidMorphs"></a>
#### `uuidMorphs()` {.collection-method}

 O método `uuidMorphs` é um método conveniente que adiciona uma coluna equivalente `{column}_id` de tipo `CHAR(36)` e uma coluna equivalente `{column}_type` de tipo `VARCHAR`.

 Esse método é indicado para definir as colunas necessárias de uma [relação polimórfica Eloquent](/docs/eloquent-relationships) que usa identificadores UUID. No exemplo a seguir, as colunas `taggable_id` e `taggable_type` seriam criadas:

```php
    $table->uuidMorphs('taggable');
```

<a name="column-method-ulid"></a>
#### `ulid()`{.collection-method}

 O método `ulid` cria uma coluna equivalente a `ULID`:

```php
    $table->ulid('id');
```

<a name="column-method-uuid"></a>
#### `uuid()` {.collection-method}

 O método `uuid` cria uma coluna equivalente ao tipo de dado `UUID`:

```php
    $table->uuid('id');
```

<a name="column-method-year"></a>
#### `ano()` {.collection-method}

 O método `year` cria uma coluna equivalente denominada `ANO`:

```php
    $table->year('birth_year');
```

<a name="column-modifiers"></a>
### Modificadores de coluna

 Além dos tipos de coluna listados acima, existem vários "modificadores" que pode utilizar quando adiciona uma coluna a uma tabela de banco de dados. Por exemplo, para tornar essa coluna "nula", poderá usar o método `nullable`:

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->string('email')->nullable();
    });
```

 A tabela a seguir contém todos os modificadores de coluna disponíveis. Esta lista não inclui os modificadores de índice [#creating-indexes](./modifiers.md#creating-indexes "Modificadores"):

|  Modificador |  Descrição |
|-----------|---------------|
|  ->após('coluna') |  Coloque a coluna após outra coluna (MySQL). |
|  ->`autoIncrement()` |  Definir colunas de inteiro como com incremento automático (chave primária). |
|  ->charset('utf8mb4') |  Especifique um conjunto de caracteres para a coluna (MySQL). |
|  `->collation('utf8mb4_unicode_ci')` |  Especifique uma colação para a coluna. |
|  `->comentário('meu comentário')' |  Adicione um comentário a uma coluna (MySQL/PostgreSQL). |
|  -> default ($value) |  Especifique um valor padrão para a coluna. |
|  `->first()` |  Coloque a coluna "primeiro" na tabela (MySQL). |
|  `->from($integer)` |  Define o valor inicial de um campo com incremento automático (MySQL/PostgreSQL). |
|  ->`invisível()` |  Tornar a coluna "invisível" para consultas `SELECT *` (MySQL). |
|  ->nulo(true) |  Permitir que os valores NULL sejam inseridos na coluna. |
|  `->armazenadoComo($expressão)` |  Crie uma coluna armazenada gerada (MySQL/PostgreSQL/SQLite). |
|  `->unsigned()` |  Definir as colunas inteiros como NÃO-ASSINADOS (MySQL). |
|  ->useCurrent() |  Definir colunas TIMESTAMP para usar o valor padrão CURRENT_TIMESTAMP. |
|  `->useCurrentOnUpdate()` |  Defina as colunas de TIMESTAMP para usar o CURRENT_TIMESTAMP quando um registro for atualizado (MySQL). |
|  `->virtualAs($expressão)` |  Crie uma coluna gerada virtualmente (MySQL/SQLite). |
|  `->generatedAs($expression)` |  Crie uma coluna de identidade com as opções da sequência especificadas (PostgreSQL). |
|  ->`sempre()` |  Define a precedência dos valores de sequências em relação ao valor de entrada para uma coluna de identidade (PostgreSQL). |

<a name="default-expressions"></a>
#### Expresões padrão

 O modificador `default` aceita um valor ou uma instância de `Illuminate\Database\Query\Expression`. A utilização de uma instância de `Expression` impedirá o Laravel de envolver o valor em aspas e lhe permitirá utilizar funções específicas do banco de dados. Uma situação em que isso é particularmente útil é quando necessita atribuir valores por defeito a colunas JSON:

```php
    <?php

    use Illuminate\Support\Facades\Schema;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Database\Query\Expression;
    use Illuminate\Database\Migrations\Migration;

    return new class extends Migration
    {
        /**
         * Run the migrations.
         */
        public function up(): void
        {
            Schema::create('flights', function (Blueprint $table) {
                $table->id();
                $table->json('movies')->default(new Expression('(JSON_ARRAY())'));
                $table->timestamps();
            });
        }
    };
```

 > [AVERIGÜEMBRE]
 > O suporte para expressões padrão depende do tipo de driver e versão do banco de dados em uso. Consulte a documentação do banco de dados.

<a name="column-order"></a>
#### Ordem das colunas

 O método `after` pode ser utilizado ao utilizar a base de dados MySQL para adicionar colunas depois de uma coluna existente no esquema:

```php
    $table->after('password', function (Blueprint $table) {
        $table->string('address_line1');
        $table->string('address_line2');
        $table->string('city');
    });
```

<a name="modifying-columns"></a>
### Modificando as colunas

 O método `change` permite-lhe alterar o tipo e os atributos das colunas existentes. Por exemplo, poderá pretender aumentar a dimensão de uma coluna "string". Para ver o funcionamento do método `change`, vamos aumentar a dimensão da coluna "name" de 25 para 50. Para fazer isto defina-se simplesmente o novo estado da coluna e, em seguida, chame o método `change`:

```php
    Schema::table('users', function (Blueprint $table) {
        $table->string('name', 50)->change();
    });
```

 Ao modificar uma coluna, você deve incluir explicitamente todos os modos que deseja manter na definição de coluna. Se qualquer atributo faltar, ele será excluído. Por exemplo, para manter os atributos `unsigned`, `default` e `comment`, é necessário chamar cada modo explicitamente ao alterar a coluna:

```php
    Schema::table('users', function (Blueprint $table) {
        $table->integer('votes')->unsigned()->default(1)->comment('my comment')->change();
    });
```

 O método `change` não altera os índices da coluna. Por conseguinte, pode utilizar a opção `--with-no-indexes` para especificamente adicionar ou remover um índice ao modificar a coluna:

```php
// Add an index...
$table->bigIncrements('id')->primary()->change();

// Drop an index...
$table->char('postal_code', 10)->unique(false)->change();
```

<a name="renaming-columns"></a>
### Renomear colunas

 Para renomear uma coluna, você pode usar o método `renameColumn`, fornecido pelo construtor de esquema:

```php
    Schema::table('users', function (Blueprint $table) {
        $table->renameColumn('from', 'to');
    });
```

<a name="dropping-columns"></a>
### Colunas deslocadas

 Para remover uma coluna, você pode usar o método `dropColumn` do construtor de esquema:

```php
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn('votes');
    });
```

 Você pode excluir múltiplas colunas de uma tabela, passando um array com os nomes das colunas para o método `dropColumn`:

```php
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['votes', 'avatar', 'location']);
    });
```

<a name="available-command-aliases"></a>
#### Aliases de Comandos Disponíveis

 O Laravel fornece vários métodos convenientes relacionados a remoção de tipos comuns de colunas. Cada um desses métodos é descrito na tabela abaixo:

|  Comando |  Descrição |
|----------|--------------|
|  `$table->dropMorphs('morphable');` |  Retire as colunas `morphable_id` e `morphable_type`. |
|  `$table->dropRememberToken();` |  Retire a coluna "remember_token". |
|  `$table->dropSoftDeletes();` |  Elimine a coluna "deleted_at". |
|  `$table->dropSoftDeletesTz();$/’ |  Alias do método `dropSoftDeletes()`. |
|  `$table->dropTimestamps();` |  Elimine as colunas `created_at` e `updated_at`. |
|  `$table->dropTimestampsTz();$table->dropColumns(array('col1','col2','col3'));/` |  Nome alternativo do método `dropTimestamps()`. |

<a name="indexes"></a>
## Índices

<a name="creating-indexes"></a>
### Criar índices

 O construtor de esquemas do Laravel suporta vários tipos de índices. O exemplo a seguir cria uma nova coluna `email` e especifica que seus valores devem ser exclusivos. Para criar o índice, podemos usar a metodologia `unique` na definição da coluna:

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->string('email')->unique();
    });
```

 Alternativamente, você pode criar o índice após definir a coluna. Para fazer isso, chame o método `unique` do blueprint do schema builder. Esse método aceita o nome da coluna que receberá um índice exclusivo:

```php
    $table->unique('email');
```

 É possível até mesmo passar um array de colunas para uma indexação composta (ou compositta):

```php
    $table->index(['account_id', 'created_at']);
```

 Ao criar um índice, o Laravel irá gerar automaticamente um nome de índice baseado na tabela, nomes das colunas e tipo do índice. No entanto, você pode passar um segundo argumento à metódia para especificar o nome do índice por si mesmo:

```php
    $table->unique('email', 'unique_email');
```

<a name="available-index-types"></a>
#### Tipos de índice disponíveis

 A classe de modelo do construtor de esquema do Laravel fornece métodos para criar cada tipo de índice suportado pelo Laravel. Cada método de índice aceita um segundo argumento opcional para especificar o nome do índice. Se omitido, o nome será derivado a partir dos nomes da tabela e das colunas usadas no índice, assim como do tipo de indexação. Cada um dos métodos de índices disponíveis é descrito na tabela abaixo:

|  Comando |  Descrição |
|----------|--------------|
|  `$tabela->primary("id");` |  Adiciona uma chave primária. |
|  `$tabela->primária(["id", "parent_id"]); |  Adiciona chaves compostas. |
|  `$table->unique('e-mail');` |  Adiciona um índice exclusivo. |
|  `$tabela->index ('estado');` |  Adiciona um índice. |
|  `$tabela->textoCompleto('corpo');` |  Adiciona um índice completo de texto (MySQL/PostgreSQL). |
|  `$tabela->textoCompleto('corpo')->linguagem('inglês');` |  Adiciona um índice de texto completo do idioma especificado (PostgreSQL). |
|  `$table->espacial_index("localização");` |  Adiciona um índice espacial (exceto no SQLite). |

<a name="renaming-indexes"></a>
### Renomeando índices

 Para renomear um índice, você pode usar o método `renameIndex`, fornecido pelo blueprint do criador de esquema. Esse método aceita como primeiro argumento o nome atual do índice e, em segundo lugar, o nome desejado:

```php
    $table->renameIndex('from', 'to')
```

<a name="dropping-indexes"></a>
### Descarregar índices

 Para remover um índice, você deve especificar o nome do mesmo. Por padrão, o Laravel atribui automaticamente um nome de índice com base no nome da tabela, o nome da coluna indexada e o tipo do índice. Veja alguns exemplos:

|  Comando |  Descrição |
|----------|----------------|
|  `$tabela->dropPrimário('users_id_primário');` |  Retire a chave primária da tabela "usuarios". |
|  `echo '$table->dropUnique("users_email_unique");' ;` |  Elimine um índice exclusivo da tabela "users". |
|  `$table->dropIndex('geo_state_index');` |  Retire um índice básico da tabela "geo". |
|  `$table->dropFullText('posts_body_fulltext');` |  Remova o índice de texto completo da tabela "posts". |
|  `$table->dropSpatialIndex('geo_location_spatialindex');` |  Descarregue um índice espacial da tabela "geo" (exceto no caso do SQLite). |

 Se você passar um array de colunas para uma função que remove índices, o nome convencional do índice será gerado com base no nome da tabela e dos campos.

```php
    Schema::table('geo', function (Blueprint $table) {
        $table->dropIndex(['state']); // Drops index 'geo_state_index'
    });
```

<a name="foreign-key-constraints"></a>
### Restrições de chave estrangeira

 O Laravel também fornece suporte para criação de restrições de chave estrangeira. Elas são usadas para forçar integridade referencial no nível do banco de dados. Por exemplo, vamos definir uma coluna `user_id` na tabela `posts`, que faça referência à coluna `id` em uma tabela `users`:

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('posts', function (Blueprint $table) {
        $table->unsignedBigInteger('user_id');

        $table->foreign('user_id')->references('id')->on('users');
    });
```

 Uma vez que essa sintaxe é bastante verbose, o Laravel fornece métodos adicionais e mais compactos que utilizam convenções para oferecer uma melhor experiência ao desenvolvedor. Quando você usa o método `foreignId` para criar sua coluna, o exemplo acima pode ser reescrito da seguinte maneira:

```php
    Schema::table('posts', function (Blueprint $table) {
        $table->foreignId('user_id')->constrained();
    });
```

 O método `foreignId` cria uma coluna equivalente a `UNSIGNED BIGINT`, enquanto o método `constrained` usará convenções para determinar qual é a tabela e qual é a coluna que está sendo referenciada. Se o nome da sua tabela não for compatível com as convenções de Laravel, você pode fornecer manualmente esse nome ao método `constrained`. Além disso, também será possível especificar um nome para o índice gerado:

```php
    Schema::table('posts', function (Blueprint $table) {
        $table->foreignId('user_id')->constrained(
            table: 'users', indexName: 'posts_user_id'
        );
    });
```

 Também é possível especificar a ação desejada para as propriedades "quando excluído" e "quando alterado" do constrango:

```php
    $table->foreignId('user_id')
          ->constrained()
          ->onUpdate('cascade')
          ->onDelete('cascade');
```

 Uma sintaxe alternativa e expressiva também está disponível para essas ações:

|  Método |  Descrição |
|-------------------------------|---------------------------------------------------|
|  `$table->cascadeOnUpdate(); |  Os updates devem ser distribuídos. |
|  `$table->restringirAtualizações(); |  As atualizações devem ser limitadas. |
|  `$table->noActionOnUpdate(); |  Nenhuma ação foi realizada sobre as atualizações. |
|  `$table->cascadeOnDelete();` |  As exclusões devem ser cascatais. |
|  `$table->restringirEmDeletar();` |  As exclusões devem ser restritas. |
|  `$table->nullOnDelete();` |  Excluir os valores do atributo de chave estrangeira para nulo. |

 É necessário chamar qualquer modificador de coluna adicional ([modificadores de colunas](#modificadores-de-colunas)) antes do método `constrained`:

```php
    $table->foreignId('user_id')
          ->nullable()
          ->constrained();
```

<a name="dropping-foreign-keys"></a>
#### Liberar Chaves Estrangeiras

 Para excluir uma chave estrangeira, você pode usar o método `dropForeign`, passando como argumento o nome da restrição de chave estrangeira a ser deletada. As restrições de chaves estrangeiras usam a mesma convenção de nomenclatura que os índices. Em outras palavras, o nome da restrição de chave estrangeira é baseado no nome da tabela e nas colunas na restrição, seguido do sufixo "\_foreign":

```php
    $table->dropForeign('posts_user_id_foreign');
```

 Como alternativa, você pode passar um array contendo o nome da coluna que irá armazenar a chave estrangeira para o método `dropForeign`. O array será convertido em um nome de restrição usando as convenções de nomenclatura de restrições do Laravel:

```php
    $table->dropForeign(['user_id']);
```

<a name="toggling-foreign-key-constraints"></a>
#### Alternância de restrições de chave estrangeira

 Você pode habilitar ou desabilitar as restrições de chave estrangeira nas suas migrações usando os métodos a seguir:

```php
    Schema::enableForeignKeyConstraints();

    Schema::disableForeignKeyConstraints();

    Schema::withoutForeignKeyConstraints(function () {
        // Constraints disabled within this closure...
    });
```

 > [AVISO]
 [ permitir o suporte a chaves estrangeiras](/docs/database#configuration) na sua configuração de banco de dados antes de tentar criá-las nas suas migrações. Além disso, o SQLite só suporta chaves estrangeiras quando é feita a criação da tabela e

<a name="events"></a>
## Eventos

 Por conveniência, cada operação de migração envia um evento. Todos os seguintes tipos de evento estendem a classe básica `Illuminate\Database\Events\MigrationEvent`:

|  Classe |  Descrição |
|-------|---------------|
|  `Illuminate\Database\Events\MigrationsStarted` |  Um lote de migração está prestes a ser executado. |
|  `Illuminate\Database\Events\MigrationsEnded` |  Um lote de migrações foi concluído. |
|  `Illuminate\Database\Events\MigrationStarted` |  Uma única migração está para ser executada. |
|  `Illuminate\Database\Events\MigrationEnded` |  Uma única migração acabou de ser executada. |
|  `Illuminate\Database\Events\NoPendingMigrations` |  O comando de migração não encontrou nenhuma migração pendente. |
|  `Illuminate\Database\Events\SchemaDumped` |  A exportação do esquema de banco de dados foi concluída. |
|  `Illuminate\Database\Events\SchemaLoaded` |  Um banco de dados existente já foi carregado. |
