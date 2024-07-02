# Larabot Framework

<a name="introduction"></a>
## Introdução

 O Laravel se esforça para tornar toda experiência de desenvolvimento PHP maravilhosa, incluindo sua ambiente de desenvolvimento local. [Laravel Homestead](https://github.com/laravel/homestead) é um caixa oficial pré-embalado do Vagrant que fornece a você um ótimo ambiente de desenvolvimento sem exigir que você instale o PHP, um servidor web ou qualquer outro software no seu computador.

 O [Vagrant](https://www.vagrantup.com) fornece uma maneira simples e elegante de gerenciar e provisionar máquinas virtuais. As caixas do Vagrant são completamente descartáveis. Se algo der errado, você poderá destruir e recriar a caixa em questão em minutos!

 O Homestead é executado em qualquer sistema Windows, macOS ou Linux e inclui Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node e todo o software necessário para criar aplicações incríveis com Laravel.

 > [AVISO]
 > Se estiver a usar o Windows, poderá ter de ativar a virtualização de hardware (VT-x). Geralmente, esta funcionalidade pode ser ativada através do BIOS. Caso esteja a utilizar o Hyper-V num sistema UEFI, poderá ainda vir a precisar de desativar o Hyper-V para ter acesso à VT-x.

<a name="included-software"></a>
### Software incluído

<style>
 # software-list > ul {
 contagem de colunas: 2; -moz-contagem de colunas: 2; -webkit-contagem de colunas: 2;
 coluna-gap: 5em; -moz-coluna-gap: 5em; -webkit-coluna-gap: 5em;
 altura da linha: 1,9;
 }
</style>

<div id="software-list" markdown="1">

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
 - LMM
 - Sqlite3
 - PostgreSQL 15
 - Compositor
 - Docker
 - Nó (com o Yarn, Bower, Grunt e Gulp)
 - Redis
 - Memcached
 - Beanstalkd
 - O Mailpit
 - avahi
 - ngrok
 - Xdebug
 - XHProf/Tideways/XHGui
 - WP-Cli

</div>

<a name="optional-software"></a>
### Opcional de software

<style>
 # software-list > ul {
 coluna-conteúdo: 2; -moz-coluna-conteúdo: 2; -webkit-coluna-conteúdo: 2;
 coluna-intervalo: 5em; -moz-coluna-intervalo: 5em; -webkit-coluna-intervalo: 5em;
 Lines of text: 1.9;
 }
</style>

<div id="software-list" markdown="1">

 - Apache
 - Blackfire
 Cassandra
 - Chronograf
 - CouchDB
 - Quadrado e enquadramento da sorte
 - Elasticsearch
 - EventStoreDB
 - Voo
 - Gearman
 - Ir
 - o Grafana
 - InfluxDB
 - Logstash
 - MariaDB
 - Meilisearch
 - O MinIO
 - MongoDB
 - Neo4j
 - Oh meu Zsh
 - Abra o resty
 - PM2
 - Python
 - R
 - RabbitMQ
 - Ferrugem
 - RVM (Gerenciador de Versão Ruby)
 - Solr
 - TimescaleDB
- Trader <small>(PHP extension)</small>
 - Webdriver & Ferramentas Laravel Dusk

</div>

<a name="installation-and-setup"></a>
## Instalação e configuração

