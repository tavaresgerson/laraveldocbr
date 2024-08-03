# Filas

<a name="introduction"></a>
## Introdução

Ao construir sua aplicação da Web, pode ocorrer de haver tarefas que levam muito tempo para serem concluídas durante uma solicitação Web normal, como analisar e armazenar um arquivo CSV enviado. No entanto, o Laravel permite criar facilmente tarefas agendadas, que podem ser processadas em segundo plano. Ao mover tarefas intensivas de tempo para a fila de espera, a sua aplicação responderá às solicitações com velocidade incrível e fornecerá uma melhor experiência aos seus clientes.

As filas do Laravel fornecem uma API de enfileiramento unificada em uma variedade de backends de filas diferentes, como [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io) ou até mesmo um banco de dados relacional.

As opções de configuração da fila do Laravel são armazenadas no arquivo de configuração `config/queue.php` de sua aplicação. Neste arquivo, você encontrará as configurações de conexão para cada um dos drivers de filas incluídos no framework, incluindo os drivers de banco de dados, [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), e [Beanstalkd](https://beanstalkd.github.io/), bem como um driver síncrono que executará os trabalhos imediatamente (para uso durante o desenvolvimento local). Um driver de fila `null` também é incluído, que descarta os trabalhos em filas.

::: info NOTA
O Laravel agora oferece o Horizon, um lindo painel e sistema de configuração para suas filas alimentadas pelo Redis. Confira a [documentação completa do Horizon](/docs/horizon) para mais informações.
:::

<a name="connections-vs-queues"></a>
### Conexões vs. filas

Antes de começar com as filas do Laravel, é importante entender a distinção entre "conexões" e "filas". No arquivo de configuração `config/queue.php`, existe um array de configuração chamado `connections`. Esta opção define as conexões para serviços de filas de fundo, como o Amazon SQS, Beanstalk ou Redis. Contudo, qualquer conexão da fila pode ter várias "filas", que podem ser pensadas como pilhas diferentes de tarefas agendadas.

Observe que cada exemplo de configuração de conexão no arquivo de configuração `queue` contém um atributo `queue`. Essa é a fila padrão à qual os trabalhos serão enviados quando forem adicionados para uma determinada conexão. Em outras palavras, se você enviar um trabalho sem definir explicitamente em que fila ele deve ser enviado, o trabalho será colocado na fila definida no atributo `queue` da configuração de conexão:

```php
    use App\Jobs\ProcessPodcast;

    // Este trabalho é enviado para a fila padrão da conexão padrão...
    ProcessPodcast::dispatch();

    // Este trabalho é enviado para a fila de "e-mails" da conexão padrão...
    ProcessPodcast::dispatch()->onQueue('emails');
```

Algumas aplicações podem não precisar submeter tarefas para várias filas, preferindo ter uma fila simples. No entanto, submeter tarefas para várias filas pode ser especialmente útil para aplicações que desejam priorizar ou segmentar a forma como as tarefas são processadas, uma vez que o _worker_ de filas do Laravel permite especificar quais filas devem ser processadas por ordem de prioridade. Por exemplo, submeter tarefas para uma `high` fila, poderá executar um _worker_ com maior prioridade de processamento:

```shell
php artisan queue:work --queue=high,default
```

<a name="driver-prerequisites"></a>
### Notas do driver e pré-requisitos

<a name="database"></a>
#### Base de dados

Para usar o driver de fila `database`, você precisará de uma tabela de banco de dados para conter os trabalhos. Normalmente, isso estará incluído na migração padrão do Laravel chamado `0001_01_01_000002_create_jobs_table.php` através da [_migration_](/docs/migrations); no entanto, se seu aplicativo não contiver esta migração, você poderá criá-la usando o comando `make:queue-table`:

```shell
php artisan make:queue-table

php artisan migrate
```

<a name="redis"></a>
#### O Redis

Para utilizar o driver de fila `redis`, você deve configurar uma conexão ao banco de dados Redis em seu arquivo de configuração `config/database.php`.

 > [AVISO]
 > As opções do Redis: `serializer` e `compression` não são suportadas pelo driver de fila `redis`.

 **Cluster Redis

Se sua conexão de fila do Redis usar um Redis Cluster, seus nomes de filas devem conter uma [tag de hash de chave](https://redis.io/docs/reference/cluster-spec/#hash-tags). Isso é necessário para garantir que todas as chaves do Redis de uma determinada fila sejam colocadas na mesma posição no slot hash:

```php
    'redis' => [
        'driver' => 'redis',
        'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
        'queue' => env('REDIS_QUEUE', '{default}'),
        'retry_after' => env('REDIS_QUEUE_RETRY_AFTER', 90),
        'block_for' => null,
        'after_commit' => false,
    ],
```

**Bloqueio**

Ao usar a fila do Redis, você pode utilizar a opção de configuração `block_for` para especificar quanto tempo o driver deve aguardar que um trabalho seja disponibilizado antes de percorrer novamente o loop de trabalhadores e realizar uma nova consulta na base de dados do Redis.

Ajustar este valor com base na carga da fila pode ser mais eficiente do que continuamente pesquisar no banco de dados Redis para novos trabalhos. Por exemplo, você pode definir o valor como `5` para indicar que o driver deve ficar bloqueado por cinco segundos aguardando a disponibilidade de um novo trabalho:

```php
    'redis' => [
        'driver' => 'redis',
        'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => env('REDIS_QUEUE_RETRY_AFTER', 90),
        'block_for' => 5,
        'after_commit' => false,
    ],
```

::: warning ATENÇÃO
Ao definir `block_for` para `0`, os processos de fila bloqueiam indefinidamente até que haja um trabalho disponível. Isso também impedirá que sinais como o `SIGTERM` sejam executados até o próximo trabalho ser processado.
:::

<a name="other-driver-prerequisites"></a>
#### Outros pré-requisitos do driver

As dependências a seguir são necessárias para os drivers de filas listados abaixo. Essas dependências podem ser instaladas pelo gerenciador de pacotes do Composer:

 - Amazon SQS: `aws/aws-sdk-php ~3.0`
 - Beanstalkd: `pda/pheanstalk ~5.0`
 - Redis: 'predis/predis ~2.0' ou extensão PHP phpredis

<a name="creating-jobs"></a>
## Criação de trabalhos

<a name="generating-job-classes"></a>
### Gerando classes de trabalho

Por padrão, todos os trabalhos agendáveis da sua aplicação são armazenados no diretório `app/Jobs`. Se o diretório `app/Jobs` não existir, será criado quando executar o comando Artisan `make:job`:

```shell
php artisan make:job ProcessPodcast
```

A classe gerada irá implementar a interface `Illuminate\Contracts\Queue\ShouldQueue`, indicando ao Laravel que o trabalho deve ser adicionado à fila para ser executado de maneira assíncrona.

::: info NOTA
Os stubs de trabalho podem ser personalizados usando a [publicação de stubs](/docs/artisan#stub-customization).
:::

<a name="class-structure"></a>
### Estrutura da Classe

As classes de tarefas são muito simples e normalmente contêm apenas um método `handle`, que é invocado quando a tarefa é processada pela fila. Para começar, vamos dar uma olhada em uma classe de tarefa de exemplo. Neste exemplo, suponhamos que gerenciemos um serviço de publicação de podcasts e precisarmos processar arquivos de podcasts carregados antes que eles sejam publicados:

```php
    <?php

    namespace App\Jobs;

    use App\Models\Podcast;
    use App\Services\AudioProcessor;
    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Foundation\Bus\Dispatchable;
    use Illuminate\Queue\InteractsWithQueue;
    use Illuminate\Queue\SerializesModels;

    class ProcessPodcast implements ShouldQueue
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        /**
         * Crie uma nova instância de trabalho.
         */
        public function __construct(
            public Podcast $podcast,
        ) {}

        /**
         * Execute o trabalho.
         */
        public function handle(AudioProcessor $processor): void
        {
            // Processar podcast carregado...
        }
    }
```

Neste exemplo, observe que passamos um modelo [Eloquent](/docs/eloquent) diretamente para o construtor do trabalho em fila de espera. Em razão da _trait_ `SerializesModels` que o trabalho está usando, os modelos Eloquent e suas relações carregadas serão serializados e desserializados quando o trabalho estiver processando.

Se o trabalho em fila aceitar um modelo Eloquent no construtor, apenas o identificador do modelo será serializado na fila. Quando o trabalho for realmente tratado, o sistema de filas irá recuperar automaticamente a instância completa de modelos e seus relacionamentos da base de dados. Este método para a serialização de modelos permite que os pacotes de trabalhos enviados ao seu driver da fila sejam muito menores.

<a name="handle-method-dependency-injection"></a>
#### Injeção de dependência do método `handle`

O método `handle` é invocado quando o trabalho é processado na fila. Note que podemos indicar dependências para o método `handle` do _worker_. O [conjunto de serviços](/docs/container) do Laravel injeta essas dependências automaticamente.

Se deseja ter total controle sobre como o container injeta dependências no método `handle`, você poderá utilizar a método `bindMethod` do container. O método `bindMethod` aceita uma _callback_ que recebe o _job_ e o container. Dentro desse _callback_, você poderá invocar a método `handle` da maneira que quiser. Geralmente, é possível chamar essa método a partir do método `boot` do seu [fornecedor de serviços](/docs/providers) `App\Providers\AppServiceProvider`:

```php
    use App\Jobs\ProcessPodcast;
    use App\Services\AudioProcessor;
    use Illuminate\Contracts\Foundation\Application;

    $this->app->bindMethod([ProcessPodcast::class, 'handle'], function (ProcessPodcast $job, Application $app) {
        return $job->handle($app->make(AudioProcessor::class));
    });
```

::: warning ATENÇÃO
Dados binários, tais como conteúdos de imagem brutos, devem ser passados através da função `base64_encode` antes de serem enviados para um trabalho em fila. Caso contrário, o trabalho pode não ser serializado corretamente para JSON ao ser colocado na fila.
:::

<a name="handling-relationships"></a>
#### Relações em fila

Como todas as relações de modelo carregado também são serializadas quando um trabalho é agendado, às vezes o texto da tarefa serializada pode ficar muito grande. Além disso, quando uma tarefa é deserializada e as relações do modelo são novamente recuperadas do banco de dados, será possível recuperá-las por completo. Quaisquer restrições de relacionamento anteriores aplicadas antes da serialização do modelo durante o processo de agendamento de tarefas não serão aplicadas quando a tarefa for deserializada. Portanto, caso pretenda trabalhar com um subconjunto de uma determinada relação, você deve restringir novamente essa relação em seu trabalho agendado.

Ou, para evitar que as relações sejam serializadas, você pode chamar o método `withoutRelations` no modelo ao definir um valor de propriedade. Este método retornará uma instância do modelo sem suas relações carregadas:

```php
    /**
     * Crie uma nova instância de trabalho.
     */
    public function __construct(Podcast $podcast)
    {
        $this->podcast = $podcast->withoutRelations();
    }
```

Se você estiver usando a propriedade de promoção do construtor PHP e desejar indicar que um modelo Eloquent não deve ter suas relações serializadas, você poderá usar o atributo `WithoutRelations`:

```php
    use Illuminate\Queue\Attributes\WithoutRelations;

    /**
     * Crie uma nova instância de trabalho.
     */
    public function __construct(
        #[WithoutRelations]
        public Podcast $podcast
    ) {
    }
```

Se um processo receber uma coleção ou matriz de modelos Eloquent em vez de apenas um modelo, os modelos dessa coleção não terão suas relações restauradas quando o processo for deserializado e executado para evitar o uso excessivo de recursos em tarefas que envolvem um grande número de modelos.

<a name="unique-jobs"></a>
### Trabalhos únicos

::: warning ATENÇÃO
Trabalhos exclusivos exigem um driver de cache que suporte [bloqueios](/docs/cache#atomic-locks). Atualmente, os drivers de cache `memcached`, `redis`, `dynamodb`, `database`, `file` e `array` oferecem suporte a bloqueios atômicos. Além disso, restrições de trabalho exclusivo não se aplicam a trabalhos em lotes.
:::

Às vezes, você pode querer garantir que apenas uma instância de um determinado trabalho esteja na fila em qualquer momento. Você pode fazer isso implementando a interface `ShouldBeUnique` na sua classe de trabalhos. Essa interface não exige a definição de nenhum método adicional em sua classe:

```php
    <?php

    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Contracts\Queue\ShouldBeUnique;

    class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
    {
        ...
    }
```

No exemplo acima, o trabalho `UpdateSearchIndex` é único. Sendo assim, esse trabalho não será enviado se já existir outra instância do mesmo no aguardando e ainda não tiver sido processada.

Em alguns casos, você pode querer definir uma "chave" específica que torne o trabalho único ou você pode desejar especificar um tempo limite para depois do qual o trabalho não permanecerá mais como único. Para fazer isso, você poderá definir as propriedades `uniqueId` e `uniqueFor` ou métodos em sua classe de tarefa:

```php
    <?php

    use App\Models\Product;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Contracts\Queue\ShouldBeUnique;

    class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
    {
        /**
         * A instância do produto.
         *
         * @var \App\Product
         */
        public $product;

        /**
         * O número de segundos após o qual o bloqueio exclusivo do trabalho será liberado.
         *
         * @var int
         */
        public $uniqueFor = 3600;

        /**
         * Obtenha o ID exclusivo para o trabalho.
         */
        public function uniqueId(): string
        {
            return $this->product->id;
        }
    }
```

No exemplo acima, a tarefa `UpdateSearchIndex` é exclusiva por um ID do produto. Portanto, qualquer nova distribuição da tarefa com o mesmo ID do produto será ignorada até que a tarefa existente termine o processamento. Além disso, se a tarefa existente não for processada no período de uma hora, a exclusão será liberada e poderá distribuir-se outra tarefa com a mesma chave única para a fila.

::: warning ATENÇÃO
Se seu aplicativo distribuir tarefas de vários servidores ou contêineres web, você deve garantir que todos os seus servidores estejam se comunicando com o mesmo servidor de cache central para que Laravel possa determinar corretamente se uma tarefa é única.
:::

<a name="keeping-jobs-unique-until-processing-begins"></a>
#### Mantendo os trabalhos únicos até o início do processamento

Por padrão, os trabalhos exclusivos são "desbloqueados" após o processamento ser concluído ou todos os seus esforços de tentativa e erro falharem. No entanto, poderá existir situações em que pretenda desbloquear um trabalho imediatamente antes do seu processamento. Para tal, deve-se implementar o contrato `ShouldBeUniqueUntilProcessing` em vez do contrato `ShouldBeUnique`.

```php
    <?php

    use App\Models\Product;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;

    class UpdateSearchIndex implements ShouldQueue, ShouldBeUniqueUntilProcessing
    {
        // ...
    }
```

<a name="unique-job-locks"></a>
#### Bloqueios exclusivos do trabalho

Nos bastidores, quando um job `ShouldBeUnique` é despachado, o Laravel tenta adquirir um [lock](/docs/cache#atomic-locks) com a chave `uniqueId`. Se o lock não for adquirido, o job não será despachado. Este lock é liberado quando o job conclui o processamento ou falha em todas as suas tentativas de repetição. Por padrão, o Laravel usará o driver de cache padrão para obter este lock. No entanto, se você deseja usar outro driver para adquirir o lock, você pode definir um método `uniqueVia` que retorna o driver de cache que deve ser usado:

```php
    use Illuminate\Contracts\Cache\Repository;
    use Illuminate\Support\Facades\Cache;

    class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
    {
        ...

        /**
         * Obtenha o driver de cache para o bloqueio de trabalho exclusivo.
         */
        public function uniqueVia(): Repository
        {
            return Cache::driver('redis');
        }
    }
```

::: info NOTA
Se você só precisa limitar o processamento simultâneo de um trabalho, use o middleware de trabalho [`WithoutOverlapping`](/docs/queues#preventing-job-overlaps).
:::

<a name="encrypted-jobs"></a>
### Trabalhos criptografados

O Laravel permite-lhe assegurar a privacidade e integridade dos dados do trabalho através da [encriptação de informações](/docs/encryption). Para começar, basta adicionar a interface `ShouldBeEncrypted` à classe de tarefas. Uma vez que esta interface tenha sido adicionada à classe, o Laravel irá automaticamente encriptar a sua tarefa antes de ser inserida numa fila:

```php
    <?php

    use Illuminate\Contracts\Queue\ShouldBeEncrypted;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class UpdateSearchIndex implements ShouldQueue, ShouldBeEncrypted
    {
        // ...
    }
```

<a name="job-middleware"></a>
## Middleware de trabalho

O middleware de tarefas permite envolver lógica personalizada à execução das tarefas agendadas, reduzindo a repetição em si do código da tarefa. Por exemplo, considere o seguinte método `handle`, que utiliza as funcionalidades de limitação da taxa Redis do Laravel para permitir que apenas uma tarefa seja processada a cada cinco segundos:

```php
    use Illuminate\Support\Facades\Redis;

    /**
     * Execute o trabalho.
     */
    public function handle(): void
    {
        Redis::throttle('key')->block(0)->allow(1)->every(5)->then(function () {
            info('Bloqueio obtido...');

            // Lidar com o trabalho...
        }, function () {
            // Não foi possível obter o bloqueio...

            return $this->release(5);
        });
    }
```

Embora esse código seja válido, a implementação do método `handle` se torna ruim porque está desorganizada com a lógica de limite de taxa Redis. Além disso, essa lógica de limitação de taxa deve ser duplicada para quaisquer outros trabalhos que pretendamos limitar por taxa.

Em vez de limitar o tamanho do pedido no método `handle`, podemos definir um middleware de trabalhos que lida com a limitação do tamanho. O Laravel não possui uma localização padrão para os middlewares de trabalhos, portanto você poderá colocar o middleware em qualquer lugar da sua aplicação. Nesse exemplo, vamos colocar o middleware no diretório `app/Jobs/Middleware`:

```php
    <?php

    namespace App\Jobs\Middleware;

    use Closure;
    use Illuminate\Support\Facades\Redis;

    class RateLimited
    {
        /**
         * Processe o trabalho na fila.
         *
         * @param  \Closure(object): void  $next
         */
        public function handle(object $job, Closure $next): void
        {
            Redis::throttle('key')
                    ->block(0)->allow(1)->every(5)
                    ->then(function () use ($job, $next) {
                        // Bloqueio obtido...

                        $next($job);
                    }, function () use ($job) {
                        // Não foi possível obter o bloqueio...

                        $job->release(5);
                    });
        }
    }
```

Como você pode ver, assim como o [middleware de rota](/docs/middleware), o middlware de trabalhos recebe a tarefa que está sendo processada e um callback que deve ser invocado para continuar o processamento.

Após criar o middleware do job, eles podem ser anexados a um job retornando-os do método `middleware` do job. Esse método não existe em jobs com scaffold pelo comando `make:job` Artisan, então você precisará adicioná-lo manualmente à sua classe _job_:

```php
    use App\Jobs\Middleware\RateLimited;

    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new RateLimited];
    }
```

::: info NOTA
O middleware de tarefas também pode ser atribuído a ouvintes de eventos, mensagens e notificações.
:::

<a name="rate-limiting"></a>
### Limitação de taxa

Apesar de termos demonstrado como escrever seu próprio middleware de limite de taxas, o Laravel inclui um middleware de _rate limit_ que você pode utilizar para limitar as taxas das tareafas. Como os limitadores de taxa da [rota](/docs/routing#defining-rate-limiters), os limitadores de taxa do trabalho são definidos usando o método `for` da facade `RateLimiter`.

Por exemplo, você pode pretender permitir que os utilizadores façam backup dos seus dados uma vez por hora ao impor tal limite aos clientes Premium. Para conseguir isto, pode definir um `RateLimiter` no método `boot` do seu `AppServiceProvider`:

```php
    use Illuminate\Cache\RateLimiting\Limit;
    use Illuminate\Support\Facades\RateLimiter;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        RateLimiter::for('backups', function (object $job) {
            return $job->user->vipCustomer()
                        ? Limit::none()
                        : Limit::perHour(1)->by($job->user->id);
        });
    }
```

No exemplo acima, definimos um limite de custo por hora. Entretanto, você pode facilmente definir um limite de custo baseado em minutos usando o método `perMinute`. Além disso, você pode passar qualquer valor que desejar para o método `by` do limite de taxas; entretanto, esse valor é mais frequentemente usado para segmentar os limites de custo por clientes:

```php
    return Limit::perMinute(50)->by($job->user->id);
```

Definido o seu limite de taxa, você poderá anexar um limitador de taxa ao seu trabalho usando o middleware `Illuminate\Queue\Middleware\RateLimited`. A cada vez que a taxa exceder o limite, esse middleware liberará o trabalho novamente para a fila com um atraso adequado, com base no período do _rate limit_.

```php
    use Illuminate\Queue\Middleware\RateLimited;

    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new RateLimited('backups')];
    }
```

Ao liberar novamente uma tarefa com limitação de taxa na fila, o número total de "tentativas" da tarefa será incrementado. Talvez seja necessário ajustar as propriedades `tries` e `maxExceptions` do seu tipo de tarefa em conformidade. Ou talvez você queira usar o método [`retryUntil`](#time-based-attempts) para definir a quantidade de tempo até que não seja mais tentada a tarefa.

Se não pretender que um trabalho seja reenviado quando está limitado em taxa, você pode utilizar o método `dontRelease`:

```php
    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new RateLimited('backups'))->dontRelease()];
    }
```

::: info NOTA
Se você estiver usando o Redis, poderá usar o middleware `Illuminate\Queue\Middleware\RateLimitedWithRedis`, que é ajustado para funcionar com o Redis e é mais eficiente do que o middleware de limitação básica.
:::

<a name="preventing-job-overlaps"></a>
### Evitar sobreposições de funções

O Laravel inclui um middleware `Illuminate\Queue\Middleware\WithoutOverlapping` que permite impedir a sobreposição de tarefas com base numa chave arbitrária. Isso pode ser útil quando uma tarefa em fila de espera está modificando um recurso que só deve ser alterado por uma tarefa de cada vez.

Imagine que você tenha um trabalho em fila para atualizar a pontuação de crédito de um usuário e deseja evitar sobreposição dos trabalhos de atualização do mesmo ID do usuário. Para isso, você pode retornar o middleware `WithoutOverlapping` na etapa de `middleware` do seu trabalho:

```php
    use Illuminate\Queue\Middleware\WithoutOverlapping;

    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping($this->user->id)];
    }
```

Quaisquer tarefas concorrentes de um mesmo tipo serão novamente colocadas na fila, além disso vocÊ pode especificar o número de segundos a decorrerem antes da tarefa liberada ser tentada novamente.

```php
    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new WithoutOverlapping($this->order->id))->releaseAfter(60)];
    }
```

Se pretender remover de imediato os trabalhos que se sobrepõem para não ser reenviados, poderá utilizar o método `dontRelease`:

```php
    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new WithoutOverlapping($this->order->id))->dontRelease()];
    }
```

O middleware `WithoutOverlapping` é alimentado pelo recurso de bloqueio atômico do Laravel. Às vezes, o seu trabalho pode falhar inesperadamente ou demorar a tal ponto que o bloqueio não seja liberado. Por isso, você pode definir explicitamente um tempo limite para expiração do bloqueio usando o método `expireAfter`. Por exemplo, o exemplo abaixo instruirá o Laravel a liberar o bloqueio `WithoutOverlapping` três minutos após o trabalho ter começado a ser processado:

```php
    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new WithoutOverlapping($this->order->id))->expireAfter(180)];
    }
```

::: warning ATENÇÃO
O middleware `WithoutOverlapping` requer um driver de cache que suporte [bloqueios](/docs/cache#atomic-locks). Atualmente, os drivers de cache `memcached`, `redis`, `dynamodb`, `database`, `file` e `array` oferecem suporte a bloqueios atômicos.
:::

<a name="sharing-lock-keys"></a>
#### Compartilhando chaves de bloqueio entre classes de trabalho

Por padrão, o middleware `WithoutOverlapping` só impedirá que os trabalhos de uma mesma classe se sobreponham. Portanto, apesar de duas classes de trabalho diferentes poderem usar a mesma chave de bloqueio, elas não serão impedidas de se sobrepor. No entanto, é possível instruir o Laravel para aplicar a chave em várias classes com o método `shared`:

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

class ProviderIsDown
{
    // ...


    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}

class ProviderIsUp
{
    // ...


    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}
```

<a name="throttling-exceptions"></a>
### Exceções de limitação

O Laravel inclui um middleware `Illuminate\Queue\Middleware\ThrottlesExceptions`, que permite limitar as exceções. Uma vez que o trabalho joga uma determinada quantidade de exceções, todas as tentativas subsequentes para executar o trabalho serão atrasadas até o intervalo temporal especificado expirar. Este middleware é particularmente útil para tarefas que interagem com serviços de terceiros instáveis.

Imaginemos um trabalho agendado que interage com uma API de terceiros que começa a lançar exceções. Para limitar o número de exceções, você pode retornar o middleware `ThrottlesExceptions` do método `middleware` do seu trabalho. Normalmente, esse middleware deve ser usado com um trabalho que implemente [tentativas baseadas no tempo](#time-based-attempts):

```php
    use DateTime;
    use Illuminate\Queue\Middleware\ThrottlesExceptions;

    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new ThrottlesExceptions(10, 5)];
    }

    /**
     * Determine o momento em que o tempo limite do trabalho deve expirar.
     */
    public function retryUntil(): DateTime
    {
        return now()->addMinutes(5);
    }
```

O primeiro argumento do construtor aceito pelo middleware é o número de exceções que a tarefa pode lançar antes de ser limitada e, no segundo argumento, está a quantidade de minutos que devem decorrer até tentarmos novamente executar a tarefa depois de ter sido limitada. No exemplo acima de código, se a tarefa lançar 10 exceções num período inferior a 5 minutos, aguardamos este período antes de tentarmos executar novamente a tarefa.

Se uma tarefa arrojar uma exceção, mas o limite de exceções ainda não ter sido atingido, é frequente que a tarefa seja reexecutada imediatamente. No entanto, você pode especificar o número de minutos durante os quais a tarefa deve ser atrasada ao chamar o método `backoff` ao associá-lo à tarefa:

```php
    use Illuminate\Queue\Middleware\ThrottlesExceptions;

    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new ThrottlesExceptions(10, 5))->backoff(5)];
    }
```

Internamente, esse middleware usa o sistema de cache do Laravel para implementar limitação por taxa. O nome da classe do trabalho é utilizado como "chave" do cache. Você pode substituir essa chave chamando o método `by` ao anexar o middleware ao seu trabalho. Isso pode ser útil caso você tenha vários trabalhos interagindo com o mesmo serviço de terceiros e deseje compartilhar um "_bucket_" de limitação comum:

```php
    use Illuminate\Queue\Middleware\ThrottlesExceptions;

    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new ThrottlesExceptions(10, 10))->by('key')];
    }
```

Por padrão, esse middleware irá reduzir a velocidade de execução de todas as exceções. É possível modificar esse comportamento ao invocar o método `when` quando você anexa o middleware ao seu trabalho. A exceção será reduzida apenas se o closure for retornado como `true` pela chamada ao método:

```php
    use Illuminate\Http\Client\HttpClientException;
    use Illuminate\Queue\Middleware\ThrottlesExceptions;

    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new ThrottlesExceptions(10, 10))->when(
            fn (Throwable $throwable) => $throwable instanceof HttpClientException
        )];
    }
