# Contexto

<a name="introduction"></a>
## Introdução

 As capacidades de "contexto" do Laravel permitem capturar, recuperar e compartilhar informações através das solicitações, tarefas e comandos executados na sua aplicação. Esta informação capturada é também incluída nos registros escritos pela sua aplicação, o que lhe proporciona uma visão mais aprofundada da história de execução do código em torno da entrada no registo e permite-lhe identificar os fluxos de execução num sistema distribuído.

<a name="how-it-works"></a>
### Como funciona

 A melhor maneira de entender as capacidades do contexto do Laravel é vê-lo em ação usando os recursos integrados de log. Para começar, você pode [adicionar informações ao contexto](#capturing-context) usando o facade `Context`. Neste exemplo, usaremos um [middleware](/docs/middleware) para adicionar a URL da solicitação e um identificador de rastreamento exclusivo ao contexto em cada solicitação recebida:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AddContext
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        Context::add('url', $request->url());
        Context::add('trace_id', Str::uuid()->toString());

        return $next($request);
    }
}
```

 As informações adicionadas ao contexto são automaticamente anexadas como metadados a todos os [registros de logs](/docs/logging) que são escritos durante toda a requisição. Anexar o contexto como um metadado permite diferenciar as informações passadas para cada registro de log das informações compartilhadas via `Context`. Por exemplo, imagine escrevermos o seguinte registo:

```php
Log::info('User authenticated.', ['auth_id' => Auth::id()]);
```

 O registo escrito contém o `auth_id` passado ao registo mas também inclui como metadados a URL e o `trace_id` do contexto.

```
User authenticated. {"auth_id":27} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```

 As informações adicionadas ao contexto são também disponibilizadas aos trabalhos enviados para a fila. Por exemplo, se enviaremos um trabalho ProcessPodcast à fila após o envio de algumas informações ao contexto:

```php
// In our middleware...
Context::add('url', $request->url());
Context::add('trace_id', Str::uuid()->toString());

// In our controller...
ProcessPodcast::dispatch($podcast);
```

 Quando o trabalho é enviado, qualquer informação atualmente armazenada no contexto é capturada e compartilhada com o trabalho. A informação capturada é então reutilizada como um novo contexto enquanto a execução do trabalho está em andamento. Por exemplo:

```php
class ProcessPodcast implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // ...

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Processing podcast.', [
            'podcast_id' => $this->podcast->id,
        ]);

        // ...
    }
}
```

 O registo de log resultante contém a informação que foi adicionada ao contexto durante o pedido original que remeteu para o trabalho:

```
Processing podcast. {"podcast_id":95} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```

 Embora tenhamos focado nas funcionalidades relacionadas com o registo integrado de Laravel, a documentação seguinte irá ilustrar como o context permite partilhar informações no limite entre um pedido HTTP e um trabalho agendado e até como adicionar [dados de contexto ocultos (hidden context)](#hidden-context) que não são registados nas entradas de log.

<a name="capturing-context"></a>
## Capturando o contexto

 Você pode armazenar informações no contexto atual usando o método `add` da interface de frente `Context`:

```php
use Illuminate\Support\Facades\Context;

Context::add('key', 'value');
```

 Para adicionar vários itens de uma só vez, poderá transmitir um array associativo à função `add`:

```php
Context::add([
    'first_key' => 'value',
    'second_key' => 'value',
]);
```

 O método `add` sobrescreve o valor de um dado que possui a mesma chave. Se pretender somente adicionar informações ao contexto se a chave não existir, deve utilizar o método `addIf`:

```php
Context::add('key', 'first');

Context::get('key');
// "first"

Context::addIf('key', 'second');

Context::get('key');
// "first"
```

<a name="conditional-context"></a>
#### A contexto condicional

 O método `when` pode ser usado para adicionar dados ao contexto com base em uma condição. Se a condição for verdadeira, o primeiro fechamento passado ao método `when` será chamado; se a condição for falsa, o segundo fechamento será chamado:

```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Context;

Context::when(
    Auth::user()->isAdmin(),
    fn ($context) => $context->add('permissions', Auth::user()->permissions),
    fn ($context) => $context->add('permissions', []),
);
```

<a name="stacks"></a>
### Pilhas

 O Context fornece a capacidade de criar pilhas, que são listas de dados armazenadas na ordem em que foram adicionadas. Você pode adicionar informações a uma pilha invocando o método `push`:

```php
use Illuminate\Support\Facades\Context;

Context::push('breadcrumbs', 'first_value');

Context::push('breadcrumbs', 'second_value', 'third_value');

Context::get('breadcrumbs');
// [
//     'first_value',
//     'second_value',
//     'third_value',
// ]
```

 Os Stacks podem ser úteis para armazenar informações históricas sobre um pedido, como os eventos que ocorrem ao longo da sua aplicação. Por exemplo, poderia criar um ouvinte de eventos que insere uma informação num stack a cada vez que uma consulta é executada, armazenando a SQL e duração da consulta como uma tupl:

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\DB;

DB::listen(function ($event) {
    Context::push('queries', [$event->time, $event->sql]);
});
```

