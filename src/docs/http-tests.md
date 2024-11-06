# Teste HTTP

<a name="introduction"></a>
## Introdução

Laravel fornece uma API muito fluente para fazer requisições HTTP à sua aplicação e examinar as respostas. Por exemplo, veja o teste de recurso abaixo:

::: code-group
```php [Pest]
<?php

test('the application returns a successful response', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Um exemplo de teste básico.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```
:::

O método `get` faz uma solicitação `GET` para o aplicativo, enquanto o método `assertStatus` afirma que a resposta retornada deve ter o código de status HTTP especificado. Além desta afirmação simples, o Laravel também possui uma variedade de afirmações para inspecionar os cabeçalhos de resposta, conteúdo, estrutura JSON e muito mais.

<a name="making-requests"></a>
## Fazendo Solicitações

Para fazer uma requisição ao seu aplicativo, você pode invocar os métodos `get`, `post`, `put`, `patch` ou `delete` dentro do seu teste. Esses métodos não fazem realmente uma requisição HTTP para o seu aplicativo. Em vez disso, todo o pedido de rede é simulado internamente.

Em vez de retornar uma instância de `Illuminate/Http/Response`, os métodos de teste retornam uma instância de `Illuminate/Testing/TestResponse` que fornece um [variedade de afirmações úteis](#available-assertions) que permitem inspecionar as respostas do seu aplicativo:

::: code-group
```php [Pest]
<?php

test('basic request', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Um exemplo de teste básico.
     */
    public function test_a_basic_request(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```
:::

Em geral, cada um de seus testes deveria fazer apenas uma solicitação à sua aplicação. Comportamento inesperado pode ocorrer se várias solicitações forem executadas em um único método de teste.

::: info Nota
Para conveniência, o *middleware* CSRF é desativado automaticamente quando os testes são executados.
:::

<a name="customizing-request-headers"></a>
### Personalizando cabeçalhos de solicitação

Você pode usar o método `withHeaders` para personalizar os cabeçalhos do pedido antes de ser enviado ao aplicativo. Este método permite-lhe adicionar quaisquer cabeçalhos personalizados que desejar à solicitação:

::: code-group
```php [Pest]
<?php

test('interacting with headers', function () {
    $response = $this->withHeaders([
        'X-Header' => 'Value',
    ])->post('/user', ['name' => 'Sally']);

    $response->assertStatus(201);
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Um exemplo básico de teste funcional.
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
:::

<a name="cookies"></a>
### Cookies

Você pode usar os métodos `withCookie` ou `withCookies` para definir valores de cookies antes de fazer uma requisição. O método `withCookie` aceita um nome e valor do *cookie* como seus dois argumentos, enquanto o método `withCookies` aceita uma matriz de pares de nomes/valores:

::: cod-group
```php [Pest]
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

```php [PHPUnit]
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
:::

<a name="session-and-authentication"></a>
### Sessão / Autenticação

O Laravel oferece vários ajudantes para interagir com as sessões durante os testes http. Primeiro, você pode definir os dados da sessão em um determinado *array* usando o método `withSession`. Isso é útil para carregar a sessão com os dados antes de enviar uma solicitação ao seu aplicativo.

::: code-group
```php [Pest]
<?php

test('interacting with the session', function () {
    $response = $this->withSession(['banned' => false])->get('/');

    //
});
```

```php [PHPUnit]
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
:::

O Laravel utiliza tipicamente sua sessão para manter o estado do usuário atualmente autenticado. Portanto, o método de ajuda `actingAs` fornece um meio simples de autenticar um determinado usuário como o usuário atual. Por exemplo, podemos usar uma [fábrica de modelo](/docs/eloquent-factories) para gerar e autenticar um usuário:

::: code-group
```php [Pest]
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

```php [PHPUnit]
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
:::

Você também pode especificar qual guarda deve ser usado para autenticar o usuário fornecido passando o nome do guarda como o segundo argumento para o método `actingAs`. O guarda que é fornecido para o método `actingAs` também se tornará o guarda padrão durante o teste:

```php
    $this->actingAs($user, 'web')
```

<a name="debugging-responses"></a>
### Respostas para depuração de erros

Após fazer uma solicitação de teste para sua aplicação, os métodos `dump`, `dumpHeaders` e `dumpSession` podem ser usados para examinar e depurar o conteúdo da resposta:

::: code-group
```php [Pest]
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->dumpHeaders();

    $response->dumpSession();

    $response->dump();
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Um exemplo de teste básico.
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
:::

Alternativamente, você pode usar os métodos `dd`, `ddHeaders` e `ddSession` para dar um *dump* de informações sobre a resposta e então parar a execução.

::: code-group
```php [Pest]
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->ddHeaders();

    $response->ddSession();

    $response->dd();
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Um exemplo de teste básico.
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
:::

<a name="exception-handling"></a>
### Tratamento de Exceções

Às vezes, você pode precisar testar se seu aplicativo está lançando uma exceção específica. Para fazer isso, você pode "falsificar" o manipulador de exceções por meio da *facade* `Exceptions`. Depois que o manipulador de exceções for falsificado, você pode utilizar os métodos `assertReported` e `assertNotReported` para fazer asserções contra exceções que foram lançadas durante a solicitação:

::: code-group
```php [Pest]
<?php

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;

test('exception is thrown', function () {
    Exceptions::fake();

    $response = $this->get('/order/1');

    // Afirme que uma exceção foi lançada...
    Exceptions::assertReported(InvalidOrderException::class);

    // Afirme contra a exceção...
    Exceptions::assertReported(function (InvalidOrderException $e) {
        return $e->getMessage() === 'The order was invalid.';
    });
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Um exemplo de teste básico.
     */
    public function test_exception_is_thrown(): void
    {
        Exceptions::fake();

        $response = $this->get('/');

        // Afirme que uma exceção foi lançada...
        Exceptions::assertReported(InvalidOrderException::class);

        // Afirme contra a exceção...
        Exceptions::assertReported(function (InvalidOrderException $e) {
            return $e->getMessage() === 'The order was invalid.';
        });
    }
}
```
:::

Os métodos `assertNotReported` e `assertNothingReported` podem ser usados para afirmar que uma exceção foi ou não lançada durante a requisição, respectivamente.

```php
Exceptions::assertNotReported(InvalidOrderException::class);

Exceptions::assertNothingReported();
```

Você pode desativar completamente a manipulação de exceções para uma solicitação dada invocando o método `withoutExceptionHandling` antes de fazer sua solicitação:

```php
    $response = $this->withoutExceptionHandling()->get('/');
```

Além disso, se você gostaria de garantir que seu aplicativo não está usando recursos que foram descontinuados pelo PHP ou as bibliotecas que seu aplicativo está usando, você pode invocar o método `withoutDeprecationHandling` antes de fazer sua solicitação. Quando a manipulação de desuso é desativada, avisos de depreciações serão convertidos em exceções, fazendo assim seu teste falhar:

```php
    $response = $this->withoutDeprecationHandling()->get('/');
```

O método `assertThrows` pode ser usado para verificar se um determinado código dentro de uma função anônima lança uma exceção do tipo especificado:

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    OrderInvalid::class
);
```

<a name="testing-json-apis"></a>
## Testando APIs JSON

Laravel também fornece vários auxiliares para testes de APIs JSON e suas respostas. Por exemplo, os métodos `json`, `getJson`, `postJson`, `putJson`, `patchJson`, `deleteJson` e `optionsJson` podem ser usados para fazer solicitações JSON com verbos HTTP diferentes. Você também pode passar facilmente dados e cabeçalhos a esses métodos. Para começar, vamos escrever um teste para fazer uma solicitação POST em `/api/user` e afirmar que os dados JSON esperados foram retornados:

::: code-group
```php [Pest]
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

