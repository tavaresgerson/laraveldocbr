# Autorização

## Introdução

 Além de fornecer serviços de [autenticação](/docs/{{ version }}/authentication) integrados, o Laravel também oferece uma forma simples de autorizar ações dos usuários em um determinado recurso. Por exemplo, mesmo que um usuário esteja autenticado, ele pode não ser autorizado para atualizar ou excluir certos modelos Eloquent ou registros do banco de dados gerenciados por sua aplicação. O Laravel fornece recursos de autorização para facilitar e organizar esses tipos de verificações.

 O Laravel fornece dois métodos principais para autorizar ações: [portas](#gates) e [políticas](#creating-policies). Imagine portas e políticas como rota e controladores. As portas oferecem uma abordagem simples de autenticação, com base em funções fechadas (closure), enquanto as políticas, assim como os controladores, agrupam a lógica em torno de um modelo ou recurso específico. Nesta documentação, exploraremos portas primeiro e, em seguida, analisaremos políticas.

 Não é necessário escolher entre usar exclusivamente portas ou políticas ao construir um aplicativo. É mais provável que a maioria dos aplicativos contenha uma mistura de portas e políticas, o que é perfeitamente correto! As portas são mais úteis para ações que não estão relacionadas com nenhum modelo ou recurso, como verificar um painel do administrador. Por outro lado, as políticas devem ser usadas quando você deseja autorizar uma ação para um determinado modelo ou recurso.

## Portões

### Porta-guarda-chuvas de escritório

 > [AVISO]
 Use as opções [ Políticas](#criando-politicas) para organizar suas regras de autorização.

 Os gateways são, simplesmente, fechamentos que determinam se um usuário está autorizado a realizar uma ação específica. Normalmente, os gateways são definidos na ordem de inicialização do método `boot` da classe `App\Providers\AppServiceProvider`, utilizando a faca `Gate`. Os gateways recebem sempre como primeiro argumento uma instância de usuário e, opcionalmente, podem receber outros argumentos, tais como um modelo Eloquent relevante.

 Neste exemplo, definiremos um gatilho para determinar se um usuário pode atualizar um modelo de `App\Models\Post`. O gate realizará essa comparação comparando o ID do usuário com o `user_id` do usuário que criou o post:

```php
    use App\Models\Post;
    use App\Models\User;
    use Illuminate\Support\Facades\Gate;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('update-post', function (User $user, Post $post) {
            return $user->id === $post->user_id;
        });
    }
```

 Do mesmo modo que os controladores, as portas também podem ser definidas com um array de funções de chamada de classe:

```php
    use App\Policies\PostPolicy;
    use Illuminate\Support\Facades\Gate;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('update-post', [PostPolicy::class, 'update']);
    }
```


### Autorização de ações

 Para autorizar uma ação usando portões, você deve usar os métodos `allows` ou `denies` fornecidos pela fachada `Gate`. Note que não é obrigatório passar o usuário atualmente autenticado para esses métodos. O Laravel cuidará automaticamente do envio do usuário ao closure do portão. É típico chamar os métodos de autorização do portão dentro dos controladores da sua aplicação antes de executar uma ação que exija autorização:

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
         * Update the given post.
         */
        public function update(Request $request, Post $post): RedirectResponse
        {
            if (! Gate::allows('update-post', $post)) {
                abort(403);
            }

            // Update the post...

            return redirect('/posts');
        }
    }
```

 Se você quiser determinar se um usuário diferente do que o atualmente autenticado é autorizado a executar uma ação, você pode usar o método `forUser` no módulo de interface "Gate":

```php
    if (Gate::forUser($user)->allows('update-post', $post)) {
        // The user can update the post...
    }

    if (Gate::forUser($user)->denies('update-post', $post)) {
        // The user can't update the post...
    }
```

 É possível autorizar várias ações de uma só vez usando os métodos `any` ou `none`:

```php
    if (Gate::any(['update-post', 'delete-post'], $post)) {
        // The user can update or delete the post...
    }

    if (Gate::none(['update-post', 'delete-post'], $post)) {
        // The user can't update or delete the post...
    }
```

#### Autorização ou lançamento de exceções

 Se você deseja tentar autorizar uma ação e automaticamente lançar um `Illuminate\Auth\Access\AuthorizationException`, se o usuário não tiver permissão para executar essa ação, pode utilizar o método `authorize` da facade `Gate`. Instâncias de `AuthorizationException` são convertidas automaticamente em uma resposta HTTP 403 pelo Laravel:

```php
    Gate::authorize('update-post', $post);

    // The action is authorized...
```

#### Fornecendo contexto adicional

 Os métodos de portas para autorização de capacidades ( `permite`, `não permite`, `verifica`, `qualquer`, `nenhum`), e as diretivas de autorização [Blade directives (Diretrizes Blade)] (`@can`, `@cannot`, `@canany`) podem receber um array como seu segundo argumento. Estes elementos do array são passados como parâmetros para o bloqueio de portas e podem ser utilizados em contextos adicionais ao tomar decisões de autorização:

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
        // The user can create the post...
    }
```

### Respostas de portão

 Até agora, analisamos apenas portas que retornam valores booleanos simples. No entanto, às vezes você pode querer retornar uma resposta mais detalhada, incluindo uma mensagem de erro. Para fazer isso, é possível retornar um `Illuminate\Auth\Access\Response` da sua porta:

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

 Mesmo ao retornar uma resposta de autorização do seu gate, o método `Gate::allows` continuará retornando um valor boolean simples. No entanto, você poderá usar o método `Gate::inspect` para obter a resposta completa da autorização retornada pelo gate:

```php
    $response = Gate::inspect('edit-settings');

    if ($response->allowed()) {
        // The action is authorized...
    } else {
        echo $response->message();
    }
```

 Quando se utiliza o método Gate::authorize, que arroja uma exceção AuthorizationException se a ação não estiver autorizada, a mensagem de erro fornecida pela resposta de autorização será propagada para a resposta HTTP:

```php
    Gate::authorize('edit-settings');

    // The action is authorized...
```

#### Personalizando o Estado da Resposta HTTP

 Quando uma ação é negada através de um Gate, é retornado o código de resposta HTTP `403`. No entanto, às vezes pode ser útil retornar um código de resposta HTTP alternativo. É possível personalizar o código de resposta HTTP retornado para uma verificação de autorização negada usando a construtora estática `denyWithStatus` na classe `Illuminate\Auth\Access\Response`:

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

 Como esconder recursos através de uma resposta `404` é um padrão comum para aplicações da Web, o método `denyAsNotFound` é oferecido como uma conveniência:

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

### Detetar verificações de portões

 Às vezes, você pode querer conceder todas as capacidades para um usuário específico. Você pode usar o método `before` para definir uma instrução que é executada antes de todas as outras verificações de autorização:

```php
    use App\Models\User;
    use Illuminate\Support\Facades\Gate;

    Gate::before(function (User $user, string $ability) {
        if ($user->isAdministrator()) {
            return true;
        }
    });
```

 Se o fecho `before` retornar um valor nulo, esse resultado será considerado como resultado da verificação de autorização.

 Pode utilizar o método `after` para definir um fecho que irá ser executado depois de todas as outras verificações de autorização:

```php
    use App\Models\User;

    Gate::after(function (User $user, string $ability, bool|null $result, mixed $arguments) {
        if ($user->isAdministrator()) {
            return true;
        }
    });
```

 Assim como ocorre com o método `before`, se o fecho do método `after` retornar um resultado não nulo, esse resultado será considerado o resultado da verificação de autorização.

### Autorização em linha

 Ocasionalmente, você pode desejar determinar se o usuário atualmente autenticado tem autorização para realizar uma determinada ação sem escrever um portão dedicado que corresponda à ação. O Laravel permite fazer este tipo de verificação de autorização "in-line" por meio dos métodos `Gate::allowIf` e `Gate::denyIf`. A autorização in-line não executa nenhum loop de verificação de autorização definido (["antes" ou "depois"]):

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::allowIf(fn (User $user) => $user->isAdministrator());

Gate::denyIf(fn (User $user) => $user->banned());
```

 Se a ação não for autorizada ou se atualmente nenhum usuário estiver autenticado, o Laravel lançará automaticamente uma exceção `Illuminate\Auth\Access\AuthorizationException`. As instâncias da `AuthorizationException` são convertidas automaticamente em resposta HTTP 403 pelo gestor de exceções do Laravel.

## Criação de políticas

### Gerando políticas

 As políticas são classes que organizam a lógica de autorização em torno de um modelo ou recurso específico. Por exemplo, se sua aplicação for um blog, você pode ter um modelo `App\Models\Post` e uma política correspondente `App\Policies\PostPolicy` para autorizar ações do usuário, como criar ou atualizar postagens.

 Pode gerar uma política utilizando o comando do artesão `make:policy`. A política gerada será armazenada no diretório `app/Policies`. Se este diretório não existir na sua aplicação, Laravel irá criá-lo para si:

```shell
php artisan make:policy PostPolicy
```

 O comando `make:policy` irá gerar uma classe de política vazia. Se quiser gerar uma classe com exemplos de métodos de política relacionados à visualização, criação, atualização e exclusão do recurso, é possível fornecer a opção `--model` ao executar o comando:

```shell
php artisan make:policy PostPolicy --model=Post
```

### Registo de políticas

#### Descoberta de políticas

 Por padrão, o Laravel descoberta automaticamente políticas desde que o modelo e a política sigam as convenções de nomes do Laravel. Especificamente, as políticas devem estar em uma pasta "Policies" ou acima da pasta que contém seus modelos. Então, por exemplo, os modelos podem ficar na pasta `app/Models`, enquanto a política deve ficar na pasta `app/Policies`. Neste caso, o Laravel verifica as políticas em `app/Models/Policies` e então em `app/Policies`. Além disso, o nome da política deve coincidir com o nome do modelo e ter um sufixo de "Policy". Assim, o modelo "User" corresponde à classe de política "UserPolicy".

 Se desejar definir sua própria lógica de descobrimento de políticas, pode registrar um retorno personalizado de descobrimento de política usando o método `Gate::guessPolicyNamesUsing`. Normalmente, esse método deve ser chamado do método `boot` do seu aplicativo `AppServiceProvider`:

```php
    use Illuminate\Support\Facades\Gate;

    Gate::guessPolicyNamesUsing(function (string $modelClass) {
        // Return the name of the policy class for the given model...
    });
```

#### Registo de políticas manualmente

 Usando a interface de linha de comando `Gate`, você pode registrar manualmente políticas e os modelos correspondentes dentro do método `boot` do `AppServiceProvider` da sua aplicação.

```php
    use App\Models\Order;
    use App\Policies\OrderPolicy;
    use Illuminate\Support\Facades\Gate;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Order::class, OrderPolicy::class);
    }
