# Geração de URL

## Introdução
O Laravel disponibiliza vários helpers (auxiliares) para ajudá-lo a gerar URLs para a sua aplicação. Esses auxiliares são úteis principalmente quando você estiver criando links em templates e respostas da API, ou ao gerar respostas de redirecionamento para outra parte da sua aplicação.

## O básico

### Gerando URLs
O assistente `url` permite gerar URLs arbitrárias para a sua aplicação. A URL gerada utilizará automaticamente o esquema (HTTP ou HTTPS) e o host do pedido atual da aplicação:

```php
    $post = App\Models\Post::find(1);

    echo url("/posts/{$post->id}");

    // http://example.com/posts/1
```

Para gerar uma URL com parâmetros de string de consulta, você pode usar o método `query`:

```php
    echo url()->query('/posts', ['search' => 'Laravel']);

    // https://example.com/posts?search=Laravel

    echo url()->query('/posts?sort=latest', ['search' => 'Laravel']);

    // http://example.com/posts?sort=latest&search=Laravel
```

Fornecer parâmetros de strings de consulta que já existem na url irá substituir seu valor atual:

```php
    echo url()->query('/posts?sort=latest', ['sort' => 'oldest']);

    // http://example.com/posts?sort=oldest
```

Você também pode usar arrays de valores como parâmetros de consulta. Estes valores serão devidamente encaminhados e codificados na URL gerada:

```php
    echo $url = url()->query('/posts', ['columns' => ['title', 'body']]);

    // http://example.com/posts?columns%5B0%5D=title&columns%5B1%5D=body

    echo urldecode($url);

    // http://example.com/posts?columns[0]=title&columns[1]=body
```

### Acesso ao endereço atual da página
Se nenhum caminho for especificado para o auxiliar `url`, uma instância `Illuminate\Routing\UrlGenerator` é retornada, permitindo o acesso à informação da URL atual:

```php
    // Obtenha o URL atual sem a string de consulta...
    echo url()->current();

    // Obtenha o URL atual incluindo a string de consulta...
    echo url()->full();

    // Obtenha o URL completo da solicitação anterior...
    echo url()->previous();
```

Cada um destes métodos também pode ser acessado através da `URL` [facade](/docs/facades):

```php
    use Illuminate\Support\Facades\URL;

    echo URL::current();
```

