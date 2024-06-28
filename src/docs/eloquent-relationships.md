# Eloquent: Relações

<a name="introduction"></a>
## Introdução

 Freqüentemente, as tabelas de uma base de dados são relacionadas entre si. Por exemplo, um post do blog pode ter muitos comentários ou uma ordem poder estar relacionada ao usuário que a efetuou. O Eloquent facilita o gerenciamento desses relacionamentos e suporta vários tipos de relações:

<div class="content-list" markdown="1">

 [Um a um]
 [Um para muitos]
 [ Muito a muito (m/m)
 (Um jogo terminou)
 [ Existe um monte de resultados (##has-many-through)
 [ Uma a uma (polimórfica)](#one-to-one-polymorphic-relations)
 [Um para Muitos (polimórfico) (#one-to-many-polymorphic-relations: none)]
 [Muitos para muitos (polimórficos)](#many-to-many-polymorphic-relations)

</div>

<a name="defining-relationships"></a>
## Definindo as relações

 Os relacionamentos são definidos como métodos nas classes de modelo Eloquent. Como os relacionamentos também servem como poderosos [construtores de consultas](/docs/queries), a definição dos relacionamentos como métodos oferece recursos poderosos para cadeias e consultas. Por exemplo, podemos definir restrições de consulta adicionais nesse relacionamento "posts":

```php
    $user->posts()->where('active', 1)->get();
```

 Mas antes de mergulharmos em como utilizar relacionamentos, vamos aprender a definir cada tipo de relacionamento suportado pelo Eloquent.

<a name="one-to-one"></a>
### Um contra um

 Uma relação de um a um é um tipo muito básico de relação de banco de dados. Por exemplo, um modelo `User` pode estar associado a um modelo `Phone`. Para definir essa relação, colocaremos um método `phone` no modelo `User`. O método `phone` deve chamar o método `hasOne` e retornar seu resultado. O método `hasOne` está disponível em seu modelo por meio da base de classe `Illuminate\Database\Eloquent\Model`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasOne;

    class User extends Model
    {
        /**
         * Get the phone associated with the user.
         */
        public function phone(): HasOne
        {
            return $this->hasOne(Phone::class);
        }
    }
```

 O primeiro argumento passado à método `hasOne` é o nome da classe do modelo relacionado. Uma vez definido o relacionamento, pode ser possível recuperar o registo associado utilizando propriedades dinâmicas de Eloquent. As propriedades dinâmicas permitem aceder aos métodos de relação como se fossem propriedades definidas no modelo:

```php
    $phone = User::find(1)->phone;
```

 A propriedade `belongsTo` especifica o modelo e a chave estrangeira da relação. Neste caso, assume-se automaticamente que o modelo `Phone` tem uma chave estrangeira chamada `user_id`. Se pretender substituir esta convenção, pode passar um segundo argumento à metoda `hasOne`:

```php
    return $this->hasOne(Phone::class, 'foreign_key');
```

 Além disso, o Eloquent pressupõe que a chave estrangeira deve possuir um valor correspondente à coluna de chave primária do pai. Em outras palavras, o Eloquent irá procurar pelo valor da coluna `id` no registo do `Phone`. Se pretender que a relação utilize outro valor de chave primária em vez do `id` ou da propriedade `$primaryKey` do modelo, pode passar um terceiro argumento à função `hasOne`:

```php
    return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### Definindo o inverso da relação

 Assim, podemos aceder ao modelo `Telefone` do nosso modelo `Usuário`. De seguida, defina uma relação no modelo `Telefone`, que permita-nos ter acesso ao utilizador proprietário do mesmo. Podemos definir o inverso de um relacionamento `hasOne` usando o método `belongsTo`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Phone extends Model
    {
        /**
         * Get the user that owns the phone.
         */
        public function user(): BelongsTo
        {
            return $this->belongsTo(User::class);
        }
    }
```

 Ao invocar o método `user`, o Eloquent tentará encontrar um modelo `User` que tenha um valor de `id` correspondente ao campo `user_id` do modelo `Phone`.

 A estrutura determina o nome do campo de chave estrangeira examinando o nome do método da relação e sufixa o nome do método com `_id`. Portanto, neste caso, a Eloquent assume que o modelo `Phone` tem uma coluna `user_id`. No entanto, se na modelagem de `Phone` não houver uma chave estrangeira chamada `user_id`, você poderá passar um nome da chave personalizado como segundo argumento para o método `belongsTo`:

```php
    /**
     * Get the user that owns the phone.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'foreign_key');
    }
```

 Se o modelo pai não usar `id` como chave primária ou se quiser encontrar o modelo associado utilizando uma coluna diferente, pode passar um terceiro argumento à função `belongsTo`, especificando a chave personalizada da tabela pai:

```php
    /**
     * Get the user that owns the phone.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
    }
```

<a name="one-to-many"></a>
### Um para Muitos

 Um relacionamento de um a muitos é usado para definir relacionamentos onde um modelo único é o pai de um ou mais modelos filhos. Por exemplo, uma postagem no blog pode ter um número infinito de comentários. Como todos os outros relacionamentos Eloquent, os relacionamentos de um a muitos são definidos pela definição de um método em seu modelo Eloquent:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasMany;

    class Post extends Model
    {
        /**
         * Get the comments for the blog post.
         */
        public function comments(): HasMany
        {
            return $this->hasMany(Comment::class);
        }
    }
```

 Lembre-se de que o Eloquent irá determinar automaticamente a coluna chave estrangeira correta para o modelo "Comentário". Por convenção, o Eloquent irá utilizar o nome do modelo principal com formato "snake case" e anexará ao final "_id". Desta forma, neste exemplo, o Eloquent assume que a coluna chave estrangeira no modelo "Comentário" é "post_id".

 Definida a relação de método, podemos aceder à coleção [de comentários relacionados](/docs/eloquent-collections) através da propriedade `comments`. Tenha em mente que, uma vez que Eloquent oferece "propriedades dinâmicas de relações", podemos acessar métodos de relação como se fossem definidas como propriedades no modelo:

```php
    use App\Models\Post;

    $comments = Post::find(1)->comments;

    foreach ($comments as $comment) {
        // ...
    }
```

 Como todos os relacionamentos servem também como construtores de consulta, você pode adicionar novas restrições à consulta de relacionamento chamando o método `comments` e continuando a acumular condições na consulta:

```php
    $comment = Post::find(1)->comments()
                        ->where('title', 'foo')
                        ->first();
```

 Assim como no método `hasOne`, você também pode reaproveitar as chaves estrangeira e local passando argumentos adicionais ao método `hasMany`:

```php
    return $this->hasMany(Comment::class, 'foreign_key');

    return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="one-to-many-inverse"></a>
### Um a muitos (inverso) / pertence a

 Agora que podemos aceder a todos os comentários de um artigo, vamos definir uma relação para permitir que um comentário possa ter acesso ao seu post principal. Para definir o inverso de uma relação `hasMany`, defina um método de relação no modelo filho que chame o método `belongsTo`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Comment extends Model
    {
        /**
         * Get the post that owns the comment.
         */
        public function post(): BelongsTo
        {
            return $this->belongsTo(Post::class);
        }
    }
```

 Definida a relação, podemos recuperar um comentário de uma publicação através da propriedade dinâmica do relacionamento "post" como se segue:

```php
    use App\Models\Comment;

    $comment = Comment::find(1);

    return $comment->post->title;
```

 No exemplo acima, o Eloquent tentará encontrar um modelo Post que tenha uma id igual à coluna post_id do modelo Comment.

 O módulo Eloquent determina o nome padrão do elo estrangeiro ao examinar o nome do método de relacionamento e adicionar um sufixo composto pelo nome do método com um `_` seguido do nome da coluna principal do modelo pai. Assim, neste exemplo, o Eloquent assumirá que a chave estrangeira do modelo `Post` na tabela `comments` é `post_id`.

 No entanto, se a chave estrangeira da sua relação não seguir estas convenções, podem ser passadas como segundo argumento à função `belongsTo` o nome da chave estrangeira personalizado:

```php
    /**
     * Get the post that owns the comment.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'foreign_key');
    }
```

 Se o modelo de pai não usar "id" como chave primária ou se pretender encontrar o modelo associado através de uma coluna diferente, poderá passar um terceiro argumento para a função `belongsTo`, especificando a chave personalizada da sua tabela:

```php
    /**
     * Get the post that owns the comment.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
    }
```

<a name="default-models"></a>
#### Modelos Padrão

 As relações `belongsTo`, `hasOne`, `hasOneThrough` e `morphOne` permitem definir um modelo padrão que será retornado caso a relação for `null`. Normalmente, este padrão é referido como o [padrão Objeto Nulo](https://pt.wikipedia.org/wiki/Null_Object_pattern) e pode ajudar a remover verificações condicionais no seu código. No exemplo seguinte, a relação `user` retornará um modelo vazio `App\Models\User` caso nenhum usuário esteja anexado ao modelo `Post`:

```php
    /**
     * Get the author of the post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault();
    }
```

 Para preencher o modelo padrão com atributos, você pode passar um array ou uma cláusula para a metodologia `withDefault`:

```php
    /**
     * Get the author of the post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault([
            'name' => 'Guest Author',
        ]);
    }

    /**
     * Get the author of the post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault(function (User $user, Post $post) {
            $user->name = 'Guest Author';
        });
    }
```

<a name="querying-belongs-to-relationships"></a>
#### Consultar pertencimento de relações

 Ao buscar os filhos de um relacionamento "appertente a", você pode construir manualmente a cláusula `where` para recuperar os modelos Eloquent correspondentes.

```php
    use App\Models\Post;

    $posts = Post::where('user_id', $user->id)->get();
```

 No entanto, você pode achar mais conveniente usar o método `whereBelongsTo`, que irá determinar automaticamente a relação e chave estrangeira adequadas para o modelo indicado:

```php
    $posts = Post::whereBelongsTo($user)->get();
```

 Você também pode passar uma instância de coleção para o método `whereBelongsTo`. Nesse caso, o Laravel recuperará os modelos que pertencem a qualquer um dos modelos-pais dentro da coleção:

```php
    $users = User::where('vip', true)->get();

    $posts = Post::whereBelongsTo($users)->get();
```

 Por padrão, o Laravel determinará a relação associada com o modelo dado com base no nome da classe do modelo. No entanto, você pode especificar o nome da relação manualmente fornecendo-o como o segundo argumento do método `whereBelongsTo`:

```php
    $posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
### Tem um de muitos

 Às vezes um modelo pode ter muitos modelos relacionados, mas você quer recuperar facilmente o "mais recente" ou "mais antigo" modelo relacionado da relação. Por exemplo, um modelo `User` pode estar relacionado a muitos modelos `Order`, mas você deseja definir uma forma conveniente de interagir com as últimas ordens que o usuário tenha feito. Isto é possível fazendo combinando o tipo de relação `hasOne` com os métodos `ofMany`:

```php
/**
 * Get the user's most recent order.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

 Da mesma forma, você pode definir um método para obter o modelo relacionado mais "antigo" ou primeiro:

```php
/**
 * Get the user's oldest order.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

 Por padrão, os métodos `latestOfMany` e `oldestOfMany` recuperarão o modelo relacionado mais recente ou mais antigo com base na chave primária do modelo, que deve ser ordenável. No entanto, por vezes poderá pretender obter um único modelo de uma relação maior utilizando critérios diferentes de ordenação.

 Por exemplo, usando o método `ofMany`, você pode obter a ordem mais cara do usuário. O método `ofMany` aceita a coluna filável como seu primeiro argumento e qual função agregada (`min` ou `max`) aplicar ao consultar o modelo relacionado:

```php
/**
 * Get the user's largest order.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

 > [Atenção]
 > Como o PostgreSQL não suporta a execução da função `MAX` contra colunas de UUID, atualmente não é possível utilizar relacionamentos um-entre-muitos em combinação com as colunas do tipo UUID do PostgreSQL.

<a name="converting-many-relationships-to-has-one-relationships"></a>
#### Conversão de relações em "Tem Uma"

 Muitas vezes, ao recuperar um único modelo usando os métodos `latestOfMany`, `oldestOfMany` ou `ofMany`, você já tem uma relação "pode ter muitos" definida para o mesmo modelo. Por conveniência, o Laravel permite converter facilmente essa relação em uma relação "tem um" chamando o método `one` na relação:

```php
/**
 * Get the user's orders.
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

/**
 * Get the user's largest order.
 */
public function largestOrder(): HasOne
{
    return $this->orders()->one()->ofMany('price', 'max');
}
```

<a name="advanced-has-one-of-many-relationships"></a>
#### Avançado tem uma de muitas relações

 É possível construir relações mais avançadas de "tem muitos". Por exemplo, um modelo `Product` pode ter vários modelos associados `Price` que são mantidos no sistema mesmo depois da publicação de novas taxas. Além disso, é possível publicar dados de novas taxas para o produto antecipadamente, para efeitos a partir de uma data futura através de uma coluna `published_at`.

 Então, resumindo, precisamos recuperar os preços mais recentes onde a data de publicação não esteja no futuro. Além disso, se dois preços tiverem uma mesma data de publicação, preferimos o preço com o maior ID. Para conseguir isso, devemos passar um array para o método `ofMany` que contém as colunas classificáveis que determinam o preço mais recente. Além disso, será fornecida uma função como segundo argumento do método `ofMany`. Essa função será responsável por adicionar restrições de data de publicação adicionais à consulta de relacionamento:

```php
/**
 * Get the current pricing for the product.
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
### Tem um meio de transporte

 A relação de tipo "has-one-through" define uma relação de um para um com outro modelo. No entanto, essa relação indica que o modelo declarador pode ser emparelhado com uma instância do outro modelo _através_ de um terceiro modelo.

 Por exemplo, numa aplicação de reparação de veículos, cada modelo "Mecânico" pode estar associado a um modelo "Automóvel". Cada modelo "Automóvel" pode estar associado a um modelo "Proprietário". Embora o mecânico e o proprietário não tenham uma relação direta na base de dados, o mecânico pode ter acesso ao proprietário _através_ do modelo "Automóvel". Vejamos as tabelas necessárias para definir esta relação:

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

 Agora que examinamos a estrutura da tabela para o relacionamento, definamos o relacionamento no modelo `Mechanic`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasOneThrough;

    class Mechanic extends Model
    {
        /**
         * Get the car's owner.
         */
        public function carOwner(): HasOneThrough
        {
            return $this->hasOneThrough(Owner::class, Car::class);
        }
    }
```

 O primeiro parâmetro passado à metodologia `hasOneThrough` é o nome do modelo final que pretendemos aceder, enquanto o segundo parâmetro é o nome do modelo intermédio.

 Ou, se as relações relevantes já tiverem sido definidas em todos os modelos envolvidos nesta relação, podem ser definidas sem problemas uma "has-one-through" relacionando o modelo mecânico e o proprietário. Por exemplo, se o modelo mecânico tem uma relação "cars" (carros) e o modelo car tem uma relação "owner" (proprietário), pode definir uma relação "has-one-through", ligando o mecânico ao proprietário, da seguinte forma:

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

<a name="has-one-through-key-conventions"></a>
#### Convenções Fundamentais

 Serão utilizadas convenções típicas de chave estrangeira Eloquent ao realizar consultas relacionais. Se desejar personalizar as chaves do relacionamento, você poderá passar como o terceiro e quarto argumentos para o método `hasOneThrough`. O terceiro argumento é o nome da chave estrangeira no modelo intermediário. O quarto argumento é o nome da chave estrangeira no modelo final. O quinto argumento é a chave local, enquanto o sexto argumento é a chave local do modelo intermediário:

```php
    class Mechanic extends Model
    {
        /**
         * Get the car's owner.
         */
        public function carOwner(): HasOneThrough
        {
            return $this->hasOneThrough(
                Owner::class,
                Car::class,
                'mechanic_id', // Foreign key on the cars table...
                'car_id', // Foreign key on the owners table...
                'id', // Local key on the mechanics table...
                'id' // Local key on the cars table...
            );
        }
    }
```

 Ou, como discutido anteriormente, se as relações relevantes já tiverem sido definidas em todos os modelos envolvidos na relação, você pode definir uma relação "one-to-many" por meio do invocação do método `through` e o fornecimento dos nomes dessas relações. Esta abordagem oferece a vantagem da reutilização das convenções de chave já definidas nas relações existentes:

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>
### Tem muitas exceções

 O relacionamento "has-many-through" oferece uma maneira conveniente de acessar relações distantes por meio de uma relação intermediária. Por exemplo, suponhamos que estejamos construindo uma plataforma de implantação como [Laravel Vapor](https://vapor.laravel.com). Um modelo `Project` pode acessar muitos modelos `Deployment`, por meio de um modelo intermediário `Environment`. Usando esse exemplo, você poderia facilmente coletar todas as implantações para um determinado projeto. Vejamos as tabelas necessárias para definir essa relação:

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

 Agora que estudamos a estrutura da tabela para o relacionamento, vamos definir o relacionamento no modelo `Project`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\HasManyThrough;

    class Project extends Model
    {
        /**
         * Get all of the deployments for the project.
         */
        public function deployments(): HasManyThrough
        {
            return $this->hasManyThrough(Deployment::class, Environment::class);
        }
    }
```

 O primeiro argumento passado para o método `hasManyThrough` é o nome do modelo final que pretendemos aceder, enquanto o segundo argumento é o nome do modelo intermediário.

 Ou se as relações relevantes já tiverem sido definidas em todos os modelos envolvidos na relação, poderá definir uma relação "múltiplo através de" invocando o método `through` e fornecendo os nomes dessas relações. Por exemplo, se o modelo `Project` tiver uma relação `environments` (ambientes) e o modelo `Environment` tiver uma relação `deployments` (implantações), pode definir uma relação "múltiplo através de" que estabeleça a ligação entre projetos e implantações do seguinte modo:

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

 Embora a tabela do modelo `Deployment` não contenha uma coluna `project_id`, a relação `hasManyThrough` fornece acesso às implantações de um projeto por meio de `$project->deployments`. Para recuperar esses modelos, o Eloquent inspeciona a coluna `project_id` na tabela do modelo intermediário `Environment`. Após encontrar os IDs relevantes de ambiente, eles são usados para consultar a tabela do modelo `Deployment`.

<a name="has-many-through-key-conventions"></a>
#### Convenções-chave

 As convenções típicas de chave estrangeira do Eloquent serão usadas ao realizar consultas da relação. Se quiser personalizar as chaves da relação, você pode passá-las como o terceiro e quarto argumentos para a função `hasManyThrough`. O terceiro argumento é o nome da chave estrangeira no modelo intermediário. O quarto argumento é o nome da chave estrangeira no modelo final. O quinto argumento é a chave local, enquanto o sexto argumento é a chave local do modelo intermediário:

```php
    class Project extends Model
    {
        public function deployments(): HasManyThrough
        {
            return $this->hasManyThrough(
                Deployment::class,
                Environment::class,
                'project_id', // Foreign key on the environments table...
                'environment_id', // Foreign key on the deployments table...
                'id', // Local key on the projects table...
                'id' // Local key on the environments table...
            );
        }
    }
```

 Ou, como foi discutido anteriormente, se as relações relevantes já tiverem sido definidas em todos os modelos envolvidos na relação, você pode definir uma relação "has-many-through" invocando o método `through` e fornecendo os nomes dessas relações. Essa abordagem oferece a vantagem de reutilizar as convenções chave já definidas nas relações existentes:

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

<a name="many-to-many"></a>
## Muitos para muitos relacionamentos

 Relações de muitos-para-muitos são ligeiramente mais complicadas do que relações `hasOne` e `hasMany`. Um exemplo de uma relação de muitos-para-muitos é um usuário que tem vários papéis, mas estes papéis também são partilhados por outros usuários na aplicação. Por exemplo, pode ser atribuído o papel de "Autor" e "Editor" a um usuário; no entanto, estes papéis também podem ser atribuídos a outros usuários. Assim, um usuário tem vários papéis e um papel tem vários usuários.

<a name="many-to-many-table-structure"></a>
#### Estrutura da tabela

 Para definir essa relação, são necessárias três tabelas do banco de dados: `users`, `roles` e `role_user`. A tabela `role_user` é derivada da ordem alfabética dos nomes dos modelos relacionados e contém as colunas `user_id` e `role_id`. Essa tabela é usada como uma tabela intermediária que liga os usuários aos papéis.

 Recordemos que uma função pode pertencer a muitos usuários e não podemos simplesmente colocar uma coluna `user_id` na tabela `roles`. Isso significaria que uma função só poderia pertencer a um único usuário. Para oferecer suporte à atribuição de funções a vários usuários, é necessária a tabela `role_user`. Podemos resumir a estrutura da tabela do relacionamento assim:

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
#### Estrutura Modelo

 As relações muitos-para-muitos são definidas escrevendo um método que retorne o resultado do método `belongsToMany`. O método `belongsToMany` é fornecido pela classe de base `Illuminate\Database\Eloquent\Model`, que é usada por todos os modelos Eloquent da sua aplicação. Por exemplo, vamos definir um método `roles` no modelo `User`. O primeiro argumento passado para este método é o nome da classe do modelo relacionado:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsToMany;

    class User extends Model
    {
        /**
         * The roles that belong to the user.
         */
        public function roles(): BelongsToMany
        {
            return $this->belongsToMany(Role::class);
        }
    }
```

 Definido o relacionamento, você pode acessar os papéis do usuário usando a propriedade de relação dinâmica `roles`:

```php
    use App\Models\User;

    $user = User::find(1);

    foreach ($user->roles as $role) {
        // ...
    }
```

 Uma vez que todos os relacionamentos também servem como construtores de consultas, você pode adicionar novas restrições às consultas de relacionamento chamando o método `roles` e continuando a concatenar condições na consulta:

```php
    $roles = User::find(1)->roles()->orderBy('name')->get();
```

 Para determinar o nome da tabela da tabela intermediária do relacionamento, Eloquent unirá os dois nomes dos modelos relacionados em ordem alfabética. No entanto, você está livre para reverter essa convenção. Você pode fazer isso passando um segundo argumento ao método `belongsToMany`:

```php
    return $this->belongsToMany(Role::class, 'role_user');
```

 Além de personalizar o nome da tabela intermediária, você pode também customizar os nomes das colunas dos chaves da tabela passando um número adicional de argumentos para a método `belongsToMany`. O terceiro argumento é o nome da chave estrangeira do modelo no qual você está definindo o relacionamento, enquanto o quarto argumento é o nome da chave estrangeira do modelo com que você estará se relacionando:

```php
    return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### Como definir o inverso da relação

 Para definir o "inverso" de um relacionamento muitos-para-muitos, você deve definir um método no modelo relacionado que também retorne o resultado do método `belongsToMany`. Para completar nosso exemplo entre usuários e funções, vamos definir o método `users` no modelo `Role`:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsToMany;

    class Role extends Model
    {
        /**
         * The users that belong to the role.
         */
        public function users(): BelongsToMany
        {
            return $this->belongsToMany(User::class);
        }
    }
```

 Como você pode ver, o relacionamento é definido exatamente da mesma forma que seu homólogo no modelo `User`, com a exceção de referenciar o modelo `App\Models\User`. Uma vez que estamos reutilizando o método `belongsToMany`, todas as opções de personalização de tabela e chave normais estão disponíveis ao definir a "inversa" de relacionamentos de muitos para muitos.

<a name="retrieving-intermediate-table-columns"></a>
### Recuperando colunas da tabela intermediária

 Como já foi mencionado, trabalhar com relações de muitos-a-muitos exige a presença de uma tabela intermediária. Eloquent fornece várias formas muito úteis para interagir com essa tabela. Assumamos que nosso modelo `User` tem muitos modelos `Role` relacionados. Após acessar essa relação, podemos acessar a tabela intermediária usando o atributo `pivot` dos modelos:

```php
    use App\Models\User;

    $user = User::find(1);

    foreach ($user->roles as $role) {
        echo $role->pivot->created_at;
    }
```

 Note que cada modelo de `Role` que recuperarmos será automaticamente atribuído um atributo `pivot`. Esse atributo contém um modelo representando a tabela intermediária.

 Por padrão, somente as chaves do modelo estarão no modelo `pivot`. Se sua tabela intermediária conter atributos adicionais, você deve especificá-los ao definir a relação.

```php
    return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

 Se você quiser que a tabela intermediária tenha as marcas de tempo `created_at` e `updated_at`, cujas atualizações serão mantidas automaticamente pelo Eloquent, chame o método `withTimestamps` ao definir a relação:

```php
    return $this->belongsToMany(Role::class)->withTimestamps();
```

 > [!AVISO]
 As tabelas intermediárias que utilizam os marcadores de data e hora mantidos automaticamente pela Eloquent devem ter colunas marcador de data e hora tanto para 'created_at' como para 'updated_at'.

<a name="customizing-the-pivot-attribute-name"></a>
#### Personalizar o nome do atributo `pivot

 Como observado anteriormente, os atributos da tabela intermediária podem ser acessados em modelos via o atributo `pivot`. No entanto, você tem liberdade para customizar o nome desse atributo de modo que melhor reflita sua finalidade na aplicação.

 Por exemplo, se a sua aplicação incluir utilizadores que possam subscrever podcasts, terá provavelmente uma relação muitos-para-muitos entre utilizadores e podcasts. Neste caso, poderá preferir renomear o atributo da tabela intermédia para `subscrição` em vez de `pivot`. Isto pode ser feito usando a metodologia `as` ao definir a relação:

```php
    return $this->belongsToMany(Podcast::class)
                    ->as('subscription')
                    ->withTimestamps();
```

 Após especificar o atributo de tabela intermediária personalizada, você poderá acessar os dados da tabela intermediária utilizando seu nome personalizado:

```php
    $users = User::with('podcasts')->get();

    foreach ($users->flatMap->podcasts as $podcast) {
        echo $podcast->subscription->created_at;
    }
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
### Filtragem de consultas por meio dos campos da tabela intermediária

 Também é possível filtrar os resultados de consultas de relação `belongsToMany`, usando os métodos `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull` e `wherePivotNotNull` ao definir a relação.

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
### Pedido de consultas por intermédio das colunas da tabela intermediária

 Você pode ordenar os resultados retornados pelas consultas de relacionamentos `belongsToMany`, usando o método `orderByPivot`. No exemplo a seguir, buscaremos todos os últimos emblemas do usuário:

```php
    return $this->belongsToMany(Badge::class)
                    ->where('rank', 'gold')
                    ->orderByPivot('created_at', 'desc');
```

<a name="defining-custom-intermediate-table-models"></a>
### Definindo modelos de tabelas intermediárias personalizadas

 Se desejar definir um modelo personalizado para representar a tabela intermediária da sua relação de muitos para muitos, você pode chamar o método `using` quando definir a relação. Os modelos pivot personalizados oferecem a oportunidade de definir um comportamento adicional no modelo pivot, como métodos e conversões.

 Os modelos de pivô personalizados muitos-a-muitos devem estender a classe `Illuminate\Database\Eloquent\Relations\Pivot`, enquanto os modelos de pivô polimórficos muitos-a-múltiplos personalizados devem estender a classe `Illuminate\Database\Eloquent\Relations\MorphPivot`. Por exemplo, podemos definir um modelo chamado "Role" (Função) que usa um modelo de pivô "RoleUser" (Usuário da função):

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsToMany;

    class Role extends Model
    {
        /**
         * The users that belong to the role.
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

 > [AVERIGEMENTO]
 > Não é possível usar a característica `SoftDeletes` em modelos de pivô. Se precisar excluir pivôs com suavidade, considere converter seu modelo de pivô para um modelo Eloquent real.

<a name="custom-pivot-models-and-incrementing-ids"></a>
#### Modelos Pivô Personalizados e Codificação de IDs

 Se você tiver definido um relacionamento muitos para muitos que utiliza um modelo de pivô personalizado e esse modelo de pivô possuir uma chave primária com incremento automático, certifique-se de que sua classe do modelo de pivô personalizada defina uma propriedade `incrementing`, definida como `true`.

```php
    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = true;
```

<a name="polymorphic-relationships"></a>
## Relações Polimórficas

 Uma relação polimórfica permite que o modelo de um determinado objeto pertença a mais do que um tipo de modelo usando uma associação única. Por exemplo, imagine que está construindo um aplicativo que permita aos utilizadores partilharem postagens de blog e vídeos. Neste caso, é possível que um "Comentário" pertença a ambos os modelos "Post" e "Vídeo".

<a name="one-to-one-polymorphic-relations"></a>
### Um a um (polimórfico)

<a name="one-to-one-polymorphic-table-structure"></a>
#### Estrutura da tabela

 Uma relação polimórfica de um para um é semelhante à uma relação típica de um para um; contudo, o modelo filho pode pertencer a mais do que um tipo de modelo usando uma associação única. Por exemplo, um blog `Post` e um `User` podem compartilhar uma relação polimórfica com um modelo `Image`. Usar uma relação polimórfica de um para um permite ter uma única tabela de imagens exclusivas que podem ser associadas a posts e usuários. Primeiro, examinemos a estrutura da tabela:

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

 Observe as colunas `imageable_id` e `imageable_type` na tabela `images`. A coluna `imageable_id` contém o valor do ID do post ou usuário, enquanto a coluna `imageable_type` contém o nome da classe do modelo pai. A coluna `imageable_type` é utilizada pelo Eloquent para determinar qual "tipo" de modelo pai retornará ao acessar a relação `imageable`. Neste caso, a coluna teria como conteúdo ou `App\Models\Post` ou `App\Models\User`.

<a name="one-to-one-polymorphic-model-structure"></a>
#### Estrutura do Modelo

 Em seguida, analisemos as definições do modelo necessárias para construir essa relação:

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
#### Recuperar o relacionamento

 Depois que sua tabela de banco de dados e modelos estiverem definidos, você poderá acessar os relacionamentos por meio dos seus modelos. Por exemplo, para recuperar a imagem de uma postagem, podemos acessar a propriedade de relação dinâmica `image`:

```php
    use App\Models\Post;

    $post = Post::find(1);

    $image = $post->image;
```

 Você pode recuperar o progenitor do modelo polimórfico acessando o nome do método que realiza a chamada para `morphTo`. Nesse caso, esse é o método `imageable` no modelo `Image`. Assim, poderemos acessá-lo como uma propriedade de relação dinâmica:

```php
    use App\Models\Image;

    $image = Image::find(1);

    $imageable = $image->imageable;
```

 A relação `imageable` no modelo `Image` irá retornar uma instância de `Post` ou `User`, dependendo de qual tipo de modelo possui a imagem.

<a name="morph-one-to-one-key-conventions"></a>
#### Convenções importantes

 Caso necessite, você poderá especificar o nome das colunas "id" e "type" utilizadas pelo modelo filho polimórfico. Se fizer isso, certifique-se de que sempre passará o nome da relação como primeiro argumento ao método `morphTo`. Normalmente, esse valor deve corresponder ao nome do método; por conseguinte, você pode usar a constante `__FUNCTION__` do PHP:

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
### De um para muitos (polimórfico)

<a name="one-to-many-polymorphic-table-structure"></a>
#### Estrutura da Tabela

 Uma relação polimórfica de um para muitos é semelhante a uma relação típica de um para muitos; no entanto, o modelo filho pode pertencer a mais do que um tipo de modelo utilizando uma única associação. Por exemplo, imagine que os usuários da sua aplicação podem "comentar" em posts e vídeos. Usando relações polimórficas, você pode usar uma única tabela `comments` para conter comentários de ambos post e vídeo. Primeiro, vamos examinar a estrutura da tabela necessária para construir esta relação:

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

 Em seguida, vamos examinar as definições do modelo necessárias para construir essa relação:

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

 Depois de definir sua tabela e modelos, você poderá acessar as relações através dos seus respectivos atributos dinâmicos. Por exemplo, para acessar todos os comentários de um post, podemos usar o atributo dinâmico `comments`:

```php
    use App\Models\Post;

    $post = Post::find(1);

    foreach ($post->comments as $comment) {
        // ...
    }
```

 Você também pode recuperar o pai de um modelo filho polimórfico acessando o nome do método que executa a chamada para `morphTo`. Nesse caso, esse é o método `commentable` no modelo `Comment`. Então, acessaremos esse método como uma propriedade dinâmica de relacionamento para acessar o modelo pai do comentário:

```php
    use App\Models\Comment;

    $comment = Comment::find(1);

    $commentable = $comment->commentable;
```

 A relação `commentable`, no modelo `Comment`, irá retornar uma instância de `Post` ou `Video`, dependendo do tipo do modelo ser o pai daquele comentário.

<a name="one-of-many-polymorphic-relations"></a>
### Uma entre muitas (polimórfica)

 Às vezes, um modelo pode ter muitos modelos relacionados, mas você deseja recuperar facilmente o modelo relacionado "mais recente" ou "mais antigo". Por exemplo, o modelo `User` pode ser relacionado a vários modelos `Image`, mas é preciso definir uma maneira conveniente de interagir com a imagem mais recente enviada pelo usuário. Você pode fazer isso usando o tipo de relação `morphOne` combinado com os métodos `ofMany`:

```php
/**
 * Get the user's most recent image.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

 Da mesma forma que você pode definir um método para recuperar o "mais antigo" ou primeiro modelo relacionado de uma relação.

```php
/**
 * Get the user's oldest image.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

 Por padrão, os métodos `latestOfMany` e `oldestOfMany` recuperam o último ou primeiro modelo relacionado com base na chave primária do modelo, que deve ser classificável. No entanto, às vezes pode querer recuperar um único modelo de uma relação maior usando critérios de classificação diferentes.

 Por exemplo, usando o método `ofMany`, você poderá obter a imagem mais "curtida" do usuário. O método `ofMany` aceita como primeiro argumento uma coluna que possui filtros e qual função agregada aplicar ao fazer consultas aos modelos relacionados:

```php
/**
 * Get the user's most popular image.
 */
public function bestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

 > [!AVISO]
 [ possuí um dos muitos documentos (#advanced-has-one-of-many-relationships)].

<a name="many-to-many-polymorphic-relations"></a>
### Muitos para muitos (polimórfico)

<a name="many-to-many-polymorphic-table-structure"></a>
#### Estrutura da tabela

 As relações polimórficas de muitos-para-muitos são ligeiramente mais complicadas que as relações "morfar um" e "morfar vários". Por exemplo, os modelos `Post` e `Video` poderiam partilhar uma relação polimórfica com o modelo `Tag`. A utilização de uma relação polimórfica de muitos-para-muitos nesta situação permitiria à aplicação ter uma única tabela de tags exclusivas que possam ser associadas a posts ou vídeos. Primeiro, analisamos a estrutura da tabela necessária para criar essas relações:

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

 > [!NOTA]
 [Relacionamentos de muitos para muitos] (#many-to-many).

<a name="many-to-many-polymorphic-model-structure"></a>
#### Estrutura do modelo

 Próximamente, estamos prontos para definir as relações nos modelos. Os modelos `Post` e `Video` conterão ambos um método `tags`, que chama o método `morphToMany` fornecido pela classe de modelo Eloquent base.

 O método `morphToMany` aceita o nome do modelo relacionado, bem como o "nome da relação". Com base no nome que atribuímos ao nosso nome de tabela intermediária e às chaves contidas, faremos referência à relação como "taggable":

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

 Em seguida, no modelo `Tag`, você deve definir um método para cada um dos seus modelos pais possíveis. Assim, neste exemplo, vamos definir o método `posts` e o método `videos`. Os dois métodos devem retornar o resultado do método `morphedByMany`.

 O método `morphedByMany` aceita o nome do modelo relacionado, assim como o nome da "relação". Com base no nome que atribuímos ao nosso nome de tabela intermediária e as chaves que contém, referimo-nos à relação como "taggable":

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
#### Recuperando o relacionamento

 Depois que sua tabela e modelos de banco de dados estiverem definidos, você poderá acessar as relações através dos seus modelos. Por exemplo, para acessar todas as etiquetas de um post, você pode usar o campo de relacionamento dinâmico "tags":

```php
    use App\Models\Post;

    $post = Post::find(1);

    foreach ($post->tags as $tag) {
        // ...
    }
```
 Você pode recuperar o parente de uma relação polimórfica a partir do modelo filho polimórfico acessando o nome da metoda que executa a chamada para `morphedByMany`. Nesse caso, isso é o método `posts` ou `videos` no modelo `Tag`:

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

 Por padrão, o Laravel utilizará a classe totalmente qualificada para armazenar o "tipo" do modelo relacionado. Por exemplo, no exemplo de relação um-para-muitos acima em que um modelo `Comment` pode pertencer a um modelo `Post` ou `Video`, o tipo padrão será `App\Models\Post` ou `App\Models\Video`, respectivamente. No entanto, poderá querer desvincular estes valores da estrutura interna do seu aplicativo.

 Por exemplo, ao invés de usar os nomes do modelo como o tipo, poderíamos utilizar simples strings, como `post` e `video`. Isso significa que os valores dos campos "tipo" polimórficos em nosso banco de dados permanecerão válidos mesmo se os modelos forem renomeados:

```php
    use Illuminate\Database\Eloquent\Relations\Relation;

    Relation::enforceMorphMap([
        'post' => 'App\Models\Post',
        'video' => 'App\Models\Video',
    ]);
```

 Você pode chamar o método `enforceMorphMap` no método `boot` da sua classe `App\Providers\AppServiceProvider`, ou criar um provedor de serviços separado se desejar.

 Você pode determinar o alias de morfologia de um modelo dado em tempo de execução usando o método do modelo `getMorphClass`. Inversamente, você pode determinar o nome completo da classe associada a um alias de morfologia usando o método `Relation::getMorphedModel`:

```php
    use Illuminate\Database\Eloquent\Relations\Relation;

    $alias = $post->getMorphClass();

    $class = Relation::getMorphedModel($alias);
```

 > [AVERIGEMENTO]
 > Ao adicionar um "mapa de transformação" ao seu aplicativo existente, cada valor da coluna `*_type` que ainda contiver uma classe totalmente qualificada precisará ser convertida para o nome do "mapa".

<a name="dynamic-relationships"></a>
### Relações Dinâmicas

 Você pode usar o método `resolveRelationUsing` para definir relações entre modelos Eloquent no momento do uso. Embora não seja recomendável em desenvolvimento de aplicativos normais, isso pode ser útil ocasionalmente quando estiver desenvolvendo pacotes Laravel.

 O método `resolveRelationUsing` aceita o nome da relação desejada como primeiro argumento. O segundo argumento passado ao método deve ser um fecho que aceite a instância do modelo e retorne uma definição de relação Eloquent válida. Normalmente, você deve configurar as relações dinâmicas dentro do método `boot` de um [fornecedor do serviço](/docs/providers):

```php
    use App\Models\Order;
    use App\Models\Customer;

    Order::resolveRelationUsing('customer', function (Order $orderModel) {
        return $orderModel->belongsTo(Customer::class, 'customer_id');
    });
```

 > [AVISO]
 > Ao definir relações dinâmicas, será sempre necessário fornecer argumentos explícitos para o nome das chaves nas várias funções de relação de Eloquent.

<a name="querying-relations"></a>
## Consulta de relações

 Uma vez que todas as relações Eloquent são definidas por meio de métodos, você pode chamar esses métodos para obter uma instância da relação sem executar realmente a consulta para carregar os modelos relacionados. Além disso, todos os tipos de relações Eloquent também funcionam como [construtores de consultas](/docs/queries), permitindo que você continue acoplando restrições à consulta da relação antes de executar a última consulta SQL contra seu banco de dados.

 Por exemplo, imagine um aplicativo de blog em que o modelo `User` tem vários modelos `Post` associados:

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

 Pode consultar a relação `posts` e adicionar restrições adicionais à relação da seguinte forma:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->posts()->where('active', 1)->get();
```

 Você é capaz de usar qualquer um dos métodos do [construtora de consulta Laravel](/docs/queries), então certifique-se de explorar a documentação sobre o construtor de consultas para aprender todos os métodos que estão disponíveis para você.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### Usar cadeias de cláusulas WHERE após relacionamentos

 Como demonstrado no exemplo acima, você está livre para adicionar restrições adicionais às relações ao consultá-las. No entanto, tenha cuidado ao concatenar cláusulas `orWhere` em uma relação, pois as cláusulas `orWhere` serão agrupadas logicamente no mesmo nível da restrição de relação:

```php
    $user->posts()
            ->where('active', 1)
            ->orWhere('votes', '>=', 100)
            ->get();
```

 O exemplo acima gerará o seguinte SQL. Como você pode ver, a cláusula `ou` instrui a consulta a retornar qualquer postagem com mais de 100 votos. A consulta não está mais restrita a um usuário específico:

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

 Na maioria dos casos, você deve usar um grupo lógico [enquadrando consultas entre parênteses](/docs/queries#logical-grouping) para agrupar as verificações condicionais:

```php
    use Illuminate\Database\Eloquent\Builder;

    $user->posts()
            ->where(function (Builder $query) {
                return $query->where('active', 1)
                             ->orWhere('votes', '>=', 100);
            })
            ->get();
```

 O exemplo acima irá produzir o seguinte SQL. Notem que a agrupamento lógico organizou corretamente os constrangimentos e a consulta continua condicionada a um utilizador específico:

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### Métodos de Relação x Propriedades Dinâmicas

 Se você não precisar adicionar restrições extras à uma consulta de relação Eloquent, poderá acessar o relacionamento como se fosse um atributo. Por exemplo, continuando com os exemplos de modelos `User` e `Post`, podemos obter todos os posts de um usuário da seguinte maneira:

```php
    use App\Models\User;

    $user = User::find(1);

    foreach ($user->posts as $post) {
        // ...
    }
```

 As propriedades de relacionamento dinâmicas realizam um "carregamento adiado", o que significa que só carregarão os dados de relacionamento quando você realmente os acessar. Devido a isso, os desenvolvedores costumam usar o [carregamento ansioso (eager loading) (#eager-loading) para pré-carregar os relacionamentos que sabem que serão acessados depois do carregamento do modelo. O carregamento ansioso proporciona uma redução significativa nas consultas SQL que devem ser executadas para carregar as relações de um modelo.

<a name="querying-relationship-existence"></a>
### Verificar a existência de uma relação

 Ao recuperar registos de modelos, poderá ser necessário limitar os resultados com base na existência de uma relação. Por exemplo, suponham que pretenda recuperar todos os artigos de blog que tenham, pelo menos, um comentário. Para o fazer, pode passar o nome da relação aos métodos `has` e `orHas`:

```php
    use App\Models\Post;

    // Retrieve all posts that have at least one comment...
    $posts = Post::has('comments')->get();
```

 Você também pode especificar um operador e um valor para contagem, para personalizar a consulta ainda mais:

```php
    // Retrieve all posts that have three or more comments...
    $posts = Post::has('comments', '>=', 3)->get();
```

 As instruções "has" aninhadas podem ser construídas com a notação de ponto. Por exemplo, pode-se recuperar todas as publicações que têm pelo menos um comentário que tenha pelo menos uma imagem:

```php
    // Retrieve posts that have at least one comment with images...
    $posts = Post::has('comments.images')->get();
```

 Se precisar de ainda mais poder, você pode usar os métodos `whereHas` e `orWhereHas` para definir restrições de consulta adicionais nas suas consultas `has`, como inspecionando o conteúdo de um comentário:

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
 O Eloquent atualmente não oferece suporte a consultas de existência de relação em bancos de dados diferentes. As relações devem existir no mesmo banco de dados.

<a name="inline-relationship-existence-queries"></a>
#### Consultas de existência de relações em linha

 Se você quiser obter a existência de um relacionamento com uma condição onde simples e única ligada à consulta do relacionamento, poderá considerar mais conveniente utilizar os métodos `whereRelation`, `orWhereRelation`, `whereMorphRelation`e `orWhereMorphRelation`. Por exemplo, podemos buscar todos os posts que têm comentários não aprovados:

```php
    use App\Models\Post;

    $posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

 Como os métodos de consulta do Query Builder, você também pode especificar um operador:

```php
    $posts = Post::whereRelation(
        'comments', 'created_at', '>=', now()->subHour()
    )->get();
```
<a name="querying-relationship-absence"></a>
### O ausência de relacionamento

 Ao recuperar registos de modelos, pode pretender limitar os resultados com base na ausência de uma relação. Por exemplo, imagine que pretende recuperar todas as postagens de blog que **não** têm comentários. Para tal, poderá passar o nome da relação para a metodologia `doesntHave` e `orDoesntHave`:

```php
    use App\Models\Post;

    $posts = Post::doesntHave('comments')->get();
```

 Se você precisar de ainda mais poder, poderá usar os métodos `whereDoesntHave` e `orWhereDoesntHave` para adicionar restrições de consulta adicionais às suas consultas `doesntHave`, como verificar o conteúdo de um comentário:

```php
    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::whereDoesntHave('comments', function (Builder $query) {
        $query->where('content', 'like', 'code%');
    })->get();
```

 É possível utilizar a notação "dot" para executar uma consulta contra uma relação aninhada. Por exemplo, a seguinte consulta recuperará todos os posts que não tenham comentários; contudo, posts que tenham comentários de autores que não estejam banidos serão incluídos nos resultados:

```php
    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
        $query->where('banned', 0);
    })->get();
```

<a name="querying-morph-to-relationships"></a>
### Consultar relações de Morph To Relationships

 Para consultar a existência de relações "morph_to", poderá utilizar os métodos `whereHasMorph` e `whereDoesntHaveMorph`. Estes métodos aceitam como primeiro argumento o nome da relação. Em seguida, aceitam as designações dos modelos relacionados que pretende incluir na consulta. Pode ainda fornecer um fecho que personaliza a consulta de relações:

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

 Ocasionalmente, poderá ser necessário adicionar restrições de consulta com base no “tipo” do modelo polimórfico relacionado. A função fechada passada para a `whereHasMorph` pode receber um valor `$type` como seu segundo argumento. Este argumento permite inspecionar o "tipo" da consulta que está sendo construída:

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
#### Consultar todos os modelos relacionados

 Em vez de passar um array de modelos potencialmente polimórficos, você pode fornecer `*` como valor wildcard. Isso indicará ao Laravel que recuperará todos os tipos polimórficos possíveis do banco de dados. O Laravel executará uma consulta adicional para realizar essa operação:

```php
    use Illuminate\Database\Eloquent\Builder;

    $comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
        $query->where('title', 'like', 'foo%');
    })->get();
```

<a name="aggregating-related-models"></a>
## Agregar modelos relacionados

<a name="counting-related-models"></a>
### Modelos relacionados com contagem

 Às vezes você pode querer contar o número de modelos relacionados com uma relação específica sem carregar os modelos em si. Para fazer isso, você poderá usar o método `withCount`. O método `withCount` irá colocar um atributo `{relation}_count" no resultado dos modelos:

```php
    use App\Models\Post;

    $posts = Post::withCount('comments')->get();

    foreach ($posts as $post) {
        echo $post->comments_count;
    }
```

 Ao passar um array para o método `withCount`, você poderá adicionar "contagens" para várias relações assim como adicionar restrições adicionais às consultas:

```php
    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
        $query->where('content', 'like', 'code%');
    }])->get();

    echo $posts[0]->votes_count;
    echo $posts[0]->comments_count;
```

 Você também pode usar o alias para contagem de relações, permitindo várias contagens da mesma relação:

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
#### Carregamento de contagem diferida

 Usando o método `load_count`, você pode carregar um relacionamento após o modelo pai já ter sido recuperado:

```php
    $book = Book::first();

    $book->loadCount('genres');
```

 Se você precisar definir restrições de consulta adicionais na consulta por contagem, poderá passar uma matriz chaveada pelas relações que deseja contar. Os valores da matriz devem ser fechamentos que recebam a instância do construtor de consulta:

```php
    $book->loadCount(['reviews' => function (Builder $query) {
        $query->where('rating', 5);
    }])
```

<a name="relationship-counting-and-custom-select-statements"></a>
#### Recuento de relações e instruções personalizadas de seleção

 Se você estiver combinando `withCount` com uma instrução `select`, certifique-se de que chama o `withCount` depois do método `select`:

```php
    $posts = Post::select(['title', 'body'])
                    ->withCount('comments')
                    ->get();
```

<a name="other-aggregate-functions"></a>
### Outras funções agregadas

 Além do método `withCount`, o Eloquent oferece os métodos `withMin`, `withMax`, `withAvg`, `withSum` e `withExists`. Esses métodos irão adicionar um atributo `{relation}_{function}_{column}` aos modelos resultantes:

```php
    use App\Models\Post;

    $posts = Post::withSum('comments', 'votes')->get();

    foreach ($posts as $post) {
        echo $post->comments_sum_votes;
    }
```

 Se pretender aceder ao resultado da função agregada utilizando outro nome, pode especificar o seu próprio aliado:

```php
    $posts = Post::withSum('comments as total_comments', 'votes')->get();

    foreach ($posts as $post) {
        echo $post->total_comments;
    }
```

 Como o método `loadCount`, estão também disponíveis versões pendentes destes métodos. Estas operações agregadas adicionais podem ser executadas em modelos Eloquent que já foram recuperados:

```php
    $post = Post::first();

    $post->loadSum('comments', 'votes');
```

 Se estiver a combinar estas funcionalidades de agregação com uma instrução `select`, certifique-se de chamar as funções de agregação após a instrução `select`:

```php
    $posts = Post::select(['title', 'body'])
                    ->withExists('comments')
                    ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
### Contagem de modelos relacionados com a relação Morph to Relationships

 Se desejar carregar uma relação de "morfologia para" com antecedência e também a contagem de modelos relacionados para as várias entidades que podem ser retornadas por essa relação, poderá utilizar o método `with` em combinação com o método `morphWithCount` da relação de "morfologia para".

 Neste exemplo, suponha que os modelos `Foto` e `Publicação` podem criar modelos de `FeedAtividade`. Suponhamos que o modelo de `FeedAtividade` defina uma relação de "morfologia para" chamada `parentable`, que nos permita recuperar o modelo de `Foto` ou `Post` pai para uma instância de `FeedAtividade` dada. Além disso, suponhamos que os modelos `Foto` tenham vários modelos de `Tag` e que os modelos `Publicação` tenham vários modelos de `Comentário`.

 Agora, imagine que queremos recuperar as instâncias de `ActivityFeed` e carregar de forma ansiosa os modelos pai `parentable`. Além disso, queremos obter o número de tags associadas a cada foto do pai e o número de comentários associados ao post do pai.

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
#### Carregamento de Contagem Retardada

 Vamos supor que já tenhamos obtido um conjunto de modelos `ActivityFeed` e agora queremos carregar os números das relações aninhadas para os vários modelos `parentable` associados aos feeds da atividade. Pode usar o método `loadMorphCount` para conseguir isto:

```php
    $activities = ActivityFeed::with('parentable')->get();

    $activities->loadMorphCount('parentable', [
        Photo::class => ['tags'],
        Post::class => ['comments'],
    ]);
```

<a name="eager-loading"></a>
## Carregamento ansioso

 Ao acessar relações do Eloquent como propriedades, os modelos relacionados são "carregados apenas quando necessário". Isso significa que os dados da relação não são realmente carregados até que você acesse primeiramente a propriedade. No entanto, o Eloquent pode carregar relações imediatamente no momento em que consulta o modelo principal. O carregamento antecipado alivia o problema de consultas "N + 1". Para ilustrar o problema das consultas "N + 1", considere um modelo `Book` que "aparta-se" a um modelo `Author`:

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

 Agora, recuperemos todos os livros e seus autores:

```php
    use App\Models\Book;

    $books = Book::all();

    foreach ($books as $book) {
        echo $book->author->name;
    }
```

 Este loop executa uma consulta para recuperar todos os livros na tabela de banco de dados e outra consulta para cada livro, a fim de recuperar o autor do livro. Assim, se tivermos 25 livros, o código acima executará 26 consultas: uma para o livro original e mais 25 consultas adicionais para obter o autor de cada livro.

 Felizmente, podemos usar o eager loading para reduzir essa operação para apenas duas consultas. Ao construir uma consulta, você pode especificar quais relacionamentos devem ser carregados com antecedência usando o método `with`:

```php
    $books = Book::with('author')->get();

    foreach ($books as $book) {
        echo $book->author->name;
    }
```

 Para essa operação serão executadas apenas duas consultas – uma consulta para recuperar todos os livros e outra consulta para recuperar todos os autores de todos os livros:

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
#### Carga ansiosa de múltiplas relações

 Às vezes, você pode precisar carregar vários relacionamentos em uma única requisição. Para isso, basta passar um array de relacionamentos para o método `with`:

```php
    $books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
#### Carregamento ansioso aninhado

 Para carregar as relações de uma relação, você pode usar a sintaxe "ponto". Por exemplo, para carregar todos os autores do livro e todos os contatos pessoais do autor, use a seguinte sintaxe:

```php
    $books = Book::with('author.contacts')->get();
```

 Como alternativa, você pode especificar relações carregadas com antecedência aninhadas fornecendo um array aninhado para o método `with`, que pode ser conveniente quando se deseja carregar antecipadamente várias relações aninhadas:

```php
    $books = Book::with([
        'author' => [
            'contacts',
            'publisher',
        ],
    ])->get();
```

<a name="nested-eager-loading-morphto-relationships"></a>
#### Inclua relações com `morphTo` em carregamento aninhado

 Para carregar com ávida ambição uma relação `morphTo`, bem como relações aninhadas nas várias entidades que podem ser retornadas por essa relação, é possível utilizar o método `with` em combinação com o método `morphWith` da relação `morphTo`. Para ajudar a ilustrar esse método, considere-se o seguinte modelo:

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

 Neste exemplo, vamos supor que os modelos Event, Photo e Post possam criar modelos ActivityFeed. Além disso, vamos supor que os modelos Event pertençam a um modelo Calendar, os modelos Photo sejam associados a modelos Tag e os modelos Post pertençam a um modelo Author.

 Usando essas definições de modelo e relações, podemos recuperar as instâncias do modelo `ActivityFeed` e carregar todos os modelos `parentable` e suas respectivas relações aninhadas.

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
#### Carga ávida de colunas específicas

 Nem sempre você pode precisar de todas as colunas das relações que estará recuperando. Por esta razão, o Eloquent permite a especificação de quais colunas da relação deseja recuperar:

```php
    $books = Book::with('author:id,name,book_id')->get();
```

 > [AVISO]
 > Ao usar este recurso, você deve sempre incluir a coluna `id` e todas as colunas de chave estrangeira relevantes na lista de colunas que deseja recuperar.

<a name="eager-loading-by-default"></a>
#### Carga ansiosa por padrão

 Às vezes você pode querer carregar sempre alguns relacionamentos ao recuperar um modelo. Para conseguir isso, você pode definir uma propriedade "$with" no modelo:

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

 Se quiser remover um item da propriedade `$with` para uma única consulta, poderá usar o método `without`:

```php
    $books = Book::without('author')->get();
```

 Se você deseja ignorar itens de propriedade de "$with" para uma única consulta, utilize o método "withOnly":

```php
    $books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
### Restringindo carregamentos ansiosos

 Às vezes, poderá pretender carregar relações rapidamente, mas também especificar condições de pesquisa adicionais para a consulta de carga rápida. Pode fazer isto passando um array de relações ao método `with`, em que o nome do array é um nome de relação e o valor do array é uma função que adiciona restrições adicionais à consulta de carregamento rápido:

```php
    use App\Models\User;
    use Illuminate\Contracts\Database\Eloquent\Builder;

    $users = User::with(['posts' => function (Builder $query) {
        $query->where('title', 'like', '%code%');
    }])->get();
```

 Neste exemplo, o Eloquent carregará anexos somente se a coluna `title` do post tiver a palavra "code". Você pode chamar outras [métodos de construção de consulta](/docs/queries) para customizar ainda mais a operação de carga intensiva:

```php
    $users = User::with(['posts' => function (Builder $query) {
        $query->orderBy('created_at', 'desc');
    }])->get();
```

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### Limitar o carregamento ansioso de relações `morphTo`

 Se você estiver carregando uma relação de "morphTo", o Eloquent executará várias consultas para recuperar cada tipo de modelo relacionado. Você pode adicionar restrições adicionais a cada uma dessas consultas usando o método `MorphTo` da relação:

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

 Nesse exemplo, o Eloquent carregará somente itens que não foram ocultados e vídeos com um valor de `type` igual a "educacional".

<a name="constraining-eager-loads-with-relationship-existence"></a>
#### Limitando as carregamentos ansiosos com a existência de relações

 Você pode, às vezes, precisar verificar se existe uma relação ao mesmo tempo que carga a relação com base nas mesmas condições. Por exemplo, você deseja recuperar apenas modelos de usuários com modelos filhos `Post` correspondentes para uma determinada condição de consulta e, ao mesmo tempo, carregar as postagens correspondentes. Você pode fazer isso utilizando o método `withWhereHas`:

```php
    use App\Models\User;

    $users = User::withWhereHas('posts', function ($query) {
        $query->where('featured', true);
    })->get();
```

<a name="lazy-eager-loading"></a>
### Carregamento ávido preguiçoso

 Às vezes você pode precisar carregar um relacionamento de maneira ansiosa após o modelo pai já ter sido recuperado. Por exemplo, isto pode ser útil se você for obrigado a decidir dinamicamente se deve ou não carregar modelos relacionados:

```php
    use App\Models\Book;

    $books = Book::all();

    if ($someCondition) {
        $books->load('author', 'publisher');
    }
```

 Se necessitar definir restrições de consulta adicionais na consulta com carregamento eficiente, pode fornecer um array enunciado pelas relações que pretende carregar. Os valores do array devem ser instâncias de fecho que recebam a instancia da query:

```php
    $author->load(['books' => function (Builder $query) {
        $query->orderBy('published_date', 'asc');
    }]);
```

 Para carregar uma relação apenas quando ela não tiver sido ainda carregada, utilize o método `loadMissing`:

```php
    $book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
#### Carregamento Lento Inferior com Recursão e `morphTo`

 Se pretender carregar rapidamente uma relação de "morphTo", assim como relações aninhadas nas várias entidades que possam ser retornadas por essa relação, poderá utilizar o método `loadMorph`.

 Este método aceita o nome do relacionamento `morphTo` como primeiro argumento e um conjunto de pares de modelo/relacionamentos como seu segundo argumento. Para ajudar a ilustrar este método, considere o seguinte modelo:

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

 Neste exemplo, suponhamos que os modelos `Evento`, `Foto` e `Publicação` tenham capacidade para criar modelos `FeedAtividades`. Além disso, suponhamos que os modelos de `Evento` pertençam ao modelo `Calendário`, os modelos de `Foto` estejam associados a modelos de `Tag` e os modelos de `Publicação` pertençam ao modelo de `Autor`.

 Usando essas definições de modelo e relações, podemos recuperar as instâncias do modelo `ActivityFeed` e carregar ansiosamente todos os modelos `parentable` (com relação de parentesco) e suas respectivas relações aninhadas:

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
### Impedindo o carregamento lento

 Como discutido anteriormente, relações de carga ansiosa podem oferecer significativo benefício em termos de desempenho para sua aplicação. Portanto, se você quiser, poderá instruir o Laravel a impedir sempre a carga laxista de relações. Para isso, convocar o método `preventLazyLoading` oferecido pela base da classe do modelo Eloquent. Tipicamente, você deve chamar esse método dentro do método `boot` do seu `AppServiceProvider` aplicativo.

 O método `preventLazyLoading` aceita um parâmetro booleano opcional que indica se o carregamento lento deve ser impedido. Por exemplo, você pode querer desativar apenas o carregamento lento em ambientes de produção para que seu ambiente de produção continue funcionando normalmente mesmo que uma relação carregada lentamente esteja acidentalmente presente no código de produção:

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

 Depois de impedir o carregamento "lazy" (delegado), a classe Eloquent lançará uma exceção `Illuminate\Database\LazyLoadingViolationException` quando sua aplicação tentar carregar "pending" (pendentes) relações Eloquent.

 Você pode personalizar o comportamento das violações de carregamento indolor usando o método `handleLazyLoadingViolationsUsing`. Por exemplo, usando esse método, você poderá instruir que as violações só sejam registradas em vez de interromper a execução da aplicação com exceções:

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## Inserção e atualização de modelos relacionados

<a name="the-save-method"></a>
### O método `save`

 O Eloquent fornece métodos convenientes para adicionar novos modelos à relações. Por exemplo, talvez seja necessário adicionar um novo comentário a um post. Em vez de definir manualmente o atributo `post_id` no modelo `Comment`, é possível inserir o comentário usando o método `save` da relação:

```php
    use App\Models\Comment;
    use App\Models\Post;

    $comment = new Comment(['message' => 'A new comment.']);

    $post = Post::find(1);

    $post->comments()->save($comment);
```

 Observe que não acessamos a relação `comments` como uma propriedade dinâmica, mas invocamos o método `comments` para obtermos uma instância da relação. O método `save` adiciona automaticamente o valor correto de `post_id` ao novo modelo `Comment`.

 Se você precisa salvar vários modelos relacionados, pode usar o método `saveMany`:

```php
    $post = Post::find(1);

    $post->comments()->saveMany([
        new Comment(['message' => 'A new comment.']),
        new Comment(['message' => 'Another new comment.']),
    ]);
```

 As métodos `save` e `saveMany` persistirão as instâncias dos modelos fornecidos, mas não adicionarão os novos modelos persistentados a relações que já tenham sido carregadas no modelo pai. Se pretende aceder à relação depois de utilizar os métodos `save` ou `saveMany`, pode ser útil utilizar o método `refresh` para relodar o modelo e suas relações:

```php
    $post->comments()->save($comment);

    $post->refresh();

    // All comments, including the newly saved comment...
    $post->comments;
```

<a name="the-push-method"></a>
#### Salvar recursivamente modelos e relacionamentos

 Se você quiser "salvar" seu modelo e todos os relacionamentos associados, poderá usar o método `push`. Nesse exemplo, o modelo `Post` será salvo, bem como seus comentários e os autores dos comentários:

```php
    $post = Post::find(1);

    $post->comments[0]->message = 'Message';
    $post->comments[0]->author->name = 'Author Name';

    $post->push();
```

 O método `pushQuietly` pode ser utilizado para salvar um modelo e as suas relações associadas sem gerar quaisquer eventos.

```php
    $post->pushQuietly();
```

<a name="the-create-method"></a>
### O método `create`

 Além dos métodos `salvar` e `salvarMuitos`, você também pode usar o método `criar`, que aceita um array de atributos, cria um modelo e o insere no banco de dados. A diferença entre `salvar` e `criar` é que `salvar` aceita uma instância completa do modelo Eloquent enquanto `criar` aceita um simples array em PHP. O modelo recém-criado será retornado pelo método `criar`:

```php
    use App\Models\Post;

    $post = Post::find(1);

    $comment = $post->comments()->create([
        'message' => 'A new comment.',
    ]);
```

 Você pode usar o método `createMany` para criar vários modelos relacionados:

```php
    $post = Post::find(1);

    $post->comments()->createMany([
        ['message' => 'A new comment.'],
        ['message' => 'Another new comment.'],
    ]);
```

 Os métodos `createQuietly` e `createManyQuietly` podem ser usados para criar um modelo sem despachar quaisquer eventos:

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

 Você também pode usar os métodos `findOrNew`, `firstOrNew`, `firstOrCreate`, e `updateOrCreate` para criar e atualizar modelos de relacionamentos.

 > [!OBSERVAÇÃO]
 Documentação sobre [Atribuição de dados em massa](/docs/eloquent#mass-assignment).

<a name="updating-belongs-to-relationships"></a>
### Pertence a Relações

 Se você deseja atribuir um modelo de filho a um novo modelo de pai, poderá usar o método `associate`. Nesse exemplo, o modelo User define uma relação belongsTo ao modelo Account. Esse método associar definirá a chave estrangeira no modelo filho:

```php
    use App\Models\Account;

    $account = Account::find(10);

    $user->account()->associate($account);

    $user->save();
```

 Para remover um modelo pai de um modelo filho, você pode usar o método `dissociate`. Este método definirá como `nulo` a chave estrangeira da relação.

```php
    $user->account()->dissociate();

    $user->save();
```

<a name="updating-many-to-many-relationships"></a>
### Relações de muitos para muitos

<a name="attaching-detaching"></a>
#### Anexar/Desanexar

 O Eloquent também disponibiliza métodos para tornar o trabalho com relacionamentos muitos-para-muitos mais conveniente. Por exemplo, imagine que um usuário pode ter vários papéis e que um papel pode ter vários usuários. Você poderá usar o método `attach` (anexar) para anexar um papel a um usuário inserindo um registro na tabela intermediária do relacionamento:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->roles()->attach($roleId);
```

 Ao associar uma relação com um modelo, é possível também transmitir uma matriz de dados adicionais que serão inseridos na tabela intermediária:

```php
    $user->roles()->attach($roleId, ['expires' => $expires]);
```

 Às vezes poderá ser necessário remover uma função de um utilizador. Para remover os registos da relação muitodominio-a-múltiplos, utilize o método `detach`. O método `detach` irá eliminar o registo correspondente na tabela intermediária; no entanto, ambos os modelos permanecerão na base de dados:

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

 É possível usar o método `sync` para construir associações many-to-many. O método `sync` aceita um array de IDs que devem ser colocados na tabela intermediária. Os IDs não incluídos no array fornecido serão removidos da tabela intermediária. Assim, após a conclusão dessa operação, apenas os IDs incluídos no array fornecido existirão na tabela intermediária:

```php
    $user->roles()->sync([1, 2, 3]);
```

 Você pode também passar valores de tabelas intermediárias adicionais com os IDs:

```php
    $user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

 Se pretender inserir os mesmos valores de tabela intermediária para cada um dos ID's do modelo sincronizado, poderá utilizar o método `syncWithPivotValues`:

```php
    $user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

 Se você não quiser separar os IDs existentes que faltam no conjunto dado, poderá usar o método `syncWithoutDetaching`:

```php
    $user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
#### Alternar associações

 O relacionamento de muitos-para-muitos também fornece um método `toggle` que "alterna" o estado de anexação dos IDs do modelo relacionado especificados. Se o ID for atualmente anexado, ele será desanexado; da mesma forma, se estiver atualmente desanexado, será anexado:

```php
    $user->roles()->toggle([1, 2, 3]);
```

 Você também pode passar valores de tabelas intermediárias adicionais com os IDs:

```php
    $user->roles()->toggle([
        1 => ['expires' => true],
        2 => ['expires' => true],
    ]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
#### Atualizar um registo na tabela intermédia

 Se você precisar atualizar uma linha existente na tabela intermediária de seu relacionamento, poderá usar o método `updateExistingPivot`. Este método aceita o chave estrangeira do registro intermediário e um array de atributos a serem atualizados:

```php
    $user = User::find(1);

    $user->roles()->updateExistingPivot($roleId, [
        'active' => false,
    ]);
```

<a name="touching-parent-timestamps"></a>
## Tocar os atalhos de tempo dos pais

 Quando um modelo define uma relação `belongsTo` ou `belongsToMany` para outro modelo, como um `Comentário` que pertence a um `Post`, às vezes é útil atualizar o horário/data do pai quando o modelo filho for atualizado.

 Por exemplo, quando um modelo de comentário é atualizado, poderá ser desejável "tocar" automaticamente a marcação de data e hora (`updated_at`) do post pertencente para que esta seja definida na data e hora atuais. Para conseguir isso, pode adicionar uma propriedade `touches` ao seu modelo filho que contenha os nomes das relações cujas marcações de data e hora (`updated_at`) devem ser atualizadas quando o modelo filho é atualizado:

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
 > Os atalhos dos pais só serão atualizados se o atalho filho for atualizado usando a metodologia de armazenamento do Eloquent.
