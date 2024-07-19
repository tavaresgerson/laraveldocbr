# Encaminhamento

## Roteamento básico
Os rotas mais básicas do Laravel aceitam uma URI e um closure, proporcionando uma maneira muito simples e expressiva de definir rotas e comportamentos sem arquivos complicados para configuração.

```php
    use Illuminate\Support\Facades\Route;

    Route::get('/greeting', function () {
        return 'Hello World';
    });
```

### Arquivos de rotas padrão
Todas as rotas Laravel são definidas em seus arquivos de rota, que estão localizados na pasta `routes`. Esses arquivos são carregados automaticamente pelo Laravel usando a configuração especificada no arquivo `bootstrap/app.php` do seu aplicativo. O arquivo `routes/web.php` define rotas para sua interface web, e elas têm o grupo de [middlewares](/docs/middleware) atribuído, que fornece recursos como estado da sessão e proteção CSRF.

Para a maioria das aplicações, será preciso definir rotas no arquivo `routes/web.php`. As rotas definidas no `routes/web.php` podem ser acessadas entrando na URL da rota definida no seu navegador. Por exemplo, você poderá acessar à seguinte rota navegando para `http://example.com/user` no seu navegador:

```php
    use App\Http\Controllers\UserController;

    Route::get('/user', [UserController::class, 'index']);
```

#### Rotas da API
Se o seu aplicativo for oferecer também uma API sem estado, poderá habilitar o roteamento de API utilizando o comando do Artisan `install:api`:

```shell
php artisan install:api
```

O comando `install:api` instala [Laravel Sanctum](/docs/sanctum), que fornece um robusto e simples bloqueio de autenticação por token API, que pode ser utilizado para autenticar clientes de terceiros, SPAs ou aplicações móveis. Além disso, o comando `install:api` cria o ficheiro `routes/api.php`:

```php
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
```

