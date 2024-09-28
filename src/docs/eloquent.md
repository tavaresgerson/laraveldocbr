# Eloquent: Começando

<a name="introduction"></a>
## Introdução

Laravel inclui o Eloquent, um mapeador relacional de objeto (ORM) que torna a interação com sua base de dados agradável. Ao usar o Eloquent, cada tabela do banco de dados tem um "Modelo" correspondente usado para interagir com essa tabela. Além de obter registros da tabela do banco de dados, os modelos Eloquent permitem inserir, atualizar e excluir registros dessa tabela também.

::: info Nota
Antes de começar, certifique-se de configurar uma conexão de banco de dados no seu arquivo de configuração do `config/database.php`. Para mais informações sobre a configuração do seu banco de dados, consulte [a documentação da configuração do banco de dados](/docs/database#configuration).
:::

#### Laravel Bootcamp

Se você é novo no Laravel, sinta-se à vontade para mergulhar no [bootcamp do Laravel](https://bootcamp.laravel.com). O bootcamp do Laravel o guiará para construir seu primeiro aplicativo Laravel usando Eloquent. É uma ótima maneira de ter um passeio em tudo que o Laravel e o Eloquent têm a oferecer.

<a name="generating-model-classes"></a>
## Geração de Classes de Modelo

Para começar, vamos criar um modelo Eloquent. Os modelos geralmente estão na pasta `app/Models` e estendem a classe `Illuminate\Database\Eloquent\Model`. Você pode usar o comando `make:model` do Artisan para gerar um novo modelo:

```shell
php artisan make:model Flight
```

Se você desejar gerar uma [migração de banco de dados](/docs/migrations) quando gerar o modelo, você pode usar a opção `--migration` ou `-m`:

```shell
php artisan make:model Flight --migration
```

Você pode gerar outros tipos de classe quando estiver criando um modelo como fábricas, *seeds*, políticas, controladores e formulários de solicitação. Além disso, essas opções podem ser combinadas para criar várias classes de uma só vez:

```shell
# Gere um modelo e uma classe FlightFactory...
php artisan make:model Flight --factory
php artisan make:model Flight -f

# Gere um modelo e uma classe FlightSeeder...
php artisan make:model Flight --seed
php artisan make:model Flight -s

# Gerar um modelo e uma classe FlightController...
php artisan make:model Flight --controller
php artisan make:model Flight -c

# Gerar um modelo, classe de recurso FlightController e classes de solicitação de formulário...
php artisan make:model Flight --controller --resource --requests
php artisan make:model Flight -crR

# Gerar um modelo e uma classe FlightPolicy...
php artisan make:model Flight --policy

# Gerar um modelo e uma migração, fábrica, semeador e controlador...
php artisan make:model Flight -mfsc

# Atalho para gerar um modelo, migração, fábrica, semeador, política, controlador e solicitações de formulário...
php artisan make:model Flight --all
php artisan make:model Flight -a

# Gerar um modelo de pivô...
php artisan make:model Member --pivot
php artisan make:model Member -p
```

<a name="inspecting-models"></a>
#### Inspecionando modelos

Às vezes pode ser difícil determinar todos os atributos e as relações de um modelo apenas olhando para o código. Em vez disso, tente usar o comando Artisan `model:show`, que fornece uma visão geral conveniente dos atributos e das relações do seu modelo:

```shell
php artisan model:show Flight
```

<a name="eloquent-model-conventions"></a>
## Convenções em Modelos Eloquent

Modelos gerados pelo comando `make:model` serão colocados no diretório `app/Models`. Vamos analisar uma classe básica de modelo e discutir algumas das convenções-chave do Eloquent:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        // ...
    }
```

<a name="table-names"></a>
### Nomes das tabelas

Depois de olhar o exemplo acima você pode ter notado que nós não dissemos ao Eloquent qual tabela do banco de dados corresponde a nosso modelo `Flight`. Por convenção, o  "snake case", nome plural da classe será usado como o nome da tabela, a menos que outro nome seja explicitamente especificado. Então, neste caso, o Eloquent irá assumir que o modelo `Flight` armazena registros na tabela `flights`, enquanto um modelo `AirTrafficController` armazenaria registros em uma tabela `air_traffic_controllers`.

Se a tabela do banco de dados correspondente ao seu modelo não segue essa convenção, você pode especificar manualmente o nome da tabela do modelo definindo uma propriedade `table` no modelo.

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * A tabela associada ao modelo.
         *
         * @var string
         */
        protected $table = 'my_flights';
    }
```

<a name="primary-keys"></a>
### Chaves Primárias

O Eloquent também assumirá que cada tabela do banco de dados correspondente a um modelo tem uma coluna de chave primária chamada `id`. Se necessário, você pode definir uma propriedade `$primaryKey` protegida em seu modelo para especificar uma coluna diferente que serve como sua chave primária:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * A chave primária associada à tabela.
         *
         * @var string
         */
        protected $primaryKey = 'flight_id';
    }
```

Além disso, o Eloquent assume que a chave primária é um valor inteiro incrementado, o que significa que o Eloquent irá automaticamente converter a chave primária em um inteiro. Se você quiser usar uma chave primária não incrementada ou não numérica você deve definir uma propriedade pública chamada `$incrementing` em seu modelo que está definido como `false`:

```php
    <?php

    class Flight extends Model
    {
        /**
         * Indica se o ID do modelo é de incremento automático.
         *
         * @var bool
         */
        public $incrementing = false;
    }
```

Se o modelo não for inteiro, você deve definir uma propriedade `$keyType` protegida no seu modelo. Essa propriedade deve ter um valor de `string`:

```php
    <?php

    class Flight extends Model
    {
        /**
         * O tipo de dados do ID da chave primária.
         *
         * @var string
         */
        protected $keyType = 'string';
    }
```

<a name="composite-primary-keys"></a>
#### Chave composta

O Eloquent exige que cada modelo tenha pelo menos um "ID" que o identifique de forma exclusiva, que pode servir como sua chave primária. As chaves primárias "compostas" não são suportadas pelos modelos Eloquent. Contudo, você é livre para adicionar índices exclusivos com múltiplas colunas às suas tabelas de banco, além da chave primária de identificação exclusiva da tabela.

<a name="uuid-and-ulid-keys"></a>
### Chaves UUID e ULID

Em vez de usar números incrementando automaticamente como suas chaves primárias de um modelo Eloquent, você pode optar por usar UUIDs em vez disso. Os UUID são identificadores alfanuméricos universalmente exclusivos que tem 36 caracteres de comprimento.

Se você gostaria que um modelo use uma chave UUID em vez de um inteiro incrementado automaticamente, você pode usar a *trait* `Illuminate\Database\Eloquent\Concerns\HasUuids` no modelo. Claro, você deve garantir que o modelo tenha uma [coluna de chave primária equivalente a UUID](/docs/migrations#column-method-uuid):

```php
    use Illuminate\Database\Eloquent\Concerns\HasUuids;
    use Illuminate\Database\Eloquent\Model;

    class Article extends Model
    {
        use HasUuids;

        // ...
    }

    $article = Article::create(['title' => 'Traveling to Europe']);

    $article->id; // "8f8e8478-9035-4d23-b9a7-62f4d2612ce5"
