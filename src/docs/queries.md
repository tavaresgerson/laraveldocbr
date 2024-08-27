# Banco de dados: construtor de consultas

<a name="introduction"></a>
## Introdução

O construtor de consultas do banco de dados Laravel fornece uma interface conveniente e fluente para criação e execução de consultas ao banco de dados. Pode ser usado para realizar a maioria das operações do banco de dados em sua aplicação e funciona perfeitamente com todos os sistemas de banco de dados suportados pelo Laravel.

O construtor de consulta do Laravel utiliza vinculação de parâmetros PDO para proteger seu aplicativo contra ataques de injeção de SQL. Não há necessidade de limpar ou sanear strings passadas para o construtor de consultas como associações de consulta.

> [ALERTA]
> A PDO não oferece suporte à vinculação de nomes de colunas. Por esta razão, você nunca deve permitir que entradas do usuário dictam os nomes das colunas referenciados em suas consultas, incluindo colunas "order by".

<a name="running-database-queries"></a>
## Executando consultas de banco de dados

<a name="retrieving-all-rows-from-a-table"></a>
#### Recuperando todas as linhas de uma tabela

Você pode usar o método 'table' fornecido pela fachada 'DB' para iniciar uma consulta. O método 'table' retorna um construtor de consulta fluente para a tabela especificada, permitindo que você encadeie mais restrições na consulta e finalmente recupere os resultados da consulta usando o método 'get':

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

O método get retorna uma instância de Illuminate\Support\Collection que contém os resultados da consulta em que cada resultado é uma instância do objeto PHP stdClass. Você pode acessar o valor de cada coluna acessando-a como propriedade do objeto:

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')->get();

    foreach ($users as $user) {
        echo $user->name;
    }
```

> [!NOTA]
> Laravel Collections oferece um grande número de métodos extremamente poderosos para mapear e reduzir dados. Para mais informações sobre o Laravel Collections, veja a documentação em [coleções]('/)

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### Recuperando uma única linha/coluna de uma tabela

Se você precisa apenas de recuperar uma única linha de uma tabela do banco de dados, você pode usar o método 'first' da classe 'DB'. Este método retornará um único objeto 'stdClass':

```php
    $user = DB::table('users')->where('name', 'John')->first();

    return $user->email;
```

Se você não precisa de uma linha inteira, você pode extrair um valor único de um registro usando o método 'valor'. Esse método retornará o valor da coluna diretamente:

```php
    $email = DB::table('users')->where('name', 'John')->value('email');
```

Para recuperar uma única linha pelo valor da coluna `id`, utilize o método `find`:

```php
    $user = DB::table('users')->find(3);
```

<a name="retrieving-a-list-of-column-values"></a>
#### Recuperando uma Lista de Valores da Coluna

Se você gostaria de recuperar uma instância de `Illuminate\Support\Collection` contendo os valores de um único campo, você pode usar o método `pluck`. Neste exemplo, vamos buscar uma coleção de títulos de usuário:

```php
    use Illuminate\Support\Facades\DB;

    $titles = DB::table('users')->pluck('title');

    foreach ($titles as $title) {
        echo $title;
    }
```

Você pode especificar a coluna que o resultado da coleção deve usar como chaves fornecendo um segundo argumento para o método `pluck`:

```php
    $titles = DB::table('users')->pluck('title', 'name');

    foreach ($titles as $name => $title) {
        echo $title;
    }
```

<a name="chunking-results"></a>
### Resultados de Chunca

Se você precisa trabalhar com milhares de registros em um banco de dados, considere usar o método 'chunk' fornecido pela fachada DB. Este método recupera um pequeno pedaço de resultados de cada vez e alimenta cada pedaço em uma função para processamento. Por exemplo, vamos recuperar a tabela 'users' inteira em pedaços de 100 registros cada:

```php
    use Illuminate\Support\Collection;
    use Illuminate\Support\Facades\DB;

    DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
        foreach ($users as $user) {
            // ...
        }
    });
```

Você pode parar a execução de mais pedaços retornando `false` do fechamento:

```php
    DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
        // Process the records...

        return false;
    });
```

Se você está atualizando registros de banco de dados enquanto os resultados são agrupados, seus resultados agrupados podem mudar de maneiras inesperadas. Se você planeja atualizar os registros recuperados enquanto os resultados são agrupados, é sempre melhor usar o método `chunkById` em vez disso. Este método paginará automaticamente os resultados com base na chave primária do registro:

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

> [Aviso]
> Ao atualizar ou excluir registros dentro do retorno de chamada de pedaço, qualquer alteração na chave primária ou chaves estrangeiras pode afetar a consulta de pedaço. Isso pode potencialmente resultar em registros não incluídos no resultados pedaçados.

<a name="streaming-results-lazily"></a>
### Resultados de streaming preguiçosos

O método `lazy()` funciona de maneira similar ao [método `chunked`]("/docs/methods/#chunking") na medida em que executa a consulta em pedaços. No entanto, em vez de passar cada pedaço para uma função de retorno de chamada, o `lazy()` retorna um [coleção lazy](/docs/collections#lazy-collections), permitindo que você interaja com os resultados como um único fluxo:

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```

