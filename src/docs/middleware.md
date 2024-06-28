# Middleware

<a name="introduction"></a>
## Introdução

 Os middlewares disponibilizam um mecanismo prático para inspeção e filtragem de requisições HTTP que entram na sua aplicação. Por exemplo, o Laravel inclui um middleware que verifica se o utilizador da aplicação está autenticado. Se o utilizador não estiver autenticado, o middleware reencaminhará para a página de início de sessão do seu aplicativo. No entanto, se o utilizador estiver autenticado, o middleware permitirá que a requisição vá mais longe na aplicação.

 É possível escrever middleware adicional para executar uma variedade de tarefas, além da autenticação. Por exemplo, um middleware de registro poderia registrar todas as solicitações recebidas pela sua aplicação. Ao todo, o Laravel inclui vários middlewares, incluindo aqueles responsáveis por autenticação e proteção contra ataques CSRF; no entanto, todos os middlewares definidos pelo usuário estão normalmente localizados na pasta `app/Http/Middleware` do aplicativo.

<a name="defining-middleware"></a>
## Definindo um middleware

 Para criar um novo middleware, utilize o comando "Artisan make:middleware":

```shell
php artisan make:middleware EnsureTokenIsValid
```

 Este comando irá colocar uma nova classe `EnsureTokenIsValid` no diretório `app/Http/Middleware`. Neste middleware, permitimos o acesso à rota somente se o input do token fornecido corresponder a um valor especificado. Caso contrário, redirecionamos os usuários para a URI `home`:

```php
    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    class EnsureTokenIsValid
    {
        /**
         * Handle an incoming request.
         *
         * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
         */
        public function handle(Request $request, Closure $next): Response
        {
            if ($request->input('token') !== 'my-secret-token') {
                return redirect('home');
            }

            return $next($request);
        }
    }
```

 Como você pode verificar, se o `token` especificado não corresponder ao nosso token secreto, a middleware irá redirecionar o cliente para uma página HTTP. Caso contrário, o pedido será passado adiante para a aplicação. Para passar o pedido mais profundo na aplicação (permitindo que a middleware o "passe"), você deve chamar a função de callback `$next` com o `$request`.

 É melhor imaginar o middleware como uma série de "camadas" que os pedidos HTTP devem passar antes de chegarem à aplicação. Cada camada pode analisar o pedido e até mesmo rejeitá-lo completamente.

 > [!ATENÇÃO]
 Existe um Contentor de Serviço para isso (/docs/container), e você pode indicar quais depenências são necessárias no construtor do Middleware.

<a name="before-after-middleware"></a>
<a name="middleware-and-responses"></a>
#### Middleware e Respostas

 Claro que um middleware pode executar tarefas antes ou depois de encaminhar o pedido para uma área da aplicação. Por exemplo, o seguinte middleware faria a execução de alguma tarefa **antes** do pedido ser tratado pela aplicação:

```php
    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    class BeforeMiddleware
    {
        public function handle(Request $request, Closure $next): Response
        {
            // Perform action

            return $next($request);
        }
    }
```

 No entanto, este middleware iria executar a sua tarefa **depois** do pedido ser gerido pela aplicação:

```php
    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    class AfterMiddleware
    {
        public function handle(Request $request, Closure $next): Response
        {
            $response = $next($request);

            // Perform action

            return $response;
        }
    }
```

<a name="registering-middleware"></a>
## Registo do middleware

<a name="global-middleware"></a>
### Middleware global

 Se você quiser que um middleware seja executado durante cada solicitação HTTP à sua aplicação, pode anexá-lo ao stack de middlewares globais em seu arquivo `bootstrap/app.php`:

```php
    use App\Http\Middleware\EnsureTokenIsValid;

    ->withMiddleware(function (Middleware $middleware) {
         $middleware->append(EnsureTokenIsValid::class);
    })
```

 O objeto `$middleware`, fornecido ao fechamento de função `withMiddleware`, é uma instância de `Illuminate\Foundation\Configuration\Middleware` e é responsável por gerenciar os middlewares atribuídos aos caminhos da sua aplicação. O método `append` adiciona o middleware ao final da lista de middlewares globais. Se você deseja adicionar um middleware para o início da lista, use o método `prepend`.