As rotas em `routes/api.php` não possuem estado e são atribuídos ao grupo de middleware [`api`](/docs/middleware#laravels-default-middleware-groups). Além disso, o prefixo URI `/api` é automaticamente aplicado a estas rotas, portanto você não precisa aplicá-lo manualmente em todas as rotas do arquivo. Você pode alterar o prefixo modificando o arquivo `bootstrap/app.php` de sua aplicação:

```php
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api/admin',
        // ...
    )
```

#### Métodos disponíveis para roteadores
O roteador permite-lhe registrar rotas que respondem a qualquer verbo HTTP:

```php
    Route::get($uri, $callback);
    Route::post($uri, $callback);
    Route::put($uri, $callback);
    Route::patch($uri, $callback);
    Route::delete($uri, $callback);
    Route::options($uri, $callback);
```

Às vezes, você pode precisar registrar uma rota que atenda a múltiplos verbos de HTTP. Isso pode ser feito usando o método `match`. Ou ainda, você pode registrar uma rota que atenda a todos os verbos de HTTP usando o método `any`:

```php
    Route::match(['get', 'post'], '/', function () {
        // ...
    });

    Route::any('/', function () {
        // ...
    });
```

::: info NOTA
Ao definir várias rotas que compartilham o mesmo URI, as rotas que utilizam os métodos `get`, `post`, `put`, `patch`, `delete` e `options` devem ser definidas antes das rotas que utilizam os métodos `any`, `match` e `redirect`. Isso garante que a solicitação de entrada é combinada com a rota correta.
:::

#### Injeção de dependência
Você pode fornecer uma sugestão de tipo para quaisquer dependências necessárias em sua assinatura de retorno do roteamento. As dependências declaradas serão automaticamente resolvidas e injetadas no retorno pelo [container de serviços do Laravel](/docs/container). Por exemplo, você pode fornecer uma sugestão de tipo para a classe `Illuminate\Http\Request` para que o pedido atual seja injetado automaticamente em seu retorno do roteamento:

```php
    use Illuminate\Http\Request;

    Route::get('/users', function (Request $request) {
        // ...
    });
```

#### Proteção contra CSRF
Lembre-se de que todos os formulários HTML que apontam para rota `POST`, `PUT`, `PATCH` ou `DELETE` definidas no arquivo de roteamento `web` devem incluir um campo de token CSRF. Caso contrário, o pedido será rejeitado. Você pode ler mais sobre proteção contra CSRF na [documentação sobre CSRF](/docs/csrf):

```blade
    <form method="POST" action="/profile">
        @csrf
        ...
    </form>
```

### Rotas redirecionadas
Se estiver a definir uma rota que reenvia para outro URI, pode utilizar o método `Route::redirect`. Este método proporciona um atalho prático para redirecionamentos simples sem precisar de definir uma rota completa ou controlador:

```php
    Route::redirect('/here', '/there');
```

Por padrão, o método `Route::redirect` retorna um código de estado HTTP `302`. Você pode personalizar o código de estado usando o terceiro parâmetro como opcional:

```php
    Route::redirect('/here', '/there', 301);
```

Ou você pode usar o método `Route::permanentRedirect` para retornar um código de status `301`:

```php
    Route::permanentRedirect('/here', '/there');
```

::: info NOTA
Ao usar parâmetros de rota em rotas de redirecionamento, os seguintes parâmetros são reservados pelo Laravel e não podem ser utilizados: `destination` e `status`.
:::

### Visualizações em Rotas
Se a sua rota só precisa retornar uma [visualização](/docs/views), você pode usar o método `Route::view`. Assim como no caso do método `redirect`, esse método fornece um atalho simples para que não seja necessário definir uma rota ou controlador completos. O método `view` aceita um URI como primeiro argumento e um nome de visualização como segundo argumento. Além disso, é possível passar um array de dados à visualização, como um terceiro argumento opcional:

```php
    Route::view('/welcome', 'welcome');

    Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

::: info NOTA
Quando os parâmetros de rota são utilizados em rotas de visualização, os seguintes parâmetros são reservados pela Laravel e não podem ser usados: `view`, `data`, `status`e `headers`.
:::

### Listando as suas rotas
O comando do Artisan `route:list` pode facilmente fornecer uma visão geral de todas as rotas definidas pelo seu aplicativo:

```shell
php artisan route:list
```

Por padrão, os middlewares de rota atribuídos a cada rota não serão exibidos na saída `route:list`. No entanto, você pode orientar o Laravel para exibir os nomes dos grupos e middlewares da rota adicionando a opção `-v` ao comando:

```shell
php artisan route:list -v

# Expanda os grupos de middleware...
php artisan route:list -vv
```

Você também pode instruir o Laravel a mostrar apenas as rotas que começam com um URI especificado:

```shell
php artisan route:list --path=api
```

Além disso, você pode instruir o Laravel para ocultar todas as rotas definidas por pacotes de terceiros ao fornecer a opção `--except-vendor` quando executando o comando `route:list`:

```shell
php artisan route:list --except-vendor
```

Da mesma forma, você pode instruir o Laravel a exibir apenas as rotas definidas por pacotes de terceiros fornecendo a opção `--only-vendor` quando executar o comando `route:list`:

```shell
php artisan route:list --only-vendor
```

### Personalização de encaminhamento
Por padrão, as rotas da sua aplicação são configuradas e carregadas pelo arquivo `bootstrap/app.php`:

```php
<?php

use Illuminate\Foundation\Application;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )->create();
```

No entanto, às vezes poderá ser necessário definir um ficheiro novo para conter um subconjunto dos percursos da aplicação. Para conseguir isto, pode fornecer um fecho `then` ao método `withRouting`. Nessa closure, você pode registrar quaisquer outros percursos que sejam necessários à aplicação:

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
    then: function () {
        Route::middleware('api')
            ->prefix('webhooks')
            ->name('webhooks.')
            ->group(base_path('routes/webhooks.php'));
    },
)
```

Ou você poderá até mesmo assumir o controle completo sobre o registro de rotas fornecendo uma `using` em closure ao método `withRouting`. Quando este argumento é passado, nenhuma rota HTTP será registrada pelo framework e você estará responsável por registrar manualmente todas as rotas:

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    commands: __DIR__.'/../routes/console.php',
    using: function () {
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        Route::middleware('web')
            ->group(base_path('routes/web.php'));
    },
)
```

## Parâmetros de rota

### Parâmetros Obrigatórios
Às vezes você precisará capturar segmentos do URI dentro da sua rota. Por exemplo, pode ser necessário capturar o ID de um usuário na URL. Você pode fazer isso definindo parâmetros de rota:

```php
    Route::get('/user/{id}', function (string $id) {
        return 'User '.$id;
    });