Mais uma vez, se você planeja atualizar os registros recuperados enquanto iteram sobre eles, é melhor usar o método 'lazyById' ou 'lazyByIdDesc' em vez disso. Esses métodos paginarão automaticamente os resultados com base na chave primária do registro:

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> [ALERTA]
> Ao atualizar ou excluir registros enquanto iteramos sobre eles, qualquer alteração na chave primária ou chaves estrangeiras pode afetar a consulta em partes. Isso pode potencialmente resultar em registros não incluídos nos resultados.

<a name="aggregates"></a>
### Agregados

O construtor de consultas também fornece uma variedade de métodos para recuperar valores agregados como 'contar', 'máximo', 'mínimo', 'média' e 'soma'. Você pode chamar qualquer um desses métodos após construir sua consulta.

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')->count();

    $price = DB::table('orders')->max('price');
```

É claro que você pode combinar esses métodos com outras cláusulas para ajustar como o seu valor agregado é calculado.

```php
    $price = DB::table('orders')
                    ->where('finalized', 1)
                    ->avg('price');
```

<a name="determining-if-records-exist"></a>
#### Determinar se Registros Existem

Em vez de usar o método 'count' para determinar se há algum registro que corresponda aos critérios da sua consulta, você pode utilizar os métodos 'exists' e 'doesntExist':

```php
    if (DB::table('orders')->where('finalized', 1)->exists()) {
        // ...
    }

    if (DB::table('orders')->where('finalized', 1)->doesntExist()) {
        // ...
    }
```

<a name="select-statements"></a>
## Declarações Selecionadas

<a name="specifying-a-select-clause"></a>
#### Especificando uma Cláusula Selecionada

Você pode não querer selecionar todas as colunas de uma tabela do banco de dados. Usando o método 'select', você pode especificar um "select" personalizado para a consulta:

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')
                ->select('name', 'email as user_email')
                ->get();
```

O método 'distinct' permite forçar a consulta a retornar resultados distintos:

```php
    $users = DB::table('users')->distinct()->get();
```

Se você já tem uma instância de um construtor de consulta e deseja adicionar uma coluna ao seu cláusula SELECT existente, você pode usar o método "addSelect":

```php
    $query = DB::table('users')->select('name');

    $users = $query->addSelect('age')->get();
```

<a name="raw-expressions"></a>
## Expressões cruas

Às vezes, você pode precisar inserir uma sequência arbitrária em uma consulta. Para criar uma expressão de string crua, você pode usar o método `raw` fornecido pela fachada DB:

```php
    $users = DB::table('users')
                 ->select(DB::raw('count(*) as user_count, status'))
                 ->where('status', '<>', 1)
                 ->groupBy('status')
                 ->get();
```

> [Aviso]
> As declarações brutas serão injetadas na consulta como strings, então você deve ser extremamente cuidadoso para evitar criar vulnerabilidades de injeção SQL.

<a name="raw-methods"></a>
### Métodos Brutos

Em vez de usar o método `DB::raw`, você também pode usar os seguintes métodos para inserir uma expressão bruta em diferentes partes da sua consulta. **Lembre-se, o Laravel não pode garantir que qualquer consulta usando expressões brutas é protegida contra vulnerabilidades de injeção SQL**.

<a name="selectraw"></a>
#### 'selectRaw'

O método `selectRaw` pode ser usado no lugar de `addSelect(DB::raw(/* ... */))`. Este método aceita um array opcional de vinculações como segundo argumento:

```php
    $orders = DB::table('orders')
                    ->selectRaw('price * ? as price_with_tax', [1.0825])
                    ->get();
```

<a name="whereraw-orwhereraw"></a>
#### „ondeRaw” ou „orWhereRaw”

Os métodos 'whereRaw' e 'orWhereRaw' podem ser usados para injetar uma cláusula "onde" bruta na sua consulta. Esses métodos aceitam um array opcional de associações como seu segundo argumento:

```php
    $orders = DB::table('orders')
                    ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
                    ->get();
```

<a name="havingraw-orhavingraw"></a>
#### 'havingRaw / orHavingRaw'

Os métodos `havingRaw` e `orHavingRaw` podem ser usados para fornecer uma string bruta como o valor da cláusula "having". Estes métodos aceitam um array opcional de vinculações no segundo argumento:

```php
    $orders = DB::table('orders')
                    ->select('department', DB::raw('SUM(price) as total_sales'))
                    ->groupBy('department')
                    ->havingRaw('SUM(price) > ?', [2500])
                    ->get();
```

<a name="orderbyraw"></a>
#### 'orderByRaw'

O método `orderByRaw` pode ser usado para fornecer uma string bruta como o valor da cláusula "ordenar por":

```php
    $orders = DB::table('orders')
                    ->orderByRaw('updated_at - created_at DESC')
                    ->get();
```

<a name="groupbyraw"></a>
### "groupByRaw"

O método `groupByRaw` pode ser usado para fornecer uma string bruta como o valor da cláusula `GROUP BY`:

```php
    $orders = DB::table('orders')
                    ->select('city', 'state')
                    ->groupByRaw('city, state')
                    ->get();
```

<a name="joins"></a>
## Junções

<a name="inner-join-clause"></a>
#### A cláusula de junção interna

