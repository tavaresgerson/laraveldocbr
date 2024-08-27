# eloquent: recursos da API

<a name="introduction"></a>
## Introdução

Ao construir uma API, você pode precisar de uma camada de transformação que esteja entre seus modelos Eloquent e as respostas JSON que são realmente retornadas aos usuários do seu aplicativo. Por exemplo, você pode querer exibir determinados atributos para um subconjunto de usuários e não outros, ou você pode querer sempre incluir determinadas relações na representação JSON de seus modelos. As classes de recursos do Eloquent permitem transformar expressivamente e facilmente seus modelos e coleções de modelos em JSON.

É claro, você pode sempre converter modelos Eloquent ou coleções em JSON usando seus métodos 'toJson'; no entanto, os recursos Eloquent fornecem controle mais refinado e robusto sobre a serialização JSON de seus modelos e suas relações.

<a name="generating-resources"></a>
## Gerando Recursos

Para gerar uma classe de recurso, você pode usar o comando 'make:resource' do Artisan. Por padrão, os recursos serão colocados no diretório 'app/Http/Resources' da sua aplicação. Os recursos estendem a classe 'Illuminate\Http\Resources\Json\JsonResource':

```shell
php artisan make:resource UserResource
```

<a name="generating-resource-collections"></a>
#### Coletâneas de Recursos

Além de gerar recursos que transformam modelos individuais, você pode gerar recursos responsáveis por transformar coleções de modelos. Isso permite que suas respostas JSON incluam links e outra informação meta relevante para uma coleção inteira de um determinado recurso.

Para criar um recurso de coleção, você deve usar o sinalizador `--collection` ao criar o recurso. Ou incluindo a palavra "Collection" no nome do recurso indicará para Laravel que ele deverá criar um recurso de coleção. Os recursos de coleção estendem a classe `Illuminate\Http\Resources\Json\ResourceCollection`:

```shell
php artisan make:resource User --collection

php artisan make:resource UserCollection
```

<a name="concept-overview"></a>
## Visão Geral do Conceito

> Nota:
> Esta é uma visão geral de alto nível dos recursos e coleções de recursos. Você é fortemente incentivado a ler as outras seções desta documentação para obter um entendimento mais profundo da personalização e do poder oferecido a você pelos recursos.

Antes de mergulhar nas opções disponíveis para você ao escrever recursos, vamos dar uma olhada de alto nível sobre como os recursos são usados dentro do Laravel. Uma classe de recurso representa um único modelo que precisa ser transformado em uma estrutura JSON. Por exemplo, aqui está uma simples classe de `UserResource`:

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

Cada classe de recurso define um método `toArray` que retorna o array de atributos que devem ser convertidos em JSON quando o recurso é retornado como uma resposta de uma rota ou método de controlador.

Observe que podemos acessar propriedades do modelo diretamente da variável `$this`. Isso se deve porque uma classe de recurso irá automaticamente encaminhar o acesso à propriedade e ao método para o modelo subjacente, tornando-o conveniente. Uma vez definido o recurso, ele pode ser retornado de um roteamento ou controlador. O recurso aceita a instância do modelo subjacente via seu construtor:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user/{id}', function (string $id) {
        return new UserResource(User::findOrFail($id));
    });
```

<a name="resource-collections"></a>
### Coletas de Recursos

Se você está retornando uma coleção de recursos ou uma resposta paginada, você deve usar o método 'collection' fornecido pela sua classe de recurso ao criar a instância do recurso em sua rota ou controlador.

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/users', function () {
        return UserResource::collection(User::all());
    });
```

Note que isso não permite qualquer adição de metadados personalizados que possam ser necessários para serem retornados com sua coleção. Se você gostaria de personalizar a resposta da coleção de recursos, você pode criar um recurso dedicado para representar a coleção:

```shell
php artisan make:resource UserCollection
```

Uma vez que a classe de coleta de recursos tenha sido gerada, você pode facilmente definir quaisquer metadados que devem ser incluídos na resposta:

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

Depois de definir sua coleção de recursos, ele pode ser retornado a partir de uma rota ou controlador:

```php
    use App\Http\Resources\UserCollection;
    use App\Models\User;

    Route::get('/users', function () {
        return new UserCollection(User::all());
    });
```

<a name="preserving-collection-keys"></a>
#### Preservando as chaves da coleção

Ao retornar uma coleção de recursos de uma rota, o Laravel redefine as chaves da coleção para que estejam em ordem numérica. No entanto, você pode adicionar uma propriedade preserveKeys na classe do recurso indicando se as chaves originais de uma coleção devem ser preservadas ou não.

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

