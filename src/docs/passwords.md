# Redefinir senhas

<a name="introduction"></a>
## Introdução

A maioria dos aplicativos da web oferecem um método para os usuários redefinirem suas senhas esquecidas. Em vez de forçar a reimplementação desta funcionalidade manualmente em cada aplicativo que você cria, o Laravel oferece serviços convenientes para enviar links de redefinição de senha e redefinir senhas com segurança.

> [¡NOTA!]
> Quer começar rápido? Instale um [kit de inicialização de aplicação Laravel](/docs/starter-kits) em um novo aplicativo Laravel. Os kits de inicialização do Laravel cuidarão de todo sistema de autenticação, incluindo redefinição de senha esquecida.

<a name="model-preparation"></a>
### Preparação do Modelo

Antes de usar as funcionalidades do Laravel de redefinição de senha, seu modelo 'App\Models\User' deve usar o recurso 'Illuminate\Notifications\Notifiable'. Normalmente, esse recurso já está incluído no modelo padrão 'App\Models\User' que é criado com novas aplicações Laravel.

Em seguida, verifique se o modelo de usuário 'App\Models\User' implementa o contrato 'Illuminate\Contracts\Auth\CanResetPassword'. O modelo de usuário 'App\Models\User' já implementa essa interface e usa a trait 'Illuminate\Auth\Passwords\CanResetPassword' para incluir os métodos necessários para implementar a interface.

<a name="database-preparation"></a>
### Preparação do banco de dados

Uma tabela deve ser criada para armazenar tokens de redefinição de senha do seu aplicativo. Geralmente, isso está incluído na migração padrão do banco de dados "0001_01_01_000000_create_users_table.php" do Laravel.

<a name="configuring-trusted-hosts"></a>
### Configurando Hosts Confiáveis

Por padrão, Laravel irá responder a todas as requisições que recebe independentemente do conteúdo da requisição HTTP 'Host'. Além disso, o valor do cabeçalho 'Host' será utilizado quando gerar URLs absolutas para o seu aplicativo durante um pedido na Web.

Tipicamente, você deve configurar seu servidor web, como Nginx ou Apache para enviar apenas solicitações para sua aplicação que correspondam a um nome de host específico. No entanto, se você não tiver a capacidade de personalizar diretamente seu servidor web e precisar instruir o Laravel para responder apenas a determinados nomes de hosts, você pode fazer isso usando o método de middleware `trustHosts` no arquivo `bootstrap/app.php` da sua aplicação. Isso é particularmente importante quando sua aplicação oferece funcionalidade de redefinição de senha.

Para mais informações sobre este método de middleware, por favor verifique a documentação do middleware TrustHosts em `/docs/requests#configurando-hospedeiros-confiables`.

<a name="routing"></a>
## Roteamento

Para implementar corretamente o suporte para permitir que os usuários redefinam suas senhas, precisaremos definir várias rotas. Primeiro, precisaremos de um par de rotas para lidar com permitindo que o usuário solicite um link para redefinição da senha por meio de seu endereço de e-mail. Em segundo lugar, precisaremos de um par de rotas para lidar com a redefinição real da senha quando o usuário visitar o link para redefinição da senha enviado por e-mail e concluir o formulário para redefinição da senha.

<a name="requesting-the-password-reset-link"></a>
### Pedindo o link para redefinição de senha

<a name="the-password-reset-link-request-form"></a>
#### Formulário de Solicitação de Recuperação da Senha

Primeiro, definiremos as rotas que são necessárias para solicitar os links de redefinição de senha. Para começar, vamos definir uma rota que retorna uma visão com o formulário de solicitação do link de redefinição de senha:

```php
    Route::get('/forgot-password', function () {
        return view('auth.forgot-password');
    })->middleware('guest')->name('password.request');
```

A visão que será retornada por esta rota deve ter um formulário contendo um campo 'email', que permitirá ao usuário solicitar um link para redefinição de senha para um determinado endereço de e-mail.

<a name="password-reset-link-handling-the-form-submission"></a>
#### Tratamento do envio do formulário

A seguir, definiremos uma rota que manipula o pedido de envio do formulário do "esqueci minha senha" da "visão". Essa rota será responsável por validar o endereço do e-mail e enviar o pedido de redefinição da senha ao usuário correspondente.

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

Antes de prosseguir, vamos examinar esta rota em mais detalhes. Primeiro, o atributo 'email' da solicitação é validado. Em seguida, usaremos o "broker de senha" interno do Laravel (via a fachada 'Password') para enviar um link de redefinição de senha ao usuário. O broker de senha cuidará de recuperar o usuário pelo campo fornecido (neste caso, o endereço de e-mail) e de enviar uma mensagem de redefinição de senha ao usuário via o sistema de notificação interno do Laravel [sistema de notificações].

O método `sendResetLink` retorna um "status" slug. Esse status pode ser traduzido usando os [helpers de localização](/docs/localization) do Laravel para que a mensagem de status seja amigável ao usuário em relação à situação do seu pedido. A tradução do status do redefinição de senha é determinada pelo arquivo de idioma `lang/{lang}/passwords.php` do seu aplicativo. Uma entrada para cada valor possível do slug de status está localizada dentro do arquivo de idioma `passwords`.

> [NOTA]
> Por padrão, o esqueleto da aplicação Laravel não inclui a pasta `lang`. Se você gostaria de personalizar os arquivos de idioma do Laravel, você pode publicá-los usando o comando Artisan `lang:publish`.