```

Você pode definir tantos parâmetros de rota quantas necessário em sua rota:

```php
    Route::get('/posts/{post}/comments/{comment}', function (string $postId, string $commentId) {
        // ...
    });
```

Os parâmetros da rota são sempre encerrados entre aspas e devem ser constituídos por letras alfabéticas. Também são aceites sublinhados (_) nos nomes dos parâmetros da rota. Os parâmetros de uma rota são injetados nos callbacks/controles baseado em sua ordem, ou seja, os nomes do argumento do callback/controle da rota não são relevantes.

#### Parâmetros e injeção de dependência
Se o seu caminho tiver dependências que você deseja que o contêiner de serviços do Laravel injete automaticamente no seu callback de rota, você deve listar os parâmetros da sua rota após suas dependências:

```php
    use Illuminate\Http\Request;

    Route::get('/user/{id}', function (Request $request, string $id) {
        return 'User '.$id;
    });
```

### Parâmetros opcionais
Ocasionalmente, você pode precisar especificar um parâmetro de rota que talvez não esteja sempre presente na URI. Isso pode ser feito colocando um simbolo `?` após o nome do parâmetro. Certifique-se de dar ao parâmetro da rota um valor padrão:

```php
    Route::get('/user/{name?}', function (?string $name = null) {
        return $name;
    });

    Route::get('/user/{name?}', function (?string $name = 'John') {
        return $name;
    });
```

### Restrições de expressão regular
É possível restringir o formato dos parâmetros de rota usando o método `where` em uma instância de rota. O método `where` aceita o nome do parâmetro e um expressão regular que define como o parâmetro deve ser restrito:

```php
    Route::get('/user/{name}', function (string $name) {
        // ...
    })->where('name', '[A-Za-z]+');

    Route::get('/user/{id}', function (string $id) {
        // ...
    })->where('id', '[0-9]+');

    Route::get('/user/{id}/{name}', function (string $id, string $name) {
        // ...
    })->where(['id' => '[0-9]+', 'name' => '[a-z]+']);
```

Para maior comodidade, alguns padrões de expressão regular comumente usados têm métodos auxiliares que permitem que você adicione rapidamente restrições aos seus padrões.

```php
    Route::get('/user/{id}/{name}', function (string $id, string $name) {
        // ...
    })->whereNumber('id')->whereAlpha('name');

    Route::get('/user/{name}', function (string $name) {
        // ...
    })->whereAlphaNumeric('name');

    Route::get('/user/{id}', function (string $id) {
        // ...
    })->whereUuid('id');

    Route::get('/user/{id}', function (string $id) {
        // ...
    })->whereUlid('id');

    Route::get('/category/{category}', function (string $category) {
        // ...
    })->whereIn('category', ['movie', 'song', 'painting']);
    
    Route::get('/category/{category}', function (string $category) {
        // ...
    })->whereIn('category', CategoryEnum::cases());
```

Se o pedido recebido não estiver de acordo com as restrições do padrão de rota, uma resposta de HTTP 404 será feito.

#### Restrições globais
Se desejar que um parâmetro de rota seja sempre limitado por um determinado padrão regular, você pode usar o método `pattern`. Você deve definir esses padrões no método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    use Illuminate\Support\Facades\Route;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Route::pattern('id', '[0-9]+');
    }
```

Depois que o padrão tiver sido definido, ele será aplicado automaticamente a todas as rotas que usam esse nome de parâmetro:

```php
    Route::get('/user/{id}', function (string $id) {
        // Executado apenas se {id} for numérico...
    });
```

#### Barras codificadas
O componente de roteamento do Laravel permite que qualquer caractere, exceto o "/", seja presente nos valores dos parâmetros do roteamento. Você deve permitir explicitamente que a "/" faça parte da sua referência usando uma condição de expressão regular `where`:

```php
    Route::get('/search/{search}', function (string $search) {
        return $search;
    })->where('search', '.*');
```

::: warning ATENÇÃO
Barras codificadas são suportadas apenas no último segmento da rota.
:::

## Rotas com nomes
As rotas nomeadas permitem gerar URL's ou redirecionamentos para rotas específicas de forma prática. Você pode especificar um nome para uma rota usando a metodologia `name` em cadeia na definição da rota:

```php
    Route::get('/user/profile', function () {
        // ...
    })->name('profile');
```