```

## Redigindo políticas

### Métodos de Política

 Assim que o tipo de política tiver sido registrado, você poderá adicionar métodos para cada ação autorizada. Por exemplo, vamos definir um método `update` em nossa `PostPolicy`, que determina se um determinado usuário `App\Models\User` pode atualizar uma determinada instância de postagem `App\Models\Post`.

 O método `update` receberá um objeto `User` e uma instância de `Post` como argumentos. Deve retornar `true` ou `false` indicando se o usuário é autorizado a atualizar o post especificado. Então, neste exemplo, verificaremos se o `id` do usuário combina com o `user_id` no post:

```php
    <?php

    namespace App\Policies;

    use App\Models\Post;
    use App\Models\User;

    class PostPolicy
    {
        /**
         * Determine if the given post can be updated by the user.
         */
        public function update(User $user, Post $post): bool
        {
            return $user->id === $post->user_id;
        }
    }
```

 Você pode continuar definindo métodos adicionais na política conforme necessário para as várias ações que ela autoriza. Por exemplo, você poderá definir os métodos `view` ou `delete` para autorizar várias ações relacionadas com o campo `Post`, mas lembre-se de que você é livre para dar nomes conforme preferir a essas funções da política.

 Se você tiver usado a opção `--model` ao gerar seu policy através da consola Artisan, ele já conterá métodos para as ações "viewAny", "view", "create", "update", "delete", "restore" e "forceDelete".

 > [!ATENÇÃO]
 Existe um [conjunto de serviços] (container), que permite referenciar, através da especificação do tipo de dependência no construtor da estratégia de segurança, a dependência necessária para a sua injeção automática.

### Respostas de política

 Até agora, nós analisamos apenas métodos de políticas que retornam valores booleanos simples. No entanto, algumas vezes você pode desejar retornar uma resposta mais detalhada, incluindo uma mensagem de erro. Para isso, você poderá retornar uma instância `Illuminate\Auth\Access\Response` a partir do método da política:

```php
    use App\Models\Post;
    use App\Models\User;
    use Illuminate\Auth\Access\Response;

    /**
     * Determine if the given post can be updated by the user.
     */
    public function update(User $user, Post $post): Response
    {
        return $user->id === $post->user_id
                    ? Response::allow()
                    : Response::deny('You do not own this post.');
    }
