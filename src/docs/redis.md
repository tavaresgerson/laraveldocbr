# Redis

<a name="introduction"></a>
## Introdução

[Redis](https://redis.io) é um armazenamento de chave-valor avançado de código aberto. Ele é frequentemente chamado de servidor de estrutura de dados, pois as chaves podem conter [strings](https://redis.io/docs/data-types/strings/), [hashes](https://redis.io/docs/data-types/hashes/), [listas](https://redis.io/docs/data-types/lists/), [conjuntos](https://redis.io/docs/data-types/sets/) e [conjuntos classificados](https://redis.io/docs/data-types/sorted-sets/).

Antes de usar o Redis com o Laravel, nós encorajamos a instalação e utilização da extensão PHP [PhpRedis](https://github.com/phpredis/phpredis) através do PECL. A extensão é mais complexa para instalar se comparado à pacotes "*user-land*" PHP, mas pode gerar melhor performance para aplicativos que usam muito o Redis. Se você estiver usando o [Laravel Sail](/docs/sail), essa extensão já está instalada no contêiner Docker da sua aplicação.

Se você não conseguir instalar a extensão PhpRedis, você pode instalar o pacote `predis/predis` através do Composer. O *Predis* é um cliente Redis escrito inteiramente em PHP e não necessita de nenhuma extensão adicional:

```shell
composer require predis/predis:^2.0
```

<a name="configuration"></a>
## Configuração

Você pode ajustar as configurações do seu aplicativo Redis através do arquivo de configuração `config/database.php`. Neste arquivo, você verá um *array* chamado `redis` contendo os servidores Redis utilizados por seu aplicativo:

```php
    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
        ],

        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],

        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],

    ],
```

Cada servidor Redis definido no arquivo de configuração é obrigado a ter um nome, host e uma porta, a menos que você defina um único URL para representar a conexão com o Redis.

```php
    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
        ],

        'default' => [
            'url' => 'tcp://127.0.0.1:6379?database=0',
        ],

        'cache' => [
            'url' => 'tls://user:password@127.0.0.1:6380?database=1',
        ],

    ],
```

<a name="configuring-the-connection-scheme"></a>
#### Configurar o esquema de conexão

Por padrão, os clientes do Redis usarão o esquema de TCP ao se conectar aos seus servidores Redis. No entanto, você pode usar o `scheme` de criptografia TLS/SSL especificando uma opção "configuração" no seu arquivo de configuração do servidor Redis:

```php
    'default' => [
        'scheme' => 'tls',
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
    ],
```

<a name="clusters"></a>
### Clusters

Se sua aplicação está utilizando um cluster de servidores Redis, você deve definir esses *clusters* dentro de uma chave `clusters` em seu arquivo de configuração do Redis. Essa chave não existe por padrão então você precisará criá-la dentro do arquivo de configuração da sua aplicação no `config/database.php`:

```php
    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
        ],

        'clusters' => [
            'default' => [
                [
                    'url' => env('REDIS_URL'),
                    'host' => env('REDIS_HOST', '127.0.0.1'),
                    'username' => env('REDIS_USERNAME'),
                    'password' => env('REDIS_PASSWORD'),
                    'port' => env('REDIS_PORT', '6379'),
                    'database' => env('REDIS_DB', '0'),
                ],
            ],
        ],

        // ...
    ],
```

Por padrão, o Laravel usará o Redis clustering nativo já que o valor da configuração `options.cluster` está definido como `redis`. O Redis clustering é uma ótima opção padrão, pois lida com o *failover* de maneira graciosa.

O Laravel também suporta fragmentação do lado do cliente. No entanto, a fragmentação do lado do cliente não manipula o *failover*; portanto, é adequado principalmente para dados em cache de curta duração que são acessados de outro repositório de dados principal.

Se quiser utilizar o *sharding* do lado do cliente em vez do cluster nativo Redis, você pode remover o valor de configuração em `options.cluster` dentro da sua aplicação no arquivo `config/database.php` de configuração:

```php
    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'clusters' => [
            // ...
        ],

        // ...
    ],
```

<a name="predis"></a>
### Predis

Se você quer que seu aplicativo interaja com o Redis através do pacote predis, você deve garantir que o valor da variável de ambiente `REDIS_CLIENT` é `predis`.

```php
    'redis' => [

        'client' => env('REDIS_CLIENT', 'predis'),

        // ...
    ],
```

Além das opções padrão de configuração, Predis oferece [parâmetros adicionais de conexão](https://github.com/nrk/predis/wiki/Connection-Parameters) que podem ser definidos para cada um dos seus servidores Redis. Para utilizar essas opções adicionais de configuração, adicione-as na configuração do seu servidor Redis no arquivo de configuração `config/database.php` em sua aplicação:

```php
    'default' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
        'read_write_timeout' => 60,
    ],
```

<a name="phpredis"></a>
### PhpRedis

Por padrão, o Laravel usará a extensão PHPRedis para se comunicar com o Redis. O cliente que o Laravel utilizará para se comunicar com o Redis é determinado pelo valor da opção de configuração `redis.client`, que normalmente reflete o valor da variável de ambiente `REDIS_CLIENT`:

```php
    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        // ...
    ],
```

Além das opções padrão de configuração, o PhpRedis suporta os seguintes parâmetros adicionais de conexão: `name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `timeout` e `context`. Você pode adicionar qualquer uma dessas opções ao arquivo de configuração do servidor Redis no arquivo de configuração `config/database.php`:

```php
    'default' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
        'read_timeout' => 60,
        'context' => [
            // 'auth' => ['username', 'secret'],
            // 'stream' => ['verify_peer' => false],
        ],
    ],
```

<a name="phpredis-serialization"></a>
#### PHPRedis Serialização e Compressão

A extensão do PHP Redis também pode ser configurada para usar uma variedade de serializadores e algoritmos de compressão. Esses algoritmos podem ser configurados através da matriz `options` da sua configuração do Redis:

```php
    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
            'serializer' => Redis::SERIALIZER_MSGPACK,
            'compression' => Redis::COMPRESSION_LZ4,
        ],

        // ...
    ],
