# Banco de dados: Migrações

<a name="introduction"></a>
## Introdução

As migrações são como o controle de versão para o seu banco de dados, permitindo que sua equipe defina e compartilhe o esquema do banco de dados da aplicação. Se você já teve que dizer a um colega de trabalho para adicionar manualmente uma coluna ao seu esquema local de banco de dados após ter puxado suas alterações do controle de versão, você já enfrentou o problema que as migrações de banco de dados resolvem.

A [facade](/docs/facades) `Schema` do Laravel fornece suporte de banco de dados agnóstico para criar e manipular tabelas em todos os sistemas de banco de dados suportados pelo Laravel. Normalmente, as migrações usarão esta *facade* para criar e modificar tabelas de banco de dados e colunas.

<a name="generating-migrations"></a>
## Gerando Migrações

Você pode usar o comando `make:migration` para gerar uma migração de banco de dados. A nova migração será colocada no seu diretório `database/migrations`. Cada nome de arquivo de migração contém um carimbo de data e hora que permite o Laravel determinar a ordem das migrações:

```shell
php artisan make:migration create_flights_table
```

O Laravel usará o nome da migração para tentar adivinhar o nome da tabela e se a migração criará ou não uma nova tabela. Se o Laravel for capaz de determinar o nome da tabela a partir do nome da migração, o Laravel preencherá previamente o arquivo de migração gerado com a tabela especificada. Caso contrário, você pode simplesmente especificar a tabela no arquivo de migração manualmente.

Se você gostaria de especificar um caminho personalizado para o arquivo gerado da migração, você pode usar a opção `--path` ao executar o comando `make:migration`. O caminho dado deve ser relativo ao seu caminho base da aplicação.

::: info NOTA
Os stubs de migração podem ser personalizados usando [publicação de stub](/docs/artisan#stub-customization).
:::

<a name="squashing-migrations"></a>
### Encolhendo as migrações

À medida que você cria sua aplicação, você pode acumular mais e mais migrações ao longo do tempo. Isso pode levar seu diretório 'database/migrations' a se encher de centenas de migrações. Se desejar, você pode "encolher" suas migrações em um único arquivo SQL. Para começar, execute o comando `schema:dump`:

```shell
php artisan schema:dump

# Despeja o esquema de banco de dados atual e remover todas as migrações existentes...
php artisan schema:dump --prune
```

Ao executar esse comando, o Laravel irá escrever um arquivo "*schema*" no diretório da sua aplicação `database/schema`. O nome do arquivo "*schema*" corresponderá à conexão do banco de dados. Agora quando você tentar migrar seu banco de dados e não houver outras migrações executadas, o Laravel executará primeiro as instruções SQL contidas no arquivo "*schema*" da conexão do banco de dados que você está usando. Após executar as instruções SQL do arquivo "*schema*", o Laravel irá executar qualquer migração restante que não faça parte do dump do esquema.

Se seus testes de aplicação utilizam uma conexão de banco de dados diferente da que você normalmente usa durante o desenvolvimento local, você deve garantir que tenha "despejado" um arquivo de esquema usando essa conexão de banco de dados para que seus testes sejam capazes de construir seu banco de dados. Você pode querer fazer isso após ter derrubado a conexão do banco de dados que você normalmente usa durante o desenvolvimento local:

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```

Você deve enviar seu arquivo de esquema de banco de dados para o controle de origem para que outros novos desenvolvedores em sua equipe possam criar rapidamente a estrutura inicial do banco de dados do seu aplicativo.

::: warning ATENÇÃO
Encolher as migrações está disponível apenas para os bancos de dados MySQL, PostgreSQL e SQLite e utiliza o cliente de linha de comando do banco de dados.
:::

<a name="migration-structure"></a>
## Estrutura de Migração

Uma classe de migração contém dois métodos: `up` e `down`. O método `up` é usado para adicionar novas tabelas, colunas ou índices ao seu banco de dados, enquanto o método `down` deve reverter as operações feitas pelo método `up`.

Dentro de todos os dois métodos você pode usar o construtor de esquema do Laravel para criar e modificar tabelas expressivamente. Para saber sobre todos os métodos disponíveis no construtor do esquema [confira sua documentação](#creating-tables). Por exemplo, a migração abaixo cria uma tabela de 'voos':

```php
    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        /**
         * Execute as migrações.
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
         * Reverta as migrações.
         */
        public function down(): void
        {
            Schema::drop('flights');
        }
    };
```

<a name="setting-the-migration-connection"></a>
#### Configurar a conexão de migração

Se sua migração vai interagir com uma conexão de banco de dados diferente do padrão da aplicação, você precisa definir a propriedade `$connection` da migração:

```php
    /**
     * A conexão de banco de dados que deve ser usada pela migração.
     *
     * @var string
     */
    protected $connection = 'pgsql';

    /**
     * Execute as migrações.
     */
    public function up(): void
    {
        // ...
    }
