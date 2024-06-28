# Eloquent: Recursos da API

<a name="introduction"></a>
## Introdução

 Ao construir uma API, você pode precisar de uma camada de transformação que seja colocada entre os seus modelos do Eloquent e as respostas em JSON que são realmente retornadas para os usuários da aplicativo. Por exemplo, talvez você queira mostrar atributos específicos para um subconjunto de usuários e não outros ou que talvez você queira incluir sempre certos relacionamentos na representação em JSON de seus modelos. As classes de recursos do Eloquent permitem que você transforme seus modelos e coletões de modelos expressiva e facilmente para um formato JSON.

 É claro que você sempre pode converter modelos ou coleções do Eloquent para JSON usando os métodos `toJson`; no entanto, os recursos do Eloquent fornecem um controle mais granular e robusto da serialização de JSON de seus modelos e relacionamentos.

<a name="generating-resources"></a>
## Gerando recursos

 Para gerar uma classe de recursos, você pode usar o comando `make:resource`, da Artisan. Os recursos serão exibidos no diretório padrão `app/Http/Resources` da sua aplicação. Os recursos se baseiam na classe `Illuminate\Http\Resources\Json\JsonResource`:

```shell
php artisan make:resource UserResource
```

<a name="generating-resource-collections"></a>
#### Coleções de recursos

 Além de gerar recursos para transformar modelos individuais, você pode criar recursos que são responsáveis por transformar coleções de modelos. Isso permite que as respostas JSON incluam links e outras informações metadados relevantes para uma coleção inteira de um recurso específico.

 Para criar uma coleção de recursos, é necessário utilizar o sinalizador `--collection` ao criar o recurso ou inclui a palavra "Coleção" no nome do recurso. Isso indica ao Laravel que deve criar um recurso de coleção. As coleções de recursos fazem uso da classe `Illuminate\Http\Resources\Json\ResourceCollection`:

```shell
php artisan make:resource User --collection

php artisan make:resource UserCollection
```

<a name="concept-overview"></a>
## Visão geral do conceito

 > [!ATENÇÃO]
 > Esta é uma visão geral de alto nível dos recursos e coleções de recursos. É altamente recomendável que você leia as outras seções desta documentação para obter um entendimento mais profundo das personalizações e poderes oferecidos pelos recursos.

 Antes de mergulharmos em todas as opções disponíveis ao escrever recursos, vamos dar uma olhada em alto nível no uso dos recursos na Laravel. Um recurso representa um único modelo que precisa ser transformado em uma estrutura JSON. Por exemplo, aqui está uma simples classe de recurso "UserResource":

```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Request;
    use Illuminate\Http\Resources\Json\JsonResource;

    class UserResource extends JsonResource
    {
        /**
         * Transform the resource into an array.
         *
         * @return array<string, mixed>
         */
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
                'name' => $this->name,
                'email' => $this->email,
                'created_at' => $this->created_at,
                'updated_at' => $this->updated_at,
            ];
        }
    }
```

 Cada classe de recurso define um método `toArray`, que retorna o array de atributos que devem ser convertidos em JSON quando o recurso é retornado como uma resposta de um rote ou método do controlador.

 Observe que é possível acessar propriedades do modelo diretamente da variável `$this`. Isso ocorre porque uma classe de recurso irá automaticamente fazer o acesso das propriedades e métodos na modelagem subjacente. Depois de definida, a recurso pode ser retornada por um roteador ou controlador. O recurso aceita as instâncias do modelo subjacente através de seu construtor:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user/{id}', function (string $id) {
        return new UserResource(User::findOrFail($id));
    });
```

<a name="resource-collections"></a>
### Coleções de Recursos

 Se você estiver devolvendo uma coleção de recursos ou uma resposta em páginas, utilize o método `collection` fornecido pela sua classe de recursos ao criar a instância do recurso no roteamento ou no controlador:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/users', function () {
        return UserResource::collection(User::all());
    });
```

 Observe que isso não permite nenhuma adição de metadados personalizados que possam precisar ser retornados com sua coleção. Se você desejar customizar a resposta da coleção de recursos, poderá criar um recurso dedicado para representar a coleção:

```shell
php artisan make:resource UserCollection
```

 Depois que a classe de coleção de recursos tiver sido gerada, você poderá definir facilmente qualquer um dos metadados que devem ser incluídos na resposta.

