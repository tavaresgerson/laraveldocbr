# Laravel Scout

<a name="introduction"></a>
## Introdução

[Laravel Scout](https://github.com/laravel/scout) fornece uma solução simples baseada em driver para adicionar pesquisa de texto completo aos seus [modelos Eloquent](/docs/eloquent). Usando observadores de modelo, o Scout manterá automaticamente seus índices de pesquisa sincronizados com seus registros Eloquent.

Atualmente, o Scout é fornecido com drivers [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org) e MySQL / PostgreSQL (`database`). Além disso, o Scout inclui um driver de "coleção" projetado para uso em desenvolvimento local e não requer nenhuma dependência externa ou serviços de terceiros. Além disso, escrever drivers personalizados é simples e você é livre para estender o Scout com suas próprias implementações de pesquisa.

<a name="installation"></a>
## Instalação

Primeiro, instale o Scout por meio do gerenciador de pacotes do Composer:

```shell
composer require laravel/scout
```

Após instalar o Scout, você deve publicar o arquivo de configuração do Scout usando o comando Artisan `vendor:publish`. Este comando publicará o arquivo de configuração `scout.php` no diretório `config` do seu aplicativo:

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

Finalmente, adicione o trait `Laravel\Scout\Searchable` ao modelo que você gostaria de tornar pesquisável. Este trait registrará um observador de modelo que manterá automaticamente o modelo em sincronia com seu driver de pesquisa:

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
### Enfileiramento

Embora não seja estritamente necessário para usar o Scout, você deve considerar fortemente configurar um [driver de fila](/docs/queues) antes de usar a biblioteca. Executar um queue worker permitirá que o Scout enfileire todas as operações que sincronizam as informações do seu modelo com seus índices de pesquisa, fornecendo tempos de resposta muito melhores para a interface da web do seu aplicativo.

Depois de configurar um driver de fila, defina o valor da opção `queue` no seu arquivo de configuração `config/scout.php` como `true`:

```php
    'queue' => true,
```

Mesmo quando a opção `queue` estiver definida como `false`, é importante lembrar que alguns drivers Scout, como Algolia e Meilisearch, sempre indexam registros de forma assíncrona. Ou seja, mesmo que a operação de indexação tenha sido concluída no seu aplicativo Laravel, o próprio mecanismo de pesquisa pode não refletir os registros novos e atualizados imediatamente.

Para especificar a conexão e a fila que seus trabalhos Scout utilizam, você pode definir a opção de configuração `queue` como uma matriz:

```php
    'queue' => [
        'connection' => 'redis',
        'queue' => 'scout'
    ],
```

Claro, se você personalizar a conexão e a fila que os trabalhos Scout utilizam, você deve executar um trabalhador de fila para processar trabalhos nessa conexão e fila:

```php
    php artisan queue:work redis --queue=scout
```

<a name="driver-prerequisites"></a>
## Pré-requisitos do driver

<a name="algolia"></a>
### Algolia

Ao usar o driver Algolia, você deve configurar suas credenciais `id` e `secret` do Algolia em seu arquivo de configuração `config/scout.php`. Depois que suas credenciais forem configuradas, você também precisará instalar o Algolia PHP SDK por meio do gerenciador de pacotes Composer:

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
### Meilisearch

[Meilisearch](https://www.meilisearch.com) é um mecanismo de busca incrivelmente rápido e de código aberto. Se você não tem certeza de como instalar o Meilisearch em sua máquina local, você pode usar [Laravel Sail](/docs/sail#meilisearch), o ambiente de desenvolvimento Docker oficialmente suportado pelo Laravel.

Ao usar o driver Meilisearch, você precisará instalar o Meilisearch PHP SDK por meio do gerenciador de pacotes Composer:

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

Então, defina a variável de ambiente `SCOUT_DRIVER`, bem como suas credenciais `host` e `key` do Meilisearch dentro do arquivo `.env` do seu aplicativo:

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

Para mais informações sobre o Meilisearch, consulte a [documentação do Meilisearch](https://docs.meilisearch.com/learn/getting_started/quick_start.html).

Além disso, você deve garantir que instalou uma versão do `meilisearch/meilisearch-php` que seja compatível com sua versão binária do Meilisearch revisando [a documentação do Meilisearch sobre compatibilidade binária](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch).

::: warning AVISO
Ao atualizar o Scout em um aplicativo que utiliza o Meilisearch, você deve sempre [revisar quaisquer alterações de quebra adicionais](https://github.com/meilisearch/Meilisearch/releases) no próprio serviço Meilisearch.
:::

<a name="typesense"></a>
### Typesense

[Typesense](https://typesense.org) é um mecanismo de busca de código aberto e extremamente rápido, que oferece suporte a busca por palavra-chave, busca semântica, busca geográfica e busca vetorial.

Você pode [self-host](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting) Typesense ou usar [Typesense Cloud](https://cloud.typesense.org).

Para começar a usar o Typesense com o Scout, instale o Typesense PHP SDK por meio do gerenciador de pacotes do Composer:

```shell
composer require typesense/typesense-php
```

Em seguida, defina a variável de ambiente `SCOUT_DRIVER`, bem como suas credenciais de host e chave de API do Typesense no arquivo .env do seu aplicativo:

```env
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

Se necessário, você também pode especificar a porta, o caminho e o protocolo da sua instalação:

```env
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

Configurações adicionais e definições de esquema para suas coleções Typesense podem ser encontradas no arquivo de configuração `config/scout.php` do seu aplicativo. Para mais informações sobre o Typesense, consulte a [documentação do Typesense](https://typesense.org/docs/guide/#quick-start).

<a name="preparing-data-for-storage-in-typesense"></a>
#### Preparando dados para armazenamento no Typesense

Ao utilizar o Typesense, seus modelos pesquisáveis ​​devem definir um método `toSearchableArray` que converte a chave primária do seu modelo para uma string e a data de criação para um registro de data e hora UNIX:

```php
/**
 * Obtenha a matriz de dados indexáveis ​​para o modelo.
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

Você também deve definir seus esquemas de coleção do Typesense no arquivo `config/scout.php` do seu aplicativo. Um esquema de coleção descreve os tipos de dados de cada campo que pode ser pesquisado via Typesense. Para obter mais informações sobre todas as opções de esquema disponíveis, consulte a [documentação do Typesense](https://typesense.org/docs/latest/api/collections.html#schema-parameters).

Se você precisar alterar o esquema da sua coleção do Typesense após ele ter sido definido, você pode executar `scout:flush` e `scout:import`, que excluirão todos os dados indexados existentes e recriarão o esquema. Ou você pode usar a API do Typesense para modificar o esquema da coleção sem remover nenhum dado indexado.

Se o seu modelo pesquisável for soft deleteable, você deve definir um campo `__soft_deleted` no esquema Typesense correspondente do modelo dentro do arquivo de configuração `config/scout.php` do seu aplicativo:

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
#### Parâmetros de pesquisa dinâmicos

O Typesense permite que você modifique seus [parâmetros de pesquisa](https://typesense.org/docs/latest/api/search.html#search-parameters) dinamicamente ao executar uma operação de pesquisa por meio do método `options`:

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

Cada modelo Eloquent é sincronizado com um determinado "índice" de pesquisa, que contém todos os registros pesquisáveis ​​para esse modelo. Em outras palavras, você pode pensar em cada índice como uma tabela MySQL. Por padrão, cada modelo será persistido em um índice que corresponde ao nome típico de "tabela" do modelo. Normalmente, essa é a forma plural do nome do modelo; no entanto, você é livre para personalizar o índice do modelo substituindo o método `searchableAs` no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class Post extends Model
    {
        use Searchable;

        /**
         * Obtenha o nome do índice associado ao modelo.
         */
        public function searchableAs(): string
        {
            return 'posts_index';
        }
    }
```

<a name="configuring-searchable-data"></a>
### Configurando dados pesquisáveis

Por padrão, todo o formulário `toArray` de um determinado modelo será persistido em seu índice de pesquisa. Se você quiser personalizar os dados que são sincronizados com o índice de pesquisa, você pode substituir o método `toSearchableArray` no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class Post extends Model
    {
        use Searchable;

        /**
         * Obtenha a matriz de dados indexáveis ​​para o modelo.
         *
         * @return array<string, mixed>
         */
        public function toSearchableArray(): array
        {
            $array = $this->toArray();

            // Personalize a matriz de dados...

            return $array;
        }
    }
```

Alguns mecanismos de pesquisa, como o Meilisearch, só executarão operações de filtro (`>`, `<`, etc.) em dados do tipo correto. Portanto, ao usar esses mecanismos de busca e personalizar seus dados pesquisáveis, você deve garantir que os valores numéricos sejam convertidos para o tipo correto:

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
#### Configurando dados filtráveis ​​e configurações de índice (Meilisearch)

Ao contrário de outros drivers do Scout, o Meilisearch exige que você predefina as configurações de pesquisa de índice, como atributos filtráveis, atributos classificáveis ​​e [outros campos de configurações suportados](https://docs.meilisearch.com/reference/api/settings.html).

Atributos filtráveis ​​são quaisquer atributos que você planeja filtrar ao invocar o método `where` do Scout, enquanto atributos classificáveis ​​são quaisquer atributos que você planeja classificar ao invocar o método `orderBy` do Scout. Para definir suas configurações de índice, ajuste a parte `index-settings` da sua entrada de configuração `meilisearch` no arquivo de configuração `scout` do seu aplicativo:

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
            // Outros campos de configuração...
        ],
        Flight::class => [
            'filterableAttributes'=> ['id', 'destination'],
            'sortableAttributes' => ['updated_at'],
        ],
    ],
],
```

Se o modelo subjacente a um determinado índice for passível de exclusão reversível e estiver incluído na matriz `index-settings`, o Scout incluirá automaticamente o suporte para filtragem em modelos de exclusão reversível naquele índice. Se você não tiver outros atributos filtráveis ​​ou classificáveis ​​para definir para um índice de modelo soft deletable, você pode simplesmente adicionar uma entrada vazia ao array `index-settings` para esse modelo:

```php
'index-settings' => [
    Flight::class => []
],
```

Após configurar as configurações de índice do seu aplicativo, você deve invocar o comando Artisan `scout:sync-index-settings`. Este comando informará o Meilisearch sobre suas configurações de índice configuradas no momento. Por conveniência, você pode desejar tornar este comando parte do seu processo de implantação:

```shell
php artisan scout:sync-index-settings
```

<a name="configuring-the-model-id"></a>
### Configurando o ID do modelo

Por padrão, o Scout usará a chave primária do modelo como o ID/chave exclusivo do modelo que é armazenado no índice de pesquisa. Se precisar personalizar esse comportamento, você pode substituir os métodos `getScoutKey` e `getScoutKeyName` no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Laravel\Scout\Searchable;

    class User extends Model
    {
        use Searchable;

        /**
         * Obtenha o valor usado para indexar o modelo.
         */
        public function getScoutKey(): mixed
        {
            return $this->email;
        }

        /**
         * Obtenha o nome da chave usada para indexar o modelo.
         */
        public function getScoutKeyName(): mixed
        {
            return 'email';
        }
    }
```

<a name="configuring-search-engines-per-model"></a>
### Configurando mecanismos de busca por modelo

Ao pesquisar, o Scout normalmente usará o mecanismo de busca padrão especificado no arquivo de configuração `scout` do seu aplicativo. No entanto, o mecanismo de busca para um modelo específico pode ser alterado substituindo o método `searchableUsing` no modelo:

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
         * Obtenha o mecanismo usado para indexar o modelo.
         */
        public function searchableUsing(): Engine
        {
            return app(EngineManager::class)->engine('meilisearch');
        }
    }
```

<a name="identifying-users"></a>
### Identificando usuários

O Scout também permite que você identifique usuários automaticamente ao usar [Algolia](https://algolia.com). Associar o usuário autenticado às operações de busca pode ser útil ao visualizar suas análises de busca no painel do Algolia. Você pode habilitar a identificação do usuário definindo uma variável de ambiente `SCOUT_IDENTIFY` como `true` no arquivo `.env` do seu aplicativo:

```ini
SCOUT_IDENTIFY=true
```

Habilitar esse recurso também passará o endereço IP da solicitação e o identificador primário do seu usuário autenticado para a Algolia, para que esses dados sejam associados a qualquer solicitação de pesquisa feita pelo usuário.

<a name="database-and-collection-engines"></a>
## Mecanismos de banco de dados/coleção

<a name="database-engine"></a>
### Mecanismo de banco de dados

::: warning AVISO
O mecanismo de banco de dados atualmente oferece suporte a MySQL e PostgreSQL.
:::

Se seu aplicativo interage com bancos de dados de pequeno a médio porte ou tem uma carga de trabalho leve, você pode achar mais conveniente começar com o mecanismo de "banco de dados" do Scout. O mecanismo de banco de dados usará cláusulas "where like" e índices de texto completo ao filtrar resultados do seu banco de dados existente para determinar os resultados de pesquisa aplicáveis ​​à sua consulta.

Para usar o mecanismo de banco de dados, você pode simplesmente definir o valor da variável de ambiente `SCOUT_DRIVER` como `database` ou especificar o driver `database` diretamente no arquivo de configuração `scout` do seu aplicativo:

```ini
SCOUT_DRIVER=database
```

Depois de especificar o mecanismo de banco de dados como seu driver preferencial, você deve [configurar seus dados pesquisáveis](#configuring-searchable-data). Então, você pode começar a [executar consultas de pesquisa](#searching) em seus modelos. A indexação do mecanismo de pesquisa, como a indexação necessária para semear índices Algolia, Meilisearch ou Typesense, é desnecessária ao usar o mecanismo de banco de dados.

#### Personalizando estratégias de pesquisa de banco de dados

Por padrão, o mecanismo de banco de dados executará uma consulta "where like" em cada atributo de modelo que você [configurou como pesquisável](#configuring-searchable-data). No entanto, em algumas situações, isso pode resultar em desempenho ruim. Portanto, a estratégia de pesquisa do mecanismo de banco de dados pode ser configurada para que algumas colunas especificadas utilizem consultas de pesquisa de texto completo ou usem apenas restrições "where like" para pesquisar os prefixos de strings (`example%`) em vez de pesquisar dentro da string inteira (`%example%`).

Para definir esse comportamento, você pode atribuir atributos PHP ao método `toSearchableArray` do seu modelo. Quaisquer colunas que não tenham um comportamento de estratégia de pesquisa adicional atribuído continuarão a usar a estratégia padrão "where like":

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * Obtenha a matriz de dados indexáveis ​​para o modelo.
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

::: warning AVISO
Antes de especificar que uma coluna deve usar restrições de consulta de texto completo, certifique-se de que a coluna tenha recebido um [índice de texto completo](/docs/migrations#available-index-types).
:::

<a name="collection-engine"></a>
### Mecanismo de coleta

Embora você esteja livre para usar os mecanismos de pesquisa Algolia, Meilisearch ou Typesense durante o desenvolvimento local, pode ser mais conveniente começar com o mecanismo de "coleção". O mecanismo de coleta usará cláusulas "where" e filtragem de coleção em resultados do seu banco de dados existente para determinar os resultados de pesquisa aplicáveis ​​à sua consulta. Ao usar esse mecanismo, não é necessário "indexar" seus modelos pesquisáveis, pois eles serão simplesmente recuperados do seu banco de dados local.

Para usar o mecanismo de coleta, você pode simplesmente definir o valor da variável de ambiente `SCOUT_DRIVER` como `collection` ou especificar o driver `collection` diretamente no arquivo de configuração `scout` do seu aplicativo:

```ini
SCOUT_DRIVER=collection
```

Depois de especificar o driver de coleta como seu driver preferencial, você pode começar a [executar consultas de pesquisa](#searching) em seus modelos. A indexação do mecanismo de pesquisa, como a indexação necessária para semear índices Algolia, Meilisearch ou Typesense, é desnecessária ao usar o mecanismo de coleta.

#### Diferenças do mecanismo de banco de dados

À primeira vista, os mecanismos "database" e "collections" são bastante semelhantes. Ambos interagem diretamente com seu banco de dados para recuperar resultados de pesquisa. No entanto, o mecanismo de coleta não utiliza índices de texto completo ou cláusulas `LIKE` para encontrar registros correspondentes. Em vez disso, ele extrai todos os registros possíveis e usa o auxiliar `Str::is` do Laravel para determinar se a sequência de pesquisa existe dentro dos valores de atributo do modelo.

O mecanismo de coleta é o mecanismo de busca mais portátil, pois funciona em todos os bancos de dados relacionais suportados pelo Laravel (incluindo SQLite e SQL Server); no entanto, é menos eficiente do que o mecanismo de banco de dados do Scout.

<a name="indexing"></a>
## Indexação

<a name="batch-import"></a>
### Importação em lote

Se você estiver instalando o Scout em um projeto existente, talvez já tenha registros de banco de dados que precisa importar para seus índices. O Scout fornece um comando Artisan `scout:import` que você pode usar para importar todos os seus registros existentes para seus índices de pesquisa:

```shell
php artisan scout:import "App\Models\Post"
```

O comando `flush` pode ser usado para remover todos os registros de um modelo de seus índices de pesquisa:

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### Modificando a consulta de importação

Se você quiser modificar a consulta usada para recuperar todos os seus modelos para importação em lote, você pode definir um método `makeAllSearchableUsing` em seu modelo. Este é um ótimo lugar para adicionar qualquer carregamento de relacionamento ansioso que possa ser necessário antes de importar seus modelos:

```php
    use Illuminate\Database\Eloquent\Builder;

    /**
     * Modifique a consulta usada para recuperar modelos ao tornar todos os modelos pesquisáveis.
     */
    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query->with('author');
    }
```

::: warning AVISO
O método `makeAllSearchableUsing` pode não ser aplicável ao usar uma fila para importar modelos em lote. Os relacionamentos [não são restaurados](/docs/queues#handling-relationships) quando coleções de modelos são processadas por jobs.
:::

<a name="adding-records"></a>
### Adicionando registros

Depois de adicionar o trait `Laravel\Scout\Searchable` a um modelo, tudo o que você precisa fazer é `salvar` ou `criar` uma instância de modelo e ela será automaticamente adicionada ao seu índice de pesquisa. Se você configurou o Scout para [usar filas](#queueing), esta operação será realizada em segundo plano pelo seu trabalhador de fila:

```php
    use App\Models\Order;

    $order = new Order;

    // ...

    $order->save();
```

<a name="adding-records-via-query"></a>
#### Adicionando Registros via Consulta

Se você quiser adicionar uma coleção de modelos ao seu índice de pesquisa por meio de uma consulta Eloquent, você pode encadear o método `searchable` na consulta Eloquent. O método `searchable` irá [dividir os resultados](/docs/eloquent#chunking-results) da consulta e adicionar os registros ao seu índice de pesquisa. Novamente, se você configurou o Scout para usar filas, todos os pedaços serão importados em segundo plano pelos seus trabalhadores de fila:

```php
    use App\Models\Order;

    Order::where('price', '>', 100)->searchable();
```

Você também pode chamar o método `searchable` em uma instância de relacionamento Eloquent:

```php
    $user->orders()->searchable();
```

Ou, se você já tem uma coleção de modelos Eloquent na memória, você pode chamar o método `searchable` na instância da coleção para adicionar as instâncias do modelo ao seu índice correspondente:

```php
    $orders->searchable();
```

::: info NOTA
O método `searchable` pode ser considerado uma operação "upsert". Em outras palavras, se o registro do modelo já estiver no seu índice, ele será atualizado. Se ele não existir no índice de pesquisa, ele será adicionado ao índice.
:::

<a name="updating-records"></a>
### Atualizando Registros

Para atualizar um modelo pesquisável, você só precisa atualizar as propriedades da instância do modelo e `salvar` o modelo no seu banco de dados. O Scout persistirá automaticamente as alterações no seu índice de pesquisa:

```php
    use App\Models\Order;

    $order = Order::find(1);

    // Atualizar o pedido...

    $order->save();
```

Você também pode invocar o método `searchable` em uma instância de consulta do Eloquent para atualizar uma coleção de modelos. Se os modelos não existirem no seu índice de pesquisa, eles serão criados:

```php
    Order::where('price', '>', 100)->searchable();
```

Se você quiser atualizar os registros do índice de pesquisa para todos os modelos em um relacionamento, você pode invocar o `searchable` na instância do relacionamento:

```php
    $user->orders()->searchable();
```

Ou, se você já tiver uma coleção de modelos Eloquent na memória, você pode chamar o método `searchable` na instância da coleção para atualizar as instâncias do modelo em seu índice correspondente:

```php
    $orders->searchable();
```

<a name="modifying-records-before-importing"></a>
#### Modificando registros antes de importar

Às vezes, você pode precisar preparar a coleção de modelos antes que eles se tornem pesquisáveis. Por exemplo, você pode querer carregar um relacionamento para que os dados do relacionamento possam ser adicionados de forma eficiente ao seu índice de pesquisa. Para fazer isso, defina um método `makeSearchableUsing` no modelo correspondente:

```php
    use Illuminate\Database\Eloquent\Collection;

    /**
     * Modifique a coleção de modelos que estão sendo tornados pesquisáveis.
     */
    public function makeSearchableUsing(Collection $models): Collection
    {
        return $models->load('author');
    }
```

<a name="removing-records"></a>
### Removendo registros

Para remover um registro do seu índice, você pode simplesmente `deletar` o modelo do banco de dados. Isso pode ser feito mesmo se você estiver usando modelos [soft deleted](/docs/eloquent#soft-deleting):

```php
    use App\Models\Order;

    $order = Order::find(1);

    $order->delete();
```

Se você não quiser recuperar o modelo antes de excluir o registro, você pode usar o método `unsearchable` em uma instância de consulta Eloquent:

```php
    Order::where('price', '>', 100)->unsearchable();
```

Se você quiser remover os registros de índice de pesquisa para todos os modelos em um relacionamento, você pode invocar o `unsearchable` na instância de relacionamento:

```php
    $user->orders()->unsearchable();
```

Ou, se você já tiver uma coleção de modelos Eloquent na memória, você pode chamar o método `unsearchable` na instância de coleção para remover as instâncias de modelo de seu índice correspondente:

```php
    $orders->unsearchable();
```

Para remover todos os registros de modelo de seu índice correspondente, você pode invocar o método `removeAllFromSearch`:

```php
    Order::removeAllFromSearch();
```

<a name="pausing-indexing"></a>
### Pausando a indexação

Às vezes, você pode precisar executar um lote de operações do Eloquent em um modelo sem sincronizar os dados do modelo com seu índice de pesquisa. Você pode fazer isso usando o método `withoutSyncingToSearch`. Este método aceita um único fechamento que será executado imediatamente. Quaisquer operações de modelo que ocorrerem dentro do fechamento não serão sincronizadas com o índice do modelo:

```php
    use App\Models\Order;

    Order::withoutSyncingToSearch(function () {
        // Executar ações de modelo...
    });
```

<a name="conditionally-searchable-model-instances"></a>
### Instâncias de modelo pesquisáveis ​​condicionalmente

Às vezes, você pode precisar tornar um modelo pesquisável somente sob certas condições. Por exemplo, imagine que você tem um modelo `App\Models\Post` que pode estar em um dos dois estados: "rascunho" e "publicado". Você pode querer permitir que apenas postagens "publicadas" sejam pesquisáveis. Para fazer isso, você pode definir um método `shouldBeSearchable` no seu modelo:

```php
    /**
     * Determine se o modelo deve ser pesquisável.
     */
    public function shouldBeSearchable(): bool
    {
        return $this->isPublished();
    }
```

O método `shouldBeSearchable` é aplicado somente ao manipular modelos por meio dos métodos `save` e `create`, consultas ou relacionamentos. Tornar modelos ou coleções pesquisáveis ​​diretamente usando o método `searchable` substituirá o resultado do método `shouldBeSearchable`.

::: warning AVISO
O método `shouldBeSearchable` não é aplicável ao usar o mecanismo de "banco de dados" do Scout, pois todos os dados pesquisáveis ​​são sempre armazenados no banco de dados. Para obter um comportamento semelhante ao usar o mecanismo de banco de dados, você deve usar [cláusulas where](#where-clauses) em vez disso.
:::

<a name="searching"></a>
## Pesquisando

Você pode começar a pesquisar um modelo usando o método `search`. O método de pesquisa aceita uma única string que será usada para pesquisar seus modelos. Você deve então encadear o método `get` na consulta de pesquisa para recuperar os modelos Eloquent que correspondem à consulta de pesquisa fornecida:

```php
    use App\Models\Order;

    $orders = Order::search('Star Trek')->get();
```

Como as pesquisas do Scout retornam uma coleção de modelos Eloquent, você pode até mesmo retornar os resultados diretamente de uma rota ou controlador e eles serão automaticamente convertidos para JSON:

```php
    use App\Models\Order;
    use Illuminate\Http\Request;

    Route::get('/search', function (Request $request) {
        return Order::search($request->search)->get();
    });
```

Se você quiser obter os resultados brutos da pesquisa antes que eles sejam convertidos para modelos Eloquent, você pode usar o método `raw`:

```php
    $orders = Order::search('Star Trek')->raw();
```

<a name="custom-indexes"></a>
#### Índices personalizados

As consultas de pesquisa normalmente serão executadas no índice especificado pelo método [`searchableAs`](#configuring-model-indexes) do modelo. No entanto, você pode usar o método `within` para especificar um índice personalizado que deve ser pesquisado:

```php
    $orders = Order::search('Star Trek')
        ->within('tv_shows_popularity_desc')
        ->get();
```

<a name="where-clauses"></a>
### Cláusulas Where

O Scout permite que você adicione cláusulas "where" simples às suas consultas de pesquisa. Atualmente, essas cláusulas suportam apenas verificações básicas de igualdade numérica e são úteis principalmente para escopo de consultas de pesquisa por um ID de proprietário:

```php
    use App\Models\Order;

    $orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

Além disso, o método `whereIn` pode ser usado para verificar se o valor de uma determinada coluna está contido na matriz fornecida:

```php
    $orders = Order::search('Star Trek')->whereIn(
        'status', ['open', 'paid']
    )->get();
```

O método `whereNotIn` verifica se o valor da coluna fornecida não está contido na matriz fornecida:

```php
    $orders = Order::search('Star Trek')->whereNotIn(
        'status', ['closed']
    )->get();
```

Como um índice de pesquisa não é um banco de dados relacional, cláusulas "where" mais avançadas não são suportadas atualmente.

::: warning AVISO
Se seu aplicativo estiver usando Meilisearch, você deve configurar os [atributos filtráveis](#configuring-filterable-data-for-meilisearch) do seu aplicativo antes de utilizar as cláusulas "where" do Scout.
:::

<a name="pagination"></a>
### Paginação

Além de recuperar uma coleção de modelos, você pode paginar seus resultados de pesquisa usando o método `paginate`. Este método retornará uma instância `Illuminate\Pagination\LengthAwarePaginator` como se você tivesse [paginado uma consulta Eloquent tradicional](/docs/pagination):

```php
    use App\Models\Order;

    $orders = Order::search('Star Trek')->paginate();
```

Você pode especificar quantos modelos recuperar por página passando a quantidade como o primeiro argumento para o método `paginate`:

```php
    $orders = Order::search('Star Trek')->paginate(15);
```

Depois de recuperar os resultados, você pode exibi-los e renderizar os links de página usando [Blade](/docs/blade) como se tivesse paginado uma consulta Eloquent tradicional:

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

Claro, se você quiser recuperar os resultados da paginação como JSON, você pode retornar a instância do paginador diretamente de uma rota ou controlador:

```php
    use App\Models\Order;
    use Illuminate\Http\Request;

    Route::get('/orders', function (Request $request) {
        return Order::search($request->input('query'))->paginate(15);
    });
```

::: warning AVISO
Como a pesquisa motores não estão cientes das definições de escopo global do seu modelo Eloquent, você não deve utilizar escopos globais em aplicativos que utilizam paginação Scout. Ou você deve recriar as restrições do escopo global ao pesquisar via Scout.
:::

<a name="soft-deleting"></a>
### Exclusão suave

Se seus modelos indexados forem [exclusão suave](/docs/eloquent#soft-deleting) e você precisar pesquisar seus modelos excluídos suavemente, defina a opção `soft_delete` do arquivo de configuração `config/scout.php` como `true`:

```php
    'soft_delete' => true,
```

Quando esta opção de configuração for `true`, o Scout não removerá modelos excluídos suavemente do índice de pesquisa. Em vez disso, ele definirá um atributo oculto `__soft_deleted` no registro indexado. Então, você pode usar os métodos `withTrashed` ou `onlyTrashed` para recuperar os registros excluídos temporariamente ao pesquisar:

```php
    use App\Models\Order;

    // Incluir registros descartados ao recuperar resultados...
    $orders = Order::search('Star Trek')->withTrashed()->get();

    // Incluir somente registros descartados ao recuperar resultados...
    $orders = Order::search('Star Trek')->onlyTrashed()->get();
```

::: info NOTA
Quando um modelo excluído temporariamente é excluído permanentemente usando `forceDelete`, o Scout o removerá do índice de pesquisa automaticamente.
:::

<a name="customizing-engine-searches"></a>
### Personalizando pesquisas de mecanismo

Se você precisar executar uma personalização avançada do comportamento de pesquisa de um mecanismo, poderá passar um fechamento como o segundo argumento para o método `search`. Por exemplo, você pode usar este retorno de chamada para adicionar dados de geolocalização às suas opções de pesquisa antes que a consulta de pesquisa seja passada para Algolia:

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
#### Personalizando a consulta de resultados do Eloquent

Após o Scout recuperar uma lista de modelos Eloquent correspondentes do mecanismo de pesquisa do seu aplicativo, o Eloquent é usado para recuperar todos os modelos correspondentes por suas chaves primárias. Você pode personalizar esta consulta invocando o método `query`. O método `query` aceita um fechamento que receberá a instância do construtor de consultas Eloquent como um argumento:

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

Como este retorno de chamada é invocado após os modelos relevantes já terem sido recuperados do mecanismo de pesquisa do seu aplicativo, o método `query` não deve ser usado para "filtrar" resultados. Em vez disso, você deve usar [cláusulas where do Scout](#where-clauses).

<a name="custom-engines"></a>
## Motores personalizados

<a name="writing-the-engine"></a>
#### Escrevendo o motor

Se um dos motores de busca Scout integrados não atender às suas necessidades, você pode escrever seu próprio motor personalizado e registrá-lo no Scout. Seu motor deve estender a classe abstrata `Laravel\Scout\Engines\Engine`. Esta classe abstrata contém oito métodos que seu motor personalizado deve implementar:

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

Você pode achar útil revisar as implementações desses métodos na classe `Laravel\Scout\Engines\AlgoliaEngine`. Esta classe fornecerá um bom ponto de partida para aprender como implementar cada um desses métodos em seu próprio motor.

<a name="registering-the-engine"></a>
#### Registrando o motor

Depois de escrever seu motor personalizado, você pode registrá-lo no Scout usando o método `extend` do gerenciador de motor Scout. O gerenciador de mecanismo do Scout pode ser resolvido a partir do contêiner de serviço do Laravel. Você deve chamar o método `extend` do método `boot` da sua classe `App\Providers\AppServiceProvider` ou qualquer outro provedor de serviço usado pelo seu aplicativo:

```php
    use App\ScoutExtensions\MySqlSearchEngine;
    use Laravel\Scout\EngineManager;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        resolve(EngineManager::class)->extend('mysql', function () {
            return new MySqlSearchEngine;
        });
    }
```

Depois que seu mecanismo for registrado, você pode especificá-lo como seu `driver` Scout padrão no arquivo de configuração `config/scout.php` do seu aplicativo:

```php
    'driver' => 'mysql',
```
