# Prompts

<a name="introduction"></a>
## Introdução

[Laravel Prompts](https://github.com/laravel/prompts) é um pacote em PHP para acrescentar belas e amigáveis formulários para suas aplicações de linha de comando, com funcionalidades como texto de espaço reservado e validação.

<img src="https://laravel.com/img/docs/prompts-example.png">

O Laravel Prompts é perfeito para aceitar a entrada do usuário em seus [comandos de console Artisan]( /docs/artisan # writing - commands ), mas também pode ser usado em qualquer projeto PHP de linha de comando.

> Nota:
> Laravel Prompts suporta macOS, Linux e Windows com WSL. Para mais informações, veja nossa documentação sobre [ambientes não suportados e atalhos](#atalhos).

<a name="installation"></a>
## Instalação

Laravel Prompts já está incluído com a última versão do Laravel.

Laravel Prompts também pode ser instalado em seus outros projetos PHP usando o gerenciador de pacotes composer:

```shell
composer require laravel/prompts
```

<a name="available-prompts"></a>
## Prompts disponíveis

<a name="text"></a>
### Texto

A função de texto irá solicitar ao usuário a pergunta dada, aceitar sua entrada e então retornar:

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
#### Valores Obrigatórios

Se você precisa de um valor para ser inserido, você pode passar o argumento "required":

```php
$name = text(
    label: 'What is your name?',
    required: true
);
```

Se você gostaria de personalizar a mensagem de validação, você também pode passar uma string:

```php
$name = text(
    label: 'What is your name?',
    required: 'Your name is required.'
);
```

<a name="text-validation"></a>
#### Validação Adicional

Finalmente, se você quiser aplicar lógica de validação adicional, você pode passar um fechamento para o argumento 'validate':

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

O fechamento receberá o valor que foi inserido e pode retornar uma mensagem de erro ou 'nulo' se a validação passar.

Alternativamente, você pode aproveitar o poder de [validador] (/docs / validação) . Para fazer isso, forneça uma matriz contendo o nome do atributo e as regras de validação desejadas para o parâmetro validate:

```php
$name = text(
    label: 'What is your name?',
    validate: ['name' => 'required|max:255|unique:users,name']
);
```

<a name="textarea"></a>
### Textarea

A função `textarea` irá solicitar ao usuário a resposta à pergunta dada, aceitar seu texto por uma área de texto multilinha e retornar o resultado.

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
#### Valores Requeridos

Se você requer um valor a ser inserido, você pode passar o argumento 'required':

```php
$story = textarea(
    label: 'Tell me a story.',
    required: true
);
```

Se você gostaria de personalizar a mensagem de validação, você também pode passar uma string:

```php
$story = textarea(
    label: 'Tell me a story.',
    required: 'A story is required.'
);
```

<a name="textarea-validation"></a>
#### Validação adicional

Finalmente, se você quiser executar lógica de validação adicional, você pode passar um fechamento para o argumento 'validate':

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

A função de finalização receberá o valor que foi inserido e retornará uma mensagem de erro ou 'nul' se a validação passar.

Alternativamente você pode aproveitar o poder de [validator]/docs/validation) do Laravel. Para isso, forneça um array contendo o nome do atributo e as regras de validação desejadas no argumento 'validate':

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: ['story' => 'required|max:10000']
);
```

<a name="password"></a>
### Senha

A função "senha" é parecida com a função de texto, porém o usuário que digita na tela será mascarado. Isto é útil quando se está pedindo informação sensível como senhas:

```php
use function Laravel\Prompts\password;

$password = password('What is your password?');
```

Você também pode incluir texto de espaço reservado e um dica informativa:

```php
$password = password(
    label: 'What is your password?',
    placeholder: 'password',
    hint: 'Minimum 8 characters.'
);
```

<a name="password-required"></a>
#### Valores Requeridos

Se você deseja que um valor seja inserido, você pode passar o argumento `required`:

```php
$password = password(
    label: 'What is your password?',
    required: true
);
```

Se você quiser personalizar o texto de validação, você pode passar uma string também:

```php
$password = password(
    label: 'What is your password?',
    required: 'The password is required.'
);
```

<a name="password-validation"></a>
#### Validação Adicional

Finalmente, se você gostaria de executar lógica de validação adicional, você pode passar um fechamento para o argumento "valida":

```php
$password = password(
    label: 'What is your password?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 8 => 'The password must be at least 8 characters.',
        default => null
    }
);
```

O fechamento receberá o valor inserido e pode retornar uma mensagem de erro ou 'nulo' se a validação passar.

Alternativamente, você pode usar o poder de [validador](/docs/validação) em Laravel. Para isso, forneça um array contendo o nome do atributo e as regras de validação desejadas para o parâmetro "valida":

```php
$password = password(
    label: 'What is your password?',
    validate: ['password' => 'min:8']
);
```

<a name="confirm"></a>
### Confirmar

Se você precisa perguntar ao usuário por uma " confirmação de sim ou não", você pode usar a função `confirm`. Os usuários podem usar as teclas setas para selecionar sua resposta ou pressionar 'y' ou 'n'. A função retornará 'true' ou 'false'.

```php
use function Laravel\Prompts\confirm;

