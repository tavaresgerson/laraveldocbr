# Controladores

## Introdução
Em vez de definir toda a lógica de tratamento de sua solicitação como encerramentos em seus arquivos de rota, você pode desejar organizar esse 
comportamento usando classes de "controlador". Os controladores podem agrupar a lógica de tratamento de solicitações relacionadas em uma única 
classe. Por exemplo, uma classe `UserController` pode lidar com todas as solicitações de entrada relacionadas aos usuários, incluindo mostrar, 
criar, atualizar e excluir usuários. Por padrão, os controladores são armazenados no diretório `app/Http/Controllers`.

## Escrevendo Controladores

### Controladores básicos
Vamos dar uma olhada em um exemplo de controlador básico. Observe que o controlador estende a classe de controladores base incluída no 
Laravel `App\Http\Controllers\Controller`::

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Show the profile for a given user.
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function show($id)
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

Você pode definir uma rota para este método de controlador assim:

```php
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

Quando uma solicitação de entrada corresponde ao URI de rota especificado, o método `show` na classe `App\Http\Controllers\UserController` 
é chamado e os parâmetros de rota são passados para o método.

> Os controladores não são obrigados a estender uma classe base. No entanto, você não terá acesso a recursos convenientes, 
> como os métodos `middleware` e `authorize`.

### Controladores de ação única
Se uma ação do controlador for particularmente complexa, você pode achar conveniente dedicar uma classe inteira do controlador para aquela 
única ação. Para fazer isso, você pode definir um único método `__invoke` dentro do controlador:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;

class ProvisionServer extends Controller
{
    /**
     * Provision a new web server.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function __invoke()
    {
        // ...
    }
}
```

Ao registrar rotas para controladores de ação única, você não precisa especificar um método de controlador. Em vez disso, você pode 
simplesmente passar o nome do controlador para o roteador:

```php
use App\Http\Controllers\ProvisionServer;

Route::post('/server', ProvisionServer::class);
```

Você pode gerar um controlador _invokable_ usando a `--invokable` opção do comando Artisan `make:controller`:

```bash
php artisan make:controller ProvisionServer --invokable
```

> Os stubs do controlador podem ser personalizados usando a [publicação stub](https://laravel.com/docs/8.x/artisan#stub-customization)

## Middleware de controlador
O middleware pode ser atribuído às rotas do controlador em seus arquivos de rota:

```bash
Route::get('profile', [UserController::class, 'show'])->middleware('auth');
```

Ou você pode achar conveniente especificar middleware dentro do construtor de seu controlador. Usando o método `middleware` dentro do 
construtor do seu controlador, você pode atribuir middleware às ações do controlador:

```php
class UserController extends Controller
{
    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('log')->only('index');
        $this->middleware('subscribed')->except('store');
    }
}
```

Os controladores também permitem que você registre o middleware usando um encerramento. Isso fornece uma maneira conveniente de definir 
um middleware embutido para um único controlador sem definir uma classe de middleware inteira:

```php
$this->middleware(function ($request, $next) {
    return $next($request);
});
```

### Controladores de recursos
Se você pensar em cada modelo do Eloquent em seu aplicativo como um "recurso", é comum executar os mesmos conjuntos de ações em cada 
recurso em seu aplicativo. Por exemplo, imagine que seu aplicativo contém um modelo `Photo` e um modelo `Movie`. É provável que os 
usuários possam criar, ler, atualizar ou excluir esses recursos.

Por causa deste caso de uso comum, o roteamento de recursos do Laravel atribui as rotas típicas de criação, leitura, atualização e exclusão 
("CRUD") para um controlador com uma única linha de código. Para começar, podemos usar a opção `make:controller` do Artisan com `--resource` 
para criar rapidamente um controlador para lidar com estas ações:

```bash
php artisan make:controller PhotoController --resource
``` 

Este comando irá gerar um controlador em `app/Http/Controllers/PhotoController.php`. O controlador conterá um método para cada uma das operações 
de recursos disponíveis. Em seguida, você pode registrar uma rota de recurso que aponta para o controlador:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class);
```

Essa declaração de rota única cria várias rotas para lidar com uma variedade de ações no recurso. O controlador gerado já terá métodos fragmentados 
para cada uma dessas ações. Lembre-se, você sempre pode obter uma visão geral rápida do seu aplicativo executando o comando Artisan `route:list`.

Você pode até registrar muitos controladores de recursos de uma vez, passando um array para o método `resources`:

```php
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

