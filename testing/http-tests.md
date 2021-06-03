# Testes HTTP

## Introdução
O Laravel fornece uma API muito fluente para fazer solicitações HTTP à sua aplicação e examinar as respostas. Por exemplo, dê uma olhada no 
teste de recurso definido abaixo:

```php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     *
     * @return void
     */
    public function test_a_basic_request()
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

O método `get` faz uma solicitação `GET` ao aplicativo, enquanto o método `assertStatus` afirma que a resposta retornada deve ter o código 
de status HTTP fornecido. Além desta afirmação simples, o Laravel também contém uma variedade de afirmações para inspecionar os cabeçalhos de 
resposta, conteúdo, estrutura JSON e muito mais.

### Fazendo requisições
Para fazer um pedido para o seu aplicativo, você pode invocar os métodos `get`, `post`, `put`, `patch`, ou `delete` dentro de seu teste. 
Na verdade, esses métodos não emitem uma solicitação HTTP "real" para o seu aplicativo. Em vez disso, toda a solicitação de rede é simulada 
internamente.

Em vez de retornar uma instância `Illuminate\Http\Response`, os métodos de solicitação de teste retornam uma instância de `Illuminate\Testing\TestResponse`, 
que fornece uma variedade de afirmações úteis e que permitem inspecionar as respostas de seu aplicativo:

```php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     *
     * @return void
     */
    public function test_a_basic_request()
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

> Por conveniência, o middleware CSRF é desativado automaticamente ao executar testes.

#### Personalização de cabeçalhos de solicitação
Você pode usar o método `withHeaders` para personalizar os cabeçalhos da solicitação antes de enviá-la ao aplicativo. Este método 
permite que você adicione quaisquer cabeçalhos personalizados que desejar à solicitação:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function test_interacting_with_headers()
    {
        $response = $this->withHeaders([
            'X-Header' => 'Value',
        ])->post('/user', ['name' => 'Sally']);

        $response->assertStatus(201);
    }
}
```

#### Cookies
Você pode usar os métodos `withCookie` ou `withCookies` para definir os valores dos cookies antes de fazer uma solicitação. O método `withCookie` 
aceita um nome e valor de cookie como seus dois argumentos, enquanto o método `withCookies` aceita uma matriz de pares nome/valor:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_cookies()
    {
        $response = $this->withCookie('color', 'blue')->get('/');

        $response = $this->withCookies([
            'color' => 'blue',
            'name' => 'Taylor',
        ])->get('/');
    }
}
```

#### Sessão/Autenticação
O Laravel fornece vários ajudantes para interagir com a sessão durante o teste de HTTP. Primeiro, você pode definir os dados da 
sessão para um determinado array usando o método `withSession`. Isso é útil para carregar a sessão com dados antes de enviar uma 
solicitação ao seu aplicativo:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_the_session()
    {
        $response = $this->withSession(['banned' => false])->get('/');
    }
}
```

A sessão do Laravel é normalmente usada para manter o estado do usuário autenticado no momento. Portanto, o método auxiliar `actingAs` fornece 
uma maneira simples de autenticar um determinado usuário como o usuário atual. Por exemplo, podemos usar uma fábrica de modelos para gerar e 
autenticar um usuário:

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_an_action_that_requires_authentication()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
                         ->withSession(['banned' => false])
                         ->get('/');
    }
}
```

Você também pode especificar qual proteção deve ser usada para autenticar um determinado usuário, passando o nome do guarda como o segundo 
argumento para o método `actingAs`:

```php
$this->actingAs($user, 'api')
```

### Respostas de depuração
Depois de fazer uma requisição de teste para a sua aplicação, os métodos `dump`, `dumpHeaders` e `dumpSession` podem ser utilizados para analisar 
e depurar o conteúdo de resposta:

```php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     *
     * @return void
     */
    public function test_basic_test()
    {
        $response = $this->get('/');

        $response->dumpHeaders();

        $response->dumpSession();

        $response->dump();
    }
}
```

### Teste de APIs JSON
O Laravel também fornece vários ajudantes para testar APIs JSON e suas respostas. Por exemplo, os métodos `json`, `getJson`, `postJson`, `putJson`, 
`patchJson`, `deleteJson`, e `optionsJson` podem ser usados para emitir solicitações JSON com vários verbos HTTP. Você também pode passar facilmente 
dados e cabeçalhos para esses métodos. Para começar, vamos escrever um teste para fazer uma solicitção `POST` na rota `/api/user` e afirmar que os 
dados JSON esperados foram retornados:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function test_making_an_api_request()
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

