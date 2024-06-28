# Laravel Sanctum

<a name="introduction"></a>
## Introdução

 O [Laravel Sanctum](https://github.com/laravel/sanctum) disponibiliza um sistema de autenticação leve para aplicativos móveis, SPA (aplicações de página única), e APIs baseadas em tokens simples. O Sanctum permite que cada usuário da sua aplicação gerencie vários tokens API para a sua conta. Estes tokens podem ser concedidos com capacidades/escopos, o que especifica quais ações os tokens são autorizados a realizar.

<a name="how-it-works"></a>
### Como funciona

 O Laravel Sanctum existe para resolver dois problemas separados. Vamos discutir cada um antes de aprofundar o conhecimento da biblioteca.

<a name="how-it-works-api-tokens"></a>
#### Tokens de API

 Em primeiro lugar, o Sanctum é um pacote simples que você pode usar para emitir tokens de API aos seus usuários sem a complicação do OAuth. Essa função é inspirada pelo GitHub e outros aplicativos que emitem "tokens de acesso pessoal". Por exemplo, imagine que as configurações da conta do seu aplicativo tenham uma tela onde um usuário possa gerar um token de API para sua conta. Você pode usar o Sanctum para gerar e gerenciar esses tokens. Esses tokens normalmente possuem um tempo de expiração bem longo (anos), mas podem ser revogados manualmente pelo usuário a qualquer momento.

 O Laravel Sanctum oferece esse recurso ao armazenar tokens de API do usuário em uma tabela de banco de dados única e autenticando os pedidos HTTP recebidos via o cabeçalho `Authorization`, que deve conter um token de API válido.

<a name="how-it-works-spa-authentication"></a>
#### Autenticação SPA

 Em segundo lugar, o Sanctum existe para oferecer uma maneira simples de autenticar aplicações de páginas únicas (SPAs) que precisam se comunicar com uma API alimentada pelo Laravel. Essas SPAs podem existir no mesmo repositório que seu aplicativo Laravel ou pode ser um repositório totalmente separado, como um SPA criado usando o Vue CLI ou um aplicativo Next.js.

 Para este recurso, o Sanctum não usa tokens de nenhum tipo. Em vez disso, ele usa os serviços de autenticação baseados em cookies internos do Laravel. Normalmente, o Sanctum utiliza a guarda de autenticação `web` do Laravel para realizar isto. Isso oferece os benefícios da proteção contra CSRF, autenticação de sessão e proteção contra fuga de credenciais de autenticação através de XSS.

 O Sanctum só tentará realizar autenticação utilizando cookies quando o pedido recebido tiver origem no frontend SPA. Quando o Sanctum analisa um pedido HTTP de entrada, verifica primeiro se existe um cookie de autenticação e, caso não exista, irá examinar a secção da "autorização" do cabeçalho para obter um token API válido.

 > [!ATENÇÃO]
 > É totalmente correto usar o Sanctum somente para autenticação com um token de API ou somente para autenticação SPA. Apenas porque você usa o Sanctum não significa que você é obrigado a usar as duas funcionalidades disponíveis.

<a name="installation"></a>
## Instalação

 Você pode instalar o Laravel Sanctum através do comando Artisan "instalar:api":

```shell
php artisan install:api
```

 Em seguida, se você pretende utilizar o Sanctum para autenticar uma aplicação de single page, consulte a seção [Autenticação de Aplicação Single Page (SPA)](#spa-authentication) dessa documentação.

<a name="configuration"></a>
## Configuração

<a name="overriding-default-models"></a>
### Anulação de Modelos Padrão

 Apesar de não ser normalmente necessário, você pode estender o modelo `PersonalAccessToken`, usado internamente pelo Sanctum.

```php
    use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

    class PersonalAccessToken extends SanctumPersonalAccessToken
    {
        // ...
    }
```

 Em seguida, você pode instruir o Sanctum a usar seu modelo personalizado através do método `usePersonalAccessTokenModel`, fornecido pelo Sanctum. Normalmente, você deve chamar esse método no método `boot` do arquivo de `AppServiceProvider` da sua aplicação:

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
## Autenticação com token de API

 > [!OBSERVAÇÃO]
 [Características de autenticação no SPA (Authenticating Features in a Single Page Application)].

<a name="issuing-api-tokens"></a>
### Emissão de Token de API

 O Sanctum permite emitir tokens de API/tokens pessoais de acesso que podem ser utilizados para autenticar requisições API na sua aplicação. Ao fazer requisições usando tokens de API, o token deve estar incluído no cabeçalho `Authorization` como um token `Bearer`.

 Para começar a emitir tokens para usuários, seu modelo User deve usar o traço "Laravel\Sanctum\HasApiTokens":

```php
    use Laravel\Sanctum\HasApiTokens;

    class User extends Authenticatable
    {
        use HasApiTokens, HasFactory, Notifiable;
    }
```

 Para emitir um token, pode utilizar a função `createToken`. A função `createToken` retorna uma instância de `Laravel\Sanctum\NewAccessToken`. Os tokens da API são processados usando o algoritmo SHA-256 antes de serem armazenados na sua base de dados, mas poderá aceder ao valor em texto simples do token através da propriedade `plainTextToken` da instância `NewAccessToken`. Deve exibir o valor no formato texto simples para o utilizador imediatamente após a criação do token:

```php
    use Illuminate\Http\Request;

    Route::post('/tokens/create', function (Request $request) {
        $token = $request->user()->createToken($request->token_name);

        return ['token' => $token->plainTextToken];
    });
```

 Você pode acessar todos os tokens do usuário utilizando o relacionamento `tokens` Eloquent fornecido pela tração `HasApiTokens`:

```php
    foreach ($user->tokens as $token) {
        // ...
    }
```

<a name="token-abilities"></a>
### Capacidades de fichas

 O Sanctum permite que você atribua "habilidades" aos tokens. As habilidades têm um objetivo semelhante ao dos "scopes" do OAuth. Você pode passar uma matriz de string como segundo argumento para o método `createToken`:

```php
    return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

 Ao lidar com uma solicitação recebida autenticada pelo Sanctum, você pode determinar se o token tem um determinado recurso usando o método `tokenCan`:

```php
    if ($user->tokenCan('server:update')) {
        // ...
    }
```

<a name="token-ability-middleware"></a>
#### Middleware da capacidade de tokens

 O Sanctum também inclui dois middlewares que podem ser usados para verificar se um pedido entrando está autenticado com um token concedido uma determinada permissão. Para começar, defina os seguintes alias de middleware no arquivo `bootstrap/app.php` do seu aplicativo:

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

 Pode ser atribuído o middleware `abilities` a uma rota para verificar se o token do pedido de entrada tem todas as capacidades listadas:

```php
    Route::get('/orders', function () {
        // Token has both "check-status" and "place-orders" abilities...
    })->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

 O middleware `capacidade` pode ser atribuído a um caminho para verificar se o token da solicitação recebida tem pelo menos uma das capacidades indicadas:

```php
    Route::get('/orders', function () {
        // Token has the "check-status" or "place-orders" ability...
    })->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a name="first-party-ui-initiated-requests"></a>
#### Primeiras solicitações iniciadas pela interface de utilizador

 Por conveniência, o método `tokenCan` retornará sempre `true` se a solicitação autenticada for do seu aplicativo SPA de primeira parte e você estiver usando a autenticação SPA interna do Sanctum.

 No entanto, isso não necessariamente significa que seu aplicativo precisa permitir que o usuário execute a ação. Normalmente, os [padrões de autorização](/docs/authorization#creating-policies) do seu aplicativo determinam se o token recebeu permissão para executar as capacidades e verificam se a instância do usuário em si pode executar a ação.

 Por exemplo, se pensarmos numa aplicação que gerencie servidores, poderemos controlar que o token é autorizado a efectuar alterações em servidores e que o mesmo pertence ao utilizador:

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

 Permitir a execução do método `tokenCan` e retornar sempre o valor `true` para solicitações iniciadas pelo usuário pode parecer estranho, no entanto, é conveniente poder supor que um token de API está disponível e pode ser inspecionado através do método `tokenCan`. Ao adotar esta abordagem, você sempre poderá invocar o método `tokenCan` dentro das políticas de autorização da sua aplicação sem se preocupar com se a solicitação foi iniciada pelo usuário ou por um consumidor terceirizado de sua API.

<a name="protecting-routes"></a>
### A proteção das vias

 Para proteger os endereços de modo que todos os pedidos recebidos devem ser autenticados, você deve anexar o filtro `sanctum` às suas rotas protegidas no arquivo de rota `routes/web.php` e `routes/api.php`. Esse filtro garantirá que os pedidos recebidos sejam autenticados como autenticação estado ou contendo uma entrada válida do API token se o pedido é feito por um terceiro.

 Pode estar se perguntando por que sugerimos que você autente as rotas na pasta `routes/web.php` de sua aplicação usando a guarda `sanctum`. Lembre-se, o Sanctum primeiro tentará autenticar os pedidos recebidos usando um cookie típico de autenticação de sessão do Laravel. Se esse cookie não estiver presente, o Sanctum tentará autenticar o pedido usando um token no cabeçalho `Authorization` do pedido. Além disso, a autenticação de todos os pedidos usando o Sanctum garante que possamos sempre chamar o método `tokenCan` na instância atual do usuário autenticado:

```php
    use Illuminate\Http\Request;

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
```

<a name="revoking-tokens"></a>
### Revogar tokens

 Você pode "revogar" os tokens excluindo-os do banco de dados usando o relacionamento `tokens`, que é fornecido pelo traço `Laravel\Sanctum\HasApiTokens`:

```php
    // Revoke all tokens...
    $user->tokens()->delete();

    // Revoke the token that was used to authenticate the current request...
    $request->user()->currentAccessToken()->delete();

    // Revoke a specific token...
    $user->tokens()->where('id', $tokenId)->delete();
```

<a name="token-expiration"></a>
### Expiração do token

 Por padrão, os tokens Sanctum nunca expiram e só podem ser invalidados por [revogação do token](#revoking-tokens). No entanto, se pretender configurar um período de validade para os tokens da API da aplicação, poderá fazê-lo através da opção de configuração `expiration` definida no ficheiro de configuração do Sanctum da sua aplicação. Esta opção define o número de minutos até que um token emitido seja considerado expirado:

```php
'expiration' => 525600,
```

 Se pretender especificar o tempo de expiração de cada token independentemente, pode fazê-lo atribuindo o tempo de expiração como terceiro argumento à função `createToken`:

```php
return $user->createToken(
    'token-name', ['*'], now()->addWeek()
)->plainTextToken;
```

 Se você tiver configurado um tempo de validade para o seu token, poderá também agendar uma [tarefa](/docs/scheduling) para eliminar os tokens expirados da sua aplicação. Felizmente, Sanctum inclui um comando `sanctum:prune-expired` que você pode usar para realizar essa ação. Por exemplo, poderá configurar uma tarefa agendada para excluir todos os registros de dados de tokens expirados há pelo menos 24 horas:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily();
```

<a name="spa-authentication"></a>
## Autenticação do SPA

 O Sanctum também foi criado para fornecer um método simples de autenticação em aplicações com uma página (SPA) que precisam se comunicar com uma API baseada no Laravel. Estas SPAs podem ser parte do repositório da aplicação, ou até mesmo um repositório separado.

 Para esta funcionalidade, o Sanctum não utiliza tokens de nenhum tipo. Em vez disso, a Sanctum usa serviços internos do Laravel baseados em cookies para autenticação de sessão. Esta abordagem na área da autenticação oferece benefícios como proteção contra ataques CSRF, autenticação de sessão e proteção contra fugas das credenciais de autenticação por meio de XSS.

 > [Atenção]
 > Para se autenticar, o SPA e a API devem compartilhar o mesmo domínio superior. No entanto, podem estar situados em diferentes subdomínios. Além disso, deve assegurar que envia o cabeçalho `Accept: application/json` e, ou, o cabeçalho `Referer` ou `Origin` com a sua solicitação.

<a name="spa-configuration"></a>
### Configuração

<a name="configuring-your-first-party-domains"></a>
#### Configuração dos seus domínios próprios

 Primeiro, você deve configurar quais domínios seu SPA fará solicitações. Você pode configurar estes domínios usando a opção de configuração `stateful` em seu arquivo de configuração `sanctum`. Este parâmetro determina quais domínios vão manter uma autenticação "estadual" através do uso dos cookies da sessão Laravel, quando estiverem fazendo solicitações para a API.

 > [ATENÇÃO]
 > Se você estiver acessando seu aplicativo por meio de uma URL que inclui um porto (“127.0.0.1:8000”), certifique-se de incluir o número do porto no domínio.

<a name="sanctum-middleware"></a>
#### Intermediário do Sanctum

 Em seguida, você deve instruir o Laravel que as solicitações recebidas do seu SPA podem se autenticar usando os cookies de sessão do Laravel, enquanto permite que solicitações de terceiros ou aplicativos móveis façam a autenticação usando tokens da API. Isso pode ser facilmente feito convocando o método `statefulApi` do middleware no arquivo `bootstrap/app.php` do seu aplicativo:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
    })
