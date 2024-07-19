# Laravel Fortify

<a name="introduction"></a>
## Introdução

 [Laravel Fortify](https://github.com/laravel/fortify) é uma implementação de backend para autenticação independente do frontend para Laravel. O Fortify regista as rotas e controladores necessários para implementar todos os recursos de autenticação do Laravel, incluindo login, registro, recuperação da senha, verificação por email e muito mais. Após instalar o Fortify, pode executar a ordem `route:list` no comando Artisan para ver as rotas que o Fortify tem registrado.

 Como a Fortify não fornece sua própria interface de usuário, ela deve ser emparelhada com sua própria interface de usuário que faz solicitações aos roteadores que registra. Vamos discutir exatamente como fazer solicitações a esses roteiros no restante desta documentação

 > [!ATENÇÃO]
 [autenticação](/docs/authentication),

<a name="what-is-fortify"></a>
### O que é o Fortify?

 Como mencionado anteriormente, o Laravel Fortify é uma execução de autenticação front-end independente para o Laravel. O Fortify registra os rotas e controladores necessários para implementar todas as funcionalidades de autenticação do Laravel, incluindo login, registro, reinicialização da senha, verificação de e-mail e muito mais.

 **Não é obrigatório o uso do Fortify para utilizar os recursos de autenticação do Laravel.** Você pode sempre interagir manualmente com os serviços de autenticação do Laravel, seguindo a documentação disponível nas seções [autenticação](/docs/authentication), [reset de senha](/docs/passwords) e [verificação por email](/docs/verification).

 Se você é novo no Laravel, poderá querer explorar o [Laravel Breeze](/docs/starter-kits) aplicativo de kit inicial antes de tentar usar Laravel Fortify. O Laravel Breeze oferece um planejamento de autenticação para seu aplicativo que inclui uma interface do usuário construída com a ajuda do [Tailwind CSS](https://tailwindcss.com). Diferente da Fortify, o Breeze publica suas rotas e controladores diretamente no seu aplicativo. Isso permite que você estude e se familiarize com as características de autenticação do Laravel antes de permitir que a Fortify implemente essas características para você.

 O Laravel Fortify, em essência, pega os controles e rotas do Laravel Breeze e as disponibiliza como um pacote que não inclui uma interface de usuário. Isso permite que você ainda escale rapidamente a implementação backend da camada de autenticação do seu aplicativo sem estar vinculado a opiniões específicas do frontend.

<a name="when-should-i-use-fortify"></a>
### Quando devo usar o Fortify?

 Você pode estar se perguntando quando é apropriado usar o Laravel Fortify. Primeiro, se você estiver usando um dos [kits iniciais da aplicação de Laravel] (https://laravel.com/docs/5.7/starter-kits), não será necessário instalar o Laravel Fortify, pois todos os kits de inicialização de aplicativo do Laravel já fornecem uma implementação completa de autenticação.

 Se você não estiver usando um kit iniciante de aplicativo e seu aplicativo precisar de recursos de autenticação, tem duas opções: implementar manualmente os recursos de autenticação do seu aplicativo ou usar o Laravel Fortify para fornecer a implementação de backend destes recursos.

 Se você optar pelo instalador da Fortify, sua interface irá fazer solicitações para os rotas de autenticação da Fortify, detalhadas nesta documentação, a fim de registrar e autenticar os usuários.

 Se optar por interagir manualmente com os serviços de autenticação do Laravel em vez de utilizar o Fortify, poderá fazê-lo seguindo a documentação disponível nas secções [Autenticação](/docs/authentication), [Reinicialização da Senha](/docs/passwords) e [Verificação de E-mail](/docs/verification).

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify e Laravel Sanctum

 Alguns desenvolvedores se confundem com relação à diferença entre [Laravel Sanctum](/docs/sanctum) e o Laravel Fortify. Como os dois pacotes resolvem problemas diferentes, mas relacionados, o Laravel Fortify e o Laravel Sanctum não são pacotes mutuamente exclusivos ou concorrentes.

 O Laravel Sanctum só se preocupa em gerenciar tokens de API e autenticar usuários existentes usando cookies ou tokens de sessão. O Sanctum não fornece nenhuma rota que suporta o registro do usuário, a redefinição da senha etc.

 Se você estiver tentando criar manualmente a camada de autenticação para um aplicativo que ofereça uma API ou que sirva como servidor interno para uma aplicação de página única, é perfeitamente possível que você use tanto o Laravel Fortify (para registro de usuário, reset de senha etc.) quanto o Laravel Sanctum (gerenciamento de token da API, autenticação da sessão).

<a name="installation"></a>
## Instalação

 Para começar, instale o Fortify utilizando o gestor de pacotes Composer:

```shell
composer require laravel/fortify
```

 Em seguida, publique os recursos do Fortify usando o comando Artiesten `fortify:install`:

```shell
php artisan fortify:install
```

 Esse comando publicará as ações do Fortify para o diretório `app/Actions`, que será criado caso não exista. Além disso, também serão publicados o `FortifyServiceProvider` (fornecedor de serviços), arquivo de configuração e todas as migrações do banco de dados necessárias.

 Em seguida você deve migrar seu banco de dados:

```shell
php artisan migrate
```

<a name="fortify-features"></a>
### Funções de fortificação

 O arquivo de configuração `fortify` contém uma matriz de configurações chamada `features`. Essa matriz define quais rotas/recursos do backend serão expostos por Fortify, em modo padrão. Se você não estiver usando o Fortify em combinação com o [Jetstream Laravel](https://jetstream.laravel.com/), recomendamos que ative apenas os recursos abaixo, que são os recursos de autenticação básicos oferecidos pela maioria das aplicações Laravel:

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### Desativando visualizações

 Por padrão, Fortify define rotas que visam o retorno de vistas, como uma tela de login ou uma tela de registro. No entanto, se estiver a desenvolver um aplicativo single-page ativo em JavaScript, poderá não precisar destas rotas. Para esse efeito, poderá desativar totalmente estas rotas, definindo o valor da configuração `views` na sua aplicação no arquivo de configuração `config/fortify.php` para `false`:

```php
'views' => false,
```

<a name="disabling-views-and-password-reset"></a>
#### Desativar Visualizações e Rever a Senha

 Se você optar por desativar as vistas de Fortify e estiver implementando recursos para redefinição da senha do seu aplicativo, ainda deve definir uma rota chamada `password.reset`, que será responsável por exibir a visualização "redefinir senha" do seu aplicativo. Isso é necessário porque o recurso de notificação de redefinição da senha do Laravel, o `Illuminate\Auth\Notifications\ResetPassword`, gerará a URL para redefinição da senha por meio da rota chamada "password.reset".

<a name="authentication"></a>
## Autenticação

 Para começar, precisamos informar ao Fortify como retornar nossa visão de "login". Lembre-se que o Fortify é uma biblioteca de autenticação sem frontend. Se você deseja uma implementação do frontend dos recursos de autenticação do Laravel, com tudo pronto para você, deverá usar um [kit de aplicativos iniciais](/docs/starter-kits).

 Toda a lógica de renderização da vista de autenticação pode ser personalizada usando os métodos adequados disponíveis via a classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método na ordem de inicialização da classe `App\Providers\FortifyServiceProvider` do seu aplicativo. O Fortify cuidará da definição da rota `/login` que retorna essa vista:

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

 Seu modelo de login deve incluir um formulário que faça uma solicitação POST para o URL `/login`. O ponto final do URI `/login` espera por um string `email/username` e uma senha. O nome do campo email / username deve corresponder ao valor `username` dentro do arquivo de configuração `config/fortify.php`. Além disso, é possível fornecer o campo booleanamente `remember`, para indicar que o usuário gostaria de usar a funcionalidade "esqueceu-me" providenciada pelo Laravel.

 Se o tentativa de logon for bem sucedida, Fortify irá redirecioná-lo para o URI definido através da opção de configuração `home` dentro do ficheiro de configuração da aplicação `fortify`. Se a solicitação de login foi uma solicitação XHR, será retornada uma resposta HTTP 200.

 Se o pedido não for bem-sucedido, o utilizador será redirecionado para a tela de login e os erros de validação estarão disponíveis através da [variável de modelo Blade `$errors`](/docs/validation#quick-displaying-the-validation-errors). Caso se trate de um pedido XHR, os erros de validação serão devolvidos com a resposta HTTP 422.

<a name="customizing-user-authentication"></a>
### Personalizar a autenticação de utilizadores

 O Fortify irá recuperar e autenticar automaticamente o usuário com base nas credenciais fornecidas e no guarda-chuva de autenticação que tenha sido configurado para a aplicação. No entanto, pode ser desejável ocasionalmente ter total personalização sobre como os dados da conta são autenticados e os usuários são recuperados. Para esse fim, o Fortify permite facilmente fazer isso utilizando o método `Fortify::authenticateUsing`.

 Este método aceita um fecho que recebe a solicitação HTTP entrada. O fecho é responsável por validar as credenciais de login ligadas à solicitação e retorna a instância do usuário associado. Se as credenciais forem inválidas ou não existir nenhum usuário, o fecho deverá retornar `null` ou `false`. Normalmente, este método deve ser chamado no método `boot` da sua `FortifyServiceProvider`:

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
#### Proteção de autenticação

 Você pode personalizar o guard de autenticação usado pelo Fortify no arquivo de configuração `fortify` do seu aplicativo. No entanto, você deve garantir que o guard configurado seja uma implementação do `Illuminate\Contracts\Auth\StatefulGuard`. Se você estiver tentando usar Laravel Fortify para autenticar um SPA, você deve usar o guard "web" padrão do Laravel em combinação com [Laravel Sanctum](https://laravel.com/docs/sanctum).

<a name="customizing-the-authentication-pipeline"></a>
### Personalização do fluxo de autenticação

 O Laravel Fortify autentica solicitações de login através de uma cadeia de classes invocáveis. Se pretender, pode definir uma cadeia personalizada de classes que as solicitações de login devem passar por cada classe deve ter um método `__invoke` que recebe a instância `Illuminate\Http\Request` inalante e, como [médias filas](/docs/middleware), uma variável `$next` que é invocada para passar a solicitação à próxima classe da cadeia.

 Para definir o pipeline personalizado, você pode usar o método `Fortify::authenticateThrough`. Este método aceita um closure que deve retornar a matriz de classes para a qual o pedido de login será encaminhado. Normalmente, esse método é chamado do método `boot` da classe `App\Providers\FortifyServiceProvider`.

 O exemplo abaixo contém a definição da canalização por padrão que você pode usar como ponto de partida ao fazer suas próprias modificações:

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

 Por padrão, o Fortify limitará os tentativas de autenticação utilizando a infraestrutura `EnsureLoginIsNotThrottled`. Esta infraestrutura limita as tentativas que são exclusivas para uma combinação de nome de usuário e IP.

 Algumas aplicações podem exigir uma abordagem diferente ao limitarem as tentativas de autenticação, tal como o limite por endereço IP apenas. Por conseguinte, Fortify permite especificar a sua própria taxa de limitação através da opção de configuração `fortify.limiters.login`. Naturalmente, esta opção de configuração está localizada no arquivo de configuração da aplicação `config/fortify.php`.

 > [!AVISO]
 [autenticação de dois fatores](/docs/fortify#two-factor-authentication), e um firewall externo para aplicação Web (WAF, do inglês “Web Application Firewall”) irá oferecer a defesa mais robusta aos usuários legítimos da sua aplicação.

<a name="customizing-authentication-redirects"></a>
### Personalizar redirecionamentos

 Se o login for bem-sucedido, Fortify redirecionará você para o URI configurado através da opção de configuração `home` do arquivo de configuração `fortify` da sua aplicação. Caso a solicitação de login tenha sido uma solicitação XHR, um resposta HTTP 200 será retornada. Após um usuário fazer logout da aplicação, o usuário será redirecionado para o URI `/`.

 Se necessitar de uma personalização avançada deste comportamento, pode associar implementações dos contratos LoginResponse e LogoutResponse ao [conjunto de serviços](/docs/container) do Laravel. Normalmente, isto deve ser feito dentro da método `register` da classe `App\Providers\FortifyServiceProvider` do seu aplicativo:

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
## Autenticação em dois passos

 Se o recurso de autenticação de dois fatores do Fortify estiver ativado, o utilizador será solicitado a inserir um token numérico de seis dígitos durante o processo de autenticação. Este token é gerado com base numa palavra-passe único temporal (TOTP) que pode ser recuperada de qualquer aplicação móvel de autenticação compatível TOTP, como Google Authenticator.

 Antes de começar, verifique se o modelo do seu aplicativo (`App\Models\User`) usa o trato `Laravel\Fortify\TwoFactorAuthenticatable`:

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

 Em seguida, você deve criar uma tela dentro do aplicativo onde os usuários possam gerenciar suas configurações de autenticação de dois fatores. Essa tela deve permitir que o usuário ative e desative a autenticação de dois fatores, bem como regenerar seus códigos de recuperação de autenticação de dois fatores.

 O recurso de [confirmação da senha (#password-confirmation)] deve ser ativado antes de prosseguir.

<a name="enabling-two-factor-authentication"></a>
### Ativação de autenticação em duas etapas

 Para ativar a autenticação de dois fatores, o seu aplicativo deve fazer um pedido POST para o ponto final `/user/two-factor-authentication`, definido pela Fortify. Se o pedido for bem-sucedido, o utilizador será redirecionado ao URL anterior e a variável `status` da sessão será definida como `two-factor-authentication-enabled`. Pode detectar esta variável de sessão `status` nos seus modelos para exibir a mensagem de sucesso adequada. Se o pedido for um pedido XHR, é enviado um resposta HTTP com código `200`.

 Depois de optar por ativar a autenticação de dois fatores, o utilizador deve ainda "confirmar" a configuração da autenticação de dois fatores com um código de confirmação válido. Por conseguinte, o seu mensagem de "sucesso" deve instruir o utilizador para que confirme a sua autenticação de dois fatores:

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        Please finish configuring two factor authentication below.
    </div>
@endif
```

 Em seguida, você deve exibir o código de QR da autenticação de dois fatores para que o usuário scaneie na aplicação de autenticação. Se você estiver usando o Blade para renderizar a interface do seu aplicativo, poderá recuperar o código SVG do QR com o método `twoFactorQrCodeSvg`, disponível na instância de usuário:

```php
$request->user()->twoFactorQrCodeSvg();
```

 Se estiver a construir uma aplicação front-end executada em JavaScript, pode enviar um pedido GET XHR para o ponto final `/user/two-factor-qr-code`, a fim de recuperar o código QR de autenticação de dois fatores do utilizador. Este ponto final retorna um objeto JSON que inclui uma chave `svg`.

<a name="confirming-two-factor-authentication"></a>
#### Conferir a autenticação em dois passos

 Além de exibir o código QR da autenticação em dois fatores do usuário, você deve fornecer uma entrada de texto onde o usuário possa fornecer um código de validação para "confirmar" sua configuração de autenticação em dois fatores. Esse código deve ser enviado à aplicação Laravel por meio de um pedido POST ao endpoint `/user/confirmed-two-factor-authentication` definido pelo Fortify.

 Se o pedido for bem sucedido, o usuário será redirecionado para a URL anterior e a variável de sessão `status` será definida como `two-factor-authentication-confirmed`:

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        Two factor authentication confirmed and enabled successfully.
    </div>
@endif
```

 Se o pedido para o ponto de confirmação da autenticação em dois fatores foi feito através de um pedido de XHR, será enviado um retorno de resposta HTTP `200`.

<a name="displaying-the-recovery-codes"></a>
#### Exibição dos códigos de recuperação

 Você também deve exibir os códigos de recuperação de dois fatores do usuário. Esses códigos permitem que o usuário se autentele caso ele perca acesso ao seu dispositivo móvel. Se você estiver usando o Blade para renderizar o frontend da aplicação, pode ter acesso aos códigos de recuperação por meio da instância de usuário autenticado:

```php
(array) $request->user()->recoveryCodes()
```

 Se você estiver construindo um frontend baseado em JavaScript, poderá enviar uma requisição GET XHR para o endereço `/user/two-factor-recovery-codes`. Este endpoint retornará uma matriz JSON contendo os códigos de recuperação do usuário.

 Para renovar os códigos de recuperação do usuário, seu aplicativo deve fazer uma solicitação POST no ponto final "/user/two-factor-recovery-codes".

<a name="authenticating-with-two-factor-authentication"></a>
### Autenticação com a validação de dois fatores

 Durante o processo de autenticação, Fortify redireciona automaticamente o utilizador para a tela de desafio da autenticação de dois fatores da sua aplicação. No entanto, se a sua aplicação estiver a realizar um pedido de login XHR, a resposta JSON retornada após uma tentativa de autenticação bem-sucedida incluirá um objeto JSON que tem uma propriedade booleana `two_factor`. Deve inspecionar este valor para saber se deve redirecionar para a tela de desafio da autenticação de dois fatores da sua aplicação.

 Para começar a implementar a funcionalidade de autenticação em dois fatores, precisamos instruir o Fortify sobre como retornar nossa exibição desafio de autenticação em dois fatores. Toda a lógica de renderização da visualização de autenticação do Fortify pode ser personalizada usando os métodos apropriados disponíveis através da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar esse método a partir da própria inicialização do serviço Fortify:

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

 A Fortify se encarregará de definir o caminho `/two-factor-challenge`, que retorna essa visualização. Seu modelo `two-factor-challenge` deve incluir um formulário que faça uma solicitação POST para o endpoint `/two-factor-challenge`. A ação `/two-factor-challenge` espera por um campo `code` (código) que contenha um token TOTP válido ou pelo campo `recovery_code` (código de recuperação) que contenha um dos códigos de recuperação do usuário.

 Se o teste de logon for bem sucedido, o Fortify redireciona o utilizador para a URI configurada através da opção `home` na secção de configurações da aplicação. Se a solicitação de logon tiver sido uma solicitação XHR, será devolvido um código HTTP 204.

 Se o pedido não for bem sucedido, o usuário será redirecionado de volta para a tela do desafio de dois fatores e os erros de validação estarão disponíveis através da variável de modelo [Blade] ${errors} ([Documentação de validação](/docs/validation#mostrando-erros-de-validação-rápido)). No caso de um pedido XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a name="disabling-two-factor-authentication"></a>
### Desativar autenticação em dois passos

 Para desativar autenticação por dois fatores, a sua aplicação deve enviar um pedido DELETE para o ponto final de `/user/two-factor-authentication`. É importante ter em atenção que os pontos finais da Fortify exigem confirmação de senha [antes do seu uso](#password-confirmation).

<a name="registration"></a>
## Cadastro

 Para começar a implementação da funcionalidade de registro do nosso aplicativo, temos que informar o Fortify sobre como retornar nossa vista "register". Lembre-se, o Fortify é uma biblioteca autenticadora sem interface gráfica. Se você deseja uma implementação frontal das características de autenticação do Laravel e precisa que esteja pronta para uso, deve usar um [kit inicial da aplicação](/docs/starter-kits).

 Todas as lógicas de renderização do visual da Fortify podem ser customizadas usando os métodos apropriados disponíveis através da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar esse método a partir da metoda `boot` da sua classe `App\Providers\FortifyServiceProvider`:

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

 O Fortify vai cuidar da definição do caminho `/register`, que devolve essa visualização. Seu modelo `register` deve incluir um formulário que faça uma solicitação POST para o ponto final `/register` definido pelo Fortify.

 O ponto final `/register` espera os campos de string `name`, endereço de e-mail/nome de usuário, senha e `password_confirmation`. O nome do campo de e-mail/nome de usuário deve corresponder ao valor da configuração `username` definido no arquivo de configuração `fortify` do seu aplicativo.

 Se o registro for bem-sucedido, Fortify redireciona o utilizador para a URI configurada através da opção de configuração `home`, na ligação ao ficheiro de configuração `fortify` da aplicação. Caso a solicitação tenha sido uma solicitação XHR, é enviado um resposta HTTP 201.

 Se o pedido não for bem-sucedido, o usuário será redirecionado de volta para a tela de registro e os erros de validação estarão disponíveis através da variável do modelo Blade `$errors`. Caso tenha sido um pedido XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a name="customizing-registration"></a>
### Personalizar registro

 O processo de validação e criação do usuário pode ser personalizado modificando a ação `App\Actions\Fortify\CreateNewUser`, que foi gerada quando você instalou o Laravel Fortify.

<a name="password-reset"></a>
## Reconfiguração de Senha

<a name="requesting-a-password-reset-link"></a>
### Solicitar um link para redefinição da senha

 Para começar a implementação da funcionalidade de redefinição da senha do nosso aplicativo, é necessário instruir o Fortify sobre como retornar nossa visualização "esqueceu sua senha". Lembre-se que o Fortify é uma biblioteca de autenticação sem interface gráfica. Se você deseja uma implementação front-end dos recursos de autenticação do Laravel, já pronta para você, deve usar um [kit de início da aplicação](/docs/starter-kits).

 Todas as lógicas de renderização do View da Fortify podem ser customizadas usando os métodos adequados disponíveis através da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método a partir do método `boot` da sua aplicação no arquivo `App\Providers\FortifyServiceProvider`:

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

 O Fortify cuidará da definição do ponto final `/forgot-password`, que retorna essa exibição. Seu modelo de `forgot-password` deve incluir um formulário que faça uma solicitação POST para o ponto final `/forgot-password`.

 O ponto final `/forgot-password` espera um campo de string `email`. O nome deste campo/coluna do banco de dados deve corresponder ao valor da configuração `email` no arquivo de configuração `fortify` do seu aplicativo.

<a name="handling-the-password-reset-link-request-response"></a>
#### Como tratar o pedido de resposta ao link de redefinição da senha

 Se o pedido de ligação de redefinição da senha tiver sido bem-sucedida, a Fortify redireciona o utilizador para o ponto final "/forgot-password" e envia um email ao utilizador com um link seguro que pode usar para redefinir a sua senha. Se o pedido foi um pedido XHR, é enviado um código de resposta 200 HTTP.

 Após ser redirecionado novamente para o ponto final `/forgot-password` após um pedido bem sucedido, a variável de sessão `status` pode ser usada para exibir o status do pedido de tentativa de ligação redefinida de senha.

 O valor da variável de sessão `$status` irá coincidir com uma das string de tradução definidas na [ficheiro de linguagem] (/docs/localization) da aplicação. Se pretende personalizar este valor e não tiver publicado os ficheiros de linguagem do Laravel, poderá fazê-lo através do comando Artisan `lang:publish`:

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

 Se o pedido não tiver sido bem sucedido, o utilizador será redirecionado para a página do link de redefinição da palavra-passe e poderá consultar os erros de validação na variável compartilhada `$errors` [da plantila Blade](/docs/validation#quick-displaying-the-validation-errors). No caso de um pedido XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a name="resetting-the-password"></a>
### Redefinição da senha

 Para concluir a implementação da funcionalidade de redefinição de senha do nosso aplicativo, precisamos instruir o Fortify sobre como retornar nossa visualização de "redefinir senha".

 Toda a lógica de renderização da visualização do Fortify pode ser personalizada usando os métodos adequados disponíveis por meio da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método no método `boot` da classe `App\Providers\FortifyServiceProvider` do seu aplicativo:

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

 O Fortify cuidará da definição do caminho para exibir essa visualização. Seu modelo de recuperação de senha deve incluir um formulário que faça uma solicitação POST para `/reset-password`.

 O ponto final `/reset-password` espera o campo de string `email`, um campo de senha, um campo de confirmação da senha e um campo oculto chamado `token` que contém o valor de `request()->route('token')`. O nome do campo "e-mail" / coluna de base de dados deve corresponder ao valor da configuração `email` definida no arquivo de configuração `fortify` do aplicativo.

<a name="handling-the-password-reset-response"></a>
#### Gerenciar a resposta de redefinição da senha

 Se o pedido de redefinição da senha for bem-sucedida, Fortify irá redirecionar novamente para a rota `/login` para que o utilizador possa logar com a sua nova palavra-passe. Além disso, será definida uma variável de sessão `status` que permite mostrar o estado bem-sucedido da redefinição na tela de login:

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

 Se o pedido foi uma solicitação XHR, será retornado um 200 de resposta HTTP.

 Se o pedido não for bem sucedido, o usuário será redirecionado para a tela de reset da senha e os erros de validação estarão disponíveis através da [variável de modelo Blade](https://docs.laravel.com/docs/5.7/validation#quick-displaying-the-validation-errors) `$errors`. Caso seja um pedido XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a name="customizing-password-resets"></a>
### Personalizar redefes de senha

 O processo de redefinição da senha pode ser personalizado modificando a ação `App\Actions\ResetUserPassword`, que foi gerada quando você instalou o Laravel Fortify.

<a name="email-verification"></a>
## Verificação por e-mail

 Após o registro, você poderá desejar que os usuários verifiquem seu endereço de e-mail antes que eles possam continuar acessando sua aplicação. Para começar, verifique se a característica `emailVerification` está habilitada no `features` do arquivo de configuração `fortify`. Em seguida, garanta que a classe `App\Models\User` implemente a interface `Illuminate\Contracts\Auth\MustVerifyEmail`.

 Quando concluídos estes dois passos de configuração, os utilizadores recém-registados recebem um e-mail a solicitar que confirmem o seu e-mail. No entanto, é necessário informar à Fortify como exibir a tela de verificação do e-mail com a informação do utilizador para clicar no link da confirmação no e-mail.

 Todas as lógicas de renderização de views da Fortify podem ser customizadas utilizando os métodos apropriados disponíveis por meio da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método do método `boot` da classe `App\Providers\FortifyServiceProvider` de sua aplicação:

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

 O Fortify definirá o caminho da visualização quando um usuário for redirecionado para o ponto final "/email/verificar" pelo middleware "verificado" integrado do Laravel.

 Seu modelo "verificar e-mail" deve incluir uma mensagem de instrução para que o usuário clique no link de verificação de e-mail enviado para seu endereço eletrônico.

<a name="resending-email-verification-links"></a>
#### Reenviar links de verificação de e-mail

 Se desejar, pode adicionar um botão ao modelo `verify-email` da aplicação que inicie uma solicitação POST para o ponto fim `/email/verification-notification`. Quando este ponto final recebe a solicitação, é enviado por e-mail um novo link de verificação para o utilizador. Este poderá obter um novo link se o anterior tiver sido apagado ou perdido acidentalmente.

 Se o pedido para reenviar o e-mail de link de verificação for bem-sucedido, o Fortify redirecionará o usuário ao endpoint `/email/verify` com uma variável `status`, permitindo que você exiba uma mensagem informativa ao usuário informando a eles que a operação foi bem-sucedida. Se o pedido for um pedido de XHR, um retorno 202 do HTTP será feito:

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        A new email verification link has been emailed to you!
    </div>
@endif
```

<a name="protecting-routes"></a>
### A proteção de rotas

 Para especificar que um caminho ou grupo de caminhos requer que o usuário tenha verificado seu e-mail, você deve anexar o `verified`, um dos middelwares nativos do Laravel, ao caminho. O alias do middlware é registrado automaticamente pelo Laravel e serve como um alias para o middlware `Illuminate\Routing\Middleware\ValidateSignature`:

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## Confirme a senha

 Enquanto estiver criando o seu aplicativo, é possível que em algumas ocasiões tenha ações onde seja necessário que o usuário confirme sua senha antes da ação ser executada. Normalmente, esses caminhos são protegidos pelo middleware `password.confirm` integrado ao Laravel.

 Para começarmos a implementar o recurso de confirmação de senha, precisamos instruir a Fortify sobre como retornar nossa visualização "confirmação de senha". Lembrando que Fortify é uma biblioteca de autenticação sem interface gráfica. Se você preferir uma implementação frontend das funcionalidades de autenticação do Laravel, com a qual já possui um kit iniciador da aplicação disponível.

 Toda a lógica de renderização da visão do Fortify pode ser personalizada usando os métodos adequados disponíveis através da classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar esse método a partir do método `boot` da sua classe `App\Providers\FortifyServiceProvider` da aplicação:

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

 O Fortify definirá o recurso do ponto fim `/user/confirm-password`, que devolve esta visualização. A sua plantilha `confirm-password` deve incluir um formulário que faz uma solicitação POST para o ponto fim `/user/confirm-password`. O ponto final `/user/confirm-password` espera a entrada de um campo `password` (palavra-passe) com a palavra-chave atual do utilizador.

 Se a senha coincide com a atual do usuário, o Fortify redirecionará o usuário para a rota que ele estava tentando acessar. Caso a solicitação tenha sido uma solicitação XHR, será retornado um 201 de resposta HTTP.

 Se o pedido não for bem sucedido, o usuário será redirecionado para a tela de confirmação da senha e os erros de validação estão disponíveis através da variável de modelo Blade compartilhada `$errors`. Ou, no caso de um pedido XHR, os erros de validação serão retornados com uma resposta HTTP 422.
