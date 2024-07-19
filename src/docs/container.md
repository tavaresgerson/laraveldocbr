# Contêiner

## Introdução

O contêiner de serviços Laravel é uma ferramenta poderosa para gerenciar dependências de classes e realizar a injeção de dependência. Dependência é uma expressão sofisticada que significa essencialmente o seguinte: as dependências de classes são "injetadas" na classe via o construtor ou, em alguns casos, métodos "setter".

Vejamos um exemplo simples:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
      * Crie uma nova instância de controlador.
      */
    public function __construct(
        protected UserRepository $users,
    ) {}

    /**
      * Mostre o perfil do usuário fornecido.
      */
    public function show(string $id): View
    {
        $user = $this->users->find($id);

        return view('user.profile', ['user' => $user]);
    }
}
```

Nesse exemplo, o `UserController` precisa recuperar usuários de uma fonte de dados. Então, vamos **injetar** um serviço que é capaz de recuperar os usuários. Em contexto, a nossa `UserRepository` provavelmente usa [Eloquent](/docs/eloquent) para recuperar informações dos usuários no banco de dados. No entanto, uma vez que o repositório é injetado, podemos facilmente substituí-lo por outra implementação. Além disso, também podemos facilmente "mockear" ou criar uma implementação fictícia da `UserRepository` ao testarmos nosso aplicativo.

Uma compreensão profunda do contêiner de serviços Laravel é essencial para construir uma aplicação poderosa e grande, bem como contribuir com o núcleo Laravel em si.

### Resolução de configurações zero

Se uma classe não tiver dependências ou depender unicamente de outras classes concretas (e não interfaces), o container não precisa ser instruído sobre como resolver essa classe. Por exemplo, você pode colocar o seguinte código no seu arquivo `routes/web.php`:

```php
<?php

class Service
{
    // ...
}

Route::get('/', function (Service $service) {
    die($service::class);
});
```

Neste exemplo, quando acessarmos o caminho `/` da aplicação, automaticamente resolveremos a classe `Service` e injetaremos-lhe no controlador do caminho. Isso é uma grande mudança. Significa que podemos desenvolver nossa aplicação e usar a injeção de dependência sem nos preocuparmos com arquivos de configuração volumosos.

Felizmente, muitas das classes que você escreverá ao criar um aplicativo Laravel receberá suas dependências automaticamente através do contêiner. Isso inclui [controladores](/docs/controllers), [ouvintes de eventos](/docs/events), [middlewares](/docs/middleware) e outros. Além disso, você pode indicar as dependências no método `handle` das [tarefas agendadas](/docs/queues). Uma vez que você sinta o poder da injeção de dependência automática e sem configuração, será impossível desenvolver sem ela.

### Quando utilizar o contêiner

Graças à resolução de configurações zero, você poderá indicar dependências em rotas, controladores, eventos e outros sem nunca precisar interagir manualmente com o contêiner. Por exemplo, você pode indicar o objeto `Illuminate\Http\Request` na definição da rota para que você possa acessar facilmente o pedido atual. Apesar de não termos que interagir com o contêiner para escrever este código, ele está gerenciando a injeção dessas dependências por trás das cenas:

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

Em muitos casos, graças à injeção de dependência automática e [facades](/docs/facades), você pode construir aplicações Laravel sem **sequer** interagir manualmente com o container. Então, quando você iria interagir manualmente com o container? Vamos analisar duas situações.

Primeiro, se você escreve uma classe que implementa uma interface e deseja digitar essa interface em uma rota ou construtor de classe, você deve [dizer ao contêiner como resolver essa interface](#binding-interfaces-to-implementations). Em segundo lugar, se você estiver [escrevendo um pacote Laravel](/docs/packages) que planeja compartilhar com outros desenvolvedores Laravel, pode ser necessário vincular os serviços do seu pacote ao contêiner.

## Vínculo (Binding)

### Fundamentos de vinculação

#### Ligações simples

Quase todos os binding de contêineres de serviço serão registrados no [provedores de serviços](/docs/providers). A maioria dos exemplos demonstrará o uso do contêiner nesse contexto.

Dentro de um provedor de serviços, você sempre pode acessar o container através da propriedade `$this->app`. Podemos registrar uma vinculação usando o método `bind`, passando o nome da classe ou interface que deseja registrar junto com um closure que retorne uma instância da classe:

```php
    use App\Services\Transistor;
    use App\Services\PodcastParser;
    use Illuminate\Contracts\Foundation\Application;

    $this->app->bind(Transistor::class, function (Application $app) {
        return new Transistor($app->make(PodcastParser::class));
    });
