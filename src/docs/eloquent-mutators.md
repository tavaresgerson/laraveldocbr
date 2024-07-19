# Eloquent: Mutadores e Casteamento

<a name="introduction"></a>
## Introdução

 Os acessores e mutadores permitem que você transforme valores de atributos Eloquent ao recuperá-los ou definí-los nas instâncias do modelo. Por exemplo, você pode querer usar o [criptografador Laravel](/docs/encryption) para criptografar um valor enquanto ele está armazenado no banco de dados e então decifrar automaticamente o atributo quando acessá-lo em uma instância do modelo Eloquent. Ou, você pode querer converter uma string JSON que está armazenada em seu banco de dados para um array ao ser acessado através de sua instância do modelo Eloquent.

<a name="accessors-and-mutators"></a>
## Acessores e mutadores

<a name="defining-an-accessor"></a>
### Definindo um acesso

 Um accessor transforma um valor do atributo Eloquent quando é acessado. Para definir um accessor, crie uma método protegido no seu modelo para representar o atributo acessível. Esse nome de método deve corresponder à representação "palavra-chave em maiúsculas" do verdadeiro atributo subjacente do modelo/coluna do banco de dados, conforme aplicável.

 Neste exemplo, definiremos um acessor para o atributo `first_name`. O acessor será chamado automaticamente pelo Eloquent ao tentar recuperar o valor do atributo `first_name`. Todos os métodos de acesso/mutação aos atributos devem declarar uma indicação do tipo de retorno como `Illuminate\Database\Eloquent\Casts\Attribute`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Casts\Attribute;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Get the user's first name.
         */
        protected function firstName(): Attribute
        {
            return Attribute::make(
                get: fn (string $value) => ucfirst($value),
            );
        }
    }
```

 Todos os métodos de acessor retornam uma instância `Attribute`, que define como o atributo será acessado e, opcionalmente, alterado. Neste exemplo, estamos apenas definindo como o atributo será acessado. Para isso, fornecemos o argumento `get` ao construtor da classe `Attribute`.

 Como podem verificar, o valor original da coluna é passado ao atributo de acesso, permitindo-lhe assim manipular e reter o valor. Para terem acesso ao valor do atributo de acesso, podem simplesmente aceder ao atributo `first_name` numa instância do modelo:

```php
    use App\Models\User;

    $user = User::find(1);

    $firstName = $user->first_name;
```

 > [!NOTA]
 [você vai precisar anexá-los] (//docs/eloquent-serialization/).

<a name="building-value-objects-from-multiple-attributes"></a>
#### Criação de objetos de valor a partir de vários atributos

 Algumas vezes, é necessário transformar vários atributos de um modelo num único "objeto com valor". Para isso, a função `get` pode aceitar um segundo argumento `$attributes`, que será automaticamente fornecido ao closure e conterá uma matriz contendo todos os atributos do modelo.

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Interact with the user's address.
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
#### Armazenagem de acessórios

 Ao retornar objetos de valor dos acessores, as alterações feitas ao objeto de valor são automaticamente sincronizadas com o modelo antes que este seja salvo. Isso é possível porque Eloquent mantém as instâncias retornadas pelos acessores para poder retornar sempre a mesma instância cada vez que o acessor for invocado:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->address->lineOne = 'Updated Address Line 1 Value';
    $user->address->lineTwo = 'Updated Address Line 2 Value';

    $user->save();
```

 No entanto, às vezes poderá pretender ativar a funcionalidade de armazenamento em cache para valores primitivos como string e booleanos, nomeadamente quando se tratam de cálculos intensivos. Para conseguir isto, poderá chamar o método `shouldCache` ao definir o seu acessor:

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

 Se você quiser desativar o comportamento de armazenamento em cache de objetos dos atributos, pode invocar o método `withoutObjectCaching` ao definir o atributo:

