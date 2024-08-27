# Laravel Folio

<a name="introduction"></a>
## Introdução

[Laravel Folio](https://github.com/laravel/folio) é um poderoso roteador baseado em páginas projetado para simplificar o roteamento em aplicativos Laravel. Com o Laravel Folio, gerar uma rota se torna tão fácil quanto criar um modelo Blade dentro do diretório 'resources/views/pages' de seu aplicativo.

Por exemplo, para criar uma página acessível na URL `/greetings`, apenas crie um arquivo chamado `greetings.blade.php` dentro do diretório `resources/views/pages` de sua aplicação:

```php
<div>
    Hello World
</div>
```

<a name="installation"></a>
## Instalação

Para começar, instale o Folio no seu projeto usando o gerenciador de pacotes do Composer:

```bash
composer require laravel/folio
```

Após instalar o Folio, você pode executar o comando Artisan `folio:install`, que irá instalar o provedor de serviço do Folio em sua aplicação. Este provedor de serviço registra a pasta onde o Folio irá procurar rotas ou páginas:

```bash
php artisan folio:install
```

<a name="page-paths-uris"></a>
### Caminhos de página / URIs

Por padrão, o Folio serve páginas do diretório 'resources/views/pages' da sua aplicação, mas você pode personalizar estes diretórios no método 'boot' do provedor de serviços do Folio.

Por exemplo, às vezes pode ser conveniente especificar vários caminhos do Folio na mesma aplicação Laravel. Você pode querer ter um diretório separado de páginas Folio para a área "admin" da sua aplicação, enquanto usa outro diretório para o resto das páginas da sua aplicação.

Você pode fazer isso usando os métodos 'Folio::path' e 'Folio::uri'. O método 'path' registra um diretório que Folio irá procurar páginas quando roteando as requisições HTTP recebidas, enquanto o método 'uri' especifica o URI base para que diretório de páginas:

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

Você também pode direcionar páginas com base na subdomínio da solicitação recebida. Por exemplo, você pode querer direcionar solicitações do "admin.example.com" para um diretório de página diferente que o restante das suas páginas do Folio. Isso pode ser alcançado invocando o método `domain` após invocar o método `Folio::path`:

```php
use Laravel\Folio\Folio;

Folio::domain('admin.example.com')
    ->path(resource_path('views/pages/admin'));
```

O método 'domain' também permite capturar partes do domínio ou subdomínio como parâmetros. Esses parâmetros serão injetados em seu modelo de página.

```php
use Laravel\Folio\Folio;

Folio::domain('{account}.example.com')
    ->path(resource_path('views/pages/admin'));
```

<a name="creating-routes"></a>
## Criar Rotas

Você pode criar uma rota de Folio colocando um modelo de Blade em qualquer um dos diretórios montados do Folio. Por padrão, o Folio monta o diretório "resources/views/pages", mas você pode personalizar esses diretórios no método "boot" do provedor do Folio.

Uma vez que um modelo de Blade é colocado em um diretório montado para o Folio, você pode acessá-lo imediatamente através do seu navegador. Por exemplo, uma página colocada em "pages/schedule.blade.php" pode ser acessada no seu navegador na URL "http://example.com/schedule".

Para visualizar rapidamente uma lista de todas suas páginas do Folio / rotas, você pode invocar o comando Artisan "folio: list":

```bash
php artisan folio:list
```

<a name="nested-routes"></a>
### Rotas aninhadas

Você pode criar uma rota aninhada criando um ou mais diretórios dentro de um dos diretórios do Folio. Para criar uma página que é acessível através de `/user/profile`, crie o modelo `profile.blade.php` dentro do diretório `pages/user`:

```bash
php artisan folio:page user/profile

# pages/user/profile.blade.php → /user/profile
```

<a name="index-routes"></a>
### Rotas do índice

Às vezes, você pode querer fazer uma determinada página o "índice" de um diretório. Ao colocar um modelo `index.blade.php` dentro de um diretório de Folhagem, todas as requisições feitas ao raiz desse diretório serão redirecionadas para essa página:

```bash
php artisan folio:page index
# pages/index.blade.php → /

php artisan folio:page users/index
# pages/users/index.blade.php → /users
```

<a name="route-parameters"></a>
## Parâmetros de Rotas

Muitas vezes, você precisará inserir pedaços do URL da solicitação de entrada na sua página para que possa interagir com eles. Por exemplo, você pode precisar acessar o "ID" do usuário cuja perfil está sendo exibido. Para realizar isso, você pode incluir um segmento do nome do arquivo da página entre colchetes:

```bash
php artisan folio:page "users/[id]"

# pages/users/[id].blade.php → /users/1
```

Segmentos capturados podem ser acessados como variáveis dentro do seu modelo Blade:

```html
<div>
    User {{ $id }}
</div>
```

Para capturar múltiplos segmentos, você pode adicionar três pontos "..." antes do segmento encapsulado:

```bash
php artisan folio:page "users/[...ids]"

# pages/users/[...ids].blade.php → /users/1/2/3
```

Ao capturar múltiplos segmentos o conteúdo capturado será injetado na página como uma matriz

```html
<ul>
    @foreach ($ids as $id)
        <li>User {{ $id }}</li>
    @endforeach
</ul>
```

<a name="route-model-binding"></a>
## Modelo de Ligação de Rota

Se uma segmentação de curinga do nome do arquivo do modelo da sua página corresponde a um modelo Eloquent da sua aplicação, o Folio irá tirar vantagem automaticamente das capacidades de vinculação de modelo do Laravel e tentará injetar a instância resolvida do modelo na sua página.

```bash
php artisan folio:page "users/[User]"

# pages/users/[User].blade.php → /users/1
```

Os modelos capturados podem ser acessados como variáveis dentro de seu modelo Blade. O nome da variável do modelo será convertido para "camel case":

```html
<div>
    User {{ $user->id }}
</div>
```

#### Personalizando a Chave

Às vezes você pode querer resolver modelos Eloquent vinculados usando uma coluna diferente de 'id'. Para fazer isso, você pode especificar a coluna no nome da página. Por exemplo, uma página com o nome do arquivo [Post:slug].blade.php tentará resolver o modelo vinculado via a coluna 'slug' em vez da coluna 'id'.

Em Windows, você deve usar `-` para separar o nome do modelo da chave: `[Post-slug].blade.php`.

#### Localização do Modelo

Por padrão, o Folio vai procurar pelo seu modelo no diretório `app/Models` do seu aplicativo. No entanto, se necessário, você pode especificar a classe totalmente qualificada em nome de arquivo da sua template.

```bash
php artisan folio:page "users/[.App.Models.User]"

# pages/users/[.App.Models.User].blade.php → /users/1
```

<a name="soft-deleted-models"></a>
### Modelos excluídos suavemente

Por padrão, modelos que foram excluídos são ignorados na resolução de vinculações implícitas. No entanto, se você quiser, você pode instruir o Folio a recuperar modelos excluídos ao invocar a função 'withTrashed' dentro do modelo da página:

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
## Gancho de renderização

Por padrão, o Folio retorna o conteúdo do modelo da Blade da página como a resposta à solicitação entrante. No entanto, você pode personalizar a resposta invocando a função render dentro do modelo da página.

A função 'render' aceita um closure que receberá a instância da 'view' renderizada pelo Folio, permitindo-lhe adicionar dados adicionais à 'view' ou personalizar toda a resposta. Além de receber a instância da 'view', também serão fornecidos quaisquer parâmetros adicionais da rota ou vinculações do modelo para o closure de 'render':

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
## Rotas designadas

Você pode especificar um nome para o trajeto da página usando a função `name`:

```php
<?php

use function Laravel\Folio\name;

name('users.index');
```

Assim como as rotas nomeadas do Laravel, você pode usar a função de rota para gerar URLs para páginas do Folio que foram atribuídas um nome:

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

Você pode aplicar middleware para uma página específica invocando a função `middleware` dentro do modelo da página:

```php
<?php

use function Laravel\Folio\{middleware};

middleware(['auth', 'verified']);

?>

<div>
    Dashboard
</div>
```

Ou, para atribuir middleware a um grupo de páginas, você pode encadear o método 'middleware' após invocar o método 'Folio::path'.

Para especificar quais páginas o middleware deve ser aplicado, a matriz de middleware pode ser indexada usando os padrões de URL correspondentes das páginas que eles devem ser aplicados para. O caractere de asterisco pode ser usado como um caractere curinga:

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

Você pode incluir fechaduras no array de middleware para definir middleware anônimos e embutidos:

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
## Ajustes de rota

Ao usar o Folio, você deve sempre aproveitar as capacidades de cache de rotas do Laravel. O Folio escuta o comando 'route: cache' para garantir que as definições da página e os nomes das rotas do Folio sejam armazenados em cache adequadamente para obter o melhor desempenho.
