# Teste de http

<a name="introduction"></a>
## Introdução

Laravel fornece uma API muito fluente para fazer requisições HTTP à sua aplicação e examinar as respostas. Por exemplo, veja o teste de recurso abaixo:

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

O método "get" faz uma solicitação GET para o aplicativo, enquanto o método "assertStatus" afirma que a resposta retornada deve ter o código de status HTTP especificado. Além desta afirmação simples, o Laravel também possui uma variedade de afirmações para inspecionar os cabeçalhos de resposta, conteúdo, estrutura JSON e muito mais.

<a name="making-requests"></a>
## Fazendo Solicitações

Para fazer uma requisição ao seu aplicativo, você pode invocar os métodos 'get', 'post', 'put', 'patch' ou 'delete' dentro do seu teste. Esses métodos não fazem realmente um "real" HTTP Request para o seu aplicativo. Em vez disso, todo o pedido de rede é simulado internamente.

Em vez de retornar uma instância de Illuminate/Http/Response, os métodos de teste retornam uma instância de Illuminate/Testing/TestResponse que fornece um [variedade de afirmações úteis](#afirmações-disponíveis) que permitem inspecionar as respostas do seu aplicativo:

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

Em geral, cada um de seus testes deveria fazer apenas uma solicitação à sua aplicação. Comportamento inesperado pode ocorrer se várias solicitações forem executadas em um único método de teste.

> Nota!
> Para conveniência, o middleware CSRF é desativado automaticamente quando os testes são executados.

<a name="customizing-request-headers"></a>
### Personalizando cabeçalhos de solicitação

Você pode usar o método 'withHeaders' para personalizar os cabeçalhos do pedido antes de ser enviado ao aplicativo. Este método permite-lhe adicionar quaisquer cabeçalhos personalizados que desejar à solicitação:

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
### Bolinhos

Você pode usar os métodos `withCookie` ou `withCookies` para definir valores de cookies antes de fazer uma requisição. O método `withCookie` aceita um nome e valor do cookie como seus dois argumentos, enquanto o método `withCookies` aceita uma matriz de pares de nomes/valores:

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
### A sessão / Autenticação

O Laravel oferece vários ajudantes para interagir com as sessões durante os testes http. Primeiro, você pode definir os dados da sessão em um determinado array usando o método "withSession". Isso é útil para carregar a sessão com os dados antes de enviar uma solicitação ao seu aplicativo.

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

O Laravel utiliza tipicamente sua sessão para manter o estado do usuário atualmente autenticado. Portanto, o método de ajuda 'actingAs' fornece um meio simples de autenticar um determinado usuário como o usuário atual. Por exemplo, podemos usar uma [fábrica de modelo](/docs/eloquent-factories) para gerar e autenticar um usuário:

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

Você também pode especificar qual guarda deve ser usado para autenticar o usuário fornecido ao passar o nome do guarda como o segundo argumento para o método 'actingAs'. O guarda fornecido para o método 'actingAs' também se tornará o guarda padrão por duração do teste:

```php
    $this->actingAs($user, 'web')
```

<a name="debugging-responses"></a>
### Respostas para depuração de erros

Após fazer uma solicitação de teste para sua aplicação, os métodos 'dump', 'dumpHeaders' e 'dumpSession' podem ser usados para examinar e depurar o conteúdo da resposta:

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

Alternativamente, você pode usar os métodos `dd`, `ddHeaders` e `ddSession` para dar um dump de informações sobre a resposta e então parar a execução.

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
### Tratamento de Exceções

Às vezes você pode precisar de testar se sua aplicação está lançando uma exceção específica. Para fazer isso, você pode "fazer" o manipulador da exceção via a fachada `Exceptions`. Uma vez que o manipulador da exceção tenha sido feito, você pode utilizar os métodos `assertReported` e `assertNotReported` para fazer afirmações contra exceções que foram lançadas durante a solicitação:

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

Os métodos `assertNotReported` e `assertNothingReported` podem ser usados para afirmar que uma exceção foi ou não lançada durante o pedido, respectivamente.

```php
Exceptions::assertNotReported(InvalidOrderException::class);

Exceptions::assertNothingReported();
```

Você pode desativar completamente a manipulação de exceções para uma solicitação dada invocando o método `withoutExceptionHandling` antes de fazer sua solicitação:

```php
    $response = $this->withoutExceptionHandling()->get('/');
```

Além disso, se você gostaria de garantir que seu aplicativo não está usando recursos que foram descontinuados pelo PHP ou as bibliotecas que seu aplicativo está usando, você pode invocar o método `withoutDeprecationHandling` antes de fazer sua solicitação. Quando a manipulação de desuso é desativada, avisos de desuso serão convertidos em exceções, assim fazendo seu teste falhar:

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

Além disso, os dados de resposta JSON podem ser acessados como variáveis de matriz na resposta, tornando conveniente para você inspecionar os valores individuais retornados dentro de uma resposta JSON.

```php tab=Pest
expect($response['created'])->toBeTrue();
```

```php tab=PHPUnit
$this->assertTrue($response['created']);
```

> Nota!
> O método assertJson converte a resposta em um array e utiliza o PHPUnit::assertArraySubset para verificar se o array dado existe na resposta JSON retornada pela aplicação. Assim, se houver outras propriedades na resposta JSON, esse teste ainda passará desde que o fragmento fornecido esteja presente.

<a name="verifying-exact-match"></a>
#### Afirmando Combinações Exatas do JSON

Como mencionado anteriormente, o método `assertJson` pode ser usado para afirmar que uma parte do arquivo JSON existe dentro do JSON da resposta. Se você deseja verificar se um determinado array **exatamente corresponde** ao JSON retornado pelo seu aplicativo, você deve usar o método `assertExactJson`:

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
#### Aserção em JSON Paths

Se você gostaria de verificar que a resposta JSON contém os dados dados em um caminho especificado, você deve usar o método `assertJsonPath`:

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

O método `assertJsonPath` também aceita um fechamento que pode ser usado para determinar dinamicamente se a afirmação deve passar:

```php
    $response->assertJsonPath('team.owner.name', fn (string $name) => strlen($name) >= 3);
```

<a name="fluent-json-testing"></a>
### Testes de JSON Fluente

Laravel também oferece um belo jeito de testar fluentemente as respostas JSON da sua aplicação. Para começar, passe uma função para o método 'assertJson'. Esta função será invocada com uma instância de 'Illuminate\Testing\Fluent\AssertableJson', que pode ser utilizada para fazer afirmações sobre o JSON retornado pela sua aplicação. O método 'where' pode ser usado para fazer afirmações sobre um atributo específico do JSON, enquanto o método 'missing' pode ser utilizado para afirmar que um atributo específico está ausente do JSON:

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

#### Compreendendo o Método `etc`

No exemplo acima você pode ter notado que invocamos o método `etc` no final de nossa cadeia de afirmações. Este método informa ao Laravel que pode haver outros atributos presentes no objeto JSON. Se o método `etc` não for utilizado, a prova vai falhar se houver outros atributos que você não fez afirmações contra no objeto JSON.

A intenção por trás desse comportamento é proteger você de expor acidentalmente informações confidenciais nas suas respostas JSON, forçando-o a fazer uma afirmação explícita contra o atributo ou permitir explicitamente atributos adicionais pelo método etc.

No entanto, você deve estar ciente de que não incluir o método 'etc' em sua cadeia de asserção não garante que atributos adicionais não estão sendo adicionados a matrizes aninhadas dentro do seu objeto JSON. O método 'etc' só garante que não há atributos adicionais na camada de aninhamento em que o método 'etc' é invocado.

<a name="asserting-json-attribute-presence-and-absence"></a>
#### Afirmando presença/ausência de atributos

Para afirmar que um atributo está presente ou ausente, você pode usar os métodos `has` e `missing`:

```php
    $response->assertJson(fn (AssertableJson $json) =>
        $json->has('data')
             ->missing('message')
    );
```

Além disso, os métodos 'hasAll' e 'missingAll' permitem afirmar a presença ou ausência de vários atributos simultaneamente:

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

Nestas situações, podemos usar o método 'has' do objeto JSON fluido para fazer afirmações sobre os usuários incluídos na resposta. Por exemplo, vamos afirmar que a resposta JSON contém três usuários. Em seguida, faremos algumas afirmações sobre o primeiro usuário na coleção usando o método 'first'. O método 'first' aceita uma função de fechamento que recebe outra string JSON verificável, que podemos usar para fazer afirmações sobre o primeiro objeto na coleção JSON:

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
#### Acesse os Acusadores JSON da Coleção

Às vezes, as rotas de sua aplicação vão retornar coleções JSON com chaves nomeadas.

```php
    Route::get('/users', function () {
        return [
            'meta' => [...],
            'users' => User::all(),
        ];
    })
```

Ao testar estas rotas você pode usar o método "has" para afirmar contra o número de itens na coleção. Além disso, você pode usar o método "has" para escopo uma cadeia de afirmações:

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

Porém, em vez de fazer duas chamadas separadas para o método 'has' para afirmar contra a coleção 'users', você pode fazer uma única chamada que fornece um closure como seu terceiro parâmetro. Quando você faz isso, o fechamento será automaticamente invocado e escopo para o primeiro item na coleção:

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

Os métodos whereType e whereAllType reconhecem os seguintes tipos: 'string', 'integer', 'double', 'boolean', 'array' e 'null'.

<a name="testing-file-uploads"></a>
## Teste de upload de arquivos

A classe `Illuminate\Http\UploadedFile` oferece um método 'fake', que pode ser usado para gerar arquivos ou imagens falsos para testes. Isso, combinado com o método 'fake' da fachada 'Storage', simplifica muito a realização de testes em envios de arquivos. Por exemplo, você pode combinar essas duas funcionalidades para testar facilmente um formulário de upload de avatar:

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

Se você gostaria de afirmar que um determinado arquivo não existe, você pode usar o método `assertMissing` fornecido pelo `Storage` facade:

```php
    Storage::fake('avatars');

    // ...

    Storage::disk('avatars')->assertMissing('missing.jpg');
```

<a name="fake-file-customization"></a>
#### Personalização de Arquivos Falsos

Ao criar arquivos usando o método fake fornecido pela classe UploadedFile você pode especificar a largura, altura e tamanho da imagem (em kilobytes), de forma a testar melhor as regras de validação do seu aplicativo.

```php
    UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

Além de criar imagens, você pode criar arquivos do tipo que quiser usando o método 'create':

```php
    UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

Se necessário, você pode passar um argumento 'mime-type' para o método para definir explicitamente o tipo de MIME que deve ser retornado pelo arquivo:

```php
    UploadedFile::fake()->create(
        'document.pdf', $sizeInKilobytes, 'application/pdf'
    );
```

<a name="testing-views"></a>
## Teste de Vista

Laravel também permite renderizar uma visualização sem fazer um pedido HTTP simulado para o aplicativo. Para fazer isso, você pode chamar o método `view` dentro de seu teste. O método `view` aceita o nome da visualização e uma matriz opcional de dados. O método retorna uma instância de `Illuminate\Testing\TestView`, que oferece vários métodos para fazer convenientemente afirmações sobre o conteúdo da visualização:

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

A classe `TestView` fornece os seguintes métodos de afirmação: `assertSee`, `assertSeeInOrder`, `assertSeeText`, `assertSeeTextInOrder`, `assertDontSee` e `assertDontSeeText`.

Se necessário, você pode obter o conteúdo da visão renderizada usando um tipo de vista 'Raw' que é castado do 'TestView'.

```php
    $contents = (string) $this->view('welcome');
```

<a name="sharing-errors"></a>
#### Compartilhando Erros

Algumas opiniões podem depender de erros compartilhados na [saca-erros global fornecida pelo Laravel]/docs/validação#exibindo rapidamente os erros de validação) . Para hidratar a saca-erros com mensagens de erro, você pode usar o método `withViewErrors`:

```php
    $view = $this->withViewErrors([
        'name' => ['Please provide a valid name.']
    ])->view('form');

    $view->assertSee('Please provide a valid name.');
```

<a name="rendering-blade-and-components"></a>
### Renderização de lâmina e componentes

Se necessário, você pode usar o método 'blade' para avaliar e representar uma string [Blade] crua. Como o método 'view', o método 'blade' retorna uma instância de 'Illuminate\Testing\TestView':

```php
    $view = $this->blade(
        '<x-component :name="$name" />',
        ['name' => 'Taylor']
    );

    $view->assertSee('Taylor');
```

Você pode usar o método `component` para avaliar e renderizar um componente [Blade]( "/docs/blade#componentes") . O método `component` retorna uma instância de `Illuminate\Testing\TestComponent`:

```php
    $view = $this->component(Profile::class, ['name' => 'Taylor']);

    $view->assertSee('Taylor');
```

<a name="available-assertions"></a>
## Ações disponíveis

<a name="response-assertions"></a>
### Ações de Resposta

A classe 'Illuminate\Testing\TestResponse' do Laravel fornece uma variedade de métodos de afirmação personalizados que você pode utilizar ao testar seu aplicativo. Essas afirmações podem ser acessadas na resposta que é retornada pelos métodos 'json', 'get', 'post', 'put' e 'delete':

<style>
.collection-method-list > p {
columns: 14.4em 2; -moz-columns: 14.4em 2; -webkit-columns: 14.4em 2;
O inglês é uma língua que não possui um sistema de ortografia consistente.

.coleção-método-lista a {
display:bloco;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
}
</style>

<div class="collection-method-list" markdown="1">

[assertAccepted](#assert-accepted)
[assertBadRequest](#assert-bad-request)
[assertConflict](#assert-conflict)
[assertCookie](#assert-cookie)
[assertCookieExpired](#assert-cookie-expired)
[assertCookieNotExpired](#assert-cookie-not-expired)
[assertCookieMissing](#assert-cookie-missing)
[assertCreated](#assert-created)
[assertNãoVê](#assert-não-vê)
[assertNãoVejaTexto](#assert-não-veja-texto)
[assertDownload](#assert-download)
[assertExactJson](#assert-exact-json)
[assertForbidden](#assert-forbidden)
[assertFound](#assert-found)
[assertGone](#assert-gone)
[assertHeader](#assert-header)
[assertHeaderMissing](#assert-header-missing)
[assertInternalServerError](#assert-internal-server-error)
[assertJSON](#assert-json)
[assertJsonCount](#assert-json-count)
[assertJsonFragment](#assert-json-fragment)
[assertJsonIsArray](#assert-json-is-array)
[assertJsonIsObject](#assert-json-is-object)
[assertJsonMissing](#assert-json-missing)
[assertJsonMissingExact](#assert-json-missing-exact)
[assertJsonMissingValidationErrors](#assert-json-missing-validation-errors)
[assertJsonPath](#assert-json-path)
[assert json missing path](#assert-json-missing-path)
[assertJsonStructure](#assert-json-structure)
[assertJsonValidationErrors](#assert-json-validation-errors)
[assertJsonValidationErrorFor](#assert-json-validation-error-for)
[assertLocation](#assert-location)
[assertMethodNotAllowed](#assert-method-not-allowed)
[assert Moved Permanently](#assert-moved-permanently)
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
[assert-server-error]
[assertServiceUnavailable](#assert-service-unavailable)
[assertSessionHas](#assert-session-has)
[assertSessionHasInput](#assert-session-has-input)
[assertSessionHasAll](#assert-session-has-all)
[assertSessionHasErrors](#assert-session-has-errors)
[assertSessionHasErrorsIn](#assert-session-has-errors-in)
[assertSessionHasNoErrors](#assert-session-has-no-errors)
[assertSessionDoesntHaveErrors](#assert-session-doesnt-have-errors)
[assertSessionMissing](#assert-session-missing)
[assertStatus](#assert-status)
[assertSucesso](#assert-sucesso)
[assertTooManyRequests](#assert-too-many-requests)
[assertUnauthorized](#assert-unauthorized-1)
[assertUnprocessable](#assert-unprocessable)
[assertUnsupportedMediaType](#assert-unsupported-media-type)
[assertValid](#assert-valid)
[assertNãoVálido](#assert-nãovalido)
[assertViewHas](#assert-view-has)
[assertViewHasAll](#assert-view-has-all)
[assertViewIs](#assert-view-is)
[assertViewMissing]

</div>

<a name="assert-bad-request"></a>
#### assertBadRequest

Afirmar que o pedido é mau (400) código de estado HTTP:

```php
    $response->assertBadRequest();
```

<a name="assert-accepted"></a>
#### AfirmarAceito

Afirmar que a resposta tem um código de estado HTTP aceito (202):

```php
    $response->assertAccepted();
```

<a name="assert-conflict"></a>
#### afirmar-conflito

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
#### assertCriado

Afirme que a resposta tem o código de estado HTTP 201.

```php
    $response->assertCreated();
```

<a name="assert-dont-see"></a>
#### assertNão Veja

Afirmar que a string dada não está contida na resposta retornada pelo aplicativo. Esta afirmação irá escapar automaticamente a string dada a menos que você passe um segundo argumento de "falso":

```php
    $response->assertDontSee($value, $escaped = true);
```

<a name="assert-dont-see-text"></a>
#### assertNão veja texto

Afirme que a string fornecida não está contida no texto de resposta. Esta afirmação escapará automaticamente a string fornecida, a menos que você passe um segundo argumento de 'falso'. Este método passará o conteúdo de resposta para a função 'strip_tags' do PHP antes de fazer a afirmação:

```php
    $response->assertDontSeeText($value, $escaped = true);
```

<a name="assert-download"></a>
#### assertarDownload

Afirme que a resposta é um download. Normalmente isso significa o recurso invocado que devolveu a resposta devolveu uma Resposta::download, RespostaBinária ou Resposta de Armazenamento;

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
#### afirmarProibido

Afirme que o response tem um status de http 403:

```php
    $response->assertForbidden();
```

<a name="assert-found"></a>
#### afirmarEncontrado

Afirmar que a resposta tem um código de estado HTTP (302):

```php
    $response->assertFound();
```

<a name="assert-gone"></a>
#### Afirmar-se-a

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

Afirmar que a resposta tem o código de estado da http "Internal Server Error" (500):

```php
    $response->assertInternalServerError();
```

<a name="assert-json"></a>
#### assertJson

Afirme que a resposta contém os dados JSON fornecidos:

```php
    $response->assertJson(array $data, $strict = false);
```

O método `assertJson` converte a resposta para um array e utiliza o método `PHPUnit::assertArraySubset` para verificar que o array dado existe na resposta json retornada pela aplicação. Portanto, se houver outras propriedades na resposta json, esta teste ainda será aprovado desde que o fragmento fornecido esteja presente.

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

> Nota!
> O método mais genérico [assertValid](#assert-valid) pode ser usado para afirmar que uma resposta não tem erros de validação retornados como JSON e que não houve erros flashados em um armazenamento de sessão.

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

Você pode afirmar que a propriedade `nome` do objeto `usuário` corresponde a um determinado valor assim:

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

Nesta situação, você pode usar o caractere '*' para afirmar contra a estrutura de todos os objetos no array.

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

> Nota:
> O método [assertInvalid](#assert-invalid) genérico pode ser usado para verificar que uma resposta contém erros de validação retornados como JSON ou que os erros foram flashados na sessão do armazenamento.

<a name="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

Afirmar que a resposta tem algum erro de validação do JSON para a chave dada:

```php
    $response->assertJsonValidationErrorFor(string $key, $responseKey = 'errors');
```

<a name="assert-method-not-allowed"></a>
#### assertMethodNotAllowed

Afirmar que a resposta tem um método não permitido (405) HTTP código de estado:

```php
    $response->assertMethodNotAllowed();
```

<a name="assert-moved-permanently"></a>
#### afirmarMover-seDefinitivamente

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
#### afirmar conteúdo

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
#### assertar Ok

Afirmar que a resposta tem um código HTTP 200:

```php
    $response->assertOk();
```

<a name="assert-payment-required"></a>
#### assertar que o pagamento é necessário.

Afirme que a resposta tem um código de estado HTTP 402: pago

```php
    $response->assertPaymentRequired();
```

<a name="assert-plain-cookie"></a>
#### assertCookieVálido

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

Afirme que a resposta é um redirecionamento para o [nomeada rota] (/docs/ roteamento # nomeadas rotas):

```php
    $response->assertRedirectToRoute($name, $parameters = []);
```

<a name="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

Afirme que a resposta é um redirecionamento para o [roteiro assinado] ( /docs/urls #signed-urls ):

```php
    $response->assertRedirectToSignedRoute($name = null, $parameters = []);
```

<a name="assert-request-timeout"></a>
#### assertRequestTimeout

Afirmar que a resposta tem um tempo limite de requisição (408) HTTP código de estado:

```php
    $response->assertRequestTimeout();
```

<a name="assert-see"></a>
#### afirmar veja

Afirme que a string fornecida esteja contida na resposta. Essa afirmação escapará automaticamente da string fornecida, a menos que você passe um segundo argumento de falso:

```php
    $response->assertSee($value, $escaped = true);
```

<a name="assert-see-in-order"></a>
#### AfirmarVejaEm Ordem

Afirme que as strings dadas estão contidas em ordem dentro da resposta. Essa afirmação irá automaticamente escapar das strings dadas, a menos que você passe um segundo argumento de falso:

```php
    $response->assertSeeInOrder(array $values, $escaped = true);
```

<a name="assert-see-text"></a>
#### afirmar

Afirma que a string fornecida está contida no texto da resposta. Esta afirmação irá escapar automaticamente a string fornecida, a menos que você passe um segundo argumento de `false`. O conteúdo da resposta será passado para a função PHP `strip_tags` antes da afirmação ser feita:

```php
    $response->assertSeeText($value, $escaped = true);
```

<a name="assert-see-text-in-order"></a>
#### afirmarVerTextoEmOrdem

Afirme que as strings fornecidas são contidas em ordem dentro do texto de resposta. Essa afirmação escapará automaticamente as strings fornecidas, a menos que você passe um segundo argumento de falso. O conteúdo da resposta será passado para a função 'strip_tags' do PHP antes de fazer a afirmação:

```php
    $response->assertSeeTextInOrder(array $values, $escaped = true);
```

<a name="assert-server-error"></a>
#### assert ServerError

Afirme que a resposta tem um erro do servidor (>= 500 , < 600) código de estado HTTP:

```php
    $response->assertServerError();
```

<a name="assert-server-unavailable"></a>
#### assertServiço indisponível

Afirme que a resposta tem um "Serviço Indisponível" (503) código de status HTTP:

```php
    $response->assertServiceUnavailable();
```

<a name="assert-session-has"></a>
#### assertSessionHas

Afirmar que a sessão contém o dado dado:

```php
    $response->assertSessionHas($key, $value = null);
```

Se necessário, uma função de retorno pode ser fornecida como o segundo argumento para o método `assertSessionHas`. A afirmação será verdadeira se a função de retorno retornar `verdadeira`:

```php
    $response->assertSessionHas($key, function (User $value) {
        return $value->name === 'Taylor Otwell';
    });
```

<a name="assert-session-has-input"></a>
#### assertSessionHasInput

Afirme que a sessão tem um determinado valor na [array de entrada em flash]/docs/respostas#redirecionamento com dados da sessão em flash):

```php
    $response->assertSessionHasInput($key, $value = null);
```

Se necessário, um fechamento pode ser fornecido como o segundo argumento para o método `assertSessionHasInput`. A afirmação passará se o fechamento retornar `verdadeiro`:

```php
    use Illuminate\Support\Facades\Crypt;

    $response->assertSessionHasInput($key, function (string $value) {
        return Crypt::decryptString($value) === 'secret';
    });
```

<a name="assert-session-has-all"></a>
#### assertSessionHasAll

Afirme que a sessão contém um dado array de pares chave/valor.

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

Afirme que a sessão contém um erro para as chaves fornecidas. Se $keys for uma matriz associativa, afirme que a sessão contém uma mensagem de erro (valor) específica para cada campo ($chave). Este método deve ser usado quando testar rotas que enviam erros de validação por flash para a sessão em vez de retorná-los como uma estrutura JSON:

```php
    $response->assertSessionHasErrors(
        array $keys = [], $format = null, $errorBag = 'default'
    );
```

Por exemplo, para afirmar que os campos 'nome' e 'email' têm mensagens de erro de validação que foram exibidas na sessão, você pode invocar o método 'assertSessionHasErrors' assim:

```php
    $response->assertSessionHasErrors(['name', 'email']);
```

Ou você pode afirmar que um campo dado tem uma mensagem de erro de validação específica:

```php
    $response->assertSessionHasErrors([
        'name' => 'The given name was invalid.'
    ]);
```

> Nota!
> O método genérico [assertInvalid](#assert-invalid) pode ser usado para afirmar que uma resposta tem erros de validação retornados como JSON **ou** que os erros foram flashados no armazenamento da sessão.

<a name="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

Afirme que a sessão contém um erro para as chaves especificadas dentro de uma [bagagem de erros específica](/docs/validation#named-error-bags). Se as chaves forem uma matriz associativa, afirme que a sessão contém uma mensagem de erro (valor) específica para cada campo (chave), dentro da bagagem de erros:

```php
    $response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

<a name="assert-session-has-no-errors"></a>
#### assertSessionHasNoErrors

Afirmar que a sessão não tem erros de validação:

```php
    $response->assertSessionHasNoErrors();
```

<a name="assert-session-doesnt-have-errors"></a>
#### assertSessionDoesntHaveErrors

Afirmar que a sessão não tem erros de validação para as chaves dadas:

```php
    $response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

> Nota:
> O método genérico [assertValid](#assert-valid) pode ser usado para afirmar que uma resposta não tem erros de validação retornados como JSON e que não há erros flashados no armazenamento da sessão.

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
#### assertarSucedido

Afirmar que o retorno tem um código de estado HTTP bem-sucedido (>= 200 e < 300):

```php
    $response->assertSuccessful();
```

<a name="assert-too-many-requests"></a>
#### assertTooManyRequests

Afirmar que o pedido tem muitos pedidos (429) código de estado http:

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
#### assertIndisponível

Afirme que a resposta tem um código de estado HTTP não processável (422):

```php
    $response->assertUnprocessable();
```

<a name="assert-unsupported-media-type"></a>
#### assertUnsupportedMediaType

Afirmar que a resposta tem tipo de mídia sem suporte (415) HTTP status code:

```php
    $response->assertUnsupportedMediaType();
```

<a name="assert-valid"></a>
#### assertadoValido

Afirme que a resposta não tem erros de validação para as chaves dadas. Este método pode ser usado para afirmar contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram flash'd à sessão:

```php
    // Assert that no validation errors are present...
    $response->assertValid();

    // Assert that the given keys do not have validation errors...
    $response->assertValid(['name', 'email']);
```

<a name="assert-invalid"></a>
#### assertar inválido

Averte que o resposta tem erros de validação para as chaves dadas. Este método pode ser usado para afirmar contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram mostrados na sessão:

```php
    $response->assertInvalid(['name', 'email']);
```

Você também pode afirmar que uma determinada chave tem um erro de validação específico em sua mensagem. Ao fazê-lo você pode fornecer toda a mensagem ou apenas parte dela:

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

Passar um fechamento como segundo argumento para o método `assertViewHas` permitirá inspecionar e fazer afirmações contra uma peça de dados específicos de exibição.

```php
    $response->assertViewHas('user', function (User $user) {
        return $user->name === 'Taylor';
    });
```

Além disso, os dados de visualização podem ser acessados como variáveis de matriz na resposta, permitindo inspecionar os dados com mais facilidade:

```php tab=Pest
expect($response['name'])->toBe('Taylor');
```

```php tab=PHPUnit
$this->assertEquals('Taylor', $response['name']);
```

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

Ou, você pode afirmar que os dados de visão estão presentes e têm valores específicos.

```php
    $response->assertViewHasAll([
        'name' => 'Taylor Otwell',
        'email' => 'taylor@example.com,',
    ]);
```

<a name="assert-view-is"></a>
#### assertViewIs

Afirmar que a visão dada foi retornada pela rota:

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

Laravel também fornece uma variedade de afirmações relacionadas a autenticação que você pode usar dentro dos seus testes de funcionalidade do aplicativo. Observe que esses métodos são invocados na própria classe de teste e não na instância 'Illuminate\Testing\TestResponse' retornada por métodos como 'get' e 'post'.

<a name="assert-authenticated"></a>
#### assertar autenticado

Afirmar que o usuário está autenticado:

```php
    $this->assertAuthenticated($guard = null);
```

<a name="assert-guest"></a>
#### afirmarConvidado

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
## Avaliação de afirmações

Laravel fornece duas principais afirmações de validação relacionadas que você pode usar para garantir os dados fornecidos em sua solicitação foram válidos ou inválidos.

<a name="validation-assert-valid"></a>
#### assertadoValido

Afirmar que a resposta não contém erros de validação para as chaves dadas. Este método pode ser usado para afirmar contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram mostrados na sessão:

```php
    // Assert that no validation errors are present...
    $response->assertValid();

    // Assert that the given keys do not have validation errors...
    $response->assertValid(['name', 'email']);
```

<a name="validation-assert-invalid"></a>
#### assertar inválido

Afirme que a resposta tem erros de validação para as chaves fornecidas. Este método pode ser usado para afirmar contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram acesos na sessão:

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
