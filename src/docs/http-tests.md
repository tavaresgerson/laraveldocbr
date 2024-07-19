# Teste de HTTP

<a name="introduction"></a>
## Introdução

 O Laravel oferece uma API muito eficiente para fazer solicitações HTTP à sua aplicação e analisar as respostas. Por exemplo, confira o teste de recurso abaixo definido:

```php tab=Pest
<?php

test('the application returns a successful response', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

 O método `get` faz um requisição GET para o aplicativo, enquanto o método `assertStatus` afirma que a resposta devolvida deve ter o código HTTP dado. Além desta simples assertiva, Laravel também inclui várias assertivas para inspeção das cabeçalhas da resposta, conteúdo, estrutura JSON e muito mais.

<a name="making-requests"></a>
## Solicitar informações

 Para fazer uma requisição à sua aplicação, você pode invocar os métodos `get`, `post`, `put`, `patch` ou `delete` dentro do seu teste. Estes métodos não emitirão uma "requisição real" de HTTP para a sua aplicação. Em vez disso, toda a requisição de rede é simulada internamente.

 Em vez de retornarem uma instância de `Illuminate\Http\Response`, as chamadas das métricas do teste retornam uma instância de `Illuminate\Testing\TestResponse`, que fornece várias afirmações úteis (#afirmações disponíveis) para inspeção das respostas da sua aplicação:

```php tab=Pest
<?php

