# Eloquent: Começando

<a name="introduction"></a>
## Introdução

Laravel inclui o Eloquent, um mapeador relacional de objeto (ORM) que torna a interação com sua base de dados agradável. Ao usar o Eloquent, cada tabela do banco de dados tem um "Modelo" correspondente usado para interagir com essa tabela. Além de obter registros da tabela do banco de dados, os modelos Eloquent permitem inserir, atualizar e excluir registros dessa tabela também.

> Nota:
> Antes de começar, certifique-se de configurar uma conexão de banco de dados no seu arquivo de configuração do `config/database.php`. Para mais informações sobre a configuração do seu banco de dados, consulte [a documentação da configuração do banco de dados](/docs/database#configuration).

#### Laravel Bootcamp

Se você é novo no Laravel, sinta-se à vontade para mergulhar na [bootcamp do Laravel](https://bootcamp.laravel.com). O bootcamp do Laravel o guiará para construir seu primeiro aplicativo Laravel usando Eloquent. É uma ótima maneira de ter um passeio em tudo que o Laravel e o Eloquent têm a oferecer.

<a name="generating-model-classes"></a>
## Geração de Classes de Modelo

Para começar, vamos criar um modelo Eloquent. Os modelos geralmente vivem na pasta "app/Models" e estendem a classe "Illuminate\Database\Eloquent\Model". Você pode usar o comando "make:model" do Artisan para gerar um novo modelo:

```shell
php artisan make:model Flight
```

Se você gostaria de gerar um [migração de banco de dados]/docs/migrations quando gerar o modelo, você pode usar a opção `--migration` ou `-m`:

```shell
php artisan make:model Flight --migration
```

Você pode gerar outros tipos de classe quando criando um modelo como fábricas, semeadores, políticas, controladores e formulários de solicitação. Além disso, essas opções podem ser combinadas para criar várias classes a uma só vez:

```shell
# Generate a model and a FlightFactory class...
php artisan make:model Flight --factory
php artisan make:model Flight -f

# Generate a model and a FlightSeeder class...
php artisan make:model Flight --seed
php artisan make:model Flight -s

# Generate a model and a FlightController class...
php artisan make:model Flight --controller
php artisan make:model Flight -c

# Generate a model, FlightController resource class, and form request classes...
php artisan make:model Flight --controller --resource --requests
php artisan make:model Flight -crR

# Generate a model and a FlightPolicy class...
php artisan make:model Flight --policy

# Generate a model and a migration, factory, seeder, and controller...
php artisan make:model Flight -mfsc

# Shortcut to generate a model, migration, factory, seeder, policy, controller, and form requests...
php artisan make:model Flight --all
php artisan make:model Flight -a

# Generate a pivot model...
php artisan make:model Member --pivot
php artisan make:model Member -p
```

<a name="inspecting-models"></a>
#### Inspecionando modelos

Às vezes pode ser difícil determinar todos os atributos e as relações de um modelo apenas olhando para o código. Em vez disso, tente usar o comando Artisan 'model:show', que fornece uma visão geral conveniente dos atributos e das relações do seu modelo:

```shell
php artisan model:show Flight
```

<a name="eloquent-model-conventions"></a>
## Convenções Modelo Eloquentes

Modelos gerados pelo comando make:model serão colocados no diretório app/Models. Vamos analisar uma classe básica de modelo e discutir algumas das convenções-chave do Eloquent:

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
### Nomes das mesas

Depois de olhar o exemplo acima você pode ter notado que nós não dissemos ao Eloquent qual tabela do banco de dados corresponde a nosso modelo "Flight". Por convenção, o  "snake case", plural nome da classe será usado como o nome da tabela, a menos que outro nome seja explicitamente especificado. Então, neste caso, o Eloquent irá assumir que o modelo "Flight" armazena registros na tabela "flights", enquanto um modelo "AirTrafficController" armazenaria registros em uma tabela "air_traffic_controllers".

Se a tabela do banco de dados correspondente ao seu modelo não segue essa convenção, você pode especificar manualmente o nome da tabela do modelo definindo uma propriedade de "tabela" no modelo.

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'my_flights';
    }
```

<a name="primary-keys"></a>
### Chaves Primárias

eloquent também assumirá que cada tabela do banco de dados correspondente a um modelo tem uma coluna de chave primária chamada "id". Se necessário, você pode definir uma propriedade `$primaryKey` protegida em seu modelo para especificar uma coluna diferente que serve como sua chave primária:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * The primary key associated with the table.
         *
         * @var string
         */
        protected $primaryKey = 'flight_id';
    }
```

Além disso, o Eloquent assume que a chave primária é um valor inteiro incrementado, o que significa que o Eloquent irá automaticamente converter a chave primária em um inteiro. Se você quiser usar uma chave primária não incrementada ou não numérica você deve definir uma propriedade pública `$incrementing` em seu modelo que está definido como `false`:

```php
    <?php

    class Flight extends Model
    {
        /**
         * Indicates if the model's ID is auto-incrementing.
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
         * The data type of the primary key ID.
         *
         * @var string
         */
        protected $keyType = 'string';
    }
```

<a name="composite-primary-keys"></a>
#### "Chave composta"

O Eloquent exige que cada modelo tenha pelo menos um "ID" que o identifique de forma exclusiva, que pode servir como sua chave primária. As chaves primárias "compostas" não são suportadas pelos modelos Eloquent. Contudo, você é livre para adicionar índices exclusivos com múltiplos colunas às suas tabelas de banco, além da chave primária de identificação exclusiva da tabela.

<a name="uuid-and-ulid-keys"></a>
### Chaves UUID e ULID

Em vez de usar números incrementando automaticamente como suas chaves primárias de um modelo Eloquent, você pode optar por usar UUIDs em vez disso. Os UUID são identificadores alfanuméricos universalmente exclusivos que são 36 caracteres de comprimento.

Se você gostaria de um modelo usar uma chave UUID em vez de um inteiro incrementado automaticamente, você pode usar o `Illuminate\Database\Eloquent\Concerns\HasUuids` trait no modelo. Claro, você deve garantir que o modelo tenha uma [coluna de chave primária equivalente a UUID](/docs/migrations#column-method-uuid):

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

Por padrão, o traço `HasUuids` irá gerar ["ordenados" UUIDs](/docs/strings#method-str-ordered-uuid) para seus modelos. Estes UUIDs são mais eficientes para armazenamento de banco de dados indexado, porque podem ser ordenados lexicograficamente.

Você pode substituir o processo de geração do UUID para um determinado modelo definindo o método `newUniqueId` no modelo. Além disso, você pode especificar quais colunas devem receber UUIDs, definindo um método `uniqueIds` no modelo:

```php
    use Ramsey\Uuid\Uuid;

    /**
     * Generate a new UUID for the model.
     */
    public function newUniqueId(): string
    {
        return (string) Uuid::uuid4();
    }

    /**
     * Get the columns that should receive a unique identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['id', 'discount_code'];
    }
```

Se você quiser, você pode optar por utilizar "ULIDs" em vez de UUIDs. ULIDs são parecidos com UUIDs; no entanto, eles têm apenas 26 caracteres de comprimento. Tal como os UUIDs ordenados, ULIDs podem ser ordenados lexicograficamente para indexação eficiente do banco de dados. Para usar ULIDs, você deve utilizar o `Illuminate\Database\Eloquent\Concerns\HasUlids` trait em seu modelo. Você também deve garantir que o modelo tenha uma [coluna primária equivalente a ULID](/docs/migrations#column-method-ulid):

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

Por padrão, o Eloquent espera que existam as colunas 'created_at' e 'updated_at' na tabela correspondente do banco de dados do seu modelo. O Eloquent irá definir automaticamente os valores das colunas quando modelos são criados ou atualizados. Se você não deseja que essas colunas sejam gerenciadas automaticamente pelo Eloquent, você deve definir uma propriedade `$timestamps` no seu modelo com um valor de 'false':

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * Indicates if the model should be timestamped.
         *
         * @var bool
         */
        public $timestamps = false;
    }
```

Se você precisar personalizar o formato de seus timestamps no modelo, defina a propriedade `$dateFormat` do seu modelo. Esta propriedade determina como os atributos de data são armazenados no banco de dados, bem como seu formato quando o modelo é serializado em um array ou JSON:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * The storage format of the model's date columns.
         *
         * @var string
         */
        protected $dateFormat = 'U';
    }
```

Se você precisa de personalizar os nomes das colunas utilizadas para armazenar os carimbos de data/hora, você pode definir as constantes 'CREATED_AT' e 'UPDATED_AT' na sua classe modelo.

```php
    <?php

    class Flight extends Model
    {
        const CREATED_AT = 'creation_date';
        const UPDATED_AT = 'updated_date';
    }
```

Se você gostaria de realizar operações de modelo sem alterar o carimbo de data/hora do modelo, você pode realizar as operações dentro de um método de fechamento dado ao método 'semTimestamps':

```php
    Model::withoutTimestamps(fn () => $post->increment('reads'));
```

<a name="database-connections"></a>
### Conexões de Banco de Dados

Por padrão, todos os modelos Eloquent usarão a conexão padrão configurada para seu aplicativo. Se você gostaria de especificar uma conexão diferente que deve ser usada quando interagindo com um modelo específico, você deve definir a propriedade $connection no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * The database connection that should be used by the model.
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
         * The model's default values for attributes.
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
### Configurando a Rigorosa Eloquente

Laravel oferece vários métodos que permitem configurar o comportamento e "estrita" do Eloquent em uma variedade de situações.

Em primeiro lugar, o método 'preventLazyLoading' aceita um argumento booleano opcional que indica se deve-se evitar a carga preguiçosa. Por exemplo, você pode querer apenas desativar a carga preguiçosa em ambientes não-produção para que seu ambiente de produção continuará funcionando normalmente mesmo se um relacionamento carregado preguiçosamente estiver presente no código de produção por acidente. Tipicamente, este método deve ser invocado no método 'boot' do seu provedor de serviços de aplicação:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
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

Uma vez que você tenha criado um modelo e sua tabela de banco de dados associada ([escrevendo migrações](/docs/migrations#writing-migrations)), você está pronto para começar a obter dados do seu banco de dados. Você pode pensar em cada modelo Eloquent como um poderoso [builder de consultas](/docs/queries) permitindo-lhe consultar o banco de dados fluentemente na tabela de banco de dados associada ao modelo. O método 'all' do modelo irá recuperar todos os registros da tabela de banco de dados associada ao modelo:

```php
    use App\Models\Flight;

    foreach (Flight::all() as $flight) {
        echo $flight->name;
    }
```

<a name="building-queries"></a>
#### Construção de consultas

O método "all" do Eloquent retornará todos os resultados da tabela do modelo. No entanto, como cada modelo Eloquent serve como um [construidor de consultas](/docs/queries), você pode adicionar restrições adicionais às consultas e depois invocar o método 'get' para obter os resultados:

```php
    $flights = Flight::where('active', 1)
                   ->orderBy('name')
                   ->take(10)
                   ->get();
```

> [NOTA]
> Como os modelos Eloquent são construtores de consulta, você deve revisar todos os métodos fornecidos pelo [construtor de consulta] do Laravel (docs/queries). Você pode usar qualquer um desses métodos ao escrever suas consultas Eloquent.

<a name="refreshing-models"></a>
#### Modelos Refrescantes

Se já tiver uma instância de um modelo Eloquent que foi retirado do banco de dados, você pode "atualizar" o modelo usando os métodos 'fresh' e 'refresh'. O método 'fresh' irá re-recuperar o modelo do banco de dados. A instância existente do modelo não será afetada:

```php
    $flight = Flight::where('number', 'FR 900')->first();

    $freshFlight = $flight->fresh();
```

O método "refresh" irá reidratar o modelo existente utilizando dados frescos do banco de dados. Além disso, todas as suas relações carregadas também serão atualizadas:

```php
    $flight = Flight::where('number', 'FR 900')->first();

    $flight->number = 'FR 456';

    $flight->refresh();

    $flight->number; // "FR 900"
```

<a name="collections"></a>
### Coleções

Como vimos, métodos eloquentes como 'todos' e 'obter' recuperam vários registros do banco de dados. No entanto, esses métodos não retornam um array PHP simples. Em vez disso, é retornada uma instância de 'Illuminate\Database\Eloquent\Collection'.

A classe Eloquent 'Collection' estende a base 'Illuminate\Support\Collection' do Laravel, que fornece uma [variedade de métodos úteis](/docs/collections#available-methods) para interagir com coleções de dados. Por exemplo, o método 'reject' pode ser usado para remover modelos de uma coleção com base nos resultados de um closures invocado:

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function (Flight $flight) {
    return $flight->cancelled;
});
```

Além dos métodos fornecidos pela classe de coleção básica do Laravel, a classe de coleções Eloquent fornece [alguns métodos extras](/docs/eloquent-collections#available-methods) especificamente destinados para interagir com coleções de modelos Eloquent.

Como todas as coleções do Laravel implementam as interfaces iteráveis do PHP, você pode percorrer coleções como se elas fossem um array:

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### Resultados de Chunks

O seu aplicativo pode ficar sem memória se você tentar carregar dezenas de milhares de registros Eloquent através dos métodos 'all' ou 'get'. Em vez de usar esses métodos, o método 'chunk' pode ser usado para processar grandes números de modelos de maneira mais eficiente.

O método chunk irá obter um subconjunto de modelos Eloquent, passando-os para uma função de fechamento para processamento. Como só é obtido o atual pedaço de modelos Eloquent por vez, o método chunk irá fornecer significativamente uso reduzido de memória quando se trabalha com um grande número de modelos:

```php
use App\Models\Flight;
use Illuminate\Database\Eloquent\Collection;

Flight::chunk(200, function (Collection $flights) {
    foreach ($flights as $flight) {
        // ...
    }
});
```

O primeiro argumento passado para o método 'chunk' é o número de registros que você deseja receber por "chunk". O closure passado como segundo argumento será invocado para cada "chunk" que for obtido do banco de dados. Uma consulta ao banco de dados será executada para obter cada "chunk" de registros passados ao closure.

Se você está filtrando os resultados do método `chunk` com base em uma coluna que também será atualizada enquanto itera sobre os resultados, você deve usar o método `chunkById`. O uso do método `chunk` nesses cenários poderia levar a resultados inesperados e inconsistentes. Internamente, o método `chunkById` sempre irá buscar modelos com uma coluna 'id' maior que o último modelo no último 'chunk':

```php
Flight::where('departed', true)
    ->chunkById(200, function (Collection $flights) {
        $flights->each->update(['departed' => false]);
    }, $column = 'id');
```

<a name="chunking-using-lazy-collections"></a>
### Chunking usando Coleções Lenhivas

O método "lazy" funciona de maneira similar à [o método "chunk"](##chunking-results), no sentido que, nos bastidores, ele executa a consulta em partes. Porém, em vez de passar cada parte diretamente para uma callback como é, o método "lazy" retorna uma coleção de Eloquent modelos, que permite interagir com os resultados como um único fluxo:

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

Você pode filtrar os resultados baseados na ordem decrescente do id usando o método 'lazyByIdDesc'.

<a name="cursors"></a>
### Cursores

Semelhante ao método `lazy`, o método `cursor` pode ser usado para reduzir significativamente o consumo de memória do seu aplicativo quando iterar através de dezenas de milhares de registros de modelos Eloquent.

O método 'cursor' executará apenas uma única consulta do banco de dados, mas os modelos Eloquent individuais não serão hidratados até que eles sejam realmente iterados sobre. Portanto, somente um modelo Eloquent é mantido na memória em qualquer momento durante a iteração do cursor.

> ！[ALERTA]
> Como o método 'cursor' apenas mantém um modelo Eloquent na memória de cada vez, não é possível carregar relações de forma ansiosa. Se você precisa carregar relações de forma ansiosa, considere usar [o método 'lazy'](#chunking-using-lazy-collections) em vez disso.

Internamente, o método `cursor` utiliza as [geradoras](https://www.php.net/manual/pt_br/language.generators.overview.php) do PHP para implementar essa funcionalidade.

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    // ...
}
```

O cursor retorna uma instância de Illuminate\Support\LazyCollection . [Coleções lulas]/docs/coleções#coleções-lulas ) permitem que você utilize muitos dos métodos de coleção disponíveis nas coleções típicas do Laravel, enquanto carrega apenas um modelo na memória por vez.

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

Embora o método cursor utilize muito menos memória do que uma consulta normal (apenas armazenando um modelo Eloquent por vez na memória), ele eventualmente ainda vai esgotar a memória. Isso porque [o driver PDO do PHP armazena em cache todos os resultados das consultas brutas em seu buffer](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php). Se você está lidando com um grande número de registros Eloquent, considere usar o método lazy em vez disso.

<a name="advanced-subqueries"></a>
### Subconsultas avançadas

<a name="subquery-selects"></a>
#### Seleções de subconsulta

O Eloquent também oferece suporte avançado para subconsultas, o que permite a você buscar informações das tabelas relacionadas em uma única consulta. Por exemplo, vamos imaginar que temos uma tabela de `destinos` de voos e uma tabela de `voos` para destinos. A tabela de voos contém uma coluna `arrived_at` que indica quando o voo chegou ao destino.

Usando o subconsulta funcionalidade disponível para o construtor de consultas 'selecione' e 'addSelect' métodos, podemos selecionar todas as 'destinos' e o nome do voo que chegou recentemente a esse destino usando uma única consulta:

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
#### Ordenação de subconsultas

Além disso, a função "orderBy" do construtor de consultas suporta subconsultas. Continuando a usar nosso exemplo de vôo, podemos utilizar essa funcionalidade para classificar todos os destinos com base na hora da chegada do último vôo a esse destino. Novamente, isso pode ser feito enquanto executa uma única consulta ao banco de dados:

```php
    return Destination::orderByDesc(
        Flight::select('arrived_at')
            ->whereColumn('destination_id', 'destinations.id')
            ->orderByDesc('arrived_at')
            ->limit(1)
    )->get();
```

<a name="retrieving-single-models"></a>
## Recuperando Modelos Simples/Agregados

Além de buscar todos os registros correspondentes a uma consulta específica, você também pode buscar um único registro usando os métodos find(), first() ou firstWhere(). Em vez de retornar uma coleção de modelos, esses métodos retornam uma instância única do modelo:

```php
    use App\Models\Flight;

    // Retrieve a model by its primary key...
    $flight = Flight::find(1);

    // Retrieve the first model matching the query constraints...
    $flight = Flight::where('active', 1)->first();

    // Alternative to retrieving the first model matching the query constraints...
    $flight = Flight::firstWhere('active', 1);
```

Às vezes você pode querer executar alguma ação alternativa se nenhum resultado for encontrado. O método 'findOr' e 'firstOr' retornará uma única instância de modelo ou, se não houver resultados encontrados, executará a função fornecida. O valor retornado pela função será considerado o resultado do método:

```php
    $flight = Flight::findOr(1, function () {
        // ...
    });

    $flight = Flight::where('legs', '>', 3)->firstOr(function () {
        // ...
    });
```

<a name="not-found-exceptions"></a>
#### Not Found Exceções

Às vezes você pode querer lançar uma exceção se um modelo não for encontrado. Isso é particularmente útil em rotas ou controladores. Os métodos `findOrFail` e `firstOrFail` serão buscar o primeiro resultado da consulta; no entanto, se nenhum resultado é encontrado, uma exceção `Illuminate\Database\Eloquent\ModelNotFoundException` será lançada:

```php
    $flight = Flight::findOrFail(1);

    $flight = Flight::where('legs', '>', 3)->firstOrFail();
```

Se o 'ModelNotFoundException' não for pego, uma resposta de 404 HTTP será automaticamente enviada ao cliente:

```php
    use App\Models\Flight;

    Route::get('/api/flights/{id}', function (string $id) {
        return Flight::findOrFail($id);
    });
```

<a name="retrieving-or-creating-models"></a>
### Recuperando ou Criando Modelos

O método `firstOrCreate` tentará encontrar um registro de banco usando os pares de coluna / valor fornecidos. Se o modelo não puder ser encontrado no banco de dados, um registro será inserido com os atributos resultantes da fusão do primeiro argumento do array com o opcional segundo argumento do array:

O método firstOrNew, assim como o primeiro ou criar, tentará localizar um registro no banco de dados que corresponda aos atributos fornecidos. No entanto, se um modelo não for encontrado, uma nova instância do modelo será retornada. Note que o modelo retornado pelo primeiro ou novo não foi ainda persistido no banco de dados. Você precisará chamar manualmente o método salvar para torná-lo persistente:

```php
    use App\Models\Flight;

    // Retrieve flight by name or create it if it doesn't exist...
    $flight = Flight::firstOrCreate([
        'name' => 'London to Paris'
    ]);

    // Retrieve flight by name or create it with the name, delayed, and arrival_time attributes...
    $flight = Flight::firstOrCreate(
        ['name' => 'London to Paris'],
        ['delayed' => 1, 'arrival_time' => '11:30']
    );

    // Retrieve flight by name or instantiate a new Flight instance...
    $flight = Flight::firstOrNew([
        'name' => 'London to Paris'
    ]);

    // Retrieve flight by name or instantiate with the name, delayed, and arrival_time attributes...
    $flight = Flight::firstOrNew(
        ['name' => 'Tokyo to Sydney'],
        ['delayed' => 1, 'arrival_time' => '11:30']
    );
```

<a name="retrieving-aggregates"></a>
### Recuperando Agregados

Ao interagir com modelos Eloquent você também pode usar o `count`, `sum`, `max` e outros métodos de [agregação](docs/queries#aggregates) fornecidos pelo Laravel [builder de consulta](docs/queries). Como você poderia esperar, esses métodos retornam um valor escalar em vez de uma instância de Eloquent:

```php
    $count = Flight::where('active', 1)->count();

    $max = Flight::where('active', 1)->max('price');
```

<a name="inserting-and-updating-models"></a>
## Inserindo e Atualizando Modelos

<a name="inserts"></a>
### Inserções

É claro que ao usar Eloquent não apenas precisamos de buscar modelos do banco de dados, também precisamos inserir novos registros. Felizmente, o Eloquent torna isso simples. Para inserir um novo registro no banco de dados, você deve criar uma nova instância do modelo e definir atributos para ele. Então, chame o método 'save' na instância do modelo:

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
         * Store a new flight in the database.
         */
        public function store(Request $request): RedirectResponse
        {
            // Validate the request...

            $flight = new Flight;

            $flight->name = $request->name;

            $flight->save();

            return redirect('/flights');
        }
    }
```

Neste exemplo atribuímos o campo 'name' da requisição HTTP à variável 'name' do modelo 'App\Models\Flight'. Quando chamamos o método 'save', um registro será inserido no banco de dados. Os timestamps 'created_at' e 'updated_at' do modelo serão automaticamente definidos quando chamarmos o método 'save', portanto não há necessidade de definir manualmente.

Alternativamente você pode usar o método 'create' para "salvar" um novo modelo usando uma única declaração de php. A instância do modelo inserido será retornada a você pelo método 'create':

```php
    use App\Models\Flight;

    $flight = Flight::create([
        'name' => 'London to Paris',
    ]);
```

Porém, antes de usar o método create(), você precisará especificar uma propriedade fillable ou guarded na classe do modelo. Essas propriedades são necessárias porque todos os modelos Eloquent são protegidos contra as vulnerabilidades da atribuição em massa por padrão. Para saber mais sobre a atribuição em massa, consulte [a documentação da atribuição em massa](#mass-assignment).

<a name="updates"></a>
### Atualizações

O método 'save' também pode ser usado para atualizar modelos que já existem no banco de dados. Para atualizar um modelo, você deverá obtê-lo e definir qualquer atributo que deseja atualizar. Em seguida, você deve chamar o método 'save' do modelo. Novamente, o carimbo de data e hora 'updated_at' será atualizado automaticamente, portanto não há necessidade de definir manualmente seu valor:

```php
    use App\Models\Flight;

    $flight = Flight::find(1);

    $flight->name = 'Paris to London';

    $flight->save();
```

Ocasionalmente, você pode precisar atualizar um modelo existente ou criar um novo se não existir um que corresponda. Semelhante ao método `firstOrCreate`, o método `updateOrCreate` persiste o modelo, então não há necessidade de chamar manualmente o método `save`.

No exemplo abaixo se houver um voo com uma localização de partida em Oakland e uma localização de destino em San Diego, suas colunas "preço" e "desconto" serão atualizadas. Se não houver tal voo, será criado um novo voo que tenha os atributos resultantes do argumento array 1 mesclado com o segundo argumento array:

```php
    $flight = Flight::updateOrCreate(
        ['departure' => 'Oakland', 'destination' => 'San Diego'],
        ['price' => 99, 'discounted' => 1]
    );
```

<a name="mass-updates"></a>
#### Atualizações em massa

Atualizações também podem ser feitas em modelos que correspondem a uma consulta. Neste exemplo, todos os voos que são "ativos" e têm um destino de "San Diego" serão marcados como atrasados:

```php
    Flight::where('active', 1)
          ->where('destination', 'San Diego')
          ->update(['delayed' => 1]);
```

O método `update` espera uma matriz de pares de coluna e valor representando as colunas que devem ser atualizadas. O método `update` retorna o número de linhas afetadas.

> (!Aviso)
> Ao emitir uma atualização em massa via Eloquent, os eventos do modelo 'saving', 'saved', 'updating' e 'updated' não serão acionados para os modelos atualizados. Isso porque os modelos nunca são realmente buscados ao emitir uma atualização em massa.

<a name="examining-attribute-changes"></a>
#### Examinando Mudanças no Atributo

Eloquent fornece os métodos `isDirty`, `isClean` e `wasChanged` para examinar o estado interno do seu modelo e determinar como seus atributos foram alterados desde que o modelo foi originalmente obtido.

O método `isDirty` determina se algum dos atributos do modelo foi modificado desde que ele foi recuperado. Você pode passar um nome específico de atributo ou um array de atributos para o método `isDirty`, para determinar se algum dos atributos está "sujos". O método `isClean` determinará se um atributo permaneceu inalterado desde que o modelo foi recuperado. Este método também aceita um parâmetro opcional de atributo:

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

O método 'wasChanged' determina se algum atributo foi alterado quando o modelo foi salvo pela última vez dentro do ciclo de solicitação atual. Se necessário, você pode passar um nome de atributo para ver se um atributo específico foi alterado:

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

O método `getOriginal` retorna um array contendo os atributos originais do modelo independentemente de quaisquer alterações ao modelo desde que ele foi recuperado. Se necessário, você pode passar um nome específico do atributo para obter o valor original de um atributo específico:

```php
    $user = User::find(1);

    $user->name; // John
    $user->email; // john@example.com

    $user->name = "Jack";
    $user->name; // Jack

    $user->getOriginal('name'); // John
    $user->getOriginal(); // Array of original attributes...
```

<a name="mass-assignment"></a>
### Mass Assignment em inglês, é Atribuição em massa

Você pode usar o método "create" para "salvar" um novo modelo usando uma única declaração de PHP. A instância do modelo inserida será devolvida a você pelo método:

```php
    use App\Models\Flight;

    $flight = Flight::create([
        'name' => 'London to Paris',
    ]);
```

Porém, antes de usar o método "create", você precisará especificar uma propriedade "fillable" ou "guarded" em sua classe de modelo. Essas propriedades são necessárias porque todos os modelos Eloquent são protegidos contra vulnerabilidades de atribuição em massa por padrão.

Uma vulnerabilidade de atribuição em massa ocorre quando um usuário passa um campo inesperado na requisição HTTP e esse campo altera uma coluna no seu banco de dados que você não esperava. Por exemplo, um usuário malicioso pode enviar o parâmetro `is_admin` através de uma requisição HTTP, que é então passado para o método `create` do seu modelo, permitindo ao usuário se promover a administrador.

Então para começar, você deve definir quais atributos do modelo que deseja fazer atribuíveis em massa. Você pode fazer isso usando a propriedade `$fillable` no modelo. Por exemplo, vamos tornar o atributo `name` de nosso modelo `Flight` atribuível em massa:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * The attributes that are mass assignable.
         *
         * @var array
         */
        protected $fillable = ['name'];
    }
```

Uma vez que você especificou quais atributos são mass atribuíveis, você pode usar o método 'create' para inserir um novo registro no banco de dados. O método 'create' retorna uma nova instância do modelo criado:

```php
    $flight = Flight::create(['name' => 'London to Paris']);
```

Se já tiver uma instância de modelo, pode usar o método "fill" para preencher com um array de atributos:

```php
    $flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a name="mass-assignment-json-columns"></a>
#### Mass Assignment e Colunas JSON

Ao atribuir colunas JSON, cada coluna’s mass assignable key deve ser especificada na matriz `$fillable` do seu modelo. Para segurança, o Laravel não suporta a atualização de atributos JSON aninhados ao utilizar a propriedade `guarded`:

```php
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'options->enabled',
    ];
```

<a name="allowing-mass-assignment"></a>
#### Permitindo Atribuição em Massa

Se você gostaria que todos os seus atributos fossem mass-assignáveis, pode definir a propriedade `$guarded` do seu modelo como um array vazio. Se você escolher deixar seu modelo desprotegido, deve tomar cuidado especial para sempre passar arrays artesanais para as metodologias `fill`, `create` e `update`:

```php
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];
```

<a name="mass-assignment-exceptions"></a>
#### Exceções de Atribuição em Massa

Por padrão, atributos que não estão incluídos no array `$fillable` são descartados silenciosamente quando operações de atribuição em massa são executadas. Em produção, esse é o comportamento esperado; porém, durante a fase local do desenvolvimento pode gerar confusão sobre porque as alterações no modelo não estão sendo aplicadas.

Se desejar, você pode instruir o Laravel a lançar uma exceção quando tentar preencher um atributo que não é possível preencher invocando o método `preventSilentlyDiscardingAttributes`. Normalmente esse método deve ser invocado no método `boot` da classe de seu provedor de serviços `AppServiceProvider`:

```php
    use Illuminate\Database\Eloquent\Model;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
    }
```

<a name="upserts"></a>
### Fundações

O método Eloquent 'upsert' pode ser usado para atualizar ou criar registros em uma única operação atômica. O primeiro argumento do método consiste nos valores a serem inseridos ou atualizados, enquanto o segundo argumento enumera a coluna (s) que identificam exclusivamente os registros na tabela associada. O terceiro e último argumento é um array das colunas que devem ser atualizadas se um registro correspondente já existir no banco de dados. A operação 'upsert' definirá automaticamente as timestamps 'created_at' e 'updated_at' se as datas estiverem ativadas no modelo:

```php
    Flight::upsert([
        ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
        ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
    ], uniqueBy: ['departure', 'destination'], update: ['price']);
```

> ¡ADVERTENCIA!
> Todos os bancos de dados, exceto o SQL Server, exigem que as colunas na segunda argumento do método 'upsert' tenha um "primary" ou "unique" index. Além disso, o driver do banco de dados MySQL ignora a segunda argumento do método 'upsert' e sempre usa os índices "primary" e "unique" da tabela para detectar registros existentes.

<a name="deleting-models"></a>
## Excluindo Modelos

Para apagar um modelo, você pode chamar o método 'delete' na instância do modelo.

```php
    use App\Models\Flight;

    $flight = Flight::find(1);

    $flight->delete();
```

Você pode chamar o método 'truncate' para excluir todos os registros do banco de dados associados ao modelo. A operação 'truncate' também irá reajustar quaisquer IDs incrementados automaticamente na tabela associada do modelo:

```php
    Flight::truncate();
```

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### Deletando um Modelo Existente pelo Chave Primária

No exemplo acima, estamos recuperando o modelo do banco de dados antes de chamar o método 'delete'. No entanto, se você souber a chave primária do modelo, poderá excluí-lo sem recuperá-lo explicitamente, chamando o método 'destroy'. Além de aceitar a única chave primária, o método 'destroy' também aceita várias chaves primárias, um array de chaves primárias ou uma [coleção](/docs/collections) de chaves primárias:

```php
    Flight::destroy(1);

    Flight::destroy(1, 2, 3);

    Flight::destroy([1, 2, 3]);

    Flight::destroy(collect([1, 2, 3]));
```

> [AVISO!]
> O método 'destroy' carrega cada modelo individualmente e chama o método 'delete' para que os eventos 'deleting' e 'deleted' sejam despachados corretamente para cada modelo.

<a name="deleting-models-using-queries"></a>
#### Deletando Modelos Utilizando Consultas

Claro, você pode construir uma consulta eloquente para excluir todos os modelos que correspondem aos critérios da sua consulta. Neste exemplo, vamos excluir todos os voos marcados como inativos. Como as atualizações em massa, as exclusões em massa não disparam eventos do modelo para os modelos excluídos:

```php
    $deleted = Flight::where('active', 0)->delete();
```

> [AVERTENÇÃO!]
> Ao executar uma instrução de exclusão em massa via Eloquent, os eventos do modelo 'deleting' e 'deleted' não serão enviados para os modelos excluídos. Isso ocorre porque os modelos nunca são realmente recuperados ao executar a instrução de exclusão.

<a name="soft-deleting"></a>
### Exclusão Suave

Além de realmente remover registros do seu banco de dados, Eloquent também pode "soft delete" modelos. Quando os modelos são soft deleted, eles não são realmente removidos do seu banco de dados. Em vez disso, um atributo `deleted_at` é definido no modelo indicando a data e hora em que o modelo foi "excluído". Para habilitar soft deletes para um modelo, adicione o `Illuminate\Database\Eloquent\SoftDeletes` trait para o modelo:

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

> [!NOTA]
> A trait SoftDeletes irá fazer o casting do atributo deleted_at para um objeto DateTime / Carbon para você de forma automática.

Você também deve adicionar a coluna 'deleted_at' à sua tabela de banco de dados. O Laravel [builder de esquema] contém um método auxiliar para criar essa coluna:

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

Agora, quando você chama o método `delete` no modelo, a coluna `deleted_at` será definida para a data e hora atuais. No entanto, o registro do banco de dados do modelo será deixado na tabela. Quando consultando um modelo que usa exclusões suaves, os modelos excluídos suavemente serão automaticamente excluídos de todos os resultados da consulta.

Para determinar se uma determinada instância de modelo foi excluída suavemente, você pode usar o método `trashed`:

```php
    if ($flight->trashed()) {
        // ...
    }
```

<a name="restoring-soft-deleted-models"></a>
#### Restaurando Modelos Excluídos e Recuperados

Às vezes, você pode querer "desapagar" um modelo que foi excluído suavemente. Para restaurar um modelo suavemente excluído, você pode chamar o método `restaurar` em uma instância do modelo. O método `restaurar` irá definir a coluna `excluida_em` do modelo para `nulo`:

```php
    $flight->restore();
```

Você também pode usar o método 'restaurar' em um pedido para restaurar vários modelos. Novamente, como outras "operações de massa", isso não enviará nenhum evento do modelo para os modelos que são restaurados:

```php
    Flight::withTrashed()
            ->where('airline_id', 1)
            ->restore();
```

O método "restore" também pode ser usado ao construir [consultas de relacionamento](/docs/eloquent-relationships):

```php
    $flight->history()->restore();
```

<a name="permanently-deleting-models"></a>
#### Apagando modelos permanentemente

Às vezes você pode precisar de verdade remover um modelo do seu banco de dados. Você pode usar o método "forceDelete" para remover permanentemente um modelo excluído com carimbo de data e hora do banco de dados da tabela:

```php
    $flight->forceDelete();
```

Você também pode usar o método `forceDelete` quando estiver construindo consultas de relacionamento Eloquent:

```php
    $flight->history()->forceDelete();
```

<a name="querying-soft-deleted-models"></a>
### Consultar Modelos Excluídos Suavemente

<a name="including-soft-deleted-models"></a>
#### Incluindo Modelos Apagados suavemente

Como mencionado acima, modelos excluídos automaticamente serão excluídos dos resultados da consulta. No entanto, você pode forçar modelos excluídos a serem incluídos em um resultado da consulta chamando o método `withTrashed` na consulta:

```php
    use App\Models\Flight;

    $flights = Flight::withTrashed()
                    ->where('account_id', 1)
                    ->get();
```

O método `withTrashed` pode ser chamado também ao construir uma [consulta de relacionamento]('s/docs/eloquent-relationships')

```php
    $flight->history()->withTrashed()->get();
```

<a name="retrieving-only-soft-deleted-models"></a>
#### Recuperando modelos excluídos apenas em soft delete

A função 'onlyTrashed' vai recuperar **apenas** modelos excluídos com suavidade.

```php
    $flights = Flight::onlyTrashed()
                    ->where('airline_id', 1)
                    ->get();
```

<a name="pruning-models"></a>
## Modelagem de poda

Às vezes você pode querer excluir periodicamente modelos que não são mais necessários. Para conseguir isso, você pode adicionar o trait Illuminate/Database/Eloquent/Prunable ou o trait Illuminate/Database/Eloquent/MassPrusable aos modelos que você gostaria de podar periodicamente. Depois de adicionar um dos traits ao modelo, implemente um método prunable que retorne um Eloquent query builder que resolva os modelos que não são mais necessários:

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
         * Get the prunable model query.
         */
        public function prunable(): Builder
        {
            return static::where('created_at', '<=', now()->subMonth());
        }
    }
```

Ao marcar modelos como "Podáveis", você também pode definir um método "podar" no modelo. Este método será chamado antes do modelo ser excluído. Este método pode ser útil para excluir quaisquer recursos adicionais associados ao modelo, como arquivos armazenados, antes que o modelo seja permanentemente removido do banco de dados:

```php
    /**
     * Prepare the model for pruning.
     */
    protected function pruning(): void
    {
        // ...
    }
```

Após configurar o seu modelo podável, você deve agendar a execução da ação `model:prune` no arquivo `routes/console.php` do seu aplicativo. Você é livre para escolher o intervalo apropriado em que a ação deve ser executada.

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('model:prune')->daily();
```

Nos bastidores, o comando 'model:prune' irá detectar automaticamente os modelos "Prune-able" dentro do diretório de modelos da aplicação 'app/Models'. Se os seus modelos estiverem em um local diferente, você pode usar a opção '--model' para especificar as classes de modelo.

```php
    Schedule::command('model:prune', [
        '--model' => [Address::class, Flight::class],
    ])->daily();
```

Se você deseja excluir certos modelos de serem podados enquanto todos os outros detectados são podados, pode usar a opção `--except`:

```php
    Schedule::command('model:prune', [
        '--except' => [Address::class, Flight::class],
    ])->daily();
```

Você pode testar sua consulta 'prune' executando o comando 'model:prune' com a opção '--pretend'. Quando no modo de simulação, o comando 'model:prune' simplesmente relatará quantos registros seriam prunados se o comando fosse executado na verdade.

```shell
php artisan model:prune --pretend
```

> [ALERTA]
> Modelos de exclusão suave serão permanentemente excluídos (`forceDelete`) se corresponderem à consulta de exclusão.

<a name="mass-pruning"></a>
#### Podagem em massa

Quando os modelos são marcados com a trait `Illuminate\Database\Eloquent\MassPrunable`, os modelos são excluídos do banco de dados usando consultas de exclusão em massa. Portanto, o método 'pruning' não será invocado, nem serão acionados o evento 'deleting' e o 'deleted' dos modelos. Isso se deve ao fato que os modelos nunca são realmente recuperados antes da exclusão, tornando o processo de poda muito mais eficiente:

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
         * Get the prunable model query.
         */
        public function prunable(): Builder
        {
            return static::where('created_at', '<=', now()->subMonth());
        }
    }
```

<a name="replicating-models"></a>
## Modelos de Réplica

Você pode criar uma cópia não salva de uma instância de modelo existente usando o método 'replicar'. Este método é particularmente útil quando você tem instâncias de modelos que compartilham muitos dos mesmos atributos.

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

Para excluir um ou mais atributos da replicação no novo modelo, você pode passar uma matriz para o método 'replicate':

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

Escopos globais permitem adicionar restrições a todos os consultas de um modelo dado. A funcionalidade [soft delete](#soft-deleting) do Laravel utiliza escopos globais para recuperar somente modelos "não excluídos" do banco de dados. Escrever seus próprios escopos globais pode fornecer uma maneira conveniente e fácil de garantir que cada consulta de um modelo dado recebe determinadas restrições.

<a name="generating-scopes"></a>
#### Gerando Escopos

Para gerar um novo escopo global, você pode invocar o comando Artisan make:scope, que colocará o escopo gerado no diretório app/Models/Scopes da sua aplicação:

```shell
php artisan make:scope AncientScope
```

<a name="writing-global-scopes"></a>
#### Escopo de Escrita Global

Escrever uma classe com escopo global é simples. Primeiro, use o comando `make:scope` para gerar uma classe que implementa a interface `Illuminate\Database\Eloquent\Scope`. A interface `Scope` exige que você implemente um método: `apply`. O método `apply` pode adicionar restrições `where` ou outros tipos de cláusulas à consulta conforme necessário:

```php
    <?php

    namespace App\Models\Scopes;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Scope;

    class AncientScope implements Scope
    {
        /**
         * Apply the scope to a given Eloquent query builder.
         */
        public function apply(Builder $builder, Model $model): void
        {
            $builder->where('created_at', '<', now()->subYears(2000));
        }
    }
```

> Nota:
> Se o seu escopo global é adicionar colunas à cláusula de seleção da consulta, você deve usar o método `addSelect` em vez do método `select`. Isso impedirá a substituição acidental da cláusula de seleção existente na consulta.

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

Ou você pode registrar manualmente a extensão global substituindo o método do modelo 'booted' e invocando o método 'addGlobalScope' do modelo. O método 'addGlobalScope' aceita uma instância de sua extensão como seu único argumento:

```php
    <?php

    namespace App\Models;

    use App\Models\Scopes\AncientScope;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The "booted" method of the model.
         */
        protected static function booted(): void
        {
            static::addGlobalScope(new AncientScope);
        }
    }
```

Após adicionar o escopo no exemplo acima para o modelo 'App\Models\User', uma chamada ao método 'User::all()' irá executar a seguinte consulta SQL:

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a name="anonymous-global-scopes"></a>
#### Escopos Globais Anônimos

O Eloquent também permite definir escopos globais usando closures, o que é particularmente útil para escopos simples que não precisam de uma classe separada. Ao definir um escopo global usando um closure, você deve fornecer um nome do escopo de sua própria escolha como o primeiro argumento para o método `addGlobalScope`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The "booted" method of the model.
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

Se você quiser remover um escopo global para uma determinada consulta, pode usar o método `withoutGlobalScope`. Este método aceita apenas o nome da classe do escopo global como argumento.

```php
    User::withoutGlobalScope(AncientScope::class)->get();
```

Ou se você definiu o escopo global usando um closure, então deve passar a string de nome que você atribuiu ao escopo global:

```php
    User::withoutGlobalScope('ancient')->get();
```

Se você gostaria de remover vários ou até mesmo todos os escopos globais da consulta, você pode usar o método `withoutGlobalScopes`:

```php
    // Remove all of the global scopes...
    User::withoutGlobalScopes()->get();

    // Remove some of the global scopes...
    User::withoutGlobalScopes([
        FirstScope::class, SecondScope::class
    ])->get();
```

<a name="local-scopes"></a>
### Escopos Locais

Os escopos locais permitem que você defina conjuntos comuns de restrições de consulta que você pode reutilizar facilmente em toda sua aplicação. Por exemplo, você pode precisar frequentemente recuperar todos os usuários considerados "populares". Para definir um escopo, prefique um método de modelo Eloquent com `scope`.

Os escopos devem sempre retornar a mesma instância do construtor de consultas ou `void`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Scope a query to only include popular users.
         */
        public function scopePopular(Builder $query): void
        {
            $query->where('votes', '>', 100);
        }

        /**
         * Scope a query to only include active users.
         */
        public function scopeActive(Builder $query): void
        {
            $query->where('active', 1);
        }
    }
```

<a name="utilizing-a-local-scope"></a>
#### Utilizando o escopo local

Uma vez que o escopo foi definido, você pode chamar os métodos de escopo durante a consulta do modelo. No entanto, não é preciso incluir o prefixo 'scope' ao chamar o método. Você pode até mesmo encadear chamadas para vários escopos:

```php
    use App\Models\User;

    $users = User::popular()->active()->orderBy('created_at')->get();
```

Combinando vários escopos de modelo Eloquent por meio de um operador de consulta 'ou' pode exigir o uso de fechaduras para alcançar a [grupagem lógica](/docs/queries#logical-grouping) correta:

```php
    $users = User::popular()->orWhere(function (Builder $query) {
        $query->active();
    })->get();
```

Porém, pois isso pode ser complicado, o Laravel fornece um método 'orWhere' de ordem superior que permite encadear escopos fluentemente sem uso de closures.

```php
    $users = User::popular()->orWhere->active()->get();
```

<a name="dynamic-scopes"></a>
#### Escopos dinâmicos

Às vezes você pode querer definir uma área que aceite parâmetros. Para começar, basta acrescentar seus parâmetros adicionais à assinatura do seu método de escopo. Os parâmetros de escopo devem ser definidos após o parâmetro `$query`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Scope a query to only include users of a given type.
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

Às vezes, você pode precisar determinar se dois modelos são "os mesmos" ou não. Você pode usar os métodos `is` e `isNot` para verificar rapidamente se dois modelos têm a mesma chave primária, tabela e conexão com o banco de dados ou não:

```php
    if ($post->is($anotherPost)) {
        // ...
    }

    if ($post->isNot($anotherPost)) {
        // ...
    }
```

Os métodos `is` e `isNot` estão disponíveis também ao utilizar as relações `belongsTo`, `hasOne`, `morphTo` e `morphOne` [relações]. Este método é particularmente útil quando você gostaria de comparar um modelo relacionado sem emitir uma consulta para obter este modelo:

```php
    if ($post->author()->is($user)) {
        // ...
    }
```

<a name="events"></a>
## Eventos

> Nota:
> Quer transmitir seus eventos Eloquent diretamente para o lado do cliente do seu aplicativo? Veja a [transmissão de evento de modelo]( /docs/broadcasting #model-broadcasting ) do Laravel.

Modelos eloquentes disparam vários eventos, permitindo que você se conecte aos seguintes momentos em um ciclo de vida do modelo: 'recuperado', 'criando', 'criado', 'atualizando', 'atualizado', 'guardando', 'guardado', 'excluindo', 'excluído', 'apagando', 'forçando a excluir', 'forçando excluído', 'restaurando', 'restaurado' e 'replicando'.

O evento 'retrieved' será enviado quando um modelo existente é recuperado do banco de dados. Quando um novo modelo é salvo pela primeira vez, os eventos 'creating' e 'created' serão enviados. Os eventos 'updating' / 'updated' serão enviados quando um modelo existente for modificado e o método 'save' for chamado. Os eventos 'saving' / 'saved' serão enviados quando um modelo for criado ou atualizado - mesmo que os atributos do modelo não tenham sido alterados. Eventos com nome terminando em '-ing' serão enviados antes de qualquer alteração ao modelo ser armazenada, enquanto eventos com nomes terminando em '-ed' serão enviados depois das alterações ao modelo serem armazenadas.

Para começar a escutar eventos de modelo, defina uma propriedade `dispatchesEvents` no seu Eloquent modelo. Esta propriedade mapeia vários pontos do ciclo de vida do Eloquent modelo para suas próprias [classes de evento](/docs/events). Cada classe de modelo de evento espera receber uma instância do modelo afetado via sua construção:

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
         * The event map for the model.
         *
         * @var array<string, string>
         */
        protected $dispatchesEvents = [
            'saved' => UserSaved::class,
            'deleted' => UserDeleted::class,
        ];
    }
```

Após definir e mapear seus eventos Eloquent, você pode usar [event listeners](/docs/events#defining-listeners) para tratar os eventos.

> [ALERTA]
> Ao lançar uma consulta de atualização ou exclusão em massa por Eloquent, os eventos 'salvo', 'atualizado', 'excluindo' e 'excluído' não serão acionados para os modelos afetados. Isso ocorre porque os modelos nunca são realmente recuperados ao executar atualizações ou exclusões em massa.

<a name="events-using-closures"></a>
### Usando Closures

Em vez de usar classes de eventos personalizados, você pode registrar funções de retorno que são executadas quando vários eventos de modelo são enviados. Geralmente, você deve registrar essas funções no método 'bootado' do seu modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The "booted" method of the model.
         */
        protected static function booted(): void
        {
            static::created(function (User $user) {
                // ...
            });
        }
    }
```

Se necessário, você pode utilizar [eventos de escuta anônimos que podem ser inseridos em fila](https://docs.laravel.com/events#queuable-anonymous-event-listeners) ao registrar eventos do modelo. Isso instruirá o Laravel a executar o ouvinte de eventos do modelo em segundo plano usando sua aplicação' s [fila](https://docs.laravel.com/queues):

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

Se você estiver escutando muitos eventos em um modelo específico, pode usar observadores para agrupar todos os seus ouvintes em uma classe única. As classes de observador têm nomes de métodos que refletem os eventos Eloquent que você deseja escutar. Cada um desses métodos recebe o modelo afetado como seu único argumento. O Artisan 'make:observer' é a maneira mais fácil de criar uma nova classe de observador:

```shell
php artisan make:observer UserObserver --model=User
```

Esse comando colocará o novo observador no seu diretório 'app/Observers'. Se esse diretório não existir, Artisan o criará para você. Seu novo observador deve parecer algo assim:

```php
    <?php

    namespace App\Observers;

    use App\Models\User;

    class UserObserver
    {
        /**
         * Handle the User "created" event.
         */
        public function created(User $user): void
        {
            // ...
        }

        /**
         * Handle the User "updated" event.
         */
        public function updated(User $user): void
        {
            // ...
        }

        /**
         * Handle the User "deleted" event.
         */
        public function deleted(User $user): void
        {
            // ...
        }
        
        /**
         * Handle the User "restored" event.
         */
        public function restored(User $user): void
        {
            // ...
        }

        /**
         * Handle the User "forceDeleted" event.
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

Ou, você pode manualmente registrar um observador invocando o método 'observar' no modelo que você deseja observar. Você pode registrar observadores no método de inicialização da classe de seu aplicativo 'AppServiceProvider':

```php
    use App\Models\User;
    use App\Observers\UserObserver;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        User::observe(UserObserver::class);
    }
```

> (!NOTA)
> Existem eventos adicionais que o observador pode escutar, como "salvar" e "recuperado". Esses eventos são descritos dentro da documentação de [eventos](#eventos).

<a name="observers-and-database-transactions"></a>
#### Observadores e transações de banco de dados

Ao criar modelos dentro de uma transação de banco de dados, você pode querer instruir um observador a executar apenas seus manipuladores de eventos após a transação de banco de dados ser confirmada. Você pode fazer isso implementando a interface `ShouldHandleEventsAfterCommit` no seu observador. Se uma transação de banco de dados não estiver em andamento, os manipuladores de eventos serão executados imediatamente:

```php
    <?php

    namespace App\Observers;

    use App\Models\User;
    use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

    class UserObserver implements ShouldHandleEventsAfterCommit
    {
        /**
         * Handle the User "created" event.
         */
        public function created(User $user): void
        {
            // ...
        }
    }
```

<a name="muting-events"></a>
### Eventos silenciosos

Você talvez precise "silenciar" temporariamente todos os eventos disparados por um modelo. Você pode conseguir isso usando o método `withoutEvents`. O método `withoutEvents` aceita uma função como seu único argumento. Qualquer código executado dentro dessa função não irá distribuir eventos do modelo e qualquer valor retornado pela função será retornado pelo método `withoutEvents`:

```php
    use App\Models\User;

    $user = User::withoutEvents(function () {
        User::findOrFail(1)->delete();

        return User::find(2);
    });
```

<a name="saving-a-single-model-without-events"></a>
#### Salvando um único modelo sem eventos

Às vezes você pode querer "salvar" um determinado modelo sem despachar nenhum evento. Você pode realizar isso usando o método `saveQuietly`:

```php
    $user = User::findOrFail(1);

    $user->name = 'Victoria Faith';

    $user->saveQuietly();
```

Você também pode "atualizar", "excluir", "excluir suavemente", "restaurar" e "replicar" um modelo sem disparar nenhum evento:

```php
    $user->deleteQuietly();
    $user->forceDeleteQuietly();
    $user->restoreQuietly();
```