Quando a propriedade `preserveKeys` é definida como "true", as chaves da coleção serão preservadas quando a coleção for retornada de um roteamento ou controlador:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/users', function () {
        return UserResource::collection(User::all()->keyBy->id);
    });
```

<a name="customizing-the-underlying-resource-class"></a>
#### Personalizando a Classe de Recurso Subjacente

Tipicamente, a propriedade "$this->collection" de uma coleção de recursos é preenchida automaticamente com o resultado da mapeamento cada item da coleção para sua classe de recurso singular. A classe de recurso singular pressupõe ser o nome da classe da coleção sem a parte final "Collection" do nome da classe. Além disso, dependendo de suas preferências pessoais, a classe de recurso singular pode ou não ser precedida pelo sufixo "Resource".

Por exemplo, "UserCollection" tentará mapear as instâncias do usuário fornecidas no recurso "UserResource". Para personalizar esse comportamento, você pode substituir a propriedade "$collects" da sua coleção de recursos.

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
## Recursos de Escrita

> Nota:
> Se você não leu a [ visão geral de conceitos](# visão-geral-de-conceitos), é fortemente encorajado a fazê-lo antes de prosseguir com esta documentação.

Recursos apenas precisam transformar um modelo dado em uma matriz. Então cada recurso contém um método toArray que traduz atributos do seu modelo em uma matriz amigável para API que pode ser retornada de suas rotas ou controladores de aplicação:

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

Uma vez que um recurso tenha sido definido, ele pode ser retornado diretamente de uma rota ou controlador:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user/{id}', function (string $id) {
        return new UserResource(User::findOrFail($id));
    });
```

<a name="relationships"></a>
#### Relacionamento

Se você quiser incluir recursos relacionados em sua resposta, você pode adicioná-los ao array retornado pelo método 'toArray' do recurso. Neste exemplo, usaremos o método 'collection' do recurso 'PostResource' para adicionar as postagens do blog do usuário à resposta do recurso:

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

> [NOTA]
> Se quiser incluir relações apenas quando já tiverem sido carregadas, veja a documentação em [Relações Condicionais](# condicional-relações).

<a name="writing-resource-collections"></a>
#### Coleções de Recursos

Enquanto os recursos transformam um modelo único em uma matriz, as coleções de recursos transformam uma coleção de modelos em uma matriz. No entanto, não é absolutamente necessário definir uma classe de coleção de recursos para cada um dos seus modelos, já que todos os recursos fornecem um método `collection` para gerar uma coleção "ad-hoc" de recursos:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/users', function () {
        return UserResource::collection(User::all());
    });
```

Porém, se você precisa de personalizar o metadados retornado com a coleção, é necessário definir sua própria coleção de recursos:

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

Assim como os recursos únicos, as coleções de recursos podem ser retornadas diretamente das rotas ou controladores:

```php
    use App\Http\Resources\UserCollection;
    use App\Models\User;

    Route::get('/users', function () {
        return new UserCollection(User::all());
    });
```

<a name="data-wrapping"></a>
### Encapsulamento de Dados

Por padrão, seu recurso externo é envolvido em uma chave "data" quando a resposta do recurso é convertida para JSON. Então, por exemplo, uma resposta típica de coleção de recursos parece ser assim:

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

Se você deseja desativar o wrapper do recurso mais externo, você deve invocar o método `withoutWrapping` na classe base `Illuminate\Http\Resources\Json\JsonResource`. Normalmente, você deverá chamar esse método do seu `AppServiceProvider` ou outro provedor de serviço que é carregado em cada solicitação para sua aplicação:

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

> [AVERTENÇÃO!]
> O método 'withoutWrapping' só afeta a resposta externa e não removerá as chaves de 'dados' que você adiciona manualmente às suas próprias coleções de recursos.

<a name="wrapping-nested-resources"></a>
#### Enrolar Recursos Aninhados

Você tem total liberdade para determinar como as relações de seus recursos são empacotadas. Se você gostaria que todas as coleções de recursos fossem empacotadas em uma chave "dados", independentemente do seu nível de aninhamento, você deve definir uma classe de coleção de recursos para cada recurso e retornar a coleção dentro de uma chave "dados".

Você pode estar se perguntando se isso fará com que o seu recurso externo seja envolvido em duas chaves de dados. Não se preocupe, Laravel nunca deixará seus recursos serem acidentalmente dobrados, por isso você não precisa se preocupar com o nível de aninhamento da coleção de recursos que você está transformando:

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
#### Dados de Paginação e Envolvimento

Ao retornar coleções paginadas através de uma resposta de recurso, o Laravel envolverá os dados do recurso em uma chave "data", mesmo que a chamada do método "withoutWrapping" tenha sido feita. Isso se deve ao fato de que as respostas paginadas sempre contêm as chaves "meta" e "links" com informações sobre o estado do paginador:

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
### Paginação

Você pode passar uma instância de paginação do Laravel para o método 'coleção' de um recurso ou para uma coleção personalizada de recursos:

```php
    use App\Http\Resources\UserCollection;
    use App\Models\User;

    Route::get('/users', function () {
        return new UserCollection(User::paginate());
    });
