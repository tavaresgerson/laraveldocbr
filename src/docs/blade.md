# Blade

## Introdução
O Blade é um motor de templates simples e poderoso incluído no Laravel. Diferente de alguns motores de template PHP, o Blade não o restringe da utilização do código PHP puro nos seus modelos. Na verdade, todos os modelos do Blade são compilados para código PHP puro e armazenados em cache até serem modificados, significando que o Blade não impõe quaisquer sobrecargas à sua aplicação. Os arquivos de template têm normalmente a extensão `.blade.php` e são armazenados no diretório `resources/views`.

É possível retornar views Blade a partir de rotas ou controladores usando o recurso auxiliar global `view`. Claro que, como mencionado na documentação sobre [visualizações](/docs/views), é possível passar dados para a view Blade usando o segundo argumento do recurso auxiliar `view`:

```blade
    Route::get('/', function () {
        return view('greeting', ['name' => 'Finn']);
    });
```

### Sobrecarregando a Blade com o LiveWire
Quer levar os seus templates Blade ao próximo nível e criar interfaces dinâmicas com facilidade? Confira o [Laravel Livewire](https://livewire.laravel.com). O Livewire permite que você escreva componentes Blade, que são aumentados com funcionalidades dinâmicas que normalmente seriam possíveis apenas por meio de frameworks frontend como React ou Vue, fornecendo uma excelente abordagem para criar interfaces frontend modernas e reativas sem as complexidades, renderização do lado do cliente ou etapas de compilação de muitos frameworks JavaScript.

## Mostrar dados
É possível exibir dados que são passados as suas visualizações Blade usando aspas duplas, por exemplo, considerando o seguinte caminho:

```php
    Route::get('/', function () {
        return view('welcome', ['name' => 'Samantha']);
    });
```

Você pode exibir o conteúdo da variável `name` da seguinte maneira:

```blade
Hello, {{ $name }}.
```

::: info NOTA
As instruções de eco `{{ }}` do Blade são enviadas automaticamente através da função `htmlspecialchars` do PHP para evitar ataques XSS.
:::

Você não está limitado ao mostrar o conteúdo das variáveis passadas à view. Você também pode efetuar a impressão dos resultados de qualquer função PHP. Na verdade, você pode inserir qualquer código PHP que desejar dentro da instrução echo da Blade:

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
         * Inicialize qualquer serviço de aplicativo.
         */
        public function boot(): void
        {
            Blade::withoutDoubleEncoding();
        }
    }
```

#### Exibição de dados não encerrados
Por padrão, as declarações de código Blade `{{ }}` são enviadas automaticamente para a função PHP `htmlspecialchars` para evitar ataques XSS. Se você não pretender que os seus dados sejam escapados, poderá utilizar a seguinte sintaxe:

```blade
Hello, {!! $name !!}.
```

::: warning ATENÇÃO
Tenha muito cuidado ao reproduzir conteúdo fornecido por usuários de seu aplicativo. Normalmente, você deve usar a sintaxe das aspas duplas e do caractere de escape para evitar ataques XSS ao exibir dados fornecidos pelo usuário.
:::

### Blade e frameworks javascript
Como muitas estruturas JavaScript também usam chaves "curvas" para indicar que uma determinada expressão deve ser exibida no navegador, você pode usar o símbolo `@` para informar ao mecanismo de renderização do Blade que uma expressão deve permanecer intacta. Por exemplo:

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

No entanto, ao invés de chamar manualmente `json_encode`, você pode usar o método `Illuminate\Support\Js::from`. O método `from` aceita os mesmos argumentos que a função PHP `json_encode`; no entanto, ele garante que o JSON resultante será devidamente escapado para inclusão dentro de citações HTML. O método `from` retorna uma sentença do comando JavaScript `JSON.parse` que converte um objeto ou matriz dados em um objeto JavaScript válido:

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

::: warning ATENÇÃO
Você só deve usar o método `Js::from` para renderizar variáveis existentes como JSON. O template Blade é baseado em expressões regulares e tentar passar uma expressão complexa para a diretiva pode causar falhas inesperadas.
:::

#### A diretiva '@verbatim'
Se você estiver exibindo variáveis de JavaScript em uma grande parte do template, vocÊ poderá envolver o código HTML na diretiva `@verbatim`, para não precisar adicionar um símbolo `@` a cada instrução echo no Blade:

```blade
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

## Diretivas do Blade
Além da herança de templates e exibição de dados, o Blade fornece atalhos convenientes para estruturas de controle comuns do PHP, tais como expressões condicionais e loops. Estes atalhos oferecem uma maneira limpa e concisa de trabalhar com estruturas de controle do PHP, mas permanecem familiares aos seus homólogos do PHP.

### Seções de Condicional
Você pode construir declarações `if` utilizando as diretivas `@if`, `@elseif`, `@else` e `@endif`. Essas diretivas funcionam de maneira idêntica às correspondentes no PHP:

```blade
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

Por conveniência, o Blade também oferece a diretiva `@unless`:

```blade
@unless (Auth::check())
    You are not signed in.
@endunless
```

Além das diretivas condicionais já discutidas, as diretivas `@isset` e `@empty` podem ser utilizadas como atalhos para suas respectivas funções do PHP:

```blade
@isset($records)
    // $records está definido e não é nulo...
@endisset

@empty($records)
    // $records é "empty"...
@endempty
```

#### Diretivas de autenticação
As diretivas `@auth` e `@guest` podem ser utilizadas para determinar rapidamente se o usuário atual está [autenticado](/docs/authentication) ou é um visitante:

```blade
@auth
    // O usuário está autenticado...
@endauth

@guest
    // O usuário não está autenticado...
@endguest
```

Se necessário, você pode especificar a verificação de autenticação ao usar as diretivas `@auth` e `@guest`:

```blade
@auth('admin')
    // O usuário está autenticado...
@endauth

@guest('admin')
    // O usuário não está autenticado...
@endguest
```

#### Diretivas Ambientais
Você pode verificar se o aplicativo está sendo executado no ambiente de produção usando a diretiva `@production`:

```blade
@production
    // Conteúdo específico de produção...
@endproduction
```

Ou você pode determinar se o aplicativo está sendo executado em um ambiente específico usando a diretiva `@env`:

```blade
@env('staging')
    // O aplicativo está sendo executado em "staging"...
@endenv

@env(['staging', 'production'])
    // O aplicativo está sendo executado em "staging" ou "production"...
@endenv
```

#### Diretivas da secção
Você pode determinar se uma seção de herança do template tem conteúdo usando a diretiva `@hasSection`:

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
A diretiva `@session` pode ser usada para determinar se um valor de sessão existe. Se o valor da sessão existir, os conteúdos do template entre as diretivas `@session` e `@endsession` serão avaliados. Dentro dos conteúdos da diretiva `@session`, você pode ecoar a variável `$value` para mostrar o valor da sessão:

```blade
@session('status')
    <div class="p-4 bg-green-100">
        {{ $value }}
    </div>
@endsession
```

### Declarações de troca
As instruções switch podem ser construídas usando as diretivas `@switch`, `@case`, `@break`, `@default` e `@endswitch`:

```blade
@switch($i)
    @case(1)
        Primeiro caso...
        @break

    @case(2)
        Segundo caso...
        @break

    @default
        Caso padrão...
@endswitch
```

### Loops
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

::: info NOTA
Ao iterar através de um loop `foreach`, você pode usar a [variável do loop](#variavel-do-loop) para obter informações valiosas sobre o loop, como se você está na primeira ou na última iteração do loop.

Ao utilizar loops, você também pode ignorar a iteração atual ou terminar o loop usando as diretivas `@continue` e `@break`:

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

### A variável do loop
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

Se você estiver em um loop aninhado, poderá acessar a variável do laço pai através da propriedade `parent`:

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

| Propriedade         | Descrição                                                 |
|---------------------|-----------------------------------------------------------|
| `$loop->index`      | O índice da iteração corrente do laço (começa em 0).      |
| `$loop->iteration`  | A iteração do loop atual (começa em 1).                   |
| `$loop->remaining`  | As iterações remanescentes na loop.                       |
| `$loop->count`      | O número total de itens na matriz que está sendo iterada. |
| `$loop->first`      | Se esta é a primeira execução do loop.                    |
| `$loop->last`       | Se esta é a última iteração do laço.                      |
| `$loop->even`       | Se esta é uma iteração par ou ímpar no decorrer do laço.  |
| `$loop->odd`        | Se essa é uma iteração estranha da loop.                  |
| `$loop->depth`      | Nível de nidificação da loop atual.                       |
| `$loop->parent`     | Quando numa loop aninhada, a variável da loop principal.  |

### Classes e estilos condicionais
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

Além disso, a diretiva `@readonly` pode ser utilizada para indicar se um determinado elemento deverá ser "somente-leitura":

```blade
<input type="email"
        name="email"
        value="email@laravel.com"
        @readonly($user->isNotAdmin()) />
```

Adicionalmente, a diretiva `@required` pode ser utilizada para indicar se um determinado elemento é "obrigatório":

```blade
<input type="text"
        name="title"
        value="title"
        @required($user->isAdmin()) />
```

### Incluindo sub-views

::: info NOTA
Embora você possa usar a diretiva `@include`, o Blade [components](#componentes) fornece funcionalidade semelhante e oferece vários benefícios em relação à diretiva `@include`, como vinculação de dados e atributos.
:::

A diretiva `@include` do Blade permite-lhe incluir uma visualização do Blade numa outra visualização. As variáveis que estão disponíveis na visualização principal estarão também disponíveis na visualização incluída:

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

Se você tentar incluir uma visualização que não existe, o Laravel irá exibir um erro. Se você desejar incluir uma view que pode ou não estar presente, você deve usar a diretiva `@includeIf`:

```blade
@includeIf('view.name', ['status' => 'complete'])
```

Se quiser incluir uma visualização se uma expressão booleana dada for `true` ou `false`, você pode utilizar as diretivas `@includeWhen` e `@includeUnless`:

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

Para incluir o primeiro visual existente numa determinada sequência de visualizações, você pode utilizar a diretiva `includeFirst`:

```blade
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