```

Se você quiser que as exceções com restrição sejam relatadas ao gerenciador de exceções do seu aplicativo, pode fazer isso convocando o método `report` ao anexar o middleware ao trabalho. Opcionalmente, você pode fornecer um closure para o método `report`, e a exceção será relatada somente se o closure retornar `true`:

```php
    use Illuminate\Http\Client\HttpClientException;
    use Illuminate\Queue\Middleware\ThrottlesExceptions;

    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new ThrottlesExceptions(10, 10))->report(
            fn (Throwable $throwable) => $throwable instanceof HttpClientException
        )];
    }
```

::: info NOTA
Se você estiver usando o Redis, poderá usar o `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis` middleware, que é otimizado para o Redis e mais eficiente do que o middleware básico de limitação de exceções.
:::

<a name="dispatching-jobs"></a>
## Despachando tarefas

Depois que você tiver escrito sua classe de trabalho, poderá encaminhá-la usando o método `dispatch` do próprio trabalho. Os argumentos passados ao método `dispatch` serão entregues ao construtor do trabalho:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Jobs\ProcessPodcast;
    use App\Models\Podcast;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PodcastController extends Controller
    {
        /**
         * Armazene um novo podcast.
         */
        public function store(Request $request): RedirectResponse
        {
            $podcast = Podcast::create(/* ... */);

            // ...

            ProcessPodcast::dispatch($podcast);

            return redirect('/podcasts');
        }
    }
```

