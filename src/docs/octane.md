# Laravel Octane

<a name="introduction"></a>
## Introdução

[Laravel Octane](https://github.com/laravel/octane) acelera o desempenho do seu aplicativo ao usar servidores de aplicativos de alto desempenho para servir seu aplicativo, incluindo [FrankenPHP](https://frankenphp.dev/), [Open Swoole](https://openswoole.com/), [Swoole](https://github.com/swoole/swoole-src) e [RoadRunner](https://roadrunner.dev). O Octane inicia seu aplicativo apenas uma vez, mantém-o na memória e então alimenta solicitações a velocidades supersônicas.

<a name="installation"></a>
## Instalação

O Octane pode ser instalado pelo gerenciador de pacotes Composer:

```shell
composer require laravel/octane
```

Após instalar o Octane, você pode executar o comando Artisan "octane:install", que irá instalar a configuração do Octane na sua aplicação:

```shell
php artisan octane:install
```

<a name="server-prerequisites"></a>
## Pré-requisitos do Servidor

> (!AVISO)
> Laravel Octane requer [PHP 8.1+] (https://php.net/releases/).

<a name="frankenphp"></a>
### FrankenPHP

FrankenPHP é um servidor de aplicativos PHP escrito em Go que suporta recursos modernos da web, como dicas precoces, Brotli e compressão Zstandard. Quando você instala o Octane e escolhe o FrankenPHP como seu servidor, o Octane baixará e instalará automaticamente o binário do FrankenPHP para você.

<a name="frankenphp-via-laravel-sail"></a>
#### FrankenPHP via Laravel Sail

Se planeja desenvolver sua aplicação usando o Laravel Sail, você deve executar os seguintes comandos para instalar o Octane e o FrankenPHP:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane
```

Em seguida, você deve usar o comando Artisan octane:install para instalar a binária FrankenPHP:

```shell
./vendor/bin/sail artisan octane:install --server=frankenphp
```

Por fim, adicione um `SUPERVISOR_PHP_COMMAND` variável ambiental a definição do serviço "laravel.test" no arquivo docker-compose.yml da sua aplicação. Esta variável ambiental irá conter o comando que Sail utilizará para servir sua aplicação usando Octane em vez do servidor de desenvolvimento PHP:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=frankenphp --host=0.0.0.0 --admin-port=2019 --port=80" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

Para habilitar HTTPS, HTTP/2 e HTTP/3, faça estas modificações em vez disso:

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

Tipicamente você deve acessar sua aplicação FrankenPHP Sail através de `https://localhost`, pois usar `https://127.0.0.1` exige uma configuração adicional e é [desaprovado](https://frankenphp.dev/docs/known-issues/#using-https127001-with-docker).

<a name="frankenphp-via-docker"></a>
#### FrankenPHP via Docker

Usando as imagens oficiais do FrankenPHP no Docker pode melhorar o desempenho e permitir o uso de extensões adicionais não incluídas com a instalação estática do FrankenPHP. Além disso, as imagens oficiais do Docker oferecem suporte para executar o FrankenPHP em plataformas que ele não suporta nativamente, como Windows. As imagens oficiais do Docker FrankenPHP são adequadas tanto para desenvolvimento local quanto para uso em produção.

Você pode usar o seguinte Dockerfile como ponto de partida para containerizar sua aplicação Laravel com FrankenPHP:

```dockerfile
FROM dunglas/frankenphp

RUN install-php-extensions \
    pcntl
    # Add other PHP extensions here...

COPY . /app

ENTRYPOINT ["php", "artisan", "octane:frankenphp"]
```

Então, durante o desenvolvimento, você pode utilizar o seguinte arquivo Docker Compose para executar sua aplicação:

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

Você pode consultar [a documentação oficial do FrankenPHP](https://frankenphp.dev/docs/docker/) para obter mais informações sobre como executar o FrankenPHP com Docker.

<a name="roadrunner"></a>
### Road Runner

O [RoadRunner](https://roadrunner.dev) é alimentado pelo binário RoadRunner, que é construído usando o Go. A primeira vez que você inicia um servidor baseado no Octane, o Octane oferecerá baixar e instalar o binário do RoadRunner para você.

<a name="roadrunner-via-laravel-sail"></a>
#### Roadrunner no Laravel Sail

Se você planeja desenvolver sua aplicação usando [Laravel Sail] ( /docs/sail ), você deve executar os seguintes comandos para instalar o Octane e o RoadRunner:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner-cli spiral/roadrunner-http 
```

A seguir você deve iniciar uma Shell Sail e usar o `rr` executável para obter a última compilação de base Linux do binário Roadrunner:

```shell
./vendor/bin/sail shell

# Within the Sail shell...
./vendor/bin/rr get-binary
```

Então, adicione uma variável de ambiente 'SUPERVISOR_PHP_COMMAND' a definição do serviço 'laravel.test' no arquivo docker-compose.yml da sua aplicação. Esta variável conterá o comando que Sail irá usar para servir a sua aplicação usando Octane em vez do servidor PHP de desenvolvimento:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port=80" # [tl! add]
```

Finalmente, assegure-se de que o `rr` binário é executável e construa suas imagens do Sail:

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

Se planeja usar o servidor de aplicações Swoole para servir a sua aplicação Laravel Octane, você deve instalar a extensão PHP do Swoole. Normalmente isso pode ser feito através do PECL:

```shell
pecl install swoole
```

<a name="openswoole"></a>
#### Abre o Swoole

Se você quer utilizar o servidor de aplicações Open Swoole para servir a sua aplicação Laravel Octane, você deve instalar a extensão PHP Open Swoole. Normalmente isso pode ser feito através do PECL.

```shell
pecl install openswoole
```

Usar Laravel Octane com Open Swoole fornece a mesma funcionalidade fornecida pelo Swoole, como tarefas simultâneas, ticks e intervalos.

<a name="swoole-via-laravel-sail"></a>
#### Swoole via Laravel Sail

> (!ALERTA!)
> Antes de servir um aplicativo Octane através do Sail, certifique-se de ter a versão mais recente do Laravel Sail e executar o comando './vendor/bin/sail build --no-cache' dentro do diretório raiz do seu aplicativo.

Alternativamente você pode desenvolver sua aplicação Octane com [Laravel Sail] ( /docs/sail ), o ambiente de desenvolvimento Docker oficial para Laravel. O Laravel Sail inclui a extensão Swoole por padrão. No entanto, você ainda precisará ajustar o arquivo docker-compose.yml usado pelo Sail.

Para começar, adicione uma variável de ambiente `SUPERVISOR_PHP_COMMAND` à definição do serviço `laravel.test` no arquivo `docker-compose.yml` da sua aplicação. Esta variável de ambiente conterá o comando que a vela utilizará para servir a sua aplicação usando Octane em vez do servidor de desenvolvimento PHP:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port=80" # [tl! add]
```

Por fim, construir suas imagens:

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Configuração do Swoole

Swoole suporta algumas configurações adicionais que você pode adicionar ao arquivo de configuração do seu `octane`. Como raramente precisam ser alteradas, essas opções não estão incluídas no arquivo padrão de configuração:

```php
'swoole' => [
    'options' => [
        'log_file' => storage_path('logs/swoole_http.log'),
        'package_max_length' => 10 * 1024 * 1024,
    ],
],
```

<a name="serving-your-application"></a>
## Serviço de sua aplicação

O servidor Octane pode ser iniciado através do comando Artisan `octane:start`. Por padrão, esse comando irá utilizar o servidor especificado pela opção de configuração "server" no arquivo de configuração "octane" da sua aplicação.

```shell
php artisan octane:start
```

Por padrão o Octane irá iniciar o servidor na porta 8000, então você pode acessar sua aplicação através de um navegador web usando `http://localhost:8000`.

<a name="serving-your-application-via-https"></a>
### Ativando o protocolo HTTPS para o seu aplicativo web

Por padrão, aplicações que rodam via Octane geram links com prefixo "http://". A variável de ambiente "OCTANE_HTTPS", usada no seu arquivo de configuração "config/octane.php", pode ser definida para "true" quando a aplicação está sendo servida via HTTPS. Quando esse valor de configuração é definido como "true", Octane instruirá o Laravel a prefixar todos os links gerados com "https://":

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### Aprimorando a sua aplicação com o Nginx

> Nota:
> Se você não está pronto para gerenciar sua própria configuração do servidor ou não se sente confortável configurando todos os vários serviços necessários para executar um aplicativo robusto Laravel Octane, verifique [Laravel Forge](https://forge.laravel.com).

Em ambientes de produção, você deve servir o seu aplicativo Octane atrás de um servidor web tradicional como Nginx ou Apache. Fazendo isso permitirá que o servidor web sirva os seus ativos estáticos, tais como imagens e folhas de estilo, bem como gerenciar a terminação do certificado SSL.

No exemplo de configuração abaixo do Nginx, o Nginx irá servir os ativos estáticos do site e proxy as requisições para o servidor Octane que está rodando na porta 8000.

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
### Verificando Alterações em Arquivos

Como a aplicação é carregada na memória uma vez quando o servidor Octane é iniciado, quaisquer alterações nos arquivos da aplicação não serão refletidas ao atualizar seu navegador. Por exemplo, definições de rota adicionadas no arquivo `routes/web.php` não serão refletidas até que o servidor seja reiniciado. Para conveniência, você pode usar a flag `--watch` para instruir Octane a reiniciar automaticamente o servidor em qualquer alteração nos arquivos dentro da aplicação:

```shell
php artisan octane:start --watch
```

Antes de usar essa funcionalidade, certifique-se que o [NodeJS](https://nodejs.org) esteja instalado em seu ambiente de desenvolvimento local. Além disso, você deve instalar a biblioteca de "watch" de arquivos [Chokidar](https://github.com/paulmillr/chokidar) dentro do seu projeto:

```shell
npm install --save-dev chokidar
```

Você pode configurar os diretórios e arquivos que devem ser monitorados usando a opção 'watch' no arquivo de configuração da sua aplicação 'config/octane.php'.

<a name="specifying-the-worker-count"></a>
### Especificando o número de trabalhadores

Por padrão, o Octane irá iniciar um trabalhador de solicitação de aplicação para cada CPU fornecida pelo seu computador. Esses trabalhadores serão então usados a atender as solicitações HTTP que entram na sua aplicação à medida que elas chegam. Você pode especificar manualmente quantos trabalhadores gostaria de iniciar usando a opção `--workers` quando invocando o comando `octane:start`:

```shell
php artisan octane:start --workers=4
```

Se estiver usando o servidor de aplicativos Swoole, você também pode especificar quantos "trabalhadores de tarefas" ["task workers"] você deseja iniciar:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>
### Especificando o Max Request Count

Para ajudar a evitar vazamentos de memória errantes, o Octane reinicia graciosamente qualquer trabalhador depois que ele tenha tratado por 500 solicitações. Para ajustar esse número, você pode usar a opção `--max-requests`:

```shell
php artisan octane:start --max-requests=250
```

<a name="reloading-the-workers"></a>
### Recarregando os Trabalhadores

Você pode graciosamente reiniciar os aplicativos do servidor Octane usando o comando 'octane:reload'. Normalmente, isso deve ser feito após a implantação, para que o seu novo código implantado seja carregado na memória e usado para atender as solicitações subsequentes:

```shell
php artisan octane:reload
```

<a name="stopping-the-server"></a>
### Parando o servidor

Você pode parar o servidor Octane usando o comando Artisan 'octane:stop':

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
## Injeção de Dependência e Octane

Desde que Octane inicia o aplicativo uma vez e mantém-o na memória enquanto atende os requisições, há algumas precauções a serem consideradas ao construir seu aplicativo. Por exemplo, os métodos 'register' e 'boot' do provedor de serviços do seu aplicativo serão executados apenas uma vez quando o trabalhador de requisição inicializa pela primeira vez. Em requisições subsequentes, a mesma instância do aplicativo será reutilizada.

Portanto, você deve tomar especial cuidado ao injetar o contêiner ou solicitação do serviço da aplicação em qualquer construtor de objeto. Ao fazê-lo, esse objeto pode ter uma versão estagnada do contêiner ou solicitação em solicitações subsequentes.

O Octane irá lidar automaticamente com o reajuste do estado de qualquer framework de terceiros entre solicitações. No entanto, o Octane não sempre sabe como reajustar o estado global criado pelo seu aplicativo. Portanto, você precisa estar ciente de como construir seu aplicativo de uma maneira que seja amigável para o Octane. Abaixo, vamos discutir as situações mais comuns que podem causar problemas ao usar o Octane.

<a name="container-injection"></a>
### Injeção de Conteúdo

Em geral, você deve evitar injetar o contêiner de serviço da aplicação ou instância de solicitação HTTP nos construtores de outros objetos. Por exemplo, o seguinte vínculo injeta todo o contêiner de serviço da aplicação em um objeto vinculado como singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app);
    });
}
```

Neste exemplo, se a instância do `Serviço` é resolvida durante o processo de inicialização do aplicativo, o contêiner será injetado no serviço e esse mesmo contêiner será retido pela instância do `Serviço` em solicitações subsequentes. Isso **pode** não ser um problema para sua aplicação específica; porém, pode levar a que os contêineres que são adicionados posteriormente no ciclo de inicialização ou por uma solicitação subsequente estejam faltando inesperadamente as associações.

Como uma solução de trabalho, você poderia parar de registrar o contêiner como um singleton ou injetar um closure do resolver de contêiner no serviço que sempre resolve a instância do contêiner atual.

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

O Auxiliar app e o método Container::getInstance() sempre retornarão a versão mais recente do contêiner da aplicação.

<a name="request-injection"></a>
### Injeção de Solicitação

Em geral, você deve evitar injetar o contêiner de serviço da aplicação ou a instância de solicitação HTTP nos construtores de outros objetos. Por exemplo, o seguinte vínculo injeta toda a instância de solicitação em um objeto que é vinculado como singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app['request']);
    });
}
```

Neste exemplo, caso a instância `Service` seja resolvida durante o processo de inicialização do aplicativo, a solicitação HTTP será injetada no serviço e este mesmo pedido será mantido pela instância `Service` em solicitações subsequentes. Portanto, todos os cabeçalhos, entrada e dados da string de consulta serão incorretos, bem como todos outros dados da solicitação.

Como uma solução, você poderia não registrar o binding como um singleton ou injetar uma função de resolução de requisição no serviço que sempre resolve a instância atual da requisição. Ou, a abordagem mais recomendada é simplesmente passar as informações específicas da requisição que seu objeto precisa para um dos métodos do objeto em tempo de execução:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app['request']);
});

