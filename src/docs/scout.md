# Laravel Scout

<a name="introduction"></a>
## Introdução

 O [Laravel Scout](https://github.com/laravel/scout) fornece uma solução simples e baseada em drivers para adicionar pesquisa de texto completo aos seus [modelos Eloquent] (/docs/eloquent). Usando observadores do modelo, o Scout manterá automaticamente os seus índices de busca sincronizados com os registros do Eloquent.

 Atualmente, o Scout tem como opções de serviços [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org) e drivers MySQL/PostgreSQL (banco de dados). Além disso, o Scout inclui um driver "colleção" que foi desenvolvido para uso em ambiente de desenvolvimento local e não requer dependências externas ou serviços de terceiros. Você também pode escrever drivers personalizados e estender o Scout com suas próprias implementações de busca.

<a name="installation"></a>
## Instalação

 Primeiro, você deve instalar o Scout através do gerenciador de pacotes Composer:

```shell
composer require laravel/scout
```

 Depois de instalar o Scout, você deve publicar seu arquivo de configuração usando a ordem de comando `vendor:publish` do Artisan. Esta ordem irá publicar o arquivo de configuração `scout.php` para o diretório `config` da aplicação:

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

 Por último, adicione o traço `Laravel\Scout\Searchable` ao modelo que você gostaria de tornar pesquisável. Este traço registrará um observador de modelo que manterá automaticamente o modelo sincronizado com seu mecanismo de busca:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class Post extends Model
    {
        use Searchable;
    }
```

<a name="queueing"></a>
### Ficar na fila

 Embora o uso do Scout não seja estritamente necessário, você deve considerar fortemente a configuração de um [driver de fila](/docs/queues) antes de usar a biblioteca. O funcionamento de um trabalhador da fila permitirá que o Scout agende todas as operações que sincronizam informações do modelo com seus índices de busca, proporcionando tempo de resposta muito melhor para a interface web de seu aplicativo.

 Depois de configurar um driver de fila, configure o valor da opção `queue` no arquivo de configuração do seu `config/scout.php` para `true`:

```php
    'queue' => true,
```

 Mesmo quando a opção `queue` é definida como `false`, é importante lembrar que alguns motores de busca Scout, como Algolia e Meilisearch, sempre indexam registos de forma assíncrona. Isto significa que, embora a operação de indexação tenha sido concluída no seu aplicativo Laravel, o motor de busca em si pode não refletir imediatamente os novos registos ou registos atualizados.

 Para especificar a conexão e fila que os seus trabalhos Scout utilizam, pode definir a opção de configuração `queue` como um conjunto de elementos:

```php
    'queue' => [
        'connection' => 'redis',
        'queue' => 'scout'
    ],
```

 Claro que se personalizar a conexão e fila empregada pelo Scout será necessário executar um agente de filas para processar trabalhos nessa conexão e fila.

```php
    php artisan queue:work redis --queue=scout
```

<a name="driver-prerequisites"></a>
## Requisitos prévios do driver

<a name="algolia"></a>
### Algolia

 Para usar o driver Algolia, você deve configurar suas credenciais de `id` e `secret` no arquivo de configuração `config/scout.php`. Depois que as credenciais estiverem configuradas, será necessário instalar o SDK PHP do Algolia através do gerenciador de pacotes Composer:

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
### Meilisearch

 O Meilisearch (https://www.meilisearch.com) é um motor de busca rápido e open source. Se você não tiver certeza sobre como instalar o Meilisearch em sua máquina local, pode usar o [Laravel Sail](/docs/sail#meilisearch), ambiente de desenvolvimento Docker oficialmente suportado pelo Laravel.

 Ao utilizar o driver Meilisearch, será necessário instalar o Meilisearch SDK PHP através do gerenciador de pacotes Composer.

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

 Em seguida, defina a variável de ambiente `SCOUT_DRIVER`, bem como suas credenciais do host e chave do Meilisearch no arquivo `.env` da sua aplicação:

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

 Para mais informações sobre Meilisearch, consulte a documentação [aqui](https://docs.meilisearch.com/learn/getting_started/quick_start.html).

 Além disso, você deve garantir que instale uma versão do `meilisearch/meilisearch-php` compatível com sua versão binária da Meilisearch revisando a [documentação Meilisearch sobre compatibilidade de binários](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch).

 > [AVISO]
 Consulte [ quaisquer alterações drásticas adicionais] (https://github.com/meilisearch/Meilisearch/releases) no próprio serviço do Meilisearch para obter informações sobre as alterações mais recentes.

<a name="typesense"></a>
### Tiposense

 O Typesense (https://typesense.org) é um motor de busca rápido e aberto que permite realizar pesquisas por palavra-chave, pesquisa semântica, pesquisa geográfica e pesquisa vetorial.

 Você pode [hospedar o Typesense localmente](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting) ou usar a [Nuvem do Typesense](https://cloud.typesense.org).

 Para começar a usar o Typesense com o Scout, instale o Typesense PHP SDK através do gerenciador de pacotes Composer:

```shell
composer require typesense/typesense-php
```

 Em seguida, defina a variável de ambiente `SCOUT_DRIVER`, bem como suas credenciais do anfitrião e chave da API do Typesense no arquivo .env da sua aplicação:

```env
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

 Se necessário, você também pode especificar o port, caminho e protocolo da sua instalação:

```env
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

 Definições adicionais e definições de esquema para as suas coleções no Typesense podem ser encontradas no arquivo de configuração `config/scout.php` da sua aplicação. Para mais informações sobre o Typesense, consulte a [Documentação do Typesense](https://typesense.org/docs/guide/#quick-start).

<a name="preparing-data-for-storage-in-typesense"></a>
#### Preparação dos Dados para Armazenamento no Typesense

 Ao utilizar o Typesense, os modelos pesquisáveis devem definir um método `toSearchableArray`, que converte a chave primária do modelo para uma string e a data de criação para um timestamp UNIX:

```php
/**
 * Get the indexable data array for the model.
 *
 * @return array<string, mixed>
 */
public function toSearchableArray()
{
    return array_merge($this->toArray(),[
        'id' => (string) $this->id,
        'created_at' => $this->created_at->timestamp,
    ]);
}
```

 Você também deve definir os esquemas das suas coleções no arquivo `config/scout.php` do seu aplicativo. Um esquema de coleção descreve os tipos de dados de cada campo que podem ser pesquisados via Typesense. Para obter mais informações sobre todas as opções disponíveis, consulte a [documentação do Typesense](https://typesense.org/docs/latest/api/collections.html#schema-parameters).

 Se você precisar alterar o esquema da sua coleção do Typesense depois de definido, você pode executar `scout:flush` e `scout:import`, que excluirá todos os dados indexados existentes e recriará o esquema. Ou ainda poderá usar a API do Typesense para alterar o esquema da coleção sem remover nenhum dado indexado.

 Se o seu modelo indexável for excluído somente no nível de arquivo, você deve definir um campo `__soft_deleted` no esquema do Typesense correspondente ao modelo na pasta `config/scout.php` da aplicação:

```php
User::class => [
    'collection-schema' => [
        'fields' => [
            // ...
            [
                'name' => '__soft_deleted',
                'type' => 'int32',
                'optional' => true,
            ],
        ],
    ],
],
```

<a name="typesense-dynamic-search-parameters"></a>
#### Parâmetros de busca dinâmica

 O Typesense permite que você modifique seus [parâmetros de pesquisa](https://typesense.org/docs/latest/api/search.html#search-parameters) dinamicamente ao realizar uma operação de busca via o método `options`:

```php
use App\Models\Todo;

Todo::search('Groceries')->options([
    'query_by' => 'title, description'
])->get();
```

<a name="configuration"></a>
## Configuração

<a name="configuring-model-indexes"></a>
### Configurando índices de modelo

 Cada modelo Eloquent é sincronizado com um determinado "indice" de busca, que contém todos os registos pesquisáveis para esse modelo. Em outras palavras, você pode pensar em cada índice como uma tabela do MySQL. Por padrão, cada modelo será persistido para um índice correspondente ao nome "tabela" do modelo. Normalmente, esse nome é a forma plural do nome do modelo; no entanto, você pode personalizar o índice do modelo substituindo o método `searchableAs` no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class Post extends Model
    {
        use Searchable;

        /**
         * Get the name of the index associated with the model.
         */
        public function searchableAs(): string
        {
            return 'posts_index';
        }
    }
```

<a name="configuring-searchable-data"></a>
### Configurando dados indexáveis

 Por padrão, o modelo completo da forma "toArray" será persistido no seu índice de pesquisa. Se pretender personalizar os dados que são sincronizados com o índice de pesquisa, pode substituir a metodologia "toSearchableArray" no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class Post extends Model
    {
        use Searchable;

        /**
         * Get the indexable data array for the model.
         *
         * @return array<string, mixed>
         */
        public function toSearchableArray(): array
        {
            $array = $this->toArray();

            // Customize the data array...

            return $array;
        }
    }
```

 Alguns motores de busca, como o Meilisearch, só efetuam operações de filtro (">", "<", etc.) em dados do tipo correto. Assim, ao utilizar esses motores de busca e personalizar os seus dados pesquisáveis, deve certificar-se que os valores numéricos são convertidos para o tipo correto:

```php
    public function toSearchableArray()
    {
        return [
            'id' => (int) $this->id,
            'name' => $this->name,
            'price' => (float) $this->price,
        ];
    }
```

<a name="configuring-filterable-data-for-meilisearch"></a>
#### Configuração de dados com filtros e configurações do índice (Meilisearch)

 Diferente dos outros motoristas do Scout, o Meilisearch exige que você predefina as configurações da pesquisa por índice, como atributos filtraveis e ordenáveis, bem como [outros campos suportados de configuração](https://docs.meilisearch.com/reference/api/settings.html).

 Atributos filtráveis são quaisquer atributos que você pretende filtrar ao invocar o método `where` do Scout. Já os atributos ordenáveis são qualquer atributo pelo qual você pretenda realizar a ordem ao invocar o método `orderBy` do Scout. Para definir suas configurações de índices, adicione a seção `index-settings` à sua entrada de configuração do MeiliSearch na arquivo de configuração da sua aplicação:

```php
use App\Models\User;
use App\Models\Flight;

'meilisearch' => [
    'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
    'key' => env('MEILISEARCH_KEY', null),
    'index-settings' => [
        User::class => [
            'filterableAttributes'=> ['id', 'name', 'email'],
            'sortableAttributes' => ['created_at'],
            // Other settings fields...
        ],
        Flight::class => [
            'filterableAttributes'=> ['id', 'destination'],
            'sortableAttributes' => ['updated_at'],
        ],
    ],
],
```

 Se o modelo subjacente de um determinado índice for excluído silenciosamente e incluído na matriz `index-settings`, Scout irá incluir automaticamente suporte para filtragem em modelos excluídos silenciosamente nesse índice. Se você não tiver outros atributos filtraveis ou ordenáveis a definir para um modelo excluído silenciosamente, pode simplesmente adicionar uma entrada vazia à matriz `index-settings` para esse modelo:

```php
'index-settings' => [
    Flight::class => []
],
```

 Depois de configurar as configurações do índice da sua aplicação, você deve invocar o comando `scout:sync-index-settings`. Este comando informará a Meilisearch das suas atuais configurações de índices. Para maior conveniência, você pode desejar tornar este comando parte do seu processo de implantação:

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-the-model-id"></a>
### Configurando o Identificador do Modelo

 Por padrão, o Scout usará a chave primária do modelo como identificador único / chave que será armazenada no índice de busca. Se você precisar customizar esse comportamento, poderá sobrepor as métricas `getScoutKey` e `getScoutKeyName` no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class User extends Model
    {
        use Searchable;

        /**
         * Get the value used to index the model.
         */
        public function getScoutKey(): mixed
        {
            return $this->email;
        }

        /**
         * Get the key name used to index the model.
         */
        public function getScoutKeyName(): mixed
        {
            return 'email';
        }
    }
```

<a name="configuring-search-engines-per-model"></a>
### Configurando motores de busca por modelo

 Normalmente, ao efetuar uma pesquisa, o Scout utiliza o motor de busca padrão especificado no arquivo de configuração `scout` do aplicativo. No entanto, é possível alterar o mecanismo de busca para um modelo específico através da sobreposição do método `searchableUsing` no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Engines\Engine;
    use Laravel\Scout\EngineManager;
    use Laravel\Scout\Searchable;

    class User extends Model
    {
        use Searchable;

        /**
         * Get the engine used to index the model.
         */
        public function searchableUsing(): Engine
        {
            return app(EngineManager::class)->engine('meilisearch');
        }
    }
```

<a name="identifying-users"></a>
### Identificar os Usuários

 O Scout também permite identificar automaticamente os usuários quando é utilizado o Algolia. Associar o usuário autenticado às operações de busca pode ser útil ao analisar as análises das pesquisas no painel do Algolia. Você pode ativar a identificação de usuários definindo uma variável de ambiente `SCOUT_IDENTIFY` como `true` no arquivo `.env` do seu aplicativo:

```ini
SCOUT_IDENTIFY=true
```

 Permitir essa função também envia o endereço de IP da solicitação e seu identificador primário de usuários autenticados ao Algolia para que os dados sejam associados a qualquer solicitação de pesquisa realizada pelo usuário.

<a name="database-and-collection-engines"></a>
## Motores de Base de Dados/ Coleções

<a name="database-engine"></a>
### Motor de Banco de Dados

 > [!AVISO]
 > O motor de banco de dados atualmente suporta o MySQL e o PostgreSQL.

 Se o seu aplicativo interagir com bancos de dados de pequeno a médio porte ou tiver uma carga de trabalho leve, poderá considerar iniciar pelo motor de banco de dados Scout. O motor de banco de dados usará cláusulas "where like" e índices de texto completo ao filtrar os resultados do seu banco de dados existente para determinar os resultados aplicáveis para sua consulta.

 Para utilizar o motor de base de dados, pode definir simplesmente o valor da variável do ambiente `SCOUT_DRIVER` em `database`, ou especificar o driver `database` diretamente no ficheiro de configuração do `scout` da sua aplicação:

```ini
SCOUT_DRIVER=database
```

 Depois de especificar o motor de banco de dados como o driver preferido, você deve [configurar seus dados pesquisáveis] (#Configuring-Searchable-Data). Em seguida, pode começar a [executar consultas de pesquisa] (#searching) contra seus modelos. O índice do motor de busca, como o índice necessário para gerar os índices Algolia, Meilisearch ou Typesense não é mais necessário quando você usa o motor de banco de dados.

#### Personalizar estratégias de pesquisa do banco de dados

 Por padrão, o motor de banco de dados executa uma consulta "like where" contra todos os atributos do modelo que você [tornou pesquisáveis](#configurando-dados-pesquisaveis). No entanto, nalgumas situações, isso pode resultar em pior desempenho. Assim, a estratégia de pesquisa do motor de banco de dados pode ser configurada para que certas colunas especificadas utilizem consultas de pesquisa de texto completo ou apenas restrinjam as buscas aos prefixos das strings (por exemplo, "exemplo%") em vez de procurarem dentro da totalidade da string ("%exemplo%").

 Para definir esse comportamento, é possível atribuir atributos PHP à método do modelo `toSearchableArray`. Todas as colunas que não receberem um novo comportamento de estratégia de busca manterão o comportamento padrão "where like":

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * Get the indexable data array for the model.
 *
 * @return array<string, mixed>
 */
#[SearchUsingPrefix(['id', 'email'])]
#[SearchUsingFullText(['bio'])]
public function toSearchableArray(): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'bio' => $this->bio,
    ];
}
```

 > [AVISO]
 [Índice completo do texto](/docs/migrations#available-index-types).

<a name="collection-engine"></a>
### Motor de coleta

 Ao usar os mecanismos de busca Algolia, Meilisearch ou Typesense durante o desenvolvimento local, você pode optar por começar com o mecanismo "collection". O motor de coleção usará cláusulas "where" e filtragem de coleções nos resultados do banco de dados para determinar os resultados de busca aplicáveis à sua consulta. Ao usar este mecanismo, não é necessário "indexar" seus modelos de pesquisa, pois eles serão simplesmente recuperados do seu banco de dados local.

 Para usar o motor de coleta, você pode simplesmente definir o valor da variável ambiental `SCOUT_DRIVER` como `collection`, ou especificar o `driver` diretamente no arquivo de configuração do aplicativo.

```ini
SCOUT_DRIVER=collection
```

 Depois de especificar o driver de coleção como seu preferido, você poderá começar a [executar consultas de pesquisa] (#searching) contra seus modelos. O índice do motor de busca, tal como o necessário para preencher os índices Algolia, Meilisearch ou Typesense não é necessário ao usar o motor de coleção.

#### Diferenças do motor de banco de dados

 À primeira vista, os motores "base de dados" e "coleções" são bastante semelhantes. Ambos interagem diretamente com o seu banco de dados para recuperar resultados da pesquisa. No entanto, o motor de coleção não utiliza índices de texto completo ou cláusulas `LIKE` para encontrar registros que correspondam à pesquisa. Em vez disso, eles extraem todos os possíveis registros e usam a ajuda Laravel `Str::is` para determinar se a string de pesquisa existe nos valores dos atributos do modelo.

 O motor de coleta é o mais portátil dos motores de busca, pois funciona em todas as bases de dados relacionais suportadas pelo Laravel (incluindo SQLite e SQL Server). No entanto, é menos eficiente do que o motor de base de dados Scout.

<a name="indexing"></a>
## Indexação

<a name="batch-import"></a>
### Importação de lotes

 Se estiver a instalar o Scout num projeto existente, poderá já dispor de registos no banco de dados que pretende importar para os seus índices. O Scout disponibiliza um comando "scout:import" no Artisan que lhe permite importar todos os registos existentes nos seus índices de pesquisa:

```shell
php artisan scout:import "App\Models\Post"
```

 O comando `flush` pode ser usado para remover todos os registos de um modelo dos seus índices de pesquisa.

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### Modificar a consulta de importação

 Se você quiser alterar a consulta usada para recuperar todos os seus modelos para importação em lote, pode definir um método `makeAllSearchableUsing` no seu modelo. Esse é o lugar ideal para adicionar qualquer carregamento de relacionamentos ansiados que possam ser necessários antes do carregamento dos modelos:

```php
    use Illuminate\Database\Eloquent\Builder;

    /**
     * Modify the query used to retrieve models when making all of the models searchable.
     */
    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query->with('author');
    }
```

 > [ADVERTÊNCIA]
 [ não restaurado] (/) quando as coleções de modelo são processadas por tarefas.

<a name="adding-records"></a>
### Adicionar registros

 Depois de adicionar o trato `Laravel\Scout\Searchable` a um modelo, tudo o que precisa de fazer é `salvar` ou criar uma instância do modelo e ele será automaticamente adicionado ao seu índice de pesquisas. Se você tiver configurado Scout para usar [filas] (#queueing), esta operação será realizada em segundo plano pelo seu trabalhador de fila:

```php
    use App\Models\Order;

    $order = new Order;

    // ...

    $order->save();
```

<a name="adding-records-via-query"></a>
#### Adição de registros através de consulta

 Se você deseja adicionar uma coleção de modelos ao seu índice de pesquisa por meio de uma consulta Eloquent, pode concatenar a método `searchable` em uma consulta Eloquent. O método `searchable` agrupará os resultados da consulta e adicionará os registros ao seu índice de pesquisa. Novamente, se você configurou o Scout para usar filas, todas as partes serão importadas em segundo plano por seus trabalhadores de fila:

```php
    use App\Models\Order;

    Order::where('price', '>', 100)->searchable();
```

 Você também pode chamar o método `searchable` em uma instância de relacionamento do Eloquent:

```php
    $user->orders()->searchable();
```

 Ou se você já tem uma coleção de modelos Eloquent em memória, você pode chamar o método `searchable` na instância da coleção para adicionar as instâncias do modelo ao índice correspondente:

```php
    $orders->searchable();
```

 > [!NOTA]
 > O método `searchable` pode ser considerado uma operação "upsert". Em outras palavras, se o registo do modelo já estiver no índice, ele será atualizado. Se não existir no índice de pesquisa, será adicionado.

<a name="updating-records"></a>
### Atualização de registros

 Para atualizar um modelo pesquisável, você só precisa atualizar as propriedades da instância de modelo e salvar o modelo para sua base de dados. O Scout irá automaticamente salientar as alterações em seu índice de busca:

```php
    use App\Models\Order;

    $order = Order::find(1);

    // Update the order...

    $order->save();
```

 Você também pode invocar o método `searchable` em uma instância de consulta `Eloquent` para atualizar sua coleção de modelos. Se os modelos não existirem no seu índice de pesquisas, eles serão criados:

```php
    Order::where('price', '>', 100)->searchable();
```

 Se você deseja atualizar os registros do índice de pesquisa para todos os modelos em uma relação, é possível invocar o método `searchable` na instância da relação:

```php
    $user->orders()->searchable();
```

 Ou, se você já tiver uma coleção de modelos Eloquent em memória, poderá chamar o método `searchable` na instância da coleção para atualizar as instâncias do modelo em seu índice correspondente:

```php
    $orders->searchable();
```

<a name="modifying-records-before-importing"></a>
#### Alterar registros antes da importação

 Às vezes você pode precisar preparar a coleção de modelos antes que eles se tornem pesquisáveis. Por exemplo, talvez você queira carregar antecipadamente um relacionamento para que os dados do mesmo possam ser adicionados com eficiência ao seu índice de busca. Para isso, defina o método `makeSearchableUsing` no modelo correspondente:

```php
    use Illuminate\Database\Eloquent\Collection;

    /**
     * Modify the collection of models being made searchable.
     */
    public function makeSearchableUsing(Collection $models): Collection
    {
        return $models->load('author');
    }
```

<a name="removing-records"></a>
### Remoção de registos

 Para remover um registro do índice, basta "apagar" o modelo no banco de dados. Isso pode ser feito mesmo se você estiver usando modelos com [exclusão suave](/docs/eloquent#soft-deleting):

```php
    use App\Models\Order;

    $order = Order::find(1);

    $order->delete();
```

 Caso não queira recuperar o modelo antes de excluir o registo, pode utilizar a metodologia `unsearchable` numa instância da consulta Eloquent:

```php
    Order::where('price', '>', 100)->unsearchable();
```

 Se você deseja remover os registros do índice de pesquisa de todos os modelos em um relacionamento, pode chamar o método `unsearchable` na instância de relacionamento:

```php
    $user->orders()->unsearchable();
```

 Ou se você já tem uma coleção de modelos Eloquent em memória, você pode chamar o método `unsearchable` na instância da coleção para remover as instâncias do modelo dos índices correspondentes:

```php
    $orders->unsearchable();
```

 Para remover todos os registos de modelo do respetivo índice, poderá invocar o método `removeAllFromSearch`:

```php
    Order::removeAllFromSearch();
```

<a name="pausing-indexing"></a>
### Interromper indexação

 Às vezes, poderá ser necessário executar um lote de operações Eloquent num modelo sem sincronizar os dados do modelo com o seu índice de pesquisa. Pode fazer isto utilizando o método `withoutSyncingToSearch`. Este método aceita um único fecho que será imediatamente executado. Quaisquer operações em modelos, que ocorram dentro do fecho, não serão sincronizadas com o índice do modelo:

```php
    use App\Models\Order;

    Order::withoutSyncingToSearch(function () {
        // Perform model actions...
    });
```

<a name="conditionally-searchable-model-instances"></a>
### Exemplos de instâncias de modelo com pesquisa condicional

 Às vezes, talvez você só queira tornar um modelo pesquisável sob certas condições. Por exemplo, imagine que você tenha o modelo `App\Models\Post` que pode estar em dois estados: "em revisão" e "publicado". Talvez você só queira permitir a pesquisa dos posts "publicados". Para isso, é possível definir um método `shouldBeSearchable` no seu modelo:

```php
    /**
     * Determine if the model should be searchable.
     */
    public function shouldBeSearchable(): bool
    {
        return $this->isPublished();
    }
```

 O método `shouldBeSearchable` é aplicado somente quando se manipula modelos através dos métodos `save` e `create`, consultas ou relacionamentos. Se você fizer um modelo ou uma coleção pesquisável usando o método `searchable`, ele irá anular os resultados do método `shouldBeSearchable`.

 > [AVERIGUAR]
 Em vez disso, use conjuntos de condições (Where Clauses).

<a name="searching"></a>
## Pesquisando

 Você pode começar a pesquisar um modelo usando o método `search`. O método de busca aceita uma única string que será usada para pesquisar os seus modelos. Deve então anexar o método `get` à consulta de pesquisa para recuperar os modelos Eloquent que correspondam à consulta de busca:

```php
    use App\Models\Order;

    $orders = Order::search('Star Trek')->get();
```

 Como as buscas de Scout retornam uma coleção de modelos Eloquent, você pode até mesmo retornar os resultados diretamente de um rote ou controlador e eles serão automaticamente convertidos para JSON:

```php
    use App\Models\Order;
    use Illuminate\Http\Request;

    Route::get('/search', function (Request $request) {
        return Order::search($request->search)->get();
    });
```

 Se você deseja obter os resultados de pesquisa brutos antes que eles sejam convertidos em modelos Eloquent, pode usar o método "raw":

```php
    $orders = Order::search('Star Trek')->raw();
```

<a name="custom-indexes"></a>
#### Índices Personalizados

 Normalmente, as consultas de pesquisa são executadas no índice especificado pelo método [`searchableAs`](#configuring-model-indexes) do modelo. No entanto, você pode usar o método `within` para especificar um índice personalizado que deve ser pesquisado em vez disso:

```php
    $orders = Order::search('Star Trek')
        ->within('tv_shows_popularity_desc')
        ->get();
```

<a name="where-clauses"></a>
### Onde estão as cláusulas

 O Scout permite que você adicione simples cláusulas "onde" para suas consultas de pesquisa. Atualmente, essas cláusulas suportam apenas verificações básicas de igualdade numérica e são principalmente úteis para delimitar as consultas de pesquisa por um ID de proprietário:

```php
    use App\Models\Order;

    $orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

 Além disso, o método `whereIn` pode ser usado para verificar se um determinado valor de uma determinada coluna está contido no arranjo dado:

```php
    $orders = Order::search('Star Trek')->whereIn(
        'status', ['open', 'paid']
    )->get();
```

 O método `whereNotIn` verifica se o valor da coluna não está contido no array especificado.

```php
    $orders = Order::search('Star Trek')->whereNotIn(
        'status', ['closed']
    )->get();
```

 Como o índice de pesquisa não é um banco de dados relacional, as cláusulas "where" mais avançadas não são suportadas no momento.

 > [ATENÇÃO]
 Antes de utilizar as cláusulas "onde" do Scout, deve criar um campo com [ atributos filtração](#configuring-filterable-data-for-meilisearch).

<a name="pagination"></a>
### Paginador

 Além de recuperar uma coleção de modelos, você pode paginar seus resultados de busca usando o método `paginate`. Esse método retornará uma instância de `Illuminate\Pagination\LengthAwarePaginator` assim como se você tivesse [paginado uma consulta Eloquent tradicional](/docs/pagination):

```php
    use App\Models\Order;

    $orders = Order::search('Star Trek')->paginate();
```

 Você pode especificar quantos modelos devem ser recuperados por página passando a quantidade como o primeiro argumento ao método `paginate`:

```php
    $orders = Order::search('Star Trek')->paginate(15);
```

 Uma vez recuperados os resultados, poderá visualizar os resultados e renderizar os vínculos das páginas utilizando [Blade] (https://github.com/laravel/framework/tree/master/app/Http/Controllers/Blade) tal como se tivesse feito um pedido por páginas de uma consulta Eloquent tradicional:

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

 É claro que, se você quiser recuperar os resultados de paginação como JSON, poderá retornar a instância do Paginator diretamente de um roteador ou controlador:

```php
    use App\Models\Order;
    use Illuminate\Http\Request;

    Route::get('/orders', function (Request $request) {
        return Order::search($request->input('query'))->paginate(15);
    });
```

 > [AVERIGUAR]
 > Como os mecanismos de busca não estão cientes das definições do escopo global em seu modelo Eloquent, você deve evitar utilizar esse recurso nas aplicações que utilizam a paginação Scout. Caso necessário, você deve reproduzir as restrições do escopo global quando pesquisando através de Scout.

<a name="soft-deleting"></a>
### Exclusão soft

 Se os seus modelos indexados estiverem em [forma de exclusão suave](/docs/eloquent#soft-deleting) e necessitar pesquisar os modelos deletados suavemente, defina a opção `soft_delete` do arquivo de configuração `config/scout.php`, para "true":

```php
    'soft_delete' => true,
```

 Quando esta opção estiver definida como `true`, o Scout não removerá modelos suavemente apagados do índice de pesquisa. Em vez disso, ele configurará um atributo escondido `__soft_deleted` no registo indexado. Assim, pode utilizar os métodos `withTrashed` ou `onlyTrashed` para recuperar os registos apagados suavemente na pesquisa:

```php
    use App\Models\Order;

    // Include trashed records when retrieving results...
    $orders = Order::search('Star Trek')->withTrashed()->get();

    // Only include trashed records when retrieving results...
    $orders = Order::search('Star Trek')->onlyTrashed()->get();
```

 > [!AVISO]
 > Quando um modelo excluído temporariamente for permanentemente apagado usando o comando forceDelete, Scout o removerá automaticamente do índice de busca.

<a name="customizing-engine-searches"></a>
### Personalizar as buscas do motor

 Se você precisa fazer uma personalização avançada do comportamento de pesquisa de um motor, poderá passar uma função anônima como o segundo argumento para o método `search`. Por exemplo, é possível usar esse callback para adicionar dados de geolocalização às suas opções de busca antes que a consulta de pesquisa seja enviada ao Algolia:

```php
    use Algolia\AlgoliaSearch\SearchIndex;
    use App\Models\Order;

    Order::search(
        'Star Trek',
        function (SearchIndex $algolia, string $query, array $options) {
            $options['body']['query']['bool']['filter']['geo_distance'] = [
                'distance' => '1000km',
                'location' => ['lat' => 36, 'lon' => 111],
            ];

            return $algolia->search($query, $options);
        }
    )->get();
```

<a name="customizing-the-eloquent-results-query"></a>
#### Personalizar a consulta de resultados do Eloquent

 Após Scout recuperar uma lista de modelos Eloquent correspondentes do mecanismo de busca da sua aplicação, você pode usar o Eloquent para recuperar todos os modelos correspondentes por meio das chaves primárias. Você pode personalizar esta consulta convocando a metodologia `query`. A metodologia `query` aceita um fechamento que recebe como argumento uma instância do construtor de consultas Eloquent:

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

 Uma vez que este callback é invocado depois de os modelos relevantes já terem sido recuperados a partir do mecanismo de busca da aplicação, a metodologia `query` não deve ser utilizada para "filtrar" resultados. Em vez disso, você deve usar as cláusulas [Scout WHERE](#where-clauses).

<a name="custom-engines"></a>
## Máquinas personalizadas

<a name="writing-the-engine"></a>
#### Escrevendo o motor

 Se um dos motores de busca incorporados do Scout não atender às suas necessidades, você poderá escrever seu próprio motor personalizado e registrá-lo com o Scout. Seu motor deve estender a classe abstrata `Laravel\Scout\Engines\Engine`. Esta classe abstrata contém oito métodos que seu motor personalizado deverá implementar:

```php
    use Laravel\Scout\Builder;

    abstract public function update($models);
    abstract public function delete($models);
    abstract public function search(Builder $builder);
    abstract public function paginate(Builder $builder, $perPage, $page);
    abstract public function mapIds($results);
    abstract public function map(Builder $builder, $results, $model);
    abstract public function getTotalCount($results);
    abstract public function flush($model);
```

 Você poderá achar útil revisar as implementações desses métodos na classe `Laravel\Scout\Engines\AlgoliaEngine`. Essa classe lhe oferece um bom ponto de partida para aprender como implementar cada um desses métodos em seu próprio mecanismo.

<a name="registering-the-engine"></a>
#### Registo do motor

 Depois de ter escrito seu motor personalizado, você pode registrá-lo com Scout usando o método `extend` do gerenciador de motores da Scout. O gerenciador de motores do Scout pode ser resolvido a partir do contêiner de serviços Laravel. Você deve chamar o método `extend` a partir da méthode `boot` da sua classe `App\Providers\AppServiceProvider` ou qualquer outro provedor de serviço usado por seu aplicativo:

```php
    use App\ScoutExtensions\MySqlSearchEngine;
    use Laravel\Scout\EngineManager;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        resolve(EngineManager::class)->extend('mysql', function () {
            return new MySqlSearchEngine;
        });
    }
```

 Depois que o motor estiver registrado, você poderá especificá-lo como seu driver Scout padrão no arquivo de configuração do aplicativo `config/scout.php`:

```php
    'driver' => 'mysql',
```