Pode também especificar nomes de rotas para ações do controlador:

```php
    Route::get(
        '/user/profile',
        [UserProfileController::class, 'show']
    )->name('profile');
```

::: warning ATENÇÃO
Os nomes de rota devem ser sempre exclusivos.
:::

#### Criando URLs para rotas nomeadas
Depois de atribuído um nome a uma rota, pode utilizar o nome da rota ao gerar URL ou redirecionamentos por meio das funções auxiliares `route` e `redirect` do Laravel:

```php
    // Gerando URLs...
    $url = route('profile');

    // Gerando Redirecionamentos...
    return redirect()->route('profile');

    return to_route('profile');
```

Se a rota nomeada definir parâmetros, você poderá passar esses parâmetros como o segundo argumento da função `route`. Os parâmetros fornecidos serão automaticamente inseridos na URL gerada em suas posições corretas:

```php
    Route::get('/user/{id}/profile', function (string $id) {
        // ...
    })->name('profile');

    $url = route('profile', ['id' => 1]);
```

 Se você incluir parâmetros adicionais na matriz, esses pares de chave/valor serão automaticamente adicionados aos parâmetros da string de consulta da URL gerada:

```php
    Route::get('/user/{id}/profile', function (string $id) {
        // ...
    })->name('profile');

    $url = route('profile', ['id' => 1, 'photos' => 'yes']);

    // /user/1/profile?photos=yes
```