```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Request;
    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * Transform the resource collection into an array.
         *
         * @return array<int|string, mixed>
         */
        public function toArray(Request $request): array
        {
            return [
                'data' => $this->collection,
                'links' => [
                    'self' => 'link-value',
                ],
            ];
        }
    }
```

 Depois de definir sua coleção de recursos, ela poderá ser retornada de uma rota ou controlador:

```php
    use App\Http\Resources\UserCollection;
    use App\Models\User;

    Route::get('/users', function () {
        return new UserCollection(User::all());
    });
```

<a name="preserving-collection-keys"></a>
#### Preservando as Chaves de Coleção

 Ao retornar uma coleção de recursos de um roteamento, o Laravel reinicia as chaves da coleção para que estejam em ordem numérica. No entanto, você pode adicionar uma propriedade `preserveKeys` à sua classe de recurso para indicar se as chaves originais de uma coleção devem ser preservadas:

```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\JsonResource;

    class UserResource extends JsonResource
    {
        /**
         * Indicates if the resource's collection keys should be preserved.
         *
         * @var bool
         */
        public $preserveKeys = true;
    }
```

 Quando a propriedade `preserveKeys` é definida como `true`, as chaves de uma coleção serão preservadas quando a coleção for retornada a partir de um roteamento ou controlador.

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/users', function () {
        return UserResource::collection(User::all()->keyBy->id);
    });
```

<a name="customizing-the-underlying-resource-class"></a>
#### Personalizar a classe de recursos subjacente

 Normalmente, a propriedade `$this->collection` de uma coleção de recursos é preenchida automaticamente com o resultado da correspondência de cada item da coleção à sua classe de recurso singular. Supõe-se que a classe de recurso singular tenha o nome da classe sem a parte final `Collection`. Além disso, dependendo das suas preferências pessoais, pode ou não ser adicionado um sufixo de `Resource` à classe de recurso singular.

 Por exemplo, `UserCollection` tentará mapear as instâncias de usuário fornecidas para o recurso `UserResource`. Para personalizar este comportamento, você pode override a propriedade `$collects` da sua coleção de recursos:

```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * The resource that this resource collects.
         *
         * @var string
         */
        public $collects = Member::class;
    }
```

<a name="writing-resources"></a>
## Recursos de escrita

 > [!NOTA]
 Na seção [Visão geral do conceito](concept-overview), recomendamos vivamente que o faça antes de prosseguir com a documentação.

 Os recursos só precisam de converter um modelo específico em uma matriz. Portanto, cada recurso contém um método `toArray` que converte os atributos do seu modelo para uma matriz amigável com a API, podendo ser retornada dos roteadores ou controladores da sua aplicação:

```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Request;
    use Illuminate\Http\Resources\Json\JsonResource;

    class UserResource extends JsonResource
    {
        /**
         * Transform the resource into an array.
         *
         * @return array<string, mixed>
         */
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
                'name' => $this->name,
                'email' => $this->email,
                'created_at' => $this->created_at,
                'updated_at' => $this->updated_at,
            ];
        }
    }
```

 Após uma fonte ter sido definida, pode ser retornada diretamente de um roteamento ou controlador:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user/{id}', function (string $id) {
        return new UserResource(User::findOrFail($id));
    });
```

<a name="relationships"></a>
#### Relações

 Se você deseja incluir recursos relacionados em sua resposta, poderá adicioná-los à matriz retornada pelo método `toArray` do recurso. Nesse exemplo, usaremos o método `collection` do recurso `PostResource` para adicionar os posts de blog do usuário na resposta do recurso:

```php
    use App\Http\Resources\PostResource;
    use Illuminate\Http\Request;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'posts' => PostResource::collection($this->posts),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
```

 > [!AVISO]
 [relações condicionais (#conditional_relationships).

<a name="writing-resource-collections"></a>
#### Coleções de recursos

 Embora os recursos transformem um único modelo em uma matriz, as coleções de recursos transformam uma matriz de modelos em uma matriz. Não é obrigatório definir uma classe de coleção de recursos para cada modelo, pois todos os recursos oferecem um método `collection` (coletânea) para gerar, "ad-hoc" (sobre a demanda), uma coleção de recursos no momento em que for necessário:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/users', function () {
        return UserResource::collection(User::all());
    });
```

 No entanto, se for necessário personalizar os metadados retornados com a coleção, é preciso definir sua própria coleção de recursos:

```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Request;
    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * Transform the resource collection into an array.
         *
         * @return array<string, mixed>
         */
        public function toArray(Request $request): array
        {
            return [
                'data' => $this->collection,
                'links' => [
                    'self' => 'link-value',
                ],
            ];
        }
    }
