# Laravel Passport

<a name="introduction"></a>
## Introdução

[Laravel Passport](https://github.com/laravel/passport) fornece uma implementação completa do servidor OAuth2 para seu aplicativo Laravel em questão de minutos. O Passport é construído sobre o [servidor League OAuth2](https://github.com/thephpleague/oauth2-server) que é mantido por Andy Millington e Simon Hamp.

::: warning AVISO
Esta documentação pressupõe que você já esteja familiarizado com o OAuth2. Se você não sabe nada sobre o OAuth2, considere se familiarizar com a [terminologia](https://oauth2.thephpleague.com/terminology/) geral e os recursos do OAuth2 antes de continuar.
:::

<a name="passport-or-sanctum"></a>
### Passport ou Sanctum?

Antes de começar, você pode querer determinar se seu aplicativo seria melhor atendido pelo Laravel Passport ou [Laravel Sanctum](/docs/sanctum). Se seu aplicativo realmente precisa suportar OAuth2, então você deve usar o Laravel Passport.

No entanto, se você estiver tentando autenticar um aplicativo de página única, aplicativo móvel ou emitir tokens de API, você deve usar o [Laravel Sanctum](/docs/sanctum). O Laravel Sanctum não suporta OAuth2; no entanto, ele fornece uma experiência de desenvolvimento de autenticação de API muito mais simples.

<a name="installation"></a>
## Instalação

Você pode instalar o Laravel Passport através do comando `install:api` Artisan:

```shell
php artisan install:api --passport
```

Este comando publicará e executará as migrações de banco de dados necessárias para criar as tabelas que seu aplicativo precisa para armazenar clientes OAuth2 e tokens de acesso. O comando também criará as chaves de criptografia necessárias para gerar tokens de acesso seguros.

Além disso, este comando perguntará se você gostaria de usar UUIDs como o valor da chave primária do modelo Passport `Client` em vez de incrementar automaticamente inteiros.

Após executar o comando `install:api`, adicione o trait `Laravel\Passport\HasApiTokens` ao seu modelo `App\Models\User`. Este trait fornecerá alguns métodos auxiliares ao seu modelo que permitem que você inspecione o token e os escopos do usuário autenticado:

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

Finalmente, no arquivo de configuração `config/auth.php` do seu aplicativo, você deve definir um guarda de autenticação `api` e definir a opção `driver` como `passport`. Isso instruirá seu aplicativo a usar o `TokenGuard` do Passport ao autenticar solicitações de API de entrada:

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
### Implantando o Passport

Ao implantar o Passport nos servidores do seu aplicativo pela primeira vez, você provavelmente precisará executar o comando `passport:keys`. Este comando gera as chaves de criptografia que o Passport precisa para gerar tokens de acesso. As chaves geradas normalmente não são mantidas no controle de origem:

```shell
php artisan passport:keys
```

Se necessário, você pode definir o caminho de onde as chaves do Passport devem ser carregadas. Você pode usar o método `Passport::loadKeysFrom` para fazer isso. Normalmente, esse método deve ser chamado do método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
    }
```

<a name="loading-keys-from-the-environment"></a>
#### Carregando chaves do ambiente

Alternativamente, você pode publicar o arquivo de configuração do Passport usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag=passport-config
```

Após a publicação do arquivo de configuração, você pode carregar as chaves de criptografia do seu aplicativo definindo-as como variáveis ​​de ambiente:

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a name="upgrading-passport"></a>
### Atualizando o Passport

Ao atualizar para uma nova versão principal do Passport, é importante que você revise cuidadosamente [a atualização guia](https://github.com/laravel/passport/blob/master/UPGRADE.md).

<a name="configuration"></a>
## Configuração

<a name="client-secret-hashing"></a>
### Hashing de segredo do cliente

Se você quiser que os segredos do seu cliente sejam hashados quando armazenados no seu banco de dados, você deve chamar o método `Passport::hashClientSecrets` no método `boot` da sua classe `App\Providers\AppServiceProvider`:

```php
    use Laravel\Passport\Passport;

    Passport::hashClientSecrets();
```

Uma vez habilitado, todos os seus segredos do cliente só serão exibidos para o usuário imediatamente após serem criados. Como o valor do segredo do cliente em texto simples nunca é armazenado no banco de dados, não é possível recuperar o valor do segredo se ele for perdido.

<a name="token-lifetimes"></a>
### Tempos de vida do token

Por padrão, o Passport emite tokens de acesso de longa duração que expiram após um ano. Se você quiser configurar um tempo de vida de token mais longo/mais curto, você pode usar os métodos `tokensExpireIn`, `refreshTokensExpireIn` e `personalAccessTokensExpireIn`. Esses métodos devem ser chamados do método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Passport::tokensExpireIn(now()->addDays(15));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));
    }
```

::: warning AVISO
As colunas `expires_at` nas tabelas de banco de dados do Passport são somente leitura e para fins de exibição apenas. Ao emitir tokens, o Passport armazena as informações de expiração dentro dos tokens assinados e criptografados. Se você precisar invalidar um token, você deve [revogá-lo](#revoking-tokens).
:::

<a name="overriding-default-models"></a>
### Substituindo modelos padrão

Você é livre para estender os modelos usados ​​internamente pelo Passport definindo seu próprio modelo e estendendo o modelo Passport correspondente:

```php
    use Laravel\Passport\Client as PassportClient;

    class Client extends PassportClient
    {
        // ...
    }