```

 Quando retornar uma resposta de autorização da política, o método `Gate::allows` ainda retorna um valor boolean simples; no entanto, pode utilizar o método `Gate::inspect` para obter a resposta de autorização completa retornada pelo gate:

```php
    use Illuminate\Support\Facades\Gate;

    $response = Gate::inspect('update', $post);

    if ($response->allowed()) {
        // The action is authorized...
    } else {
        echo $response->message();
    }
```

 Ao usar o método `Gate::authorize`, que arrota uma `AuthorizationException` se a ação não estiver autorizada, a mensagem de erro fornecida pela resposta de autorização será propagada para a resposta HTTP:

```php
    Gate::authorize('update', $post);

    // The action is authorized...
```

#### Personalizando o status de resposta do HTTP

 Quando uma ação é negada por meio de um método de política, é retornado um código de resposta HTTP de "403". No entanto, às vezes, pode ser útil o retorno de um status code alternativo. Você pode personalizar o status code HTTP retornado para uma checagem de autorização com sucesso usando a construtora estática `denyWithStatus` na classe `Illuminate\Auth\Access\Response`:

```php
    use App\Models\Post;
    use App\Models\User;
    use Illuminate\Auth\Access\Response;

    /**
     * Determine if the given post can be updated by the user.
     */
    public function update(User $user, Post $post): Response
    {
        return $user->id === $post->user_id
                    ? Response::allow()
                    : Response::denyWithStatus(404);
    }
