# Laravel Passport

<a name="introduction"></a>
## Introdução

O [Laravel Passport](https://github.com/laravel/passport) fornece uma implementação completa de servidor OAuth2 para sua aplicação Laravel em poucos minutos. O Passport é construído sobre o [servidor OAuth2 da Liga](https://github.com/thephpleague/oauth2-server), que é mantido por Andy Millington e Simon Hamp.

> [AVERTÊNCIA]
> Esta documentação assume que você já está familiarizado com o OAuth2. Se você não sabe nada sobre o OAuth2, considere se familiarizar com os termos e características gerais do OAuth2 antes de continuar.

<a name="passport-or-sanctum"></a>
### Passaporte ou Santuário?

Antes de começar, você pode querer determinar se seu aplicativo seria melhor atendido pelo Laravel Passport ou o Laravel Sanctum. Se seu aplicativo precisar absolutamente suportar o OAuth 2.0, então você deve usar Laravel Passport.

Contudo, se você está tentando autenticar uma aplicação de página única ou um aplicativo móvel ou emitir tokens API, você deve usar o [Laravel Sanctum] /docs/sanctum). Laravel Sanctum não suporta OAuth2; no entanto, ele fornece uma experiência de desenvolvimento de autenticação de API muito mais simples.

<a name="installation"></a>
## Instalação

Você pode instalar o Laravel Passport via o comando `install:api`:

```shell
php artisan install:api --passport
```

Este comando publicará e executará as migrações de banco de dados necessárias para criar as tabelas que seu aplicativo precisa armazenar clientes do OAuth2 e tokens de acesso. O comando também criará as chaves de criptografia necessárias para gerar tokens de acesso seguros.

Além disso, este comando irá perguntar se você gostaria de usar UUIDs como o valor da chave primária do modelo `Client` do Passport em vez dos inteiros incrementados automaticamente.

Depois de executar o comando 'install:api', adicione a traço 'Laravel\Passport\HasApiTokens' para o seu modelo 'App\Models\User'. Esta classe terá alguns métodos auxiliares que permitem inspecionar os tokens e escopos do usuário autenticado.

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

Finalmente, no arquivo de configuração 'config/auth.php' do seu aplicativo, você deve definir um guarda de autenticação 'api' e definir a opção 'driver' para 'passport'. Isso instruirá o seu aplicativo a usar o 'TokenGuard' do Passport ao autenticar as solicitações da API:

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
### Implementando o Passaporte

Ao implantar o Passport nos servidores da sua aplicação pela primeira vez, você provavelmente precisará executar o comando `passport:keys`. Este comando gera as chaves de criptografia que o Passport necessita para gerar os tokens de acesso. As chaves geradas não são tipicamente mantidas no controle de fonte:

```shell
php artisan passport:keys
```

Se necessário, você pode definir o caminho onde as chaves do Passport devem ser carregadas. Você pode usar o método `Passport::loadKeysFrom` para fazer isso. Normalmente, esse método deve ser chamado do método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo.

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
#### Carregando Chaves do Ambiente

Alternativamente você pode publicar o arquivo de configuração do Passport usando o comando `vendor:publish`:

```shell
php artisan vendor:publish --tag=passport-config
```

Depois que o arquivo de configuração tem sido publicado, você pode carregar suas chaves de criptografia da aplicação definindo-as como variáveis de ambiente:

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a name="upgrading-passport"></a>
### Aumentar Passaporte

