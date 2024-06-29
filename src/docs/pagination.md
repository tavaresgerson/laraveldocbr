# Base de dados: Paginamento

<a name="introduction"></a>
## Introdução

 Em outros frameworks, a página pode ser uma dor de cabeça. Esperamos que a abordagem da Laravel à páginas seja refrescante. O Paginator Laravel é integrado ao [Construtor de Consultas](/docs/queries) e ao ORM Eloquent e oferece uma página confortável e fácil de usar em bancos de dados, sem nenhuma configuração necessária.

 Por padrão, o código HTML gerado pelo sistematizador é compatível com o [mecanismo de Tailwind CSS](https://tailwindcss.com/); no entanto, também está disponível suporte ao Bootstrap para a paginação.

<a name="tailwind-jit"></a>
#### Tailwind JIT

 Se você estiver usando os vistas de paginação do Tailwind por padrão no Laravel e o motor JIT do Tailwind, certifique-se de que a chave `content` do arquivo `./tailwind.config.js` da sua aplicação faça referência às views de paginação do Laravel para que suas classes do Tailwind não sejam excluídas:

```js
content: [
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './resources/**/*.vue',
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
],
```

<a name="basic-usage"></a>
## Uso básico

<a name="paginating-query-builder-results"></a>
### Imprimir os resultados do construtor de consultas em páginas

 Existem várias maneiras de páginas dos itens. A mais simples é usar o método `paginate` no construtor de consulta [](/docs/queries) ou em uma consulta Eloquent [](/docs/eloquent). O método "paginate" automaticamente cuida da configuração do "limite" e "offset" na consulta com base na página atual que está sendo visualizada pelo usuário. Por padrão, a página atual é detectada pelo valor do argumento de query string `page` no pedido HTTP. Este valor é automaticamente detectado pelo Laravel, e também é inserido automaticamente nos links gerados pela biblioteca de paginação.

 Neste exemplo, o único argumento passado ao método `paginate` é o número de itens que você gostaria de mostrar "por página". No caso, vamos especificar que queremos mostrar `15` itens por página:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\DB;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Show all application users.
         */
        public function index(): View
        {
            return view('user.index', [
                'users' => DB::table('users')->paginate(15)
            ]);
        }
    }
```

<a name="simple-pagination"></a>
#### Paginação simples

 O método `paginate` conta o número total de registos correspondentes à consulta antes de recuperar os registos do banco de dados. Isto é feito para que o controlador de páginas saiba quantas páginas de registos existem no total. No entanto, se não pretende mostrar a totalidade dos números de páginas na UI da aplicação, a consulta do número total de registos é desnecessária.

 Portanto, se você só precisa exibir hiperlinks simples como "Próximo" e "Anterior", na interface da sua aplicação, você pode usar o método `simplePaginate` para executar uma única consulta eficiente:

```php
    $users = DB::table('users')->simplePaginate(15);
```

<a name="paginating-eloquent-results"></a>
### A paginação de resultados Eloquent

 Você também poderá paginar [consultas Eloquent](/docs/eloquent). Neste exemplo, nós vamos paginar o modelo `App\Models\User` e indicar que pretendemos mostrar 15 registros por página. Como você pode ver, a sintaxe é praticamente idêntica à dos resultados do consultor de query:

```php
    use App\Models\User;

    $users = User::paginate(15);
```

 Claro, você pode chamar o método `paginate` depois de definir outras restrições na consulta, tais como cláusulas `where`:

```php
    $users = User::where('votes', '>', 100)->paginate(15);
```

 Você também pode usar o método `simplePaginate` ao paginar os modelos Eloquent:

```php
    $users = User::where('votes', '>', 100)->simplePaginate(15);
```

 Da mesma forma, você pode usar o método `cursorPaginate` para páginas com cursores de modelos Eloquent:

```php
    $users = User::where('votes', '>', 100)->cursorPaginate(15);