```

Por padrão, a _trait_ `HasUuids` irá gerar [UUIDs "ordenados"](/docs/strings#method-str-ordered-uuid) para seus modelos. Estes UUIDs são mais eficientes para armazenamento de banco de dados indexado, porque podem ser ordenados lexicograficamente.

Você pode substituir o processo de geração do UUID para um determinado modelo definindo o método `newUniqueId` no modelo. Além disso, você pode especificar quais colunas devem receber UUIDs, definindo um método `uniqueIds` no modelo:

```php
    use Ramsey\Uuid\Uuid;

    /**
     * Gere um novo UUID para o modelo.
     */
    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }

    /**
     * Obtenha as colunas que devem receber um identificador exclusivo.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['id', 'discount_code'];
    }
```

Se você quiser, você pode optar por utilizar "ULIDs" em vez de UUIDs. ULIDs são parecidos com UUIDs; no entanto, eles têm apenas 26 caracteres de comprimento. Tal como os UUIDs ordenados, ULIDs podem ser ordenados lexicograficamente para indexação eficiente do banco de dados. Para usar ULIDs, você deve utilizar a _trait_ `Illuminate\Database\Eloquent\Concerns\HasUlids` em seu modelo. Você também deve garantir que o modelo tenha uma [coluna primária equivalente a ULID](/docs/migrations#column-method-ulid):

```php
    use Illuminate\Database\Eloquent\Concerns\HasUlids;
    use Illuminate\Database\Eloquent\Model;

    class Article extends Model
    {
        use HasUlids;

        // ...
    }

    $article = Article::create(['title' => 'Traveling to Asia']);

    $article->id; // "01gd4d3tgrrfqeda94gdbtdk5c"
```

<a name="timestamps"></a>
### Timestamps

Por padrão, o Eloquent espera que existam as colunas `created_at` e `updated_at` na tabela correspondente do banco de dados do seu modelo. O Eloquent irá definir automaticamente os valores das colunas quando os modelos são criados ou atualizados. Se você não deseja que essas colunas sejam gerenciadas automaticamente pelo Eloquent, você deve definir uma propriedade `$timestamps` no seu modelo com um valor de `false`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * Indica se o modelo deve ter registro de data e hora.
         *
         * @var bool
         */
        public $timestamps = false;
    }
```

Se você precisar personalizar o formato de seus *timestamps* no modelo, defina a propriedade `$dateFormat` do seu modelo. Esta propriedade determina como os atributos de data são armazenados no banco de dados, bem como seu formato quando o modelo é serializado em um *array* ou *JSON*:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * O formato de armazenamento das colunas de data do modelo.
         *
         * @var string
         */
        protected $dateFormat = 'U';
    }
```

Se você precisa personalizar os nomes das colunas utilizadas para armazenar os _timestamps_, você pode definir as constantes `CREATED_AT` e `UPDATED_AT` na sua classe modelo.

```php
    <?php

    class Flight extends Model
    {
        const CREATED_AT = 'creation_date';
        const UPDATED_AT = 'updated_date';
    }
```

Se você gostaria de realizar operações de modelo sem alterar o carimbo de data/hora, você pode realizar as operações dentro de um método _closure_ dado ao método `withoutTimestamps`:

```php
    Model::withoutTimestamps(fn () => $post->increment('reads'));
```

<a name="database-connections"></a>
### Conexões de Banco de Dados

Por padrão, todos os modelos Eloquent usarão a conexão padrão configurada para seu aplicativo. Se você gostaria de especificar uma conexão diferente que deve ser usada quando estiver interagindo com um modelo específico, você deve definir a propriedade `$connection` no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * A conexão de banco de dados que deve ser usada pelo modelo.
         *
         * @var string
         */
        protected $connection = 'mysql';
    }
```

<a name="default-attribute-values"></a>
### Valores padrão de atributos

Por padrão, uma instância de modelo recém-instanciada não conterá nenhum valor de atributo. Se você gostaria de definir os valores padrão para alguns dos atributos do seu modelo, você pode definir uma propriedade `$attributes` no seu modelo. Os valores dos atributos colocados na matriz `$attributes` devem estar em seu formato bruto, "armazenável" como se eles foram lidos apenas a partir do banco de dados:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * Valores padrão do modelo para atributos.
         *
         * @var array
         */
        protected $attributes = [
            'options' => '[]',
            'delayed' => false,
        ];
    }
```

<a name="configuring-eloquent-strictness"></a>
### Configurando Eloquent estrito

Laravel oferece vários métodos que permitem configurar o comportamento e "restrições" do Eloquent em uma variedade de situações.

Em primeiro lugar, o método `preventLazyLoading` aceita um argumento *booleano* opcional que indica se deve-se evitar a carga preguiçosa. Por exemplo, você pode querer apenas desativar a carga preguiçosa em ambientes não-produção para que seu ambiente de produção continue funcionando normalmente mesmo se um relacionamento carregado preguiçosamente estiver presente no código de produção por acidente. Tipicamente, este método deve ser invocado no método `boot` do seu provedor de serviços de aplicação:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

Além disso, você pode instruir o Laravel a lançar uma exceção ao tentar preencher um atributo não preenchível invocando o método `preventSilentlyDiscardingAttributes`. Isso pode ajudar a evitar erros inesperados durante o desenvolvimento local quando estiver tentando definir um atributo que não foi adicionado na matriz `fillable` do modelo:

```php
Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
```

<a name="retrieving-models"></a>
## Recuperando Modelos