```php
/**
 * Interact with the user's address.
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
### Definindo um mutador

 Um mutador transforma o valor de um atributo Eloquent ao ser definido. Para definir um mutador, você pode fornecer o argumento "set" quando estiver definindo seu atributo. Vamos definir um mutador para o atributo "first_name". Este mutador é chamado automaticamente quando tentarmos definir o valor do atributo "first_name" no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Casts\Attribute;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Interact with the user's first name.
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

 O closure do mutator receberá o valor que está sendo definido no atributo, permitindo a manipulação desse valor. Para usar nosso mutator, só precisamos definir o atributo `first_name` em um modelo Eloquent:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->first_name = 'Sally';
```

 No exemplo a seguir, o callback `set` será chamado com o valor `Sally`. O mutator aplicará então a função `strtolower` ao nome e definirá o seu resultado como um novo valor no array interno `$attributes` do modelo.

<a name="mutating-multiple-attributes"></a>
#### Mutação de vários atributos

 Às vezes, o seu mutator pode precisar definir vários atributos no modelo subjacente. Para isso, você pode retornar um array a partir do closure `set`. Cada chave no array deve corresponder com um atributo subjacente / coluna de banco de dados associado ao modelo:

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Interact with the user's address.
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
## Atribuição de atributos

 O atributo casting permite uma funcionalidade semelhante à de acessores e mutadores, mas sem exigir que você defina nenhum método adicional em seu modelo. Em vez disso, o método `casts` do modelo fornece um modo conveniente de converter atributos para tipos de dados comuns.

 O método `casts` deve retornar um array, onde o nome do atributo que está sendo convertido é a chave e o tipo ao qual você quer converter a coluna é o valor. Os tipos de conversão suportados são:

<div class="content-list" markdown="1">

 - ``array``
 - `AsStringable::class`
 - `boolean`
 - "coleção"
 `- `date`
 - "datetime"
 - `immutable_date`
 - `imutável_data_e_hora`
- <code>decimal:&lt;precision&gt;</code>
 - ``doble``
 `- `cifrado`
 - ``encrypted:array``
 - `encrypted:collection`
 - `encriptado: objeto`
 - `float`
 - `hashed`
 - `inteiro`
 - ``objeto``
 - ``real``
 - `` string ''
 - `timestamp`

</div>

 Para demonstrar o mapeamento de atributos, vamos mapear o atributo "is_admin", que está armazenado em nossa base de dados como um número inteiro (0 ou 1) para um valor boolean:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Get the attributes that should be cast.
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

 Depois de definir o elenco, o atributo `is_admin` será sempre convertido para um valor verdadeiro ou falso ao ser acessado, mesmo se o valor subjacente for armazenado no banco de dados como número inteiro:

```php
    $user = App\Models\User::find(1);

    if ($user->is_admin) {
        // ...
    }
```

 Se você precisar adicionar um novo e temporário casting em tempo de execução, poderá usar o método `mergeCasts`. Essas definições de casting serão adicionadas a qualquer um dos castings já definidos no modelo:

```php
    $user->mergeCasts([
        'is_admin' => 'integer',
        'options' => 'object',
    ]);
```

 > [AVERTISSEMENT]
 > Os atributos com valor nulo não serão convertidos. Além disso, você nunca deve definir uma conversão (ou um atributo) com o mesmo nome de uma relação ou atribuir uma conversão ao principal chave do modelo.

