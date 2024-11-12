# Laravel Homestead

<a name="introduction"></a>
## Introdução

O Laravel se esforça para tornar toda a experiência de desenvolvimento PHP agradável, incluindo seu ambiente de desenvolvimento local. [Laravel Homestead](https://github.com/laravel/homestead) é uma caixa Vagrant oficial e pré-empacotada que fornece um ambiente de desenvolvimento maravilhoso sem exigir que você instale PHP, um servidor web ou qualquer outro software de servidor em sua máquina local.

[Vagrant](https://www.vagrantup.com) fornece uma maneira simples e elegante de gerenciar e provisionar máquinas virtuais. As caixas Vagrant são completamente descartáveis. Se algo der errado, você pode destruir e recriar a caixa em minutos!

O Homestead roda em qualquer sistema Windows, macOS ou Linux e inclui Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node e todos os outros softwares necessários para desenvolver aplicativos Laravel incríveis.

::: warning ATENÇÃO
Se você estiver usando o Windows, pode ser necessário habilitar a virtualização de hardware (VT-x). Geralmente, ela pode ser habilitada por meio do BIOS. Se você estiver usando o Hyper-V em um sistema UEFI, você pode precisar desabilitar o Hyper-V para acessar o VT-x.
:::

<a name="included-software"></a>
### Software Incluído

- Ubuntu 22.04
- Git
- PHP 8.3
- PHP 8.2
- PHP 8.1
- PHP 8.0
- PHP 7.4
- PHP 7.3
- PHP 7.2
- PHP 7.1
- PHP 7.0
- PHP 5.6
- Nginx
- MySQL 8.0
- lmm
- Sqlite3
- PostgreSQL 15
- Composer
- Docker
- Node (With Yarn, Bower, Grunt, and Gulp)
- Redis
- Memcached
- Beanstalkd
- Mailpit
- avahi
- ngrok
- Xdebug
- XHProf / Tideways / XHGui
- wp-cli

<a name="optional-software"></a>
### Software opcional

- Apache
- Blackfire
- Cassandra
- Chronograf
- CouchDB
- Crystal & Lucky Framework
- Elasticsearch
- EventStoreDB
- Flyway
- Gearman
- Go
- Grafana
- InfluxDB
- Logstash
- MariaDB
- Meilisearch
- MinIO
- MongoDB
- Neo4j
- Oh My Zsh
- Open Resty
- PM2
- Python
- R
- RabbitMQ
- Rust
- RVM (Ruby Version Manager)
- Solr
- TimescaleDB
- Trader <small>(PHP extension)</small>
- Webdriver & Laravel Dusk Utilities

<a name="installation-and-setup"></a>
## Instalação e configuração

<a name="first-steps"></a>
### Primeiros passos

Antes de iniciar seu ambiente Homestead, você deve instalar o [Vagrant](https://developer.hashicorp.com/vagrant/downloads) e também um dos seguintes provedores suportados:

[VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1)
[Parallels](https://www.parallels.com/products/desktop/)

Todos esses pacotes de software fornecem instaladores visuais fáceis de usar para todos os sistemas operacionais populares.

Para usar o provedor Parallels, você precisará instalar o [plug-in Parallels Vagrant](https://github.com/Parallels/vagrant-parallels). É gratuito.

<a name="installing-homestead"></a>
#### Instalando o Homestead

Você pode instalar o Homestead clonando o repositório Homestead na sua máquina host. Considere clonar o repositório em uma pasta `Homestead` dentro do seu diretório "home", pois a máquina virtual Homestead servirá como host para todos os seus aplicativos Laravel. Ao longo desta documentação, nos referiremos a este diretório como seu "diretório Homestead":

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

Após clonar o repositório Homestead do Laravel, você deve verificar o branch `release`. Este branch sempre contém a versão estável mais recente do Homestead:

```shell
cd ~/Homestead

git checkout release
```

Em seguida, execute o comando `bash init.sh` do diretório Homestead para criar o arquivo de configuração `Homestead.yaml`. O arquivo `Homestead.yaml` é onde você configurará todas as configurações para sua instalação do Homestead. Este arquivo será colocado no diretório Homestead:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

<a name="configuring-homestead"></a>
### Configurando o Homestead

<a name="setting-your-provider"></a>
#### Configurando seu provedor

A chave `provider` no seu arquivo `Homestead.yaml` indica qual provedor Vagrant deve ser usado: `virtualbox` ou `parallels`:

```yaml
    provider: virtualbox
```

::: warning ATENÇÃO
Se você estiver usando o Apple Silicon, o provedor Parallels é necessário.
:::

<a name="configuring-shared-folders"></a>
#### Configurando pastas compartilhadas

A propriedade `folders` do arquivo `Homestead.yaml` lista todas as pastas que você deseja compartilhar com seu ambiente Homestead. À medida que os arquivos dentro dessas pastas são alterados, eles serão mantidos sincronizados entre sua máquina local e o ambiente virtual Homestead. Você pode configurar quantas pastas compartilhadas forem necessárias:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

::: warning ATENÇÃO
Usuários do Windows não devem usar a sintaxe de caminho `~/` e, em vez disso, devem usar o caminho completo para seu projeto, como `C:\Usuários\usuário\Código\projeto1`.
:::

Você deve sempre mapear aplicativos individuais para seu próprio mapeamento de pasta em vez de mapear um único diretório grande que contém todos os seus aplicativos. Quando você mapeia uma pasta, a máquina virtual deve manter o controle de todas as E/S de disco para *cada* arquivo na pasta. Você pode ter desempenho reduzido se tiver um grande número de arquivos em uma pasta:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

::: warning ATENÇÃO
Você nunca deve montar `.` (o diretório atual) ao usar o Homestead. Isso faz com que o Vagrant não mapeie a pasta atual para `/vagrant` e quebrará recursos opcionais e causará resultados inesperados durante o provisionamento.
:::

Para habilitar [NFS](https://developer.hashicorp.com/vagrant/docs/synced-folders/nfs), você pode adicionar uma opção `type` ao seu mapeamento de pasta:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

::: warning ATENÇÃO
Ao usar NFS no Windows, você deve considerar instalar o plug-in [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd). Este plug-in manterá as permissões corretas de usuário/grupo para arquivos e diretórios dentro da máquina virtual Homestead.
:::

Você também pode passar quaisquer opções suportadas pelo [Synced Folders](https://developer.hashicorp.com/vagrant/docs/synced-folders/basic_usage) do Vagrant listando-as sob a chave `options`:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "rsync"
      options:
          rsync__args: ["--verbose", "--archive", "--delete", "-zz"]
          rsync__exclude: ["node_modules"]
```

<a name="configuring-nginx-sites"></a>
### Configurando sites Nginx

Não está familiarizado com o Nginx? Sem problemas. A propriedade `sites` do seu arquivo `Homestead.yaml` permite que você mapeie facilmente um "domínio" para uma pasta no seu ambiente Homestead. Uma configuração de site de amostra está incluída no arquivo `Homestead.yaml`. Novamente, você pode adicionar quantos sites forem necessários ao seu ambiente Homestead. O Homestead pode servir como um ambiente virtualizado conveniente para cada aplicativo Laravel em que você estiver trabalhando:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

Se você alterar a propriedade `sites` após provisionar a máquina virtual Homestead, você deve executar o comando `vagrant reload --provision` no seu terminal para atualizar a configuração do Nginx na máquina virtual.

::: warning ATENÇÃO
Os scripts Homestead são criados para serem o mais idempotentes possível. No entanto, se você estiver enfrentando problemas durante o provisionamento, você deve destruir e reconstruir a máquina executando o comando `vagrant destroy && vagrant up`.
:::

<a name="hostname-resolution"></a>
#### Resolução de nome de host

O Homestead publica nomes de host usando `mDNS` para resolução automática de host. Se você definir `hostname: homestead` no seu arquivo `Homestead.yaml`, o host estará disponível em `homestead.local`. As distribuições de desktop macOS, iOS e Linux incluem suporte a `mDNS` por padrão. Se estiver usando o Windows, você deve instalar o [Bonjour Print Services para Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US).

Usar nomes de host automáticos funciona melhor para [instalações por projeto](#per-project-installation) do Homestead. Se você hospedar vários sites em uma única instância do Homestead, você pode adicionar os "domínios" para seus sites ao arquivo `hosts` em sua máquina. O arquivo `hosts` redirecionará as solicitações para seus sites do Homestead para sua máquina virtual Homestead. No macOS e Linux, este arquivo está localizado em `/etc/hosts`. No Windows, ele está localizado em `C:\Windows\System32\drivers\etc\hosts`. As linhas que você adicionar a este arquivo serão semelhantes às seguintes:

```
    192.168.56.56  homestead.test
```

Certifique-se de que o endereço IP listado seja o definido em seu arquivo `Homestead.yaml`. Depois de adicionar o domínio ao seu arquivo `hosts` e iniciar o Vagrant Box, você poderá acessar o site pelo seu navegador da web:

```shell
http://homestead.test
```

<a name="configuring-services"></a>
### Configurando serviços

O Homestead inicia vários serviços por padrão; no entanto, você pode personalizar quais serviços são habilitados ou desabilitados durante o provisionamento. Por exemplo, você pode habilitar o PostgreSQL e desabilitar o MySQL modificando a opção `services` dentro do seu arquivo `Homestead.yaml`:

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

Os serviços especificados serão iniciados ou parados com base na ordem nas diretivas `enabled` e `disabled`.

<a name="launching-the-vagrant-box"></a>
### Iniciando o Vagrant Box

Depois de editar o `Homestead.yaml` conforme sua preferência, execute o comando `vagrant up` do seu diretório Homestead. O Vagrant inicializará a máquina virtual e configurará automaticamente suas pastas compartilhadas e sites Nginx.

Para destruir a máquina, você pode usar o comando `vagrant destroy`.

<a name="per-project-installation"></a>
### Instalação por projeto

Em vez de instalar o Homestead globalmente e compartilhar a mesma máquina virtual Homestead em todos os seus projetos, você pode configurar uma instância Homestead para cada projeto que gerencia. Instalar o Homestead por projeto pode ser benéfico se você deseja enviar um `Vagrantfile` com seu projeto, permitindo que outros que trabalham no projeto `vagrant up` imediatamente após clonar o repositório do projeto.

Você pode instalar o Homestead em seu projeto usando o gerenciador de pacotes do Composer:

```shell
composer require laravel/homestead --dev
```

Depois que o Homestead for instalado, invoque o comando `make` do Homestead para gerar os arquivos `Vagrantfile` e `Homestead.yaml` para seu projeto. Esses arquivos serão colocados na raiz do seu projeto. O comando `make` configurará automaticamente as diretivas `sites` e `folders` no arquivo `Homestead.yaml`:

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```

Em seguida, execute o comando `vagrant up` no seu terminal e acesse seu projeto em `http://homestead.test` no seu navegador. Lembre-se, você ainda precisará adicionar uma entrada de arquivo `/etc/hosts` para `homestead.test` ou o domínio de sua escolha se não estiver usando [resolução de nome de host](#hostname-resolution) automática.

<a name="installing-optional-features"></a>
### Instalando recursos opcionais

O software opcional é instalado usando a opção `features` no seu arquivo `Homestead.yaml`. A maioria dos recursos pode ser habilitada ou desabilitada com um valor booleano, enquanto alguns recursos permitem várias opções de configuração:

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
    - cassandra: true
    - chronograf: true
    - couchdb: true
    - crystal: true
    - dragonflydb: true
    - elasticsearch:
        version: 7.9.0
    - eventstore: true
        version: 21.2.0
    - flyway: true
    - gearman: true
    - golang: true
    - grafana: true
    - influxdb: true
    - logstash: true
    - mariadb: true
    - meilisearch: true
    - minio: true
    - mongodb: true
    - neo4j: true
    - ohmyzsh: true
    - openresty: true
    - pm2: true
    - python: true
    - r-base: true
    - rabbitmq: true
    - rustc: true
    - rvm: true
    - solr: true
    - timescaledb: true
    - trader: true
    - webdriver: true
```

<a name="elasticsearch"></a>
#### Elasticsearch

Você pode especificar uma versão suportada do Elasticsearch, que deve ser um número de versão exato (major.minor.patch). A instalação padrão criará um cluster chamado 'homestead'. Você nunca deve dar ao Elasticsearch mais da metade da memória do sistema operacional, então certifique-se de que sua máquina virtual Homestead tenha pelo menos o dobro da alocação do Elasticsearch.

::: info NOTA
Confira a [documentação do Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current) para saber como personalizar sua configuração.
:::

<a name="mariadb"></a>
#### MariaDB

Habilitar o MariaDB removerá o MySQL e instalará o MariaDB. O MariaDB normalmente serve como um substituto imediato para o MySQL, então você ainda deve usar o driver de banco de dados `mysql` na configuração do banco de dados do seu aplicativo.

<a name="mongodb"></a>
#### MongoDB

A instalação padrão do MongoDB definirá o nome de usuário do banco de dados como `homestead` e a senha correspondente como `secret`.

<a name="neo4j"></a>
#### Neo4j

A instalação padrão do Neo4j definirá o nome de usuário do banco de dados como `homestead` e a senha correspondente como `secret`. Para acessar o navegador Neo4j, visite `http://homestead.test:7474` por meio do seu navegador da web. As portas `7687` (Bolt), `7474` (HTTP) e `7473` (HTTPS) estão prontas para atender solicitações do cliente Neo4j.

<a name="aliases"></a>
### Aliases

Você pode adicionar aliases Bash à sua máquina virtual Homestead modificando o arquivo `aliases` dentro do seu diretório Homestead:

```shell
alias c='clear'
alias ..='cd ..'
```

Após atualizar o arquivo `aliases`, você deve reprovisionar a máquina virtual Homestead usando o comando `vagrant reload --provision`. Isso garantirá que seus novos aliases estejam disponíveis na máquina.

<a name="updating-homestead"></a>
## Atualizando o Homestead

Antes de começar a atualizar o Homestead, você deve garantir que removeu sua máquina virtual atual executando o seguinte comando no seu diretório Homestead:

```shell
vagrant destroy
```

Em seguida, você precisa atualizar o código-fonte do Homestead. Se você clonou o repositório, pode executar os seguintes comandos no local onde originalmente clonou o repositório:

```shell
git fetch

git pull origin release
```

Esses comandos extraem o código mais recente do Homestead do repositório do GitHub, buscam as tags mais recentes e, em seguida, verificam a versão mais recente com tags. Você pode encontrar a versão mais recente do lançamento estável na [página de lançamentos do GitHub](https://github.com/laravel/homestead/releases) do Homestead.

Se você instalou o Homestead por meio do arquivo `composer.json` do seu projeto, você deve garantir que seu arquivo `composer.json` contenha `"laravel/homestead": "^12"` e atualizar suas dependências:

```shell
composer update
```

Em seguida, você deve atualizar a caixa Vagrant usando o comando `vagrant box update`:

```shell
vagrant box update
```

Após atualizar a caixa Vagrant, você deve executar o comando `bash init.sh` do diretório Homestead para atualizar os arquivos de configuração adicionais do Homestead. Será perguntado se você deseja sobrescrever seus arquivos `Homestead.yaml`, `after.sh` e `aliases` existentes:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

Finalmente, você precisará regenerar sua máquina virtual Homestead para utilizar a instalação mais recente do Vagrant:

```shell
vagrant up
```

<a name="daily-usage"></a>
## Uso diário

<a name="connecting-via-ssh"></a>
### Conectando via SSH

Você pode usar SSH para entrar na sua máquina virtual executando o comando de terminal `vagrant ssh` no seu diretório Homestead.

<a name="adding-additional-sites"></a>
### Adicionando sites adicionais

Depois que seu ambiente Homestead estiver provisionado e em execução, você pode querer adicionar sites Nginx adicionais para seus outros projetos Laravel. Você pode executar quantos projetos Laravel desejar em um único ambiente Homestead. Para adicionar um site adicional, adicione-o ao seu arquivo `Homestead.yaml`.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

::: warning ATENÇÃO
Você deve garantir que configurou um [mapeamento de pastas](#configuring-shared-folders) para o diretório do projeto antes de adicionar o site.
:::

Se o Vagrant não estiver gerenciando automaticamente seu arquivo "hosts", talvez seja necessário adicionar o novo site a esse arquivo também. No macOS e Linux, esse arquivo está localizado em `/etc/hosts`. No Windows, ele está localizado em `C:\Windows\System32\drivers\etc\hosts`:

```
    192.168.56.56  homestead.test
    192.168.56.56  another.test
```

Depois que o site for adicionado, execute o comando de terminal `vagrant reload --provision` no seu diretório Homestead.

<a name="site-types"></a>
#### Tipos de site

O Homestead suporta vários "tipos" de sites que permitem que você execute facilmente projetos que não são baseados no Laravel. Por exemplo, podemos facilmente adicionar um aplicativo Statamic ao Homestead usando o tipo de site `statamic`:

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

Os tipos de site disponíveis são: `apache`, `apache-proxy`, `apigility`, `expressive`, `laravel` (o padrão), `proxy` (para nginx), `silverstripe`, `statamic`, `symfony2`, `symfony4` e `zf`.

<a name="site-parameters"></a>
#### Parâmetros do site

Você pode adicionar valores Nginx `fastcgi_param` adicionais ao seu site por meio da diretiva de site `params`:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      params:
          - key: FOO
            value: BAR
```

<a name="environment-variables"></a>
### Variáveis ​​de ambiente

Você pode definir variáveis ​​de ambiente globais adicionando-as ao seu arquivo `Homestead.yaml`:

```yaml
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

Após atualizar o arquivo `Homestead.yaml`, certifique-se de reprovisionar a máquina executando o comando `vagrant reload --provision`. Isso atualizará a configuração do PHP-FPM para todas as versões do PHP instaladas e também atualizará o ambiente para o usuário `vagrant`.

<a name="ports"></a>
### Portas

Por padrão, as seguintes portas são encaminhadas para seu ambiente Homestead:

- **HTTP:** 8000 &rarr; Encaminha para 80
- **HTTPS:** 44300 &rarr; Encaminha para 443

<a name="forwarding-additional-ports"></a>
#### Encaminhando portas adicionais

Se desejar, você pode encaminhar portas adicionais para a caixa Vagrant definindo uma entrada de configuração `ports` dentro do seu arquivo `Homestead.yaml`. Após atualizar o arquivo `Homestead.yaml`, certifique-se de reprovisionar a máquina executando o comando `vagrant reload --provision`:

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

Abaixo está uma lista de portas de serviço Homestead adicionais que você pode desejar mapear da sua máquina host para sua caixa Vagrant:

- **SSH:** 2222 &rarr; Para 22
- **ngrok UI:** 4040 &rarr; Para 4040
- **MySQL:** 33060 &rarr; Para 3306
- **PostgreSQL:** 54320 &rarr; Para 5432
- **MongoDB:** 27017 &rarr; Para 27017
- **Mailpit:** 8025 &rarr; Para 8025
- **Minio:** 9600 &rarr; Para 9600

<a name="php-versions"></a>
### Versões do PHP

O Homestead suporta a execução de várias versões do PHP na mesma máquina virtual. Você pode especificar qual versão do PHP usar para um determinado site dentro do seu arquivo `Homestead.yaml`. As versões PHP disponíveis são: "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0", "8.1", "8.2" e "8.3", (o padrão):

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

[Dentro da sua máquina virtual Homestead](#connecting-via-ssh), você pode usar qualquer uma das versões PHP suportadas via CLI:

```shell
php5.6 artisan list
php7.0 artisan list
php7.1 artisan list
php7.2 artisan list
php7.3 artisan list
php7.4 artisan list
php8.0 artisan list
php8.1 artisan list
php8.2 artisan list
php8.3 artisan list
```

Você pode alterar a versão padrão do PHP usada pela CLI emitindo os seguintes comandos de dentro da sua máquina virtual Homestead:

```shell
php56
php70
php71
php72
php73
php74
php80
php81
php82
php83
```

<a name="connecting-to-databases"></a>
### Conectando-se a Bancos de Dados

Um banco de dados `homestead` é configurado para MySQL e PostgreSQL prontos para uso. Para conectar-se ao seu banco de dados MySQL ou PostgreSQL a partir do cliente de banco de dados da sua máquina host, você deve se conectar a `127.0.0.1` na porta `33060` (MySQL) ou `54320` (PostgreSQL). O nome de usuário e a senha para ambos os bancos de dados são `homestead` / `secret`.

::: warning ATENÇÃO
Você deve usar apenas essas portas não padrão ao conectar-se aos bancos de dados a partir da sua máquina host. Você usará as portas padrão 3306 e 5432 no arquivo de configuração `database` do seu aplicativo Laravel, pois o Laravel está sendo executado _dentro_ da máquina virtual.
:::

<a name="database-backups"></a>
### Backups de banco de dados

O Homestead pode fazer backup automático do seu banco de dados quando sua máquina virtual Homestead for destruída. Para utilizar esse recurso, você deve estar usando o Vagrant 2.1.0 ou superior. Ou, se você estiver usando uma versão mais antiga do Vagrant, você deve instalar o plug-in `vagrant-triggers`. Para habilitar backups automáticos de banco de dados, adicione a seguinte linha ao seu arquivo `Homestead.yaml`:

```
    backup: true
```

Uma vez configurado, o Homestead exportará seus bancos de dados para os diretórios `.backup/mysql_backup` e `.backup/postgres_backup` quando o comando `vagrant destroy` for executado. Esses diretórios podem ser encontrados na pasta onde você instalou o Homestead ou na raiz do seu projeto se você estiver usando o método [por instalação do projeto](#per-project-installation).

<a name="configuring-cron-schedules"></a>
### Configurando Agendamentos Cron

O Laravel fornece uma maneira conveniente de [agendar tarefas cron](/docs/scheduling) agendando um único comando Artisan `schedule:run` para ser executado a cada minuto. O comando `schedule:run` examinará a agenda de tarefas definida no seu arquivo `routes/console.php` para determinar quais tarefas agendadas executar.

Se você quiser que o comando `schedule:run` seja executado para um site Homestead, você pode definir a opção `schedule` como `true` ao definir o site:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

A tarefa cron para o site será definida no diretório `/etc/cron.d` da máquina virtual Homestead.

<a name="configuring-mailpit"></a>
### Configurando o Mailpit

[Mailpit](https://github.com/axllent/mailpit) permite que você intercepte seu e-mail de saída e examine-o sem realmente enviar o e-mail para seus destinatários. Para começar, atualize o arquivo `.env` do seu aplicativo para usar as seguintes configurações de e-mail:

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Depois que o Mailpit for configurado, você pode acessar o painel do Mailpit em `http://localhost:8025`.

<a name="configuring-minio"></a>
### Configurando o Minio

[Minio](https://github.com/minio/minio) é um servidor de armazenamento de objetos de código aberto com uma API compatível com Amazon S3. Para instalar o Minio, atualize seu arquivo `Homestead.yaml` com a seguinte opção de configuração na seção [features](#installing-optional-features):

```
    minio: true
```

Por padrão, o Minio está disponível na porta 9600. Você pode acessar o painel de controle do Minio visitando `http://localhost:9600`. A chave de acesso padrão é `homestead`, enquanto a chave secreta padrão é `secretkey`. Ao acessar o Minio, você deve sempre usar a região `us-east-1`.

Para usar o Minio, certifique-se de que seu arquivo `.env` tenha as seguintes opções:

```ini
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_ENDPOINT=http://localhost:9600
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
```

Para provisionar buckets "S3" com tecnologia Minio, adicione uma diretiva `buckets` ao seu arquivo `Homestead.yaml`. Após definir seus buckets, você deve executar o comando `vagrant reload --provision` no seu terminal:

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

Os valores `policy` suportados incluem: `none`, `download`, `upload` e `public`.

<a name="laravel-dusk"></a>
### Laravel Dusk

Para executar os testes do [Laravel Dusk](/docs/dusk) no Homestead, você deve habilitar o [recurso ``webdriver`](#installing-optional-features) na sua configuração do Homestead:

```yaml
features:
    - webdriver: true
```

Após habilitar o recurso `webdriver`, você deve executar o comando `vagrant reload --provision` no seu terminal.

<a name="sharing-your-environment"></a>
### Compartilhando seu ambiente

Às vezes, você pode querer compartilhar o que está fazendo no momento com colegas de trabalho ou um cliente. O Vagrant tem suporte integrado para isso por meio do comando `vagrant share`; no entanto, isso não funcionará se você tiver vários sites configurados no seu arquivo `Homestead.yaml`.

Para resolver esse problema, o Homestead inclui seu próprio comando `share`. Para começar, [faça SSH na sua máquina virtual Homestead](#connecting-via-ssh) via `vagrant ssh` e execute o comando `share homestead.test`. Este comando compartilhará o site `homestead.test` do seu arquivo de configuração `Homestead.yaml`. Você pode substituir qualquer um dos seus outros sites configurados por `homestead.test`:

```shell
share homestead.test
```

Após executar o comando, você verá uma tela do Ngrok aparecer contendo o log de atividades e as URLs publicamente acessíveis para o site compartilhado. Se você quiser especificar uma região personalizada, subdomínio ou outra opção de tempo de execução do Ngrok, você pode adicioná-los ao seu comando `share`:

```shell
share homestead.test -region=eu -subdomain=laravel
```

Se você precisar compartilhar conteúdo por HTTPS em vez de HTTP, usar o comando `sshare` em vez de `share` permitirá que você faça isso.

::: warning ATENÇÃO
Lembre-se, o Vagrant é inerentemente inseguro e você está expondo sua máquina virtual à Internet ao executar o comando `share`.
:::

<a name="debugging-and-profiling"></a>
## Depuração e criação de perfil

<a name="debugging-web-requests"></a>
### Depurando solicitações da Web com o Xdebug

O Homestead inclui suporte para depuração de etapas usando [Xdebug](https://xdebug.org). Por exemplo, você pode acessar uma página no seu navegador e o PHP se conectará ao seu IDE para permitir a inspeção e modificação do código em execução.

Por padrão, o Xdebug já está em execução e pronto para aceitar conexões. Se você precisar habilitar o Xdebug na CLI, execute o comando `sudo phpenmod xdebug` na sua máquina virtual Homestead. Em seguida, siga as instruções do seu IDE para habilitar a depuração. Por fim, configure seu navegador para acionar o Xdebug com uma extensão ou [bookmarklet](https://www.jetbrains.com/phpstorm/marklets/).

::: warning ATENÇÃO
O Xdebug faz com que o PHP rode significativamente mais devagar. Para desabilitar o Xdebug, execute `sudo phpdismod xdebug` na sua máquina virtual Homestead e reinicie o serviço FPM.
:::

<a name="autostarting-xdebug"></a>
#### Autostarting Xdebug

Ao depurar testes funcionais que fazem solicitações ao servidor web, é mais fácil iniciar a depuração automaticamente do que modificar os testes para passar por um cabeçalho ou cookie personalizado para acionar a depuração. Para forçar o Xdebug a iniciar automaticamente, modifique o arquivo `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` dentro da sua máquina virtual Homestead e adicione a seguinte configuração:

```ini
; Se Homestead.yaml contiver uma sub-rede diferente para o endereço IP, esse endereço poderá ser diferente...
xdebug.client_host = 192.168.10.1
xdebug.mode = debug
xdebug.start_with_request = yes
```

<a name="debugging-cli-applications"></a>
### Depurando aplicativos CLI

Para depurar um aplicativo PHP CLI, use o alias de shell `xphp` dentro da sua máquina virtual Homestead:

```php
    xphp /path/to/script
```

<a name="profiling-applications-with-blackfire"></a>
### Criação de perfil de aplicativos com Blackfire

[Blackfire](https://blackfire.io/docs/introduction) é um serviço para criação de perfil de solicitações da Web e aplicativos CLI. Ele oferece uma interface de usuário interativa que exibe dados de perfil em gráficos de chamadas e linhas do tempo. Ele foi criado para uso em desenvolvimento, preparação e produção, sem sobrecarga para usuários finais. Além disso, o Blackfire fornece verificações de desempenho, qualidade e segurança no código e nas configurações `php.ini`.

O [Blackfire Player](https://blackfire.io/docs/player/index) é um aplicativo de Web Crawling, Web Testing e Web Scraping de código aberto que pode trabalhar em conjunto com o Blackfire para criar scripts de cenários de criação de perfil.

Para habilitar o Blackfire, use a configuração "features" no seu arquivo de configuração do Homestead:

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

As credenciais do servidor e do cliente do Blackfire [requerem uma conta do Blackfire](https://blackfire.io/signup). O Blackfire oferece várias opções para criar o perfil de um aplicativo, incluindo uma ferramenta CLI e uma extensão do navegador. Por favor, [revise a documentação do Blackfire para mais detalhes](https://blackfire.io/docs/php/integrations/laravel/index).

<a name="network-interfaces"></a>
## Interfaces de rede

A propriedade `networks` do arquivo `Homestead.yaml` configura interfaces de rede para sua máquina virtual Homestead. Você pode configurar quantas interfaces forem necessárias:

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

Para habilitar uma interface [bridged](https://developer.hashicorp.com/vagrant/docs/networking/public_network), configure uma configuração `bridge` para a rede e altere o tipo de rede para `public_network`:

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

Para habilitar [DHCP](https://developer.hashicorp.com/vagrant/docs/networking/public_network#dhcp), basta remover a opção `ip` da sua configuração:

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

Para atualizar qual dispositivo a rede está usando, você pode adicionar uma opção `dev` à configuração da rede. O valor padrão `dev` é `eth0`:

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
      dev: "enp2s0"
```

<a name="extending-homestead"></a>
## Estendendo o Homestead

Você pode estender o Homestead usando o script `after.sh` na raiz do seu diretório Homestead. Dentro deste arquivo, você pode adicionar quaisquer comandos de shell que sejam necessários para configurar e personalizar adequadamente sua máquina virtual.

Ao personalizar o Homestead, o Ubuntu pode perguntar se você gostaria de manter a configuração original de um pacote ou substituí-la por um novo arquivo de configuração. Para evitar isso, você deve usar o seguinte comando ao instalar pacotes para evitar substituir qualquer configuração escrita anteriormente pelo Homestead:

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a name="user-customizations"></a>
### Personalizações do usuário

Ao usar o Homestead com sua equipe, você pode querer ajustá-lo para melhor se adequar ao seu estilo de desenvolvimento pessoal. Para fazer isso, você pode criar um arquivo `user-customizations.sh` na raiz do seu diretório Homestead (o mesmo diretório que contém seu arquivo `Homestead.yaml`). Dentro deste arquivo, você pode fazer qualquer personalização que desejar; no entanto, o `user-customizations.sh` não deve ser controlado por versão.

<a name="provider-specific-settings"></a>
## Configurações específicas do provedor

<a name="provider-specific-virtualbox"></a>
### VirtualBox

<a name="natdnshostresolver"></a>
#### `natdnshostresolver`

Por padrão, o Homestead configura a configuração `natdnshostresolver` como `on`. Isso permite que o Homestead use as configurações de DNS do seu sistema operacional host. Se você quiser substituir esse comportamento, adicione as seguintes opções de configuração ao seu arquivo `Homestead.yaml`:

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```
