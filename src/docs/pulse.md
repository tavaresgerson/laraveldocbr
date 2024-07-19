# Laravel Pulse

<a name="introduction"></a>
## Introdução

 O [Laravel Pulse](https://github.com/laravel/pulse) oferece uma visão geral das informações sobre o desempenho e uso de sua aplicação. Com o Pulse, você pode localizar gargalos como trabalhos lentos e endpoints, encontrar seus usuários mais ativos e muito mais.

 Para depuração detalhada de eventos individuais, consulte [Olá, Laravel! - Telescópio] (/docs/telescope)

<a name="installation"></a>
## Instalação

 > [ADVERTÊNCIA]
 A implementação de armazenamento interno do Pulse requer atualmente um banco de dados MySQL, MariaDB ou PostgreSQL. Se você estiver usando um motor de banco de dados diferente, será necessário um banco de dados separado MySQL, MariaDB ou PostgreSQL para seus dados do Pulse.

 Você pode instalar o Pulse usando o gerenciador de pacotes Composer:

```sh
composer require laravel/pulse
```

 Em seguida, você deve publicar os arquivos de configuração e migração do Pulse usando o comando do artesão `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Pulse\PulseServiceProvider"
```

 Finalmente, você deve executar o comando "migrate" para criar as tabelas necessárias para armazenar os dados do Pulse:

```shell
php artisan migrate
```

 Depois que as migrações do banco de dados do Pulse forem executadas, você poderá acessar o painel do Pulse pela rota `/pulse`.

 > [!ATENÇÃO]
 [ Especifique uma conexão dedicada ao banco de dados (#usando-um-banco-de-dados-diferente)].

<a name="configuration"></a>
### Configuração

 Muitas opções de configuração do Pulse podem ser controladas usando variáveis de ambiente. Para visualizar as opções disponíveis, registrar novos gravadores ou configurar opções avançadas, você poderá publicar o arquivo de configuração `config/pulse.php`:

```sh
php artisan vendor:publish --tag=pulse-config
```

<a name="dashboard"></a>
## Painel de controle

<a name="dashboard-authorization"></a>
### Autorização

 O painel do Pulse pode ser acessado através da rota `/pulse`. Por padrão, você somente poderá acessar este painel no ambiente `local`, então é necessário configurar autorizações para seus ambientes de produção customizando o "viewPulse" gate de autorização. Isso pode ser feito no arquivo `app/Providers/AppServiceProvider.php` da aplicação:

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Bootstrap any application services.
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

 Os gráficos e o layout do painel do Pulse podem ser configurados publicando a visualização de painel. A visualização de painel será publicada em "resources/views/vendor/pulse/dashboard.blade.php":

```sh
php artisan vendor:publish --tag=pulse-dashboard
```

 O painel de controle é alimentado pelo [Livewire](https://livewire.laravel.com/) e permite a personalização dos cartões e do layout sem necessidade de reconstruir nenhum ativo JavaScript.

Within this file, the `<x-pulse>` component is responsible for rendering the dashboard and provides a grid layout for the cards. If you would like the dashboard to span the full width of the screen, you may provide the `full-width` prop to the component:

```blade
<x-pulse full-width>
    ...
</x-pulse>
```

By default, the `<x-pulse>` component will create a 12 column grid, but you may customize this using the `cols` prop:

```blade
<x-pulse cols="16">
    ...
</x-pulse>
```

 Cada cartão aceita um atributo `cols` e `rows` para controlar o espaço e posicionamento:

```blade
<livewire:pulse.usage cols="4" rows="2" />
```

 A maioria dos cards também aceita o prop `expand` para mostrar o card completo em vez de escanear:

```blade
<livewire:pulse.slow-queries expand />
```

<a name="dashboard-resolving-users"></a>
### Usuários resolvidos

 Para cartões que exibem informações sobre seus usuários, como o "Application Usage" (uso de aplicativos), o Pulse somente irá registrar o ID do usuário. Ao renderizar o dashboard, ele resolve os campos `name` e `email` do modelo padrão de autenticação e exibe avatares utilizando o serviço web Gravatar.

 Você pode personalizar os campos e o avatar chamando o método `Pulse::user` na classe `App\Providers\AppServiceProvider` de sua aplicação.

 O método `user` aceita um closure que receberá o modelo `Authenticatable` a ser exibido e deverá retornar uma matriz contendo informações do nome, extra e avatar para o usuário.

```php
use Laravel\Pulse\Facades\Pulse;

/**
 * Bootstrap any application services.
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

 > [!NOTA]
 [ recipiente de serviço](/docs/container#binding-a-singleton).

<a name="dashboard-cards"></a>
### Cartões

<a name="servers-card"></a>
#### Servidores

The `<livewire:pulse.servers />` card displays system resource usage for all servers running the `pulse:check` command. Please refer to the documentation regarding the [servers recorder](#servers-recorder) for more information on system resource reporting.

 Se você substituir um servidor em sua infraestrutura, poderá parar de exibir o servidor inativo no painel Pulse após um determinado período. Você pode fazer isso usando a propriedade `ignore-after`, que aceita o número de segundos após os quais os servidores inativos devem ser removidos do painel Pulse. Alternativamente, você pode fornecer uma string de tempo relativo formatada como "1 hora" ou "3 dias e 1 hora":

```blade
<livewire:pulse.servers ignore-after="3 hours" />
```

<a name="application-usage-card"></a>
#### Utilização da aplicação

The `<livewire:pulse.usage />` card displays the top 10 users making requests to your application, dispatching jobs, and experiencing slow requests.

 Se pretender ver todas as métricas de utilização no ecrã ao mesmo tempo, pode incluir o cartão várias vezes e especificar o atributo `type`:

```blade
<livewire:pulse.usage type="requests" />
<livewire:pulse.usage type="slow_requests" />
<livewire:pulse.usage type="jobs" />
```

 Para saber como personalizar a forma como o Pulse recupera e apresenta informações sobre utilizadores, consulte a nossa documentação em [resolver problemas de utilizadores] (Dashboard_resolving_users).

 > [!NOTA]
 [ amostragem (“#sampling”)]. Ver

<a name="exceptions-card"></a>
#### Exceções

The `<livewire:pulse.exceptions />` card shows the frequency and recency of exceptions occurring in your application. By default, exceptions are grouped based on the exception class and location where it occurred. See the [exceptions recorder](#exceptions-recorder) documentation for more information.

<a name="queues-card"></a>
#### Filas

The `<livewire:pulse.queues />` card shows the throughput of the queues in your application, including the number of jobs queued, processing, processed, released, and failed. See the [queues recorder](#queues-recorder) documentation for more information.

<a name="slow-requests-card"></a>
#### Pedidos lentos

The `<livewire:pulse.slow-requests />` card shows incoming requests to your application that exceed the configured threshold, which is 1,000ms by default. See the [slow requests recorder](#slow-requests-recorder) documentation for more information.

<a name="slow-jobs-card"></a>
#### Empregos Lentos

The `<livewire:pulse.slow-jobs />` card shows the queued jobs in your application that exceed the configured threshold, which is 1,000ms by default. See the [slow jobs recorder](#slow-jobs-recorder) documentation for more information.

<a name="slow-queries-card"></a>
#### Consultas lentas

The `<livewire:pulse.slow-queries />` card shows the database queries in your application that exceed the configured threshold, which is 1,000ms by default.

 Por padrão, as consultas lentas são agrupadas com base na consulta de SQL (sem vinculações) e o local onde ocorreu a consulta, mas pode ser que você opte por não capturar o local se desejar agrupar somente a consulta de SQL.

 Se você encontrar problemas de desempenho na renderização devido a consultas SQL extremamente grandes recebendo destaque de sintaxe, você poderá desativar o destaque adicionando a propriedade `without-highlighting`:

```blade
<livewire:pulse.slow-queries without-highlighting />
```

 Consulte a documentação do [registrador de consultas lentas] (#slow-queries-recorder) para mais informações.

<a name="slow-outgoing-requests-card"></a>
#### Pedidos de saída lentos

The `<livewire:pulse.slow-outgoing-requests />` card shows outgoing requests made using Laravel's [HTTP client](/docs/http-client) that exceed the configured threshold, which is 1,000ms by default.

 Por padrão, as entradas serão agrupadas pela URL completa. No entanto, poderá pretender normalizar ou agrupar solicitações de saída semelhantes utilizando expressões regulares. Consulte a documentação [registro de solicitações de saída lentas] (https://kubernetes.io/docs/reference/access-modes/http/#slow-outgoing-requests-recorder) para mais informações.

<a name="cache-card"></a>
#### Cachecor

The `<livewire:pulse.cache />` card shows the cache hit and miss statistics for your application, both globally and for individual keys.

 Por padrão, as entradas são agrupadas por chave. No entanto, poderá pretender normalizar ou agrupar chaves semelhantes usando expressões regulares. Consulte a documentação sobre [Registador de interações cache] (cache-interactions-recorder) para mais informações.

<a name="capturing-entries"></a>
## Capturar entradas

 A maioria dos gravadores Pulse captura automaticamente registros com base em eventos de estruturas enviados pelo Laravel. No entanto, os [Gravadores do servidor](server-recorder) e alguns cartões de terceiros devem pesquisar informações regularmente. Para usar esses cartões, você deve executar o demonio `pulse:check` em todos os seus servidores individuais da aplicação:

```php
php artisan pulse:check
```

 > [!ATENÇÃO]
 > Para manter o processo `pulse:check` em execução continuamente no fundo do sistema, você deve usar um gerenciador de processos como o Supervisor para garantir que o comando não seja interrompido.

 Como o comando "pulse:check" é um processo de longa duração, ele não verá alterações em sua base de código sem que seja reiniciado. É recomendável reiniciar o comando chamando o comando "pulse:restart" durante o processo de implantação da aplicação:

```sh
php artisan pulse:restart
```

 > [!OBSERVAÇÃO]
 [ Armazenar sinais de reinício em cache], portanto, certifique-se de que o driver de armazenamento temporário está configurado corretamente para sua aplicação antes de utilizar essa funcionalidade.

<a name="recorders"></a>
### Gravadores

 Os gravadores são responsáveis pela captura das entradas do seu aplicativo que serão gravadas no banco de dados Pulse. Esses itens estão registrados e configurados na seção "Gravadores" do arquivo de configuração do Pulse (#Configuração).

<a name="cache-interactions-recorder"></a>
#### Conexão com a cache

 O registro `CacheInteractions` captura informações sobre os acessos e erros no cache de sua aplicação para exibição na seção do [Cache](/docs/cache).

 Podem ser ajustados opcionalmente a taxa de amostragem (#sampling) e padrões de tecla ignorada.

 Você também pode configurar o agrupamento de chaves para que as chaves semelhantes sejam agrupadas como uma única entrada. Por exemplo, você poderá remover IDs exclusivos das chaves que armazenam informações do mesmo tipo. Os grupos são configurados usando um padrão regex para "encontrar e substituir" partes da chave. Um exemplo está incluído no arquivo de configuração:

```php
Recorders\CacheInteractions::class => [
    // ...
    'groups' => [
        // '/:\d+/' => ':*',
    ],
],
```

 O primeiro padrão que corresponda será utilizado. Se nenhum dos padrões corresponder, a chave será capturada como está.

<a name="exceptions-recorder"></a>
#### Exceções

 O gravador de "Exceções" armazena informações sobre exceções que devem ser relatadas no aplicativo para apresentação na folha de rosto "Exceções" (#exceções).

 O usuário pode, facultativamente, ajustar as [taxas de amostragem](#amostrador) e os padrões dos erros ignorados. Além disso, o usuário pode também configurar se captura ou não a localização da qual ocorreu o erro. A localização capturada é exibida na tela do Pulse, o que pode ajudar no rastreamento do erro; contudo, se o mesmo erro ocorrer em vários locais, será apresentado diversas vezes para cada local único.

<a name="queues-recorder"></a>
#### Filas

 O gravador de filas regista informações sobre as suas aplicações em fila para exibição na secção [Filas] (#queues-card).

 Pode ajustar opcionalmente as definições de taxa de amostragem (#amostragem) e padrões de empregos ignorados.

<a name="slow-jobs-recorder"></a>
#### Empregos Lentos

 O registrador `SlowJobs` captura informações sobre funções lentas em sua aplicação, para exibição no cartão [Slow Jobs (Funções Lentas)] (#slow-jobs-recorder).

 Opcionalmente, você pode ajustar o limite de tarefas lentas, [taxa de amostragem](#amostragem) e padrões de tarefas ignorados.

 Algumas tarefas podem demorar mais tempo do que outras e, nesses casos, você poderá configurar limites por tarefa:

```php
Recorders\SlowJobs::class => [
    // ...
    'threshold' => [
        '#^App\\Jobs\\GenerateYearlyReports$#' => 5000,
        'default' => env('PULSE_SLOW_JOBS_THRESHOLD', 1000),
    ],
],
```

 Se nenhum padrão de expressão regular coincidir com o nome da classe do trabalho, será utilizado o valor por padrão.

<a name="slow-outgoing-requests-recorder"></a>
#### Pedidos de saída lentos

 O recurso `SlowOutgoingRequests` captura informações sobre requisições HTTP saídas, feitas com o cliente de HTTP de Laravel, que excedam o limite definido para exibição na carta de [Requisições Saídas Lentas (Slow Outgoing Requests)] ().

 É possível ajustar opcionalmente o limite mínimo de solicitações saídas lentas, taxa de amostragem e padrões de URL ignorados.

 Você pode ter alguns pedidos em execução com previsão de demora maior do que outros. Nesses casos, você pode configurar limiares por solicitação:

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'threshold' => [
        '#backup.zip$#' => 5000,
        'default' => env('PULSE_SLOW_OUTGOING_REQUESTS_THRESHOLD', 1000),
    ],
],
```

 Se nenhum padrão de expressão regular combinar com a URL da solicitação, será utilizado o valor "padrão".

 Também é possível configurar o agrupamento de URLs para que URLs semelhantes sejam agrupadas como uma única entrada. Por exemplo, você pode querer remover IDs exclusivos em caminhos de URL ou agrupar por domínio apenas. Os grupos são configurados usando uma expressão regular para "encontrar e substituir" partes da URL. Alguns exemplos estão incluídos no arquivo de configuração:

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

 O primeiro padrão que coincidir será usado. Se nenhum padrão coincidir, a URL será capturada tal como está.

<a name="slow-queries-recorder"></a>
#### Consultas lentas

 O recurso de registro das consultas lentas grava quaisquer consultas ao banco de dados na aplicação que excedam o limite definido para apresentar no cartão [Consultas Lentas](#slow-queries-card).

 Opcionalmente, pode ajustar os limites de consulta lenta [t taxa de amostragem (#sampling)], os padrões de consulta ignorados e definir se devem ser capturadas as localizações das consultas. A localização capturada é mostrada no painel Pulse, o que permite rastrear a origem da consulta. Se, no entanto, a mesma consulta for efetuada em vários locais, será exibida várias vezes para cada localização única.

 Talvez você tenha algumas consultas que sejam mais demoradas que outras. Nesses casos, você pode configurar limites por consulta:

```php
Recorders\SlowQueries::class => [
    // ...
    'threshold' => [
        '#^insert into `yearly_reports`#' => 5000,
        'default' => env('PULSE_SLOW_QUERIES_THRESHOLD', 1000),
    ],
],
```

 Se nenhum padrão de expressão regular coincidir com a consulta SQL, será utilizado o valor `'default'`.

<a name="slow-requests-recorder"></a>
#### Pedidos lentos

 O gravador de "Solicitações" captura informações sobre as solicitações feitas à sua aplicação, para exibição nas cartas [Solicitações Lentas (#slow-requests-card)] e [Uso da Aplicação (#application-usage-card)].

 Você poderá opcionalmente ajustar o limite de rotas lentas, taxa de amostragem e caminhos ignorados.

 Você poderá ter algumas solicitações que você espera serem mais demoradas do que outras. Nesses casos, é possível configurar limites por solicitação:

```php
Recorders\SlowRequests::class => [
    // ...
    'threshold' => [
        '#^/admin/#' => 5000,
        'default' => env('PULSE_SLOW_REQUESTS_THRESHOLD', 1000),
    ],
],
```

 Se nenhum padrão de expressão regular correspondente à URL da solicitação, o valor do atributo é definido como `'default'` (padrão).

<a name="servers-recorder"></a>
#### Servidores

 O gravador "Servidores" captura o uso de CPU, memória e armazenamento dos servidores que alimentam a sua aplicação para ser exibido no cartão [Servidores] (#servers-card). Esse gravador requer que o comando ["pulse:check"](#capturing-entries) esteja sendo executado em cada um dos servidores que você deseja monitorar.

 Cada servidor de notificação deve ter um nome exclusivo. Por padrão, o Pulse irá utilizar o valor retornado pela função PHP `gethostname`. Se você deseja personalizar isso, pode definir a variável ambiental `PULSE_SERVER_NAME`:

```
PULSE_SERVER_NAME=load-balancer
```

 O arquivo de configuração do Pulse também permite que você personalize os diretórios que serão monitorados.

<a name="user-jobs-recorder"></a>
#### Funções do utilizador

 O gravador de "Usuários" captura informações sobre os usuários que enviam tarefas na sua aplicação para exibição no cartão ["Utilização da Aplicação"] (#utilização-da-aplicação-card).

 É possível ajustar opcionalmente a taxa de amostragem (#amostrando) e padrões de tarefa ignorados.

<a name="user-requests-recorder"></a>
#### Pedidos de Utilizador

 O gravador de "Solicitações do Usuário" captura informações sobre os usuários que enviam solicitações para o seu aplicativo para exibição no cartão [Utilização da Aplicação](#application-usage-card).

 É possível, opcionalmente, ajustar a taxa de amostragem e padrões de trabalho ignorados.

<a name="filtering"></a>
### Filtragem

 Conforme vimos, muitos [registradores](#recorders) permitem ignorar registros de entrada com base em seus valores através da configuração. Por exemplo, um URL do pedido. No entanto, é possível filtrar os registros com base em outros fatores. Por exemplo, o usuário autenticado atualmente. Para filtrar esses registros, você pode passar um fecho para a metodologia `filter` do Pulse. Normalmente, você deverá invocar a metodologia `filter` no método `boot` do `AppServiceProvider` do seu aplicativo:

```php
use Illuminate\Support\Facades\Auth;
use Laravel\Pulse\Entry;
use Laravel\Pulse\Facades\Pulse;
use Laravel\Pulse\Value;

/**
 * Bootstrap any application services.
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

 O Pulse foi concebido para integrar numa aplicação existente sem que seja necessária nenhuma infraestrutura adicional. No entanto, para aplicações de tráfego elevado, existem várias formas de impedir que o Pulse afete o desempenho da sua aplicação.

<a name="using-a-different-database"></a>
### Usando um banco de dados diferente

 Para aplicações de alto tráfego, pode ser mais vantajoso utilizar uma ligação de base de dados dedicada para o Pulse, de modo a evitar impactos na base de dados da aplicação.

 Você pode personalizar a conexão de banco de dados [usada pelo Pulse](/docs/database#configuration) definindo a variável de ambiente `PULSE_DB_CONNECTION`.

```
PULSE_DB_CONNECTION=pulse
```

<a name="ingest"></a>
### Redis Ingresso

 > [!AVISO]
 > O Redis Ingest requer o Redis 6.2 ou superior e um `phpredis` ou `predis` como motor de cliente do Redis configurado na aplicação.

 Por padrão, o Pulse armazena entradas diretamente na [conexão de banco de dados configurada](#usando-um-banco-de-dados-diferente) após a resposta HTTP ter sido enviada ao cliente ou uma tarefa ser processada. No entanto, você pode usar o driver de ingestão do Pulse para enviar entradas para um fluxo Redis em vez disso. Isso pode ser ativado configurando a variável de ambiente `PULSE_INGEST_DRIVER`:

```
PULSE_INGEST_DRIVER=redis
```

 O Pulse usará sua conexão padrão pelo [conector Redis](https://www.pulselms.com/docs/redis#configuration) por padrão, mas você poderá personalizar isso através da variável de ambiente `PULSE_REDIS_CONNECTION`:

```
PULSE_REDIS_CONNECTION=pulse
```

 Ao usar a incorporação do Redis, você precisará executar o comando `pulse:work` para monitorar o fluxo e mover as entradas da tabela de banco de dados do Redis para a base de dados do Pulse.

```php
php artisan pulse:work
```

 > [!AVISO]
 > Para que o processo `pulse:work` funcione permanentemente em segundo plano, você deve usar um monitor de processos como o Supervisor para garantir que o trabalhador do Pulse não seja interrompido.

 Como o comando `pulse:work` é um processo de longa duração, ele não será atualizado sem que seja reiniciado. É necessário reiniciar o comando durante o processo de implantação do aplicativo chamando o comando `pulse:restart`:

```sh
php artisan pulse:restart
```

 > [!OBSERVAÇÃO]
 [Cache] (/docs/cache), para armazenar sinais de reinicialização, portanto deve verificar se um driver de cache está configurado adequadamente para sua aplicação antes de utilizar este recurso.

<a name="sampling"></a>
### Amostragem

 Por padrão, o Pulse captura todos os eventos relevantes que ocorrem em seu aplicativo. Para aplicações de grande volume de tráfego, isso pode resultar na necessidade de agregar milhões de linhas do banco de dados no painel, especialmente para períodos de tempo maiores.

 Você pode optar por permitir "amostragem" em determinados gravadores de dados do Pulse. Por exemplo, definindo a taxa de amostragem como `0.1` no gravador de solicitações [`User Requests`](#user-requests-recorder), isso significará que você registra apenas aproximadamente 10% das solicitações ao seu aplicativo. No painel, os valores são aumentados e precedidos de um `~` para indicar que se tratam de uma aproximação.

 Em geral, quanto maior o número de valores para uma determinada métrica, menor pode ser a frequência de amostragem sem perda excessiva da exatidão.

<a name="trimming"></a>
### Recortar

 O Pulse irá, automaticamente, cortar as entradas armazenadas quando estas forem removidas da janela do painel. Este corte ocorre durante a introdução de dados utilizando um sistema lotérico que pode ser personalizado no Pulse (#configuração).

<a name="pulse-exceptions"></a>
### Gerenciando exceções de pulso

 Se ocorrer uma exceção ao capturar dados do Pulse, por exemplo, não ser possível se conectar à base de dados de armazenamento, o Pulse falhará silenciosamente para evitar impacto na aplicação.

 Se pretender personalizar a forma como essas exceções são tratadas, pode fornecer uma função de fecho para o método `handleExceptionsUsing`:

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

 O Pulse permite a construção de cartões personalizados para exibição de dados relevantes às necessidades específicas do seu aplicativo. O Pulse usa [Livewire](https://livewire.laravel.com/), por isso, você pode querer [verificar sua documentação](https://livewire.laravel.com/docs) antes da construção do primeiro cartão personalizado.

<a name="custom-card-components"></a>
### Componentes do cartão

 Para criar um cartão personalizado no Laravel Pulse, é necessário estender o componente de visualização `Card` e definir uma correspondente vista:

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

 Ao usar o recurso de [carregamento laxo](https://livewire.laravel.com/docs/lazy) do Livewire, o componente "Cartão" fornecerá automaticamente um marcador que respeitará os atributos `cols` e `rows` passados ao seu componente.

 Para escrever a visualização correspondente ao cartão de Pulse, você pode utilizar os componentes do Pulse Blade para uma aparência e comportamento consistentes:

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

 As variáveis `$cols`, `$rows`, `$class` e `$expand` devem ser passadas para seus respectivos componentes Blade, de forma que o layout do cartão possa ser personalizado a partir da tela de administração. Você também pode incluir o atributo `wire:poll.5s=""` na sua visualização para fazer com que o cartão seja automaticamente atualizado.

 Depois de ter definido a sua componente e modelo do Livewire, o cartão pode ser incluído na sua [visão da área de trabalho] (#personalização-da-área-de-trabalho):

```blade
<x-pulse>
    ...

    <livewire:pulse.top-sellers cols="4" />
</x-pulse>
```

 > [!ATENÇÃO]
 > Se o seu componente estiver incluído em um pacote, você precisará registrar o componente com o Livewire usando o método `Livewire::component`.

<a name="custom-card-styling"></a>
### Estilização

 Se o seu cartão exigir um estilo adicional que vai além das classes e componentes incluídos no Pulse, há duas opções para incluir o código CSS personalizado em seus cartões.

<a name="custom-card-styling-vite"></a>
#### Integração com o Laravel Vite

 Se o seu cartão personalizado estiver no código da sua aplicação e você estiver usando a integração [Vite do Laravel](/docs/vite), poderá atualizar seu arquivo `vite.config.js` para incluir um ponto inicial de CSS exclusivo para o seu cartão:

```js
laravel({
    input: [
        'resources/css/pulse/top-sellers.css',
        // ...
    ],
}),
```

 Você poderá então utilizar a diretiva do Blade `@vite`, na sua [visualização de painel (Dashboard) (#Personalizar o Painel)](@vite), especificando o ponto de entrada do CSS para seu cartão:

```blade
<x-pulse>
    @vite('resources/css/pulse/top-sellers.css')

    ...
</x-pulse>
```

<a name="custom-card-styling-css"></a>
#### Arquivos CSS

 Para outros casos de uso, incluindo cartões do Pulse incluídos em um pacote, você pode instruir o Pulse a carregar folhas de estilos adicionais definindo um método `css` em seu componente Livewire que retorne o caminho completo ao arquivo do CSS:

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

When this card is included on the dashboard, Pulse will automatically include the contents of this file within a `<style>` tag so it does not need to be published to the `public` directory.

<a name="custom-card-styling-tailwind"></a>
#### O Tailwind CSS

 Ao usar o Tailwind CSS, você deve criar um arquivo de configuração dedicado para evitar carregar CSS desnecessário ou entrar em conflito com as classes do Pulse Tailwind:

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

 Você pode então especificar o arquivo de configuração no ponto de entrada do seu CSS:

```css
@config "../../tailwind.top-sellers.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

 Você também precisará incluir um atributo `id` ou `class` na visualização de seu cartão que corresponda ao selecionador passado à estratégia do selecionador [`important`](https://tailwindcss.com/docs/configuration#selector-strategy):

```blade
<x-pulse::card id="top-sellers" :cols="$cols" :rows="$rows" class="$class">
    ...
</x-pulse::card>
```

<a name="custom-card-data"></a>
### Captação e agregação de dados

 Os cartões personalizados podem obter e exibir dados de qualquer parte; no entanto, você poderá desejar aproveitar o poderoso e eficiente sistema de gravação e agregação de dados do Pulse.

<a name="custom-card-data-capture"></a>
#### Capturando Entradas

 O Pulse permite gravar "entrada", usando o método `Pulse::record`:

```php
use Laravel\Pulse\Facades\Pulse;

Pulse::record('user_sale', $user->id, $sale->amount)
    ->sum()
    ->count();
```

 O primeiro argumento passado ao método `record` é o `tipo` para a entrada que você está registrando, enquanto o segundo argumento é a `chave` que determina como os dados agregados devem ser agrupados. Para a maioria dos métodos de agregação, você também precisará especificar um valor agregado. No exemplo acima, o valor sendo agregado é `$sale->amount`. Em seguida, pode invocar um ou mais métodos de agregação (como `sum`) para que a Pulse possa capturar valores pré-agregados em "conjuntos" para recuperação eficiente posteriormente.

 Os métodos de agregação disponíveis são:

 * `mediana`
 * `contagem`
 * `max`
 * ``min``
 * ``sum``

 > [!ATENÇÃO]
 [ Personalizações do usuário resolver (#Dashboard resolvendo usuários) feitas na aplicação.

<a name="custom-card-data-retrieval"></a>
#### Recuperação de dados agregados

 Ao estender o componente do Pulse, "Cartão", ao vivo, você pode usar o método `agregar` para recuperar dados agregados para o período que está sendo visualizado no painel de controle:

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

 O método `aggregate` retorna uma coleção de objetos `stdClass` do PHP. Cada objeto conterá a propriedade `key`, capturada anteriormente, juntamente com as chaves para cada agregado solicitado:

```php
@foreach ($topSellers as $seller)
    {{ $seller->key }}
    {{ $seller->sum }}
    {{ $seller->count }}
@endforeach
```

 O Pulse irá primariamente recuperar dados dos buckets pre-agregados; portanto, os agregados especificados devem ter sido capturados antecipadamente utilizando o método `Pulse::record`. O bucket mais antigo normalmente cairá parcialmente fora do período, então Pulse irá agregar as entradas mais antigas para preencher a lacuna e dar um valor exato para todo o período, sem a necessidade de agrupar todo o período em cada solicitação de pesquisa.

 Também é possível obter o valor total de um tipo específico usando a metodologia `agregarTotais`. Por exemplo, o código a seguir permitiria que recuperasse as vendas totais feitas por todos os usuários, em vez de agrupar essas informações por usuário.

```php
$total = $this->aggregateTotal('user_sale', 'sum');
```

<a name="custom-card-displaying-users"></a>
#### Exibindo Usuários

 Ao trabalhar com agregados que registram um ID do usuário como chave, você pode resolver as chaves para os registros de usuários usando o método `Pulse::resolveUsers`:

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

The `find` method returns an object containing `name`, `extra`, and `avatar` keys, which you may optionally pass directly to the `<x-pulse::user-card>` Blade component:

```blade
<x-pulse::user-card :user="{{ $seller->user }}" :stats="{{ $seller->sum }}" />
```

<a name="custom-recorders"></a>
#### Gravadores personalizados

 Os autores de pacotes podem desejar fornecer classes de gravador para permitir que os usuários configurem a captura de dados.

 Os gravadores são registrados na seção "gravadores" do arquivo de configuração `config/pulse.php`:

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

 Os gravadores podem ouvir eventos através da especificação de uma propriedade `$listen`. O Pulse regista automaticamente os ouvintes e chama a função de gravação do recurso:

```php
<?php

namespace Acme\Recorders;

use Acme\Events\Deployment;
use Illuminate\Support\Facades\Config;
use Laravel\Pulse\Facades\Pulse;

class Deployments
{
    /**
     * The events to listen for.
     *
     * @var array<int, class-string>
     */
    public array $listen = [
        Deployment::class,
    ];

    /**
     * Record the deployment.
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
