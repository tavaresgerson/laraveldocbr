# Confirmação de E-mail

<a name="introduction"></a>
## Introdução

 Muitas aplicações web requerem que os utilizadores verifiquem o seu endereço de correio eletrónico antes de poderem utilizar a aplicação. Em vez de terem de implementar esta funcionalidade manualmente, Laravel oferece serviços integrados para envio e verificação de pedidos de confirmação do email.

 > [!ATENÇÃO]
 [Kits de início rápido para aplicações do Laravel](/docs/starter-kits) em uma aplicação recém-criada do Laravel. Os kits cuidarão da criação de todo o sistema de autenticação, incluindo suporte a verificação por email.

<a name="model-preparation"></a>
### Pré-requisitos de modelos

 Antes de começar, verifique se o modelo `App\Models\User` implementa o contrato `Illuminate\Contracts\Auth\MustVerifyEmail`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Contracts\Auth\MustVerifyEmail;
    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;

    class User extends Authenticatable implements MustVerifyEmail
    {
        use Notifiable;

        // ...
    }
```

 Depois que essa interface for adicionada ao seu modelo, será enviado automaticamente um e-mail contendo um link para confirmação de endereço de e-mail aos usuários recém-registrados. Isso ocorre sem problemas porque o Laravel registra automaticamente o `Illuminate\Auth\Listeners\SendEmailVerificationNotification` [evento de leitores](/docs/events) para o evento `Illuminate\Auth\Events\Registered`.

 Se você estiver implementando o registro manualmente em sua aplicação, em vez de usar um kit inicial [](/docs/starter-kits), deve garantir que envie o evento `Illuminate\Auth\Events\Registered` depois que o registro do usuário for concluído com sucesso:

```php
    use Illuminate\Auth\Events\Registered;

    event(new Registered($user));
```

<a name="database-preparation"></a>
### Preparação da Base de Dados

 Em seguida, a sua tabela `users` deve conter uma coluna `email_verified_at` para armazenar a data e hora em que o endereço de email do usuário foi verificado. Normalmente, isto é incluído na migração de base de dados padrão `0001_01_01_000000_create_users_table.php` no Laravel.

<a name="verification-routing"></a>
## Encaminhamento

 Para implementar corretamente a verificação por e-mail, serão necessárias três rotas. Primeiro, é necessário criar uma rota para exibir um aviso ao usuário informando que ele deverá clicar no link de verificação do e-mail na mensagem de verificação enviada pelo Laravel após o registo.

 Em segundo lugar, será necessário definir um caminho para processar os pedidos gerados quando o usuário clica no link de verificação do endereço eletrónico disponibilizado pelo e-mail.

 Em terceiro lugar, será necessário definir uma rota para reenviar um link de verificação se o usuário perder acidentalmente o primeiro link de verificação.

<a name="the-email-verification-notice"></a>
### O aviso de verificação do e-mail

 Como mencionado anteriormente, uma rotina deve ser definida que irá retornar uma exibição instruindo o usuário a clicar no link de verificação do email enviado por Laravel após o registro. Esta exibição será mostrada aos usuários quando eles tentarem acessar outras partes do aplicativo sem verificar seu endereço de e-mail primeiro. Lembre-se, o link é automaticamente enviado pelo aplicativo, contanto que o modelo `App\Models\User` implemente a interface `MustVerifyEmail`:

```php
    Route::get('/email/verify', function () {
        return view('auth.verify-email');
    })->middleware('auth')->name('verification.notice');
```

 A rota que devolve o aviso de verificação do e-mail deve ter o nome "verification.notice". É importante atribuir este nome exato à rota, porque o middleware `verified` (incluído com Laravel) redirecionará automaticamente para este nome de rota se um usuário não tiver verificado seu endereço de e-mail.

 > [!ATENÇÃO]
 [Kits de inicialização de aplicativos do Laravel](/docs/starter-kits).

<a name="the-email-verification-handler"></a>
### O email de verificação

 Em seguida, precisamos definir uma rota que irá tratar os pedidos gerados quando o usuário clicar no link de verificação do e-mail enviado a ele. Esta rota deve ser nomeada como `verification.verify` e os middlewares `auth` e `signed` devem ser atribuídos:

```php
    use Illuminate\Foundation\Auth\EmailVerificationRequest;

    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();

        return redirect('/home');
    })->middleware(['auth', 'signed'])->name('verification.verify');