## URLs para Rotas Com Nomes
O auxiliar `route` pode ser usado para gerar URLs para [rotas nomeadas](/docs/routing#named-routes). As rotas nomeadas permitem gerar URLs sem serem acopladas a URL real definida na rota. Portanto, se a URL da rota mudar, nenhuma alteração precisará ser feita em suas chamadas para a função `route`. Por exemplo, imagine que seu aplicativo contém uma rota definida como a seguir:

```php
    Route::get('/post/{post}', function (Post $post) {
        // ...
    })->name('post.show');
```

Para gerar uma URL para esta rota, você pode usar o recurso auxiliar `route`, da seguinte maneira:

```php
    echo route('post.show', ['post' => 1]);

    // http://example.com/post/1
```

Claro que o `route` poderá ser utilizado para gerar URLs com vários parâmetros em rotas:

```php
    Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
        // ...
    })->name('comment.show');

    echo route('comment.show', ['post' => 1, 'comment' => 3]);

    // http://example.com/post/1/comment/3
```

Quaisquer elementos adicionais da matriz que não correspondem aos parâmetros de definição da rota serão adicionados ao parâmetro query da URL.

```php
    echo route('post.show', ['post' => 1, 'search' => 'rocket']);

    // http://example.com/post/1?search=rocket
```

#### Modelos Eloquent
Geralmente você estará gerando URLs utilizando a chave de rota (normalmente o chave primária) dos [modelos Eloquent](/docs/eloquent). Por este motivo, é possível passar modelos Eloquent como valores do parâmetro. O auxiliar `route` irá extrair automaticamente a chave da rota do modelo:

```php
    echo route('post.show', ['post' => $post]);
```

### URLs assinadas
O Laravel permite criar facilmente URLs "assinadas" para rotas nomeadas. Essas URLs têm um hash de assinatura anexado à string de consulta, que permite ao Laravel verificar se a URL não foi modificada desde que foi criada. As URLs assinadas são especialmente úteis para as rotas publicamente acessíveis mas que precisam de uma camada de proteção contra a manipulação da URL.

Por exemplo, você pode usar URLs assinadas para implementar um link público de "cancelamento" que é enviado por e-mail aos seus clientes. Para criar uma URL assinada com uma rota nomeada, use o método `signedRoute` da facade `URL`:

```php
    use Illuminate\Support\Facades\URL;

    return URL::signedRoute('unsubscribe', ['user' => 1]);
```

Você pode excluir o domínio do hash da URL assinada, fornecendo o argumento `absolute` para a metodologia `signedRoute`:

```php
    return URL::signedRoute('unsubscribe', ['user' => 1], absolute: false);
```

Se desejar gerar uma URL de rota assinada temporária que expira após um determinado período de tempo, você poderá usar o método `temporarySignedRoute`. Quando o Laravel valida uma URL de rota assinada temporária, ele garante que a marcação da data e hora não tenha decorrido:

```php
    use Illuminate\Support\Facades\URL;

    return URL::temporarySignedRoute(
        'unsubscribe', now()->addMinutes(30), ['user' => 1]
    );
```

#### Validação de pedidos de rota assinados
Para verificar se uma requisição recebida possui uma assinatura válida, você deve chamar o método `hasValidSignature` em uma instância da requisição `Illuminate\Http\Request`:

```php
    use Illuminate\Http\Request;

    Route::get('/unsubscribe/{user}', function (Request $request) {
        if (! $request->hasValidSignature()) {
            abort(401);
        }

        // ...
    })->name('unsubscribe');
```

Por vezes, você poderá ter de permitir que o frontend da aplicação adicione dados a uma URL assinada, por exemplo, ao efetuar uma paginação do lado do cliente. Para tal, você pode especificar parâmetros da consulta que devem ser ignorados quando se valida uma URL assinada através do método `hasValidSignatureWhileIgnoring`. Lembre-se de que a opção de ignorar os parâmetros permite que qualquer pessoa modifique estes na requisição.

```php
    if (! $request->hasValidSignatureWhileIgnoring(['page', 'order'])) {
        abort(401);
    }
```

Em vez de validar URLs assinados usando a instância de solicitação recebida, você pode atribuir o `signed` (`Illuminate\Routing\Middleware\ValidateSignature`) [middleware](/docs/middleware) à rota. Se a solicitação recebida não tiver uma assinatura válida, o middleware retornará automaticamente uma resposta HTTP `403`:

```php
    Route::post('/unsubscribe/{user}', function (Request $request) {
        // ...
    })->name('unsubscribe')->middleware('signed');
```

Se as suas URLs assinadas não incluírem o domínio na expressão hash da URL, você deve fornecer o argumento `relative` ao middleware:

```php
    Route::post('/unsubscribe/{user}', function (Request $request) {
        // ...
    })->name('unsubscribe')->middleware('signed:relative');
```

#### Resposta a rotas assinadas inválidas
Quando alguém visita uma URL assinada que expirou, este receberá uma página de erro genérica para o código de status HTTP "403". No entanto, você pode personalizar esse comportamento definindo uma closure de renderização personalizada para a exceção `InvalidSignatureException` no arquivo `bootstrap/app.php` da sua aplicação:

```php
    use Illuminate\Routing\Exceptions\InvalidSignatureException;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (InvalidSignatureException $e) {
            return response()->view('error.link-expired', [], 403);
        });
    })
```

## URLs para ações do controlador
A função `action` gera uma URL para a ação do controlador fornecida:

```php
    use App\Http\Controllers\HomeController;

    $url = action([HomeController::class, 'index']);
```

Se o método do controlador aceitar parâmetros de rota, você poderá passar um array para associação de parâmetros de rota como segundo argumento à função.

```php
    $url = action([UserController::class, 'profile'], ['id' => 1]);
```

## Valores Padrão
Para algumas aplicações, pode ser desejável especificar valores padrão para alguns parâmetros da solicitação de forma global. Por exemplo, digamos que muitos dos seus roteadores definem um parâmetro `{locale}`:

```php
    Route::get('/{locale}/posts', function () {
        // ...
    })->name('post.index');
```

É oneroso sempre passar o `locale` todas as vezes que você chama o helper `route`. Por isso, você pode usar o método `URL::defaults` para definir um valor padrão para este parâmetro que será sempre aplicado durante a solicitação atual. Você pode querer chamar esse método a partir de um [middleware de rota](/docs/middleware#assigning-middleware-to-routes) para ter acesso à solicitação atual:

```php
    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\URL;
    use Symfony\Component\HttpFoundation\Response;

    class SetDefaultLocaleForUrls
    {
        /**
         * Handle an incoming request.
         *
         * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
         */
        public function handle(Request $request, Closure $next): Response
        {
            URL::defaults(['locale' => $request->user()->locale]);

            return $next($request);
        }
    }
```

Uma vez que o valor padrão para o parâmetro `locale` tenha sido definido, você não precisa mais passar seu valor ao gerar URLs por meio do auxiliar `route`.

#### URLs padrões e prioridade do middleware
Definir valores padrão de URL pode interferir no tratamento de ligações implícitas de modelo pelo Laravel. Portanto, você deve [priorizar seu middleware](/docs/middleware#sorting-middleware) que define URLs padrão para serem executados antes do middleware `SubstituteBindings` do próprio Laravel. Você pode fazer isso usando o método de middleware `priority` no arquivo `bootstrap/app.php` da sua aplicação:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->priority([
        \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
        \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
        \Illuminate\Routing\Middleware\ThrottleRequests::class,
        \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
        \Illuminate\Session\Middleware\AuthenticateSession::class,
        \App\Http\Middleware\SetDefaultLocaleForUrls::class, // [tl! add]
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \Illuminate\Auth\Middleware\Authorize::class,
    ]);
})
```
