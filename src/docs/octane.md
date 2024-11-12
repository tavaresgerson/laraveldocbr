# Laravel Octane

<a name="introduction"></a>
## Introdução

[Laravel Octane](https://github.com/laravel/octane) turbina o desempenho do seu aplicativo servindo-o usando servidores de aplicativos de alta potência, incluindo [FrankenPHP](https://frankenphp.dev/), [Open Swoole](https://openswoole.com/), [Swoole](https://github.com/swoole/swoole-src) e [RoadRunner](https://roadrunner.dev). O Octane inicializa seu aplicativo uma vez, o mantém na memória e, em seguida, o alimenta com solicitações em velocidades supersônicas.

<a name="installation"></a>
## Instalação

O Octane pode ser instalado por meio do gerenciador de pacotes do Composer:

```shell
composer require laravel/octane
```

Após instalar o Octane, você pode executar o comando Artisan `octane:install`, que instalará o arquivo de configuração do Octane em seu aplicativo:

```shell
php artisan octane:install
```

<a name="server-prerequisites"></a>
## Pré-requisitos do servidor

::: warning ATENÇÃO
O Laravel Octane requer [PHP 8.1+](https://php.net/releases/).
:::

<a name="frankenphp"></a>
### FrankenPHP

[FrankenPHP](https://frankenphp.dev) é um servidor de aplicativos PHP, escrito em Go, que oferece suporte a recursos modernos da web, como dicas iniciais, Brotli e compactação Zstandard. Quando você instala o Octane e escolhe FrankenPHP como seu servidor, o Octane automaticamente baixa e instala o binário FrankenPHP para você.

<a name="frankenphp-via-laravel-sail"></a>
#### FrankenPHP via Laravel Sail

Se você planeja desenvolver seu aplicativo usando [Laravel Sail](/docs/sail), você deve executar os seguintes comandos para instalar o Octane e o FrankenPHP:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane
```

Em seguida, você deve usar o comando Artisan `octane:install` para instalar o binário FrankenPHP:

```shell
./vendor/bin/sail artisan octane:install --server=frankenphp
```

Finalmente, adicione uma variável de ambiente `SUPERVISOR_PHP_COMMAND` à definição de serviço `laravel.test` no arquivo `docker-compose.yml` do seu aplicativo. Esta variável de ambiente conterá o comando que o Sail usará para servir seu aplicativo usando o Octane em vez do servidor de desenvolvimento PHP:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=frankenphp --host=0.0.0.0 --admin-port=2019 --port=80" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

Para habilitar HTTPS, HTTP/2 e HTTP/3, aplique estas modificações:

```yaml
services:
  laravel.test:
    ports:
        - '${APP_PORT:-80}:80'
        - '${VITE_PORT:-5173}:${VITE_PORT:-5173}'
        - '443:443' # [tl! add]
        - '443:443/udp' # [tl! add]
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --host=localhost --port=443 --admin-port=2019 --https" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

Normalmente, você deve acessar seu aplicativo FrankenPHP Sail via `https://localhost`, pois usar `https://127.0.0.1` requer configuração adicional e é [desencorajado](https://frankenphp.dev/docs/known-issues/#using-https127001-with-docker).

<a name="frankenphp-via-docker"></a>
#### FrankenPHP via Docker

Usar as imagens oficiais do Docker do FrankenPHP pode oferecer melhor desempenho e o uso de extensões adicionais não incluídas nas instalações estáticas do FrankenPHP. Além disso, as imagens oficiais do Docker oferecem suporte para executar o FrankenPHP em plataformas que ele não suporta nativamente, como o Windows. As imagens oficiais do Docker do FrankenPHP são adequadas para desenvolvimento local e uso em produção.

Você pode usar o seguinte Dockerfile como ponto de partida para conteinerizar seu aplicativo Laravel com tecnologia FrankenPHP:

```dockerfile
FROM dunglas/frankenphp

RUN install-php-extensions \
    pcntl
    # Adicione outras extensões PHP aqui...

COPY . /app

ENTRYPOINT ["php", "artisan", "octane:frankenphp"]
```

Então, durante o desenvolvimento, você pode utilizar o seguinte arquivo Docker Compose para executar seu aplicativo:

```yaml
# compose.yaml
services:
  frankenphp:
    build:
      context: .
    entrypoint: php artisan octane:frankenphp --max-requests=1
    ports:
      - "8000:8000"
    volumes:
      - .:/app
```

Você pode consultar [a documentação oficial do FrankenPHP](https://frankenphp.dev/docs/docker/) para obter mais informações sobre como executar o FrankenPHP com o Docker.

<a name="roadrunner"></a>
### RoadRunner

[RoadRunner](https://roadrunner.dev) é alimentado pelo binário RoadRunner, que é construído usando Go. Na primeira vez que você iniciar um servidor Octane baseado em RoadRunner, o Octane oferecerá o download e a instalação do binário RoadRunner para você.

<a name="roadrunner-via-laravel-sail"></a>
#### RoadRunner via Laravel Sail

Se você planeja desenvolver seu aplicativo usando [Laravel Sail](/docs/sail), você deve executar os seguintes comandos para instalar o Octane e o RoadRunner:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner-cli spiral/roadrunner-http 
```

Em seguida, você deve iniciar um shell Sail e usar o executável `rr` para recuperar a última compilação baseada em Linux do binário RoadRunner:

```shell
./vendor/bin/sail shell

# Dentro do Sail shell...
./vendor/bin/rr get-binary
```

Então, adicione uma variável de ambiente `SUPERVISOR_PHP_COMMAND` à definição de serviço `laravel.test` no arquivo `docker-compose.yml` do seu aplicativo. Esta variável de ambiente conterá o comando que o Sail usará para servir seu aplicativo usando o Octane em vez do servidor de desenvolvimento PHP:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port=80" # [tl! add]
```

Finalmente, garanta que o binário `rr` seja executável e crie suas imagens Sail:

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

Se você planeja usar o servidor de aplicativos Swoole para servir seu aplicativo Laravel Octane, você deve instalar a extensão Swoole PHP. Normalmente, isso pode ser feito via PECL:

```shell
pecl install swoole
```

<a name="openswoole"></a>
#### Open Swoole

Se você deseja usar o servidor de aplicativos Open Swoole para servir seu aplicativo Laravel Octane, você deve instalar a extensão Open Swoole PHP. Normalmente, isso pode ser feito via PECL:

```shell
pecl install openswoole
```

Usar o Laravel Octane com o Open Swoole concede a mesma funcionalidade fornecida pelo Swoole, como tarefas simultâneas, ticks e intervalos.

<a name="swoole-via-laravel-sail"></a>
#### Swoole via Laravel Sail

::: warning ATENÇÃO
Antes de servir um aplicativo Octane via Sail, certifique-se de ter a versão mais recente do Laravel Sail e execute `./vendor/bin/sail build --no-cache` no diretório raiz do seu aplicativo.
:::

Como alternativa, você pode desenvolver seu aplicativo Octane baseado em Swoole usando [Laravel Sail](/docs/sail), o ambiente de desenvolvimento oficial baseado em Docker para Laravel. O Laravel Sail inclui a extensão Swoole por padrão. No entanto, você ainda precisará ajustar o arquivo `docker-compose.yml` usado pelo Sail.

Para começar, adicione uma variável de ambiente `SUPERVISOR_PHP_COMMAND` à definição de serviço `laravel.test` no arquivo `docker-compose.yml` do seu aplicativo. Esta variável de ambiente conterá o comando que o Sail usará para servir seu aplicativo usando o Octane em vez do servidor de desenvolvimento PHP:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port=80" # [tl! add]
```

Finalmente, crie suas imagens Sail:

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Configuração do Swoole

O Swoole suporta algumas opções de configuração adicionais que você pode adicionar ao seu arquivo de configuração `octane` se necessário. Como raramente precisam ser modificadas, essas opções não estão incluídas no arquivo de configuração padrão:

```php
'swoole' => [
    'options' => [
        'log_file' => storage_path('logs/swoole_http.log'),
        'package_max_length' => 10 * 1024 * 1024,
    ],
],
```

<a name="serving-your-application"></a>
## Servindo seu aplicativo

O servidor Octane pode ser iniciado por meio do comando Artisan `octane:start`. Por padrão, esse comando utilizará o servidor especificado pela opção de configuração `server` do arquivo de configuração `octane` do seu aplicativo:

```shell
php artisan octane:start
```

Por padrão, o Octane iniciará o servidor na porta 8000, para que você possa acessar seu aplicativo em um navegador da Web por meio de `http://localhost:8000`.

<a name="serving-your-application-via-https"></a>
### Servindo seu aplicativo via HTTPS

Por padrão, os aplicativos executados via Octane geram links prefixados com `http://`. A variável de ambiente `OCTANE_HTTPS`, usada no arquivo de configuração `config/octane.php` do seu aplicativo, pode ser definida como `true` ao servir seu aplicativo via HTTPS. Quando esse valor de configuração é definido como `true`, o Octane instruirá o Laravel a prefixar todos os links gerados com `https://`:

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### Servindo seu aplicativo via Nginx

::: info NOTA
Se você não estiver pronto para gerenciar sua própria configuração de servidor ou não estiver confortável configurando todos os vários serviços necessários para executar um aplicativo Laravel Octane robusto, confira [Laravel Forge](https://forge.laravel.com).
:::

Em ambientes de produção, você deve servir seu aplicativo Octane por trás de um servidor web tradicional, como Nginx ou Apache. Isso permitirá que o servidor web sirva seus ativos estáticos, como imagens e folhas de estilo, bem como gerencie a terminação do seu certificado SSL.

No exemplo de configuração do Nginx abaixo, o Nginx servirá os ativos estáticos do site e as solicitações de proxy para o servidor Octane que está sendo executado na porta 8000:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name domain.com;
    server_tokens off;
    root /home/forge/domain.com/public;

    index index.php;

    charset utf-8;

    location /index.php {
        try_files /not_exists @octane;
    }

    location / {
        try_files $uri $uri/ @octane;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    access_log off;
    error_log  /var/log/nginx/domain.com-error.log error;

    error_page 404 /index.php;

    location @octane {
        set $suffix "";

        if ($uri = /index.php) {
            set $suffix ?$query_string;
        }

        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header SERVER_PORT $server_port;
        proxy_set_header REMOTE_ADDR $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_pass http://127.0.0.1:8000$suffix;
    }
}
```

<a name="watching-for-file-changes"></a>
### Observando as alterações de arquivo

Como seu aplicativo é carregado na memória uma vez quando o servidor Octane é iniciado, quaisquer alterações nos arquivos do seu aplicativo não serão refletidas quando você atualizar seu navegador. Por exemplo, as definições de rota adicionadas ao seu arquivo `routes/web.php` não serão refletidas até que o servidor seja reiniciado. Para sua conveniência, você pode usar o sinalizador `--watch` para instruir o Octane a reiniciar automaticamente o servidor em quaisquer alterações de arquivo dentro do seu aplicativo:

```shell
php artisan octane:start --watch
```

Antes de usar este recurso, você deve garantir que o [Node](https://nodejs.org) esteja instalado em seu ambiente de desenvolvimento local. Além disso, você deve instalar a biblioteca de monitoramento de arquivos [Chokidar](https://github.com/paulmillr/chokidar) em seu projeto:

```shell
npm install --save-dev chokidar
```

Você pode configurar os diretórios e arquivos que devem ser monitorados usando a opção de configuração `watch` no arquivo de configuração `config/octane.php` do seu aplicativo.

<a name="specifying-the-worker-count"></a>
### Especificando a contagem de trabalhadores

Por padrão, o Octane iniciará um trabalhador de solicitação de aplicativo para cada núcleo de CPU fornecido pela sua máquina. Esses trabalhadores serão usados ​​para atender às solicitações HTTP recebidas conforme elas entram no seu aplicativo. Você pode especificar manualmente quantos workers você gostaria de iniciar usando a opção `--workers` ao invocar o comando `octane:start`:

```shell
php artisan octane:start --workers=4
```

Se você estiver usando o servidor de aplicativos Swoole, você também pode especificar quantos ["task workers"](#concurrent-tasks) você deseja iniciar:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>
### Especificando a Contagem Máxima de Solicitações

Para ajudar a evitar vazamentos de memória, o Octane reinicia graciosamente qualquer worker depois de ter manipulado 500 solicitações. Para ajustar esse número, você pode usar a opção `--max-requests`:

```shell
php artisan octane:start --max-requests=250
```

<a name="reloading-the-workers"></a>
### Recarregando os Workers

Você pode reiniciar normalmente os workers de aplicativos do servidor Octane usando o comando `octane:reload`. Normalmente, isso deve ser feito após a implantação para que seu código recém-implantado seja carregado na memória e usado para atender a solicitações subsequentes:

```shell
php artisan octane:reload
```

<a name="stopping-the-server"></a>
### Parando o servidor

Você pode parar o servidor Octane usando o comando Artisan `octane:stop`:

```shell
php artisan octane:stop
```

<a name="checking-the-server-status"></a>
#### Verificando o status do servidor

Você pode verificar o status atual do servidor Octane usando o comando Artisan `octane:status`:

```shell
php artisan octane:status
```

<a name="dependency-injection-and-octane"></a>
## Injeção de dependência e Octane

Como o Octane inicializa seu aplicativo uma vez e o mantém na memória enquanto atende às solicitações, há algumas ressalvas que você deve considerar ao criar seu aplicativo. Por exemplo, os métodos `register` e `boot` dos provedores de serviço do seu aplicativo serão executados apenas uma vez quando o trabalhador da solicitação inicializar. Em solicitações subsequentes, a mesma instância do aplicativo será reutilizada.

Em vista disso, você deve tomar cuidado especial ao injetar o contêiner de serviço do aplicativo ou a solicitação no construtor de qualquer objeto. Ao fazer isso, esse objeto pode ter uma versão obsoleta do contêiner ou da solicitação em solicitações subsequentes.

O Octane manipulará automaticamente a redefinição de qualquer estado de estrutura primária entre as solicitações. No entanto, o Octane nem sempre sabe como redefinir o estado global criado pelo seu aplicativo. Portanto, você deve estar ciente de como criar seu aplicativo de uma forma amigável ao Octane. Abaixo, discutiremos as situações mais comuns que podem causar problemas ao usar o Octane.

<a name="container-injection"></a>
### Injeção de contêiner

Em geral, você deve evitar injetar o contêiner de serviço do aplicativo ou a instância de solicitação HTTP nos construtores de outros objetos. Por exemplo, a seguinte vinculação injeta todo o contêiner de serviço do aplicativo em um objeto que é vinculado como um singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Registre quaisquer serviços de aplicação.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app);
    });
}
```

Neste exemplo, se a instância `Service` for resolvida durante o processo de inicialização do aplicativo, o contêiner será injetado no serviço e esse mesmo contêiner será mantido pela instância `Service` em solicitações subsequentes. Isso **pode** não ser um problema para seu aplicativo específico; no entanto, pode levar o contêiner a perder inesperadamente vinculações que foram adicionadas posteriormente no ciclo de inicialização ou por uma solicitação subsequente.

Como solução alternativa, você pode parar de registrar a vinculação como um singleton ou injetar um *closure* de resolvedor de contêiner no serviço que sempre resolve a instância de contêiner atual:

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app);
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance());
});
```

O auxiliar global `app` e o método `Container::getInstance()` sempre retornarão a versão mais recente do contêiner do aplicativo.

<a name="request-injection"></a>
### Injeção de solicitação

Em geral, você deve evitar injetar o contêiner de serviço do aplicativo ou a instância de solicitação HTTP nos construtores de outros objetos. Por exemplo, a seguinte vinculação injeta a instância de solicitação inteira em um objeto que é vinculado como um singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Registre quaisquer serviços de aplicação.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app['request']);
    });
}
```

Neste exemplo, se a instância `Service` for resolvida durante o processo de inicialização do aplicativo, a solicitação HTTP será injetada no serviço e essa mesma solicitação será mantida pela instância `Service` em solicitações subsequentes. Portanto, todos os cabeçalhos, entradas e dados de string de consulta estarão incorretos, assim como todos os outros dados de solicitação.

Como solução alternativa, você pode parar de registrar a vinculação como um singleton ou injetar um *closure* de resolução de solicitação no serviço que sempre resolve a instância de solicitação atual. Ou a abordagem mais recomendada é simplesmente passar as informações de solicitação específicas que seu objeto precisa para um dos métodos do objeto em tempo de execução:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app['request']);
});

