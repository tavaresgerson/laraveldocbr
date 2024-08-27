# Laravel Pulse

<a name="introduction"></a>
## Introdução

O Laravel Pulse (https://github.com/laravel/pulse) fornece um resumo rápido sobre o desempenho e uso de seu aplicativo. Com Pulse, você pode rastrear gargalos como trabalhos lentos e pontos finais, encontrar os usuários mais ativos e muito mais.

Para depuração profunda de eventos individuais, confira o [Laravel Telescope]( /docs/telescope )

<a name="installation"></a>
## Instalação

> [ALERTA]
> A implementação de armazenamento de primeira parte do Pulse requer atualmente um banco de dados MySQL, MariaDB ou PostgreSQL. Se você estiver usando uma motor de banco de dados diferente, você precisará usar um banco separado de dados MySQL, MariaDB ou PostgreSQL para seus dados do Pulse.

Você pode instalar o Pulse usando o gerenciador de pacotes composer:

```sh
composer require laravel/pulse
```

Em seguida, você deve publicar os arquivos de configuração e migração do Pulse usando o comando Artisan "vendor:publish":

```shell
php artisan vendor:publish --provider="Laravel\Pulse\PulseServiceProvider"
```

Finalmente, você deve executar o comando 'migrate' para criar as tabelas necessárias para armazenar os dados do Pulse:

```shell
php artisan migrate
```

Uma vez que as migrações de banco de dados Pulse estão em execução, você pode acessar a Pulse Dashboard através da rota `/pulse`.

> Nota:
> Se não quiser armazenar dados de Pulse no banco de dados principal da sua aplicação, você pode [especificar uma conexão com um banco de dados dedicado](#usando-um-banco-de-dados-diferente).

<a name="configuration"></a>
### Configuração

Muitas das opções de configuração do Pulso podem ser controladas usando variáveis de ambiente. Para ver as opções disponíveis, registrar novos gravadores ou configurar opções avançadas, você pode publicar o arquivo "config/pulse.php" de configuração:

```sh
php artisan vendor:publish --tag=pulse-config
```

<a name="dashboard"></a>
## Painel de controle

<a name="dashboard-authorization"></a>
### Autorização

O painel Pulse pode ser acessado via rota `/pulse`. Por padrão, você poderá acessar este painel somente no ambiente `local`, portanto você precisará configurar a autorização para seus ambientes de produção, personalizando o portão de autorização `'viewPulse'`. Você pode realizar isso dentro do arquivo da sua aplicação `app/Providers/AppServiceProvider.php`:

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

O painel dePulse pode ser configurado editando-se os cartões e o layout do painel. A visualização do painel será publicada no arquivo 'resources/views/vendor/pulse/dashboard.blade.php'.

```sh
php artisan vendor:publish --tag=pulse-dashboard
```

O painel é alimentado por [Livewire](https://livewire.laravel.com/), e permite personalizar os cartões e o layout sem precisar recriar nenhum ativo do JavaScript.

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

Cada cartão aceita os atributos "cols" e "rows" para controlar o espaçamento e posicionamento:

```blade
<livewire:pulse.usage cols="4" rows="2" />
```

A maioria das cartas também aceita um "prop expand" para mostrar a carta completa em vez de rolagem:

```blade
<livewire:pulse.slow-queries expand />
```

<a name="dashboard-resolving-users"></a>
### Resolvendo Usuários

Para cartões que exibem informações sobre seus usuários, como o Application Usage card, o Pulse irá registrar apenas a ID do usuário. Ao renderizar o painel, ele resolverá os campos 'name' e 'email' de seu modelo padrão 'Authenticatable', e exibirá os avatares usando o serviço web Gravatar.

Você pode personalizar os campos e avatar invocando o método `Pulse::user` dentro de sua classe `App\Providers\AppServiceProvider`.

O método 'user' aceita uma função que receberá o modelo 'Authenticatable' para ser exibido e deverá retornar um array contendo as informações 'name', 'extra' e 'avatar' do usuário:

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

> ¡NOTA!
> Você pode personalizar completamente como o usuário autenticado é capturado e recuperado ao implementar o contrato 'Laravel\Pulse\Contracts\ResolvesUsers' e vinculá-lo no contêiner de serviço do Laravel [service container](/docs/container#binding-a-singleton).

<a name="dashboard-cards"></a>
### Cartões

<a name="servers-card"></a>
#### Servidores

The `<livewire:pulse.servers />` card displays system resource usage for all servers running the `pulse:check` command. Please refer to the documentation regarding the [servers recorder](#servers-recorder) for more information on system resource reporting.

Em caso de substituição do servidor na infraestrutura, você pode não desejar que o servidor inativo continue sendo exibido no painel de controle do Pulse após um determinado período. Você pode alcançar isso usando a propriedade 'ignore-after', que aceita um número de segundos após o qual os servidores inativos devem ser removidos do painel de controle do Pulse. Alternativamente, você pode fornecer uma string formatada de tempo relativo, como "1 hora" ou "3 dias e 1 hora":

```blade
<livewire:pulse.servers ignore-after="3 hours" />
```

<a name="application-usage-card"></a>
#### Utilização da aplicação

The `<livewire:pulse.usage />` card displays the top 10 users making requests to your application, dispatching jobs, and experiencing slow requests.

Se você deseja visualizar todas as métricas de uso na tela ao mesmo tempo, você pode incluir a carta várias vezes e especificar o atributo 'tipo':

```blade
<livewire:pulse.usage type="requests" />
<livewire:pulse.usage type="slow_requests" />
<livewire:pulse.usage type="jobs" />
```

Para saber como personalizar a forma de recuperação e exibição das informações do usuário pelo Pulse, consulte nossa documentação sobre [resolução de problemas de usuários](#dashboard-resolving-users).

> Nota!
> Se a sua aplicação recebe muitas requisições ou realiza muitos trabalhos, você pode querer habilitar [amostragem](#amostragem). Ver mais informações sobre o [registrador de requisições do usuário](#registrador-de-requisicoes-do-usuario), [registrador de trabalhos do usuário](#registrador-de-trabalhos-do-usuario) e [registrador de trabalhos lentos](#registrador-de-trabalho-lentos).

<a name="exceptions-card"></a>
#### Exceções

The `<livewire:pulse.exceptions />` card shows the frequency and recency of exceptions occurring in your application. By default, exceptions are grouped based on the exception class and location where it occurred. See the [exceptions recorder](#exceptions-recorder) documentation for more information.

<a name="queues-card"></a>
#### Filas

The `<livewire:pulse.queues />` card shows the throughput of the queues in your application, including the number of jobs queued, processing, processed, released, and failed. See the [queues recorder](#queues-recorder) documentation for more information.

<a name="slow-requests-card"></a>
#### Pedir devagar

The `<livewire:pulse.slow-requests />` card shows incoming requests to your application that exceed the configured threshold, which is 1,000ms by default. See the [slow requests recorder](#slow-requests-recorder) documentation for more information.

<a name="slow-jobs-card"></a>
#### Empregos lentos

The `<livewire:pulse.slow-jobs />` card shows the queued jobs in your application that exceed the configured threshold, which is 1,000ms by default. See the [slow jobs recorder](#slow-jobs-recorder) documentation for more information.

<a name="slow-queries-card"></a>
#### Consultas Lentas

The `<livewire:pulse.slow-queries />` card shows the database queries in your application that exceed the configured threshold, which is 1,000ms by default.

Por padrão, consultas lentas são agrupadas com base na consulta SQL (sem vinculação) e o local onde ocorreu, mas você pode optar por não capturar a localização se quiser agrupá-las apenas pela consulta SQL.

Se você encontrar problemas de desempenho do renderização devido a consultas SQL extremamente grandes recebendo realce de sintaxe, você pode desativar o realce adicionando o `sem-realce`:

```blade
<livewire:pulse.slow-queries without-highlighting />
```

Veja a documentação do [registrador de consultas lentas](#slow-queries-recorder) para mais informações.

<a name="slow-outgoing-requests-card"></a>
#### Pedidos lentos

The `<livewire:pulse.slow-outgoing-requests />` card shows outgoing requests made using Laravel's [HTTP client](/docs/http-client) that exceed the configured threshold, which is 1,000ms by default.

Por padrão, as entradas serão agrupadas pela URL completa. No entanto, você pode querer normalizar ou agrupar solicitações semelhantes de saída usando expressões regulares. Consulte a documentação do [registrador de solicitações lentas](#slow-outgoing-requests-recorder) para mais informações.

<a name="cache-card"></a>
#### Cache

The `<livewire:pulse.cache />` card shows the cache hit and miss statistics for your application, both globally and for individual keys.

Por padrão as entradas serão agrupadas por chave. No entanto, você pode querer normalizar ou agrupar chaves semelhantes usando expressões regulares. Consulte a documentação de [cache interactions recorder](#cache-interactions-recorder) para mais informações.

<a name="capturing-entries"></a>
## Captura de Entradas

A maioria dos gravadores de pulso irá capturar automaticamente entradas com base em eventos estruturais enviados pelo Laravel. No entanto, o [gravador do servidor](#servers-recorder) e algumas cartas de terceiros devem verificar regularmente as informações. Para usar estas cartas, você deve executar o `pulse:check` daemon em todos os seus servidores de aplicativos individuais:

```php
php artisan pulse:check
```

> [NOTA]
> Para manter o processo "pulse:check" em execução permanente em segundo plano, você deve utilizar um monitor de processos como Supervisor para garantir que o comando não pare de executar.

Como o comando 'pulse:check' é um processo de longa duração, ele não verá as mudanças no seu código sem ser reiniciado. Você deve reiniciar suavemente o comando chamando o comando 'pulse:restart' durante o processo de implantação do seu aplicativo:

```sh
php artisan pulse:restart
```

> [NOTA]
> O Pulse usa o [cache] para armazenar sinais de reinicialização, por isso você deve verificar se um controlador de cache está configurado corretamente para sua aplicação antes de usar esse recurso.

<a name="recorders"></a>
### Registros

Os gravadores são responsáveis por capturar entradas do seu aplicativo a serem gravadas no banco de dados de Pulso. Os gravadores estão registrados e configurados na seção "gravadores" do [arquivo de configuração de Pulso](#configuration).

<a name="cache-interactions-recorder"></a>
#### Interações de Cache

O gravador `CacheInteractions` captura informações sobre os acertos e erros de cache em seu aplicativo para exibição na [card](#card) Cache.

Você pode ajustar opcional a [taxa de amostragem](#amostragem) e os padrões ignorados de chave.

Você também pode agrupar teclas para que as teclas semelhantes sejam agrupadas como uma entrada única. Por exemplo, você pode querer remover IDs exclusivos de chaves armazenando o mesmo tipo de informações. Grupos são configurados usando uma expressão regular para "procurar e substituir" partes da chave. Um exemplo está incluído no arquivo de configuração:

```php
Recorders\CacheInteractions::class => [
    // ...
    'groups' => [
        // '/:\d+/' => ':*',
    ],
],
```

O primeiro que se encaixa será usado. Se não houver nenhum que se encaixe o método será capturado como está.

<a name="exceptions-recorder"></a>
#### Exceções

O gravador de exceções captura informações sobre exceções que ocorrem no seu aplicativo para exibição na [exceções] (card).

Você pode ajustar opcionalmente a [taxa de amostragem](#amostragem) e os padrões de exceções ignoradas. Você também pode configurar se deseja capturar o local de onde a exceção foi gerada. A localização capturada será exibida no painel do Pulse, que poderá ajudar na localização da origem das exceções; contudo, caso a mesma exceção ocorra em vários locais, ela aparecerá várias vezes para cada local único.

<a name="queues-recorder"></a>
#### Filas

O gravador 'Filas' capta informações sobre suas filas de aplicativos para exibição na [Filas](#queues-card).

Você pode ajustar o [taxa de amostra](#amostragem) e ignorar os padrões de trabalho opcional.

<a name="slow-jobs-recorder"></a>
#### Empregos de baixa produtividade

O " SlowJobs" registra informações sobre trabalhos lentos que ocorrem em seu aplicativo para exibição na [card] SlowJobs.[/code]

Você pode ajustar opacionalmente a porta de entrada lenta, [taxa de amostra](#amostragem), e padrões de trabalho ignorados.

Você pode ter alguns trabalhos que você espera que demorem mais do que outros. Em tais casos, você pode configurar limites por trabalho:

```php
Recorders\SlowJobs::class => [
    // ...
    'threshold' => [
        '#^App\\Jobs\\GenerateYearlyReports$#' => 5000,
        'default' => env('PULSE_SLOW_JOBS_THRESHOLD', 1000),
    ],
],
```

Se nenhum padrão de expressão regular corresponde ao nome da classe do trabalho, então o valor "padrão" será usado.

<a name="slow-outgoing-requests-recorder"></a>
#### Pedidos lentos

O gravador 'SlowOutgoingRequests' captura informações sobre requisições HTTP que excedem o limite configurado para exibição na [requisição lenta de saída](# slow-outgoing-requests-card).

Você pode ajustar opcional o limite de solicitação lenta de saída, [taxa de amostra](#amostragem) e padrões ignorados da URL.

Você pode ter alguns pedidos de saída que espera levar mais tempo do que outros. Nestes casos você pode configurar limiares por pedido:

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'threshold' => [
        '#backup.zip$#' => 5000,
        'default' => env('PULSE_SLOW_OUTGOING_REQUESTS_THRESHOLD', 1000),
    ],
],
```

Se não houver nenhum padrão de expressão regular correspondendo à URL da solicitação, então o valor "padrão" será usado.

Você também pode configurar agrupamento de URLs para agrupar URLs semelhantes como uma entrada única. Por exemplo, você pode querer remover IDs exclusivos de URLs de caminho ou agrupar apenas por domínio. Grupos são configurados usando expressões regulares para "encontrar e substituir" partes do URL. Alguns exemplos estão incluídos no arquivo de configuração:

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

O primeiro padrão que combina será usado. Se não houver padrões correspondentes, o URL será capturado como está.

<a name="slow-queries-recorder"></a>
#### Consultas lentas

O registrador `SlowQueries` captura qualquer consulta de banco de dados em sua aplicação que exceda o limite configurado para exibição na [páginas] ( Slow Queries ) .

Você pode ajustar de forma opcional o limite de consulta lenta, [taxa de amostra](#samplage), e os padrões de consulta ignorados. Você também pode configurar se deseja capturar a localização da consulta. A localização capturada será exibida no painel Pulse que pode ajudar a rastrear a origem da consulta; no entanto, se a mesma consulta é feita em vários locais, ela aparecerá várias vezes para cada local exclusivo.

Você pode ter algumas consultas que espera que demorem mais do que outras. Em tais casos, você pode configurar os limites de consulta por consulta.

```php
Recorders\SlowQueries::class => [
    // ...
    'threshold' => [
        '#^insert into `yearly_reports`#' => 5000,
        'default' => env('PULSE_SLOW_QUERIES_THRESHOLD', 1000),
    ],
],
```

Se nenhum dos padrões de expressão regular corresponder à consulta SQL, o 'valor padrão' será usado.

<a name="slow-requests-recorder"></a>
#### Pedidos Lentos

O gravador de `Requests` captura informações sobre os pedidos feitos para a sua aplicação, que serão exibidos nos cartões [Slow Requests](#slow-requests-card) e [Application Usage](#application-usage-card).

Você pode ajustar opcional a limite de rota lenta, [taxa de amostragem](#amostragem) e ignorados caminhos.

Você pode configurar os seus limites de solicitação por solicitação para as que você espera durarem mais do que outros casos.

```php
Recorders\SlowRequests::class => [
    // ...
    'threshold' => [
        '#^/admin/#' => 5000,
        'default' => env('PULSE_SLOW_REQUESTS_THRESHOLD', 1000),
    ],
],
```

Se nenhum padrão de expressão regular corresponder à URL da solicitação, então o valor 'padrão' será utilizado.

<a name="servers-recorder"></a>
#### Servidores

O gravador "Servidores" captura a utilização da CPU, memória e armazenamento dos servidores que alimentam seu aplicativo para exibição na [tela do servidor] (card). Este gravador requer o comando  [pulser:check] #captura de entradas estar em execução em cada um dos servidores que você deseja monitorar.

Cada servidor de relatório deve ter um nome único. Por padrão o Pulse usará o valor retornado pela função 'gethostname' do PHP. Se quiser personalizar isso você pode definir a variável de ambiente 'PULSE_SERVER_NAME':

```env
PULSE_SERVER_NAME=load-balancer
```

O arquivo de configuração do Pulse permite que você personalize as diretrizes monitoradas.

<a name="user-jobs-recorder"></a>
#### User Jobs

O gravador "UserJobs" captura informações sobre os usuários que estão despachando trabalhos em seu aplicativo para exibição na [Utilização do Aplicativo](#application-usage-card).

Você pode ajustar, opcional, a [taxa de amostragem](#amostragem) e os padrões de trabalho ignorados.

<a name="user-requests-recorder"></a>
#### Requisitos do usuário

O gravador `UserRequests` captura informações sobre os usuários que estão fazendo solicitações para o seu aplicativo para exibição na [Utilização da Aplicação](#application-usage-card).

Você pode ajustar opcionalmente a [taxa de amostra](#amostragem) e os padrões de trabalho ignorados.

<a name="filtering"></a>
### Filtragem

Como vimos, muitos [registradores](#recorders) oferecem a capacidade de, via configuração, "ignorar" entradas que chegam com base em seu valor, como uma URL da solicitação. Mas, às vezes, pode ser útil filtrar registros com base em outros fatores, tais como o usuário atualmente autenticado. Para filtrar esses registros, você pode passar uma função fechada para o método `filter` do Pulse:

```php
// No AppServiceProvider da sua aplicação...

public function boot()
{
    $this->app->bootservices->push(new ServiceProvider());

    Pulse::filter(function ($request) {
        // ... adicione aqui a lógica de filtragem com base no usuário autenticado ...

        return true; // Retorne verdadeiro se quiser manter o registro, falso para ignorar.
    });
}
```

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

Pulse foi projetado para ser facilmente integrado em uma aplicação existente sem exigir nenhuma infraestrutura adicional. Contudo, para aplicações de alto tráfego há várias maneiras de remover o impacto que Pulse pode ter na performance da aplicação.

<a name="using-a-different-database"></a>
### Usando um Banco de Dados Diferente

Para aplicações de alto tráfego, você pode preferir usar uma conexão de banco de dados dedicada para o Pulse, evitando assim que o seu banco de dados de aplicação seja afetado.

Você pode personalizar a [conexão de banco de dados](/docs/database#configuration) usado pelo Pulse, definindo a variável de ambiente PULSE_DB_CONNECTION.

```env
PULSE_DB_CONNECTION=pulse
```

<a name="ingest"></a>
### Ingest Redis

> [¡ALERTA!]
> A ingestão de Redis requer o Redis 6.2 ou superior e "phpredis" ou "predis" como o driver do cliente Redis configurado para a aplicação.

Por padrão, o Pulse vai armazenar os registros diretamente na [conexão de banco configurada](#usando-um-banco-diferente) depois da resposta HTTP ter sido enviada ao cliente ou um trabalho processado; porém, você pode usar o driver Redis do Pulse para enviar registros para uma stream Redis. Isso pode ser habilitado configurando a variável ambiente `PULSE_INGEST_DRIVER`:

```
PULSE_INGEST_DRIVER=redis
```

Pulse irá usar sua conexão padrão [Redis] por padrão, mas você pode personalizar isso através do `PULSE_REDIS_CONNECTION`:

```
PULSE_REDIS_CONNECTION=pulse
```

Quando usando a ingestão do Redis, você vai precisar executar o comando `pulse:work` para monitorar o fluxo e mover os registros do Redis para as tabelas de banco de dados do Pulse.

```php
php artisan pulse:work
```

> Nota:
> Para manter o processo 'pulse: work' em execução em segundo plano sem parar, você deve usar um programa de monitoramento de processos como o Supervisor para garantir que o trabalhador da Pulse continue em execução.

Como o comando `pulse:work` é um processo de longa vida, ele não verá as alterações no seu código sem ser reiniciado. Você deve reiniciar graciosamente o comando chamando o comando `pulse:restart` durante o processo de implantação do aplicativo:

```sh
php artisan pulse:restart
```

> !Nota
> Pulse usa o [cache](/docs/cache) para armazenar sinais de reinicialização, portanto você deve verificar que um driver de cache está configurado corretamente para sua aplicação antes de usar esse recurso.

<a name="sampling"></a>
### Amostragem

Por padrão, o Pulse irá capturar todo evento relevante que ocorre em seu aplicativo. Em aplicativos de alto tráfego, isso pode resultar na necessidade de agregar milhões de linhas de banco de dados no painel, especialmente para períodos mais longos.

Você pode escolher habilitar "amostragem" em alguns gravadores de dados Pulse. Por exemplo, definir a taxa de amostragem para `0.1` no [gravador de solicitações do usuário](#user-requests-recorder) significará que você registra aproximadamente 10% das solicitações ao seu aplicativo. No painel de controle, os valores serão dimensionados e precedidos por um `~` para indicar que são uma aproximação.

Em geral, quanto mais entradas você tiver para um determinado parâmetro, menor será o nível de amostragem que você pode definir sem sacrificar muita precisão.

<a name="trimming"></a>
### Cortar

Pulse irá automaticamente aparar suas entradas armazenadas uma vez que elas estão fora da janela do painel de controle. O corte ocorre quando ingerindo dados usando um sistema de loteria que pode ser personalizado no Pulse [arquivo de configuração] ().

<a name="pulse-exceptions"></a>
### Tratando Exceções de Pulso

Se uma exceção ocorrer durante a captura de dados do Pulse, como não conseguir se conectar ao banco de dados de armazenamento, o Pulse falhará silenciosamente para evitar afetar seu aplicativo.

Se você deseja personalizar como essas exceções são tratadas, você pode fornecer um método de fechamento para o método 'handleExceptionsUsing':

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
## Cartões Personalizados

Pulse permite que você crie cartões personalizados para exibir dados relevantes às necessidades específicas de sua aplicação. Pulse utiliza [Livewire](https://livewire.laravel.com), então talvez você queira [rever seus documentos](https://livewire.laravel.com/docs) antes de construir seu primeiro cartão personalizado.

<a name="custom-card-components"></a>
### Componentes do baralho

Criar um cartão personalizado no Laravel Pulse começa com a extensão do componente Livewire `Card` base e definindo uma visão correspondente:

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

Ao usar o recurso [lazy loading](https://livewire.laravel.com/docs/lazy) do Livewire, o componente `Card` irá fornecer automaticamente um espaço reservado que respeita os atributos `cols` e `rows` passados para seu componente.

Ao escrever sua sua visualização de cartão correspondente, você pode aproveitar os componentes da lâmina do Pulse para um aspecto e sensação consistentes:

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

As variáveis $cols, $rows, $class e $expand devem ser passadas aos componentes Blade correspondentes, de modo que o layout da tarjeta possa ser personalizado a partir da visão do painel. Você também pode querer incluir o atributo `wire:poll.5s=""` em sua visão para fazer a atualização automática da tarjeta.

Uma vez que você tenha definido seu componente e modelo do Livewire, o cartão pode ser incluído em sua [visualização do painel](#painel-personalizável):

```blade
<x-pulse>
    ...

    <livewire:pulse.top-sellers cols="4" />
</x-pulse>
```

> Nota!
> Se seu cartão está incluído em um pacote, você precisará registrar o componente com Livewire usando o método `Livewire::component`.

<a name="custom-card-styling"></a>
### Estilista

Se o seu cartão requer estilo adicional além das classes e componentes incluídos no Pulse, existem algumas opções para incluir CSS personalizado para as suas cartas.

<a name="custom-card-styling-vite"></a>
#### Integração com o Laravel Vite

Se sua carteira personalizada vive dentro da base de código de seu aplicativo e você está usando a integração do Laravel's [Vite integration]/docs/vite], você pode atualizar o arquivo `vite.config.js` para incluir um ponto de entrada CSS dedicado para sua carteira:

```js
laravel({
    input: [
        'resources/css/pulse/top-sellers.css',
        // ...
    ],
}),
```

Em seguida você pode usar a diretiva Blade `@vite` em sua [visão do painel](#painel-personalização) especificando o ponto de entrada CSS para seu cartão:

```blade
<x-pulse>
    @vite('resources/css/pulse/top-sellers.css')

    ...
</x-pulse>
```

<a name="custom-card-styling-css"></a>
#### Arquivos CSS

Para outros casos de uso, incluindo cartões Pulse contidos dentro de um pacote, você pode instruir o Pulse para carregar folhas de estilo adicionais definindo um método 'css' em seu componente Livewire que retorna o caminho do arquivo da sua folha de estilos.

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
#### Tailwind CSS

Ao utilizar o Tailwind CSS, você deve criar um arquivo de configuração separado do Tailwind para evitar carregar folhas de estilo desnecessárias ou entrar em conflito com as classes do Tailwind do Pulse.

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

Em seguida, você pode especificar o arquivo de configuração no seu ponto de entrada do CSS:

```css
@config "../../tailwind.top-sellers.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Você também precisará incluir um atributo 'id' ou 'class' na sua visualização de cartão que corresponda ao seletor passado para a estratégia de seleção de [importante](https://tailwindcss.com/docs/configuration#selector-strategy) do Tailwind CSS:

```blade
<x-pulse::card id="top-sellers" :cols="$cols" :rows="$rows" class="$class">
    ...
</x-pulse::card>
```

<a name="custom-card-data"></a>
### Captura e agregação de dados

Cartas personalizadas podem buscar e exibir dados de qualquer lugar; no entanto, você pode querer aproveitar o sistema poderoso e eficiente de registro e agregação de dados do Pulse.

<a name="custom-card-data-capture"></a>
#### Captura de entradas

Puls permite que você registre "entradas" usando o método `Pulse::record`:

```php
use Laravel\Pulse\Facades\Pulse;

Pulse::record('user_sale', $user->id, $sale->amount)
    ->sum()
    ->count();
```

A primeira palavra fornecida ao método 'record' é o tipo para o registro que você está registrando, enquanto a segunda palavra é a chave que determina como os dados agregados devem ser agrupados. Para a maioria dos métodos de agregação, também será necessário especificar um valor para ser agregado. No exemplo acima, o valor a ser agregado é "$sale->amount". Você então pode invocar um ou mais métodos de agregação (como "sum") para que Pulse possa capturar valores pré-agregados em "balde" para recuperação eficiente posterior.

Os métodos de agregação disponíveis são:

Média
Contar
* `máximo`
* 'min'
* soma

> Nota:
> Ao construir um pacote de cartão que captura o ID do usuário atualmente autenticado, você deve usar o método `Pulse::resolveAuthenticatedUserId()`, respeitando qualquer [personalização do solucionador de usuários](#dashboard-resolving-users) feita no aplicativo.

<a name="custom-card-data-retrieval"></a>
#### Recuperando Dados Agregados

Ao estender o componente Livewire `Pulse::Card`, você pode utilizar o método `aggregate` para recuperar dados agregados para o período em exibição no painel de controle:

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

O método 'aggregate' retorna uma coleção de objetos 'stdClass' do PHP. Cada objeto conterá a propriedade 'key', capturada anteriormente, juntamente com as chaves para cada um dos agregados solicitados.

```php
@foreach ($topSellers as $seller)
    {{ $seller->key }}
    {{ $seller->sum }}
    {{ $seller->count }}
@endforeach
```

Pulse irá, em primeiro lugar, recuperar os dados dos balões pré-agregados; portanto, as agregações especificadas devem ter sido capturadas de antemão usando o método `Pulse::record`. O balão mais velho normalmente cairá parcialmente fora do período, então Pulse irá agregar as entradas mais velhas para preencher o espaço e fornecer um valor preciso para todo o período sem precisar agregar o período inteiro em cada solicitação de poll.

Você também pode obter um valor total para um determinado tipo usando o método `aggregateTotal`. Por exemplo, o seguinte método retornaria o total de todas as vendas dos usuários em vez de agrupá-los por usuário.

```php
$total = $this->aggregateTotal('user_sale', 'sum');
```

<a name="custom-card-displaying-users"></a>
#### Exibindo Usuários

Quando trabalhando com agregados que armazenam um ID de usuário como chave, você pode resolver as chaves para registros de usuários usando o método `Pulse::resolveUsers`:

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
#### Relevadores Personalizados

Os autores de pacotes podem querer fornecer classes gravadoras para permitir aos usuários configurar a captura de dados.

Os gravadores são registrados na seção ``recorders'' do arquivo de configuração ``config/pulse.php''.

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

Os gravadores podem ouvir eventos especificando uma propriedade `$listen`. A Pulse irá automaticamente registrar os ouvintes e chamar o método `record` dos gravadores:

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