Ao atualizar para uma nova versão principal do Passport é importante que você revise cuidadosamente o [guia de atualização](https://github.com/laravel/passport/blob/master/UPGRADE.md).

<a name="configuration"></a>
## Configuração

<a name="client-secret-hashing"></a>
### Hashing de Cliente Secreto

Se você deseja que os segredos do cliente sejam criptografados quando armazenados em seu banco de dados, você deve chamar o método `Passport::hashClientSecrets` no método `boot` da classe `App\Providers\AppServiceProvider`:

```php
    use Laravel\Passport\Passport;

    Passport::hashClientSecrets();
```

Uma vez habilitado, todos os seus segredos do cliente só serão visíveis ao usuário imediatamente após sua criação. Como o valor da chave secreta do cliente nunca é armazenado no banco de dados, não é possível recuperar o valor secreto se ele for perdido.

<a name="token-lifetimes"></a>
### Tempo de vida do token

Por padrão, o Passport emite tokens de acesso de longa duração que expiram após um ano. Se você gostaria de configurar uma vida mais longa ou mais curta para os seus tokens, você pode usar os métodos tokensExpireIn , refreshTokensExpireIn e personalAccessTokensExpireIn . Esses métodos devem ser chamados do método boot da classe AppServiceProvider de sua aplicação:

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

> [AVERTÊNCIA]
> As colunas "expires_at" das tabelas de banco de dados do Passport são somente leitura e para fins de exibição somente. Quando os tokens são emitidos, o Passport armazena as informações de expiração dentro dos tokens assinados e criptografados. Se você precisar invalidar um token você deve [revogá-lo](#revogando-tokens).

<a name="overriding-default-models"></a>
### Substituindo modelos padrão

Você está livre para estender os modelos usados internamente pelo Passport, definindo seu próprio modelo e estendendo o modelo correspondente do Passport:

```php
    use Laravel\Passport\Client as PassportClient;

    class Client extends PassportClient
    {
        // ...
    }
```

Depois de definir seu modelo, você pode instruir o Passport a usar seu modelo personalizado via a classe Laravel\Passport\Passport. Tipicamente, você deve informar ao Passport sobre seus modelos personalizados no método de inicialização da classe AppServiceProvider da sua aplicação:

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
### Rotas de Sobrescrita

Às vezes você pode querer personalizar as rotas definidas pelo Passport. Para conseguir isso, você precisa primeiro ignorar as rotas registradas pelo Passport adicionando 'Passport::ignoreRoutes' ao método 'register' do seu serviço 'AppServiceProvider':

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

Então, você pode copiar as rotas definidas pelo Passport em [seu arquivo de rotas](https://github.com/laravel/passport/blob/11.x/routes/web.php) para o seu arquivo `routes/web.php` da aplicação e modificá-las como quiser:

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
## Emissão de Tokens de Acesso

Usando o OAuth2 através de códigos de autorização é como a maioria dos desenvolvedores está acostumada com o OAuth2. Ao usar os códigos de autorização, um aplicativo cliente redirecionará um usuário para o servidor onde eles serão aprovados ou negados a solicitação de emitir um token de acesso para o cliente.

<a name="managing-clients"></a>
### Gerenciando Clientes

Primeiro, os desenvolvedores que construam aplicações que precisam interagir com sua API precisarão se registrar em sua aplicação criando um "cliente". Normalmente isso consiste em fornecer o nome de sua aplicação e uma URL para qual sua aplicação pode redirecionar usuários depois de eles aprovarem suas solicitações de autorização.

<a name="the-passportclient-command"></a>
#### O comando `passaporte: cliente`

A forma mais simples de criar um cliente é usando o comando Artisan do `passport:client`. Este comando pode ser usado para criar seus próprios clientes para testar sua funcionalidade OAuth2. Quando você executar o comando `client`, o Passport irá solicitar mais informações sobre seu cliente e fornecerá uma ID e segredo do cliente:

```shell
php artisan passport:client
```

Redirecionar URLs

Se você deseja permitir várias URLs de redirecionamento para seu cliente, você pode especificá-las usando uma lista delimitada por vírgulas quando solicitado pela URL pelo comando 'passaporte: cliente'. Qualquer URL que contenha vírgulas deve ser codificada em URL:

```shell
http://example.com/callback,http://examplefoo.com/callback
```

<a name="clients-json-api"></a>
#### API JSON

Como os usuários do seu aplicativo não poderão utilizar o comando 'client', o Passport fornece uma API JSON que você pode usar para criar clientes. Isso evita ter que codificar manualmente controladores para criação, atualização e exclusão de clientes.

Porém, você precisará emparelhar a API JSON do Passport com sua própria interface de usuário para fornecer um painel aos seus usuários que gerenciam seus clientes. Abaixo, revisaremos todos os pontos finais da API para gerenciar clientes. Para conveniência, usaremos [Axios](https://github.com/axios/axios) para demonstrar fazer solicitações HTTP aos pontos finais.

A API JSON é protegida pelo `web` e `auth` middleware; portanto, só pode ser chamada a partir do seu próprio aplicativo. Não é capaz de ser chamada por uma fonte externa.

<a name="get-oauthclients"></a>
#### GET /oauth/clients

Esta rota retorna todos os clientes para o usuário autenticado. Isso é útil principalmente para listar todos os clientes do usuário de modo que eles possam ser modificados ou excluídos:

```js
axios.get('/oauth/clients')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthclients"></a>
#### `POST /oauth/clients`

Esta rota é usada para criar novos clientes. Ela necessita de dois dados: o nome do cliente e uma URL de redirecionamento. A URL de redirecionamento é onde o usuário será direcionado após aprovar ou negar um pedido de autorização.

Quando um cliente é criado, ele receberá um Client ID e Client Secret. Esses valores serão usados ao solicitar tokens de acesso do seu aplicativo. A rota de criação de clientes retornará a nova instância de cliente:

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
#### PUT /oauth/clients/{client-id}

Este caminho é usado para atualizar clientes. Requer dois dados: o nome do cliente e uma URL de redirecionamento. A URL de redirecionamento é onde o usuário será redirecionado após aprovar ou negar um pedido de autorização. O caminho retornará a instância do cliente atualizado:

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
#### "DELETE /oauth/clients/{client-id}"

Essa rota é usada para excluir clientes:

```js
axios.delete('/oauth/clients/' + clientId)
    .then(response => {
        // ...
    });
```

<a name="requesting-tokens"></a>
### Solicitando Token

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### Redirecionando para Autorização

Uma vez que o cliente foi criado os desenvolvedores podem usar seu ID do cliente e segredo para solicitar um código de autorização e um token de acesso do aplicativo. Primeiro, o aplicativo consumidor deve fazer uma solicitação de redirecionamento ao aplicativo' s `/oauth/authorize` rota como assim:

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

O parâmetro `prompt` pode ser usado para especificar o comportamento de autenticação do aplicativo Passport.

Se o valor do "prompt" for "none", o Passport irá sempre lançar um erro de autenticação se o usuário não estiver já autenticado com a aplicação do Passport. Se o valor for "consent", o Passport sempre mostrará a tela de aprovação da autorização, mesmo que todos os escopos já tenham sido concedidos à aplicação consumidora. Quando o valor é "login", o aplicativo do Passport irá sempre pedir ao usuário para re-entrar na aplicação, mesmo que ele já tenha uma sessão existente.

Se não houver nenhum valor 'prompt' fornecido, o usuário será solicitado a autorização apenas se ele não tiver previamente autorizado acesso ao aplicativo consumidor para os escopos solicitados.

> Nota:
> Lembre-se, a rota `/oauth/authorize` já está definida pelo Passport. Você não precisa definir essa rota manualmente.

<a name="approving-the-request"></a>
#### Aprovar o pedido

Quando os pedidos de autorização são recebidos, o Passport responderá automaticamente com base no valor do parâmetro "prompt" (se presente) e pode exibir um modelo para o usuário permitindo-lhes aprovar ou negar a solicitação de autorização. Se eles aprovam o pedido, serão redirecionados de volta para o 'redirect_uri' que foi especificado pelo aplicativo consumidor. O 'redirect_uri' deve corresponder à URL "redirect" especificada quando o cliente foi criado.

Se você gostaria de personalizar a tela de aprovação do processo de autorização, você pode publicar os modelos usando o comando 'vendor:publish' Artisan. Os modelos publicados serão colocados na pasta 'resources/views/vendor/passport':

```shell
php artisan vendor:publish --tag=passport-views
```

Às vezes você pode querer pular a solicitação de autorização, como quando autorizando um cliente de primeira parte. Você pode conseguir isso [extendendo o modelo 'Cliente'](#substituindo-modelos-padrão) e definindo um método 'pulaAutorização'. Se o método 'pulaAutorização' retornar 'true', o cliente será aprovado e o usuário será redirecionado para a 'redirect_uri' imediatamente, a não ser que o aplicativo consumidor tenha definido explicitamente o parâmetro 'prompt' ao redirecionar para autorização:

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
#### Conversão de Códigos de Autorização em Token de Acesso

Se o usuário aprovar a solicitação de autorização, ele será redirecionado para a aplicação consumidora. A aplicação deve primeiro verificar o parâmetro 'state' contra o valor que foi armazenado antes do redirecionamento. Se os valores corresponderem, a aplicação deve enviar um pedido 'POST' à sua aplicação para solicitar um token de acesso. O pedido deve incluir o código de autorização que foi emitido pela sua aplicação quando o usuário aprovou a solicitação de autorização:

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

Essa rota ` /oauth/token` retornará uma resposta JSON contendo os atributos `access_token`, `refresh_token` e `expires_in`. O atributo `expires_in` contém o número de segundos até que o token acesse expire.

> [NOTE]
> Assim como a rota '/oauth/authorize', a rota '/oauth/token' é definida para você pelo Passport. Não há necessidade de definir essa rota manualmente.

<a name="tokens-json-api"></a>
#### API JSON

O Passport também inclui uma API JSON para gerenciar tokens de acesso autorizados. Você pode combiná-lo com seu próprio front-end para oferecer a seus usuários um painel para gerenciar os tokens de acesso. Para fins de conveniência, usaremos o [Axios](https://github.com/mzabriskie/axios) para demonstrar como fazer solicitações HTTP aos pontos finais. A API JSON é protegida pelo middleware `web` e `auth`; portanto, ela só pode ser chamada de seu próprio aplicativo.

<a name="get-oauthtokens"></a>
#### GET /oauth/tokens

Esta rota retorna todos os tokens de acesso autorizados que o usuário autenticado criou. Isto é principalmente útil para listar todos os tokens do usuário a fim de revogá-los:

```js
axios.get('/oauth/tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="delete-oauthtokenstoken-id"></a>
#### "DELETE /oauth/tokens/{token-id}"

Esta rota pode ser usada para revogar tokens de acesso autorizados e seus tokens de atualização relacionados:

```js
axios.delete('/oauth/tokens/' + tokenId);
```

<a name="refreshing-tokens"></a>
### Tokens Refrescantes

Se seu aplicativo emite tokens de acesso com vida curta, os usuários precisarão atualizar seus tokens de acesso usando o refresh token que foi fornecido a eles quando o token de acesso foi emitido:

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

Esta rota ' / oauth / token ' retornará uma resposta JSON contendo os atributos ' access_token', ' refresh_token' e 'expires_in '. O atributo 'expires_in' contém o número de segundos até que o acesso ao token expire.

<a name="revoking-tokens"></a>
### Revogando Tokens

Você pode revogar um token usando o método `revokeAccessToken` no `Laravel\Passport\TokenRepository`. Você pode revogar os tokens de atualização do token usando o método `revokeRefreshTokensByAccessTokenId` no `Laravel\Passport\RefreshTokenRepository`. Essas classes podem ser resolvidas usando o [container de serviço](docs/container) do Laravel.

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
### Tokens de purgação

Quando os tokens têm sido revogados ou expirados, você pode querer limpá-los do banco de dados. O comando `passport:purge` do Artisan do Passport pode fazer isso para você:

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

Você também pode configurar um [trabalho agendado]( /docs/scheduling ) em seu arquivo `routes/console.php` para podar automaticamente seus tokens de acordo com um cronograma:

```php
    use Laravel\Support\Facades\Schedule;

    Schedule::command('passport:purge')->hourly();
```

<a name="code-grant-pkce"></a>
## Autorização de Código de Concessão com PKCE

A autorização de código com "Proof Key para troca de código" (PKCE) é uma maneira segura de autenticar aplicativos da página única ou aplicativos nativos para acessar sua API. Este tipo de concessão deve ser usado quando você não pode garantir que o segredo do cliente será armazenado de forma confidencial ou na ordem de mitigar a ameaça de ter o código de autorização interceptado por um invasor. Uma combinação de um "verificador de código" e um "desafio de código" substitui o segredo do cliente ao trocar o código de autorização por um token de acesso.

<a name="creating-a-auth-pkce-grant-client"></a>
### Criando o Cliente

Antes de que seu aplicativo possa emitir tokens via o acesso do código de autorização com PKCE, você precisará criar um cliente habilitado para PKCE. Você pode fazer isso usando o comando Artisan 'passport: client' com a opção ' -- public':

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### Solicitando Tokens

<a name="code-verifier-code-challenge"></a>
#### Verificador de Código e Desafio de Código

Como essa autorização não fornece um segredo do cliente, os desenvolvedores precisarão gerar uma combinação de verificador de código e desafio de código para solicitar um token.

O verificador de código deve ser uma string aleatória de entre 43 e 128 caracteres contendo letras, números e os caracteres "-" , "." , "_" e "~" conforme especificado na [RFC 7636](https://tools.ietf.org/html/rfc7636).

O desafio do código deve ser uma string codificada em base 64 com caracteres seguros para URL e nome de arquivo. Os caracteres '=' final devem ser removidos e não devem haver quebras de linha, espaços em branco ou outros caracteres adicionais.

```php
    $encoded = base64_encode(hash('sha256', $code_verifier, true));

    $codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>
#### Redirecionando para Autorização

Uma vez que o cliente foi criado, você pode usar o ID do cliente e o verificador de código gerado e desafio de código para solicitar um código de autorização e token de acesso do seu aplicativo. Primeiro, o aplicativo consumidor deve fazer uma solicitação de redirecionamento para a rota `/oauth/authorize` do seu aplicativo:

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
#### Conversão de Código de Autorização para Token de Acesso

Se o usuário aprovar a solicitação de autorização, ele será redirecionado para o aplicativo consumidor. O consumidor deve verificar o parâmetro `state` em relação ao valor que foi armazenado antes do redirecionamento, conforme no padrão de concessão de código de autorização.

Se o parâmetro do estado corresponder, o consumidor deve fazer uma solicitação "POST" ao seu aplicativo para solicitar um token de acesso. A solicitação deve incluir o código de autorização que foi emitido pelo seu aplicativo quando o usuário aprovou a solicitação de autorização, juntamente com o verificador de código gerado originalmente:

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
## Tokens de Concessão de Senha

> [AVISO]
> Não recomendamos mais a utilização de tokens de autorização. Em vez disso, você deve escolher [um tipo de concessão que atualmente é recomendado por um servidor OAuth2](https://oauth2.thephpleague.com/authorization-server/which-grant/).

A concessão de senha do OAuth2 permite que seus outros clientes de primeira parte, como um aplicativo móvel, obtenham um token de acesso usando um endereço de e-mail / nome de usuário e senha. Isso permite que você emita tokens de acesso com segurança para seus clientes de primeira parte sem exigir que os usuários passem pelo processo completo de redirecionamento do código de autorização do OAuth2

Para permitir o acesso por senha, chame o método `enablePasswordGrant` no método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo.

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
### Criando um Cliente de Concessão de Senha

Antes que sua aplicação possa emitir tokens via o grant de senha, você precisará criar um cliente de grant de senha. Você pode fazer isso usando o comando Artisan 'passport:client' com a opção "--password". **Se você já executou o comando "passport:install", você não precisa executar este comando:**

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### Solicitando Tokens

Uma vez criado um cliente de concessão de senha, você pode solicitar um token de acesso fazendo um pedido de POST para a rota /oauth/token com o endereço de email e senha do usuário. Tenha em mente que essa rota já está registrada pelo Passport então não é preciso defini-la manualmente. Se o pedido for bem sucedido, você receberá um 'access_token' e um 'refresh_token' na resposta JSON do servidor:

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

> !Nota!
> Lembre-se, os tokens de acesso duram muito por padrão. No entanto, você está livre para [configurar o tempo máximo de vida do token de acesso](#configuração) se necessário.

<a name="requesting-all-scopes"></a>
### Solicitando todos os escopos

Ao usar o token ou o cliente de credenciais de autorização, você pode querer autorizar o token para todos os escopos suportados pelo seu aplicativo. Você pode fazer isso solicitando o escopo `*`. Se você solicitar o escopo `*`, o método `can` da instância do token sempre retornará `true`. Este escopo só pode ser atribuído a um token que é emitido usando o `password` ou `client_credentials` de autorização:

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
### Personalizando o Fornecedor de Usuário

Se sua aplicação usa mais do que um [fornecedor de usuário autenticação](/docs/authentication#introduction), você pode especificar qual fornecedor de usuário o cliente de concessão de senha usa, fornecendo uma opção `--provider` ao criar o cliente via comando `artisan passport:client --password`. O nome do provedor dado deve corresponder a um provedor válido definido no arquivo de configuração `config/auth.php` da sua aplicação. Você pode então [proteger sua rota usando middleware](#via-middleware) para garantir que apenas usuários do provedor especificado pelo guard estejam autorizados.

<a name="customizing-the-username-field"></a>
### Personalizando o campo de Nome de Usuário

Ao autenticar usando o método de "password", o Passport usará o atributo 'email' do seu modelo autenticável como o "usuário". Contudo, você pode personalizar esse comportamento definindo um método `findForPassport` no seu modelo.

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
### Personalizando a Validação da Senha

Ao usar o "grant" de senha para autenticação, o Passport usará o atributo 'senha' do seu modelo para validar a senha fornecida. Se o seu modelo não tiver um atributo 'senha' ou se você quiser personalizar a lógica de validação da senha, você pode definir um método `validateForPassportPasswordGrant` no seu modelo:

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
## Tokens de Subordinação

> (!AVISO)
> Nós não recomendamos mais usar tokens de concessão implícita. Em vez disso, você deve escolher [um tipo de concessão que é atualmente recomendado pelo servidor OAuth2](https://oauth2.thephpleague.com/authorization-server/which-grant/).

O implicit é similar ao authorization code; porém, o token é retornado para o cliente sem a troca de um código de autorização. Esse tipo de permissão é comumente usado em aplicações JavaScript ou móveis onde as credenciais do cliente não podem ser armazenadas com segurança. Para habilitar essa permissão, chame o método `enableImplicitGrant` no método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo.

```php
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::enableImplicitGrant();
    }
```

Uma vez que o subsídio tenha sido ativado, os desenvolvedores podem usar sua ID de cliente para solicitar um token de acesso do seu aplicativo. O aplicativo consumidor deve fazer uma solicitação de redirecionamento para a rota `/oauth/authorize` do seu aplicativo:

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

> Nota!
> Lembre-se, a rota `/oauth/authorize` já está definida pelo Passport. Você não precisa definir esta rota manualmente.

<a name="client-credentials-grant-tokens"></a>
## Tokens de Concessão de Credenciais do Cliente

O acesso de credenciais do cliente é adequado para a autenticação de máquina-a-máquina. Por exemplo, você pode usar este acesso em um trabalho agendado que está realizando tarefas de manutenção sobre uma API.

Antes de sua aplicação poder emitir tokens por meio da concessão de credenciais do cliente, você precisará criar um cliente de concessão de credenciais do cliente. Você pode fazer isso usando a opção `--client` do comando `passport:client` Artisan

```shell
php artisan passport:client --client
```

Em seguida, para usar este tipo de subvenção, registre um alias do middleware para o 'CheckClientCredentials' middleware. Você pode definir aliases do middleware no seu arquivo "bootstrap/app.php" do aplicativo:

```php
    use Laravel\Passport\Http\Middleware\CheckClientCredentials;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'client' => CheckClientCredentials::class
        ]);
    })
```

Depois de ter anexado o middleware a um trajeto:

```php
    Route::get('/orders', function (Request $request) {
        ...
    })->middleware('client');
```

Para restringir o acesso ao caminho para escopos específicos, você pode fornecer uma lista delimitada por vírgulas dos escopos necessários ao anexar o middleware 'cliente' ao caminho:

```php
    Route::get('/orders', function (Request $request) {
        ...
    })->middleware('client:check-status,your-scope');
```

<a name="retrieving-tokens"></a>
### Recuperando Tokens

Para recuperar um token usando este tipo de concessão, faça uma solicitação ao ponto final `oauth/token`:

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
## Tokens de Acesso Pessoal

Às vezes, seus usuários podem querer emitir tokens de acesso para si mesmos sem passar pela etapa típica de redirecionamento do código de autorização. Permitir que os usuários emitem tokens para si mesmos via a interface do seu aplicativo pode ser útil para permitir que os usuários experimentem sua API ou pode servir como uma abordagem mais simples para emitir tokens de acesso em geral.

> [NOTA!
> Se o seu aplicativo usa principalmente o Passport para emitir tokens de acesso pessoal, considere usar [Laravel Sanctum](/docs/sanctum), a biblioteca de primeira parte leve do Laravel para emitir tokens de acesso da API.

<a name="creating-a-personal-access-client"></a>
### Criando um Cliente de Acesso Pessoal

Antes de sua aplicação poder gerar tokens de acesso pessoais, você precisará criar um cliente de acesso pessoal. Você pode fazer isso executando o comando Artisan "passport:client" com a opção "--personal". Se você já executou o comando "passport:install", você não precisa executar este comando.

```shell
php artisan passport:client --personal
```

Depois de criar o seu cliente de acesso pessoal, coloque o ID do cliente e o valor secreto em texto simples no arquivo `.env` da sua aplicação:

```ini
PASSPORT_PERSONAL_ACCESS_CLIENT_ID="client-id-value"
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET="unhashed-client-secret-value"
```

<a name="managing-personal-access-tokens"></a>
### Gerenciando tokens de acesso pessoal

Uma vez que você tenha criado um cliente de acesso pessoal, você pode emitir tokens para um usuário dado usando o método `createToken` na instância do modelo 'App\Models\User'. O método `createToken` aceita o nome do token como seu primeiro argumento e uma matriz opcional [scopes](#token-scopes) como seu segundo argumento:

```php
    use App\Models\User;

    $user = User::find(1);

    // Creating a token without scopes...
    $token = $user->createToken('Token Name')->accessToken;

    // Creating a token with scopes...
    $token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="personal-access-tokens-json-api"></a>
#### API JSON

O Passport também inclui uma API JSON para gerenciar tokens de acesso pessoal. Você pode combinar isso com o seu próprio frontend para oferecer aos seus usuários um painel para gerenciar tokens de acesso pessoal. Abaixo, revisaremos todos os pontos finais da API para gerenciar tokens de acesso pessoal. Para conveniência, usaremos [Axios](https://github.com/mzabriskie/axios) para demonstrar a realização de solicitações HTTP para os pontos finais.

A API JSON é protegida por middleware 'web' e 'auth'; portanto, só pode ser chamada de sua própria aplicação. Não é capaz de ser chamada de uma fonte externa.

<a name="get-oauthscopes"></a>
#### 'GET /oauth/scopes'

Esta rota retorna todos os [escopos](#token-scopes) definidos para o seu aplicativo. Você pode usar esta rota para listar escopos que um usuário possa atribuir a um token de acesso pessoal:

```js
axios.get('/oauth/scopes')
    .then(response => {
        console.log(response.data);
    });
```

<a name="get-oauthpersonal-access-tokens"></a>
#### 'GET /oauth/personal-access-tokens'

Esta rota retorna todos os tokens de acesso pessoal que o usuário autenticado criou. Isso é principalmente útil para listar todos os tokens do usuário, a fim de editá-los ou revogá-los:

```js
axios.get('/oauth/personal-access-tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthpersonal-access-tokens"></a>
#### 'POST /oauth/personal-access-tokens'

Esta rota cria novos tokens de acesso pessoais. Exige dois pedaços de dados: o nome do token e os escopos que devem ser atribuídos ao token.

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
#### 'DELETE /oauth/personal-access-tokens/{token-id}'

Essa rota pode ser usada para cancelar tokens de acesso pessoal:

```js
axios.delete('/oauth/personal-access-tokens/' + tokenId);
```

<a name="protecting-routes"></a>
## Proteção de Rotas

<a name="via-middleware"></a>
### Via Middleware

O Passaporte inclui um [guarda de autenticação](/docs/autenticação#adicionando-guardas-personalizados) que irá validar tokens de acesso em solicitações recebidas. Uma vez configurado o guarda 'api' para usar o driver 'passaporte', você só precisa especificar o middleware 'auth:api' nas rotas que devem exigir um token de acesso válido:

```php
    Route::get('/user', function () {
        // ...
    })->middleware('auth:api');
```

> [AVISO]
> Se você estiver usando o [concessão de credenciais do cliente](#client-credentials-grant-tokens), você deve usar o [middleware `client`](#client-credentials-grant-tokens) para proteger suas rotas em vez do middleware `auth:api`.

<a name="multiple-authentication-guards"></a>
#### Guarda de Autenticação Múltipla

Se o seu aplicativo autentica diferentes tipos de usuários que talvez usem totalmente diferentes modelos Eloquent, você provavelmente precisará definir uma configuração de guarda para cada tipo de provedor de usuário em seu aplicativo. Isso permite que você proteja solicitações destinadas a provedores específicos de usuário. Por exemplo, considerando a seguinte configuração de guarda no arquivo de configuração auth.php:

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

A rota a seguir utilizará o guard "api-customers", que utiliza o provedor de usuários "customers" para autenticar solicitações recebidas.

```php
    Route::get('/customer', function () {
        // ...
    })->middleware('auth:api-customers');
```

> Nota!
> Para mais informações sobre o uso de vários provedores de usuário com Passport, veja a documentação [password grant](#customizing-the-user-provider)

<a name="passing-the-access-token"></a>
### Passando o Token de Acesso

Ao chamar rotas protegidas pelo Passport, os consumidores de API do seu aplicativo devem especificar seu token de acesso como um token "Bearer" no cabeçalho "Authorization" de sua solicitação. Por exemplo, ao usar a biblioteca HTTP Guzzle:

```php
    use Illuminate\Support\Facades\Http;

    $response = Http::withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer '.$accessToken,
    ])->get('https://passport-app.test/api/user');

    return $response->json();
```

<a name="token-scopes"></a>
## Escopos de Token

Os escopos permitem que os clientes da API solicitem um conjunto específico de permissões ao solicitar autorização para acessar uma conta. Por exemplo, se você estiver construindo um aplicativo de comércio eletrônico, nem todos os consumidores da API precisarão da capacidade de fazer pedidos. Em vez disso, você pode permitir que os consumidores solicitem autorização apenas para acessar os status de envio dos pedidos. Ou seja, os escopos permitem que os usuários do seu aplicativo limitem as ações que um aplicativo de terceiros pode realizar em nome deles.

<a name="defining-scopes"></a>
### Definindo os escopos

Você pode definir os escopos da sua API usando o método `Passport::tokensCan` no método de inicialização do arquivo `App\Providers\AppServiceProvider`. O método `tokensCan` aceita um array de nomes e descrições dos escopos. A descrição do escopo pode ser qualquer coisa que você quiser e será exibida para os usuários na tela de aprovação da autorização:

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

Se um cliente não solicitar escopos específicos, você pode configurar seu servidor de passaporte para anexar escopos padrão ao token usando o método 'setDefaultScope'. Normalmente, você deve chamar esse método do método 'boot' da classe 'App\Providers\AppServiceProvider' do seu aplicativo.

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

> [Nota]
> O escopo padrão do passaporte não se aplica aos tokens de acesso pessoal gerados pelo usuário.

<a name="assigning-scopes-to-tokens"></a>
### Atribuindo Escopos aos Tokens

<a name="when-requesting-authorization-codes"></a>
#### Quando solicitar códigos de autorização

Ao solicitar um token de acesso usando o tipo de concessão de código de autorização, os consumidores devem especificar seus escopos desejados como o parâmetro de string de consulta de "scope". O parâmetro "scope" deve ser uma lista delimitada por espaços de escopos:

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
#### Quando emitindo Tokens de Acesso Pessoal

Se você estiver emitindo tokens de acesso pessoal usando o método createToken do modelo App\Models\User, você pode passar um array de escopos desejados como segundo argumento para o método.

```php
    $token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="checking-scopes"></a>
### Verificando Escopos

O passaporte inclui dois middleware que podem ser usados para verificar se uma solicitação recebida é autenticada com um token que foi concedido um determinado escopo. Para começar, defina os seguintes aliases de middleware em seu arquivo 'bootstrap/app.php' do aplicativo:

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
#### Verificar todos os escopos

O middleware 'scopes' pode ser atribuído a uma rota para verificar que o acesso token da requisição entrante possui todos os escopos listados.

```php
    Route::get('/orders', function () {
        // Access token has both "check-status" and "place-orders" scopes...
    })->middleware(['auth:api', 'scopes:check-status,place-orders']);
```

<a name="check-for-any-scopes"></a>
#### Verificar Escopos Qualquer

O middleware "scope" pode ser atribuído a uma rota para verificar que o token de acesso do pedido entrante tenha pelo menos um dos escopos listados:

```php
    Route::get('/orders', function () {
        // Access token has either "check-status" or "place-orders" scope...
    })->middleware(['auth:api', 'scope:check-status,place-orders']);
```

<a name="checking-scopes-on-a-token-instance"></a>
#### Verificando escopos em uma instância de token

Uma vez que um token de acesso autenticado tenha entrado em seu aplicativo, você pode verificar ainda se o token tem uma determinada extensão usando o método `tokenCan` na instância autenticada do usuário.

```php
    use Illuminate\Http\Request;

    Route::get('/orders', function (Request $request) {
        if ($request->user()->tokenCan('place-orders')) {
            // ...
        }
    });
```

<a name="additional-scope-methods"></a>
#### Métodos Adicionais do Alcance

A função 'scopeIds' retornará uma lista de todos os IDs / nomes definidos:

```php
    use Laravel\Passport\Passport;

    Passport::scopeIds();
```

O método `scopes` retornará uma matriz com todos os escopos definidos como instâncias de `Laravel\Passport\Scope`:

```php
    Passport::scopes();
```

O método `scopesFor` retornará uma matriz de instâncias de `Laravel\Passport\Scope` que combinam com os ID's e nomes fornecidos.

```php
    Passport::scopesFor(['place-orders', 'check-status']);
```

Você pode determinar se um determinado escopo foi definido usando o método `hasScope`:

```php
    Passport::hasScope('place-orders');
```

<a name="consuming-your-api-with-javascript"></a>
## Usando a API com JavaScript

Ao construir uma API, pode ser extremamente útil poder consumir sua própria API de seu aplicativo JavaScript. Essa abordagem ao desenvolvimento da API permite que seu próprio aplicativo consuma a mesma API que você está compartilhando com o mundo. A mesma API pode ser consumida por seu aplicativo web, aplicativos móveis, aplicativos de terceiros e qualquer SDKs que você possa publicar em diversos gerenciadores de pacotes.

Tipicamente, se você quer consumir sua API da sua aplicação JavaScript, precisaria enviar manualmente um token de acesso para a aplicação e passar cada solicitação com ele. No entanto, o Passport inclui um middleware que pode tratar isso por você. Tudo o que você precisa fazer é acrescentar o `CreateFreshApiToken` middleware ao grupo `web` do seu arquivo `bootstrap/app.php`:

```php
    use Laravel\Passport\Http\Middleware\CreateFreshApiToken;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            CreateFreshApiToken::class,
        ]);
    })
```

> ¡¡ALERTA!
> Você deve garantir que o middleware 'CreateFreshApiToken' é o último middleware listado na sua pilha de middleware.

Este middleware anexará um cookie "laravel_token" às respostas que você envia. Este cookie contém um JWT encriptado, que o Passport usará para autenticar solicitações de API do seu aplicativo JavaScript. O JWT tem uma vida útil igual ao valor da configuração "session.lifetime". Agora, como o navegador enviará automaticamente o cookie com todas as solicitações subsequentes, você pode fazer solicitações à API do seu aplicativo sem passar explicitamente um token de acesso:

```js
    axios.get('/api/user')
        .then(response => {
            console.log(response.data);
        });
```

<a name="customizing-the-cookie-name"></a>
#### Personalizando o Nome do Bolo

Se necessário, você pode personalizar o nome do cookie 'laravel_token' usando o método 'Passport::cookie'. Normalmente, esse método deve ser chamado da classe 'boot' de sua aplicação 'App\Providers\AppServiceProvider':

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
#### Proteção CSRF

Ao utilizar este método de autenticação você precisará garantir um cabeçalho de token CSRF válido é incluído em suas solicitações. O modelo padrão do Laravel JavaScript inclui uma instância Axios, que usará automaticamente o valor encriptado do cookie `XSRF-TOKEN` para enviar um cabeçalho `X-XSRF-TOKEN` nas solicitações entre domínios idênticos.

> ¡[Nota]!
> Se você escolher enviar o cabeçalho 'X-CSRF-TOKEN' em vez de 'X-XSRF-TOKEN', você precisará usar o token sem criptografia fornecido pelo método 'csrf_token()'

<a name="events"></a>
## Eventos

O Passport gera eventos quando emite tokens de acesso e tokens de atualização. Você pode [ouvir estes eventos](/docs/events) para podar ou revogar outros tokens de acesso no seu banco de dados:

| Nome do evento |
|-------------|
| 'Laravel/Passport/Events/AccessTokenCreated' |
| 'Laravel/Passport/Events/RefreshTokenCreated' |

<a name="testing"></a>
## Testando

O método 'actingAs' do Passaporte pode ser usado para especificar o usuário atualmente autenticado, bem como seus escopos. O primeiro argumento fornecido ao método 'actingAs' é a instância do usuário e o segundo é um array de escopos que devem ser concedidos para o token do usuário:

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

O método de Passport 'actingAsClient' pode ser usado para especificar o cliente autenticado atual, bem como seus escopos. O primeiro argumento fornecido ao método actingAsClient é a instância do cliente e o segundo é uma matriz de escopos que devem ser concedidos ao token do cliente:

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