$this->app->singleton(Service::class, function (Application $app) {
    return new Service(fn () => $app['request']);
});

// Ou...

$service->method($request->input('name'));
```

O auxiliar global `request` sempre retornará a solicitação que o aplicativo está manipulando no momento e, portanto, é seguro para uso em seu aplicativo.

::: warning ATENÇÃO
É aceitável dar uma dica de tipo na instância `Illuminate\Http\Request` em seus métodos de controlador e fechamentos de rota.
:::

<a name="configuration-repository-injection"></a>
### Injeção de repositório de configuração

Em geral, você deve evitar injetar a instância do repositório de configuração nos construtores de outros objetos. Por exemplo, a seguinte ligação injeta o repositório de configuração em um objeto que é ligado como um singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Registre quaisquer serviços de aplicação.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app->make('config'));
    });
}
```

Neste exemplo, se os valores de configuração mudarem entre as solicitações, esse serviço não terá acesso aos novos valores porque depende da instância do repositório original.

Como solução alternativa, você pode parar de registrar a ligação como um singleton ou pode injetar um *closure* de resolvedor de repositório de configuração na classe:

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app->make('config'));
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance()->make('config'));
});
```

O `config` global sempre retornará a versão mais recente do repositório de configuração e, portanto, é seguro para uso em seu aplicativo.

<a name="managing-memory-leaks"></a>
### Gerenciando vazamentos de memória

Lembre-se, o Octane mantém seu aplicativo na memória entre as solicitações; portanto, adicionar dados a uma matriz mantida estaticamente resultará em um vazamento de memória. Por exemplo, o controlador a seguir tem um vazamento de memória, pois cada solicitação ao aplicativo continuará adicionando dados à matriz estática `$data`:

```php
use App\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Handle an incoming request.
 */
