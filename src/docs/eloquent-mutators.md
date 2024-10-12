# Eloquent: Mutators/Casts

<a name="introduction"></a>
## Introdução

Accesores, mutadores e atributo de casting permitem que você transforme valores do Eloquent quando você os recupera ou define em instâncias do modelo. Por exemplo, você pode querer usar o [encriptador do Laravel](/docs/encryption) para criptografar um valor enquanto ele é armazenado no banco de dados, e então automaticamente decifrar o atributo quando você acessa-lo em um modelo Eloquent. Ou, você pode querer converter uma string JSON que está armazenada em seu banco de dados em uma matriz quando ela é acessada através do seu modelo Eloquent.

<a name="accessors-and-mutators"></a>
## Acessores e Mutadores

<a name="defining-an-accessor"></a>
### Definindo um Acessor

Um acessor transforma o valor de um atributo Eloquent quando é acessado. Para definir um acessor, crie um método protegido em seu modelo para representar o atributo acessível. O nome do método deve corresponder à representação "*camel case*" do verdadeiro atributo subjacente do modelo ou da coluna de banco de dados aplicável.

Neste exemplo, definiremos um acessor para o atributo `first_name`. O acessor será automaticamente chamado pelo Eloquent quando tentar-mos recuperar o valor do atributo `first_name`. Todos os métodos de acessores/mutadores de atributos devem declarar um *type-hint* de retorno de `Illuminate\Database\Eloquent\Casts\Attribute`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Casts\Attribute;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Obtenha o primeiro nome do usuário.
         */
        protected function firstName(): Attribute
        {
            return Attribute::make(
                get: fn (string $value) => ucfirst($value),
            );
        }
    }
```

Todos os métodos acessores retornam uma instância de `Attribute`, que define como o atributo será acessado e opcionalmente, modificado. Neste exemplo, estamos definindo apenas como o atributo será acessado. Para isso, fornecemos o argumento `get` para o construtor da classe `Attribute`.

Como você pode ver, o valor original da coluna é passado para o acessor, permitindo que você manipule e retorne o valor. Para acessar o valor do acessor, você simplesmente pode acessar o atributo `first_name` de uma instância de modelo:

```php
    use App\Models\User;

    $user = User::find(1);

    $firstName = $user->first_name;
```

::: info NOTA
Se você gostaria que os valores computados fossem adicionados à representação de *array*/JSON do seu modelo, [você precisará anexá-los](/docs/eloquent-serialization).
:::

<a name="building-value-objects-from-multiple-attributes"></a>
#### Construindo objetos de valor a partir de múltiplos atributos

Às vezes seu acessor pode precisar transformar múltiplos atributos do modelo em um "objeto valor" (*value object*). Para tanto, seu método `get` pode aceitar um segundo argumento `$attributes`, que será automaticamente fornecido e conterá um *array* com todos os atuais atributos do modelo:

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Interaja com o endereço do usuário.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    );
}
```

<a name="accessor-caching"></a>
#### Cache de acessos

Quando retornar objetos de valor do acessor, quaisquer alterações feitas no objeto de valor serão sincronizadas automaticamente para o modelo antes que ele seja salvo. Isso é possível porque o Eloquent retém instâncias retornadas pelo acessor para que ele possa retornar a mesma instância toda vez que o acessor for invocado:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->address->lineOne = 'Updated Address Line 1 Value';
    $user->address->lineTwo = 'Updated Address Line 2 Value';

    $user->save();
```

No entanto, você pode por vezes desejar ativar a cache para valores primitivos como *strings* e *boolean*s, especialmente se eles são computacionalmente intensivos. Para fazer isso, você pode chamar o método `shouldCache` ao definir seu acessor:

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

Se você gostaria de desativar o comportamento do cache de objeto dos atributos, você pode invocar o método `withoutObjectCaching` ao definir o atributo:

```php
/**
 * Interaja com o endereço do usuário.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    )->withoutObjectCaching();
}
```

<a name="defining-a-mutator"></a>
### Definindo um mutator

Um *Mutator* transforma um valor de atributo Eloquent quando ele é definido. Para definir um *Mutator*, você pode fornecer o argumento `set` ao definir seu atributo. Vamos definir um mutator para o atributo `first_name`. Este mutador será automaticamente chamado quando tentarmos definir o valor do atributo `first_name` no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Casts\Attribute;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Interaja com o primeiro nome do usuário.
         */
        protected function firstName(): Attribute
        {
            return Attribute::make(
                get: fn (string $value) => ucfirst($value),
                set: fn (string $value) => strtolower($value),
            );
        }
    }
