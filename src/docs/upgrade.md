# Guia de atualização

## Mudanças de grande impacto

- [Atualizando dependências](#updating-dependencies)
- [Estrutura da Aplicação](#application-structure)
- [Tipos de ponto flutuante (floating point types)](#floating-point-types)
- [Modificar Colunas](#modifying-columns)
- [Versão mínima do SQLite](#sqlite-minimum-version)
- [Atualizando o Sanctum](#updating-sanctum)

## Mudanças de impacto médio


- [ Carbon 3](#carbon-3)
- [Reorganizar senhas](#password-rehashing)
- [Limitação de taxa por segundo](rate limiting)

## Mudanças de baixo impacto

- [Remoção de Doctrine DBAL](#doctrine-dbal-removal)
- [Método de conversão do modelo Eloquent](#eloquent-model-casts-method)
- [Tipos espaciais](#spatial-types)
- [Pacote Spatie One](#spatie-once-package)
- [Contrato Enumerável](#the-enumerable-contract)
- [Contrato `UserProvider`](#the-user-provider-contract)
- [Contrato `Autenticável`](#the-authenticatable-contract)

## Atualizar de 10.x para 11.0

#### Tempo estimado de atualização: 15 minutos

::: info NOTA
Tentamos documentar todas as alterações significativas possíveis. Como algumas dessas alterações importantes estão em partes obscuras da estrutura, apenas uma parte dessas alterações pode realmente afetar seu aplicativo. Quer economizar tempo? Você pode usar o [Laravel Shift](https://laravelshift.com/) para ajudar a automatizar as atualizações do seu aplicativo.
:::

### Atualização das dependências

**Probabilidade de impacto: alta**

#### PHP 8.2.0 é necessário

Agora o Laravel requer um PHP igual ou superior a 8.2.0.

#### curl 7.34.0 Obrigatório

Agora o cliente de HTTP do Laravel exige a versão curl 7.34.0 ou superior.

#### Dependências do composer

Deve atualizar as seguintes dependências no seu ficheiro do Composer `composer.json`:

 - `laravel/framework` para `^11.0`
 - `nunomaduro/collision` para `^8.1`
 - `laravel/breeze` para `^2.0` (Se instalado).
 `- laravel/cashier` para `^15.0` (Se instalado).
 - `laravel/dusk` para `^8.0` (Se instalado)
 `- laravel/jetstream` para `^5.0` (Se instalado)
 - `laravel/octane`: para `^2.3` (Se instalado).
 - `laravel/passport` para `^12.0` (Se instalado)
 - `laravel/sanctum` para `^4.0` (Se instalado)
 `- laravel/scout` para `^10.0` (se instalado)
 - `laravel/spark-stripe` para `^5.0` (Se instalado)
 `- laravel/telescope`, para `^5.0` (se instalado)
 - `inertiajs/inertia-laravel` para `^1.0` (se instalado)

Se o seu aplicativo estiver usando Laravel Cashier, Passport, Sanctum, Spark Stripe ou Telescope, você precisará publicar suas migrações para seu aplicativo. O Cashier, Passport, Sanctum, Spark Stripe e Telescope **não carregam mais automaticamente as migrações do seu diretório de migrações**. Portanto, execute o seguinte comando para publicar suas migrações no aplicativo:

```bash
php artisan vendor:publish --tag=cashier-migrations
php artisan vendor:publish --tag=passport-migrations
php artisan vendor:publish --tag=sanctum-migrations
php artisan vendor:publish --tag=spark-migrations
php artisan vendor:publish --tag=telescope-migrations
```

Além disso, você deve revisar os guias de atualização para cada um destes pacotes para garantir que você esteja ciente das mudanças adicionais.

- [Laravel Cashier Stripe](#cashier-stripe)
- [Laravel Passport](#passport)
- [Laravel Sanctum](#sanctum)
- [Laravel Spark Stripe](#spark-stripe)
- [Laravel Telescope](#telescope)

Se você tiver instalado o instalador do Laravel manualmente, deverá atualizar o instalador por meio do Composer:

```bash
composer global require laravel/installer:^5.6
```

 Finalmente, você pode remover a dependência do Composer `doctrine/dbal` se já tiver adicionado a sua aplicação, pois o Laravel não depende mais desse pacote.

### Estrutura do Aplicativo

O Laravel 11 apresenta uma nova estrutura de aplicação com menos ficheiros padrão. Na prática, novas aplicações do Laravel possuem menos serviços providers, middlewares e arquivos de configuração.

No entanto, **não recomendamos** que aplicações do Laravel 10 que estejam a fazer uma atualização para o Laravel 11 procurem migrar sua estrutura de aplicação, já que o Laravel 11 foi cuidadosamente desenvolvido para suportar também a estrutura da aplicação do Laravel 10.

### Autenticação

#### Recriptografar senha

O Laravel 11 irá automaticamente reprocessar as senhas de um usuário durante a autenticação caso o algoritmo de hashing tenha tido alterações significativas desde que a senha foi processada pela última vez.

Geralmente, isso não deve interromper o aplicativo; no entanto, você pode desabilitar esse comportamento adicionando a opção `rehash_on_login` ao arquivo de configuração do seu aplicativo em `config/hashing.php`:

```php
    'rehash_on_login' => false,
```

#### Contrato do `UserProvider`

**Possibilidade de ocorrência: baixa**

O contrato `Illuminate\Contracts\Auth\UserProvider` recebeu um novo método, chamado `rehashPasswordIfRequired`. Esse método é responsável por reprocessar e armazenar a senha do usuário no banco de dados quando o fator de trabalho do algoritmo de hashing da aplicação mudou.

Se o seu pacote ou aplicativo definir uma classe que implemente essa interface, deve adicionar o novo método `rehashPasswordIfRequired` na sua implementação. Uma implementação de referência pode ser encontrada na classe `Illuminate\Auth\EloquentUserProvider`.

```php
public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false);
```

#### Contrato `Authenticatable`

**Provável impacto: Baixo**

O contrato `Illuminate\Contracts\Auth\Authenticatable` recebeu um novo método chamado `getAuthPasswordName`. Este método é responsável por retornar o nome da coluna de senha do objeto que você deseja autenticar.

Se o seu pacote ou aplicação definir uma classe que implemente esta interface, deve adicionar a nova metodologia `getAuthPasswordName` à sua implementação:

```php
public function getAuthPasswordName()
{
    return 'password';
}
```

O modelo de usuário padrão incluído no Laravel recebe automaticamente esse método, uma vez que está incluso na trait `Illuminate\Auth\Authenticatable`.

#### A classe `AuthenticationException`

**Probabilidade de impacto: muito baixa**

O método `redirectTo` da classe `Illuminate\Auth\AuthenticationException` agora requer uma instância de `Illuminate\Http\Request` como seu primeiro argumento. Se você estiver capturando essa exceção manualmente e chamando o método `redirectTo`, você deve atualizar seu código em conformidade:

```php
if ($e instanceof AuthenticationException) {
    $path = $e->redirectTo($request);
}
```

### Cache

#### Prefixos para os caches chave

**Possibilidade de impacto: muito baixa**

Anteriormente, se um prefixo da chave do cache for definido para o armazenamento de cache DynamoDB, Memcached ou Redis, o Laravel iria adicionar um `:` ao prefixo. No Laravel 11, o prefixo da chave de cache não recebe o sufixo `:`. Se desejar manter o comportamento de prefixação anterior, você pode adicionar manualmente o sufixo `:` ao seu prefixo de chave do cache.

### Coleções

#### Contrato do `Enumerable`

**Probabilidade de impacto: Baixa**

O método `dump` do contrato `Illuminate\Support\Enumerable` foi atualizado para aceitar um argumento variável `...$args`. Se você estiver implementando essa interface, deverá atualizar sua implantação em conformidade:

```php
public function dump(...$args);
```

### Base de dados

#### SQLite 3.35.0+

**Probabilidade de impacto: Alta**

Se o seu aplicativo estiver a utilizar uma base de dados SQLite, será necessário que esteja instalada a versão SQLite 3.35.0 ou superior.

#### Método de conversão do modelo Eloquent

**Probabilidade de impacto: Baixa**

A classe modelo Eloquent básica define agora um método `casts` para suportar a definição de atributos convertidos. Se um dos modelos da aplicação definir uma relação `casts`, pode haver conflito com o método `casts` presente na classe modelo Eloquent básica.

#### Modificar Colunas

**Probabilidade de impacto: Alta**

Agora, ao modificar uma coluna, você deve incluir explicitamente todos os atributos que deseja manter na definição da coluna após a alteração. Os atributos ausentes serão excluídos. Por exemplo, para manter o atributo `unsigned`, `default` e `comment`, você deve chamar cada um dos atributos explicitamente ao alterar a coluna, mesmo que os atributos tenham sido atribuídos à coluna por uma migração anterior.

Por exemplo, imagine que você tenha uma migração que crie a coluna `votes` com os atributos `unsigned`, `default` e `comment`.

```php
Schema::create('users', function (Blueprint $table) {
    $table->integer('votes')->unsigned()->default(1)->comment('The vote count');
});
```

Depois, você escreve uma migração que muda essa coluna para ser também `nullable`:

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')->nullable()->change();
});
```

Na versão 10 do Laravel, essa migração manteria os atributos `unsigned`, `default` e `comment` na coluna. No entanto, a partir da versão 11, a migração deve incluir todos os atributos que foram definidos anteriormente na coluna; caso contrário, eles serão apagados:

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')
        ->unsigned()
        ->default(1)
        ->comment('The vote count')
        ->nullable()
        ->change();
});
```

O método `change` não altera os índices da coluna, portanto, você pode usar o modificador de índice para adicionar ou remover um índice explicitamente ao modificar a coluna.

```php
// Adiciona um índice...
$table->bigIncrements('id')->primary()->change();

// Remove um índice...
$table->char('postal_code', 10)->unique(false)->change();
```

Se você não quiser atualizar todas as migrações de alteração existentes em seu aplicativo para reter os atributos existentes da coluna, você pode simplesmente [reduzir suas migrações](/docs/migrations#squashing-migrations):

```bash
php artisan schema:dump
```

Depois que suas migrações tiverem sido combinadas, o Laravel irá "migrar" o banco de dados usando o arquivo de esquema do seu aplicativo antes de executar quaisquer migrações pendentes.

<a name="floating-point-types"></a>
#### Tipos de ponto flutuante

**Probabilidade de impacto: alta**

Os tipos de coluna de migração `double` e `float` foram reescritos para serem consistentes em todos os bancos de dados.

O tipo de coluna `double` cria agora uma coluna equivalente a `DOUBLE` sem dígitos totais e posições (dígitos após o ponto decimal), que é a sintaxe SQL padrão. Portanto, você pode remover os argumentos para `$total` e `$places`:

```php
$table->double('amount');
```

O tipo de coluna `float` agora cria uma coluna equivalente a `FLOAT`, sem números totais e posições (números após o ponto decimal), mas com uma especificação opcional `$precision` para determinar o tamanho de armazenamento como uma coluna de 4 bytes de precisão única ou uma coluna de 8 bytes de dupla precisão. Portanto, você pode remover os argumentos para `$total` e `$places`, além da especificação opcional `$precision`, no valor desejado, conforme a documentação do seu banco de dados:

```php
$table->float('amount', precision: 53);
```

Os métodos `unsignedDecimal`, `unsignedDouble`, e `unsignedFloat` foram removidos, pois o atributo semiefeito para esses tipos de coluna foi descontinuado pelo MySQL. Além disso, esse atributo nunca foi padronizado em outros sistemas de banco de dados. No entanto, se você quiser continuar usando o atributo descontinuado para esses tipos de coluna, pode acoplar o método `unsigned` na definição da coluna:

```php
$table->decimal('amount', total: 8, places: 2)->unsigned();
$table->double('amount')->unsigned();
$table->float('amount', precision: 53)->unsigned();
```

#### Driver dedicado para MariaDB

**Probabilidade de impacto: muito baixa**

Ao invés de utilizar sempre o driver do MySQL quando conectado ao bancos de dados MariaDB, o Laravel 11 adicionou um driver dedicado para os mesmos.

Se o seu aplicativo estiver conectado a um banco de dados MariaDB, você poderá atualizar a configuração da conexão para o novo driver `mariadb` para aproveitar as funcionalidades específicas do MariaDB no futuro.

```php
    'driver' => 'mariadb',
    'url' => env('DB_URL'),
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '3306'),
    // ...
```

Atualmente, o novo driver para MariaDB funciona da mesma forma que o atual driver para MySQL com uma exceção: a método de construção do esquema `uuid` cria colunas UUID nativas em vez de colunas `char(36)`.

Se você utilizar o esquema construtor de schema `uuid` em suas migrações e escolher usar o novo driver do banco de dados `mariadb`, deve atualizar as invocações da `uuid` para `char` nas suas migrações, a fim de evitar alterações ou comportamentos inesperados:

```php
Schema::table('users', function (Blueprint $table) {
    $table->char('uuid', 36);

    // ...
});
```

#### Tipos Espaciais

**Probabilidade de impacto: Baixa**

Os tipos de coluna espacial de migração de banco de dados foram re-escritos para serem consistentes entre todos os bancos de dados. Por conseguinte, pode remover os métodos `point`, `lineString`, `polygon`, `geometryCollection`, `multiPoint`, `multiLineString`, `multiPolygon` e `multiPolygonZ` das suas migrações e usar, em vez disso, métodos `geometry` ou `geography`:

```php
$table->geometry('shapes');
$table->geography('coordinates');
```

Para restringir explicitamente o tipo ou identificador de sistema de referência espacial para valores armazenados na coluna em MySQL, MariaDB e PostgreSQL, você pode passar os parâmetros `subtype` e `srid` ao método:

```php
$table->geometry('dimension', subtype: 'polygon', srid: 0);
$table->geography('latitude', subtype: 'point', srid: 4326);
```

Os modificadores de coluna `isGeometry` e `projection` da gramática do PostgreSQL foram, respetivamente, removidos.

<a name="doctrine-dbal-removal"></a>
#### Remoção do Doctrine DBAL

**Probabilidade de ocorrência: Baixa**

A lista a seguir apresenta as classes e métodos relacionados com o DBAL Doctrine que foram removidos. O Laravel não depende mais desse pacote e é desnecessário registrar tipos personalizados de doutrina para criação e alteração adequada dos vários tipos de coluna que exigiam tipos personalizados:

- Propriedade da classe `Illuminate\Database\Schema\Builder::$alwaysUsesNativeSchemaOperationsIfPossible`
- Método `Illuminate\Database\Schema\Builder::useNativeSchemaOperationsIfPossible()`
- Método `Illuminate\\Database\\Connection::usingNativeSchemaOperations()`
- Método `Illuminate\Database\Connection::isDoctrineAvailable()`
- Método `Illuminate\Database\Connection::getDoctrineConnection()`
- Método `Illuminate\Database\Connection::getDoctrineSchemaManager()`
- Método `Illuminate\Database\Connection::getDoctrineColumn()`
- Método `Illuminate\Database\Connection::registerDoctrineType()`
- Método `Illuminate\Database\DatabaseManager::registerDoctrineType()`
- Diretório `Illuminate\Database\PDO`
- Classe `Illuminate\Database\DBAL\TimestampType`
- classe `Illuminate\Database\Schema\Grammars\ChangeColumn`
- Classe `Illuminate\Database\Schema\Grammars\RenameColumn`
- método `Illuminate\Database\Schema\Grammars\Grammar::getDoctrineTableDiff()`

Além disso, não é mais necessário registrar tipos personalizados Doctrine por meio de `dbal.types` no arquivo de configuração do seu aplicativo, na pasta "database".

Se você estava usando o Doctrine DBAL para inspecionar seu banco de dados e suas tabelas associadas, pode usar agora os novos métodos nativos do Laravel (`Schema::getTables()`, `Schema::getColumns()`, `Schema::getIndexes()`, `Schema::getForeignKeys()`, etc.).

#### Métodos de Esquema desativados

**Probabilidade de impacto: muito baixa**

Os métodos Doctrine suportados obsoletos, `Schema::getAllTables()`, `Schema::getAllViews()` e `Schema::getAllTypes()`, foram removidos em favor dos novos métodos nativos do Laravel: `Schema::getTables()`, `Schema::getViews()` e `Schema::getTypes()`.

Ao usar o PostgreSQL e o SQL Server, nenhum dos novos métodos de esquema aceitará uma referência com três partes (por exemplo, `database.schema.table`). Portanto, você deve usar a função `connection()` para declarar o banco de dados:

```php
Schema::connection('database')->hasTable('schema.table');
```

#### Método `getColumnType()` do Schema Builder

**Probabilidade de impacto: muito baixa**

O método `Schema::getColumnType()` agora sempre retorna o tipo real da coluna indicada, não o tipo equivalente do Doctrine DBAL.

#### Interface de conexão do banco de dados

**Provável ocorrência de impacto: muito baixo**

A interface `Illuminate\Database\ConnectionInterface` recebeu um novo método `scalar`. Se você estiver definindo sua própria implementação dessa interface, é preciso adicionar o método `scalar` à sua implementação.

```php
public function scalar($query, $bindings = [], $useReadPdo = true);
```

### Datas

#### Carbono 3

**Probabilidade de impacto: média**

O Laravel 11 suporta a biblioteca de manipulação de datas Carbon 2 e Carbon 3. O Carbon é uma biblioteca de manipulação de data utilizada extensivamente pelo Laravel e por pacotes em todo o ecossistema. Se você atualizar para a Carbon 3, tenha cuidado com os métodos `diffIn*`, que agora retornam números flutuantes e podem retornar valores negativos para indicar o sentido de tempo, o que é uma mudança significativa em relação à Carbon 2. Revise o [registro de alterações](https://github.com/briannesbitt/Carbon/releases/tag/3.0.0) dp Carbon para obter informações detalhadas sobre como lidar com essas e outras mudanças.

### E-mail

#### Contrato `Mailer`

**Probabilidade de impacto: Muito baixa**

O contrato `Illuminate\Contracts\Mail\Mailer` recebeu um novo método `sendNow`. Se sua aplicação ou pacote estiver implementando esse contrato manualmente, você deve adicionar o novo método `sendNow` em sua implementação:

```php
public function sendNow($mailable, array $data = [], $callback = null);
```

### Pacotes

#### Publicando Providers em sua aplicação

 **Probabilidade de impacto: muito baixa**

Se você escreveu um pacote do Laravel que publica manualmente um provedor de serviços para o diretório `app/Providers` do aplicativo e modifica manualmente o arquivo de configuração `config/app.php` do aplicativo para registrar o provedor de serviços, você deve atualizar seu pacote para utilizar o novo método `ServiceProvider::addProviderToBootstrapFile`.

O método `addProviderToBootstrapFile` adiciona automaticamente o provedor de serviços publicado ao arquivo `bootstrap/providers.php` do aplicativo, uma vez que a matriz `providers` não existe no arquivo de configuração `config/app.php` em novos aplicativos Laravel 11.

```php
use Illuminate\Support\ServiceProvider;

ServiceProvider::addProviderToBootstrapFile(Provider::class);
```

### Filas

#### A interface `BatchRepository`

**Probabilidade de impacto: muito baixa**

A interface `Illuminate\Bus\BatchRepository` recebeu um novo método `rollBack`. Se você estiver implementando essa interface em seu próprio pacote ou aplicativo, deverá adicionar esse método à sua implementação:

```php
public function rollBack();
```

#### Trabalhos síncronos em transações de base de dados

**Provável impacto: muito baixo**

Anteriormente, os trabalhos síncronos (usando o driver de fila `sync`) executavam-se imediatamente, independentemente da configuração da opção `after_commit` da conexão da fila estiver definida como `true` ou se o método `afterCommit` tiver sido invocado na ligação.

Agora, em Laravel 11, os trabalhos de fila síncronos respeitarão a configuração "after commit" da conexão ou do trabalho de fila.

### Limitação da velocidade

#### Limitação de taxa por segundo

**Probabilidade de impacto: Média**

O Laravel 11 suporta limitação de taxas por segundo em vez de ser limitado ao minuto. Há uma variedade de possíveis alterações que você deve estar ciente relacionadas a esta mudança.

O construtor da classe `GlobalLimit` agora aceita segundos em vez de minutos. Esta classe não está documentada e, normalmente, sua aplicação não a usa:

```php
new GlobalLimit($attempts, 2 * 60);
```

Agora, o construtor da classe `Limit` aceita segundos em vez de minutos. Todos os usos documentados dessa classe são limitados a construtores estáticos, como `Limit::perMinute` e `Limit::perSecond`. No entanto, se você estiver instanciando essa classe manualmente, deve atualizar seu aplicativo para fornecer segundos ao construtor da classe:

```php
new Limit($key, $attempts, 2 * 60);
```

A propriedade `decayMinutes` da classe `Limit` foi renomeada para `decaySeconds` e agora contém segundos em vez de minutos.

Os construtores de classes `Illuminate\Queue\Middleware\ThrottleExceptions` e `Illuminate\Queue\Middleware\ThrottleExceptionsWithRedis`, agora aceitam segundos em vez de minutos.

```php
new ThrottlesExceptions($attempts, 2 * 60);
new ThrottlesExceptionsWithRedis($attempts, 2 * 60);
```

### Cashier Stripe

#### Atualizando o Cashier Stripe

**Probabilidade de impacto: Alta**

O Laravel 11 não suporta mais o Cashier Stripe 14.x. Portanto, você deve atualizar a dependência do Laravel Cashier Stripe da sua aplicação para "^15.0" em seu arquivo `composer.json`.

O Stripe 15.0 não carrega mais automaticamente as migrações do seu diretório de migrações. Em vez disso, você deve executar o comando abaixo para publicar as migrações do Stripe em sua aplicação:

```shell
php artisan vendor:publish --tag=cashier-migrations
```

Revise o guia de atualização completo do [Cashier Stripe](https://github.com/laravel/cashier-stripe/blob/15.x/UPGRADE.md) para obter alterações que possam ter efeitos negativos.

### Spark (Stripe)

#### Atualizar Spark Stripe

**Probabilidade de impacto: Alta**

O Laravel 11 não suporta mais o Laravel Spark Stripe 4.x. Por conseguinte, você deve atualizar a dependência do Spark Stripe para `^5.0` em seu arquivo `composer.json`.

O Spark Stripe 5.0 já não carrega automaticamente as migrações do seu próprio diretório de migrações. Em vez disso, deve executar o seguinte comando para publicar as migrações do Spark Stripe no aplicativo:

```shell
php artisan vendor:publish --tag=spark-migrations
```

Revise o [guia de atualização do Spark Stripe completo](https://spark.laravel.com/docs/spark-stripe/upgrade.html) para alterações adicionais.

### Passaporte

#### Atualizar o passaporte

**Probabilidade de impacto: alta**

O Laravel 11 não suporta mais o Laravel Passport 11.x. Portanto, você deve atualizar a dependência do Laravel Passport de seu aplicativo para `^12.0` no arquivo `composer.json`.

O Passport 12.0 não carrega mais as migrações automaticamente do diretório de migração da sua própria aplicação. Em vez disso, você deve executar o seguinte comando para publicar as migrações do Passport em seu aplicativo:

```shell
php artisan vendor:publish --tag=passport-migrations
```

Além disso, o tipo de autorização por senha é desativado por padrão. Você pode ativá-lo chamando o método `enablePasswordGrant` no método `boot` do seu aplicativo `AppServiceProvider`:

```php
public function boot(): void
{
    Passport::enablePasswordGrant();
}
```

### Sanctum

#### Atualizando o Sanctum

**Probabilidade de um impacto: elevada**

O Laravel 11 não suporta mais o Laravel Sanctum 3.x. Por conseguinte, você deve atualizar a dependência do Laravel Sanctum de sua aplicação para `^4.0` em seu arquivo `composer.json`.

O Sanctum 4.0 não carrega mais as migrações automaticamente a partir do seu diretório de migração. Em vez disso, você deve executar o comando seguinte para publicar as migrações do Sanctum em sua aplicação:

```shell
php artisan vendor:publish --tag=sanctum-migrations
```

Em seguida, na pasta de configuração do seu aplicativo, o `config/sanctum.php`, você deve atualizar as referências às middlewares `authenticate_session`, `encrypt_cookies` e `validate_csrf_token` para a seguinte:

```php
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],
```

### Telescope

#### Atualização do Telescope

**Provável impacto: Alto**

O Laravel 11 não suporta mais o Laravel Telescope 4.x. Portanto, você deve atualizar a dependência do Telescope Laravel de sua aplicação para `^5.0` em seu arquivo `composer.json`.

O Telescope 5.0 já não carrega automaticamente as migrações do seu próprio diretório de migrações. Em vez disso, deverá executar o comando seguinte para publicar as migrações do Telescópio na sua aplicação:

```shell
php artisan vendor:publish --tag=telescope-migrations
```

### Pacote Spatie Once

**Probabilidade de impacto: Média**

O Laravel 11 agora possui sua própria função [`once`](/docs/helpers#metodo-once) para garantir que um determinado closure seja executado apenas uma vez. Portanto, se a aplicação depender do pacote `spatie/once`, você deve removê-lo do arquivo `composer.json` da aplicação para evitar conflitos.

### Diversos

Também o encorajamos a verificar as mudanças no [repositório do GitHub de `laravel/laravel`](https://github.com/laravel/laravel). Apesar das alterações não serem obrigatórias, pode ser interessante manter os ficheiros em sincronia com a aplicação. Algumas destas mudanças são abordadas neste guia de atualização, mas outras, como as alterações nos ficheiros de configuração ou nos comentários, não são. Pode verificar as mudanças facilmente com a [ferramenta de comparação do GitHub](https://github.com/laravel/laravel/compare/10.x...11.x) e escolher quais os updates que são importantes para si.