<a name="manually-managing-laravels-default-global-middleware"></a>
#### Gerenciando manualmente o middleware global padrão do Laravel

 Se você gostaria de controlar manualmente o pilha de middleware global do Laravel, pode fornecer à méthode `use` a pilha padrão de middlewares globais. Em seguida, poderá ajustar a pilha de middlewares padrão conforme necessário:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->use([
            // \Illuminate\Http\Middleware\TrustHosts::class,
            \Illuminate\Http\Middleware\TrustProxies::class,
            \Illuminate\Http\Middleware\HandleCors::class,
            \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
            \Illuminate\Http\Middleware\ValidatePostSize::class,
            \Illuminate\Foundation\Http\Middleware\TrimStrings::class,
            \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
        ]);
    })
```

<a name="assigning-middleware-to-routes"></a>
### Atribuição do middleware a rotas

 Se você gostaria de atribuir um middleware para rotas específicas, poderá invocar o método `middleware` ao definir a rota:

```php
    use App\Http\Middleware\EnsureTokenIsValid;

    Route::get('/profile', function () {
        // ...
    })->middleware(EnsureTokenIsValid::class);
```

 Você pode atribuir vários middlewares para a rota passando uma matriz de nomes de middlewares ao método `middleware`:

```php
    Route::get('/', function () {
        // ...
    })->middleware([First::class, Second::class]);
```

<a name="excluding-middleware"></a>
#### Excluindo Middleware

 Ao atribuir um middleware a um grupo de rotas, pode ser necessário impedir que ele seja aplicado em uma rota específica do grupo. Isso pode ser feito utilizando o método `withoutMiddleware`:

```php
    use App\Http\Middleware\EnsureTokenIsValid;

    Route::middleware([EnsureTokenIsValid::class])->group(function () {
        Route::get('/', function () {
            // ...
        });

        Route::get('/profile', function () {
            // ...
        })->withoutMiddleware([EnsureTokenIsValid::class]);
    });
```

 Também é possível excluir um conjunto de middlewares específico de uma totalidade de definições de rota em [grupos de rotas](/docs/routing#route-groups):

```php
    use App\Http\Middleware\EnsureTokenIsValid;

    Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
        Route::get('/profile', function () {
            // ...
        });
    });
```

 O método `withoutMiddleware` só permite remover middlewares de rotas e não se aplica a middlewares globais (veja o tópico sobre middlewares globais abaixo).

<a name="middleware-groups"></a>
### Grupos do middleware

 Às vezes, você pode querer agrupar vários middlewares sob uma única chave para facilitar a atribuição de rotas. Você pode fazer isso usando o método `appendToGroup` em seu arquivo `bootstrap/app.php`:

```php
    use App\Http\Middleware\First;
    use App\Http\Middleware\Second;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->appendToGroup('group-name', [
            First::class,
            Second::class,
        ]);

        $middleware->prependToGroup('group-name', [
            First::class,
            Second::class,
        ]);
    })
```

 Os grupos de middlewares podem ser atribuídos a rotas e ações do controlador usando a mesma sintaxe que os middlewares individuais.

```php
    Route::get('/', function () {
        // ...
    })->middleware('group-name');

    Route::middleware(['group-name'])->group(function () {
        // ...
    });