public function index(Request $request): array
{
    Service::$data[] = Str::random(10);

    return [
        // ...
    ];
}
```

Ao construir seu aplicativo, você deve tomar cuidado especial para evitar criar esses tipos de vazamentos de memória. É recomendável que você monitore o uso de memória do seu aplicativo durante o desenvolvimento local para garantir que não esteja introduzindo novos vazamentos de memória em seu aplicativo.

<a name="concurrent-tasks"></a>
## Tarefas simultâneas

::: warning ATENÇÃO
Este recurso requer [Swoole](#swoole).
:::

Ao usar o Swoole, você pode executar operações simultaneamente por meio de tarefas leves em segundo plano. Você pode fazer isso usando o método `concurrently` do Octane. Você pode combinar este método com a desestruturação de array PHP para recuperar os resultados de cada operação:

```php
use App\Models\User;
use App\Models\Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

Tarefas simultâneas processadas pelo Octane utilizam os "task workers" do Swoole e são executadas em um processo totalmente diferente da solicitação recebida. A quantidade de workers disponíveis para processar tarefas simultâneas é determinada pela diretiva `--task-workers` no comando `octane:start`:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

Ao invocar o método `concurrently`, você não deve fornecer mais de 1024 tarefas devido às limitações impostas pelo sistema de tarefas do Swoole.

