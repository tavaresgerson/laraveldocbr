# Laravel Sanctum

<a name="introduction"></a>
## Introdução

[Laravel Sanctum](https://github.com/laravel/sanctum) fornece um sistema de autenticação leve para SPAs (aplicativos de página única), aplicativos móveis e APIs simples baseadas em tokens. O Sanctum permite que cada usuário de seu aplicativo gere vários tokens de API para sua conta. Esses tokens podem ser concedidos habilidades / escopos que especificam quais ações os tokens são permitidos para executar.

<a name="how-it-works"></a>
### Como Funciona

Laravel Sanctum existe para resolver dois problemas separados. Vamos discutir cada um antes de mergulhar mais fundo no código da biblioteca.

<a name="how-it-works-api-tokens"></a>
#### Tokens API

Primeiro, o Sanctum é um pacote simples que você pode usar para emitir tokens de API para seus usuários sem a complexidade do OAuth. Essa funcionalidade foi inspirada pelo GitHub e outros aplicativos que emitem "tokens de acesso pessoal". Por exemplo, imagine que as configurações da conta de seu aplicativo tenha uma tela onde um usuário pode gerar um token de API para sua conta. Você pode usar o Sanctum para gerar e gerenciar esses tokens. Esses tokens normalmente têm um tempo muito longo de validade (anos), mas podem ser revogados manualmente pelo usuário a qualquer momento.

O Laravel Sanctum oferece esta funcionalidade armazenando os tokens de usuário da API em uma única tabela do banco de dados e autenticando as requisições HTTP recebidas via o cabeçalho 'Authorization', que deve conter um token de API válido.

<a name="how-it-works-spa-authentication"></a>
#### Autenticação do SPA

Segundo, o Sanctum existe para oferecer uma maneira simples de autenticar aplicativos de página única (SPAs) que precisam se comunicar com uma API alimentada pelo Laravel. Esses SPAs podem existir no mesmo repositório que seu aplicativo Laravel ou podem ser um repositório completamente separado, como um SPA criado usando Vue CLI ou uma aplicação Next.js.

Para essa funcionalidade, o Sanctum não utiliza tokens de qualquer tipo. Em vez disso, o Sanctum utiliza os serviços de autenticação baseados em cookies da autenticação baseada em cookies do Laravel. Normalmente, o Sanctum utiliza o guard de autenticação 'web' do Laravel para conseguir isso. Isso dá os benefícios de proteção contra CSRF, autenticação de sessão, além de proteger contra vazamentos de credenciais de autenticação por XSS.

O Sanctum só tentará autenticar usando cookies quando a solicitação de entrada tiver origem em seu próprio frontend SPA. Quando o Sanctum examina uma solicitação HTTP de entrada, ele primeiro verifica se há um cookie de autenticação e, se não houver nenhum, o Sanctum então examinará a cabeçalho de autorização para um token API válido.

> ！！！
> É perfeitamente aceitável usar apenas a autenticação de token da API ou apenas a autenticação de SPA com o Sanctum. Basta você usar o Sanctum que não significa que você é obrigado a usar as duas funcionalidades que ele oferece.

<a name="installation"></a>
## Instalação

Você pode instalar o Laravel Sanctum usando o comando Artisan 'install:api':

```shell
php artisan install:api
```

Em seguida, se você planeja utilizar o Sanctum para autenticar um SPA, por favor veja a seção [Autenticação do SPA](#spa-authentication).

<a name="configuration"></a>
## Configuração

<a name="overriding-default-models"></a>
### Substituindo modelos padrão

Embora não seja tipicamente exigido, você é livre para estender o modelo `PersonalAccessToken` utilizado internamente pelo Sanctum:

```php
    use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

    class PersonalAccessToken extends SanctumPersonalAccessToken
    {
        // ...
    }
```

Então você instrui o Sanctum a usar seu modelo personalizado através do método `usePersonalAccessTokenModel` fornecido pelo Sanctum. Normalmente, você deve chamar este método no método `boot` do arquivo de provedor de serviços da sua aplicação 'AppServiceProvider':

```php
    use App\Models\Sanctum\PersonalAccessToken;
    use Laravel\Sanctum\Sanctum;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }
```

<a name="api-token-authentication"></a>
## Autenticação de Token da API

> [!Nota]
> Você não deve usar tokens de API para autenticar seu próprio SPA de primeira parte. Em vez disso, utilize os recursos de [autenticação de SPA](#spa-authentication) do Sanctum.

<a name="issuing-api-tokens"></a>
### Emissão de Token API

O Sanctum permite que você emita tokens de API / tokens de acesso pessoal que podem ser usados para autenticar solicitações de API ao seu aplicativo. Ao fazer solicitações usando tokens de API, o token deve ser incluído no cabeçalho "Autorização" como um token "Bearer".

Para começar a emitir tokens para usuários, seu modelo de usuário deve usar o `Laravel\Sanctum\HasApiTokens`:

```php
    use Laravel\Sanctum\HasApiTokens;

    class User extends Authenticatable
    {
        use HasApiTokens, HasFactory, Notifiable;
    }
```

Para criar um token você pode usar o método `createToken`. O método `createToken` retorna uma instância de `Laravel\Sanctum\NewAccessToken`. Os tokens da API são armazenados na sua base de dados, mas podem acessar o valor do token em texto simples usando a propriedade `plainTextToken` da instância `NewAccessToken`. Você deve exibir este valor ao usuário imediatamente após o token ter sido criado:

```php
    use Illuminate\Http\Request;

    Route::post('/tokens/create', function (Request $request) {
        $token = $request->user()->createToken($request->token_name);

        return ['token' => $token->plainTextToken];
    });
```

Você pode acessar todos os tokens do usuário usando a `tokens` relação Eloquent fornecida pelo `HasApiTokens` trait:

```php
    foreach ($user->tokens as $token) {
        // ...
    }
```

<a name="token-abilities"></a>
### Capacidades Token

O Sanctum permite atribuir "habilidades" aos tokens. As habilidades servem ao mesmo propósito de "escopos" do OAuth. Você pode passar uma matriz de strings de habilidades como o segundo argumento para o método createToken:

```php
    return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

Ao lidar com uma solicitação recebida autenticada por Sanctum, você pode determinar se o token tem uma determinada capacidade usando o método `tokenCan`:

```php
    if ($user->tokenCan('server:update')) {
        // ...
    }
```

<a name="token-ability-middleware"></a>
#### Middleware de Token de Capacidade

Sanctum também inclui dois middleware que podem ser usados para verificar se uma solicitação de entrada está autenticada com um token concedido a uma determinada capacidade. Para começar, defina os seguintes aliases de middleware no arquivo 'bootstrap/app.php' do seu aplicativo:

```php
    use Laravel\Sanctum\Http\Middleware\CheckAbilities;
    use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'abilities' => CheckAbilities::class,
            'ability' => CheckForAnyAbility::class,
        ]);
    })