::: info NOTA
Às vezes, você pode querer especificar valores padrões para toda a solicitação em parâmetros de URL, como a localidade atual. Para fazer isso, você pode usar o [método `URL::defaults`](/docs/urls#default-values).
:::

#### Inspeção da rota atual
Se você gostaria de determinar se o pedido atual foi encaminhado para uma rota especificada, você pode usar o método `named` em uma instância do `Route`. Por exemplo, você pode verificar o nome da rota atual a partir de um middleware de rota:

```php
    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    /**
     * Lidar com uma solicitação recebida.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->route()->named('profile')) {
            // ...
        }

        return $next($request);
    }
```

## Grupos de rotas
Os grupos de rotas permitem partilhar atributos de rota, como o middleware, entre um grande número de rotas sem ter que definir esses atributos em cada uma delas.

Grupos aninhados tentam "mesclar" atributos com seu grupo principal de maneira inteligente. Middleware e condições `where` são mescladas enquanto nomes e prefixos são adicionados ao final. Delimitadores de namespace e slaches em prefixos URI são automaticamente adicionados onde for apropriado.

### Middleware
Para atribuir um [middleware](/docs/middleware) a todos os caminhos dentro de um grupo, você pode utilizar o método `middleware` antes da definição do grupo. Os middlewares são executados na ordem em que estão listados na matriz:

```php
    Route::middleware(['first', 'second'])->group(function () {
        Route::get('/', function () {
            // Usa primeiro e segundo middleware ...
        });

        Route::get('/user/profile', function () {
            // Usa primeiro e segundo middleware ...
        });
    });
```

### Controladores
Se um grupo de rotas utilizarem o mesmo [controlador](/docs/controllers), você poderá usar o método `controller` para definir o controlador comum para todas as rotas dentro do grupo. Então, ao definir as rotas, você só precisa fornecer o método de controlador que elas invocarão:

```php
    use App\Http\Controllers\OrderController;

    Route::controller(OrderController::class)->group(function () {
        Route::get('/orders/{id}', 'show');
        Route::post('/orders', 'store');
    });
```

### Roteamento de subdomínios
Os grupos de rotas também podem ser usados para configurar roteamento de subdomínio. Os subdomínios podem receber parâmetros de rota, assim como as URI das rotas, permitindo que você capture uma parte do subdomínio para uso em sua rota ou controlador. O subdomínio pode ser especificado chamando o método `domain` antes da definição do grupo:

```php
    Route::domain('{account}.example.com')->group(function () {
        Route::get('user/{id}', function (string $account, string $id) {
            // ...
        });
    });
```

::: warning ATENÇÃO
Para garantir que seus roteamentos de subdomínio sejam acessados, você deve registrar os roteamentos do seu subdomínio antes de registrar os roteamentos de domínios raiz. Isso evitará a sobreescrita dos roteamentos do domínio raiz por meio de roteamentos de subdomínio que tenham um caminho na URI igual.
:::

### prefixos de rota
O método `prefix` pode ser usado para preencher cada rota do grupo com um determinado URI. Por exemplo, pode ser que você deseje preencher todos os URIs das rotas dentro do grupo com "admin":

```php
    Route::prefix('admin')->group(function () {
        Route::get('/users', function () {
            // Corresponde a URL "/admin/users"
        });
    });
```

### Prefixos de nomes de rota
O método `name` permite adicionar um determinado texto como prefixo a cada nome de rota do grupo. Por exemplo, pode ser desejável adicionar o prefixo "admin" a todos os nomes de todas as rotas do grupo. O texto fornecido é prefixado ao nome da rota tal como especificado, por isso tenha certeza de incluir o ponto final:

```php
    Route::name('admin.')->group(function () {
        Route::get('/users', function () {
            // Nome atribuído à rota "admin.users"...
        })->name('users');
    });
```

## Ligações de modelo à rota
Quando você injetar um ID do modelo em uma ação da rotas ou do controlador, normalmente, você consultará o banco de dados para recuperar o modelo que corresponde ao ID. O mapeamento de modelo de rota Laravel oferece uma maneira conveniente de injetar automaticamente as instâncias de modelo diretamente nas suas rotas. Por exemplo, em vez de injetar um ID do usuário, você poderá injetar a própria instância do modelo `User` que corresponda ao ID fornecido.

### Vinculação implícita
O Laravel resolve automaticamente os modelos Eloquent definidos em rotas ou ações de controlador cujos nomes de variáveis indicam se o tipo coincidem com o nome de um segmento de rota. Por exemplo:

```php
    use App\Models\User;

    Route::get('/users/{user}', function (User $user) {
        return $user->email;
    });
```

Como a variável `$user` é indicada pelo tipo como um modelo Eloquent `App\Models\User`, e o nome da variável coincide com o segmento da URI `{user}`, o Laravel injetará automaticamente a instância do modelo que tenha um ID correspondente ao valor do segmento URI. Se não for encontrada nenhuma instância do modelo correspondente no banco de dados, será gerado automáticamente uma resposta HTTP 404.

É claro que é possível realizar ligações implícitas usando métodos do controlador. Novamente, note que o segmento de URI `{user}` corresponde à variável `$user` no controlador que contém uma dica de tipo `App\Models\User`:

```php
    use App\Http\Controllers\UserController;
    use App\Models\User;

    // Definição de rota...
    Route::get('/users/{user}', [UserController::class, 'show']);

    // Definição do método no controlador...
    public function show(User $user)
    {
        return view('user.profile', ['user' => $user]);
    }
```

#### Modelos apagados temporariamente (soft-delete)
Normalmente, o mapeamento de modelo implícito não recuperará modelos que foram excluídos [de maneira suave](/docs/eloquent#soft-deleting). No entanto, você pode instruir a conexão implícita para recuperar esses modelos usando o método `withTrashed` na definição de sua rota:

```php
    use App\Models\User;

    Route::get('/users/{user}', function (User $user) {
        return $user->email;
    })->withTrashed();
```

#### Personalizar a chave
Às vezes você pode desejar resolver modelos Eloquent usando uma coluna diferente de `id`. Para fazer isso, você pode especificar a coluna na definição do parâmetro da rota:

```php
    use App\Models\Post;

    Route::get('/posts/{post:slug}', function (Post $post) {
        return $post;
    });
```

Se desejar que o vínculo do modelo sempre utilize outra coluna de banco de dados do que "id" ao recuperar uma determinada classe de modelo, você poderá sobreescrever o método `getRouteKeyName` no modelo Eloquent:

```php
    /**
     * Obtenha a chave de rota para o modelo.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
```

#### Chaves personalizadas e escopo
Quando você vincula implicitamente vários modelos Eloquent em uma única definição de rota, talvez você queira definir um escopo para o segundo modelo Eloquent de modo que ele seja um filho do modelo anterior. Por exemplo: considere essa definição de rota, que recupera um post de blog por slug para um usuário específico.

```php
    use App\Models\Post;
    use App\Models\User;

    Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
        return $post;
    });
```

Ao usar um mapeamento implícito personalizado como parâmetro de rota aninhado, o Laravel irá automaticamente limitar a consulta para recuperar o modelo aninhado com base em seu pai usando convenções para adivinhar o nome da relação no pai. Neste caso, presume-se que o modelo `User` tem uma relação chamada `posts` (a forma plural do nome do parâmetro de rota), que pode ser utilizada para recuperar o modelo `Post`.

Se desejar, você pode instruir o Laravel para que vinculações de "filho" sejam atribuídas mesmo quando a chave personalizada não for fornecida. Para fazer isso, é necessário invocar o método `scopeBindings` ao definir sua rota:

```php
    use App\Models\Post;
    use App\Models\User;

    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    })->scopeBindings();
```

Ou você pode instruir um grupo inteiro de definições de rota a usar ligações com escopo:

```php
    Route::scopeBindings()->group(function () {
        Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
            return $post;
        });
    });
```

Da mesma forma, você pode instruir explicitamente o Laravel para não vincular um escopo ao invocar o método `withoutScopedBindings`:

```php
    Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
        return $post;
    })->withoutScopedBindings();
```

#### Personalizar o comportamento de modelos ausentes
Normalmente, uma resposta HTTP 404 é gerado se um modelo vinculado implicitamente não for encontrado. No entanto, você pode personalizar esse comportamento chamando o método `missing` ao definir sua rota. O método `missing` aceita uma chave que será invocada se um modelo vinculado implicitamente não puder ser encontrado:

```php
    use App\Http\Controllers\LocationsController;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Redirect;

    Route::get('/locations/{location:slug}', [LocationsController::class, 'show'])
            ->name('locations.view')
            ->missing(function (Request $request) {
                return Redirect::route('locations.index');
            });
```

### Vinculação implícita de enumeração
O PHP 8.1 introduziu suporte para [Enums](https://www.php.net/manual/en/language.enumerations.backed.php). Para complementar esse recurso, o Laravel permite que você especifique um tipo de dado com um [Enum backed](https://www.php.net/manual/en/language.enumerations.backed.php) na definição da rota e o Laravel só invocará a rota se esse segmento corresponde à uma rota valida Enum. Caso contrário, será retornada automaticamente uma resposta HTTP 404. Por exemplo, considerando o seguinte Enum:

```php
<?php

namespace App\Enums;

enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

Você pode definir uma rota que somente será invocada se o segmento da rota "{category}" for "fruits" ou "people". Caso contrário, o Laravel retornará uma resposta do tipo HTTP 404:

```php
use App\Enums\Category;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

### Vinculo explícito
Você não precisa usar a resolução de modelo baseada em convenções implícitas do Laravel para usar o vinculamento de modelo. Também é possível definir explicitamente como os parâmetros da rota se correlacionam com modelos. Para registrar um vínculo explícito, use o método `model` do roteador para especificar a classe para um determinado parâmetro. Defina seus vinculamentos de modelo explícitos no início do método `boot` da sua classe `AppServiceProvider`:

```php
    use App\Models\User;
    use Illuminate\Support\Facades\Route;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Route::model('user', User::class);
    }
```

Em seguida, defina uma rota que contenha um parâmetro `{user}`:

```php
    use App\Models\User;

    Route::get('/users/{user}', function (User $user) {
        // ...
    });
```

Uma vez que estamos associando todos os parâmetros `{user}` ao modelo `App\Models\User`, será injetada uma instância dessa classe na rota. Dessa forma, por exemplo, o pedido `users/1` injetará a instância de `User` no banco de dados com um ID de 1.

Se não for encontrada nenhuma instância de modelo correspondente no banco de dados, será gerado automaticamente um resposta de erro HTTP 404.

#### Personalizar a lógica de resolução
Se pretender definir a sua própria lógica de resolução para o mapeamento do modelo, pode utilizar a metodologia `Route::bind`. A closure que transmite para a metodologia `bind` irá receber o valor do segmento URI e deve retornar uma instância da classe que deve ser injetada na rota. Novamente, esta personalização deve ter lugar no método de inicialização do seu serviço `AppServiceProvider`:

```php
    use App\Models\User;
    use Illuminate\Support\Facades\Route;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Route::bind('user', function (string $value) {
            return User::where('name', $value)->firstOrFail();
        });
    }
```

Como alternativa, você pode reverter a ordem das rotas no método `resolveRouteBinding`. Esse método recebe o valor do segmento de URI e deve retornar a instância da classe que deve ser injetada na rota:

```php
    /**
     * Recuperar o modelo para um valor vinculado.
     *
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('name', $value)->firstOrFail();
    }
```

Se uma rota estiver utilizando um escopo de vinculo implícito, a método `resolveChildRouteBinding` será usado para resolver o vinculo de nível filial do modelo principal:

```php
    /**
     * Recuperar o modelo filho para um valor vinculado.
     *
     * @param  string  $childType
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveChildRouteBinding($childType, $value, $field)
    {
        return parent::resolveChildRouteBinding($childType, $value, $field);
    }
```

## Rotas substitutas
Usando o método `Route::fallback`, você pode definir uma rota que será executada quando nenhuma outra rota corresponder à solicitação recebida. Normalmente, os pedidos não tratados renderizarão automaticamente uma página "404" através do controlador de exceções da sua aplicação. No entanto, como normalmente você define a rota `fallback` na arquivo `routes/web.php`, todos os middlewares do grupo `web` serão aplicados à rota. Você está livre para adicionar middlewares adicionais a esta rota conforme necessário:

```php
    Route::fallback(function () {
        // ...
    });
```

::: warning ATENÇÃO
A rota alternativa deve ser sempre a última rota registrada pelo seu aplicativo.
:::

## Limitação de taxas

### Definindo limiteadores de velocidade
O Laravel inclui serviços poderosos e personalizáveis de restrição de taxas que você pode utilizar para restringir a quantidade de tráfego para uma determinada rota ou grupo de rotas. Para começar, defina as configurações do limitador de taxas de acordo com as necessidades da sua aplicação.

Os limites de taxa podem ser definidos no método `boot` da classe `App\Providers\AppServiceProvider` da aplicação:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
protected function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });
}
```

Os limitadores de velocidade são definidos usando o método `for` da facade `RateLimiter`. O método `for` aceita um nome do limitador de velocidade e uma closure que retorna a configuração do limite que deve ser aplicada às rotas atribuídas ao limitador. As configurações dos limites são instâncias da classe `Illuminate\Cache\RateLimiting\Limit`. Esta classe contém métodos úteis de "construtor" para que você possa definir rapidamente seu limite. O nome do limitador pode ser qualquer string desejada:

```php
    use Illuminate\Cache\RateLimiting\Limit;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\RateLimiter;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    protected function boot(): void
    {
        RateLimiter::for('global', function (Request $request) {
            return Limit::perMinute(1000);
        });
    }
