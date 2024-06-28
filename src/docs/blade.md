# Modelos de lâminas

## Introdução

 O Blade é um motor de modelagem simples e poderoso incluído no Laravel. Diferente de alguns motores de modelagem PHP, o Blade não o restringe da utilização do código PHP puro nos seus modelos. Na verdade, todos os modelos do Blade são compilados para código PHP puro e armazenados em cache até serem modificados, significando que o Blade não impõe quaisquer sobrecargas à sua aplicação. Os arquivos de modelo .blade.php têm normalmente a extensão `.blade.php` e são armazenados no diretório `resources/views`.

 É possível retornar vistas Blade a partir de rotas ou controladores usando o recurso auxiliar global `view`. Claro que, como mencionado na documentação sobre [vistas](/docs/{{ version }}/views), é possível passar dados para a vista Blade usando o segundo argumento do recurso auxiliar `view`:

 Rota::get ('/', função () {

 Retorna a exibição 'Greeting' com o nome 'Finn'.
 )

### Sobrecarregando a lâmina com o LiveWire

 Quer levar os seus modelos Blade ao próximo nível e criar interfaces dinâmicas com facilidade? Confira o [Laravel Livewire](https://livewire.laravel.com). O Livewire permite que você escreva componentes Blade, que são aumentados com funcionalidades dinâmicas que normalmente seriam possíveis apenas por meio de frameworks frontend como React ou Vue, fornecendo uma excelente abordagem para criar interfaces frontend modernas e reativas sem as complexidades, renderização do lado do cliente ou etapas de compilação de muitos frameworks JavaScript.

## Mostrar dados

 É possível exibir dados que são passados aos seus vistas Blade usando aspas duplas, por exemplo, considerando o seguinte caminho:

```php
    Route::get('/', function () {
        return view('welcome', ['name' => 'Samantha']);
    });
```

 Você pode exibir o conteúdo da variável `name` da seguinte maneira:

```blade
Hello, {{ $name }}.
```

 > [!NOTA]
 > As declarações de eco de `{{ }}` do Blade são automaticamente enviadas pela função `htmlspecialchars` do PHP para evitar ataques XSS.

 Você não está limitado ao mostrar o conteúdo das variáveis passadas à vista. Pode também efetuar a impressão dos resultados de qualquer função PHP. Na verdade, você pode inserir qualquer código PHP que desejar dentro da instrução echo da Blade:

```blade
The current UNIX timestamp is {{ time() }}.
```

### Codificação de entidades HTML

 Por padrão, o Blade (e a função Laravel `e`) irá duplicar a codificação das entidades HTML. Se pretender desativar a dupla codificação, chamamos a método `Blade::withoutDoubleEncoding` na metodologia `boot` do seu `AppServiceProvider`:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Blade;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            Blade::withoutDoubleEncoding();
        }
    }
```

#### Exibição de dados não encerrados

 Por padrão, as declarações de código Blade `'{}'` são enviadas automaticamente para a função PHP `htmlspecialchars` para evitar ataques XSS. Se não pretender que os seus dados sejam escapados, poderá utilizar a seguinte sintaxe:

```blade
Hello, {!! $name !!}.
```

 > [ATENÇÃO]
 > Tenha muito cuidado ao reproduzir conteúdo fornecido por usuários de seu aplicativo. Normalmente, você deve usar a sintaxe dos aspas duplas e do caractere de escape para evitar ataques XSS ao exibir dados fornecidos pelo usuário.


### Arquiteturas de Blade e JavaScript

 Como muitos frameworks JavaScript também utilizam aspas "acartonadas" para indicar que determinada expressão deve ser exibida no browser, você pode usar o símbolo `@` para informar ao motor de renderização Blade que uma expressão não deve ser alterada. Por exemplo:

```blade
<h1>Laravel</h1>

Hello, @{{ name }}.
```

 Nesse exemplo, o símbolo `@` será removido pelo Blade; no entanto, a expressão `{{ name }}` permanecerá intocada pelo motor do Blade, permitindo que seja renderizada pelo seu framework JavaScript.

 O símbolo `@' também pode ser utilizado para evitar as diretivas Blade:

```blade
{{-- Blade template --}}
@@if()

<!-- HTML output -->
@if()
```

#### Exibição de JSON

 Às vezes, você pode enviar um array para sua visualização com a intenção de renderizá-lo como JSON para inicializar uma variável JavaScript. Por exemplo:

```blade
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

 No entanto, ao invés de chamar manualmente `json_encode`, você pode usar o direcionador da metodologia `Illuminate\Support\Js::from`. O método `from` aceita os mesmos argumentos que a função PHP `json_encode`; no entanto, ele garante que o JSON resultante será devidamente escapado para inclusão dentro de citações HTML. O método `from` retorna uma sentença do comando JavaScript `JSON.parse` que converte um objeto ou matriz dados em um objeto JavaScript válido:

```blade
<script>
    var app = {{ Illuminate\Support\Js::from($array) }};
</script>
```

 As versões mais recentes do esqueleto da aplicação Laravel incluem uma interface `Js`, que fornece um acesso conveniente a essas funcionalidades dentro dos modelos Blade:

```blade
<script>
    var app = {{ Js::from($array) }};
</script>
```

 > [!AVISO]
 > Você só deve usar o método `Js::from` para renderizar variáveis existentes como JSON. O plantão de modelagem Blade é baseado em expressões regulares e tentar passar uma expressão complexa para a diretiva pode causar falhas inesperadas.

#### A diretiva '@verbatim'

 Se você estiver exibindo variáveis de JavaScript em uma grande parte do modelo, poderá envolver o código HTML na diretiva `@verbatim`, para não precisar adicionar um símbolo `@` a cada instrução Blade echo:

```blade
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

## Diretivas de laminação

 Além da herança de modelos e exibição de dados, o Blade fornece atalhos convenientes para estruturas de controle do PHP comuns, tais como expressões condicionais e loops. Estes atalhos oferecem uma maneira limpa e concisa de trabalhar com estruturas de controle do PHP, mas permanecem familiares aos seus homólogos do PHP.

### Seções de Condicional

 Você pode construir declarações `se` utilizando as diretivas `@if`, `@elseif`, `@else` e `@endif`. Essas diretivas funcionam de maneira idêntica às correspondentes no PHP:

```blade
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

 Por conveniência, o Blade também oferece a diretiva `@except`:

```blade
@unless (Auth::check())
    You are not signed in.
@endunless
```

 Além das diretivas condicionais já discutidas, as diretivas `@isset` e `@empty` podem ser utilizadas como atalhos para suas respectivas funções do PHP:

```blade
@isset($records)
    // $records is defined and is not null...
@endisset

@empty($records)
    // $records is "empty"...
@endempty
```

#### Diretivas de autenticação

 As diretivas `@auth` e `@guest` podem ser utilizadas para determinar rapidamente se o usuário atual está autenticado ou é um visitante:

```blade
@auth
    // The user is authenticated...
@endauth

