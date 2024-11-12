# Prompts

<a name="introduction"></a>
## Introdução

[Laravel Prompts](https://github.com/laravel/prompts) é um pacote PHP para adicionar formulários bonitos e fáceis de usar aos seus aplicativos de linha de comando, com recursos semelhantes aos de um navegador, incluindo texto de espaço reservado e validação.

<img src="/docs/assets/prompts-example.png">

Laravel Prompts é perfeito para aceitar a entrada do usuário em seus [comandos de console Artisan](/docs/artisan#writing-commands), mas também pode ser usado em qualquer projeto PHP de linha de comando.

::: info NOTA
Laravel Prompts suporta macOS, Linux e Windows com WSL. Para mais informações, consulte nossa documentação em [ambientes não suportados e fallbacks](#fallbacks).
:::

<a name="installation"></a>
## Instalação

Laravel Prompts já está incluído na versão mais recente do Laravel.

Os Prompts do Laravel também podem ser instalados em seus outros projetos PHP usando o gerenciador de pacotes do Composer:

```shell
composer require laravel/prompts
```

<a name="available-prompts"></a>
## Prompts disponíveis

<a name="text"></a>
### Texto

A função `text` solicitará ao usuário a pergunta fornecida, aceitará sua entrada e a retornará:

```php
use function Laravel\Prompts\text;

$name = text('What is your name?');
```

Você também pode incluir texto de espaço reservado, um valor padrão e uma dica informativa:

```php
$name = text(
    label: 'What is your name?',
    placeholder: 'E.g. Taylor Otwell',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a name="text-required"></a>
#### Valores obrigatórios

Se você precisar que um valor seja inserido, você pode passar o argumento `required`:

```php
$name = text(
    label: 'What is your name?',
    required: true
);
```

Se você quiser personalizar a mensagem de validação, você também pode passar um string:

```php
$name = text(
    label: 'What is your name?',
    required: 'Your name is required.'
);
```

<a name="text-validation"></a>
#### Validação Adicional

Finalmente, se você quiser executar lógica de validação adicional, você pode passar um *closure* para o argumento `validate`:

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

O *closure* receberá o valor que foi inserido e pode retornar uma mensagem de erro, ou `null` se a validação for aprovada.

Alternativamente, você pode aproveitar o poder do [validator](/docs/validation) do Laravel. Para fazer isso, forneça uma matriz contendo o nome do atributo e as regras de validação desejadas para o argumento `validate`:

```php
$name = text(
    label: 'What is your name?',
    validate: ['name' => 'required|max:255|unique:users,name']
);
```

<a name="textarea"></a>
### Textarea

A função `textarea` solicitará ao usuário a pergunta fornecida, aceitará sua entrada por meio de uma textarea de várias linhas e, em seguida, a retornará:

```php
use function Laravel\Prompts\textarea;

$story = textarea('Tell me a story.');
```

Você também pode incluir texto de espaço reservado, um valor padrão e uma dica informativa:

```php
$story = textarea(
    label: 'Tell me a story.',
    placeholder: 'This is a story about...',
    hint: 'This will be displayed on your profile.'
);
```

<a name="textarea-required"></a>
#### Valores Obrigatórios

Se você precisar que um valor seja inserido, você pode passar o argumento `required`:

```php
$story = textarea(
    label: 'Tell me a story.',
    required: true
);
```

Se você quiser personalizar a mensagem de validação, você também pode passar uma string:

```php
$story = textarea(
    label: 'Tell me a story.',
    required: 'A story is required.'
);
```

<a name="textarea-validation"></a>
#### Validação Adicional

Finalmente, se você quiser executar lógica de validação adicional, você pode passar um *closure* para o argumento `validate`:

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

O *closure* receberá o valor que foi inserido e pode retornar uma mensagem de erro, ou `null` se a validação for aprovada.

Como alternativa, você pode aproveitar o poder do [validator](/docs/validation) do Laravel. Para fazer isso, forneça uma matriz contendo o nome do atributo e as regras de validação desejadas para o argumento `validate`:

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: ['story' => 'required|max:10000']
);
```

<a name="password"></a>
### Senha

A função `password` é semelhante à função `text`, mas a entrada do usuário será mascarada conforme ele digita no console. Isso é útil ao solicitar informações confidenciais, como senhas:

```php
use function Laravel\Prompts\password;

$password = password('What is your password?');
```

Você também pode incluir texto de espaço reservado e uma dica informativa:

```php
$password = password(
    label: 'What is your password?',
    placeholder: 'password',
    hint: 'Minimum 8 characters.'
);
```

<a name="password-required"></a>
#### Valores obrigatórios

Se você precisar que um valor seja inserido, pode passar o argumento `required`:

```php
$password = password(
    label: 'What is your password?',
    required: true
);
```

Se quiser personalizar a mensagem de validação, também pode passar uma string:

```php
$password = password(
    label: 'What is your password?',
    required: 'The password is required.'
);
```

<a name="password-validation"></a>
#### Validação adicional

Finalmente, se quiser executar lógica de validação adicional, pode passar um *closure* para o argumento `validate`:

```php
$password = password(
    label: 'What is your password?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 8 => 'The password must be at least 8 characters.',
        default => null
    }
);
```

O *closure* receberá o valor que foi inserido e pode retornar uma mensagem de erro, ou `null` se a validação for aprovada.

Como alternativa, você pode aproveitar o poder do [validator](/docs/validation) do Laravel. Para fazer isso, forneça um array contendo o nome do atributo e as regras de validação desejadas para o argumento `validate`:

```php
$password = password(
    label: 'What is your password?',
    validate: ['password' => 'min:8']
);
```

<a name="confirm"></a>
### Confirmar

Se você precisar pedir ao usuário uma confirmação "sim ou não", você pode usar a função `confirm`. Os usuários podem usar as teclas de seta ou pressionar `y` ou `n` para selecionar sua resposta. Esta função retornará `true` ou `false`.

```php
use function Laravel\Prompts\confirm;

$confirmed = confirm('Do you accept the terms?');
```

Você também pode incluir um valor padrão, uma redação personalizada para os rótulos "Sim" e "Não" e uma dica informativa:

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

Se necessário, você pode exigir que seus usuários selecionem "Sim" passando o argumento `required`:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: true
);
```

Se você quiser personalizar a mensagem de validação, você também pode passar uma string:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: 'You must accept the terms to continue.'
);
```

<a name="select"></a>
### Selecionar

Se você precisar que o usuário selecione de um conjunto predefinido de opções, você pode usar a função `select`:

```php
use function Laravel\Prompts\select;

$role = select(
    'What role should the user have?',
    ['Member', 'Contributor', 'Owner'],
);
```

Você também pode especificar a opção padrão e uma informação dica:

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    default: 'Owner',
    hint: 'The role may be changed at any time.'
);
```

Você também pode passar uma matriz associativa para o argumento `options` para que a chave selecionada seja retornada em vez de seu valor:

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

Até cinco opções serão exibidas antes que a lista comece a rolar. Você pode personalizar isso passando o argumento `scroll`:

```php
$role = select(
    label: 'Which category would you like to assign?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="select-validation"></a>
#### Validação

Ao contrário de outras funções de prompt, a função `select` não aceita o argumento `required` porque não é possível selecionar nada. No entanto, você pode passar um *closure* para o argumento `validate` se precisar apresentar uma opção, mas impedir que ela seja selecionada:

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

Se o argumento `options` for uma matriz associativa, o *closure* receberá a chave selecionada, caso contrário, receberá o valor selecionado. O *closure* pode retornar uma mensagem de erro ou `null` se a validação for aprovada.

<a name="multiselect"></a>
### Multi-select

Se você precisa que o usuário possa selecionar várias opções, você pode usar a função `multiselect`:

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    'What permissions should be assigned?',
    ['Read', 'Create', 'Update', 'Delete']
);
```

Você também pode especificar opções padrão e uma dica informativa:

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete'],
    default: ['Read', 'Create'],
    hint: 'Permissions may be updated at any time.'
);
```

Você também pode passar uma matriz associativa para o argumento `options` para retornar as chaves das opções selecionadas em vez de seus valores:

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

Até cinco opções serão exibidas antes que a lista comece a rolar. Você pode personalizar isso passando o argumento `scroll`:

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
#### Exigindo um valor

Por padrão, o usuário pode selecionar zero ou mais opções. Você pode passar o argumento `required` para impor uma ou mais opções:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: true,
);
```

Se você quiser personalizar a mensagem de validação, você pode fornecer uma string para o argumento `required`:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: 'You must select at least one category',
);
```