```

Os serializadores suportados atualmente incluem: `Redis::SERIALIZER_NONE` (padrão), `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY` e `Redis::SERIALIZER_MSGPACK`.

Os algoritmos de compressão suportados incluem: `Redis::COMPRESSION_NONE` (padrão), `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD` e `Redis::COMPRESSION_LZ4`.

<a name="interacting-with-redis"></a>
## Interagindo com o Redis

Você pode interagir com o Redis chamando vários métodos da [*facade*](/docs/facades) `Redis`. A *facade* `Redis` suporta métodos dinâmicos, ou seja você pode chamar qualquer [comando Redis](https://redis.io/commands) na *facade* e o comando será passado diretamente para o Redis. Neste exemplo, invocaremos o comando `GET` do Redis que irá chamar o método `get` da *facade* `Redis`:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\Redis;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Mostrar o perfil do usuário fornecido.
         */
        public function show(string $id): View
        {
            return view('user.profile', [
                'user' => Redis::get('user:profile:'.$id)
            ]);
        }
    }
```

Como mencionado acima, você pode chamar qualquer um dos comandos do Redis na *facade* `Redis`. O Laravel usa métodos mágicos para passar os comandos para o servidor Redis. Se um comando Redis espera argumentos, você deve passar esses argumentos para o método correspondente da *facade*:

```php
    use Illuminate\Support\Facades\Redis;

    Redis::set('name', 'Taylor');

    $values = Redis::lrange('names', 5, 10);
```

Como alternativa, você pode passar comandos para o servidor usando o método `command` da *facade* `Redis`, que aceita o nome do comando como seu primeiro argumento e uma matriz de valores como seu segundo argumento:

```php
    $values = Redis::command('lrange', ['name', 5, 10]);
```

<a name="using-multiple-redis-connections"></a>
#### Usando Múltiplas Conexões Redis

O arquivo de configuração do `config/database.php` de sua aplicação permite que você defina múltiplas conexões ou servidores Redis. Você pode obter uma conexão com uma conexão específica de Redis usando o método `connection` da *facade* `Redis`:

```php
    $redis = Redis::connection('connection-name');
```

Para obter uma instância da conexão padrão do Redis, você pode chamar o método `connection` sem argumentos adicionais:

```php
    $redis = Redis::connection();
```

<a name="transactions"></a>
### Transações

O método `transaction` da *facade* `Redis` fornece um *wrapper* conveniente em torno dos comandos `MULTI` e `EXEC` nativos do Redis. O método `transaction` aceita um *closure* como seu único argumento. Este *closure* receberá uma instância de conexão Redis e pode emitir quaisquer comandos que desejar para esta instância. Todos os comandos Redis emitidos dentro do *closure* serão executados em uma única transação atômica:

```php
    use Redis;
    use Illuminate\Support\Facades;

    Facades\Redis::transaction(function (Redis $redis) {
        $redis->incr('user_visits', 1);
        $redis->incr('total_visits', 1);
    });
```

