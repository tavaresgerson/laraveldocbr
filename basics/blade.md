# Blade

## Introdução
Blade é o mecanismo de modelagem simples, mas poderoso que vem com o Laravel. Ao contrário de alguns mecanismos de modelagem de PHP, o Blade não 
o restringe de usar código PHP simples em seus modelos. Na verdade, todos os modelos Blade são compilados em código PHP simples e armazenados em 
cache até serem modificados, o que significa que o Blade adiciona essencialmente zero sobrecarga ao seu aplicativo. Os arquivos de modelo Blade
usam a extensão `.blade.php` de arquivo e geralmente são armazenados no diretório `resources/views`.

As Blades podem ser retornadas de rotas ou controlador usando o auxiliar global `view`. Claro, conforme mencionado na documentação 
sobre [Views](/basics/views.md), os dados podem ser passados para a Blade usando o segundo argumento do auxiliar `view`:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'Finn']);
});
```

> Antes de se aprofundar no Blade, certifique-se de ler a documentação sobre [Views](/basics/views.md) do Laravel.

### Exibindo dados
Você pode exibir dados que são passados para suas visualizações Blade envolvendo a variável entre colchetes. Por exemplo, dada a seguinte rota:

```php
Route::get('/', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

Você pode exibir o conteúdo da variável `name` assim:

```
Hello, {{ $name }}.
```

> As declarações `{{ }}` de eco do Blade são enviadas automaticamente por meio da função PHP `htmlspecialchars` para prevenir ataques XSS.


Você não está limitado a exibir o conteúdo das variáveis passadas para a visualização. Você também pode reproduzir os resultados de 
qualquer função PHP. Na verdade, você pode colocar qualquer código PHP que desejar dentro de uma instrução Blade:

```blade
The current UNIX timestamp is {{ time() }}.
```

### Renderizando JSON
Às vezes, você pode passar um array para sua visualização com a intenção de renderizá-lo como JSON para inicializar uma variável JavaScript. 
Por exemplo:

```html
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

No entanto, em vez de chamar manualmente `json_encode`, você pode usar a diretiva `@json`. `@json` aceita os mesmos argumentos da função
`json_encode` do PHP. Por padrão, a diretiva `@json` chama a função `json_encode` com as flags `JSON_HEX_TAG`, `JSON_HEX_APOS`, `JSON_HEX_AMP`, 
e `JSON_HEX_QUOT`:

```html
<script>
    var app = @json($array);

    var app = @json($array, JSON_PRETTY_PRINT);
</script>
```

> Você só deve usar a diretiva `@json` para renderizar variáveis existentes como JSON. O modelo do Blade é baseado em expressões regulares 
> e as tentativas de passar uma expressão complexa para a diretiva podem causar falhas inesperadas.


### Codificação de Entidade HTML
Por padrão, o Blade (e o `e` auxiliar do Laravel) irá codificar duplamente as entidades HTML. Se você deseja desativar a codificação dupla, 
chame o método `Blade::withoutDoubleEncoding` no método `boot` de seu `AppServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Blade::withoutDoubleEncoding();
    }
}
```

### Exibindo dados sem escape
Por padrão, as instruções `{{ }}` Blade são enviadas automaticamente por meio da função `htmlspecialchars` do PHP para evitar ataques XSS. 
Se você não quiser que seus dados tenham escape, você pode usar a seguinte sintaxe:

```
Hello, {!! $name !!}.
```

> Tenha muito cuidado ao reproduzir conteúdo fornecido por usuários de seu aplicativo. Normalmente, você deve usar a sintaxe de chave dupla 
> com escape para evitar ataques XSS ao exibir dados fornecidos pelo usuário.


## Blade e estruturas de JavaScript
Como muitos frameworks JavaScript também usam colchetes para indicar que uma determinada expressão deve ser exibida no navegador, você pode 
usar o símbolo `@` para informar ao mecanismo de renderização do Blade que uma expressão deve permanecer intacta. Por exemplo:

```
<h1>Laravel</h1>

Hello, @{{ name }}.
```

Neste exemplo, o símbolo `@` será removido pelo Blade; entretanto, a expressão `{{ name }}` permanecerá intocada pelo mecanismo Blade, permitindo 
que seja renderizada por sua estrutura JavaScript.

O símbolo `@` também pode ser usado para escapar das diretivas Blade:

```
{{-- Blade template --}}
@@json()

<!-- HTML output -->
@json()
```

A diretriz `@verbatim`
Se estiver exibindo variáveis JavaScript em uma grande parte do seu modelo, você pode envolver o HTML na diretiva `@verbatim` para que não precise 
prefixar cada instrução Blade echo com um símbolo `@`:

```html
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