```

Após definir seu modelo, você pode instruir o Passport a usar seu modelo personalizado por meio da classe `Laravel\Passport\Passport`. Normalmente, você deve informar o Passport sobre seus modelos personalizados no método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    use App\Models\Passport\AuthCode;
    use App\Models\Passport\Client;
    use App\Models\Passport\PersonalAccessClient;
    use App\Models\Passport\RefreshToken;
    use App\Models\Passport\Token;

    /**
     * Inicialize qualquer serviço de aplicativo.
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
### Substituindo rotas

Às vezes, você pode desejar personalizar as rotas definidas pelo Passport. Para conseguir isso, primeiro você precisa ignorar as rotas registradas pelo Passport adicionando `Passport::ignoreRoutes` ao método `register` do `AppServiceProvider` do seu aplicativo:

```php
    use Laravel\Passport\Passport;

    /**
     * Registre quaisquer serviços de aplicação.
     */
    public function register(): void
    {
        Passport::ignoreRoutes();
    }
```

Então, você pode copiar as rotas definidas pelo Passport em [seu arquivo de rotas](https://github.com/laravel/passport/blob/11.x/routes/web.php) para o arquivo `routes/web.php` do seu aplicativo e modificá-las ao seu gosto:

```php
    Route::group([
        'as' => 'passport.',
        'prefix' => config('passport.path', 'oauth'),
        'namespace' => '\Laravel\Passport\Http\Controllers',
    ], function () {
        // Rotas do Passport...
    });
```

<a name="issuing-access-tokens"></a>
## Emissão de tokens de acesso

Usar OAuth2 por meio de códigos de autorização é como a maioria dos desenvolvedores está familiarizada com OAuth2. Ao usar códigos de autorização, um aplicativo cliente redirecionará um usuário para seu servidor, onde ele aprovará ou negará a solicitação para emitir um token de acesso ao cliente.

<a name="managing-clients"></a>
### Gerenciando clientes

Primeiro, os desenvolvedores que criam aplicativos que precisam interagir com a API do seu aplicativo precisarão registrar o aplicativo deles com o seu criando um "cliente". Normalmente, isso consiste em fornecer o nome do aplicativo e uma URL para a qual o aplicativo pode redirecionar após os usuários aprovarem a solicitação de autorização.

<a name="the-passportclient-command"></a>
#### O comando `passport:client`

A maneira mais simples de criar um cliente é usando o comando Artisan `passport:client`. Este comando pode ser usado para criar seus próprios clientes para testar sua funcionalidade OAuth2. Ao executar o comando `client`, o Passport solicitará mais informações sobre seu cliente e fornecerá um ID e segredo do cliente:

```shell
php artisan passport:client
```

**URLs de redirecionamento**

Se desejar permitir vários URLs de redirecionamento para seu cliente, você pode especificá-los usando uma lista delimitada por vírgulas quando solicitado pelo comando `passport:client`. Quaisquer URLs que contenham vírgulas devem ser codificadas como URL:

```shell
http://example.com/callback,http://examplefoo.com/callback
```

<a name="clients-json-api"></a>
#### API JSON

Como os usuários do seu aplicativo não poderão utilizar o comando `client`, o Passport fornece uma API JSON que você pode usar para criar clientes. Isso evita o trabalho de ter que codificar manualmente os controladores para criar, atualizar e excluir clientes.

No entanto, você precisará parear a API JSON do Passport com seu próprio frontend para fornecer um painel para seus usuários gerenciarem seus clientes. Abaixo, revisaremos todos os endpoints da API para gerenciar clientes. Por conveniência, usaremos [Axios](https://github.com/axios/axios) para demonstrar como fazer solicitações HTTP aos endpoints.

A API JSON é protegida pelo middleware `web` e `auth`; portanto, ela só pode ser chamada do seu próprio aplicativo. Ela não pode ser chamada de uma fonte externa.

<a name="get-oauthclients"></a>
#### `GET /oauth/clients`

Esta rota retorna todos os clientes para o usuário autenticado. Isso é útil principalmente para listar todos os clientes do usuário para que eles possam editá-los ou excluí-los:

```js
axios.get('/oauth/clients')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthclients"></a>
#### `POST /oauth/clients`

Esta rota é usada para criar novos clientes. Ela requer dois dados: o `nome` do cliente e uma URL `redirect`. A URL `redirect` é para onde o usuário será redirecionado após aprovar ou negar uma solicitação de autorização.

Quando um cliente é criado, ele receberá um ID de cliente e um segredo de cliente. Esses valores serão usados ​​ao solicitar tokens de acesso do seu aplicativo. A rota de criação de cliente retornará a nova instância do cliente:

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
        // Listar erros na resposta...
    });
```

<a name="put-oauthclientsclient-id"></a>
#### `PUT /oauth/clients/{client-id}`

Esta rota é usada para atualizar clientes. Ela requer dois dados: o `nome` do cliente e uma URL `redirect`. A URL `redirect` é para onde o usuário será redirecionado após aprovar ou negar uma solicitação de autorização. A rota retornará a instância do cliente atualizada:

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
        // Listar erros na resposta...
    });
```