```

<a name="running-migrations"></a>
## Migrando

Para executar todas as migrações pendentes, execute o comando `migrate` no Artisan:

```shell
php artisan migrate
```

Se você quiser ver quais migrações já foram executadas até agora, pode usar o comando `migrate:status` do Artisan:

```shell
php artisan migrate:status
```

Se você quer ver as instruções SQL que serão executadas pelas migrações sem realmente executar, você pode fornecer a bandeira ` --pretend` para o comando de migração:

```shell
php artisan migrate --pretend
```

#### Isolando a execução de migração

Se você está implantando seu aplicativo em vários servidores e executando migrações como parte do processo de implantação, provavelmente não deseja que dois servidores tentem migrar o banco de dados ao mesmo tempo. Para evitar isso, você pode usar a opção `isolated` ao invocar o comando `migrate`.

Quando a opção `isolated` é fornecida, o Laravel irá adquirir um bloqueio atômico usando o driver de cache do seu aplicativo antes de tentar executar suas migrações. Todas as outras tentativas de executar o comando `migrate` enquanto esse bloqueio for mantido não serão executadas; no entanto, o comando ainda sairá com um código de status de saída bem-sucedido:

```shell
php artisan migrate --isolated
```

::: warning ATENÇÃO
Para utilizar este recurso, sua aplicação deve estar utilizando o driver de cache `memcached`, `redis`, `dynamodb`, `database`, `file`, ou `array` como seu driver de cache padrão. Além disso, todos os servidores devem ser comunicados com o mesmo servidor central de cache.
:::

<a name="forcing-migrations-to-run-in-production"></a>
#### Forçando migrações para serem executadas em produção

Algumas operações de migração são destrutivas, o que significa que elas podem lhe fazer perder dados. Para proteger você de executar esses comandos contra sua base de dados de produção, uma mensagem de confirmação será exibida antes dos comandos serem executados. Para forçá-los a serem executados sem mensagem, use o sinalizador `--force`:

```shell
php artisan migrate --force
```

<a name="rolling-back-migrations"></a>
### Reverter a Migração

Para reverter a última operação de migração, você pode utilizar o comando Artisan "rollback". Este comando reverte a último "*batch*" de migrações que pode incluir vários arquivos de migração:

```shell
php artisan migrate:rollback
```

Você pode desfazer um número limitado de migrações fornecendo a opção `step` no comando `rollback`. Por exemplo, o seguinte comando irá desfazer as últimas cinco migrações:

```shell
php artisan migrate:rollback --step=5
```

Você pode rolar para trás um "lote" específico de migração fornecendo a opção `batch` para o comando `rollback`, onde a opção `batch` corresponde a um valor de lote dentro da tabela de banco de dados de `migrations` do seu aplicativo. Por exemplo, o seguinte comando vai rolar para trás todas as migrações no lote três:

```shell
 php artisan migrate:rollback --batch=3
 ```

Se você gostaria de ver as instruções SQL que serão executadas pelas migrações sem realmente executá-las, você pode fornecer a sinalização `--pretend` para o comando `migrate:rollback`:

```shell
php artisan migrate:rollback --pretend
```

O comando `migrate:reset` vai fazer um rollback de todas as migrações do seu aplicativo:

```shell
php artisan migrate:reset
```

<a name="roll-back-migrate-using-a-single-command"></a>
#### Reverter e migrar usando um único comando

O comando `migrate:refresh` vai reverter todas as suas migrações e, em seguida, executar o comando `migrate`. Este comando efetivamente recria todo o seu banco de dados.

```shell
php artisan migrate:refresh

# Atualize o banco de dados e execute todas as seeds do banco de dados...
php artisan migrate:refresh --seed
```

Você pode rolar de volta e migrar novamente um número limitado de migrações fornecendo o parâmetro `step` para o comando `refresh`. Por exemplo, o seguinte comando irá rolar de volta e migrar novamente as últimas cinco migrações:

```shell
php artisan migrate:refresh --step=5
```

<a name="drop-all-tables-migrate"></a>
#### Limpe todas as tabelas e migre

O comando `migrate:fresh` vai descartar todas as tabelas do banco de dados e em seguida executar o comando `migrate`:

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

Por padrão, o comando `migrate:fresh` apenas descarta as tabelas da conexão padrão de banco de dados. No entanto, você pode usar a opção `--database` para especificar a conexão do banco de dados que deve ser migrada. O nome da conexão do banco de dados deve corresponder à conexão definida no seu arquivo de configuração do `database` no [arquivo de configuração](/docs/configuration):

```shell
php artisan migrate:fresh --database=admin
```

::: warning ATENÇÃO
O comando `migrate:fresh` irá excluir todas as tabelas do banco de dados, independentemente do prefixo das mesmas. Esse comando deve ser usado com cautela ao desenvolver em um banco de dados que é compartilhado com outros aplicativos.
:::

<a name="tables"></a>
## Tabelas

<a name="creating-tables"></a>
### Criando tabelas

Para criar uma nova tabela de banco de dados, use o método `create` da *facade* `Schema`. O método `create` aceita dois argumentos: o primeiro é o nome da tabela e o segundo é um *closure* que recebe um objeto `Blueprint` que pode ser usado para definir a nova tabela:

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

Ao criar a tabela, você pode utilizar qualquer um dos [métodos de coluna](#creating-columns) do construtor de esquemas para definir as colunas da tabela.

<a name="determining-table-column-existence"></a>
#### Determinando a existência de tabela/coluna

Você pode determinar se uma tabela, coluna ou índice existem usando os métodos `hasTable`, `hasColumn` e `hasIndex`:

```php
    if (Schema::hasTable('users')) {
        // A tabela "users" existe...
    }

    if (Schema::hasColumn('users', 'email')) {
        // A tabela "users" existe e tem uma coluna "email"...
    }

    if (Schema::hasIndex('users', ['email'], 'unique')) {
        // A tabela "users" existe e tem um índice exclusivo na coluna "email"...
    }
```

<a name="database-connection-table-options"></a>
#### Conexão de Banco de dados e Opções de Tabela

Se você quiser executar uma operação de esquema em uma conexão de banco de dados que não seja a padrão de seu aplicativo, utilize o método `connection`:

```php
    Schema::connection('sqlite')->create('users', function (Blueprint $table) {
        $table->id();
    });
```

Além disso, outras propriedades e métodos podem ser usados para definir outros aspectos de criação da tabela. A propriedade `engine` pode ser usada para especificar o motor de armazenamento da tabela ao usar o MySQL:

```php
    Schema::create('users', function (Blueprint $table) {
        $table->engine('InnoDB');

        // ...
    });
```

As propriedades `charset` e `collation` podem ser usadas para especificar a codificação de caracteres e o ordenamento para as tabelas criadas no MySQL.

```php
    Schema::create('users', function (Blueprint $table) {
        $table->charset('utf8mb4');
        $table->collation('utf8mb4_unicode_ci');

        // ...
    });
```

O método `temporary` pode ser utilizado para indicar que a tabela deve ser "temporária". As tabelas temporais só são visíveis à sessão de banco de dados da conexão atual e são descartadas automaticamente quando a conexão é fechada.

```php
    Schema::create('calculations', function (Blueprint $table) {
        $table->temporary();

        // ...
    });
```

Se quiser acrescentar um comentário em uma tabela de banco de dados, você pode invocar o método `comment` na instância da tabela. Os comentários da tabela atualmente só são suportados por MySQL e PostgreSQL:

```php
    Schema::create('calculations', function (Blueprint $table) {
        $table->comment('Business calculations');

        // ...
    });
```

<a name="updating-tables"></a>
### Atualizando Tabelas

O método `table` da *facade* `Schema` pode ser usado para atualizar tabelas existentes. Como o método `create`, o método `table` aceita dois argumentos: o nome da tabela e uma *closure* que recebe uma instância de `Blueprint` a qual você pode usar para adicionar colunas ou índices à tabela:

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->integer('votes');
    });
```

