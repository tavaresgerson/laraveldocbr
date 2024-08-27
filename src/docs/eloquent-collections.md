# Loquaz: Coleções

<a name="introduction"></a>
## Introdução

Todos os métodos Eloquent que retornam mais de um modelo resultarão em instâncias da classe `Illuminate\Database\Eloquent\Collection`, incluindo resultados recuperados via o método `get` ou acessados via uma relação. O objeto coleção Eloquent estende a [coleção base] (https://laravel.com/docs/collections) do Laravel, então ele herda naturalmente dezenas de métodos usados para trabalhar com fluidez com o array subjacente de modelos Eloquent. Tenha certeza de revisar a documentação da coleção do Laravel para aprender todos sobre esses métodos úteis!

Todas coleções também servem como iteradores, permitindo que você passe por eles como se fossem simples matrizes PHP:

```php
    use App\Models\User;

    $users = User::where('active', 1)->get();

    foreach ($users as $user) {
        echo $user->name;
    }
```

No entanto, como já mencionado, os conjuntos são muito mais poderosos do que as matrizes e expõem uma variedade de operações "map / reduce" que podem ser encadeadas usando uma interface intuitiva. Por exemplo, podemos remover todos os modelos inativos e depois reunir o primeiro nome para cada usuário restante:

```php
    $names = User::all()->reject(function (User $user) {
        return $user->active === false;
    })->map(function (User $user) {
        return $user->name;
    });
```

<a name="eloquent-collection-conversion"></a>
#### Conversão de Eloquent Collection

Enquanto a maioria dos métodos de coleção Eloquent retornam uma nova instância de uma coleção Eloquent, os métodos collapse, flatten, flip, keys, pluck e zip retornam uma instância de [coleção básica](/docs/collections). Da mesma forma, se uma operação "map" retornar uma coleção que não contém nenhum modelo Eloquent, ela será convertida em uma instância de coleção básica.

<a name="available-methods"></a>
## Métodos disponíveis

Todas as coleções Eloquent estendem o objeto [coleção Laravel](/docs/collections#available-methods); portanto, elas herdam todos os métodos poderosos fornecidos pela classe de coleção base.

Além disso, a classe `Illuminate/Database/Eloquent/Collection` fornece um superconjunto de métodos para ajudar na gestão das suas coleções de modelos. A maioria dos métodos retorna instâncias de `Illuminate/Database/Eloquent/Collection`, mas alguns métodos, como o `modelKeys`, retornam uma instância de `Illuminate/Support/Collection`.

<style>
.collection-method-list > p {
colunas: 14.4em 1; -moz-colunas: 14.4em 1; -webkit-colunas: 14.4em 1;
}

.coleção-método-lista a {
display: bloquear;
overflow:hidden;
text-overflow: ellips;
white-space: nowrap;
{

.coleção-método código {
tamanho da fonte: 14px;
{inglês

.collection-method:not(.first-collection-method) {
margin-top: 50px;
}
</style>

<div class="collection-method-list" markdown="1">

[append](#method-append)
[contém](#method-contains)
[diff](#method-diff)
[except](#method-except )
Encontrar
Inglês: [fresh](#method-fresh)
[intersectar](#method-intersect)
[load] (método)
[loadMissing](#method-loadMissing)
[modelKeys](#method-modelkeys)
[visível](#metodo-makevisible)
[esconder](#method-esconder)
[only](#method-only)
[isVisible](#method-isVisible)
[esconde](#method-hide)
[para consulta](#método-paraquery)
[único](#method-unico)

</div>

<a name="method-append"></a>
#### `append($attributes)`  {.collection-method .first-collection-method}

O método `append` pode ser utilizado para indicar que um atributo deve ser [acrescido](/docs/eloquent-serialization#acrescendo-valores-para-json) para cada modelo na coleção. Este método aceita uma matriz de atributos ou apenas um único atributo:

```php
    $users->append('team');
    
    $users->append(['team', 'is_admin']);
```

<a name="method-contains"></a>
#### `contém($chave, $operador = nulo, $valor = nulo)` {metodo-colecao}

O método `contains` pode ser usado para determinar se uma determinada instância de modelo está contido na coleção. Este método aceita uma chave primária ou uma instância de modelo:

```php
    $users->contains(1);

    $users->contains(User::find(1));
```

<a name="method-diff"></a>
#### `diff ($itens)` .{coleção-método}

O método `diff` retorna todos os modelos que não estão presentes na coleção fornecida:

```php
    use App\Models\User;

    $users = $users->diff(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-except"></a>
#### `except($keys)`  {.collection-method}

O método 'except' retorna todos os modelos que não possuem as chaves primárias dadas:

```php
    $users = $users->except([1, 2, 3]);
```

<a name="method-find"></a>
#### 'find($key)' . {coleção-método}

O método 'find' retorna o modelo que possui uma chave primária igual à dada. Se o $key for um modelo, o 'find' tentará retornar um modelo com a chave primária correspondente. Se o $key for uma matriz de chaves, o 'find' retornará todos os modelos com chaves primárias na matriz:

```php
    $users = User::all();

    $user = $users->find(1);
```

<a name="method-fresh"></a>
#### `fresh($with = [])` {.collection-method}

O método `fresh` recupera um modelo "novo" de cada item no banco de dados da coleção. Além disso, todos os relacionamentos especificados serão carregados com fome.

```php
    $users = $users->fresh();

    $users = $users->fresh('comments');
```

<a name="method-intersect"></a>
#### `intersecção($itens)` {.collection-method}

O método `intersect` retorna todos os modelos que estão presentes na coleção dada.

```php
    use App\Models\User;

    $users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-load"></a>
#### carregar ($ relações) {metodo de coleção}

O método 'load' carrega todos os relacionamentos para todas as modelos na coleção:

```php
    $users->load(['comments', 'posts']);

    $users->load('comments.author');
    
    $users->load(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-loadMissing"></a>
#### loadMissing($relacionamentos) {.coleção-método}

O método 'loadMissing' carrega as associações dadas para todos os modelos na coleção se as associações já não estiverem carregadas:

```php
    $users->loadMissing(['comments', 'posts']);

    $users->loadMissing('comments.author');
    
    $users->loadMissing(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-modelKeys"></a>
#### modelKeys()

O método modelKeys retorna as chaves primárias para todos os modelos na coleção:

```php
    $users->modelKeys();

    // [1, 2, 3, 4, 5]
```

<a name="method-makeVisible"></a>
#### '$attributes' visível {.coleção-método}

O método 'makeVisible' [ torna atributos visíveis]/docs/eloquent-serialization#hiding-attributes-from-json) que são normalmente "ocultos" em cada modelo na coleção:

```php
    $users = $users->makeVisible(['address', 'phone_number']);
```

<a name="method-makeHidden"></a>
#### 'hidden' ($atributos) {coleção-método}

O método 'makeHidden' [esconde atributos](/docs/eloquent-serialization#hiding-attributes-from-json) que normalmente são "visíveis" no modelo de cada coleção:

```php
    $users = $users->makeHidden(['address', 'phone_number']);
```

<a name="method-only"></a>
#### ` apenas ($ chaves)` {metodo da colecao}

O método 'only' retorna todos os modelos que possuem as chaves primárias dadas:

```php
    $users = $users->only([1, 2, 3]);
```

<a name="method-setVisible"></a>
#### 'isVisible(atributos)' {método-coleção}

O método `isVisible` [substitui temporariamente](/docs/eloquent-serialization#temporarily-modifying-attribute-visibility) todos os atributos visíveis de cada modelo na coleção:

```php
    $users = $users->setVisible(['id', 'name']);
```

<a name="method-setHidden"></a>
#### '$attributes->hidden()->setHidden()' {`.collection-method'}

O método 'setHidden' [substituir temporariamente] todos os atributos ocultos de cada modelo na coleção.

```php
    $users = $users->setHidden(['email', 'password', 'remember_token']);
```

<a name="method-toquery"></a>
#### 'query()' {.collection-method}

A `toQuery` retorna um objeto Eloquent query builder contendo uma restrição `whereIn` nas chaves primárias do modelo da coleção:

```php
    use App\Models\User;

    $users = User::where('status', 'VIP')->get();

    $users->toQuery()->update([
        'status' => 'Administrator',
    ]);
```

<a name="method-unique"></a>
#### unique( $key = null, $strict = false ) { .collection-method }

O método `unique` retorna todos os modelos únicos na coleção; Quaisquer modelos com a mesma chave primária como outro modelo na coleção são removidos.

```php
    $users = $users->unique();
```

<a name="custom-collections"></a>
## Coleções Personalizadas

Se você quiser usar um objeto 'Collection' personalizado quando interagindo com um modelo dado, você pode definir o método 'newCollection' no seu modelo.

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

Uma vez que você tenha definido um método `newCollection`, você receberá uma instância de sua coleção personalizada sempre que o Eloquent normalmente retornaria uma instância de `Illuminate\Database\Eloquent\Collection`. Se você gostaria de usar uma coleção personalizada para cada modelo em seu aplicativo, você deve definir o método `newCollection` em uma classe base do modelo que é estendida por todos os modelos do seu aplicativo.
