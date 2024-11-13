# Laravel Sanctum

<a name="introduction"></a>
## Introdução

[Laravel Sanctum](https://github.com/laravel/sanctum) fornece um sistema de autenticação leve para SPAs (aplicativos de página única), aplicativos móveis e APIs simples baseadas em tokens. O Sanctum permite que cada usuário do seu aplicativo gere vários tokens de API para sua conta. Esses tokens podem receber habilidades/escopos que especificam quais ações os tokens têm permissão para executar.

<a name="how-it-works"></a>
### Como funciona

O Laravel Sanctum existe para resolver dois problemas separados. Vamos discutir cada um antes de nos aprofundarmos na biblioteca.

<a name="how-it-works-api-tokens"></a>
#### Tokens de API

Primeiro, o Sanctum é um pacote simples que você pode usar para emitir tokens de API para seus usuários sem a complicação do OAuth. Esse recurso é inspirado no GitHub e outros aplicativos que emitem "tokens de acesso pessoal". Por exemplo, imagine que as "configurações de conta" do seu aplicativo tenham uma tela onde um usuário pode gerar um token de API para sua conta. Você pode usar o Sanctum para gerar e gerenciar esses tokens. Esses tokens geralmente têm um tempo de expiração muito longo (anos), mas podem ser revogados manualmente pelo usuário a qualquer momento.

O Laravel Sanctum oferece esse recurso armazenando tokens de API do usuário em uma única tabela de banco de dados e autenticando solicitações HTTP de entrada por meio do cabeçalho `Authorization` que deve conter um token de API válido.

<a name="how-it-works-spa-authentication"></a>
#### Autenticação SPA

Segundo, o Sanctum existe para oferecer uma maneira simples de autenticar aplicativos de página única (SPAs) que precisam se comunicar com uma API com tecnologia Laravel. Esses SPAs podem existir no mesmo repositório que seu aplicativo Laravel ou podem ser um repositório totalmente separado, como um SPA criado usando o Vue CLI ou um aplicativo Next.js.

Para esse recurso, o Sanctum não usa tokens de nenhum tipo. Em vez disso, o Sanctum usa os serviços de autenticação de sessão baseados em cookies do Laravel. Normalmente, o Sanctum utiliza o guarda de autenticação `web` do Laravel para fazer isso. Isso fornece os benefícios da proteção CSRF, autenticação de sessão, bem como protege contra vazamento das credenciais de autenticação via XSS.

O Sanctum só tentará autenticar usando cookies quando a solicitação de entrada se originar do seu próprio frontend SPA. Quando o Sanctum examina uma solicitação HTTP de entrada, ele primeiro verificará se há um cookie de autenticação e, se nenhum estiver presente, o Sanctum examinará o cabeçalho `Authorization` para um token de API válido.

::: info NOTA
É perfeitamente aceitável usar o Sanctum apenas para autenticação de token de API ou apenas para autenticação SPA. Só porque você usa o Sanctum não significa que você é obrigado a usar os dois recursos que ele oferece.
:::

<a name="installation"></a>
## Instalação

Você pode instalar o Laravel Sanctum por meio do comando Artisan `install:api`:

```shell
php artisan install:api
```

Em seguida, se você planeja utilizar o Sanctum para autenticar um SPA, consulte a seção [Autenticação do SPA](#spa-authentication) desta documentação.

<a name="configuration"></a>
## Configuração

<a name="overriding-default-models"></a>
### Substituindo modelos padrão

Embora normalmente não seja necessário, você tem a liberdade de estender o modelo `PersonalAccessToken` usado internamente pelo Sanctum:

```php
    use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

    class PersonalAccessToken extends SanctumPersonalAccessToken
    {
        // ...
    }
```

Então, você pode instruir o Sanctum a usar seu modelo personalizado por meio do método `usePersonalAccessTokenModel` fornecido pelo Sanctum. Normalmente, você deve chamar esse método no método `boot` do arquivo `AppServiceProvider` do seu aplicativo:

```php
    use App\Models\Sanctum\PersonalAccessToken;
    use Laravel\Sanctum\Sanctum;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }
```

<a name="api-token-authentication"></a>
## Autenticação de Token de API

::: info NOTA
Você não deve usar tokens de API para autenticar seu próprio SPA de primeira parte. Em vez disso, use os [recursos de autenticação de SPA](#spa-authentication) integrados do Sanctum.
:::

<a name="issuing-api-tokens"></a>
### Emitindo Tokens de API

O Sanctum permite que você emita tokens de API/tokens de acesso pessoal que podem ser usados ​​para autenticar solicitações de API para seu aplicativo. Ao fazer solicitações usando tokens de API, o token deve ser incluído no cabeçalho `Authorization` como um token `Bearer`.

Para começar a emitir tokens para usuários, seu modelo User deve usar o trait `Laravel\Sanctum\HasApiTokens`:

```php
    use Laravel\Sanctum\HasApiTokens;

    class User extends Authenticatable
    {
        use HasApiTokens, HasFactory, Notifiable;
    }
```

Para emitir um token, você pode usar o método `createToken`. O método `createToken` retorna uma instância `Laravel\Sanctum\NewAccessToken`. Os tokens de API são hash usando hash SHA-256 antes de serem armazenados em seu banco de dados, mas você pode acessar o valor de texto simples do token usando a propriedade `plainTextToken` da instância `NewAccessToken`. Você deve exibir este valor para o usuário imediatamente após o token ter sido criado:

```php
    use Illuminate\Http\Request;

    Route::post('/tokens/create', function (Request $request) {
        $token = $request->user()->createToken($request->token_name);

        return ['token' => $token->plainTextToken];
    });
```

Você pode acessar todos os tokens do usuário usando o relacionamento `tokens` do Eloquent fornecido pelo trait `HasApiTokens`:

```php
    foreach ($user->tokens as $token) {
        // ...
    }
```

<a name="token-abilities"></a>
### Habilidades do token

O Sanctum permite que você atribua "habilidades" aos tokens. As habilidades têm um propósito semelhante aos "escopos" do OAuth. Você pode passar uma matriz de habilidades de string como o segundo argumento para o método `createToken`:

```php
    return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

Ao manipular uma solicitação de entrada autenticada pelo Sanctum, você pode determinar se o token tem uma determinada habilidade usando o método `tokenCan`:

```php
    if ($user->tokenCan('server:update')) {
        // ...
    }
```

<a name="token-ability-middleware"></a>
#### Middleware de Habilidade de Token

O Sanctum também inclui dois middlewares que podem ser usados ​​para verificar se uma solicitação de entrada é autenticada com um token que recebeu uma determinada habilidade. Para começar, defina os seguintes aliases de middleware no arquivo `bootstrap/app.php` do seu aplicativo:

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

O middleware `abilities` pode ser atribuído a uma rota para verificar se o token da solicitação recebida tem todas as habilidades listadas:

```php
    Route::get('/orders', function () {
        // Token has both "check-status" and "place-orders" abilities...
    })->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

O middleware `ability` pode ser atribuído a uma rota para verificar se o token da solicitação recebida tem *pelo menos uma* das habilidades listadas:

```php
    Route::get('/orders', function () {
        // Token has the "check-status" or "place-orders" ability...
    })->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a name="first-party-ui-initiated-requests"></a>
#### Solicitações iniciadas pela IU de primeira parte

Por conveniência, o método `tokenCan` sempre retornará `true` se a solicitação autenticada recebida for do seu SPA de primeira parte e você estiver usando a [autenticação do SPA](#spa-authentication) interna do Sanctum.

No entanto, isso não significa necessariamente que seu aplicativo precisa permitir que o usuário execute a ação. Normalmente, as [políticas de autorização](/docs/authorization#creating-policies) do seu aplicativo determinarão se o token recebeu permissão para executar as habilidades, bem como verificarão se a própria instância do usuário deve ter permissão para executar a ação.

Por exemplo, se imaginarmos um aplicativo que gerencia servidores, isso pode significar verificar se o token está autorizado a atualizar servidores **e** se o servidor pertence ao usuário:

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

A princípio, permitir que o método `tokenCan` seja chamado e sempre retorne `true` para solicitações iniciadas pela UI de primeira parte pode parecer estranho; no entanto, é conveniente poder sempre assumir que um token de API está disponível e pode ser inspecionado por meio do método `tokenCan`. Ao adotar essa abordagem, você sempre pode chamar o método `tokenCan` dentro das políticas de autorização do seu aplicativo sem se preocupar se a solicitação foi acionada pela interface do usuário do seu aplicativo ou foi iniciada por um dos consumidores terceirizados da sua API.

<a name="protecting-routes"></a>
### Protegendo Rotas

Para proteger rotas de modo que todas as solicitações recebidas sejam autenticadas, você deve anexar a proteção de autenticação `sanctum` às suas rotas protegidas dentro dos seus arquivos de rota `routes/web.php` e `routes/api.php`. Esta proteção garantirá que as solicitações recebidas sejam autenticadas como solicitações com estado, autenticadas por cookie ou contenham um cabeçalho de token de API válido se a solicitação for de terceiros.

Você pode estar se perguntando por que sugerimos que você autentique as rotas dentro do arquivo `routes/web.php` do seu aplicativo usando a proteção `sanctum`. Lembre-se, o Sanctum tentará primeiro autenticar as solicitações recebidas usando o cookie de autenticação de sessão típico do Laravel. Se esse cookie não estiver presente, o Sanctum tentará autenticar a solicitação usando um token no cabeçalho `Authorization` da solicitação. Além disso, autenticar todas as solicitações usando Sanctum garante que sempre podemos chamar o método `tokenCan` na instância do usuário atualmente autenticada:

```php
    use Illuminate\Http\Request;

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
```

<a name="revoking-tokens"></a>
### Revogando Tokens

Você pode "revogar" tokens excluindo-os do seu banco de dados usando o relacionamento `tokens` fornecido pelo trait `Laravel\Sanctum\HasApiTokens`:

```php
// Revogar todos os tokens...
$user->tokens()->delete();

// Revogar o token que foi usado para autenticar a solicitação atual...
$request->user()->currentAccessToken()->delete();

// Revogar um token específico...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="token-expiration"></a>
### Expiração do Token

Por padrão, os tokens Sanctum nunca expiram e só podem ser invalidados [revogando o token](#revoking-tokens). No entanto, se você quiser configurar um tempo de expiração para os tokens de API do seu aplicativo, você pode fazer isso por meio da opção de configuração `expiration` definida no arquivo de configuração `sanctum` do seu aplicativo. Esta opção de configuração define o número de minutos até que um token emitido seja considerado expirado:

```php
'expiration' => 525600,
```

Se você quiser especificar o tempo de expiração de cada token independentemente, você pode fazer isso fornecendo o tempo de expiração como o terceiro argumento para o método `createToken`:

```php
return $user->createToken(
    'token-name', ['*'], now()->addWeek()
)->plainTextToken;
```

Se você configurou um tempo de expiração de token para seu aplicativo, você também pode desejar [agendar uma tarefa](/docs/scheduling) para podar os tokens expirados do seu aplicativo. Felizmente, o Sanctum inclui um comando Artisan `sanctum:prune-expired` que você pode usar para fazer isso. Por exemplo, você pode configurar uma tarefa agendada para excluir todos os registros de banco de dados de tokens expirados que expiraram por pelo menos 24 horas:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily();
```

<a name="spa-authentication"></a>
## Autenticação SPA

O Sanctum também existe para fornecer um método simples de autenticação de aplicativos de página única (SPAs) que precisam se comunicar com uma API com tecnologia Laravel. Esses SPAs podem existir no mesmo repositório que seu aplicativo Laravel ou podem ser um repositório totalmente separado.

Para esse recurso, o Sanctum não usa tokens de nenhum tipo. Em vez disso, o Sanctum usa os serviços de autenticação de sessão baseados em cookies integrados do Laravel. Essa abordagem para autenticação fornece os benefícios da proteção CSRF, autenticação de sessão, bem como protege contra vazamento das credenciais de autenticação via XSS.

::: warning AVISO
Para autenticar, seu SPA e API devem compartilhar o mesmo domínio de nível superior. No entanto, eles podem ser colocados em subdomínios diferentes. Além disso, você deve garantir que enviou o cabeçalho `Accept: application/json` e o cabeçalho `Referer` ou `Origin` com sua solicitação.
:::

<a name="spa-configuration"></a>
### Configuração

<a name="configuring-your-first-party-domains"></a>
#### Configurando seus domínios primários

Primeiro, você deve configurar de quais domínios seu SPA fará solicitações. Você pode configurar esses domínios usando a opção de configuração `stateful` em seu arquivo de configuração `sanctum`. Essa configuração determina quais domínios manterão a autenticação "stateful" usando cookies de sessão do Laravel ao fazer solicitações à sua API.

::: warning AVISO
Se estiver acessando seu aplicativo por meio de uma URL que inclui uma porta (`127.0.0.1:8000`), você deve garantir que incluiu o número da porta com o domínio.
:::

<a name="sanctum-middleware"></a>
#### Sanctum Middleware

Em seguida, você deve instruir o Laravel que as solicitações recebidas do seu SPA podem ser autenticadas usando os cookies de sessão do Laravel, enquanto ainda permite que solicitações de terceiros ou aplicativos móveis sejam autenticadas usando tokens de API. Isso pode ser facilmente realizado invocando o método de middleware `statefulApi` no arquivo `bootstrap/app.php` do seu aplicativo:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
    })
```

<a name="cors-and-cookies"></a>
#### CORS e cookies

Se você estiver tendo problemas para autenticar com seu aplicativo de um SPA que executa em um subdomínio separado, provavelmente você configurou incorretamente suas configurações de CORS (Cross-Origin Resource Sharing) ou cookie de sessão.

O arquivo de configuração `config/cors.php` não é publicado por padrão. Se você precisar personalizar as opções CORS do Laravel, você deve publicar o arquivo de configuração `cors` completo usando o comando Artisan `config:publish`:

```bash
php artisan config:publish cors
```

Em seguida, você deve garantir que a configuração CORS do seu aplicativo esteja retornando o cabeçalho `Access-Control-Allow-Credentials` com um valor de `True`. Isso pode ser feito definindo a opção `supports_credentials` dentro do arquivo de configuração `config/cors.php` do seu aplicativo como `true`.

Além disso, você deve habilitar as opções `withCredentials` e `withXSRFToken` na instância global `axios` do seu aplicativo. Normalmente, isso deve ser feito no seu arquivo `resources/js/bootstrap.js`. Se você não estiver usando o Axios para fazer solicitações HTTP do seu frontend, você deve executar a configuração equivalente no seu próprio cliente HTTP:

```js
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

Finalmente, você deve garantir que a configuração do domínio do cookie de sessão do seu aplicativo suporte qualquer subdomínio do seu domínio raiz. Você pode fazer isso prefixando o domínio com um `.` inicial dentro do arquivo de configuração `config/session.php` do seu aplicativo:

```php
    'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>
### Autenticando

<a name="csrf-protection"></a>
#### Proteção CSRF

Para autenticar seu SPA, a página "login" do seu SPA deve primeiro fazer uma solicitação ao endpoint `/sanctum/csrf-cookie` para inicializar a proteção CSRF para o aplicativo:

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // Login...
});
```

Durante essa solicitação, o Laravel definirá um cookie `XSRF-TOKEN` contendo o token CSRF atual. Esse token deve então ser passado em um cabeçalho `X-XSRF-TOKEN` em solicitações subsequentes, o que algumas bibliotecas de cliente HTTP como Axios e Angular HttpClient farão automaticamente para você. Se sua biblioteca JavaScript HTTP não definir o valor para você, será necessário definir manualmente o cabeçalho `X-XSRF-TOKEN` para corresponder ao valor do cookie `XSRF-TOKEN` definido por esta rota.

<a name="logging-in"></a>
#### Fazendo login

Depois que a proteção CSRF for inicializada, você deve fazer uma solicitação `POST` para a rota `/login` do seu aplicativo Laravel. Esta rota `/login` pode ser [implementada manualmente](/docs/authentication#authenticating-users) ou usando um pacote de autenticação headless como [Laravel Fortify](/docs/fortify).

Se a solicitação de login for bem-sucedida, você será autenticado e as solicitações subsequentes para as rotas do seu aplicativo serão autenticadas automaticamente por meio do cookie de sessão que o aplicativo Laravel emitiu para seu cliente. Além disso, como seu aplicativo já fez uma solicitação para a rota `/sanctum/csrf-cookie`, as solicitações subsequentes devem receber proteção CSRF automaticamente, desde que seu cliente HTTP JavaScript envie o valor do cookie `XSRF-TOKEN` no cabeçalho `X-XSRF-TOKEN`.

É claro que, se a sessão do seu usuário expirar devido à falta de atividade, as solicitações subsequentes ao aplicativo Laravel podem receber uma resposta de erro HTTP 401 ou 419. Nesse caso, você deve redirecionar o usuário para a página de login do seu SPA.

::: warning AVISO
Você é livre para escrever seu próprio endpoint `/login`; no entanto, você deve garantir que ele autentique o usuário usando os serviços de autenticação padrão, [baseados em sessão que o Laravel fornece](/docs/authentication#authenticating-users). Normalmente, isso significa usar o guarda de autenticação `web`.
:::

<a name="protecting-spa-routes"></a>
### Protegendo rotas

Para proteger rotas para que todas as solicitações recebidas sejam autenticadas, você deve anexar a proteção de autenticação `sanctum` às suas rotas de API dentro do seu arquivo `routes/api.php`. Esta proteção garantirá que as solicitações recebidas sejam autenticadas como solicitações autenticadas com estado do seu SPA ou contenham um cabeçalho de token de API válido se a solicitação for de terceiros:

```php
    use Illuminate\Http\Request;

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
```

<a name="authorizing-private-broadcast-channels"></a>
### Autorizando canais de transmissão privados

Se o seu SPA precisar autenticar com [canais de transmissão privados/presenciais](/docs/broadcasting#authorizing-channels), você deve remover a entrada `channels` do método `withRouting` contido no arquivo `bootstrap/app.php` do seu aplicativo. Em vez disso, você deve invocar o método `withBroadcasting` para que possa especificar o middleware correto para as rotas de transmissão do seu aplicativo:

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

Em seguida, para que as solicitações de autorização do Pusher sejam bem-sucedidas, você precisará fornecer um `authorizer` personalizado do Pusher ao inicializar o [Laravel Echo](/docs/broadcasting#client-side-installation). Isso permite que seu aplicativo configure o Pusher para usar a instância `axios` que está [configurada corretamente para solicitações entre domínios](#cors-and-cookies):

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
## Autenticação de aplicativo móvel

Você também pode usar tokens Sanctum para autenticar as solicitações do seu aplicativo móvel para sua API. O processo de autenticação de solicitações de aplicativo móvel é semelhante à autenticação de solicitações de API de terceiros; no entanto, há pequenas diferenças em como você emitirá os tokens de API.

<a name="issuing-mobile-api-tokens"></a>
### Emissão de tokens de API

Para começar, crie uma rota que aceite o e-mail/nome de usuário, senha e nome do dispositivo do usuário e troque essas credenciais por um novo token Sanctum. O "nome do dispositivo" fornecido a este ponto de extremidade é para fins informativos e pode ser qualquer valor que você desejar. Em geral, o valor do nome do dispositivo deve ser um nome que o usuário reconheceria, como "iPhone 12 do Nuno".

Normalmente, você fará uma solicitação ao ponto de extremidade do token na tela de "login" do seu aplicativo móvel. O endpoint retornará o token de API em texto simples que pode então ser armazenado no dispositivo móvel e usado para fazer solicitações de API adicionais:

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

Quando o aplicativo móvel usa o token para fazer uma solicitação de API para seu aplicativo, ele deve passar o token no cabeçalho `Authorization` como um token `Bearer`.

::: info NOTA
Ao emitir tokens para um aplicativo móvel, você também é livre para especificar [habilidades do token](#token-abilities).
:::

<a name="protecting-mobile-api-routes"></a>
### Protegendo rotas

Conforme documentado anteriormente, você pode proteger rotas para que todas as solicitações recebidas sejam autenticadas anexando a proteção de autenticação `sanctum` às rotas:

```php
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
```

<a name="revoking-mobile-api-tokens"></a>
### Revogando tokens

Para permitir que os usuários revoguem tokens de API emitidos para dispositivos móveis, você pode listá-los por nome, junto com um botão "Revogar", dentro de uma parte de "configurações de conta" da IU do seu aplicativo da web. Quando o usuário clica no botão "Revogar", você pode excluir o token do banco de dados. Lembre-se, você pode acessar os tokens de API de um usuário por meio do relacionamento `tokens` fornecido pelo trait `Laravel\Sanctum\HasApiTokens`:

```php
// Revogar todos os tokens...
$user->tokens()->delete();

// Revogar um token específico...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## Testando

Durante o teste, o método `Sanctum::actingAs` pode ser usado para autenticar um usuário e especificar quais habilidades devem ser concedidas ao seu token:

::: code-group
```php [Pest]
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

```php [PHPUnit]
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
:::

Se você quiser conceder todas as habilidades ao token, deve incluir `*` na lista de habilidades fornecida ao método `actingAs`:

```php
    Sanctum::actingAs(
        User::factory()->create(),
        ['*']
    );
```