::: warning ALERTA
Ao definir uma transação Redis, você não pode recuperar nenhum valor da conexão Redis. Lembre-se, sua transação é executada como uma única operação atômica e essa operação não é executada até que todo o seu *closure* tenha terminado de executar seus comandos.
:::

#### Lua scripts

O método `eval` fornece outra forma de executar múltiplos comandos do Redis em uma única operação atômica. Contudo, o método `eval` tem a vantagem de permitir que interaja e inspecione valores das chaves do Redis durante essa operação. Os scripts Redis são escritos na [linguagem de programação Lua](https://www.lua.org).

O método `eval` pode ser um pouco assustador no começo, mas exploraremos um exemplo básico para quebrar o gelo. O método `eval` espera vários argumentos. Primeiro, você deve passar o script Lua (como uma string) para o método. Segundo, você deve passar o número de chaves (como um inteiro) com as quais o script interage. Terceiro, você deve passar os nomes dessas chaves. Finalmente, você pode passar quaisquer outros argumentos adicionais que você precisa acessar dentro do seu script.

Neste exemplo, incrementaremos um contador, inspecionaremos seu novo valor e incrementaremos um segundo contador se o valor do primeiro contador for maior que cinco. Finalmente, retornaremos o valor do primeiro contador:

```php
    $value = Redis::eval(<<<'LUA'
        local counter = redis.call("incr", KEYS[1])

        if counter > 5 then
            redis.call("incr", KEYS[2])
        end

        return counter
    LUA, 2, 'first-counter', 'second-counter');
```

::: warning ALERTA
Consulte a [documentação do Redis](https://redis.io/commands/eval) para obter mais informações sobre scripts do Redis.
:::

<a name="pipelining-commands"></a>
### Pipeline de Comandos

Às vezes você pode precisar executar dezenas de comandos do Redis. Em vez de fazer uma viagem de rede para o seu servidor Redis para cada comando, você pode usar o método `pipeline`. O método `pipeline` aceita um argumento: um *closure* que recebe uma instância do Redis. Você pode emitir todos os seus comandos para esta instância do Redis e eles serão enviados ao servidor do Redis ao mesmo tempo para reduzir as viagens de rede para o servidor. Os comandos ainda serão executados na ordem em que foram emitidos:

```php
    use Redis;
    use Illuminate\Support\Facades;

    Facades\Redis::pipeline(function (Redis $pipe) {
        for ($i = 0; $i < 1000; $i++) {
            $pipe->set("key:$i", $i);
        }
    });
```

<a name="pubsub"></a>
## Pub / Sub

Laravel oferece uma interface conveniente para os comandos Redis `publish` e `subscribe`. Esses comandos Redis permitem que você ouça mensagens em um determinado "canal". Você pode publicar mensagens no canal de outro aplicativo ou até mesmo usando outra linguagem de programação, permitindo fácil comunicação entre aplicativos e processos.

Primeiro, vamos configurar um ouvinte de canal usando o método 'subscribe'. Colocamos essa chamada do método dentro de um [comando Artisan](/docs/artisan) porque chamar o método `subscribe` inicia um processo demorado:

```php
    <?php

    namespace App\Console\Commands;

    use Illuminate\Console\Command;
    use Illuminate\Support\Facades\Redis;

    class RedisSubscribe extends Command
    {
        /**
         * O nome e a assinatura do comando do console.
         *
         * @var string
         */
        protected $signature = 'redis:subscribe';

        /**
         * A descrição do comando do console.
         *
         * @var string
         */
        protected $description = 'Subscribe to a Redis channel';

        /**
         * Execute o comando do console.
         */
        public function handle(): void
        {
            Redis::subscribe(['test-channel'], function (string $message) {
                echo $message;
            });
        }
    }
```

Agora podemos publicar mensagens no canal usando o método `publish`:

```php
    use Illuminate\Support\Facades\Redis;

    Route::get('/publish', function () {
        // ...

        Redis::publish('test-channel', json_encode([
            'name' => 'Adam Wathan'
        ]));
    });
```

<a name="wildcard-subscriptions"></a>
#### Assinaturas Wildcard

Usando o método `psubscribe`, você pode assinar um canal wildcard, que pode ser útil para capturar todas as mensagens em todos os canais. O nome do canal será passado como o segundo argumento para o *closure* fornecido:

```php
    Redis::psubscribe(['*'], function (string $message, string $channel) {
        echo $message;
    });

    Redis::psubscribe(['users.*'], function (string $message, string $channel) {
        echo $message;
    });
```