Além disso, os dados de resposta JSON podem ser acessados como variáveis de array na resposta, tornando conveniente para você 
inspecionar os valores individuais retornados em uma resposta JSON:

```php
$this->assertTrue($response['created']);
```

> O método `assertJson` converte a resposta em uma matriz `PHPUnit::assertArraySubset` e a utiliza para verificar se a matriz fornecida existe na 
> resposta JSON retornada pelo aplicativo. Portanto, se houver outras propriedades na resposta JSON, esse teste ainda será aprovado, desde que o 
> fragmento fornecido esteja presente.

#### Afirmando correspondências JSON exatas
Conforme mencionado anteriormente, o método `assertJson` pode ser usado para afirmar que existe um fragmento de JSON na resposta JSON. Se quiser 
verificar se uma determinada matriz corresponde exatamente ao JSON retornado pelo seu aplicativo, você deve usar o método `assertExactJson`:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function test_asserting_an_exact_json_match()
    {
        $response = $this->json('POST', '/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertExactJson([
                'created' => true,
            ]);
    }
}
```

#### Afirmando caminhos no JSON
Se quiser verificar se a resposta JSON contém os dados fornecidos em um caminho especificado, você deve usar o método `assertJsonPath`:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function test_asserting_a_json_paths_value()
    {
        $response = $this->json('POST', '/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJsonPath('team.owner.name', 'Darian');
    }
}
```

### Teste Fluente para JSON
O Laravel também oferece uma bela maneira de testar com fluência as respostas JSON do seu aplicativo. Para começar, passe uma closure para o 
método `assertJson`. Essa closure será invocado com uma instância `Illuminate\Testing\Fluent\AssertableJson` que pode ser usada para fazer 
asserções no JSON que foi retornado por seu aplicativo. O método `where` pode ser usado para fazer afirmações contra um determinado atributo 
do JSON, enquanto o método `missing` pode ser usado para afirmar que um determinado atributo está faltando no JSON:

```php
use Illuminate\Testing\Fluent\AssertableJson;

/**
 * A basic functional test example.
 *
 * @return void
 */
public function test_fluent_json()
{
    $response = $this->json('GET', '/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                 ->where('name', 'Victoria Faith')
                 ->missing('password')
                 ->etc()
        );
}
```

#### Compreendendo o método `etc`
No exemplo acima, você deve ter notado que invocamos o método `etc` no final de nossa cadeia de asserções. Este método informa ao Laravel que podem 
existir outros atributos presentes no objeto JSON. Se o método `etc` não for usado, o teste falhará se outros atributos contra os quais você não fez 
declarações existirem no objeto JSON.

A intenção por trás desse comportamento é protegê-lo contra a exposição não intencional de informações confidenciais em suas respostas JSON, forçando 
você a fazer uma declaração explicitamente no atributo ou permitir explicitamente atributos adicionais por meio do método `etc`.

#### Afirmações em coleções JSON
Freqüentemente, sua rota retornará uma resposta JSON que contém vários itens, como vários usuários:

```php
Route::get('/users', function () {
    return User::all();
});
```

Nessas situações, podemos usar o método `has` do objeto JSON fluente para fazer asserções nos usuários incluídos na resposta. Por exemplo, vamos 
afirmar que a resposta JSON contém três usuários. A seguir, faremos algumas afirmações sobre o primeiro usuário da coleção usando o método `first`. 
O método `first` aceita uma closure que recebe outra string JSON assertível que podemos usar para fazer afirmações sobre o primeiro objeto 
na coleção JSON:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has(3)
             ->first(fn ($json) =>
                $json->where('id', 1)
                     ->where('name', 'Victoria Faith')
                     ->missing('password')
                     ->etc()
             )
    );
```

#### Definição do escopo de afirmações em coleção JSON
Às vezes, as rotas do seu aplicativo retornarão coleções JSON às quais são atribuídas chaves nomeadas:

```php
Route::get('/users', function () {
    return [
        'meta' => [...],
        'users' => User::all(),
    ];
})
```

Ao testar essas rotas, você pode usar o método `has` para avaliar o número de itens na coleção. Além disso, você pode usar o método `has` 
para definir o escopo de uma cadeia de afirmações:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
             ->has('users', 3)
             ->has('users.0', fn ($json) =>
                $json->where('id', 1)
                     ->where('name', 'Victoria Faith')
                     ->missing('password')
                     ->etc()
             )
    );
```

