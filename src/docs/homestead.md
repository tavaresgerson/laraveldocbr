# Laravel Homestead

<a name="introduction"></a>
## Introdução

O Laravel busca tornar a experiência de desenvolvimento com PHP agradável, incluindo o seu ambiente de desenvolvimento local. [Laravel Homestead](https://github.com/laravel/homestead) é um Vagrant box pré-embalado e oficial que oferece um ambiente maravilhoso de desenvolvimento sem exigir que você instale PHP, servidor web ou qualquer outro software de servidor na sua máquina local.

O Vagrant (https://www.vagrantup.com) fornece uma maneira simples e elegante de gerenciar e provisionar Máquinas Virtuais. As caixas do Vagrant são completamente descartáveis. Se algo der errado, você pode destruir e recriar a caixa em minutos!

Homestead funciona em qualquer sistema operacional com Windows, macOS ou Linux e inclui Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node e todos os outros softwares que você precisa para desenvolver aplicações incríveis Laravel.

> ¡ALERTA!
> Se você estiver usando o Windows, talvez seja necessário habilitar a virtualização de hardware (VT-x). Isso geralmente pode ser feito através do BIOS. Se você estiver usando o Hyper-V em um sistema UEFI, você também pode precisar desativar o Hyper-V para acessar o VT-x.

<a name="included-software"></a>
### Software Inclusos

<style>
#software-list > ul {
contagem de coluna: 2; -moz-contagem de coluna: 2; -webkit-contagem de coluna: 2;
column-gap: 5em; -moz-column-gap: 5em; -webkit-column-gap: 5em;
line-height: 1.9;
Inglês:
</style>

<div id="software-list" markdown="1">

- Ubuntu 22.04
Git - O que?
PHP 8.3
PHP 8.2
PHP 8.1
- PHP 8.0
PHP 7.4
PHP 7.3
- PHP 7.2
- PHP 7.1
PHP 7.0
PHP 5.6
Nginx
- MySQL 8.0
– I'mm
- SQLite3
- PostgreSQL 15
- Compositor
- Docker
- Nó (com Yarn, Bower, Grunt e Gulp)
- Redis
- Memcached
- Beanstalkd
- Correio
- avahi
ngrok
- Xdebug
- XHProf / Tideways / XHGui
wp-cli

</div>

<a name="optional-software"></a>
### Software opcional

<style>
#software-list > ul {
coluna: 2; -moz-coluna: 2; webkit-coluna: 2;
coluna-espaço: 5em; -moz-coluna-espaço: 5em; -webkit-coluna-espaço: 5em;
line-height: 1.9;
O que você acha?
</style>

<div id="software-list" markdown="1">

- Apache
- Fogo Negro
- Cássandra.
- Cronógrafo
- CouchDB
- Crystal & Lucky Framework
- Elasticsearch
- EventstoreDB
- Passagem aérea
- Gerente de equipamentos
Vamos!
- Grafana
- InfluxDB
- Logstash
- MySQL
MeiliSearch
- MinIO
- MongoDB
- Neo4j
Oh My Zsh
- Abra o Resty
- PM2
Python
R
- RabbitMQ
- ferrugem
- RVM (Ruby Version Manager)
- Solr
- TimescaleDB
- Trader <small>(PHP extension)</small>
- Ferramentas de WebDriver e Dusk do Laravel

</div>

<a name="installation-and-setup"></a>
## Instalação e Configuração

<a name="first-steps"></a>
### Primeiro passo

Antes de lançar seu ambiente Homestead, você deve instalar [Vagrant](https://developer.hashicorp.com/vagrant/downloads) bem como um dos seguintes provedores suportados:

[VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1)
[Paralelos](https://www.parallels.com/products/desktop/)

Todos os pacotes de programas fornecem instaladores visuais fáceis de usar para todos os sistemas operacionais populares.

Para usar o provedor de Parallels, você precisará instalar [o plugin de Vagrant de Parallels](https://github.com/Parallels/vagrant-parallels). É gratuito.

<a name="installing-homestead"></a>
#### Instalando o Homestead

Você pode instalar o Homestead clonado o repositório Homestead na máquina hospedeira. Considere clonar o repositório para uma pasta "Homestead" dentro do seu diretório "casa", pois a máquina virtual Homestead servirá como hospedeiro de todos os seus aplicativos Laravel. Durante esta documentação, referiremos a este diretório como seu "diretório Homestead":

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

Depois de clonar o repositório Laravel Homestead, você deve fazer o checkout do branch 'release'. Este branch sempre contém a última versão estável do Homestead:

```shell
cd ~/Homestead

git checkout release
```

Em seguida, execute o comando `bash init.sh` do diretório da Homestead para criar o arquivo de configuração `Homestead.yaml`. O arquivo `Homestead.yaml` é onde você configurará todos os ajustes da sua instalação Homestead. Este arquivo será colocado no diretório da Homestead:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

<a name="configuring-homestead"></a>
### Configurar o Homestead

<a name="setting-your-provider"></a>
#### Configurar o Provedor de Serviços

A chave 'provider' no seu arquivo 'Homestead.yaml' indica qual provedor Vagrant deve ser usado: 'virtualbox' ou 'parallels':

```yaml
    provider: virtualbox
```

> ¡¡ALERTA!
> Se você estiver usando o Apple Silicon, é necessário utilizar o provedor de paralelismo.

<a name="configuring-shared-folders"></a>
#### Configurar Pastas Compartilhadas

O `folders` do arquivo `Homestead.yaml` lista todos os arquivos que você deseja compartilhar com seu ambiente Homestead. Como arquivos dentro dessas pastas são alterados, eles serão mantidos sincronizados entre sua máquina local e o ambiente virtual Homestead. Você pode configurar quantos pastas compartilhadas forem necessários:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> ¡[AVISO]
> Usuários do Windows não devem usar a sintaxe de caminho "~/", em vez disso, eles devem usar o caminho completo para seu projeto, como "C:\Users\user\Code\project1".

Você deve sempre mapear aplicativos individuais para suas próprias mapeamentos de pasta em vez de mapear um único diretório grande que contém todos os seus aplicativos. Quando você mapeia uma pasta, a máquina virtual precisa manter o controle de todas as operações de entrada/saída do disco para cada arquivo na pasta. Você pode experimentar um desempenho reduzido se tiver um grande número de arquivos em uma pasta:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

> [Aviso!]
> Você nunca deve montar `.` (o diretório atual) ao usar o Homestead. Isso faz com que o Vagrant não mapeie a pasta atual para `/vagrant` e causará problemas em recursos opcionais e resultados inesperados durante o provisionamento.

Para habilitar [NFS] (https://developer.hashicorp.com/vagrant/docs/synced-folders/nfs) você pode adicionar uma opção "type" em seu mapeamento de pastas:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> ¡[AVISO]
> Ao usar o NFS no Windows, você deve considerar instalar o plugin [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd). Esse plugin vai manter as permissões corretas de usuário/grupo para arquivos e diretórios dentro da máquina virtual Homestead.

Você também pode passar em opções suportadas por Vagrant's [Synced Folders](https://developer.hashicorp.com/vagrant/docs/synced-folders/basic_usage) listando-as abaixo da chave 'opções':

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
### Configurando sites no Nginx

Não se acostumado com Nginx? Sem problema. Sua propriedade 'sites' no arquivo "Homestead.yaml" permite facilmente mapear um "domínio" para uma pasta em seu ambiente "Homestead". Um exemplo de configuração do site está incluído no arquivo "Homestead.yaml". Novamente, você pode adicionar quantos sites forem necessários ao seu ambiente "Homestead". O Homestead pode servir como um ambiente virtualizado conveniente para cada aplicação Laravel na qual você esteja trabalhando:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

Se você alterar a propriedade 'sites' depois de provisionar o virtual machine Homestead, você deve executar o comando 'vagrant reload --provision' no seu terminal para atualizar a configuração do Nginx na máquina virtual.

> [ALERTA!!]
> Os scripts do Homestead são construídos para serem tão idempotentes quanto possível. No entanto, se você estiver enfrentando problemas durante a provisão, você deve destruir e reconstruir a máquina executando o comando "vagrant destroy && vagrant up".

<a name="hostname-resolution"></a>
#### Resolução de Nomes

Homestead publica hostnames usando `mDNS` para resolução automática de hosts. Se você definir `hostname: homestead` no seu arquivo `Homestead.yaml`, o host estará disponível em `homestead.local`. macOS, iOS e distribuições Linux desktop incluem suporte a `mDNS` nativamente. Se você estiver usando Windows, você deve instalar [Bonjour Print Services for Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US).

Usar nomes de host automáticos funciona melhor para [instalações por projeto](#per-project-installation) do Homestead. Se você hospedar vários sites em uma única instalação do Homestead, você pode adicionar os "domínios" para seus sites ao arquivo 'hosts' na sua máquina. O arquivo 'hosts' irá redirecionar as requisições para seus sites do Homestead para a sua máquina virtual do Homestead. No macOS e Linux, este arquivo está localizado em '/etc/hosts'. No Windows, ele está localizado em 'C:\Windows\System32\drivers\etc\hosts'. As linhas que você adicionar a este arquivo serão parecidas com as seguintes:

```
    192.168.56.56  homestead.test
```

Certifique-se de que o endereço IP listado é o mesmo definido no seu arquivo 'Homestead.yaml'. Uma vez que você tenha adicionado o domínio ao seu arquivo 'hosts' e lançado a máquina virtual do Vagrant, você poderá acessar o site através de um navegador da web:

```shell
http://homestead.test
```

<a name="configuring-services"></a>
### Configurar Serviços

Homestead inicia vários serviços por padrão; no entanto, você pode personalizar quais serviços estão ativados ou desativados durante a provisão. Por exemplo, você pode habilitar o PostgreSQL e desabilitar o MySQL modificando a opção "services" dentro do arquivo Homestead.yaml:

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

Os serviços especificados serão iniciados ou interrompidos com base em suas posições na diretiva 'habilitado' e 'desabilitado'.

<a name="launching-the-vagrant-box"></a>
### Iniciando a Vagrant Box

Depois de editar o Homestead.yaml como você quiser, execute a ordem "vagrant up" do diretório da Homestead. O Vagrant irá inicializar a máquina virtual e configurar automaticamente suas pastas compartilhadas e seus sites do Nginx.

Para destruir a máquina, você pode usar o comando `vagrant destroy`.

<a name="per-project-installation"></a>
### Instalação do Projeto em Inglês

Em vez de instalar o Homestead globalmente e compartilhar a mesma máquina virtual Homestead em todos os seus projetos, você pode configurar uma instância do Homestead para cada projeto que você administra. Instalar o Homestead por projeto pode ser benéfico se você quiser enviar um Vagrantfile com seu projeto, permitindo que outros trabalhando no projeto possam "vagrant up" imediatamente após clonar o repositório do projeto.

Você pode instalar o Homestead no seu projeto usando o gerenciador de pacotes Composer:

```shell
composer require laravel/homestead --dev
```

Depois de instalado o Homestead, invoque o comando make do Homestead para gerar os arquivos Vagrantfile e Homestead.yaml para seu projeto. Esses arquivos serão colocados na raiz do seu projeto. O comando make irá configurar automaticamente as diretivas sites e folders no arquivo Homestead.yaml:

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```

Em seguida, execute o comando vagrant up no seu terminal e acesse o projeto em http://homestead.test no navegador. Lembre-se de que você ainda precisará adicionar um registro an/etc/hosts para homestead.test ou o domínio de sua escolha se você não estiver usando a resolução automática do [hostname](#hostname-resolution).

<a name="installing-optional-features"></a>
### Instalando Recursos Opcionais

O software opcional é instalado usando a opção 'features' dentro do seu arquivo 'Homestead.yaml'. A maioria das opções pode ser ativada ou desativada usando um valor booleano, enquanto algumas opções permitem várias configurações:

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

Você pode especificar uma versão suportada do Elasticsearch, que deve ser um número de versão exato (maior.menor.reparação). A instalação padrão criará um cluster chamado 'Homestead'. Você nunca deve dar ao Elasticsearch mais da metade da memória do sistema operacional, então certifique-se de sua máquina virtual Homestead ter pelo menos o dobro da alocação do Elasticsearch.

> Nota!
> Confira a documentação do [Elasticsearch] (https://www.elastic.co/guide/pt-br/elasticsearch/reference/current) para aprender como personalizar sua configuração.

<a name="mariadb"></a>
#### MariaDB

A habilitação do MariaDB irá remover o MySQL e instalará o MariaDB. O MariaDB normalmente serve como um substituto "drop-in" para o MySQL, então você ainda deve usar o driver de banco de dados `mysql` em sua configuração de banco de dados do aplicativo.

<a name="mongodb"></a>
#### MongoDB

A instalação padrão do MongoDB vai definir o nome de usuário do banco de dados como “homestead” e a senha correspondente como “secret”.

<a name="neo4j"></a>
#### Neo4j

A instalação padrão do Neo4j irá definir o nome do usuário do banco de dados como 'homestead' e a senha correspondente como 'secret'. Para acessar o navegador Neo4j, visite 'http://homestead.test:7474' via seu navegador da web. As portas '7687' (Bolt), '7474' (HTTP) e '7473' (HTTPS) estão prontas para atender as requisições do cliente Neo4j.

<a name="aliases"></a>
### Aliás

Você pode adicionar aliases do bash para sua máquina virtual Homestead modificando o arquivo "aliases" dentro do diretório da Homestead:

```shell
alias c='clear'
alias ..='cd ..'
```

Após atualizar o arquivo 'aliases', você deve reaprovisionar a máquina virtual da Homestead usando o comando 'vagrant reload --provision'. Isso garantirá que seus novos 'alias' estejam disponíveis na máquina.

<a name="updating-homestead"></a>
## Atualizando a fazenda de casa

Antes de começar a atualizar o Homestead, certifique-se de que você removeu sua máquina virtual atual executando o seguinte comando no diretório do Homestead:

```shell
vagrant destroy
```

A seguir, você precisa atualizar o código-fonte do Homestead. Se você clonou o repositório, você pode executar os seguintes comandos na localização onde originalmente clonou o repositório:

```shell
git fetch

git pull origin release
```

Esses comandos puxam o código mais recente do repositório GitHub da Homestead, então eles procuram as tags mais recentes e depois verificam a última versão marcada. Você pode encontrar a versão estável mais recente na página de lançamento do GitHub da Homestead ([https://github.com/laravel/homestead/releases](https://github.com/laravel/homestead/releases)).

Se você instalou a Homestead usando o arquivo composer.json do seu projeto, você deve garantir que o seu arquivo composer.json contenha "laravel/homestead": "^12" e atualize suas dependências:

```shell
composer update
```

Em seguida, você deve atualizar a caixa do Vagrant usando o comando `vagrant box update`:

```shell
vagrant box update
```

Depois de atualizar a caixa Vagrant, você deve executar o comando "bash init.sh" do diretório Homestead a fim de atualizar os arquivos de configuração adicionais do Homestead. Você será solicitado se deseja sobrescrever seus arquivos existentes "Homestead.yaml", "after.sh" e "aliases":

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

Finalmente, você precisará regenerar a máquina virtual Homestead para usar a última instalação do Vagrant.

```shell
vagrant up
```

<a name="daily-usage"></a>
## Uso Diário

<a name="connecting-via-ssh"></a>
### Conexão via SSH

Você pode SSH em sua máquina virtual executando o comando do terminal "vagrant ssh" a partir de seu diretório da Homestead.

<a name="adding-additional-sites"></a>
### Adicionando Sites Adicionais

Depois que sua configuração do Homestead estiver pronta e em funcionamento, você pode querer adicionar outros sites Nginx para seus outros projetos Laravel. Você pode executar quantos projetos Laravel quiser em um único ambiente Homestead. Para adicionar outro site, adicione o site ao seu arquivo `Homestead.yaml`.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

> [Aviso]
> Você deve garantir que você configurou um [mapeamento de pastas](#configurando-pasta-compartilhada ) para o diretório do projeto antes de adicionar o site.

Se o Vagrant não estiver gerenciando automaticamente o seu arquivo "hosts", talvez você precise adicionar o novo site a este arquivo também. No macOS e no Linux, este arquivo está localizado em `/etc/hosts`. No Windows, ele está localizado em `C:\Windows\System32\drivers\etc\hosts`:

```
    192.168.56.56  homestead.test
    192.168.56.56  another.test
```

Depois que o local foi adicionado, executar o comando de linha de comando `vagrant reload --provision` do seu diretório da Homestead.

<a name="site-types"></a>
#### Tipos de Sites

A Homestead suporta vários "tipos" de sites que permitem executar projetos não baseados no Laravel facilmente. Por exemplo, podemos adicionar um aplicativo Statamic na Homestead usando o tipo de site `statamic`:

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

Os tipos de site disponíveis são: 'apache', 'apache-proxy', 'apigility', 'expressive', 'laravel' (o padrão), 'proxy' (para nginx), 'silverstripe', 'statamic', 'symfony2', 'symfony4' e 'zf'.

<a name="site-parameters"></a>
#### Parâmetros do site

Você pode adicionar valores adicionais do parâmetro `fastcgi_param` no seu site usando a diretiva `params`:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      params:
          - key: FOO
            value: BAR
```

<a name="environment-variables"></a>
### Variáveis de Ambiente

Você pode definir variáveis de ambiente globais adicionando-as ao seu arquivo `Homestead.yaml`:

```yaml
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

Depois de atualizar o arquivo Homestead.yaml certifique-se de re-provisionar a máquina executando o comando vagrant reload --provision. Isso irá atualizar a configuração do PHP-FPM para todas as versões instaladas de PHP, e também irá atualizar o ambiente para o usuário `vagrant`.

<a name="ports"></a>
### Portos

Por padrão, os seguintes portos são encaminhados para o seu ambiente Homestead:

<div class="content-list" markdown="1">

- **HTTP**: 8000 --> Para 80
- **HTTPS:** 44300 &arrowr; Forwarda para o 443

</div>

<a name="forwarding-additional-ports"></a>
#### Encaminhando portas adicionais

Se desejar, você pode encaminhar mais portas para o Vagrant box definindo uma configuração de entrada de `ports` dentro do seu arquivo `Homestead.yaml`. Depois de atualizar o arquivo `Homestead.yaml`, certifique-se de reconfigurar a máquina executando o comando `vagrant reload --provision`:

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

Abaixo está uma lista de portas adicionais do serviço Homestead que você pode querer mapear da sua máquina hospedeira para a sua caixa Vagrant:

<div class="content-list" markdown="1">

- **SSH:** 2222 → 22
ngrok UI: 4040 → 4040
- **MySQL:** 33060 &rarr; 3306
- PostgreSQL: 54320 → 5432
- **MongoDB**: 27017 -> 27017
- **Mailpit**: 8025 -> 8025
- **Minio:** 9600 → 9600

</div>

<a name="php-versions"></a>
### Versões PHP

Homestead suporta a execução de múltiplas versões do PHP na mesma máquina virtual. Você pode especificar qual versão do PHP usar para um determinado site dentro seu arquivo `Homestead.yaml`. As versões disponíveis do PHP são: "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0", "8.1", "8.2" e "8.3" (a padrão).

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

[Dentro de sua máquina virtual Homestead](#conectando-via-ssh), você pode usar qualquer versão suportada do PHP via linha de comando:

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

Você pode alterar a versão padrão do PHP usado pelo CLI emitindo os seguintes comandos dentro de sua máquina virtual Homestead:

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
### Conectando com Bases de Dados

Um banco de dados `Homestead` é configurado para MySQL e PostgreSQL 'fora da caixa'. Para se conectar ao seu banco de dados MySQL ou PostgreSQL a partir do cliente de banco de dados em sua máquina host, você deve se conectar em `127.0.0.1` na porta `33060` (MySQL) ou `54320` (PostgreSQL). O nome de usuário e senha para ambos os bancos de dados é `homestead`  / `secret`.

> ¡ADVERTENCIA!
> Você deve usar apenas esses não-padrão quando conectar aos bancos de dados a partir do host machine. Você irá utilizar os portas padrão 3306 e 5432 em arquivo de configuração `database` da sua aplicação Laravel, pois o Laravel está sendo executado _dentro_ do virtual machine.

<a name="database-backups"></a>
### Backup de banco de dados

A Homestead pode fazer um backup automático do seu banco de dados quando a sua máquina virtual Homestead é destruída. Para usar esse recurso, você deve estar usando Vagrant 2.1.0 ou maior. Ou, se estiver usando uma versão mais antiga do Vagrant, precisa instalar o plug-in `vagrant-triggers`. Para habilitar backups automáticos do banco de dados, adicione a seguinte linha ao seu arquivo `Homestead.yaml`:

```
    backup: true
```

Uma vez configurada, a Homestead irá exportar seu banco de dados para as pastas `.backup/mysql_backup` e `.backup/postgres_backup` quando executar o comando `vagrant destroy`. Você pode encontrar essas pastas na pasta onde você instalou a Homestead ou na raiz do seu projeto se estiver usando o método [instalação por projeto](#per-project-installation).

<a name="configuring-cron-schedules"></a>
### Configurando horários do cron

Laravel fornece um jeito prático de [agendar trabalhos agendados](/docs/{{version}}/scheduling) através da programação do comando Artisan 'schedule:run' para ser executado a cada minuto. O comando 'schedule:run' examinará o agendamento de tarefas definido no seu arquivo 'routes/console.php' para determinar quais tarefas agendadas serão executadas.

Se você gostaria que o comando 'schedule:run' fosse executado para um site do Homestead, você pode definir a opção 'schedule' como 'true' ao definir o site:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

A tarefa cron para o site será definida na pasta `/etc/cron.d` da máquina virtual Homestead.

<a name="configuring-mailpit"></a>
### Configurar o Mailpit

O [Mailpit](https://github.com/axllent/mailpit) permite interceptar seus e-mails e examiná-los sem realmente enviar os e-mails aos destinatários. Para começar, atualize o arquivo `.env` da sua aplicação para utilizar as seguintes configurações de e-mail:

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Uma vez que o Mailpit foi configurado, você pode acessar a interface do Mailpit em `http://localhost:8025`.

<a name="configuring-minio"></a>
### Configurar o Minio

Minio é um servidor de armazenamento de objetos com uma API compatível com Amazon S3. Para instalar o Minio, atualize o arquivo Homestead.yaml com a seguinte opção de configuração na seção [features](#instalando-opcional-features):

minio: verdadeiro

Por padrão o Minio está disponível na porta 9600. Você pode acessar o painel de controle do Minio visitando http://localhost:9600. A chave de acesso padrão é 'homestead', enquanto a chave secreta padrão é 'secretkey'. Quando acessar o Minio, você deve sempre usar a região 'us-east-1'

Para usar o Minio, certifique-se de que seu arquivo .env tenha as seguintes opções:

```ini
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_ENDPOINT=http://localhost:9600
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
```

Para fornecer os balde "S3" alimentado pelo Minio, adicione um `balde` diretiva para o seu `Homestead.yaml` arquivo. Após definir seus balde, você deve executar o `vagrant reload -- provision` comando no seu terminal:

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

Os valores de `policy` suportados incluem: `none`, `download`, `upload` e `public`.

<a name="laravel-dusk"></a>
### Laravel Dusk

Para executar testes do [Laravel Dusk]( "/docs/{{version}}/dusk") dentro da Homestead, você deve habilitar a funcionalidade webdriver na configuração da Homestead.

```yaml
features:
    - webdriver: true
```

Após habilitar o recurso `webdriver`, você deve executar o comando `vagrant reload --provision` em seu terminal.

<a name="sharing-your-environment"></a>
### Compartilhar seu ambiente.

Às vezes você pode querer compartilhar o que está trabalhando atualmente com colegas de trabalho ou um cliente. Vagrant oferece suporte nativo para isso através do comando `vagrant share`, mas ele não vai funcionar se você configurar vários sites no seu arquivo `Homestead.yaml`.

Para resolver esse problema, o Homestead inclui seu próprio comando de "compartilhamento". Para começar, faça login na sua máquina virtual do Homestead via SSH e execute o comando `share homestead.test`. Este comando vai compartilhar o site 'homestead.test' em seu arquivo de configuração 'Homestead.yaml'. Você pode substituir qualquer um dos outros sites configurados no lugar de 'homestead.test':

```shell
share homestead.test
```

Depois de executar o comando, você verá uma tela do Ngrok que contém o registro de atividades e os URLs publicamente acessíveis para o site compartilhado. Se você gostaria de especificar uma região personalizada, subdomínio ou outras opções de tempo de execução do Ngrok, você pode adicioná-los ao seu `comando compartilhar`:

```shell
share homestead.test -region=eu -subdomain=laravel
```

Se você precisa compartilhar conteúdo usando HTTPS em vez de HTTP, ao usar o comando `sshare` em vez do `share`, será possível fazê-lo.

> [!ALERTA]
> Lembre-se que o Vagrant é inerentemente inseguro e você está expondo sua máquina virtual à internet ao executar o comando 'share'.

<a name="debugging-and-profiling"></a>
## Depuração e Perfis

<a name="debugging-web-requests"></a>
### Depurando Solicitações Web com Xdebug

Homesteader inclui suporte para depuração passo-a-passo usando [Xdebug](https://xdebug.org). Por exemplo, você pode acessar uma página em seu navegador e o PHP vai se conectar ao seu IDE para permitir inspeção e modificação do código em execução.

Por padrão, o Xdebug já está em execução e pronto para aceitar conexões. Se você precisar habilitar o Xdebug no CLI, execute o comando sudo phpenmod xdebug dentro da sua máquina virtual Homestead. Em seguida, siga as instruções do seu IDE para habilitar a depuração. Finalmente, configure o seu navegador para acionar o Xdebug com uma extensão ou um [bookmarklet](https://www.jetbrains.com/phpstorm/marklets/).

> [!Aviso]
> O Xdebug deixa o PHP executar significativamente mais lento. Para desativar o Xdebug, execute 'sudo phpdismod xdebug' dentro da sua máquina virtual da Homestead e reinicie o serviço do FPM.

<a name="autostarting-xdebug"></a>
#### Iniciar automaticamente o Xdebug

Ao depurar testes funcionais que fazem requisições ao servidor web, é mais fácil autostartar a depuração em vez de modificar os testes para passar um cabeçalho ou cookie personalizado para acionar a depuração. Para forçar o Xdebug a iniciar automaticamente, modifique o arquivo `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` dentro do seu Homestead virtual machine e adicione a seguinte configuração:

```ini
; If Homestead.yaml contains a different subnet for the IP address, this address may be different...
xdebug.client_host = 192.168.10.1
xdebug.mode = debug
xdebug.start_with_request = yes
```

<a name="debugging-cli-applications"></a>
### Depuração de Aplicações CLI

Para depurar um aplicativo PHP CLI, utilize o alias de shell `xphp` dentro de sua máquina virtual da Homestead:

```php
    xphp /path/to/script
```

<a name="profiling-applications-with-blackfire"></a>
### Aplicações de perfilamento com Blackfire

[Blackfire](https://blackfire.io/docs/introduction) é um serviço de perfis para requisições web e aplicativos CLI. Ele oferece uma interface de usuário interativa que exibe dados de perfil em chamadas de grafos e cronogramas. É construído para uso no desenvolvimento, estágio e produção, sem sobrecarga para usuários finais. Além disso, Blackfire fornece verificações de desempenho, qualidade e segurança de código e configurações `php.ini`.

O [Blackfire Player](https://blackfire.io/docs/player/index) é um aplicativo Web Crawling, Web Testing, e Web Scraping de código aberto que pode trabalhar junto com o Blackfire para criar cenários de perfis.

Para habilitar o Blackfire, utilize a configuração "features" em seu arquivo de configuração do Homestead:

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

Credenciais de servidor e credenciais de cliente do Blackfire [exigem uma conta Blackfire](https://blackfire.io/signup). O Blackfire oferece várias opções para perfilar um aplicativo, incluindo uma ferramenta CLI e extensão do navegador. Por favor revise a documentação do Blackfire para obter mais detalhes [https://blackfire.io/docs/php/integrations/laravel/index].

<a name="network-interfaces"></a>
## Interface de rede

O `rede` do arquivo `Homestead.yaml` configura interfaces de rede para a sua máquina virtual Homestead. Você pode configurar quantas interfaces forem necessárias.

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

Para habilitar uma [interface](https://developer.hashicorp.com/vagrant/docs/networking/public_network) de ponte, configure a configuração `bridge` para a rede e altere o tipo de rede para `public_network`:

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

Para habilitar [DHCP](https://developer.hashicorp.com/vagrant/docs/networking/public_network#dhcp), basta remover a opção "ip" da configuração:

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

Para atualizar o dispositivo que a rede está usando, você pode adicionar uma opção `dev` na configuração da rede. O valor padrão para a opção é "eth0":

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
      dev: "enp2s0"
```

<a name="extending-homestead"></a>
## Extensão da Fazenda

Você pode estender a Homestead usando o script 'after.sh' na raiz do diretório da Homestead. Dentro deste arquivo, você pode adicionar todos os comandos de shell que são necessários para configurar e personalizar corretamente sua máquina virtual.

Quando estiver personalizando o Homestead, o Ubuntu pode perguntar se você gostaria de manter a configuração original do pacote ou sobrescrevê-la com uma nova. Para evitar isso, você deve usar o seguinte comando ao instalar pacotes para evitar sobrescrever qualquer configuração previamente escrita pelo Homestead:

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a name="user-customizations"></a>
### Personalizações do usuário

Ao usar o Homestead com sua equipe você pode querer ajustar o Homestead para se adequar melhor ao seu estilo de desenvolvimento pessoal. Para fazer isso, você pode criar um arquivo de 'user-customizations.sh' na raiz do diretório Homestead (o mesmo diretório que contém seu arquivo 'Homestead.yaml'). Dentro deste arquivo, você pode fazer as personalizações desejadas; porém o 'user-customizations.sh' não deve ser gerenciado por controle de versão.

<a name="provider-specific-settings"></a>
## Configurações específicas do provedor

<a name="provider-specific-virtualbox"></a>
### VirtualBox

<a name="natdnshostresolver"></a>
#### "natdnhostresolver"

Por padrão, Homestead configura a configuração "natdnshostresolver" para "on". Isso permite que Homestead utilize as configurações de DNS do sistema operacional host. Se quiser sobrepor esse comportamento, adicione as seguintes opções de configuração ao seu arquivo "Homestead.yaml":

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```
