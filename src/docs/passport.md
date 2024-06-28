# O Laravel Passport

<a name="introduction"></a>
## Introdução

 O [Laravel Passport](https://github.com/laravel/passport) fornece uma implementação completa do servidor OAuth2 para sua aplicação Laravel em questão de minutos. O Passport é construído com o servidor OAuth2 [League OAuth2 server](https://github.com/thephpleague/oauth2-server), mantido por Andy Millington e Simon Hamp.

 > [ADVERTÊNCIA]
 Faça o download do guia de terminologia (https://oauth2.thephpleague.com/terminology/) e das características da OAuth2 antes de prosseguir.

<a name="passport-or-sanctum"></a>
### O passaporte ou o Santuário?

 Antes de começar, você pode querer determinar se a aplicação será melhor servida pelo Laravel Passport ou [Laravel Sanctum](/docs/sanctum). Se sua aplicação exigir absolutamente o suporte para OAuth2, então você deve usar o Laravel Passport.

 No entanto, se estiver a tentar autenticar um aplicativo de páginas únicas, uma aplicação móvel ou emitir tokens API, deve utilizar o [Laravel Sanctum](/docs/sanctum). O Laravel Sanctum não suporta o OAuth2. No entanto, fornece uma experiência mais simples de desenvolvimento de autenticação API.

<a name="installation"></a>
## Instalação

 Você pode instalar o Laravel Passport através do comando 'install:api' do Artisan:

```shell
php artisan install:api --passport
```

 Este comando publica e executa as migrações de banco de dados necessárias para criar as tabelas que o aplicativo precisa para armazenar clientes OAuth2 e tokens de acesso. Além disso, o comando cria as chaves de encriptação exigidas para gerar tokens de acesso seguros.

 Além disso, este comando perguntará se pretende utilizar um UUID como valor da chave primária do modelo de cliente do passaporte em vez de números inteiros que aumentam automaticamente.

 Depois de executar o comando `install:api`, adicione o trato `Laravel\Passport\HasApiTokens` ao seu modelo `App\Models\User`. Este trato fornecerá alguns métodos auxiliares para seu modelo, que permitem inspecionar o token e os escopos do usuário autenticado:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Laravel\Passport\HasApiTokens;

    class User extends Authenticatable
    {
        use HasApiTokens, HasFactory, Notifiable;
    }
```

 Por último, no arquivo de configuração do seu aplicativo `config/auth.php`, você deve definir um guarda-chuva de autenticação `api` e defina a opção `driver` para `passport`. Isso indicará ao seu aplicativo que use o `TokenGuard` do Passport para autenticar solicitações da API:

```php
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        'api' => [
            'driver' => 'passport',
            'provider' => 'users',
        ],
    ],
```

<a name="deploying-passport"></a>
### Implementação do Passaporte

 Ao implantar o Passport nos servidores da sua aplicação pela primeira vez, você provavelmente precisará executar o comando `passport:keys`. Este comando gera as chaves de criptografia que o Passport necessita para gerar tokens de acesso. As chaves geradas normalmente não são armazenadas no controle de originais:

```shell
php artisan passport:keys
```

 Se necessário, você pode definir o caminho onde as chaves do Passport devem ser carregadas. Você pode usar o método `Passport::loadKeysFrom` para isso. Normalmente, esse método deve ser chamado a partir do método `boot` da classe de seu aplicativo `App\Providers\AppServiceProvider`:

```php
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
    }
```

<a name="loading-keys-from-the-environment"></a>
#### Carregando chaves a partir do ambiente

 Em alternativa, você pode publicar o arquivo de configuração do Passport usando o comando `vendor:publish` do Artisan.

```shell
php artisan vendor:publish --tag=passport-config
```

 Após a publicação do arquivo de configuração, você pode carregar suas chaves de encriptação da aplicação definindo-as como variáveis de ambiente.

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a name="upgrading-passport"></a>
### Melhoria do passaporte

 Ao fazer um upgrade para uma nova versão maior do Passport, é importante que você revise cuidadosamente o [guia de atualização](https://github.com/laravel/passport/blob/master/UPGRADE.md).

<a name="configuration"></a>
## Configuração

<a name="client-secret-hashing"></a>
### Criptografia de segredo do cliente

 Se você deseja que os segredos de seu cliente sejam hashed quando armazenados em sua base de dados, deve chamar o método `Passport::hashClientSecrets` no método `boot` da classe `App\Providers\AppServiceProvider`:

```php
    use Laravel\Passport\Passport;

    Passport::hashClientSecrets();
```

 Depois de ativada, todos os seus segredos do cliente só serão exibidos para o usuário imediatamente após a sua criação. Como o valor do segredo em texto plano não é armazenado na base de dados, não é possível recuperar o valor do segredo se este for perdido.

<a name="token-lifetimes"></a>
### Vida útil do token

 Por padrão, o Passport gera tokens de acesso que têm longa duração e expiram após um ano. Se você desejar configurar uma vida útil mais longa ou curta para os tokens, pode usar as métricas `tokensExpireIn`, `refreshTokensExpireIn` e `personalAccessTokensExpireIn`. Estas métricas devem ser chamadas na métrica `boot` da sua aplicação no `App\Providers\AppServiceProvider`:

```php
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::tokensExpireIn(now()->addDays(15));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));
    }
```

 > [AVERIGOCHEM-SE]
 [ revogar tokens.

<a name="overriding-default-models"></a>
### Ignorando os modelos padrão

 Você está livre para estender os modelos usados internamente pelo Passport, definindo seu próprio modelo e estendendo o modelo do Passport correspondente:

```php
    use Laravel\Passport\Client as PassportClient;

    class Client extends PassportClient
    {
        // ...
    }
```

 Depois de definir seu modelo, você pode instruir o Passport a usar seu modelo personalizado através da classe `Laravel\Passport\Passport`. Normalmente, você deve informar ao Passport sobre seus modelos personalizados na metodologia `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    use App\Models\Passport\AuthCode;
    use App\Models\Passport\Client;
    use App\Models\Passport\PersonalAccessClient;
    use App\Models\Passport\RefreshToken;
    use App\Models\Passport\Token;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::useTokenModel(Token::class);
        Passport::useRefreshTokenModel(RefreshToken::class);
        Passport::useAuthCodeModel(AuthCode::class);
        Passport::useClientModel(Client::class);
        Passport::usePersonalAccessClientModel(PersonalAccessClient::class);
    }
