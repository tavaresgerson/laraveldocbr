# Elegantes: Fábricas

<a name="introduction"></a>
## Introdução

Ao testar sua aplicação ou ao plantar seu banco de dados, você pode precisar inserir alguns registros em seu banco de dados. Em vez de especificar manualmente o valor de cada coluna, Laravel permite definir um conjunto de atributos padrão para cada um de seus [modelos Eloquent](/docs/{{version}}/eloquent) usando fábricas de modelos.

Para ver um exemplo de como escrever uma fábrica, veja o arquivo `database/factories/UserFactory.php` na sua aplicação. Esta fábrica vem com todos os novos aplicativos Laravel e contém a seguinte definição da fábrica:

```php
    namespace Database\Factories;

    use Illuminate\Database\Eloquent\Factories\Factory;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Support\Str;

    /**
     * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
     */
    class UserFactory extends Factory
    {
        /**
         * The current password being used by the factory.
         */
        protected static ?string $password;

        /**
         * Define the model's default state.
         *
         * @return array<string, mixed>
         */
        public function definition(): array
        {
            return [
                'name' => fake()->name(),
                'email' => fake()->unique()->safeEmail(),
                'email_verified_at' => now(),
                'password' => static::$password ??= Hash::make('password'),
                'remember_token' => Str::random(10),
            ];
        }

        /**
         * Indicate that the model's email address should be unverified.
         */
        public function unverified(): static
        {
            return $this->state(fn (array $attributes) => [
                'email_verified_at' => null,
            ]);
        }
    }
```

Como você pode ver, na sua forma mais básica, as fábricas são classes que estendem a classe de fábrica base do Laravel e definem um método "definição". O método "definição" retorna o conjunto padrão de valores de atributo que devem ser aplicados quando criar um modelo usando a fábrica.