```php [PHPUnit]
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Um exemplo básico de teste funcional.
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
:::

Além disso, os dados de resposta JSON podem ser acessados como variáveis de matriz na resposta, tornando conveniente para você inspecionar os valores individuais retornados dentro de uma resposta JSON.

::: code-group
```php [Pest]
expect($response['created'])->toBeTrue();
```

```php [PHPUnit]
$this->assertTrue($response['created']);
```
:::

::: info Nota
O método `assertJson` converte a resposta em um *array* e utiliza o `PHPUnit::assertArraySubset` para verificar se o *array* fornecido existe na resposta JSON retornada pela aplicação. Assim, se houver outras propriedades na resposta JSON, esse teste ainda passará desde que o fragmento fornecido esteja presente.
:::

<a name="verifying-exact-match"></a>
#### Afirmando Combinações Exatas do JSON

Como mencionado anteriormente, o método `assertJson` pode ser usado para afirmar que uma parte do arquivo JSON existe dentro do JSON da resposta. Se você deseja verificar se um determinado *array* **corresponde exatamente** ao JSON retornado pelo seu aplicativo, você deve usar o método `assertExactJson`:

::: code-group
```php [Pest]
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

```php [PHPUnit]
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Um exemplo básico de teste funcional.
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
:::

<a name="verifying-json-paths"></a>
#### Afirmando caminhos JSON

Se você gostaria de verificar que a resposta JSON contém os dados dados em um caminho especificado, você deve usar o método `assertJsonPath`:

::: code-group
```php [Pest]
<?php