No entanto, em vez de fazer duas chamadas separadas para o método `has` a fim de declarar na coleção `users`, você pode fazer uma única 
chamada que fornece uma closure como seu terceiro parâmetro. Ao fazer isso, a closure será automaticamente invocada e definida para o primeiro 
item da coleção:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
             ->has('users', 3, fn ($json) =>
                $json->where('id', 1)
                     ->where('name', 'Victoria Faith')
                     ->missing('password')
                     ->etc()
             )
    );
```

#### Afirmando tipos JSON
Você pode querer apenas afirmar que as propriedades na resposta JSON são de um determinado tipo. A classe `Illuminate\Testing\Fluent\AssertableJson` 
fornece os métodos `whereType` e `whereAllType` para fazer exatamente isso:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('id', 'integer')
         ->whereAllType([
            'users.0.name' => 'string',
            'meta' => 'array'
        ])
);
```

Você pode especificar vários tipos usando o caractere `|` ou passando uma matriz de tipos como o segundo parâmetro do método `whereType`. 
A declaração será bem-sucedida se o valor da resposta for qualquer um dos tipos listados:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('name', 'string|null')
         ->whereType('id', ['string', 'integer'])
);
```

Os métodos `whereType` e `whereTypeAll` podem reconhecer os seguintes tipos: `string`, `integer`, `double`, `boolean`, `array`, e `null`.

#### Teste de uploads de arquivos
A classe `Illuminate\Http\UploadedFile` fornece um método `fake` que pode ser usado para gerar arquivos ou imagens fictícios para teste. Isso, 
combinado com o método `Storage` da fachada `fake`, simplifica muito o teste de uploads de arquivos. Por exemplo, você pode combinar esses dois 
recursos para testar facilmente um formulário de upload de avatar:

```php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_avatars_can_be_uploaded()
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

Se você gostaria de afirmar que um determinado arquivo não existe, você pode usar o método `assertMissing` fornecido pela fachada `Storage`:

```php
Storage::fake('avatars');

// ...

Storage::disk('avatars')->assertMissing('missing.jpg');
```

#### Personalização de arquivo falso
Ao criar arquivos usando o método `fake` fornecido pela classe `UploadedFile`, você pode especificar a largura, a altura e o tamanho da 
imagem (em kilobytes) para testar melhor as regras de validação do seu aplicativo:

```php
UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

Além de criar imagens, você pode criar arquivos de qualquer outro tipo usando o método `create`:

```php
UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

Se necessário, você pode passar um argumento `$mimeType` ao método para definir explicitamente o tipo MIME que deve ser retornado pelo arquivo:

```php
UploadedFile::fake()->create(
    'document.pdf', $sizeInKilobytes, 'application/pdf'
);
```

#### Testando Views
O Laravel também permite que você renderize uma view sem fazer uma solicitação HTTP simulada para o aplicativo. Para fazer isso, você 
pode chamar o método `view` em seu teste. O método `view` aceita o nome da visualização e uma matriz opcional de dados. O método retorna 
uma instância de `Illuminate\Testing\TestView`, que oferece vários métodos para fazer afirmações convenientemente sobre o conteúdo da visualização:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_a_welcome_view_can_be_rendered()
    {
        $view = $this->view('welcome', ['name' => 'Taylor']);

        $view->assertSee('Taylor');
    }
}
```

A classe `TestView` fornece os seguintes métodos de asserção: `assertSee`, `assertSeeInOrder`, `assertSeeText`, `assertSeeTextInOrder`, `assertDontSee`, 
e `assertDontSeeText`.

Se necessário, você pode obter o conteúdo bruto e renderizado da visualização convertendo a instância `TestView` em uma string:

```php
$contents = (string) $this->view('welcome');
```

#### Erros de compartilhamento
Algumas visualizações podem depender de erros compartilhados no 
[pacote de erros global fornecido pelo Laravel](https://laravel.com/docs/8.x/validation#quick-displaying-the-validation-errors). 
Para hidratar a bolsa de erros com mensagens de erro, você pode usar o método `withViewErrors`:

```php
$view = $this->withViewErrors([
    'name' => ['Please provide a valid name.']
])->view('form');

$view->assertSee('Please provide a valid name.');
```

#### Lâmina de renderização e componentes
Se necessário, você pode usar o método `blade` para avaliar e renderizar uma string bruta da Blade. Como o método `view`, o método `blade` retorna 
uma instância de `Illuminate\Testing\TestView`:

```php
$view = $this->blade(
    '<x-component :name="$name" />',
    ['name' => 'Taylor']
);