#### Ações tratadas pelo controlador de recursos

| Verbo     | URI                     | Açao    | Nome da Rota  |
|-----------|-------------------------|---------|---------------|
| GET       |	`/photos`               |	index	  | photos.index  |
| GET	      | `/photos/create`	      | create  | photos.create |
| POST	    | `/photos`	              | store	  | photos.store  |
| GET	      | `/photos/{photo}`	      | show	  | photos.show   |
| GET	      | `/photos/{photo}/edit`  | edit	  | photos.edit   |
| PUT/PATCH	| `/photos/{photo}`	      | update	| photos.update |
| DELETE	  | `/photos/{photo}`	      | destroy	| photos.destroy|

#### Especificando o modelo de recursos

Se você estiver usando a vinculação do modelo de rota e gostaria que os métodos do controlador de recursos sugerissem uma instância do modelo, 
você pode usar a opção `--model` ao gerar o controlador:

```bash
php artisan make:controller PhotoController --resource --model=Photo
```

### Rotas de recursos parciais

Ao declarar uma rota de recurso, você pode especificar um subconjunto de ações que o controlador deve gerenciar em vez do conjunto completo de 
ações padrão:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->only([
    'index', 'show'
]);

Route::resource('photos', PhotoController::class)->except([
    'create', 'store', 'update', 'destroy'
]);
```

### Rotas de recursos de API

Ao declarar rotas de recursos que serão consumidas por APIs, você normalmente desejará excluir rotas que apresentam modelos HTML como `create` e `edit`. 
Por conveniência, você pode usar o método `apiResource` para excluir automaticamente essas duas rotas:

```php
use App\Http\Controllers\PhotoController;

Route::apiResource('photos', PhotoController::class);
```

Você pode registrar vários controladores de recursos de API de uma vez, passando um array para o método `apiResources`:

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PostController;

Route::apiResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

Para gerar rapidamente um controlador de recurso de API que não inclua os métodos `create` ou `edit`, use a opção `--api` ao executar o comando
`make:controller`:

```bash
php artisan make:controller API/PhotoController --api
```

### Recursos Aninhados
Às vezes, você pode precisar definir rotas para um recurso aninhado. Por exemplo, um recurso de foto pode ter vários comentários que podem ser 
anexados à foto. Para aninhar os controladores de recursos, você pode usar a notação de "ponto" em sua declaração de rota:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class);
```

Esta rota registrará um recurso aninhado que pode ser acessado com URIs como a seguinte:
```
/photos/{photo}/comments/{comment}
```

#### Definição do escopo de recursos aninhados

O recurso de associação de modelo implícito do Laravel pode definir automaticamente o escopo de associações aninhadas de forma 
que o modelo filho resolvido seja confirmado como pertencente ao modelo pai. Usando o método `scoped` ao definir seu recurso aninhado, 
você pode habilitar o escopo automático e também instruir o Laravel por qual campo o recurso filho deve ser recuperado. Para obter mais 
informações sobre como fazer isso, consulte a documentação sobre o escopo de rotas de recursos.

#### Aninhamento Raso
Freqüentemente, não é totalmente necessário ter os IDs pai e filho em um URI, pois o ID filho já é um identificador exclusivo. Ao usar 
identificadores exclusivos, como chaves primárias de incremento automático para identificar seus modelos em segmentos de URI, você pode 
optar por usar o "aninhamento superficial":

```php
use App\Http\Controllers\CommentController;

Route::resource('photos.comments', CommentController::class)->shallow();
```

Esta definição de rota irá definir as seguintes rotas:

| Verbo	      | URI	                              | Ação	    | Nome da Rota            |
|-------------|-----------------------------------|-----------|-------------------------|
| GET	        | /photos/{photo}/comments	        | index	    | photos.comments.index   |
| GET	        | /photos/{photo}/comments/create	  | create	  | photos.comments.create  |
| POST	      | /photos/{photo}/comments	        | store	    | photos.comments.store   |
| GET	        | /comments/{comment}	              | show      | comments.show           |
| GET	        | /comments/{comment}/edit	        | edit	    | comments.edit           |
| PUT/PATCH	  | /comments/{comment}	              | update	  | comments.update         |
| DELETE	    | /comments/{comment}	              | destroy	  | comments.destroy        |


