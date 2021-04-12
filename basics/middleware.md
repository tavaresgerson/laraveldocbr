Introdução
O middleware fornece um mecanismo conveniente para inspecionar e filtrar solicitações HTTP que entram em seu aplicativo. Por exemplo, o Laravel inclui um middleware que verifica se o usuário do seu aplicativo está autenticado. Se o usuário não estiver autenticado, o middleware redirecionará o usuário para a tela de login do seu aplicativo. No entanto, se o usuário for autenticado, o middleware permitirá que a solicitação prossiga no aplicativo.

Middleware adicional pode ser escrito para executar uma variedade de tarefas além da autenticação. Por exemplo, um middleware de registro pode registrar todas as solicitações recebidas em seu aplicativo. Existem vários middlewares incluídos no framework Laravel, incluindo middleware para autenticação e proteção CSRF. Todos esses middleware estão localizados no app/Http/Middlewarediretório.

Definindo Middleware
Para criar um novo middleware, use o make:middlewarecomando Artisan:

php artisan make:middleware EnsureTokenIsValid
Este comando colocará uma nova EnsureTokenIsValidclasse em seu app/Http/Middlewarediretório. Nesse middleware, só permitiremos o acesso à rota se a tokenentrada fornecida corresponder a um valor especificado. Caso contrário, redirecionaremos os usuários de volta ao homeURI:

<?php

namespace App\Http\Middleware;

use Closure;

class EnsureTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ($request->input('token') !== 'my-secret-token') {
            return redirect('home');
        }

        return $next($request);
    }
}
Como você pode ver, se o dado tokennão corresponder ao nosso token secreto, o middleware retornará um redirecionamento HTTP para o cliente; caso contrário, a solicitação será passada adiante no aplicativo. Para passar a solicitação mais profundamente no aplicativo (permitindo que o middleware "passe"), você deve chamar o $nextretorno de chamada com o $request.

É melhor imaginar o middleware como uma série de solicitações HTTP de "camadas" que devem passar antes de chegarem ao seu aplicativo. Cada camada pode examinar a solicitação e até rejeitá-la inteiramente.


Todos os middlewares são resolvidos por meio do contêiner de serviço , portanto, você pode digitar qualquer dependência necessária dentro de um construtor de middleware.


Middleware e Respostas
Obviamente, um middleware pode executar tarefas antes ou depois de passar a solicitação mais profundamente no aplicativo. Por exemplo, o middleware a seguir executaria alguma tarefa antes que a solicitação fosse tratada pelo aplicativo:

<?php

namespace App\Http\Middleware;

use Closure;

class BeforeMiddleware
{
    public function handle($request, Closure $next)
    {
        // Perform action

        return $next($request);
    }
}
No entanto, esse middleware executaria sua tarefa após a solicitação ser tratada pelo aplicativo:

<?php

namespace App\Http\Middleware;

use Closure;

class AfterMiddleware
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        // Perform action

        return $response;
    }
}
Registrando Middleware
Middleware Global
Se você deseja que um middleware seja executado durante cada solicitação HTTP para seu aplicativo, liste a classe de middleware na $middlewarepropriedade de sua app/Http/Kernel.phpclasse.

Atribuindo Middleware a Rotas
Se desejar atribuir middleware a rotas específicas, você deve primeiro atribuir ao middleware uma chave no app/Http/Kernel.phparquivo do seu aplicativo . Por padrão, a $routeMiddlewarepropriedade desta classe contém entradas para o middleware incluído no Laravel. Você pode adicionar seu próprio middleware a esta lista e atribuir a ele uma chave de sua escolha:

// Within App\Http\Kernel class...

protected $routeMiddleware = [
    'auth' => \App\Http\Middleware\Authenticate::class,
    'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
    'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
    'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
    'can' => \Illuminate\Auth\Middleware\Authorize::class,
    'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
    'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
    'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
];
Uma vez que o middleware foi definido no kernel HTTP, você pode usar o middlewaremétodo para atribuir middleware a uma rota:

Route::get('/profile', function () {
    //
})->middleware('auth');
Você pode atribuir vários middlewares à rota, passando uma matriz de nomes de middleware para o middlewaremétodo:

Route::get('/', function () {
    //
})->middleware(['first', 'second']);
Ao atribuir middleware, você também pode passar o nome de classe totalmente qualificado:

use App\Http\Middleware\EnsureTokenIsValid;

Route::get('/profile', function () {
    //
})->middleware(EnsureTokenIsValid::class);
Ao atribuir middleware a um grupo de rotas, ocasionalmente você pode precisar impedir que o middleware seja aplicado a uma rota individual dentro do grupo. Você pode fazer isso usando o withoutMiddlewaremétodo:

use App\Http\Middleware\EnsureTokenIsValid;