$confirmed = confirm('Do you accept the terms?');
```

Você pode incluir um valor padrão, palavras personalizadas para as etiquetas "Sim" e "Não" e uma dica informativa.

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

Se você gostaria de personalizar a mensagem de validação, também pode passar uma string:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: 'You must accept the terms to continue.'
);
```

<a name="select"></a>
### Selecionar

Se você precisa que o usuário selecione de um conjunto prédefinido de opções, você pode usar a função `select`:

```php
use function Laravel\Prompts\select;

$role = select(
    'What role should the user have?',
    ['Member', 'Contributor', 'Owner'],
);
```

Você também pode especificar a escolha padrão e um atalho informativo:

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    default: 'Owner',
    hint: 'The role may be changed at any time.'
);
```

Você também pode passar uma matriz associativa para o argumento `options` para obter a chave selecionada em vez do valor:

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

Até cinco opções serão exibidas antes da lista começar a rolar, você pode personalizar isso passando o argumento `scroll`:

```php
$role = select(
    label: 'Which category would you like to assign?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="select-validation"></a>
#### Validação

Ao contrário de outras funções de prompt, a função `select` não aceita o argumento `required`, porque não é possível selecionar nada. Contudo, você pode passar uma função fechada para o argumento `validate` se precisar mostrar uma opção mas impedi-la de ser selecionada:

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

Se o argumento 'options' é um array associativo, então o closures receberá a chave selecionada, caso contrário receberá o valor selecionado. O closures pode retornar uma mensagem de erro, ou 'null' se a validação for bem sucedida.

<a name="multiselect"></a>
### Selecione várias

Se você precisa que o usuário possa selecionar múltiplas opções, você pode usar a função 'multiselect':

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

Você também pode passar uma matriz associativa para o argumento "options" para retornar as chaves das opções selecionadas em vez de seus valores:

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

Até cinco opções serão mostradas antes da lista começar a rolar. Você pode personalizar isso passando o argumento 'scroll':

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

Você pode permitir que o usuário selecione todas as opções facilmente passando o parâmetro `canSelectAll`:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    canSelectAll: true
);
```

<a name="multiselect-required"></a>
#### Exigindo um Valor

Por padrão, o usuário pode selecionar zero ou mais opções. Você pode passar o argumento `required` para forçar uma ou mais opções:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: true,
);
```

Se você gostaria de personalizar a mensagem de validação, você pode fornecer uma string para o argumento 'obrigatório':

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: 'You must select at least one category',
);
```

<a name="multiselect-validation"></a>
#### Validação

Você pode passar uma opção para o argumento 'validar' se você precisa apresentar uma opção, mas impedir que ele seja selecionado:

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

Se o argumento de opções é uma matriz associativa então a função de retorno receberá as chaves selecionadas, caso contrário receberá os valores selecionados. A função de retorno pode retornar uma mensagem de erro ou "nulo" se a validação passar.

<a name="suggest"></a>
### Sugerir

A função sugerir pode ser usada para fornecer auto-conclusão para possíveis escolhas. O usuário ainda pode fornecer qualquer resposta, independentemente das dicas de auto-conclusão:

```php
use function Laravel\Prompts\suggest;

$name = suggest('What is your name?', ['Taylor', 'Dayle']);
```

Alternativamente, você pode passar um retículo como o segundo argumento da função `suggest`. O retículo será chamado cada vez que o usuário digitar um caractere de entrada. O retículo deve aceitar um parâmetro de string contendo a entrada do usuário até o momento e retornar um array de opções para auto-completar:

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
#### Valores Requeridos

Se você precisa de um valor para ser inserido, você pode passar o argumento `required`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: true
);
```