<a name="renaming-and-dropping-tables"></a>
### Renomeando / Deletando Tabelas

Para renomear uma tabela existente no banco de dados, utilize o método `rename`:

```php
    use Illuminate\Support\Facades\Schema;

    Schema::rename($from, $to);
```

Para apagar uma tabela existente você pode usar os métodos `drop` ou `dropIfExists`:

```php
    Schema::drop('users');

    Schema::dropIfExists('users');
```

<a name="renaming-tables-with-foreign-keys"></a>
#### Renomeando tabelas com chaves estrangeiras

Antes de renomear uma tabela, você deve verificar se as restrições de chave estrangeira na tabela têm um nome explícito em seus arquivos de migração em vez de deixar o Laravel atribuir um nome baseado na convenção. Caso contrário, o nome da restrição da chave estrangeira irá se referir ao nome da antiga tabela.

<a name="columns"></a>
## Colunas

<a name="creating-columns"></a>
### Criando Colunas

O método `table` na *facade* `Schema` pode ser usado para atualizar tabelas existentes. Assim como o método `create`, o método `table` aceita dois argumentos: o nome da tabela e um *closure* que recebe uma instância de `Illuminate\Database\Schema\Blueprint` que você pode usar para adicionar colunas à tabela:

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->integer('votes');
    });
```

<a name="available-column-types"></a>
### Tipos de Coluna disponíveis

O construtor de schema oferece um conjunto de métodos que se correlacionam com os vários tipos de colunas que você pode acrescentar nas tabelas do seu banco de dados. Cada método disponível é listado na tabela abaixo:

- [bigIncrements](#column-method-bigIncrements)
- [bigInteger](#column-method-bigInteger)
- [binary](#column-method-binary)
- [boolean](#column-method-boolean)
- [char](#column-method-char)
- [dateTimeTz](#column-method-dateTimeTz)
- [dateTime](#column-method-dateTime)
- [date](#column-method-date)
- [decimal](#column-method-decimal)
- [double](#column-method-double)
- [enum](#column-method-enum)
- [float](#column-method-float)
- [foreignId](#column-method-foreignId)
- [foreignIdFor](#column-method-foreignIdFor)
- [foreignUlid](#column-method-foreignUlid)
- [foreignUuid](#column-method-foreignUuid)
- [geography](#column-method-geography)
- [geometry](#column-method-geometry)
- [id](#column-method-id)
- [increments](#column-method-increments)
- [integer](#column-method-integer)
- [ipAddress](#column-method-ipAddress)
- [json](#column-method-json)
- [jsonb](#column-method-jsonb)
- [longText](#column-method-longText)
- [macAddress](#column-method-macAddress)
- [mediumIncrements](#column-method-mediumIncrements)
- [mediumInteger](#column-method-mediumInteger)
- [mediumText](#column-method-mediumText)
- [morphs](#column-method-morphs)
- [nullableMorphs](#column-method-nullableMorphs)
- [nullableTimestamps](#column-method-nullableTimestamps)
- [nullableUlidMorphs](#column-method-nullableUlidMorphs)
- [nullableUuidMorphs](#column-method-nullableUuidMorphs)
- [rememberToken](#column-method-rememberToken)
- [set](#column-method-set)
- [smallIncrements](#column-method-smallIncrements)
- [smallInteger](#column-method-smallInteger)
- [softDeletesTz](#column-method-softDeletesTz)
- [softDeletes](#column-method-softDeletes)
- [string](#column-method-string)
- [text](#column-method-text)
- [timeTz](#column-method-timeTz)
- [time](#column-method-time)
- [timestampTz](#column-method-timestampTz)
- [timestamp](#column-method-timestamp)
- [timestampsTz](#column-method-timestampsTz)
- [timestamps](#column-method-timestamps)
- [tinyIncrements](#column-method-tinyIncrements)
- [tinyInteger](#column-method-tinyInteger)
- [tinyText](#column-method-tinyText)
- [unsignedBigInteger](#column-method-unsignedBigInteger)
- [unsignedInteger](#column-method-unsignedInteger)
- [unsignedMediumInteger](#column-method-unsignedMediumInteger)
- [unsignedSmallInteger](#column-method-unsignedSmallInteger)
- [unsignedTinyInteger](#column-method-unsignedTinyInteger)
- [ulidMorphs](#column-method-ulidMorphs)
- [uuidMorphs](#column-method-uuidMorphs)
- [ulid](#column-method-ulid)
- [uuid](#column-method-uuid)
- [year](#column-method-year)

<a name="column-method-bigIncrements"></a>
#### `bigIncrements()`

O método `bigIncrements` cria uma coluna equivalente a `UNSIGNED BIGINT` (chave primária) com incrementos automáticos.

```php
    $table->bigIncrements('id');
```

<a name="column-method-bigInteger"></a>
#### `bigInteger()`

O método `bigInteger` cria uma coluna equivalente de `BIGINT`:

```php
    $table->bigInteger('votes');
```

<a name="column-method-binary"></a>
#### `binary()`

O método `binary` cria uma coluna equivalente a um `BLOB`:

```php
    $table->binary('photo');
```

Ao utilizar MySQL, MariaDB ou SQL Server você pode passar os argumentos `length` e `fixed` para criar uma coluna equivalente a `VARBINARY` ou `BINARY`:

```php
    $table->binary('data', length: 16); // VARBINARY(16)

    $table->binary('data', length: 16, fixed: true); // BINARY(16)
```

<a name="column-method-boolean"></a>
#### `boolean()`

O método `boolean` cria uma coluna equivalente em `BOOLEAN`:

```php
    $table->boolean('confirmed');
```

<a name="column-method-char"></a>
#### `char()`

O método `char` cria uma coluna equivalente ao tipo de dados `CHAR` com um determinado comprimento:

```php
    $table->char('name', length: 100);
```

<a name="column-method-dateTimeTz"></a>
#### `dateTimeTz()`

O método `DateTimeTz` cria uma coluna equivalente de `DATETIME` (com zona de horário) com precisão opcional dos segundos fracionados.

```php
    $table->dateTimeTz('created_at', precision: 0);