<a name="multiselect-validation"></a>
#### Validação

Você pode passar um *closure* para o argumento `validate` se você precisar apresentar uma opção, mas impedir que ela seja selecionada:

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

Se o argumento `options` for uma matriz associativa, então o *closure* receberá as chaves selecionadas, caso contrário, ele receberá os valores selecionados. O *closure* pode retornar uma mensagem de erro, ou `null` se a validação for aprovada.

<a name="suggest"></a>
### Suggest

A função `suggest` pode ser usada para fornecer preenchimento automático para possíveis escolhas. O usuário ainda pode fornecer qualquer resposta, independentemente das dicas de preenchimento automático:

```php
use function Laravel\Prompts\suggest;

$name = suggest('What is your name?', ['Taylor', 'Dayle']);
```

Alternativamente, você pode passar um *closure* como o segundo argumento para a função `suggest`. O *closure* será chamado cada vez que o usuário digitar um caractere de entrada. O *closure* deve aceitar um parâmetro de string contendo a entrada do usuário até o momento e retornar uma matriz de opções para preenchimento automático:

```php
$name = suggest(
    'What is your name?',
    fn ($value) => collect(['Taylor', 'Dayle'])
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
)
```

Você também pode incluir texto de espaço reservado, um valor padrão e uma dica informativa:

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
#### Valores obrigatórios

