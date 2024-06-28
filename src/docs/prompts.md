# Solicitações

<a name="introduction"></a>
## Introdução

 [Promptes de Laravel](https://github.com/laravel/prompts) é um pacote PHP que permite adicionar belos e fáceis de usar formulários às suas aplicações em linha de comando, com recursos semelhantes a um navegador, incluindo texto no lugar do campo de destino e validação.

<img src="https://laravel.com/img/docs/prompts-example.png">

 O Laravel Prompts é perfeito para aceitar a entrada do utilizador nos seus comandos de consola [Laravel Artisan](/docs/artisan#writing-commands), mas pode também ser usado em qualquer projeto de linha de comando PHP.

 > [!NOTA]
 [ Ambientes não suportados e medidas de contingência (#fallbacks).

<a name="installation"></a>
## Instalação

 O Laravel Prompts já está incluído na última versão do Laravel.

 Os prompts do Laravel também podem ser instalados em outros projetos em PHP usando o gerenciador de pacotes Composer:

```shell
composer require laravel/prompts
```

<a name="available-prompts"></a>
## Sugestões disponíveis

<a name="text"></a>
### Texto

 A função `text` solicitará ao usuário a questão fornecida, aceitará sua resposta e depois retornará ela:

```php
use function Laravel\Prompts\text;

$name = text('What is your name?');
```

 Você também pode incluir um texto de substituição, um valor padrão e uma dica informativa:

```php
$name = text(
    label: 'What is your name?',
    placeholder: 'E.g. Taylor Otwell',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a name="text-required"></a>
#### Valores Exigidos

 Se você exigir que um valor seja inserido, poderá passar o argumento `required`:

```php
$name = text(
    label: 'What is your name?',
    required: true
);
```

 Se desejar personalizar a mensagem de validação, você também pode usar uma string:

```php
$name = text(
    label: 'What is your name?',
    required: 'Your name is required.'
);
```

<a name="text-validation"></a>
#### Validação adicional

 Finalmente, se você quiser executar uma lógica de validação adicional, poderá passar um fechamento para o argumento `validade`:

```php
$name = text(
    label: 'What is your name?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

 O valor do fecho receberá o valor inserido e poderá retornar uma mensagem de erro ou `null`, caso a validação passe.

 Como alternativa, você pode aproveitar o poder da validação de Laravel. Para fazer isso, forneça um array contendo o nome do atributo e as regras de validação desejadas para o parâmetro `validate`:

```php
$name = text(
    label: 'What is your name?',
    validate: ['name' => 'required|max:255|unique:users,name']
);
```

<a name="textarea"></a>
### Textarea

 A função `textarea` irá apresentar uma questão ao utilizador, aceitar o seu input através de um espaço de texto multilinha (textarea) e então reenviá-lo:

```php
use function Laravel\Prompts\textarea;

$story = textarea('Tell me a story.');
```

 Também é possível incluir um texto de substituição, um valor por defeito e uma dica informativa:

```php
$story = textarea(
    label: 'Tell me a story.',
    placeholder: 'This is a story about...',
    hint: 'This will be displayed on your profile.'
);
```

<a name="textarea-required"></a>
#### Valores exigidos

 Se você precisar que um valor seja inserido, pode passar o argumento `required`:

```php
$story = textarea(
    label: 'Tell me a story.',
    required: true
);
```

 Se pretender personalizar a mensagem de validação, pode também facultar uma string:

```php
$story = textarea(
    label: 'Tell me a story.',
    required: 'A story is required.'
);
```

<a name="textarea-validation"></a>
#### Validação Adicional

 Se pretender executar uma lógica de validação adicional, poderá fazer o seguinte:

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: fn (string $value) => match (true) {
        strlen($value) < 250 => 'The story must be at least 250 characters.',
        strlen($value) > 10000 => 'The story must not exceed 10,000 characters.',
        default => null
    }
);
```

 O fechamento receberá o valor que foi inserido e poderá retornar uma mensagem de erro ou `null` se a validação tiver sido bem-sucedida.

 Como alternativa, você pode usar o poder da validação de Laravel. Para fazer isso, forneça um array contendo o nome do atributo e as regras de validação desejadas para o parâmetro `validate`:

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: ['story' => 'required|max:10000']
);
```

<a name="password"></a>
### Senha

 A função `password` é semelhante à função `text`, mas o texto introduzido pelo utilizador será enmascarado enquanto digitam na consola. Isto é útil ao requisitar informações confidenciais, tais como as palavras-passe:

```php
use function Laravel\Prompts\password;

$password = password('What is your password?');
```

 Também é possível incluir um texto de substituição e uma dica informativa:

```php
$password = password(
    label: 'What is your password?',
    placeholder: 'password',
    hint: 'Minimum 8 characters.'
);
```

<a name="password-required"></a>
#### Valores necessários

 Se você necessitar que um valor seja inserido, poderá passar o argumento `required`:

```php
$password = password(
    label: 'What is your password?',
    required: true
);
```

 Se você gostaria de personalizar a mensagem de validação, poderá também passar uma string:

```php
$password = password(
    label: 'What is your password?',
    required: 'The password is required.'
);
```

<a name="password-validation"></a>
#### Validação adicional

 Por último, se pretender executar uma lógica de validação adicional, pode passar um fecho (closure) para o argumento `validate`:

```php
$password = password(
    label: 'What is your password?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 8 => 'The password must be at least 8 characters.',
        default => null
    }
);
```

 O método "close" receberá o valor inserido e poderá retornar uma mensagem de erro ou `null`, caso a validação seja passada.

 Como alternativa, você pode utilizar o poder da validação de Laravel. Para fazer isso, forneça um array contendo o nome do atributo e as regras desejadas para o argumento `validate`:

```php
$password = password(
    label: 'What is your password?',
    validate: ['password' => 'min:8']
);
```

<a name="confirm"></a>
### Confirme

 Se você precisar pedir confirmação ao usuário com uma resposta "sim" ou "não", poderá usar a função `confirm`. Os usuários podem usar as teclas de seta, bem como digitar "y" (sim) ou "n" (não). Esta função retornará "true" (verdadeiro) ou "false" (falso).

```php
use function Laravel\Prompts\confirm;

$confirmed = confirm('Do you accept the terms?');
```

 Também é possível incluir um valor padrão, uma redação personalizada para as etiquetas "Sim" e "Não", bem como uma dica de informação:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    default: false,
    yes: 'I accept',
    no: 'I decline',
    hint: 'The terms must be accepted to continue.'
);
```

<a name="confirm-required"></a>
#### Exigindo "Sim"

 Se necessário, você poderá requisitar que os usuários selecionem "Sim", passando o argumento `required`:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: true
);
```

 Se quiser personalizar a mensagem de validação, você também pode passar uma string:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: 'You must accept the terms to continue.'
);
```

<a name="select"></a>
### Selecione

 Se você precisar que o usuário escolha entre um conjunto pré-definido de opções, poderá usar a função `select`:

```php
use function Laravel\Prompts\select;

$role = select(
    'What role should the user have?',
    ['Member', 'Contributor', 'Owner'],
);
```

 Também é possível especificar a escolha por defeito e uma indicação:

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    default: 'Owner',
    hint: 'The role may be changed at any time.'
);
```

 Você também pode passar um conjunto associavido para o argumento `options`, para que a chave selecionada seja devolvida ao invés do valor:

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner'
    ],
    default: 'owner'
);
```

 Até cinco opções serão exibidas antes do início da rolagem. Você pode personalizar esse valor passando o argumento `scroll`:

```php
$role = select(
    label: 'Which category would you like to assign?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="select-validation"></a>
#### Validação

 Ao contrário de outras funções de aviso, a função `select` não aceita o argumento `required` porque não é possível selecionar nada. No entanto, pode ser passado um fecho ao argumento `validate` se necessitar apresentar uma opção mas impedir que seja selecionada:

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner'
    ],
    validate: fn (string $value) =>
        $value === 'owner' && User::where('role', 'owner')->exists()
            ? 'An owner already exists.'
            : null
);
```

 Se o argumento `options` for um array associavê, a função de validação recebe a chave selecionada; caso contrário, será recebido o valor selecionado. A função pode retornar uma mensagem com erro ou `null`, caso passe na validação.

<a name="multiselect"></a>
### Seleção múltipla

 Se o usuário precisar selecionar várias opções, você pode usar a função `multi-seleção`:

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    'What permissions should be assigned?',
    ['Read', 'Create', 'Update', 'Delete']
);
```

 Também é possível especificar escolhas padrão e uma dica informativa:

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete'],
    default: ['Read', 'Create'],
    hint: 'Permissions may be updated at any time.'
);
```

 Você também pode passar um array associavido ao argumento `options` para retornar as chaves das opções selecionadas em vez de seus valores.

```php
$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete'
    ],
    default: ['read', 'create']
);
```

 Serão exibidas até cinco opções antes que a lista comece a rodar. Você pode personalizar isso passando o argumento `scroll`:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

 Você pode permitir que o usuário selecione facilmente todas as opções por meio do argumento `canSelectAll`:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    canSelectAll: true
);
```