```

 Assim como os recursos singulares, as coleções de recursos podem ser retornadas diretamente a partir das rotas ou controladores:

```php
    use App\Http\Resources\UserCollection;
    use App\Models\User;

    Route::get('/users', function () {
        return new UserCollection(User::all());
    });
```

<a name="data-wrapping"></a>
### Embrulhar os dados

 Por padrão, o recurso mais externo é envolvido na chave `data` quando a resposta de um recurso é convertida para JSON. Assim, por exemplo, uma resposta típica da coleção de recursos será do tipo seguinte:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ]
}
```

 Se você deseja desativar a embelezamento do recurso mais externo, deverá invocar o método `withoutWrapping` na base da classe `Illuminate\Http\Resources\Json\JsonResource`. Normalmente, esse método é chamado do seu `AppServiceProvider` ou outro [fornecedor de serviços] (/docs/{{version}}/providers) que é carregado em todas as solicitações para sua aplicação:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Http\Resources\Json\JsonResource;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Register any application services.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            JsonResource::withoutWrapping();
        }
    }
```

 > [!ATENÇÃO]
 > O método `withoutWrapping` afeta somente a resposta mais externa e não removerá as chaves `data` que você adicionar manualmente às suas próprias coleções de recursos.

<a name="wrapping-nested-resources"></a>
#### Embrulhar recursos aninhados

 Você tem total liberdade para determinar como as relações dos seus recursos serão envolvidas. Se você quiser que todas as coleções de recursos sejam envolvidas por uma chave "data", independentemente do nível de seu nível de aninhamento, é recomendável definir uma classe de coleção de recursos para cada recurso e retornar a coleção dentro da chave "data".

 Você pode estar se perguntando se isso fará com que o seu recurso mais externo seja envolvido em duas chaves `data`. Não se preocupe, o Laravel nunca deixará seus recursos serem acidentalmente envoltos duas vezes, então você não precisa estar preocupado com o nível de aninhamento da coleção de recursos que está sendo transformada:

```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class CommentsCollection extends ResourceCollection
    {
        /**
         * Transform the resource collection into an array.
         *
         * @return array<string, mixed>
         */
        public function toArray(Request $request): array
        {
            return ['data' => $this->collection];
        }
    }
```

<a name="data-wrapping-and-pagination"></a>
#### Embrulho e Paginadoria de Dados

 Ao retornar coleções em páginas por meio de uma resposta de recurso, o Laravel envolverá seus dados de recurso com a chave `data`, mesmo se o método `withoutWrapping` tiver sido chamado. Isso ocorre porque as respostas paginadas sempre contêm as chaves `meta` e `links` com informações sobre o estado do paginador:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="pagination"></a>
### Paginador

 Você pode passar uma instância de paginador da Laravel para o método `collection` do recurso ou para um recurso personalizado:

```php
    use App\Http\Resources\UserCollection;
    use App\Models\User;

    Route::get('/users', function () {
        return new UserCollection(User::paginate());
    });
```

 As respostas com páginas sempre incluem as chaves `meta` e `links` que fornecem informações sobre o estado do paginador.

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="customizing-the-pagination-information"></a>
#### Personalização das informações de página por página

 Se você deseja personalizar as informações incluídas nas chaves `links` ou `meta` da resposta de paginação, é possível definir um método `paginationInformation` no recurso. Este método receberá os dados `$paginated` e a matriz de informações `$default`, que contém uma chave array com as chaves `links` e `meta`:

```php
    /**
     * Customize the pagination information for the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array $paginated
     * @param  array $default
     * @return array
     */
    public function paginationInformation($request, $paginated, $default)
    {
        $default['links']['custom'] = 'https://example.com';

        return $default;
    }
