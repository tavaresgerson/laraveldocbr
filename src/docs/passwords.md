# Reiniciar Senhas

<a name="introduction"></a>
## Introdução

 A maioria das aplicações Web permite ao utilizador recuperar a sua palavra-passe esquecida. Em vez de o obrigarem a implementar novamente isto manualmente para cada aplicação que criam, o Laravel fornece serviços convenientes para enviar links de recuperação da palavra-passe e redefinição segura das mesmas.

 > [!AVISO]
 [Kit de Iniciação para Aplicação (Starter Kits)](/docs/starter-kits) em uma nova aplicativo Laravel. O starter kit do Laravel cuidará do mapeamento todo o sistema de autenticação, incluindo a recuperação de senhas esquecidas.

<a name="model-preparation"></a>
### Preparação do modelo

 Antes de utilizar os recursos para redefinição da senha do Laravel, o modelo `App\Models\User` da sua aplicação deve usar a trajetória `Illuminate\Notifications\Notifiable`. Normalmente, essa trajetória já está incluída no modelo padrão `App\Models\User` que é criado em novas aplicações Laravel.

 Em seguida, verifique se o seu modelo `App\Models\User` implementa o contrato `Illuminate\Contracts\Auth\CanResetPassword`. O modelo `App\Models\User`, incluído no framework, já implementa essa interface e usa a trilha `Illuminate\Auth\Passwords\CanResetPassword` para incluir os métodos necessários para implementar a interface.

<a name="database-preparation"></a>
### Preparações da base de dados

 É necessário criar uma tabela para armazenar os tokens de redefinição da senha do seu aplicativo. Normalmente, isso está incluído na migração de banco de dados padrão `0001_01_01_000000_create_users_table.php` do Laravel.