<a name="delete-oauthclientsclient-id"></a>
#### `DELETE /oauth/clients/{client-id}`

Esta rota é usada para excluir clientes:

```js
axios.delete('/oauth/clients/' + clientId)
    .then(response => {
        // ...
    });
```

<a name="requesting-tokens"></a>
### Solicitando tokens

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### Redirecionando para autorização

Depois que um cliente é criado, os desenvolvedores podem usar seu ID e segredo do cliente para solicitar um código de autorização e um token de acesso do seu aplicativo. Primeiro, o aplicativo consumidor deve fazer uma solicitação de redirecionamento para a rota `/oauth/authorize` do seu aplicativo, como:

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

Se o valor `prompt` for `none`, o Passport sempre lançará um erro de autenticação se o usuário ainda não estiver autenticado com o aplicativo Passport. Se o valor for `consent`, o Passport sempre exibirá a tela de aprovação de autorização, mesmo se todos os escopos tiverem sido concedidos anteriormente ao aplicativo consumidor. Quando o valor for `login`, o aplicativo Passport sempre solicitará que o usuário faça login novamente no aplicativo, mesmo se ele já tiver uma sessão existente.

Se nenhum valor `prompt` for fornecido, o usuário será solicitado a autorizar somente se ele não tiver autorizado anteriormente o acesso ao aplicativo consumidor para os escopos solicitados.

::: info NOTA
Lembre-se, a rota `/oauth/authorize` já está definida pelo Passport. Você não precisa definir manualmente esta rota.
:::

<a name="approvando-a-solicitação"></a>
#### Aprovando a solicitação

Ao receber solicitações de autorização, o Passport responderá automaticamente com base no valor do parâmetro `prompt` (se presente) e poderá exibir um modelo para o usuário permitindo que ele aprove ou negue a solicitação de autorização. Se ele aprovar a solicitação, será redirecionado de volta para o `redirect_uri` que foi especificado pelo aplicativo consumidor. O `redirect_uri` deve corresponder ao URL `redirect` que foi especificado quando o cliente foi criado.

Se você quiser personalizar a tela de aprovação de autorização, você pode publicar as visualizações do Passport usando o comando Artisan `vendor:publish`. As visualizações publicadas serão colocadas no diretório `resources/views/vendor/passport`:

```shell
php artisan vendor:publish --tag=passport-views
```

