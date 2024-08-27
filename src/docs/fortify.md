# Laravel Fortify

<a name="introduction"></a>
## Introdução

[Laravel Fortify](https://github.com/laravel/fortify) é uma implementação de back-end de autenticação indiferente ao front-end para Laravel. O Fortify registra as rotas e controladores necessários para implementar todos os recursos de autenticação do Laravel, incluindo login, registro, redefinição de senha, verificação de e-mail e muito mais. Após instalar o Fortify, você pode executar o comando 'route:list' Artisan para ver as rotas que o Fortify registrou.

Como o Fortify não fornece sua própria interface de usuário, ele deve ser combinado com a sua própria interface de usuário que faz solicitações para as rotas que ele registra. Vamos discutir exatamente como fazer solicitações para essas rotas no restante desta documentação.

> Nota:
> Lembre-se, o Fortify é um pacote que foi criado para te dar uma vantagem na implementação dos recursos de autenticação do Laravel. **Você não está obrigado a usar esse recurso**. Você sempre pode interagir manualmente com os serviços de autenticação do Laravel seguindo a documentação disponível em [autenticação](/docs/authentication), [redefinir senha](/docs/passwords) e [verificação por email](/docs/verification).

<a name="what-is-fortify"></a>
### O que é o Fortify?

Como mencionado anteriormente, o Fortify é uma implementação de backend de autenticação para o Laravel que não depende de nenhuma interface do usuário. O Fortify registra as rotas e controladores necessários para implementar todos os recursos de autenticação do Laravel, incluindo login, registro, redefinição da senha, verificação por e-mail e muito mais.

**Você não é obrigado a usar o Fortify para usar as funcionalidades de autenticação do Laravel.** Você sempre pode interagir manualmente com os serviços de autenticação do Laravel seguindo a documentação disponível na [autenticação](), [ redefinição de senha/](docs/passwords) e [verificação por e-mail/](docs/verification).

Se você é novo no Laravel, talvez queira explorar o aplicativo [Laravel Breeze]( /docs/starter-kits) antes de tentar usar o Laravel Fortify . O Laravel Breeze fornece um sistema de autenticação para o seu aplicativo incluindo uma interface do usuário construída com [Tailwind CSS](https://tailwindcss.com). Ao contrário do Fortify, o Breeze publica suas rotas e controladores diretamente no seu aplicativo . Isso permite que você estude e se familiarize com os recursos de autenticação do Laravel antes de permitir que o Laravel Fortify implemente esses recursos para você.

Laravel Fortify essencialmente pega as rotas e controladores do Laravel Breeze e os oferece como um pacote que não inclui uma interface de usuário. Isso permite que você ainda rapidamente crie o backend da implementação do autenticação de sua camada de aplicativo sem ser vinculado a nenhuma opinião específica do frontend.

<a name="when-should-i-use-fortify"></a>
### Quando devo usar fortificar?

Você pode estar se perguntando quando é apropriado usar o Laravel Fortify. Primeiro, se você está usando um dos kits de início de aplicação do Laravel [ (/docs/starter-kits), você não precisa instalar o Laravel Fortify, pois todos os kits de início da aplicação do Laravel já fornecem uma implementação de autenticação completa.

Se você não estiver usando um Application Starter Kit e seu aplicativo necessita de funcionalidades de autenticação, você tem duas opções: implementar manualmente as funcionalidades de autenticação do seu aplicativo ou usar o Laravel Fortify para fornecer a implementação do back-end dessas funcionalidades.

Se você escolher instalar o Fortify sua interface de usuário fará requisições para os pontos de autenticação do Fortify que são detalhados nesta documentação, para autenticar e registrar usuários.

Se você optar por interagir manualmente com os serviços de autenticação do Laravel, em vez de usar o Fortify, você pode fazê-lo seguindo a documentação disponível na [autenticação](/docs/autenticação), [redefinir senha](/docs/senhas) e [verificação de e-mail](/docs/verificação)

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify e Laravel Sanctum

Alguns desenvolvedores ficam confusos sobre a diferença entre [Laravel Sanctum] e Laravel Fortify. Como os dois pacotes resolvem problemas diferentes mas relacionados, Laravel Fortify e Laravel Sanctum não são mutuamente exclusivos ou concorrentes.

Laravel Sanctum é apenas preocupado em gerenciar tokens de API e autenticar usuários existentes usando cookies ou tokens de sessão. Sanctum não fornece qualquer rota que lide com registro de usuário, redefinição de senha, etc.

Se você está tentando construir manualmente a camada de autenticação para um aplicativo que oferece uma API ou serve como o backend para um aplicativo de página única, é possível que você utilize tanto o Laravel Fortify (para registro de usuários, redefinição de senha, etc.) quanto o Laravel Sanctum (Gerenciamento de tokens da API e autenticação de sessão).

<a name="installation"></a>
## Instalação

Para começar, instale o Fortify usando o gerenciador de pacotes Composer:

```shell
composer require laravel/fortify
```

Em seguida, publique os recursos do Fortify usando o comando Artisan "fortify: install":

```shell
php artisan fortify:install
```

Este comando publicará as ações do Fortify no seu diretório app/Actions, que será criado caso ele não exista. Além disso, o arquivo de configuração FortifyServiceProvider e todas as migrações de banco necessárias serão publicadas.

Em seguida você deve migrar seu banco de dados.

```shell
php artisan migrate
```

<a name="fortify-features"></a>
### Características do Fortify

A configuração do arquivo 'fortify' contém um array de configurações chamado 'features'. Este array define quais rotas/características o Fortify irá expor por padrão. Se você não está usando o Fortify em conjunto com [Laravel Jetstream](https://jetstream.laravel.com), recomendamos que você ative apenas as seguintes características, que são as características de autenticação básica fornecidas pela maioria dos aplicativos Laravel:

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### Desabilitando Visões

Por padrão, Fortify define rotas que são destinadas a retornar views, como uma tela de login ou uma tela de registro. No entanto, se você estiver construindo um aplicativo JavaScript de página única, você talvez não precise dessas rotas. Por esse motivo, você pode desativar essas rotas completamente por definir o valor da configuração 'views' dentro do arquivo de configuração 'config/fortify.php' do seu aplicativo para 'false':

```php
'views' => false,
```

<a name="disabling-views-and-password-reset"></a>
#### Desabilitando Visualizações e Redefinindo Senha

Se optar por desativar as visualizações do Fortify e você estará implementando recursos de redefinição de senha para seu aplicativo, você ainda deve definir uma rota chamada `password.reset`, que será responsável por exibir a "redefinir senha" do seu aplicativo. Isso é necessário porque o Laravel' Illuminate\Auth\Notifications\ResetPassword' notificação irá gerar o URL de redefinição de senha via a rota chamada de `password.reset`.

<a name="authentication"></a>
## Autenticação

Para começar, precisamos instruir o Fortify para retornar nossa "login" visual. Lembre-se de que o Fortify é uma biblioteca de autenticação sem cabeça. Se você deseja uma implementação do frontend das características de autenticação do Laravel que já estão prontas para você, use um [Kit de inicialização da aplicação](docs/starter-kits).

Todos os métodos de lógica de renderização da visão 'all' podem ser personalizados usando os métodos apropriados disponíveis via a classe 'Laravel\Fortify\Fortify'. Normalmente, você deve chamar esse método do método 'boot' da classe 'App\Providers\FortifyServiceProvider' do seu aplicativo. Fortify cuidará de definir a rota '/login' que retorna esta visão:

```php
    use Laravel\Fortify\Fortify;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::loginView(function () {
            return view('auth.login');
        });

        // ...
    }
```

O modelo de login deve incluir um formulário que faça uma requisição POST para `/login`. O endpoint `/login` espera uma string `email` / `username` e uma `password`. O nome do campo email/nome de usuário deve corresponder ao valor de `username` no arquivo de configuração `config/fortify.php`. Além disso, um campo booleano `remember` pode ser fornecido para indicar que o usuário gostaria de usar a funcionalidade "lembrar-me" fornecida pelo Laravel.

Se o acesso for bem sucedido, o Fortify irá redirecionar para o URI configurado via a opção de configuração "home" dentro do arquivo de configurações "fortify" de sua aplicação. Se o pedido foi um XHR, será retornada uma resposta HTTP 200.

Se a requisição não foi bem sucedida, o usuário será redirecionado de volta para a tela de login e as validações de erros estarão disponíveis para você através do $errors compartilhado [Blade template variable](/docs/validation#quick-displaying-the-validation-errors). Ou, no caso de uma requisição AJAX, os erros de validação serão retornados com o 422 HTTP response.

<a name="customizing-user-authentication"></a>
### Personalizando Autenticação de Usuário

O Fortify irá automaticamente buscar e autenticar o usuário com base nas credenciais fornecidas e no guard de autenticação configurado para sua aplicação. Contudo, você talvez queira ter total personalização sobre como as credenciais de login são autenticadas e os usuários são buscados. Felizmente, o Fortify permite que você faça isso usando o método `Fortify::authenticateUsing`.

Este método aceita um "closure" que recebe a solicitação HTTP recebida. O "closure" é responsável por validar as credenciais de login anexadas à solicitação e retornar uma instância do usuário associada. Se as credenciais forem inválidas ou nenhum usuário puder ser encontrado, o "closure" deve retornar `null` ou `false`. Normalmente, este método deve ser chamado do método `boot` do seu `FortifyServiceProvider`:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
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
#### Guarda de Autenticação

Você pode personalizar o guarda de autenticação usado pelo Fortify dentro do arquivo de configuração "fortify" do seu aplicativo. No entanto, você deve garantir que o guarda configurado seja uma implementação de `Illuminate\Contracts\Auth\StatefulGuard`. Se você estiver tentando usar o Laravel Fortify para autenticar um SPA, use o guarda padrão 'web' do Laravel em combinação com [Laravel Sanctum](https://laravel.com/docs/sanctum).

<a name="customizing-the-authentication-pipeline"></a>
### Personalizando o Pipeline de Autenticação

Laravel Fortify autentica solicitações de login através de uma linha de classes invocáveis. Se você quiser, você pode definir um pipeline personalizado de classes que as solicitações de login devem ser canalizadas através do. Cada classe deve ter um método `__invoke` que recebe a instância `Illuminate\Http\Request` que está chegando e, como middleware, uma variável `$next` invocada para passar a solicitação à próxima classe na linha de condução.

Para definir sua pipeline personalizada, você pode usar o método Fortify::authenticateThrough. Este método aceita uma função anônima que deve retornar o array de classes para canalizar a solicitação de login através. Normalmente, este método deve ser chamado do método 'boot' da sua classe 'App\Providers\FortifyServiceProvider'.

O exemplo abaixo contém o definição padrão do pipeline que você pode usar como ponto de partida quando fazendo suas próprias modificações:

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

#### Autenticação Limitada

Por padrão, o Fortify vai limitar tentativas de autenticação usando middleware 'EnsureLoginIsNotThrottled'. Esse middleware limita as tentativas que são exclusivas de uma combinação de nome de usuário e endereço IP.

Alguns aplicativos podem exigir uma abordagem diferente para reduzir as tentativas de autenticação, tais como a redução por endereço IP. Portanto, o Fortify permite que você especifique seu próprio [limite de taxa](/docs/routing#rate-limiting) via a opção de configuração 'fortify.limiters.login'. É claro, esta configuração se encontra no arquivo de configuração do seu aplicativo em 'config/fortify.php'.

> [!Nota]
> Usando uma combinação de controle de tráfego, autenticação de dois fatores e um firewall de aplicativos da Web externo (WAF), você fornecerá a defesa mais robusta para seus usuários legítimos do aplicativo.

<a name="customizing-authentication-redirects"></a>
### Personalizando Redirecionamento

Se o acesso for bem sucedido, o Fortify redirecionará você para o URI configurado via a opção de configuração "home" no arquivo de configuração do aplicativo "fortify". Se a solicitação de login foi uma requisição XHR, será retornada uma resposta HTTP 200. Após um usuário fazer logout do aplicativo, ele será redirecionado para o URI "/".

Se você precisa de personalização avançada desse comportamento, você pode ligar implementações dos contratos `LoginResponse` e `LogoutResponse` ao contêiner de serviço Laravel. Normalmente isso deve ser feito dentro do método `register` da classe `App\Providers\FortifyServiceProvider` no seu aplicativo.

```php
use Laravel\Fortify\Contracts\LogoutResponse;

/**
 * Register any application services.
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

Quando o recurso de autenticação com dois fatores de Fortify estiver ativado, o usuário será obrigado a inserir um token numérico de seis dígitos durante o processo de autenticação. Este token é gerado usando uma senha de uso único baseada no tempo (TOTP), que pode ser obtida a partir de qualquer aplicação móvel de autenticação compatível com TOTP, como o Google Authenticator.

Antes de começar, você deve primeiro garantir que seu modelo de aplicação 'App\Models\User' usa o 'Laravel\Fortify\TwoFactorAuthenticatable' Trait:

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

Na sequência, você deve construir uma tela dentro de sua aplicação onde os usuários podem gerenciar suas configurações de autenticação com dois fatores. Esta tela deve permitir que o usuário habilite e desabilite a autenticação com dois fatores, bem como regenerar seus códigos de recuperação da autenticação com dois fatores.

> Por padrão, o arquivo de configuração 'fortify' instrui a configuração do Fortify's dois fatores a exigir a confirmação da senha antes da modificação. Portanto, sua aplicação deve implementar os recursos do Fortify's [confirmação de senha](#password-confirmation) antes de continuar.

<a name="enabling-two-factor-authentication"></a>
### Habilitando Autenticação de Dois Fatores

Para começar habilitando a autenticação de dois fatores, seu aplicativo deve fazer uma solicitação POST para o ponto final `/user/two-factor-authentication` definido pelo Fortify. Se a solicitação for bem sucedida, o usuário será redirecionado de volta para a URL anterior e a variável de sessão `status` será definida como `two-factor-authentication-enabled`. Você pode detectar esta variável de sessão em seus modelos para exibir a mensagem apropriada de sucesso. Se a solicitação foi uma solicitação XHR, retornará "200" HTTP.

Depois de escolher habilitar autenticação com dois fatores, o usuário ainda precisa confirmar sua configuração de autenticação com dois fatores fornecendo um código válido de autenticação com dois fatores. Portanto, seu "mensagem de sucesso" deve instruir que a autenticação com dois fatores é necessária para ser confirmada:

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        Please finish configuring two factor authentication below.
    </div>
@endif
```

Em seguida, você deve exibir o código QR de autenticação de dois fatores para o usuário digitalizar em seu aplicativo de autenticador. Se você estiver usando Blade para renderizar a interface do usuário do aplicativo, pode recuperar o SVG do código QR usando o método `twoFactorQrCodeSvg` disponível na instância do usuário:

```php
$request->user()->twoFactorQrCodeSvg();
```

Se você estiver criando um frontend de JavaScript, você pode fazer uma requisição GET do XHR para o endpoint `/user/two-factor-qr-code` para obter o código QR da autenticação de dois fatores do usuário. Este endpoint retornará um objeto JSON que contém uma chave `svg`.

<a name="confirming-two-factor-authentication"></a>
#### Confirmando Autenticação de Dois Fatores

Além de exibir o código QR do autenticador de dois fatores, você deve fornecer um campo de entrada de texto para que o usuário forneça um código de autenticação válido para "confirmar" sua configuração de autenticação de dois fatores. Este código deve ser fornecido ao aplicativo Laravel por meio de uma solicitação POST para o ponto final `/user/confirmed-two-factor-authentication` definido pelo Fortify.

Se o pedido for bem sucedido, o usuário será redirecionado para a mesma URL anterior e a variável de sessão 'status' será definida como 'two-factor-authentication-confirmed':

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        Two factor authentication confirmed and enabled successfully.
    </div>
@endif
```

Se a solicitação de verificação da autenticação de dois fatores for feita através de uma requisição AJAX, retornará uma resposta HTTP 200.

<a name="displaying-the-recovery-codes"></a>
#### Exibindo os códigos de recuperação

Você também deve exibir os códigos de recuperação em dois fatores do usuário. Esses códigos de recuperação permitem que o usuário autentique se ele perder acesso ao dispositivo móvel. Se você estiver usando o Blade para renderizar a interface do usuário da sua aplicação, você pode acessar os códigos de recuperação através da instância do usuário autenticado:

```php
(array) $request->user()->recoveryCodes()
```

Se você estiver construindo uma interface de usuário com JavaScript, você pode fazer um pedido GET usando XMLHttpRequest para o ponto final /user/two-factor-recovery-codes. Este ponto final retornará um array JSON contendo os códigos de recuperação do usuário.

Para regenerar o código de recuperação do usuário, seu aplicativo deve fazer uma solicitação POST para o ponto final `/user/two-factor-recovery-codes`.

<a name="authenticating-with-two-factor-authentication"></a>
### Autenticação com dois fatores

Durante o processo de autenticação, Fortify redirecionará automaticamente o usuário para a tela de desafio de autenticação de dois fatores do seu aplicativo. No entanto, se seu aplicativo estiver fazendo um pedido de login XHR, a resposta JSON retornada após uma tentativa bem-sucedida de autenticação conterá um objeto JSON que possui uma propriedade booliana 'two_factor'. Você deve inspecionar este valor para saber se deve redirecionar o usuário para a tela de desafio de autenticação de dois fatores do seu aplicativo.

Para começar a implementar dois fatores de autenticação funcionalidade, precisamos instruir Fortify como retornar nossa visualização de desafio de dois fatores de autenticação. Toda lógica de renderização de visualização de autenticação do Fortify pode ser personalizada usando os métodos apropriados disponíveis via a classe `Laravel\Fortify\Fortify`. Tipicamente, você deve chamar esse método do método 'boot' da classe 'App\Providers\FortifyServiceProvider' de seu aplicativo:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::twoFactorChallengeView(function () {
        return view('auth.two-factor-challenge');
    });

    // ...
}
```

A Fortify cuidará da definição do "route / two-factor-challenge" que retorna esta visão. Seu modelo "two-factor-challenge" deve incluir um formulário que faz uma solicitação POST para o ponto final "/ two-factor-challenge". A ação "/ two-factor-challenge" espera um campo "code" que contém um token TOTP válido ou um campo "recovery_code" que contém um dos códigos de recuperação do usuário.

Se o login for bem-sucedido, Fortify redirecionará o usuário para o URI configurado via a opção de configuração "home" dentro do arquivo de configuração "fortify" da sua aplicação. Se o pedido de login for um pedido XHR, será retornada uma resposta HTTP 204

Se o pedido não tiver sido bem sucedido, o usuário será redirecionado de volta para a tela do desafio de dois fatores e os erros de validação estarão disponíveis para você via o parâmetro compartilhado $errors [variavel de modelo blade] . Ou, no caso de um pedido XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a name="disabling-two-factor-authentication"></a>
### Desativando Autenticação de Dois Fatores

Para desativar dois fatores de autenticação, seu aplicativo deve fazer uma solicitação DELETE para o ponto final '/user/two-factor-authentication'. Lembre-se, os pontos finais do Fortify para dois fatores de autenticação exigem [confirmação de senha](#password-confirmation) antes de serem chamados.

<a name="registration"></a>
## Registro

Para começar a implementar nossa funcionalidade de registro em nosso aplicativo, precisamos instruir o Fortify sobre como retornar nossa "visão" de registro. Lembre-se, Fortify é uma biblioteca de autenticação sem cabeça. Se você gostaria de uma implementação de front-end das características de autenticação do Laravel que já estão prontas para você, você deve usar um [kit inicial de aplicativo](https://docs.laravel.com/guides/authentication#starting-a-new-authentication-project).

Todas as lógica de renderização do Fortify podem ser personalizados usando os métodos apropriados disponíveis através da classe 'Laravel/Fortify/Fortify'. Normalmente você deve chamar este método a partir do método 'boot' da sua classe 'App\Providers\FortifyServiceProvider':

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::registerView(function () {
        return view('auth.register');
    });

    // ...
}
```

Fortify cuidará de definir a rota 'registro' que retorna esta visão. Seu modelo "registro" deve incluir um formulário que faça uma solicitação POST para o ponto final "registro" definido por Fortify.

O endpoint `/register` espera uma string de `nome`, endereço de e-mail ou nome de usuário, `senha`, e `senha_confirmação`. O nome do campo de e-mail/nome de usuário deve corresponder ao valor da configuração `usuário` definido no arquivo de configuração do seu aplicativo'fortify'.

Se o registro for bem sucedido, o Fortify redirecionará o usuário ao URI configurado via a opção "home" dentro do arquivo de configuração do seu aplicativo' 'fortify'. Se a requisição for uma solicitação XHR, retornará um 201 HTTP.

Se o pedido não for bem sucedido, o usuário será redirecionado de volta para a tela de registro e os erros de validação estarão disponíveis para você via o $errors compartilhado [variável do modelo Blade](/docs/validation#quick-displaying-the-validation-errors). Ou, no caso de uma solicitação XHR, os erros de validação serão retornados com um 422 HTTP resposta.

<a name="customizing-registration"></a>
### Personalizando o Registro

O processo de validação e criação do usuário pode ser personalizado modificando a ação "App\Actions\Fortify\CreateNewUser" que foi gerada quando você instalou o Laravel Fortify.

<a name="password-reset"></a>
## redefinir senha

<a name="requesting-a-password-reset-link"></a>
### Solicitando um Link de Re-definir Senha

Para começar a implementar o recurso de redefinição de senha da aplicação, precisamos instruir o Fortify como retornar nossa "view de redefinição de senha". Lembre-se, o Fortify é uma biblioteca de autenticação headless. Se você gostaria de uma implementação frontend dos recursos de autenticação do Laravel que já está completo para você, você deve usar um [kit de inicialização da aplicação](/docs/starter-kits).

Todos os métodos de renderização de lógica do Fortify podem ser personalizados usando os métodos apropriados disponíveis via a classe 'Laravel/Fortify/Fortify'. Normalmente, você deve chamar esse método do método de inicialização da classe 'App\Providers\FortifyServiceProvider' do seu aplicativo.

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::requestPasswordResetLinkView(function () {
        return view('auth.forgot-password');
    });

    // ...
}
```

Fortify cuidará da definição do ponto final `/forgot-password` que retorna esta visualização. Seu modelo `forgot-password` deve incluir um formulário que faça uma solicitação POST para o ponto final `/forgot-password`.

O endpoint `/forgot-password` espera um campo de string `email`. O nome desse campo/coluna do banco de dados deve corresponder ao valor da configuração `email` no arquivo de configuração `configuração-do-fority` do seu aplicativo.

<a name="handling-the-password-reset-link-request-response"></a>
#### Manipulação do link de redefinição de senha

Se o pedido de redefinição da senha for bem sucedido, o Fortify redirecionará o usuário para o ponto final `/forgot-password` e enviará um email ao usuário com uma ligação segura que ele pode usar para redefinir sua senha. Se a solicitação foi um XHR, será retornada uma resposta HTTP 200.

Após ter sido redirecionado de volta para o endpoint `/forgot-password` após um pedido bem sucedido, a variável de sessão 'status' pode ser usada para exibir o estado do pedido da tentativa de redefinição da senha.

O valor da variável de sessão `$status` corresponderá a um dos textos definidos no arquivo de idiomas dentro da sua aplicação 'passwords' [arquivo de idioma]. Se você gostaria de personalizar este valor e não publicou os arquivos de idiomas do Laravel, você pode fazê-lo via o comando Artisan `lang:publish`:

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

Se o pedido não for bem sucedido, o usuário será redirecionado de volta para a tela do link de redefinição da senha e os erros de validação estarão disponíveis para você via `$errors` compartilhada [variavel de modelo blade](/docs/validation#exibindo-rapidamente-os-erros-de-validação). Ou, no caso de uma solicitação XHR, os erros de validação serão retornados com um código de resposta HTTP 422.

<a name="resetting-the-password"></a>
### Redefinindo senha

Para terminar a implementação da funcionalidade de redefinição de senha do nosso aplicativo, precisamos instruir o Fortify como retornar nossa "definição de senha" .

Todos os métodos de renderização da lógica do Fortify podem ser personalizados usando os métodos apropriados disponíveis através da classe 'Laravel/Fortify/Fortify'. Normalmente, você deve chamar esse método do método 'boot' da classe 'FortifyServiceProvider' do seu aplicativo:

```php
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::resetPasswordView(function (Request $request) {
        return view('auth.reset-password', ['request' => $request]);
    });

    // ...
}
```

Fortify cuidará de definir o caminho para exibir esta visão. Seu modelo "reset-password" deve incluir um formulário que faça uma solicitação POST para "/reset-password".

O endpoint `/reset-password` espera um campo de string "email", um campo "password", um campo "password_confirmation" e um campo oculto chamado "token" que contém o valor de `request()->route('token')`. O nome do  "email" campo / coluna de banco de dados deve corresponder ao valor de configuração da "email" definido dentro seu arquivo de configuração "fortify" do aplicativo.

<a name="handling-the-password-reset-response"></a>
#### Tratando a Resposta do Redefinir Senha

Se o pedido de redefinição de senha foi bem sucedido, o Fortify irá redirecionar para o caminho `/login` para que o usuário possa se logar com sua nova senha. Além disso, será definida uma variável de sessão `status` para que você possa exibir o status bem sucedido da redefinição na tela de login:

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

Se a solicitação foi uma solicitação XMLHttpRequest, será retornada uma resposta HTTP de 200.

Se o pedido não tiver sido bem sucedido, o usuário será redirecionado de volta para a tela de redefinição de senha e os erros de validação estarão disponíveis para você através do parâmetro compartilhado `$errors` [variavel de modelo Blade](/docs/validation#exibindo-rapidamente-os-erros-de-validaçao). Ou, no caso de um pedido XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a name="customizing-password-resets"></a>
### Personalizando redefinições de senha

O processo de redefinição de senha pode ser personalizado modificando a ação 'App\Actions\ResetUserPassword' que foi gerada quando você instalou o Laravel Fortify.

<a name="email-verification"></a>
## Verificação de e-mail

Depois de registro, você pode querer usuários para verificar o seu endereço de e-mail antes de prosseguir acessando a sua aplicação. Para começar, certifique-se que o recurso 'emailVerification' está habilitado em seu arquivo de configuração 'fortify' na matriz de recursos. Em seguida, você deve garantir que sua classe "App\Models\User" implementa a interface "Illuminate\Contracts\Auth\MustVerifyEmail".

Uma vez que estes dois passos de configuração tenham sido concluídos, os usuários recém-registrados receberão um e-mail solicitando a verificação da propriedade do endereço de e-mail deles. No entanto, precisamos informar à Fortify como exibir a tela de verificação por e-mail, que informa ao usuário que ele precisa clicar o link de verificação no e-mail.

Todos da lógica de renderização do Fortify podem ser personalizados usando os métodos apropriados disponíveis via a classe 'Laravel/Fortify/Fortify'. Geralmente, você deve chamar esse método do método 'boot' da classe 'App/Providers/FortifyServiceProvider' do seu aplicativo.

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::verifyEmailView(function () {
        return view('auth.verify-email');
    });

    // ...
}
```

Fortify cuidará de definir a rota que exibe esta visão quando um usuário é redirecionado para o ponto final `/email/verify` pelo middleware 'verificado' integrado do Laravel.

O modelo "verify-email" deve incluir uma mensagem informativa instruindo o usuário a clicar no link de verificação enviado para sua caixa postal.

<a name="resending-email-verification-links"></a>
#### Enviando novamente os links de verificação e-mail

Se desejar você pode adicionar um botão no modelo de aplicação `verify-email` que aciona uma solicitação POST para o endpoint `/email/verification-notification`. Quando este endpoint recebe uma solicitação, enviará por e-mail uma nova link de verificação ao usuário, permitindo que ele obtenha uma nova link de verificação caso a anterior tenha sido excluída acidentalmente ou tenha se perdido.

Se o pedido para enviar um email com o link de verificação foi bem sucedido, Fortify redirecionará o usuário para o endpoint `email/verify` com uma variável de sessão "status", permitindo que você exiba uma mensagem informativa para o usuário informando que a operação foi bem sucedida. Se o pedido foi um XHR, um 202 será retornado:

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        A new email verification link has been emailed to you!
    </div>
@endif
```

<a name="protecting-routes"></a>
### Proteção de Rotas

Para especificar que um ou vários rotas requerem que o usuário tenha verificado seu endereço de e-mail, você deve anexar o 'middleware' padrão do Laravel `verified` para a rota. O 'alias' middleware 'verified' é automaticamente registrado pelo Laravel e serve como uma abreviação para o 'middleware' 'Illuminate\Routing\Middleware\ValidateSignature':

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## Confirmação da senha

Enquanto constrói sua aplicação, você pode ter ações que ocasionalmente devem exigir que o usuário confirme a senha antes da ação ser executada. Normalmente, estas rotas são protegidas pelo Laravel' built-in middleware 'password.confirm'.

Para começar a implementar a funcionalidade de confirmação de senha, precisamos instruir o Fortify sobre como retornar nossa visualização "confirmação de senha". Lembre-se, o Fortify é uma biblioteca headless de autenticação. Se você deseja uma implementação frontend dos recursos de autenticação do Laravel que já são concluídos para você, você deve usar um [kit inicial de aplicativo](/docs/starter-kits).

Toda a lógica de renderização de visão do Fortify pode ser personalizada usando os métodos apropriados disponíveis via a classe `Laravel/Fortify/Fortify`. Tipicamente, você deve chamar esse método do método 'boot' da classe de provedor 'FortifyServiceProvider' da sua aplicação: 'App\Providers\FortifyServiceProvider'.

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::confirmPasswordView(function () {
        return view('auth.confirm-password');
    });

    // ...
}
```

Fortify cuidará de definir o ponto final `/user/confirm-password` que retorna esta visão. Seu modelo `confirm-password` deve incluir um formulário que faça uma solicitação POST para o ponto final `/user/confirm-password`. O ponto final `/user/confirm-password` espera um campo `password` que contém a senha atual do usuário.

Se a senha corresponder à senha atual do usuário, o Fortify redirecionará o usuário para o ponto de acesso que ele estava tentando acessar. Se a solicitação foi uma solicitação xhr, será retornada uma resposta http 201.

Se o pedido não tiver sucesso, o usuário será redirecionado de volta para a tela do confirmando senha e os erros de validação estarão disponíveis para você através da variável `$errors` compartilhada do modelo Blade. Ou, no caso de uma solicitação XHR, os erros de validação serão retornados com uma resposta HTTP 422.