Se você gostaria de personalizar a mensagem de validação, também pode passar uma string.

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: 'Your name is required.'
);
```

<a name="suggest-validation"></a>
#### Validação Adicional

Finalmente, se você gostaria de executar lógica adicional de validação, você pode passar um fechamento para o argumento 'validate':

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

O fechamento receberá o valor que foi inserido e pode retornar uma mensagem de erro, ou nulo caso a validação passe.

Alternativamente, você pode aproveitar o poder de validação do [validator] (documentação) do Laravel. Para tanto, forneça uma matriz contendo o nome da atributo e as regras de validação desejadas para o parâmetro 'validate':

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: ['name' => 'required|min:3|max:255']
);
```

<a name="search"></a>
### Pesquisar

Se você tem muitas opções para o usuário selecionar, o 'search' permite que o usuário digite uma consulta de pesquisa e filtra os resultados antes de usar as teclas de seta para selecionar uma opção.

```php
use function Laravel\Prompts\search;

$id = search(
    'Search for the user that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

O encerramento receberá o texto que já foi digitado pelo usuário e deve retornar um array de opções. Se você retorna uma matriz associativa então a chave da opção selecionada será retornada, caso contrário seu valor será retornado em vez disso.

Você também pode incluir texto de espaço reservado e um dica informativa:

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

Se você quiser executar lógica de validação adicional, você pode passar um encerramento para o argumento "validate":

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

Se o `options` for uma função que retorna um array associativo, então a função receberá a chave selecionada, caso contrário, receberá o valor selecionado. A função pode retornar uma mensagem de erro ou `null` se a validação passar.

<a name="multisearch"></a>
### Pesquisa múltipla

Se você tiver muitas opções pesquisáveis e precisar que o usuário possa selecionar mais de uma opção, o recurso multisearch permite ao usuário digitar um termo de pesquisa para filtrar os resultados antes de usar as teclas seta e barra de espaço para selecionar opções.

```php
use function Laravel\Prompts\multisearch;

