# Auxiliares

<a name="introduction"></a>
## Introdução

 O Laravel inclui várias funções de "auxiliares" PHP globais. Muitas dessas funções são usadas pelo próprio framework; no entanto, você pode usar-los em suas próprias aplicações se considerar conveniente.

<a name="available-methods"></a>
## Métodos disponíveis

<style>
 .method-list--collection > p:labeled {
 colunas: 10,8 em 3; -moz-colunas: 10,8 em 3; -webkit-colunas: 10,8 em 3;
 }

 .método de coleta da lista a {
 display: bloqueado
 overflow: oculto;
 texto-transbordamento: elipse;
 espaço em branco: não repetir;
 }
</style>

<a name="arrays-and-objects-method-list"></a>
### Matrizes e objetos

<div class="collection-method-list" markdown="1">

 [Arr::acessível (#metodo-array-acessivel)]
 [Arr::add(#método array_add)](/método-array-add)
 [Arr::collapse (#método array-collapse)](/method-array-collapse)
 [Arr::crossJoin](#método-array-crossjoin)
 [Arr::divide](#método-divisão-de-matriz)
 [Arr::dot (#method-array-dot)]
 [Arr::except (#método array except)
 [arr::exists (#método array_exists)]
 [Arr::first(#método array_first)]
 [Arr::flatten (#método array_flatten)]
 [Arr::forget(#método array forget)](
 [Arr::get (##método array-get)
 [Arr::has (#método-array-has)](/method-array-has/)
 [Arr::hasAny (#método-array-hasany)]
 [Arr::isAssoc(#method array isassoc)](/pt-br/function/arr-isassoc/)
 [Arr::isList (#método array-islist)](/pt/api/#método-array-islist)
 [Arr::join(#Método array_join)](/method/array-join/)
 [Arr::keyBy(#method-array-keyby)]
 [Arr::last (#método array_last)](/método-array-last)
 [Arr::map (#método array_map)]
 [Arr::mapSpread(#método array map_spread)](/pt/api/Arr/#método-array-map-spread)
 [Arr::mapWithKeys (#method Array mapWithKeys)
 [Arr::only](#method-array-only)
 [arr::pluck (#método-array-pluck)]
 [Arr::prepend (#método array_prepend)]
 [Arr::prependKeysWith (#método array prependkeyswith)]
 [Arr::pull](#method-array-pull)
 [Arr::query (#método arrayQuery)]
 [Arr::random (#método array_random)
 [Arr::set (#método array_set)]
 [Arr::shuffle (#método array_shuffle)]
 [Arr::sort()#método array_sort]
 [Arr::sortDesc (#método array_sort_desc)]
 [Arr::sortRecursive(#método array sort_recursivo)]
 [Arr::sortRecursiveDesc (#método array-sort-recursivo-ascendente)](/method/array-sort-recursivo-desc/)
 [Arr::take (#método array_take)]
 [arr::toCssClasses (#método-array-para-categorias-de-estilo)](/#método-array-to-css-classes)
 [Arr::toCssStyles (#método - array para estilos CSS)]
 [Arr::undot(#method-array-undot)
 [Arr::where(#método array where)]
 [Arr::whereNotNull(#método array where_not_null)](/definitions/10849/)
 [Arr::wrap (#método arrayWrap)](/method-array-wrap/)
 [#method_data_fill]
 [data_get(#método data_get)](/)
 [dados_definidos] (##método_dados-definidos)
 [data_forget](#method-data-forget)
 [cabeçalho do método](head)
 [último](#método-último)
</div>

<a name="numbers-method-list"></a>
### Números

<div class="collection-method-list" markdown="1">

 [Número: abreviar](#método-numero-abreviar)
 [Taxa de limite clampada (numero):](#método-numero-clamp)
 [Número ::moeda (#método número moeda)](/)
 [Número::tamanho do ficheiro] (#método Número::tamanho do ficheiro)
 [Número:humanos](#método-número-para-seres-humanos)
 [Número#formato](#método-número-formato)
 [Número :: ordinal (#método number:ordinal)]
 [Número::percentagem] (#método-número-percentagem)
 [Número :: ortografia (#método-number-spell)]
 [Number::useLocale (#método Number: use_locale,)]
 [Número::com o local (#método número com o local)

</div>


<a name="paths-method-list"></a>
### Caminhos

<div class="collection-method-list" markdown="1">

 [app_path](#method-app-path)
 [caminho de base](#method-base-path)
 [config_path (# método config_path)]
 [path_da_base_de_dados#método-path-da-base-de-dados]
 [lang_path](#method-lang-path)
 [mistura de métodos](#método-mista)
 [public_path](#método-public_path)
 [resource_path](#method-resource-path)
 [storage_path](#método-storage-path)

</div>

<a name="urls-method-list"></a>
### URLs

<div class="collection-method-list" markdown="1">

 [Ação (# método-ação)](/métodos/#metodo-action)
 [ativo] (#método de ativo)
 [rota (método route)]
 [secure_asset (#método secure_asset)]
 [secure_url(#método secure_url)]
 [para_rota(#método_para_rota)]
 [URL](#método-URL)

</div>

<a name="miscellaneous-method-list"></a>
### Diversos

<div class="collection-method-list" markdown="1">

 [Abortar](#método-abort)
 [abort_if (#método abort_if)
 [abort_unless (#método-abort-unless)]
 [App#método]
 [autenticação](#método-autenticacao)
 [Página anterior (Método Página Anterior)](/pt-PT/method-back)
 [bcrypt (Método bcrypt)](#methode-bcrypt)
 [em branco](#método-em-branco)
 [transmitir (#método-transmitir)]
 [Cache (Método Cache)](#method-cache)
 [usando_metodo_recursivo#método-class-usando-recursivo]
 [colecionar](#method-collect)
 [configurações] (#método-config)
 [conteúdo de contexto]

 [Cookie (método cookie)](#method-cookie)
 [campo csrf] (#metodo campo_csrf)
 [csrf_token](#method-csrf-token)
 [decrypt (#method-decrypt)]
 [dd (#método dd)](/method-dd)
 [transmissão](#método-de-transmissão)
 [dispatch_sync (#método dispatch-sync)]
 [dump](#method-dump)
 [Encriptar] (#method-encrypt
 [ambiente](#method-env)
 [evento](#método-evento)
 [Falso](#método-falsa)
 [preenchido](#method-filled)
 [Info] (#method-info)
 [Literal#método-literal]
 [logger (Método logger)]
 [método_campo (#método-método_campo)](/method-method-field)
 [agora] (#método-agora: .)
 [antigo] (#método-antigo)
 [uma vez](#metodo-uma-vez)
 [opcional (#método-opcional)]
 [Política de método] (#method-policy
 [Redirecionar](#método-redirecionar)
 [Relatório do método](#method-report)
 [relatar se#método-relatar-se]()
 [relatório_a_partir_de_outras](#method-report-from-others)
 [pedido] (#método-pedido)
 [recuperar](#method-rescue)
 [solucionar o problema](#método-resolver)
 [resposta](#método-resposta)
 [tentar novamente](#method-retry)
 [sessão](#método-sessao)
 [toque](#method-tap)
 [throw_if](#método-throw-if)
 [throw_unless (#método throw-unless)
 [hoje] (#method-today)
 [trait_uses_recursive](#method-trait-uses-recursive)
 [transformar](#método-transformar)
 [Validar o método](#método-validar)
 [valor do método] (#método-value)
 [ver método]
 [com (# metodo-com)]

</div>

<a name="arrays"></a>
## Matrizes e Objetos

<a name="method-array-accessible"></a>
#### `Arr::acessível()` {.collection-method .first-collection-method}

 O método `Arr::acessible` determina se o valor passado é acessível ao script:

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
#### `Arr::add()` {.collection-method}

 O método `Arr::add` adiciona um par chave/valor fornecido a uma matriz se a chave for não existir na matriz ou estiver definida como `null`.

```php
    use Illuminate\Support\Arr;

    $array = Arr::add(['name' => 'Desk'], 'price', 100);

    // ['name' => 'Desk', 'price' => 100]

    $array = Arr::add(['name' => 'Desk', 'price' => null], 'price', 100);

    // ['name' => 'Desk', 'price' => 100]
```


<a name="method-array-collapse"></a>
#### `Arr::collapse()` {.collection-method}

 O método `Arr::collapse` colapsa uma matriz de arrays em uma única matriz:

```php
    use Illuminate\Support\Arr;

    $array = Arr::collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

    // [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-array-crossjoin"></a>
#### `Arr::crossJoin()` {.collection-method}

 O método `Arr::crossJoin` realiza uma operação de cross join dos array fornecidos e retorna um produto cartesiano com todas as permutações possíveis:

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
#### `Arr::divide()` {.collection-method}

 O método `Arr::divide` retorna dois vetores: um contendo as chaves e o outro com os valores do array fornecido.

```php
    use Illuminate\Support\Arr;

    [$keys, $values] = Arr::divide(['name' => 'Desk']);

    // $keys: ['name']

    // $values: ['Desk']
```

<a name="method-array-dot"></a>
#### `Arr::dot()` {.collection-method}

 O método `Arr::dot` reduz um array multidimensional a um array de nível único que utiliza a notação "ponto" para indicar o nível de profundidade:

```php
    use Illuminate\Support\Arr;

    $array = ['products' => ['desk' => ['price' => 100]]];

    $flattened = Arr::dot($array);

    // ['products.desk.price' => 100]
```

<a name="method-array-except"></a>
#### `Arr::except()` {.collection-method}

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
#### `Arr::first()` {.collection-method}

 O método `Arr::first` retorna o primeiro elemento de um array, passando-lhe uma verdadeira ou falsa.

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
#### `Arr::flatten()` {.collection-method}

 O método `Arr::flatten` "aplanha" uma matriz multidimensional numa matriz de nível único:

```php
    use Illuminate\Support\Arr;

    $array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

    $flattened = Arr::flatten($array);

    // ['Joe', 'PHP', 'Ruby']
```

<a name="method-array-forget"></a>
#### `Arr::forget()` {.collection-method}

 O método `Arr::forget` remove uma chave/par de valores dado de um array profundamente aninhado usando notação "ponto":

```php
    use Illuminate\Support\Arr;

    $array = ['products' => ['desk' => ['price' => 100]]];

    Arr::forget($array, 'products.desk');

    // ['products' => []]
```

<a name="method-array-get"></a>
#### `Arr::get()` {.collection-method}

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
#### `Arr::has()` (méthode de collection)

 O método `arr::has` verifica se um determinado item ou itens existem numa matriz, usando a notação "ponto":

```php
    use Illuminate\Support\Arr;

    $array = ['product' => ['name' => 'Desk', 'price' => 100]];

    $contains = Arr::has($array, 'product.name');

    // true

    $contains = Arr::has($array, ['product.price', 'product.discount']);

    // false
```

<a name="method-array-hasany"></a>
#### `Arr::hasAny()` {.collection-method}

 O método `Arr::hasAny` verifica se algum item de um conjunto especificado existe em uma matriz usando notação ponto (".")

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
#### `Arr::isAssoc()` {.collection-method}

 O método `Arr::isAssoc` retorna `true` se o array for um array associavio. Um array é considerado "associavio" se não tiver chaves numéricas sequenciais começando por zero:

```php
    use Illuminate\Support\Arr;

    $isAssoc = Arr::isAssoc(['product' => ['name' => 'Desk', 'price' => 100]]);

    // true

    $isAssoc = Arr::isAssoc([1, 2, 3]);

    // false
```

<a name="method-array-islist"></a>
#### `Arr::isList()` {.collection-method}

 A função `Arr::isList` retorna `true` se as chaves do array forem números inteiros consecutivos, começando a partir de zero:

```php
    use Illuminate\Support\Arr;

    $isList = Arr::isList(['foo', 'bar', 'baz']);

    // true

    $isList = Arr::isList(['product' => ['name' => 'Desk', 'price' => 100]]);

    // false
```

<a name="method-array-join"></a>
#### `Arr::join()` {.collection-method}

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
#### `Arr::keyBy()` {.collection-method}

 O método Arr::keyBy chaveia a matriz por uma determinada chave. Se vários itens tiverem a mesma chave, apenas o último aparecerá na nova matriz:

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
#### `Arr::last()` {.collection-method}

 O método `last` do tipo Arr retorna o último elemento de uma matriz que passa um determinado teste verdadeiro:

```php
    use Illuminate\Support\Arr;

    $array = [100, 200, 300, 110];

    $last = Arr::last($array, function (int $value, int $key) {
        return $value >= 150;
    });

    // 300
```

 Pode ser passado um valor por defeito como terceiro argumento para o método. Este valor será retornado se nenhum outro puder satisfazer a verificação de verdade:

```php
    use Illuminate\Support\Arr;

    $last = Arr::last($array, $callback, $default);
```

<a name="method-array-map"></a>
#### `Arr::map()` {.collection-method}

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
#### `Arr::mapSpread()`{.collection-method}

 O método `Arr::mapSpread` executa a iteração do array, passando o valor de cada item aninhado ao código fechado fornecido. Esse código pode modificar o item e retorná-lo, formando assim um novo array com os itens modificados:

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
#### `Arr::mapWithKeys()`{.collection-method}

 O método `Arr::mapWithKeys` executa uma iteração através do array e passa cada valor para o callback especificado. O callback deve retornar um array associaativo contendo um único par chave/valor:

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
#### `Arr::only()` {.collection-method}

 O método `Arr::only` retorna apenas as chaves/pares de valores especificados do array fornecido:

```php
    use Illuminate\Support\Arr;

    $array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];

    $slice = Arr::only($array, ['name', 'price']);

    // ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-pluck"></a>
#### `Arr::pluck()` {.collection-method}

 O método `Arr::pluck` recupera todas as valores para uma determinada chave de um array:

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
#### `Arr::prepend()` {.collection-method}

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
#### `Arr::prependKeysWith()` (Técnica de coleção)

 A função `Arr::prependKeysWith` antepõe todos os nomes de chaves de uma matriz associavitiva com o prefixo especificado:

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
#### `Arr::pull()` {.collection-method}

 O método Arr::pull retorna e remove uma chave/par de valores de um array:

```php
    use Illuminate\Support\Arr;

    $array = ['name' => 'Desk', 'price' => 100];

    $name = Arr::pull($array, 'name');

    // $name: Desk

    // $array: ['price' => 100]
```

 O valor padrão pode ser passado como o terceiro argumento da metodologia. Este valor é retornado se a chave não existir:

```php
    use Illuminate\Support\Arr;

    $value = Arr::pull($array, $key, $default);
```

<a name="method-array-query"></a>
#### `Arr::query()` {.collection-method}

 O método Arr::query converte o array em uma string de consulta:

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
#### `Arr::random()` {.collection-method}

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
#### `Arr::set()` {.collection-method}

 O método `Arr::set` define um valor num array profundamente aninhado, utilizando a notação "ponto":

```php
    use Illuminate\Support\Arr;

    $array = ['products' => ['desk' => ['price' => 100]]];

    Arr::set($array, 'products.desk.price', 200);

    // ['products' => ['desk' => ['price' => 200]]]
```

<a name="method-array-shuffle"></a>
#### `arr::shuffle()` {.collection-method}

 O método `Arr::shuffle` permite misturar os itens no array de maneira aleatória:

```php
    use Illuminate\Support\Arr;

    $array = Arr::shuffle([1, 2, 3, 4, 5]);

    // [3, 2, 5, 1, 4] - (generated randomly)
```

<a name="method-array-sort"></a>
#### `Arr::sort()` {.collection-method}

 O método `Arr::sort` ordena uma matriz por seus valores:

```php
    use Illuminate\Support\Arr;

    $array = ['Desk', 'Table', 'Chair'];

    $sorted = Arr::sort($array);

    // ['Chair', 'Desk', 'Table']
```

 Pode também ordenar um array pelos resultados de uma determinada função fechada:

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
#### `Arr::sortDesc()` {.collection-método}

 O método `Arr::sortDesc` ordena um array de maneira decrescente em função dos seus valores:

```php
    use Illuminate\Support\Arr;

    $array = ['Desk', 'Table', 'Chair'];

    $sorted = Arr::sortDesc($array);

    // ['Table', 'Desk', 'Chair']
```

 Você também pode ordenar um array pelos resultados de um determinado fechamento (closure, em inglês):

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
#### `arr::sortRecursive()` {.collection-method}

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
#### `Arr::take()` {.collection-method}

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
#### `Arr::toCssClasses()` {.collection-method}

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
#### Arr::toCssStyles() {.collection-method}

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

 Este método é o que dá poder à funcionalidade do Laravel, permitindo [fusão de classes com um saco de atributos de um componente Blade](https://laravel.com/docs/5.8/blade#conditionally-merging-classes), bem como o direcionador `@class` [Blade](/docs/blade#conditional-classes).

<a name="method-array-undot"></a>
#### `Arr::undot()` {.collection-method}

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

 O método `Arr::where` filtra um array utilizando o fecho dado:

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

 O método Arr::wrap envolve o valor indicado em uma matriz. Se o valor indicado já for uma matriz, ele será devolvido sem modificações:

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
#### `data_fill()`{.collection-method}

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
#### `data_get()` {.collection-method}

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

 O recurso aceita também os símbolos "*" (asterismos) que podem especificar qualquer chave do array ou objeto.

```php
    $data = [
        'product-one' => ['name' => 'Desk 1', 'price' => 100],
        'product-two' => ['name' => 'Desk 2', 'price' => 150],
    ];

    data_get($data, '*.name');

    // ['Desk 1', 'Desk 2'];
```

 Os marcadores de posição `{first}` e `{last}` podem ser utilizados para obter os elementos primário ou secundário num array:

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
#### `data_set()` {.collection-method}

```php
The `data_set` function sets a value within a nested array or object using "dot" notation:

    $data = ['products' => ['desk' => ['price' => 100]]];

    data_set($data, 'products.desk.price', 200);

    // ['products' => ['desk' => ['price' => 200]]]
```

 Esta função também aceita os símbolos dos marcadores e definirá os valores no objetivo de acordo com estes:

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
#### `data_forget()` {.collection-method}

 A função `data_forget` remove um valor dentro de um array ou objeto aninhado usando a notação "ponto":

```php
    $data = ['products' => ['desk' => ['price' => 100]]];

    data_forget($data, 'products.desk.price');

    // ['products' => ['desk' => []]]
```

 Essa função também aceita carateres joker que usam o asterisco e removerá os valores do alvo de acordo:

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
#### `head()`{.collection-method}

 A função `head` retorna o primeiro elemento do array:

```php
    $array = [100, 200, 300];

    $first = head($array);

    // 100
```

<a name="method-last"></a>
#### `último()` {.collection-method}

 A função `último` retorna o último elemento do array informado:

```php
    $array = [100, 200, 300];

    $last = last($array);

    // 300
```

<a name="numbers"></a>
## Números

<a name="method-number-abbreviate"></a>
#### `Número::abreviar()` {.collection-method}

 O método Number::abbreviate devolve o formato legível por seres humanos do valor numérico fornecido com uma abreviação para as unidades:

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
#### ``number::limitar()`` {.collection-method}

 O método Number::clamp garante que um número específico permanece dentro de uma faixa especificada. Se o número for menor do que o mínimo, será retornado o valor mínimo. Se o número for maior do que o máximo, será retornado o valor máximo:

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
#### `Número::moeda()` {.collection-method}

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
#### `Number::fileSize()` {.collection-method}

 O método Number::fileSize retorna a representação do tamanho de um arquivo de um valor de bytes como uma string:

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
#### `Número::forHumans()` {.collection-method}

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
#### `Number::format()` {.collection-method}

 O método Number::format formatar o número fornecido em uma string específica do local:

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
#### ``Número::ordinário()`` {.collection-method}

 O método Number::ordinal retorna a representação numérica ordinal de um número:

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
#### `Número::percentagem()` {.collection-method}

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
#### `Number::escrever( )` {.collection-method}

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

 O argumento `até` permite-lhe especificar um valor antes do qual todos os números devem ser escritos como palavras.

```php
    $number = Number::spell(5, until: 10);

    // five

    $number = Number::spell(10, until: 10);

    // 10
```

<a name="method-number-use-locale"></a>
#### `Number::useLocale()` {.collection-method}

 O método `Number::useLocale` define o localização de números padrão globalmente, afetando a forma como os números e moedas são formatados durante as chamadas posteriores aos métodos da classe Number:

```php
    use Illuminate\Support\Number;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Number::useLocale('de');
    }
```

<a name="method-number-with-locale"></a>
#### `Número::comLocalizador()` {.collection-method}

 O método `Number::withLocale` executa o fechamento especificado usando a locação indicada e, em seguida, restaura a locação original após o invocador da função ter sido executado.

```php
    use Illuminate\Support\Number;

    $number = Number::withLocale('de', function () {
        return Number::format(1500);
    });
```

<a name="paths"></a>
## Percursos

<a name="method-app-path"></a>
#### ``app_path()`` {.collection-method}

 A função `app_path` retorna o caminho totalmente qualificado para o diretório `app` da sua aplicação. Pode também usar a função `app_path` para gerar um caminho totalmente qualificado para um ficheiro relativo ao diretório da aplicação:

```php
    $path = app_path();

    $path = app_path('Http/Controllers/Controller.php');
```

<a name="method-base-path"></a>
#### `base_path()` {.collection-method}

 A função `base_path` retorna o caminho totalmente qualificado do diretório raiz da sua aplicação. Pode também utilizar a função `base_path` para gerar um caminho totalmente qualificado de um ficheiro dado em relação ao diretório raiz do projeto:

```php
    $path = base_path();

    $path = base_path('vendor/bin');
```

<a name="method-config-path"></a>
#### `config_path()` {.collection-method}

 A função `config_path` retorna o caminho totalmente qualificado do diretório de configurações da sua aplicação. Você também pode usar a função `config_path` para gerar um caminho totalmente qualificado para um determinado arquivo dentro do diretório de configurações da aplicação:

```php
    $path = config_path();

    $path = config_path('app.php');
```

<a name="method-database-path"></a>
#### `database_path()` {.collection-method}

 A função `database_path` retorna o caminho totalmente qualificado do diretório de banco de dados da aplicação. Também é possível utilizar a função `database_path` para gerar um caminho totalmente qualificado de um determinado arquivo no diretório de banco de dados:

```php
    $path = database_path();

    $path = database_path('factories/UserFactory.php');
```

<a name="method-lang-path"></a>
#### `lang_path()` {.collection-method}

 A função `lang_path` retorna o caminho totalmente qualificado do diretório "lang" da aplicação. Também é possível utilizar a função `lang_path` para gerar um caminho totalmente qualificado de um arquivo específico dentro desse diretório:

```php
    $path = lang_path();

    $path = lang_path('en/messages.php');
```

 > [!NOTA]
 > Por padrão, o esqueleto de aplicação do Laravel não inclui a pasta `lang`. Se pretender personalizar os ficheiros de linguagem do Laravel, pode publicá-los através do comando `lang:publish` da Artisan.

<a name="method-mix"></a>
#### mix() {.collection-method}

 A função `mix` retorna o caminho para um arquivo do Mix com versão:

```php
    $path = mix('css/app.css');
```

<a name="method-public-path"></a>
#### public_path() {.collection-método}

 A função `public_path` retorna o caminho totalmente qualificado do diretório público da aplicação. Você também pode usar a função `public_path` para gerar um caminho totalmente qualificado de um determinado arquivo dentro deste diretório:

```php
    $path = public_path();

    $path = public_path('css/app.css');
```

<a name="method-resource-path"></a>
#### `resource_path()` {.collection-method}

 A função resource_path retorna o caminho totalmente qualificado do diretório de recursos da aplicação. Você também pode usar a função resource_path para gerar um caminho totalmente qualificado de um arquivo específico dentro do diretório de recursos:

```php
    $path = resource_path();

    $path = resource_path('sass/app.scss');
```

<a name="method-storage-path"></a>
#### storage_path () {.collection-method}

 A função `storage_path` retorna o caminho totalmente qualificado do diretório de armazenamento da aplicação. Você também pode usar a função `storage_path` para gerar um caminho totalmente qualificado de um determinado arquivo dentro do diretório de armazenamento:

```php
    $path = storage_path();

    $path = storage_path('app/file.txt');
```

<a name="urls"></a>
## Endereços URL

<a name="method-action"></a>
#### `action()` {.collection-method}

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
#### `asset()` {.collection-method}

 A função `asset` gera um URL para um ativo usando o esquema atual da requisição (HTTP ou HTTPS):

```php
    $url = asset('img/photo.jpg');
```

 Você pode configurar o host da URL de ativos definindo a variável `ASSET_URL` em seu arquivo `.env`. Isso é útil se você hospedar seus ativos em um serviço externo, como Amazon S3 ou outro CDN:

```php
    // ASSET_URL=http://example.com/assets

    $url = asset('img/photo.jpg'); // http://example.com/assets/img/photo.jpg
```

<a name="method-route"></a>
#### `rota()` {.metodo de coleção}

 A função `route` gera um endereço da Web para um roteamento especificado (nomeado) (/docs/routing#named-routes):

```php
    $url = route('route.name');
```

 Se a rota aceitar parâmetros, você poderá passar-lhes como o segundo argumento da função:

```php
    $url = route('route.name', ['id' => 1]);
```

 Por padrão, a função `route` gera um URL absoluto. Se desejar gerar um URL relativo, pode passar `false` como o terceiro argumento da função:

```php
    $url = route('route.name', ['id' => 1], false);
```

<a name="method-secure-asset"></a>
#### `secure_asset()` {.collection-method}

 A função secure_asset gera uma URL para um ativo utilizando HTTPS:

```php
    $url = secure_asset('img/photo.jpg');
```

<a name="method-secure-url"></a>
#### `secure_url()` {.collection-method}

 A função secure_url gera uma URL totalmente qualificada de HTTPS para o caminho especificado. Os segmentos adicionais da URL podem ser passados como um segundo argumento na função:

```php
    $url = secure_url('user/profile');

    $url = secure_url('user/profile', [1]);
```

<a name="method-to-route"></a>
#### `to_route()` {.collection-method}

 A função `to_route` gera uma resposta de [redirecionamento HTTP](/docs/responses#redirects) para uma determinada rota nomeada (/docs/routing#named-routes):

```php
    return to_route('users.show', ['user' => 1]);
```

 Se necessário, você pode passar o código de resposta do HTTP que deve ser atribuído ao redirecionamento e quaisquer cabeçalhos adicionais da resposta como o terceiro e quarto argumentos para a função `to_route`:

```php
    return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);
```

<a name="method-url"></a>
#### `url()` {.collection-method}

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
## Variados

<a name="method-abort"></a>
#### `abort()` {.collection-method}

 A função `abort` envia uma [exceção HTTP](/docs/errors#http-exceptions), que será renderizada pelo [hander de exceções](/docs/errors#the-exception-handler):

```php
    abort(403);
```

 Você também pode fornecer a mensagem da exceção e cabeçalhos de resposta personalizados que devem ser enviadas ao navegador:

```php
    abort(403, 'Unauthorized.', $headers);
```

<a name="method-abort-if"></a>
#### `abort_if()` {.collection-method}

 A função `abort_if` lança uma exceção de HTTP se uma expressão booleana for avaliada como `verdadeira`:

```php
    abort_if(! Auth::user()->isAdmin(), 403);
```

 Tal como no método `abort`, é possível fornecer também o texto de resposta da exceção, na terceira posição, e um conjunto de cabeçalhos personalizados da resposta, na quarta posição, para a função.

<a name="method-abort-unless"></a>
#### `abort_unless()` {.collection-method}

 A função `abort_unless` joga uma exceção de HTTP se uma expressão lógica dada avaliar como `falso`:

```php
    abort_unless(Auth::user()->isAdmin(), 403);
```

 Assim como o método `abort`, você também pode fornecer o texto da resposta da exceção como o terceiro argumento e um array de cabeçalhos de resposta personalizados como o quarto argumento para a função.

<a name="method-app"></a>
#### `app()` {.collection-method}

 A função `app` retorna a instância do contêiner de serviços:

```php
    $container = app();
```

 Você pode passar um nome de classe ou de interface para resolvê-la do contêiner:

```php
    $api = app('HelpSpot\API');
```

<a name="method-auth"></a>
#### `autenticar()` {.método de coleção}

 A função `auth` retorna uma instância de autenticador ([authenticator](/docs/authentication). Você pode usá-la como uma alternativa à façana `Auth`:

```php
    $user = auth()->user();
```

 Se necessário, você pode especificar a instância do guia que deseja acessar:

```php
    $user = auth('admin')->user();
```

<a name="method-back"></a>
#### `back()` {.collection-method}

 A função `back` gera uma resposta de redirecionamento [HTTP] para o local anterior do usuário:

```php
    return back($status = 302, $headers = [], $fallback = '/');

    return back();
```

<a name="method-bcrypt"></a>
#### `bcrypt()` (método de coleção)

 A função `bcrypt` [hace hashes](/docs/hashing) do valor fornecido usando a tecnologia Bcrypt. Você pode utilizar esta função como uma alternativa para o frontal Hash:

```php
    $password = bcrypt('my-secret-password');
```

<a name="method-blank"></a>
#### `blank()` {.collection-method}

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
#### `transmitir()` {.collection-method}

 A função `broadcast` ([transmite](/docs/broadcasting) o evento especificado aos seus ouvinte):

```php
    broadcast(new UserRegistered($user));

    broadcast(new UserRegistered($user))->toOthers();
```

<a name="method-cache"></a>
#### `cache()` {.collection-method}

 A função `cache` pode ser usada para recuperar valores do [cache] (https://revele.io/docs/cache/). Caso a chave especificada não exista no cache, um valor padrão opcional será retornado:

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
#### `class_uses_recursive()` {.collection-method}

 A função `class_uses_recursive` retorna todos os traços usados por uma classe, incluindo os traços usados por todas as suas classes pai:

```php
    $traits = class_uses_recursive(App\Models\User::class);
```

<a name="method-collect"></a>
#### `coletar()` {.collection-method}

 A função `collect` cria uma instância de coleção a partir do valor fornecido:

```php
    $collection = collect(['taylor', 'abigail']);
```

<a name="method-config"></a>
#### `config()` {.collection-método}

 A função `config` obtém o valor de uma variável de [configuração](/docs/configuration). Os valores da configuração podem ser acessados utilizando a sintaxe "ponto", que inclui o nome do ficheiro e a opção que pretende aceder. Pode ser especificado um valor padrão, que é retornado se não existir uma opção de configuração:

```php
    $value = config('app.timezone');

    $value = config('app.timezone', $default);
```

 Você pode configurar variáveis de configuração durante a execução passando um array de pares chave/valor. No entanto, note que esta função afeta apenas o valor da configuração para a solicitação atual e não atualiza os valores reais da sua configuração:

```php
    config(['app.debug' => true]);
```

<a name="method-context"></a>
#### `context()` {.collection-method}

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
#### `cookie()` {.collection-method}

 A função `cookie` cria uma nova instância de [cookie](/docs/requests#cookies):

```php
    $cookie = cookie('name', 'value', $minutes);
```

<a name="method-csrf-field"></a>
#### `csrf_field()` {.collection-method}

 A função `csrf_field` gera um campo de entrada oculto HTML contendo o valor do token de CSRF. Por exemplo, usando a sintaxe Blade (ref: /docs/blade):

```blade
    {{ csrf_field() }}
```

<a name="method-csrf-token"></a>
#### `csrf_token()` {.collection-method}

 A função `csrf_token` recupera o valor do token de segurança atual:

```php
    $token = csrf_token();
```

<a name="method-decrypt"></a>
#### `decrypt()` {.collection-method}

 A função `decrypt` permite decifrar o valor fornecido, podendo esta ser utilizada como alternativa à façanha `Crypt`:

```php
    $password = decrypt($value);
```

<a name="method-dd"></a>
#### `dd()` {.collection-method}

 A função `dd` despeja as variáveis fornecidas e encerra a execução do script.

```php
    dd($value);

    dd($value1, $value2, $value3, ...);
```

 Se você não quiser interromper a execução de seu script, use a função [`dump`](#método-dump).

<a name="method-dispatch"></a>
#### `enviar( )` {.método da coleção}

 A função `dispatch` envia o trabalho indicado ao [fila de tarefas](en/docs/queues.html#creating-jobs) do Laravel:

```php
    dispatch(new App\Jobs\SendEmails);
```

<a name="method-dispatch-sync"></a>
#### `dispatch_sync()` {.collection-method}

 A função `dispatch_sync` coloca o trabalho fornecido na fila de [envio síncrono] (/) para que ele seja processado imediatamente:

```php
    dispatch_sync(new App\Jobs\SendEmails);
```

<a name="method-dump"></a>
#### `dump()` {.collection-method}

 A função `dump` exibe as variáveis indicadas:

```php
    dump($value);

    dump($value1, $value2, $value3, ...);
```

 Se você deseja interromper a execução do script após o envio das variáveis, utilize a função [dd](#method-dd).

<a name="method-encrypt"></a>
#### `encrypt()` {.collection-method}

 A função `encrypt` encripta o valor fornecido, que poderá ser utilizada como alternativa ao pacote de funções `Crypt`:

```php
    $secret = encrypt('my-secret-value');
```

<a name="method-env"></a>
#### `env()` {.collection-method}

 A função `env` recupera o valor de uma variável [de ambiente]() ou retorna um valor padrão:

```php
    $env = env('APP_ENV');

    $env = env('APP_ENV', 'production');
```

 > [Aviso]
 > Se executar o comando `config:cache` durante o processo de implementação, terá de certificar-se de que está a chamar apenas a função `env` dos ficheiros de configuração. Uma vez que a configuração tenha sido armazenada em cache, não será utilizado o ficheiro `.env`, pelo que todas as chamadas à função `env` retornarão `null`.

<a name="method-event"></a>
#### `event()` {.collection-method}

 A função `event` envia o evento especificado a seus escutadores:

```php
    event(new UserRegistered($user));
```

<a name="method-fake"></a>
#### `fake()` {.collection-method}

 A função `fake` resolve um [Faker](https://github.com/FakerPHP/Faker) singleton do container, que pode ser útil ao criar dados falsos em fábricas de modelos, carregamento de banco de dados, testes e prototipagem de visualizações:

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
#### `enchido(a)` {.metodo-de-colecao}

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

 Para a inversa da função `filled`, consulte o método [`blank`](#method-blank).

<a name="method-info"></a>
#### `info()` {.collection-method}

 A função `info` irá escrever informações no registo da sua aplicação [Logging] (/docs/logging):

```php
    info('Some helpful information!');
```

 Um conjunto de dados contextuais pode também ser passado para a função:

```php
    info('User login attempt failed.', ['id' => $user->id]);
```

<a name="method-literal"></a>
#### `literal()` {.collection-method}

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
#### `logger()` {.collection-method}

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
#### `method_field()` {.collection-method}

 A função de campo `method_field` gera um campo de entrada HTML oculto que contém o valor falsificado do verbo de petição do formulário. Por exemplo, usando a sintaxe Blade (na docs):

```php
    <form method="POST">
        {{ method_field('DELETE') }}
    </form>
```

<a name="method-now"></a>
#### `agora()` {.collection-method}

 A função `now` cria uma nova instância de `Illuminate\Support\Carbon` para o momento atual:

```php
    $now = now();
```

<a name="method-old"></a>
#### ``old()`` {.collection-method}

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
#### `once()`{.collection-method}

 A função `once` executa o callback definido e armazena o resultado em memória para a duração da requisição. Quaisquer chamadas subsequentes à função `once`, com o mesmo callback, devolvem o resultado previamente armazenado:

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
$secondService->all(); // (cached result)
```
<a name="method-optional"></a>
#### `opcional()` {.collection-method}

 A função `opcional` aceita qualquer argumento e permite o acesso à propriedades ou métodos desse objeto. Se o objeto for `null`, as propriedades e os métodos retornarão `null` em vez de causar um erro:

```php
    return optional($user->address)->street;

    {!! old('name', optional($user)->name) !!}
```

 A função `opcional` também aceita um fechamento como segundo argumento, que será invocado se o valor fornecido como primeiro argumento não for nulo:

```php
    return optional(User::find($id), function (User $user) {
        return $user->name;
    });
```

<a name="method-policy"></a>
#### `politica()` {.collection-method}

 O método `policy` recupera uma instância de política para uma classe específica:

```php
    $policy = policy(App\Models\User::class);
```

<a name="method-redirect"></a>
#### ``redirect()` {.collection-method}

 A função `redirect` retorna uma [resposta de redirecionamento HTTP] (http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#h_14.38), ou a instância da função `redirector` quando não for utilizada com parâmetros:

```php
    return redirect($to = null, $status = 302, $headers = [], $https = null);

    return redirect('/home');

    return redirect()->route('route.name');
```

<a name="method-report"></a>
#### `relatório()` {.collection-method}

 A função `report` informará uma exceção utilizando o seu [handling de exceções] (/)docs/erros/#the-exception-handler):

```php
    report($e);
```

 A função `report` também aceita um argumento de tipo string. Se for passada uma string à função, a função irá criar uma exceção com a string como mensagem:

```php
    report('Something went wrong.');
```

<a name="method-report-if"></a>
#### `report_if()` {.collection-method}

 A função `report_if` relatará uma exceção usando o seu [gerenciador de exceções](/docs/errors#the-exception-handler), se a condição for `verdadeira`:

```php
    report_if($shouldReport, $e);

    report_if($shouldReport, 'Something went wrong.');
```

<a name="method-report-unless"></a>
#### `report_unless()`{.collection-method}

 A função `report_unless` relatará a exceção usando o seu [handling de exceções](/docs/errors/#the-exception-handler) caso a condição for falsa:

```php
    report_unless($reportingDisabled, $e);

    report_unless($reportingDisabled, 'Something went wrong.');
```

<a name="method-request"></a>
#### ` request(“) {.collection-method}`

 A função `request` retorna a instância atual da [requisição](/docs/requests) ou obtém o valor de um campo de entrada do requerimento ativo:

```php
    $request = request();

    $value = request('key', $default);
```

<a name="method-rescue"></a>
#### `rescue()` {.collection-method}

 A função `rescue` executa o fecho especificado e captura quaisquer exceções que sejam geradas durante a sua execução. Todas as exceções capturadas são enviadas para o [mecanismo de tratamento de exceções](/docs/errors#o-mecanismo-de-tratamento-de-erros); no entanto, o pedido continua a ser processado:

```php
    return rescue(function () {
        return $this->method();
    });
```

 Você também pode passar um segundo argumento à função `rescue`. Este argumento será o valor “padrão” que deverá ser retornado se uma exceção ocorrer ao executar a proximidade:

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
#### `resolve()` {.collection-method}

 A função `resolve` resolve um nome de classe ou interface para uma instância usando o [conjunto de serviços](/docs/container):

```php
    $api = resolve('HelpSpot\API');
```

<a name="method-response"></a>
#### `resposta()` {.metodo-da-coleção}

 A função `response` cria uma instância de [resposta](/docs/responses) ou obtém uma instância do fabricante de respostas:

```php
    return response('Hello World', 200, $headers);

    return response()->json(['foo' => 'bar'], 200, $headers);
```

<a name="method-retry"></a>
#### `retry()`{.collection-method}

 A função `retry` tenta executar o callback fornecido até atingir o limite máximo de tentativas especificado. Se o callback não ejetuar uma exceção, seu valor retornado será retornado. Se o callback ejetuar uma exceção, ele será automaticamente reexecutado. Se o número máximo de tentativas for excedido, a exceção será jogada:

```php
    return retry(5, function () {
        // Attempt 5 times while resting 100ms between attempts...
    }, 100);
```

 Se você preferir calcular manualmente o número de milésimos de segundo para esperar entre os tentaços, poderá passar um fechamento como terceiro argumento à função `retry`:

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
        // Sleep for 100ms on first retry, 200ms on second retry...
    });
```

 Para só ser feito um novo tentativa sob condições específicas, é possível passar um fechamento como o quarto argumento da função `retry`:

```php
    use Exception;

    return retry(5, function () {
        // ...
    }, 100, function (Exception $exception) {
        return $exception instanceof RetryException;
    });
```

<a name="method-session"></a>
#### `session()` {.collection-method}

 A função `session` pode ser usada para obter ou definir valores de sessão ([sessão](/docs/session):

```php
    $value = session('key');
```

 Você pode definir valores passando um array de pares chave/valor para a função:

```php
    session(['chairs' => 7, 'instruments' => 3]);
```

 Se nenhum valor for passado para a função, o armazenamento da sessão será retornado:

```php
    $value = session()->get('key');

    session()->put('key', $value);
```

<a name="method-tap"></a>
#### `tap()` {.collection-method}

 A função `tap` aceita dois argumentos: um valor aleatório `$value` e um bloqueio (`closure`). O valor de `$value` será passado ao `closure` e, em seguida, retornado pela função `tap`. O valor de retorno do `closure` é irrelevante:

```php
    $user = tap(User::first(), function (User $user) {
        $user->name = 'taylor';

        $user->save();
    });
```

 Se não for passado um encerramento para a função `tap`, você pode chamar qualquer método do valor especificado. O valor de retorno do método chamado será sempre o `$value`, independentemente do que o método realmente retorne em sua definição. Por exemplo, o método Eloquent `update` geralmente retorna um número inteiro. No entanto, podemos forçar o método a retornar o modelo em si chamando a função `tap` para o método de atualização:

```php
    $user = tap($user)->update([
        'name' => $name,
        'email' => $email,
    ]);
```

 Para adicionar um método `tap` a uma classe, você pode adicionar o traço `Illuminate\Support\Traits\Tappable` à classe. O método `tap` deste traço aceita como único argumento um Closure (um parâmetro anónimo). A própria instância do objeto será passada para o Closure e, em seguida, devolvido pelo método `tap`:

```php
    return $user->tap(function (User $user) {
        // ...
    });
```

<a name="method-throw-if"></a>
#### `throw_if()` {.collection-method}

 A função `throw_if` arrota a exceção fornecida se uma expressão booleana dada for verdadeira:

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
#### `hoje()` {.collection-method}

 A função `today()` cria uma nova instância de `Illuminate\Support\Carbon` para a data atual:

```php
    $today = today();
```

<a name="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()` {.método da coleção}

 A função `trait_uses_recursive` retorna todos os traços usados por um traço:

```php
    $traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);
```

<a name="method-transform"></a>
#### `transform()` {.collection-method}

 A função `transform` executa uma cláusula em um valor especificado, se o valor não for um espaçoinho ([método spaceinline](#method-spaceinline)), e então retorna o valor de retorno da cláusula.

```php
    $callback = function (int $value) {
        return $value * 2;
    };

    $result = transform(5, $callback);

    // 10
```

 Um valor padrão ou uma chave de fechamento podem ser passados como o terceiro argumento para a função. Esse valor será retornado se o valor for em branco:

```php
    $result = transform(null, $callback, 'The value is blank');

    // The value is blank
```

<a name="method-validator"></a>
#### `validator()` {.collection-method}

 A função `validator` cria uma nova instância do [conjunto de regras de validação](/docs/validation) com os argumentos passados. Pode ser usada como alternativa à interface `Validator`:

```php
    $validator = validator($data, $rules, $messages);
```

<a name="method-value"></a>
#### value() {.collection-method}

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
#### `view()` {.collection-method}

 A função `view` recupera uma instância da classe View:

```php
    return view('auth.login');
```

<a name="method-with"></a>
#### `com()` {.collection-method}

 A função `with` retorna o valor que lhe é passado. Se um fecho for passado como segundo argumento à função, esse fecho será executado e o seu valor devolvido será devolvido:

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
### Comparação de referência

 Às vezes pode ser necessário testar rapidamente o desempenho de certas partes da sua aplicação. Nestas ocasiões, poderá utilizar a classe de suporte `Benchmark` para medir o número de milésimos de segundo necessários ao final da execução dos callbacks:

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

 Os callbacks fornecidos serão executados uma única vez por padrão (uma iteração) e sua duração será exibida no navegador/consola.

 Para invocar um callback mais de uma vez, você pode especificar o número de repetições que o callback deve ser invocado como segundo argumento da metodologia. Ao executar um callback mais do que uma vez, a classe `Benchmark` irá retornar a média das milésimas de segundos necessárias para executar o callback em todas as repetições:

```php
    Benchmark::dd(fn () => User::count(), iterations: 10); // 0.5 ms
```

 Às vezes, você pode querer comparar o desempenho de uma função callback enquanto ainda obtém o valor retornado por ela. O método `value` retorna um par contendo o valor retornado pela função callback e a quantidade de milésimos de segundo necessários para executá-la:

```php
    [$count, $duration] = Benchmark::value(fn () => User::count());
```

<a name="dates"></a>
### Datas

 O Laravel inclui [Carbon](https://carbon.nesbot.com/docs/), uma poderosa biblioteca de manipulação de datas e horários. Para criar uma nova instância do `Carbon`, pode utilizar a função `now`. Essa função está disponível em toda parte na sua aplicação Laravel:

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
### Lotaria

 A classe Lottery do Laravel pode ser usada para executar callbacks com base em um conjunto de chances definidas. Isso pode ser muito útil quando você deseja executar apenas código para um percentual das suas solicitações recebidas:

```php
    use Illuminate\Support\Lottery;

    Lottery::odds(1, 20)
        ->winner(fn () => $user->won())
        ->loser(fn () => $user->lost())
        ->choose();
```

 Você pode combinar a classe loteria do Laravel com outros recursos do Laravel. Por exemplo, você talvez deseje informar apenas uma pequena porcentagem de consultas lentas ao seu manipulador de exceções. E como a classe loteria é chamável, nós podemos passar uma instância da classe para qualquer método que aceite chamáveis:

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
#### Teste de Loterias

 O Laravel disponibiliza alguns métodos simples para que você possa testar facilmente as convocações da loteria do seu aplicativo:

```php
    // Lottery will always win...
    Lottery::alwaysWin();

    // Lottery will always lose...
    Lottery::alwaysLose();

    // Lottery will win then lose, and finally return to normal behavior...
    Lottery::fix([true, false]);

    // Lottery will return to normal behavior...
    Lottery::determineResultsNormally();
```

<a name="pipeline"></a>
### Gasoduto

 O recurso `Pipeline` do Laravel fornece uma maneira conveniente de "pipetear" um determinado tipo de entrada através de uma série de classes invocáveis, fechamentos ou chamáveis, dando a cada classe a oportunidade de inspecionar ou modificar a entrada e fazer uma chamada para o próximo objeto chamável do pipeline:

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

 Como pode verificar, cada classe ou fecho invocável na canalização recebe o input e um fecho `$next`. A invocação de um fecho `$next` inicia a próxima chamada possível na canalização. Como deve ter reparado, isto é muito semelhante ao [middleware](/docs/middleware).

 Quando o último chamável na lista chamar o fechamento de `$next`, o chamável fornecido ao método `then` será invocado. Normalmente, esse chamável retorna simplesmente a entrada especificada.

 Claro, como discutido anteriormente, você não está limitado a apenas fornecer closures para sua pipeline. Também é possível fornecer classes com métodos de invocação. Se um nome da classe for fornecido, ela será instanciada por meio do [conjunto de serviços](/docs/container) de Laravel, permitindo que dependências sejam injetadas na classe invocável:

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
### Dormir

 A classe `Sleep` do Laravel é uma camada leve que engloba as funções nativas "sleep" e "usleep" do PHP, oferecendo maior capacidade de teste, aoЪmesmo oferecendo uma API amigável para o desenvolvedor quando se trabalha com o tempo:

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
    // Pause execution for 90 seconds...
    Sleep::for(1.5)->minutes();

    // Pause execution for 2 seconds...
    Sleep::for(2)->seconds();

    // Pause execution for 500 milliseconds...
    Sleep::for(500)->milliseconds();

    // Pause execution for 5,000 microseconds...
    Sleep::for(5000)->microseconds();

    // Pause execution until a given time...
    Sleep::until(now()->addMinute());

    // Alias of PHP's native "sleep" function...
    Sleep::sleep(2);

    // Alias of PHP's native "usleep" function...
    Sleep::usleep(5000);
```

 Para combinar facilmente as unidades de tempo, você pode utilizar o método `e`:

```php
    Sleep::for(1)->second()->and(10)->milliseconds();
```

<a name="testing-sleep"></a>
#### Testando o sono

 Ao testar código que usa a classe `Sleep` ou funções de pausa nativas do PHP, seu teste fará com que sua execução seja interrompida. Como esperado, isso faz com que seu conjunto de testes seja significativamente mais lento. Por exemplo, imagine que você está testando o código abaixo:

```php
    $waiting = /* ... */;

    $seconds = 1;

    while ($waiting) {
        Sleep::for($seconds++)->seconds();

        $waiting = /* ... */;
    }
```

 Normalmente, o teste deste código levaria no mínimo um segundo. Por sorte, a classe `Sleep` permite que possamos "iludir" o sono para que o nosso conjunto de testes permaneça rápido:

```php tab=Pest
it('waits until ready', function () {
    Sleep::fake();

    // ...
});
```

```php tab=PHPUnit
public function test_it_waits_until_ready()
{
    Sleep::fake();

    // ...
}
```

 Ao simular a classe "Sleep", pára a execução do programa mas é ignorado o período de espera real, que leva a um teste significativamente mais rápido.

 Uma vez que a classe 'Sleep' foi falsificada, é possível fazer afirmações contra os "sono" esperados que deveriam ter ocorrido. Para ilustrar isto, vamos imaginar que estamos testando códigos que pausam a execução três vezes, aumentando cada pausa por um segundo. Usando o método `assertSequence`, podemos afirmar que nosso código "pausou" pelo tempo correto enquanto mantemos nossa teste rápida:

```php tab=Pest
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

```php tab=PHPUnit
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

 Claro que a classe Sleep oferece uma variedade de outras asserções que você pode usar ao fazer testes:

```php
    use Carbon\CarbonInterval as Duration;
    use Illuminate\Support\Sleep;

    // Assert that sleep was called 3 times...
    Sleep::assertSleptTimes(3);

    // Assert against the duration of sleep...
    Sleep::assertSlept(function (Duration $duration): bool {
        return /* ... */;
    }, times: 1);

    // Assert that the Sleep class was never invoked...
    Sleep::assertNeverSlept();

    // Assert that, even if Sleep was called, no execution paused occurred...
    Sleep::assertInsomniac();
```

 Às vezes pode ser útil executar uma ação sempre que um soninho falso ocorrer no código da aplicação. Para conseguir isto, forneça uma função de retorno para a `whenFakingSleep` metodologia. No exemplo seguinte, utilizamos as ajudas de manipulação do tempo em Laravel para avançar instantaneamente o tempo pelo período de cada soninho:

```php
use Carbon\CarbonInterval as Duration;

$this->freezeTime();

Sleep::fake();

Sleep::whenFakingSleep(function (Duration $duration) {
    // Progress time when faking sleep...
    $this->travel($duration->totalMilliseconds)->milliseconds();
});
```

 Como o avanço do tempo é um requisito comum, o método `fake` aceita um argumento `syncWithCarbon` para manter o Carbon sincronizado quando estiver dormindo durante um teste:

```php
Sleep::fake(syncWithCarbon: true);

$start = now();

Sleep::for(1)->second();

$start->diffForHumans(); // 1 second ago
```

 O Laravel usa a classe `Sleep` internamente sempre que faz uma pausa na execução. Por exemplo, a função de ajuda [`retry`](#method-retry) usa a classe `Sleep` quando está dormindo, o que melhora a capacidade de testar a utilização da ajuda.