```

 Como o esconder de recursos através de uma resposta `404` é um padrão tão comum para aplicações web, foi oferecida a função `denyAsNotFound` por conveniência:

```php
    use App\Models\Post;
    use App\Models\User;
    use Illuminate\Auth\Access\Response;

    /**
     * Determine if the given post can be updated by the user.
     */
    public function update(User $user, Post $post): Response
    {
        return $user->id === $post->user_id
                    ? Response::allow()
                    : Response::denyAsNotFound();
    }
```

### Métodos sem Modelos

 Existem métodos de políticas que recebem somente uma instância do usuário autenticado no momento. Esta situação é mais comum ao autorizar ações `create`. Por exemplo, se você estiver criando um blog, pode desejar determinar se o usuário está autorizado a publicar posts de alguma forma. Nestas situações, seu método de política só deve receber uma instância do usuário:

```php
    /**
     * Determine if the given user can create posts.
     */
    public function create(User $user): bool
    {
        return $user->role == 'writer';
    }
```

### Usuários convidados

 Por padrão, todas as portas e políticas retornam automaticamente `false` se o pedido HTTP não tiver sido iniciado por um usuário autenticado. No entanto, você pode permitir que esses checamentos de autorização passem para suas portas e políticas declarando uma sugestão de tipo "opcional" ou fornecendo um valor padrão `null` para a definição do argumento usuário:

```php
    <?php

    namespace App\Policies;

    use App\Models\Post;
    use App\Models\User;

    class PostPolicy
    {
        /**
         * Determine if the given post can be updated by the user.
         */
        public function update(?User $user, Post $post): bool
        {
            return $user?->id === $post->user_id;
        }
    }
```

### Filtros de política

 Pode ser que pretenda autorizar todas as ações num determinado domínio. Para o efeito, defina um método `before` no domínio. O método `before` é executado antes de todos os outros métodos do domínio, o que lhe permite autorizar a ação antes da chamada ao método pretendido:

```php
    use App\Models\User;

    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): bool|null
    {
        if ($user->isAdministrator()) {
            return true;
        }

        return null;
    }