```

O middleware `abilities` pode ser atribuído a uma rota para verificar se o token da requisição entrante possui todas as habilidades listadas:

```php
    Route::get('/orders', function () {
        // Token has both "check-status" and "place-orders" abilities...
    })->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

O middleware 'abilidade' pode ser atribuído a uma rota para verificar que o token da solicitação entrante tem *pelo menos um* das habilidades listadas:

```php
    Route::get('/orders', function () {
        // Token has the "check-status" or "place-orders" ability...
    })->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a name="first-party-ui-initiated-requests"></a>
#### Pedidos Iniciados pela UI de Primeira Parte

Para facilitar, o método `tokenCan` sempre retornará `true` se a solicitação autenticada que chegou foi de seu SPA de primeira parte e você estiver usando o [autenticação SPA](#spa-authentication) do Sanctum.

No entanto, isso não significa necessariamente que seu aplicativo precisa permitir que o usuário execute a ação. Tipicamente, suas [políticas de autorização](/docs/authorization#criando-políticas) determinará se o token foi concedido permissão para executar as habilidades, bem como verificar que a instância do usuário em si deve ser permitida para executar a ação.

Por exemplo, se imaginarmos um aplicativo que administra servidores, isso pode significar verificar que o token está autorizado a atualizar servidores **e** que o servidor pertence ao usuário:

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

No começo, permitir que o método 'tokenCan' seja chamado e sempre retorne 'true' para as requisições da interface do usuário iniciadas de primeira parte pode parecer estranho; no entanto, é conveniente poder sempre supor que um token da API está disponível e pode ser inspecionado por meio do método 'tokenCan'. Ao seguir este procedimento, você poderá sempre chamar o método 'tokenCan' dentro das políticas de autorização de seu aplicativo sem se preocupar com o fato de a solicitação ter sido acionada por meio da interface do usuário do seu aplicativo ou iniciada por um dos consumidores de terceiros da sua API.

<a name="protecting-routes"></a>
### Proteção de rotas

Para proteger rotas de modo que todas as solicitações recebidas devem ser autenticadas, você deve anexar o `sanctum` guard de autenticação às suas rotas protegidas dentro do seu arquivo de rotas `routes/web.php` e `routes/api.php`. Esta guarda irá garantir que as solicitações recebidas são autenticadas como solicitações estatais ou com cookies autenticados, ou que contêm um cabeçalho token API válido se a solicitação vem de terceiros.

Você pode estar se perguntando por que sugerimos que você autentique as rotas dentro de seu arquivo 'routes/web.php' da aplicação usando o guard 'sanctum'. Lembre-se, Sanctum tentará primeiro autenticar as requisições recebidas usando o cookie típico de sessão do Laravel. Se esse cookie não estiver presente então Sanctum tentará autenticar a requisição usando um token na cabeçalho de requisição 'Authorization'. Além disso, autenticando todas as requisições usando Sanctum garante que possamos sempre chamar o método `tokenCan` na instância do usuário atualmente autenticado:

```php
    use Illuminate\Http\Request;

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
```

<a name="revoking-tokens"></a>
### Revogando Tokens

Você pode "revogar" tokens excluindo-os do seu banco de dados usando a relação `tokens` que é fornecida pela trait `Laravel\Sanctum\HasApiTokens`:

```php
    // Revoke all tokens...
    $user->tokens()->delete();

    // Revoke the token that was used to authenticate the current request...
    $request->user()->currentAccessToken()->delete();

    // Revoke a specific token...
    $user->tokens()->where('id', $tokenId)->delete();