```

Se o pedido recebido exceder o limite especificado de taxa, uma resposta com um código HTTP 429 será retornada automaticamente pelo Laravel. Se você quiser definir a sua própria resposta que deve ser retornada por um limite de taxas, poderá usar o método `response`:

```php
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(1000)->response(function (Request $request, array $headers) {
            return response('Custom response...', 429, $headers);
        });
    });
```

Como os chamados de retorno do limitador de taxa recebem a instância da solicitação HTTP, você poderá criar uma limitação dinamicamente baseada na solicitação ou no usuário autenticado:

```php
    RateLimiter::for('uploads', function (Request $request) {
        return $request->user()->vipCustomer()
                    ? Limit::none()
                    : Limit::perMinute(100);
    });
```

#### Limites de velocidade por segmento
Por vezes você poderá querer segmentar limites de taxa com base em um valor aleatório. Por exemplo, poderá permitir que os utilizadores acedam a uma determinada rota 100 vezes por minuto por endereço IP. Para tal pode utilizar o método `by` quando estiver a construir o seu limite de taxa:

```php
    RateLimiter::for('uploads', function (Request $request) {
        return $request->user()->vipCustomer()
                    ? Limit::none()
                    : Limit::perMinute(100)->by($request->ip());
    });
```

Para ilustrar esse recurso com outro exemplo, podemos limitar o acesso à rota até 100 vezes por minuto para cada identificador de usuário autenticado ou 10 vezes por minuto para cada endereço IP:

```php
    RateLimiter::for('uploads', function (Request $request) {
        return $request->user()
                    ? Limit::perMinute(100)->by($request->user()->id)
                    : Limit::perMinute(10)->by($request->ip());
    });