```

<a name="column-method-dateTime"></a>
#### `dateTime()`

O método `dateTime` cria uma coluna equivalente `DATETIME` com uma precisão opcional de segundos fracionários:

```php
    $table->dateTime('created_at', precision: 0);
```

<a name="column-method-date"></a>
#### `data()`

O método `date` cria uma coluna equivalente para o tipo `DATE`:

```php
    $table->date('created_at');
```

<a name="column-method-decimal"></a>
#### `decimal()`

O método decimal cria uma coluna equivalente de `DECIMAL` com o nível de precisão (números inteiros) e escala (números decimais) fornecidos:

```php
    $table->decimal('amount', total: 8, places: 2);
```

<a name="column-method-double"></a>
#### `double()`

O método `double` cria uma coluna equivalente de `DOUBLE`:

```php
    $table->double('amount');
```

<a name="column-method-enum"></a>
#### `enum()`

O método `enum` cria uma coluna equivalente `ENUM` com os valores válidos fornecidos:

```php
    $table->enum('difficulty', ['easy', 'hard']);
```

<a name="column-method-float"></a>
#### `float()`

O método `float` cria uma coluna equivalente de `FLOAT` com a precisão dada:

```php
    $table->float('amount', precision: 53);
```

<a name="column-method-foreignId"></a>
#### `foreignId()`

O método `foreignId` cria uma coluna equivalente `UNSIGNED BIGINT`:

```php
    $table->foreignId('user_id');
```

<a name="column-method-foreignIdFor"></a>
#### `foreignIdFor()`

O método `foreignIdFor` adiciona uma coluna equivalente `{column}_id` para uma classe de modelo dada. O tipo da coluna será `UNSIGNED BIGINT`, `CHAR(36)` ou `CHAR(26)`, dependendo do tipo chave do modelo:

```php
    $table->foreignIdFor(User::class);
```

<a name="column-method-foreignUlid"></a>
#### `foreignUlid()`

O método `foreignUlid` cria uma coluna equivalente ao `ULID`:

```php
    $table->foreignUlid('user_id');
```

<a name="column-method-foreignUuid"></a>
#### `foreignUuid()`

O método `foreignUuid` cria uma coluna equivalente `UUID`:

```php
    $table->foreignUuid('user_id');
```

<a name="column-method-geography"></a>
#### `geography()`

O método `geography` cria uma coluna equivalente de `GEOGRAPHY` com o tipo espacial e identificador SRID (Sistema de Referência Espacial) dado:

```php
    $table->geography('coordinates', subtype: 'point', srid: 4326);
```

::: info NOTA
Suporte para tipos espaciais depende do seu driver de banco de dados. Por favor, consulte a documentação do seu banco de dados. Se seu aplicativo estiver usando um banco de dados PostgreSQL, você deve instalar a extensão [PostGIS](https://postgis.net) antes que o método `geography` possa ser usado.
:::

<a name="column-method-geometry"></a>
#### `geometry()`

O método `geometry` cria uma coluna equivalente de GEOMETRY com o tipo espacial e o SRID (Sistema de Referência Espacial) dado:

```php
    $table->geometry('positions', subtype: 'point', srid: 0);
```

> Nota:
> O suporte para tipos espaciais depende do seu driver de banco de dados. Por favor consulte a documentação do seu banco de dados. Se o seu aplicativo estiver usando um banco de dados PostgreSQL, você deve instalar a extensão [PostGIS](https://postgis.net) antes que o método `geometry` possa ser usado.

<a name="column-method-id"></a>
#### `id()`

O método `id` é um *alias* do método `bigIncrements`. Por padrão, o método irá criar uma coluna `id` no entanto, você pode passar um nome de coluna caso queira atribuir um nome diferente para a coluna:

```php
    $table->id();
```

<a name="column-method-increments"></a>
#### `increments()`

O método `increments` cria uma coluna equivalente ao `UNSIGNED INTEGER` auto-incremental como chave primária:

```php
    $table->increments('id');
```

<a name="column-method-integer"></a>
#### `integer()`

O método `integer` cria uma coluna equivalente para o tipo `INTEGER`:

```php
    $table->integer('votes');
```

<a name="column-method-ipAddress"></a>
#### `ipAddress()`

O método `ipAddress` cria uma coluna equivalente de `VARCHAR`:

```php
    $table->ipAddress('visitor');
```

Ao usar o PostgreSQL, é criada uma coluna `INET`.

<a name="column-method-json"></a>
#### `json()`

O método `json` cria uma coluna equivalente em `JSON`:

```php
    $table->json('options');
```

<a name="column-method-jsonb"></a>
#### `jsonb()`

O método `jsonb` cria uma coluna equivalente de `JSONB`:

```php
    $table->jsonb('options');
```

<a name="column-method-longText"></a>
#### `longText()`

O método `longText` cria uma coluna equivalente `LONGTEXT`:

```php
    $table->longText('description');
```

Ao utilizar o MySQL ou MariaDB, você pode aplicar um `character set` binário para que a coluna fique equivalente ao `LONGBLOB`:

```php
    $table->longText('data')->charset('binary'); // LONGBLOB
```

<a name="column-method-macAddress"></a>
#### `macAddress()`

O método `macAddress` cria uma coluna que pretende conter um endereço MAC. Alguns sistemas de banco de dados, como PostgreSQL, possuem um tipo de coluna específico para este tipo de dado. Outros sistemas de banco de dados usarão uma coluna equivalente a string:

```php
    $table->macAddress('device');
```

<a name="column-method-mediumIncrements"></a>
#### `mediumIncrements()`

O método `mediumIncrements` cria uma coluna equivalente de `UNSIGNED MEDIUMINT` auto incrementada, como chave primária:

```php
    $table->mediumIncrements('id');
```

<a name="column-method-mediumInteger"></a>
#### `mediumInteger()`

A função `mediumInteger` cria uma coluna equivalente de tipo `MEDIUMINT`.

```php
    $table->mediumInteger('votes');
```

<a name="column-method-mediumText"></a>
#### `mediumText()`

A `mediumText` cria uma coluna equivalente de `MEDIUMTEXT`:

```php
    $table->mediumText('description');
```

Ao utilizar MySQL ou MariaDB, você pode aplicar um conjunto de caracteres `binário` à coluna para criar uma coluna equivalente `MEDIUMBLOB`:

```php
    $table->mediumText('data')->charset('binary'); // MEDIUMBLOB
