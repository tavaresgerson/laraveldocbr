# Rotas

## Roteamento Básico
As rotas mais básicas do Laravel aceitam um URI e um fechamento, fornecendo um método muito simples e expressivo de definir rotas e comportamento 
sem arquivos de configuração de roteamento complicados:

```php
use Illuminate\Support\Facades\Route;

Route::get('/greeting', function () {
    return 'Hello World';
});
```

### Os arquivos de rota padrão
Todas as rotas do Laravel são definidas em seus arquivos de rota, que estão localizados no diretório `routes`. Esses arquivos são carregados 
automaticamente pelo seu aplicativo através do `App\Providers\RouteServiceProvider`. O arquivo `routes/web.php` define rotas que são para sua 
interface da web. Essas rotas são atribuídas ao grupo `web` de middlewares, que fornece recursos como estado de sessão e proteção contra CSRF. As 
rotas em `routes/api.php` são sem estado e atribuídas ao grupo `api` de middlewares.

Para a maioria dos aplicativos, você começará definindo rotas em seu arquivo `routes/web.php`. As rotas definidas em `routes/web.php` podem ser 
acessadas inserindo a URL da rota definida em seu navegador. Por exemplo, você pode acessar a seguinte rota em seu navegador http://example.com/user:

```php
use App\Http\Controllers\UserController;

Route::get('/user', [UserController::class, 'index']);
```

As rotas definidas no arquivo `routes/api.php` são aninhadas em um grupo de rotas pelo `RouteServiceProvider`. Dentro desse grupo, o prefixo
`/api` é aplicado automaticamente para que você não precise aplicá-lo manualmente a todas as rotas no arquivo. Você pode modificar o prefixo 
e outras opções de grupo de rota, modificando sua classe `RouteServiceProvider`.

### Métodos de roteador disponíveis

O roteador permite registrar rotas que respondem a qualquer verbo HTTP:

```php
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

Às vezes, você pode precisar registrar uma rota que responde a vários verbos HTTP. Você pode fazer isso usando o método `match`. 
Ou você pode até registrar uma rota que responda a todos os verbos HTTP usando o método `any`:

```php
Route::match(['get', 'post'], '/', function () {
    //
});

Route::any('/', function () {
    //
});
```

### Injeção de dependência

Você pode digitar qualquer dependência exigida por sua rota em sua assinatura de retorno de chamada. As dependências declaradas serão 
automaticamente resolvidas e injetadas no callback pelo container de serviço do Laravel. Por exemplo, você pode definir o type-hint da classe
`Illuminate\Http\Request` para que a solicitação HTTP atual seja inserida automaticamente em seu retorno de chamada de rota:

```php
use Illuminate\Http\Request;

Route::get('/users', function (Request $request) {
    // ...
});
```

### Proteção CSRF
Lembre-se, todos os formulários HTML que apontam para rotas `POST`, `PUT`, `PATCH`, ou `DELETE` que são definidos no arquivo `web` de rotas 
deve incluir um campo de token CSRF. Caso contrário, o pedido será rejeitado. Você pode ler mais sobre a proteção contra CSRF na documentação do CSRF:

```html
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

## Redirecionar rotas
Se estiver definindo uma rota que redireciona para outro URI, você pode usar o método `Route::redirect`. Este método fornece um atalho 
conveniente para que você não precise definir uma rota completa ou controlador para realizar um redirecionamento simples:

```php
Route::redirect('/here', '/there');
```

Por padrão, `Route::redirect` retorna um código de status `302`. Você pode personalizar o código de status usando o terceiro parâmetro opcional:

```php
Route::redirect('/here', '/there', 301);
```

Ou você pode usar o método `Route::permanentRedirect` para retornar um código de status `301`:

```php
Route::permanentRedirect('/here', '/there');
```

> Ao usar parâmetros de rota em rotas de redirecionamento, os seguintes parâmetros são reservados pelo 
> Laravel e não podem ser usados: `destination` e `status`.

### Ver rotas
Se sua rota precisa apenas retornar uma visualização, você pode usar o método `Route::view`. Como o método `redirect`, fornece um atalho simples 
para que você não precise definir uma rota ou controlador completo. O método `view` aceita um URI como seu primeiro argumento e um nome de visualização 
como seu segundo argumento. Além disso, você pode fornecer uma matriz de dados para passar para a visualização como um terceiro argumento opcional:

```php
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

> Ao usar os parâmetros da rota em vias de vista, os seguintes parâmetros são reservados pelo Laravel e não pode ser 
> usada: `view`, `data`, `status`, e `headers`.

## Parâmetros de rota

### Parâmetros Requeridos
Às vezes, você precisará capturar segmentos do URI em sua rota. Por exemplo, você pode precisar capturar a ID de um usuário do URL. 
Você pode fazer isso definindo parâmetros de rota:

```php
Route::get('/user/{id}', function ($id) {
    return 'User '.$id;
});
```

Você pode definir quantos parâmetros de rota forem necessários para sua rota:

```php
Route::get('/posts/{post}/comments/{comment}', function ($postId, $commentId) {
    //
});
```

Os parâmetros de rota estão sempre entre colchetes `{}` e devem consistir em caracteres alfabéticos. Sublinhados (\_) também são aceitáveis 
em nomes de parâmetros de rota. Os parâmetros de rota são injetados em retornos de chamada / controladores de rota com base em sua ordem - 
os nomes dos argumentos de retorno de chamada / controlador de rota não importam.

### Parâmetros e injeção de dependência
Se sua rota tem dependências que você gostaria que o container de serviço Laravel injetasse automaticamente no callback de sua rota, você 
deve listar seus parâmetros de rota após suas dependências:

```php
use Illuminate\Http\Request;

Route::get('/user/{id}', function (Request $request, $id) {
    return 'User '.$id;
});
```

### Parâmetros Opcionais
Ocasionalmente, você pode precisar especificar um parâmetro de rota que nem sempre pode estar presente no URI. Você pode fazer isso colocando 
uma marca `?` após o nome do parâmetro. Certifique-se de dar à variável correspondente da rota um valor padrão:

```php
Route::get('/user/{name?}', function ($name = null) {
    return $name;
});

Route::get('/user/{name?}', function ($name = 'John') {
    return $name;
});
```

### Restrições de expressão regular
Você pode restringir o formato de seus parâmetros de rota usando o método `where` em uma instância de rota. O método `where` aceita o nome 
do parâmetro e uma expressão regular que define como o parâmetro deve ser restringido:

```php
Route::get('/user/{name}', function ($name) {
    //
})->where('name', '[A-Za-z]+');

Route::get('/user/{id}', function ($id) {
    //
})->where('id', '[0-9]+');

Route::get('/user/{id}/{name}', function ($id, $name) {
    //
})->where(['id' => '[0-9]+', 'name' => '[a-z]+']);
```

Por conveniência, alguns padrões de expressão regular comumente usados ​​têm métodos auxiliares que permitem adicionar rapidamente 
restrições de padrão às suas rotas:

```php
Route::get('/user/{id}/{name}', function ($id, $name) {
    //
})->whereNumber('id')->whereAlpha('name');

Route::get('/user/{name}', function ($name) {
    //
})->whereAlphaNumeric('name');

Route::get('/user/{id}', function ($id) {
    //
})->whereUuid('id');
```

Se a solicitação recebida não corresponder às restrições do padrão de rota, uma resposta HTTP 404 será retornada.

### Restrições Globais
Se você quiser que um parâmetro de rota sempre seja restringido por uma dada expressão regular, você pode usar o método `pattern`. Você 
deve definir esses padrões no método `boot` de sua classe `App\Providers\RouteServiceProvider`:

```php
/**
 * Define your route model bindings, pattern filters, etc.
 *
 * @return void
 */
