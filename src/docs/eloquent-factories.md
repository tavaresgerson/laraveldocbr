# Eloquente: Fábricas

<a name="introduction"></a>
## Introdução

 Quando testar sua aplicação ou inserir dados na base de dados, talvez seja necessário inserir alguns registros. Em vez de especificar manualmente o valor de cada coluna, o Laravel permite definir um conjunto de atributos padrão para os [modelos Eloquent](/docs/eloquent) usando fatorias de modelo.

 Para ver um exemplo de como escrever uma fabricação, confira o arquivo `database/factories/UserFactory.php` em sua aplicação. Essa fabricação é incluída com todas as novas aplicações do Laravel e contém a seguinte definição da fábrica:

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

 Como você pode ver, na sua forma mais básica, as fábricas são classes que estendem a classe de fábrica base do Laravel e definem um método `definition`. O método `definition` retorna o conjunto padrão de valores de atributo que devem ser aplicados ao criar um modelo usando a fábrica.

 Através da ajuda de `fake`, as fábricas têm acesso à biblioteca [Faker](https://github.com/FakerPHP/Faker) PHP, que permite gerar convenientemente vários tipos de dados aleatórios para teste e sementeamento.

 > [!ATENÇÃO]
 > Você pode alterar o local do seu aplicativo com o Faker atualizando a opção `faker_locale` em seu arquivo de configuração `config/app.php`.

<a name="defining-model-factories"></a>
## Definindo fábricas de modelos

<a name="generating-factories"></a>
### Fabricantes de geradores

 Para criar uma fábrica, execute o comando `make:factory [Artefato command]`:

```shell
php artisan make:factory PostFactory
```

 A nova classe de fato será colocada em seu diretório `database/factories`.

<a name="factory-and-model-discovery-conventions"></a>
#### Modelos e convenções de descoberta das fábricas

 Uma vez que você definiu as fábricas, você pode usar o método estático `factory` proporcionado aos seus modelos pelo traço `Illuminate\Database\Eloquent\Factories\HasFactory`, de forma a instanciar uma instância da fábrica para esse modelo.

 O método da característica `HasFactory` `factory` utilizará convenções para determinar a fábrica adequada para o modelo em que foi atribuída a característica. Especificamente, o método procurará uma fábrica no namespace `Database\Factories`, cujo nome de classe corresponda ao nome do modelo e seja terminado com "Factory". Se estas convenções não forem aplicáveis à sua aplicação ou fábrica específica, você pode sobrescrever o método `newFactory` em seu modelo para retornar diretamente uma instância da fábrica correspondente ao mesmo:

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

 Em seguida, defina uma propriedade `model` na correspondente fábrica:

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
### Estados da fábrica

 Os métodos de manipulação de estado permitem definir alterações discritas que podem ser aplicadas às fábricas de modelo em qualquer combinação. Por exemplo, sua `Database\Factories\UserFactory` fábrica poderia conter um método de estado `suspended` que modifica um dos seus valores de atributos padrão.

 Os métodos de transformação do estado geralmente chamam o método "state" fornecido pela classe de fábrica base do Laravel. O método "state" aceita um closure que receberá a matriz de atributos brutos definida para o fabricante e deve retornar uma matriz de atributos para modificação:

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
#### Estado "degradado"

 Se o seu modelo Eloquent puder ser [excluído silenciosamente](/docs/eloquent#soft-deleting), você poderá invocar a método de estado `trashed` interna para indicar que o modelo criado já foi "excluído silenciosamente". Você não precisa definir manualmente o estado `trashed`, pois ele está automaticamente disponível em todas as fábricas:

```php
    use App\Models\User;

    $user = User::factory()->trashed()->create();
```

<a name="factory-callbacks"></a>
### Llamadas de fábrica

 Os chamados de fábrica são registrados usando os métodos `afterMaking` e `afterCreating` e permitem que você execute tarefas adicionais após fazer ou criar um modelo. Você deve registrar esses chamados definindo o método `configure` em sua classe de fato. Esse método será automaticamente chamado pelo Laravel quando a fábrica for instanciada:

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

 Você também pode registrar os retornos de chamada de fábrica em métodos estatais para executar tarefas adicionais específicas para um determinado estado:

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
## Criando modelos usando fábricas

<a name="instantiating-models"></a>
### Instanciando modelos

 Definida as fábricas, você pode usar o método estático `factory`, disponível aos seus modelos pela característica `Illuminate\Database\Eloquent\Factories\HasFactory`, para criar uma instância da fábrica desse modelo. Vamos ver alguns exemplos de como criar modelos. Primeiro, usaremos o método `make` para criar modelos sem persistê-los no banco de dados:

```php
    use App\Models\User;

    $user = User::factory()->make();
```

 Pode criar uma coleção de vários modelos através do método `count`:

```php
    $users = User::factory()->count(3)->make();
```

<a name="applying-states"></a>
#### Países que aplicam o tratado

 Você também poderá aplicar qualquer um de seus estados de fábrica aos modelos. Se você deseja aplicar várias transformações de estado aos modelos, poderá simplesmente chamar os métodos de transformação de estado diretamente:

```php
    $users = User::factory()->count(5)->suspended()->make();
```

<a name="overriding-attributes"></a>
#### Atributos de substituição

 Se desejar substituir alguns dos valores padrão de seus modelos, você pode passar um array de valores para o método `make`. Só os atributos especificados serão alterados enquanto o restante deles permanecerão definidos conforme especificado pela fábrica:

```php
    $user = User::factory()->make([
        'name' => 'Abigail Otwell',
    ]);
```

 Como alternativa, o método `state` pode ser chamado diretamente na instância da fábrica para executar uma transformação de estado em linha:

```php
    $user = User::factory()->state([
        'name' => 'Abigail Otwell',
    ])->make();
```

 > [!ATENÇÃO]
 A proteção contra atribuições em massa (/) não é automaticamente desativada quando são criados modelos usando fábricas.

<a name="persisting-models"></a>
### Modelos persistentes

 O método `create` instancia instâncias de modelo e as persistência no banco de dados usando o método `save` da Eloquent:

```php
    use App\Models\User;

    // Create a single App\Models\User instance...
    $user = User::factory()->create();

    // Create three App\Models\User instances...
    $users = User::factory()->count(3)->create();
```

 Você pode ignorar os atributos do modelo padrão da fábrica, passando uma matriz de atributos ao método `create`:

```php
    $user = User::factory()->create([
        'name' => 'Abigail',
    ]);
```

<a name="sequences"></a>
### Seqüências

 Às vezes, você pode querer alterar o valor de um atributo de modelo dado para cada modelo criado. Você pode fazer isso definindo uma transformação estatal como uma sequência. Por exemplo, talvez você queira alternar o valor da coluna `admin` entre `Y` e `N` para cada usuário criado:

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

 Neste exemplo, serão criados cinco usuários com um valor de `admin` como `S` e cinco usuários com um valor de `admin` como `N`.

 Se necessário, pode incluir um bloqueio como valor de uma sequência. O bloqueio será invocado sempre que a sequência precisar de um novo valor:

```php
    use Illuminate\Database\Eloquent\Factories\Sequence;

    $users = User::factory()
                    ->count(10)
                    ->state(new Sequence(
                        fn (Sequence $sequence) => ['role' => UserRoles::all()->random()],
                    ))
                    ->create();
```

 Numa função de fecho de sequência, pode aceder às propriedades `$index` ou `$count` da instância de sequência que é injetada na função. A propriedade `$index` contém o número de iterações através da sequência que já ocorreram e a propriedade `$count` contém o número total de vezes em que a sequência será invocada:

```php
    $users = User::factory()
                    ->count(10)
                    ->sequence(fn (Sequence $sequence) => ['name' => 'Name '.$sequence->index])
                    ->create();
```

 Para conveniência, as seqüências também podem ser aplicadas usando o método `sequence`, que simplesmente chama o método `state`. O método `sequence` aceita um closure ou uma matriz de atributos sequenciados:

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
### Tem Muitos Relacionamentos

 Vamos explorar agora a criação de relacionamentos do modelo Eloquent usando os métodos de fabricação fluente do Laravel. Primeiro, vamos supor que nossa aplicação tenha um modelo `App\Models\User` e outro modelo `App\Models\Post`. Além disso, vamos supor que o modelo `User` defina uma relação `hasMany` com o modelo `Post`. Podemos criar um usuário com três posts usando o método `has`, fornecido pelos fabricantes do Laravel. O método `has` aceita uma instância de fábrica:

```php
    use App\Models\Post;
    use App\Models\User;

    $user = User::factory()
                ->has(Post::factory()->count(3))
                ->create();
```

 Por convenção, ao passar um modelo `Post` para o método `has`, o Laravel presume que o modelo `User` deve ter um método `posts` que defina a relação. Se necessário, você pode especificar explicitamente o nome da relação que gostaria de manipular:

```php
    $user = User::factory()
                ->has(Post::factory()->count(3), 'posts')
                ->create();
```

 Claro, você pode executar manipulações de estado nos modelos relacionados. Além disso, você pode passar uma transformação do estado baseada em um fecho se sua alteração de estado exigir acesso ao modelo parental:

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
#### Usando métodos mágicos

 Para conveniência, você pode usar os métodos de relação do mago da fábrica no Laravel para criar relacionamentos. Por exemplo, o exemplo a seguir usará uma convenção que determinará que os modelos relacionados devem ser criados através de um método de relação `posts` no modelo `User`:

```php
    $user = User::factory()
                ->hasPosts(3)
                ->create();
```

 Ao usar métodos mágicos para criar relações de fábrica, você pode passar uma matriz de atributos a serem substituídos nos modelos relacionados:

```php
    $user = User::factory()
                ->hasPosts(3, [
                    'published' => false,
                ])
                ->create();
```

 Você pode fornecer uma transformação de estado com closure se sua mudança no estado exigir o acesso ao modelo pai:

```php
    $user = User::factory()
                ->hasPosts(3, function (array $attributes, User $user) {
                    return ['user_type' => $user->type];
                })
                ->create();
```

<a name="belongs-to-relationships"></a>
### Pertence a relações

 Agora que exploramos como criar relações de muitos-a-múltiplos utilizando fatorias, vamos explorar o inverso da relação. O método `for` pode ser utilizado para definir o modelo pai a que os modelos criados por meio dessas fábricas pertencem. Por exemplo, podemos criar três instâncias do modelo App\Models\Post que pertençam a um único usuário:

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

 Se você já tiver uma instância de modelo pai que deve ser associada aos modelos que estão sendo criados, é possível passar a instância do modelo para o método `for`:

```php
    $user = User::factory()->create();

    $posts = Post::factory()
                ->count(3)
                ->for($user)
                ->create();
```

<a name="belongs-to-relationships-using-magic-methods"></a>
#### Usando Métodos Mágicos

 Para comodidade, você pode usar os métodos de relações de fábrica mágicas do Laravel para definir as relações "belongs to". Por exemplo, o seguinte exemplo usará a convenção para determinar que os três posts deverão pertencer à relação `user` no modelo Post:

```php
    $posts = Post::factory()
                ->count(3)
                ->forUser([
                    'name' => 'Jessica Archer',
                ])
                ->create();
```

<a name="many-to-many-relationships"></a>
### Relações de muitos para muitos

 Assim como nos casos de vários relacionamentos (#has-many-relationships), os relacionamentos do tipo “muitos para muitos” podem ser criados utilizando o método `has`:

```php
    use App\Models\Role;
    use App\Models\User;

    $user = User::factory()
                ->has(Role::factory()->count(3))
                ->create();
```

<a name="pivot-table-attributes"></a>
#### Atributos das tabelas de pivotamento

 Se você precisar definir atributos que devem ser definidos na tabela de cruzamento/intermediária que liga os modelos, poderá usar o método `hasAttached`. Esse método aceita um array de nomes e valores dos atributos da tabela de cruzamento como seu segundo argumento:

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

 Você poderá fornecer uma transformação de estado baseada em fechamentos se sua alteração de estado exigir o acesso ao modelo relacionado:

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

 Se você já tem instâncias de modelo que gostaria ser vinculadas aos modelos que está criando, pode passar as instâncias do modelo ao método `hasAttached`. Neste exemplo, os mesmos três papéis serão vinculados a todos os três usuários:

```php
    $roles = Role::factory()->count(3)->create();

    $user = User::factory()
                ->count(3)
                ->hasAttached($roles, ['active' => true])
                ->create();
```

<a name="many-to-many-relationships-using-magic-methods"></a>
#### Usando métodos mágicos

 Para conveniência, você pode usar os métodos de fábrica mágicos de relacionamentos do Laravel para definir relações "muitos-para-muitos". Por exemplo, o exemplo a seguir usará uma convenção para determinar que os modelos relacionados devem ser criados através de um método de relação "roles" no modelo `User`:

```php
    $user = User::factory()
                ->hasRoles(1, [
                    'name' => 'Editor'
                ])
                ->create();
```

<a name="polymorphic-relationships"></a>
### Relações polimórficas

 [Relações polimórficas](/docs/eloquent-relationships#polymorphic-relationships) também podem ser criadas usando fatorias. Relações "morph many" (polimórficas) são criadas da mesma forma que as relações "has many" tradicionais. Por exemplo, se um modelo `App\Models\Post` tem uma relação polimórfica com um modelo `App\Models\Comment`:

```php
    use App\Models\Post;

    $post = Post::factory()->hasComments(3)->create();
```

<a name="morph-to-relationships"></a>
#### Mova para relações

 Não é possível usar métodos mágicos para criar relações "morphTo". Em vez disso, o método `for` deve ser usado diretamente e o nome da relação deve ser fornecido explicitamente. Por exemplo, imagine que o modelo `Comment` tenha um método `commentable` que defina uma relação "morphTo". Nesta situação, podemos criar três comentários pertencentes a um único post usando o método `for` diretamente:

```php
    $comments = Comment::factory()->count(3)->for(
        Post::factory(), 'commentable'
    )->create();
```

<a name="polymorphic-many-to-many-relationships"></a>
#### Relações polimórficas de muitos para muitos

 As relações polimórficas "muitos a muitos" ("morphToMany"/"morphedByMany") podem ser criadas da mesma maneira que as não polimórficas "muitos a muitos":

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

 É claro que o método mágico `has` também pode ser usado para criar relações polimórficas de "muitos a muitos":

```php
    $videos = Video::factory()
                ->hasTags(3, ['public' => true])
                ->create();
```

<a name="defining-relationships-within-factories"></a>
### Definindo as relações dentro de fábricas

 Definir uma relação dentro da fábrica de modelo, você normalmente atribuirá uma nova instância da fábrica à chave estrangeira da relação. Isso geralmente é feito para as relações "inversas", como as relacionamentos `belongsTo` e `morphTo`. Por exemplo, se você deseja criar um novo usuário ao criar uma postagem, poderá fazer o seguinte:

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

 Se as colunas da relação dependerem da fábrica que o define, pode atribuir um fecho a um atributo. O fecho receberá o array de atributos avaliado pela fábrica:

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
### Reciclando um modelo existente de relacionamento

 Se os modelos tiverem um relacionamento comum com outro modelo, pode utilizar o método `recycle` para garantir que uma única instância do modelo relacionado seja reciclada para todas as relações criadas pela fábrica.

 Por exemplo, imaginemos que você tem os modelos "Aerolínea", "Voo" e "Ticket". Nesse caso, o bilhete pertence a uma companhia aérea e a um voo. O voo também pertence a uma companhia aérea. Ao criar bilhetes, você provavelmente deseja usar a mesma companhia aérea para o bilhete e o voo. Assim, é possível passar uma instância de companhia aérea ao método `recycle`:

```php
    Ticket::factory()
        ->recycle(Airline::factory()->create())
        ->create();
```

 O método `recycle` pode ser particularmente útil se você possuir modelos que pertençam a um usuário ou equipe comum.

 O método recycle também aceita uma coleção de modelos existentes. Quando uma coleção for fornecida ao método recycle, um modelo aleatório da lista será escolhido quando a fábrica precisar de um modelo desse tipo:

```php
    Ticket::factory()
        ->recycle($airlines)
        ->create();
```