## Diretivas Blade
Além de herança de template e exibição de dados, o Blade também fornece atalhos convenientes para estruturas de controle PHP comuns, 
como instruções condicionais e loops. Esses atalhos fornecem uma maneira muito limpa e concisa de trabalhar com estruturas de controle 
do PHP, ao mesmo tempo em que permanecem familiares às suas contrapartes do PHP.

### Declarações If
Você pode construir declarações `if` usando as diretivas `@if`, `@elseif`, `@else`, e `@endif`. Essas diretivas funcionam de forma idêntica 
às suas contrapartes PHP:

```
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

Por conveniência, o Blade também fornece uma diretiva `@unless`:

```
@unless (Auth::check())
    You are not signed in.
@endunless
```

Além das diretivas condicionais já discutidas, as diretivas `@isset` e `@empty` podem ser usadas como atalhos convenientes para 
suas respectivas funções PHP:

```
@isset($records)
    // $records is defined and is not null...
@endisset

@empty($records)
    // $records is "empty"...
@endempty
```

#### Diretivas de autenticação
As diretivas `@auth` e `@guest` podem ser usadas para determinar rapidamente se o usuário atual é autenticado ou é um convidado:

```
@auth
    // The user is authenticated...
@endauth

@guest
    // The user is not authenticated...
@endguest
```

Se necessário, você pode especificar a proteção de autenticação que deve ser verificada ao usar as diretivas `@auth` e `@guest`:

```
@auth('admin')
    // The user is authenticated...
@endauth

@guest('admin')
    // The user is not authenticated...
@endguest
```

#### Diretivas de Ambiente
Você pode verificar se o aplicativo está sendo executado no ambiente de produção usando a diretiva `@production`:

```
@production
    // Production specific content...
@endproduction
```

Ou você pode determinar se o aplicativo está sendo executado em um ambiente específico usando a diretiva `@env`:

```
@env('staging')
    // The application is running in "staging"...
@endenv

@env(['staging', 'production'])
    // The application is running in "staging" or "production"...
@endenv
```

#### Diretrizes de seção
Você pode determinar se uma seção de herança de modelo tem conteúdo usando a diretiva `@hasSection`:

```
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

Você pode usar a diretiva `sectionMissing` para determinar se uma seção não tem conteúdo:

```
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

### Mudar de declarações
Instruções switch pode ser construído usando os diretivas `@switch`, `@case`, `@break`, `@default` e `@endswitch`:

```
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

### Iterações
Além das instruções condicionais, o Blade fornece diretivas simples para trabalhar com as estruturas de loop do PHP. Novamente, cada uma 
dessas diretivas funciona de forma idêntica às suas contrapartes PHP:

```
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

> Durante o loop, você pode usar a variável de loop para obter informações valiosas sobre o loop, como se você 
> está na primeira ou na última iteração do loop.

Ao usar loops, você também pode encerrar o loop ou pular a iteração atual usando as diretivas `@continue` e `@break`:

```
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

Você também pode incluir a condição de continuação ou interrupção na declaração da diretiva:

```
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

### A Variável de Loop
Durante o loop, uma variável `$loop` estará disponível dentro de seu loop. Esta variável fornece acesso a alguns bits de informação úteis, 
como o índice do loop atual e se esta é a primeira ou a última iteração através do loop:

```
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

Se você estiver em um loop aninhado, poderá acessar a variável `$loop` da iteração pai por meio da propriedade `parent`:

```
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

A variável `$loop` também contém uma variedade de outras propriedades úteis:

| Propriedade           | Descrição                                                         |
|-----------------------|-------------------------------------------------------------------|
| `$loop->index`        | O índice da iteração do loop atual (começa em 0).                 |
| `$loop->iteration`	| A iteração do loop atual (começa em 1).                           |
| `$loop->remaining`	| As iterações restantes no loop.                                   |
| `$loop->count`    	| O número total de itens na matriz que está sendo iterada.         |
| `$loop->first`	    | Se esta é a primeira iteração no loop.                            |
| `$loop->last`	        | Se esta é a última iteração no loop.                              |
| `$loop->even`	        | Se esta é uma iteração com valor par do loop.                     |
| `$loop->odd`	        | Se esta é uma iteração com valor ímpar através do loop.           |
| `$loop->depth`	    | O nível de aninhamento do loop atual.                             |
| `$loop->parent`       | Quando em um loop aninhado, a variável de loop do pai.            |

### Comentários
O Blade também permite definir comentários em suas visualizações. No entanto, ao contrário dos comentários HTML, os comentários Blade 
não são incluídos no HTML retornado pelo seu aplicativo:

```
{{-- This comment will not be present in the rendered HTML --}}
```

### Incluindo subvisualizações

> Embora você esteja livre para usar a diretiva `@include`, os componentes do Blade fornecem funcionalidade semelhante e oferecem vários benefícios em 
> relação à diretiva `@include`, como vinculação de dados e atributo.

A diretiva `@include` do Blade permite incluir uma visualização do Blade de dentro de outra visualização. Todas as variáveis disponíveis para a 
visualização pai serão disponibilizadas para a visualização incluída:

```
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```

Mesmo que a visualização incluída herde todos os dados disponíveis na visualização pai, você também pode passar uma matriz de dados adicionais que devem 
ser disponibilizados para a visualização incluída:

```
@include('view.name', ['status' => 'complete'])
```

Se você tentar uma `@include` de uma view que não existe, o Laravel irá gerar um erro. Se desejar incluir uma view que pode ou não estar presente, você 
deve usar a diretiva `@includeIf`:

```
@includeIf('view.name', ['status' => 'complete'])
```

Se você gostaria de ver uma `@include` como uma determinada expressão booleana, você pode usar as diretivas `@includeWhen` e `@includeUnless`:

```
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

