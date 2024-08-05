# Autorização

## Introdução

Além de fornecer serviços de [autenticação](/docs/authentication), o Laravel também fornece um modo simples de autorizar ações do usuário em relação a um determinado recurso. Por exemplo, mesmo que um usuário esteja autenticado, ele pode não estar autorizado a atualizar ou excluir determinados modelos Eloquent ou registros de banco de dados gerenciados por sua aplicação. As funcionalidades de autorização do Laravel fornecem uma maneira fácil e organizada de gerenciar esses tipos de verificações de autorização.

O Laravel fornece duas maneiras principais de autorizar ações: [_gates_](#gates) e [políticas](#creating-policies). Pense em _gates_ e políticas como rotas e controladores. Os _gates_ fornecem uma abordagem simples baseada em closures para autorização, enquanto as políticas, como os controladores, agrupam a lógica em torno de um modelo ou recurso específico. Nesta documentação, exploraremos primeiro os _gates_ e então examinaremos as políticas.

Você não precisa escolher entre usar apenas _gates_ ou políticas quando estiver construindo um aplicativo. A maioria dos aplicativos provavelmente conterá uma mistura de _gates_ e políticas, e isso está ok! Os _gates_ são mais aplicáveis para ações que não estão relacionadas com nenhum modelo ou recurso, como visualizar um painel de administrador. Em contraste, as políticas devem ser usadas quando você deseja autorizar uma ação para um modelo ou recurso específico.

## _Gates_

### Escrevendo _gates_

::: warning ATENÇÃO
_Gates_ são uma ótima maneira de aprender os fundamentos das funcionalidades de autorização do Laravel; no entanto, ao construir aplicações robustas do Laravel você deve considerar o uso de [políticas](#creating-policies) para organizar suas regras de autorização.
:::

_Gates_ são simplesmente closures que determinam se um usuário é autorizado para executar uma ação específica. Normalmente, os _gates_ são definidos dentro do método `boot` da classe `App\Providers\AppServiceProvider` usando a _facade_ `Gate`. Os _gates_ sempre recebem uma instância de usuário como seu primeiro argumento e podem opcionalmente receber argumentos adicionais, como um modelo Eloquent relevante.

Neste exemplo, vamos definir um _gate_ para determinar se um usuário pode atualizar um determinado modelo `App/Models/Post`. O _gate_ vai realizar isso comparando o ID do usuário com o ID do usuário que criou o post:

```php
    use App\Models\Post;
    use App\Models\User;
    use Illuminate\Support\Facades\Gate;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Gate::define('update-post', function (User $user, Post $post) {
            return $user->id === $post->user_id;
        });
    }
```

Assim como controladores, os _gates_ também podem ser definidos usando uma matriz de retorno de chamada de classe:

```php
    use App\Policies\PostPolicy;
    use Illuminate\Support\Facades\Gate;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Gate::define('update-post', [PostPolicy::class, 'update']);
    }
```


### Ações Autorizadas

Para autorizar uma ação usando _gates_, você deve usar os métodos "_allow_" ou "_deny_" fornecidos pela _facade_ `Gate`. Observe que você não precisa passar o usuário atualmente autenticado para esses métodos. O Laravel cuidará automaticamente de passar o usuário no closure do _gate_. É típico chamar os métodos de autorização do _gate_ dentro dos controladores do seu aplicativo antes de executar uma ação que requer autorização:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\Post;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Gate;

    class PostController extends Controller
    {
        /**
         * Atualize a postagem fornecida.
         */
        public function update(Request $request, Post $post): RedirectResponse
        {
            if (! Gate::allows('update-post', $post)) {
                abort(403);
            }

            // Atualize o post...

            return redirect('/posts');
        }
    }
```

Se você gostaria de determinar se um usuário diferente do usuário atualmente autenticado é autorizado para executar uma ação, você pode usar o método `forUser` da _facade_ `Gate`:

```php
    if (Gate::forUser($user)->allows('update-post', $post)) {
        // O usuário pode atualizar a postagem...
    }

    if (Gate::forUser($user)->denies('update-post', $post)) {
        // O usuário não pode atualizar a postagem...
    }
```

Você pode autorizar várias ações de uma vez usando o método 'any' ou 'none':

```php
    if (Gate::any(['update-post', 'delete-post'], $post)) {
        // O usuário pode atualizar ou excluir a postagem...
    }

    if (Gate::none(['update-post', 'delete-post'], $post)) {
        // O usuário não pode atualizar ou excluir a postagem...
    }
```

#### Autorizar ou Lançar Exceções

Se você gostaria de tentar autorizar uma ação e lançar automaticamente um `Illuminate\Auth\Access\AuthorizationException` se o usuário não for permitido para executar a ação dada, você pode usar o método `authorize` da _facade_ `Gate`. Instâncias de `AuthorizationException` são automaticamente convertidas em uma resposta HTTP 403 por Laravel:

```php
    Gate::authorize('update-post', $post);

    // A ação é autorizada...
```

#### Fornecer contexto adicional

Os métodos do _gate_ para autorizar (`allows`, `denies`, `check`, `any`, `none`, `authorize`, `can`, `cannot`) e a autorização nas [Diretivas do Blade](#via-blade-templates) (`@can`, `@cannot`, `@canany`) podem receber um array como seu segundo argumento. Esses elementos do array são passados como parâmetros para o closure do _gate_, e podem ser usados ​​para contexto adicional ao tomar decisões de autorização:

```php
    use App\Models\Category;
    use App\Models\User;
    use Illuminate\Support\Facades\Gate;

    Gate::define('create-post', function (User $user, Category $category, bool $pinned) {
        if (! $user->canPublishToGroup($category->group)) {
            return false;
        } elseif ($pinned && ! $user->canPinPosts()) {
            return false;
        }

        return true;
    });

    if (Gate::check('create-post', [$category, $pinned])) {
        // O usuário pode criar a postagem...
    }
```

### Respostas do Portal

Até agora, examinamos apenas os _gates_ que retornam valores booleanos simples. No entanto, às vezes você pode querer retornar uma resposta mais detalhada, incluindo uma mensagem de erro. Para isso, você pode retornar um `Illuminate\Auth\Access\Response` do seu _gate_:

```php
    use App\Models\User;
    use Illuminate\Auth\Access\Response;
    use Illuminate\Support\Facades\Gate;

    Gate::define('edit-settings', function (User $user) {
        return $user->isAdmin
                    ? Response::allow()
                    : Response::deny('You must be an administrator.');
    });
```

Mesmo quando você retorna uma resposta de autorização do seu _gate_, o método `Gate::allows` ainda retornará um valor booleano simples; no entanto, você pode usar o método `Gate::inspect` para obter a resposta de autorização completa retornada pelo _gate_.

```php
    $response = Gate::inspect('edit-settings');

    if ($response->allowed()) {
        // A ação é autorizada...
    } else {
        echo $response->message();
    }
```

Ao usar o método `Gate::authorize`, que lança uma exceção de `AuthorizationException` caso a ação não seja autorizada, a mensagem de erro fornecida pela resposta de autorização será propagada para a resposta do HTTP.

```php
    Gate::authorize('edit-settings');

    // A ação é autorizada...
```

#### Personalizando o código de status do http response

Quando uma ação é negada via um Gate, a resposta `403` é retornada; mas às vezes pode ser útil retornar um código de status HTTP alternativo. Você pode personalizar o código de status HTTP retornado para um check de autorização com falha usando o construtor estático 'denyWithStatus' da classe `Illuminate\Auth\Access\Response`:

```php
    use App\Models\User;
    use Illuminate\Auth\Access\Response;
    use Illuminate\Support\Facades\Gate;

    Gate::define('edit-settings', function (User $user) {
        return $user->isAdmin
                    ? Response::allow()
                    : Response::denyWithStatus(404);
    });
```

Como ocultar recursos por meio de uma resposta `404` é um padrão comum para aplicativos da web, o método `denyAsNotFound` é oferecido por conveniência:

```php
    use App\Models\User;
    use Illuminate\Auth\Access\Response;
    use Illuminate\Support\Facades\Gate;

    Gate::define('edit-settings', function (User $user) {
        return $user->isAdmin
                    ? Response::allow()
                    : Response::denyAsNotFound();
    });
```

### Interceptando verificações do _gate_

Às vezes, você pode querer conceder todos os poderes a um usuário específico. Você pode usar o método antes para definir uma função de retorno que é executada antes de todas as outras verificações de autorização:

```php
    use App\Models\User;
    use Illuminate\Support\Facades\Gate;

    Gate::before(function (User $user, string $ability) {
        if ($user->isAdministrator()) {
            return true;
        }
    });
```

Se o `before` de closure retorna um resultado não nulo, esse resultado será considerado como o resultado do teste de autorização.

Você pode usar o método `after` para definir um closure para ser executado após todos os outros verificações de autorização:

```php
    use App\Models\User;

    Gate::after(function (User $user, string $ability, bool|null $result, mixed $arguments) {
        if ($user->isAdministrator()) {
            return true;
        }
    });
```

Semelhante ao método `before`, se o closure no `after` retornar um resultado não nulo esse resultado será considerado como o resultado da verificação de autorização.

### Autorização _inline_

Em alguns casos, você pode estar interessado em verificar se o usuário atualmente autenticado tem permissão para executar uma ação específica sem escrever um "gate" dedicado que corresponda à ação. O Laravel permite realizar esses tipos de verificações de autorização "_inline_" através dos métodos `Gate::allowIf` e `Gate::denyIf`. A autorização "_inline_" não executa nenhum [gancho de autorização "antes" ou "depois"](#intercepting-gate-checks):

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::allowIf(fn (User $user) => $user->isAdministrator());

Gate::denyIf(fn (User $user) => $user->banned());
```

Se a ação não for autorizada ou se nenhum usuário estiver autenticado, o Laravel lançará automaticamente uma exceção de `Illuminate\Auth\Access\AuthorizationException`. Instâncias da `AuthorizationException` são automaticamente convertidas em uma resposta HTTP 403 pelo manipulador de exceções do Laravel.

## Criando Políticas

### Geração de Políticas

Políticas são classes que organizam a lógica de autorização em torno de um modelo ou recurso específico. Por exemplo, se o seu aplicativo é um blog, você pode ter um modelo `App/Models/Post` e uma política correspondente `App/Policies/PostPolicy` para autorizar ações do usuário, tais como criar ou atualizar postagens.

Você pode gerar uma política usando o comando Artisan `make:policy`. A política gerada será colocada no diretório app/Policies. Se este diretório não existir em sua aplicação, Laravel a criará para você:

```shell
php artisan make:policy PostPolicy
```

O comando `make:policy` gerará uma classe de política vazia. Se você gostaria de gerar uma classe com métodos de exemplo relacionados à visualização, criação, atualização e exclusão do recurso, você pode fornecer uma opção `--model` ao executar o comando:

```shell
php artisan make:policy PostPolicy --model=Post
```

### Registro de políticas

#### Descoberta de políticas

Por padrão o Laravel automaticamente descobre políticas desde que o modelo e a política sigam convenções de nomenclatura padrão do Laravel. Específicamente, as políticas devem estar em um diretório no `Policies` ou acima do diretório que contém seus modelos. Assim, por exemplo, os modelos podem ser colocados no diretório `app/Models`, enquanto as políticas podem ser colocadas no diretório `app/Policies`. Neste caso o Laravel vai verificar se existem políticas nos diretórios `app/Models/Policies` e `app/Policies`. Além disso, o nome da política deve corresponder ao nome do modelo e ter um sufixo `Policy`. Então uma classe de modelo `User` corresponde a uma classe de política `UserPolicy`.

Se você gostaria de definir sua própria lógica de descoberta de política, você pode registrar um retorno de chamada personalizado de descoberta de política usando o método `Gate::guessPolicyNamesUsing`. Normalmente, este método deve ser chamado no método `boot` de seu provedor de serviços de aplicativos.

```php
    use Illuminate\Support\Facades\Gate;

    Gate::guessPolicyNamesUsing(function (string $modelClass) {
        // Retorna o nome da classe de política para o modelo fornecido...
    });
```

#### Registro manual de políticas

Usando a _facade_ `Gate`, você pode registrar manualmente suas políticas e modelos correspondentes dentro do método `boot` de seu provedor de serviço de aplicativos `AppServiceProvider`:

```php
    use App\Models\Order;
    use App\Policies\OrderPolicy;
    use Illuminate\Support\Facades\Gate;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Gate::policy(Order::class, OrderPolicy::class);
    }
```

## Políticas de redação

### Métodos de Política

Uma vez que a classe de política foi registrada, você pode adicionar métodos para cada ação que ele autoriza. Por exemplo, vamos definir um método `update` em nossa classe `PostPolicy`, o qual determina se um usuário `App\Models\User` é capaz de atualizar uma determinada instância do post `App\Models\Post`.

O método `update` receberá uma instância de `User` e `Post` como argumentos, e deve retornar `true` ou `false` indicando se o usuário está autorizado a atualizar o dado `Post`. Então, neste exemplo, verificaremos que o `id` do usuário corresponde ao `user_id` no post.

```php
    <?php

    namespace App\Policies;

    use App\Models\Post;
    use App\Models\User;

    class PostPolicy
    {
        /**
         * Determine se a postagem fornecida pode ser atualizada pelo usuário.
         */
        public function update(User $user, Post $post): bool
        {
            return $user->id === $post->user_id;
        }
    }
```

Você pode continuar a definir métodos adicionais na política conforme necessário para as várias ações que ela autoriza. Por exemplo, você pode definir os métodos `view` ou `delete` para autorizar várias ações relacionadas com `Post`, mas lembre-se de que você é livre para dar qualquer nome aos seus métodos da política.

Se você usou a opção `--model` ao gerar sua política via console Artisan, já conterá os métodos para as ações `viewAny`, `view`, `create`, `update`, `delete`, `restore` e `forceDelete`.

::: info NOTA
Todas as políticas são resolvidas via o [container de serviço](/docs/container) do Laravel, permitindo que você indique qualquer dependência necessária no construtor da política para ter a injeção automática.
:::

### Respostas de Políticas

Até agora, examinamos somente os métodos de política que retornam valores booleanos simples. No entanto, às vezes você pode querer retornar uma resposta mais detalhada, incluindo uma mensagem de erro. Para fazer isso, você pode retornar um objeto `Illuminate\Auth\Access\Response` do método da sua política:

```php
    use App\Models\Post;
    use App\Models\User;
    use Illuminate\Auth\Access\Response;

    /**
     * Determine se a postagem fornecida pode ser atualizada pelo usuário.
     */
    public function update(User $user, Post $post): Response
    {
        return $user->id === $post->user_id
                    ? Response::allow()
                    : Response::deny('You do not own this post.');
    }
```

Quando você retorna uma resposta de permissão do seu arquivo de política, o método `Gate::allows` ainda retornará um valor booleano simples, mas você pode usar o método `Gate::inspect` para obter a resposta completa de permissão retornada pelo _gate_.

```php
    use Illuminate\Support\Facades\Gate;

    $response = Gate::inspect('update', $post);

    if ($response->allowed()) {
        // A ação é autorizada...
    } else {
        echo $response->message();
    }
```

Quando usando o método `Gate::authorize`, que lança uma exceção `AuthorizationException` se a ação não estiver autorizada, a mensagem de erro fornecida pela resposta de autorização será propagada para a resposta HTTP.

```php
    Gate::authorize('update', $post);

    // A ação é autorizada...
```

#### Personalizando o Status da Resposta HTTP

Quando uma ação é negada via um método de política, retorna-se uma '403' HTTP response; porém, pode ser útil retornar um código de status HTTP alternativo. Você pode personalizar o código de status HTTP retornado em uma verificação de autorização malsucedida usando o construtor estático `denyWithStatus` na classe `Illuminate\Auth\Access\Response`:

```php
    use App\Models\Post;
    use App\Models\User;
    use Illuminate\Auth\Access\Response;

    /**
     * Determine se a postagem fornecida pode ser atualizada pelo usuário.
     */
    public function update(User $user, Post $post): Response
    {
        return $user->id === $post->user_id
                    ? Response::allow()
                    : Response::denyWithStatus(404);
    }
```

Como ocultar recursos através de uma resposta `404` é um padrão tão comum para aplicações web, o método `denyAsNotFound` é oferecido por conveniência.

```php
    use App\Models\Post;
    use App\Models\User;
    use Illuminate\Auth\Access\Response;

    /**
     * Determine se a postagem fornecida pode ser atualizada pelo usuário.
     */
    public function update(User $user, Post $post): Response
    {
        return $user->id === $post->user_id
                    ? Response::allow()
                    : Response::denyAsNotFound();
    }
```

### Métodos sem Modelos

Algumas políticas de método apenas recebem uma instância do usuário atualmente autenticado. Esta situação é mais comum quando autorizando ações `create`. Por exemplo, se você estiver criando um blog, você pode querer determinar se um usuário está autorizado a criar qualquer postagem em tudo. Em tais situações, o seu método de política deve esperar apenas receber uma instância do usuário:

```php
    /**
     * Determine se o usuário fornecido pode criar postagens.
     */
    public function create(User $user): bool
    {
        return $user->role == 'writer';
    }
```

### Usuários convidados

Por padrão, todos os _gates_ e políticas automaticamente retornam `false` se o pedido HTTP não foi iniciado por um usuário autenticado. No entanto, você pode permitir esses verificações de autorização para passar através dos seus _gates_ e políticas ao declarar uma "opcional" _type-hint_ ou fornecendo um valor padrão `null` para a definição do argumento do usuário:

```php
    <?php

    namespace App\Policies;

    use App\Models\Post;
    use App\Models\User;

    class PostPolicy
    {
        /**
         * Determine se a postagem fornecida pode ser atualizada pelo usuário.
         */
        public function update(?User $user, Post $post): bool
        {
            return $user?->id === $post->user_id;
        }
    }
```

### Filtros de Política

Para alguns usuários, você pode autorizar todas as ações dentro de uma política dada. Para fazer isso, defina um método `before` na política. O método 'antes' será executado antes que qualquer outro método da política, dando-lhe uma oportunidade de autorizar a ação antes que o método de política pretendido seja realmente chamado. Esta característica é mais comumente usada para autorizar os administradores de aplicativos para executar qualquer ação:

```php
    use App\Models\User;

    /**
     * Realizar verificações de pré-autorização.
     */
    public function before(User $user, string $ability): bool|null
    {
        if ($user->isAdministrator()) {
            return true;
        }

        return null;
    }
```

Se você quiser negar todos os verificações de autorização para um determinado tipo de usuário, então você pode retornar `false` do método `before`. Se o `null` é retornado, a verificação de autorização irá cair para o método de política.

::: warning ATENÇÃO
O método `before` de uma classe política não será chamado se a classe não possuir um método com um nome igual ao da habilidade que está sendo verificada.
:::

## Autorizando ações usando políticas

### Através do Modelo de Usuário

O modelo `App\Models\User` que está incluído com sua aplicação Laravel inclui dois métodos úteis para autorização de ações: `can` e `cannot`. Os métodos `can` e `cannot` recebem o nome da ação que você deseja autorizar e o modelo relevante. Por exemplo, vamos determinar se um usuário é autorizado a atualizar um determinado modelo `App\Models\Post`. Normalmente isso será feito dentro de um método do controlador:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\Post;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PostController extends Controller
    {
        /**
         * Atualize a postagem fornecida.
         */
        public function update(Request $request, Post $post): RedirectResponse
        {
            if ($request->user()->cannot('update', $post)) {
                abort(403);
            }

            // Atualize o post...

            return redirect('/posts');
        }
    }
```

Se uma [política é registrada](#registering-policies) para o modelo dado, o método `can` chamará automaticamente a política apropriada e retornará o resultado booleano. Se nenhuma política for registrada para o modelo, o método `can` tentará chamar um closure baseado no _Gate_ que se encaixa no nome da ação dada.

#### Ações que não exigem modelos

Lembre-se de que algumas ações podem corresponder ao métodos de política como `create` que não exigem uma instância de modelo. Nestes casos, você pode passar um nome de classe para o método `can`. O nome da classe será usado para determinar qual a política usar quando autorizando a ação:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\Post;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PostController extends Controller
    {
        /**
         * Crie uma postagem.
         */
        public function store(Request $request): RedirectResponse
        {
            if ($request->user()->cannot('create', Post::class)) {
                abort(403);
            }

            // Crie a postagem...

            return redirect('/posts');
        }
    }
```

### Através da _facade_ do `Gate`

Além dos métodos úteis fornecidos ao modelo `App\Models\User`, você sempre pode autorizar ações através do método `authorize` da _facade_ `Gate`.

Assim como o método `can`, este método aceita o nome da ação que você deseja autorizar e o modelo relevante. Se a ação não for autorizada, o método `authorize` lançará uma exceção `Illuminate\Auth\Access\AuthorizationException`, que será automaticamente convertida em uma resposta HTTP com um status de 403 pelo manipulador de exceções do Laravel:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\Post;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Gate;

    class PostController extends Controller
    {
        /**
         * Atualize a postagem do blog fornecida.
         *
         * @throws \Illuminate\Auth\Access\AuthorizationException
         */
        public function update(Request $request, Post $post): RedirectResponse
        {
            Gate::authorize('update', $post);

            // O usuário atual pode atualizar a postagem do blog...

            return redirect('/posts');
        }
    }
```

#### Ações que não exigem modelos

Como já discutido anteriormente, alguns métodos de política, como o método `create`, não requerem uma instância do modelo. Nestas situações, você deve passar um nome da classe para o método `authorize`. O nome da classe será usado para determinar qual política a utilizar ao autorizar a ação:

```php
    use App\Models\Post;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Gate;

    /**
     * Crie uma nova postagem no blog.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(Request $request): RedirectResponse
    {
        Gate::authorize('create', Post::class);

        // O usuário atual pode criar postagens de blog...

        return redirect('/posts');
    }
```

### Via Middleware

Laravel inclui um middleware que pode autorizar ações antes mesmo que a requisição chegue às rotas ou controladores. Por padrão, o middleware `Illuminate\Auth\Middleware\Authorize` pode ser anexado à uma rota usando o `can` [alias de middleware]("/docs/middleware#middleware-alias"), que é automaticamente registrado pelo Laravel. Vamos explorar um exemplo do uso do middleware `can` para autorizar que um usuário pode atualizar uma postagem:

```php
    use App\Models\Post;

    Route::put('/post/{post}', function (Post $post) {
        // O usuário atual pode atualizar a postagem...
    })->middleware('can:update,post');
```

Neste exemplo, estamos passando dois argumentos para o middleware `can`. O primeiro é o nome da ação que queremos autorizar e o segundo é o parâmetro de rota que queremos passar para o método de política. Neste caso, uma vez que estamos usando [vinculação implícita do modelo](/docs/routing#implicit-binding), um modelo `App\Models\Post` será passado para o método da política. Se o usuário não estiver autorizado a executar a ação dada, uma resposta HTTP com um código de status 403 será retornada pelo middleware.

Para conveniência, você também pode anexar o `can` middleware à sua rota usando o método `can`:

```php
    use App\Models\Post;

    Route::put('/post/{post}', function (Post $post) {
        // O usuário atual pode atualizar a postagem...
    })->can('update', 'post');
```

#### Ações que não exigem modelos

Novamente, algumas políticas métodos como `create` não requerem uma instância do modelo. Nessas situações, você pode passar um nome de classe para o middleware. O nome da classe será usado para determinar qual política usar quando esta autorizando a ação:

```php
    Route::post('/post', function () {
        // O usuário atual pode criar postagens...
    })->middleware('can:create,App\Models\Post');
```

Especificar o nome de uma classe inteira dentro da definição de middleware pode se tornar um incômodo. Por esse motivo, você pode optar por anexar o middleware `can` à sua rota usando o método `can`:

```php
    use App\Models\Post;

    Route::post('/post', function () {
        // O usuário atual pode criar postagens...
    })->can('create', Post::class);
```

### Via templates Blade

Ao criar modelos de Blade, você pode querer exibir apenas uma parte da página se o usuário estiver autorizado para realizar uma determinada ação. Por exemplo, você pode querer mostrar um formulário de atualização do post do blog apenas se o usuário puder realmente atualizar a postagem. Neste caso, você pode usar as diretivas `@can` e `@cannot`:

```blade
@can('update', $post)
    <!-- O usuário atual pode atualizar a postagem... -->
@elsecan('create', App\Models\Post::class)
    <!-- O usuário atual pode criar novas postagens... -->
@else
    <!-- ... -->
@endcan

@cannot('update', $post)
    <!-- O usuário atual não pode atualizar a postagem... -->
@elsecannot('create', App\Models\Post::class)
    <!-- O usuário atual não pode criar novas postagens... -->
@endcannot
```

Estas diretivas são atalhos convenientes para escrever as instruções `@if` e `@unless`. As instruções `@can` e `@cannot` acima são equivalentes às seguintes instruções:

```blade
@if (Auth::user()->can('update', $post))
    <!-- O usuário atual pode atualizar a postagem... -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- O usuário atual não pode atualizar a postagem... -->
@endunless
```

Você também pode determinar se um usuário é autorizado a executar qualquer ação de uma matriz dada de ações. Para fazer isso, use a diretiva `@canany`:

```blade
@canany(['update', 'view', 'delete'], $post)
    <!-- O usuário atual pode atualizar, visualizar ou excluir a postagem... -->
@elsecanany(['create'], \App\Models\Post::class)
    <!-- O usuário atual pode criar uma postagem... -->
@endcanany
```

#### Ações que não requerem modelos

Assim como a maioria dos outros métodos de autorização, você pode passar um nome de classe para as diretivas `@can` e `@cannot` se a ação não exigir uma instância do modelo:

```blade
@can('create', App\Models\Post::class)
    <!-- O usuário atual pode criar postagens... -->
@endcan

@cannot('create', App\Models\Post::class)
    <!--O usuário atual não pode criar postagens... -->
@endcannot
```

### Fornecer Contexto Adicional

Ao autorizar ações usando políticas, você pode passar uma matriz como o segundo argumento para as várias funções de autorização e auxiliares. O primeiro elemento na matriz será usado para determinar qual política deve ser invocada, enquanto o restante dos elementos da matriz são passados como parâmetros para o método da política e podem ser usados para o contexto adicional quando se tomar decisões de autorização. Por exemplo, considere a seguinte definição do método `PostPolicy` que contém um parâmetro adicional chamado `category`:

```php
    /**
     * Determine se a postagem fornecida pode ser atualizada pelo usuário.
     */
    public function update(User $user, Post $post, int $category): bool
    {
        return $user->id === $post->user_id &&
               $user->canUpdateCategory($category);
    }
```

Ao tentar determinar se o usuário autenticado pode atualizar uma determinada publicação, podemos invocar este método de política assim:

```php
    /**
     * Atualize a postagem do blog fornecida.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', [$post, $request->category]);

        // O usuário atual pode atualizar a postagem do blog...

        return redirect('/posts');
    }
```

## Autorização & Inertia

Embora a autorização sempre seja tratada no servidor, muitas vezes pode ser conveniente fornecer dados de autorização ao seu aplicativo frontal para que ele possa renderizar a interface do usuário do seu aplicativo corretamente. O Laravel não define uma convenção necessária para expor informações de autorização a um frontend alimentado pelo Inertia.

Porém, se você está usando um dos [starter kits](/docs/starter-kits) baseados em Inertia do Laravel, sua aplicação já contém um middleware `HandleInertiaRequests`. Dentro desto método `share` deste middleware, você pode retornar dados compartilhados que serão fornecidos para todas as páginas Inertia na sua aplicação. Esses dados compartilhados podem servir como um local conveniente para definir informações de autorização para o usuário:

```php
<?php

namespace App\Http\Middleware;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    // ...

    /**
     * Defina os adereços que são compartilhados por padrão.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request)
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => [
                    'post' => [
                        'create' => $request->user()->can('create', Post::class),
                    ],
                ],
            ],
        ];
    }
}
```