<a name="stringable-casting"></a>
#### Encenação em Stringable

 Você pode usar a classe de casting `Illuminate\Database\Eloquent\Casts\AsStringable` para converter um atributo do modelo em um objeto [fluent `Illuminate\Support\Stringable`](/docs/strings#fluent-strings-method-list):

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Casts\AsStringable;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Get the attributes that should be cast.
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
### Transposição de matrizes e JSON

 O tipo de dados `array` é especialmente útil quando se trabalha com colunas armazenadas como JSON serializado. Por exemplo, se o seu banco de dados possuir um tipo de campo `JSON` ou `TEXT`, que contenham JSON serializado, adicionando o tipo de dados `array` a esse atributo, o mesmo será automaticamente deserializado em um array PHP quando você o consulter no seu modelo Eloquent:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Get the attributes that should be cast.
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

 Depois de definido o valor, você pode acessar o atributo `options`. O valor será automaticamente deserializado de um array PHP para um formato JSON. Ao configurar o valor do atributo `options`, o array fornecido será automaticamente serializado novamente em JSON para armazenamento:

```php
    use App\Models\User;

    $user = User::find(1);

    $options = $user->options;

    $options['key'] = 'value';

    $user->options = $options;

    $user->save();
```

 Para atualizar um único campo de um atributo JSON com uma sintaxe mais concisa, você pode [tornar o atributo massificável](/docs/eloquent#mass-assignment-json-columns) e usar o operador `->` ao chamar o método `update`:

```php
    $user = User::find(1);

    $user->update(['options->key' => 'value']);
```

<a name="array-object-and-collection-casting"></a>
#### Objeto de matriz e conversão de coleções

 Apesar do casting padrão `array` ser suficiente para muitas aplicações, possui algumas desvantagens. Uma vez que o casting `array` retorna um tipo primitivo, não é possível mutar diretamente um offset do array. O código a seguir irá gerar um erro PHP:

```php
    $user = User::find(1);

    $user->options['key'] = $value;
```

 Para resolver isto, o Laravel oferece um "cast" de tipo `AsArrayObject` que transforma os atributos JSON em classes [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php). Esta funcionalidade é implementada com a utilização da aplicação de casting personalizada do Laravel, o que permite ao Laravel criar um cache inteligente e transformar objetos mutados para que os seus índices sejam alteráveis sem desencadear um erro PHP. Para utilizar o "cast" `AsArrayObject`, basta atribuí-lo a um atributo:

```php
    use Illuminate\Database\Eloquent\Casts\AsArrayObject;

    /**
     * Get the attributes that should be cast.
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

 Da mesma forma, o Laravel oferece um casting para uma instância de coleção do Laravel através da função `AsCollection`:

```php
    use Illuminate\Database\Eloquent\Casts\AsCollection;

    /**
     * Get the attributes that should be cast.
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

 Se você deseja que o tipo de casting `AsCollection` instancie uma classe de coleção personalizada em vez da classe de coleção básica do Laravel, pode fornecer o nome da classe como um argumento de tipo de casting:

```php
    use App\Collections\OptionCollection;
    use Illuminate\Database\Eloquent\Casts\AsCollection;

    /**
     * Get the attributes that should be cast.
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
### Dates de elaboração

 Por padrão, Eloquent irá convertir as colunas `created_at` e `updated_at` em instâncias de [Carbon](https://github.com/briannesbitt/Carbon), que estende a classe PHP `DateTime` (Datetime) e fornece um conjunto de métodos úteis. Você pode converter atributos adicionais de data definindo conversões adicionais dentro do método `casts` do seu modelo. Normalmente, as datas devem ser convertidas usando os tipos de cast `datetime` ou `immutable_datetime`.

 Ao definir um tipo de data ou data e hora, é possível especificar também o formato da data. Esse formato será usado ao [sériealizar o modelo para um array ou JSON](/docs/eloquent-serialization):

```php
    /**
     * Get the attributes that should be cast.
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

 Quando uma coluna é definida como data, você pode definir o valor do atributo correspondente no modelo para um timestamp UNIX, uma string de data (`Y-m-d`), uma string de data-hora ou uma instância `DateTime` / `Carbon`. O valor da data será convertido e armazenado corretamente em sua base de dados.

 Você pode personalizar o formato de serialização padrão para todas as datas do modelo definindo um método `serializeDate` em seu modelo. Esse método não afeta a forma como as datas são formatadas para armazenamento no banco de dados:

```php
    /**
     * Prepare a date for array / JSON serialization.
     */
    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }
```

 Para especificar o formato que deve ser usado ao armazenar as datas do modelo em sua base de dados, você deve definir uma propriedade `$dateFormat` no seu modelo.

```php
    /**
     * The storage format of the model's date columns.
     *
     * @var string
     */
    protected $dateFormat = 'U';
```

<a name="date-casting-and-timezones"></a>
#### Data de colocação, serialização e fusos horários

 Por padrão, as conversões `date` e `datetime` serializarão as datas como uma string de data ISO-8601 UTC (`AÑO-MES-DIA HORA:MINUTO:SEGUNDOS.uuuuuuZ`), independentemente do fuso horário especificado na opção de configuração `timezone` da sua aplicação. Recomendamos vivamente que utilize sempre este formato de serialização, além de armazenar as datas da sua aplicação no fuso UTC sem alterar a opção de configuração `timezone` para um valor diferente do padrão `UTC`. Ao utilizar consistentemente o fuso UTC em toda a sua aplicação, poderá beneficiar de o nível máximo de interoperabilidade com outras bibliotecas de manipulação de datas escritas em PHP e JavaScript.

 Se um formato personalizado for aplicado ao casting `date` ou `datetime`, como `datetime:Y-m-d H:i:s`, o fuso horário interno da instância Carbon será usado durante a serialização de datas. Normalmente, este será o fuso horário especificado na opção de configuração `timezone` do aplicativo.

<a name="enum-casting"></a>
### Estrutura de enumeração

 O Eloquent também permite que você atribua valores a um atributo em PHP [Enums](https://www.php.net/manual/en/language.enumerations.backed.php). Para fazer isso, especifique o atributo e o enumerador que você deseja mapear no método `casts` do seu modelo:

```php
    use App\Enums\ServerStatus;

    /**
     * Get the attributes that should be cast.
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

 Uma vez que você definir o tipo de um modelo, o atributo especificado será automaticamente mapeado para e a partir de um tipo enumerável durante as interações com o atributo:

```php
    if ($server->status == ServerStatus::Provisioned) {
        $server->status = ServerStatus::Ready;

        $server->save();
    }
```

<a name="casting-arrays-of-enums"></a>
#### Criando Conjuntos de Tabelas de Função de Vencimento em Serviços de Finanças

 Por vezes, pode ser necessário que o modelo armazene um conjunto de valores de tipo enumerado numa coluna única. Para conseguir isso, poderá utilizar os tipos de cast `AsEnumArrayObject` ou `AsEnumCollection`, fornecidos pelo Laravel:

```php
    use App\Enums\ServerStatus;
    use Illuminate\Database\Eloquent\Casts\AsEnumCollection;

    /**
     * Get the attributes that should be cast.
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
### Transmissão Encriptada

 O tipo de dados "encryptado" irá criptografar o valor do atributo do modelo usando os recursos internos de encriptação do Laravel. Além disso, os tipos de dados "encrypted:array", "encrypted:collection", "encrypted:object", "AsEncryptedArrayObject" e "AsEncryptedCollection" funcionam como os seus equivalentes não encriptados; contudo, o valor subjacente é encriptado quando armazenado na base de dados.

 Como o comprimento final do texto encriptado não é previsível e tem um comprimento superior ao da variante não encriptada, certifique-se de que a coluna do banco de dados associada tenha um tipo `TEXT` ou maior. Além disso, uma vez que os valores são encriptados no banco de dados, não será possível consultar ou pesquisar por valores de atributos encriptados.

<a name="key-rotation"></a>
#### Rotatividade das chaves

 Como você pode saber, o Laravel encripta strings usando o valor de configuração `key` especificado no arquivo de configuração da sua aplicação `app`. Normalmente, esse valor corresponde ao valor da variável de ambiente `APP_KEY`. Se você precisar alterar a chave de encriptação da sua aplicação, precisará reencriptar manualmente seus atributos com a nova chave.

<a name="query-time-casting"></a>
### Tempo de consulta da tabela de cotação

 Às vezes você pode precisar aplicar um bloqueio (cast) ao executar uma consulta, por exemplo, ao selecionar um valor bruto de uma tabela. Considere o exemplo a seguir:

```php
    use App\Models\Post;
    use App\Models\User;

    $users = User::select([
        'users.*',
        'last_posted_at' => Post::selectRaw('MAX(created_at)')
                ->whereColumn('user_id', 'users.id')
    ])->get();
```

 O atributo `last_posted_at` dos resultados desta consulta será uma simples string. Seria maravilhoso se pudéssemos aplicar um cast de `datetime` a esse atributo ao executarmos a consulta. Por sorte, podemos fazer isso usando o método `withCasts`:

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
## Fôrtes personalizados

 O Laravel possui vários tipos de castramento internos; no entanto, ocasionalmente podem ser necessários definir os próprios tipos de castramento. Para criar um castramento, execute o comando `make:cast`. A nova classe de castramento é salva na pasta `app/Casts`:

```shell
php artisan make:cast Json
```

 Todas as classes personalizadas de tipo de dados implementam a interface `CastsAttributes`. As classes que implementem esta interface devem definir um método `get` e outro `set`. O método `get` é responsável por transformar o valor bruto da base de dados num valor convertido, enquanto o método `set` deve converter um valor convertido em um valor bruto que possa ser armazenado na base de dados. Como exemplo, re-implementaremos o tipo de dados de conversão nativo `json` como um tipo de dados personalizado:

```php
    <?php

    namespace App\Casts;

    use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
    use Illuminate\Database\Eloquent\Model;

    class Json implements CastsAttributes
    {
        /**
         * Cast the given value.
         *
         * @param  array<string, mixed>  $attributes
         * @return array<string, mixed>
         */
        public function get(Model $model, string $key, mixed $value, array $attributes): array
        {
            return json_decode($value, true);
        }

        /**
         * Prepare the given value for storage.
         *
         * @param  array<string, mixed>  $attributes
         */
        public function set(Model $model, string $key, mixed $value, array $attributes): string
        {
            return json_encode($value);
        }
    }
