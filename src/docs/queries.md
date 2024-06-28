# Banco de dados: Construtor de consultas

<a name="introduction"></a>
## Introdução

 A construção de consultas de base de dados fornecida pelo Laravel fornece uma interface fluente e conveniente para a criação e execução de consultas de bases de dados. Ela pode ser utilizada na maioria das operações de banco de dados da sua aplicação, e funciona perfeitamente com todos os sistemas de base de dados suportados pelo Laravel.

 O construtor de consulta do Laravel utiliza o vinculamento de parâmetro PDO para proteger a aplicação contra ataques de injeção SQL. Não é necessário limpar ou sanitizar strings passadas ao construtor de consultas, pois os vínculos são realizados pelo sistema.

 > [!AVISO]
 > O ANSP não suporta vinculação de nomes de coluna. Portanto, você nunca deve permitir que a entrada do usuário dite os nomes das colunas referenciadas por suas consultas, incluindo as colunas "ordenar por".

<a name="running-database-queries"></a>
## Executar consultas de banco de dados

<a name="retrieving-all-rows-from-a-table"></a>
#### Recuperar todas as linhas de uma tabela

 É possível usar o método `table`, oferecido pela façade `DB`, para iniciar uma consulta. O método `table` retorna uma instância do construtor de consultas fluente para a tabela especificada, permitindo que você junte mais restrições à consulta e, então, finalize a recuperação dos resultados da consulta usando o método `get`:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Support\Facades\DB;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Show a list of all of the application's users.
         */
        public function index(): View
        {
            $users = DB::table('users')->get();

            return view('user.index', ['users' => $users]);
        }
    }
```

 O método `get` retorna uma instância de `Illuminate\Support\Collection`, que contém os resultados da consulta, onde cada resultado é uma instância do objeto PHP `stdClass`. Pode aceder ao valor de cada coluna acessando-as como propriedades do objeto:

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')->get();

    foreach ($users as $user) {
        echo $user->name;
    }
```

 > [!NOTA]
 [Documentação da coleção] (/).

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### Recuperar uma linha única de uma tabela

 Se você só precisa de recuperar uma linha de uma tabela do banco de dados, pode usar o método `first`, que retorna um único objeto `stdClass`:

```php
    $user = DB::table('users')->where('name', 'John')->first();

    return $user->email;
```

 Se você não precisa de uma linha inteira, poderá extrair um único valor de um registro usando o método `value`. Este método retornará o valor da coluna diretamente:

```php
    $email = DB::table('users')->where('name', 'John')->value('email');
```

 Para recuperar uma linha única pelo valor da coluna 'id', utilize o método `find`:

```php
    $user = DB::table('users')->find(3);
```

<a name="retrieving-a-list-of-column-values"></a>
#### Recuperar um conjunto de valores para as colunas

 Se você quiser recuperar uma instância da coleção `Illuminate\Support\Collection`, contendo os valores de uma única coluna, você pode usar o método `pluck`. Neste exemplo, nós vamos recuperar uma coleção de títulos do usuário:

```php
    use Illuminate\Support\Facades\DB;

    $titles = DB::table('users')->pluck('title');

    foreach ($titles as $title) {
        echo $title;
    }
```

 Você pode especificar a coluna que a coleção resultante deve usar como chaves, fornecendo um segundo argumento para o método `pluck`:

```php
    $titles = DB::table('users')->pluck('title', 'name');

    foreach ($titles as $name => $title) {
        echo $title;
    }
```

<a name="chunking-results"></a>
### Resultados de chunking

 Se você precisa trabalhar com milhares de registros do banco de dados, considere usar o método `chunk` fornecido pela facade `DB`. Este método recupera um pequeno bloco de resultados de cada vez e alimenta cada bloco em uma função fechada para processamento. Por exemplo, vamos recuperar toda a tabela `users` em blocos de 100 registros por vez:

```php
    use Illuminate\Support\Collection;
    use Illuminate\Support\Facades\DB;

    DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
        foreach ($users as $user) {
            // ...
        }
    });
```

 É possível interromper o processamento de novas porções retornando `false` do fechamento:

```php
    DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
        // Process the records...

        return false;
    });
```

 Se estiver a atualizar registos de base de dados ao mesmo tempo que efetua o chunking dos resultados, os resultados do chunk podem mudar de maneira inesperada. Se planeia atualizar os registos recuperados enquanto efetua o chunking, é sempre melhor utilizar a método `chunkById`. Este método paginará automaticamente os resultados com base na chave primária do registo:

```php
    DB::table('users')->where('active', false)
        ->chunkById(100, function (Collection $users) {
            foreach ($users as $user) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['active' => true]);
            }
        });
```

 > [!AVISO]
 > Ao atualizar ou apagar registros dentro do callback de segmentos, as alterações na chave primária ou nas chaves estrangeiras podem afetar a consulta do segmento. Isso poderia resultar no não-inclusão de registros nos resultados divididos em segmentos.