public function boot()
{
    Route::pattern('id', '[0-9]+');
}
```

Uma vez que o padrão foi definido, ele é automaticamente aplicado a todas as rotas usando aquele nome de parâmetro:

```php
Route::get('/user/{id}', function ($id) {
    // Executado apenas se {id} for numérico...
});
```

### Barras dianteiras codificadas
O componente de roteamento do Laravel permite que todos os caracteres, exceto os `/` que estejam presentes nos valores dos parâmetros da rota. 
Você deve permitir explicitamente a `/` fazer parte do marcador de posição usando uma expressão regular `where` de condição:

```php
Route::get('/search/{search}', function ($search) {
    return $search;
})->where('search', '.*');
```

> As barras codificadas são suportadas apenas no último segmento da rota.

## Rotas Nomeadas
As rotas nomeadas permitem a geração conveniente de URLs ou redirecionamentos para rotas específicas. Você pode especificar um 
nome para uma rota encadeando o namemétodo na definição de rota:

```php
Route::get('/user/profile', function () {
    //
})->name('profile');
```

Você também pode especificar nomes de rota para ações do controlador:

```php
Route::get(
    '/user/profile',
    [UserProfileController::class, 'show']
)->name('profile');
```

> Os nomes das rotas devem ser sempre exclusivos.

### Gerando URLs para Rotas Nomeadas
Depois de atribuir um nome a uma determinada rota, você pode usar o nome da rota ao gerar URLs ou redirecionamentos através do Laravel com as funções
auxiliares `route` e `redirect`:

```php
// Gerando URLs...
$url = route('profile');

// Gerando redirecionamentos...
return redirect()->route('profile');
```

Se a rota nomeada definir parâmetros, você pode passar os parâmetros como o segundo argumento para a função `route`. Os parâmetros fornecidos serão 
inseridos automaticamente no URL gerado em suas posições corretas:

```php
Route::get('/user/{id}/profile', function ($id) {
    //
})->name('profile');

$url = route('profile', ['id' => 1]);
```

Se você passar parâmetros adicionais na matriz, esses pares de chave/valor serão adicionados automaticamente à string de consulta da URL gerado:
```php
Route::get('/user/{id}/profile', function ($id) {
    //
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']);

// /user/1/profile?photos=yes
```

> Às vezes, você pode desejar especificar valores padrão em toda a solicitação para parâmetros de URL, como a localidade atual. 
> Para fazer isso, você pode usar o método `URL::defaults`.

#### Inspecionando a rota atual
Se você deseja determinar se a solicitação atual foi roteada para uma determinada rota nomeada, você pode usar o método `named` em uma 
instância de rota. Por exemplo, você pode verificar o nome da rota atual em um middleware de rota:

```php
/**
 * Handle an incoming request.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  \Closure  $next
 * @return mixed
 */
public function handle($request, Closure $next)
{
    if ($request->route()->named('profile')) {
        //
    }

    return $next($request);
}
```

## Grupos de Rota
Os grupos de rota permitem que você compartilhe atributos de rota como middlewares por exemplo, em um grande número de rotas sem a necessidade de 
definir esses atributos em cada rota individualmente.

Os grupos aninhados tentam "mesclar" atributos de maneira inteligente com seu grupo pai. Middleware e condições `where` são mesclados enquanto nomes 
e prefixos são anexados. Delimitadores de namespace e barras nos prefixos URI são adicionados automaticamente quando apropriado.

## Middleware
Para atribuir middleware a todas as rotas dentro de um grupo, você pode usar o middlewaremétodo antes de definir o grupo. 
O `middleware` é executado na ordem em que estão listados na matriz:

```php
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // Usa primeiro e segundo middleware...
    });

    Route::get('/user/profile', function () {
        // Usa primeiro e segundo middleware...
    });
});
```

### Roteamento de Subdomínio
Os grupos de rota também podem ser usados para lidar com o roteamento de subdomínio. Subdomínios podem ser atribuídos a parâmetros de rota, 
assim como URIs de rota, permitindo que você capture uma parte do subdomínio para uso em sua rota ou controlador. O subdomínio pode ser 
especificado chamando o método `domain` antes de definir o grupo:

```php
Route::domain('{account}.example.com')->group(function () {
    Route::get('user/{id}', function ($account, $id) {
        //
    });
});
```

> Para garantir que suas rotas de subdomínio sejam alcançáveis, você deve registrar as rotas de subdomínio antes de registrar 
> as rotas de domínio raiz. Isso impedirá que as rotas de domínio raiz sobrescrevam as rotas de subdomínio que têm o mesmo caminho de URI.

### Prefixos de rota
O método `prefix` pode ser usado para prefixar cada rota no grupo com um determinado URI. Por exemplo, você pode prefixar todos os URIs de rota 
dentro do grupo com admin:

```php
Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        // Corresponde a URL "/admin/users"
    });
});
```

#### Prefixos do nome da rota
O método `name` pode ser usado para prefixar cada nome de rota no grupo com uma determinada string. Por exemplo, você pode querer prefixar 
todos os nomes de rotas agrupadas com `admin`. A string fornecida é prefixada ao nome da rota exatamente como está especificada, portanto, 
teremos certeza de fornecer o caractere final no prefixo:

```php
Route::name('admin.')->group(function () {
    Route::get('/users', function () {
        // Nome atribuído à rota "admin.users"...
    })->name('users');
});
```

### Vinculação de modelo de rota

Ao injetar um ID de modelo em uma rota ou ação do controlador, você frequentemente consultará o banco de dados para recuperar o modelo que 
corresponde a esse ID. A vinculação do modelo de rota do Laravel fornece uma maneira conveniente de injetar automaticamente as instâncias do 
modelo diretamente em suas rotas. Por exemplo, em vez de injetar o ID de um usuário, você pode injetar toda a Userinstância do modelo que 
corresponde ao ID fornecido.

### Ligação implícita
O Laravel resolve automaticamente os modelos do Eloquent definidos em rotas ou ações do controlador cujos nomes de variáveis sugeridas pelo 
tipo correspondem a um nome de segmento de rota. Por exemplo:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
});
```