```

<a name="overriding-routes"></a>
### Rotas sobrepostas

 Algumas vezes você pode querer personalizar os roteadores definidos pelo Passport. Para isso, primeiro é necessário ignorar as rotas registradas pelo Passport adicionando o `Passport::ignoreRoutes` ao método `register` do seu `AppServiceProvider`:

```php
    use Laravel\Passport\Passport;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        Passport::ignoreRoutes();
    }
```

 Em seguida, você pode copiar as rotas definidas pelo Passport em [seu arquivo de rotas](https://github.com/laravel/passport/blob/11.x/routes/web.php) para o arquivo `routes/web.php` do seu aplicativo e modificá-las conforme preferir:

```php
    Route::group([
        'as' => 'passport.',
        'prefix' => config('passport.path', 'oauth'),
        'namespace' => '\Laravel\Passport\Http\Controllers',
    ], function () {
        // Passport routes...
    });
```

<a name="issuing-access-tokens"></a>
## Emissão de tokens de acesso

 A utilização da OAuth2 por meio de códigos de autorização é comum entre os desenvolvedores. Quando se usa essa opção, o aplicativo do cliente redireciona o usuário para seu servidor, onde esse último pode aprovar ou recusar o pedido de emissão de um token de acesso ao cliente.

<a name="managing-clients"></a>
### Gerir Clientes

 Primeiro, os desenvolvedores que criam aplicativos que precisam interagir com o API de seu aplicativo precisarão registrar sua aplicação na deles, criando um "cliente". Normalmente, isso consiste em fornecer o nome da aplicação e um URL para onde seu aplicativo pode redirecionar após os usuários aprovarem seu pedido de autorização.

<a name="the-passportclient-command"></a>
#### O Comando "passport:client"

 A maneira mais simples de criar um cliente é utilizando o comando do Arquitecto `passport:client`. Este comando pode ser utilizado para criar os próprios clientes para testar as funções OAuth2. Quando executar o comando `client`, Passport solicitará mais informações sobre o seu cliente e fornecerá uma ID de cliente e segredo:

```shell
php artisan passport:client
```

 **URLs de redirecionamento**

 Se você quiser permitir vários URLs de redirecionamento para seu cliente, pode especificá-las usando uma lista delimitada por vírgulas quando solicitado a preencher o campo URL pelo comando `passport:client`. Quaisquer URLs que contenham vírgulas devem estar codificadas em URL:

```shell
http://example.com/callback,http://examplefoo.com/callback
```

<a name="clients-json-api"></a>
#### API JSON

 Como os usuários de seu aplicativo não poderão usar o comando cliente, o Passport disponibiliza uma API JSON que você pode usar para criar clientes. Dessa forma, você não precisa codificar manualmente controladores para criar, atualizar e excluir clientes.

 No entanto, você precisará associar a API JSON do Passport ao seu próprio frontend para oferecer um painel de controle aos usuários para gerenciamento de seus clientes. Abaixo, revisaremos todos os pontos finais da API de gerenciamento de clientes. Por conveniência, usar [Axios](https://github.com/axios/axios) para demonstrar requisições HTTP aos pontos finais

 A API JSON é protegida pelos middlewares `web` e `auth`, ou seja, só pode ser chamada pela sua própria aplicação, não podendo ser chamada por uma fonte externa.

<a name="get-oauthclients"></a>
#### `Obtido o cliente com sucesso.`

 Este comando envia os clientes do usuário autenticado. Isso é útil principalmente para listar todos os clientes de um usuário, que poderá então editar ou excluí-los:

```js
axios.get('/oauth/clients')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthclients"></a>
#### ``POST /oauth/clients''

 Este é um formato de rota usado para criar novos clientes. Requer duas informações: o nome do cliente e uma URL de redirecionamento (aonde o usuário será redirecionado após aprovar ou negar uma solicitação de autorização).

 Quando um cliente é criado, recebe uma identificação do cliente e um segredo de cliente. Estes valores serão usados quando solicitar token de acesso da sua aplicação. A rota de criação do cliente irá retornar a nova instância de cliente:

```js
const data = {
    name: 'Client Name',
    redirect: 'http://example.com/callback'
};

axios.post('/oauth/clients', data)
    .then(response => {
        console.log(response.data);
    })
    .catch (response => {
        // List errors on response...
    });
```

<a name="put-oauthclientsclient-id"></a>
#### `Puts /oauth/clients/{client-id}`

 Este caminho é utilizado para atualizar os clientes. Exige dois dados: o nome do cliente e uma URL de redirecionamento. A URL de redirecionamento será onde o utilizador será redirecionado depois da aprovação ou recusa de um pedido de autorização. O caminho retorna a instância do cliente atualizada:

```js
const data = {
    name: 'New Client Name',
    redirect: 'http://example.com/callback'
};

axios.put('/oauth/clients/' + clientId, data)
    .then(response => {
        console.log(response.data);
    })
    .catch (response => {
        // List errors on response...
    });
```

<a name="delete-oauthclientsclient-id"></a>
#### `ELIMINAR /oauth/clients/{client-id}`

 Este comando é usado para remover clientes:

```js
axios.delete('/oauth/clients/' + clientId)
    .then(response => {
        // ...
    });
```

<a name="requesting-tokens"></a>
### Solicitar tokens

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### Redirecionamento para autorização

 Depois de criado um cliente, os desenvolvedores podem usar o seu ID e segredo do cliente para solicitar um código de autorização e um token de acesso da sua aplicação. Primeiro, a aplicação consumidora deve fazer um pedido de redirecionamento para a rota `/oauth/authorize` da sua aplicação como se segue:

```php
    use Illuminate\Http\Request;
    use Illuminate\Support\Str;

    Route::get('/redirect', function (Request $request) {
        $request->session()->put('state', $state = Str::random(40));

        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://third-party-app.com/callback',
            'response_type' => 'code',
            'scope' => '',
            'state' => $state,
            // 'prompt' => '', // "none", "consent", or "login"
        ]);

        return redirect('http://passport-app.test/oauth/authorize?'.$query);
    });
```

 O parâmetro `prompt` pode ser utilizado para especificar o comportamento de autenticação da aplicação Passport.

 Se o valor de `prompt` for `none`, a autenticação do usuário falhará sempre que o mesmo não estiver já autenticado na aplicação Passport. Se o valor for `consent`, o Passport irá sempre exibir a tela de autorização de consentimento, mesmo quando todos os escopos tenham sido concedidos previamente à aplicação consuminha. Quando o valor é `login`, a aplicação Passport solicitará sempre novamente ao usuário que se logue na aplicação, mesmo quando este já tiver uma sessão ativa.

 Se o valor de `prompt` não for especificado, o usuário será solicitado permissão apenas se ele ainda não tiver autorizado acesso à aplicação consumidora para os escopos solicitados.

 > [!AVISO]
 > Lembre-se que a rota `/oauth/authorize` já está definida pelo Passport. Não é necessário definir manualmente essa rota.

<a name="approving-the-request"></a>
#### Aprovação do pedido

 Quando receber solicitações de autorização, o Passport responderá automaticamente com base no valor do parâmetro `prompt` (se presente) e pode exibir um modelo para que o usuário aprove ou negue o pedido de autorização. Se ele aprovar o pedido, será redirecionado de volta ao `redirect_uri`, especificado pela aplicação consumidora. O `redirect_uri` deve coincidir com a URL `redirect` que foi especificada quando o cliente foi criado.

 Se você deseja personalizar a tela de aprovação da autorização, poderá publicar as vistas do Passport usando o comando Artisan `vendor:publish`. As visualizações publicadas serão colocadas no diretório `resources/views/vendor/passport`:

```shell
php artisan vendor:publish --tag=passport-views
```

 Às vezes você pode querer ignorar o prompt de autorização, como quando estiver autorizando um cliente próprio. Isso pode ser feito [estendendo o modelo `Client`](#overriding-default-models) e definindo uma função `skipsAuthorization`. Se a função retornar `true`, o cliente será aprovado e o usuário será redirecionado de volta para o `redirect_uri` imediatamente, exceto quando a aplicação consumidora tiver definido explicitamente o parâmetro `prompt` ao fazer o redirecionamento para autorização:

```php
    <?php

    namespace App\Models\Passport;

    use Laravel\Passport\Client as BaseClient;

    class Client extends BaseClient
    {
        /**
         * Determine if the client should skip the authorization prompt.
         */
        public function skipsAuthorization(): bool
        {
            return $this->firstParty();
        }
    }
```

<a name="requesting-tokens-converting-authorization-codes-to-access-tokens"></a>
#### Conversão de códigos de autorização em tokens de acesso

 Se o usuário aprovar o pedido de autorização, ele será redirecionado novamente para a aplicação consome-la. O consumidor deve primeiro verificar o parâmetro `state` contra o valor que foi armazenado antes do redirecionamento. Caso o estado seja igual, o consumidor deverá enviar um pedido `POST` para a sua aplicação solicitando um token de acesso. O pedido deve incluir o código de autorização emitido por sua aplicação quando o usuário aprovou o pedido de autorização:

```php
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Http;

    Route::get('/callback', function (Request $request) {
        $state = $request->session()->pull('state');

        throw_unless(
            strlen($state) > 0 && $state === $request->state,
            InvalidArgumentException::class,
            'Invalid state value.'
        );

        $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
            'grant_type' => 'authorization_code',
            'client_id' => 'client-id',
            'client_secret' => 'client-secret',
            'redirect_uri' => 'http://third-party-app.com/callback',
            'code' => $request->code,
        ]);

        return $response->json();
    });
```

 Este caminho de chamada `/oauth/token` retornará uma resposta JSON contendo os atributos `access_token`, `refresh_token` e `expires_in`. O atributo `expires_in` contém o número de segundos até a expiração do token de acesso.

 > [!AVISO]
 > Como o roteamento de `/oauth/authorize`, o roteamento de `/oauth/token` é definido automaticamente pelo Passport, não sendo necessário definir este roteamento manualmente.

<a name="tokens-json-api"></a>
#### API JSON

 O Passport também inclui uma API JSON para gerenciar tokens de acesso autorizados. Você pode usar isso com o seu próprio frontend para oferecer ao usuário um painel de controle de token de acesso. Por conveniência, nós iremos usar [Axios](https://github.com/mzabriskie/axios) para demonstrar solicitações HTTP aos endpoints. A API JSON é protegida pelas middlewares `web` e `auth`; portanto, só pode ser chamada a partir da sua própria aplicação.

<a name="get-oauthtokens"></a>
#### ``GET /oauth/tokens''

 Esta rota retorna todos os tokens de acesso autorizados criados pelo utilizador autenticado. Este método é especialmente útil para listar todos os tokens do utilizador, permitindo revogá-los:

```js
axios.get('/oauth/tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="delete-oauthtokenstoken-id"></a>
#### `DELETE /oauth/tokens/{token-id}`

 Este caminho pode ser usado para revogar os tokens de acesso autorizados e os seus refrescos de token relacionados:

```js
axios.delete('/oauth/tokens/' + tokenId);
```

<a name="refreshing-tokens"></a>
### Token de renovação

 Se a aplicação emitir tokens de acesso de vida curta, os utilizadores terão de atualizar os seus tokens de acesso através do token de atualização que lhes foi fornecido quando o token de acesso foi emitido:

```php
    use Illuminate\Support\Facades\Http;

    $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
        'grant_type' => 'refresh_token',
        'refresh_token' => 'the-refresh-token',
        'client_id' => 'client-id',
        'client_secret' => 'client-secret',
        'scope' => '',
    ]);

    return $response->json();
