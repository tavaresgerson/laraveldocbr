# HTTP Client

<a name="introduction"></a>
## Introdução

Laravel fornece uma API expressiva e mínima em torno do [client HTTP de Guzzle](http://docs.guzzlephp.org/en/stable/), permitindo que você faça rapidamente solicitações HTTP para se comunicar com outros aplicativos web. O wrapper do Laravel em Guzzle é focado em seus casos mais comuns de uso e uma excelente experiência de desenvolvedor.

<a name="making-requests"></a>
## Fazendo Pedidos

Para fazer requisições, você pode usar os métodos `head`, `get`, `post`, `put`, `patch` e `delete` fornecidos pela fachada `Http`. Vamos começar examinando como fazer uma requisição básica `GET` a outro URL.

```php
    use Illuminate\Support\Facades\Http;

    $response = Http::get('http://example.com');
```

O método 'get' retorna uma instância de Illuminate\Http\Client\Response, que fornece um conjunto de métodos para inspecionar a resposta:

```php
    $response->body() : string;
    $response->json($key = null, $default = null) : mixed;
    $response->object() : object;
    $response->collect($key = null) : Illuminate\Support\Collection;
    $response->status() : int;
    $response->successful() : bool;
    $response->redirect(): bool;
    $response->failed() : bool;
    $response->clientError() : bool;
    $response->header($header) : string;
    $response->headers() : array;
```

O objeto `Illuminate\Http\Client\Response` também implementa a interface PHP `ArrayAccess`, permitindo que você acesse dados de resposta JSON diretamente na resposta.

```php
    return Http::get('http://example.com/users/1')['name'];
```

Além dos métodos de resposta listados acima, os seguintes métodos podem ser usados para determinar se a resposta tem um determinado código de estado:

```php
    $response->ok() : bool;                  // 200 OK
    $response->created() : bool;             // 201 Created
    $response->accepted() : bool;            // 202 Accepted
    $response->noContent() : bool;           // 204 No Content
    $response->movedPermanently() : bool;    // 301 Moved Permanently
    $response->found() : bool;               // 302 Found
    $response->badRequest() : bool;          // 400 Bad Request
    $response->unauthorized() : bool;        // 401 Unauthorized
    $response->paymentRequired() : bool;     // 402 Payment Required
    $response->forbidden() : bool;           // 403 Forbidden
    $response->notFound() : bool;            // 404 Not Found
    $response->requestTimeout() : bool;      // 408 Request Timeout
    $response->conflict() : bool;            // 409 Conflict
    $response->unprocessableEntity() : bool; // 422 Unprocessable Entity
    $response->tooManyRequests() : bool;     // 429 Too Many Requests
    $response->serverError() : bool;         // 500 Internal Server Error
```

<a name="uri-templates"></a>
#### URI Templates

O cliente HTTP também permite construir URLs de solicitação usando a [especificação da especificação de modelo de URI](https://www.rfc-editor.org/rfc/rfc6570). Para definir os parâmetros da URL que podem ser expandidos pelo seu modelo de URI, você pode usar o método `withUrlParameters`:

```php
Http::withUrlParameters([
    'endpoint' => 'https://laravel.com',
    'page' => 'docs',
    'version' => '11.x',
    'topic' => 'validation',
])->get('{+endpoint}/{page}/{version}/{topic}');
```

<a name="dumping-requests"></a>
#### Pedidos de dumping

Se você gostaria de descartar o exemplo da solicitação que sai antes do envio e terminar a execução do script, você pode adicionar o método dd ao início da definição da sua solicitação:

```php
    return Http::dd()->get('http://example.com');
```

<a name="request-data"></a>
### Solicitar dados

É claro que é comum ao realizar solicitações `POST`, `PUT` e `PATCH` enviar dados adicionais com sua solicitação, então esses métodos aceitam uma matriz de dados como seu segundo argumento. Por padrão, os dados serão enviados usando o tipo de conteúdo `application/json`:

```php
    use Illuminate\Support\Facades\Http;

    $response = Http::post('http://example.com/users', [
        'name' => 'Steve',
        'role' => 'Network Administrator',
    ]);
```

<a name="get-request-query-parameters"></a>
#### Parâmetros de consulta de solicitação

Ao fazer solicitações GET, você pode anexar uma string de consulta diretamente para o URL ou passar um array de pares chave/valor como o segundo argumento do método get:

```php
    $response = Http::get('http://example.com/users', [
        'name' => 'Taylor',
        'page' => 1,
    ]);
```
Alternativamente, o método `withQueryParams` pode ser usado:

```php
    Http::retry(3, 100)->withQueryParameters([
        'name' => 'Taylor',
        'page' => 1,
    ])->get('http://example.com/users')
```

<a name="sending-form-url-encoded-requests"></a>
#### Enviando Requisitos URL Codificados

Se você gostaria de enviar dados usando o tipo de conteúdo "application/x-www-form-urlencoded", você deve chamar o método "asForm" antes de fazer sua requisição.

```php
    $response = Http::asForm()->post('http://example.com/users', [
        'name' => 'Sara',
        'role' => 'Privacy Consultant',
    ]);
```

<a name="sending-a-raw-request-body"></a>
#### Enviando um corpo de requisição crua

Você pode usar o método 'withBody' se quiser fornecer um pedido de corpo bruto ao fazer um pedido. O tipo de conteúdo pode ser fornecido através do segundo argumento do método:

```php
    $response = Http::withBody(
        base64_encode($photo), 'image/jpeg'
    )->post('http://example.com/photo');
```

<a name="multi-part-requests"></a>
#### Pedidos de várias partes

Se você quiser enviar arquivos em requisições multipart, deverá chamar o método `attach` antes de fazer sua requisição. Este método aceita o nome do arquivo e seu conteúdo. Se necessário, você pode fornecer um terceiro argumento que será considerado o nome do arquivo, enquanto um quarto argumento pode ser utilizado para fornecer cabeçalhos associados ao arquivo:

```php
    $response = Http::attach(
        'attachment', file_get_contents('photo.jpg'), 'photo.jpg', ['Content-Type' => 'image/jpeg']
    )->post('http://example.com/attachments');
```

Em vez de passar o conteúdo bruto de um arquivo, você pode passar um recurso de fluxo:

```php
    $photo = fopen('photo.jpg', 'r');

    $response = Http::attach(
        'attachment', $photo, 'photo.jpg'
    )->post('http://example.com/attachments');
```

<a name="headers"></a>
### Cabeçalhos

Cabeçalhos podem ser adicionados a requisições usando o método `withHeaders`. O método `withHeaders` aceita um array de pares chave/valor:

```php
    $response = Http::withHeaders([
        'X-First' => 'foo',
        'X-Second' => 'bar'
    ])->post('http://example.com/users', [
        'name' => 'Taylor',
    ]);
```

Você pode usar o método 'accept' para especificar o tipo de conteúdo que sua aplicação está esperando como resposta à sua requisição:

```php
    $response = Http::accept('application/json')->get('http://example.com/users');
```

Para conveniência, você pode usar o método `acceptJson` para rapidamente especificar que seu aplicativo espera o tipo de conteúdo "application/json" na resposta à sua solicitação:

```php
    $response = Http::acceptJson()->get('http://example.com/users');
```

A `withHeaders` mescla os cabeçalhos novos nos cabeçalhos existentes da requisição. Se necessário, você pode substituir todos os cabeçalhos totalmente usando o `replaceHeaders`:

```php
$response = Http::withHeaders([
    'X-Original' => 'foo',
])->replaceHeaders([
    'X-Replacement' => 'bar',
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

<a name="authentication"></a>
### Autenticação

Você pode especificar credenciais básicas de autenticação usando o método `withBasicAuth`, e credenciais de autenticação de digest usando o método `withDigestAuth`:

```php
    // Basic authentication...
    $response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(/* ... */);

    // Digest authentication...
    $response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(/* ... */);
```

<a name="bearer-tokens"></a>
#### Tokens de portador

Se você gostaria de adicionar rapidamente um token de portador ao cabeçalho 'Autorização', você pode usar o método `withToken`:

```php
    $response = Http::withToken('token')->post(/* ... */);
```

<a name="timeout"></a>
### Tempo fora

O método "timeout" pode ser usado para especificar o número máximo de segundos à espera de uma resposta. Por padrão, o cliente HTTP será bloqueado após 30 segundos:

```php
    $response = Http::timeout(3)->get(/* ... */);
```

Se o tempo limite dado for excedido, uma exceção de `Illuminate\Http\Client\ConnectionException` será lançada.

Você pode especificar o número máximo de segundos para esperar enquanto tenta se conectar a um servidor usando o método `connectTimeout`:

```php
    $response = Http::connectTimeout(3)->get(/* ... */);
```

<a name="retries"></a>
### Retentativas

Se você gostaria que o cliente HTTP tentasse automaticamente a requisição caso ocorra algum erro de cliente ou servidor, você pode usar o método `retry`. O método `retry` aceita o número máximo de vezes que a requisição deve ser tentada e o número de milissegundos que Laravel deve esperar entre as tentativas:

```php
    $response = Http::retry(3, 100)->post(/* ... */);
```

Se você gostaria de calcular manualmente o número de milissegundos para dormir entre tentativas, você pode passar um fechamento como o segundo argumento para o método `retry`:

```php
    use Exception;

    $response = Http::retry(3, function (int $attempt, Exception $exception) {
        return $attempt * 100;
    })->post(/* ... */);
```

Para conveniência, você também pode fornecer uma matriz como o primeiro argumento para o método "retry". Esta matriz será usada para determinar quantos milissegundos dormir entre as tentativas subsequentes:

```php
    $response = Http::retry([100, 200])->post(/* ... */);
```

Se necessário, você pode passar um terceiro argumento para o método `retry`. O terceiro argumento deve ser uma função que determina se as re-tentativas devem realmente ser feitas. Por exemplo, você pode querer fazer a requisição somente se a requisição inicial encontrar uma exceção `ConnectionException`:

```php
    use Exception;
    use Illuminate\Http\Client\PendingRequest;

    $response = Http::retry(3, 100, function (Exception $exception, PendingRequest $request) {
        return $exception instanceof ConnectionException;
    })->post(/* ... */);
```

Se um pedido falhar, talvez queira fazer uma alteração no pedido antes de tentar novamente. Você pode fazer isso alterando o argumento do pedido fornecido ao chamar o método "retry". Por exemplo, você pode querer tentar novamente o pedido com um novo token de autorização se a primeira tentativa retornar um erro de autenticação:

```php
    use Exception;
    use Illuminate\Http\Client\PendingRequest;
    use Illuminate\Http\Client\RequestException;

    $response = Http::withToken($this->getToken())->retry(2, 0, function (Exception $exception, PendingRequest $request) {
        if (! $exception instanceof RequestException || $exception->response->status() !== 401) {
            return false;
        }

        $request->withToken($this->getNewToken());

        return true;
    })->post(/* ... */);
```

Se todas as solicitações falharem, uma instância de Illuminate\Http\Client\RequestException será lançada. Se você quiser desativar esse comportamento, você pode fornecer um argumento "throw" com o valor "false". Quando desativado, a última resposta recebida pelo cliente será retornada após todas as tentativas de novas tentativas:

```php
    $response = Http::retry(3, 100, throw: false)->post(/* ... */);
```

> [!ALERTA]
> Se todas as solicitações falharem devido a um problema de conexão, ainda será lançada uma `Illuminate\Http\Client\ConnectionException` mesmo quando o argumento `throw` é definido como `false`.

<a name="error-handling"></a>
### Tratamento de erros

Diferente do comportamento padrão de Guzzle, o wrapper HTTP do Laravel não lança exceções em erros do cliente ou do servidor (respostas com nível 400 e 500 dos servidores). Você pode determinar se um desses erros foi retornado usando os métodos `successful`, `clientError` ou `serverError`:

```php
    // Determine if the status code is >= 200 and < 300...
    $response->successful();

    // Determine if the status code is >= 400...
    $response->failed();

    // Determine if the response has a 400 level status code...
    $response->clientError();

    // Determine if the response has a 500 level status code...
    $response->serverError();

    // Immediately execute the given callback if there was a client or server error...
    $response->onError(callable $callback);
```

<a name="throwing-exceptions"></a>
#### Throwing Exceptions

Se você tiver uma instância de resposta e quiser lançar um caso da classe `Illuminate\Http\Client\RequestException` quando o código de estado da resposta indicar um erro de cliente ou servidor, você pode usar os métodos `throw` ou `throwIf`:

```php
    use Illuminate\Http\Client\Response;

    $response = Http::post(/* ... */);

    // Throw an exception if a client or server error occurred...
    $response->throw();

    // Throw an exception if an error occurred and the given condition is true...
    $response->throwIf($condition);

    // Throw an exception if an error occurred and the given closure resolves to true...
    $response->throwIf(fn (Response $response) => true);

    // Throw an exception if an error occurred and the given condition is false...
    $response->throwUnless($condition);

    // Throw an exception if an error occurred and the given closure resolves to false...
    $response->throwUnless(fn (Response $response) => false);

    // Throw an exception if the response has a specific status code...
    $response->throwIfStatus(403);

    // Throw an exception unless the response has a specific status code...
    $response->throwUnlessStatus(200);

    return $response['user']['id'];
```

A instância Illuminate\Http\Client\RequestException tem uma propriedade de acesso público chamada $response que permitirá inspecionar a resposta retornada.

O método 'throw' retorna a instância de resposta se não houver erro, permitindo que você encadeie outros métodos na função throw:

```php
    return Http::post(/* ... */)->throw()->json();
```

Se você quiser executar alguma lógica adicional antes da exceção ser lançada, você pode passar um fechamento para o método 'throw'. A exceção será lançada automaticamente após o fechamento ser invocado, então você não precisa de re-lançar a exceção do próprio fechamento:

```php
    use Illuminate\Http\Client\Response;
    use Illuminate\Http\Client\RequestException;

    return Http::post(/* ... */)->throw(function (Response $response, RequestException $e) {
        // ...
    })->json();
```

<a name="guzzle-middleware"></a>
### Middleware de engolida

Dado que o cliente HTTP do Laravel é alimentado pelo Guzzle, você pode aproveitar dos [Guzzle Middleware](https://docs.guzzlephp.org/en/stable/handlers-and-middleware.html) para manipular a solicitação em saída ou inspecionar a resposta de entrada. Para manipular a solicitação em saída, registre um Guzzle middleware usando o método `withRequestMiddleware`:

```php
    use Illuminate\Support\Facades\Http;
    use Psr\Http\Message\RequestInterface;

    $response = Http::withRequestMiddleware(
        function (RequestInterface $request) {
            return $request->withHeader('X-Example', 'Value');
        }
    )->get('http://example.com');
```

Da mesma forma, você pode inspecionar a resposta HTTP de entrada registrando um middleware via o método 'withResponseMiddleware':

```php
    use Illuminate\Support\Facades\Http;
    use Psr\Http\Message\ResponseInterface;

    $response = Http::withResponseMiddleware(
        function (ResponseInterface $response) {
            $header = $response->getHeader('X-Example');

            // ...

            return $response;
        }
    )->get('http://example.com');
```

<a name="global-middleware"></a>
#### Middleware Global

Às vezes, você pode querer registrar um middleware que se aplica a cada solicitação de saída e resposta de entrada. Para fazer isso, você pode usar o método globalRequestMiddleware e o método globalResponseMiddleware. Geralmente, esses métodos devem ser chamados no método boot do seu `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Http;

Http::globalRequestMiddleware(fn ($request) => $request->withHeader(
    'User-Agent', 'Example Application/1.0'
));

Http::globalResponseMiddleware(fn ($response) => $response->withHeader(
    'X-Finished-At', now()->toDateTimeString()
));
```

<a name="guzzle-options"></a>
### Opções de engolir

Você pode especificar opções adicionais para uma solicitação de saída usando o método 'withOptions'. O método 'withOptions' aceita um array de pares chave-valor:

```php
    $response = Http::withOptions([
        'debug' => true,
    ])->get('http://example.com/users');
```

<a name="global-options"></a>
#### Opções Globais

Para configurar as opções padrão para cada solicitação de saída, você pode utilizar o método 'globalOptions'. Normalmente, esse método deve ser invocado do método 'boot' do seu provedor de serviços AppServiceProvider.

```php
use Illuminate\Support\Facades\Http;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Http::globalOptions([
        'allow_redirects' => false,
    ]);
}
```

<a name="concurrent-requests"></a>
## Pedidos Concorrentes

Às vezes você pode querer fazer vários pedidos HTTP simultaneamente. Em outras palavras, você quer que vários pedidos sejam enviados ao mesmo tempo em vez de emitir os pedidos sequencialmente. Isso pode levar a melhorias consideráveis ​​de desempenho ao interagir com lentos APIs HTTP.

Por sorte você pode realizar isso usando o método 'pool'. O método 'pool' aceita uma função de retorno que recebe uma instância 'Illuminate\Http\Client\Pool', permitindo adicionar facilmente requisições no pool de requisições para envio:

```php
    use Illuminate\Http\Client\Pool;
    use Illuminate\Support\Facades\Http;

    $responses = Http::pool(fn (Pool $pool) => [
        $pool->get('http://localhost/first'),
        $pool->get('http://localhost/second'),
        $pool->get('http://localhost/third'),
    ]);

    return $responses[0]->ok() &&
           $responses[1]->ok() &&
           $responses[2]->ok();
```

Como você pode ver, cada instância de resposta pode ser acessada com base na ordem em que foi adicionada à piscina. Se você quiser, você pode nomear as solicitações usando o método 'como', que permite aceder as respostas correspondentes pelo nome:

```php
    use Illuminate\Http\Client\Pool;
    use Illuminate\Support\Facades\Http;

    $responses = Http::pool(fn (Pool $pool) => [
        $pool->as('first')->get('http://localhost/first'),
        $pool->as('second')->get('http://localhost/second'),
        $pool->as('third')->get('http://localhost/third'),
    ]);

    return $responses['first']->ok();
```

<a name="customizing-concurrent-requests"></a>
#### Personalizando Pedidos Concorrentes

O método 'pool' não pode ser encadeado com outros métodos de clientes HTTP como o 'withHeaders' ou o 'middleware'. Se você quiser aplicar cabeçalhos ou middleware personalizados para solicitações agrupadas, você deve configurar essas opções em cada solicitação no pool:

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$headers = [
    'X-Example' => 'example',
];

$responses = Http::pool(fn (Pool $pool) => [
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
]);
```

<a name="macros"></a>
## Macros

O cliente HTTP Laravel permite definir “macros”, que podem servir como um mecanismo expressivo e fluido para configurar caminhos de solicitação e cabeçalhos comuns ao interagir com serviços em sua aplicação. Para começar, você pode definir o macro dentro do método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
use Illuminate\Support\Facades\Http;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Http::macro('github', function () {
        return Http::withHeaders([
            'X-Example' => 'example',
        ])->baseUrl('https://github.com');
    });
}
```

Uma vez que sua macro tenha sido configurada, você pode invocá-la de qualquer lugar em seu aplicativo para criar um pedido pendente com a configuração especificada:

```php
$response = Http::github()->get('/');
```

<a name="testing"></a>
## Teste

Muitos serviços Laravel fornecem funcionalidades para ajudar você a escrever testes de forma fácil e expressiva, e o cliente HTTP do Laravel não é exceção. O método 'fake' da fachada 'Http' permite instruir o cliente HTTP a retornar respostas de teste/dummy quando as requisições são feitas.

<a name="faking-responses"></a>
### Respostas Falso

Por exemplo, para instruir o cliente http a retornar respostas de código 200 vazias em cada solicitação, você pode chamar o método 'fake' sem argumentos:

```php
    use Illuminate\Support\Facades\Http;

    Http::fake();

    $response = Http::post(/* ... */);