::: warning ATENÇÃO
Devemos evitar o uso das constantes `__DIR__` e `__FILE__` em nossas visualizações do Blade pois elas remetem à localização da visualização compilada e que está sendo utilizada naquele momento.
:::

#### Exibição de views para coleções
Você pode combinar loops e inclusões em uma linha com a diretiva `@each` do Blade:

```blade
@each('view.name', $jobs, 'job')
```

O primeiro argumento da diretiva `@each` é a visualização a ser renderizada para cada elemento no array ou coleção. O segundo argumento é o array ou coleção que você deseja iterar, enquanto o terceiro argumento é o nome da variável que receberá o valor atual da iteração na visualização. Assim, por exemplo, se você estiver iterando um array de "jobs" (trabalhos), normalmente desejará acessar cada trabalho como uma variável "job". A chave do array para a iteração atual estará disponível na variável `key` da visualização.

Você também pode passar um quarto argumento à diretiva `@each`. Este argumento define o modelo que será renderizado se o array especificado estiver vazio.

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

::: warning ATENÇÃO
As views renderizadas por meio de `@each` não herdam as variáveis da view pai. Se a view filha necessitar dessas variáveis, você deve usar as diretivas `@foreach` e `@include`.
:::

### A Diretiva `@once`
A diretiva `@once` permite-lhe definir uma parte do modelo que só será executada uma vez por ciclo de representação. Isto poderá ser útil para empurrar um determinado pedaço de JavaScript para a parte superior da página usando [stacks](#pilhas) (pilhas). Por exemplo, se você estiver a representar um determinado [componente](#componentes) num loop, poderá querer empurrar o JavaScript para a parte superior apenas na primeira vez que o componente for representado:

```blade
@once
    @push('scripts')
        <script>
            // Seu JavaScript customizado...
        </script>
    @endpush
@endonce
```

Como a diretiva `@once` é frequentemente usada em conjunto com as diretivas `@push` ou `@prepend`, as diretivas `@pushOnce` e `@prependOnce` estão disponíveis para sua conveniência:

```blade
@pushOnce('scripts')
    <script>
        // Seu JavaScript customizado...
    </script>
@endPushOnce
```

### PHP Puro
Em algumas situações, é útil inserir código PHP em suas visualizações. Você pode usar a diretiva `@php` do Blade para executar um bloco de código PHP simples no seu modelo:

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
Os componentes e os slots fornecem benefícios semelhantes as _sections_, _layouts_ e _includes_; no entanto, alguns podem considerar que a forma de uso dos componentes e slots é mais fácil de compreender. Existem duas abordagens para escrever componentes: componentes com base em classes e componentes anônimos.

Para criar um componente baseado em classes, você pode utilizar a linha de comando do Artisan `make:component`. Para ilustrar a utilização de componentes, criaremos um simples componente de nome `Alert`. O comando `make:component` colocará o componente no diretório `app/View/Components`:

```shell
php artisan make:component Alert
```

O comando `make:component` também criará um modelo de visualização para o componente. A visualização será colocada na pasta `resources/views/components`. Para os componentes da sua própria aplicação, normalmente não é necessário proceder com qualquer tipo de registro do mesmo, uma vez que os mesmos são automaticamente descobertos nas pastas `app/View/Components` e `resources/views/components`.

Você também pode criar componentes dentro de subdiretórios:

```shell
php artisan make:component Forms/Input
```

O comando acima irá criar um componente `Input` na pasta `app/View/Components/Forms`, e a view será colocada na pasta `resources/views/components/forms`.

Se você desejar criar um componente anônimo (um componente com apenas um template Blade e sem nenhuma classe), poderá usar a flag `--view` ao invocar o comando `make:component`:

```shell
php artisan make:component forms.input --view
```

O comando acima criará um arquivo Blade em `resources/views/components/forms/input.blade.php` que pode ser renderizado como um componente via `<x-forms.input />`.

#### Registo Manual de Componentes do Pacote
Quando você escreve componentes para seu próprio aplicativo, esses componentes são descobertos automaticamente nas pastas `app/View/Components` e `resources/views/components`.

No entanto, se estiver criando um pacote que utiliza os componentes Blade, precisará registrar manualmente a sua classe de componentes e o seu alias HTML. Normalmente, você deve registrar os seus componentes no método `boot` do fornecedor do serviço do seu pacote:

```php
    use Illuminate\Support\Facades\Blade;

    /**
     * Inicialize os serviços do seu pacote.
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

Como alternativa, você pode usar o método `componentNamespace` para fazer o auto carregamento de classes de componentes por convenção. Por exemplo, um pacote com o nome _Nightshade_ poderia ter os componentes _Calendar_ e _ColorPicker_ que ficam dentro do namespace `Package\Views\Components`:

```php
    use Illuminate\Support\Facades\Blade;

    /**
     * Inicialize os serviços do seu pacote.
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

O Blade detectará automaticamente a classe que está vinculada a este componente colocando em pascal o nome do componente. Subdiretórios também são suportados usando a notação "ponto".

### Componentes de renderização
Para exibir um componente, você pode usar uma tag de componente Blade dentro de um de seus templates Blade. As tags de componentes Blade começam com a palavra-chave `x-` seguida pelo nome do componente em caixa baixa:

```blade
<x-alert/>

<x-user-profile/>
```

Se a classe de componentes estiver aninhada mais profundamente no diretório `app/View/Components`, você pode utilizar o caractere `.` para indicar a aninhamento de diretórios. Por exemplo, supondo que um componente esteja localizado em `app/View/Components/Inputs/Button.php`, você pode renderizá-lo da seguinte forma:

```blade
<x-inputs.button/>
```

Se você desejar renderizar condicionalmente seu componente, poderá definir um método `shouldRender` na classe do componente. Se o método `shouldRender` retornar `false`, o componente não será renderizado:

```php
    use Illuminate\Support\Str;

    /**
     * Se o componente deve ser renderizado
     */
    public function shouldRender(): bool
    {
        return Str::length($this->message) > 0;
    }
```

### Passagem de dados para componentes
Você pode passar dados para componentes do Blade usando atributos HTML. Valores primitivos codificados podem ser passados ​​para o componente usando strings de atributos HTML simples. Expressões e variáveis ​​PHP devem ser passadas para o componente através de atributos que usam o caractere `:` como prefixo:

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
         * Crie a instância do componente.
         */
        public function __construct(
            public string $type,
            public string $message,
        ) {}

        /**
         * Obtenha a visualização/conteúdo que representa o componente.
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
     * Crie a instância do componente.
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
{{-- Sintaxe de atributo curta... --}}
<x-profile :$userId :$name />

{{-- É equivalente a... --}}
<x-profile :user-id="$userId" :name="$name" />
```

#### Fugindo da apresentação de atributos
Como alguns frameworks de JavaScript, como o Alpine.js, também usam atributos com um sinal de igual (=), você poderá usar um sinal duplo (::) para indicar ao Blade que essa não é um expressão PHP. Por exemplo:

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
Além das variáveis públicas estarem disponíveis para o template de componente, é possível invocar quaisquer métodos públicos do mesmo. Por exemplo, suponhamos que um componente tenha um método `isSelected`:

```php
    /**
     * Determine se a opção fornecida é a opção atualmente selecionada.
     */
    public function isSelected(string $option): bool
    {
        return $option === $this->selected;
    }
```

Você pode executar esse método a partir do template de seu componente, chamando-o da variável que corresponde ao nome do método:

```blade
<option {{ $isSelected($value) ? 'selected' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

#### Acessando atributos e slots dentro de classes de componentes
Os componentes Blade também permitem acessar o nome do componente, atributos e slot dentro do método de renderização da classe. Porém, para acessar esses dados, você deve retornar uma closure do método `render` do seu componente. A closure receberá um array `$data` como único argumento. Este array conterá vários elementos que fornecem informações sobre o componente:

```php
    use Closure;

    /**
     * Obtenha a visualização/conteúdo que representa o componente.
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

O `componentName` é igual ao nome usado na tag HTML após o prefixo `x-`. Portanto, o `componentName` de `<x-alert />` será `alert`. O elemento `attributes` conterá todos os atributos que estavam presentes na tag HTML. O elemento `slot` é uma instância `Illuminate\Support\HtmlString` com o conteúdo do slot do componente.

O closure deve retornar uma cadeia de caracteres. Se a cadeia correspondente corresponder a uma visualização existente, essa visualização será renderizada. Caso contrário, a cadeia é avaliada como visualização Blade em linha.

#### Dependências adicionais
Se o seu componente tiver dependências do [conjunto de serviços Laravel](/docs/container), você poderá incluí-las antes de todos os atributos de dados do componente, que serão automaticamente injetados pelo conjunto de serviços:

```php
use App\Services\AlertCreator;

/**
 * Crie a instância do componente.
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
         * As propriedades/métodos que não devem ser expostos ao modelo de componente.
         *
         * @var array
         */
        protected $except = ['type'];

        /**
         * Crie a instância do componente.
         */
        public function __construct(
            public string $type,
        ) {}
    }
