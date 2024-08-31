# Banco de dados: Paginação

<a name="introduction"></a>
## Introdução

Em outros frameworks, a paginação pode ser muito dolorosa. Esperamos que o modo de paginação do Laravel seja um alívio. O paginador do Laravel é integrado com o [construtor de consultas](/docs/queries) e o [ORM Eloquent](/docs/eloquent), e fornece uma paginação conveniente, fácil-de-usar para registros de banco de dados sem nenhuma configuração.

Por padrão, o HTML gerado pelo paginador é compatível com [o framework de CSS Tailwind](https://tailwindcss.com/); porém, também tem disponível suporte para paginação do Bootstrap.

<a name="tailwind-jit"></a>
#### Tailwind JIT

Se estiver usando as visualizações padrão de paginação do Laravel e o mecanismo de JIT do Tailwind, você deve garantir que a chave `content` no arquivo `tailwind.config.js` da sua aplicação refira às visualizações de paginação do Laravel para que suas classes do Tailwind não sejam purgadas:

```js
content: [
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './resources/**/*.vue',
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
],
```

<a name="basic-usage"></a>
## Uso Básico

<a name="paginating-query-builder-results"></a>
### Paginando os resultados do Query Builder

Existem várias maneiras de paginar itens. A mais simples é usando o método `paginate` no [construtor de consultas](/docs/queries) ou uma [consulta Eloquent](/docs/eloquent). O método `paginate` cuida automaticamente do `limit` e `offset` da consulta, com base na página atual que está sendo vista pelo usuário. Por padrão, a página atual é detectada pela valor do parâmetro "`page`" na *querystring* da requisição HTTP. Esse valor é automaticamente detectado pelo Laravel, e também inserido automaticamente em links gerados pelo `paginator`.

Neste exemplo, a única opção passada para o método `paginate` é o número de itens que gostaríamos de exibir por página. Neste caso, vamos especificar que gostaríamos de exibir 15 itens por página:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\DB;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Mostrar todos os usuários do aplicativo.
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
#### Paginações simples

O método `paginate` conta o número total de registros correspondidos pela consulta antes de buscar os registros no banco de dados. Isso é feito para que o `paginator` saiba quantas páginas de registros há no total. No entanto, se você não planeja mostrar o número total de páginas na interface do usuário do seu aplicativo então a consulta de contagem de registro é desnecessária.

Portanto, se você apenas precisa exibir os simples "Próximo" e "Anterior" em sua interface do usuário da aplicação, você pode usar o método `simplePaginate` para realizar uma única consulta eficiente:

```php
    $users = DB::table('users')->simplePaginate(15);
```

<a name="paginating-eloquent-results"></a>
### Paginando os Resultados Eloquents

Você também pode paginar as consultas [Eloquent](/docs/eloquent). Neste exemplo, vamos paginar o modelo `App\Models\User` e indicar que pretendemos exibir 15 registros por página. Como você pode ver, a sintaxe é praticamente idêntica à de paginação do construtor de consultas:

```php
    use App\Models\User;

    $users = User::paginate(15);
```

Claro, você pode chamar o método `paginate` depois de definir outras restrições da consulta, tais como cláusulas `where`:

```php
    $users = User::where('votes', '>', 100)->paginate(15);
```

Você também pode usar o método `simplePaginate` para paginar modelos Eloquent:

```php
    $users = User::where('votes', '>', 100)->simplePaginate(15);
```

Da mesma forma, você pode usar o método `cursorPaginate` para paginar modelos Eloquent:

```php
    $users = User::where('votes', '>', 100)->cursorPaginate(15);
```

<a name="multiple-paginator-instances-per-page"></a>
#### Várias instâncias do paginador por página

Às vezes, você pode precisar renderizar dois paginadores separados em uma única tela que é renderizada pelo seu aplicativo. No entanto, se ambas as instâncias do paginador usarem o parâmetro de string de consulta `page` para armazenar a página atual, os dois paginadores entrarão em conflito. Para resolver esse conflito, você pode passar o nome do parâmetro de string de consulta que deseja usar para armazenar a página atual do paginador por meio do terceiro argumento fornecido aos métodos `paginate`, `simplePaginate` e `cursorPaginate`:

```php
    use App\Models\User;

    $users = User::where('votes', '>', 100)->paginate(
        $perPage = 15, $columns = ['*'], $pageName = 'users'
    );
```

<a name="cursor-pagination"></a>
### Paginação do cursor

Enquanto `paginate` e `simplePaginate` criam consultas usando a cláusula SQL `offset`, a paginação do cursor funciona construindo cláusulas `where` que comparam os valores das colunas ordenadas contidas na consulta, fornecendo o melhor desempenho de banco de dados possível entre todos os métodos de paginação do Laravel. Este método de paginação é particularmente bem adequado para grandes conjuntos de dados e interfaces de usuário de rolagem infinita.

Diferentemente da paginação baseada em deslocamento, que inclui um número de página na sequência de consulta das URLs geradas pelo paginador, a paginação baseada em cursor coloca uma sequência de "cursor" na sequência de consulta. O cursor é uma sequência codificada contendo o local em que a próxima consulta paginada deve começar a paginar e a direção em que ela deve paginar:

```nothing
http://localhost/users?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

Você pode criar uma instância do paginador usando o método `cursorPaginate` fornecido pelo construtor de consultas. Este método retorna uma instância de `Illuminate\Pagination\CursorPaginator`:

```php
    $users = DB::table('users')->orderBy('id')->cursorPaginate(15);
```

Após recuperar uma instância do paginador de cursor, você pode [exibir os resultados da paginação](#displaying-pagination-results) como normalmente faria ao usar os métodos `paginate` e `simplePaginate`. Para obter mais informações sobre os métodos de instância oferecidos pelo paginador de cursor, consulte a [documentação do método de instância do paginador de cursor](#cursor-paginator-instance-methods).

::: warning ATENÇÃO
Sua consulta deve conter uma cláusula "*order by*" para aproveitar a paginação do cursor. Além disso, as colunas que a consulta são ordenadas devem ser da tabela na qual você está paginando.
:::

<a name="cursor-vs-offset-pagination"></a>
#### Cursor vs. Paginação por Deslocamento

Para ilustrar as diferenças entre paginação de deslocamento e paginação por cursor, vamos examinar algumas consultas SQL de exemplo. Ambas as seguintes consultas exibirão a "segunda página" de resultados para uma tabela "usuários" ordenada por "id":

```sql
# Offset Pagination...
select * from users order by id asc limit 15 offset 15;

# Cursor Pagination...
select * from users where id > 15 order by id asc limit 15;
```

A consulta de paginação do cursor oferece as seguintes vantagens sobre a paginação com deslocamento:

Para grandes conjuntos de dados, a paginação do cursor oferece melhor desempenho se as colunas "*order by*" forem indexadas. Isso ocorre porque a cláusula "*offset*" escaneia todos os dados previamente correspondidos.

Para conjuntos de dados com frequentes gravações, a paginação com deslocamento pode pular registros ou mostrar duplicatas caso resultados tenham sido recentemente adicionados ou excluídos da página que o usuário está visualizando.

No entanto, a paginação do cursor tem as seguintes limitações:

- Assim como o `simplePaginate`, a paginação por cursor só pode ser usada para exibir os botões "Next" e "Previous". Não suporta a geração de links com números de página.
- Exige que a ordem seja baseada em pelo menos uma coluna única ou uma combinação de colunas únicas. Colunas com `null` não são suportadas.
- As expressões de consulta nas cláusulas "*order by*" são suportadas apenas se forem renomeadas e adicionadas na cláusula "*select*" também.
- Expressões de consulta com parâmetros não são suportadas.

<a name="manually-creating-a-paginator"></a>
### Criando manualmente um paginador

Às vezes, você pode desejar criar uma instância de paginação manualmente, passando a ela um *array* de itens que você já tem na memória. Você pode fazer isso criando uma instância `Illuminate\Pagination\Paginator`, `Illuminate\Pagination\LengthAwarePaginator` ou `Illuminate\Pagination\CursorPaginator`, dependendo de suas necessidades.

As classes `Paginator` e `CursorPaginator` não precisam saber o número total de itens no conjunto de resultados; por outro lado, estas classes não possuem métodos para recuperar o índice da última página. A classe `LengthAwarePaginator` aceita argumentos quase os mesmos que a classe `Paginator`; contudo, necessita uma contagem do número total de itens no conjunto de resultados.

Em outras palavras, o `Paginator` corresponde ao método `simplePaginate` do construtor de consultas, o `CursorPaginator` corresponde ao método `cursorPaginate`, e o `LengthAwarepaginator` corresponde ao método `paginate`.

::: warning ATENÇÃO
Ao criar manualmente uma instância de paginador você deve "fatiar" manualmente a matriz de resultados que passa para o paginador. Se não tiver certeza como fazer isso, consulte a função [array_slice](https://secure.php.net/manual/en/function.array-slice.php) do PHP.
:::

<a name="customizing-pagination-urls"></a>
### Personalizando URLs de Paginação

Por padrão, os links gerados pelo paginador combinam com o URI da requisição atual. Entretanto, a função `withPath` permite personalizar o URI usado pelo paginador ao gerar links. Por exemplo, se você quer que o paginator gere links como `http://example.com/admin/users?page=N`, você deve passar `/admin/users` para o método `withPath`:

```php
    use App\Models\User;

    Route::get('/users', function () {
        $users = User::paginate(15);

        $users->withPath('/admin/users');

        // ...
    });
```

<a name="appending-query-string-values"></a>
#### Anexando Valores de QueryString

Você pode anexar à string de consulta de links de paginação usando o método `appends`. Por exemplo, para anexar `sort=votes` a cada link de paginação, você deve fazer a seguinte chamada para `appends`:

```php
    use App\Models\User;

    Route::get('/users', function () {
        $users = User::paginate(15);

        $users->appends(['sort' => 'votes']);

        // ...
    });
```

Você pode usar o método `withQueryString` se quiser acrescentar todos os valores do atual pedido de consulta às paginas:

```php
    $users = User::paginate(15)->withQueryString();
```

<a name="appending-hash-fragments"></a>
#### Anexando fragmentos de hash

Se você precisa anexar um "fragmento de hash" a URLs geradas pelo paginador, você pode usar o método `fragment`. Por exemplo, para anexar `#users` ao final de cada link de paginação, você deve invocar o método `fragment` assim:

```php
    $users = User::paginate(15)->fragment('users');
```

<a name="displaying-pagination-results"></a>
## Mostrando os resultados de paginação

Ao chamar o método `paginate`, você receberá uma instância de `Illuminate\Pagination\LengthAwarePaginator`, enquanto chamar o método `simplePaginate` retorna uma instância de `Illuminate\Pagination\Paginator`. E, finalmente, chamar o método `cursorPaginate` retorna uma instância de `Illuminate\Pagination\CursorPaginator`.

Esses objetos fornecem vários métodos que descrevem o conjunto de resultados. Além desses métodos de ajuda, as instâncias do paginador são iteradores e podem ser repetidos como um array. Então, depois de ter retirado os resultados, você pode exibir os resultados e renderizar os links da página usando [Blade](docs/blade):

```blade
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

O método `links` renderiza os links para o restante das páginas no conjunto de resultados. Cada um desses links já conterá a variável de consulta de página apropriada. Lembre-se, o HTML gerado pelo método `links` é compatível com o [framework Tailwind CSS](https://tailwindcss.com).

<a name="adjusting-the-pagination-link-window"></a>
### Ajustando a janela de link de paginação

Quando o paginador exibe links de paginação, o número da página atual é exibido, bem como links para as três páginas antes e depois da página atual. Usando o método `onEachSide`, você pode controlar quantos links adicionais são exibidos em cada lado da página atual dentro da janela deslizante do meio de links gerados pelo paginador:

```blade
{{ $users->onEachSide(5)->links() }}
```

<a name="converting-results-to-json"></a>
### Conversão de Resultados em JSON

As classes paginadoras do Laravel implementam o contrato de interface `Illuminate\Contracts\Support\Jsonable` e expõem o método `toJson`, então é muito fácil converter seus resultados de paginação para JSON. Você também pode converter uma instância do paginador para JSON retornando-a de uma rota ou ação do controlador:

```php
    use App\Models\User;

    Route::get('/users', function () {
        return User::paginate();
    });
```

O JSON do paginador incluirá *meta* informações como "total", "current_page", "last_page" e mais. Os registros resultantes estão disponíveis através da chave "data" no *array* JSON. Aqui está um exemplo do JSON criado pelo retorno de uma instância de paginador de uma rota:

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
## Personalizando a *View* da Paginação

Por padrão, as visualizações renderizadas para exibir os links de paginação são compatíveis com o [framework Tailwind CSS](https://tailwindcss.com). No entanto, se você não estiver usando Tailwind, você é livre para definir suas próprias visualizações para renderizar esses links. Ao chamar o método `links` em uma instância do paginator, você pode passar o nome da *view* como o primeiro argumento do método:

```blade
{{ $paginator->links('view.name') }}

<!-- Passando dados adicionais para a view... -->
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```

Porém, a maneira mais fácil de personalizar as visualizações de paginação é exportando-as para o seu diretório `resources/views/vendor` usando o comando `vendor:publish`:

```shell
php artisan vendor:publish --tag=laravel-pagination
```

Este comando colocará os views no diretório `resources/views/vendor/pagination` do seu aplicativo. O arquivo `tailwind.blade.php` dentro deste diretório corresponde à exibição padrão de paginação. Você pode editar este arquivo para modificar o HTML da paginação.

Se você quiser designar um arquivo diferente como a visualização de paginação padrão, você pode invocar os métodos `defaultView` e `defaultSimpleView` do paginador dentro do método `boot` da sua classe `App\Providers\AppServiceProvider`:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Pagination\Paginator;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Inicialize qualquer serviço de aplicativo.
         */
        public function boot(): void
        {
            Paginator::defaultView('view-name');

            Paginator::defaultSimpleView('view-name');
        }
    }
```

<a name="using-bootstrap"></a>
### Usando Bootstrap

O Laravel inclui as `views` de paginação construídas usando [CSS Bootstrap](https://getbootstrap.com/). Para usar essas *views* em vez das `views` padrão do Tailwind, você pode chamar os métodos `useBootstrapFour` ou `useBootstrapFive` do paginator dentro do método `boot` da sua classe `App\Providers\AppServiceProvider`:

```php
    use Illuminate\Pagination\Paginator;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Paginator::useBootstrapFive();
        Paginator::useBootstrapFour();
    }
```

<a name="paginator-instance-methods"></a>
## Métodos de instância do Cursor Paginator

Cada instância de paginador fornece informações adicionais sobre paginação por meio dos seguintes métodos:

| Método                                | Descrição                                                                 |
|---------------------------------------|---------------------------------------------------------------------------|
| `$paginator->count()`                 | Obtenha o número de itens para a página atual.                            |
| `$paginator->cursor()`                | Obtenha a instância atual do cursor.                                      |
| `$paginator->getOptions()`            | Obtenha as opções do paginador.                                           |
| `$paginator->hasPages()`              | Determine se há itens suficientes para dividir em várias páginas.         |
| `$paginator->hasMorePages()`          | Determine se há mais itens no armazenamento de dados.                     |
| `$paginator->getCursorName()`         | Obtenha a variável de string de consulta usada para armazenar o cursor.   |
| `$paginator->items()`                 | Obtenha os itens para a página atual.                                     |
| `$paginator->nextCursor()`            | Obtenha a instância do cursor para o próximo conjunto de itens.           |
| `$paginator->nextPageUrl()`           | Obtenha o URL para a próxima página.                                      |
| `$paginator->onFirstPage()`           | Determine se o paginador está na primeira página.                         |
| `$paginator->onLastPage()`            | Determine se o paginador está na última página.                           |
| `$paginator->perPage()`               | O número de itens a serem exibidos por página.                            |
| `$paginator->previousCursor()`        | Obtenha a instância do cursor para o conjunto anterior de itens.          |
| `$paginator->previousPageUrl()`       | Obtenha o URL da página anterior.                                         |
| `$paginator->setCursorName()`         | Defina a variável de string de consulta usada para armazenar o cursor.    |
| `$paginator->url($cursor)`            | Obter a URL para uma determinada instância do cursor.                     |