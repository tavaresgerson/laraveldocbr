# Service Container

## Introdução
O contêiner de serviço do Laravel é uma ferramenta poderosa para gerenciar dependências de classe e executar injeção 
de dependência. Injeção de dependência é uma frase sofisticada que significa essencialmente isso: as dependências 
de classe são "injetadas" na classe por meio do construtor ou, em alguns casos, dos métodos "setter".

Vejamos um exemplo simples:

``` php
<?php

namespace App\Http\Controllers;

use App\User;
use App\Repositories\UserRepository;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
     * A implementação do repositório do usuário.
     *
     * @var UserRepository
     */
    protected $users;

    /**
     * Crie uma nova instância do controlador.
     *
     * @param  UserRepository  $users
     * @return void
     */
    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    /**
     * Mostrar o perfil para o usuário especificado.
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id)
    {
        $user = $this->users->find($id);

        return view('user.profile', ['user' => $user]);
    }
}
```

Neste exemplo, o `UserController` precisa recuperar usuários de uma fonte de dados. Portanto, injetaremos um serviço 
capaz de recuperar usuários. Nesse contexto, nosso `UserRepository` provavelmente usa o Eloquent para recuperar 
informações do usuário no banco de dados. No entanto, como o repositório é injetado, podemos trocá-lo facilmente 
por outra implementação. Também podemos facilmente criar uma implementação fictícia do `UserRepository` 
ao testar nosso aplicativo.

Um conhecimento profundo do contêiner de serviço do Laravel é essencial para criar um aplicativo grande e poderoso,
além de contribuir para o próprio núcleo do Laravel.

## Binding

### Noções básicas de binding

Quase todos os bindings do [contêiner de serviço](https://laravel.com/docs/5.8/providers) serão registradas nos provedores de serviços; portanto, a maioria 
desses exemplos demonstrará o uso do contêiner nesse contexto.

> Não há necessidade de vincular classes ao contêiner se elas não dependem de nenhuma interface. O contêiner não 
> precisa ser instruído sobre como criar esses objetos, pois ele pode resolvê-los automaticamente usando reflexão.

### Binding simples
Dentro de um provedor de serviços, você sempre tem acesso ao contêiner por meio da propriedade `$this->app`. Podemos 
registrar uma ligação usando o método bind, passando o nome da classe ou da interface que desejamos registrar junto 
com um Closure que retorna uma instância da classe:

``` php
$this->app->bind('HelpSpot\API', function ($app) {
    return new HelpSpot\API($app->make('HttpClient'));
});
```
Observe que recebemos o próprio contêiner como argumento para o resolvedor. Podemos então usar o contêiner para 
resolver as subdependências do objeto que estamos construindo.

### Instâncias de binding
Você também pode vincular uma instância de objeto existente ao contêiner usando o método de instância. A instância 
fornecida sempre será retornada nas chamadas subsequentes para o contêiner:

``` php
$api = new HelpSpot\API(new HttpClient);

$this->app->instance('HelpSpot\API', $api);
```

### Bindings primitivos
Às vezes, você pode ter uma classe que recebe algumas classes injetadas, mas também precisa de um valor primitivo 
injetado, como um número inteiro. Você pode usar facilmente a ligação contextual para injetar qualquer valor que 
sua classe possa precisar:

``` php
$this->app->when('App\Http\Controllers\UserController')
          ->needs('$variableName')
          ->give($value);
```

## Binding de interfaces para implementações
Um recurso muito poderoso do contêiner de serviço é sua capacidade de vincular uma interface a uma determinada 
implementação. Por exemplo, vamos supor que temos uma interface `EventPusher` e uma implementação `RedisEventPusher`. 
Depois de codificar nossa implementação `RedisEventPusher` dessa interface, podemos registrá-la no contêiner de 
serviço da seguinte forma:

``` php
$this->app->bind(
    'App\Contracts\EventPusher',
    'App\Services\RedisEventPusher'
);
```

Esta declaração informa ao contêiner que ele deve injetar o `RedisEventPusher` quando uma classe precisar de uma 
implementação do `EventPusher`. Agora podemos digitar a interface `EventPusher` em um construtor ou em qualquer outro 
local onde as dependências são injetadas pelo contêiner de serviço:

``` php
use App\Contracts\EventPusher;

/**
 * Crie uma nova instância de classe.
 *
 * @param  EventPusher  $pusher
 * @return void
 */
public function __construct(EventPusher $pusher)
{
    $this->pusher = $pusher;
}
```

## Binding contextual
Às vezes, você pode ter duas classes que utilizam a mesma interface, mas deseja injetar implementações 
diferentes em cada classe. Por exemplo, dois controladores podem depender de implementações diferentes do 
contrato `Illuminate\Contracts\Filesystem\Filesystem`. O Laravel fornece uma interface simples e fluente 
para definir esse comportamento:

``` php
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\VideoController;
use Illuminate\Contracts\Filesystem\Filesystem;

$this->app->when(PhotoController::class)
          ->needs(Filesystem::class)
          ->give(function () {
              return Storage::disk('local');
          });

$this->app->when([VideoController::class, UploadController::class])
          ->needs(Filesystem::class)
          ->give(function () {
              return Storage::disk('s3');
          });
```

## Tagging
Ocasionalmente, pode ser necessário resolver toda uma determinada "categoria" de ligação. Por exemplo, talvez 
você esteja criando um agregador de relatórios que receba uma matriz de muitas implementações diferentes da 
interface do `Report`. Após registrar as implementações do `Report`, você pode atribuir a eles uma tag usando 
o método tag:

``` php
$this->app->bind('SpeedReport', function () {
    //
});

$this->app->bind('MemoryReport', function () {
    //
});

$this->app->tag(['SpeedReport', 'MemoryReport'], 'reports');
```


