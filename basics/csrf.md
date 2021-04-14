# Proteção CSRF

## Introdução
As falsificações de solicitação entre sites são um tipo de exploração mal-intencionada em que comandos não autorizados são executados em nome 
de um usuário autenticado. Felizmente, o Laravel facilita a proteção do seu aplicativo contra ataques de falsificação de solicitação entre sites (CSRF).

#### Uma explicação da vulnerabilidade
Caso você não esteja familiarizado com falsificações de solicitação entre sites, vamos discutir um exemplo de como essa vulnerabilidade pode 
ser explorada. Imagine que seu aplicativo tem uma rota `/user/email` que aceita uma solicitação `POST` para alterar o endereço de e-mail do 
usuário autenticado. Provavelmente, essa rota espera que um campo `email` de entrada contenha o endereço de e-mail que o usuário gostaria 
de começar a usar.

Sem proteção CSRF, um site malicioso pode criar um formulário HTML que aponta para a rota `/user/email` do seu aplicativo e envia o próprio 
endereço de e-mail do usuário malicioso:

```html
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

Se o site mal-intencionado enviar automaticamente o formulário quando a página for carregada, o usuário mal-intencionado só precisa atrair um 
usuário desavisado do seu aplicativo para visitar o site dele e o endereço de e-mail dele será alterado no aplicativo.

Para evitar esta vulnerabilidade, precisamos inspecionar cada pedido `POST`, `PUT`, `PATCH`, ou `DELETE` de um valor sessão secreta que o 
aplicativo malicioso é incapaz de ter acesso.

### Prevenção de solicitações de CSRF
O Laravel gera automaticamente um "token" CSRF para cada sessão de usuário ativa gerenciada pela aplicação. Esse token é usado para verificar 
se o usuário autenticado é a pessoa que está realmente fazendo as solicitações ao aplicativo. Como esse token é armazenado na sessão do usuário 
e muda toda vez que a sessão é regenerada, um aplicativo malicioso não consegue acessá-lo.

O token CSRF da sessão atual pode ser acessado por meio da sessão da solicitação ou por meio da função auxiliar `csrf_token`:

```php
use Illuminate\Http\Request;

Route::get('/token', function (Request $request) {
    $token = $request->session()->token();

    $token = csrf_token();

    // ...
});
```

Sempre que definir um formulário HTML em seu aplicativo, você deve incluir um campo CSRF `_token` oculto no formulário para que o middleware 
de proteção CSRF possa validar a solicitação. Por conveniência, você pode usar a diretiva `@csrf` no seu template Blade para gerar o campo de 
entrada de token oculto:

```html
<form method="POST" action="/profile">
    @csrf

    <!-- Equivalent to... -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

O middleware `App\Http\Middleware\VerifyCsrfToken` que está incluído no grupo `web` de middleware por padrão, verificará automaticamente se o 
token na entrada da solicitação corresponde ao token armazenado na sessão. Quando esses dois tokens coincidem, sabemos que o usuário autenticado é 
aquele que inicia a solicitação.

### Tokens e SPAs CSRF
Se você está construindo um SPA que utiliza o Laravel como backend de API, você deve consultar a documentação do Laravel Sanctum para informações 
sobre como autenticar com sua API e se proteger contra vulnerabilidades CSRF.

### Excluindo URIs da proteção CSRF
Às vezes, você pode querer excluir um conjunto de URIs da proteção CSRF. Por exemplo, se você estiver usando o Stripe para processar pagamentos 
e seu sistema de webhook, será necessário excluir sua rota de manipulador de webhook Stripe da proteção CSRF, pois o Stripe não saberá qual 
token CSRF enviar para suas rotas.

Normalmente, você deve colocar esses tipos de rotas fora do grupo `web` de middleware que `App\Providers\RouteServiceProvider` se aplica a 
todas as rotas no arquivo `routes/web.php`. No entanto, você também pode excluir as rotas adicionando seus URIs à propriedade `$except` do
middleware `VerifyCsrfToken`:

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'stripe/*',
        'http://example.com/foo/bar',
        'http://example.com/foo/*',
    ];
}
```

> Por conveniência, o middleware CSRF é desabilitado automaticamente para todas as rotas durante a execução de testes.

## X-CSRF-TOKEN
Além de verificar o token CSRF como um parâmetro POST, o middleware `App\Http\Middleware\VerifyCsrfToken` também verificará o cabeçalho `X-CSRF-TOKEN` 
da solicitação. Você pode, por exemplo, armazenar o token em uma metatag HTML :

```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```

Em seguida, você pode instruir uma biblioteca como a jQuery para adicionar automaticamente o token a todos os cabeçalhos de solicitação. Isso 
fornece proteção CSRF simples e conveniente para seus aplicativos baseados em AJAX usando tecnologia JavaScript legada:

```js
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

## X-XSRF-TOKEN
O Laravel armazena o token CSRF atual em um cookie `XSRF-TOKEN` criptografado que é incluído com cada resposta gerada pelo framework. Você pode 
usar o valor do cookie para definir o cabeçalho `X-XSRF-TOKEN` da solicitação.

Esse cookie é enviado principalmente como uma conveniência do desenvolvedor, pois alguns frameworks e bibliotecas JavaScript, como Angular e Axios, 
colocam automaticamente seu valor no cabeçalho `X-XSRF-TOKEN` das solicitações da mesma origem.


> Por padrão, o arquivo `resources/js/bootstrap.js` inclui a biblioteca Axios HTTP que enviará automaticamente o cabeçalho `X-XSRF-TOKEN` para você.
