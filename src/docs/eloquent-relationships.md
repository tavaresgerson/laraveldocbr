# Eloquent: Relações

<a name="introduction"></a>
## Introdução

As tabelas do banco de dados costumam estar relacionadas entre si. Por exemplo, um post no blog pode ter muitos comentários ou um pedido pode estar relacionado ao usuário que o fez. O Eloquent simplifica a administração e o trabalho desses relacionamentos, além de dar suporte a uma variedade de relacionamentos comuns:

- [One To One](#one-to-one)
- [One To Many](#one-to-many)
- [Many To Many](#many-to-many)
- [Has One Through](#has-one-through)
- [Has Many Through](#has-many-through)
- [One To One (Polymorphic)](#one-to-one-polymorphic-relations)
- [One To Many (Polymorphic)](#one-to-many-polymorphic-relations)
- [Many To Many (Polymorphic)](#many-to-many-polymorphic-relations)

<a name="defining-relationships"></a>
## Definindo relacionamentos

Os relacionamentos do Eloquent são definidos como métodos nas classes de modelo do Eloquent. Como os relacionamentos também servem como poderosos construtores de consulta, a definição dos relacionamentos como métodos fornece poderosas capacidades de cadeia e consulta de método. Por exemplo, podemos encadear restrições adicionais para as consultas neste relacionamento `posts`:

```php
    $user->posts()->where('active', 1)->get();
```

Antes de mergulharmos fundo no uso de relacionamentos, vamos aprender como definir cada tipo de relação suportado pelo Eloquent.

<a name="one-to-one"></a>
### One to One

Um relacionamento de um para um é um tipo muito básico de relação em uma base de dados. Por exemplo, o modelo `User` pode ser associado a um modelo `Phone`. Para definir essa relação, colocaremos um método `phone` no modelo `User`. O método `phone` deve chamar o método `hasOne` e devolver seu resultado. O método `hasOne` está disponível para seu modelo através da classe base do modelo `Illuminate\Database\Eloquent\Model`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasOne;

    class User extends Model
    {
        /**
         * Obtenha o telefone associado ao usuário.
         */
        public function phone(): HasOne
        {
            return $this->hasOne(Phone::class);
        }
    }
```

O primeiro argumento passado ao método `hasOne` é o nome da classe do modelo relacionada. Uma vez definido o relacionamento, podemos recuperar o registro relacionado usando as propriedades dinâmicas de Eloquent. As propriedades dinâmicas permitem aceder aos métodos de relação como se fossem propriedades definidas no modelo:

```php
    $phone = User::find(1)->phone;
```

O Eloquent determina a chave estrangeira do relacionamento com base no nome do modelo pai. Neste caso, o modelo de `Phone` é automaticamente considerado como possuidor de uma chave estrangeira `user_id`. Se você desejar anular essa convenção, poderá passar um segundo argumento para o método `hasOne`:

```php
    return $this->hasOne(Phone::class, 'foreign_key');
```

Além disso, o Eloquent pressupõe que a chave estrangeira deve ter um valor correspondente à coluna da chave primária do elemento pai. Por outras palavras, o Eloquent irá procurar o valor da coluna `id` do utilizador na coluna `user_id` do registro de `Phone`. Se pretender que a relação utilize um valor da chave primária diferente de `id` ou da propriedade `$primaryKey` do seu modelo, poderá passar um terceiro argumento ao método `hasOne`:

```php
    return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### Definindo o Inverso do Relacionamento

Assim, podemos aceder ao modelo `Phone` do nosso modelo `User`. Em seguida, vamos definir uma relação no modelo `Phone` que nos permita aceder ao utilizador proprietário do telemóvel. Podemos definir o inverso de uma relação `hasOne` usando o método `belongsTo`.

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Phone extends Model
    {
        /**
         * Obtenha o usuário proprietário do telefone.
         */
        public function user(): BelongsTo
        {
            return $this->belongsTo(User::class);
        }
    }
```

Ao chamar o método user, o Eloquent tentará encontrar um modelo de `User` que tenha um `id` correspondente à coluna `user_id` do modelo `Phone`.

O Eloquent determina o nome da chave estrangeira examinando o nome do método de relacionamento e acrescentando o sufixo `_id` ao nome do método. Neste caso, o Eloquent assume que o modelo `Phone` possui uma coluna `user_id`. No entanto, se a chave estrangeira no modelo `Phone` não for `user_id`, você pode passar um nome de chave personalizado como segundo argumento ao método `belongsTo`.

```php
    /**
     * Obtenha o usuário proprietário do telefone.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'foreign_key');
    }
```

Se o modelo pai não usar o `id` como sua chave primária, ou se você deseja encontrar o modelo associado usando uma coluna diferente, você pode passar um terceiro argumento ao método `belongsTo`, especificando a chave customizada da tabela pai:

```php
    /**
     * Obtenha o usuário proprietário do telefone.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
    }
```

<a name="one-to-many"></a>
### One to Many

Um relacionamento de um para muitos é usado para definir relações em que um único modelo é o pai de vários modelos filhos. Por exemplo, uma postagem do blog pode ter um número infinito de comentários. Como todos os outros relacionamentos Eloquent, os relacionamentos de um para muitos são definidos através da definição de um método no modelo Eloquent:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasMany;

    class Post extends Model
    {
        /**
         * Obtenha os comentários da postagem do blog.
         */
        public function comments(): HasMany
        {
            return $this->hasMany(Comment::class);
        }
    }
```

Lembre-se, o Eloquent irá determinar automaticamente a coluna de chave estrangeira correta para o modelo `Comment`. Por convenção, o Eloquent usará o nome em "snake case" do modelo pai e acrescenta o sufixo `_id`. Assim, neste exemplo, o Eloquent assumirá que a coluna da chave estrangeira no modelo `Comment` é `post_id`.

Definido o método de relação podemos acessar a [coleção](/docs/eloquent-collections) de comentários relacionados através da propriedade `comments`. Lembre-se que, como Eloquent fornece "propriedades de relações dinâmicas", podemos acessar os métodos de relação como se fossem propriedades do modelo:

```php
    use App\Models\Post;

    $comments = Post::find(1)->comments;

    foreach ($comments as $comment) {
        // ...
    }
```

Como todos os relacionamentos também servem como construtores de consultas, é possível adicionar novas restrições à consulta do relacionamento chamando o método "comments" e continuando a encadear as condições na consulta:

```php
    $comment = Post::find(1)->comments()
                        ->where('title', 'foo')
                        ->first();
```

À semelhança do método `hasOne`, você também pode substituir as chaves locais e estrangeiras passando argumentos adicionais para o método `hasMany`:

```php
    return $this->hasMany(Comment::class, 'foreign_key');

    return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="one-to-many-inverse"></a>
### One to Many (inverso) / Belongs To

Agora que podemos acessar todos os comentários de um post, vamos definir um relacionamento para permitir que um comentário acesse seu post pai. Para definir o inverso de um relacionamento `hasMany`, defina um método de relacionamento no modelo filho que chame o método `belongsTo`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Comment extends Model
    {
        /**
         * Obtenha a publicação que possui o comentário.
         */
        public function post(): BelongsTo
        {
            return $this->belongsTo(Post::class);
        }
    }
```

Uma vez definido o relacionamento, podemos recuperar a publicação pai de um comentário através do acesso à "propriedade dinâmica" da publicação:

```php
    use App\Models\Comment;

    $comment = Comment::find(1);

    return $comment->post->title;
```

No exemplo acima, o Eloquent tentará encontrar um modelo de postagem com um `id` que corresponda à coluna `post_id` no modelo `Comment`.

O Eloquent determina o nome padrão da chave estrangeira examinando o nome do método de relacionamento e acrescenta ao final do nome do método um `_` seguido do nome da coluna da chave primária do modelo pai. Nesse exemplo, Eloquent suporá que a chave estrangeira do modelo `Post` na tabela `comments` é `post_id`.

No entanto, se a chave estrangeira para o seu relacionamento não seguir essas convenções, você pode passar um nome de chave estrangeira personalizada como segundo argumento ao método `belongsTo`:

```php
    /**
     * Obtenha a publicação que possui o comentário.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'foreign_key');
    }
```

Se o seu modelo pai não usar `id` como sua chave primária ou você desejar encontrar o modelo associado usando uma coluna diferente, você pode passar um terceiro argumento para o método `belongsTo`, especificando a chave personalizada da tabela pai:

```php
    /**
     * Obtenha a publicação que possui o comentário.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
    }
```

<a name="default-models"></a>
#### Modelos Padrão

Os relacionamentos `belongsTo`, `hasOne`, `hasOneThrough` e `morphOne` permitem definir um modelo padrão que será retornado se o relacionamento for `null`. Esse padrão é frequentemente referido como [padrão de objeto nulo](https://en.wikipedia.org/wiki/Null_Object_pattern) e pode ajudar na remoção de verificações condicionais em seu código. No exemplo a seguir, a relação `user` retornará um modelo vazio do `App\Models\User` se nenhum usuário estiver anexado ao modelo `Post`:

```php
    /**
     * Obtenha o autor da postagem.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault();
    }
```

Para preencher o modelo padrão com atributos, você pode passar um *array* ou um _closure_ para o método `withDefault`:

```php
    /**
     * Obtenha o autor da postagem.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault([
            'name' => 'Guest Author',
        ]);
    }

    /**
     * Obtenha o autor da postagem.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault(function (User $user, Post $post) {
            $user->name = 'Guest Author';
        });
    }
```

<a name="querying-belongs-to-relationships"></a>
#### Consulta BelongsTo

Ao consultar as crianças de um relacionamento "pertence a", você pode construir manualmente a cláusula `where` para recuperar os modelos Eloquent correspondentes:

```php
    use App\Models\Post;

    $posts = Post::where('user_id', $user->id)->get();
```

Entretanto, você pode achar mais conveniente usar o método `whereBelongsTo`, que determinará automaticamente o relacionamento e chave estrangeira adequados para o modelo especificado.

```php
    $posts = Post::whereBelongsTo($user)->get();
```

Você também pode fornecer uma instância de [coleção](/docs/eloquent-collections) para o método `whereBelongsTo`. Fazendo isso, o Laravel recuperará modelos que pertençam a qualquer um dos modelos pais dentro da coleção:

```php
    $users = User::where('vip', true)->get();

    $posts = Post::whereBelongsTo($users)->get();
```

Por omissão, o Laravel irá determinar a relação associada ao modelo dado com base no nome da classe do modelo; no entanto, você pode especificar manualmente o nome da relação fornecendo-a como segundo argumento para o método `whereBelongsTo`

```php
    $posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
### Tem um entre muitos

Por vezes, um modelo pode ter muitos modelos relacionados, mas você quer obter facilmente o modelo "mais recente" ou "mais antigo" relacionado ao tipo de relação. Por exemplo, um modelo de `User` (Usuário) pode estar relacionado a muitos modelos de `Order` (Pedido), mas você quer definir uma maneira conveniente de interagir com o pedido mais recente que o usuário fez. Você pode fazer isso usando o tipo de relação `hasOne` combinado aos métodos `ofMany`:

```php
/**
 * Obtenha o pedido mais recente do usuário.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

Da mesma forma, você pode definir um método para recuperar o modelo relacionado mais antigo ou primeiro de um relacionamento:

```php
/**
 * Obtenha o pedido mais antigo do usuário.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

Por padrão, os métodos `latestOfMany` e `oldestOfMany` recuperarão o modelo mais recente ou mais antigo relacionado com base na chave primária do modelo, que deve ser classificável. No entanto, às vezes você pode querer recuperar um modelo único de um relacionamento maior usando diferentes critérios de classificação.

Por exemplo, utilizando o método `ofMany`, você pode obter a encomenda mais dispendiosa do cliente. O método `ofMany` aceita a coluna classificável como primeiro argumento e que função agregada (`min` ou `max`) aplicar quando consulta o modelo relacionado:

```php
/**
 * Obtenha o maior pedido do usuário.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

::: warning ATENÇÃO
Como o PostgreSQL não suporta a execução da função `MAX` em colunas de UUID, atualmente não é possível usar relacionamentos um-para-muitos em conjunto com colunas UUID do PostgreSQL.
:::

<a name="converting-many-relationships-to-has-one-relationships"></a>
#### Convertendo relações "Muitos" em relações "Tem um"

Muitas vezes, quando você recupera um único modelo usando os métodos `latestOfMany`, `oldestOfMany` ou `ofMany`, você já tem uma relação "*has many*" definida para o mesmo modelo. Por conveniência, o Laravel permite que você converta facilmente essa relação em uma relação "*has one*" invocando o método `one` na relação:

```php
/**
 * Receba os pedidos do usuário.
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

/**
 * Obtenha o maior pedido do usuário.
 */
public function largestOrder(): HasOne
{
    return $this->orders()->one()->ofMany('price', 'max');
}
```

<a name="advanced-has-one-of-many-relationships"></a>
#### Relacionamentos avançados "Has One of Many"

É possível construir relações mais avançadas do tipo "tem um de muitos". Por exemplo, um modelo de `Product` pode ter muitos `Price` associados que serão mantidos no sistema mesmo após novas taxas de preço serem publicadas. Além disso, novos dados de preços do produto podem ser publicados antecipadamente para entrar em vigor em uma data futura por meio da coluna `published_at`.

Em resumo, precisamos recuperar os últimos preços publicados onde a data de publicação não seja no futuro. Além disso, se dois preços tiverem a mesma data de publicação, nós preferiremos o preço com maior ID. Para conseguir isso, temos que passar um array para o método `ofMany` que contém as colunas ordenáveis, que determinarão qual preço é o mais recente. Além disso, um *closure* será fornecido como segundo argumento do método `ofMany`. Este *closure* será responsável por adicionar restrições de data de publicação adicional para a consulta de relacionamento:

```php
/**
 * Obtenha o preço atual do produto.
 */
public function currentPricing(): HasOne
{
    return $this->hasOne(Price::class)->ofMany([
        'published_at' => 'max',
        'id' => 'max',
    ], function (Builder $query) {
        $query->where('published_at', '<', now());
    });
}
```

<a name="has-one-through"></a>
### Has One Through

O relacionamento "*has-one-through*" define um relacionamento de uma para uma com outro modelo. No entanto, este relacionamento indica que o modelo declarado pode corresponder a uma instância de outro modelo, procedendo através de um terceiro modelo.

Por exemplo, numa aplicação de reparação de veículos, cada modelo `Mechanic` pode estar associado a um modelo `Car`, e cada modelo `Car` pode estar associado a um modelo `Owner`. Embora o mecânico e o proprietário não tenham uma relação direta no banco de dados, o mecânico tem acesso ao proprietário através do modelo `Car`. Vejamos as tabelas necessárias para definir esta relação:

```
    mechanics
        id - integer
        name - string

    cars
        id - integer
        model - string
        mechanic_id - integer

    owners
        id - integer
        name - string
        car_id - integer
```

Agora que examinamos a estrutura da tabela para o relacionamento, vamos definir o relacionamento no modelo `Mechanic`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasOneThrough;

    class Mechanic extends Model
    {
        /**
         * Obtenha o dono do carro.
         */
        public function carOwner(): HasOneThrough
        {
            return $this->hasOneThrough(Owner::class, Car::class);
        }
    }
```

O primeiro argumento passado ao método `hasOneThrough` é o nome do modelo final que queremos acessar e o segundo argumento é o nome do modelo intermediário.

Caso as relações relevantes já tenham sido definidas em todos os modelos envolvidos na relação, você poderá definir uma relação "_has-one-through_" (tem um através de) por meio da invocação do método `through` e do fornecimento dos nomes dessas relações. Por exemplo, se o modelo `Mechanic` (Mecânico) tiver uma relação `cars` (carros) e o modelo `Car` (Automóvel) tiver uma relação `owner` (proprietário), você poderá definir uma relação "tem um através de" que liga o mecânico ao proprietário da seguinte forma:

```php
// Sintaxe baseada em strings...
return $this->through('cars')->has('owner');

// Sintaxe dinâmica...
return $this->throughCars()->hasOwner();
```

<a name="has-one-through-key-conventions"></a>
#### Convenções chave

Convenções típicas de chave estrangeira do Eloquent serão usadas ao executar as consultas do relacionamento. Se você quiser personalizar as chaves do relacionamento, pode passá-las como o terceiro e o quarto argumentos para o método `hasOneThrough`. O terceiro argumento é o nome da chave estrangeira no modelo intermediário. O quarto argumento é o nome da chave estrangeira no modelo final. O quinto argumento é a chave local, enquanto o sexto argumento é a chave local do modelo intermediário:

```php
    class Mechanic extends Model
    {
        /**
         * Chame o dono do carro.
         */
        public function carOwner(): HasOneThrough
        {
            return $this->hasOneThrough(
                Owner::class,
                Car::class,
                'mechanic_id', // Chave estrangeira na tabela cars...
                'car_id', // Chave estrangeira na tabela owners...
                'id', // Chave local na tabela mechanics...
                'id' // Chave local na tabela cars...
            );
        }
    }
```

Ou, como discutido anteriormente, se os relacionamentos relevantes já tiverem sido definidos em todos os modelos envolvidos no relacionamento, você pode definir de forma fluida um relacionamento "_has-one-through_" invocando o método `through` e fornecendo os nomes desses relacionamentos. Essa abordagem oferece a vantagem de reutilizar as convenções de chave já definidas nos relacionamentos existentes:

```php
// Sintaxe baseada em strings...
return $this->through('cars')->has('owner');

// Sintaxe dinâmica...
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>
### Has Many Through

O relacionamento "_has-many-through_" providencia uma maneira conveniente de acessar relações distantes por meio de um relacionamento intermediário. Por exemplo, suponha que estejamos construindo uma plataforma de implantação como [Laravel Vapor](https://vapor.laravel.com). Um modelo de `Project` pode acessar muitos modelos de `Deployment` por meio de um modelo de ambiente intermediário. Usando esse exemplo, você poderia facilmente reunir todas as implantações para um projeto específico. Veja as tabelas necessárias para definir esse relacionamento:

```
    projects
        id - integer
        name - string

    environments
        id - integer
        project_id - integer
        name - string

    deployments
        id - integer
        environment_id - integer
        commit_hash - string
```

Agora que examinamos a estrutura da tabela para o relacionamento, vamos definir o relacionamento no modelo de `Project`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasManyThrough;

    class Project extends Model
    {
        /**
         * Obtenha todas as implantações para o projeto.
         */
        public function deployments(): HasManyThrough
        {
            return $this->hasManyThrough(Deployment::class, Environment::class);
        }
    }
```

O primeiro argumento passado para o método `hasManyThrough` é o nome do modelo final que queremos acessar, enquanto o segundo argumento é o nome do modelo intermediário.

Ou, se as relações relevantes já tiverem sido definidas em todos os modelos envolvidos na relação, você pode fluente definir uma relação "_has-many-through_" ("tem muitos através de") chamando o método `through` e fornecendo os nomes dessas relações. Por exemplo, se o modelo `Project` tiver uma relação `environments` e o modelo `Environment` tiver uma relação `deployments`, você pode definir uma relação "_has-many-through_" conectando o projeto e as implantações da seguinte forma:

```php
// Sintaxe baseada em strings...
return $this->through('environments')->has('deployments');

// Sintaxe dinâmica...
return $this->throughEnvironments()->hasDeployments();
```

Embora a tabela do modelo `Deployment` não contenha uma coluna `project_id`, a relação `hasManyThrough` fornece acesso às implantações de um projeto por meio de `$project->deployments`. Para recuperar esses modelos, o Eloquent inspeciona a coluna `project_id` na tabela do modelo `Environment` intermediário. Após encontrar os IDs de ambiente relevantes, eles são usados ​​para consultar a tabela do modelo `Deployment`.

<a name="has-many-through-key-conventions"></a>
#### Convenções de chave

Convenções típicas de chave estrangeira do Eloquent serão usadas ao executar as consultas do relacionamento. Se você quiser personalizar as chaves do relacionamento, pode passá-las como o terceiro e o quarto argumentos para o método `hasManyThrough`. O terceiro argumento é o nome da chave estrangeira no modelo intermediário. O quarto argumento é o nome da chave estrangeira no modelo final. O quinto argumento é a chave local, enquanto o sexto argumento é a chave local do modelo intermediário:

```php
    class Project extends Model
    {
        public function deployments(): HasManyThrough
        {
            return $this->hasManyThrough(
                Deployment::class,
                Environment::class,
                'project_id', // Chave estrangeira na tabela environments...
                'environment_id', // Chave estrangeira na tabela deployments...
                'id', // Chave local na tabela projects...
                'id' // Chave local na tabela environments...
            );
        }
    }
```

Ou, conforme discutido anteriormente, se os relacionamentos relevantes já tiverem sido definidos em todos os modelos envolvidos no relacionamento, você pode definir com fluência um relacionamento "_has-many-through_" invocando o método `through` e fornecendo os nomes desses relacionamentos. Essa abordagem oferece a vantagem de reutilizar as convenções de chave já definidas nos relacionamentos existentes:

```php
// Sintaxe baseada em strings...
return $this->through('environments')->has('deployments');

// Sintaxe dinâmica...
return $this->throughEnvironments()->hasDeployments();
```

<a name="many-to-many"></a>
## Many to Many

As relações de muitos para muitos são ligeiramente mais complicadas do que os relacionamentos `hasOne` e `hasMany`. Um exemplo de uma relação de muitos para muitos é um usuário que tem várias funções e essas funções também são compartilhadas por outros usuários no aplicativo. Por exemplo, um usuário pode ter atribuído a ele o papel de "Autor" e "Editor". No entanto, esses papéis podem ser atribuídos a outros usuários também. Assim, um usuário tem muitas funções e uma função tem vários usuários.

<a name="many-to-many-table-structure"></a>
#### Estrutura da tabela

Para definir essa relação, são necessárias três tabelas do banco de dados: `users`, `roles` e `role_user`. A tabela `role_user` é derivada da ordem alfabética dos nomes dos modelos relacionados e contém as colunas `user_id` e `role_id`. Essa tabela é usada como uma tabela intermediária que liga os usuários e funções.

Lembre-se de que, como um papel pode pertencer a vários usuários, não podemos simplesmente colocar uma coluna `user_id` na tabela `roles`. Isso significaria que um papel só pode pertencer a um único usuário. Para dar suporte ao papel sendo atribuído a vários usuários, a tabela `role_user` é necessária. Podemos resumir a estrutura da tabela de relacionamento assim:

```
    users
        id - integer
        name - string

    roles
        id - integer
        name - string

    role_user
        user_id - integer
        role_id - integer
```

<a name="many-to-many-model-structure"></a>
#### Estrutura do modelo

As relações de muitos para muitos são definidas ao se escrever um método que retorna o resultado do método `belongsToMany`. O método `belongsToMany` é fornecido pela classe base `Illuminate\Database\Eloquent\Model`, usada por todos os modelos Eloquent da aplicação. Por exemplo, vamos definir um método `roles` no nosso modelo `User`. O primeiro argumento passado para este método é o nome da classe do modelo relacionado:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsToMany;

    class User extends Model
    {
        /**
         * As funções que pertencem ao usuário.
         */
        public function roles(): BelongsToMany
        {
            return $this->belongsToMany(Role::class);
        }
    }
```

Quando o relacionamento estiver definido, você pode acessar os papéis de um usuário usando a propriedade dinâmica do relacionamento `roles` (papéis):

```php
    use App\Models\User;

    $user = User::find(1);

    foreach ($user->roles as $role) {
        // ...
    }
```

Uma vez que todos os relacionamentos também funcionam como construtores de consultas, você pode adicionar outras restrições à consulta do relacionamento chamando o método `roles` e continuando a encadear condições para a consulta:

```php
    $roles = User::find(1)->roles()->orderBy('name')->get();
```

Para determinar o nome da tabela de relação entre as tabelas intermediárias, Eloquent unirá os dois nomes dos modelos relacionados em ordem alfabética. No entanto, você tem liberdade para substituir essa convenção. Você pode fazer isso passando um segundo argumento para o método `belongsToMany`:

```php
    return $this->belongsToMany(Role::class, 'role_user');
```

Além de personalizar o nome da tabela intermediária, você também pode personalizar os nomes das colunas das chaves na tabela passando argumentos adicionais para o método `belongsToMany`. O terceiro argumento é o nome do campo estrangeiro do modelo no qual você está definindo a relação, enquanto o quarto argumento é o nome do campo estrangeiro do modelo ao qual você está se juntando:

```php
    return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### Definição do inverso da relação

Para definir o "inverso" de um relacionamento muitos para muitos, você deve definir um método no modelo relacionado que também retorne o resultado do método `belongsToMany`. Para completar nosso exemplo de usuário/papel, vamos definir o método `users` no modelo de papel:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsToMany;

    class Role extends Model
    {
        /**
         * Os usuários que pertencem à função.
         */
        public function users(): BelongsToMany
        {
            return $this->belongsToMany(User::class);
        }
    }
```

Como pode verificar, o relacionamento é definido exatamente igual ao modelo equivalente `User`, com a exceção da referência ao modelo `App\Models\User`. Uma vez que estamos a reutilizar o método `belongsToMany`, todas as opções de personalização normais para as tabelas e chaves estão disponíveis ao definir o "inverso" das relações _many-to-many_.

<a name="retrieving-intermediate-table-columns"></a>
### Recuperando Colunas da Tabela Intermediária

Como você já aprendeu, trabalhar com relações de muitos para muitos requer a presença de uma tabela intermediária. O Eloquent oferece algumas maneiras úteis de interagir com essa tabela. Por exemplo, digamos que nosso modelo `User` tenha vários modelos `Role` aos quais ele está relacionado. Depois de acessar esse relacionamento, podemos acessar a tabela intermediária usando o atributo `pivot` nos modelos:

```php
    use App\Models\User;

    $user = User::find(1);

    foreach ($user->roles as $role) {
        echo $role->pivot->created_at;
    }
```

Note que um atributo `pivot` é automaticamente adicionado à cada modelo de `Role` que recuperamos. Esse atributo contém um modelo representando a tabela intermediária.

Por padrão, apenas as chaves do modelo estarão presentes no modelo `pivot`. Se a sua tabela intermediária contiver atributos extras, você deve especificá-los ao definir o relacionamento:

```php
    return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

Se você quiser que sua tabela intermediária tenha selos de horário `created_at` e `updated_at` que sejam automaticamente mantidos pelo Eloquent, chame o método `withTimestamps` ao definir a relação:

```php
    return $this->belongsToMany(Role::class)->withTimestamps();
```

::: warning ATENÇÃO
Tabelas intermediárias que utilizam _timestamps_ mantidas automaticamente pelo Eloquent requer ter as colunas `created_at` e `updated_at`.
:::

<a name="customizing-the-pivot-attribute-name"></a>
#### Personalizando o nome do atributo `pivot`

Como já referido anteriormente, os atributos da tabela intermediária podem ser acessados nos modelos através do atributo `pivot`, no entanto, você pode personalizar o nome deste atributo para melhor refletir o seu propósito na sua aplicação.

Por exemplo, se seu aplicativo contiver usuários que podem assinar podcasts, você provavelmente terá um relacionamento de muitos para muitos entre os usuários e os podcasts. Nesse caso, é possível renomear o atributo da tabela intermediária para `subscription` em vez de `pivot`. Isso pode ser feito usando o método `as` ao definir o relacionamento:

```php
    return $this->belongsToMany(Podcast::class)
                    ->as('subscription')
                    ->withTimestamps();
```

Depois de especificar o atributo da tabela intermediária personalizado, você poderá acessar os dados da tabela intermediária usando o nome personalizado.

```php
    $users = User::with('podcasts')->get();

    foreach ($users->flatMap->podcasts as $podcast) {
        echo $podcast->subscription->created_at;
    }
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
### Filtro de Consultas por Meio de Colunas de Tabela Intermediária

Você também pode filtrar os resultados retornados por consultas de relacionamento `belongsToMany` usando os métodos `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull` e `wherePivotNotNull` ao definir o relacionamento:

```php
    return $this->belongsToMany(Role::class)
                    ->wherePivot('approved', 1);

    return $this->belongsToMany(Role::class)
                    ->wherePivotIn('priority', [1, 2]);

    return $this->belongsToMany(Role::class)
                    ->wherePivotNotIn('priority', [1, 2]);

    return $this->belongsToMany(Podcast::class)
                    ->as('subscriptions')
                    ->wherePivotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

    return $this->belongsToMany(Podcast::class)
                    ->as('subscriptions')
                    ->wherePivotNotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

    return $this->belongsToMany(Podcast::class)
                    ->as('subscriptions')
                    ->wherePivotNull('expired_at');

    return $this->belongsToMany(Podcast::class)
                    ->as('subscriptions')
                    ->wherePivotNotNull('expired_at');
```

<a name="ordering-queries-via-intermediate-table-columns"></a>
### Consultas de Ordenação através das Colunas de Tabela Intermediária

Você pode ordenar os resultados retornados por consultas de relacionamento `belongsToMany` usando o método `orderByPivot`. No exemplo a seguir, recuperaremos todos os crachás mais recentes do usuário:

```php
    return $this->belongsToMany(Badge::class)
                    ->where('rank', 'gold')
                    ->orderByPivot('created_at', 'desc');
```

<a name="defining-custom-intermediate-table-models"></a>
### Definindo modelos de tabelas intermediárias personalizadas

Se você quiser definir um modelo personalizado para representar a tabela intermediária do seu relacionamento muitos-para-muitos, poderá chamar o método `using` ao definir o relacionamento. Os modelos de pivot personalizados permitem que você defina comportamentos adicionais no modelo de pivot, como métodos e conversões.

Os modelos de pivô muitos para muitos personalizados devem estender a classe `Illuminate\Database\Eloquent\Relations\Pivot`, enquanto os modelos de pivô muitos para muitos polimórficos devem estender a classe `Illuminate\Database\Eloquent\Relations\MorphPivot`. Por exemplo, podemos definir um modelo `Role` que usa um modelo de pivô personalizado `RoleUser`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsToMany;

    class Role extends Model
    {
        /**
         * Os usuários que pertencem à função.
         */
        public function users(): BelongsToMany
        {
            return $this->belongsToMany(User::class)->using(RoleUser::class);
        }
    }
```

Ao definir o modelo `RoleUser`, você deve estender a classe `Illuminate\Database\Eloquent\Relations\Pivot`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Relations\Pivot;

    class RoleUser extends Pivot
    {
        // ...
    }
```

::: warning ATENÇÃO
Os modelos de pivô não podem usar a característica `SoftDeletes`. Se você precisar realizar a exclusão suave de registros do pivô, considere converter seu modelo de pivô para um modelo Eloquent real.
:::

<a name="custom-pivot-models-and-incrementing-ids"></a>
#### Modelos de pivô personalizados e identificadores incrementais

Se tiver definido uma relação de muitos para muitos que utilize um modelo de pivô personalizado e esse modelo possuir uma chave primária auto-incrementada, você terá de garantir que a sua classe do modelo de pivô personalizado define uma propriedade `incrementing` definida como `true`.

```php
    /**
     * Indica se os IDs são incrementados automaticamente.
     *
     * @var bool
     */
    public $incrementing = true;
```

<a name="polymorphic-relationships"></a>
## Relações polimórficas

Um relacionamento polimórfico permite que o modelo filho pertença a mais de um tipo de modelo usando uma única associação. Por exemplo, imagine que você está criando um aplicativo para permitir que os usuários compartilhem posts em blogs e vídeos. Em tal aplicativo, o modelo `Comment` pode pertencer aos modelos `Post` e `Vídeo`.

<a name="one-to-one-polymorphic-relations"></a>
### Um para um (polimórfico)

<a name="one-to-one-polymorphic-table-structure"></a>
#### Estrutura da tabela

Uma relação polimórfica um-para-um é semelhante a uma típica relação um-para-um; no entanto, o modelo filho pode pertencer a mais de um tipo de modelo através de uma única associação. Por exemplo, um `Post` do blog e um `User` podem partilhar uma relação polimórfica com um modelo `Image`. Utilizar uma relação polimórfica um-para-um permite ter uma tabela única de imagens exclusivas que podem ser associadas a posts e utilizadores. Primeiro, analisemos a estrutura da tabela:

```
    posts
        id - integer
        name - string

    users
        id - integer
        name - string

    images
        id - integer
        url - string
        imageable_id - integer
        imageable_type - string
```

Observe as colunas `imageable_id` e `imageable_type` na tabela `images`. A coluna `imageable_id` conterá o valor de ID do post ou usuário, enquanto a coluna `imageable_type` conterá o nome da classe do modelo pai. A coluna `imageable_type` é usada pelo Eloquent para determinar qual "tipo" de modelo pai será retornado ao acessar a relação `imageable`. Neste caso, a coluna conteria `App\Models\Post` ou `App\Models\User`.

<a name="one-to-one-polymorphic-model-structure"></a>
#### Estrutura do modelo

A seguir, examinemos as definições do modelo necessárias para construir essa relação:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    class Image extends Model
    {
        /**
         * Get the parent imageable model (user or post).
         */
        public function imageable(): MorphTo
        {
            return $this->morphTo();
        }
    }

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphOne;

    class Post extends Model
    {
        /**
         * Get the post's image.
         */
        public function image(): MorphOne
        {
            return $this->morphOne(Image::class, 'imageable');
        }
    }

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphOne;

    class User extends Model
    {
        /**
         * Get the user's image.
         */
        public function image(): MorphOne
        {
            return $this->morphOne(Image::class, 'imageable');
        }
    }
```

<a name="one-to-one-polymorphic-retrieving-the-relationship"></a>
#### Restaurando o relacionamento

Uma vez que sua tabela de banco de dados e seus modelos estejam definidos, você pode acessar os relacionamentos através dos modelos. Por exemplo, para recuperar a imagem de um post, nós podemos acessar a propriedade do relacionamento dinâmico "image":

```php
    use App\Models\Post;

    $post = Post::find(1);

    $image = $post->image;
```

Pode recuperar o elemento pai do modelo polimórfico acedendo ao nome do método que efetua a chamada para `morphTo`. Neste caso, trata-se do método `imageable` no modelo `Image`, por conseguinte, acederemos a esse método como uma propriedade de relação dinâmica:

```php
    use App\Models\Image;

    $image = Image::find(1);

    $imageable = $image->imageable;
```

O relacionamento `imageable` no modelo `Image` devolverá uma instância de `Post` ou `User`, dependendo do tipo de modelo proprietário da imagem.

<a name="morph-one-to-one-key-conventions"></a>
#### Convenções fundamentais

Se necessário, pode especificar o nome das colunas "id" e "type" utilizadas pelo seu modelo filho polimórfico. Se fizer isso, assegure-se de que passa sempre o nome da relação como primeiro argumento para o método `morphTo`. Normalmente, este valor corresponde ao nome do método, podendo utilizar a constante PHP `__FUNCTION__`:

```php
    /**
     * Get the model that the image belongs to.
     */
    public function imageable(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
    }
```

<a name="one-to-many-polymorphic-relations"></a>
### Um para muitos (polimórficos)

<a name="one-to-many-polymorphic-table-structure"></a>
#### Estrutura de Tabela

Uma relação polimórfica "um para muitos" é semelhante à típica relação "um para muitos"; entretanto, o modelo filho pode pertencer a mais de um tipo de modelo usando uma única associação. Por exemplo, imagine que os usuários do seu aplicativo possam fazer "comentários" em posts e vídeos. Usando relações polimórficas, você pode usar uma tabela de comentários para conter os comentários tanto para posts quanto vídeos. Primeiro, vamos examinar a estrutura da tabela necessária para construir esta relação:

```
    posts
        id - integer
        title - string
        body - text

    videos
        id - integer
        title - string
        url - string

    comments
        id - integer
        body - text
        commentable_id - integer
        commentable_type - string
```

<a name="one-to-many-polymorphic-model-structure"></a>
#### Estrutura do modelo

Em seguida, vamos examinar as definições de modelos necessárias para criar essa relação:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    class Comment extends Model
    {
        /**
         * Get the parent commentable model (post or video).
         */
        public function commentable(): MorphTo
        {
            return $this->morphTo();
        }
    }

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphMany;

    class Post extends Model
    {
        /**
         * Get all of the post's comments.
         */
        public function comments(): MorphMany
        {
            return $this->morphMany(Comment::class, 'commentable');
        }
    }

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphMany;

    class Video extends Model
    {
        /**
         * Get all of the video's comments.
         */
        public function comments(): MorphMany
        {
            return $this->morphMany(Comment::class, 'commentable');
        }
    }
```

<a name="one-to-many-polymorphic-retrieving-the-relationship"></a>
#### Recuperando o relacionamento

Uma vez que sua tabela de banco de dados e seus modelos estejam definidos, você pode acessar as relações através das propriedades dinâmicas dos seus modelos. Por exemplo, para acessar todos os comentários de um post, podemos usar a propriedade dinâmica `comments`:

```php
    use App\Models\Post;

    $post = Post::find(1);

    foreach ($post->comments as $comment) {
        // ...
    }
```

Pode também recuperar o pai de um modelo filho polimórfico acedendo ao nome do método que efetua a chamada para `morphTo`. Neste caso, esse método é o `commentable` no modelo `Comment`. Por isso, iremos aceder a esse método como uma propriedade de relação dinâmica para acessar o modelo pai do comentário:

```php
    use App\Models\Comment;

    $comment = Comment::find(1);

    $commentable = $comment->commentable;
```

O relacionamento `commentable` no modelo de `Comentário` devolverá uma instância do tipo `Post` ou `Vídeo`, dependendo do tipo do modelo que for o progenitor do comentário.

<a name="one-of-many-polymorphic-relations"></a>
### Um entre muitos (polimórficos).

Por vezes, um modelo pode ter muitos modelos relacionados e pretende recuperar facilmente o "mais recente" ou o mais antigo modelo relacionado da relação. Por exemplo, um modelo de `User` (utilizador) pode estar associado a vários modelos de `Image` (imagens), mas pretende definir uma maneira conveniente de interagir com a imagem mais recente que o utilizador carregou.

```php
/**
 * Get the user's most recent image.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

Além disso, você pode definir um método para recuperar o modelo relacionado "mais antigo" ou o primeiro de uma relação:

```php
/**
 * Get the user's oldest image.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

Por defeito, os métodos `latestOfMany` e `oldestOfMany` recuperam o último ou mais antigo modelo relacionado com base na chave primária do modelo, que deve ser ordenável. No entanto, por vezes pode pretender recuperar um único modelo a partir de uma relação maior utilizando um critério de classificação diferente.

Por exemplo, usando o método `ofMany`, você pode recuperar a imagem mais "curtida" do usuário. O método `ofMany` aceita a coluna classificável como seu primeiro argumento e qual função de agregação (`min` ou `max`) será aplicada ao consultar o modelo relacionado:

```php
/**
 * Get the user's most popular image.
 */
public function bestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> [!IMPORTANTE]
> É possível construir relações "uma de muitas" mais complexas. Para obter mais informações, consulte a documentação sobre [tem uma de várias](#advanced-has-one-of-many-relationships).

<a name="many-to-many-polymorphic-relations"></a>
### Muitos para muitos (polimórfico)

<a name="many-to-many-polymorphic-table-structure"></a>
#### Estrutura da tabela

As relações polimórficas de muitos para muitos são ligeiramente mais complicadas do que as relações "morph one" e "morph many". Por exemplo, um modelo `Post` e um modelo `Video` poderiam partilhar uma relação polimórfica com um modelo `Tag`. Utilizar uma relação polimórfica de muitos para muitos nesta situação permitiria à sua aplicação ter uma única tabela de tags exclusivas que podem estar associadas a posts ou vídeos. Em primeiro lugar, vamos examinar a estrutura da tabela necessária para criar esta relação:

```
    posts
        id - integer
        name - string

    videos
        id - integer
        name - string

    tags
        id - integer
        name - string

    taggables
        tag_id - integer
        taggable_id - integer
        taggable_type - string
```

> [NOTA]
> Antes de mergulhar em relações múltiplas polimórficas, talvez seja útil ler a documentação sobre as típicas relações [de muitos para muitos](#many-to-many).

<a name="many-to-many-polymorphic-model-structure"></a>
#### Estrutura do modelo

Em seguida, estamos prontos para definir as relações nos modelos. Os modelos de "Post" e "Vídeo" contêm um método "tags" que chama o método "morphToMany" fornecido pela classe base do modelo Eloquent.

O método `morphToMany` aceita o nome do modelo relacionado bem como um “nome de relação”. Com base no nome que atribuímos à nossa tabela intermediária e às chaves contidas, vamos nos referir a relação como “taggable”:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphToMany;

    class Post extends Model
    {
        /**
         * Get all of the tags for the post.
         */
        public function tags(): MorphToMany
        {
            return $this->morphToMany(Tag::class, 'taggable');
        }
    }
```

<a name="many-to-many-polymorphic-defining-the-inverse-of-the-relationship"></a>
#### Definindo o inverso da relação

Em seguida, no modelo "Tag", você deve definir um método para cada um dos seus possíveis modelos pais. Neste exemplo, nós definiremos os métodos "posts" e "videos". Ambos estes métodos deverão retornar o resultado do método "morphedByMany".

O método `morphedByMany` aceita o nome do modelo relacionado e também o "nome do relacionamento". Baseado no nome que atribuímos ao nosso nome da tabela intermediária e as chaves contidas, chamaremos de "taggable" a nossa relação:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphToMany;

    class Tag extends Model
    {
        /**
         * Get all of the posts that are assigned this tag.
         */
        public function posts(): MorphToMany
        {
            return $this->morphedByMany(Post::class, 'taggable');
        }

        /**
         * Get all of the videos that are assigned this tag.
         */
        public function videos(): MorphToMany
        {
            return $this->morphedByMany(Video::class, 'taggable');
        }
    }
```

<a name="many-to-many-polymorphic-retrieving-the-relationship"></a>
#### Retomando o relacionamento

Quando a tabela de banco de dados e os modelos são definidos, é possível acessar as relações através dos modelos. Por exemplo, para acessar todas as tags de um post, você pode usar a propriedade dinâmica de relação `tags`:

```php
    use App\Models\Post;

    $post = Post::find(1);

    foreach ($post->tags as $tag) {
        // ...
    }
```
Você pode recuperar o pai de uma relação polimórfica do modelo infantil polimórfico acessando o nome do método que realiza a chamada para `morphedByMany`. Neste caso, trata-se dos métodos `posts` ou `videos` no modelo `Tag`:

```php
    use App\Models\Tag;

    $tag = Tag::find(1);

    foreach ($tag->posts as $post) {
        // ...
    }

    foreach ($tag->videos as $video) {
        // ...
    }
```

<a name="custom-polymorphic-types"></a>
### Tipos polimórficos personalizados

Por padrão, o Laravel usará o nome completo da classe para armazenar o "tipo" do modelo relacionado. Por exemplo, dado o exemplo de relação one-to-many acima onde um modelo de `Comment` pode pertencer a um modelo de `Post` ou `Video`, o padrão `commentable_type` seria `App\Models\Post` ou `App\Models\Video`, respectivamente. No entanto, você poderá desejar dissociar esses valores da estrutura interna do seu aplicativo.

Por exemplo, ao invés de usar os nomes do modelo como o “tipo”, podemos usar strings simples como `post` e `video`. Dessa forma, os valores polimórficos da coluna "tipo" no nosso banco de dados permanecerão válidos mesmo que os modelos sejam renomeados.

```php
    use Illuminate\Database\Eloquent\Relations\Relation;

    Relation::enforceMorphMap([
        'post' => 'App\Models\Post',
        'video' => 'App\Models\Video',
    ]);
```

Você pode chamar o método `enforceMorphMap` no método `boot` de sua classe `App\Providers\AppServiceProvider` ou criar um provedor de serviços separado, se preferir.

Pode determinar o alias de morfologia de um modelo específico em tempo de execução utilizando o método `getMorphClass` do modelo. Por outro lado, pode determinar o nome da classe totalmente qualificada associado a um alias de morfologia usando o método `Relation::getMorphedModel`:

```php
    use Illuminate\Database\Eloquent\Relations\Relation;

    $alias = $post->getMorphClass();

    $class = Relation::getMorphedModel($alias);
```

> [!AVISO]
> Ao adicionar um "mapa de morfologia" ao seu pedido existente, cada valor da coluna do tipo `*_type` morfologável no banco de dados que ainda contenha uma classe totalmente qualificada precisará ser convertido para o respectivo nome "map".

<a name="dynamic-relationships"></a>
### Relações dinâmicas

Você pode usar o método `resolveRelationUsing` para definir relações entre modelos Eloquent no tempo de execução. Embora não seja recomendável para o desenvolvimento normal de aplicativos, isso pode ser útil às vezes quando se está criando pacotes Laravel.

O método `resolveRelationUsing` aceita o nome do relacionamento desejado como seu primeiro argumento. O segundo argumento passado para o método deve ser um *closure* que aceite a instância modelo e retorne uma definição de relação Eloquent válida. Normalmente, você configura os relacionamentos dinâmicos dentro do método boot de um [service provider](/docs/providers):

```php
    use App\Models\Order;
    use App\Models\Customer;

    Order::resolveRelationUsing('customer', function (Order $orderModel) {
        return $orderModel->belongsTo(Customer::class, 'customer_id');
    });
```

> [!ADVERTÊNCIA]
> Ao definir relações dinâmicas, forneça sempre argumentos explícitos de nomes de chaves para os métodos de relação do Eloquent.

<a name="querying-relations"></a>
## Consulta de relações

Uma vez que todas as relações do Eloquent são definidas através de métodos, você pode chamar esses métodos para obter uma instância da relação sem executar uma consulta para carregar os modelos associados. Além disso, todos os tipos de relações do Eloquent também servem como [geradores de consultas](/docs/queries), permitindo que você continue a encadear restrições na consulta de relação antes de finalmente executar a consulta SQL no seu banco de dados.

Por exemplo, imagine um aplicativo de blog no qual um modelo `User` tenha muitos modelos `Post` associados:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasMany;

    class User extends Model
    {
        /**
         * Get all of the posts for the user.
         */
        public function posts(): HasMany
        {
            return $this->hasMany(Post::class);
        }
    }
```

Pode consultar a relação de `posts` e adicionar restrições adicionais à relação, desta forma:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->posts()->where('active', 1)->get();
```

Você pode usar qualquer um dos métodos do construtor de consultas do Laravel na relação, então, não se esqueça de explorar a documentação do construtor de consulta para conhecer todos os métodos disponíveis.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### Agrupando cláusulas `orWhere` após relações

Conforme demonstrado no exemplo acima, você é livre para adicionar restrições adicionais às relações ao consultá-las. No entanto, tome cuidado ao encadear cláusulas `orWhere` em uma relação, já que as cláusulas `orWhere` serão agrupadas logicamente no mesmo nível da restrição de relacionamento:

```php
    $user->posts()
            ->where('active', 1)
            ->orWhere('votes', '>=', 100)
            ->get();
```

O exemplo acima irá gerar o seguinte SQL. Como você pode ver, a cláusula `or` dita à consulta que devolva _qualquer_ post com mais de 100 votos. A consulta já não está limitada a um utilizador específico:

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

Na maioria dos casos, deve utilizar [grupos lógicos](/docs/queries#logical-grouping) para agrupar as verificações condicionais entre parênteses:

```php
    use Illuminate\Database\Eloquent\Builder;

    $user->posts()
            ->where(function (Builder $query) {
                return $query->where('active', 1)
                             ->orWhere('votes', '>=', 100);
            })
            ->get();
```

O exemplo acima produzirá o seguinte SQL. Note que o agrupamento lógico agrupou corretamente as restrições e a consulta permanece restringida a um usuário específico:

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### Métodos de relacionamento versus propriedades dinâmicas

Se você não precisar adicionar restrições adicionais a uma consulta de relacionamento Eloquent, poderá acessar o relacionamento como se fosse uma propriedade. Por exemplo, continuando a usar nossos modelos de exemplo `User` e `Post`, podemos acessar todos os posts de um usuário da seguinte forma:

```php
    use App\Models\User;

    $user = User::find(1);

    foreach ($user->posts as $post) {
        // ...
    }
```

As propriedades de relacionamento dinâmicas efetuam o "carregamento preguiçoso", ou seja, apenas carregam os dados da relação quando você efetivamente os acessa. Por este motivo, os desenvolvedores costumam usar o [carga antecipada](#eager-loading) para pré-carregar as relações das quais eles sabem que serão acessadas depois do carregamento do modelo. A carga antecipada proporciona uma redução significativa nas consultas SQL que devem ser executadas para carregar as relações de um modelo.

<a name="querying-relationship-existence"></a>
### Consulta de existência do relacionamento

Ao recuperar registos de modelos, poderá pretender limitar os resultados com base na existência de uma relação. Por exemplo, imagine que deseja recuperar todos os posts de blogue que tenham pelo menos um comentário. Para tal, pode passar o nome da relação para os métodos `has` e `orHas`:

```php
    use App\Models\Post;

    // Retrieve all posts that have at least one comment...
    $posts = Post::has('comments')->get();
```

Também é possível especificar um operador e um valor de contagem para personalizar ainda mais a consulta.

```php
    // Retrieve all posts that have three or more comments...
    $posts = Post::has('comments', '>=', 3)->get();
```

As declarações `has` aninhadas podem ser construídas utilizando a notação de "ponto". Por exemplo, você pode recuperar todos os posts que tenham pelo menos um comentário que tenha pelo menos uma imagem:

```php
    // Retrieve posts that have at least one comment with images...
    $posts = Post::has('comments.images')->get();
```

Se você precisar de ainda mais poder, pode usar os métodos `whereHas` e `orWhereHas` para definir restrições adicionais à consulta em suas consultas `has`, como inspecionar o conteúdo de um comentário:

```php
    use Illuminate\Database\Eloquent\Builder;

    // Retrieve posts with at least one comment containing words like code%...
    $posts = Post::whereHas('comments', function (Builder $query) {
        $query->where('content', 'like', 'code%');
    })->get();

    // Retrieve posts with at least ten comments containing words like code%...
    $posts = Post::whereHas('comments', function (Builder $query) {
        $query->where('content', 'like', 'code%');
    }, '>=', 10)->get();
```

> [!AVISO]
> Atualmente, o Eloquent não oferece suporte à consulta de relacionamentos entre bancos de dados. As relações precisam estar na mesma base de dados.

<a name="inline-relationship-existence-queries"></a>
#### Consultas de existência de relacionamento em linha

Se pretender obter uma relação através de uma condição simples e única ligada à consulta da relação, pode optar por utilizar os métodos `whereRelation`, `orWhereRelation`, `whereMorphRelation` e `orWhereMorphRelation`. Por exemplo, podemos obter todos os artigos que têm comentários não aprovados:

```php
    use App\Models\Post;

    $posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

Claro que, assim como os chamados ao método `where` do construtor de consultas, você pode também especificar um operador:

```php
    $posts = Post::whereRelation(
        'comments', 'created_at', '>=', now()->subHour()
    )->get();
```
<a name="querying-relationship-absence"></a>
### Consultando a ausência de relacionamento

Quando você recupera registros de modelo, pode ser útil limitar os resultados com base na ausência de um relacionamento. Por exemplo, suponha que você deseja recuperar todas as postagens do blog que **não** tenham nenhum comentário. Para fazer isso, você pode passar o nome do relacionamento para os métodos `doesntHave` e `orDoesntHave`.

```php
    use App\Models\Post;

    $posts = Post::doesntHave('comments')->get();
```

Se você precisar de ainda mais potência, poderá utilizar os métodos `whereDoesntHave` e `orWhereDoesntHave` para adicionar restrições extras às consultas `doesntHave`, como inspecionando o conteúdo de um comentário:

```php
    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::whereDoesntHave('comments', function (Builder $query) {
        $query->where('content', 'like', 'code%');
    })->get();
```

Pode usar a notação "ponto" para executar uma consulta numa relação aninhada. Por exemplo, a seguinte consulta recupera todas as publicações sem comentários; contudo, incluirá as publicações que têm comentários de autores não banidos:

```php
    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
        $query->where('banned', 0);
    })->get();
```

<a name="querying-morph-to-relationships"></a>
### Consultando Morfologia para Relações

Para consultar a existência de relações "morph to", você pode usar os métodos `whereHasMorph` e `whereDoesntHaveMorph`. Estes métodos aceitam o nome do relacionamento como primeiro argumento. Em seguida, os métodos aceitam os nomes dos modelos associados que você deseja incluir na consulta. Por último, você pode fornecer um *closure* que personaliza a consulta de relação:

```php
    use App\Models\Comment;
    use App\Models\Post;
    use App\Models\Video;
    use Illuminate\Database\Eloquent\Builder;

    // Retrieve comments associated to posts or videos with a title like code%...
    $comments = Comment::whereHasMorph(
        'commentable',
        [Post::class, Video::class],
        function (Builder $query) {
            $query->where('title', 'like', 'code%');
        }
    )->get();

    // Retrieve comments associated to posts with a title not like code%...
    $comments = Comment::whereDoesntHaveMorph(
        'commentable',
        Post::class,
        function (Builder $query) {
            $query->where('title', 'like', 'code%');
        }
    )->get();
```

Ocasionalmente, poderá ser necessário adicionar restrições de pesquisa baseadas no "tipo" do modelo polimórfico relacionado. O fecho passado ao método `whereHasMorph` pode receber um valor `$type` como segundo argumento. Este argumento permite analisar o "tipo" da consulta que está a ser criada:

```php
    use Illuminate\Database\Eloquent\Builder;

    $comments = Comment::whereHasMorph(
        'commentable',
        [Post::class, Video::class],
        function (Builder $query, string $type) {
            $column = $type === Post::class ? 'content' : 'title';

            $query->where($column, 'like', 'code%');
        }
    )->get();
```

<a name="querying-all-morph-to-related-models"></a>
#### Consultando todos os modelos relacionados

Em vez de passar um array com os possíveis modelos polimórficos, você pode utilizar `*` como um valor wildcard (campo selvagem). Isso instruirá o Laravel a recuperar todos os tipos polimórficos disponíveis no banco de dados. Para executar essa operação, o Laravel fará uma consulta adicional:

```php
    use Illuminate\Database\Eloquent\Builder;

    $comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
        $query->where('title', 'like', 'foo%');
    })->get();
```

<a name="aggregating-related-models"></a>
## Agregando Modelos Relacionados

<a name="counting-related-models"></a>
### Contagem de Modelos Relacionados

Por vezes pode ser necessário contar o número de modelos relacionados para uma determinada relação sem efetivamente carregar os modelos. Para tal, pode utilizar o método `withCount`. O método `withCount` colocará um atributo `{relation}_count` nos modelos resultantes:

```php
    use App\Models\Post;

    $posts = Post::withCount('comments')->get();

    foreach ($posts as $post) {
        echo $post->comments_count;
    }
```

Ao passar um array para o método `withCount`, você pode adicionar os "contagem" de múltiplas relações, bem como adicionar restrições adicionais às consultas:

```php
    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
        $query->where('content', 'like', 'code%');
    }])->get();

    echo $posts[0]->votes_count;
    echo $posts[0]->comments_count;
```

Você também pode usar um alias para o resultado da contagem de relacionamentos, permitindo várias contagens no mesmo relacionamento:

```php
    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::withCount([
        'comments',
        'comments as pending_comments_count' => function (Builder $query) {
            $query->where('approved', false);
        },
    ])->get();

    echo $posts[0]->comments_count;
    echo $posts[0]->pending_comments_count;
```

<a name="deferred-count-loading"></a>
#### Carregamento em espera do número

Utilizando o método "loadCount", você pode carregar uma contagem de relacionamento após o modelo pai já ter sido recuperado:

```php
    $book = Book::first();

    $book->loadCount('genres');
```

Se você precisar definir restrições adicionais para a consulta na contagem, poderá passar um array ordenado pelas relações que deseja contar. Os valores do array devem ser fechamentos que recebem a instância do criador da consulta:

```php
    $book->loadCount(['reviews' => function (Builder $query) {
        $query->where('rating', 5);
    }])
```

<a name="relationship-counting-and-custom-select-statements"></a>
#### Contagem de relacionamento e declarações de seleção personalizadas

Se você estiver combinando o `withCount` com uma declaração `select`, certifique-se de chamar o `withCount` após o método `select`:

```php
    $posts = Post::select(['title', 'body'])
                    ->withCount('comments')
                    ->get();
```

<a name="other-aggregate-functions"></a>
### Outras funções agregadas

Para além do método `withCount`, o Eloquent fornece os métodos `withMin`, `withMax`, `withAvg`, `withSum` e `withExists`. Estes métodos irão colocar um atributo `{relation}_{function}_{column}` nos respetivos modelos:

```php
    use App\Models\Post;

    $posts = Post::withSum('comments', 'votes')->get();

    foreach ($posts as $post) {
        echo $post->comments_sum_votes;
    }
```

Se pretender acessar o resultado da função de agregação utilizando outro nome, pode especificar um alias próprio:

```php
    $posts = Post::withSum('comments as total_comments', 'votes')->get();

    foreach ($posts as $post) {
        echo $post->total_comments;
    }
```

Tal como o método `loadCount`, também estão disponíveis versões diferidas destes métodos. Estas operações agregadas adicionais podem ser executadas em modelos Eloquent que já tenham sido recuperados:

```php
    $post = Post::first();

    $post->loadSum('comments', 'votes');
```

Se combinar estes métodos de agregação com uma declaração `select`, deve garantir que chama os métodos de agregação após o método `select`.

```php
    $posts = Post::select(['title', 'body'])
                    ->withExists('comments')
                    ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
### Contando modelos relacionados em Morph para relações

Se você quiser carregar antecipadamente um relacionamento "morph to", bem como as contagens de modelos relacionados para as várias entidades que podem ser retornadas por esse relacionamento, poderá utilizar o método `with` em conjunto com o método `morphWithCount` do relacionamento `morphTo`.

Neste exemplo, assumimos que os modelos de Foto e Post podem criar modelos de FeedDeAtividades. Assumiremos também que o modelo de FeedDeAtividades define uma relação "morph to" chamada parentable que nos permite recuperar o modelo pai, Foto ou Post, para determinado exemplo do FeedDeAtividades. Além disso, assumimos que os modelos Foto "têm muitas" Tags e os modelos Post "têm muitos" Comentários.

Agora, vamos imaginar que queremos recuperar instâncias do `ActivityFeed` e carregar previamente os modelos `parentable` dos pais para cada instância de `ActivityFeed`. Além disso, queremos recuperar o número de tags associadas a cada foto parental e o número de comentários associados a cada post parental:

```php
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    $activities = ActivityFeed::with([
        'parentable' => function (MorphTo $morphTo) {
            $morphTo->morphWithCount([
                Photo::class => ['tags'],
                Post::class => ['comments'],
            ]);
        }])->get();
```

<a name="morph-to-deferred-count-loading"></a>
#### Carregamento de contagem diferido

Vamos supor que já recuperámos um conjunto de modelos `ActivityFeed` e agora gostaríamos de carregar as contagens de relacionamentos aninhados para os vários modelos `parentable` associados aos feeds de atividade. Pode utilizar o método `loadMorphCount` para executar esta operação:

```php
    $activities = ActivityFeed::with('parentable')->get();

    $activities->loadMorphCount('parentable', [
        Photo::class => ['tags'],
        Post::class => ['comments'],
    ]);
```

<a name="eager-loading"></a>
## Carregamento ávido

Ao aceder às relações Eloquent como propriedades, os modelos relacionados são "carregados por demanda". Isto significa que os dados da relação não são carregados efetivamente até que aceda pela primeira vez a propriedade. No entanto, o Eloquent pode carregar as relações "por demanda" aquando do pedido ao modelo pai. O carregamento por demanda alivia o problema de consultas N+1. Para ilustrar o problema de consultas N+1, considere um modelo `Book` que pertence a um modelo `Author`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Book extends Model
    {
        /**
         * Get the author that wrote the book.
         */
        public function author(): BelongsTo
        {
            return $this->belongsTo(Author::class);
        }
    }
```

Agora, vamos recuperar todos os livros e seus autores:

```php
    use App\Models\Book;

    $books = Book::all();

    foreach ($books as $book) {
        echo $book->author->name;
    }
```

Este loop irá executar uma consulta para recuperar todos os livros na tabela de base de dados e depois outra consulta para cada livro, para recuperar o autor do mesmo. Assim, se existirem 25 livros, o código acima executaria 26 consultas: uma para o livro original e mais 25 para recuperar o autor de cada livro.

Felizmente, podemos usar o carregamento ansioso para reduzir esta operação para apenas duas consultas. Ao construir uma consulta, você pode especificar quais relacionamentos devem ser carregados por antecipação utilizando o método `with`:

```php
    $books = Book::with('author')->get();

    foreach ($books as $book) {
        echo $book->author->name;
    }
```

Para esta operação, apenas serão executadas duas consultas: uma para recuperar todos os livros e outra para recuperar todos os autores de todos os livros:

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
#### Carregamento antecipado de múltiplos relacionamentos

Por vezes pode ser necessário carregar várias relações diferentes de imediato. Para tal, basta passar uma matriz de relações ao método `with`:

```php
    $books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
#### Carregamento antecipado aninhado

Para carregar ansiosamente os relacionamentos de um relacionamento, você pode usar a sintaxe "ponto". Por exemplo, vamos carregar ansiosamente todos os autores do livro e todos os contatos pessoais do autor:

```php
    $books = Book::with('author.contacts')->get();
```

Como alternativa, você pode especificar relações carregadas ansiosas aninhadas fornecendo um array aninhado ao método `with`, o que pode ser conveniente quando várias relações aninhadas forem carregadas ansiosamente:

```php
    $books = Book::with([
        'author' => [
            'contacts',
            'publisher',
        ],
    ])->get();
```

<a name="nested-eager-loading-morphto-relationships"></a>
#### Carregamento Antecipado de Relações Embutidas `morphTo`

Se você quiser carregar avidamente um relacionamento `morphTo`, bem como os relacionamentos aninhados nas várias entidades que podem ser retornadas por esse relacionamento, é possível usar o método `with` em combinação com o método `morphWith` do relacionamento `morphTo`. Para ajudar a ilustrar esse método, considere o seguinte modelo:

```php
    <?php

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    class ActivityFeed extends Model
    {
        /**
         * Get the parent of the activity feed record.
         */
        public function parentable(): MorphTo
        {
            return $this->morphTo();
        }
    }
```

Neste exemplo, vamos supor que os modelos `Evento`, `Foto` e `Publicação` podem criar modelos `Feed de Atividades`. Além disso, vamos assumir que os modelos `Evento` pertencem a um modelo `Calendário`, os modelos `Foto` estão associados com modelos `Tag` e os modelos `Publicação` pertencem a um modelo `Autor`.

Usando essas definições e relações de modelo, podemos recuperar instâncias do modelo `ActivityFeed` e carregá-las instantaneamente em todos os modelos `parentable` e suas respectivas relações aninhadas:

```php
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    $activities = ActivityFeed::query()
        ->with(['parentable' => function (MorphTo $morphTo) {
            $morphTo->morphWith([
                Event::class => ['calendar'],
                Photo::class => ['tags'],
                Post::class => ['author'],
            ]);
        }])->get();
```

<a name="eager-loading-specific-columns"></a>
#### Carregamento ansioso de colunas específicas

Pode ser que você nem sempre precise de todas as colunas nas relações recuperadas. Por esse motivo, o Eloquent permite especificar quais colunas da relação deseja recuperar:

```php
    $books = Book::with('author:id,name,book_id')->get();
```

> [! ATENÇÃO]
> Quando utiliza esta funcionalidade, deve incluir sempre a coluna "id" e quaisquer colunas de chaves estrangeiras relevantes na lista de colunas que pretende recuperar.

<a name="eager-loading-by-default"></a>
#### Carregamento ávido por omissão

Por vezes, pode pretender sempre carregar algumas relações quando recupera um modelo. Para o efeito, poderá definir uma propriedade `$with` no modelo:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Book extends Model
    {
        /**
         * The relationships that should always be loaded.
         *
         * @var array
         */
        protected $with = ['author'];

        /**
         * Get the author that wrote the book.
         */
        public function author(): BelongsTo
        {
            return $this->belongsTo(Author::class);
        }

        /**
         * Get the genre of the book.
         */
        public function genre(): BelongsTo
        {
            return $this->belongsTo(Genre::class);
        }
    }
```

Se você deseja remover um item da propriedade `$with` para uma consulta única, você pode usar o método `without`:

```php
    $books = Book::without('author')->get();
```

Se você quiser substituir todos os itens dentro da propriedade `$with` para uma única consulta, poderá usar o método `withOnly`:

```php
    $books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
### Constrangendo as Cargas Impacientes

Por vezes, pode pretender carregar um relacionamento de forma eficiente, mas também especificar condições de consulta adicionais para a consulta de carregamento eficiente. Pode executar esta operação ao passar um array de relações ao método `with`, em que a chave do array é o nome da relação e o valor do array é um fecho que acrescenta restrições adicionais à consulta de carregamento eficiente:

```php
    use App\Models\User;
    use Illuminate\Contracts\Database\Eloquent\Builder;

    $users = User::with(['posts' => function (Builder $query) {
        $query->where('title', 'like', '%code%');
    }])->get();
```

Neste exemplo, o Eloquent somente fará um carregamento avidamente dos posts onde a coluna `title` (título em português) do post contém a palavra "código". Você pode chamar outros métodos [gerador de consultas](/docs/queries) para personalizar ainda mais a operação de carregamento avidamente:

```php
    $users = User::with(['posts' => function (Builder $query) {
        $query->orderBy('created_at', 'desc');
    }])->get();
```

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### Restringindo a carga ansiosa de relacionamentos `morphTo`

Se você estiver ansioso para carregar um relacionamento de "morphTo", o Eloquent fará várias consultas para recuperar cada tipo de modelo relacionado. Você pode adicionar restrições extras a cada uma dessas consultas usando o método constrain da relação de "MorphTo":

```php
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    $comments = Comment::with(['commentable' => function (MorphTo $morphTo) {
        $morphTo->constrain([
            Post::class => function ($query) {
                $query->whereNull('hidden_at');
            },
            Video::class => function ($query) {
                $query->where('type', 'educational');
            },
        ]);
    }])->get();
```

Neste exemplo, o Eloquent somente fará o carregamento antecipado de posts que não foram ocultados e de vídeos cujo valor de `type` é "educacional".

<a name="constraining-eager-loads-with-relationship-existence"></a>
#### Restringindo carregamentos ávidos com a existência de relacionamento

Por vezes, pode ser necessário verificar a existência de um relacionamento e simultaneamente carregá-lo com base nas mesmas condições. Por exemplo, pode pretender apenas recuperar modelos `User` que tenham modelos filhos `Post` que correspondam a uma determinada condição de pesquisa e ao mesmo tempo carregar os posts correspondentes na operação inicial. Pode realizar isto utilizando o método `withWhereHas`.

```php
    use App\Models\User;

    $users = User::withWhereHas('posts', function ($query) {
        $query->where('featured', true);
    })->get();
```

<a name="lazy-eager-loading"></a>
### Carregamento preguiçoso e ansioso

Algumas vezes pode ser necessário carregar uma relação de forma avida após o modelo pai já ter sido recuperado. Por exemplo, isto pode ser útil se você precisar decidir dinamicamente se deve carregar os modelos relacionados:

```php
    use App\Models\Book;

    $books = Book::all();

    if ($someCondition) {
        $books->load('author', 'publisher');
    }
```

Se você precisar definir restrições de consulta adicionais para a consulta de carregamento antecipado, pode passar um array contendo as chaves das relações que deseja carregar. Os valores do array devem ser instâncias de closure que recebam a instância da consulta:

```php
    $author->load(['books' => function (Builder $query) {
        $query->orderBy('published_date', 'asc');
    }]);
```

Para carregar um relacionamento somente quando ele ainda não tiver sido carregado, utilize o método `loadMissing`:

```php
    $book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
#### Carregamento preguiçoso e otimizado aninhado e o `morphTo`

Se você quiser carregar ansiosamente um relacionamento `morphTo`, bem como os relacionamentos aninhados nas várias entidades que podem ser retornadas por esse relacionamento, você pode usar o método `loadMorph`.

Este método aceita o nome do relacionamento `morphTo` como primeiro argumento e um array de pares modelo/relação como segundo argumento. Para ajudar na ilustração deste método, vamos considerar o seguinte modelo:

```php
    <?php

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\MorphTo;

    class ActivityFeed extends Model
    {
        /**
         * Get the parent of the activity feed record.
         */
        public function parentable(): MorphTo
        {
            return $this->morphTo();
        }
    }
```

Neste exemplo, vamos assumir que os modelos Evento, Foto e Postagem podem criar modelos AtividadeFeed. Adicionalmente, vamos supor que os modelos Evento pertencem a um modelo Calendário, as fotos são associadas com os modelos de tag e as postagens pertencem ao modelo Autor.

Usando essas definições de modelo e relacionamentos, podemos recuperar instâncias do modelo `ActivityFeed` e carregar ansiosamente todos os modelos `parentables`, bem como seus respectivos relacionamentos aninhados:

```php
    $activities = ActivityFeed::with('parentable')
        ->get()
        ->loadMorph('parentable', [
            Event::class => ['calendar'],
            Photo::class => ['tags'],
            Post::class => ['author'],
        ]);
```

<a name="preventing-lazy-loading"></a>
### Impedindo a preguiçosa carga

Como discutido anteriormente, as relações de loading ansioso muitas vezes podem fornecer benefícios significativos ao desempenho da sua aplicação. Portanto, se você quiser, pode instruir o Laravel para evitar sempre o carregamento preguiçoso das relações. Para fazer isso, você pode invocar o método `preventLazyLoading` oferecido pela classe de modelo básico Eloquent. Normalmente, você deve chamar esse método no método `boot` da sua classe `AppServiceProvider`.

O método `preventLazyLoading` aceita um argumento booleano opcional que indica se o carregamento preguiçoso deve ser impedido. Por exemplo, você pode desejar desabilitar apenas o carregamento preguiçoso em ambientes que não são de produção para que seu ambiente de produção continue funcionando normalmente mesmo se uma relação carregada preguiçosamente estiver presente acidentalmente no código de produção:

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

Depois de impedir o carregamento preguiçoso, o Eloquent lançará uma exceção `Illuminate\Database\LazyLoadingViolationException` quando sua aplicação tenta carregar preguiçosamente qualquer relacionamento com Eloquent.

Pode personalizar o comportamento das violações de carregamento progressivo usando o método `handleLazyLoadingViolationsUsing`. Por exemplo, com este método, pode instruir as violações de carregamento progressivo para serem apenas registadas em vez de interromper a execução da aplicação com exceções:

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## Inserindo e Atualizando Modelos Relacionados

<a name="the-save-method"></a>
### O método "save"

O Eloquent fornece métodos convenientes para adicionar novos modelos a relacionamentos. Por exemplo, talvez você precise adicionar um novo comentário em uma postagem. Em vez de definir manualmente o atributo `post_id` no modelo `Comment`, você pode inserir o comentário usando o método `save` do relacionamento:

```php
    use App\Models\Comment;
    use App\Models\Post;

    $comment = new Comment(['message' => 'A new comment.']);

    $post = Post::find(1);

    $post->comments()->save($comment);
```

Note que não acessamos o relacionamento `comments` como uma propriedade dinâmica. Em vez disso, chamamos o método `comments` para obter uma instância do relacionamento. O método `save` irá adicionar automaticamente o valor adequado de `post_id` ao novo modelo `Comment`.

Se você precisar salvar vários modelos relacionados, poderá usar o método `saveMany`:

```php
    $post = Post::find(1);

    $post->comments()->saveMany([
        new Comment(['message' => 'A new comment.']),
        new Comment(['message' => 'Another new comment.']),
    ]);
```

Os métodos `save` e `saveMany` irão persistir as instâncias de modelo dadas mas não adicionarão os modelos recém-persistentes a nenhuma relação na memória que esteja já carregada no modelo pai. Se pretender aceder à relação após utilizar os métodos `save` ou `saveMany`, poderá utilizar o método `refresh` para carregar novamente o modelo e as respetivas relações:

```php
    $post->comments()->save($comment);

    $post->refresh();

    // All comments, including the newly saved comment...
    $post->comments;
```

<a name="the-push-method"></a>
#### Salvando modelos e relacionamentos de forma recursiva

Se você quiser "salvar" o seu modelo e todos os seus relacionamentos associados, poderá usar o método "push". Neste exemplo, o modelo de `Post` será salvo, assim como seus comentários e os autores dos comentários:

```php
    $post = Post::find(1);

    $post->comments[0]->message = 'Message';
    $post->comments[0]->author->name = 'Author Name';

    $post->push();
```

O método `pushQuietly` pode ser utilizado para guardar um modelo e as suas associações sem disparar nenhum evento:

```php
    $post->pushQuietly();
```

<a name="the-create-method"></a>
### O método "create" (criar)

Além dos métodos `save` e `saveMany`, você também pode usar o método `create`, que aceita um array de atributos, cria um modelo e o inserta no banco de dados. A diferença entre `save` e `create` é que `save` aceita uma instância completa do modelo Eloquent enquanto `create` aceita um simples array PHP. O novo modelo criado será devolvido pelo método `create`.

```php
    use App\Models\Post;

    $post = Post::find(1);

    $comment = $post->comments()->create([
        'message' => 'A new comment.',
    ]);
```

Você pode utilizar o método `createMany` para criar vários modelos relacionados:

```php
    $post = Post::find(1);

    $post->comments()->createMany([
        ['message' => 'A new comment.'],
        ['message' => 'Another new comment.'],
    ]);
```

Os métodos `createQuietly` e `createManyQuietly` podem ser utilizados para criar um ou vários modelos sem disparar quaisquer eventos:

```php
    $user = User::find(1);

    $user->posts()->createQuietly([
        'title' => 'Post title.',
    ]);
    
    $user->posts()->createManyQuietly([
        ['title' => 'First post.'],
        ['title' => 'Second post.'],
    ]);
```

Você também pode usar os métodos `findOrNew`, `firstOrNew`, `firstOrCreate` e `updateOrCreate` para [criar e atualizar modelos em relacionamentos](/docs/eloquent#upserts).

> [!NOTA]
> Antes de usar o método `create`, revise a documentação sobre [atribuição em massa](/docs/eloquent#mass-assignment).

<a name="updating-belongs-to-relationships"></a>
### Pertence a relações

Se quiser atribuir um modelo de criança para um novo modelo pai, pode utilizar o método "associate". Neste exemplo, o modelo `User` define uma relação `belongsTo` para o modelo `Account`. Este método `associate` irá definir a chave estrangeira no modelo filho:

```php
    use App\Models\Account;

    $account = Account::find(10);

    $user->account()->associate($account);

    $user->save();
```

Para remover um modelo pai de um filho, pode usar o método `dissociate`. Este método irá definir a chave estrangeira da relação como `NULL`:

```php
    $user->account()->dissociate();

    $user->save();
```

<a name="updating-many-to-many-relationships"></a>
### Muitas relações múltiplas

<a name="attaching-detaching"></a>
#### Fixação/Desfixação

O Eloquent também fornece métodos para facilitar o trabalho com relações de muitos para muitos. Por exemplo, vamos imaginar que um usuário pode ter várias funções e uma função pode ter vários usuários. Você pode usar o método `attach` para anexar uma função a um usuário inserindo um registro na tabela intermediária do relacionamento:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->roles()->attach($roleId);
```

Ao associar um relacionamento a um modelo, você também pode passar uma matriz de dados adicionais que serão inseridos na tabela intermediária:

```php
    $user->roles()->attach($roleId, ['expires' => $expires]);
```

Às vezes pode ser necessário remover um papel de um usuário. Para remover um registro de muitos para muitos, use o método `detach`. O método `detach` exclui o registro apropriado da tabela intermediária; no entanto, ambos os modelos permanecerão no banco de dados.

```php
    // Detach a single role from the user...
    $user->roles()->detach($roleId);

    // Detach all roles from the user...
    $user->roles()->detach();
```

Por conveniência, `attach` e `detach` também aceitam matrizes de IDs como entrada:

```php
    $user = User::find(1);

    $user->roles()->detach([1, 2, 3]);

    $user->roles()->attach([
        1 => ['expires' => $expires],
        2 => ['expires' => $expires],
    ]);
```

<a name="syncing-associations"></a>
#### Associações de sincronização

Pode igualmente utilizar o método `sync` para construir associações de muitos para muitos. O método `sync` aceita uma matriz de identificadores a colocar na tabela intermédia. Todos os IDs que não estejam nesta matriz serão removidos da tabela intermédia. Assim, após a conclusão desta operação, só existirão na tabela intermédia os identificadores presentes na matriz fornecida:

```php
    $user->roles()->sync([1, 2, 3]);
```

Pode também passar outros valores de tabelas intermédias com os respetivos ID's:

```php
    $user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

Se você quiser inserir os mesmos valores da tabela intermediária em cada uma das IDs do modelo sincronizado, você pode usar o método `syncWithPivotValues`:

```php
    $user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

Se você não deseja remover os IDs existentes que estejam faltando no array dado, poderá usar o método `syncWithoutDetaching`:

```php
    $user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
#### Alternar associações

O relacionamento de muitos para muitos também fornece um método "toggle" que altera o status do acessório dos IDs de modelo relacionados. Se o ID dado estiver atualmente anexado, ele será desconectado. Da mesma forma, se estiver atualmente desconectado, ele será conectado:

```php
    $user->roles()->toggle([1, 2, 3]);
```

Também pode passar valores de tabela intermédios adicionais com os ID:

```php
    $user->roles()->toggle([
        1 => ['expires' => true],
        2 => ['expires' => true],
    ]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
#### Atualizando um Registo na Tabela Intermédia

Se você precisar atualizar uma linha existente na tabela intermediária do seu relacionamento, poderá utilizar o método `updateExistingPivot`. Esse método aceita a chave estrangeira do registro intermediário e um array de atributos para serem atualizados:

```php
    $user = User::find(1);

    $user->roles()->updateExistingPivot($roleId, [
        'active' => false,
    ]);
```

<a name="touching-parent-timestamps"></a>
## Tocando nas marcas de tempo do pai

Quando um modelo define uma relação "belongsTo" ou "belongsToMany" para outro modelo, como é o caso de um "Comment" que pertence a um "Post", por vezes é útil atualizar o timestamp do elemento pai quando o elemento filho for actualizado.

Por exemplo, quando um modelo `Comment` é atualizado, você pode querer automaticamente "tocar" o carimbo de tempo `updated_at` do `Post` proprietário para que seja definido na data e hora correntes. Para fazer isso, você pode adicionar uma propriedade `touches` ao seu modelo filho contendo os nomes dos relacionamentos que devem ter seus carimbos de tempo `updated_at` atualizados quando o modelo filho for atualizado:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Comment extends Model
    {
        /**
         * All of the relationships to be touched.
         *
         * @var array
         */
        protected $touches = ['post'];

        /**
         * Get the post that the comment belongs to.
         */
        public function post(): BelongsTo
        {
            return $this->belongsTo(Post::class);
        }
    }
```

> [!ATENÇÃO]
> Os timestamps do modelo pai somente serão atualizados se o modelo filho for atualizado utilizando o método `save` do Eloquent.