```

<a name="faking-specific-urls"></a>
#### Falso URLs Específicos

Alternativamente, você pode passar um array para o método 'fake'. As chaves do array devem representar os padrões de URL que você deseja fingir e suas respostas associadas. O caractere '*' pode ser usado como um caractere curinga. Qualquer solicitação feita para URLs que não foram fingidas realmente serão executadas. Você pode usar o método 'response' da fachada 'Http' para construir respostas fictícias / stub para esses pontos finais:

```php
    Http::fake([
        // Stub a JSON response for GitHub endpoints...
        'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

        // Stub a string response for Google endpoints...
        'google.com/*' => Http::response('Hello World', 200, $headers),
    ]);
```

Se você gostaria de especificar um padrão de URL de fallback que fará todos os URLs sem correspondência, você pode usar apenas o caractere ' * ':

```php
    Http::fake([
        // Stub a JSON response for GitHub endpoints...
        'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

        // Stub a string response for all other endpoints...
        '*' => Http::response('Hello World', 200, ['Headers']),
    ]);
```

<a name="faking-response-sequences"></a>
#### Sequências de Resposta Falsas

Às vezes você pode precisar especificar que um único URL deve retornar uma série de respostas falsas em um determinado pedido. Você pode fazer isso usando o método `Http::sequence` para construir as respostas:

```php
    Http::fake([
        // Stub a series of responses for GitHub endpoints...
        'github.com/*' => Http::sequence()
                                ->push('Hello World', 200)
                                ->push(['foo' => 'bar'], 200)
                                ->pushStatus(404),
    ]);