Uma vez que a variável `$user` é sugerida pelo tipo como o modelo `App\Models\User` do Eloquent e o nome da variável corresponde ao segmento `{user}`
URI, o Laravel injetará automaticamente a instância do modelo que possui um ID que corresponde ao valor da URI de solicitação. Se uma instância de 
modelo correspondente não for encontrada no banco de dados, uma resposta HTTP 404 será gerada automaticamente.

Obviamente, a ligação implícita também é possível ao usar métodos de controlador. Novamente, observe que o `{user}` segmento URI corresponde à 
variável `$user` no controlador que contém uma App\Models\Userdica de tipo:

```php
use App\Http\Controllers\UserController;
use App\Models\User;

// Definição de Rotas...
Route::get('/users/{user}', [UserController::class, 'show']);

// Definição do método do controlador...
public function show(User $user)
{
    return view('user.profile', ['user' => $user]);
}
```

#### Personalizando a chave
Às vezes, você pode querer resolver os modelos do Eloquent usando uma coluna diferente de id. Para fazer isso, você pode especificar a 
coluna na definição do parâmetro de rota:

```php
use App\Models\Post;

Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});
```

Se você deseja que a vinculação de modelo sempre use uma coluna de banco de dados diferente de quando `id` recuperar uma determinada classe 
de modelo, você pode substituir o método `getRouteKeyName` no modelo do Eloquent:

```php
/**
 * Get the route key for the model.
 *
 * @return string
 */
public function getRouteKeyName()
{
    return 'slug';
}
```

#### Chaves personalizadas e escopo
Ao vincular implicitamente vários modelos do Eloquent em uma única definição de rota, você pode desejar definir o escopo do segundo modelo do 
Eloquent de forma que ele seja filho do modelo anterior do Eloquent. Por exemplo, considere esta definição de rota que recupera uma postagem 
de blog por slug para um usuário específico:

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

Ao usar uma ligação implícita com chave personalizada como um parâmetro de rota aninhada, o Laravel irá automaticamente definir o escopo da 
consulta para recuperar o modelo aninhado por seu pai usando convenções para adivinhar o nome do relacionamento no pai. Nesse caso, será 
assumido que o modelo `User` tem um relacionamento denominado `posts` (a forma plural do nome do parâmetro da rota) que pode ser usado para 
recuperar o modelo `Post`.

### Ligação explícita
Você não é obrigado a usar a resolução de modelo implícita e baseada em convenção do Laravel para usar a vinculação de modelo. 
Você também pode definir explicitamente como os parâmetros de rota correspondem aos modelos. Para registrar uma ligação explícita, 
use o método `model` do roteador para especificar a classe para um determinado parâmetro. Você deve definir suas ligações de modelo 
explícitas no início do método `boot` de sua classe `RouteServiceProvider`:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Define your route model bindings, pattern filters, etc.
 *
 * @return void
 */