$ids = multisearch(
    'Search for the users that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

O closure receberá o texto que foi digitado pelo usuário até agora e deve retornar uma matriz de opções. Se você retornar uma matriz associativa, então as chaves das opções selecionadas serão retornadas; caso contrário, seus valores serão retornados em vez disso.

Você também pode incluir texto de espaço reservado e um dica informativa:

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
#### Exigindo um Valor

Por padrão, o usuário pode selecionar zero ou mais opções. Você pode passar o argumento `requerido` para impor uma ou mais opções em vez disso:

```php
$ids = multisearch(
    'Search for the users that should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: true,
);
```

Se você gostaria de personalizar a mensagem de validação, você também pode fornecer uma string para o argumento `requerido`:

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

Se você gostaria de executar lógica adicional de validação, você pode passar um fechamento para o argumento "valida":

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

Se a função `options` retornar uma matriz associativa, então a função receberá as chaves selecionadas. Caso contrário, ela receberá os valores selecionados. A função pode retornar uma mensagem de erro ou um valor nulo caso a validação seja realizada com sucesso.

<a name="pause"></a>
### Pausa

A função 'pausa' pode ser usada para exibir texto informativo ao usuário e esperar que ele confirme seu desejo de prosseguir, pressionando as teclas enter ou return.

```php
use function Laravel\Prompts\pause;

pause('Press ENTER to continue.');
```

<a name="forms"></a>
## Formas

Com frequência, você terá múltiplas solicitações que serão exibidas em sequência para coletar informações antes de realizar ações adicionais. Você pode usar a função 'form' para criar um conjunto agrupado de solicitações para o usuário completar:

```php
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true)
    ->password('What is your password?', validate: ['password' => 'min:8'])
    ->confirm('Do you accept the terms?')
    ->submit();
```

O método "submit" retornará uma matriz de índice numérico contendo todas as respostas do formulário. Contudo, você pode fornecer um nome para cada prompt através do argumento "nome". Quando um nome é fornecido, a resposta do prompt nomeado poderá ser acessada através desse mesmo nome.

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

O principal benefício de usar a função 'Form' é a capacidade do usuário em retornar aos prompts anteriores no formulário usando 'Ctrl + U'. Isso permite que o usuário corrija erros ou altere suas seleções sem precisar cancelar e reiniciar todo o formulário.

Se você precisa de mais controle granular sobre uma entrada em um formulário, você pode invocar o método 'adicionar' em vez de chamar uma das funções de entrada diretamente. O método 'adicionar' recebe todas as respostas anteriores fornecidas pelo usuário:

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

As funções 'note', 'info', 'warning', 'error' e 'alert' podem ser usadas para exibir mensagens informativas.

```php
use function Laravel\Prompts\info;

info('Package installed successfully.');
```

<a name="tables"></a>
## Mesa

A função "table" facilita a exibição de múltiplas linhas e colunas de dados. Tudo o que você precisa fazer é fornecer os nomes das colunas e os dados para a tabela:

```php
use function Laravel\Prompts\table;

table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="spin"></a>
## Frenético

A função "spin" exibe uma roda giratória junto com uma mensagem opcional enquanto executa um retorno de chamada especificado. Ele serve para indicar processos em andamento e retorna os resultados do retorno de chamada quando a conclusão é:

```php
use function Laravel\Prompts\spin;

$response = spin(
    fn () => Http::get('http://example.com'),
    'Fetching response...'
);
```

> [!ALERTA]
> A função "spin" requer a extensão "pcntl" do PHP para animar o spinner. Quando esta extensão não está disponível, uma versão estática do spinner aparecerá em vez disso.

<a name="progress"></a>
## Barras de Progresso

Para tarefas longas, é possível mostrar uma barra de progresso que informe aos usuários o quão completo está o trabalho. Utilizando a função "progress", o Laravel irá exibir uma barra de progresso e avançar seu progresso em cada iteração sobre um valor iterável dado:

```php
use function Laravel\Prompts\progress;

$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: fn ($user) => $this->performTask($user),
);
```

A função `progress` funciona como uma função de mapa, e retornará um array contendo o valor de retorno de cada iteração do seu callback.

O callback também pode aceitar a instância `\Laravel\Prompts\Progress`, permitindo que você modifique o rótulo e a dica em cada iteração.

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

Às vezes, você pode precisar de um controle manual sobre como uma barra de progresso é avançada. Primeiro, defina o número total de etapas que o processo irá iterar através. Em seguida, avance a barra de progresso através do método 'avance' após processar cada item:

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
## Considerações Finais

<a name="terminal-width"></a>
#### Largura do terminal

Se o comprimento de qualquer etiquetação ou mensagem de validação exceder o número de "colunas" do terminal do usuário, ele será automaticamente truncado para se encaixar. Considere minimizar o comprimento dessas strings se seus usuários podem estar usando terminais mais estreitos. Um limite seguro típico é 74 caracteres para suportar um terminal de 80 caracteres.

<a name="terminal-height"></a>
#### Altura do terminal

Para qualquer prompt que aceite o argumento de `scroll`, o valor configurado será automaticamente reduzido para caber na altura do terminal do usuário, incluindo espaço para uma mensagem de validação.

<a name="fallbacks"></a>
## Ambientes Incomuns e Recuperações

Laravel prompts suporta macOS, Linux e Windows com WSL. Devido a limitações na versão do Windows de PHP, não é possível usar o Laravel prompts no momento fora do WSL em um Windows.

Por este motivo, o Laravel Prompt suporta cair de volta para uma implementação alternativa como o [Symfony Console Question Helper](https://symfony.com/doc/7.0/components/console/helpers/questionhelper.html).

> [!NOTE]
> Quando você estiver usando os prompts do Laravel com o framework Laravel, para cada prompt que você usar foi configurado um fallback e ele será automaticamente habilitado em ambientes não suportados.

<a name="fallback-conditions"></a>
#### Condições de queda

Se você não está usando o Laravel ou precisa de personalizar quando o comportamento padrão é usado, você pode passar um booleano para o método estático `fallbackWhen` na classe Prompt:

```php
use Laravel\Prompts\Prompt;

Prompt::fallbackWhen(
    ! $input->isInteractive() || windows_os() || app()->runningUnitTests()
);
```

<a name="fallback-behavior"></a>
#### Comportamento de Recuperação

Se você não estiver usando o Laravel ou precisar personalizar o comportamento de fallback, você pode passar um método de fechamento para o método estático `fallbackUsing` em cada classe de solicitação:

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

Os fallback devem ser configurados individualmente para cada classe de prompt. O encerramento receberá uma instância da classe de prompt e deve retornar um tipo apropriado para o prompt.