```

 Antes de seguirmos em frente, vamos dar uma olhada nesta rotina. Em primeiro lugar, você reparará que estamos usando um tipo de solicitação "EmailVerificationRequest" ao invés da típica instância `Illuminate\Http\Request`. O "EmailVerificationRequest" é um [tipo de solicitação de formulário](/docs/validation#form-request-validation) que está incluído no Laravel. Esta solicitação cuidará automaticamente da validação dos parâmetros `id` e `hash` da solicitação.

 Em seguida, podemos chamar diretamente o método `fulfill` na requisição. Esse método chamará o método `markEmailAsVerified` no usuário autenticado e enviará o evento `Illuminate\Auth\Events\Verified`. O método `markEmailAsVerified` está disponível para o modelo padrão `App\Models\User` através da classe de base `Illuminate\Foundation\Auth\User`. Depois que o endereço de e-mail do usuário for verificado, você poderá redirecioná-los onde quiser.

<a name="resending-the-verification-email"></a>
### Reenviar o e-mail de verificação

 Às vezes, o utilizador pode perder ou apagar acidentalmente o email de verificação. Para resolver este problema, poderá definir um caminho para permitir que o utilizador solicite novamente o envio do email de confirmação. Depois disso, deve enviar uma solicitação a esse caminho colocando um botão simples de submissão do formulário na sua página de notificação de verificação ([verificação de email](#the-email-verification-notice)):

```php
    use Illuminate\Http\Request;

    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();

        return back()->with('message', 'Verification link sent!');
    })->middleware(['auth', 'throttle:6,1'])->name('verification.send');
```

<a name="protecting-routes"></a>
### Proteger as rotas

 [Middlewares de rota](/docs/middleware) podem ser utilizados para permitir somente o acesso à uma determinada rota aos usuários verificados. O Laravel inclui um `alias_verified` [alias de middleware](/docs/middleware#middleware-alias), que é um alias para a classe do middleware `Illuminate\Auth\Middleware\EnsureEmailIsVerified`. Uma vez que este alias já está automaticamente registado pelo Laravel, tudo o que precisa fazer é anexar o middleware `verificado` a uma definição de rota. Normalmente, esse middleware é utilizado com o middleware `auth`:

```php
    Route::get('/profile', function () {
        // Only verified users may access this route...
    })->middleware(['auth', 'verified']);
```

 Se um usuário não verificado tentar acessar uma rota que tenha este middleware atribuído, ele será automaticamente redirecionado para o caminho nomeado `verification.notice` [](/docs/routing#named-routes).

<a name="customization"></a>
## Personalização

<a name="verification-email-customization"></a>
#### Personalização do e-mail de verificação

 Embora a notificação de verificação de e-mail padrão satisfaça os requisitos da maioria dos aplicativos, o Laravel permite personalizar como a mensagem do e-mail de verificação é construída.

 Para começar, passe um fecho para o método `toMailUsing`, fornecido pela notificação `Illuminate\Auth\Notifications\VerifyEmail`. O fecho receberá a instância de modelo notificável que está recebendo a notificação, assim como a URL assinada da verificação do email que o utilizador deve visitar para verificar o seu endereço de email. O fecho deve retornar uma instância do `Illuminate\Notifications\Messages\MailMessage`. Normalmente, você deve chamar o método `toMailUsing` a partir da metodologia `boot` da sua aplicação, na classe `AppServiceProvider`:

```php
    use Illuminate\Auth\Notifications\VerifyEmail;
    use Illuminate\Notifications\Messages\MailMessage;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ...

        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Verify Email Address')
                ->line('Click the button below to verify your email address.')
                ->action('Verify Email Address', $url);
        });
    }
```

 > [!AVISO]
 [Documentação sobre notificações por email](/docs/notifications#mail-notifications).

<a name="events"></a>
## Eventos

 Ao usar os [Pacotes iniciais do Laravel](/docs/starter-kits), o Laravel dispara um evento `[Illuminate\Auth\Events\Verified]` ([eventos)](/docs/events) durante o processo de verificação por e-mail. Se você estiver manipulando a verificação de e-mail manualmente em sua aplicação, talvez queira disparar esses eventos manualmente após a conclusão da verificação.