```

O *closure* do mutador receberá o valor que está sendo definido no atributo, permitindo-lhe manipular o valor e retornar o valor manipulado. Para usar nosso mutador, precisamos definir apenas o atributo `first_name` em um modelo Eloquent:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->first_name = 'Sally';
```

No exemplo acima o callback `set` será chamado com o valor `Sally`. O mutador então aplicará a função `strtolower` no nome, e colocará seu resultado na matriz de atributos internos do modelo.

<a name="mutating-multiple-attributes"></a>
#### Múltiplos Atributos Mutáveis

Às vezes seu mutador pode precisar definir vários atributos no modelo subjacente. Para fazer isso, você pode retornar um *array* do closure `set`. Cada chave no *array* deve corresponder a um atributo ou coluna de banco de dados subjacente associado ao modelo.

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Interaja com o endereço do usuário.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
        set: fn (Address $value) => [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ],
    );
}
```

<a name="attribute-casting"></a>
## Cast de Atributos

O cast de tipos de atributos fornece funcionalidades semelhantes ao acessar e modificador sem exigir que você defina métodos adicionais em seu modelo. Em vez disso, o método `casts` do seu modelo oferece uma maneira conveniente de converter atributos em tipos comuns de dados.

O método `casts` deve retornar uma matriz onde a chave é o nome do atributo a ser convertido e o valor do tipo que você deseja que a coluna seja convertida. Os tipos de `cast` suportados são:

- `array`
- `AsStringable::class`
- `boolean`
- `collection`
- `date`
- `datetime`
- `immutable_date`
- `immutable_datetime`
- <code>decimal:&lt;precision&gt;</code>
- `double`
- `encrypted`
- `encrypted:array`
- `encrypted:collection`
- `encrypted:object`
- `float`
- `hashed`
- `integer`
- `object`
- `real`
- `string`
- `timestamp`

Para demonstrar atributo de `cast`, vamos usar o atributo `is_admin`, que está armazenado em nosso banco de dados como um inteiro (`0` ou `1`) para um valor booleano:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Obtenha os atributos que devem ser convertidos.
         *
         * @return array<string, string>
         */
        protected function casts(): array
        {
            return [
                'is_admin' => 'boolean',
            ];
        }
    }
```

Depois de ter definido o tipo da classe, o atributo `is_admin` será sempre um valor booleano quando for acessado, mesmo que o valor subjacente esteja armazenado no banco de dados como inteiro.

```php
    $user = App\Models\User::find(1);

    if ($user->is_admin) {
        // ...
    }
```

Se você precisar adicionar um novo, temporário "*cast*" em tempo de execução, você pode usar o método `mergeCasts`. Essas definições de *cast* serão adicionadas a qualquer um dos *casts* já definidos no modelo.

```php
    $user->mergeCasts([
        'is_admin' => 'integer',
        'options' => 'object',
    ]);
```

::: warning ATENÇÃO
Atributos que são `null` não serão convertidos. Além disso, você nunca deve definir um *cast* (ou atributo) com o mesmo nome de uma relação ou atribuir uma conversão à chave primária do modelo.
:::

<a name="stringable-casting"></a>
#### Cast com `Stringable`

Você pode usar a classe de `Illuminate\Database\Eloquent\Casts\AsStringable` para converter um atributo do modelo em um objeto de [string `Illuminate\Support\Stringable` fluente](/docs/strings#fluent-strings-method-list):

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Casts\AsStringable;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Obtenha os atributos que devem ser convertidos.
         *
         * @return array<string, string>
         */
        protected function casts(): array
        {
            return [
                'directory' => AsStringable::class,
            ];
        }
    }