Para incluir a primeira visualização que existe a partir de um determinado conjunto de visualizações, você pode usar a diretiva `includeFirst`:

```
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

> Você deve evitar usar as constantes `__DIR__` e `__FILE__` em suas visualizações Blade, pois elas se referem à localização da 
> visualização em cache e compilada.

#### Renderizando views para coleções
Você pode combinar loops e includes em uma linha com a diretiva `@each` do Blade:

```
@each('view.name', $jobs, 'job')
```

O primeiro argumento da diretiva `@each` é a visualização a ser renderizada para cada elemento na matriz ou coleção. O segundo argumento é a matriz
ou coleção sobre a qual deseja iterar, enquanto o terceiro argumento é o nome da variável que será atribuído à iteração atual na visualização. Portanto, 
por exemplo, se você estiver iterando sobre um array de jobs, normalmente desejará acessar cada trabalho como uma variável `job` dentro da visualização. 
A chave da matriz para a iteração atual estará disponível como a váriavel `key` na view.

Você também pode passar um quarto argumento para a diretiva `@each`. Este argumento determina a visualização que será renderizada se a matriz fornecida 
estiver vazia.

```
@each('view.name', $jobs, 'job', 'view.empty')
```

> As visualizações renderizadas por meio de `@each` não herdam as variáveis da visualização pai. Se a visão filha requer essas variáveis, você deve 
> usar as diretivas `@foreach` e em seu lugar `@include`.

### A diretriz `@once`
A diretiva `@once` permite que você defina uma parte do modelo que será avaliada apenas uma vez por ciclo de renderização. Isso pode ser útil para 
inserir uma determinada parte do JavaScript no cabeçalho da página usando pilhas. Por exemplo, se você estiver renderizando um determinado componente 
dentro de um loop, pode desejar apenas enviar o JavaScript para o cabeçalho na primeira vez que o componente for renderizado:

```
@once
    @push('scripts')
        <script>
            // Your custom JavaScript...
        </script>
    @endpush
@endonce
```

### PHP bruto
Em algumas situações, é útil incorporar o código PHP em suas visualizações. Você pode usar a diretiva `@php` para executar um bloco de PHP simples 
dentro do seu modelo:

```
@php
    $counter = 1;
@endphp
```

## Componentes
Componentes e slots fornecem benefícios semelhantes para seções, layouts e includes; no entanto, alguns podem achar o modelo mental de componentes e 
slots mais fácil de entender. Existem duas abordagens para escrever componentes: componentes baseados em classe e componentes anônimos.

Para criar um componente baseado em classe, você pode usar o comando `make:component` do Artisan. Para ilustrar como usar componentes, criaremos 
um componente `Alert` simples. O comando `make:component` colocará o componente no diretório `App\View\Components`:

```bash
php artisan make:component Alert
```

O comando `make:component` também criará um modelo de view para o componente. A visualização será colocada no diretório `resources/views/components`. 
Ao escrever componentes para seu próprio aplicativo, os componentes são descobertos automaticamente no diretório `app/View/Components` e no
diretório `resources/views/components`, portanto, nenhum registro de componente adicional é normalmente necessário.

Você também pode criar componentes dentro de subdiretórios:

```bash
php artisan make:component Forms/Input
```

O comando acima criará um componente `Input` no diretório `App\View\Components\Forms` e a view será colocada no diretório
`resources/views/components/forms`.

### Registro manual de componentes do pacote
Ao escrever componentes para seu próprio aplicativo, os componentes são descobertos automaticamente no diretório `app/View/Components` e no
diretório `resources/views/components`.

No entanto, se você estiver construindo um pacote que utiliza componentes Blade, precisará registrar manualmente sua classe de componente e seu 
alias de tag HTML. Normalmente, você deve registrar seus componentes no método `boot` do provedor de serviços do seu pacote:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot()
{
    Blade::component('package-alert', Alert::class);
}
```

Depois que seu componente for registrado, ele pode ser processado usando seu apelido (alias) de tag:

```
<x-package-alert/>
```