```

 Essa rota "/oauth/token" devolverá uma resposta JSON contendo os atributos `access_token`, `refresh_token` e `expires_in`. O atributo `expires_in` contém o número de segundos até que o token de acesso expire.

<a name="revoking-tokens"></a>
### Revogação de tokens

 Você pode revogar um token usando a `revokeAccessToken` no `Laravel\Passport\TokenRepository`. Você também pode revogar os tokens de atualização utilizando a `revokeRefreshTokensByAccessTokenId` do `Laravel\Passport\RefreshTokenRepository`. Estas classes podem ser resolvidas usando o [conjunto de serviços] (/docs/container) de Laravel:

```php
    use Laravel\Passport\TokenRepository;
    use Laravel\Passport\RefreshTokenRepository;

    $tokenRepository = app(TokenRepository::class);
    $refreshTokenRepository = app(RefreshTokenRepository::class);

    // Revoke an access token...
    $tokenRepository->revokeAccessToken($tokenId);

    // Revoke all of the token's refresh tokens...
    $refreshTokenRepository->revokeRefreshTokensByAccessTokenId($tokenId);
```

<a name="purging-tokens"></a>
### Purificação de tokens

 Se os tokens tiverem sido revogados ou expirado, poderá ser interessante apagá-los no banco de dados. O comando Passport incluído na Artiosan "passport:purge" pode fazer isto por si:

```shell
# Purge revoked and expired tokens and auth codes...
php artisan passport:purge

# Only purge tokens expired for more than 6 hours...
php artisan passport:purge --hours=6

# Only purge revoked tokens and auth codes...
php artisan passport:purge --revoked

# Only purge expired tokens and auth codes...
php artisan passport:purge --expired
```

 Você também pode configurar um trabalho programado em seu arquivo "routes/console.php" da aplicação para apagar automaticamente seus tokens em um horário agendado:

```php
    use Laravel\Support\Facades\Schedule;

    Schedule::command('passport:purge')->hourly();
```

<a name="code-grant-pkce"></a>
## Concessão de código de autorização com o PKCE

 O código de autorização com o método "Proof Key for Code Exchange" (PKCE) é uma forma segura para autenticar aplicações em página única ou aplicações nativas no acesso à sua API. Este tipo de autorização deve ser utilizado quando você não pode garantir que os segredos do cliente são armazenados confidencialmente ou para diminuir o risco da interceptação do código de autorização por um invasor. Uma combinação de "verificador do código" e "desafio do código" substitui o segredo do cliente na troca do código de autorização por um token de acesso.

<a name="creating-a-auth-pkce-grant-client"></a>
### Criando o cliente

 Antes que o aplicativo possa emitir tokens através da autorização de código com PKCE, você precisará criar um cliente habilitado para PKCE. Você pode fazer isso usando a ordem do Arquiteto `passport:client` com a opção `--public`:

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### Solicitar tokens

<a name="code-verifier-code-challenge"></a>
#### Verificador de código e desafio de código

 Como esta autorização concedida não inclui um segredo do cliente, os desenvolvedores deverão gerar uma combinação de um verificador de código e um desafio de código para requerer um token.

 O verificador de código deve ser um string aleatório com entre 43 e 128 caracteres que contenham letras, números e personagens `"-"`, `"."`, `"_"` e `"~"`, conforme definido na [especificação do RFC 7636](https://tools.ietf.org/html/rfc7636).

 O desafio de código deve ser uma string codificada em Base64 com caracteres seguros para URL e nomes de arquivo. Os caracteres `''='' (trailing) devem ser removidos e não pode haver quebras de linha, espaços ou outros caracteres adicionais.

```php
    $encoded = base64_encode(hash('sha256', $code_verifier, true));

    $codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>
#### Redirecionando para autorização

 Depois de criado um cliente, use o ID do cliente e os verificadores de códigos e desafios de código gerados para solicitar um código de autorização e token de acesso na sua aplicação. Em primeiro lugar, a aplicação consumidora deve fazer uma solicitação de redirecionamento ao roteado `/oauth/authorize` da sua aplicação:

```php
    use Illuminate\Http\Request;
    use Illuminate\Support\Str;

    Route::get('/redirect', function (Request $request) {
        $request->session()->put('state', $state = Str::random(40));

        $request->session()->put(
            'code_verifier', $code_verifier = Str::random(128)
        );

        $codeChallenge = strtr(rtrim(
            base64_encode(hash('sha256', $code_verifier, true))
        , '='), '+/', '-_');

        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://third-party-app.com/callback',
            'response_type' => 'code',
            'scope' => '',
            'state' => $state,
            'code_challenge' => $codeChallenge,
            'code_challenge_method' => 'S256',
            // 'prompt' => '', // "none", "consent", or "login"
        ]);

        return redirect('http://passport-app.test/oauth/authorize?'.$query);
    });
```

<a name="code-grant-pkce-converting-authorization-codes-to-access-tokens"></a>
#### Transformando códigos de autorização em tokens de acesso

 Se o usuário aprovar o pedido de autorização, ele será redirecionado para a aplicação consumidora. O consumidor deve verificar o parâmetro `state` em relação ao valor que foi armazenado antes do redirecionamento, assim como é feito na concessão padrão de código de autorização.

 Se o parâmetro state for igual, o consumidor deverá enviar um pedido POST para a sua aplicação para solicitar um token de acesso. O pedido deve incluir o código de autorização emitido pela sua aplicação quando o utilizador aceitou o pedido de autorização, juntamente com o verificador de códigos originalmente gerado:

```php
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Http;

    Route::get('/callback', function (Request $request) {
        $state = $request->session()->pull('state');

        $codeVerifier = $request->session()->pull('code_verifier');

        throw_unless(
            strlen($state) > 0 && $state === $request->state,
            InvalidArgumentException::class
        );

        $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
            'grant_type' => 'authorization_code',
            'client_id' => 'client-id',
            'redirect_uri' => 'http://third-party-app.com/callback',
            'code_verifier' => $codeVerifier,
            'code' => $request->code,
        ]);

        return $response->json();
    });