```

### Atributos de componentes
Já estudamos o envio de atributos de dados para um componente; no entanto, por vezes poderão ser necessários especificar atributos HTML adicionais, tais como "class", que não façam parte dos dados necessários para o bom funcionamento do componente. Normalmente, você deseja enviar estes atributos adicionais ao elemento raiz do template do componente. Por exemplo, imagine que desejamos renderizar um componente "alert":

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```

Todos os atributos que não fazem parte do construtor da componente serão automaticamente adicionados ao "attribute bag" (mochila de atributos) da mesma. Este "attribute bag" é disponibilizado automaticamente ao componente através da variável `$attributes`. Todos os atributos podem ser renderizados no componente, ecoando esta variável:

```blade
<div {{ $attributes }}>
    <!-- Conteúdo do componente -->
</div>
```

::: warning ATENÇÃO
O uso de diretivas como `@env` nas tags dos componentes não é suportado no momento. Por exemplo, `<x-alert :live="@env('production')"/>` não será compilado.
:::

#### Atributos padrão/mesclados
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

O HTML renderizado do componente aparecerá como o seguinte:

```blade
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

#### Mesclagem condicional de classes
Às vezes você poderá querer juntar classes se uma determinada condição for `true`. Você pode fazer isso através do método `class`, que aceita um array de classes. O índice do array contém a classe ou as classes que pretende adicionar, enquanto o valor é uma expressão boolean. Se o elemento do array tiver um índice numérico, será sempre incluído na lista de classes gerada:

```blade
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