```

Quando todas as respostas em uma sequência de resposta são consumidas, qualquer solicitação adicional fará com que a sequência de resposta lance uma exceção. Se você gostaria de especificar uma resposta padrão que deverá ser retornada quando uma sequência estiver vazia, você pode usar o método `whenEmpty`:

```php
    Http::fake([
        // Stub a series of responses for GitHub endpoints...
        'github.com/*' => Http::sequence()
                                ->push('Hello World', 200)
                                ->push(['foo' => 'bar'], 200)
                                ->whenEmpty(Http::response()),
    ]);
```

Se quiser que uma sequência de respostas seja simulada, mas não precisar especificar um padrão de URL que deve ser falsificado, você pode usar o método Http::fakeSequence:

```php
    Http::fakeSequence()
            ->push('Hello World', 200)
            ->whenEmpty(Http::response());
```

<a name="fake-callback"></a>
#### Chamada falsa de retorno

Se você precisa de lógica mais complexa para determinar quais respostas retornar para determinados pontos finais, você pode passar uma função anônima ao método `fake`. Esta função anônima receberá uma instância de `Illuminate\Http\Client\Request` e deverá retornar uma instância de resposta. Dentro da sua função anônima, você pode realizar qualquer lógica necessária para determinar que tipo de resposta deve ser retornado:

```php
    use Illuminate\Http\Client\Request;

    Http::fake(function (Request $request) {
        return Http::response('Hello World', 200);
    });