<a name="configuring-trusted-hosts"></a>
### Configure host`s confiáveis

 Por padrão, o Laravel responderá a todas as solicitações recebidas independentemente do conteúdo do cabeçalho `Host` da solicitação HTTP. Além disso, o valor do cabeçalho `Host` será usado quando for gerada uma URL absoluta para sua aplicação durante uma solicitação web.

 Normalmente, você deve configurar seu servidor web, como Nginx ou Apache, para enviar solicitações somente ao aplicativo que corresponda a um nome de host específico. No entanto, se você não tiver a capacidade de customizar seu servidor web diretamente e precisar instruir o Laravel para responder apenas a nomes de host específicos, é possível fazer isso usando o método middleware `trustHosts` no arquivo `bootstrap/app.php` do seu aplicativo. Isso é particularmente importante quando seu aplicativo oferece funcionalidade para redefinição da senha.

 Para saber mais sobre este método de middleware, consulte a documentação do middleware ["TrustHosts"](/docs/requests#configuring-trusted-hosts).

<a name="routing"></a>
## Encaminhamento

 Para implementar corretamente o suporte para permitir que os usuários redefinam suas senhas, será necessário definir várias rotas. Primeiro, precisamos de um par de rotas para permitir que o usuário solicite um link de redefinição da senha por meio do endereço de e-mail. Em segundo lugar, precisamos de outro par de rotas para redefinir a senha depois que o usuário visitar o link de redefinição que recebeu no e-mail e preencher o formulário de redefinição da senha.

<a name="requesting-the-password-reset-link"></a>
### Pedido do link de redefinição da senha

<a name="the-password-reset-link-request-form"></a>
#### O formulário de solicitação do link para redefinição da senha

 Primeiro definimos as rotas necessárias para solicitar links de redefinição da senha. Para começar, definiremos uma rota que retorna uma página com o formulário de solicitação do link da redefinição da senha:

```php
    Route::get('/forgot-password', function () {
        return view('auth.forgot-password');
    })->middleware('guest')->name('password.request');
```

 A visualização que é retornada por esse caminho deve ter um formulário contendo um campo `email`, que permitirá ao usuário solicitar o link de redefinição da senha para um determinado endereço de e-mail.

<a name="password-reset-link-handling-the-form-submission"></a>
#### Como lidar com o envio do formulário

 Em seguida, definiremos um caminho que manipula o pedido de envio do formulário da visualização "esqueceu sua senha". Este caminho será responsável por validar o endereço de e-mail e enviar o pedido de redefinição da senha para o usuário correspondente:

```php
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Password;

    Route::post('/forgot-password', function (Request $request) {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
                    ? back()->with(['status' => __($status)])
                    : back()->withErrors(['email' => __($status)]);
    })->middleware('guest')->name('password.email');
```

 Antes de continuar, vamos examinar essa rota em mais detalhes. Primeiro, o atributo `email` da requisição é validado. Em seguida, usaremos o "password broker" in-built do Laravel (por meio da interface facal `Password`) para enviar um link de redefinição de senha ao usuário. O password broker se encarregará de recuperar o usuário pelo campo especificado (neste caso, o endereço de e-mail) e enviar um link de redefinição de senha para o usuário através do sistema de notificações in-built do Laravel.

 O método `sendResetLink` retorna um "status" slug. Este status pode ser traduzido usando as ajudas do Laravel para [localização](/docs/localization) com o objetivo de exibir uma mensagem amigável ao utilizador sobre o estado da sua solicitação. A tradução do estado do respetivo pedido é determinada pelo ficheiro de linguagens `{lang}/passwords.php` da aplicação. Uma entrada para cada possível valor slug de estado pode ser encontrado dentro do ficheiro de linguagens `passwords`.

 > [!OBSERVAÇÃO]
 > Por padrão, o esqueleto do aplicativo Laravel não inclui a pasta `lang`. Se você deseja personalizar os arquivos de idioma do Laravel, pode publicá-los pelo comando `lang:publish` do Artisan.

 Pode estar a perguntar-se como o Laravel sabe recolher o registo do utilizador no banco de dados da aplicação quando chama o método `sendResetLink` da facade `Password`. O agente de senhas do Laravel utiliza os "fornecedores de usuários" do sistema de autenticação para recuperar os registos do banco de dados. O fornecedor de usuário utilizado pelo agente de senhas é configurado no array de configurações `passwords` do seu ficheiro de configuração `config/auth.php`. Para saber mais sobre como escrever fornecedores de usuários personalizados, consulte a [documentação de autenticação] (/docs/autenticação#adicionar-fornecedores-de-usuário-personalizados).

 > [!ATENÇÃO]
 [Kits de inicialização para aplicações Laravel](/)

<a name="resetting-the-password"></a>
### Redefinição da senha

<a name="the-password-reset-form"></a>
#### O formulário de redefinição da senha

 Em seguida, definiremos as rotas necessárias para realmente redefinir a senha após o usuário clicar no link de redefinição da senha enviado por e-mail e fornecer uma nova senha. Primeiro, vamos definir a rota que exibirá o formulário de redefinição da senha que é exibido quando o usuário clica no link para redefinir sua senha. Essa rota receberá um parâmetro `token` que usaríamos posteriormente para verificar o pedido de redefinição da senha:

```php
    Route::get('/reset-password/{token}', function (string $token) {
        return view('auth.reset-password', ['token' => $token]);
    })->middleware('guest')->name('password.reset');
```

 A visualização retornada por este caminho deverá exibir um formulário que contenha um campo "e-mail", um campo "senha", um campo "confirmar senha" e um campo "token" oculto, que deve conter o valor do segredo `$token` recebido pela nossa rota.

<a name="password-reset-handling-the-form-submission"></a>
#### Gerenciar o envio do formulário

 Obviamente, precisamos definir uma rota para realmente lidar com o envio do formulário de redefinição da senha. Essa rota será responsável por validar a solicitação recebida e atualizar a senha do usuário no banco de dados:

```php
    use App\Models\User;
    use Illuminate\Auth\Events\PasswordReset;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Support\Facades\Password;
    use Illuminate\Support\Str;

    Route::post('/reset-password', function (Request $request) {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
                    ? redirect()->route('login')->with('status', __($status))
                    : back()->withErrors(['email' => [__($status)]]);
    })->middleware('guest')->name('password.update');
```

 Antes de continuar, vamos examinar essa rotina com mais detalhes. Primeiro, os atributos `token`, `email` e `password` da solicitação são validados. Em seguida, usaremos o "password broker" incorporado ao Laravel (por meio do facade `Password`) para validar as credenciais da solicitação de redefinição da senha.

 Se o token, endereço de email e senha forem válidos no gestor de senhas, a invocação da função `reset` será feita com sucesso. Nesta função que recebe como argumentos uma instância do tipo usuário e uma palavra-passe em texto simples fornecida pela tela de redefinição de senha, poderemos atualizar a palavra-passe do utilizador na base de dados.

 O método `reset` retorna um "status". Esse status pode ser traduzido usando as ajudas de [localização] (localização) do Laravel para exibir uma mensagem amigável ao usuário sobre o estado da sua solicitação. A tradução do status da redefinição da senha é determinada pelo arquivo de idiomas `lang/{lang}/passwords.php` de sua aplicação. Uma entrada para cada valor possível do slug status está localizado dentro do arquivo de idiomas `passwords`. Se a sua aplicação não possuir um diretório `lang`, você pode criá-lo usando o comando Arti&ccedil;l `lang:publish`.

 Antes de continuar, pode estar a perguntar-se como o Laravel sabe como recuperar os registos do utilizador da base de dados da aplicação ao chamar o método `reset` da faca do `Password`. O agente de password do Laravel utiliza "provedores de utilizadores" no seu sistema de autenticação para recuperar os registos da base de dados. O provedor de utilizador utilizado pelo agente de password é configurado no array de configuração `passwords` do ficheiro de configuração `config/auth.php`. Para saber mais sobre a escrita de provedores de utilizadores personalizados, consulte o [documentação da autenticação](/docs/authentication#adding-custom-user-providers).

<a name="deleting-expired-tokens"></a>
## Excluindo tokens expirados

 Os tokens de redefinição da senha que expiraram ainda estarão no seu banco de dados. No entanto, você poderá excluir esses registros facilmente usando o comando `auth:clear-resets` do Artisan:

```shell
php artisan auth:clear-resets
```

 Se você deseja automatizar esse processo, considere adicionar o comando ao agendador da aplicação:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('auth:clear-resets')->everyFifteenMinutes();
```

<a name="password-customization"></a>
## Personalização

<a name="reset-link-customization"></a>
#### Personalizar o botão de reset

 Pode personalizar o URL do link de redefinição da senha utilizando a metodologia `createUrlUsing`, fornecida pela classe de notificação `ResetPassword`. Esta metodologia aceita um fecho, que recebe a instância do usuário que irá receber a notificação, bem como o token para o link da redefinição da senha. Normalmente, deve chamar esta metodologia no método `boot` do serviço do `App\Providers\AppServiceProvider`:

```php
    use App\Models\User;
    use Illuminate\Auth\Notifications\ResetPassword;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (User $user, string $token) {
            return 'https://example.com/reset-password?token='.$token;
        });
    }
```

<a name="reset-email-customization"></a>
#### Redefinir a personalização do email

 Você pode facilmente modificar a classe de notificação usada para enviar o link de redefinição de senha ao usuário. Para começar, modifique o método `sendPasswordResetNotification` no seu modelo `App\Models\User`. Dentro deste método, você pode enviar a notificação usando qualquer classe [de notificação](/docs/notifications) de sua própria criação. O token de redefinição da senha é o primeiro argumento recebido pelo método. Você pode usar esse `$token` para construir o URL de redefinição de senha que você preferir e enviar a notificação ao usuário:

```php
    use App\Notifications\ResetPasswordNotification;

    /**
     * Send a password reset notification to the user.
     *
     * @param  string  $token
     */
    public function sendPasswordResetNotification($token): void
    {
        $url = 'https://example.com/reset-password?token='.$token;

        $this->notify(new ResetPasswordNotification($url));
    }
```
