# Views (Visualizações)

## Introdução
Naturalmente, não é prático devolver as estratégias de documentos HTML completos diretamente das suas rotas e controladores. Felizmente, as Views fornecem uma forma conveniente para incluir todo o nosso código HTML em arquivos separados.

As Views separam a lógica do controlador/aplicativo da apresentação e são armazenadas no diretório `resources/views`. Usando o Laravel, os modelos de exibição geralmente são escritos usando a linguagem [Blade](/docs/blade). Um modelo de exibição simples pode ser semelhante ao seguinte:

```blade
<!-- View armazenada em resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

Como esse modelo é armazenado em `resources/views/greeting.blade.php`, podemos retorná-lo usando o assistente global `view`, da seguinte forma:

```php
    Route::get('/', function () {
        return view('greeting', ['name' => 'James']);
    });
```

::: info NOTA
Procurando mais informações sobre como escrever modelos Blade? Confira a [documentação completa do Blade](/docs/blade) para começar.
:::

### Escrevendo as views no React/Vue
Em vez de escrever os templates da interface do usuário em PHP por meio do Blade, muitos desenvolvedores começaram a preferir escrevê-los utilizando o React ou o Vue. O Laravel torna isso indolor graças à [Inertia](https://inertiajs.com/), uma biblioteca que facilita associar sua interface do usuário frontend ao backend do Laravel, sem as complexidades típicas da construção de um SPA.

O [kit inicial](/docs/starter-kits), Breeze e Jetstream lhe darão um excelente ponto de partida para o seu próximo aplicativo Laravel alimentado por Inertia. Além disso, o [Laravel Bootcamp](https://bootcamp.laravel.com) fornece uma demonstração completa de como criar um aplicativo Laravel alimentado por Inertia, incluindo exemplos em Vue e React.

## Criando e renderizando visualizações
Você pode criar uma visualização colocando um arquivo com a extensão `.blade.php` no diretório `resources/views` da sua aplicação ou usando o comando do Artisan `make:view`:

```shell
php artisan make:view greeting
```

A extensão `.blade.php` informa ao framework de que o arquivo contém um modelo [Blade](/docs/blade). Os modelos Blade incluem HTML e diretivas Blade que permitem a você mostrar facilmente valores, criar instruções "if", iteração sobre dados e muito mais.

Depois de criar uma visualização, você poderá retorná-la por meio dos roteadores ou controladores do seu aplicativo usando o auxílio global "view":

```php
    Route::get('/', function () {
        return view('greeting', ['name' => 'James']);
    });
```

A página também pode ser devolvida usando a facade `View`:

```php
    use Illuminate\Support\Facades\View;

    return View::make('greeting', ['name' => 'James']);
```

Como você pode ver, o primeiro argumento passado para a assistente de visualização corresponde ao nome do arquivo da visualização no diretório `resources/views`. O segundo argumento é uma matriz de dados que devem estar disponíveis para a visualização. Neste caso, estamos passando a variável `name`, que será exibida na visualização usando a sintaxe do [Blade](/docs/blade).

### Diretórios de visualização em nível superior
As views podem ser aninhadas dentro de subdiretórios do diretório `resources/views`. É possível fazer referências a visualizações aninhadas por meio da notação de "ponto". Por exemplo, se sua view estiver armazenada em `resources/views/admin/profile.blade.php`, você pode retorná-la de um dos roteadores ou controladores da aplicação como mostra a seguir:

```php
    return view('admin.profile', $data);
```

::: warning ATENÇÃO
 Os nomes de diretório não devem conter o caractere `.`.
:::

### Criando a primeira view disponível
Usando o método `first` da facade `View`, você pode criar a primeira visualização que existe em um determinado array de visualizações. Isso pode ser útil caso sua aplicação ou pacote permita que as visualizações sejam personalizadas ou sobrepostas:

```php
    use Illuminate\Support\Facades\View;

    return View::first(['custom.admin', 'admin'], $data);
```

### Determinar se existe uma visualização
Se você precisar determinar se uma view existe, pode utilizar a facade `View`. O método `exists` retornará `true` caso a view exista:

```php
    use Illuminate\Support\Facades\View;

    if (View::exists('admin.profile')) {
        // ...
    }
```

## Passando dados para a view
Como você viu nos exemplos anteriores, é possível passar um array de dados para a visualização para torná-las disponíveis para ela:

```php
    return view('greetings', ['name' => 'Victoria']);
```

Ao passar informações dessa maneira, os dados devem ser uma matriz com pares chave/valor. Depois de fornecer dados para uma visualização, você poderá acessar cada valor dentro da sua visualização usando as chaves dos dados, como `<?php echo $name; ?>`.

Como alternativa à passagem de uma matriz completa de dados para a função auxiliar `view`, é possível usar o método `with` para adicionar dados individuais ao modelo. O método `with` retorna uma instância do objeto de modelo, permitindo continuar encadeando métodos antes da sua entrega:

```php
    return view('greeting')
                ->with('name', 'Victoria')
                ->with('occupation', 'Astronaut');
