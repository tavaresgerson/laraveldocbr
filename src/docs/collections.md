# Coleções

## Introdução

A classe `Illuminate\Support\Collection` fornece um recorte fácil e conveniente para trabalhar com conjuntos de dados. Por exemplo, confira o código a seguir: usaremos o auxiliar `collect` para criar uma nova instância da coleção do array, executar a função strtoupper em cada elemento e, então, remover os elementos vazios:

```php
    $collection = collect(['taylor', 'abigail', null])->map(function (?string $name) {
        return strtoupper($name);
    })->reject(function (string $name) {
        return empty($name);
    });
```

Como você pode ver, a classe `Collection` permite que você combine seus métodos para executar mapeamento fluido e redução do array subjacente. Em geral, as coleções são imutáveis, o que significa que cada método da `Collection` retorna uma nova instância de `Collection`.

<a name="creating-collections"></a>
### Criando coleções

Como mencionado acima, o recurso `collect` retorna uma nova instância `Illuminate\Support\Collection` para o array especificado. Então criar uma coleção é tão simples quanto isto:

```php
    $collection = collect([1, 2, 3]);
```

 > [!ATENÇÃO]
 Todas as consultas do eloqüente são sempre retornadas como instâncias da coleção.

<a name="extending-collections"></a>
### Estender coleções

As coleções são "macroable", o que permite adicionar métodos adicionais à classe `Collection` no momento da execução. O método `Illuminate\Support\Collection` aceita um closure que será executado quando o macro for chamado. O closure de macro tem acesso aos outros métodos da coleção por meio do `$this`, assim como se fosse um verdadeiro método da classe de coleções. Por exemplo, o código a seguir adiciona um método `toUpper` à classe `Collection`:

```php
    use Illuminate\Support\Collection;
    use Illuminate\Support\Str;

    Collection::macro('toUpper', function () {
        return $this->map(function (string $value) {
            return Str::upper($value);
        });
    });

    $collection = collect(['first', 'second']);

    $upper = $collection->toUpper();

    // ['FIRST', 'SECOND']
```

Normalmente, você deve declarar os macro de coleção no método `boot` de um [provedor de serviço](/docs/providers).

<a name="macro-arguments"></a>
#### Argumentos de Macros

Se necessário, você pode definir macros que aceitem argumentos adicionais:

```php
    use Illuminate\Support\Collection;
    use Illuminate\Support\Facades\Lang;

    Collection::macro('toLocale', function (string $locale) {
        return $this->map(function (string $value) use ($locale) {
            return Lang::get($value, [], $locale);
        });
    });

    $collection = collect(['first', 'second']);

    $translated = $collection->toLocale('es');
```

<a name="available-methods"></a>
## Métodos disponíveis

Para a maioria das documentações restantes de coleções, discutiremos cada método disponível na classe Collection. Lembre-se que todos esses métodos podem ser concatenados para manipular o array subjacente de forma fluida. Além disso, quase todos os métodos retornam uma nova instância da coleção, permitindo que você preserve a cópia original quando necessário:

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<div class="collection-method-list" markdown="1">