```

<a name="column-method-morphs"></a>
#### `morphs()`

O método `morphs` é um método de conveniência que adiciona uma coluna equivalente a ` {column}_id` e uma coluna equivalente a `{column}_type varchar`. O tipo de coluna para o `{column}_id` será `UNSIGNED BIGINT`, `CHAR (36)` ou `CHAR (26)` dependendo do tipo de chave do modelo.

Este método deve ser usado ao definir as colunas necessárias para um [relacionamento Eloquent](/docs/eloquent-relationships) polimórfico. No exemplo a seguir, as colunas `taggable_id` e `taggable_type` seriam criadas:

```php
    $table->morphs('taggable');
```

<a name="column-method-nullableTimestamps"></a>
#### `nullableTimestamps()`

O método `nullableTimestamps` é um apelido para o método [timestamps](#column-method-timestamps):

```php
    $table->nullableTimestamps(precision: 0);
```

<a name="column-method-nullableMorphs"></a>
#### `nullableMorphs()`

O método é semelhante ao método [morphs](#column-method-morphs); no entanto, as colunas criadas serão `nullable`:

```php
    $table->nullableMorphs('taggable');
```

<a name="column-method-nullableUlidMorphs"></a>
#### `nullableUlidMorphs()`

O método é semelhante ao método [ulidMorphs](#column-method-ulidMorphs); no entanto, as colunas criadas serão `nullable`:

```php
    $table->nullableUlidMorphs('taggable');
```

<a name="column-method-nullableUuidMorphs"></a>
#### `nullableUuidMorphs()`

O método é semelhante ao método [uuidMorphs](#column-method-uuidMorphs); no entanto, as colunas criadas serão `nullable`:

```php
    $table->nullableUuidMorphs('taggable');
```

<a name="column-method-rememberToken"></a>
#### `rememberToken()`

O método `rememberToken` cria uma coluna de tipo "nullable" VARCHAR(100) equivalente com o objetivo de armazenar a autenticação atual "lembra-me":

```php
    $table->rememberToken();
```

<a name="column-method-set"></a>
#### `set()`

O método `set` cria uma coluna equivalente a `SET` com a lista fornecida de valores válidos:

```php
    $table->set('flavors', ['strawberry', 'vanilla']);
```

<a name="column-method-smallIncrements"></a>
#### `smallIncrements()`

O método `smallIncrements` cria uma coluna equivalente de `unsigned smallint` que incrementa automaticamente como chave primária:

```php
    $table->smallIncrements('id');
```

<a name="column-method-smallInteger"></a>
#### `smallInteger()`

O método `smallInteger` cria uma coluna equivalente do tipo `SMALLINT`:

```php
    $table->smallInteger('votes');
```

<a name="column-method-softDeletesTz"></a>
#### `softDeletesTz()`

O método `softDeletesTz` adiciona uma coluna `deleted_at` com timestamp (com fuso horário) e valor nulo, equivalente a um número fracionário opcional. Esta coluna é destinada a armazenar o timestamp `deleted_at` necessário para a funcionalidade "*soft delete*" de Eloquent:

```php
    $table->softDeletesTz('deleted_at', precision: 0);
```

<a name="column-method-softDeletes"></a>
#### `softDeletes()`

O método `softDeletes` adiciona uma coluna `nullable` de `TIMESTAMP` com um segundo fracionário opcional para armazenar a marca de tempo `deleted_at` necessária para a funcionalidade "*soft delete*" do Eloquent. Esta coluna é destinada a armazenar o timestamp `deleted_at`

```php
    $table->softDeletes('deleted_at', precision: 0);
```

<a name="column-method-string"></a>
#### `string()`

O método `string` cria uma coluna equivalente à VARCHAR do comprimento dado.

```php
    $table->string('name', length: 100);
```

<a name="column-method-text"></a>
#### `text()`

O método `text` cria uma coluna equivalente de texto:

```php
    $table->text('description');
```

Ao utilizar MySQL ou MariaDB, você pode aplicar um conjunto de caracteres binários (`binary`) à coluna para criar uma coluna equivalente a `BLOB`:

```php
    $table->text('data')->charset('binary'); // BLOB
```

<a name="column-method-timeTz"></a>
#### `timeTz()`

O método `timeTz` cria uma coluna equivalente `TIME` (com *timezone*) com precisão opcional em segundos fracionados:

```php
    $table->timeTz('sunrise', precision: 0);
```

<a name="column-method-time"></a>
#### `time()`

O método `time` cria uma coluna equivalente de `TIME` com precisão opcional de segundos fracionados:

```php
    $table->time('sunrise', precision: 0);
```

<a name="column-method-timestampTz"></a>
#### `timestampTz()`

O método `timestampTz` cria uma coluna equivalente de `TIMESTAMP` (com informação *timeozone*) com precisão opcional de segundo fracionário:

```php
    $table->timestampTz('added_at', precision: 0);
```

<a name="column-method-timestamp"></a>
#### `timestamp()`

A função `timestamp` cria uma coluna equivalente de *timestamp* com precisão opcional dos segundos fracionários:

```php
    $table->timestamp('added_at', precision: 0);
```

<a name="column-method-timestampsTz"></a>
#### `timestampsTz()`

O método `timestampsTz` cria colunas equivalentes ao tipo `TIMESTAMP` (com fuso horário) para o `created_at` e `updated_at` com uma precisão opcional de segundos fracionários.

```php
    $table->timestampsTz(precision: 0);
```

<a name="column-method-timestamps"></a>
#### `timestamps()`

O método `timestamps` cria as colunas `created_at` e `updated_at` equivalentes a um `TIMESTAMP`, com uma precisão opcional de milissegundos.

```php
    $table->timestamps(precision: 0);
```

<a name="column-method-tinyIncrements"></a>
#### `tinyIncrements()`

O método `tinyIncrements` cria uma coluna equivalente a `UNSIGNED TINYINT` com incrementação automática como chave primária:

```php
    $table->tinyIncrements('id');
```

<a name="column-method-tinyInteger"></a>
#### `tinyInteger()`

O método `tinyInteger` cria uma coluna equivalente de `tinyint`:

```php
    $table->tinyInteger('votes');
```

<a name="column-method-tinyText"></a>
#### `tinyText()`

O método `tinyText` cria uma coluna equivalente de `TINYTEXT`:

```php
    $table->tinyText('notes');