```

<a name="conditional-attributes"></a>
### Atributos condicionais

 Às vezes, você pode querer incluir um atributo em uma resposta somente se uma determinada condição for satisfeita. Por exemplo, talvez você queira incluir um valor apenas quando o usuário atual for "administrador". O Laravel fornece vários métodos de auxílio para auxiliar nessas situações. O método `when` pode ser utilizado para adicionar um atributo condicionalmente a uma resposta do recurso:

```php
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'secret' => $this->when($request->user()->isAdmin(), 'secret-value'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
```

 Neste exemplo, a chave `secret` só será incluída na resposta final do recurso se o método `isAdmin` do usuário autenticado retornar `true`. Se o método retornar `false`, a chave `secret` será removida da resposta do recurso antes de enviada ao cliente. O método `when` permite definir seus recursos sem a necessidade de utilizar declarações condicionais ao construir o array.

 O método `when` aceita um fecho de função como segundo argumento, permitindo-lhe calcular o valor resultante apenas se a condição for verdadeira:

```php
    'secret' => $this->when($request->user()->isAdmin(), function () {
        return 'secret-value';
    }),
```

 O método `whenHas` pode ser utilizado para incluir um atributo se este estiver realmente presente no modelo subjacente.

```php
    'name' => $this->whenHas('name'),
```

 Além disso, o método `whenNotNull` pode ser utilizado para incluir um atributo no corpo da resposta se esse atributo não for nulo:

```php
    'name' => $this->whenNotNull($this->name),
```

<a name="merging-conditional-attributes"></a>
#### Fusão de atributos condicionais

 Às vezes, você pode ter vários atributos que devem ser incluídos na resposta de recursos apenas com base na mesma condição. Nesse caso, você pode usar o método `mergeWhen` para incluir os atributos na resposta somente quando a condição for verdadeira:

```php
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            $this->mergeWhen($request->user()->isAdmin(), [
                'first-secret' => 'value',
                'second-secret' => 'value',
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
```

 Mais uma vez, se a condição for falsa, esses atributos serão removidos da resposta do recurso antes de ela ser enviada ao cliente.

 > Atenção !
 > O método mergeWhen não pode ser utilizado em arrays que misturam chaves numéricas e alfanuméricas. Além disso, não pode ser usado em arrays com chaves numéricas que não são ordenadas sequencialmente.

<a name="conditional-relationships"></a>
### Relações Condicionais

 Além de atribuir condicionalmente atributos, é possível incluir relacionamentos, com base na carga inicial do relacionamento no modelo. Isso permite que o controle decida quais os relacionamentos a serem carregados no modelo e seu recurso pode incluí-los facilmente apenas quando já tiver sido carregado. Isso permite evitar problemas de consulta "N+1" em seus recursos.

 O método `whenLoaded` pode ser usado para carregar condicionalmente uma relação. Para evitar o carregamento desnecessário de relações, esse método aceita o nome da relação em vez da própria relação:

```php
    use App\Http\Resources\PostResource;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'posts' => PostResource::collection($this->whenLoaded('posts')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
```

 Neste exemplo, se a relação não tiver sido carregada, a chave `posts` será removida da resposta de recurso antes dela ser enviada ao cliente.

<a name="conditional-relationship-counts"></a>
#### Recursos condicionais importam

 Além de incluir condicionalmente relações, você pode incluir condicionalmente "contagens" de relacionamentos em suas respostas de recurso com base no fato da contagem da relação ter sido carregada no modelo.

```php
    new UserResource($user->loadCount('posts'));
```

 O método `whenCounted` pode ser utilizado para incluir, condicionalmente, o número de relações no seu conteúdo da resposta ao cliente. Este método evita a inclusão desnecessária do atributo se o número de relações não estiver presente:

```php
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'posts_count' => $this->whenCounted('posts'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
```

 Neste exemplo, se a contagem da relação `posts` não tiver sido carregada, a chave `posts_count` será removida da resposta de recurso antes que esteja enviada ao cliente.

 Outros tipos de agregados, como `avg`, `sum`, `min` e `max`, também podem ser carregados condicionalmente usando o método `whenAggregated`:

```php
'words_avg' => $this->whenAggregated('posts', 'words', 'avg'),
'words_sum' => $this->whenAggregated('posts', 'words', 'sum'),
'words_min' => $this->whenAggregated('posts', 'words', 'min'),
'words_max' => $this->whenAggregated('posts', 'words', 'max'),
```

<a name="conditional-pivot-information"></a>
#### Informação sobre os pivots condicionais

 Além de incluir informações sobre relacionamentos de forma condicional em suas respostas aos recursos, você pode incluir dados das tabelas intermediárias de relações muitodirecionais usando o método `whenPivotLoaded`. O método `whenPivotLoaded` aceita como primeiro argumento o nome da tabela pivot. O segundo argumento deve ser um fecho que retorna o valor a ser retornado se as informações de pivot estiverem disponíveis no modelo:

```php
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'expires_at' => $this->whenPivotLoaded('role_user', function () {
                return $this->pivot->expires_at;
            }),
        ];
    }
```

 Se o seu relacionamento estiver usando um [modelo de tabela intermediária personalizada](/docs/{{version}}/eloquent-relationships#defining-custom-intermediate-table-models), você pode passar uma instância do modelo de tabela intermediária como o primeiro argumento para o método `whenPivotLoaded`:

```php
    'expires_at' => $this->whenPivotLoaded(new Membership, function () {
        return $this->pivot->expires_at;
    }),
```

 Se a tabela intermediária estiver usando um atributo diferente de `pivot`, você pode usar o método `whenPivotLoadedAs`:

```php
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'expires_at' => $this->whenPivotLoadedAs('subscription', 'role_user', function () {
                return $this->subscription->expires_at;
            }),
        ];
    }
```

<a name="adding-meta-data"></a>
### Adição de meta dados

 Algumas normas da API JSON exigem a adição de metadados para os seus recursos e respostas das coleções de recursos. Isso geralmente inclui informações, como links para o próprio recurso ou recursos relacionados ou informações meta sobre o recurso em si. Se você precisar retornar metadados adicionais sobre um recurso, inclua-os no seu método `toArray`. Por exemplo:

```java
public static List<String> toArray(String json) {
  return Arrays.asList("id", "name", "links");
}
```

```php
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
```

 Quando devolver dados adicionais de metadados dos seus recursos, você nunca tem que se preocupar em sobrescrever acidentalmente as chaves `links` ou `meta` que são automaticamente adicionadas pelo Laravel ao devolver respostas paginadas. Quaisquer links adicionais que você definir serão mesclados aos links fornecidos pela ferramenta para paginação.

<a name="top-level-meta-data"></a>
#### Meta Dados Principais

 Às vezes você pode querer incluir somente determinados metadados com uma resposta de recurso se o recurso for o recurso mais externo que está sendo retornado. Normalmente, isso inclui informações metadados sobre a resposta como um todo. Para definir esses metadados, adicione um método `with` ao seu modelo de classe do recurso. Esse método deve retornar uma matriz de metadados que será incluída com a resposta do recurso somente quando o recurso for o mais externo que está sendo transformado:

```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * Transform the resource collection into an array.
         *
         * @return array<string, mixed>
         */
        public function toArray(Request $request): array
        {
            return parent::toArray($request);
        }

        /**
         * Get additional data that should be returned with the resource array.
         *
         * @return array<string, mixed>
         */
        public function with(Request $request): array
        {
            return [
                'meta' => [
                    'key' => 'value',
                ],
            ];
        }
    }