```

<a name="token-expiration"></a>
### Token expirou

Por padrão, os tokens de Sanctum nunca expiram e podem apenas ser invalidados por [revogando o token](#revogar-tokens). No entanto, se você gostaria de configurar um tempo de expiração para os tokens da API do seu aplicativo, você pode fazê-lo via a opção de configuração `expirar` definida no arquivo de configuração do seu aplicativo `sanctum`. Esta opção de configuração define o número de minutos até que um token emitido será considerado expirado:

```php
'expiration' => 525600,
```

Se você gostaria de especificar o tempo de expiração de cada token de forma independente, você pode fazê-lo fornecendo a hora de expiração como o terceiro argumento para o método `createToken`:

```php
return $user->createToken(
    'token-name', ['*'], now()->addWeek()
)->plainTextToken;
```

Se você configurou um tempo de expiração para tokens da sua aplicação, você também pode querer agendar uma tarefa para [apagar tokens expirados](/docs/scheduling) da sua aplicação. Felizmente, o Sanctum inclui um comando Artisan chamado `sanctum:prune-expired` que você pode usar para conseguir isso. Por exemplo, você pode configurar uma tarefa agendada para apagar todos os tokens expirados do banco de dados que foram expirados há pelo menos 24 horas:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily();
```

<a name="spa-authentication"></a>
## Autenticação da SPA

Sanctum também existe para fornecer um método simples de autenticação para aplicativos em uma página (SPAs) que precisam se comunicar com uma API alimentada pelo Laravel. Esses SPAs podem existir no mesmo repositório do seu aplicativo Laravel ou podem ser um repositório separado completamente.

Para essa característica, o Sanctum não usa tokens de qualquer tipo. Em vez disso, utiliza os serviços internos baseados em cookies do Laravel para autenticação. Essa abordagem fornece as vantagens de proteção contra CSRF, autenticação de sessão e também protege contra vazamentos das credenciais de acesso via XSS.

> [ALERTA]
> Para autenticação, o SPA e a API devem compartilhar o mesmo domínio de nível superior. No entanto, eles podem estar colocados em subdomínios diferentes. Além disso, você deve garantir que você envia a cabeçalho "Accept: application/json" e cabeçalho "Referer" ou "Origin" com sua solicitação.

<a name="spa-configuration"></a>
### Configuração

<a name="configuring-your-first-party-domains"></a>
#### Configurar seus domínios de primeira ordem

Primeiro, você deve configurar quais domínios seu SPA fará solicitações de. Você pode configurar esses domínios usando a configuração "stateful" em seu arquivo de configuração do Sanctum. Esta configuração determina quais domínios manterão a autenticação "stateful" usando os cookies da sessão do Laravel ao fazer solicitações para sua API.

> [ADVERTÊNCIA]
> Se você está acessando sua aplicação através de um URL que inclui um porto ( `127.0.0.1:8000` ), você deve garantir que inclua o número do porto com a base de domínio.

<a name="sanctum-middleware"></a>
#### Sanctum Middleware

Em seguida você instrui o Laravel a que as requisições recebidas pelo seu SPA possam autenticar usando cookies de sessão do Laravel, enquanto ainda permite requisições de terceiros ou aplicativos móveis para se autenticarem com tokens da API. Isso pode ser facilmente realizado invocando o método `statefulApi` no middleware em seu arquivo 'bootstrap/app.php':

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
    })