```

<a name="laravels-default-middleware-groups"></a>
#### Grupos de middlewares padrão no Laravel

 O Laravel inclui grupos de middlewares predefinidos, o `web` e o `api`, que contêm middlewares comuns que você pode querer aplicar aos seus roteadores da web e API. Lembre-se que o Laravel aplica automaticamente esses grupos de middlewares nos arquivos `routes/web.php` e `routes/api.php`:

|  O Grupo de middleware "web" |
|--------------|
|  `Illuminate\Cookie\Middleware\EncryptCookies` |
|  `Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse` |
|  `Illuminate\Session\Middleware\StartSession` |
|  `Illuminate\\View\\Middleware\\ShareErrorsFromSession` |
|  `Illuminate\Foundation\Http\Middleware\ValidateCsrfToken` |
|  `Illuminate\\Routing\\Middleware\\SubstituteBindings` |

|  O grupo de middlewares "api" |
|--------------|
|  `Illuminate\Routing\Middleware\SubstituirVínculos` |

 Se você quiser anexar ou antepor middlewares a esses grupos, pode usar os métodos `web` e `api` no arquivo `bootstrap/app.php` da sua aplicação. Os métodos `web` e `api` são alternativas práticas ao método `appendToGroup`:

```php
    use App\Http\Middleware\EnsureTokenIsValid;
    use App\Http\Middleware\EnsureUserIsSubscribed;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            EnsureUserIsSubscribed::class,
        ]);

        $middleware->api(prepend: [
            EnsureTokenIsValid::class,
        ]);
    })
```

 Você pode até substituir uma das entradas padrão de grupo de middlewares do Laravel por um próprio middleware personalizado.

```php
    use App\Http\Middleware\StartCustomSession;
    use Illuminate\Session\Middleware\StartSession;

    $middleware->web(replace: [
        StartSession::class => StartCustomSession::class,
    ]);
```

 Ou você pode remover uma middleware completamente:

```php
    $middleware->web(remove: [
        StartSession::class,
    ]);
```

<a name="manually-managing-laravels-default-middleware-groups"></a>
#### Gerenciando manualmente os grupos de middlewares padrão do Laravel

 Se você preferir gerenciar manualmente todo o middleware dentro dos grupos de middlewares padrão `web` e `api` no Laravel, poderá redefinir os grupos inteiramente. O exemplo abaixo definirá os grupos de middleware `web` e `api` com seus middlewares padrão, permitindo customizá-los conforme necessário:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->group('web', [
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            // \Illuminate\Session\Middleware\AuthenticateSession::class,
        ]);

        $middleware->group('api', [
            // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            // 'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
```

 > [!ATENÇÃO]
 > Por padrão, os grupos de filtros de middlewares `web` e `api` são aplicados automaticamente aos respectivos arquivos de rotas do seu aplicativo no `routes/web.php` e `routes/api.php`, através do arquivo `bootstrap/app.php`.

<a name="middleware-aliases"></a>
### Alias de middleware

 É possível atribuir alias aos middlewares no ficheiro `bootstrap/app.php`, na aplicação. Os alias de middleware permitem definir um alias curto para uma determinada classe middleware, o que pode ser especialmente útil para middlewares com nomes longos:

```php
    use App\Http\Middleware\EnsureUserIsSubscribed;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'subscribed' => EnsureUserIsSubscribed::class
        ]);
    })
```

 Depois que o alias do middleware for definido em seu arquivo de aplicação no diretório `bootstrap/app.php`, você poderá usar o alias ao atribuir o middleware a rotas:

```php
    Route::get('/profile', function () {
        // ...
    })->middleware('subscribed');
```

 Por conveniência, alguns dos módulos internos do Laravel são mapeados por padrão. Por exemplo, o módulo `auth` é um alias para o módulo `Illuminate\Auth\Middleware\Authenticate`. Abaixo está uma lista de alias padrão:

|  Aliases |  Middleware |
|-------|-------------|
|  `auth` |  `Illuminate\Auth\Middleware\Authenticate` |
|  `auth.basic` |  `Illuminate\Auth\Middleware\AuthenticateWithBasicAuth` |
|  `auth.session` |  `Illuminate\\Session\\Middleware\\AuthenticateSession` |
|  `cache.headers` |  `Illuminate\Http\Middleware\SetCacheHeaders` |
|  " pode" |  `Illuminate\Auth\Middleware\Authorize` |
|  `hóspede` |  ``Illuminate\\Auth\\Middleware\\RedirectIfAuthenticated`` |
|  `senha.confirmar` |  Illuminate\Auth\Middleware\RequirePassword |
|  "precognitivo" |  `Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests` |
|  `assinado` |  `Illuminate\Routing\Middleware\ValidateSignature` |
|  ``assinado'' |  `\Spark\Http\Middleware\VerifyBillableIsSubscribed` |
|  "freio" |  `Illuminate\Routing\Middleware\ThrottleRequests` ou `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` |
|  ``Verificado'' |  `Illuminate\Auth\Middleware\EnsureEmailIsVerified` |

<a name="sorting-middleware"></a>
### Middleware de classificação

 Em situações raras, pode ser necessário que o seu middleware seja executado num determinado ordem mas não tenha controlo sobre a ordem em que são atribuídos à rota. Nestes casos, poderá especificar a prioridade do seu middleware utilizando a metodologia `priority` no ficheiro `bootstrap/app.php` da aplicação:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->priority([
            \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class,
            \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
            \Illuminate\Auth\Middleware\Authorize::class,
        ]);
    })
```

<a name="middleware-parameters"></a>
## Parâmetros do middleware

 Middleware também pode receber parâmetros adicionais. Por exemplo, se o seu aplicativo precisar verificar se o usuário autenticado possui um determinado "papel" antes de executar uma determinada ação, você poderia criar um `EnsureUserHasRole` middleware que recebe um nome de papel como argumento adicional.

 Parâmetros adicionais de middleware serão passados para o middleware após o parâmetro `$next`:

```php
    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    class EnsureUserHasRole
    {
        /**
         * Handle an incoming request.
         *
         * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
         */
        public function handle(Request $request, Closure $next, string $role): Response
        {
            if (! $request->user()->hasRole($role)) {
                // Redirect...
            }

            return $next($request);
        }

    }
```

 Os parâmetros do middleware podem ser especificados ao definir o caminho separando o nome e os parâmetros com `:`::

```python
from django.urls import path
from .views import MyView

urlpatterns = [
    path('myview/', MyView.as_view()),
]

```php
    Route::put('/post/{id}', function (string $id) {
        // ...
    })->middleware('role:editor');
```

 Vários parâmetros podem ser delimitados por vírgulas:

```php
    Route::put('/post/{id}', function (string $id) {
        // ...
    })->middleware('role:editor,publisher');
```

<a name="terminable-middleware"></a>
## Middleware com finalidade de desativação

 Às vezes um middleware pode precisar fazer algum trabalho depois que a resposta HTTP foi enviada ao navegador. Se você definir uma método `terminate` no seu middleware e o servidor web estiver usando FastCGI, a metodologia `terminate` será chamada automaticamente após a resposta ser enviada para o navegador:

```php
    <?php

    namespace Illuminate\Session\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    class TerminatingMiddleware
    {
        /**
         * Handle an incoming request.
         *
         * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
         */
        public function handle(Request $request, Closure $next): Response
        {
            return $next($request);
        }

        /**
         * Handle tasks after the response has been sent to the browser.
         */
        public function terminate(Request $request, Response $response): void
        {
            // ...
        }
    }
```

 O método `terminar` deve receber tanto o pedido quanto a resposta. Depois de definir um recurso terminação, você pode adicioná-lo à lista de rotas ou de middleware global no arquivo `bootstrap/app.php` da sua aplicação.

 Quando você chama o método `terminate` em seu middleware, o Laravel resolverá uma nova instância do middleware a partir do [conjunto de serviços](/docs/container). Se você deseja usar a mesma instância do middleware quando os métodos `handle` e `terminate` são chamados, registre o middleware no conjunto de serviços usando o método de singleton. Normalmente isso deve ser feito no método `register` do seu `AppServiceProvider`:

```php
    use App\Http\Middleware\TerminatingMiddleware;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(TerminatingMiddleware::class);
    }
```