Uma vez que você tenha criado um modelo e sua [tabela de banco de dados associada](/docs/migrations#writing-migrations), você está pronto para começar a obter dados do seu banco de dados. Você pode pensar em cada modelo Eloquent como um poderoso [construtor de consultas](/docs/queries) permitindo-lhe consultar o banco de dados fluentemente na tabela de banco de dados associada ao modelo. O método `all` do modelo irá recuperar todos os registros da tabela de banco de dados associada ao modelo:

```php
    use App\Models\Flight;

    foreach (Flight::all() as $flight) {
        echo $flight->name;
    }
```

<a name="building-queries"></a>
#### Construção de consultas

O método `all` do Eloquent retornará todos os resultados da tabela do modelo. No entanto, como cada modelo Eloquent serve como um [construidor de consultas](/docs/queries), você pode adicionar restrições adicionais às consultas e depois invocar o método 'get' para obter os resultados:

```php
    $flights = Flight::where('active', 1)
                   ->orderBy('name')
                   ->take(10)
                   ->get();
```

::: info NOTA
Como os modelos Eloquent são construtores de consulta, você deve revisar todos os métodos fornecidos pelo [construtor de consulta](docs/queries) do Laravel. Você pode usar qualquer um desses métodos ao escrever suas consultas Eloquent.
:::

<a name="refreshing-models"></a>
#### Atualizando Modelos

Se já tiver uma instância de um modelo Eloquent que foi retirado do banco de dados, você pode "atualizar" o modelo usando os métodos `fresh` e `refresh`. O método `fresh` irá re-recuperar o modelo do banco de dados. A instância existente do modelo não será afetada:

```php
    $flight = Flight::where('number', 'FR 900')->first();

    $freshFlight = $flight->fresh();
```

O método `refresh` irá reidratar o modelo existente utilizando dados novos do banco de dados. Além disso, todas as suas relações carregadas também serão atualizadas:

```php
    $flight = Flight::where('number', 'FR 900')->first();

    $flight->number = 'FR 456';

    $flight->refresh();

    $flight->number; // "FR 900"
```

<a name="collections"></a>
### Coleções

Como vimos, métodos eloquentes como `all` e `get` recuperam vários registros do banco de dados. No entanto, esses métodos não retornam um array PHP simples. Em vez disso, é retornada uma instância de `Illuminate\Database\Eloquent\Collection`.

A classe Eloquent `Collection` estende a base `Illuminate\Support\Collection` do Laravel, que fornece uma [variedade de métodos úteis](/docs/collections#available-methods) para interagir com coleções de dados. Por exemplo, o método `reject` pode ser usado para remover modelos de uma coleção com base nos resultados de um closure invocado:

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function (Flight $flight) {
    return $flight->cancelled;
});
```

Além dos métodos fornecidos pela classe de coleção básica do Laravel, a classe de coleções Eloquent fornece [alguns métodos extras](/docs/eloquent-collections#available-methods) especificamente destinados para interagir com coleções de modelos Eloquent.

Como todas as coleções do Laravel implementam as interfaces iteráveis do PHP, você pode percorrer coleções como se elas fossem um *array*:

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### Resultados em Chunks

O seu aplicativo pode ficar sem memória se você tentar carregar dezenas de milhares de registros Eloquent através dos métodos `all` ou `get`. Em vez de usar esses métodos, o método `chunk` pode ser usado para processar grandes números de modelos de maneira mais eficiente.

O método `chunk` irá obter um subconjunto de modelos Eloquent, passando-os para uma função _closure_ para processamento. Como só é obtido o atual pedaço de modelos Eloquent por vez, o método `chunk` irá fornecer significativamente uso reduzido de memória quando se trabalha com um grande número de modelos:

```php
use App\Models\Flight;
use Illuminate\Database\Eloquent\Collection;

Flight::chunk(200, function (Collection $flights) {
    foreach ($flights as $flight) {
        // ...
    }
});
```

O primeiro argumento passado para o método `chunk` é o número de registros que você deseja receber por "chunk". O *closure* passado como segundo argumento será invocado para cada "*chunk*" que for obtido do banco de dados. Uma consulta ao banco de dados será executada para obter cada "*chunk*" de registros passados ao *closure*.

Se você está filtrando os resultados do método `chunk` com base em uma coluna que também será atualizada enquanto itera sobre os resultados, você deve usar o método `chunkById`. O uso do método `chunk` nesses cenários poderia levar a resultados inesperados e inconsistentes. Internamente, o método `chunkById` sempre irá buscar modelos com uma coluna `id` maior que o último modelo no último *chunk*:

```php
Flight::where('departed', true)
    ->chunkById(200, function (Collection $flights) {
        $flights->each->update(['departed' => false]);
    }, $column = 'id');
```

<a name="chunking-using-lazy-collections"></a>
### *Chunking* usando coleções preguiçosas

O método `lazy` funciona de maneira similar à o método [`chunk`](##chunking-results), no sentido que, nos bastidores, ele executa a consulta em partes. Porém, em vez de passar cada parte diretamente para um *callback* como é, o método `lazy` retorna uma coleção de modelos Eloquent, que permite interagir com os resultados como um único fluxo:

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    // ...
}
```

Se você está filtrando os resultados do método `lazy` com base em uma coluna que também será atualizada enquanto itera sobre os resultados, você deve usar o método `lazyById`. Internamente, o método `lazyById` sempre recupera modelos com a coluna `id` maior que o último modelo no último pedaço:

```php
Flight::where('departed', true)
    ->lazyById(200, $column = 'id')
    ->each->update(['departed' => false]);
```

Você pode filtrar os resultados baseados na ordem decrescente do `id` usando o método `lazyByIdDesc`.

<a name="cursors"></a>
### Cursores

Semelhante ao método `lazy`, o método `cursor` pode ser usado para reduzir significativamente o consumo de memória do seu aplicativo quando você itera através de dezenas de milhares de registros do modelo Eloquent.

O método `cursor` irá executar apenas uma consulta ao banco de dados; contudo, os modelos individuais do Eloquent não serão hidratados até que eles sejam realmente iterados. Portanto, apenas um modelo Eloquent é mantido na memória em qualquer momento enquanto se itera sobre o cursor.

::: warning ATENÇÃO
Como o método `cursor` só pode manter um único modelo Eloquent na memória de cada vez, ele não pode carregar em massa relacionamentos. Se você precisar carregar em massa relacionamentos, considere usar [o método 'lazy'](#chunking-using-lazy-collections) em vez disso.
:::

Internamente, o método `cursor` utiliza [geradores](https://www.php.net/manual/pt_br/language.generators.overview.php) PHP para implementar essa funcionalidade:

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    // ...
}
```

O cursor retorna uma instância de `Illuminate\Support\LazyCollection`. [Coleções preguiçosas](/docs/collections#lazy-collections) permitem que você use muitos dos métodos de coleção disponíveis em coleções típicas do Laravel, enquanto carrega apenas um modelo na memória por vez:

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

Embora o método cursor use muito menos memória do que uma consulta regular (apenas mantendo um único modelo Eloquent na memória de cada vez), ele ainda acabará por esgotar a memória. Isso é devido ao fato de que o driver PDO do PHP armazena em cache todos os resultados da consulta bruta em seu [buffer internamente](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php). Se você estiver lidando com um grande número de registros Eloquent, considere usar o método [`lazy`](#chunking-using-lazy-collections) em vez disso.

<a name="advanced-subqueries"></a>
### Subconsultas Avançadas

<a name="subquery-selects"></a>
#### `Select` em Subconsultas

O Eloquent também oferece suporte avançado a subconsultas, o que permite que você extraia informações de tabelas relacionadas em uma única consulta. Por exemplo, vamos imaginar que temos uma tabela de `destinations` de voos e uma tabela de `flights` para destinos. A tabela `flights` contém uma coluna `arrived_at` que indica quando o voo chegou ao destino.

Usando a funcionalidade de subconsulta disponível nos métodos `select` e `addSelect` do construtor de consultas, podemos selecionar todas os `destinations` e o nome do voo que chegou mais recentemente em cada destino usando uma única consulta:

```php
    use App\Models\Destination;
    use App\Models\Flight;

    return Destination::addSelect(['last_flight' => Flight::select('name')
        ->whereColumn('destination_id', 'destinations.id')
        ->orderByDesc('arrived_at')
        ->limit(1)
    ])->get();
```

<a name="subquery-ordering"></a>
#### Subconsulta de ordenação

Além disso, a função `orderBy` do construtor de consultas suporta subconsultas. Continuando com o exemplo dos voos, podemos usar essa funcionalidade para classificar todos os destinos com base na hora da última chegada de um voo a esse destino. Novamente, isso pode ser feito enquanto executa uma única consulta ao banco de dados:

```php
    return Destination::orderByDesc(
        Flight::select('arrived_at')
            ->whereColumn('destination_id', 'destinations.id')
            ->orderByDesc('arrived_at')
            ->limit(1)
    )->get();
```

<a name="retrieving-single-models"></a>
## Recuperando Modelos/Agregados

Além de buscar todos os registros que correspondem a uma consulta específica, você também pode buscar um único registro usando os métodos `find`, `first` ou `firstWhere`. Em vez de retornar uma coleção de modelos, esses métodos retornam uma única instância do modelo:

```php
    use App\Models\Flight;

    // Recuperar um modelo pela sua chave primária...
    $flight = Flight::find(1);

    // Recupere o primeiro modelo que corresponde às restrições da consulta...
    $flight = Flight::where('active', 1)->first();

    // Alternativa para recuperar o primeiro modelo que corresponde às restrições da consulta...
    $flight = Flight::firstWhere('active', 1);
```

Às vezes você pode querer executar alguma outra ação se não houver resultados encontrados. Os métodos `findOr` e `firstOr` retornarão uma única instância de modelo ou, se não houver resultados encontrados, executarão o _closure_ dado. O valor retornado pelo _closure_ será considerado o resultado do método:

```php
    $flight = Flight::findOr(1, function () {
        // ...
    });

    $flight = Flight::where('legs', '>', 3)->firstOr(function () {
        // ...
    });
```

<a name="not-found-exceptions"></a>
#### Exceções de Não Encontrado

Às vezes você pode querer lançar uma exceção se um modelo não for encontrado. Isso é particularmente útil em rotas ou controladores. Os métodos `findOrFail` e `firstOrFail` recuperarão o primeiro resultado da consulta; no entanto, se nenhum resultado for encontrado, uma exceção `Illuminate\Database\Eloquent\ModelNotFoundException` será lançada:

```php
    $flight = Flight::findOrFail(1);

    $flight = Flight::where('legs', '>', 3)->firstOrFail();
```

Se o `ModelNotFoundException` não for capturado, uma resposta HTTP 404 é automaticamente enviada de volta ao cliente:

```php
    use App\Models\Flight;

    Route::get('/api/flights/{id}', function (string $id) {
        return Flight::findOrFail($id);
    });
```

<a name="retrieving-or-creating-models"></a>
### Recuperando ou Criando Modelos

O método `firstOrCreate` tentará localizar um registro de banco de dados usando as pares coluna/valor fornecidos. Se o modelo não puder ser encontrado no banco de dados, um registro será inserido com os atributos resultantes da fusão do primeiro argumento do array com o segundo argumento opcional do array:

O método `firstOrNew`, assim como o `firstOrCreate`, tentará localizar um registro no banco de dados que corresponda aos atributos fornecidos. No entanto, se um modelo não for encontrado, uma nova instância do modelo será retornada. Observe que o modelo retornado por `firstOrNew` ainda não foi persistido no banco de dados. Você precisará chamar manualmente o método `save` para persistir:

```php
    use App\Models\Flight;

    // Recuperar voo pelo nome ou criá-lo caso ele não exista...
    $flight = Flight::firstOrCreate([
        'name' => 'London to Paris'
    ]);

    // Recupere o voo pelo nome ou crie-o com os atributos name, delayed e arrival_time...
    $flight = Flight::firstOrCreate(
        ['name' => 'London to Paris'],
        ['delayed' => 1, 'arrival_time' => '11:30']
    );

    // Recuperar voo por nome ou instanciar uma nova instância de voo...
    $flight = Flight::firstOrNew([
        'name' => 'London to Paris'
    ]);

    // Recupere o voo pelo nome ou instancie com os atributos name, delayed e arrival_time...
    $flight = Flight::firstOrNew(
        ['name' => 'Tokyo to Sydney'],
        ['delayed' => 1, 'arrival_time' => '11:30']
    );
```

<a name="retrieving-aggregates"></a>
### Recuperando Agregados

Ao interagir com modelos Eloquent, você também pode usar o `count`, `sum`, `max` e outros [métodos agregados](https://laravel.com/docs/queries#aggregates) fornecidos pelo [construtor de consultas](/docs/queries) do Laravel. Como se poderia esperar, esses métodos retornam um valor escalar em vez de uma instância do modelo Eloquent:

```php
    $count = Flight::where('active', 1)->count();

    $max = Flight::where('active', 1)->max('price');
```

<a name="inserting-and-updating-models"></a>
## Inserindo e Atualizando Modelos

<a name="inserts"></a>
### Inserindo

Claro, quando usamos Eloquent não precisamos apenas buscar modelos do banco de dados, também precisamos inserir novos registros. Felizmente, o Eloquent torna isso simples. Para inserir um novo registro no banco de dados, você deve instanciar uma nova instância do modelo e definir atributos no modelo. Em seguida, chame o método `save` na instância do modelo:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Models\Flight;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class FlightController extends Controller
    {
        /**
         * Armazene um novo voo no banco de dados.
         */
        public function store(Request $request): RedirectResponse
        {
            // Validar a solicitação...

            $flight = new Flight;

            $flight->name = $request->name;

            $flight->save();

            return redirect('/flights');
        }
    }
```

Neste exemplo, atribuímos o campo `name` da requisição HTTP recebida ao atributo `name` da instância do modelo `App\Models\Flight`. Quando chamamos o método `save`, um registro será inserido no banco de dados. Os *timestamps* `created_at` e `updated_at` do modelo serão automaticamente definidos quando o método `save` for chamado, então não é necessário defini-los manualmente.

Alternativamente, você pode usar o método `create` para salvar um novo modelo usando uma única instrução PHP. A instância do modelo inserida será retornada para você pelo método `create`:

```php
    use App\Models\Flight;

    $flight = Flight::create([
        'name' => 'London to Paris',
    ]);
```

Porém, antes de usar o método `create`, você precisará especificar uma propriedade `fillable` ou `guarded` na sua classe de modelo. Essas propriedades são necessárias porque todos os modelos Eloquent são protegidos contra vulnerabilidades de atribuição em massa por padrão. Para saber mais sobre a atribuição em massa, consulte a [documentação de atribuição em massa](#mass-assignment).

<a name="updates"></a>
### Atualizações

O método `save` também pode ser usado para atualizar modelos que já existem no banco de dados. Para atualizar um modelo, você deve recuperá-lo e definir quaisquer atributos que deseja atualizar. Em seguida, você deve chamar o método `save` do modelo. Novamente, o *timestamp* `updated_at` será automaticamente atualizado, então não há necessidade de definir manualmente seu valor:

```php
    use App\Models\Flight;

    $flight = Flight::find(1);

    $flight->name = 'Paris to London';

    $flight->save();
```

Às vezes, você pode precisar atualizar um modelo existente ou criar um novo se não houver um modelo correspondente. Como o método `firstOrCreate`, o método `updateOrCreate` salva o modelo, então não há necessidade de chamar manualmente o método `save`.

No exemplo abaixo, se um voo existir com uma localização de `departure` de `Oakland` e uma localização de `destination` de `San Diego`, suas colunas `price` e `discounted` serão atualizadas. Se nenhum voo existir, um novo voo será criado que tenha os atributos resultantes da fusão do primeiro *array* de argumentos com o segundo *array* de argumentos:

```php
    $flight = Flight::updateOrCreate(
        ['departure' => 'Oakland', 'destination' => 'San Diego'],
        ['price' => 99, 'discounted' => 1]
    );
```

<a name="mass-updates"></a>
#### Atualização em Massa

Atualizações também podem ser feitas em modelos que correspondam a uma determinada consulta. Neste exemplo, todos os voos que são `active` e têm um `destination` de `San Diego` serão marcados como atrasados:

```php
    Flight::where('active', 1)
          ->where('destination', 'San Diego')
          ->update(['delayed' => 1]);
```

O método `update` espera uma matriz de pares coluna-valor representando as colunas que devem ser atualizadas. O método `update` retorna o número de linhas afetadas.

::: warning ATENÇÃO
Ao emitir uma atualização em massa via Eloquent, os eventos do modelo `saving`, `saved`, `updating` e `updated` não serão acionados para os modelos atualizados. Isso ocorre porque os modelos nunca são realmente recuperados ao emitir uma atualização em massa.
:::

<a name="examining-attribute-changes"></a>
#### Examinando alterações de atributo

O Eloquent fornece os métodos `isDirty`, `isClean` e `wasChanged` para examinar o estado interno do seu modelo e determinar como seus atributos mudaram desde que o modelo foi originalmente recuperado.

O método `isDirty` determina se algum dos atributos do modelo foi alterado desde que o modelo foi recuperado. Você pode passar um nome específico de atributo ou uma matriz de atributos para o método `isDirty` para determinar se algum dos atributos está "dirty". O método `isClean` determinará se um atributo permaneceu inalterado desde que o modelo foi recuperado. Este método também aceita um argumento opcional de atributo:

```php
    use App\Models\User;

    $user = User::create([
        'first_name' => 'Taylor',
        'last_name' => 'Otwell',
        'title' => 'Developer',
    ]);

    $user->title = 'Painter';

    $user->isDirty(); // true
    $user->isDirty('title'); // true
    $user->isDirty('first_name'); // false
    $user->isDirty(['first_name', 'title']); // true

    $user->isClean(); // false
    $user->isClean('title'); // false
    $user->isClean('first_name'); // true
    $user->isClean(['first_name', 'title']); // false

    $user->save();

    $user->isDirty(); // false
    $user->isClean(); // true
```

O método `wasChanged` determina se algum atributo foi alterado quando o modelo foi salvo pela última vez dentro do ciclo de solicitação atual. Se necessário, você pode passar um nome de atributo para ver se um atributo específico foi alterado:

```php
    $user = User::create([
        'first_name' => 'Taylor',
        'last_name' => 'Otwell',
        'title' => 'Developer',
    ]);

    $user->title = 'Painter';

    $user->save();

    $user->wasChanged(); // true
    $user->wasChanged('title'); // true
    $user->wasChanged(['title', 'slug']); // true
    $user->wasChanged('first_name'); // false
    $user->wasChanged(['first_name', 'title']); // true
```

O método `getOriginal` retorna um array contendo os atributos originais do modelo independentemente de quaisquer alterações feitas no modelo desde que ele foi recuperado. Se necessário, você pode passar um nome específico de atributo para obter o valor original de um atributo específico:

```php
    $user = User::find(1);

    $user->name; // John
    $user->email; // john@example.com

    $user->name = "Jack";
    $user->name; // Jack

    $user->getOriginal('name'); // John
    $user->getOriginal(); // Matriz de atributos originais...
```

<a name="mass-assignment"></a>
### Atribuição em massa

Você pode usar o método `create` para salvar um novo modelo usando uma única instrução PHP. A instância do modelo inserida será retornada para você pelo método:

```php
    use App\Models\Flight;

    $flight = Flight::create([
        'name' => 'London to Paris',
    ]);
```

Porém, antes de usar o método `create`, você precisará especificar uma propriedade `fillable` ou `guarded` na sua classe de modelo. Essas propriedades são necessárias porque todos os modelos Eloquent são protegidos contra vulnerabilidades de atribuição em massa por padrão.

Uma vulnerabilidade de atribuição em massa ocorre quando um usuário passa um campo inesperado de uma solicitação HTTP e esse campo altera uma coluna no seu banco de dados que você não esperava. Por exemplo, um usuário malicioso pode enviar um parâmetro `is_admin` através de uma solicitação HTTP, que é então passado para o método `create` do seu modelo, permitindo que o usuário aumente seu nível de administrador.

Então, para começar, você deve definir quais atributos do modelo deseja tornar atribuíveis em massa. Você pode fazer isso usando a propriedade `$fillable` no modelo. Por exemplo, vamos tornar o atributo `name` do nosso modelo `Flight` atribuível em massa:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * Os atributos que são atribuíveis em massa.
         *
         * @var array
         */
        protected $fillable = ['name'];
    }
```

Uma vez que você tenha especificado quais atributos são atribuíveis em massa, você pode usar o método `create` para inserir um novo registro no banco de dados. O método `create` retorna a instância do modelo recém-criado:

```php
    $flight = Flight::create(['name' => 'London to Paris']);
```

Se você já tiver uma instância de modelo, poderá usar o método `fill` para preenchê-la com um array de atributos:

```php
    $flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a name="mass-assignment-json-columns"></a>
#### Atribuição em massa e colunas JSON

Ao atribuir colunas JSON, cada chave da coluna deve ser especificada na matriz `$fillable` do seu modelo. Para segurança, o Laravel não suporta a atualização de atributos aninhados JSON ao usar a propriedade `guarded`:

```php
    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array
     */
    protected $fillable = [
        'options->enabled',
    ];
```

<a name="allowing-mass-assignment"></a>
#### Permitindo Atribuição em Massa

Se você quiser tornar todos os seus atributos atribuíveis em massa, você pode definir a propriedade `$guarded` do seu modelo como um *array* vazio. Se você escolher desproteger seu modelo, você deve tomar cuidado especial para sempre criar manualmente os *array*s passados ​​para os métodos `fill`, `create` e `update` do Eloquent:

```php
    /**
     * Os atributos que não são atribuíveis em massa.
     *
     * @var array
     */
    protected $guarded = [];
```

<a name="mass-assignment-exceptions"></a>
#### Exceções de Atribuição em Massa

Por padrão, atributos que não estão incluídos na matriz `$fillable` são descartados silenciosamente quando operações de atribuição em massa são executadas. Em produção, esse é o comportamento esperado; no entanto, durante o desenvolvimento local, pode levar a confusão sobre por que as alterações no modelo não estão tendo efeito.

Se desejar, você pode instruir o Laravel a lançar uma exceção ao tentar preencher um atributo não preenchível invocando o método `preventSilentlyDiscardingAttributes`. Normalmente, este método deve ser invocado no método `boot` da classe `AppServiceProvider` do seu aplicativo:

```php
    use Illuminate\Database\Eloquent\Model;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
    }
```

<a name="upserts"></a>
### *Upserts*

O método `upsert` do Eloquent pode ser usado para atualizar ou criar registros em uma única operação atômica. O primeiro argumento do método consiste nos valores a serem inseridos ou atualizados, enquanto o segundo argumento lista a(s) coluna(s) que identifica exclusivamente os registros na tabela associada. O terceiro e último argumento é um *array* das colunas que devem ser atualizadas se um registro correspondente já existir no banco de dados. O método `upsert` irá definir automaticamente as colunas `created_at` e `updated_at` se os _timestamps_ estiverem habilitados no modelo:

```php
    Flight::upsert([
        ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
        ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
    ], uniqueBy: ['departure', 'destination'], update: ['price']);
```

::: warning ATENÇÃO
Todos os bancos de dados, exceto o SQL Server, exigem que as colunas no segundo argumento do método `upsert` tenham um índice "*primary*" ou "*unique*". Além disso, o driver MySQL ignora o segundo argumento do método `upsert` e sempre usa os índices "*primary*" e "*unique*" da tabela para detectar registros existentes.
:::

<a name="deleting-models"></a>
## Deletando Modelos

Para excluir um modelo, você pode chamar o método `delete` na instância do modelo:

```php
    use App\Models\Flight;

    $flight = Flight::find(1);

    $flight->delete();
```

Você pode chamar o método `truncate` para excluir todos os registros associados ao modelo no banco de dados. A operação `truncate` também irá redefinir quaisquer IDs incrementados automaticamente na tabela associada ao modelo:

```php
    Flight::truncate();
```

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### Deletando um Modelo Existente pela sua Chave Primária

No exemplo acima, estamos recuperando o modelo do banco de dados antes de chamar o método `delete`. No entanto, se você souber a chave primária do modelo, poderá excluí-lo sem recuperá-lo explicitamente chamando o método `destroy`. Além de aceitar uma única chave primária, o método `destroy` também aceita múltiplas chaves primárias, um array de chaves primárias ou uma [coleção](/docs/collections) de chaves primárias:

```php
    Flight::destroy(1);

    Flight::destroy(1, 2, 3);

    Flight::destroy([1, 2, 3]);

    Flight::destroy(collect([1, 2, 3]));
```

::: warning ATENÇÃO
O método `destroy` carrega cada modelo individualmente e chama o método `delete`, de modo que os eventos `deleting` e `deleted` sejam devidamente enviados para cada modelo.
:::

<a name="deleting-models-using-queries"></a>
#### Deletando Modelos Usando Consultas

Claro, você pode construir uma consulta Eloquent para excluir todos os modelos que correspondem aos critérios da sua consulta. Neste exemplo, vamos excluir todos os voos que estão marcados como inativos. Assim como as atualizações em massa, as exclusões em massa não despacharão eventos de modelo para os modelos que estão sendo excluídos:

```php
    $deleted = Flight::where('active', 0)->delete();
```

::: warning ATENÇÃO
Ao executar uma instrução de exclusão em massa via Eloquent, os eventos `deleting` e `deleted` do modelo não serão enviados para os modelos excluídos. Isso ocorre porque os modelos nunca são realmente recuperados ao executar a instrução de exclusão.
:::

<a name="soft-deleting"></a>
### Soft Delete

Além de realmente remover registros do seu banco de dados, o Eloquent também pode "excluir suavemente" os modelos. Quando os modelos são excluídos suavemente, eles não são realmente removidos do seu banco de dados. Em vez disso, um atributo `deleted_at` é definido no modelo indicando a data e hora em que o modelo foi "excluído". Para habilitar exclusões suaves para um modelo, adicione a *trait* `Illuminate\Database\Eloquent\SoftDeletes` ao modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\SoftDeletes;

    class Flight extends Model
    {
        use SoftDeletes;
    }
```

::: info NOTA
A *trait* `SoftDeletes` irá automaticamente converter o atributo `deleted_at` em uma instância de `DateTime` / `Carbon` para você.
:::

Você também deve adicionar a coluna `deleted_at` à sua tabela de banco de dados. O construtor de esquema ([schema builder](/docs/migrations)) do Laravel contém um método auxiliar para criar esta coluna:

```php
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    Schema::table('flights', function (Blueprint $table) {
        $table->softDeletes();
    });

    Schema::table('flights', function (Blueprint $table) {
        $table->dropSoftDeletes();
    });
```

Agora, quando você chama o método `delete` no modelo, a coluna `deleted_at` será definida para a data e hora atuais. No entanto, o registro do banco de dados do modelo permanecerá na tabela. Quando consultar um modelo que usa exclusão suave, os modelos excluídos serão automaticamente excluídos de todos os resultados da consulta.

Para determinar se uma instância de modelo foi excluída suavemente, você pode usar o método `trashed`:

```php
    if ($flight->trashed()) {
        // ...
    }
```

<a name="restoring-soft-deleted-models"></a>
#### Restaurando Modelos do *Soft Delete*

Às vezes você pode querer "desfazer" uma exclusão suave de um modelo. Para restaurar um modelo excluído suavemente, você pode chamar o método `restore` em uma instância do modelo. O método `restore` irá definir a coluna `deleted_at` do modelo para `null`:

```php
    $flight->restore();
```

Você também pode usar o método `restore` em uma consulta para restaurar vários modelos. Novamente, como outras operações "em massa", isso não irá disparar nenhum evento do modelo para os modelos que são restaurados:

```php
    Flight::withTrashed()
            ->where('airline_id', 1)
            ->restore();
```

O método `restore` também pode ser usado ao construir [consultas de relacionamento](/docs/eloquent-relationships):

```php
    $flight->history()->restore();
```

<a name="permanently-deleting-models"></a>
#### Deletando Modelos Permanentemente

Às vezes você pode precisar realmente remover um modelo do seu banco de dados. Você pode usar o método `forceDelete` para remover permanentemente um modelo excluído com suavidade da tabela do banco de dados:

```php
    $flight->forceDelete();
```

Você também pode usar o método `forceDelete` ao construir consultas de relacionamento Eloquent:

```php
    $flight->history()->forceDelete();
```

<a name="querying-soft-deleted-models"></a>
### Consultando Modelos Excluídos

<a name="including-soft-deleted-models"></a>
#### Incluindo Modelos Excluídos

Como mencionado acima, modelos excluídos suavemente serão automaticamente excluídos dos resultados da consulta. No entanto, você pode forçar modelos excluídos suavemente a serem incluídos nos resultados de uma consulta chamando o método `withTrashed` na consulta:

```php
    use App\Models\Flight;

    $flights = Flight::withTrashed()
                    ->where('account_id', 1)
                    ->get();
```

O método `withTrashed` também pode ser chamado quando construindo uma [relação](/docs/eloquent-relationships) de consulta:

```php
    $flight->history()->withTrashed()->get();
```

<a name="retrieving-only-soft-deleted-models"></a>
#### Recuperando Apenas Modelos Excluídos

O método `onlyTrashed` irá recuperar **apenas** os modelos excluídos suavemente:

```php
    $flights = Flight::onlyTrashed()
                    ->where('airline_id', 1)
                    ->get();
```

<a name="pruning-models"></a>
## Modelos de poda

Às vezes você pode querer excluir periodicamente modelos que não são mais necessários. Para fazer isso, você pode adicionar a *trait*`Illuminate\Database\Eloquent\Prunable` ou `Illuminate\Database\Eloquent\MassPrunable` para os modelos que gostaria de podar periodicamente. Depois de adicionar uma das *trait*s ao modelo, implemente um método `pruner` que retorne um construtor de consultas Eloquent que resolva os modelos que não são mais necessários:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Prunable;

    class Flight extends Model
    {
        use Prunable;

        /**
         * Obtenha a consulta do modelo podável.
         */
        public function prunable(): Builder
        {
            return static::where('created_at', '<=', now()->subMonth());
        }
    }
```

Ao marcar modelos como `Prunable`, você também pode definir um método de `pruning` no modelo. Este método será chamado antes do modelo ser excluído. Este método pode ser útil para excluir quaisquer recursos adicionais associados ao modelo, como arquivos armazenados, antes que o modelo seja removido permanentemente do banco de dados:

```php
    /**
     * Prepare o modelo para poda.
     */
    protected function pruning(): void
    {
        // ...
    }
```

Depois de configurar seu modelo "*prunable*", você deve agendar o comando Artisan `model:prune` no arquivo `routes/console.php` da sua aplicação. Você é livre para escolher o intervalo apropriado em que esse comando deve ser executado:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('model:prune')->daily();
```

Por trás das cenas, o comando `model:prune` irá detectar automaticamente modelos "*Prunable*" dentro do diretório `app/Models` da sua aplicação. Se os seus modelos estiverem em um local diferente, você pode usar a opção `--model` para especificar os nomes das classes de modelo:

```php
    Schedule::command('model:prune', [
        '--model' => [Address::class, Flight::class],
    ])->daily();
```

Se você quiser excluir certos modelos de serem podados enquanto todos os outros modelos detectados são podados, você pode usar a opção `--except`:

```php
    Schedule::command('model:prune', [
        '--except' => [Address::class, Flight::class],
    ])->daily();
```

Você pode testar sua consulta `prunable` executando o comando `model:prune` com a opção `--pretend`. Ao fingir (*--pretend*), o comando `model:prune` simplesmente relatará quantos registros seriam podados se o comando fosse realmente executado:

```shell
php artisan model:prune --pretend
```

::: warning ATENÇÃO
Os modelos de *soft delete* serão permanentemente excluídos (`forceDelete`) se corresponderem à consulta de exclusão.
:::

<a name="mass-pruning"></a>
#### Poda em massa

Quando os modelos são marcados com a *trait* `Illuminate\Database\Eloquent\MassPrunable`, os modelos são excluídos do banco de dados usando consultas de exclusão em massa. Portanto, o método `pruning` não será invocado, nem os eventos `deleting` e `deleted` do modelo serão enviados. Isso ocorre porque os modelos nunca são realmente recuperados antes da exclusão, tornando o processo de poda muito mais eficiente:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\MassPrunable;

    class Flight extends Model
    {
        use MassPrunable;

        /**
         * Obtenha a consulta do modelo podável.
         */
        public function prunable(): Builder
        {
            return static::where('created_at', '<=', now()->subMonth());
        }
    }
```

<a name="replicating-models"></a>
## Replicando Modelos

Você pode criar uma cópia não salva de uma instância de modelo existente usando o método `replicate`. Este método é particularmente útil quando você tem instâncias de modelo que compartilham muitos dos mesmos atributos:

```php
    use App\Models\Address;

    $shipping = Address::create([
        'type' => 'shipping',
        'line_1' => '123 Example Street',
        'city' => 'Victorville',
        'state' => 'CA',
        'postcode' => '90001',
    ]);

    $billing = $shipping->replicate()->fill([
        'type' => 'billing'
    ]);

    $billing->save();
```

Para excluir um ou mais atributos de serem replicados para o novo modelo, você pode passar uma matriz para o método `replicate`:

```php
    $flight = Flight::create([
        'destination' => 'LAX',
        'origin' => 'LHR',
        'last_flown' => '2020-03-04 11:00:00',
        'last_pilot_id' => 747,
    ]);

    $flight = $flight->replicate([
        'last_flown',
        'last_pilot_id'
    ]);
```

<a name="query-scopes"></a>
## Escopos de consulta

<a name="global-scopes"></a>
### Escopos Globais

Os escopos globais permitem adicionar restrições a todas as consultas para um determinado modelo. A funcionalidade de exclusão suave do próprio Laravel utiliza escopos globais para recuperar apenas os "modelos não excluídos" do banco de dados. Escrever seus próprios escopos globais pode fornecer uma maneira conveniente e fácil de garantir que todas as consultas para um determinado modelo recebam certas restrições.

<a name="generating-scopes"></a>
#### Geração de escopos

Para gerar um novo escopo global, você pode invocar o comando Artisan `make:scope`, que colocará o escopo gerado no diretório `app/Models/Scopes` da sua aplicação:

```shell
php artisan make:scope AncientScope
```

<a name="writing-global-scopes"></a>
#### Escrevendo Escopos Globais

Escrever um escopo global é simples. Primeiro, use o comando `make:scope` para gerar uma classe que implementa a interface `Illuminate\Database\Eloquent\Scope`. A interface `Scope` exige que você implemente um método: `apply`. O método `apply` pode adicionar restrições `where` ou outros tipos de cláusulas à consulta conforme necessário:

```php
    <?php

    namespace App\Models\Scopes;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Scope;

    class AncientScope implements Scope
    {
        /**
         * Aplique o escopo a um determinado construtor de consultas Eloquent.
         */
        public function apply(Builder $builder, Model $model): void
        {
            $builder->where('created_at', '<', now()->subYears(2000));
        }
    }
```

::: info NOTA
Se o seu escopo global é adicionar colunas à cláusula SELECT da consulta, você deve usar o método `addSelect` em vez de `select`. Isso evitará a substituição involuntária da cláusula `SELECT` existente da consulta.
:::

<a name="applying-global-scopes"></a>
#### Aplicando Escopos Globais

Para atribuir um escopo global a um modelo, você pode simplesmente colocar o atributo `ScopedBy` no modelo:

```php
    <?php

    namespace App\Models;

    use App\Models\Scopes\AncientScope;
    use Illuminate\Database\Eloquent\Attributes\ScopedBy;

    #[ScopedBy([AncientScope::class])]
    class User extends Model
    {
        //
    }
```

Ou você pode registrar manualmente o escopo global sobrescrevendo o método `booted` do modelo e invocando o método `addGlobalScope` do modelo. O método `addGlobalScope` aceita uma instância de seu escopo como único argumento:

```php
    <?php

    namespace App\Models;

    use App\Models\Scopes\AncientScope;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * O método "inicializado" do modelo.
         */
        protected static function booted(): void
        {
            static::addGlobalScope(new AncientScope);
        }
    }
```

Depois de adicionar o escopo no exemplo acima para o modelo `App\Models\User`, uma chamada para o método `User::all()` executará a seguinte consulta SQL:

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a name="anonymous-global-scopes"></a>
#### Escopos Globais Anônimos

O Eloquent também permite que você defina escopos globais usando *closures*, o que é particularmente útil para escopos simples que não exigem uma classe própria. Ao definir um escopo global usando um *closure*, você deve fornecer um nome de escopo de sua escolha como o primeiro argumento do método `addGlobalScope`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * O método "inicializado" do modelo.
         */
        protected static function booted(): void
        {
            static::addGlobalScope('ancient', function (Builder $builder) {
                $builder->where('created_at', '<', now()->subYears(2000));
            });
        }
    }
```

<a name="removing-global-scopes"></a>
#### Removendo Escopos Globais

Se você quiser remover um escopo global para uma consulta específica, você pode usar o método `withoutGlobalScope`. Este método aceita o nome da classe do escopo global como seu único argumento:

```php
    User::withoutGlobalScope(AncientScope::class)->get();
```

Ou, se você definiu o escopo global usando um *closure*, você deve passar a string que você atribuiu ao escopo global:

```php
    User::withoutGlobalScope('ancient')->get();
```

Se você gostaria de remover vários ou até mesmo todos os escopos globais da consulta, você pode usar o método `withoutGlobalScopes`:

```php
    // Remova todos os escopos globais...
    User::withoutGlobalScopes()->get();

    // Remova alguns dos escopos globais...
    User::withoutGlobalScopes([
        FirstScope::class, SecondScope::class
    ])->get();
```

<a name="local-scopes"></a>
### Escopos Locais

Os escopos locais permitem que você defina conjuntos comuns de restrições de consulta que podem ser facilmente reutilizados em sua aplicação. Por exemplo, você pode precisar frequentemente recuperar todos os usuários considerados "populares". Para definir um escopo, prefira um método do modelo Eloquent com `scope`.

Os escopos devem sempre retornar a mesma instância do construtor de consulta ou `void`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Defina o escopo de uma consulta para incluir apenas usuários populares.
         */
        public function scopePopular(Builder $query): void
        {
            $query->where('votes', '>', 100);
        }

        /**
         * Defina o escopo de uma consulta para incluir apenas usuários ativos.
         */
        public function scopeActive(Builder $query): void
        {
            $query->where('active', 1);
        }
    }
```

<a name="utilizing-a-local-scope"></a>
#### Utilizando o escopo local

Uma vez que o escopo tenha sido definido, você pode chamar os métodos de escopo ao consultar o modelo. No entanto, não deve incluir o prefixo `scope` ao chamar o método. Você também pode encadear chamadas para vários escopos:

```php
    use App\Models\User;

    $users = User::popular()->active()->orderBy('created_at')->get();
```

Combinando múltiplas escopos de modelo Eloquent através do operador de consulta `or` pode exigir o uso de _closures_ para alcançar a [agrupação lógica](/docs/queries#logical-grouping):

```php
    $users = User::popular()->orWhere(function (Builder $query) {
        $query->active();
    })->get();
```

No entanto, como isso pode ser um pouco complicado, o Laravel fornece um método "de ordem superior" chamado `orWhere` que permite encadear escopos de forma fluente sem o uso de *closures*:

```php
    $users = User::popular()->orWhere->active()->get();
```

<a name="dynamic-scopes"></a>
#### Escopos Dinâmicos

Às vezes você pode querer definir um escopo que aceite parâmetros. Para começar, basta adicionar seus parâmetros adicionais à assinatura do seu método de escopo. Os parâmetros do escopo devem ser definidos após o parâmetro `$query`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Defina o escopo de uma consulta para incluir apenas usuários de um determinado tipo.
         */
        public function scopeOfType(Builder $query, string $type): void
        {
            $query->where('type', $type);
        }
    }
```

Uma vez que os argumentos esperados tenham sido adicionados à assinatura do seu método de escopo, você pode passar os argumentos ao chamar o escopo:

```php
    $users = User::ofType('admin')->get();
```

<a name="comparing-models"></a>
## Comparando Modelos

Às vezes você pode precisar determinar se dois modelos são "iguais" ou não. Os métodos `is` e `isNot` podem ser usados para verificar rapidamente se dois modelos têm a mesma chave primária, tabela e conexão com o banco de dados ou não:

```php
    if ($post->is($anotherPost)) {
        // ...
    }

    if ($post->isNot($anotherPost)) {
        // ...
    }
```

Os métodos `is` e `isNot` também estão disponíveis ao usar os [relacionamentos](/docs/eloquent-relationships) `belongsTo`, `hasOne`, `morphTo` e `morphOne`. Este método é particularmente útil quando você gostaria de comparar um modelo relacionado sem emitir uma consulta para recuperar esse modelo:

```php
    if ($post->author()->is($user)) {
        // ...
    }
```

<a name="events"></a>
## Eventos

::: info NOTA
Quer transmitir seus eventos Eloquent diretamente para seu aplicativo de lado do cliente? Confira o [transmissão de eventos de modelo](/docs/broadcasting#model-broadcasting).
:::

Modelos eloquentes disparam vários eventos, permitindo que você se conecte aos seguintes momentos no ciclo de vida de um modelo: `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `trashed`, `forceDeleting`, `forceDeleted`, `restoring`, `restored` e `replicating`.

O evento `retrieved` será acionado quando um modelo existente for recuperado do banco de dados. Quando um novo modelo é salvo pela primeira vez, os eventos `creating` e `created` serão acionados. Os eventos `updating` e `updated` serão acionados quando um modelo existente for modificado e o método `save` for chamado. Os eventos `saving` / `saved` serão acionados quando um modelo for criado ou atualizado - mesmo que os atributos do modelo não tenham sido alterados. Os nomes dos eventos que terminam com `-ing` são acionados antes de qualquer alteração no modelo ser persistida, enquanto os eventos que terminam com `-ed` são acionados depois que as alterações no modelo foram persistidas.

Para começar a escutar eventos de modelo, defina uma propriedade `$dispatchesEvents` no seu modelo Eloquent. Esta propriedade mapeia vários pontos do ciclo de vida do modelo Eloquent para suas próprias [classes de evento](docs/events). Cada classe de evento deve esperar receber uma instância do modelo afetado através de seu construtor:

```php
    <?php

    namespace App\Models;

    use App\Events\UserDeleted;
    use App\Events\UserSaved;
    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * O mapa de eventos para o modelo.
         *
         * @var array<string, string>
         */
        protected $dispatchesEvents = [
            'saved' => UserSaved::class,
            'deleted' => UserDeleted::class,
        ];
    }
```

Depois de definir e mapear seus eventos Eloquent, você pode usar [ouvintes de eventos](/docs/events#defining-listeners) para lidar com eles.

::: warning ATENÇÃO
Ao emitir uma consulta de atualização ou exclusão em massa via Eloquent, os eventos do modelo `saved`, `updated`, `deleting` e `deleted` não serão enviados para os modelos afetados. Isso ocorre porque os modelos nunca são realmente recuperados ao executar atualizações ou exclusões em massa.
:::

<a name="events-using-closures"></a>
### Usando Closures

Em vez de usar classes de eventos personalizadas, você pode registrar _closures_ que executam quando vários eventos do modelo são enviados. Normalmente, você deve registrar esses _closures_ no método `booted` do seu modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * O método "inicializado" do modelo.
         */
        protected static function booted(): void
        {
            static::created(function (User $user) {
                // ...
            });
        }
    }
```

Se necessário, você pode utilizar [ouvintes de eventos anônimos que podem ser enfileirados](/docs/events#queuable-anonymous-event-listeners) ao registrar o evento do modelo. Isso instruirá o Laravel a executar o ouvinte de eventos do modelo em segundo plano usando a fila da sua aplicação:

```php
    use function Illuminate\Events\queueable;

    static::created(queueable(function (User $user) {
        // ...
    }));
```

<a name="observers"></a>
### Observadores

<a name="defining-observers"></a>
#### Definindo Observadores

Se você estiver escutando muitos eventos em um modelo específico, você pode usar observadores para agrupar todos os seus ouvintes em uma única classe. As classes de observador têm nomes de métodos que refletem os eventos Eloquent que você deseja escutar. Cada um desses métodos recebe o modelo afetado como seu único argumento. O comando Artisan `make:observer` é a maneira mais fácil de criar uma nova classe de observador:

```shell
php artisan make:observer UserObserver --model=User
```

Este comando colocará o novo observador em seu diretório `app/Observers`. Se este diretório não existir, o Artisan o criará para você. Seu novo observador ficará assim:

```php
    <?php

    namespace App\Observers;

    use App\Models\User;

    class UserObserver
    {
        /**
         * Manipule o evento "criado" do usuário.
         */
        public function created(User $user): void
        {
            // ...
        }

        /**
         * Manipule o evento "atualizado" do usuário.
         */
        public function updated(User $user): void
        {
            // ...
        }

        /**
         * Manipule o evento "usuário excluído".
         */
        public function deleted(User $user): void
        {
            // ...
        }
        
        /**
         * Manipule o evento "restaurado" do usuário.
         */
        public function restored(User $user): void
        {
            // ...
        }

        /**
         * Manipule o evento "forceDeleted" do usuário.
         */
        public function forceDeleted(User $user): void
        {
            // ...
        }
    }
```

Para registrar um observador, você pode colocar o atributo `ObservedBy` no modelo correspondente:

```php
    use App\Observers\UserObserver;
    use Illuminate\Database\Eloquent\Attributes\ObservedBy;

    #[ObservedBy([UserObserver::class])]
    class User extends Authenticatable
    {
        //
    }
```

Ou você pode registrar manualmente um observador invocando o método `observe` no modelo que deseja observar. Você pode registrar observadores no método `boot` da classe `AppServiceProvider` da sua aplicação:

```php
    use App\Models\User;
    use App\Observers\UserObserver;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        User::observe(UserObserver::class);
    }
