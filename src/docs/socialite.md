# Laravel Socialite

<a name="introduction"></a>
## Introdução

Além do sistema de autenticação por formulário padrão, o Laravel também oferece uma maneira simples e conveniente de se autenticar usando provedores OAuth através do [Laravel Socialite](https://github.com/laravel/socialite). Atualmente o Socialite suporta a autenticação via Facebook, Twitter, LinkedIn, Google, GitHub, GitLab, Bitbucket e Slack.

> Nota:
> Adaptações para outras plataformas estão disponíveis através do site [Provedores Socialite](https://socialiteproviders.com/).

<a name="installation"></a>
## Instalação

Para começar com o Socialite, use o Composer para adicionar o pacote ao projeto como dependência:

```shell
composer require laravel/socialite
```

<a name="upgrading-socialite"></a>
## Atualizando o Socialite

Ao atualizar para uma nova versão principal do Socialite, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/socialite/blob/master/UPGRADE.md).

<a name="configuration"></a>
## Configuração

Antes de usar o Socialite, você precisará adicionar credenciais para os provedores OAuth que seu aplicativo utiliza. Normalmente, essas credenciais podem ser obtidas criando uma "aplicação do desenvolvedor" no painel do serviço com o qual você será autenticado.

Estas credenciais devem ser colocadas na sua aplicação' 'config/services.php', e deve usar a chave "facebook", "twitter" (OAuth 1.0), "twitter-oauth-2" (OAuth 2.0), "linkedin-openid", "google", "github", "gitlab", "bitbucket", "slack" ou "slack-openid", dependendo dos provedores sua aplicação requer:

```php
    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => 'http://example.com/callback-url',
    ],
```

> Note:
> Se a opção 'redirect' contém um caminho relativo, ele será automaticamente resolvido em uma URL totalmente qualificada.

<a name="authentication"></a>
## Autenticação

<a name="routing"></a>
### Roteamento

Para autenticar usuários usando um provedor OAuth, você precisará de duas rotas: uma para redirecionar o usuário ao provedor OAuth e outra para receber a resposta do provedor após a autenticação. As rotas de exemplo abaixo demonstram a implementação das duas rotas:

```php
    use Laravel\Socialite\Facades\Socialite;

    Route::get('/auth/redirect', function () {
        return Socialite::driver('github')->redirect();
    });

    Route::get('/auth/callback', function () {
        $user = Socialite::driver('github')->user();

        // $user->token
    });
```

O método `redirect` fornecido pela fachada `Socialite` cuida de redirecionar o usuário ao provedor de OAuth, enquanto o método `user` examinará a solicitação entrante e buscará as informações do usuário do provedor depois que eles aprovaram a solicitação de autenticação.

<a name="authentication-and-storage"></a>
### Autenticação e Armazenamento

Depois que o usuário for recuperado do provedor OAuth, você pode determinar se o usuário existe no banco de dados da sua aplicação e [autenticar uma instância do usuário](/docs/{{version}}/authentication#authenticate-a-user-instance). Se o usuário não existir no banco de dados da sua aplicação, você normalmente criará um novo registro no seu banco de dados para representar o usuário:

```php
    use App\Models\User;
    use Illuminate\Support\Facades\Auth;
    use Laravel\Socialite\Facades\Socialite;

    Route::get('/auth/callback', function () {
        $githubUser = Socialite::driver('github')->user();

        $user = User::updateOrCreate([
            'github_id' => $githubUser->id,
        ], [
            'name' => $githubUser->name,
            'email' => $githubUser->email,
            'github_token' => $githubUser->token,
            'github_refresh_token' => $githubUser->refreshToken,
        ]);

        Auth::login($user);

        return redirect('/dashboard');
    });
```

> [!NOTA]
> Para mais informações sobre quais dados do usuário estão disponíveis de fornecedores OAuth específicos, por favor consulte a documentação em [obtenção de detalhes do usuário](#obtenção-de-detalhes-do-usuário).

<a name="access-scopes"></a>
### Âmbito de acesso

Antes de redirecionar o usuário, você pode usar o método "scopes" para especificar os "scopes" que devem ser incluídos na solicitação de autenticação. Este método irá mesclar todos os escopos já especificados com os escopos que você especifica:

```php
    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('github')
        ->scopes(['read:user', 'public_repo'])
        ->redirect();
```

Você pode sobrescrever todos os escopos existentes na solicitação de autenticação usando o método `setScopes`:

```php
    return Socialite::driver('github')
        ->setScopes(['read:user', 'public_repo'])
        ->redirect();
```

<a name="slack-bot-scopes"></a>
### Bot do Slack

A API do Slack oferece [diferentes tipos de tokens de acesso](https://api.slack.com/authentication/token-types), cada um com seus próprios escopos de permissão. O Socialite é compatível com ambos os tipos de token de acesso do Slack:

<div class="content-list" markdown="1">

Bot (Prefixo com "xoxb-")
- Usuário (prefixo com "xoxp-")

</div>

Por padrão, o driver 'slack' irá gerar um 'token' do usuário e invocar o método 'user' do driver irá retornar os detalhes do usuário.

Tokens de robôs são principalmente úteis se seu aplicativo enviará notificações para espaços de trabalho externos do Slack que são de propriedade dos usuários do seu aplicativo. Para gerar um token do robô, invoque o método `asBotUser` antes de redirecionar o usuário para o Slack para autenticação:

```php
    return Socialite::driver('slack')
        ->asBotUser()
        ->setScopes(['chat:write', 'chat:write.public', 'chat:write.customize'])
        ->redirect();
```

Além disso, você deve invocar o método 'asBotUser' antes de invocar o método 'user' após o Slack redirecionar o usuário para seu aplicativo após a autenticação:

```php
    $user = Socialite::driver('slack')->asBotUser()->user();
```

Ao gerar um bot token, o método 'user' retornará uma instância de 'Laravel\Socialite\Two\User'; no entanto, apenas a propriedade 'token' será hidratada. Este token pode ser armazenado para enviar notificações para os espaços de trabalho do Slack autenticado do usuário ([ver documentação](https://docs.laravel.com/master/notifications#notifying-external-slack-workspaces)).

<a name="optional-parameters"></a>
### Parâmetros Opcionais

Vários provedores OAuth suportam parâmetros opcionais na requisição de redirecionamento. Para incluir quaisquer parâmetros opcionais na solicitação, chame o método com um array associativo:

```php
    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('google')
        ->with(['hd' => 'example.com'])
        ->redirect();
```

> [!AVISO]
> Ao usar o método `with`, tenha cuidado para não passar nenhum dos parâmetros reservados tais como `state` ou `response_type`.

<a name="retrieving-user-details"></a>
## Recuperação de detalhes do usuário

Após o usuário ser redirecionado de volta para sua rota de retorno da autenticação do aplicativo, você pode recuperar os detalhes do usuário usando o método 'user' do Socialite. O objeto de usuário retornado pelo método 'user' fornece uma variedade de propriedades e métodos que você pode usar para armazenar informações sobre o usuário no seu próprio banco de dados.

Diferentes propriedades e métodos podem estar disponíveis para este objeto, dependendo se o provedor OAuth com o qual você está autenticando suporta OAuth 1.0 ou OAuth 2.0:

```php
    use Laravel\Socialite\Facades\Socialite;

    Route::get('/auth/callback', function () {
        $user = Socialite::driver('github')->user();

        // OAuth 2.0 providers...
        $token = $user->token;
        $refreshToken = $user->refreshToken;
        $expiresIn = $user->expiresIn;

        // OAuth 1.0 providers...
        $token = $user->token;
        $tokenSecret = $user->tokenSecret;

        // All providers...
        $user->getId();
        $user->getNickname();
        $user->getName();
        $user->getEmail();
        $user->getAvatar();
    });
```

<a name="retrieving-user-details-from-a-token-oauth2"></a>
#### Recuperando Detalhes de Usuário De Um Token (OAuth2)

Se você já tem um token de acesso válido para um usuário, você pode recuperar seus detalhes usando o método `userFromToken` do Socialite:

```php
    use Laravel\Socialite\Facades\Socialite;

    $user = Socialite::driver('github')->userFromToken($token);
```

Se você estiver usando o Login Limitado do Facebook através de um aplicativo iOS, o Facebook retornará um token OIDC em vez de um token de acesso. Como um token de acesso, o token OIDC pode ser fornecido ao método `userFromToken` para recuperar detalhes do usuário.

<a name="retrieving-user-details-from-a-token-and-secret-oauth1"></a>
#### Recuperando Detalhes do Usuário de um Token e Segredo (OAuth1)

Se você já tem um token válido e segredo para um usuário, você pode buscar os detalhes do usuário usando o método `userFromTokenAndSecret` de Socialite.

```php
    use Laravel\Socialite\Facades\Socialite;

    $user = Socialite::driver('twitter')->userFromTokenAndSecret($token, $secret);
```

<a name="stateless-authentication"></a>
#### Autenticação sem estado

O método `stateless` pode ser utilizado para desativar a verificação do estado da sessão. Isto é útil quando se adiciona autenticação social a uma API sem estado que não utiliza sessões baseadas em cookies:

```php
    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('google')->stateless()->user();
```

> [AVERTÊNCIA]
> A autenticação sem estado não é suportada pelo driver do Twitter OAuth 1.0
