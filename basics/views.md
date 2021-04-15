# Views

## Introdução
Obviamente, não é prático retornar strings inteiras de documentos HTML diretamente de suas rotas e controladores. Felizmente, as visualizações 
fornecem uma maneira conveniente de colocar todo o nosso HTML em arquivos separados. As visualizações separam a lógica do controlador/aplicativo 
da lógica de apresentação e são armazenadas no diretório `resources/views`. Uma visualização simples pode ser semelhante a esta:

```
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

Uma vez que esta visualização é armazenada em `resources/views/greeting.blade.php`, podemos retorná-la usando o auxiliar global `view` da seguinte forma:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

> Procurando mais informações sobre como escrever modelos Blade? Verifique a documentação completa do Blade para começar.

## Criação e renderização de views
Você pode criar uma visualização colocando um arquivo com a extensão `.blade.php` no diretório `resources/views` do seu aplicativo. A
extensão `.blade.php` informa ao framework que o arquivo contém um template `Blade`. Os modelos Blade contêm HTML e também diretivas Blade que 
permitem ecoar facilmente os valores, criar instruções "if", iterar dados e muito mais.

Depois de criar uma visualização, você pode retorná-la de uma das rotas ou controladores de seu aplicativo usando o viewauxiliar global :

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

As vistas também podem ser retornadas usando a Viewfachada:

```php
use Illuminate\Support\Facades\View;

return View::make('greeting', ['name' => 'James']);
```

Como você pode ver, o primeiro argumento passado ao auxiliar `view` corresponde ao nome do arquivo de visualização no diretório `resources/views`. O 
segundo argumento é uma matriz de dados que deve ser disponibilizada para a exibição. Nesse caso, estamos passando a variável `name`, que é exibida na
visualização usando a sintaxe Blade.

### Diretórios de visualização aninhados
As visualizações também podem ser aninhadas em subdiretórios do diretório `resources/views`. A notação "ponto" pode ser usada para fazer referência a
visualizações aninhadas. Por exemplo, se sua visualização está armazenada em `resources/views/admin/profile.blade.php`, você pode retorná-la de uma 
das rotas/controladores de seu aplicativo da seguinte forma:

```php
return view('admin.profile', $data);
```

> Os nomes dos diretórios de exibição não devem conter o caractere`.`.

### Criando a primeira visualização disponível
Usando o método `first` da facade `View`, você pode criar a primeira view que existe em um determinado conjunto de views. Isso pode ser útil se seu 
aplicativo ou pacote permitir que as visualizações sejam personalizadas ou substituídas:

```php
use Illuminate\Support\Facades\View;

return View::first(['custom.admin', 'admin'], $data);
```

### Determinando se uma visualização existe
Se você precisa determinar se existe uma view, você pode usar a facade `View`. O método `exists` retornará `true` se a visualização existir:

```php
use Illuminate\Support\Facades\View;

if (View::exists('emails.customer')) {
    //
}
```

## Passando dados para visualizações
Como você viu nos exemplos anteriores, você pode passar uma matriz de dados para as views afim de disponibilizar esses dados para seu 
template de visualização:

```php
return view('greetings', ['name' => 'Victoria']);
```

Ao passar informações dessa maneira, os dados devem ser uma matriz com pares de chave/valor. Depois de fornecer dados a uma visualização, você 
pode acessar cada valor em sua visualização usando as chaves dos dados, como `<?php echo $name; ?>`.

Como alternativa para passar uma matriz completa de dados para a função auxiliar `view`, você pode usar o método `with` para adicionar partes individuais 
de dados à visualização. O método `with` retorna uma instância do objeto de visualização para que você possa continuar encadeando métodos antes de 
retornar a visualização:

```php
return view('greeting')
            ->with('name', 'Victoria')
            ->with('occupation', 'Astronaut');
```

### Compartilhando dados com todas as visualizações
Ocasionalmente, você pode precisar compartilhar dados com todas as visualizações renderizadas por seu aplicativo. Você pode fazer isso usando o 
método `share` da facade `View`. Normalmente, você deve fazer chamadas para o método `share` dentro do método `boot` de um provedor de serviços. 
Você é livre para adicioná-los à classe `App\Providers\AppServiceProvider` ou gerar um provedor de serviços separado para hospedá-los:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        View::share('key', 'value');
    }
}
```