```

<a name="password-grant-tokens"></a>
## Token de concessão de senha

 > [AVISO]
 [um tipo de autorização atualmente recomendada por um servidor OAuth2](https://oauth2.thephpleague.com/authorization-server/which-grant/).

 A concessão de senha do OAuth2 permite que outros clientes da empresa, por exemplo, uma aplicação móvel, obtenham um token de acesso utilizando o endereço de e-mail/nome de utilizador e a palavra-passe. Isso lhe permite emitir tokens de acesso com segurança para os clientes da empresa sem que seja necessário que os seus utilizadores passem pelo fluxo redirecionado completo do código de autorização OAuth2.

 Para ativar o processo de autorização por senha, chame a função `enablePasswordGrant` na função `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

```php
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::enablePasswordGrant();
    }
```

<a name="creating-a-password-grant-client"></a>
### Criando um cliente de autorização por senha

 Antes que seu aplicativo possa emitir tokens por meio da permissão de senha, você precisará criar um cliente de permissão de senha. Você pode fazer isso usando o comando do Artisan `passport:client` com a opção `--password`. **Se você já executou o comando `passport:install`, não é necessário executar este comando:**

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### Solicitar tokens

 Depois de criar um cliente de conceder uma senha, você poderá solicitar um token de acesso enviando uma solicitação `POST` para o endereço `/oauth/token` com o endereço de e-mail do usuário e sua senha. Lembramos que esse endereço já está registrado no Passport, então não é preciso definir ele manualmente. Se a solicitação for bem-sucedida, você receberá um `access_token` e um `refresh_token`, na resposta JSON do servidor:

