# Eloquente: Série

<a name="introduction"></a>
## Introdução

 Ao criar APIs com o uso do Laravel, geralmente você precisará converter seus modelos e relações em arrays ou JSON. O Eloquent inclui métodos convenientes para fazer essas conversões, além de permitir que você controle quais atributos são incluídos na representação serializada dos seus modelos.

 > [!ATENÇÃO]
 [Recursos da API Eloquent](/docs/{{version}}/eloquent-resources).

<a name="serializing-models-and-collections"></a>
## Serialização de modelos e coleções

<a name="serializing-to-arrays"></a>
### Seriado em matrizes

 Para converter um modelo e suas relacionamentos carregados em um array, você deve usar o método `toArray`. Esse método é recursivo. Assim, todos os atributos e todas as relações (inclusive as relações das relações) serão convertidos para arrays:

```php
    use App\Models\User;

    $user = User::with('roles')->first();

    return $user->toArray();
```

 O método `attributesToArray` pode ser usado para converter atributos de um modelo em um array, mas não as relações:

```php
    $user = User::first();

    return $user->attributesToArray();
```

 Você também pode converter inteiras [coleções de modelos](/docs/{{ version }}/eloquent-collections) para matrizes, chamando o método `toArray` na instância da coleção.

```php
    $users = User::all();

    return $users->toArray();
```

<a name="serializing-to-json"></a>
### Serializar para JSON

 Para converter um modelo para o formato JSON, você deverá utilizar a metodologia `toJson`. Assim como no caso da `toArray`, a metodologia `toJson` é recursiva, ou seja, todos os atributos e relações serão convertidos em JSON. Além disso, você pode especificar qualquer opção de codificação do JSON que esteja [aprovada pelo PHP](https://secure.php.net/manual/en/function.json-encode.php):

```php
    use App\Models\User;

    $user = User::find(1);

    return $user->toJson();

    return $user->toJson(JSON_PRETTY_PRINT);
```

 Como alternativa, você pode convert um modelo ou coleção em uma string, o que chamará automaticamente o método `toJson` do modelo ou da coleção:

```php
    return (string) User::find(1);
```

 Como os modelos e coleções são convertidos para o JSON quando transformados em uma string, você pode devolver objetos Eloquent diretamente pelos rotas ou controladores da aplicação. O Laravel serializa automaticamente seus modelos e suas coleções como JSON ao serem retornados nos rotas ou controladores:

```php
    Route::get('users', function () {
        return User::all();
    });
```

<a name="relationships"></a>
#### Relações

 Quando um modelo Eloquent é convertido para JSON, suas relações carregadas serão automaticamente incluídas como atributos no objeto JSON. Além disso, embora os métodos de relação do Eloquent sejam definidos usando nomes de método em "casa de letras", o atributo da relação em JSON será "case sensível".

<a name="hiding-attributes-from-json"></a>
## Esconder atributos do arquivo JSON

 Às vezes você pode desejar limitar os atributos, como senhas, incluídas na representação do modelo em um array ou JSON. Para fazer isso, adicione uma propriedade de `$hidden` ao seu modelo. Os atributos listados na matriz da propriedade `$hidden` não serão incluídos na representação serializada do seu modelo:

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

 > [!NOTA]
 > Para ocultar relações, adicione o nome da metodologia de relacionamento à propriedade `$hidden` do modelo Eloquent.

 Como alternativa, é possível usar a propriedade `visible` para definir uma "lista de permissão" com atributos que devem ser incluídos no array do modelo e na representação JSON. Todos os atributos que não estiverem presentes no array `$visible` serão ocultados quando o modelo for convertido em um array ou em JSON:

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
#### Mudar temporariamente a visibilidade de um atributo

 Se você quiser tornar alguns atributos normalmente ocultos visíveis em uma determinada instância de modelo, poderá usar o método `makeVisible`. O método `makeVisible` retorna a instância do modelo:

```php
    return $user->makeVisible('attribute')->toArray();
```

 Da mesma forma que no exemplo anterior, se você quiser ocultar alguns atributos que são normalmente visíveis, pode usar o método `makeHidden`.

```php
    return $user->makeHidden('attribute')->toArray();
```

 Se pretender ignorar temporariamente todos os atributos visíveis ou ocultos, pode usar as métodos `setVisible` e `setHidden`, respetivamente:

```php
    return $user->setVisible(['id', 'name'])->toArray();

    return $user->setHidden(['email', 'password', 'remember_token'])->toArray();
```

<a name="appending-values-to-json"></a>
## Adicionando valores ao JSON

 Às vezes, ao converter modelos para arrays ou JSON, talvez você deseje adicionar atributos que não tenham uma coluna correspondente em seu banco de dados. Para fazer isso, defina primeiro um [acessório](/docs/{{version}}/eloquent-mutators) para o valor:

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

 Se você preferir que o atributo seja sempre anexado aos arrays e representações JSON do modelo, adicione o nome dele à propriedade `appends` do seu modelo. Note que os nomes dos atributos são normalmente referenciados usando sua representação serializada em "snake case", mesmo que a metodologia PHP do accessor tenha sido definida usando "camel case":

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

 Depois que o atributo for adicionado à lista `appends`, ele será incluído tanto na representação em matriz quanto na JSON do modelo. Além disso, os atributos da lista `appends` também respeitarão as configurações de visibilidade e ocultação configuradas no modelo.

<a name="appending-at-run-time"></a>
#### Anexar na Hora de Execução

 Em tempo de execução, você pode instruir uma instância do modelo para adicionar atributos extras usando o método `append`. Ou, você pode usar o método `setAppends` para substituir a matriz completa de propriedades anexadas por uma determinada instância de modelo:

```php
    return $user->append('is_admin')->toArray();

    return $user->setAppends(['is_admin'])->toArray();
```

<a name="date-serialization"></a>
## Data de serialização

<a name="customizing-the-default-date-format"></a>
#### Personalizando o formato padrão de data

 Pode personalizar o formato de serialização padrão através da suplementação da metodologia `serializeDate`. Esta metodologia não afeta a forma como as datas são formatadas para armazenamento no banco de dados:

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
#### Personalizar o formato de data por atributo

 Você pode personalizar o formato de serialização dos atributos de data individuais do Eloquent, especificando o formato da data nas declarações de cast ([/docs/{{version}}/eloquent-mutators#attribute-casting]:

```php
    protected function casts(): array
    {
        return [
            'birthday' => 'date:Y-m-d',
            'joined_at' => 'datetime:Y-m-d H:00',
        ];
    }
```