```

Ao utilizar MySQL ou MariaDB, você pode aplicar um "*character set*" binário à coluna para criar uma coluna equivalente `TINYBLOB`:

```php
    $table->tinyText('data')->charset('binary'); // TINYBLOB
```

<a name="column-method-unsignedBigInteger"></a>
#### `unsignedBigInteger()`

O método `unsignedBigInteger` cria uma coluna equivalente `UNSIGNED BIGINT`:

```php
    $table->unsignedBigInteger('votes');
```

<a name="column-method-unsignedInteger"></a>
#### `unsignedInteger()`

O método `unsignedInteger` cria uma coluna equivalente de `UNSIGNED INTEGER`:

```php
    $table->unsignedInteger('votes');
```

<a name="column-method-unsignedMediumInteger"></a>
#### `unsignedMediumInteger()`

O método `unsignedMediumInteger` cria uma coluna equivalente de `UNSIGNED MEDIUMINT`:

```php
    $table->unsignedMediumInteger('votes');
```

<a name="column-method-unsignedSmallInteger"></a>
#### `unsignedSmallInteger()`

O método `unsignedSmallInteger` cria uma coluna equivalente de `UNSIGNED SMALLINT`:

```php
    $table->unsignedSmallInteger('votes');
```

<a name="column-method-unsignedTinyInteger"></a>
#### `unsignedTinyInteger()`

O método `unsignedTinyInteger` cria uma coluna equivalente de `UNSIGNED TINYINT`:

```php
    $table->unsignedTinyInteger('votes');
```

<a name="column-method-ulidMorphs"></a>
#### `ulidMorphs()`

O método `ulidMorphs` é um método de conveniência que adiciona uma coluna equivalente `{column}_id` `CHAR(26)` e uma coluna equivalente `{column}_type` `VARCHAR`.

Este método é destinado para ser usado quando definindo as colunas necessárias para uma [relação Eloquent](/docs/eloquent-relationships) polimórfica que emprega identificadores ULID. Na seguinte amostra, as colunas `taggable_id` e `taggable_type` seriam criadas:

```php
    $table->ulidMorphs('taggable');
```

<a name="column-method-uuidMorphs"></a>
#### `uuidMorphs()`

O método `uuidMorphs` é um método conveniente que adiciona uma coluna equivalente `CHAR(36)` `{column}_id` e uma coluna equivalente `VARCHAR` `{column}_type`.

Este método deve ser usado ao definir as colunas necessárias para um [relacionamento Eloquent](/docs/eloquent-relationships) polimórfico que usa identificadores UUID. No exemplo a seguir, as colunas `taggable_id` e `taggable_type` seriam criadas:

```php
    $table->uuidMorphs('taggable');
```

<a name="column-method-ulid"></a>
#### `ulid()`

O método `ulid` cria uma coluna equivalente:

```php
    $table->ulid('id');
```

<a name="column-method-uuid"></a>
#### `uuid()`

O método `uuid` cria uma coluna equivalente `UUID`:

```php
    $table->uuid('id');
```

<a name="column-method-year"></a>
#### `year()`

O método `year` cria uma coluna equivalente `YEAR`:

```php
    $table->year('birth_year');
```

<a name="column-modifiers"></a>
### Modificadores de coluna

Além dos tipos de colunas listados acima, existem vários modificadores de coluna que você pode usar ao adicionar uma coluna a uma tabela do banco de dados. Por exemplo, para tornar a coluna "nula", você pode usar o método `null`:

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->string('email')->nullable();
    });
```

A tabela a seguir contém todos os modificadores de coluna disponíveis. Esta lista não inclui [modificadores de índice](#creating-indexes):

| Modificador                         | Descrição                                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `->after('column')`                 | Coloque a coluna "depois" de outra coluna (MySQL).                                                       |
| `->autoIncrement()`                 | Defina colunas INTEGER como de incremento automático (chave primária).                                   |
| `->charset('utf8mb4')`              | Especifique um conjunto de caracteres para a coluna (MySQL).                                             |
| `->collation('utf8mb4_unicode_ci')` | Especifique uma *collation* para a coluna.                                                               |
| `->comment('my comment')`           | Adicione um comentário a uma coluna (MySQL / PostgreSQL).                                                |
| `->default($value)`                 | Especifique um valor "padrão" para a coluna.                                                             |
| `->first()`                         | Coloque a coluna em "primeiro" na tabela (MySQL).                                                        |
| `->from($integer)`                  | Defina o valor inicial de um campo de incremento automático (MySQL / PostgreSQL).                        |
| `->invisible()`                     | Tornar a coluna "invisível" para consultas `SELECT *` (MySQL).                                           |
| `->nullable($value = true)`         | Permitir que valores NULL sejam inseridos na coluna.                                                     |
| `->storedAs($expression)`           | Crie uma coluna *stored generated* (MySQL / PostgreSQL / SQLite).                                        |
| `->unsigned()`                      | Defina colunas INTEGER como UNSIGNED (MySQL).                                                            |
| `->useCurrent()`                    | Defina as colunas TIMESTAMP para usar CURRENT_TIMESTAMP como valor padrão.                               |
| `->useCurrentOnUpdate()`            | Defina as colunas TIMESTAMP para usar CURRENT_TIMESTAMP quando um registro for atualizado (MySQL).       |
| `->virtualAs($expression)`          | Crie uma coluna virtual gerada (MySQL / SQLite).                                                         |
| `->generatedAs($expression)`        | Crie uma coluna de identidade com opções de sequência especificadas (PostgreSQL).                        |
| `->always()`                        | Define a precedência de valores de sequência sobre a entrada para uma coluna de identidade (PostgreSQL). |

<a name="default-expressions"></a>
#### Expressões padrão

O modificador `default` aceita um valor ou uma instância `Illuminate\Database\Query\Expression`. Usando uma instância de `Expression`, o Laravel não irá envolver o valor entre aspas e permitirá que você utilize funções específicas do banco de dados. Uma situação em que isso é particularmente útil é quando você precisa atribuir valores padrão a colunas JSON:

```php
    <?php

    use Illuminate\Support\Facades\Schema;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Database\Query\Expression;
    use Illuminate\Database\Migrations\Migration;

    return new class extends Migration
    {
        /**
         * Execute as migrações.
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

::: warning ATENÇÃO
O suporte para expressões padrão depende do seu driver de banco de dados, a versão do banco de dados e o tipo de campo. Por favor, consulte a documentação do seu banco de dados.
:::

<a name="column-order"></a>
#### Ordem de Coluna

Quando usando o banco de dados MySQL, você pode usar o método `after` para adicionar colunas após uma coluna existente no esquema de banco de dados.

```php
    $table->after('password', function (Blueprint $table) {
        $table->string('address_line1');
        $table->string('address_line2');
        $table->string('city');
    });
```

<a name="modifying-columns"></a>
### Modificando Colunas

O método `change` permite que você altere o tipo e os atributos das colunas existentes. Por exemplo, você pode querer aumentar o tamanho de uma coluna `string`. Para ver a ação do método `change`, vamos aumentar o tamanho da coluna `name` de 25 para 50. Para fazer isso, simplesmente definimos o novo estado da coluna e então chamamos o método `change`:

```php
    Schema::table('users', function (Blueprint $table) {
        $table->string('name', 50)->change();
    });
```

Ao modificar uma coluna, você deve incluir explicitamente todos os modificadores que deseja manter na definição da coluna - qualquer atributo ausente será descartado. Por exemplo, para reter o atributo `unsigned`, `default` e `comment`, você deve chamar cada modificador explicitamente ao alterar a coluna:

```php
    Schema::table('users', function (Blueprint $table) {
        $table->integer('votes')->unsigned()->default(1)->comment('my comment')->change();
    });
```

O método `change` não altera os índices da coluna. Portanto, você pode usar modificadores de índice para adicionar ou remover explicitamente um índice ao modificar a coluna:

```php
// Adicionar um índice...
$table->bigIncrements('id')->primary()->change();

// Apaga um índice...
$table->char('postal_code', 10)->unique(false)->change();
```

<a name="renaming-columns"></a>
### Renomear Colunas

Para renomear uma coluna você pode usar o método `renameColumn` fornecido pelo construtor de esquema:

```php
    Schema::table('users', function (Blueprint $table) {
        $table->renameColumn('from', 'to');
    });
```

<a name="dropping-columns"></a>
### Apagando Colunas

Para descartar uma coluna, você pode usar o método `dropColumn` no construtor de esquema:

```php
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn('votes');
    });