```

<a name="preventing-stray-requests"></a>
### Prevenção de Solicitações não Autorizadas

Se você gostaria de garantir que todas as requisições enviadas pelo cliente HTTP estão fakes durante o seu teste individual ou suite de testes completo, você pode chamar o método `preventStrayRequests`. Após chamar esse método, qualquer solicitação sem uma resposta correspondente irá gerar uma exceção em vez de fazer a solicitação real do HTTP:

```php
    use Illuminate\Support\Facades\Http;

    Http::preventStrayRequests();

    Http::fake([
        'github.com/*' => Http::response('ok'),
    ]);

    // An "ok" response is returned...
    Http::get('https://github.com/laravel/framework');

    // An exception is thrown...
    Http::get('https://laravel.com');
```

<a name="inspecting-requests"></a>
### Inspectando Pedidos

Ao simular respostas, você pode ocasionalmente querer inspecionar as solicitações que o cliente recebe para ter certeza de que seu aplicativo está enviando os dados ou cabeçalhos corretos. Você pode fazer isso chamando o método `Http::assertSent` após chamar `Http::fake`.

O método assertSent aceita um fechamento que receberá uma instância Illuminate\Http\Client\Request e deve retornar um valor booleano indicando se a solicitação corresponde às suas expectativas. Para o teste passar, pelo menos uma solicitação precisa ter sido emitida correspondendo às expectativas fornecidas:

```php
    use Illuminate\Http\Client\Request;
    use Illuminate\Support\Facades\Http;

    Http::fake();

    Http::withHeaders([
        'X-First' => 'foo',
    ])->post('http://example.com/users', [
        'name' => 'Taylor',
        'role' => 'Developer',
    ]);

    Http::assertSent(function (Request $request) {
        return $request->hasHeader('X-First', 'foo') &&
               $request->url() == 'http://example.com/users' &&
               $request['name'] == 'Taylor' &&
               $request['role'] == 'Developer';
    });
