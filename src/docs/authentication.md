# Autenticação

## Introdução

Muitos aplicativos da Web permitem que os usuários autentiquem-se com o aplicativo e façam o "login". Implementar esse recurso em aplicativos da Web pode ser um procedimento complexo e, potencialmente arriscado. Por essa razão, Laravel procura fornecer ferramentas necessárias para que você possa implementar a autenticação de maneira rápida, segura e fácil.

No seu núcleo, as funções de autenticação do Laravel são compostas por "guard" e "providers". Os "guards" definem como os usuários são autenticados em cada solicitação. Por exemplo, o Laravel utiliza um guard denominado `session`, que mantém o estado utilizando armazenamento de sessões e cookies.

Os provedores definem como os usuários são recuperados de seu armazenamento persistente. O Laravel oferece suporte para a recuperação de usuários com [Eloquent](https://laravel.com/docs/eloquent) e o gerenciador de consultas do banco de dados, mas você tem liberdade para definir provedores adicionais conforme necessário para sua aplicação.

O arquivo para configuração de autenticação do seu aplicativo está localizado em `config/auth.php`. Este arquivo contém várias opções bem documentadas para ajustar o comportamento dos serviços de autenticação do Laravel.

::: warning ATENÇÃO
[Documentação de autorização](/docs/authorization).
:::

### Kits de Iniciação

Quer começar rápido? Instale um [kit inicial de aplicativos Laravel](/docs/starter-kits) em uma nova aplicação do Laravel. Depois que sua base de dados for migrada, navegue pelo seu browser até o endereço `/register` ou qualquer outro URL atribuído à sua aplicação. Os kits iniciais cuidarão da criação do sistema de autenticação!

**Se você optar por não usar um kit de iniciação em seu aplicativo final do Laravel, instalar o kit de inicialização [Laravel Breeze](/docs/starter-kits#laravel-breeze) pode ser uma excelente oportunidade para aprender a implementar todas as funcionalidades de autenticação do Laravel em um projeto real.** Como o Laravel Breeze cria controladores, rotas e exibições de autenticação para você, é possível examinar o código dentro desses arquivos para aprender como as características de autenticação do Laravel podem ser implementadas.

### Considerações da base de dados

De maneira padrão, o Laravel inclui um modelo `App\Models\User` [Model Eloquent](/docs/eloquent) em seu diretório `app/Models`. Esse modelo pode ser utilizado com o driver de autenticação padrão do Eloquent. Se a sua aplicação não estiver utilizando o Eloquent, é possível usar o provedor de autenticação `database`, que utiliza o gerador de consultas do Laravel.

Ao criar o esquema de banco de dados do modelo `App\Models\User`, certifique-se que a coluna `password` tem, no mínimo, 60 caracteres. É claro que a migração da tabela `users`, incluída em novos aplicativos Laravel já cria uma coluna que excede este comprimento.

Além disso, você deve verificar se sua tabela `users` (ou equivalente) contém uma coluna `remember_token` de 100 caracteres, que pode ser nula. Essa coluna será usada para armazenar um token para os usuários que selecionarem a opção "lembrar-me" quando efetuarem o login em sua aplicação. Novamente, a migração padrão da tabela `users`, incluída nas novas aplicações do Laravel, já contém essa coluna.

### Visão Geral do Ecossistema

O Laravel oferece vários pacotes relacionados com autenticação. Antes de continuar, revisaremos o ecossistema geral de autenticação no Laravel e discutiremos a finalidade pretendida de cada pacote.

Primeiro, considere como a autenticação funciona. Quando se utiliza um navegador da Web, o utilizador fornece o nome de utilizador e palavra-passe através do formulário de login. Se estas credenciais estiverem corretas, a aplicação armazena informações sobre o utilizador autenticado na sessão do utilizador. Um cookie emitido ao navegador contém o identificador da sessão, para que os pedidos subsequentes à aplicação possam associar o utilizador à sessão correta. Depois de receber o cookie, a aplicação recupera os dados da sessão com base no identificador da sessão e regista que as informações de autenticação foram armazenadas e considera o utilizador como "autenticado".

Quando um serviço remoto necessita se autenticar para aceder a uma API, os cookies não são normalmente utilizados como autenticação porque não há nenhum browser da Web. Em vez disso, o serviço remoto envia um token API para a API em cada requisição. A aplicação pode validar o token de entrada contra uma tabela de tokens de API válidos e "autenticar" o pedido como sendo realizado pelo utilizador associado ao referido token.

#### Serviços de Autenticação de Navegador Incorporados no Laravel

O Laravel inclui serviços de autenticação e sessão embutidos que são acessados tipicamente através dos facades `Auth` e `Session`. Estes recursos fornecem autenticação baseada em cookies para pedidos iniciados a partir de navegadores da Web. Estes fornecem métodos que permitem verificar os dados de credenciais do usuário e autenticá-lo. Além disso, estes serviços armazenam automaticamente os dados de autenticação adequados na sessão do usuário e emitem o cookie da sessão do usuário. Uma discussão sobre como usar estes serviços está incluída nesta documentação.

**Kits de iniciação de aplicativos**

Como discutido nesta documentação, você pode interagir com esses serviços de autenticação manualmente para construir a própria camada de autenticação do seu aplicativo. No entanto, para ajudá-lo a começar mais rapidamente, lançamos [pacotes livres](/docs/starter-kits) que fornecem um robusto e moderna moldura da camada inteira de autenticação. Estes pacotes são [Laravel Breeze](/docs/starter-kits#laravel-breeze), [Laravel Jetstream](/docs/starter-kits#laravel-jetstream) e [Laravel Fortify](/docs/fortify).

O _Laravel Breeze_ é uma implementação simples e mínima de todas as funções de autenticação do Laravel, incluindo login, registro, redefinição da senha, confirmação por e-mail e confirmação de senha. A camada de visualização do _Laravel Breeze_ é composta por [modelos Blade](/docs/blade) simples e estilizados com o [Tailwind CSS](https://tailwindcss.com). Para começar, consulte a documentação em _kit de início da aplicação do Laravel_ (/docs/starter-kits).

_Laravel Fortify_ é um servidor de autenticação desprovido de cabeçalho para Laravel que implementa muitas das funcionalidades encontradas nesta documentação, incluindo autenticação com base em cookie, bem como outras funções, tais como autenticação por dois fatores e verificação por correio eletrónico. Fortify fornece o servidor de autenticação para Laravel Jetstream ou pode ser utilizado de forma independente em combinação com o [Laravel Sanctum](/docs/sanctum) para fornecer autenticação a uma aplicação web que precisa de se autenticar no Laravel.

O _[Jetstream Laravel](https://jetstream.laravel.com)_ é um kit iniciante robusto para aplicações que consome e expõe os serviços de autenticação do Laravel Fortify com uma interface gráfica moderna e bonita, alimentada pelo [Tailwind CSS](https://tailwindcss.com), o [Livewire](https://livewire.laravel.com) e/ou o [Inertia](https://inertiajs.com). O Jetstream Laravel inclui suporte opcional para autenticação por dois fatores, suporte a equipes, gestão de sessões em navegadores, gestão de perfis e integração interna com o [Laravel Sanctum](/docs/sanctum) para oferecer a autenticação através do token API. As ofertas da Laravel para autenticação API são discutidas abaixo.

#### Serviços de autenticação da API do Laravel

O Laravel fornece dois pacotes opcionais para ajudá-lo a gerenciar tokens de API e autenticar solicitações feitas com tokens de API: [Passport](/docs/passport) e [Sanctum](/docs/sanctum). Tenha atenção que essas bibliotecas e os serviços internos do Laravel para autenticação baseada em cookies não são mutuamente exclusivas. Essas bibliotecas se concentram principalmente na autenticação com tokens de API, ao passo que os serviços internos de autenticação do Laravel se concentram em autenticação por meio de cookies nos navegadores. Muitas aplicações usarão ambos: a autenticação baseada em cookies e um dos pacotes de autenticação da API do Laravel.

**Passport**

O Passport é um provedor de autenticação OAuth2 que oferece uma variedade de "tipos de concessão" (grant types) OAuth2, permitindo a emissão de vários tipos de tokens. Em geral, esse pacote é robusto e complexo para autenticação de API. No entanto, a maioria das aplicações não requer as características complexas oferecidas pelo especificação OAuth2, o que pode confundir tanto os usuários quanto os desenvolvedores. Além disso, os desenvolvedores têm sido historicamente confundidos sobre como autenticar aplicativos SPA ou aplicativos móveis usando provedores de autenticação OAuth2 como Passport.

**Sanctum**

Em resposta à complexidade do OAuth2 e à confusão dos desenvolvedores, pretendemos criar um pacote de autenticação mais simples e simplificado que possa lidar tanto com solicitações Web de primeira parte de um navegador web como solicitações API via tokens. Este objetivo foi atingido com a versão [Laravel Sanctum](/docs/sanctum), que deve ser considerada o pacote de autenticação preferencial e recomendado para aplicações que disponibilizam uma UI Web de primeira parte, além de terem solicitações API ou são alimentadas por um aplicativo (SPA) com página única que existe separadamente do aplicativo Laravel de fundo ou aplicações que oferecem um cliente móvel.

O Laravel Sanctum é um pacote híbrido de autenticação da Web/API que pode gerir todo o processo de autenticação do seu aplicativo. Isso é possível porque, quando as aplicações baseadas no Sanctum recebem uma solicitação, o Sanctum primeiro determinará se a solicitação inclui um cookie de sessão que faça referência a uma sessão autenticada. O Sanctum consegue isso chamando os serviços de autenticação internos do Laravel que falamos mais cedo. Se a solicitação não estiver sendo autenticada por meio de um cookie de sessão, o Sanctum inspecionará a solicitação para se certificar de que há um token de API. Se houver um token de API presente, o Sanctum autentica a solicitação usando esse token. Para saber mais sobre este processo, consulte a documentação ["como funciona"](/docs/sanctum).

O Laravel Sanctum é o pacote de API que escolhemos incluir no [Kit de inicialização do Jetstream Laravel](https://jetstream.laravel.com) porque acreditamos que é a melhor opção para as principais necessidades de autenticação das aplicações Web.

#### Resumo e escolha do seu conjunto

Em suma, se o seu aplicativo for acessado por meio de um navegador e estiver desenvolvendo uma aplicação monolítica em Laravel, os serviços de autenticação incorporados do Laravel serão usados pelo seu aplicativo.

Em seguida, se o seu aplicativo oferecer uma API que será consumida por terceiros, escolha entre [Passport](/docs/passport) ou [Sanctum](/docs/sanctum) para fornecer autenticação de tokens de API para o seu aplicativo. Em geral, recomendamos o Sanctum quando possível, uma vez que é uma solução completa simples para autenticação de API, SPA e mobile, incluindo suporte para "escopos" ou "habilidades".

Se você estiver criando um aplicativo de uma página que será alimentado por um backend do Laravel, deve usar o [Laravel Sanctum](/docs/sanctum). Ao usar o Sanctum, será necessário implementar manualmente as próprias rotas de autenticação do backend ([autentificação de usuários](https://laravel.com/docs/sanctum#authenticating-users)) ou utilizar [Laravel Fortify](https://laravel.com/docs/fortify) como um serviço de autenticação sem cabeçalho que fornece rotas e controladores para recursos, tais como registro, redefinição de senha, verificação de email e outros.

É possível escolher o tipo de autenticação passo a passo quando o aplicativo exige todas as funcionalidades fornecidas pela especificação OAuth2.

Além disso, se você deseja começar o mais rápido possível, nós recomendamos [Laravel Breeze](/docs/starter-kits#laravel-breeze) como uma forma rápida de iniciar um novo aplicativo Laravel que já utiliza a pilha de autenticação preferencial do Laravel, com os serviços internos de autenticação e o Laravel Sanctum.

## Inicialização rápida da autenticação

::: info AVISO
Esta parte da documentação discute a autenticação de usuários por meio dos [kits iniciais de aplicativos Laravel](/docs/starter-kits), que incluem estrutura de UI para ajudá-lo a começar rapidamente. Se você gostaria de integrar diretamente com os sistemas de autenticação do Laravel, verifique a documentação em [autenticando usuários manualmente](#autenticacao-manual-de-usuarios).
:::

### Instale um kit inicial

Primeiro, você deve [instalar um kit de inicialização do Laravel](/docs/starter-kits). Nossos atuais kits de inicialização, o Laravel Breeze e o Laravel Jetstream, oferecem pontos de partida com designs bonitos para incorporação da autenticação às suas novas aplicações do Laravel.

O Laravel Breeze é uma implementação simples e mínima de todos os recursos de autenticação do Laravel, incluindo login, registro, redefinição da senha, verificação por email e confirmação de senha. A camada de visualização do Laravel Breeze é composta por modelos simples [Templates Blade](/docs/blade) formatados com o [Tailwind CSS](https://tailwindcss.com). Além disso, o Breeze oferece opções de scaffolding baseadas no Livewire ou Inertia, com a opção de usar Vue ou React para o scaffolding baseado na Inertia.

O [Laravel Jetstream](https://jetstream.laravel.com) é um kit de inicialização de aplicação mais robusto que inclui suporte para a construção da sua aplicação com [Livewire](https://livewire.laravel.com) ou [Inertia e Vue](https://inertiajs.com). Além disso, o Jetstream oferece um suporte opcional para autenticação em duas etapas, equipe, gestão de perfil, gestão de sessões de navegador, suporte a API através do [Laravel Sanctum](/docs/sanctum), exclusão de contas e muito mais.

### Recuperando o utilizador autenticado

Depois de instalar um kit inicial de autenticação e permitir que os usuários se registrem e façam a sua autenticação com a aplicação, será necessário interagir com o utilizador atualmente autenticado. Enquanto processa uma requisição recebida, poderá aceder ao utilizador autenticado através do método `user` da interface facade `Auth`:

```php
use Illuminate\Support\Facades\Auth;

// Recuperar o usuário atualmente autenticado...
$user = Auth::user();

// Recuperar o ID do usuário atualmente autenticado...
$id = Auth::id();
```

Como alternativa, quando um usuário estiver autenticado, você poderá acessar o usuário autenticado por meio de uma instância do tipo `Illuminate\Http\Request`. Lembre-se que as classes com tipagem são injetadas automaticamente nos métodos do seu controlador. Ao indicar o objeto `Illuminate\Http\Request`, você poderá obter acesso conveniente ao usuário autenticado em qualquer método do controlador da sua aplicação por meio do método `user` na requisição:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * Atualize as informações de voo de um voo existente.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        // ...

        return redirect('/flights');
    }
}
```

#### Determinar se o usuário atual está autenticado

Para determinar se o usuário que fez a solicitação HTTP é autenticado, você pode usar o método `check` da facade `Auth`. Este método retornará `true` caso o usuário esteja autenticado:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // O usuário está logado...
}
```

::: warning ATENÇÃO
Mesmo que seja possível determinar se um usuário está autenticado usando o método `check`, você normalmente usará um middleware para verificar se o usuário está autenticado antes de permitir o acesso do usuário a determinadas rotas/controladores. Para saber mais sobre isso, confira a documentação sobre como [proteger rotas](/docs/authentication#proteger-as-rotas).
:::

### Proteger as Rotas

[Middleware de rotas](/docs/middleware) pode ser usado para permitir que somente usuários autenticados tenham acesso a uma determinada rota. O Laravel é fornecido com o `auth` middleware, que é um [alias de middleware](/docs/middleware#middleware-alias) para a classe `Illuminate\Auth\Middleware\Authenticate`. Uma vez que este middleware já está internamente mapeado pelo Laravel, tudo que você precisa fazer é anexar o middleware à uma definição de rota:

```php
Route::get('/flights', function () {
    // Somente usuários autenticados podem acessar esta rota...
})->middleware('auth');
```

#### Redirecionar usuários não autorizados

Quando o middleware `auth` detecta um usuário não autenticado, ele redirecionará o usuário para a rota com nome ["login"](/docs/routing#named-routes). É possível alterar este comportamento usando a método `redirectGuestsTo` do arquivo de inicialização da aplicação `bootstrap/app.php`:

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware) {
    $middleware->redirectGuestsTo('/login');

    // Usando uma closure...
    $middleware->redirectGuestsTo(fn (Request $request) => route('login'));
})
```

#### Especificando um guarda

Ao anexar o middleware `auth` a uma rota, você também pode especificar qual "guard" (proteção) deve ser usada para autenticar o usuário. A guarda especificada deve corresponder a uma das chaves na matriz `guards` de seu arquivo de configuração do `auth.php`:

```php
Route::get('/flights', function () {
    // Somente usuários autenticados podem acessar esta rota...
})->middleware('auth:admin');
```

### Limitação de login

Se você estiver usando os kits de inicialização Laravel Breeze ou Laravel Jetstream, a limitação de velocidade será automaticamente aplicada às tentativas de login. Por padrão, o usuário não poderá fazer login por um minuto se ele não conseguir fornecer as credenciais corretas após várias tentativas. O limite é exclusivo do nome de usuário/e-mail e da sua IP.

::: info NOTA
Se você quiser limitar a taxa de outras rotas em seu aplicativo, consulte a [documentação sobre limitação de taxa](/docs/routing#rate-limiting).
:::

## Autenticação manual de usuários

Você não é obrigado a usar o esqueleto de autenticação incluído nos [kits iniciais da aplicação](/docs/starter-kits). Se optar por não utilizá-lo, será necessário gerenciar a autenticação do usuário diretamente com as classes de autenticação do Laravel. Não se preocupe, é muito fácil!

Acessaremos os serviços de autenticação do Laravel através da `Auth` [facade](/docs/facades), então precisamos garantir que importemos a facade na parte superior da classe. Depois, vamos conferir o método `attempt`. O método `attempt` é normalmente usado para gerenciar tentativas de autenticação do formulário de "login" (log-in) do seu aplicativo. Se a autenticação for bem sucedida, você deve regenerar a [session](/docs/session) do usuário para evitar a fixação da sessão ([session fixation](https://en.wikipedia.org/wiki/Session_fixation)):

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Lidar com uma tentativa de autenticação.
     */
    public function authenticate(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            return redirect()->intended('dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }
}
```

O método `attempt` aceita uma matriz de pares chave/valor como primeiro argumento. Os valores da matriz serão usados para encontrar o usuário na sua tabela de banco de dados. Portanto, no exemplo acima, o usuário será recuperado pelo valor da coluna `email`. Se o usuário for encontrado, a senha armazenada em hash na base de dados será comparada com o valor da senha passada ao método via a matriz. Você não deve fazer o hash do valor da senha de solicitação pois o framework automaticamente fará o hash antes de comparar com a senha "hasheada" na base de dados. Uma sessão autenticada será iniciada para o usuário se os dois hashes de senhas forem iguais.

Lembre-se de que os serviços de autenticação do Laravel irão recuperar os usuários do seu banco de dados com base na configuração "provider" do seu guard de autenticação. No arquivo de configuração padrão `config/auth.php`, o provedor de usuário Eloquent é especificado e instruído a usar o modelo `App\Models\User` ao recuperar os usuários. Você pode alterar esses valores em seu arquivo de configuração com base nas necessidades do seu aplicativo.

O método `attempt` retornará `true` caso a autenticação seja bem-sucedida. Caso contrário, retornará `false`.

O método `intended`, fornecido pelo redirecionador do Laravel, redirecionará o usuário para a URL que ele tentava acessar antes de ser interceptado pelos middlewares de autenticação. Um URI de recuperação pode ser dado para este método no caso da destinatária pretendida não estar disponível.

#### Especificação de condições adicionais

Se você quiser, poderá também adicionar condições de consulta extras à consulta de autenticação, além do e-mail e da senha do usuário. Para fazer isso, basta adicionar as condições de consulta ao array passado para o método `attempt`. Por exemplo, podemos verificar se o usuário está marcado como "ativo":

```php
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // A autenticação foi bem-sucedida...
}
```

Para condições de consulta mais complexas, é possível fornecer um closure na sua matriz de credenciais. Este closure será invocada com a instância da consulta, permitindo que você personalize a consulta com base nas necessidades do aplicativo:

```php
use Illuminate\Database\Eloquent\Builder;

if (Auth::attempt([
    'email' => $email, 
    'password' => $password, 
    fn (Builder $query) => $query->has('activeSubscription'),
])) {
    // A autenticação foi bem-sucedida...
}
```

::: warning ATENÇÃO
Nestes exemplos, o campo "e-mail" não é uma opção obrigatória e serve apenas como exemplo. Deve usar o nome da coluna que corresponde ao campo "nome de utilizador" na sua tabela de base de dados.
:::

O método `attemptWhen`, que recebe um closure como o seu segundo argumento, permite realizar uma inspeção mais abrangente do potencial utilizador antes de se proceder à autenticação. O closure recebe o potencial utilizador e deve retornar `true` ou `false` para indicar se o mesmo pode ser autorizado:

```php
if (Auth::attemptWhen([
    'email' => $email,
    'password' => $password,
], function (User $user) {
    return $user->isNotBanned();
})) {
    // A autenticação foi bem-sucedida...
}
```

#### Acessando instâncias de guarda específicas

Por meio do método `guard` da facade `Auth`, você pode especificar qual instância de guard gostaria de utilizar ao autenticar o usuário. Isso permite que você gerencie a autenticação para partes distintas de sua aplicação, usando modelos ou tabelas de usuários inteiramente separados.

O nome da guarda passado à função `guard` deverá corresponder a uma das guardas configuradas no arquivo de configuração `auth.php`:

```php
if (Auth::guard('admin')->attempt($credentials)) {
    // ...
}
```

### Lembrando os usuários

Muitas aplicações Web disponibilizam um check-box "Lembrar de mim" no formulário de login. Se pretender disponibilizar a funcionalidade "Lembrar-me de mim" na aplicação, pode passar um valor boolean como segundo argumento ao método `attempt`.

Quando este valor é `true`, o Laravel manterá o usuário autenticado indefinidamente ou até que ele se logue manualmente. A tabela `users` deve incluir a coluna de string `remember_token`, que será usada para armazenar o token de "lembre-se de mim". A migração de tabela `users` inclusa nos novos aplicativos do Laravel já inclui essa coluna:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // O usuário está sendo lembrado...
}
```

Se o seu aplicativo oferecer funcionalidade de "lembrar de mim", poderá utilizar a metodologia `viaRemember` para determinar se o utilizador atualmente autenticado foi autenticado usando um cookie de "lembrar-me":

```php
use Illuminate\Support\Facades\Auth;

if (Auth::viaRemember()) {
    // ...
}
```

### Outros métodos de autenticação

#### Autentique uma instância de usuário

Se você precisar definir uma instância de usuário existente como o usuário atualmente autenticado, pode passar a instância de usuário para o método `login` da facade `Auth`. A instância de usuário fornecida deve ser uma implementação do contrato `Illuminate\Contracts\Auth\Authenticatable`. O modelo `App\Models\User`, incluído com Laravel, já implementa essa interface. Esse método de autenticação é útil quando você já possui uma instância de usuário válida, como após um usuário se registrar em seu aplicativo:

```php
use Illuminate\Support\Facades\Auth;

Auth::login($user);
```

É possível passar um valor verdadeiro como o segundo argumento para a função `login`. Este valor indica se pretende ou não ativar a funcionalidade "esquecer-me". Se esta opção estiver ativa, a sessão permanece autenticada indefinidamente ou até que o utilizador saia manualmente da aplicação:

```php
Auth::login($user, $remember = true);
```

Se necessário, pode especificar um autenticação guard antes de chamar o método `login`:

```php
Auth::guard('admin')->login($user);
```

#### Autentique um usuário por identificação

Para autenticar um usuário utilizando o identificador primário do seu registro de base de dados, você pode utilizar a metodologia `loginUsingId`. Esta metodologia aceita o identificador primário do usuário que pretende ser autenticado:

```php
Auth::loginUsingId(1);
```

É possível passar um valor boolean no segundo argumento do método `loginUsingId`. Esse valor indica se o usuário deseja a funcionalidade "Lembrar-me" para a sessão autenticada. Lembre-se de que, ao ativá-la, a sessão será autenticada indefinidamente ou até que o próprio usuário saia da aplicação:

```php
Auth::loginUsingId(1, $remember = true);
```

#### Autenticar um Usuário de Um Único Vezo

Pode utilizar o método `once`, para autenticar um utilizador no aplicativo numa única solicitação sem ter que gerir nenhuma sessão ou cookies durante a chamada a este método.

```php
if (Auth::once($credentials)) {
  // ...
}
```

## Autenticação básica do HTTP

A autenticação básica HTTP (https://pt.wikipedia.org/wiki/Basic_access_authentication) fornece uma maneira rápida de autenticar usuários da sua aplicação sem configurar uma página "login" específica. Para começar, adicione o `auth.basic` [middleware](/docs/middleware) a uma rota. O middleware `auth.basic` é incluído no framework Laravel, então você não precisa defini-lo:

```php
Route::get('/profile', function () {
  // Somente usuários autenticados podem acessar esta rota...
})->middleware('auth.basic');
```

Depois que o middleware tiver sido ligado à rota, você será automaticamente solicitado a fornecer credenciais ao acessar a rota no seu navegador. Por padrão, o middleware `auth.basic` pressupõe que a coluna `email` na sua tabela de dados do banco de dados `users` é o "username" do usuário.

#### Uma nota sobre o FastCGI

Se você estiver usando o PHP FastCGI e o Apache para atender seu aplicativo Laravel, a autenticação básica HTTP pode não funcionar corretamente. Para sanar esses problemas, as linhas a seguir podem ser adicionadas ao arquivo de configurações do seu aplicativo `.htaccess`:

```apache
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

### Autenticação básica HTTP sem estado

Também é possível utilizar autenticação básica HTTP sem definir um cookie de identificador do usuário na sessão. Isto é útil principalmente se optar por utilizar a autenticação HTTP para autenticar solicitações à API da aplicação. Para isso, defina um [middleware](/docs/middleware) que chame o método `onceBasic`. Se o método `onceBasic` não retornar nenhuma resposta, a solicitação pode ser encaminhada para a aplicação:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateOnceWithBasicAuth
{
    /**
     * Lidar com uma solicitação recebida.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return Auth::onceBasic() ?: $next($request);
    }
}
```

 Em seguida, anexe o middleware a uma rota:

```php
Route::get('/api/user', function () {
  // Somente usuários autenticados podem acessar esta rota...
})->middleware(AuthenticateOnceWithBasicAuth::class);
```

## Sair

Para desconectar manualmente os usuários de sua aplicação, você poderá usar o método `logout`, fornecido pela facade `Auth`. Isso irá remover as informações de autenticação da sessão do usuário para que os pedidos subsequentes não sejam autenticados.

Além de chamar o método `logout`, é recomendável invalidar a sessão do usuário e gerar novamente seu [Token CSRF](/docs/csrf). Depois que o usuário estiver logado, você normalmente redireciona-o para a raiz de sua aplicação:

```php
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Desconecte o usuário do aplicativo.
 */
public function logout(Request $request): RedirectResponse
{
    Auth::logout();

    $request->session()->invalidate();

    $request->session()->regenerateToken();

    return redirect('/');
}
```

### Invalidação de sessões em outros dispositivos

O Laravel também disponibiliza um mecanismo para anular e "terminar" as sessões de utilizador, que estejam ativas noutros dispositivos sem anular a sessão no seu próprio dispositivo. É normal utilizar esta funcionalidade quando o utilizador está a alterar ou a atualizar a sua senha e pretende anular as sessões em outros dispositivos, mantendo o dispositivo atual autenticado.

Antes de começar, certifique-se que o middleware `Illuminate\Session\Middleware\AuthenticateSession` está incluído nos roteadores que devem receber a autenticação da sessão. Normalmente, deve colocá-lo numa definição do grupo de rotas para que possa ser aplicado na maioria dos rotas da sua aplicação. Como padrão, o middleware `AuthenticateSession` pode estar ligado a um roteador utilizando o [alias de middleware] (/docs/middleware#middleware-alias):

```php
Route::middleware(['auth', 'auth.session'])->group(function () {
    Route::get('/', function () {
        // ...
    });
});
```

Em seguida, você pode usar o método `logoutOtherDevices` fornecido pela interface `Auth`. Este método requer que o usuário confirme sua senha atual, e sua aplicação deve aceitá-la por meio de um formulário:

```php
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($currentPassword);
```

Quando o método `logoutOtherDevices` é acionado, as outras sessões do usuário serão totalmente invalidadas, ou seja, elas serão "desconectadas" de todas as guards para as quais a autenticação foi efetuada anteriormente.

## Confirmação de Senha

Ao construir seu aplicativo, você pode ocasionalmente precisar de ações que requerem confirmação do usuário antes da ação ser realizada ou antes que o usuário seja redirecionado para uma área sensível do aplicativo. O Laravel inclui middleware integrados para tornar esse processo simples. A implementação dessa funcionalidade exigirá que você defina duas rotas: um roteador para exibição de uma visualização pedindo confirmação da senha e outro roteador para confirmar se a senha é válida e redirecionar o usuário ao seu destino.

::: info AVISO
A documentação a seguir discute como integrar diretamente os recursos de confirmação de senha do Laravel; entretanto, se você quiser começar mais rapidamente, os [kits iniciais de aplicativos Laravel](/docs/starter-kits) incluem suporte para esse recurso!
:::

### Configuração

Depois de confirmar sua senha, o usuário não será solicitado a confirmar sua senha novamente por três horas. No entanto, você pode configurar o período de tempo antes que o usuário seja solicitado novamente a fornecer sua senha, alterando o valor de configuração `password_timeout` no arquivo de configuração `config/auth.php` da sua aplicação.

### Roteamento

#### O formulário de confirmação da senha

Primeiro, definiremos uma rota para exibir uma visualização que solicita ao usuário confirmar sua senha:

```php
Route::get('/confirm-password', function () {
    return view('auth.confirm-password');
})->middleware('auth')->name('password.confirm');
```

Como esperado, o formulário retornado por este caminho deve conter um campo com a chave `password`. Além disso, é possível incluir um texto explicando ao usuário que ele está entrando em uma área protegida da aplicação e deve confirmar sua senha.

#### Confirmar a senha

 Em seguida, definiremos uma rota que tratará o pedido de formulário a partir da exibição “confirmar senha”. Esta rota será responsável por validar a senha e redirecionar o usuário para seu destino pretendido:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;

Route::post('/confirm-password', function (Request $request) {
    if (! Hash::check($request->password, $request->user()->password)) {
        return back()->withErrors([
            'password' => ['A senha fornecida não corresponde aos nossos registros.']
        ]);
    }

    $request->session()->passwordConfirmed();

    return redirect()->intended();
})->middleware(['auth', 'throttle:6,1']);
```

Antes de continuar, vamos analisar este caminho com mais detalhes. Primeiro, o campo `password` da requisição é determinado para realmente corresponder à senha do usuário autenticado. Se a senha for válida, precisamos informar a sessão do Laravel de que o usuário confirmou sua senha. O método `passwordConfirmed` definirá um timestamp na sessão do usuário que o Laravel poderá usar para determinar quando o usuário confirmou sua senha pela última vez. Finalmente, podemos redirecionar o usuário para seu destino pretendido.

### Proteger rotas

Você deve garantir que qualquer rota que execute uma ação que requer confirmação de senha recente receba o middleware `password.confirm`. Este middleware é incluído na instalação padrão do Laravel e armazenará automaticamente o destino pretendido do usuário na sessão para que o usuário possa ser redirecionado para esse local após confirmar sua senha. Após armazenar o destino pretendido do usuário na sessão, o middleware redirecionará o usuário para a rota denominada: `password.confirm` [rotas com nomes especificados](/docs/routing#named-routes):

```php
Route::get('/settings', function () {
    // ...
})->middleware(['password.confirm']);

Route::post('/settings', function () {
    // ...
})->middleware(['password.confirm']);
```

## Adicionando Guardas Personalizadas

Você pode definir suas próprias defesas de autenticação utilizando o método `extend` na facade `Auth`. O código que chama o método `extend` deve ser colocado dentro de um [fornecedor de serviços](/docs/providers). Como Laravel já tem um `AppServiceProvider`, podemos colocar o código nesse provedor:

```php
<?php

namespace App\Providers;

use App\Services\Auth\JwtGuard;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // ...

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Auth::extend('jwt', function (Application $app, string $name, array $config) {
            // Retornar uma instância de Illuminate\Contracts\Auth\Guard...

            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

Como pode ser visto no exemplo acima, o callback passado para a método `extend` deve retornar uma implementação do `Illuminate\Contracts\Auth\Guard`. Essa interface contém alguns métodos que você precisará implementar para definir um guard personalizado. Depois de seu guard personalizado estar definido, você poderá referenciá-lo na configuração `guards` do arquivo de configuração `auth.php`:

```php
    'guards' => [
        'api' => [
            'driver' => 'jwt',
            'provider' => 'users',
        ],
    ],
```

### Closure em Guardas de Requisições

A forma mais simples de implementar um sistema personalizado de autenticação baseado em solicitações HTTP é através do método `Auth::viaRequest`. Este método permite definir rapidamente o seu processo de autenticação usando um único closure.

Para começar, chame o método `Auth::viaRequest` dentro do método `boot` do provedor de serviços da aplicação. O método `viaRequest` aceita um nome de motor de autenticação como seu primeiro argumento. Esse nome pode ser qualquer string que descreva sua guarda personalizada. O segundo argumento passado para o método deve ser um closure que recebe a solicitação HTTP entrando e retorna uma instância do usuário ou, se a autenticação falhar, `null`:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Auth::viaRequest('custom-token', function (Request $request) {
        return User::where('token', (string) $request->token)->first();
    });
}
```

Depois de definido o driver de autenticação personalizado, você poderá configurá-lo como um driver no âmbito da configuração `guards` do seu arquivo de configuração `auth.php`:

```php
    'guards' => [
        'api' => [
            'driver' => 'custom-token',
        ],
    ],
```

Por último, pode fazer referência à autenticação quando atribuir o middleware de autenticação a uma rota:

```php
    Route::middleware('auth:api')->group(function () {
        // ...
    });
```

## Adicionando provedores de usuário personalizado

Se você não estiver usando um banco de dados relacional tradicional para armazenar seus usuários, você precisará estender o Laravel com seu próprio provedor de autenticação de usuários. Usaremos o método `provider` na fachada `Auth` para definir um provedor de usuário personalizado. O resolvedor do provedor do usuário deve retornar uma implementação de `Illuminate\Contracts\Auth\UserProvider`:

```php
<?php

namespace App\Providers;

use App\Extensions\MongoUserProvider;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // ...

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Auth::provider('mongo', function (Application $app, array $config) {
            // Retornar uma instância de Illuminate\Contracts\Auth\UserProvider...

            return new MongoUserProvider($app->make('mongo.connection'));
        });
    }
}
```

Depois de registrar o provedor usando o método `provider`, você pode alternar para o novo provedor de usuário em seu arquivo de configuração `auth.php`. Defina primeiro um `provider` que use o seu novo driver:

```php
'providers' => [
    'users' => [
        'driver' => 'mongo',
    ],
],
```

Finalmente, você pode fazer referência a este provedor na sua configuração de `guards`:

```php
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
    ],
```

### O Contrato de Prestador de Serviços ao Usuário

As implementações do `Illuminate\Contracts\Auth\UserProvider` são responsáveis por buscar uma implementação de `Illuminate\Contracts\Auth\Authenticatable` a partir de um sistema persistente de armazenamento, como MySQL ou MongoDB. Estas duas interfaces permitem que os mecanismos de autenticação do Laravel continuem funcionando independentemente de qual for o tipo de classe utilizada para representar o usuário autenticado:

Vamos dar uma olhada no contrato `Illuminate\Contracts\Auth\UserProvider`:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface UserProvider
{
    public function retrieveById($identifier);
    public function retrieveByToken($identifier, $token);
    public function updateRememberToken(Authenticatable $user, $token);
    public function retrieveByCredentials(array $credentials);
    public function validateCredentials(Authenticatable $user, array $credentials);
    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false);
}
```

A função `retrieveById` normalmente recebe uma chave que representa o usuário, como um identificador de incremento automático de banco de dados do MySQL. O recurso da implementação `Authenticatable` correspondente ao ID deve ser recuperado e retornado pela função.

A função `retrieveByToken` recupera um usuário por meio do seu `$identifier` exclusivo e `$token`, normalmente armazenados em uma coluna de banco de dados como `remember_token`. Assim como o método anterior, a implementação de `Authenticatable` com um valor de token correspondente deve ser retornada por este método.

O método `updateRememberToken` atualiza o `remember_token` da instância de `$user` com o novo `$token`. Um token novo é atribuído aos usuários num sucesso tentativa de autenticação ou no momento em que o utilizador se registra.

O método `retrieveByCredentials` recebe o array de credenciais passadas ao método `Auth::attempt` durante a tentativa de autenticação em uma aplicação. O método deve, então, "consultar" no armazenamento persistente subjacente os usuários que possuam essas credenciais. Normalmente, esse método executará uma consulta com uma condição `where` para procurar um registro de usuário com um "username" igual ao valor do `$credentials['username']`. O método deve retornar uma implementação do `Authenticatable`. **Esse método não deve tentar fazer qualquer validação ou autenticação da senha.**

O método `validateCredentials` deve comparar o `$user` fornecido com as credenciais para autenticá-lo. Por exemplo, esse método normalmente usa a função `Hash::check` para comparar o valor de `$user->getAuthPassword()` com o valor de `$credentials['password']`. Esse método deve retornar `true` ou `false`, indicando se a senha é válida.

O método `rehashPasswordIfRequired` deve reprocessar a senha do usuário indicado se necessário e se o suporte for disponibilizado. Por exemplo, esse método normalmente usa o método `Hash::needsRehash` para determinar se o valor `$credentials['password']` precisa ser reprocessado. Se a senha precisar ser reprocessada, o método deve usar o método `Hash::make` para reprocessar a senha e atualizar o registro do usuário no armazenamento persistente seguinte.

### O Contrato com Autenticação

Agora que explorámos cada um dos métodos do `UserProvider`, vamos analisar o contrato `Authenticatable`. Lembre-se de que os provedores de usuário devem retornar implementações desta interface nos métodos `retrieveById`, `retrieveByToken` e `retrieveByCredentials`:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface Authenticatable
{
    public function getAuthIdentifierName();
    public function getAuthIdentifier();
    public function getAuthPasswordName();
    public function getAuthPassword();
    public function getRememberToken();
    public function setRememberToken($value);
    public function getRememberTokenName();
}
```

Essa interface é simples. O método `getAuthIdentifierName` deve retornar o nome da coluna "chave primária" do usuário e o método `getAuthIdentifier` deve retornar a "chave primária" do usuário. Quando se utiliza um servidor de banco de dados MySQL, provavelmente seria o identificador autogerado atribuído ao registro do usuário. O método `getAuthPasswordName` deve retornar o nome da coluna de senha do usuário. O método `getAuthPassword` deve retornar a senha criptografada do usuário.

Essa interface permite que o sistema de autenticação trabalhe com qualquer classe "user", independentemente da abstração de armazenamento ou ORM que você esteja usando. Por padrão, o Laravel inclui uma classe `App\Models\User` no diretório `app/Models`, a qual implementa essa interface.

## Reencriptação automática de senhas

O algoritmo de geração automática de senhas do Laravel é o bcrypt. O "factor de trabalho" para as hashtags bcrypt pode ser ajustado através do arquivo de configuração da sua aplicação `config/hashing.php` ou da variável de ambiente `BCRYPT_ROUNDS`.

Normalmente, o fator de trabalho do bcrypt deve ser aumentado ao longo do tempo à medida que o poder de processamento da CPU/GPU aumenta. Se você aumentar o fator de trabalho bcrypt para sua aplicação, o Laravel irá refazer as senhas dos usuários de maneira elegante e automática à medida que os usuários se autenticam com sua aplicação através dos kits iniciais do Laravel ou quando você [autentica manualmente os usuários](#authenticating-users) através do método `attempt`.

Normalmente, o rehashing automático de senha não deve atrapalhar seu aplicativo; entretanto, você pode desativar esse comportamento publicando o arquivo de configuração `hashing`:

```shell
php artisan config:publish hashing
```

Depois de publicado o arquivo de configuração, você pode definir o valor da configuração `rehash_on_login` para `false`:

```php
'rehash_on_login' => false,
```

## Eventos

O Laravel envia uma variedade de [events](/docs/events) durante o processo de autenticação. Você pode definir [ouvintes](/docs/events) para qualquer um dos seguintes eventos:

| Eventos                                       |
|-----------------------------------------------|
| `Illuminate\Auth\Events\Registered`           |
| `Iluminar\Auth\Events\Attempting`             |
| `Illuminate\Auth\Events\Authenticated`        |
| `Illuminate\Auth\Events\Login`                |
| `Illuminate\Auth\Events\Failed`               |
| `Illuminate\Auth\Events\Validated`            |
| `Illuminate\Auth\Events\Verified`             |
| `Illuminate\Auth\Events\Logout`               |
| `Illuminate\Auth\Events\CurrentDeviceLogout`  |
| `Iluminar\Auth\Events\OtherDeviceLogout`      |
| `Illuminate\Auth\Events\Lockout`              |
| `Illuminate\Auth\Events\PasswordReset`        |
