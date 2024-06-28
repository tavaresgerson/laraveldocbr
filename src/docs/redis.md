# Redis

<a name="introduction"></a>
## Introdução

 O Redis é um servidor de estrutura de dados, open source e avançado, com armazenamento de chave/valor. É referido frequentemente como um servidor de estruturas de dados visto que as suas chaves podem conter [strings](https://redis.io/docs/data-types/strings/), [hashes](https://redis.io/docs/data-types/hashes/), [lists](https://redis.io/docs/data-types/lists/), [sets](https://redis.io/docs/data-types/sets/) e [sorted sets](https://redis.io/docs/data-types/sorted-sets/).

 Antes de utilizar o Redis com Laravel, recomendamos que instale e utilize a extensão PHP [PhpRedis](https://github.com/phpredis/phpredis) através do PECL. A instalação desta extensão é mais complexa em comparação com pacotes de PHP "user-land", mas pode gerar um melhor desempenho para aplicações que utilizam intensivamente o Redis. Se estiver a usar [Laravel Sail](/docs/sail), esta extensão já está instalada no contêiner Docker da sua aplicação.

 Se você não conseguir instalar a extensão PhpRedis, poderá instalar o pacote `predis/predis` através do Composer. Predis é um cliente Redis escrito inteiramente em PHP e não requer nenhuma extensão adicional:

```shell
composer require predis/predis:^2.0
```

<a name="configuration"></a>
## Configuração

 Você pode configurar as configurações do Redis de sua aplicação usando o arquivo de configuração `config/database.php`. Nesse arquivo, você verá um array chamado `redis` que contém os servidores Redis usados pela sua aplicação:

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

 Todos os servidores Redis definidos no arquivo de configuração são obrigados a ter um nome, um anfitrião e uma porta, exceto se você definir uma única URL para representar a conexão com o Redis:

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
#### Configurando um esquema de conexão

 Por padrão, os clientes Redis usarão o esquema `tcp` ao se conectarem aos seus servidores Redis; no entanto, você pode usar criptografia TLS/SSL especificando uma opção de configuração `scheme` em seu array de configurações do servidor Redis:

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
### Cluster

 Se o seu aplicativo estiver utilizando um cluster de servidores Redis, você deve definir esses clusters dentro da chave `clusters` da sua configuração Redis. Esta chave de configuração não existe por padrão, então é preciso criá-la no arquivo de configuração do seu aplicativo `config/database.php`:

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

 Por padrão, o Laravel utilizará o agrupamento nativo do Redis uma vez que o valor da configuração `options.cluster` está definido como `redis`. O agrupamento do Redis é uma ótima opção por padrão, pois ele faz um failover com maestria.

 O Laravel também oferece suporte a partilha no lado do cliente. No entanto, a partilha no lado do cliente não inclui falhas; portanto, é mais adequado para dados temporários armazenados em cache que estejam disponíveis num repositório de dados primário diferente.

 Se você deseja usar o agrupamento do lado do cliente em vez do agrupamento nativo do Redis, poderá remover o valor de configuração `options.cluster` no arquivo de configuração `config/database.php` da sua aplicação:

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

 Se você deseja que seu aplicativo interaja com o Redis através do pacote Predis, deve garantir que o valor da variável de ambiente `REDIS_CLIENT` seja "predis":

```php
    'redis' => [

        'client' => env('REDIS_CLIENT', 'predis'),

        // ...
    ],
```

 Além das opções de configuração padrão, Predis suporta [parâmetros de conexão] (https://github.com/nrk/predis/wiki/Connection-Parameters) adicionais que podem ser definidos para cada um dos seus servidores Redis. Para utilizar essas opções de configuração adicionais, adicione-os à sua configuração do servidor Redis no arquivo de configuração `config/database.php` da aplicação:

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

 Por padrão, o Laravel utilizará a extensão PhpRedis para se comunicar com o Redis. O cliente que será utilizado pelo Laravel para se comunicar com o Redis é determinado pela opção de configuração `redis.client`, que normalmente reflete o valor da variável ambiental `REDIS_CLIENT`:

```php
    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        // ...
    ],
```

 Além das opções de configuração padrão, o PhpRedis suporta os seguintes parâmetros adicionais de conexão: `name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `timeout` e `context`. Você pode adicionar qualquer uma dessas opções à sua configuração do servidor Redis no arquivo de configuração `config/database.php`:

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
#### Seriamente e compressão de dados em PhpRedis

 A extensão PhpRedis também pode ser configurada para usar uma variedade de formatação e algoritmos de compressão. Esses algoritmos podem ser configurados através da matriz `options` da sua configuração Redis:

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

 Atualmente, os serializadores suportados incluem: `Redis::SERIALIZER_NONE` (por padrão), `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY`, e `Redis::SERIALIZER_MSGPACK`.

 Os algoritmos de compressão incluem os seguintes valores: `Redis::COMPRESSION_NONE` (padrão), `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD` e `Redis::COMPRESSION_LZ4`.

<a name="interacting-with-redis"></a>
## Interagindo com o Redis

 Você pode interagir com o Redis chamando vários métodos do `Redis` [facade](/docs/facades). O `Redis` facade suporta métodos dinâmicos, o que significa que você pode chamar qualquer [comando Redis](https://redis.io/commands) no facade e o comando será passado diretamente ao Redis. Neste exemplo, chamaremos o comando `GET` do Redis, chamando o método `get` do facade:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\Redis;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Show the profile for the given user.
         */
        public function show(string $id): View
        {
            return view('user.profile', [
                'user' => Redis::get('user:profile:'.$id)
            ]);
        }
    }
```

 Como mencionado anteriormente, é possível chamar qualquer comando de Redis na interface `Redis`. O Laravel utiliza métodos mágicos para passar os comandos ao servidor Redis. Se um comando de Redis espera argumentos, você deve passá-los para o método correspondente da facade:

```php
    use Illuminate\Support\Facades\Redis;

    Redis::set('name', 'Taylor');

    $values = Redis::lrange('names', 5, 10);
```

 Como alternativa, você pode enviar comandos para o servidor utilizando o método `command`, da interface `Redis`, que aceita como primeiro parâmetro o nome do comando e como segundo um array de valores.

```php
    $values = Redis::command('lrange', ['name', 5, 10]);
```

<a name="using-multiple-redis-connections"></a>
#### Usando várias conexões com o Redis

 O arquivo de configuração do aplicativo `config/database.php` permite definir várias conexões/servidores Redis. Você pode obter uma conexão com um servidor Redis específico usando o método `connection` da facade `Redis`:

```php
    $redis = Redis::connection('connection-name');
```

 Para obter uma instância da conexão padrão do Redis, você pode chamar o método `connection` sem qualquer argumento adicional:

```php
    $redis = Redis::connection();
```

<a name="transactions"></a>
### Transações

 O método `transaction` da facade do `Redis` fornece uma embalagem conveniente em torno dos comandos nativos `MULTI` e `EXEC` do Redis. O método `transaction` aceita um closure como seu único argumento. Esse closure receberá uma instância de conexão com o Redis e poderá emitir quaisquer comandos que desejar para essa instância. Todos os comandos emissos no interior do closure serão executados numa única transação atómica:

```php
    use Redis;
    use Illuminate\Support\Facades;

    Facades\Redis::transaction(function (Redis $redis) {
        $redis->incr('user_visits', 1);
        $redis->incr('total_visits', 1);
    });
```

 > [!ALERTA]
 > Ao definir uma transação do Redis, você não pode recuperar valores da conexão Redis. Lembre-se que sua transação será executada como uma única operação atômica e que essa operação só será executada depois que todos os comandos de seu bloqueio tiverem sido concluídos.

#### Scripts do Lua

 O método `eval` fornece outro método de execução de comandos Redis em uma única operação, mas esse método permite interagir e inspecionar os valores das chaves durante a operação. Os scripts do Redis são escritos no [linguagem de programação Lua](https://www.lua.org).

 O método `eval` pode assustar um pouco à primeira vista, mas vamos explorar um exemplo básico para quebrar o gelo. O método `eval` espera vários argumentos. Primeiro, você deve passar o script de Lua (como uma string) ao método. Em seguida, você deve passar o número de chaves (como um inteiro) com as quais o script interage. Por último, é possível passar qualquer outro argumento adicional que seja necessário acessar em seu script.

 Neste exemplo, iremos incrémentar um contador, inspecionar o seu novo valor e incrémentar um segundo contador se o primeiro tiver um valor superior a cinco. Por último, devolveremos o valor do primeiro contador:

```php
    $value = Redis::eval(<<<'LUA'
        local counter = redis.call("incr", KEYS[1])

        if counter > 5 then
            redis.call("incr", KEYS[2])
        end

        return counter
    LUA, 2, 'first-counter', 'second-counter');
```

 > Atenção!
 Consulte o documento da Redis [Códigos de Comando](https://redis.io/commands/eval), para obter mais informações sobre a linguagem de script do Redis.

<a name="pipelining-commands"></a>
### Comandos de pipelining

 Às vezes você pode precisar executar dezenas de comandos do Redis. Em vez disso, usar o método `pipeline`. O método `pipeline` aceita um argumento: uma função que recebe uma instância do Redis. É possível enviar todos os seus comandos para essa instância e eles serão todos enviados ao servidor do Redis simultaneamente, reduzindo as viagens de rede ao servidor. Os comandos ainda serão executados na ordem que foram emitidos:

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
## Publicação / sub-publicação

 O Laravel disponibiliza uma interface conveniente para os comandos `publish` e `subscribe` do Redis. Estes comandos Redis permitem que você ouça mensagens em um determinado "canal". Você pode publicar mensagens no canal de outra aplicação, ou mesmo usando outra linguagem de programação, permitindo uma comunicação fácil entre aplicações e processos.

 Em primeiro lugar, vamos configurar um canal de leitura usando o método `subscribe`. Colocaremos esse pedido de método dentro de um comando [do Artisan](/docs/artisan), uma vez que chamar o método `subscribe` inicia um processo longo-duradouro:

```php
    <?php

    namespace App\Console\Commands;

    use Illuminate\Console\Command;
    use Illuminate\Support\Facades\Redis;

    class RedisSubscribe extends Command
    {
        /**
         * The name and signature of the console command.
         *
         * @var string
         */
        protected $signature = 'redis:subscribe';

        /**
         * The console command description.
         *
         * @var string
         */
        protected $description = 'Subscribe to a Redis channel';

        /**
         * Execute the console command.
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
#### Assinaturas Wildcards

 Usando o método `psubscribe`, você pode se inscrever em um canal de caractere wildcard. Isso é útil para capturar todas as mensagens de todos os canais. O nome do canal será passado como segundo argumento ao fecho fornecido:

```php
    Redis::psubscribe(['*'], function (string $message, string $channel) {
        echo $message;
    });

    Redis::psubscribe(['users.*'], function (string $message, string $channel) {
        echo $message;
    });
```