Se você quiser despachar uma tarefa sob condição, poderá usar os métodos `dispatchIf` e `dispatchUnless`:

```php
    ProcessPodcast::dispatchIf($accountActive, $podcast);

    ProcessPodcast::dispatchUnless($accountSuspended, $podcast);
```

Nos novos aplicativos Laravel, o driver `sync` é o driver de fila padrão. Esse driver executa trabalhos sincronicamente na frente da requisição atual, que geralmente é conveniente durante o desenvolvimento local. Se você deseja começar a priorizar os trabalhos para processamento em segundo plano, poderá especificar um driver de fila diferente no arquivo de configuração `config/queue.php` do aplicativo.

<a name="delayed-dispatching"></a>
### Atrasando o despacho

Se desejar especificar que um trabalho não deve estar imediatamente disponível para processamento por um _worker_ de fila, você pode usar o método `delay` ao distribuir o trabalho. Por exemplo, vamos especificar que um trabalho só estará disponível para processamento 10 minutos após a sua distribuição:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Jobs\ProcessPodcast;
    use App\Models\Podcast;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PodcastController extends Controller
    {
        /**
         * Armazene um novo podcast.
         */
        public function store(Request $request): RedirectResponse
        {
            $podcast = Podcast::create(/* ... */);

            // ...

            ProcessPodcast::dispatch($podcast)
                        ->delay(now()->addMinutes(10));

            return redirect('/podcasts');
        }
    }
```

::: warning ATENÇÃO
O serviço de fila do Amazon SQS tem um tempo máximo de atraso de 15 minutos.
:::

<a name="dispatching-after-the-response-is-sent-to-browser"></a>
#### Despachando Após o envio da resposta ao navegador

Alternativamente, o método `dispatchAfterResponse` atrasará a expedição de um trabalho até que a resposta HTTP seja enviada ao navegador do usuário se o seu servidor web estiver a usar FastCGI. Isso permitirá ainda ao usuário começar a utilizar a aplicação apesar de ainda estar em execução um trabalho agendado. Normalmente, isto só deve ser utilizado para trabalhos que levem cerca de um segundo, tais como o envio de um e-mail. Uma vez processados dentro da requisição HTTP atual, os trabalhos expedidos desta forma não exigem a execução de um serviço de fila de processamento:

```php
    use App\Jobs\SendNotification;

    SendNotification::dispatchAfterResponse();
```

Você também pode "despachar" um closure e encadear o método `afterResponse` no método auxiliar `dispatch` para executar um closure após a resposta do HTTP ser enviada ao navegador.

```php
    use App\Mail\WelcomeMessage;
    use Illuminate\Support\Facades\Mail;

    dispatch(function () {
        Mail::to('taylor@example.com')->send(new WelcomeMessage);
    })->afterResponse();
```

<a name="synchronous-dispatching"></a>
### Despacho Síncrono

Se você deseja enviar uma tarefa imediatamente (sincronicamente), poderá usar o método `dispatchSync`. Quando for usado esse método, a tarefa não será agendada e será executada imediatamente no processo atual:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Jobs\ProcessPodcast;
    use App\Models\Podcast;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PodcastController extends Controller
    {
        /**
         * Armazene um novo podcast.
         */
        public function store(Request $request): RedirectResponse
        {
            $podcast = Podcast::create(/* ... */);

            // Crie um podcast...

            ProcessPodcast::dispatchSync($podcast);

            return redirect('/podcasts');
        }
    }
```

<a name="jobs-and-database-transactions"></a>
### Trabalhos e transações de banco de dados

Ao invés de enviar tarefas dentro das transações do banco de dados, certifique-se que sua tarefa será executada com sucesso. Ao enviar uma tarefa dentro de uma transação, é possível que a tarefa seja processada por um _worker_ antes que a transação principal seja confirmada. Nesse caso, as atualizações feitas em modelos ou registros do banco de dados durante a(s) transação(ões) podem não ser refletidas no banco de dados ainda. Além disso, quaisquer modelos ou registros do banco de dados criado dentro da transação(ões) podem ainda não existir no banco de dados.

Felizmente, o Laravel fornece várias formas de contornar este problema. Primeiro, é possível definir a opção de conexão `after_commit` no array de configurações da conexão da fila:

```php
    'redis' => [
        'driver' => 'redis',
        // ...
        'after_commit' => true,
    ],
```

Quando a opção `after_commit` for `true`, você poderá distribuir tarefas dentro de transações do banco de dados; contudo, o Laravel aguardará até que as transações superiores em aberto sejam commitadas antes de realmente distribuir a tarefa. Claro, se nenhuma transação do banco de dados estiver atualmente em aberto, a tarefa será distribuída imediatamente.

Se uma transação for revertida devido a uma exceção ocorrida durante sua execução, os trabalhos enviados nessa mesma transação serão descartados.

::: info NOTA
Definindo a opção de configuração `after_commit` em `true` também fará com que qualquer evento agendado, transmissão de email ou notificação seja enviada após o commit das operações em aberto no banco de dados.
:::

<a name="specifying-commit-dispatch-behavior-inline"></a>
#### Especificando o comportamento de despacho de confirmação em linha

Se você não definir a opção de configuração da conexão da fila no comando 'after_commit' para true, poderá indicar que uma tarefa específica deve ser enviada após as transações em curso terem sido concluídas. Para isto, você poderá juntar o método `afterCommit` à sua operação de envio:

```php
    use App\Jobs\ProcessPodcast;

    ProcessPodcast::dispatch($podcast)->afterCommit();
```

Da mesma forma que se a opção de configuração `after_commit` estiver definida para `true`, poderá indicar-se que um trabalho específico seja despachado imediatamente sem esperar pela confirmação das transações em curso do banco de dados:

```php
    ProcessPodcast::dispatch($podcast)->beforeCommit();
```

<a name="job-chaining"></a>
### Cadeia de trabalhos

A cadeia de trabalhos permite-lhe especificar uma lista de trabalhos agendados que devem ser executados em sequência após o sucesso da execução do trabalho primário. Se um trabalho na seqüência falhar, os restantes não serão executados. Para executar uma cadeia de trabalhos programada, você pode utilizar o método `chain` fornecido pela facade `Bus`. O comando `Bus` do Laravel é um componente de nível inferior em que o envio de trabalho agendado é construído:

```php
    use App\Jobs\OptimizePodcast;
    use App\Jobs\ProcessPodcast;
    use App\Jobs\ReleasePodcast;
    use Illuminate\Support\Facades\Bus;

    Bus::chain([
        new ProcessPodcast,
        new OptimizePodcast,
        new ReleasePodcast,
    ])->dispatch();
```

Além da cadeia de instâncias de classes de função, você também pode fazer isso com closures:

```php
    Bus::chain([
        new ProcessPodcast,
        new OptimizePodcast,
        function () {
            Podcast::update(/* ... */);
        },
    ])->dispatch();
```

::: warning ATENÇÃO
A exclusão de tarefas usando o método `$this->delete($id)` dentro da tarefa não impede que as tarefas concatenadas sejam processadas. Só será interrompido o processamento da cadeia, caso uma das tarefas falhe.
:::

<a name="chain-connection-queue"></a>
#### Conexão de cadeia e fila

Se pretender especificar a ligação e a fila para utilizar nos trabalhos em cadeia, você pode utilizar as funções `onConnection` e `onQueue`. Estas funções especificam a ligação de fila e o nome da fila que devem ser usados, exceto se um trabalho agendado tiver sido explicitamente atribuído uma ligação/fila diferente:

```php
    Bus::chain([
        new ProcessPodcast,
        new OptimizePodcast,
        new ReleasePodcast,
    ])->onConnection('redis')->onQueue('podcasts')->dispatch();
```

<a name="adding-jobs-to-the-chain"></a>
#### Adicionar trabalhos à cadeia

Ocasionalmente, você pode precisar adicionar uma tarefa à uma cadeia de trabalhos existente a partir de outra tarefa naquela mesma cadeia. Você pode fazer isso usando os métodos `prependToChain` e `appendToChain`:

```php
/**
 * Execute o trabalho.
 */
public function handle(): void
{
    // ...

    // Adicionar à cadeia atual, executar o trabalho imediatamente após o trabalho atual...
    $this->prependToChain(new TranscribePodcast);

    // Anexar à cadeia atual, executar tarefa no final da cadeia...
    $this->appendToChain(new TranscribePodcast);
}
```

<a name="chain-failures"></a>
#### Falhas na cadeia

Ao concatenar tarefas, você pode usar o método `catch` para especificar um closure que deve ser acionado se uma tarefa da cadeia falhar. O callback receberá a instância `Throwable` que causou o fracasso na tarefa:

```php
    use Illuminate\Support\Facades\Bus;
    use Throwable;

    Bus::chain([
        new ProcessPodcast,
        new OptimizePodcast,
        new ReleasePodcast,
    ])->catch(function (Throwable $e) {
        // Um trabalho dentro da cadeia falhou...
    })->dispatch();
```

::: warning aTENÇÃO
Como os retornos de chamada em cadeia são serializados e executados posteriormente pela fila do Laravel, você não deve usar a variável `$this` dentro dos retornos de chamada em cadeia.
:::

<a name="customizing-the-queue-and-connection"></a>
### Personalizar fila de espera a uma conexão

<a name="dispatching-to-a-particular-queue"></a>
#### Encaminhamento para uma fila específica

