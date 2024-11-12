# Laravel Folio

<a name="introduction"></a>
## Introdução

[Laravel Folio](https://github.com/laravel/folio) é um poderoso roteador baseado em páginas projetado para simplificar o roteamento em aplicativos Laravel. Com o Laravel Folio, gerar uma rota se torna tão fácil quanto criar um modelo Blade dentro do diretório `resources/views/pages` do seu aplicativo.

Por exemplo, para criar uma página que seja acessível na URL `/greeting`, basta criar um arquivo `greeting.blade.php` no diretório `resources/views/pages` do seu aplicativo:

```php
<div>
    Hello World
</div>
```

<a name="installation"></a>
## Instalação

Para começar, instale o Folio em seu projeto usando o gerenciador de pacotes Composer:

```bash
composer require laravel/folio
```

Após instalar o Folio, você pode executar o comando Artisan `folio:install`, que instalará o provedor de serviços do Folio em seu aplicativo. Este provedor de serviços registra o diretório onde o Folio pesquisará rotas/páginas:

```bash
php artisan folio:install
```

<a name="page-paths-uris"></a>
### Caminhos de página/URIs

Por padrão, o Folio serve páginas do diretório `resources/views/pages` do seu aplicativo, mas você pode personalizar esses diretórios no método `boot` do seu provedor de serviços Folio.

Por exemplo, às vezes pode ser conveniente especificar vários caminhos Folio no mesmo aplicativo Laravel. Você pode desejar ter um diretório separado de páginas Folio para a área "admin" do seu aplicativo, enquanto usa outro diretório para o restante das páginas do seu aplicativo.

Você pode fazer isso usando os métodos `Folio::path` e `Folio::uri`. O método `path` registra um diretório que o Folio irá escanear em busca de páginas ao rotear solicitações HTTP de entrada, enquanto o método `uri` especifica o "URI base" para esse diretório de páginas:

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
### Roteamento de subdomínio

Você também pode rotear para páginas com base no subdomínio da solicitação de entrada. Por exemplo, você pode desejar rotear solicitações de `admin.example.com` para um diretório de páginas diferente do restante das suas páginas do Folio. Você pode fazer isso invocando o método `domain` após invocar o método `Folio::path`:

```php
use Laravel\Folio\Folio;

Folio::domain('admin.example.com')
    ->path(resource_path('views/pages/admin'));
```

O método `domain` também permite capturar partes do domínio ou subdomínio como parâmetros. Esses parâmetros serão injetados no seu modelo de página:

```php
use Laravel\Folio\Folio;

Folio::domain('{account}.example.com')
    ->path(resource_path('views/pages/admin'));
```

<a name="creating-routes"></a>
## Criando rotas

Você pode criar uma rota Folio colocando um modelo Blade em qualquer um dos seus diretórios montados Folio. Por padrão, o Folio monta o diretório `resources/views/pages`, mas você pode personalizar esses diretórios no método `boot` do seu provedor de serviços Folio.

Uma vez que um modelo Blade tenha sido colocado em um diretório montado Folio, você pode acessá-lo imediatamente pelo seu navegador. Por exemplo, uma página colocada em `pages/schedule.blade.php` pode ser acessada no seu navegador em `http://example.com/schedule`.

Para visualizar rapidamente uma lista de todas as suas páginas/rotas do Folio, você pode invocar o comando Artisan `folio:list`:

```bash
php artisan folio:list
```

<a name="nested-routes"></a>
### Rotas aninhadas

Você pode criar uma rota aninhada criando um ou mais diretórios dentro de um dos diretórios do Folio. Por exemplo, para criar uma página que seja acessível via `/user/profile`, crie um modelo `profile.blade.php` dentro do diretório `pages/user`:

```bash
php artisan folio:page user/profile

# pages/user/profile.blade.php → /user/profile
```

<a name="index-routes"></a>
### Rotas de índice

Às vezes, você pode desejar tornar uma determinada página o "índice" de um diretório. Ao colocar um modelo `index.blade.php` dentro de um diretório Folio, quaisquer solicitações para a raiz desse diretório serão roteadas para essa página:

```bash
php artisan folio:page index
# pages/index.blade.php → /

php artisan folio:page users/index
# pages/users/index.blade.php → /users
```

<a name="route-parameters"></a>
## Parâmetros de rota

Frequentemente, você precisará ter segmentos da URL da solicitação recebida injetados em sua página para que você possa interagir com eles. Por exemplo, você pode precisar acessar o "ID" do usuário cujo perfil está sendo exibido. Para fazer isso, você pode encapsular um segmento do nome do arquivo da página entre colchetes:

```bash
php artisan folio:page "users/[id]"

# pages/users/[id].blade.php → /users/1
```

Os segmentos capturados podem ser acessados ​​como variáveis ​​dentro do seu modelo Blade:

```html
<div>
    User {{ $id }}
</div>
```

Para capturar vários segmentos, você pode prefixar o segmento encapsulado com três pontos `...`:

```bash
php artisan folio:page "users/[...ids]"

# pages/users/[...ids].blade.php → /users/1/2/3
```

Ao capturar vários segmentos, os segmentos capturados serão injetados na página como uma matriz:

```html
<ul>
    @foreach ($ids as $id)
        <li>User {{ $id }}</li>
    @endforeach
</ul>
```

<a name="route-model-binding"></a>
## Associação de modelo de rota

Se um segmento curinga do nome de arquivo do seu modelo de página corresponder a um dos modelos Eloquent do seu aplicativo, o Folio aproveitará automaticamente os recursos de associação de modelo de rota do Laravel e tentará injetar a instância do modelo resolvido na sua página:

```bash
php artisan folio:page "users/[User]"

# pages/users/[User].blade.php → /users/1
```

Os modelos capturados podem ser acessados ​​como variáveis ​​dentro do seu modelo Blade. O nome da variável do modelo será convertido para "camel case":

```html
<div>
    User {{ $user->id }}
</div>
```

#### Personalizando a chave

Às vezes, você pode querer resolver modelos Eloquent vinculados usando uma coluna diferente de `id`. Para fazer isso, você pode especificar a coluna no nome de arquivo da página. Por exemplo, uma página com o nome de arquivo `[Post:slug].blade.php` tentará resolver o modelo vinculado por meio da coluna `slug` em vez da coluna `id`.

No Windows, você deve usar `-` para separar o nome do modelo da chave: `[Post-slug].blade.php`.

#### Localização do modelo

Por padrão, o Folio pesquisará seu modelo no diretório `app/Models` do seu aplicativo. No entanto, se necessário, você pode especificar o nome da classe do modelo totalmente qualificado no nome do arquivo do seu modelo:

```bash
php artisan folio:page "users/[.App.Models.User]"

# pages/users/[.App.Models.User].blade.php → /users/1
```

<a name="soft-deleted-models"></a>
### Modelos com exclusão temporária

Por padrão, os modelos que foram excluídos temporariamente não são recuperados ao resolver vinculações implícitas de modelo. No entanto, se desejar, você pode instruir o Folio a recuperar modelos excluídos de forma reversível invocando a função `withTrashed` dentro do modelo da página:

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
## Ganchos de renderização

Por padrão, o Folio retornará o conteúdo do modelo Blade da página como a resposta à solicitação recebida. No entanto, você pode personalizar a resposta invocando a função `render` dentro do modelo da página.

A função `render` aceita um *closure* que receberá a instância `View` sendo renderizada pelo Folio, permitindo que você adicione dados adicionais à visualização ou personalize a resposta inteira. Além de receber a instância `View`, quaisquer parâmetros de rota adicionais ou ligações de modelo também serão fornecidos ao *closure* `render`:

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
## Rotas nomeadas

Você pode especificar um nome para a rota de uma determinada página usando a função `name`:

```php
<?php

use function Laravel\Folio\name;

name('users.index');
```

Assim como as rotas nomeadas do Laravel, você pode usar a função `route` para gerar URLs para páginas do Folio que receberam um nome:

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

Você pode aplicar middleware a uma página específica invocando a função `middleware` dentro do modelo de página:

```php
<?php

use function Laravel\Folio\{middleware};

middleware(['auth', 'verified']);

?>

<div>
    Dashboard
</div>
```

Ou, para atribuir middleware a um grupo de páginas, você pode encadear o método `middleware` após invocar o método `Folio::path`.

Para especificar a quais páginas o middleware deve ser aplicado, o array de middleware pode ser indexado usando os padrões de URL correspondentes das páginas às quais eles devem ser aplicados. O caractere `*` pode ser utilizado como um caractere curinga:

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

Você pode incluir closures no array de middleware para definir middleware inline e anônimo:

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
## Cache de rota

Ao usar o Folio, você deve sempre aproveitar as [capacidades de cache de rota do Laravel](/docs/routing#route-caching). O Folio escuta o comando Artisan `route:cache` para garantir que as definições de página e os nomes de rota do Folio sejam armazenados em cache corretamente para desempenho máximo.