### Nomeando Rotas de Recursos
Por padrão, todas as ações do controlador de recursos têm um nome de rota; no entanto, você pode substituir esses nomes passando uma matriz `names` 
com os nomes de rota desejados:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->names([
    'create' => 'photos.build'
]);
```

Nomeando Parâmetros
Por padrão, `Route::resource` criará os parâmetros de rota para suas rotas de recursos com base na versão "singularizada" do nome do recurso. 
Você pode facilmente substituir isso do recurso usando o método `parameters`. A matriz passada para o método `parameters` deve ser uma matriz 
associativa de nomes de recursos e nomes de parâmetros:

```php
use App\Http\Controllers\AdminUserController;

Route::resource('users', AdminUserController::class)->parameters([
    'users' => 'admin_user'
]);
```

O exemplo acima gera o seguinte URI para a rota do recurso `show`:
```
/users/{admin_user}
```

### Escopo de rotas de recursos

O recurso de [vinculação de modelo implícito com escopo do Laravel](https://laravel.com/docs/8.x/routing#implicit-model-binding-scoping) pode 
definir automaticamente o escopo de vinculações aninhadas de forma que o modelo filho resolvido seja confirmado como pertencente ao modelo pai. 
Usando o método `scoped` ao definir seu recurso aninhado, você pode habilitar o escopo automático, bem como instruir o Laravel qual campo o 
recurso filho deve ser recuperado por:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class)->scoped([
    'comment' => 'slug',
]);
```

Esta rota registrará um recurso aninhado com escopo que pode ser acessado com URIs como o seguinte:

```
/photos/{photo}/comments/{comment:slug}
```

Ao usar uma ligação implícita com chave customizada como um parâmetro de rota aninhada, o Laravel irá automaticamente definir o escopo da 
consulta para recuperar o modelo aninhado por seu pai usando convenções para adivinhar o nome do relacionamento no pai. Nesse caso, será 
assumido que o modelo `Photo` tem um relacionamento denominado `comments` (o plural do nome do parâmetro da rota) que pode ser usado para 
recuperar o modelo `Comment`.

### Localizando URIs de recursos
Por padrão, `Route::resource` criará URIs de recursos usando verbos em inglês. Se precisar localizar os verbos de ação `create` e `edit`, você 
pode usar o método `Route::resourceVerbs`. Isso pode ser feito no início do método `boot` em seu aplicativo `App\Providers\RouteServiceProvider`:

```php
/**
 * Define your route model bindings, pattern filters, etc.
 *
 * @return void
 */
public function boot()
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);

    // ...
}
```

Assim que os verbos forem personalizados, um registro de rota de recurso, como `Route::resource('fotos', PhotoController::class)` produzirá os 
seguintes URIs:

```
/fotos/crear

/fotos/{foto}/editar
```

### Suplementando controladores de recursos
Se você precisar adicionar rotas adicionais a um controlador de recursos além do conjunto padrão de rotas de recursos, você deve definir essas 
rotas antes de sua chamada para o método `Route::resource`; caso contrário, as rotas definidas pelo método `resource` podem acidentalmente ter 
precedência sobre suas rotas suplementares:

```php
use App\Http\Controller\PhotoController;

Route::get('/photos/popular', [PhotoController::class, 'popular']);
Route::resource('photos', PhotoController::class);
```

Lembre-se de manter seus controladores focados. Se você precisa rotineiramente de métodos fora do conjunto típico de ações de recursos, considere 
dividir seu controlador em dois controladores menores.

## Injeção e controladores de dependência

### Injeção de construtor

O container de serviço Laravel é usado para resolver todos os controladores. Como resultado, você é capaz de digitar qualquer dependência 
que seu controlador possa precisar em seu construtor. As dependências declaradas serão resolvidas automaticamente e injetadas na instância 
do controlador:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * The user repository instance.
     */
    protected $users;

    /**
     * Create a new controller instance.
     *
     * @param  \App\Repositories\UserRepository  $users
     * @return void
     */
    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }
}
```

### Método de injeção

Além de injeção de construtor, você também pode digitar dependências de métodos de seu controlador. Um caso de uso comum para injeção de método 
é injetar a instância `Illuminate\Http\Request` em seus métodos de controlador:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Store a new user.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request)
    {
        $name = $request->name;

        //
    }
}
```

Se o seu método de controlador também está esperando entrada de um parâmetro de rota, liste seus argumentos de rota após suas outras 
dependências. Por exemplo, se sua rota é definida assim:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

Você ainda pode digitar `Illuminate\Http\Request` e acessar seu parâmetro `id` definindo seu método de controlador da seguinte maneira:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the given user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }
}
```