```

Se necessário, você pode afirmar que uma solicitação específica não foi enviada usando o método `assertNotSent`:

```php
    use Illuminate\Http\Client\Request;
    use Illuminate\Support\Facades\Http;

    Http::fake();

    Http::post('http://example.com/users', [
        'name' => 'Taylor',
        'role' => 'Developer',
    ]);

    Http::assertNotSent(function (Request $request) {
        return $request->url() === 'http://example.com/posts';
    });
```

Você pode usar o método `assertSentCount` para verificar quantos requisições foram "enviadas" durante o teste:

```php
    Http::fake();

    Http::assertSentCount(5);
```

Ou você pode usar o método `assertNothingSent` para afirmar que nenhuma solicitação foi enviada durante o teste:

```php
    Http::fake();

    Http::assertNothingSent();
```

<a name="recording-requests-and-responses"></a>
#### Gerenciando Solicitações de Gravação

Você pode usar o método "recorded" para reunir todas as solicitações e suas respostas correspondentes. O método "recorded" retorna uma coleção de matrizes que contém instâncias de Illuminate\Http\Client\Request e Illuminate\Http\Client\Response:

```php
Http::fake([
    'https://laravel.com' => Http::response(status: 500),
    'https://nova.laravel.com/' => Http::response(),
]);

