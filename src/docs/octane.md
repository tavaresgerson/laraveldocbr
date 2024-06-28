# Laravel Octane

<a name="introduction"></a>
## Introdução

 O Laravel Octane (https://github.com/laravel/octane) melhora o desempenho da sua aplicação ao servir a mesma usando servidores de aplicativos potentes, incluindo FrankenPHP (https://frankenphp.dev/), Open Swoole (https://openswoole.com/), Swoole (https://github.com/swoole/swoole-src) e RoadRunner (https://roadrunner.dev). Octane inicializa a sua aplicação de uma vez, mantém-na na memória e depois envia pedidos para si em velocidades supersónicas.

<a name="installation"></a>
## Instalação

 O Octane pode ser instalado através do gestor de pacotes Composer:

```shell
composer require laravel/octane
```

 Depois de instalar o Octane, você pode executar o comando do Artisan `octane:install`, que irá instalar o arquivo de configuração do Octane em sua aplicação:

```shell
php artisan octane:install
```

<a name="server-prerequisites"></a>
## Pré-requisitos do servidor

 > [!AVISO]
 [PHP 8.1+](https://php.net/releases/).

<a name="frankenphp"></a>
### O que é o FrankenPHP?

 [FrankenPHP](https://frankenphp.dev) é um servidor de aplicativos PHP, escrito em Go, que suporta recursos modernos da Web como indicações iniciais, compressão Brotli e Zstandard. Quando você instalar o Octane e escolher FrankenPHP como seu servidor, o Octane baixará automaticamente o binário do FrankenPHP para você.

<a name="frankenphp-via-laravel-sail"></a>
#### FrankenPHP através de Laravel Sail

 Se você pretende desenvolver seu aplicativo usando o [Laravel Sail] (http://laravel.com/docs/sail), execute os comandos abaixo para instalar o Octane e o FrankenPHP:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane
```

 Em seguida, você deve usar o comando do Artisan `octane:install` para instalar o binário de FrankenPHP:

```shell
./vendor/bin/sail artisan octane:install --server=frankenphp
```

 Por último, adicione uma variável de ambiente `SUPERVISOR_PHP_COMMAND` à definição do serviço `laravel.test` no arquivo `docker-compose.yml` da sua aplicação. Esta variável de ambiente conterá o comando que Sail utilizará para servir a sua aplicação usando o Octane em vez do servidor de desenvolvimento PHP:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=frankenphp --host=0.0.0.0 --admin-port=2019 --port=80" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

 Para ativar o HTTPS, HTTP/2 e HTTP/3, aplique as seguintes modificações:

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

 Geralmente, você deve acessar seu aplicativo FrankenPHP Sail por meio de `https://localhost`, já que o uso de `https://127.0.0.1` requer configuração adicional e é [desaconselhado](https://frankenphp.dev/docs/known-issues/#using-https127001-with-docker).

<a name="frankenphp-via-docker"></a>
#### FrankenPHP através do Docker

 O uso de imagens de contêineres oficiais do FrankenPHP pode oferecer desempenho melhorado e o uso de extensões adicionais não incluídas nas instalações estáticas do FrankenPHP. Além disso, as imagens de contêineres oficiais fornecem suporte para a execução do FrankenPHP em plataformas que não são suportadas nativamente, como o Windows. As imagens de contêineres oficiais do FrankenPHP são adequadas tanto para desenvolvimento local quanto uso na produção.

 Você pode usar o seguinte Dockerfile como ponto de partida para criar um container para sua aplicação Laravel com FrankenPHP:

```dockerfile
FROM dunglas/frankenphp

RUN install-php-extensions \
    pcntl
    # Add other PHP extensions here...

COPY . /app

ENTRYPOINT ["php", "artisan", "octane:frankenphp"]
```

 Então, durante o desenvolvimento, você pode usar a seguinte arquivo de Docker Compose para executar seu aplicativo:

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

 Pode consultar a documentação oficial da FrankenPHP ([documentação do Docker](https://frankenphp.dev/docs/docker/)) para obter mais informações sobre como executar o FrankenPHP com Docker.

<a name="roadrunner"></a>
### RoadRunner

 O [RoadRunner](https://roadrunner.dev) é alimentado pelo binário do RoadRunner, que é compilado usando Go. Na primeira vez que iniciar um servidor Octane baseado no RoadRunner, o Octane solicitará a instalação e download do binário RoadRunner para você.

<a name="roadrunner-via-laravel-sail"></a>
#### RoadRunner via Laravel Sail

 Se você planeja desenvolver seu aplicativo usando o [Laravel Sail] (https://laravel.com/docs/5.6/sail), execute os seguintes comandos para instalar o Octane e o RoadRunner:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner-cli spiral/roadrunner-http 
```

 Em seguida, você deve iniciar um shell do Sail e usar o executável `rr` para recuperar a última versão Linux baseada no compilado binário do RoadRunner:

```shell
./vendor/bin/sail shell

# Within the Sail shell...
./vendor/bin/rr get-binary
```

 Em seguida, adicione uma variável de ambiente `SUPERVISOR_PHP_COMMAND` à definição do serviço `laravel.test` no arquivo `docker-compose.yml` da sua aplicação. Esta variável de ambiente conterá o comando que Sail irá usar para servir a sua aplicação utilizando Octane em vez do servidor de desenvolvimento PHP:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port=80" # [tl! add]
```

 Por último, certifique-se de que o binário `rr` é executável e crie as suas imagens com base em Sail:

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

 Se você pretende usar o servidor de aplicativos Swoole para servir seu aplicativo Laravel Octane, deve instalar a extensão PHP Swoole. Normalmente, isso pode ser feito por meio do PECL:

```shell
pecl install swoole
```

<a name="openswoole"></a>
#### Abra o Swoole

 Se você deseja usar o aplicativo servidor de Swoole aberto para servir seu aplicativo Laravel Octane, deve instalar a extensão PHP do Swoole aberto. Normalmente, isso pode ser feito através do PECL:

```shell
pecl install openswoole
```

 Usando o Laravel Octane com Open Swoole concede a mesma funcionalidade fornecida pelo Swoole, como tarefas simultâneas, intervalos e ticks.

<a name="swoole-via-laravel-sail"></a>
#### O Swoole através do Laravel Sail

 > [AVERTISSEMENT]
 > Antes de servir um aplicativo Octane através do Sail, certifique-se que tem a última versão do Laravel Sail e execute `./vendor/bin/sail build --no-cache` no diretório raiz do seu aplicativo.

 Como alternativa, você poderá desenvolver seu aplicativo Octane baseado no Swoole usando o [Laravel Sail](/docs/sail), o ambiente oficial de desenvolvimento do Laravel com base no Docker. O Laravel Sail inclui a extensão Swoole por padrão. No entanto, você ainda precisará ajustar o arquivo `docker-compose.yml` usado pelo Sail.

 Para iniciar, adicione uma variável de ambiente `SUPERVISOR_PHP_COMMAND` à definição do serviço `laravel.test` no arquivo `docker-compose.yml` da aplicação. Esta variável de ambiente conterá o comando que o Sail utilizará para servir a sua aplicação utilizando o Octane, em vez do servidor de desenvolvimento PHP:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port=80" # [tl! add]
```

 Por último, crie as suas imagens Sail:

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Configuração do Swoole

 O Swoole suporta algumas opções de configuração adicionais que você pode acrescentar ao seu arquivo de configuração `octane` se necessário. Como essas opções raramente precisam ser modificadas, elas não são incluídas no arquivo de configuração padrão:

```php
'swoole' => [
    'options' => [
        'log_file' => storage_path('logs/swoole_http.log'),
        'package_max_length' => 10 * 1024 * 1024,
    ],
],
```

<a name="serving-your-application"></a>
## Servindo a sua aplicação

 O servidor Octane pode ser iniciado através do comando "Artisan octane:start". Por padrão, este comando usa o servidor especificado pela opção de configuração "server" no arquivo de configuração "octane" da aplicação.

```shell
php artisan octane:start
```

 Por padrão, o Octane inicia o servidor na porta 8000, então você poderá acessar seu aplicativo no navegador por meio de `http://localhost:8000`.

<a name="serving-your-application-via-https"></a>
### Utilização do seu Aplicativo por meio de HTTPS

 Por padrão, as aplicações que rodam através do Octane geram links com um prefixo de `http://`. A variável ambiente `OCTANE_HTTPS`, utilizada no ficheiro de configuração `config/octane.php` da sua aplicação, pode ser definida como `true` quando a sua aplicação é servida através do HTTPS. Quando este valor de configuração é definido como `true`, o Octane instrui o Laravel para preencher todos os links gerados com um prefixo de `https://`:

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### Usando o Nginx para servir sua aplicação

 > [!ATENÇÃO]
 [Laravel Forge](https://forge.laravel.com).

 Em ambientes de produção, você deve hospedar seu aplicativo Octane atrás de um servidor Web tradicional como o Nginx ou Apache. Isso permite que os recursos estáticos como imagens e arquivos de estilo sejam gerenciados pelo servidor Web ao mesmo tempo em que a conexão final do certificado SSL é gerida.

 No exemplo de configuração do Nginx abaixo, o Nginx servirá os ativos estáticos do site e fará a conexão de solicitações ao servidor Octane que está sendo executado na porta 8000:

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
### Monitoramento de alterações em arquivos

 Como o seu aplicativo é carregado em memória uma vez que o servidor do Octane começar a funcionar, quaisquer alterações nos ficheiros da sua aplicação não serão refletidas quando você atualizar o seu navegador. Por exemplo, definições de rota adicionadas ao `routes/web.php` não serão refletidas até que o servidor seja reiniciado. Pode utilizar a marcação `--watch` para instruir o Octane a reiniciar automaticamente o servidor em caso de alterações nos ficheiros da aplicação:

```shell
php artisan octane:start --watch
```

 Antes de usar esse recurso, você deve garantir que o [Node](https://nodejs.org) esteja instalado em seu ambiente de desenvolvimento local. Além disso, é necessário instalar a biblioteca de monitoramento de arquivos [Chokidar](https://github.com/paulmillr/chokidar) no projeto:

```shell
npm install --save-dev chokidar
```

 Você pode configurar os diretórios e arquivos que devem ser monitorados usando a opção de configuração `watch` no arquivo de configuração do seu aplicativo, `config/octane.php`.

<a name="specifying-the-worker-count"></a>
### Especificação do número de trabalhadores

 Por padrão, o Octane iniciará um trabalhador de solicitações de aplicativo para cada núcleo de CPU fornecido pela sua máquina. Estes trabalhadores são então utilizados para servir os pedidos HTTP enquanto entram na sua aplicação. Pode especificar manualmente quantos trabalhadores deseja iniciar, usando a opção `--workers` ao invocar o comando `octane:start`:

```shell
php artisan octane:start --workers=4
```

 Se estiver a usar o servidor de aplicação Swoole, também pode especificar quantos "trabalhadores de tarefas" [#conc_tasks](https://www.xsolla.com/pt-br/blog/how-to-make-your-game-more-concurrent/) pretende iniciar:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>
### Especificando o número máximo de pedidos

 Para ajudar a prevenir fugas de memória aleatórias, o Octane reinicia todos os trabalhadores assim que tiverem sido processados 500 pedidos. Você pode usar a opção `--max-requests` para ajustar este número:

```shell
php artisan octane:start --max-requests=250
```

<a name="reloading-the-workers"></a>
### Recolocação dos Trabalhadores

 Você pode reiniciar de maneira elegante os trabalhadores da aplicação do servidor Octane utilizando o comando `octane:reload`. Normalmente, ele deve ser executado após a implantação para que seu código recém-implantado seja carregado em memória e possa servir aos pedidos subsequentes:

```shell
php artisan octane:reload
```

<a name="stopping-the-server"></a>
### Parando o servidor

 Você pode parar o servidor do Octane usando a ordem de serviço `octane:stop`:

```shell
php artisan octane:stop
```

<a name="checking-the-server-status"></a>
#### Verificando o estado do servidor

 Você pode verificar o estado atual do servidor Octane usando o comando de Artesanato `octane:status`:

```shell
php artisan octane:status
```

<a name="dependency-injection-and-octane"></a>
## Dependency Injection e Octane

 Uma vez que o Octane inicia sua aplicação e mantém-na em memória enquanto atende aos pedidos, existem algumas ressalvas a serem consideradas ao criar sua aplicação. Por exemplo, os métodos `register` e `boot` dos provedores de serviço da sua aplicação só serão executados uma vez quando o trabalhador do pedido inicialmente iniciá-la. Nos pedidos subsequentes, a mesma instância da aplicação será reutilizada.

 Nesta perspectiva, deve ter cuidado redobrado ao injetar o contêiner de serviço ou requisição na inicialização do objeto. Deste modo, esse objeto poderá armazenar uma versão ultrapassada do contêiner ou da requisição em pedidos subsequentes.

 O Octane permite o reinicialização automática do estado dos frameworks de primeira parte entre solicitações. No entanto, nem sempre o Octane sabe como reiniciar o estado global criado pela sua aplicação. Sendo assim, você deve estar ciente sobre como construir a sua aplicação de forma que seja amigável ao Octane. A seguir, discutiremos as situações mais comuns que podem causar problemas no uso do Octane.

<a name="container-injection"></a>
### Injeção em recipiente

 No geral, é recomendável evitar injetar o contêiner de aplicativos ou a instância do pedido HTTP nos construtores de outros objetos. Por exemplo, o seguinte atributo injetou o container de serviços da aplicação inteiro em um objeto que foi vinculado como singleton:

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

 Nesse exemplo, se a instância do serviço tiver sido resolvida durante o processo de inicialização da aplicação, um contêiner será inserido na instância e esse mesmo contêiner permanecerá conectado às instâncias posteriores. Isso não é necessariamente um problema para a sua aplicação específica; no entanto, isto pode gerar uma falta inesperada de ligações que tenham sido adicionadas posteriormente ao processo de inicialização ou por meio de uma requisição subsequente.

 Uma solução alternativa pode ser para você deixar de registrar o binding como um singleton ou injetar uma chave de fechamento do contêiner no serviço que irá sempre resolver a instância atual do contêiner:

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

 O auxiliar global `app` e o método `Container::getInstance()` sempre retornarão a versão mais recente do contêiner de aplicativos.

<a name="request-injection"></a>
### Pedido de injeção

 Em geral, você deve evitar injetar o construtor do aplicativo no container de serviços ou no HTTPRequestInstance em outros objetos. Por exemplo, o seguinte binding injetará todo o request instance num objeto que é vinculado como um singleton:

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

 Neste exemplo, se a instância do serviço for resolvida durante o processo de inicialização da aplicação, o pedido HTTP será injetado no serviço e esse mesmo pedido será mantido pela instância do serviço em solicitações subsequentes. Portanto, todos os dados dos cabeçalhos, entrada e query string estão incorretos assim como todos os demais dados da requisição.

 Como alternativa, você pode ou interromper o registro da ligação como singleton, ou injetar uma closura de resolução de solicitações no serviço que sempre resolva a instância de solicitação atual. Ou, o método mais recomendado é simplesmente passar as informações específicas de solicitação necessárias ao seu objeto para um dos métodos do objeto em tempo de execução:

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

 O auxiliar `request` sempre retornará o pedido que a aplicação está processando no momento e, portanto, é seguro usar dentro da sua aplicação.

 > [AVERIGUAR]
 > É correto especificar o tipo de `Illuminate\Http\Request` nas rotas e métodos do controlador.

<a name="configuration-repository-injection"></a>
### Injeção de repositório de configurações

 Geralmente, deve-se evitar injetar a instância do repositório de configuração nos construtores de outros objetos. Por exemplo, o código a seguir injetará o repositório de configuração em um objeto que está vinculado como singleton:

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

 Neste exemplo, se os valores da configuração mudarem entre requisições, esse serviço não terá acesso aos novos valores porque ele depende da instância do repositório original.

 Como uma solução alternativa, você pode parar de registrar o vinculo como um singleton ou injetar um fechamento do resolvedor de repositório de configuração para a classe:

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

 O global `config` retornará sempre a versão mais recente do repositório de configuração e é por isso que é seguro utilizar dentro da sua aplicação.

<a name="managing-memory-leaks"></a>
### Gerenciar vazamentos de memória

 Lembre-se, o Octane mantém sua aplicação em memória entre requisições; portanto, adicionar dados a um array manterá estaticamente pode resultar no vazamento de memória. Por exemplo, o seguinte controlador tem um vazamento de memória uma vez que cada requisição para a aplicação continuará a adicionar dados ao array `$data` estatico:

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

 Durante a construção de seu aplicativo, você deve ter cuidado especial para evitar criar esses tipos de vazamentos de memória. É recomendável monitorar o uso da memória do aplicativo durante o desenvolvimento local para garantir que não estará introduzindo novas fugas de memória no seu aplicativo.

<a name="concurrent-tasks"></a>
## Tarefas concorrentes

 > [!AVISO]
 [Swoole](#swoole).

 Ao usar o Swoole, pode executar operações de forma concurrente através de tarefas em segundo plano de baixo peso. Pode fazer isto usando o método `concurrently` do Octane. Pode combinar este método com a destructuração de matrizes PHP para recuperar os resultados de cada operação:

```php
use App\Models\User;
use App\Models\Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

 As tarefas simultâneas executadas pelo Octane utilizam os "trabalhadores de tarefa" do Swoole, que são executados em um processo completamente diferente do pedido recebido. A quantidade de trabalhadores disponíveis para as tarefas simultâneas é determinada pela diretiva `--task-workers` no comando `octane:start`:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

 Ao utilizar o método `concurrently`, não deve ser inserido mais de 1024 tarefas devido a limitações impostas pelo sistema de tarefas do Swoole.

<a name="ticks-and-intervals"></a>
## Agochos e intervalos

 > [ADVERTÊNCIA]
 [O Swoole].

 Ao usar o Swoole, você pode registrar operações "tick" que serão executadas a cada número especificado de segundos. Você pode registrar callbacks de "ticks" através do método `tick`. O primeiro argumento fornecido ao método `tick` deve ser uma string que represente o nome do ticker. O segundo argumento deve ser um objeto chamável que será invocado no intervalo especificado.

 Neste exemplo, iremos registar uma função que será chamada a cada 10 segundos. Normalmente, a metodologia `tick` deve ser invocada na metodologia `boot` de um dos prestadores de serviços da aplicação:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10);
```

 Usando o método `immediate`, você pode instruir o Octane a invocar imediatamente o callback de confirmação quando o servidor do Octane inicialmente iniciado e, em cada N segundos posteriores:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
        ->seconds(10)
        ->immediate();
```

<a name="the-octane-cache"></a>
## O cache Octane

 > [!AVISO]
 [O que é o Swoole? (#Swoole)?

 Ao usar o Swoole, você pode utilizar o driver de cache Octane, que oferece velocidades de leitura e escrita até 2 milhões de operações por segundo. Por conseguinte, esse driver de cache é uma excelente escolha para aplicações que necessitem de extremas velocidades de leitura/escrita na camada de armazenamento em cache.

 Este driver de cache é alimentado por [tabelas Swoole](https://www.swoole.co.uk/docs/modules/swoole-table). Todos os dados armazenados no cache estão disponíveis para todos os trabalhadores do servidor. No entanto, os dados armazenados em cache serão apagados quando o servidor for reiniciado:

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

 > [!AVISO]
 > O número máximo de entradas permitidas no cache Octane pode ser definido no arquivo de configuração do seu aplicativo, denominado "octane".

<a name="cache-intervals"></a>
### Intervalos de cache

 Além dos métodos típicos fornecidos pelo sistema de cache do Laravel, o driver Octane possui caches baseados em intervalos. Esses caches são atualizados automaticamente no intervalo especificado e devem ser registrados na metodologia `boot` de um dos provedores de serviço da sua aplicação. Por exemplo: o cache a seguir será atualizado a cada cinco segundos

```php
use Illuminate\Support\Str;

Cache::store('octane')->interval('random', function () {
    return Str::random(10);
}, seconds: 5);
```

<a name="tables"></a>
## Tabelas

 > [ATENÇÃO]
 [ Swoole (#swoole)

 Ao utilizar o Swoole, pode definir e interagir com as suas próprias [Tabelas Swoole](https://www.swoole.co.uk/docs/modules/swoole-table). As tabelas Swoole proporcionam um desempenho de elevada capacidade através do acesso rápido aos dados e podem ser consultadas por todos os trabalhadores no servidor. No entanto, os dados nelas armazenados são perdidos quando o servidor é reiniciado.

 As tabelas devem ser definidas na sub-matriz `tables` do arquivo de configuração `octane` da aplicação. Uma tabela exemplo com até 1000 linhas está pronta para você, mas é possível configurar o tamanho máximo das colunas de texto especificando o seu comprimento após o tipo de coluna, conforme ilustrado abaixo:

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

 > [AVISO]
 > Os tipos de coluna suportados por tabelas Swoole são: string, int e float.
