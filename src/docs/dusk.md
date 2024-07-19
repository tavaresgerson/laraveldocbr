# Laravel Dusk

<a name="introduction"></a>
## Introdução

 O [Laravel Dusk](https://github.com/laravel/dusk) fornece uma API de automação e teste de navegador fácil de usar e expressiva. Por padrão, o Dusk não exige que você instale o JDK ou o Selenium em seu computador local. Em vez disso, ele utiliza uma instalação standalone do [ChromeDriver](https://sites.google.com/chromium.org/driver). No entanto, você tem liberdade para usar qualquer outro driver compatível com o Selenium que desejar.

<a name="installation"></a>
## Instalação

 Para começar a usar o Dusk, você deve instalar o Google Chrome e adicionar a dependência do Composer `laravel/dusk` ao seu projeto:

```shell
composer require laravel/dusk --dev
```

 > [ADVERTÊNCIA]
 Se você estiver registrando o provedor de serviços do Dusk manualmente, NUNCA o registre em seu ambiente de produção, pois isso poderia permitir que usuários arbitrários se autenticassem na aplicação.

 Após instalar o pacote Dusk, execute o comando `dusk:install`. O comando `dusk:install` criará a pasta `tests/Browser`, um exemplo de teste Dusk e irá instalar o binário do Chrome Driver para seu sistema operacional:

```shell
php artisan dusk:install
```

 Em seguida, defina a variável de ambiente `APP_URL` no arquivo `.env` da sua aplicação. Este valor deve ser igual ao URL que você usa para acessar seu aplicativo em um navegador.

 > [!NOTA]
 Para saber mais sobre a ferramenta de gestão do ambiente de desenvolvimento local, o "Laravel Sail" (https://laravel.com/docs/sail), consulte também a documentação do Sail em

<a name="managing-chromedriver-installations"></a>
### Gerenciando instalações do ChromeDriver

 Se você deseja instalar uma versão diferente do ChromeDriver do que a instalada pelo Laravel Dusk através do comando `dusk:install`, poderá usar o comando `dusk:chrome-driver`:

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

 > [!AVISO]
 > O Dusk necessita que os arquivos `chromedriver` sejam executáveis. Caso você esteja tendo problemas para rodar o Dusk, verifique se os binários são executáveis usando o comando seguinte: `chmod -R 0755 vendor/laravel/dusk/bin/`.

<a name="using-other-browsers"></a>
### Usando outros navegadores

 Por padrão, o Dusk usa o Google Chrome e uma instalação autônoma do [ChromeDriver](https://sites.google.com/chromium.org/driver) para executar seus testes de navegador. No entanto, você pode iniciar seu próprio servidor Selenium e executar os testes contra qualquer browser que desejar.

 Para começar, abra seu arquivo `tests/DuskTestCase.php`, que é o teste base do Dusk para sua aplicação. No arquivo, remova a chamada ao método `startChromeDriver`. Isso impedirá que o Dusk inicie automaticamente o ChromeDriver:

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

 Em seguida, você pode modificar o método `driver` para se conectar à URL e porta escolhidas. Você também pode modificar os recursos desejados que devem ser passados ao WebDriver:

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
## Começando

<a name="generating-tests"></a>
### Gerando testes

 Para gerar um teste de Dusk, utilize o comando do Artisan `dusk:make`. O teste gerado será salvo no diretório `tests/Browser`:

```shell
php artisan dusk:make LoginTest
```

<a name="resetting-the-database-after-each-test"></a>
### Reiniciar a base de dados após cada teste

 A maioria dos testes que você escreve irá interagir com páginas que recuperam dados do banco de dados da sua aplicação; no entanto, os seus testes Dusk não devem nunca usar o traço `RefreshDatabase`. O traço `RefreshDatabase` alavanca transações de banco de dados que não serão aplicáveis ou disponíveis em solicitações HTTP. Em vez disso, existem duas opções: o traço `DatabaseMigrations` e o traço `DatabaseTruncation`.

<a name="reset-migrations"></a>
#### Usando Migrações de Banco de Dados

 O comportamento da `trait DatabaseMigrations` é executar as migrações do banco de dados antes de cada teste. No entanto, a exclusão e a criação dos bancos de dados para cada teste costumam ser mais lentas que o truncamento das mesmas:

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

 > [AVERIGUAR]
 > Não é possível usar banco de dados SQLite em memória ao executar testes do Dusk. Como o navegador é executado no próprio processo, ele não poderá acessar os bancos de dados em memória de outros processos.

<a name="reset-truncation"></a>
#### Usando o atalho de truncamento da base de dados

 O traço `DatabaseTruncation` irá fazer a migração do seu banco de dados na primeira teste, para garantir que as tabelas foram criadas corretamente. Porém, em testes subsequentes, as tabelas do banco de dados serão simplesmente truncadas - proporcionando um ganho de velocidade ao rodar todas as migrações do seu banco de dados:

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

 Por padrão, esse traço truncará todas as tabelas exceto a tabela `migrations`. Caso deseje personalizar as tabelas que devem ser truncadas, você pode definir uma propriedade `$tablesToTruncate` em sua classe de teste:

 > [!NOTA]
 Se estiver a usar o Pest, você deve definir propriedades ou métodos na classe de base DuskTestCase ou em qualquer classe da qual seu arquivo de teste seja uma extensão.

```php
    /**
     * Indicates which tables should be truncated.
     *
     * @var array
     */
    protected $tablesToTruncate = ['users'];
```

 Como alternativa, você pode definir uma propriedade `$exceptTables` em sua classe de teste para especificar quais tabelas devem ser excluídas do truncamento.

```php
    /**
     * Indicates which tables should be excluded from truncation.
     *
     * @var array
     */
    protected $exceptTables = ['users'];
```

 Para especificar as conexões de banco de dados que devem ter suas tabelas truncais, você pode definir uma propriedade `$connectionsToTruncate` em sua classe de teste:

```php
    /**
     * Indicates which connections should have their tables truncated.
     *
     * @var array
     */
    protected $connectionsToTruncate = ['mysql'];
```

 Se pretender executar um código antes ou depois da truncagem de base de dados, poderá definir os métodos `beforeTruncatingDatabase` e/ou `afterTruncatingDatabase`:

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
### Execução de testes

 Para executar os testes do navegador, execute o comando "Dusk" da Artisan:

```shell
php artisan dusk
```

 Se você tiver falhado o teste na última vez que executou o comando `dusk`, poderá economizar tempo reiniciando os testes que falharam primeiro usando o comando `dusk:fails`:

```shell
php artisan dusk:fails
```

 O comando `dusk` aceita qualquer argumento que seja normalmente aceite pelo executador de teste Pest / PHPUnit, permitindo-lhe, por exemplo, executar apenas os testes para um determinado [grupo](https://docs.phpunit.de/en/10.5/annotations.html#group):

```shell
php artisan dusk --group=foo
```

 > [!AVISO]
 Para obter mais informações sobre como utilizar [Larave Sail](/docs/sail) para gerir o ambiente de desenvolvimento local, consulte a documentação do Sail em

<a name="manually-starting-chromedriver"></a>
#### Iniciar o ChromeDriver manualmente

 Por padrão, o Dusk irá tentar iniciar o ChromeDriver automaticamente. Se isso não funcionar com seu sistema específico, você poderá iniciar o ChromeDriver manualmente antes de executar o comando `dusk`. Se optar por iniciar o ChromeDriver manualmente, deve fazer uma marcação (comment) na seguinte linha do arquivo `tests/DuskTestCase.php`:

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

 Além disso, se você iniciar o ChromeDriver em uma porta diferente da 9515, é preciso modificar o método driver da mesma classe para refletir a porta correta.

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
### Manuseamento do ambiente

 Para forçar o uso do próprio arquivo de ambiente do Dusk durante os testes, crie um arquivo `.env.dusk.{environment}` na raiz do seu projeto. Por exemplo, se você estiver iniciando o comando `dusk` a partir do ambiente `local`, deve criar um arquivo `.env.dusk.local`.

 Quando estiver a executar testes, o Dusk vai fazer backup do seu ficheiro `.env` e renomeá-lo para `.env` depois dos testes terem terminado, será restaurado o seu ficheiro `.env`.

<a name="browser-basics"></a>
## Conceitos Básicos do Navegador

<a name="creating-browsers"></a>
### Criando browsers

 Para começar, vamos escrever um teste que verifique se podemos entrar em nossa aplicação. Depois de gerar um teste, podemos modificá-lo para navegar até a página de login, inserir algumas credenciais e clicar no botão "Login". Para criar uma instância do browser, você pode chamar o método `browse` dentro do seu teste Dusk:

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

 Como pode ver no exemplo acima, o método `browse` aceita um bloco de closures. Uma instância do browser é automaticamente passada para este bloco por Dusk e é o objeto principal utilizado para interagir com a aplicação e fazer asserções contra a mesma.

<a name="creating-multiple-browsers"></a>
#### Criando vários navegadores

 Às vezes você pode precisar de vários navegadores para realizar um teste corretamente. Por exemplo, pode ser necessário testar uma tela de bate-papo que interage com WebSockets. Para criar vários navegadores, basta adicionar mais argumentos do navegador à assinatura da ação encerrada dada ao método `browse`:

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

 O método `visit` pode ser usado para navegar até um URI especifico na sua aplicação:

```php
    $browser->visit('/login');
```

 Você pode usar o método `visitRoute` para navegar até uma rota nomeada:

```php
    $browser->visitRoute('login');
```

 Você pode usar os métodos `back` e `forward` para navegar "atrás" e "ahead":

```php
    $browser->back();

    $browser->forward();
```

 Pode usar o método `refresh` para atualizar a página:

```php
    $browser->refresh();
```

<a name="resizing-browser-windows"></a>
### Redimensionar janelas do navegador

 Pode utilizar o método `resize` para ajustar o tamanho da janela do navegador:

```php
    $browser->resize(1920, 1080);
```

 O método `maximize` pode ser usado para maximizar a janela do navegador:

```php
    $browser->maximize();
```

 O método `fitContent` redimensiona a janela do navegador de modo a coincidir com o tamanho dos conteúdos:

```php
    $browser->fitContent();
```

 Quando um teste falhar, o Dusk redimensionará automaticamente o navegador para caber seu conteúdo antes de tirar uma captura de tela. Você pode desativar este recurso chamando o método `disableFitOnFailure` no teste:

```php
    $browser->disableFitOnFailure();
```

 É possível utilizar o método `move` para mover a janela do browser para uma posição diferente no ecrã:

```php
    $browser->move($x = 100, $y = 100);
```

<a name="browser-macros"></a>
### Macro de navegador

 Se pretender definir um método personalizado do browser que poderá reutilizar em vários testes, pode usar o método `macro` na classe `Browser`. Normalmente deve chamar este método no método `boot` de um [fornecedor de serviços](/docs/providers):

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

 A função `macro` aceita um nome como primeiro argumento e uma chave de closure como segundo. O bloco da macro será executado ao chamarmos a macro como método em uma instância do `Browser`:

```php
    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit('/pay')
                ->scrollToElement('#credit-card-details')
                ->assertSee('Enter Credit Card Details');
    });
```

<a name="authentication"></a>
### Autenticação

 Muitas vezes, você estará testando páginas que requerem autenticação. Você pode usar o método `loginAs` do Dusk para evitar interagir com a tela de login da sua aplicação durante cada teste. O método `loginAs` aceita uma chave primária associada ao seu modelo autenticável ou uma instância de modelo autenticável:

```php
    use App\Models\User;
    use Laravel\Dusk\Browser;

    $this->browse(function (Browser $browser) {
        $browser->loginAs(User::find(1))
              ->visit('/home');
    });
```

 > [!AVISO]
 > Após a utilização do método `loginAs`, a sessão de usuário será mantida para todos os testes dentro desse arquivo.

<a name="cookies"></a>
### Cookies

 Você pode usar o método `cookie` para obter ou definir um valor de cookie criptografado. Por padrão, todos os cookies criados pelo Laravel são criptografados:

```php
    $browser->cookie('name');

    $browser->cookie('name', 'Taylor');
```

 Você pode usar o método `plainCookie` para obter ou definir o valor de um cookie não encriptado:

```php
    $browser->plainCookie('name');

    $browser->plainCookie('name', 'Taylor');
```

 Pode utilizar o método `deleteCookie` para excluir um determinado cookies:

```php
    $browser->deleteCookie('name');
```

<a name="executing-javascript"></a>
### Executar Javascript

 Você pode usar o método `script` para executar instruções de script em Java Script no navegador:

```php
    $browser->script('document.documentElement.scrollTop = 0');

    $browser->script([
        'document.body.scrollTop = 0',
        'document.documentElement.scrollTop = 0',
    ]);

    $output = $browser->script('return window.location.pathname');
```

<a name="taking-a-screenshot"></a>
### Fazendo uma captura de tela

 É possível utilizar o método `screenshot` para efetuar uma captura de tela e armazená-la com o nome indicado. Todas as capturas serão armazenadas na pasta `tests/Browser/screenshots`:

```php
    $browser->screenshot('filename');
```

 O método `responsiveScreenshots` pode ser usado para capturar uma série de capturas de tela em vários pontos de interrupção:

```php
    $browser->responsiveScreenshots('filename');
```

 O método `screenshotElement` pode ser usado para capturar uma imagem de um elemento específico da página.

```php
    $browser->screenshotElement('#selector', 'filename');
```

<a name="storing-console-output-to-disk"></a>
### Armazenando saída de console em disco

 Pode utilizar a função `storeConsoleLog` para escrever o conteúdo de saída da consola do browser no disco, com o nome de ficheiro indicado. O conteúdo será guardado na pasta `tests/Browser/console`:

```php
    $browser->storeConsoleLog('filename');
```

<a name="storing-page-source-to-disk"></a>
### Armazenando o código-fonte da página em disco

 Você pode usar o método `storeSource` para gravar o código-fonte da página atual no disco com o nome de arquivo especificado. O código-fonte será salvo na pasta `tests/Browser/source`:

```php
    $browser->storeSource('filename');
```

<a name="interacting-with-elements"></a>
## Interagindo com elementos

<a name="dusk-selectors"></a>
### Selecionadores do crepúsculo

 Escolher bons seletores de CSS para interagir com os elementos é uma das partes mais difíceis do processo de escrever testes no Dusk. Com o passar do tempo, as mudanças da interface podem quebrar os seguintes selectores:

```php
    // HTML...

    <button>Login</button>

    // Test...

    $browser->click('.login-page .container div > button');
```

 Os seletores do Dusk permitem-lhe concentrar-se na escrita de testes eficazes ao invés de ter de se lembrar de seletores CSS. Para definir um selector, adicione o atributo `dusk` a seu elemento HTML. Em seguida, ao interagir com um navegador do Dusk, prefira o selctor com o símbolo `@` para manipular os elementos anexados no seu teste:

```php
    // HTML...

    <button dusk="login-button">Login</button>

    // Test...

    $browser->click('@login-button');
```

 Se desejar, poderá personalizar o atributo HTML que é utilizado pelo seletor Dusk através do método `selectorHtmlAttribute`. Normalmente, esse método deve ser chamado no método `boot` do seu `AppServiceProvider`:

```php
    use Laravel\Dusk\Dusk;

    Dusk::selectorHtmlAttribute('data-dusk');
```

<a name="text-values-and-attributes"></a>
### Texto, valores e atributos

<a name="retrieving-setting-values"></a>
#### Recuperação e definição de valores

 A hora de entardecer fornece vários métodos para interagir com o valor atual, exibição do texto e atributos dos elementos na página. Por exemplo, para obter o "valor" de um elemento que corresponda a um determinado seletor CSS ou Dusk, use o método `value`:

```php
    // Retrieve the value...
    $value = $browser->value('selector');

    // Set the value...
    $browser->value('selector', 'value');
```

 Pode utilizar o método `inputValue`, para obter o valor de um elemento de entrada com um determinado nome do campo:

```php
    $value = $browser->inputValue('field');
```

<a name="retrieving-text"></a>
#### Recuperação de texto

 O método `text` pode ser utilizado para recuperar o texto de exibição de um elemento que corresponda ao seletor indicado:

```php
    $text = $browser->text('selector');
```

<a name="retrieving-attributes"></a>
#### Recuperação de atributos

 Por último, o método `attribute` pode ser utilizado para recuperar o valor de um atributo correspondente a um elemento que corresponde ao seletor especificado.

```php
    $attribute = $browser->attribute('selector', 'value');
```

<a name="interacting-with-forms"></a>
### Interagindo com formulários

<a name="typing-values"></a>
#### Digite os valores

 O Dusk permite vários métodos de interação com formulários e elementos de entrada. Primeiro, vamos ver um exemplo de digitação de texto em um campo de entrada:

```php
    $browser->type('email', 'taylor@laravel.com');
```

 Note que, embora o método aceite um se necessário, não é obrigatório passar um selecionador de CSS para o método `type`. Se não fornecido um selecionador de CSS, Dusk procurará por um campo `input` ou `textarea` com o atributo `name`.

 Para anexar um texto a um campo sem apagar seu conteúdo, você pode usar o método `append`:

```php
    $browser->type('tags', 'foo')
            ->append('tags', ', bar, baz');
```

 É possível apagar o valor de uma entrada usando o método `clear`:

```php
    $browser->clear('email');
```

 Pode instruir o `typeSlowly` a digitar lentamente utilizando o método `typeSlowly`. Por defeito, o Dusk pausa durante 100 milésimos de segundo entre os toques de tecla. Para personalizar o tempo de pausa entre as toques de tecla, pode passar a quantidade adequada de milésimos de segundo como terceiro argumento ao método:

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
#### Opções de drop-down

 Para selecionar um valor disponível num elemento `select`, pode utilizar o método `select`. À semelhança do que sucede com o método `type`, o método `select` não requer um seletor CSS completo. Quando for passar um valor para o método `select`, deve passar o seu valor subjacente em vez da sua apresentação:

```php
    $browser->select('size', 'Large');
```

 Você pode selecionar uma opção aleatória, omitindo o segundo argumento:

```php
    $browser->select('size');
```

 Ao fornecer uma matriz como segundo argumento do método `select`, você pode instruir o método a selecionar várias opções.

```php
    $browser->select('categories', ['Art', 'Music']);
```

<a name="checkboxes"></a>
#### Caixas de seleção

 Para "marcar" um campo de caixa de seleção, você pode usar o método `check`. Como em vários outros métodos relacionados à entrada, não é necessário um selecionador completo do CSS. Se não for possível encontrar uma correspondência com um selecionador do CSS, Dusk procurará por um campo de caixa de seleção com um atributo `name` igual:

```php
    $browser->check('terms');
```

 O método `uncheck` pode ser usado para desmarcar uma opção de seleção:

```php
    $browser->uncheck('terms');
```

<a name="radio-buttons"></a>
#### Opções de Rádio

 Para selecionar uma opção de entrada `rádio`, pode utilizar o método `rádio`. Como vários outros métodos relacionados com entradas, não é necessário um selector CSS completo. Se não conseguir encontrar nenhuma correspondência através de um selector CSS, Dusk irá procurar uma entrada `rádio` com atributos `name` e `value` que correspondam:

```php
    $browser->radio('size', 'large');
```

<a name="attaching-files"></a>
### Anexação de arquivos

 O método `attach` pode ser usado para anexar um arquivo ao elemento de input `file`. Como muitos outros métodos relacionados com entradas, não é necessário um selector CSS completo. Se o correspondente de um selector CSS não puder ser encontrado, Dusk procurará uma entrada de tipo "arquivo" com um atributo `name` que combine:

```php
    $browser->attach('photo', __DIR__.'/photos/mountains.png');
```

 > [AVERIGUAR]
 > A função de anexar requer que a extensão Zip do PHP esteja instalada e ativada no seu servidor.

<a name="pressing-buttons"></a>
### Aperte os botões

 O método `press` pode ser usado para clicar em um botão na página. O argumento dado ao método `press` pode ser o texto exibido do botão ou um seletor CSS/Dusk:

```php
    $browser->press('Login');
```

 Ao submeter os formulários, muitas aplicações desativam o botão de envio do formulário depois que é pressionado e, em seguida, ativam novamente o botão quando a solicitação HTTP para o envio do formulário estiver completa. Para pressionar um botão e aguardar que o botão seja reativado, pode usar o método `pressAndWaitFor`:

```php
    // Press the button and wait a maximum of 5 seconds for it to be enabled...
    $browser->pressAndWaitFor('Save');

    // Press the button and wait a maximum of 1 second for it to be enabled...
    $browser->pressAndWaitFor('Save', 1);
```

<a name="clicking-links"></a>
### Clicar em links

 Para clicar em um link, você pode usar o método `clickLink` na instância de navegador. O método `clickLink` clica no link que tem o texto exibido especificado a seguir:

```php
    $browser->clickLink($linkText);
```

 Você pode usar o método `seeLink` para determinar se um link com o texto de exibição fornecido está visível na página:

```php
    if ($browser->seeLink($linkText)) {
        // ...
    }
```

 > [AVISO]
 > Estes métodos interagem com o jQuery. Se este não estiver disponível na página, o Dusk injetará automaticamente no sítio e irá disponibilizá-lo durante a duração do teste.

<a name="using-the-keyboard"></a>
### Usando o teclado

 O método `keys` permite que forneça sequências de digitação mais complexas a um dado elemento do que o normalmente permitido pelo método `type`. Por exemplo, pode instruir o Dusk para manter teclas de modifier enquanto introduz valores. Neste exemplo, será mantida a tecla de `shift` enquanto são digitados os caracteres de entrada correspondentes ao elemento com o seletor fornecido. Após terem sido digitados os caracteres, serão digitados os caracteres seguintes sem qualquer tecla de modifier:

```php
    $browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

 Um outro caso de utilização valioso para o método `keys` é enviar uma combinação de atalho para o seletor primário de CSS da sua aplicação:

```php
    $browser->keys('.app', ['{command}', 'j']);
```

 > [!ATENÇÃO]
 [Encontrado neste endereço do GitHub (https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php)].

<a name="fluent-keyboard-interactions"></a>
#### Interações do teclado fluentes

 O Dusk também disponibiliza um método `withKeyboard`, que permite executar complexas interações com o teclado de forma fluida, através da classe `Laravel\Dusk\Keyboard`. As classes `Keyboard` fornecem os métodos `press`, `release`, `type` e `pause`:

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
#### Máscaras de teclado

 Se deseja definir interações personalizadas do teclado que você possa facilmente reutilizar em toda a sua suite de testes, pode usar o método `macro` provido pela classe `Keyboard`. Normalmente, deve chamar este método num método `boot` do [fornecedor de serviços] (/docs/providers):

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

 A função `macro` aceita um nome como primeiro argumento e uma chave de regressão como segundo. Quando a macro for chamada como método em uma instância de `Keyboard`, a chave de regressão será executada:

```php
    $browser->click('@textarea')
        ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->copy())
        ->click('@another-textarea')
        ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->paste());
```

<a name="using-the-mouse"></a>
### Usando o rato

<a name="clicking-on-elements"></a>
#### Clicando em Elementos

 O método `click` pode ser usado para clicar em um elemento que corresponda ao seletor do CSS ou Dusk fornecido.

```php
    $browser->click('.selector');
```

 É possível usar o método `clickAtXPath` para clicar em um elemento que corresponda a expressão XPath fornecida:

```php
    $browser->clickAtXPath('//div[@class = "selector"]');
```

 O método `clickAtPoint` pode ser usado para clicar no elemento mais alto em um dado par de coordenadas relativas à área visível do navegador.

```php
    $browser->clickAtPoint($x = 0, $y = 0);
```

 O método `doubleClick` pode ser utilizado para simular o clique duplo do rato:

```php
    $browser->doubleClick();

    $browser->doubleClick('.selector');
```

 O método `rightClick` pode ser usado para simular o clique direito de um rato:

```php
    $browser->rightClick();

    $browser->rightClick('.selector');
```

 O método `clickAndHold` pode ser usado para simular o clique e o pressionamento de um botão do rato. Um chamada subseqüente ao método `releaseMouse` desfaria este comportamento e soltava o botão:

```php
    $browser->clickAndHold('.selector');

    $browser->clickAndHold()
            ->pause(1000)
            ->releaseMouse();
```

 O método `controlClick` pode ser usado para simular o evento de clique com a tecla Ctrl no navegador.

```php
    $browser->controlClick();

    $browser->controlClick('.selector');
```

<a name="mouseover"></a>
#### Rato de navegação

 O método `mouseover` pode ser usado quando você precisa mover o rato sobre um elemento que corresponde ao seletor de CSS ou Dusk fornecido:

```php
    $browser->mouseover('.selector');
```

<a name="drag-drop"></a>
#### Arraste e Solte

 O método `drag` pode ser usado para arrastar um elemento que corresponda ao seletor fornecido para outro elemento:

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

 Finalmente, você pode arrastar um elemento por uma posição de deslocamento especificada:

```php
    $browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a name="javascript-dialogs"></a>
### Diálogos em JavaScript

 O Dusk oferece vários métodos de interação com diálogos do JavaScript. Por exemplo, você pode usar o método `waitForDialog` para esperar que um diálogo do JavaScript seja aberto. Este método aceita um argumento opcional indicando quantos segundos deve ser feito a espera:

```php
    $browser->waitForDialog($seconds = null);
```

 O método `assertDialogOpened` pode ser usado para afirmar que um diálogo foi exibido e contém a mensagem especificada.

```php
    $browser->assertDialogOpened('Dialog message');
```

 Se o diálogo JavaScript possuir um prompt, você pode usar a metodologia `typeInDialog` para digitar um valor no prompt:

```php
    $browser->typeInDialog('Hello World');
```

 Para fechar um diálogo JavaScript em aberto ao clicar no botão "OK", pode ser utilizada a metodologia `acceptDialog`:

```php
    $browser->acceptDialog();
```

 Para fechar um diálogo JavaScript em aberto clicando no botão "Cancelar", você pode invocar o método `dismissDialog`:

```php
    $browser->dismissDialog();
```

<a name="interacting-with-iframes"></a>
### Como interagir com quadros em linha

 Se você precisar interagir com elementos dentro de um iframe, poderá usar o método `withinFrame`. Todas as interações do elemento que ocorrem no âmbito da fechadura fornecida ao método `withinFrame` serão orientadas para o contexto do iframe especificado:

```php
    $browser->withinFrame('#credit-card-details', function ($browser) {
        $browser->type('input[name="cardnumber"]', '4242424242424242')
            ->type('input[name="exp-date"]', '1224')
            ->type('input[name="cvc"]', '123')
            ->press('Pay');
    });
```

<a name="scoping-selectors"></a>
### Selecionando o escopo

 Às vezes, você pode querer executar várias operações enquanto aplicá-las ao seletor fornecido. Por exemplo, você talvez queira garantir que algum texto existe apenas dentro de uma tabela e depois clicar em um botão dentro dessa tabela. Para isso, utilize o método `with`. Todas as operações realizadas no closure fornecido ao método `with` serão aplicáveis ao seletor original:

```php
    $browser->with('.table', function (Browser $table) {
        $table->assertSee('Hello World')
              ->clickLink('Delete');
    });
```

 Você pode, ocasionalmente, precisar executar asserções fora do escopo atual. Use os métodos `elsewhere` e `elsewhereWhenAvailable` para fazer isso:

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
### Esperando pelos elementos

 Ao testar aplicativos que utilizam JavaScript intensivamente, frequentemente é necessário "esperar" que certos elementos ou dados estejam disponíveis antes de continuar com o teste. O Dusk facilita essa tarefa. Você pode aguardar a visibilidade dos elementos na página ou até mesmo esperar que uma expressão JavaScript seja verdadeira.

<a name="waiting"></a>
#### Espera

 Caso você só queira pausar o teste por um determinado número de milésimos de segundo, utilize o método `pause`:

```php
    $browser->pause(1000);
```

 Se você precisar pausar o teste somente se uma determinada condição for `verdadeira`, utilize o método `pauseIf`:

```php
    $browser->pauseIf(App::environment('production'), 1000);
```

 Do mesmo modo, se você precisar pausar o teste a menos que uma determinada condição seja `verdadeira`, você poderá usar o método `pauseUnless`:

```php
    $browser->pauseUnless(App::environment('testing'), 1000);
```

<a name="waiting-for-selectors"></a>
#### Esperando pelos selecionadores

 O método `waitFor` pode ser utilizado para pausar o teste até que o elemento correspondente ao seletor de CSS ou Dusk for apresentado na página. Por defeito, isso fará com que o teste seja interrompido durante um período máximo de cinco segundos antes de ser lançada uma exceção. Se necessário, pode passar um valor limite personalizado como segundo argumento:

```php
    // Wait a maximum of five seconds for the selector...
    $browser->waitFor('.selector');

    // Wait a maximum of one second for the selector...
    $browser->waitFor('.selector', 1);
```

 Também é possível esperar até que o elemento correspondente ao seletor tenha o texto especificado:

```php
    // Wait a maximum of five seconds for the selector to contain the given text...
    $browser->waitForTextIn('.selector', 'Hello World');

    // Wait a maximum of one second for the selector to contain the given text...
    $browser->waitForTextIn('.selector', 'Hello World', 1);
```

 Pode também esperar até o elemento que corresponde ao seletor especificado desaparecer da página:

```php
    // Wait a maximum of five seconds until the selector is missing...
    $browser->waitUntilMissing('.selector');

    // Wait a maximum of one second until the selector is missing...
    $browser->waitUntilMissing('.selector', 1);
```

 Ou pode esperar até que o elemento correspondente ao seletor for ativado ou desativado:

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
#### Definição de seletores disponíveis

 Ocasionalmente, pode ser necessário aguardar a aparecimento de um elemento que corresponda a um determinado seletor e, em seguida, interagir com o elemento. Por exemplo, tal como esperado, é possível aguardar que uma janela modal esteja disponível e, então, pressione o botão "OK" da janela modal. O método `whenAvailable` pode ser utilizado para satisfazer esta necessidade. Todas as operações em elementos executadas no bloco de código fornecido estarão limitadas ao seletor original:

```php
    $browser->whenAvailable('.modal', function (Browser $modal) {
        $modal->assertSee('Hello World')
              ->press('OK');
    });
```

<a name="waiting-for-text"></a>
#### Esperando por texto

 O método `waitForText` pode ser usado para esperar até o texto definido ser exibido na página:

```php
    // Wait a maximum of five seconds for the text...
    $browser->waitForText('Hello World');

    // Wait a maximum of one second for the text...
    $browser->waitForText('Hello World', 1);
```

 Pode utilizar o método `waitUntilMissingText` para aguardar que o texto exibido tenha sido removido da página.

```php
    // Wait a maximum of five seconds for the text to be removed...
    $browser->waitUntilMissingText('Hello World');

    // Wait a maximum of one second for the text to be removed...
    $browser->waitUntilMissingText('Hello World', 1);
```

<a name="waiting-for-links"></a>
#### Esperando por Ligações

 O método `waitForLink` pode ser usado para esperar até que o texto de ligação especificado seja exibido na página.

```php
    // Wait a maximum of five seconds for the link...
    $browser->waitForLink('Create');

    // Wait a maximum of one second for the link...
    $browser->waitForLink('Create', 1);
```

<a name="waiting-for-inputs"></a>
#### Esperando Entradas

 O método `waitForInput` pode ser utilizado para esperar até que o campo de entrada especificado esteja visível na página:

```php
    // Wait a maximum of five seconds for the input...
    $browser->waitForInput($field);

    // Wait a maximum of one second for the input...
    $browser->waitForInput($field, 1);
```

<a name="waiting-on-the-page-location"></a>
#### Esperando a localização da página

 Ao fazer uma afirmação de caminho, como `$browser->assertPathIs('/home')`, a afirmação pode falhar se o `window.location.pathname` estiver sendo atualizado asincrônicamente. Você poderá usar o método `waitForLocation` para aguardar que o local tenha um determinado valor:

```php
    $browser->waitForLocation('/secret');
```

 O método `waitForLocation` também pode ser utilizado para esperar até que a localização da janela seja uma URL totalmente qualificada.

```php
    $browser->waitForLocation('https://example.com/path');
```

 Também é possível aguardar para um local de uma rota com nome (/docs/routing#named-routes):

```php
    $browser->waitForRoute($routeName, $parameters);
```

<a name="waiting-for-page-reloads"></a>
#### Esperando a recarga de páginas

 Caso precise aguardar o carregamento de uma página após executar alguma ação, utilize o método `waitForReload`:

```php
    use Laravel\Dusk\Browser;

    $browser->waitForReload(function (Browser $browser) {
        $browser->press('Submit');
    })
    ->assertSee('Success!');
```

 Dado que o facto de terem de esperar pela recarga da página é habitual quando clicam num botão, podem utilizar a método `clickAndWaitForReload` por conveniência:

```php
    $browser->clickAndWaitForReload('.selector')
            ->assertSee('something');
```

<a name="waiting-on-javascript-expressions"></a>
#### Esperando por expressões em JavaScript

 Às vezes você pode querer pausar a execução de um teste até que uma expressão JavaScript determinada seja avaliada como `true`. Isso pode ser feito facilmente utilizando o método `waitUntil`, quando você passa uma expressão para este método, não precisa incluir a palavra-chave `return` ou um ponto e vírgula final:

```php
    // Wait a maximum of five seconds for the expression to be true...
    $browser->waitUntil('App.data.servers.length > 0');

    // Wait a maximum of one second for the expression to be true...
    $browser->waitUntil('App.data.servers.length > 0', 1);
```

<a name="waiting-on-vue-expressions"></a>
#### Esperando pela expressão Vue

 Os métodos `waitUntilVue` e `waitUntilVueIsNot` podem ser usados para aguardar até que um atributo de [componente Vue](https://vuejs.org) tenha um determinado valor:

```php
    // Wait until the component attribute contains the given value...
    $browser->waitUntilVue('user.name', 'Taylor', '@user');

    // Wait until the component attribute doesn't contain the given value...
    $browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a name="waiting-for-javascript-events"></a>
#### Esperando por eventos do JavaScript

 O método `waitForEvent` pode ser usado para fazer com que a execução de um teste seja pausada até ocorrer um evento JavaScript.

```php
    $browser->waitForEvent('load');
```

 O evento escuta é anexado ao âmbito atual, que por padrão é o elemento `body`. Ao usar um selecto com escopo, a escuta de eventos será anexada ao elemento correspondente:

```php
    $browser->with('iframe', function (Browser $iframe) {
        // Wait for the iframe's load event...
        $iframe->waitForEvent('load');
    });
```

 É também possível fornecer um seletor como o segundo argumento para a função `waitForEvent` para ligar o escutador de eventos a um elemento específico:

```php
    $browser->waitForEvent('load', '.selector');
```

 Você também pode aguardar eventos nos objetos `document` e `window`:

```php
    // Wait until the document is scrolled...
    $browser->waitForEvent('scroll', 'document');

    // Wait a maximum of five seconds until the window is resized...
    $browser->waitForEvent('resize', 'window', 5);
```

<a name="waiting-with-a-callback"></a>
#### Esperando por uma chamada de retorno

 Muitos dos métodos "esperar" de Dusk dependem do método subjacente `waitUsing`. Você pode usar este método diretamente para esperar que um determinado fecho retorne `true`. O método `waitUsing` aceita o número máximo de segundos a espera, o intervalo no qual o fecho deve ser avaliado, o próprio fecho e uma mensagem de falha opcional:

```php
    $browser->waitUsing(10, 1, function () use ($something) {
        return $something->isReady();
    }, "Something wasn't ready in time.");
```

<a name="scrolling-an-element-into-view"></a>
### Deslocando um elemento para ser visualizado

 Por vezes, pode não ser possível clicar num determinado elemento porque este está fora da área visível do navegador. O método `scrollIntoView` faz com que o browser window faça a rolagem até que o elemento selecionado esteja dentro da vista:

```php
    $browser->scrollIntoView('.selector')
            ->click('.selector');
```

<a name="available-assertions"></a>
## Asserções disponíveis

 O crepúsculo disponibiliza várias afirmações que pode executar contra o seu aplicativo. Todas as afirmações disponíveis estão documentadas na lista abaixo:

<style>
 .collection-method-list > p {
 colunas: 10,8em 3; -moz-colunas: 10,8em 3; -webkit-colunas: 10,8em 3;
 }

 .collection-method-list a {
 display: bloqueado;
 overflow: oculto;
 texto-sobrante: elipse;
 espaço-em- branco: não intercalar linhas;
 }
</style>

<div class="collection-method-list" markdown="1">

 [afirmar título (#assert-title)](#assert-title)
 [assertTitleContains (#assert-title-contains)]
 [assertUrlIs (# assertUrlIs)](/misc/assert_url_is.html)
 [assertSchemeIs(#assert-scheme-is)
 [afirmarEsquemaNão é válido(a)#afirmarSchemeNão é válido(a)
 [afirmar que o host é ocorrer?](#afirmar-que-o-host-é-)
 [afirmar que o host não é](#afirmar-que-o-host-não-é)
 [verificar se o porto existe (#assert-port-is)
 [afirmarQueNãoÉUmaPorte](#afirmarQueNãoÉUmaPorte)
 [assertPathBeginsWith](#assert-path-begins-with)
 [afirmar que o caminho termina com](#afirmar-que-o-caminho-termina-)
 [assertPathContains (# assert-path-contains)]
 [afirmar caminho como válido (#afirmar-caminho-como-valido)](/help/show/pt/article/76952/)
 [afirmar que o caminho não é validado](#afirmar-que-o-caminho-não-é-validado)
 [assegurar que a rota existe](#assegurar-que-a-rota-existe)
 [assegurar que a string de consulta existe?](#assegurar-que-a-string-de-consulta-existe?)
 [afirmar faltam parâmetros de consulta (#afirmar-faltam-parámetros-de-consulta?)]
 [afirmarSeFragmenteExistem](#afirmar-se-fragmentos-existem)
 [assertFragmentBeginsWith](#assert-fragment-begins-with)
 [asserte que o fragmento não é nenhum dos seguintes](#afirmar-que-fragmento-não-é-nenhuma-das-seguintes-opções)
 [afirmarHáCookie=#afirmar-tem-cookie]
 [afirmar tem o cookie simples?](#afirmar-tem-o-cookie-simples?)
 [assegurar que o cookie não está faltando] (##assert-cookie-missing)
 [assertPlainCookieMissing](#assert-plain-cookie-missing)
 [assegurar o valor do cookie] (#assegurar-o-valor-do-cookie)
 [asser valor simples de cookie](#asser-valor-simples-de-cookie)
 [afirmarVerificar](#afirmarverificar)
 [afirmar que não viu (#afirmar-que-não-viu)](/c?p=12649053)
 [afirmar ver dentro de](#afirmar-ver-dentro-de)
 [afirmarQueNãoVeNo#afirmarThatYouDoNotSeeIn]
 [afirmar ver algo aqui](#afirmar-ver-algo-aqui)
 [afirmarVerNada(#afirmar-ver-nada)](/assert-see-nothing-in)
 [assertScript (# assert-script)]
 [afirme que a fonte existe](#afirmar-que-a-fonte-existe)
 [fonteNãoEncontrada(#fonteNãoEncontrada)](asserttabMissing)
 [assertVerSeeLink](#assert-ver-see-link)
 [afirmarQueNãoVejoOLink (#afirmarThatIWon'tSeeTheLink)]
 [assegurar valor de entrada] (##assert-input-value)
 [assertInputValueIsNot (#assert-input-value-is-not)]
 [verificarChecado (# assert-checked)?]
 [afirmar Não Verificado](#afirmando-não-verificado)
 [afirmar Indeterminado (#affirm-indeterminate)]
 [assertRadioSelected()#assert-radio-selected]
 [afirmar que um rádio não está selecionado (#afirmar-que-um-rádio-não-está-selecionado)](/assert-radio-not-selected)
 [assertSelected](#assert-selected)
 [assertNotSelected (#assert-not-selected)]
 [afirmar que o select tem opções] (##assert-select-has-options)
 [verificar se existem opções ausentes no selector] (#verificar-se-existem-opcoes-ausentes-no-selector)
 [asserQueOSelecionadoTemUmaOpção](#asserqueoSelecionadotemumaopção)
 [assegurar opção ausente (#assegurar-opcao-ausente)?]
 [Assert value (# assert-value)](/assert-value)
 [assertValueIsNot (#assert-value-is-not)]
 [assertAttribute (# assert-attribute)]
 [assertAttributeContains](#assert-attribute-contains)
 [assertaAttributeNãoContém#assert-attribute-doesnt-contain]
 [afirmar atributo ARIA (#afirmar-atributo-ARIA)](/afirmar-atributo-ARIA)
 [assertDataAttribute(#assert-data-attribute)
 [afirmar visível (#assert-visible)](/pt-br/using-assertions "Usando asserções")
 [assertPresent](#assert-present)
 [afirmar NÃO está presente] (##assert-not-present)
 [assertMissing(#assert-missing)]
 [verificar se a entrada está presente (#assert-input-present)]
 [assertInputMissing](#assert-input-missing)
 [assertDialogOpened (# assert-dialog-opened)
 [assertEnabled (# assert-enabled)]
 [assertDisabled](#assert-disabled)
 [Verificar botão habilitado (# assertButtonEnabled)?
 [#assert-button-disabled]
 [asserFocused](#assert-focused)
 # afirmar que a janela não está focada (#afirmar-que-a-janela-não-esta-focada)
 [assegurar autenticação?](#assegurar-autenticação?)
 [afirmar hóspede (#afirmar-hóspede?)]
 [afirmar que o login está autenticado como](#afirmar-que-o-login-esta-autenticado-como)
 (assertVue#assert-vue)
 [afirmar que Vue não está presente.](#afirmar-que-vue-não-está-presente)
 [assertVueContains (# assert-vue-contains)]
 [assertVueDoesntContain (# assert-vue-doesnt-contain)]

</div>

<a name="assert-title"></a>
#### afirmarTítulo

 Afirme que o título da página coincide com o texto apresentado:

```php
    $browser->assertTitle($title);
```

<a name="assert-title-contains"></a>
#### afirma que o título contém

 Afirmar que o título da página contém o texto indicado:

```php
    $browser->assertTitleContains($title);
```

<a name="assert-url-is"></a>
#### assertUrlIs

 Afirmar que a URL atual (sem a cadeia de consulta) coincide com o texto fornecido:

```php
    $browser->assertUrlIs($url);
```

<a name="assert-scheme-is"></a>
#### afirmaScheme

 Afirme que o esquema de URL atual coincide com o esquema especificado:

```php
    $browser->assertSchemeIs($scheme);
```

<a name="assert-scheme-is-not"></a>
#### assertaQueÉNão

 Afirme que o esquema de URL atual não corresponde ao esquema fornecido:

```php
    $browser->assertSchemeIsNot($scheme);
```

<a name="assert-host-is"></a>
#### assertHostIs

 Afirmar que o anfitrião da atual URL corresponde ao anfitrião indicado:

```php
    $browser->assertHostIs($host);
```

<a name="assert-host-is-not"></a>
#### assertHostIsNot

 Afirme que o atual host da URL não corresponde ao host fornecido:

```php
    $browser->assertHostIsNot($host);
```

<a name="assert-port-is"></a>
#### assertaPonta

 Afirmar que a porta da URL atual corresponde à indicada:

```php
    $browser->assertPortIs($port);
```

<a name="assert-port-is-not"></a>
#### assertPortIsNot

 Assegure-se de que a porta atual da URL não coincide com o número indicado:

```php
    $browser->assertPortIsNot($port);
```

<a name="assert-path-begins-with"></a>
#### assertequeAStringComeçaCom

 Afirme que o caminho da URL atual começa com o caminho especificado:

```php
    $browser->assertPathBeginsWith('/home');
```

<a name="assert-path-ends-with"></a>
#### assertPathEndsWith

 Afirme que o atual caminho da URL termina com o caminho fornecido:

```php
    $browser->assertPathEndsWith('/home');
```

<a name="assert-path-contains"></a>
#### assertPathContains

 Afirmar que o caminho do URL atual inclui o caminho indicado:

```php
    $browser->assertPathContains('/home');
```

<a name="assert-path-is"></a>
#### assertPathIs

 Afirme que o caminho atual coincide com o caminho especificado:

```php
    $browser->assertPathIs('/home');
```

<a name="assert-path-is-not"></a>
#### assertPathIsNot

 Afirmar que o caminho atual não coincide com o caminho especificado:

```php
    $browser->assertPathIsNot('/home');
```

<a name="assert-route-is"></a>
#### assertRouteIs

 Afirme que a URL atual coincide com o nome da rota (/ docs/routing#named-routes):

```php
    $browser->assertRouteIs($name, $parameters);
```

<a name="assert-query-string-has"></a>
#### afirmar que a string de consulta existe

 Afirme que o parâmetro de consulta fornecido está presente:

```php
    $browser->assertQueryStringHas($name);
```

 Afirme que o parâmetro de consulta fornecido está presente e tem um determinado valor:

```php
    $browser->assertQueryStringHas($name, $value);
```

<a name="assert-query-string-missing"></a>
#### Erro "Não foi encontrado parâmetro de consulta"

 Afirme que o parâmetro de consulta não foi encontrado:

```php
    $browser->assertQueryStringMissing($name);
```

<a name="assert-fragment-is"></a>
#### assertFragmentIs

 Afirme que o fragmento de hash da URL atual coincide com o fragmento indicado:

```php
    $browser->assertFragmentIs('anchor');
```

<a name="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

 Afirme que o pedaço de código hash atual da URL começa com o fragmento fornecido:

```php
    $browser->assertFragmentBeginsWith('anchor');
```

<a name="assert-fragment-is-not"></a>
#### assertFragmentIsNot

 Afirme que o fragmento atual da URL não coincide com o fragmento especificado:

```php
    $browser->assertFragmentIsNot('anchor');
```

<a name="assert-has-cookie"></a>
#### assertHasCookie

 Afirme que o cookie encriptado fornecido está presente:

```php
    $browser->assertHasCookie($name);
```

<a name="assert-has-plain-cookie"></a>
#### assertHasPlainCookie

 Afirmar que o cookie sem criptografia fornecido está presente:

```php
    $browser->assertHasPlainCookie($name);
```

<a name="assert-cookie-missing"></a>
#### Assertion falhou porque um cookie de sessão foi desaparecido.

 Afirme que o cookie encriptado especificado não está presente:

```php
    $browser->assertCookieMissing($name);
```

<a name="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

 Afirmar que o cookie desencarado não está presente:

```php
    $browser->assertPlainCookieMissing($name);
```

<a name="assert-cookie-value"></a>
#### asserttCookieValue

 Afirmar que um cookie criptografado tem um determinado valor:

```php
    $browser->assertCookieValue($name, $value);
```

<a name="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

 Afirmar que um cookie não encriptado tem um determinado valor:

```php
    $browser->assertPlainCookieValue($name, $value);
```

<a name="assert-see"></a>
#### afirmarVerificar

 Afirme que o texto fornecido está presente na página:

```php
    $browser->assertSee($text);
```

<a name="assert-dont-see"></a>
#### afirmar que não se deu a situação esperada

 Afirme que o texto indicado não está presente na página:

```php
    $browser->assertDontSee($text);
```

<a name="assert-see-in"></a>
#### asserteVer(1)

 Afirme que o texto fornecido está presente no seletor:

```php
    $browser->assertSeeIn($selector, $text);
```

<a name="assert-dont-see-in"></a>
#### assertaQueNãoSeEncontra

 Afirmar que o texto indicado não está presente dentro do seletor:

```php
    $browser->assertDontSeeIn($selector, $text);
```

<a name="assert-see-anything-in"></a>
#### Assertão que encontra algo

 Afirme que há um texto qualquer no interior do seletor:

```php
    $browser->assertSeeAnythingIn($selector);
```

<a name="assert-see-nothing-in"></a>
#### Não encontrou nada

 Afirme que não há nenhum texto presente dentro do seletor:

```php
    $browser->assertSeeNothingIn($selector);
```

<a name="assert-script"></a>
#### assertScript

 Afirme que a expressão de JavaScript indicada é igual ao valor indicado:

```php
    $browser->assertScript('window.isLoaded')
            ->assertScript('document.readyState', 'complete');
```

<a name="assert-source-has"></a>
#### afirmar que há fontes

 Afirme que o código-fonte especificado está presente na página:

```php
    $browser->assertSourceHas($code);
```

<a name="assert-source-missing"></a>
#### Assert source is missing.

 Afirmar que o código-fonte indicado não está presente na página:

```php
    $browser->assertSourceMissing($code);
```

<a name="assert-see-link"></a>
#### assertVer Link

 Afirmar que o hiperlink indicado está presente na página

```php
    $browser->assertSeeLink($linkText);
```

<a name="assert-dont-see-link"></a>
#### afirmarNãoVerLigação

 Afirme que o link indicado não está presente na página:

```php
    $browser->assertDontSeeLink($linkText);
```

<a name="assert-input-value"></a>
#### assertInputValue

 Afirme que o campo de entrada apresentado tem um valor específico:

```php
    $browser->assertInputValue($field, $value);
```

<a name="assert-input-value-is-not"></a>
#### assertInputValueIsNot

 Afirmar que o campo de entrada não tem o valor especificado:

```php
    $browser->assertInputValueIsNot($field, $value);
```

<a name="assert-checked"></a>
#### assertChecked

 Afirme que o caixinho de seleção é marcado:

```php
    $browser->assertChecked($field);
```

<a name="assert-not-checked"></a>
#### assertNotChecked

 Afirmar que a caixa de seleção indicada não está marcada:

```php
    $browser->assertNotChecked($field);
```

<a name="assert-indeterminate"></a>
#### asserta indeterminado

 Afirme que o rótulo da caixa de seleção indicada está em estado indeterminado:

```php
    $browser->assertIndeterminate($field);
```

<a name="assert-radio-selected"></a>
#### assertRadioSelected

 Afirme que o campo de rádio fornecido está selecionado:

```php
    $browser->assertRadioSelected($field, $value);
```

<a name="assert-radio-not-selected"></a>
#### assertRádioNãoFoiSelecionado

 Afirmar que o campo de rádio especificado não está selecionado:

```php
    $browser->assertRadioNotSelected($field, $value);
```

<a name="assert-selected"></a>
#### assertSelected

 Afirmar que o drop-down fornecido está selecionado com o valor especificado:

```php
    $browser->assertSelected($field, $value);
```

<a name="assert-not-selected"></a>
#### não selecionado

 Afirme que o item de menção não foi selecionado no menu suspenso fornecido:

```php
    $browser->assertNotSelected($field, $value);
```

<a name="assert-select-has-options"></a>
#### asserteSeTemOpcoes

 Afirme que o(s) valor(es) do array dado está(ão) disponível(is) para serem selecionados:

```php
    $browser->assertSelectHasOptions($field, $values);
```

<a name="assert-select-missing-options"></a>
#### assertaOpcoesFaltam

 Afirmar que o dado conjunto de valores não está disponível para seleção:

```php
    $browser->assertSelectMissingOptions($field, $values);
```

<a name="assert-select-has-option"></a>
#### asserteSeTemUmaOpção

 Afirme que o valor indicado está disponível para ser selecionado no campo fornecido:

```php
    $browser->assertSelectHasOption($field, $value);
```

<a name="assert-select-missing-option"></a>
#### assertSelectMissingOption

 Afirme que o valor indicado não está disponível para ser selecionado:

```php
    $browser->assertSelectMissingOption($field, $value);
```

<a name="assert-value"></a>
#### assertaValor

 Declarar que o elemento correspondente ao seletor fornecido tem o valor especificado:

```php
    $browser->assertValue($selector, $value);
```

<a name="assert-value-is-not"></a>
#### assertValueIsNot

 Afirme que o elemento correspondente ao seletor dado não tem o valor especificado:

```php
    $browser->assertValueIsNot($selector, $value);
```

<a name="assert-attribute"></a>
#### assertAttribute

 Afirme que o elemento correspondente ao seletor fornecido tem o valor indicado no atributo:

```php
    $browser->assertAttribute($selector, $attribute, $value);
```

<a name="assert-attribute-contains"></a>
#### assertAttributeContains

 Afirme que o elemento que corresponde ao seletor fornecido contém o valor indicado no atributo especificado:

```php
    $browser->assertAttributeContains($selector, $attribute, $value);
```

<a name="assert-attribute-doesnt-contain"></a>
#### AssertThat method is not defined

 Afirme que o elemento correspondente ao seletor especificado não contém o valor indicado no atributo:

```php
    $browser->assertAttributeDoesntContain($selector, $attribute, $value);
```

<a name="assert-aria-attribute"></a>
#### assertAriaAttribute

 Afirmar que o elemento que corresponde ao seletor fornecido tem um valor especificado no atributo aria:

```php
    $browser->assertAriaAttribute($selector, $attribute, $value);
```

For example, given the markup `<button aria-label="Add"></button>`, you may assert against the `aria-label` attribute like so:

```php
    $browser->assertAriaAttribute('button', 'label', 'Add')
```

<a name="assert-data-attribute"></a>
#### assertDataAttribute

 Afirme que o elemento correspondente ao seletor fornecido tem o valor especificado no atributo de dados:

```php
    $browser->assertDataAttribute($selector, $attribute, $value);
```

For example, given the markup `<tr id="row-1" data-content="attendees"></tr>`, you may assert against the `data-label` attribute like so:

```php
    $browser->assertDataAttribute('#row-1', 'content', 'attendees')
```

<a name="assert-visible"></a>
#### assertVisible

 Afirme que o elemento correspondente ao seletor fornecido está visível:

```php
    $browser->assertVisible($selector);
```

<a name="assert-present"></a>
#### assertPresente

 Afirme que o elemento correspondente ao seletor especificado está presente na origem:

```php
    $browser->assertPresent($selector);
```

<a name="assert-not-present"></a>
#### afirmarNãoEstiverPresente

 Afirmar que o elemento que corresponde ao seletor especificado não está presente na origem:

```php
    $browser->assertNotPresent($selector);
```

<a name="assert-missing"></a>
#### asserta_falta

 Afirmar que o elemento correspondente ao seletor especificado não está visível:

```php
    $browser->assertMissing($selector);
```

<a name="assert-input-present"></a>
#### asserteQueEstáPresente

 Afirme que o input com o nome especificado está presente:

```php
    $browser->assertInputPresent($name);
```

<a name="assert-input-missing"></a>
#### assertInputMissing

 Afirmar que não existe nenhum input com o nome fornecido na origem:

```php
    $browser->assertInputMissing($name);
```

<a name="assert-dialog-opened"></a>
#### assertDialogOpened

 Afirmar que uma janela de diálogo JavaScript com a mensagem fornecida foi aberta:

```php
    $browser->assertDialogOpened($message);
```

<a name="assert-enabled"></a>
#### asserteHabilitado

 Afirme que o campo especificado está ativado:

```php
    $browser->assertEnabled($field);
```

<a name="assert-disabled"></a>
#### assertaIncapacitado

 Afirme que o campo indicado está desativado:

```php
    $browser->assertDisabled($field);
```

<a name="assert-button-enabled"></a>
#### assertButtonEnabled

 Afirme que o botão indicado está ativado:

```php
    $browser->assertButtonEnabled($button);
```

<a name="assert-button-disabled"></a>
#### assertButtonDisabled

 Afirme que o botão especificado está desativado:

```php
    $browser->assertButtonDisabled($button);
```

<a name="assert-focused"></a>
#### assertaFoco

 Afirme que o campo indicado está focado:

```php
    $browser->assertFocused($field);
```

<a name="assert-not-focused"></a>
#### assertaQueNãoEstáEmFoco

 Afirmar que o campo indicado não está selecionado:

```php
    $browser->assertNotFocused($field);
```

<a name="assert-authenticated"></a>
#### assertAuthenticated

 Afirmar que o utilizador está autenticado:

```php
    $browser->assertAuthenticated();
```

<a name="assert-guest"></a>
#### assertGuest

 Afirmar que o usuário não está autenticado:

```php
    $browser->assertGuest();
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

 Afirme que o usuário foi autenticado como o usuário especificado:

```php
    $browser->assertAuthenticatedAs($user);
```

<a name="assert-vue"></a>
#### assertVue

 O dusk permite que você faça afirmações sobre o estado dos dados de uma [componente Vue](https://vuejs.org). Por exemplo, imaginemos que a sua aplicação contenha a seguinte componente Vue:

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

 Você pode afirmar o estado da componente Vue da seguinte forma:

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
#### assertaQueVueNão

 Afirme que uma determinada propriedade de dados do componente Vue não coincide com o valor especificado:

```php
    $browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a name="assert-vue-contains"></a>
#### asserteQueA VueContém

 Afirme que uma determinada propriedade de dados da componente do Vue é um array e contém o valor indicado:

```php
    $browser->assertVueContains($property, $value, $componentSelector = null);
```

<a name="assert-vue-doesnt-contain"></a>
#### afirmoQueNãoExisteVue

 Afirme que uma propriedade de dados do componente Vue especificado é um array e não contém o valor especificado:

```php
    $browser->assertVueDoesntContain($property, $value, $componentSelector = null);
```

<a name="pages"></a>
## Páginas

 Às vezes, os testes exigem várias ações complicadas que devem ser executadas em sequência. Isso pode tornar seus testes mais difíceis de ler e entender. As Páginas Dusk permitem definir ações expressivas que depois poderão ser executadas em uma determinada página por meio de um único método. Além disso, as Páginas também permitem definir atalhos para selecionadores comuns da aplicação ou de uma única página.

<a name="generating-pages"></a>
### Gerar páginas

 Para gerar um objeto de página, execute o comando do Artisan `dusk:page`. Todos os objetos de páginas serão colocados no diretório da sua aplicação "tests/Browser/Páginas":

```php
    php artisan dusk:page Login
```

<a name="configuring-pages"></a>
### Configurando páginas

 Por padrão, as páginas têm três métodos: "url", "assert" e "elements". Neste momento vamos discorrer sobre os métodos `url` e `assert`. O método "elements" será [discutido em mais detalhes abaixo](#selecionadores-abreviados).

<a name="the-url-method"></a>
#### O método url

 O método `url` deve retornar o caminho do URL que representa a página. O dusk vai usar esse URL ao navegar até a página no browser:

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

 O método `assert` pode fazer as afirmações necessárias para verificar se o navegador está na página indicada. Não é, de facto, necessário inserir qualquer coisa neste método; no entanto, você tem liberdade de fazer essas afirmações caso deseje. Estas afirmações serão executadas automaticamente ao navegar até a página:

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
### Acessando páginas

 Definida uma página, pode navegar até esta usando o método `visit`:

```php
    use Tests\Browser\Pages\Login;

    $browser->visit(new Login);
```

 Às vezes, você já pode estar em uma determinada página e precisa "carregar" os seletores e métodos da página no contexto atual do teste. Isso é comum ao apertar um botão e ser redirecionado para uma determinada página sem ter sido navegado explicitamente até ela. Nesta situação, você pode usar o método `on` para carregar a página:

```php
    use Tests\Browser\Pages\CreatePlaylist;

    $browser->visit('/dashboard')
            ->clickLink('Create Playlist')
            ->on(new CreatePlaylist)
            ->assertSee('@create');
```

<a name="shorthand-selectors"></a>
### Rascunhos de seletores

 O método `elements` dentro das classes de página permite definir atalhos rápidos e fáceis de lembrar para qualquer selector do CSS da sua página. Por exemplo, defina um atalho para o campo de entrada "e-mail" da página de login do aplicativo:

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

 Depois que o atalho for definido, você poderá usar o selector abreviado em qualquer lugar onde usaria um selector de CSS completo:

```php
    $browser->type('@email', 'taylor@laravel.com');
```

<a name="global-shorthand-selectors"></a>
#### Seleção global abreviada

 Após instalar o Dusk, uma classe de base Page será colocada em sua pasta `tests/Browser/Pages`. Essa classe contém um método siteElements que pode ser usado para definir selectores abreviados globais que devem estar disponíveis em todas as páginas da aplicação:

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
### Métodos de página

 Além dos métodos padrão definidos nas páginas, você pode definir métodos adicionais que possam ser usados em todos os seus testes. Por exemplo, imagine que estamos construindo um aplicativo de gerenciamento de músicas. Uma ação comum para uma página do aplicativo poderia ser criar uma playlist. Em vez de reescrever a lógica para criar uma playlist em cada teste, você pode definir um método `createPlaylist` em uma classe de página:

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

 Depois que o método for definido, poderá ser usado em qualquer teste que use a página. A instância do navegador será automaticamente passada como primeiro argumento para os métodos personalizados de páginas:

```php
    use Tests\Browser\Pages\Dashboard;

    $browser->visit(new Dashboard)
            ->createPlaylist('My Playlist')
            ->assertSee('My Playlist');
```

<a name="components"></a>
## Componentes

 Os componentes são semelhantes aos "objetos de página" do Dusk, mas são concebidos para partes da interface gráfica e funcionalidades que são reutilizadas na sua aplicação, como uma barra de navegação ou janela de notificação. Como tal, os componentes não estão ligados a URLs específicas.

<a name="generating-components"></a>
### Gerando componentes

 Para gerar um componente, execute o comando "dusk:component" do comando "artisan". Novos componentes são colocados na pasta "tests/Browser/Components":

```php
    php artisan dusk:component DatePicker
```

 Conforme mostrado acima, um "selecionador de data" é um exemplo de um componente que pode existir em várias páginas do seu aplicativo. Pode ser cansativo escrever manualmente a lógica de automação do navegador para selecionar uma data em dezenas de testes durante todo o conjunto de testes. Em vez disso, podemos definir um componente Dusk para representar o "selecionador de data", permitindo encapsular essa lógica dentro do componente:

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
### Usando componentes

 Uma vez definido o componente, podemos facilmente selecionar uma data dentro do picker de datas a partir de qualquer teste. E, se a lógica necessária para seleção de uma data mudar, é suficiente atualizar o componente:

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
## Integração contínua

 > [ADVERTÊNCIA]
 > A maioria dos ambientes de integração contínua do Dusk esperam que a aplicação Laravel seja servida através do servidor interno PHP de desenvolvimento na porta 8000. Por conseguinte, antes de continuar, deve certificar-se que o seu ambiente de integração contínua tem um valor para a variável de ambiente `APP_URL` de "http://127.0.0.1:8000".

<a name="running-tests-on-heroku-ci"></a>
### Heroku CI

 Para executar os testes do Dusk em [Heroku CI](https://www.heroku.com/continuous-integration), adicione o seguinte buildpack e script para Google Chrome ao seu arquivo `app.json`:

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

 Para executar seus testes do Dusk em [Travis CI](https://travis-ci.org), utilize o seguinte arquivo de configuração `.travis.yml`. Como Travis CI não é um ambiente gráfico, serão necessários alguns passos extras para iniciar um navegador Chrome. Além disso, usaremos `php artisan serve` para iniciar o servidor Web embutido do PHP:

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

 Se você estiver usando [GitHub Actions](https://github.com/features/actions) para executar seus testes do Dusk, poderá usar o arquivo de configuração a seguir como ponto de partida. Assim como o TravisCI, vamos usar o comando `php artisan serve` para iniciar o servidor da Web incorporado ao PHP:

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

 Se você estiver usando o [Chipper CI](https://chipperci.com) para executar seus testes Dusk, poderá usar o arquivo de configuração abaixo como ponto inicial. Vamos usar o servidor interno do PHP para rodar Laravel assim que possamos ouvir os pedidos:

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

 Para saber mais sobre a execução de testes com Dusk no Chipper CI, incluindo como usar bases de dados, consulte o [documentação oficial do Chipper CI](https://chipperci.com/docs/testing/laravel-dusk-new/).