Route::middleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/', function () {
        //
    });

    Route::get('/profile', function () {
        //
    })->withoutMiddleware([EnsureTokenIsValid::class]);
});
O withoutMiddlewaremétodo só pode remover o middleware de rota e não se aplica ao middleware global .

Grupos de Middleware
Às vezes, você pode querer agrupar vários middleware em uma única chave para torná-los mais fáceis de atribuir a rotas. Você pode fazer isso usando a $middlewareGroupspropriedade do seu kernel HTTP.

Fora da caixa, Laravel vem com webe apigrupos de middleware que contêm middleware comum que você pode querer aplicar aos seus web e API rotas. Lembre-se de que esses grupos de middleware são aplicados automaticamente pelo App\Providers\RouteServiceProviderprovedor de serviços do seu aplicativo para rotas dentro de seus arquivos correspondentes webe de apirota:

/**
 * The application's route middleware groups.
 *
 * @var array
 */
protected $middlewareGroups = [
    'web' => [
        \App\Http\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        // \Illuminate\Session\Middleware\AuthenticateSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \App\Http\Middleware\VerifyCsrfToken::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],

    'api' => [
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];
Os grupos de middleware podem ser atribuídos a rotas e ações do controlador usando a mesma sintaxe do middleware individual. Novamente, os grupos de middleware tornam mais conveniente atribuir muitos middleware a uma rota de uma vez:

Route::get('/', function () {
    //
})->middleware('web');

Route::middleware(['web'])->group(function () {
    //
});

Pronto para uso, os grupos webe apimiddleware são automaticamente aplicados aos arquivos routes/web.phpe correspondentes do seu aplicativo routes/api.phppelo App\Providers\RouteServiceProvider.


Classificando Middleware
Raramente, você pode precisar que seu middleware seja executado em uma ordem específica, mas não tem controle sobre sua ordem quando são atribuídos à rota. Nesse caso, você pode especificar sua prioridade de middleware usando a $middlewarePrioritypropriedade de seu app/Http/Kernel.phparquivo. Esta propriedade pode não existir em seu kernel HTTP por padrão. Se não existir, você pode copiar sua definição padrão abaixo:

/**
 * The priority-sorted list of middleware.
 *
 * This forces non-global middleware to always be in the given order.
 *
 * @var array
 */
protected $middlewarePriority = [
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Session\Middleware\StartSession::class,
    \Illuminate\View\Middleware\ShareErrorsFromSession::class,
    \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
    \Illuminate\Routing\Middleware\ThrottleRequests::class,
    \Illuminate\Session\Middleware\AuthenticateSession::class,
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
    \Illuminate\Auth\Middleware\Authorize::class,
];
Parâmetros de Middleware
O middleware também pode receber parâmetros adicionais. Por exemplo, se seu aplicativo precisa verificar se o usuário autenticado tem uma determinada "função" antes de executar uma determinada ação, você pode criar um EnsureUserHasRolemiddleware que receba um nome de função como um argumento adicional.

Parâmetros adicionais de middleware serão passados ​​para o middleware após o $nextargumento:

<?php

namespace App\Http\Middleware;

use Closure;

class EnsureUserHasRole
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role
     * @return mixed
     */
    public function handle($request, Closure $next, $role)
    {
        if (! $request->user()->hasRole($role)) {
            // Redirect...
        }

        return $next($request);
    }

}
Os parâmetros de middleware podem ser especificados ao definir a rota, separando o nome e os parâmetros do middleware com um :. Vários parâmetros devem ser delimitados por vírgulas:

Route::put('/post/{id}', function ($id) {
    //
})->middleware('role:editor');
Middleware terminável
Às vezes, um middleware pode precisar fazer algum trabalho após a resposta HTTP ter sido enviada ao navegador. Se você definir um terminatemétodo em seu middleware e seu servidor da web estiver usando FastCGI, o terminatemétodo será chamado automaticamente depois que a resposta for enviada ao navegador:

<?php

namespace Illuminate\Session\Middleware;

use Closure;

class TerminatingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        return $next($request);
    }

    /**
     * Handle tasks after the response has been sent to the browser.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Http\Response  $response
     * @return void
     */
    public function terminate($request, $response)
    {
        // ...
    }
}
O terminatemétodo deve receber a solicitação e a resposta. Depois de definir um middleware terminável, você deve adicioná-lo à lista de rotas ou middleware global no app/Http/Kernel.phparquivo.

Ao chamar o terminatemétodo em seu middleware, o Laravel resolverá uma nova instância do middleware do container de serviço . Se desejar usar a mesma instância de middleware quando os métodos handlee terminateforem chamados, registre o middleware com o contêiner usando o singletonmétodo do contêiner . Normalmente, isso deve ser feito no registermétodo de AppServiceProvider:

use App\Http\Middleware\TerminatingMiddleware;

/**
 * Register any application services.
 *
 * @return void
 */
public function register()
{
    $this->app->singleton(TerminatingMiddleware::class);
}
