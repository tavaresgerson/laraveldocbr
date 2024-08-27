# Laravel Sail

<a name="introduction"></a>
## Introdução

[Laravel Sail](https://github.com/laravel/sail) é uma interface de linha de comando leve para interagir com o ambiente de desenvolvimento padrão do Docker no Laravel. O Sail fornece um ótimo ponto de partida para a construção de aplicativos Laravel usando PHP, MySQL e Redis sem exigir que você tenha experiência anterior no Docker.

Na sua essência, Sail é o arquivo docker-compose.yml e o script sail armazenados na raiz do seu projeto. O script sail fornece um CLI com métodos convenientes para interagir com os contêineres do Docker definidos pelo arquivo docker-compose.yml.

Laravel Sail é suportado no macOS, Linux e Windows (através do [WSL2](https://docs.microsoft.com/en-us/windows/wsl/about/)).

<a name="installation"></a>
## Instalação e Configuração

O Laravel Sail está automaticamente instalado com todos os novos aplicativos Laravel, para que você possa usá-lo imediatamente. Para aprender como criar um novo aplicativo Laravel, consulte a documentação de instalação do Laravel's [instalação documentação](/docs/installation#docker-installation-using-sail) para o seu sistema operacional. Durante a instalação, você será solicitado a escolher quais serviços Sail suportados seu aplicativo interagir com.

<a name="installing-sail-into-existing-applications"></a>
### Instalar Sails em Aplicações Existentes

Se você estiver interessado em usar o Sail com um aplicativo Laravel existente, você pode instalar o Sail usando o gerenciador de pacotes Composer. É claro que esses passos pressupõem que seu ambiente de desenvolvimento local atual permita instalar dependências do Composer:

```shell
composer require laravel/sail --dev
```

Após a instalação do After Sail, você pode executar o comando `sail:install` Artisan. Este comando irá publicar o arquivo `docker-compose.yml` do After Sail na raiz de sua aplicação e modificar o arquivo `.env` com as variáveis de ambiente necessárias para se conectar aos serviços Docker.

```shell
php artisan sail:install
```

Finalmente, você pode começar a usar o Sail. Para continuar aprendendo como usar o Sail, por favor continue lendo o restante da documentação:

```shell
./vendor/bin/sail up
```

> [!AVISO]
> Se você estiver usando o Docker Desktop para Linux, deve usar o contexto padrão do Docker executando o seguinte comando: 'docker context use default'.

<a name="adding-additional-services"></a>
#### Adicionando Serviços Adicionais

Se você gostaria de adicionar um serviço adicional à sua instalação existente do Sail, você pode executar o comando 'sail:add' Artisan:

```shell
php artisan sail:add
```

<a name="using-devcontainers"></a>
#### Usando o Devcontainers

Se quiser desenvolver dentro de um [Devcontainer](https://code.visualstudio.com/docs/remote/containers), pode fornecer o parâmetro `--devcontainer` do comando `sail:install`. O parâmetro `--devcontainer` instruirá o comando `sail:install` a publicar um arquivo padrão `.devcontainer/devcontainer.json` na raiz da sua aplicação:

```shell
php artisan sail:install --devcontainer
```

<a name="rebuilding-sail-images"></a>
### Reconstruindo a Imagem do veleiro

Às vezes, você pode querer reconstruir completamente suas imagens do Sail para garantir que todos os pacotes e softwares de uma imagem estejam atualizados. Você pode fazer isso usando o comando "build":

```shell
docker compose down -v

sail build --no-cache

sail up
```

<a name="configuring-a-shell-alias"></a>
### Configurar um Aliás do Shell

Por padrão, os comandos do "Sail" são invocados através da utilização do arquivo "vendor/bin/sail" que é incluído com todos os novos aplicativos do Laravel:

```shell
./vendor/bin/sail up
```

No entanto, em vez de digitar repetidamente o comando "vendor/bin/sail" para executar comandos do Sail, você pode configurar um shell alias que lhe permite executar os comandos do Sail com mais facilidade.

```shell
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
```

Para ter certeza que isso está sempre disponível, você pode adicionar isto ao arquivo de configuração do seu shell na sua pasta inicial, tal como "~/.zshrc" ou "~/.bashrc", e então reiniciar o seu shell.

Uma vez configurado o alias do shell, você pode executar os comandos sail digitando `sail`. As demais instruções deste documento serão baseadas no fato de que este alias já tenha sido configurado:

```shell
sail up
```

<a name="starting-and-stopping-sail"></a>
## Iniciança e Paradas de vela

O arquivo 'docker-compose.yml' do Laravel Sail define uma variedade de contêineres Docker que trabalham juntos para ajudá-lo a construir aplicativos Laravel. Cada um desses contêineres é um item na configuração dos 'services' em seu arquivo 'docker-compose.yml'. O contêiner 'laravel.test' é o contêiner principal da aplicação, que servirá como sua aplicação.

Antes de iniciar o "Sail", você deve ter certeza que nenhum outro servidor ou banco de dados estão em execução na sua máquina local. Para iniciar todos os contêineres Docker definidos no arquivo do seu aplicativo' `docker-compose.yml`, você deve executar o comando 'up':

```shell
sail up
```

Para começar todos os contêineres do Docker em segundo plano, você pode iniciar o "Sail" no modo "detachado":

```shell
sail up -d
```

Uma vez que os contêineres da aplicação tenham sido iniciados, você pode acessar o projeto em seu navegador web no seguinte endereço: http://localhost.

Para parar todos os contêineres você pode simplesmente pressionar Control + C para parar o contêiner em execução. Ou se os contêineres estão rodando em segundo plano, você pode usar a ordem 'stop':

```shell
sail stop
```

<a name="executing-sail-commands"></a>
## Executando Comandos

Ao utilizar o Laravel Sail, seu aplicativo executa dentro de um contêiner Docker e é isolado do computador local. No entanto, o Sail fornece uma maneira conveniente de executar vários comandos contra seu aplicativo, como comandos PHP arbitrários, Artisan, Composer e Node / NPM.

**Ao ler a documentação do Laravel você verá muitas referências ao Composer, Artisan e os comandos Node/NPM que não se referem ao Sail.** Esses exemplos assumem que essas ferramentas estão instaladas em sua máquina local. Se você estiver usando o Sail para seu ambiente de desenvolvimento local do Laravel, você deve executar esses comandos usando o Sail:

```shell
# Running Artisan commands locally...
php artisan queue:work

# Running Artisan commands within Laravel Sail...
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### Executando Comandos PHP

Os comandos PHP podem ser executados usando o comando `php`. Claro, esses comandos serão executados usando a versão do PHP configurada para sua aplicação. Para aprender mais sobre as versões do PHP disponíveis no Laravel Sail, consulte a [documentação da versão do PHP](#sail-php-versions):

```shell
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### Executando Comandos do Composer

Os comandos de Composer podem ser executados usando o comando `composer`. A aplicação do Laravel Sail inclui uma instalação de Composer:

```nothing
sail composer require laravel/sanctum
```

<a name="installing-composer-dependencies-for-existing-projects"></a>
#### Instalando Dependências do Compositor para Aplicações Existentes

Se você está desenvolvendo uma aplicação com um time, talvez não seja você quem cria a aplicação Laravel inicial. Portanto, nenhuma das dependências do Composer da aplicação, incluindo Sail, será instalada depois de você clonar o repositório da aplicação em seu computador local.

Você pode instalar as dependências do aplicativo navegando até o diretório do aplicativo e executando o seguinte comando. Este comando usa um pequeno contêiner Docker contendo PHP e Composer para instalar as dependências do aplicativo:

```shell
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php83-composer:latest \
    composer install --ignore-platform-reqs
```

Ao utilizar a imagem 'laravelsail/phpXX-composer' você deve usar a mesma versão de PHP que planeja usar para sua aplicação (80, 81, 82 ou 83).

<a name="executing-artisan-commands"></a>
### Executando Comandos Artesanais

Comandos Laravel Artisan podem ser executados usando o comando `artesan`:

```shell
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### Executando Comandos do Node / NPM

Os comandos de Node podem ser executados usando o comando `node` enquanto os comandos do NPM podem ser executados usando o comando `npm`:

```shell
sail node --version

sail npm run dev
```

Se você desejar, pode usar Yarn em vez de npm:

```shell
sail yarn
```

<a name="interacting-with-sail-databases"></a>
## Interação com Banco de Dados

<a name="mysql"></a>
### MySQL

Como você provavelmente notou, o arquivo `docker-compose.yml` do seu aplicativo contém uma entrada para um contêiner MySQL. Este contêiner utiliza um [volume Docker](https://docs.docker.com/storage/volumes/) para que os dados armazenados em sua base de dados sejam persistidos mesmo ao parar e reiniciar seus contêineres.

Além disso, na primeira vez que o MySQL contêiner iniciar, ele criará duas bases de dados para você. A primeira base de dados é nomeada usando o valor da sua variável de ambiente `DB_DATABASE` e é para seu desenvolvimento local. A segunda é uma base de dados dedicada de teste chamada `testing`, que assegura que seus testes não interferem em seus dados de desenvolvimento.

Uma vez que você tenha iniciado seus contêineres, você pode se conectar ao seu caso MySQL dentro do seu aplicativo por definir sua variável de ambiente `DB_HOST` dentro do arquivo `.env` do seu aplicativo para `mysql`.

Para conectar o seu banco MySQL da sua aplicação do seu computador local, você pode usar um aplicativo de gerenciamento de banco gráfico como [TablePlus](https://tableplus.com). Por padrão, o banco MySQL é acessível na porta 3306 em `localhost` e as credenciais de acesso correspondem aos valores de suas variáveis ​​de ambiente `DB_USERNAME` e `DB_PASSWORD`. Ou você pode se conectar como o usuário `root`, que também usa o valor de sua variável ​​de ambiente `DB_PASSWORD` como senha.

<a name="redis"></a>
### Redis

O arquivo 'docker-compose.yml' da sua aplicação também contém uma entrada para um contêiner de [Redis](https://redis.io). Esse contêiner utiliza um volume do Docker, para que os dados armazenados na instância Redis persistam mesmo ao parar e reiniciar seus contêineres. Depois de iniciar seu contêiner, você pode se conectar à instância do Redis dentro da sua aplicação configurando a variável de ambiente `REDIS_HOST` no arquivo '.env' da sua aplicação para 'redis'.

Para se conectar ao banco de dados Redis da sua aplicação do seu computador local, você pode usar um aplicativo de gerenciamento de banco de dados gráfico como o [TablePlus](https://tableplus.com). Por padrão, o banco de dados Redis está acessível na porta localhost 6379.

<a name="meilisearch"></a>
### Meilisearch

Se você escolher instalar o serviço [Meilisearch](https://www.meilisearch.com) quando estiver instalando o Sail, seu arquivo 'docker-compose.yml' conterá um link para este poderoso mecanismo de pesquisa integrado ao Laravel Scout. Uma vez que você tenha iniciado seus contêineres, você pode se conectar com a instância do Meilisearch em sua aplicação configurando o seu ambiente variável 'MEILISEARCH_HOST' para ser igual à 'http://meilisearch:7700'.

A partir do seu computador local, você pode acessar o painel de administração baseado na web do Meilisearch navegando para `http://localhost:7700` em seu navegador da web.

<a name="typesense"></a>
### Typesense

Se você escolher instalar o serviço [Typesense](https://typesense.org) ao instalar o Sail, seu arquivo `docker-compose.yml` conterá uma entrada para este motor de busca super rápido e de código aberto que é integrado nativamente com o Laravel Scout (/docs/scout#typesense). Depois de iniciar seus contêineres, você pode se conectar à instância do Typesense dentro de sua aplicação definindo as seguintes variáveis de ambiente:

```ini
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

A partir de sua máquina local, você pode acessar a API do Typesense através de http://localhost:8108 .

<a name="file-storage"></a>
## Armazenamento de arquivos

Se você planeja usar o Amazon S3 para armazenar arquivos enquanto executa sua aplicação em seu ambiente de produção, talvez você queira instalar o serviço [MinIO](https://min.io) quando estiver instalando Sail. MinIO fornece uma API compatível com S3 que você pode usar para desenvolver localmente usando o driver de armazenamento 's3' do Laravel sem criar "cestos de teste" no seu ambiente de produção S3. Se optar por instalar o MinIO ao instalar o Sail, uma seção de configuração do MinIO será adicionada ao arquivo `docker-compose.yml` da sua aplicação.

Por padrão, o arquivo de configuração 'filesystems' da sua aplicação já contém uma configuração para o disco 's3'. Além de usar esse disco para interagir com Amazon S3, você pode usá-lo para interagir com qualquer serviço compatível com S3 de armazenamento de arquivos, como MinIO, apenas modificando as variáveis ambientais associadas que controlam sua configuração. Por exemplo, ao usar MinIO, a configuração de variável ambiental do seu sistema de arquivos deve ser definida da seguinte forma:

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

Para que a integração do Laravel com o Flysystem gere URLs apropriadas ao usar o MinIO, você deve definir a variável de ambiente 'AWS_URL' para corresponder à sua URL local e incluir o nome do balde no caminho da URL.

```ini
AWS_URL=http://localhost:9000/local
```

Você pode criar balde por meio do console de MinIO, que está disponível em http://localhost:8900. O nome de usuário padrão para o console de MinIO é "náutico" enquanto a senha padrão é "senha".

> [ALERTA]
> Gerar URLs de armazenamento temporário usando o método `temporaryUrl` não é suportado ao usar o MinIO.

<a name="running-tests"></a>
## Teste de corrida

O Laravel oferece suporte incrível para testes, e você pode usar o comando 'test' do Sail para executar seus aplicativos [tests de recursos e testes unitários](/docs/testing). Qualquer opção CLI que seja aceita pelo Pest ou PHPUnit também pode ser passada para o comando 'test':

```shell
sail test

sail test --group orders
```

O comando "test" é equivalente a executar o comando 'Artisan test':

```shell
sail artisan test
```

Por padrão, o Sail criará um banco de dados dedicado para testes, de forma que seus testes não interfiram no estado atual do seu banco de dados. Em uma instalação padrão do Laravel, o Sail também configurará seu arquivo phpunit.xml para usar este banco de dados ao executar seus testes:

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a name="laravel-dusk"></a>
### Laravel Dusk

O Laravel Dusk (/docs/dusk) fornece uma interface de API expressiva e fácil de usar para automatização e testes de navegador. Com o Sail, você pode executar esses testes sem nunca instalar o Selenium ou outros ferramentas no seu computador local. Para começar, basta descomentar o serviço do Selenium no arquivo docker-compose.yml da sua aplicação:

```yaml
selenium:
    image: 'selenium/standalone-chrome'
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

Em seguida, garanta que o serviço 'laravel.test' no arquivo docker-compose.yml do seu aplicativo tenha uma entrada 'depends_on' para 'selenium':

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

Finalmente você pode executar sua suíte de testes do dusk ao iniciar o sail e executar o comando 'dusk':

```shell
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### Selenium na Apple Silicon

Se a sua máquina local contiver um "Apple Silicon" chip, o seu serviço de 'selenium' deve usar a imagem: 'seleniarm/standalone-chromium':

```yaml
selenium:
    image: 'seleniarm/standalone-chromium'
    extra_hosts:
        - 'host.docker.internal:host-gateway'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

<a name="previewing-emails"></a>
## Visualizando e-mails

A arquivo padrão de Laravel Sail 'docker-compose.yml', contém uma entrada de serviço para [Mailpit](https://github.com/axllent/mailpit). O Mailpit intercepta emails enviados pelo seu aplicativo durante o desenvolvimento local e fornece uma interface conveniente na web, para que você possa visualizar suas mensagens de email no navegador. Ao utilizar Sail, a host padrão do Mailpit é 'mailpit' e está disponível via porta 1025:

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

Quando o Sail estiver rodando você pode acessar a interface da web do Mailpit em: http://localhost:8025

<a name="sail-container-cli"></a>
## CLI do contêiner

Às vezes você pode querer iniciar uma sessão bash dentro do seu aplicativo contêiner. Você pode usar o comando 'shell' para conectar ao seu contêiner de aplicativos, permitindo que inspecione seus arquivos e serviços instalados, bem como executar comandos de shell arbitrários dentro do contêiner:

```shell
sail shell

sail root-shell
```

Para iniciar uma nova sessão [Laravel Tinker](https://github.com/laravel/tinker), você pode executar o comando 'tinker':

```shell
sail tinker
```

<a name="sail-php-versions"></a>
## Versões do PHP

A vela atualmente suporta o serviço da sua aplicação através do PHP 8.3, 8.2, 8.1 ou PHP 8.0. A versão padrão do PHP usada pela vela é atualmente o PHP 8.3. Para alterar a versão do PHP que é usado para servir a sua aplicação, você deve atualizar a definição de "construção" do recipiente "laravel.test" no seu arquivo "docker-compose.yml":

```yaml
# PHP 8.3
context: ./vendor/laravel/sail/runtimes/8.3

# PHP 8.2
context: ./vendor/laravel/sail/runtimes/8.2

# PHP 8.1
context: ./vendor/laravel/sail/runtimes/8.1

# PHP 8.0
context: ./vendor/laravel/sail/runtimes/8.0
```

Além disso, você pode querer atualizar o nome do seu 'imagem' para refletir a versão de PHP sendo usado pelo seu aplicativo. Essa opção também é definida no arquivo 'docker-compose.yml' do seu aplicativo:

```yaml
image: sail-8.2/app
```

Depois de atualizar o arquivo 'docker-compose.yml' da sua aplicação, você deve reconstruir suas imagens:

```shell
sail build --no-cache

sail up
```

<a name="sail-node-versions"></a>
## Node Versões

O Sail instala o Node 20 por padrão. Para mudar a versão do Node que é instalada ao construir suas imagens, você pode atualizar a definição do build.args de serviço laravel.test no arquivo docker-compose.yml da sua aplicação:

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '18'
```

Depois de atualizar o arquivo docker-compose.yml do seu aplicativo, você deve reconstruir as suas imagens de contêineres:

```shell
sail build --no-cache

sail up
```

<a name="sharing-your-site"></a>
## Compartilhando seu site

Às vezes você pode precisar compartilhar seu site publicamente para visualizar seu site para um colega ou testar integrações webhook com sua aplicação. Para compartilhar seu site, você pode usar o comando 'share'. Depois de executar este comando, você será emitido uma URL aleatória 'laravel-sail.site' que você pode usar para acessar sua aplicação:

```shell
sail share
```

Ao compartilhar seu site via o comando "share", você deve configurar os proxies confiáveis de sua aplicação usando a middleware 'trustProxies' no arquivo bootstrap/app.php de sua aplicação. Caso contrário, os ajudantes de geração de URLs, como 'url' e 'route', não poderão determinar o host HTTP correto a ser utilizado durante a geração da URL:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: [
            '*',
        ]);
    })
```

Se você gostaria de escolher o subdomínio para seu site compartilhado, você pode fornecer a opção 'subdomínio' quando executar o comando 'compartilhar':

```shell
sail share --subdomain=my-sail-site
```

> Nota!
> O comando `share` é alimentado por [ Expose](https://github.com/beyondcode/expose), um serviço de túnel de código aberto da [BeyondCode](https://beyondco.de).

<a name="debugging-with-xdebug"></a>
## Depuração com Xdebug

A configuração do Laravel Sail para Docker inclui suporte ao [Xdebug](https://xdebug.org/), um popular e poderoso depurador para PHP. Para habilitar o Xdebug, você precisará adicionar algumas variáveis no arquivo `.env` da sua aplicação para [configurar o Xdebug](https://xdebug.org/docs/step_debug#mode). Para habilitar o Xdebug você deve definir a(s) configuração(s) apropriada(s) antes de iniciar o Sail:

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

#### Configuração de Host do Linux

Internamente, a variável de ambiente `XDEBUG_CONFIG` é definida como `client_host=host.docker.internal` para que o Xdebug seja configurado corretamente para Mac e Windows (WSL2). Se sua máquina local estiver rodando Linux, você deve garantir que está rodando Docker Engine 17.06.0+ e Compose 1.16.0+. Caso contrário, você precisará definir manualmente esta variável de ambiente conforme mostrado abaixo.

First, you should determine the correct host IP address to add to the environment variable by running the following command. Typically, the `<container-name>` should be the name of the container that serves your application and often ends with `_laravel.test_1`:

```shell
docker inspect -f {{range.NetworkSettings.Networks}}{{.Gateway}}{{end}} <container-name>
```

Uma vez que você tenha obtido o endereço de IP do host correto, você deve definir a variável `SAIL_XDEBUG_CONFIG` dentro do arquivo `.env` da sua aplicação:

```ini
SAIL_XDEBUG_CONFIG="client_host=<host-ip-address>"
```

<a name="xdebug-cli-usage"></a>
### Uso da linha de comando do Xdebug

Um comando ` sail debug` pode ser usado para iniciar uma sessão de depuração ao executar um comando Artisan:

```shell
# Run an Artisan command without Xdebug...
sail artisan migrate

# Run an Artisan command with Xdebug...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### Uso do navegador de depuração de Xdebug

Para depurar sua aplicação enquanto interage com ela através de um navegador da internet, siga as [instruções fornecidas por Xdebug](https://xdebug.org/docs/step_debug#web-application) para iniciar uma sessão do Xdebug a partir do navegador da internet.

Se estiver usando o PhpStorm, por favor revise a documentação da JetBrains sobre [Depuração sem configuração](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html).

> [AVISO]
> Laravel Sail depende de 'artisan serve' para atender sua aplicação. O comando 'artisan serve' apenas aceita as variáveis 'XDEBUG_CONFIG' e 'XDEBUG_MODE' a partir da versão 8.53.0 do Laravel. As versões mais antigas do Laravel (8.52.0 ou inferior) não suportam essas variáveis e não aceitarão conexões de depuração.

<a name="sail-customization"></a>
## Personalização

Como o "Sail" é apenas um "Docker", você está livre para personalizar tudo sobre ele. Para publicar os arquivos do "Docker" do próprio "Sail", você pode executar o comando `sail:publish`:

```shell
sail artisan sail:publish
```

Depois de executar este comando, os Dockerfiles e outros arquivos de configuração usados pelo Laravel Sail serão colocados dentro de um diretório `docker` no diretório raiz da sua aplicação. Depois de personalizar a instalação do Sail, você pode querer mudar o nome da imagem para o contêiner da aplicação no arquivo `docker-compose.yml` na sua aplicação. Depois de fazer isso, reconstrua os contêineres da sua aplicação usando o comando `build`. Atribuir um nome exclusivo à imagem da aplicação é particularmente importante se você estiver usando o Sail para desenvolver várias aplicações Laravel em uma única máquina:

```shell
sail build --no-cache
```