Se você precisar que um valor seja inserido, você pode passar o argumento `required`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: true
);
```

Se você quiser personalizar a mensagem de validação, você também pode passar uma string:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: 'Your name is required.'
);
```

<a name="suggest-validation"></a>
#### Validação adicional

Finalmente, se você quiser executar lógica de validação adicional, você pode passar um *closure* para o `validate` argumento:

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

O *closure* receberá o valor que foi inserido e pode retornar uma mensagem de erro ou `null` se a validação for aprovada.

Como alternativa, você pode aproveitar o poder do [validador](/docs/validation) do Laravel. Para fazer isso, forneça uma matriz contendo o nome do atributo e as regras de validação desejadas para o argumento `validate`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: ['name' => 'required|min:3|max:255']
);
```

<a name="search"></a>
### Search

Se você tiver muitas opções para o usuário selecionar, a função `search` permite que o usuário digite uma consulta de pesquisa para filtrar os resultados antes de usar as teclas de seta para selecionar uma opção:

```php
use function Laravel\Prompts\search;

$id = search(
    'Search for the user that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

O *closure* receberá o texto que foi digitado pelo usuário até agora e deve retornar uma matriz de opções. Se você retornar uma matriz associativa, a chave da opção selecionada será retornada, caso contrário, seu valor será retornado.

Você também pode incluir texto de espaço reservado e uma dica informativa:

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

Até cinco opções serão exibidas antes que a lista comece a rolar. Você pode personalizar isso passando o argumento `scroll`:

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

Se você quiser executar lógica de validação adicional, pode passar um *closure* para o argumento `validate`:

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

Se o *closure* `options` retornar uma matriz associativa, o *closure* receberá a chave selecionada, caso contrário, receberá o valor selecionado. O *closure* pode retornar uma mensagem de erro ou `null` se a validação for aprovada.

<a name="multisearch"></a>
### Multi-search

Se você tem muitas opções pesquisáveis ​​e precisa que o usuário selecione vários itens, a função `multisearch` permite que o usuário digite uma consulta de pesquisa para filtrar os resultados antes de usar as teclas de seta e a barra de espaço para selecionar opções:

```php
use function Laravel\Prompts\multisearch;

$ids = multisearch(
    'Search for the users that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

O *closure* receberá o texto que foi digitado pelo usuário até agora e deve retornar uma matriz de opções. Se você retornar uma matriz associativa, as chaves das opções selecionadas serão retornadas; caso contrário, seus valores serão retornados.

Você também pode incluir texto de espaço reservado e uma dica informativa:

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

Até cinco opções serão exibidas antes que a lista comece a rolar. Você pode personalizar isso fornecendo o argumento `scroll`:

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

Por padrão, o usuário pode selecionar zero ou mais opções. Você pode passar o argumento `required` para impor uma ou mais opções:

```php
$ids = multisearch(
    'Search for the users that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: true,
);
```

Se você quiser personalizar a mensagem de validação, você também pode fornecer uma string para o argumento `required`:

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

Se você quiser executar lógica de validação adicional, você pode passar um *closure* para o argumento `validate`:

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

Se o *closure* `options` retornar uma matriz associativa, então o *closure* receberá as chaves selecionadas; caso contrário, ele receberá os valores selecionados. O *closure* pode retornar uma mensagem de erro ou `null` se a validação for aprovada.

<a name="pause"></a>
### Pausa

A função `pause` pode ser usada para exibir texto informativo para o usuário e esperar que ele confirme seu desejo de prosseguir pressionando a tecla Enter / Return:

```php
use function Laravel\Prompts\pause;

pause('Press ENTER to continue.');
```

<a name="forms"></a>
## Formulários

Frequentemente, você terá vários prompts que serão exibidos em sequência para coletar informações antes de executar ações adicionais. Você pode usar a função `form` para criar um conjunto agrupado de prompts para o usuário concluir:

```php
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true)
    ->password('What is your password?', validate: ['password' => 'min:8'])
    ->confirm('Do you accept the terms?')
    ->submit();