Se você precisar mesclar outros atributos em seu componente, você pode encadear o método `merge` no método `class`:

```blade
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

::: info NOTA
Se você precisar compilar classes condicionalmente em outros elementos HTML que não deveriam receber atributos mesclados, você pode usar a [diretiva `@class`](#classes-condicionais).
:::

#### Mesclando atributos não classificados
Ao mesclar atributos que não são atributos de "class", os valores fornecidos ao método `merge` serão considerados como valores "padrão" do atributo. No entanto, diferente do atributo `class`, estes atributos não serão fundidos com valores de atributos injetados, mas sim, sobrescritos. Por exemplo, a implementação de um componente "button" pode ter o seguinte aspecto:

```blade
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

Para tornar o componente de botão com um tipo personalizado, ele pode ser especificado durante a utilização do componente. Se não for especificado nenhum tipo, será utilizado o tipo `button`:

```blade
<x-button type="submit">
    Submit
</x-button>
```

O HTML renderizado do componente `button` neste exemplo seria:

```blade
<button type="submit">
    Submit
</button>
```

Se você pretender que um atributo diferente de `class` tenha o seu valor padrão e valores injetados juntos, você poderá usar a método `prepends`. Neste exemplo, o atributo `data-controller` começará sempre por `profile-controller` e quaisquer outros valores injetados do `data-controller` serão inseridos depois deste valor padrão:

```blade
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

#### Recuperando e filtrando atributos
Você pode filtrar os atributos usando o método `filter`. Esse método aceita uma closure que deve retornar `true` se você deseja manter o atributo na mochila de atributos:

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

Usando o método `first`, você pode exibir o primeiro atributo em uma mochila de atributos especificada:

```blade
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

Se você deseja verificar se um atributo está presente no componente, poderá usar o método `has`. Esse método aceita como único argumento o nome do atributo e retorna um valor booleano que indica se o atributo está ou não presente:

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
- `render`
- `resolveView`
- `shouldRender`
- `view`
- `withAttributes`
- `withName`

### Slots
Freqüentemente será necessário passar conteúdo adicional para seu componente por meio de "slots". Os slots do componente são renderizados ecoando a variável `$slot`. Para explorar este conceito, imaginemos que um componente `alert` tem o seguinte mark-up:

```blade
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

Podemos passar o conteúdo ao slot injetando-o no componente:

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

É possível invocar o método `isEmpty` de um slot para determinar se ele tem conteúdo:

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

Além disso, o método `hasActualContent` pode ser utilizado para determinar se o slot contém um conteúdo "real", que não seja um comentário HTML.

```blade
@if ($slot->hasActualContent())
    The scope has non-comment content.
@endif
```

#### Slot de escopo
Se você usou uma estrutura JavaScript como o Vue, pode estar familiarizado com os "slots com escopo", que permitem acessar dados ou métodos do componente dentro do seu slot. Você pode obter um comportamento semelhante no Laravel definindo métodos ou propriedades públicas em seu componente e acessando o componente dentro de seu slot através da variável `$component`. Neste exemplo, assumiremos que o componente `x-alert` possui um método público `formatAlert` definido em sua classe de componente:

```blade
<x-alert>
    <x-slot:title>
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

#### Atributos de slot
Assim como é possível atribuir componentes do Blade, você pode criar atributos adicionais para slots, como nomes de classe CSS.

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

