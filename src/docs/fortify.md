# Laravel Fortify

<a name="introduction"></a>
## Introdução

[Laravel Fortify](https://github.com/laravel/fortify) é uma implementação de backend de autenticação agnóstica de frontend para Laravel. O Fortify registra as rotas e controladores necessários para implementar todos os recursos de autenticação do Laravel, incluindo login, registro, redefinição de senha, verificação de e-mail e muito mais. Após instalar o Fortify, você pode executar o comando Artisan `route:list` para ver as rotas que o Fortify registrou.

Como o Fortify não fornece sua própria interface de usuário, ele deve ser pareado com sua própria interface de usuário, que faz solicitações às rotas que ele registra. Discutiremos exatamente como fazer solicitações a essas rotas no restante desta documentação.

::: info NOTA
Lembre-se, o Fortify é um pacote que visa dar a você uma vantagem inicial na implementação dos recursos de autenticação do Laravel. **Você não é obrigado a usá-lo.** Você sempre está livre para interagir manualmente com os serviços de autenticação do Laravel seguindo a documentação disponível na documentação [authentication](/docs/authentication), [password reset](/docs/passwords) e [email checking](/docs/verification).
:::

<a name="what-is-fortify"></a>
### O que é Fortify?

Conforme mencionado anteriormente, o Laravel Fortify é uma implementação de backend de autenticação agnóstica de frontend para o Laravel. O Fortify registra as rotas e controladores necessários para implementar todos os recursos de autenticação do Laravel, incluindo login, registro, redefinição de senha, verificação de e-mail e muito mais.

**Você não precisa usar o Fortify para usar os recursos de autenticação do Laravel.** Você sempre tem a liberdade de interagir manualmente com os serviços de autenticação do Laravel seguindo a documentação disponível na documentação [authentication](/docs/authentication), [password reset](/docs/passwords) e [email checking](/docs/verification).

Se você é novo no Laravel, pode explorar o kit inicial do aplicativo [Laravel Breeze](/docs/starter-kits) antes de tentar usar o Laravel Fortify. O Laravel Breeze fornece um andaime de autenticação para seu aplicativo que inclui uma interface de usuário construída com [Tailwind CSS](https://tailwindcss.com). Ao contrário do Fortify, o Breeze publica suas rotas e controladores diretamente em seu aplicativo. Isso permite que você estude e se sinta confortável com os recursos de autenticação do Laravel antes de permitir que o Laravel Fortify implemente esses recursos para você.

O Laravel Fortify essencialmente pega as rotas e controladores do Laravel Breeze e os oferece como um pacote que não inclui uma interface de usuário. Isso permite que você ainda crie rapidamente o scaffold da implementação de backend da camada de autenticação do seu aplicativo sem estar preso a nenhuma opinião específica de frontend.

<a name="when-should-i-use-fortify"></a>
### Quando devo usar o Fortify?

Você pode estar se perguntando quando é apropriado usar o Laravel Fortify. Primeiro, se você estiver usando um dos [application starter kits](/docs/starter-kits) do Laravel, não precisa instalar o Laravel Fortify, pois todos os application starter kits do Laravel já fornecem uma implementação de autenticação completa.

Se você não estiver usando um application starter kit e seu aplicativo precisar de recursos de autenticação, você tem duas opções: implementar manualmente os recursos de autenticação do seu aplicativo ou usar o Laravel Fortify para fornecer a implementação de backend desses recursos.

Se você escolher instalar o Fortify, sua interface de usuário fará solicitações às rotas de autenticação do Fortify que são detalhadas nesta documentação para autenticar e registrar usuários.

Se você escolher interagir manualmente com os serviços de autenticação do Laravel em vez de usar o Fortify, você pode fazer isso seguindo a documentação disponível na documentação [authentication](/docs/authentication), [password reset](/docs/passwords) e [email checking](/docs/verification).

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify e Laravel Sanctum

Alguns desenvolvedores ficam confusos sobre a diferença entre [Laravel Sanctum](/docs/sanctum) e Laravel Fortify. Como os dois pacotes resolvem dois problemas diferentes, mas relacionados, o Laravel Fortify e o Laravel Sanctum não são pacotes mutuamente exclusivos ou concorrentes.

O Laravel Sanctum se preocupa apenas em gerenciar tokens de API e autenticar usuários existentes usando cookies ou tokens de sessão. O Sanctum não fornece nenhuma rota que lide com registro de usuário, redefinição de senha, etc.

Se você estiver tentando construir manualmente a camada de autenticação para um aplicativo que oferece uma API ou serve como backend para um aplicativo de página única, é inteiramente possível que você utilize o Laravel Fortify (para registro de usuário, redefinição de senha, etc.) e o Laravel Sanctum (gerenciamento de token de API, autenticação de sessão).

<a name="installation"></a>
## Instalação

Para começar, instale o Fortify usando o gerenciador de pacotes do Composer:

```shell
composer require laravel/fortify
```

Em seguida, publique os recursos do Fortify usando o comando Artisan `fortify:install`:

```shell
php artisan fortify:install
```

Este comando publicará as ações do Fortify no seu diretório `app/Actions`, que será criado se não existir. Além disso, o `FortifyServiceProvider`, o arquivo de configuração e todas as migrações de banco de dados necessárias serão publicados.

Em seguida, você deve migrar seu banco de dados:

```shell
php artisan migrate
```

<a name="fortify-features"></a>
### Recursos do Fortify

O arquivo de configuração `fortify` contém uma matriz de configuração `features`. Esta matriz define quais rotas/recursos de backend o Fortify irá expor por padrão. Se você não estiver usando o Fortify em combinação com o [Laravel Jetstream](https://jetstream.laravel.com), recomendamos que você habilite apenas os seguintes recursos, que são os recursos básicos de autenticação fornecidos pela maioria dos aplicativos Laravel:

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### Desabilitando visualizações

Por padrão, o Fortify define rotas que são destinadas a retornar visualizações, como uma tela de login ou tela de registro. No entanto, se você estiver construindo um aplicativo de página única orientado a JavaScript, pode não precisar dessas rotas. Por esse motivo, você pode desabilitar essas rotas completamente definindo o valor de configuração `views` no arquivo de configuração `config/fortify.php` do seu aplicativo como `false`:

```php
'views' => false,
```

<a name="disabling-views-and-password-reset"></a>
#### Desabilitando visualizações e redefinição de senha

Se você escolher desabilitar as visualizações do Fortify e estiver implementando recursos de redefinição de senha para seu aplicativo, você ainda deve definir uma rota chamada `password.reset` que é responsável por exibir a visualização "reset password" do seu aplicativo. Isso é necessário porque a notificação `Illuminate\Auth\Notifications\ResetPassword` do Laravel gerará a URL de redefinição de senha por meio da rota chamada `password.reset`.

<a name="authentication"></a>
## Autenticação

Para começar, precisamos instruir o Fortify sobre como retornar nossa visualização "login". Lembre-se, o Fortify é uma biblioteca de autenticação headless. Se você quiser uma implementação frontend dos recursos de autenticação do Laravel que já estão concluídos para você, você deve usar um [application starter kit](/docs/starter-kits).

Toda a lógica de renderização da visualização de autenticação pode ser personalizada usando os métodos apropriados disponíveis por meio da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar esse método do método `boot` da classe `App\Providers\FortifyServiceProvider` do seu aplicativo. O Fortify cuidará da definição da rota `/login` que retorna esta visualização:

```php
    use Laravel\Fortify\Fortify;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Fortify::loginView(function () {
            return view('auth.login');
        });

        // ...
    }
```

Seu modelo de login deve incluir um formulário que faça uma solicitação POST para `/login`. O endpoint `/login` espera uma string `email` / `username` e uma `password`. O nome do campo email / username deve corresponder ao valor `username` dentro do arquivo de configuração `config/fortify.php`. Além disso, um campo booleano `remember` pode ser fornecido para indicar que o usuário gostaria de usar a funcionalidade "remember me" fornecida pelo Laravel.

Se a tentativa de login for bem-sucedida, o Fortify irá redirecioná-lo para o URI configurado por meio da opção de configuração `home` dentro do arquivo de configuração `fortify` do seu aplicativo. Se a solicitação de login for uma solicitação XHR, uma resposta HTTP 200 será retornada.

Se a solicitação não for bem-sucedida, o usuário será redirecionado de volta para a tela de login e os erros de validação estarão disponíveis para você por meio do `$errors` compartilhado [variável de modelo Blade](/docs/validation#quick-displaying-the-validation-errors). Ou, no caso de uma solicitação XHR, os erros de validação serão retornados com a resposta HTTP 422.

<a name="customizing-user-authentication"></a>
### Personalizando a autenticação do usuário

O Fortify recuperará e autenticará automaticamente o usuário com base nas credenciais fornecidas e no guarda de autenticação configurado para seu aplicativo. No entanto, às vezes você pode desejar ter personalização completa sobre como as credenciais de login são autenticadas e os usuários são recuperados. Felizmente, o Fortify permite que você faça isso facilmente usando o método `Fortify::authenticateUsing`.

Este método aceita um *closure* que recebe a solicitação HTTP de entrada. O *closure* é responsável por validar as credenciais de login anexadas à solicitação e retornar a instância do usuário associada. Se as credenciais forem inválidas ou nenhum usuário puder ser encontrado, `null` ou `false` deve ser retornado pelo *closure*. Normalmente, esse método deve ser chamado do método `boot` do seu `FortifyServiceProvider`:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Fortify;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Fortify::authenticateUsing(function (Request $request) {
        $user = User::where('email', $request->email)->first();

        if ($user &&
            Hash::check($request->password, $user->password)) {
            return $user;
        }
    });

    // ...
}
```

<a name="authentication-guard"></a>
#### Authentication Guard

Você pode personalizar o guard de autenticação usado pelo Fortify no arquivo de configuração `fortify` do seu aplicativo. No entanto, você deve garantir que o guard configurado seja uma implementação de `Illuminate\Contracts\Auth\StatefulGuard`. Se você estiver tentando usar o Laravel Fortify para autenticar um SPA, você deve usar o guard `web` padrão do Laravel em combinação com [Laravel Sanctum](https://laravel.com/docs/sanctum).

<a name="customizing-the-authentication-pipeline"></a>
### Personalizando o Pipeline de Autenticação

O Laravel Fortify autentica solicitações de login por meio de um pipeline de classes invocáveis. Se desejar, você pode definir um pipeline personalizado de classes pelas quais as solicitações de login devem ser canalizadas. Cada classe deve ter um método `__invoke` que recebe a instância `Illuminate\Http\Request` de entrada e, como [middleware](/docs/middleware), uma variável `$next` que é invocada para passar a solicitação para a próxima classe no pipeline.

Para definir seu pipeline personalizado, você pode usar o método `Fortify::authenticateThrough`. Este método aceita um *closure* que deve retornar a matriz de classes para canalizar a solicitação de login. Normalmente, este método deve ser chamado do método `boot` da sua classe `App\Providers\FortifyServiceProvider`.

O exemplo abaixo contém a definição de pipeline padrão que você pode usar como ponto de partida ao fazer suas próprias modificações:

```php
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\EnsureLoginIsNotThrottled;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

Fortify::authenticateThrough(function (Request $request) {
    return array_filter([
            config('fortify.limiters.login') ? null : EnsureLoginIsNotThrottled::class,
            Features::enabled(Features::twoFactorAuthentication()) ? RedirectIfTwoFactorAuthenticatable::class : null,
            AttemptToAuthenticate::class,
            PrepareAuthenticatedSession::class,
    ]);
});
```

#### Limitação de autenticação

Por padrão, o Fortify limitará as tentativas de autenticação usando o middleware `EnsureLoginIsNotThrottled`. Este middleware limita as tentativas que são exclusivas de uma combinação de nome de usuário e endereço IP.

Alguns aplicativos podem exigir uma abordagem diferente para limitar as tentativas de autenticação, como limitar apenas pelo endereço IP. Portanto, o Fortify permite que você especifique seu próprio [limitador de taxa](/docs/routing#rate-limiting) por meio da opção de configuração `fortify.limiters.login`. Claro, essa opção de configuração está localizada no arquivo de configuração `config/fortify.php` do seu aplicativo.

::: info NOTA
Utilizar uma mistura de limitação, [autenticação de dois fatores](/docs/fortify#two-factor-authentication) e um firewall de aplicativo da Web externo (WAF) fornecerá a defesa mais robusta para seus usuários legítimos de aplicativos.
:::

<a name="customizing-authentication-redirects"></a>
### Personalizando redirecionamentos

Se a tentativa de login for bem-sucedida, o Fortify redirecionará você para o URI configurado por meio da opção de configuração `home` no arquivo de configuração `fortify` do seu aplicativo. Se a solicitação de login for uma solicitação XHR, uma resposta HTTP 200 será retornada. Após um usuário efetuar logout do aplicativo, o usuário será redirecionado para o URI `/`.

Se precisar de personalização avançada desse comportamento, você pode vincular implementações dos contratos `LoginResponse` e ​​`LogoutResponse` ao Laravel [contêiner de serviço](/docs/container). Normalmente, isso deve ser feito dentro do método `register` da classe `App\Providers\FortifyServiceProvider` do seu aplicativo:

```php
use Laravel\Fortify\Contracts\LogoutResponse;

/**
 * Registre quaisquer serviços de aplicação.
 */
public function register(): void
{
    $this->app->instance(LogoutResponse::class, new class implements LogoutResponse {
        public function toResponse($request)
        {
            return redirect('/');
        }
    });
}
```

<a name="two-factor-authentication"></a>
## Autenticação de dois fatores

Quando o recurso de autenticação de dois fatores do Fortify está habilitado, o usuário precisa inserir um token numérico de seis dígitos durante o processo de autenticação. Esse token é gerado usando uma senha de uso único baseada em tempo (TOTP) que pode ser recuperada de qualquer aplicativo de autenticação móvel compatível com TOTP, como o Google Authenticator.

Antes de começar, você deve primeiro garantir que o modelo `App\Models\User` do seu aplicativo use o trait `Laravel\Fortify\TwoFactorAuthenticatable`:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use Notifiable, TwoFactorAuthenticatable;
}
 ```

Em seguida, você deve criar uma tela dentro do seu aplicativo onde os usuários podem gerenciar suas configurações de autenticação de dois fatores. Esta tela deve permitir que o usuário habilite e desabilite a autenticação de dois fatores, bem como regenere seus códigos de recuperação de autenticação de dois fatores.

> Por padrão, o array `features` do arquivo de configuração `fortify` instrui as configurações de autenticação de dois fatores do Fortify a exigir confirmação de senha antes da modificação. Portanto, seu aplicativo deve implementar o recurso [confirmação de senha](#password-confirmation) do Fortify antes de continuar.

<a name="enabling-two-factor-authentication"></a>
### Habilitando a autenticação de dois fatores

Para começar a habilitar a autenticação de dois fatores, seu aplicativo deve fazer uma solicitação POST para o endpoint `/user/two-factor-authentication` definido pelo Fortify. Se a solicitação for bem-sucedida, o usuário será redirecionado de volta para a URL anterior e a variável de sessão `status` será definida como `two-factor-authentication-enabled`. Você pode detectar essa variável de sessão `status` em seus modelos para exibir a mensagem de sucesso apropriada. Se a solicitação for uma solicitação XHR, a resposta HTTP `200` será retornada.

Após escolher habilitar a autenticação de dois fatores, o usuário ainda deve "confirmar" sua configuração de autenticação de dois fatores fornecendo um código de autenticação de dois fatores válido. Portanto, sua mensagem de "sucesso" deve instruir o usuário que a confirmação da autenticação de dois fatores ainda é necessária:

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        Please finish configuring two factor authentication below.
    </div>
@endif
```

Em seguida, você deve exibir o código QR da autenticação de dois fatores para o usuário escanear em seu aplicativo autenticador. Se estiver usando o Blade para renderizar o frontend do seu aplicativo, você pode recuperar o código QR SVG usando o método `twoFactorQrCodeSvg` disponível na instância do usuário:

```php
$request->user()->twoFactorQrCodeSvg();
```

Se estiver construindo um frontend com JavaScript, você pode fazer uma solicitação XHR GET para o endpoint `/user/two-factor-qr-code` para recuperar o código QR da autenticação de dois fatores do usuário. Este endpoint retornará um objeto JSON contendo uma chave `svg`.

<a name="confirming-two-factor-authentication"></a>
#### Confirmando a autenticação de dois fatores

Além de exibir o código QR de autenticação de dois fatores do usuário, você deve fornecer uma entrada de texto onde o usuário pode fornecer um código de autenticação válido para "confirmar" sua configuração de autenticação de dois fatores. Este código deve ser fornecido ao aplicativo Laravel por meio de uma solicitação POST para o endpoint `/user/confirmed-two-factor-authentication` definido pelo Fortify.

Se a solicitação for bem-sucedida, o usuário será redirecionado de volta para a URL anterior e a variável de sessão `status` será definida como `two-factor-authentication-confirmed`:

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        Two factor authentication confirmed and enabled successfully.
    </div>
@endif
```

Se a solicitação para o endpoint de confirmação de autenticação de dois fatores foi feita por meio de uma solicitação XHR, uma resposta HTTP `200` será retornada.

<a name="displaying-the-recovery-codes"></a>
#### Exibindo os códigos de recuperação

Você também deve exibir os códigos de recuperação de dois fatores do usuário. Esses códigos de recuperação permitem que o usuário se autentique caso perca o acesso ao seu dispositivo móvel. Se estiver usando o Blade para renderizar o frontend do seu aplicativo, você pode acessar os códigos de recuperação por meio da instância do usuário autenticado:

```php
(array) $request->user()->recoveryCodes()
```

Se estiver construindo um frontend com JavaScript, você pode fazer uma solicitação XHR GET para o endpoint `/user/two-factor-recovery-codes`. Este endpoint retornará uma matriz JSON contendo os códigos de recuperação do usuário.

Para regenerar os códigos de recuperação do usuário, seu aplicativo deve fazer uma solicitação POST para o endpoint `/user/two-factor-recovery-codes`.

<a name="authenticating-with-two-factor-authentication"></a>
### Autenticando com autenticação de dois fatores

Durante o processo de autenticação, o Fortify redirecionará automaticamente o usuário para a tela de desafio de autenticação de dois fatores do seu aplicativo. No entanto, se seu aplicativo estiver fazendo uma solicitação de login XHR, a resposta JSON retornada após uma tentativa de autenticação bem-sucedida conterá um objeto JSON que tem uma propriedade booleana `two_factor`. Você deve inspecionar esse valor para saber se deve redirecionar para a tela de desafio de autenticação de dois fatores do seu aplicativo.

Para começar a implementar a funcionalidade de autenticação de dois fatores, precisamos instruir o Fortify sobre como retornar nossa visualização de desafio de autenticação de dois fatores. Toda a lógica de renderização da visualização de autenticação do Fortify pode ser personalizada usando os métodos apropriados disponíveis por meio da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar esse método do método `boot` da classe `App\Providers\FortifyServiceProvider` do seu aplicativo:

```php
use Laravel\Fortify\Fortify;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Fortify::twoFactorChallengeView(function () {
        return view('auth.two-factor-challenge');
    });

    // ...
}
```

O Fortify cuidará da definição da rota `/two-factor-challenge` que retorna essa visualização. Seu modelo `two-factor-challenge` deve incluir um formulário que faz uma solicitação POST para o ponto de extremidade `/two-factor-challenge`. A ação `/two-factor-challenge` espera um campo `code` que contém um token TOTP válido ou um campo `recovery_code` que contém um dos códigos de recuperação do usuário.

Se a tentativa de login for bem-sucedida, o Fortify redirecionará o usuário para o URI configurado por meio da opção de configuração `home` no arquivo de configuração `fortify` do seu aplicativo. Se a solicitação de login for uma solicitação XHR, uma resposta HTTP 204 será retornada.

Se a solicitação não for bem-sucedida, o usuário será redirecionado de volta para a tela de desafio de dois fatores e os erros de validação estarão disponíveis para você por meio do `$errors` compartilhado [variável de modelo Blade](/docs/validation#quick-displaying-the-validation-errors). Ou, no caso de uma solicitação XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a name="disabling-two-factor-authentication"></a>
### Desabilitando a autenticação de dois fatores

Para desabilitar a autenticação de dois fatores, seu aplicativo deve fazer uma solicitação DELETE para o endpoint `/user/two-factor-authentication`. Lembre-se, os endpoints de autenticação de dois fatores do Fortify exigem [confirmação de senha](#password-confirmation) antes de serem chamados.

<a name="registration"></a>
## Registro

Para começar a implementar a funcionalidade de registro do nosso aplicativo, precisamos instruir o Fortify sobre como retornar nossa visualização "registrar". Lembre-se, o Fortify é uma biblioteca de autenticação headless. Se você quiser uma implementação frontend dos recursos de autenticação do Laravel que já estão concluídos para você, você deve usar um [application starter kit](/docs/starter-kits).

Toda a lógica de renderização de visualização do Fortify pode ser personalizada usando os métodos apropriados disponíveis por meio da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método do método `boot` da sua classe `App\Providers\FortifyServiceProvider`:

```php
use Laravel\Fortify\Fortify;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Fortify::registerView(function () {
        return view('auth.register');
    });

    // ...
}
```

O Fortify cuidará da definição da rota `/register` que retorna esta visualização. Seu modelo `register` deve incluir um formulário que faz uma solicitação POST para o endpoint `/register` definido pelo Fortify.

O endpoint `/register` espera uma string `name`, string email address / username, `password` e campos `password_confirmation`. O nome do campo de e-mail/nome de usuário deve corresponder ao valor de configuração `username` definido no arquivo de configuração `fortify` do seu aplicativo.

Se a tentativa de registro for bem-sucedida, o Fortify redirecionará o usuário para o URI configurado por meio da opção de configuração `home` no arquivo de configuração `fortify` do seu aplicativo. Se a solicitação for uma solicitação XHR, uma resposta HTTP 201 será retornada.

Se a solicitação não for bem-sucedida, o usuário será redirecionado de volta para a tela de registro e os erros de validação estarão disponíveis para você por meio do `$errors` compartilhado [variável de modelo Blade](/docs/validation#quick-displaying-the-validation-errors). Ou, no caso de uma solicitação XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a name="customizing-registration"></a>
### Personalizando o Registro

O processo de validação e criação do usuário pode ser personalizado modificando a ação `App\Actions\Fortify\CreateNewUser` que foi gerada quando você instalou o Laravel Fortify.

<a name="password-reset"></a>
## Redefinição de Senha

<a name="requesting-a-password-reset-link"></a>
### Solicitando um Link de Redefinição de Senha

Para começar a implementar a funcionalidade de redefinição de senha do nosso aplicativo, precisamos instruir o Fortify sobre como retornar nossa visualização "esqueci a senha". Lembre-se, o Fortify é uma biblioteca de autenticação sem interface. Se você quiser uma implementação frontend dos recursos de autenticação do Laravel que já estão concluídos para você, você deve usar um [application starter kit](/docs/starter-kits).

Toda a lógica de renderização de visualização do Fortify pode ser personalizada usando os métodos apropriados disponíveis por meio da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar esse método do método `boot` da classe `App\Providers\FortifyServiceProvider` do seu aplicativo:

```php
use Laravel\Fortify\Fortify;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Fortify::requestPasswordResetLinkView(function () {
        return view('auth.forgot-password');
    });

    // ...
}
```

O Fortify cuidará da definição do endpoint `/forgot-password` que retorna essa visualização. Seu modelo `forgot-password` deve incluir um formulário que faz uma solicitação POST para o endpoint `/forgot-password`.

O endpoint `/forgot-password` espera um campo `email` de string. O nome desse campo/coluna do banco de dados deve corresponder ao valor de configuração `email` dentro do arquivo de configuração `fortify` do seu aplicativo.

<a name="handling-the-password-reset-link-request-response"></a>
#### Lidando com a resposta da solicitação de link de redefinição de senha

Se a solicitação de link de redefinição de senha for bem-sucedida, o Fortify redirecionará o usuário de volta ao endpoint `/forgot-password` e enviará um e-mail ao usuário com um link seguro que ele pode usar para redefinir sua senha. Se a solicitação for uma solicitação XHR, uma resposta HTTP 200 será retornada.

Após ser redirecionado de volta ao endpoint `/forgot-password` após uma solicitação bem-sucedida, a variável de sessão `status` pode ser usada para exibir o status da tentativa de solicitação de link de redefinição de senha.

O valor da variável de sessão `$status` corresponderá a uma das strings de tradução definidas no arquivo de idioma `passwords` do seu aplicativo](/docs/localization). Se você quiser personalizar esse valor e não tiver publicado os arquivos de idioma do Laravel, você pode fazer isso por meio do comando Artisan `lang:publish`:

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

Se a solicitação não for bem-sucedida, o usuário será redirecionado de volta para a tela do link de redefinição de senha de solicitação e os erros de validação estarão disponíveis para você por meio do `$errors` compartilhado [variável de modelo Blade](/docs/validation#quick-displaying-the-validation-errors). Ou, no caso de uma solicitação XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a name="resetting-the-password"></a>
### Redefinindo a senha

Para terminar de implementar a funcionalidade de redefinição de senha do nosso aplicativo, precisamos instruir o Fortify sobre como retornar nossa visualização "redefinir senha".

Toda a lógica de renderização de visualização do Fortify pode ser personalizada usando os métodos apropriados disponíveis por meio da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar esse método do método `boot` da classe `App\Providers\FortifyServiceProvider` do seu aplicativo:

```php
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Fortify::resetPasswordView(function (Request $request) {
        return view('auth.reset-password', ['request' => $request]);
    });

    // ...
}
```

O Fortify cuidará da definição da rota para exibir essa visualização. Seu modelo `reset-password` deve incluir um formulário que faz uma solicitação POST para `/reset-password`.

O endpoint `/reset-password` espera um campo `email` de string, um campo `password`, um campo `password_confirmation` e um campo oculto chamado `token` que contém o valor de `request()->route('token')`. O nome do campo "email" / coluna do banco de dados deve corresponder ao valor de configuração `email` definido no arquivo de configuração `fortify` do seu aplicativo.

<a name="handling-the-password-reset-response"></a>
#### Lidando com a resposta de redefinição de senha

Se a solicitação de redefinição de senha for bem-sucedida, o Fortify redirecionará de volta para a rota `/login` para que o usuário possa efetuar login com sua nova senha. Além disso, uma variável de sessão `status` será definida para que você possa exibir o status bem-sucedido da redefinição na sua tela de login:

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

Se a solicitação for uma solicitação XHR, uma resposta HTTP 200 será retornada.

Se a solicitação não for bem-sucedida, o usuário será redirecionado de volta para a tela de redefinição de senha e os erros de validação estarão disponíveis para você por meio do `$errors` compartilhado [variável de modelo Blade](/docs/validation#quick-displaying-the-validation-errors). Ou, no caso de uma solicitação XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a name="customizing-password-resets"></a>
### Personalizando redefinições de senha

O processo de redefinição de senha pode ser personalizado modificando a ação `App\Actions\ResetUserPassword` que foi gerada quando você instalou o Laravel Fortify.

<a name="email-verification"></a>
## Verificação de e-mail

Após o registro, você pode desejar que os usuários verifiquem seus endereços de e-mail antes de continuarem acessando seu aplicativo. Para começar, certifique-se de que o recurso `emailVerification` esteja habilitado no array `features` do seu arquivo de configuração `fortify`. Em seguida, você deve garantir que sua classe `App\Models\User` implemente a interface `Illuminate\Contracts\Auth\MustVerifyEmail`.

Depois que essas duas etapas de configuração forem concluídas, os usuários recém-registrados receberão um e-mail solicitando que verifiquem a propriedade do endereço de e-mail. No entanto, precisamos informar ao Fortify como exibir a tela de verificação de e-mail que informa ao usuário que ele precisa clicar no link de verificação no e-mail.

Toda a lógica de renderização da visualização do Fortify pode ser personalizada usando os métodos apropriados disponíveis por meio da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar esse método do método `boot` da classe `App\Providers\FortifyServiceProvider` do seu aplicativo:

```php
use Laravel\Fortify\Fortify;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Fortify::verifyEmailView(function () {
        return view('auth.verify-email');
    });

    // ...
}
```

O Fortify cuidará da definição da rota que exibe essa visualização quando um usuário for redirecionado para o endpoint `/email/verify` pelo middleware `verified` integrado do Laravel.

Seu modelo `verify-email` deve incluir uma mensagem informativa instruindo o usuário a clicar no link de verificação de e-mail que foi enviado para seu endereço de e-mail.

<a name="resending-email-verification-links"></a>
#### Reenviando links de verificação de e-mail

Se desejar, você pode adicionar um botão ao modelo `verify-email` do seu aplicativo que dispara uma solicitação POST para o endpoint `/email/verification-notification`. Quando esse endpoint recebe uma solicitação, um novo link de e-mail de verificação será enviado ao usuário, permitindo que ele obtenha um novo link de verificação se o anterior foi acidentalmente excluído ou perdido.

Se a solicitação para reenviar o e-mail do link de verificação for bem-sucedida, o Fortify redirecionará o usuário de volta para o endpoint `/email/verify` com uma variável de sessão `status`, permitindo que você exiba uma mensagem informativa ao usuário informando que a operação foi bem-sucedida. Se a solicitação for uma solicitação XHR, uma resposta HTTP 202 será retornada:

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        A new email verification link has been emailed to you!
    </div>
@endif
```

<a name="protecting-routes"></a>
### Protegendo rotas

Para especificar que uma rota ou grupo de rotas requer que o usuário tenha verificado seu endereço de e-mail, você deve anexar o middleware `verified` integrado do Laravel à rota. O alias do middleware `verified` é registrado automaticamente pelo Laravel e serve como um alias para o middleware `Illuminate\Routing\Middleware\ValidateSignature`:

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## Confirmação de senha

Ao construir seu aplicativo, você pode ocasionalmente ter ações que devem exigir que o usuário confirme sua senha antes que a ação seja realizada. Normalmente, essas rotas são protegidas pelo middleware `password.confirm` integrado do Laravel.

Para começar a implementar a funcionalidade de confirmação de senha, precisamos instruir o Fortify sobre como retornar a visualização de "confirmação de senha" do nosso aplicativo. Lembre-se, o Fortify é uma biblioteca de autenticação sem interface. Se você quiser uma implementação frontend dos recursos de autenticação do Laravel que já estão concluídos para você, você deve usar um [kit inicial do aplicativo](/docs/starter-kits).

Toda a lógica de renderização de visualização do Fortify pode ser personalizada usando os métodos apropriados disponíveis por meio da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar esse método do método `boot` da classe `App\Providers\FortifyServiceProvider` do seu aplicativo:

```php
use Laravel\Fortify\Fortify;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Fortify::confirmPasswordView(function () {
        return view('auth.confirm-password');
    });

    // ...
}
```

O Fortify cuidará da definição do endpoint `/user/confirm-password` que retorna essa visualização. Seu modelo `confirm-password` deve incluir um formulário que faz uma solicitação POST para o endpoint `/user/confirm-password`. O endpoint `/user/confirm-password` espera um campo `password` que contém a senha atual do usuário.

Se a senha corresponder à senha atual do usuário, o Fortify redirecionará o usuário para a rota que ele estava tentando acessar. Se a solicitação for uma solicitação XHR, uma resposta HTTP 201 será retornada.

Se a solicitação não for bem-sucedida, o usuário será redirecionado de volta para a tela de confirmação de senha e os erros de validação estarão disponíveis para você por meio da variável de modelo Blade `$errors` compartilhada. Ou, no caso de uma solicitação XHR, os erros de validação serão retornados com uma resposta HTTP 422.
