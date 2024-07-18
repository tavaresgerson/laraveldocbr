# Navegador de Arquivos

## Introdução

Algumas das tarefas de recuperação ou processamento de dados realizadas pela sua aplicação podem exigir muita CPU ou demorar vários segundos para concluir. Nesse caso, é comum armazenar os dados recuperados em cache por um tempo para que possam ser recuperados rapidamente em solicitações subsequentes pelos mesmos dados. Os dados armazenados em cache geralmente são salvos em um repositório de dados muito rápido, como o Memcached ou o Redis.

A propósito, o Laravel fornece uma API expressiva e uniforme para vários servidores de armazenamento em cache, permitindo que você se beneficie da recuperação rápida de dados deles e acelere seu aplicativo web.

<a name="configuration"></a>
## Configuração

O arquivo de configuração do cache da aplicação está localizado em `config/cache.php`. Nele, você pode especificar qual armazenamento de cache deseja ser usado por padrão em toda a aplicação. O Laravel suporta backends de caching populares como [Memcached](https://memcached.org), [Redis](https://redis.io), [DynamoDB](https://aws.amazon.com/dynamodb) e bancos de dados relacionais fora da caixa. Além disso, um driver de cache baseado em arquivo está disponível, enquanto os drivers de cache "array" e "null" oferecem backends de cache convenientes para seus testes automáticos.

O arquivo de configuração do cache também contém uma variedade de outras opções que você pode analisar. Por padrão, o Laravel é configurado para usar o driver de cache "database", que armazena os objetos serializados e encriptados no banco de dados da aplicação.

<a name="driver-prerequisites"></a>
### Pré-requisitos do driver

<a name="prerequisites-database"></a>
#### Banco de dados

Para usar o driver de cache "database", você precisa ter uma tabela de banco de dados para conter os dados do cache. Normalmente, isto é incluído na migração padrão `0001_01_01_000001_create_cache_table.php` do Laravel [migração de banco de dados](/docs/migrations); no entanto, se sua aplicação não possuir essa migração, você poderá usar o comando Artisan `make:cache-table` para criá-la:

```shell
php artisan make:cache-table

php artisan migrate
```

<a name="memcached"></a>
#### Memcached

O uso do driver Memcached requer o [pacote PECL Memcached](https://pecl.php.net/package/memcached) para ser instalado. Você pode listar todos os seus servidores Memcached no arquivo de configuração `config/cache.php`. Esse arquivo já contém uma entrada `memcached.servers` para começar:

```php
    'memcached' => [
        // ...

        'servers' => [
            [
                'host' => env('MEMCACHED_HOST', '127.0.0.1'),
                'port' => env('MEMCACHED_PORT', 11211),
                'weight' => 100,
            ],
        ],
    ],
```

Se necessário, você pode definir a opção `host` para um caminho de soquete UNIX. Se você fizer isso, a opção `port` deverá ser definida como `0`:

```php
    'memcached' => [
        // ...

        'servers' => [
            [
                'host' => '/var/run/memcached/memcached.sock',
                'port' => 0,
                'weight' => 100
            ],
        ],
    ],
```

<a name="redis"></a>
#### Redis

Antes de usar um cache Redis com o Laravel, será necessário instalar a extensão PHP PhpRedis via PECL ou instalar o pacote `predis/predis` (~2.0) através do Composer. [Laravel Sail](/docs/sail) já inclui essa extensão. Além disso, as plataformas de implantação oficiais do Laravel, como o [Laravel Forge](https://forge.laravel.com) e o [Laravel Vapor](https://vapor.laravel.com), têm a extensão PhpRedis instalada por padrão.

Para mais informações sobre como configurar o Redis, consulte a página de documentação do [Redis no Laravel](/docs/redis#configuration).

<a name="dynamodb"></a>
#### DynamoDB

Antes de usar o driver de cache [DynamoDB](https://aws.amazon.com/dynamodb), você deve criar uma tabela DynamoDB para armazenar todos os dados do cache. Normalmente, essa tabela deve ser nomeada como `cache`. No entanto, você deve nomear a tabela com base no valor da configuração `stores.dynamodb.table` dentro do arquivo de configuração `cache`. O nome da tabela também pode ser definido pela variável de ambiente `DYNAMODB_CACHE_TABLE`.

Essa tabela também deve possuir uma chave de partição em string com um nome que corresponda ao valor do item de configuração `stores.dynamodb.attributes.key` dentro do arquivo de configuração `cache` da aplicação. Por padrão, a chave de partição deve ser denominada `key`.

Em seguida, instale o AWS SDK para que seu aplicativo Laravel possa se comunicar com a DynamoDB:

```shell
composer require aws/aws-sdk-php
```

Além disso, certifique-se de que os valores são fornecidos para as opções de configuração do armazenamento do cache DynamoDB. Normalmente, essas opções, como `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`, devem ser definidas no arquivo de configuração `.env` da aplicação:

```php
'dynamodb' => [
    'driver' => 'dynamodb',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => env('DYNAMODB_CACHE_TABLE', 'cache'),
    'endpoint' => env('DYNAMODB_ENDPOINT'),
],
```

<a name="cache-usage"></a>
## Uso do Cache

<a name="obtaining-a-cache-instance"></a>
### Obtendo uma instância de cache

Para obter uma instância do armazenamento de cache, é possível usar a facade `Cache`, que será usada ao longo desta documentação. A facade `Cache` fornece um acesso conveniente e conciso às implementações subjacentes dos contratos de cache do Laravel:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Support\Facades\Cache;

    class UserController extends Controller
    {
        /**
         * Mostre uma lista de todos os usuários do aplicativo.
         */
        public function index(): array
        {
            $value = Cache::get('key');

            return [
                // ...
            ];
        }
    }
```

<a name="accessing-multiple-cache-stores"></a>
#### Acessando vários repositórios de cache

Usando a facade `Cache`, você pode acessar vários repositórios de cache através do método `store`. A chave passada ao método `store` deve corresponder a um dos repositórios listados na matriz de configuração `stores` em seu arquivo de configuração `cache`:

```php
    $value = Cache::store('file')->get('foo');

    Cache::store('redis')->put('bar', 'baz', 600); // 10 Minutos
```

<a name="retrieving-items-from-the-cache"></a>
### Recuperar itens do cache

O método `get` da facade `Cache` é utilizado para recuperar itens do cache. Se o item não existir no cache, será retornado `null`. Caso queira, pode passar um segundo argumento ao método `get`, especificando o valor padrão que deseja que seja retornado caso o item não exista:

```php
    $value = Cache::get('key');

    $value = Cache::get('key', 'default');
```

É possível usar um bloqueio como valor padrão. Se o item especificado não existir no cache, o resultado do bloqueio será retornado. Ao passar um bloqueio, você pode adiar a obtenção de valores por padrão de um banco de dados ou outro serviço externo:

```php
    $value = Cache::get('key', function () {
        return DB::table(/* ... */)->get();
    });
```

<a name="determining-item-existence"></a>
#### Determinando a existência de um item

O método `has` pode ser utilizado para determinar se um item existe no cache. Se o item existir mas o seu valor for `null`, este método também irá retornar `false`:

```php
    if (Cache::has('key')) {
        // ...
    }
```

<a name="incrementing-decrementing-values"></a>
#### Aumentar/diminuir valores

Os métodos `increment` e `decrement` podem ser utilizados para ajustar o valor de itens inteiros no cache. Ambos os métodos aceitam um segundo argumento opcional que indica a quantidade em que se deve incrementar ou decrementar o valor do item:

```php
    // Inicialize o valor se ele não existir...
    Cache::add('key', 0, now()->addHours(4));

    // Aumentar ou diminuir o valor...
    Cache::increment('key');
    Cache::increment('key', $amount);
    Cache::decrement('key');
    Cache::decrement('key', $amount);
```

<a name="retrieve-store"></a>
#### Recuperar e armazenar

Às vezes pode ser necessário recuperar um item do cache, mas também guardar um valor por defeito caso o item solicitado não exista. Por exemplo, pode ser que seja necessário recuperar todos os utilizadores a partir do cache ou, no caso de eles não existirem, recuperá-los da base de dados e adicioná-los ao cache. Pode fazer isto usando o método `Cache::remember`:

```php
    $value = Cache::remember('users', $seconds, function () {
        return DB::table('users')->get();
    });
```

Se o elemento não existir na memória cache, será executado o closure passado para o método `remember` e seu resultado será colocado na memória cache.

Você pode usar o método `rememberForever` para recuperar um item do cache ou armazená-lo para sempre se ele não existir:

```php
    $value = Cache::rememberForever('users', function () {
        return DB::table('users')->get();
    });
```

<a name="retrieve-delete"></a>
#### Recuperar e excluir

Se você precisar recuperar um elemento do cache e depois excluí-lo, poderá usar o método `pull`. Assim como no caso do método `get`, será retornado `null` se o item não existir no cache:

```php
    $value = Cache::pull('key');

    $value = Cache::pull('key', 'default');
```

<a name="storing-items-in-the-cache"></a>
### Armazenar itens no cache

Você pode utilizar o método `put` na faceta do `Cache` para armazenar itens no cache:

```php
    Cache::put('key', 'value', $seconds = 10);
```

Se o tempo de armazenamento não for passado à função `put`, o item será armazenado indefinidamente:

```php
    Cache::put('key', 'value');
```

Em vez de passar o número de segundos como um inteiro, você também pode passar uma instância `DateTime` que representa o tempo de validade desejado dos itens armazenados no cache:

```php
    Cache::put('key', 'value', now()->addMinutes(10));
```

<a name="store-if-not-present"></a>
#### Armazenar se não estiver presente

O método `add` somente adiciona o item ao cache se ele ainda não existir no armazenamento de cache. Se o item tiver sido adicionado, o método retorna `true`. Caso contrário, o método retorna `false`. O método `add` é uma operação atômica:

```php
    Cache::add('key', 'value', $seconds);
```

<a name="storing-items-forever"></a>
#### Armazenar itens para sempre

O método `forever` pode ser usado para armazenar permanentemente um item no cache. Uma vez que esses itens não têm data de validade, eles devem ser removidos do cache manualmente com o uso do método `forget`:

```php
    Cache::forever('key', 'value');
```

::: info NOTA
Se você estiver utilizando o driver Memcached, os itens que são armazenados "para sempre" podem ser eliminados quando o limite do tamanho de cache for atingido.
:::

<a name="removing-items-from-the-cache"></a>
### Remoção de itens do cache

Você pode remover itens do cache usando o método `forget`:

```php
    Cache::forget('key');
```

Também é possível remover itens fornecendo um número de validade negativo ou zero:

```php
    Cache::put('key', 'value', 0);

    Cache::put('key', 'value', -5);
```

Você pode limpar o cache inteiro usando o método `flush`:

```php
    Cache::flush();
```

::: warning ATENÇÃO
Ao eliminar o cache, ele ignora seu "prefixo" de cache configurado e exclui todas as entradas do cache. Antecipe esta ação com cuidado ao limpar um cache compartilhado por outras aplicações.
:::

<a name="the-cache-helper"></a>
### O auxiliar cache

Além do uso da interface `Cache`, é possível também usar a função global `cache` para recuperar e armazenar dados através do cache. Quando a função `cache` for chamada com um único argumento do tipo string, ela retornará o valor da chave indicada:

```php
    $value = cache('key');
```

Se você fornecer uma matriz de pares chave/valor e um tempo de validade para a função, ela armazenará os valores no cache por um período especificado:

```php
    cache(['key' => 'value'], $seconds);

    cache(['key' => 'value'], now()->addMinutes(10));
```

Quando a função `cache` é chamada sem nenhum argumento, ela retorna uma instância da implementação de `Illuminate\Contracts\Cache\Factory`, permitindo que você chame outros métodos de armazenamento em cache:

```php
    cache()->remember('users', $seconds, function () {
        return DB::table('users')->get();
    });
```

::: info NOTA
Ao testar a chamada para a função global `cache`, você pode usar o método `Cache::shouldReceive` como se estivesse [testando a facade](/docs/mocking#mocking-facades).
:::

<a name="atomic-locks"></a>
## Bloqueios Atómicos

::: warning ATENÇÃO
Para utilizar este recurso, a aplicação deve usar o motor de memória `memcached`, `redis`, `dynamodb`, `database`, `file` ou `array`. Além disso, todos os servidores devem comunicar com o mesmo servidor central de cache.
:::

<a name="managing-locks"></a>
### Gerenciar bloqueios

Os bloqueios atômicos permitem a manipulação de bloqueios distribuídos sem se preocupar com condições de corrida. Por exemplo, o [Laravel Forge](https://forge.laravel.com) usa bloqueios atômicos para garantir que apenas uma tarefa remota seja executada num servidor a cada vez. Você pode criar e gerir os seus bloqueios utilizando o método `Cache::lock`:

```php
    use Illuminate\Support\Facades\Cache;

    $lock = Cache::lock('foo', 10);

    if ($lock->get()) {
        // Bloqueio adquirido por 10 segundos...

        $lock->release();
    }
```

O método `get` também aceita um bloqueio. Depois que o bloqueio for executado, o Laravel libera o bloqueio automaticamente:

```php
    Cache::lock('foo', 10)->get(function () {
        // Bloqueio adquirido por 10 segundos e liberado automaticamente...
    });
```

Se o bloqueio não estiver disponível no momento em que foi solicitado, você pode instruir o Laravel para esperar por um número especificado de segundos. Se o lock não puder ser adquirido dentro do limite de tempo especificado, uma `Illuminate\Contracts\Cache\LockTimeoutException` será lançada:

```php
    use Illuminate\Contracts\Cache\LockTimeoutException;

    $lock = Cache::lock('foo', 10);

    try {
        $lock->block(5);

        // Bloqueio adquirido após esperar no máximo 5 segundos...
    } catch (LockTimeoutException $e) {
        // Não foi possível adquirir o bloqueio...
    } finally {
        $lock?->release();
    }
```

O exemplo acima pode ser simplificado passando um closure para o método `block`. Quando um closure é passado para este método, O Laravel tentará adquirir o bloqueio por um número específico de segundos e liberá-lo automaticamente assim que o closure tiver sido executado:

```php
    Cache::lock('foo', 10)->block(5, function () {
        // Bloqueio adquirido após esperar no máximo 5 segundos...
    });
```

<a name="managing-locks-across-processes"></a>
### Gerir bloqueios em processos diferentes

Às vezes, você pode pretender adquirir um bloqueio num processo e liberá-lo noutro. Por exemplo, você pode adquirir um bloqueio durante uma solicitação Web e desejar liberar o bloqueio no final de um trabalho agendado que é acionado por essa solicitação. Neste cenário, se deve passar o "token do proprietário" associado ao bloqueio ao trabalho agendado para que este possa recriar o bloqueio utilizando o token fornecido.

No exemplo abaixo, será enviada uma tarefa aguardando o envio caso um bloqueio seja adquirido com sucesso. Além disso, passamos o token do proprietário do bloqueio para a tarefa aguardando através do método `owner` do bloqueio:

```php
    $podcast = Podcast::find($id);

    $lock = Cache::lock('processing', 120);

    if ($lock->get()) {
        ProcessPodcast::dispatch($podcast, $lock->owner());
    }
```

Na tarefa do nosso aplicativo `ProcessPodcast`, podemos restaurar e liberar o bloqueio usando o token do proprietário.

```php
    Cache::restoreLock('processing', $this->owner)->release();
```

Se você quiser liberar um bloqueio sem respeitar o atual proprietário, poderá usar o método `forceRelease`:

```php
    Cache::lock('processing')->forceRelease();
```

<a name="adding-custom-cache-drivers"></a>
## Adicionando drivers de cache personalizados

<a name="writing-the-driver"></a>
### Escrevendo o driver

Para criar nosso motor de cache personalizado, primeiro precisamos implementar o contrato `Illuminate\Contracts\Cache\Store`. Por isso, a implementação do cache do MongoDB pode parecer algo assim:

```php
    <?php

    namespace App\Extensions;

    use Illuminate\Contracts\Cache\Store;

    class MongoStore implements Store
    {
        public function get($key) {}
        public function many(array $keys) {}
        public function put($key, $value, $seconds) {}
        public function putMany(array $values, $seconds) {}
        public function increment($key, $value = 1) {}
        public function decrement($key, $value = 1) {}
        public function forever($key, $value) {}
        public function forget($key) {}
        public function flush() {}
        public function getPrefix() {}
    }
```

Basta implementar cada um destes métodos usando uma conexão MongoDB. Para saber como implementar cada um destes métodos, consulte o `Illuminate\Cache\MemcachedStore` no código-fonte do [framework Laravel](https://github.com/laravel/framework). Depois de terminarmos a nossa implementação, podemos concluir o registo do nosso driver personalizado chamando o método `extend` da facade `Cache`:

```php
    Cache::extend('mongo', function (Application $app) {
        return Cache::repository(new MongoStore);
    });
```

::: info NOTA
Se você se pergunta onde colocar o seu código de driver de cache personalizado, poderá criar um namespace `Extensions` dentro do diretório `app`. No entanto, tenha em mente que o Laravel não tem uma estrutura rígida da aplicação e você é livre para organizar sua aplicação conforme suas preferências.
:::

<a name="registering-the-driver"></a>
### Registrando o driver

Para registrar o driver de cache personalizado com Laravel, usaremos o método `extend` da facade `Cache`. Uma vez que outros provedores de serviços podem tentar ler os valores armazenados em cache no seu método `boot`, iremos registrar nosso driver personalizado dentro do um callback de `booting`. Usando o callback de `booting`, podemos garantir que o driver customizado seja registrado imediatamente antes da chamada ao método `boot` dos provedores de serviços da aplicação, mas depois da chamada ao método `register` para todos os provedores de serviços. Iremos registrar nosso callback de `booting` dentro do método `register` do `App\Providers\AppServiceProvider` da nossa aplicação:

```php
    <?php

    namespace App\Providers;

    use App\Extensions\MongoStore;
    use Illuminate\Contracts\Foundation\Application;
    use Illuminate\Support\Facades\Cache;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Registre quaisquer serviços de aplicativo.
         */
        public function register(): void
        {
            $this->app->booting(function () {
                 Cache::extend('mongo', function (Application $app) {
                     return Cache::repository(new MongoStore);
                 });
             });
        }

        /**
         * Inicialize qualquer serviço de aplicativo.
         */
        public function boot(): void
        {
            // ...
        }
    }
```

O primeiro argumento passado para o método `extend` é o nome do driver. Isso corresponde à opção `driver` no arquivo de configuração `config/cache.php`. O segundo argumento é um fechamento que deve retornar uma instância da classe `Illuminate\Cache\Repository`. O fechamento recebe como parâmetro a instância `$app`, que é uma instância do [conjunto de serviços](/docs/container).

Depois de sua extensão ser registrada, atualize a variável de ambiente `CACHE_STORE` ou a opção `default` dentro do arquivo de configuração da aplicação, `config/cache.php`, com o nome da sua extensão.

<a name="events"></a>
## Eventos

Para executar o código em todas as operações de memória transparente, você pode ouvir vários eventos [disponíveis](/docs/events), que são enviados pela memória transparente:

|  Nome do evento                         |
|-----------------------------------------|
| `Illuminate\Cache\Events\CacheHit`      |
| `Illuminate\Cache\Events\CacheMissed`   |
| `Illuminate\Cache\Events\KeyForgotten`  |
| `Illuminate\Cache\Events\KeyWritten`    |

Para aumentar o desempenho, você pode desativar eventos de cache definindo a opção de configuração `events` para `false` para um determinado armazenamento de cache no arquivo de configuração do seu aplicativo `config/cache.php`:

```php
'database' => [
    'driver' => 'database',
    // ...
    'events' => false,
],
```
