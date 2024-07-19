# Controladores

## Introdução
Em vez de definir toda a lógica do manuseamento dos pedidos com closures nos seus arquivos de rota, você pode organizar esse comportamento usando classes "controller". Os controladores permitem agrupar o código correspondente ao manuseio de solicitações em uma única classe. Por exemplo, a classe `UserController` pode lidar com todas as solicitações recebidas relacionadas aos usuários, como mostrar informações, criar, atualizar e excluir os usuários. Por padrão, os controladores são armazenados no diretório `app/Http/Controllers`.

## Escrevendo Controladores

### Controladores básicos
Para gerar rapidamente um novo controlador, você pode executar o comando do Artisan `make:controller`. Por padrão, todos os controladores da sua aplicação estão armazenados no diretório `app/Http/Controllers`:

```shell
php artisan make:controller UserController
```

Vamos dar uma olhada em um exemplo de um controlador básico. Um controlador pode ter vários métodos públicos que responderão a solicitações HTTP:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Mostrar o perfil de um determinado usuário.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

Depois de ter escrito uma classe e um método do controlador, você pode definir uma rota para o método do controlador da seguinte maneira:

```php
    use App\Http\Controllers\UserController;

    Route::get('/user/{id}', [UserController::class, 'show']);
```

Quando um pedido de entrada for correspondente ao endereço especificado na URI da rota, o método `show` na classe `App\Http\Controllers\UserController` será acionada e os parâmetros da rota serão passados para o método.

::: info ANTEÇÃO
Os controladores não são necessariamente **exigidos** para estender uma classe base. No entanto, por vezes é mais útil estender uma classe controller de base que contém métodos invés de partilhar entre todos os controladores.
:::

### Controladores de ação única
Se um controlador de ação for especialmente complexo, poderá ser conveniente criar uma classe controladora especificamente para essa única ação. Para isso, vocÊ pode definir um método único `__invoke`:

```php
<?php

namespace App\Http\Controllers;

class ProvisionServer extends Controller
{
    /**
     * Provisione um novo servidor web.
     */
    public function __invoke()
    {
        // ...
    }
}
```

Ao registrar rotas para os controladores de ação única não será necessário especificar um método do controlador. Pode simplesmente passar o nome do controlador ao roteador:

```php
    use App\Http\Controllers\ProvisionServer;

    Route::post('/server', ProvisionServer::class);
```

Você pode gerar um controlador com métodos invocáveis usando a opção `--invokable` do comando Artisan `make:controller`:

```shell
php artisan make:controller ProvisionServer --invokable
```