```

<a name="cors-and-cookies"></a>
#### CORS e Cookies

Se você está tendo problemas com autenticação do seu aplicativo de um SPA que executa em um subdominio separado, provavelmente configurou mal as configurações do CORS (Cross-Origin Resource Sharing) ou da configuração do cookie de sessão.

O arquivo de configuração 'config/cors.php' não é publicado por padrão. Se você precisa personalizar as opções CORS do Laravel, você deve publicar o arquivo de configuração completo 'cors' usando o comando 'config:publish' Artisan:

```bash
php artisan config:publish cors
```

Em seguida, certifique-se de que sua configuração CORS da aplicação está retornando o cabeçalho 'Access-Control-Allow-Credentials' com um valor de 'True'. Isso pode ser alcançado ao definir a opção 'supports_credentials' dentro do arquivo de configuração 'config/cors.php' da sua aplicação para 'true'.

Além disso, você deve habilitar as opções 'withCredentials' e 'withXSRFToken' na instância global Axios do seu aplicativo. Normalmente, isso deve ser feito em seu arquivo 'resources/js/bootstrap.js'. Se você não estiver usando Axios para fazer solicitações HTTP de sua interface de usuário, faça a configuração equivalente no seu cliente HTTP:

```js
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

Finalmente, você deve garantir que o seu domínio de cookie da sessão suporta qualquer subdomínio do seu domínio raiz. Você pode fazer isso por pré-fixar o domínio com um `.` de liderança no arquivo de configuração `config/session.php`:

```php
    'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>
### Autenticando

<a name="csrf-protection"></a>
#### Proteção de CSRF

Para autenticar seu SPA, sua página de login deve primeiro fazer um pedido para o ponto final `/sanctum/csrf-cookie` para inicializar proteção CSRF para a aplicação:

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // Login...
});
```

Durante este pedido, Laravel irá definir um cookie "XSRF-TOKEN" contendo o token CSRF atual. Este token deve então ser passado em um cabeçalho "X-XSRF-TOKEN" para solicitações posteriores, que algumas bibliotecas de clientes HTTP como Axios e Angular HttpClient irão fazer automaticamente por você. Se a sua biblioteca JavaScript HTTP não definir o valor para você, você precisará definir manualmente o cabeçalho "X-XSRF-TOKEN" para corresponder ao valor do cookie "XSRF-TOKEN" definido por esta rota.

<a name="logging-in"></a>
#### Entrando no Login