```

<a name="cors-and-cookies"></a>
#### CORS e cookies

 Se você estiver com problemas para se autenticar em seu aplicativo de um SPA que é executado em um subdomínio separado, provavelmente as configurações de partilha de recursos transacionais ou cookies de sessão foram mal configuradas.

 O arquivo de configuração `config/cors.php`, por padrão, não é publicado. Se você precisar personalizar as opções CORS do Laravel, deve publicar o arquivo de configuração completo `cors` usando a ordem de serviço Artisan:

```bash
php artisan config:publish cors
```

 Em seguida, você precisa garantir que a configuração do CORS de sua aplicação esteja retornando o cabeçalho `Access-Control-Allow-Credentials` com um valor de `True`. Isso pode ser feito definindo a opção `supports_credentials` dentro do arquivo de configuração do seu aplicativo, `config/cors.php`, para `true`.

 Além disso, você deve ativar as opções `withCredentials` e `withXSRFToken` na instância global do `axios` da aplicação. Normalmente, isto é realizado no arquivo `resources/js/bootstrap.js`. Se não estiver usando o Axios para fazer solicitações HTTP do frontend, deve realizar a configuração equivalente em seu próprio cliente de HTTP:

```js
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

 Finalmente, você deve garantir que a configuração de domínio do cookie da sessão do aplicativo suporte qualquer subdomínio do seu domínio principal. Você pode conseguir isso ao prefixar o domínio com um "." inicial dentro do arquivo de configuração `config/session.php` do aplicativo:

```php
    'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>
### Autenticação

<a name="csrf-protection"></a>
#### Proteção contra a CSRF

 Para autenticar seu aplicativo SPA, o endereço inicial da página do seu aplicativo deve fazer um pedido no recurso "/sanctum/csrf-cookie" para inicializar a proteção contra CSRF para a aplicação:

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // Login...
});
```

 Durante essa requisição, o Laravel definirá uma cookie contendo um token de CSRF atual. Esse token deve ser passado num cabeçalho `X-XSRF-TOKEN` em requisições subsequentes. As bibliotecas HTTP client como Axios e Angular HttpClient farão isso automaticamente para você. Se a sua biblioteca de HTTP JavaScript não definir o valor por si mesma, precisará definir manualmente o cabeçalho `X-XSRF-TOKEN` de forma que corresponda ao valor da cookie `XSRF-TOKEN`.

<a name="logging-in"></a>
#### Entrando

 Depois que a proteção contra CSRF for inicializada, você deve fazer uma solicitação `POST` ao roteado `/login` da sua aplicação Laravel. Esse roteado `/login` pode ser implementado manualmente ([veja como](/docs/authentication#authenticating-users) (em inglês)) ou usando um pacote de autenticação sem interface, como [Laravel Fortify](/docs/fortify).

 Se o pedido de login for bem-sucedido, você estará autenticado e os pedidos subsequentes aos seus endereços da aplicação serão automaticamente autenticados através do cookie de sessão emitido pela aplicação Laravel ao seu cliente. Além disso, como sua aplicação já fez um pedido no endereço `/sanctum/csrf-cookie`, os pedidos subsequentes devem receber proteção CSRF automaticamente, desde que o cliente HTTP JavaScript envie o valor do cookie `XSRF-TOKEN` na cabeçalho `X-XSRF-TOKEN`.

 Claro que se a sessão do seu usuário expirar devido à falta de atividade, os pedidos subsequentes para a aplicação Laravel poderão receber uma resposta HTTP com um código de erro 401 ou 419. Neste caso, deve redirecioná-lo para a página de login do seu SPA.

 > [AVERIGEMENTO]
 [Serviços de autenticação baseados em sessão fornecidos pelo Laravel (/)], tipicamente isso significa usar o Guard de Autenticação `web`.

<a name="protecting-spa-routes"></a>
### Proteger as vias

 Para proteger os caminhos, de modo que todos os pedidos recebidos precisam ser autenticados, você deve anexar o guarda-chuva de autenticação `sanctum` aos seus roteadores de API no arquivo `routes/api.php`. Esse guarda-chuva irá garantir que os pedidos recebidos sejam autenticados, seja como requisições autenticadas estatais de seu SPA ou contendo uma cabeçalho de token de API válido, caso o pedido seja enviado por um terceiro:

```php
    use Illuminate\Http\Request;

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
```

<a name="authorizing-private-broadcast-channels"></a>
### Autorização de canais de radiodifusão privados

 Se o seu SPA necessitar de se autenticar com [canais de transmissão privados/de presença](/docs/broadcasting#autorizar-canais), deve remover a entrada `channels` da função `withRouting`, constante do arquivo `bootstrap/app.php`. Em vez disso, pode invocar a função `withBroadcasting` para especificar o middleware correto para os seus próprios canais de transmissão:

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

 Em seguida, para que os pedidos de autorização do Pusher tenham sucesso, você precisará fornecer um `autorizador` personalizado quando inicializar o [Laravel Echo](http://docs.laravel.bref.tv/broadcasting/#client-side-installaion). Isso permite que sua aplicação configure o Pusher para usar a instância do `axios` que está configurada corretamente para solicitações entre domínios:

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
## Autenticação de aplicação móvel

 Também é possível usar tokens Sanctum para autenticar os pedidos da aplicação móvel à API. O processo de autenticação dos pedidos de aplicativos móveis é semelhante ao das solicitações provenientes de terceiros, contudo existem pequenas diferenças na emissão dos tokens de API.

<a name="issuing-mobile-api-tokens"></a>
### Emissão de tokens da API

 Para começar, crie uma rota que aceite o e-mail/username do usuário, senha e nome do dispositivo. Em seguida, troque essas credenciais por um novo token Sanctum. O "nome do dispositivo" dado a esse endpoint é para fins informativos e pode ser qualquer valor que você desejar. Em geral, o valor do nome do dispositivo deve ser um nome que o usuário reconheça, como "Nuno's iPhone 12".

 Normalmente, você fará um pedido no recurso de fim de token do "login" (logon) da aplicação móvel. O recurso retornará o token API em linguagem simples que poderá então ser armazenado no dispositivo móvel e usado para fazer solicitações adicionais à API:

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

 Quando o aplicativo móvel utilizar o token para efetuar um pedido de API ao seu aplicativo, deve transmitir o token no cabeçalho "Autorização" como um token "Bearer".

 > [!ATENÇÃO]
 [Habilidades do token] (#token-abilities).

<a name="protecting-mobile-api-routes"></a>
### Proteger rotas

 Como já documentado anteriormente, você pode proteger rotas para que todos os pedidos recebidos precisem ser autenticados, anexando a guarda de autenticação `sanctum` às rotas:

```php
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
```

<a name="revoking-mobile-api-tokens"></a>
### Revogação de tokens

 Para permitir que os usuários revoguem os tokens de API emitidos para dispositivos móveis, você pode listá-los por nome, juntamente com um botão "Revogar", na parte de "configurações da conta" do aplicativo Web. Quando o usuário clicar no botão "Revogar", você poderá excluir o token do banco de dados. Lembre-se que é possível acessar os tokens de API dos usuários por meio da relação `tokens` fornecida pela característica `Laravel\Sanctum\HasApiTokens`:

```php
    // Revoke all tokens...
    $user->tokens()->delete();

    // Revoke a specific token...
    $user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## Teste

 Durante o teste, é possível utilizar o método `Sanctum::actingAs` para autenticar um usuário e especificar quais habilidades devem ser concedidas a seu token.

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

 Se você deseja conceder todos os privilégios ao token, deve incluir um `*` na lista de habilidades fornecida ao método `actingAs`:

```php
    Sanctum::actingAs(
        User::factory()->create(),
        ['*']
    );
```
