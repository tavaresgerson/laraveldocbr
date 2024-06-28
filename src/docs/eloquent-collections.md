# Eloquent: Coleções

<a name="introduction"></a>
## Introdução

 Todos os métodos de Eloquent que retornam mais do que um modelo irão retornar instâncias da classe `Illuminate\Database\Eloquent\Collection`, incluindo resultados recuperados através do método `get` ou acessados por meio de uma relação. O objeto Collection Eloquent se estende à base de coleções de Laravel, portanto herda naturalmente dezenas de métodos usados para trabalhar de forma fluente com o array subjacente de modelos Eloquent. Reveja a documentação da base de coleções do Laravel para saber tudo sobre esses úteis métodos!

 Todas as coleções servem como iterações, permitindo que você faça um loop delas como se fossem simples array de PHP:

```php
    use App\Models\User;

    $users = User::where('active', 1)->get();

    foreach ($users as $user) {
        echo $user->name;
    }
```

 No entanto, como mencionado anteriormente, as coleções são muito mais poderosas do que os arrays e permitem executar uma variedade de operações map/reduce que podem ser concatenadas com uma interface intuitiva. Por exemplo, podemos remover todos os modelos inativos e depois obter o primeiro nome para cada usuário:

```php
    $names = User::all()->reject(function (User $user) {
        return $user->active === false;
    })->map(function (User $user) {
        return $user->name;
    });
```

<a name="eloquent-collection-conversion"></a>
#### Conversão da coleção Eloquent

 Enquanto a maioria dos métodos de coleção de Eloquent retorna uma nova instância da coleção, os métodos `collapse`, `flatten`, `flip`, `keys`, `pluck` e `zip` retornam uma instância da [coleção base](/docs/collections). Além disso, se uma operação `map` retornar uma coleção que não contenha nenhum modelo do Eloquent, ela será convertida para uma instância da coleção base.

<a name="available-methods"></a>
## Métodos disponíveis

 Todas as coleções do Eloquent são uma extensão do objeto de base [Coleção Laravel](/docs/collections#available-methods); portanto, elas herdam todos os métodos poderosos fornecidos pela classe de coleção básica.

 Além disso, a classe `Illuminate\Database\Eloquent\Collection` fornece uma superset de métodos para auxiliar na gestão das coleções do modelo. A maioria dos métodos retorna instâncias de `Illuminate\Database\Eloquent\Collection`; no entanto, alguns métodos, como o método `modelKeys`, retornam uma instância de `Illuminate\Support\Collection`.

<style>
 <p>Lembramos que, quando o método de coleta é listagem, as informações são apresentadas em ordem alfabética.</p>
 Colunas: 14.4em 1; -moz-colunas: 14.4em 1; -webkit-colunas: 14.4em 1;
 }

 .collection-method-list a {
 display: bloqueio
 overflow: oculto;
 text-overflow: elipsoide;
 white-space: nowrap;
 }

 .methodo-de-colecao código{
 tamanho da fonte: 14 px;
 }

 .collection-method:not(.first-collection-method) {
 margem superior: 50 px;
 }
</style>

