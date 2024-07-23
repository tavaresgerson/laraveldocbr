# Auxiliares

<a name="introduction"></a>
## Introdução

O Laravel inclui várias funções de "auxiliares" PHP globais. Muitas dessas funções são usadas pelo próprio framework; no entanto, você pode usar-los em suas próprias aplicações se considerar conveniente.

<a name="available-methods"></a>
## Métodos disponíveis

<a name="arrays-and-objects-method-list"></a>
### Matrizes e objetos

- [Arr::accessible](#method-array-accessible)
- [Arr::add](#method-array-add)
- [Arr::collapse](#method-array-collapse)
- [Arr::crossJoin](#method-array-crossjoin)
- [Arr::divide](#method-array-divide)
- [Arr::dot](#method-array-dot)
- [Arr::except](#method-array-except)
- [Arr::exists](#method-array-exists)
- [Arr::first](#method-array-first)
- [Arr::flatten](#method-array-flatten)
- [Arr::forget](#method-array-forget)
- [Arr::get](#method-array-get)
- [Arr::has](#method-array-has)
- [Arr::hasAny](#method-array-hasany)
- [Arr::isAssoc](#method-array-isassoc)
- [Arr::isList](#method-array-islist)
- [Arr::join](#method-array-join)
- [Arr::keyBy](#method-array-keyby)
- [Arr::last](#method-array-last)
- [Arr::map](#method-array-map)
- [Arr::mapSpread](#method-array-map-spread)
- [Arr::mapWithKeys](#method-array-map-with-keys)
- [Arr::only](#method-array-only)
- [Arr::pluck](#method-array-pluck)
- [Arr::prepend](#method-array-prepend)
- [Arr::prependKeysWith](#method-array-prependkeyswith)
- [Arr::pull](#method-array-pull)
- [Arr::query](#method-array-query)
- [Arr::random](#method-array-random)
- [Arr::set](#method-array-set)
- [Arr::shuffle](#method-array-shuffle)
- [Arr::sort](#method-array-sort)
- [Arr::sortDesc](#method-array-sort-desc)
- [Arr::sortRecursive](#method-array-sort-recursive)
- [Arr::sortRecursiveDesc](#method-array-sort-recursive-desc)
- [Arr::take](#method-array-take)
- [Arr::toCssClasses](#method-array-to-css-classes)
- [Arr::toCssStyles](#method-array-to-css-styles)
- [Arr::undot](#method-array-undot)
- [Arr::where](#method-array-where)
- [Arr::whereNotNull](#method-array-where-not-null)
- [Arr::wrap](#method-array-wrap)
- [data_fill](#method-data-fill)
- [data_get](#method-data-get)
- [data_set](#method-data-set)
- [data_forget](#method-data-forget)
- [head](#method-head)
- [last](#method-last)

<a name="numbers-method-list"></a>
### Números

- [Number::abbreviate](#method-number-abbreviate)
- [Number::clamp](#method-number-clamp)
- [Number::currency](#method-number-currency)
- [Number::fileSize](#method-number-file-size)
- [Number::forHumans](#method-number-for-humans)
- [Number::format](#method-number-format)
- [Number::ordinal](#method-number-ordinal)
- [Number::percentage](#method-number-percentage)
- [Number::spell](#method-number-spell)
- [Number::useLocale](#method-number-use-locale)
- [Number::withLocale](#method-number-with-locale)

<a name="paths-method-list"></a>
### Caminhos

- [app_path](#method-app-path)
- [base_path](#method-base-path)
- [config_path](#method-config-path)
- [database_path](#method-database-path)
- [lang_path](#method-lang-path)
- [mix](#method-mix)
- [public_path](#method-public-path)
- [resource_path](#method-resource-path)
- [storage_path](#method-storage-path)

<a name="urls-method-list"></a>
### URLs

- [action](#method-action)
- [asset](#method-asset)
- [route](#method-route)
- [secure_asset](#method-secure-asset)
- [secure_url](#method-secure-url)
- [to_route](#method-to-route)
- [url](#method-url)

<a name="miscellaneous-method-list"></a>
### Diversos

- [abort](#method-abort)
- [abort_if](#method-abort-if)
- [abort_unless](#method-abort-unless)
- [app](#method-app)
- [auth](#method-auth)
- [back](#method-back)
- [bcrypt](#method-bcrypt)
- [blank](#method-blank)
- [broadcast](#method-broadcast)
- [cache](#method-cache)
- [class_uses_recursive](#method-class-uses-recursive)
- [collect](#method-collect)
- [config](#method-config)
- [context](#method-context)
- [cookie](#method-cookie)
- [csrf_field](#method-csrf-field)
- [csrf_token](#method-csrf-token)
- [decrypt](#method-decrypt)
- [dd](#method-dd)
- [dispatch](#method-dispatch)
- [dispatch_sync](#method-dispatch-sync)
- [dump](#method-dump)
- [encrypt](#method-encrypt)
- [env](#method-env)
- [event](#method-event)
- [fake](#method-fake)
- [filled](#method-filled)
- [info](#method-info)
- [literal](#method-literal)
- [logger](#method-logger)
- [method_field](#method-method-field)
- [now](#method-now)
- [old](#method-old)
- [once](#method-once)
- [optional](#method-optional)
- [policy](#method-policy)
- [redirect](#method-redirect)
- [report](#method-report)
- [report_if](#method-report-if)
- [report_unless](#method-report-unless)
- [request](#method-request)
- [rescue](#method-rescue)
- [resolve](#method-resolve)
- [response](#method-response)
- [retry](#method-retry)
- [session](#method-session)
- [tap](#method-tap)
- [throw_if](#method-throw-if)
- [throw_unless](#method-throw-unless)
- [today](#method-today)
- [trait_uses_recursive](#method-trait-uses-recursive)
- [transform](#method-transform)
- [validator](#method-validator)
- [value](#method-value)
- [view](#method-view)
- [with](#method-with)

<a name="arrays"></a>
## Matrizes e Objetos

<a name="method-array-accessible"></a>
#### `Arr::accessible()`

O método `Arr::accessible` determina se o valor passado é acessível ao script:

```php
    use Illuminate\Support\Arr;
    use Illuminate\Support\Collection;

    $isAccessible = Arr::accessible(['a' => 1, 'b' => 2]);

    // true

    $isAccessible = Arr::accessible(new Collection);

    // true

    $isAccessible = Arr::accessible('abc');

    // false

    $isAccessible = Arr::accessible(new stdClass);

    // false
```

<a name="method-array-add"></a>
#### `Arr::add()`

O método `Arr::add` adiciona um par chave/valor fornecido a uma matriz se a chave não existir na matriz ou estiver definida como `null`.

```php
    use Illuminate\Support\Arr;

    $array = Arr::add(['name' => 'Desk'], 'price', 100);

    // ['name' => 'Desk', 'price' => 100]

    $array = Arr::add(['name' => 'Desk', 'price' => null], 'price', 100);

    // ['name' => 'Desk', 'price' => 100]
```


<a name="method-array-collapse"></a>
#### `Arr::collapse()`

O método `Arr::collapse` colapsa uma matriz de arrays em uma única matriz:

```php
    use Illuminate\Support\Arr;

    $array = Arr::collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

    // [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-array-crossjoin"></a>
#### `Arr::crossJoin()`

O método `Arr::crossJoin` realiza uma operação de união cruzada dos array fornecidos e retorna um produto cartesiano com todas as combinações possíveis:

```php
    use Illuminate\Support\Arr;

    $matrix = Arr::crossJoin([1, 2], ['a', 'b']);

    /*
        [
            [1, 'a'],
            [1, 'b'],
            [2, 'a'],
            [2, 'b'],
        ]
    */

    $matrix = Arr::crossJoin([1, 2], ['a', 'b'], ['I', 'II']);

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

<a name="method-array-divide"></a>
#### `Arr::divide()`

O método `Arr::divide` retorna dois vetores: um contendo as chaves e o outro com os valores do array fornecido.

```php
    use Illuminate\Support\Arr;

    [$keys, $values] = Arr::divide(['name' => 'Desk']);

    // $keys: ['name']

    // $values: ['Desk']
```

<a name="method-array-dot"></a>
#### `Arr::dot()`

O método `Arr::dot` reduz um array multidimensional a um array de nível único que utiliza a notação de "ponto" para indicar o nível de profundidade:

```php
    use Illuminate\Support\Arr;

    $array = ['products' => ['desk' => ['price' => 100]]];

    $flattened = Arr::dot($array);

    // ['products.desk.price' => 100]
```

<a name="method-array-except"></a>
#### `Arr::except()`

O método `Arr::except` remove as combinações de chave/valor indicadas a partir de um conjunto:

```php
    use Illuminate\Support\Arr;

    $array = ['name' => 'Desk', 'price' => 100];

    $filtered = Arr::except($array, ['price']);

    // ['name' => 'Desk']
```

<a name="method-array-exists"></a>
#### `Arr::exists()` {.collection-method}

O método `arr :: exists` verifica se a chave fornecida existe no array fornecido:

```php
    use Illuminate\Support\Arr;

    $array = ['name' => 'John Doe', 'age' => 17];

    $exists = Arr::exists($array, 'name');

    // true

    $exists = Arr::exists($array, 'salary');

    // false
```

<a name="method-array-first"></a>
#### `Arr::first()`

O método `Arr::first` retorna o primeiro elemento de um array que passa em um determinado teste de verdade:

```php
    use Illuminate\Support\Arr;

    $array = [100, 200, 300];

    $first = Arr::first($array, function (int $value, int $key) {
        return $value >= 150;
    });

    // 200
```

O valor padrão também pode ser passado como o terceiro parâmetro para o método. Este valor será retornado se nenhum dos valores tiver sucesso na análise de veracidade:

```php
    use Illuminate\Support\Arr;

    $first = Arr::first($array, $callback, $default);
```

<a name="method-array-flatten"></a>
#### `Arr::flatten()`

O método `Arr::flatten` "aplana" uma matriz multidimensional numa matriz de nível único:

```php
    use Illuminate\Support\Arr;

    $array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

    $flattened = Arr::flatten($array);

    // ['Joe', 'PHP', 'Ruby']
```

<a name="method-array-forget"></a>
#### `Arr::forget()`

O método `Arr::forget` remove uma chave/par de valores dado de um array profundamente aninhado usando notação "ponto":

```php
    use Illuminate\Support\Arr;

    $array = ['products' => ['desk' => ['price' => 100]]];

    Arr::forget($array, 'products.desk');

    // ['products' => []]
```

<a name="method-array-get"></a>
#### `Arr::get()`

O método `Arr::get` recupera um valor de um array altamente agrupado usando notação "ponto":

```php
    use Illuminate\Support\Arr;

    $array = ['products' => ['desk' => ['price' => 100]]];

    $price = Arr::get($array, 'products.desk.price');

    // 100
```

O método `Arr::get` também aceita um valor padrão que será devolvido se a chave especificada não estiver presente na matriz:

```php
    use Illuminate\Support\Arr;

    $discount = Arr::get($array, 'products.desk.discount', 0);

    // 0
```

<a name="method-array-has"></a>
#### `Arr::has()`

O método `Arr::has` verifica se um determinado item ou itens existem numa matriz, usando a notação "ponto":

```php
    use Illuminate\Support\Arr;

    $array = ['product' => ['name' => 'Desk', 'price' => 100]];

    $contains = Arr::has($array, 'product.name');

    // true

    $contains = Arr::has($array, ['product.price', 'product.discount']);

    // false
```

<a name="method-array-hasany"></a>
#### `Arr::hasAny()`

O método `Arr::hasAny` verifica se algum item de um conjunto especificado existe em uma matriz usando a notação de ponto (".")

```php
    use Illuminate\Support\Arr;

    $array = ['product' => ['name' => 'Desk', 'price' => 100]];

    $contains = Arr::hasAny($array, 'product.name');

    // true

    $contains = Arr::hasAny($array, ['product.name', 'product.discount']);

    // true

    $contains = Arr::hasAny($array, ['category', 'product.discount']);

    // false
```

<a name="method-array-isassoc"></a>
#### `Arr::isAssoc()`

O método `Arr::isAssoc` retorna `true` se o array for um array associativo. Um array é considerado "associativo" se não tiver chaves numéricas sequenciais começando por zero:

```php
    use Illuminate\Support\Arr;

    $isAssoc = Arr::isAssoc(['product' => ['name' => 'Desk', 'price' => 100]]);

    // true

    $isAssoc = Arr::isAssoc([1, 2, 3]);

    // false
```

<a name="method-array-islist"></a>
#### `Arr::isList()`

A função `Arr::isList` retorna `true` se as chaves do array forem números inteiros consecutivos, começando a partir de zero:

```php
    use Illuminate\Support\Arr;

    $isList = Arr::isList(['foo', 'bar', 'baz']);

    // true

    $isList = Arr::isList(['product' => ['name' => 'Desk', 'price' => 100]]);

    // false
```

<a name="method-array-join"></a>
#### `Arr::join()`

O método `join` une os elementos de uma matriz com uma string. Usando o segundo argumento do método é possível especificar a string para unir o último elemento da matriz:

```php
    use Illuminate\Support\Arr;

    $array = ['Tailwind', 'Alpine', 'Laravel', 'Livewire'];

    $joined = Arr::join($array, ', ');

    // Tailwind, Alpine, Laravel, Livewire

    $joined = Arr::join($array, ', ', ' and ');

    // Tailwind, Alpine, Laravel and Livewire
```

<a name="method-array-keyby"></a>
#### `Arr::keyBy()`

O método `Arr::keyBy` chaveia a matriz por uma determinada chave. Se vários itens tiverem a mesma chave, apenas o último aparecerá na nova matriz:

```php
    use Illuminate\Support\Arr;

    $array = [
        ['product_id' => 'prod-100', 'name' => 'Desk'],
        ['product_id' => 'prod-200', 'name' => 'Chair'],
    ];

    $keyed = Arr::keyBy($array, 'product_id');

    /*
        [
            'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
            'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
        ]
    */
```

<a name="method-array-last"></a>
#### `Arr::last()`

O método `Arr::last` retorna o último elemento de uma matriz que deve passar num determinado teste de validação:

```php
    use Illuminate\Support\Arr;

    $array = [100, 200, 300, 110];

    $last = Arr::last($array, function (int $value, int $key) {
        return $value >= 150;
    });

    // 300
```

Pode ser passado um valor por padrão como terceiro argumento para o método. Este valor será retornado se nenhum outro puder satisfazer a verificação:

```php
    use Illuminate\Support\Arr;

    $last = Arr::last($array, $callback, $default);
```

<a name="method-array-map"></a>
#### `Arr::map()`

O método `Arr::map` itera por todos os valores da matriz e passa cada valor e chave para o callback especificado. O valor da matriz é substituído pelo valor retornado pelo callback:

```php
    use Illuminate\Support\Arr;

    $array = ['first' => 'james', 'last' => 'kirk'];

    $mapped = Arr::map($array, function (string $value, string $key) {
        return ucfirst($value);
    });

    // ['first' => 'James', 'last' => 'Kirk']
```

<a name="method-array-map-spread"></a>
#### `Arr::mapSpread()`

O método `Arr::mapSpread` itera sobre o array, passando cada valor de item aninhado para o closure fornecido. O encerramento fica livre para modificar o item e devolvê-lo, formando assim um novo array de itens modificados:

```php
    use Illuminate\Support\Arr;

    $array = [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
        [8, 9],
    ];

    $mapped = Arr::mapSpread($array, function (int $even, int $odd) {
        return $even + $odd;
    });

    /*
        [1, 5, 9, 13, 17]
    */
```

<a name="method-array-map-with-keys"></a>
#### `Arr::mapWithKeys()`

O método `Arr::mapWithKeys` executa uma iteração através do array e passa cada valor para o callback especificado. O callback deve retornar um array associativo contendo um único par de chave/valor:

```php
    use Illuminate\Support\Arr;

    $array = [
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
    ];

    $mapped = Arr::mapWithKeys($array, function (array $item, int $key) {
        return [$item['email'] => $item['name']];
    });

    /*
        [
            'john@example.com' => 'John',
            'jane@example.com' => 'Jane',
        ]
    */
```

<a name="method-array-only"></a>
#### `Arr::only()`

O método `Arr::only` retorna apenas as chaves/pares de valores especificados do array fornecido:

```php
    use Illuminate\Support\Arr;

    $array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];

    $slice = Arr::only($array, ['name', 'price']);

    // ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-pluck"></a>
#### `Arr::pluck()`

O método `Arr::pluck` recupera todos os valores para uma determinada chave de um array:

```php
    use Illuminate\Support\Arr;

    $array = [
        ['developer' => ['id' => 1, 'name' => 'Taylor']],
        ['developer' => ['id' => 2, 'name' => 'Abigail']],
    ];

    $names = Arr::pluck($array, 'developer.name');

    // ['Taylor', 'Abigail']
```

Você também pode especificar como deseja que o resultado seja chaveado:

```php
    use Illuminate\Support\Arr;

    $names = Arr::pluck($array, 'developer.name', 'developer.id');

    // [1 => 'Taylor', 2 => 'Abigail']
```

<a name="method-array-prepend"></a>
#### `Arr::prepend()`

O método `arr::prepend` insere um elemento no começo de uma matriz.

```php
    use Illuminate\Support\Arr;

    $array = ['one', 'two', 'three', 'four'];

    $array = Arr::prepend($array, 'zero');

    // ['zero', 'one', 'two', 'three', 'four']
```

Se necessário, você pode especificar a chave que deve ser usada para o valor:

```php
    use Illuminate\Support\Arr;

    $array = ['price' => 100];

    $array = Arr::prepend($array, 'Desk', 'name');

    // ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-prependkeyswith"></a>
#### `Arr::prependKeysWith()`

A função `Arr::prependKeysWith` antepõe todos os nomes de chaves de uma matriz associativa com o prefixo especificado:

```php
    use Illuminate\Support\Arr;

    $array = [
        'name' => 'Desk',
        'price' => 100,
    ];

    $keyed = Arr::prependKeysWith($array, 'product.');

    /*
        [
            'product.name' => 'Desk',
            'product.price' => 100,
        ]
    */
```

<a name="method-array-pull"></a>
#### `Arr::pull()`

O método `Arr::pull` retorna e remove uma chave/par de valores de um array:

```php
    use Illuminate\Support\Arr;

    $array = ['name' => 'Desk', 'price' => 100];

    $name = Arr::pull($array, 'name');

    // $name: Desk

    // $array: ['price' => 100]
```

O valor padrão pode ser passado como o terceiro argumento do método. Este valor é retornado se a chave não existir:

```php
    use Illuminate\Support\Arr;

    $value = Arr::pull($array, $key, $default);
```

<a name="method-array-query"></a>
#### `Arr::query()`

O método `Arr::query` converte o array em uma _query string_:

```php
    use Illuminate\Support\Arr;

    $array = [
        'name' => 'Taylor',
        'order' => [
            'column' => 'created_at',
            'direction' => 'desc'
        ]
    ];

    Arr::query($array);

    // name=Taylor&order[column]=created_at&order[direction]=desc
```

<a name="method-array-random"></a>
#### `Arr::random()`

O método `Arr::random` retorna um valor aleatório de um array:

```php
    use Illuminate\Support\Arr;

    $array = [1, 2, 3, 4, 5];

    $random = Arr::random($array);

    // 4 - (retrieved randomly)
```

Você também pode especificar o número de itens a serem retornados como um segundo argumento opcional. Observe que o fornecimento desse argumento retorna um array mesmo se somente um item tiver sido solicitado.

```php
    use Illuminate\Support\Arr;

    $items = Arr::random($array, 2);

    // [2, 5] - (retrieved randomly)
```

<a name="method-array-set"></a>
#### `Arr::set()`

O método `Arr::set` define um valor num array profundamente aninhado, utilizando a notação de "ponto":

```php
    use Illuminate\Support\Arr;

    $array = ['products' => ['desk' => ['price' => 100]]];

    Arr::set($array, 'products.desk.price', 200);

    // ['products' => ['desk' => ['price' => 200]]]
```

<a name="method-array-shuffle"></a>
#### `arr::shuffle()`

O método `Arr::shuffle` permite misturar os itens no array de maneira aleatória:

```php
    use Illuminate\Support\Arr;

    $array = Arr::shuffle([1, 2, 3, 4, 5]);

    // [3, 2, 5, 1, 4] - (generated randomly)
```

<a name="method-array-sort"></a>
#### `Arr::sort()`

O método `Arr::sort` ordena uma matriz por seus valores:

```php
    use Illuminate\Support\Arr;

    $array = ['Desk', 'Table', 'Chair'];

    $sorted = Arr::sort($array);

    // ['Chair', 'Desk', 'Table']
```

Você também pode ordenar um array pelos resultados a partir de uma closure:

```php
    use Illuminate\Support\Arr;

    $array = [
        ['name' => 'Desk'],
        ['name' => 'Table'],
        ['name' => 'Chair'],
    ];

    $sorted = array_values(Arr::sort($array, function (array $value) {
        return $value['name'];
    }));

    /*
        [
            ['name' => 'Chair'],
            ['name' => 'Desk'],
            ['name' => 'Table'],
        ]
    */
```

<a name="method-array-sort-desc"></a>
#### `Arr::sortDesc()`

O método `Arr::sortDesc` ordena um array de maneira decrescente em função dos seus valores:

```php
    use Illuminate\Support\Arr;

    $array = ['Desk', 'Table', 'Chair'];

    $sorted = Arr::sortDesc($array);

    // ['Table', 'Desk', 'Chair']
```

Você também pode ordenar um array pelos resultados de um determinado closure:

```php
    use Illuminate\Support\Arr;

    $array = [
        ['name' => 'Desk'],
        ['name' => 'Table'],
        ['name' => 'Chair'],
    ];

    $sorted = array_values(Arr::sortDesc($array, function (array $value) {
        return $value['name'];
    }));

    /*
        [
            ['name' => 'Table'],
            ['name' => 'Desk'],
            ['name' => 'Chair'],
        ]
    */
```

<a name="method-array-sort-recursive"></a>
#### `arr::sortRecursive()`

O método `Arr::sortRecursive` ordena de forma recursiva um array utilizando a função `sort` para sub-arrays com índice numérico e a função `ksort` para sub-arrays associativos:

```php
    use Illuminate\Support\Arr;

    $array = [
        ['Roman', 'Taylor', 'Li'],
        ['PHP', 'Ruby', 'JavaScript'],
        ['one' => 1, 'two' => 2, 'three' => 3],
    ];

    $sorted = Arr::sortRecursive($array);

    /*
        [
            ['JavaScript', 'PHP', 'Ruby'],
            ['one' => 1, 'three' => 3, 'two' => 2],
            ['Li', 'Roman', 'Taylor'],
        ]
    */
```

Se você quiser que os resultados sejam ordenados em ordem descendente, poderá usar o método `Arr::sortRecursiveDesc`.

```php
    $sorted = Arr::sortRecursiveDesc($array);
```

<a name="method-array-take"></a>
#### `Arr::take()`

O método `Arr::take` retorna um novo array com o número especificado de itens:

```php
    use Illuminate\Support\Arr;

    $array = [0, 1, 2, 3, 4, 5];

    $chunk = Arr::take($array, 3);

    // [0, 1, 2]
```

Você também pode passar um número negativo para pegar o número especificado de itens da parte final do array:

```php
    $array = [0, 1, 2, 3, 4, 5];

    $chunk = Arr::take($array, -2);

    // [4, 5]
```

<a name="method-array-to-css-classes"></a>
#### `Arr::toCssClasses()`

O método `Arr::toCssClasses` compila condicionalmente uma string de classe CSS. O método aceita um array com as classes que você deseja adicionar; o nome do campo tem que ser uma classe ou a palavra-chave '*' para incluir todos os elementos; o valor é uma expressão lógica:


```php
    use Illuminate\Support\Arr;

    $isActive = false;
    $hasError = true;

    $array = ['p-4', 'font-bold' => $isActive, 'bg-red' => $hasError];

    $classes = Arr::toCssClasses($array);

    /*
        'p-4 bg-red'
    */
```

<a name="method-array-to-css-styles"></a>
#### `Arr::toCssStyles()`

O comando `Arr::toCssStyles` compila condicionalmente uma string de estilo de CSS. O método aceita um array de classes onde a chave do array contém a classe ou classes que você deseja adicionar, enquanto o valor é uma expressão booleana. Se o elemento do array tiver uma chave numérica, ela será sempre incluída na lista de classes renderizadas:

```php
use Illuminate\Support\Arr;

$hasColor = true;

$array = ['background-color: blue', 'color: blue' => $hasColor];

$classes = Arr::toCssStyles($array);

/*
    'background-color: blue; color: blue;'
*/
```

Este método é o que dá poder à funcionalidade do Laravel, permitindo [mesclar classes com uma "mochila" de atributos de um componente Blade](/docs/blade#conditionally-merging-classes), bem como a diretiva `@class` do [Blade](/docs/blade#conditional-classes).

<a name="method-array-undot"></a>
#### `Arr::undot()`

O método `Arr::undot` expande um array unidimensional que utiliza notação de pontos em um array multidimensional:

```php
    use Illuminate\Support\Arr;

    $array = [
        'user.name' => 'Kevin Malone',
        'user.occupation' => 'Accountant',
    ];

    $array = Arr::undot($array);

    // ['user' => ['name' => 'Kevin Malone', 'occupation' => 'Accountant']]
```

<a name="method-array-where"></a>
#### `Arr::where()` {.collection-method}

O método `Arr::where` filtra um array utilizando o closure dado:

```php
    use Illuminate\Support\Arr;

    $array = [100, '200', 300, '400', 500];

    $filtered = Arr::where($array, function (string|int $value, int $key) {
        return is_string($value);
    });

    // [1 => '200', 3 => '400']
```

<a name="method-array-where-not-null"></a>
#### `Arr::whereNotNull()` {.collection-method}

O método `Arr::whereNotNull` remove todos os valores `null` do array fornecido:

```php
    use Illuminate\Support\Arr;

    $array = [0, null];

    $filtered = Arr::whereNotNull($array);

    // [0 => 0]
```

<a name="method-array-wrap"></a>
#### `Arr::wrap()` {.collection-method}

O método `Arr::wrap` envolve o valor indicado em uma matriz. Se o valor indicado já for uma matriz, ele será devolvido sem modificações:

```php
    use Illuminate\Support\Arr;

    $string = 'Laravel';

    $array = Arr::wrap($string);

    // ['Laravel']
```

Se o valor for `null`, será retornado um array vazio:

```php
    use Illuminate\Support\Arr;

    $array = Arr::wrap(null);

    // []
```

<a name="method-data-fill"></a>
#### `data_fill()`

A função `data_fill` define um valor ausente dentro de um array ou objeto aninhado usando a notação "ponto":

```php
    $data = ['products' => ['desk' => ['price' => 100]]];

    data_fill($data, 'products.desk.price', 200);

    // ['products' => ['desk' => ['price' => 100]]]

    data_fill($data, 'products.desk.discount', 10);

    // ['products' => ['desk' => ['price' => 100, 'discount' => 10]]]
```

Essa função também aceita o símbolo "asterisco" como um indicador genérico e preencherá o alvo de acordo com o seguinte:

```php
    $data = [
        'products' => [
            ['name' => 'Desk 1', 'price' => 100],
            ['name' => 'Desk 2'],
        ],
    ];

    data_fill($data, 'products.*.price', 200);

    /*
        [
            'products' => [
                ['name' => 'Desk 1', 'price' => 100],
                ['name' => 'Desk 2', 'price' => 200],
            ],
        ]
    */
```

<a name="method-data-get"></a>
#### `data_get()`

A função `data_get` recupera um valor de um array ou objeto aninhado utilizando a notação "ponto":

```php
    $data = ['products' => ['desk' => ['price' => 100]]];

    $price = data_get($data, 'products.desk.price');

    // 100
```

A função `data_get` também aceita um valor padrão que será retornado caso a chave especificada não seja encontrada:

```php
    $discount = data_get($data, 'products.desk.discount', 0);

    // 0
```

O recurso aceita também os símbolos "*" (asteriscos) que podem especificar qualquer chave do array ou objeto.

```php
    $data = [
        'product-one' => ['name' => 'Desk 1', 'price' => 100],
        'product-two' => ['name' => 'Desk 2', 'price' => 150],
    ];

    data_get($data, '*.name');

    // ['Desk 1', 'Desk 2'];
```

Os marcadores de posição (placeholders) `{first}` e `{last}` podem ser utilizados para obter os elementos primário ou secundário num array:

```php
    $flight = [
        'segments' => [
            ['from' => 'LHR', 'departure' => '9:00', 'to' => 'IST', 'arrival' => '15:00'],
            ['from' => 'IST', 'departure' => '16:00', 'to' => 'PKX', 'arrival' => '20:00'],
        ],
    ];

    data_get($flight, 'segments.{first}.arrival');

    // 15:00
```

<a name="method-data-set"></a>
#### `data_set()`

A função `data_set` define um valor dentro de um array ou objeto aninhado usando a notação "ponto":

```php
    $data = ['products' => ['desk' => ['price' => 100]]];

    data_set($data, 'products.desk.price', 200);

    // ['products' => ['desk' => ['price' => 200]]]
```

Esta função também aceita curingas usando asteriscos e definirá valores no alvo de acordo:

```php
    $data = [
        'products' => [
            ['name' => 'Desk 1', 'price' => 100],
            ['name' => 'Desk 2', 'price' => 150],
        ],
    ];

    data_set($data, 'products.*.price', 200);

    /*
        [
            'products' => [
                ['name' => 'Desk 1', 'price' => 200],
                ['name' => 'Desk 2', 'price' => 200],
            ],
        ]
    */
```

Por padrão, todos os valores existentes são substituídos. Se pretender definir apenas um valor que ainda não exista, pode passar "false" como o quarto argumento da função:

```php
    $data = ['products' => ['desk' => ['price' => 100]]];

    data_set($data, 'products.desk.price', 200, overwrite: false);

    // ['products' => ['desk' => ['price' => 100]]]
```

<a name="method-data-forget"></a>
#### `data_forget()`

A função `data_forget` remove um valor dentro de um array ou objeto aninhado usando a notação "ponto":

```php
    $data = ['products' => ['desk' => ['price' => 100]]];

    data_forget($data, 'products.desk.price');

    // ['products' => ['desk' => []]]
```

Esta função também aceita curingas usando asteriscos e removerá os valores do destino de acordo:

```php
    $data = [
        'products' => [
            ['name' => 'Desk 1', 'price' => 100],
            ['name' => 'Desk 2', 'price' => 150],
        ],
    ];

    data_forget($data, 'products.*.price');

    /*
        [
            'products' => [
                ['name' => 'Desk 1'],
                ['name' => 'Desk 2'],
            ],
        ]
    */
```

<a name="method-head"></a>
#### `head()`

A função `head` retorna o primeiro elemento do array:

```php
    $array = [100, 200, 300];

    $first = head($array);

    // 100
```

<a name="method-last"></a>
#### `last()`

A função `last` retorna o último elemento do array informado:

```php
    $array = [100, 200, 300];

    $last = last($array);

    // 300
```

<a name="numbers"></a>
## Números

<a name="method-number-abbreviate"></a>
#### `Number::abbreviate()`

O método `Number::abbreviate` devolve o formato legível por seres humanos do valor numérico fornecido com uma abreviação para as unidades:

```php
    use Illuminate\Support\Number;

    $number = Number::abbreviate(1000);

    // 1K

    $number = Number::abbreviate(489939);

    // 490K

    $number = Number::abbreviate(1230000, precision: 2);

    // 1.23M
```

<a name="method-number-clamp"></a>
#### `Number::clamp()`

O método `Number::clamp` garante que um número específico permanece dentro de uma faixa especificada. Se o número for menor do que o mínimo, será retornado o valor mínimo. Se o número for maior do que o máximo, será retornado o valor máximo:

```php
    use Illuminate\Support\Number;

    $number = Number::clamp(105, min: 10, max: 100);

    // 100

    $number = Number::clamp(5, min: 10, max: 100);

    // 10

    $number = Number::clamp(10, min: 10, max: 100);

    // 10

    $number = Number::clamp(20, min: 10, max: 100);

    // 20
```

<a name="method-number-currency"></a>
#### `Number::currency()`

O método `Number::currency` retorna a representação da moeda do valor fornecido como uma string:

```php
    use Illuminate\Support\Number;

    $currency = Number::currency(1000);

    // $1,000

    $currency = Number::currency(1000, in: 'EUR');

    // €1,000

    $currency = Number::currency(1000, in: 'EUR', locale: 'de');

    // 1.000 €
```

<a name="method-number-file-size"></a>
#### `Number::fileSize()`

O método `Number::fileSize` retorna a representação do tamanho de um arquivo de um valor em bytes como uma string:

```php
    use Illuminate\Support\Number;

    $size = Number::fileSize(1024);

    // 1 KB

    $size = Number::fileSize(1024 * 1024);

    // 1 MB

    $size = Number::fileSize(1024, precision: 2);

    // 1.00 KB
```

<a name="method-number-for-humans"></a>
#### `Number::forHumans()`

O método `Number::forHumans` retorna o formato legível por humanos do valor numérico fornecido:

```php
    use Illuminate\Support\Number;

    $number = Number::forHumans(1000);

    // 1 thousand

    $number = Number::forHumans(489939);

    // 490 thousand

    $number = Number::forHumans(1230000, precision: 2);

    // 1.23 million
```

<a name="method-number-format"></a>
#### `Number::format()`

O método `Number::format` formata o número fornecido em uma string específica do local:

```php
    use Illuminate\Support\Number;

    $number = Number::format(100000);

    // 100,000

    $number = Number::format(100000, precision: 2);

    // 100,000.00

    $number = Number::format(100000.123, maxPrecision: 2);

    // 100,000.12

    $number = Number::format(100000, locale: 'de');

    // 100.000
```

<a name="method-number-ordinal"></a>
#### ``Número::ordinal()`` {.collection-method}

 O método `Number::ordinal` retorna a representação numérica ordinal de um número:

```php
    use Illuminate\Support\Number;

    $number = Number::ordinal(1);

    // 1st

    $number = Number::ordinal(2);

    // 2nd

    $number = Number::ordinal(21);

    // 21st
```

<a name="method-number-percentage"></a>
#### `Número::percentage()`

 O método `Number::percentage` retorna a representação percentual do valor especificado como uma cadeia de caracteres:

```php
    use Illuminate\Support\Number;

    $percentage = Number::percentage(10);

    // 10%

    $percentage = Number::percentage(10, precision: 2);

    // 10.00%

    $percentage = Number::percentage(10.123, maxPrecision: 2);

    // 10.12%

    $percentage = Number::percentage(10, precision: 2, locale: 'de');

    // 10,00%
```

<a name="method-number-spell"></a>
#### `Number::spell()`

 O método `Number::spell` converte um número em uma sequência de palavras:

```php
    use Illuminate\Support\Number;

    $number = Number::spell(102);

    // one hundred and two

    $number = Number::spell(88, locale: 'fr');

    // quatre-vingt-huit
```

O argumento `after` permite-lhe especificar um valor após o qual todos os números devem ser representados por palavras:

```php
    $number = Number::spell(10, after: 10);

    // 10

    $number = Number::spell(11, after: 10);

    // eleven
```

O argumento `until` permite especificar um valor antes do qual todos os números devem ser escritos:

```php
    $number = Number::spell(5, until: 10);

    // five

    $number = Number::spell(10, until: 10);

    // 10
```

<a name="method-number-use-locale"></a>
#### `Number::useLocale()`

O método `Number::useLocale` define o localização de números globalmente padrão, afetando a forma como os números e moedas são formatados durante as chamadas posteriores aos métodos da classe Number:

```php
    use Illuminate\Support\Number;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Number::useLocale('de');
    }
```

<a name="method-number-with-locale"></a>
#### `Número::withLocale()`

O método `Number::withLocale` executa o closure especificado usando a locação indicada e, em seguida restaura a locação original após o invocador da função ter sido executado.

```php
    use Illuminate\Support\Number;

    $number = Number::withLocale('de', function () {
        return Number::format(1500);
    });
```

<a name="paths"></a>
## Caminhos

<a name="method-app-path"></a>
#### ``app_path()``

A função `app_path` retorna o caminho total para o diretório `app` da sua aplicação. Você também pode usar a função `app_path` para gerar um caminho totalmente qualificado para um ficheiro relativo ao diretório da aplicação:

```php
    $path = app_path();

    $path = app_path('Http/Controllers/Controller.php');
```

<a name="method-base-path"></a>
#### `base_path()`

A função `base_path` retorna o caminho total do diretório raiz da sua aplicação. Você pode também utilizar a função `base_path` para gerar um caminho de um ficheiro dado em relação ao diretório raiz do projeto:

```php
    $path = base_path();

    $path = base_path('vendor/bin');
```

<a name="method-config-path"></a>
#### `config_path()`

A função `config_path` retorna o caminho total do diretório de configurações da sua aplicação. Você também pode usar a função `config_path` para gerar um caminho para um determinado arquivo dentro do diretório de configurações da aplicação:

```php
    $path = config_path();

    $path = config_path('app.php');
```

<a name="method-database-path"></a>
#### `database_path()`

A função `database_path` retorna o caminho total do diretório de banco de dados da aplicação. Também é possível utilizar a função `database_path` para gerar um caminho de um determinado arquivo no diretório de banco de dados:

```php
    $path = database_path();

    $path = database_path('factories/UserFactory.php');
```

<a name="method-lang-path"></a>
#### `lang_path()`

A função `lang_path` retorna o caminho total do diretório `lang` da aplicação. Também é possível utilizar a função `lang_path` para gerar um caminho totalmente qualificado de um arquivo específico dentro desse diretório:

```php
    $path = lang_path();

    $path = lang_path('en/messages.php');
```

::: info NOTA
Por padrão, o esqueleto da aplicação do Laravel não inclui a pasta `lang`. Se pretender personalizar os ficheiros de linguagem do Laravel, você pode publicá-los através do comando `lang:publish` do Artisan.
:::

<a name="method-mix"></a>
#### `mix()`

A função `mix` retorna o caminho para um arquivo do Mix com versão:

```php
    $path = mix('css/app.css');
```

<a name="method-public-path"></a>
#### `public_path()`

A função `public_path` retorna o caminho total do diretório público da aplicação. Você também pode usar a função `public_path` para gerar um caminho totalmente qualificado de um determinado arquivo dentro deste diretório:

```php
    $path = public_path();

    $path = public_path('css/app.css');
```

<a name="method-resource-path"></a>
#### `resource_path()`

A função `resource_path` retorna o caminho totalmente qualificado do diretório de recursos da aplicação. Você também pode usar a função `resource_path` para gerar um caminho totalmente qualificado de um arquivo específico dentro do diretório de recursos:

```php
    $path = resource_path();

    $path = resource_path('sass/app.scss');
```

<a name="method-storage-path"></a>
#### `storage_path()`

A função `storage_path` retorna o caminho totalmente qualificado do diretório de armazenamento da aplicação. Você também pode usar a função `storage_path` para gerar um caminho totalmente qualificado de um determinado arquivo dentro do diretório de armazenamento:

```php
    $path = storage_path();

    $path = storage_path('app/file.txt');
```

<a name="urls"></a>
## URL

<a name="method-action"></a>
#### `action()`

A função `action` gera um URL para a ação do controlador informado:

```php
    use App\Http\Controllers\HomeController;

    $url = action([HomeController::class, 'index']);
```

Se o método aceitar parâmetros de rota, você pode passar esses parâmetros como um segundo argumento do método:

```php
    $url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="method-asset"></a>
#### `asset()`

 A função `asset` gera um URL para um arquivo estático usando o esquema atual de requisição (HTTP ou HTTPS):

```php
    $url = asset('img/photo.jpg');
```

Você pode configurar o host da URL do arquivo estático definindo a variável `ASSET_URL` em seu arquivo `.env`. Isso é útil se você hospedar seus arquivos estáticos em um serviço externo, como Amazon S3 ou outro CDN:

```php
    // ASSET_URL=http://example.com/assets

    $url = asset('img/photo.jpg'); // http://example.com/assets/img/photo.jpg
```

<a name="method-route"></a>
#### `route()`

A função `route` gera um endereço da Web para um roteamento [nomeado](/docs/routing#named-routes):

```php
    $url = route('route.name');
```

Se a rota aceitar parâmetros, você poderá passar-lhes como o segundo argumento da função:

```php
    $url = route('route.name', ['id' => 1]);
```

Por padrão, a função `route` gera um URL absoluto. Se você desejar gerar um URL relativo, poderá passar `false` como o terceiro argumento da função:

```php
    $url = route('route.name', ['id' => 1], false);
```

<a name="method-secure-asset"></a>
#### `secure_asset()`

A função `secure_asset` gera uma URL para um arquivo estático utilizando HTTPS:

```php
    $url = secure_asset('img/photo.jpg');
```

<a name="method-secure-url"></a>
#### `secure_url()`

A função `secure_url` gera uma URL totalmente qualificada de HTTPS para o caminho especificado. Os segmentos adicionais da URL podem ser passados como um segundo argumento na função:

```php
    $url = secure_url('user/profile');

    $url = secure_url('user/profile', [1]);
```

<a name="method-to-route"></a>
#### `to_route()`

A função `to_route` gera uma resposta de [redirecionamento HTTP](/docs/responses#redirects) para uma determinada [rota nomeada](/docs/routing#named-routes):

```php
    return to_route('users.show', ['user' => 1]);
```

Se necessário, você pode passar o código de resposta do HTTP que deve ser atribuído ao redirecionamento e quaisquer cabeçalhos adicionais da resposta como o terceiro e quarto argumentos para a função `to_route`:

```php
    return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);
```

<a name="method-url"></a>
#### `url()

A função `url` gera uma URL totalmente qualificada para o caminho indicado:

```php
    $url = url('user/profile');

    $url = url('user/profile', [1]);
```

Se não for fornecido nenhum caminho, será retornada uma instância do `Illuminate\Routing\UrlGenerator`:

```php
    $current = url()->current();

    $full = url()->full();

    $previous = url()->previous();
```

<a name="miscellaneous"></a>
## Diversos

<a name="method-abort"></a>
#### `abort()`

A função `abort` envia uma [exceção HTTP](/docs/errors#http-exceptions), que será renderizada pelo [hander de exceções](/docs/errors#the-exception-handler):

```php
    abort(403);
```

Você também pode fornecer a mensagem da exceção e cabeçalhos de resposta personalizados que devem ser enviados ao navegador:

```php
    abort(403, 'Unauthorized.', $headers);
```

<a name="method-abort-if"></a>
#### `abort_if()`

A função `abort_if` lança uma exceção de HTTP se uma expressão booleana for avaliada como `true`:

```php
    abort_if(! Auth::user()->isAdmin(), 403);
```

Tal como no método `abort`, é possível fornecer também o texto de resposta da exceção, na terceira posição, e um conjunto de cabeçalhos personalizados da resposta, na quarta posição, para a função.

<a name="method-abort-unless"></a>
#### `abort_unless()`

A função `abort_unless` joga uma exceção de HTTP se uma expressão lógica dada avaliar como `false`:

```php
    abort_unless(Auth::user()->isAdmin(), 403);
```

Assim como o método `abort`, você também pode fornecer o texto da resposta da exceção como o terceiro argumento e um array de cabeçalhos de resposta personalizados como o quarto argumento para a função.

<a name="method-app"></a>
#### `app()`

A função `app` retorna a instância do contêiner de serviços:

```php
    $container = app();
```

Você pode passar um nome de classe ou de interface para resolvê-la do contêiner:

```php
    $api = app('HelpSpot\API');
```

<a name="method-auth"></a>
#### `auth()`

A função `auth` retorna uma instância do autenticador ([authenticator](/docs/authentication). Você pode usá-la como uma alternativa à fadade `Auth`:

```php
    $user = auth()->user();
```

Se necessário, você pode especificar a instância do _guard_ que deseja acessar:

```php
    $user = auth('admin')->user();
```

<a name="method-back"></a>
#### `back()`

A função `back` gera uma [resposta de redirecionamento HTTP](/docs/responses#redirects) para o local anterior do usuário:

```php
    return back($status = 302, $headers = [], $fallback = '/');

    return back();
```

<a name="method-bcrypt"></a>
#### `bcrypt()`

A função `bcrypt` [hashes](/docs/hashing) o valor fornecido usando Bcrypt. Você pode usar esta função como uma alternativa à facade `Hash`:

```php
    $password = bcrypt('my-secret-password');
```

<a name="method-blank"></a>
#### `blank()`

A função `blank` determina se o valor fornecido é "em branco", isto é, um espaço ou uma linha vazia:

```php
    blank('');
    blank('   ');
    blank(null);
    blank(collect());

    // true

    blank(0);
    blank(true);
    blank(false);

    // false
```

Para a operação inversa de `blank` ver o método [`filled`](#método-filled).

<a name="method-broadcast"></a>
#### `broadcast()`

 A função `broadcast` ([transmite](/docs/broadcasting)) o evento especificado aos seus ouvinte:

```php
    broadcast(new UserRegistered($user));

    broadcast(new UserRegistered($user))->toOthers();
```

<a name="method-cache"></a>
#### `cache()`

A função `cache` pode ser usada para recuperar valores do [cache](https://revele.io/docs/cache/). Caso a chave especificada não exista no cache, um valor padrão opcional será retornado:

```php
    $value = cache('key');

    $value = cache('key', 'default');
```

Você pode adicionar itens ao cache, passando uma matriz de pares chave/valor para a função. Além disso, você deve passar o número de segundos ou duração que o valor do cache será considerado válido:

```php
    cache(['key' => 'value'], 300);

    cache(['key' => 'value'], now()->addSeconds(10));
```

<a name="method-class-uses-recursive"></a>
#### `class_uses_recursive()`

A função `class_uses_recursive` retorna todos os _traits_ usados por uma classe, incluindo os _traits_ usados por todas as suas classes pai:

```php
    $traits = class_uses_recursive(App\Models\User::class);
```

<a name="method-collect"></a>
#### `collect()`

A função `collect` cria uma instância de _collections_ a partir do valor fornecido:

```php
    $collection = collect(['taylor', 'abigail']);
```

<a name="method-config"></a>
#### `config()`

A função `config` obtém o valor de uma variável de [configuração](/docs/configuration). Os valores da configuração podem ser acessados utilizando a sintaxe "ponto", que inclui o nome do ficheiro e a opção que pretende acessar. Pode ser especificado um valor padrão, que é retornado se não existir uma opção de configuração:

```php
    $value = config('app.timezone');

    $value = config('app.timezone', $default);
```

Você pode configurar variáveis de configuração durante a execução passando um array de pares chave/valor. No entanto, note que esta função afeta apenas o valor da configuração para a solicitação atual e não atualiza os valores reais da sua configuração:

```php
    config(['app.debug' => true]);
```

<a name="method-context"></a>
#### `context()`

A função `context` obtém o valor do [contexto atual](/docs/context). Pode ser especificado um valor padrão que é retornado se a chave de contexto não existir:

```php
    $value = context('trace_id');

    $value = context('trace_id', $default);
```

É possível definir valores de contexto passando um array de pares chave/valor:

```php
    use Illuminate\Support\Str;

    context(['trace_id' => Str::uuid()->toString()]);
```

<a name="method-cookie"></a>
#### `cookie()`

A função `cookie` cria uma nova instância de [cookie](/docs/requests#cookies):

```php
    $cookie = cookie('name', 'value', $minutes);
```

<a name="method-csrf-field"></a>
#### `csrf_field()`

A função `csrf_field` gera um campo de entrada oculto HTML contendo o valor do token de CSRF. Por exemplo, usando a sintaxe [Blade](/docs/blade):

```blade
    {{ csrf_field() }}
```

<a name="method-csrf-token"></a>
#### `csrf_token()`

A função `csrf_token` recupera o valor do token de segurança atual:

```php
    $token = csrf_token();
```

<a name="method-decrypt"></a>
#### `decrypt()`

A função `decrypt` permite decifrar o valor fornecido, podendo esta ser utilizada como alternativa à facade `Crypt`:

```php
    $password = decrypt($value);
```

<a name="method-dd"></a>
#### `dd()`

A função `dd` mostra as variáveis fornecidas e encerra a execução do script.

```php
    dd($value);

    dd($value1, $value2, $value3, ...);
```

Se você não quiser interromper a execução de seu script, use a função [`dump`](#method-dump).

<a name="method-dispatch"></a>
#### `method-dispatch()`

A função `dispatch` envia o trabalho indicado a [fila de tarefas](en/docs/queues.html#creating-jobs) do Laravel:

```php
    dispatch(new App\Jobs\SendEmails);
```

<a name="method-dispatch-sync"></a>
#### `dispatch_sync()`

A função `dispatch_sync` coloca o trabalho fornecido na fila para o [envio síncrono](/docs/queues#synchronous-dispatching) para que ele seja processado imediatamente:

```php
    dispatch_sync(new App\Jobs\SendEmails);
```

<a name="method-dump"></a>
#### `dump()`

A função `dump` exibe as variáveis indicadas:

```php
    dump($value);

    dump($value1, $value2, $value3, ...);
```

Se você deseja interromper a execução do script após o envio das variáveis, utilize a função [dd](#method-dd).

<a name="method-encrypt"></a>
#### `encrypt()`

A função `encrypt` encripta o valor fornecido, que poderá ser utilizada como alternativa ao pacote de funções `Crypt`:

```php
    $secret = encrypt('my-secret-value');
```

<a name="method-env"></a>
#### `env()`

A função `env` recupera o valor de uma [variável de ambiente](/docs/configuration#environment-configuration) ou retorna um valor padrão:

```php
    $env = env('APP_ENV');

    $env = env('APP_ENV', 'production');
```

::: warning ATENÇÃO
Se você executar o comando `config:cache` durante o processo de implantação, certifique-se de estar chamando a função `env` apenas de dentro dos seus arquivos de configuração. Depois que a configuração for armazenada em cache, o arquivo `.env` não será carregado e todas as chamadas para a função `env` retornarão `null`.
:::

<a name="method-event"></a>
#### `event()`

A função `event` envia o evento especificado a seus ouvintes:

```php
    event(new UserRegistered($user));
```

<a name="method-fake"></a>
#### `fake()`

A função `fake` resolve um _singleton_ [Faker](https://github.com/FakerPHP/Faker) do container, que pode ser útil ao criar dados falsos em _factories_ de modelos, carregamento de banco de dados, testes e prototipagem de visualizações:

```blade
@for($i = 0; $i < 10; $i++)
    <dl>
        <dt>Name</dt>
        <dd>{{ fake()->name() }}</dd>

        <dt>Email</dt>
        <dd>{{ fake()->unique()->safeEmail() }}</dd>
    </dl>
@endfor
```

Por padrão, a função `fake` utiliza a opção de configuração `app.faker_locale` em sua configuração no arquivo `config/app.php`. Normalmente essa opção de configuração é definida através da variável de ambiente `APP_FAKER_LOCALE`. É possível também especificar o idioma passando-o à função `fake`. Cada idioma resolve um singleton individual:

```php
    fake('nl_NL')->name()
```

<a name="method-filled"></a>
#### `filled()`

A função `filled` determina se o valor especificado não é "vazio".

```php
    filled(0);
    filled(true);
    filled(false);

    // true

    filled('');
    filled('   ');
    filled(null);
    filled(collect());

    // false
```

Para a função inversa de `filled`, consulte o método [`blank`](#method-blank).

<a name="method-info"></a>
#### `info()`

A função `info` irá escrever informações no registro da sua aplicação [Logging](/docs/logging):

```php
    info('Some helpful information!');
```

Um conjunto de dados contextuais pode também ser passado para a função:

```php
    info('User login attempt failed.', ['id' => $user->id]);
```

<a name="method-literal"></a>
#### `literal()`

A função `literal` cria uma nova instância do tipo [stdClass](https://www.php.net/manual/en/class.stdclass.php) com os argumentos nomeados fornecidos como propriedades:

```php
    $obj = literal(
        name: 'Joe',
        languages: ['PHP', 'Ruby'],
    );

    $obj->name; // 'Joe'
    $obj->languages; // ['PHP', 'Ruby']
```

<a name="method-logger"></a>
#### `logger()`

A função `logger` pode ser utilizada para escrever uma mensagem de nível `debug` no arquivo [log](/docs/logging):

```php
    logger('Debug message');
```

É possível enviar uma série de dados contextuais para a função:

```php
    logger('User has logged in.', ['id' => $user->id]);
```

Se não for passado um valor para a função, será retornada uma instância de [logger](/docs/errors#logging):

```php
    logger()->error('You are not allowed here.');
```

<a name="method-method-field"></a>
#### `method_field()`

A função `method_field` gera um campo de entrada HTML `hidden` contendo o valor falsificado do verbo HTTP do formulário. Por exemplo, usando a [sintaxe do Blade](/docs/blade):

```php
    <form method="POST">
        {{ method_field('DELETE') }}
    </form>
```

<a name="method-now"></a>
#### `now()`

A função `now` cria uma nova instância de `Illuminate\Support\Carbon` para o momento atual:

```php
    $now = now();
```

<a name="method-old"></a>
#### `old()`

A função `old` [recupera](/docs/requests#retrieving-input) um valor de entrada antigo passado à sessão:

```php
    $value = old('value');

    $value = old('value', 'default');
```

Uma vez que o valor "padrão" fornecido como segundo argumento da função `old` é, frequentemente, um atributo de um modelo Eloquent, o Laravel permite-lhe passar o modelo Eloquent em si como segundo argumento para a função `old`. Neste caso, o primeiro argumento passado à função `old` será considerado como nome do atributo Eloquent que deve ser utilizado como "valor padrão":

```php
    {{ old('name', $user->name) }}

    // Is equivalent to...

    {{ old('name', $user) }}
```

<a name="method-once"></a>
#### `once()`

A função `once` executa o callback definido e armazena o resultado em memória durante a requisição. Quaisquer chamadas subsequentes à função `once`, com o mesmo callback, devolvem o resultado previamente armazenado:

```php
    function random(): int
    {
        return once(function () {
            return random_int(1, 1000);
        });
    }

    random(); // 123
    random(); // 123 (cached result)
    random(); // 123 (cached result)
```

Quando a função `once` é executada dentro de uma instância de objeto, o resultado armazenado em cache será exclusivo para essa instância de objeto:

```php
<?php

class NumberService
{
    public function all(): array
    {
        return once(fn () => [1, 2, 3]);
    }
}

$service = new NumberService;

$service->all();
$service->all(); // (cached result)

$secondService = new NumberService;

$secondService->all();
$secondService->all(); // (resultado em cache)
```
<a name="method-optional"></a>
#### `optional()`

A função `optional` aceita qualquer argumento e permite o acesso à propriedades ou métodos desse objeto. Se o objeto for `null`, as propriedades e os métodos retornarão `null` em vez de causar um erro:

```php
    return optional($user->address)->street;

    {!! old('name', optional($user)->name) !!}
```

A função `optional` também aceita um closure como segundo argumento, que será invocado se o valor fornecido como primeiro argumento não for nulo:

```php
    return optional(User::find($id), function (User $user) {
        return $user->name;
    });
```

<a name="method-policy"></a>
#### `policy()`

O método `policy` recupera uma instância de política para uma classe específica:

```php
    $policy = policy(App\Models\User::class);
```

<a name="method-redirect"></a>
#### ``redirect()`

A função `redirect` retorna uma [resposta de redirecionamento HTTP](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#h_14.38), ou a instância da função `redirector` quando não for utilizada com parâmetros:

```php
    return redirect($to = null, $status = 302, $headers = [], $https = null);

    return redirect('/home');

    return redirect()->route('route.name');
```

<a name="method-report"></a>
#### `report()`

A função `report` informará uma exceção utilizando o seu [manipulador de exceções](/docs/erros/#the-exception-handler):

```php
    report($e);
```

A função `report` também aceita um argumento do tipo string. Se for passada uma string à função, a função irá criar uma exceção com a string como mensagem:

```php
    report('Something went wrong.');
```

<a name="method-report-if"></a>
#### `report_if()`

A função `report_if` relatará uma exceção usando o seu [gerenciador de exceções](/docs/errors#the-exception-handler), se a condição for `verdadeira`:

```php
    report_if($shouldReport, $e);

    report_if($shouldReport, 'Something went wrong.');
```

<a name="method-report-unless"></a>
#### `report_unless()`

A função `report_unless` relatará a exceção usando o seu [manipulador de exceções](/docs/errors/#the-exception-handler) caso a condição for falsa:

```php
    report_unless($reportingDisabled, $e);

    report_unless($reportingDisabled, 'Something went wrong.');
```

<a name="method-request"></a>
#### `request()` 

A função `request` retorna a instância atual da [requisição](/docs/requests) ou obtém o valor de um campo de entrada da requisição ativa:

```php
    $request = request();

    $value = request('key', $default);
```

<a name="method-rescue"></a>
#### `rescue()`

A função `rescue` executa um closure especificado e captura quaisquer exceções que sejam geradas durante a sua execução. Todas as exceções capturadas são enviadas para o [mecanismo de tratamento de exceções](/docs/errors#the-exception-handler); no entanto, o pedido continua a ser processado:

```php
    return rescue(function () {
        return $this->method();
    });
```

Você também pode passar um segundo argumento à função `rescue`. Este argumento será o valor "padrão" que deverá ser retornado se uma exceção ocorrer ao executar a closure:

```php
    return rescue(function () {
        return $this->method();
    }, false);

    return rescue(function () {
        return $this->method();
    }, function () {
        return $this->failure();
    });
```

Um argumento `report` pode ser passado para a função `rescue`, que determina se a exceção deve ser relatada pela função `report`:

```php
    return rescue(function () {
        return $this->method();
    }, report: function (Throwable $throwable) {
        return $throwable instanceof InvalidArgumentException;
    });
```

<a name="method-resolve"></a>
#### `resolve()`

A função `resolve` resolve um nome de classe ou interface para uma instância usando o [conjunto de serviços](/docs/container):

```php
    $api = resolve('HelpSpot\API');
```

<a name="method-response"></a>
#### `response()`

A função `response` cria uma instância de [resposta](/docs/responses) ou obtém uma instância do _factory_ de respostas:

```php
    return response('Hello World', 200, $headers);

    return response()->json(['foo' => 'bar'], 200, $headers);
```

<a name="method-retry"></a>
#### `retry()`

A função `retry` tenta executar o callback fornecido até atingir o limite máximo de tentativas especificadas. Se o callback não lançar uma exceção, seu valor será retornado. Se o callback lançar uma exceção, ele será automaticamente reexecutado. Se o número máximo de tentativas for excedido, a exceção será jogada:

```php
    return retry(5, function () {
        // Tente 5 vezes enquanto descansa 100ms entre as tentativas...
    }, 100);
```

Se você preferir calcular manualmente o número de milésimos de segundo para esperar entre as tentativas, você poderá passar um closure como terceiro argumento à função `retry`:

```php
    use Exception;

    return retry(5, function () {
        // ...
    }, function (int $attempt, Exception $exception) {
        return $attempt * 100;
    });
```

Para maior conveniência, você pode fornecer um array como o primeiro argumento da função `retry`. Este array será usado para determinar a quantidade de milésimos de segundo que devem passar entre tentativas subseqüentes.

```php
    return retry([100, 200], function () {
        // Durma por 100 ms na primeira tentativa, 200 ms na segunda tentativa...
    });
```

Para tentar novamente apenas sob condições específicas, você pode passar um encerramento como o quarto argumento para a função `retry`:

```php
    use Exception;

    return retry(5, function () {
        // ...
    }, 100, function (Exception $exception) {
        return $exception instanceof RetryException;
    });
```

<a name="method-session"></a>
#### `session()`

A função `session` pode ser usada para obter ou definir valores de ([sessão](/docs/session):

```php
    $value = session('key');
```

Você pode definir valores passando um array de pares chave/valor para a função:

```php
    session(['chairs' => 7, 'instruments' => 3]);
```

Se nenhum valor for passado para a função, o valor armazenado da sessão será retornado:

```php
    $value = session()->get('key');

    session()->put('key', $value);
```

<a name="method-tap"></a>
#### `tap()`

A função `tap` aceita dois argumentos: um valor aleatório `$value` e um bloqueio (`closure`). O valor de `$value` será passado ao `closure` e, em seguida, retornado pela função `tap`. O valor de retorno do `closure` é irrelevante:

```php
    $user = tap(User::first(), function (User $user) {
        $user->name = 'taylor';

        $user->save();
    });
```

Se não for passado um closure para a função `tap`, você pode chamar qualquer método do valor especificado. O valor de retorno do método chamado será sempre o `$value`, independentemente do que o método realmente retorne em sua definição. Por exemplo, o método Eloquent `update` geralmente retorna um número inteiro. No entanto, podemos forçar o método a retornar o modelo em si chamando a função `tap` para o método de atualização:

```php
    $user = tap($user)->update([
        'name' => $name,
        'email' => $email,
    ]);
```

Para adicionar um método `tap` a uma classe, você pode adicionar a _trait_ `Illuminate\Support\Traits\Tappable` à classe. O método `tap` desta _trait_ aceita como único argumento um `Closure`. A própria instância do objeto será passada para o `Closure` e, em seguida, devolvido pelo método `tap`:

```php
    return $user->tap(function (User $user) {
        // ...
    });
```

<a name="method-throw-if"></a>
#### `throw_if()`

A função `throw_if` lança a exceção fornecida se uma expressão booleana dada for verdadeira:

```php
    throw_if(! Auth::user()->isAdmin(), AuthorizationException::class);

    throw_if(
        ! Auth::user()->isAdmin(),
        AuthorizationException::class,
        'You are not allowed to access this page.'
    );
```

<a name="method-throw-unless"></a>
#### `throw_unless()` {.collection-method}

A função `throw_unless` lança a exceção dada se uma expressão lógica for `falsa`:

```php
    throw_unless(Auth::user()->isAdmin(), AuthorizationException::class);

    throw_unless(
        Auth::user()->isAdmin(),
        AuthorizationException::class,
        'You are not allowed to access this page.'
    );
```

<a name="method-today"></a>
#### `today()`

A função `today()` cria uma nova instância de `Illuminate\Support\Carbon` para a data atual:

```php
    $today = today();
```

<a name="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()`

A função `trait_uses_recursive` retorna todos as _traits_ usadas por uma _trait_:

```php
    $traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);
```

<a name="method-transform"></a>
#### `transform()`

A função `transform` executa um closure em um determinado valor se o valor não for [blank](#method-blank) e então retorna o valor de retorno do closure:

```php
    $callback = function (int $value) {
        return $value * 2;
    };

    $result = transform(5, $callback);

    // 10
```

Um valor padrão ou uma chave de closure podem ser passados como o terceiro argumento para a função. Esse valor será retornado se o valor for em branco:

```php
    $result = transform(null, $callback, 'The value is blank');

    // O valor está em branco
```

<a name="method-validator"></a>
#### `validator()`

A função `validator` cria uma nova instância do [conjunto de regras de validação](/docs/validation) com os argumentos passados. Pode ser usada como alternativa à interface `Validator`:

```php
    $validator = validator($data, $rules, $messages);
```

<a name="method-value"></a>
#### `value()`

A função `value` retorna o valor que foi passado à mesma. No entanto, se for passada uma sub-rotina para essa função, a sub-rotina será executada e seu valor de retorno será retornado:

```php
    $result = value(true);

    // true

    $result = value(function () {
        return false;
    });

    // false
```

Pode ser passado mais de um argumento para a função value. Se o primeiro argumento for uma chave, os parâmetros adicionais são passados como argumentos para a chave, caso contrário, eles serão ignorados:

```php
    $result = value(function (string $name) {
        return $name;
    }, 'Taylor');
    
    // 'Taylor'
```

<a name="method-view"></a>
#### `view()`

A função `view` recupera uma instância da classe View:

```php
    return view('auth.login');
```

<a name="method-with"></a>
#### `with()`

A função `with` retorna o valor que lhe é passado. Se um closure for passado como segundo argumento à função, esse closure será executado e o seu valor será devolvido:

```php
    $callback = function (mixed $value) {
        return is_numeric($value) ? $value * 2 : 0;
    };

    $result = with(5, $callback);

    // 10

    $result = with(null, $callback);

    // 0

    $result = with(5, null);

    // 5
```

<a name="other-utilities"></a>
## Outros Serviços

<a name="benchmarking"></a>
### Benchmarking

Às vezes pode ser necessário testar rapidamente o desempenho de certas partes da sua aplicação. Nestas ocasiões, você poderá utilizar a classe de suporte `Benchmark` para medir o número de milésimos de segundo necessários ao final da execução dos callbacks:

```php
    <?php

    use App\Models\User;
    use Illuminate\Support\Benchmark;

    Benchmark::dd(fn () => User::find(1)); // 0.1 ms

    Benchmark::dd([
        'Scenario 1' => fn () => User::count(), // 0.5 ms
        'Scenario 2' => fn () => User::all()->count(), // 20.0 ms
    ]);
```

Os callbacks fornecidos serão executados uma única vez por padrão (uma iteração) e sua duração será exibida no navegador/console.

Para invocar um callback mais de uma vez, você pode especificar o número de repetições que o callback deve ser invocado como segundo argumento do método. Ao executar um callback mais do que uma vez, a classe `Benchmark` irá retornar a média das milésimas de segundos necessárias para executar o callback em todas as repetições:

```php
    Benchmark::dd(fn () => User::count(), iterations: 10); // 0.5 ms
```

Às vezes, você pode querer comparar o desempenho de uma função callback enquanto ainda obtém o valor retornado por ela. O método `value` retorna um par contendo o valor retornado pela função callback e a quantidade de milésimos de segundo necessários para executá-la:

```php
    [$count, $duration] = Benchmark::value(fn () => User::count());
```

<a name="dates"></a>
### Datas

O Laravel inclui [Carbon](https://carbon.nesbot.com/docs/), uma poderosa biblioteca de manipulação de datas e horários. Para criar uma nova instância do `Carbon`, você pode utilizar a função `now`. Essa função está disponível em toda parte na sua aplicação Laravel:

```php
$now = now();
```

 Ou você pode criar uma nova instância de `Carbon`, usando a classe `Illuminate\Support\Carbon`:

```php
use Illuminate\Support\Carbon;

$now = Carbon::now();
```

Para uma discussão completa sobre o Carbon e suas características, consulte a [documentação oficial do Carbon](https://carbon.nesbot.com/docs/).

<a name="lottery"></a>
### Lottery

A classe `Lottery` do Laravel pode ser usada para executar callbacks com base em um conjunto de chances definidas. Isso pode ser muito útil quando você deseja executar apenas código para um percentual das suas solicitações recebidas:

```php
    use Illuminate\Support\Lottery;

    Lottery::odds(1, 20)
        ->winner(fn () => $user->won())
        ->loser(fn () => $user->lost())
        ->choose();
```

Você pode combinar a classe `Lottery` do Laravel com outros recursos do Laravel. Por exemplo, você talvez deseje informar apenas uma pequena porcentagem de consultas lentas ao seu manipulador de exceções. E como a classe `lottery` é invocável, nós podemos passar uma instância da classe para qualquer método que aceite invocáveis:

```php
    use Carbon\CarbonInterval;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Lottery;

    DB::whenQueryingForLongerThan(
        CarbonInterval::seconds(2),
        Lottery::odds(1, 100)->winner(fn () => report('Querying > 2 seconds.')),
    );
```

<a name="testing-lotteries"></a>
#### Teste de Lottery

O Laravel disponibiliza alguns métodos simples para que você possa testar facilmente as chamadas de `lottery` no seu aplicativo:

```php
    // A Lottery sempre ganhará...
    Lottery::alwaysWin();

    // A Lottery sempre perderá...
    Lottery::alwaysLose();

    // A Lottery vai ganhar, depois perder e, finalmente, retornar ao comportamento normal...
    Lottery::fix([true, false]);

    // A Lottery voltará ao comportamento normal...
    Lottery::determineResultsNormally();
```

<a name="pipeline"></a>
### Pipeline

O recurso `Pipeline` do Laravel fornece uma maneira conveniente de "concatenar" um determinado tipo de entrada através de uma série de classes invocáveis e closures dando a cada classe a oportunidade de inspecionar ou modificar a entrada e fazer uma chamada para o próximo objeto chamável do pipeline:

```php
use Closure;
use App\Models\User;
use Illuminate\Support\Facades\Pipeline;

$user = Pipeline::send($user)
            ->through([
                function (User $user, Closure $next) {
                    // ...

                    return $next($user);
                },
                function (User $user, Closure $next) {
                    // ...

                    return $next($user);
                },
            ])
            ->then(fn (User $user) => $user);
```

Como você pode verificar, cada classe ou closure invocável na pipeline recebe o input e um closure `$next`. A invocação de um closure `$next` inicia a próxima chamada possível na pipeline. Como você deve ter reparado, isto é muito semelhante ao [middleware](/docs/middleware).

Quando o último invocável na lista chamar o closure de `$next`, o invocável fornecido ao método `then` será executado. Normalmente, esse chamável retorna simplesmente a entrada especificada.

Claro, como discutido anteriormente, você não está limitado a apenas fornecer closures para sua pipeline. Também é possível fornecer classes com métodos de invocação. Se um nome da classe for fornecido, ela será instanciada por meio do [conjunto de serviços](/docs/container) do Laravel, permitindo que dependências sejam injetadas na classe invocável:

```php
$user = Pipeline::send($user)
            ->through([
                GenerateProfilePhoto::class,
                ActivateSubscription::class,
                SendWelcomeEmail::class,
            ])
            ->then(fn (User $user) => $user);
```

<a name="sleep"></a>
### Sleep

A classe `Sleep` do Laravel é uma camada leve que engloba as funções nativas "sleep" e "usleep" do PHP, oferecendo maior capacidade de teste, ao mesmo oferecendo uma API amigável para o desenvolvedor quando se trabalha com o tempo:

```php
    use Illuminate\Support\Sleep;

    $waiting = true;

    while ($waiting) {
        Sleep::for(1)->second();

        $waiting = /* ... */;
    }
```

A classe `Sleep` contém vários métodos que permitem trabalhar com as diferentes unidades de tempo:

```php
    // Pausar a execução por 90 segundos...
    Sleep::for(1.5)->minutes();

    // Pausar a execução por 2 segundos...
    Sleep::for(2)->seconds();

    // Pausar a execução por 500 milissegundos...
    Sleep::for(500)->milliseconds();

    // Pausar a execução por 5.000 microssegundos...
    Sleep::for(5000)->microseconds();

    // Pausar a execução até um determinado momento...
    Sleep::until(now()->addMinute());

    // Alias ​​da função "sleep" nativa do PHP...
    Sleep::sleep(2);

    // Alias ​​da função "usleep" nativa do PHP...
    Sleep::usleep(5000);
```

Para combinar facilmente as unidades de tempo, você pode utilizar o método `and`:

```php
    Sleep::for(1)->second()->and(10)->milliseconds();
```

<a name="testing-sleep"></a>
#### Testando o sleep

Ao testar código que usa a classe `Sleep` ou funções de pausa nativas do PHP, seu teste fará com que sua execução seja interrompida. Como esperado, isso faz com que seu conjunto de testes seja significativamente mais lento. Por exemplo, imagine que você está testando o código abaixo:

```php
    $waiting = /* ... */;

    $seconds = 1;

    while ($waiting) {
        Sleep::for($seconds++)->seconds();

        $waiting = /* ... */;
    }
```

Normalmente, o teste deste código levaria no mínimo um segundo. Por sorte, a classe `Sleep` permite que possamos "iludir" o _sleep_ para que o nosso conjunto de testes permaneça rápido:

::: code-group
```php [Pest]
it('waits until ready', function () {
    Sleep::fake();

    // ...
});
```

```php [PHPUnit]
public function test_it_waits_until_ready()
{
    Sleep::fake();

    // ...
}
```
:::

Ao simular a classe "Sleep", para a execução do programa mas, é ignorado o período de espera real, que leva a um teste significativamente mais rápido.

Uma vez que a classe 'Sleep' foi falsificada, é possível fazer afirmações esperadas contra o "sleep" que deveriam ter ocorrido. Para ilustrar isto, vamos imaginar que estamos testando códigos que pausam a execução três vezes, aumentando cada pausa por um segundo. Usando o método `assertSequence`, podemos afirmar que nosso código "pausou" pelo tempo correto enquanto mantemos nosso teste rápido:

::: code-group
```php [Pest]
it('checks if ready three times', function () {
    Sleep::fake();

    // ...

    Sleep::assertSequence([
        Sleep::for(1)->second(),
        Sleep::for(2)->seconds(),
        Sleep::for(3)->seconds(),
    ]);
}
```

```php [PHPUnit]
public function test_it_checks_if_ready_four_times()
{
    Sleep::fake();

    // ...

    Sleep::assertSequence([
        Sleep::for(1)->second(),
        Sleep::for(2)->seconds(),
        Sleep::for(3)->seconds(),
    ]);
}
```
:::

Claro que a classe `Sleep` oferece uma variedade de outras asserções que você pode usar ao fazer testes:

```php
    use Carbon\CarbonInterval as Duration;
    use Illuminate\Support\Sleep;

    // Afirme que o sleep foi chamado 3 vezes...
    Sleep::assertSleptTimes(3);

    // Afirme contra a duração do sleep...
    Sleep::assertSlept(function (Duration $duration): bool {
        return /* ... */;
    }, times: 1);

    // Afirme que a classe Sleep nunca foi invocada...
    Sleep::assertNeverSlept();

    // Afirme que, mesmo que Sleep tenha sido chamado, nenhuma execução pausada ocorreu...
    Sleep::assertInsomniac();
```

Às vezes pode ser útil executar uma ação sempre que um _sleep_ falso ocorrer no código da aplicação. Para conseguir isto, forneça uma função de retorno para o método `whenFakingSleep`. No exemplo seguinte, utilizamos as ajudas de manipulação do tempo em Laravel para avançar instantaneamente o tempo pelo período de cada _sleep_:

```php
use Carbon\CarbonInterval as Duration;

$this->freezeTime();

Sleep::fake();

Sleep::whenFakingSleep(function (Duration $duration) {
    // Tempo de progresso ao fingir o sleep...
    $this->travel($duration->totalMilliseconds)->milliseconds();
});
```

Como o avanço do tempo é um requisito comum, o método `fake` aceita um argumento `syncWithCarbon` para manter o `Carbon` sincronizado quando estiver dormindo durante um teste:

```php
Sleep::fake(syncWithCarbon: true);

$start = now();

Sleep::for(1)->second();

$start->diffForHumans(); // 1 segundo atrás
```

O Laravel usa a classe `Sleep` internamente sempre que faz uma pausa na execução. Por exemplo, a função de ajuda [`retry`](#method-retry) usa a classe `Sleep` quando está dormindo, o que melhora a capacidade de testar a utilização da ajuda.