@guest
    // The user is not authenticated...
@endguest
```

 Se necessário, você pode especificar a verificação de autenticação ao usar as diretivas `@auth` e `@guest`:

```blade
@auth('admin')
    // The user is authenticated...
@endauth

@guest('admin')
    // The user is not authenticated...
@endguest
```

#### Diretivas Ambientais

 Você pode verificar se o aplicativo está sendo executado no ambiente de produção usando a diretiva `@production`:

```blade
@production
    // Production specific content...
@endproduction
```

 Ou você pode determinar se o aplicativo está sendo executado em um ambiente específico usando a diretiva `@env`:

```blade
@env('staging')
    // The application is running in "staging"...
@endenv

@env(['staging', 'production'])
    // The application is running in "staging" or "production"...
@endenv
```

#### Diretivas da secção

 Você pode determinar se uma seção de herança de modelo tem conteúdo usando a diretiva `@hasSection`:

```blade
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

 Você pode usar a diretiva `sectionMissing` para determinar se uma seção não tem conteúdo:

```blade
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

#### Diretivas da sessão

 A diretiva `@session` pode ser usada para determinar se um valor de sessão existe. Se o valor da sessão existir, os conteúdos do modelo dentro das diretivas `@session` e `@endsession` serão avaliados. Dentro dos conteúdos da diretiva `@session`, você pode ecoar a variável `$value` para mostrar o valor da sessão:

```blade
@session('status')
    <div class="p-4 bg-green-100">
        {{ $value }}
    </div>
@endsession
```

### Alternância de Etiquetação

 As instruções do tipo `@switch`, `@case`, `@break`, `@default` e `@endswitch` permitem a construção de declarações `switch`:

```blade
@switch($i)
    @case(1)
        First case...
        @break

    @case(2)
        Second case...
        @break

    @default
        Default case...
@endswitch
```

### Laços

 Além das declarações condicionais, o Blade oferece diretivas simples para trabalhar com estruturas de loop do PHP. Novamente, cada uma dessas diretivas funciona da mesma forma que as correspondentes no PHP:

```blade
@for ($i = 0; $i < 10; $i++)
    The current value is {{ $i }}
@endfor

@foreach ($users as $user)
    <p>This is user {{ $user->id }}</p>
@endforeach

@forelse ($users as $user)
    <li>{{ $user->name }}</li>
@empty
    <p>No users</p>
@endforelse

@while (true)
    <p>I'm looping forever.</p>
@endwhile
```

 > [!ATENÇÃO]
 Use a variável do laço [#the-loop-variable](@ref loop-variables) para obter informações valiosas sobre o laço, como saber se você está na primeira ou última iteração do laço.

 Ao utilizar bucles, pode também ignorar a iteração atual ou terminar o loop usando as diretivas `@continue` e `@break`:

```blade
@foreach ($users as $user)
    @if ($user->type == 1)
        @continue
    @endif

    <li>{{ $user->name }}</li>

    @if ($user->number == 5)
        @break
    @endif
@endforeach
```

 Pode também incluir a condição de continuação ou interrupção na declaração da diretiva:

```blade
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

### A variável do laço

 Ao interagir com um loop `foreach`, existe uma variável `$loop` que permite acessar informações úteis, como o índice atual do loop e se é a primeira ou última iteração:

```blade
@foreach ($users as $user)
    @if ($loop->first)
        This is the first iteration.
    @endif

    @if ($loop->last)
        This is the last iteration.
    @endif

    <p>This is user {{ $user->id }}</p>
@endforeach
```

 Se você estiver em um laço aninhado, poderá acessar a variável do laço pai através da propriedade `parent`:

```blade
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

 A variável `$loop` também inclui várias outras propriedades úteis:

|  Bens |  Descrição |
|--------------------|--------------------------------------------------------|
|  `index($loop)` |  O índice da iteração corrente do laço (começa em 0). |
|  `$loop->iteração` |  A iteração do loop atual (começa em 1). |
|  `$loop->remaining` |  As iterações remanescentes na loop. |
|  `contagem($loop)` |  O número total de itens na matriz que está sendo iterada. |
|  `$loop->first` |  Se esta é a primeira execução do loop. |
|  `$loop->ultimo` |  Se esta é a última iteração do laço. |
|  `$loop->par` |  Se esta é uma iteração par ou ímpar no decorrer do laço. |
|  `$loop->par’ |  Se essa é uma iteração estranha da loop. |
|  `$loop->depth` |  Nível de nidificação da loop atual. |
|  `$loop->parent` |  Quando numa loop aninhada, a variável da loop principal. |

### Categorias e estilos condicionais

 A diretiva `@class` compila condicionalmente uma string de classe CSS. A diretiva aceita um array de classes onde a chave do array contém a(s) classe(s) que você deseja adicionar, ao passo que o valor é uma expressão boolean. Se o elemento do array tiver uma chave numérica, ele será sempre incluído na lista de classes renderizadas:

```blade
@php
    $isActive = false;
    $hasError = true;
@endphp

<span @class([
    'p-4',
    'font-bold' => $isActive,
    'text-gray-500' => ! $isActive,
    'bg-red' => $hasError,
])></span>

<span class="p-4 text-gray-500 bg-red"></span>
```

 Da mesma forma, a diretiva `@style` pode ser usada para adicionar condicionalmente estilos CSS em linha a um elemento HTML:

```blade
@php
    $isActive = true;
@endphp

<span @style([
    'background-color: red',
    'font-weight: bold' => $isActive,
])></span>

<span style="background-color: red; font-weight: bold;"></span>
```

### Atributos adicionais

 Para maior conveniência, você pode usar a diretiva `@checked` para indicar facilmente se um determinado campo de rádio ou caixa de seleção HTML está "marcado". Essa diretiva irá mostrar `checked` se a condição for `true`:

```blade
<input type="checkbox"
        name="active"
        value="active"
        @checked(old('active', $user->active)) />
```

 Da mesma forma, pode ser utilizada a diretiva `@selected` para indicar se uma opção de seleção deve estar "selecionada":

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

 Além disso, pode ser utilizada a diretiva `@disabled` para indicar se um determinado elemento deve estar "inativo":

```blade
<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>
```

 Além disso, a diretiva `@readonly` pode ser utilizada para indicar se um determinado elemento deverá ser "não-editável":

```blade
<input type="email"
        name="email"
        value="email@laravel.com"
        @readonly($user->isNotAdmin()) />
```

 Além disso, a diretiva `@required` pode ser utilizada para indicar se um determinado elemento é "obrigatório":

```blade
<input type="text"
        name="title"
        value="title"
        @required($user->isAdmin()) />
```