```

#### Múltiplos limites de taxa
Se necessário, você pode retornar um array de limites de taxa para uma determinada configuração de limitador de taxas. Cada limite de taxa será avaliado para a rota com base na ordem em que eles são colocados dentro do array:

```php
    RateLimiter::for('login', function (Request $request) {
        return [
            Limit::perMinute(500),
            Limit::perMinute(3)->by($request->input('email')),
        ];
    });
```

### Atribuição de limite de velocidade a rotas
Os limitadores de taxa podem ser adicionados a rotas ou grupos de rota usando o [middleware](/docs/middleware) `throttle`. O middleware "throttle" aceita o nome do limitador de taxa que você deseja atribuir à rota:

```php
    Route::middleware(['throttle:uploads'])->group(function () {
        Route::post('/audio', function () {
            // ...
        });

        Route::post('/video', function () {
            // ...
        });
    });
```

#### Limitação com o Redis
Por padrão, o middleware `throttle` está mapeado para a classe `Illuminate\Routing\Middleware\ThrottleRequests`. No entanto, se estiver a usar o Redis como driver de cache da sua aplicação, poderá querer orientar o Laravel a utilizar Redis para gerir a limitação por tempo de solicitações. Para tal, deverá usar o método `throttleWithRedis` no ficheiro `bootstrap/app.php` da aplicação. Este método mapeia o middleware `throttle` para a classe `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis`:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->throttleWithRedis();
        // ...
    })
```