<div class="collection-method-list" markdown="1">

 [anexar](#método-anexar)
 [contém (#método contém)
 [diferença de método] (#method-diff)
 [exceto (#method-except)
 [encontrar](#método-encontrar)
 [atualizar (#método atualizar)](/method/refresh/)
 [intersect (#método-intersect)]
 [Carregar] (#método-carregar)
 [carregarFalta](#método-carregarFalta)
 [chaves do modelo](#method-modelKeys)
 [tornarVisivel(# método tornarVisivel)
 [Tornar oculto (#método: makeHidden)](makeHidden)
 [apenas (#método_apenas)]
 [definir como visível#método definir como visível]
 [Fazer o elemento oculto?](#method-setHidden)
 [para consultar#método toQuery]
 [exclusivo] (#método:exclusivo)

</div>

<a name="method-append"></a>
#### `append($attributes)` {.collection-method .first-collection-method}

 O método `append` pode ser usado para indicar que um atributo deve ser [anexado](/docs/eloquent-serialization#appending-values-to-json) a cada modelo na coleção. Este método aceita uma matriz de atributos ou apenas um único:

```php
    $users->append('team');
    
    $users->append(['team', 'is_admin']);
```

<a name="method-contains"></a>
#### `contém($key, $operador = nulo, $valor = nulo)` {.collection-method}

 O método `contém` pode ser usado para determinar se uma determinada instância do modelo está contida na coleção. Esse método aceita um código primário ou uma instância de modelo:

```php
    $users->contains(1);

    $users->contains(User::find(1));
```

<a name="method-diff"></a>
#### `diff($itens)` {.método de coleção}

 O método `diff` retorna todos os modelos que não estão presentes na coleção fornecida:

```php
    use App\Models\User;

    $users = $users->diff(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-except"></a>
#### `exceto($chaves)` {.coletor-método}

 O método `except` retorna todos os modelos que não têm as chaves primárias fornecidas:

```php
    $users = $users->except([1, 2, 3]);
```

<a name="method-find"></a>
#### `encontrar($chave)` {.método da coleção}

 O método `find` retorna o modelo que tem um chave primária correspondente à chave especificada. Se `$key` for uma instância de modelo, `find` tentará retornar um modelo correspondente à chave primária. Se `$key` for uma matriz de chaves, `find` retorna todos os modelos que têm uma chave primária na matriz especificada:

```php
    $users = User::all();

    $user = $users->find(1);
```

<a name="method-fresh"></a>
#### `fresc($com = [])` {.método de coleção}

 O método `fresh` recupera uma instância nova de cada modelo na coleção do banco de dados. Além disso, as relações especificadas serão carregadas com antecedência:

```php
    $users = $users->fresh();

    $users = $users->fresh('comments');
```

<a name="method-intersect"></a>
#### `intersect($itens)` {.método da coleção}

 O método `intersect` retorna todos os modelos que também estão na coleção especificada.

```php
    use App\Models\User;

    $users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-load"></a>
#### `carregar($relations){.coletivométodo}`

 O método `load` carrega os relacionamentos indicados para todos os modelos da coleção:

```php
    $users->load(['comments', 'posts']);

    $users->load('comments.author');
    
    $users->load(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-loadMissing"></a>
#### `carregarFaltando($relations)`{.coletivo-método}

 O método `loadMissing` carrega os relacionamentos especificados para todos os modelos da coleção se estes ainda não tiverem sido carregados:

```php
    $users->loadMissing(['comments', 'posts']);

    $users->loadMissing('comments.author');
    
    $users->loadMissing(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-modelKeys"></a>
#### `modelKeys()` {.collection-method}

 O método `modelKeys` retorna as chaves primárias para todos os modelos na coleção:

```php
    $users->modelKeys();

    // [1, 2, 3, 4, 5]
```

<a name="method-makeVisible"></a>
#### `makeVisible($attributes)` {.collection-method}

 O método `makeVisible` [tornará os atributos visíveis](/docs/eloquent-serialization#hiding-attributes-from-json), normalmente "escondidos" em cada modelo da coleção:

```php
    $users = $users->makeVisible(['address', 'phone_number']);
```

<a name="method-makeHidden"></a>
#### `makeHidden($attributes)` {.collection-method}

 O método `makeHidden` esconde os atributos, que são normalmente "visíveis" em cada modelo na coleção. Para saber mais, consulte ["Ocultar Atributos em JSON"] (//docs/eloquent-serialization#hiding-attributes-from-json).

```php
    $users = $users->makeHidden(['address', 'phone_number']);
```

<a name="method-only"></a>
#### `apenas($chaves){.método de coleção}`

 O método `only` retorna todos os modelos que têm as chaves primárias dadas:

```php
    $users = $users->only([1, 2, 3]);
```

<a name="method-setVisible"></a>
#### `fazer visível(com atributos)` {.método de coleção}

 O método `setVisible` [substitui temporariamente] (/) atributos visíveis de cada modelo na coleção.

```php
    $users = $users->setVisible(['id', 'name']);
```

<a name="method-setHidden"></a>
#### `fazer escondido($attributes)` {.método de coleção}

 O método `setHidden` [ignora temporariamente](/docs/eloquent-serialization#temporarily-modifying-attribute-visibility) todos os atributos ocultos de cada modelo da coleção:

```php
    $users = $users->setHidden(['email', 'password', 'remember_token']);
```

<a name="method-toquery"></a>
#### `toQuery()` {.collection-method}

 O método `toQuery` retorna uma instância de consulta do Eloquent que contém um constrangimento `whereIn` nas chaves primárias do modelo da coleção:

```php
    use App\Models\User;

    $users = User::where('status', 'VIP')->get();

    $users->toQuery()->update([
        'status' => 'Administrator',
    ]);
```

<a name="method-unique"></a>
#### `unique($key = NULL, $strict = false)` {.collection-método}

 O método `unique` retorna todos os modelos únicos na coleção. Todo modelo com a mesma chave primária que outro modelo na coleção será removido:

```php
    $users = $users->unique();
```

<a name="custom-collections"></a>
## Coleções personalizadas

 Se você quiser usar um objeto de coleção personalizado ao interagir com um modelo específico, poderá definir uma metodologia `newCollection` no seu modelo:

```php
    <?php

    namespace App\Models;

    use App\Support\UserCollection;
    use Illuminate\Database\Eloquent\Collection;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Create a new Eloquent Collection instance.
         *
         * @param  array<int, \Illuminate\Database\Eloquent\Model>  $models
         * @return \Illuminate\Database\Eloquent\Collection<int, \Illuminate\Database\Eloquent\Model>
         */
        public function newCollection(array $models = []): Collection
        {
            return new UserCollection($models);
        }
    }
```

 Depois de definir um método `newCollection`, você receberá uma instância do seu conjunto personalizado sempre que o Eloquent normalmente retornar uma instância de `Illuminate\Database\Eloquent\Collection`. Se deseja usar um conjunto personalizado para cada modelo em sua aplicação, defina o método `newCollection` numa classe de modelo base que seja estendida por todos os modelos da sua aplicação.
