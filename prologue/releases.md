# Notas de Lançamento

## Esquema de controle de versão
O Laravel e seus outros pacotes originais seguem o [Controle de Versão Semântico](https://semver.org/). As versões principais do 
framework são lançadas a cada seis meses (~março e ~setembro), enquanto as versões menores e de patch podem ser lançadas com a 
frequência semanal. Versões secundárias e de patch nunca devem conter alterações importantes.

Ao referenciar o framework Laravel ou seus componentes em sua aplicação ou pacote, você deve sempre usar uma restrição de versão como `^8.0`, 
já que os principais lançamentos do Laravel incluem mudanças significativas. No entanto, nos esforçamos para sempre garantir que você possa 
atualizar para uma nova versão principal em um dia ou menos.

## Política de Suporte
Para versões LTS, como o Laravel 6, as correções de bugs são fornecidas por 2 anos e as correções de segurança são fornecidas por 3 anos. 
Essas versões fornecem a janela mais longa de suporte e manutenção. Para lançamentos gerais, as correções de bugs são fornecidas por 7 meses
e as correções de segurança são fornecidas por 1 ano. Para todas as bibliotecas adicionais, incluindo Lumen, apenas a versão mais recente 
recebe correções de bug. Além disso, reveja as versões do banco de dados [suportadas pelo Laravel](https://laravel.com/docs/8.x/database#introduction).

| Versão   | Lançamento             | Correções de bugs até	  | Correções de segurança até |
|----------|------------------------|-------------------------|----------------------------|
| 6 (LTS)  | 3 de setembro de 2019	 | 5 de outubro de 2021	   | 3 de setembro de 2022      |
| 7	       | 3 de março de 2020	    | 6 de outubro de 2020	   | 3 de março de 2021         |
| 8	       | 8 de setembro de 2020	 | 6 de abril de 2021	     | 8 de setembro de 2021      |

## Laravel 8
Laravel 8 continua as melhorias feitas no Laravel 7.x introduzindo Laravel Jetstream, fábrica de modelo, 
migration, fila de trabalhos, limitação de taxa aprimorada, melhorias de fila, componentes Blade dinâmicos, 
visualizações de paginação com Tailwind, auxiliares de teste de tempo, melhorias para artisan serve, 
melhoria em ouvintes de eventos e uma variedade de outras correções de bugs e melhorias de usabilidade.

### Laravel Jetstream

Laravel Jetstream foi escrito por [Taylor Otwell](https://github.com/taylorotwell).

O [Laravel Jetstream](https://jetstream.laravel.com/) é um scaffold de aplicativo lindamente projetado para o Laravel. 
Jetstream fornece o ponto de partida perfeito para seu próximo projeto e inclui login, registro, verificação de e-mail, 
autenticação de dois fatores, gerenciamento de sessão, suporte de API via Laravel Sanctum e gerenciamento de grupo opcional.
O Laravel Jetstream substitui e aprimora o arcabouço de interface de usuário de autenticação legado disponível para versões 
anteriores do Laravel.

O Jetstream é projetado usando [Tailwind CSS](https://tailwindcss.com/) e oferece para scaffold o [Livewire](https://laravel-livewire.com/)
ou [Inertia](https://inertiajs.com/).

### Diretório de Modelos
Devido à grande demanda da comunidade, o esqueleto padrão do aplicativo Laravel agora contém um diretório `app/Models`. Esperamos que você 
aproveite esta nova casa para seus modelos Eloquent! Todos os comandos do gerador relevantes foram atualizados para assumir que existem modelos 
dentro do diretório `app/Models`, se existir. Se o diretório não existir, a estrutura assumirá que seus modelos devem ser colocados dentro do
diretório `app`.

### Classes de fábrica para modelos

Classes de fábrica foram contribuídas por [Taylor Otwell](https://github.com/taylorotwell).

As [fábricas modelo](https://laravel.com/docs/8.x/database-testing#defining-model-factories) do Eloquent foram inteiramente reescritas 
como fábricas baseadas em classes e aprimoradas para ter suporte de relacionamento. Por exemplo, o `UserFactory` incluído no Laravel é 
escrito assim:

```php
<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'email_verified_at' => now(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'remember_token' => Str::random(10),
        ];
    }
}
```

Graças à nova trait `HasFactory` disponível nos modelos gerados, a fábrica de modelos pode ser usada da seguinte forma:
```php
use App\Models\User;

User::factory()->count(50)->create();
```

Como as fábricas de modelos agora são classes PHP simples, as transformações de estado podem ser escritas como métodos de 
classe. Além disso, você pode adicionar quaisquer outras classes auxiliares à fábrica de modelos do Eloquent, conforme necessário.

Por exemplo, seu modelo `User` pode ter um estado `suspended` que modifica um de seus valores de atributo padrão. Você pode definir 
suas transformações de estado usando o método `state` da fábrica. Você pode nomear seu método de estado como quiser. Afinal, é apenas 
um método PHP típico:

```php
/**
 * Indicate that the user is suspended.
 *
 * @return \Illuminate\Database\Eloquent\Factories\Factory
 */
public function suspended()
{
    return $this->state([
        'account_status' => 'suspended',
    ]);
}
```

Depois de definir o método de transformação de estado, podemos usá-lo assim:
```php
use App\Models\User;

User::factory()->count(5)->suspended()->create();
```

Como mencionado, as fábricas de modelos do Laravel 8 contêm suporte de primeira classe para relacionamentos. Portanto, 
supondo que nosso modelo `User` tenha um método `posts` de relacionamento, podemos simplesmente executar o seguinte código 
para gerar um usuário com três postagens:

```php
$users = User::factory()
            ->hasPosts(3, [
                'published' => false,
            ])
            ->create();
```

Para facilitar o processo de atualização, o pacote [laravel/legacy-factories](https://github.com/laravel/legacy-factories) foi lançado para 
fornecer suporte para a iteração anterior de fábricas de modelos dentro do Laravel 8.x.

As fábricas reescritas do Laravel contêm muito mais recursos que achamos que você vai adorar. Para saber mais sobre fábricas de modelos, 
consulte a documentação de teste de banco de dados.

### Comprimir Migrations

O  foi contribuído por [Taylor Otwell](https://github.com/taylorotwell).

Conforme você constrói seu aplicativo, pode acumular mais e mais migrações ao longo do tempo. Isso pode fazer com que seu diretório 
de migração fique inchado com potencialmente centenas de migrações. Se estiver usando MySQL ou PostgreSQL, agora você pode "esmagar" 
suas migrações em um único arquivo SQL. Para começar, execute o comando `schema:dump`:

```bash
php artisan schema:dump

// Exporte o esquema de banco de dados atual e remova todas as migrações existentes...
php artisan schema:dump --prune
```

Quando você executa este comando, o Laravel irá escrever um arquivo de "esquema" em seu diretório `database/schema`. Agora, quando você 
tentar migrar seu banco de dados e nenhuma outra migração for executada, o Laravel irá executar o SQL do arquivo de esquema primeiro. Após 
executar os comandos do arquivo de esquema, o Laravel executará todas as migrações restantes que não fizeram parte do despejo do esquema.

### Trabalho em lote
Este pacote foi contribuído por [Taylor Otwell](https://github.com/taylorotwell) & [Mohamed Said](https://github.com/themsaid).

O recurso de trabalhos em lote do Laravel permite que você execute facilmente um lote de trabalhos e, em seguida, execute alguma 
ação quando o lote de trabalhos estiver concluído a execução.

O novo método `batch` da facade `Bus` pode ser usado para despachar um lote de trabalhos. Obviamente, o envio em lote é útil principalmente 
quando combinado com retornos de chamada de conclusão. Assim, você pode usar os métodos `then`, `catch` e `finally` para definir retornos de 
chamada de conclusão para o lote. Cada um desses retornos de chamada receberá uma instância `Illuminate\Bus\Batch` quando for invocado:

```php
use App\Jobs\ProcessPodcast;
use App\Podcast;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;
use Throwable;

$batch = Bus::batch([
    new ProcessPodcast(Podcast::find(1)),
    new ProcessPodcast(Podcast::find(2)),
    new ProcessPodcast(Podcast::find(3)),
    new ProcessPodcast(Podcast::find(4)),
    new ProcessPodcast(Podcast::find(5)),
])->then(function (Batch $batch) {
    // Todos os trabalhos concluídos com sucesso...
})->catch(function (Batch $batch, Throwable $e) {
    // Primeira falha de trabalho em lote detectada...
})->finally(function (Batch $batch) {
    // A execução do lote terminou...
})->dispatch();

return $batch->id;
```

Para saber mais sobre lotes de trabalhos, consulte a [documentação de fila](https://laravel.com/docs/8.x/queues#job-batching).

### Limite de taxa aprimorado

Melhorias de limitação de taxa foram contribuídas por [Taylor Otwell](https://github.com/taylorotwell).

O recurso limitador de taxa de solicitação do Laravel foi aumentado com mais flexibilidade e poder, enquanto 
ainda mantém a compatibilidade com versões `throttle` anteriores.

Os limitadores de taxa são definidos usando o método `for` que era a facade `RateLimit`. O método `for` aceita um nome de limitador de 
taxa e uma interdição que retorna a configuração de limite que deve ser aplicada às rotas nas quais este limitador de taxa é atribuído:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000);
});
```

Como os retornos de chamada do limitador de taxa recebem a instância de solicitação HTTP de entrada, você pode criar o limite de 
taxa apropriado dinamicamente com base na solicitação de entrada ou usuário autenticado:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100);
});
```

Às vezes, você pode desejar segmentar os limites de taxa por algum valor arbitrário. Por exemplo, você pode permitir que 
os usuários acessem uma determinada rota 100 vezes por minuto por endereço IP. Para fazer isso, você pode usar o método `by`
ao construir seu limite de taxa:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
                ? Limit::none()
                : Limit::perMinute(100)->by($request->ip());
});
```

Limitadores de taxa podem ser anexados a rotas ou grupos de rotas usando o [middleware](https://laravel.com/docs/8.x/middleware) `throttle`. 
O middleware `throttle` aceita o nome do limitador de taxa que você deseja atribuir à rota:

```php
Route::middleware(['throttle:uploads'])->group(function () {
    Route::post('/audio', function () {
        //
    });

    Route::post('/video', function () {
        //
    });
});
```

Para saber mais sobre limitação de taxa, consulte a [documentação de roteamento](https://laravel.com/docs/8.x/routing#rate-limiting).

### Modo de manutenção aprimorado
Melhorias no modo de manutenção foram contribuídas por [Taylor Otwell](https://github.com/taylorotwell) com inspiração de [Spatie](https://spatie.be/).

Em versões anteriores do Laravel, o recurso `php artisan down` do modo de manutenção pode ser contornado usando uma "lista de permissão" de 
endereços IP que tinham permissão para acessar o aplicativo. Este recurso foi removido em favor de uma solução mais simples de "secret"/token.

Enquanto estiver no modo de manutenção, você pode usar a opção `secret` para especificar um token de desvio do modo de manutenção:

```bash
php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"
```

Após colocar o aplicativo em modo de manutenção, você pode navegar até a URL do aplicativo correspondente a este token e o Laravel irá 
emitir um cookie de desvio do modo de manutenção para o seu navegador:

```
https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515
```

Ao acessar esta rota oculta, você será redirecionado para a `/` do aplicativo. Assim que o cookie for emitido para o seu navegador, você poderá 
navegar no aplicativo normalmente como se ele não estivesse em modo de manutenção.

### Pré-renderizando a visualização do modo de manutenção
Se você utilizar o comando `php artisan down` durante a implantação, seus usuários ainda podem ocasionalmente encontrar erros se acessarem o 
aplicativo enquanto as dependências do Composer ou outros componentes de infraestrutura estão sendo atualizados. Isso ocorre porque uma parte 
significativa do framework Laravel deve inicializar para determinar se sua aplicação está em modo de manutenção e renderizar a visualização do 
modo de manutenção usando o motor de templates.

Por esta razão, o Laravel agora permite que você pré-renderize uma visualização do modo de manutenção que será retornada no início do ciclo de 
solicitação. Esta visualização é renderizada antes que qualquer uma das dependências do seu aplicativo seja carregada. Você pode pré-renderizar 
um modelo de sua escolha usando a opção `down` do comando `render`:

```bash
php artisan down --render="errors::503"
```

### Closure Despacho/Cadeia `catch`

Melhorias de captura foram contribuídas por [Mohamed Said](https://github.com/themsaid).

Usando o novo método `catch`, agora você pode fornecer um closure que deve ser executado se um closure na fila não for concluído com 
êxito após esgotar todas as tentativas de repetição configuradas da fila:

```php
use Throwable;

dispatch(function () use ($podcast) {
    $podcast->publish();
})->catch(function (Throwable $e) {
    // Este trabalho falhou...
});
```

### Componentes de blade dinâmicas

Os componentes Dynamic Blade foram contribuídos por [Taylor Otwell](https://github.com/taylorotwell).

Às vezes, você pode precisar renderizar um componente, mas não saber qual componente deve ser renderizado até o tempo de execução. 
Nesta situação, você agora pode usar o componente `dynamic-component` embutido do Laravel para renderizar o componente baseado em 
um valor ou variável de tempo de execução:

```html
<x-dynamic-component :component="$componentName" class="mt-4" />
```

Para saber mais sobre os componentes do Blade, consulte a [documentação do Blade](https://laravel.com/docs/8.x/blade#components).

### Melhorias de ouvintes de eventos

As melhorias do ouvinte de eventos foram contribuídas por [Taylor Otwell](https://github.com/taylorotwell).

Ouvintes de eventos baseados em fechamento agora podem ser registrados apenas passando o fechamento para o método `Event::listen`.
O Laravel irá inspecionar o fechamento para determinar qual tipo de evento o ouvinte trata:

```php
use App\Events\PodcastProcessed;
use Illuminate\Support\Facades\Event;

Event::listen(function (PodcastProcessed $event) {
    //
});
```

Além disso, os ouvintes de eventos baseados em encerramento agora podem ser marcados como enfileirados usando a função `Illuminate\Events\queueable`:

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;

Event::listen(queueable(function (PodcastProcessed $event) {
    //
}));
```

Como trabalhos em fila, você pode usar os métodos `onConnection`, `onQueuee` e `delay` para personalizar a execução do ouvinte fila:

```php
Event::listen(queueable(function (PodcastProcessed $event) {
    //
})->onConnection('redis')->onQueue('podcasts')->delay(now()->addSeconds(10)));
```

Se desejar lidar com falhas anônimas do ouvinte em fila, você pode fornecer um encerramento para o método `catch` ao definir o ouvinte `queueable`:

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;
use Throwable;

Event::listen(queueable(function (PodcastProcessed $event) {
    //
})->catch(function (PodcastProcessed $event, Throwable $e) {
    // O ouvinte na fila falhou...
}));
```

### Ajudantes de teste de tempo

Os ajudantes de teste de tempo foram contribuídos por [Taylor Otwell](https://github.com/taylorotwell) com inspiração no Ruby on Rails.

Ao testar, você pode ocasionalmente precisar modificar o tempo retornado por ajudantes como `now` ou `Illuminate\Support\Carbon::now()`. 
A classe de teste de recursos básicos do Laravel agora inclui ajudantes que permitem a você manipular o tempo atual:

```php
public function testTimeCanBeManipulated()
{
    // Viaje para o futuro...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // Viagem ao passado...
    $this->travel(-5)->hours();

    // Viagem para um tempo específico...
    $this->travelTo(now()->subHours(6));

    // Voltar para o tempo presente...
    $this->travelBack();
}
```

### Melhorias em `serve` do Artisan

Melhorias no Artisan foram contribuídas por [Taylor Otwell](https://github.com/taylorotwell).

O comando `serve` do Artisan foi aprimorado com recarga automática quando mudanças de variáveis de ambiente são detectadas em 
seu arquivo `.env` local. Anteriormente, o comando precisava ser interrompido e reiniciado manualmente.

### Visualizações de paginação do Tailwind

O paginador do Laravel foi atualizado para usar o framework CSS do [Tailwind](https://tailwindcss.com/) por padrão. Tailwind CSS é uma estrutura CSS de baixo 
nível altamente personalizável que fornece todos os blocos de construção de que você precisa para criar designs sob medida, sem 
nenhum estilo opinativo irritante que você precise lutar para ignorar. Claro, as visualizações do Bootstrap 3 e 4 também permanecem
disponíveis.

### Roteamento de atualizações de namespace
Nas versões anteriores do Laravel, o `RouteServiceProvider` continha uma propriedade `$namespace`. O valor dessa propriedade seria prefixado 
automaticamente nas definições de rota do controlador e nas chamadas para o método `action`/`URL::action`. No Laravel 8.x, esta propriedade 
é por padrão `null`. Isso significa que nenhum prefixo de namespace automático será feito pelo Laravel. Portanto, em novos aplicativos 
Laravel 8.x, as definições de rota do controlador devem ser definidas usando a sintaxe padrão de chamada do PHP:

```php
use App\Http\Controllers\UserController;

Route::get('/users', [UserController::class, 'index']);
```

As chamadas para os métodos `action` relacionados devem usar a mesma sintaxe que pode ser chamada:
```
action([UserController::class, 'index']);

return Redirect::action([UserController::class, 'index']);
```

Se você preferir o prefixo de rota do controlador no estilo Laravel 7.x, você pode simplesmente adicionar a propriedade `$namespace` 
do seu aplicativo `RouteServiceProvider`.

> Esta mudança afeta apenas os novos aplicativos do Laravel 8.x. Os aplicativos atualizados do Laravel 7.x ainda terão a propriedade `$namespace`
> em seus `RouteServiceProvider`.
