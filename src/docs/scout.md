# Laravel Scout

<a name="introduction"></a>
## Introdução

O [Laravel Scout](https://github.com/laravel/scout) fornece uma solução simples baseada em drivers para adicionar pesquisa de texto integral aos seus modelos [Eloquent](/docs/eloquent). Ao usar observadores do modelo, o Scout sincronizará automaticamente os índices de busca com os registros Eloquent.

Atualmente, o Scout suporta  [Algolia](https://www.algolia.com/),  [Meilisearch](https://www.meilisearch.com),  [Typesense](https://typesense.org), e drivers de MySQL/PostgreSQL (driver 'database') Iniciação. Além disso, o Scout inclui um driver "coleções" projetado para uso de desenvolvimento local que não requer quaisquer dependências externas ou serviços de terceiros. Além disso, escrever drivers personalizados é simples, e você é livre para estender o Scout com suas próprias implementações de pesquisa.

<a name="installation"></a>
## Instalação

Primeiro, instale o Scout via o gerenciador de pacotes do Composer:

```shell
composer require laravel/scout
```

Depois de instalar o Scout, você deve publicar o arquivo de configuração do Scout usando o comando `vendor:publish` no Artisan. Este comando publicará o arquivo de configuração `scout.php` no diretório `config` do seu aplicativo:

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

Por fim, adicione o trait `Laravel\Scout\Searchable` ao modelo que você gostaria de tornar pesquisável. Este trait registrará um observador de modelo para manter o modelo sincronizado com seu mecanismo de pesquisa:

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
### Fila

Embora não seja estritamente necessário usar o Scout, você deve considerar fortemente configurar um [driver de fila](/docs/queues) antes de utilizar a biblioteca. Executar um trabalhador de fila permitirá que o Scout coloque em fila todas as operações que sincronizarão suas informações do modelo com seus índices de pesquisa, fornecendo tempos de resposta muito melhores para sua interface da web de aplicativos.

Depois de configurar um motorista de fila, defina o valor da opção `queue` em seu arquivo de configuração `config/scout.php` para `true`:

```php
    'queue' => true,
```

Mesmo quando a opção 'queue' está definida como 'false', é importante lembrar que alguns drivers de busca do Scout, como o Algolia e o Meilisearch, sempre indexam registros de forma assíncrona. Isso quer dizer, mesmo que a operação de indexação tenha sido concluída dentro do seu aplicativo Laravel, o próprio mecanismo de busca poderá não refletir imediatamente os novos e atualizados registros.

Para especificar a fila e a conexão que seus trabalhos do Scout utilizam, você pode definir o parâmetro de configuração 'queue' como um array:

```php
    'queue' => [
        'connection' => 'redis',
        'queue' => 'scout'
    ],
```

É claro que se você personalizar a conexão e a fila de trabalhos utilizados pelo Scout, você precisa executar um trabalhador da fila para processar os trabalhos nessa conexão e nessa fila:

```php
    php artisan queue:work redis --queue=scout
```

<a name="driver-prerequisites"></a>
## Requisitos para motorista

<a name="algolia"></a>
### Algolia

Quando usando o driver Algolia, você deve configurar suas credenciais de ID e segredo do Algolia no arquivo de configuração `config/scout.php`. Depois que suas credenciais tiverem sido configuradas, também será necessário instalar o SDK PHP do Algolia usando o gerenciador de pacotes Composer:

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
### Meilisearch

[Meilisearch](https://www.meilisearch.com) é um mecanismo de pesquisa rápido e de código aberto. Se você não tem certeza de como instalar o Meilisearch na sua máquina local, você pode usar [Laravel Sail](/docs/sail#meilisearch), ambiente de desenvolvimento Docker oficialmente suportado do Laravel.

Ao utilizar o driver Meilisearch você precisará instalar a biblioteca de software PHP do Meilisearch usando o gerenciador de pacotes Composer:

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

Então, defina a variável de ambiente `SCOUT_DRIVER` também como suas credenciais `host` e `key` do MeiliSearch dentro do arquivo `.env` de sua aplicação:

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

Para mais informações sobre o Meilisearch, por favor consulte a [documentação do Meilisearch](https://docs.meilisearch.com/learn/getting_started/quick_start.html).

Além disso, certifique-se de instalar uma versão do `meilisearch/meilisearch-php` que seja compatível com a sua versão binária do Meilisearch ao revisar [a documentação do Meilisearch em relação à compatibilidade binária](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch).

> ¡¡ALERTA!
> Ao atualizar o Scout em uma aplicação que utiliza o Meilisearch, você deve sempre revisar quaisquer [novas mudanças quebradoras] no próprio serviço Meilisearch.

<a name="typesense"></a>
### typesense

[Typesense](https://typesense.org) é um mecanismo de busca rápido e de código aberto que suporta pesquisa por palavras-chave, pesquisa semântica, pesquisa geográfica e vetor de pesquisa.

Você pode [auto-hospedar] Typesense ou usar o [Typesense Cloud].

Para começar a usar o Typesense com o Scout, instale o Typesense PHP SDK via o gerenciador de pacotes do Composer:

```shell
composer require typesense/typesense-php
```

Então defina a variável de ambiente `SCOUT_DRIVER` e também suas credenciais da host do Typesense e chave da API dentro do seu arquivo .env do aplicativo:

```env
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

Se necessário, você também pode especificar porta, caminho e protocolo da instalação:

```env
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

Configurações adicionais e definições de esquema para suas coleções Typesense podem ser encontradas na sua aplicação's `config/scout.php` arquivo de configuração. Para mais informações sobre o Typesense, por favor consulte a documentação do Typesense  [Typesense documentação](https://typesense.org/docs/guide/#quick-start).

<a name="preparing-data-for-storage-in-typesense"></a>
#### Preparando dados para armazenamento no Typesense

Ao utilizar o Typesense, seu modelo pesquisável deve definir um método `toSearchableArray` que converte a chave primária do modelo para uma string e a data de criação para um carimbo de data/hora da Unix.

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

Você também deve definir seus esquemas de coleção em seu arquivo "config/scout.php" na sua aplicação. Um esquema de coleção descreve os tipos de dados de cada campo pesquisável por Typesense. Para mais informações sobre todas as opções do esquema disponíveis, consulte a documentação do Typesense [https://typesense.org/docs/latest/api/collections.html#schema-parameters].

Se você precisar modificar o esquema da sua coleção Typesense depois que ele já foi definido, você pode executar `scout:flush` e `scout:import`, o que vai excluir todos os dados indexados existentes e recriar o esquema. Ou você pode usar a API do Typesense para modificar o esquema da coleção sem remover nenhum dado indexado.

Se seu modelo pesquisável é "soft delete", você deve definir um campo `__soft_deleted` no esquema do Typesense correspondente ao modelo dentro do arquivo de configuração `config/scout.php` de sua aplicação:

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
#### Parâmetros de Pesquisa Dinâmica

O Typesense permite que você modifique seus [parâmetros de pesquisa](https://typesense.org/docs/latest/api/search.html#search-parameters) dinamicamente ao realizar uma operação de busca usando o método `options`:

```php
use App\Models\Todo;

Todo::search('Groceries')->options([
    'query_by' => 'title, description'
])->get();
```

<a name="configuration"></a>
## Configuração

<a name="configuring-model-indexes"></a>
### Configurar índices de modelo

Cada modelo Eloquent é sincronizado com um "índice" de pesquisa dado, que contém todos os registros pesquisáveis para esse modelo. Em outras palavras, você pode pensar em cada índice como uma tabela MySQL. Por padrão, cada modelo será persistido em um índice que corresponda ao nome da tabela típica do modelo. Geralmente, isso é a forma plural do nome do modelo; no entanto, você é livre para personalizar o índice do modelo sobrecarregando o método `searchableAs` no modelo:

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
### Configurando Dados Pesquisáveis

Por padrão, todo o formulário `toArray` de um modelo será persistido ao seu índice de pesquisa. Se você gostaria de personalizar os dados que sincronizam-se ao índice de pesquisa, pode substituir o método `toSearchableArray` no modelo:

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

Alguns mecanismos de busca, como o Meilisearch, realizam operações de filtragem (`>`, `<` ,etc.) apenas em dados do tipo correto. Por isso, ao utilizar esses mecanismos e personalizar seus dados pesquisáveis, certifique-se que os valores numéricos são convertidos para o tipo correto:

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
#### Configuração de Filtragem e Configurações do Índice (MeiliSearch)

Ao contrário de outros motoristas do Scout, o Meilisearch exige que você defina previamente os parâmetros de pesquisa de índice como atributos filtráveis, atributos classificáveis e [outros campos de configurações suportados](https://docs.meilisearch.com/reference/api/settings.html).

Atributos filtráveis são quaisquer atributos que você planeja filtrar ao invocar o método 'where' do Scout, enquanto os atributos ordenáveis são quaisquer atributos que você planeja classificar ao invocar o método 'orderBy' do Scout. Para definir suas configurações de índice, ajuste a seção 'index-settings' de sua configuração 'meilisearch' no arquivo de configuração do Scout do seu aplicativo:

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

Se o modelo subjacente de um determinado índice é "excluível" e está incluído na matriz 'index-settings', o Scout irá incluir suporte automático para filtragem sobre modelos excluíveis no índice. Se não houver outros atributos filtráveis ou ordenáveis a serem definidos em um índice de modelo excluível, você pode simplesmente adicionar uma entrada vazia à matriz 'index-settings' para esse modelo:

```php
'index-settings' => [
    Flight::class => []
],
```

Após configurar as configurações de índice da sua aplicação, você deve invocar o comando `scout:sync-index-settings`. Este comando informará ao Meilisearch sobre suas configurações atuais do índice. Para conveniência, você pode querer tornar este comando parte do seu processo de implantação:

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-the-model-id"></a>
### Configurando a ID do Modelo

Por padrão, o Scout usará a chave primária do modelo como a chave única do modelo que é armazenada no índice de busca. Se você precisar personalizar esse comportamento, você pode substituir os métodos 'getScoutKey' e 'getScoutKeyName' no modelo:

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
### Configurar Motores de Busca para Modelo

Ao pesquisar, o Scout normalmente usa o mecanismo de busca padrão especificado no arquivo 'scout' da configuração do aplicativo. Contudo, o mecanismo de busca para um modelo específico pode ser alterado por sobrescrevendo o método 'searchableUsing' na classe do modelo.

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
### Identificando Usuários

O Scout também permite que você identifique automaticamente os usuários ao utilizar o [Algolia](https://algolia.com). Associar o usuário autenticado com as operações de pesquisa pode ser útil quando visualizar seus análises de pesquisa dentro do painel do Algolia. Você pode habilitar a identificação de usuário definindo uma variável de ambiente `SCOUT_IDENTIFY` como 'verdadeira' no arquivo `.env` de sua aplicação:

```ini
SCOUT_IDENTIFY=true
```

A ativação desta funcionalidade também passará o endereço IP da solicitação e o identificador principal do usuário autenticado para a Algolia, para que os dados sejam associados à qualquer solicitação de pesquisa feita pelo usuário.

<a name="database-and-collection-engines"></a>
## Motores de Banco de Dados / Coleções

<a name="database-engine"></a>
### Maquina de banco de dados

> [Aviso]
> O banco de dados atualmente suporta MySQL e PostgreSQL.

Se sua aplicação interage com bancos de dados pequenos ou médios ou tem um trabalho leve, você pode encontrar mais conveniente começar a usar o "engine" do banco de dados do Scout. O mecanismo usará cláusulas "where like" e índices de texto completo ao filtrar os resultados do seu banco de dados para determinar quais os resultados aplicáveis para sua consulta.

Para utilizar o mecanismo de banco de dados, você pode simplesmente definir o valor da variável ambiental `SCOUT_DRIVER` para `database`, ou especificar diretamente o driver `database` no arquivo de configuração do seu aplicativo.

```ini
SCOUT_DRIVER=database
```

Depois de especificar o motor de banco de dados como seu driver preferido, você deve  [configurar os seus dados pesquisáveis](#configurando-dados-pesquisáveis) . Em seguida, você pode começar a  [executar consultas de pesquisa](#pesquisa) em seus modelos. A indexação do mecanismo de pesquisa, como o índice necessário para preencher índices do Algolia, Meilisearch ou Typesense, é desnecessária ao usar o motor de banco de dados.

#### Personalizando Estratégias de Pesquisa no Banco de Dados

Por padrão, o banco de dados executará uma consulta "onde like" contra todos os atributos do modelo que você tenha [configurado como pesquisáveis](#configurando-dados-pesquisáveis). No entanto, em algumas situações isso pode resultar em desempenho ruim. Portanto, a estratégia de pesquisa do mecanismo de banco de dados pode ser configurada para que algumas colunas especificadas utilizem consultas de busca de texto integral ou apenas usem as restrições "onde like" para pesquisar prefíxos de strings ( `example%`) em vez de pesquisar dentro da string inteira ( `%example%`).

Para definir esse comportamento, você pode atribuir atributos PHP ao método "toSearchableArray" do seu modelo. Qualquer colunas que não tiverem um comportamento adicional de estratégia de busca continuarão a utilizar a estratégia padrão "onde like":

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

> ¡¡ALERTA!
> Antes de especificar que uma coluna deve usar restrições de consulta de texto completo, certifique-se de que a coluna tenha sido atribuída um [índice de texto completo]( /docs/migrations # tipos-de-índices disponíveis ).

<a name="collection-engine"></a>
### Coleta de dados

Embora você possa usar o Algolia, Meilisearch ou TypeSense durante a fase de desenvolvimento local, talvez seja mais conveniente começar com o "motor da coleção". O motor da coleção utilizará cláusulas "onde" e filtragem de coleções nos resultados do seu banco de dados existente para determinar os resultados de pesquisa aplicáveis à sua consulta. Quando se utiliza este motor, não é necessário "indexar" seus modelos pesquisáveis, pois eles serão simplesmente recuperados do seu banco de dados local.

Para usar o motor de coleta, você pode simplesmente definir o valor da variável de ambiente `SCOUT_DRIVER` para "coleção", ou especificar o motorista "coleção" diretamente no arquivo de configuração do Scout do seu aplicativo.

```ini
SCOUT_DRIVER=collection
```

Uma vez que você tenha especificado o driver de coleção como seu driver preferido, você pode começar [executando consultas de pesquisa](#pesquisa) em seus modelos. A indexação do mecanismo de pesquisa, como a indexação necessária para preencher índices de Algolia, Meilisearch ou Typesense, é desnecessária ao usar o mecanismo de coleção.

#### Diferenças da partir do Motor de Banco de Dados

Ao olhar para o primeiro "motor de banco de dados" e "coleções", eles são bastante semelhantes. Ambos interagem diretamente com seu banco de dados para recuperar os resultados da pesquisa. No entanto, o motor de coleções não utiliza índices de texto completo ou cláusulas LIKE para encontrar registros correspondentes. Em vez disso, ele pega todos os possíveis registros e usa a função `Str::is` do Laravel para determinar se a string de pesquisa existe nos valores do atributo do modelo.

O mecanismo de busca é o mais portátil como ele funciona através de todos os bancos de dados relacionais suportados pelo Laravel (incluindo SQLite e SQL Server), porém, ele é menos eficiente do que o banco de dados do Scout.

<a name="indexing"></a>
## Indexação

<a name="batch-import"></a>
### Importação em lote

Se você estiver instalando o Scout em um projeto existente, você já pode ter registros de banco de dados que você precisa importar para seus índices. O Scout fornece um comando "Artisan" chamado 'scout:import' que você pode usar para importar todos os seus registros existentes nos índices de pesquisa:

```shell
php artisan scout:import "App\Models\Post"
```

O comando "flush" pode ser utilizado para remover todos os registros de um modelo dos seus índices de busca:

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### Modificando a Consulta de Importação

Se você gostaria de modificar a consulta que é usada para recuperar todos os seus modelos para importação em lote, você pode definir um método `makeAllSearchableUsing` no seu modelo. Este é um ótimo lugar para adicionar qualquer carregamento de relação ansiosa que pode ser necessário antes de importar seus modelos:

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

> [Aviso]
> O método `makeAllSearchableUsing` não é aplicável quando se utiliza uma fila para lotes de modelos importados. As relações [não são restauradas] quando coleções de modelos são processadas por trabalhos.

<a name="adding-records"></a>
### Adicionando registros

Uma vez que você tenha adicionado o trait `Laravel\Scout\Searchable` ao seu modelo, tudo que você precisa fazer é salvar ou criar uma instância do modelo e ela será adicionada automaticamente ao seu índice de pesquisa. Se você configurou o Scout para usar filas, esta operação será realizada em segundo plano pelo trabalhador da fila.

```php
    use App\Models\Order;

    $order = new Order;

    // ...

    $order->save();
```

<a name="adding-records-via-query"></a>
#### Adicionando Registros mediante consulta

Se você deseja adicionar uma coleção de modelos ao seu índice de busca via consulta Eloquent, você pode encadear o método 'searchable' para a consulta Eloquent. O método 'searchable' irá [fragmentar os resultados](/docs/eloquent#fragmenting-results) da consulta e adicionará os registros ao seu índice de busca. Novamente, se você configurou o Scout para usar filas, todos os fragmentos serão importados em segundo plano por seus trabalhadores de fila:

```php
    use App\Models\Order;

    Order::where('price', '>', 100)->searchable();
```

Você também pode chamar o método `searchable` em uma instância de relacionamento do Eloquent:

```php
    $user->orders()->searchable();
```

Ou, se já tiver uma coleção de modelos Eloquent na memória, você pode chamar o método `searchable` da instância da coleção para adicionar as instâncias do modelo aos seus índices correspondentes:

```php
    $orders->searchable();
```

> Nota!
> O método `searchable` pode ser considerado uma operação "upsert". Em outras palavras, se o registro do modelo já estiver em seu índice, ele será atualizado. Se não existir no índice de busca, ele será adicionado ao índice.

<a name="updating-records"></a>
### Atualizar Registros

Para atualizar um modelo pesquisável, você só precisa atualizar as propriedades da instância do modelo e salvar o modelo no banco de dados. O Scout irá persistir automaticamente as mudanças no seu índice de pesquisa:

```php
    use App\Models\Order;

    $order = Order::find(1);

    // Update the order...

    $order->save();
```

Você também pode usar o método 'searchable' em uma instância de consulta Eloquent para atualizar uma coleção de modelos. Se os modelos não existem no seu índice de pesquisa, eles serão criados:

```php
    Order::where('price', '>', 100)->searchable();
```

Se você gostaria de atualizar os registros do índice de pesquisa para todos os modelos em uma relação, você pode invocar o 'pesquisável' no exemplo da instância de relacionamento:

```php
    $user->orders()->searchable();
```

Ou, se você já tiver uma coleção de modelos Eloquent na memória, você pode chamar o método `searchable` da instância da coleção para atualizar as instâncias do modelo em seu índice correspondente:

```php
    $orders->searchable();
```

<a name="modifying-records-before-importing"></a>
#### Modificar registros antes da importação

Às vezes você pode precisar preparar a coleção de modelos antes que eles sejam pesquisáveis. Por exemplo, você talvez queira carregar uma relação em massa para que os dados da relação possam ser adicionados com eficiência ao seu índice de pesquisa. Para fazer isso, defina um método 'makeSearchableUsing' no modelo correspondente:

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
### Remoção de Registros

Para remover um registro do seu índice você pode simplesmente "apagar" o modelo do banco de dados. Isso pode ser feito mesmo se estiver usando modelos [apagados suavemente](/docs/eloquent#soft-deleting):

```php
    use App\Models\Order;

    $order = Order::find(1);

    $order->delete();
```

Se não quiser reavaliar o modelo antes de apagar a registro, você pode usar o método 'unsearchable' em uma instância da consulta do Eloquent:

```php
    Order::where('price', '>', 100)->unsearchable();
```

Se você gostaria de remover os registros de pesquisa para todos os modelos em uma relação, você pode invocar o `unsearchable` sobre a instância da relação:

```php
    $user->orders()->unsearchable();
```

Ou, se já tiver uma coleção de modelos Eloquent na memória, você pode chamar o método `unsearchable` da instância da coleção para remover as instâncias do modelo de seus respectivos índices:

```php
    $orders->unsearchable();
```

Para remover todos os registros do modelo de seu índice correspondente, você pode invocar o método 'removeFromSearch':

```php
    Order::removeAllFromSearch();
```

<a name="pausing-indexing"></a>
### Índice de Pausa

Às vezes você pode precisar executar uma série de operações Eloquent em um modelo sem sincronizar os dados do modelo com seu índice de pesquisa. Você pode fazer isso usando o método `withoutSyncingToSearch`. Este método aceita um único fechamento que será imediatamente executado. Qualquer operação do modelo que ocorra dentro do fechamento não será sincronizado para o índice do modelo:

```php
    use App\Models\Order;

    Order::withoutSyncingToSearch(function () {
        // Perform model actions...
    });
```

<a name="conditionally-searchable-model-instances"></a>
### Instâncias do Modelo de Pesquisa Condicional

Às vezes você pode precisar apenas de fazer um modelo pesquisável sob certas condições. Por exemplo, imagine que você tem o modelo 'App\Models\Post' que pode ser em um dos dois estados: "rascunho" e "publicado". Você só pode querer permitir que os posts "publicados" sejam pesquisáveis. Para fazer isso, você pode definir um método `shouldBeSearchable` em seu modelo:

```php
    /**
     * Determine if the model should be searchable.
     */
    public function shouldBeSearchable(): bool
    {
        return $this->isPublished();
    }
```

O método `shouldBeSearchable` é apenas aplicado quando se manipula modelos através dos métodos 'save', 'create', consultas ou relacionamentos. Fazer diretamente modelos ou coleções pesquisáveis usando o método 'searchable' irá sobrepor os resultados do método `shouldBeSearchable`.

> [!Aviso]
> O método 'shouldBeSearchable' não se aplica quando usando o 'database' engine de Scout, pois todos os dados pesquisáveis são armazenados no banco de dados. Para alcançar um comportamento similar ao usar o banco de dados, você deve utilizar as [cláusulas where](#where-clauses) em vez disso.

<a name="searching"></a>
## Buscando

Você pode começar a procurar um modelo usando o método 'pesquisa'. O método pesquisa aceita uma única string que será usada para pesquisar seus modelos. Você então deve encadear o método 'get' na consulta de pesquisa para recuperar os modelos Eloquent que correspondem à consulta de pesquisa dada:

```php
    use App\Models\Order;

    $orders = Order::search('Star Trek')->get();
```

Como o Search retorna uma coleção de modelos Eloquent, você pode até retornar os resultados diretamente de uma rota ou controlador e eles serão automaticamente convertidos para JSON.

```php
    use App\Models\Order;
    use Illuminate\Http\Request;

    Route::get('/search', function (Request $request) {
        return Order::search($request->search)->get();
    });
```

Se você quiser obter os resultados da pesquisa bruta antes que eles sejam convertidos em modelos Eloquent, você pode usar o método "raw":

```php
    $orders = Order::search('Star Trek')->raw();
```

<a name="custom-indexes"></a>
#### Índices personalizados

As consultas de pesquisa geralmente serão executadas no índice especificado pelo método 'searchableAs' do modelo. Contudo, você pode usar o método 'within' para especificar um índice personalizado que deve ser pesquisado em vez disso:

```php
    $orders = Order::search('Star Trek')
        ->within('tv_shows_popularity_desc')
        ->get();
```

<a name="where-clauses"></a>
### Onde as cláusulas

O Scout permite acrescentar cláusulas simples "onde" às suas consultas de pesquisa. Atualmente, essas cláusulas só suportam verificações básicas de igualdade numérica e são úteis principalmente para definir o escopo de uma consulta de pesquisa por um ID de proprietário:

```php
    use App\Models\Order;

    $orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

Além disso, o método 'whereIn' pode ser usado para verificar que um valor de uma coluna está contido em um determinado array.

```php
    $orders = Order::search('Star Trek')->whereIn(
        'status', ['open', 'paid']
    )->get();
```

O método `whereNotIn` verifica que o valor da coluna dada não está contido no dado array:

```php
    $orders = Order::search('Star Trek')->whereNotIn(
        'status', ['closed']
    )->get();
```

Como um índice de pesquisa não é um banco de dados relacional, as cláusulas "onde" mais avançadas não são suportadas atualmente.

> [!AVISO]
> Se a sua aplicação estiver utilizando o Meilisearch, você deve configurar os atributos [filtrables](#configurando-atributos-filtrabies-para-o-meilisearch) da sua aplicação antes de utilizar as cláusulas "where" do Scout.

<a name="pagination"></a>
### Página de número

Além de buscar uma coleção de modelos, você pode usar o método paginate para retornar seus resultados paginados. Este método retornará um objeto 'Illuminate\Pagination\LengthAwarepaginator' exatamente como se você tivesse [paginado um inquérito tradicional do Eloquent](/docs/pagination):

```php
    use App\Models\Order;

    $orders = Order::search('Star Trek')->paginate();
```

Você pode especificar quantos modelos recuperar por página, passando a quantidade como o primeiro argumento do método paginate :

```php
    $orders = Order::search('Star Trek')->paginate(15);
```

Uma vez que você tenha obtido os resultados, você pode exibir os resultados e renderizar os links de página usando [Blade] (docs/blade), exatamente como se tivesse paginado uma consulta tradicional do Eloquent.

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

Claro, se você gostaria de recuperar os resultados da paginação como JSON, você pode retornar a instância do paginador diretamente de uma rota ou controlador:

```php
    use App\Models\Order;
    use Illuminate\Http\Request;

    Route::get('/orders', function (Request $request) {
        return Order::search($request->input('query'))->paginate(15);
    });
```

> ¡Advertência!
> Como os mecanismos de busca não sabem do escopo global das definições da sua Eloquent model, você não deve utilizar escopos globais em aplicações que utilizam a paginação do Scout. Ou, você deveria recriar as restrições do escopo global quando estiver pesquisando via Scout.

<a name="soft-deleting"></a>
### Apagamento suave

Se seus modelos indexados são [excluídos suavemente](/docs/eloquent#soft-deleting) e você precisa pesquisar seus modelos excluídos suavemente, defina a opção de 'soft_delete' do arquivo de configuração `config/scout.php` para "true":

```php
    'soft_delete' => true,
```

Quando essa opção de configuração é `verdadeira`, o Scout não removerá modelos excluídos com suavidade do índice de pesquisa. Em vez disso, ele definirá um atributo oculto `__soft_deleted` no registro indexado. Então, você pode usar os métodos `withTrashed` ou `onlyTrashed` para obter registros excluídos com suavidade ao pesquisar:

```php
    use App\Models\Order;

    // Include trashed records when retrieving results...
    $orders = Order::search('Star Trek')->withTrashed()->get();

    // Only include trashed records when retrieving results...
    $orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> NOTA:
> Ao excluir um modelo com exclusão suave usando o comando 'forceDelete', o Scout irá removê-lo do índice de busca automaticamente.

<a name="customizing-engine-searches"></a>
### Personalizando as pesquisas do motor

Se você precisa realizar um ajuste mais sofisticado do comportamento de pesquisa de uma ferramenta você pode passar um closure como segundo argumento para o método `search`. Por exemplo, você poderia usar esse retorno de chamada para adicionar dados de geolocalização à sua pesquisa antes que a consulta seja passada ao Algolia:

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
#### Personalizando a consulta de resultados eloquentes

Depois de Scout recupera uma lista de modelos Eloquent correspondentes do mecanismo de pesquisa do seu aplicativo, Eloquent é usado para recuperar todos os modelos correspondentes por suas chaves primárias. Você pode personalizar esta consulta invocando o método 'query'. O método 'query' aceita um fechamento que receberá a instância construtora de consulta Eloquent como argumento:

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

Como essa chamada é invocada depois que os modelos relevantes já foram buscados do mecanismo de busca da sua aplicação, o método 'query' não deve ser utilizado para "filtragem" dos resultados. Em vez disso, utilize as [clausulas onde da Scout](#where-clauses).

<a name="custom-engines"></a>
## Motores personalizados

<a name="writing-the-engine"></a>
#### Escrevendo o Motor

Se um dos mecanismos de busca integrados do Scout não atende às suas necessidades, você pode escrever seu próprio mecanismo personalizado e registrá-lo com o Scout. Seu mecanismo deve estender a classe abstrata `Laravel\Scout\Engines\Engine`. Esta classe abstrata contém oito métodos que seu mecanismo personalizado deve implementar:

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

Você pode achar útil revisar as implementações desses métodos na classe `Laravel\Scout\Engines\AlgoliaEngine`. Essa classe fornecerá um bom ponto de partida para aprender como implementar cada um desses métodos em seu próprio mecanismo.

<a name="registering-the-engine"></a>
#### Registro do Motor

Uma vez que você tenha escrito seu motor personalizado, você pode registrá-lo com Scout usando o método `extend` do gerenciador de motores do Scout. O gerenciador de motores do Scout pode ser resolvido a partir do contêiner de serviços Laravel. Você deve chamar o método `extend` do método `boot` da sua classe `App\Providers\AppServiceProvider` ou qualquer outro provedor de serviços utilizado pelo seu aplicativo:

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

Depois que seu motor de banco de dados estiver registrado você pode especificar ele como o driver padrão do Scout no arquivo 'config/scout.php' da sua aplicação.

```php
    'driver' => 'mysql',
```