```

 Depois de definir um tipo personalizado do tipo CAST, você pode associá-lo a um atributo do modelo usando o nome da classe:

```php
    <?php

    namespace App\Models;

    use App\Casts\Json;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Get the attributes that should be cast.
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
### Valor do objeto de caça-recompensas

 Você não está limitado a mapear valores para tipos primitivos. Pode também mapeá-los para objetos. Definição de mapeamentos personalizados que mapeiam valores para objetos é muito semelhante ao mapeamento para tipos primitivos; no entanto, o método `set` deve retornar um array de pares chave/valor a serem usados para definir valores armazenáveis ​​no modelo.

 Como exemplo, definiremos uma classe de conversão personalizada que converte vários valores do modelo em um único objeto de valor `Address`. Suponhamos que o valor `Address` tem duas propriedades públicas: `lineOne` e `lineTwo`:

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
         * Cast the given value.
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
         * Prepare the given value for storage.
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

 Ao criar objetos de valor como argumento para a função de cópia, as alterações feitas no objeto serão automaticamente sincronizadas com o modelo antes que este seja salvo:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->address->lineOne = 'Updated Address Value';

    $user->save();
```

 > [!NOTA]
 > Se você pretende serializar seus modelos Eloquent que contêm objetos de valor para JSON ou arrays, deve implementar as interfaces `Illuminate\Contracts\Support\Arrayable` e `JsonSerializable` no objeto de valor.

<a name="value-object-caching"></a>
#### Armazenamento em Memória de Objetos Com Valor

 Quando os atributos são convertidos em objetos de valor, eles são armazenados na memória por Eloquent. Portanto, se o atributo for acessado novamente, será retornada a mesma instância do objeto.

 Se você quiser desativar o comportamento de armazenamento em cache de objetos das classes personalizadas, pode declarar uma propriedade pública `withoutObjectCaching` em sua classe de conversão personalizada:

```php
class Address implements CastsAttributes
{
    public bool $withoutObjectCaching = true;