$view->assertSee('Taylor');
```

Você pode usar o método `component` para avaliar e renderizar um componente `Blade`. Como o método `view`, o método `component` retorna uma 
instância de `Illuminate\Testing\TestView`:

```php
$view = $this->component(Profile::class, ['name' => 'Taylor']);

$view->assertSee('Taylor');
```

### Asserções Disponíveis

#### Asserções de resposta
A classe `Illuminate\Testing\TestResponse` do Laravel fornece uma variedade de métodos de asserção personalizados que você pode utilizar ao 
testar sua aplicação. Estas afirmações pode ser acessada na resposta que é retornado pelos métodos `json`, `get`, `post`, `put`, e `delete`
de ensaio:

+ assertCookie
+ assertCookieExpired
+ assertCookieNotExpired
+ assertCookieMissing
+ assertCreated
+ assertDontSee
+ assertDontSeeText
+ assertExactJson
+ assertForbidden
+ assertHeader
+ assertHeaderMissing
+ assertJson
+ assertJsonCount
+ assertJsonFragment
+ assertJsonMissing
+ assertJsonMissingExact
+ assertJsonMissingValidationErrors
+ assertJsonPath
+ assertJsonStructure
+ assertJsonValidationErrors
+ assertLocation
+ assertNoContent
+ assertNotFound
+ assertOk
+ assertPlainCookie
+ assertRedirect
+ assertSee
+ assertSeeInOrder
+ assertSeeText
+ assertSeeTextInOrder
+ assertSessionHas
+ assertSessionHasInput
+ assertSessionHasAll
+ assertSessionHasErrors
+ assertSessionHasErrorsIn
+ assertSessionHasNoErrors
+ assertSessionDoesntHaveErrors
+ assertSessionMissing
+ assertStatus
+ assertSuccessful
+ assertUnauthorized
+ assertViewHas
+ assertViewHasAll
+ assertViewIs
+ assertViewMissing

#### assertCookie
Afirme que a resposta contém o cookie fornecido:

```php
$response->assertCookie($cookieName, $value = null);
```

#### assertCookieExpired
Afirme que a resposta contém o cookie fornecido e expirou:

```php
$response->assertCookieExpired($cookieName);
```

#### assertCookieNotExpired
Afirme que a resposta contém o cookie fornecido e não expirou:

```php
$response->assertCookieNotExpired($cookieName);
```

#### assertCookieMissing
Afirme que a resposta não contém o cookie fornecido:
```php
$response->assertCookieMissing($cookieName);
```

#### assertCreated
Afirme que a resposta tem um código de status HTTP 201:
```php
$response->assertCreated();
```

#### assertDontSee
Afirme que a string fornecida não está contida na resposta retornada pelo aplicativo. Esta afirmação escapará automaticamente da string 
fornecida, a menos que você passe um segundo argumento de false:
```php
$response->assertDontSee($value, $escaped = true);
```

#### assertDontSeeText
Afirme que a string fornecida não está contida no texto de resposta. Esta afirmação escapará automaticamente da string fornecida, a menos 
que você passe um segundo argumento `false`. Este método passará o conteúdo da resposta para a função PHP `strip_tags` antes de fazer a 
declaração:

```php
$response->assertDontSeeText($value, $escaped = true);
```

#### assertExactJson
Afirme que a resposta contém uma correspondência exata dos dados JSON fornecidos:

```php
$response->assertExactJson(array $data);
```

#### assertForbidden
Afirme que a resposta tem um código de status HTTP proibido (403):

```php
$response->assertForbidden();
````

#### assertHeader
Afirme que o cabeçalho e o valor fornecidos estão presentes na resposta:

```php
$response->assertHeader($headerName, $value = null);
```

#### assertHeaderMissing
Afirme que o cabeçalho fornecido não está presente na resposta:

```php
$response->assertHeaderMissing($headerName);
```

#### assertJson
Afirme que a resposta contém os dados JSON fornecidos:

```php
$response->assertJson(array $data, $strict = false);
```

O método `assertJson` converte a resposta em uma matriz e utiliza `PHPUnit::assertArraySubset` para verificar se a matriz fornecida 
existe na resposta JSON retornada pelo aplicativo. Portanto, se houver outras propriedades na resposta JSON, esse teste ainda será 
aprovado, desde que o fragmento fornecido esteja presente.