$this->app->singleton(Service::class, function (Application $app) {
    return new Service(fn () => $app['request']);
});

// Or...

$service->method($request->input('name'));
```

O ajudante `request` global sempre retornará a requisição que o aplicativo está atualmente lidando e é portanto seguro para usar dentro do seu aplicativo.

> [!AVISO]
> É aceitável type-hintar a instância `Illuminate\Http\Request` nos seus métodos do controlador e fechamentos de rota.

<a name="configuration-repository-injection"></a>
### Injeção de repositório de configuração

Em geral, você deve evitar injetar o repositório de configuração em construtores de outros objetos. Por exemplo, o seguinte vínculo injeta o repositório de configuração em um objeto que é vinculado como singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app->make('config'));
    });
}
```

Neste exemplo, se os valores de configuração mudam entre as solicitações, esse serviço não terá acesso aos novos valores porque depende da instância do repositório original.

Como uma solução alternativa você poderia parar de registrar o binding como um singleton ou injetar um resolver de repositório de configuração na classe.

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

O arquivo de configuração 'global' sempre retornará a última versão do repositório de configuração, e é seguro utilizá-lo dentro de sua aplicação.

<a name="managing-memory-leaks"></a>
### Administrando vazamentos de memória

Lembre-se, o Octane mantém seu aplicativo na memória entre solicitações; portanto, adicionar dados a um array estaticamente mantido resultará em uma fuga de memória. Por exemplo, o seguinte controlador tem uma fuga de memória porque cada solicitação para o aplicativo continuará adicionando dados ao array estático `$data`:

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

