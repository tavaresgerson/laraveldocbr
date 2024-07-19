# HTTP Client

<a name="introduction"></a>
## Introdução

 O Laravel fornece uma API expressiva e mínima em torno do cliente [HTTP Guzzle](http://docs.guzzlephp.org/en/stable/), permitindo que você faça requisições HTTP indo para a comunicação com outros aplicativos da Web de maneira rápida. O invólucro do Laravel em torno do Guzzle está focado nos casos de uso mais comuns e uma experiência maravilhosa ao desenvolvedor.

<a name="making-requests"></a>
## Fazendo Pedidos

 Para fazer solicitações, é possível utilizar os métodos `head`, `get`, `post`, `put`, `patch` e `delete`, fornecidos pela faca `Http`. Primeiro, examinaremos como realizar uma solicitação básica de `GET` para outra URL:

```php
    use Illuminate\Support\Facades\Http;

    $response = Http::get('http://example.com');
```

 O método get retorna uma instância de Illuminate\Http\Client\Response, que disponibiliza vários métodos para inspeção da resposta.

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

 O objeto `Illuminate\Http\Client\Response` também implementa a interface PHP `ArrayAccess`, que permite o acesso direto aos dados da resposta JSON na resposta:

```php
    return Http::get('http://example.com/users/1')['name'];
```

 Além dos métodos de resposta acima listados, os seguintes métodos podem ser utilizados para determinar se uma resposta tem um determinado código de estado:

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
#### Modelos de URI

 Com o cliente HTTP, também é possível construir URLs de solicitação usando a especificação [de modelo de URL da URI](https://www.rfc-editor.org/rfc/rfc6570). Para definir os parâmetros de URL que podem ser expandidos pelo modelo de URL, você pode usar o método `withUrlParameters`:

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

 Se você deseja descartar a instância de requisição em trânsito antes que ela seja enviada e terminar a execução do script, é possível adicionar o método `dd` para o início da definição de sua requisição:

```php
    return Http::dd()->get('http://example.com');
```

<a name="request-data"></a>
### Pedido de dados

 É comum enviar dados adicionais em requisições `POST`, `PUT` e `PATCH`. Por isso, estas funcionalidades permitem que você utilize uma matriz de dados como segundo argumento. Os dados serão enviados com o tipo de conteúdo `application/json`:

```php
    use Illuminate\Support\Facades\Http;

    $response = Http::post('http://example.com/users', [
        'name' => 'Steve',
        'role' => 'Network Administrator',
    ]);
```

<a name="get-request-query-parameters"></a>
#### Parâmetros de consulta de solicitação GET

 Ao fazer solicitações "GET", pode anexar uma string de consulta à URL diretamente ou enviar um array de pares chave/valor como segundo argumento para a metodologia `get`:

```php
    $response = Http::get('http://example.com/users', [
        'name' => 'Taylor',
        'page' => 1,
    ]);
```
 Em alternativa, pode ser utilizada a método `withQueryParameters`:

```php
    Http::retry(3, 100)->withQueryParameters([
        'name' => 'Taylor',
        'page' => 1,
    ])->get('http://example.com/users')
```

<a name="sending-form-url-encoded-requests"></a>
#### Enviar solicitações codificadas de URL do formulário

 Se pretender enviar dados com o tipo de conteúdo `application/x-www-form-urlencoded`, deve chamar a função `asForm` antes de realizar o pedido:

```php
    $response = Http::asForm()->post('http://example.com/users', [
        'name' => 'Sara',
        'role' => 'Privacy Consultant',
    ]);
```

<a name="sending-a-raw-request-body"></a>
#### Enviando um corpo de pedido bruto

 É possível usar o método `withBody` se pretender fornecer um corpo de solicitação bruto ao efetuar uma solicitação. O tipo de conteúdo pode ser definido como um segundo argumento no método:

```php
    $response = Http::withBody(
        base64_encode($photo), 'image/jpeg'
    )->post('http://example.com/photo');
```

<a name="multi-part-requests"></a>
#### Pedidos com várias partes

 Se pretender enviar arquivos como pedidos com partes múltiplas, deverá chamar o método `attach` antes de efetuar seu pedido. Esse método aceita o nome do arquivo e seu conteúdo. Se necessário, poderá fornecer um terceiro argumento que será considerado como o nome do arquivo, enquanto um quarto argumento pode ser usado para fornecer cabeçalhos associados ao arquivo:

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
### Headers

 É possível adicionar headers aos pedidos usando o método `withHeaders`. Este método aceita um array de pares chave/valor:

```php
    $response = Http::withHeaders([
        'X-First' => 'foo',
        'X-Second' => 'bar'
    ])->post('http://example.com/users', [
        'name' => 'Taylor',
    ]);
```

 Você pode usar o método `accept` para especificar o tipo de conteúdo que a sua aplicação está esperando em resposta ao seu pedido:

```php
    $response = Http::accept('application/json')->get('http://example.com/users');
```

 Para conveniência, você pode usar o método `acceptJson` para especificar rapidamente que seu aplicativo espera o tipo de conteúdo `application/json` em resposta ao seu pedido:

```php
    $response = Http::acceptJson()->get('http://example.com/users');
```

 O método `withHeaders` combina novas cabeçalhos ao conjunto de cabeçalhos existentes na requisição. Se necessário, podem substituir totalmente todos os cabeçalhos utilizando o método `replaceHeaders`:

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

 Você pode especificar credenciais de autenticação básicas e por comprovação usando os métodos `withBasicAuth` e `withDigestAuth`, respectivamente:

```php
    // Basic authentication...
    $response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(/* ... */);

    // Digest authentication...
    $response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(/* ... */);
```

<a name="bearer-tokens"></a>
#### Tokens de Transferência

 Se você deseja adicionar rapidamente um token de transporte à seção `Authorization` do pedido, poderá usar o método `withToken`:

```php
    $response = Http::withToken('token')->post(/* ... */);
```

<a name="timeout"></a>
### Tempo de espera

 O método `timeout` permite especificar o número máximo de segundos para espera por uma resposta. Por padrão, o cliente de HTTP tem um tempo limite de 30 segundos:

```php
    $response = Http::timeout(3)->get(/* ... */);
```

 Se o tempo de espera for excedido, uma instância do `Illuminate\Http\Client\ConnectionException` será lançada.

 Você pode especificar o número máximo de segundos para aguardar durante a tentativa de conexão ao servidor usando o método `connectTimeout`:

```php
    $response = Http::connectTimeout(3)->get(/* ... */);
```

<a name="retries"></a>
### Repedições

 Se você preferir que o HTTP client retenha automaticamente a requisição se um erro do cliente ou servidor ocorrer, poderá utilizar o método `retry`. O `retry` aceita o número máximo de vezes que será tentada a requisição e o número de milésimos de segundo que o Laravel esperará entre cada uma delas:

```php
    $response = Http::retry(3, 100)->post(/* ... */);
```

 Se pretender calcular manualmente o número de milésimos de segundo para o período de pausa entre tentativas, poderá enviar um fecho como segundo argumento ao método `retry`:

```php
    use Exception;

    $response = Http::retry(3, function (int $attempt, Exception $exception) {
        return $attempt * 100;
    })->post(/* ... */);
```

 Para conveniência, é possível fornecer um array como o primeiro argumento do método `retry`. Este array será usado para determinar quantos milésimos de segundo aguardar entre tentativas sucessivas:

```php
    $response = Http::retry([100, 200])->post(/* ... */);
```

 Se necessário, você pode passar um terceiro argumento para o método `retry`. O terceiro argumento deve ser uma função que determine se os tentativas de retransmissão devem realmente ser executadas. Por exemplo, você poderá querer fazer a transação somente quando ocorrer um erro no banco de dados:

```php
    use Exception;
    use Illuminate\Http\Client\PendingRequest;

    $response = Http::retry(3, 100, function (Exception $exception, PendingRequest $request) {
        return $exception instanceof ConnectionException;
    })->post(/* ... */);
```

 Se o pedido falhar, talvez seja conveniente fazer uma alteração no pedido antes de um novo tentativa ser realizada. Isto pode ser feito modificando os argumentos do pedido fornecidos à chamável que foi enviada para a função `retry`. Por exemplo, se pretender voltar a fazer o pedido com um novo token de autorização caso o primeiro tenha dado erro de autenticação:

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

 Se todas as solicitações falharem, será lançada uma instância de `Illuminate\Http\Client\RequestException`. Caso você deseje desativar esse comportamento, pode fornecer um argumento de `throw` com o valor `false`. Quando desativado, a última resposta recebida pelo cliente será retornada depois que todas as tentativas de retry foram realizadas:

```php
    $response = Http::retry(3, 100, throw: false)->post(/* ... */);
```

 > [ATENÇÃO]
 > Se todos os pedidos falharem devido a um problema de conexão, uma `Illuminate\Http\Client\ConnectionException` será lançada mesmo quando o argumento `throw` estiver definido como `false`.

<a name="error-handling"></a>
### Lidar com erros

 Ao contrário do comportamento padrão de Guzzle, o wrapper de cliente HTTP do Laravel não lança exceções em casos de erros no cliente ou servidor (`respostas com nível 400 e 500` dos servidores). Você pode determinar se um desses erros foi retornado usando os métodos `successful`, `clientError`, ou `serverError`:

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
#### Lançando exceções

 Se você tiver uma instância de resposta e desejar gerar uma exceção `Illuminate\Http\Client\RequestException` se o código do status da resposta indicar um erro no cliente ou servidor, poderá usar as funções `throw` ou `throwIf`:

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

 A instância de `Illuminate\Http\Client\RequestException` possui uma propriedade pública `$response`, que permite inspecionar a resposta retornada.

 O método `throw` retorna a instância de resposta se não ocorreu nenhum erro, permitindo que você faça uma série de operações com o método `throw`:

```php
    return Http::post(/* ... */)->throw()->json();
```

 Se desejar executar alguma lógica adicional antes da exceção ser lançada, pode passar um bloco de closures para o método `throw`. A exceção é automaticamente lançada após o invólucro for invocado. Não será necessário re-lançar a exceção a partir do bloco de closures:

```php
    use Illuminate\Http\Client\Response;
    use Illuminate\Http\Client\RequestException;

    return Http::post(/* ... */)->throw(function (Response $response, RequestException $e) {
        // ...
    })->json();
```

<a name="guzzle-middleware"></a>
### Middleware do Guzzle

 Como o cliente HTTP do Laravel é gerenciado pelo Guzzle, você pode aproveitar os [médios de Guzzle](https://docs.guzzlephp.org/en/stable/handlers-and-middleware.html) para manipular a requisição que sai ou inspecionar a resposta recebida. Para manipular a requisição, registre um médio de Guzzle através do método `withRequestMiddleware`:

```php
    use Illuminate\Support\Facades\Http;
    use Psr\Http\Message\RequestInterface;

    $response = Http::withRequestMiddleware(
        function (RequestInterface $request) {
            return $request->withHeader('X-Example', 'Value');
        }
    )->get('http://example.com');
```

 Da mesma forma, você pode inspecionar a resposta HTTP recebida ao registrar um middleware através do método `withResponseMiddleware`:

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
#### Middleware global

 Às vezes, você pode desejar registrar um middleware que se aplica a todas as solicitações e respostas. Para fazer isso, pode usar os métodos `globalRequestMiddleware` e `globalResponseMiddleware`. Normalmente, esses métodos devem ser invocados no método `boot` do `AppServiceProvider` da sua aplicação:

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
### Opções do Guzzle

 Você pode especificar opções de solicitação adicionais [do Guzzle](http://docs.guzzlephp.org/en/stable/request-options.html) para uma solicitação remetente usando o método `withOptions`. O método `withOptions` aceita um array de pares de chave / valor:

```php
    $response = Http::withOptions([
        'debug' => true,
    ])->get('http://example.com/users');
```

<a name="global-options"></a>
#### Opções Globais

 Para configurar opções padrão para cada solicitação de saída, você pode utilizar o método `globalOptions`. Normalmente, esse método deve ser invocado a partir do método `boot` do provedor de serviço `AppService`:

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
## Pedidos em Sessão Conjunta

 Às vezes você pode querer fazer várias requisições de HTTP simultaneamente. Ou seja, gostaria que vários pedidos fossem enviados ao mesmo tempo em vez de emitir os pedidos sequencialmente. Isso pode levar a melhorias substanciais no desempenho ao interagir com APIs lentas do protocolo HTTP.

 Felizmente, você pode fazer isso usando o método `pool`. O método `pool` aceita um closure que recebe uma instância de `Illuminate\Http\Client\Pool`, permitindo que você adicione facilmente pedidos ao pool de solicitações para distribuição:

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

 Como você pode ver, cada instância de resposta é acessada com base na ordem em que foi adicionada ao pool. Se desejar, você pode nomear as solicitações usando o método `as`, o que permite acessar as correspondentes respostas pelo nome:

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
#### Personalizar requisições em modo concorrente

 O método `pool` não pode ser concatenado com outros métodos de clientes HTTP como o `withHeaders` ou `middleware`. Se você quiser aplicar cabeçalhos personalizados ou middlewares para requisições compartilhadas, você deve configurar essas opções em cada requisição do pool:

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

 O cliente HTTP do Laravel permite definir "máscaras", que podem servir como um mecanismo expressivo e fluente para configurar caminhos de solicitação comuns e cabeçalhos ao interagir com serviços em toda a sua aplicação. Para começar, você deve definir a máscara dentro do método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

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

 Depois que sua macro tiver sido configurada, você poderá invocá-la de qualquer lugar em sua aplicação para criar um pedido pendente com o tipo e as configurações especificados:

```php
$response = Http::github()->get('/');
```

<a name="testing"></a>
## Teste

 Muitos serviços de Laravel fornecem funcionalidade para ajudar a escrever testes com facilidade e expressividade, e o cliente HTTP do Laravel não é exceção. O método `fake` da facade `Http` permite instruir o cliente HTTP para retornar respostas ficcionadas quando são feitas solicitações.

<a name="faking-responses"></a>
### Falsificando respostas

 Por exemplo, para instruir o cliente de HTTP a retornar respostas com um código de estado vazio e `200`, você pode chamar o método `fake` sem nenhum argumento:

```php
    use Illuminate\Support\Facades\Http;

    Http::fake();

    $response = Http::post(/* ... */);
```

<a name="faking-specific-urls"></a>
#### Falsificando endereços de URL específicos

 Como alternativa, você pode passar um array para o método `fake`. As chaves do array representam os padrões de URL que você deseja falsificar e suas respostas associadas. O caractere `*` pode ser utilizado como caracter de substituição. Todos os pedidos feitos a URLs que não foram falsificadas serão realmente executados. Você pode usar o método `response` da faca do `Http` para construir respostas fictícias/falsificadas para esses endpoints:

```php
    Http::fake([
        // Stub a JSON response for GitHub endpoints...
        'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

        // Stub a string response for Google endpoints...
        'google.com/*' => Http::response('Hello World', 200, $headers),
    ]);
```

 Se você deseja especificar um padrão de URL de retorno que redirecione todos os endereços não correspondidos, poderá utilizar um único caractere `* `:

```php
    Http::fake([
        // Stub a JSON response for GitHub endpoints...
        'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

        // Stub a string response for all other endpoints...
        '*' => Http::response('Hello World', 200, ['Headers']),
    ]);
```

<a name="faking-response-sequences"></a>
#### Fingindo sequências de resposta

 Às vezes, você pode precisar especificar que uma única URL deverá retornar uma série de respostas falsas em um determinado ordem. Você poderá fazer isso usando o método `Http::sequence` para construir as respostas:

```php
    Http::fake([
        // Stub a series of responses for GitHub endpoints...
        'github.com/*' => Http::sequence()
                                ->push('Hello World', 200)
                                ->push(['foo' => 'bar'], 200)
                                ->pushStatus(404),
    ]);
```

 Quando todas as respostas de uma sequência de resposta forem consumidas, quaisquer pedidos adicionais farão com que a sequência de respostas gere uma exceção. Se pretender especificar uma resposta por defeito a ser retornada quando a sequência estiver vazia, poderá utilizar o método `whenEmpty`:

```php
    Http::fake([
        // Stub a series of responses for GitHub endpoints...
        'github.com/*' => Http::sequence()
                                ->push('Hello World', 200)
                                ->push(['foo' => 'bar'], 200)
                                ->whenEmpty(Http::response()),
    ]);
```

 Se você deseja fingir uma seqüência de respostas, mas não precisa especificar um padrão de URL específico que deve ser enganado, pode usar o método `Http::fakeSequence`:

```php
    Http::fakeSequence()
            ->push('Hello World', 200)
            ->whenEmpty(Http::response());
```

<a name="fake-callback"></a>
#### Retorno Falso

 Se você precisar de uma lógica mais complexa para determinar quais respostas retornar em determinados pontos finais, poderá passar um closure à metodologia `fake`. Este closure receberá uma instância do `Illuminate\Http\Client\Request` e deverá retornar uma instância de resposta. No seu closure, você pode executar qualquer lógica necessária para determinar que tipo de resposta retornar:

```php
    use Illuminate\Http\Client\Request;

    Http::fake(function (Request $request) {
        return Http::response('Hello World', 200);
    });
```

<a name="preventing-stray-requests"></a>
### Evitar solicitações perdidas

 Se pretender garantir que todas as solicitações enviadas através de um cliente HTTP tenham sido falsificados durante o seu teste individual ou na totalidade do conjunto de testes, pode chamar a função `preventStrayRequests`. Após a chamada desta função, qualquer solicitação que não possua uma resposta correspondente fará levantar uma exceção em vez de realizar a solicitação HTTP real:

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
### Inspeção de pedidos

 Para forjar respostas, você pode desejar inspecionar os pedidos que o client recebe ocasionalmente para se certificar de que seu aplicativo está enviando os dados ou as cabeçalhas corretos. Isso pode ser feito chamando o método `Http::assertSent` após chamar o `Http::fake`.

 O método `assertSent` aceita um closure (closure) que recebe uma instância de `Illuminate\Http\Client\Request` e deve retornar um valor boolean indicando se o pedido corresponde às suas expectativas. Para que a verificação passe, pelo menos um pedido deve ter sido emitido correspondendo às expectativas dadas:

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

 Se necessário, pode afirmar que não foi enviado um pedido específico usando o método `assertNotSent`:

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

 Você pode usar o método `assertSentCount` para afirmar quantas solicitações foram "enviadas" durante o teste:

```php
    Http::fake();

    Http::assertSentCount(5);
```

 Ou você pode usar o método `assertNothingSent` para garantir que nenhum pedido foi enviado durante o teste.

```php
    Http::fake();

    Http::assertNothingSent();
```

<a name="recording-requests-and-responses"></a>
#### Pedidos de gravação/Respostas

 Você pode usar o método `recorded` para coletar todas as requisições e suas respostas correspondentes. O método `recorded` retorna uma coleção de arrays que contém instâncias do `Illuminate\Http\Client\Request` e `Illuminate\Http\Client\Response`:

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

 Além disso, o método `recorded` aceita um closure que recebe uma instância de `Illuminate\Http\Client\Request` e `Illuminate\Http\Client\Response`, e pode ser utilizado para filtrar pares de solicitação/resposta com base nas suas expectativas:

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

 O Laravel dispara três eventos durante o processo de envio de solicitações HTTP. O evento `RequestSending` é disparado antes do envio da solicitação, enquanto que o evento `ResponseReceived` é disparado depois que uma resposta for recebida para a solicitação correspondente. O evento `ConnectionFailed` é disparado se não tiver sido recebida qualquer resposta para a solicitação correspondente.

 Os eventos `RequestSending` e `ConnectionFailed` contêm uma propriedade pública `$request`, que você pode usar para inspecionar a instância de `Illuminate\Http\Client\Request`. Do mesmo modo, o evento `ResponseReceived` contém as propriedades `$request` e `$response`, que podem ser usadas para inspeção da instância de `Illuminate\Http\Client\Response`. Você pode criar [ouvintes de eventos](/docs/events) para estes eventos na sua aplicação:

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
