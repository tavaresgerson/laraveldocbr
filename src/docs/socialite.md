# Laravel Socialite

<a name="introduction"></a>
## Introdução

Além da autenticação típica baseada em formulário, o Laravel também fornece uma maneira simples e conveniente de autenticar com provedores OAuth usando [Laravel Socialite](https://github.com/laravel/socialite). O Socialite atualmente oferece suporte à autenticação via Facebook, Twitter, LinkedIn, Google, GitHub, GitLab, Bitbucket e Slack.

::: info NOTA
Adaptadores para outras plataformas estão disponíveis no site [Socialite Providers](https://socialiteproviders.com/) conduzido pela comunidade.
:::

<a name="installation"></a>
## Instalação

Para começar a usar o Socialite, use o gerenciador de pacotes do Composer para adicionar o pacote às dependências do seu projeto:

```shell
composer require laravel/socialite
```

<a name="upgrading-socialite"></a>
## Atualizando o Socialite

Ao atualizar para uma nova versão principal do Socialite, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/socialite/blob/master/UPGRADE.md).

<a name="configuration"></a>
## Configuração

Antes de usar o Socialite, você precisará adicionar credenciais para os provedores OAuth que seu aplicativo utiliza. Normalmente, essas credenciais podem ser recuperadas criando um "aplicativo de desenvolvedor" no painel do serviço com o qual você fará a autenticação.

Essas credenciais devem ser colocadas no arquivo de configuração `config/services.php` do seu aplicativo e devem usar a chave `facebook`, `twitter` (OAuth 1.0), `twitter-oauth-2` (OAuth 2.0), `linkedin-openid`, `google`, `github`, `gitlab`, `bitbucket`, `slack` ou `slack-openid`, dependendo dos provedores que seu aplicativo requer:

```php
    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => 'http://example.com/callback-url',
    ],
```

::: info NOTA
Se a opção `redirect` contiver um caminho relativo, ele será automaticamente resolvido para uma URL totalmente qualificada.
:::

<a name="authentication"></a>
## Autenticação

<a name="routing"></a>
### Roteamento

Para autenticar usuários usando um provedor OAuth, você precisará de duas rotas: uma para redirecionar o usuário para o provedor OAuth e outra para receber o retorno de chamada do provedor após a autenticação. As rotas de exemplo abaixo demonstram a implementação de ambas as rotas:

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

O método `redirect` fornecido pela fachada `Socialite` cuida do redirecionamento do usuário para o provedor OAuth, enquanto o método `user` examinará a solicitação recebida e recuperará as informações do usuário do provedor após a aprovação da solicitação de autenticação.

<a name="authentication-and-storage"></a>
### Autenticação e armazenamento

Depois que o usuário for recuperado do provedor OAuth, você pode determinar se o usuário existe no banco de dados do seu aplicativo e [autenticar o usuário](/docs/{{version}}/authentication#authenticate-a-user-instance). Se o usuário não existir no banco de dados do seu aplicativo, você normalmente criará um novo registro no seu banco de dados para representar o usuário:

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

::: info NOTA
Para obter mais informações sobre quais informações do usuário estão disponíveis em provedores OAuth específicos, consulte a documentação sobre [recuperação de detalhes do usuário](#retrieving-user-details).
:::

<a name="access-scopes"></a>
### Escopos de acesso

Antes de redirecionar o usuário, você pode usar o método `scopes` para especificar os "escopos" que devem ser incluídos na solicitação de autenticação. Este método mesclará todos os escopos especificados anteriormente com os escopos que você especificar:

```php
    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('github')
        ->scopes(['read:user', 'public_repo'])
        ->redirect();
```

Você pode substituir todos os escopos existentes na solicitação de autenticação usando o método `setScopes`:

```php
    return Socialite::driver('github')
        ->setScopes(['read:user', 'public_repo'])
        ->redirect();
```

<a name="slack-bot-scopes"></a>
### Escopos de bot do Slack

A API do Slack fornece [diferentes tipos de tokens de acesso](https://api.slack.com/authentication/token-types), cada um com seu próprio conjunto de [escopos de permissão](https://api.slack.com/scopes). O Socialite é compatível com os dois tipos de tokens de acesso do Slack a seguir:

- Bot (prefixado com `xoxb-`)
- Usuário (prefixado com `xoxp-`)

Por padrão, o driver `slack` gerará um token `user` e invocar o método `user` do driver retornará os detalhes do usuário.

Os tokens de bot são úteis principalmente se seu aplicativo enviará notificações para espaços de trabalho externos do Slack que são de propriedade dos usuários do seu aplicativo. Para gerar um token de bot, invoque o método `asBotUser` antes de redirecionar o usuário para o Slack para autenticação:

```php
    return Socialite::driver('slack')
        ->asBotUser()
        ->setScopes(['chat:write', 'chat:write.public', 'chat:write.customize'])
        ->redirect();
```

Além disso, você deve invocar o método `asBotUser` antes de invocar o método `user` depois que o Slack redirecionar o usuário de volta para seu aplicativo após a autenticação:

```php
    $user = Socialite::driver('slack')->asBotUser()->user();
```

Ao gerar um token de bot, o método `user` ainda retornará uma instância `Laravel\Socialite\Two\User`; no entanto, apenas a propriedade `token` será hidratada. Este token pode ser armazenado para [enviar notificações para os espaços de trabalho do Slack do usuário autenticado](/docs/{{version}}/notifications#notifying-external-slack-workspaces).

<a name="optional-parameters"></a>
### Parâmetros opcionais

Vários provedores OAuth oferecem suporte a outros parâmetros opcionais na solicitação de redirecionamento. Para incluir quaisquer parâmetros opcionais na solicitação, chame o método `with` com uma matriz associativa:

```php
    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('google')
        ->with(['hd' => 'example.com'])
        ->redirect();
```

::: warning AVISO
Ao usar o método `with`, tome cuidado para não passar nenhuma palavra-chave reservada, como `state` ou `response_type`.
:::

<a name="retrieving-user-details"></a>
## Recuperando detalhes do usuário

Após o usuário ser redirecionado de volta para a rota de retorno de autenticação do seu aplicativo, você pode recuperar os detalhes do usuário usando o método `user` do Socialite. O objeto do usuário retornado pelo método `user` fornece uma variedade de propriedades e métodos que você pode usar para armazenar informações sobre o usuário em seu próprio banco de dados.

Propriedades e métodos diferentes podem estar disponíveis neste objeto dependendo se o provedor OAuth com o qual você está autenticando oferece suporte a OAuth 1.0 ou OAuth 2.0:

```php
    use Laravel\Socialite\Facades\Socialite;

    Route::get('/auth/callback', function () {
        $user = Socialite::driver('github')->user();

        // provedor OAuth 2.0...
        $token = $user->token;
        $refreshToken = $user->refreshToken;
        $expiresIn = $user->expiresIn;

        // provedor OAuth 1.0...
        $token = $user->token;
        $tokenSecret = $user->tokenSecret;

        // Todos os provedores...
        $user->getId();
        $user->getNickname();
        $user->getName();
        $user->getEmail();
        $user->getAvatar();
    });
```

<a name="retrieving-user-details-from-a-token-oauth2"></a>
#### Recuperando detalhes do usuário de um token (OAuth2)

Se você já tem um token de acesso válido para um usuário, pode recuperar os detalhes do usuário usando o método `userFromToken` do Socialite:

```php
    use Laravel\Socialite\Facades\Socialite;

    $user = Socialite::driver('github')->userFromToken($token);
```

Se você estiver usando o Facebook Limited Login por meio de um aplicativo iOS, o Facebook retornará um token OIDC em vez de um token de acesso. Como um token de acesso, o token OIDC pode ser fornecido ao método `userFromToken` para recuperar os detalhes do usuário.

<a name="retrieving-user-details-from-a-token-and-secret-oauth1"></a>
#### Recuperando detalhes do usuário de um token e segredo (OAuth1)

Se você já tem um token e segredo válidos para um usuário, pode recuperar os detalhes do usuário usando o método `userFromTokenAndSecret` do Socialite:

```php
    use Laravel\Socialite\Facades\Socialite;

    $user = Socialite::driver('twitter')->userFromTokenAndSecret($token, $secret);
```

<a name="stateless-authentication"></a>
#### Autenticação sem estado

O método `stateless` pode ser usado para desabilitar a verificação do estado da sessão. Isso é útil ao adicionar autenticação social a uma API sem estado que não utiliza sessões baseadas em cookies:

```php
    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('google')->stateless()->user();
```

::: warning AVISO
A autenticação sem estado não está disponível para o driver Twitter OAuth 1.0.
:::
