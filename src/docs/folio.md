# Laranja Folha

<a name="introduction"></a>
## Introdução

 [Laravel Folio](https://github.com/laravel/folio) é um poderoso roteador baseado em páginas, projetado para simplificar o mapeamento de rotas nas aplicações Laravel. Com o Laravel Folio, a geração da rota se torna tão fácil quanto criar uma plantilha Blade dentro do diretório `resources/views/pages` da sua aplicação.

 Por exemplo, para criar uma página que seja acessível na URL "/greeting", crie um arquivo "greeting.blade.php" no diretório de páginas da aplicação, que está em `resources/views/pages`:

```php
<div>
    Hello World
</div>
```

<a name="installation"></a>
## Instalação

 Para começar, instale o Folio no seu projeto utilizando o gerenciador de pacotes Composer:

```bash
composer require laravel/folio
```

 Depois de instalar o Folio, você pode executar o comando "folio:install" do Artisan, que irá instalar o provedor de serviço do Folio em sua aplicação. Esse provedor de serviços registra o diretório onde o Folio procurará rotas/páginas:

```bash
php artisan folio:install
```

<a name="page-paths-uris"></a>
### Caminhos de páginas/URIs

 Por padrão, o Folio serve as páginas do diretório de sua aplicação `resources/views/pages`, mas você pode personalizar esses diretórios no método `boot` do seu provedor de serviços Folio.

 Por exemplo, por vezes pode ser conveniente especificar vários caminhos de Folio na mesma aplicação Laravel. Pode ser que pretenda ter uma pasta separada de páginas Folio para a área "admin" da sua aplicação, enquanto usa outra diretiva para o resto das páginas do seu aplicativo.

 Para isso, poderá utilizar os métodos `Folio::path` e `Folio::uri`. O primeiro regista um diretório que Folio irá escanear em busca de páginas no processamento de requisições HTTP recebidas. O segundo especifica o "URI base" para este diretório de páginas:

```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages/guest'))->uri('/');

Folio::path(resource_path('views/pages/admin'))
    ->uri('/admin')
    ->middleware([
        '*' => [
            'auth',
            'verified',

            // ...
        ],
    ]);
```

<a name="subdomain-routing"></a>
### Encaminhamento de subdomínios

 Você também poderá redirecionar páginas com base no subdomínio da solicitação recebida. Por exemplo, você pode querer redirecionar solicitações de `admin.example.com` para um diretório de página diferente do resto das suas páginas Folio. Isso pode ser feito invocando o método `domain` após a chamada ao método `Folio::path`:

```php
use Laravel\Folio\Folio;

Folio::domain('admin.example.com')
    ->path(resource_path('views/pages/admin'));
```

 O método `domain` também permite capturar partes do domínio ou subdomínio como parâmetros. Esses parâmetros serão injetados na sua plantilha de página:

```php
use Laravel\Folio\Folio;

Folio::domain('{account}.example.com')
    ->path(resource_path('views/pages/admin'));
```

<a name="creating-routes"></a>
## Criar rotas

 É possível criar uma rota Folio colocando um modelo Blade em qualquer diretório montado da sua Folio. Por padrão, a Folio monta o diretório `resources/views/pages`, mas é possível personalizar estes diretórios na função `boot` do seu serviço de provedor Folio.

 Quando uma plantilha Blade é colocada num diretório montado no Folio, pode ser acedida imediatamente no seu browser. Por exemplo, uma página colocada em `pages/schedule.blade.php` pode ser acedida no seu navegador na URL `http://example.com/schedule`.

 Para visualizar rapidamente uma lista de todas as páginas/rotas do Folio, você pode chamar o comando "Artesão" `folio:list`:

```bash
php artisan folio:list
```

<a name="nested-routes"></a>
### Rotas aninhadas

 É possível criar uma rota aninhada criando um ou mais diretórios dentro de um dos diretórios do Folio. Por exemplo, para criar uma página acessível por meio de `/user/profile`, crie um modelo `profile.blade.php` no diretório `pages/user`:

```bash
php artisan folio:page user/profile

# pages/user/profile.blade.php → /user/profile
```

<a name="index-routes"></a>
### Rotas de índice

 Às vezes, você pode querer que uma determinada página seja o "índice" de um diretório. Colocando um modelo `index.blade.php` dentro de um diretório Folio, todas as solicitações à raiz desse diretório serão encaminhadas para aquela página:

```bash
php artisan folio:page index
# pages/index.blade.php → /

php artisan folio:page users/index
# pages/users/index.blade.php → /users
```

<a name="route-parameters"></a>
## Parâmetros da rota

 Muitas vezes, você precisará ter segmentos do URL da solicitação de entrada injetados em sua página para que possa interagir com eles. Por exemplo, você pode precisar acessar o "ID" do usuário cujo perfil está sendo exibido. Para isso, você pode encapsular um segmento do arquivo nome da página entre colchetes:

```bash
php artisan folio:page "users/[id]"

# pages/users/[id].blade.php → /users/1
```

 Os segmentos capturados podem ser acessados como variáveis dentro do seu modelo Blade.

```html
<div>
    User {{ $id }}
</div>
```

 Para capturar vários segmentos, você pode preencher o segmento encapsulado com três pontos (`…`):

```bash
php artisan folio:page "users/[...ids]"

# pages/users/[...ids].blade.php → /users/1/2/3
```

 Ao capturar vários segmentos, os segmentos capturados serão injetados na página como um array:

```html
<ul>
    @foreach ($ids as $id)
        <li>User {{ $id }}</li>
    @endforeach
</ul>
```

<a name="route-model-binding"></a>
## Vinculação de modelo de rota

 Se um segmento de substituição do nome do arquivo do modelo da sua página corresponder a um dos modelos Eloquent da sua aplicação, o Folio aproveitará automaticamente as capacidades de vinculação do modelo do roteamento do Laravel e tentará injetar uma instância resolvida no seu modelo na página:

```bash
php artisan folio:page "users/[User]"

# pages/users/[User].blade.php → /users/1
```

 Os modelos capturados podem ser acessados como variáveis no modelo de seu modelo. O nome da variável do modelo será convertido para "caixa de letras arábica":

```html
<div>
    User {{ $user->id }}
</div>
```

#### Personalizar a chave

 Às vezes, pode desejar resolver modelos Eloquent vinculados usando uma coluna que não seja a `id`. Para o fazer, deve especificar a coluna no nome da página. Por exemplo, uma página com o nome `[Post:slug].blade.php` tentará resolver o modelo vinculado pela coluna `slug` em vez de `id`.

 No Windows, você deve usar um hífen para separar o nome do modelo e a chave: "[Pós-slug] .blade.php".

#### Modelo Localização

 Por padrão, o Folio procura pelo seu modelo dentro do diretório `app/Models` do aplicativo. No entanto, se necessário, você pode especificar o nome da classe de modelo totalmente qualificado no nome do arquivo do modelo:

```bash
php artisan folio:page "users/[.App.Models.User]"

# pages/users/[.App.Models.User].blade.php → /users/1
```

<a name="soft-deleted-models"></a>
### Modelos apagados soft

 Por padrão, os modelos que foram excluídos sem deletar são não recuperados na resolução de ligações implícitas aos modelos. No entanto, se pretender, pode instruir a Folio para recuperar os modelos excluídos sem apagar através da invocação da função `withTrashed` no template da página:

```php
<?php

use function Laravel\Folio\{withTrashed};

withTrashed();

?>

<div>
    User {{ $user->id }}
</div>
```

<a name="render-hooks"></a>
## Gatilhos de renderização

 Por padrão, o Folio devolve o conteúdo do modelo do Blade da página como resposta ao pedido recebido. No entanto, você pode personalizar a resposta, invocando a função `render` dentro do modelo da página.

 A função render aceita uma chave de fechamento que receberá a instância View sendo renderizada pelo Folio, permitindo-lhe adicionar dados adicionais na visualização ou personalizar a resposta inteira. Além de receber a instância View, quaisquer parâmetros de rota adicionais ou ligações de modelo também serão fornecidos à chave de fechamento render:

```php
<?php

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

use function Laravel\Folio\render;

render(function (View $view, Post $post) {
    if (! Auth::user()->can('view', $post)) {
        return response('Unauthorized', 403);
    }

    return $view->with('photos', $post->author->photos);
}); ?>

<div>
    {{ $post->content }}
</div>

<div>
    This author has also taken {{ count($photos) }} photos.
</div>
```

<a name="named-routes"></a>
## Rotas com nomes

 Pode especificar um nome para o caminho de uma página usando a função `name`:

```php
<?php

use function Laravel\Folio\name;

name('users.index');
```

 Assim como os rotas nomeadas do Laravel, você pode usar a função `route` para gerar URLs para páginas Folio que tenham recebido um nome.

```php
<a href="{{ route('users.index') }}">
    All Users
</a>
```

 Se a página tiver parâmetros, você pode simplesmente passar seus valores para a função `route`:

```php
route('users.show', ['user' => $user]);
```

<a name="middleware"></a>
## Middleware

 Você pode aplicar o middleware a uma página específica invocando a função `middleware` no modelo da página:

```php
<?php

use function Laravel\Folio\{middleware};

middleware(['auth', 'verified']);

?>

<div>
    Dashboard
</div>
```

 Ou, para atribuir um middleware a um grupo de páginas, poderá ligar o método `middleware` após ter chamado o método `Folio::path`.

 Para especificar às páginas em que o middleware deve ser aplicado, a matriz de middleware pode ser associada ao seu URL através dos padrões correspondentes. O caractere `*` pode ser utilizado como um personagem para padrão:

```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        // ...
    ],
]);
```

 Você pode incluir ações de fechamento em um array de middlewares para definir o middleware anónimo e on-line:

```php
use Closure;
use Illuminate\Http\Request;
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        function (Request $request, Closure $next) {
            // ...

            return $next($request);
        },
    ],
]);
```

<a name="route-caching"></a>
## Armazenagem de rota

 Ao usar o Folio, você deve sempre tirar proveito das capacidades de cache da rota do Laravel (em [Documentação do Routing - Caching de Rota](/docs/routing#route-caching)). O Folio escuta o comando `route:cache` do Artisan para garantir que as definições de páginas e nomes de rotas sejam armazenadas corretamente no cache, proporcionando um máximo de desempenho.