Você pode estar se perguntando como o Laravel sabe como recuperar o registro do usuário do banco de dados da sua aplicação quando você chama o método `sendResetLink` da fachada `Password`. O broker de senha do Laravel utiliza os "fornecedores de usuários" do seu sistema de autenticação para recuperar registros do banco de dados. O fornecedor de usuários utilizado pelo broker de senha é configurado dentro do array de configuração `passwords` no arquivo de configuração `config/auth.php`. Para saber mais sobre a escrita de fornecedores de usuários personalizados, consulte a [documentação de autenticação](/docs/authentication#adding-custom-user-providers).

> [NOTA]
> Quando você implementa manualmente redefinição de senha, é necessário definir o conteúdo das views e das rotas por conta própria. Se deseja um framework que inclua a lógica necessária de autenticação e verificação, veja os [Kit Iniciante Laravel](/docs/starter-kits).

<a name="resetting-the-password"></a>
### Redefinindo senha

<a name="the-password-reset-form"></a>
#### O formulário de redefinição de senha

Em seguida, vamos definir as rotas necessárias para realmente redefinir a senha uma vez que o usuário clicar no link de redefinição da senha enviado para ele e fornecer uma nova senha. Primeiro, vamos definir a rota que exibirá o formulário de redefinição da senha que é exibido quando o usuário clica na ligação de redefinição da senha. Esta rota receberá um parâmetro "token" que usaremos depois para verificar a solicitação de redefinição da senha:

```php
    Route::get('/reset-password/{token}', function (string $token) {
        return view('auth.reset-password', ['token' => $token]);
    })->middleware('guest')->name('password.reset');
```

A visualização retornada por essa rota deve exibir um formulário contendo um `email` campo, um `password` campo, um `password_confirmation` campo, e um `token` campo oculto que deve conter o valor do segredo `$token` recebido por nossa rota.

<a name="password-reset-handling-the-form-submission"></a>
#### Tratando a Envio do Formulário

É claro que precisamos definir uma rota para lidar de fato com o envio do formulário de redefinição da senha. Essa rota será responsável por validar a solicitação recebida e atualizar a senha do usuário no banco de dados.

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

Antes de prosseguir vamos examinar esta rota em mais detalhes. Primeiro, os atributos "token", "email" e "senha" são validados. Em seguida, utilizaremos o "password broker"  (via o `Password` facade) do Laravel para validar as credenciais de solicitação de redefinição da senha.

Se o token, endereço de e-mail e senha fornecidos ao corretor de senha são válidos, a chamada passada para o método 'reset' será invocada. Dentro desta chamada, que recebe a instância do usuário e a senha simples fornecida ao formulário de redefinição de senha, podemos atualizar a senha do usuário no banco de dados.

O método 'reset' retorna um "status" slug. Este status pode ser traduzido usando os [auxiliares de localização](/docs/localization) do Laravel para exibir uma mensagem amigável ao usuário sobre o status do pedido dele. A tradução do estado da redefinição de senha é determinada pelo arquivo de idioma do seu aplicativo 'lang/{lang}/passwords.php'. Uma entrada para cada valor possível do slug de status é localizada dentro do arquivo de idioma 'passwords'. Se o seu aplicativo não contém um diretório "lang", você pode criá-lo usando o comando 'lang:publish' Artisan.

Antes de prosseguir, você pode estar se perguntando como o Laravel sabe como obter o registro do usuário do banco de dados ao chamar o método "reset" da fachada "Password". O corretor de senha do Laravel utiliza os "provedores de usuários" do seu sistema de autenticação para obter registros do banco de dados. O provedor de usuário utilizado pelo corretor de senhas é configurado dentro do array de configuração "passwords" do arquivo de configuração "config/auth.php". Para saber mais sobre como escrever provedores de usuários personalizados, consulte a [documentação de autenticação](/docs/authentication#adding-custom-user-providers).

<a name="deleting-expired-tokens"></a>
## Excluindo Tokens expirados

Tokens de redefinição de senha que já expiraram continuarão presentes em sua base de dados. No entanto, você pode facilmente excluir esses registros usando o comando Artisan `auth:clear-resets`:

```shell
php artisan auth:clear-resets
```

Se você gostaria de automatizar este processo, considere adicionar o comando ao seu agendador de aplicativos:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('auth:clear-resets')->everyFifteenMinutes();
```

<a name="password-customization"></a>
## Personalização

<a name="reset-link-customization"></a>
#### Repor link de personalização

Você pode personalizar o URL da referência do redefinição de senha usando o método `createUrlUsing` fornecido pela classe notificação `ResetPassword`. Este método aceita uma função que recebe a instância do usuário que está recebendo a notificação, bem como o token da referência do redefinição de senha. Normalmente, você deve chamar este método do seu provedor de serviços de aplicação `App\Providers\AppServiceProvider` no método 'boot':

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
#### Redefinir Personalização de E-mail

Você pode modificar facilmente a classe de notificação usada para enviar o link de redefinição da senha do usuário. Para começar, substitua o método `sendPasswordResetNotification` no seu modelo de `App\Models\User`. Dentro deste método, você pode enviar a notificação usando qualquer [classe de notificação](/docs/notifications) de sua própria criação. O token de redefinição `$token` é o primeiro argumento recebido pelo método. Você pode usar este `$token` para construir o URL de redefinição da senha do seu agrado e enviar sua notificação ao usuário:

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
