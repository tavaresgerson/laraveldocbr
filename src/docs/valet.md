# Laravel Valet

<a name="introduction"></a>
## Introdução

 > [!ATENÇÃO]
 [Herdeiro do Laravel](https://herd.laravel.com). O Herd inclui tudo que você precisa para começar a desenvolver com o Laravel, incluindo o Valet, o PHP e o Composer.

 [Laravel Valet](https://github.com/laravel/valet) é um ambiente de desenvolvimento para os minimalistas do macOS. Laravel Valet configura o seu Mac para que sempre funcione [Nginx](https://www.nginx.com/) no fundo quando a máquina arranca. Em seguida, usando [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq), Valet encaminha todos os pedidos do domínio `*.test` para sites instalados na sua máquina local.

 Em outras palavras, o Valet é um ambiente de desenvolvimento Laravel extremamente rápido que utiliza cerca de 7 MB de memória RAM. O Valet não substitui completamente o [Sail] (/) ou [Homestead] (/docs/homestead), mas fornece uma excelente alternativa caso você prefira um ambiente básico flexível, deseje velocidade extremamente rápida ou esteja trabalhando em uma máquina com memória RAM limitada.

 Ao abrigo da caixa, o suporte do Valet inclui, mas não se limita a:

<style>
 #valet-support > ul {
 contagem de colunas: 3; -moz-contagem de colunas: 3; -webkit-contagem de colunas: 3;
 altura de linha: 1,9;
 }
</style>

<div id="valet-support" markdown="1">

 [Laravel](https://laravel.com)
 [ Fundação](https://roots.io/bedrock/)
 [CakePHP 3](https://cakephp.org)
 [ConcretoCMS](https://www.concretecms.com/)
 [Contao](https://contao.org/pt_BR/)
 [Ofício] (https://craftcms.com)
 [Drupal](https://www.drupal.org/)
 [ ExpressionEngine](https://www.expressionengine.com/)
 [Quebra-cabeça](https://jigsaw.tighten.co
 [Joomla](https://pt.wikipedia.org/wiki/Joomla!)
 [Katana](https://github.com/themsaid/katana)
 [Kirby](https://getkirby.com/)
 [O Magento] (https://magento.com/)
 [O Outubro CMS](https://octobercms.com/)
 [Sculpin](https://sculpin.io/)
 [ Magro](https://www.slimframework.com)
 [Statamic] (https://statamic.com)
 - HTML estático
 [Symfony](https://symfony.com)
 [O que é o Wordpress?](https://pt.wordpress.org)
 [Zend](https://framework.zend.com)

</div>

 No entanto, é possível alargar o serviço de estacionamento automático com os seus próprios [motores personalizados](#motor-personalizado).

<a name="installation"></a>
## Instalação

 > Atenção!
 O Homebrew. Antes da instalação, certifique-se de que nenhum outro programa como o Apache ou o Nginx está ligado à porta 80 do seu computador local.

 Para começar, primeiro você precisa garantir que o Homebrew esteja atualizado usando o comando `update`:

```shell
brew update
```

 Em seguida, você deve usar o Homebrew para instalar o PHP:

```shell
brew install php
```

 Depois de instalar o PHP, você está pronto para instalar o [Gerenciador de pacotes Composer](https://getcomposer.org). Além disso, deve garantir que o diretório `$HOME/.composer/vendor/bin` esteja no "PATH" do seu sistema. Após a instalação do Composer, você pode instalar o Laravel Valet como um pacote global de Composer:

```shell
composer global require laravel/valet
```

 Finalmente, você poderá executar o comando "install" do Valet. Isso configurará e instalará o Valet e DnsMasq. Além disso, os demônios dos quais o Valet depende serão configurados para iniciar quando seu sistema for inicializado:

```shell
valet install
```

 Depois de instalado, experimente fazer um ping a qualquer domínio "*.test" em seu terminal com um comando como o "ping foobar.test". Se Valet estiver instalado corretamente, você deverá ver que esse domínio está respondendo no endereço "127.0.0.1".

 O Valet iniciará automaticamente os serviços necessários sempre que for ligado o seu computador.

<a name="php-versions"></a>
#### Versões do PHP

 > [!ATENÇÃO]
 [comando]#per-site-php-versions

 O Valet permite alternar versões de PHP através do comando "valet use php@version". Se o PHP especificado não estiver instalado, o Valet irá instalá-lo através da Homebrew:

```shell
valet use php@8.2

valet use php
```

 Você também poderá criar um arquivo `.valetrc` na raiz do seu projeto. O arquivo `.valetrc` deverá conter a versão PHP que o site deverá usar:

```shell
php=php@8.2
```

 Depois de criado esse arquivo, é só executar o comando `valet use`, que determinará a versão da linguagem preferida do site ao ler esse arquivo.

 > [!AVISO]
 > O serviço de valet executa apenas uma versão do PHP por vez, mesmo que tenha várias versões instaladas.

<a name="database"></a>
#### Base de dados

 Se seu aplicativo precisar de um banco de dados, confira o [DBngin](https://dbngin.com), que fornece uma ferramenta gratuita e completa para gerenciamento de bancos de dados, incluindo MySQL, PostgreSQL e Redis. Depois do DBngin ser instalado, você poderá se conectar ao seu banco de dados em `127.0.0.1` usando o nome de usuário "root" (root) e uma senha vazia.

<a name="resetting-your-installation"></a>
#### Retomar a instalação

 Se você estiver tendo problemas para fazer com que sua instalação do Valet seja executada corretamente, o comando `composer global require laravel/valet`, seguido por `valet install`, pode resetar sua instalação e resolver diversos problemas. Em casos raros, talvez seja necessário "resetar" o Valet usando o comando `valet uninstall --force`, seguido de novo por `valet install`.

<a name="upgrading-valet"></a>
### Melhorando o serviço de estacionamento

 Você pode atualizar sua instalação do Valet executando o comando `composer global require laravel/valet` em seu terminal. Após a atualização, é uma boa prática executar o comando `valet install` para que o Valet possa fazer atualizações adicionais nos seus arquivos de configuração, se necessário.

<a name="upgrading-to-valet-4"></a>
#### Atualizar para o Valet 4

 Se estiver a efetuar uma actualização de Valet 3 para Valet 4, siga os passos abaixo indicados para efetuar o processo de atualização da sua instalação do Valet.

<div class="content-list" markdown="1">

 - Se você adicionou arquivos `.valetphprc` para customizar a versão do PHP em seu site, renomeie cada um dos arquivos `.valetphprc` para `.valetrc`. Em seguida, prefira `php=` ao conteúdo existente do arquivo `.valetrc`.
 Veja [SampleValetDriver](https://github.com/laravel/valet/blob/d7787c025e60abc24a5195dc7d4c5c6f2d984339/cli/stubs/SampleValetDriver.php) como exemplo.
 - Se você usar o PHP 7.1 - 7.4 para hospedar seus sites, verifique se você ainda usa o Homebrew para instalar uma versão do PHP que é a 8.0 ou superior, pois o Valet irá usar essa versão, mesmo que não seja sua principal versão vinculada, para executar alguns de seus scripts.

</div>

<a name="serving-sites"></a>
## Sites de destino

 Depois que o Valet for instalado, você estará pronto para iniciar seu serviço das aplicações Laravel. O Valet oferece dois comandos para ajudá-lo a servir suas aplicações: `park` e `link`.

<a name="the-park-command"></a>
### O comando "park"

The `park` command registers a directory on your machine that contains your applications. Once the directory has been "parked" with Valet, all of the directories within that directory will be accessible in your web browser at `http://<directory-name>.test`:

```shell
cd ~/Sites

valet park
```

That's all there is to it. Now, any application you create within your "parked" directory will automatically be served using the `http://<directory-name>.test` convention. So, if your parked directory contains a directory named "laravel", the application within that directory will be accessible at `http://laravel.test`. In addition, Valet automatically allows you to access the site using wildcard subdomains (`http://foo.laravel.test`).

<a name="the-link-command"></a>
### O comando link

 O comando `link` também pode ser usado para servir suas aplicações Laravel. Este comando é útil se você quer servir um único site em uma pasta e não toda a pasta:

```shell
cd ~/Sites/laravel

valet link
```

 Uma vez que um aplicativo tenha sido vinculado ao Valet usando o comando `link`, você poderá acessar o aplicativo usando seu nome de diretório. Assim, o site que foi vinculado no exemplo acima pode ser acessado em `http://laravel.test`. Além disso, o Valet permite automaticamente o acesso ao site usando subdomínios de substituição (`http://foo.laravel.test`).

 Se pretender executar o serviço em um nome de host diferente, pode fornecer esse nome ao comando "link". Por exemplo, pode executar a seguinte ordem para disponibilizar o serviço em "http://application.test":

```shell
cd ~/Sites/laravel

valet link application
```

 Claro, é possível também usar o comando `link` para disponibilizar aplicações em subdomínios:

```shell
valet link api.application
```

 Pode executar o comando `links` para exibir uma lista de todas as pastas vinculadas:

```shell
valet links
```

 O comando `unlink` pode ser usado para destruir o link simbólico de um site:

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### Proteger os sites com o protocolo TLS

 Como padrão, o Valet disponibiliza sites por HTTP. No entanto, se pretender disponibilizar um site por criptografado TLS usando HTTP/2, pode utilizar a opção `secure`. Por exemplo, se o seu site estiver sendo servido pelo Valet no domínio `laravel.test`, deve executar o seguinte comando para garantir a sua segurança:

```shell
valet secure laravel
```

 Para “desproteger” um site e voltar ao seu tráfego em padrão HTTP, utilize o comando `unsecure`. Tal como no comando `secure`, este comando aceita o nome de domínio que deseja desproteger:

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### Acesso a um site por padrão

 Às vezes, você pode querer configurar o Valet para servir um site "padrão" em vez de uma mensagem "404" ao visitar um domínio desconhecido. Para fazer isso, você pode adicionar uma opção `default` ao seu arquivo de configuração do `.config/valet/config.json`. Nele deve conter o caminho para o site que deve servir como seu site padrão:

```php
    "default": "/Users/Sally/Sites/example-site",
```

<a name="per-site-php-versions"></a>
### Versões do PHP por sítio

 Por padrão, o Valet utiliza sua instalação global do PHP para servir seus sites. No entanto, se você precisar suportar várias versões do PHP em vários sites, pode usar o comando `isolate` para especificar qual a versão do PHP que um site em particular deve usar. O comando `isolate` configura o Valet para usar a versão do PHP especificada para o site localizado no diretório atual do trabalho:

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```

 Se o nome do seu site não corresponder ao nome do diretório que o contém, você pode especificar o nome do site usando a opção `--site`:

```shell
valet isolate php@8.0 --site="site-name"
```

 Para maior conveniência, você pode usar os comandos `valet php`, `composer` e `which-php` para fazer chamadas de proxy aos apropriados scripts ou ferramentas da CLI do PHP com base na versão do PHP configurada no site:

```shell
valet php
valet composer
valet which-php
```

 Você pode executar o comando "isolated" para exibir uma lista de todos os seus sites isolados e suas versões do PHP:

```shell
valet isolated
```

 Para voltar a instalar a versão global de PHP instalada pelo Valet no seu site, você pode invocar o comando `unisolate` da pasta raiz do site:

```shell
valet unisolate
```

<a name="sharing-sites"></a>
## Partilha de sítios

 O Valet inclui um comando para partilhar os seus sítios locais connosco, proporcionando uma forma fácil de testar o seu sítio em dispositivos móveis ou partilhá-lo com membros da equipa e clientes.

 De maneira nativa, o Valet suporta compartilhamento de sites via ngrok ou Expose. Antes de compartilhar um site, você deve atualizar sua configuração do Valet usando o comando `share-tool`, especificando `ngrok` ou `expose`:

```shell
valet share-tool ngrok
```

 Se você escolher uma ferramenta e não tiver instalada via Homebrew (para o ngrok) ou Composer (para a Expose), o Valet solicitará automaticamente que você as instale. Claro, ambas as ferramentas exigem que você autentiquem sua conta do ngrok ou da Expose antes de poder começar a compartilhar sites.

 Para compartilhar um site, vá até o diretório do site no terminal e execute o comando `share` do Valet. Uma URL de acesso público será colocada em seu clipboard e estará pronta para colar diretamente no navegador ou para compartilhamento com sua equipe:

```shell
cd ~/Sites/laravel

valet share
```

 Para parar de compartilhar seu site, você pode pressionar `Ctrl+C`.

 > [AVERTISSEMENTO]
 > Se você estiver usando um servidor de DNS personalizado (como o "1.1.1.1"), a compartilhamento do ngrok pode não funcionar corretamente. Se este for o caso em sua máquina, abra as configurações do sistema do Mac, vá para Configurações de Rede, abra as configurações avançadas e, em seguida, vá na aba DNS e adicione "127.0.0.1" como seu primeiro servidor DNS.

<a name="sharing-sites-via-ngrok"></a>
#### Partilha de sítios Web através do Ngrok

 Para partilhar o seu site através do ngrok é necessário criar uma [contas no ngrok](https://dashboard.ngrok.com/signup) e definir um [autentificador de tokens](https://dashboard.ngrok.com/get-started/your-authtoken). Depois de ter um autentificador de token, poderá atualizar a sua configuração do Valet com esse token:

```shell
valet set-ngrok-token YOUR_TOKEN_HERE
```

 > [!ATENÇÃO]
 [Documentação do ngrok](https://ngrok.com/docs).

<a name="sharing-sites-via-expose"></a>
#### Compartilhamento de sites através do Exposé

 Para partilhar o seu site utilizando Expose, é necessário [criar uma conta na Expose](https://expose.dev/register) e [autenticar com a Expose através do token de autenticação](https://expose.dev/docs/getting-started/getting-your-token).

 Pode consultar a documentação da Expose (https://expose.dev/docs) para obter informações sobre os parâmetros adicionais de linha de comando que é suportado.

<a name="sharing-sites-on-your-local-network"></a>
### Compartilhamento de sites em sua rede local

 Por padrão, o Valet restringe o tráfego recebido à interface interna `127.0.0.1`, para que a máquina de desenvolvimento não fique exposta aos riscos da Internet.

 Se desejar permitir que outros dispositivos na sua rede local acedam aos sites do Valet na sua máquina através da sua IP de máquina (p. ex.: `192.168.1.10/application.test`), será necessário editar manualmente o ficheiro de configuração do Nginx adequado para esse site para remover a restrição na directiva `listen`. Deve remover o prefixo `127.0.0.1:` da directiva `listen` das portas 80 e 443.

 Se você não executar o comando `valet secure` no projeto, poderá abrir acesso de rede para todos os sites que não sejam HTTPS editando o arquivo `/usr/local/etc/nginx/valet/valet.conf`. No entanto, se você estiver servindo seu projeto com HTTPS (e executar o comando `valet secure` para esse site), deverá editar o arquivo `~/.config/valet/Nginx/app-name.test`.

 Depois de atualizar sua configuração do Nginx, execute o comando `valet restart` para aplicar as alterações na configuração.

<a name="site-specific-environment-variables"></a>
## Variáveis Ambientais de Sítio

 Alguns aplicativos que utilizam outros frameworks podem depender de variáveis ambiente do servidor, mas não disponibilizam uma forma para essas variáveis serem configuradas no seu projeto. O Valet permite que você configure as variáveis do ambiente específicas ao site adicionando um arquivo `.valet-env.php` dentro da raíz do seu projeto. Este arquivo deve retornar uma matriz de pares das variáveis do site/ambiente, que serão adicionadas à matriz global `$_SERVER` para cada site especificado na matriz:

```php
    <?php

    return [
        // Set $_SERVER['key'] to "value" for the laravel.test site...
        'laravel' => [
            'key' => 'value',
        ],

        // Set $_SERVER['key'] to "value" for all sites...
        '*' => [
            'key' => 'value',
        ],
    ];
```

<a name="proxying-services"></a>
## Serviços de proxy

 Às vezes, poderá ser necessário encaminhar um domínio Valet para outro serviço instalado na máquina local. Por exemplo, talvez precise de executar o Valet e também um site separado em Docker; no entanto, o Valet e o Docker não podem usar a porta 80 ao mesmo tempo.

 Para resolver isto, você pode usar o comando `proxy` para gerar um proxy. Por exemplo, você pode redirecionar todo o tráfego de `http://elasticsearch.test` para `http://127.0.0.1:9200`:

```shell
# Proxy over HTTP...
valet proxy elasticsearch http://127.0.0.1:9200

# Proxy over TLS + HTTP/2...
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

 Pode remover um proxy utilizando o comando `unproxy`:

```shell
valet unproxy elasticsearch
```

 Você pode usar o comando `proxies` para listar todas as configurações de sites que estão sendo feitas por um proxy:

```shell
valet proxies
```

<a name="custom-valet-drivers"></a>
## Motoristas de serviço personalizado

 Você pode escrever seu próprio "driver" do Valet para servir aplicações PHP em execução em um framework ou CM que não é suportado nativamente pelo Valet. Ao instalar o Valet, um diretório `~/.config/valet/Drivers` é criado e contém uma pasta `SampleValetDriver.php`. Essa pasta contém uma implementação de driver de amostra para demonstrar como escrever um driver personalizado. Escrever um driver requer que você implemente três métodos: `serves`, `isStaticFile` e `frontControllerPath`.

 Todos os três métodos recebem os valores de `$sitePath`, `$siteName` e `$uri` como argumentos. O `$sitePath` é o caminho totalmente qualificado do site que está sendo executado na sua máquina, por exemplo, `/Usos/Lisa/Sites/my-project`. O `$siteName` é a parte do "hospedeiro"/"nome de hospedagem" do domínio (`my-project`). O `$uri` representa o URI da solicitação recebida (/).

 Depois de concluir o seu motorista do Valet personalizado, coloque-o no diretório `~/.config/valet/Drivers` utilizando a convenção de nomeação `FrameworkValetDriver.php`. Por exemplo, se estiver a criar um motorista do Valet para WordPress, o seu nome de ficheiro deve ser `WordPressValetDriver.php`.

 Vejamos uma implementação em cada um dos métodos que o seu driver personalizado do serviço de estacionamento deve implementar.

<a name="the-serves-method"></a>
#### O método `serves`

 O método `serves` deve retornar `true` caso o seu driver possa gerir o pedido recebido. Caso contrário, deve retornar `false`. Sendo assim, dentro deste método, deverá tentar determinar se o valor do parâmetro `$sitePath` contém um projeto do tipo que pretende servir.

 Por exemplo, vamos imaginar que estamos escrevendo um `WordPressValetDriver`. Nossa método `serves` pode ser semelhante ao seguinte:

```php
    /**
     * Determine if the driver serves the request.
     */
    public function serves(string $sitePath, string $siteName, string $uri): bool
    {
        return is_dir($sitePath.'/wp-admin');
    }
```

<a name="the-isstaticfile-method"></a>
#### O método `isStaticFile`

 O campo `isStaticFile` deve determinar se o pedido recebido é para um arquivo "estático", como uma imagem ou um folha de estilo. Se o arquivo estiver "estático", o método deve retornar o caminho totalmente qualificado do arquivo "estático" no disco. Se o pedido não for recebido de um arquivo "estático", o método deve retornar `false`:

```php
    /**
     * Determine if the incoming request is for a static file.
     *
     * @return string|false
     */
    public function isStaticFile(string $sitePath, string $siteName, string $uri)
    {
        if (file_exists($staticFilePath = $sitePath.'/public/'.$uri)) {
            return $staticFilePath;
        }

        return false;
    }
```

 > [AVERIGOCHESE]
 > O método `isStaticFile` será chamado somente se o método `serves` retornar `true` para o pedido recebido e a URI do pedido não for "/".

<a name="the-frontcontrollerpath-method"></a>
#### O método `frontControllerPath`

 O método `frontControllerPath` deve retornar o caminho totalmente qualificado do "controlador frontal" da sua aplicação, que normalmente é um arquivo "index.php" ou equivalente:

```php
    /**
     * Get the fully resolved path to the application's front controller.
     */
    public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
    {
        return $sitePath.'/public/index.php';
    }
```

<a name="local-drivers"></a>
### Driver local

 Se você desejar definir um driver de Valet personalizado para uma aplicação única, crie um arquivo LocalValetDriver.php no diretório raiz da aplicação. O seu driver personalizado pode estender a classe `ValetDriver` base ou estender um driver específico de aplicativo existente como o `LaravelValetDriver`:

```php
    use Valet\Drivers\LaravelValetDriver;

    class LocalValetDriver extends LaravelValetDriver
    {
        /**
         * Determine if the driver serves the request.
         */
        public function serves(string $sitePath, string $siteName, string $uri): bool
        {
            return true;
        }

        /**
         * Get the fully resolved path to the application's front controller.
         */
        public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
        {
            return $sitePath.'/public_html/index.php';
        }
    }
```

<a name="other-valet-commands"></a>
## Outros comandos do Valet

<div class="overflow-auto">

|  Ordem |  Descrição |
|-------------|-------------|
|  "lista de estacionamento" |  Exiba uma lista de todos os comandos do Valet. |
|  `diagnosticar o mecânico` |  Diagnósticos de saída para ajudar no depurador do Valet. |
|  `diretório de listagem de valet` |  Defina o comportamento da listagem de diretórios. Padrão é "desligado", que exibe uma página 404 para pastas. |
|  "valet esqueceu" |  Execute este comando a partir de um diretório "estacionado" para o remover da lista de arquivos "estacionados". |
|  "registro de valet" |  Veja uma lista de registros que são escritos pelos serviços do Valet. |
|  "caminhos de valet" |  Visualize todos os caminhos estacionados. |
|  "reiniciar valet" |  Reinicie os demónios do Serviço de Estacionamento. |
|  "iniciar serviço de estacionamento" |  Inicia os servidores de valet. |
|  "parar o estacionamento" |  Pare os demónios do estacionamento automático. |
|  "confiança de porteiro" |  Adicione arquivos de sudoers para Brew e Valet para permitir que os comandos do Valet sejam executados sem solicitar sua senha. |
|  `desinstalar valet` |  Desinstalar o Valet: mostra as instruções para desinstalação manual. Use a opção --force para eliminar de forma agressiva todos os recursos do Valet. |

</div>

<a name="valet-directories-and-files"></a>
## Diretórios de arquivos e servidores

 A seguinte informação de diretório e arquivo pode ser útil na resolução de problemas do ambiente do Valet:

#### `~ / .config / valet`

 Conteúdo de toda a configuração do serviço Valet. Pode ser necessário manter uma cópia de segurança desse diretório.

#### ```.config/valet/dnsmasq.d/``

 Este diretório contém a configuração do DNSMasq.

#### `~/config/valet/driver/`

 Este diretório contém os drivers do Valet. Os drivers determinam como um quadro/CMS específico é servido.

#### `~/.config/valet/Nginx/`

 Este diretório contém as configurações de site do Nginx da Valet. Esses arquivos são reconstruídos ao executar os comandos `install` e `secure`.

#### `~ / . config / valet / Sites /`

 Este diretório contém todos os links simbólicos dos seus projetos vinculados (#O comando de ligação).

#### `~/.config/valet/config.json`

 Esse arquivo é o arquivo de configuração principal do Valet.

#### `~/.config/valet/valet.sock`

 Este arquivo é o soquete do PHP-FPM usado pela instalação do Nginx do Valet. Só existe se o PHP estiver funcionando corretamente.

#### ~/.config/valet/Log/fpm-php.www.log

 Este arquivo é o registro de erros do usuário para PHP.

#### ~/.config/valet/Log/nginx-erro.log

 Este arquivo é o registro de erros do usuário da Nginx.

#### `/usr/local/var/log/php-fpm.log`

 Este arquivo é o registro de sistema de erros do PHP-FPM.

#### `/usr/local/var/log/nginx`

 Este diretório contém os registos de acesso e erro do Nginx.

#### `/usr/local/etc/php/X.X/conf.d`

 Este diretório contém os ficheiros "*.ini" para vários parâmetros de configuração do PHP.

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

 Este é o arquivo de configuração do grupo do PHP-FPM.

#### ~/.composer/vendor/laravel/valet/cli/estubas/secure.valet.conf

 Este ficheiro é a configuração padrão do Nginx usada para criar certificados SSL para os seus sítios.

<a name="disk-access"></a>
### Acesso a Disco

 Desde o macOS 10.14, [o acesso a alguns ficheiros e diretórios é restringido por defeito](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf). Estas restrições incluem os diretórios "Área de Trabalho", "Documentos" e "Descarregamentos". Além disso, o acesso aos volumes em rede ou removíveis é também restringido. Por conseguinte, Valet recomenda que as pastas do site estejam localizadas fora destes locais protegidos.

 No entanto, se você deseja servir sites de dentro de um desses locais, precisará dar ao Nginx "Acesso completo a disco". Caso contrário, poderá ocorrer erros no servidor ou outro comportamento imprevisível do Nginx, especialmente quando fornecendo ativos estáticos. Normalmente, macOS solicitará automaticamente permissão para conceder ao Nginx acesso completo aos locais. Ou você poderá fazer isso manualmente por meio de "Preferências do Sistema" > "Segurança e privacidade" > "Privacidade". Em seguida, ative as entradas "nginx" na janela principal.