[after](#method-after)
[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[before](#method-before)
[chunk](#method-chunk)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsOneItem](#method-containsoneitem)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffAssocUsing](#method-diffassocusing)
[diffKeys](#method-diffkeys)
[doesntContain](#method-doesntcontain)
[dot](#method-dot)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[ensure](#method-ensure)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forget](#method-forget)
[forPage](#method-forpage)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[hasAny](#method-hasany)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectAssoc](#method-intersectAssoc)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[lazy](#method-lazy)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[percentage](#method-percentage)
[pipe](#method-pipe)
[pipeInto](#method-pipeinto)
[pipeThrough](#method-pipethrough)
[pluck](#method-pluck)
[pop](#method-pop)
[prepend](#method-prepend)
[pull](#method-pull)
[push](#method-push)
[put](#method-put)
[random](#method-random)
[range](#method-range)
[reduce](#method-reduce)
[reduceSpread](#method-reduce-spread)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[select](#method-select)
[shift](#method-shift)
[shuffle](#method-shuffle)
[skip](#method-skip)
[skipUntil](#method-skipuntil)
[skipWhile](#method-skipwhile)
[slice](#method-slice)
[sliding](#method-sliding)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortDesc](#method-sortdesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[sortKeysUsing](#method-sortkeysusing)
[splice](#method-splice)
[split](#method-split)
[splitIn](#method-splitin)
[sum](#method-sum)
[take](#method-take)
[takeUntil](#method-takeuntil)
[takeWhile](#method-takewhile)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[transform](#method-transform)
[undot](#method-undot)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[value](#method-value)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[whereNotNull](#method-wherenotnull)
[whereNull](#method-wherenull)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

<a name="method-listing"></a>
## Lista de métodos

<style>
    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<a name="method-after"></a>
#### `after()`

O método `after` retorna o elemento após o item especificado. Se o item não for encontrado, ou se esse elemento for o último, será retornado `null`:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $collection->after(3);

    // 4

    $collection->after(5);

    // null
```

Este método procura o elemento especificado com uma comparação "fria", o que significa que uma string contendo um valor numérico será considerada igual a um número inteiro do mesmo valor. Para usar a comparação "rigorosa" você pode fornecer o argumento `strict` ao método:

```php
    collect([2, 4, 6, 8])->after('4', strict: true);

    // null
```

Como alternativa, você poderá fornecer o próprio closure para procurar pelo primeiro elemento que passa em um determinado teste de verdade:

```php
    collect([2, 4, 6, 8])->after(function (int $item, int $key) {
        return $item > 5;
    });

    // 8
```

<a name="method-all"></a>
#### `all()`

O método `all()` retorna o vetor subjacente representado pela coleção:

```php
    collect([1, 2, 3])->all();

    // [1, 2, 3]
```

<a name="method-average"></a>
#### `average()`

Aliases para o método [`avg`](#method-avg).

<a name="method-avg"></a>
#### `avg()`

O método `avg` retorna o [valor médio](https://pt.wikipedia.org/wiki/Média) de uma chave especificada:

```php
    $average = collect([
        ['foo' => 10],
        ['foo' => 10],
        ['foo' => 20],
        ['foo' => 40]
    ])->avg('foo');

    // 20

    $average = collect([1, 1, 2, 4])->avg();

    // 2
```

<a name="method-before"></a>
#### `before()`

O método `before` é o oposto do método [`after`](#method-after). Ele retorna o item anteriores ao item dado. Caso o item não seja encontrado ou seja o primeiro item, será retornado `null`:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $collection->before(3);

    // 2

    $collection->before(1);

    // null

    collect([2, 4, 6, 8])->before('4', strict: true);

    // null

    collect([2, 4, 6, 8])->before(function (int $item, int $key) {
        return $item > 5;
    });

    // 4
```

<a name="method-chunk"></a>
#### `chunk()`

O método `chunk` divide o conjunto em vários conjuntos menores de um tamanho especificado:

```php
    $collection = collect([1, 2, 3, 4, 5, 6, 7]);

    $chunks = $collection->chunk(4);

    $chunks->all();

    // [[1, 2, 3, 4], [5, 6, 7]]
```

Esse método é especialmente útil em [visualizações](/docs/views), quando você trabalha com sistemas de grid, como o Bootstrap ([Bootstrap](https://getbootstrap.com/docs/5.3/layout/grid/)). Por exemplo, imagine que você tenha uma coleção de [modelos Eloquent](/docs/eloquent) que precisa exibir em um grid:

```blade
@foreach ($products->chunk(3) as $chunk)
    <div class="row">
        @foreach ($chunk as $product)
            <div class="col-xs-4">{{ $product->name }}</div>
        @endforeach
    </div>
@endforeach
```

<a name="method-chunkwhile"></a>
#### `chunkWhile()`

O método `chunkWhile` divide a coleção em várias sub-coleções com base na avaliação do callback fornecido. A variável `$chunk`, passada ao closure, pode ser utilizada para inspecionar o elemento anterior:

```php
    $collection = collect(str_split('AABBCCCD'));

    $chunks = $collection->chunkWhile(function (string $value, int $key, Collection $chunk) {
        return $value === $chunk->last();
    });

    $chunks->all();

    // [['A', 'A'], ['B', 'B'], ['C', 'C', 'C'], ['D']]
```

<a name="method-collapse"></a>
#### `colapse()`

O método `collapse` reduz a coleção de arrays a uma única coleção plana:

```php
    $collection = collect([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ]);

    $collapsed = $collection->collapse();

    $collapsed->all();

    // [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-collect"></a>
#### `collect()`

O método `collect` retorna uma nova instância de `Collection` com os itens atualmente na coleção:

```php
    $collectionA = collect([1, 2, 3]);

    $collectionB = $collectionA->collect();

    $collectionB->all();

    // [1, 2, 3]
```

O método `collect` é primariamente útil para converter [coleções lentas](#lazy-collections) em instâncias `Collection` padrão:

```php
    $lazyCollection = LazyCollection::make(function () {
        yield 1;
        yield 2;
        yield 3;
    });

    $collection = $lazyCollection->collect();

    $collection::class;

    // 'Illuminate\Support\Collection'

    $collection->all();

    // [1, 2, 3]
```

::: info NOTA
O método `collect` é especialmente útil quando você tem uma instância do `Enumerable` e precisa de uma instância de coleção não-lenta (non-lazy). Como o `collect()` faz parte do contrato do `Enumerable`, você pode usá-lo com segurança para obter uma instância da classe `Collection`.
:::

<a name="method-combine"></a>
#### `combine()`

O método `combine` combina os valores da coleção, como chaves, com os valores de outro array ou coleção.

```php
    $collection = collect(['name', 'age']);

    $combined = $collection->combine(['George', 29]);

    $combined->all();

    // ['name' => 'George', 'age' => 29]
```

<a name="method-concat"></a>
#### `concat()`

O método `concat` adiciona os valores do(s) array(s) ou coleção(ões) ao final de outra coleção.

```php
    $collection = collect(['John Doe']);

    $concatenated = $collection->concat(['Jane Doe'])->concat(['name' => 'Johnny Doe']);

    $concatenated->all();

    // ['John Doe', 'Jane Doe', 'Johnny Doe']
```

O método `concat` altera numericamente os índices de chave dos itens concatendos à coleção original. Para manter as chaves em coleções associativas, consulte o método [merge](#method-merge).

<a name="method-contains"></a>
#### `contains()`

O método `contains` determina se uma determinada coleção contém um determinado elemento. Pode ser enviada para o método `contains` uma função closure, de forma a verificar se numa determinada entrada da lista existe um elemento que corresponda a uma validação definida:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $collection->contains(function (int $value, int $key) {
        return $value > 5;
    });

    // false
```

Alternativamente, você pode passar uma string para o método `contains` para determinar se a coleção contém um determinado valor de item:

```php
    $collection = collect(['name' => 'Desk', 'price' => 100]);

    $collection->contains('Desk');

    // true

    $collection->contains('New York');

    // false
```

Você também pode passar uma chave/par de valores para o método `contains`, que determinará se o par fornecido existe na coleção:

```php
    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
    ]);

    $collection->contains('product', 'Bookcase');

    // false
```

O método `contains` usa comparações "frouxas" ao verificar os valores dos itens, o que significa que uma string com um valor inteiro será considerada igual a um inteiro do mesmo valor. Para efetuar filtragem com comparações "rigorosas", use o método [`containsStrict`](#method-containsstrict).

O inverso do método `contains` é o método [doesntContain](#method-doesntcontain).

<a name="method-containsoneitem"></a>
#### `containsOneItem()`

O método `containsOneItem` indica se a coleção contém um único item:

```php
    collect([])->containsOneItem();

    // false

    collect(['1'])->containsOneItem();

    // true

    collect(['1', '2'])->containsOneItem();

    // false
```

<a name="method-containsstrict"></a>
#### `containsStrict()`

Este método tem a mesma assinatura que o método [`contains`](#method-contains). No entanto, todos os valores são verificados usando comparações "rigorosas".

::: info NOTA
O comportamento deste método é modificado ao usar [Coleções do Eloquent](/docs/eloquent-collections#method-contains).
:::

<a name="method-count"></a>
#### `count()` 

O método `count` retorna o número total de itens da coleção:

```php
    $collection = collect([1, 2, 3, 4]);

    $collection->count();

    // 4
```

<a name="method-countBy"></a>
#### `countBy()` 

O método `countBy` conta as ocorrências de valores na coleção. Por padrão, o método conta todas as ocorrências do elemento, permitindo contar certos "tipos" de elementos na coleção:

```php
    $collection = collect([1, 2, 2, 2, 3]);

    $counted = $collection->countBy();

    $counted->all();

    // [1 => 1, 2 => 3, 3 => 1]
```

Você pode passar um closure para o método `countBy`, para contar todos os itens com base num critério personalizado:

```php
    $collection = collect(['alice@gmail.com', 'bob@yahoo.com', 'carlos@gmail.com']);

    $counted = $collection->countBy(function (string $email) {
        return substr(strrchr($email, "@"), 1);
    });

    $counted->all();

    // ['gmail.com' => 2, 'yahoo.com' => 1]
```

<a name="method-crossjoin"></a>
#### `crossJoin()` 

O método `crossJoin` realiza uma operação de cruzamento entre os valores da coleção e dos conjuntos ou matrizes fornecidos, retornando um produto cartesiano com todas as permutações possíveis:

```php
    $collection = collect([1, 2]);

    $matrix = $collection->crossJoin(['a', 'b']);

    $matrix->all();

    /*
        [
            [1, 'a'],
            [1, 'b'],
            [2, 'a'],
            [2, 'b'],
        ]
    */

    $collection = collect([1, 2]);

    $matrix = $collection->crossJoin(['a', 'b'], ['I', 'II']);

    $matrix->all();

    /*
        [
            [1, 'a', 'I'],
            [1, 'a', 'II'],
            [1, 'b', 'I'],
            [1, 'b', 'II'],
            [2, 'a', 'I'],
            [2, 'a', 'II'],
            [2, 'b', 'I'],
            [2, 'b', 'II'],
        ]
    */
```

<a name="method-dd"></a>
#### `dd()` 

O método `dd` exclui os itens da coleção e termina a execução do script:

```php
    $collection = collect(['John Doe', 'Jane Doe']);

    $collection->dd();

    /*
        Collection {
            #items: array:2 [
                0 => "John Doe"
                1 => "Jane Doe"
            ]
        }
    */
```

Se você não quiser interromper o processamento do script, use o método [`dump`](#method-dump).

<a name="method-diff"></a>
#### `diff()` 

O método `diff` compara a coleção com outra coleção ou um simples array de PHP baseado em seus valores. Esse método retornará os valores da coleção original que não estão presentes na coleção especificada:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $diff = $collection->diff([2, 4, 6, 8]);

    $diff->all();

    // [1, 3, 5]
```

::: info NOTA
O comportamento deste método é modificado ao usar [Coleções Eloquent](/docs/eloquent-collections#method-diff).
:::

<a name="method-diffassoc"></a>
#### `diffAssoc()` 

O método `diffAssoc` compara uma coleção com outra coleção ou um simples array PHP, com base em chaves e valores. Este método retorna as pares de chave/valor na matriz original que não estão presentes na matriz especificada:

```php
    $collection = collect([
        'color' => 'orange',
        'type' => 'fruit',
        'remain' => 6,
    ]);

    $diff = $collection->diffAssoc([
        'color' => 'yellow',
        'type' => 'fruit',
        'remain' => 3,
        'used' => 6,
    ]);

    $diff->all();

    // ['color' => 'orange', 'remain' => 6]
```

<a name="method-diffassocusing"></a>
#### `diffAssocUsing()` 

Ao contrário do `diffAssoc`, o `diffAssocUsing` aceita uma função de retorno do usuário para comparação dos índices.

```php
    $collection = collect([
        'color' => 'orange',
        'type' => 'fruit',
        'remain' => 6,
    ]);

    $diff = $collection->diffAssocUsing([
        'Color' => 'yellow',
        'Type' => 'fruit',
        'Remain' => 3,
    ], 'strnatcasecmp');

    $diff->all();

    // ['color' => 'orange', 'remain' => 6]
```

A função de retorno deve ser uma função de comparação que retorne um número inteiro menor, igual ou maior do que zero. Para mais informações, consulte a documentação PHP sobre [`array_diff_uassoc`](https://www.php.net/array_diff_uassoc#refsect1-function.array-diff-uassoc-parameters), uma função PHP que a sua função `diffAssocUsing` utiliza internamente.

<a name="method-diffkeys"></a>
#### `diffKeys()` 

O método `diffKeys` compara a coleção com outra coleção ou um simples `array` PHP, com base em suas chaves. Este método retorna as pares de chave/valor da coleção original que não estão presentes na coleção fornecida:

```php
    $collection = collect([
        'one' => 10,
        'two' => 20,
        'three' => 30,
        'four' => 40,
        'five' => 50,
    ]);

    $diff = $collection->diffKeys([
        'two' => 2,
        'four' => 4,
        'six' => 6,
        'eight' => 8,
    ]);

    $diff->all();

    // ['one' => 10, 'three' => 30, 'five' => 50]
```

<a name="method-doesntcontain"></a>
#### `doesntContain()`

O método `doesntContain` determina se a coleção não contém um determinado item. Pode ser fornecido um bloco de expressão para o método `doesntContain` com o objetivo de determinar se um elemento não existe na coleção, que corresponda a um teste lógico especificado:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $collection->doesntContain(function (int $value, int $key) {
        return $value < 5;
    });

    // false
```

Alternativamente, você pode passar uma string para o método `doesntContain` para determinar se a coleção não contém um determinado valor do item.

```php
    $collection = collect(['name' => 'Desk', 'price' => 100]);

    $collection->doesntContain('Table');

    // true

    $collection->doesntContain('Desk');

    // false
```

Você também pode passar um par chave/valor para o método `doesntContain`, que determinará se o par fornecido não existe na coleção:

```php
    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
    ]);

    $collection->doesntContain('product', 'Bookcase');

    // true
```

O método `doesntContain` utiliza comparações "fracas" quando verifica os valores de itens, ou seja, uma string com um valor inteiro será considerada igual a um inteiro com o mesmo valor.

<a name="method-dot"></a>
#### `dot()`

O método `dot` reorganiza uma coleção multidimensional em uma coleção de um só nível, com notação de "ponto" para indicar a profundidade.

```php
    $collection = collect(['products' => ['desk' => ['price' => 100]]]);

    $flattened = $collection->dot();

    $flattened->all();

    // ['products.desk.price' => 100]
```

<a name="method-dump"></a>
#### `dump()` 

O método `dump` transfere os itens da coleção:

```php
    $collection = collect(['John Doe', 'Jane Doe']);

    $collection->dump();

    /*
        Collection {
            #items: array:2 [
                0 => "John Doe"
                1 => "Jane Doe"
            ]
        }
    */
```

Se você desejar parar a execução do script depois de exportar a coleção, utilize o método [dd](#method-dd).

<a name="method-duplicates"></a>
#### `duplicates()` 

O método `duplicates` recupera e devolve os valores duplicados da coleção:

```php
    $collection = collect(['a', 'b', 'a', 'c', 'b']);

    $collection->duplicates();

    // [2 => 'a', 4 => 'b']
```

Se a coleção conter matrizes ou objetos, você pode passar a chave dos atributos que deseja verificar em busca de valores duplicados:

```php
    $employees = collect([
        ['email' => 'abigail@example.com', 'position' => 'Developer'],
        ['email' => 'james@example.com', 'position' => 'Designer'],
        ['email' => 'victoria@example.com', 'position' => 'Developer'],
    ]);

    $employees->duplicates('position');

    // [2 => 'Developer']
```

<a name="method-duplicatesstrict"></a>
#### `duplicatesStrict()`

Este método tem a mesma assinatura do método [`duplicates`](#method-duplicates); no entanto, todos os valores são comparados utilizando comparações estritas.

<a name="method-each"></a>
#### `each()` 

O método `each` percorre os itens de uma coleção e passa cada um deles para o bloco de código:

```php
    $collection = collect([1, 2, 3, 4]);

    $collection->each(function (int $item, int $key) {
        // ...
    });
```

Se você pretender parar de fazer uma iteração através dos elementos, pode retornar `false` a partir da sua função anônima:

```php
    $collection->each(function (int $item, int $key) {
        if (/* condition */) {
            return false;
        }
    });
```

<a name="method-eachspread"></a>
#### `eachSpread()` 

O método `eachSpread` é executado em cada um dos itens da coleção, passando o valor do item aninhado para a função de retorno da chamada de callback:

```php
    $collection = collect([['John Doe', 35], ['Jane Doe', 33]]);

    $collection->eachSpread(function (string $name, int $age) {
        // ...
    });
```

Você pode parar a iteração através dos elementos ao retornar `false` do callback:

```php
    $collection->eachSpread(function (string $name, int $age) {
        return false;
    });
```

<a name="method-ensure"></a>
#### `ensure()` 

O método `ensure` pode ser usado para verificar que todos os elementos de uma coleção são do tipo ou lista de tipos especificados. Caso contrário, a exceção `UnexpectedValueException` será lançada:

```php
    return $collection->ensure(User::class);

    return $collection->ensure([User::class, Customer::class]);
```

Tipos primitivos, tais como "string", "int", "float", "bool" e "array", também podem ser especificados:

```php
    return $collection->ensure('int');
```

::: warning ATENÇÃO
O método `ensure` não garante que elementos de tipos diferentes não serão adicionados à coleção posteriormente.
:::

<a name="method-every"></a>
#### `every()` 

O método `every` pode ser usado para verificar se todos os elementos de uma coleção atendem a um determinado teste de verdade:

```php
    collect([1, 2, 3, 4])->every(function (int $value, int $key) {
        return $value > 2;
    });

    // false
```

Se a coleção estiver vazia, o método `every` retornará verdadeiro:

```php
    $collection = collect([]);

    $collection->every(function (int $value, int $key) {
        return $value > 2;
    });

    // true
```

<a name="method-except"></a>
#### `except()` 

O método `except` retorna todos os itens da coleção exceto aqueles com as chaves especificadas:

```php
    $collection = collect(['product_id' => 1, 'price' => 100, 'discount' => false]);

    $filtered = $collection->except(['price', 'discount']);

    $filtered->all();

    // ['product_id' => 1]
```

Para o inverso de `except`, consulte o método [only](#method-only).

::: info NOTA
O comportamento deste método é modificado ao usar [Coleções do Eloquent](/docs/{{version}}/eloquent-collections#method-except).
:::

<a name="method-filter"></a>
#### `filter()`

O método `filter` filtra a coleção usando o callback fornecido, mantendo apenas os itens que passam no teste verdadeiro:

```php
    $collection = collect([1, 2, 3, 4]);

    $filtered = $collection->filter(function (int $value, int $key) {
        return $value > 2;
    });

    $filtered->all();

    // [3, 4]
```

 Se não for fornecido um callback, todas as entradas da coleção equivalentes a `false` serão removidas:

```php
    $collection = collect([1, 2, 3, null, false, '', 0, []]);

    $collection->filter()->all();

    // [1, 2, 3]
```

Para o inverso do método `filter`, consulte o método [reject](#method-reject).

<a name="method-first"></a>
#### `first()` 

O método `first` retorna o primeiro elemento da coleção que passa num determinado teste de verdade:

```php
    collect([1, 2, 3, 4])->first(function (int $value, int $key) {
        return $value > 2;
    });

    // 3
```

Você também pode chamar o método `first` sem argumentos para conseguir o primeiro elemento da coleção. Se a coleção estiver vazia, será retornado `null`:

```php
    collect([1, 2, 3, 4])->first();

    // 1
```

<a name="method-first-or-fail"></a>
#### `firstOrFail()` 

O método `firstOrFail` é idêntico ao método `first`; contudo, se não for encontrado nenhum resultado, será lançada uma exceção `Illuminate\Support\ItemNotFoundException`:

```php
    collect([1, 2, 3, 4])->firstOrFail(function (int $value, int $key) {
        return $value > 5;
    });

    // Throws ItemNotFoundException...
```

Você também pode chamar o método `firstOrFail` sem nenhum argumento para obter o primeiro elemento da coleção. Caso a coleção esteja vazia, será lançada uma exceção `Illuminate\Support\ItemNotFoundException`:

```php
    collect([])->firstOrFail();

    // Throws ItemNotFoundException...
```

<a name="method-first-where"></a>
#### `firstWhere()` 

O método `firstWhere` retorna o primeiro elemento da coleção com a dupla chave/valor especificada:

```php
    $collection = collect([
        ['name' => 'Regena', 'age' => null],
        ['name' => 'Linda', 'age' => 14],
        ['name' => 'Diego', 'age' => 23],
        ['name' => 'Linda', 'age' => 84],
    ]);

    $collection->firstWhere('name', 'Linda');

    // ['name' => 'Linda', 'age' => 14]
```

Você também pode chamar o método `firstWhere` com um operador de comparação:

```php
    $collection->firstWhere('age', '>=', 18);

    // ['name' => 'Diego', 'age' => 23]
```

Como no método [where](#method-where), você pode passar um argumento ao método `firstWhere`. Nesse cenário, o método `firstWhere` retornará o primeiro item em que o valor da chave do item for verdadeiro:

```php
    $collection->firstWhere('age');

    // ['name' => 'Linda', 'age' => 14]
```

<a name="method-flatmap"></a>
#### `flatMap()` 

O método `flatMap` percorre uma coleção e passa cada valor para o bloco de código especificado. O bloco de código é livre para modificar os itens e retorná-los, formando assim uma nova coleção de itens modificados. Em seguida, o array é "achatado" por um nível:

```php
    $collection = collect([
        ['name' => 'Sally'],
        ['school' => 'Arkansas'],
        ['age' => 28]
    ]);

    $flattened = $collection->flatMap(function (array $values) {
        return array_map('strtoupper', $values);
    });

    $flattened->all();

    // ['name' => 'SALLY', 'school' => 'ARKANSAS', 'age' => '28'];
```

<a name="method-flatten"></a>
#### `flatten()` 

O método `flatten` reordeniza uma coleção multidimensional para um único nível:

```php
    $collection = collect([
        'name' => 'taylor',
        'languages' => [
            'php', 'javascript'
        ]
    ]);

    $flattened = $collection->flatten();

    $flattened->all();

    // ['taylor', 'php', 'javascript'];
```

Se necessário, você pode passar para o método `flatten` um parâmetro "depth":

```php
    $collection = collect([
        'Apple' => [
            [
                'name' => 'iPhone 6S',
                'brand' => 'Apple'
            ],
        ],
        'Samsung' => [
            [
                'name' => 'Galaxy S7',
                'brand' => 'Samsung'
            ],
        ],
    ]);

    $products = $collection->flatten(1);

    $products->values()->all();

    /*
        [
            ['name' => 'iPhone 6S', 'brand' => 'Apple'],
            ['name' => 'Galaxy S7', 'brand' => 'Samsung'],
        ]
    */
```

Neste exemplo, ao chamar o método `flatten` sem especificar a profundidade, os arrays aninhados também seriam achatados, resultando em `['iPhone 6S', 'Apple', 'Galaxy S7', 'Samsung']`. Ao fornecer uma profundidade você pode especificar o número de níveis que os arrays aninhados serão achatados.

<a name="method-flip"></a>
#### `flip()` 

O método `flip` troca as chaves da coleção com os valores correspondentes:

```php
    $collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

    $flipped = $collection->flip();

    $flipped->all();

    // ['taylor' => 'name', 'laravel' => 'framework']
```

<a name="method-forget"></a>
#### `forget()` 

O método `forget` remove um item da coleção por meio de seu identificador:

```php
    $collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

    $collection->forget('name');

    $collection->all();

    // ['framework' => 'laravel']
```

::: warning ATENÇÃO
Ao contrário da maioria dos outros métodos de coleção, o `forget` não retorna uma nova coleção modificada; ela modifica a própria coleção em que foi chamado.
:::

<a name="method-forpage"></a>
#### `forPage()` 

O método `forPage` retorna uma nova coleção contendo os itens que estarão presentes no número da página especificada. O método aceita o número da página como seu primeiro argumento e o número de itens a exibir por página como seu segundo argumento:

```php
    $collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    $chunk = $collection->forPage(2, 3);

    $chunk->all();

    // [4, 5, 6]
```

<a name="method-get"></a>
#### `get()` 

O método `get` retorna o item de um dado chave. Se a chave não existir, será retornado `null`:

```php
    $collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

    $value = $collection->get('name');

    // taylor
```

Opcionalmente, você pode definir um valor padrão como o segundo argumento:

```php
    $collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

    $value = $collection->get('age', 34);

    // 34
```

Você pode até mesmo passar um retorno de chamada como valor padrão do método. Se a chave especificada não existir, o resultado da função será retornado:

```php
    $collection->get('email', function () {
        return 'taylor@example.com';
    });

    // taylor@example.com
```

<a name="method-groupby"></a>
#### `groupBy()`

O método `groupBy` agrupa os itens da coleção por uma chave especificada:

```php
    $collection = collect([
        ['account_id' => 'account-x10', 'product' => 'Chair'],
        ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ['account_id' => 'account-x11', 'product' => 'Desk'],
    ]);

    $grouped = $collection->groupBy('account_id');

    $grouped->all();

    /*
        [
            'account-x10' => [
                ['account_id' => 'account-x10', 'product' => 'Chair'],
                ['account_id' => 'account-x10', 'product' => 'Bookcase'],
            ],
            'account-x11' => [
                ['account_id' => 'account-x11', 'product' => 'Desk'],
            ],
        ]
    */
```

Em vez de passar uma string como argumento, você pode usar um callback. O callback deve retornar o valor que será usado para chavear o grupo:

```php
    $grouped = $collection->groupBy(function (array $item, int $key) {
        return substr($item['account_id'], -3);
    });

    $grouped->all();

    /*
        [
            'x10' => [
                ['account_id' => 'account-x10', 'product' => 'Chair'],
                ['account_id' => 'account-x10', 'product' => 'Bookcase'],
            ],
            'x11' => [
                ['account_id' => 'account-x11', 'product' => 'Desk'],
            ],
        ]
    */
```

Você pode passar vários critérios de agrupamento como um array. Cada elemento do array será aplicado ao nível correspondente em um array multidimensional:

```php
    $data = new Collection([
        10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
        20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
        40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
    ]);

    $result = $data->groupBy(['skill', function (array $item) {
        return $item['roles'];
    }], preserveKeys: true);

    /*
    [
        1 => [
            'Role_1' => [
                10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
                20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
            ],
            'Role_2' => [
                20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
            ],
            'Role_3' => [
                10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
            ],
        ],
        2 => [
            'Role_1' => [
                30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
            ],
            'Role_2' => [
                40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
            ],
        ],
    ];
    */
```

<a name="method-has"></a>
#### `has()` 

O método `has` determinará se existe uma chave específica na coleção:

```php
    $collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

    $collection->has('product');

    // true

    $collection->has(['product', 'amount']);

    // true

    $collection->has(['amount', 'price']);

    // false
```

<a name="method-hasany"></a>
#### `hasAny()`

O método `hasAny` determina se algumas das chaves indicadas existem na coleção:

```php
    $collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

    $collection->hasAny(['product', 'price']);

    // true

    $collection->hasAny(['name', 'price']);

    // false
```

<a name="method-implode"></a>
#### `implode()` 

O método `implode` une os itens de uma coleção. Seus argumentos dependem do tipo de item na coleção. Caso a coleção contenha arrays ou objetos, você deve passar o índice dos atributos que deseja unir e a string "glue" (cola) que deseja utilizar entre os valores:

```php
    $collection = collect([
        ['account_id' => 1, 'product' => 'Desk'],
        ['account_id' => 2, 'product' => 'Chair'],
    ]);

    $collection->implode('product', ', ');

    // Desk, Chair
```

Se a coleção contiver simples cadeias de caracteres ou valores numéricos, você deve passar o "glue" como único argumento para o método:

```php
    collect([1, 2, 3, 4, 5])->implode('-');

    // '1-2-3-4-5'
```

Você pode passar um closure para o método `implode` caso queira formatar os valores sendo unidos.

```php
    $collection->implode(function (array $item, int $key) {
        return strtoupper($item['product']);
    }, ', ');

    // DESK, CHAIR
```

<a name="method-intersect"></a>
#### `intersect()` 

O método `intersect` remove de uma coleção os valores que não estão presentes no conjunto ou matriz indicada. A coleção resultante manterá as chaves da coleção inicial:

```php
    $collection = collect(['Desk', 'Sofa', 'Chair']);

    $intersect = $collection->intersect(['Desk', 'Chair', 'Bookcase']);

    $intersect->all();

    // [0 => 'Desk', 2 => 'Chair']
```

::: info NOTA
O comportamento deste método é modificado ao usar [Coleções do Eloquent](/docs/eloquent-collections#method-intersect).
:::

<a name="method-intersectAssoc"></a>
#### `intersectAssoc()` 

O método `intersectAssoc` compara a coleção de origem com outra coleção ou matriz e retorna os pares chave/valor que estão presentes em todas as coleções dadas:

```php
    $collection = collect([
        'color' => 'red',
        'size' => 'M',
        'material' => 'cotton'
    ]);

    $intersect = $collection->intersectAssoc([
        'color' => 'blue',
        'size' => 'M',
        'material' => 'polyester'
    ]);

    $intersect->all();

    // ['size' => 'M']
```

<a name="method-intersectbykeys"></a>
#### `intersectByKeys()`

O método `intersectByKeys` remove quaisquer chaves e respetivos valores da coleção inicial que não se encontrem no `array` ou na coleção fornecida:

```php
    $collection = collect([
        'serial' => 'UX301', 'type' => 'screen', 'year' => 2009,
    ]);

    $intersect = $collection->intersectByKeys([
        'reference' => 'UX404', 'type' => 'tab', 'year' => 2011,
    ]);

    $intersect->all();

    // ['type' => 'screen', 'year' => 2009]
```

<a name="method-isempty"></a>
#### `isEmpty()` 

O método `isEmpty` retorna `true` se a coleção estiver vazia e `false` de outra forma.

```php
    collect([])->isEmpty();

    // true
```

<a name="method-isnotempty"></a>
#### `isNotEmpty()` 

O método `isNotEmpty` retorna `true` se a coleção estiver não está vazia; caso contrário, é devolvido `false`:

```php
    collect([])->isNotEmpty();

    // false
```

<a name="method-join"></a>
#### `join()` 

A função `join` junta os valores da coleção com uma string. Usando o segundo argumento desta função, você pode especificar a forma como o último elemento deve ser anexado à string:

```php
    collect(['a', 'b', 'c'])->join(', '); // 'a, b, c'
    collect(['a', 'b', 'c'])->join(', ', ', and '); // 'a, b, and c'
    collect(['a', 'b'])->join(', ', ' and '); // 'a and b'
    collect(['a'])->join(', ', ' and '); // 'a'
    collect([])->join(', ', ' and '); // ''
```

<a name="method-keyby"></a>
#### `keyBy()` 

O método `keyBy` chaveia a coleção com base no item fornecido. Se vários itens tiverem o mesmo ítem-chave, apenas o último será inserido na nova coleção:

```php
    $collection = collect([
        ['product_id' => 'prod-100', 'name' => 'Desk'],
        ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]);

    $keyed = $collection->keyBy('product_id');

    $keyed->all();

    /*
        [
            'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
            'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
        ]
    */
```

Você também pode passar um callback para o método. O callback deve retornar o valor para chavear a coleção por:

```php
    $keyed = $collection->keyBy(function (array $item, int $key) {
        return strtoupper($item['product_id']);
    });

    $keyed->all();

    /*
        [
            'PROD-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
            'PROD-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
        ]
    */
```

<a name="method-keys"></a>
#### `keys()`

O método `keys` retorna todas as chaves da coleção:

```php
    $collection = collect([
        'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]);

    $keys = $collection->keys();

    $keys->all();

    // ['prod-100', 'prod-200']
```

<a name="method-last"></a>
#### `last()` 

O método `last` retorna o último elemento na coleção que passa em uma verificação de valor lógico especificada:

```php
    collect([1, 2, 3, 4])->last(function (int $value, int $key) {
        return $value < 3;
    });

    // 2
```

Você também pode chamar o método `last` sem argumentos para obter o último elemento da coleção. Se a coleção estiver vazia, será retornado um `null`:

```php
    collect([1, 2, 3, 4])->last();

    // 4
```

<a name="method-lazy"></a>
#### `lazy()` 

O método `lazy` retorna uma nova instância de [`LazyCollection`](#lazy-collections) do vetor subjacente de itens:

```php
    $lazyCollection = collect([1, 2, 3, 4])->lazy();

    $lazyCollection::class;

    // Illuminate\Support\LazyCollection

    $lazyCollection->all();

    // [1, 2, 3, 4]
```

Isto é especialmente útil quando você precisa realizar transformações em uma grande "Collection" que contém muitos itens:

```php
    $count = $hugeCollection
        ->lazy()
        ->where('country', 'FR')
        ->where('balance', '>', '100')
        ->count();
```

Ao converter uma coleção em uma `LazyCollection`, evitamos o alocação de grandes quantidades de memória adicional. Mesmo que a coleção original continue mantendo seus próprios valores na memória, os filtros subseqüentes não irão. Portanto, praticamente não será alocada nenhuma quantidade adicional de memória ao filtrar os resultados da coleção.

<a name="method-macro"></a>
#### `macro()` 

O método estático `macro` permite adicionar métodos à classe `Collection` em tempo de execução. Consulte a documentação sobre [extensão de coleções](#extending-collections) para obter mais informações.

<a name="method-make"></a>
#### `make()` 

O método estático `make` cria uma nova instância de coleção. Consulte o capítulo [Criando Coleções](#creating-collections).

<a name="method-map"></a>
#### `map()` 

O método `map` irá percorrer a coleção e passar cada valor para o callback fornecido. Você é livre para escolher se deseja modificar os elementos e devolvê-los em uma nova coleção:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $multiplied = $collection->map(function (int $item, int $key) {
        return $item * 2;
    });

    $multiplied->all();

    // [2, 4, 6, 8, 10]
```

::: warning ATENÇÃO
Como a maioria dos outros métodos de coleção, `map` retorna uma nova instância de coleção; ele não modifica a coleção na qual é chamado. Se você deseja transformar a coleção original, use o método [`transform`](#method-transform).
:::

<a name="method-mapinto"></a>
#### `mapInto()` 

O método `mapInto()` itera pela coleção, criando uma nova instância da classe especificada passando o valor ao construtor.

```php
    class Currency
    {
        /**
         * Crie uma nova instância de moeda.
         */
        function __construct(
            public string $code
        ) {}
    }

    $collection = collect(['USD', 'EUR', 'GBP']);

    $currencies = $collection->mapInto(Currency::class);

    $currencies->all();

    // [Currency('USD'), Currency('EUR'), Currency('GBP')]
```

<a name="method-mapspread"></a>
#### `mapSpread()` 

O método `mapSpread` é executado em uma iteração sobre os valores dos itens da coleção e passa o valor de cada item aninhado para o closure fornecido. Ao retornar do closure, a alteração feita nesse item é incluída na nova coleção:

```php
    $collection = collect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    $chunks = $collection->chunk(2);

    $sequence = $chunks->mapSpread(function (int $even, int $odd) {
        return $even + $odd;
    });

    $sequence->all();

    // [1, 5, 9, 13, 17]
```

<a name="method-maptogroups"></a>
#### mapToGroups() 

O método `mapToGroups` agrupa os itens da coleção com base no closure fornecido. O closure deve retornar um conjunto associativo que contenha uma única chave/par de valores, formando assim uma nova coleção de valores agrupados:

```php
    $collection = collect([
        [
            'name' => 'John Doe',
            'department' => 'Sales',
        ],
        [
            'name' => 'Jane Doe',
            'department' => 'Sales',
        ],
        [
            'name' => 'Johnny Doe',
            'department' => 'Marketing',
        ]
    ]);

    $grouped = $collection->mapToGroups(function (array $item, int $key) {
        return [$item['department'] => $item['name']];
    });

    $grouped->all();

    /*
        [
            'Sales' => ['John Doe', 'Jane Doe'],
            'Marketing' => ['Johnny Doe'],
        ]
    */

    $grouped->get('Sales')->all();

    // ['John Doe', 'Jane Doe']
```

<a name="method-mapwithkeys"></a>
#### `mapWithKeys()` 

O método `mapWithKeys` itera na coleção e passa cada valor para o callback especificado. O callback deve retornar um conjunto associado contendo uma única chave/par de valores:

```php
    $collection = collect([
        [
            'name' => 'John',
            'department' => 'Sales',
            'email' => 'john@example.com',
        ],
        [
            'name' => 'Jane',
            'department' => 'Marketing',
            'email' => 'jane@example.com',
        ]
    ]);

    $keyed = $collection->mapWithKeys(function (array $item, int $key) {
        return [$item['email'] => $item['name']];
    });

    $keyed->all();

    /*
        [
            'john@example.com' => 'John',
            'jane@example.com' => 'Jane',
        ]
    */
```

<a name="method-max"></a>
#### `max()` 

O método `max` retorna o valor máximo de um determinado parâmetro:

```php
    $max = collect([
        ['foo' => 10],
        ['foo' => 20]
    ])->max('foo');

    // 20

    $max = collect([1, 2, 3, 4, 5])->max();

    // 5
```

<a name="method-median"></a>
#### `median()` 

O método `median` retorna o valor médio (em inglês, `median`) de uma chave dada:

```php
    $median = collect([
        ['foo' => 10],
        ['foo' => 10],
        ['foo' => 20],
        ['foo' => 40]
    ])->median('foo');

    // 15

    $median = collect([1, 1, 2, 4])->median();

    // 1.5
```

<a name="method-merge"></a>
#### `merge()`

O método `merge` une o conjunto ou matriz fornecidos com o conjunto original. Se uma chave de tipo string nos itens fornecidos estiver relacionada com a chave de um item no conjunto original, o valor do item fornecido substituirá o valor correspondente na coleção:

```php
    $collection = collect(['product_id' => 1, 'price' => 100]);

    $merged = $collection->merge(['price' => 200, 'discount' => false]);

    $merged->all();

    // ['product_id' => 1, 'price' => 200, 'discount' => false]
```

Se as chaves do elemento forem numéricas, os valores serão acrescentados ao final da coleção:

```php
    $collection = collect(['Desk', 'Chair']);

    $merged = $collection->merge(['Bookcase', 'Door']);

    $merged->all();

    // ['Desk', 'Chair', 'Bookcase', 'Door']
```

<a name="method-mergerecursive"></a>
#### `mergeRecursive()` 

O método `mergeRecursive` combina de maneira recursiva o conjunto ou matriz indicados com o conjunto original. Se uma chave de string nos itens forem coincidentes com a chave de string no conjunto original, os valores destas chaves são combinados num array e isto é feito de forma recursiva:

```php
    $collection = collect(['product_id' => 1, 'price' => 100]);

    $merged = $collection->mergeRecursive([
        'product_id' => 2,
        'price' => 200,
        'discount' => false
    ]);

    $merged->all();

    // ['product_id' => [1, 2], 'price' => [100, 200], 'discount' => false]
```

<a name="method-min"></a>
#### `min()` 

O método min retorna o valor mínimo de um determinado parâmetro:

```php
    $min = collect([['foo' => 10], ['foo' => 20]])->min('foo');

    // 10

    $min = collect([1, 2, 3, 4, 5])->min();

    // 1
```

<a name="method-mode"></a>
#### `mode()` 

O método `mode` retorna o valor do [mode](https://pt.wikipedia.org/wiki/Modo_(estatística)) de uma determinada chave:

```php
    $mode = collect([
        ['foo' => 10],
        ['foo' => 10],
        ['foo' => 20],
        ['foo' => 40]
    ])->mode('foo');

    // [10]

    $mode = collect([1, 1, 2, 4])->mode();

    // [1]

    $mode = collect([1, 1, 2, 2])->mode();

    // [1, 2]
```

<a name="method-nth"></a>
#### nth() 

O método `nth` cria uma nova coleção que consiste em cada n-ésimo elemento:

```php
    $collection = collect(['a', 'b', 'c', 'd', 'e', 'f']);

    $collection->nth(4);

    // ['a', 'e']
```

É possível, opcionalmente, fornecer um deslocamento inicial como o segundo argumento:

```php
    $collection->nth(4, 1);

    // ['b', 'f']
```

<a name="method-only"></a>
#### `only()` 

O método `only` retorna os itens da coleção com as chaves especificadas:

```php
    $collection = collect([
        'product_id' => 1,
        'name' => 'Desk',
        'price' => 100,
        'discount' => false
    ]);

    $filtered = $collection->only(['product_id', 'name']);

    $filtered->all();

    // ['product_id' => 1, 'name' => 'Desk']
```

Para o inverso de `only`, consulte o método [except](#method-except).

::: info NOTA
O comportamento deste método é modificado ao usar [Coleções do Eloquent](/docs/eloquent-collections#method-only).
:::

<a name="method-pad"></a>
#### `pad()` 

O método `pad` preenche o array com um valor especificado até que esse tamanho seja atingido. Esse método é parecido com a função PHP [array_pad](https://secure.php.net/manual/pt_BR/function.array-pad.php).

Para espaçar para a esquerda, você deve especificar um tamanho negativo. Não ocorrerá espaçamento se o valor absoluto do tamanho for menor ou igual ao comprimento da matriz:

```php
    $collection = collect(['A', 'B', 'C']);

    $filtered = $collection->pad(5, 0);

    $filtered->all();

    // ['A', 'B', 'C', 0, 0]

    $filtered = $collection->pad(-5, 0);

    $filtered->all();

    // [0, 0, 'A', 'B', 'C']
```

<a name="method-partition"></a>
#### `partition()`

O método `partition` pode ser combinado com o destruturamento de arrays para separar os elementos que atendem um determinado teste verdadeiro dos que não.

```php
    $collection = collect([1, 2, 3, 4, 5, 6]);

    [$underThree, $equalOrAboveThree] = $collection->partition(function (int $i) {
        return $i < 3;
    });

    $underThree->all();

    // [1, 2]

    $equalOrAboveThree->all();

    // [3, 4, 5, 6]
```

<a name="method-percentage"></a>
#### `percentage()` 

O método `percentage` pode ser usado para determinar rapidamente o percentual de itens na coleção que atendem a um determinado teste de veracidade.

```php
$collection = collect([1, 1, 2, 2, 2, 3]);

$percentage = $collection->percentage(fn ($value) => $value === 1);

// 33.33
```

Por padrão, o valor do percentual é arredondado para duas casas decimais. No entanto, você pode personalizar este comportamento ao fornecer um segundo argumento à função:

```php
$percentage = $collection->percentage(fn ($value) => $value === 1, precision: 3);

// 33.333
```

<a name="method-pipe"></a>
#### `pipe()` 

O método `pipe` passa a coleção para o bloco de construção fornecido e retorna o resultado do bloco de construção executado:

```php
    $collection = collect([1, 2, 3]);

    $piped = $collection->pipe(function (Collection $collection) {
        return $collection->sum();
    });

    // 6
```

<a name="method-pipeinto"></a>
#### `pipeInto()` 

O método `pipeInto` cria uma nova instância da classe especificada e passa a coleção para o construtor:

```php
    class ResourceCollection
    {
        /**
         * Crie uma nova instância de ResourceCollection.
         */
        public function __construct(
          public Collection $collection,
        ) {}
    }

    $collection = collect([1, 2, 3]);

    $resource = $collection->pipeInto(ResourceCollection::class);

    $resource->collection->all();

    // [1, 2, 3]
```

<a name="method-pipethrough"></a>
#### `pipeThrough()` 

O método `pipeThrough` passa a coleção para um determinado array de closures e retorna o resultado dos closures executados:

```php
    use Illuminate\Support\Collection;

    $collection = collect([1, 2, 3]);

    $result = $collection->pipeThrough([
        function (Collection $collection) {
            return $collection->merge([4, 5]);
        },
        function (Collection $collection) {
            return $collection->sum();
        },
    ]);

    // 15
```

<a name="method-pluck"></a>
#### `pluck()` 

O método `pluck` recupera todos os valores de um determinado parâmetro:

```php
    $collection = collect([
        ['product_id' => 'prod-100', 'name' => 'Desk'],
        ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]);

    $plucked = $collection->pluck('name');

    $plucked->all();

    // ['Desk', 'Chair']
```

Também é possível especificar como você quer que a coleção seja identificada:

```php
    $plucked = $collection->pluck('name', 'product_id');

    $plucked->all();

    // ['prod-100' => 'Desk', 'prod-200' => 'Chair']
```

O método `pluck` também permite recuperar valores aninhados usando a notação de "ponto":

```php
    $collection = collect([
        [
            'name' => 'Laracon',
            'speakers' => [
                'first_day' => ['Rosa', 'Judith'],
            ],
        ],
        [
            'name' => 'VueConf',
            'speakers' => [
                'first_day' => ['Abigail', 'Joey'],
            ],
        ],
    ]);

    $plucked = $collection->pluck('speakers.first_day');

    $plucked->all();

    // [['Rosa', 'Judith'], ['Abigail', 'Joey']]
```

Se houver chaves duplicadas, o último elemento correspondente será inserido na coleção extraída:

```php
    $collection = collect([
        ['brand' => 'Tesla',  'color' => 'red'],
        ['brand' => 'Pagani', 'color' => 'white'],
        ['brand' => 'Tesla',  'color' => 'black'],
        ['brand' => 'Pagani', 'color' => 'orange'],
    ]);

    $plucked = $collection->pluck('color', 'brand');

    $plucked->all();

    // ['Tesla' => 'black', 'Pagani' => 'orange']
```

<a name="method-pop"></a>
#### `pop()` 

O método `pop` remove e retorna o último item da coleção:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $collection->pop();

    // 5

    $collection->all();

    // [1, 2, 3, 4]
```

Pode ser utilizado um número inteiro na chamada do método `pop` para remover e retornar vários itens de uma coleção:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $collection->pop(3);

    // collect([5, 4, 3])

    $collection->all();

    // [1, 2]
```

<a name="method-prepend"></a>
#### `prepend()`

O método `prepend` adiciona um elemento ao início da coleção:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $collection->prepend(0);

    $collection->all();

    // [0, 1, 2, 3, 4, 5]
```

Você também pode passar um segundo argumento para especificar a chave do item adicionado antes do outro:

```php
    $collection = collect(['one' => 1, 'two' => 2]);

    $collection->prepend(0, 'zero');

    $collection->all();

    // ['zero' => 0, 'one' => 1, 'two' => 2]
```

<a name="method-pull"></a>
#### `pull()`

O método `pull` remove e retorna um elemento da coleção pelo seu nome chave:

```php
    $collection = collect(['product_id' => 'prod-100', 'name' => 'Desk']);

    $collection->pull('name');

    // 'Desk'

    $collection->all();

    // ['product_id' => 'prod-100']
```

<a name="method-push"></a>
#### `push()` 

O método `push` adiciona um elemento no final da coleção:

```php
    $collection = collect([1, 2, 3, 4]);

    $collection->push(5);

    $collection->all();

    // [1, 2, 3, 4, 5]
```

<a name="method-put"></a>
#### `put()` 

O método `put` define a chave e o valor indicados na coleção:

```php
    $collection = collect(['product_id' => 1, 'name' => 'Desk']);

    $collection->put('price', 100);

    $collection->all();

    // ['product_id' => 1, 'name' => 'Desk', 'price' => 100]
```

#### `random()` 

O método `random` retorna um elemento aleatório da coleção:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $collection->random();

    // 4 - (recuperado aleatoriamente)
```

Você pode passar um inteiro para o `random` para especificar quantos itens deseja recuperar aleatoriamente. Uma coleção de itens sempre é retornada quando você passa explicitamente o número de itens que deseja receber:

```php
    $random = $collection->random(3);

    $random->all();

    // [2, 4, 5] - (recuperado aleatoriamente)
```

Se a instância da coleção tiver um número inferior de itens do solicitado, o método `random` irá lançar uma `InvalidArgumentException`.

O método `random` também aceita um closure, que recebe a instância atual da coleção:

```php
    use Illuminate\Support\Collection;

    $random = $collection->random(fn (Collection $items) => min(10, count($items)));

    $random->all();

    // [1, 2, 3, 4, 5] - (recuperado aleatoriamente)
```

<a name="method-range"></a>
#### `range()`

O método `range` retorna uma coleção que contém inteiros entre o intervalo especificado:

```php
    $collection = collect()->range(3, 6);

    $collection->all();

    // [3, 4, 5, 6]
```

<a name="method-reduce"></a>
#### `reduce()` 

O método `reduce` reduz a coleção para um único valor, passando o resultado de cada iteração na iteração subsequente:

```php
    $collection = collect([1, 2, 3]);

    $total = $collection->reduce(function (?int $carry, int $item) {
        return $carry + $item;
    });

    // 6
```

O valor para `$carry` na primeira iteração é `null`. No entanto, pode especificar o seu valor inicial passando um segundo argumento ao `reduce`:

```php
    $collection->reduce(function (int $carry, int $item) {
        return $carry + $item;
    }, 4);

    // 10
```

O método `reduce` também passa chaves de array em coleções associativas para o retorno de chamada fornecido:

```php
    $collection = collect([
        'usd' => 1400,
        'gbp' => 1200,
        'eur' => 1000,
    ]);

    $ratio = [
        'usd' => 1,
        'gbp' => 1.37,
        'eur' => 1.22,
    ];

    $collection->reduce(function (int $carry, int $value, int $key) use ($ratio) {
        return $carry + ($value * $ratio[$key]);
    });

    // 4264
```

<a name="method-reduce-spread"></a>
#### `reduceSpread()` 

O método `reduceSpread` reduz a coleção a um array de valores, passando os resultados de cada iteração para a iteração subsequente. Este método é semelhante ao método `reduce`, no entanto, este pode aceitar vários valores iniciais:

```php
    [$creditsRemaining, $batch] = Image::where('status', 'unprocessed')
        ->get()
        ->reduceSpread(function (int $creditsRemaining, Collection $batch, Image $image) {
            if ($creditsRemaining >= $image->creditsRequired()) {
                $batch->push($image);

                $creditsRemaining -= $image->creditsRequired();
            }

            return [$creditsRemaining, $batch];
        }, $creditsAvailable, collect());
```

<a name="method-reject"></a>
#### `reject()` 

O método `reject` filtra a coleção utilizando o closure especificado. O closure deverá retornar `true` se o item deveria ser removido da coleção resultante:

```php
    $collection = collect([1, 2, 3, 4]);

    $filtered = $collection->reject(function (int $value, int $key) {
        return $value > 2;
    });

    $filtered->all();

    // [1, 2]
```

Para o inverso do método `reject`, consulte o método [`filter`](#method-filter).

<a name="method-replace"></a>
#### `replace()`

O método `replace` funciona de forma semelhante ao `merge`; no entanto, além de substituir os itens correspondentes que têm chaves de string, o método `replace` também substitui os itens na coleção com chaves numéricas:

```php
    $collection = collect(['Taylor', 'Abigail', 'James']);

    $replaced = $collection->replace([1 => 'Victoria', 3 => 'Finn']);

    $replaced->all();

    // ['Taylor', 'Victoria', 'James', 'Finn']
```

<a name="method-replacerecursive"></a>
#### `replaceRecursive()` 

Esse método funciona como o `replace`, mas ele fará uma substituição em um array, aplicando-a aos valores internos do array:

```php
    $collection = collect([
        'Taylor',
        'Abigail',
        [
            'James',
            'Victoria',
            'Finn'
        ]
    ]);

    $replaced = $collection->replaceRecursive([
        'Charlie',
        2 => [1 => 'King']
    ]);

    $replaced->all();

    // ['Charlie', 'Abigail', ['James', 'King', 'Finn']]
```

<a name="method-reverse"></a>
#### `reverse()`

O método `reverse` reverte a ordem dos itens da coleção, mantendo as chaves originais:

```php
    $collection = collect(['a', 'b', 'c', 'd', 'e']);

    $reversed = $collection->reverse();

    $reversed->all();

    /*
        [
            4 => 'e',
            3 => 'd',
            2 => 'c',
            1 => 'b',
            0 => 'a',
        ]
    */
```

<a name="method-search"></a>
#### `search()` 

O método `search` procurará a chave da coleção com o valor indicado e retornará sua chave caso seja encontrada. Caso o elemento não seja encontrado, será retornado `false`:

```php
    $collection = collect([2, 4, 6, 8]);

    $collection->search(4);

    // 1
```

A pesquisa é realizada usando uma comparação "fraca", o que significa que uma string com um valor inteiro será considerado igual a um inteiro com o mesmo valor. Para usar a comparação "rigorosa" (estrita), passe `true` como segundo argumento para o método:

```php
    collect([2, 4, 6, 8])->search('4', strict: true);

    // false
```

Como alternativa, você pode fornecer sua própria função closure para buscar o primeiro item que passa em um determinado teste de verdade.

```php
    collect([2, 4, 6, 8])->search(function (int $item, int $key) {
        return $item > 5;
    });

    // 2
```

<a name="method-select"></a>
#### `select()`

O método `select` seleciona as chaves especificadas da coleção, de forma semelhante a uma instrução `SELECT` em SQL:

```php
$users = collect([
    ['name' => 'Taylor Otwell', 'role' => 'Developer', 'status' => 'active'],
    ['name' => 'Victoria Faith', 'role' => 'Researcher', 'status' => 'active'],
]);

$users->select(['name', 'role']);

/*
    [
        ['name' => 'Taylor Otwell', 'role' => 'Developer'],
        ['name' => 'Victoria Faith', 'role' => 'Researcher'],
    ],
*/
```

<a name="method-shift"></a>
#### `shift()` 

O método `shift()` remove o primeiro elemento da coleção e devolve-o:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $collection->shift();

    // 1

    $collection->all();

    // [2, 3, 4, 5]
```

Você pode passar um inteiro para o método `shift` para remover e retornar vários itens do início de uma coleção:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $collection->shift(3);

    // collect([1, 2, 3])

    $collection->all();

    // [4, 5]
```

<a name="method-shuffle"></a>
#### `shuffle()`

 O método "shuffle" permite que os itens na coleção sejam emparelhados aleatoriamente.

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $shuffled = $collection->shuffle();

    $shuffled->all();

    // [3, 2, 5, 1, 4] - (generated randomly)
```

<a name="method-skip"></a>
#### `skip()` 

O método `skip` retorna uma nova coleção com o número especificado de elementos removidos do início da coleção.

```php
    $collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    $collection = $collection->skip(4);

    $collection->all();

    // [5, 6, 7, 8, 9, 10]
```

<a name="method-skipuntil"></a>
#### `skipUntil()` 

O método `skipUntil` ignora itens da coleção até o retorno de `true`, na chamada do callback e em seguida, retorna os itens restantes na coleção como uma nova instância da coleção.

```php
    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->skipUntil(function (int $item) {
        return $item >= 3;
    });

    $subset->all();

    // [3, 4]
```

Você também pode passar um valor simples ao método `skipUntil`, para ignorar todos os itens até encontrar o valor especificado:

```php
    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->skipUntil(3);

    $subset->all();

    // [3, 4]
```

::: warning ATENÇÃO
Se o valor fornecido não estiver presente ou se o recurso de retorno nunca retornar `true`, a função `skipUntil` irá retornar uma coleção vazia.
:::

<a name="method-skipwhile"></a>
#### `skipWhile()`

O método `skipWhile` ignora os itens da coleção enquanto o callback fornecido retornar `true`, e em seguida, retorna os itens restantes na coleção como uma nova coleção.

```php
    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->skipWhile(function (int $item) {
        return $item <= 3;
    });

    $subset->all();

    // [4]
```

::: warning ATENÇÃO
Se o retorno do callback for sempre `false`, o método `skipWhile` irá devolver uma coleção vazia.
:::

<a name="method-slice"></a>
#### slice() 

O método `slice` retorna um fragmento da coleção que começa no índice especificado:

```php
    $collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    $slice = $collection->slice(4);

    $slice->all();

    // [5, 6, 7, 8, 9, 10]
```

Se quiser limitar o tamanho do trecho de retorno, passe o tamanho desejado como segundo argumento ao método:

```php
    $slice = $collection->slice(4, 2);

    $slice->all();

    // [5, 6]
```

A faixa retornada preservará os valores por padrão. Se você não desejar preservar as chaves originais, poderá usar o método [`values`](#method-values) para reorientar suas chaves.

<a name="method-sliding"></a>
#### `sliding()` 

O método `sliding()` retorna uma nova coleção de porções representando uma visão em "janela deslizante" dos itens na coleção:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $chunks = $collection->sliding(2);

    $chunks->toArray();

    // [[1, 2], [2, 3], [3, 4], [4, 5]]
```

Isto é especialmente útil em conjunto com o método [`eachSpread`](#method-eachspread):

```php
    $transactions->sliding(2)->eachSpread(function (Collection $previous, Collection $current) {
        $current->total = $previous->total + $current->amount;
    });
```

 Você pode opcionalmente passar um segundo valor de "step", que determina a distância entre o primeiro item de cada chunk:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $chunks = $collection->sliding(3, step: 2);

    $chunks->toArray();

    // [[1, 2, 3], [3, 4, 5]]
```

<a name="method-sole"></a>
#### `sole()`

O método `sole` retorna o primeiro elemento da coleção que passa em uma determinada verificação de validade. Contudo, essa condição é válida apenas para um único elemento:

```php
    collect([1, 2, 3, 4])->sole(function (int $value, int $key) {
        return $value === 2;
    });

    // 2
```

Você também pode passar um par de chave/valor para o método `sole`, que retornará o primeiro elemento na coleção que corresponda ao par fornecido, mas apenas se houver exatamente um elemento correspondente:

```php
    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
    ]);

    $collection->sole('product', 'Chair');

    // ['product' => 'Chair', 'price' => 100]
```

Como alternativa, você pode também chamar o método `sole` sem nenhum argumento para obter o primeiro elemento da coleção se houver apenas um elemento.

```php
    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
    ]);

    $collection->sole();

    // ['product' => 'Desk', 'price' => 200]
```

Se não existir nenhum elemento na coleção a ser retornado pelo método `sole`, será lançada uma exceção `\Illuminate\Collections\ItemNotFoundException`. Se houver mais de um elemento a ser retornado, será lançada uma exceção `\Illuminate\Collections\MultipleItemsFoundException`.

<a name="method-some"></a>
#### `some()`

Apelido para o método [`contains`](#method-contains).

<a name="method-sort"></a>
#### `sort()`

O método `sort` ordena a coleção. A ordem mantém as chaves da matriz original, então no exemplo seguinte iremos utilizar o método [`values`](#method-values) para redefinir as chaves como índices numerados consecutivamente:

```php
    $collection = collect([5, 3, 1, 2, 4]);

    $sorted = $collection->sort();

    $sorted->values()->all();

    // [1, 2, 3, 4, 5]
```

Se as suas necessidades de ordenação forem mais avançadas, poderá passar um callback ao `sort` com o seu próprio algoritmo. Consulte a documentação do PHP sobre [`uasort`](https://secure.php.net/manual/en/function.uasort.php#refsect1-function.uasort-parameters), que é o que o método `sort` da coleção utiliza internamente.

::: info NOTA
Se você precisar classificar uma coleção de arrays ou objetos aninhados, consulte os métodos [`sortBy`](#method-sortby) e [`sortByDesc`](#method-sortbydesc).
:::

<a name="method-sortby"></a>
#### `sortBy()` 

O método `sortBy` ordena a coleção de acordo com a chave fornecida. A coleção ordenada mantém as chaves do array original, portanto, no exemplo seguinte, utilizaremos o método [`values`](#method-values) para resetar as chaves para índices numerados consecutivamente:

```php
    $collection = collect([
        ['name' => 'Desk', 'price' => 200],
        ['name' => 'Chair', 'price' => 100],
        ['name' => 'Bookcase', 'price' => 150],
    ]);

    $sorted = $collection->sortBy('price');

    $sorted->values()->all();

    /*
        [
            ['name' => 'Chair', 'price' => 100],
            ['name' => 'Bookcase', 'price' => 150],
            ['name' => 'Desk', 'price' => 200],
        ]
    */
```
O método `sortBy` aceita [sinalizadores de ordenação](https://www.php.net/manual/en/function.sort.php) como segundo argumento:

```php
    $collection = collect([
        ['title' => 'Item 1'],
        ['title' => 'Item 12'],
        ['title' => 'Item 3'],
    ]);

    $sorted = $collection->sortBy('title', SORT_NATURAL);

    $sorted->values()->all();

    /*
        [
            ['title' => 'Item 1'],
            ['title' => 'Item 3'],
            ['title' => 'Item 12'],
        ]
    */
```

Como alternativa, você pode fornecer sua própria função de closure para determinar como ordenar os valores da coleção:

```php
    $collection = collect([
        ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
        ['name' => 'Chair', 'colors' => ['Black']],
        ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
    ]);

    $sorted = $collection->sortBy(function (array $product, int $key) {
        return count($product['colors']);
    });

    $sorted->values()->all();

    /*
        [
            ['name' => 'Chair', 'colors' => ['Black']],
            ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
            ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
        ]
    */
```

Se quiser classificar a sua coleção por vários atributos, poderá passar uma matriz de operações de classificação ao método `sortBy`. Cada operação de classificação deve ser um array que inclui o atributo em função do qual se pretende efetuar a classificação e a direção da ordem desejada:

```php
    $collection = collect([
        ['name' => 'Taylor Otwell', 'age' => 34],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Abigail Otwell', 'age' => 32],
    ]);

    $sorted = $collection->sortBy([
        ['name', 'asc'],
        ['age', 'desc'],
    ]);

    $sorted->values()->all();

    /*
        [
            ['name' => 'Abigail Otwell', 'age' => 32],
            ['name' => 'Abigail Otwell', 'age' => 30],
            ['name' => 'Taylor Otwell', 'age' => 36],
            ['name' => 'Taylor Otwell', 'age' => 34],
        ]
    */
```

Ao classificar uma coleção por vários atributos, você também pode fornecer closures que definem cada operação de classificação:

```php
    $collection = collect([
        ['name' => 'Taylor Otwell', 'age' => 34],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Abigail Otwell', 'age' => 32],
    ]);

    $sorted = $collection->sortBy([
        fn (array $a, array $b) => $a['name'] <=> $b['name'],
        fn (array $a, array $b) => $b['age'] <=> $a['age'],
    ]);

    $sorted->values()->all();

    /*
        [
            ['name' => 'Abigail Otwell', 'age' => 32],
            ['name' => 'Abigail Otwell', 'age' => 30],
            ['name' => 'Taylor Otwell', 'age' => 36],
            ['name' => 'Taylor Otwell', 'age' => 34],
        ]
    */
```

<a name="method-sortbydesc"></a>
#### `sortByDesc()` 

Este método tem a mesma assinatura que o método [`sortBy`](#method-sortby), mas ordena a coleção no sentido oposto.

<a name="method-sortdesc"></a>
#### `sortDesc()` 

Este método ordena a coleção em sentido oposto ao método [`sort`](#method-sort):

```php
    $collection = collect([5, 3, 1, 2, 4]);

    $sorted = $collection->sortDesc();

    $sorted->values()->all();

    // [5, 4, 3, 2, 1]
```

Ao contrário do `sort`, não é possível enviar um closure ao `sortDesc`. Em vez disso, deverá utilizar o método [`sort`](#method-sort) e inverter a comparação.

<a name="method-sortkeys"></a>
#### `sortKeys()` 

O método `sortKeys` classifica a coleção de acordo com os índices do array associação subjacente:

```php
    $collection = collect([
        'id' => 22345,
        'first' => 'John',
        'last' => 'Doe',
    ]);

    $sorted = $collection->sortKeys();

    $sorted->all();

    /*
        [
            'first' => 'John',
            'id' => 22345,
            'last' => 'Doe',
        ]
    */
```

<a name="method-sortkeysdesc"></a>
#### `sortKeysDesc()`

Este método tem a mesma assinatura que o método [`sortKeys`](#method-sortkeys), mas ordena a coleção no sentido oposto.

<a name="method-sortkeysusing"></a>
#### `sortKeysUsing()` 

O método `sortKeysUsing` ordena a coleção por meio das chaves do array associaativo subjacente usando um callback.

```php
    $collection = collect([
        'ID' => 22345,
        'first' => 'John',
        'last' => 'Doe',
    ]);

    $sorted = $collection->sortKeysUsing('strnatcasecmp');

    $sorted->all();

    /*
        [
            'first' => 'John',
            'ID' => 22345,
            'last' => 'Doe',
        ]
    */
```

O callback deve ser uma função de comparação que retorne um inteiro inferior, igual ou superior a zero. Consulte a documentação do PHP sobre [`uksort`](https://www.php.net/manual/en/function.uksort.php#refsect1-function.uksort-parameters) para mais informações. O `sortKeysUsing` é uma função interna que utiliza essa instrução de comparação PHP.

<a name="method-splice"></a>
#### `splice()` 

O método `splice` remove e retorna um trecho de itens que começa em uma determinada posição, especificado por um índice:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $chunk = $collection->splice(2);

    $chunk->all();

    // [3, 4, 5]

    $collection->all();

    // [1, 2]
```

Você pode passar um segundo argumento para limitar o tamanho da coleção resultante:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $chunk = $collection->splice(2, 1);

    $chunk->all();

    // [3]

    $collection->all();

    // [1, 2, 4, 5]
```

Além disso, você pode passar um terceiro argumento contendo os novos itens que substituirão os itens removidos da coleção.

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $chunk = $collection->splice(2, 1, [10, 11]);

    $chunk->all();

    // [3]

    $collection->all();

    // [1, 2, 10, 11, 4, 5]
```

<a name="method-split"></a>
#### `split()`

O método `split` divide um conjunto em uma quantidade determinada de grupos:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $groups = $collection->split(3);

    $groups->all();

    // [[1, 2], [3, 4], [5]]
```

<a name="method-splitin"></a>
#### `splitIn()` 

O método `splitIn` divide uma coleção em um número especificado de grupos, preenchendo os grupos não finais completamente antes de alocar o restante grupo:

```php
    $collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    $groups = $collection->splitIn(3);

    $groups->all();

    // [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]
```

<a name="method-sum"></a>
#### `sum()` 

O método `sum` retorna a soma de todos os itens na coleção:

```php
    collect([1, 2, 3, 4, 5])->sum();

    // 15
```

Se o conjunto de dados incluir matrizes ou objetos aninhados, você deve indicar uma chave para determinar quais valores somar:

```php
    $collection = collect([
        ['name' => 'JavaScript: The Good Parts', 'pages' => 176],
        ['name' => 'JavaScript: The Definitive Guide', 'pages' => 1096],
    ]);

    $collection->sum('pages');

    // 1272
```

Você também pode passar uma função própria de closure para determinar quais valores da coleção devem ser somados:

```php
    $collection = collect([
        ['name' => 'Chair', 'colors' => ['Black']],
        ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
        ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
    ]);

    $collection->sum(function (array $product) {
        return count($product['colors']);
    });

    // 6
```

<a name="method-take"></a>
#### `take()`

O método `take` retorna uma nova coleção com o número especificado de itens:

```php
    $collection = collect([0, 1, 2, 3, 4, 5]);

    $chunk = $collection->take(3);

    $chunk->all();

    // [0, 1, 2]
```

Você também pode passar um inteiro negativo para obter o número especificado de itens do final da coleção.

```php
    $collection = collect([0, 1, 2, 3, 4, 5]);

    $chunk = $collection->take(-2);

    $chunk->all();

    // [4, 5]
```

<a name="method-takeuntil"></a>
#### `takeUntil()` 

O método `takeUntil` retorna itens na coleção até o sucesso do callback passado:

```php
    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->takeUntil(function (int $item) {
        return $item >= 3;
    });

    $subset->all();

    // [1, 2]
```

Você também pode passar um valor simples para o método `takeUntil`, de forma que os itens sejam retornados até que o valor especificado seja encontrado:

```php
    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->takeUntil(3);

    $subset->all();

    // [1, 2]
```

 > [AVISO]
 > Se o valor fornecido não for encontrado ou se o callback nunca retornar `true`, a metodologia `takeUntil` devolverá todos os itens na coleção.

<a name="method-takewhile"></a>
#### `takeWhile()`

O método `takeWhile` retorna os itens da coleção até o callback fornecido retornar `false`:

```php
    $collection = collect([1, 2, 3, 4]);

    $subset = $collection->takeWhile(function (int $item) {
        return $item < 3;
    });

    $subset->all();

    // [1, 2]
```

::: warning ATENÇÃO
Se o retorno de chamada nunca retornar `false`, o método `takeWhile` retornará todos os itens da coleção.
:::

<a name="method-tap"></a>
#### `tap()` 

O método `tap` passa a coleção para o callback indicado, permitindo-lhe "interferir" na coleção num determinado ponto e efetuar algo com os itens sem afetar a própria coleção. A coleção é então devolvida pelo método `tap`:

```php
    collect([2, 4, 3, 1, 5])
        ->sort()
        ->tap(function (Collection $collection) {
            Log::debug('Values after sorting', $collection->values()->all());
        })
        ->shift();

    // 1
```

<a name="method-times"></a>
#### `times()`

O método estático `times` cria uma nova coleção ao chamar um closure especificado em um número determinado de vezes:

```php
    $collection = Collection::times(10, function (int $number) {
        return $number * 9;
    });

    $collection->all();

    // [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
```

<a name="method-toarray"></a>
#### `toArray()` 

O método `toArray` converte a coleção em um simples "array" de PHP. Caso os valores da coleção sejam modelos [Eloquent](https://docs.laravel.com/lt-pt/eloquent), esses modelos também serão convertidos para arrays:

```php
    $collection = collect(['name' => 'Desk', 'price' => 200]);

    $collection->toArray();

    /*
        [
            ['name' => 'Desk', 'price' => 200],
        ]
    */
```

::: warning ATENÇÃO
`toArray` também converte todos os objetos aninhados da coleção que são uma instância de `Arrayable` em um array. Se você deseja obter o array bruto subjacente à coleção, use o método [`all`](#method-all) em vez disso.
:::

<a name="method-tojson"></a>
#### `toJSON()` 

O método `toJSON` converte a coleção em uma cadeia de formato JSON:

```php
    $collection = collect(['name' => 'Desk', 'price' => 200]);

    $collection->toJson();

    // '{"name":"Desk", "price":200}'
```

<a name="method-transform"></a>
#### `transform()` 

O método transform executa a iteração pela coleção e chama o callback especificado com cada item da coleção. Os itens na coleção serão substituídos pelos valores retornados pelo callback:

```php
    $collection = collect([1, 2, 3, 4, 5]);

    $collection->transform(function (int $item, int $key) {
        return $item * 2;
    });

    $collection->all();

    // [2, 4, 6, 8, 10]
```

::: warning ATENÇÃO
Ao contrário da maioria dos outros métodos de coleção, `transform` modifica a própria coleção. Se você deseja criar uma nova coleção, use o método [`map`](#method-map).
:::

<a name="method-undot"></a>
#### `undot()` 

O método `undot` expande uma coleção unidimensional que usa a notação de pontuação ("dot") para uma coleção multidimensional:

```php
    $person = collect([
        'name.first_name' => 'Marie',
        'name.last_name' => 'Valentine',
        'address.line_1' => '2992 Eagle Drive',
        'address.line_2' => '',
        'address.suburb' => 'Detroit',
        'address.state' => 'MI',
        'address.postcode' => '48219'
    ]);

    $person = $person->undot();

    $person->toArray();

    /*
        [
            "name" => [
                "first_name" => "Marie",
                "last_name" => "Valentine",
            ],
            "address" => [
                "line_1" => "2992 Eagle Drive",
                "line_2" => "",
                "suburb" => "Detroit",
                "state" => "MI",
                "postcode" => "48219",
            ],
        ]
    */
```

<a name="method-union"></a>
#### `union()`

O método `union` adiciona o conjunto dado à coleção. Se o conjunto fornecido contiver chaves que estiverem presentes na coleção original, os valores da coleção original serão preferidos:

```php
    $collection = collect([1 => ['a'], 2 => ['b']]);

    $union = $collection->union([3 => ['c'], 1 => ['d']]);

    $union->all();

    // [1 => ['a'], 2 => ['b'], 3 => ['c']]
```

<a name="method-unique"></a>
#### `unique()` 

O método `unique` retorna todos os itens exclusivos da coleção. A coleção retornada mantém as chaves do array original, então no exemplo a seguir usaremos o método [`values`](#method-values) para redefinir as chaves para índices numerados consecutivamente:

```php
    $collection = collect([1, 1, 2, 2, 3, 4, 2]);

    $unique = $collection->unique();

    $unique->values()->all();

    // [1, 2, 3, 4]
```

Ao lidar com matrizes ou objetos aninhados, você pode especificar a chave usada para determinar a unicidade:

```php
    $collection = collect([
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'iPhone 5', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
        ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
    ]);

    $unique = $collection->unique('brand');

    $unique->values()->all();

    /*
        [
            ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
            ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
        ]
    */
```

Por último, você também pode fornecer uma função própria de closure para o método `unique`, especificando qual valor deve determinar a exclusividade do item:

```php
    $unique = $collection->unique(function (array $item) {
        return $item['brand'].$item['type'];
    });

    $unique->values()->all();

    /*
        [
            ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
            ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
            ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
            ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
        ]
    */
```

O método `unique` utiliza comparações "fraca", ou seja, uma string com um valor inteiro é considerada igual a um inteiro do mesmo valor. Para filtrar usando comparações "rigorosas", use o método [`uniqueStrict`](#method-uniquestrict).

::: info NOTA
O comportamento deste método é modificado ao usar [Coleções Eloquent](/docs/eloquent-collections#method-unique).
:::

<a name="method-uniquestrict"></a>
#### `uniqueStrict()` 

Esse método tem a mesma assinatura que o método ["unique"](#método-unique); no entanto, todos os valores são comparados usando comparações estritas.

<a name="method-unless"></a>
#### `unless()` 

O método `unless` irá executar o callback fornecido, a menos que o primeiro argumento seja `true`:

```php
    $collection = collect([1, 2, 3]);

    $collection->unless(true, function (Collection $collection) {
        return $collection->push(4);
    });

    $collection->unless(false, function (Collection $collection) {
        return $collection->push(5);
    });

    $collection->all();

    // [1, 2, 3, 5]
```

Pode ser passada uma segunda chamada de retorno para o método `unless`. A segunda função é executada quando o primeiro argumento for avaliado como verdadeiro.

```php
    $collection = collect([1, 2, 3]);

    $collection->unless(true, function (Collection $collection) {
        return $collection->push(4);
    }, function (Collection $collection) {
        return $collection->push(5);
    });

    $collection->all();

    // [1, 2, 3, 5]
```

Para o inverso de `unless`, consulte o método ["when"](#método-when).

<a name="method-unlessempty"></a>
#### `unlessEmpty()` 

Nome alternativo para o método [`whenNotEmpty`](#método-whennotempty).

<a name="method-unlessnotempty"></a>
#### `unlessNotEmpty()` 

Apelido para o método [`whenEmpty`](#method-weneemp).

<a name="method-unwrap"></a>
#### `unwrap()` 

O método estático `unwrap` retorna os itens subjacentes da coleção do valor dado quando aplicável:

```php
    Collection::unwrap(collect('John Doe'));

    // ['John Doe']

    Collection::unwrap(['John Doe']);

    // ['John Doe']

    Collection::unwrap('John Doe');

    // 'John Doe'
```

<a name="method-value"></a>
#### `value()` 

O método `value` recupera um determinado valor do primeiro elemento da coleção:

```php
    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Speaker', 'price' => 400],
    ]);

    $value = $collection->value('price');

    // 200
```

<a name="method-values"></a>
#### `values()`

O método `values` retorna uma nova coleção com as chaves redefinidas como números inteiros consecutivos:

```php
    $collection = collect([
        10 => ['product' => 'Desk', 'price' => 200],
        11 => ['product' => 'Desk', 'price' => 200],
    ]);

    $values = $collection->values();

    $values->all();

    /*
        [
            0 => ['product' => 'Desk', 'price' => 200],
            1 => ['product' => 'Desk', 'price' => 200],
        ]
    */
```

<a name="method-when"></a>
#### when() 

O método `when` irá executar o callback fornecido quando o primeiro argumento for avaliado como `true`. A instância da coleção e o primeiro argumento passados ao método `when` serão fornecidos para o closure:

```php
    $collection = collect([1, 2, 3]);

    $collection->when(true, function (Collection $collection, int $value) {
        return $collection->push(4);
    });

    $collection->when(false, function (Collection $collection, int $value) {
        return $collection->push(5);
    });

    $collection->all();

    // [1, 2, 3, 4]
```

Uma segunda chamada de retorno pode ser passada para a função `when`. O segundo código de retorno será executado quando o primeiro argumento fornecido à função `when` tiver um valor verdadeiro:

```php
    $collection = collect([1, 2, 3]);

    $collection->when(false, function (Collection $collection, int $value) {
        return $collection->push(4);
    }, function (Collection $collection) {
        return $collection->push(5);
    });

    $collection->all();

    // [1, 2, 3, 5]
```

Para o inverso do `when` (ou seja, quando não), consulte o método ["unless"](#method-unless).

<a name="method-whenempty"></a>
#### `whenEmpty()`

O método `whenEmpty` irá executar o ponto de chamada fornecido quando a coleção estiver vazia:

```php
    $collection = collect(['Michael', 'Tom']);

    $collection->whenEmpty(function (Collection $collection) {
        return $collection->push('Adam');
    });

    $collection->all();

    // ['Michael', 'Tom']


    $collection = collect();

    $collection->whenEmpty(function (Collection $collection) {
        return $collection->push('Adam');
    });

    $collection->all();

    // ['Adam']
```

Uma segunda ação de closure pode ser passada para o método `whenEmpty`, que será executado quando a coleção estiver vazia.

```php
    $collection = collect(['Michael', 'Tom']);

    $collection->whenEmpty(function (Collection $collection) {
        return $collection->push('Adam');
    }, function (Collection $collection) {
        return $collection->push('Taylor');
    });

    $collection->all();

    // ['Michael', 'Tom', 'Taylor']
```

Para obter o inverso de `whenEmpty`, consulte o método [`whenNotEmpty`](#method-whennotempty).

<a name="method-whennotempty"></a>
#### `whenNotEmpty()` 

O método `whenNotEmpty` irá executar o callback dado quando a coleção estiver vazia:

```php
    $collection = collect(['michael', 'tom']);

    $collection->whenNotEmpty(function (Collection $collection) {
        return $collection->push('adam');
    });

    $collection->all();

    // ['michael', 'tom', 'adam']


    $collection = collect();

    $collection->whenNotEmpty(function (Collection $collection) {
        return $collection->push('adam');
    });

    $collection->all();

    // []
```

Pode ser passado um segundo closure para o método `whenNotEmpty`, que será executado quando a coleção estiver vazia:

```php
    $collection = collect();

    $collection->whenNotEmpty(function (Collection $collection) {
        return $collection->push('adam');
    }, function (Collection $collection) {
        return $collection->push('taylor');
    });

    $collection->all();

    // ['taylor']
```

Para o inverso de `whenNotEmpty`, consulte o método [`whenEmpty`](#method-whenempty).

<a name="method-where"></a>
#### `where()` 

O método `where` filtra a coleção por um determinado par de chave/valor:

```php
    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Door', 'price' => 100],
    ]);

    $filtered = $collection->where('price', 100);

    $filtered->all();

    /*
        [
            ['product' => 'Chair', 'price' => 100],
            ['product' => 'Door', 'price' => 100],
        ]
    */
```

O método `where` utiliza comparações "relaxadas", o que significa que uma string com um valor inteiro será considerada igual a um inteiro de mesmo valor. Use o método [`whereStrict`](#method-wherestrict) para filtrar com comparações "rigorosas".

Opcionalmente, você pode passar um operador de comparação como segundo parâmetro. Os operadores suportados são: '===', '!==', '!=', '==', '=', '<>', '>', '<', '>=' e ' <=':

```php
    $collection = collect([
        ['name' => 'Jim', 'deleted_at' => '2019-01-01 00:00:00'],
        ['name' => 'Sally', 'deleted_at' => '2019-01-02 00:00:00'],
        ['name' => 'Sue', 'deleted_at' => null],
    ]);

    $filtered = $collection->where('deleted_at', '!=', null);

    $filtered->all();

    /*
        [
            ['name' => 'Jim', 'deleted_at' => '2019-01-01 00:00:00'],
            ['name' => 'Sally', 'deleted_at' => '2019-01-02 00:00:00'],
        ]
    */
```

<a name="method-wherestrict"></a>
#### `whereStrict()` 

Este método tem a mesma assinatura que o método ["where"](#method-where); no entanto, todos os valores são comparados usando comparações "estritas".

<a name="method-wherebetween"></a>
#### `between()`

O método `whereBetween` filtra a coleção determinando se o valor do item especificado está dentro de um intervalo dado:

```php
    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 80],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Pencil', 'price' => 30],
        ['product' => 'Door', 'price' => 100],
    ]);

    $filtered = $collection->whereBetween('price', [100, 200]);

    $filtered->all();

    /*
        [
            ['product' => 'Desk', 'price' => 200],
            ['product' => 'Bookcase', 'price' => 150],
            ['product' => 'Door', 'price' => 100],
        ]
    */
```

#### `whereIn()` 

O método `whereIn` remove os elementos da coleção que não possuem um determinado valor de item contido na matriz especificada:

```php
    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Door', 'price' => 100],
    ]);

    $filtered = $collection->whereIn('price', [150, 200]);

    $filtered->all();

    /*
        [
            ['product' => 'Desk', 'price' => 200],
            ['product' => 'Bookcase', 'price' => 150],
        ]
    */
```

O método `whereIn` utiliza comparações "fracas" ao verificar os valores dos itens, o que significa que uma string com um valor inteiro será considerada igual a um inteiro com o mesmo valor. Use o método [`whereInStrict`](#method-whereinstrict) para filtrar usando comparações "rigorosas".

<a name="method-whereinstrict"></a>
#### `whereInStrict()`

Este método possui a mesma assinatura que o método [`whereIn`](#método-wherein); no entanto, todas as comparações são efetuadas usando comparações “rigorosas”.

<a name="method-whereinstanceof"></a>
#### `whereInstanceOf()`

O método `whereInstanceOf` filtra a coleção por um tipo de classe específica:

```php
    use App\Models\User;
    use App\Models\Post;

    $collection = collect([
        new User,
        new User,
        new Post,
    ]);

    $filtered = $collection->whereInstanceOf(User::class);

    $filtered->all();

    // [App\Models\User, App\Models\User]
```

<a name="method-wherenotbetween"></a>
#### `whereNotBetween()`

O método `whereNotBetween` filtra a coleção determinando se o valor do item especificado está fora de um intervalo dado:

```php
    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 80],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Pencil', 'price' => 30],
        ['product' => 'Door', 'price' => 100],
    ]);

    $filtered = $collection->whereNotBetween('price', [100, 200]);

    $filtered->all();

    /*
        [
            ['product' => 'Chair', 'price' => 80],
            ['product' => 'Pencil', 'price' => 30],
        ]
    */
```

<a name="method-wherenotin"></a>
#### `whereNotIn()` 

O método `whereNotIn` remove os elementos da coleção que têm um valor de elemento especificado que está contido no array fornecido:

```php
    $collection = collect([
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Door', 'price' => 100],
    ]);

    $filtered = $collection->whereNotIn('price', [150, 200]);

    $filtered->all();

    /*
        [
            ['product' => 'Chair', 'price' => 100],
            ['product' => 'Door', 'price' => 100],
        ]
    */
```

O método `whereNotIn` usa comparações "fracas" ao verificar os valores dos itens, o que significa que uma string com um valor inteiro será considerada igual a um inteiro com o mesmo valor. Use o método [`whereNotInStrict`](#method-wherenotinstrict) para filtrar usando comparações "rigorosas".

<a name="method-wherenotinstrict"></a>
#### `whereNotInStrict()` 

Esse método possui a mesma assinatura que o método [`whereNotIn`](#método-wherenotin), porém todas as comparações são feitas de maneira estrita (strict).

<a name="method-wherenotnull"></a>
#### `whereNotNull()` 

O método `whereNotNull` retorna itens de uma coleção onde a chave indicada não é `null`:

```php
    $collection = collect([
        ['name' => 'Desk'],
        ['name' => null],
        ['name' => 'Bookcase'],
    ]);

    $filtered = $collection->whereNotNull('name');

    $filtered->all();

    /*
        [
            ['name' => 'Desk'],
            ['name' => 'Bookcase'],
        ]
    */
```

<a name="method-wherenull"></a>
#### `whereNull()` 

O método `whereNull` retorna itens da coleção em que a chave fornecida é `null`:

```php
    $collection = collect([
        ['name' => 'Desk'],
        ['name' => null],
        ['name' => 'Bookcase'],
    ]);

    $filtered = $collection->whereNull('name');

    $filtered->all();

    /*
        [
            ['name' => null],
        ]
    */
```

<a name="method-wrap"></a>
#### `wrap()` 

O método estático `wrap` envolve o valor dado em uma coleção quando aplicável:

```php
    use Illuminate\Support\Collection;

    $collection = Collection::wrap('John Doe');

    $collection->all();

    // ['John Doe']

    $collection = Collection::wrap(['John Doe']);

    $collection->all();

    // ['John Doe']

    $collection = Collection::wrap(collect('John Doe'));

    $collection->all();

    // ['John Doe']
```

<a name="method-zip"></a>
#### `zip()` 

O método `zip` combina os valores do array fornecido com os valores da coleção original no mesmo índice:

```php
    $collection = collect(['Chair', 'Desk']);

    $zipped = $collection->zip([100, 200]);

    $zipped->all();

    // [['Chair', 100], ['Desk', 200]]
```

<a name="higher-order-messages"></a>
## Mensagens de ordem superior

As coleções também fornecem suporte para mensagens de "ordem superior", que são atalhos para a execução de ações comuns nas coleções. Os métodos de coleção que fornecem mensagens de ordem superior são: [`average`](#method-average), [`avg`](#method-avg), [`contains`](#method-contains), [`each`](#method-each), [`every`](#method-every), [`filter`](#method-filter), [`first`](#method-first), [`flatMap`](#method-flatmap), [`groupBy`](#method-groupby), [`keyBy`](#method-keyby), [`map`](#method-map), [`max`](#method-max), [`min`](#method-min), [`partition`](#method-partition), [`reject`](#method-reject), [`skipUntil`](#method-skipuntil), [`skipWhile`](#method-skipwhile), [`some`](#method-some), [`sortBy`](#method-sortby), [`sortByDesc`](#method-sortbydesc), [`sum`](#method-sum), [`takeUntil`](#method-takeuntil), [`takeWhile`](#method-takewhile) e [`unique`](#method-unique).

Cada mensagem de ordem superior pode ser obtida como uma propriedade dinâmica de uma instância da coleção. Por exemplo, para utilizar a mensagem de ordem superior `each` é possível chamar uma função em cada objeto dentro da coleção:

```php
    use App\Models\User;

    $users = User::where('votes', '>', 500)->get();

    $users->each->markAsVip();
```

Do mesmo modo, podemos usar a mensagem de segunda ordem `sum` para obter o número total de "votos" num conjunto de utilizadores:

```php
    $users = User::where('group', 'Development')->get();

    return $users->sum->votes;
```

<a name="lazy-collections"></a>
## Lazy Collections

<a name="lazy-collection-introduction"></a>
### Introdução

::: warning ATENÇÃO
Antes de aprender mais sobre as coleções lentas do Laravel, reserve um tempo para se familiarizar com os [geradores PHP](https://www.php.net/manual/en/language.generators.overview.php).
:::

Para suplementar a poderosa classe `Collection`, a classe `LazyCollection` aproveita os [geradores do PHP](https://www.php.net/manual/en/language.generators.overview.php) para permitir que você trabalhe com conjuntos de dados muito grandes mantendo o uso da memória baixo.

Por exemplo, imagine que o seu aplicativo tenha de processar um ficheiro de registro de vários gigabytes, aproveitando para analisá-lo com os métodos de coleção do Laravel. Em vez de ler todo o arquivo na memória de uma só vez, pode ser utilizada a capacidade de criação de coleções "lazy" que mantêm apenas uma pequena parte do ficheiro na memória numa determinada altura:

```php
    use App\Models\LogEntry;
    use Illuminate\Support\LazyCollection;

    LazyCollection::make(function () {
        $handle = fopen('log.txt', 'r');

        while (($line = fgets($handle)) !== false) {
            yield $line;
        }
    })->chunk(4)->map(function (array $lines) {
        return LogEntry::fromLines($lines);
    })->each(function (LogEntry $logEntry) {
        // Processar a entrada de registro...
    });
```

Ou, imagine que você precise iterar através de 10.000 modelos Eloquent. Quando usamos coleções tradicionais do Laravel, todos os 10.000 modelos Eloquent devem ser carregados na memória ao mesmo tempo:

```php
    use App\Models\User;

    $users = User::all()->filter(function (User $user) {
        return $user->id > 500;
    });
```

No entanto, o método cursor do construtor de consultas retorna uma instância de `LazyCollection`. Isto permite-lhe realizar apenas uma única consulta contra o banco de dados, bem como manter apenas um modelo Eloquent em memória por vez. Neste exemplo, a função de callback `filter` não é executada até iterarmos individualmente sobre cada utilizador, permitindo uma redução drástica do uso de memória:

```php
    use App\Models\User;

    $users = User::cursor()->filter(function (User $user) {
        return $user->id > 500;
    });

    foreach ($users as $user) {
        echo $user->id;
    }
```

<a name="creating-lazy-collections"></a>
### Criando coleções "Ociosa"

Para criar uma instância de coleção "lazy" (ativa somente quando necessária), deve ser fornecida uma função geradora PHP na metodologia `make` da coleção:

```php
    use Illuminate\Support\LazyCollection;

    LazyCollection::make(function () {
        $handle = fopen('log.txt', 'r');

        while (($line = fgets($handle)) !== false) {
            yield $line;
        }
    });
```

<a name="the-enumerable-contract"></a>
### O Contrato Numérico

Quase todos os métodos disponíveis na classe `Collection` também estão disponíveis na classe `LazyCollection`. Ambas as classes implementam o contrato `Illuminate\Support\Enumerable` que define os seguintes métodos:

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<div class="collection-method-list" markdown="1">

[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[chunk](#method-chunk)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffKeys](#method-diffkeys)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forPage](#method-forpage)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectAssoc](#method-intersectAssoc)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[pipe](#method-pipe)
[pluck](#method-pluck)
[random](#method-random)
[reduce](#method-reduce)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[shuffle](#method-shuffle)
[skip](#method-skip)
[slice](#method-slice)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[split](#method-split)
[sum](#method-sum)
[take](#method-take)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

::: warning ATENÇÃO
Os métodos que modificam a coleção (como `shift`, `pop`, `prepend` etc.) **não** estão disponíveis na classe `LazyCollection`.
:::

<a name="lazy-collection-methods"></a>
### Métodos do LazyCollections

Além dos métodos definidos no contrato `Enumerable`, a classe `LazyCollection` inclui os seguintes métodos:

<a name="method-takeUntilTimeout"></a>
#### takeUntilTimeout()

O método `takeUntilTimeout` retorna uma nova coleção lenta que irá enumerar os valores até o tempo especificado. Depois desse tempo, a coleção deverá parar de ser enumerada:

```php
    $lazyCollection = LazyCollection::times(INF)
        ->takeUntilTimeout(now()->addMinute());

    $lazyCollection->each(function (int $number) {
        dump($number);

        sleep(1);
    });

    // 1
    // 2
    // ...
    // 58
    // 59
```

Para ilustrar o uso desse método, imagine um aplicativo que envia faturas da base de dados usando um cursor. É possível definir uma [tarefa agendada](/docs/scheduling) que é executada a cada 15 minutos e processa apenas faturas por até 14 minutos:

```php
    use App\Models\Invoice;
    use Illuminate\Support\Carbon;

    Invoice::pending()->cursor()
        ->takeUntilTimeout(
            Carbon::createFromTimestamp(LARAVEL_START)->add(14, 'minutes')
        )
        ->each(fn (Invoice $invoice) => $invoice->submit());
```

<a name="method-tapEach"></a>
#### `tapEach()` 

Enquanto o método `each` chama o callback indicado para cada item da coleção de uma só vez, o método `tapEach` somente chama o callback especificado quando os itens estão sendo retirados da lista um a um:

```php
    // Nada foi descartado até agora...
    $lazyCollection = LazyCollection::times(INF)->tapEach(function (int $value) {
        dump($value);
    });

    // Três itens foram descartados...
    $array = $lazyCollection->take(3)->all();

    // 1
    // 2
    // 3
```

<a name="method-throttle"></a>
#### `throttle()` 

O método `throttle` reduzirá a velocidade da coleção lenta de tal forma que cada valor será retornado após o período especificado em segundos. Esse método é especialmente útil para situações onde você possa estar interagindo com APIs externas, que limitem as solicitações recebidas:

```php
use App\Models\User;

User::where('vip', true)
    ->cursor()
    ->throttle(seconds: 1)
    ->each(function (User $user) {
        // Chamar API externa...
    });
```

<a name="method-remember"></a>
#### `remember()`

O método `remember` retorna uma nova coleção lazy que recordará quaisquer valores já enumerados e não os recupera novamente nas subsequentes enumerações da coleção:

```php
    // Nenhuma consulta foi executada ainda...
    $users = User::cursor()->remember();

    // A consulta é executada...
    // Os primeiros 5 usuários são hidratados do banco de dados...
    $users->take(5)->all();

    // Os primeiros 5 usuários vêm do cache da coleção...
    // O restante é hidratado do banco de dados...
    $users->take(20)->all();
```
