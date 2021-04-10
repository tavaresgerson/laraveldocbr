# Service Container

## Introdução
O container de serviço Laravel é uma ferramenta poderosa para gerenciar dependências de classes e executar injeção de dependências. 
A injeção de dependência é uma frase sofisticada que essencialmente significa o seguinte: as dependências da classe são "injetadas" na 
classe por meio do construtor ou, em alguns casos, dos métodos "setter".

Vejamos um exemplo simples:
```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Repositories\UserRepository;
use App\Models\User;

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
     * Mostra o perfil de um determinado usuário.
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

Neste exemplo, é necessário que UserController recupere usuários de uma fonte de dados. Então, vamos injetar um serviço capaz de recuperar usuários. 
Nesse contexto, nosso `UserRepository` provavelmente usa o Eloquent para recuperar informações do usuário do banco de dados. No entanto, como o 
repositório é injetado, podemos trocá-lo facilmente por outra implementação. Também podemos "simular" facilmente ou criar uma implementação 
fictícia do `UserRepository` ao testar nosso aplicativo.

Um profundo conhecimento do contêiner de serviço do Laravel é essencial para construir um aplicativo poderoso e grande, bem como para contribuir com o 
próprio núcleo do Laravel.

### Resolução de configuração zero
Se uma classe não tem dependências ou depende apenas de outras classes concretas (não interfaces), o contêiner não precisa ser instruído sobre como resolver 
essa classe. Por exemplo, você pode colocar o seguinte código em seu arquivo `routes/web.php`:

```php
<?php

class Service
{
    //
}

Route::get('/', function (Service $service) {
    die(get_class($service));
});
```

Neste exemplo, acertar a rota `/` do seu aplicativo irá resolver automaticamente a classe `Service` e injetá-la no manipulador de sua rota. Isso é uma mudança de 
jogo. Isso significa que você pode desenvolver seu aplicativo e aproveitar as vantagens da injeção de dependência sem se preocupar com arquivos de configuração inchados.

Felizmente, muitas das classes que você escreverá ao construir um aplicativo Laravel recebem automaticamente suas dependências através do contêiner, incluindo 
controladores, ouvintes de eventos, middleware e muito mais. Além disso, você pode digitar type-hint no método `handle` de trabalhos em fila. Depois de experimentar
o poder da injeção de dependência de configuração automática e zero, parece impossível desenvolver sem ela.

### Quando usar o Container
Graças à resolução de configuração zero, muitas vezes você digitará dependências de typehint em rotas, controladores, ouvintes de eventos e outros lugares, sem 
nunca interagir manualmente com o contêiner. Por exemplo, você pode digitar o typehint do objeto `Illuminate\Http\Request` em sua definição de rota para que possa 
acessar facilmente a solicitação atual. Mesmo que nunca tenhamos que interagir com o contêiner para escrever este código, ele está gerenciando a injeção dessas 
dependências nos bastidores:

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

Em muitos casos, graças à injeção automática de dependências e fachadas , você pode construir aplicativos Laravel sem nunca vincular manualmente ou resolver nada 
do contêiner. Então, quando você interagiria manualmente com o contêiner? Vamos examinar duas situações.

Primeiro, se você escrever uma classe que implemente uma interface e desejar dar uma dica de tipo a essa interface em uma rota ou construtor de classe, 
será necessário informar ao contêiner como resolver essa interface. Em segundo lugar, se você está escrevendo um pacote Laravel que planeja compartilhar 
com outros desenvolvedores Laravel, pode ser necessário vincular os serviços do seu pacote ao contêiner.

## Ligação (Binding)

### Básico sobre ligação

#### Ligações Simples
Quase todas as ligações do contêiner de serviço serão registradas nos provedores de serviço, portanto, a maioria desses exemplos demonstrará o uso do 
contêiner nesse contexto.

Em um provedor de serviços, você sempre tem acesso ao contêiner por meio da propriedade `$this->app`. Podemos registrar uma ligação usando o métood `bind`, 
passando o nome da classe ou interface que desejamos registrar junto com um encerramento que retorna uma instância da classe:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;

$this->app->bind(Transistor::class, function ($app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

Observe que recebemos o próprio contêiner como um argumento para o resolvedor. Podemos então usar o contêiner para resolver subdependências do objeto que 
estamos construindo.

Conforme mencionado, você normalmente estará interagindo com o contêiner dentro dos provedores de serviço; no entanto, se desejar interagir com o contêiner 
fora de um provedor de serviços, você pode fazer isso por meio da facade App:

```php
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