### Ver Compositores
Os compositores de visualização são retornos de chamada ou métodos de classe que são chamados quando uma visualização é renderizada. Se você tiver dados 
que deseja vincular a uma view cada vez que essa visualização for renderizada, um compositor de visualização pode ajudá-lo a organizar essa lógica em um 
único local. Os compositores de visualização podem ser particularmente úteis se a mesma visualização for retornada por várias rotas ou controladores em 
seu aplicativo e sempre precisar de um dado específico.

Normalmente, os compositores de visualização serão registrados em um dos provedores de serviço do seu aplicativo . Neste exemplo, vamos supor que criamos um 
novo `App\Providers\ViewServiceProvider` para abrigar essa lógica.

Usaremos o método `composer` da facade `View` para registrar o compositor da visualização. O Laravel não inclui um diretório padrão para compositores de 
visões baseadas em classes, então você é livre para organizá-los como desejar. Por exemplo, você pode criar um diretório `app/Http/View/Composers` para 
abrigar todos os compositores de visualização do seu aplicativo:

```php
<?php

namespace App\Providers;

use App\Http\View\Composers\ProfileComposer;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ViewServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Using class based composers...
        View::composer('profile', ProfileComposer::class);

        // Using closure based composers...
        View::composer('dashboard', function ($view) {
            //
        });
    }
}
```

> Lembre-se, se você criar um novo provedor de serviços para conter seus registros do compositor da view, será necessário adicionar o 
> provedor de serviços ao array `providers` no arquivo `config/app.php` de configuração.

Agora que registramos o compositor, o método `compose` da classe `App\Http\View\Composers\ProfileComposer` será executado cada vez que a 
view `profile` estiver sendo renderizada. Vamos dar uma olhada em um exemplo da classe composer:

```php
<?php

namespace App\Http\View\Composers;

use App\Repositories\UserRepository;
use Illuminate\View\View;

class ProfileComposer
{
    /**
     * The user repository implementation.
     *
     * @var \App\Repositories\UserRepository
     */
    protected $users;

    /**
     * Create a new profile composer.
     *
     * @param  \App\Repositories\UserRepository  $users
     * @return void
     */
    public function __construct(UserRepository $users)
    {
        // Dependencies are automatically resolved by the service container...
        $this->users = $users;
    }

    /**
     * Bind data to the view.
     *
     * @param  \Illuminate\View\View  $view
     * @return void
     */
    public function compose(View $view)
    {
        $view->with('count', $this->users->count());
    }
}
```

Como você pode ver, todos os compositores de visualização são resolvidos por meio do contêiner de serviço , portanto, você pode digitar qualquer 
dependência necessária dentro do construtor de um compositor.

## Anexando um Compositor a Múltiplas Vistas
Você pode anexar um compositor de visualização a múltiplas visualizações de uma vez, passando uma matriz de visualizações como o primeiro argumento 
para o método `composer`:

```php
use App\Http\Views\Composers\MultiComposer;

View::composer(
    ['profile', 'dashboard'],
    MultiComposer::class
);
```

O método `composer` também aceita o caractere `*` como curinga, permitindo que você anexe um compositor a todas as visualizações:

```php
View::composer('*', function ($view) {
    //
});
```

### Ver Criadores

Os "criadores" de visualização são muito semelhantes aos compositores de visualização; no entanto, eles são executados imediatamente após a 
visualização ser instanciada, em vez de esperar até que a visualização esteja prestes a ser renderizada. Para registrar um criador de visualização, 
use o método `creator`:

```php
use App\Http\View\Creators\ProfileCreator;
use Illuminate\Support\Facades\View;

View::creator('profile', ProfileCreator::class);
```

## Otimizando Visualizações
Por padrão, as visualizações do modelo Blade são compiladas sob demanda. Quando uma requisição é executada para renderizar uma view, o 
Laravel irá determinar se uma versão compilada da view existe. Se o arquivo existir, o Laravel irá então determinar se a view não compilada foi 
modificada mais recentemente do que a visão compilada. Se a visão compilada não existe, ou a visão não compilada foi modificada, o Laravel irá 
recompilar esse arquivo.

Compilar view durante a solicitação pode ter um pequeno impacto negativo no desempenho, então o Laravel fornece o comando `view:cache` no Artisan para 
pré-compilar todas as visualizações utilizadas por seu aplicativo. Para aumentar o desempenho, você pode executar este comando como parte do seu 
processo de implantação:

```bash
php artisan view:cache
```

Você pode usar o comando `view:clear` para limpar o cache de visualização:

```bash
php artisan view:clear
```
