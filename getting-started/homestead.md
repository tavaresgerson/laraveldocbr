# Homestead

## Introdução
O Laravel se esforça para tornar agradável toda a experiência de desenvolvimento do PHP, incluindo o seu ambiente 
de desenvolvimento local. O [Vagrant](https://www.vagrantup.com/) fornece uma maneira simples e elegante de gerenciar e provisionar máquinas virtuais.

O Laravel Homestead é uma caixa oficial e pré-empacotada do Vagrant que fornece um maravilhoso ambiente de 
desenvolvimento sem a necessidade de instalar PHP, um servidor web e qualquer outro software de servidor em 
sua máquina local. Não precisa mais se preocupar em estragar seu sistema operacional! Caixas Vagrant são 
completamente descartáveis. Se algo der errado, você pode destruir e recriar a caixa em minutos!

O Homestead roda em qualquer sistema Windows, Mac ou Linux e inclui Nginx, PHP, MySQL, PostgreSQL, Redis, 
Memcached, Node e todos os outros itens que você precisa para desenvolver aplicativos Laravel incríveis.

> Se você estiver usando o Windows, pode ser necessário ativar a virtualização de hardware (VT-x). Geralmente, 
> ele pode ser ativado via BIOS. Se você estiver usando o Hyper-V em um sistema UEFI, poderá ser necessário 
> desativar o Hyper-V para acessar o VT-x.

## Softwares incluídos

+ Ubuntu 18.04
+ Git
+ PHP 7.3
+ PHP 7.2
+ PHP 7.1
+ PHP 7.0
+ PHP 5.6
+ Nginx
+ MySQL
+ lmm para capturas instantâneas de banco de dados MySQL ou MariaDB
+ Sqlite3
+ PostgreSQL
+ Composer
+ Node (With Yarn, Bower, Grunt, and Gulp)
+ Redis
+ Memcached
+ Beanstalkd
+ Mailhog
+ avahi
+ ngrok
+ Xdebug
+ XHProf / Tideways / XHGui
+ wp-cli

## Software opcional

+ Apache
+ Blackfire
+ Cassandra
+ Chronograf
+ CouchDB
+ Crystal & Lucky Framework
+ Docker
+ Elasticsearch
+ Gearman
+ Go
+ Grafana
+ InfluxDB
+ MariaDB
+ MinIO
+ MongoDB
+ MySQL 8
+ Neo4j
+ Oh My Zsh
+ Open Resty
+ PM2
+ Python
+ RabbitMQ
+ Solr
+ Utilitários Webdriver e Laravel Dusk

## Instalação e configuração

### Primeiros passos
Antes de iniciar o seu ambiente Homestead, você deve instalar o [VirtualBox 6.x](https://www.virtualbox.org/wiki/Downloads), [VMWare](https://www.vmware.com/), [Parallels](https://www.parallels.com/products/desktop/) ou [Hyper-V](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v) 
e também o [Vagrant](https://www.vagrantup.com/downloads.html). Todos esses pacotes de software fornecem instaladores visuais fáceis de usar para todos 
os sistemas operacionais populares.

Para usar o provedor VMware, você precisará comprar o VMware Fusion/Workstation e o [plug-in VMware 
Vagrant](https://www.vagrantup.com/vmware). Embora não seja gratuito, o VMware pode fornecer um desempenho mais rápido das pastas 
compartilhadas imediatamente.

Para usar o provedor Parallels, você precisará instalar o plug-in [Parallels Vagrant](https://github.com/Parallels/vagrant-parallels). É grátis.

Devido às [limitações do Vagrant](https://www.vagrantup.com/docs/hyperv/limitations.html), o provedor Hyper-V ignora todas as configurações de rede.

### Instalação da caixa do Homestead Vagrant

Após a instalação do VirtualBox/VMware e Vagrant, você deve adicionar a caixa laravel/homestead à 
sua instalação do Vagrant usando o seguinte comando no seu terminal. A transferência da caixa levará 
alguns minutos, dependendo da velocidade da sua conexão com a Internet:

```
vagrant box add laravel/homestead
```

Se esse comando falhar, verifique se a instalação do Vagrant está atualizada.

> O Homestead emite periodicamente caixas "alfa"/"beta" para teste, o que pode interferir no comando 
> `vagrant box add`. Se você estiver com problemas para executar o `vagrant box add`, execute o comando 
> `vagrant up` e a caixa correta será baixada quando o Vagrant tentar iniciar a máquina virtual.

### Instalando Homestead

Você pode instalar o Homestead clonando o repositório na sua máquina host. Considere a clonagem do 
repositório em uma pasta Homestead dentro do diretório "home", pois a caixa Homestead servirá como 
host para todos os seus projetos do Laravel:

```
git clone https://github.com/laravel/homestead.git ~/Homestead
```

Você deve verificar uma versão marcada do Homestead, pois a ramificação principal nem sempre pode 
ser estável. Você pode encontrar a versão estável mais recente na página de lançamento do GitHub. 
Como alternativa, você pode fazer o checkout do ramo de lançamento, que sempre contém o último 
lançamento estável:

```
cd ~/Homestead

git checkout release
```

Depois de clonar o repositório do Homestead, execute o comando `bash init.sh` no diretório Homestead 
para criar o arquivo de configuração `Homestead.yaml`. O arquivo `Homestead.yaml` será colocado no 
diretório Homestead:

```
// Mac / Linux...
bash init.sh

// Windows...
init.bat
```

## Configurando Homestead

### Configurando seu provedor
A chave do `provider` no seu arquivo `Homestead.yaml` indica qual provedor do Vagrant deve ser usado: 
`virtualbox`, `vmware_fusion`, `vmware_workstation`, `paralells` ou `hyperv`. Você pode definir isso para 
o provedor de sua preferência:

```
provider: virtualbox
```

### Configurando pastas compartilhadas
A propriedade de pastas do arquivo `Homestead.yaml` lista todas as pastas que você deseja compartilhar 
com o ambiente Homestead. À medida que os arquivos dessas pastas são alterados, eles serão mantidos 
em sincronia entre a máquina local e o ambiente Homestead. Você pode configurar quantas pastas 
compartilhadas forem necessárias:

```
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> Os usuários do Windows não devem usar a sintaxe `~/path` e, em vez disso, 
> devem usar o caminho completo para o projeto, como `C:\Users\user\Code\project1`.

Você sempre deve mapear projetos individuais para o próprio mapeamento de pastas em vez de mapear 
toda a pasta `~/code`. Quando você mapeia uma pasta, a máquina virtual deve acompanhar todos os E/S 
de disco de todos os arquivos da pasta. Isso leva a problemas de desempenho se você tiver um grande 
número de arquivos em uma pasta.

```
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1

    - map: ~/code/project2
      to: /home/vagrant/project2
```

> Você nunca deve montar `.` (o diretório atual) ao usar o Homestead. Isso faz com que o Vagrant não 
> mapeie a pasta atual para `/vagrant` e interrompa os recursos opcionais e cause resultados inesperados 
> durante o provisionamento.

Para habilitar o [NFS](https://www.vagrantup.com/docs/synced-folders/nfs.html), você só precisa adicionar um sinalizador simples à 
sua configuração de pasta sincronizada:

```
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> Ao usar o NFS no Windows, considere instalar o plug-in [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd). Este plug-in 
> manterá as permissões corretas de usuário/grupo para arquivos e diretórios na caixa Homestead.

Você também pode passar as opções suportadas pelas [pastas sincronizadas](https://www.vagrantup.com/docs/synced-folders/basic_usage.html) do Vagrant listando-as na chave de `options`:

``` yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "rsync"
      options:
          rsync__args: ["--verbose", "--archive", "--delete", "-zz"]
          rsync__exclude: ["node_modules"]
```

### Configurando sites Nginx

Não está familiarizado com o Nginx? Sem problemas. A propriedade `sites` permite mapear facilmente um 
"domínio" para uma pasta em seu ambiente Homestead. Uma configuração de site de exemplo está incluída 
no arquivo `Homestead.yaml`. Novamente, você pode adicionar quantos sites forem necessários ao seu 
ambiente Homestead. O Homestead pode servir como um ambiente virtualizado e conveniente para cada 
projeto do Laravel em que você está trabalhando:

```
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

### Resolução de nome de host
Homestead publica nomes de host em `mDNS` para resolução automática de host. Se você definir 
`hostname: homestead` em seu arquivo `Homestead.yaml`, o host estará disponível em `homestead.local`. 
As distribuições de desktops MacOS, iOS e Linux incluem suporte a `mDNS` por padrão. O Windows requer a 
instalação dos [Serviços de Impressão Bonjour](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US) para Windows.

O uso de nomes de host automáticos funciona melhor para instalações "por projeto" do Homestead. 
Se você hospedar vários sites em uma única instância do Homestead, poderá adicionar os "domínios" 
dos seus sites ao arquivo de hosts da sua máquina. O arquivo hosts redirecionará as solicitações 
dos sites do Homestead para a máquina do Homestead. No Mac e Linux, esse arquivo está localizado
em `/etc/hosts`. No Windows, ele está localizado em `C:\Windows\System32\drivers\etc\hosts`. 
As linhas adicionadas a este arquivo terão a seguinte aparência:

```
192.168.10.10  homestead.test
```

Verifique se o endereço IP listado é aquele definido no seu arquivo `Homestead.yaml`. Depois de adicionar 
o domínio ao arquivo de `hosts` e iniciar a caixa do Vagrant, você poderá acessar o site pelo navegador da web:

```
http://homestead.test
```

### Execução da caixa Vagrant
Depois de editar o `Homestead.yaml` ao seu gosto, execute o comando `vagrant up` no diretório Homestead. 
O Vagrant inicializará a máquina virtual e configurará automaticamente suas pastas compartilhadas e 
sites Nginx.

Para destruir a máquina, você pode usar o comando `vagrant destroy --force`.

## Por instalação do projeto
Em vez de instalar o Homestead globalmente e compartilhar a mesma caixa do Homestead em todos os seus 
projetos, você pode configurar uma instância do Homestead para cada projeto que gerencia. A instalação 
do Homestead por projeto pode ser benéfica se você desejar enviar um arquivo Vagrant com o seu projeto, 
permitindo que outras pessoas que trabalham no projeto vaguem.

Para instalar o Homestead diretamente no seu projeto, exija-o usando o Composer:

```
composer require laravel/homestead --dev
```

Depois que o Homestead for instalado, use o comando `make` para gerar o arquivo `Vagrantfile` e 
`Homestead.yaml` na raiz do projeto. O comando `make` configura automaticamente as diretivas de 
sites e pastas no arquivo `Homestead.yaml`.

Mac/Linux:

```
php vendor/bin/homestead make
```

Windows

```
vendor\\bin\\homestead make
```

Em seguida, execute o comando `vagrant up` no seu terminal e acesse o seu projeto em 
http://homestead.test no seu navegador. Lembre-se de que você ainda precisará adicionar 
uma entrada de arquivo `/etc/hosts` para `homestead.test` ou o domínio de sua escolha se 
você não estiver usando a resolução automática de [hostname](https://laravel.com/docs/5.8/homestead#hostname-resolution).

### Instalando recursos opcionais
O software opcional é instalado usando a configuração "features" no seu arquivo de configuração do 
Homestead. A maioria dos recursos pode ser ativada ou desativada com um valor booleano, enquanto 
alguns permitem várias opções de configuração:

``` yaml
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
    - docker: true
    - elasticsearch:
        version: 7
    - gearman: true
    - golang: true
    - grafana: true
    - influxdb: true
    - mariadb: true
    - minio: true
    - mongodb: true
    - mysql8: true
    - neo4j: true
    - ohmyzsh: true
    - openresty: true
    - pm2: true
    - python: true
    - rabbitmq: true
    - solr: true
    - webdriver: true
```

### MariaDB
A ativação do MariaDB removerá o MySQL e instalará o MariaDB. O MariaDB serve como um substituto para o 
MySQL, portanto você ainda deve usar o driver do banco de dados mysql na configuração do banco de dados 
do seu aplicativo.

### MongoDB
A instalação padrão do MongoDB definirá o nome de usuário do banco de dados como homestead e a senha 
correspondente como secreta.

### Elasticsearch
Você pode especificar uma versão suportada do Elasticsearch, que pode ser uma versão principal ou um 
número exato de versão (major.minor.patch). A instalação padrão criará um cluster chamado 'homestead'. 
Você nunca deve fornecer ao Elasticsearch mais da metade da memória do sistema operacional, portanto, 
verifique se a máquina Homestead possui pelo menos o dobro da alocação do Elasticsearch.

> Confira a documentação do [Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current) para aprender como personalizar sua configuração.

### Neo4j
A instalação padrão do Neo4j definirá o nome de usuário do banco de dados como homestead e a senha 
correspondente como `secret`. Para acessar o navegador Neo4j, visite `http://homestead.test:7474` 
através do seu navegador da web. As portas `7687` (Bolt), `7474` (HTTP) e `7473` (HTTPS) estão prontas 
para atender solicitações do cliente Neo4j.

## Aliases
Você pode adicionar aliases do Bash à sua máquina Homestead modificando o arquivo de `aliases` no diretório 
do Homestead:

```
alias c='clear'
alias ..='cd ..'
```

Depois de atualizar o arquivo de aliases, você deve provisionar novamente a máquina Homestead usando o 
comando `vagrant reload --provision`. Isso garantirá que seus novos aliases estejam disponíveis na máquina.

## Uso diário

### Acessando Homestead Globalmente
Às vezes, você pode querer usar `vagrant up` pela sua máquina Homestead de qualquer lugar do seu sistema de 
arquivos. Você pode fazer isso em sistemas Mac/Linux adicionando uma função Bash ao seu perfil Bash. No Windows, 
você pode fazer isso adicionando um arquivo "lote" ao seu `PATH`. Esses scripts permitem executar qualquer 
comando do Vagrant de qualquer lugar do sistema e apontam esse comando automaticamente para a instalação do Homestead:

#### Mac/Linux

```
function homestead() {
    ( cd ~/Homestead && vagrant $* )
}
```

Certifique-se de ajustar o caminho `~/Homestead` na função para o local da instalação real do Homestead. 
Após a instalação da função, você pode executar comandos como `homestead up` ou `homestead ssh` de qualquer 
lugar do sistema.

#### Windows

Crie um arquivo em lote `homestead.bat` em qualquer lugar da sua máquina com o seguinte conteúdo:

``` bat
@echo off

set cwd=%cd%
set homesteadVagrant=C:\Homestead

cd /d %homesteadVagrant% && vagrant %*
cd /d %cwd%

set cwd=
set homesteadVagrant=
```

Certifique-se de ajustar o caminho `C:\Homestead` de exemplo no script para o local real da sua instalação 
do Homestead. Após criar o arquivo, adicione o local do arquivo ao seu `PATH`. Você pode executar comandos 
como `homestead up` ou `homestead ssh` de qualquer lugar do sistema.

## Conexão via SSH
Você pode fazer o SSH na sua máquina virtual emitindo o comando no terminal `vagrant ssh` no diretório Homestead.

Porém, como você provavelmente precisará fazer o SSH na máquina Homestead com frequência, considere adicionar 
a "função" descrita acima à máquina host para fazer o SSH rapidamente na caixa Homestead.

## Conexão a bancos de dados
Um banco de dados de homestead é configurado para MySQL e PostgreSQL imediatamente. Para conectar-se ao 
seu banco de dados MySQL ou PostgreSQL a partir do cliente de banco de dados da máquina host, você deve 
conectar-se à `127.0.0.1` e porta `33060` (MySQL) ou `54320` (PostgreSQL). O nome de usuário e a senha dos dois 
bancos de dados são `homestead/secret`.

> Você só deve usar essas portas não padrão ao conectar-se aos bancos de dados da sua máquina host. 
> Você usará as portas `3306` e `5432` padrão no arquivo de configuração do banco de dados do Laravel, 
> pois o Laravel está sendo executado na máquina virtual.

## Backups de banco de dados
O Homestead pode fazer backup automaticamente do seu banco de dados quando sua caixa do Vagrant for destruída. 
Para utilizar esse recurso, você deve usar o Vagrant 2.1.0 ou superior. Ou, se você estiver usando uma versão 
mais antiga do Vagrant, deverá instalar o plug-in vagrant-triggers. Para habilitar backups automáticos do banco 
de dados, adicione a seguinte linha ao seu arquivo `Homestead.yaml`:

``` yaml
backup: true
```

Uma vez configurado, o Homestead exportará seus bancos de dados para os diretórios `mysql_backup` e `postgres_backup` 
quando o comando `vagrant destroy` for executado. Esses diretórios podem ser encontrados na pasta em que você clonou
o Homestead ou na raiz do seu projeto, se você estiver usando o método de instalação por projeto.

## Snapshot do banco de dados
O Homestead suporta o congelamento do estado dos bancos de dados MySQL e MariaDB e a ramificação entre eles 
usando o [Logical MySQL Manager](https://github.com/Lullabot/lmm). Por exemplo, imagine trabalhar em um site com um banco de dados de vários 
gigabytes. Você pode importar o banco de dados e tirar um snapshot instantânea. Depois de fazer algum trabalho 
e criar algum conteúdo de teste localmente, você poderá restaurar rapidamente o estado original.

Sob o capô, o LMM usa a funcionalidade de snapshot fina do LVM com suporte à cópia na gravação. 
Na prática, isso significa que alterar uma única linha de uma tabela fará com que as alterações feitas sejam 
gravadas no disco, economizando tempo e espaço em disco significativos durante as restaurações.

Como o lmm interage com o LVM, ele deve ser executado como root. Para ver todos os comandos disponíveis, 
execute o `sudo lmm` dentro da sua caixa do Vagrant. Um fluxo de trabalho comum se parece com o seguinte:

* Importe um banco de dados para a ramificação `master` lmm padrão.
* Salve um snapshot do banco de dados inalterado usando o `sudo lmm branch prod-YYYY-MM-DD`.
* Modifique o banco de dados.
* Execute `sudo lmm merge prod-YYYY-MM-DD` para desfazer todas as alterações.
* Execute `sudo lmm delete <branch>` para excluir ramificações desnecessárias.

## Adding Additional Sites