Às vezes, você pode querer pular o prompt de autorização, como ao autorizar um cliente primário. Você pode fazer isso [estendendo o modelo `Client`](#overriding-default-models) e definindo um método `skipsAuthorization`. Se `skipsAuthorization` retornar `true`, o cliente será aprovado e o usuário será redirecionado de volta para o `redirect_uri` imediatamente, a menos que o aplicativo consumidor tenha definido explicitamente o parâmetro `prompt` ao redirecionar para autorização:

```php
    <?php

    namespace App\Models\Passport;

    use Laravel\Passport\Client as BaseClient;

    class Client extends BaseClient
    {
        /**
         * Determine se o cliente deve pular o prompt de autorização.
         */
        public function skipsAuthorization(): bool
        {
            return $this->firstParty();
        }
    }
```

<a name="requesting-tokens-converting-authorization-codes-to-access-tokens"></a>
#### Convertendo códigos de autorização em tokens de acesso

Se o usuário aprovar a solicitação de autorização, ele será redirecionado de volta para o aplicativo consumidor. O consumidor deve primeiro verificar o parâmetro `state` em relação ao valor que foi armazenado antes do redirecionamento. Se o parâmetro state corresponder, o consumidor deve emitir uma solicitação `POST` para seu aplicativo para solicitar um token de acesso. A solicitação deve incluir o código de autorização que foi emitido pelo seu aplicativo quando o usuário aprovou a solicitação de autorização:

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

Esta rota `/oauth/token` retornará uma resposta JSON contendo os atributos `access_token`, `refresh_token` e `expires_in`. O atributo `expires_in` contém o número de segundos até que o token de acesso expire.

::: info NOTA
Assim como a rota `/oauth/authorize`, a rota `/oauth/token` é definida para você pelo Passport. Não há necessidade de definir manualmente esta rota.
:::

<a name="tokens-json-api"></a>
#### JSON API

O Passport também inclui uma API JSON para gerenciar tokens de acesso autorizados. Você pode emparelhar isso com seu próprio frontend para oferecer aos seus usuários um painel para gerenciar tokens de acesso. Por conveniência, usaremos [Axios](https://github.com/mzabriskie/axios) para demonstrar como fazer solicitações HTTP para os endpoints. A API JSON é protegida pelo middleware `web` e `auth`; portanto, ela só pode ser chamada do seu próprio aplicativo.

<a name="get-oauthtokens"></a>
#### `GET /oauth/tokens`

Esta rota retorna todos os tokens de acesso autorizados que o usuário autenticado criou. Isso é útil principalmente para listar todos os tokens do usuário para que eles possam revogá-los:

```js
axios.get('/oauth/tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="delete-oauthtokenstoken-id"></a>
#### `DELETE /oauth/tokens/{token-id}`

Esta rota pode ser usada para revogar tokens de acesso autorizados e seus tokens de atualização relacionados:

```js
axios.delete('/oauth/tokens/' + tokenId);
```

<a name="refreshing-tokens"></a>
### Atualizando tokens

Se seu aplicativo emitir tokens de acesso de curta duração, os usuários precisarão atualizar seus tokens de acesso por meio do token de atualização que foi fornecido a eles quando o token de acesso foi emitido:

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

Esta rota `/oauth/token` retornará uma resposta JSON contendo `access_token`, `refresh_token` e Atributos `expires_in`. O atributo `expires_in` contém o número de segundos até que o token de acesso expire.

<a name="revoking-tokens"></a>
### Revogando Tokens

Você pode revogar um token usando o método `revokeAccessToken` no `Laravel\Passport\TokenRepository`. Você pode revogar os tokens de atualização de um token usando o método `revokeRefreshTokensByAccessTokenId` no `Laravel\Passport\RefreshTokenRepository`. Essas classes podem ser resolvidas usando o [service container](/docs/container) do Laravel:

```php
    use Laravel\Passport\TokenRepository;
    use Laravel\Passport\RefreshTokenRepository;

    $tokenRepository = app(TokenRepository::class);
    $refreshTokenRepository = app(RefreshTokenRepository::class);

    // Revogar um token de acesso...
    $tokenRepository->revokeAccessToken($tokenId);

    // Revogar todos os tokens de atualização do token...
    $refreshTokenRepository->revokeRefreshTokensByAccessTokenId($tokenId);
```

<a name="purging-tokens"></a>
### Expurgando Tokens

Quando os tokens forem revogados ou expirarem, você pode querer expurgá-los do banco de dados. O comando Artisan incluído no Passport `passport:purge` pode fazer isso por você:

```shell
# Limpar tokens e códigos de autenticação revogados e expirados...
php artisan passport:purge

# Limpar somente tokens expirados por mais de 6 horas...
php artisan passport:purge --hours=6

# Limpar somente tokens e códigos de autenticação revogados...
php artisan passport:purge --revoked

# Limpar somente tokens e códigos de autenticação expirados...
php artisan passport:purge --expired
```

Você também pode configurar um [trabalho agendado](/docs/scheduling) no arquivo `routes/console.php` do seu aplicativo para podar automaticamente seus tokens em uma programação:

```php
    use Laravel\Support\Facades\Schedule;

    Schedule::command('passport:purge')->hourly();
```

<a name="code-grant-pkce"></a>
## Concessão de código de autorização com PKCE

A concessão de código de autorização com "Chave de prova para troca de código" (PKCE) é uma maneira segura de autenticar aplicativos de página única ou aplicativos nativos para acessar sua API. Essa concessão deve ser usada quando você não puder garantir que o segredo do cliente será armazenado confidencialmente ou para mitigar a ameaça de ter o código de autorização interceptado por um invasor. Uma combinação de um "verificador de código" e um "desafio de código" substitui o segredo do cliente ao trocar o código de autorização por um token de acesso.

<a name="creating-a-auth-pkce-grant-client"></a>
### Criando o cliente

Antes que seu aplicativo possa emitir tokens por meio da concessão de código de autorização com PKCE, você precisará criar um cliente habilitado para PKCE. Você pode fazer isso usando o comando Artisan `passport:client` com a opção `--public`:

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### Solicitando tokens

<a name="code-verifier-code-challenge"></a>
#### Verificador de código e desafio de código

Como essa concessão de autorização não fornece um segredo de cliente, os desenvolvedores precisarão gerar uma combinação de um verificador de código e um desafio de código para solicitar um token.

O verificador de código deve ser uma sequência aleatória de 43 a 128 caracteres contendo letras, números e caracteres `"-"`, `"."`, `"_"`, `"~"`, conforme definido na [especificação RFC 7636](https://tools.ietf.org/html/rfc7636).

O desafio de código deve ser uma sequência codificada em Base64 com caracteres seguros para URL e nome de arquivo. Os caracteres `'='` finais devem ser removidos e nenhuma quebra de linha, espaço em branco ou outros caracteres adicionais devem estar presentes.

```php
    $encoded = base64_encode(hash('sha256', $code_verifier, true));

    $codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>
#### Redirecionando para Autorização

Depois que um cliente for criado, você pode usar o ID do cliente e o verificador de código gerado e o desafio de código para solicitar um código de autorização e um token de acesso do seu aplicativo. Primeiro, o aplicativo consumidor deve fazer uma solicitação de redirecionamento para a rota `/oauth/authorize` do seu aplicativo:

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
#### Convertendo Códigos de Autorização em Tokens de Acesso

Se o usuário aprovar a solicitação de autorização, ele será redirecionado de volta para o aplicativo consumidor. O consumidor deve verificar o parâmetro `state` em relação ao valor que foi armazenado antes do redirecionamento, como no Authorization Code Grant padrão.

Se o parâmetro state corresponder, o consumidor deve emitir uma solicitação `POST` para seu aplicativo para solicitar um token de acesso. A solicitação deve incluir o código de autorização que foi emitido pelo seu aplicativo quando o usuário aprovou a solicitação de autorização, juntamente com o verificador de código gerado originalmente:

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

::: warning AVISO
Não recomendamos mais o uso de tokens de concessão de senha. Em vez disso, você deve escolher [um tipo de concessão que é atualmente recomendado pelo OAuth2 Server](https://oauth2.thephpleague.com/authorization-server/which-grant/).
:::

A concessão de senha do OAuth2 permite que seus outros clientes primários, como um aplicativo móvel, obtenham um token de acesso usando um endereço de e-mail/nome de usuário e senha. Isso permite que você emita tokens de acesso com segurança para seus clientes primários sem exigir que seus usuários passem por todo o fluxo de redirecionamento do código de autorização do OAuth2.

Para habilitar a concessão de senha, chame o método `enablePasswordGrant` no método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Passport::enablePasswordGrant();
    }
```

<a name="creating-a-password-grant-client"></a>
### Criando um cliente de concessão de senha

Antes que seu aplicativo possa emitir tokens por meio da concessão de senha, você precisará criar um cliente de concessão de senha. Você pode fazer isso usando o comando Artisan `passport:client` com a opção `--password`. **Se você já executou o comando `passport:install`, não precisa executar este comando:**

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### Solicitando tokens

Depois de criar um cliente de concessão de senha, você pode solicitar um token de acesso emitindo uma solicitação `POST` para a rota `/oauth/token` com o endereço de e-mail e a senha do usuário. Lembre-se, esta rota já está registrada pelo Passport, então não há necessidade de defini-la manualmente. Se a solicitação for bem-sucedida, você receberá um `access_token` e `refresh_token` na resposta JSON do servidor:

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

::: info NOTA
Lembre-se, os tokens de acesso têm vida útil longa por padrão. No entanto, você está livre para [configurar sua vida útil máxima do token de acesso](#configuration) se necessário.
:::

<a name="requesting-all-scopes"></a>
### Solicitando todos os escopos

Ao usar a concessão de senha ou a concessão de credenciais do cliente, você pode desejar autorizar o token para todos os escopos suportados pelo seu aplicativo. Você pode fazer isso solicitando o escopo `*`. Se você solicitar o escopo `*`, o método `can` na instância do token sempre retornará `true`. Este escopo só pode ser atribuído a um token emitido usando a concessão `password` ou `client_credentials`:

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
### Personalizando o provedor de usuário

Se seu aplicativo usar mais de um [provedor de usuário de autenticação](/docs/authentication#introduction), você pode especificar qual provedor de usuário o cliente de concessão de senha usa fornecendo uma opção `--provider` ao criar o cliente por meio do comando `artisan passport:client --password`. O nome do provedor fornecido deve corresponder a um provedor válido definido no arquivo de configuração `config/auth.php` do seu aplicativo. Você pode então [proteger sua rota usando middleware](#via-middleware) para garantir que apenas usuários do provedor especificado do guard sejam autorizados.

<a name="customizing-the-username-field"></a>
### Personalizando o campo de nome de usuário

Ao autenticar usando a concessão de senha, o Passport usará o atributo `email` do seu modelo authenticatable como o "nome de usuário". No entanto, você pode personalizar esse comportamento definindo um método `findForPassport` no seu modelo:

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
         * Encontre a instância de usuário para o nome de usuário fornecido.
         */
        public function findForPassport(string $username): User
        {
            return $this->where('username', $username)->first();
        }
    }
```

<a name="customizing-the-password-validation"></a>
### Personalizando a validação de senha

Ao autenticar usando a concessão de senha, o Passport usará o atributo `password` do seu modelo para validar a senha fornecida. Se seu modelo não tiver um atributo `password` ou você desejar personalizar a lógica de validação de senha, você pode definir um método `validateForPassportPasswordGrant` em seu modelo:

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
         * Valide a senha do usuário para a concessão de senha do Passport.
         */
        public function validateForPassportPasswordGrant(string $password): bool
        {
            return Hash::check($password, $this->password);
        }
    }
```

<a name="implicit-grant-tokens"></a>
## Tokens de Concessão Implícita

::: warning AVISO
Não recomendamos mais usar tokens de concessão implícita. Em vez disso, você deve escolher [um tipo de concessão que é atualmente recomendado pelo OAuth2 Server](https://oauth2.thephpleague.com/authorization-server/which-grant/).
:::

A concessão implícita é semelhante à concessão de código de autorização; no entanto, o token é retornado ao cliente sem trocar um código de autorização. Essa concessão é mais comumente usada para JavaScript ou aplicativos móveis onde as credenciais do cliente não podem ser armazenadas com segurança. Para habilitar a concessão, chame o método `enableImplicitGrant` no método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Passport::enableImplicitGrant();
    }
```

Depois que a concessão for habilitada, os desenvolvedores poderão usar seu ID de cliente para solicitar um token de acesso do seu aplicativo. O aplicativo consumidor deve fazer uma solicitação de redirecionamento para a rota `/oauth/authorize` do seu aplicativo, como:

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

::: info NOTA
Lembre-se, a rota `/oauth/authorize` já está definida pelo Passport. Você não precisa definir manualmente esta rota.
:::

<a name="client-credentials-grant-tokens"></a>
## Tokens de concessão de credenciais do cliente

A concessão de credenciais do cliente é adequada para autenticação de máquina para máquina. Por exemplo, você pode usar esta concessão em um trabalho agendado que esteja executando tarefas de manutenção em uma API.

Antes que seu aplicativo possa emitir tokens por meio da concessão de credenciais do cliente, você precisará criar um cliente de concessão de credenciais do cliente. Você pode fazer isso usando a opção `--client` do comando Artisan `passport:client`:

```shell
php artisan passport:client --client
```

Em seguida, para usar esse tipo de concessão, registre um alias de middleware para o middleware `CheckClientCredentials`. Você pode definir aliases de middleware no arquivo `bootstrap/app.php` do seu aplicativo:

```php
    use Laravel\Passport\Http\Middleware\CheckClientCredentials;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'client' => CheckClientCredentials::class
        ]);
    })
```

Então, anexe o middleware a uma rota:

```php
    Route::get('/orders', function (Request $request) {
        ...
    })->middleware('client');
```

Para restringir o acesso à rota a escopos específicos, você pode fornecer uma lista delimitada por vírgulas dos escopos necessários ao anexar o middleware `client` à rota:

```php
    Route::get('/orders', function (Request $request) {
        ...
    })->middleware('client:check-status,your-scope');
```

<a name="retrieving-tokens"></a>
### Recuperando Tokens

Para recuperar um token usando este tipo de concessão, faça uma solicitação ao endpoint `oauth/token`:

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
## Tokens de acesso pessoal

Às vezes, seus usuários podem querer emitir tokens de acesso para si mesmos sem passar pelo fluxo de redirecionamento de código de autorização típico. Permitir que os usuários emitam tokens para si mesmos por meio da IU do seu aplicativo pode ser útil para permitir que os usuários experimentem sua API ou pode servir como uma abordagem mais simples para emitir tokens de acesso em geral.

::: info NOTA
Se seu aplicativo estiver usando principalmente o Passport para emitir tokens de acesso pessoais, considere usar [Laravel Sanctum](/docs/sanctum), a biblioteca leve e própria do Laravel para emitir tokens de acesso à API.
:::

<a name="creating-a-personal-access-client"></a>
### Criando um cliente de acesso pessoal

Antes que seu aplicativo possa emitir tokens de acesso pessoal, você precisará criar um cliente de acesso pessoal. Você pode fazer isso executando o comando Artisan `passport:client` com a opção `--personal`. Se você já executou o comando `passport:install`, não precisa executar este comando:

```shell
php artisan passport:client --personal
```

Após criar seu cliente de acesso pessoal, coloque o ID do cliente e o valor secreto de texto simples no arquivo `.env` do seu aplicativo:

```ini
PASSPORT_PERSONAL_ACCESS_CLIENT_ID="client-id-value"
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET="unhashed-client-secret-value"
```

<a name="managing-personal-access-tokens"></a>
### Gerenciando Tokens de Acesso Pessoal

Depois de criar um cliente de acesso pessoal, você pode emitir tokens para um determinado usuário usando o método `createToken` na instância do modelo `App\Models\User`. O método `createToken` aceita o nome do token como seu primeiro argumento e uma matriz opcional de [scopes](#token-scopes) como seu segundo argumento:

```php
    use App\Models\User;

    $user = User::find(1);

    // Criando um token sem escopos...
    $token = $user->createToken('Token Name')->accessToken;

    // Criando um token com escopos...
    $token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="personal-access-tokens-json-api"></a>
#### API JSON

O Passport também inclui uma API JSON para gerenciar tokens de acesso pessoal. Você pode emparelhar isso com seu próprio frontend para oferecer aos seus usuários um painel para gerenciar tokens de acesso pessoal. Abaixo, revisaremos todos os endpoints da API para gerenciar tokens de acesso pessoal. Por conveniência, usaremos [Axios](https://github.com/mzabriskie/axios) para demonstrar como fazer solicitações HTTP para os endpoints.

A API JSON é protegida pelo middleware `web` e `auth`; portanto, ela só pode ser chamada do seu próprio aplicativo. Ela não pode ser chamada de uma fonte externa.

<a name="get-oauthscopes"></a>
#### `GET /oauth/scopes`

Esta rota retorna todos os [escopos](#token-scopes) definidos para seu aplicativo. Você pode usar esta rota para listar os escopos que um usuário pode atribuir a um token de acesso pessoal:

```js
axios.get('/oauth/scopes')
    .then(response => {
        console.log(response.data);
    });
```

<a name="get-oauthpersonal-access-tokens"></a>
#### `GET /oauth/personal-access-tokens`

Esta rota retorna todos os tokens de acesso pessoal que o usuário autenticado criou. Isso é útil principalmente para listar todos os tokens do usuário para que eles possam editá-los ou revogá-los:

```js
axios.get('/oauth/personal-access-tokens')
    .then(response => {
        console.log(response.data);
    });
```

<a name="post-oauthpersonal-access-tokens"></a>
#### `POST /oauth/personal-access-tokens`

Esta rota cria novos tokens de acesso pessoal. Ele requer dois dados: o `nome` do token e os `escopos` que devem ser atribuídos ao token:

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
        // Listar erros na resposta...
    });
```

<a name="delete-oauthpersonal-access-tokenstoken-id"></a>
#### `DELETE /oauth/personal-access-tokens/{token-id}`

Esta rota pode ser usada para revogar tokens de acesso pessoal:

```js
axios.delete('/oauth/personal-access-tokens/' + tokenId);
```

<a name="protecting-routes"></a>
## Protegendo rotas

<a name="via-middleware"></a>
### Via Middleware

O Passport inclui um [guarda de autenticação](/docs/authentication#adding-custom-guards) que validará tokens de acesso em solicitações recebidas. Depois de configurar o `api` guard para usar o driver `passport`, você só precisa especificar o middleware `auth:api` em quaisquer rotas que exijam um token de acesso válido:

```php
    Route::get('/user', function () {
        // ...
    })->middleware('auth:api');
```

::: warning AVISO
Se você estiver usando a [concessão de credenciais do cliente](#client-credentials-grant-tokens), você deve usar [o `client` middleware](#client-credentials-grant-tokens) para proteger suas rotas em vez do `auth:api` middleware.
:::

<a name="multiple-authentication-guards"></a>
#### Vários Guards de Autenticação

Se seu aplicativo autentica diferentes tipos de usuários que talvez usem modelos Eloquent totalmente diferentes, você provavelmente precisará definir uma configuração de guarda para cada tipo de provedor de usuário em seu aplicativo. Isso permite que você proteja solicitações destinadas a provedores de usuário específicos. Por exemplo, dada a seguinte configuração de guarda, o arquivo de configuração `config/auth.php`:

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

A rota a seguir utilizará a guarda `api-customers`, que usa o provedor de usuário `customers`, para autenticar solicitações de entrada:

```php
    Route::get('/customer', function () {
        // ...
    })->middleware('auth:api-customers');
```

::: info NOTA
Para obter mais informações sobre o uso de vários provedores de usuário com o Passport, consulte a [documentação de concessão de senha](#customizing-the-user-provider).
:::

<a name="passing-the-access-token"></a>
### Passando o Token de Acesso

Ao chamar rotas protegidas pelo Passport, os consumidores da API do seu aplicativo devem especificar seu token de acesso como um token `Bearer` no cabeçalho `Authorization` da solicitação. Por exemplo, ao usar a biblioteca HTTP Guzzle:

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

Os escopos permitem que seus clientes de API solicitem um conjunto específico de permissões ao solicitar autorização para acessar uma conta. Por exemplo, se você estiver criando um aplicativo de comércio eletrônico, nem todos os consumidores de API precisarão da capacidade de fazer pedidos. Em vez disso, você pode permitir que os consumidores solicitem apenas autorização para acessar os status de remessa dos pedidos. Em outras palavras, os escopos permitem que os usuários do seu aplicativo limitem as ações que um aplicativo de terceiros pode executar em seu nome.

<a name="defining-scopes"></a>
### Definindo Escopos

Você pode definir os escopos da sua API usando o método `Passport::tokensCan` no método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo. O método `tokensCan` aceita uma matriz de nomes de escopo e descrições de escopo. A descrição do escopo pode ser qualquer coisa que você desejar e será exibida aos usuários na tela de aprovação de autorização:

```php
    /**
     * Inicialize qualquer serviço de aplicativo.
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
### Escopo Padrão

Se um cliente não solicitar nenhum escopo específico, você pode configurar seu servidor Passport para anexar escopo(s) padrão ao token usando o método `setDefaultScope`. Normalmente, você deve chamar esse método do método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

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

::: info NOTA
Os escopos padrão do Passport não se aplicam a tokens de acesso pessoais gerados pelo usuário.
:::

<a name="assigning-scopes-to-tokens"></a>
### Atribuindo escopos a tokens

<a name="when-requesting-authorization-codes"></a>
#### Ao solicitar códigos de autorização

Ao solicitar um token de acesso usando a concessão de código de autorização, os consumidores devem especificar seus escopos desejados como o parâmetro de string de consulta `scope`. O parâmetro `scope` deve ser uma lista de escopos delimitada por espaços:

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
#### Ao emitir tokens de acesso pessoal

Se você estiver emitindo tokens de acesso pessoal usando o método `createToken` do modelo `App\Models\User`, você pode passar a matriz de escopos desejados como o segundo argumento para o método:

```php
    $token = $user->createToken('My Token', ['place-orders'])->accessToken;
```

<a name="checking-scopes"></a>
### Verificando escopos

O Passport inclui dois middlewares que podem ser usados ​​para verificar se uma solicitação de entrada é autenticada com um token que recebeu um determinado escopo. Para começar, defina os seguintes aliases de middleware no arquivo `bootstrap/app.php` do seu aplicativo:

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

O middleware `scopes` pode ser atribuído a uma rota para verificar se o token de acesso da solicitação de entrada tem todos os escopos listados:

```php
    Route::get('/orders', function () {
        // Access token has both "check-status" and "place-orders" scopes...
    })->middleware(['auth:api', 'scopes:check-status,place-orders']);
```

<a name="check-for-any-scopes"></a>
#### Verificar todos os escopos

O middleware `scope` pode ser atribuído a uma rota para verificar se o token de acesso da solicitação de entrada tem *pelo menos um* dos escopos listados:

```php
    Route::get('/orders', function () {
        // Access token has either "check-status" or "place-orders" scope...
    })->middleware(['auth:api', 'scope:check-status,place-orders']);
```

<a name="checking-scopes-on-a-token-instance"></a>
#### Verificando escopos em uma instância de token

Depois que uma solicitação autenticada de token de acesso tiver entrado em seu aplicativo, você ainda pode verificar se o token tem um escopo fornecido usando o método `tokenCan` na instância autenticada `App\Models\User`:

```php
    use Illuminate\Http\Request;

    Route::get('/orders', function (Request $request) {
        if ($request->user()->tokenCan('place-orders')) {
            // ...
        }
    });
```

<a name="additional-scope-methods"></a>
#### Métodos de escopo adicionais

O método `scopeIds` retornará uma matriz de todos os IDs/nomes definidos:

```php
    use Laravel\Passport\Passport;

    Passport::scopeIds();
```

O método `scopes` retornará uma matriz de todos os escopos definidos como instâncias de `Laravel\Passport\Scope`:

```php
    Passport::scopes();
```

O método `scopesFor` retornará uma matriz de instâncias de `Laravel\Passport\Scope` que correspondem aos IDs/nomes fornecidos:

```php
    Passport::scopesFor(['place-orders', 'check-status']);
```

Você pode determinar se um escopo fornecido foi definido usando o método `hasScope`:

```php
    Passport::hasScope('place-orders');
```

<a name="sumption-your-api-with-javascript"></a>
## Consumindo sua API com JavaScript

Ao construir uma API, pode ser extremamente útil poder consumir sua própria API do seu aplicativo JavaScript. Essa abordagem para desenvolvimento de API permite que seu próprio aplicativo consuma a mesma API que você está compartilhando com o mundo. A mesma API pode ser consumida por seu aplicativo da web, aplicativos móveis, aplicativos de terceiros e quaisquer SDKs que você possa publicar em vários gerenciadores de pacotes.

Normalmente, se você quiser consumir sua API do seu aplicativo JavaScript, precisará enviar manualmente um token de acesso ao aplicativo e passá-lo com cada solicitação ao seu aplicativo. No entanto, o Passport inclui um middleware que pode lidar com isso para você. Tudo o que você precisa fazer é anexar o middleware `CreateFreshApiToken` ao grupo de middleware `web` no arquivo `bootstrap/app.php` do seu aplicativo:

```php
    use Laravel\Passport\Http\Middleware\CreateFreshApiToken;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            CreateFreshApiToken::class,
        ]);
    })
```

::: warning AVISO
Você deve garantir que o middleware `CreateFreshApiToken` seja o último middleware listado em sua pilha de middleware.
:::

Este middleware anexará um cookie `laravel_token` às suas respostas de saída. Este cookie contém um JWT criptografado que o Passport usará para autenticar solicitações de API do seu aplicativo JavaScript. O JWT tem um tempo de vida igual ao seu valor de configuração `session.lifetime`. Agora, como o navegador enviará automaticamente o cookie com todas as solicitações subsequentes, você pode fazer solicitações à API do seu aplicativo sem passar explicitamente um token de acesso:

```js
    axios.get('/api/user')
        .then(response => {
            console.log(response.data);
        });
```

<a name="customizing-the-cookie-name"></a>
#### Personalizando o nome do cookie

Se necessário, você pode personalizar o nome do cookie `laravel_token` usando o método `Passport::cookie`. Normalmente, esse método deve ser chamado do método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Passport::cookie('custom_name');
    }
```

<a name="csrf-protection"></a>
#### Proteção CSRF

Ao usar esse método de autenticação, você precisará garantir que um cabeçalho de token CSRF válido esteja incluído em suas solicitações. O scaffolding JavaScript padrão do Laravel inclui uma instância do Axios, que usará automaticamente o valor do cookie `XSRF-TOKEN` criptografado para enviar um cabeçalho `X-XSRF-TOKEN` em solicitações de mesma origem.

::: info NOTA
Se você escolher enviar o cabeçalho `X-CSRF-TOKEN` em vez de `X-XSRF-TOKEN`, precisará usar o token não criptografado fornecido por `csrf_token()`.
:::

<a name="events"></a>
## Eventos

O Passport gera eventos ao emitir tokens de acesso e tokens de atualização. Você pode [ouvir esses eventos](/docs/events) para podar ou revogar outros tokens de acesso em seu banco de dados:

| Nome do Evento                                |
|-----------------------------------------------|
| `Laravel\Passport\Events\AccessTokenCreated`  |
| `Laravel\Passport\Events\RefreshTokenCreated` |

<a name="testing"></a>
## Teste

O método `actingAs` do Passport pode ser usado para especificar o usuário atualmente autenticado, bem como seus escopos. O primeiro argumento dado ao método `actingAs` é a instância do usuário e o segundo é uma matriz de escopos que devem ser concedidos ao token do usuário:

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

O método `actingAsClient` do Passport pode ser usado para especificar o cliente atualmente autenticado, bem como seus escopos. O primeiro argumento dado ao método `actingAsClient` é a instância do cliente e o segundo é uma matriz de escopos que devem ser concedidos ao token do cliente:

::: code-group
```php [Pest]
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

```php [PHPUnit]
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
:::