```

<a name="adding-meta-data-when-constructing-resources"></a>
#### Adicionando metadados ao criar recursos

 Você também pode adicionar dados de nível superior ao construir instâncias de recursos em sua rota ou controller. O método `additional`, que está disponível para todos os recursos, aceita um array com dados que devem ser adicionados à resposta do recurso:

```php
    return (new UserCollection(User::all()->load('roles')))
                    ->additional(['meta' => [
                        'key' => 'value',
                    ]]);
```

<a name="resource-responses"></a>
## Respostas aos Recursos

 Como você já leu, os recursos podem ser devolvidos diretamente das rotas e controladores:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user/{id}', function (string $id) {
        return new UserResource(User::findOrFail($id));
    });
```

 No entanto, por vezes poderá ser necessário personalizar a resposta HTTP em saída antes de ser enviada ao cliente. Há duas maneiras para o efeito. Primeiro, pode adicionar a metoda `response` à recurso. Esta metodaindica uma instância da classe `Illuminate\Http\JsonResponse`, conferindo-lhe controlo total sobre as cabeçalhas da resposta:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user', function () {
        return (new UserResource(User::find(1)))
                    ->response()
                    ->header('X-Value', 'True');
    });
```

 Alternativamente, é possível definir um método `comResposta` dentro do próprio recurso. Esse método será chamado quando o recurso for devolvido como recurso mais externo em uma resposta:

```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\JsonResponse;
    use Illuminate\Http\Request;
    use Illuminate\Http\Resources\Json\JsonResource;

    class UserResource extends JsonResource
    {
        /**
         * Transform the resource into an array.
         *
         * @return array<string, mixed>
         */
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
            ];
        }

        /**
         * Customize the outgoing response for the resource.
         */
        public function withResponse(Request $request, JsonResponse $response): void
        {
            $response->header('X-Value', 'True');
        }
    }
```