```

 Se pretender recusar todos os controlos de autorização para um tipo específico de utilizador, pode indicar `false` na metodologia `before`. Caso seja indicado `null`, o controlo de autorização será efetuado pela metodologia da política.

 > [ATENÇÃO]
 > O método `before` de uma classe de política não será chamado se a classe não conter um método com um nome que corresponda ao nome da habilidade que está sendo verificada.

## Autorizar ações utilizando políticas

### Por meio do Modelo de Usuário

 O modelo `App\Models\User`, incluído no seu aplicativo Laravel, inclui dois úteis métodos para autorizar ações: `can` e `cannot`. Os métodos `can` e `cannot` recebem o nome da ação que pretende autorizar e o modelo relevante. Por exemplo, digite-se determinar se um utilizador está autorizado a atualizar um modelo de conteúdo (post) do tipo `App\Models\Post`. Normalmente, isto é feito num método de controlo:

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
         * Update the given post.
         */
        public function update(Request $request, Post $post): RedirectResponse
        {
            if ($request->user()->cannot('update', $post)) {
                abort(403);
            }

            // Update the post...

            return redirect('/posts');
        }
    }
```

 Se um [policy estiver registrado](#registrando-policies) para o modelo indicado, o método `can` chamará automaticamente o policy apropriado e retornará o resultado boolean. Caso não exista nenhum policy registrado para o modelo, o método `can` tentará chamada o Gate com base em função que corresponda ao nome da ação indicada.

#### Ações que não requerem modelos

 Lembre-se de que algumas ações podem corresponder a métodos de políticas como "create" (criar), que não requerem uma instância do modelo. Nessas situações, é possível passar o nome da classe para o método `can`. O nome da classe será usado para determinar qual política usar ao autorizar a ação:

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
         * Create a post.
         */
        public function store(Request $request): RedirectResponse
        {
            if ($request->user()->cannot('create', Post::class)) {
                abort(403);
            }

            // Create the post...

            return redirect('/posts');
        }
    }
```

### Por meio da fachada do "Portão"

 Além dos métodos úteis fornecidos para o modelo `App\Models\User`, você pode sempre autorizar ações através do método `autorize` da façana `Gate`.

 Como o método `can`, esse método aceita o nome da ação que você deseja autorizar e seu modelo respectivo. Se a ação não for autorizada, o método `authorize` irá arremessar uma exceção `Illuminate\Auth\Access\AuthorizationException` que o gerenciador de exceções do Laravel converterá automaticamente para uma resposta HTTP com um código de estado 403:

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
         * Update the given blog post.
         *
         * @throws \Illuminate\Auth\Access\AuthorizationException
         */
        public function update(Request $request, Post $post): RedirectResponse
        {
            Gate::authorize('update', $post);

            // The current user can update the blog post...

            return redirect('/posts');
        }
    }
```

#### Ações que não requerem modelos

 Como discutido anteriormente, alguns métodos de política como `create` não requerem uma instância da modelo. Nestas situações, você deve passar o nome da classe ao método `authorize`. O nome da classe será utilizado para determinar qual política usar ao autorizar a ação:

```php
    use App\Models\Post;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Gate;

    /**
     * Create a new blog post.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(Request $request): RedirectResponse
    {
        Gate::authorize('create', Post::class);

        // The current user can create blog posts...

        return redirect('/posts');
    }
```

