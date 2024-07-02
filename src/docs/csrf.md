# Proteção contra ataques de cross-site scripting

<a name="csrf-introduction"></a>
## Introdução

 Falsificação de pedidos entre sites é um tipo de exploração maliciosa em que comandos não autorizados são executados em nome de um usuário autenticado. Felizmente, o Laravel facilita a proteção da sua aplicação contra ataques [de falsificação de pedido de site diferente](https://pt.wikipedia.org/wiki/Cross-site_request_forgery) (CSRF).

<a name="csrf-explanation"></a>
#### Uma explicação da vulnerabilidade

 Caso você não esteja familiarizado com as solicitações de falsificação entre sites, vamos discutir um exemplo de como essa vulnerabilidade pode ser explorada. Imagine que o seu aplicativo tenha uma rota de `/user/email`, que aceite uma solicitação `POST` para alterar o endereço do email do usuário autenticado. Muito provavelmente, esta rota espera um campo de entrada `email` para conter o endereço de e-mail que o usuário gostaria de começar a usar.

 Sem proteção contra CSRF, um site maligno poderia criar um formulário de HTML que aponta para a rota de sua aplicação (`/_user/email`) e enviar o endereço de e-mail do usuário malicioso:

```blade
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

 Se o site mal-intencionado enviar automaticamente o formulário quando a página for carregada, será necessário apenas persuadir um utilizador não desconfiado da sua aplicação para visitar o site e o endereço de correio eletrónico será alterado na aplicação.

 Para impedir essa vulnerabilidade, precisamos inspecionar cada solicitação de entrada `POST`, `PUT`, `PATCH` ou `DELETE` para um valor secreto da sessão que o aplicativo malicioso não tem acesso.

<a name="preventing-csrf-requests"></a>
## Evitar requisições CSRF

 O Laravel gera automaticamente um "token" CSRF para cada [sessão de usuário ativo](/docs/session) gerenciada pela aplicação. Este token é utilizado para verificar se o utilizador autenticado é realmente a pessoa que está a fazer os pedidos à aplicação. Uma vez que este token é armazenado na sessão do utilizador e altera-se sempre que a sessão for regenerada, uma aplicação maliciosa não tem acesso ao mesmo.

 O token de CSRF da sessão atual pode ser acessado por meio da sessão da requisição ou por meio do auxílio de função `csrf_token`:

```php
    use Illuminate\Http\Request;

    Route::get('/token', function (Request $request) {
        $token = $request->session()->token();

        $token = csrf_token();

        // ...
    });
```

 Sempre que definir um formulário HTML "POST", "PUT", "PATCH" ou "DELETE" na sua aplicação, deve incluir no formulário um campo oculto `_token` de CSRF para que a middleware de proteção contra ataques XSS possa validar o pedido. Para conveniência, pode utilizar a directiva `@csrf` Blade para gerar o campo de introdução do token:

```blade
<form method="POST" action="/profile">
    @csrf

    <!-- Equivalent to... -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

 O `Illuminate\Foundation\Http\Middleware\ValidateCsrfToken` [middleware] (microserviço) é incluído no grupo de microserviços padrão "web" e verifica automaticamente se o token na solicitação coincide com o armazenado na sessão. Quando estes dois tokens correspondem, sabemos que o usuário autenticado é aquele iniciando a solicitação.

<a name="csrf-tokens-and-spas"></a>
### Tokens de CSRF e SPAs

 Se você estiver construindo um SPA que utiliza o Laravel como um back-end de API, consulte a documentação do [Laravel Sanctum](/docs/sanctum) para obter informações sobre autenticação com sua API e proteção contra vulnerabilidades CSRF.

<a name="csrf-excluding-uris"></a>
### Excluindo os URIs da proteção contra a CSRF

 Às vezes, pode desejar excluir um conjunto de endereços URI da proteção contra CSRF. Por exemplo, se estiver a utilizar [Stripe](https://stripe.com) para efetuar pagamentos e utilizar o sistema webhook da Stripe, terá de excluir a rota do seu manipulador de webhooks da proteção contra CSRF, pois a Stripe não saberá que token CSRF enviar para as suas rotas.

 Normalmente, você deve colocar este tipo de rotas fora do grupo de middleware `web` que o Laravel aplica a todas as rotas no arquivo `routes/web.php`. Porém, também é possível excluir rotas específicas, fornecendo seus URIs para o método `validateCsrfTokens` em seu arquivo `bootstrap/app.php`:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'stripe/*',
            'http://example.com/foo/bar',
            'http://example.com/foo/*',
        ]);
    })
```

 > [!NOTA]
 [ executando testes] (/docs/{{ version }}/testing).

<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

 Além do controlo do token CSRF como um parâmetro POST, o middleware `Illuminate\Foundation\Http\Middleware\ValidateCsrfToken`, que é incluído no grupo de middlewares `web` por padrão, também irá verificar a secção do cabeçalho da solicitação `X-CSRF-TOKEN`. Podia, por exemplo, armazenar o token numa tag HTML:

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

 Em seguida, você pode instruir uma biblioteca como o jQuery para adicionar automaticamente o token a todas as cabeçalhos de solicitação. Isso proporciona proteção CSRF simples e conveniente para seu aplicativo baseado em AJAX usando tecnologia JavaScript antiga:

```js
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

 O Laravel armazena o atual token CSRF em um cookie encriptado chamado "XSRF-TOKEN". Este cookie é incluído com cada resposta gerada pelo framework. Você pode usar o valor do cookie para definir a solicitação de cabeçalho `X-XSRF-TOKEN`.

 Este cookie é enviado principalmente como um recurso para desenvolvedores, já que alguns frameworks e bibliotecas de JavaScript, como Angular e Axios, automaticamente colocam seu valor no cabeçalho `X-XSRF-TOKEN` em solicitações do mesmo domínio.

 > [!NOTA]
 > Por padrão, o arquivo `resources/js/bootstrap.js` inclui a biblioteca de HTTP Axios que envia automaticamente o cabeçalho `X-XSRF-TOKEN`.