```

<a name="multiple-paginator-instances-per-page"></a>
#### Múltiplas instâncias de Paginador por página

 Às vezes você pode precisar exibir dois separados Paginators em uma única tela que é renderizada pela sua aplicação. Entretanto, se as duas instâncias de paginator usarem o parâmetro query string `page` para armazenar a página atual, os dois paginators entrarão em conflito. Para resolver esse conflito, você pode passar o nome do parâmetro query string que deseja usar para armazenar a página atual do Paginator pelo terceiro argumento dos métodos `paginate`, `simplePaginate` e `cursorPaginate`:

```php
    use App\Models\User;

    $users = User::where('votes', '>', 100)->paginate(
        $perPage = 15, $columns = ['*'], $pageName = 'users'
    );
```

<a name="cursor-pagination"></a>
### Paginamento com cursor

 Embora o `paginate` e o `simplePaginate` criem consultas usando a cláusula SQL "offset", a paginação por cursor funciona construindo cláusulas "where" que comparam os valores das colunas ordenadas contidas na consulta, proporcionando o desempenho de banco de dados mais eficiente disponível entre todos os métodos de paginação do Laravel. Este método é particularmente adequado para conjuntos de dados grandes e interfaces de usuário de "rolagem infinita".

 Ao contrário da página de paginação baseada em indício, que inclui um número de página na string de consulta dos URLs gerados pelo Paginador, a página de paginação baseada no cursor coloca uma string "cursor" na string de consulta. O cursor é uma string codificada que contém o local onde a próxima pesquisa por páginas deve começar e a direção da mesma:

```
http://localhost/users?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

 Você pode criar uma instância de paginador com base em cursor através do método `cursorPaginate` oferecido pelo construtor da consulta. Este método retorna uma instância do tipo `Illuminate\Pagination\CursorPaginator`:

```php
    $users = DB::table('users')->orderBy('id')->cursorPaginate(15);
```

 Depois de recuperar uma instância do cursor "paginator", você poderá exibir os resultados da página como normalmente faria ao usar os métodos `paginate` e `simplePaginate`. Para obter mais informações sobre os métodos da instância oferecidos pelo cursor "paginator", consulte a documentação do [método de instância do cursor "paginator"](#cursor-paginator-instance-methods).

 > [AVERIGem de]
 > A consulta deve conter uma ordem de seleção para aproveitar a página do cursor. Além disso, as colunas por onde a ordem da consulta será feita devem pertencer à mesma tabela que você está paginando.

<a name="cursor-vs-offset-pagination"></a>
#### Paginamento por cursor versus offset

 Para ilustrar as diferenças entre paginação com cursor e offset, vamos examinar algumas consultas SQL de exemplo. As duas seguintes consultas serão executadas para mostrar "a segunda página" dos resultados de uma tabela `users`, ordenada por `id`:

```sql
# Offset Pagination...
select * from users order by id asc limit 15 offset 15;

# Cursor Pagination...
select * from users where id > 15 order by id asc limit 15;
```

 A consulta de página do cursor tem as seguintes vantagens em relação às paginações com o parâmetro offset:

 - Para conjuntos de dados grandes, a página do cursor irá oferecer melhor desempenho se as colunas de "order by" estiverem indexadas. Isso ocorre porque a cláusula "offset" faz uma varredura em todos os dados anteriormente combinados.
 - Para conjuntos de dados com escrita frequente, a paginação por offset pode ignorar registos ou mostrar duplicatas se os resultados tiverem sido recentemente adicionados ou apagados da página que o utilizador está a visualizar.

 No entanto, a página do cursor tem as seguintes limitações:

 Tal como acontece com a função `simplePaginate`, a página com o cursor só pode ser utilizada para exibir as ligações "Próximo" e "Anterior", e não permite gerar ligações com números de páginas.
 - É necessário que as ordens sejam baseadas em pelo menos uma coluna única ou numa combinação de colunas que são exclusivas. Não são suportadas colunas com valores nulos.
 - As expressões de consulta nas cláusulas "order by" são suportadas apenas se forem utilizados alias e estiverem incluídas na cláusula "select".
 - As expressões de consulta com parâmetros não são suportadas.

<a name="manually-creating-a-paginator"></a>
### Criação manual de um Paginator

 Às vezes você pode querer criar uma instância de paginação manualmente, passando um array de itens que você já tem em memória. Você pode fazer isso criando uma instância da classe `Illuminate\Pagination\Paginator`, `Illuminate\Pagination\LengthAwarePaginator` ou `Illuminate\Pagination\CursorPaginator`, dependendo de suas necessidades.

 As classes Paginator e CursorPaginator não precisam conhecer o número total de itens no conjunto de resultados; contudo, por causa disso, essas classes não possuem métodos para recuperar o índice da última página. A classe LengthAwarePaginator aceita quase os mesmos argumentos que a Paginator; entretanto, ela requer uma contagem do número total de itens no conjunto de resultados.

 Em outras palavras, o `Paginator` corresponde ao método `simplePaginate` do construtores de consultas, o `CursorPaginator` corresponde ao método `cursorPaginate`, e o `LengthAwarePaginator` corresponde ao método `paginate`.

 > [AVISO]
 Função PHP [array_slice](https://secure.php.net/manual/en/function.array-slice.php).

<a name="customizing-pagination-urls"></a>
### Personalizar URLs de paginação

 Por padrão, os links gerados pelo paginator correspondem ao URI da solicitação atual. No entanto, o método `withPath` do paginator permite que você personalize o URI usado pelo paginator para a geração de links. Por exemplo, se você quiser que o paginator gerencie links como `http://example.com/admin/users?page=N`, você deve passar `/admin/users` ao método `withPath`:

```php
    use App\Models\User;

    Route::get('/users', function () {
        $users = User::paginate(15);

        $users->withPath('/admin/users');

        // ...
    });
```

<a name="appending-query-string-values"></a>
#### Adicionar valores a uma string de consulta

 Você pode anexar à string de consulta dos links de paginação utilizando o método `appends`. Por exemplo, para anexar `sort=votes` a cada link de paginação, é feita a seguinte chamada ao `appends`:

```php
    use App\Models\User;

    Route::get('/users', function () {
        $users = User::paginate(15);

        $users->appends(['sort' => 'votes']);

        // ...
    });
```

 Você pode usar o método `withQueryString` se desejar anexar todos os valores da string de consulta do pedido atual aos links de paginação.

```php
    $users = User::paginate(15)->withQueryString();
```

<a name="appending-hash-fragments"></a>
#### Anexar fragmentos de hash

 Se você precisar anexar um "fragmento de hashtag" às URLs geradas pelo paginador, poderá usar o método `fragment`. Por exemplo, para anexar `#users` ao final de cada link de paginação, você deve invocar o método `fragment`, da seguinte forma:

```php
    $users = User::paginate(15)->fragment('users');
```

<a name="displaying-pagination-results"></a>
## Exibindo resultados de paginação

 Ao chamar o método `paginate`, você receberá uma instância de `Illuminate\Pagination\LengthAwarePaginator`. Além disso, ao chamar o método `simplePaginate` retorna uma instância de `Illuminate\Pagination\Paginator` e ao chamar o método `cursorPaginate`, retornará uma instância de `Illuminate\Pagination\CursorPaginator`.

 Estes objetos fornecem vários métodos que descrevem o conjunto de resultados. Além destes métodos auxiliares, as instâncias do paginator são iteradoras e podem ser iteradas como um array. Assim, uma vez obtido os resultados, você poderá mostrá-los e renderizar links da página usando [Blade](/docs/blade):

```blade
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

 O método `links` renderá os links para as outras páginas do conjunto de resultados. Cada um destes links já incluirá a variável de consulta `page`. Lembre-se, o HTML gerado pelo método `links` é compatível com o [quadro Tailwind CSS](https://tailwindcss.com).

<a name="adjusting-the-pagination-link-window"></a>
### Ajustando a janela de ligação de páginas

 Quando o paginador exibe links de páginas, o número da página atual é mostrado, bem como links para as três páginas antes e depois desta. Usando o método `onEachSide`, você pode controlar quantos links adicionais são exibidos em cada lado da página atual dentro da janela deslizante de links gerada pelo paginador:

```blade
{{ $users->onEachSide(5)->links() }}
```

<a name="converting-results-to-json"></a>
### Convertendo resultados em JSON

 As classes de paginação Laravel implementam o contrato da interface `Illuminate\Contracts\Support\Jsonable` e expõem o método `toJson`, para que seja fácil converter os resultados de paginação em JSON. Você também pode converter uma instância de paginator em JSON ao retorná-la a partir de um rote ou ação do controlador:

```php
    use App\Models\User;

    Route::get('/users', function () {
        return User::paginate();
    });
```

 O JSON do paginador inclui informações metadados como "total", "current_page" (página atual), "last_page" (última página) e mais. Os registos de resultado estão disponíveis na chave "data" numa matriz JSON. Eis um exemplo do JSON criado ao retornar uma instância do paginator a partir de uma rota:

```json
    {
       "total": 50,
       "per_page": 15,
       "current_page": 1,
       "last_page": 4,
       "first_page_url": "http://laravel.app?page=1",
       "last_page_url": "http://laravel.app?page=4",
       "next_page_url": "http://laravel.app?page=2",
       "prev_page_url": null,
       "path": "http://laravel.app",
       "from": 1,
       "to": 15,
       "data":[
            {
                // Record...
            },
            {
                // Record...
            }
       ]
    }
```

<a name="customizing-the-pagination-view"></a>
## Personalizar a visualização de páginas

 Por padrão, as visualizações usadas para exibir os links de paginação são compatíveis com o [Tailwind CSS](https://tailwindcss.com) framework. No entanto, se você não estiver usando Tailwind, poderá definir suas próprias visualizações para exibir esses links. Quando chamar a método `links` em uma instância do objeto Paginator, é possível passar o nome da visualização como primeiro argumento ao método:

```blade
{{ $paginator->links('view.name') }}

<!-- Passing additional data to the view... -->
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```

 No entanto, a maneira mais fácil de personalizar as visualizações da páginamento é exportando-as para o diretório `resources/views/vendor` usando o comando `vendor:publish`:

```shell
php artisan vendor:publish --tag=laravel-pagination
```

 Com este comando, as visualizações serão colocadas no diretório `resources/views/vendor/pagination` da sua aplicação. O arquivo `tailwind.blade.php` nesse diretório corresponde à vista por padrão de paginação. Você pode editar esse arquivo para alterar o HTML da página.

 Se você quiser indicar um arquivo diferente como a visualização de paginação padrão, poderá chamar os métodos `defaultView` e `defaultSimpleView` do paginador dentro da métrodo `boot` da sua classe `App\Providers\AppServiceProvider`:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Pagination\Paginator;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            Paginator::defaultView('view-name');

            Paginator::defaultSimpleView('view-name');
        }
    }
```

<a name="using-bootstrap"></a>
### Usando o Bootstrap

 O Laravel inclui visualizações de páginas construídas utilizando [Bootstrap CSS](https://getbootstrap.com/). Para utilizar estas visualizações em vez das visualizações Tailwind por defeito, pode chamar as métodos `useBootstrapFour` ou `useBootstrapFive` do paginador na etapa de inicialização da classe `App\Providers\AppServiceProvider`:

```php
    use Illuminate\Pagination\Paginator;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::useBootstrapFive();
        Paginator::useBootstrapFour();
    }
```

<a name="paginator-instance-methods"></a>
## Métodos da instância do objeto Paginator/LenghtAwarePaginator

 Cada instância de paginator fornece informações adicionais de páginas usando os seguintes métodos:

|  Método |  Descrição |
|---------|---------------|
|  `$paginator->count()` |  Obter o número de itens na página atual. |
|  `$paginator->currentPage()` |  Obter o número da página atual. |
|  `primerItem($paginator)` |  Recupere o número do resultado do primeiro item dos resultados. |
|  `$paginator->getOptions()` |  Obtenha as opções do paginador. |
|  `$paginator->getUrlRange($start, $end)` |  Crie um conjunto de URLs de páginas intermediárias. |
|  `$paginator->hasPages()` |  Determinar se existem itens suficientes para dividir em várias páginas. |
|  `$paginator->hasMorePages()` |  Determinar se há mais itens no armazenamento de dados. |
|  `funcionamento_da_página() -> $paginator->itens()` |  Recuperar os elementos da página atual. |
|  `$paginator->último item` |  Obtenha o número de resultado do último item dos resultados. |
|  `$paginator->ultimaPágina()` |  Recupere o número da página da última página disponível. (não disponível quando se usa o `simplePaginate`). |
|  `$paginator->nextPageUrl()` |  Obtenha a URL da próxima página. |
|  `$paginator->onFirstPage()` |  Determine se o páginer é na primeira página. |
|  `$paginator->perPage()` |  O número de itens a serem mostrados por página. |
|  `$paginator->url_pageAnterior()` |  Obtenha a URL da página anterior. |
|  `$paginator->total()` |  Determina o número total de itens correspondentes no armazenamento de dados. (Não disponível ao usar `simplePaginate`). |
|  `$paginator->url($page)` |  Obtenha o URL para um determinado número de página. |
|  `$paginator->pageName()` |  Obtenha a variável da cadeia de consulta usada para armazenar a página. |
|  `$paginator->setPageName($name)` |  Defina a variável de consulta usada para armazenar a página. |
|  `$paginator->através do callback` |  Transfira cada item, utilizando uma função de chamada de retorno. |

<a name="cursor-paginator-instance-methods"></a>
## Métodos de instância do páginador de cursor

 Cada instância do páginas de cursor fornece informações adicionais de página através dos seguintes métodos:

|  Método |  Descrição |
|---------|---------------|
|  `count($paginator)` |  Obtenha o número de itens da página atual. |
|  ` $paginator->cursor()` |  Obter a instância atual do cursor. |
|  `$paginator->getOptions()` |  Obtenha as opções do paginador. |
|  `contém páginas` |  Determinar se há itens suficientes para dividir em várias páginas. |
|  `$paginator->hasMorePages()` |  Determinar se existem mais itens no armazenamento de dados. |
|  `US$paginator->getCursorName()` |  Obter a variável de string de consulta usada para armazenar o cursor. |
|  `$paginator->itens()` |  Obter os itens da página atual. |
|  `$paginator->nextCursor()` |  Obtenha uma instância do cursor para o próximo conjunto de itens. |
|  `nextPageUrl($paginator)` |  Obtenha o URL da próxima página. |
|  `$paginator->onFirstPage()` |  Decide se o páginas é a primeira página. |
|  `$paginator->onLastPage()` |  Determinar se o páginador está na última página. |
|  `$paginator->perPage()` |  O número de itens a serem mostrados por página. |
|  `$paginator->cursorAnterior()` |  Obtenha a instância do cursor para o conjunto de itens anteriores. |
|  `$paginator->url_do_página anterior` |  Obtenha a URL da página anterior. |
|  `$paginator->setCursorName()` |  Defina a variável de consulta utilizada para armazenar o cursor. |
|  `$paginator->url($cursor)` |  Obtenha o URL de uma instância de cursor especificada. |