## Falsificação de método de formulário
As ações `PUT`, `PATCH` e `DELETE` não são suportadas nos formulários HTML. Por conseguinte, quando se definirem rotas `PUT`, `PATCH` ou `DELETE` que forem chamadas a partir de um formulário HTML, será necessário adicionar um campo escondido `_method`. O valor enviado no campo `_method` será utilizado como o método da solicitação HTTP:

```php
    <form action="/example" method="POST">
        <input type="hidden" name="_method" value="PUT">
        <input type="hidden" name="_token" value="{{ csrf_token() }}">
    </form>
```

Para conveniência, você pode usar a [diretiva do Blade](/docs/blade) `@metod` para gerar o campo de entrada `_method`:

```php
    <form action="/example" method="POST">
        @method('PUT')
        @csrf
    </form>
```

## Acessando à rota atual
É possível usar as funções `current`, `currentRouteName`, e `currentRouteAction` disponibilizadas pela facade `Route`, para acessar informações sobre a rota que está atendendo a requisição:

```php
    use Illuminate\Support\Facades\Route;

    $route = Route::current(); // Illuminate\Routing\Route
    $name = Route::currentRouteName(); // string
    $action = Route::currentRouteAction(); // string
```

 Você pode consultar a documentação da API para o [classe subjacente da facade Route](https://laravel.com/api/Illuminate/Routing/Router.html) e [instância de rotas](https://laravel.com/api/Illuminate/Routing/Route.html), para revisar todos os métodos disponíveis nas classes roteador e de rota.

## Partilha de recursos entre origens (CORS)
O Laravel pode responder automaticamente a solicitações HTTP CORS com valores que você configurar. As solicitações `OPTIONS` serão tratadas automaticamente pelo middleware [`HandleCors`](/docs/middleware) incluído automaticamente na pilha de middlewares globais da sua aplicação.

Às vezes, você pode precisar personalizar os valores de configuração do CORS para a sua aplicação. Você pode fazer isso publicando o arquivo de configuração `cors` usando o comando Artisan `config:publish`:

```shell
php artisan config:publish cors
```

Este comando colocará um arquivo de configuração `cors.php` dentro do diretório `config` da sua aplicação.

::: info NOTA
Para obter mais informações sobre CORS e cabeçalhos CORS, consulte a [documentação da web do MDN sobre CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers).
:::

## Roteamento com Cache
Ao implantar seu aplicativo na produção, você deve usar o cache de rotas do Laravel. Usando o cache de rotas reduz drasticamente o tempo gasto para registrar todas as rotas do aplicativo. Para gerar um cache de rota, execute o comando `route:cache` do Artisan:

```shell
php artisan route:cache
```

Após executar este comando, o arquivo de rotas em cache será carregado para todas as solicitações. Lembre-se que é preciso gerar um novo cache de rota caso sejam adicionadas novas rotas. Por este motivo, você só deve executar o comando `route:cache` durante a implantação do seu projeto.

Você pode usar o comando `route:clear` para limpar a cache de rotas:

```shell
php artisan route:clear
```