#### assertJsonCount
Afirme que a resposta JSON tem uma matriz com o número esperado de itens na chave fornecida:

```php
$response->assertJsonCount($count, $key = null);
```

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

#### assertJsonMissing
Afirme que a resposta não contém os dados JSON fornecidos:

```php
$response->assertJsonMissing(array $data);
```

#### assertJsonMissingExact
Afirme que a resposta não contém os dados JSON exatos:

```php
$response->assertJsonMissingExact(array $data);
```

#### assertJsonMissingValidationErrors
Afirme que a resposta não tem erros de validação JSON para as chaves fornecidas:

```php
$response->assertJsonMissingValidationErrors($keys);
```

#### assertJsonPath
Afirme que a resposta contém os dados fornecidos no caminho especificado:

```php
$response->assertJsonPath($path, $expectedValue);
```

Por exemplo, se a resposta JSON retornada por seu aplicativo contiver os seguintes dados:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Você pode afirmar que a propriedade `name` do objeto `user` corresponde a um determinado valor da seguinte forma:

```php
$response->assertJsonPath('user.name', 'Steve Schoger');
```

#### assertJsonStructure
Afirme que a resposta tem uma determinada estrutura JSON:

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

Você pode afirmar que a estrutura JSON corresponde às suas expectativas da seguinte forma:

```php
$response->assertJsonStructure([
    'user' => [
        'name',
    ]
]);
```

Às vezes, as respostas JSON retornadas por seu aplicativo podem conter matrizes de objetos:

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

Nesta situação, você pode usar o caractere `*` para afirmar contra a estrutura de todos os objetos na matriz:

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

#### assertJsonValidationErrors
Afirme que a resposta tem os erros de validação JSON fornecidos para as chaves fornecidas. Este método deve ser usado ao fazer 
declarações em relação às respostas em que os erros de validação são retornados como uma estrutura JSON em vez de serem enviados 
para a sessão:

```php
$response->assertJsonValidationErrors(array $data);
```

#### assertLocation
Afirme que a resposta tem o valor de URI fornecido no cabeçalho `Location`:

```php
$response->assertLocation($uri);
```

#### assertNoContent
Afirme que a resposta tem o código de status HTTP fornecido e nenhum conteúdo:

```php
$response->assertNoContent($status = 204);
```

#### assertNotFound
Afirme que a resposta tem um código de status HTTP não encontrado (404):

```php
$response->assertNotFound();
```

#### assertOk
Afirme que a resposta tem um código de status HTTP 200:

```php
$response->assertOk();
```

#### assertPlainCookie
Afirme que a resposta contém o cookie não criptografado fornecido:

```php
$response->assertPlainCookie($cookieName, $value = null);
```

#### assertRedirect
Afirme que a resposta é um redirecionamento para o URI fornecido:

```php
$response->assertRedirect($uri);
```

#### assertSee
Afirme que a string fornecida está contida na resposta. Esta afirmação escapará automaticamente da string fornecida, 
a menos que você passe um segundo argumento como `false`:

```php
$response->assertSee($value, $escaped = true);
```

#### assertSeeInOrder
Afirme que as cadeias de caracteres fornecidas estão contidas em ordem na resposta. Essa asserção escapará automaticamente das 
strings fornecidas, a menos que você passe um segundo argumento de false:

```php
$response->assertSeeInOrder(array $values, $escaped = true);
```

#### assertSeeText
Assegure que a string fornecida está contida no texto de resposta. Esta afirmação escapará automaticamente da string fornecida, a
menos que você passe um segundo argumento como `false`. O conteúdo da resposta será passado para a função PHP `strip_tags` antes 
que a afirmação seja feita:

```php
$response->assertSeeText($value, $escaped = true);
```

#### assertSeeTextInOrder
Afirme que as matrizes de caracteres fornecidas estão contidas em ordem no texto de resposta. Esta asserção escapará automaticamente as 
strings fornecidas, a menos que você passe um segundo argumento como `false`. O conteúdo da resposta será passado para a função PHP
`strip_tags` antes que a afirmação seja feita:

```php
$response->assertSeeTextInOrder(array $values, $escaped = true);
```

#### assertSessionHas
Afirme que a sessão contém os dados fornecidos:

```php
$response->assertSessionHas($key, $value = null);
```

#### assertSessionHasInput
Afirme que a sessão tem um determinado valor na matriz de entrada atualizada:

```php
$response->assertSessionHasInput($key, $value = null);
```

