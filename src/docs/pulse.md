# Laravel Pulse

<a name="introduction"></a>
## Introdução

[Laravel Pulse](https://github.com/laravel/pulse) fornece insights rápidos sobre o desempenho e o uso do seu aplicativo. Com o Pulse, você pode rastrear gargalos como trabalhos e endpoints lentos, encontrar seus usuários mais ativos e muito mais.

Para depuração aprofundada de eventos individuais, confira [Laravel Telescope](/docs/telescope).

<a name="installation"></a>
## Instalação

::: warning AVISO
A implementação de armazenamento primário do Pulse atualmente requer um banco de dados MySQL, MariaDB ou PostgreSQL. Se você estiver usando um mecanismo de banco de dados diferente, precisará de um banco de dados MySQL, MariaDB ou PostgreSQL separado para seus dados do Pulse.
:::

Você pode instalar o Pulse usando o gerenciador de pacotes do Composer:

```sh
composer require laravel/pulse
```

Em seguida, você deve publicar os arquivos de configuração e migração do Pulse usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Pulse\PulseServiceProvider"
```

Finalmente, você deve executar o comando `migrate` para criar as tabelas necessárias para armazenar os dados do Pulse:

```shell
php artisan migrate
```

Depois que as migrações do banco de dados do Pulse forem executadas, você pode acessar o painel do Pulse pela rota `/pulse`.

::: info NOTA
Se você não quiser armazenar dados do Pulse no banco de dados principal do seu aplicativo, você pode [especificar uma conexão de banco de dados dedicada](#using-a-different-database).
:::

<a name="configuration"></a>
### Configuração

Muitas das opções de configuração do Pulse podem ser controladas usando variáveis ​​de ambiente. Para ver as opções disponíveis, registrar novos gravadores ou configurar opções avançadas, você pode publicar o arquivo de configuração `config/pulse.php`:

```sh
php artisan vendor:publish --tag=pulse-config
```

<a name="dashboard"></a>
## Painel

<a name="dashboard-authorization"></a>
### Autorização

O painel Pulse pode ser acessado pela rota `/pulse`. Por padrão, você só poderá acessar este painel no ambiente `local`, então você precisará configurar a autorização para seus ambientes de produção personalizando o portão de autorização `'viewPulse'`. Você pode fazer isso no arquivo `app/Providers/AppServiceProvider.php` do seu aplicativo:

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Gate::define('viewPulse', function (User $user) {
        return $user->isAdmin();
    });

    // ...
}
```

<a name="dashboard-customization"></a>
### Personalização

Os cartões e o layout do painel Pulse podem ser configurados publicando a visualização do painel. A visualização do painel será publicada em `resources/views/vendor/pulse/dashboard.blade.php`:

```sh
php artisan vendor:publish --tag=pulse-dashboard
```

O painel é alimentado por [Livewire](https://livewire.laravel.com/), e permite que você personalize os cartões e o layout sem precisar reconstruir nenhum ativo JavaScript.

Dentro deste arquivo, o componente `<x-pulse>` é responsável por renderizar o painel e fornece um layout de grade para os cartões. Se você quiser que o painel ocupe toda a largura da tela, você pode fornecer a prop `full-width` para o componente:

```blade
<x-pulse full-width>
    ...
</x-pulse>
```

Por padrão, o componente `<x-pulse>` criará uma grade de 12 colunas, mas você pode personalizar isso usando a prop `cols`:

```blade
<x-pulse cols="16">
    ...
</x-pulse>
```

Cada cartão aceita uma prop `cols` e `rows` para controlar o espaço e o posicionamento:

```blade
<livewire:pulse.usage cols="4" rows="2" />
```

A maioria dos cartões também aceita uma prop `expand` para mostrar o cartão inteiro em vez de rolar:

```blade
<livewire:pulse.slow-queries expand />
```

<a name="dashboard-resolving-users"></a>
### Resolvendo usuários

Para cards que exibem informações sobre seus usuários, como o card Application Usage, o Pulse registrará apenas o ID do usuário. Ao renderizar o painel, o Pulse resolverá os campos `name` e `email` do seu modelo `Authenticatable` padrão e exibirá avatares usando o serviço web Gravatar.

Você pode personalizar os campos e o avatar invocando o método `Pulse::user` dentro da classe `App\Providers\AppServiceProvider` do seu aplicativo.

O método `user` aceita um fechamento que receberá o modelo `Authenticatable` a ser exibido e deve retornar uma matriz contendo informações de `name`, `extra` e `avatar` para o usuário:

```php
use Laravel\Pulse\Facades\Pulse;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Pulse::user(fn ($user) => [
        'name' => $user->name,
        'extra' => $user->email,
        'avatar' => $user->avatar_url,
    ]);

    // ...
}
```

::: info NOTA
Você pode personalizar completamente como o usuário autenticado é capturado e recuperado implementando o contrato `Laravel\Pulse\Contracts\ResolvesUsers` e vinculando-o no [contêiner de serviço](/docs/container#binding-a-singleton) do Laravel.
:::

<a name="dashboard-cards"></a>
### Cartões

<a name="servers-card"></a>
#### Servidores

O cartão `<livewire:pulse.servers />` exibe o uso de recursos do sistema para todos os servidores que executam o comando `pulse:check`. Consulte a documentação referente ao [servers recorder](#servers-recorder) para obter mais informações sobre relatórios de recursos do sistema.

Se você substituir um servidor em sua infraestrutura, talvez queira parar de exibir o servidor inativo no painel do Pulse após uma duração determinada. Você pode fazer isso usando a prop `ignore-after`, que aceita o número de segundos após os quais os servidores inativos devem ser removidos do painel do Pulse. Como alternativa, você pode fornecer uma string formatada de tempo relativo, como `1 hora` ou `3 dias e 1 hora`:

```blade
<livewire:pulse.servers ignore-after="3 hours" />
```

<a name="application-usage-card"></a>
#### Uso do aplicativo

O cartão `<livewire:pulse.usage />` exibe os 10 principais usuários que fazem solicitações ao seu aplicativo, despacham trabalhos e enfrentam solicitações lentas.

Se desejar visualizar todas as métricas de uso na tela ao mesmo tempo, você pode incluir o cartão várias vezes e especificar o atributo `type`:

```blade
<livewire:pulse.usage type="requests" />
<livewire:pulse.usage type="slow_requests" />
<livewire:pulse.usage type="jobs" />
```

Para saber como personalizar como o Pulse recupera e exibe informações do usuário, consulte nossa documentação sobre [resolvendo usuários](#dashboard-resolving-users).

::: info NOTA
Se seu aplicativo receber muitas solicitações ou despachar muitos trabalhos, você pode habilitar [amostragem](#sampling). Consulte a documentação do [registrador de solicitações do usuário](#user-requests-recorder), [registrador de trabalhos do usuário](#user-jobs-recorder) e [registrador de trabalhos lentos](#slow-jobs-recorder) para obter mais informações.
:::

<a name="exceptions-card"></a>
#### Exceções

O cartão `<livewire:pulse.exceptions />` mostra a frequência e a atualidade das exceções que ocorrem em seu aplicativo. Por padrão, as exceções são agrupadas com base na classe de exceção e no local onde ocorreram. Veja a documentação do [registrador de exceções](#exceptions-recorder) para mais informações.

<a name="queues-card"></a>
#### Filas

O cartão `<livewire:pulse.queues />` mostra a taxa de transferência das filas em seu aplicativo, incluindo o número de trabalhos na fila, em processamento, processados, liberados e com falha. Veja a documentação do [registrador de filas](#queues-recorder) para mais informações.

<a name="slow-requests-card"></a>
#### Solicitações lentas

O cartão `<livewire:pulse.slow-requests />` mostra as solicitações recebidas em seu aplicativo que excedem o limite configurado, que é de 1.000 ms por padrão. Veja a documentação do [registrador de solicitações lentas](#slow-requests-recorder) para mais informações.

<a name="slow-jobs-card"></a>
#### Trabalhos lentos

O cartão `<livewire:pulse.slow-jobs />` mostra os trabalhos enfileirados em seu aplicativo que excedem o limite configurado, que é de 1.000 ms por padrão. Veja a documentação do [gravador de trabalhos lentos](#slow-jobs-recorder) para mais informações.

<a name="slow-queries-card"></a>
#### Consultas lentas

O cartão `<livewire:pulse.slow-queries />` mostra as consultas de banco de dados em seu aplicativo que excedem o limite configurado, que é de 1.000 ms por padrão.

Por padrão, as consultas lentas são agrupadas com base na consulta SQL (sem vinculações) e no local onde ocorreram, mas você pode optar por não capturar o local se desejar agrupar apenas na consulta SQL.

Se você encontrar problemas de desempenho de renderização devido a consultas SQL extremamente grandes recebendo destaque de sintaxe, você pode desabilitar o destaque adicionando a propriedade `without-highlighting`:

```blade
<livewire:pulse.slow-queries without-highlighting />
```

Veja a documentação do [gravador de consultas lentas](#slow-queries-recorder) para mais informações.

<a name="slow-outgoing-requests-card"></a>
#### Solicitações de saída lentas

O cartão `<livewire:pulse.slow-outgoing-requests />` mostra as solicitações de saída feitas usando o [cliente HTTP](/docs/http-client) do Laravel que excedem o limite configurado, que é de 1.000 ms por padrão.

Por padrão, as entradas serão agrupadas pela URL completa. No entanto, você pode desejar normalizar ou agrupar solicitações de saída semelhantes usando expressões regulares. Veja a documentação do [gravador de solicitações de saída lentas](#slow-outgoing-requests-recorder) para mais informações.

<a name="cache-card"></a>
#### Cache

O cartão `<livewire:pulse.cache />` mostra as estatísticas de acertos e erros de cache para seu aplicativo, tanto globalmente quanto para chaves individuais.

Por padrão, as entradas serão agrupadas por chave. No entanto, você pode desejar normalizar ou agrupar chaves semelhantes usando expressões regulares. Veja a documentação do [registrador de interações de cache](#cache-interactions-recorder) para mais informações.

<a name="capturing-entries"></a>
## Capturando entradas

A maioria dos gravadores Pulse capturará automaticamente as entradas com base nos eventos de estrutura despachados pelo Laravel. No entanto, o [gravador de servidores](#servers-recorder) e alguns cartões de terceiros devem pesquisar informações regularmente. Para usar esses cartões, você deve executar o daemon `pulse:check` em todos os seus servidores de aplicativos individuais:

```php
php artisan pulse:check
```

::: info NOTA
Para manter o processo `pulse:check` em execução permanentemente em segundo plano, você deve usar um monitor de processo como o Supervisor para garantir que o comando não pare de ser executado.
:::

Como o comando `pulse:check` é um processo de longa duração, ele não verá alterações em sua base de código sem ser reiniciado. Você deve reiniciar o comando graciosamente chamando o comando `pulse:restart` durante o processo de implantação do seu aplicativo:

```sh
php artisan pulse:restart
```

::: info NOTA
O Pulse usa o [cache](/docs/cache) para armazenar sinais de reinicialização, portanto, você deve verificar se um driver de cache está configurado corretamente para seu aplicativo antes de usar esse recurso.
:::

<a name="recorders"></a>
### Gravadores

Os gravadores são responsáveis ​​por capturar entradas do seu aplicativo para serem gravadas no banco de dados Pulse. Os gravadores são registrados e configurados na seção `recorders` do [arquivo de configuração do Pulse](#configuration).

<a name="cache-interactions-recorder"></a>
#### Interações de cache

O gravador `CacheInteractions` captura informações sobre os acertos e erros do [cache](/docs/cache) que ocorrem no seu aplicativo para exibição no cartão [Cache](#cache-card).

Você pode, opcionalmente, ajustar a [taxa de amostragem](#sampling) e os padrões de chave ignorados.

Você também pode configurar o agrupamento de chaves para que chaves semelhantes sejam agrupadas como uma única entrada. Por exemplo, você pode desejar remover IDs exclusivos de chaves que armazenam em cache o mesmo tipo de informação. Os grupos são configurados usando uma expressão regular para "localizar e substituir" partes da chave. Um exemplo está incluído no arquivo de configuração:

```php
Recorders\CacheInteractions::class => [
    // ...
    'groups' => [
        // '/:\d+/' => ':*',
    ],
],
```

O primeiro padrão que corresponder será usado. Se nenhum padrão corresponder, a chave será capturada como está.

<a name="exceptions-recorder"></a>
#### Exceções

O registrador `Exceptions` captura informações sobre exceções reportáveis ​​que ocorrem em seu aplicativo para exibição no cartão [Exceptions](#exceptions-card).

Você pode, opcionalmente, ajustar os padrões [sample rate](#sampling) e exceções ignoradas. Você também pode configurar se deseja capturar o local de onde a exceção se originou. O local capturado será exibido no painel do Pulse, o que pode ajudar a rastrear a origem da exceção; no entanto, se a mesma exceção ocorrer em vários locais, ela aparecerá várias vezes para cada local exclusivo.

<a name="queues-recorder"></a>
#### Filas

O registrador `Queues` captura informações sobre as filas de seus aplicativos para exibição no [Queues](#queues-card).

Você pode, opcionalmente, ajustar a [sample rate](#sampling) e os padrões de jobs ignorados.

<a name="slow-jobs-recorder"></a>
#### Tarefas lentas

O registrador `SlowJobs` captura informações sobre os jobs lentos que ocorrem em seu aplicativo para exibição no cartão [Slow Jobs](#slow-jobs-recorder).

Você pode, opcionalmente, ajustar o limite de jobs lentos, [sample rate](#sampling) e os padrões de jobs ignorados.

Você pode ter alguns jobs que espera que demorem mais do que outros. Nesses casos, você pode configurar limites por job:

```php
Recorders\SlowJobs::class => [
    // ...
    'threshold' => [
        '#^App\\Jobs\\GenerateYearlyReports$#' => 5000,
        'default' => env('PULSE_SLOW_JOBS_THRESHOLD', 1000),
    ],
],
```

Se nenhum padrão de expressão regular corresponder ao nome de classe do job, o valor `'default'` será usado.

<a name="slow-outgoing-requests-recorder"></a>
#### Solicitações de saída lentas

O gravador `SlowOutgoingRequests` captura informações sobre solicitações HTTP de saída feitas usando o [cliente HTTP](/docs/http-client) do Laravel que excedem o limite configurado para exibição no cartão [Solicitações de saída lentas](#slow-outgoing-requests-card).

Você pode opcionalmente ajustar o limite de solicitação de saída lenta, [taxa de amostragem](#sampling) e padrões de URL ignorados.

Você pode ter algumas solicitações de saída que espera que demorem mais do que outras. Nesses casos, você pode configurar limites por solicitação:

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'threshold' => [
        '#backup.zip$#' => 5000,
        'default' => env('PULSE_SLOW_OUTGOING_REQUESTS_THRESHOLD', 1000),
    ],
],
```

Se nenhum padrão de expressão regular corresponder à URL da solicitação, o valor `'default'` será usado.

Você também pode configurar o agrupamento de URLs para que URLs semelhantes sejam agrupadas como uma única entrada. Por exemplo, você pode desejar remover IDs exclusivos de caminhos de URL ou agrupar somente por domínio. Os grupos são configurados usando uma expressão regular para "localizar e substituir" partes da URL. Alguns exemplos estão incluídos no arquivo de configuração:

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'groups' => [
        // '#^https://api\.github\.com/repos/.*$#' => 'api.github.com/repos/*',
        // '#^https?://([^/]*).*$#' => '\1',
        // '#/\d+#' => '/*',
    ],
],
```

O primeiro padrão que corresponder será usado. Se nenhum padrão corresponder, a URL será capturada como está.

<a name="slow-queries-recorder"></a>
#### Consultas lentas

O gravador `SlowQueries` captura todas as consultas de banco de dados em seu aplicativo que excedem o limite configurado para exibição no cartão [Consultas lentas](#slow-queries-card).

Opcionalmente, você pode ajustar o limite de consulta lenta, [taxa de amostragem](#amostragem) e padrões de consulta ignorados. Você também pode configurar se deseja capturar o local da consulta. O local capturado será exibido no painel do Pulse, o que pode ajudar a rastrear a origem da consulta; no entanto, se a mesma consulta for feita em vários locais, ela aparecerá várias vezes para cada local exclusivo.

Você pode ter algumas consultas que espera que demorem mais do que outras. Nesses casos, você pode configurar limites por consulta:

```php
Recorders\SlowQueries::class => [
    // ...
    'threshold' => [
        '#^insert into `yearly_reports`#' => 5000,
        'default' => env('PULSE_SLOW_QUERIES_THRESHOLD', 1000),
    ],
],
```

Se nenhum padrão de expressão regular corresponder ao SQL da consulta, o valor `'default'` será usado.

<a name="slow-requests-recorder"></a>
#### Solicitações lentas

O gravador `Requests` captura informações sobre solicitações feitas ao seu aplicativo para exibição nos cartões [Solicitações lentas](#slow-requests-card) e [Uso do aplicativo](#application-usage-card).

Você pode, opcionalmente, ajustar o limite de rota lenta, [taxa de amostragem](#sampling) e caminhos ignorados.

Você pode ter algumas solicitações que espera que demorem mais do que outras. Nesses casos, você pode configurar limites por solicitação:

```php
Recorders\SlowRequests::class => [
    // ...
    'threshold' => [
        '#^/admin/#' => 5000,
        'default' => env('PULSE_SLOW_REQUESTS_THRESHOLD', 1000),
    ],
],
```

Se nenhum padrão de expressão regular corresponder à URL da solicitação, o valor `'default'` será usado.

<a name="servers-recorder"></a>
#### Servidores

O gravador `Servers` captura o uso de CPU, memória e armazenamento dos servidores que alimentam seu aplicativo para exibição no cartão [Servers](#servers-card). Este gravador requer que o [comando`pulse:check`](#capturing-entries) esteja em execução em cada um dos servidores que você deseja monitorar.

Cada servidor de relatórios deve ter um nome exclusivo. Por padrão, o Pulse usará o valor retornado pela função `gethostname` do PHP. Se você deseja personalizar isso, pode definir a variável de ambiente `PULSE_SERVER_NAME`:

```env
PULSE_SERVER_NAME=load-balancer
```

O arquivo de configuração do Pulse também permite que você personalize os diretórios que são monitorados.

<a name="user-jobs-recorder"></a>
#### Trabalhos do usuário

O registrador `UserJobs` captura informações sobre os usuários que despacham trabalhos em seu aplicativo para exibição no cartão [Uso do aplicativo](#application-usage-card).

Você pode, opcionalmente, ajustar a [taxa de amostragem](#sampling) e os padrões de trabalho ignorados.

<a name="user-requests-recorder"></a>
#### Solicitações do usuário

O registrador `UserRequests` captura informações sobre os usuários que fazem solicitações ao seu aplicativo para exibição no cartão [Uso do aplicativo](#application-usage-card).

Você pode, opcionalmente, ajustar a [taxa de amostragem](#sampling) e os padrões de trabalho ignorados.

<a name="filtering"></a>
### Filtragem

Como vimos, muitos [gravadores](#recorders) oferecem a capacidade de, por meio de configuração, "ignorar" entradas de entrada com base em seu valor, como a URL de uma solicitação. Mas, às vezes, pode ser útil filtrar registros com base em outros fatores, como o usuário autenticado no momento. Para filtrar esses registros, você pode passar um fechamento para o método `filter` do Pulse. Normalmente, o método `filter` deve ser invocado dentro do método `boot` do `AppServiceProvider` do seu aplicativo:

```php
use Illuminate\Support\Facades\Auth;
use Laravel\Pulse\Entry;
use Laravel\Pulse\Facades\Pulse;
use Laravel\Pulse\Value;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Pulse::filter(function (Entry|Value $entry) {
        return Auth::user()->isNotAdmin();
    });

    // ...
}
```

<a name="performance"></a>
## Desempenho

O Pulse foi projetado para ser inserido em um aplicativo existente sem exigir nenhuma infraestrutura adicional. No entanto, para aplicativos de alto tráfego, há várias maneiras de remover qualquer impacto que o Pulse possa ter no desempenho do seu aplicativo.

<a name="using-a-different-database"></a>
### Usando um banco de dados diferente

Para aplicativos de alto tráfego, você pode preferir usar uma conexão de banco de dados dedicada para o Pulse para evitar impacto no banco de dados do seu aplicativo.

Você pode personalizar a [conexão de banco de dados](/docs/database#configuration) usada pelo Pulse definindo a variável de ambiente ``PULSE_DB_CONNECTION`.

```env
PULSE_DB_CONNECTION=pulse
```

<a name="ingest"></a>
### Redis Ingest

::: warning AVISO
O Redis Ingest requer o Redis 6.2 ou superior e `phpredis` ou `predis` como o driver de cliente Redis configurado do aplicativo.
:::

Por padrão, o Pulse armazenará entradas diretamente na [conexão de banco de dados configurada](#using-a-different-database) após a resposta HTTP ter sido enviada ao cliente ou um trabalho ter sido processado; no entanto, você pode usar o driver de ingestão Redis do Pulse para enviar entradas para um fluxo Redis. Isso pode ser habilitado configurando a variável de ambiente `PULSE_INGEST_DRIVER`:

```
PULSE_INGEST_DRIVER=redis
```

O Pulse usará sua [conexão Redis](/docs/redis#configuration) padrão por padrão, mas você pode personalizar isso por meio da variável de ambiente `PULSE_REDIS_CONNECTION`:

```
PULSE_REDIS_CONNECTION=pulse
```

Ao usar a ingestão Redis, você precisará executar o comando `pulse:work` para monitorar o fluxo e mover entradas do Redis para as tabelas de banco de dados do Pulse.

```php
php artisan pulse:work
```

::: info NOTA
Para manter o processo `pulse:work` em execução permanentemente em segundo plano, você deve usar um monitor de processo como o Supervisor para garantir que o trabalhador do Pulse não pare de executar.
:::

Como o comando `pulse:work` é um processo de longa duração, ele não verá alterações na sua base de código sem ser reiniciado. Você deve reiniciar o comando graciosamente chamando o comando `pulse:restart` durante o processo de implantação do seu aplicativo:

```sh
php artisan pulse:restart
```

::: info NOTA
O Pulse usa o [cache](/docs/cache) para armazenar sinais de reinicialização, então você deve verificar se um driver de cache está configurado corretamente para seu aplicativo antes de usar este recurso.
:::

<a name="sampling"></a>
### Amostragem

Por padrão, o Pulse capturará todos os eventos relevantes que ocorrerem em seu aplicativo. Para aplicativos de alto tráfego, isso pode resultar na necessidade de agregar milhões de linhas de banco de dados no painel, especialmente por períodos de tempo mais longos.

Em vez disso, você pode optar por habilitar a "amostragem" em certos gravadores de dados do Pulse. Por exemplo, definir a taxa de amostragem como `0,1` no gravador [`User Requests`](#user-requests-recorder) significa que você registrará apenas aproximadamente 10% das solicitações para seu aplicativo. No painel, os valores serão ampliados e prefixados com `~` para indicar que são uma aproximação.

Em geral, quanto mais entradas você tiver para uma métrica específica, menor será a taxa de amostragem definida com segurança, sem sacrificar muita precisão.

<a name="trimming"></a>
### Corte

O Pulse cortará automaticamente suas entradas armazenadas quando elas estiverem fora da janela do painel. O corte ocorre ao ingerir dados usando um sistema de loteria que pode ser personalizado no [arquivo de configuração](#configuration) do Pulse.

<a name="pulse-exceptions"></a>
### Manipulando exceções do Pulse

Se ocorrer uma exceção durante a captura de dados do Pulse, como não conseguir se conectar ao banco de dados de armazenamento, o Pulse falhará silenciosamente para evitar impactos em seu aplicativo.

Se desejar personalizar como essas exceções são tratadas, você pode fornecer um fechamento para o método `handleExceptionsUsing`:

```php
use Laravel\Pulse\Facades\Pulse;
use Illuminate\Support\Facades\Log;

Pulse::handleExceptionsUsing(function ($e) {
    Log::debug('An exception happened in Pulse', [
        'message' => $e->getMessage(),
        'stack' => $e->getTraceAsString(),
    ]);
});
```

<a name="custom-cards"></a>
## Cartões personalizados

O Pulse permite que você crie cartões personalizados para exibir dados relevantes às necessidades específicas do seu aplicativo. O Pulse usa [Livewire](https://livewire.laravel.com), então você pode querer [revisar sua documentação](https://livewire.laravel.com/docs) antes de criar seu primeiro cartão personalizado.

<a name="custom-card-components"></a>
### Componentes do cartão

A criação de um cartão personalizado no Laravel Pulse começa com a extensão do componente Livewire base `Card` e a definição de uma visualização correspondente:

```php
namespace App\Livewire\Pulse;

use Laravel\Pulse\Livewire\Card;
use Livewire\Attributes\Lazy;

#[Lazy]
class TopSellers extends Card
{
    public function render()
    {
        return view('livewire.pulse.top-sellers');
    }
}
```

Ao usar o recurso [lazy loading](https://livewire.laravel.com/docs/lazy) do Livewire, o componente `Card` fornecerá automaticamente um espaço reservado que respeita os atributos `cols` e `rows` passados ​​para seu componente.

Ao escrever a visualização correspondente do seu cartão Pulse, você pode aproveitar os componentes Blade do Pulse para uma aparência e comportamento consistentes:

```blade
<x-pulse::card :cols="$cols" :rows="$rows" :class="$class" wire:poll.5s="">
    <x-pulse::card-header name="Top Sellers">
        <x-slot:icon>
            ...
        </x-slot:icon>
    </x-pulse::card-header>

    <x-pulse::scroll :expand="$expand">
        ...
    </x-pulse::scroll>
</x-pulse::card>
```

As variáveis ​​`$cols`, `$rows`, `$class` e `$expand` devem ser passadas para seus respectivos componentes Blade para que o layout do cartão possa ser personalizado a partir da visualização do painel. Você também pode incluir o atributo `wire:poll.5s=""` na sua visualização para que o cartão seja atualizado automaticamente.

Depois de definir seu componente e modelo Livewire, o cartão pode ser incluído na sua [visualização do painel](#dashboard-customization):

```blade
<x-pulse>
    ...

    <livewire:pulse.top-sellers cols="4" />
</x-pulse>
```

::: info NOTA
Se o seu cartão estiver incluído em um pacote, você precisará registrar o componente com o Livewire usando o método `Livewire::component`.
:::

<a name="custom-card-styling"></a>
### Estilo

Se seu cartão exigir estilo adicional além das classes e componentes incluídos no Pulse, há algumas opções para incluir CSS personalizado para seus cartões.

<a name="custom-card-styling-vite"></a>
#### Integração Laravel Vite

Se seu cartão personalizado estiver dentro da base de código do seu aplicativo e você estiver usando a [integração Vite](/docs/vite) do Laravel, você pode atualizar seu arquivo `vite.config.js` para incluir um ponto de entrada CSS dedicado para seu cartão:

```js
laravel({
    input: [
        'resources/css/pulse/top-sellers.css',
        // ...
    ],
}),
```

Você pode então usar a diretiva Blade `@vite` em sua [visualização do painel](#dashboard-customization), especificando o ponto de entrada CSS para seu cartão:

```blade
<x-pulse>
    @vite('resources/css/pulse/top-sellers.css')

    ...
</x-pulse>
```

<a name="custom-card-styling-css"></a>
#### Arquivos CSS

Para outros casos de uso, incluindo cartões Pulse contidos em um pacote, você pode instruir o Pulse a carregar folhas de estilo adicionais definindo um método `css` em seu componente Livewire que retorna o caminho do arquivo para seu CSS arquivo:

```php
class TopSellers extends Card
{
    // ...

    protected function css()
    {
        return __DIR__.'/../../dist/top-sellers.css';
    }
}
```

Quando este cartão é incluído no painel, o Pulse inclui automaticamente o conteúdo deste arquivo dentro de uma tag `<style>` para que ele não precise ser publicado no diretório `public`.

<a name="custom-card-styling-tailwind"></a>
#### Tailwind CSS

Ao usar Tailwind CSS, você deve criar um arquivo de configuração Tailwind dedicado para evitar carregar CSS desnecessário ou entrar em conflito com as classes Tailwind do Pulse:

```js
export default {
    darkMode: 'class',
    important: '#top-sellers',
    content: [
        './resources/views/livewire/pulse/top-sellers.blade.php',
    ],
    corePlugins: {
        preflight: false,
    },
};
```

Você pode então especificar o arquivo de configuração no seu ponto de entrada CSS:

```css
@config "../../tailwind.top-sellers.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Você também precisará incluir um atributo `id` ou `class` na visualização do seu cartão que corresponda ao seletor passado para a [estratégia de seletor `important`](https://tailwindcss.com/docs/configuration#selector-strategy) do Tailwind:

```blade
<x-pulse::card id="top-sellers" :cols="$cols" :rows="$rows" class="$class">
    ...
</x-pulse::card>
```

<a name="custom-card-data"></a>
### Captura e agregação de dados

Cartões personalizados podem buscar e exibir dados de qualquer lugar; no entanto, você pode querer aproveitar o poderoso e eficiente sistema de gravação e agregação de dados do Pulse.

<a name="custom-card-data-capture"></a>
#### Capturando entradas

O Pulse permite que você registre "entradas" usando o método `Pulse::record`:

```php
use Laravel\Pulse\Facades\Pulse;

Pulse::record('user_sale', $user->id, $sale->amount)
    ->sum()
    ->count();
```

O primeiro argumento fornecido ao método `record` é o `type` para a entrada que você está gravando, enquanto o segundo argumento é a `key` que determina como os dados agregados devem ser agrupados. Para a maioria dos métodos de agregação, você também precisará especificar um `value` a ser agregado. No exemplo acima, o valor que está sendo agregado é `$sale->amount`. Você pode então invocar um ou mais métodos de agregação (como `sum`) para que o Pulse possa capturar valores pré-agregados em "buckets" para recuperação eficiente mais tarde.

Os métodos de agregação disponíveis são:

* `avg`
* `count`
* `max`
* `min`
* `sum`

::: info NOTA
> Ao construir um pacote de cartão que captura o ID do usuário autenticado no momento, você deve usar o método `Pulse::resolveAuthenticatedUserId()`, que respeita quaisquer [personalizações do resolvedor do usuário](#dashboard-resolving-users) feitas no aplicativo.

<a name="custom-card-data-retrieval"></a>
#### Recuperando dados agregados

Ao estender o componente Livewire `Card` do Pulse, você pode usar o método `aggregate` para recuperar dados agregados para o período que está sendo visualizado no painel:

```php
class TopSellers extends Card
{
    public function render()
    {
        return view('livewire.pulse.top-sellers', [
            'topSellers' => $this->aggregate('user_sale', ['sum', 'count']);
        ]);
    }
}
```

O método `aggregate` retorna uma coleção de objetos PHP `stdClass`. Cada objeto conterá a propriedade `key` capturada anteriormente, juntamente com as chaves para cada um dos agregados solicitados:

```php
@foreach ($topSellers as $seller)
    {{ $seller->key }}
    {{ $seller->sum }}
    {{ $seller->count }}
@endforeach
```

O Pulse recuperará principalmente dados dos buckets pré-agregados; portanto, os agregados especificados devem ter sido capturados antecipadamente usando o método `Pulse::record`. O bucket mais antigo normalmente ficará parcialmente fora do período, então o Pulse agregará as entradas mais antigas para preencher a lacuna e fornecer um valor preciso para todo o período, sem precisar agregar o período inteiro em cada solicitação de pesquisa.

Você também pode recuperar um valor total para um determinado tipo usando o método `aggregateTotal`. Por exemplo, o método a seguir recuperaria o total de todas as vendas do usuário em vez de agrupá-las por usuário.

```php
$total = $this->aggregateTotal('user_sale', 'sum');
```

<a name="custom-card-displaying-users"></a>
#### Exibindo usuários

Ao trabalhar com agregados que registram um ID de usuário como a chave, você pode resolver as chaves para registros de usuário usando o método `Pulse::resolveUsers`:

```php
$aggregates = $this->aggregate('user_sale', ['sum', 'count']);

$users = Pulse::resolveUsers($aggregates->pluck('key'));

return view('livewire.pulse.top-sellers', [
    'sellers' => $aggregates->map(fn ($aggregate) => (object) [
        'user' => $users->find($aggregate->key),
        'sum' => $aggregate->sum,
        'count' => $aggregate->count,
    ])
]);
```

O método `find` retorna um objeto contendo as chaves `name`, `extra` e `avatar`, que você pode opcionalmente passar diretamente para o componente Blade `<x-pulse::user-card>`:

```blade
<x-pulse::user-card :user="{{ $seller->user }}" :stats="{{ $seller->sum }}" />
```

<a name="custom-recorders"></a>
#### Gravadores personalizados

Os autores do pacote podem desejar fornecer classes de gravador para permitir que os usuários configurem a captura de dados.

Os gravadores são registrados na seção `recorders` do arquivo de configuração `config/pulse.php` do aplicativo:

```php
[
    // ...
    'recorders' => [
        Acme\Recorders\Deployments::class => [
            // ...
        ],

        // ...
    ],
]
```

Os gravadores podem ouvir eventos especificando uma propriedade `$listen`. O Pulse registrará automaticamente os ouvintes e chamará o método `record` dos gravadores:

```php
<?php

namespace Acme\Recorders;

use Acme\Events\Deployment;
use Illuminate\Support\Facades\Config;
use Laravel\Pulse\Facades\Pulse;

class Deployments
{
    /**
     * Os eventos a serem ouvidos.
     *
     * @var array<int, class-string>
     */
    public array $listen = [
        Deployment::class,
    ];

    /**
     * Registre a implantação.
     */
    public function record(Deployment $event): void
    {
        $config = Config::get('pulse.recorders.'.static::class);

        Pulse::record(
            // ...
        );
    }
}
```
