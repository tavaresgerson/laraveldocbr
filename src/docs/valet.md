# Laravel valet

<a name="introduction"></a>
## Introdução

> NOTA:
> Procura uma forma ainda mais fácil de desenvolver aplicações Laravel no MacOS ou Windows? Confira o [Herd Laravel](https://herd.laravel.com). O Herd inclui tudo o que você precisa para começar a desenvolver com Laravel, incluindo o Valet, PHP e o Composer.

Laravel Valet é um ambiente de desenvolvimento para minimalistas do macOS. Laravel Valet configura seu Mac a sempre executar [Nginx](https://www.nginx.com/) em segundo plano quando sua máquina começa. Então, usando [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq), Valet proxy todas as solicitações no domínio `*.test` para apontar para sites instalados em sua máquina local.

Em outras palavras, o Valet é um ambiente de desenvolvimento Laravel incrivelmente rápido que utiliza aproximadamente 7 MB de RAM. O Valet não é uma substituição completa para [Sail](/docs/sail) ou [Homestead](/docs/homestead), mas oferece uma ótima alternativa se você deseja flexibilidade básica, prefere velocidade extrema ou está trabalhando em uma máquina com uma quantidade limitada de RAM.

De acordo com o site do projeto, suporte fora da caixa inclui, mas não se limita a:

<style>
#valet-support > ul {
coluna de contagem: 3; -moz-coluna-contagem: 3; -webkit-coluna-contagem: 3;
line-height: 1.9;
O texto em inglês foi traduzido para o português da seguinte maneira:
</style>

<div id="valet-support" markdown="1">

[Laravel](https://laravel.com)
[Aro] (bedrock)
[CakePHP 3](https://cakephp.org)
[Concreto CMS](https://www.concretecms.com/)
[Contão](https://contao.org/pt/)
[Trabalho manual]
[Drupal]
[ExpressionEngine](https://www.expressionengine.com/)
[Aula de toquinha](https://jigsaw.tighten.co)
[Joomla](https://www.joomla.org/)
[Katana](https://github.com/themsaid/katana)
[Kirby](https://getkirby.com/)
[Magento](https://magento.com/)
[Outubro CMS](https://octobercms.com/pt-br/)
[Esculpinho] (https://sculpin.io/)
[Magro]
Estático
- HTML estático
[Symfony](https://symfony.com)
[WordPress](https://wordpress.org)
[Zenite](https://framework.zenite.com.br/)

</div>

Porém, você pode estender o Valet com seus próprios [controladores de valet personalizados](#valet-drivers-personalizados).

<a name="installation"></a>
## Instalação

> [!ALERTA]
> O Valet requer o sistema operacional macOS e [Homebrew](https://brew.sh/). Antes da instalação, você deve ter certeza de que não há outros programas tais como Apache ou Nginx vinculados à porta 80 do seu computador local.

Para começar você precisa garantir que o Homebrew esteja atualizado usando o comando 'update':

```shell
brew update
```

Em seguida, você deve usar o Homebrew para instalar o PHP:

```shell
brew install php
```

Depois de instalar o PHP, você está pronto para instalar o [Gerenciador de Pacotes do Composer](https://getcomposer.org). Além disso, você deve garantir que o diretório `$HOME/.composer/vendor/bin` esteja em seu sistema PATH. Depois que o Composer foi instalado, você pode instalar o Laravel Valet como um pacote global do Composer:

```shell
composer global require laravel/valet
```

Finalmente, você pode executar o comando "instalar" de Valet. Isso irá configurar e instalar Valet e DnsMasq. Além disso, os demônios em que o Valet depende será configurado para lançar quando seu sistema for iniciado:

```shell
valet install
```

Uma vez instalado o Valet, tente usar um comando como 'ping foobar.test' no seu terminal para pingar qualquer '*.test' domínio. Se o Valet estiver corretamente instalado, você verá este domínio responder na '127.0.0.1'.

O Valet irá iniciar automaticamente seus serviços cada vez que a máquina for iniciada.

<a name="php-versions"></a>
#### Versões do PHP

> Nota:
> Em vez de modificar sua versão do PHP globalmente, você pode instruir o Valet a usar versões do PHP específicas por site via o comando 'isolate'.

Valet permite alternar versões de PHP usando o comando valet use php@version. Se não estiver instalado, o Valet instalará a versão especificada do PHP pelo Homebrew:

```shell
valet use php@8.2

valet use php
```

Você também pode criar um arquivo .valetrc na raiz do seu projeto. O arquivo .valetrc deve conter a versão de PHP que o site deveria usar:

```shell
php=php@8.2
```

Uma vez que esse arquivo tenha sido criado, você pode simplesmente executar o comando "valet use" e ele irá determinar a versão do PHP preferida pelo seu site ao ler o arquivo.

> [ALERTA!
> Valet somente serve uma versão PHP por vez, mesmo que você tenha várias versões instaladas do PHP.

<a name="database"></a>
#### Banco de dados

Se o seu aplicativo precisa de um banco de dados, veja [DBngin](https://dbngin.com), que fornece uma ferramenta de gerenciamento de banco de dados tudo em um gratuita que inclui MySQL, PostgreSQL e Redis. Após a instalação do DBngin, você pode se conectar ao seu banco de dados na porta 127.0.0.1 usando o nome de usuário root e uma string vazia para senha.

<a name="resetting-your-installation"></a>
#### Reinicializando a instalação

Se você estiver com problemas para executar sua instalação do Valet corretamente, executar o comando composer global require laravel/valet seguido de valet install irá resetar a instalação e poderá resolver uma variedade de problemas. Em casos raros, pode ser necessário realizar um "reset" do Valet ao executar valeto uninstall --force seguido por valet install

<a name="upgrading-valet"></a>
### Valet upgrade

Você pode atualizar sua instalação de Valet executando o comando 'composer global require laravel/valet' no seu terminal. Depois da atualização, é boa prática executar o comando 'valet install' para que o Valet possa fazer atualizações adicionais em seus arquivos de configuração se necessário.

<a name="upgrading-to-valet-4"></a>
#### Atualizando para o Valet 4

Se você está atualizando do Valet 3 para o Valet 4 siga os seguintes passos para fazer uma atualização adequada de sua instalação do Valet.

<div class="content-list" markdown="1">

- Se você adicionou arquivos .valetphprc para personalizar a versão PHP do seu site, renomeie cada arquivo .valetphprc para .valetrc. Em seguida, adicione php= na parte existente do arquivo .valetrc.
[Mostre o motorista do valet-parking](https://github.com/laravel/valet/blob/master/cli/stubs/SampleValetDriver.php).
- Se você estiver usando o PHP 7.1 - 7.4 para servir seus sites, certifique-se de que ainda esteja usando o Homebrew para instalar uma versão do PHP que seja 8.0 ou mais alta, pois o Valet usará essa versão mesmo que ela não seja sua versão primária vinculada, para executar alguns de seus scripts.

</div>

<a name="serving-sites"></a>
## Servidores

Uma vez instalado o Valet você está pronto para começar a servir suas aplicações Laravel. O Valet fornece dois comandos para ajudar em sua aplicação: "park" e "link".

<a name="the-park-command"></a>
### O comando 'park'

The `park` command registers a directory on your machine that contains your applications. Once the directory has been "parked" with Valet, all of the directories within that directory will be accessible in your web browser at `http://<directory-name>.test`:

```shell
cd ~/Sites

valet park
```

That's all there is to it. Now, any application you create within your "parked" directory will automatically be served using the `http://<directory-name>.test` convention. So, if your parked directory contains a directory named "laravel", the application within that directory will be accessible at `http://laravel.test`. In addition, Valet automatically allows you to access the site using wildcard subdomains (`http://foo.laravel.test`).

<a name="the-link-command"></a>
### O comando 'link'

O comando "link" também pode ser usado para servir seus aplicativos Laravel. Este comando é útil se você deseja servir um único site em um diretório e não todo o diretório:

```shell
cd ~/Sites/laravel

valet link
```

Uma vez que um aplicativo foi vinculado ao Valet usando o comando 'link', você pode acessar a aplicação usando seu nome de diretório. Assim, o site que estava vinculado no exemplo acima pode ser acessado em 'http://laravel.test'. Além disso, o Valet permite automaticamente o acesso ao site através de subdomínios wildcard (`` http://foo.laravel.test ``).

Se você deseja servir a aplicação em um nome de host diferente, você pode passar o nome do host ao comando 'link'. Por exemplo, você pode executar o seguinte comando para disponibilizar uma aplicação no nome do host 'http://aplicação.teste':

```shell
cd ~/Sites/laravel

valet link application
```

Claro, você também pode servir aplicações em subdomínios usando o comando 'link':

```shell
valet link api.application
```

Você pode executar o comando links para exibir uma lista de todos os seus diretórios vinculados.

```shell
valet links
```

O comando 'unlink' pode ser usado para destruir o link simbólico para um local específico.

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### Segurança de Sites com SSL

Por padrão, o Valet fornece sites sobre o protocolo HTTP. No entanto, se você quiser fornecer um site usando uma conexão segura TLS por meio do protocolo HTTP/2, você pode usar o comando "secure". Por exemplo, se seu site estiver sendo servido pelo Valet no domínio "laravel.test", você deve executar o seguinte comando para protegê-lo:

```shell
valet secure laravel
```

Para "dessegurar" um site e reverter ao tráfego de servir sobre HTTP plano, usar o comando `desseguro`. Como o comando "seguro", este comando aceita o nome do host que você deseja dessegurar:

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### Servindo o site padrão.

Às vezes, você pode querer configurar o Valet para servir um 'site padrão' em vez de um '404' quando visitar um domínio desconhecido 'teste'. Para conseguir isso, você pode adicionar uma opção 'padrão' ao seu arquivo de configuração 'config.json' na pasta '~/.config/valet/' contendo a URL do site que deve servir como o seu site padrão:

```php
    "default": "/Users/Sally/Sites/example-site",
```

<a name="per-site-php-versions"></a>
### Versões do PHP por Site

Por padrão, o Valet utiliza sua instalação global do PHP para servir seus sites. No entanto, se você precisar suportar múltiplas versões do PHP em diferentes sites, você pode usar o comando `isolate` para especificar qual versão do PHP um site específico deve utilizar. O comando `isolate` configura o Valet a usar a versão especificada do PHP para o site localizado no diretório de trabalho atual:

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```

Se o nome do seu site não corresponde ao nome do diretório que o contém, você pode especificar o nome do seu site usando a opção --site:

```shell
valet isolate php@8.0 --site="site-name"
```

Para sua conveniência, você pode usar os comandos 'valet php', 'composer' e 'which-php' para proxy de chamadas para o CLI apropriado do PHP ou ferramenta com base na versão configurada do PHP do site:

```shell
valet php
valet composer
valet which-php
```

Você pode executar o comando "isolated" para exibir uma lista de todos os seus sites isolados, incluindo suas versões do PHP:

```shell
valet isolated
```

Para reverter um site de volta à versão globalmente instalada do PHP do Valet, você pode invocar o comando 'unisolate' no diretório raiz do site:

```shell
valet unisolate
```

<a name="sharing-sites"></a>
## Sites de compartilhamento

O Valet inclui um comando para compartilhar seus sites locais com o mundo, fornecendo uma maneira fácil de testar seu site em dispositivos móveis ou compartilhá-lo com membros da equipe e clientes.

De caixa de entrada, o Valet suporta compartilhamento de sites através do ngrok ou da exposição. Antes de compartilhar um site, você deve atualizar a configuração do Valet usando o comando 'share-tool', especificando, seja 'ngrok' ou 'expose':

```shell
valet share-tool ngrok
```

Se você escolher uma ferramenta e não tiver instalado via Homebrew (para ngrok) ou Composer (para Expose), o Valet irá solicitar automaticamente que você a instale. É claro que ambas as ferramentas exigem que você autentique sua conta de ngrok ou Expose antes de poder começar a compartilhar sites.

Para compartilhar um site, navegue até o diretório do site no seu terminal e execute o comando 'share' do Valet. Um URL acessível publicamente será colocado na sua área de transferência e pronto para ser colado diretamente em seu navegador ou compartilhado com sua equipe:

```shell
cd ~/Sites/laravel

valet share
```

Para parar de compartilhar seu site, você pode pressionar 'Control + C'.

> ¡ALERTA!
> Se você estiver usando um servidor DNS personalizado (como 1.1.1.1), o compartilhamento do ngrok pode não funcionar corretamente. Se for esse o caso no seu computador, abra as configurações de sistema, vá para a aba "Configurações de rede", abra as configurações avançadas e vá na aba DNS e adicione 127.0.0.1 como servidor DNS principal.

<a name="sharing-sites-via-ngrok"></a>
#### Compartilhando Sites com o Ngrok

Compartilhar seu site usando o ngrok requer que você crie uma [conta ngrok](https://dashboard.ngrok.com/signup) e configure um [token de autenticação](https://dashboard.ngrok.com/get-started/your-authtoken). Uma vez que você tem um token de autenticação, você pode atualizar sua configuração do Valet com esse token:

```shell
valet set-ngrok-token YOUR_TOKEN_HERE
```

> [!NOTE]
> Você pode passar parâmetros adicionais ao comando compartilhar do ngrok, como por exemplo 'valet share --region=eu'. Para mais informações consulte a [documentação do ngrok](https://ngrok.com/docs).

<a name="sharing-sites-via-expose"></a>
#### Compartilhamento de sites usando o Exporre

Para compartilhar seu site usando o Exposé, você precisa criar uma conta no [Exposé](https://expose.dev/register) e autenticar com o Exposé por meio de seu token de autenticação.

Você pode consultar a documentação do [ Exposé](https://expose.dev/docs ) para informações sobre os parâmetros adicionais que ele suporta.

<a name="sharing-sites-on-your-local-network"></a>
### Compartilhando sites em sua rede local

O Valet restringe o tráfego de entrada para a interface interna '127.0.0.1' por padrão, de modo que sua máquina de desenvolvimento não seja exposta a riscos de segurança da internet.

Se você deseja permitir que outros dispositivos na sua rede local acessem os sites do Valet no seu computador usando o endereço IP de seu computador (por exemplo, '192.168.1.10/application.test'), você precisará editar manualmente o arquivo de configuração apropriado do Nginx para esse site e remover a restrição na diretiva 'listen'. Você deverá remover o prefixo '127.0.0.1:' da diretiva 'listen' para as portas 80 e 443.

Se você não executou 'valet secure', para o projeto, você pode abrir acesso de rede para todos os sites que não possuem HTTPS editando a arquivo /usr/local/etc/nginx/valet/valet.conf . Porém, se você está usando o site do projeto através do HTTPS (você executou 'valet secure' para o site) então você deve editar o arquivo ~/.config/valet/Nginx/app-name.test.

Uma vez que você tenha atualizado a configuração do Nginx, execute o comando `valet restart` para aplicar as alterações de configuração.

<a name="site-specific-environment-variables"></a>
## Variáveis de Ambiente Específicas do Local

Alguns aplicativos que usam outros frameworks dependem de variáveis ambientais do servidor, mas não fornecem uma maneira para essas variáveis serem configuradas dentro do seu projeto. O Valet permite configurar as variáveis ambientais específicas do site, adicionando um arquivo ` .valet-env.php` na raiz do seu projeto. Este arquivo deve retornar uma matriz de pares de variável  / ambiente que será adicionado à matriz global `$_SERVER` para cada site especificado no array:

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
## Serviços de Proxy

Às vezes você pode querer proxy um domínio valet para outro serviço em sua máquina local. Por exemplo, às vezes você pode precisar executar o valet enquanto também executa um site separado no Docker; no entanto, o valet e o Docker não podem se conectar à mesma porta 80 ao mesmo tempo.

Para resolver isso, você pode usar o comando 'proxy' para gerar um proxy. Por exemplo, você pode redirecionar todo o tráfego de 'http://elasticsearch.test' para 'http://127.0.0.1:9200':

```shell
# Proxy over HTTP...
valet proxy elasticsearch http://127.0.0.1:9200

# Proxy over TLS + HTTP/2...
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

Você pode remover um proxy usando o comando `unproxy`:

```shell
valet unproxy elasticsearch
```

Você pode usar o comando `proxies` para listar todas as configurações de site que são proxy:

```shell
valet proxies
```

<a name="custom-valet-drivers"></a>
## Motoristas personalizados do valet

Você pode escrever seu próprio driver "Valet" para atender aplicativos PHP em execução em um framework ou CMS que não é suportado nativamente pelo Valet. Quando você instala o Valet, um diretório `~/.config/valet/Drivers` é criado que contém um arquivo `SampleValetDriver.php`. Este arquivo contém uma implementação de driver de amostra para demonstrar como escrever um driver personalizado. Escrever um driver só exige que você implemente três métodos: 'serves', 'isStaticFile' e 'frontControllerPath'.

Todos os três métodos recebem os valores `$sitePath`, `$siteName` e `$uri` como argumentos. O `$sitePath` é o caminho totalmente qualificado ao site que está sendo servido em sua máquina, tal como `/Users/Lisa/Sites/my-project`. O `$siteName` é a parte "host" / "nome do site" do domínio (``my-project``). O `$uri` é o URI de solicitação recebida (``/foo/bar``).

Depois de ter terminado seu motorista personalizado Valet, coloque-o na pasta `~/.config/valet/Drivers` usando o acordo de nomenclatura `FrameworkValetDriver.php`. Por exemplo, se você está escrevendo um motor personalizado do Valet para o WordPress, o nome do arquivo deve ser `WordPressValetDriver.php`.

Vamos dar uma olhada em uma implementação de amostra de cada método que o seu driver personalizado do Valet deve implementar.

<a name="the-serves-method"></a>
#### O método `serve`

O método `serves` deve retornar `true` se o driver do seu projeto deve tratar a solicitação recebida. Caso contrário, o método deve retornar `false`. Por isso, dentro desse método, você deve tentar determinar se o `$sitePath` fornecido contém um projeto do tipo que está tentando servir.

Por exemplo, vamos imaginar que estamos escrevendo um 'WordPressValetDriver'. Nosso método 'serves' pode parecer algo assim:

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
#### O Método `isStaticFile`

O método deve determinar se a solicitação de entrada é para um arquivo "estático", como uma imagem ou um arquivo CSS. Se o arquivo for estático, o método deve retornar o caminho totalmente qualificado do arquivo estático no disco. Se a solicitação não for para um arquivo estático, o método deve retornar `false`:

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

> ¡ADVERTENCIA!
> O método `isStaticFile` será chamado somente se o método `serves` retornar `true` para a solicitação recebida e o URI da solicitação não for `/`.

<a name="the-frontcontrollerpath-method"></a>
#### O método `frontControllerPath`

O método `frontControllerPath` deve retornar o caminho totalmente qualificado para seu "front controller". Normalmente, esse é um arquivo "index.php" ou equivalente.

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
### Motoristas locais

Para definir um driver personalizado de Valet para uma única aplicação, crie um arquivo chamado 'LocalValetDriver.php' na pasta raiz da aplicação. Seu driver personalizado pode estender a classe base 'ValetDriver' ou estender um driver específico da aplicação como o 'LaravelValetDriver':

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
## Outros Comandos do Carregador

<div class="overflow-auto">

| Comandante | Descrição |
|-------------|-------------|
| "lista de espera" | Exibir uma lista de todos os comandos do Valet. |
| ‘diagnóstico do motorista’ | Diagnóstico de saída para ajudar na depuração do valet. |
| lista de diretórios do valet | Determine o comportamento da listagem de diretório. O padrão é "desligado", que renderiza uma página 404 para diretórios. |
| "vale esquecer" | Execute este comando de um diretório "parqueado" para removê-lo da lista do diretório "parqueado". |
| "log do motorista" | Visualize uma lista de registros que são escritos pelo serviço Valet. |
| caminho de zelador | Visualizar todos os seus "caminhos" estacionados. |
| 'valet restart' | Reinicie o daemon do valete. |
| inicia o porteiro | Inicie o daemon do valet. |
| 'Passeio de táxi' | Parem o demônio valet! |
| 'confiança de valet' | Adicione os arquivos sudoers do Brew e do Valet para permitir que os comandos do Valet sejam executados sem solicitar sua senha. |
| Valet Desinstalar | Desinstalar o Valet: mostra instruções para desinstalação manual. Passe a opção `--force` para apagar agressivamente todos os recursos do Valet. |

</div>

<a name="valet-directories-and-files"></a>
## Diretórios e arquivos de Valet

Você pode achar as informações a seguir úteis ao solucionar problemas com seu ambiente de Valet:

#### `~/.config/valet`

Contém toda a configuração do Valet. Você pode querer manter uma cópia de segurança deste diretório.

#### "~/ .config/valet/dnsmasq.d/"

Este diretório contém a configuração do DNSMasq.

#### "~/.config/valet/Drivers/"

Esta pasta contém os controladores do Valet. Os controladores determinam como um framework ou CMS específico é servido.

#### `.config/valet/Nginx/`

Este diretório contém todos os arquivos de configuração do site Nginx para o Valet. Esses arquivos são recriados ao executar o comando "install" ou "secure".

#### '~/.config/valet/Sites/'

Este diretório contém todos os símbolos de ligação para seus [projetos ligados](#the-link-command).

#### ~/.config/valet/config.json

Este arquivo é o de configuração do Valet.

#### `./.config/valet/valet.sock'

Este arquivo é o soquete do FPM usado pela instalação do Nginx do Valet. Isso só existe se o PHP estiver rodando corretamente.

#### ' ~/.config/valet/Log/fpm-php.www.log '

Este arquivo é o log de erros do PHP.

#### `~/.config/valet/Log/nginx-error.log`

Este arquivo é o registro de erros do Nginx.

#### `/usr/local/var/log/php-fpm.log`

Este arquivo é o registro de erros do PHP-FPM.

#### `/usr/local/var/log/nginx`

Este diretório contém os log do Nginx de acesso e erros.

#### `/usr/local/etc/php/X.X/conf.d`

Este diretório contém os arquivos `*.ini` para várias configurações de configuração do PHP.

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

Este arquivo é o arquivo de configuração do pool do PHP-FPM.

#### "~/ .composer/vendor/laravel/valet/cli/stubs/secure.valet.conf"

Este arquivo é a configuração padrão do Nginx utilizada para construir certificados SSL para o seu site.

<a name="disk-access"></a>
### Acesso em Disco

Desde o macOS 10.14, [o acesso a alguns arquivos e diretórios é restrito por padrão](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf). Essas restrições incluem as pastas Desktop, Documentos e Downloads. Além disso, o acesso a volume de rede e volume removível é restrito. Portanto, Valet recomenda que suas pastas de site sejam localizadas fora desses locais protegidos.

Porém, caso você queira atender sites de dentro de um desses locais, precisará dar "Accesso Total ao Disco" no Nginx. Caso contrário, poderá ter problemas com erros do servidor ou outros comportamentos imprevisíveis do Nginx, especialmente quando estiver atendendo ativos estáticos. Normalmente, o macOS irá automaticamente solicitar a você para conceder acesso total ao Nginx nesses locais. Ou, você pode fazer isso manualmente via "Preferências do Sistema" > "Segurança & Privacidade" > "Privacidade" e selecionar "Accesso Total ao Disco". Em seguida, habilite as entradas do Nginx na aba principal.