Http::get('https://laravel.com');
Http::get('https://nova.laravel.com/');

$recorded = Http::recorded();

[$request, $response] = $recorded[0];
```

Além disso, o método 'recorded' aceita um fechamento que receberá uma instância de 'Illuminate\Http\Client\Request' e 'Illuminate\Http\Client\Response' e pode ser usado para filtrar pares de solicitação / resposta com base em suas expectativas.

```php
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\Response;

Http::fake([
    'https://laravel.com' => Http::response(status: 500),
    'https://nova.laravel.com/' => Http::response(),
]);

Http::get('https://laravel.com');
Http::get('https://nova.laravel.com/');

$recorded = Http::recorded(function (Request $request, Response $response) {
    return $request->url() !== 'https://laravel.com' &&
           $response->successful();
});
```

<a name="events"></a>
## Eventos

Laravel dispara três eventos durante o processo de envio de requisições HTTP. O evento "RequestSending" é disparado antes que uma requisição seja enviada, enquanto o evento "ResponseReceived" é disparado após o recebimento da resposta para uma determinada requisição. O evento "ConnectionFailed" é disparado se não houver recebimento de resposta para uma determinada requisição.

Os eventos RequestSending e ConnectionFailed contêm, respectivamente, as propriedades públicas $request e $response que podem ser usadas para inspecionar os objetos Illuminate\Http\Client\Request e Illuminate\Http\Client\Response. Você pode criar [eventos de escuta](/docs/events) para esses eventos dentro do seu aplicativo:

```php
    use Illuminate\Http\Client\Events\RequestSending;

    class LogRequest
    {
        /**
         * Handle the given event.
         */
        public function handle(RequestSending $event): void
        {
            // $event->request ...
        }
    }
```