public function boot()
{
    Route::model('user', User::class);

    // ...
}
```

Em seguida, defina uma rota que contém um `{user}` parâmetro:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    //
});
```

Como vinculamos todos os parâmetros `{user}` ao modelo `App\Models\User`, uma instância dessa classe será injetada na rota. Assim, 
por exemplo, uma solicitação para `users/1` injetará a instância `User` do banco de dados que possui um ID de 1.

Se uma instância de modelo correspondente não for encontrada no banco de dados, uma resposta HTTP 404 será gerada automaticamente.

### Personalizando A Lógica de Resolução
Se você deseja definir sua própria lógica de resolução de ligação de modelo, você pode usar o método `Route::bind`. O closure que você 
passa para o método `bind` receberá o valor do URI e deve retornar a instância da classe que deve ser injetada na rota. Novamente, essa 
personalização deve ocorrer no método `boot` do seu aplicativo `RouteServiceProvider`:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Define your route model bindings, pattern filters, etc.
 *
 * @return void
 */
public function boot()
{
    Route::bind('user', function ($value) {
        return User::where('name', $value)->firstOrFail();
    });

    // ...
}
```

Alternativamente, você pode substituir o método `resolveRouteBinding` em seu modelo do Eloquent. Este método receberá o valor do URI e 
deve retornar a instância da classe que deve ser injetada na rota:

```php
/**
 * Retrieve the model for a bound value.
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
Se uma rota estiver utilizando o escopo de vinculação implícita, o método `resolveChildRouteBinding` será usado para resolver a vinculação 
filha do modelo pai:

```php
/**
 * Retrieve the child model for a bound value.
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

## Rotas alternativas
Usando o método `Route::fallback`, você pode definir uma rota que será executada quando nenhuma outra rota corresponder à solicitação de 
entrada. Normalmente, as solicitações não tratadas renderizarão automaticamente uma página "404" por meio do manipulador de exceções do seu 
aplicativo. No entanto, como você normalmente definiria a rota `fallback` em seu arquivo `routes/web.php`, todo middleware no grupo `web` de 
middleware se aplicará à rota. Você está livre para adicionar middleware adicional a esta rota conforme necessário:

```php
Route::fallback(function () {
    //
});
```

> A rota de fallback deve ser sempre a última rota registrada por seu aplicativo.

## Limite de taxa

### Definindo Limitadores de Taxa
O Laravel inclui serviços de limitação de taxa poderosos e personalizáveis que você pode utilizar para restringir a quantidade de 
tráfego para uma determinada rota ou grupo de rotas. Para começar, você deve definir as configurações do limitador de taxa que atendam 
às necessidades do seu aplicativo. Normalmente, isso deve ser feito dentro do método `configureRateLimiting` da classe 
`App\Providers\RouteServiceProvider` do seu aplicativo.

Os limitadores de taxa são definidos usando o método `RateLimiter` da facade `for`. O método `for` aceita um nome de limitador de taxa e um 
fechamento que retorna a configuração de limite que deve ser aplicada a rotas atribuídas ao limitador de taxa. A configuração de limite são 
instâncias da classe `Illuminate\Cache\RateLimiting\Limit`. Esta classe contém métodos "construtores" úteis para que você possa definir 
rapidamente seu limite. O nome do limitador de taxa pode ser qualquer string que você desejar:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Configure the rate limiters for the application.
 *
 * @return void
 */
protected function configureRateLimiting()
{
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(1000);
    });
}
```

Se a solicitação recebida exceder o limite de taxa especificado, uma resposta com um código de status HTTP 429 será retornado automaticamente 
pelo Laravel. Se você deseja definir sua própria resposta que deve ser retornada por um limite de taxa, você pode usar o método `response`:

```php
RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000)->response(function () {
        return response('Custom response...', 429);
    });
});
```

Como os retornos de chamada do limitador de taxa recebem a instância de solicitação HTTP de entrada, você pode criar o limite de taxa apropriado 
dinamicamente com base na solicitação de entrada ou usuário autenticado:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100);
});
```

