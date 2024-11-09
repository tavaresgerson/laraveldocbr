# Laravel Dusk

<a name="introduction"></a>
## Introdução

[Laravel Dusk](https://github.com/laravel/dusk) fornece uma API de automação e teste de navegador expressiva e fácil de usar. Por padrão, o Dusk não exige que você instale o JDK ou o Selenium no seu computador local. Em vez disso, o Dusk usa uma instalação autônoma [ChromeDriver](https://sites.google.com/chromium.org/driver). No entanto, você é livre para utilizar qualquer outro driver compatível com Selenium que desejar.

<a name="installation"></a>
## Instalação

Para começar, você deve instalar o [Google Chrome](https://www.google.com/chrome) e adicionar a dependência do Composer `laravel/dusk` ao seu projeto:

```shell
composer require laravel/dusk --dev
```

::: warning AVISO
Se você estiver registrando manualmente o provedor de serviços do Dusk, você **nunca** deve registrá-lo em seu ambiente de produção, pois isso pode levar usuários arbitrários a conseguirem autenticar com seu aplicativo.
:::

Após instalar o pacote Dusk, execute o comando Artisan `dusk:install`. O comando `dusk:install` criará um diretório `tests/Browser`, um teste Dusk de exemplo e instalará o binário do Chrome Driver para seu sistema operacional:

```shell
php artisan dusk:install
```

Em seguida, defina a variável de ambiente `APP_URL` no arquivo `.env` do seu aplicativo. Este valor deve corresponder à URL que você usa para acessar seu aplicativo em um navegador.

::: info NOTA
Se você estiver usando [Laravel Sail](/docs/sail) para gerenciar seu ambiente de desenvolvimento local, consulte também a documentação do Sail sobre [configuração e execução de testes Dusk](/docs/sail#laravel-dusk).
:::

<a name="managing-chromedriver-installations"></a>
### Gerenciando instalações do ChromeDriver

Se você quiser instalar uma versão diferente do ChromeDriver do que a instalada pelo Laravel Dusk por meio do comando `dusk:install`, você pode usar o comando `dusk:chrome-driver`:

```shell
# Instale a versão mais recente do ChromeDriver para seu sistema operacional...
php artisan dusk:chrome-driver

# Instale uma determinada versão do ChromeDriver para seu sistema operacional...
php artisan dusk:chrome-driver 86

# Instalar uma determinada versão do ChromeDriver para todos os sistemas operacionais suportados...
php artisan dusk:chrome-driver --all

# Instale a versão do ChromeDriver que corresponde à versão detectada do Chrome/Chromium para seu sistema operacional...
php artisan dusk:chrome-driver --detect
```

::: warning AVISO
O Dusk requer que os binários `chromedriver` sejam executáveis. Se você estiver tendo problemas para executar o Dusk, você deve garantir que os binários sejam executáveis ​​usando o seguinte comando: `chmod -R 0755 vendor/laravel/dusk/bin/`.
:::

<a name="using-other-browsers"></a>
### Usando outros navegadores

Por padrão, o Dusk usa o Google Chrome e uma instalação autônoma [ChromeDriver](https://sites.google.com/chromium.org/driver) para executar seus testes de navegador. No entanto, você pode iniciar seu próprio servidor Selenium e executar seus testes em qualquer navegador que desejar.

Para começar, abra seu arquivo `tests/DuskTestCase.php`, que é o caso de teste base do Dusk para seu aplicativo. Dentro deste arquivo, você pode remover a chamada para o método `startChromeDriver`. Isso impedirá que o Dusk inicie automaticamente o ChromeDriver:

```php
    /**
     * Prepare-se para a execução do teste Dusk.
     *
     * @beforeClass
     */
    public static function prepare(): void
    {
        // static::startChromeDriver();
    }
```

Em seguida, você pode modificar o método `driver` para conectar-se à URL e porta de sua escolha. Além disso, você pode modificar os "recursos desejados" que devem ser passados ​​para o WebDriver:

```php
    use Facebook\WebDriver\Remote\RemoteWebDriver;

    /**
     * Crie a instância RemoteWebDriver.
     */
    protected function driver(): RemoteWebDriver
    {
        return RemoteWebDriver::create(
            'http://localhost:4444/wd/hub', DesiredCapabilities::phantomjs()
        );
    }
```

<a name="getting-started"></a>
## Começando

<a name="generating-tests"></a>
### Gerando testes

Para gerar um teste Dusk, use o comando Artisan `dusk:make`. O teste gerado será colocado no diretório `tests/Browser`:

```shell
php artisan dusk:make LoginTest
```

<a name="resetting-the-database-after-each-test"></a>
### Redefinindo o banco de dados após cada teste

A maioria dos testes que você escreve interagirá com páginas que recuperam dados do banco de dados do seu aplicativo; no entanto, seus testes Dusk nunca devem usar o trait `RefreshDatabase`. O trait `RefreshDatabase` aproveita as transações do banco de dados que não serão aplicáveis ​​ou disponíveis em solicitações HTTP. Em vez disso, você tem duas opções: o trait `DatabaseMigrations` e o trait `DatabaseTruncation`.

<a name="reset-migrations"></a>
#### Usando migrações de banco de dados

O trait `DatabaseMigrations` executará suas migrações de banco de dados antes de cada teste. No entanto, remover e recriar suas tabelas de banco de dados para cada teste é normalmente mais lento do que truncar as tabelas:

::: code-group
```php [Pest]
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;

uses(DatabaseMigrations::class);

//
```

```php [PHPUnit]
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
:::

::: warning AVISO
Bancos de dados SQLite na memória não podem ser usados ​​ao executar testes Dusk. Como o navegador é executado dentro de seu próprio processo, ele não poderá acessar os bancos de dados na memória de outros processos.
:::

<a name="reset-truncation"></a>
#### Usando truncamento de banco de dados

O trait `DatabaseTruncation` migrará seu banco de dados no primeiro teste para garantir que suas tabelas de banco de dados tenham sido criadas corretamente. No entanto, em testes subsequentes, as tabelas do banco de dados serão simplesmente truncadas - proporcionando um aumento de velocidade em relação à reexecução de todas as migrações do seu banco de dados:

::: code-group
```php [Pest]
<?php

use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;

uses(DatabaseTruncation::class);

//
```

```php [PHPUnit]
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
:::

Por padrão, essa característica truncará todas as tabelas, exceto a tabela `migrations`. Se você quiser personalizar as tabelas que devem ser truncadas, você pode definir uma propriedade `$tablesToTruncate` na sua classe de teste:

::: info NOTA
Se você estiver usando o Pest, você deve definir propriedades ou métodos na classe base `DuskTestCase` ou em qualquer classe que seu arquivo de teste estenda.
:::

```php
    /**
     * Indica quais tabelas devem ser truncadas.
     *
     * @var array
     */
    protected $tablesToTruncate = ['users'];
```

Alternativamente, você pode definir uma propriedade `$exceptTables` na sua classe de teste para especificar quais tabelas devem ser excluídas do truncamento:

```php
    /**
     * Indica quais tabelas devem ser excluídas do truncamento.
     *
     * @var array
     */
    protected $exceptTables = ['users'];
```

Para especificar as conexões de banco de dados que devem ter suas tabelas truncadas, você pode definir uma propriedade `$connectionsToTruncate` na sua classe de teste:

```php
    /**
     * Indica quais conexões devem ter suas tabelas truncadas.
     *
     * @var array
     */
    protected $connectionsToTruncate = ['mysql'];
```

Se você quiser executar o código antes ou depois do truncamento do banco de dados ser realizado, você pode definir os métodos `beforeTruncatingDatabase` ou `afterTruncatingDatabase` na sua classe de teste:

```php
    /**
     * Execute qualquer trabalho que deva ser feito antes que o banco de dados comece a truncar.
     */
    protected function beforeTruncatingDatabase(): void
    {
        //
    }

    /**
     * Execute qualquer trabalho que deva ser feito depois que o banco de dados terminar de truncar.
     */
    protected function afterTruncatingDatabase(): void
    {
        //
    }
```

<a name="running-tests"></a>
### Executando testes

Para executar os testes do seu navegador, execute o comando Artisan `dusk`:

```shell
php artisan dusk
```

Se você teve falhas de teste na última vez que executou o comando `dusk`, você pode economizar tempo executando novamente os testes com falha primeiro usando o comando `dusk:fails`:

```shell
php artisan dusk:fails
```

O comando `dusk` aceita qualquer argumento que seja normalmente aceito pelo executor de teste Pest / PHPUnit, como permitir que você execute apenas os testes para um determinado [grupo](https://docs.phpunit.de/en/10.5/annotations.html#group):

```shell
php artisan dusk --group=foo
```

::: info NOTA
Se você estiver usando [Laravel Sail](/docs/sail) para gerenciar seu ambiente de desenvolvimento local, consulte a documentação do Sail sobre [configuração e execução de testes Dusk](/docs/sail#laravel-dusk).
:::

<a name="manually-starting-chromedriver"></a>
#### Iniciando manualmente o ChromeDriver

Por padrão, o Dusk tentará iniciar o ChromeDriver automaticamente. Se isso não funcionar para seu sistema específico, você pode iniciar o ChromeDriver manualmente antes de executar o comando `dusk`. Se você escolher iniciar o ChromeDriver manualmente, você deve comentar a seguinte linha do seu arquivo `tests/DuskTestCase.php`:

```php
    /**
     * Prepare-se para a execução do teste Dusk.
     *
     * @beforeClass
     */
    public static function prepare(): void
    {
        // static::startChromeDriver();
    }
```

Além disso, se você iniciar o ChromeDriver em uma porta diferente de 9515, você deve modificar o método `driver` da mesma classe para refletir a porta correta:

```php
    use Facebook\WebDriver\Remote\RemoteWebDriver;

    /**
     * Crie a instância RemoteWebDriver.
     */
    protected function driver(): RemoteWebDriver
    {
        return RemoteWebDriver::create(
            'http://localhost:9515', DesiredCapabilities::chrome()
        );
    }
```

<a name="environment-handling"></a>
### Manipulação de ambiente

Para forçar o Dusk a usar seu próprio arquivo de ambiente ao executar testes, crie um arquivo `.env.dusk.{environment}` na raiz do seu projeto. Por exemplo, se você for iniciar o comando `dusk` do seu ambiente `local`, você deve criar um arquivo `.env.dusk.local`.

Ao executar testes, o Dusk fará backup do seu arquivo `.env` e renomeará seu ambiente Dusk para `.env`. Após a conclusão dos testes, seu arquivo `.env` será restaurado.

<a name="browser-basics"></a>
## Noções básicas do navegador

<a name="creating-browsers"></a>
### Criando navegadores

Para começar, vamos escrever um teste que verifica se podemos fazer login em nosso aplicativo. Após gerar um teste, podemos modificá-lo para navegar até a página de login, inserir algumas credenciais e clicar no botão "Login". Para criar uma instância do navegador, você pode chamar o método `browse` de dentro do seu teste Dusk:

::: code-group
```php [Pest]
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

```php [PHPUnit]
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
     * Um exemplo básico de teste de navegador.
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
:::

Como você pode ver no exemplo acima, o método `browse` aceita um fechamento. Uma instância do navegador será automaticamente passada para esse fechamento pelo Dusk e é o objeto principal usado para interagir e fazer afirmações contra seu aplicativo.

<a name="creating-multiple-browsers"></a>
#### Criando vários navegadores

Às vezes, você pode precisar de vários navegadores para executar um teste corretamente. Por exemplo, vários navegadores podem ser necessários para testar uma tela de bate-papo que interage com websockets. Para criar vários navegadores, basta adicionar mais argumentos do navegador à assinatura do fechamento fornecido ao método `browse`:

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

O método `visit` pode ser usado para navegar para um URI fornecido dentro do seu aplicativo:

```php
    $browser->visit('/login');
```

Você pode usar o método `visitRoute` para navegar para uma [rota nomeada](/docs/routing#named-routes):

```php
    $browser->visitRoute('login');
```

Você pode navegar "para trás" e "para frente" usando os métodos `back` e `forward`:

```php
    $browser->back();

    $browser->forward();
```

Você pode usar o método `refresh` para atualizar a página:

```php
    $browser->refresh();
```

<a name="resizing-browser-windows"></a>
### Redimensionando janelas do navegador

Você pode usar o método `resize` para ajustar o tamanho da janela do navegador:

```php
    $browser->resize(1920, 1080);
```

O método `maximize` pode ser usado para maximizar a janela do navegador:

```php
    $browser->maximize();
```

O método `fitContent` redimensionará a janela do navegador para corresponder ao tamanho do seu conteúdo:

```php
    $browser->fitContent();
```

Quando um teste falha, o Dusk redimensiona automaticamente o navegador para ajustar o conteúdo antes de tirar uma captura de tela. Você pode desabilitar esse recurso chamando o método `disableFitOnFailure` dentro do seu teste:

```php
    $browser->disableFitOnFailure();
```

Você pode usar o método `move` para mover a janela do navegador para uma posição diferente na tela:

```php
    $browser->move($x = 100, $y = 100);
```

<a name="browser-macros"></a>
### Macros do navegador

Se você quiser definir um método de navegador personalizado que possa ser reutilizado em uma variedade de seus testes, você pode usar o método `macro` na classe `Browser`. Normalmente, você deve chamar esse método do método `boot` de um [provedor de serviços](/docs/providers):

```php
    <?php

    namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Laravel\Dusk\Browser;

    class DuskServiceProvider extends ServiceProvider
    {
        /**
         * Registre as macros do navegador do Dusk.
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

A função `macro` aceita um nome como seu primeiro argumento e um fechamento como seu segundo. O fechamento da macro será executado ao chamar a macro como um método em uma instância `Browser`:

```php
    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit('/pay')
                ->scrollToElement('#credit-card-details')
                ->assertSee('Enter Credit Card Details');
    });
```

<a name="authentication"></a>
### Autenticação

Frequentemente, você testará páginas que exigem autenticação. Você pode usar o método `loginAs` do Dusk para evitar interagir com a tela de login do seu aplicativo durante cada teste. O método `loginAs` aceita uma chave primária associada ao seu modelo autenticável ou a uma instância de modelo autenticável:

```php
    use App\Models\User;
    use Laravel\Dusk\Browser;

    $this->browse(function (Browser $browser) {
        $browser->loginAs(User::find(1))
              ->visit('/home');
    });
```

::: warning AVISO
Após usar o método `loginAs`, a sessão do usuário será mantida para todos os testes dentro do arquivo.
:::

<a name="cookies"></a>
### Cookies

Você pode usar o método `cookie` para obter ou definir o valor de um cookie criptografado. Por padrão, todos os cookies criados pelo Laravel são criptografados:

```php
    $browser->cookie('name');

    $browser->cookie('name', 'Taylor');
```

Você pode usar o método `plainCookie` para obter ou definir o valor de um cookie não criptografado:

```php
    $browser->plainCookie('name');

    $browser->plainCookie('name', 'Taylor');
```

Você pode usar o método `deleteCookie` para excluir o cookie fornecido:

```php
    $browser->deleteCookie('name');
```

<a name="executing-javascript"></a>
### Executando JavaScript

Você pode usar o método `script` para executar instruções JavaScript arbitrárias dentro do navegador:

```php
    $browser->script('document.documentElement.scrollTop = 0');

    $browser->script([
        'document.body.scrollTop = 0',
        'document.documentElement.scrollTop = 0',
    ]);

    $output = $browser->script('return window.location.pathname');
```

<a name="taking-a-screenshot"></a>
### Tirando uma captura de tela

Você pode usar o método `screenshot` para tirar uma captura de tela e armazená-la com o nome de arquivo fornecido. Todas as capturas de tela serão armazenadas no diretório `tests/Browser/screenshots`:

```php
    $browser->screenshot('filename');
```

O método `responsiveScreenshots` pode ser usado para tirar uma série de capturas de tela em vários pontos de interrupção:

```php
    $browser->responsiveScreenshots('filename');
```

O método `screenshotElement` pode ser usado para tirar uma captura de tela de um elemento específico na página:

```php
    $browser->screenshotElement('#selector', 'filename');
```

<a name="storing-console-output-to-disk"></a>
### Armazenando a saída do console no disco

Você pode usar o método `storeConsoleLog` para gravar a saída do console do navegador atual no disco com o nome de arquivo fornecido. A saída do console será armazenada no diretório `tests/Browser/console`:

```php
    $browser->storeConsoleLog('filename');
```

<a name="storing-page-source-to-disk"></a>
### Armazenando o código-fonte da página no disco

Você pode usar o método `storeSource` para gravar o código-fonte da página atual no disco com o nome de arquivo fornecido. O código-fonte da página será armazenado no diretório `tests/Browser/source`:

```php
    $browser->storeSource('filename');
```

<a name="interacting-with-elements"></a>
## Interagindo com elementos

<a name="dusk-selectors"></a>
### Seletores Dusk

Escolher bons seletores CSS para interagir com elementos é uma das partes mais difíceis de escrever testes Dusk. Com o tempo, mudanças no frontend podem fazer com que seletores CSS como os seguintes quebrem seus testes:

```php
    // HTML...

    <button>Login</button>

    // Teste...

    $browser->click('.login-page .container div > button');
```

Os seletores Dusk permitem que você se concentre em escrever testes eficazes em vez de lembrar dos seletores CSS. Para definir um seletor, adicione um atributo `dusk` ao seu elemento HTML. Então, ao interagir com um navegador Dusk, prefixe o seletor com `@` para manipular o elemento anexado dentro do seu teste:

```php
    // HTML...

    <button dusk="login-button">Login</button>

    // Teste...

    $browser->click('@login-button');
```

Se desejar, você pode personalizar o atributo HTML que o seletor Dusk utiliza por meio do método `selectorHtmlAttribute`. Normalmente, esse método deve ser chamado do método `boot` do `AppServiceProvider` do seu aplicativo:

```php
    use Laravel\Dusk\Dusk;

    Dusk::selectorHtmlAttribute('data-dusk');
```

<a name="text-values-and-attributes"></a>
### Texto, valores e atributos

<a name="retrieving-setting-values"></a>
#### Recuperando e definindo valores

O Dusk fornece vários métodos para interagir com o valor atual, texto de exibição e atributos de elementos na página. Por exemplo, para obter o "valor" de um elemento que corresponde a um determinado seletor CSS ou Dusk, use o método `value`:

```php
    // Retrieve the value...
    $value = $browser->value('selector');

    // Set the value...
    $browser->value('selector', 'value');
```

Você pode usar o método `inputValue` para obter o "valor" de um elemento de entrada que tem um determinado nome de campo:

```php
    $value = $browser->inputValue('field');
```

<a name="retrieving-text"></a>
#### Recuperando texto

O método `text` pode ser usado para recuperar o texto de exibição de um elemento que corresponde ao seletor fornecido:

```php
    $text = $browser->text('selector');
```

<a name="retrieving-attributes"></a>
#### Recuperando atributos

Finalmente, o método `attribute` pode ser usado para recuperar o valor de um atributo de um elemento que corresponde ao seletor fornecido:

```php
    $attribute = $browser->attribute('selector', 'value');
```

<a name="interacting-with-forms"></a>
### Interagindo com formulários

<a name="typing-values"></a>
#### Digitando valores

O Dusk fornece uma variedade de métodos para interagir com formulários e elementos de entrada. Primeiro, vamos dar uma olhada em um exemplo de digitação de texto em um campo de entrada:

```php
    $browser->type('email', 'taylor@laravel.com');
```

Observe que, embora o método aceite um se necessário, não somos obrigados a passar um seletor CSS para o método `type`. Se um seletor CSS não for fornecido, o Dusk pesquisará um campo `input` ou `textarea` com o atributo `name` fornecido.

Para anexar texto a um campo sem limpar seu conteúdo, você pode usar o método `append`:

```php
    $browser->type('tags', 'foo')
            ->append('tags', ', bar, baz');
```

Você pode limpar o valor de uma entrada usando o método `clear`:

```php
    $browser->clear('email');
```

Você pode instruir o Dusk a digitar lentamente usando o método `typeSlowly`. Por padrão, o Dusk pausará por 100 milissegundos entre os pressionamentos de tecla. Para personalizar a quantidade de tempo entre os pressionamentos de tecla, você pode passar o número apropriado de milissegundos como o terceiro argumento para o método:

```php
    $browser->typeSlowly('mobile', '+1 (202) 555-5555');

    $browser->typeSlowly('mobile', '+1 (202) 555-5555', 300);
```

Você pode usar o método `appendSlowly` para anexar texto lentamente:

```php
    $browser->type('tags', 'foo')
            ->appendSlowly('tags', ', bar, baz');
```

<a name="dropdowns"></a>
#### Dropdowns

Para selecionar um valor disponível em um elemento `select`, você pode usar o método `select`. Assim como o método `type`, o método `select` não requer um seletor CSS completo. Ao passar um valor para o método `select`, você deve passar o valor da opção subjacente em vez do texto de exibição:

```php
    $browser->select('size', 'Large');
```

Você pode selecionar uma opção aleatória omitindo o segundo argumento:

```php
    $browser->select('size');
```

Ao fornecer uma matriz como o segundo argumento para o método `select`, você pode instruir o método a selecionar várias opções:

```php
    $browser->select('categories', ['Art', 'Music']);
```

<a name="checkboxes"></a>
#### Caixas de seleção

Para "marcar" uma entrada de caixa de seleção, você pode usar o método `check`. Como muitos outros métodos relacionados a entrada, um seletor CSS completo não é necessário. Se uma correspondência de seletor CSS não puder ser encontrada, o Dusk procurará uma caixa de seleção com um atributo `name` correspondente:

```php
    $browser->check('terms');
```

O método `uncheck` pode ser usado para "desmarcar" uma entrada de caixa de seleção:

```php
    $browser->uncheck('terms');
```

<a name="radio-buttons"></a>
#### Botões de opção

Para "selecionar" uma opção de entrada `radio`, você pode usar o método `radio`. Como muitos outros métodos relacionados a entrada, um seletor CSS completo não é necessário. Se uma correspondência de seletor CSS não puder ser encontrada, o Dusk procurará uma entrada `radio` com atributos `name` e `value` correspondentes:

```php
    $browser->radio('size', 'large');
```

<a name="attaching-files"></a>
### Anexando arquivos

O método `attach` pode ser usado para anexar um arquivo a um elemento de entrada `file`. Como muitos outros métodos relacionados a entrada, um seletor CSS completo não é necessário. Se uma correspondência de seletor CSS não puder ser encontrada, o Dusk pesquisará uma entrada `file` com um atributo `name` correspondente:

```php
    $browser->attach('photo', __DIR__.'/photos/mountains.png');
```

::: warning ATENÇÃO
A função `attach` requer que a extensão PHP `Zip` esteja instalada e habilitada no seu servidor.
:::

<a name="pressing-buttons"></a>
### Pressionando botões

O método `press` pode ser usado para clicar em um elemento de botão na página. O argumento fornecido ao método `press` pode ser o texto de exibição do botão ou um seletor CSS/Dusk:

```php
    $browser->press('Login');
```

Ao enviar formulários, muitos aplicativos desabilitam o botão de envio do formulário após ele ser pressionado e, em seguida, reabilitam o botão quando a solicitação HTTP do envio do formulário é concluída. Para pressionar um botão e esperar que ele seja reativado, você pode usar o método `pressAndWaitFor`:

```php
    // Pressione o botão e aguarde no máximo 5 segundos para que ele seja habilitado...
    $browser->pressAndWaitFor('Save');

    // Pressione o botão e aguarde no máximo 1 segundo para que ele seja habilitado...
    $browser->pressAndWaitFor('Save', 1);
```

<a name="clicking-links"></a>
### Clicando em Links

Para clicar em um link, você pode usar o método `clickLink` na instância do navegador. O método `clickLink` clicará no link que tem o texto de exibição fornecido:

```php
    $browser->clickLink($linkText);
```

Você pode usar o método `seeLink` para determinar se um link com o texto de exibição fornecido está visível na página:

```php
    if ($browser->seeLink($linkText)) {
        // ...
    }
```

::: warning AVISO
Esses métodos interagem com o jQuery. Se o jQuery não estiver disponível na página, o Dusk o injetará automaticamente na página para que fique disponível durante o teste.
:::

<a name="using-the-keyboard"></a>
### Usando o teclado

O método `keys` permite que você forneça sequências de entrada mais complexas para um dado elemento do que normalmente permitido pelo método `type`. Por exemplo, você pode instruir o Dusk a segurar teclas modificadoras enquanto insere valores. Neste exemplo, a tecla `shift` será segurada enquanto `taylor` for inserido no elemento que corresponde ao seletor dado. Depois que `taylor` for digitado, `swift` será digitado sem nenhuma tecla modificadora:

```php
    $browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

Outro caso de uso valioso para o método `keys` é enviar uma combinação de "atalho de teclado" para o seletor CSS primário do seu aplicativo:

```php
    $browser->keys('.app', ['{command}', 'j']);
```

::: info NOTA
Todas as teclas modificadoras, como `{command}`, são encapsuladas em caracteres `{}` e correspondem às constantes definidas na classe `Facebook\WebDriver\WebDriverKeys`, que pode ser [encontrada no GitHub](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php).
:::

<a name="fluent-keyboard-interactions"></a>
#### Interações Fluentes de Teclado

Dusk também fornece um método `withKeyboard`, permitindo que você execute interações complexas de teclado fluentemente por meio da classe `Laravel\Dusk\Keyboard`. A classe `Keyboard` fornece os métodos `press`, `release`, `type` e `pause`:

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
#### Macros de Teclado

Se você quiser definir interações de teclado personalizadas que você pode reutilizar facilmente em todo o seu conjunto de testes, você pode usar o método `macro` fornecido pela classe `Keyboard`. Normalmente, você deve chamar este método a partir do método `boot` de um [provedor de serviços](/docs/providers):

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
         * Registre as macros do navegador do Dusk.
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

A função `macro` aceita um nome como seu primeiro argumento e um encerramento como seu segundo. O fechamento da macro será executado ao chamar a macro como um método em uma instância `Keyboard`:

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

O método `click` pode ser usado para clicar em um elemento que corresponda ao seletor CSS ou Dusk fornecido:

```php
    $browser->click('.selector');
```

O método `clickAtXPath` pode ser usado para clicar em um elemento que corresponda à expressão XPath fornecida:

```php
    $browser->clickAtXPath('//div[@class = "selector"]');
```

O método `clickAtPoint` pode ser usado para clicar no elemento mais alto em um determinado par de coordenadas relativas à área visível do navegador:

```php
    $browser->clickAtPoint($x = 0, $y = 0);
```

O método `doubleClick` pode ser usado para simular o clique duplo de um mouse:

```php
    $browser->doubleClick();

    $browser->doubleClick('.selector');
```

O método `rightClick` pode ser usado para simular o clique direito de um mouse:

```php
    $browser->rightClick();

    $browser->rightClick('.selector');
```

O método `clickAndHold` pode ser usado para simular um botão do mouse sendo clicado e mantido pressionado. Uma chamada subsequente ao método `releaseMouse` desfará esse comportamento e liberará o botão do mouse:

```php
    $browser->clickAndHold('.selector');

    $browser->clickAndHold()
            ->pause(1000)
            ->releaseMouse();
```

O método `controlClick` pode ser usado para simular o evento `ctrl+click` dentro do navegador:

```php
    $browser->controlClick();

    $browser->controlClick('.selector');
```

<a name="mouseover"></a>
#### Mouseover

O método `mouseover` pode ser usado quando você precisa mover o mouse sobre um elemento que corresponde ao seletor CSS ou Dusk fornecido:

```php
    $browser->mouseover('.selector');
```

<a name="drag-drop"></a>
#### Arrastar e soltar

O método `drag` pode ser usado para arrastar um elemento que corresponde ao seletor fornecido para outro elemento:

```php
    $browser->drag('.from-selector', '.to-selector');
```

Ou você pode arrastar um elemento em um único direction:

```php
    $browser->dragLeft('.selector', $pixels = 10);
    $browser->dragRight('.selector', $pixels = 10);
    $browser->dragUp('.selector', $pixels = 10);
    $browser->dragDown('.selector', $pixels = 10);
```

Finalmente, você pode arrastar um elemento por um deslocamento dado:

```php
    $browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a name="javascript-dialogs"></a>
### Diálogos JavaScript

O Dusk fornece vários métodos para interagir com Diálogos JavaScript. Por exemplo, você pode usar o método `waitForDialog` para esperar que um diálogo JavaScript apareça. Este método aceita um argumento opcional indicando quantos segundos esperar para que o diálogo apareça:

```php
    $browser->waitForDialog($seconds = null);
```

O método `assertDialogOpened` pode ser usado para afirmar que um diálogo foi exibido e contém a mensagem fornecida:

```php
    $browser->assertDialogOpened('Dialog message');
```

Se o diálogo JavaScript contiver um prompt, você pode usar o método `typeInDialog` para digitar um valor no prompt:

```php
    $browser->typeInDialog('Hello World');
```

Para fechar um diálogo JavaScript aberto clicando no botão "OK", você pode invocar o método `acceptDialog`:

```php
    $browser->acceptDialog();
```

Para fechar um diálogo JavaScript aberto clicando no botão "Cancelar", você pode invocar o método `dismissDialog`:

```php
    $browser->dismissDialog();
```

<a name="interacting-with-iframes"></a>
### Interagindo com quadros embutidos

Se você precisa interagir com elementos dentro de um iframe, você pode usar o método `withinFrame`. Todas as interações de elementos que ocorrem dentro do fechamento fornecido ao método `withinFrame` serão delimitadas para o contexto do iframe especificado:

```php
    $browser->withinFrame('#credit-card-details', function ($browser) {
        $browser->type('input[name="cardnumber"]', '4242424242424242')
            ->type('input[name="exp-date"]', '1224')
            ->type('input[name="cvc"]', '123')
            ->press('Pay');
    });
```

<a name="scoping-selectors"></a>
### Escopo de seletores

Às vezes você pode querer executar várias operações enquanto delimita todas as operações dentro de um determinado seletor. Por exemplo, você pode querer afirmar que algum texto existe somente dentro de uma tabela e então clicar em um botão dentro dessa tabela. Você pode usar o método `with` para fazer isso. Todas as operações realizadas dentro do fechamento dado ao método `with` serão delimitadas para o seletor original:

```php
    $browser->with('.table', function (Browser $table) {
        $table->assertSee('Hello World')
              ->clickLink('Delete');
    });
```

Você pode ocasionalmente precisar executar asserções fora do escopo atual. Você pode usar os métodos `elsewhere` e `elsewhereWhenAvailable` para fazer isso:

```php
     $browser->with('.table', function (Browser $table) {
        // O escopo atual é `body .table`...

        $browser->elsewhere('.page-title', function (Browser $title) {
            // O escopo atual é `body .page-title`...
            $title->assertSee('Hello World');
        });

        $browser->elsewhereWhenAvailable('.page-title', function (Browser $title) {
            // O escopo atual é `body .page-title`...
            $title->assertSee('Hello World');
        });
     });
```

<a name="waiting-for-elements"></a>
### Aguardando Elementos

Ao testar aplicativos que usam JavaScript extensivamente, muitas vezes se torna necessário "esperar" que certos elementos ou dados estejam disponíveis antes de prosseguir com um teste. O Dusk torna isso moleza. Usando uma variedade de métodos, você pode esperar que os elementos se tornem visíveis na página ou até mesmo esperar até que uma determinada expressão JavaScript seja avaliada como `true`.

<a name="waiting"></a>
#### Aguardando

Se você só precisa pausar o teste por um número determinado de milissegundos, use o método `pause`:

```php
    $browser->pause(1000);
```

Se você precisa pausar o teste somente se uma condição dada for `true`, use o método `pauseIf`:

```php
    $browser->pauseIf(App::environment('production'), 1000);
```

Da mesma forma, se você precisa pausar o teste a menos que uma condição dada seja `true`, você pode usar o método `pauseUnless`:

```php
    $browser->pauseUnless(App::environment('testing'), 1000);
```

<a name="waiting-for-selectors"></a>
#### Aguardando seletores

O método `waitFor` pode ser usado para pausar a execução do teste até que o elemento correspondente ao seletor CSS ou Dusk dado seja exibido na página. Por padrão, isso pausará o teste por no máximo cinco segundos antes de lançar uma exceção. Se necessário, você pode passar um limite de tempo limite personalizado como o segundo argumento para o método:

```php
    // Aguarde no máximo cinco segundos para o seletor...
    $browser->waitFor('.selector');

    // Aguarde no máximo um segundo para o seletor...
    $browser->waitFor('.selector', 1);
```

Você também pode esperar até que o elemento correspondente ao seletor fornecido contenha o texto fornecido:

```php
    // Aguarde no máximo cinco segundos para que o seletor contenha o texto fornecido...
    $browser->waitForTextIn('.selector', 'Hello World');

    // Aguarde no máximo um segundo para que o seletor contenha o texto fornecido...
    $browser->waitForTextIn('.selector', 'Hello World', 1);
```

Você também pode esperar até que o elemento correspondente ao seletor fornecido esteja ausente da página:

```php
    // Aguarde no máximo cinco segundos até que o seletor desapareça...
    $browser->waitUntilMissing('.selector');

    // Aguarde no máximo um segundo até que o seletor desapareça...
    $browser->waitUntilMissing('.selector', 1);
```

Ou você pode esperar até que o elemento correspondente ao seletor fornecido seja habilitado ou desabilitado:

```php
    // Aguarde no máximo cinco segundos até que o seletor seja habilitado...
    $browser->waitUntilEnabled('.selector');

    // Aguarde no máximo um segundo até que o seletor seja habilitado...
    $browser->waitUntilEnabled('.selector', 1);

    // Aguarde no máximo cinco segundos até que o seletor seja desabilitado...
    $browser->waitUntilDisabled('.selector');

    // Aguarde no máximo um segundo até que o seletor seja desabilitado...
    $browser->waitUntilDisabled('.selector', 1);
```

<a name="scoping-selectors-when-available"></a>
#### Escopo de seletores quando disponíveis

Ocasionalmente, você pode desejar esperar que um elemento apareça que corresponda a um determinado seletor e então interagir com o elemento. Por exemplo, você pode desejar esperar até que uma janela modal esteja disponível e então pressionar o botão "OK" dentro do modal. O método `whenAvailable` pode ser usado para fazer isso. Todas as operações de elemento realizadas dentro do fechamento fornecido serão delimitadas para o seletor original:

```php
    $browser->whenAvailable('.modal', function (Browser $modal) {
        $modal->assertSee('Hello World')
              ->press('OK');
    });
```

<a name="waiting-for-text"></a>
#### Aguardando texto

O método `waitForText` pode ser usado para esperar até que o texto fornecido seja exibido na página:

```php
    // Aguarde no máximo cinco segundos pelo texto...
    $browser->waitForText('Hello World');

    // Aguarde no máximo um segundo pelo texto...
    $browser->waitForText('Hello World', 1);
```

Você pode usar o método `waitUntilMissingText` para esperar até que o texto exibido seja removido da página:

```php
    // Aguarde no máximo cinco segundos para que o texto seja removido...
    $browser->waitUntilMissingText('Hello World');

    // Aguarde no máximo um segundo para que o texto seja removido...
    $browser->waitUntilMissingText('Hello World', 1);
```

<a name="waiting-for-links"></a>
#### Aguardando links

O método `waitForLink` pode ser usado para esperar até que o texto do link fornecido seja exibido na página:

```php
    // Aguarde no máximo cinco segundos pelo link...
    $browser->waitForLink('Create');

    // Aguarde no máximo um segundo pelo link...
    $browser->waitForLink('Create', 1);
```

<a name="waiting-for-inputs"></a>
#### Aguardando entradas

O método `waitForInput` pode ser usado para esperar até que o campo de entrada fornecido esteja visível na página:

```php
    // Aguarde no máximo cinco segundos pela entrada...
    $browser->waitForInput($field);

    // Aguarde no máximo um segundo pela entrada...
    $browser->waitForInput($field, 1);
```

<a name="waiting-on-the-page-location"></a>
#### Aguardando a localização da página

Ao fazer uma asserção de caminho como `$browser->assertPathIs('/home')`, a asserção pode falhar se `window.location.pathname` estiver sendo atualizado de forma assíncrona. Você pode usar o método `waitForLocation` para esperar que o local seja um valor fornecido:

```php
    $browser->waitForLocation('/secret');
```

O método `waitForLocation` também pode ser usado para esperar que o local da janela atual seja uma URL totalmente qualificada:

```php
    $browser->waitForLocation('https://example.com/path');
```

Você também pode esperar pelo local de uma [rota nomeada](/docs/routing#named-routes):

```php
    $browser->waitForRoute($routeName, $parameters);
```

<a name="waiting-for-page-reloads"></a>
#### Aguardando recarregamentos de página

Se você precisar esperar que uma página seja recarregada após executar uma ação, use o método `waitForReload`:

```php
    use Laravel\Dusk\Browser;

    $browser->waitForReload(function (Browser $browser) {
        $browser->press('Submit');
    })
    ->assertSee('Success!');
```

Como a necessidade de esperar que a página seja recarregada normalmente ocorre após clicar em um botão, você pode usar o Método `clickAndWaitForReload` para conveniência:

```php
    $browser->clickAndWaitForReload('.selector')
            ->assertSee('something');
```

<a name="waiting-on-javascript-expressions"></a>
#### Aguardando Expressões JavaScript

Às vezes, você pode querer pausar a execução de um teste até que uma dada expressão JavaScript seja avaliada como `true`. Você pode facilmente fazer isso usando o método `waitUntil`. Ao passar uma expressão para este método, você não precisa incluir a palavra-chave `return` ou um ponto e vírgula final:

```php
    // Aguarde no máximo cinco segundos para que a expressão seja verdadeira...
    $browser->waitUntil('App.data.servers.length > 0');

    // Aguarde no máximo um segundo para que a expressão seja verdadeira...
    $browser->waitUntil('App.data.servers.length > 0', 1);
```

<a name="waiting-on-vue-expressions"></a>
#### Aguardando expressões Vue

Os métodos `waitUntilVue` e `waitUntilVueIsNot` podem ser usados ​​para esperar até que um atributo [componente Vue](https://vuejs.org) tenha um valor fornecido:

```php
    // Aguarde até que o atributo do componente contenha o valor fornecido...
    $browser->waitUntilVue('user.name', 'Taylor', '@user');

    // Aguarde até que o atributo do componente não contenha o valor fornecido...
    $browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a name="waiting-for-javascript-events"></a>
#### Aguardando eventos JavaScript

O método `waitForEvent` pode ser usado para pausar a execução de um teste até que um evento JavaScript ocorra:

```php
    $browser->waitForEvent('load');
```

O ouvinte de eventos é anexado ao escopo atual, que é o elemento `body` por padrão. Ao usar um seletor com escopo, o ouvinte de eventos será anexado ao elemento correspondente:

```php
    $browser->with('iframe', function (Browser $iframe) {
        // Wait for the iframe's load event...
        $iframe->waitForEvent('load');
    });
```

Você também pode fornecer um seletor como o segundo argumento para o método `waitForEvent` para anexar o ouvinte de eventos a um elemento específico:

```php
    $browser->waitForEvent('load', '.selector');
```

Você também pode esperar por eventos nos objetos `document` e `window`:

```php
    // Aguarde até que o documento seja rolado...
    $browser->waitForEvent('scroll', 'document');

    // Aguarde no máximo cinco segundos até que a janela seja redimensionada...
    $browser->waitForEvent('resize', 'window', 5);
```

<a name="waiting-with-a-callback"></a>
#### Esperando com um retorno de chamada

Muitos dos métodos "wait" no Dusk dependem do método subjacente `waitUsing`. Você pode usar este método diretamente para esperar que um determinado fechamento retorne `true`. O método `waitUsing` aceita o número máximo de segundos para esperar, o intervalo no qual o fechamento deve ser avaliado, o fechamento e uma mensagem de falha opcional:

```php
    $browser->waitUsing(10, 1, function () use ($something) {
        return $something->isReady();
    }, "Something wasn't ready in time.");
```

<a name="scrolling-an-element-into-view"></a>
### Rolando um elemento para a visualização

Às vezes, você pode não conseguir clicar em um elemento porque ele está fora da área visível do navegador. O método `scrollIntoView` rolará a janela do navegador até que o elemento no seletor fornecido esteja dentro da visualização:

```php
    $browser->scrollIntoView('.selector')
            ->click('.selector');
```

<a name="available-assertions"></a>
## Asserções disponíveis

O Dusk fornece uma variedade de asserções que você pode fazer em seu aplicativo. Todas as asserções disponíveis estão documentadas na lista abaixo:

[assertTitle](#assert-title)
[assertTitleContains](#assert-title-contains)
[assertUrlIs](#assert-url-is)
[assertSchemeIs](#assert-scheme-is)
[assertSchemeIsNot](#assert-scheme-is-not)
[assertHostIs](#assert-host-is)
[assertHostIsNot](#assert-host-is-not)
[assertPortIs](#assert-port-is)
[assertPortIsNot](#assert-port-is-not)
[assertPathBeginsWith](#assert-path-begins-with)
[assertPathEndsWith](#assert-path-ends-with)
[assertPathContains](#assert-path-contains)
[assertPathIs](#assert-path-is)
[assertPathIsNot](#assert-path-is-not)
[assertRouteIs](#assert-route-is)
[assertQueryStringHas](#assert-query-string-has)
[assertQueryStringMissing](#assert-query-string-missing)
[assertFragmentIs](#assert-fragment-is)
[assertFragmentBeginsWith](#assert-fragment-begins-with)
[assertFragmentIsNot](#assert-fragment-is-not)
[assertHasCookie](#assert-has-cookie)
[assertHasPlainCookie](#assert-has-plain-cookie)
[assertCookieMissing](#assert-cookie-missing)
[assertPlainCookieMissing](#assert-plain-cookie-missing)
[assertCookieValue](#assert-cookie-value)
[assertPlainCookieValue](#assert-plain-cookie-value)
[assertSee](#assert-see)
[assertDontSee](#assert-dont-see)
[assertSeeIn](#assert-see-in)
[assertDontSeeIn](#assert-dont-see-in)
[assertSeeAnythingIn](#assert-see-anything-in)
[assertSeeNothingIn](#assert-see-nothing-in)
[assertScript](#assert-script)
[assertSourceHas](#assert-source-has)
[assertSourceMissing](#assert-source-missing)
[assertSeeLink](#assert-see-link)
[assertDontSeeLink](#assert-dont-see-link)
[assertInputValue](#assert-input-value)
[assertInputValueIsNot](#assert-input-value-is-not)
[assertChecked](#assert-checked)
[assertNotChecked](#assert-not-checked)
[assertIndeterminate](#assert-indeterminate)
[assertRadioSelected](#assert-radio-selected)
[assertRadioNotSelected](#assert-radio-not-selected)
[assertSelected](#assert-selected)
[assertNotSelected](#assert-not-selected)
[assertSelectHasOptions](#assert-select-has-options)
[assertSelectMissingOptions](#assert-select-missing-options)
[assertSelectHasOption](#assert-select-has-option)
[assertSelectMissingOption](#assert-select-missing-option)
[assertValue](#assert-value)
[assertValueIsNot](#assert-value-is-not)
[assertAttribute](#assert-attribute)
[assertAttributeContains](#assert-attribute-contains)
[assertAttributeDoesntContain](#assert-attribute-doesnt-contain)
[assertAriaAttribute](#assert-aria-attribute)
[assertDataAttribute](#assert-data-attribute)
[assertVisible](#assert-visible)
[assertPresent](#assert-present)
[assertNotPresent](#assert-not-present)
[assertMissing](#assert-missing)
[assertInputPresent](#assert-input-present)
[assertInputMissing](#assert-input-missing)
[assertDialogOpened](#assert-dialog-opened)
[assertEnabled](#assert-enabled)
[assertDisabled](#assert-disabled)
[assertButtonEnabled](#assert-button-enabled)
[assertButtonDisabled](#assert-button-disabled)
[assertFocused](#assert-focused)
[assertNotFocused](#assert-not-focused)
[assertAuthenticated](#assert-authenticated)
[assertGuest](#assert-guest)
[assertAuthenticatedAs](#assert-authenticated-as)
[assertVue](#assert-vue)
[assertVueIsNot](#assert-vue-is-not)
[assertVueContains](#assert-vue-contains)
[assertVueDoesntContain](#assert-vue-doesnt-contain)

<a name="assert-title"></a>
#### assertTitle

Afirme que o título da página corresponde ao texto fornecido:

```php
    $browser->assertTitle($title);
```

<a name="assert-title-contains"></a>
#### assertTitleContains

Afirme que o título da página contém o texto fornecido:

```php
    $browser->assertTitleContains($title);
```

<a name="assert-url-is"></a>
#### assertUrlIs

Afirme que a URL atual (sem a string de consulta) corresponde à string fornecida:

```php
    $browser->assertUrlIs($url);
```

<a name="assert-scheme-is"></a>
#### assertSchemeIs

Afirme que o esquema de URL atual corresponde ao esquema fornecido:

```php
    $browser->assertSchemeIs($scheme);
```

<a name="assert-scheme-is-not"></a>
#### assertSchemeIsNot

Declara que o esquema de URL atual não corresponde ao esquema fornecido:

```php
    $browser->assertSchemeIsNot($scheme);
```

<a name="assert-host-is"></a>
#### assertHostIs

Declara que o host de URL atual corresponde ao host fornecido:

```php
    $browser->assertHostIs($host);
```

<a name="assert-host-is-not"></a>
#### assertHostIsNot

Declara que o host de URL atual não corresponde ao host fornecido:

```php
    $browser->assertHostIsNot($host);
```

<a name="assert-port-is"></a>
#### assertPortIs

Declara que a porta de URL atual corresponde à porta fornecida:

```php
    $browser->assertPortIs($port);
```

<a name="assert-port-is-not"></a>
#### assertPortIsNot

Declara que a porta atual da URL não corresponde à porta fornecida:

```php
    $browser->assertPortIsNot($port);
```

<a name="assert-path-begins-with"></a>
#### assertPathBeginsWith

Declara que o caminho atual da URL começa com o caminho fornecido:

```php
    $browser->assertPathBeginsWith('/home');
```

<a name="assert-path-ends-with"></a>
#### assertPathEndsWith

Declara que o caminho atual da URL termina com o caminho fornecido:

```php
    $browser->assertPathEndsWith('/home');
```

<a name="assert-path-contains"></a>
#### assertPathContains

Declara que o caminho atual da URL contém o caminho fornecido caminho:

```php
    $browser->assertPathContains('/home');
```

<a name="assert-path-is"></a>
#### assertPathIs

Declara que o caminho atual corresponde ao caminho fornecido:

```php
    $browser->assertPathIs('/home');
```

<a name="assert-path-is-not"></a>
#### assertPathIsNot

Declara que o caminho atual não corresponde ao caminho fornecido:

```php
    $browser->assertPathIsNot('/home');
```

<a name="assert-route-is"></a>
#### assertRouteIs

Declara que a URL atual corresponde à URL da [rota nomeada](/docs/routing#named-routes) fornecida:

```php
    $browser->assertRouteIs($name, $parameters);
```

<a name="assert-query-string-has"></a>
#### assertQueryStringHas

Afirme que o parâmetro de string de consulta fornecido está presente:

```php
    $browser->assertQueryStringHas($name);
```

Afirme que o parâmetro de string de consulta fornecido está presente e tem um valor fornecido:

```php
    $browser->assertQueryStringHas($name, $value);
```

<a name="assert-query-string-missing"></a>
#### assertQueryStringMissing

Afirme que o parâmetro de string de consulta fornecido está ausente:

```php
    $browser->assertQueryStringMissing($name);
```

<a name="assert-fragment-is"></a>
#### assertFragmentIs

Afirme que o fragmento de hash atual da URL corresponde ao fragmento fornecido:

```php
    $browser->assertFragmentIs('anchor');
```

<a name="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

Afirme que o parâmetro de string de consulta atual da URL fragmento hash começa com o fragmento fornecido:

```php
    $browser->assertFragmentBeginsWith('anchor');
```

<a name="assert-fragment-is-not"></a>
#### assertFragmentIsNot

Declara que o fragmento hash atual da URL não corresponde ao fragmento fornecido:

```php
    $browser->assertFragmentIsNot('anchor');
```

<a name="assert-has-cookie"></a>
#### assertHasCookie

Declara que o cookie criptografado fornecido está presente:

```php
    $browser->assertHasCookie($name);
```

<a name="assert-has-plain-cookie"></a>
#### assertHasPlainCookie

Declara que o cookie não criptografado fornecido está presente:

```php
    $browser->assertHasPlainCookie($name);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

Declara que o cookie criptografado fornecido não está presente:

```php
    $browser->assertCookieMissing($name);
```

<a name="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

Declara que o cookie não criptografado fornecido não está presente:

```php
    $browser->assertPlainCookieMissing($name);
```

<a name="assert-cookie-value"></a>
#### assertCookieValue

Declara que um cookie criptografado tem um valor fornecido:

```php
    $browser->assertCookieValue($name, $value);
```

<a name="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

Declara que um cookie não criptografado tem um valor fornecido:

```php
    $browser->assertPlainCookieValue($name, $value);
```

<a name="assert-see"></a>
#### assertSee

Declara que o texto fornecido está presente na página:

```php
    $browser->assertSee($text);
```

<a name="assert-dont-see"></a>
#### assertDontSee

Declara que o texto fornecido não está presente na página:

```php
    $browser->assertDontSee($text);
```

<a name="assert-see-in"></a>
#### assertSeeIn

Declara que o texto fornecido está presente no seletor:

```php
    $browser->assertSeeIn($selector, $text);
```

<a name="assert-dont-see-in"></a>
#### assertDontSeeIn

Declara que o texto fornecido não está presente no seletor:

```php
    $browser->assertDontSeeIn($selector, $text);
```

<a name="assert-see-anything-in"></a>
#### assertSeeAnythingIn

Declara que qualquer texto está presente no seletor:

```php
    $browser->assertSeeAnythingIn($selector);
```

<a name="assert-see-nothing-in"></a>
#### assertSeeNothingIn

Declara que nenhum texto está presente no seletor:

```php
    $browser->assertSeeNothingIn($selector);
```

<a name="assert-script"></a>
#### assertScript

Declara que a expressão JavaScript fornecida é avaliada como o valor fornecido:

```php
    $browser->assertScript('window.isLoaded')
            ->assertScript('document.readyState', 'complete');
```

<a name="assert-source-has"></a>
#### assertSourceHas

Declara que o código-fonte fornecido está presente na página:

```php
    $browser->assertSourceHas($code);
```

<a name="assert-source-missing"></a>
#### assertSourceMissing

Declara que o código-fonte fornecido não está presente na página:

```php
    $browser->assertSourceMissing($code);
```

<a name="assert-see-link"></a>
#### assertSeeLink

Afirme que o link fornecido está presente na página:

```php
    $browser->assertSeeLink($linkText);
```

<a name="assert-dont-see-link"></a>
#### assertDontSeeLink

Afirme que o link fornecido não está presente na página:

```php
    $browser->assertDontSeeLink($linkText);
```

<a name="assert-input-value"></a>
#### assertInputValue

Afirme que o campo de entrada fornecido tem o valor fornecido:

```php
    $browser->assertInputValue($field, $value);
```

<a name="assert-input-value-is-not"></a>
#### assertInputValueIsNot

Afirme que o campo de entrada fornecido não tem o valor fornecido:

```php
    $browser->assertInputValueIsNot($field, $value);
```

<a name="assert-checked"></a>
#### assertChecked

Declara que a caixa de seleção fornecida está marcada:

```php
    $browser->assertChecked($field);
```

<a name="assert-not-checked"></a>
#### assertNotChecked

Declara que a caixa de seleção fornecida não está marcada:

```php
    $browser->assertNotChecked($field);
```

<a name="assert-indeterminate"></a>
#### assertIndeterminate

Declara que a caixa de seleção fornecida está em um estado indeterminado:

```php
    $browser->assertIndeterminate($field);
```

<a name="assert-radio-selected"></a>
#### assertRadioSelected

Declara que o campo de rádio fornecido está selecionado:

```php
    $browser->assertRadioSelected($field, $value);
```

<a name="assert-radio-not-selected"></a>
#### assertRadioNotSelected

Declara que o campo de rádio fornecido não está selecionado:

```php
    $browser->assertRadioNotSelected($field, $value);
```

<a name="assert-selected"></a>
#### assertSelected

Declara que o menu suspenso fornecido tem o valor fornecido selecionado:

```php
    $browser->assertSelected($field, $value);
```

<a name="assert-not-selected"></a>
#### assertNotSelected

Declara que o menu suspenso fornecido não tem o valor fornecido selecionado:

```php
    $browser->assertNotSelected($field, $value);
```

<a name="assert-select-has-options"></a>
#### assertSelectHasOptions

Declara que a matriz de valores fornecida está disponível para ser selecionada:

```php
    $browser->assertSelectHasOptions($field, $values);
```

<a name="assert-select-missing-options"></a>
#### assertSelectMissingOptions

Afirme que a matriz de valores fornecida não está disponível para seleção:

```php
    $browser->assertSelectMissingOptions($field, $values);
```

<a name="assert-select-has-option"></a>
#### assertSelectHasOption

Afirme que o valor fornecido está disponível para seleção no campo fornecido:

```php
    $browser->assertSelectHasOption($field, $value);
```

<a name="assert-select-missing-option"></a>
#### assertSelectMissingOption

Afirme que o valor fornecido não está disponível para seleção:

```php
    $browser->assertSelectMissingOption($field, $value);
```

<a name="assert-value"></a>
#### assertValue

Afirme que o elemento que corresponde ao seletor fornecido tem o valor:

```php
    $browser->assertValue($selector, $value);
```

<a name="assert-value-is-not"></a>
#### assertValueIsNot

Afirma que o elemento que corresponde ao seletor fornecido não tem o valor fornecido:

```php
    $browser->assertValueIsNot($selector, $value);
```

<a name="assert-attribute"></a>
#### assertAttribute

Afirma que o elemento que corresponde ao seletor fornecido tem o valor fornecido no atributo fornecido:

```php
    $browser->assertAttribute($selector, $attribute, $value);
```

<a name="assert-attribute-contains"></a>
#### assertAttributeContains

Afirme que o elemento que corresponde ao seletor fornecido contém o valor fornecido no atributo fornecido:

```php
    $browser->assertAttributeContains($selector, $attribute, $value);
```

<a name="assert-attribute-doesnt-contain"></a>
#### assertAttributeDoesntContain

Afirme que o elemento que corresponde ao seletor fornecido não contém o valor fornecido no atributo fornecido:

```php
    $browser->assertAttributeDoesntContain($selector, $attribute, $value);
```

<a name="assert-aria-attribute"></a>
#### assertAriaAttribute

Afirme que o elemento que corresponde ao seletor fornecido tem o valor fornecido no atributo aria fornecido:

```php
    $browser->assertAriaAttribute($selector, $attribute, $value);
```

Por exemplo, dada a marcação `<button aria-label="Add"></button>`, você pode afirmar contra o atributo `aria-label` como então:

```php
    $browser->assertAriaAttribute('button', 'label', 'Add')
```

<a name="assert-data-attribute"></a>
#### assertDataAttribute

Afirme que o elemento que corresponde ao seletor fornecido tem o valor fornecido no atributo de dados fornecido:

```php
    $browser->assertDataAttribute($selector, $attribute, $value);
```

Por exemplo, dada a marcação `<tr id="row-1" data-content="attendees"></tr>`, você pode afirmar contra o atributo `data-label` assim:

```php
    $browser->assertDataAttribute('#row-1', 'content', 'attendees')
```

<a name="assert-visible"></a>
#### assertVisible

Afirme que o elemento que corresponde ao seletor fornecido é visível:

```php
    $browser->assertVisible($selector);
```

<a name="assert-present"></a>
#### assertPresent

Afirme que o elemento que corresponde ao seletor fornecido está presente em a fonte:

```php
    $browser->assertPresent($selector);
```

<a name="assert-not-present"></a>
#### assertNotPresent

Afirma que o elemento que corresponde ao seletor fornecido não está presente na fonte:

```php
    $browser->assertNotPresent($selector);
```

<a name="assert-missing"></a>
#### assertMissing

Afirma que o elemento que corresponde ao seletor fornecido não está visível:

```php
    $browser->assertMissing($selector);
```

<a name="assert-input-present"></a>
#### assertInputPresent

Afirma que uma entrada com o nome fornecido está presente:

```php
    $browser->assertInputPresent($name);
```

<a name="assert-input-missing"></a>
#### assertInputMissing

Afirma que uma entrada com o nome fornecido não está presente na fonte:

```php
    $browser->assertInputMissing($name);
```

<a name="assert-dialog-opened"></a>
#### assertDialogOpened

Declara que um diálogo JavaScript com a mensagem fornecida foi aberto:

```php
    $browser->assertDialogOpened($message);
```

<a name="assert-enabled"></a>
#### assertEnabled

Declara que o campo fornecido está habilitado:

```php
    $browser->assertEnabled($field);
```

<a name="assert-disabled"></a>
#### assertDisabled

Declara que o campo fornecido está desabilitado:

```php
    $browser->assertDisabled($field);
```

<a name="assert-button-enabled"></a>
#### assertButtonEnabled

Declara que o botão fornecido está habilitado:

```php
    $browser->assertButtonEnabled($button);
```

<a name="assert-button-disabled"></a>
#### assertButtonDisabled

Declara que o botão fornecido está desabilitado:

```php
    $browser->assertButtonDisabled($button);
```

<a name="assert-focused"></a>
#### assertFocused

Declara que o campo fornecido está focado:

```php
    $browser->assertFocused($field);
```

<a name="assert-not-focused"></a>
#### assertNotFocused

Declara que o campo fornecido não está focado:

```php
    $browser->assertNotFocused($field);
```

<a name="assert-authenticated"></a>
#### assertAuthenticated

Declara que o usuário está autenticado:

```php
    $browser->assertAuthenticated();
```

<a name="assert-guest"></a>
#### assertGuest

Declara que o usuário não está autenticado:

```php
    $browser->assertGuest();
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

Declara que o usuário está autenticado como o usuário fornecido:

```php
    $browser->assertAuthenticatedAs($user);
```

<a name="assert-vue"></a>
#### assertVue

O Dusk ainda permite que você faça afirmações sobre o estado dos dados do [componente Vue](https://vuejs.org). Por exemplo, imagine que seu aplicativo contém o seguinte componente Vue:

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

::: code-group
```php [Pest]
test('vue', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
                ->assertVue('user.name', 'Taylor', '@profile-component');
    });
});
```

```php [PHPUnit]
/**
 * Um exemplo básico de teste do Vue.
 */
public function test_vue(): void
{
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
                ->assertVue('user.name', 'Taylor', '@profile-component');
    });
}
```
:::

<a name="assert-vue-is-not"></a>
#### assertVueIsNot

Afirme que uma determinada propriedade de dados do componente Vue não corresponde ao valor fornecido:

```php
    $browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a name="assert-vue-contains"></a>
#### assertVueContains

Afirme que uma determinada propriedade de dados do componente Vue é uma matriz e contém o valor fornecido:

```php
    $browser->assertVueContains($property, $value, $componentSelector = null);
```

<a name="assert-vue-doesnt-contain"></a>
#### assertVueDoesntContain

Afirma que uma dada propriedade de dados do componente Vue é uma matriz e não contém o valor dado:

```php
    $browser->assertVueDoesntContain($property, $value, $componentSelector = null);
```

<a name="pages"></a>
## Páginas

Às vezes, os testes exigem que várias ações complicadas sejam executadas em sequência. Isso pode tornar seus testes mais difíceis de ler e entender. As Páginas Dusk permitem que você defina ações expressivas que podem ser executadas em uma determinada página por meio de um único método. As Páginas também permitem que você defina atalhos para seletores comuns para seu aplicativo ou para uma única página.

<a name="generating-pages"></a>
### Gerando Páginas

Para gerar um objeto de página, execute o comando Artisan `dusk:page`. Todos os objetos de página serão colocados no diretório `tests/Browser/Pages` do seu aplicativo:

```php
    php artisan dusk:page Login
```

<a name="configuring-pages"></a>
### Configurando páginas

Por padrão, as páginas têm três métodos: `url`, `assert` e `elements`. Discutiremos os métodos `url` e `assert` agora. O método `elements` será [discutido em mais detalhes abaixo](#shorthand-selectors).

<a name="the-url-method"></a>
#### O método `url`

O método `url` deve retornar o caminho da URL que representa a página. O Dusk usará esta URL ao navegar para a página no navegador:

```php
    /**
     * Obtenha o URL da página.
     */
    public function url(): string
    {
        return '/login';
    }
```

<a name="the-assert-method"></a>
#### O método `assert`

O método `assert` pode fazer quaisquer asserções necessárias para verificar se o navegador está realmente na página fornecida. Na verdade, não é necessário colocar nada dentro deste método; no entanto, você é livre para fazer essas asserções se desejar. Essas asserções serão executadas automaticamente ao navegar para a página:

```php
    /**
     * Afirme que o navegador está na página.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertPathIs($this->url());
    }
```

<a name="navigating-to-pages"></a>
### Navegando para páginas

Depois que uma página for definida, você pode navegar até ela usando o método `visit`:

```php
    use Tests\Browser\Pages\Login;

    $browser->visit(new Login);
```

Às vezes, você pode já estar em uma determinada página e precisar "carregar" os seletores e métodos da página no contexto de teste atual. Isso é comum ao pressionar um botão e ser redirecionado para uma determinada página sem navegar explicitamente para ela. Nessa situação, você pode usar o método `on` para carregar a página:

```php
    use Tests\Browser\Pages\CreatePlaylist;

    $browser->visit('/dashboard')
            ->clickLink('Create Playlist')
            ->on(new CreatePlaylist)
            ->assertSee('@create');
```

<a name="shorthand-selectors"></a>
### Seletores de atalhos

O método `elements` dentro das classes de página permite que você defina atalhos rápidos e fáceis de lembrar para qualquer seletor CSS na sua página. Por exemplo, vamos definir um atalho para o campo de entrada "email" da página de login do aplicativo:

```php
    /**
     * Obtenha os atalhos dos elementos para a página.
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

Depois que o atalho for definido, você pode usar o seletor de atalhos em qualquer lugar que você normalmente usaria um seletor CSS completo:

```php
    $browser->type('@email', 'taylor@laravel.com');
```

<a name="global-shorthand-selectors"></a>
#### Seletores de atalhos globais

Após instalar o Dusk, uma classe base `Page` será colocada no seu diretório `tests/Browser/Pages`. Esta classe contém um método `siteElements` que pode ser usado para definir seletores de taquigrafia globais que devem estar disponíveis em todas as páginas do seu aplicativo:

```php
    /**
     * Obtenha os atalhos de elementos globais para o site.
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
### Métodos de página

Além dos métodos padrão definidos nas páginas, você pode definir métodos adicionais que podem ser usados ​​em seus testes. Por exemplo, vamos imaginar que estamos construindo um aplicativo de gerenciamento de música. Uma ação comum para uma página do aplicativo pode ser criar uma lista de reprodução. Em vez de reescrever a lógica para criar uma lista de reprodução em cada teste, você pode definir um método `createPlaylist` em uma classe de página:

```php
    <?php

    namespace Tests\Browser\Pages;

    use Laravel\Dusk\Browser;
    use Laravel\Dusk\Page;

    class Dashboard extends Page
    {
        // Outros métodos de página...

        /**
         * Crie uma nova playlist.
         */
        public function createPlaylist(Browser $browser, string $name): void
        {
            $browser->type('name', $name)
                    ->check('share')
                    ->press('Create Playlist');
        }
    }
```

Depois que o método for definido, você pode usá-lo em qualquer teste que utilize a página. A instância do navegador será automaticamente passada como o primeiro argumento para métodos de página personalizados:

```php
    use Tests\Browser\Pages\Dashboard;

    $browser->visit(new Dashboard)
            ->createPlaylist('My Playlist')
            ->assertSee('My Playlist');
```

<a name="components"></a>
## Componentes

Os componentes são semelhantes aos "objetos de página" do Dusk, mas são destinados a partes da IU e funcionalidade que são reutilizadas em todo o seu aplicativo, como uma barra de navegação ou janela de notificação. Como tal, os componentes não são vinculados a URLs específicos.

<a name="generating-components"></a>
### Gerando componentes

Para gerar um componente, execute o comando Artisan `dusk:component`. Novos componentes são colocados no diretório `tests/Browser/Components`:

```php
    php artisan dusk:component DatePicker
```

Como mostrado acima, um "seletor de data" é um exemplo de um componente que pode existir em todo o seu aplicativo em uma variedade de páginas. Pode se tornar complicado escrever manualmente a lógica de automação do navegador para selecionar uma data em dezenas de testes em todo o seu conjunto de testes. Em vez disso, podemos definir um componente Dusk para representar o seletor de data, permitindo-nos encapsular essa lógica dentro do componente:

```php
    <?php

    namespace Tests\Browser\Components;

    use Laravel\Dusk\Browser;
    use Laravel\Dusk\Component as BaseComponent;

    class DatePicker extends BaseComponent
    {
        /**
         * Obtenha o seletor raiz para o componente.
         */
        public function selector(): string
        {
            return '.date-picker';
        }

        /**
         * Afirme que a página do navegador contém o componente.
         */
        public function assert(Browser $browser): void
        {
            $browser->assertVisible($this->selector());
        }

        /**
         * Obtenha os atalhos de elementos para o componente.
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
         * Selecione a data fornecida.
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
### Usando componentes

Depois que o componente for definido, podemos facilmente selecionar uma data dentro do seletor de data de qualquer teste. E, se a lógica necessária para selecionar uma data mudar, precisamos apenas atualizar o componente:

::: code-group
```php [Pest]
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

```php [PHPUnit]
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\DatePicker;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    /**
     * Um exemplo básico de teste de componente.
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
:::

<a name="continuous-integration"></a>
## Integração Contínua

::: warning AVISO
A maioria das configurações de integração contínua do Dusk espera que seu aplicativo Laravel seja servido usando o servidor de desenvolvimento PHP integrado na porta 8000. Portanto, antes de continuar, você deve garantir que seu ambiente de integração contínua tenha um valor de variável de ambiente `APP_URL` de `http://127.0.0.1:8000`.
:::

<a name="running-tests-on-heroku-ci"></a>
### Heroku CI

Para executar os testes Dusk no [Heroku CI](https://www.heroku.com/continuous-integration), adicione o seguinte buildpack e scripts do Google Chrome ao seu arquivo Heroku `app.json`:

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

Para executar seus testes Dusk no [Travis CI](https://travis-ci.org), use a seguinte configuração `.travis.yml`. Como o Travis CI não é um ambiente gráfico, precisaremos tomar algumas medidas extras para iniciar um navegador Chrome. Além disso, usaremos `php artisan serve` para iniciar o servidor web integrado do PHP:

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

Se você estiver usando [Ações do GitHub](https://github.com/features/actions) para executar seus testes Dusk, você pode usar o seguinte arquivo de configuração como ponto de partida. Assim como o TravisCI, usaremos o comando `php artisan serve` para iniciar o servidor web integrado do PHP:

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

Se você estiver usando [Chipper CI](https://chipperci.com) para executar seus testes Dusk, você pode usar o seguinte arquivo de configuração como ponto de partida. Usaremos o servidor interno do PHP para executar o Laravel para que possamos ouvir solicitações:

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

Para saber mais sobre como executar testes Dusk no Chipper CI, incluindo como usar bancos de dados, consulte a [documentação oficial do Chipper CI](https://chipperci.com/docs/testing/laravel-dusk-new/).