### Por meio do middleware

 O Laravel inclui um middleware que pode autorizar ações antes mesmo de o pedido receber os seus rotas ou controladores. Por padrão, o middleware `Illuminate\Auth\Middleware\Authorize` poderá ser associado a uma rota usando o [alias de middleware](/docs/middleware#middleware-alias), que é automaticamente registrado pelo Laravel. Vamos explorar um exemplo do uso do middleware `can` para autorizar que um utilizador possa atualizar um post:

```php
    use App\Models\Post;

    Route::put('/post/{post}', function (Post $post) {
        // The current user may update the post...
    })->middleware('can:update,post');
```

 Neste exemplo, o middleware `can` está recebendo dois argumentos. O primeiro é o nome da ação que pretendemos autorizar e o segundo é o parâmetro de rota que pretendemos passar à método do modelo. No caso, como estamos usando o [enlaçamento implícito](/docs/routing#implicit-binding), um modelo `App\Models\Post` será passado para a metodologia de política. Se o utilizador não estiver autorizado a executar a ação dada, o middleware irá retornar uma resposta HTTP com um código de status 403.

 Para mais conveniência, você pode também anexar o middleware `can` à sua rota usando o método `can`:

```php
    use App\Models\Post;

    Route::put('/post/{post}', function (Post $post) {
        // The current user may update the post...
    })->can('update', 'post');
```

#### Ações que não requerem modelos

 Novamente, alguns métodos de política como `create` não requerem uma instância do modelo. Nestas situações, você pode passar um nome da classe para o middleware. O nome da classe será usado para determinar qual política usar ao autorizar a ação:

```php
    Route::post('/post', function () {
        // The current user may create posts...
    })->middleware('can:create,App\Models\Post');
```

 É possível que especificar o nome da classe inteira dentro de uma definição do middleware de string seja muito demorado. Por esse motivo, você poderá optar por anexar o middleware `can` à sua rota usando o método `can`:

```php
    use App\Models\Post;

    Route::post('/post', function () {
        // The current user may create posts...
    })->can('create', Post::class);
```

### Por meio de modelos de lâminas

 Ao escrever templates do Blade, é possível exibir uma parte da página apenas se o usuário estiver autorizado a executar determinada ação. Por exemplo, você pode mostrar um formulário de atualização para um post de blog somente se o usuário realmente tiver permissão para fazer essa atualização. Nesta situação, é possível usar as diretivas `@can` e `@cannot`:

```blade
@can('update', $post)
    <!-- The current user can update the post... -->
@elsecan('create', App\Models\Post::class)
    <!-- The current user can create new posts... -->
@else
    <!-- ... -->
@endcan

@cannot('update', $post)
    <!-- The current user cannot update the post... -->
@elsecannot('create', App\Models\Post::class)
    <!-- The current user cannot create new posts... -->
@endcannot
```

 Estas diretivas são atalhos convenientes para escrever declarações `@if` e `@unless`. As declarações `@can` e `@cannot` acima são equivalentes às seguintes declarações:

```blade
@if (Auth::user()->can('update', $post))
    <!-- The current user can update the post... -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- The current user cannot update the post... -->
@endunless
```

 Você também pode determinar se um usuário está autorizado a realizar uma determinada ação em uma matriz de ações específica. Para isso, utilize a diretiva `@canany`:

```blade
@canany(['update', 'view', 'delete'], $post)
    <!-- The current user can update, view, or delete the post... -->
@elsecanany(['create'], \App\Models\Post::class)
    <!-- The current user can create a post... -->
@endcanany
```

#### Ações que não requerem modelos

 Como na maioria dos outros métodos de autorização, você pode passar um nome de classe para as diretivas `@can` e `@cannot` se o comando não exigir uma instância do modelo:

```blade
@can('create', App\Models\Post::class)
    <!-- The current user can create posts... -->
@endcan

@cannot('create', App\Models\Post::class)
    <!-- The current user can't create posts... -->
@endcannot
```

### Fornecimento de contexto adicional

 Ao autorizar ações usando políticas, você pode passar um array como segundo argumento para as várias funções e auxílios de autorização. O primeiro elemento no array será utilizado para determinar qual política deve ser invocada, enquanto o resto dos elementos do array são passados como parâmetros para a própria método da política e podem ser utilizados para contexto adicional quando tomando decisões de autorização. Por exemplo, considere a seguinte definição de método `PostPolicy`, que contém um parâmetro adicional `$category`:

```php
    /**
     * Determine if the given post can be updated by the user.
     */
    public function update(User $user, Post $post, int $category): bool
    {
        return $user->id === $post->user_id &&
               $user->canUpdateCategory($category);
    }
```

 Para determinar se o usuário autenticado pode atualizar um determinado post, devemos invocar este método de política:

```php
    /**
     * Update the given blog post.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', [$post, $request->category]);

        // The current user can update the blog post...

        return redirect('/posts');
    }
```

## Autorização e Inércia

 Apesar da autorização sempre ter que ser tratada no servidor, frequentemente pode ser conveniente disponibilizar ao seu aplicativo front-end dados de autorização para que a interface gráfica da sua aplicação seja devidamente apresentada. O Laravel não define uma convenção obrigatória para expor informações de autorização a um front-end alimentado por Inertia.

 No entanto, se você estiver usando um dos [pacotes de inicialização](/docs/starter-kits) baseados em Inertia do Laravel, seu aplicativo já possui um middleware `HandleInertiaRequests`. Dentro deste middleware, no método `share`, você pode retornar dados compartilhados que serão fornecidos a todas as páginas da Inertia em seu aplicativo. Estes dados compartilhados podem servir como uma localização conveniente para definir informações de autorização do usuário:

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
     * Define the props that are shared by default.
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