```

::: info NOTA
Existem eventos adicionais que um observador pode escutar, como `saving` e `retrieved`. Esses eventos são descritos na documentação [eventos](#events).
:::

<a name="observers-and-database-transactions"></a>
#### Observadores e Transações de Banco de Dados

Ao criar modelos dentro de uma transação de banco de dados, você pode instruir um observador para executar apenas seus manipuladores de eventos após o compromisso da transação de banco de dados. Você pode alcançar isso implementando a interface `ShouldHandleEventsAfterCommit` em seu observador. Se não houver uma transação de banco de dados em andamento, os manipuladores de eventos serão executados imediatamente:

```php
    <?php

    namespace App\Observers;

    use App\Models\User;
    use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

    class UserObserver implements ShouldHandleEventsAfterCommit
    {
        /**
         * Manipule o evento "criado" do usuário.
         */
        public function created(User $user): void
        {
            // ...
        }
    }
```

<a name="muting-events"></a>
### Silenciar Eventos

Você pode ocasionalmente precisar "silenciar" temporariamente todos os eventos disparados por um modelo. Você pode conseguir isso usando o método `withoutEvents`. O método `withoutEvents` aceita uma função como seu único argumento. Qualquer código executado dentro desta função não irá disparar eventos do modelo, e qualquer valor retornado pela função será retornado pelo método `withoutEvents`:

```php
    use App\Models\User;

    $user = User::withoutEvents(function () {
        User::findOrFail(1)->delete();

        return User::find(2);
    });
```

<a name="saving-a-single-model-without-events"></a>
#### Salvando um único modelo sem eventos

Às vezes você pode querer "salvar" um modelo específico sem disparar nenhum evento. Você pode fazer isso usando o método `saveQuietly`:

```php
    $user = User::findOrFail(1);

    $user->name = 'Victoria Faith';

    $user->saveQuietly();
```

Você também pode "atualizar", "excluir", "excluir suave", "restaurar" e "replicar" um modelo sem disparar nenhum evento.

```php
    $user->deleteQuietly();
    $user->forceDeleteQuietly();
    $user->restoreQuietly();
```