```php
    use Illuminate\Support\Facades\Http;

    $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
        'grant_type' => 'password',
        'client_id' => 'client-id',
        'client_secret' => 'client-secret',
        'username' => 'taylor@laravel.com',
        'password' => 'my-password',
        'scope' => '',
    ]);

    return $response->json();
```

 > [!NOTA]
 [configure seu prazo máximo de validade do token de acesso (#configuration), se necessário.

<a name="requesting-all-scopes"></a>
### Pedido de todos os escopos

 Ao usar as autorizações de senha ou credenciais do cliente, talvez deseje autorizar o token para todas as áreas suportadas pelo seu aplicativo. Pode fazer isso solicitando a área `*`. Se solicitar a área `*` e chamar a método `can` na instância de token, ela sempre retornará como `true`. Esta área só pode ser atribuída a um token emitido com as autorizações de senha ou de credenciais do cliente:

```php
    use Illuminate\Support\Facades\Http;

    $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
        'grant_type' => 'password',
        'client_id' => 'client-id',
        'client_secret' => 'client-secret',
        'username' => 'taylor@laravel.com',
        'password' => 'my-password',
        'scope' => '*',
    ]);
```

<a name="customizing-the-user-provider"></a>
### Personalizar o provedor de autenticação do usuário

 Se o seu aplicativo usar mais de um [fornecedor de usuário de autenticação](/docs/authentication#introduction), poderá especificar qual fornecedor de usuários o cliente de concessão de senha vai utilizar ao criar o cliente através do comando `artisan passport:client --password`. A chave de um fornecedor válido definida na configuração do seu aplicativo em `config/auth.php` deve corresponder à nomeação especificada. Você pode, então, proteger a sua rota utilizando [middleware para garantir que apenas os usuários do provedor especificado serão autorizados.](#via-middleware)

<a name="customizing-the-username-field"></a>
### Personalizar o campo de nome do utilizador

 Ao efetuar autenticação utilizando a autorização por senha, o Passport utiliza o atributo `email` do seu modelo como "username". No entanto, você pode personalizar esse comportamento definindo um método `findForPassport` no seu modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Laravel\Passport\HasApiTokens;

    class User extends Authenticatable
    {
        use HasApiTokens, Notifiable;

        /**
         * Find the user instance for the given username.
         */
        public function findForPassport(string $username): User
        {
            return $this->where('username', $username)->first();
        }
    }
```

<a name="customizing-the-password-validation"></a>
### Personalizar a validação de senhas

 Quando você efetua autenticação utilizando o recurso conceder com senha, o Passport usa o atributo `password` do seu modelo para validar a senha fornecida. Se o seu modelo não tiver um atributo `password`, ou se você pretender personalizar a lógica de validação da senha, é possível definir um método `validateForPassportPasswordGrant` no seu modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Support\Facades\Hash;
    use Laravel\Passport\HasApiTokens;

    class User extends Authenticatable
    {
        use HasApiTokens, Notifiable;

        /**
         * Validate the password of the user for the Passport password grant.
         */
        public function validateForPassportPasswordGrant(string $password): bool
        {
            return Hash::check($password, $this->password);
        }
    }
```

<a name="implicit-grant-tokens"></a>
## Token de concessão implícita

 > [AVERTISSEMENT]
 [um tipo de subsídio recomendado atualmente pelo servidor OAuth2](https://oauth2.thephpleague.com/authorization-server/which-grant/).

 A concessão implícita é semelhante à concessão de códigos de autorização. No entanto, o token é enviado ao cliente sem a troca de um código de autorização. Essa concessão é mais comumente usada para aplicativos JavaScript ou móveis onde as credenciais do cliente não podem ser armazenadas de forma segura. Para ativar essa concessão, chame o método `enableImplicitGrant` na ordem `boot` da classe `App\Providers\AppServiceProvider` do aplicativo:

```php
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::enableImplicitGrant();
    }
```

 Uma vez ativada a concessão, os desenvolvedores podem usar seu ID de cliente para solicitar uma senha de acesso da sua aplicação. A aplicação consumidora deve fazer um pedido de redirecionamento para o endereço `/oauth/authorize` da sua aplicação como segue:

```php
    use Illuminate\Http\Request;

    Route::get('/redirect', function (Request $request) {
        $request->session()->put('state', $state = Str::random(40));

        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://third-party-app.com/callback',
            'response_type' => 'token',
            'scope' => '',
            'state' => $state,
            // 'prompt' => '', // "none", "consent", or "login"
        ]);

        return redirect('http://passport-app.test/oauth/authorize?'.$query);
    });
```

 > [!AVISO]
 > Lembre-se que a rota `//oauth/authorize` já é definida pelo Passport. Não é necessário defini-la manualmente.

<a name="client-credentials-grant-tokens"></a>
## Token de concessão de credenciais do cliente

 A credencial de cliente é adequada para autenticação de máquina para máquina. Por exemplo, você pode usar essa credencial em um trabalho agendado que esteja realizando tarefas de manutenção por meio de uma API.

 Antes que seu aplicativo possa emitir tokens através da autorização de credenciais do cliente, você precisará criar um cliente para a autorização de credenciais do cliente. Isso pode ser feito usando a opção `--client` do comando `passport:client`:

```shell
php artisan passport:client --client
```

 Em seguida, para usar esse tipo de concessão, registre um alias de middleware para o middleware `CheckClientCredentials`. Você pode definir os nomes de middleware na sua aplicação no arquivo bootstrap/app.php:

```php
    use Laravel\Passport\Http\Middleware\CheckClientCredentials;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'client' => CheckClientCredentials::class
        ]);
    })
```

 Em seguida, anexe o middleware a um caminho:

```php
    Route::get('/orders', function (Request $request) {
        ...
    })->middleware('client');
```

 Para restringir o acesso à rota a escopos específicos, você pode fornecer uma lista delimitada por vírgula dos escopos necessários ao anexar a middleware `client` à rota:

```php
    Route::get('/orders', function (Request $request) {
        ...
    })->middleware('client:check-status,your-scope');
```

<a name="retrieving-tokens"></a>
### Recuperando tokens

 Para recuperar um token usando este tipo de permissão, faça um pedido no ponto final `oauth/token`:

```php
    use Illuminate\Support\Facades\Http;

    $response = Http::asForm()->post('http://passport-app.test/oauth/token', [
        'grant_type' => 'client_credentials',
        'client_id' => 'client-id',
        'client_secret' => 'client-secret',
        'scope' => 'your-scope',
    ]);

    return $response->json()['access_token'];
```

<a name="personal-access-tokens"></a>
## Token de acesso pessoal

 Às vezes, os utilizadores podem querer emitir fichas de acesso para si próprios sem terem de seguir o fluxo habitual de reencaminhamento de códigos de autorização. Permitir que os utilizadores emitam fichas através da UI do aplicativo, pode ser útil para permitir aos utilizadores experimentar a API ou como uma abordagem mais simples ao emitir fichas de acesso em geral.

 > [!ATENÇÃO]
 [Laravel Sanctum](/docs/sanctum), a biblioteca própria ligeira da Laravel para emitir tokens de acesso à API.

<a name="creating-a-personal-access-client"></a>
### Criando um cliente de acesso pessoal

 Antes que seu aplicativo possa emitir tokens de acesso pessoais, você precisará criar um cliente de acesso pessoal. Você pode fazer isso executando o comando `passport:client` Artisan com a opção `--personal`. Se você já tiver executado o comando `passport:install`, não será necessário executar este comando:

```shell
php artisan passport:client --personal
```

 Depois de criar seu cliente de acesso pessoal, coloque o ID do cliente e o valor secreto em texto bruto no arquivo `.env` de sua aplicação:

```ini
PASSPORT_PERSONAL_ACCESS_CLIENT_ID="client-id-value"
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET="unhashed-client-secret-value"
```

<a name="managing-personal-access-tokens"></a>
### Gerenciar tokens de acesso pessoais

 Uma vez que criou um cliente de acesso pessoal, pode emitir tokens para um determinado utilizador usando o método `createToken` numa instância do modelo `App\Models\User`. O método `createToken` aceita como primeiro argumento o nome do token e um array opcional de [escopos](#token-scopes) como segundo argumento:

```php
    use App\Models\User;

    $user = User::find(1);

    // Creating a token without scopes...
    $token = $user->createToken('Token Name')->accessToken;

    // Creating a token with scopes...
    $token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="personal-access-tokens-json-api"></a>
#### API de JSON

 O Passport também inclui uma API JSON para gerenciar tokens de acesso pessoal. Você poderá combiná-la com sua própria interface gráfica para oferecer aos seus usuários um painel de controle para gerenciamento de tokens de acesso pessoais. A seguir, revisaremos todos os pontos finais da API para gerenciamento de tokens de acesso pessoal. Para conveniência, usar [Axios](https://github.com/mzabriskie/axios) para demonstrar requisições HTTP feitas nos pontos finais.

 A API JSON é protegida pelos middlewares `web` e `auth`, ou seja, somente pode ser chamada pelo seu próprio aplicativo, não por uma fonte externa.

<a name="get-oauthscopes"></a>
#### `GET /oauth/scopes`

 Esta rota retorna todas as [escopos (#escopos de tokens)](#escopos-de-tokens) definidas para sua aplicação. Você pode usar essa rota para listar os escopos que um usuário pode atribuir a um token pessoal de acesso:

```js
axios.get('/oauth/scopes')
    .then(response => {
        console.log(response.data);
    });
```

<a name="get-oauthpersonal-access-tokens"></a>
#### `GET /oauth/personal-access-tokens`

 Esta rota retorna todas as senhas de acesso pessoais que o usuário autenticado criou. Isto é principalmente útil para listar todos os tokens do usuário para que possam ser editados ou revogados:

```js
axios.get('/oauth/personal-access-tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthpersonal-access-tokens"></a>
#### POST /oauth/personal-access-tokens

 Esta opção cria novos tokens de acesso pessoais e requer duas informações: o nome do token e os `scopes` que devem ser atribuídos ao mesmo:

```js
const data = {
    name: 'Token Name',
    scopes: []
};

axios.post('/oauth/personal-access-tokens', data)
    .then(response => {
        console.log(response.data.accessToken);
    })
    .catch (response => {
        // List errors on response...
    });
```

<a name="delete-oauthpersonal-access-tokenstoken-id"></a>
#### `EXCLUIR /oauth/personal-access-tokens/{token-id}`

 Esta rota pode ser utilizada para revogar tokens de acesso pessoais:

```js
axios.delete('/oauth/personal-access-tokens/' + tokenId);
```

<a name="protecting-routes"></a>
## Proteger os itinerários

<a name="via-middleware"></a>
### Por meio do middleware

 O passport inclui um [guarda de autenticação](/docs/authentication#adding-custom-guards) que irá validar os tokens de acesso nas solicitações entrantes. Depois de configurado o guard `api` para usar o driver `passport`, você só precisa especificar a middleware `auth:api` em qualquer rota que exija um token de acesso válido:

```php
    Route::get('/user', function () {
        // ...
    })->middleware('auth:api');
```

 > [!AVISO]
 [Concessão de tokens de credenciais de clientes (#client-credentials-grant-tokens)], você deve usar

<a name="multiple-authentication-guards"></a>
#### Vigias de autenticação múltipla

 Se o seu aplicativo autenticar diferentes tipos de usuários que talvez utilizem modelos Eloquent totalmente diferentes, você precisará definir uma configuração de guarda para cada tipo de provedor de usuário em sua aplicação. Isto permite proteger requisições destinadas a provedores de usuário específicos. Por exemplo: dada a seguinte configuração de guardas no arquivo `config/auth.php`:

```php
    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],

    'api-customers' => [
        'driver' => 'passport',
        'provider' => 'customers',
    ],
```

 A seguinte rota utilizará a proteção `api-customers`, que usa o provedor de informações do usuário `customers`, para autenticar requisições recebidas:

```php
    Route::get('/customer', function () {
        // ...
    })->middleware('auth:api-customers');
```

 > [!NOTA]
 [Autorização da senha de documentação](#personalizar o provedor de usuário).

<a name="passing-the-access-token"></a>
### Passando o token de acesso

 Ao chamar rotas protegidas por Passport, os consumidores da API do seu aplicativo devem especificar o token de acesso como um `Bearer` no cabeçalho de `Authorization` do seu pedido. Por exemplo, quando se utiliza a biblioteca HTTP Guzzle:

```php
    use Illuminate\Support\Facades\Http;

    $response = Http::withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer '.$accessToken,
    ])->get('https://passport-app.test/api/user');

    return $response->json();
```

<a name="token-scopes"></a>
## Escopos dos tokens

 Escopos permitem que os clientes da sua API solicitem um conjunto específico de permissões ao requisitar autorização para aceder a uma conta. Por exemplo, se estiver a construir uma aplicação de comércio eletrónico, nem todos os consumidores da API necessitarão da capacidade de efetuar pedidos. Em vez disso, pode permitir que os consumidores apenas solicitem autorização para obterem o estado dos envio de encomendas. Em outras palavras, os escopos permitem aos utilizadores da sua aplicação limitar as ações que uma aplicação de terceiros pode efetuar em seu nome.

<a name="defining-scopes"></a>
### Definindo escopos

 Você pode definir os escopos da sua API usando o método `Passport::tokensCan` no método `boot` da classe `App\Providers\AppServiceProvider` de sua aplicação. O método `tokensCan` aceita um array com nomes e descrições dos escopos. A descrição do escopo pode ser qualquer coisa que você desejar e será exibida aos usuários na tela de aprovação da autorização:

```php
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::tokensCan([
            'place-orders' => 'Place orders',
            'check-status' => 'Check order status',
        ]);
    }
```

<a name="default-scope"></a>
### Escopo padrão

 Se um cliente não solicitar nenhum escopo específico, você pode configurar seu servidor Passport para anexar escopos padrão ao token utilizando o método `setDefaultScope`. Normalmente, é preciso chamar esse método a partir do método `boot` da classe `App\Providers\AppServiceProvider` de sua aplicação:

```php
    use Laravel\Passport\Passport;

    Passport::tokensCan([
        'place-orders' => 'Place orders',
        'check-status' => 'Check order status',
    ]);

    Passport::setDefaultScope([
        'check-status',
        'place-orders',
    ]);
```

 > [!NOTA]
 > Os escopos por padrão do passaporte não se aplicam a tokens de acesso pessoais gerados pelo próprio usuário.

<a name="assigning-scopes-to-tokens"></a>
### Atribuição de escopo a tokens

<a name="when-requesting-authorization-codes"></a>
#### Ao solicitar códigos de autorização

 Quando for solicitar um token de acesso utilizando o método de autorização com código, os consumidores devem especificar suas áreas de aplicação desejadas como parâmetro de consulta `scope`. O parâmetro `scope` deve ser uma lista separada por espaços de áreas de aplicação:

```php
    Route::get('/redirect', function () {
        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://example.com/callback',
            'response_type' => 'code',
            'scope' => 'place-orders check-status',
        ]);

        return redirect('http://passport-app.test/oauth/authorize?'.$query);
    });
```

<a name="when-issuing-personal-access-tokens"></a>
#### Ao emitir tokens de acesso pessoais

 Se você estiver emitindo tokens de acesso pessoais usando o método `createToken` do modelo `App\Models\User`, poderá passar um array com os escopos desejados como segundo argumento ao método:

```php
    $token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="checking-scopes"></a>
### Verificando Escopos

 O Passport inclui dois middlewares que podem ser utilizados para verificar se um pedido recebido é autenticado com um token a quem foi concedida uma determinada abrangência. Para começar, defina os seguintes alias de middleware no ficheiro `bootstrap/app.php` do seu aplicativo:

```php
    use Laravel\Passport\Http\Middleware\CheckForAnyScope;
    use Laravel\Passport\Http\Middleware\CheckScopes;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'scopes' => CheckScopes::class,
            'scope' => CheckForAnyScope::class,
        ]);
    })
```

<a name="check-for-all-scopes"></a>
#### Ver para todos os escopos

 O middleware de escopo pode ser designado para uma rota, para verificar se o token de acesso da solicitação de entrada tem todos os escopos listados:

```php
    Route::get('/orders', function () {
        // Access token has both "check-status" and "place-orders" scopes...
    })->middleware(['auth:api', 'scopes:check-status,place-orders']);
```

<a name="check-for-any-scopes"></a>
#### Procure por quaisquer escopos

 O middleware `scope` pode ser atribuído a uma rota para verificar se o token de acesso do pedido recebido tem por *pelo menos um* dos escopos listados:

```php
    Route::get('/orders', function () {
        // Access token has either "check-status" or "place-orders" scope...
    })->middleware(['auth:api', 'scope:check-status,place-orders']);
```

<a name="checking-scopes-on-a-token-instance"></a>
#### Verificação dos escopos de uma instância de token

 Depois que uma requisição autenticada com o token de acesso entrar em sua aplicação, você poderá verificar se o token possui um determinado escopo usando o método `tokenCan` da instância de `App\Models\User`, autenticada:

```php
    use Illuminate\Http\Request;

    Route::get('/orders', function (Request $request) {
        if ($request->user()->tokenCan('place-orders')) {
            // ...
        }
    });
```

<a name="additional-scope-methods"></a>
#### Métodos adicionais do escopo

 O método `scopeIds` retornará um array de todos os nomes/IDs definidos:

```php
    use Laravel\Passport\Passport;

    Passport::scopeIds();
```

 O método `scopes` retornará uma matriz com todos os escopos definidos como instâncias do `Laravel\Passport\Scope`.

```php
    Passport::scopes();
```

 O método `scopesFor` irá retornar um array de instâncias do tipo `Laravel\Passport\Scope` que correspondam às IDs/nomes fornecidos:

```php
    Passport::scopesFor(['place-orders', 'check-status']);
```

 Você pode determinar se um escopo específico foi definido usando o método `hasScope`:

```php
    Passport::hasScope('place-orders');
```

<a name="consuming-your-api-with-javascript"></a>
## Usando seu API com JavaScript

 No momento em que você está construindo uma API, poder consumi-la na sua aplicação JavaScript pode ser extremamente útil. Esta abordagem de desenvolvimento da API permite que a própria aplicação consuma a mesma API compartilhada com o mundo. A mesma API pode ser consumida pela web application, por aplicações móveis, aplicações de terceiros e por quaisquer SDKs que você publique em vários gestores de pacotes.

 Normalmente, se pretender consumir a sua API na sua aplicação JavaScript, terá de enviar manualmente um token de acesso para a aplicação e passá-lo com cada pedido à sua aplicação. No entanto, o Passport inclui um middleware que lhe permite fazer isto automaticamente. Tudo o que precisa é adicionar o middleware `CreateFreshApiToken` ao grupo de middlewares `web`, no arquivo `bootstrap/app.php` da sua aplicação:

```php
    use Laravel\Passport\Http\Middleware\CreateFreshApiToken;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            CreateFreshApiToken::class,
        ]);
    })
```

 > [Atenção]
 > Você deve garantir que a middleware `CreateFreshApiToken` esteja na última posição da pilha de middlewares.

 Este middleware irá associar uma cookie "laravel_token" às suas respostas. Essa cookie contém um JWT encriptado que o Passport usará para autenticar os pedidos da sua aplicação JavaScript API. O tempo de validade do JWT é igual ao valor da configuração `session.lifetime`. Desta forma, uma vez enviada a cookie com todos os pedidos subseqüentes, poderá enviar pedidos à API sem fornecer explicitamente um token de acesso:

```js
    axios.get('/api/user')
        .then(response => {
            console.log(response.data);
        });
```

<a name="customizing-the-cookie-name"></a>
#### Personalização do Nome de Cookies

 Se necessário, pode personalizar o nome da cookie "laravel_token" utilizando a função `Passport::cookie`. Normalmente, esta função deve ser chamada a partir do método `boot` na classe "App\Providers\AppServiceProvider" da sua aplicação:

```php
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::cookie('custom_name');
    }
```

<a name="csrf-protection"></a>
#### Proteção contra ataques de tipo CSRF

 Para usar este método de autenticação, você precisa garantir que o cabeçalho do token CSRF seja incluído em suas solicitações. O scaffolding padrão de JavaScript do Laravel inclui uma instância da Axios, que usará automaticamente o valor encriptado do cookie `XSRF-TOKEN` para enviar um cabeçalho `X-XSRF-TOKEN` nas solicitações com origem igual.

 > [!ATENÇÃO]
 > Se escolher enviar o cabeçalho `X-CSRF-TOKEN` em vez do `X-XSRF-TOKEN`, precisará usar o token não encriptado fornecido pelo método `csrf_token()`.

<a name="events"></a>
## Eventos

 O Passport gera eventos ao emitir token de acesso e tokens recarregáveis. Você pode ouvir esses eventos para eliminar ou revogar outros tokens de acesso em sua base de dados:

|  Nome do evento |
|-------------|
|  `Laravel\Passport\Eventos\AcessoTokensCriados` |
|  `Laravel\Passport\Eventos\RefreshTokenCriado` |

<a name="testing"></a>
## Teste

 O método `actingAs` do Passport permite especificar o usuário atualmente autenticado, além de seus escopos. O primeiro argumento fornecido ao método `actingAs` é a instância de usuário e o segundo é uma matriz de escopos que devem ser concedidos pelo token do usuário:

```php tab=Pest
use App\Models\User;
use Laravel\Passport\Passport;

test('servers can be created', function () {
    Passport::actingAs(
        User::factory()->create(),
        ['create-servers']
    );

    $response = $this->post('/api/create-server');

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Passport\Passport;

public function test_servers_can_be_created(): void
{
    Passport::actingAs(
        User::factory()->create(),
        ['create-servers']
    );

    $response = $this->post('/api/create-server');

    $response->assertStatus(201);
}
```

 O método `actingAsClient` do Passport pode ser utilizado para especificar o cliente atualmente autenticado, bem como os seus escopos. O primeiro argumento fornecido ao método `actingAsClient` é a instância de cliente e o segundo é um array de escopos que devem ser concedidos no token do cliente:

```php tab=Pest
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

test('orders can be retrieved', function () {
    Passport::actingAsClient(
        Client::factory()->create(),
        ['check-status']
    );

    $response = $this->get('/api/orders');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

public function test_orders_can_be_retrieved(): void
{
    Passport::actingAsClient(
        Client::factory()->create(),
        ['check-status']
    );

    $response = $this->get('/api/orders');

    $response->assertStatus(200);
}
```
