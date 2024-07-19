# Eloquent: Introdução

<a name="introduction"></a>
## Introdução

 O Laravel inclui o Eloquent, um mapeador objeto-relacional (ORM) que facilita a interação com seu banco de dados. Ao usar o Eloquent, cada tabela do banco de dados tem um "model" correspondente, utilizado para interagir com essa tabela. Além da recuperação de registros da tabela do banco de dados, os modelos Eloquent permitem inserção, atualização e exclusão de registros na tabela.

 > [!ATENÇÃO]
 [ documentação do banco de dados básico] (//docs/database#configuration).

#### Bootcamp do Laravel

 Se é novo no Laravel, pode iniciar o [Laravel Bootcamp](https://bootcamp.laravel.com). O Bootcamp guia-lo na construção da sua primeira aplicação Laravel utilizando Eloquent. É uma ótima forma de conhecer tudo que o Laravel e a Eloquent têm para oferecer.

<a name="generating-model-classes"></a>
## Gerando classes modelo

 Para começar, vamos criar um modelo Eloquent. Normalmente os modelos estão no diretório `app\Models` e eles herdam da classe `Illuminate\Database\Eloquent\Model`. Você pode usar o comando [Comando Artisan] (`make:model`) para gerar um novo modelo:

```shell
php artisan make:model Flight
```

 Se você quiser gerar uma migração de banco de dados ao gerar o modelo, poderá usar a opção `--migration` ou `-m`:

```shell
php artisan make:model Flight --migration
```

 Você pode gerar outros tipos de classes quando estiver gerenciando seu modelo. Por exemplo, fábricas, sementes, políticas, controladores e pedidos em formulários. Além disso, essas opções podem ser combinadas para criar várias classes de uma só vez:

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
#### Inspecionando os modelos

 Às vezes pode ser difícil determinar todos os atributos e relações disponíveis de um modelo apenas folheando o seu código. Em vez disso, experimente o comando Artisan `model:show`, que fornece uma vista conveniente de todos os atributos e relações do modelo:

```shell
php artisan model:show Flight
```

<a name="eloquent-model-conventions"></a>
## Convenções dos modelos eloqüentes

 Os modelos gerados pelo comando `make:model` serão colocados no diretório `app/Models`. Examinemos uma classe de modelo básica e discutamos algumas das principais convenções do Eloquent:

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

 Depois de analisar o exemplo acima, você deve ter notado que não comunicamos à Eloquent qual a tabela de banco de dados correspondente ao nosso modelo `Flight`. Por convenção, o nome da classe em "caixa baixa" e plural será usado como nome da tabela, a menos que outro nome seja especificado explicitamente. Dessa forma, nesse caso, Eloquent assumirá que o modelo `Flight` armazena registros na tabela `flights`, enquanto um modelo `AirTrafficController` armazenaria registros na tabela `air_traffic_controllers`.

 Se a tabela de banco de dados correspondente do seu modelo não seguir essa convenção, você pode especificar o nome da tabela manualmente, definindo uma propriedade `table` no modelo:

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
### Chaves primárias

 A classe Eloquent irá também assumir que cada tabela de base de dados do modelo tem uma coluna chave primária chamada `id`. Se necessário, você pode definir uma propriedade `$primaryKey` protegida no seu modelo para especificar outra coluna como a chave primária do modelo:

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

 Além disso, o Eloquent presume que a chave primária é um valor de inteiro crescente, o que significa que o Eloquent convertirá automaticamente a chave primária em um número inteiro. Se você quiser usar uma chave primária que não seja incrementável ou numérica, defina uma propriedade `$incrementing` pública no seu modelo com valor `false`:

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

 Se a chave primária do seu modelo não for um número inteiro, você deve definir uma propriedade `$keyType` protegida em seu modelo. Essa propriedade deve ter um valor de `string`:

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
#### Chaves primárias compostas

 O Eloquent requer que cada modelo tenha ao menos um "ID" exclusivamente identificador que possa servir como chave primária. Os "Composite keys" não são suportados pelos modelos Eloquent. No entanto, você pode adicionar indexadores únicos de várias colunas a tabelas do banco de dados além da chave primária exclusivamente identificadora da tabela.

<a name="uuid-and-ulid-keys"></a>
### Chaves UUID e ULID

 Em vez de usar números inteiros com incremento automático como chaves primárias do seu modelo Eloquent, você pode optar por utilizar identificadores UUID (Universally Unique Identifier). Os identificadores UUID são identificadores alfanuméricos universais e 36 caracteres.

 Se pretender que o modelo utilize uma chave UUID em vez de um número inteiro com incremento automático, pode utilizar o traço `Illuminate\Database\Eloquent\Concerns\HasUuids` no modelo. Naturalmente, deve garantir que o modelo tem uma [coluna primária de equivalente a UUID](/docs/migrations#column-method-uuid):

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

 Por padrão, a característica `HasUuids` irá gerar identificadores ÚNICOS (UUIDs) para os modelos. Estes identificadores são mais eficazes para armazenamento em banco de dados indexado, porque podem ser ordenados lexicograficamente.

 Você pode substituir o processo de geração do UUID de um determinado modelo definindo um método `newUniqueId` no modelo. Além disso, você pode especificar quais colunas devem receber UUIDs definindo um método `uniqueIds` no modelo:

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

 Se você quiser, pode escolher utilizar "ULIDs" ao invés de UUIDs. As ULIDs são semelhantes aos UUIDs; no entanto, possuem apenas 26 caracteres em sua comprimento. Assim como os UUIDs ordenados, as ULIDs podem ser classificadas lexicograficamente para um indexação de banco de dados eficiente. Para utilizar ULIDs, você deve usar o trato `Illuminate\Database\Eloquent\Concerns\HasUlids` em seu modelo. Você também deve garantir que o modelo tenha uma coluna com o [equivalente de ULID como chave principal] (en/docs/migrations#column-method-ulid):

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
### Horários

 Por padrão, o Eloquent espera que as colunas `created_at` e `updated_at` existam na tabela do modelo correspondente. O Eloquent definirá automaticamente os valores dessas colunas quando os modelos forem criados ou atualizados. Se você não quiser que essas colunas sejam gerenciadas automaticamente pelo Eloquent, defina uma propriedade `$timestamps` em seu modelo com um valor de `false`:

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

 Se você precisar personalizar o formato dos horários do seu modelo, defina a propriedade `$dateFormat` em seu modelo. Essa propriedade determina como os atributos de data são armazenados no banco de dados, bem como seu formato quando o modelo é serializado para um array ou JSON:

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

 Se você precisar personalizar os nomes das colunas usadas para armazenar os timestamp, poderá definir as constantes `CREATED_AT` e `UPDATED_AT` em seu modelo:

```php
    <?php

    class Flight extends Model
    {
        const CREATED_AT = 'creation_date';
        const UPDATED_AT = 'updated_date';
    }
```

 Se você quiser realizar operações no modelo sem que o horário de atualização seja modificado, pode operar com ele dentro da lista dada ao método `withoutTimestamps`:

```php
    Model::withoutTimestamps(fn () => $post->increment('reads'));
```

<a name="database-connections"></a>
### Conexões de base de dados

 Por padrão, todos os modelos Eloquent usarão a conexão de banco de dados que está configurada para sua aplicação. Se você preferir especificar uma conexão diferente que deve ser usada ao interagir com um modelo particular, defina uma propriedade `$connection` no modelo:

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

 Por padrão, uma instância de modelo recém-instanciada não contém nenhum valor do atributo. Se você desejar definir os valores dos atributos por padrão para o seu modelo, pode definir uma propriedade `$attributes` em seu modelo. Os valores dos atributos colocados no array `$attributes` devem estar em formato bruto ou "armazenável", como se estivessem sendo lidos do banco de dados:

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
### Configure a rigidez de Eloquent

 O Laravel oferece vários métodos que permitem configurar o comportamento do Eloquent e sua "rigidez" em uma variedade de situações.

 Primeiro, o método `preventLazyLoading` aceita um argumento booleano opcional que indica se a carregamento adiado deve ser impedido. Por exemplo, você pode querer desativar somente o carregamento adiado em ambientes de produção para que seu ambiente de produção funcione normalmente mesmo se houver um relacionamento carregado de forma adiada presente no código de produção. Normalmente, esse método deve ser invocado no método `boot` do `AppServiceProvider` da sua aplicação:

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

 Você também pode instruir o Laravel a jogar uma exceção ao tentar preencher um atributo que não possa ser preenchido, chamando o método `preventSilentlyDiscardingAttributes`. Isso pode ajudar a evitar erros inesperados durante o desenvolvimento local ao tentar definir um atributo que ainda não tenha sido adicionado à matriz `fillable` do modelo:

```php
Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
```

<a name="retrieving-models"></a>
## Recuperando modelos

 Depois de criar um modelo e sua tabela associada [de banco de dados](/docs/migrations#writing-migrations), você está pronto para começar a recuperar dados do seu banco de dados. Podemos pensar em cada modelo Eloquent como um poderoso [construtor de consultas](/docs/queries) que permite consultar a tabela associada ao modelo com facilidade. O método `all` do modelo recuperará todos os registros da tabela de banco de dados associada ao modelo:

```php
    use App\Models\Flight;

    foreach (Flight::all() as $flight) {
        echo $flight->name;
    }
```

<a name="building-queries"></a>
#### Consultas de construção

 O método `all` do Eloquent irá retornar todos os resultados da tabela do modelo. No entanto, dado que cada modelo Eloquent serve como um [Construtor de Queries](/docs/queries), você poderá adicionar restrições adicionais às consultas e então chamar o método `get` para recuperar os resultados:

```php
    $flights = Flight::where('active', 1)
                   ->orderBy('name')
                   ->take(10)
                   ->get();
```

 > [!ATENÇÃO]
 [Construtor de consultas](/docs/queries) Você pode usar qualquer um desses métodos ao escrever suas consultas do Eloquent.

<a name="refreshing-models"></a>
#### Modelos revigorantes

 Se você já tiver uma instância de um modelo Eloquent que foi recuperado da base de dados, poderá "atualizar" o modelo utilizando as seguintes métodos: `fresh` e `refresh`. O método `fresh` irá novamente recuperar o modelo na base de dados. A instância existente do modelo não será afetada:

```php
    $flight = Flight::where('number', 'FR 900')->first();

    $freshFlight = $flight->fresh();
```

 O método `refresh` hidratará o modelo existente usando dados atualizados do banco de dados. Além disso, todos os relacionamentos carregados serão também atualizados:

```php
    $flight = Flight::where('number', 'FR 900')->first();

    $flight->number = 'FR 456';

    $flight->refresh();

    $flight->number; // "FR 900"
```

<a name="collections"></a>
### Coleções

 Como vimos, os métodos Eloquent como `all` e `get` recuperam vários registros da base de dados. No entanto, estes métodos não retornam um conjunto simples de matriz PHP. Em vez disso, uma instância de `Illuminate\Database\Eloquent\Collection` é retornada.

 A classe Eloquent Collection deriva da base Illuminate\Support\Collection, que fornece uma variedade de métodos úteis para interagir com coleções de dados. Por exemplo, o método `reject` pode ser usado para remover modelos de uma coleção com base nos resultados de um bloco chamado:

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function (Flight $flight) {
    return $flight->cancelled;
});
```

 Além dos métodos previstos na classe Collection de base do Laravel, a classe Collection Eloquent disponibiliza alguns métodos extras [aqui](/docs/eloquent-collections#available-methods) que se destinam especificamente à interação com conjuntos de modelos Eloquent.

 Como todas as coleções de Laravel implementam interfaces iteráveis do PHP, você pode looper sobre elas como se fossem um array:

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### Resultados do Chunking

 Se você tentar carregar dezenas de milhares de registros Eloquent por meio dos métodos `all` ou `get`, sua aplicação pode ficar sem memória. Em vez disso, o método `chunk` poderá ser usado para processar um grande número de modelos com maior eficiência.

 O método `chunk` recuperará um subconjunto de modelos Eloquent e os passará para um fecho para processamento. Como apenas o atual grupo de modelos Eloquent é recuperado por vez, esse método permite uma utilização da memória significativamente reduzida quando se trabalha com um grande número de modelos:

```php
use App\Models\Flight;
use Illuminate\Database\Eloquent\Collection;

Flight::chunk(200, function (Collection $flights) {
    foreach ($flights as $flight) {
        // ...
    }
});
```

 O primeiro argumento passado ao método `chunk` é o número de registos que pretende receber por "pedaço". O fecho passado como segundo argumento será invocado para cada pedaço obtido na base de dados. Será executada uma query à base de dados para obter cada pedaço de registos passado ao fecho.

 Se estiver a filtrar os resultados do método `chunk`, com base numa coluna que também pretende atualizar ao iterar pelos resultados, deverá utilizar o método `chunkById`. O uso deste último método pode levar a resultados inesperados e inconsistentes. Internamente, o método `chunkById` irá sempre recuperar modelos com uma coluna `id` maior do que o modelo mais recente do bloco anterior:

```php
Flight::where('departed', true)
    ->chunkById(200, function (Collection $flights) {
        $flights->each->update(['departed' => false]);
    }, $column = 'id');
```

<a name="chunking-using-lazy-collections"></a>
### Fazer fragmentação usando coleções laxas

 O método `lazy` funciona da mesma forma que o [método `chunk`](/docs/eloquent/collection-methods#chunking-results) no sentido de que, por trás dos bastidores, executa a query em pedaços. No entanto, ao invés de passar cada pedaço diretamente para um callback como é feito, o método `lazy` retorna uma coleção [`LazyCollection`](/docs/collections#lazy-collections) de modelos Eloquent, que permite interagir com os resultados como se fosse um fluxo único:

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    // ...
}
```

 Se você estiver filtrando os resultados do método `lazy` com base em uma coluna que também estará atualizando enquanto itere pelos resultados, use o método `lazyById`. Internamente, o método `lazyById` sempre recupera modelos com uma coluna `id` maior do que o último modelo no bloco anterior:

```php
Flight::where('departed', true)
    ->lazyById(200, $column = 'id')
    ->each->update(['departed' => false]);
```

 É possível filtrar os resultados com base na ordem decrescente do `id`, usando o método `lazyByIdDesc`.

<a name="cursors"></a>
### O cursor

 Semelhante ao método `lazy`, o método `cursor` pode ser usado para reduzir significativamente o consumo de memória da aplicação quando se estiver fazendo uma iteração através de dezenas de milhares de registros do modelo Eloquent.

 O método `cursor` irá executar apenas uma única consulta de base de dados; no entanto, os modelos Eloquent individuais não serão hidratados até que sejam realmente itinerados. Por conseguinte, apenas um modelo Eloquent é mantido na memória a qualquer momento durante a iteração do cursor.

 > [AVERIGEMENTO DE ERRO]
 Em vez disso, use o método `lazy` (#Porção usando coleções lazidas).

 Internamente, o método `cursor` usa os geradores do PHP [disponíveis](https://www.php.net/manual/en/language.generators.overview.php) para implementar essa funcionalidade:

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    // ...
}
```

 O cursor retorna uma instância `Illuminate\Support\LazyCollection`. [Coleções Laxas] (/) permitem o uso de muitos dos métodos de coleção disponíveis em coleções típicas do Laravel, enquanto apenas carrega um único modelo na memória por vez:

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

 Embora o método `cursor` use muito menos memória que uma consulta regular (apenas mantendo um único modelo Eloquent em memória por vez), ele ainda irá eventualmente esgotar a memória. Isso ocorre devido ao driver PDO do PHP armazenar internamente todos os resultados de consultas brutos no buffer. Se você estiver lidando com um grande número de registros Eloquent, considere usar [o método `lazy` (método atrasado)](#chunking-using-lazy-collections).

<a name="advanced-subqueries"></a>
### Sub-consultas Avançadas

<a name="subquery-selects"></a>
#### Subquery Seletiva

 O Eloquent também suporta consultas embutidas, que permitem extrair informações de tabelas relacionadas numa única consulta. Por exemplo, vamos imaginar que temos uma tabela com destinos de voos e outra tabela com os próprios voos para esses destinos. A tabela dos voos contém a coluna "arrived_at" (chegada), que indica quando o voo chegou ao seu destino.

 Usando a funcionalidade de sub-consulta disponível nos métodos `select` e `addSelect` do constructor de consultas, podemos selecionar todas as "destinos" e o nome da passagem que chegou mais recentemente nesse destino usando uma única consulta:

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
#### Ordem de sub-consulta

 Além disso, o `orderBy` da consulta suporta subconsultas. Continuando com nosso exemplo de voos, podemos usar esta funcionalidade para ordenar todas as origens por quando foi realizado o último voo que chegou a cada uma delas. Mais uma vez, isso pode ser feito executando apenas uma consulta ao banco de dados:

```php
    return Destination::orderByDesc(
        Flight::select('arrived_at')
            ->whereColumn('destination_id', 'destinations.id')
            ->orderByDesc('arrived_at')
            ->limit(1)
    )->get();
```

<a name="retrieving-single-models"></a>
## Recuperação de modelos/agregados individuais

 Além de recuperar todos os registros que sejam correspondentes à uma consulta dada, você também pode recuperar um registro individual usando o método `find`, `first` ou `firstWhere`. Em vez de retornarem uma coleção de modelos, esses métodos retornam uma única instância do modelo:

```php
    use App\Models\Flight;

    // Retrieve a model by its primary key...
    $flight = Flight::find(1);

    // Retrieve the first model matching the query constraints...
    $flight = Flight::where('active', 1)->first();

    // Alternative to retrieving the first model matching the query constraints...
    $flight = Flight::firstWhere('active', 1);
```

 Às vezes você pode desejar realizar alguma outra ação se nenhum resultado for encontrado. Os métodos `findOr` e `firstOr` retornam uma única instância de modelo ou, se nenhum resultado for encontrado, executam o fecho dado. O valor retornado pelo fecho será considerado como o resultado do método:

```php
    $flight = Flight::findOr(1, function () {
        // ...
    });

    $flight = Flight::where('legs', '>', 3)->firstOr(function () {
        // ...
    });
```

<a name="not-found-exceptions"></a>
#### Exceções "Não Encontrado"

 Às vezes você pode querer lançar uma exceção se um modelo não for encontrado. Isso é especialmente útil em rotas ou controladores. As funções `findOrFail` e `firstOrFail` irão recuperar o primeiro resultado da consulta. No entanto, caso nenhum resultado seja encontrado, será lançada uma exceção de modelo não encontrado:

```php
    $flight = Flight::findOrFail(1);

    $flight = Flight::where('legs', '>', 3)->firstOrFail();
```

 Se a `ModelNotFoundException` não for capturada, um resposta HTTP de 404 será automaticamente enviado de volta ao cliente:

```php
    use App\Models\Flight;

    Route::get('/api/flights/{id}', function (string $id) {
        return Flight::findOrFail($id);
    });
```

<a name="retrieving-or-creating-models"></a>
### Recuperar ou criar modelos

 O método `firstOrCreate` tentará localizar um registro de banco de dados com base nas colunas e valores especificadas. Se o modelo não for encontrado no banco de dados, um registro será inserido com os atributos resultantes da fusão do primeiro argumento de matriz com o segundo argumento de matriz opcional:

 A função `firstOrNew`, assim como `firstOrCreate`, tenta encontrar um registro na base de dados com os atributos indicados. No entanto, se não conseguir localizar o modelo, é retornada uma nova instância do mesmo. Note que o modelo retornado por `firstOrNew` ainda não está salvo na base de dados. Deve chamar manualmente a função `save`, para o fazer:

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
### Recuperar agregados

 Quando interagindo com os modelos de Eloquent, você pode também usar o `count`, `sum`, `max` e outros [métodos de agregação] (https://docs.Laravel.com/pt-BR/queries#aggregates) fornecidos pelo [construtor de consultas do Laravel] (https://docs.Laravel.com/pt-BR/queries). Como esperado, esses métodos retornam um valor escalar em vez de uma instância do modelo Eloquent:

```php
    $count = Flight::where('active', 1)->count();

    $max = Flight::where('active', 1)->max('price');
```

<a name="inserting-and-updating-models"></a>
## Inserir e Atualizar Modelos

<a name="inserts"></a>
### Inserções

 Claro que, ao usar Eloquent, precisamos não apenas recuperar modelos do banco de dados. Precisamos também inserir novos registros. Por sorte, a Eloquent facilita isso. Para inserir um novo registro no banco de dados, você deve instanciar uma nova instância do modelo e definir os atributos no modelo. Em seguida, chame o método `save` na instância do modelo:

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

 Neste exemplo, atribuímos o campo `name` da solicitação HTTP recebida ao atributo `name` da instância do modelo de voo `App\Models\Flight`. Ao invocarmos o método `save`, um registro será inserido na base de dados. Os marcadores temporais `created_at` e `updated_at` do modelo são definidos automaticamente quando chamamos o método `save`, pelo que não é necessário definir manualmente essas marcações temporais.

 Em alternativa, você pode usar o método `create` para "salvar" um novo modelo usando uma única instrução PHP. A instância do modelo inserida será retornada pelo método `create`:

```php
    use App\Models\Flight;

    $flight = Flight::create([
        'name' => 'London to Paris',
    ]);
```

 No entanto, antes de usar o método `create`, você terá que especificar uma propriedade `fillable` ou `guarded`. Estas propriedades são necessárias porque todos os modelos Eloquent estão protegidos contra vulnerabilidades da atribuição em massa por padrão. Para saber mais sobre a atribuição em massa, consulte a documentação [sobre atribuição em massa] (http://laravel.com/docs/eloquent#mass-assignment).

<a name="updates"></a>
### Atualizações

 O método `save` pode ser utilizado também para atualizar modelos que já existem na base de dados. Para atualizar um modelo, você deve recuperá-lo e definir os atributos que deseja atualizar. Em seguida, deve chamar o método `save` do modelo. Mais uma vez, a marca de data (`updated_at`) será automaticamente atualizada. Portanto, não há necessidade de defini-la manualmente:

```php
    use App\Models\Flight;

    $flight = Flight::find(1);

    $flight->name = 'Paris to London';

    $flight->save();
```

 Ocasionalmente, você pode precisar atualizar um modelo existente ou criar um novo modelo se não existir nenhum modelo correspondente. Assim como o método `firstOrCreate`, o método `updateOrCreate` persiste o modelo, então não é necessário chamar manualmente o método `save`.

 No exemplo abaixo, se houver uma viagem com um local de partida de `Oakland` e um local de destino de `San Diego`, suas colunas "preço" e "desconto" serão atualizadas. Se não houver tal voo, ele criará um novo voo que tem os atributos resultantes da fusão do primeiro array argumento com o segundo array argumento:

```php
    $flight = Flight::updateOrCreate(
        ['departure' => 'Oakland', 'destination' => 'San Diego'],
        ['price' => 99, 'discounted' => 1]
    );
```

<a name="mass-updates"></a>
#### Atualizações em massa

 Atualizações também podem ser executadas em modelos que correspondam à uma consulta dada. Neste exemplo, todos os voos ativos com destino "San Diego" serão marcados como atrasados:

```php
    Flight::where('active', 1)
          ->where('destination', 'San Diego')
          ->update(['delayed' => 1]);
```

 O método `update` espera uma matriz de pares coluna-valor representando as colunas que serão atualizadas. O método `update` retorna o número de linhas afetadas.

 > [!AVISO]
 > Ao emitir uma atualização em massa via Eloquent, os eventos de modelo `saving`, `saved`, `updating` e `updated` não serão disparados para os modelos atualizados. Isso ocorre porque os modelos nunca são realmente recuperados ao emitir uma atualização em massa.

<a name="examining-attribute-changes"></a>
#### Análise das alterações de atributos

 O Eloquent fornece os métodos `isDirty`, `isClean` e `wasChanged` para analisar o estado interno do seu modelo e determinar como seus atributos mudaram desde que ele foi originalmente recuperado.

 O método `isDirty` determina se algum dos atributos do modelo foi alterado desde que o modelo foi recuperado. É possível passar um nome de atributo específico ou uma matriz de atributos ao método `isDirty` para determinar se qualquer um dos atributos está "sujo". O método `isClean` determina se um atributo permaneceu inalterado desde que o modelo foi recuperado. Este método também aceita um argumento de atributo opcional:

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

 O método `wasChanged` determina se foram alterados atributos quando o modelo foi salvo pela última vez no ciclo de solicitação em curso. Se necessário, pode ser passado um nome de atributo para verificar se um determinado atributo foi alterado:

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

 O método `getOriginal` retorna uma matriz contendo os atributos originais do modelo, independentemente de quaisquer alterações ocorridas no modelo desde que este tenha sido obtido. Caso seja necessário, pode-se passar um nome de atributo específico para obter o valor original de um determinado atributo:

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
### Atribuição em massa

 Você pode usar o método `create` para "salvar" um novo modelo usando uma única instrução PHP. A instância do modelo inserida é devolvida ao usuário pelo método:

```php
    use App\Models\Flight;

    $flight = Flight::create([
        'name' => 'London to Paris',
    ]);
```

 No entanto, antes de usar o método `create`, você precisará especificar uma propriedade `fillable` ou `guarded` na sua classe do modelo. Essas propriedades são necessárias porque todos os modelos Eloquent são protegidos contra vulnerabilidades de atribuição em massa, por padrão.

 Uma vulnerabilidade de atribuição em massa ocorre quando um usuário passa um campo inesperado no seu pedido HTTP e este campo alterar uma coluna que não esperava encontrar na sua base de dados. Por exemplo, um utilizador malicioso pode enviar um parâmetro `is_admin` através do seu pedido HTTP, sendo então passado para a função `create` do seu modelo, permitindo assim ao utilizador tornar-se administrador.

 Então, para começar, você deve definir quais atributos de modelo deseja fazer atribuíveis em massa. Você pode fazer isso usando a propriedade `$fillable` no modelo. Por exemplo, vamos tornar o atributo `name` do nosso modelo `Flight` atribuível em massa:

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

 Depois de especificado quais atributos são atribuídos em massa, você poderá usar o método `create` para inserir um novo registro no banco de dados. O método `create` retorna a instância do modelo que foi criada:

```php
    $flight = Flight::create(['name' => 'London to Paris']);
```

 Se você já tiver uma instância do modelo, poderá utilizar o método `fill()` para preenchê-la com um array de atributos:

```php
    $flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a name="mass-assignment-json-columns"></a>
#### Atribuição em massa e colunas JSON

 Ao atribuir colunas JSON, a chave de atribuição em massa de cada coluna deve ser especificada no array `$fillable` do modelo. Para segurança, o Laravel não suporta a atualização de atributos JSON aninhados quando usando a propriedade `guarded`:

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
#### Permitir atribuição de funções em massa

 Se você preferir que todos os seus atributos possam ser atribuídos em massa, pode definir a propriedade `$guarded` do modelo como um array vazio. Caso opte por não proteger seu modelo, deverá ter cuidado extra ao passar arrays para as rotinas `fill()`, `create()` e `update()` da Eloquent:

```php
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];
```

<a name="mass-assignment-exceptions"></a>
#### Exceções de atribuição em massa

 Por padrão, os atributos que não estiverem incluídos no array `$fillable` são silenciosamente descartados durante operações de atribuição em massa. No entanto, durante o desenvolvimento local, isto pode causar confusão, dado que modelos mudam e não têm efeito.

 Se desejar, você pode instruir o Laravel a lançar uma exceção ao tentar preencher um atributo não-preenchível invocando o método `preventSilentlyDiscardingAttributes`. Normalmente, esse método deve ser invocado no método `boot` da classe de provedor do aplicativo:

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
### Upserts

 O método `upsert` do Eloquent pode ser usado para atualizar ou criar registros em uma única operação. O primeiro argumento do método é formado pelos valores a inserir ou atualizar, enquanto o segundo argumento lista as colunas que identificam os registros exclusivamente na tabela associada. O terceiro e último argumento é uma matriz das colunas que serão atualizadas caso um registro correspondente já exista no banco de dados. O método `upsert` definirá automaticamente as marcações de data de criação e atualização se o modelo tiver o recurso habilitado:

```php
    Flight::upsert([
        ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
        ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
    ], uniqueBy: ['departure', 'destination'], update: ['price']);
```

 > [AVERTISSEMENTO]
 > Todas as bases de dados exceto o SQL Server exigem que as colunas no segundo argumento do método `upsert` tenham um índice "principal" ou "único". Além disso, o driver de banco de dados MySQL ignora o segundo argumento do método `upsert` e sempre usa os índices "principais" e "únicos" da tabela para detectar registos existentes.

<a name="deleting-models"></a>
## Excluindo modelos

 Para remover um modelo é possível chamar o método `delete` na instância do modelo:

```php
    use App\Models\Flight;

    $flight = Flight::find(1);

    $flight->delete();
```

 Você pode chamar o método `truncate` para excluir todos os registros do banco de dados associados ao modelo. A operação `truncate` também reinicia quaisquer IDs auto-incrementando na tabela associada ao modelo:

```php
    Flight::truncate();
```

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### Exemplo 1: deletar um modelo por meio da chave primária

 No exemplo acima, estamos recuperando o modelo do banco de dados antes de chamar o método `delete`. No entanto, se você souber a chave primária do modelo, poderá apagar o modelo sem recuperá-lo explicitamente chamando o método `destroy`. Além disso, o método `destroy` aceita uma única chave primária, um array de chaves primárias ou uma coleção de chaves primárias.

```php
    Flight::destroy(1);

    Flight::destroy(1, 2, 3);

    Flight::destroy([1, 2, 3]);

    Flight::destroy(collect([1, 2, 3]));
```

 > Atenção!
 > O método `destroy` carrega cada modelo individualmente e chama o método `delete`, de modo que os eventos `deletando` e `excluído` são devidamente distribuídos para cada modelo.

<a name="deleting-models-using-queries"></a>
#### Excluir modelos usando consultas

 Claro que você pode criar uma consulta Eloquent para excluir todos os modelos que atendam aos critérios da sua consulta. Neste exemplo, nós excluiremos todos os voos marcados como inativos. Como as atualizações em massa, a exclusão também não dispara eventos de modelo para os modelos que são excluídos:

```php
    $deleted = Flight::where('active', 0)->delete();
```

 > [!AVISO]
 > Ao executar uma declaração de exclusão em massa por meio do Eloquent, os eventos `deleting` e `deleted` do modelo não serão disparados para os modelos excluídos. Isso ocorre porque os modelos nunca são realmente recuperados ao executar a declaração de exclusão.

<a name="soft-deleting"></a>
### Excluir de maneira suave

 Além de remover realmente os registos da sua base de dados, o Eloquent também permite apagar modelos "em versão provisória". Quando um modelo é apagado em "versão provisória", não é efetivamente removido da base de dados. Em vez disso, um atributo `deleted_at` é definido no modelo indicando a data e hora em que o mesmo foi apagado: Para habilitar apagamentos provisórios num modelo, adicione o traço `Illuminate\Database\Eloquent\SoftDeletes` ao modelo:

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

 > [!AVISO]
 > A característica `SoftDeletes` automaticamente converte o atributo `deleted_at` para uma instância de `DateTime`/`Carbon`.

 Você também deve adicionar uma coluna para o campo `deleted_at`. O Gerador de Esquema do Laravel possui um método que ajuda você a criar essa coluna:

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

 Agora, ao chamar o método `delete` do modelo, a coluna `deleted_at` será definida como a data e hora atuais. No entanto, o registro de banco de dados do modelo permanecerá na tabela. Ao consultar um modelo que use eliminações temporárias, os modelos eliminados temporariamente serão excluídos automaticamente de todos os resultados da query.

 Para determinar se uma dada instância de modelo foi excluída silenciosamente, você pode usar o método `trashed`:

```php
    if ($flight->trashed()) {
        // ...
    }
```

<a name="restoring-soft-deleted-models"></a>
#### Restauração de modelos excluídos suavemente

 Às vezes, poderá desejar "desfazer" o apagamento de um modelo. Para restaurar um modelo apagado temporariamente, pode chamar a método `restore` numa instância de modelo. O método `restore` define a coluna do modelo `deleted_at` como `null`:

```php
    $flight->restore();
```

 Você também pode usar o método `restore` em uma consulta para restaurar vários modelos. Novamente, assim como outras operações "em massa", isso não irá disparar nenhum evento de modelo para os modelos que foram restaurados:

```php
    Flight::withTrashed()
            ->where('airline_id', 1)
            ->restore();
```

 O método `restore` também pode ser utilizado ao construir consultas de relacionamentos [Eloquent](/docs/eloquent-relationships):

```php
    $flight->history()->restore();
```

<a name="permanently-deleting-models"></a>
#### Exclusão de Modelos permanentemente

 Por vezes, poderá precisar de remover realmente um modelo do banco de dados. Pode utilizar o método `forceDelete` para remover permanentemente um modelo apagado suavemente da tabela do banco de dados:

```php
    $flight->forceDelete();
```

 Você pode também usar o método `forceDelete` ao construir consultas de relacionamentos Eloquent:

```php
    $flight->history()->forceDelete();
```

<a name="querying-soft-deleted-models"></a>
### Consultar modelos suavemente excluídos

<a name="including-soft-deleted-models"></a>
#### Incluindo modelos excluídos em soft delete

 Conforme observado acima, os modelos apagados silenciosamente são automaticamente excluídos dos resultados das consultas. No entanto, é possível incluir esses modelos nas consultas através da chamada do método `withTrashed` na consulta:

```php
    use App\Models\Flight;

    $flights = Flight::withTrashed()
                    ->where('account_id', 1)
                    ->get();
```

 O método `withTrashed` também pode ser chamado ao construir uma consulta de relacionamentos:

```php
    $flight->history()->withTrashed()->get();
```

<a name="retrieving-only-soft-deleted-models"></a>
#### Recuperação de modelos somente excluídos por falta de espaço

 O método `onlyTrashed` recuperará apenas os modelos soft deletados:

```php
    $flights = Flight::onlyTrashed()
                    ->where('airline_id', 1)
                    ->get();
```

<a name="pruning-models"></a>
## Reduzir modelos

 Às vezes, você pode querer deletar periodicamente os modelos que não são mais necessários. Para fazer isso, você pode adicionar o tráfego `Illuminate\Database\Eloquent\Prunable` ou `Illuminate\Database\Eloquent\MassPrunable` aos modelos que deseja deletar periodicamente. Após a adição de um dos traços para o modelo, implemente um método `prunable` que retorne uma ferramenta de consulta Eloquent que resolva os modelos que não são mais necessários:

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

 Ao marcar um modelo como "Que pode ser removido", você também poderá definir um método de remoção no modelo. Esse método é chamado antes que o modelo seja excluído. O método pode ser útil para remover quaisquer recursos associados ao modelo, como arquivos armazenados, antes da exclusão do modelo permanentemente do banco de dados:

```php
    /**
     * Prepare the model for pruning.
     */
    protected function pruning(): void
    {
        // ...
    }
```

 Depois de configurar seu modelo deletável, você deve agendar o comando "modelo:apagar" do Artisan no arquivo `routes/console.php` da sua aplicação. Você pode escolher qualquer intervalo adequado para a execução deste comando:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('model:prune')->daily();
```

 Por trás dos bastidores, o comando `model:prune` irá automaticamente detectar os modelos "elimináveis" na pasta `app/Models` da sua aplicação. Se os seus modelos se encontram num local diferente, poderá utilizar a opção `--model` para especificar os nomes das classes de modelo:

```php
    Schedule::command('model:prune', [
        '--model' => [Address::class, Flight::class],
    ])->daily();
```

 Se pretender excluir alguns modelos da poda de todos os outros modelos detetados, utilize a opção `--except`:

```php
    Schedule::command('model:prune', [
        '--except' => [Address::class, Flight::class],
    ])->daily();
```

 Você pode testar sua consulta `prunable` executando o comando `model:prune` com a opção `--pretend`. Quando fingimos, o comando `model:prune` relata simplesmente quantos registros seriam apagados caso ele fosse realmente executado:

```shell
php artisan model:prune --pretend
```

 > [!AVISO]
 > Os modelos excluídos de maneira suave serão permanentemente eliminados (`forceDelete`) se estiverem relacionados à consulta que pode ser removida.

<a name="mass-pruning"></a>
#### Poda em massa

 Quando os modelos são marcados com a `Illuminate\Database\Eloquent\MassPrunable` característica, os modelos são excluídos do banco de dados usando consultas de exclusão em massa. Por conseguinte, o método `pruning` não será invocado e também não serão enviados os eventos de modelo `deleting` e `deleted`. Isso porque os modelos nunca são realmente recuperados antes da exclusão, tornando assim o processo de pruneamento muito mais eficiente:

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
## Replicação de Modelos

 Pode criar uma cópia não salva de uma instância do modelo existente através da metodologia `replicate`. Esta metodologia é particularmente útil quando tem várias instâncias do modelo com muitos dos mesmos atributos:

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

 Para excluir um ou mais atributos a serem replicados para o novo modelo, você pode passar uma matriz para o método `replicate`:

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
## Escopo das consultas

<a name="global-scopes"></a>
### Escopos globais

 Escopos globais permitem que você adicione restrições para todas as consultas de um determinado modelo. A própria funcionalidade [soft delete (#soft-deleting)](#soft-deleting) do Laravel utiliza escopos globais para apenas recuperar modelos "não excluídos" no banco de dados. Escrever seus próprios escopos globais pode oferecer uma maneira conveniente e fácil de garantir que todas as consultas para um determinado modelo recebam certas restrições.

<a name="generating-scopes"></a>
#### Gerando escopo

 Para gerar um novo escopo global, você pode invocar o comando do Artisan `make:scope`, que irá colocar o escopo gerado no diretório da sua aplicação `app/Models/Scopes`:

```shell
php artisan make:scope AncientScope
```

<a name="writing-global-scopes"></a>
#### Escrever escopos globais

 Escrever um escopo global é simples. Primeiro, utilize o comando `make:scope` para gerar uma classe que implemente a interface `Illuminate\Database\Eloquent\Scope`. A interface `Scope` exige que você implemente um método: `apply`. O método `apply` pode adicionar restrições `where` ou outros tipos de cláusulas à consulta conforme necessário:

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

 > [!ATENÇÃO]
 > Se o seu escopo for adicionar colunas à cláusula de seleção da consulta, deve utilizar a função `addSelect` em vez de `select`. Isso evitará a substituição não intencional da cláusula de seleção da consulta.

<a name="applying-global-scopes"></a>
#### Aplicando escopos globais

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

 Você pode também registrar o escopo global manualmente, substituindo o método `booted` do modelo e invocando o método `addGlobalScope` do modelo. O método `addGlobalScope` aceita uma instância do seu escopo como único argumento:

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

 Após adicionar o escopo no exemplo acima ao modelo `App\Models\User`, uma chamada à método `User::all()` executará a seguinte consulta SQL:

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a name="anonymous-global-scopes"></a>
#### Escopos globais de anonimato

 O Eloquent também permite definir escopos globais utilizando closures, o que é particularmente útil para escopos simples que não justificam uma classe separada. Ao definir um escopo global utilizando um closure, você deve fornecer um nome de escopo escolhido por si mesmo como o primeiro argumento do método `addGlobalScope`:

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
#### Removendo Escopo Global

 Se você gostaria de remover o escopo global para uma determinada consulta, pode usar o método `withoutGlobalScope`. Esse método aceita apenas um argumento que é o nome da classe do escopo global:

```php
    User::withoutGlobalScope(AncientScope::class)->get();
```

 Ou se você definir o escopo global usando uma closur, você deve passar a string name que atribuiu ao escopo global.

```php
    User::withoutGlobalScope('ancient')->get();
```

 Se você deseja remover vários ou até mesmo todos os escopos globais da consulta, poderá usar o método `withoutGlobalScopes`:

```php
    // Remove all of the global scopes...
    User::withoutGlobalScopes()->get();

    // Remove some of the global scopes...
    User::withoutGlobalScopes([
        FirstScope::class, SecondScope::class
    ])->get();
```

<a name="local-scopes"></a>
### Escopo local

 Os escopos locais permitem que você defina conjuntos comuns de restrições de consulta que poderão ser facilmente reutilizados na aplicação. Por exemplo, talvez seja necessário recuperar frequentemente todos os usuários considerados "populares". Para definir um escopo, prenomeie uma Eloquent model method com `scope`.

 Os escopo deveriam sempre retornar a mesma instância de builders de consultas ou nulo:

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
#### Usar um escopo local

 Uma vez definido o escopo, você pode chamar os métodos do escopo ao pesquisar no modelo. No entanto, não é necessário incluir o prefixo "scope" ao chamar o método. Você pode até fazer chamadas em cadeia para vários escopos:

```php
    use App\Models\User;

    $users = User::popular()->active()->orderBy('created_at')->get();
```

 A combinação de vários escopos do modelo Eloquent através de um operador de consulta `or` poderá requerer o uso de closures para conseguir o correto [agrupamento lógico] (/docs/queries#logical-grouping):

```php
    $users = User::popular()->orWhere(function (Builder $query) {
        $query->active();
    })->get();
```

 No entanto, uma vez que isto pode ser complicado, o Laravel disponibiliza um método de "nivel superior" `orWhere`, que permite realizar a combinação dos escopos sem recurso aos fechos:

```php
    $users = User::popular()->orWhere->active()->get();
```

<a name="dynamic-scopes"></a>
#### Escopos dinâmicos

 Às vezes, poderá querer definir um escopo que aceite parâmetros. Para começar, adicione os seus parâmetros complementares à assinatura da sua metodologia de escopo. Os parâmetros do escopo devem ser definidos depois do parâmetro `$query`:

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

 Uma vez que os argumentos esperados tenham sido adicionados à assinatura da sua metodologia de escopo, você poderá passar os argumentos ao chamar o escopo:

```php
    $users = User::ofType('admin')->get();
```

<a name="comparing-models"></a>
## Comparando Modelos

 Às vezes você pode precisar determinar se dois modelos são os "mesmos" ou não. Os métodos `is` e `isNot` podem ser usados para verificar rapidamente se dois modelos têm o mesmo principal chave, tabela e conexão de banco de dados ou não:

```php
    if ($post->is($anotherPost)) {
        // ...
    }

    if ($post->isNot($anotherPost)) {
        // ...
    }
```

 Os métodos `is` e `isNot` também estão disponíveis quando se utiliza as relações [eLöquent](/docs/eloquent-relationships). Este método é particularmente útil quando você deseja comparar um modelo relacionado sem emitir uma consulta para recuperar esse modelo:

```php
    if ($post->author()->is($user)) {
        // ...
    }
```

<a name="events"></a>
## Eventos

 > [!ATENÇÃO]
 [Evento de modelos em transmissão](/docs/broadcasting#model-broadcasting).

 Modelos eloqüentes disparam vários eventos, permitindo que você se conecte aos seguintes momentos de um ciclo de vida do modelo: ``retrieved``, ``creating``, ``created``, ``updating``, ``updated``, ``saving``, ``saved``, ``deleting``, ``deleted``, ``trashed``, ``forceDeleting``, ``forceDeleted``, ``restoring``, ``restored`` e ``replicating``.

 O evento `retrieved` será disparado quando um modelo existente for recuperado da base de dados. Quando um novo modelo for salvo pela primeira vez, os eventos `creating` e `created` serão disparados. Os eventos `updating`/ `updated` serão disparados quando um modelo existente tiver sido modificado e o método `save` tiver sido chamado. Os eventos `saving`/ `saved` serão disparados quando um modelo for criado ou modificado, mesmo se os atributos do modelo não tiverem sido alterados. Os nomes de evento terminando com `-ing` são disparados antes que as alterações no modelo sejam persistidas, enquanto os eventos terminando com `-ed` são disparados depois que as mudanças no modelo forem persistidas.

 Para começar a ouvir eventos de modelo, defina uma propriedade `$dispatchesEvents` no seu modelo Eloquent. Essa propriedade mapeia vários pontos do ciclo de vida do modelo Eloquent para suas próprias classes de evento. Cada classe de evento de modelo deve esperar receber um instância do modelo afetado através de seu construtor:

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

 Definido e mapeado seus eventos Eloquent, você pode usar [ouvintes de eventos](/docs/events#defining-listeners) para lidar com os eventos.

 > [!AVISO]
 > Ao emitir uma consulta de atualização ou exclusão em massa por meio da Eloquent, os eventos `saved`, `updated`, `deleting` e `deleted` não serão enviados para os modelos afetados. Isso ocorre porque os modelos nunca são realmente recuperados ao realizar atualizações ou exclusões em massa.

<a name="events-using-closures"></a>
### Usando Fechos

 Em vez de usar classes personalizadas para eventos, você pode registrar fechamentos que serão executados quando vários eventos forem enviados ao modelo. Normalmente, esses fechamentos devem ser registrados no método `booted` do seu modelo:

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

 Caso necessário, você pode utilizar [ouvintes de eventos anônimos em fila](/docs/events#queuable-anonymous-event-listeners) ao registrar eventos do modelo. Isso instruirá o Laravel a executar o ouvinte de evento do modelo no background usando a fila da sua aplicação:

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

 Se estiver ouvindo muitos eventos de um modelo em particular, poderá utilizar observadores para agrupar todos os seus ouvinte numa única classe. As classes observador têm nomes de método que refletem os eventos Eloquent aos quais pretende ouvir. Cada um destes métodos recebe o modelo afetado como único argumento. A ordem de trabalho "make:observer" é a maneira mais fácil de criar uma nova classe observador:

```shell
php artisan make:observer UserObserver --model=User
```

 Este comando irá colocar o novo observador no diretório `app/Observers`. Se este diretório não existir, o Artisan irá criá-lo para você. Seu observador recém-criado será semelhante ao seguinte:

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

 Para registrar um observador, pode colocar o atributo `ObservedBy` no modelo correspondente:

```php
    use App\Observers\UserObserver;
    use Illuminate\Database\Eloquent\Attributes\ObservedBy;

    #[ObservedBy([UserObserver::class])]
    class User extends Authenticatable
    {
        //
    }
```

 Ou você pode registrar manualmente um observador, chamando o método `observe` no modelo que você deseja observar. Você pode registrar observadores no método `boot` da classe do seu aplicativo `AppServiceProvider`:

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

 > [!AVISO]
 [documentação de eventos] (#events).

<a name="observers-and-database-transactions"></a>
#### Observadores e transações de banco de dados

 Se os modelos estiverem a ser criados numa transação de banco de dados, pode pretender instruir um observador para executar apenas os controladores de evento depois de o compromisso da transação do banco de dados ter sido efetuado. Para tal, poderá implementar a interface `ShouldHandleEventsAfterCommit` no seu observador. Se uma transação de banco de dados não estiver em curso, os controladores de evento serão executados imediatamente:

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
### Silenciando eventos

 Ocasionalmente poderá necessitar de temporariamente silenciar todos os eventos disparados por um modelo. Poderá fazer isso utilizando o método `withoutEvents`. Este método aceita apenas um argumento, uma função-chave que irá desempenhar o papel da lógica do modelo, sem que sejam enviados eventos. Se retornar um valor nulo ou qualquer outro valor, a função será ignorada e o método retorna esse mesmo valor:

```php
    use App\Models\User;

    $user = User::withoutEvents(function () {
        User::findOrFail(1)->delete();

        return User::find(2);
    });
```

<a name="saving-a-single-model-without-events"></a>
#### Salvar um único modelo sem eventos

 Às vezes, você pode querer "salvar" um determinado modelo sem distribuir eventos. Você pode conseguir isso usando o método `saveQuietly`:

```php
    $user = User::findOrFail(1);

    $user->name = 'Victoria Faith';

    $user->saveQuietly();
```

 Você também pode "atualizar", "excluir", "apagar", "restaurar" e "replicar" um modelo dado sem o envio de eventos.

```php
    $user->deleteQuietly();
    $user->forceDeleteQuietly();
    $user->restoreQuietly();
```