::: info NOTA
Os stubs do controlador podem ser personalizados usando [publicação de stub](/docs/artisan#stub-customization).
:::

## Middleware do Controlador
O middleware pode ser atribuído às rotas do controlador nos ficheiros de rota:

```php
    Route::get('profile', [UserController::class, 'show'])->middleware('auth');
```

Ou pode ser conveniente vocÊ especificar o middleware na sua classe de controlador. Para fazer isso, a sua aplicação deve implementar a interface `HasMiddleware`, que determina que o seu controlador deve ter um método estático chamado `middleware`. Neste método você pode retornar uma matriz de middlewares que devem ser aplicados às ações do controlador:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UserController extends Controller implements HasMiddleware
{
    /**
     * Obtenha o middleware que deve ser atribuído ao controlador.
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('log', only: ['index']),
            new Middleware('subscribed', except: ['store']),
        ];
    }

    // ...
}
```

Você também pode definir o middleware do controlador como uma função lambda que fornece uma maneira conveniente de definir um middleware on-line sem escrever uma classe completa de middleware:

```php
    use Closure;
    use Illuminate\Http\Request;

    /**
     * Obtenha o middleware que deve ser atribuído ao controlador.
     */
    public static function middleware(): array
    {
        return [
            function (Request $request, Closure $next) {
                return $next($request);
            },
        ];
    }
```

## Controladores de Recursos
Se você pensar que cada modelo Eloquent da sua aplicação é um "recurso", é comum executar o mesmo conjunto de ações em todos os recursos da sua aplicação. Por exemplo, imagine que sua aplicação contenha o modelo `Photo` e o modelo `Movie`. É provável que o usuário possa criar, ler, atualizar ou excluir esses recursos.

Devido ao caso de uso comum, o roteamento de recursos do Laravel atribui os típicos itens de rotas ("CRUD", que significa "criar, ler, atualizar e excluir") a um controlador com uma única linha de código. Para começar, podemos usar a opção `--resource` da opção `make:controller` do comando Artisan para criar rapidamente um controlador que gerencie essas ações:

```shell
php artisan make:controller PhotoController --resource
```

Este comando gerará um controlador em `app/Http/Controllers/PhotoController.php`. O controlador conterá um método para cada operação de recurso disponível. Em seguida, você pode registrar um caminho de recurso que aponta para o controlador:

```php
    use App\Http\Controllers\PhotoController;

    Route::resource('photos', PhotoController::class);
```

Essa única declaração de rota cria várias rotas para lidar com uma variedade de ações no recurso. O controlador gerado já terá métodos preparados para cada uma dessas ações. Lembre-se que você pode sempre obter um rápido resumo das rotas do seu aplicativo executando o comando `route:list` do Artisan.

Você pode até registrar vários controladores de recursos de uma só vez passando um array para o método `resources`:

```php
    Route::resources([
        'photos' => PhotoController::class,
        'posts' => PostController::class,
    ]);
```

#### Ações manipuladas pelos controladores de recursos

| Verbo     | URI                    | Ação           | Nome da Rota      | 
|-----------|------------------------|----------------|-------------------|
| GET       | `/photos`              | índice         | photos.index      |
| GET       | `/photos/create`       | criar          | photos.create     |
| POST      | `/photos`              | armazenar      | photos.store      |
| GET       | `/photos/{photo}`      | mostrar        | photos.show       |
| GET       | `/photos/{photo}/edit` | editar         | photos.edit       |
| PUT/PATCH | `/photos/{photo}`      | atualizar      | photos.update     |
| DELETE    | `/photos/{photo}`      | destruir       | photos.destroy    |

#### Personalizar o comportamento do modelo ausente
Normalmente, o erro HTTP de resposta 404 será gerado se não existir um modelo de recurso associado implicitamente. No entanto, você pode personalizar este comportamento chamando a função `missing` ao definir a rota do recurso. A função `missing` aceita uma closure que serão acionadas sempre que o modelo de recurso associado não for encontrado para qualquer um dos itens do recurso:

```php
    use App\Http\Controllers\PhotoController;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Redirect;

    Route::resource('photos', PhotoController::class)
            ->missing(function (Request $request) {
                return Redirect::route('photos.index');
            });
```

#### Modelos apagados com soft-delete
Normalmente, o mapeamento de modelo implícito não recuperará modelos que tenham sido [excluídos por omissão](/docs/eloquent#omission-deletion), e, em vez disso, retornará uma resposta 404 HTTP. No entanto, você pode instruir o framework a permitir modelos excluídos por omissão invocando o método `withTrashed` ao definir sua rota de recurso:

```php
    use App\Http\Controllers\PhotoController;

    Route::resource('photos', PhotoController::class)->withTrashed();
```

Chamar `withTrashed` sem argumentos permitirá modelos excluídos de forma reversível para as rotas de recursos `show`, `edit` e `update`. Você pode especificar um subconjunto dessas rotas passando um array para o método `withTrashed`:

```php
    Route::resource('photos', PhotoController::class)->withTrashed(['show']);
```

#### Especificando o modelo de recursos
Se você estiver utilizando o [mapeamento de modelo de rota](/docs/routing#route-model-binding) e desejar que os métodos do controlador de recursos indiquem um tipo para uma instância do modelo, você pode usar a opção `--model` ao gerar o controlador:

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

#### Gerar Pedidos de Formulário
Você pode fornecer a opção `--requests` ao gerar um controlador de recursos para instruir o Artisan a criar classes [de solicitação do formulário](/docs/validation#form-request-validation) para os métodos de armazenamento e atualização do controlador:

```shell
php artisan make:controller PhotoController --model=Photo --resource --requests
```

### Rotas parciais de recurso
Ao declarar uma rota de recursos, é possível especificar um subconjunto de ações que o controlador deve processar, em vez do conjunto completo de ações por padrão.

```php
    use App\Http\Controllers\PhotoController;

    Route::resource('photos', PhotoController::class)->only([
        'index', 'show'
    ]);

    Route::resource('photos', PhotoController::class)->except([
        'create', 'store', 'update', 'destroy'
    ]);
```

#### Rotas do recurso da API
Ao declarar rotas de recursos que serão consumidas por APIs, é comum querer excluir as rotas que apresentam modelos HTML, como `create` e `edit`. Para maior conveniência, você pode usar o método `apiResource` para automaticamente excluir essas duas rotas:

```php
    use App\Http\Controllers\PhotoController;

    Route::apiResource('photos', PhotoController::class);
```

Você pode registrar muitos controladores de recursos da API de uma só vez, passando um array para o método `apiResources`:

```php
    use App\Http\Controllers\PhotoController;
    use App\Http\Controllers\PostController;

    Route::apiResources([
        'photos' => PhotoController::class,
        'posts' => PostController::class,
    ]);
```

Para gerar rapidamente um controlador de recursos da API que não inclui os métodos `create` ou `edit`, utilize a opção `--api` ao executar o comando `make:controller`:

```shell
php artisan make:controller PhotoController --api
```

### Recursos aninhados
Às vezes você precisa definir rotas para um recurso aninhado. Por exemplo, um recurso de foto pode ter vários comentários que podem ser anexados à foto. Para aninhar os controladores de recursos, você pode usar a notação de "ponto" na declaração da rota:

```php
    use App\Http\Controllers\PhotoCommentController;

    Route::resource('photos.comments', PhotoCommentController::class);
```

Este caminho irá registrar um recurso aninhado que poderá ser acessado com as seguintes URLs:

```php
    /photos/{photo}/comments/{comment}
```

#### Delimitação de recursos aninhados
O recurso de vinculação de modelo implícito do Laravel ([vinculação de modelo implícito de roteamento](/docs/routing#implicit-model-binding-scoping)) pode agilizar automaticamente a vinculação dos modelos filhos, de forma que o modelo filho resolvido seja confirmado como pertencente ao modelo pai. Ao definir um recurso aninhado, você pode habilitar a vinculação automática e indicar ao Laravel qual campo o recurso filho deve ser recuperado por meio do método `scoped`. Para mais informações sobre como fazer isto, consulte a documentação sobre [vinculação de rotas de recursos com escopo](/docs/rest#restful-scoping-resource-routes).

#### Aninhamento raso
Normalmente, não é necessário incluir o ID do pai e da criança numa URI pois o ID de filho já é um identificador único. No entanto, se pretender usar um identificador único como, por exemplo, uma chave primária com incremento automático para identificar os modelos nos segmentos das URLs, você pode escolher "aninhar" em camadas:

```php
    use App\Http\Controllers\CommentController;

    Route::resource('photos.comments', CommentController::class)->shallow();
```

Esta definição irá definir as seguintes rotas:

| Verbo     | URL                               | Ação         | Nome de Rota           |
|-----------|-----------------------------------|--------------|------------------------|
| GET       | `/photos/{photo}/comments`        | index        | photos.comments.index  |
| GET       | `/photos/{photo}/comments/create` | create       | photos.comments.create |
| POST      | `/photos/{photo}/comments`        | store        | photos.comments.store  |
| GET       | `/comments/{comment}`             | show         | comments.show          |
| GET       | `/comments/{comment}/edit`        | edit         | comments.edit          |
| PUT/PATCH | `/comments/{comment}`             | update       | comments.update        |
| DELETE    | `/comments/{comment}`             | destroy      | comments.destroy       |

### Nomear as rotas de recursos
Por padrão, todas as ações de controlador de recursos têm um nome de rota. No entanto, você pode substituir esses nomes passando uma matriz `names` com os nomes das rotas desejadas:

```php
    use App\Http\Controllers\PhotoController;

    Route::resource('photos', PhotoController::class)->names([
        'create' => 'photos.build'
    ]);
```

### Definição de parâmetros de rota de recursos
Por padrão, o comportamento da função `Route::resource` é criar parâmetros de rota para seu recurso baseado na versão "singularizada" do nome do recurso. Você pode facilmente redefinir isto caso a caso usando o método `parameters`. A matriz enviada ao método `parameters` deve ser um array associativo de nomes de recursos e nomes de parâmetros:

```php
    use App\Http\Controllers\AdminUserController;

    Route::resource('users', AdminUserController::class)->parameters([
        'users' => 'admin_user'
    ]);
```

O exemplo acima gera a seguinte URI para a rota de 'mostrar' o recurso:

```
    /users/{admin_user}
```

### Escopo de rotas de recursos
A funcionalidade de [vinculação automática de modelo com escopo](/docs/routing#implicit-model-binding-scoping) do Laravel permite o vinculo de modelos implícitos aninhados, garantindo que o modelo filho resolvido pertence ao modelo pai. Ao utilizar o método `scoped` para definir o recurso filho aninhado, você pode ativar a vinculação automática e especificar qual campo deve ser utilizado para recuperar o recurso filho:

```php
    use App\Http\Controllers\PhotoCommentController;

    Route::resource('photos.comments', PhotoCommentController::class)->scoped([
        'comment' => 'slug',
    ]);
```

Essa rota registrará um recurso aninhado com escopo que poderá ser acessado com as seguintes URI:

```
    /photos/{photo}/comments/{comment:slug}
```

Quando é utilizada uma ligação implícita personalizada como um parâmetro da rota aninhado, Laravel irá automatizar o escopo da consulta para recuperar o modelo aninhado com base no seu pai, utilizando convenções para adivinhar o nome da relação no pai. Neste caso, presume-se que o modelo `Photo` tem uma relação chamada `comments`, em português (o plural do nome de parâmetro da rota), a qual pode ser utilizada para recuperar o modelo `Comment`.

### Localizar os endereços de recurso
Por padrão, o `Route::resource` criará URIs de recursos usando verbos e regras de pluralidade em inglês. Se for necessário localizar os verbos das ações "criar" e "editar", você pode usar o método `Route::resourceVerbs`. Isso pode ser feito no início da chamada `boot` dentro do `App\Providers\AppServiceProvider` da sua aplicação:

```php
    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Route::resourceVerbs([
            'create' => 'crear',
            'edit' => 'editar',
        ]);
    }
```

O pluralizer do Laravel suporta [vários idiomas que você pode configurar de acordo com suas necessidades](/docs/localization#pluralization-language). Depois que os verbos e a língua da pluralização foram personalizados, uma inscrição do recurso na rota como `Route::resource('publicacion', PublicacionController::class)` produzirá os seguintes endereços URI:

```
    /publicacion/crear

    /publicacion/{publicaciones}/editar
```

### Complementando controladores de recursos
Se você precisar adicionar rotas adicionais a um controlador de recursos além do conjunto padrão de rotas de recurso, você deve definir essas rotas antes de sua chamada para o método `Route::resource`; caso contrário, as rotas definidas pelo método `resource` podem tomar precedência inadvertidamente em relação às suas rotas complementares:

```php
    use App\Http\Controller\PhotoController;

    Route::get('/photos/popular', [PhotoController::class, 'popular']);
    Route::resource('photos', PhotoController::class);
```

::: info NOTA
Lembre-se de manter seus controladores focados. Se você sentir que normalmente precisa de métodos fora do conjunto típico de ações do recurso, considere dividir seu controlador em dois controladores menores.
:::

### Controladores de recursos do tipo Singleton
Por vezes, o seu aplicativo tem recursos que podem apenas ter uma única instância. Por exemplo, um "perfil" de utilizador pode ser editado ou atualizado, mas um utilizador não pode ter mais do que um "perfil". Do mesmo modo, uma imagem pode ter uma única "miniatura". Estes recursos são chamados de "recursos singleton", o que significa que apenas existe uma e única instância do recurso. Nestas situações, poderá registrar um controlador de recurso singleton:

```php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::singleton('profile', ProfileController::class);
```

A definição de recurso singleton acima irá registrar os seguintes roteiros. Como você pode ver, as rotas "creation" não são registrados para recursos singleton, e os roteiros registrados não aceitam um identificador uma vez que apenas existe uma instância do recurso:

| Verbo     | URL                               | Ação         | Nome de rota         |
|-----------|-----------------------------------|--------------|----------------------|
| GET       | `/profile`                        | show         | profile.show         |
| GET       | `/profile/edit`                   | edit         | profile.edit         |
| PUT/PATCH | `/profile`                        | update       | profile.update       |

Os recursos singleton podem também ser aninhados dentro de um recurso padrão:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class);
```

Neste exemplo, o recurso `photos` receberia todas as [rotas de recursos padrão](#actions-handled-by-resource-controller); no entanto, o recurso `thumbnail` seria um recurso de tipo único com as seguintes rotas:

| Verbo     | URL                               |  Ação   |  Nome da Rota            |
|-----------|-----------------------------------|---------|--------------------------|
| GET       | `/photos/{photo}/thumbnail`       | show    | photos.thumbnail.show    |
| GET       | `/photos/{photo}/thumbnail/edit`  | edit    | photos.thumbnail.edit    |
| PUT/PATCH | `/photos/{photo}/thumbnail`       | update  | photos.thumbnail.update  |

#### Recursos Singleton Criáveis

Ocasionalmente, você pode querer definir rotas de criação e armazenamento para um recurso singleton. Para fazer isso, você poderá invocar o método `creatable` ao registrar a rota do recurso singleton:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class)->creatable();
```

Neste exemplo, serão registradas as seguintes rotas. Como você pode ver, uma rota `DELETE` também será registrada para recursos singleton criáveis:

| Verbo     | URI                                 | Ação    | Nome da Rota             |
|-----------|-------------------------------------|---------|--------------------------|
| GET       | `/photos/{photo}/thumbnail/create`  | create  | photos.thumbnail.create  |
| POST      | `/photos/{photo}/thumbnail`         | store   | photos.thumbnail.store   |
| GET       | `/photos/{photo}/thumbnail`         | show    | photos.thumbnail.show    |
| GET       | `/photos/{photo}/thumbnail/edit`    | edit    | photos.thumbnail.edit    |
| PUT/PATCH | `/photos/{photo}/thumbnail`         | update  | photos.thumbnail.update  |
| DELETE    | `/photos/{photo}/thumbnail`         | destroy | photos.thumbnail.destroy |

Se você quiser que o Laravel registre a rota `DELETE` para um recurso singleton, mas não registre as rotas de criação ou armazenamento, você pode utilizar o método `destroyable`:

```php
Route::singleton(...)->destroyable();
```

#### Recursos singleton de API
O método `apiSingleton` pode ser usado para registrar um recurso singleton que será manipulado por meio de uma API, tornando os caminhos `create` e `edit` desnecessários:

```php
Route::apiSingleton('profile', ProfileController::class);
```

Claro que os recursos singleton da API também podem ser criáveis, o que irá registrar rotas de armazenamento e destruição para o recurso:

```php
Route::apiSingleton('photos.thumbnail', ProfileController::class)->creatable();
```

## Injeção de dependência e controladores

#### Injeção de construtores
O [conjunto de serviços Laravel](/docs/container) é utilizado para resolver todos os controladores do Laravel. Como resultado, pode fornecer o tipo-hint para quaisquer dependências que possa precisar no seu construtor. As dependências declaradas serão automaticamente resolvidas e injetadas na instância do controlador:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * Crie uma nova instância de controlador.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}
}
```

#### Método de injeção
Além da injeção de construtores, você também pode indicar tipos de dependência para os métodos do seu controlador. Um caso comum de injeção de método é injetar a instância `Illuminate\Http\Request` nos métodos do seu controlador:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Armazene um novo usuário.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->name;

        // Armazene o usuário...

        return redirect('/users');
    }
}
```

Se o método do controlador estiver esperando também a entrada de um parâmetro da rota, liste os argumentos da rota após suas outras dependências. Por exemplo, se a rota tiver sido definida assim:

```php
    use App\Http\Controllers\UserController;

    Route::put('/user/{id}', [UserController::class, 'update']);
```

Você ainda poderá indicar o tipo do objeto `Illuminate\Http\Request` e acessar seu parâmetro `id`, definindo sua metodologia de controle da seguinte forma:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * Atualize o usuário fornecido.
         */
        public function update(Request $request, string $id): RedirectResponse
        {
            // Atualize o usuário...

            return redirect('/users');
        }
    }
```