#### Limites de taxa de segmentação
Às vezes, você pode desejar segmentar os limites de taxa por algum valor arbitrário. Por exemplo, você pode permitir que os usuários acessem 
uma determinada rota 100 vezes por minuto por endereço IP. Para fazer isso, você pode usar o método `by` ao construir seu limite de taxa:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100)->by($request->ip());
});
```

##### Limites de taxa múltipla
Se necessário, você pode retornar uma série de limites de taxa para uma determinada configuração do limitador de taxa. Cada limite de taxa 
será avaliado para a rota com base na ordem em que são colocados na matriz:

```php
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(500),
        Limit::perMinute(3)->by($request->input('email')),
    ];
});
```

### Anexando Limitadores de Taxa para Rotas

Limitadores de taxa podem ser anexados a rotas ou grupos de rotas usando o middleware `throttle`. O middleware`throttle` aceita o nome do limitador 
de taxa que você deseja atribuir à rota:

```php
Route::middleware(['throttle:uploads'])->group(function () {
    Route::post('/audio', function () {
        //
    });

    Route::post('/video', function () {
        //
    });
});
```

### Throttle com Redis
Normalmente, o middleware `throttle` é mapeado para a classe `Illuminate\Routing\Middleware\ThrottleRequests`. Este mapeamento é definido no 
kernel HTTP do seu aplicativo (`App\Http\Kernel`). No entanto, se você estiver usando o Redis como o driver de cache do seu aplicativo, pode 
desejar alterar esse mapeamento para usar a classe `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis`. Esta classe é mais eficiente no 
gerenciamento de limitação de taxa usando o Redis:

```php
'throttle' => \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
```

### Spoofing de método de formulário

Formulários HTML não suportam ações de `PUT`, `PATCH` ou `DELETE`. Assim, ao definir rotas `PUT`, `PATCH` ou `DELETE` que são chamadas de um formulário 
HTML, você precisará adicionar um campo `_method` oculto ao formulário. O valor enviado com o campo `_method` será usado como método de solicitação HTTP:

```html
<form action="/example" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

Por conveniência, você pode usar a diretiva `@method` do Blade para gerar o campo `_method` de entrada:

```html
<form action="/example" method="POST">
    @method('PUT')
    @csrf
</form>
```

### Acessando a rota atual
Você pode usar os métodos `current`, `currentRouteName` e `currentRouteAction` na facade `Route` para acessar informações sobre a rota e manusear a 
solicitação de entrada:

```php
use Illuminate\Support\Facades\Route;

$route = Route::current(); // Illuminate\Routing\Route
$name = Route::currentRouteName(); // string
$action = Route::currentRouteAction(); // string
```

Você pode consultar a documentação da API para a classe subjacente da fachada da rota e a instância da rota para revisar todos os métodos que estão 
disponíveis no roteador e nas classes de rota.

## Compartilhamento de recursos de origem cruzada (CORS)
O Laravel pode responder automaticamente às solicitações `OPTIONS` com valores que você configurar. Todas as configurações do CORS podem ser definidas 
no arquivo `config/cors.php` de configuração do seu aplicativo. As solicitações `OPTIONS` serão tratadas automaticamente pelo middleware `HandleCors`
incluído por padrão em sua pilha global de middleware. Sua pilha de middleware global está localizada no kernel HTTP de seu aplicativo (`App\Http\Kernel`).

> Para obter mais informações sobre os cabeçalhos CORS consulte a documentação da web do [MDN sobre CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers).

## Cache de rota
Ao implantar sua aplicação para produção, você deve aproveitar as vantagens do cache de rotas do Laravel. Usar o cache de rota diminuirá 
drasticamente a quantidade de tempo que leva para registrar todas as rotas do seu aplicativo. Para gerar um cache de rota, execute o comando
Artisan `route:cache`:

```bash
php artisan route:cache
```

Depois de executar este comando, seu arquivo de rotas em cache será carregado em cada solicitação. Lembre-se, se você adicionar novas rotas, 
precisará gerar um novo cache de rota. Por isso, você só deve executar o comando `route:cache` durante a implantação do seu projeto.

Você pode usar o comando `route:clear` para limpar o cache da rota:

```bash
php artisan route:clear
```