Ao construir seu aplicativo, você deve tomar especial cuidado para evitar a criação desses tipos de vazamentos de memória. É recomendado que você monitore o uso de memória do seu aplicativo durante a fase de desenvolvimento local para garantir que você não esteja introduzindo novos vazamentos de memória no seu aplicativo.

<a name="concurrent-tasks"></a>
## Tarefas Simultâneas

> [!ALERTA]
> Esta funcionalidade exige [Swoole](#swoole).

Ao usar o Swoole você pode executar operações em paralelo usando tarefas leves de segundo plano. Você pode obter isso usando o método `concurrently` do Octane. Você pode combinar esse método com a desestruturação de matrizes do PHP para obter os resultados de cada operação:

```php
use App\Models\User;
use App\Models\Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

Tarefas simultâneas processadas por Octane utilizam Swoole's "trabalhadores de tarefa", e executam dentro de um processo completamente diferente da solicitação recebida. A quantidade de trabalhadores disponíveis para processar tarefas simultâneas é determinada pela diretiva `--task-workers` do comando `octane:start`:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

Ao invocar o método `concurrently`, não forneça mais de 1024 tarefas devido a limitações impostas pelo sistema de tarefa do Swoole.

<a name="ticks-and-intervals"></a>
## Tiques e Intervalos

> ¡ALERTA!
> Esta funcionalidade requer [Swoole](#swoole).

Ao usar Swoole, você pode registrar operações "tick" que serão executadas todo especificado número de segundos. Você pode registrar callbacks "tick" usando o método `tick`. O primeiro argumento fornecido ao método `tick` deve ser uma string que representa o nome do ticker. O segundo argumento deve ser um chamado que será invocado no intervalo especificado.

Neste exemplo, iremos registrar um método de encerramento que será invocado a cada 10 segundos. Normalmente, o método "tick" deverá ser chamado dentro do método "boot" de um dos provedores de serviços do seu aplicativo:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10);
```

Usando o método `imediato`, você pode instruir o Octane a invocar imediatamente a chamada de retorno "tick" quando o servidor Octane inicializar, e a cada N segundos:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10)
        ->immediate();