```

Observe que recebemos o próprio container como um argumento para o resolver. Podemos, então, usar o container para resolver subdependências do objeto que estamos construindo.

Como mencionado, normalmente você interagirá com o contêiner no âmbito de provedores de serviços; no entanto, se você preferir interagir com o contêiner fora de um provedor de serviços, poderá fazer isso através do `App` [facade](/docs/facades):

```php
    use App\Services\Transistor;
    use Illuminate\Contracts\Foundation\Application;
    use Illuminate\Support\Facades\App;

    App::bind(Transistor::class, function (Application $app) {
        // ...
    });
```

Você pode utilizar o método `bindIf`, para registrar uma ligação de contêiner, apenas se já não tiver sido efetuado um registro para o tipo indicado:

```php
$this->app->bindIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

::: info NOTA
Não é necessário anexar classes ao container se elas não dependerem de nenhuma interface. O container não precisa ser instruído sobre como construir esses objetos, já que ele pode resolvê-los automaticamente usando reflexão.
:::

#### Vínculo de um singleton

O método `singleton` liga uma classe ou interface ao contêiner que deverá ser resolvido apenas uma vez. Após a resolução da vinculação do singleton, a mesma instância do objeto será retornada em chamadas subsequentes ao contêiner:

```php
    use App\Services\Transistor;
    use App\Services\PodcastParser;
    use Illuminate\Contracts\Foundation\Application;

    $this->app->singleton(Transistor::class, function (Application $app) {
        return new Transistor($app->make(PodcastParser::class));
    });
```

Você pode usar o método `singletonIf` para registrar uma associação de contêiner de singleton somente se já tiver havido um registro de associação para o tipo especificado:

```php
$this->app->singletonIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

#### Associando Escopo a Singletons

O método `scoped` liga uma classe ou interface ao contêiner, que só deve ser resolvido uma vez dentro do ciclo de vida de um pedido/trabalho no Laravel. Embora este método seja semelhante ao método `singleton`, as instâncias registradas usando o método `scoped` serão removidas sempre que o aplicativo Laravel iniciar um novo "ciclo de vida", por exemplo, quando um worker do [Laravel Octane](/docs/octane) processa um novo pedido ou quando um worker de filas do Laravel [processa um novo trabalho](/docs/queues):

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->scoped(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

#### Instruções de ligação

Você também pode incorporar uma instância de objeto existente no contêiner usando o método `instance`. A instância fornecida será sempre retornada em chamadas subsequentes ao contêiner:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;

$service = new Transistor(new PodcastParser);

$this->app->instance(Transistor::class, $service);
```

### Interface de Ligações para Implementações

Uma funcionalidade muito poderosa do contêiner de serviços é sua capacidade de vincular uma interface a uma determinada implementação. Suponhamos que temos uma interface `EventPusher` e uma implementação `RedisEventPusher`. Depois de codificarmos nossa implementação `RedisEventPusher` dessa interface, podemos registrá-la com o contêiner de serviços da seguinte maneira:

```php
use App\Contracts\EventPusher;
use App\Services\RedisEventPusher;

$this->app->bind(EventPusher::class, RedisEventPusher::class);
```

Esta declaração informa ao container que deve injectar o `RedisEventPusher` quando uma classe precisa de uma implementação do `EventPusher`. Agora, podemos indicar a interface `EventPusher` no construtor de uma classe resolvida pelo container. Lembre-se: controladores, event listeners, middleware e vários outros tipos de classes em aplicações Laravel são sempre resolvidos usando o container:

```php
  use App\Contracts\EventPusher;

  /**
   * Crie uma nova instância de classe.
   */
  public function __construct(
      protected EventPusher $pusher
  ) {}
```

### Vinculação contextual

Às vezes você pode ter duas classes que utilizem a mesma interface, mas deseja injetar implementações diferentes em cada classe. Por exemplo, dois controladores podem depender de diferentes implementações do contrato `Illuminate\Contracts\Filesystem\Filesystem`. O Laravel fornece uma interface simples e envolvente para definir esse comportamento:

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

### Comandos primitivos com ligação