<a name="ticks-and-intervals"></a>
## Ticks e intervalos

::: warning ATENÇÃO
Este recurso requer [Swoole](#swoole).
:::

Ao usar o Swoole, você pode registrar operações "tick" que serão executadas a cada número especificado de segundos. Você pode registrar retornos de chamada "tick" por meio do método `tick`. O primeiro argumento fornecido ao método `tick` deve ser uma string que representa o nome do ticker. O segundo argumento deve ser um callable que será invocado no intervalo especificado.

Neste exemplo, registraremos um encerramento a ser invocado a cada 10 segundos. Normalmente, o método `tick` deve ser chamado dentro do método `boot` de um dos provedores de serviço do seu aplicativo:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10);
```

Usando o método `immediate`, você pode instruir o Octane a invocar imediatamente o retorno de chamada tick quando o servidor Octane inicializar inicialmente e a cada N segundos depois disso:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10)
        ->immediate();
```

<a name="the-octane-cache"></a>
## O cache Octane

::: warning ATENÇÃO
Este recurso requer [Swoole](#swoole).
:::

Ao usar o Swoole, você pode aproveitar o driver de cache Octane, que fornece velocidades de leitura e gravação de até 2 milhões de operações por segundo. Portanto, este driver de cache é uma excelente escolha para aplicativos que precisam de velocidades extremas de leitura/gravação de sua camada de cache.

Este driver de cache é alimentado por [tabelas Swoole](https://www.swoole.co.uk/docs/modules/swoole-table). Todos os dados armazenados no cache estão disponíveis para todos os trabalhadores no servidor. No entanto, os dados em cache serão liberados quando o servidor for reiniciado:

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

::: info NOTA
O número máximo de entradas permitidas no cache Octane pode ser definido no arquivo de configuração `octane` do seu aplicativo.
:::

<a name="cache-intervals"></a>
### Intervalos de cache

Além dos métodos típicos fornecidos pelo sistema de cache do Laravel, o driver de cache Octane apresenta caches baseados em intervalo. Esses caches são atualizados automaticamente no intervalo especificado e devem ser registrados no método `boot` de um dos provedores de serviço do seu aplicativo. Por exemplo, o seguinte cache será atualizado a cada cinco segundos:

```php
use Illuminate\Support\Str;

Cache::store('octane')->interval('random', function () {
    return Str::random(10);
}, seconds: 5);
```

<a name="tables"></a>
## Tabelas

::: warning ATENÇÃO
Este recurso requer [Swoole](#swoole).
:::

Ao usar o Swoole, você pode definir e interagir com suas próprias [tabelas Swoole](https://www.swoole.co.uk/docs/modules/swoole-table) arbitrárias. As tabelas Swoole fornecem rendimento de desempenho extremo e os dados nessas tabelas podem ser acessados ​​por todos os trabalhadores no servidor. No entanto, os dados dentro delas serão perdidos quando o servidor for reiniciado.

As tabelas devem ser definidas na matriz de configuração `tables` do arquivo de configuração `octane` do seu aplicativo. Uma tabela de exemplo que permite um máximo de 1000 linhas já está configurada para você. O tamanho máximo de colunas de string pode ser configurado especificando o tamanho da coluna após o tipo de coluna, conforme visto abaixo:

```php
'tables' => [
    'example:1000' => [
        'name' => 'string:1000',
        'votes' => 'int',
    ],
],
```

Para acessar uma tabela, você pode usar o método `Octane::table`:

```php
use Laravel\Octane\Facades\Octane;

Octane::table('example')->set('uuid', [
    'name' => 'Nuno Maduro',
    'votes' => 1000,
]);

return Octane::table('example')->get('uuid');
```

::: warning ATENÇÃO
Os tipos de coluna suportados pelas tabelas Swoole são: `string`, `int` e `float`.
:::
