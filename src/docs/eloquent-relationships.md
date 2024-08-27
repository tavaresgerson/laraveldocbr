# Elocução: Relações

<a name="introduction"></a>
## Introdução

Tabelas de banco de dados geralmente são relacionadas umas com as outras. Por exemplo, um post em um blog pode ter vários comentários ou um pedido poderia ser relacionado ao usuário que o colocou. Eloquent torna fácil gerenciar e trabalhar com essas relações, e suporta uma variedade de relações comuns:

<div class="content-list" markdown="1">

Um para um
[Um Para Muitos](#one-to-many)
[Muitos para Muitos](#many-to-many)
Tem um através.
Você tem muitas através de
Um para Um (Polimórficos)
[Um Para Muitos (Polimórfico)](#one-to-many-polymorphic-relations)
[Muitos para muitos (relações polimórficas)]

</div>

<a name="defining-relationships"></a>
## Definindo Relações

As relações eloquentes são definidas como métodos nas suas classes de modelo Eloquent. Como as relações também servem como poderosos [constructores de consulta](/docs/queries), definir relações como métodos fornece capacidades poderosas de cadeia de método e consulta. Por exemplo, podemos encadear restrições adicionais de consulta nesta relação 'posts':

```php
    $user->posts()->where('active', 1)->get();
```

Mas antes de mergulhar de cabeça nos relacionamentos, vamos aprender como definir cada tipo de relacionamento suportado pelo Eloquent.

<a name="one-to-one"></a>
### Um a um

Uma relação um-para-um é um tipo muito básico de relação de banco de dados. Por exemplo, um 'modelo User' poderia estar associado a um único 'modelo Phone'. Para definir essa relação, colocamos um método 'phone' no modelo 'User'. O método 'phone' deve chamar o método 'hasOne' e retornar seu resultado. O método 'hasOne' está disponível para o seu modelo através da classe base 'Illuminate\Database\Eloquent\Model' do seu modelo:

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

O primeiro argumento passado para o método `hasOne` é o nome da classe do modelo relacionado. Uma vez que a relação tenha sido definida, podemos buscar o registro relacionado usando propriedades dinâmicas do Eloquent. As propriedades dinâmicas permitem acessar métodos de relacionamento como se eles fossem propriedades definidas no modelo:

```php
    $phone = User::find(1)->phone;
```

Eloquent determina a chave estrangeira da relação com base no nome do modelo pai. Neste caso, o modelo "Telefone" é automaticamente assumido como tendo uma chave estrangeira "user_id". Se você quiser anular essa convenção, você pode passar um segundo argumento para o método 'hasOne':

```php
    return $this->hasOne(Phone::class, 'foreign_key');
```

Além disso, Eloquent assume que a chave estrangeira deve ter um valor correspondente à coluna primária da tabela pai. Em outras palavras, o Eloquent vai procurar o valor da coluna 'id' do usuário na coluna 'user_id' do registro de telefone. Se você gostaria que o relacionamento usasse um valor de chave primária diferente do 'id' ou da propriedade `$primaryKey` do seu modelo, você pode passar um terceiro argumento para o método 'hasOne':

```php
    return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### Definindo a Inversa da Relação

Então, podemos acessar o modelo ' Telefone' do nosso modelo ' Usuário'. Agora vamos definir uma relação no modelo 'Telefone' que nos permitirá acessar o usuário dono do telefone. Podemos definir o inverso de um relacionamento ' hasOne' usando o método 'belongsTo':

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

Quando invocando o método 'user', o Eloquent tentará encontrar um modelo de 'User' que tenha um 'id' igual à coluna 'user_id' do modelo 'Phone'.

O Eloquent determina o nome da chave estrangeira examinando o nome do método de relação e acrescentando o sufixo _id ao nome do método. Assim, neste caso, o Eloquent assume que o modelo Phone tem uma coluna "user_id". No entanto, se a chave estrangeira no modelo Phone não é "user_id", você pode passar um nome de chave personalizado como segundo argumento para o método belongsTo():

```php
    /**
     * Get the user that owns the phone.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'foreign_key');
    }
```

Se o modelo pai não usa 'id' como sua chave primária ou você deseja encontrar o modelo associado usando uma coluna diferente, você pode passar um terceiro argumento para o método 'belongsTo' especificando a chave personalizada da tabela pai:

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

A relação um-para-muitos é usada para definir relações onde um único modelo é o pai de um ou mais modelos filhos. Por exemplo, uma postagem no blog pode ter um número infinito de comentários. Assim como todas as outras relações do Eloquent, as relações um-para-muitos são definidas definindo um método na sua modelo Eloquent:

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

Lembre-se, o Eloquent irá determinar automaticamente a coluna chave estrangeira apropriada para o modelo 'Comment', seguindo uma convenção de nomenclatura que consiste em usar o nome do modelo pai em 'snake case' e adicionar o sufixo `_id`. No exemplo, o Eloquent irá assumir que a coluna chave estrangeira do modelo 'Comment' é `post_id`.

Uma vez que o método de relacionamento tem sido definido, podemos acessar a [coleção](/docs/eloquent-collections) de comentários relacionados acessando o `comments` propriedade. Lembre-se, pois Eloquent fornece "propriedades de relacionamento dinâmico", podemos acessar métodos de relacionamento como se eles fossem definidos como propriedades no modelo:

```php
    use App\Models\Post;

    $comments = Post::find(1)->comments;

    foreach ($comments as $comment) {
        // ...
    }
```

Como todos os relacionamentos também servem de construtores de consultas, você pode adicionar mais restrições à consulta de relacionamento chamando o método 'comentários' e continuando a encadear condições na consulta:

```php
    $comment = Post::find(1)->comments()
                        ->where('title', 'foo')
                        ->first();
```

Assim como o método `hasOne`, você também pode sobrescrever as chaves estrangeiras e locais passando argumentos adicionais para o método `hasMany`:

```php
    return $this->hasMany(Comment::class, 'foreign_key');

    return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="one-to-many-inverse"></a>
### Um para Muitos (Inverso) / Pertence a

Agora que podemos acessar todos os comentários de uma postagem, vamos definir um relacionamento para permitir que um comentário acesse sua postagem pai. Para definir o inverso de uma relação `hasMany`, defina um método de relacionamento no modelo filho que chama o método `belongsTo`:

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

Uma vez que a relação tenha sido definida, podemos obter uma mensagem’s post pai ao acessar a propriedade “relacionamento dinâmico” do ‘post’.

```php
    use App\Models\Comment;

    $comment = Comment::find(1);

    return $comment->post->title;
```

No exemplo acima, Eloquent irá tentar encontrar um modelo `Post` que tem um `id` que corresponde ao `post_id` na tabela do modelo `Comment`.

O Eloquent determina o nome padrão da chave estrangeira examinando o nome do método de relação e acrescentando ao nome do método um `_` seguido pelo nome da coluna primária do modelo pai. Assim, neste exemplo, o Eloquent vai assumir que a chave estrangeira do modelo 'Post' na tabela 'comments' é 'post_id'.

No entanto, se a chave estrangeira para sua relação não segue essas convenções, você pode passar um nome personalizado da chave estrangeira como o segundo argumento do método 'belongsTo':

```php
    /**
     * Get the post that owns the comment.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'foreign_key');
    }
```

Se o seu modelo pai não usa "id" como sua chave primária, ou se você deseja encontrar o modelo associado usando uma coluna diferente, você pode passar um terceiro argumento ao método 'belongsTo', especificando a chave personalizada da tabela pai:

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
#### Modelos padrão

O relacionamento "belongsTo", "hasOne", "hasOneThrough" e "morphOne" permitem que você defina um modelo padrão a ser retornado se o relacionamento dado for nulo. Este padrão é frequentemente referido como o [Padrão Objeto Nulo](https://en.wikipedia.org/wiki/Null_Object_pattern) e pode ajudar a remover verificações condicionais no seu código. No seguinte exemplo, o relacionamento "user" retornará um modelo vazio "App\Models\User" se nenhum usuário estiver anexado ao modelo "Post":

```php
    /**
     * Get the author of the post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault();
    }
```

Para preencher o modelo padrão com atributos você pode passar um array ou uma função de retorno para o método 'withDefault':

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
#### Consultas Pertencem a Relações

Ao consultar para os filhos de uma relação “pertence a”, você pode construir manualmente a cláusula `where` para recuperar o modelo Eloquent correspondente:

```php
    use App\Models\Post;

    $posts = Post::where('user_id', $user->id)->get();
```

Contudo, você pode achar mais conveniente utilizar o método 'ondePertence', que irá determinar automaticamente a relação e chave estrangeira apropriadas para o modelo em questão.

```php
    $posts = Post::whereBelongsTo($user)->get();
```

Você também pode fornecer uma [coleção](/docs/eloquent-collections) à 'whereBelongsTo' método. Ao fazê-lo, o Laravel irá recuperar modelos que pertencem a qualquer um dos modelos pais dentro da coleção:

```php
    $users = User::where('vip', true)->get();

    $posts = Post::whereBelongsTo($users)->get();
```

Por padrão, o Laravel irá determinar a relação associada ao modelo com base no nome da classe do modelo; contudo, você pode especificar manualmente o nome da relação fornecendo-a como segundo argumento para o método 'whereBelongsTo':

```php
    $posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
### Um de Muitos

Às vezes um modelo pode ter muitos modelos relacionados, mas você deseja facilmente recuperar o "mais recente" ou o "mais antigo" dos modelos relacionados de uma relação. Por exemplo, um modelo 'Usuário' pode ser relacionado a muitos modelos 'Pedido', mas você deseja definir uma maneira conveniente de interagir com o último pedido que o usuário fez. Você pode realizar isso usando o tipo de relacionamento 'hasOne' combinado com os métodos 'ofMany':

```php
/**
 * Get the user's most recent order.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

Da mesma forma, você pode definir um método para recuperar o "mais antigo", ou primeiro, modelo relacionado de uma relação:

```php
/**
 * Get the user's oldest order.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

Por padrão, os métodos 'latestOfMany' e 'oldestOfMany' recuperam o modelo mais recente ou o mais antigo relacionado, com base na chave primária do modelo, que deve ser ordinável. No entanto, às vezes você pode desejar recuperar um único modelo de uma relação maior usando diferentes critérios de ordenação.

Por exemplo, usando o método 'ofMany', você pode obter a compra mais cara do usuário. O método 'ofMany' aceita a coluna classificável como seu primeiro argumento e qual função agregada (min ou max) aplicar ao consultar o modelo relacionado:

```php
/**
 * Get the user's largest order.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> [Aviso! ]
> Porque o PostgreSQL não suporta executar a função `MAX` contra colunas UUID, atualmente não é possível usar relações um-muitos em conjunto com colunas UUID do PostgreSQL.

<a name="converting-many-relationships-to-has-one-relationships"></a>
#### Convertendo "Muitos" Relacionamentos em "Um Tem Um" Relacionamentos

Quando você está pegando um modelo único usando o método `latestOfMany`, `oldestOfMany`, ou `ofMany`, muitas vezes já tem uma relação "tem muitos" definida para o mesmo modelo. Para facilitar, Laravel permite que você transforme facilmente esta relação em uma relação "tem um" invocando o método `one` na relação:

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
#### A relação avançada é uma de muitas relações que ela tem.

É possível construir relacionamentos mais complexos de "tem um de muitos". Por exemplo, um modelo 'Product' pode ter diversos modelos associados de 'Price', mantidos no sistema mesmo após novas informações de preços serem publicadas. Além disso, novos dados de preços podem ser publicados antecipadamente para entrar em vigor em uma data futura via uma coluna 'published_at'.

Então, resumindo, precisamos recuperar os preços mais recentes publicados onde a data de publicação não está no futuro. Além disso, se dois preços tiverem a mesma data de publicação, preferiremos o preço com o ID maior. Para fazer isso, devemos passar uma matriz para o método 'ofMany' que contém as colunas ordenáveis que determinam o preço mais recente. Além disso, uma função anônima será fornecida como segundo argumento para o método 'ofMany'. Essa função anônima será responsável por adicionar restrições adicionais de data de publicação à consulta de relacionamento:

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
### Tem uma através

A relação "has-one-through" define uma relação um-para-um com outro modelo. No entanto, essa relação indica que o modelo declarativo pode ser combinado com uma única instância de outro modelo ao passar por uma terceira instância do modelo.

Por exemplo, em uma aplicação de oficina de reparo de veículos, cada modelo de "mecânico" pode ser associado a um modelo de "carro", e cada modelo de "carro" pode ser associado a um modelo de "proprietário". Embora o mecânico e o proprietário não tenham uma relação direta dentro do banco de dados, o mecânico pode acessar o proprietário através do modelo de "carro". Vamos olhar as tabelas necessárias para definir esta relação:

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

Agora que examinamos a estrutura da tabela para a relação, vamos definir a relação no modelo 'Mecânico':

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

O primeiro argumento passado para o método `hasOneThrough` é o nome do modelo final que queremos acessar enquanto que o segundo argumento é o nome do modelo intermediário.

Ou, se as relações relevantes já tiverem sido definidas em todos os modelos envolvidos na relação, você pode definir fluentemente uma relação "has-one-through" invocando o método 'through' e fornecendo os nomes dessas relações. Por exemplo, se o modelo 'Mechanic' tem uma relação 'cars', e o modelo 'Car' tem uma relação 'owner', você pode definir uma relação "has-one-through" conectando mecânico e dono da seguinte forma:

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

<a name="has-one-through-key-conventions"></a>
#### Convenções Principais

As convenções típicas da chave estrangeira Eloquent serão usadas ao realizar as consultas de relacionamento. Se você deseja personalizar as chaves do relacionamento, você pode passar como argumentos terceiro e quarto para o método 'hasOneThrough'. O terceiro argumento é o nome da chave estrangeira no modelo intermediário. O quarto argumento é o nome da chave estrangeira no modelo final. O quinto argumento é a chave local, enquanto o sexto argumento é a chave local do modelo intermediário:

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

Ou, como discutido anteriormente, se as relações relevantes já estiverem definidas em todos os modelos envolvidos na relação, você pode definir fluentemente uma relação "has-one-through" invocando o método 'through' e fornecendo os nomes dessas relações. Esta abordagem oferece a vantagem de reutilizar as convenções-chave já definidas nas relações existentes:

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>
### Tem Muitos Através

A relação "has-many-through" fornece uma maneira conveniente de acessar relações distantes via uma relação intermediária. Por exemplo, vamos assumir que estamos construindo uma plataforma de implantação como o [Laravel Vapor](https://vapor.laravel.com). Um modelo 'Project' pode acessar muitos modelos 'Deployment' através de um modelo intermediário 'Environment'. Usando este exemplo, você poderia facilmente reunir todas as implantações para um determinado projeto. Vamos olhar para as tabelas necessárias para definir esta relação:

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

Agora que examinamos a estrutura da tabela para a relação, vamos definir a relação no modelo de Projeto:

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

A primeira argumento passado para o método `hasManyThrough` é o nome do modelo final que queremos acessar, enquanto o segundo argumento é o nome do modelo intermediário.

Ou, se as relações relevantes já tiverem sido definidas em todos os modelos envolvidos na relação, você pode definir fluentemente uma "has-many-through" invocando o método "through" e fornecendo os nomes dessas relações. Por exemplo, se o modelo 'Project' tiver uma relação com "environments" e o modelo 'Environment' tiver uma relação com "deployments", você pode definir uma relação "has-many-through" conectando o projeto e as implantações da seguinte maneira:

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

Apesar da tabela do modelo 'Deployment' não conter uma coluna 'project_id', a relação "hasManyThrough" fornece acesso aos 'deployments' de um projeto via "$project->deployments". Para buscar esses modelos, Eloquent inspeciona a coluna 'project_id' na tabela intermediária do modelo "Environment". Depois de encontrar os IDs ambientais relevantes, eles são usados para consultar a tabela do modelo "Deployment".

<a name="has-many-through-key-conventions"></a>
#### Convenções Chave

Convenções típicas de chave estrangeira Eloquent serão usadas quando realizando as consultas da relação. Se você gostaria de personalizar as chaves da relação, você pode passá-los como argumentos terceiro e quarto para o método hasManyThrough. O terceiro argumento é o nome da chave estrangeira no modelo intermediário. O quarto argumento é o nome da chave estrangeira no modelo final. O quinto argumento é a chave local, enquanto o sexto argumento é a chave local do modelo intermediário:

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

Ou, conforme discutido anteriormente, se as relações relevantes já foram definidas em todos os modelos envolvidos na relação, você pode definir fluentemente uma relação "has-many-through" invocando o método `through` e fornecendo os nomes dessas relações. Essa abordagem oferece a vantagem de reutilizar as convenções-chave já definidas nas relações existentes:

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

<a name="many-to-many"></a>
## Relações muitos-para-muitos

Relaçōes de muitos para muitos sāo ligeiramente mais complicadas do que as relaçōes 'hasOne' e 'hasMany'. Um exemplo de uma relaçāo de muitos para muitos é um usuārio que tem vārios papéis, e esses papéis também são compartilhados por outros usuārios no aplicativo. Por exemplo, um usuārio pode ser nomeado para os papéis de "Autor" e "Editor"; todavia, esses papéis também podem ser nomeados para outros usuārios também. Então, um usuário tem muitos papéis e um papel tem vārios usuários.

<a name="many-to-many-table-structure"></a>
#### Estrutura de mesa

Para definir essa relação, três tabelas de banco de dados são necessárias: 'users', 'roles' e 'role_user'. A tabela 'role_user' é derivada da ordem alfabética dos nomes do modelo relacionado e contém colunas 'user_id' e 'role_id'. Essa tabela é usada como uma tabela intermediária para vincular usuários e funções.

Lembre-se, como um papel pode pertencer a muitos usuários, não podemos simplesmente adicionar uma coluna 'user_id' na tabela 'roles'. Isso significaria que um papel poderia ser de apenas um usuário. Para fornecer suporte para papéis que são atribuídos a múltiplos usuários, precisamos da tabela 'role_user'. Podemos resumir a estrutura da tabela de relacionamento assim:

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
#### Estrutura do Modelo

Muitas relações de muitos-para-muitos são definidas escrevendo um método que retorna o resultado do método 'belongsToMany'. O método 'belongsToMany' é fornecido pela classe base 'Illuminate\Database\Eloquent\Model', usado por todos os modelos Eloquent do seu aplicativo. Por exemplo, vamos definir um método 'roles' no nosso modelo de usuário. O primeiro argumento passado a este método é o nome da classe do modelo relacionado:

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

Uma vez que a relação é definida, você pode acessar as funções do usuário usando a propriedade de relacionamento dinâmico "roles":

```php
    use App\Models\User;

    $user = User::find(1);

    foreach ($user->roles as $role) {
        // ...
    }
```

Como todos os relacionamentos também servem como construtores de consulta, você pode adicionar mais restrições à consulta de relacionamento, chamando o método "roles" e continuando a encadear condições na consulta:

```php
    $roles = User::find(1)->roles()->orderBy('name')->get();
```

Para determinar o nome da tabela de um relacionamento intermediário, Eloquent irá unir os nomes das duas classes relacionadas em ordem alfabética. No entanto, você é livre para substituir essa convenção. Você pode fazê-lo passando um segundo argumento no método `belongsToMany`:

```php
    return $this->belongsToMany(Role::class, 'role_user');
```

Além de personalizar o nome da tabela intermediária, você também pode personalizar os nomes das colunas das chaves na tabela passando argumentos adicionais ao método `belongsToMany`. O terceiro argumento é o nome da chave estrangeira do modelo no qual você está definindo a relação, enquanto o quarto argumento é o nome da chave estrangeira do modelo que você está juntando:

```php
    return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### Definindo a Inversa de um Relacionamento

Para definir o "inverso" de uma relação de muitos para muitos, você deve definir um método no modelo relacionado que retorne o resultado do método 'belongsToMany'. Para completar nosso exemplo de usuário/papel, vamos definir o método 'users' no modelo 'Role':

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

Como você pode ver, a relação é definida exatamente a mesma como o modelo de usuário correspondente com a exceção de fazer referência ao modelo de usuário “App\Models\User”. Como estamos reutilizando o método de “belongsToMany”, todas as opções de personalização de tabela e chave padrão estão disponíveis quando definindo o "inverso" de relações um-para-muitos.

<a name="retrieving-intermediate-table-columns"></a>
### Recuperando Colunas da Tabela Intermediária

Como você já aprendeu, trabalhar com relações muitos-para-muitos exige a presença de uma tabela intermediária. Eloquent oferece algumas maneiras muito úteis de interagir com essa tabela. Por exemplo, vamos assumir que nosso modelo "Usuário" tem muitos modelos "Papel" relacionados a ele. Depois de acessar esta relação, podemos acessar a tabela intermediária usando o atributo "pivot" dos modelos:

```php
    use App\Models\User;

    $user = User::find(1);

    foreach ($user->roles as $role) {
        echo $role->pivot->created_at;
    }
```

Observe que cada modelo 'Role' que estamos obtendo é automaticamente atribuído um atributo 'pivot'. Este atributo contém um modelo representando a tabela intermediária.

Por padrão, apenas as chaves do modelo estarão presentes no modelo de pivot. Se sua tabela intermediária contém atributos extras, você deve especificá-los ao definir a relação:

```php
    return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

Se você deseja que sua tabela intermediária tenha os timestamps `created_at` e `updated_at` automaticamente mantidos pelo Eloquent, chame o método `withTimestamps` ao definir a relação:

```php
    return $this->belongsToMany(Role::class)->withTimestamps();
```

> [!ALERTA]
> Tabelas intermediárias que utilizam carimbos de data e hora automaticamente mantidos pelo Eloquent necessitam ter colunas `created_at` e `updated_at`.

<a name="customizing-the-pivot-attribute-name"></a>
#### Personalizando o Nome do Atributo `Pivot`

Como mencionado anteriormente, os atributos da tabela intermediária podem ser acessados no modelo através do atributo 'pivot'. No entanto, você é livre para personalizar o nome deste atributo para refletir melhor seu propósito dentro sua aplicação.

Por exemplo, se seu aplicativo contiver usuários que podem se inscrever em podcasts, provavelmente você terá uma relação muitos-para-muitos entre usuários e podcasts. Se for esse o caso, talvez queira renomear seu atributo da tabela intermediária para 'assinatura' em vez de 'pivot'. Isso pode ser feito usando o método 'as' ao definir a relação:

```php
    return $this->belongsToMany(Podcast::class)
                    ->as('subscription')
                    ->withTimestamps();
```

Uma vez que o atributo da tabela intermediária tenha sido especificado, você pode acessar os dados da tabela intermediária usando um nome personalizado:

```php
    $users = User::with('podcasts')->get();

    foreach ($users->flatMap->podcasts as $podcast) {
        echo $podcast->subscription->created_at;
    }
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
### Filtrando Consultas Via Colunas de Tabela Intermediária

Você também pode filtrar os resultados retornados por consultas de relacionamento "belongsToMany" usando os métodos 'wherePivot', 'wherePivotIn', 'wherePivotNotIn', 'wherePivotBetween', 'wherePivotNotBetween', 'wherePivotNull' e 'wherePivotNotNull' ao definir o relacionamento:

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
### Ordenar consultas usando colunas em uma tabela intermediária

Você pode ordenar os resultados retornados pela consulta de relacionamento manyToMany usando o método "orderByPivot". No exemplo abaixo, vamos buscar todos os últimos distintivos para o usuário:

```php
    return $this->belongsToMany(Badge::class)
                    ->where('rank', 'gold')
                    ->orderByPivot('created_at', 'desc');
```

<a name="defining-custom-intermediate-table-models"></a>
### Definindo modelos de tabela intermediária personalizada

Se você gostaria de definir um modelo personalizado para representar a tabela intermediária da sua relação muitos-para-muitos, você pode chamar o método `using` ao definir a relação. Modelos pivô personalizados dão a oportunidade de definir comportamento adicional no modelo pivô, tais como métodos e casts.

Os modelos de pivô de muitos-para-muitos personalizados devem estender a classe 'Illuminate\Database\Eloquent\Relations\Pivot' enquanto os modelos de pivô polimórficos de muitos-para-muitos devem estender a classe 'Illuminate\Database\Eloquent\Relations\MorphPivot'. Por exemplo, poderíamos definir um modelo "Função" que utiliza um modelo de pivô personalizado "FunçãoUsuário":

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

Ao definir o modelo RoleUser você deverá estender a classe Illuminate\Database\Eloquent\Relations\Pivot:

```php
    <?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Relations\Pivot;

    class RoleUser extends Pivot
    {
        // ...
    }
```

> [Alerta]
> Os modelos de pivô não podem usar o traço SoftDeletes. Se você precisar excluir registros de pivô suavemente, considere converter seu modelo de pivô em um modelo real do Eloquent.

<a name="custom-pivot-models-and-incrementing-ids"></a>
#### Modelo de Pivot personalizado e ID incrementados

Se você definiu uma relação muitos-para-muitos que utiliza um modelo personalizado de pivot, e esse modelo de pivot possui uma chave primária auto incrementada, você deve garantir que sua classe personalizada de pivot define uma propriedade 'incrementando' que é definida como 'verdadeira'.

```php
    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = true;
```

<a name="polymorphic-relationships"></a>
## Relações polimórficas

Uma relação polimórfica permite que um modelo de criança pertença a mais do que um tipo de modelo usando uma única associação. Por exemplo, imagine você está construindo um aplicativo que permite aos usuários compartilhar postagens em blogs e vídeos. Num tal aplicativo, um modelo "Comentário" pode ser associado tanto ao modelo "Postagem" quanto ao modelo "Vídeo".

<a name="one-to-one-polymorphic-relations"></a>
### Um a um (Polimórficos)

<a name="one-to-one-polymorphic-table-structure"></a>
#### Estrutura da Tabela

Uma relação polimórfica um-para-um é semelhante a uma relação um-para-um típica; contudo, o modelo da criança pode pertencer a mais de um tipo de modelo usando uma única associação. Por exemplo, uma postagem e um `User` podem compartilhar uma relação polimórfica com um modelo de imagem. Usando uma relação polimórfica um-para-um permite que você tenha uma única tabela de imagens exclusivas que podem ser associadas a postagens e usuários. Primeiro, vamos examinar a estrutura da tabela:

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

Observe as colunas `imageable_id` e `imageable_type` na tabela `images`. A coluna `imageable_id` contém o valor do ID da postagem ou usuário, enquanto a coluna `imageable_type` contém o nome de classe do modelo pai. A coluna `imageable_type` é usada pelo Eloquent para determinar que "tipo" de modelo pai retornar ao acessar a relação `imageable`. Neste caso, a coluna conterá `App\Models\Post` ou `App\Models\User`.

<a name="one-to-one-polymorphic-model-structure"></a>
#### Estrutura do Modelo

Vamos examinar os modelos definidos necessários para construir esta relação:

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
#### Recuperando o Relacionamento

Uma vez que suas tabela de banco de dados e modelos são definidos, você pode acessar as relações através de seus modelos. Por exemplo, para obter a imagem de um post, podemos acessar a propriedade `image` da relação dinâmica:

```php
    use App\Models\Post;

    $post = Post::find(1);

    $image = $post->image;
```

Você pode recuperar o modelo pai do polimórfico acessando o nome do método que realiza a chamada para `morphTo`. Neste caso, este é o método "imageable" no modelo 'Imagem'. Assim, acessaremos este método como uma propriedade de relacionamento dinâmico.

```php
    use App\Models\Image;

    $image = Image::find(1);

    $imageable = $image->imageable;
```

A relação 'imageable' do modelo 'Image' retornará uma instância de 'Post' ou 'User', dependendo da qual tipo de modelo possui a imagem.

<a name="morph-one-to-one-key-conventions"></a>
#### Convenções Importantes

Se necessário, você pode especificar o nome da coluna "id" e "type" utilizada pelo seu modelo polimórfico de filho. Se fizer isso, certifique-se de sempre passar o nome do relacionamento como o primeiro argumento para o método `morphTo`. Normalmente esse valor deve corresponder ao nome do método, então você pode usar a constante PHP `__FUNCTION__`:

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
### Um para Muitos (Polimórficos)

<a name="one-to-many-polymorphic-table-structure"></a>
#### Estrutura de uma mesa

Uma relação polimórfica um-para-muitos é semelhante à típica relação um-para-muitos; no entanto, o modelo filho pode pertencer a mais de um tipo de modelo usando uma única associação. Por exemplo, imagine usuários do seu aplicativo podem "comentar" em postagens e vídeos. Ao usar relações polimórficas, você pode usar uma tabela "comentários" para conter comentários para postagens e vídeos. Primeiro, vamos examinar a estrutura da tabela necessária para construir essa relação:

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

A seguir vamos examinar as definições do modelo necessárias para construir esta relação:

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
#### Retornando o Relacionamento

Uma vez que sua tabela de banco de dados e modelos são definidos, você pode acessar as relações usando as propriedades dinâmicas do seu modelo. Por exemplo, para acessar todos os comentários para um post, podemos usar a propriedade dinâmica de "comentários":

```php
    use App\Models\Post;

    $post = Post::find(1);

    foreach ($post->comments as $comment) {
        // ...
    }
```

Você também pode buscar o pai de um modelo infantil polimórfico acessando o nome do método que realiza a chamada para `morphTo`. Neste caso, é o método `commentable` no modelo `Comment`. Então, nós vamos acessar esse método como uma propriedade de relacionamento dinâmica a fim de acessar o modelo pai do comentário:

```php
    use App\Models\Comment;

    $comment = Comment::find(1);

    $commentable = $comment->commentable;
```

A relação 'commentable' do modelo 'Comment' retornará uma instância de 'Post' ou 'Video', dependendo do tipo de modelo que o comentário é pai.

<a name="one-of-many-polymorphic-relations"></a>
### Um de Muitos (polimórfico)

Às vezes um modelo pode ter vários modelos relacionados, mas você quer recuperar facilmente o "mais recente" ou o "mais antigo" modelo relacionado do relacionamento. Por exemplo, um modelo 'Usuário' pode estar relacionado a muitos modelos 'Imagem', mas você deseja definir um método conveniente de interagir com a última imagem carregada pelo usuário. Você pode realizar isso usando o tipo de relacionamento 'morphOne' combinado com os métodos 'ofMany':

```php
/**
 * Get the user's most recent image.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

Da mesma forma, você pode definir um método para obter o "mais antigo", ou o primeiro, modelo relacionado de uma relação:

```php
/**
 * Get the user's oldest image.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

Por padrão, os métodos `latestOfMany` e `oldestOfMany` vão buscar o mais novo ou mais antigo modelo relacionado com base na chave primária do modelo, que deve ser ordenável. Contudo, às vezes você pode querer buscar um único modelo de uma relação maior usando um critério de ordenação diferente.

Por exemplo, usando o método 'ofMany', você pode obter a imagem mais "curtida" do usuário. O método 'ofMany' aceita a coluna classificável como seu primeiro argumento e qual função agregada (min ou max) aplicar ao consultar pelo modelo relacionado:

```php
/**
 * Get the user's most popular image.
 */
public function bestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> [！NOTA]
> É possível construir relações mais complexas do tipo "um dos muitos". Para mais informações, consulte a [documentação "um de muitos"](#advanced-has-one-of-many-relationships) .

<a name="many-to-many-polymorphic-relations"></a>
### Muitos para Muitos (Polimórficos)

<a name="many-to-many-polymorphic-table-structure"></a>
#### Estrutura de Mesa

As relações polimórficas "muitos para muitos" são ligeiramente mais complexas do que as relações "morfo um" e "morfo vários". Por exemplo, um modelo 'Post' e um modelo 'Video' poderiam compartilhar uma relação polimórfica com um modelo 'Tag'. Usando uma relação polimórfica "muitos para muitos" nessa situação, o seu aplicativo poderia ter uma única tabela de tags exclusivas que podem ser associadas a postagens ou vídeos. Primeiro, vamos examinar a estrutura da tabela necessária para construir essa relação:

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

> NOTA:
> Antes de mergulhar em relacionamentos polimórficos muitos-para-muitos, você pode se beneficiar lendo a documentação sobre relacionamentos típicos [muitos-para-muitos](#muitos-para-muitos).

<a name="many-to-many-polymorphic-model-structure"></a>
#### Estrutura do Modelo

A seguir, estamos prontos para definir as relações nos modelos. O modelo "Post" e o modelo "Video" ambos conterão um método chamado "tags" que chama o método "morphToMany" fornecido pela classe padrão do modelo Eloquent.

O método `morphToMany` aceita o nome do modelo relacionado como também a "nome da relação". Baseado no nome que atribuímos à nossa tabela intermediária e as chaves que ela contém, faremos uma referência para a relação como "taggable":

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
#### Definindo a Inversa da Relação

Em seguida no modelo "Tag", você deve definir um método para cada um dos seus modelos pai possíveis. Então, neste exemplo, vamos definir um método "posts" e um método "videos". Ambos esses métodos devem retornar o resultado do método "morphedByMany".

O método 'morphedByMany' aceita o nome do modelo relacionado como também o "nome da relação". Baseado no nome que atribuímos a nossa tabela intermediária e as chaves que ela contém, chamaremos a relação de "taggable":

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
#### Recuperando o Relacionamento

Uma vez que sua tabela e seus modelos de banco de dados estão definidos, você pode acessar as relações via seus modelos. Por exemplo, para acessar todas as tags para um post, você pode usar a propriedade de relação dinâmica 'tags':

```php
    use App\Models\Post;

    $post = Post::find(1);

    foreach ($post->tags as $tag) {
        // ...
    }
```
Você pode recuperar o pai de uma relação polimórfica do modelo polimórfico infantil acessando o nome do método que executa a chamada para morphedByMany. Neste caso, é o `posts` ou `videos` métodos no modelo `Tag`:

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
### Tipos Polimórficos Personalizados

Por padrão, o Laravel irá usar o nome de classe totalmente qualificado para armazenar a "tipo" do modelo relacionado. Por exemplo, dado o exemplo de relacionamento um-para-muitos acima onde um modelo "Comment" pode pertencer a um modelo "Post" ou um modelo "Video", o padrão "commentable_type" seria respectivamente `App\Models\Post` ou `App\Models\Video`. No entanto, você pode querer desacoplar esses valores da estrutura interna do seu aplicativo.

Por exemplo, em vez de usar os nomes dos modelos como o "tipo" podemos utilizar simples strings tais como post e video. Ao fazer isto, os valores da coluna polimórfica "tipo" continuarão válidos mesmo se os modelos forem renomeados.

```php
    use Illuminate\Database\Eloquent\Relations\Relation;

    Relation::enforceMorphMap([
        'post' => 'App\Models\Post',
        'video' => 'App\Models\Video',
    ]);
```

Você pode chamar o método 'enforceMorphMap' no método 'boot' da sua classe 'App\Providers\AppServiceProvider', ou criar um provedor de serviços separado se você quiser.

Você pode determinar o "alias" de um modelo específico em tempo de execução usando o método 'getMorphClass' desse modelo; ou vice-versa, você pode determinar o nome da classe totalmente qualificada associada com um "alias morph" usando o método 'Relation::getMorphedModel':

```php
    use Illuminate\Database\Eloquent\Relations\Relation;

    $alias = $post->getMorphClass();

    $class = Relation::getMorphedModel($alias);
```

> [!ALERTA]
> Quando adicionando um "mapa de forma", para sua aplicação existente, cada valor da coluna '*-tipo' que ainda contém uma classe totalmente qualificada precisará ser convertido para seu nome "map".

<a name="dynamic-relationships"></a>
### Relação Dinâmica

Você pode usar o método `resolveRelationUsing` para definir relações entre modelos Eloquent em tempo de execução. Embora não seja normalmente recomendado para desenvolvimento normal de aplicativos, isso às vezes é útil quando se desenvolve pacotes do Laravel.

O método resolveRelationUsing aceita o nome da relação desejada como seu primeiro argumento. O segundo argumento passado ao método deve ser um fechamento que aceite a instância do modelo e retorne uma definição válida de Eloquent relation. Normalmente, você deve configurar relações dinâmicas dentro do método de boot de um [provedor de serviços](/docs/providers):

```php
    use App\Models\Order;
    use App\Models\Customer;

    Order::resolveRelationUsing('customer', function (Order $orderModel) {
        return $orderModel->belongsTo(Customer::class, 'customer_id');
    });
```

> (!AVISO)
> Ao definir relações dinâmicas, sempre forneça argumentos de nome de chave explícitos aos métodos de relacionamento Eloquent.

<a name="querying-relations"></a>
## Consultando Relações

Como todas as relações Eloquent são definidas através de métodos, você pode chamar esses métodos para obter uma instância da relação sem realmente executar uma consulta para carregar os modelos relacionados. Além disso, todos os tipos de relações Eloquent também servem como [construidores de consultas](/docs/queries), permitindo que você continue a encadear restrições à consulta de relacionamento antes de finalmente executar a consulta SQL contra seu banco de dados.

Por exemplo, imagine uma aplicação de blog em que um "Usuário" modelo tem muitos "postagens" modelos associados:

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

Você pode consultar a relação `posts` e adicionar restrições adicionais à relação, como esta:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->posts()->where('active', 1)->get();
```

Você pode usar qualquer um dos métodos do [builder de consulta]('/docs/queries') sobre a relação, então tenha certeza de explorar o documentação do builder de consulta para aprender sobre todos os métodos que estão disponíveis para você.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### Chaining 'orWhere' Clauses After Relationships

Como demonstrado no exemplo acima, você é livre para adicionar restrições adicionais aos relacionamentos quando os consultando. No entanto, use cautela ao encadear cláusulas `orWhere` em um relacionamento, pois as cláusulas `orWhere` serão agrupadas logicamente na mesma nível da restrição do relacionamento:

```php
    $user->posts()
            ->where('active', 1)
            ->orWhere('votes', '>=', 100)
            ->get();
```

O exemplo acima produziria a seguinte consulta SQL. Como você pode ver, a cláusula "ou" instrui a consulta para retornar _qualquer_ post com mais de 100 votos. A consulta não é mais restrita a um usuário específico:

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

Em quase todos os casos, você deve usar [grupos lógicos](/docs/queries#group-conditional-checks-together-with-parentheses) para agrupar as verificações condicionais entre parênteses:

```php
    use Illuminate\Database\Eloquent\Builder;

    $user->posts()
            ->where(function (Builder $query) {
                return $query->where('active', 1)
                             ->orWhere('votes', '>=', 100);
            })
            ->get();
```

O exemplo acima produzirá o seguinte SQL. Observe que o agrupamento lógico agrupou corretamente as restrições e a consulta permanece restringida a um usuário específico:

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### Métodos de Relacionamento x Propriedades Dinâmicas

Se você não precisa adicionar restrições adicionais a uma consulta de relacionamento Eloquent, você pode acessar o relacionamento como se fosse uma propriedade. Por exemplo, continuando usando nossos modelos "User" e "Post", podemos acessar todos os posts de um usuário assim:

```php
    use App\Models\User;

    $user = User::find(1);

    foreach ($user->posts as $post) {
        // ...
    }
```

As propriedades de relacionamento dinâmico realizam o "carregamento lento", ou seja, apenas carregarão seus dados de relacionamento quando você realmente acessá-los. Por causa disso, os desenvolvedores geralmente usam [carregamento ansioso](#ansious-loading) para pré-carregar relacionamentos que eles sabem que serão acessados após carregar o modelo. O carregamento ansioso proporciona uma redução significativa nas consultas SQL que devem ser executadas para carregar as relações de um modelo.

<a name="querying-relationship-existence"></a>
### Consulta a existência da relação

Quando recuperar os registros de um modelo, você pode querer limitar seus resultados com base na existência de uma relação. Por exemplo, imagine que você deseja obter todas as postagens do blog que tenham pelo menos um comentário. Para fazer isso, você pode passar o nome da relação para o método `has` e `orHas`:

```php
    use App\Models\Post;

    // Retrieve all posts that have at least one comment...
    $posts = Post::has('comments')->get();
```

Você também pode especificar um operador e o valor de contagem para personalizar ainda mais a consulta.

```php
    // Retrieve all posts that have three or more comments...
    $posts = Post::has('comments', '>=', 3)->get();
```

Para obter todos os posts que tem pelo menos um comentário com pelo menos uma imagem, você pode usar o seguinte código:

```php
    // Retrieve posts that have at least one comment with images...
    $posts = Post::has('comments.images')->get();
```

Se você precisar de mais poder, pode usar os métodos "whereHas" e "orWhereHas" para definir restrições adicionais em suas consultas "has", como inspecionar o conteúdo de um comentário:

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

> [ADVERTÊNCIA]
> O Eloquent atualmente não suporta consultas para verificar a existência de relações entre bancos de dados. As relações devem existir dentro do mesmo banco de dados.

<a name="inline-relationship-existence-queries"></a>
#### Consultas de existência de relacionamentos em linha

Se você gostaria de consultar uma relação existente com um único, simples onde condição anexada à consulta de relacionamento, você pode encontrar mais conveniente usar os métodos 'whereRelation', 'orWhereRelation', 'whereMorphRelation' e 'orWhereMorphRelation'. Por exemplo, podemos consultar todos os posts que têm comentários não aprovados:

```php
    use App\Models\Post;

    $posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

É claro que, assim como as chamadas para o método 'where' do construtor de consultas, também você pode especificar um operador:

```php
    $posts = Post::whereRelation(
        'comments', 'created_at', '>=', now()->subHour()
    )->get();
```
<a name="querying-relationship-absence"></a>
### Consultando a ausência de relacionamento

Ao buscar registros de modelos, você pode querer limitar seus resultados com base na ausência de uma relação. Por exemplo, imagine que deseja recuperar todos os artigos de blog que **não** têm comentários. Para fazer isso, você pode passar o nome da relação para as métodos `doesntHave` e `orDoesntHave`:

```php
    use App\Models\Post;

    $posts = Post::doesntHave('comments')->get();
```

Se você necessitar de mais poder, use os métodos whereDoesntHave e orWhereDoesntHave para acrescentar restrições de consulta adicionais às suas consultas doesntHave, tais como inspecionar o conteúdo de um comentário.

```php
    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::whereDoesntHave('comments', function (Builder $query) {
        $query->where('content', 'like', 'code%');
    })->get();
```

Você pode usar a notação "ponto" para executar uma consulta em um relacionamento aninhado. Por exemplo, o seguinte comando retornará todos os artigos que não possuem comentários; no entanto, artigos com comentários de autores que não são banidos estarão incluídos nos resultados:

```php
    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
        $query->where('banned', 0);
    })->get();
```

<a name="querying-morph-to-relationships"></a>
### Consulta de Morfologia para Relação

Para consultar a existência de relações "morph to", você pode usar os métodos `whereHasMorph` e `whereDoesntHaveMorph`. Esses métodos recebem o nome da relação como seu primeiro argumento. Em seguida, eles aceitam os nomes dos modelos relacionados que você deseja incluir na consulta. Por último, você pode fornecer uma função de fechamento para personalizar a consulta da relação:

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

Você pode ocasionalmente precisar adicionar restrições de consulta com base no "tipo" do modelo polimórfico relacionado. O encerramento passado para o método `whereHasMorph` pode receber um valor `$type` como seu segundo argumento. Este argumento permite que você inspecione o "tipo" da consulta que está sendo construída:

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
#### Consultando Todos os Modelos Relacionados

Em vez de passar uma matriz de possíveis modelos polimórficos, você pode fornecer o caractere curinga `*` como um valor. Isso instruirá o Laravel a buscar todos os tipos polimórficos possíveis do banco de dados. O Laravel executará uma consulta adicional para realizar essa operação:

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

Às vezes você pode querer contar o número de modelos relacionados para um determinado relacionamento sem realmente carregar os modelos. Para fazer isso, você pode usar o método `withCount`. O método `withCount` colocará um atributo `{relation}_count` nos modelos resultantes:

```php
    use App\Models\Post;

    $posts = Post::withCount('comments')->get();

    foreach ($posts as $post) {
        echo $post->comments_count;
    }
```

Ao passar uma matriz para o método `withCount`, você pode acrescentar os "contagens" de múltiplas relações, bem como acrescentar restrições adicionais nos consultas.

```php
    use Illuminate\Database\Eloquent\Builder;

    $posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
        $query->where('content', 'like', 'code%');
    }])->get();

    echo $posts[0]->votes_count;
    echo $posts[0]->comments_count;
```

Você também pode fazer um alias para o resultado do contagem de relacionamento, permitindo múltiplas contagens no mesmo relacionamento:

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
#### Carregamento de Contagem Adiado

Usando o método 'loadCount', você pode carregar um relacionamento de contagem depois que o modelo pai já foi recuperado:

```php
    $book = Book::first();

    $book->loadCount('genres');
```

Se você precisar aplicar restrições adicionais ao comando de contagem, você pode passar uma matriz indexada pelos relacionamentos que deseja contar. Os valores da matriz devem ser fechamentos que recebem a instância do construtor de consulta:

```php
    $book->loadCount(['reviews' => function (Builder $query) {
        $query->where('rating', 5);
    }])
```

<a name="relationship-counting-and-custom-select-statements"></a>
#### Contagem de Relações e Instruções Selecionadas Personalizadas

Se você está combinando `withCount` com um `select` statement, certifique-se de chamar `withCount` depois do `select` método.

```php
    $posts = Post::select(['title', 'body'])
                    ->withCount('comments')
                    ->get();
```

<a name="other-aggregate-functions"></a>
### Funções Agregadas Diversas

Além do método 'withCount', o Eloquent fornece os métodos 'withMin', 'withMax', 'withAvg', 'withSum' e 'withExists'. Esses métodos vão colocar o atributo '{function}_{column}' no resultado do seu modelo.

```php
    use App\Models\Post;

    $posts = Post::withSum('comments', 'votes')->get();

    foreach ($posts as $post) {
        echo $post->comments_sum_votes;
    }
```

Se você quer acessar o resultado da função agregada usando outro nome, você pode especificar seu próprio apelido:

```php
    $posts = Post::withSum('comments as total_comments', 'votes')->get();

    foreach ($posts as $post) {
        echo $post->total_comments;
    }
```

Assim como o método "loadCount", as versões adiadas desses métodos também estão disponíveis. Essas operações agregadas adicionais podem ser realizadas em modelos Eloquent que já foram buscados:

```php
    $post = Post::first();

    $post->loadSum('comments', 'votes');
```

Se você está combinando esses métodos agregados com uma declaração de `select`, certifique-se de chamar os métodos agregados após a declaração de `select`:

```php
    $posts = Post::select(['title', 'body'])
                    ->withExists('comments')
                    ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
### Contagem de Modelos Relacionados em Morf para Relação

Se quiser carregar um relacionamento "morfificar para" de forma rápida e eficiente, bem como as contagens dos modelos relacionados aos diferentes entidades que podem ser retornados por esse relacionamento, você pode utilizar o método 'com' em combinação com o método 'morphWithCount' do relacionamento 'morfificar para'.

Neste exemplo vamos supor que os modelos `Photo` e `Post` possam criar modelos `ActivityFeed`. Vamos supor que o modelo `ActivityFeed` define uma relação "morph to" chamada "parentable" que permite recuperar o modelo `Photo` ou `Post` pai para uma determinada instância de `ActivityFeed`. Além disso, vamos supor que os modelos `Photo` tenham muitos modelos `Tag` e os modelos `Post` tenham muitos modelos `Comment`.

Agora, vamos imaginar que queremos recuperar as instâncias de "ActivityFeed" e carregar a antecedência os modelos dos pais "parentable" para cada instância de "ActivityFeed". Além disso, queremos obter o número de tags associadas com cada foto pai e o número de comentários associados com cada postagem pai:

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
#### Carga Atrasada de Contagem

Vamos supor que já tenhamos obtido um conjunto de modelos "ActivityFeed" e agora gostaríamos de carregar os contadores de relacionamentos aninhados para os vários modelos "parentable" associados aos feeds de atividade. Você pode usar o método "loadMorphCount" para fazer isso:

```php
    $activities = ActivityFeed::with('parentable')->get();

    $activities->loadMorphCount('parentable', [
        Photo::class => ['tags'],
        Post::class => ['comments'],
    ]);
```

<a name="eager-loading"></a>
## Carregamento Apressado

Ao acessar Eloquent relacionamentos como propriedades, os modelos relacionados são "lazy loaded". Isto significa que os dados de relacionamento não estão realmente carregados até que você primeiro acesse a propriedade. No entanto, o Eloquent pode "eager load" relacionamentos no momento em que você consulta o modelo pai. Eager loading alivia o problema da "N  + 1" consulta. Para ilustrar o problema da "N  + 1" consulta, considere um modelo "Book" que "belongs to" para um modelo de "Author":

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

Agora vamos recuperar todos os livros e seus autores:

```php
    use App\Models\Book;

    $books = Book::all();

    foreach ($books as $book) {
        echo $book->author->name;
    }
```

Este loop executará uma consulta para obter todos os livros dentro da tabela de banco de dados, então outra consulta para cada livro para recuperar o autor do livro. Então, se temos 25 livros, o código acima seria executar 26 consultas: uma para o livro original e 25 consultas adicionais para recuperar o autor de cada livro.

A sorte é que podemos usar carregamento ansioso para reduzir essa operação para apenas duas consultas. Ao construir uma consulta, você pode especificar quais relacionamentos devem ser carregados ansiosamente usando o método "com":

```php
    $books = Book::with('author')->get();

    foreach ($books as $book) {
        echo $book->author->name;
    }
```

Para essa operação, apenas dois consultas serão executadas - uma consulta para recuperar todos os livros e outra consulta para recuperar todos os autores de todos os livros.

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
#### Carga ansiosa de múltiplas relações

Às vezes você pode precisar carregar com urgência vários relacionamentos diferentes. Para fazer isso, basta passar um array de relacionamentos para o método 'with':

```php
    $books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
#### Carregamento ávido aninhado

Para carregar ansiosamente as relações de uma relação, você pode usar a sintaxe "dot". Por exemplo, vamos carregar ansiosamente todos os autores do livro e todos os contatos pessoais do autor:

```php
    $books = Book::with('author.contacts')->get();
```

Alternativamente, você pode especificar relacionamentos aninhados carregados ansiosamente fornecendo um array aninhado ao método `with`, o que pode ser conveniente quando se deseja carregar vários relacionamentos aninhados:

```php
    $books = Book::with([
        'author' => [
            'contacts',
            'publisher',
        ],
    ])->get();
```

<a name="nested-eager-loading-morphto-relationships"></a>
#### Carregamento Agressivo Aninhado 'morphTo' Relações

Se você quiser carregar ansiosamente uma relação "morphTo", bem como as relações aninhadas no vários entidades que podem ser retornados por essa relação, você pode usar o método "with" em combinação com o método "morphWith" da relação "morphTo". Para ajudar a ilustrar este método, vamos considerar o seguinte modelo:

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

No exemplo aqui, vamos supor que os modelos 'Event', 'Photo' e 'Post' são capazes de criar modelos 'ActivityFeed'. Além disso, vamos supor que 'Event' modelos pertencem a um modelo 'Calendar', 'Photo' modelos estão associados com 'Tag' modelos, e 'Post' modelos pertencem a um modelo 'Author'.

Usando essas definições de modelo e relações, podemos recuperar instâncias do modelo 'ActivityFeed' e carregar todos os modelos 'parentable' e suas respectivas relações aninhadas.

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
#### Carregar colunas específicas com urgência

Você não precisa sempre de cada coluna do relacionamento que está recuperando. Por esse motivo, Eloquent permite que você especifique quais colunas do relacionamento você gostaria de recuperar:

```php
    $books = Book::with('author:id,name,book_id')->get();
```

> [!Aviso]
> Ao usar esse recurso, você deve sempre incluir a coluna 'id' e quaisquer colunas de chave estrangeira relevantes na lista de colunas que deseja recuperar.

<a name="eager-loading-by-default"></a>
#### Carregamento agressivo por padrão

Às vezes você pode querer carregar sempre alguma relações quando recuperar um modelo. Para alcançar isto, você pode definir uma propriedade `$with` no modelo:

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

Se você gostaria de remover um item da propriedade `$with` para uma única consulta, você pode usar o método `without`:

```php
    $books = Book::without('author')->get();
```

Se você gostaria de ignorar todos os itens dentro da propriedade `$with` para uma única consulta, então pode usar o método 'withOnly':

```php
    $books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
### Ajustando cargas ansiosas

Às vezes, você pode querer carregar com urgência uma relação, mas também especificar condições de consulta adicionais para a consulta de carregamento com urgência. Você pode fazer isso passando um array de relações para o método `with` onde a chave do array é um nome de relação e o valor do array é uma função de fechamento que adiciona restrições adicionais à consulta de carregamento com urgência:

```php
    use App\Models\User;
    use Illuminate\Contracts\Database\Eloquent\Builder;

    $users = User::with(['posts' => function (Builder $query) {
        $query->where('title', 'like', '%code%');
    }])->get();
```

Em este exemplo, Eloquent só carregará os posts onde a coluna 'title' do post contém a palavra 'código'. Você pode chamar outros [metodos de construtor de consulta](/docs/queries) para personalizar ainda mais a operação de carregamento ávido:

```php
    $users = User::with(['posts' => function (Builder $query) {
        $query->orderBy('created_at', 'desc');
    }])->get();
```

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### Eager Loading de relacionamentos 'morphTo'

Se você estiver carregando com urgência um relacionamento de 'morphTo', o Eloquent fará várias consultas para cada tipo de modelo relacionado. Você pode adicionar restrições adicionais a cada uma dessas consultas usando o método 'constrain' da relação 'MorphTo':

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

No exemplo, Eloquent irá carregar somente os posts que não foram escondidos e vídeos com um valor de "tipo" de "educacional".

<a name="constraining-eager-loads-with-relationship-existence"></a>
#### Constrição de cargas ansiosas com existência de relacionamentos

Você pode se encontrar às vezes precisando verificar a existência de uma relação enquanto carrega simultaneamente a relação com base nas mesmas condições. Por exemplo, você pode desejar apenas recuperar os modelos 'Usuário' que têm modelos 'Post' filho correspondentes a uma determinada condição de consulta, ao mesmo tempo em que carrega de forma ansiosa os posts correspondentes. Você pode conseguir isso usando o método `withWhereHas`:

```php
    use App\Models\User;

    $users = User::withWhereHas('posts', function ($query) {
        $query->where('featured', true);
    })->get();
```

<a name="lazy-eager-loading"></a>
### Carregamento lento

Às vezes você pode precisar carregar uma relação de forma ansiosa depois que o modelo pai já foi buscado. Por exemplo, isso pode ser útil se você precisa decidir dinamicamente se vai carregar modelos relacionados:

```php
    use App\Models\Book;

    $books = Book::all();

    if ($someCondition) {
        $books->load('author', 'publisher');
    }
```

Se você precisar definir restrições de consulta adicionais para a consulta de carregamento ávido, você pode passar um array chaveado pelo relacionamentos que você deseja carregar. Os valores do array devem ser instâncias de fechamento que recebem a instância da consulta:

```php
    $author->load(['books' => function (Builder $query) {
        $query->orderBy('published_date', 'asc');
    }]);
```

Para carregar uma relação somente quando ela não tiver sido carregada, utilize o método `loadMissing`:

```php
    $book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
#### Loading de Nível e `morphTo`

Se você quer carregar uma relação de `morphTo`, bem como relacionamentos aninhados nos vários entidades que podem ser retornadas por essa relação, pode usar o método `loadMorph`.

Este método aceita o nome da relação "morphTo" como seu primeiro argumento e uma matriz de pares modelo/relação como segundo argumento. Para ilustrar este método, vamos considerar o seguinte modelo:

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

No exemplo, vamos assumir que os modelos de Evento, Foto e Post podem criar modelos de ActivityFeed. Além disso, vamos assumir que os modelos de Evento pertencem a um modelo de Calendário, os modelos de Fotos são associados com modelos de Etiqueta e os modelos de Post pertencem a um modelo de Autor.

Usando essas definições de modelo e relacionamentos, podemos buscar instâncias do modelo "ActivityFeed" e carregar todos os modelos "parentáveis" e seus respectivos relacionamentos aninhados:

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
### Prevenção de carregamento lento

Como discutido anteriormente, carregar as relações ansiosas pode muitas vezes fornecer benefícios significativos de desempenho para sua aplicação. Portanto, se você quiser, você pode instruir o Laravel a sempre impedir o carregamento preguiçoso das relações. Para realizar isso, você pode invocar o método `preventLazyLoading` oferecido pela classe modelo base Eloquent. Geralmente, você deve chamar este método dentro do método `boot` da classe `AppServiceProvider` da sua aplicação.

O método `preventLazyLoading` aceita um argumento opcional de boolean que indica se o carregamento lento deve ser evitado. Por exemplo, você pode querer desativar apenas o carregamento lento em ambientes não-produção para que seu ambiente de produção continue funcionando normalmente mesmo se uma relação carregada lentamente estiver presente no código de produção:

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

Depois de impedir o carregamento preguiçoso, Eloquent irá lançar uma `Illuminate\Database\LazyLoadingViolationException` quando seu aplicativo tentar carregar preguiçosamente qualquer relacionamento Eloquent.

Você pode personalizar o comportamento de violações de carregamento preguiçoso usando o método handleLazyLoadingViolationsUsing. Por exemplo, usando este método, você pode instruir violações de carregamento preguiçoso a serem registradas em vez de interromper a execução do aplicativo com exceções:

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## Inserindo e Atualizando Modelos Relacionados

<a name="the-save-method"></a>
### Método 'salvar'

O Eloquent fornece métodos convenientes para adicionar novos modelos às relações. Por exemplo, talvez você precise adicionar um novo comentário a um post. Em vez de definir manualmente o atributo 'post_id' no modelo 'Comment', você pode inserir o comentário usando o método 'save' da relação:

```php
    use App\Models\Comment;
    use App\Models\Post;

    $comment = new Comment(['message' => 'A new comment.']);

    $post = Post::find(1);

    $post->comments()->save($comment);
```

Note que nós não acessamos o relacionamento 'comentários' como uma propriedade dinâmica. Em vez disso, chamamos o método 'comentários' para obter uma instância do relacionamento. O método 'save' adicionará automaticamente o valor apropriado 'post_id' no novo modelo 'Comentário'.

Se você precisar salvar múltiplos modelos relacionados, pode usar o método `saveMany`:

```php
    $post = Post::find(1);

    $post->comments()->saveMany([
        new Comment(['message' => 'A new comment.']),
        new Comment(['message' => 'Another new comment.']),
    ]);
```

Os métodos 'salvar' e 'salvarMuitos' persistirão as instâncias do modelo dado, mas não adicionarão os novos modelos persistidos a nenhuma relação em-memória já carregada no modelo pai. Se você planeja acessar a relação após usar os métodos 'salvar' ou 'salvarMuitos', talvez seja conveniente usar o método 'refresh' para recarregar o modelo e suas relações:

```php
    $post->comments()->save($comment);

    $post->refresh();

    // All comments, including the newly saved comment...
    $post->comments;
```

<a name="the-push-method"></a>
#### Modelos e Relações Recursivas

Se você quer salvar o seu modelo e todos os relacionamentos associados a ele, use o método 'push'. Neste exemplo, o modelo 'Post' será salvo juntamente com seus comentários e os autores dos comentários:

```php
    $post = Post::find(1);

    $post->comments[0]->message = 'Message';
    $post->comments[0]->author->name = 'Author Name';

    $post->push();
```

O método "pushQuietly" pode ser usado para salvar um modelo e suas associações sem gerar nenhum evento.

```php
    $post->pushQuietly();
```

<a name="the-create-method"></a>
### O método 'create'

Além dos métodos 'save' e 'saveMany', você também pode usar o método 'create', que aceita um array de atributos, cria um modelo e o insere no banco de dados. A diferença entre 'save' e 'create' é que 'save' aceita uma instância completa Eloquent model enquanto 'create' aceita um array PHP simples. O novo modelo criado será retornado pelo método 'create':

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

Os métodos `createQuietly` e `createManyQuietly` podem ser usados para criar um modelo (s) sem enviar nenhum evento.

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

Você também pode usar os métodos `findOrNew`, `firstOrNew`, `firstOrCreate` e `updateOrCreate` para criar e atualizar modelos em relacionamentos.

> Nota:
> Antes de usar o método `create`, certifique-se de revisar a documentação de [atribuição em massa]( /docs/eloquent# mass-assignment ).

<a name="updating-belongs-to-relationships"></a>
### Relações de Pertença

Se você gostaria de atribuir um modelo infantil para o novo modelo do pai, você pode usar o método 'associar'. Neste exemplo, o modelo 'Usuário' define uma relação de 'pertence a' com o modelo 'Conta'. Este método associará definirá a chave estrangeira no modelo infantil:

```php
    use App\Models\Account;

    $account = Account::find(10);

    $user->account()->associate($account);

    $user->save();
```

Para remover um modelo de pai de um modelo de filho, você pode usar o método 'dissociate'. Este método irá definir a chave estrangeira da relação como 'null':

```php
    $user->account()->dissociate();

    $user->save();
```

<a name="updating-many-to-many-relationships"></a>
### Relações de muitos para muitos

<a name="attaching-detaching"></a>
#### Anexando / Desanexando

Além disso, Eloquent também fornece métodos para tornar o trabalho com relacionamentos muitos-para-muitos mais conveniente. Por exemplo, vamos imaginar que um usuário pode ter vários papéis e um papel pode ter vários usuários. Você pode usar o método 'attach' para anexar um papel a um usuário inserindo uma registro na tabela intermediária da relação:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->roles()->attach($roleId);
```

Ao anexar uma relação a um modelo, você também pode passar um array de dados adicionais para serem inseridos na tabela intermediária:

```php
    $user->roles()->attach($roleId, ['expires' => $expires]);
```

Às vezes pode ser necessário remover um relacionamento de vários para um usuário. Para remover um registro de relação muitos-para-muitos, use o método 'detach'. O método 'detach' irá excluir o registro apropriado da tabela intermediária; todavia, ambos os modelos permanecerão no banco de dados:

```php
    // Detach a single role from the user...
    $user->roles()->detach($roleId);

    // Detach all roles from the user...
    $user->roles()->detach();
```

Para conveniência, 'attach' e 'detach' também aceitam como entrada uma lista de ID's:

```php
    $user = User::find(1);

    $user->roles()->detach([1, 2, 3]);

    $user->roles()->attach([
        1 => ['expires' => $expires],
        2 => ['expires' => $expires],
    ]);
```

<a name="syncing-associations"></a>
#### Sincronizando Associações

Você também pode usar o método `sync` para construir associações muitos-para-muitos. O `sync` aceita um array de IDs para inserir na tabela intermediária. Qualquer ID que não esteja no array será removido da tabela intermediária. Assim, após esta operação ser completa, só os IDs no array dado existirão na tabela intermediária:

```php
    $user->roles()->sync([1, 2, 3]);
```

Você também pode passar valores adicionais da tabela intermediária com os IDs:

```php
    $user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

Se você gostaria de inserir os mesmos valores da tabela intermediária com cada um dos IDs sincronizados do modelo, você pode usar o método "syncWithPivotValues":

```php
    $user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

Se você não quiser se desprender dos IDs existentes que estão faltando no array dado, pode usar o método `syncWithoutDetaching`:

```php
    $user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
#### Ajustando Associações

O relacionamento um-para-muitos também fornece um método 'toggle' que alterna o estado de anexação dos modelos relacionados dados. Se o ID dado está atualmente anexado, ele será desmontado. Da mesma forma, se estiver atualmente desmontado, será montado.

```php
    $user->roles()->toggle([1, 2, 3]);
```

Você também pode passar valores de tabela intermediária adicionais com os ID's:

```php
    $user->roles()->toggle([
        1 => ['expires' => true],
        2 => ['expires' => true],
    ]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
#### Atualizando um Recordo na Tabela Intermediária

Se você precisar atualizar uma linha existente na tabela intermediária da sua associação, pode usar o método 'updateExistingPivot'. Este método aceita a chave estrangeira do registro intermediário e um array de atributos para atualizar.

```php
    $user = User::find(1);

    $user->roles()->updateExistingPivot($roleId, [
        'active' => false,
    ]);
```

<a name="touching-parent-timestamps"></a>
## Timestamp de Toque de Pais

Quando um modelo define uma relação de 'pertença a um' ou 'pertença a muitos' com outro modelo, como um 'comentário' que pertence a um 'post', é às vezes útil atualizar o carimbo de data/hora do pai quando o modelo filho é atualizado.

Por exemplo, quando um modelo "Comment" é atualizado, você pode querer tocar automaticamente o carimbo de data e hora do modelo "Post" para que ele seja definido para a data e hora atuais. Para fazer isso, você pode adicionar uma propriedade "touches" no seu modelo filho contendo os nomes das relações que devem ser tocadas quando o modelo filho é atualizado:

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

> [Aviso]
> Os carimbos de data e hora do modelo pai só serão atualizados se o modelo filho for atualizado usando o método Eloquent 'save'.