Ao encaminhar tarefas para filas diferentes, você pode "categorizar" suas tarefas em fila e até mesmo definir qual a prioridade de tarefas para os vários trabalhadores, em relação às diversas filas. Tenha em mente que isso não envia as tarefas para conexões diferentes de acordo com sua configuração de fila, mas apenas para filas específicas dentro de uma única conexão. Para especificar a fila, use o método `onQueue` ao distribuir a tarefa:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Jobs\ProcessPodcast;
    use App\Models\Podcast;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PodcastController extends Controller
    {
        /**
         * Armazene um novo podcast.
         */
        public function store(Request $request): RedirectResponse
        {
            $podcast = Podcast::create(/* ... */);

            // Crie um podcast...

            ProcessPodcast::dispatch($podcast)->onQueue('processing');

            return redirect('/podcasts');
        }
    }
```

Como alternativa, você pode especificar a fila do trabalho chamando o método `onQueue` dentro do construtor do trabalho:

```php
    <?php

    namespace App\Jobs;

     use Illuminate\Bus\Queueable;
     use Illuminate\Contracts\Queue\ShouldQueue;
     use Illuminate\Foundation\Bus\Dispatchable;
     use Illuminate\Queue\InteractsWithQueue;
     use Illuminate\Queue\SerializesModels;

    class ProcessPodcast implements ShouldQueue
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        /**
         * Crie uma nova instância de trabalho.
         */
        public function __construct()
        {
            $this->onQueue('processing');
        }
    }
```

<a name="dispatching-to-a-particular-connection"></a>
#### Despachando para uma conexão específica

Se o seu aplicativo interagir com várias conexões de filas, você pode especificar qual conexão enviará um pedido usando o método `onConnection`:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use App\Jobs\ProcessPodcast;
    use App\Models\Podcast;
    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class PodcastController extends Controller
    {
        /**
         * Armazene um novo podcast.
         */
        public function store(Request $request): RedirectResponse
        {
            $podcast = Podcast::create(/* ... */);

            // Crie um podcast...

            ProcessPodcast::dispatch($podcast)->onConnection('sqs');

            return redirect('/podcasts');
        }
    }
```

Você pode concatenar os métodos `onConnection` e `onQueue` para especificar a conexão e a fila de um processo:

```php
    ProcessPodcast::dispatch($podcast)
                  ->onConnection('sqs')
                  ->onQueue('processing');
```

Como alternativa, você pode especificar a conexão do trabalho chamando o método `onConnection` dentro do construtor dele:

```php
    <?php

    namespace App\Jobs;

     use Illuminate\Bus\Queueable;
     use Illuminate\Contracts\Queue\ShouldQueue;
     use Illuminate\Foundation\Bus\Dispatchable;
     use Illuminate\Queue\InteractsWithQueue;
     use Illuminate\Queue\SerializesModels;

    class ProcessPodcast implements ShouldQueue
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        /**
         * Crie uma nova instância de trabalho.
         */
        public function __construct()
        {
            $this->onConnection('sqs');
        }
    }
```

<a name="max-job-attempts-and-timeout"></a>
### Especificação do valor máximo de tentativas e tempo limite

<a name="max-attempts"></a>
#### Tentativas Máximas

Se um dos seus trabalhos em fila estiver enfrentando um erro, provavelmente você não quer que ele continue tentando de maneira indefinida. Por isso, o Laravel oferece várias formas de especificar quantas vezes ou por quanto tempo um trabalho pode ser tentado.

Uma abordagem para especificar o número máximo de tentativas permitidas é através do comando `--tries` da linha de comandos do Artisan. Isto se aplica a todos os trabalhos processados pelo worker, exceto no caso em que o trabalho sendo processado especifique o número de vezes que pode ser tentado:

```shell
php artisan queue:work --tries=3
```