O construtor de consulta também pode ser usado para adicionar cláusulas JOIN às suas consultas. Para realizar um "INNER JOIN" básico, você pode usar o método `join` em uma instância do construtor de consulta. O primeiro argumento passado ao método `join` é o nome da tabela que você precisa unir à sua tabela atual, enquanto os argumentos restantes especificam as restrições de coluna para a junção. Você até pode unir múltiplas tabelas em uma única consulta:

```php
    use Illuminate\Support\Facades\DB;

    $users = DB::table('users')
                ->join('contacts', 'users.id', '=', 'contacts.user_id')
                ->join('orders', 'users.id', '=', 'orders.user_id')
                ->select('users.*', 'contacts.phone', 'orders.price')
                ->get();
```

<a name="left-join-right-join-clause"></a>
#### Cláusula de Junção Esquerda / Direita

Se você quiser executar um "left join" ou um "right join" em vez de um "inner join", utilize o método 'leftJoin' ou 'rightJoin'. Estes métodos têm a mesma assinatura do método 'join':

```php
    $users = DB::table('users')
                ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
                ->get();

    $users = DB::table('users')
                ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
                ->get();
```

<a name="cross-join-clause"></a>
#### Junção de cruz

Você pode usar o método 'crossJoin' para realizar um "cross join". Cross joins geram um produto cartesiano entre a primeira tabela e a tabela unida:

```php
    $sizes = DB::table('sizes')
                ->crossJoin('colors')
                ->get();
```

<a name="advanced-join-clauses"></a>
#### Cláusulas de Junção Avançadas

Você também pode especificar cláusulas de junção mais avançadas. Para começar, passe um fechamento como o segundo argumento para o método 'join'. O fechamento receberá uma instância de 'Illuminate/Database/Query/JoinClause' que permite especificar restrições na cláusula "join":

```php
    DB::table('users')
            ->join('contacts', function (JoinClause $join) {
                $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
            })
            ->get();
```

Se você quiser usar uma cláusula "onde" em suas junções, você pode usar os métodos `where` e `orWhere` fornecidos pela instância `JoinClause`. Em vez de comparar duas colunas, esses métodos irão comparar a coluna com um valor.

```php
    DB::table('users')
            ->join('contacts', function (JoinClause $join) {
                $join->on('users.id', '=', 'contacts.user_id')
                     ->where('contacts.user_id', '>', 5);
            })
            ->get();
```

<a name="subquery-joins"></a>
#### Junções de subconsulta

Você pode usar os métodos 'joinSub', 'leftJoinSub' e 'rightJoinSub' para juntar uma consulta a uma subconsulta. Cada um desses métodos recebe três argumentos: a subconsulta, seu nome de tabela e uma função lambda que define as colunas relacionadas. Neste exemplo, vamos obter uma coleção de usuários onde cada registro do usuário também contém o carimbo de data e hora 'created_at' do último blog post publicado pelo usuário:

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
#### Junções Laterais

> [!ALERTA]
> As junções laterais atualmente são suportadas pelo PostgreSQL, MySQL >= 8.0.14 e SQL Server.

Você pode usar os métodos `joinLateral` e `leftJoinLateral` para realizar uma "junção lateral" com uma subconsulta. Cada um desses métodos recebe dois argumentos: a subconsulta e sua tabela alias. As condições de junção(s) devem ser especificadas dentro da cláusula `where` da dada subconsulta. Junções laterais são avaliadas por linha, e podem referir colunas fora da subconsulta.

Neste exemplo, vamos buscar uma coleção de usuários assim como o usuário' três últimas postagens no blog. Cada usuário pode produzir até três linhas na tabela de resultados: uma para cada um das postagens do blog mais recentes. A condição de junção é especificada com a cláusula `whereColumn` dentro da subconsulta, referenciando a linha atual do usuário:

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

A construção de consultas também fornece um método conveniente para "união" de duas ou mais consultas juntas. Por exemplo, você pode criar uma consulta inicial e usar o método 'unione' para uni-la com mais consultas:

```php
    use Illuminate\Support\Facades\DB;

    $first = DB::table('users')
                ->whereNull('first_name');

    $users = DB::table('users')
                ->whereNull('last_name')
                ->union($first)
                ->get();
```

Além do método 'union', o construtor de consultas fornece um método 'unionAll'. Consultas que são combinadas usando o método 'unionAll' não terão seus resultados duplicados removidos. O método 'unionAll' tem a mesma assinatura de método como o 'union' método.

<a name="basic-where-clauses"></a>
## Cláusulas básicas de onde

<a name="where-clauses"></a>
### Onde Cláusulas

Você pode usar o método 'where' do construtor de query para acrescentar "onde" a consulta. A chamada básica do método 'where' requer três argumentos. O primeiro argumento é o nome da coluna. O segundo argumento é um operador, que pode ser qualquer um dos operadores suportados pelo banco de dados. O terceiro argumento é o valor para comparação contra o valor da coluna.

Por exemplo, a seguinte consulta recupera os usuários onde o valor da coluna "votos" é igual a 100 e o valor da coluna "idade" é maior que 35:

```php
    $users = DB::table('users')
                    ->where('votes', '=', 100)
                    ->where('age', '>', 35)
                    ->get();
```