```

Respostas paginadas sempre incluem as chaves "meta" e "links" com informações sobre o estado do paginador:

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
#### Personalizando as informações de paginação

Se quiser personalizar as informações contidas na chave 'links' ou 'meta' da resposta de paginação, você pode definir um método chamado 'paginationInformation' no recurso. Este método receberá os dados 'paginados' e uma matriz de 'informação padrão', que é uma matriz contendo as chaves 'links' e 'meta':

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
### Atributos Condicionais

Às vezes você pode desejar incluir apenas um atributo em uma resposta de recurso se uma determinada condição for atendida. Por exemplo, talvez você queira incluir apenas um valor se o usuário atual for um "administrador". Laravel fornece vários métodos auxiliares para ajudá-lo nessa situação. O método `when` pode ser usado para adicionar condicionalmente um atributo a uma resposta de recurso:

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

Neste exemplo, a chave 'secret' será retornada somente na resposta final do recurso se o método 'isAdmin' do usuário autenticado retornar 'true'. Se o método retornar 'false', a chave 'secret' será removida da resposta do recurso antes de ser enviada ao cliente. O método 'when' permite você definir expressivamente seus recursos sem recorrer a declarações condicionais quando estiver construindo um array.

O método 'quando' também aceita uma função como segundo argumento, permitindo que o valor resultante seja calculado somente se a condição dada for verdadeira:

```php
    'secret' => $this->when($request->user()->isAdmin(), function () {
        return 'secret-value';
    }),
```

O método `whenHas` pode ser usado para incluir um atributo se ele estiver realmente presente no modelo subjacente:

```php
    'name' => $this->whenHas('name'),
```

Além disso, o método `whenNotNull` pode ser usado para incluir um atributo na resposta do recurso se o atributo não for nulo:

```php
    'name' => $this->whenNotNull($this->name),
```

<a name="merging-conditional-attributes"></a>
#### Atributos Condicionais

Às vezes você pode ter vários atributos que devem ser incluídos na resposta de recurso com base na mesma condição. Neste caso, você pode usar o método `mergeWhen` para incluir os atributos na resposta apenas quando a condição dada é `verdadeira`:

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

Novamente, se a condição dada for falsa, esses atributos serão removidos da resposta do recurso antes de ser enviado ao cliente.

> [¡ALERTA!]
> O método `mergeWhen` não deve ser utilizado dentro de arrays que misturam chaves numéricas e de string. Além disso, ele não deve ser utilizado dentro de arrays com chaves numéricas desordenadas sequencialmente.

<a name="conditional-relationships"></a>
### Relações Condicionais

Além de carregar atributos condicionalmente, você pode incluir relacionamentos nas respostas do recurso com base em se o relacionamento já foi carregado no modelo. Isso permite que seu controlador decida quais relacionamentos devem ser carregados no modelo e seus recursos podem facilmente incluí-los apenas quando eles têm sido realmente carregados. Finalmente, isso facilita evitar problemas de "N+1" dentro de suas respostas de recursos.

O método "whenLoaded" pode ser usado para carregar condicionalmente um relacionamento. Para evitar o carregamento desnecessário de relacionamentos, este método aceita o nome do relacionamento em vez do próprio relacionamento:

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

Neste exemplo, se a relação não estiver carregada, a chave posts será removida da resposta do recurso antes de ser enviada ao cliente.

<a name="conditional-relationship-counts"></a>
#### Condicional de Relação Contagem

Além de incluir condicionalmente relações, você pode incluir condicionalmente contagem de relações em suas respostas de recursos com base se a contagem da relação foi carregada no modelo.

```php
    new UserResource($user->loadCount('posts'));