```

<a name="the-octane-cache"></a>
## O Cache Octane

> ！[Aviso]
> Esta funcionalidade requer [Swoole](#swoole).

Ao utilizar o Swoole, você pode tirar proveito do driver de cache Octane, que oferece velocidades de leitura e gravação de até 2 milhões de operações por segundo. Por isso, este driver de cache é uma excelente escolha para aplicações que necessitam de velocidades extremas de leitura/gravação a partir de sua camada de caching.

Este driver de cache é alimentado por [Tabelas Swoole](https://www.swoole.co.uk/docs/modules/swoole-table). Todos os dados armazenados no cache estão disponíveis para todos os trabalhadores do servidor. No entanto, os dados em cache serão esvaziados quando o servidor for reiniciado:

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

> Nota:
> O número máximo de entradas na cache do Octane pode ser definido em seu arquivo octane de configuração no aplicativo.

<a name="cache-intervals"></a>
### Intervalo de Cache

Além dos métodos tipicos fornecidos pelo sistema de cache do Laravel, o cache do Octane possui caches baseados em intervalos. Esses caches são atualizados automaticamente nos intervalos especificados e devem ser registrados dentro do método "boot" de um provedor de serviços do seu aplicativo. Por exemplo, o seguinte cache será atualizado a cada cinco segundos:

```php
use Illuminate\Support\Str;

Cache::store('octane')->interval('random', function () {
    return Str::random(10);
}, seconds: 5);
```

<a name="tables"></a>
## Tabelas

> [Aviso]
> Esta característica requer [Swoole].

Ao utilizar o Swoole você pode definir e interagir com suas próprias tabelas arbitrárias [Swoole](https://www.swoole.co.uk/docs/modules/swoole-table). As tabelas do Swoole fornecem um alto desempenho de throughput e os dados nessas tabelas podem ser acessados por todos os trabalhadores no servidor. No entanto, os dados nelas serão perdidos quando o servidor for reiniciado.

As tabelas devem ser definidas dentro do `tables` array de configuração do arquivo 'octane' de sua aplicação. Uma tabela que permite um maximo de 1000 linhas já foi configurada para você. O tamanhos máximo de colunas de string pode ser definido especificando o tamanho da coluna após o tipo de coluna conforme visto abaixo:

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

> [ALERTA!!!!!]
> Os tipos de colunas suportados pelos tabelas Swoole são: `string`, `int` e `float`.