<a name="multiselect-required"></a>
#### Exigir um valor

 Por padrão, o usuário pode selecionar uma ou mais opções. Você pode usar o argumento `required` para forçar a presença de uma ou mais opções:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: true,
);
```

 Se você deseja personalizar a mensagem de validação, poderá fornecer uma string para o argumento `required`:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: 'You must select at least one category',
);
```

<a name="multiselect-validation"></a>
#### Validação

 É possível transmitir uma lista de opções ao argumento `validate`, caso seja necessário apresentar uma opção, mas impedindo que ela seja selecionada.

```php
$permissions = multiselect(
    label: 'What permissions should the user have?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete'
    ],
    validate: fn (array $values) => ! in_array('read', $values)
        ? 'All users require the read permission.'
        : null
);
```

 Se o argumento `options` for um array associação, a função receberá as chaves selecionadas, caso contrário, ela receberá os valores selecionados. A função pode retornar uma mensagem de erro ou `null`, se a validação passar.

<a name="suggest"></a>
### Sugerir

 A função `sugest_` pode ser utilizada para disponibilizar a opção de preenchimento automático de escolhas possíveis. O utilizador ainda assim poderá fornecer qualquer resposta, independentemente das dicas de sugestão:

```php
use function Laravel\Prompts\suggest;

$name = suggest('What is your name?', ['Taylor', 'Dayle']);
```

 Como alternativa, você pode passar uma função como segundo argumento da função `suggest`. A função será chamada sempre que o usuário digitou um caractere. A função deve aceitar um parâmetro de tipo string contendo a entrada do usuário até então e retornar um array com opções para autocompletar:

```php
$name = suggest(
    'What is your name?',
    fn ($value) => collect(['Taylor', 'Dayle'])
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
)
```

 Você também pode incluir um texto de substituição, um valor por padrão e uma dica informativa:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    placeholder: 'E.g. Taylor',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a name="suggest-required"></a>
#### Valores necessários

 Se você precisar de que um valor seja preenchido, pode passar o argumento `required`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: true
);
```

 Se você deseja personalizar a mensagem de validação, você também pode passar uma string:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: 'Your name is required.'
);
```

<a name="suggest-validation"></a>
#### Validação adicional

 Finalmente, se quiser executar uma lógica de validação adicional, poderá passar um fechamento para o argumento `validate`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

 A função closure receberá o valor que foi inserido e poderá retornar uma mensagem de erro ou `null`, se a validação tiver sido bem-sucedida.

 Como alternativa, você pode usar o poder do [validador de Laravel](https://laravel.com/docs/5.8/validation). Para fazer isso, forneça um array contendo o nome do atributo e as regras de validação desejadas ao argumento `validate`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: ['name' => 'required|min:3|max:255']
);
```

<a name="search"></a>
### Busca

 Se o utilizador tiver muitas opções de seleção, a função `search` permite-lhe escrever uma consulta de pesquisa para filtrar os resultados antes de escolher uma das opções com as setas do teclado:

```php
use function Laravel\Prompts\search;

$id = search(
    'Search for the user that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

 O método de fechamento recebe o texto que foi digitado pelo usuário até então e deve retornar um array de opções. Se você retornar um array associavó, o nome do item selecionado será retornado; caso contrário, seu valor será retornado.

 Também é possível incluir texto de substituição e uma dica informativa:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

 Serão exibidas até cinco opções antes que a lista comece a ser escoada. Você pode personalizar isso passando o argumento "scroll".

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a name="search-validation"></a>
#### Validação

 Se desejar executar uma lógica de validação adicional, você pode passar um fechamento para o argumento `validate`:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (int|string $value) {
        $user = User::findOrFail($value);

        if ($user->opted_out) {
            return 'This user has opted-out of receiving mail.';
        }
    }
);
```

 Se o fecho `options` retornar um array associavó, em seguida, ele receberá a chave selecionada. Caso contrário, ele receberá o valor selecionado. O fecho poderá retornar uma mensagem de erro ou `null` se a validação passar.

<a name="multisearch"></a>
### Busca Múltipla

 Se você tiver várias opções de pesquisa e necessitar que o usuário selecione itens múltiplos, a função `multisearch` permite que o usuário digite uma consulta de busca para filtrar os resultados antes de usar as setas do teclado e a espaçosa para selecionar opções:

```php
use function Laravel\Prompts\multisearch;