Para interagir com os atributos de um slot, você pode acessar à propriedade `attributes` da variável do slot. Consulte mais informações sobre como interagir com atributos na documentação de [atributos dos componentes](#atributos-dos-componentes):

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

### Visualizações de componentes inline
Para componentes muito pequenos, pode parecer complicado gerenciar a classe do componente e o template de visualização do componente. Por esta razão, você pode retornar a marcação do componente diretamente do método `render`:

```blade
    /**
     * Get the view / contents that represent the component.
     */
    public function render(): string
    {
        return <<<'blade'
            <div class="alert alert-danger">
                {{ $slot }}
            </div>
        blade;
    }
```

#### Gerar componentes de visualização inline
Para criar uma componente que renderiza um visual in-line, você pode usar a opção "inline" ao executar o comando `make:component`:

```shell
php artisan make:component Alert --inline
```

### Componentes Dinâmicos
Às vezes você pode precisar renderizar um componente, mas não sabe qual é o componente que deve ser renderizado até o momento da execução. Nesta situação, você pode usar o componente integrado ao Laravel chamado `dynamic-component` para renderizar o componente com base em um valor ou variável no momento da execução:

```blade
// $componentName = "secondary-button";

<x-dynamic-component :component="$componentName" class="mt-4" />
```

### Registro manual de componentes

::: warning ATENÇÃO
A documentação a seguir sobre o registro manual de componentes é aplicável principalmente para aqueles que estão escrevendo pacotes Laravel que incluem componentes de visualização. Se você não estiver escrevendo um pacote, esta parte da documentação do componente pode não ser relevante para você.
:::

Ao escrever componentes para o seu aplicativo, os componentes são descobertos automaticamente nos diretórios `app/View/Components` e `resources/views/components` pelo Laravel.

No entanto, se estiver a criar um pacote que utiliza componentes Blade ou pretende colocar os componentes em diretórios não convencionais, será necessário registrar manualmente sua classe de componentes e seu apelido HTML para garantir que o Laravel saiba onde procurar o componente. Normalmente, você deve registrar os seus componentes no método `boot` do provedor de serviços do pacote:

```php
    use Illuminate\Support\Facades\Blade;
    use VendorPackage\View\Components\AlertComponent;

    /**
     * Inicialize os serviços do seu pacote.
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
     * Inicialize os serviços do seu pacote.
     */
    public function boot(): void
    {
        Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
    }
```

Isto permite a utilização de componentes do pacote pelo seu próprio namespace, usando a sintaxe `package-name::`:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

O Blade vai detectar automaticamente a classe ligada a esse componente através da construção em pascal-case do nome do componente. Os subdiretórios também são suportados utilizando a notação "ponto".

## Componentes anônimos
Semelhante aos componentes inline, os componentes anônimos proporcionam um mecanismo para gerenciar um componente por meio de um único arquivo. No entanto, os componentes anônimos utilizam apenas um arquivo de visualização e não têm nenhuma classe associada. Para definir um componente anônimo, você só precisa incluir uma matriz de templates Blade em sua pasta `resources/views/components`. Por exemplo, supondo que você tenha definido um componente como `resources/views/components/alert.blade.php`, você pode renderizá-lo da seguinte maneira:

```blade
<x-alert/>
```

 Você pode usar o caractere `.` para indicar se um componente está aninhado dentro da pasta `components`. Por exemplo, supondo que o componente esteja definido em `resources/views/components/inputs/button.blade.php`, você poderá renderizá-lo do seguinte modo:

```blade
<x-inputs.button/>
```

### Componentes de índice anônimos
Às vezes, quando um componente é composto de vários templates Blade, você pode querer agrupar os modelos de determinado componente em um único diretório. Por exemplo, imagine um componente "accordion" com a seguinte estrutura de diretórios:

```
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

Essa estrutura de diretório permite que você monte o componente "accordion" e seus elementos da seguinte maneira:

```blade
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

No entanto, para renderizar o componente _accordion_ via `x-accordion`, fomos forçados a colocar o template do componente _accordion_ "index" no diretório `resources/views/components` em vez de aninhá-lo dentro do diretório `accordion` com os outros templates relacionados ao _accordion_.

Felizmente, o Blade permite que você coloque um arquivo `index.blade.php` dentro do diretório de template de um componente. Quando existe um template `index.blade.php` para o componente, ele será renderizado como o nó "raiz" do componente. Portanto, podemos continuar a usar a mesma sintaxe do Blade dada no exemplo acima; no entanto, ajustaremos nossa estrutura de diretórios assim:

```
/resources/views/components/accordion/index.blade.php
/resources/views/components/accordion/item.blade.php
```

### Propriedades e atributos dos dados
Como os componentes anônimos não têm nenhuma classe associada, você pode se perguntar como definir quais dados devem ser passados para a componente como variáveis e quais atributos devem ser colocados na [sacola de atributos da componente](#component-attributes).

Você pode especificar quais atributos devem ser considerados variáveis ​​de dados usando a diretiva `@props` na parte superior do modelo Blade do seu componente. Todos os outros atributos do componente estarão disponíveis no pacote de atributos do componente. Se você deseja atribuir um valor padrão a uma variável de dados, você pode especificar o nome da variável como a chave do array e o valor padrão como o valor do array:

```blade
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

Considerando a definição do componente acima, podemos renderizar a mesma da seguinte forma:

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

### Acessando os dados dos pais
Às vezes você pode querer acessar dados de um componente pai dentro de um componente filho. Nestes casos, você pode usar a diretiva `@aware`. Por exemplo, imagine que estamos construindo um componente de menu complexo que consiste em um pai `<x-menu>` e um filho `<x-menu.item>`:

```blade
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

O componente `<x-menu>` pode ter uma implementação como a seguinte:

```blade
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

Como a propriedade `color` só foi passada para o pai (`<x-menu>`), ela não estará disponível dentro de `<x-menu.item>`. Porém, se usarmos a diretiva `@aware`, podemos disponibilizá-la também dentro de `<x-menu.item>`:

```blade
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

::: warning ATENÇÃO
A diretiva `@aware` não pode acessar dados do pai que não sejam passados ​​explicitamente para o componente superior por meio de atributos HTML. Os valores padrão de `@props` que não são passados ​​explicitamente para o componente pai não podem ser acessados ​​pela diretiva `@aware`.
:::

### Caminhos de componentes anônimos
Como discutido anteriormente, normalmente os componentes anônimos são definidos colocando um modelo Blade na pasta `resources/views/components`. No entanto, ocasionalmente você poderá querer registrar outros caminhos de componentes anônimos no Laravel em adição ao caminho padrão.

O método `anonymousComponentPath` aceita o "_path_" para a localização do componente anônimo como seu primeiro argumento e um namespace opcional sob o qual os componentes devem ser colocados como seu segundo argumento. Tipicamente, esse método deve ser chamado no método `boot` de um dos [provedores de serviços](/docs/providers) da sua aplicação:

```php
    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Blade::anonymousComponentPath(__DIR__.'/../components');
    }
```

Quando os caminhos dos componentes são registrados sem um prefixo especificado, como no exemplo acima, eles também podem ser renderizados nos componentes do Blade sem um prefixo correspondente. Por exemplo, se existir um componente `panel.blade.php` no caminho registrado acima, ele poderá ser renderizado da seguinte forma:

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

## Construindo layouts

### Layouts usando componentes
A maioria dos aplicativos da Web mantêm o mesmo formato geral através de várias páginas. Seria incrivelmente complicado e difícil manter nosso aplicativo se tivéssemos que repetir o layout HTML completo em cada visualização que criamos. Felizmente, é conveniente definir esse formato como um único [Componente Blade](#componentes) e, em seguida, usá-lo por todo o aplicativo.

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
Definido o componente `layout`, podemos criar uma view Blade que utilize essa composição. Neste exemplo, definimos uma simples visualização que mostra nossa lista de tarefas:

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

Agora que definimos nossos layouts e as visões de tarefas, só precisamos devolver a view "tasks" de uma rota:

```php
    use App\Models\Task;

    Route::get('/tasks', function () {
        return view('tasks', ['tasks' => Task::all()]);
    });
```

### Layouts usando a Herança de Template

#### Definição de um layout
Os layouts também podem ser criados através da "herança de templates". Esta foi a forma mais utilizada para a construção de aplicações antes da introdução dos [componentes](#componentes).

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

Como pode ver, este arquivo contém uma marcação HTML típica. No entanto, note as diretivas `@section` e `@yield`. A diretiva `@section`, tal como o nome indica, define uma seção de conteúdo, enquanto a diretiva `@yield` é utilizada para exibir o conteúdo de determinada seção.

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

::: info NOTA
Ao contrário do exemplo anterior, esta seção `sidebar` termina com `@endsection` em vez de `@show`. O atalho `@endsection` apenas definirá uma seção, ao passo que o `@show` definirá e **imediatamente renderizará** a seção.
:::

A diretiva `@yield` também aceita um valor padrão como seu segundo parâmetro, e esse valor será renderizado se o bloco de código estiver definido como `undefined`:

```blade
@yield('content', 'Default content')
```

## Formulários

### Campo de CSRF
Sempre que você definir um formulário HTML em sua aplicação, você deve incluir um campo de token CSRF escondido no formulário para que a middleware de proteção [contra CSRF](/docs/csrf) possa validar o pedido. Você pode usar a diretiva Blade `@csrf` para gerar o campo de token:

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

### Campo _method
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

Uma vez que a directiva `@error` compile uma declaração "_if_", você pode utilizar a directiva `@else` para exibir o conteúdo quando não existir um erro para um atributo:

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input id="email"
    type="email"
    class="@error('email') is-invalid @else is-valid @enderror">
```

Você pode passar [o nome de um pacote de erros específico](/docs/validation#named-error-bags) como o segundo parâmetro para a diretiva `@error` para recuperar mensagens de erro de validação em páginas contendo vários formulários:

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

## Stacks
O Blade permite que você crie um vetor de pilhas nomeadas, que pode ser renderizado em outra posição ou em outro layout. Isso é particularmente útil para especificar bibliotecas JavaScript exigidas por suas views filhas:

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

Se você quiser `@push` (empurrar um) conteúdo se uma determinada expressão booleana for avaliada como `true`, você pode usar a diretiva `@pushIf`:

```blade
@pushIf($shouldPush, 'scripts')
    <script src="/example.js"></script>
@endPushIf
```

Você pode empurrar para uma pilha quantas vezes forem necessárias. Para exibir o conteúdo completo da pilha, passe o nome da pilha para a diretiva `@stack`:

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

// Depois...

@prepend('scripts')
    This will be first...
@endprepend
```

## Injeção de Serviços
A diretiva `@inject` pode ser usada para recuperar um serviço do contêiner de serviços do Laravel. O primeiro argumento passado à diretiva `@inject` é o nome da variável na qual o serviço será alocado, enquanto que o segundo é o nome da classe ou interface do serviço que você deseja resolver:

```blade
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

## Renderizando modelos de blade embutidos
Às vezes, você pode precisar transformar uma string de template Blade bruta em HTML válido. Você pode fazer isso usando o método `render` fornecido pela facade `Blade`. O método `render` aceita a string do template Blade e um array opcional de dados para fornecer ao template:

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

O Laravel executa os templates Blade inline escrevendo-os para a pasta `storage/framework/views`. Se preferir que o Laravel remova estes ficheiros temporários após a renderização do template, você pode fornecer o argumento ao método `deleteCachedView`:

```php
return Blade::render(
    'Hello, {{ $name }}',
    ['name' => 'Julian Bashir'],
    deleteCachedView: true
);
```

## Implementando fragmentos de Blade
Quando usar frameworks de front-end como [Turbo](https://turbo.hotwired.dev/) e [htmx](https://htmx.org/), pode ser necessário, ocasionalmente, retornar apenas uma parte de um template Blade dentro da resposta HTTP. Os "fragments" do Blade permitem fazer exatamente isso. Para começar, coloque uma parte do seu template Blade dentro das diretivas `@fragment` e `@endfragment`:

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

O método `fragmentIf` permite retornar condicionalmente um fragmento de uma view com base em uma determinada condição. Caso contrário, será retornado o conteúdo completo da view:

```php
return view('dashboard', ['users' => $users])
    ->fragmentIf($request->hasHeader('HX-Request'), 'user-list');
```

Os métodos `fragments` e `fragmentsIf` permitem que você retorne múltiplos fragmentos da página na resposta. Os fragmentos são concatenados:

```php
view('dashboard', ['users' => $users])
    ->fragments(['user-list', 'comment-list']);

view('dashboard', ['users' => $users])
    ->fragmentsIf(
        $request->hasHeader('HX-Request'),
        ['user-list', 'comment-list']
    );
```

## Extendendo o Blade
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
         * Registre quaisquer serviços de aplicativo.
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
            Blade::directive('datetime', function (string $expression) {
                return "<?php echo ($expression)->format('m/d/Y H:i'); ?>";
            });
        }
    }
```

Como você pode ver, vamos concatenar o método `format` com qualquer expressão passada para a diretiva. Então, nesse exemplo, o código PHP gerado por essa diretiva será:

```php
    <?php echo ($var)->format('m/d/Y H:i'); ?>
```

::: warning ATENÇÃO
Após atualizar a lógica de uma diretiva Blade será necessário excluir todas as visualizações armazenadas em cache. As visualizações armazenadas em cache podem ser removidas utilizando o comando `view:clear` do Artisan.
:::

### Echos personalizados
Se você tentar fazer o "echo" de um objeto usando Blade, o método `__toString` do objeto será acionado. O método [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) é um dos "métodos mágicos" incluídos no PHP. No entanto, às vezes você pode não ter controle sobre o método `__toString` de uma determinada classe, como quando a classe que você está interagindo pertence a uma biblioteca de terceiros.

Nesses casos, o Blade permite registrar um manipulador de eco personalizado para aquele tipo específico de objeto. Para fazer isso, você deve invocar o método `stringable` do Blade. O método `stringable` aceita uma closure. Esta closure deve indicar o tipo de objeto que ele é responsável pela renderização. Normalmente, o método `stringable` deve ser invocado dentro do método `boot` da classe `AppServiceProvider` da sua aplicação:

```php
    use Illuminate\Support\Facades\Blade;
    use Money\Money;

    /**
     * Inicialize qualquer serviço de aplicativo.
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

### Instruções If personalizadas
Programar uma diretiva personalizada é por vezes mais complexo do que necessário na definição de declarações condicionais simples e personalizadas. Por esta razão, o Blade fornece um método `Blade::if` que permite definir rapidamente diretivas condicionais personalizadas utilizando closures. Por exemplo, podemos definir uma condicional personalizada que verifique o disco configurado como parâmetro padrão na aplicação. Podemos fazer isto no método `boot` do nosso `AppServiceProvider`:

```php
    use Illuminate\Support\Facades\Blade;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Blade::if('disk', function (string $value) {
            return config('filesystems.default') === $value;
        });
    }
```

Depois que a condicional personalizada for definida, você poderá usá-la em seus templates:

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
