# O Laravel Socialite

<a name="introduction"></a>
## Introdução

 Além da autenticação tipicamente baseada em formulários, o Laravel fornece também uma forma simples e prática de se fazer a autenticação com provedores OAuth usando [Laravel Socialite](https://github.com/laravel/socialite). Atualmente o Socialite suporta autenticação via Facebook, Twitter, LinkedIn, Google, GitHub, GitLab, Bitbucket e Slack.

 > [!ATENÇÃO]
 Website [Fornecedores Sociais](https://socialiteproviders.com/).

<a name="installation"></a>
## Instalação

 Para começar a usar o Socialite, utilize o gerenciador de pacotes do Composer para adicioná-lo às dependências do seu projeto:

```shell
composer require laravel/socialite
```

<a name="upgrading-socialite"></a>
## Atualização do Socialite

 Ao fazer uma atualização para uma nova versão principal do Socialite, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/socialite/blob/master/UPGRADE.md).

<a name="configuration"></a>
## Configuração

 Antes de usar o Socialite, você precisará adicionar as credenciais para os provedores do OAuth que seu aplicativo usa. Normalmente, essas credenciais podem ser obtidas criando um "aplicativo desenvolvedor" dentro da área de trabalho do serviço com o qual você estará se autenticando.

 Estas credenciais devem ser colocadas no arquivo de configuração do seu aplicativo, `config/services.php`, e deve usar a chave `facebook`, `twitter` (OAuth 1.0), `twitter-oauth-2` (OAuth 2.0), `linkedin-openid`, `google`, `github`, `gitlab`, `bitbucket`, `slack`, ou `slack-openid`, dependendo dos provedores exigidos pelo seu aplicativo:

```php
    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => 'http://example.com/callback-url',
    ],
```

 > [!AVISO]
 > Se a opção `redirect` incluir um caminho relativo, este será resolvido automaticamente para uma URL qualificada totalmente.

<a name="authentication"></a>
## Autenticação

<a name="routing"></a>
### Encaminhamento

 Para autenticar os usuários com um provedor de OAuth, será necessário duas rotas: uma para redirecionar o utilizador para o provedor de OAuth e outra para receber a chamada do provedor após a autenticação. Os exemplos de rotas abaixo demonstram a implementação das duas rotas:

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

 O método `redirect`, fornecido pelo "facade" Socialite, cuida do redirecionamento do usuário para o provedor de OAuth. Por outro lado, o método `user` examina a solicitação recebida e recupera as informações sobre o usuário no provedor após o usuário ter aprovado o pedido de autenticação.

<a name="authentication-and-storage"></a>
### Autenticação e armazenamento

 Uma vez que o usuário tenha sido obtido do provedor de OAuth, pode determinar se o utilizador existe na base de dados da aplicação e [autenticar o utilizador](/docs/en/{{ version }}/authentication#authenticate-a-user-instance). Se o utilizador não existir na base de dados da aplicação, normalmente irá criar um novo registro para representar o utilizador:

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
 [ recuperação de detalhes do utilizador (#retrieving-user-details) ].

<a name="access-scopes"></a>
### Acesso a âmbitos

 Antes de redirecionar o usuário, você pode usar o método `scopes` para especificar os "ambientes" que devem ser incluídos na solicitação de autenticação. Este método vai mesclar todos os ambientes especificados anteriormente com aqueles novamente especificados:

```php
    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('github')
        ->scopes(['read:user', 'public_repo'])
        ->redirect();
```

 Você pode substituir todos os escopos existentes no pedido de autenticação usando o método `setScopes`:

```php
    return Socialite::driver('github')
        ->setScopes(['read:user', 'public_repo'])
        ->redirect();
```

<a name="slack-bot-scopes"></a>
### Escopos do bot do Slack

 A API do Slack disponibiliza vários tipos de tokens de acesso (https://api.slack.com/authentication/token-types), cada um com seu próprio conjunto de escopos de permissão (https://api.slack.com/scopes). O Socialite é compatível com os seguintes dois tipos de tokens de acesso do Slack:

<div class="content-list" markdown="1">

 - Bot (prefixado com "xoxb-")
 - Usuário (com o prefixo "xoxp-")

</div>

 Como padrão, o driver slack gerará um token de "usuário" e ao invocar o método `user`, esse driver retornará os detalhes do usuário.

 Tokens de bot são úteis principalmente se o seu aplicativo enviar notificações para espaços externos do Slack que pertencem aos usuários do seu aplicativo. Para gerar um token de bot, chame o método `asBotUser` antes de redirecionar o usuário ao Slack para autenticação:

```php
    return Socialite::driver('slack')
        ->asBotUser()
        ->setScopes(['chat:write', 'chat:write.public', 'chat:write.customize'])
        ->redirect();
```

 Além disso, você deve chamar o método `asBotUser` antes de chamar o método `user` depois que o Slack redireciona o usuário para a sua aplicação após a autenticação:

```php
    $user = Socialite::driver('slack')->asBotUser()->user();
```

 Ao gerar um token do bot, o método `user` ainda retornará uma instância de `Laravel\Socialite\Two\User`. No entanto, só a propriedade `token` será atualizada. Este token pode ser armazenado para [enviar notificações aos espaços de trabalho do Slack do usuário autenticado] (/docs/notifications#notifying-external-slack-workspaces).

<a name="optional-parameters"></a>
### Parâmetros opcionais

 Muitos provedores de OAuth suportam outros parâmetros opcionais no pedido de redirecionamento. Para incluir quaisquer parâmetros opcionais no pedido, chame a metodologia `with` com um array associavio:

```php
    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('google')
        ->with(['hd' => 'example.com'])
        ->redirect();
```

 > [Aviso]
 > Ao usar o método `with`, tenha cuidado para não inserir quaisquer palavras-chave reservadas tais como `state` ou `response_type`.

<a name="retrieving-user-details"></a>
## Recuperando detalhes do usuário

 Após o usuário ser redirecionado para a rota de chamada de autenticação do aplicativo, você poderá recuperar os detalhes do usuário usando o método `user` do Socialite. O objeto de usuário retornado pelo método `user` fornece várias propriedades e métodos que você pode usar para armazenar informações sobre o usuário em sua própria base de dados.

 Dependendo do provedor de OAuth com o qual você está se autenticando, podem estar disponíveis propriedades e métodos diferentes nesse objeto, caso ele suporte OAuth 1.0 ou OAuth 2.0:

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
#### Recuperação de detalhes do utilizador a partir de um token (OAuth2)

 Se você já tem um token de acesso válido para um usuário, poderá recuperar os detalhes desse usuário utilizando o método `userFromToken` do Socialite:

```php
    use Laravel\Socialite\Facades\Socialite;

    $user = Socialite::driver('github')->userFromToken($token);
```

 Se você estiver usando o Login do Facebook Limited via um aplicativo iOS, o Facebook retornará um OIDC token em vez de um token de acesso. Assim como um token de acesso, o OIDC token pode ser fornecido ao método `userFromToken` para recuperar os detalhes do usuário.

<a name="retrieving-user-details-from-a-token-and-secret-oauth1"></a>
#### Recuperação de detalhes do utilizador a partir de um token e segredo (OAuth1)

 Se você já tem um token e um segredo válidos para um usuário, poderá recuperar os detalhes desse usuário usando o método `userFromTokenAndSecret` do Socialite:

```php
    use Laravel\Socialite\Facades\Socialite;

    $user = Socialite::driver('twitter')->userFromTokenAndSecret($token, $secret);
```

<a name="stateless-authentication"></a>
#### Autenticação sem estatuto

 O método `stateless` pode ser usado para desativar a verificação de estado da sessão, o que é útil ao adicionar autenticação social a uma API sem estado que não utiliza sessões baseadas em cookie:

```php
    use Laravel\Socialite\Facades\Socialite;

    return Socialite::driver('google')->stateless()->user();
```

 > [Atenção]
 > A autenticação sem estado não está disponível para o driver de OAuth 1.0 do Twitter.