Para conveniência, caso queira verificar se uma coluna é igual a um determinado valor, você pode passar o valor como segundo argumento para o método 'where'. O Laravel presumirá que você quer usar o operador '=':

```php
    $users = DB::table('users')->where('votes', 100)->get();
```

Como já mencionado, você pode utilizar qualquer operador que seu sistema de banco de dados suporte:

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

Você também pode passar uma matriz de condições para o método `where`. Cada elemento da matriz deve ser uma matriz que contenha os três argumentos tipicamente passados para o método `where`:

```php
    $users = DB::table('users')->where([
        ['status', '=', '1'],
        ['subscribed', '<>', '1'],
    ])->get();
```

> [Aviso!]
> O PDO não suporta nomes de coluna vinculados. Portanto, nunca permita que a entrada do usuário dicte os nomes da coluna referenciada em suas consultas, incluindo colunas "order by".

<a name="or-where-clauses"></a>
### Ou Cláusulas

Quando encadeamos chamadas para o método "where" do construtor de consulta, as cláusulas "where" serão encadeadas usando o operador "and". No entanto, você pode usar o método "orWhere" para unir uma cláusula à consulta usando o operador "or". O método "orWhere" aceita os mesmos argumentos que o método "where":

```php
    $users = DB::table('users')
                        ->where('votes', '>', 100)
                        ->orWhere('name', 'John')
                        ->get();
```

Se você precisa agrupar uma condição "ou" dentro de parênteses, você pode passar um fechamento como o primeiro argumento para o método 'orWhere':

```php
    $users = DB::table('users')
                ->where('votes', '>', 100)
                ->orWhere(function (Builder $query) {
                    $query->where('name', 'Abigail')
                          ->where('votes', '>', 50);
                })
                ->get();
```

O exemplo acima produzirá o seguinte SQL:

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> (!Aviso)
> Você deve agrupar as chamadas `orWhere` para evitar um comportamento inesperado quando escopos globais são aplicados.

<a name="where-not-clauses"></a>
### Onde não cláusulas

Os métodos whereNot e orWhereNot podem ser usados para negar um determinado grupo de restrições de consulta. Por exemplo, a seguinte consulta exclui produtos que estão em liquidação ou os quais têm um preço inferior a dez:

```php
    $products = DB::table('products')
                    ->whereNot(function (Builder $query) {
                        $query->where('clearance', true)
                              ->orWhere('price', '<', 10);
                    })
                    ->get();
```

<a name="where-any-all-clauses"></a>
### Onde Quaisquer/Todos Os Cláusulas

Às vezes você pode precisar aplicar as mesmas restrições de consulta a várias colunas. Por exemplo, você pode querer buscar todos os registros onde qualquer coluna em uma determinada lista é `LIKE` um determinado valor. Você pode fazer isso usando o método `whereAny`:

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

A consulta acima produzirá o seguinte SQL:

```sql
SELECT *
FROM users
WHERE active = true AND (
    name LIKE 'Example%' OR
    email LIKE 'Example%' OR
    phone LIKE 'Example%'
)
```

Da mesma forma, o método "whereAll" pode ser usado para obter registros onde todas as colunas fornecidas correspondam a uma determinada restrição:

```php
    $posts = DB::table('posts')
                ->where('published', true)
                ->whereAll([
                    'title',
                    'content',
                ], 'LIKE', '%Laravel%')
                ->get();
```

A consulta acima produz a seguinte SQL:

```sql
SELECT *
FROM posts
WHERE published = true AND (
    title LIKE '%Laravel%' AND
    content LIKE '%Laravel%'
)
```

<a name="json-where-clauses"></a>
### JSON Onde Cláusulas