```

A `method whenCounted` pode ser usado para incluir condicionalmente o número de relações em sua resposta de recurso. Este método evita incluir desnecessariamente o atributo se a contagem das relações não estiver presente:

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

No exemplo acima se o contador de 'postagens' não foi carregado, a chave 'postagens_contador' será removida da resposta do recurso antes de ser enviada ao cliente.

Outros tipos de agregações, tais como `avg`, `sum`, `min` e `max` também podem ser carregados condicionalmente usando o método `whenAggregated`:

```php
'words_avg' => $this->whenAggregated('posts', 'words', 'avg'),
'words_sum' => $this->whenAggregated('posts', 'words', 'sum'),
'words_min' => $this->whenAggregated('posts', 'words', 'min'),
'words_max' => $this->whenAggregated('posts', 'words', 'max'),
```

<a name="conditional-pivot-information"></a>
#### Condicional Pivotação de informação

Além de incluir condicionalmente informações de relacionamento em suas respostas de recursos, você pode condicionalmente incluir dados das tabelas intermediárias de relacionamentos muitos-para-muitos usando o método `whenPivotLoaded`. O método `whenPivotLoaded` aceita o nome da tabela pivot como seu primeiro argumento. O segundo argumento deve ser uma função que retorna o valor a ser retornado se as informações do pivot estiverem disponíveis no modelo:

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

Se o seu relacionamento estiver usando um [modelo de tabela intermediária personalizado](/docs/{{version}}/eloquent-relationships#definindo-modelos-de-tabela-intermediária-personalizados)), você pode passar uma instância do modelo da tabela intermediária como o primeiro argumento para o método `whenPivotLoaded`:

```php
    'expires_at' => $this->whenPivotLoaded(new Membership, function () {
        return $this->pivot->expires_at;
    }),
```

Se sua tabela intermediária está usando um acessor diferente de "pivot", você pode usar o método `whenPivotLoadedAs`:

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
### Adicionando metadados

Alguns padrões de API JSON exigem a adição de metadados à sua resposta de recursos e coleções de recursos. Isso geralmente inclui coisas como "links" para o recurso ou recursos relacionados, ou metadados sobre o próprio recurso. Se você precisa retornar metadados adicionais sobre um recurso, inclua-o em seu método 'toArray'. Por exemplo, você pode incluir informações "link" ao transformar uma coleção de recursos:

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

Ao retornar metadados adicionais de seus recursos, você nunca precisa se preocupar com a substituição acidental das chaves 'links' ou 'meta' que são automaticamente adicionadas pelo Laravel quando retorna respostas paginadas. Qualquer link adicional que você definir será mesclado aos links fornecidos pelo paginador.

<a name="top-level-meta-data"></a>
#### Top Level Meta Dados

Às vezes, você pode querer apenas incluir determinados metadados com uma resposta de recurso se o recurso for o recurso externo que está sendo retornado. Geralmente, isso inclui metadados sobre a resposta como um todo. Para definir esses metadados, adicione um método "with" à sua classe de recursos. Este método deve retornar uma matriz de metadados a serem incluídos com a resposta do recurso apenas quando o recurso for o recurso externo que está sendo transformado:

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
#### Adicionando metadados na construção de recursos

Você também pode adicionar dados de nível superior ao construir instâncias de recurso em sua rota ou controlador. O método `additional`, disponível em todos os recursos, aceita uma matriz de dados que devem ser adicionados à resposta do recurso:

```php
    return (new UserCollection(User::all()->load('roles')))
                    ->additional(['meta' => [
                        'key' => 'value',
                    ]]);
```

<a name="resource-responses"></a>
## Respostas de Recursos

Como você já leu, os recursos podem ser retornados diretamente de rotas e controladores:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user/{id}', function (string $id) {
        return new UserResource(User::findOrFail($id));
    });
```

No entanto, às vezes você pode precisar personalizar a resposta HTTP antes de ser enviada ao cliente. Existem duas maneiras de realizar isso. Primeiro, você pode encadear o método "response" no recurso. Este método retornará uma instância de "Illuminate\Http\JsonResponse", dando-lhe controle total sobre os cabeçalhos da resposta:

```php
    use App\Http\Resources\UserResource;
    use App\Models\User;

    Route::get('/user', function () {
        return (new UserResource(User::find(1)))
                    ->response()
                    ->header('X-Value', 'True');
    });
```

Alternativamente, você pode definir um método `withResponse` dentro do próprio recurso. Este método será chamado quando o recurso for retornado como o recurso externo em uma resposta:

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