App::bind(Transistor::class, function ($app) {
    // ...
});
```

> Não há necessidade de vincular classes ao contêiner se elas não dependerem de nenhuma interface. O contêiner não precisa ser instruído sobre como construir esses 
> objetos, pois pode resolver esses objetos automaticamente usando reflexão.

### Ligação simples
O método `singleton` vincula uma classe ou interface ao contêiner que deve ser resolvido apenas uma vez. Assim que uma ligação singleton for resolvida, a mesma 
instância do objeto será retornada em chamadas subsequentes para o contêiner:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;

$this->app->singleton(Transistor::class, function ($app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

### Instâncias de ligação
Você também pode vincular uma instância de objeto existente ao contêiner usando o método `instance`. A instância fornecida sempre será retornada em chamadas 
subsequentes no contêiner:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;

$service = new Transistor(new PodcastParser);

$this->app->instance(Transistor::class, $service);
```

### Vinculando Interfaces para Implementações
Um recurso muito poderoso do contêiner de serviço é sua capacidade de vincular uma interface a uma determinada implementação. Por exemplo, vamos supor que temos uma
interface `EventPusher` e uma implementação `RedisEventPusher`. Depois de codificar nossa implementação `RedisEventPusher` dessa interface, podemos registrá-la no 
contêiner de serviço da seguinte forma:

```php
use App\Contracts\EventPusher;
use App\Services\RedisEventPusher;

$this->app->bind(EventPusher::class, RedisEventPusher::class);
```

Essa instrução informa ao contêiner que ele deve injetar `RedisEventPusher` quando uma classe precisa de uma implementação de EventPusher. Agora podemos sugerir a
`EventPusherinterface` no construtor de uma classe que é resolvida pelo contêiner. Lembre-se, controladores, ouvintes de eventos, middleware e vários outros tipos
de classes nos aplicativos Laravel são sempre resolvidos usando o contêiner:

```pho=p
use App\Contracts\EventPusher;

/**
 * Create a new class instance.
 *
 * @param  \App\Contracts\EventPusher  $pusher
 * @return void
 */
public function __construct(EventPusher $pusher)
{
    $this->pusher = $pusher;
}
```

### Vinculação contextual
Às vezes, você pode ter duas classes que utilizam a mesma interface, mas deseja injetar implementações diferentes em cada classe. Por exemplo, dois controladores 
podem depender de diferentes implementações do contrato `Illuminate\Contracts\Filesystem\Filesystem`. O Laravel fornece uma interface simples e fluente para definir
este comportamento:

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\VideoController;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

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

### Ligações Primitivas
Às vezes, você pode ter uma classe que recebe algumas classes injetadas, mas também precisa de um valor primitivo injetado, como um inteiro. Você pode usar 
facilmente a vinculação contextual para injetar qualquer valor que sua classe possa precisar:

```php
$this->app->when('App\Http\Controllers\UserController')
          ->needs('$variableName')
          ->give($value);
```

Às vezes, uma classe pode depender de uma matriz de instâncias marcadas. Usando o método `giveTagged`, você pode facilmente injetar todas as ligações do contêiner 
com essa tag:

```php
$this->app->when(ReportAggregator::class)
    ->needs('$reports')
    ->giveTagged('reports');
```

Se precisar injetar um valor de um dos arquivos de configuração do seu aplicativo, você pode usar o método `giveConfig`:

```
$this->app->when(ReportAggregator::class)
    ->needs('$timezone')
    ->giveConfig('app.timezone');
```

### Ligação de Tipos Váriados
Ocasionalmente, você pode ter uma classe que recebe uma matriz de objetos digitados usando um argumento de construtor váriavel:

```php
<?php

use App\Models\Filter;
use App\Services\Logger;

class Firewall
{
    /**
     * The logger instance.
     *
     * @var \App\Services\Logger
     */
    protected $logger;

    /**
     * The filter instances.
     *
     * @var array
     */
    protected $filters;

    /**
     * Create a new class instance.
     *
     * @param  \App\Services\Logger  $logger
     * @param  array  $filters
     * @return void
     */
    public function __construct(Logger $logger, Filter ...$filters)
    {
        $this->logger = $logger;
        $this->filters = $filters;
    }
}
```

Usando a vinculação contextual, você pode resolver essa dependência fornecendo ao método `give` um encerramento que retorna uma matriz de instâncias `Filter` resolvidas :

```php
$this->app->when(Firewall::class)
          ->needs(Filter::class)
          ->give(function ($app) {
                return [
                    $app->make(NullFilter::class),
                    $app->make(ProfanityFilter::class),
                    $app->make(TooLongFilter::class),
                ];
          });
```

Por conveniência, você também pode fornecer apenas uma matriz de nomes de classes a serem resolvidos pelo contêiner sempre que `Firewall` precisar de instâncias
`Filter`:

```php
$this->app->when(Firewall::class)
          ->needs(Filter::class)
          ->give([
              NullFilter::class,
              ProfanityFilter::class,
              TooLongFilter::class,
          ]);
```

#### Dependências de tag variável
Às vezes, uma classe pode ter uma dependência variável que é sugerida pelo tipo como uma determinada classe (`Report ...$reports`). Usando os métodos `needs` e `giveTagged`,
você pode facilmente injetar todas as ligações de contêiner com essa tag para a dependência fornecida:

```php
$this->app->when(ReportAggregator::class)
    ->needs(Report::class)
    ->giveTagged('reports');
```

### Tagging
Ocasionalmente, você pode precisar resolver tudo de uma certa "categoria" de ligação. Por exemplo, talvez você esteja construindo um analisador de relatório que 
recebe uma série de muitas implementações `Report` de interface diferentes. Depois de registrar as implementações `Report`, você pode atribuir a elas uma tag 
usando o método `tag`:

```php
$this->app->bind(CpuReport::class, function () {
    //
});

$this->app->bind(MemoryReport::class, function () {
    //
});

$this->app->tag([CpuReport::class, MemoryReport::class], 'reports');
```

Depois que os serviços forem marcados, você pode resolvê-los facilmente por meio do método `tagged` do contêiner:

```php
$this->app->bind(ReportAnalyzer::class, function ($app) {
    return new ReportAnalyzer($app->tagged('reports'));
});
```

### Estendendo Ligações
O método `extend` permite a modificação dos serviços resolvidos. Por exemplo, quando um serviço é resolvido, você pode executar código adicional para decorar 
ou configurar o serviço. O método `extend` aceita um encerramento, que deve retornar o serviço modificado, como seu único argumento. O encerramento recebe o 
serviço que está sendo resolvido e a instância do contêiner:

```php
$this->app->extend(Service::class, function ($service, $app) {
    return new DecoratedService($service);
});
```

## Resolvendo

### O método `make`
Você pode usar o método `make` para resolver uma instância de classe do contêiner. O método `make` aceita o nome da classe ou interface que você deseja resolver:

```php
use App\Services\Transistor;

$transistor = $this->app->make(Transistor::class);
```

Se algumas das dependências de sua classe não puderem ser resolvidas por meio do contêiner, você pode injetá-las passando-as como uma matriz associativa no 
método `makeWith`. Por exemplo, podemos passar manualmente o argumento `$id` do construtor exigido pelo serviço `Transistor`:

```php
use App\Services\Transistor;

$transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);
```

Se você estiver fora de um provedor de serviços em um local de seu código que não tem acesso à váriavel `$app`, você pode usar a facade `App` para 
resolver uma instância de classe do contêiner:

```php
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

$transistor = App::make(Transistor::class);
```

Se você gostaria que a própria instância do contêiner do Laravel fosse injetada em uma classe que está sendo resolvida pelo contêiner, você pode 
digitar a classe `Illuminate\Container\Container` no construtor de sua classe:

```php
use Illuminate\Container\Container;

/**
 * Create a new class instance.
 *
 * @param  \Illuminate\Container\Container  $container
 * @return void
 */
public function __construct(Container $container)
{
    $this->container = $container;
}
```

### Injeção Automática
Como alternativa, e mais importante, você pode sugerir a dependência no construtor de uma classe que é resolvida pelo contêiner, incluindo controladores, 
ouvintes de eventos, middleware e muito mais. Além disso, você pode digitar dependências de typehint no método `handle` de trabalhos em fila. Na prática, 
é assim que a maioria dos seus objetos deve ser resolvida pelo contêiner.

Por exemplo, você pode definir um type-hint na sua aplicação em um construtor de controlador. O repositório será automaticamente resolvido e injetado na classe:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * The user repository instance.
     *
     * @var \App\Repositories\UserRepository
     */
    protected $users;

    /**
     * Create a new controller instance.
     *
     * @param  \App\Repositories\UserRepository  $users
     * @return void
     */
    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    /**
     * Show the user with the given ID.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }
}
```

## Eventos de contêiner
O contêiner de serviço dispara um evento sempre que resolve um objeto. Você pode ouvir este evento usando o método `resolving`:

```php
use App\Services\Transistor;

$this->app->resolving(Transistor::class, function ($transistor, $app) {
    // Called when container resolves objects of type "Transistor"...
});

$this->app->resolving(function ($object, $app) {
    // Called when container resolves object of any type...
});
```

Como você pode ver, o objeto que está sendo resolvido será passado para o retorno de chamada, permitindo que você defina quaisquer propriedades adicionais no 
objeto antes que ele seja fornecido ao seu consumidor.

## PSR-11
O container de serviço do Laravel implementa a interface PSR-11. Portanto, você pode digitar uma type-hint na interface do contêiner PSR-11 para obter uma instância 
do contêiner Laravel:

```php
use App\Services\Transistor;
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get(Transistor::class);

    //
});
```

Uma exceção é lançada se o identificador fornecido não puder ser resolvido. A exceção será uma instância de `Psr\Container\NotFoundExceptionInterfaces` e o 
identificador nunca foi vinculado. Se o identificador foi vinculado, mas não pôde ser resolvido, uma instância de `Psr\Container\ContainerExceptionInterface` 
será lançada.