$ids = multisearch(
    'Search for the users that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

 O método de fechamento recebe o texto que foi digitado pelo usuário até então e deve retornar um array de opções. Se ele retornar um array associativo, as chaves das opções selecionadas serão retornadas; caso contrário, seus valores serão retornados.

 Também é possível incluir um texto de substituição e uma dica de informação:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

 Vão ser exibidas até cinco opções antes que a lista comece a rolar. Pode personalizar isto ao fornecer o argumento `scroll`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a name="multisearch-required"></a>
#### Exigindo um valor

 Por padrão, o usuário pode selecionar opções zero ou mais. Você pode passar o argumento `required` para forçar uma ou mais opções em vez disso:

```php
$ids = multisearch(
    'Search for the users that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: true,
);
```

 Se desejar personalizar a mensagem de validação, pode fornecer uma string para o argumento `required`:

```php
$ids = multisearch(
    'Search for the users that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: 'You must select at least one user.'
);
```

<a name="multisearch-validation"></a>
#### Validação

 Se você deseja executar uma lógica de validação adicional, pode passar um fechamento para o argumento `validate`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (array $values) {
        $optedOut = User::where('name', 'like', '%a%')->findMany($values);

        if ($optedOut->isNotEmpty()) {
            return $optedOut->pluck('name')->join(', ', ', and ').' have opted out.';
        }
    }
);
```

 Se a chave de retorno do fechamento `options` for um mapeamento associativo, o fechamento receberá as chaves selecionadas; caso contrário, ele receberá os valores selecionados. O fechamento pode retornar uma mensagem de erro ou nulo se a validação der certo.

<a name="pause"></a>
### Pausa

 A função "pausa" permite mostrar ao utilizador um texto informativo e esperar que confirme a intenção de continuar premindo o teclado Enter/Retorno.

```php
use function Laravel\Prompts\pause;

pause('Press ENTER to continue.');
```

<a name="forms"></a>
## Formulários

 Muitas vezes serão exibidos vários pedidos na ordem de coleta de informações antes da execução de outros comandos. Você pode usar a função `form` para criar um grupo de pedidos para o usuário concluir:

```php
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true)
    ->password('What is your password?', validate: ['password' => 'min:8'])
    ->confirm('Do you accept the terms?')
    ->submit();
```

 O método `submit` retorna um array indexado numericamente que contém todas as respostas dos alertas do formulário. No entanto, pode fornecer um nome para cada aviso através do argumento `name`. Quando é fornecido um nome, a resposta da indicação com esse nome pode ser obtida:

```php
use App\Models\User;
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->password(
        'What is your password?',
        validate: ['password' => 'min:8'],
        name: 'password',
    )
    ->confirm('Do you accept the terms?')
    ->submit();

User::create([
    'name' => $responses['name'],
    'password' => $responses['password']
]);
```

 O principal benefício de usar a função `form` é que o utilizador tem a capacidade para voltar aos prompts anteriores no formulário usando as teclas de atalho `CTRL + U`. Isto permite ao utilizador corrigir erros ou alterar seleções sem necessitar cancelar e reiniciar todo o formulário.

 Se você precisar de um controle mais detalhado sobre uma solicitação em um formulário, poderá invocar o método `add`, ao invés de chamar diretamente uma das funções de solicitação. O método `add` recebe todas as respostas anteriores do usuário:

```php
use function Laravel\Prompts\form;
use function Laravel\Prompts\outro;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->add(function ($responses) {
        return text("How old are you, {$responses['name']}?");
    }, name: 'age')
    ->submit();

outro("Your name is {$responses['name']} and you are {$responses['age']} years old.");
```

<a name="informational-messages"></a>
## Mensagens informativas

 As funções note, info, warning, error e alert podem ser usadas para exibir mensagens informativas.

```php
use function Laravel\Prompts\info;

info('Package installed successfully.');
```

<a name="tables"></a>
## Tabelas

 A função `table` facilita a visualização de várias linhas e colunas de dados. Tudo o que você precisa fazer é fornecer os nomes das colunas e os dados da tabela:

```php
use function Laravel\Prompts\table;

table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="spin"></a>
## Spin

 A função `spin` exibe um giroscópio (ou "spinner") junto com uma mensagem opcional enquanto executa o callback especificado. Ele serve para indicar processos em andamento e retorna os resultados do callback após sua conclusão:

```php
use function Laravel\Prompts\spin;

$response = spin(
    fn () => Http::get('http://example.com'),
    'Fetching response...'
);
```

 > [ADVERTÊNCIA]
 > A função `spin` requer o módulo PHP `pcntl`. Caso este módulo não esteja disponível, será exibida uma versão estática do giroscópio em vez disso.