```

<a name="array-and-json-casting"></a>
### Conversão de tipo Array e JSON

O cast de `array` é particularmente útil quando se trabalha com colunas armazenadas como serialização de JSON. Por exemplo, se seu banco de dados tem um tipo de campo `JSON` ou `TEXT` que contém serialização de JSON, adicionar o *cast* `array` a esse atributo irá automaticamente desserializar o atributo para uma matriz PHP quando você acessa esse atributo em seu modelo Eloquent:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Obtenha os atributos que devem ser convertidos.
         *
         * @return array<string, string>
         */
        protected function casts(): array
        {
            return [
                'options' => 'array',
            ];
        }
    }
```

Uma vez que o *cast* é definido, você pode acessar o atributo `options` e será automaticamente desserializado de JSON para uma matriz PHP. Quando você define o valor do atributo `options`, a matriz dada será automaticamente serializada de volta em JSON para armazenamento:

```php
    use App\Models\User;

    $user = User::find(1);

    $options = $user->options;

    $options['key'] = 'value';

    $user->options = $options;

    $user->save();
```

Para atualizar um único campo de um atributo JSON com uma sintaxe mais concisa, você pode [tornar o atributo *mass assignable*](/docs/eloquent#mass-assignment-json-columns) e usar o operador `->` ao chamar o método `update`:

```php
    $user = User::find(1);

    $user->update(['options->key' => 'value']);
```

<a name="array-object-and-collection-casting"></a>
#### Array, objeto e casting de coleção

Embora o `array` padrão seja suficiente para muitos aplicativos, tem algumas desvantagens. Desde que o `array` retorna um tipo base, é impossível mutar diretamente um deslocamento deste `array`. Por exemplo, o seguinte código irá disparar um erro de PHP.

```php
    $user = User::find(1);

    $user->options['key'] = $value;
```

Para resolver esse problema, o Laravel oferece um *casting* que faz com que seus atributos JSON sejam convertidos para uma classe [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php). Esta funcionalidade é implementada usando a implementação de *casting* personalizada do Laravel, que permite ao framework cachear e converter com inteligência o objeto mutado, de modo que os deslocamentos individuais possam ser modificados sem acionar um erro PHP. Para utilizar o *casting* `AsArrayObject`, basta atribuir este casting para um atributo:

```php
    use Illuminate\Database\Eloquent\Casts\AsArrayObject;

    /**
     * Obtenha os atributos que devem ser convertidos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => AsArrayObject::class,
        ];
    }
```

Da mesma forma, o Laravel oferece um *cast* `AsCollection` que transforma seu atributo JSON em uma instância de [Collection](/docs/coleções):

```php
    use Illuminate\Database\Eloquent\Casts\AsCollection;

    /**
     * Obtenha os atributos que devem ser convertidos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => AsCollection::class,
        ];
    }
```

Se você gostaria que o `AsCollection` fosse uma instância de uma classe personalizada em vez da classe base de coleções do Laravel, você pode fornecer o nome da classe da coleção como um argumento de casting:

```php
    use App\Collections\OptionCollection;
    use Illuminate\Database\Eloquent\Casts\AsCollection;

    /**
     * Obtenha os atributos que devem ser convertidos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => AsCollection::using(OptionCollection::class),
        ];
    }
```

<a name="date-casting"></a>
### Cast de Datas

Por padrão, o Eloquent irá converter as colunas `created_at` e `updated_at` em instâncias de [Carbon](https://github.com/briannesbitt/Carbon), que estende a classe PHP `DateTime` e fornece um conjunto de métodos úteis. Você pode fazer *cast* de atributos de data adicionais definindo mais casts de data dentro do método `casts` do seu modelo. Geralmente, as datas devem ser convertidas usando os tipos de *cast* `datetime` ou `immutable_datetime`.

Quando definindo um casting de `date` ou `datetime`, você também pode especificar o formato da data. Este formato será utilizado quando o [modelo for serializado em um *array* ou *json*](/docs/eloquent-serialization):

```php
    /**
     * Obtenha os atributos que devem ser convertidos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime:Y-m-d',
        ];
    }
```

Ao converter uma coluna como data, você pode definir o valor do atributo de modelo correspondente para um timestamp UNIX, uma string de data (`Y-m-d`), uma string de data/hora ou uma instância `DateTime` / `Carbon`. O valor da data será convertido e armazenado corretamente no seu banco de dados.

Você pode personalizar o formato de serialização padrão para todas as datas do seu modelo definindo um método `serializeDate` no seu modelo. Este método não afeta como suas datas são formatadas para armazenamento no banco de dados:

```php
    /**
     * Prepare uma data para serialização de array/JSON.
     */
    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }
```

Para especificar o formato que você deve utilizar ao realmente armazenar os dados de um modelo dentro do seu banco de dados, você deve definir uma propriedade `$dateFormat` no modelo.

```php
    /**
     * O formato de armazenamento das colunas de data do modelo.
     *
     * @var string
     */
    protected $dateFormat = 'U';
```

<a name="date-casting-and-timezones"></a>
#### Conversão de Data, Serialização e Fuso horário

Por padrão, os casts `date` e `datetime` serializarão datas para uma string de data ISO-8601 (`YYYY-MM-DDTHH:MM:SS.uuuuuuZ`), independentemente do *timezone* especificado na opção de configuração do `timezone` no seu aplicativo. É fortemente recomendado usar sempre esse formato de serialização, bem como armazenar as datas do seu aplicativo na UTC não alterando a opção de configuração `timezone` do seu aplicativo de seu valor padrão 'UTC'. Usar consistentemente a zona horária UTC ao longo do seu aplicativo proporcionará o nível máximo de interoperabilidade com bibliotecas de manipulação de datas escritas em PHP e JavaScript.

Se um formato personalizado é aplicado ao `data` ou `datetime` cast, como por exemplo `datetime:Y-m-d H:i:s`, a zona horária interna do Carbon instance será usada durante a serialização da data. Normalmente, este será o fuso horário especificado na configuração de `timezone` do seu aplicativo.

<a name="enum-casting"></a>
### Cast do tipo `Enum`

A Eloquent também permite que você faça a conversão de seus valores de atributos para [Enums](https://www.php.net/manual/pt_br/language.enumerations.backed.php) PHP na sua classe `casts` do modelo:

```php
    use App\Enums\ServerStatus;

    /**
     * Obtenha os atributos que devem ser convertidos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ServerStatus::class,
        ];
    }
```

Uma vez que você tenha definido o tipo de dados na sua classe modelo, o atributo especificado será automaticamente convertido entre um tipo *enum* e outro ao interagir com ele.

```php
    if ($server->status == ServerStatus::Provisioned) {
        $server->status = ServerStatus::Ready;

        $server->save();
    }
```

<a name="casting-arrays-of-enums"></a>
#### Conversão de Arrays de Enum

Às vezes, você pode precisar de seu modelo para armazenar uma matriz de valores `enum` dentro de uma única coluna. Para fazer isso, você pode usar os *casts* `AsEnumArrayObject` ou `AsEnumCollection` fornecidos pelo Laravel:

```php
    use App\Enums\ServerStatus;
    use Illuminate\Database\Eloquent\Casts\AsEnumCollection;

    /**
     * Obtenha os atributos que devem ser convertidos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'statuses' => AsEnumCollection::of(ServerStatus::class),
        ];
    }
```

<a name="encrypted-casting"></a>
### Cast de de valores encriptados

A função `encrypted` criptografará o valor do atributo de um modelo usando os recursos de [criptografia](/docs/encryption) incorporados no Laravel. Além disso, as funções `encrypted:array`, `encrypted:collection`, `encrypted:object`, `AsEncryptedArrayObject` e `AsEncryptedCollection` funcionam como suas contrapartes não criptografadas; todavia, como você pode esperar, o valor subjacente é criptografado quando armazenado no seu banco de dados.

Como o comprimento final do texto cifrado não é previsível e é maior que o seu equivalente em texto simples, certifique-se de que a coluna de banco de dados associada é `TEXT` ou maior. Além disso, pois os valores são criptografados no banco de dados, você não poderá consultar ou pesquisar valores de atributo cifrados.

<a name="key-rotation"></a>
#### Rotação de Chaves

Como você pode saber, o Laravel encripta as strings usando o valor de configuração `key` especificado no arquivo de configuração do seu aplicativo chamado `app`. Normalmente, esse valor corresponde ao valor da variável de ambiente `APP_KEY`. Se você precisar girar a chave de encriptação do seu aplicativo, você precisará re-encriptar manualmente seus atributos encriptados usando a nova chave.

<a name="query-time-casting"></a>
### Conversão de query time

Às vezes, você pode precisar aplicar *cast* enquanto executa uma consulta, como quando selecionar um valor bruto de uma tabela. Por exemplo, considere a seguinte consulta:

```php
    use App\Models\Post;
    use App\Models\User;

    $users = User::select([
        'users.*',
        'last_posted_at' => Post::selectRaw('MAX(created_at)')
                ->whereColumn('user_id', 'users.id')
    ])->get();
```

O atributo `last_posted_at` nos resultados dessa consulta será uma string simples. Seria ótimo se pudéssemos aplicar um cast para o tipo `datetime` a esse atributo ao executar a consulta. Felizmente, podemos alcançar isso usando o método `withCasts`:

```php
    $users = User::select([
        'users.*',
        'last_posted_at' => Post::selectRaw('MAX(created_at)')
                ->whereColumn('user_id', 'users.id')
    ])->withCasts([
        'last_posted_at' => 'datetime'
    ])->get();
```

<a name="custom-casts"></a>
## Casts Personalizados

Laravel possui uma variedade de tipos de *cast* úteis e incorporados; no entanto, você pode precisar ocasionalmente definir seu próprio tipo de *cast*. Para criar um novo *cast*, execute o comando Artisan `make:cast`. A nova classe de *cast* será colocada em sua pasta `app/Casts`:

```shell
php artisan make:cast Json
```

Todas as classes de *casting* personalizadas implementam a interface `CastsAttributes`. Classes que implementam essa interface devem definir um método `get` e `set`. O método `get` é responsável por transformar um valor bruto do banco em um valor de *casting*, enquanto o método `set` deve transformar um valor de *casting* em um valor bruto que pode ser armazenado no banco. Como exemplo, vamos re-implementar o tipo de casting interno `json` como um tipo de casting personalizado:

```php
    <?php

    namespace App\Casts;

    use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
    use Illuminate\Database\Eloquent\Model;

    class Json implements CastsAttributes
    {
        /**
         * Converta o valor fornecido.
         *
         * @param  array<string, mixed>  $attributes
         * @return array<string, mixed>
         */
        public function get(Model $model, string $key, mixed $value, array $attributes): array
        {
            return json_decode($value, true);
        }

        /**
         * Prepare o valor fornecido para armazenamento.
         *
         * @param  array<string, mixed>  $attributes
         */
        public function set(Model $model, string $key, mixed $value, array $attributes): string
        {
            return json_encode($value);
        }
    }
```

Depois de ter definido um tipo de *cast* personalizado você pode anexá-lo a um atributo de modelo usando o nome da classe:

```php
    <?php

    namespace App\Models;

    use App\Casts\Json;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Obtenha os atributos que devem ser convertidos.
         *
         * @return array<string, string>
         */
        protected function casts(): array
        {
            return [
                'options' => Json::class,
            ];
        }
    }
```

<a name="value-object-casting"></a>
### Casting em Valor de Objeto

Você não está limitado a converter valores para tipos primitivos. Você também pode converter valores para objetos. Definir conversões personalizadas que convertem valores para objetos é muito semelhante à conversão para tipos primitivos; no entanto, o método `set` deve retornar uma matriz de pares de chave/valor que serão usados ​​para definir valores brutos e armazenáveis ​​no modelo.

Como exemplo, definiremos uma classe de conversão personalizada que converte vários valores de modelo em um único objeto de valor `Address`. Assumiremos que o valor `Address` tem duas propriedades públicas: `lineOne` e `lineTwo`:

```php
    <?php

    namespace App\Casts;

    use App\ValueObjects\Address as AddressValueObject;
    use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
    use Illuminate\Database\Eloquent\Model;
    use InvalidArgumentException;

    class Address implements CastsAttributes
    {
        /**
         * Converta o valor fornecido.
         *
         * @param  array<string, mixed>  $attributes
         */
        public function get(Model $model, string $key, mixed $value, array $attributes): AddressValueObject
        {
            return new AddressValueObject(
                $attributes['address_line_one'],
                $attributes['address_line_two']
            );
        }

        /**
         * Prepare o valor fornecido para armazenamento.
         *
         * @param  array<string, mixed>  $attributes
         * @return array<string, string>
         */
        public function set(Model $model, string $key, mixed $value, array $attributes): array
        {
            if (! $value instanceof AddressValueObject) {
                throw new InvalidArgumentException('The given value is not an Address instance.');
            }

            return [
                'address_line_one' => $value->lineOne,
                'address_line_two' => $value->lineTwo,
            ];
        }
    }
```

Ao converter para objetos de valor, quaisquer alterações feitas no objeto de valor serão automaticamente sincronizadas de volta para o modelo antes que o modelo seja salvo:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->address->lineOne = 'Updated Address Value';

    $user->save();
```

::: info NOTA
Se você planeja serializar seus modelos Eloquent contendo objetos de valor para JSON ou matrizes, você deve implementar as interfaces `Illuminate\Contracts\Support\Arrayable` e `JsonSerializable` no objeto.
:::

<a name="value-object-caching"></a>
#### Cache de *Value Object*

Quando atributos que são convertidos para objetos de valor são resolvidos, eles são armazenados em cache pelo Eloquent. Portanto, a mesma instância de objeto será retornada se o atributo for acessado novamente.

Se você quiser desabilitar o comportamento de cache de objetos de classes de conversão personalizadas, você pode declarar uma propriedade pública `withoutObjectCaching` em sua classe de conversão personalizada:

```php
class Address implements CastsAttributes
{
    public bool $withoutObjectCaching = true;

    // ...
}
```

<a name="array-json-serialization"></a>
### Serialização de Array / JSON

Ao converter um modelo Eloquent a uma matriz ou JSON usando os métodos `toArray` e `toJson`, seus objetos de valor de tipo personalizado serão tipicamente serializados também, desde que eles implementem as interfaces `Illuminate\Contracts\Support\Arrayable` e `JsonSerializable`. No entanto, quando se usa objetos de valor fornecidos por bibliotecas de terceiros, talvez você não tenha a capacidade de adicionar essas interfaces ao objeto.

Portanto, você pode especificar que sua classe de tipo personalizado será responsável pela serialização do objeto de valor. Para fazer isso, sua classe de tipo personalizado deve implementar a interface `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes`. Esta interface afirma que sua classe deve conter um método `serialize` que devolve o formato serializado do seu objeto de valor:

```php
    /**
     * Obtenha a representação serializada do valor.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function serialize(Model $model, string $key, mixed $value, array $attributes): string
    {
        return (string) $value;
    }
```

<a name="inbound-casting"></a>
### Casting de entrada

Ocasionalmente, você pode precisar escrever uma classe de cast personalizada que transforma apenas valores que estão sendo definidos no modelo e não executa nenhuma operação quando atributos estão sendo recuperados do modelo.

Casts personalizados somente de entrada devem implementar a interface `CastsInboundAttributes`, que requer apenas que um método `set` seja definido. O comando Artisan `make:cast` pode ser invocado com a opção `--inbound` para gerar uma classe de *cast* somente de entrada:

```shell
php artisan make:cast Hash --inbound
```

Um exemplo clássico de um *cast* somente de entrada é um *cast* de "hashing". Por exemplo, podemos definir um *cast* que faz hash de valores de entrada por meio de um algoritmo dado:

```php
    <?php

    namespace App\Casts;

    use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;
    use Illuminate\Database\Eloquent\Model;

    class Hash implements CastsInboundAttributes
    {
        /**
         * Crie uma nova instância de classe de conversão.
         */
        public function __construct(
            protected string|null $algorithm = null,
        ) {}

        /**
         * Prepare o valor fornecido para armazenamento.
         *
         * @param  array<string, mixed>  $attributes
         */
        public function set(Model $model, string $key, mixed $value, array $attributes): string
        {
            return is_null($this->algorithm)
                        ? bcrypt($value)
                        : hash($this->algorithm, $value);
        }
    }
```

<a name="cast-parameters"></a>
### Parâmetros do Cast

Ao anexar um *cast* personalizado a um modelo, os parâmetros de *cast* podem ser especificados separando-os do nome da classe usando um caractere `:` e delimitando vários parâmetros por vírgula. Os parâmetros serão passados ​​para o construtor da classe de *cast*:

```php
    /**
     * Obtenha os atributos que devem ser convertidos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'secret' => Hash::class.':sha256',
        ];
    }
```

<a name="castables"></a>
### Castables

Talvez você queira permitir que os objetos de valor do seu aplicativo definam suas próprias classes de cast personalizadas. Em vez de anexar a classe de cast personalizada ao seu modelo, você pode, alternativamente, anexar uma classe de objeto de valor que implemente a interface `Illuminate\Contracts\Database\Eloquent\Castable`:

```php
    use App\ValueObjects\Address;

    protected function casts(): array
    {
        return [
            'address' => Address::class,
        ];
    }
```

Objetos que implementam a interface `Castable` devem definir um método `castUsing` que retorna o nome da classe de caster personalizada responsável pela conversão de e para a classe `Castable`:

```php
    <?php

    namespace App\ValueObjects;

    use Illuminate\Contracts\Database\Eloquent\Castable;
    use App\Casts\Address as AddressCast;

    class Address implements Castable
    {
        /**
         * Obtenha o nome da classe de cast a ser usada ao converter de / para este item.
         *
         * @param  array<string, mixed>  $arguments
         */
        public static function castUsing(array $arguments): string
        {
            return AddressCast::class;
        }
    }
```

Ao usar classes `Castable`, você ainda pode fornecer argumentos na definição do método `casts`. Os argumentos serão passados para o método `castUsing`:

```php
    use App\ValueObjects\Address;

    protected function casts(): array
    {
        return [
            'address' => Address::class.':argument',
        ];
    }
```

<a name="anonymous-cast-classes"></a>
#### Classes anônimas & Castables

Ao combinar "castables" com as [classes anônimas](https://www.php.net/manual/en/language.oop5.anonymous.php) do PHP, você pode definir um objeto de valor e sua lógica de conversão como um único objeto *castable*. Para fazer isso, retorne uma classe anônima do método `castUsing` do seu objeto de valor. A classe anônima deve implementar a interface `CastsAttributes`:

```php
    <?php

    namespace App\ValueObjects;

    use Illuminate\Contracts\Database\Eloquent\Castable;
    use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

    class Address implements Castable
    {
        // ...

        /**
         * Obtenha o nome da classe de cast a ser usada ao converter de / para este item.
         *
         * @param  array<string, mixed>  $arguments
         */
        public static function castUsing(array $arguments): CastsAttributes
        {
            return new class implements CastsAttributes
            {
                public function get(Model $model, string $key, mixed $value, array $attributes): Address
                {
                    return new Address(
                        $attributes['address_line_one'],
                        $attributes['address_line_two']
                    );
                }

                public function set(Model $model, string $key, mixed $value, array $attributes): array
                {
                    return [
                        'address_line_one' => $value->lineOne,
                        'address_line_two' => $value->lineTwo,
                    ];
                }
            };
        }
    }
```