#### assertSessionHasAll
Afirme que a sessão contém uma determinada matriz de pares de chave/valor:

```php
$response->assertSessionHasAll(array $data);
```

Por exemplo, se a sessão do seu aplicativo contém as chaves `name` e `status`, você pode afirmar que ambas 
existem e têm os valores especificados como:

```php
$response->assertSessionHasAll([
    'name' => 'Taylor Otwell',
    'status' => 'active',
]);
```

#### assertSessionHasErrors
Afirme que a sessão contém um erro para o dado `$keys`. Se `$keys` for uma matriz associativa, certifique-se de que a sessão contém uma 
mensagem de erro específica (valor) para cada campo (chave). Este método deve ser usado ao testar as rotas de erros de validação flash 
para a sessão, em vez de retorná-los como uma estrutura JSON:

```php
$response->assertSessionHasErrors(
    array $keys, $format = null, $errorBag = 'default'
);
```

Por exemplo, para afirmar que os campos `name` e `email` têm mensagens de erro de validação que foram enviadas para a sessão, 
você pode invocar o método `assertSessionHasErrors` assim:

```php
$response->assertSessionHasErrors(['name', 'email']);
```

Ou você pode afirmar que um determinado campo contém uma mensagem de erro de validação específica:

```php
$response->assertSessionHasErrors([
    'name' => 'The given name was invalid.'
]);
```

#### assertSessionHasErrorsIn
Afirme que a sessão contém um erro para o dado `$keys` em um pacote de erros específico. Se `$keys` for uma matriz associativa, certifique-se 
de que a sessão contém uma mensagem de erro específica (valor) para cada campo (chave), dentro do pacote de erros:

```php
$response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

#### assertSessionHasNoErrors
Afirme que a sessão não tem erros de validação:

```php
$response->assertSessionHasNoErrors();
```

#### assertSessionDoesntHaveErrors
Afirme que a sessão não tem erros de validação para as chaves fornecidas:

```php
$response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

#### assertSessionMissing
Afirme que a sessão não contém a chave fornecida:

```php
$response->assertSessionMissing($key);
```

#### assertStatus
Afirme que a resposta tem um determinado código de status HTTP:

```php
$response->assertStatus($code);
```

#### assertSuccessful
Afirme que a resposta tem um código de status HTTP bem-sucedido (> = 200 e <300):

```php
$response->assertSuccessful();
```

#### assertUnauthorized
Afirme que a resposta tem um código de status HTTP não autorizado (401):

```php
$response->assertUnauthorized();
```

#### assertViewHas
Afirme que a visualização de resposta contém um dado dado:

```php
$response->assertViewHas($key, $value = null);
```

Além disso, os dados de visualização podem ser acessados como variáveis de array na resposta, permitindo que você os inspecione 
de forma conveniente:

```php
$this->assertEquals('Taylor', $response['name']);
```

#### assertViewHasAll
Afirme que a visualização de resposta tem uma determinada lista de dados:

```php
$response->assertViewHasAll(array $data);
```

Este método pode ser usado para afirmar que a visualização simplesmente contém dados que correspondem às chaves fornecidas:

```php
$response->assertViewHasAll([
    'name',
    'email',
]);
```

Ou você pode afirmar que os dados da visualização estão presentes e têm valores específicos:

```php
$response->assertViewHasAll([
    'name' => 'Taylor Otwell',
    'email' => 'taylor@example.com,',
]);
```

#### assertViewIs
Afirme que a view fornecida foi retornada pela rota:

```php
$response->assertViewIs($value);
```

#### assertViewMissing
Afirme que a chave de dados fornecida não foi disponibilizada para a visualização retornada na resposta do aplicativo:

```php
$response->assertViewMissing($key);
```

### Asserções de autenticação
O Laravel também fornece uma variedade de asserções relacionadas à autenticação que você pode utilizar nos testes de recursos do 
seu aplicativo. Observe que esses métodos são chamados na própria classe de teste e não na instância `Illuminate\Testing\TestResponse` 
retornada por métodos como `get` e `post`.

#### assertAuthenticated
Afirme que um usuário está autenticado:

```php
$this->assertAuthenticated($guard = null);
```

#### assertGuest
Afirme que um usuário não está autenticado:

```php
$this->assertGuest($guard = null);
```

#### assertAuthenticatedAs
Afirme que um usuário específico está autenticado:

```php
$this->assertAuthenticatedAs($user, $guard = null);
```