<a name="progress"></a>
## Barras de progresso

 Para tarefas de longa duração, é útil exibir uma barra de progresso que informe aos usuários o grau de conclusão da tarefa. Usando a função `progress`, Laravel irá mostrar uma barra de progresso e avançar seu progresso em cada iteração sobre um valor iterável:

```php
use function Laravel\Prompts\progress;

$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: fn ($user) => $this->performTask($user),
);
```

 A função `progress()` funciona como uma função de mapeamento e retornará um array contendo o valor de retorno de cada iteração do seu callback.

 A função de retorno também pode aceitar a instância de `\Laravel\Prompts\Progress`, permitindo que você modifique o rótulo e a dica em cada iteração:

```php
$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: function ($user, $progress) {
        $progress
            ->label("Updating {$user->name}")
            ->hint("Created on {$user->created_at}");

        return $this->performTask($user);
    },
    hint: 'This may take some time.',
);
```

 Às vezes, você pode precisar de um controle manual maior sobre como a barra de progresso é avançada. Primeiro, defina o número total de passos que o processo irá percorrer. Em seguida, avance na barra de progresso através do método `advance` após processar cada item:

```php
$progress = progress(label: 'Updating users', steps: 10);

$users = User::all();

$progress->start();

foreach ($users as $user) {
    $this->performTask($user);

    $progress->advance();
}

$progress->finish();
```

<a name="terminal-considerations"></a>
## Considerações sobre o terminal

<a name="terminal-width"></a>
#### Comprimento do terminal

 Se o comprimento de qualquer etiqueta, opção ou mensagem de validação exceder o número de "colunas" no terminal do usuário, ele será automaticamente truncado para caber. Considere minimizar o comprimento dessas strings se os seus usuários estiverem utilizando terminais mais estreitos. Um tamanho máximo normalmente seguro é 74 caracteres para suportar um terminal de 80 caracteres.

<a name="terminal-height"></a>
#### Alteza do terminal

 Para comandos que aceitem o argumento `scroll`, o valor configurado será reduzido automaticamente para caber na altura do terminal de um usuário, incluindo espaço para uma mensagem de validação.

<a name="fallbacks"></a>
## Ambientes não suportados e alternativas

 O Laravel Prompts suporta o macOS, o Linux e o Windows com o WSL. Em virtude de limitações na versão do Windows do PHP, não é possível utilizar o Laravel Prompts no Windows fora do ambiente de execução WSL.

 Por este motivo, o Laravel Prompts suporta a recuperação para uma implementação alternativa como o [Question Helper do Symfony Console](https://symfony.com/doc/7.0/components/console/helpers/questionhelper.html).

 > [!ATENÇÃO]
 > Ao usar os Assistentes do Laravel com o framework Laravel, os recursos de suporte aos assistentes foram configurados para você e serão ativados automaticamente em ambientes não-suportados.

<a name="fallback-conditions"></a>
#### Condições de contingência

 Se você não estiver usando o Laravel ou precisar personalizar quando o comportamento de retorno é usado, poderá passar um booleano ao método estático "fallbackWhen" da classe "Prompt":

```php
use Laravel\Prompts\Prompt;

Prompt::fallbackWhen(
    ! $input->isInteractive() || windows_os() || app()->runningUnitTests()
);
```

<a name="fallback-behavior"></a>
#### Comportamento de Retorno Automático

 Se você não estiver usando o Laravel ou precisar personalizar o comportamento de retorno, pode passar um bloco de código (closure) para o método estático `fallbackUsing` em cada classe de prompt:

```php
use Laravel\Prompts\TextPrompt;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;

TextPrompt::fallbackUsing(function (TextPrompt $prompt) use ($input, $output) {
    $question = (new Question($prompt->label, $prompt->default ?: null))
        ->setValidator(function ($answer) use ($prompt) {
            if ($prompt->required && $answer === null) {
                throw new \RuntimeException(is_string($prompt->required) ? $prompt->required : 'Required.');
            }

            if ($prompt->validate) {
                $error = ($prompt->validate)($answer ?? '');

                if ($error) {
                    throw new \RuntimeException($error);
                }
            }

            return $answer;
        });

    return (new SymfonyStyle($input, $output))
        ->askQuestion($question);
});
```

 Os fallback devem ser configurados individualmente para cada classe de prompt. O fechamento receberá uma instância da classe de prompt e deve retornar um tipo apropriado para o prompt.
