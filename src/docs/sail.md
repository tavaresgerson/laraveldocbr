# Laravel Sail

<a name="introduction"></a>
## Introdução

[Laravel Sail](https://github.com/laravel/sail) é uma interface de linha de comando leve para interagir com o ambiente de desenvolvimento Docker padrão do Laravel. O Sail fornece um ótimo ponto de partida para construir um aplicativo Laravel usando PHP, MySQL e Redis sem exigir experiência anterior com o Docker.

Em sua essência, o Sail é o arquivo `docker-compose.yml` e o script `sail` que é armazenado na raiz do seu projeto. O script `sail` fornece uma CLI com métodos convenientes para interagir com os contêineres Docker definidos pelo arquivo `docker-compose.yml`.

O Laravel Sail é suportado no macOS, Linux e Windows (via [WSL2](https://docs.microsoft.com/en-us/windows/wsl/about)).

<a name="installation"></a>
## Instalação e configuração

O Laravel Sail é instalado automaticamente com todos os novos aplicativos Laravel para que você possa começar a usá-lo imediatamente. Para aprender como criar um novo aplicativo Laravel, consulte a [documentação de instalação](/docs/installation#docker-installation-using-sail) do Laravel para seu sistema operacional. Durante a instalação, você será solicitado a escolher com quais serviços suportados pelo Sail seu aplicativo irá interagir.

<a name="installing-sail-into-existing-applications"></a>
### Instalando o Sail em aplicativos existentes

Se você estiver interessado em usar o Sail com um aplicativo Laravel existente, você pode simplesmente instalar o Sail usando o gerenciador de pacotes do Composer. Claro, essas etapas pressupõem que seu ambiente de desenvolvimento local existente permite que você instale dependências do Composer:

```shell
composer require laravel/sail --dev
```

Após a instalação do Sail, você pode executar o comando Artisan `sail:install`. Este comando publicará o arquivo `docker-compose.yml` do Sail na raiz do seu aplicativo e modificará seu arquivo `.env` com as variáveis ​​de ambiente necessárias para conectar-se aos serviços do Docker:

```shell
php artisan sail:install
```

Finalmente, você pode iniciar o Sail. Para continuar aprendendo como usar o Sail, continue lendo o restante desta documentação:

```shell
./vendor/bin/sail up
```

::: warning AVISO
Se estiver usando o Docker Desktop para Linux, você deve usar o contexto `default` do Docker executando o seguinte comando: `docker context use default`.
:::

<a name="adding-additional-services"></a>
#### Adicionando serviços adicionais

Se você quiser adicionar um serviço adicional à sua instalação Sail existente, você pode executar o comando Artisan `sail:add`:

```shell
php artisan sail:add
```

<a name="using-devcontainers"></a>
#### Usando Devcontainers

Se você quiser desenvolver dentro de um [Devcontainer](https://code.visualstudio.com/docs/remote/containers), você pode fornecer a opção `--devcontainer` para o comando `sail:install`. A opção `--devcontainer` instruirá o comando `sail:install` a publicar um arquivo `.devcontainer/devcontainer.json ` padrão na raiz do seu aplicativo:

```shell
php artisan sail:install --devcontainer
```

<a name="rebuilding-sail-images"></a>
### Reconstruindo imagens Sail

Às vezes, você pode querer reconstruir completamente suas imagens Sail para garantir que todos os pacotes e softwares da imagem estejam atualizados. Você pode fazer isso usando o comando `build`:

```shell
docker compose down -v

sail build --no-cache

sail up
```

<a name="configuring-a-shell-alias"></a>
### Configurando um alias de shell

Por padrão, os comandos Sail são invocados usando o script `vendor/bin/sail` que está incluído em todos os novos aplicativos Laravel:

```shell
./vendor/bin/sail up
```

No entanto, em vez de digitar repetidamente `vendor/bin/sail` para executar comandos Sail, você pode configurar um alias de shell que permita executar os comandos Sail mais facilmente:

```shell
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
```

Para garantir que isso esteja sempre disponível, você pode adicionar isso ao seu arquivo de configuração de shell em seu diretório home, como `~/.zshrc` ou `~/.bashrc`, e então reiniciar seu shell.

Uma vez que o alias de shell tenha sido configurado, você pode executar comandos Sail simplesmente digitando `sail`. O restante dos exemplos desta documentação assumirá que você configurou este alias:

```shell
sail up
```

<a name="starting-and-stopping-sail"></a>
## Iniciando e Parando o Sail

O arquivo `docker-compose.yml` do Laravel Sail define uma variedade de contêineres Docker que trabalham juntos para ajudar você a construir aplicativos Laravel. Cada um desses contêineres é uma entrada dentro da configuração `services` do seu arquivo `docker-compose.yml`. O contêiner `laravel.test` é o contêiner de aplicativo principal que estará servindo seu aplicativo.

Antes de iniciar o Sail, você deve garantir que nenhum outro servidor web ou banco de dados esteja em execução no seu computador local. Para iniciar todos os contêineres Docker definidos no arquivo `docker-compose.yml` do seu aplicativo, você deve executar o comando `up`:

```shell
sail up
```

Para iniciar todos os contêineres Docker em segundo plano, você pode iniciar o Sail no modo "desanexado":

```shell
sail up -d
```

Depois que os contêineres do aplicativo forem iniciados, você pode acessar o projeto no seu navegador da web em: http://localhost.

Para parar todos os contêineres, você pode simplesmente pressionar Control + C para parar a execução do contêiner. Ou, se os contêineres estiverem sendo executados em segundo plano, você pode usar o comando `stop`:

```shell
sail stop
```

<a name="executing-sail-commands"></a>
## Executando comandos

Ao usar o Laravel Sail, seu aplicativo é executado em um contêiner Docker e é isolado do seu computador local. No entanto, o Sail fornece uma maneira conveniente de executar vários comandos em seu aplicativo, como comandos PHP arbitrários, comandos Artisan, comandos Composer e comandos Node / NPM.

**Ao ler a documentação do Laravel, você frequentemente verá referências aos comandos Composer, Artisan e Node / NPM que não fazem referência ao Sail.** Esses exemplos pressupõem que essas ferramentas estejam instaladas no seu computador local. Se você estiver usando o Sail para seu ambiente de desenvolvimento Laravel local, você deve executar esses comandos usando o Sail:

```shell
# Executando comandos Artisan localmente...
php artisan queue:work

# Executando comandos Artisan dentro do Laravel Sail...
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### Executando comandos PHP

Os comandos PHP podem ser executados usando o comando `php`. Claro, esses comandos serão executados usando a versão PHP que está configurada para seu aplicativo. Para saber mais sobre as versões PHP disponíveis para o Laravel Sail, consulte a [documentação da versão PHP](#sail-php-versions):

```shell
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### Executando comandos do Composer

Os comandos do Composer podem ser executados usando o comando `composer`. O contêiner de aplicativo do Laravel Sail inclui uma instalação do Composer:

```nothing
sail composer require laravel/sanctum
```

<a name="installing-composer-dependencies-for-existing-projects"></a>
#### Instalando dependências do Composer para aplicativos existentes

Se você estiver desenvolvendo um aplicativo com uma equipe, você pode não ser o responsável por criar o aplicativo Laravel inicialmente. Portanto, nenhuma das dependências do Composer do aplicativo, incluindo o Sail, será instalada após você clonar o repositório do aplicativo para seu computador local.

Você pode instalar as dependências do aplicativo navegando até o diretório do aplicativo e executando o seguinte comando. Este comando usa um pequeno contêiner Docker contendo PHP e Composer para instalar as dependências do aplicativo:

```shell
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php83-composer:latest \
    composer install --ignore-platform-reqs
```

Ao usar a imagem `laravelsail/phpXX-composer`, você deve usar a mesma versão do PHP que planeja usar para seu aplicativo (`80`, `81`, `82` ou `83`).

<a name="executing-artisan-commands"></a>
### Executando comandos Artisan

Os comandos Artisan do Laravel podem ser executados usando o comando `artisan`:

```shell
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### Executando comandos Node / NPM

Os comandos Node podem ser executados usando o comando `node` enquanto os comandos NPM podem ser executados usando o comando `npm`:

```shell
sail node --version

sail npm run dev
```

Se desejar, você pode usar Yarn em vez de NPM:

```shell
sail yarn
```

<a name="interacting-with-sail-databases"></a>
## Interagindo com bancos de dados

<a name="mysql"></a>
### MySQL

Como você deve ter notado, o arquivo `docker-compose.yml` do seu aplicativo contém uma entrada para um MySQL container. Este container usa um [volume Docker](https://docs.docker.com/storage/volumes/) para que os dados armazenados no seu banco de dados sejam persistidos mesmo ao parar e reiniciar seus containers.

Além disso, na primeira vez que o container MySQL for iniciado, ele criará dois bancos de dados para você. O primeiro banco de dados é nomeado usando o valor da sua variável de ambiente `DB_DATABASE` e é para seu desenvolvimento local. O segundo é um banco de dados de teste dedicado chamado `testing` e garantirá que seus testes não interfiram em seus dados de desenvolvimento.

Depois de iniciar seus containers, você pode se conectar à instância MySQL dentro do seu aplicativo definindo sua variável de ambiente `DB_HOST` dentro do arquivo `.env` do seu aplicativo para `mysql`.

Para se conectar ao banco de dados MySQL do seu aplicativo a partir da sua máquina local, você pode usar um aplicativo de gerenciamento de banco de dados gráfico como o [TablePlus](https://tableplus.com). Por padrão, o banco de dados MySQL é acessível na porta `localhost` 3306 e as credenciais de acesso correspondem aos valores das variáveis ​​de ambiente `DB_USERNAME` e `DB_PASSWORD`. Ou você pode se conectar como o usuário `root`, que também utiliza o valor da variável de ambiente `DB_PASSWORD` como sua senha.

<a name="redis"></a>
### Redis

O arquivo `docker-compose.yml` do seu aplicativo também contém uma entrada para um contêiner [Redis](https://redis.io). Este contêiner usa um [volume Docker](https://docs.docker.com/storage/volumes/) para que os dados armazenados em seus dados Redis sejam persistidos mesmo ao parar e reiniciar seus contêineres. Depois de iniciar seus contêineres, você pode se conectar à instância Redis dentro do seu aplicativo definindo sua variável de ambiente `REDIS_HOST` dentro do arquivo `.env` do seu aplicativo para `redis`.

Para conectar-se ao banco de dados Redis do seu aplicativo a partir da sua máquina local, você pode usar um aplicativo de gerenciamento de banco de dados gráfico, como o [TablePlus](https://tableplus.com). Por padrão, o banco de dados Redis é acessível na porta `localhost` 6379.

<a name="meilisearch"></a>
### Meilisearch

Se você escolher instalar o serviço [Meilisearch](https://www.meilisearch.com) ao instalar o Sail, o arquivo `docker-compose.yml` do seu aplicativo conterá uma entrada para este poderoso mecanismo de busca que é integrado ao [Laravel Scout](/docs/scout). Depois de iniciar seus contêineres, você pode se conectar à instância do Meilisearch dentro do seu aplicativo definindo sua variável de ambiente `MEILISEARCH_HOST` como `http://meilisearch:7700`.

A partir da sua máquina local, você pode acessar o painel de administração baseado na web do Meilisearch navegando para `http://localhost:7700` no seu navegador da web.

<a name="typesense"></a>
### Typesense

Se você escolher instalar o serviço [Typesense](https://typesense.org) ao instalar o Sail, o arquivo `docker-compose.yml` do seu aplicativo conterá uma entrada para esse mecanismo de busca rápido como um raio e de código aberto que é integrado nativamente com o [Laravel Scout](/docs/scout#typesense). Depois de iniciar seus contêineres, você pode se conectar à instância do Typesense dentro do seu aplicativo definindo as seguintes variáveis ​​de ambiente:

```ini
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

Na sua máquina local, você pode acessar a API do Typesense via `http://localhost:8108`.

<a name="file-storage"></a>
## Armazenamento de arquivos

Se você planeja usar o Amazon S3 para armazenar arquivos enquanto executa seu aplicativo em seu ambiente de produção, você pode querer instalar o serviço [MinIO](https://min.io) ao instalar o Sail. O MinIO fornece uma API compatível com S3 que você pode usar para desenvolver localmente usando o driver de armazenamento de arquivos `s3` do Laravel sem criar buckets de armazenamento de "teste" em seu ambiente de produção S3. Se você escolher instalar o MinIO enquanto instala o Sail, uma seção de configuração do MinIO será adicionada ao arquivo `docker-compose.yml` do seu aplicativo.

Por padrão, o arquivo de configuração `filesystems` do seu aplicativo já contém uma configuração de disco para o disco `s3`. Além de usar este disco para interagir com o Amazon S3, você pode usá-lo para interagir com qualquer serviço de armazenamento de arquivos compatível com S3, como o MinIO, simplesmente modificando as variáveis ​​de ambiente associadas que controlam sua configuração. Por exemplo, ao usar o MinIO, a configuração da variável de ambiente do seu sistema de arquivos deve ser definida da seguinte forma:

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

Para que a integração do Flysystem do Laravel gere URLs adequadas ao usar o MinIO, você deve definir a variável de ambiente `AWS_URL` para que ela corresponda à URL local do seu aplicativo e inclua o nome do bucket no caminho da URL:

```ini
AWS_URL=http://localhost:9000/local
```

Você pode criar buckets por meio do console MinIO, que está disponível em `http://localhost:8900`. O nome de usuário padrão para o console MinIO é `sail`, enquanto a senha padrão é `password`.

::: warning AVISO
A geração de URLs de armazenamento temporário por meio do método `temporaryUrl` não é suportada ao usar o MinIO.
:::

<a name="running-tests"></a>
## Executando Testes

O Laravel fornece um suporte incrível para testes prontos para uso, e você pode usar o comando `test` do Sail para executar seus aplicativos [testes de recursos e unidades](/docs/testing). Quaisquer opções de CLI que sejam aceitas pelo Pest / PHPUnit também podem ser passadas para o comando `test`:

```shell
sail test

sail test --group orders
```

O comando `test` do Sail é equivalente a executar o comando `test` do Artisan:

```shell
sail artisan test
```

Por padrão, o Sail criará um banco de dados `testing` dedicado para que seus testes não interfiram no estado atual do seu banco de dados. Em uma instalação padrão do Laravel, o Sail também configurará seu arquivo `phpunit.xml` para usar este banco de dados ao executar seus testes:

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a name="laravel-dusk"></a>
### Laravel Dusk

[Laravel Dusk](/docs/dusk) fornece uma API de automação e teste de navegador expressiva e fácil de usar. Graças ao Sail, você pode executar esses testes sem nunca instalar o Selenium ou outras ferramentas em seu computador local. Para começar, descomente o serviço Selenium no arquivo `docker-compose.yml` do seu aplicativo:

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

Em seguida, certifique-se de que o serviço `laravel.test` no arquivo `docker-compose.yml` do seu aplicativo tenha uma entrada `depends_on` para `selenium`:

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

Finalmente, você pode executar seu conjunto de testes Dusk iniciando o Sail e executando o comando `dusk`:

```shell
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### Selenium no Apple Silicon

Se sua máquina local contiver um chip Apple Silicon, seu serviço `selenium` deverá usar a imagem `seleniarm/standalone-chromium`:

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

O arquivo padrão `docker-compose.yml` do Laravel Sail contém uma entrada de serviço para [Mailpit](https://github.com/axllent/mailpit). O Mailpit intercepta e-mails enviados pelo seu aplicativo durante o desenvolvimento local e fornece uma interface web conveniente para que você possa visualizar suas mensagens de e-mail no seu navegador. Ao usar o Sail, o host padrão do Mailpit é `mailpit` e está disponível pela porta 1025:

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

Quando o Sail está em execução, você pode acessar a interface web do Mailpit em: http://localhost:8025

<a name="sail-container-cli"></a>
## Container CLI

Às vezes, você pode desejar iniciar uma sessão Bash dentro do contêiner do seu aplicativo. Você pode usar o comando `shell` para se conectar ao contêiner do seu aplicativo, permitindo que você inspecione seus arquivos e serviços instalados, bem como execute comandos shell arbitrários dentro do contêiner:

```shell
sail shell

sail root-shell
```

Para iniciar uma nova sessão [Laravel Tinker](https://github.com/laravel/tinker), você pode executar o comando `tinker`:

```shell
sail tinker
```

<a name="sail-php-versions"></a>
## Versões do PHP

O Sail atualmente oferece suporte para servir seu aplicativo via PHP 8.3, 8.2, 8.1 ou PHP 8.0. A versão padrão do PHP usada pelo Sail atualmente é o PHP 8.3. Para alterar a versão do PHP usada para atender seu aplicativo, você deve atualizar a definição `build` do contêiner `laravel.test` no arquivo `docker-compose.yml` do seu aplicativo:

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

Além disso, você pode desejar atualizar o nome da sua `image` para refletir a versão do PHP usada pelo seu aplicativo. Esta opção também é definida no arquivo `docker-compose.yml` do seu aplicativo:

```yaml
image: sail-8.2/app
```

Após atualizar o arquivo `docker-compose.yml` do seu aplicativo, você deve reconstruir suas imagens de contêiner:

```shell
sail build --no-cache

sail up
```

<a name="sail-node-versions"></a>
## Versões do Node

O Sail instala o Node 20 por padrão. Para alterar a versão do Node que é instalada ao construir suas imagens, você pode atualizar a definição `build.args` do serviço `laravel.test` no arquivo `docker-compose.yml` do seu aplicativo:

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '18'
```

Após atualizar o arquivo `docker-compose.yml` do seu aplicativo, você deve reconstruir suas imagens de contêiner:

```shell
sail build --no-cache

sail up
```

<a name="sharing-your-site"></a>
## Compartilhando seu site

Às vezes, você pode precisar compartilhar seu site publicamente para visualizá-lo para um colega ou para testar integrações de webhook com seu aplicativo. Para compartilhar seu site, você pode usar o comando `share`. Após executar este comando, você receberá uma URL aleatória `laravel-sail.site` que você pode usar para acessar seu aplicativo:

```shell
sail share
```

Ao compartilhar seu site por meio do comando `share`, você deve configurar os proxies confiáveis ​​do seu aplicativo usando o método de middleware `trustProxies` no arquivo `bootstrap/app.php` do seu aplicativo. Caso contrário, os auxiliares de geração de URL, como `url` e `route`, não conseguirão determinar o host HTTP correto que deve ser usado durante a geração de URL:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: [
            '*',
        ]);
    })
```

Se você quiser escolher o subdomínio para seu site compartilhado, pode fornecer a opção `subdomain` ao executar o comando `share`:

```shell
sail share --subdomain=my-sail-site
```

::: info NOTA
O comando `share` é alimentado pelo [Expose](https://github.com/beyondcode/expose), um serviço de tunelamento de código aberto da [BeyondCode](https://beyondco.de).
:::

<a name="debugging-with-xdebug"></a>
## Depuração com Xdebug

A configuração do Docker do Laravel Sail inclui suporte para [Xdebug](https://xdebug.org/), um depurador popular e poderoso para PHP. Para habilitar o Xdebug, você precisará adicionar algumas variáveis ​​ao arquivo `.env` do seu aplicativo para [configurar o Xdebug](https://xdebug.org/docs/step_debug#mode). Para habilitar o Xdebug, você deve definir o(s) modo(s) apropriado(s) antes de iniciar o Sail:

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

#### Configuração de IP do host Linux

Internamente, a variável de ambiente `XDEBUG_CONFIG` é definida como `client_host=host.docker.internal` para que o Xdebug seja configurado corretamente para Mac e Windows (WSL2). Se sua máquina local estiver executando Linux, você deve garantir que esteja executando o Docker Engine 17.06.0+ e o Compose 1.16.0+. Caso contrário, você precisará definir manualmente essa variável de ambiente, conforme mostrado abaixo.

Primeiro, você deve determinar o endereço IP do host correto para adicionar à variável de ambiente executando o seguinte comando. Normalmente, o `<container-name>` deve ser o nome do contêiner que atende seu aplicativo e geralmente termina com `_laravel.test_1`:

```shell
docker inspect -f {{range.NetworkSettings.Networks}}{{.Gateway}}{{end}} <container-name>
```

Depois de obter o endereço IP do host correto, você deve definir a variável `SAIL_XDEBUG_CONFIG` dentro do arquivo `.env` do seu aplicativo:

```ini
SAIL_XDEBUG_CONFIG="client_host=<host-ip-address>"
```

<a name="xdebug-cli-usage"></a>
### Uso do Xdebug CLI

Um comando `sail debug` pode ser usado para iniciar uma sessão de depuração ao executar um comando Artisan:

```shell
# Execute um comando Artisan sem Xdebug...
sail artisan migrate

# Execute um comando Artisan com Xdebug...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### Uso do navegador Xdebug

Para depurar seu aplicativo enquanto interage com o aplicativo por meio de um navegador da web, siga o [instruções fornecidas pelo Xdebug](https://xdebug.org/docs/step_debug#web-application) para iniciar uma sessão Xdebug a partir do navegador da web.

Se você estiver usando o PhpStorm, revise a documentação do JetBrains sobre [depuração de configuração zero](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html).

::: warning AVISO
O Laravel Sail depende do `artisan serve` para servir sua aplicação. O comando `artisan serve` aceita apenas as variáveis ​​`XDEBUG_CONFIG` e `XDEBUG_MODE` a partir da versão 8.53.0 do Laravel. Versões mais antigas do Laravel (8.52.0 e abaixo) não suportam essas variáveis ​​e não aceitarão conexões de depuração.
:::

<a name="sail-customization"></a>
## Personalização

Como o Sail é apenas Docker, você tem liberdade para personalizar quase tudo sobre ele. Para publicar os próprios Dockerfiles do Sail, você pode executar o comando `sail:publish`:

```shell
sail artisan sail:publish
```

Após executar este comando, os Dockerfiles e outros arquivos de configuração usados ​​pelo Laravel Sail serão colocados em um diretório `docker` no diretório raiz do seu aplicativo. Após personalizar sua instalação do Sail, você pode desejar alterar o nome da imagem para o contêiner do aplicativo no arquivo `docker-compose.yml` do seu aplicativo. Depois de fazer isso, reconstrua os contêineres do seu aplicativo usando o comando `build`. Atribuir um nome exclusivo à imagem do aplicativo é particularmente importante se você estiver usando o Sail para desenvolver vários aplicativos Laravel em uma única máquina:

```shell
sail build --no-cache
```
