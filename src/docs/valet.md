# Laravel Valet

<a name="introduction"></a>
## Introdução

::: info NOTA
Procurando uma maneira ainda mais fácil de desenvolver aplicativos Laravel no macOS ou Windows? Confira [Laravel Herd](https://herd.laravel.com). O Herd inclui tudo o que você precisa para começar a desenvolver Laravel, incluindo Valet, PHP e Composer.
:::

[Laravel Valet](https://github.com/laravel/valet) é um ambiente de desenvolvimento para minimalistas do macOS. O Laravel Valet configura seu Mac para sempre executar [Nginx](https://www.nginx.com/) em segundo plano quando sua máquina inicia. Então, usando [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq), o Valet faz proxy de todas as solicitações no domínio `*.test` para apontar para sites instalados em sua máquina local.

Em outras palavras, o Valet é um ambiente de desenvolvimento Laravel extremamente rápido que usa aproximadamente 7 MB de RAM. Valet não é um substituto completo para [Sail](/docs/sail) ou [Homestead](/docs/homestead), mas fornece uma ótima alternativa se você quer fundamentos flexíveis, prefere velocidade extrema ou está trabalhando em uma máquina com uma quantidade limitada de RAM.

O suporte Valet pronto para uso inclui, mas não está limitado a:

[Laravel](https://laravel.com)
[Bedrock](https://roots.io/bedrock/)
[CakePHP 3](https://cakephp.org)
[ConcreteCMS](https://www.concretecms.com/)
[Contao](https://contao.org/en/)
[Craft](https://craftcms.com)
[Drupal](https://www.drupal.org/)
[ExpressionEngine](https://www.expressionengine.com/)
[Jigsaw](https://jigsaw.tighten.co)
[Joomla](https://www.joomla.org/)
[Katana](https://github.com/themsaid/katana)
[Kirby](https://getkirby.com/)
[Magento](https://magento.com/)
[OctoberCMS](https://octobercms.com/)
[Sculpin](https://sculpin.io/)
[Slim](https://www.slimframework.com)
[Statamic](https://statamic.com)
- Static HTML
[Symfony](https://symfony.com)
[WordPress](https://wordpress.org)
[Zend](https://framework.zend.com)

No entanto, você pode estender o Valet com seus próprios [drivers personalizados](#custom-valet-drivers).

<a name="installation"></a>
## Instalação

::: warning AVISO
O Valet requer macOS e [Homebrew](https://brew.sh/). Antes da instalação, certifique-se de que nenhum outro programa, como Apache ou Nginx, esteja vinculado à porta 80 da sua máquina local.
:::

Para começar, primeiro você precisa garantir que o Homebrew esteja atualizado usando o comando `update`:

```shell
brew update
```

Em seguida, você deve usar o Homebrew para instalar o PHP:

```shell
brew install php
```

Após instalar o PHP, você está pronto para instalar o [gerenciador de pacotes do Composer](https://getcomposer.org). Além disso, certifique-se de que o diretório `$HOME/.composer/vendor/bin` esteja no "PATH" do seu sistema. Após a instalação do Composer, você pode instalar o Laravel Valet como um pacote global do Composer:

```shell
composer global require laravel/valet
```

Finalmente, você pode executar o comando `install` do Valet. Isso configurará e instalará o Valet e o DnsMasq. Além disso, os daemons dos quais o Valet depende serão configurados para serem iniciados quando o sistema iniciar:

```shell
valet install
```

Depois que o Valet estiver instalado, tente executar ping em qualquer domínio `*.test` no seu terminal usando um comando como `ping foobar.test`. Se o Valet estiver instalado corretamente, você deverá ver esse domínio respondendo em `127.0.0.1`.

O Valet iniciará automaticamente os serviços necessários sempre que sua máquina inicializar.

<a name="php-versions"></a>
#### Versões do PHP

::: info NOTA
Em vez de modificar sua versão global do PHP, você pode instruir o Valet a usar versões do PHP por site por meio do comando `isolate` [](#per-site-php-versions).
:::

O Valet permite que você alterne as versões do PHP usando o comando `valet use php@version`. O Valet instalará a versão especificada do PHP por meio do Homebrew se ela ainda não estiver instalada:

```shell
valet use php@8.2

valet use php
```

Você também pode criar um arquivo `.valetrc` na raiz do seu projeto. O arquivo `.valetrc` deve conter a versão do PHP que o site deve usar:

```shell
php=php@8.2
```

Depois que esse arquivo for criado, você pode simplesmente executar o comando `valet use` e ​​o comando determinará a versão do PHP preferida do site lendo o arquivo.

::: warning AVISO
O Valet serve apenas uma versão do PHP por vez, mesmo se você tiver várias versões do PHP instaladas.
:::

<a name="database"></a>
#### Banco de dados

Se seu aplicativo precisar de um banco de dados, confira o [DBngin](https://dbngin.com), que fornece uma ferramenta de gerenciamento de banco de dados gratuita e completa que inclui MySQL, PostgreSQL e Redis. Após a instalação do DBngin, você pode se conectar ao seu banco de dados em `127.0.0.1` usando o nome de usuário `root` e uma string vazia para a senha.

<a name="resetting-your-installation"></a>
#### Redefinindo sua instalação

Se você estiver tendo problemas para fazer sua instalação do Valet funcionar corretamente, executar o comando `composer global require laravel/valet` seguido por `valet install` redefinirá sua instalação e poderá resolver uma variedade de problemas. Em casos raros, pode ser necessário fazer um "hard reset" no Valet executando `valet uninstall --force` seguido de `valet install`.

<a name="upgrading-valet"></a>
### Atualizando o Valet

Você pode atualizar sua instalação do Valet executando o comando `composer global require laravel/valet` no seu terminal. Após a atualização, é uma boa prática executar o comando `valet install` para que o Valet possa fazer atualizações adicionais em seus arquivos de configuração, se necessário.

<a name="upgrading-to-valet-4"></a>
#### Atualizando para o Valet 4

Se você estiver atualizando do Valet 3 para o Valet 4, siga as seguintes etapas para atualizar corretamente sua instalação do Valet:

- Se você adicionou arquivos `.valetphprc` para personalizar a versão PHP do seu site, renomeie cada arquivo `.valetphprc` para `.valetrc`. Em seguida, adicione `php=` ao conteúdo existente do arquivo `.valetrc`.
[SampleValetDriver](https://github.com/laravel/valet/blob/d7787c025e60abc24a5195dc7d4c5c6f2d984339/cli/stubs/SampleValetDriver.php) como exemplo.
- Se você usa PHP 7.1 - 7.4 para servir seus sites, certifique-se de ainda usar o Homebrew para instalar uma versão do PHP 8.0 ou superior, pois o Valet usará esta versão, mesmo que não seja sua versão vinculada primária, para executar alguns de seus scripts.

<a name="serving-sites"></a>
## Servindo Sites

Depois que o Valet estiver instalado, você estará pronto para começar a servir seus aplicativos Laravel. O Valet fornece dois comandos para ajudar você a servir seus aplicativos: `park` e `link`.

<a name="the-park-command"></a>
### O comando `park`

O comando `park` registra um diretório na sua máquina que contém seus aplicativos. Depois que o diretório for "estacionado" com o Valet, todos os diretórios dentro desse diretório estarão acessíveis no seu navegador da web em `http://<nome-do-diretório>.test`:

```shell
cd ~/Sites

valet park
```

É só isso. Agora, qualquer aplicativo que você criar dentro do seu diretório "estacionado" será automaticamente servido usando a convenção `http://<nome-do-diretório>.test`. Então, se o seu diretório estacionado contiver um diretório chamado "laravel", o aplicativo dentro desse diretório estará acessível em `http://laravel.test`. Além disso, o Valet permite automaticamente que você acesse o site usando subdomínios curinga (`http://foo.laravel.test`).

<a name="the-link-command"></a>
### O comando `link`

O comando `link` também pode ser usado para servir seus aplicativos Laravel. Este comando é útil se você quiser servir um único site em um diretório e não o diretório inteiro:

```shell
cd ~/Sites/laravel

valet link
```

Depois que um aplicativo foi vinculado ao Valet usando o comando `link`, você pode acessar o aplicativo usando seu nome de diretório. Então, o site que foi vinculado no exemplo acima pode ser acessado em `http://laravel.test`. Além disso, o Valet permite automaticamente que você acesse o site usando subdomínios curinga (`http://foo.laravel.test`).

Se você quiser servir o aplicativo em um nome de host diferente, você pode passar o nome de host para o comando `link`. Por exemplo, você pode executar o seguinte comando para tornar um aplicativo disponível em `http://application.test`:

```shell
cd ~/Sites/laravel

valet link application
```

Claro, você também pode servir aplicativos em subdomínios usando o comando `link`:

```shell
valet link api.application
```

Você pode executar o comando `links` para exibir uma lista de todos os seus diretórios vinculados:

```shell
valet links
```

O comando `unlink` pode ser usado para destruir o link simbólico de um site:

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### Protegendo sites com TLS

Por padrão, o Valet atende sites por HTTP. No entanto, se você quiser atender um site por TLS criptografado usando HTTP/2, você pode usar o comando `secure`. Por exemplo, se seu site estiver sendo atendido pelo Valet no domínio `laravel.test`, você deve executar o seguinte comando para protegê-lo:

```shell
valet secure laravel
```

Para "desproteger" um site e voltar a atender seu tráfego por HTTP simples, use o comando `unsecure`. Assim como o comando `secure`, este comando aceita o nome do host que você deseja desproteger:

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### Atendendo um site padrão

Às vezes, você pode querer configurar o Valet para atender um site "padrão" em vez de um `404` ao visitar um domínio `test` desconhecido. Para fazer isso, você pode adicionar uma opção `default` ao seu arquivo de configuração `~/.config/valet/config.json` contendo o caminho para o site que deve servir como seu site padrão:

```php
    "default": "/Users/Sally/Sites/example-site",
```

<a name="per-site-php-versions"></a>
### Versões PHP por site

Por padrão, o Valet usa sua instalação global do PHP para servir seus sites. No entanto, se você precisar oferecer suporte a várias versões do PHP em vários sites, poderá usar o comando `isolate` para especificar qual versão do PHP um site específico deve usar. O comando `isolate` configura o Valet para usar a versão PHP especificada para o site localizado no seu diretório de trabalho atual:

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```

Se o nome do seu site não corresponder ao nome do diretório que o contém, você pode especificar o nome do site usando a opção `--site`:

```shell
valet isolate php@8.0 --site="site-name"
```

Para sua conveniência, você pode usar os comandos `valet php`, `composer` e `which-php` para fazer proxy de chamadas para a CLI ou ferramenta PHP apropriada com base na versão PHP configurada do site:

```shell
valet php
valet composer
valet which-php
```

Você pode executar o comando `isolated` para exibir uma lista de todos os seus sites isolados e suas versões PHP:

```shell
valet isolated
```

Para reverter um site de volta para a versão PHP instalada globalmente do Valet, você pode invocar o comando `unisolate` da raiz do site diretório:

```shell
valet unisolate
```

<a name="sharing-sites"></a>
## Compartilhando sites

O Valet inclui um comando para compartilhar seus sites locais com o mundo, fornecendo uma maneira fácil de testar seu site em dispositivos móveis ou compartilhá-lo com membros da equipe e clientes.

O Valet oferece suporte imediato para compartilhar seus sites via ngrok ou Expose. Antes de compartilhar um site, você deve atualizar sua configuração do Valet usando o comando `share-tool`, especificando `ngrok` ou `expose`:

```shell
valet share-tool ngrok
```

Se você escolher uma ferramenta e não a tiver instalado via Homebrew (para ngrok) ou Composer (para Expose), o Valet solicitará automaticamente que você a instale. Claro, ambas as ferramentas exigem que você autentique sua conta ngrok ou Expose antes de começar a compartilhar sites.

Para compartilhar um site, navegue até o diretório do site em seu terminal e execute o comando `share` do Valet. Uma URL acessível publicamente será colocada na sua área de transferência e estará pronta para ser colada diretamente no seu navegador ou para ser compartilhada com sua equipe:

```shell
cd ~/Sites/laravel

valet share
```

Para parar de compartilhar seu site, você pode pressionar `Control + C`.

::: warning AVISO
Se você estiver usando um servidor DNS personalizado (como `1.1.1.1`), o compartilhamento ngrok pode não funcionar corretamente. Se esse for o caso na sua máquina, abra as configurações do sistema do seu Mac, vá para as configurações de rede, abra as configurações avançadas, vá para a aba DNS e adicione `127.0.0.1` como seu primeiro servidor DNS.
:::

<a name="sharing-sites-via-ngrok"></a>
#### Compartilhando sites via Ngrok

Compartilhar seu site usando o ngrok requer que você [crie uma conta ngrok](https://dashboard.ngrok.com/signup) e [configure um token de autenticação](https://dashboard.ngrok.com/get-started/your-authtoken). Depois de ter um token de autenticação, você pode atualizar sua configuração do Valet com esse token:

```shell
valet set-ngrok-token YOUR_TOKEN_HERE
```

::: info NOTA
Você pode passar parâmetros ngrok adicionais para o comando share, como `valet share --region=eu`. Para obter mais informações, consulte a [documentação do ngrok](https://ngrok.com/docs).
:::

<a name="sharing-sites-via-expose"></a>
#### Compartilhando sites via Expose

Compartilhar seu site usando o Expose requer que você [crie uma conta no Expose](https://expose.dev/register) e [se autentique com o Expose por meio do seu token de autenticação](https://expose.dev/docs/getting-started/getting-your-token).

Você pode consultar a [documentação do Expose](https://expose.dev/docs) para obter informações sobre os parâmetros de linha de comando adicionais que ele suporta.

<a name="sharing-sites-on-your-local-network"></a>
### Compartilhando sites na sua rede local

O Valet restringe o tráfego de entrada para a interface interna `127.0.0.1` por padrão para que sua máquina de desenvolvimento não fique exposta a riscos de segurança da Internet.

Se você deseja permitir que outros dispositivos em sua rede local acessem os sites Valet em sua máquina por meio do endereço IP da sua máquina (por exemplo: `192.168.1.10/application.test`), você precisará editar manualmente o arquivo de configuração Nginx apropriado para esse site para remover a restrição na diretiva `listen`. Você deve remover o prefixo `127.0.0.1:` na diretiva `listen` para as portas 80 e 443.

Se você não executou `valet secure` no projeto, você pode abrir o acesso à rede para todos os sites não HTTPS editando o arquivo `/usr/local/etc/nginx/valet/valet.conf`. No entanto, se você estiver servindo o site do projeto por HTTPS (você executou `valet secure` para o site), então você deve editar o arquivo `~/.config/valet/Nginx/app-name.test`.

Depois de atualizar sua configuração do Nginx, execute o comando `valet restart` para aplicar as alterações de configuração.

<a name="site-specific-environment-variables"></a>
## Variáveis ​​de ambiente específicas do site

Alguns aplicativos que usam outras estruturas podem depender de variáveis ​​de ambiente do servidor, mas não fornecem uma maneira para que essas variáveis ​​sejam configuradas em seu projeto. O Valet permite que você configure variáveis ​​de ambiente específicas do site adicionando um arquivo `.valet-env.php` na raiz do seu projeto. Este arquivo deve retornar uma matriz de pares de variáveis ​​de site/ambiente que serão adicionados à matriz global `$_SERVER` para cada site especificado na matriz:

```php
    <?php

    return [
        // Defina $_SERVER['key'] como "value" para o site laravel.test...
        'laravel' => [
            'key' => 'value',
        ],

        // Defina $_SERVER['key'] como "valor" para todos os sites...
        '*' => [
            'key' => 'value',
        ],
    ];
```

<a name="proxying-services"></a>
## Serviços de proxy

Às vezes, você pode desejar fazer proxy de um domínio Valet para outro serviço em sua máquina local. Por exemplo, ocasionalmente você pode precisar executar o Valet enquanto também executa um site separado no Docker; no entanto, Valet e Docker não podem se vincular à porta 80 ao mesmo tempo.

Para resolver isso, você pode usar o comando `proxy` para gerar um proxy. Por exemplo, você pode fazer proxy de todo o tráfego de `http://elasticsearch.test` para `http://127.0.0.1:9200`:

```shell
# Proxy sobre HTTP...
valet proxy elasticsearch http://127.0.0.1:9200

# Proxy sobre TLS + HTTP/2...
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
## Drivers de Valet Personalizados

Você pode escrever seu próprio "driver" Valet para servir aplicativos PHP em execução em um framework ou CMS que não é suportado nativamente pelo Valet. Quando você instala o Valet, um diretório `~/.config/valet/Drivers` é criado, contendo um arquivo `SampleValetDriver.php`. Este arquivo contém uma implementação de driver de amostra para demonstrar como escrever um driver personalizado. Escrever um driver requer apenas que você implemente três métodos: `serves`, `isStaticFile` e `frontControllerPath`.

Todos os três métodos recebem os valores `$sitePath`, `$siteName` e `$uri` como seus argumentos. O `$sitePath` é o caminho totalmente qualificado para o site que está sendo servido em sua máquina, como `/Users/Lisa/Sites/my-project`. O `$siteName` é a parte "host" / "nome do site" do domínio (`my-project`). O `$uri` é o URI de solicitação de entrada (`/foo/bar`).

Depois de concluir seu driver Valet personalizado, coloque-o no diretório `~/.config/valet/Drivers` usando a convenção de nomenclatura `FrameworkValetDriver.php`. Por exemplo, se você estiver escrevendo um driver Valet personalizado para WordPress, seu nome de arquivo deve ser `WordPressValetDriver.php`.

Vamos dar uma olhada em uma implementação de exemplo de cada método que seu driver Valet personalizado deve implementar.

<a name="the-serves-method"></a>
#### O método `serves`

O método `serves` deve retornar `true` se seu driver deve manipular a solicitação de entrada. Caso contrário, o método deve retornar `false`. Portanto, dentro deste método, você deve tentar determinar se o `$sitePath` fornecido contém um projeto do tipo que você está tentando servir.

Por exemplo, vamos imaginar que estamos escrevendo um `WordPressValetDriver`. Nosso método `serves` pode ser parecido com isto:

```php
    /**
     * Determine se o driver atende à solicitação.
     */
    public function serves(string $sitePath, string $siteName, string $uri): bool
    {
        return is_dir($sitePath.'/wp-admin');
    }
```

<a name="the-isstaticfile-method"></a>
#### O método `isStaticFile`

O `isStaticFile` deve determinar se a solicitação de entrada é para um arquivo que é "estático", como uma imagem ou uma folha de estilo. Se o arquivo for estático, o método deve retornar o caminho totalmente qualificado para o arquivo estático no disco. Se a solicitação de entrada não for para um arquivo estático, o método deve retornar `false`:

```php
    /**
     * Determine se a solicitação recebida é para um arquivo estático.
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

::: warning AVISO
O método `isStaticFile` só será chamado se o método `serves` retornar `true` para a solicitação de entrada e o URI da solicitação não for `/`.
:::

<a name="the-frontcontrollerpath-method"></a>
#### O método `frontControllerPath`

O método `frontControllerPath` deve retornar o caminho totalmente qualificado para o "front controller" do seu aplicativo, que normalmente é um arquivo "index.php" ou equivalente:

```php
    /**
     * Obtenha o caminho totalmente resolvido para o controlador frontal do aplicativo.
     */
    public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
    {
        return $sitePath.'/public/index.php';
    }
```

<a name="local-drivers"></a>
### Drivers locais

Se você quiser definir um driver Valet personalizado para um único aplicativo, crie um arquivo `LocalValetDriver.php` no diretório raiz do aplicativo. Seu driver personalizado pode estender a classe base `ValetDriver` ou estender um driver específico do aplicativo existente, como o `LaravelValetDriver`:

```php
    use Valet\Drivers\LaravelValetDriver;

    class LocalValetDriver extends LaravelValetDriver
    {
        /**
         * Determine se o driver atende à solicitação.
         */
        public function serves(string $sitePath, string $siteName, string $uri): bool
        {
            return true;
        }

        /**
         * Obtenha o caminho totalmente resolvido para o controlador frontal do aplicativo.
         */
        public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
        {
            return $sitePath.'/public_html/index.php';
        }
    }
```

<a name="other-valet-commands"></a>
## Outros comandos Valet

| Comando           | Descrição                                       |
|-------------------|-------------------------------------------------|
| `valet list`      | Exibe uma lista de todos os comandos do Valet.  |
| `valet diagnose`  | Emite diagnósticos para auxiliar na depuração do Valet. |
| `valet directory-listing` | Determina o comportamento da listagem de diretórios. O padrão é "off", que renderiza uma página 404 para diretórios. |
| `valet forget`    | Execute este comando de um diretório "estacionado" para removê-lo da lista de diretórios estacionados. |
| `valet log`       | Visualize uma lista de logs que são gravados pelos serviços do Valet. |
| `valet paths`     | Visualize todos os seus caminhos "estacionados". |
| `valet restart`   | Reinicie os daemons do Valet. |
| `valet start`     | Inicie os daemons do Valet. |
| `valet stop`      | Pare os daemons do Valet.                                                                                                                            |
| `valet trust`     | Adicione arquivos sudoers para Brew e Valet para permitir que comandos Valet sejam executados sem solicitar sua senha.                              |
| `valet uninstall` | Desinstalar Valet: mostra instruções para desinstalação manual. Passe a opção `--force` para excluir agressivamente todos os recursos do Valet. |

<a name="valet-directories-and-files"></a>
## Diretórios e arquivos do Valet

Você pode achar as seguintes informações de diretório e arquivo úteis ao solucionar problemas com seu ambiente Valet:

#### `~/.config/valet`

Contém toda a configuração do Valet. Você pode querer manter um backup deste diretório.

#### `~/.config/valet/dnsmasq.d/`

Este diretório contém a configuração do DNSMasq.

#### `~/.config/valet/Drivers/`

Este diretório contém os drivers do Valet. Os drivers determinam como uma estrutura/CMS específica é atendida.

#### `~/.config/valet/Nginx/`

Este diretório contém todas as configurações do site Nginx do Valet. Esses arquivos são reconstruídos ao executar os comandos `install` e `secure`.

#### `~/.config/valet/Sites/`

Este diretório contém todos os links simbólicos para seus [projetos vinculados](#the-link-command).

#### `~/.config/valet/config.json`

Este arquivo é o arquivo de configuração mestre do Valet.

#### `~/.config/valet/valet.sock`

Este arquivo é o soquete PHP-FPM usado pela instalação Nginx do Valet. Ele só existirá se o PHP estiver sendo executado corretamente.

#### `~/.config/valet/Log/fpm-php.www.log`

Este arquivo é o log do usuário para erros do PHP.

#### `~/.config/valet/Log/nginx-error.log`

Este arquivo é o log do usuário para erros do Nginx.

#### `/usr/local/var/log/php-fpm.log`

Este arquivo é o log do sistema para erros do PHP-FPM.

#### `/usr/local/var/log/nginx`

Este diretório contém os logs de acesso e erro do Nginx.

#### `/usr/local/etc/php/X.X/conf.d`

Este diretório contém os arquivos `*.ini` para várias configurações do PHP.

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

Este arquivo é o arquivo de configuração do pool do PHP-FPM.

#### `~/.composer/vendor/laravel/valet/cli/stubs/secure.valet.conf`

Este arquivo é a configuração padrão do Nginx usada para criar certificados SSL para seus sites.

<a name="disk-access"></a>
### Acesso ao disco

Desde o macOS 10.14, [o acesso a alguns arquivos e diretórios é restrito por padrão](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf). Essas restrições incluem os diretórios Desktop, Documents e Downloads. Além disso, o acesso ao volume de rede e ao volume removível é restrito. Portanto, a Valet recomenda que as pastas do seu site estejam localizadas fora desses locais protegidos.

No entanto, se você deseja servir sites de dentro de um desses locais, precisará dar ao Nginx "Acesso total ao disco". Caso contrário, você pode encontrar erros de servidor ou outro comportamento imprevisível do Nginx, especialmente ao servir ativos estáticos. Normalmente, o macOS solicitará automaticamente que você conceda ao Nginx acesso total a esses locais. Ou você pode fazer isso manualmente em `Preferências do sistema` > `Segurança e privacidade` > `Privacidade` e selecionar `Acesso total ao disco`. Em seguida, habilite todas as entradas `nginx` no painel da janela principal.