Alternativamente, você pode usar o método `componentNamespace` para carregar automaticamente as classes de componentes por convenção. Por exemplo, 
um pacote `Nightshade` pode ter os componentes `Calendar` e `ColorPicker` que residem dentro do namespace `Package\Views\Components`:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 *
 * @return void
 */
public function boot()
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

Isso permitirá o uso de componentes de pacote pelo namespace de seu fornecedor usando a sintaxe `package-name::`:

```
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

O Blade detectará automaticamente a classe que está vinculada a este componente, casando em pascal o nome do componente. 
Subdiretórios também são suportados usando a notação de "ponto".

### Componentes de renderização
Para exibir um componente, você pode usar uma tag de componente Blade em um de seus modelos Blade. As tags do componente blade começam com a 
string `x-` seguida pelo nome no estilo kebab da classe do componente:

```
<x-alert/>

<x-user-profile/>
```

Se a classe do componente estiver aninhada mais profundamente no diretório `App\View\Components`, você pode usar o caractere `.` para indicar o 
aninhamento do diretório. Por exemplo, se presumirmos que um componente está localizado em `App\View\Components\Inputs\Button.php`, podemos renderizá-lo 
assim:

```
<x-inputs.button/>
```

### Passando dados para componentes
Você pode passar dados para componentes Blade usando atributos HTML. Valores primitivos embutidos em código podem ser passados para o 
componente usando cadeias de caracteres de atributos HTML simples. Expressões e variáveis PHP devem ser passadas ao componente por meio 
de atributos que usam o caractere `:` como prefixo:

```
<x-alert type="error" :message="$message"/>
```

Você deve definir os dados necessários do componente em seu construtor de classe. Todas as propriedades públicas em um componente serão 
disponibilizadas automaticamente para a visualização do componente. Não é necessário passar os dados para a visualização a partir do
método `render` do componente:

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * The alert type.
     *
     * @var string
     */
    public $type;

    /**
     * The alert message.
     *
     * @var string
     */
    public $message;

    /**
     * Create the component instance.
     *
     * @param  string  $type
     * @param  string  $message
     * @return void
     */
    public function __construct($type, $message)
    {
        $this->type = $type;
        $this->message = $message;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return \Illuminate\View\View|\Closure|string
     */
    public function render()
    {
        return view('components.alert');
    }
}
```

Quando seu componente é renderizado, você pode exibir o conteúdo das variáveis públicas do seu componente, ecoando as variáveis por nome:

```html
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

### Invólucro
Os argumentos do construtor do componente devem ser especificados usando `camelCase`, enquanto `kebab-case` deve ser usado ao fazer 
referência aos nomes dos argumentos em seus atributos HTML. Por exemplo, dado o seguinte construtor de componente:

```php
/**
 * Create the component instance.
 *
 * @param  string  $alertType
 * @return void
 */
public function __construct($alertType)
{
    $this->alertType = $alertType;
}
```

O argumento `$alertType` pode ser fornecido ao componente da seguinte forma:

```
<x-alert alert-type="danger" />
```

#### Renderização de atributo de escape
Como alguns frameworks JavaScript, como `Alpine.js`, também usam atributos prefixados com dois-pontos, você pode usar um prefixo com dois-pontos duplos (`::`)
para informar ao Blade que o atributo não é uma expressão PHP. Por exemplo, neste seguinte componente:

```
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

O seguinte HTML será renderizado pelo Blade:

```
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

### Métodos de Componente
Além das variáveis públicas disponíveis para o seu modelo de componente, qualquer método público no componente pode ser chamado. Por exemplo, 
imagine um componente que possui um método `isSelected`:

```php
/**
 * Determine if the given option is the currently selected option.
 *
 * @param  string  $option
 * @return bool
 */
