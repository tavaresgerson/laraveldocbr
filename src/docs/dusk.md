# Laravel Dusk

<a name="introduction"></a>
## Introdução

Laravel Dusk [https://github.com/laravel/dusk] fornece uma API de automação e teste do navegador expressiva e fácil de usar. Por padrão, o Dusk não requer que você instale JDK ou Selenium em seu computador local. Em vez disso, o Dusk utiliza uma instalação do ChromeDriver independente. No entanto, você é livre para utilizar qualquer outro driver compatível com Selenium que deseja.

<a name="installation"></a>
## Instalação

Para começar, você deve instalar [Chrome do Google](https://www.google.com/chrome/) e adicionar a dependência `laravel/dusk` do Composer ao seu projeto:

```shell
composer require laravel/dusk --dev
```

> [Aviso]
> Se você está registrando manualmente o provedor de serviço do Dusk, nunca registre-o em seu ambiente de produção, pois isso poderia levar a usuários arbitrários serem capazes de autenticar com seu aplicativo.

Após instalar o pacote Dusk, execute o comando Artisan ‘dusk:install’. O comando ‘dusk:install’ criará um diretório chamado ‘tests/Browser’, um exemplo de teste do Dusk e instalará o binário do Chrome Driver para seu sistema operacional.

```shell
php artisan dusk:install
```

Em seguida, configure a variável de ambiente 'APP_URL' no arquivo '.env' do seu aplicativo. O valor deve coincidir com o URL que você usa para acessar seu aplicativo em um navegador.

> Nota!
> Se estiver usando o [Laravel Sail](https://laravel.com/docs/sail) para gerenciar seu ambiente de desenvolvimento local, também consulte a documentação do Laravel sobre como configurar e executar testes do Dusk ([configuração e execução de testes do Dusk](https://laravel.com/docs/sail#laravel-dusk)).

<a name="managing-chromedriver-installations"></a>
### Gerenciando Instalações do WebDriver do Chrome

Se você gostaria de instalar uma versão diferente do chromedriver do que é instalado pelo comando 'dusk:install', você pode usar o comando 'dusk:chrome-driver':

```shell
# Install the latest version of ChromeDriver for your OS...
php artisan dusk:chrome-driver

# Install a given version of ChromeDriver for your OS...
php artisan dusk:chrome-driver 86

# Install a given version of ChromeDriver for all supported OSs...
php artisan dusk:chrome-driver --all

# Install the version of ChromeDriver that matches the detected version of Chrome / Chromium for your OS...
php artisan dusk:chrome-driver --detect
```

> [ALERTA!]
> O Dusk exige que os binários chromedriver sejam executáveis. Se você estiver tendo problemas com o Dusk, certifique-se de executar usando o seguinte comando binário: chmod -R 0755 vendor/laravel/dusk/bin/.

<a name="using-other-browsers"></a>
### Usando Outros Navegadores

Por padrão, o Dusk usa o Google Chrome e uma instalação independente do [ChromeDriver](https://sites.google.com/chromium.org/driver) para executar seus testes no navegador. No entanto, você pode iniciar seu próprio servidor Selenium e executar seus testes em qualquer navegador que desejar.

Para começar, abra seu arquivo 'tests/DuskTestCase.php', que é o caso de teste base para sua aplicação Dusk. Dentro deste arquivo você pode remover a chamada para o método 'startChromeDriver'. Isso irá parar com Dusk de iniciar automaticamente o driver do Chrome:

```php
    /**
     * Prepare for Dusk test execution.
     *
     * @beforeClass
     */
    public static function prepare(): void
    {
        // static::startChromeDriver();
    }
```

Em seguida você pode modificar o método 'driver' para conectar-se a um URL e porta de sua escolha. Além disso, você pode modificar as "capacidades desejadas" que devem ser passados para o WebDriver:

```php
    use Facebook\WebDriver\Remote\RemoteWebDriver;

    /**
     * Create the RemoteWebDriver instance.
     */
    protected function driver(): RemoteWebDriver
    {
        return RemoteWebDriver::create(
            'http://localhost:4444/wd/hub', DesiredCapabilities::phantomjs()
        );
    }
```

<a name="getting-started"></a>
## Iniciando

<a name="generating-tests"></a>
### Geração de Teste

Para gerar um teste do Dusk, utilize o comando Artisan 'dusk:make'. O teste gerado será colocado no diretório 'tests/Browser':

```shell
php artisan dusk:make LoginTest
```

<a name="resetting-the-database-after-each-test"></a>
### Redefinir o Banco de Dados Após Cada Teste

A maioria dos testes que você escreve interage com páginas que recuperam dados do banco de dados da sua aplicação; no entanto, os seus testes Dusk nunca devem usar a trait 'RefreshDatabase'. A trait 'RefreshDatabase' explora as transações do banco de dados, o que não será aplicável ou disponível em requisições HTTP. Em vez disso, você tem duas opções: a trait 'DatabaseMigrations' e a trait 'DatabaseTruncation'.

<a name="reset-migrations"></a>
#### Usando Migrações de Banco de Dados

A característica DatabaseMigrations vai executar as migrações do banco de dados antes de cada teste. No entanto, derrubar e recriar suas tabelas de banco de dados para cada teste é tipicamente mais lento que truncar a tabela:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;

uses(DatabaseMigrations::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    //
}
```

> ¡ADVERTENCIA!
> O banco de dados SQLite na memória pode não ser usado ao executar testes do Dusk. Como o navegador executa dentro de seu próprio processo, ele não será capaz de acessar os bancos de dados na memória de outros processos.

<a name="reset-truncation"></a>
#### Usando a Trunca da Base de Dados

O "trait" DatabaseTruncation irá migrar o seu banco de dados na primeira execução do teste para garantir que suas tabelas de banco de dados tenham sido criadas corretamente. Porém, nas próximas execuções de testes, as tabelas do banco de dados serão apenas truncadas - proporcionando uma velocidade melhor ao reexecutar todas as migrações de banco de dados:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;

uses(DatabaseTruncation::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseTruncation;

    //
}
```

Por padrão, este traço irá truncar todas as tabelas exceto a tabela de migração. Se você gostaria de personalizar as tabelas que devem ser truncadas, você pode definir uma propriedade `$tablesTotruncate` na sua classe de teste:

> Nota:
> Se você estiver usando o Pest, você deve definir propriedades ou métodos na classe base DuskTestCase ou em qualquer classe sua que estenda a classe DuskTestCase.

```php
    /**
     * Indicates which tables should be truncated.
     *
     * @var array
     */
    protected $tablesToTruncate = ['users'];
```

Alternativamente, você pode definir uma propriedade `$exceptTables` em sua classe de teste para especificar quais tabelas devem ser excluídas da trunção:

```php
    /**
     * Indicates which tables should be excluded from truncation.
     *
     * @var array
     */
    protected $exceptTables = ['users'];
```

Para especificar as conexões de banco de dados que devem ter suas tabelas truncadas você pode definir uma propriedade ' $connectionsTo Truncate' em sua classe de teste.

```php
    /**
     * Indicates which connections should have their tables truncated.
     *
     * @var array
     */
    protected $connectionsToTruncate = ['mysql'];
```

Se você gostaria de executar código antes ou após a operação de limpeza do banco de dados, você pode definir os métodos `beforeTruncatingDatabase` ou `afterTruncatingDatabase` na sua classe de teste:

```php
    /**
     * Perform any work that should take place before the database has started truncating.
     */
    protected function beforeTruncatingDatabase(): void
    {
        //
    }

    /**
     * Perform any work that should take place after the database has finished truncating.
     */
    protected function afterTruncatingDatabase(): void
    {
        //
    }
```

<a name="running-tests"></a>
### Testes de desempenho

Para executar os testes do navegador, execute o comando 'dusk' Artisan:

```shell
php artisan dusk
```

Se você teve falhas de teste na última vez em que executou o comando 'dusk', pode economizar tempo reexecutando os testes com falha primeiro usando o comando 'dusk:fails':

```shell
php artisan dusk:fails
```

O comando `dusk` aceita qualquer argumento que é normalmente aceito pelo Pest/ PHPUnit test runner, tal como permitir-lhe executar apenas testes para um determinado [grupo](https://docs.phpunit.de/pt_br/10.5/anotações.html#grupo):

```shell
php artisan dusk --group=foo
```

> Nota:
> Se você estiver usando o Laravel Sail para gerenciar seu ambiente de desenvolvimento local, por favor consulte a documentação do Laravel Sail sobre [configurando e executando testes do Dusk](/docs/sail#laravel-dusk).

<a name="manually-starting-chromedriver"></a>
#### Iniciando o chromedriver manualmente

Por padrão, o Dusk tentará automaticamente iniciar o chromedriver. Se isso não funcionar para o seu sistema específico, você pode iniciar manualmente o chromedriver antes de executar o comando "dusk". Se optar por iniciar manualmente o chromedriver, você deve comentar a seguinte linha em seu arquivo "tests/DuskTestCase.php":

```php
    /**
     * Prepare for Dusk test execution.
     *
     * @beforeClass
     */
    public static function prepare(): void
    {
        // static::startChromeDriver();
    }
```

Além disso, caso você comece o ChromeDriver em um porto diferente de 9515, você deve alterar o método `driver` da mesma classe para refletir o porto correto.

```php
    use Facebook\WebDriver\Remote\RemoteWebDriver;

    /**
     * Create the RemoteWebDriver instance.
     */
    protected function driver(): RemoteWebDriver
    {
        return RemoteWebDriver::create(
            'http://localhost:9515', DesiredCapabilities::chrome()
        );
    }
```

<a name="environment-handling"></a>
### Tratamento do ambiente

Para forçar o Dusk a usar seu arquivo de ambiente específico ao executar testes, crie um arquivo `.env.dusk.{ambiente}` na raiz do seu projeto. Por exemplo, se você for iniciar o comando `dusk` do seu `ambiente local`, você deve criar um arquivo `.env.dusk.local`.

Ao executar os testes, o Dusk irá fazer um backup do seu arquivo `.env` e renomear seu ambiente Dusk para `.env`. Depois que os testes terminarem, o seu arquivo `.env` será restaurado.

<a name="browser-basics"></a>
## Noções Básicas de Navegador

<a name="creating-browsers"></a>
### Criando navegadores

Para começar, vamos escrever um teste que verifica se podemos fazer login em nosso aplicativo. Após gerar um teste, podemos modificá-lo para navegar até a página de login, inserir alguns credenciais e clicar no botão "Login". Para criar uma instância do navegador, você pode chamar o método `browse` dentro do seu teste Dusk:

```php tab=Pest
<?php

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;

uses(DatabaseMigrations::class);

test('basic example', function () {
    $user = User::factory()->create([
        'email' => 'taylor@laravel.com',
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit('/login')
                ->type('email', $user->email)
                ->type('password', 'password')
                ->press('Login')
                ->assertPathIs('/home');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * A basic browser test example.
     */
    public function test_basic_example(): void
    {
        $user = User::factory()->create([
            'email' => 'taylor@laravel.com',
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->visit('/login')
                    ->type('email', $user->email)
                    ->type('password', 'password')
                    ->press('Login')
                    ->assertPathIs('/home');
        });
    }
}
```

Como pode ver no exemplo acima, o método 'browse' aceita um closure. Um navegador de instâncias será automaticamente passado para este closure pelo Pés e é o principal objeto usado para interagir com seus aplicativos e fazer afirmações contra eles.

<a name="creating-multiple-browsers"></a>
#### Criando Vários Navegadores

Às vezes você pode precisar de vários navegadores para executar um teste corretamente. Por exemplo, vários navegadores podem ser necessários para testar uma tela de bate-papo que interage com soquetes da web. Para criar vários navegadores, basta acrescentar mais argumentos do navegador à assinatura do fecho fornecido ao método `browse`:

```php
    $this->browse(function (Browser $first, Browser $second) {
        $first->loginAs(User::find(1))
              ->visit('/home')
              ->waitForText('Message');

        $second->loginAs(User::find(2))
               ->visit('/home')
               ->waitForText('Message')
               ->type('message', 'Hey Taylor')
               ->press('Send');

        $first->waitForText('Hey Taylor')
              ->assertSee('Jeffrey Way');
    });
```

<a name="navigation"></a>
### Navegação

O método `visit` pode ser usado para navegar até um URI dado dentro do seu aplicativo:

```php
    $browser->visit('/login');
```

Você pode usar o método `visitRoute` para navegar até uma [rota com nome]:

```php
    $browser->visitRoute('login');
```

Você pode navegar "para trás" e "para frente" usando os métodos 'back' e 'forward':

```php
    $browser->back();

    $browser->forward();
```

Você pode usar o método 'refresh' para atualizar a página.

```php
    $browser->refresh();
```

<a name="resizing-browser-windows"></a>
### Redimensionar janelas do navegador

Você pode usar o método 'resize' para ajustar o tamanho da janela do navegador:

```php
    $browser->resize(1920, 1080);
```

O método `maximize` pode ser usado para maximizar a janela do navegador.

```php
    $browser->maximize();
```

O método 'fitContent' redimensiona a janela do navegador para combinar com o tamanho de seu conteúdo:

```php
    $browser->fitContent();
```

Quando um teste falha, o Dusk redimensiona automaticamente o navegador para encaixar o conteúdo antes de tirar uma captura de tela. Você pode desativar essa funcionalidade chamando o método `disableFitOnFailure` dentro do seu teste:

```php
    $browser->disableFitOnFailure();
```

Você pode usar o método 'move' para mover a janela do navegador para uma posição diferente na sua tela:

```php
    $browser->move($x = 100, $y = 100);
```

<a name="browser-macros"></a>
### Macros do navegador

Se você gostaria de definir um método navegador personalizado que você pode reutilizar em uma variedade de seus testes, você pode usar o `macro` método na `Browser` classe. Normalmente, você deve chamar este método do [provedor de serviços'](/docs/providers) 'boot' método:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Laravel\Dusk\Browser;

    class DuskServiceProvider extends ServiceProvider
    {
        /**
         * Register Dusk's browser macros.
         */
        public function boot(): void
        {
            Browser::macro('scrollToElement', function (string $element = null) {
                $this->script("$('html, body').animate({ scrollTop: $('$element').offset().top }, 0);");

                return $this;
            });
        }
    }
```

A função `macro` recebe um nome como seu primeiro argumento, e um 'closure' como segundo. O 'closure' da macro será executado quando você chamar a macro como método de uma instância de Browser:

```php
    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit('/pay')
                ->scrollToElement('#credit-card-details')
                ->assertSee('Enter Credit Card Details');
    });
```

<a name="authentication"></a>
### Autenticação

Com frequência, você vai estar testando páginas que requerem autenticação. Você pode usar o método 'loginAs' do Dusk para evitar interagir com a tela de login da sua aplicação em cada teste. O método 'loginAs' aceita uma chave primária associada à sua modelo autenticável ou um modelo autenticável:

```php
    use App\Models\User;
    use Laravel\Dusk\Browser;

    $this->browse(function (Browser $browser) {
        $browser->loginAs(User::find(1))
              ->visit('/home');
    });
```

> [!ALERTA]
> Depois do uso do método `loginAs`, a sessão do usuário será mantida para todos os testes dentro do arquivo.

<a name="cookies"></a>
### Biscoitos

Você pode usar o método 'cookie' para obter ou definir um valor de um cookie encriptado. Por padrão, todos os cookies criados pelo Laravel são encriptados:

```php
    $browser->cookie('name');

    $browser->cookie('name', 'Taylor');
```

Você pode usar o método `plainCookie` para obter ou definir um valor de cookie não criptografado.

```php
    $browser->plainCookie('name');

    $browser->plainCookie('name', 'Taylor');
```

Você pode usar o método `deleteCookie` para excluir a cookie dada:

```php
    $browser->deleteCookie('name');
```

<a name="executing-javascript"></a>
### Executando JavaScript

Você pode usar o método 'script' para executar arbitrárias instruções JavaScript dentro do navegador:

```php
    $browser->script('document.documentElement.scrollTop = 0');

    $browser->script([
        'document.body.scrollTop = 0',
        'document.documentElement.scrollTop = 0',
    ]);

    $output = $browser->script('return window.location.pathname');
```

<a name="taking-a-screenshot"></a>
### Tirando uma Captura de Tela

Você pode usar o método 'screenshot' para tirar uma captura de tela e armazená-la com o nome de arquivo fornecido. Todas as capturas de tela serão armazenadas dentro do diretório 'tests/Browser/screenshots':

```php
    $browser->screenshot('filename');
```

O método `responsiveScreenshots` pode ser usado para tirar uma série de capturas de tela em vários pontos de quebra:

```php
    $browser->responsiveScreenshots('filename');
```

O método 'screenshotElement' pode ser usado para tirar uma captura de tela de um elemento específico da página.

```php
    $browser->screenshotElement('#selector', 'filename');
```

<a name="storing-console-output-to-disk"></a>
### Armazenando saída do console em disco

Você pode usar o método 'storeConsoleLog' para escrever a saída do console atual do navegador no disco com o nome de arquivo fornecido. A saída do console será armazenada na pasta 'testes / navegador / console':

```php
    $browser->storeConsoleLog('filename');
```

<a name="storing-page-source-to-disk"></a>
### Armazenando fonte da página em disco

Você pode usar o método 'storeSource' para gravar a fonte da página atual no disco com o nome do arquivo fornecido. A fonte da página será armazenada dentro do diretório 'tests/Browser/source':

```php
    $browser->storeSource('filename');
```

<a name="interacting-with-elements"></a>
## Interação com Elementos

<a name="dusk-selectors"></a>
### Seletores de Crepúsculo

Escolher bons seletores CSS para interagir com elementos é uma das partes mais difíceis de escrever testes de Dusk. Ao longo do tempo, as mudanças no front-end podem fazer seus testes quebrarem de forma semelhante à seguinte:

```php
    // HTML...

    <button>Login</button>

    // Test...

    $browser->click('.login-page .container div > button');
```

Os seletores de crepúsculo permitem-lhe concentrarse na redação testes eficazes em vez de lembrar os seletores CSS. Para definir um seletor, adicione um atributo 'crepuscular' ao seu elemento HTML. Então, quando estiver interagindo com o navegador Dusk, prefique o seletor com '@' para manipular o elemento anexado no seu teste:

```php
    // HTML...

    <button dusk="login-button">Login</button>

    // Test...

    $browser->click('@login-button');
```

Se desejado, você pode personalizar o atributo HTML que a seleção do Dusk utiliza através do método `selectorHtmlAttribute`. Geralmente, esse método deve ser chamado do método `boot` de seu serviço `AppServiceProvider`:

```php
    use Laravel\Dusk\Dusk;

    Dusk::selectorHtmlAttribute('data-dusk');
```

<a name="text-values-and-attributes"></a>
### Texto, Valores e Atributos

<a name="retrieving-setting-values"></a>
#### Recuperando e Definindo Valores

O Dusk fornece vários métodos para interagir com os valores atuais, exibir texto e atributos de elementos na página. Por exemplo, para obter o "valor" de um elemento que corresponde a um seletor CSS ou Dusk específico, use o método value:

```php
    // Retrieve the value...
    $value = $browser->value('selector');

    // Set the value...
    $browser->value('selector', 'value');
```

Você pode usar o método `inputValue` para obter o "valor" de um elemento de entrada que tem um nome de campo dado:

```php
    $value = $browser->inputValue('field');
```

<a name="retrieving-text"></a>
#### Recuperando texto

O método `text` pode ser utilizado para obter o texto de exibição de um elemento que corresponda ao seletor dado:

```php
    $text = $browser->text('selector');
```

<a name="retrieving-attributes"></a>
#### Recuperando Atributos

Por fim, o método atributo pode ser usado para recuperar o valor de um atributo de um elemento que se alinha ao seletor dado:

```php
    $attribute = $browser->attribute('selector', 'value');
```

<a name="interacting-with-forms"></a>
### Interagindo com Formulários

<a name="typing-values"></a>
#### Digitação dos Valores

O crepúsculo oferece uma variedade de métodos para interagir com formas e elementos de entrada. Primeiro, vamos olhar um exemplo de digitar texto em um campo de entrada:

```php
    $browser->type('email', 'taylor@laravel.com');
```

Observe que, embora o método aceite um se necessário, não somos obrigados a passar um seletor CSS para o método 'tipo'. Se um seletor CSS não é fornecido, o Dusk vai procurar um campo "input" ou "textarea" com o atributo "nome" dado.

Para anexar texto ao campo sem limpar seu conteúdo, você pode usar o método `append`:

```php
    $browser->type('tags', 'foo')
            ->append('tags', ', bar, baz');
```

Você pode limpar o valor de uma entrada usando o método 'clear':

```php
    $browser->clear('email');
```

Você pode instruir o Darksun a digitar lentamente usando o método `typeSlowly`. Por padrão, o Darksun irá parar por 100 milissegundos entre cada pressionamento de teclas. Para personalizar a quantidade de tempo entre pressionamentos de teclas, você pode passar o número apropriado de milissegundos como o terceiro argumento do método:

```php
    $browser->typeSlowly('mobile', '+1 (202) 555-5555');

    $browser->typeSlowly('mobile', '+1 (202) 555-5555', 300);
```

Você pode usar o método 'appendSlowly' para anexar texto lentamente:

```php
    $browser->type('tags', 'foo')
            ->appendSlowly('tags', ', bar, baz');
```

<a name="dropdowns"></a>
#### Especificações

Para selecionar um valor disponível em um elemento de seleção, você pode usar o método "select". Tal como o método "type", o método "select" não requer uma seleção CSS completa. Ao passar um valor ao método "select", você deve passar o valor subjacente da opção em vez do texto de exibição:

```php
    $browser->select('size', 'Large');
```

Você pode selecionar uma opção aleatória omitindo o segundo argumento:

```php
    $browser->select('size');
```

Ao fornecer uma matriz como o segundo argumento do método `select`, você pode instruir o método a selecionar opções múltiplas:

```php
    $browser->select('categories', ['Art', 'Music']);
```

<a name="checkboxes"></a>
#### Caixas de seleção

Para "verificar" uma caixa de seleção, você pode usar o método 'check'. Como muitos outros métodos relacionados a entrada, um seletor CSS completo não é necessário. Se uma correspondência com um seletor CSS não puder ser encontrada, o Dusk irá pesquisar por uma caixa de seleção com um atributo 'name' correspondente:

```php
    $browser->check('terms');
```

O método "uncheck" pode ser usado para marcar um campo de seleção como não selecionado:

```php
    $browser->uncheck('terms');
```

<a name="radio-buttons"></a>
#### Botões de rádio

Para selecionar uma opção de "radio", você pode usar o método 'radio'. Tal como muitos outros métodos relacionados com entrada, um seletor CSS completo não é necessário. Se não encontrar uma combinação com o seletor CSS, o Dusk pesquisará por um campo de "radio" com atributos "name" e "value" correspondentes:

```php
    $browser->radio('size', 'large');
```

<a name="attaching-files"></a>
### Anexando arquivos

O método `attach` pode ser usado para anexar um arquivo a um `input` do tipo `file`. Como muitos outros métodos relacionados a entrada, um seletor CSS completo não é necessário. Se um seletor CSS correspondente não puder ser encontrado, o Dusk procurará por um `input` com atributo `name` correspondente:

```php
    $browser->attach('photo', __DIR__.'/photos/mountains.png');
```

> [!Aviso]
> A função atacha exige que a extensão "Zip" esteja instalada e habilitada no seu servidor.

<a name="pressing-buttons"></a>
### Pressando botões

O método press pode ser usado para clicar um elemento de botão na página. O argumento dado ao método press pode ser o texto de exibição do botão ou um seletor CSS / Dusk.

```php
    $browser->press('Login');
```

Ao enviar formulários, muitos aplicativos desativam o botão de envio do formulário após ser pressionado e depois reativá-lo quando a requisição HTTP para o envio do formulário estiver completa. Para pressionar um botão e esperar que ele seja reativado você pode usar o método `pressAndWaitFor`:

```php
    // Press the button and wait a maximum of 5 seconds for it to be enabled...
    $browser->pressAndWaitFor('Save');

    // Press the button and wait a maximum of 1 second for it to be enabled...
    $browser->pressAndWaitFor('Save', 1);
```

<a name="clicking-links"></a>
### Clicando em links

Para clicar um link, você pode usar o método `clickLink` na instância do navegador. O método `clickLink` irá clicar o link que tem o texto de exibição dado.

```php
    $browser->clickLink($linkText);
```

Você pode usar o método seeLink para determinar se um link com o texto de exibição dado é visível na página.

```php
    if ($browser->seeLink($linkText)) {
        // ...
    }
```

> (!ALERTA)
> Esses métodos interagem com o jquery. Se o jquery não estiver disponível na página, o dusk irá injetá-lo automaticamente para torná-lo acessível durante a duração do teste.

<a name="using-the-keyboard"></a>
### Usando o teclado

O método 'keys' permite que você forneça sequências de entrada mais complexas do que normalmente permitidas pelo método 'type'. Por exemplo, você pode instruir o Dusk a manter as teclas modificadoras enquanto os valores são inseridos. Neste exemplo, a tecla 'shift' será mantida enquanto o 'taylor' é digitado no elemento correspondente ao seletor fornecido. Após o 'taylor' ser digitado, o 'swift' será digitado sem nenhuma tecla modificadora:

```php
    $browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

Outro caso de uso valioso para o método `keys` é enviar uma combinação de "atalho do teclado" ao seletor CSS primário do seu aplicativo.

```php
    $browser->keys('.app', ['{command}', 'j']);
```

> ¡[NOTA]
> Todos os modificadores de teclas como {command} são contidos em caracteres {}. Isso corresponde a constantes definidas na classe `Facebook\WebDriver\WebDriverKeys`, que pode ser [encontrado no GitHub](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php).

<a name="fluent-keyboard-interactions"></a>
#### Interações de teclado fluidas

Além disso, o Dusk fornece um método `withKeyboard`, permitindo executar interações complexas com o teclado de maneira fluida por meio da classe `Laravel\Dusk\Keyboard`. A classe Keyboard oferece os métodos `press`, `release`, `type` e `pause`:

```php
    use Laravel\Dusk\Keyboard;

    $browser->withKeyboard(function (Keyboard $keyboard) {
        $keyboard->press('c')
            ->pause(1000)
            ->release('c')
            ->type(['c', 'e', 'o']);
    });
```

<a name="keyboard-macros"></a>
#### Teclas de atalho

Se você gostaria de definir interações de teclado personalizadas que podem ser facilmente reutilizadas em todo o seu conjunto de testes, você pode usar o método `macro` fornecido pela classe `Keyboard`. Normalmente, você deve chamar este método do método [provedor de serviço](/docs/providers) 'boot':

```php
    <?php

    namespace App\Providers;

    use Facebook\WebDriver\WebDriverKeys;
    use Illuminate\Support\ServiceProvider;
    use Laravel\Dusk\Keyboard;
    use Laravel\Dusk\OperatingSystem;

    class DuskServiceProvider extends ServiceProvider
    {
        /**
         * Register Dusk's browser macros.
         */
        public function boot(): void
        {
            Keyboard::macro('copy', function (string $element = null) {
                $this->type([
                    OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'c',
                ]);

                return $this;
            });

            Keyboard::macro('paste', function (string $element = null) {
                $this->type([
                    OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'v',
                ]);

                return $this;
            });
        }
    }
```

A função 'macro' aceita um nome como seu primeiro argumento e uma função de fechamento como segundo. A função de fechamento será executada quando a macro for chamada como método em uma instância do 'Keyboard':

```php
    $browser->click('@textarea')
        ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->copy())
        ->click('@another-textarea')
        ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->paste());
```

<a name="using-the-mouse"></a>
### Usando o Mouse

<a name="clicking-on-elements"></a>
#### Clicando em Elementos

O método 'click' pode ser usado para clicar em um elemento que corresponda ao seletor CSS ou Dusk especificado:

```php
    $browser->click('.selector');
```

O método `clickAtXPath` pode ser usado para clicar em um elemento que coincide com a expressão XPath fornecida:

```php
    $browser->clickAtXPath('//div[@class = "selector"]');
```

O método 'clickAtPoint' pode ser utilizado para clicar no elemento mais próximo de um par de coordenadas relativas à área visível do navegador.

```php
    $browser->clickAtPoint($x = 0, $y = 0);
```

O método `doubleClick` pode ser usado para simular um clique duplo do mouse:

```php
    $browser->doubleClick();

    $browser->doubleClick('.selector');
```

O método `rightClick` pode ser usado para simular um clique direito do mouse:

```php
    $browser->rightClick();

    $browser->rightClick('.selector');
```

O método `clickAndHold` pode ser usado para simular um clique com o botão do mouse e segurá-lo pressionado. Uma chamada subsequente ao método `releaseMouse` irá reverter esse comportamento e soltar o botão do mouse:

```php
    $browser->clickAndHold('.selector');

    $browser->clickAndHold()
            ->pause(1000)
            ->releaseMouse();
```

O método `controlClick` pode ser usado para simular o evento `Ctrl+Click`:

```php
    $browser->controlClick();

    $browser->controlClick('.selector');
```

<a name="mouseover"></a>
#### Mouseover

O método 'mouseover' pode ser usado quando você precisa mover o mouse sobre um elemento que corresponda ao seletor CSS ou Dusk fornecido.

```php
    $browser->mouseover('.selector');
```

<a name="drag-drop"></a>
#### Arrastar e soltar

O método `drag` pode ser usado para arrastar um elemento que corresponda ao seletor dado até outro elemento:

```php
    $browser->drag('.from-selector', '.to-selector');
```

Ou você pode arrastar um elemento em uma única direção:

```php
    $browser->dragLeft('.selector', $pixels = 10);
    $browser->dragRight('.selector', $pixels = 10);
    $browser->dragUp('.selector', $pixels = 10);
    $browser->dragDown('.selector', $pixels = 10);
```

Por fim você pode arrastar um elemento por um deslocamento específico:

```php
    $browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a name="javascript-dialogs"></a>
### Diálogos em JavaScript

O Dusk fornece vários métodos para interagir com as caixas de diálogo do JavaScript. Por exemplo, você pode usar o método waitForDialog para esperar que apareça um diálogo do JavaScript. Este método aceita um argumento opcional indicando quantos segundos esperar pelo diálogo para aparecer.

```php
    $browser->waitForDialog($seconds = null);
```

O método 'assertDialogOpened' pode ser usado para verificar que um diálogo foi exibido e contém a mensagem fornecida:

```php
    $browser->assertDialogOpened('Dialog message');
```

Se o diálogo do JavaScript contém um prompt, você pode usar o método 'typeInDialog' para digitar um valor no prompt:

```php
    $browser->typeInDialog('Hello World');
```

Para fechar uma conversa aberta em JavaScript ao clicar no botão "OK", você pode invocar o método `acceptDialog`:

```php
    $browser->acceptDialog();
```

Para fechar um diálogo aberto do Javascript clicando no botão "Cancelar", você pode invocar o método `dismissDialog`:

```php
    $browser->dismissDialog();
```

<a name="interacting-with-iframes"></a>
### Interagindo com quadros embutidos

Se você precisa interagir com elementos dentro de um iframe, você pode usar o método `withinFrame`. Toda interação com elementos que ocorre dentro do escopo fornecido para o método `withinFrame` será scoped ao contexto do iframe especificado.

```php
    $browser->withinFrame('#credit-card-details', function ($browser) {
        $browser->type('input[name="cardnumber"]', '4242424242424242')
            ->type('input[name="exp-date"]', '1224')
            ->type('input[name="cvc"]', '123')
            ->press('Pay');
    });
```

<a name="scoping-selectors"></a>
### Selecionando Variáveis

Às vezes, você pode querer fazer várias operações enquanto escopo todas as operações dentro de um seletor dado. Por exemplo, você pode querer afirmar que algum texto existe apenas dentro de uma tabela e depois clicar em um botão dentro dessa tabela. Você pode usar o método `with` para realizar isso. Todas as operações realizadas dentro do fechamento fornecido ao método `with` serão escopadas para o seletor original:

```php
    $browser->with('.table', function (Browser $table) {
        $table->assertSee('Hello World')
              ->clickLink('Delete');
    });
```

Você pode ocasionalmente precisar executar afirmações fora do escopo atual, você pode usar o método 'elsewhere' e 'elsewhereWhenAvailable' para fazer isto:

```php
     $browser->with('.table', function (Browser $table) {
        // Current scope is `body .table`...

        $browser->elsewhere('.page-title', function (Browser $title) {
            // Current scope is `body .page-title`...
            $title->assertSee('Hello World');
        });

        $browser->elsewhereWhenAvailable('.page-title', function (Browser $title) {
            // Current scope is `body .page-title`...
            $title->assertSee('Hello World');
        });
     });
```

<a name="waiting-for-elements"></a>
### Esperando Elementos

Ao testar aplicações que utilizam extensivamente o JavaScript é comum a necessidade de "esperar" por determinados elementos ou dados para prosseguir com um teste. O Dusk facilita isso. Usando uma variedade de métodos, você pode esperar até que os elementos se tornem visíveis na página ou mesmo aguardar até que uma determinada expressão JavaScript avalie como verdadeira.

<a name="waiting"></a>
#### Esperando

Se você só precisa pausar o teste por um número dado de milissegundos, use o método `pause`:

```php
    $browser->pause(1000);
```

Se você precisa pausar o teste apenas quando uma determinada condição for verdadeira, utilize o método `pauseIf`:

```php
    $browser->pauseIf(App::environment('production'), 1000);
```

Da mesma forma, se você precisar pausar o teste a menos que uma determinada condição seja verdadeira, pode usar o método `pauseUnless`:

```php
    $browser->pauseUnless(App::environment('testing'), 1000);
```

<a name="waiting-for-selectors"></a>
#### Esperando Selecionadores

O método `waitFor` pode ser usado para pausar a execução do teste até que o elemento que corresponde ao seletor CSS ou Dusk seja exibido na página. Por padrão, ele irá pausar o teste por um máximo de cinco segundos antes de lançar uma exceção. Se necessário, você pode passar um limite personalizado de tempo como segundo argumento:

```php
    // Wait a maximum of five seconds for the selector...
    $browser->waitFor('.selector');

    // Wait a maximum of one second for the selector...
    $browser->waitFor('.selector', 1);
```

Você também pode esperar até que o elemento correspondente ao seletor fornecido contenha o texto fornecido.

```php
    // Wait a maximum of five seconds for the selector to contain the given text...
    $browser->waitForTextIn('.selector', 'Hello World');

    // Wait a maximum of one second for the selector to contain the given text...
    $browser->waitForTextIn('.selector', 'Hello World', 1);
```

Você também pode esperar até que o elemento correspondente ao seletor dado não esteja mais na página:

```php
    // Wait a maximum of five seconds until the selector is missing...
    $browser->waitUntilMissing('.selector');

    // Wait a maximum of one second until the selector is missing...
    $browser->waitUntilMissing('.selector', 1);
```

ou você pode esperar até que o elemento correspondente ao seletor especificado esteja habilitado ou desabilitado:

```php
    // Wait a maximum of five seconds until the selector is enabled...
    $browser->waitUntilEnabled('.selector');

    // Wait a maximum of one second until the selector is enabled...
    $browser->waitUntilEnabled('.selector', 1);

    // Wait a maximum of five seconds until the selector is disabled...
    $browser->waitUntilDisabled('.selector');

    // Wait a maximum of one second until the selector is disabled...
    $browser->waitUntilDisabled('.selector', 1);
```

<a name="scoping-selectors-when-available"></a>
#### Se possível, selecione os escopos

Ocasionalmente, você pode querer esperar um elemento aparecer que corresponda a um seletor específico e depois interagir com esse elemento. Por exemplo, você pode querer esperar até que uma janela modal esteja disponível, e então pressione o botão “OK” dentro da janela. O método `whenAvailable` pode ser usado para realizar isso. Todas as operações de elementos realizadas dentro do fechamento especificado serão escopadas para o seletor original:

```php
    $browser->whenAvailable('.modal', function (Browser $modal) {
        $modal->assertSee('Hello World')
              ->press('OK');
    });
```

<a name="waiting-for-text"></a>
#### Esperando por texto

O método waitForText pode ser usado para esperar até que o texto fornecido seja exibido na página:

```php
    // Wait a maximum of five seconds for the text...
    $browser->waitForText('Hello World');

    // Wait a maximum of one second for the text...
    $browser->waitForText('Hello World', 1);
```

Você pode usar o método 'waitUntilMissingText' para esperar até que o texto exibido tenha sido removido da página:

```php
    // Wait a maximum of five seconds for the text to be removed...
    $browser->waitUntilMissingText('Hello World');

    // Wait a maximum of one second for the text to be removed...
    $browser->waitUntilMissingText('Hello World', 1);
```

<a name="waiting-for-links"></a>
#### Aguardando links

O método `waitForLink` pode ser usado para esperar até que o texto de um link seja exibido na página:

```php
    // Wait a maximum of five seconds for the link...
    $browser->waitForLink('Create');

    // Wait a maximum of one second for the link...
    $browser->waitForLink('Create', 1);
```

<a name="waiting-for-inputs"></a>
#### Esperando por entradas.

O método `waitForInput` pode ser utilizado para esperar até que o campo de entrada especificado esteja visível na página:

```php
    // Wait a maximum of five seconds for the input...
    $browser->waitForInput($field);

    // Wait a maximum of one second for the input...
    $browser->waitForInput($field, 1);
```

<a name="waiting-on-the-page-location"></a>
#### Esperando na Página de Localização

Ao fazer uma afirmação de caminho como `$browser->assertPathIs('/home')`, a afirmação pode falhar se o `window.location.pathname` estiver sendo atualizado de forma assíncrona. Você pode usar o método `waitForLocation` para esperar até que o local seja um determinado valor:

```php
    $browser->waitForLocation('/secret');
```

O método `waitForLocation` também pode ser usado para esperar que a localização atual da janela seja um URL totalmente qualificado.

```php
    $browser->waitForLocation('https://example.com/path');
```

Você também pode esperar por uma localização da [rotativa chamada('/docs/routing#named-routes'), mas não é obrigatório]:

```php
    $browser->waitForRoute($routeName, $parameters);
```

<a name="waiting-for-page-reloads"></a>
#### Esperando a página ser recarregada.

Se você precisa esperar uma página para carregar após realizar uma ação, use o método `waitForReload`:

```php
    use Laravel\Dusk\Browser;

    $browser->waitForReload(function (Browser $browser) {
        $browser->press('Submit');
    })
    ->assertSee('Success!');
```

Como o fato de esperar que uma página recarregue costuma ocorrer após clicar em um botão, você pode usar o método `clickAndWaitForReload` para conveniência.

```php
    $browser->clickAndWaitForReload('.selector')
            ->assertSee('something');
```

<a name="waiting-on-javascript-expressions"></a>
#### Esperando Expressões em JavaScript

Às vezes você pode desejar pausar a execução de um teste até que uma determinada expressão JavaScript seja avaliada como verdadeira. Você pode realizar isso facilmente usando o método `waitUntil`. Ao passar uma expressão para este método, você não precisa incluir a palavra-chave `return` ou um ponto final semi-colon:

```php
    // Wait a maximum of five seconds for the expression to be true...
    $browser->waitUntil('App.data.servers.length > 0');

    // Wait a maximum of one second for the expression to be true...
    $browser->waitUntil('App.data.servers.length > 0', 1);
```

<a name="waiting-on-vue-expressions"></a>
#### Aguardando Vue Expressions

O `waitUntilVue` e o `waitUntilVueIsNot` métodos podem ser usados para esperar até que um atributo de um [componente Vue](https://vuejs.org) tenha um determinado valor.

```php
    // Wait until the component attribute contains the given value...
    $browser->waitUntilVue('user.name', 'Taylor', '@user');

    // Wait until the component attribute doesn't contain the given value...
    $browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a name="waiting-for-javascript-events"></a>
#### Esperando Eventos em JavaScript

O método waitForEvent pode ser utilizado para pausar a execução de um teste até que um evento em JavaScript ocorra.

```php
    $browser->waitForEvent('load');
```

O manipulador de eventos é anexado ao escopo atual, que por padrão é o elemento "body". Quando se utiliza um seletor com escopo específico, o manipulador de eventos será anexado ao elemento correspondente.

```php
    $browser->with('iframe', function (Browser $iframe) {
        // Wait for the iframe's load event...
        $iframe->waitForEvent('load');
    });
```

Você também pode fornecer um seletor como o segundo argumento do método 'waitForEvent' para anexar o evento de escuta a um elemento específico.

```php
    $browser->waitForEvent('load', '.selector');
```

Você também pode esperar por eventos em objetos `document` e `window`:

```php
    // Wait until the document is scrolled...
    $browser->waitForEvent('scroll', 'document');

    // Wait a maximum of five seconds until the window is resized...
    $browser->waitForEvent('resize', 'window', 5);
```

<a name="waiting-with-a-callback"></a>
#### Esperando a Retribuição

Muitos dos métodos "Aguarde" no Dusk dependem do método subjacente "waitUsing". Você pode usar diretamente este método para aguardar que um determinado fechamento retorne "verdadeiro". O método "waitUsing" aceita o número máximo de segundos para aguardar, o intervalo em que a função deve ser avaliada, a função e uma mensagem opcional de erro.

```php
    $browser->waitUsing(10, 1, function () use ($something) {
        return $something->isReady();
    }, "Something wasn't ready in time.");
```

<a name="scrolling-an-element-into-view"></a>
### Rolagem de um elemento para a exibição

Às vezes você pode não conseguir clicar em um elemento porque está fora do campo de visão do navegador. O método `scrollIntoView` irá rolar a janela do navegador até que o elemento com o seletor dado esteja dentro do campo de visão.

```php
    $browser->scrollIntoView('.selector')
            ->click('.selector');
```

<a name="available-assertions"></a>
## Ações disponíveis

A escuridão fornece uma variedade de afirmações que você pode fazer contra sua aplicação. Todas as afirmações disponíveis estão documentadas na lista abaixo:

<style>
.collection-method-list > p {
colunas: 10.8em 3; -moz-colunas: 10.8em 3; -webkit-colunas: 10.8em 3;
Ela também tem medo de água e está sempre molhada.

.coleção-metodo-lista a {
display:block;
overflow:hidden;
text-overflow: ellipsis;
white-space: nowrap;
}
</style>

<div class="collection-method-list" markdown="1">

[assertTitle](#assert-title)
[assertTitleContains](#assert-title-contains-português)
[assertUrlIs]
[assertSchemeIs](#assert-scheme-is)
[assertSchemaNot](#assert-schema-not)
[assertHostIs](#assert-host-is)
[assertHostIsNot](#assert-host-is-not)
[assert-port-is]
[assertPortNão](#assert-port-não)
[assertPathBeginsWith](#assert-path-begins-with)
[assertPath EndsWith](#assert-path-ends-with)
[assertPathContains](#assert-path-contains)
[assertPathIs](#assert-path-is)
[assertPathIsNot](#assert-path-is-not)
[assertRouteIs](#assert-route-is)
[assertQueryStringHas](#assert-query-string-has)
[assertQueryStringMissing](#assert-query-string-missing)
[assertFragmentIs](#assert-fragment-is)
[assertFragmentBeginsWith](#assert-fragment-begins-with)
[assertFragmentIsNot]
[assertHasCookie](#assert-has-cookie)
[assertHasPlainCookie](#assert-has-plain-cookie)
[assertCookieMissing](#assert-cookie-missing)
[assertPlainCookieMissing](#assert-plain-cookie-missing)
[assertCookieValue](#assert-cookie-value)
[assertPlainCookieValue](#assert-plain-cookie-value)
[assertSee](#assert-see)
[assertDontSee](#assert-dont-see)
[assertSeeIn]
[assertDontSeeIn](#assert-dont-see-in)
[assert See Anything In]
[assertSeeNothingIn]
[assertScript](#assert-script)
[assertSourceHas](#assert-source-has)
[assertSourceMissing](#assert-source-missing)
[assertSeeLink](#assert-see-link)
[assertNãoVêLink](#assert-não-vé-link)
[assertInputValue](#assert-input-value)
[assertInputValueIsNot]
[assertChecked](#assert-checked)
[Não Verificado](#não-verificado-assert)
[assertIndeterminate](#assert-indeterminate)
[assertRadioSelected](#assert-radio-selected)
[assertRadioNãoSelecionado](#assert-radio-não-selecionado)
[assertar selecionado](#assertar-selecionado)
[Não Selecionado](#assert-not-selected)
[assertSelectHasOptions](#assert-select-has-options)
[assertSelectMissingOptions](#assert-select-missing-options)
[assertSelectHasOption](#assert-select-has-option)
[assertSelectMissingOption](#assert-select-missing-option)
[assertValue](#assert-value)
[assertValueIsNot]
[assertAttribute](#assert-attribute)
[assertAttributeContains](#assert-attribute-contains)
[assertAttributeDoesntContain](#assert-attribute-doesnt-contain)
[assertAriaAttribute](#assert-aria-attribute)
[assertDataAttribute](#assert-data-attribute)
[assertVisible](#assert-visible)
[assertPresente](#assert-presente)
[assertNotPresent](#assert-not-present)
[assert Missing]
[assertInputPresent](#assert-input-present)
[assertInputMissing](#assert-input-missing)
[assertDialogOpened](#assert-dialog-opened)
[assertEnabled](#assert-enabled)
[assertDisabled](#assert-disabled)
[assertarBotãoAtivo](#assertar-botão-ativo)
[assertButtonDisabled](#assert-button-disabled)
[assertFocado](#assert-focado)
[assertNotFocused](#assert-not-focused)
[assertAuthenticated](#assert-authenticated)
[assertGuest] ()
English: [assertAuthenticatedAs](#assert-authenticated-as)
[assertVue](#assert-vue)
[assert Vue não é](#assert-vue-nao-e)
[assert VueContains](#assert-vue-contains)
[assertVueNãoContém](#assert-vue-nao-contem)

</div>

<a name="assert-title"></a>
#### assertarTítulo

Afirme que o título da página corresponde ao texto fornecido:

```php
    $browser->assertTitle($title);
```

<a name="assert-title-contains"></a>
#### assertTitleContains

Afirma que o título da página contém o texto dado:

```php
    $browser->assertTitleContains($title);
```

<a name="assert-url-is"></a>
#### assertUrlIs

Afirmar que a URL atual (sem a string de consulta) corresponde à string dada:

```php
    $browser->assertUrlIs($url);
```

<a name="assert-scheme-is"></a>
#### assert Scheme Is

Afirmar que o esquema de URLs atual corresponde ao esquema dado:

```php
    $browser->assertSchemeIs($scheme);
```

<a name="assert-scheme-is-not"></a>
#### assertSchemaNot

Afirme que o esquema atual de URL não corresponde ao esquema dado:

```php
    $browser->assertSchemeIsNot($scheme);
```

<a name="assert-host-is"></a>
#### assertHostIs

Afirmar que o URL atual corresponde ao host fornecido:

```php
    $browser->assertHostIs($host);
```

<a name="assert-host-is-not"></a>
#### assertHostIsNot

Afirme que o host atual do URL não corresponde ao host dado:

```php
    $browser->assertHostIsNot($host);
```

<a name="assert-port-is"></a>
#### assertPortIs

Afirme que o atual URL corresponde ao porto fornecido:

```php
    $browser->assertPortIs($port);
```

<a name="assert-port-is-not"></a>
#### assert(portaNão)

Afirmar que a porta da URL atual não corresponde à porta dada:

```php
    $browser->assertPortIsNot($port);
```

<a name="assert-path-begins-with"></a>
#### assertPathBeginsWith

Afirmar que a URL atual começa pelo caminho fornecido:

```php
    $browser->assertPathBeginsWith('/home');
```

<a name="assert-path-ends-with"></a>
#### assertPathEndsWith

Afirme que o URL atual termina com a dada rota:

```php
    $browser->assertPathEndsWith('/home');
```

<a name="assert-path-contains"></a>
#### assertPathContains

Afirma que o caminho atual da URL contém o caminho dado:

```php
    $browser->assertPathContains('/home');
```

<a name="assert-path-is"></a>
#### assertar caminho é

Afirme que a rota atual corresponde à rota dada:

```php
    $browser->assertPathIs('/home');
```

<a name="assert-path-is-not"></a>
#### assertPathNão

Afirme que o caminho atual não coincide com o caminho dado:

```php
    $browser->assertPathIsNot('/home');
```

<a name="assert-route-is"></a>
#### assertar rota é

Afirme que a URL atual corresponde à URL dada do [nome da rota '/docs/routing#named-routes'].

```php
    $browser->assertRouteIs($name, $parameters);
```

<a name="assert-query-string-has"></a>
#### assertQueryStringHas

Afirmar que o parâmetro de string de consulta dado está presente:

```php
    $browser->assertQueryStringHas($name);
```

Afirme que o parâmetro de string de consulta dado está presente e tem um determinado valor:

```php
    $browser->assertQueryStringHas($name, $value);
```

<a name="assert-query-string-missing"></a>
#### assertQueryStringMissing

Afirme que o parâmetro de string de consulta fornecido está faltando

```php
    $browser->assertQueryStringMissing($name);
```

<a name="assert-fragment-is"></a>
#### assertFragmentIs

Afirmar que a URL atual de hash corresponde ao fragmento fornecido.

```php
    $browser->assertFragmentIs('anchor');
```

<a name="assert-fragment-begins-with"></a>
#### assertFragmentComeWith

Afirme que o fragmento de hash atual da URL começa com o fragmento dado:

```php
    $browser->assertFragmentBeginsWith('anchor');
```

<a name="assert-fragment-is-not"></a>
#### assertFragmentNão é

Afirme que o fragmento de hash atual da URL não corresponde ao fragmento dado.

```php
    $browser->assertFragmentIsNot('anchor');
```

<a name="assert-has-cookie"></a>
#### assertHasCookie

Afirme que o cookie encriptado dado está presente:

```php
    $browser->assertHasCookie($name);
```

<a name="assert-has-plain-cookie"></a>
#### assert tem um cookie simples

Afirme que o dado cookie não criptografado está presente:

```php
    $browser->assertHasPlainCookie($name);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

Afirme que o dado cookie encriptado não está presente.

```php
    $browser->assertCookieMissing($name);
```

<a name="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

Afirme que o cookie não presente é criptografado:

```php
    $browser->assertPlainCookieMissing($name);
```

<a name="assert-cookie-value"></a>
#### assertCookieValue

Afirme que um cookie criptografado tem um valor dado:

```php
    $browser->assertCookieValue($name, $value);
```

<a name="assert-plain-cookie-value"></a>
#### assertPlaineCookieValue

Asserir que um cookie não criptografado tem um valor dado:

```php
    $browser->assertPlainCookieValue($name, $value);
```

<a name="assert-see"></a>
#### afirmar

Afirme que o texto fornecido é presente na página:

```php
    $browser->assertSee($text);
```

<a name="assert-dont-see"></a>
#### assertNãoVê

Afirme que o texto dado não está na página:

```php
    $browser->assertDontSee($text);
```

<a name="assert-see-in"></a>
#### assertarVerEm

Afirme que o texto dado está presente dentro do seletor:

```php
    $browser->assertSeeIn($selector, $text);
```

<a name="assert-dont-see-in"></a>
#### AfirmarNãoVêEm

Afirme que o texto dado não está presente dentro do seletor:

```php
    $browser->assertDontSeeIn($selector, $text);
```

<a name="assert-see-anything-in"></a>
#### assertVejaQualquerCoisa

Afirme que qualquer texto está presente dentro do seletor:

```php
    $browser->assertSeeAnythingIn($selector);
```

<a name="assert-see-nothing-in"></a>
#### afirmar nada

Afirmar que não há texto dentro do seletor:

```php
    $browser->assertSeeNothingIn($selector);
```

<a name="assert-script"></a>
#### assertScript

Afirme que a expressão JavaScript dada é avaliada ao valor dado:

```php
    $browser->assertScript('window.isLoaded')
            ->assertScript('document.readyState', 'complete');
```

<a name="assert-source-has"></a>
#### assertSourceHas

Afirmar que o código-fonte dado é presente na página:

```php
    $browser->assertSourceHas($code);
```

<a name="assert-source-missing"></a>
#### assertSourceMissing

Afirme que o código fonte fornecido não está presente na página:

```php
    $browser->assertSourceMissing($code);
```

<a name="assert-see-link"></a>
#### afirmarVerLink

Afirme que o link dado está presente na página:

```php
    $browser->assertSeeLink($linkText);
```

<a name="assert-dont-see-link"></a>
#### assertNão veja o link

Afirme que o link fornecido não está presente na página:

```php
    $browser->assertDontSeeLink($linkText);
```

<a name="assert-input-value"></a>
#### assertInputValue

Afirme que o campo de entrada dado tem o valor dado.

```php
    $browser->assertInputValue($field, $value);
```

<a name="assert-input-value-is-not"></a>
#### assertInputValueIs

Afirmar que o campo de entrada não possui o valor dado:

```php
    $browser->assertInputValueIsNot($field, $value);
```

<a name="assert-checked"></a>
#### assertCheckado

Afirme que a caixa de seleção dada está marcada:

```php
    $browser->assertChecked($field);
```

<a name="assert-not-checked"></a>
#### assertar não verificado

Afirme que a caixa de seleção em questão não está marcada.

```php
    $browser->assertNotChecked($field);
```

<a name="assert-indeterminate"></a>
#### assertIndeterminate

Afirmar que a caixa de seleção fornecida está em um estado indeterminado:

```php
    $browser->assertIndeterminate($field);
```

<a name="assert-radio-selected"></a>
#### assertRadioSelecionado

Afirme que o campo de rádio dado é selecionado:

```php
    $browser->assertRadioSelected($field, $value);
```

<a name="assert-radio-not-selected"></a>
#### assertRadioNãoSelecionado

Afirme que o campo de rádio não é selecionado:

```php
    $browser->assertRadioNotSelected($field, $value);
```

<a name="assert-selected"></a>
#### assertar seleccionado

Afirme que a lista suspensa tem o valor selecionado:

```php
    $browser->assertSelected($field, $value);
```

<a name="assert-not-selected"></a>
#### assertNão selecionado

Afirme que o menu suspenso não possui o valor dado selecionado:

```php
    $browser->assertNotSelected($field, $value);
```

<a name="assert-select-has-options"></a>
#### assertSelectHasOptions

Afirmar que o dado conjunto de valores estão disponíveis para serem selecionados:

```php
    $browser->assertSelectHasOptions($field, $values);
```

<a name="assert-select-missing-options"></a>
#### assertSelecionarOpçõesFaltando

Afirme que o conjunto de valores fornecidos não são disponíveis para seleção:

```php
    $browser->assertSelectMissingOptions($field, $values);
```

<a name="assert-select-has-option"></a>
#### assertSelectHasOption

Afirmar que o valor dado é disponível para ser selecionado no campo dado.

```php
    $browser->assertSelectHasOption($field, $value);
```

<a name="assert-select-missing-option"></a>
#### afirmarSelecionarOpçãoFalta

Afirme que o valor dado não está disponível para seleção.

```php
    $browser->assertSelectMissingOption($field, $value);
```

<a name="assert-value"></a>
#### assertValue

Afirmar que o elemento que corresponde ao seletor dado tem o valor dado:

```php
    $browser->assertValue($selector, $value);
```

<a name="assert-value-is-not"></a>
#### assertValueNão é

Afirmar que o elemento correspondente ao seletor dado não tem o valor dado:

```php
    $browser->assertValueIsNot($selector, $value);
```

<a name="assert-attribute"></a>
#### assertAttribute

Afirme que o elemento combinado com o seletor fornecido tem o valor fornecido no atributo fornecido:

```php
    $browser->assertAttribute($selector, $attribute, $value);
```

<a name="assert-attribute-contains"></a>
#### assertAttributeContains

Afirme que o elemento correspondente ao seletor fornecido contém o valor fornecido no atributo fornecido:

```php
    $browser->assertAttributeContains($selector, $attribute, $value);
```

<a name="assert-attribute-doesnt-contain"></a>
#### assertAttributeNãoContém

Afirme que o elemento que corresponde ao seletor fornecido não contém o valor fornecido no atributo fornecido:

```php
    $browser->assertAttributeDoesntContain($selector, $attribute, $value);
```

<a name="assert-aria-attribute"></a>
#### assertAriaAttribute

Afirme que o elemento que corresponde ao seletor dado tenha o valor dado na atributo ARIA fornecida:

```php
    $browser->assertAriaAttribute($selector, $attribute, $value);
```

For example, given the markup `<button aria-label="Add"></button>`, you may assert against the `aria-label` attribute like so:

```php
    $browser->assertAriaAttribute('button', 'label', 'Add')
```

<a name="assert-data-attribute"></a>
#### assertDataAttribute

Afirmar que o elemento de acordo com o seletor fornecido tem o valor fornecido no atributo de dados fornecido:

```php
    $browser->assertDataAttribute($selector, $attribute, $value);
```

For example, given the markup `<tr id="row-1" data-content="attendees"></tr>`, you may assert against the `data-label` attribute like so:

```php
    $browser->assertDataAttribute('#row-1', 'content', 'attendees')
```

<a name="assert-visible"></a>
#### assertVisible

Afirmar que o elemento correspondente ao seletor dado é visível:

```php
    $browser->assertVisible($selector);
```

<a name="assert-present"></a>
#### afirmarPresente

Afirme que o elemento correspondente ao seletor fornecido está presente na origem:

```php
    $browser->assertPresent($selector);
```

<a name="assert-not-present"></a>
#### assertar não está presente

Afirmar que o elemento correspondente ao seletor dado não está presente na fonte:

```php
    $browser->assertNotPresent($selector);
```

<a name="assert-missing"></a>
#### assert Missing

Afirme que o elemento correspondente ao seletor fornecido não é visível;

```php
    $browser->assertMissing($selector);
```

<a name="assert-input-present"></a>
#### assertInputPresente

Afirme que uma entrada com o nome dado está presente:

```php
    $browser->assertInputPresent($name);
```

<a name="assert-input-missing"></a>
#### assertInputMissing

Afirme que uma entrada com o nome dado não está presente na fonte:

```php
    $browser->assertInputMissing($name);
```

<a name="assert-dialog-opened"></a>
#### assertDialog Aberto

Afirmar que um diálogo em JavaScript com a mensagem dada foi aberto:

```php
    $browser->assertDialogOpened($message);
```

<a name="assert-enabled"></a>
#### assert habilitado

Afirmar que o campo fornecido está habilitado:

```php
    $browser->assertEnabled($field);
```

<a name="assert-disabled"></a>
#### assertoDesabilitado

Afirme que o campo fornecido está desativado:

```php
    $browser->assertDisabled($field);
```

<a name="assert-button-enabled"></a>
#### assertButtonEnabled

Afirme que o botão especificado está habilitado:

```php
    $browser->assertButtonEnabled($button);
```

<a name="assert-button-disabled"></a>
#### assertButtonDisabled

Afirme que o botão fornecido está desativado:

```php
    $browser->assertButtonDisabled($button);
```

<a name="assert-focused"></a>
#### assertFocado

Afirmar que o campo em questão está focado:

```php
    $browser->assertFocused($field);
```

<a name="assert-not-focused"></a>
#### assertNotFocused

Afirme que o campo em questão não está focado:

```php
    $browser->assertNotFocused($field);
```

<a name="assert-authenticated"></a>
#### assertar autenticado

Afirmar que o usuário está autenticado

```php
    $browser->assertAuthenticated();
```

<a name="assert-guest"></a>
#### afirmar hóspede

Afirme que o usuário não está autenticado:

```php
    $browser->assertGuest();
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

Afirme que o usuário é autenticado como o usuário dado:

```php
    $browser->assertAuthenticatedAs($user);
```

<a name="assert-vue"></a>
#### assertVue

O crepúsculo te permite fazer afirmações sobre o estado de [dados de componentes Vue](https://vuejs.org). Por exemplo, imagine que seu aplicativo contém o seguinte componente Vue:

```vue
    // HTML...

    <profile dusk="profile-component"></profile>

    // Component Definition...

    Vue.component('profile', {
        template: '<div>{{ user.name }}</div>',

        data: function () {
            return {
                user: {
                    name: 'Taylor'
                }
            };
        }
    });
```

Você pode afirmar o estado do componente Vue assim:

```php tab=Pest
test('vue', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
                ->assertVue('user.name', 'Taylor', '@profile-component');
    });
});
```

```php tab=PHPUnit
/**
 * A basic Vue test example.
 */
public function test_vue(): void
{
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
                ->assertVue('user.name', 'Taylor', '@profile-component');
    });
}
```

<a name="assert-vue-is-not"></a>
#### assert! que não é vue

Afirmar que uma propriedade de dados do componente Vue não corresponde ao valor dado:

```php
    $browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a name="assert-vue-contains"></a>
#### assertVueContains

Afirme que uma propriedade de dados do componente Vue é um array e contém o valor dado:

```php
    $browser->assertVueContains($property, $value, $componentSelector = null);
```

<a name="assert-vue-doesnt-contain"></a>
#### assert que a variável não contém um determinado valor

Afirmar que uma propriedade de dados do componente Vue é um array e não contém o valor dado.

```php
    $browser->assertVueDoesntContain($property, $value, $componentSelector = null);
```

<a name="pages"></a>
## Páginas

Às vezes, os testes exigem várias ações complicadas para serem executadas em sequência. Isso pode tornar seus testes mais difíceis de ler e entender. Páginas do crepúsculo permitem que você defina ações expressivas que podem ser então executadas em uma página específica por meio de um único método. As páginas também permitem que você defina atalhos comuns para seletores para seu aplicativo ou para uma única página.

<a name="generating-pages"></a>
### Geração de páginas

Para gerar um objeto de página, execute o comando 'dusk:page' do Artisan. Todos os objetos de página serão colocados no diretório da sua aplicação 'tests/Browser/Pages':

```php
    php artisan dusk:page Login
```

<a name="configuring-pages"></a>
### Configuração de Páginas

Por padrão, as páginas possuem três métodos: 'url', 'assert' e 'elements'. Discutiremos os métodos 'url' e 'assert' agora. O método 'elements' será [discutido em mais detalhes abaixo](#seleção-de-corta-e-pasta)).

<a name="the-url-method"></a>
#### O método 'url'

O método `url` deve retornar a url que representa o caminho da página. O Dusk usará esta URL quando navegar até a página no navegador:

```php
    /**
     * Get the URL for the page.
     */
    public function url(): string
    {
        return '/login';
    }
```

<a name="the-assert-method"></a>
#### O método `assert`

O método "assert" pode fazer qualquer tipo de afirmação que seja necessário para verificar se o navegador realmente está na página dada. Não é realmente necessário colocar nada dentro desse método; no entanto, você pode fazer essas afirmações se desejar. Essas afirmações serão executadas automaticamente quando navegar até a página:

```php
    /**
     * Assert that the browser is on the page.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertPathIs($this->url());
    }
```

<a name="navigating-to-pages"></a>
### Navegação para Páginas

Uma vez que uma página tenha sido definida, você pode navegar para ela usando o método visit:

```php
    use Tests\Browser\Pages\Login;

    $browser->visit(new Login);
```

Às vezes, você pode já estar na página e precisar carregar os seletores e métodos da página no contexto do teste atual. Isso é comum quando se pressiona um botão e é redirecionado para uma página sem navegar explicitamente até ela. Em tal situação, você pode usar o método 'on' para carregar a página:

```php
    use Tests\Browser\Pages\CreatePlaylist;

    $browser->visit('/dashboard')
            ->clickLink('Create Playlist')
            ->on(new CreatePlaylist)
            ->assertSee('@create');
```

<a name="shorthand-selectors"></a>
### Selecionadores abreviados

A classe de página possui um método chamado 'elementos', que permite que você defina atalhos rápidos e fáceis de lembrar para qualquer seletor CSS em sua página. Por exemplo, vamos definir um atalho para o campo "email" do formulário de login da aplicação:

```php
    /**
     * Get the element shortcuts for the page.
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@email' => 'input[name=email]',
        ];
    }
```

Uma vez que o atalho tenha sido definido, você pode usar o seletor de abreviação em qualquer lugar onde normalmente usaria um seletor completo CSS:

```php
    $browser->type('@email', 'taylor@laravel.com');
```

<a name="global-shorthand-selectors"></a>
#### Seletores abreviados globais

Depois da instalação do Dusk, uma classe base 'Page' será colocada em seu diretório de testes/navegador/páginas. Esta classe contém um método siteElements que pode ser usado para definir seletores abreviados globais que devem estar disponíveis em todas as páginas de sua aplicação:

```php
    /**
     * Get the global element shortcuts for the site.
     *
     * @return array<string, string>
     */
    public static function siteElements(): array
    {
        return [
            '@element' => '#selector',
        ];
    }
```

<a name="page-methods"></a>
### Métodos da Página

Além dos métodos padrão definidos em páginas, você pode definir outros métodos que podem ser usados durante todos os testes. Por exemplo, vamos imaginar que estamos construindo um aplicativo de gerenciamento de música. Uma ação comum para uma página do aplicativo talvez seja criar uma playlist. Em vez de reescrever a lógica para criar uma lista de reprodução em cada teste, você pode definir um método `createPlaylist` na classe da página:

```php
    <?php

    namespace Tests\Browser\Pages;

    use Laravel\Dusk\Browser;
    use Laravel\Dusk\Page;

    class Dashboard extends Page
    {
        // Other page methods...

        /**
         * Create a new playlist.
         */
        public function createPlaylist(Browser $browser, string $name): void
        {
            $browser->type('name', $name)
                    ->check('share')
                    ->press('Create Playlist');
        }
    }
```

Uma vez que o método tenha sido definido você pode utilizá-lo em qualquer teste que utilize a página. A instância do navegador será automaticamente passada como o primeiro argumento para os métodos personalizados da página:

```php
    use Tests\Browser\Pages\Dashboard;

    $browser->visit(new Dashboard)
            ->createPlaylist('My Playlist')
            ->assertSee('My Playlist');
```

<a name="components"></a>
## Componentes

Componentes são similares aos "objetos de página" do Dusk, mas são destinados para partes da interface de usuário e funcionalidades que são reutilizadas através do seu aplicativo, como uma barra de navegação ou janela de notificação. Desta forma, os componentes não estão ligados a URLs específicas.

<a name="generating-components"></a>
### Componentes de Geração

Para gerar um componente, execute o comando artisan dusk:component. Novos componentes são colocados na pasta "tests/Browser/Components":

```php
    php artisan dusk:component DatePicker
```

Como mostrado acima, um "selecionador de datas" é um exemplo de um componente que pode existir em todo seu aplicativo em várias páginas. Pode se tornar um fardo escrever manualmente a lógica de automação do navegador para selecionar uma data em dezenas de testes em sua suíte de testes. Em vez disso, podemos definir um componente Dusk para representar o seletor de datas, permitindo-nos encapsular essa lógica dentro do componente:

```php
    <?php

    namespace Tests\Browser\Components;

    use Laravel\Dusk\Browser;
    use Laravel\Dusk\Component as BaseComponent;

    class DatePicker extends BaseComponent
    {
        /**
         * Get the root selector for the component.
         */
        public function selector(): string
        {
            return '.date-picker';
        }

        /**
         * Assert that the browser page contains the component.
         */
        public function assert(Browser $browser): void
        {
            $browser->assertVisible($this->selector());
        }

        /**
         * Get the element shortcuts for the component.
         *
         * @return array<string, string>
         */
        public function elements(): array
        {
            return [
                '@date-field' => 'input.datepicker-input',
                '@year-list' => 'div > div.datepicker-years',
                '@month-list' => 'div > div.datepicker-months',
                '@day-list' => 'div > div.datepicker-days',
            ];
        }

        /**
         * Select the given date.
         */
        public function selectDate(Browser $browser, int $year, int $month, int $day): void
        {
            $browser->click('@date-field')
                    ->within('@year-list', function (Browser $browser) use ($year) {
                        $browser->click($year);
                    })
                    ->within('@month-list', function (Browser $browser) use ($month) {
                        $browser->click($month);
                    })
                    ->within('@day-list', function (Browser $browser) use ($day) {
                        $browser->click($day);
                    });
        }
    }
```

<a name="using-components"></a>
### Usando Componentes

Uma vez que o componente tenha sido definido, podemos selecionar facilmente uma data no seletor de datas de qualquer teste. E se a lógica necessária para selecionar uma data mudar, precisamos apenas atualizar o componente:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\DatePicker;

uses(DatabaseMigrations::class);

test('basic example', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
                ->within(new DatePicker, function (Browser $browser) {
                    $browser->selectDate(2019, 1, 30);
                })
                ->assertSee('January');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\DatePicker;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    /**
     * A basic component test example.
     */
    public function test_basic_example(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/')
                    ->within(new DatePicker, function (Browser $browser) {
                        $browser->selectDate(2019, 1, 30);
                    })
                    ->assertSee('January');
        });
    }
}
```

<a name="continuous-integration"></a>
## Integração Contínua

> [!ALERTA]
> A maioria das configurações de integração contínua espera que sua aplicação Laravel seja servida usando o servidor PHP interno nas portas 8000, portanto antes de continuar, você deve garantir que seu ambiente de integração contínua tem uma variável de ambiente APP_URL com um valor de http://127.0.0.1:8000

<a name="running-tests-on-heroku-ci"></a>
### Heroku CI

Para executar testes do Dusk em [Heroku CI](https://www.heroku.com/continuous-integration/), adicione a seguinte buildpack do Google Chrome e scripts ao arquivo "app.json" do Heroku:

```json
    {
      "environments": {
        "test": {
          "buildpacks": [
            { "url": "heroku/php" },
            { "url": "https://github.com/heroku/heroku-buildpack-google-chrome" }
          ],
          "scripts": {
            "test-setup": "cp .env.testing .env",
            "test": "nohup bash -c './vendor/laravel/dusk/bin/chromedriver-linux > /dev/null 2>&1 &' && nohup bash -c 'php artisan serve --no-reload > /dev/null 2>&1 &' && php artisan dusk"
          }
        }
      }
    }
```

<a name="running-tests-on-travis-ci"></a>
### Travis CI

Para executar seus testes Dusk no [Travis CI](https://travis-ci.org), use a configuração de `.travis.yml` abaixo. Como o Travis CI não é um ambiente gráfico, precisaremos dar alguns passos extras para abrir o navegador Chrome. Além disso, usaremos `php artisan serve` para abrir o servidor web padrão do PHP:

```yaml
language: php

php:
  - 7.3

addons:
  chrome: stable

install:
  - cp .env.testing .env
  - travis_retry composer install --no-interaction --prefer-dist
  - php artisan key:generate
  - php artisan dusk:chrome-driver

before_script:
  - google-chrome-stable --headless --disable-gpu --remote-debugging-port=9222 http://localhost &
  - php artisan serve --no-reload &

script:
  - php artisan dusk
```

<a name="running-tests-on-github-actions"></a>
### Ações do GitHub

Se você está usando [GitHub Actions](https://github.com/features/actions) para executar os testes do Dusk, você pode usar o seguinte arquivo de configuração como ponto de partida. Como o TravisCI, vamos usar o comando `php artisan serve` para iniciar o servidor web integrado PHP:

```yaml
name: CI
on: [push]
jobs:

  dusk-php:
    runs-on: ubuntu-latest
    env:
      APP_URL: "http://127.0.0.1:8000"
      DB_USERNAME: root
      DB_PASSWORD: root
      MAIL_MAILER: log
    steps:
      - uses: actions/checkout@v4
      - name: Prepare The Environment
        run: cp .env.example .env
      - name: Create Database
        run: |
          sudo systemctl start mysql
          mysql --user="root" --password="root" -e "CREATE DATABASE \`my-database\` character set UTF8mb4 collate utf8mb4_bin;"
      - name: Install Composer Dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader
      - name: Generate Application Key
        run: php artisan key:generate
      - name: Upgrade Chrome Driver
        run: php artisan dusk:chrome-driver --detect
      - name: Start Chrome Driver
        run: ./vendor/laravel/dusk/bin/chromedriver-linux &
      - name: Run Laravel Server
        run: php artisan serve --no-reload &
      - name: Run Dusk Tests
        run: php artisan dusk
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: tests/Browser/screenshots
      - name: Upload Console Logs
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: console
          path: tests/Browser/console
```

<a name="running-tests-on-chipper-ci"></a>
### Chipper CI

Se você estiver usando [Chipper CI](https://chipperci.com) para executar seus testes do Dusk, você pode usar o seguinte arquivo de configuração como um ponto de partida. Nós usaremos o servidor PHP embutido para executar o Laravel para que possamos escutar as requisições:

```yaml
# file .chipperci.yml
version: 1

environment:
  php: 8.2
  node: 16

# Include Chrome in the build environment
services:
  - dusk

# Build all commits
on:
   push:
      branches: .*

pipeline:
  - name: Setup
    cmd: |
      cp -v .env.example .env
      composer install --no-interaction --prefer-dist --optimize-autoloader
      php artisan key:generate

      # Create a dusk env file, ensuring APP_URL uses BUILD_HOST
      cp -v .env .env.dusk.ci
      sed -i "s@APP_URL=.*@APP_URL=http://$BUILD_HOST:8000@g" .env.dusk.ci

  - name: Compile Assets
    cmd: |
      npm ci --no-audit
      npm run build

  - name: Browser Tests
    cmd: |
      php -S [::0]:8000 -t public 2>server.log &
      sleep 2
      php artisan dusk:chrome-driver $CHROME_DRIVER
      php artisan dusk --env=ci
```

Para aprender mais sobre testes do Dusk no Chipper CI, incluindo como usar bancos de dados, consulte a documentação oficial do Chipper CI (https://chipperci.com/docs/testing/laravel-dusk-new).