Uma vez que a proteção CSRF tenha sido inicializada, você deve fazer uma solicitação POST à rota /login do seu aplicativo Laravel. A rota /login pode ser [implementada manualmente](/docs/authentication#authenticating-users) ou usando um pacote de autenticação headless como [Laravel Fortify](/docs/fortify).

Se o pedido de login for bem sucedido, você será autenticado e pedidos posteriores ao seu aplicativo' rotas serão automaticamente autenticadas por meio do cookie de sessão que o aplicativo Laravel emitiu para o seu cliente. Além disso, desde o seu aplicativo já fez um pedido à rota `/sanctum/csrf-cookie`, solicitações subsequentes devem receber proteção CSRF automaticamente, desde que seu cliente HTTP JavaScript envie o valor do cookie `XSRF-TOKEN` na cabeça `X-XSRF-TOKEN`.

É claro, se sua sessão do usuário expirar por falta de atividade, as solicitações subsequentes ao aplicativo Laravel podem receber uma resposta de erro HTTP 401 ou 419. Neste caso, você deve redirecionar o usuário para a página de login do seu SPA.

> ¡¡ALERTA!
> Você é livre para escrever sua própria rota de `/login`, mas deve garantir que ele autentique o usuário usando os [serviços padrão de autenticação baseados em sessão que o Laravel fornece](/docs/authentication#authenticating-users). Geralmente, isto significa usar o `web` guard de autenticação.

<a name="protecting-spa-routes"></a>
### Proteger Rotas

Para proteger as rotas de modo que todas as requisições recebidas devam ser autenticadas, você deve anexar o guard `sanctum` de autenticação às suas rotas da API dentro do seu arquivo `routes/api.php`. Este guard assegurará que as requisições recebidas são autenticadas como requisições autenticadas estáveis provenientes do seu SPA ou contêm um cabeçalho de token de API válido se a solicitação é proveniente de terceiros:

```php
    use Illuminate\Http\Request;

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
```

<a name="authorizing-private-broadcast-channels"></a>
### Autorizar canais de transmissão privada

Se o seu SPA precisa se autenticar com [canais de transmissão privados / de presença](/docs/transmissão#autorizando-canais), você deve remover a entrada de canais do método `withRouting` contido no arquivo bootstrap/app.php do seu aplicativo. Em vez disso, você deve chamar o método `withBroadcasting`, para que você possa especificar os corretores apropriados para as rotas de transmissão do seu aplicativo:

```php
    return Application::configure(basePath: dirname(__DIR__))
        ->withRouting(
            web: __DIR__.'/../routes/web.php',
            // ...
        )
        ->withBroadcasting(
            __DIR__.'/../routes/channels.php',
            ['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']],
        )
```

Em seguida, para as solicitações de autorização do Pusher serem bem sucedidas, você precisará fornecer um 'autorizador' personalizado ao inicializar [Laravel Echo]/docs/broadcasting#client-side-installation). Isso permite que o seu aplicativo configure o Pusher a usar a instância do Axios que é [devidamente configurada para solicitações entre domínios](#cors-and-cookies):

```js
window.Echo = new Echo({
    broadcaster: "pusher",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    encrypted: true,
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axios.post('/api/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
})
```

<a name="mobile-application-authentication"></a>
## Autenticação em Aplicativos Móveis

Você também pode usar tokens de sanctum para autenticar suas solicitações de aplicativo móvel na sua API. O processo para autenticar solicitações de aplicativos móveis é semelhante ao processo de autenticação de solicitações de API de terceiros; no entanto, existem pequenas diferenças em como você emitirá os tokens da API.

<a name="issuing-mobile-api-tokens"></a>
### Emitindo tokens de API

Para começar, crie uma rota que aceite e-mail do usuário / nome de usuário, senha, e nome do dispositivo, então troque essas credenciais por um novo token Sanctum. O "nome do dispositivo" dado para este endpoint é para fins informativos e pode ser qualquer valor que você deseja. Em geral, o valor do nome do dispositivo deve ser um nome que o usuário reconheça, como "iPhone 12 de Nuno".

Tipicamente, você fará um pedido para o ponto de extremidade do token a partir da tela "Login" de seu aplicativo móvel. O endpoint retornará o token da API em texto simples, que pode então ser armazenado no dispositivo móvel e usado para fazer solicitações adicionais à API.

```php
    use App\Models\User;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Validation\ValidationException;

    Route::post('/sanctum/token', function (Request $request) {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return $user->createToken($request->device_name)->plainTextToken;
    });
```

Quando o aplicativo móvel usa o token para fazer uma solicitação de API para o seu aplicativo, ele deve passar o token no cabeçalho de “Autorização” como um token “Bearer”.

> [Nota! ]
> Quando você emite tokens para um aplicativo móvel, também é livre para especificar [habilidades de token](#token-abilities).

<a name="protecting-mobile-api-routes"></a>
### Protegendo Rotas

Como já foi documentado, você pode proteger rotas para que todas as requisições entrem sejam autenticadas anexando o guard de autenticação 'sanctum' às rotas:

```php
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
```

<a name="revoking-mobile-api-tokens"></a>
### Revogação de Token

Para permitir que os usuários revoguem os tokens de API emitidos para dispositivos móveis, você pode listá-los pelo nome, juntamente com um botão "Revogar", dentro da seção "Configurações da conta" da interface do seu aplicativo web. Quando o usuário clica no botão "Revogar", você pode excluir o token do banco de dados. Lembre-se que você pode acessar os tokens de API de um usuário via a relação "tokens" fornecida pela trait `Laravel\Sanctum\HasApiTokens`:

```php
    // Revoke all tokens...
    $user->tokens()->delete();

    // Revoke a specific token...
    $user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## Teste de tradução.

Durante o teste, você pode usar o método `Sanctum::actingAs` para autenticar um usuário e especificar quais habilidades devem ser concedidas ao seu token.

```php tab=Pest
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('task list can be retrieved', function () {
    Sanctum::actingAs(
        User::factory()->create(),
        ['view-tasks']
    );

    $response = $this->get('/api/task');

    $response->assertOk();
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Sanctum\Sanctum;

public function test_task_list_can_be_retrieved(): void
{
    Sanctum::actingAs(
        User::factory()->create(),
        ['view-tasks']
    );

    $response = $this->get('/api/task');

    $response->assertOk();
}
```

Se você gostaria de conceder todas as habilidades para o token, você deve incluir `*` na lista de habilidades fornecida para o método `actingAs`:

```php
    Sanctum::actingAs(
        User::factory()->create(),
        ['*']
    );
```