### Incluindo sub-vídeos

 > [!OBSERVAÇÃO]
 As classes ([Componentes](#componentes) fornecem funcionalidade semelhante e oferecem vários benefícios em relação à diretiva `@include`, como ligação de dados e atributos.

 A diretiva @include do Blade permite-lhe incluir uma visualização de Blade numa outra visualização. As variáveis que estão disponíveis na visualização principal estarão também disponíveis na visualização incluída:

```blade
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```

 Apesar da visualização incluída herdar todos os dados disponíveis na visualização pai, você também poderá passar um array de dados adicionais que serão disponibilizados à visualização incluída.

```blade
@include('view.name', ['status' => 'complete'])
```

 Se você tentar incluir uma vista que não existe, o Laravel irá exibir um erro. Se você deseja incluir uma vista que pode ou não estar presente, você deve usar a diretiva `@includeIf`:

```blade
@includeIf('view.name', ['status' => 'complete'])
```

 Se quiser incluir uma visualização se uma expressão booleana dada for `verdadeira` ou `falsa`, pode utilizar as diretivas `@includeWhen` e `@includeUnless`:

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

 Para incluir o primeiro visual existente numa determinada sequência de visualizações, pode utilizar a diretiva `includeFirst`:

```blade
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

 > [!AVISO]
 > Devemos evitar o uso das constantes `__DIR__` e `__FILE__` em nossas visualizações do Blade pois elas remetem à localização da visualização compilada e que está sendo utilizada naquele momento.

#### Exibição de visuais para coleções

 É possível combinar loops e inclui em uma linha com a diretiva `@each` do Blade:

```blade
@each('view.name', $jobs, 'job')
```

 O primeiro argumento da diretiva `@each` é a visualização a ser renderizada para cada elemento no array ou coleção. O segundo argumento é o array ou coleção que você deseja iterar, enquanto o terceiro argumento é o nome de variável que receberá o valor atual da iteração na visualização. Assim, por exemplo, se você estiver iterando um array de "jobs" (trabalhos), normalmente desejará acessar cada trabalho como uma variável "job". A chave do array para a iteração atual estará disponível na variável `key` da visualização.

 Você também pode passar um quarto argumento à diretiva `@each`. Este argumento define o modelo que será renderizado se o array especificado estiver vazio.

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

 > [Atenção]
 > As vistas renderizadas por meio de `@each` não herdam as variáveis da vista pai. Se a vista filha necessitar dessas variáveis, você deve usar as diretivas `@foreach` e `@include`.

### A Diretiva `@once`

 A diretiva `@once` permite-lhe definir uma parte do modelo que só será executada uma vez por ciclo de representação. Isto poderá ser útil para empurrar um determinado pedaço de JavaScript para a parte superior da página usando [pilhas](#pilhas). Por exemplo, se estiver a representar um determinado [componente](#componentes) numa loop, poderá querer empurrar o JavaScript para a parte superior apenas na primeira vez que o componente for representado:

```blade
@once
    @push('scripts')
        <script>
            // Your custom JavaScript...
        </script>
    @endpush
@endonce
```

 Uma vez que a diretiva `@once` é usada com frequência em conjunto com as diretivas `@push` ou `@prepend`, estão disponíveis as diretivas `@pushOnce` e `@prependOnce`:

```blade
@pushOnce('scripts')
    <script>
        // Your custom JavaScript...
    </script>
@endPushOnce
```

### Programação no nível básico

 Em algumas situações, é útil inserir código PHP em suas visualizações. Você pode usar a diretiva Blade `@php` para executar um bloco de código PHP simples no seu modelo:

```blade
@php
    $counter = 1;
@endphp
```

 Ou se você só precisa usar o PHP para importar uma classe, pode usar a diretiva `@use`:

```blade
@use('App\Models\Flight')
```

 Um segundo argumento pode ser fornecido à diretiva `@use` para criar um alias da classe importada:

```php
@use('App\Models\Flight', 'FlightModel')
```

### Comentários

 Além disso, o Blade permite que você defina comentários em suas vistas. No entanto, ao contrário dos comentários do HTML, os comentários do Blade não são incluídos no HTML devolvido pela sua aplicação:

```blade
{{-- This comment will not be present in the rendered HTML --}}
```

## Componentes

 Os componentes e os slots fornecem benefícios semelhantes aos seções, layouts e inclui; no entanto, alguns podem considerar que o modelo mental dos componentes e slots é mais fácil de compreender. Existem duas abordagens para escrever componentes: componentes com base em classes e componentes anónimos.

 Para criar um componente baseado em classes, pode utilizar o comando de linha de comandos `make:component`. Para ilustrar a utilização de componentes, criaremos um simples componente `Alert`. O comando `make:component` colocará o componente no diretório `app/View/Components`:

```shell
php artisan make:component Alert
```

 O comando `make:component` também criará um modelo de visualização para o componente. A visualização será colocada na pasta `resources/views/components`. Para os componentes da sua própria aplicação, normalmente não é necessário proceder a qualquer tipo de registo do mesmo, uma vez que os mesmos são automaticamente descobertos nas pastas `app/View/Components` e `resources/views/components`.

 Você também pode criar componentes dentro de subdiretórios:

```shell
php artisan make:component Forms/Input
```

 Comando acima irá criar um componente `Input` na pasta `app/View/Components/Forms`, e a vista será colocada na pasta `resources/views/components/forms`.

 Se você desejar criar um componente anônimo (um componente com apenas um modelo Blade e sem nenhuma classe), poderá usar a marca --view ao invocar o comando `make:component`:

```shell
php artisan make:component forms.input --view
```

The command above will create a Blade file at `resources/views/components/forms/input.blade.php` which can be rendered as a component via `<x-forms.input />`.

#### Registo Manual de Componentes do Pacote

 Quando você escreve componentes para seu próprio aplicativo, esses componentes são descobertos automaticamente nas pastas `app/View/Components` e `resources/views/components`.

 No entanto, se estiver criando um pacote que utiliza os componentes Blade, precisará de registar manualmente a sua classe de componentes e o seu alias HTML tag. Normalmente, deve registar os seus componentes no método `boot` do fornecedor do serviço do seu pacote:

```php
    use Illuminate\Support\Facades\Blade;

    /**
     * Bootstrap your package's services.
     */
    public function boot(): void
    {
        Blade::component('package-alert', Alert::class);
    }
```

 Após a validação do seu componente, você poderá renderizá-lo utilizando o seu alias de tag:

```blade
<x-package-alert/>
```

 Como alternativa, você pode usar o método `componentNamespace` para fazer o auto carregamento de classes de componentes por convenção. Por exemplo, um pacote com a extensão Nightshade poderia ter os componentes Calendar e ColorPicker que ficam dentro do namespace Package\Views\Components:

```php
    use Illuminate\Support\Facades\Blade;

    /**
     * Bootstrap your package's services.
     */
    public function boot(): void
    {
        Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
    }
```

 Isso permite o uso de componentes do pacote pelo seu namespace do fornecedor usando a sintaxe `package-name::`:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

 O Blade irá, automaticamente, detetar a classe associada a este componente baseando-se no nome dele, utilizando uma notação Pascal. Os subdiretórios são também suportados utilizando notação ponto (dot).

### Componentes de renderização

 Para exibir um componente, você pode usar uma tag de componente Blade dentro de um de seus modelos Blade. As tags de componentes Blade começam com a palavra-chave `x-` seguida pelo nome do componente em caixa baixa:

```blade
<x-alert/>

<x-user-profile/>
```

 Se a classe de componentes estiver aninhada mais profundamente no diretório `app/View/Components`, pode utilizar o caractere `.` para indicar a aninhamento de diretórios. Por exemplo, supondo que um componente esteja localizado em `app/View/Components/Inputs/Button.php`, pode renderizá-lo da seguinte forma:

```blade
<x-inputs.button/>
```

 Se você desejar renderizar condicionalmente seu componente, poderá definir um método `shouldRender` na classe do componente. Se o método `shouldRender` retornar `false`, o componente não será renderizado:

```php
    use Illuminate\Support\Str;

    /**
     * Whether the component should be rendered
     */
    public function shouldRender(): bool
    {
        return Str::length($this->message) > 0;
    }
```

### Passagem de dados para componentes

 Você pode passar dados para os componentes Blade usando atributos de HTML. Valores primitivos codificados com caractere de byte podem ser passados para o componente usando strings simples como atributos HTML. Expressões e variáveis PHP devem ser passadas ao componente por meio de atributos que utilizam o símbolo `:` como prefixo:

```blade
<x-alert type="error" :message="$message"/>
```

 É recomendável definir todos os atributos de dados do componente no construtor da sua classe. Todas as propriedades públicas disponíveis em um componente serão automaticamente disponibilizadas na visualização. Não é necessário passar os dados para a visualização pelo método `render` do componente:

```php
    <?php

    namespace App\View\Components;

    use Illuminate\View\Component;
    use Illuminate\View\View;

    class Alert extends Component
    {
        /**
         * Create the component instance.
         */
        public function __construct(
            public string $type,
            public string $message,
        ) {}

        /**
         * Get the view / contents that represent the component.
         */
        public function render(): View
        {
            return view('components.alert');
        }
    }
```

 Ao renderizar seu componente, você pode exibir o conteúdo das variáveis públicas do seu componente ecoando-as pelo nome:

```blade
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

#### Casing

 Os argumentos de um construtor de componente devem ser especificados com "camelCase", ao passo que o "kebab-case" deve ser utilizado para referenciar os nomes dos argumentos nos atributos HTML. Por exemplo, dados os seguintes componentes:

```php
    /**
     * Create the component instance.
     */
    public function __construct(
        public string $alertType,
    ) {}
```

 O argumento `$alertType` pode ser fornecido ao componente da seguinte maneira:

```blade
<x-alert alert-type="danger" />
```

#### Síntaxe de atributos curta

 Ao passar atributos para componentes, você também pode usar uma sintaxe de "atributo curto". Isso geralmente é mais conveniente, pois o nome do atributo costuma corresponder ao nome da variável a que ele se refere:

```blade
{{-- Short attribute syntax... --}}
<x-profile :$userId :$name />

{{-- Is equivalent to... --}}
<x-profile :user-id="$userId" :name="$name" />
```

#### Fugindo da apresentação de atributos

 Como alguns frameworks de JavaScript, como o Alpine.js, também usam atributos com um sinal de igual (=), você poderá usar um sinal duplo (::) para indicar ao Blade que esse não é um expressão PHP. Por exemplo:

```blade
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

 O seguinte HTML será executado pelo Blade:

```blade
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

#### Métodos de componentes

 Além das variáveis públicas estarem disponíveis para o modelo de componente, é possível invocar quaisquer métodos públicos do mesmo. Por exemplo, suponhamos que um componente tenha um método `isSelected`:

```php
    /**
     * Determine if the given option is the currently selected option.
     */
    public function isSelected(string $option): bool
    {
        return $option === $this->selected;
    }
```

 Você pode executar esse método a partir do modelo de seu componente, chamando-o da variável que corresponde ao nome do método:

```blade
<option {{ $isSelected($value) ? 'selected' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

#### Acessando atributos e slots dentro de classes de componentes

 Com componentes de Blade também é possível acessar o nome do componente, atributos e slot no método render da classe. No entanto, para obter esses dados, você deve retornar um fecho de sua função `render`. O fecho receberá como único argumento uma matriz `$data`. Essa matriz contém várias informações sobre o componente.
 elementos que fornecem informações sobre o componente:

```php
    use Closure;

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): Closure
    {
        return function (array $data) {
            // $data['componentName'];
            // $data['attributes'];
            // $data['slot'];

            return '<div>Components content</div>';
        };
    }
```

The `componentName` is equal to the name used in the HTML tag after the `x-` prefix. So `<x-alert />`'s `componentName` will be `alert`. The `attributes` element will contain all of the attributes that were present on the HTML tag. The `slot` element is an `Illuminate\Support\HtmlString` instance with the contents of the component's slot.

 O comando de encerramento deve retornar uma cadeia de caracteres. Se a cadeia correspondente corresponder a uma visualização existente, essa visualização será renderizada. Caso contrário, a cadeia é avaliada como visualização Blade em linha.

#### Dependências adicionais

 Se o seu componente tiver dependências do [conjunto de serviços Laravel] (/docs/{{ version }}/container), você poderá incluí-las antes de todos os atributos de dados do componente, que serão automaticamente injetados pelo conjunto de serviços:

```php
use App\Services\AlertCreator;

/**
 * Create the component instance.
 */
public function __construct(
    public AlertCreator $creator,
    public string $type,
    public string $message,
) {}
```

#### Esconder atributos/métodos

 Se você deseja impedir que alguns métodos ou propriedades públicas sejam expostos como variáveis no modelo do componente, poderá adicioná-los a uma propriedade de array chamada `$except` em seu componente.

```php
    <?php

    namespace App\View\Components;

    use Illuminate\View\Component;

    class Alert extends Component
    {
        /**
         * The properties / methods that should not be exposed to the component template.
         *
         * @var array
         */
        protected $except = ['type'];

        /**
         * Create the component instance.
         */
        public function __construct(
            public string $type,
        ) {}
    }
```

### Atributos de componentes

 Já estudamos o envio de atributos de dados para um componente; no entanto, por vezes poderão ser necessários especificar atributos HTML adicionais, tais como "class", que não façam parte dos dados necessários para o bom funcionamento do componente. Normalmente, você deseja enviar estes atributos adicionais ao elemento raiz do modelo de componente. Por exemplo, imagine-se que desejamos renderizar um componente "alert":

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```

 Todos os atributos que não fazem parte do construtor da componente serão automaticamente adicionados ao "attribute bag" (mochila de atributos) da mesma. Este "attribute bag" é disponibilizado automaticamente à componente através da variável `$attributes`. Todos os atributos podem ser renderizados na componente, ecoando esta variável:

```blade
<div {{ $attributes }}>
    <!-- Component content -->
</div>
```

 > [ATENÇÃO]
> Using directives such as `@env` within component tags is not supported at this time. For example, `<x-alert :live="@env('production')"/>` will not be compiled.

#### Atributos por padrão/fusionados

 Às vezes, pode ser necessário especificar valores padrão para atributos ou unir valores adicionais a alguns dos atributos de um componente. Para realizar isto, utilize o método `merge` da sacola de atributos. Este método é especialmente útil na definição de um conjunto de classes CSS padrão que devem sempre ser aplicadas a um componente:

```blade
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

 Se assumirmos que este componente é utilizado da seguinte forma:

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

 O HTML renderizado da componente aparecerá como o seguinte:

```blade
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

#### Fusão condicional de classes

 Às vezes poderá querer juntar classes se uma determinada condição for `true`. Pode fazer-se através do método `class`, que aceita um array de classes. O índice do array contém a classe ou as classes que pretende adicionar, enquanto o valor é uma expressão boolean. Se o elemento do array tiver um índice numérico, será sempre incluído na lista de classes gerada:

```blade
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

 Se você precisar mesclar outros atributos em seu componente, poderá utilizar a ordem `class`-> `merge`:

```blade
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

 > [!NOTA]
 [Diretiva `@class`](#conditional-classes).

#### Fundido de atributos não classificados

 Ao fundir atributos que não são atributos de "class", os valores fornecidos ao método `merge` serão considerados como valores "padrão" do atributo. No entanto, diferente do atributo `class`, estes atributos não serão fundidos com valores de atributos injetados, mas sim, sobrescritos. Por exemplo, a implementação de um componente "button" pode ter o seguinte aspeto:

```blade
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

 Para tornar o componente de botão com um tipo personalizado, ele pode ser especificado durante a utilização do componente. Se não for especificado nenhum tipo, será utilizado o tipo "botão":

```blade
<x-button type="submit">
    Submit
</x-button>
```

 O HTML renderizado da componente `button` neste exemplo seria:

```blade
<button type="submit">
    Submit
</button>
```

 Se pretender que um atributo diferente de `class` tenha o seu valor padrão e valores injetados juntos, poderá usar a método `prepends`. Neste exemplo, o atributo `data-controller` começará sempre por `profile-controller` e quaisquer outros valores injetados do `data-controller` serão inseridos depois deste valor padrão:

```blade
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

#### Recuperando e filtrando atributos

 Você pode filtrar os atributos usando o método `filter`. Esse método aceita um fechamento que deve retornar `true` se você deseja manter o atributo no saco de atributos:

```blade
{{ $attributes->filter(fn (string $value, string $key) => $key == 'foo') }}
```

 Para conveniência, você pode usar o método `whereStartsWith` para recuperar todos os atributos cujos nomes começam com uma determinada string.

```blade
{{ $attributes->whereStartsWith('wire:model') }}
```

 Por outro lado, o método `whereDoesntStartWith` pode ser utilizado para excluir todos os atributos cujos nomes começam com uma determinada string.

```blade
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

 Usando o método `first`, você pode exibir o primeiro atributo em uma sacola de atributos especificada:

```blade
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

 Se você deseja verificar se um atributo está presente no componente, poderá usar o método `has`. Esse método aceita como único argumento o nome do atributo e retorna uma booleana que indica se o atributo está ou não presente:

```blade
@if ($attributes->has('class'))
    <div>Class attribute is present</div>
@endif
```

 Se um array for passado ao método `has`, este irá determinar se todos os atributos apresentados estão presentes no componente:

```blade
@if ($attributes->has(['name', 'class']))
    <div>All of the attributes are present</div>
@endif
```

 O método `hasAny` pode ser utilizado para determinar se existem atributos do componente ou se são nulos:

```blade
@if ($attributes->hasAny(['href', ':href', 'v-bind:href']))
    <div>One of the attributes is present</div>
@endif
```

 Você pode recuperar o valor de um atributo específico usando o método `get`:

```blade
{{ $attributes->get('class') }}
```

### Palavras-chave reservadas

 Por padrão, algumas palavras-chave são reservadas para uso interno do Blade para a renderização de componentes. As seguintes palavras-chave não podem ser definidas como propriedades públicas ou nomes de métodos dentro dos seus componentes:

<div class="content-list" markdown="1">

 - `data`
 `- 'rendimento'
 - `resolveView`:
 - ``deveriaRender``
 - `visualizar`
 - ``com atributos``
 - `withName`

</div>


### Slot machines

 Freqüentemente será necessário transmitir conteúdo adicional para seu componente por meio de "vagas". As vagas do componente são renderizadas ecoando a variável `$slot`. Para explorar este conceito, imaginemos que um componente `alert` tem o seguinte mark-up:

```blade
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

 Podemos transmitir conteúdo ao slot injetando conteúdo no componente:

```blade
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

 Às vezes, um componente pode precisar renderizar vários slots diferentes em locais diferentes dentro do componente. Vamos modificar nosso componente de alerta para permitir a injeção de um slot "title":

```blade
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

 Você pode definir o conteúdo do espaço nomeado usando a tag `x-slot`. Qualquer conteúdo não dentro de uma tag explícita `x-slot` será enviada para a componente na variável `$slot`:

```xml
<x-alert>
    <x-slot:title>
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

 É possível invocar o método `isEmpty` de um slot para determinar se ele contém conteúdo:

```blade
<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    @if ($slot->isEmpty())
        This is default content if the slot is empty.
    @else
        {{ $slot }}
    @endif
</div>
```

 Além disso, o método `hasActualContent` pode ser utilizado para determinar se a slot contém um conteúdo "real", que não seja um comentário HTML.

```blade
@if ($slot->hasActualContent())
    The scope has non-comment content.
@endif
```

#### Slot de escopo

 Se você tiver utilizado um framework JavaScript como Vue, conhecerá os "slots contextuais", que permitem o acesso a dados ou métodos de uma componente dentro do seu slot. Pode obter um comportamento semelhante em Laravel definindo métodos públicos ou propriedades na sua componente e acedendo à componente dentro do seu slot através da variável `$component`. Neste exemplo, assumiremos que o componente `x-alert` tem um método público `formatAlert`, definido na classe de componente:

```blade
<x-alert>
    <x-slot:title>
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

#### Atributos de slot

 Assim como é possível atribuir componentes de Blade, você pode atribuir atributos adicionais para vagas, como nomes de classe CSS.

```xml
<x-card class="shadow-sm">
    <x-slot:heading class="font-bold">
        Heading
    </x-slot>

    Content

    <x-slot:footer class="text-sm">
        Footer
    </x-slot>
</x-card>
```

 Para interagir com os atributos de um slot, pode aceder à propriedade `attributes` da variável do slot. Consulte mais informações sobre como interagir com atributos na documentação de [atributos dos componentes] ():

```blade
@props([
    'heading',
    'footer',
])

<div {{ $attributes->class(['border']) }}>
    <h1 {{ $heading->attributes->class(['text-lg']) }}>
        {{ $heading }}
    </h1>

    {{ $slot }}

    <footer {{ $footer->attributes->class(['text-gray-700']) }}>
        {{ $footer }}
    </footer>
</div>
```

### Visualizações de componentes em linha

 Para componentes muito pequenos, pode ser incômodo gerenciar tanto a classe de componente quanto o modelo do visualizador. Por isso, você pode retornar a marcação do componente diretamente da método `render`:

 /**
 * Obter a visualização/conteúdo que representa a componente.
 */
 função pública render(): String
 {
 return <<<'Blade'
            <div class="alert alert-danger">
 {{ $slot }}
            </div>
 lâmina;
 }

#### Gerar componentes de visualização em linha

 Para criar uma componente que renderiza um visual in-line, você pode usar a opção "inline" ao executar o comando `make:component`:

```shell
php artisan make:component Alert --inline
```

### Componentes Dinâmicos

 Às vezes você pode precisar renderizar um componente, mas não sabe qual é o componente que deve ser renderizado até o momento de execução. Nesta situação, você pode usar o componente integrado ao Laravel chamado `dynamic-component` para renderizar o componente com base em um valor ou variável no momento da execução:

```blade
// $componentName = "secondary-button";

<x-dynamic-component :component="$componentName" class="mt-4" />
```

### Registo manual de componentes

 > [AVISO]
 > A documentação sobre registo manual de componentes aplica-se principalmente àqueles que estão a escrever pacotes Laravel que incluem componentes de visualização. Se não estiver a criar um pacote, esta parte da documentação do componente pode não ser relevante para si.

 Ao escrever componentes para o seu próprio aplicativo, os componentes são descobertos automaticamente nas diretórias `app/View/Components` e `resources/views/components`.

 No entanto, se estiver a criar um pacote que utiliza componentes Blade ou pretende colocar os componentes em diretórios não convencionais, necessitará de registar manualmente sua classe de componentes e seu alias HTML de etiqueta para garantir que o Laravel saiba onde procurar o componente. Normalmente, deve registar os seus componentes no método `boot` do provedor de serviços do pacote:

```php
    use Illuminate\Support\Facades\Blade;
    use VendorPackage\View\Components\AlertComponent;

    /**
     * Bootstrap your package's services.
     */
    public function boot(): void
    {
        Blade::component('package-alert', AlertComponent::class);
    }
```

 Uma vez que seu componente tenha sido registrado, você poderá renderizá-lo utilizando um de seus aliases de tag:

```blade
<x-package-alert/>
```

#### Carregamento automático de componentes do pacote

 Alternativamente, você pode usar o método `componentNamespace` para carregar componentes por convenção. Por exemplo, um pacote `Nightshade` pode ter os componentes `Calendar` e `ColorPicker`, que ficam dentro do namespace `Package\Views\Components`:

```php
    use Illuminate\Support\Facades\Blade;

    /**
     * Bootstrap your package's services.
     */
    public function boot(): void
    {
        Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
    }
```

 Isto permite a utilização de componentes do pacote pelo seu próprio nome de espaço de nomes, usando a sintaxe `package-name::`:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

 O Blade vai detetar automaticamente a classe ligada a esse componente através da construção em Pascal do nome do componente. Os subdiretórios também são suportados, utilizando a notação "ponto".

## Componentes anónimos

 Semelhante aos componentes em linha, os componentes anônimos proporcionam um mecanismo para gerenciar um componente por meio de um único arquivo. No entanto, os componentes anônimos utilizam apenas um arquivo de visualização e não têm nenhuma classe associada. Para definir um componente anônimo, você só precisa incluir uma matriz template Blade em sua pasta `resources/views/components`. Por exemplo, supondo que você tenha definido um componente como `resources/views/components/alert.blade.php`, você pode renderizá-lo da seguinte maneira:

```blade
<x-alert/>
```

 Você pode usar o caractere `.` para indicar se um componente está aninhado dentro da pasta `components`. Por exemplo, supondo que o componente esteja definido em `resources/views/components/inputs/button.blade.php`, você poderá renderizá-lo do seguinte modo:

```blade
<x-inputs.button/>
```

### Componentes de índice anónimos

 Por vezes, quando uma componente é constituída por muitos modelos de Blade, pode ser desejável agrupar os modelos da dada componente num único diretório. Por exemplo, imagine uma componente "accordion" com a seguinte estrutura de diretórios:

```none
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

 Essa estrutura de diretório permite que você monte o componente "acordeão" e seus elementos da seguinte maneira:

```blade
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

 No entanto, para executar a componente de acordeão através do `x-accordeon`, fomos obrigados a colocar o modelo da "index" na pasta `resources/views/components` em vez de aninhá-lo dentro da pasta `accordion`.

 Felizmente, o Blade permite que você coloque um arquivo `index.blade.php` dentro do diretório de modelos de um componente. Se houver um modelo `index.blade.php` para o componente, ele será renderizado como o nó "raiz" do componente. Assim, podemos continuar usando a mesma sintaxe Blade apresentada no exemplo acima; porém, precisaremos ajustar nossa estrutura de diretórios da seguinte forma:

```none
/resources/views/components/accordion/index.blade.php
/resources/views/components/accordion/item.blade.php
```

### Propriedades e atributos dos dados

 Como as componentes anônimas não têm nenhuma classe associada, você pode se perguntar como definir quais dados devem ser passados para a componente como variáveis e quais atributos devem ser colocados na [sacola de atributos da componente](#component-attributes).

 Pode especificar quais atributos devem ser considerados variáveis de dados utilizando a diretiva `@props` na parte superior do modelo Blade do seu componente. Todos os outros atributos no componente estarão disponíveis através da sacola de atributos do mesmo. Se pretender fornecer uma variável de dados com um valor por defeito, pode especificar o nome da variável como chave do array e o seu valor predefinido como valor do array:

```blade
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

 Considerando a definição da componente acima, podemos renderizar a mesma da seguinte forma:

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

### Acessando dados de pais

Sometimes you may want to access data from a parent component inside a child component. In these cases, you may use the `@aware` directive. For example, imagine we are building a complex menu component consisting of a parent `<x-menu>` and child `<x-menu.item>`:

```blade
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

The `<x-menu>` component may have an implementation like the following:

```blade
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

Because the `color` prop was only passed into the parent (`<x-menu>`), it won't be available inside `<x-menu.item>`. However, if we use the `@aware` directive, we can make it available inside `<x-menu.item>` as well:

```blade
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

 > [!AVISO]
 > A diretiva `@aware` não tem acesso aos dados do nível superior que não tenham sido explicitamente passados à componente de nível superior através dos atributos HTML. Os valores padrão `@props`, que não tenham sido explicitamente passados à componente de nível superior, não são acedidos pela diretiva `@aware`.

### Caminhos de componentes anónimos

 Como discutido anteriormente, normalmente os componentes anónimos são definidos colocando um modelo Blade na pasta `resources/views/components`. No entanto, ocasionalmente poderá querer registar outros caminhos de componentes anónimos no Laravel em adição ao caminho padrão.

 O método `anonymousComponentPath` aceita o "path" para a localização do componente anônimo como seu primeiro argumento e um namespace opcional sob o qual os componentes devem ser colocados como seu segundo argumento. Tipicamente, esse método deve ser chamado do método `boot` de um dos [fornecedores de serviços](/docs/latest/providers) da sua aplicação:

```php
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::anonymousComponentPath(__DIR__.'/../components');
    }
```

 Quando os caminhos dos componentes são registrados sem um prefisso especificado como no exemplo acima, eles também podem ser renderizados nos seus componentes Blade sem um correspondente prefisso. Por exemplo, se existir um componente `panel.blade.php` no caminho registrado acima, ele poderá ser renderizado da seguinte maneira:

```blade
<x-panel />
```

 O prefixo "namespace" pode ser fornecido como o segundo argumento ao método `anonymousComponentPath`:

```php
    Blade::anonymousComponentPath(__DIR__.'/../components', 'dashboard');
```

 Quando um prefixo é fornecido, os componentes dentro daquele "espaço de nome" podem ser renderizados usando o prefixo junto ao namespace do componente e o nome do componente quando este for renderizado:

```blade
<x-dashboard::panel />
```

## Organização do edifício

### Layouts usando componentes

 A maioria dos aplicativos da Web mantêm o mesmo formato geral através de várias páginas. Seria incrivelmente complicado e difícil manter nosso aplicativo se tivéssemos que repetir o layout HTML completo em cada visualização que criamos. Felizmente, é conveniente definir esse formato como um único [Componente Blade (# componentes)] e, em seguida, usá-lo por todo o aplicativo.

#### Definindo o componente de layout

 Por exemplo, imagine que estamos construindo um aplicativo de lista "todo". Podemos definir um componente `layout` que se assemelha ao seguinte:

```blade
<!-- resources/views/components/layout.blade.php -->

<html>
    <head>
        <title>{{ $title ?? 'Todo Manager' }}</title>
    </head>
    <body>
        <h1>Todos</h1>
        <hr/>
        {{ $slot }}
    </body>
</html>
```

#### Aplicando o componente de layout

 Definida a componente `layout`, podemos criar uma vista Blade que utilize essa composição. Neste exemplo, definimos uma simples vista que mostra nossa lista de tarefas:

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
```

 Lembre-se que o conteúdo inserido em um componente será fornecido para a variável padrão `$slot` no nosso componente `layout`. Como você deve ter reparado, nosso `layout` também respeita um slot de título se houver um; caso contrário, o título padrão é mostrado. Podemos injetar um título personalizado da nossa visualização de lista de tarefas usando o sintaxe de slot padronizado discutido na [documentação do componente](/#components):

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    <x-slot:title>
        Custom Title
    </x-slot>

    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
```

 Agora que definimos nossos layouts e as visões de tarefas, só precisamos devolver a visualização "tarefa" de uma rota:

```php
    use App\Models\Task;

    Route::get('/tasks', function () {
        return view('tasks', ['tasks' => Task::all()]);
    });
```

### Layouts usando a Herança de Modelo

#### Definição de um layout

 Os layouts também podem ser criados através da "herança de modelo". Esta foi a forma mais utilizada para a construção de aplicações antes da introdução dos componentes.

 Vamos começar com um exemplo simples. Primeiro, vamos examinar o layout da página. Como a maioria das aplicações web mantém o mesmo layout geral em várias páginas, é conveniente definir esse layout como uma única visualização Blade:

```blade
<!-- resources/views/layouts/app.blade.php -->

<html>
    <head>
        <title>App Name - @yield('title')</title>
    </head>
    <body>
        @section('sidebar')
            This is the master sidebar.
        @show

        <div class="container">
            @yield('content')
        </div>
    </body>
</html>
```

 Como pode ver, este arquivo contém uma marcação HTML típica. No entanto, note as diretivas "@section" e "@yield". A diretiva "@section", tal como o nome indica, define uma seção de conteúdo, enquanto a diretiva "@yield" é utilizada para exibir o conteúdo de determinada seção.

 Agora que definimos um modelo para nossa aplicação, vamos definir uma página filha (child page) que herda o modelo.

#### Estendendo um layout

 Ao definir uma visualização de nível inferior, utilize a diretiva Blade `@extends` para especificar que modelo o filho da visualização "herdará". As visualizações que se baseiam em um modelo de layout podem injetar conteúdo nas secções do modelo utilizando as diretivas `@section`. Lembre-se que, tal como indicado no exemplo anterior, a reprodução destes conteúdos nas secções está sujeita ao comando `@yield`:

```blade
<!-- resources/views/child.blade.php -->

@extends('layouts.app')

@section('title', 'Page Title')

@section('sidebar')
    @@parent

    <p>This is appended to the master sidebar.</p>
@endsection

@section('content')
    <p>This is my body content.</p>
@endsection
```

 Neste exemplo, a seção `sidebar` está utilizando a diretiva `@@parent` para anexar (em vez de sobrescrever) o conteúdo à barra lateral do layout. A diretiva `@@parent` será substituída pelo conteúdo do layout quando a visualização for renderizada.

 > [!ATENÇÃO]
 > Ao contrário do exemplo anterior, esta seção `sidebar` termina com `@endsection` em vez de `@show`. O atalho `@endsection` apenas definirá uma seção, ao passo que o `@show` definirá e **imediatamente renderizará** a seção.

 A diretiva `@yield` também aceita um valor padrão como seu segundo parâmetro, e esse valor será renderizado se o bloco de código estiver definido como `undefined`:

```blade
@yield('content', 'Default content')
```

## Formulários

### Campo de CSRF

 Sempre que você definir um formulário HTML em sua aplicação, você deve incluir um campo de token CSRF escondido no formulário para que a middleware de proteção [contra CSRF](/docs/{{version}}/csrf) possa validar o pedido. Você pode usar a diretiva Blade `@csrf` para gerar o campo de token:

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

### Campo Método

 Como os formulários HTML não conseguem fazer solicitações PUT, PATCH ou DELETE, é necessário adicionar um campo `_method` oculto para imitar esses verbos HTTP. A diretiva `@method` do Blade pode criar esse campo:

```blade
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

### Erros de validação

 A diretiva `@error` permite verificar rapidamente se há mensagens de erro de validação para um determinado atributo. Dentro da diretiva `@error`, você pode usar a variável `$message` para exibir a mensagem de erro:

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input id="title"
    type="text"
    class="@error('title') is-invalid @enderror">

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

 Uma vez que a directiva `@error' compile uma declaração "se", pode utilizar a directiva `@else' para exibir o conteúdo quando não existir um erro para um atributo:

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input id="email"
    type="email"
    class="@error('email') is-invalid @else is-valid @enderror">
```

 Pode passar um nome de uma **sacola específica de erros** [no caminho](/docs/{{version}}/validation#named-error-bags) como segundo parâmetro para a diretiva `@error` para recuperar mensagens de erro da validação em páginas que contêm vários formulários:

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input id="email"
    type="email"
    class="@error('email', 'login') is-invalid @enderror">

@error('email', 'login')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

## Pilhas

 O Blade permite que você crie um vetor de pilhas nomeadas, que pode ser renderizado em outra posição ou em outro layout. Isso é particularmente útil para especificar bibliotecas JavaScript exigidas por suas views filhas:

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

 Se você quiser `@pushar` conteúdo se uma expressão booleana determinada for `verdadeira`, poderá usar a diretiva `@pushIf`:

```blade
@pushIf($shouldPush, 'scripts')
    <script src="/example.js"></script>
@endPushIf
```

 Você pode empurrar para uma pilha quantas vezes forem necessárias. Para exibir o conteúdo completo da pilha, passe o nome da pilha para a diretiva `@pilha`:

```blade
<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
```

 Se você pretender adicionar conteúdo no início de uma pilha, você deve usar a diretiva `@prepend`:

```blade
@push('scripts')
    This will be second...
@endpush

// Later...

@prepend('scripts')
    This will be first...
@endprepend
```

## Injeção de Serviços

 A diretiva `@inject` pode ser usada para recuperar um serviço do contêiner de serviços da Laravel. O primeiro argumento passado à diretiva `@inject` é o nome da variável na qual o serviço será alocado, enquanto que o segundo é o nome da classe ou interface do serviço que você deseja resolver:

```blade
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

## Implementação de modelos de lâminas em linha

 Por vezes, pode ser necessário transformar uma string de modelo Blade bruto num HTML válido. Isto pode ser feito utilizando a `render` método fornecido pela faca `Blade`. O método `render` aceita a string do modelo Blade e um array opcional de dados para fornecer ao modelo:

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

 O Laravel executa os modelos Blade inline escrevendo-os para a pasta `storage/framework/views`. Se preferir que o Laravel remova estes ficheiros temporários após a renderização do modelo, pode fornecer o argumento `deleteCachedView` à metodologia:

```php
return Blade::render(
    'Hello, {{ $name }}',
    ['name' => 'Julian Bashir'],
    deleteCachedView: true
);
```

## Implementando fragmentos de lâminas

 Quando usar frameworks de front-end como [Turbo](https://turbo.hotwired.dev/) e [htmx](https://htmx.org/), pode ser necessário, ocasionalmente, retornar apenas uma parte de um modelo Blade dentro da resposta HTTP. Os "fragments" do Blade permitem fazer exatamente isso. Para começar, coloque uma parte do seu modelo Blade dentro das diretivas `@fragment` e `@endfragment`:

```blade
@fragment('user-list')
    <ul>
        @foreach ($users as $user)
            <li>{{ $user->name }}</li>
        @endforeach
    </ul>
@endfragment
```

 Por exemplo, ao renderizar a visualização que utiliza esse modelo, você pode chamar o método `fragment` para especificar que apenas o fragmento especificado deverá ser incluído na resposta HTTP enviada:

```php
return view('dashboard', ['users' => $users])->fragment('user-list');
```

 O método `fragmentIf` permite retornar condicionalmente um fragmento de uma vista com base em uma determinada condição. Caso contrário, será retornado o conteúdo completo da vista:

```php
return view('dashboard', ['users' => $users])
    ->fragmentIf($request->hasHeader('HX-Request'), 'user-list');
```

 As métricas `fragments` e `fragmentsIf` permitem que você retorne múltiplos fragmentos da página na resposta. Os fragmentos são concatenados:

```php
view('dashboard', ['users' => $users])
    ->fragments(['user-list', 'comment-list']);

view('dashboard', ['users' => $users])
    ->fragmentsIf(
        $request->hasHeader('HX-Request'),
        ['user-list', 'comment-list']
    );
```

## Extendendo a lâmina

 O Blade permite a definição de diretivas personalizadas utilizando o método `directive`. Quando o compilador do Blade encontra uma diretiva personalizada, ele chama o callback especificado com o nome da expressão que contém a diretiva.

 O exemplo seguinte cria uma diretiva `@datetime($var)`, que formata um valor de entrada, o qual deve ser uma instância da classe DateTime.

```php
    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Blade;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Register any application services.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            Blade::directive('datetime', function (string $expression) {
                return "<?php echo ($expression)->format('m/d/Y H:i'); ?>";
            });
        }
    }
```

 Como você pode ver, vamos concatenar o método `format` com qualquer expressão passada para a diretiva. Então, nesse exemplo, o código de PHP gerado por essa diretiva será:

```php
    <?php echo ($var)->format('m/d/Y H:i'); ?>
```

 > [AVISO]
 > Após atualizar a lógica de uma diretiva Blade será necessário excluir todas as visualizações armazenadas em cache. As visualizações armazenadas em cache podem ser removidas utilizando o comando `view:clear` do Artisan.

### Echos personalizados

 Se você tentar fazer o "echo" de um objeto usando Blade, o método `__toString` do objeto será acionado. O método [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) é um dos "métodos mágicos" incluídos no PHP. No entanto, às vezes você pode não ter controle sobre o método `__toString` de uma determinada classe, como quando a classe que você está interagindo pertence a uma biblioteca de terceiros.

 Nestas situações, o Blade permite registar um manipulador de eco personalizado para esse tipo específico de objeto. Para conseguir isto, devem ser chamados os métodos `stringable` do Blade. O método `stringable` aceita um fecho que deve indicar o tipo de objecto a responsabilidade do qual é renderizar. Normalmente, o método `stringable` é invocado no âmbito da função `boot` na classe `AppServiceProvider` da aplicação:

```php
    use Illuminate\Support\Facades\Blade;
    use Money\Money;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::stringable(function (Money $money) {
            return $money->formatTo('en_GB');
        });
    }
```

 Depois de definido o seu manipulador personalizado do comando "echo", você pode simplesmente imprimir o objeto em sua modelagem do Blade:

```blade
Cost: {{ $money }}
```

### Asteriscos personalizados em declarações de condicional

 Programar uma diretiva personalizada é por vezes mais complexo do que necessário na definição de declarações condicionais simples e personalizadas. Por esta razão, o Blade fornece um método `Blade::if` que permite definir rapidamente diretivas condicionais personalizadas utilizando closures. Por exemplo, podemos definir uma condicional personalizada que verifique o disco configurado como parâmetro padrão na aplicação. Podemos fazer isto no método `boot` do nosso `AppServiceProvider`:

```php
    use Illuminate\Support\Facades\Blade;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::if('disk', function (string $value) {
            return config('filesystems.default') === $value;
        });
    }
```

 Depois que o condicional personalizado for definido, você poderá usá-lo em seus modelos:

```blade
@disk('local')
    <!-- The application is using the local disk... -->
@elsedisk('s3')
    <!-- The application is using the s3 disk... -->
@else
    <!-- The application is using some other disk... -->
@enddisk

@unlessdisk('local')
    <!-- The application is not using the local disk... -->
@enddisk
```