<a name="retrieving-context"></a>
## Recuperando o contexto

 Você pode recuperar informações do contexto usando o método `get` da faca de contexto:

```php
use Illuminate\Support\Facades\Context;

$value = Context::get('key');
```

 O método `only` pode ser utilizado para recuperar um subconjunto de informações do contexto:

```php
$data = Context::only(['first_key', 'second_key']);
```

 O método `pull` pode ser usado para recuperar informações do contexto e removê-las imediatamente a partir dele:

```php
$value = Context::pull('key');
```

 Se você quiser recuperar todas as informações armazenadas no contexto, poderá invocar o método "all":

```php
$data = Context::all();
```

<a name="determining-item-existence"></a>
### Determinar a existência do item

 Você pode usar o método `has` para determinar se o contexto tem algum valor armazenado para a chave especificada:

```php
use Illuminate\Support\Facades\Context;

if (Context::has('key')) {
    // ...
}
```

 O método `has` retornará `true`, independentemente do valor armazenado. Portanto, por exemplo, uma chave com um valor nulo será considerada como presente:

```php
Context::add('key', null);

Context::has('key');
// true
```

<a name="removing-context"></a>
## Retirando o contexto

 O método `forget` pode ser usado para remover uma chave e seu respectivo valor do contexto atual:

```php
use Illuminate\Support\Facades\Context;

Context::add(['first_key' => 1, 'second_key' => 2]);

Context::forget('first_key');

Context::all();

// ['second_key' => 2]
```

 Você pode esquecer várias chaves de uma só vez, ao fornecer um vetor para o método `forget`:

```php
Context::forget(['first_key', 'second_key']);
```

<a name="hidden-context"></a>
## Conteúdo oculto

 O Context permite armazenar dados “ ocultos”. Essas informações ocultas não são anexadas aos logs e não são acessíveis através dos métodos de recuperação de dados documentados acima. O Context oferece um conjunto diferente de métodos para interagir com as informações ocultas do contexto:

```php
use Illuminate\Support\Facades\Context;

Context::addHidden('key', 'value');

Context::getHidden('key');
// 'value'

Context::get('key');
// null
```

 Os métodos “escondidos” espelham a funcionalidade dos métodos não ocultos documentados acima:

```php
Context::addHidden(/* ... */);
Context::addHiddenIf(/* ... */);
Context::pushHidden(/* ... */);
Context::getHidden(/* ... */);
Context::pullHidden(/* ... */);
Context::onlyHidden(/* ... */);
Context::allHidden(/* ... */);
Context::hasHidden(/* ... */);
Context::forgetHidden(/* ... */);
```

<a name="events"></a>
## Eventos

 O contexto envia dois eventos que permitem o engate no processo de hidratação e desidratação do contexto.

 Para ilustrar como esses eventos podem ser usados, imagine que em um middleware de seu aplicativo você definir o valor da configuração `app.locale` com base no cabeçalho `Accept-Language` do pedido HTTP. Os eventos do Context permitem capturar esse valor durante o pedido e restaurá-lo na fila, garantindo que as notificações enviadas na fila tenham o valor correto de `app.locale`. Podemos usar os eventos do contexto e dados [escondidos (#escondidos contexto)] para conseguir isso, como ilustrado na documentação a seguir.

<a name="dehydrating"></a>
### Desidratação

 Sempre que um trabalho é enviado para a fila, os dados no contexto são "desidratados" e capturados ao lado da carga útil do trabalho. O método `Context::dehydrating` permite-lhe registar um fecho (closure) que será invocado durante o processo de desidratação. Neste fecho, pode fazer alterações aos dados que serão partilhadas com o trabalho na fila.

 Normalmente você deve registrar os retornos de chamada `dehydrating` no método `boot` da classe do `AppServiceProvider` da sua aplicação:

```php
use Illuminate\Log\Context\Repository;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Context;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Context::dehydrating(function (Repository $context) {
        $context->addHidden('locale', Config::get('app.locale'));
    });
}
```

 > [!ATENÇÃO]
 > Você não deve usar a interface `Context` dentro do callback `dehydrating`, uma vez que isso pode alterar o contexto do processo atual. Certifique-se de fazer alterações apenas no repositório passado ao callback.

<a name="hydrated"></a>
### Hidratados

 Sempre que um trabalho agendado começar a ser executado na fila, qualquer contexto partilhado com esse trabalho é "hidratado" no contexto atual. O método `Context::hydrated` permite registar uma sub-rotina que é invocada durante o processo de hidratação.

 Normalmente, você deve registrar os retornos do callback `hydrated` dentro do método `boot` da classe `AppServiceProvider` do seu aplicativo:

```php
use Illuminate\Log\Context\Repository;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Context;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Context::hydrated(function (Repository $context) {
        if ($context->hasHidden('locale')) {
            Config::set('app.locale', $context->getHidden('locale'));
        }
    });
}
```

 > [!NOTA]
 > Não é recomendável usar a fachada `Context` no callback `hydrated`. Em vez disso, deve garantir que apenas realiza alterações ao repositório passado para o callback.