<a name="streaming-results-lazily"></a>
### Resultados de streaming sem esforço

 O método `lazy` funciona de forma semelhante ao método [chunk](#chunking-results) no sentido de executar a consulta em lotes, mas, em vez de passar cada lote para um callback, o método `lazy()` retorna uma [`LazyCollection`](/docs/collections#lazy-collections), que permite interagir com os resultados como um único fluxo:

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```

 Novamente, se você pretende atualizar os registros recuperados durante a iteração dos mesmos, é melhor usar o método `lazyById` ou `lazyByIdDesc`. Estes métodos farão automaticamente a paginação dos resultados com base na chave primária do registro:

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

 > [!AVISO]
 > Ao atualizar ou excluir registros ao passar por eles em iteração, alterações no(s) principal(is)/chave estrangeira(s) podem afetar a consulta de segmentos. Isso poderia resultar na exclusão de registros nos resultados.

<a name="aggregates"></a>
### Agregados

 O construtor de consultas também oferece vários métodos para recuperar valores agregados, como `contagem`, `máximo`, `mínimo`, `mediana` e `somatório`. Você pode chamar qualquer um desses métodos depois que sua consulta estiver construída:

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')->count();

    $price = DB::table('orders')->max('price');
```

 Claro que você pode combinar esses métodos com outros parâmetros para ajustar melhor os cálculos do valor agregado.

```php
    $price = DB::table('orders')
                    ->where('finalized', 1)
                    ->avg('price');
```

<a name="determining-if-records-exist"></a>
#### Determinar se há registros

 Ao invés de usar o método `count` para determinar se existem registros que atendam às restrições da consulta, você pode usar os métodos `exists` e `doesntExist`:

```php
    if (DB::table('orders')->where('finalized', 1)->exists()) {
        // ...
    }

    if (DB::table('orders')->where('finalized', 1)->doesntExist()) {
        // ...
    }
```

<a name="select-statements"></a>
## Selecione Declarações

<a name="specifying-a-select-clause"></a>
#### Especificando uma Cláusula de Seleção

 Nem sempre deseja selecionar todas as colunas de uma tabela de banco de dados. Com o método `select`, você pode especificar uma cláusula "selecione" personalizada para a consulta:

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')
                ->select('name', 'email as user_email')
                ->get();
```

 O método `distinct` permite obrigar a consulta a devolver resultados distintos:

```php
    $users = DB::table('users')->distinct()->get();
```

 Se você já tiver uma instância de builder de consulta e desejar adicionar uma coluna à cláusula "SELECT" existente, poderá usar o método `addSelect`:

```php
    $query = DB::table('users')->select('name');

    $users = $query->addSelect('age')->get();
```

<a name="raw-expressions"></a>
## Expressões sem processamento

 Às vezes você pode precisar inserir uma cadeia de caracteres aleatória em uma consulta. Para criar uma expressão de string bruta, utilize o método `raw`, fornecido pela façana `DB`:

```php
    $users = DB::table('users')
                 ->select(DB::raw('count(*) as user_count, status'))
                 ->where('status', '<>', 1)
                 ->groupBy('status')
                 ->get();
```

 > [Atenção]
 > As declarações brutos serão injetadas na consulta como cadeias de caracteres. Por isso deve ter um cuidado redobrado para evitar a criação de vulnerabilidades da injeção de SQL.

<a name="raw-methods"></a>
### Métodos Brutos

 Em vez de usar o método `DB::raw`, você também pode usar os seguintes métodos para inserir expressões brutos em várias partes da sua consulta. **Lembre-se, a Laravel não garante que qualquer consulta que use expressões brutas esteja protegida contra vulnerabilidades de injeção SQL**.

<a name="selectraw"></a>
#### `selecionar bruto`

 O método `selectRaw` pode ser utilizado em vez de `addSelect(DB::raw(/* ... */))`. Este método aceita como segundo argumento uma matriz opcional de ligações:

```php
    $orders = DB::table('orders')
                    ->selectRaw('price * ? as price_with_tax', [1.0825])
                    ->get();
```

<a name="whereraw-orwhereraw"></a>
#### `ondeBruto/ouWhereBrutal`

 Os métodos `whereRaw` e `orWhereRaw` podem ser utilizados para injetar uma cláusula "where" em sua consulta. Estes métodos aceitam um array opcional de ligações como seu segundo argumento:

```php
    $orders = DB::table('orders')
                    ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
                    ->get();
```

<a name="havingraw-orhavingraw"></a>
#### `tendoRaw/ouTendoRaw`

 Os métodos `havingRaw` e `orHavingRaw` podem ser usados para fornecer uma string bruta como valor da cláusula "having". Estes métodos aceitam um array de vinculações opcional como segundo argumento:

```php
    $orders = DB::table('orders')
                    ->select('department', DB::raw('SUM(price) as total_sales'))
                    ->groupBy('department')
                    ->havingRaw('SUM(price) > ?', [2500])
                    ->get();
```

<a name="orderbyraw"></a>
#### `orderByRaw`

 É possível usar o método `orderByRaw` para fornecer uma string bruta como valor da cláusula de "ordenar por":

```php
    $orders = DB::table('orders')
                    ->orderByRaw('updated_at - created_at DESC')
                    ->get();
```

<a name="groupbyraw"></a>
### `groupByRaw`

 O método `groupByRaw` pode ser usado para fornecer uma cadeia de texto sem formatação como valor da cláusula `group by`:

```php
    $orders = DB::table('orders')
                    ->select('city', 'state')
                    ->groupByRaw('city, state')
                    ->get();
```

<a name="joins"></a>
## Joins

<a name="inner-join-clause"></a>
#### Cláusula de junção interna

 O construtor de consultas pode também ser usado para adicionar cláusulas de união às suas consultas. Para realizar uma "união interna" básica, pode utilizar o método `join` numa instância do construtor de consultas. O primeiro argumento passado ao método `join` é o nome da tabela a que necessita de ser unida. Os restantes argumentos especificam as restrições de coluna para a união. Pode até mesmo realizar uma união de várias tabelas numa única consulta:

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')
                ->join('contacts', 'users.id', '=', 'contacts.user_id')
                ->join('orders', 'users.id', '=', 'orders.user_id')
                ->select('users.*', 'contacts.phone', 'orders.price')
                ->get();
```

<a name="left-join-right-join-clause"></a>
#### Cláusula de União Esquerda/Direita

 Se pretender executar uma operação de "juntada esquerda" ou "juntada direita" em vez de uma "juntada interna", utilize os métodos `leftJoin` ou `rightJoin`. Estes têm a mesma assinatura que o método `join`:

```php
    $users = DB::table('users')
                ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
                ->get();

    $users = DB::table('users')
                ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
                ->get();
```

<a name="cross-join-clause"></a>
#### Cláusula de União

 Você pode usar o método `crossJoin` para executar uma "união cruzada". As uniões cruzadas geram um produto cartesiano entre a primeira tabela e a tabela associada:

```php
    $sizes = DB::table('sizes')
                ->crossJoin('colors')
                ->get();
```

<a name="advanced-join-clauses"></a>
#### Cláusulas de junção avançadas

 Também é possível especificar cláusulas de união mais avançadas. Para começar, passar um closures como segundo argumento ao método `join`. O closures receberá uma instância da classe `Illuminate\Database\Query\JoinClause`, permitindo a especificação de restrições na cláusula "união":

```php
    DB::table('users')
            ->join('contacts', function (JoinClause $join) {
                $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
            })
            ->get();
```

 Se pretender usar uma cláusula "where" nas suas operações de junção, poderá utilizar os métodos `where` e `orWhere` fornecidos pela instância `JoinClause`. Em vez de compararem duas colunas, estes métodos irão comparar a coluna com um valor:

```php
    DB::table('users')
            ->join('contacts', function (JoinClause $join) {
                $join->on('users.id', '=', 'contacts.user_id')
                     ->where('contacts.user_id', '>', 5);
            })
            ->get();
```

<a name="subquery-joins"></a>
#### Uniões de subconjunto

 Você pode usar os métodos `joinSub`, `leftJoinSub`, e `rightJoinSub` para unir uma consulta a uma sub-consulta. Cada um destes métodos recebe três argumentos: a sub-consulta, o alias da tabela relacionada, e um fechamento que define as colunas relacionadas. Neste exemplo, vamos obter uma coleção de usuários onde cada registro do usuário também contém a data e hora `created_at` (timestamp) do post mais recente do blog desse usuário:

```php
    $latestPosts = DB::table('posts')
                       ->select('user_id', DB::raw('MAX(created_at) as last_post_created_at'))
                       ->where('is_published', true)
                       ->groupBy('user_id');

    $users = DB::table('users')
            ->joinSub($latestPosts, 'latest_posts', function (JoinClause $join) {
                $join->on('users.id', '=', 'latest_posts.user_id');
            })->get();
```

<a name="lateral-joins"></a>
#### Juntas laterais

 > Aviso [!AVERTISSEMENT]
 > Atualmente, as junções laterais são suportadas pelos sistemas PostgreSQL e SQL Server.

 Você pode usar os métodos `joinLateral` e `leftJoinLateral` para executar uma "joia lateral" com um sub-queroy. Cada um desses métodos recebe dois argumentos: o sub-queroy e seu alias de tabela. A(s) condição(ões) de join devem ser especificadas dentro da cláusula `where` do sub-queroy especificado. Joins laterais são avaliadas para cada linha e podem fazer referência a colunas fora do sub-queroy.

 Neste exemplo, recuperaremos uma coleção de utilizadores assim como os três posts de blog mais recentes do utilizador. Cada utilizador pode gerar um máximo de três linhas no conjunto de resultados: uma para cada um dos seus posts de blog mais recentes. A condição de associação é especificada com uma cláusula `whereColumn` na sub-query, referenciando a linha atual do utilizador:

```php
    $latestPosts = DB::table('posts')
                       ->select('id as post_id', 'title as post_title', 'created_at as post_created_at')
                       ->whereColumn('user_id', 'users.id')
                       ->orderBy('created_at', 'desc')
                       ->limit(3);

    $users = DB::table('users')
                ->joinLateral($latestPosts, 'latest_posts')
                ->get();
```

<a name="unions"></a>
## Sindicatos

 O construtor de consultas também fornece uma conveniente maneira de "fusionar" duas ou mais consultas juntas. Por exemplo, você pode criar uma consulta inicial e usar o método `union` para uni-la a outras consultas:

```php
    use Illuminate\Support\Facades\DB;

    $first = DB::table('users')
                ->whereNull('first_name');

    $users = DB::table('users')
                ->whereNull('last_name')
                ->union($first)
                ->get();
```

 Além do método `union`, o construtor de consultas disponibiliza o método `unionAll`. As consultas combinadas com o uso do método `unionAll` não têm os seus resultados duplicados removidos. O método `unionAll` tem a mesma assinatura de método que o método `union`.

<a name="basic-where-clauses"></a>
## Condicional de Localização

<a name="where-clauses"></a>
### Onde as cláusulas

 Para adicionar cláusulas WHERE à consulta, pode utilizar o método `where` do construtor de consultas. A chamada mais básica para este método requer três argumentos. O primeiro é o nome da coluna. O segundo é um operador, que pode ser qualquer um dos operadores suportados pelo banco de dados. O terceiro é o valor a comparar com o valor da coluna.

 Por exemplo, a consulta a seguir recupera os usuários cujo valor da coluna "votes" é igual a `100` e o valor da coluna "age" é maior que `35`:

```php
    $users = DB::table('users')
                    ->where('votes', '=', 100)
                    ->where('age', '>', 35)
                    ->get();
```

 Para conveniência, caso você queira verificar se uma coluna é igual a um determinado valor, pode passar o valor como segundo argumento ao método where. O Laravel assumirá que deseja utilizar o operador `=`:

```php
    $users = DB::table('users')->where('votes', 100)->get();
```

 Como já mencionado, você pode usar qualquer operador que seja suportado pelo seu sistema de banco de dados:

```php
    $users = DB::table('users')
                    ->where('votes', '>=', 100)
                    ->get();

    $users = DB::table('users')
                    ->where('votes', '<>', 100)
                    ->get();

    $users = DB::table('users')
                    ->where('name', 'like', 'T%')
                    ->get();
```

 Você também pode passar um array de condições para a função `where`. Cada elemento do array deve conter uma matriz contendo os três argumentos normalmente passados para o método `where`:

```php
    $users = DB::table('users')->where([
        ['status', '=', '1'],
        ['subscribed', '<>', '1'],
    ])->get();
```

 > [AVISO]
 > O ADO não suporta vinculação de nomes de colunas. Portanto, nunca deve permitir que a entrada do usuário determine os nomes das colunas referenciadas pelas consultas, incluindo as colunas "ordenar por".

<a name="or-where-clauses"></a>
### Onde as cláusulas

 Ao concatenar chamadas ao método "where" do construtdor de consulta, as cláusulas "where" serão unidas utilizando o operador "and". No entanto, você pode usar o método "orWhere" para juntar uma cláusula à consulta usando o operador "or". O método "orWhere" aceita os mesmos argumentos que o método "where":

```php
    $users = DB::table('users')
                        ->where('votes', '>', 100)
                        ->orWhere('name', 'John')
                        ->get();
```

 Se você precisa agrupar uma condição de "ou" entre parênteses, pode passar um fechamento como primeiro argumento para o método `orWhere`:

```php
    $users = DB::table('users')
                ->where('votes', '>', 100)
                ->orWhere(function (Builder $query) {
                    $query->where('name', 'Abigail')
                          ->where('votes', '>', 50);
                })
                ->get();
```

 O exemplo acima produz o seguinte SQL:

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

 > [!AVISO]
 > É sempre aconselhável agrupar chamadas de `orWhere` para evitar comportamentos inesperados quando é aplicada a escala global.

<a name="where-not-clauses"></a>
### Onde não se aplicam as cláusulas

 Os métodos `whereNot` e `orWhereNot` podem ser usados para rejeitar um determinado grupo de restrições de consulta. Por exemplo, a seguinte consulta exclui produtos que estejam em liquidação ou com preços inferiores a dez:

```php
    $products = DB::table('products')
                    ->whereNot(function (Builder $query) {
                        $query->where('clearance', true)
                              ->orWhere('price', '<', 10);
                    })
                    ->get();
```

<a name="where-any-all-clauses"></a>
### Onde as cláusulas Todo/Todo

 Algumas vezes pode ser necessário aplicar as mesmas restrições de consulta para várias colunas. Por exemplo, poderá pretender recuperar todos os registos onde quaisquer colunas numa lista dada são semelhantes a um valor determinado. Isto é efetuado utilizando o método `whereAny`:

```php
    $users = DB::table('users')
                ->where('active', true)
                ->whereAny([
                    'name',
                    'email',
                    'phone',
                ], 'LIKE', 'Example%')
                ->get();
```

 A consulta acima resultará no seguinte código SQL:

```sql
SELECT *
FROM users
WHERE active = true AND (
    name LIKE 'Example%' OR
    email LIKE 'Example%' OR
    phone LIKE 'Example%'
)
```

 Da mesma forma, o método `whereAll` pode ser utilizado para recuperar registos onde todas as colunas indicadas correspondam a um determinado critério.

```php
    $posts = DB::table('posts')
                ->where('published', true)
                ->whereAll([
                    'title',
                    'content',
                ], 'LIKE', '%Laravel%')
                ->get();
```

 A pergunta acima irá gerar o seguinte SQL:

```sql
SELECT *
FROM posts
WHERE published = true AND (
    title LIKE '%Laravel%' AND
    content LIKE '%Laravel%'
)
```

<a name="json-where-clauses"></a>
### JSON Cláusulas WHERE

 O Laravel também suporta consultas de tipos de colunas JSON em bases de dados que disponibilizem suporte para tipos de coluna JSON. Atualmente, isto inclui o MySQL 8.0+, PostgreSQL 12.0+, SQL Server 2017+ e SQLite 3.39.0+ (com a [extensão JSON1](https://www.sqlite.org/json1.html)). Para consultar uma coluna JSON, utilize o operador `->`:

```php
    $users = DB::table('users')
                    ->where('preferences->dining->meal', 'salad')
                    ->get();
```

 Você pode usar o `whereJsonContém` para consultar matrizes JSON:

```php
    $users = DB::table('users')
                    ->whereJsonContains('options->languages', 'en')
                    ->get();
```

 Se o seu aplicativo utilizar os bancos de dados MySQL ou PostgreSQL, poderá transmitir um conjunto de valores para a metodologia `whereJsonContains`:

```php
    $users = DB::table('users')
                    ->whereJsonContains('options->languages', ['en', 'de'])
                    ->get();
```

 Você pode usar o método `whereJsonLength` para consultar arrays de JSON por sua extensão:

```php
    $users = DB::table('users')
                    ->whereJsonLength('options->languages', 0)
                    ->get();

    $users = DB::table('users')
                    ->whereJsonLength('options->languages', '>', 1)
                    ->get();
```

<a name="additional-where-clauses"></a>
### Adicionalidade de cláusulas de destino

 **whereBetween/ouWhereBetween**

 O método `whereBetween` verifica se um valor de coluna está entre dois valores:

```php
    $users = DB::table('users')
               ->whereBetween('votes', [1, 100])
               ->get();
```

 **/ou**

 O método `whereNotBetween` verifica se o valor de uma coluna está fora dos dois valores:

```php
    $users = DB::table('users')
                        ->whereNotBetween('votes', [1, 100])
                        ->get();
```

 **whereBetweenColumns/ whereNotBetweenColumns/ ouWhereBetweenColumns/ ouWhereNotBetweenColumns**

 O método `whereBetweenColumns` verifica se o valor de uma coluna está entre os valores de duas outras colunas da mesma linha na tabela:

```php
    $patients = DB::table('patients')
                           ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
                           ->get();
```

 O método `whereNotBetweenColumns` verifica se o valor de uma determinada coluna está fora dos valores das duas colunas da mesma linha na tabela.

```php
    $patients = DB::table('patients')
                           ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
                           ->get();
```

 **whereIn / whereNotIn / orWhereIn / orWhereNotIn**

 O método whereIn verifica se um determinado valor de uma coluna está contido no conjunto de valores fornecido por um array.

```php
    $users = DB::table('users')
                        ->whereIn('id', [1, 2, 3])
                        ->get();
```

 O método `whereNotIn` verifica se o valor da coluna fornecida não está contido no conjunto de dados:

```php
    $users = DB::table('users')
                        ->whereNotIn('id', [1, 2, 3])
                        ->get();
```

 Você também pode fornecer um objeto de consulta como o segundo argumento do método `whereIn`:

```php
    $activeUsers = DB::table('users')->select('id')->where('is_active', 1);

    $users = DB::table('comments')
                        ->whereIn('user_id', $activeUsers)
                        ->get();
```

 O exemplo acima produzirá o seguinte SQL:

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

 > [Atenção]
 > Se você estiver adicionando um grande array de vinculações inteiras para sua consulta, os métodos `whereIntegerInRaw` ou `whereIntegerNotInRaw` podem ser usados para reduzir significativamente o uso da memória.

 **whereNull/ onde não existe /ouWhereNull / ouWhereNotNull**

 O método `whereNull` verifica se o valor da coluna indicada é `NULL`:

```php
    $users = DB::table('users')
                    ->whereNull('updated_at')
                    ->get();
```

 O método `whereNotNull` verifica se o valor da coluna não é `NULL`.

```php
    $users = DB::table('users')
                    ->whereNotNull('updated_at')
                    ->get();
```

 **whereDate/whereMonth/whereDay/whereYear/whereTime**

 O método `whereDate` pode ser utilizado para comparar um valor de coluna com uma data:

```php
    $users = DB::table('users')
                    ->whereDate('created_at', '2016-12-31')
                    ->get();
```

 O método `whereMonth` permite comparar o valor de uma coluna com um mês específico:

```php
    $users = DB::table('users')
                    ->whereMonth('created_at', '12')
                    ->get();
```

 O método `whereDay` pode ser usado para comparar um valor de coluna com um dia específico do mês:

```php
    $users = DB::table('users')
                    ->whereDay('created_at', '31')
                    ->get();
```

 O método `whereYear` pode ser utilizado para comparar o valor de uma coluna com um ano específico:

```php
    $users = DB::table('users')
                    ->whereYear('created_at', '2016')
                    ->get();
```

 O método `whereTime` pode ser usado para comparar o valor de uma coluna com um determinado horário:

```php
    $users = DB::table('users')
                    ->whereTime('created_at', '=', '11:20:45')
                    ->get();
```

 **ouWhereColumn**

 O método `whereColumn` pode ser utilizado para verificar se duas colunas são iguais:

```php
    $users = DB::table('users')
                    ->whereColumn('first_name', 'last_name')
                    ->get();
```

 Também é possível utilizar um operador de comparação com o método `whereColumn`:

```php
    $users = DB::table('users')
                    ->whereColumn('updated_at', '>', 'created_at')
                    ->get();
```

 Você também pode passar um array de comparações de colunas para o método `whereColumn`. Essas condições serão unidas usando o operador `and`:

```php
    $users = DB::table('users')
                    ->whereColumn([
                        ['first_name', '=', 'last_name'],
                        ['updated_at', '>', 'created_at'],
                    ])->get();
```

<a name="logical-grouping"></a>
### Agrupamento lógico

 Às vezes você pode precisar agrupar várias cláusulas "onde" entre parênteses para conseguir o agrupamento lógico desejado em sua consulta. Na verdade, geralmente é sempre necessário agrupar os chamados para o método `orWhere` entre parêntesis para evitar comportamentos inesperados da consulta. Para isso, você pode passar um fechamento ao método `where`:

```php
    $users = DB::table('users')
               ->where('name', '=', 'John')
               ->where(function (Builder $query) {
                   $query->where('votes', '>', 100)
                         ->orWhere('title', '=', 'Admin');
               })
               ->get();
```

 Como você pode ver, o passar de uma construção de função para o método `where` indica ao construtor de consultas que irá iniciar um grupo de restrições. O fechamento receberá uma instância do construtor de consulta que poderá ser usada para definir as restrições que devem estar contidas no parênteses do grupo. O exemplo acima produz o seguinte SQL:

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

 > [AVISO]
 > Você deve sempre agrupar chamadas de `orWhere` para evitar comportamentos inesperados quando escopos globais são aplicados.

<a name="advanced-where-clauses"></a>
### Avançado – Conjuntos de condicionalidade

<a name="where-exists-clauses"></a>
### Onde existem cláusulas

 O método `whereExists` permite que você escreva cláusulas SQL do tipo "where exists". O método `whereExists` aceita um closure que receberá uma instância do constructor da Query, permitindo definir a consulta que deve ser colocada dentro da cláusula "exists":

```php
    $users = DB::table('users')
               ->whereExists(function (Builder $query) {
                   $query->select(DB::raw(1))
                         ->from('orders')
                         ->whereColumn('orders.user_id', 'users.id');
               })
               ->get();
```

 Como alternativa, você pode fornecer um objeto de consulta ao método `whereExists` em vez de um fecho (closure):

```php
    $orders = DB::table('orders')
                    ->select(DB::raw(1))
                    ->whereColumn('orders.user_id', 'users.id');

    $users = DB::table('users')
                        ->whereExists($orders)
                        ->get();
```

 Ambos os exemplos acima produzirão o seguinte SQL:

```sql
select * from users
where exists (
    select 1
    from orders
    where orders.user_id = users.id
)
```

<a name="subquery-where-clauses"></a>
### Subconsulta em Cláusulas Where

 Às vezes é necessário construir uma cláusula de "onde" que compara os resultados de uma sub-consulta com um valor dado. Pode ser realizada através da passagem de um fecho e um valor para o método `where`. Por exemplo, a seguinte consulta irá recuperar todos os utilizadores que tenham recentemente "aderido" a um tipo específico;

```php
    use App\Models\User;
    use Illuminate\Database\Query\Builder;

    $users = User::where(function (Builder $query) {
        $query->select('type')
            ->from('membership')
            ->whereColumn('membership.user_id', 'users.id')
            ->orderByDesc('membership.start_date')
            ->limit(1);
    }, 'Pro')->get();
```

 Talvez seja necessário construir uma cláusula "WHERE" que compare uma coluna com os resultados de uma sub-consulta. Isso pode ser feito passando uma coluna, operador e um fechamento ao método `where`. Por exemplo, a seguinte consulta recuperará todos os registos de receitas em que o valor é menor do que a média;

```php
    use App\Models\Income;
    use Illuminate\Database\Query\Builder;

    $incomes = Income::where('amount', '<', function (Builder $query) {
        $query->selectRaw('avg(i.amount)')->from('incomes as i');
    })->get();
```

<a name="full-text-where-clauses"></a>
### Tabela completa de cláusulas

 > [AVISO]
 > Texto completo, onde as cláusulas são atualmente suportadas pelo MySQL e pelo PostgreSQL.

 Os métodos `whereFullText` e `orWhereFullText` podem ser utilizados para adicionar uma cláusula "where" com texto completo a consultas de colunas que tenham índices [de texto completo](/docs/migrations#available-index-types). Estes métodos serão transformados em SQL adequado ao sistema de banco de dados subjacente por Laravel. Por exemplo, uma cláusula `MATCH AGAINST` será gerada para aplicações que utilizem o MySQL:

```php
    $users = DB::table('users')
               ->whereFullText('bio', 'web developer')
               ->get();
```

<a name="ordering-grouping-limit-and-offset"></a>
## Ordenação, agrupamento e posição de limite e de deslocamento

<a name="ordering"></a>
### Pedido

<a name="orderby"></a>
#### O Método orderBy

 O método `orderBy` permite-lhe classificar os resultados da consulta por uma determinada coluna. O primeiro argumento aceito pelo método `orderBy` deve ser a coluna pela qual pretende efetuar o sorteio, enquanto o segundo argumento determina a direção do ordenamento e pode ser tanto `asc` como `desc`:

```php
    $users = DB::table('users')
                    ->orderBy('name', 'desc')
                    ->get();
```

 Para ordenar por várias colunas, basta invocar o método `orderBy` quantas vezes forem necessárias:

```php
    $users = DB::table('users')
                    ->orderBy('name', 'desc')
                    ->orderBy('email', 'asc')
                    ->get();
```

<a name="latest-oldest"></a>
#### Os métodos `último` e `mais antigo`

 Os métodos `latest` e `oldest` permitem-lhe ordenar os resultados facilmente por data. Por defeito, o resultado será ordenado pela coluna `created_at` da tabela. Ou pode indicar a coluna na qual pretende ordenar:

```php
    $user = DB::table('users')
                    ->latest()
                    ->first();
```

<a name="random-ordering"></a>
#### Ordenamento aleatório

 O método `inRandomOrder` pode ser usado para ordenar os resultados da consulta aleatoriamente. Por exemplo, você pode usar esse método para obter um usuário aleatório:

```php
    $randomUser = DB::table('users')
                    ->inRandomOrder()
                    ->first();
```

<a name="removing-existing-orderings"></a>
#### Remover encomendas existentes

 O método `reorder` remove todas as cláusulas `"order by"` aplicadas previamente à consulta:

```php
    $query = DB::table('users')->orderBy('name');

    $unorderedUsers = $query->reorder()->get();
```

 Você pode passar uma coluna e direção ao chamar o método reorder para remover todas as cláusulas “order by” existentes e aplicar uma ordem totalmente nova à consulta:

```php
    $query = DB::table('users')->orderBy('name');

    $usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

<a name="grouping"></a>
### Grupo

<a name="groupby-having"></a>
#### As Métodos `groupBy` e `having`

 Como de costume, as funcionalidades `groupBy` e `having` podem ser utilizadas para agrupar os resultados da consulta. A assinatura da função `having` é semelhante à do método `where`:

```php
    $users = DB::table('users')
                    ->groupBy('account_id')
                    ->having('account_id', '>', 100)
                    ->get();
```

 Você pode usar o método `havingBetween` para filtrar os resultados dentro de um intervalo determinado:

```php
    $report = DB::table('orders')
                    ->selectRaw('count(id) as number_of_orders, customer_id')
                    ->groupBy('customer_id')
                    ->havingBetween('number_of_orders', [5, 15])
                    ->get();
```

 Você pode passar vários argumentos para o método `groupBy` para agrupar por várias colunas.

```php
    $users = DB::table('users')
                    ->groupBy('first_name', 'status')
                    ->having('account_id', '>', 100)
                    ->get();
```

 Para construir declarações do tipo "ON HAVING" mais avançadas, consulte o método [`havingRaw`](#métodos-raw).

<a name="limit-and-offset"></a>
### Limite e Desvio

<a name="skip-take"></a>
#### As Métodos `skip` e `take`

 Pode utilizar os métodos `skip` e `take` para limitar o número de resultados retornados pela consulta ou para ignorar um determinado número de resultados na consulta.

```php
    $users = DB::table('users')->skip(10)->take(5)->get();
```

 Como alternativa, você pode usar os métodos `limit` e `offset`. Estes métodos são equivalentes funcionalmente aos métodos `take` e `skip`, respectivamente:

```php
    $users = DB::table('users')
                    ->offset(10)
                    ->limit(5)
                    ->get();
```

<a name="conditional-clauses"></a>
## Cláusulas condicionais

 Às vezes você pode querer aplicar determinadas cláusulas de consulta com base em outra condição. Por exemplo, você só pode querer aplicar uma instrução `where` se um valor específico estiver presente no pedido HTTP entrantes. Isso pode ser feito usando o método `when`:

```php
    $role = $request->string('role');

    $users = DB::table('users')
                    ->when($role, function (Builder $query, string $role) {
                        $query->where('role_id', $role);
                    })
                    ->get();
```

 O método when executa o grupo de instruções somente se o primeiro argumento for verdadeiro. Se o primeiro argumento for falso, o grupo de instruções não será executado. Nos exemplos acima, o grupo de instruções dado ao método when só será invocado caso o campo role esteja presente no pedido de entrada e se avalie como verdadeiro.

 Você pode usar outra expressão como o terceiro argumento da função `when`. Essa expressão será executada apenas se o primeiro argumento tiver valor falsificável. Para ilustrar como esse recurso funciona, vamos usá-lo para configurar a ordem padrão de uma consulta:

```php
    $sortByVotes = $request->boolean('sort_by_votes');

    $users = DB::table('users')
                    ->when($sortByVotes, function (Builder $query, bool $sortByVotes) {
                        $query->orderBy('votes');
                    }, function (Builder $query) {
                        $query->orderBy('name');
                    })
                    ->get();
```

<a name="insert-statements"></a>
## Declarações a inserir

```php
The query builder also provides an `insert` method that may be used to insert records into the database table. The `insert` method accepts an array of column names and values:

    DB::table('users')->insert([
        'email' => 'kayla@example.com',
        'votes' => 0
    ]);
```

 Pode inserir vários registos de uma só vez, utilizando um array de arrays. Cada array representa um registo a inserir na tabela:

```php
    DB::table('users')->insert([
        ['email' => 'picard@example.com', 'votes' => 0],
        ['email' => 'janeway@example.com', 'votes' => 0],
    ]);
```

 O método `insertOrIgnore` ignorará erros durante a inserção de registos na base de dados. Quando utiliza este método, deve ter em atenção que erros por duplicação de registo serão ignorados e outros tipos de erro podem também ser ignorados consoante o motor da base de dados. Por exemplo, o `insertOrIgnore` irá [ignorar modo estrito do MySQL](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution):

```php
    DB::table('users')->insertOrIgnore([
        ['id' => 1, 'email' => 'sisko@example.com'],
        ['id' => 2, 'email' => 'archer@example.com'],
    ]);
```

 O método `insertUsing` inserirá novos registros na tabela usando uma sub-consulta para determinar os dados que devem ser inseridos:

```php
    DB::table('pruned_users')->insertUsing([
        'id', 'name', 'email', 'email_verified_at'
    ], DB::table('users')->select(
        'id', 'name', 'email', 'email_verified_at'
    )->where('updated_at', '<=', now()->subMonth()));
```

<a name="auto-incrementing-ids"></a>
#### IDs com inicio automático

 Se o campo for um identificador com incremento automático, utilize o método `insertGetId` para inserir um registo e obter depois o código do ID:

```php
    $id = DB::table('users')->insertGetId(
        ['email' => 'john@example.com', 'votes' => 0]
    );
```

 > [ATENÇÃO]
 > Ao usar o PostgreSQL, o método `insertGetId` espera que a coluna com auto-incremento seja chamada de `id`. Se você deseja recuperar o ID de uma sequência diferente, poderá passar o nome da coluna como um segundo parâmetro para o método `insertGetId`.

<a name="upserts"></a>
### Upserts

 O método `upsert` insere registos que não existem e atualiza os registos já existentes com novos valores especificados pelo utilizador. O primeiro argumento do método consiste nos valores a inserir ou atualizar, enquanto o segundo argumento lista as colunas que identificam exclusivamente um registo na tabela associada. O terceiro e último argumento é uma matriz de colunas que devem ser atualizadas se já existir correspondência entre os dados no banco de dados:

```php
    DB::table('flights')->upsert(
        [
            ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
            ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
        ],
        ['departure', 'destination'],
        ['price']
    );
```

 No exemplo acima, o Laravel tentará inserir dois registos. Se existir um registo com os mesmos valores de coluna `departure` e `destination`, o Laravel atualizará a coluna `price` desse registo.

 > [AVISO]
 > Todos os bancos de dados exceto SQL Server exigem que as colunas do segundo argumento da função `upsert` tenham um índice "primário" ou "único". Além disso, o driver de banco de dados MySQL ignora o segundo argumento da função `upsert` e sempre usa os índices "primários" e "únicos" da tabela para detectar registos existentes.

<a name="update-statements"></a>
## Declarações de atualização

 O criador de consultas não apenas insere registos na base de dados, como também atualiza os registos existentes utilizando o método `update`. Assim como o método `insert`, o método `update` aceita um array de pares coluna-valor que indicam as colunas a serem atualizadas. O método `update` retorna o número de linhas afetadas. Pode restringir a consulta utilizando cláusulas `where`:

```php
    $affected = DB::table('users')
                  ->where('id', 1)
                  ->update(['votes' => 1]);
```

<a name="update-or-insert"></a>
#### Atualizar ou Inserir

 Às vezes poderá desejar atualizar um registo existente na base de dados ou criar-lhe um novo se não existir nenhum registo correspondente. Neste cenário, o método `updateOrInsert` poderá ser utilizado. O método `updateOrInsert` aceita dois argumentos: um array de condições para encontrar o registo e um array de pares de coluna e valor que indicam as colunas a atualizar.

 O método `updateOrInsert` tenta encontrar o registo de dados do banco de dados com base nos pares coluna/valor no primeiro argumento. Se o registo existir, será atualizado com os valores do segundo argumento. Se o registo não puder ser encontrado, será inserido um novo registo com os atributos combinados dos dois argumentos:

```php
    DB::table('users')
        ->updateOrInsert(
            ['email' => 'john@example.com', 'name' => 'John'],
            ['votes' => '2']
        );
```

 É possível fornecer um fechamento à método `updateOrInsert` para personalizar os atributos que serão atualizados ou inseridos no banco de dados com base na existência de um registo correspondente:

```php
DB::table('users')->updateOrInsert(
    ['user_id' => $user_id],
    fn ($exists) => $exists ? [
        'name' => $data['name'],
        'email' => $data['email'],
    ] : [
        'name' => $data['name'],
        'email' => $data['email'],
        'marketable' => true,
    ],
);
```

<a name="updating-json-columns"></a>
### Atualização de colunas JSON

 Ao atualizar uma coluna JSON, você deve usar a sintaxe `->` para atualizar a chave apropriada no objeto JSON. Esta operação é suportada nos bancos de dados MySQL 5.7+ e PostgreSQL 9.5+:

```php
    $affected = DB::table('users')
                  ->where('id', 1)
                  ->update(['options->enabled' => true]);
```

<a name="increment-and-decrement"></a>
### Aumentar e Diminuir

 O construtor de consultas também fornece métodos práticos para aumentar ou diminuir o valor de uma determinada coluna. Ambos os métodos aceitam pelo menos um argumento: a coluna a ser modificada. Um segundo argumento pode ser especificado para indicar em que medida a coluna deve ser incrementada ou decrementada:

```php
    DB::table('users')->increment('votes');

    DB::table('users')->increment('votes', 5);

    DB::table('users')->decrement('votes');

    DB::table('users')->decrement('votes', 5);
```

 Caso necessário, você também poderá especificar colunas adicionais para atualizar durante a operação de incremento ou decremento:

```php
    DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

 Além disso, você pode incrementar ou decrementar várias colunas de uma vez usando os métodos `incrementEach` e `decrementEach`:

```php
    DB::table('users')->incrementEach([
        'votes' => 5,
        'balance' => 100,
    ]);
```

<a name="delete-statements"></a>
## Excluir declarações

 O método `delete` do criador de consultas pode ser usado para excluir registos da tabela. O método `delete` retorna o número de linhas afetadas. Você pode restringir declarações `delete` adicionando cláusulas "where" antes de chamar o método `delete`:

```php
    $deleted = DB::table('users')->delete();

    $deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

 Se pretender apagar uma tabela inteira, o que irá remover todos os registos da mesma e redefinir o número de identificação "auto incrementável" para zero, poderá usar o método `truncate`:

```php
    DB::table('users')->truncate();
```

<a name="table-truncation-and-postgresql"></a>
#### Tabela truncada e o PostgreSQL

 Ao encurtar um banco de dados do PostgreSQL, o comportamento `CASCADE` será aplicado. Isto significa que todos os registos relacionados com a chave estrangeira em outras tabelas também serão excluídos.

<a name="pessimistic-locking"></a>
## Bloqueio pessimista

 O construtor de consulta também inclui alguns recursos para ajudar você a conseguir um "bloqueio pessimista" ao executar suas declarações `select`. Para executar uma declaração com um "lock compartilhado", chame o método `sharedLock`. Um lock compartilhado impede que as linhas selecionadas sejam modificadas até a transação for commitada:

```php
    DB::table('users')
            ->where('votes', '>', 100)
            ->sharedLock()
            ->get();
```

 Em alternativa, você pode usar o método `lockForUpdate`. O bloqueio com a indicação "para atualização" impede que os registros selecionados sejam modificados ou que outros compartilhamentos de bloqueios os selecionem:

```php
    DB::table('users')
            ->where('votes', '>', 100)
            ->lockForUpdate()
            ->get();
```

<a name="debugging"></a>
## Depuração

 Pode utilizar os métodos `dd` e `dump` para construir uma query para descarregar as ligações de consulta e SQL atuais. O método `dd` exibe a informação de depuração e, em seguida, interrompe o processamento da solicitação. O método `dump` exibe a informação de depuração mas permite continuar o processamento da solicitação:

```php
    DB::table('users')->where('votes', '>', 100)->dd();

    DB::table('users')->where('votes', '>', 100)->dump();
```

 Os métodos `dumpRawSql` e `ddRawSql` podem ser invocados em uma consulta para exibir o SQL da consulta com todos os vínculos de parâmetros substituídos corretamente:

```php
    DB::table('users')->where('votes', '>', 100)->dumpRawSql();

    DB::table('users')->where('votes', '>', 100)->ddRawSql();
```