```

Você pode excluir múltiplas colunas de uma tabela passando um *array* de nomes de colunas para o método `dropColumn`:

```php
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['votes', 'avatar', 'location']);
    });
```

<a name="available-command-aliases"></a>
#### *Aliases* de comando disponíveis

Laravel fornece vários métodos convenientes relacionados a remoção de tipos comuns de colunas. Cada um desses métodos é descrito na tabela abaixo:

| Comando                           | Descrição                                             |
|-----------------------------------|-------------------------------------------------------|
| `$table->dropMorphs('morphable');`| Remova as colunas `morphable_id` e `morphable_type`.  |
| `$table->dropRememberToken();`    | Remova a coluna `remember_token`.                     |
| `$table->dropSoftDeletes();`      | Remova a coluna `deleted_at`.                         |
| `$table->dropSoftDeletesTz();`    | Alias ​​do método `dropSoftDeletes()`.                  |
| `$table->dropTimestamps();`       | Remova as colunas `created_at` e `updated_at`.        |
| `$table->dropTimestampsTz();`     | Alias ​​do método `dropTimestamps()`.                   |

<a name="indexes"></a>
## Índices

<a name="creating-indexes"></a>
### Criando índices

O construtor de esquemas do Laravel suporta vários tipos de índices. O exemplo seguinte cria uma nova coluna `email` e especifica que os valores dela devem ser únicos. Para criar o índice, podemos encadear o método `unique` na definição da coluna:

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('users', function (Blueprint $table) {
        $table->string('email')->unique();
    });
```

Alternativamente, você pode criar o índice depois de definir a coluna. Para isso, você deve chamar o método "único" no esboço do construtor de esquema. Este método aceita o nome da coluna que deve receber um índice exclusivo:

```php
    $table->unique('email');
```

Você pode passar até mesmo uma matriz de colunas para um método de índice para criar um índice composto:

```php
    $table->index(['account_id', 'created_at']);
```

Ao criar um índice, o Laravel irá gerar automaticamente um nome de índice baseado na tabela, nos nomes da coluna e no tipo do índice. Mas você pode passar um segundo argumento ao método para especificar o nome do índice por conta própria:

```php
    $table->unique('email', 'unique_email');
```

<a name="available-index-types"></a>
#### Tipos de índice disponíveis

A classe *blueprint* de construtor de esquemas do Laravel fornece métodos para criar cada tipo de índice suportado pelo Laravel. Cada método de índice aceita um segundo argumento opcional para especificar o nome do índice. Se omitido, o nome será derivado dos nomes da tabela e da coluna(s) usadas para o índice, bem como do tipo de índice.

| Comando                                           | Descrição                                                                     |
| --------------------------------------------------|-------------------------------------------------------------------------------|
| `$table->primary('id');`                          |  Adiciona uma chave primária.                                                 |
| `$table->primary(['id', 'parent_id']);`           |  Adiciona chaves compostas.                                                   |
| `$table->unique('email');`                        |  Adiciona um índice exclusivo.                                                |
| `$table->index('state');`                         |  Adiciona um índice.                                                          |
| `$table->fullText('body');`                       |  Adiciona um índice de texto completo (MySQL / PostgreSQL).                   |
| `$table->fullText('body')->language('english');`  |  Adiciona um índice de texto completo do idioma especificado (PostgreSQL).    |
| `$table->spatialIndex('location');`               |  Adiciona um índice espacial (exceto SQLite).                                 |

<a name="renaming-indexes"></a>
### Renomeando índices

Para renomear um índice, você pode usar o método `renameIndex` fornecido pelo blueprint do construtor de esquemas. Este método aceita o nome atual do índice como seu primeiro argumento e o nome desejado como segundo argumento:

```php
    $table->renameIndex('from', 'to')
```

<a name="dropping-indexes"></a>
### Removendo Índices

Para criar um índice você deve especificar o nome do índice. Por padrão, Laravel atribui automaticamente o nome do índice com base na tabela, na coluna e no tipo de índice. Aqui estão alguns exemplos:

| Comando                                                   | Descrição                                                 |
|-----------------------------------------------------------|-----------------------------------------------------------|
| `$table->dropPrimary('users_id_primary');`                | Remova uma chave primária da tabela "users".              |
| `$table->dropUnique('users_email_unique');`               | Remova um índice exclusivo da tabela "users".             |
| `$table->dropIndex('geo_state_index');`                   | Remova um índice básico da tabela "geo".                  |
| `$table->dropFullText('posts_body_fulltext');`            | Remova um índice de texto completo da tabela "posts".     |
| `$table->dropSpatialIndex('geo_location_spatialindex');`  | Remova um índice espacial da tabela "geo" (exceto SQLite).|

Se você passar uma matriz de colunas em um método que remove índices, o nome do índice convencional será gerado com base no nome da tabela, das colunas e do tipo de índice.

```php
    Schema::table('geo', function (Blueprint $table) {
        $table->dropIndex(['state']); // Remove o indice 'geo_state_index'
    });
```

<a name="foreign-key-constraints"></a>
### Restrições de Chave Estrangeira

O Laravel também fornece suporte para criar restrições de chave estrangeira, que são usadas para forçar a integridade referencial no nível do banco de dados. Por exemplo, vamos definir uma coluna `user_id` na tabela `posts` que referencia a coluna `id` em uma tabela `users`:

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('posts', function (Blueprint $table) {
        $table->unsignedBigInteger('user_id');

        $table->foreign('user_id')->references('id')->on('users');
    });
```

Como essa sintaxe é um pouco verbosa, o Laravel fornece métodos adicionais mais curtos que utilizam convenções para proporcionar uma melhor experiência ao programador. Quando usando o método `foreignId` para criar sua coluna, o exemplo acima pode ser reescrito assim:

```php
    Schema::table('posts', function (Blueprint $table) {
        $table->foreignId('user_id')->constrained();
    });
```

O método `foreignId` cria uma coluna equivalente de tipo `UNSIGNED BIGINT`, ao passo que o método `constrained` utiliza convenções para determinar a tabela e a coluna sendo referenciada. Caso seu nome de tabela não corresponda às convenções do Laravel, você pode fornecer manualmente ao método `constrained`. Além disso, você também pode especificar o nome da coluna gerada:

```php
    Schema::table('posts', function (Blueprint $table) {
        $table->foreignId('user_id')->constrained(
            table: 'users', indexName: 'posts_user_id'
        );
    });
```

Você também pode especificar a ação desejada para as propriedades "*on delete*" e "*on update*" de uma restrição:

```php
    $table->foreignId('user_id')
          ->constrained()
          ->onUpdate('cascade')
          ->onDelete('cascade');
```

Uma sintaxe alternativa e expressiva também está disponível para estas ações:

| Método                        | Descrição                                                             |
|-------------------------------|-----------------------------------------------------------------------|
| `$table->cascadeOnUpdate();`  | As atualizações devem ocorrer em cascata.                             |
| `$table->restrictOnUpdate();` | As atualizações devem ser restritas.                                  |
| `$table->noActionOnUpdate();` | Nenhuma ação sobre atualizações.                                      |
| `$table->cascadeOnDelete();`  | As exclusões devem ocorrer em cascata.                                |
| `$table->restrictOnDelete();` | Exclusões devem ser restritas.                                        |
| `$table->nullOnDelete();`     | As exclusões devem definir o valor da chave estrangeira como nulo.    |

Todos os modificadores de [coluna](#column-modifiers) adicionais devem ser chamados antes do método `constrain`:

```php
    $table->foreignId('user_id')
          ->nullable()
          ->constrained();
```

<a name="dropping-foreign-keys"></a>
#### Removendo Chaves Estrangeiras

Para eliminar uma chave estrangeira, você pode utilizar o método `dropForeign`, passando como argumento o nome da restrição de chave estrangeira que pretende eliminar. As restrições de chaves estrangeiras seguem o mesmo esquema de nomenclatura dos índices: ou seja, o nome da restrição de chave estrangeira é baseado no nome da tabela e colunas na restrição, seguido pelo sufixo `\_foreign`:

```php
    $table->dropForeign('posts_user_id_foreign');
```

Alternativamente, você pode passar uma matriz contendo o nome da coluna que contém a chave estrangeira para o método `dropForeign`. A matriz será convertida em um nome de restrição estrangeira usando as convenções de nomenclatura do Laravel:

```php
    $table->dropForeign(['user_id']);
```

<a name="toggling-foreign-key-constraints"></a>
#### Alternando Restrições de Chave Estrangeira

Você pode habilitar ou desabilitar restrições de chave estrangeira dentro de suas migrações usando os seguintes métodos:

```php
    Schema::enableForeignKeyConstraints();

    Schema::disableForeignKeyConstraints();

    Schema::withoutForeignKeyConstraints(function () {
        // Restrições desabilitadas dentro deste *closure*...
    });
```

::: warning ALERTA
O SQLite desabilita restrições de chave estrangeira por padrão. Ao usar o SQLite, certifique-se de [ativar suporte de chaves estrangeiras](/docs/database#configuration) na sua configuração do banco de dados antes de tentar criá-las em suas migrações. Além disso, o SQLite só suporta chaves estrangeiras ao criar a tabela e não quando as tabelas são alteradas [https://www.sqlite.org/omitted.html].
:::

<a name="events"></a>
## Eventos

Para conveniência, cada operação de migração enviará um [evento](/docs/events). Todos os seguintes eventos estendem a classe base `Illuminate\Database\Events\MigrationEvent`:

| Classe                                            | Descrição                                                     |
|---------------------------------------------------|---------------------------------------------------------------|
| `Illuminate\Database\Events\MigrationsStarted`    | Um lote de migrações está prestes a ser executado.            |
| `Illuminate\Database\Events\MigrationsEnded`      | Um lote de migrações terminou de ser executado.               |
| `Illuminate\Database\Events\MigrationStarted`     | Uma única migração está prestes a ser executada.              |
| `Illuminate\Database\Events\MigrationEnded`       | Uma única migração terminou de ser executada.                 |
| `Illuminate\Database\Events\NoPendingMigrations`  | Um comando de migração não encontrou migrações pendentes.     |
| `Illuminate\Database\Events\SchemaDumped`         | Um dump de esquema de banco de dados foi concluído.           |
| `Illuminate\Database\Events\SchemaLoaded`         | Um dump de esquema de banco de dados existente foi carregado. |