test('basic request', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_a_basic_request(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

 Geralmente, cada um dos seus testes deve fazer apenas uma solicitação à aplicação. Pode ocorrer comportamento inesperado se várias solicitações forem executadas dentro de um único método de teste.

 > [!AVISO]
 > Por conveniência, a middleware CSRF é automaticamente desativada ao executar testes.

<a name="customizing-request-headers"></a>
### Personalizar cabeçalhos de requisição

 Você pode usar o método `withHeaders` para personalizar as cabeçalhos da requisição antes que ela seja enviada ao aplicativo. Esse método permite que você adicione quaisquer cabeçalhos personalizados que desejar à requisição:

```php tab=Pest
<?php

test('interacting with headers', function () {
    $response = $this->withHeaders([
        'X-Header' => 'Value',
    ])->post('/user', ['name' => 'Sally']);

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_interacting_with_headers(): void
    {
        $response = $this->withHeaders([
            'X-Header' => 'Value',
        ])->post('/user', ['name' => 'Sally']);

        $response->assertStatus(201);
    }
}
```

<a name="cookies"></a>
### Cookies

 Você pode usar os métodos `withCookie` ou `withCookies` para definir valores de cookies antes da execução do pedido. O método `withCookie` aceita como argumentos um nome e valor para o cookie, enquanto o método `withCookies` aceita uma matriz de pares "nome/valor":

```php tab=Pest
<?php

test('interacting with cookies', function () {
    $response = $this->withCookie('color', 'blue')->get('/');

    $response = $this->withCookies([
        'color' => 'blue',
        'name' => 'Taylor',
    ])->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_cookies(): void
    {
        $response = $this->withCookie('color', 'blue')->get('/');

        $response = $this->withCookies([
            'color' => 'blue',
            'name' => 'Taylor',
        ])->get('/');

        //
    }
}
```

<a name="session-and-authentication"></a>
### Sessão/Autenticação

 O Laravel disponibiliza várias ferramentas para interagir com a sessão durante testes de HTTP. Primeiro, você pode definir os dados da sessão num determinado array usando o método `withSession`. Isso é útil para carregar dados na sessão antes de emitir um pedido à aplicação:

```php tab=Pest
<?php

test('interacting with the session', function () {
    $response = $this->withSession(['banned' => false])->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_the_session(): void
    {
        $response = $this->withSession(['banned' => false])->get('/');

        //
    }
}
```

 O recurso de sessão do Laravel é normalmente usado para manter o estado do utilizador atualmente autenticado. Assim, o método auxiliar `actingAs` proporciona uma forma simples de autenticar um determinado utilizador como o atual. Por exemplo, podemos usar uma [fabricante de modelo] (https://laravel.com/docs/5.4/eloquent-factories#creating-model-factories) para gerar e autenticar um utilizador:

```php tab=Pest
<?php

use App\Models\User;

test('an action that requires authentication', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
                     ->withSession(['banned' => false])
                     ->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_an_action_that_requires_authentication(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
                         ->withSession(['banned' => false])
                         ->get('/');

        //
    }
}
```

 Você também pode especificar qual guardia deve ser usada para autenticar o usuário dado, passando o nome da guarda como segundo argumento do método `actingAs`. A guarda providenciada ao método `actingAs` também se tornará a guarda padrão por toda duração do teste:

```php
    $this->actingAs($user, 'web')
```

<a name="debugging-responses"></a>
### Depurando respostas

 Após fazer uma solicitação de teste para sua aplicação, os métodos `dump`, `dumpHeaders` e `dumpSession` podem ser usados para examinar e depurar o conteúdo da resposta:

```php tab=Pest
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->dumpHeaders();

    $response->dumpSession();

    $response->dump();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->dumpHeaders();

        $response->dumpSession();

        $response->dump();
    }
}
```

 Como alternativa, você pode usar os métodos `dd`, `ddHeaders` e `ddSession` para extrair informações sobre a resposta e então interromper a execução:

```php tab=Pest
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->ddHeaders();

    $response->ddSession();

    $response->dd();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->ddHeaders();

        $response->ddSession();

        $response->dd();
    }
}
```

<a name="exception-handling"></a>
### Processo de tratamento das exceções

 Às vezes, você poderá precisar de testar se sua aplicação está lançando uma exceção específica. Para fazer isso, poderá "simular" o manipulador de exceções através da fachada `Exceptions`. Depois que esse manipulador tiver sido simulado, você poderá utilizar os métodos `assertReported` e `assertNotReported` para fazer afirmações em relação a exceções lançadas durante o pedido:

```php tab=Pest
<?php

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;

test('exception is thrown', function () {
    Exceptions::fake();

    $response = $this->get('/order/1');

    // Assert an exception was thrown...
    Exceptions::assertReported(InvalidOrderException::class);

    // Assert against the exception...
    Exceptions::assertReported(function (InvalidOrderException $e) {
        return $e->getMessage() === 'The order was invalid.';
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_exception_is_thrown(): void
    {
        Exceptions::fake();

        $response = $this->get('/');

        // Assert an exception was thrown...
        Exceptions::assertReported(InvalidOrderException::class);

        // Assert against the exception...
        Exceptions::assertReported(function (InvalidOrderException $e) {
            return $e->getMessage() === 'The order was invalid.';
        });
    }
}
```

 Os métodos `assertNotReported` e `assertNothingReported` podem ser utilizados para garantir que uma determinada exceção não foi lançada durante o pedido ou que nenhuma exceção tenha sido lançada.

```php
Exceptions::assertNotReported(InvalidOrderException::class);

Exceptions::assertNothingReported();
```

 Você pode desativar completamente o manuseio de exceções para um determinado pedido, chamando o método `withoutExceptionHandling` antes de fazer seu pedido:

```php
    $response = $this->withoutExceptionHandling()->get('/');
```

 Além disso, se você quiser garantir que o seu aplicativo não esteja utilizando recursos que tenham sido removidos pelo idioma PHP ou pelas bibliotecas que a sua aplicação está usando, pode invocar o método `withoutDeprecationHandling` antes de fazer o pedido. Quando o processamento das deprecações estiver desativado, as mensagens de aviso de deprecação serão convertidas para exceções, fazendo com que seu teste falhe:

```php
    $response = $this->withoutDeprecationHandling()->get('/');
```

 O método `assertThrows` pode ser usado para garantir que o código dentro de um determinado closure provoque uma exceção do tipo especificado:

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    OrderInvalid::class
);
```

<a name="testing-json-apis"></a>
## Testando as APIs de JSON

 O Laravel também fornece vários helpers para testar APIs JSON e suas respostas. Por exemplo, os métodos `json`, `getJson`, `postJson`, `putJson`, `patchJson`, `deleteJson` e `optionsJson` podem ser usados para emitir solicitações JSON com várias palavras-chave HTTP. Você também pode facilmente passar dados e cabeçalhos para esses métodos. Para começar, vamos escrever um teste para fazer uma solicitação `POST` em `/api/user` e afirmar que os dados JSON esperados foram devolvidos:

```php tab=Pest
<?php

test('making an api request', function () {
    $response = $this->postJson('/api/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertJson([
            'created' => true,
         ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_making_an_api_request(): void
    {
        $response = $this->postJson('/api/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJson([
                'created' => true,
            ]);
    }
}
```

 Além disso, você pode usar variáveis de matrizes na resposta JSON para obter informações sobre os valores individuais devolvidos por uma resposta JSON:

```php tab=Pest
expect($response['created'])->toBeTrue();
```

```php tab=PHPUnit
$this->assertTrue($response['created']);
```

 > [!NOTA]
 > O método `assertJson` converte a resposta em uma matriz e utiliza o `PHPUnit::assertArraySubset` para verificar se a matriz definida existe dentro da resposta JSON retornada pela aplicação. Por isso, se existirem outras propriedades na resposta JSON, este teste ainda será aprovado desde que o fragmento definido esteja presente.

<a name="verifying-exact-match"></a>
#### Afirmando correspondências exatas de JSON

 Como mencionado anteriormente, o método `assertJson` pode ser utilizado para garantir que um fragmento de JSON existe dentro da resposta JSON. Se você quiser verificar se uma determinada matriz **corresponde exatamente** ao JSON retornado pelo seu aplicativo, deve usar o método `assertExactJson`:

```php tab=Pest
<?php

test('asserting an exact json match', function () {
    $response = $this->postJson('/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertExactJson([
            'created' => true,
        ]);
});

```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_asserting_an_exact_json_match(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertExactJson([
                'created' => true,
            ]);
    }
}
```

<a name="verifying-json-paths"></a>
#### Afirmando em Caminhos de JSON

 Se pretender verificar se o conteúdo da resposta JSON corresponde aos dados indicados em um caminho específico, deverá utilizar a metodologia `assertJsonPath`:

```php tab=Pest
<?php

test('asserting a json path value', function () {
    $response = $this->postJson('/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertJsonPath('team.owner.name', 'Darian');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_asserting_a_json_paths_value(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJsonPath('team.owner.name', 'Darian');
    }
}
```

 O método `assertJsonPath` também aceita um closures que podem ser utilizados para determinar dinamicamente se a afirmação deve passar.

```php
    $response->assertJsonPath('team.owner.name', fn (string $name) => strlen($name) >= 3);
```

<a name="fluent-json-testing"></a>
### Teste de fluência do JSON

 O Laravel também fornece uma forma simples de testar as respostas do aplicativo em formato JSON. Para começar, defina um closure para o método `assertJson`. Este closure será chamado com uma instância de `Illuminate\Testing\Fluent\AssertableJson` que pode ser utilizada para fazer assertões contra o JSON retornado pelo seu aplicativo. O método `where` pode ser usado para fazer assertões contra um atributo em particular do JSON, enquanto o método `missing` pode ser utilizado para asserir que um determinado atributo está ausente na resposta:

```php tab=Pest
use Illuminate\Testing\Fluent\AssertableJson;

test('fluent json', function () {
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                 ->where('name', 'Victoria Faith')
                 ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                 ->whereNot('status', 'pending')
                 ->missing('password')
                 ->etc()
        );
});
```

```php tab=PHPUnit
use Illuminate\Testing\Fluent\AssertableJson;

/**
 * A basic functional test example.
 */
public function test_fluent_json(): void
{
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                 ->where('name', 'Victoria Faith')
                 ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                 ->whereNot('status', 'pending')
                 ->missing('password')
                 ->etc()
        );
}
```

#### Entendendo o método `etc`

 No exemplo acima, você pode ter reparado que invocamos o método `etc` ao final da nossa cadeia de asserções. Esse método informa o Laravel que poderá haver outros atributos presentes no objeto JSON. Se o método `etc` não for utilizado, o teste falhará caso existam outros atributos dos quais você não fez assertões no objeto JSON.

 A intenção por trás desse comportamento é proteger a você de expor informações sensíveis em suas respostas JSON sem querer, forçando-o a fazer uma afirmação explícita contra o atributo ou permitir explicitamente atributos adicionais por meio do método `etc`.

 No entanto, é preciso ter em atenção que a não inclusão da técnica de `etc` na cadeia de afirmações não garante que não são adicionados atributos adicionais aos arrays aninhados no objeto JSON. A técnica de `etc` apenas garante que não existem atributos adicionais na nível de aninhamento em que a técnica de `etc` é invocada.

<a name="asserting-json-attribute-presence-and-absence"></a>
#### Afirmar presença/ausência de atributo

 Para afirmar que um atributo está presente ou ausente, você pode usar os métodos `has` e `missing`:

```php
    $response->assertJson(fn (AssertableJson $json) =>
        $json->has('data')
             ->missing('message')
    );
```

 Além disso, os métodos `hasAll` e `missingAll` permitem afirmar a presença ou ausência de vários atributos ao mesmo tempo:

```php
    $response->assertJson(fn (AssertableJson $json) =>
        $json->hasAll(['status', 'data'])
             ->missingAll(['message', 'code'])
    );
```

 Pode usar o método `hasAny` para determinar se pelo menos um dos atributos indicados está presente:

```php
    $response->assertJson(fn (AssertableJson $json) =>
        $json->has('status')
             ->hasAny('data', 'message', 'code')
    );
```

<a name="asserting-against-json-collections"></a>
#### Afirmando contra coleções JSON

 Muitas vezes, sua rota retornará uma resposta em formato JSON que contenha vários itens, como usuários múltiplos:

```php
    Route::get('/users', function () {
        return User::all();
    });
```

 Nessas situações, podemos usar o método `has`, do objeto JSON fluente para fazer afirmações contra os usuários incluídos na resposta. Por exemplo, vamos afirmar que a resposta JSON contém três usuários. Em seguida, faremos algumas afirmações sobre o primeiro usuário da coleção, utilizando o método `first`. O `first` aceita um fecho, que recebe outra string JSON afirmável, que pode ser utilizada para fazer afirmações sobre o primeiro objeto na coleção JSON:

```php
    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->has(3)
                 ->first(fn (AssertableJson $json) =>
                    $json->where('id', 1)
                         ->where('name', 'Victoria Faith')
                         ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                         ->missing('password')
                         ->etc()
                 )
        );
```

<a name="scoping-json-collection-assertions"></a>
#### Mapeando as afirmações de coleção do JSON

 Às vezes, as rotas do seu aplicativo devolverão coleções de JSON com chaves nomeadas:

```php
    Route::get('/users', function () {
        return [
            'meta' => [...],
            'users' => User::all(),
        ];
    })
```

 Ao testar essas rotas, você pode usar o método `has` para verificar contra o número de itens na coleção. Além disso, você pode usar o método `has` para definir um escopo para uma cadeia de verificações:

```php
    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->has('meta')
                 ->has('users', 3)
                 ->has('users.0', fn (AssertableJson $json) =>
                    $json->where('id', 1)
                         ->where('name', 'Victoria Faith')
                         ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                         ->missing('password')
                         ->etc()
                 )
        );
```

 No entanto, em vez de realizar duas chamadas separadas para o método `has` para afirmar contra a coleção `users`, você pode fazer uma única chamada que fornece um closures como seu terceiro parâmetro. Ao fazer isso, o closure será automaticamente invocado e definido para o primeiro item na coleção:

```php
    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->has('meta')
                 ->has('users', 3, fn (AssertableJson $json) =>
                    $json->where('id', 1)
                         ->where('name', 'Victoria Faith')
                         ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                         ->missing('password')
                         ->etc()
                 )
        );
```

<a name="asserting-json-types"></a>
#### Declarar Tipos de JSON

 Talvez você queira simplesmente afirmar que as propriedades da resposta JSON são de um tipo específico. A classe Illuminate\Testing\Fluent\AssertableJson fornece os métodos `whereType` e `whereAllType` para fazer exatamente isso:

```php
    $response->assertJson(fn (AssertableJson $json) =>
        $json->whereType('id', 'integer')
             ->whereAllType([
                'users.0.name' => 'string',
                'meta' => 'array'
            ])
    );
```

 Você pode especificar vários tipos usando o caractere "|", ou passando um array de tipos como segundo parâmetro para a função `whereType`. A afirmação será bem-sucedida se o valor da resposta for qualquer tipo listado:

```php
    $response->assertJson(fn (AssertableJson $json) =>
        $json->whereType('name', 'string|null')
             ->whereType('id', ['string', 'integer'])
    );
```

 Os métodos `whereType` e `whereAllType` reconhecem os seguintes tipos: `string`, `integer`, `double`, `boolean`, `array` e `null`.

<a name="testing-file-uploads"></a>
## Teste de uploads de arquivos

 A classe Illuminate\Http\UploadedFile fornece um método `fake` que pode ser usado para gerar arquivos ou imagens falsos para testes. Isso, combinado com o método `fake` da faca Storage simplifica bastante os testes de upload de arquivo. Por exemplo, você pode combinar essas duas características para facilitar o teste de um formulário de upload de avatar:

```php tab=Pest
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('avatars can be uploaded', function () {
    Storage::fake('avatars');

    $file = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->post('/avatar', [
        'avatar' => $file,
    ]);

    Storage::disk('avatars')->assertExists($file->hashName());
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_avatars_can_be_uploaded(): void
    {
        Storage::fake('avatars');

        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->post('/avatar', [
            'avatar' => $file,
        ]);

        Storage::disk('avatars')->assertExists($file->hashName());
    }
}
```

 Se deseja afirmar que um determinado arquivo não existe, pode utilizar o método `assertMissing` fornecido pela faca `Storage`:

```php
    Storage::fake('avatars');

    // ...

    Storage::disk('avatars')->assertMissing('missing.jpg');
```

<a name="fake-file-customization"></a>
#### Personalização de ficheiros falsos

 Ao criar arquivos utilizando o método `fake` fornecido pela classe `UploadedFile`, você pode especificar a largura, altura e tamanho da imagem (em kilobytes) para testar melhor as regras de validação do seu aplicativo:

```php
    UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

 Além de criar imagens, você pode criar arquivos de qualquer outro tipo usando o método `create`:

```php
    UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

 Se necessário, você pode passar um argumento `$mimeType` ao método para definir explicitamente o tipo MIME que deverá ser retornado pelo arquivo:

```php
    UploadedFile::fake()->create(
        'document.pdf', $sizeInKilobytes, 'application/pdf'
    );
```

<a name="testing-views"></a>
## Visualizar testes

 Laravel permite-lhe também renderizar uma vista sem efetuar um pedido HTTP simulado à aplicação. Para tal, deve invocar a função `view` no seu teste. A função `view` aceita o nome da vista e um conjunto de dados facultativo. A função retorna uma instância de `Illuminate\Testing\TestView`, que disponibiliza várias funções para efetuar afirmações comodamente sobre os conteúdos da vista:

```php tab=Pest
<?php

test('a welcome view can be rendered', function () {
    $view = $this->view('welcome', ['name' => 'Taylor']);

    $view->assertSee('Taylor');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_a_welcome_view_can_be_rendered(): void
    {
        $view = $this->view('welcome', ['name' => 'Taylor']);

        $view->assertSee('Taylor');
    }
}
```

 A classe `TestView` fornece os seguintes métodos de asserção: `assertSee`, `assertSeeInOrder`, `assertSeeText`, `assertSeeTextInOrder`, `assertDontSee`, e `assertDontSeeText`.

 Se necessário, você poderá obter o conteúdo da visualização renderizado em formato bruto, convertendo a instância de `TestView` para um tipo de dado diferente.

```php
    $contents = (string) $this->view('welcome');
```

<a name="sharing-errors"></a>
#### Compartilhamento de erros

 Alguns itens só podem ser exibidos se houver erros compartilhados no [carregamento da sacola global de erros fornecida pela Laravel](/docs/validation#quick-displaying-the-validation-errors). Para carregar a sacola de erros com mensagens, você pode usar o método `withViewErrors`:

```php
    $view = $this->withViewErrors([
        'name' => ['Please provide a valid name.']
    ])->view('form');

    $view->assertSee('Please provide a valid name.');
```

<a name="rendering-blade-and-components"></a>
### Renderização da lâmina e de seus componentes

 Se necessário, você pode usar o método `blade` para avaliar e renderizar uma string [Blade] (/) bruta. Assim como o método `view`, o método `blade` retorna uma instância de `Illuminate\Testing\TestView`:

```php
    $view = $this->blade(
        '<x-component :name="$name" />',
        ['name' => 'Taylor']
    );

    $view->assertSee('Taylor');
```

 Você pode usar o método `component` para avaliar e exibir um componente Blade. O método `component` retorna uma instância do `Illuminate\Testing\TestComponent`:

```php
    $view = $this->component(Profile::class, ['name' => 'Taylor']);

    $view->assertSee('Taylor');
```

<a name="available-assertions"></a>
## Declarações disponíveis

<a name="response-assertions"></a>
### Asserções de resposta

 A classe `Illuminate\Testing\TestResponse`, no Laravel, disponibiliza vários métodos de afirmação personalizados que pode utilizar durante o desenvolvimento do seu aplicativo. Pode consultar estes métodos na resposta enviada pelos métodos de teste `json`, `get`, `post`, `put` e `delete`:

<style>
 .collection-method-list > p {
 Colunas: 14.4em 2; -moz-colunas: 14.4em 2; -webkit-colunas: 14.4em 2;
 }

 .método-de-colecao-lista a {
 display: bloqueio;
 overflow: ocultar;
 text-overflow: elipsoide;
 espaço em branco: não intercalado;
 }
</style>

<div class="collection-method-list" markdown="1">

 [afirmarAceitação (#afirmarAceitação)](/m/question/514e7d6319f86a027a4b458c?q=assertAccepted)
 [verificar mal pedido](#verificar-mal-pedido)
 [afirmar conflito (#assert-conflict?)]
 [assertCookie (# assert-cookie)](/assert-cookie)
 [assegurar cookie expirado] (#assegurar-cookie-expirado)
 [assegurar que o cookie não expirou (#assert-cookie-not-expired)]
 [assertCookieMissing](#assert-cookie-missing)
 [asservar criado (#assert-created)](/m/#assert-created "Assert Created")
 [afirmarQueNãoVi](#afirmarque-nãoviu)
 [asserteQueNãoVeTexto](#assert-dont-see-text)
 [afirmar download](#afirmar-download)
 [afirmarJSON exato](#afirmar-json-exato)
 # assertForbidden (#assert-forbidden)
 [afirmarEncontrado(#assert-found)]
 [afirmarFechado=false]#afirmarFechado(false)
 [assertHeader (# assert-header)](/assert-header)
 [assertHeaderMissing](#assert-header-missing)
 [afirmarErroInternoServidor (# afirmar-erro-interno-servidor)
 [asserJson(#assert-json)]
 [afirmar o número de JSON (#afirmar-o-número-de-json)](/ assert-json-count)
 [afirmar fragmento JSON (#afirmar-fragmento-JSON)](
 [asserte que o JSON é um array] (#asserte-que-o-JSON-é-um-array)
 [verificar se o JSON é um objeto] (#assert-json-is-object)
 [averiguar falta de JSON](#verificar-se-houver-falta-de-JSON)
 [Assert JSON faltando exatamente](#assert-json-faltando-exatamente)
 [verificar erros de validação ausentes em JSON (#asserJsonMissingValidationErrors)](/pt/api/datatypes/#verificar-erros-de-validação-ausentes-em-json)
 [enquadrar caminho JSON](#enquadrar-caminho-json)
 [assertJsonMissingPath (# assert-json-missing-path?)
 [verificar estrutura JSON](#verificar-estrutura-json)
 [assegurar erros de validação JSON](#assegurar-erros-de-validação-json)
 [Verificar erro de validação JSON](#verificar-erro-de-validação-json)
 [afirmar localização (# afirmar-localizacao?)]
 [assertMethodNotAllowed (#assert-method-not-allowed? )
 [assertMovedPermanently](#assert-moved-permanently)
 [assertaConteúdo(#assert-content)]
 [afirmarSemConteúdo (#assert-no-content)]
 [afirmar conteúdo transmitido por streaming] (#afirmar-conteúdo-transmitido-por-streaming)
 [assertNotFound (# assert-not-found)
 [assertOk (# assert-ok)
 [requerImputoPagamento](#requer-imputo-pagamento)
 [assertPlainCookie (#assert-plain-cookie)
 [afirmar redirecionamento (#afirmar-redirecionamento?)]
 [asserte que a redirecionada contém](#afirmar-se-a-redirecionada-contem)
 [asservar redirecionar para rotas](#asservar-redirecionar-para-rota)
 [assertRedirectToSignedRoute (#assert-redirect-to-signed-route)]
 [assertRequestTimeout (# assertRequestTimeout )]
 [afirmar verificar#verificarAfirmo que](#verificar-confirmar)
 [asserVerSeEmOrdem (# asserVerSeEmOrdem)
 [afirmarVerTexto](#afirmar-ver-texto)
 [afirmar ver o texto na ordem correta (#assert-see-text-in-order)]
 [assegurarErroServidor](#assegurar-erro-do-servidor)
 [assertServiceUnavailable (#assert-servidor-indisponível? )
 [asserQueASessaoExiste (#assert-session-has)
 [assegure que a sessão tem entrada] (#assert-session-has-input)
 [assegurar que a sessão tenha tudo?](#assegurar-que-a-sessao-tenha-tudo?)
 [afirmarQueSessãoTemErros (# assertThatSessionHasErrors)]
 [afirmarSeSessãoTiverErrosNo](#afirmarseSSessãoTemErrosNo)
 [verificar se a sessão não tem erros](#verificar-se-a-sessao-n-tem-erros)
 [assegure que a sessão não tem erros (#assert-session-doesnt-have-errors)](/pt/api/#assert-session-doesnt-have-errors "Verifique se a sessão não tem erros")
 [verificar ausência de sessão](#verificar-ausencia-de-sessao)
 [afirmar status (# afirmar-status)?]
 [afirmar com sucesso (#afirmar-com-sucesso)?]
 [verificar pedidos demais?](#verificar-pedidos-demais?)
 [assertUnauthorized](#assert-unauthorized)
 [assertUnprocessable(#assert-unprocessable)]
 [Afirmando um tipo de mídia não suportado](#afirmar-um-tipo-de-m%C3%ADdia-não-suportado)
 [afirmarValido (#assert-valid)]
 [afirmarInvalido(#assert-invalid)]
 [verificar se o View existe?](#verificar-se-o-view-existe)
 [verificar se a visualização tem tudo] (#verificar-se-a-visualizacao-tem-tudo)
 [afirmar visualização existente (#assert-view-exists)](/mnt/fancy_upload/123/)
 [verificar se a visão está faltando](#assert-view-missing)

</div>

<a name="assert-bad-request"></a>
#### Assertiva "Solicitação indevida"

 Afirme que a resposta tem um código de estado "bad request" (400):

```php
    $response->assertBadRequest();
```

<a name="assert-accepted"></a>
#### assertAceitado

 Aserta que a resposta tem um código de estado HTTP aceite (202):

```php
    $response->assertAccepted();
```

<a name="assert-conflict"></a>
#### AssertConflict

 Afirme que o estado de resposta é "CONFLITO" (409):

```php
    $response->assertConflict();
```

<a name="assert-cookie"></a>
#### assertCookie

 Aser que a resposta contém o cookie indicado:

```php
    $response->assertCookie($cookieName, $value = null);
```

<a name="assert-cookie-expired"></a>
#### assertCookieExpired

 Afirme que a resposta contém o cookie especificado e que ele está expirado:

```php
    $response->assertCookieExpired($cookieName);
```

<a name="assert-cookie-not-expired"></a>
#### asserteCookieNotExpired

 Afirme que a resposta contém o cookie especificado e não está vencido:

```php
    $response->assertCookieNotExpired($cookieName);
```

<a name="assert-cookie-missing"></a>
#### Ocorreu um erro ao tentar carregar o cookie "assert".

 Afirmar que a resposta não contém o cookie especificado:

```php
    $response->assertCookieMissing($cookieName);
```

<a name="assert-created"></a>
#### assertCreated

 Afirme que a resposta tem um código de estado HTTP 201:

```php
    $response->assertCreated();
```

<a name="assert-dont-see"></a>
#### afirmarNãoVer

 Afirme que a string fornecida não está contida na resposta retornada pela aplicação. Essa afirmação escapará automaticamente a string fornecida, exceto se o segundo argumento for `false`:

```php
    $response->assertDontSee($value, $escaped = true);
```

<a name="assert-dont-see-text"></a>
#### afirmarQueNãoVeJuntamenteComTexto

 Aserta que a string fornecida não está contida no texto da resposta. Esta afirmação escapará automaticamente a string fornecida, exceto se você passar o argumento `false`. Este método enviará o conteúdo da resposta para a função PHP `strip_tags` antes de fazer a afirmação:

```php
    $response->assertDontSeeText($value, $escaped = true);
```

<a name="assert-download"></a>
#### assertaDownloads

 Afirme que o tipo de resposta é um "download". Geralmente, isso significa que o caminho invocado que retornou a resposta devolveu uma resposta `Response::download`, `BinaryFileResponse` ou `Storage::download`:

```php
    $response->assertDownload();
```

 Caso o usuário assim deseje, pode-se indicar que o arquivo baixado recebeu um determinado nome de arquivo:

```php
    $response->assertDownload('image.jpg');
```

<a name="assert-exact-json"></a>
#### assertExactJson

 Afirmar que a resposta contém uma correspondência exata com os dados JSON especificados:

```php
    $response->assertExactJson(array $data);
```

<a name="assert-forbidden"></a>
#### assertaForbidden

 Afirme que a resposta tem um código de estado HTTP proibido (403):

```php
    $response->assertForbidden();
```

<a name="assert-found"></a>
#### assertFound

 Afirmar que a resposta tem um código de estado HTTP encontrado (302):

```php
    $response->assertFound();
```

<a name="assert-gone"></a>
#### assertGone

 Afirme que a resposta tem um código de estado HTTP "gone" (410):

```php
    $response->assertGone();
```

<a name="assert-header"></a>
#### assertaCabecalho

 Afirme que o cabeçalho e o valor fornecidos estão presentes na resposta:

```php
    $response->assertHeader($headerName, $value = null);
```

<a name="assert-header-missing"></a>
#### Head missing

 Afirme que o cabeçalho indicado não está presente na resposta:

```php
    $response->assertHeaderMissing($headerName);
```

<a name="assert-internal-server-error"></a>
#### Assertion of interno do servidor de erro

 Afirme que a resposta tem um código de estado HTTP "Erro interno do servidor" (500):

```php
    $response->assertInternalServerError();
```

<a name="assert-json"></a>
#### assertJson

 Afirme que a resposta contém os dados JSON especificados:

```php
    $response->assertJson(array $data, $strict = false);
```

 O método `assertJson` converte a resposta em uma matriz e utiliza `PHPUnit::assertArraySubset` para verificar se a matriz especificada está presente na resposta JSON retornada pela aplicação. Portanto, mesmo que existam outras propriedades na resposta JSON, este teste passará enquanto o fragmento especificado estiver presente.

<a name="assert-json-count"></a>
#### assertJsonCount

 Afirme que o JSON da resposta tem um array com o número esperado de itens na chave dada:

```php
    $response->assertJsonCount($count, $key = null);
```

<a name="assert-json-fragment"></a>
#### assertJsonFragment

 Afirme que a resposta contém os dados do JSON fornecidos em qualquer parte da resposta:

```php
    Route::get('/users', function () {
        return [
            'users' => [
                [
                    'name' => 'Taylor Otwell',
                ],
            ],
        ];
    });

    $response->assertJsonFragment(['name' => 'Taylor Otwell']);
```

<a name="assert-json-is-array"></a>
#### assertJsonIsArray

 Afirmar que o objeto JSON da resposta é uma matriz:

```php
    $response->assertJsonIsArray();
```

<a name="assert-json-is-object"></a>
#### assertJsonIsObject

 Afirme que o JSON da resposta é um objeto:

```php
    $response->assertJsonIsObject();
```

<a name="assert-json-missing"></a>
#### Assertando que uma chave JSON está faltando

 Afirme que a resposta não contém os dados de JSON fornecidos:

```php
    $response->assertJsonMissing(array $data);
```

<a name="assert-json-missing-exact"></a>
#### Assert JSON é ausente exatamente

 Afirmar que a resposta não contém os dados do JSON exatos:

```php
    $response->assertJsonMissingExact(array $data);
```

<a name="assert-json-missing-validation-errors"></a>
#### assertJsonMissingValidationErrors

 Afirme que a resposta não tem erros de validação JSON para as chaves indicadas:

```php
    $response->assertJsonMissingValidationErrors($keys);
```

 > [!NOTA]
 O método [afirmarVálido](#assert-valid) pode ser usado para garantir que uma resposta não tenha erros de validação retornados como JSON e, além disso, nenhum erro foi armazenado no armazenamento da sessão.

<a name="assert-json-path"></a>
#### assertJsonPath

 Afirmar que a resposta contém os dados especificados no caminho indicado:

```php
    $response->assertJsonPath($path, $expectedValue);
```

 Por exemplo, se a resposta JSON seguinte for retornada pelo seu aplicativo:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

 Você pode declarar que a propriedade `name` do objeto `user` corresponde a um valor especificado da seguinte maneira:

```php
    $response->assertJsonPath('user.name', 'Steve Schoger');
```

<a name="assert-json-missing-path"></a>
#### assertJsonMissingPath

 Afirmar que a resposta não contém o caminho indicado:

```php
    $response->assertJsonMissingPath($path);
```

 Se o seu aplicativo for retornar a seguinte resposta JSON, por exemplo:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

 Você pode afirmar que não contém a propriedade `email` do objeto `user`:

```php
    $response->assertJsonMissingPath('user.email');
```

<a name="assert-json-structure"></a>
#### assertaEstruturaJSON

 Afirme que a resposta tem uma estrutura de JSON dada:

```php
    $response->assertJsonStructure(array $structure);
```

 Por exemplo, se a resposta JSON retornada por seu aplicativo contiver os seguintes dados:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

 Você pode afirmar que a estrutura JSON está de acordo com suas expectativas da seguinte maneira:

```php
    $response->assertJsonStructure([
        'user' => [
            'name',
        ]
    ]);
```

 Às vezes, as respostas JSON enviadas pela sua aplicação podem conter matrizes de objetos:

```json
{
    "user": [
        {
            "name": "Steve Schoger",
            "age": 55,
            "location": "Earth"
        },
        {
            "name": "Mary Schoger",
            "age": 60,
            "location": "Earth"
        }
    ]
}
```

 Nesta situação, você pode usar o caractere `*` para especificar a estrutura de todos os objetos do array:

```php
    $response->assertJsonStructure([
        'user' => [
            '*' => [
                 'name',
                 'age',
                 'location'
            ]
        ]
    ]);
```

<a name="assert-json-validation-errors"></a>
#### assertaErrosDeValidaçãoJSON

 Afirme que a resposta possui os erros de validação do JSON indicados para as chaves especificadas. Este método deve ser usado ao afirmar com relação às respostas em que os erros de validação são retornados como uma estrutura JSON em vez de serem exibidos na sessão:

```php
    $response->assertJsonValidationErrors(array $data, $responseKey = 'errors');
```

 > [!NOTA]
 O método [Asserta inválido] (#assert-invalid) pode ser usado para garantir que uma resposta tenha retornado erros de validação como JSON, ou que os erros foram exibidos no armazenamento da sessão.

<a name="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

 Verifique se a resposta tem quaisquer erros de validação JSON para a chave especificada:

```php
    $response->assertJsonValidationErrorFor(string $key, $responseKey = 'errors');
```

<a name="assert-method-not-allowed"></a>
#### Erro "assertionMethodNotAllowed"

 Afirmar que a resposta tem um método não permitido (405) HTTP status code:

```php
    $response->assertMethodNotAllowed();
```

<a name="assert-moved-permanently"></a>
#### Assertiva: Erro 404 - Página não encontrada

 Afirme que o status do HTTP da resposta é "moved permanently" (301):

```php
    $response->assertMovedPermanently();
```

<a name="assert-location"></a>
#### asserta local

 Assegure-se de que a resposta tenha o valor do URI especificado no cabeçalho `Location`:

```php
    $response->assertLocation($uri);
```

<a name="assert-content"></a>
#### afirmar conteúdo

 Afirme que a string fornecida corresponde ao conteúdo da resposta:

```php
    $response->assertContent($value);
```

<a name="assert-no-content"></a>
#### assertNoContent

 Afirme que a resposta tem o código de estado HTTP indicado e nenhum conteúdo:

```php
    $response->assertNoContent($status = 204);
```

<a name="assert-streamed-content"></a>
#### assertStreamedContent

 Asserte que a cadeia dada coincide com o conteúdo do resposta transmitida:

```php
    $response->assertStreamedContent($value);
```

<a name="assert-not-found"></a>
#### AssertNotFound

 Afirmar que a resposta tem um código de estado HTTP não encontrado (404):

```php
    $response->assertNotFound();
```

<a name="assert-ok"></a>
#### assertOk

 Afirme que o código de estado HTTP da resposta é 200:

```php
    $response->assertOk();
```

<a name="assert-payment-required"></a>
#### Requisito de pagamento

 Afirme que a resposta possui um código de estado HTTP com pedido de pagamento (402):

```php
    $response->assertPaymentRequired();
```

<a name="assert-plain-cookie"></a>
#### assertPlainCookie

 Afirmar que a resposta contém o cookie não encriptado indicado:

```php
    $response->assertPlainCookie($cookieName, $value = null);
```

<a name="assert-redirect"></a>
#### assertRedirect

 Afirme que a resposta é um redirecionamento para o URI especificado:

```php
    $response->assertRedirect($uri = null);
```

<a name="assert-redirect-contains"></a>
#### assertaRedirecionaContém

 Determine se a resposta está redirecionando para um URI que contém a cadeia de caracteres especificada:

```php
    $response->assertRedirectContains($string);
```

<a name="assert-redirect-to-route"></a>
#### asserttartoroute

 Assegure que a resposta é um redirecionamento para o caminho especificado (/docs/routing#named-routes):

```php
    $response->assertRedirectToRoute($name, $parameters = []);
```

<a name="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

 Afirme que a resposta é um redirecionamento para o caminho indicado [enviado por assinatura](/docs/urls#signed-urls):

```php
    $response->assertRedirectToSignedRoute($name = null, $parameters = []);
```

<a name="assert-request-timeout"></a>
#### Timeout para solicitações de confirmação

 Afirmar que a resposta tem um código de estado HTTP de timeout da solicitação (408):

```php
    $response->assertRequestTimeout();
```

<a name="assert-see"></a>
#### assertVer mais informações

 Assegure que a cadeia de caracteres indicada está contida na resposta. Esta afirmação irá, automaticamente, proteger contra as aspas a cadeia de caracteres indicada, salvo se for passado o segundo argumento `false`:

```php
    $response->assertSee($value, $escaped = true);
```

<a name="assert-see-in-order"></a>
#### asserteVer em ordem

 A afirmação indica que as strings fornecidas estão em ordem dentro da resposta. Esta afirmação irá escapar automaticamente as strings fornecidas, exceto se você passar o argumento `false`:

```php
    $response->assertSeeInOrder(array $values, $escaped = true);
```

<a name="assert-see-text"></a>
#### assertSeeText

 Afirmar que a string fornecida está contida no texto da resposta. Essa afirmação escapará automaticamente a string fornecida, exceto se você passar um segundo argumento de `false`. O conteúdo da resposta será passado para a função PHP `strip_tags` antes que a afirmação seja feita:

```php
    $response->assertSeeText($value, $escaped = true);
```

<a name="assert-see-text-in-order"></a>
#### assegurar que o texto está em ordem

 Afirmar que as cadeias de caracteres especificadas estão na ordem correta dentro do texto da resposta. Essa afirmação irá, automaticamente, evitar o escapamento das cadeias de caracteres especificadas, a menos que você passe um segundo argumento `false`. O conteúdo da resposta será passado para a função PHP `strip_tags` antes que a afirmação seja feita:

```php
    $response->assertSeeTextInOrder(array $values, $escaped = true);
```

<a name="assert-server-error"></a>
#### assertServerError

 Assegure que a resposta tem um código de estado HTTP de erro do servidor (> = 500, < 600):

```php
    $response->assertServerError();
```

<a name="assert-server-unavailable"></a>
#### Serviço indisponível

 Afirme que a resposta tem um código de estado HTTP de "Não disponível no serviço" (503):

```php
    $response->assertServiceUnavailable();
```

<a name="assert-session-has"></a>
#### assertsessão existe

 Afirme que a sessão contém o dado especificado:

```php
    $response->assertSessionHas($key, $value = null);
```

 Se necessário, um closure pode ser fornecido como o segundo argumento ao método `assertSessionHas`. A afirmação terá sucesso se o closure retornar `true`:

```php
    $response->assertSessionHas($key, function (User $value) {
        return $value->name === 'Taylor Otwell';
    });
```

<a name="assert-session-has-input"></a>
#### assertaQueAChamadaTemDados

 Acredite que uma determinada sessão tem um valor específico no [array de dados flash](/docs/responses#redirecting-with-flashed-session-data):

```php
    $response->assertSessionHasInput($key, $value = null);
```

 Se necessário, um fecho pode ser fornecido como o segundo argumento para a função `assertSessionHasInput`. A afirmação passará se o fecho retornar `true`:

```php
    use Illuminate\Support\Facades\Crypt;

    $response->assertSessionHasInput($key, function (string $value) {
        return Crypt::decryptString($value) === 'secret';
    });
```

<a name="assert-session-has-all"></a>
#### assertSessionHasAll

 Afirmar que a sessão contém um determinado conjunto de pares de chave/valor:

```php
    $response->assertSessionHasAll(array $data);
```

 Por exemplo, se sua aplicação incluir chaves de "nome" e "status", você pode afirmar que ambas existem e têm os valores especificados da seguinte maneira:

```php
    $response->assertSessionHasAll([
        'name' => 'Taylor Otwell',
        'status' => 'active',
    ]);
```

<a name="assert-session-has-errors"></a>
#### assertaQueSessãoTemErros

 Assert que a sessão contém um erro para os $keys indicados. Se $keys for um array associação, deve-se afirmar que a sessão contém uma mensagem de erro específica (valor) correspondente a cada campo (chave). Este método deve ser usado quando testar rotas que atualizam validações de erros para a sessão ao invés de retorná-las como uma estrutura JSON:

```php
    $response->assertSessionHasErrors(
        array $keys = [], $format = null, $errorBag = 'default'
    );
```

 Por exemplo, para afirmar que os campos "nome" e "e-mail" têm mensagens de erro de validação exibidas na sessão, pode chamar a método `assertSessionHasErrors`, do seguinte modo:

```php
    $response->assertSessionHasErrors(['name', 'email']);
```

 Você pode também assegurar que um campo específico tenha uma determinada mensagem de erro de validação:

```php
    $response->assertSessionHasErrors([
        'name' => 'The given name was invalid.'
    ]);
```

 > [!ATENÇÃO]
 O método [Invalidar](#assert-invalid) pode ser usado para afirmar que uma resposta retornou erros de validação como um JSON **ou** os erros foram mostrados na memória de sessão.

<a name="assert-session-has-errors-in"></a>
#### asserteQueAOrdemTemErros

 Assertar que a sessão contém um erro para as chaves especificadas no interior de um [sacos de erros](/#named-error-bags) específicos. Se $keys for um array associativo, o módulo vai assertar se na sessão existe uma mensagem de erro específica (valor) para cada campo (chave), dentro do saco de erros:

```php
    $response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

<a name="assert-session-has-no-errors"></a>
#### asserta que a sessão não tem erros

 Afirmar que a sessão não tem erros de validação:

```php
    $response->assertSessionHasNoErrors();
```

<a name="assert-session-doesnt-have-errors"></a>
#### assertaQueSessãoNãoTemErros

 Afirmar que a sessão não possui erros de validação para as chaves fornecidas:

```php
    $response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

 > [!AVISO]
 O método [assertaValido](#assert-valid) pode ser utilizado para assegurar que uma resposta não contém erros de validação que tenham sido retornados como JSON e que nenhum erro tenha sido armazenado em memória.

<a name="assert-session-missing"></a>
#### Assertion Session não encontrada

 Afirmar que a sessão não contém a chave indicada:

```php
    $response->assertSessionMissing($key);
```

<a name="assert-status"></a>
#### assertStatus

 Afirmar que a resposta possui um determinado código de estado HTTP:

```php
    $response->assertStatus($code);
```

<a name="assert-successful"></a>
#### assertSuccessful

 Afirme que a resposta tem um código de estado HTTP com sucesso (>= 200 e < 300):

```php
    $response->assertSuccessful();
```

<a name="assert-too-many-requests"></a>
#### Assert quantidade de requisições excessiva

 Afirme que a resposta tem um código de estado HTTP "Muitos pedidos" (429):

```php
    $response->assertTooManyRequests();
```

<a name="assert-unauthorized"></a>
#### assertUnauthorized

 Afirme que a resposta tem um código de estado HTTP não autorizado (401):

```php
    $response->assertUnauthorized();
```

<a name="assert-unprocessable"></a>
#### Assertando que o pedido é não processável

 Afirme que a resposta tem um código de estado HTTP Não processável (422):

```php
    $response->assertUnprocessable();
```

<a name="assert-unsupported-media-type"></a>
#### assertUnsupportedMediaType

 Afirmar que a resposta tem um tipo de mídia não suportado (415):

```php
    $response->assertUnsupportedMediaType();
```

<a name="assert-valid"></a>
#### assertValid

 Afirme que não existem erros de validação para as chaves indicadas. Este método pode ser usado para confirmar respostas em que os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram exibidos na sessão:

```php
    // Assert that no validation errors are present...
    $response->assertValid();

    // Assert that the given keys do not have validation errors...
    $response->assertValid(['name', 'email']);
```

<a name="assert-invalid"></a>
#### Assertão inválida

 Afirme que a resposta tem erros de validação para as chaves especificadas. Esse método pode ser usado como base para afirmações contra respostas onde os erros de validação são retornados na estrutura JSON ou onde os erros de validação foram enviados à sessão:

```php
    $response->assertInvalid(['name', 'email']);
```

 Também é possível afirmar que uma determinada chave tem uma mensagem de erro de validação específica. Para isso, podemos fornecer a mensagem completa ou apenas uma pequena parte da mesma:

```php
    $response->assertInvalid([
        'name' => 'The name field is required.',
        'email' => 'valid email address',
    ]);
```

<a name="assert-view-has"></a>
#### assertaQueExisteUmaVisualização

 Afirmar que o resumo da resposta contém determinados dados:

```php
    $response->assertViewHas($key, $value = null);
```

 Usar um closure como o segundo argumento do método `assertViewHas` permite que você faça inspeções e afirmações contra um determinado pedaço de dados de uma visão:

```php
    $response->assertViewHas('user', function (User $user) {
        return $user->name === 'Taylor';
    });
```

 Além disso, você pode acessar os dados do visual como variáveis de matriz na resposta, permitindo que você inspecione-os de maneira conveniente:

```php tab=Pest
expect($response['name'])->toBe('Taylor');
```

```php tab=PHPUnit
$this->assertEquals('Taylor', $response['name']);
```

<a name="assert-view-has-all"></a>
#### assertViewHasAll

 Afirme que o modelo de resposta tem uma lista de dados especificada:

```php
    $response->assertViewHasAll(array $data);
```

 Esse método pode ser utilizado para afirmar que a visualização contém dados que se coadunam com as chaves fornecidas:

```php
    $response->assertViewHasAll([
        'name',
        'email',
    ]);
```

 Você também pode afirmar que os dados de visualização estão presentes e possuem valores específicos:

```php
    $response->assertViewHasAll([
        'name' => 'Taylor Otwell',
        'email' => 'taylor@example.com,',
    ]);
```

<a name="assert-view-is"></a>
#### assertViewIs

 Afirme que a vista fornecida foi retornada pela rota:

```php
    $response->assertViewIs($value);
```

<a name="assert-view-missing"></a>
#### assertViewMissing

 Afirme que a chave de dados fornecida não foi incluída na resposta da aplicação:

```php
    $response->assertViewMissing($key);
```

<a name="authentication-assertions"></a>
### Asserções de autenticação

 O Laravel também disponibiliza várias afirmações relacionadas com a autenticação, que poderá utilizar nos testes de recursos da aplicação. Note-se que estas funcionalidades são invocadas na própria classe do teste e não na instância `Illuminate\Testing\TestResponse` retornada por métodos como `get` e `post`.

<a name="assert-authenticated"></a>
#### assertAutenticado

 Afirmar que um utilizador está autenticado:

```php
    $this->assertAuthenticated($guard = null);
```

<a name="assert-guest"></a>
#### assertGuest

 Afirme que um usuário não está autenticado:

```php
    $this->assertGuest($guard = null);
```

<a name="assert-authenticated-as"></a>
#### assertAutenticadoCom

 Afirmar que um usuário específico está autenticado:

```php
    $this->assertAuthenticatedAs($user, $guard = null);
```

<a name="validation-assertions"></a>
## Asserções de validação

 O Laravel fornece duas principais afirmações de validação que pode utilizar para garantir que os dados providenciados no seu pedido são válidos ou inválidos.

<a name="validation-assert-valid"></a>
#### assertValid

 Afirme que a resposta não tem erros de validação para as chaves indicadas. Este método pode ser utilizado para fazer afirmações contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram mostrados na sessão:

```php
    // Assert that no validation errors are present...
    $response->assertValid();

    // Assert that the given keys do not have validation errors...
    $response->assertValid(['name', 'email']);
```

<a name="validation-assert-invalid"></a>
#### AssertInvalido

 Afirme que a resposta apresenta erros de validação para as chaves indicadas. Pode ser utilizada para afirmarem-se em relação às respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram exibidos na sessão:

```php
    $response->assertInvalid(['name', 'email']);
```

 Você também pode indicar que uma determinada chave possui uma mensagem de erro de validação específica. Ao fazer isso, você pode fornecer a mensagem completa ou somente uma pequena parte da mesma:

```php
    $response->assertInvalid([
        'name' => 'The name field is required.',
        'email' => 'valid email address',
    ]);
```
