# Laravel Sail

<a name="introduction"></a>
## Introdução

 [Laravel Sail](https://github.com/laravel/sail) é uma interface de linha de comando leve para interação com o ambiente de desenvolvimento padrão do Laravel no Docker. O Sail fornece um excelente ponto de partida para construir uma aplicação Laravel usando PHP, MySQL e Redis, sem exigir experiência prévia em Docker.

 O Sail é basicamente o ficheiro `docker-compose.yml` e o script `sail` que está armazenado na raiz do seu projeto. O script `sail` fornece uma interface de linha de comando (CLI) com métodos convenientes para interagir com os contêineres Docker definidos no ficheiro `docker-compose.yml`.

 O Laravel Sail é compatível com macOS, Linux e Windows (através do [WSL2](https://docs.microsoft.com/pt-br/windows/wsl/about)).

<a name="installation"></a>
## Instalação e configuração

 O Laravel Sail é instalado automaticamente em todas as novas aplicações Laravel para que você possa começar a utilizá-lo imediatamente. Para saber como criar uma nova aplicação Laravel, consulte a [documentação de instalação](/docs/installation#docker-installation-using-sail) do Laravel para o seu sistema operativo. Durante a instalação, será solicitado que você escolha quais os serviços suportados pelo Sail com os quais sua aplicação irá interagir.

<a name="installing-sail-into-existing-applications"></a>
### Instalação de Sail em aplicações existentes

 Se você estiver interessado em usar o Sail com um aplicativo existente do Laravel, pode simplesmente instalar o Sail usando o gerenciador de pacotes Composer. É claro que esses passos pressupõem que o seu ambiente de desenvolvimento local permita a instalação das dependências do Composer:

```shell
composer require laravel/sail --dev
```

 Depois de instalado o Sail, você pode executar o comando `sail:install` do Artisan. Esse comando publicará o arquivo `docker-compose.yml` do Sail para a raiz de seu aplicativo e modificará seu arquivo `.env` com as variáveis ambientais necessárias para se conectar aos serviços Docker:

```shell
php artisan sail:install
```

 Por último, você pode iniciar o programa Sail. Para continuar aprendendo a utilizar o Sail, leia o restante desta documentação:

```shell
./vendor/bin/sail up
```

 > [!AVISO]
 > Se estiver a utilizar o Docker Desktop para Linux, deve utilizar o contexto do Docker padrão executando o seguinte comando: `docker context use default`.

<a name="adding-additional-services"></a>
#### Adicionando serviços adicionais

 Se desejar adicionar um serviço a uma instalação existente do Sail, você pode executar o comando de artesanato `sail:add`:

```shell
php artisan sail:add
```

<a name="using-devcontainers"></a>
#### Usando o Devcontainer

 Se pretender desenvolver numa [Devcontainer](https://code.visualstudio.com/docs/remote/containers), pode fornecer a opção `--devcontainer` ao comando `sail:install`. A opção `--devcontainer` instrui o comando `sail:install` para publicar um ficheiro `.devcontainer/devcontainer.json` padrão na raiz da aplicação:

```shell
php artisan sail:install --devcontainer
```

<a name="rebuilding-sail-images"></a>
### Reconstruindo imagens de veleiros

 Por vezes, poderá pretender reconstruir totalmente as imagens do Sail para garantir que todos os pacotes e software da imagem estão atualizados. Pode fazer isto usando o comando "build":

```shell
docker compose down -v

sail build --no-cache

sail up
```

<a name="configuring-a-shell-alias"></a>
### Configurar um alias de shell

 Por padrão, os comandos do Sail são chamados usando o script `vendor/bin/sail` que está incluído em todas as novas aplicações Laravel:

```shell
./vendor/bin/sail up
```

 No entanto, em vez de digitar repetidamente `vendor/bin/sail` para executar comandos do Sail, pode configurar um alias de shell que permita executar os commandos do Sail com mais facilidade.

```shell
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
```

 Para garantir que este recurso está sempre disponível, você pode adicioná-lo ao seu arquivo de configuração do shell em seu diretório pessoal, como `.zshrc` ou `.bashrc`, e então reiniciar o seu shell.

 Após a configuração do alias da shell, você poderá executar comandos do Sail simplesmente digiteando "sail". O resto dos exemplos desta documentação presumirão que o seu alias foi configurado corretamente.

```shell
sail up
```

<a name="starting-and-stopping-sail"></a>
## Acaritar e deixar de usar vela

 O arquivo docker-compose.yml do Laravel Sail define vários contêineres Docker que trabalham em conjunto para ajudar a criar aplicativos Laravel. Cada um desses contêineres é uma entrada na configuração `services` do seu arquivo docker-compose.yml. O contêiner laravel.test é o contêiner de aplicativo principal, responsável por servir sua aplicação.

 Antes de iniciar o Sail, deve certificar-se que não existem outros servidores web ou bases de dados a funcionar no seu computador local. Para iniciar todos os contêineres Docker definidos no ficheiro `docker-compose.yml` da sua aplicação, deve executar o comando `up`:

```shell
sail up
```

 Para iniciar todos os contêineres de Docker no segundo plano, você pode iniciar o Sail no modo "desanexado":

```shell
sail up -d
```

 Depois que os contêineres do aplicativo forem iniciados, você poderá acessar o projeto no seu navegador na URL: http://localhost.

 Para parar todos os contêineres, você pode pressionar o comando "Ctrl+C" para interromper a execução do contêiner. Se os contêineres estiverem rodando em segundo plano, é possível usar o comando `stop`:

```shell
sail stop
```

<a name="executing-sail-commands"></a>
## Executar comandos

 Ao usar o Laravel Sail, sua aplicação está sendo executada dentro de um contêiner do Docker e está isolada de seu computador local. No entanto, o Sail fornece uma maneira conveniente de executar vários comandos contra a aplicação, como comandos PHP arbitrários, comandos Artisan, comandos Composer e comandos Node/NPM.

 **Ao ler a documentação do Laravel, você verá frequentemente referências ao Composer, Artisan e comandos Node/NPM que não se referem ao Sail.** Esses exemplos assumem que essas ferramentas estão instaladas em seu computador local. Se você estiver usando o Sail para seu ambiente de desenvolvimento Laravel local, deve executar esses comandos usando o Sail:

```shell
# Running Artisan commands locally...
php artisan queue:work

# Running Artisan commands within Laravel Sail...
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### Executando comandos PHP

 Os comandos do PHP podem ser executados usando o comando `php`. Claro, estes comandos vão ser executados usando a versão do PHP que está configurada para sua aplicação. Para saber mais sobre as versões do PHP disponíveis no Laravel Sail, consulte a [documentação da versão do PHP](#sail-php-versions):

```shell
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### Executando comandos do Composer

 Os comandos do Composer podem ser executados usando o comando `composer`. O contêiner de aplicação do Laravel Sail inclui uma instalação do Composer:

```
sail composer require laravel/sanctum
```

<a name="installing-composer-dependencies-for-existing-projects"></a>
#### Instalando dependências do Composer em aplicações já existentes

 Se você estiver desenvolvendo um aplicativo com uma equipe, pode não ser o responsável por criar inicialmente a aplicação Laravel. Portanto, nenhuma das dependências do Composer da aplicação, incluindo Sail, será instalada depois que você clonar o repositório da aplicação para seu computador local.

 É possível instalar as dependências do aplicativo navegando até o diretório dele e executando o comando a seguir. Este comando utiliza um pequeno contêiner Docker, que inclui PHP e Composer para instalar as dependências do aplicativo:

```shell
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php83-composer:latest \
    composer install --ignore-platform-reqs
```

 Ao usar a imagem "`laravelsail/phpXX-composer" você deve utilizar a mesma versão do PHP que pretende utilizar para a sua aplicação ("`80", "`81", "`82" ou "`83").

<a name="executing-artisan-commands"></a>
### Executar comandos de artesão

 Os comandos do Laravel Artisan podem ser executados usando o comando "artisan":

```shell
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### Executando comandos do Node/NPM

 Os comandos de Node podem ser executados usando o comando `node`, enquanto os comandos do NPM podem ser executados usando o comando `npm`:

```shell
sail node --version

sail npm run dev
```

 Se desejar, você pode usar o Yarn em vez do NPM.

```shell
sail yarn
```

<a name="interacting-with-sail-databases"></a>
## Interagindo com bases de dados

<a name="mysql"></a>
### MySQL

 Como você deve ter notado, o arquivo `docker-compose.yml` da sua aplicação contém uma entrada para um container MySQL. Este container usa um [volume do Docker](https://docs.docker.com/storage/volumes/) para que os dados armazenados em seu banco de dados sejam preservados quando você interromper e reiniciar seus contêineres.

 Além disso, quando o container MySQL iniciar pela primeira vez, ele criará dois bancos de dados para você. O primeiro é nomeado com base no valor da variável de ambiente `DB_DATABASE` e serve para seu desenvolvimento local. O segundo é um banco de dados dedicado para testes denominado `testing`, o que garante que seus testes não interfiram nos dados de desenvolvimento.

 Depois de iniciar seus contêineres, você pode conectar sua aplicação ao servidor MySQL definindo a variável de ambiente `DB_HOST` para `mysql`, localizado no arquivo `.env` da aplicação.

 Para se conectar ao banco de dados MySQL da sua aplicação a partir do seu computador local, você pode usar um aplicativo gráfico de gerenciamento de bancos de dados como o [TablePlus](https://tableplus.com). Por padrão, o banco de dados MySQL está disponível em `localhost` port 3306 e as credenciais de acesso correspondem aos valores das suas variáveis de ambiente `DB_USERNAME` e `DB_PASSWORD`. Ou você pode se conectar como o usuário `root`, que também utiliza o valor da sua variável de ambiente `DB_PASSWORD` como sua senha.

<a name="redis"></a>
### O que é o Redis?

 O arquivo do aplicativo `docker-compose.yml` também contém uma entrada para um container [Redis](https://redis.io). Este container usa um volume [Docker](https://docs.docker.com/storage/volumes/) de modo que os dados armazenados em seu Redis sejam preservados mesmo ao parar e reiniciar seus contêineres. Depois de iniciado o contêiner, você pode se conectar à instância do Redis dentro da sua aplicação configurando a variável de ambiente `REDIS_HOST` da sua aplicação no arquivo `.env`.

 Para se conectar ao banco de dados do Redis da sua aplicação a partir de uma máquina local, você poderá usar um aplicativo gráfico de gerenciamento de bancos de dados como o [TablePlus](https://tableplus.com). Por padrão, o banco de dados do Redis é acessível por meio da porta `localhost` no número 6379.

<a name="meilisearch"></a>
### O que é Meilist?

 Se você escolheu instalar o serviço [Meilisearch] (https://www.meilisearch.com) ao instalar Sail, o arquivo de `docker-compose.yml` da sua aplicação conterá uma entrada para este poderoso motor de busca integrado com o [Laravel Scout](/docs/scout). Uma vez iniciados os contêineres, você pode se conectar à instância do Meilisearch na sua aplicação configurando a variável de ambiente `MEILISEARCH_HOST` como `http://meilisearch:7700`.

 A partir da sua máquina local, pode aceder ao painel de administração baseado na Web do Meilisearch navegando para `http://localhost:7700` no seu navegador da Web.

<a name="typesense"></a>
### Typesense

 Se você escolheu instalar o serviço do [Typesense](https://typesense.org) quando instalou o Sail, o arquivo de `docker-compose.yml` da sua aplicação conterá uma entrada para esse motor de busca open source extremamente rápido e integrado nativamente ao [Laravel Scout](/docs/scout#typesense). Uma vez iniciados seus contêineres, você poderá se conectar à instância do Typesense dentro da sua aplicação definindo as variáveis de ambiente a seguir:

```ini
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

 Da sua máquina local, você pode acessar a API do Typesense por meio de "http://localhost:8108".

<a name="file-storage"></a>
## Armazenamento de arquivos

 Se pretender utilizar o Amazon S3 para armazenar ficheiros durante a execução da aplicação no ambiente de produção, poderá optar por instalar o serviço [MinIO](https://min.io) ao instalar o Sail. O MinIO fornece uma API compatível com o S3 que pode utilizar para desenvolver localmente, usando o driver de armazenamento de ficheiros `s3` do Laravel sem criar "teste" cestas de armazenamento no ambiente de produção do S3. Se optar por instalar o MinIO ao instalar o Sail, será adicionada uma secção de configuração do MinIO ao ficheiro `docker-compose.yml` da aplicação.

 Por padrão, o arquivo de configuração do `sistema de ficheiros` da sua aplicação já contém uma configuração de disco para o `disco s3`. Além de utilizar este disco para interagir com a Amazon S3, pode utilizá-lo para interagir com qualquer serviço de armazenamento de ficheiros compatível com o S3, como o MinIO. Para isso, deve modificar as variáveis ambiente associadas à sua configuração. Por exemplo, quando utiliza o MinIO, a configuração da variável ambiental do sistema de ficheiros deve ser definida do seguinte modo:

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

 Para que a integração do Laravel com o Flysystem gerencie URLs adequadas ao usar o MinIO, você deve definir a variável de ambiente `AWS_URL` para que ela combine com a URL local da sua aplicação e inclui o nome do bucket no caminho da URL:

```ini
AWS_URL=http://localhost:9000/local
```

 Pode criar lote de maneira direta na consola do MinIO. A consola está disponível em "http://localhost:8900". O nome de utilizador predefinido para a consola do MinIO é "sail" e a senha predefinida é "password".

 > [AVISO]
 > A geração de URLs temporárias de armazenamento através do método `temporaryUrl` não é suportada ao usar o MinIO.

<a name="running-tests"></a>
## Execução de testes

 O Laravel disponibiliza um suporte fantástico para testes, e pode utilizar o comando `test` da Sail para executar os seus comandos [de funcionalidade e de unidade do teste] (/docs/testing). Pode também passar quaisquer opções da linha de comando que sejam aceites pelo Pest / PHPUnit ao comando `test`:

```shell
sail test

sail test --group orders
```

 O comando Sail test é equivalente ao comando Artisan test executado:

```shell
sail artisan test
```

 Por padrão, o Sail cria um banco de dados dedicado chamado "testing" para que os testes não interfiram no estado atual do seu banco de dados. Além disso, durante uma instalação padrão do Laravel, o Sail também configura o arquivo `phpunit.xml` para usar esse banco de dados quando for executar os testes:

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a name="laravel-dusk"></a>
### Laravel Dusk

 O [Laravel Dusk](//docs/dusk) fornece uma API de automação e teste de navegador fácil de usar e expressiva. Graças ao Sail, você pode executar esses testes sem nunca instalar o Selenium ou outros ferramentas em seu computador local. Para começar, desmarque o serviço do Selenium no arquivo `docker-compose.yml` do aplicativo:

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

 Próximo, certifique-se de que o serviço `laravel.test` no arquivo `docker-compose.yml` da sua aplicação tenha uma entrada para `selenium`, como mostrado a seguir:

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

 Por último, pode executar a sua unidade de teste Dusk iniciando o Sail e executando o comando `dusk`:

```shell
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### Selenium em equipamento Apple Silicon

 Se sua máquina local tiver um processador Apple Silicon, seu serviço "selenium" deve usar a imagem "seleniarm/standalone-chromium":

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
## Antecipar os e-mails

 O arquivo padrão `docker-compose.yml` do Laravel Sail contém uma entrada de serviço para o [Mailpit](https://github.com/axllent/mailpit). O Mailpit intercepiona e-mails enviados por sua aplicação durante o desenvolvimento local, fornecendo uma interface web conveniente para que você possa visualizar suas mensagens de email em seu navegador. Ao usar Sail, o host padrão do Mailpit é `mailpit` e está disponível na porta 1025:

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

 Quando o Sail está em execução, você poderá acessar a Web Interface do MailPit no endereço: HTTP://LOCALHOST:8025

<a name="sail-container-cli"></a>
## CLI do Contêiner

 Às vezes, poderá pretender iniciar uma sessão Bash dentro do seu contêiner de aplicação. Pode utilizar o comando `shell` para se conectar ao seu contêiner de aplicação e, deste modo, inspecionar os seus ficheiros e serviços instalados, bem como executar comandos shell arbitrários dentro do contêiner:

```shell
sail shell

sail root-shell
```

 Para iniciar uma nova sessão de [Tinker do Laravel](https://github.com/laravel/tinker), você pode executar o comando "tinker":

```shell
sail tinker
```

<a name="sail-php-versions"></a>
## Versões do PHP

 Atualmente o Sail suporta a execução da sua aplicação com PHP 8.3, 8.2, 8.1 ou PHP 8.0. A versão padrão de PHP utilizada pelo Sail é atualmente o PHP 8.3. Para alterar a versão do PHP que é utilizada para servir a sua aplicação, deve atualizar a definição `build` do contenedor `laravel.test` no ficheiro `docker-compose.yml`, da sua aplicação:

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

 Além disso, você pode querer atualizar o nome de sua imagem para refletir a versão do PHP que está sendo usada pelo seu aplicativo. Essa opção também é definida no arquivo `docker-compose.yml` da aplicação:

```yaml
image: sail-8.2/app
```

 Após atualizar o arquivo de seu aplicativo, você deve reconstruir as imagens de seus containers:

```shell
sail build --no-cache

sail up
```

<a name="sail-node-versions"></a>
## Versões do Node

 O Sail instala o Node 20 por padrão. Para alterar a versão do Node que é instalada ao criar as suas imagens, pode atualizar a definição de `build.args` do serviço `laravel.test`, no ficheiro `docker-compose.yml` da aplicação:

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '18'
```

 Depois de atualizar o arquivo `docker-compose.yml` do seu aplicativo, você deve reconstruir as imagens do contêiner:

```shell
sail build --no-cache

sail up
```

<a name="sharing-your-site"></a>
## Compartilhando seu site

 Às vezes você pode precisar compartilhar seu site publicamente para que um colega possa visualizá-lo ou testar integrações de webhook com sua aplicação. Para compartilhar seu site, você poderá usar o comando `share`. Após executar este comando, você receberá uma URL aleatória do tipo `laravel-sail.site` que poderá ser usada para acessar sua aplicação:

```shell
sail share
```

 Ao partilhar o seu site através do comando "share", deverá configurar os proxies confiáveis da sua aplicação utilizando a metodologia `trustProxies` no arquivo `bootstrap/app.php` da aplicação. Caso contrário, as ferramentas de ajuda na geração de URLs como "url" e "route", não conseguirão determinar o host HTTP correto que deve ser utilizado durante a geração de URL:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: [
            '*',
        ]);
    })
```

 Se pretender escolher o subdomínio para o seu sítio partilhado, pode preencher a opção `subdomain` quando efetua o comando `share`:

```shell
sail share --subdomain=my-sail-site
```

 > [!ATENÇÃO]
 [Exposição](https://github.com/beyondcode/expose), um serviço de tunelamento open-source por

<a name="debugging-with-xdebug"></a>
## Depuração com o Xdebug

 O Docker do Laravel Sail inclui suporte para o [Xdebug](https://xdebug.org/), um depurador popular e poderoso para PHP. Para habilitar o Xdebug, é necessário adicionar algumas variáveis ao arquivo `.env` da aplicação para [configurar o Xdebug](https://xdebug.org/docs/step_debug#mode). Para ativar o Xdebug, você deve definir(s) a(s) modo(s) apropriado(s) antes de iniciar o Sail:

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

#### Configuração de endereços IP do host do Linux

 Internamente, a variável de ambiente `XDEBUG_CONFIG` é definida como `client_host=host.docker.internal` para que o Xdebug seja configurado corretamente para Mac e Windows (WSL2). Se você estiver usando um computador Linux local, deve ter certeza de que está executando o Docker Engine 17.06.0+ e Compose 1.16.0+. Caso contrário, será necessário definir manualmente essa variável de ambiente como mostrado abaixo.

First, you should determine the correct host IP address to add to the environment variable by running the following command. Typically, the `<container-name>` should be the name of the container that serves your application and often ends with `_laravel.test_1`:

```shell
docker inspect -f {{range.NetworkSettings.Networks}}{{.Gateway}}{{end}} <container-name>
```

 Depois de obter o endereço IP do servidor correto, você deve definir a variável `SAIL_XDEBUG_CONFIG` no arquivo do seu aplicativo `.env`:

```ini
SAIL_XDEBUG_CONFIG="client_host=<host-ip-address>"
```

<a name="xdebug-cli-usage"></a>
### Uso da linha de comando do Xdebug

 Pode ser utilizado o comando `debug sail` para iniciar uma sessão de depuração quando se executa um comando do Artisan.

```shell
# Run an Artisan command without Xdebug...
sail artisan migrate

# Run an Artisan command with Xdebug...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### Uso do Xdebug em um navegador

 Para depurar sua aplicação enquanto interage com a aplicação através de um navegador, siga as [instruções fornecidas pelo Xdebug](https://xdebug.org/docs/step_debug#web-application) para iniciar uma sessão do Xdebug no navegador da Web.

 Se você estiver usando o PhpStorm, por favor revise a documentação da JetBrains sobre [depuração sem configuração](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html).

 > [AVERIGÜEME!]
 > O Laravel Sail utiliza o comando `artisan serve` para servir a aplicação. A partir da versão 8.53.0, o comando `artisan serve` só aceita as variáveis `XDEBUG_CONFIG` e `XDEBUG_MODE`. As versões anteriores do Laravel (8.52.0 ou inferior) não suportam estas variáveis e por isso, não vão aceitar conexões de depuração.

<a name="sail-customization"></a>
## Personalização

 Como o Sail é apenas um módulo do Docker, você pode personalizar quase tudo nele. Para publicar os próprios Dockerfiles do Sail, você pode executar o comando `sail:publish`:

```shell
sail artisan sail:publish
```

 Depois de executar este comando, os Dockerfiles e outros arquivos de configuração usados pelo Laravel Sail serão colocados dentro de um diretório "docker" no diretório raiz da sua aplicação. Depois de personalizar a instalação do Sail, você poderá optar por alterar o nome da imagem para o contêiner da aplicação no arquivo `docker-compose.yml` da sua aplicação. Após fazer isso, recompile os contêineres da sua aplicação usando o comando "build". É particularmente importante atribuir um nome exclusivo à imagem da aplicação se você estiver usando Sail para desenvolver várias aplicações Laravel em uma mesma máquina:

```shell
sail build --no-cache
```