Através do "fake" helper, as fábricas têm acesso à [Faker](https://github.com/FakerPHP/Faker) biblioteca em PHP, que permite gerar dados aleatórios de forma conveniente para testes e inicialização de bancos de dados.

> Nota:
> Você pode alterar o idioma do seu aplicativo Faker atualizando a opção `faker_locale` no arquivo de configuração `config/app.php`.

<a name="defining-model-factories"></a>
## Definindo fábricas de modelos

<a name="generating-factories"></a>
### Gerando Fábricas

Para criar uma fábrica, execute o comando 'make:factory' [Comando Artisan] (http://docs.laravel.com/docs/master/artisan#commands-and-tasks):

```shell
php artisan make:factory PostFactory
```

A nova classe de fábrica será colocada em seu diretório de banco de dados "database/factories".

<a name="factory-and-model-discovery-conventions"></a>
#### Convenções de Modelo e Fabricante

Depois de definir suas fábricas, você pode usar o método estático 'factory' fornecido por seus modelos pelo traço 'Illuminate\Database\Eloquent\Factories\HasFactory' para criar uma instância da fábrica desse modelo.

O método 'factory' da característica 'HasFactory' usará convenções para determinar a fábrica apropriada para o modelo ao qual ela é atribuída. Especificamente, o método procurará uma fábrica no namespace 'Database\Factories' que tenha um nome de classe correspondente ao nome do modelo e com um sufixo 'Factory'. Se essas convenções não se aplicarem à sua aplicação ou à sua fábrica específica, você pode substituir o método 'newFactory' no seu modelo para retornar uma instância da fábrica correspondente diretamente.

```php
    use Illuminate\Database\Eloquent\Factories\Factory;
    use Database\Factories\Administration\FlightFactory;

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): Factory
    {
        return FlightFactory::new();
    }
```

Então, defina uma propriedade 'model' na fábrica correspondente:

```php
    use App\Administration\Flight;
    use Illuminate\Database\Eloquent\Factories\Factory;

    class FlightFactory extends Factory
    {
        /**
         * The name of the factory's corresponding model.
         *
         * @var class-string<\Illuminate\Database\Eloquent\Model>
         */
        protected $model = Flight::class;
    }
```

<a name="factory-states"></a>
### Estados da Fábrica

Os métodos de manipulação de estado permitem que você defina modificações discretas que podem ser aplicadas às suas fábricas de modelo em qualquer combinação. Por exemplo, sua fábrica 'Database/Factories/UserFactory' pode conter um método 'suspenso' que modifica o valor padrão de um de seus atributos.

Métodos de transformação do estado normalmente chamam o método `state` fornecido pela classe de fábrica base do Laravel. O método `state` aceita um fechamento que receberá o array de atributos brutos definidos para a fábrica e deve retornar um array de atributos para modificar:

```php
    use Illuminate\Database\Eloquent\Factories\Factory;

    /**
     * Indicate that the user is suspended.
     */
    public function suspended(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'account_status' => 'suspended',
            ];
        });
    }
```

<a name="trashed-state"></a>
#### Estado "Trashed"

Se o seu Eloquent model pode ser [soft deleted](/docs/{{version}}/eloquent#soft-deleting), você pode invocar a built-in `trashed` state method para indicar que o modelo criado deveria já estar "soft deleted". Você não precisa definir manualmente o estado `trashed` pois ele está automaticamente disponível para todas as factories:

```php
    use App\Models\User;

    $user = User::factory()->trashed()->create();
```

<a name="factory-callbacks"></a>
### Recall de fábrica

Os callbacks da fábrica são registrados usando os métodos afterMaking e afterCreating e permitem que você execute tarefas adicionais após fazer ou criar um modelo. Você deve registrar esses callbacks definindo um método configure na classe da fábrica. Este método será automaticamente chamado pelo Laravel quando a fábrica for instanciada.

```php
    namespace Database\Factories;

    use App\Models\User;
    use Illuminate\Database\Eloquent\Factories\Factory;

    class UserFactory extends Factory
    {
        /**
         * Configure the model factory.
         */
        public function configure(): static
        {
            return $this->afterMaking(function (User $user) {
                // ...
            })->afterCreating(function (User $user) {
                // ...
            });
        }

        // ...
    }
```

Você também pode registrar retornos de fábrica dentro métodos de estado para realizar tarefas adicionais específicas para um determinado estado:

```php
    use App\Models\User;
    use Illuminate\Database\Eloquent\Factories\Factory;

    /**
     * Indicate that the user is suspended.
     */
    public function suspended(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'account_status' => 'suspended',
            ];
        })->afterMaking(function (User $user) {
            // ...
        })->afterCreating(function (User $user) {
            // ...
        });
    }
```

<a name="creating-models-using-factories"></a>
## Criando Modelos Usando Fábricas

<a name="instantiating-models"></a>
### Instantiando Modelos

Uma vez que você tenha definido suas fábricas, você pode usar o método estático `factory` fornecido aos seus modelos pelo trait `Illuminate\Database\Eloquent\Factories\HasFactory` a fim de instanciar uma instância da fábrica para esse modelo. Vamos dar um olhada em alguns exemplos de criação de modelos. Primeiro, vamos usar o método `make` para criar modelos sem persistir no banco:

```php
    use App\Models\User;

    $user = User::factory()->make();
```

Você pode criar uma coleção de vários modelos usando o método "count".

```php
    $users = User::factory()->count(3)->make();
```

<a name="applying-states"></a>
#### Aplicando Estados

Você também pode aplicar qualquer um dos seus [Estados](#estados-da-fábrica) nos modelos. Se você gostaria de aplicar múltiplas transformações do estado aos modelos, você simplesmente pode chamar os métodos de transformação do estado diretamente:

```php
    $users = User::factory()->count(5)->suspended()->make();
```

<a name="overriding-attributes"></a>
#### Atributos Sobrescritos

Se você gostaria de substituir alguns dos valores padrão do seu modelo, você pode passar um array de valores para o método 'make'. Somente os atributos especificados serão substituídos enquanto o restante dos atributos permanecerão com seus valores padrão como especificado pelo fábrido.

```php
    $user = User::factory()->make([
        'name' => 'Abigail Otwell',
    ]);
```

Alternativamente, o método 'state' pode ser chamado diretamente na instância da fábrica para realizar uma transformação de estado embutida:

```php
    $user = User::factory()->state([
        'name' => 'Abigail Otwell',
    ])->make();
```

> [NOTA]
> [Proteção de atribuição em massa](/docs/{{version}}/eloquent#mass-assignment) é automaticamente desativado ao criar modelos usando fábricas.

<a name="persisting-models"></a>
### Modelos persistentes

O método "create" instancia as instâncias do modelo e persiste-as no banco de dados usando o método "save" do Eloquent.

```php
    use App\Models\User;

    // Create a single App\Models\User instance...
    $user = User::factory()->create();

    // Create three App\Models\User instances...
    $users = User::factory()->count(3)->create();
```

Você pode sobrescrever os atributos padrão do modelo da fábrica passando uma matriz de atributos para o método create:

```php
    $user = User::factory()->create([
        'name' => 'Abigail',
    ]);
```

<a name="sequences"></a>
### Sequências

Às vezes você pode desejar alternar o valor de um atributo de modelo dado para cada modelo criado. Você pode alcançar isso definindo uma transformação de estado como uma sequência. Por exemplo, você pode querer alternar o valor de uma coluna "admin" entre 'Y' e 'N' por cada usuário criado:

```php
    use App\Models\User;
    use Illuminate\Database\Eloquent\Factories\Sequence;

    $users = User::factory()
                    ->count(10)
                    ->state(new Sequence(
                        ['admin' => 'Y'],
                        ['admin' => 'N'],
                    ))
                    ->create();
```

Neste exemplo, serão criados 5 usuários com um valor de `admin` igual a 'Y' e 5 usuários com um valor de `admin` igual a 'N'.

Se necessário, você pode incluir um fechamento como o valor da sequência. O fechamento será invocado sempre que a sequência precisar de um novo valor:

```php
    use Illuminate\Database\Eloquent\Factories\Sequence;

    $users = User::factory()
                    ->count(10)
                    ->state(new Sequence(
                        fn (Sequence $sequence) => ['role' => UserRoles::all()->random()],
                    ))
                    ->create();
```

Dentro de uma sequência de fechamento, você pode acessar as propriedades `$index` ou `$count` na instância da sequência injetada no fechamento. A propriedade `$index` contém o número de iterações pela sequência que ocorreram até agora, enquanto a propriedade `$count` contém o número total de vezes que a sequência será invocada:

```php
    $users = User::factory()
                    ->count(10)
                    ->sequence(fn (Sequence $sequence) => ['name' => 'Name '.$sequence->index])
                    ->create();
```

Para maior comodidade, sequências também podem ser aplicadas usando o método `sequence`, que simplesmente invoca o método interno `state`. O método `sequence` aceita um closure ou uma matriz de atributos sequenciais.

```php
    $users = User::factory()
                    ->count(2)
                    ->sequence(
                        ['name' => 'First User'],
                        ['name' => 'Second User'],
                    )
                    ->create();
```

<a name="factory-relationships"></a>
## Relações de fábrica

<a name="has-many-relationships"></a>
### Tem Muita Relação

Em seguida vamos explorar o modo de fazer relações em Eloquent usando os métodos da fábrica do Laravel. Primeiro, vamos supor que nosso aplicativo tem um modelo App\Models\User e outro modelo chamado App\Models\Post. Além disso vamos supor que o modelo "Usuário" define uma relação "hasMany" com o modelo "Post". Podemos criar um usuário com três postagens usando o método 'has' fornecido pelas fábricas do Laravel. O método 'has' aceita uma instância de fábrica:

```php
    use App\Models\Post;
    use App\Models\User;

    $user = User::factory()
                ->has(Post::factory()->count(3))
                ->create();
```

Por convenção, ao passar um modelo 'Post' para o método 'has', o Laravel supõe que o modelo 'Usuário' deve ter um método 'posts' que define a relação. Se necessário, você pode especificar explicitamente o nome da relação que gostaria de manipular:

```php
    $user = User::factory()
                ->has(Post::factory()->count(3), 'posts')
                ->create();
```

É claro que você pode executar manipulações de estado nos modelos relacionados. Além disso, você pode passar uma transformação de estado baseada em um fechamento se sua alteração de estado exigir acesso ao modelo pai:

```php
    $user = User::factory()
                ->has(
                    Post::factory()
                            ->count(3)
                            ->state(function (array $attributes, User $user) {
                                return ['user_type' => $user->type];
                            })
                )
                ->create();
```

<a name="has-many-relationships-using-magic-methods"></a>
#### Usando Métodos Mágicos

Para conveniência, você pode usar o método de relacionamento da fábrica mágica do Laravel para construir relacionamentos. Por exemplo, o seguinte exemplo usará a convenção para determinar que os modelos relacionados devem ser criados através do método de relacionamento "posts" no modelo "Usuário":

```php
    $user = User::factory()
                ->hasPosts(3)
                ->create();
```

Quando usando métodos mágicos para criar relações de fábrica, você pode passar um array de atributos para substituir na classe relacionada.

```php
    $user = User::factory()
                ->hasPosts(3, [
                    'published' => false,
                ])
                ->create();
```

Você pode fornecer uma transformação de estado baseada em encerramento se sua mudança de estado requer acesso ao modelo pai:

```php
    $user = User::factory()
                ->hasPosts(3, function (array $attributes, User $user) {
                    return ['user_type' => $user->type];
                })
                ->create();
```

<a name="belongs-to-relationships"></a>
### Relações Pertences

Agora que exploramos como construir "has many" relações usando fábricas, vamos explorar o inverso da relação. O método `for` pode ser usado para definir o modelo pai do qual as instâncias criadas pela fábrica pertencem. Por exemplo, podemos criar três instâncias do modelo App\Models\Post que pertencem a um único usuário:

```php
    use App\Models\Post;
    use App\Models\User;

    $posts = Post::factory()
                ->count(3)
                ->for(User::factory()->state([
                    'name' => 'Jessica Archer',
                ]))
                ->create();
```

Se você já tem uma instância de modelo pai que deve ser associada aos modelos que está criando, você pode passar a instância do modelo para o método "for":

```php
    $user = User::factory()->create();

    $posts = Post::factory()
                ->count(3)
                ->for($user)
                ->create();
```

<a name="belongs-to-relationships-using-magic-methods"></a>
#### Usando Métodos Mágicos

Para conveniência, você pode usar os métodos de relacionamento do fábrica de mágica Laravel para definir relacionamentos "Pertence a". Por exemplo, o seguinte exemplo usará a convenção para determinar que os três posts devem "pertencer" ao usuário na relação do modelo "Post":

```php
    $posts = Post::factory()
                ->count(3)
                ->forUser([
                    'name' => 'Jessica Archer',
                ])
                ->create();
```

<a name="many-to-many-relationships"></a>
### Relações Múltiplas a Múltiplos

Assim como [tem muitas relações](#has-many-relationships), as relações "muitos a muitos" podem ser criadas usando o método `has`:

```php
    use App\Models\Role;
    use App\Models\User;

    $user = User::factory()
                ->has(Role::factory()->count(3))
                ->create();
```

<a name="pivot-table-attributes"></a>
#### Atributos de Tabela Dinâmica

Se você precisa definir atributos que devem ser definidos na tabela pivô ou intermediária que liga os modelos, você pode usar o método `hasAttached`. Este método aceita um array de nomes de atributos da tabela pivô e valores como seu segundo argumento:

```php
    use App\Models\Role;
    use App\Models\User;

    $user = User::factory()
                ->hasAttached(
                    Role::factory()->count(3),
                    ['active' => true]
                )
                ->create();
```

Você pode fornecer um estado de transformação baseado em fechamento se o seu estado de mudança requer acesso ao modelo relacionado:

```php
    $user = User::factory()
                ->hasAttached(
                    Role::factory()
                        ->count(3)
                        ->state(function (array $attributes, User $user) {
                            return ['name' => $user->name.' Role'];
                        }),
                    ['active' => true]
                )
                ->create();
```

Se você já tem instâncias do modelo que gostaria de anexar aos modelos que está criando, você pode passar as instâncias do modelo para o método "hasAttached". Neste exemplo, os mesmos três papéis serão anexados a todos os três usuários:

```php
    $roles = Role::factory()->count(3)->create();

    $user = User::factory()
                ->count(3)
                ->hasAttached($roles, ['active' => true])
                ->create();
```

<a name="many-to-many-relationships-using-magic-methods"></a>
#### Usando Métodos Mágicos

Para conveniência, você pode usar os métodos de relações mágicas do Laravel para definir relações muitos-para-muitos. Por exemplo, o seguinte exemplo usará a convenção para determinar que os modelos relacionados devem ser criados por meio de um método de relação "roles" no modelo "User":

```php
    $user = User::factory()
                ->hasRoles(1, [
                    'name' => 'Editor'
                ])
                ->create();
```

<a name="polymorphic-relationships"></a>
### Relações Polimórficas

[Relações polimórficas](/docs/{{version}}/eloquent-relationships#polymorphic-relationships) também podem ser criadas usando fábricas. Relações polimórficas "morf-muitos" são criados da mesma maneira que relações "tem muitos" típicas. Por exemplo, se um modelo `App\Models\Post` tem uma relação "morf-muitos" com um modelo `App\Models\Comment`:

```php
    use App\Models\Post;

    $post = Post::factory()->hasComments(3)->create();
```

<a name="morph-to-relationships"></a>
#### Avança Para Relação

Métodos mágicos não podem ser utilizados para criar relacionamentos `morphTo`. Em vez disso, o método `for` deve ser utilizado diretamente e o nome do relacionamento deve ser fornecido explicitamente. Por exemplo, imagine que o modelo 'Comment' tenha um método 'commentable' que define um relacionamento 'morphTo'. Neste caso, podemos criar três comentários que pertencem a uma única postagem usando o método 'for' diretamente:

```php
    $comments = Comment::factory()->count(3)->for(
        Post::factory(), 'commentable'
    )->create();
```

<a name="polymorphic-many-to-many-relationships"></a>
#### Relações Múltiplas de Muitos para Muitos

As relações polimórficas "muitos para muitos" ("morphtomany" / "morphedbymany") podem ser criadas exatamente como as relações não-polimórficas "muitos para muitos":

```php
    use App\Models\Tag;
    use App\Models\Video;

    $videos = Video::factory()
                ->hasAttached(
                    Tag::factory()->count(3),
                    ['public' => true]
                )
                ->create();
```

Claro, o método mágico 'has' também pode ser usado para criar relacionamentos polimórficos "muitos a muitos":

```php
    $videos = Video::factory()
                ->hasTags(3, ['public' => true])
                ->create();
```

<a name="defining-relationships-within-factories"></a>
### Definindo relacionamentos dentro de fábricas

Para definir uma relação dentro de sua fábrica de modelos, normalmente atribuirá um novo caso de fábrica para a chave estrangeira da relação. Isso é normalmente feito para as "relações inversas" tais como "belongsTo" e "morphTo" relações. Por exemplo, se você gostaria de criar um novo usuário ao criar uma nova postagem, você pode fazer o seguinte:

```php
    use App\Models\User;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->title(),
            'content' => fake()->paragraph(),
        ];
    }
```

Se as colunas de relacionamento dependem da fábrica que a define, você pode atribuir um fechamento ao atributo. O fechamento receberá o array do atributo avaliado da fábrica:

```php
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'user_type' => function (array $attributes) {
                return User::find($attributes['user_id'])->type;
            },
            'title' => fake()->title(),
            'content' => fake()->paragraph(),
        ];
    }
```

<a name="recycling-an-existing-model-for-relationships"></a>
### Reutilizando um Modelo Existente para Relações

Se você tem modelos que compartilham uma relação comum com outro modelo, você pode usar o método "recycle" para garantir um único instância do modelo relacionado é reciclado para todas as relações criadas pela fábrica.

Por exemplo, imagine que você tem "Airline", "Flight" e "Ticket" como modelos onde o ticket pertence a uma companhia aérea e um voo, e o voo também pertence a uma companhia aérea. Ao criar os tickets, provavelmente você vai querer a mesma companhia aérea para ambos os casos, então você pode passar uma instância da companhia aérea para o método recycle:

```php
    Ticket::factory()
        ->recycle(Airline::factory()->create())
        ->create();
```

O método `recycle` pode ser especialmente útil se você tiver modelos pertencentes a um usuário ou equipe comum.

O método "recycle" também aceita uma coleção de modelos existentes. Quando uma coleção é fornecida ao método "recycle", um modelo aleatório dessa coleção será escolhido quando a fábrica precisar de um modelo desse tipo:

```php
    Ticket::factory()
        ->recycle($airlines)
        ->create();
```
