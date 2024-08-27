# Elegível: Serialização

<a name="introduction"></a>
## Introdução

Ao construir APIs com Laravel, você precisará converter seus modelos e relacionamentos para arrays ou JSON. O Eloquent inclui métodos convenientes para fazer essas conversões, bem como controlar quais atributos estão incluídos na representação serializada de seus modelos.

> [!NOTA]
> Para uma maneira ainda mais robusta de lidar com Eloquent Model e coleção JSON serialização, verifique a documentação em [Eloquent API recursos] (/docs/{{version}}/eloquent-resources).

<a name="serializing-models-and-collections"></a>
## Serializando Modelos e Coleções

<a name="serializing-to-arrays"></a>
### Serializando em Arrays

Para converter um modelo e suas relações (relacionamentos) carregadas em uma matriz, você deve usar o método 'toArray'. Este método é recursivo, assim todas as atribuições e relações (incluindo as relações de relações) serão convertidas em matrizes:

```php
    use App\Models\User;

    $user = User::with('roles')->first();

    return $user->toArray();
```

O método `attributesToArray` pode ser usado para converter os atributos de um modelo em uma matriz, mas não suas relações:

```php
    $user = User::first();

    return $user->attributesToArray();
```

Você também pode converter todas as coleções de modelos em matrizes chamando o método 'toArray' na instância da coleção:

```php
    $users = User::all();

    return $users->toArray();
```

<a name="serializing-to-json"></a>
### Serialização em JSON

Para converter um modelo para JSON, você deve usar o método `toJson`. Como `toArray`, o método `toJson` é recursivo, então todos os atributos e relações serão convertidos para JSON. Você também pode especificar qualquer opção de codificação JSON que seja [apoiada pelo PHP](https://secure.php.net/manual/en/function.json-encode.php):

```php
    use App\Models\User;

    $user = User::find(1);

    return $user->toJson();

    return $user->toJson(JSON_PRETTY_PRINT);
```

Alternativamente você pode lançar um modelo ou coleção para uma string, que irá chamar automaticamente o método `toJson` no modelo ou coleção.

```php
    return (string) User::find(1);
```

Como modelos e coleções são convertidos em JSON quando convertidos em uma string, você pode retornar objetos Eloquent diretamente de suas rotas ou controladores da sua aplicação. O Laravel irá serializar automaticamente seus modelos e coleções Eloquent para JSON quando eles forem retornados de rotas ou controladores.

```php
    Route::get('users', function () {
        return User::all();
    });
```

<a name="relationships"></a>
#### Relacionamentos

Quando um modelo Eloquent é convertido em JSON, suas relações carregadas serão automaticamente incluídas como atributos no objeto JSON. Além disso, embora os métodos de relação Eloquent sejam definidos usando o método "camel case", um atributo de relação JSON será "snake case".

<a name="hiding-attributes-from-json"></a>
## Escondendo atributos de JSON

Às vezes você pode querer limitar os atributos, como senhas, que estão incluídos em sua representação de matriz ou JSON do modelo. Para fazer isso, adicione uma propriedade `$hidden` ao seu modelo. Os atributos listados na matriz da propriedade `$hidden` não serão incluídos na representação serializada do seu modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The attributes that should be hidden for arrays.
         *
         * @var array
         */
        protected $hidden = ['password'];
    }
```

> Nota (!)
> Para ocultar relacionamentos, adicione o nome do método de relacionamento a sua propriedade `$hidden` da Eloquent model.

Alternativamente, você pode usar a propriedade 'visible' para definir uma lista de atributos que devem ser incluídos na sua representação do modelo em formato de array ou JSON. Todos os atributos que não estão presentes no array '$visible' serão ocultados quando o modelo é convertido em um array ou JSON:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The attributes that should be visible in arrays.
         *
         * @var array
         */
        protected $visible = ['first_name', 'last_name'];
    }
```

<a name="temporarily-modifying-attribute-visibility"></a>
#### Temporariamente Modificando a Visibilidade do Atributo

Se você gostaria de tornar alguns atributos tipicamente ocultos visíveis em uma determinada instância do modelo, você pode usar o método `makeVisible`. O método `makeVisible` retorna a instância do modelo:

```php
    return $user->makeVisible('attribute')->toArray();
```

Da mesma forma, se você gostaria de esconder alguns atributos que são tipicamente visíveis, você pode usar o método `makeHidden`.

```php
    return $user->makeHidden('attribute')->toArray();
```

Se você quiser ignorar temporariamente todos os atributos visíveis ou ocultos, pode usar respectivamente as métodos 'setVisible' e 'setHidden':

```php
    return $user->setVisible(['id', 'name'])->toArray();

    return $user->setHidden(['email', 'password', 'remember_token'])->toArray();
```

<a name="appending-values-to-json"></a>
## Anexando Valores a JSON

Às vezes, ao converter modelos em matrizes ou JSON, você pode querer adicionar atributos que não possuem uma coluna correspondente no seu banco de dados. Para fazer isso, primeiro defina um acessor para o valor:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Casts\Attribute;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Determine if the user is an administrator.
         */
        protected function isAdmin(): Attribute
        {
            return new Attribute(
                get: fn () => 'yes',
            );
        }
    }
```

Se você gostaria que o acessor sempre fosse adicionado à representação de matriz e JSON do seu modelo, você pode adicionar o nome da característica à propriedade "appends" do seu modelo. Observe que nomes de atributos normalmente são referenciados usando sua representação serializada "snake case", mesmo que o método PHP do acessor seja definido usando "camel case":

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The accessors to append to the model's array form.
         *
         * @var array
         */
        protected $appends = ['is_admin'];
    }
```

Uma vez que o atributo foi adicionado à lista de `appends`, ele será incluído em ambas as representações do modelo, a matriz e a representação JSON. Atributos na matriz de `appends` também respeitarão os atributos configurados de `visible` e `hidden` no modelo.

<a name="appending-at-run-time"></a>
#### Anexando no Tempo de Execução

Em tempo de execução, você pode instruir uma instância do modelo para apêndice atributos adicionais usando o método 'apend'. Ou, você pode usar o método 'setAppends' para substituir todo o conjunto de propriedades anexadas para uma determinada instância do modelo:

```php
    return $user->append('is_admin')->toArray();

    return $user->setAppends(['is_admin'])->toArray();
```

<a name="date-serialization"></a>
## Data serialização

<a name="customizing-the-default-date-format"></a>
#### Personalizando o formato padrão de data

Você pode personalizar o formato padrão de serialização sobrescrevendo o método `serializeDate`. Esse método não afeta como suas datas serão formatadas para armazenamento no banco de dados.

```php
    /**
     * Prepare a date for array / JSON serialization.
     */
    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }
```

<a name="customizing-the-date-format-per-attribute"></a>
#### Personalizando o formato de data por atributo

Você pode personalizar o formato de serialização dos atributos Eloquent usando a especificação do formato de data no [declaração de cast](/docs/{{version}}/eloquent-mutators#attribute-casting) da modelo.

```php
    protected function casts(): array
    {
        return [
            'birthday' => 'date:Y-m-d',
            'joined_at' => 'datetime:Y-m-d H:00',
        ];
    }
```