    // ...
}
```

<a name="array-json-serialization"></a>
### Matriz/Serialização JSON

 Quando um modelo Eloquent é convertido em um array ou JSON usando os métodos `toArray` e `toJson`, seus objetos de valor personalizados serão serializados desde que implementem as interfaces `Illuminate\Contracts\Support\Arrayable` e `JsonSerializable`. No entanto, ao usar objetos de valor fornecidos por bibliotecas de terceiros, você pode não poder adicionar estas interfaces aos objetos.

 Portanto, você pode especificar que sua classe de cast personalizada será responsável por serializar o objeto de valor. Para fazer isso, sua classe de cast personalizada deve implementar a interface `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes`. Essa interface afirma que sua classe deve conter um método `serialize` que deverá retornar o formato serializado do seu objeto de valor:

```php
    /**
     * Get the serialized representation of the value.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function serialize(Model $model, string $key, mixed $value, array $attributes): string
    {
        return (string) $value;
    }
```

<a name="inbound-casting"></a>
### Casting de Entrada

 Ocasionalmente, poderá ser necessário escrever uma classe de tipo personalizado que apenas transforma valores definidos no modelo e não executa operações quando os atributos são recuperados do modelo.

 Os tipos de dados personalizados com apenas entradas devem implementar a interface `CastsInboundAttributes`, que exige somente uma método `set`. O comando Artesanato `make:cast` pode ser invocado com a opção `--inbound" para gerar um tipo de dado personalizado com apenas entradas:

```shell
php artisan make:cast Hash --inbound
```

 Um exemplo clássico de um tipo que recebe apenas argumentos é o caso de uma função de "hashing". Por exemplo, podemos definir uma função que processe valores entrantes com base num algoritmo dado:

```php
    <?php

    namespace App\Casts;

    use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;
    use Illuminate\Database\Eloquent\Model;

    class Hash implements CastsInboundAttributes
    {
        /**
         * Create a new cast class instance.
         */
        public function __construct(
            protected string|null $algorithm = null,
        ) {}

        /**
         * Prepare the given value for storage.
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
### Parâmetros de lançamento

 Ao anexar um tipo personalizado a um modelo, pode especificar os parâmetros do tipo utilizando o separador `:` e com vírgula para delimitar vários parâmetros. Estes serão passados ao construtor da classe de tipo personalizado:

```php
    /**
     * Get the attributes that should be cast.
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
### Misturáveis em Forno

 Você pode permitir que os objetos de valores do seu aplicativo definam suas próprias classes de conversão personalizadas. Em vez de anexar a classe de conversão personalizada ao modelo, você poderá alternativamente anexar uma classe de valor que implemente a interface `Illuminate\Contracts\Database\Eloquent\Castable`:

```php
    use App\ValueObjects\Address;

    protected function casts(): array
    {
        return [
            'address' => Address::class,
        ];
    }
```

 Objetos que implementem a interface `Castable` devem definir um método `castUsing`, que retorna o nome da classe da classe de conversão personalizada, responsável por fazer a conversão para e a partir da classe `Castable`:

```php
    <?php

    namespace App\ValueObjects;

    use Illuminate\Contracts\Database\Eloquent\Castable;
    use App\Casts\Address as AddressCast;

    class Address implements Castable
    {
        /**
         * Get the name of the caster class to use when casting from / to this cast target.
         *
         * @param  array<string, mixed>  $arguments
         */
        public static function castUsing(array $arguments): string
        {
            return AddressCast::class;
        }
    }
```

 Ao usar as classes `Castable`, você pode ainda fornecer argumentos na definição da metodologia `casts`. Esses argumentos serão passados para a metodologia `castUsing`:

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
#### Componentes para moldagem e classes de objetos anónimos

 Combinando "castables" com [classes anônimas do PHP](https://www.php.net/manual/en/language.oop5.anonymous.php), você pode definir um objeto de valor e sua lógica de cascalhamento como um único objeto que pode ser cascado. Para conseguir isso, retorne uma classe anônima da `castUsing` método do seu objeto de valor. A classe anônima deve implementar a interface `CastsAttributes`:

```php
    <?php

    namespace App\ValueObjects;

    use Illuminate\Contracts\Database\Eloquent\Castable;
    use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

    class Address implements Castable
    {
        // ...

        /**
         * Get the caster class to use when casting from / to this cast target.
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