```

O método `submit` retornará uma matriz indexada numericamente contendo todas as respostas dos prompts do formulário. No entanto, você pode fornecer um nome para cada prompt por meio do argumento `name`. Quando um nome é fornecido, a resposta do prompt nomeado pode ser acessada por meio desse nome:

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

O principal benefício de usar a função `form` é a capacidade do usuário de retornar aos prompts anteriores no formulário usando `CTRL + U`. Isso permite que o usuário corrija erros ou altere seleções sem precisar cancelar e reiniciar o formulário inteiro.

Se precisar de um controle mais granular sobre um prompt em um formulário, você pode invocar o método `add` em vez de chamar uma das funções de prompt diretamente. O método `add` recebe todas as respostas anteriores fornecidas pelo usuário:

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

As funções `note`, `info`, `warning`, `error` e `alert` podem ser usadas para exibir mensagens informativas:

```php
use function Laravel\Prompts\info;

info('Package installed successfully.');
```

<a name="tables"></a>
## Tabelas

A função `table` facilita a exibição de várias linhas e colunas de dados. Tudo o que você precisa fazer é fornecer os nomes das colunas e os dados para a tabela:

```php
use function Laravel\Prompts\table;

table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="spin"></a>
## Spin

A função `spin` exibe um spinner junto com uma mensagem opcional ao executar um retorno de chamada especificado. Serve para indicar processos em andamento e retorna os resultados do retorno de chamada após a conclusão:

```php
use function Laravel\Prompts\spin;

$response = spin(
    fn () => Http::get('http://example.com'),
    'Fetching response...'
);
```

::: warning AVISO
A função `spin` requer a extensão PHP `pcntl` para animar o spinner. Quando esta extensão não estiver disponível, uma versão estática do spinner aparecerá em seu lugar.
:::

<a name="progress"></a>
## Barras de progresso

Para tarefas de longa execução, pode ser útil mostrar uma barra de progresso que informa aos usuários o quão completa a tarefa está. Usando a função `progress`, o Laravel exibirá uma barra de progresso e avançará seu progresso para cada iteração sobre um determinado valor iterável:

```php
use function Laravel\Prompts\progress;

$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: fn ($user) => $this->performTask($user),
);
```

A função `progress` atua como uma função de mapa e retornará uma matriz contendo o valor de retorno de cada iteração do seu retorno de chamada.

O retorno de chamada também pode aceitar a instância `\Laravel\Prompts\Progress`, permitindo que você modifique o rótulo e a dica em cada iteração:

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

Às vezes, você pode precisar de mais controle manual sobre como uma barra de progresso é avançada. Primeiro, defina o número total de etapas pelas quais o processo iterará. Em seguida, avance a barra de progresso por meio do método `advance` após processar cada item:

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
#### Largura do terminal

Se o comprimento de qualquer rótulo, opção ou mensagem de validação exceder o número de "colunas" no terminal do usuário, ele será automaticamente truncado para caber. Considere minimizar o comprimento dessas sequências se seus usuários estiverem usando terminais mais estreitos. Um comprimento máximo normalmente seguro é de 74 caracteres para suportar um terminal de 80 caracteres.

<a name="terminal-height"></a>
#### Altura do terminal

Para quaisquer prompts que aceitem o argumento `scroll`, o valor configurado será automaticamente reduzido para caber na altura do terminal do usuário, incluindo espaço para uma mensagem de validação.

<a name="fallbacks"></a>
## Ambientes e fallbacks não suportados

O Laravel Prompts suporta macOS, Linux e Windows com WSL. Devido a limitações na versão do PHP para Windows, atualmente não é possível usar o Laravel Prompts no Windows fora do WSL.

Por esse motivo, o Laravel Prompts suporta fallback para uma implementação alternativa, como o [Symfony Console Question Helper](https://symfony.com/doc/7.0/components/console/helpers/questionhelper.html).

::: info NOTA
Ao usar o Laravel Prompts com o framework Laravel, fallbacks para cada prompt foram configurados para você e serão habilitados automaticamente em ambientes sem suporte.
:::

<a name="fallback-conditions"></a>
#### Condições de fallback

Se você não estiver usando o Laravel ou precisar personalizar quando o comportamento de fallback for usado, você pode passar um booleano para o método estático `fallbackWhen` na classe `Prompt`:

```php
use Laravel\Prompts\Prompt;

Prompt::fallbackWhen(
    ! $input->isInteractive() || windows_os() || app()->runningUnitTests()
);
```

<a name="fallback-behavior"></a>
#### Comportamento de fallback

Se você não estiver usando o Laravel ou precisar personalizar o comportamento de fallback, você pode passar um *closure* para o método estático `fallbackUsing` em cada classe de prompt:

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

Os fallbacks devem ser configurados individualmente para cada classe de prompt. O *closure* receberá uma instância da classe de prompt e deve retornar um tipo apropriado para o prompt.
