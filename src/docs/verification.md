# Verificação por e-mail

<a name="introduction"></a>
## Introdução

Muitos aplicativos da web exigem que os usuários verifiquem seus endereços de e-mail antes de usar o aplicativo. Em vez de forçá-lo a reimplementar esse recurso manualmente para cada aplicativo que você cria, o Laravel fornece serviços convenientes incorporados para enviar e verificar solicitações de verificação de e-mail.

::: info NOTA
Quer começar rápido? Instale um dos [Kit de Início Laravel](https://laravel.com/docs/starter-kits) em um novo aplicativo Laravel. Os kits de início cuidarão do seu sistema completo de autenticação, incluindo suporte para verificação por e-mail.
:::

<a name="model-preparation"></a>
### Preparação do Modelo

Antes de começar, verifique se o seu modelo `App\Models\User` implementa o contrato `Illuminate\Contracts\Auth\MustVerifyEmail`:

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

Uma vez que esta interface tenha sido adicionada ao seu modelo, os novos usuários registrados serão automaticamente enviados um e-mail contendo um link de verificação de conta. Isso acontece sem problemas porque o Laravel registra automaticamente o `Illuminate\Auth\Listeners\SendEmailVerificationNotification` [ouvinte](/docs/events) para o evento `Illuminate\Auth\Events\Registered`.

Se você está implementando manualmente a inscrição dentro do seu aplicativo em vez de usar um [Kit de Início](/docs/starter-kits), você deve garantir que o evento `Illuminate\Auth\Events\Registered` é enviado após uma inscrição bem sucedida.

```php
    use Illuminate\Auth\Events\Registered;

    event(new Registered($user));
```

<a name="database-preparation"></a>
### Preparação do banco de dados

Em seguida, sua tabela de usuários deve conter uma coluna de e-mail verificada em que você armazena a data e hora que o endereço de e-mail do usuário foi verificado. Geralmente isso está incluído na migração padrão do banco de dados `0001_01_01_000000_create_users_table.php` do Laravel

<a name="verification-routing"></a>
## Rotas

Para implementar adequadamente a verificação de e-mail, três rotas serão necessárias. Primeiro, uma rota será necessária para exibir uma notificação ao usuário que ele deve clicar no link de verificação de e-mail no e-mail enviado pelo Laravel após o registro.

Em segundo lugar, uma rota será necessária para lidar com as requisições geradas quando o usuário clicar no link de verificação de e-mail no e-mail.

Terceiro, uma rota será necessária para reenviar um link de verificação se o usuário acidentalmente perder o primeiro link de verificação.

<a name="the-email-verification-notice"></a>
### Notificação de verificação de e-mail

Como mencionado anteriormente, uma rota deve ser definida que retornará uma visão instruindo o usuário a clicar no link de verificação de e-mail enviado pelo Laravel após o registro. Esta visão será exibida aos usuários quando eles tentarem acessar outras partes do aplicativo sem verificar primeiro seu endereço de e-mail. Lembre-se, o link é automaticamente enviado para o usuário desde que seu modelo `App\Models\User` implemente a interface `MustVerifyEmail`:

```php
    Route::get('/email/verify', function () {
        return view('auth.verify-email');
    })->middleware('auth')->name('verification.notice');
```

A rota que retorna o aviso de verificação de e-mail deve ser nomeada `verification.notice`. É importante que a rota receba esse nome exato, pois o middleware `verified` [incluído com o Laravel](#protecting-routes) redirecionará automaticamente para esse nome de rota se um usuário não tiver verificado seu endereço de e-mail.

::: info NOTA
Ao implementar manualmente a verificação de e-mail, você é obrigado a definir o conteúdo da visualização do aviso de verificação de conta por si mesmo. Se você gostaria de um modelo pré-definido com todas as visualizações necessárias para autenticação e verificação de contas, verifique os [kits iniciais de aplicativos Laravel](/docs/starter-kits).
:::

<a name="the-email-verification-handler"></a>
### O manipulador de verificação de e-mail

Em seguida, precisamos definir uma rota que irá lidar com as solicitações geradas quando o usuário clicar no link de verificação por e-mail enviado a ele. Esta rota deve ser chamada `verification.verify` e deve ter os middlewares `auth` e `signed`:

```php
    use Illuminate\Foundation\Auth\EmailVerificationRequest;

    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();

        return redirect('/home');
    })->middleware(['auth', 'signed'])->name('verification.verify');
```

Antes de prosseguir, vamos examinar mais de perto essa rota. Primeiro, você perceberá que estamos usando um tipo de solicitação `EmailVerificationRequest` em vez do tipo de solicitação padrão `Illuminate\Http\Request`. O `EmailVerificationRequest` é um [tipo de solicitação de formulário](/docs/validation#form-request-validation) incluído no Laravel. Esta solicitação cuidará automaticamente da validação dos parâmetros `id` e `hash` da solicitação.

Em seguida, podemos prosseguir diretamente para chamar o método `fulfill` na solicitação. Este método chamará `markEmailAsVerified` no usuário autenticado e enviará o evento `Illuminate\Auth\Events\Verified`. O método `markEmailAsVerified` está disponível no modelo padrão `App\Models\User` via a classe base `Illuminate\Foundation\Auth\User`. Uma vez que o endereço de e-mail do usuário tenha sido verificado, você pode redirecioná-lo para onde quiser.

<a name="resending-the-verification-email"></a>
### Enviando o email de verificação novamente

Às vezes um usuário pode confundir ou acidentalmente excluir o e-mail de verificação de endereço. Para resolver isso, você pode definir uma rota para permitir que o usuário solicite que o e-mail de verificação seja re-enviado. Em seguida, você pode fazer um pedido dessa rota colocando um botão simples de envio de formulário dentro da [verificação de notificação por e-mail](#the-email-verification-notice):

```php
    use Illuminate\Http\Request;

    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();

        return back()->with('message', 'Verification link sent!');
    })->middleware(['auth', 'throttle:6,1'])->name('verification.send');
```

<a name="protecting-routes"></a>
### Protegendo Rotas

O middleware [Route middleware](/docs/middleware) pode ser utilizado para permitir somente usuários verificados ao acessar um determinado recurso. O Laravel inclui um alias chamado `verified` do middleware [middleware alias](/docs/middleware#middleware-alias), que é uma abreviação da classe middleware `Illuminate\Auth\Middleware\EnsureEmailIsVerified`. Como o Laravel já registra automaticamente este alias, tudo o que você precisa fazer é anexar o middleware `verified` a uma definição de rota. Normalmente, esse middleware é associado ao middleware `auth`:

```php
    Route::get('/profile', function () {
        // Somente usuários verificados podem acessar esta rota...
    })->middleware(['auth', 'verified']);
```

Se um usuário não verificado tenta acessar uma rota que tem sido atribuída a este middleware, ele será automaticamente redirecionado para a [rota nomeada](/docs/routing#named-routes) `verification.notice`.

<a name="customization"></a>
## Personalização

<a name="verification-email-customization"></a>
#### Personalização da verificação por e-mail

Embora a notificação padrão de verificação por e-mail deva satisfazer as exigências da maioria dos aplicativos, o Laravel permite que você personalize como a mensagem do e-mail de verificação é construída.

Para começar, passe um closure para o método `toMailUsing` fornecido pela classe `Illuminate\Auth\Notifications\VerifyEmail` da notificação. O closure receberá a instância do modelo que está recebendo a notificação, assim como a URL de verificação de e-mail com assinatura que o usuário deve visitar para verificar seu endereço de e-mail. O closure deve retornar uma instância de `Illuminate\Notifications\Messages\MailMessage`. Normalmente, você chama o método `toMailUsing` do método `boot` da classe `AppServiceProvider` do seu aplicativo:

```php
    use Illuminate\Auth\Notifications\VerifyEmail;
    use Illuminate\Notifications\Messages\MailMessage;

    /**
     * Inicialize qualquer serviço de aplicativo.
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

::: info NOTA
Para aprender mais sobre notificações por e-mail, consulte a documentação de notificações [pelo e-mail](/docs/notifications#mail-notifications).
:::

<a name="events"></a>
## Eventos

Ao usar o [Laravel Starter Kits](/docs/starter-kits), o Laravel envia um evento `Illuminate\Auth\Events\Verified` durante o processo de verificação de e-mail. Se você estiver lidando manualmente com a verificação de e-mail para sua aplicação, poderá enviar manualmente esses eventos após a conclusão da verificação.