test('asserting a json path value', function () {
    $response = $this->postJson('/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertJsonPath('team.owner.name', 'Darian');
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Um exemplo básico de teste funcional.
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
:::

O método `assertJsonPath` também aceita um *closure* que pode ser usado para determinar dinamicamente se a afirmação deve passar:

```php
    $response->assertJsonPath('team.owner.name', fn (string $name) => strlen($name) >= 3);
```

<a name="fluent-json-testing"></a>
### Testes Fluente de JSON

Laravel também oferece um belo jeito de testar fluentemente as respostas JSON da sua aplicação. Para começar, passe uma função para o método `assertJson`. Esta função será invocada com uma instância de `Illuminate\Testing\Fluent\AssertableJson`, que pode ser utilizada para fazer afirmações sobre o JSON retornado pela sua aplicação. O método `where` pode ser usado para fazer afirmações sobre um atributo específico do JSON, enquanto o método `missing` pode ser utilizado para afirmar que um atributo específico está ausente do JSON:

::: code-group
```php [Pest]
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

```php [PHPUnit]
use Illuminate\Testing\Fluent\AssertableJson;

/**
 * Um exemplo básico de teste funcional.
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
:::

#### Compreendendo o Método `etc`

No exemplo acima você pode ter notado que invocamos o método `etc` no final de nossa cadeia de afirmações. Este método informa ao Laravel que pode haver outros atributos presentes no objeto JSON. Se o método `etc` não for utilizado, a prova vai falhar se houver outros atributos que você não fez afirmações contra no objeto JSON.

A intenção por trás desse comportamento é proteger você de expor acidentalmente informações confidenciais nas suas respostas JSON, forçando-o a fazer uma afirmação explícita contra o atributo ou permitir explicitamente atributos adicionais pelo método etc.

No entanto, você deve estar ciente de que não incluir o método `etc` em sua cadeia de asserção não garante que atributos adicionais não estão sendo adicionados a matrizes aninhadas dentro do seu objeto JSON. O método `etc` só garante que não há atributos adicionais na camada de aninhamento em que o método `etc` é invocado.

<a name="asserting-json-attribute-presence-and-absence"></a>
#### Afirmando presença/ausência de atributos

Para afirmar que um atributo está presente ou ausente, você pode usar os métodos `has` e `missing`:

```php
    $response->assertJson(fn (AssertableJson $json) =>
        $json->has('data')
             ->missing('message')
    );
```

Além disso, os métodos `hasAll` e `missingAll` permitem afirmar a presença ou ausência de vários atributos simultaneamente:

```php
    $response->assertJson(fn (AssertableJson $json) =>
        $json->hasAll(['status', 'data'])
             ->missingAll(['message', 'code'])
    );
```

Você pode usar o método `hasAny` para determinar se, pelo menos um dos atributos dados está presente:

```php
    $response->assertJson(fn (AssertableJson $json) =>
        $json->has('status')
             ->hasAny('data', 'message', 'code')
    );
```

<a name="asserting-against-json-collections"></a>
#### Afirmando contra coleções JSON

Sua rota pode retornar uma resposta em JSON que contenha múltiplos itens, como múltiplos usuários:

```php
    Route::get('/users', function () {
        return User::all();
    });
```

Nestas situações, podemos usar o método `has` do objeto JSON para fazer afirmações sobre os usuários incluídos na resposta. Por exemplo, vamos afirmar que a resposta JSON contém três usuários. Em seguida, faremos algumas afirmações sobre o primeiro usuário na coleção usando o método `first`. O método `first` aceita uma função de *closure* que recebe outra string JSON verificável, que podemos usar para fazer afirmações sobre o primeiro objeto na coleção JSON:

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
#### Escopo de asserções de coleção JSON

Às vezes, as rotas de sua aplicação vão retornar coleções JSON com chaves nomeadas.

```php
    Route::get('/users', function () {
        return [
            'meta' => [...],
            'users' => User::all(),
        ];
    })
```

Ao testar essas rotas, você pode usar o método `has` para fazer assert contra o número de itens na coleção. Além disso, você pode usar o método `has` para fazer escopo de uma cadeia de assertivas:

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

No entanto, em vez de fazer duas chamadas separadas para o método `has` para fazer assert contra a coleção `users`, você pode fazer uma única chamada que fornece um *closure* como seu terceiro parâmetro. Ao fazer isso, o *closure* será automaticamente invocado e terá como escopo o primeiro item na coleção:

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
#### Assertando tipos JSON

Você talvez só queira afirmar que as propriedades na resposta JSON são de um determinado tipo. A classe `Illuminate\Testing\Fluent\AssertableJson` fornece os métodos `whereType` e `whereAllType` para fazer exatamente isso:

```php
    $response->assertJson(fn (AssertableJson $json) =>
        $json->whereType('id', 'integer')
             ->whereAllType([
                'users.0.name' => 'string',
                'meta' => 'array'
            ])
    );
```

Você pode especificar vários tipos usando o caractere `|` ou passando uma matriz de tipos como segundo parâmetro para o método `whereType`. A afirmação será bem sucedida se o valor da resposta for qualquer um dos tipos listados.

```php
    $response->assertJson(fn (AssertableJson $json) =>
        $json->whereType('name', 'string|null')
             ->whereType('id', ['string', 'integer'])
    );
```

Os métodos `whereType` e `whereAllType` reconhecem os seguintes tipos: `string`, `integer`, `double`, `boolean`, `array` e `null`.

<a name="testing-file-uploads"></a>
## Teste de upload de arquivos

A classe `Illuminate\Http\UploadedFile` oferece um método `fake`, que pode ser usado para gerar arquivos ou imagens falsas para testes. Isso, combinado com o método `fake` da *facade* `Storage`, simplifica muito a realização de testes em envios de arquivos. Por exemplo, você pode combinar essas duas funcionalidades para testar facilmente um formulário de upload de avatar:

::: code-group
```php [Pest]
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

```php [PHPUnit]
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
:::

Se você gostaria de afirmar que um determinado arquivo não existe, você pode usar o método `assertMissing` fornecido pela *facade* `Storage`:

```php
    Storage::fake('avatars');

    // ...

    Storage::disk('avatars')->assertMissing('missing.jpg');
```

<a name="fake-file-customization"></a>
#### Personalização de Arquivos Falsos

Ao criar arquivos usando o método `fake` fornecido pela classe `UploadedFile` você pode especificar a largura, altura e tamanho da imagem (em kilobytes), de forma a testar melhor as regras de validação do seu aplicativo.

```php
    UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

Além de criar imagens, você pode criar arquivos do tipo que quiser usando o método `create`:

```php
    UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

Se necessário, você pode passar um argumento `mime-type` para o método para definir explicitamente o tipo de MIME que deve ser retornado pelo arquivo:

```php
    UploadedFile::fake()->create(
        'document.pdf', $sizeInKilobytes, 'application/pdf'
    );
```

<a name="testing-views"></a>
## Testando Views

O Laravel também permite renderizar uma visualização sem fazer um pedido HTTP simulado para o aplicativo. Para fazer isso, você pode chamar o método `view` dentro de seu teste. O método `view` aceita o nome da visualização e uma matriz opcional de dados. O método retorna uma instância de `Illuminate\Testing\TestView`, que oferece vários métodos para fazer convenientemente afirmações sobre o conteúdo da visualização:

::: code-group
```php [Pest]
<?php

test('a welcome view can be rendered', function () {
    $view = $this->view('welcome', ['name' => 'Taylor']);

    $view->assertSee('Taylor');
});
```

```php [PHPUnit]
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
:::

A classe `TestView` fornece os seguintes métodos de afirmação: `assertSee`, `assertSeeInOrder`, `assertSeeText`, `assertSeeTextInOrder`, `assertDontSee` e `assertDontSeeText`.

Se necessário, você pode obter o conteúdo bruto da visualização renderizada convertendo a instância `TestView` para um:

```php
    $contents = (string) $this->view('welcome');
```

<a name="sharing-errors"></a>
#### Compartilhando Erros

Algumas visualizações podem depender de erros compartilhados no [global *error bag* fornecido pelo Laravel](/docs/validation#quick-displaying-the-validation-errors). Para hidratar o *error bag* com mensagens de erro, você pode usar o método `withViewErrors`:

```php
    $view = $this->withViewErrors([
        'name' => ['Please provide a valid name.']
    ])->view('form');

    $view->assertSee('Please provide a valid name.');
```

<a name="rendering-blade-and-components"></a>
### Renderização de blades e componentes

Se necessário, você pode usar o método `blade` para avaliar e renderizar uma string [Blade](/docs/blade) bruta. Assim como o método `view`, o método `blade` retorna uma instância de `Illuminate\Testing\TestView`:

```php
    $view = $this->blade(
        '<x-component :name="$name" />',
        ['name' => 'Taylor']
    );

    $view->assertSee('Taylor');
```

Você pode usar o método `component` para avaliar e renderizar um componente [Blade](/docs/blade#components) . O método `component` retorna uma instância de `Illuminate\Testing\TestComponent`:

```php
    $view = $this->component(Profile::class, ['name' => 'Taylor']);

    $view->assertSee('Taylor');
```

<a name="available-assertions"></a>
## Afirmações disponíveis

<a name="response-assertions"></a>
### Afirmações para Resposta

A classe `Illuminate\Testing\TestResponse` do Laravel fornece uma variedade de métodos de afirmação personalizados que você pode utilizar ao testar seu aplicativo. Essas afirmações podem ser acessadas na resposta que é retornada pelos métodos `json`, `get`, `post`, `put` e `delete`:

[assertAccepted](#assert-accepted)
[assertBadRequest](#assert-bad-request)
[assertConflict](#assert-conflict)
[assertCookie](#assert-cookie)
[assertCookieExpired](#assert-cookie-expired)
[assertCookieNotExpired](#assert-cookie-not-expired)
[assertCookieMissing](#assert-cookie-missing)
[assertCreated](#assert-created)
[assertDontSee](#assert-dont-see)
[assertDontSeeText](#assert-dont-see-text)
[assertDownload](#assert-download)
[assertExactJson](#assert-exact-json)
[assertForbidden](#assert-forbidden)
[assertFound](#assert-found)
[assertGone](#assert-gone)
[assertHeader](#assert-header)
[assertHeaderMissing](#assert-header-missing)
[assertInternalServerError](#assert-internal-server-error)
[assertJson](#assert-json)
[assertJsonCount](#assert-json-count)
[assertJsonFragment](#assert-json-fragment)
[assertJsonIsArray](#assert-json-is-array)
[assertJsonIsObject](#assert-json-is-object)
[assertJsonMissing](#assert-json-missing)
[assertJsonMissingExact](#assert-json-missing-exact)
[assertJsonMissingValidationErrors](#assert-json-missing-validation-errors)
[assertJsonPath](#assert-json-path)
[assertJsonMissingPath](#assert-json-missing-path)
[assertJsonStructure](#assert-json-structure)
[assertJsonValidationErrors](#assert-json-validation-errors)
[assertJsonValidationErrorFor](#assert-json-validation-error-for)
[assertLocation](#assert-location)
[assertMethodNotAllowed](#assert-method-not-allowed)
[assertMovedPermanently](#assert-moved-permanently)
[assertContent](#assert-content)
[assertNoContent](#assert-no-content)
[assertStreamedContent](#assert-streamed-content)
[assertNotFound](#assert-not-found)
[assertOk](#assert-ok)
[assertPaymentRequired](#assert-payment-required)
[assertPlainCookie](#assert-plain-cookie)
[assertRedirect](#assert-redirect)
[assertRedirectContains](#assert-redirect-contains)
[assertRedirectToRoute](#assert-redirect-to-route)
[assertRedirectToSignedRoute](#assert-redirect-to-signed-route)
[assertRequestTimeout](#assert-request-timeout)
[assertSee](#assert-see)
[assertSeeInOrder](#assert-see-in-order)
[assertSeeText](#assert-see-text)
[assertSeeTextInOrder](#assert-see-text-in-order)
[assertServerError](#assert-server-error)
[assertServiceUnavailable](#assert-server-unavailable)
[assertSessionHas](#assert-session-has)
[assertSessionHasInput](#assert-session-has-input)
[assertSessionHasAll](#assert-session-has-all)
[assertSessionHasErrors](#assert-session-has-errors)
[assertSessionHasErrorsIn](#assert-session-has-errors-in)
[assertSessionHasNoErrors](#assert-session-has-no-errors)
[assertSessionDoesntHaveErrors](#assert-session-doesnt-have-errors)
[assertSessionMissing](#assert-session-missing)
[assertStatus](#assert-status)
[assertSuccessful](#assert-successful)
[assertTooManyRequests](#assert-too-many-requests)
[assertUnauthorized](#assert-unauthorized)
[assertUnprocessable](#assert-unprocessable)
[assertUnsupportedMediaType](#assert-unsupported-media-type)
[assertValid](#assert-valid)
[assertInvalid](#assert-invalid)
[assertViewHas](#assert-view-has)
[assertViewHasAll](#assert-view-has-all)
[assertViewIs](#assert-view-is)
[assertViewMissing](#assert-view-missing)

<a name="assert-bad-request"></a>
#### assertBadRequest

Afirmar que a requisição é inválida (400) no código de estado HTTP:

```php
    $response->assertBadRequest();
```

<a name="assert-accepted"></a>
#### assertAccepted

Afirmar que a resposta tem um código de estado HTTP aceito (202):

```php
    $response->assertAccepted();
```

<a name="assert-conflict"></a>
#### assertConflict

Afirme que a resposta tem um conflito (409) código de estado HTTP:

```php
    $response->assertConflict();
```

<a name="assert-cookie"></a>
#### assertCookie

Afirmar que a resposta contém o cookie fornecido.

```php
    $response->assertCookie($cookieName, $value = null);
```

<a name="assert-cookie-expired"></a>
#### assertCookieExpired

Afirme que a resposta contém o cookie dado e está expirado:

```php
    $response->assertCookieExpired($cookieName);
```

<a name="assert-cookie-not-expired"></a>
#### assertCookieNotExpired

Afirme que a resposta contém o cookie fornecido e não está expirado:

```php
    $response->assertCookieNotExpired($cookieName);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

Afirme que a resposta não contém o cookie fornecido:

```php
    $response->assertCookieMissing($cookieName);
```

<a name="assert-created"></a>
#### assertCreated

Afirme que a resposta tem o código de estado HTTP 201.

```php
    $response->assertCreated();
```

<a name="assert-dont-see"></a>
#### assertDontSee

Afirmar que a string dada não está contida na resposta retornada pelo aplicativo. Esta afirmação irá escapar automaticamente a string dada a menos que você passe um segundo argumento `false`:

```php
    $response->assertDontSee($value, $escaped = true);
```

<a name="assert-dont-see-text"></a>
#### assertDontSeeText

Afirme que a string fornecida não está contida no texto de resposta. Esta afirmação escapará automaticamente a string fornecida, a menos que você passe um segundo argumento `false`. Este método passará o conteúdo de resposta para a função `strip_tags` do PHP antes de fazer a afirmação:

```php
    $response->assertDontSeeText($value, $escaped = true);
```

<a name="assert-download"></a>
#### assertDownload

Afirme que a resposta é um download. Normalmente isso significa o recurso invocado que devolveu a resposta retornou `Response::download`, `BinaryFileResponse` ou `Storage::download`;

```php
    $response->assertDownload();
```

Se desejar, você pode afirmar que o arquivo baixável foi atribuído um determinado nome de arquivo:

```php
    $response->assertDownload('image.jpg');
```

<a name="assert-exact-json"></a>
#### assertExactJson

Afirme que a resposta contém uma correspondência exata dos dados JSON fornecidos:

```php
    $response->assertExactJson(array $data);
```

<a name="assert-forbidden"></a>
#### assertForbidden

Afirme que o response tem um status de http 403:

```php
    $response->assertForbidden();
```

<a name="assert-found"></a>
#### assertFound

Afirmar que a resposta tem um código de estado HTTP (302):

```php
    $response->assertFound();
```

<a name="assert-gone"></a>
#### assertGone

Afirmar que a resposta tem um (410) código de estado HTTP:

```php
    $response->assertGone();
```

<a name="assert-header"></a>
#### assertHeader

Afirmar que o cabeçalho e valor dados estão presentes na resposta.

```php
    $response->assertHeader($headerName, $value = null);
```

<a name="assert-header-missing"></a>
#### assertHeaderMissing

Afirmar que o cabeçalho fornecido não está presente na resposta:

```php
    $response->assertHeaderMissing($headerName);
```

<a name="assert-internal-server-error"></a>
#### assertInternalServerError

Afirmar que a resposta tem o código de estado http "Internal Server Error" (500):

```php
    $response->assertInternalServerError();
```

<a name="assert-json"></a>
#### assertJson

Afirme que a resposta contém os dados JSON fornecidos:

```php
    $response->assertJson(array $data, $strict = false);
```

O método `assertJson` converte a resposta para um *array* e utiliza o método `PHPUnit::assertArraySubset` para verificar que o *array* dado existe na resposta json retornada pela aplicação. Portanto, se houver outras propriedades na resposta json, esta teste ainda será aprovado desde que o fragmento fornecido esteja presente.

<a name="assert-json-count"></a>
#### assertJsonCount

Afirme que a resposta JSON tem uma matriz com o número esperado de itens na chave dada:

```php
    $response->assertJsonCount($count, $key = null);
```

<a name="assert-json-fragment"></a>
#### assertJsonFragment

Afirme que a resposta contém os dados JSON fornecidos em qualquer lugar da resposta:

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

Afirmar que a resposta JSON é um array:

```php
    $response->assertJsonIsArray();
```

<a name="assert-json-is-object"></a>
#### assertJsonIsObject

Afirmar que a resposta JSON é um objeto:

```php
    $response->assertJsonIsObject();
```

<a name="assert-json-missing"></a>
#### assertJsonMissing

Afirme que a resposta não contém os dados JSON fornecidos:

```php
    $response->assertJsonMissing(array $data);
```

<a name="assert-json-missing-exact"></a>
#### assertJsonMissingExact

Afirme que a resposta não contém os dados JSON exatos:

```php
    $response->assertJsonMissingExact(array $data);
```

<a name="assert-json-missing-validation-errors"></a>
#### assertJsonMissingValidationErrors

Afirme que a resposta não possui erros de validação JSON para as chaves especificadas:

```php
    $response->assertJsonMissingValidationErrors($keys);
```

::: info NOTA
O método mais genérico [assertValid](#assert-valid) pode ser usado para afirmar que uma resposta não tem erros de validação retornados como JSON e que não houve erros "flashados" em um armazenamento de sessão.
:::

<a name="assert-json-path"></a>
#### assertJsonPath

Afirme que a resposta contém os dados especificados no caminho:

```php
    $response->assertJsonPath($path, $expectedValue);
```

Por exemplo, se a seguinte resposta JSON for retornada pela sua aplicação:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Você pode afirmar que a propriedade `name` do objeto `user` corresponde a um determinado valor assim:

```php
    $response->assertJsonPath('user.name', 'Steve Schoger');
```

<a name="assert-json-missing-path"></a>
#### assertJsonMissingPath

Afirme que a resposta não contém o caminho fornecido:

```php
    $response->assertJsonMissingPath($path);
```

Por exemplo, se a seguinte resposta JSON for retornada pelo seu aplicativo:

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
#### assertJsonStructure

Afirmar que a resposta tem uma estrutura JSON dada:

```php
    $response->assertJsonStructure(array $structure);
```

Por exemplo, se a resposta JSON retornada pela sua aplicação contiver os seguintes dados:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Você pode afirmar que a estrutura JSON corresponde às suas expectativas como assim:

```php
    $response->assertJsonStructure([
        'user' => [
            'name',
        ]
    ]);
```

Às vezes, as respostas JSON retornadas pela sua aplicação podem conter uma matriz de objetos:

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

Nesta situação, você pode usar o caractere '*' para afirmar contra a estrutura de todos os objetos no *array*.

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
#### assertJsonValidationErrors

Afirme que a resposta tem erros de validação JSON para as chaves dadas. Este método deve ser usado quando você está afirmando contra respostas onde os erros de validação são retornados como uma estrutura JSON em vez de serem exibidos na sessão.

```php
    $response->assertJsonValidationErrors(array $data, $responseKey = 'errors');
```

::: info NOTA
O método [assertInvalid](#assert-invalid) genérico pode ser usado para verificar que uma resposta contém erros de validação retornados como JSON ou que os erros foram "flashados" na sessão do armazenamento.
:::

<a name="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

Afirma que a resposta tem algum erro de validação do JSON para a chave dada:

```php
    $response->assertJsonValidationErrorFor(string $key, $responseKey = 'errors');
```

<a name="assert-method-not-allowed"></a>
#### assertMethodNotAllowed

Afirmar que a resposta tem um método não permitido (405) HTTP:

```php
    $response->assertMethodNotAllowed();
```

<a name="assert-moved-permanently"></a>
#### assertMovedPermanently

Afirme que a resposta tem o código de estado HTTP 301 (movido permanentemente):

```php
    $response->assertMovedPermanently();
```

<a name="assert-location"></a>
#### assertLocation

Afirme que a resposta tem o valor URI fornecido no cabeçalho `Location`:

```php
    $response->assertLocation($uri);
```

<a name="assert-content"></a>
#### assertContent

Afirme que a string dada corresponde ao conteúdo de resposta:

```php
    $response->assertContent($value);
```

<a name="assert-no-content"></a>
#### assertNoContent

Afirmar que a resposta tem o dado código de estado http e sem conteúdo:

```php
    $response->assertNoContent($status = 204);
```

<a name="assert-streamed-content"></a>
#### assertStreamedContent

Afirme que a string fornecida corresponde ao conteúdo da resposta transmitida:

```php
    $response->assertStreamedContent($value);
```

<a name="assert-not-found"></a>
#### assertNotFound

Afirme que a resposta tem um código de estado HTTP não encontrado (404):

```php
    $response->assertNotFound();
```

<a name="assert-ok"></a>
#### assertOk

Afirmar que a resposta tem um código HTTP 200:

```php
    $response->assertOk();
```

<a name="assert-payment-required"></a>
#### assertPaymentRequired

Afirme que a resposta tem um código de status HTTP de pagamento obrigatório (402):

```php
    $response->assertPaymentRequired();
```

<a name="assert-plain-cookie"></a>
#### assertPlainCookie

Afirmar que a resposta contém o cookie fornecido não criptografado:

```php
    $response->assertPlainCookie($cookieName, $value = null);
```

<a name="assert-redirect"></a>
#### assertRedirect

Afirmar que a resposta é um redirecionamento para o URI fornecido:

```php
    $response->assertRedirect($uri = null);
```

<a name="assert-redirect-contains"></a>
#### assertRedirectContains

Afirme se o resultado redireciona a uma URI que contém a string dada:

```php
    $response->assertRedirectContains($string);
```

<a name="assert-redirect-to-route"></a>
#### assertRedirectToRoute

Afirme que a resposta é um redirecionamento para a [rota nomeada](/docs/routing#named-routes):

```php
    $response->assertRedirectToRoute($name, $parameters = []);
```

<a name="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

Afirme que a resposta é um redirecionamento para a [rota assinada](/docs/urls#signed-urls) fornecida:

```php
    $response->assertRedirectToSignedRoute($name = null, $parameters = []);
```

<a name="assert-request-timeout"></a>
#### assertRequestTimeout

Afirmar que a resposta tem um tempo limite de requisição (408) HTTP:

```php
    $response->assertRequestTimeout();
```

<a name="assert-see"></a>
#### assertSee

Afirme que a string fornecida esteja contida na resposta. Essa afirmação escapará automaticamente da string fornecida, a menos que você passe um segundo argumento `false`:

```php
    $response->assertSee($value, $escaped = true);
```

<a name="assert-see-in-order"></a>
#### assertSeeInOrder

Afirme que as strings dadas estão contidas em ordem dentro da resposta. Essa afirmação irá automaticamente escapar das strings dadas, a menos que você passe um segundo argumento `false`:

```php
    $response->assertSeeInOrder(array $values, $escaped = true);
```

<a name="assert-see-text"></a>
#### assertSeeText

Afirma que a string fornecida está contida no texto da resposta. Esta afirmação irá escapar automaticamente a string fornecida, a menos que você passe um segundo argumento de `false`. O conteúdo da resposta será passado para a função PHP `strip_tags` antes da afirmação ser feita:

```php
    $response->assertSeeText($value, $escaped = true);
```

<a name="assert-see-text-in-order"></a>
#### assertSeeTextInOrder

Afirme que as strings fornecidas estão contidas em ordem dentro do texto de resposta. Esta afirmação irá escapar automaticamente as strings fornecidas, a menos que você passe um segundo argumento de `false`. O conteúdo da resposta será passado para a função PHP `strip_tags` antes que a afirmação seja feita:

```php
    $response->assertSeeTextInOrder(array $values, $escaped = true);
```

<a name="assert-server-error"></a>
#### assertServerError

Afirme que a resposta tem um erro de servidor (>= 500, < 600) Código de status HTTP:

```php
    $response->assertServerError();
```

<a name="assert-server-unavailable"></a>
#### assertServiceUnavailable

Afirme que a resposta tem um "Service Unavailable" (503):

```php
    $response->assertServiceUnavailable();
```

<a name="assert-session-has"></a>
#### assertSessionHas

Afirme que a sessão contém o dado fornecido:

```php
    $response->assertSessionHas($key, $value = null);
```

Se necessário, um *closure* pode ser fornecido como o segundo argumento para o método `assertSessionHas`. A asserção passará se o *closure* retornar `true`:

```php
    $response->assertSessionHas($key, function (User $value) {
        return $value->name === 'Taylor Otwell';
    });
```

<a name="assert-session-has-input"></a>
#### assertSessionHasInput

Afirme que a sessão tem um valor fornecido no [*array* de entrada flasheado](/docs/responses#redirecting-with-flashed-session-data):

```php
    $response->assertSessionHasInput($key, $value = null);
```

Se necessário, um *closure* pode ser fornecido como o segundo argumento para o método `assertSessionHasInput`. A afirmação passará se o *closure* retornar `verdadeiro`:

```php
    use Illuminate\Support\Facades\Crypt;

    $response->assertSessionHasInput($key, function (string $value) {
        return Crypt::decryptString($value) === 'secret';
    });
```

<a name="assert-session-has-all"></a>
#### assertSessionHasAll

Afirme que a sessão contém um dado *array* de pares chave/valor.

```php
    $response->assertSessionHasAll(array $data);
```

Por exemplo, se a sessão do seu aplicativo contém as chaves 'name' e 'status', você pode afirmar que ambas existem e possuem os valores especificados da seguinte maneira:

```php
    $response->assertSessionHasAll([
        'name' => 'Taylor Otwell',
        'status' => 'active',
    ]);
```

<a name="assert-session-has-errors"></a>
#### assertSessionHasErrors

Afirme que a sessão contém um erro para as `$keys` fornecidas. Se `$keys` for uma matriz associativa, afirme que a sessão contém uma mensagem de erro específica (valor) para cada campo (chave). Este método deve ser usado ao testar rotas que exibem erros de validação para a sessão em vez de retorná-los como uma estrutura JSON:

```php
    $response->assertSessionHasErrors(
        array $keys = [], $format = null, $errorBag = 'default'
    );
```

Por exemplo, para afirmar que os campos 'name' e 'email' têm mensagens de erro de validação que foram exibidas na sessão, você pode invocar o método `assertSessionHasErrors` assim:

```php
    $response->assertSessionHasErrors(['name', 'email']);
```

Ou você pode afirmar que um campo dado tem uma mensagem de erro de validação específica:

```php
    $response->assertSessionHasErrors([
        'name' => 'The given name was invalid.'
    ]);
```

::: info NOTA
O método genérico [assertInvalid](#assert-invalid) pode ser usado para afirmar que uma resposta tem erros de validação retornados como JSON **ou** que os erros foram flashados no armazenamento da sessão.
:::

<a name="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

Afirme que a sessão contém um erro para as `$keys` fornecidas dentro de um [error bag](/docs/validation#named-error-bags) específico. Se `$keys` for uma matriz associativa, afirme que a sessão contém uma mensagem de erro específica (valor) para cada campo (chave), dentro do error bag:

```php
    $response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

<a name="assert-session-has-no-errors"></a>
#### assertSessionHasNoErrors

Afirme que a sessão não tem erros de validação:

```php
    $response->assertSessionHasNoErrors();
```

<a name="assert-session-doesnt-have-errors"></a>
#### assertSessionDoesntHaveErrors

Afirmar que a sessão não tem erros de validação para as chaves dadas:

```php
    $response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

::: info NOTA
O método mais genérico [assertValid](#assert-valid) pode ser usado para afirmar que uma resposta não tem erros de validação que foram retornados como JSON **e** que nenhum erro foi enviado ao armazenamento de sessão.
:::

<a name="assert-session-missing"></a>
#### assertSessionMissing

Afirme que a sessão não contém a chave fornecida:

```php
    $response->assertSessionMissing($key);
```

<a name="assert-status"></a>
#### assertStatus

Afirme que a resposta tem um determinado código de estado HTTP:

```php
    $response->assertStatus($code);
```

<a name="assert-successful"></a>
#### assertSuccessful

Afirme que a resposta tem um código de status HTTP bem-sucedido (>= 200 e < 300):

```php
    $response->assertSuccessful();
```

<a name="assert-too-many-requests"></a>
#### assertTooManyRequests

Afirme que a resposta tem um código de status HTTP de muitas solicitações (429):

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
#### assertUnprocessable

Afirme que a resposta tem um código de estado HTTP não processável (422):

```php
    $response->assertUnprocessable();
```

<a name="assert-unsupported-media-type"></a>
#### assertUnsupportedMediaType

Afirme que a resposta tem um tipo de mídia não suportado (415) Código de status HTTP:

```php
    $response->assertUnsupportedMediaType();
```

<a name="assert-valid"></a>
#### assertValid

Afirme que a resposta não tem erros de validação para as chaves fornecidas. Este método pode ser usado para fazer a afirmação contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram exibidos na sessão:

```php
    // Afirme que não há erros de validação presentes...
    $response->assertValid();

    // Afirme que as chaves fornecidas não têm erros de validação...
    $response->assertValid(['name', 'email']);
```

<a name="assert-invalid"></a>
#### assertInvalid

Afirme que a resposta tem erros de validação para as chaves fornecidas. Este método pode ser usado para fazer a afirmação contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram exibidos na sessão:

```php
    $response->assertInvalid(['name', 'email']);
```

Você também pode afirmar que uma determinada chave tem uma mensagem de erro de validação específica. Ao fazer isso, você pode fornecer a mensagem inteira ou apenas uma pequena parte da mensagem:

```php
    $response->assertInvalid([
        'name' => 'The name field is required.',
        'email' => 'valid email address',
    ]);
```

<a name="assert-view-has"></a>
#### assertViewHas

Afirme que a resposta contém um determinado pedaço de dados.

```php
    $response->assertViewHas($key, $value = null);
```

Passar um *closure* como segundo argumento para o método `assertViewHas` permitirá inspecionar e fazer afirmações contra uma peça de dados específicos de exibição.

```php
    $response->assertViewHas('user', function (User $user) {
        return $user->name === 'Taylor';
    });
```

Além disso, os dados de visualização podem ser acessados como variáveis de matriz na resposta, permitindo inspecionar os dados com mais facilidade:

::: code-group
```php [Pest]
expect($response['name'])->toBe('Taylor');
```

```php [PHPUnit]
$this->assertEquals('Taylor', $response['name']);
```
:::

<a name="assert-view-has-all"></a>
#### assertViewHasAll

Afirme que a resposta visual tem uma determinada lista de dados:

```php
    $response->assertViewHasAll(array $data);
```

Este método pode ser usado para afirmar que o conjunto de dados contém apenas os registros correspondentes às chaves dadas:

```php
    $response->assertViewHasAll([
        'name',
        'email',
    ]);
```

Ou, você pode afirmar que os dados da *view* estão presentes e têm valores específicos.

```php
    $response->assertViewHasAll([
        'name' => 'Taylor Otwell',
        'email' => 'taylor@example.com,',
    ]);
```

<a name="assert-view-is"></a>
#### assertViewIs

Afirme que a *view* dada foi retornada pela rota:

```php
    $response->assertViewIs($value);
```

<a name="assert-view-missing"></a>
#### assertViewMissing

Afirme que a chave de dados fornecida não foi disponibilizada para a visualização retornada na resposta do aplicativo:

```php
    $response->assertViewMissing($key);
```

<a name="authentication-assertions"></a>
### Afirmações de Autenticação

O Laravel também fornece uma variedade de asserções relacionadas à autenticação que você pode utilizar dentro dos testes de recursos do seu aplicativo. Observe que esses métodos são invocados na própria classe de teste e não na instância `Illuminate\Testing\TestResponse` retornada por métodos como `get` e `post`.

<a name="assert-authenticated"></a>
#### assertAuthenticated

Afirmar que o usuário está autenticado:

```php
    $this->assertAuthenticated($guard = null);
```

<a name="assert-guest"></a>
#### assertGuest

Afirmar que um usuário não está autenticado:

```php
    $this->assertGuest($guard = null);
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

Afirme que um usuário específico está autenticado:

```php
    $this->assertAuthenticatedAs($user, $guard = null);
```

<a name="validation-assertions"></a>
## Afirmações para Validação

Laravel fornece duas principais afirmações de validação relacionadas que você pode usar para garantir os dados fornecidos em sua solicitação foram válidos ou inválidos.

<a name="validation-assert-valid"></a>
#### assertValid

Afirme que a resposta não tem erros de validação para as chaves fornecidas. Este método pode ser usado para fazer a afirmação contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram exibidos na sessão:

```php
    // Afirme que não há erros de validação presentes...
    $response->assertValid();

    // Afirme que as chaves fornecidas não têm erros de validação...
    $response->assertValid(['name', 'email']);
```

<a name="validation-assert-invalid"></a>
#### assertInvalid

Afirme que a resposta tem erros de validação para as chaves fornecidas. Este método pode ser usado para afirmar contra as respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram acesos na sessão:

```php
    $response->assertInvalid(['name', 'email']);
```

Você também pode afirmar que uma determinada chave tem um erro de validação específico. Ao fazê-lo, você pode fornecer o todo ou apenas uma pequena parte da mensagem:

```php
    $response->assertInvalid([
        'name' => 'The name field is required.',
        'email' => 'valid email address',
    ]);
```