public function isSelected($option)
{
    return $option === $this->selected;
}
```

Você pode executar este método a partir do seu modelo de componente, invocando a variável que corresponde ao nome do método:

```php
<option {{ $isSelected($value) ? 'selected="selected"' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

#### Acessando Atributos e Slots nas Classes de Componentes
Os componentes do blade também permitem que você acesse o nome do componente, os atributos e o slot dentro do método de renderização da classe. 
No entanto, para acessar esses dados, você deve retornar um encerramento do método `render` do seu componente. O encerramento receberá uma matriz `$data` 
como seu único argumento. Esta matriz conterá vários elementos que fornecem informações sobre o componente:

```php
/**
 * Get the view / contents that represent the component.
 *
 * @return \Illuminate\View\View|\Closure|string
 */
public function render()
{
    return function (array $data) {
        // $data['componentName'];
        // $data['attributes'];
        // $data['slot'];

        return '<div>Components content</div>';
    };
}
```

O `componentName` é igual ao nome usado na tag HTML após o prefixo `x-`. Portanto, `componentName` será `<x-alert />`'s. O elemento `attributes` 
conterá todos os atributos que estavam presentes na tag HTML. O elemento `slot` é uma instância de `Illuminate\Support\HtmlString` com o conteúdo 
do slot do componente.

A closure deve retornar uma string. Se a string retornada corresponder a uma view existente, essa view será renderizada; caso contrário, a string retornada 
será avaliada como uma visualização Blade embutida.

#### Dependências Adicionais
Se o seu componente requer dependências do container de serviço do Laravel, você pode listá-los antes de qualquer um dos atributos de dados do componente 
e eles serão automaticamente injetados pelo container:

```php
use App\Services\AlertCreator

/**
 * Create the component instance.
 *
 * @param  \App\Services\AlertCreator  $creator
 * @param  string  $type
 * @param  string  $message
 * @return void
 */
public function __construct(AlertCreator $creator, $type, $message)
{
    $this->creator = $creator;
    $this->type = $type;
    $this->message = $message;
}
```

#### Escondendo Atributos/Métodos
Se desejar evitar que alguns métodos ou propriedades públicos sejam expostos como variáveis ao seu modelo de componente, você pode adicioná-los a 
uma propriedade `$except` de matriz em seu componente:

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * The alert type.
     *
     * @var string
     */
    public $type;

    /**
     * The properties / methods that should not be exposed to the component template.
     *
     * @var array
     */
    protected $except = ['type'];
}
```

### Atributos de componente
Já examinamos como passar atributos de dados para um componente; no entanto, às vezes você pode precisar especificar atributos HTML adicionais, 
como class, que não fazem parte dos dados necessários para o funcionamento de um componente. Normalmente, você deseja passar esses atributos adicionais 
para o elemento raiz do modelo de componente. Por exemplo, imagine que queremos renderizar um componente `alert` assim:

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```

Todos os atributos que não fazem parte do construtor do componente serão adicionados automaticamente ao "pacote de atributos" do componente. 
Este pacote de atributos é automaticamente disponibilizado para o componente por meio da variável `$attributes`. Todos os atributos podem ser 
renderizados dentro do componente ecoando esta variável:

```
<div {{ $attributes }}>
    <!-- Component content -->
</div>
```

> O uso de diretivas, como `@env` dentro de tags de componentes, não é suportado neste momento. Por exemplo, `<x-alert :live="@env('production')"/>` 
> não será compilado.

#### Atributos padrão/mesclados
Às vezes, você pode precisar especificar valores padrão para atributos ou mesclar valores adicionais em alguns dos atributos do componente. Para 
fazer isso, você pode usar o método `merge` do saco de atributos. Este método é particularmente útil para definir um conjunto de classes CSS padrão 
que sempre devem ser aplicadas a um componente:

```
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

Se assumirmos que este componente é utilizado da seguinte forma:

```
<x-alert type="error" :message="$message" class="mb-4"/>
```

O HTML final renderizado do componente aparecerá como o seguinte:

```
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

#### Mesclar classes condicionalmente
Às vezes, você pode desejar mesclar classes se uma determinada condição for `true`. Você pode fazer isso por meio do método `class`, que aceita uma 
matriz de classes em que a chave da matriz contém a classe ou classes que você deseja adicionar, enquanto o valor é uma expressão booleana. Se o 
elemento da matriz tiver uma chave numérica, ele sempre será incluído na lista de classes renderizadas:

```
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

Se precisar mesclar outros atributos em seu componente, você pode encadear o método `merge` em `class`:

```
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

#### Mesclagem de atributos não pertencentes à classe
Ao mesclar atributos que não são atributos `class`, os valores fornecidos ao método `merge` serão considerados os valores "padrão" do atributo. 
No entanto, ao contrário do atributo `class`, esses atributos não serão mesclados com os valores de atributo injetados. Em vez disso, eles serão 
substituídos. Por exemplo, `butto` na implementação de um componente pode ter a seguinte aparência:

```
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

Para renderizar o componente do botão com um `type` personalizado, ele pode ser especificado ao consumir o componente. Se nenhum tipo for especificado, 
o tipo `button` será usado:

```
<x-button type="submit">
    Submit
</x-button>
````

O HTML renderizado do componente `button` neste exemplo seria:

```
<button type="submit">
    Submit
</button>
```

Se você quiser que um atributo diferente de `class` ter seu valor padrão e os valores injetados juntos, você pode usar o método `prepends`. Neste exemplo, 
o `data-controller` atributo sempre começará com `profile-controller` e quaisquer valores `data-controller` injetados adicionais serão colocados após 
este valor padrão:

```
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

### Recuperando e filtrando atributos
Você pode filtrar atributos usando o método `filter`. Este método aceita uma closure que deve retornar `true` se você deseja manter o atributo no 
pacote de atributos:

```
{{ $attributes->filter(fn ($value, $key) => $key == 'foo') }}
```

Por conveniência, você pode usar o método `whereStartsWith` para recuperar todos os atributos cujas chaves começam com uma determinada string:

```
{{ $attributes->whereStartsWith('wire:model') }}
```

Por outro lado, o whereDoesntStartWithmétodo pode ser usado para excluir todos os atributos cujas chaves começam com uma determinada string:

```
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

Usando o método `first`, você pode renderizar o primeiro atributo em um determinado pacote de atributos:

```
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

Se você gostaria de verificar se um atributo está presente no componente, você pode usar o método `has`. Este método aceita o nome do atributo como 
seu único argumento e retorna um booleano indicando se o atributo está presente ou não:

```
@if ($attributes->has('class'))
    <div>Class attribute is present</div>
@endif
```

Você pode recuperar o valor de um atributo específico usando o método `get`:

```
{{ $attributes->get('class') }}
```

### Palavras-chave reservadas
Por padrão, algumas palavras-chave são reservadas para uso interno do Blade para renderizar componentes. As seguintes palavras-chave não 
podem ser definidas como propriedades públicas ou nomes de métodos em seus componentes:

* `data`
* `render`
* `resolveView`
* `shouldRender`
* `view`
* `withAttributes`
* `withName`
* `Slots`
 
Freqüentemente, você precisará passar conteúdo adicional para o seu componente por meio de "slots". Os slots de componentes são renderizados 
ecoando a variável `$slot`. Para explorar esse conceito, vamos imaginar que um componente `alert` tenha a seguinte marcação:

```html
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

Podemos passar conteúdo para o `slot` injetando conteúdo no componente:

```
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

Às vezes, um componente pode precisar renderizar vários slots diferentes em locais diferentes dentro do componente. Vamos modificar nosso 
componente de alerta para permitir a injeção de um slot de "title":

```html
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

Você pode definir o conteúdo do slot nomeado usando a tag `x-slot`. Qualquer conteúdo que não esteja em uma tag `x-slot` explícita será passado 
para o componente na variável `$slot`:

```
<x-alert>
    <x-slot name="title">
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

#### Slots com escopo
Se você usou uma estrutura JavaScript como o Vue, pode estar familiarizado com os "slots com escopo", que permitem acessar dados ou métodos do 
componente em seu slot. Você pode obter um comportamento semelhante no Laravel definindo métodos públicos ou propriedades em seu componente e 
acessando o componente em seu slot através da variável `$component`. Neste exemplo, vamos supor que o componente `x-alert` tem um método `formatAlert` 
público definido em sua classe de componente:

```
<x-alert>
    <x-slot name="title">
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

### Views de componentes embutidos
Para componentes muito pequenos, pode parecer complicado gerenciar a classe do componente e o modelo de visualização do componente. Por esse motivo, 
você pode retornar a marcação do componente diretamente do método `render`:

```php
/**
 * Get the view / contents that represent the component.
 *
 * @return \Illuminate\View\View|\Closure|string
 */
public function render()
{
    return <<<'blade'
        <div class="alert alert-danger">
            {{ $slot }}
        </div>
    blade;
}
```

### Gerando Componentes de Visualização Inline
Para criar um componente que renderiza uma visualização embutida, você pode usar a opção `inline` ao executar o comando `make:component`:

```bash
php artisan make:component Alert --inline
```

### Componentes Anônimos
Semelhante aos componentes embutidos, os componentes anônimos fornecem um mecanismo para gerenciar um componente por meio de um único arquivo. No entanto, os componentes anônimos utilizam um único arquivo de visualização e não têm nenhuma classe associada. Para definir um componente anônimo, você só precisa colocar um modelo Blade em seu resources/views/componentsdiretório. Por exemplo, supondo que você definiu um componente em resources/views/components/alert.blade.php, você pode simplesmente renderizá-lo assim:

<x-alert/>
Você pode usar o .caractere para indicar se um componente está aninhado mais profundamente no componentsdiretório. Por exemplo, supondo que o componente esteja definido em resources/views/components/inputs/button.blade.php, você pode renderizá-lo assim:

<x-inputs.button/>
Propriedades / atributos de dados
Como os componentes anônimos não têm nenhuma classe associada, você pode se perguntar como pode diferenciar quais dados devem ser passados ​​para o componente como variáveis ​​e quais atributos devem ser colocados no pacote de atributos do componente .

Você pode especificar quais atributos devem ser considerados variáveis ​​de dados usando a @propsdiretiva na parte superior do modelo Blade do seu componente. Todos os outros atributos do componente estarão disponíveis por meio do pacote de atributos do componente. Se você deseja dar a uma variável de dados um valor padrão, você pode especificar o nome da variável como a chave da matriz e o valor padrão como o valor da matriz:

<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
Dada a definição de componente acima, podemos renderizar o componente assim:

<x-alert type="error" :message="$message" class="mb-4"/>
Componentes Dinâmicos
Às vezes, você pode precisar renderizar um componente, mas não saber qual componente deve ser renderizado até o tempo de execução. Nesta situação, você pode usar o dynamic-componentcomponente embutido do Laravel para renderizar o componente baseado em um valor ou variável de tempo de execução:

<x-dynamic-component :component="$componentName" class="mt-4" />
Registrando componentes manualmente

A seguinte documentação sobre o registro manual de componentes é principalmente aplicável para aqueles que estão escrevendo pacotes Laravel que incluem componentes de visão. Se você não estiver escrevendo um pacote, esta parte da documentação do componente pode não ser relevante para você.


Ao escrever componentes para seu próprio aplicativo, os componentes são descobertos automaticamente no app/View/Componentsdiretório e no resources/views/componentsdiretório.

Porém, se você estiver construindo um pacote que utiliza componentes Blade ou colocando componentes em diretórios não convencionais, você precisará registrar manualmente sua classe de componente e seu alias de tag HTML para que o Laravel saiba onde encontrar o componente. Normalmente, você deve registrar seus componentes no bootmétodo do provedor de serviços do seu pacote:

use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * Bootstrap your package's services.
 *
 * @return void
 */
public function boot()
{
    Blade::component('package-alert', AlertComponent::class);
}
Depois que seu componente for registrado, ele pode ser processado usando seu alias de tag:

<x-package-alert/>
Carregamento automático de componentes do pacote
Alternativamente, você pode usar o componentNamespacemétodo para carregar automaticamente as classes de componentes por convenção. Por exemplo, um Nightshadepacote pode ter Calendare ColorPickercomponentes que residem dentro do Package\Views\Componentsnamespace:

use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 *
 * @return void
 */
public function boot()
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
Isso permitirá o uso de componentes de pacote pelo namespace de seu fornecedor usando a package-name::sintaxe:

<x-nightshade::calendar />
<x-nightshade::color-picker />
O Blade detectará automaticamente a classe que está vinculada a este componente, casando em pascal o nome do componente. Subdiretórios também são suportados usando a notação de "ponto".

Layouts de construção
Layouts usando componentes
A maioria dos aplicativos da web mantém o mesmo layout geral em várias páginas. Seria incrivelmente complicado e difícil manter nosso aplicativo se tivéssemos que repetir todo o layout HTML em cada visualização que criamos. Felizmente, é conveniente definir esse layout como um único componente Blade e, em seguida, usá-lo em todo o nosso aplicativo.

Definindo o Componente de Layout
Por exemplo, imagine que estamos construindo um aplicativo de lista de "tarefas". Podemos definir um layoutcomponente parecido com o seguinte:

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
Aplicando o Componente de Layout
Uma vez que o layoutcomponente foi definido, podemos criar uma visualização Blade que utiliza o componente. Neste exemplo, definiremos uma visualização simples que exibe nossa lista de tarefas:

<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
Lembre-se de que o conteúdo injetado em um componente será fornecido à $slotvariável padrão em nosso layoutcomponente. Como você deve ter notado, layouttambém respeita um $titleslot, se houver; caso contrário, um título padrão é mostrado. Podemos injetar um título personalizado de nossa visualização de lista de tarefas usando a sintaxe de slot padrão discutida na documentação do componente :

<!-- resources/views/tasks.blade.php -->

<x-layout>
    <x-slot name="title">
        Custom Title
    </x-slot>

    @foreach ($tasks as $task)
        {{ $task }}
    @endforeach
</x-layout>
Agora que definimos nosso layout e visualizações de lista de tarefas, só precisamos retornar a taskvisualização de uma rota:

use App\Models\Task;

Route::get('/tasks', function () {
    return view('tasks', ['tasks' => Task::all()]);
});
Layouts usando herança de modelo
Definindo um Layout
Os layouts também podem ser criados por meio de "herança de modelo". Essa era a principal forma de criar aplicativos antes da introdução dos componentes .

Para começar, vamos dar uma olhada em um exemplo simples. Primeiro, examinaremos um layout de página. Como a maioria dos aplicativos da web mantém o mesmo layout geral em várias páginas, é conveniente definir esse layout como uma única visualização Blade:

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
Como você pode ver, este arquivo contém marcação HTML típica. No entanto, observe as diretivas @sectione @yield. A @sectiondiretiva, como o nome indica, define uma seção de conteúdo, enquanto a @yielddiretiva é usada para exibir o conteúdo de uma determinada seção.

Agora que definimos um layout para nosso aplicativo, vamos definir uma página filha que herda o layout.

Estendendo um Layout
Ao definir uma visualização filha, use a @extendsdiretiva Blade para especificar qual layout a visualização filha deve "herdar". As visualizações que estendem um layout Blade podem injetar conteúdo nas seções do layout usando @sectiondiretivas. Lembre-se, conforme visto no exemplo acima, o conteúdo dessas seções será exibido no layout usando @yield:

<!-- resources/views/child.blade.php -->

@extends('layouts.app')

@section('title', 'Page Title')

@section('sidebar')
    @parent

    <p>This is appended to the master sidebar.</p>
@endsection

@section('content')
    <p>This is my body content.</p>
@endsection
Neste exemplo, a sidebarseção está utilizando a @parentdiretiva para anexar (em vez de sobrescrever) conteúdo à barra lateral do layout. A @parentdiretiva será substituída pelo conteúdo do layout quando a visualização for renderizada.


Ao contrário do exemplo anterior, esta sidebarseção termina com em @endsectionvez de @show. A @endsectiondiretiva apenas definirá uma seção, enquanto @showdefinirá e produzirá imediatamente a seção.


A @yielddiretiva também aceita um valor padrão como seu segundo parâmetro. Este valor será processado se a seção gerada for indefinida:

@yield('content', 'Default content')
Formulários
Campo CSRF
Sempre que definir um formulário HTML em seu aplicativo, você deve incluir um campo de token CSRF oculto no formulário para que o middleware de proteção CSRF possa validar a solicitação. Você pode usar a @csrfdiretiva Blade para gerar o campo de token:

<form method="POST" action="/profile">
    @csrf

    ...
</form>
Campo de Método
Desde formulários HTML não pode fazer PUT, PATCHou DELETEsolicitações, você vai precisar adicionar uma escondida _methodcampo para falsificar estes HTTP verbos. A @methoddiretiva Blade pode criar este campo para você:

<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
Erros de Validação
A @errordiretiva pode ser usada para verificar rapidamente se existem mensagens de erro de validação para um determinado atributo. Dentro de uma @errordiretiva, você pode ecoar a $messagevariável para exibir a mensagem de erro:

<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input id="title" type="text" class="@error('title') is-invalid @enderror">

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
Você pode passar o nome de um pacote de erros específico como o segundo parâmetro da @errordiretiva para recuperar mensagens de erro de validação em páginas que contêm vários formulários:

<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input id="email" type="email" class="@error('email', 'login') is-invalid @enderror">

@error('email', 'login')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
Pilhas
O Blade permite que você envie para pilhas nomeadas que podem ser renderizadas em outro lugar em outra visualização ou layout. Isso pode ser particularmente útil para especificar quaisquer bibliotecas JavaScript exigidas por suas visualizações filhas:

@push('scripts')
    <script src="/example.js"></script>
@endpush
Você pode empurrar para uma pilha quantas vezes forem necessárias. Para renderizar o conteúdo completo da pilha, passe o nome da pilha para a @stackdiretiva:

<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
Se você gostaria de preceder o conteúdo no início de uma pilha, você deve usar a @prependdiretiva:

@push('scripts')
    This will be second...
@endpush

// Later...

@prepend('scripts')
    This will be first...
@endprepend
Injeção de serviço
A @injectdiretiva pode ser usada para recuperar um serviço do container de serviço do Laravel . O primeiro argumento transmitido @injecté o nome da variável em que o serviço será colocado, enquanto o segundo argumento é a classe ou nome da interface do serviço que você deseja resolver:

@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
Lâmina de extensão
O Blade permite que você defina suas próprias diretivas personalizadas usando o directivemétodo. Quando o compilador Blade encontra a diretiva personalizada, ele chama o retorno de chamada fornecido com a expressão que a diretiva contém.

O exemplo a seguir cria uma @datetime($var)diretiva que formata um dado $var, que deve ser uma instância de DateTime:

<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Blade::directive('datetime', function ($expression) {
            return "<?php echo ($expression)->format('m/d/Y H:i'); ?>";
        });
    }
}
Como você pode ver, iremos encadear o formatmétodo em qualquer expressão que seja passada para a diretiva. Portanto, neste exemplo, o PHP final gerado por esta diretiva será:

<?php echo ($var)->format('m/d/Y H:i'); ?>

Após atualizar a lógica de uma diretiva do Blade, você precisará excluir todas as visualizações do Blade em cache. As visualizações Blade em cache podem ser removidas usando o view:clearcomando Artisan.


Instruções If personalizadas
Programar uma diretiva personalizada às vezes é mais complexo do que o necessário ao definir instruções condicionais simples e personalizadas. Por esse motivo, o Blade fornece um Blade::ifmétodo que permite definir rapidamente diretivas condicionais personalizadas usando fechamentos. Por exemplo, vamos definir uma condicional personalizada que verifica o "disco" padrão configurado para o aplicativo. Podemos fazer isso no bootmétodo de nosso AppServiceProvider:

use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Blade::if('disk', function ($value) {
        return config('filesystems.default') === $value;
    });
}
Depois que a condicional personalizada for definida, você pode usá-la em seus modelos:

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