Se um trabalho exceder o número máximo de tentativas permitidas, ele será considerado como um trabalho "falhado". Para mais informações sobre como lidar com os trabalhos falhados, consulte a [documentação de trabalhos falhados](#dealing-with-failed-jobs). Se for especificada a opção `--tries=0` no comando `queue:work`, o trabalho será reexecutado indefinidamente.

Você pode adotar uma abordagem mais detalhada ao definir o número máximo de vezes que a tarefa poderá ser executada na própria classe de tarefas. Se o número máximo de tentativas for especificado na tarefa, este valores terá prioridade sobre o valor `--tries` fornecido na linha de comando:

```php
    <?php

    namespace App\Jobs;

    class ProcessPodcast implements ShouldQueue
    {
        /**
         * O número de vezes que o trabalho pode ser tentado.
         *
         * @var int
         */
        public $tries = 5;
    }
```

Se você precisar de um controle dinâmico do máximo de tentativas para uma determinada tarefa, você pode definir o método `tries` na própria tarefa:

```php
    /**
     * Determine o número de vezes que o trabalho pode ser tentado.
     */
    public function tries(): int
    {
        return 5;
    }
```

<a name="time-based-attempts"></a>
#### Tentativas com base no tempo

Como alternativa à definição do número de vezes que uma tarefa pode ser tentada antes de falhar, você poderá definir um período no qual a tarefa não deve mais ser tentada. Isso permite que a tarefa seja executada quantas vezes forem necessárias dentro de um determinado intervalo de tempo. Para definir o período em que uma tarefa não deve mais ser tentada, adicione um método `retryUntil` à sua classe de tarefas. Este método deve retornar uma instância do tipo `DateTime`:

```php
    use DateTime;

    /**
     * Determine o momento em que o tempo limite do trabalho deve expirar.
     */
    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
```

::: info NOTA
Você também pode definir uma propriedade `tries` ou um método `retryUntil` em seus [ouvintes de eventos enfileirados](/docs/events#queued-event-listeners).
:::

<a name="max-exceptions"></a>
#### Máximo de Exceções

Às vezes, pode desejar especificar que um trabalho pode ser executado várias vezes, mas deve falhar se os re-executáveis forem acionados por um número de exceções não tratadas (ao contrário de as ser liberadas pelo método `release` diretamente). Para fazer isto, poderá definir uma propriedade `maxExceptions` na sua classe de trabalho:

```php
    <?php

    namespace App\Jobs;

    use Illuminate\Support\Facades\Redis;

    class ProcessPodcast implements ShouldQueue
    {
        /**
         * O número de vezes que o trabalho pode ser tentado.
         *
         * @var int
         */
        public $tries = 25;

        /**
         * O número máximo de exceções não tratadas a serem permitidas antes de falhar.
         *
         * @var int
         */
        public $maxExceptions = 3;

        /**
         * Execute o trabalho.
         */
        public function handle(): void
        {
            Redis::throttle('key')->allow(10)->every(60)->then(function () {
                // Bloqueio obtido, processe o podcast...
            }, function () {
                // Não é possível obter o bloqueio...
                return $this->release(10);
            });
        }
    }
```

Nesse exemplo, se o aplicativo não conseguir obter um bloqueio do Redis, a tarefa é liberada por 10 segundos e será reexecutada até 25 vezes. No entanto, se três exceções não controladas forem lançadas pela tarefa, ela falhará.

<a name="timeout"></a>
#### Tempo de espera

Muitas vezes, você quer saber aproximadamente por quanto tempo os seus trabalhos estão aguardados. Por este motivo, o Laravel permite especificar um valor de "tempo limite". Por padrão, o valor do tempo limite é de 60 segundos. Se um trabalho estiver em processo por mais tempo do que o número de segundos especificado pelo valor do tempo limite, o _worker_ que está a tratar do mesmo lançará um erro. Normalmente, o _worker_ será reiniciado automaticamente através de [gerenciamento de processo configurado no seu servidor](/#supervisor-configuration).

O número máximo de segundos em que os trabalhos podem ser executados pode ser especificado usando a opção `--timeout` na linha de comando do Artisan:

```shell
php artisan queue:work --timeout=30
```

Se a tarefa exceder o número máximo de tentativas por tempo de execução contínuo, ela será marcada como falhada.

Você também pode definir o número máximo de segundos que um trabalho pode executar na própria classe de trabalho. Se o tempo limite for especificado no trabalho, ele terá precedência sobre qualquer tempo limite especificado na linha de comando:

```php
    <?php

    namespace App\Jobs;

    class ProcessPodcast implements ShouldQueue
    {
        /**
         * O número de segundos que o trabalho pode ser executado antes de atingir o tempo limite.
         *
         * @var int
         */
        public $timeout = 120;
    }
```

Às vezes, processos de bloqueio de IO, como soquetes ou conexões HTTP de saída, podem não respeitar o tempo limite especificado. Portanto, ao usar esses recursos, você deve sempre tentar especificar um tempo limite usando suas APIs também. Por exemplo, ao usar o Guzzle, você deve sempre especificar um valor de tempo limite de conexão e solicitação.

::: warning ATENÇÃO
A extensão PHP `pcntl` deve ser instalada para especificar os tempos limite de trabalho. Além disso, o valor "timeout" de um trabalho deve ser sempre menor que seu valor ["retry after"](#job-expiration). Caso contrário, o trabalho pode ser tentado novamente antes de realmente terminar de ser executado ou expirar.
:::

<a name="failing-on-timeout"></a>
#### Falha no tempo limite

Se você deseja indicar que um trabalho deve ser marcado como [falhado](#dealing-with-failed-jobs) no momento em que o tempo de espera acabe, poderá definir a propriedade `$failOnTimeout` na classe do trabalho:

```php
/**
 * Indique se o trabalho deve ser marcado como falha no tempo limite.
 *
 * @var bool
 */
public $failOnTimeout = true;
```

<a name="error-handling"></a>
### Tratando os erros

Se uma exceção for lançada enquanto o trabalho estiver sendo processado, o trabalho será automaticamente liberado de volta para a fila para que possa ser tentado novamente. O trabalho continuará a ser liberado até que tenha sido tentado o número máximo de vezes permitido pelo seu aplicativo. O número máximo de tentativas é definido pelo switch `--tries` usado no comando Artisan `queue:work`. Como alternativa, o número máximo de tentativas pode ser definido na própria classe de trabalho. Mais informações sobre como executar o queue worker [podem ser encontradas abaixo](#running-the-queue-worker).

<a name="manually-releasing-a-job"></a>
#### Liberação manual de um trabalho

Às vezes, você poderá querer liberar manualmente uma tarefa novamente para que seja tentada novamente em um momento posterior. Isto pode ser feito chamando o método `release`:

```php
    /**
     * Execute o trabalho.
     */
    public function handle(): void
    {
        // ...

        $this->release();
    }
```

Por padrão, o método `release` libera o trabalho na fila para processamento imediato. No entanto, você pode instruir a fila a não disponibilizar o trabalho para processamento até que tenha decorrido um determinado número de segundos ao passar uma instância de inteiro ou data para o método `release`:

```php
    $this->release(10);

    $this->release(now()->addSeconds(10));
```

<a name="manually-failing-a-job"></a>
#### Falhar um trabalho manualmente

Ocasionalmente você pode precisar marcar um trabalho como "falhado" manualmente. Para fazer isso, você pode chamar o método `fail`:

```php
    /**
     * Execute o trabalho.
     */
    public function handle(): void
    {
        // ...

        $this->fail();
    }
```

Se pretender marcar o seu trabalho como falhado devido a uma exceção que tenha capturado, pode passar a exceção ao método `fail`. Ou, por conveniência, poderá passar uma mensagem de erro em formato de string que será convertida para uma exceção:

```php
    $this->fail($exception);

    $this->fail('Something went wrong.');
```

::: info NOTA
Para obter mais informações sobre tarefas com falha, confira a [documentação sobre como lidar com falhas de tarefas](#dealing-with-failed-jobs).
:::

<a name="job-batching"></a>
## Trabalho em lotes

O recurso de processamento em lote de tarefas do Laravel permite que você execute facilmente um lote de tarefas e, em seguida, execute uma ação quando o lote de tarefas estiver executando. Antes de começar, você deve criar uma migração de banco de dados para construir uma tabela que conterá informações metadados sobre seus lotes de tarefas, como sua porcentagem de conclusão. Esta migração pode ser gerada usando o comando Artisan `make:queue-batches-table`:

```shell
php artisan make:queue-batches-table

php artisan migrate
```

<a name="defining-batchable-jobs"></a>
### Definindo trabalhos em lote

Para definir um trabalho de lote, você deve [criar um trabalho para fila](#creating-jobs) normalmente; no entanto, você deve adicionar a _trait_ `Illuminate\Bus\Batchable` à classe do trabalho. Esta _trait_ fornece acesso ao método `batch`, que pode ser usado para recuperar a lotação atual em que o trabalho está sendo executado:

```php
    <?php

    namespace App\Jobs;

    use Illuminate\Bus\Batchable;
    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Foundation\Bus\Dispatchable;
    use Illuminate\Queue\InteractsWithQueue;
    use Illuminate\Queue\SerializesModels;

    class ImportCsv implements ShouldQueue
    {
        use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        /**
         * Execute o trabalho.
         */
        public function handle(): void
        {
            if ($this->batch()->cancelled()) {
                // Determine se o lote foi cancelado...

                return;
            }

            // Importe uma parte do arquivo CSV...
        }
    }
```

<a name="dispatching-batches"></a>
### Distribuição de lotes

Para enviar um lote de tarefas, você deve usar o método `batch` da facade `Bus`. É claro que o agrupamento é principalmente útil quando combinado com os callbacks de conclusão. Portanto, você pode usar os métodos `then`, `catch`, e `finally` para definir os callbacks de conclusão do lote. Cada um destes callbacks receberá uma instância `Illuminate\Bus\Batch` quando forem invocados. Neste exemplo, imaginaremos que estamos agendando um lote de tarefas que processam cada uma, um número específico de linhas de um arquivo CSV:

```php
    use App\Jobs\ImportCsv;
    use Illuminate\Bus\Batch;
    use Illuminate\Support\Facades\Bus;
    use Throwable;

    $batch = Bus::batch([
        new ImportCsv(1, 100),
        new ImportCsv(101, 200),
        new ImportCsv(201, 300),
        new ImportCsv(301, 400),
        new ImportCsv(401, 500),
    ])->before(function (Batch $batch) {
        // O lote foi criado, mas nenhum trabalho foi adicionado...
    })->progress(function (Batch $batch) {
        // Um único trabalho foi concluído com sucesso...
    })->then(function (Batch $batch) {
        // Todos os trabalhos concluídos com sucesso...
    })->catch(function (Batch $batch, Throwable $e) {
        // Falha detectada no primeiro trabalho em lote...
    })->finally(function (Batch $batch) {
        // O lote terminou de ser executado...
    })->dispatch();

    return $batch->id;
```

O ID do lote, que pode ser acessado por meio da propriedade `$batch->id`, pode ser usado para [consultar o barramento de comandos do Laravel](#inspecting-batches) para obter informações sobre o lote após ele ter sido despachado.

::: warning ATENÇÃO
Como os retornos de chamada em lote são serializados e executados posteriormente pela fila do Laravel, você não deve usar a variável `$this` dentro dos retornos de chamada. Além disso, como os trabalhos em lote são encapsulados dentro de transações de banco de dados, as instruções de banco de dados que disparam commits implícitos não devem ser executadas dentro dos trabalhos.
:::

<a name="naming-batches"></a>
#### Nomeação de lotes

Algumas ferramentas como o Laravel Horizon e o Laravel Telescope podem fornecer informações de debug mais intuitivas para lotes se os mesmos tiverem um nome. Para atribuir um nome arbitrário a um lote, é possível chamar o método `name` ao definir o lote:

```php
    $batch = Bus::batch([
        // ...
    ])->then(function (Batch $batch) {
        // Todos os trabalhos foram concluídos com sucesso...
    })->name('Import CSV')->dispatch();
```

<a name="batch-connection-queue"></a>
#### Conexão em lote e fila

Se pretender especificar a ligação e a fila que devem ser utilizadas para os trabalhos agrupados, pode utilizar os métodos `onConnection` e `onQueue`. Todos os trabalhos agrupados têm de ser executados na mesma ligação e fila:

```php
    $batch = Bus::batch([
        // ...
    ])->then(function (Batch $batch) {
        // Todos os trabalhos foram concluídos com sucesso...
    })->onConnection('redis')->onQueue('imports')->dispatch();
```

<a name="chains-and-batches"></a>
### Cadeias e lotes

Você pode definir um conjunto de tarefas vinculadas [(job chaining)](#job-chaining) dentro de um lote armazenando as tarefas vinculadas em uma matriz. Por exemplo, podemos executar duas cadeias de tarefas em paralelo e fazer uma chamada quando ambas as cadeias de tarefas estiverem processadas:

```php
    use App\Jobs\ReleasePodcast;
    use App\Jobs\SendPodcastReleaseNotification;
    use Illuminate\Bus\Batch;
    use Illuminate\Support\Facades\Bus;

    Bus::batch([
        [
            new ReleasePodcast(1),
            new SendPodcastReleaseNotification(1),
        ],
        [
            new ReleasePodcast(2),
            new SendPodcastReleaseNotification(2),
        ],
    ])->then(function (Batch $batch) {
        // ...
    })->dispatch();
```

 Por outro lado, você pode executar lotes de tarefas dentro de uma [cadeia](#trabalhos-em-cadeias) definindo lotes dentro da cadeia. Por exemplo, é possível primeiro rodar um lote de tarefas para liberar vários podcasts e depois rodar um lote de tarefas para enviar as notificações de lançamento:

```php
    use App\Jobs\FlushPodcastCache;
    use App\Jobs\ReleasePodcast;
    use App\Jobs\SendPodcastReleaseNotification;
    use Illuminate\Support\Facades\Bus;

    Bus::chain([
        new FlushPodcastCache,
        Bus::batch([
            new ReleasePodcast(1),
            new ReleasePodcast(2),
        ]),
        Bus::batch([
            new SendPodcastReleaseNotification(1),
            new SendPodcastReleaseNotification(2),
        ]),
    ])->dispatch();
```

<a name="adding-jobs-to-batches"></a>
### Adicionar trabalhos a lotes

Às vezes, pode ser útil adicionar funções adicionais a um lote a partir de uma função. Esse padrão pode ser útil quando você precisa lotear milhares de tarefas que podem demorar muito para enviar durante uma requisição da Web. Assim, em vez disso, é possível enviar um lote inicial de "_loader_" de funções que hidratem o lote com ainda mais funções:

```php
    $batch = Bus::batch([
        new LoadImportBatch,
        new LoadImportBatch,
        new LoadImportBatch,
    ])->then(function (Batch $batch) {
        // Todos os trabalhos foram concluídos com sucesso......
    })->name('Import Contacts')->dispatch();
```

Neste exemplo, usaremos o trabalho `LoadImportBatch` para hidratar o lote com tarefas adicionais. Para fazer isso, podemos usar o método `add` na instância do lote que pode ser acessado através do método `batch` do trabalho:

```php
    use App\Jobs\ImportContacts;
    use Illuminate\Support\Collection;

    /**
     * Execute o trabalho.
     */
    public function handle(): void
    {
        if ($this->batch()->cancelled()) {
            return;
        }

        $this->batch()->add(Collection::times(1000, function () {
            return new ImportContacts;
        }));
    }
```

::: warning ATENÇÃO
Você só pode adicionar trabalhos a um lote de dentro de um trabalho que pertença ao mesmo lote.
:::

<a name="inspecting-batches"></a>
### Inspecção de lotes

A instância `Illuminate\Bus\Batch`, que é fornecida para os callbacks de conclusão por lote, tem uma variedade de propriedades e métodos para ajudá-lo a interagir e verificar um determinado lote de tarefas:

```php
    // O UUID do lote...
    $batch->id;

    // O nome do lote (se aplicável)...
    $batch->name;

    // O número de trabalhos atribuídos ao lote...
    $batch->totalJobs;

    // O número de trabalhos que não foram processados ​​pela fila...
    $batch->pendingJobs;

    // O número de trabalhos que falharam...
    $batch->failedJobs;

    // O número de trabalhos que foram processados ​​até agora...
    $batch->processedJobs();

    // A porcentagem de conclusão do lote (0-100)...
    $batch->progress();

    // Indica se o lote terminou de ser executado...
    $batch->finished();

    // Cancelar a execução do lote...
    $batch->cancel();

    // Indica se o lote foi cancelado...
    $batch->cancelled();
```

<a name="returning-batches-from-routes"></a>
#### Retorno de lotes a partir de rotas

Todas as instâncias de `Illuminate\Bus\Batch` são serializáveis em JSON, o que significa que você pode retorná-las diretamente de um dos roteadores da aplicação para recuperar uma carga útil JSON contendo informações sobre a conclusão do lote, incluindo seu progresso. Isso facilita a exibição de informações sobre o progresso da conclusão do lote no UI da sua aplicação.

Para recuperar um lote pelo seu identificador, você pode utilizar o método `findBatch` da interface `Bus`:

```php
    use Illuminate\Support\Facades\Bus;
    use Illuminate\Support\Facades\Route;

    Route::get('/batch/{batchId}', function (string $batchId) {
        return Bus::findBatch($batchId);
    });
```

<a name="cancelling-batches"></a>
### Cancelamento de lotes

Às vezes, você pode precisar cancelar o processamento de um determinado lote. Isso é possível chamando o método `cancel` em uma instância do tipo `Illuminate\Bus\Batch`:

```php
    /**
     * Execute o trabalho.
     */
    public function handle(): void
    {
        if ($this->user->exceedsImportLimit()) {
            return $this->batch()->cancel();
        }

        if ($this->batch()->cancelled()) {
            return;
        }
    }
```

Como você pode ter notado nos exemplos anteriores, os trabalhos agrupados normalmente devem determinar se seu lote correspondente foi cancelado antes de continuar a execução. No entanto, por conveniência, você pode atribuir o middleware `SkipIfBatchCancelled` ao trabalho em vez disso. Como o nome indica, este middleware instruirá o Laravel a não processar o trabalho se seu lote correspondente foi cancelado:

```php
    use Illuminate\Queue\Middleware\SkipIfBatchCancelled;

    /**
     * Obtenha o middleware pelo qual o trabalho deve passar.
     */
    public function middleware(): array
    {
        return [new SkipIfBatchCancelled];
    }
```

<a name="batch-failures"></a>
### Falhas de lote

Quando o processamento em lote falha, o callback `catch` (se aplicável) é acionado. Esse callback só é invocado para o primeiro processo que falhar dentro do lote.

<a name="allowing-failures"></a>
#### Permitindo falhas

Se um trabalho dentro de um lote falhar, o Laravel marcará automaticamente o lote como "cancelado". Caso deseje, você pode impedir que isso aconteça para que uma falha no trabalho não marque o lote como cancelado. Isso é feito chamando o método `allowFailures` ao distribuir o lote:

```php
    $batch = Bus::batch([
        // ...
    ])->then(function (Batch $batch) {
        // Todos os trabalhos foram concluídos com sucesso......
    })->allowFailures()->dispatch();
```

<a name="retrying-failed-batch-jobs"></a>
#### Relançar tarefas em lote que falharam

Para maior praticidade, o Laravel disponibiliza um comando Artisan chamado `queue:retry-batch`, que permite o reprocessamento de todos os trabalhos falhados num lote. O comando `queue:retry-batch` aceita o UUID do lote cujos trabalhos falhados devem ser reprocessados:

```shell
php artisan queue:retry-batch 32dbc76c-4f82-4749-b610-a639fe0099b5
```

<a name="pruning-batches"></a>
### Podas em lotes

Sem o uso de poda, a tabela `job_batches` pode acumular registros muito rapidamente. Para mitigar este problema, você deve [agendar](/docs/scheduling) com o comando do Artisan `queue:prune-batches` para ser executado diariamente:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('queue:prune-batches')->daily();
```

Por padrão, todos os lotes concluídos com mais de 24 horas serão eliminados. Você pode usar a opção `hours` ao chamar o comando para determinar quanto tempo manterá os dados do lote. Por exemplo, o comando a seguir exclui todos os lotes concluídos há mais de 48 horas:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('queue:prune-batches --hours=48')->daily();
```

Por vezes, a tabela `jobs_batches` pode acumular registros de lotes que nunca terminaram com sucesso. Pode acontecer, por exemplo, se um trabalho falhar e nenhuma tentativa ser feita para o retomar. Você pode também instruir o comando `queue:prune-batches` para remover esses registros de lotes incompletos utilizando a opção `unfinished`:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('queue:prune-batches --hours=48 --unfinished=72')->daily();
```

De modo análogo, a sua tabela `jobs_batches` também poderá acumular registros de lotes para lotes cancelados. Poderá instruir o comando `queue:prune-batches` a remover estes registros de lote cancelado utilizando a opção `cancelled`:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('queue:prune-batches --hours=48 --cancelled=72')->daily();
```

<a name="storing-batches-in-dynamodb"></a>
### Armazenar lotes no DynamoDB

O Laravel também suporta o armazenamento de informações meta em lotes no [DynamoDB](https://aws.amazon.com/dynamodb) ao invés de um banco de dados relacional, porém você precisará criar manualmente uma tabela do DynamoDB para armazenar todos os registros do lote.

Normalmente, essa tabela deve ser nomeada como "job_batches", mas você deverá nomear a tabela com o valor do parâmetro de configuração `"queue.batching.table"` na pasta de configurações da aplicação chamada "queue".

<a name="dynamodb-batch-table-configuration"></a>
#### Configuração de tabela em lote do DynamoDB

A tabela `job_batches` deve ter uma chave de partição primária de string chamada `application` e uma chave de classificação primária de string chamada `id`. A parte `application` da chave conterá o nome do seu aplicativo conforme definido pelo valor de configuração `name` dentro do arquivo de configuração `app` do seu aplicativo. Como o nome do aplicativo faz parte da chave da tabela do DynamoDB, você pode usar a mesma tabela para armazenar lotes de tarefas para vários aplicativos Laravel.

Além disso, você pode definir um atributo `ttl` para sua tabela se desejar aproveitar o recurso de [eliminação automática em lote](#pruning-batches-in-dynamodb).

<a name="dynamodb-configuration"></a>
#### Configuração do DynamoDB

Em seguida, instale o AWS SDK para que seu aplicativo do Laravel possa se comunicar com a Amazon DynamoDB:

```shell
composer require aws/aws-sdk-php
```

Em seguida, defina o valor da opção de configuração `queue.batching.driver` como `dynamodb`. Além disso, você deve definir as opções de configuração `key`, `secret` e `region` dentro do array de configuração `batching`. Estas opções serão usadas para fazer a autenticação com a AWS. Quando você estiver utilizando o driver `dynamodb`, a opção de configuração `queue.batching.database` é desnecessária:

```php
'batching' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'job_batches',
],
```

<a name="pruning-batches-in-dynamodb"></a>
#### Podas em lotes no DynamoDB

Ao utilizar o DynamoDB ([serviço de armazenamento da Amazon Web Services](https://aws.amazon.com/dynamodb)) para armazenar informações de lotes de tarefas, os comandos de redução comum utilizados para reduzir os lotes armazenados em um banco de dados relacional não funcionam. Em vez disso, pode utilizar a funcionalidade TTL nativa do DynamoDB ([função Atualizável em Tempo Relevante](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)) para remover automaticamente os registros de lotes antigos.

Se você definir sua tabela do DynamoDB com um atributo `ttl`, poderá definir parâmetros de configuração para instruir o Laravel sobre como remover registros em lote. O valor da configuração `queue.batching.ttl_attribute` define o nome do atributo que detém o TTL, enquanto a configuração `queue.batching.ttl` define o número de segundos após os quais um registro em lote pode ser removido da tabela do DynamoDB, relativo à última vez que o registro foi atualizado:

```php
'batching' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'job_batches',
    'ttl_attribute' => 'ttl',
    'ttl' => 60 * 60 * 24 * 7, // 7 dias...
],
```

<a name="queueing-closures"></a>
## Closures de filas

Em vez de despachar uma classe de tarefas para a fila, você também poderá despachar um closure. Isso é muito útil para tarefas simples e rápidas que necessitem ser executadas fora do ciclo de solicitação atual. Quando se despacham fechamentos para a fila, seu conteúdo é assinado cifrando-se o código, evitando assim que ele possa ser modificado em trânsito:

```php
    $podcast = App\Podcast::find(1);

    dispatch(function () use ($podcast) {
        $podcast->publish();
    });
```

Usando o método `catch`, é possível fornecer um closure que deve ser executado se o closure agendado falhar a terminar com sucesso depois de esgotarem todos as [tentativas de retransmissão configuradas da fila](#max-job-attempts-and-timeout):

```php
    use Throwable;

    dispatch(function () use ($podcast) {
        $podcast->publish();
    })->catch(function (Throwable $e) {
        // Este trabalho falhou...
    });
```

::: warning ATENÇÃO
Uma vez que as chamadas de retorno do bloco `catch` são serializadas e executadas posteriormente pela fila do Laravel, não é recomendável a utilização da variável `$this` nessas chamadas.

<a name="running-the-queue-worker"></a>
## Executando o _worker_ de fila

<a name="the-queue-work-command"></a>
### O Comando `queue:work`

O Laravel inclui um comando no Artesan que inicia o _worker_ de fila e processa os novos trabalhos quando são colocados na fila. Você pode executar o _worker_ usando o comando "queue:work". Note que, uma vez iniciado o comando `queue:work`, ele continuará a ser executado até ser interrompido manualmente ou você fechar seu terminal:

```shell
php artisan queue:work
```

::: info NOTA
Para manter o processo `queue:work` em execução permanentemente em segundo plano, você deve usar um monitor de processo como o [Supervisor](#supervisor-configuration) para garantir que o trabalhador da fila não pare de ser executado.
:::

Você pode incluir a marca de opção `-v` ao invocar o comando `queue:work` se desejar que os IDs dos trabalhos processados sejam incluídos no output do comando:

```shell
php artisan queue:work -v
```

Lembre-se, os trabalhadores de fila são processos de longa duração e armazenam o estado do aplicativo inicializado na memória. Como resultado, eles não notarão alterações na sua base de código após terem sido iniciados. Portanto, durante o processo de implantação, certifique-se de [reiniciar seus trabalhadores de fila](#queue-workers-and-deployment). Além disso, lembre-se de que qualquer estado estático criado ou modificado pelo seu aplicativo não será redefinido automaticamente entre os trabalhos.

Como alternativa, você pode executar o comando `queue:listen`. Ao usar o comando `queue:listen`, você não precisa reiniciar manualmente o trabalhador quando quiser recarregar seu código atualizado ou redefinir o estado do aplicativo; no entanto, esse comando é significativamente menos eficiente do que o comando `queue:work`:

```shell
php artisan queue:listen
```

<a name="running-multiple-queue-workers"></a>
#### Executando vários trabalhadores de filas

Para atribuir vários trabalhadores a uma fila e processar os trabalhos em simultâneo, devem ser iniciados vários processos `queue:work`. Isto pode ser feito localmente, através de várias janelas no terminal, ou na produção usando as configurações do gestor de processos. [Ao usar o Supervisor](#supervisor-configuration), é possível utilizar o valor da configuração `numprocs`.

<a name="specifying-the-connection-queue"></a>
#### Especificando a conexão e a fila

Você também pode especificar qual conexão de fila o _worker_ deve utilizar. O nome da conexão passado ao comando `work` deve corresponder a uma das conexões definidas em seu arquivo de configuração `config/queue.php`:

```shell
php artisan queue:work redis
```

Por padrão, o comando `queue:work` processa apenas os trabalhos da fila de destino na conexão. No entanto, você pode personalizar o funcionamento do processo da fila ao processar apenas determinadas filas numa determinada conexão. Se, por exemplo, todos os seus e-mails forem processados em uma fila `emails` nesta conexão de fila `redis`, você pode emitir o comando a seguir para iniciar um motor que só processe esta fila:

```shell
php artisan queue:work redis --queue=emails
```

<a name="processing-a-specified-number-of-jobs"></a>
#### Processamento de um número especificado de tarefas

A opção `--once` pode ser utilizada para indicar ao _worker_ que só irá processará um único trabalho na fila:

```shell
php artisan queue:work --once
```

A opção `--max-jobs` pode ser utilizada para instruir o worker a processar um determinado número de tarefas e em seguida sair. Esta opção pode ser útil quando combinada com [Supervisor](#supervisor-configuration), para que os trabalhadores sejam automaticamente reiniciados após o processamento de um determinado número de tarefas, liberando qualquer memória que tenham acumulado:

```shell
php artisan queue:work --max-jobs=1000
```

<a name="processing-all-queued-jobs-then-exiting"></a>
#### Processar todas as tarefas agendadas e, em seguida, sair

A opção `--stop-when-empty` pode ser utilizada para instruir o _worker_ para processar todos os trabalhos e, em seguida, sair de forma graciosa. Esta opção é útil ao processar filas Laravel dentro de um container Docker se você deseja fechar o container depois que a fila estiver vazia:

```shell
php artisan queue:work --stop-when-empty
```

<a name="processing-jobs-for-a-given-number-of-seconds"></a>
#### Processando tarefas por um determinado número de segundos

A opção `--max-time` pode ser usada para instruir o _worker_ a processar tarefas pelo número de segundos especificado e então sair. Essa opção é útil quando combinada com [Supervisor](#supervisor-configuration), pois permite que os trabalhadores sejam reiniciados automaticamente depois do processamento de tarefas por um determinado período, liberando qualquer memória que possam ter acumulado:

```shell
# Processe os trabalhos por uma hora e depois saia...
php artisan queue:work --max-time=3600
```

<a name="worker-sleep-duration"></a>
#### Duracão do sleep dos trabalhadores

Se houver tarefas disponíveis na fila, o _worker_ continuará processando as tarefas sem nenhum atraso entre elas. No entanto, a opção `sleep` determina quantos segundos o _worker_ ficará "dormindo" se não houver tarefas disponíveis. Claro, enquanto estiver dormindo, o _worker_ não processará novas tarefas:

```shell
php artisan queue:work --sleep=3
```

<a name="maintenance-mode-queues"></a>
#### Modo de manutenção e filas

Enquanto o aplicativo estiver em [modo de manutenção](/docs/configuration#maintenance-mode), os trabalhos agendados não serão tratados. Os trabalhos continuarão sendo tratados normalmente assim que o aplicativo sair do modo de manutenção.

Para forçar os _workers_ da fila a processar tarefas mesmo quando o modo de manutenção estiver ativado, você pode usar a opção `--force`:

```shell
php artisan queue:work --force
```

<a name="resource-considerations"></a>
#### Considerações sobre os recursos

Os trabalhadores da fila do daemon não "reinicializam" o framework antes de processar cada trabalho. Portanto, você deve liberar quaisquer recursos pesados ​​após a conclusão de cada trabalho. Por exemplo, se você estiver fazendo manipulação de imagem com a biblioteca GD, você deve liberar a memória com `imagedestroy` quando terminar de processar a imagem.

<a name="queue-priorities"></a>
### Prioridades da fila

Às vezes você pode querer estabelecer uma ordem de priorização para os seus scripts. Por exemplo, no arquivo de configuração `config/queue.php`, você poderá definir o `queue` por padrão da sua conexão `redis` como `low`. No entanto, ocasionalmente, talvez queira enviar um script para uma fila com alta prioridade assim:

```php
    dispatch((new Job)->onQueue('high'));
```

Para iniciar um _worker_ que verifique se todos os trabalhos da fila "high" têm sido processados antes de continuar com qualquer outro na fila "low", digite uma lista delimitada por vírgula de nomes de filas ao utilizar o comando `work`:

```shell
php artisan queue:work --queue=high,low
```

<a name="queue-workers-and-deployment"></a>
### Trabalhadores de fila e implantação

Como os trabalhadores de fila são processos de longa duração, eles não notarão alterações no seu código sem serem reiniciados. Então, a maneira mais simples de implantar um aplicativo usando trabalhadores de fila é reiniciá-los durante o processo de implantação. Você pode reiniciar todos os trabalhadores graciosamente emitindo o comando `queue:restart`:

```shell
php artisan queue:restart
```

Esse comando instruirá todos os trabalhadores da fila para saírem de maneira educada após finalizarem o processamento do seu trabalho atual, assim não haverá perda de nenhum trabalho. Como os trabalhadores de filas serão fechados quando o comando `queue:restart` for executado, você deve estar executando um gerenciador de processos como o [Supervisor](#supervisor-configuration) para reiniciar automaticamente os trabalhadores da fila.

::: info NOTA
A fila usa o [cache](/docs/cache) para armazenar sinais de reinicialização, portanto, você deve verificar se um driver de cache está configurado corretamente para seu aplicativo antes de usar esse recurso.
:::

<a name="job-expirations-and-timeouts"></a>
### Expiração de tarefas e tempo de inatividade

<a name="job-expiration"></a>
#### Expiração de um trabalho

Em seu arquivo de configuração `config/queue.php`, cada conexão da fila define uma opção `retry_after`. Essa opção especifica por quantos segundos a conexão da fila deve esperar antes de tentar novamente um trabalho que está sendo processado. Por exemplo, se o valor do `retry_after` for definido como `90`, o trabalho será liberado na fila novamente se estiver sendo processado por 90 segundos sem ter sido lançado ou excluído. Normalmente, você deve definir o valor de `retry_after` ao máximo de segundos que um trabalho razoavelmente levaria para concluir o processamento.

::: warning ATENÇÃO
A única conexão de fila que não contém um valor `retry_after` é o Amazon SQS. O SQS tentará novamente o trabalho com base no [Tempo limite de visibilidade padrão](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html), que é gerenciado no console da AWS.
:::

<a name="worker-timeouts"></a>
#### Tempo de espera do _worker_

O comando Artisan `queue:work` apresenta uma opção `--timeout`. Por padrão, o valor do --timeout é de 60 segundos. Se um trabalho estiver sendo processado por mais tempo que o número de segundos especificados pelo valor do timeout, o processo de trabalho será interrompido com um erro. Tipicamente, o processo será reiniciado automaticamente por um [gerenciador de processos configurado em seu servidor](#supervisor-configuration):

```shell
php artisan queue:work --timeout=60
```

As opções de configuração `retry_after` e a opção da linha de comando (`--timeout`) são diferentes, mas trabalham em conjunto para garantir que os trabalhos não sejam perdidos e que eles só sejam processados com sucesso uma vez.

::: warning ATENÇÃO
O valor `--timeout` deve ser sempre pelo menos vários segundos mais curto que o valor de configuração `retry_after`. Isso garantirá que um trabalhador processando um trabalho congelado seja sempre encerrado antes que o trabalho seja tentado novamente. Se sua opção `--timeout` for maior que o valor de configuração `retry_after`, seus trabalhos poderão ser processados ​​duas vezes.
:::

<a name="supervisor-configuration"></a>
## Configuração do Supervisor

Na produção, você precisa de uma maneira de fazer com que os processos do tipo `queue:work` continuem funcionando. Um processo do tipo `queue:work` pode ser interrompido por vários motivos, como um tempo de inatividade excedido ou a execução do comando `queue:restart`.

Por esse motivo, você precisa configurar um monitor de processo que possa detectar quando os seus processos `queue:work` saem e reiniciá-los automaticamente. Além disso, o monitor de processo permite especificar quantos processos `queue:work` você gostaria de executar em conjunto. O Supervisor é um monitor de processo usado comumente em ambientes Linux e discutiremos a configuração na seguinte documentação.

<a name="installing-supervisor"></a>
#### Instalando o Supervisor

O Supervisor é um monitor de processos para o sistema operativo Linux e reinicia automaticamente os seus processos `queue:work` em caso de falha. Para instalar o Supervisor no Ubuntu, você pode usar o seguinte comando:

```shell
sudo apt-get install supervisor
```

::: info NOTA
Se configurar e gerenciar o Supervisor sozinho parece complicado, considere usar o [Laravel Forge](https://forge.laravel.com), que instalará e configurará automaticamente o Supervisor para seus projetos de produção do Laravel.
:::

<a name="configuring-supervisor"></a>
#### Configurando o supervisor

Os arquivos de configuração do Supervisor são normalmente armazenados na pasta `/etc/supervisor/conf.d`. Nesta pasta, é possível criar um número ilimitado de arquivos de configuração que instruam o Supervisor sobre como os processos devem ser monitorados. Por exemplo, vamos criar um arquivo `laravel-worker.conf` que iniciará e monitorará os processos `queue:work`:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/forge/app.com/artisan queue:work sqs --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=forge
numprocs=8
redirect_stderr=true
stdout_logfile=/home/forge/app.com/worker.log
stopwaitsecs=3600
```

Nesse exemplo, a diretiva `numprocs` orienta o Supervisor a executar oito processos `queue:work`, monitorando todos eles e reiniciando automaticamente os que falharem. Você deve alterar a diretiva `command` da configuração para refletir suas opções de conexão com filas e trabalho desejadas.

::: warning ATENÇÃO
Você deve garantir que o valor de `stopwaitsecs` seja maior do que o número de segundos necessários para a execução do seu trabalho com duração mais longa. Caso contrário, o Supervisor poderá encerrar o processamento do seu trabalho antes mesmo dele estar concluído.
:::

<a name="starting-supervisor"></a>
#### Iniciando o Supervisor

Após a criação do arquivo de configuração, você poderá atualizar sua configuração e iniciar os processos usando os comandos abaixo.

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start "laravel-worker:*"
```

Para obter mais informações sobre o Supervisor, consulte a documentação do [Supervisor](http://supervisord.org/index.html).

<a name="dealing-with-failed-jobs"></a>
## Como lidar com tarefas que falharam

Às vezes os seus trabalhos agendados falharão. Não se preocupe, as coisas nem sempre acontecem como o planejado! O Laravel inclui uma forma conveniente de especificar o [número máximo de tentativas a fazer para um trabalho](#max-job-attempts-and-timeout). Após um trabalho assíncrono ter excedido este número de tentativas, ele será inserido na tabela `failed_jobs` do banco de dados. Os trabalhos que são [enviados sincronamente e falham](/docs/queues#synchronous-dispatching) não são armazenados nesta tabela, uma vez que as exceções destes trabalhos são imediatamente tratadas pela aplicação.

Normalmente, uma migração para criar a tabela `failed_jobs` já está presente em novos aplicativos do Laravel. Contudo, se o seu aplicativo não tiver uma migração desta tabela, você pode utilizar o comando `make:queue-failed-table` para criar a migração:

```shell
php artisan make:queue-failed-table

php artisan migrate
```

Ao executar um processo de [_worker_ da fila](#running-the-queue-worker), você pode especificar o número máximo de vezes que uma tarefa deve ser tentada, usando a opção `--tries` no comando `queue:work`. Se você não especificar um valor para a opção `--tries`, as tarefas somente serão executadas uma única vez ou quantas vezes indicado pela propriedade `$tries` da classe de tarefa:

```shell
php artisan queue:work redis --tries=3
```

Usando a opção `--backoff`, é possível especificar o número de segundos que o Laravel deve aguardar antes de reter um trabalho que tenha encontrado uma exceção. Por padrão, o trabalho é liberado imediatamente para a fila novamente:

```shell
php artisan queue:work redis --tries=3 --backoff=3
```

 Se você deseja configurar quantos segundos o Laravel deve esperar antes de tentar novamente uma função que encontrou uma exceção por função, defina a propriedade `backoff` na classe de sua função:

```php
    /**
     * O número de segundos a aguardar antes de tentar novamente o trabalho.
     *
     * @var int
     */
    public $backoff = 3;
```

Se necessitar de uma lógica mais complexa para determinar o tempo de retardamento do trabalho, poderá definir um método `backoff` na sua classe do trabalho:

```php
    /**
    * Calcule o número de segundos a esperar antes de tentar novamente o trabalho.
    */
    public function backoff(): int
    {
        return 3;
    }
```

Você pode configurar facilmente backoffs "exponenciais" retornando uma matriz de valores de backoff do método `backoff`. Neste exemplo, o atraso de nova tentativa será de 1 segundo para a primeira tentativa, 5 segundos para a segunda tentativa, 10 segundos para a terceira tentativa e 10 segundos para cada tentativa subsequente se houver mais tentativas restantes:

```php
    /**
    * Calcule o número de segundos a esperar antes de tentar novamente o trabalho.
    *
    * @return array<int, int>
    */
    public function backoff(): array
    {
        return [1, 5, 10];
    }
```

<a name="cleaning-up-after-failed-jobs"></a>
### Limpar após tarefas mal-sucedidas

Quando um determinado trabalho falhar, você pode querer enviar um alerta aos seus usuários ou reverter todas as ações que foram parcialmente concluídas pelo trabalho. Para fazer isso, é possível definir um método `failed` em sua classe de trabalhos. A instância `Throwable` que causou a falha do trabalho será passada para o método `failed`:

```php
    <?php

    namespace App\Jobs;

    use App\Models\Podcast;
    use App\Services\AudioProcessor;
    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;
    use Illuminate\Queue\SerializesModels;
    use Throwable;

    class ProcessPodcast implements ShouldQueue
    {
        use InteractsWithQueue, Queueable, SerializesModels;

        /**
         * Crie uma nova instância de trabalho.
         */
        public function __construct(
            public Podcast $podcast,
        ) {}

        /**
         * Execute o trabalho.
         */
        public function handle(AudioProcessor $processor): void
        {
            // Processar podcast carregado...
        }

        /**
         * Lide com uma falha no trabalho.
         */
        public function failed(?Throwable $exception): void
        {
            // Enviar notificação ao usuário sobre falhas, etc...
        }
    }
```

::: warning ATENÇÃO
Uma nova instância do trabalho é instanciada antes de invocar o método `failed`; portanto, quaisquer modificações de propriedade de classe que possam ter ocorrido dentro do método `handle` serão perdidas.
:::

<a name="retrying-failed-jobs"></a>
### Reiniciar trabalhos falhados

Para visualizar todos os trabalhos que falharam e foram inseridos na sua tabela de banco de dados failed_jobs, você pode utilizar o comando Artisan `queue:failed`:

```shell
php artisan queue:failed
```

O comando "queue:failed" lista o ID de tarefa, conexão, fila, horário do falha e outras informações sobre a tarefa. É possível utilizar o ID da tarefa para reiniciá-la. Por exemplo, se o ID é `ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece`, execute o comando a seguir:

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece
```

Se necessário, é possível passar vários identificadores ao comando:

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece 91401d2c-0784-4f43-824c-34f94a33c24d
```

Você também poderá refazer todos os trabalhos com falha para uma fila específica:

```shell
php artisan queue:retry --queue=name
```

Para refazer todos os trabalhos que falharam, execute o comando `queue:retry` e passe `all` como a ID:

```shell
php artisan queue:retry all
```

Se você quiser apagar uma tarefa com falha, você pode usar o comando `queue:forget`:

```shell
php artisan queue:forget 91401d2c-0784-4f43-824c-34f94a33c24d
```

::: info NOTA
Ao usar [Horizon](/docs/horizon), você deve usar o comando `horizon:forget` para excluir um trabalho com falha em vez do comando `queue:forget`.
:::

Para excluir todos os seus trabalhos com falha da tabela `failed_jobs`, você pode usar o comando `queue:flush`:

```shell
php artisan queue:flush
```

<a name="ignoring-missing-models"></a>
### Ignorando Modelos ausentes

Ao injetar um modelo Eloquent em uma tarefa, o modelo é automaticamente serializado antes de ser colocado na fila e recuperado novamente do banco de dados quando a tarefa for processada. No entanto, se o modelo foi excluído enquanto a tarefa estava esperando para ser processada por um _worker_, a tarefa pode falhar com uma `ModelNotFoundException`.

Para maior conveniência, você pode optar por excluir automaticamente tarefas com modelos faltantes ao definir a propriedade `deleteWhenMissingModels` da sua tarefa como `true`. Quando esta propriedade é definida como `true`, O Laravel descarta silenciosamente a tarefa sem levantar uma exceção:

```php
    /**
     * Exclua o trabalho se seus modelos não existirem mais.
     *
     * @var bool
     */
    public $deleteWhenMissingModels = true;
```

<a name="pruning-failed-jobs"></a>
### Podar trabalhos com falha

Você pode remover registros na tabela `failed_jobs` da aplicação usando o comando `queue:prune-failed` do Artisan:

```shell
php artisan queue:prune-failed
```

Por padrão, todos os registros de processo falhado com mais de 24 horas serão eliminados. Se você fornecer a opção `--hours` ao comando, só serão mantidos os registros de processo falhado inseridos nas últimas N horas. Por exemplo, o seguinte comando irá eliminar todos os registros de processo falhado inseridos há mais de 48 horas:

```shell
php artisan queue:prune-failed --hours=48
```

<a name="storing-failed-jobs-in-dynamodb"></a>
### Armazenar trabalhos com falha no DynamoDB

O Laravel também suporta armazenar registros de tarefas falhadas no [DynamoDB](https://aws.amazon.com/dynamodb) em vez de uma tabela do banco de dados relacional. No entanto, você deve criar manualmente uma tabela no DynamoDB para armazenar todos os registros de tarefas falhadas. Normalmente, esta tabela deve ser nomeada como `failed_jobs`, mas você deve nomear a tabela com base no valor da configuração `queue.failed.table` do arquivo de configuração da aplicação `queue`.

A tabela `failed_jobs` deve ter uma chave de partição primária de string chamada `application` e uma chave de classificação primária de string chamada `uuid`. A parte `application` da chave conterá o nome do seu aplicativo conforme definido pelo valor de configuração `name` dentro do arquivo de configuração `app` do seu aplicativo. Como o nome do aplicativo faz parte da chave da tabela do DynamoDB, você pode usar a mesma tabela para armazenar trabalhos com falha para vários aplicativos Laravel.

Além disso, certifique-se de instalar o AWS SDK para que seu aplicativo Laravel possa se comunicar com o Amazon DynamoDB.

```shell
composer require aws/aws-sdk-php
```

Em seguida, defina o valor da opção de configuração `queue.failed.driver` em `dynamodb`. Além disso, você deve definir as opções de configuração `key`, `secret` e `region` dentro do array de configuração do trabalho falhado. Estas opções são utilizadas para autenticar na AWS. Quando for utilizado o driver `dynamodb`, a opção de configuração `queue.failed.database` é desnecessária:

```php
'failed' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'failed_jobs',
],
```

<a name="disabling-failed-job-storage"></a>
### Desativar o armazenamento de tarefas com falha

Você pode instruir o Laravel a descartar tarefas com erro sem armazená-las definindo o valor da opção de configuração `queue.failed.driver` para `null`. Normalmente, isso é feito por meio da variável de ambiente `QUEUE_FAILED_DRIVER`:

```ini
QUEUE_FAILED_DRIVER=null
```

<a name="failed-job-events"></a>
### Trabalho de eventos não concluído

Se você deseja registrar um evento que será invocado quando uma tarefa falhar, pode usar o método `failing` da facade `Queue`. Por exemplo, é possível anexar um closure (closure) a esse evento no método `boot` do `AppServiceProvider`, que está incluído no Laravel:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Queue;
    use Illuminate\Support\ServiceProvider;
    use Illuminate\Queue\Events\JobFailed;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Registre quaisquer serviços de aplicativos.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Inicialize qualquer serviço de aplicativo.
         */
        public function boot(): void
        {
            Queue::failing(function (JobFailed $event) {
                // $event->connectionName
                // $event->job
                // $event->exception
            });
        }
    }
```

<a name="clearing-jobs-from-queues"></a>
## Limpeza de tarefas das filas

::: info NOTA
Se estiver usando o [Horizon](/docs/horizon), você deve utilizar o comando `horizon:clear` para remover trabalhos da fila em vez do comando `queue:clear`.
:::

Se você quiser excluir todos os trabalhos da fila padrão da conexão padrão, poderá fazer isso usando o comando Artisan `queue:clear`:

```shell
php artisan queue:clear
```

Também é possível usar o argumento `connection` e a opção `queue` para apagar tarefas de uma conexão ou fila específica.

```shell
php artisan queue:clear redis --queue=emails
```

::: warning ATENÇÃO
A exclusão de tarefas de filas está disponível apenas para os drivers SQS, Redis e base de dados. Além disso, o processo de exclusão de mensagens do SQS leva até 60 segundos. Portanto, as tarefas enviadas à fila SQS até 60 segundos após a exclusão da fila também podem ser excluídas.
:::

<a name="monitoring-your-queues"></a>
## Monitorando suas filas

Se sua fila receber um aumento repentino de trabalhos, ela poderá ficar sobrecarregada, resultando em longos tempos de espera para que os trabalhos sejam concluídos. Se desejar, o Laravel pode alertá-lo quando a contagem do número de tarefas exceder um limite especificado.

Para começar, você deve agendar o comando `queue:monitor` para ser executado a cada minuto [aqui](/docs/scheduling). O comando aceita os nomes das filas que deseja monitorar, bem como o limite de contagem de tarefas:

```shell
php artisan queue:monitor redis:default,redis:deployments --max=100
```

O agendamento desse comando sozinho não é suficiente para acionar uma notificação que alerta sobre o status de _overwhelmed_ da fila. Quando o comando encontrar uma fila com um número superior ao seu limite, será enviado um evento `Illuminate\Queue\Events\QueueBusy`. É possível monitorar esse evento dentro do `AppServiceProvider` de sua aplicação para que você ou sua equipe de desenvolvimento recebam uma notificação:

```php
use App\Notifications\QueueHasLongWaitTime;
use Illuminate\Queue\Events\QueueBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Event::listen(function (QueueBusy $event) {
        Notification::route('mail', 'dev@example.com')
                ->notify(new QueueHasLongWaitTime(
                    $event->connection,
                    $event->queue,
                    $event->size
                ));
    });
}
```

<a name="testing"></a>
## Teste

Ao testar códigos que dispacham tarefas, você pode desejar instruir o Laravel para não executar realmente a própria tarefa, uma vez que seu código pode ser testado diretamente e separadamente do código que dispacha. É claro que, para testar a própria tarefa, é possível criar um objeto de tarefa e invocar o método `handle` diretamente no teste.

É possível usar o método `fake` da facade `Queue` para impedir que os trabalhos na fila sejam efetivamente enviados à fila. Após a chamada do método `fake` da facade `Queue`, você pode então afirmar que o aplicativo tentou enviar os trabalhos para a fila:

::: code-group
```php [Pest]
<?php

use App\Jobs\AnotherJob;
use App\Jobs\FinalJob;
use App\Jobs\ShipOrder;
use Illuminate\Support\Facades\Queue;

test('orders can be shipped', function () {
    Queue::fake();

    // Realizar envio de pedidos...

    // Afirme que nenhuma tarefa foi enviada...
    Queue::assertNothingPushed();

    // Afirme que um trabalho foi enviado para uma determinada fila...
    Queue::assertPushedOn('queue-name', ShipOrder::class);

    // Afirmar que uma tarefa foi enviada duas vezes...
    Queue::assertPushed(ShipOrder::class, 2);

    // Afirmar que um trabalho não foi enviado...
    Queue::assertNotPushed(AnotherJob::class);

    // Afirme que um Closure foi enviado para a fila...
    Queue::assertClosurePushed();

    // Afirme o número total de trabalhos que foram enviados...
    Queue::assertCount(3);
});
```


```php [PHPUnit]
<?php

namespace Tests\Feature;

use App\Jobs\AnotherJob;
use App\Jobs\FinalJob;
use App\Jobs\ShipOrder;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Queue::fake();

        // Realizar envio de pedidos...

        // Afirme que nenhuma tarefa foi enviada...
        Queue::assertNothingPushed();

        // Afirme que um trabalho foi enviado para uma determinada fila...
        Queue::assertPushedOn('queue-name', ShipOrder::class);

        // Afirmar que uma tarefa foi enviada duas vezes...
        Queue::assertPushed(ShipOrder::class, 2);

        // Afirmar que um trabalho não foi enviado...
        Queue::assertNotPushed(AnotherJob::class);

        // Afirme que um Closure foi enviado para a fila...
        Queue::assertClosurePushed();

        // Afirme o número total de trabalhos que foram enviados...
        Queue::assertCount(3);
    }
}
```
:::

Você pode passar uma função de verificação às funções `assertPushed` ou `assertNotPushed`, para garantir que foi enviado um trabalho, que satisfaz a verificação específica. Se tiver sido enviado ao menos um trabalho que satisfaça a verificação específica, a afirmação terá êxito:

```php
    Queue::assertPushed(function (ShipOrder $job) use ($order) {
        return $job->order->id === $order->id;
    });
```

<a name="faking-a-subset-of-jobs"></a>
### Falsificando um subconjunto de trabalhos

Se você só precisa falsificar determinadas tarefas enquanto permite que as outras sejam executadas normalmente, poderá passar os nomes das classes das tarefas a serem falsificadas ao método `fake`:

::: code-group
```php [Pest]
test('orders can be shipped', function () {
    Queue::fake([
        ShipOrder::class,
    ]);

    // Realizar envio de pedidos...

    // Afirmar que uma tarefa foi enviada duas vezes...
    Queue::assertPushed(ShipOrder::class, 2);
});
```

```php [PHPUnit]
public function test_orders_can_be_shipped(): void
{
    Queue::fake([
        ShipOrder::class,
    ]);

    // Realizar envio de pedidos...

    // Afirmar que uma tarefa foi enviada duas vezes...
    Queue::assertPushed(ShipOrder::class, 2);
}
```
:::

É possível falsificar todos os trabalhos exceto um conjunto de trabalhos especificados, utilizando o método `except`:

```php
    Queue::fake()->except([
        ShipOrder::class,
    ]);
```

<a name="testing-job-chains"></a>
### Teste de cadeias de processos

Para testar cadeias de trabalho, será necessário utilizar os recursos de simulação da interface `Bus`. O método `assertChained` da interface `Bus` pode ser usado para garantir que um conjunto de [trabalhos em cadeia](/docs/queues#job-chaining) foi enviado. O método `assertChained` aceita como primeiro argumento uma matriz de trabalhos na forma de cadeias:

```php
    use App\Jobs\RecordShipment;
    use App\Jobs\ShipOrder;
    use App\Jobs\UpdateInventory;
    use Illuminate\Support\Facades\Bus;

    Bus::fake();

    // ...

    Bus::assertChained([
        ShipOrder::class,
        RecordShipment::class,
        UpdateInventory::class
    ]);
```

Como você pode ver no exemplo acima, a matriz de tarefas concatenadas pode ser uma matriz dos nomes da classe de cada tarefa. No entanto, você também pode fornecer uma matriz de instâncias reais de tarefas. Nesse caso, o Laravel garantirá que as instâncias das tarefas sejam da mesma classe e tenham os mesmos valores de propriedades das tarefas concatenadas enviadas pela sua aplicação:

```php
    Bus::assertChained([
        new ShipOrder,
        new RecordShipment,
        new UpdateInventory,
    ]);
```

Você pode usar o método `assertDispatchedWithoutChain` para garantir que um trabalho foi enviado sem uma cadeia de tarefas.

```php
    Bus::assertDispatchedWithoutChain(ShipOrder::class);
```

<a name="testing-chain-modifications"></a>
#### Teste de modificações da cadeia

Se um trabalho concatenado estiver anexando ou pré-anexando tarefas a uma cadeia existente, você poderá usar o método `assertHasChain` do trabalho para garantir que o trabalho tenha a cadeia esperada de tarefas restantes:

```php
$job = new ProcessPodcast;

$job->handle();

$job->assertHasChain([
    new TranscribePodcast,
    new OptimizePodcast,
    new ReleasePodcast,
]);
```

O método `assertDoesntHaveChain` pode ser usado para afirmar que a cadeia restante da tarefa está vazia:

```php
$job->assertDoesntHaveChain();
```

<a name="testing-chained-batches"></a>
#### Teste de lote em cadeia

Se um trabalho encadeado [adiciona ou acrescenta trabalhos a uma cadeia existente](#adding-jobs-to-the-chain), você pode usar o método `assertHasChain` do trabalho para afirmar que o trabalho tem a cadeia esperada de trabalhos restantes:

```php
    use App\Jobs\ShipOrder;
    use App\Jobs\UpdateInventory;
    use Illuminate\Bus\PendingBatch;
    use Illuminate\Support\Facades\Bus;

    Bus::assertChained([
        new ShipOrder,
        Bus::chainedBatch(function (PendingBatch $batch) {
            return $batch->jobs->count() === 3;
        }),
        new UpdateInventory,
    ]);
```

<a name="testing-job-batches"></a>
### Teste de lotes de trabalhos

O método `assertBatched` da facade `Bus` permite garantir que um lote de tarefas foi enviado. O closure fornecido ao método `assertBatched` recebe uma instância do `Illuminate\Bus\PendingBatch`, que pode ser usada para inspecionar as tarefas dentro do lote:

```php
    use Illuminate\Bus\PendingBatch;
    use Illuminate\Support\Facades\Bus;

    Bus::fake();

    // ...

    Bus::assertBatched(function (PendingBatch $batch) {
        return $batch->name == 'import-csv' &&
               $batch->jobs->count() === 10;
    });
```

 Você pode usar o método `assertBatchCount` para garantir que um número determinado de lotes foi expedido.

```php
    Bus::assertBatchCount(3);
```

 Você pode usar o `assertNothingBatched` para garantir que nenhum lote foi enviado:

```php
    Bus::assertNothingBatched();
```

<a name="testing-job-batch-interaction"></a>
#### Teste de interação de trabalho/lote

Além disso, você pode ocasionalmente precisar testar uma interação de tarefa subjacente com seu lote subjacente. Por exemplo, talvez seja necessário testar se uma tarefa cancelou o processamento adicional do lote. Para fazer isso, você precisa atribuir um lote falso à tarefa por meio do método `withFakeBatch`. O método `withFakeBatch` retorna um par que contém a instância da tarefa e o lote falso:

```php
    [$job, $batch] = (new ShipOrder)->withFakeBatch();

    $job->handle();

    $this->assertTrue($batch->cancelled());
    $this->assertEmpty($batch->added);
```

<a name="testing-job-queue-interactions"></a>
### Teste de interação de tarefas/filas

Às vezes, você poderá precisar testar que um trabalho na fila [se liberta novamente na fila] (#manually-releasing-a-job). Ou, pode ser necessário testar se o trabalho foi excluído. Você poderá testar essas interações de fila ao instanciar o trabalho e invocar o método `withFakeQueueInteractions`.

Depois que as interações da fila de tarefas forem falsificadas, você poderá invocar a método `handle` na tarefa. Após a invocação da tarefa, os métodos `assetReleased`, `assertDeleted`, e `assertFailed` podem ser utilizados para fazer asserções com relação às interações da fila de tarefas:

```php
use App\Jobs\ProcessPodcast;

$job = (new ProcessPodcast)->withFakeQueueInteractions();

$job->handle();

$job->assertReleased(delay: 30);
$job->assertDeleted();
$job->assertFailed();
```

<a name="job-events"></a>
## Trabalho de eventos

Usando os métodos `before` e `after` da facade [Queue](/docs/facades), você pode especificar callbacks a serem executados antes ou depois que um trabalho em fila for processado. Estes callbacks são uma excelente de oportunidade para realizar registros adicionais ou incrementar estatísticas para um painel de controle. Tipicamente, você deve chamar estes métodos do método `boot` de um [provider de serviço](/docs/providers). Por exemplo, podemos usar o `AppServiceProvider` incluído com Laravel:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Queue;
    use Illuminate\Support\ServiceProvider;
    use Illuminate\Queue\Events\JobProcessed;
    use Illuminate\Queue\Events\JobProcessing;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Registre quaisquer serviços de aplicativos.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Inicialize qualquer serviço de aplicativo.
         */
        public function boot(): void
        {
            Queue::before(function (JobProcessing $event) {
                // $event->connectionName
                // $event->job
                // $event->job->payload()
            });

            Queue::after(function (JobProcessed $event) {
                // $event->connectionName
                // $event->job
                // $event->job->payload()
            });
        }
    }
```

Usando o método `looping` na `Queue` [fachada](/docs/facades), você pode especificar retornos de chamada que são executados antes que o trabalhador tente buscar um trabalho de uma fila. Por exemplo, você pode registrar um closure para reverter quaisquer transações que foram deixadas abertas por um trabalho com falha anterior:

```php
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Queue;

    Queue::looping(function () {
        while (DB::transactionLevel() > 0) {
            DB::rollBack();
        }
    });
```