O Laravel também suporta consultar colunas de tipo JSON em bancos que fornecem suporte para o tipo de coluna JSON. Atualmente, isso inclui MySQL 8.0+, PostgreSQL 12.0+, SQL Server 2017+, e SQLite 3.39.0+ (com a extensão [JSON1](https://www.sqlite.org/json1.html)). Para consultar uma coluna de tipo JSON, use o operador `->`:

```php
    $users = DB::table('users')
                    ->where('preferences->dining->meal', 'salad')
                    ->get();
```

Você pode usar o comando `whereJsonContains` para fazer pesquisa de arrays em formato JSON:

```php
    $users = DB::table('users')
                    ->whereJsonContains('options->languages', 'en')
                    ->get();
```

Se sua aplicação utilizar bancos de dados MySQL ou PostgreSQL, você pode passar um array de valores para o método `whereJsonContains`:

```php
    $users = DB::table('users')
                    ->whereJsonContains('options->languages', ['en', 'de'])
                    ->get();
```

Você pode usar o método whereJsonLength para consultar matrizes de JSON por sua extensão:

```php
    $users = DB::table('users')
                    ->whereJsonLength('options->languages', 0)
                    ->get();

    $users = DB::table('users')
                    ->whereJsonLength('options->languages', '>', 1)
                    ->get();
```

<a name="additional-where-clauses"></a>
### Cláusulas Adicionais "where"

**ondeEntre / ouWhereBetween**

O método `WhereBetween` verifica se o valor de uma coluna está entre dois valores:

```php
    $users = DB::table('users')
               ->whereBetween('votes', [1, 100])
               ->get();
```

**ondeNãoEntre / ouWhereNotBetween**

O método `whereNotBetween` verifica que o valor de uma coluna está fora de dois valores:

```php
    $users = DB::table('users')
                        ->whereNotBetween('votes', [1, 100])
                        ->get();
```

**ondeEntreColunas / ondeNãoEntreColunas ou ondeEntreColunas / ondeNãoEntreColunas**

O método `whereBetweenColumns` verifica que o valor de uma coluna se encontra entre os dois valores de duas colunas na mesma linha da tabela.

```php
    $patients = DB::table('patients')
                           ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
                           ->get();
```

O método "whereNotBetweenColumns" verifica que o valor de uma coluna se encontra fora dos valores de duas colunas na mesma linha da tabela.

```php
    $patients = DB::table('patients')
                           ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
                           ->get();
```

ondeIn / ondeNotIn ou orWhereIn / orWhereNotIn

O método `whereIn` verifica se o valor de uma coluna dada está contido em um determinado array.

```php
    $users = DB::table('users')
                        ->whereIn('id', [1, 2, 3])
                        ->get();
```

O método `whereNotIn` verifica que o valor da coluna especificada não está contido no array fornecido:

```php
    $users = DB::table('users')
                        ->whereNotIn('id', [1, 2, 3])
                        ->get();
```

Você também pode fornecer um objeto de consulta como segundo argumento do método 'whereIn':

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

> ¡ADVERTENCIA!
> Se você estiver adicionando uma grande matriz de variáveis inteiras para sua consulta, o método 'whereIntegerInRaw' ou 'whereIntegerNotInRaw' pode ser usado para reduzir muito seu uso de memória.

onde Null / ondeNotNull ou whereNull / whereNotNull

O método `whereNull` verifica que o valor da coluna fornecida seja `NULL`:

```php
    $users = DB::table('users')
                    ->whereNull('updated_at')
                    ->get();
```

O método `whereNotNull` verifica que o valor da coluna não é 'NULL':

```php
    $users = DB::table('users')
                    ->whereNotNull('updated_at')
                    ->get();
```

**ondeData / ondeMês / ondeDia / ondeAno / ondeHora**

O método 'whereDate' pode ser usado para comparar um valor de coluna com uma data:

```php
    $users = DB::table('users')
                    ->whereDate('created_at', '2016-12-31')
                    ->get();
```

O método `whereMonth` pode ser usado para comparar um valor de uma coluna com um mês específico:

```php
    $users = DB::table('users')
                    ->whereMonth('created_at', '12')
                    ->get();
```

O método `whereDay` pode ser utilizado para comparar o valor de uma coluna com um dia específico do mês:

```php
    $users = DB::table('users')
                    ->whereDay('created_at', '31')
                    ->get();
```

A função `whereYear` pode ser usada para comparar um valor de coluna com um ano específico:

```php
    $users = DB::table('users')
                    ->whereYear('created_at', '2016')
                    ->get();
```

O método `whereTime` pode ser usado para comparar um valor de coluna em relação a uma hora específica:

```php
    $users = DB::table('users')
                    ->whereTime('created_at', '=', '11:20:45')
                    ->get();
```

**ondeColuna / ou OndeColuna**

O método 'whereColumn' pode ser usado para verificar que duas colunas são iguais:

```php
    $users = DB::table('users')
                    ->whereColumn('first_name', 'last_name')
                    ->get();
```

Você também pode passar um operador de comparação para o método `whereColumn`:

```php
    $users = DB::table('users')
                    ->whereColumn('updated_at', '>', 'created_at')
                    ->get();
```

Você também pode passar um array de comparações de coluna para o método `whereColumn`. Essas condições serão unidas usando o operador `and`:

```php
    $users = DB::table('users')
                    ->whereColumn([
                        ['first_name', '=', 'last_name'],
                        ['updated_at', '>', 'created_at'],
                    ])->get();
```

<a name="logical-grouping"></a>
### Agrupamento Lógico

Às vezes você pode precisar agrupar várias cláusulas "onde" dentro de parênteses para alcançar o agrupamento lógico desejado da sua consulta. Na verdade, você deve geralmente agrupar as chamadas ao método `orWhere` dentro de parênteses para evitar o comportamento inesperado da consulta. Para fazer isso, você pode passar uma closure ao método `where`:

```php
    $users = DB::table('users')
               ->where('name', '=', 'John')
               ->where(function (Builder $query) {
                   $query->where('votes', '>', 100)
                         ->orWhere('title', '=', 'Admin');
               })
               ->get();
```

Como você pode ver, passando uma consulta para o método `where` instrui o construtor de consultas a começar um grupo de restrições. A consulta receberá uma instância do construtor de consultas que você poderá usar para definir as restrições que devem ser contidas dentro do grupo de parênteses. O exemplo acima produziria a seguinte SQL:

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> [!ALERTA]
> Você deve agrupar os chamas de `orWhere` para evitar comportamentos inesperados quando escopos globais são aplicados.

<a name="advanced-where-clauses"></a>
### Cláusulas avançadas de onde

<a name="where-exists-clauses"></a>
### Onde existir cláusulas

O método 'whereExists' permite que você escreva as cláusulas "WHERE EXISTS". O método 'whereExists' aceita um 'closure', que receberá uma instância do 'query builder', permitindo-lhe definir a consulta que deve ser colocada dentro da cláusula "existe":

```php
    $users = DB::table('users')
               ->whereExists(function (Builder $query) {
                   $query->select(DB::raw(1))
                         ->from('orders')
                         ->whereColumn('orders.user_id', 'users.id');
               })
               ->get();
```

Alternativamente, você pode fornecer um objeto de consulta para o método 'whereExists' em vez de uma função anônima:

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
### Subconsulta Cláusulas WHERE

Às vezes você pode precisar de construir uma cláusula "onde" que compara os resultados de um subconsulta com um determinado valor. Você pode fazer isso passando um fecho e um valor para o método "onde". Por exemplo, a seguinte consulta irá retornar todos os usuários que têm um recente "membro" do tipo dado;

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

Ou, você pode precisar construir uma cláusula "onde" que compara uma coluna aos resultados de uma subconsulta. Você pode conseguir isso passando uma coluna, operador e fechamento para o método 'onde'. Por exemplo, a seguinte consulta irá recuperar todos os registros de renda onde a quantidade é menor que a média;

```php
    use App\Models\Income;
    use Illuminate\Database\Query\Builder;

    $incomes = Income::where('amount', '<', function (Builder $query) {
        $query->selectRaw('avg(i.amount)')->from('incomes as i');
    })->get();
```

<a name="full-text-where-clauses"></a>
### Texto Inteiro Onde Cláusulas

> ¡ALERTA!
> Texto completo onde cláusulas atualmente são suportadas pelo MySQL e o PostgreSQL.

Os métodos `whereFullText` e `orWhereFullText` podem ser utilizados para acrescentar cláusulas "where" de texto completo em uma consulta para colunas que possuem índices de [texto completo](/docs/migrations#available-index-types). Laravel irá converter estes métodos no SQL apropriado para o sistema de banco de dados subjacente. Por exemplo, um `MATCH AGAINST` será gerado para aplicações utilizando MySQL:

```php
    $users = DB::table('users')
               ->whereFullText('bio', 'web developer')
               ->get();
```

<a name="ordering-grouping-limit-and-offset"></a>
## Ordenar, Agrupar, Limitar e Deslocar

<a name="ordering"></a>
### Comando

<a name="orderby"></a>
#### Método `orderBy`

O método `orderBy` permite que você classifique os resultados da consulta por uma coluna específica. O primeiro argumento aceito pelo `orderBy` deve ser a coluna pela qual deseja classificar os resultados, enquanto o segundo argumento determina a direção da classificação e pode ser ou 'asc' ou 'desc':

```php
    $users = DB::table('users')
                    ->orderBy('name', 'desc')
                    ->get();
```

Para classificar por múltiplas colunas, você pode simplesmente invocar `orderBy` quantas vezes forem necessárias:

```php
    $users = DB::table('users')
                    ->orderBy('name', 'desc')
                    ->orderBy('email', 'asc')
                    ->get();
```

<a name="latest-oldest"></a>
#### Métodos `latest` e `oldest`

O método 'latest' e 'oldest' permitem ordenar os resultados por data com facilidade. Por padrão, o resultado será ordenado pela coluna 'created_at' da tabela. Ou, você pode passar o nome da coluna que deseja classificar:

```php
    $user = DB::table('users')
                    ->latest()
                    ->first();
```

<a name="random-ordering"></a>
#### Ordenação aleatória

O método 'InRandomOrder' pode ser usado para ordenar os resultados da consulta em ordem aleatória. Por exemplo, você poderia usar este método para obter um usuário aleatório:

```php
    $randomUser = DB::table('users')
                    ->inRandomOrder()
                    ->first();
```

<a name="removing-existing-orderings"></a>
#### Removendo as Ordenações Existentes

O método 'reordenar' remove todas as cláusulas "ORDER BY" que foram previamente aplicadas à consulta:

```php
    $query = DB::table('users')->orderBy('name');

    $unorderedUsers = $query->reorder()->get();
```

Você pode passar uma coluna e direção quando chamar o método `reorder` para remover todos os "order by" existentes e aplicar uma nova ordem totalmente à consulta.

```php
    $query = DB::table('users')->orderBy('name');

    $usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

<a name="grouping"></a>
### Grupo

<a name="groupby-having"></a>
#### Métodos 'groupBy' e 'having'

Como você poderia esperar, os métodos 'groupBy' e 'having' podem ser usados para agrupar os resultados da consulta. A assinatura do método 'having' é semelhante à do método 'where':

```php
    $users = DB::table('users')
                    ->groupBy('account_id')
                    ->having('account_id', '>', 100)
                    ->get();
```

Você pode usar o método `havingBetween` para filtrar os resultados dentro de um determinado intervalo:

```php
    $report = DB::table('orders')
                    ->selectRaw('count(id) as number_of_orders, customer_id')
                    ->groupBy('customer_id')
                    ->havingBetween('number_of_orders', [5, 15])
                    ->get();
```

Você pode passar múltiplos argumentos para o método `groupBy`, agrupando por múltiplas colunas:

```php
    $users = DB::table('users')
                    ->groupBy('first_name', 'status')
                    ->having('account_id', '>', 100)
                    ->get();
```

Para construir declarações mais avançadas de "having", veja o método [havingRaw](#raw-methods).

<a name="limit-and-offset"></a>
### Limitar e Deslocar

<a name="skip-take"></a>
#### Métodos 'saltar' e 'pegue'

Você pode usar os métodos 'skip' e 'take' para limitar o número de resultados retornados pela consulta ou para pular um determinado número de resultados na consulta:

```php
    $users = DB::table('users')->skip(10)->take(5)->get();
```

Alternativamente, você pode usar os métodos "limit" e "offset". Estes são funcionalmente equivalentes aos métodos "take" e "skip", respectivamente:

```php
    $users = DB::table('users')
                    ->offset(10)
                    ->limit(5)
                    ->get();
```

<a name="conditional-clauses"></a>
## O que são cláusulas condicionais em inglês?

Às vezes você pode querer que certas cláusulas de consulta sejam aplicadas ao seu próprio consulta com base em outra condição, por exemplo, você só pode aplicar uma cláusula WHERE se um valor específico for fornecido no pedido HTTP de entrada usando o método when.

```php
    $role = $request->string('role');

    $users = DB::table('users')
                    ->when($role, function (Builder $query, string $role) {
                        $query->where('role_id', $role);
                    })
                    ->get();
```

O método `when` executa o fechamento apenas quando o primeiro argumento for verdadeiro. Se o primeiro argumento for falso, o fechamento não será executado. Assim, no exemplo acima, o fechamento fornecido para o método `when` só será invocado se o campo "role" estiver presente na solicitação recebida e avaliar como verdadeiro.

Você pode passar outro closure como o terceiro argumento para o método "when". Este closure será executado somente se o primeiro argumento for avaliado como falso. Para ilustrar como esta característica pode ser usada, usaremos isso para configurar a ordem padrão de uma consulta:

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
## Inserir instruções

```php
The query builder also provides an `insert` method that may be used to insert records into the database table. The `insert` method accepts an array of column names and values:

    DB::table('users')->insert([
        'email' => 'kayla@example.com',
        'votes' => 0
    ]);
```

Você pode inserir vários registros de uma vez passando um array de arrays. Cada array representa um registro que deve ser inserido na tabela:

```php
    DB::table('users')->insert([
        ['email' => 'picard@example.com', 'votes' => 0],
        ['email' => 'janeway@example.com', 'votes' => 0],
    ]);
```

O método `insertOrIgnore` ignorará erros enquanto inserir registros no banco de dados. Ao utilizar esse método, você deve estar ciente de que o erro de registro duplicado será ignorado e outros tipos de erros também podem ser ignorados dependendo do mecanismo do banco de dados. Por exemplo, `insertOrIgnore` [dispensará MySQL' 'modo estrito']:

```php
    DB::table('users')->insertOrIgnore([
        ['id' => 1, 'email' => 'sisko@example.com'],
        ['id' => 2, 'email' => 'archer@example.com'],
    ]);
```

O método 'insertUsing' inserirá novos registros na tabela usando uma subconsulta para determinar os dados que devem ser inseridos:

```php
    DB::table('pruned_users')->insertUsing([
        'id', 'name', 'email', 'email_verified_at'
    ], DB::table('users')->select(
        'id', 'name', 'email', 'email_verified_at'
    )->where('updated_at', '<=', now()->subMonth()));
```

<a name="auto-incrementing-ids"></a>
#### ID's incrementados automaticamente

Se o campo é de auto-incremental, utilize o método `insertGetId` para inserir um registro e então obter o ID

```php
    $id = DB::table('users')->insertGetId(
        ['email' => 'john@example.com', 'votes' => 0]
    );
```

> [!ALERTA]
> Ao usar o PostgreSQL, o método `insertGetId` espera que a coluna auto-incrementada seja chamada de `id`. Se você gostaria de obter a ID de uma "sequência" diferente, você pode passar o nome da coluna como o segundo parâmetro para o método `insertGetId`.

<a name="upserts"></a>
### Upserts

O método `upsert` inserirá registros que não existem e atualizará os registros existentes com novos valores que você pode especificar. O argumento do método consiste nos valores para inserção ou atualização, enquanto o segundo argumento lista a coluna (s) que identifica exclusivamente os registros na tabela associada. O terceiro e último argumento é uma matriz de colunas que devem ser atualizadas se um registro correspondente já existir no banco de dados:

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

No exemplo acima, o Laravel tentará inserir dois registros. Se um registro já existir com os mesmos valores de coluna `saída` e `destino`, o Laravel atualizará a coluna `preço` daquele registro.

> [!ALERTA]
> Todos os bancos de dados, exceto o SQL Server, requerem que as colunas na segunda argumento do método 'upsert' tenham um índice "primário" ou "único". Além disso, o driver do banco de dados MySQL ignora a segundo argumento do método 'upsert' e sempre utiliza os índices "primário" e "único" da tabela para detectar registros existentes.

<a name="update-statements"></a>
## Atualizações de declaração

Além de inserir registros no banco de dados, o construtor de consultas também pode atualizar registros existentes usando o método 'update'. O método 'update', assim como o 'insert', aceita um array de pares coluna-valor indicando as colunas a serem atualizadas. O método 'update' retorna o número de linhas afetadas. Você pode restringir a consulta de atualização usando cláusulas 'where':

```php
    $affected = DB::table('users')
                  ->where('id', 1)
                  ->update(['votes' => 1]);
```

<a name="update-or-insert"></a>
#### Atualizar ou inserir

Às vezes você pode querer atualizar um registro existente no banco de dados ou criar um se não houver nenhum registro correspondente. Neste cenário, o método `updateOrInsert` pode ser usado. O método `updateOrInsert` aceita dois argumentos: uma matriz de condições para encontrar o registro e uma matriz de pares coluna-valor indicando as colunas a serem atualizadas.

O método `updateOrInsert` tentará localizar um registro de banco de dados correspondente usando os pares de coluna e valor do primeiro argumento. Se o registro existir, ele será atualizado com os valores no segundo argumento. Se o registro não puder ser encontrado, um novo registro será inserido com os atributos mesclados de ambos os argumentos:

```php
    DB::table('users')
        ->updateOrInsert(
            ['email' => 'john@example.com', 'name' => 'John'],
            ['votes' => '2']
        );
```

Você pode fornecer um fechamento para o método `updateOrInsert` para personalizar atributos que são atualizados ou inseridos no banco de dados com base na existência de uma linha correspondente.

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
### Atualizando Colunas JSON

Ao atualizar uma coluna JSON, você deve usar a sintaxe `->` para atualizar a chave apropriada no objeto JSON. Esta operação é suportada em MySQL 5.7 e PostgreSQL 9.5+.

```php
    $affected = DB::table('users')
                  ->where('id', 1)
                  ->update(['options->enabled' => true]);
```

<a name="increment-and-decrement"></a>
### Incremento e Diminuição

O construtor de consulta também fornece métodos convenientes para incrementar ou decrementar o valor de uma determinada coluna. Ambos os métodos aceitam pelo menos um argumento: a coluna a modificar. Um segundo argumento pode ser fornecido para especificar o valor pelo qual a coluna deve ser incrementada ou decrementada.

```php
    DB::table('users')->increment('votes');

    DB::table('users')->increment('votes', 5);

    DB::table('users')->decrement('votes');

    DB::table('users')->decrement('votes', 5);
```

Se necessário você também pode especificar colunas adicionais para atualizar durante a operação de incremento ou decremento.

```php
    DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

Além disso, você pode aumentar ou diminuir várias colunas de uma vez usando os métodos `incrementEach` e `decrementEach`:

```php
    DB::table('users')->incrementEach([
        'votes' => 5,
        'balance' => 100,
    ]);
```

<a name="delete-statements"></a>
## Excluir afirmações

O método 'delete' do construtor de consultas pode ser usado para apagar registros da tabela. O método 'delete' retorna o número de linhas afetadas. Você pode restringir 'deletar' declarações adicionando "onde" cláusulas antes de chamar o método 'delete':

```php
    $deleted = DB::table('users')->delete();

    $deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

Se você deseja cortar uma tabela inteira, que vai remover todos os registros da tabela e redefinir o ID incrementado automaticamente para zero, você pode usar o método "truncate":

```php
    DB::table('users')->truncate();
```

<a name="table-truncation-and-postgresql"></a>
#### Tabela Truncation e PostgreSQL

Ao truncar um banco de dados PostgreSQL, o comportamento `CASCADE` será aplicado. Isso significa que todos os registros relacionados à chave estrangeira em outras tabelas serão excluídos também.

<a name="pessimistic-locking"></a>
## Bloqueio pessimista

O construtor de consultas também inclui algumas funções para ajudá-lo a alcançar o "lock pessimista" quando executar suas instruções 'select'. Para executar uma declaração com um "lock compartilhado", você pode chamar o método `sharedLock`. Um lock compartilhado impede que as linhas selecionadas sejam modificadas até que sua transação seja confirmada:

```php
    DB::table('users')
            ->where('votes', '>', 100)
            ->sharedLock()
            ->get();
```

Alternativamente, você pode usar o método `lockForUpdate`. Uma "trava para atualização" impede que os registros selecionados sejam modificados ou selecionados com outra travagem compartilhada:

```php
    DB::table('users')
            ->where('votes', '>', 100)
            ->lockForUpdate()
            ->get();
```

<a name="debugging"></a>
## Depuração de código

Você pode usar os métodos 'dd' e 'dump' durante a construção de uma consulta para descartar as associações atuais da consulta e SQL. O método 'dd' exibirá a informação de depuração e então parará de executar o pedido. O método 'dump' exibirá a informação de depuração mas permitirá que o pedido continue em execução:

```php
    DB::table('users')->where('votes', '>', 100)->dd();

    DB::table('users')->where('votes', '>', 100)->dump();
```

Os métodos `dumpRawSql` e `ddRawSql` podem ser invocados em uma consulta para gerar o SQL da consulta com todas as ligações de parâmetros substituídas corretamente.

```php
    DB::table('users')->where('votes', '>', 100)->dumpRawSql();

    DB::table('users')->where('votes', '>', 100)->ddRawSql();
```