```

### Compartilhando dados com todas as visualizações
Ocasionalmente, você pode precisar compartilhar dados com todas as visualizações renderizadas por seu aplicativo. Você pode fazer isso usando o método `share` da facade `View`. Normalmente, você deve colocar chamadas para o método `share` dentro do método `boot` do provedor de serviços. É livre adicioná-los à classe `App\Providers\AppServiceProvider` ou gerar um provedor de serviço separado para hospedá-los:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\View;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Registre quaisquer serviços de aplicativo.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Inicialize qualquer serviço de aplicativo.
         */
        public function boot(): void
        {
            View::share('key', 'value');
        }
    }
```

<a name="view-composers"></a>
## Compositores de Visualização

Os compositores de visualização são retornos de chamada ou métodos de classe chamados quando uma visualização é renderizada. Se você tiver dados que deseja vincular a uma visualização sempre que essa view for renderizada, um compositor de visualização poderá ajudá-lo a organizar essa lógica em um único local. Os compositores de visualização podem ser particularmente úteis se a mesma visualização for retornada por várias rotas ou controladores em seu aplicativo e sempre que precisar de um dado específico.

Normalmente, os composers de views são registrados em um dos [fornecedores de serviço da aplicação](/docs/providers) do seu aplicativo. Neste exemplo, assumimos que o `App\Providers\AppServiceProvider` contém essa lógica.

Usaremos o método `composer` da facade `View` para registrar o composer de views. O Laravel não inclui um diretório padrão para compositores de views baseados em classes, então você pode organizá-los do jeito que preferir. Por exemplo, você poderia criar um diretório `app/View/Composers` para abrigar todos os compostores de views do seu aplicativo:

```php
    <?php

    namespace App\Providers;

    use App\View\Composers\ProfileComposer;
    use Illuminate\Support\Facades;
    use Illuminate\Support\ServiceProvider;
    use Illuminate\View\View;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Registre quaisquer serviços de aplicativo.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Inicialize qualquer serviço de aplicativo.
         */
        public function boot(): void
        {
            // Usando compositores baseados em classes...
            Facades\View::composer('profile', ProfileComposer::class);

            // Usando compositores baseados em closures ...
            Facades\View::composer('welcome', function (View $view) {
                // ...
            });

            Facades\View::composer('dashboard', function (View $view) {
                // ...
            });
        }
    }
```

Agora que o compositor foi registrado, o método `compose` da classe `App\View\Composers\ProfileComposer` será executado sempre que a view `profile` for renderizada. Vamos ver um exemplo da classe composer:

```php
    <?php

    namespace App\View\Composers;

    use App\Repositories\UserRepository;
    use Illuminate\View\View;

    class ProfileComposer
    {
        /**
         * Crie um novo compositor de perfil.
         */
        public function __construct(
            protected UserRepository $users,
        ) {}

        /**
         * Vincule dados à visualização.
         */
        public function compose(View $view): void
        {
            $view->with('count', $this->users->count());
        }
    }
```

Como pode verificar, todos os composers de visualização são resolvidos através do [conjunto de serviços](/docs/container). Desta forma poderá indicar pelo tipo, quaisquer dependências que necessite no construtor de um composer.

#### Anexar um compositor a várias visualizações
Você pode anexar um compositor de visualização a várias visualizações ao mesmo tempo, passando uma matriz de visualizações como o primeiro argumento do método `composer`:

```php
    use App\Views\Composers\MultiComposer;
    use Illuminate\Support\Facades\View;

    View::composer(
        ['profile', 'dashboard'],
        MultiComposer::class
    );
```

O método `composer` também aceita o caractere `*` como um sinal de interrogação, permitindo anexar um compositor a todas as visualizações:

```php
    use Illuminate\Support\Facades;
    use Illuminate\View\View;

    Facades\View::composer('*', function (View $view) {
        // ...
    });
```

### Criador de visualização
A visão "criadores" é muito semelhante à visão dos compositores; no entanto, eles são executados imediatamente após a visualização ser instanciada, em vez de esperar até que a visualização esteja prestes a ser renderizada. Para registrar um criador de visualização, use o método `creator`:

```php
    use App\View\Creators\ProfileCreator;
    use Illuminate\Support\Facades\View;

    View::creator('profile', ProfileCreator::class);
```

## Otimizar visualizações
Por padrão, as visualizações de template Blade são compiladas sob demanda. Quando é executada uma requisição que renderize um template, o Laravel determina se existe uma versão compilada do template. Se o arquivo existir, o Laravel verifica se a versão não compilada foi modificada mais recentemente do que a versão compilada. Caso o template não esteja compilado ou tenha sido modificado, será feita uma nova compilação dele.

A compilação de arquivos de visualização durante a requisição pode ter um pequeno impacto negativo nos parâmetros de desempenho; por isso, o Laravel fornece o comando `view:cache` do Artisan para pré-compilar todos os arquivos de visualização utilizados pela sua aplicação. Para maior desempenho, é recomendável executar este comando como parte do processo de implantação:

```shell
php artisan view:cache
```

Você pode usar o comando `view:clear` para apagar o cache das views:

```shell
php artisan view:clear
```