<a name="first-steps"></a>
### Primeiros passos

 Antes de iniciar seu ambiente da Homestead, é necessário instalar o Vagrant (https://developer.hashicorp.com/vagrant/downloads), bem como um dos seguintes provedores suportados:

 [O VirtualBox é um software de virtualização que permite o uso de sistemas operacionais independentemente do sistema em execução no seu computador.](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1)
 [Parallels] (https://www.parallels.com/products/desktop/)

 Todos estes pacotes de software apresentam instaladores visuais fáceis de usar para os principais sistemas operativos.

 Para utilizar o provedor da Parallels, você precisará instalar o [Plug-In Parallels Vagrant](https://github.com/Parallels/vagrant-parallels), que é gratuito.

<a name="installing-homestead"></a>
#### Instalando o Homestead

 Você poderá instalar o Homestead clonando o repositório do Homestead na máquina anfitriã. Considere clonar o repositório em uma pasta chamada "Homestead" no diretório "home", já que a máquina virtual Homestead servirá como hospedeira para todas as suas aplicações do Laravel. Nesta documentação, nos referimos a este diretório como seu "diretório da Homestead":

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

 Depois de clonar o repositório do Laravel Homestead, você deve fazer a checkout na branca chamada "release". Esta branca sempre contém a versão estável mais recente do Homestead:

```shell
cd ~/Homestead

git checkout release
```

 Em seguida, execute o comando `bash init.sh` a partir da pasta do Homestead para criar o arquivo de configuração `Homestead.yaml`. O arquivo `Homestead.yaml` é onde você irá configurar todos os seus parâmetros de instalação do Homestead. Esse arquivo será colocado na pasta do Homestead:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

<a name="configuring-homestead"></a>
### Configurando a minia casa

<a name="setting-your-provider"></a>
#### Configurando o seu provedor

 A chave `provider` no arquivo `Homestead.yaml` indica qual provedor do Vagrant deve ser usado: `virtualbox` ou `parallels`:

```yaml
    provider: virtualbox
```

 > [Aviso]
 > Se você estiver usando a Apple Silicon, o provedor do Parallels é obrigatório.

<a name="configuring-shared-folders"></a>
#### Configurar pastas compartilhadas

 A propriedade `folders` do arquivo `Homestead.yaml` lista todos os diretórios que deseja compartilhar com o ambiente de Homestead. Assim que forem feitas alterações nos arquivos dentro destes diretórios, elas serão mantidas em sincronia entre a máquina local e o ambiente virtual do Homestead. Você poderá configurar quantos diretórios quiser:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

 > [ADVERTÊNCIA]
 > Os usuários do Windows não devem usar a sintaxe de caminho `~ /` e, em vez disso, deve utilizar o caminho completo para o projeto, como `C:\User\usuario\Code\project1`.

 Deverá sempre mapear aplicações individuais para um mapeamento de pasta próprio em vez do mapeamento de uma grande diretiva que contenha todas as suas aplicações. Quando mapeia uma pasta, a máquina virtual deve manter o controlo de todo o IO de disco para todos os *ficheiros* na pasta. Pode ver um desempenho reduzido se tiver muitos ficheiros numa pasta:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

 > [!AVISO]
 > Nunca deve montar o `.` (o diretório atual) ao usar o Homestead, pois isso faz com que o Vagrant não mapeie a pasta atual para `/vagrant` e falhe recursos opcionais durante o provisionamento ou produza resultados inesperados.

 Para ativar o NFS ([NFS] (https://developer.hashicorp.com/vagrant/docs/synced-folders/nfs)), pode adicionar uma opção `type` ao mapeamento do seu diretório:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

 > [AVISO]
 [Plug-in vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd). Este plug-in manterá as permissões de usuário e grupo corretas para arquivos e diretórios dentro da máquina virtual Homestead.

 Também é possível passar opções suportadas pelos [Sincronizados Folders](https://developer.hashicorp.com/vagrant/docs/synced-folders/basic_usage) do Vagrant, listando-as sob a chave `options`:

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
### Configurando sites do Nginx

 Não está familiarizado com o Nginx? Sem problemas. A propriedade `sites` do seu arquivo `Homestead.yaml` permite que você mapeie facilmente um "domínio" para uma pasta em seu ambiente Homestead. Uma configuração de site modelo está incluída no arquivo `Homestead.yaml`. Você pode adicionar quantos sites forem necessários ao seu ambiente Homestead. O Homestead serve como um ambiente virtualizado conveniente para cada aplicativo Laravel em que você esteja trabalhando:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

 Se você alterar a propriedade `sites` depois de provisionar a máquina virtual Homestead, é necessário executar o comando `vagrant reload --provision` no seu terminal para atualizar a configuração do Nginx na máquina virtual.

 > [Atenção]
 > Os scripts da pasta Home estão construídos para serem tão idempotentes quanto possível. No entanto, se você estiver enfrentando problemas durante o provisionamento, deve destruir e recriar a máquina executando o comando `vagrant destroy && vagrant up`.

<a name="hostname-resolution"></a>
#### Resolução de Hostname

 O Homestead publica endereços de hospedeiros usando `mDNS` para resolução automática de hosts. Se você definir `hostname: homestead` em seu arquivo `Homestead.yaml`, o host estará disponível como `homestead.local`. As distribuições do macOS, iOS e Linux desktop incluem suporte por padrão para `mDNS`. Se você estiver usando o Windows, deve instalar [Bonjour Print Services for Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US).

 O uso de nomes automáticos de host é mais eficiente para [instalações por projeto](#instalacoes-por-projeto) do Homestead. Se você hospedar vários sites em uma única instância do Homestead, pode adicionar "domínios" aos seus sites ao arquivo hosts do seu computador. O arquivo hosts redirecionará os pedidos para seus sites da Homestead para a sua máquina virtual da Homestead. No macOS e no Linux, este arquivo está localizado em `/etc/hosts`. No Windows, ele está localizado em `C:\Windows\System32\drivers\etc\hosts`. As linhas que você adiciona neste arquivo serão semelhantes às seguintes:

```
    192.168.56.56  homestead.test
```

 Verifique se o endereço IP listado é o definido em seu arquivo `Homestead.yaml`. Depois de adicionar o domínio ao seu arquivo `hosts` e iniciar a caixa Vagrant, você poderá acessar o site através do seu navegador:

```shell
http://homestead.test
```

<a name="configuring-services"></a>
### Configuração de serviços

 O Homestead inicia vários serviços por padrão. No entanto, pode personalizar quais os serviços a ativar ou desativar durante o provisionamento. Por exemplo, pode ativar o PostgreSQL e desativar o MySQL, alterando a opção `services` no seu ficheiro `Homestead.yaml`:

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

 Os serviços especificados serão iniciados ou parados com base em seu pedido nas diretivas `enabled` e `disabled`.

<a name="launching-the-vagrant-box"></a>
### Lançando a caixa do Vagrant

 Depois de editar o `Homestead.yaml`, execute o comando `vagrant up` a partir da pasta `Homestead`. O Vagrant iniciará a máquina virtual e configurará automaticamente os seus ficheiros partilhados e sites Nginx.

 Para destruir a máquina, você pode usar o comando `vagrant destroy`.

<a name="per-project-installation"></a>
### Instalação por projeto

 Em vez de instalar o Homestead globalmente e compartilhar uma mesma máquina virtual do Homestead em todos os seus projetos, pode ser vantajoso configurar uma instância do Homestead para cada projeto que gere. Se pretender enviar um `Vagrantfile` com o seu projeto, permitindo assim a outros profissionais que trabalham no projeto inicializar imediatamente o mesmo através de `vagrant up`, após clonarem o repositório do projeto, poderá ser vantajoso instalar Homestead por projeto.

 Você pode instalar o Homestead em seu projeto usando o gerenciador de pacotes Composer:

```shell
composer require laravel/homestead --dev
```

 Depois de instalado, invocar o comando "make" do Homestead para gerar os arquivos "Vagrantfile" e "Homestead.yaml" para seu projeto. Esses arquivos serão colocados na raiz do seu projeto. O comando "make" irá configurar automaticamente as diretivas "sites" e "folders" no arquivo "Homestead.yaml":

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```

 Em seguida, execute o comando `vagrant up` no terminal e acesse seu projeto em `http://homestead.test` em seu navegador. Lembre-se de que você ainda precisará adicionar uma entrada no arquivo `/etc/hosts` para `homestead.test` ou o domínio de sua escolha, se não estiver usando a resolução automática do hostname.

<a name="installing-optional-features"></a>
### Instalando recursos opcionais

 O software opcional é instalado utilizando a opção `features` na sua ficheiro `Homestead.yaml`. A maioria dos recursos pode ser ativada ou desativada com um valor boolean, ao passo que alguns permitem várias opções de configuração:

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

 Você pode especificar uma versão de Elasticsearch suportada, que deve ser um número de versão exato (principal.minor.patch). A instalação por padrão criará um cluster chamado 'Homestead'. Nunca dê ao Elasticsearch mais da metade da memória do sistema operacional. Assim, verifique se a máquina virtual Homestead tem pelo menos duas vezes a alocação do Elasticsearch.

 > [!ATENÇÃO]
 Para aprender a personalizar sua configuração, consulte o [Documento do Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/).

<a name="mariadb"></a>
#### MariaDB

 A ativação do MariaDB irá remover o MySQL e instalar o MariaDB. O MariaDB normalmente serve como substituto direto para o MySQL, então você ainda deve usar o driver de banco de dados `mysql` na configuração do banco de dados da aplicação.

<a name="mongodb"></a>
#### MongoDB

 A instalação padrão do MongoDB definirá o nome de utilizador para o banco de dados como `homestead` e a respetiva palavra-passe como `secret`.

<a name="neo4j"></a>
#### Neo4j

 Na instalação padrão do Neo4j, o nome de utilizador e a respetiva palavra-passe serão definidas como `homestead` e `secret`, respetivamente. Para aceder ao browser do Neo4j, visite o endereço `http://homestead.test:7474` no seu navegador da Web. Os portos `7687` (Bolt), `7474` (HTTP) e `7473` (HTTPS) estão prontos para receberem pedidos do cliente Neo4j.

<a name="aliases"></a>
### Alias

 Você pode adicionar alias do Bash à máquina virtual do Homestead modificando o arquivo "aliases" na pasta Homestead.

```shell
alias c='clear'
alias ..='cd ..'
```

 Depois de atualizar o arquivo `aliases`, será necessário fornecer novamente a máquina virtual Homestead usando o comando `vagrant reload --provision`. Isso garantirá que seus novos aliases estejam disponíveis na máquina.

<a name="updating-homestead"></a>
## Atualização do Homestead

 Antes de começar a atualizar o Homestead, certifique-se de que remova sua máquina virtual corrente executando o comando a seguir no diretório do Homestead:

```shell
vagrant destroy
```

 Em seguida, você precisa atualizar o código-fonte do Homestead. Se você copiou o repositório, pode executar os seguintes comandos no local onde originalmente copiou o repositório:

```shell
git fetch

git pull origin release
```

 Estes comandos puxam o código mais recente da Homestead do repositório GitHub, recuperam as últimas etiquetas e então fazem a integração com a última versão etiquetada. Pode encontrar a versão mais estável da liberação mais recente na [página de lançamentos do GitHub](https://github.com/laravel/homestead/releases).

 Se você instalou o Homestead por meio do arquivo `composer.json` do seu projeto, certifique-se que esse arquivo contenha `"laravel/homestead": "^12"` e atualize suas dependências:

```shell
composer update
```

 Em seguida você deverá atualizar a caixa do Vagrant usando o comando `vagrant box update`:

```shell
vagrant box update
```

 Depois de atualizar a caixa Vagrant, você deve executar o comando "bash init.sh" do diretório Homestead para atualizar os arquivos de configuração adicionais da Homestead. Será perguntado se deseja substituir seus arquivos existentes "Homestead.yaml", "after.sh" e "aliases":

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

 Finalmente, você precisará regenerar sua máquina virtual do Homestead para utilizar a última instalação da Vagrant.

```shell
vagrant up
```

<a name="daily-usage"></a>
## Uso diário

<a name="connecting-via-ssh"></a>
### Conectando através do SSH

 Você pode entrar em sua máquina virtual executando o comando de terminal "vagrant ssh" a partir do diretório da HomeStead.

<a name="adding-additional-sites"></a>
### Adicionar locais adicionais

 Quando o ambiente Homestead estiver provisionado e em funcionamento, poderá desejar adicionar sites do Nginx para os seus outros projetos Laravel. Pode executar no mesmo ambiente tantos projetos Laravel quantos pretender. Para adicionar um site, basta acrescentá-lo ao ficheiro `Homestead.yaml`.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

 > Atenção:
 [mapeamento de pastas (#configurando-pastas-compartilhadas)](/pt-br/docs/user-guide/projects) para o diretório do projeto antes de adicionar o site.

 Se o Vagrant não estiver gerenciando automaticamente seu arquivo "hosts", talvez seja necessário adicionar o novo site a esse arquivo. No macOS e Linux, este arquivo está localizado em `/etc/hosts`. No Windows, ele está localizado em `C:\Windows\System32\drivers\etc\hosts`:

```
    192.168.56.56  homestead.test
    192.168.56.56  another.test
```

 Depois que o site for adicionado, execute o comando de terminal `vagrant reload --provision` a partir do diretório da Vagrantfile (Homestead).

<a name="site-types"></a>
#### Tipos de Sites

 O Homestead suporta vários tipos de sites que permitem executar facilmente projetos que não são baseados em Laravel. Por exemplo, podemos facilmente adicionar um aplicativo Statamic ao Homestead usando o tipo de site `statamic`:

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

 Os tipos de site disponíveis são: `apache`, `apache-proxy`, `apigility`, `expressive`, `laravel` (padrão), `proxy` (para o nginx), `silverstripe`, `statamic`, `symfony2`, `symfony4` e `zf`.

<a name="site-parameters"></a>
#### Parâmetros do site

 Você pode adicionar valores adicionais de parâmetros do `fastcgi_param` do Nginx ao seu site através da diretiva de site "params":

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      params:
          - key: FOO
            value: BAR
```

<a name="environment-variables"></a>
### Variáveis Ambientais

 Você pode definir variáveis de ambiente globais adicionando-as ao seu arquivo `Homestead.yaml`:

```yaml
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

 Após a atualização do ficheiro `Homestead.yaml`, certifique-se de proceder novamente ao fornecimento da máquina através da execução do comando `vagrant reload --provision`. Isso atualizará a configuração PHP-FPM para todas as versões instaladas do PHP e também atualizará o ambiente para o utilizador `vagrant`.

<a name="ports"></a>
### Portos

 Por padrão, as seguintes portas são encaminhadas ao seu ambiente Homestead:

<div class="content-list" markdown="1">

 - ** HTTP:** 8000 &rarr; Encaminhado para o endereço 80
 - **HTTPS:** 44300 → encaminha para 443

</div>

<a name="forwarding-additional-ports"></a>
#### Encaminhamento de portas adicionais

 Se desejado, você poderá enviar portas adicionais para a caixa do Vagrant definindo uma entrada de configuração "ports" dentro do seu arquivo "Homestead.yaml". Depois de atualizar o arquivo "Homestead.yaml", não deixe de reprovisionar a máquina executando o comando "vagrant reload --provision":

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

 Abaixo está uma lista de portas adicionais do serviço Homestead que você pode querer mapear da sua máquina anfitriã para a caixa Vagrant:

<div class="content-list" markdown="1">

 - **SSH:** 2222 &rarr; Para 22
 - **NGROK UI**: **4040 <-> 4040**
 - **MySQL:** 33060 → 3306
 - **PostgreSQL:** 54320 &rarr; Para 5432
 - **MongoDB:** 27017 &rarr; Para 27017
 - **Mailpit:** 8025 → 8025
 - **Minio:** 9600 &rarr; Para 9600

</div>

<a name="php-versions"></a>
### Versões do PHP

 Homestead permite o funcionamento de várias versões do PHP na mesma máquina virtual. Você pode especificar qual a versão do PHP que será utilizada para um determinado site dentro da sua `Homestead.yaml`. As versões disponíveis são: "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0", "8.1", "8.2" e "8.3". (o padrão é a última):

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

 [Nas suas máquinas virtuais do Homestead (#conectando-se-pela-SSH)] você pode utilizar qualquer uma das versões de PHP suportadas através da CLI.

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

 Pode alterar a versão padrão de PHP utilizada na linha de comando através dos seguintes comandos da sua máquina virtual Homestead:

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
### Conectar-se a bases de dados

 Uma base de dados "homestead" está configurada para MySQL e PostgreSQL, pronta a ser utilizada. Para se ligar à base de dados MySQL ou PostgreSQL no cliente da base de dados da máquina anfitriã, é necessário ligar-se ao "127.0.0.1" na porta "33060" (MySQL) ou "54320" (PostgreSQL). O nome de utilizador e a palavra-passe para as duas bases de dados é "homestead"/"secret".

 > [!AVISO]
 > Você só deve usar essas portas não-padrão ao se conectar aos bancos de dados da máquina anfitriã. Utilizará as portas padrões 3306 e 5432 no arquivo de configuração `database` do seu aplicativo Laravel, uma vez que o Laravel está sendo executado DENTRO DA máquina virtual.

<a name="database-backups"></a>
### Backup de banco de dados

 O Homestead pode fazer o backup automático do seu banco de dados quando a sua máquina virtual é destruída. Para utilizar este recurso, tem de ter uma versão Vagrant superior ou igual a 2.1.0 ou instalar o plug-in `vagrant-triggers`. Para habilitar os backups automáticos do banco de dados, acrescente a seguinte linha ao seu ficheiro Homestead.yaml:

```
    backup: true
```

 Uma vez configurado, o Homestead exportará seus bancos de dados para as pastas `.backup/mysql_backup` e `.backup/postgres_backup`, quando o comando `vagrant destroy` for executado. Essas pastas podem ser encontradas no diretório onde você instalou o Homestead ou na raiz do seu projeto, caso esteja usando o método de instalação por [projetos](#per-project-installation).

<a name="configuring-cron-schedules"></a>
### Configure os horários do cron

 O Laravel fornece uma maneira prática de [programar tarefas cron](/docs/scheduling) programando um único comando Artisan "schedule:run" para ser executado a cada minuto. O comando "schedule:run" analisará o calendário definido em seu arquivo "routes/console.php" para determinar quais tarefas agendadas devem ser executadas.

 Se você deseja que o comando `schedule:run` seja executado para um site do tipo Homestead, defina a opção `schedule` como `true`, quando definir o site:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

 O trabalho do cron para o site será definido no diretório `/etc/cron.d` da máquina virtual Homestead.

<a name="configuring-mailpit"></a>
### Como configurar o Mailpit

 [Mailpit](https://github.com/axllent/mailpit) permite interceptar o seu email de saída e examiná-lo sem enviar um correio ao destinatário. Para começar, atualize o arquivo `.env` da sua aplicação para usar os seguintes ajustes de correio:

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

 Uma vez que o Mailpit tenha sido configurado, pode aceder ao painel do Mailpit em `http://localhost:8025`.

<a name="configuring-minio"></a>
### Configurando o Minio

 O [Minio](https://github.com/minio/minio) é um servidor de armazenamento de objetos com API compatível com a Amazon S3, em código fonte aberto. Para instalar o Minio, atualize seu arquivo `Homestead.yaml` com a seguinte opção de configuração na seção [Características](#instalando-características-opcionais):

 minio: false

 Por padrão, o Minio está disponível na porta 9600. Você pode acessar o painel do Minio visitando `http://localhost:9600`. A chave de acesso padrão é `homestead`, enquanto a chave secreta é `secretkey`. Quando acessar o Minio, você deve sempre usar a região `us-east-1`.

 Para usar o Minio, certifique-se de que o seu arquivo `.env` tenha as seguintes opções:

```ini
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_ENDPOINT=http://localhost:9600
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
```

 Para fornecer contas do Minio com o nome "S3", adicione uma diretiva `buckets` ao seu arquivo `Homestead.yaml`. Depois de definir as suas contas, você deve executar o comando `vagrant reload --provision` em seu terminal:

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

 Os valores de política suportados incluem: `nada`, `baixar`, `fazer upload` e `público`.

<a name="laravel-dusk"></a>
### Laravel Dusk

 Para executar os testes de [Dusk Laravel] (/) / docs/{{ version }}/dusk dentro da Homestead, você deve habilitar o recurso [`webdriver`](#instalando-recursos-opcionais) em sua configuração do Homestead:

```yaml
features:
    - webdriver: true
```

 Depois de ativar o recurso `webdriver`, você deve executar o comando `vagrant reload --provision` em seu terminal.

<a name="sharing-your-environment"></a>
### Partilhar o seu ambiente

 Às vezes você pode querer compartilhar o que está trabalhando com seus colegas ou um cliente. Vagrant tem suporte integrado para isso através do comando "vagrant share". No entanto, ele não funciona se tiver vários sites configurados em seu arquivo `Homestead.yaml`.

 Para resolver este problema, o Homestead inclui um comando próprio chamado "share". Inicie-o [executando o comando `vagrant ssh` e entrar no seu computador virtual do Homestead através de SSH](#connecting-via-ssh)], execute o comando "share homestead.test" para compartilhar o site `homestead.test`, conforme definido na sua configuração no arquivo "Homestead.yaml". Pode substituir este site por qualquer outro definido:

```shell
share homestead.test
```

 Após executar o comando, você verá um ecrã do Ngrok que contém o registo de atividades e os URL públicos para o site compartilhado. Se pretender especificar uma região personalizada, um subdomínio ou outra opção de execução do Ngrok, poderá adicioná-los ao seu comando `share`:

```shell
share homestead.test -region=eu -subdomain=laravel
```

 Se você precisa compartilhar conteúdo com segurança HTTPS e não HTTP, o uso do comando `sshare`, ao invés de `share`, permite que você faça isso.

 > [!ALERTA]
 > Lembre-se de que o Vagrant é intrinsecamente inseguro e você está expondo sua máquina virtual para a Internet ao executar o comando `share`.

<a name="debugging-and-profiling"></a>
## Depuração e Otimização

<a name="debugging-web-requests"></a>
### Depurando solicitações da web com o xdebug

 O Homestead inclui suporte para depuração por passos usando o [Xdebug](https://xdebug.org). Por exemplo, você pode acessar uma página em seu navegador e PHP se conectará ao seu IDE para permitir inspeção e modificações do código em execução.

 Por padrão, o Xdebug já está sendo executado e pronto para aceitar conexões. Se você precisar ativar o Xdebug na CLI, execute o comando `sudo phpenmod xdebug` na sua máquina virtual Homestead. Em seguida, siga as instruções do seu IDE para ativar a depuração. Por último, configure o seu navegador para acionar o Xdebug com uma extensão ou um [marcador](https://www.jetbrains.com/phpstorm/marklets/).

 > [Aviso]
 > O Xdebug causa um significativo retardo no tempo de execução do PHP. Para desativar o Xdebug, execute `sudo phpdismod xdebug` na sua máquina virtual Homestead e reinicie o serviço FPM.

<a name="autostarting-xdebug"></a>
#### Inicialização automática do Xdebug

 Ao depurar testes funcionais que fazem solicitações ao servidor web, é mais fácil iniciar a depuração do que modificar os testes para passar por um cabeçalho ou cookie personalizado para iniciar a depuração. Para forçar o Xdebug a ser iniciado automaticamente, modifique o arquivo `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` na sua máquina virtual Homestead e adicione a seguinte configuração:

```ini
; If Homestead.yaml contains a different subnet for the IP address, this address may be different...
xdebug.client_host = 192.168.10.1
xdebug.mode = debug
xdebug.start_with_request = yes
```

<a name="debugging-cli-applications"></a>
### Depuração de aplicações CLI

 Para depurar um aplicativo da CLI do PHP, utilize o alias de shell `xphp` dentro da sua máquina virtual Homestead:

```php
    xphp /path/to/script
```

<a name="profiling-applications-with-blackfire"></a>
### Aplicações de perfil com o Blackfire

 [Blackfire](https://blackfire.io/docs/introduction) é um serviço de perfis de solicitações da Web e aplicativos CLI. Oferece uma interface gráfica interativa que mostra dados de perfil em call-graphs (grafos de chamadas) e linhas de tempo. É ideal para uso no desenvolvimento, no estágio e na produção, sem sobrecarga para os usuários finais. Além disso, o Blackfire oferece verificações de desempenho, qualidade e segurança do código e das configurações da `php.ini`.

 O [Blackfire Player](https://blackfire.io/docs/player/index) é um aplicativo de Rastreamento, Teste Web e Varredura Web com código aberto que pode ser utilizado em conjunto com o Blackfire para criar cenários de análise.

 Para habilitar o Blackfire, utilize a configuração "features" no arquivo de configuração do seu projeto.

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

 As credenciais do servidor e cliente da Blackfire requerem uma conta da Blackfire ([cadastre-se aqui](https://blackfire.io/signup)). A Blackfire oferece várias opções para analisar um aplicativo, incluindo uma ferramenta CLI (Interactive Command Language) e uma extensão do navegador. Por favor, confira a [documentação da Blackfire para mais detalhes](https://blackfire.io/docs/php/integrations/laravel/index).

<a name="network-interfaces"></a>
## Interface de rede

 A propriedade `networks`, no arquivo `Homestead.yaml`, configura as interfaces de rede da sua máquina virtual Homestead. Pode configurá-las quantas necessitar, sendo estas:

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

 Para habilitar uma interface de [ligação direta](https://developer.hashicorp.com/vagrant/docs/networking/public_network), configure a configuração bridge para a rede e altere o tipo de rede para `public_network`:

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

 Para ativar o DHCP (Roteamento público automático do Host Inventário), é necessário remover a opção `ip` da sua configuração:

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

 Para atualizar qual dispositivo está sendo usado na rede, você pode adicionar uma opção `dev` à configuração da rede. O valor padrão para a opção `dev` é `eth0`:

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
      dev: "enp2s0"
```

<a name="extending-homestead"></a>
## Ampliando o Home Sweet Home

 Você pode estender o Homestead usando o script "after.sh" na raiz do diretório Homestead. Dentro desse arquivo, você pode adicionar quaisquer comandos shell que sejam necessários para configurar e personalizar sua máquina virtual corretamente.

 Ao personalizar o Homestead, o Ubuntu pode perguntar se deseja manter ou substituir a configuração original de um pacote por uma nova. Para evitar essa situação, você deve usar o comando seguinte ao instalar os pacotes para evitar substituições de configurações previamente escritas pelo Homestead:

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a name="user-customizations"></a>
### Personalização do Usuário

 Ao usar o Homestead em equipe, você pode querer ajustar o mesmo de modo que seja mais adequado ao seu estilo pessoal de desenvolvimento. Para conseguir isso, crie um arquivo `user-customizations.sh` na raiz do diretório Homestead (o mesmo diretório que contém seu arquivo `Homestead.yaml`). Nesse arquivo, você pode fazer quaisquer personalizações que desejar. No entanto, o conteúdo do `user-customizations.sh` não deve ser controlado por versão.

<a name="provider-specific-settings"></a>
## Configurações do provedor

<a name="provider-specific-virtualbox"></a>
### VirtualBox

<a name="natdnshostresolver"></a>
#### `resolve_host_by_name_service`

 Por padrão, o valor da configuração `natdnshostresolver` é definido como `on`. Isto permite que o Homestead utilize as definições de DNS do seu sistema operativo host. Se pretender ultrapassar este comportamento, deve adicionar as seguintes opções de configuração ao ficheiro `Homestead.yaml`:

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```