Às vezes você pode ter uma classe que recebe algumas classes injetadas, mas também precisa de um valor primitivo injetado como um inteiro. Você poderá facilmente usar a vinculação contextual para injetar qualquer valor que sua classe possa necessitar:

```php
use App\Http\Controllers\UserController;

$this->app->when(UserController::class)
          ->needs('$variableName')
          ->give($value);
```

Às vezes uma classe pode depender de um conjunto de instâncias do tipo [tagged](#tagging). Usando o método `giveTagged`, você poderá injetar facilmente todos os vínculos do contêiner com esse tag:

```php
    $this->app->when(ReportAggregator::class)
        ->needs('$reports')
        ->giveTagged('reports');
```

Se você precisar injetar um valor de um arquivo de configuração do seu aplicativo, poderá usar o método `giveConfig`:

```php
    $this->app->when(ReportAggregator::class)
        ->needs('$timezone')
        ->giveConfig('app.timezone');
```

### Vínculos de Variáveis Tipadas

Ocasionalmente você pode ter uma classe que recebe um array de objetos tipificados através de um argumento do construtor:

```php
<?php

use App\Models\Filter;
use App\Services\Logger;

class Firewall
{
    /**
     * As instâncias de filtro.
     *
     * @var array
     */
    protected $filters;

    /**
     * Crie uma nova instância de classe.
     */
    public function __construct(
        protected Logger $logger,
        Filter ...$filters,
    ) {
        $this->filters = $filters;
    }
}
```

Usando uma ligação contextual, você pode resolver essa dependência fornecendo ao método `give` uma closure que retorne um array de instâncias resolvidas do tipo `Filter`:

```php
    $this->app->when(Firewall::class)
              ->needs(Filter::class)
              ->give(function (Application $app) {
                    return [
                        $app->make(NullFilter::class),
                        $app->make(ProfanityFilter::class),
                        $app->make(TooLongFilter::class),
                    ];
              });
```

Para mais praticidade, você também poderá apenas fornecer uma matriz de nomes de classes que serão resolvidas pelo contêiner sempre que o `Firewall` precisar de instâncias do `Filter`:

```php
    $this->app->when(Firewall::class)
              ->needs(Filter::class)
              ->give([
                  NullFilter::class,
                  ProfanityFilter::class,
                  TooLongFilter::class,
              ]);
```

#### Dependências de tags variáveis

Às vezes, uma classe pode ter uma dependência variável que é indicada no tipo como uma classe dada (`Report ...$reports`). Usando os métodos `needs` e `giveTagged`, você poderá facilmente injetar todas as vinculações do contêiner com a [tag](#tagging) para a dependência dada:

```php
    $this->app->when(ReportAggregator::class)
        ->needs(Report::class)
        ->giveTagged('reports');
```

### Tagging

Ocasionalmente, seja necessário resolver todos os tipos de um determinada "categoria" de ligação. Por exemplo, talvez você esteja a criar um analisador de relatórios que recebe uma matriz de várias implementações do interface `Report`. Após registrar as implementações em `Report`, você pode atribuir-lhes uma etiqueta utilizando o método `tag`:

```php
    $this->app->bind(CpuReport::class, function () {
        // ...
    });

    $this->app->bind(MemoryReport::class, function () {
        // ...
    });

    $this->app->tag([CpuReport::class, MemoryReport::class], 'reports');
```

Depois que os serviços tiverem sido rotulados, pode resolvê-los facilmente através do método `tagged` do contêiner:

```php
    $this->app->bind(ReportAnalyzer::class, function (Application $app) {
        return new ReportAnalyzer($app->tagged('reports'));
    });
```

### Estender as vinculações

O método `extend` permite modificar serviços resolvidos. Por exemplo, quando um serviço é resolvido, você pode executar códigos adicionais para decorar ou configurar o serviço. O método `extend` aceita dois argumentos: a classe de serviço que você está estendendo e uma subcláusura que deve retornar o serviço modificado. A subcláusura recebe o serviço sendo resolvido e a instância do container:

```php
    $this->app->extend(Service::class, function (Service $service, Application $app) {
        return new DecoratedService($service);
    });
```

## Resolver

### O método `make`

Você pode usar o método `make` para resolver uma instância de classe do container. O método `make` aceita o nome da classe ou interface que você deseja resolver:

```php
    use App\Services\Transistor;

    $transistor = $this->app->make(Transistor::class);
```

Se algumas dependências da classe não forem resolvidas através do container, você pode injetá-las passando um array associativo para a metho `makeWith`. Por exemplo, podemos passar manualmente o argumento de construtor `$id` necessário ao serviço `Transistor`:

```php
    use App\Services\Transistor;

    $transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);
```

O método `bound()` pode ser usado para determinar se uma classe ou interface foi vinculada explicitamente no container:

```php
    if ($this->app->bound(Transistor::class)) {
        // ...
    }
```

 Se você estiver fora de um provedor de serviços em uma localização do seu código que não tenha acesso à variável `$app`, poderá usar a facade `App` [Facade](/docs/facades) ou o [Helper](/docs/helpers#method-app) `app` para resolver uma instância de classe no contêiner.

```php
    use App\Services\Transistor;
    use Illuminate\Support\Facades\App;

    $transistor = App::make(Transistor::class);

    $transistor = app(Transistor::class);
```

 Se você gostaria que a própria instância do contêiner Laravel fosse injetada em uma classe resolvida pelo contêiner, você poderá usar o tipo de dica da `Illuminate\Container\Container` no construtor da sua classe:

```php
    use Illuminate\Container\Container;

    /**
     * Crie uma nova instância de classe.
     */
    public function __construct(
        protected Container $container
    ) {}
```

### Injeção automática

Como alternativa e mais importante, você pode indicar a dependência no construtor de uma classe que é resolvida pelo contêiner, incluindo [controladores](/docs/controllers), [ouvintes de eventos](/docs/events), [middleware](/docs/middleware) e outros. Além disso, você pode indicar dependências no método `handle` de [trabalhos agendados](/docs/queues). Na prática, é dessa maneira que a maioria dos seus objetos deve ser resolvida pelo contêiner.

 Por exemplo, você pode indicar o tipo de um repositório definido pela aplicação no construtor do controlador. O repositório será resolvido e injetado automaticamente na classe:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Crie uma nova instância de controlador.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}

    /**
     * Mostre o usuário com o ID fornecido.
     */
    public function show(string $id): User
    {
        $user = $this->users->findOrFail($id);

        return $user;
    }
}
```

## Chamada de método e injeção

Às vezes, pode ser interessante invocar um método numa instância de objeto e permitir que o contêiner insira as suas dependências automaticamente. Por exemplo, dada a seguinte classe:

```php
<?php

namespace App;

use App\Repositories\UserRepository;

class UserReport
{
    /**
     * Generate a new user report.
     */
    public function generate(UserRepository $repository): array
    {
        return [
            // ...
        ];
    }
}
```

É possível invocar o método `generate` através do container da seguinte forma:

```php
    use App\UserReport;
    use Illuminate\Support\Facades\App;

    $report = App::call([new UserReport, 'generate']);
```

O método `call` aceita qualquer objeto de chamada em PHP. O método do container `call` pode até ser usado para invocar um closures injetando automaticamente suas dependências:

```php
    use App\Repositories\UserRepository;
    use Illuminate\Support\Facades\App;

    $result = App::call(function (UserRepository $repository) {
        // ...
    });
```

## Eventos do container

O contêiner de serviço dispara um evento a cada vez que resolve um objeto. Você pode ouvir este evento usando o método `resolving`:

```php
    use App\Services\Transistor;
    use Illuminate\Contracts\Foundation\Application;

    $this->app->resolving(Transistor::class, function (Transistor $transistor, Application $app) {
        // Chamado quando o contêiner resolve objetos do tipo "Transistor"...
    });

    $this->app->resolving(function (mixed $object, Application $app) {
        // Chamado quando o contêiner resolve objeto de qualquer tipo...
    });
```

Como você pode ver, o objeto em resolução será passado para o retorno do método, permitindo que você defina quaisquer propriedades adicionais no objeto antes de ele ser passado ao consumidor.

## PSR-11

O contêiner de serviços do Laravel implementa a interface [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md). Portanto, você pode indicar o tipo da interface do contêiner PSR-11 para obter uma instância do contêiner Laravel:

```php
use App\Services\Transistor;
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get(Transistor::class);

    // ...
});
```

Uma exceção é lançada se o identificador for não resolvido. Se o identificador nunca tiver sido vinculado, a exceção será uma instância de `Psr\Container\NotFoundExceptionInterface`. Se o identificador tiver sido vinculado, mas não puder ser resolvido, é lançada uma instância de `Psr\Container\ContainerExceptionInterface`.
