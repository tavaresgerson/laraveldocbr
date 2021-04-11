# Artisan

## Introdução
Artisan é a interface de linha de comando incluída no Laravel. O Artisan existe na raiz do seu aplicativo como o script `artisan` e 
fornece vários comandos úteis que podem ajudá-lo enquanto você constrói seu aplicativo. Para ver uma lista de todos os comandos Artisan 
disponíveis, você pode usar o comando `list`:

```bash
php artisan list
```

Cada comando também inclui uma tela de "ajuda" que exibe e descreve os argumentos e opções disponíveis do comando. Para visualizar uma 
tela de ajuda, preceda o nome do comando com help:

```bash
php artisan help migrate
```

#### Laravel Sail
Se você estiver usando o [Laravel Sail](https://laravel.com/docs/8.x/sail) como seu ambiente de desenvolvimento local, lembre-se de usar a 
linha `sail` de comando para invocar os comandos do Artisan. O Sail executará seus comandos Artisan dentro dos contêineres Docker de seu 
aplicativo:

```bash
./sail artisan list
```

## Tinker (REPL)
Laravel Tinker é um REPL poderoso para o framework Laravel, desenvolvido com o pacote [PsySH](https://github.com/bobthecow/psysh).

### Instalação
Todos os aplicativos Laravel incluem o Tinker por padrão. No entanto, você pode instalar o Tinker usando o Composer se você o tiver removido 
anteriormente do seu aplicativo:

```bash
composer require laravel/tinker
```

> Procurando por uma IU gráfica para interagir com seu aplicativo Laravel? Confira Tinkerwell!

### Uso
O Tinker permite que você interaja com todo o seu aplicativo Laravel na linha de comando, incluindo seus modelos do Eloquent, 
trabalhos, eventos e muito mais. Para entrar no ambiente do Tinker, execute o comando `tinker` no Artisan:

```bash
php artisan tinker
```

Você pode publicar o arquivo de configuração do Tinker usando o comando `vendor:publish`:

```bash
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> A função `dispatch` e o método `dispatch` auxiliar na classe `Dispatchable` dependem da coleta de lixo para colocar o trabalho na fila. 
> Portanto, ao usar o tinker você deve usar `Bus::dispatch` ou `Queue::push` para despachar trabalhos.

### Lista de permissão de comando
O Tinker utiliza uma lista de "permissões" para determinar quais comandos do Artisan podem ser executados em seu shell. Por padrão, 
você pode executar os comando `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `optimize`, e `up`. Se desejar permitir mais 
comandos, você pode adicioná-los ao array `commands` em seu arquivo `tinker.php` de configuração:

```php
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

### Classes que não devem ter alias
Normalmente, o Tinker cria um alias para as classes conforme você interage com elas no Tinker. No entanto, você pode nunca desejar 
criar um alias para algumas classes. Você pode fazer isso listando as classes na matriz `dont_alias` do seu arquivo `tinker.php` de configuração:

```php
'dont_alias' => [
    App\Models\User::class,
],
```

## Comandos de escrita
Além dos comandos fornecidos com o Artisan, você pode criar seus próprios comandos personalizados. Os comandos são normalmente armazenados 
no diretório `app/Console/Commands`; entretanto, você é livre para escolher seu próprio local de armazenamento, desde que seus comandos possam 
ser carregados pelo Composer.

### Gerando Comandos
Para criar um novo comando, você pode usar o comando `make:command` no Artisan. Este comando criará uma nova classe de comando no 
diretório `app/Console/Commands`. Não se preocupe se este diretório não existir em seu aplicativo - ele será criado na primeira vez que 
você executar o `make:command`:

```bash
php artisan make:command SendEmails
```

### Estrutura de Comando
Depois de gerar seu comando, você deve definir os valores apropriados para as propriedades `signature` e `description` da classe. Essas 
propriedades serão usadas ao exibir seu comando na tela `list`. A propriedad `signature` também permite que você defina as expectativas 
de entrada do seu comando. O método `handle` será chamado quando seu comando for executado. Você pode colocar sua lógica de comando neste método.

Vamos dar uma olhada em um comando de exemplo. Observe que podemos solicitar qualquer dependência necessária por meio do método `handle`. O 
container de serviço Laravel injetará automaticamente todas as dependências que são sugeridas por tipo na assinatura deste método:

```php
<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\DripEmailer;
use Illuminate\Console\Command;

class SendEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a marketing email to a user';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @param  \App\Support\DripEmailer  $drip
     * @return mixed
     */
    public function handle(DripEmailer $drip)
    {
        $drip->send(User::find($this->argument('user')));
    }
}
```

> Para maior reutilização de código, é uma boa prática manter os comandos do console leves e permitir que eles recorram aos serviços de 
> aplicativo para realizar suas tarefas. No exemplo acima, observe que injetamos uma classe de serviço para fazer o "trabalho pesado" de 
> enviar os e-mails.

### Comandos em Closure
Comandos baseados em closure fornecem uma alternativa para definir comandos de console como classes. Da mesma forma que as closures de rota 
são uma alternativa aos controladores, pense nos closures de comando como uma alternativa às classes de comando. Dentro do método `commands` 
do seu arquivo `app/Console/Kernel.php`, o Laravel carrega o arquivo `routes/console.php`:

```php
/**
 * Register the closure based commands for the application.
 *
 * @return void
 */
protected function commands()
{
    require base_path('routes/console.php');
}
```

Mesmo que este arquivo não defina rotas HTTP, ele define pontos de entrada (rotas) baseados no console em seu aplicativo. Dentro desse 
arquivo, você pode definir todos os comandos de console baseados em encerramento usando o método `Artisan::command`. O método `command` 
aceita dois argumentos: a assinatura do comando e um encerramento que recebe os argumentos e opções do comando:

```php
Artisan::command('mail:send {user}', function ($user) {
    $this->info("Sending email to: {$user}!");
});
```
O closure está vinculado à instância de comando subjacente, portanto, você tem acesso total a todos os métodos auxiliares que normalmente 
seria capaz de acessar em uma classe de comando completa.

### Dependências de sugestão de tipo
Além de receber os argumentos e opções do seu comando, os closures do comando também podem sugerir tipos de dependências adicionais que 
você gostaria de resolver fora do contêiner de serviço:

```php
use App\Models\User;
use App\Support\DripEmailer;

Artisan::command('mail:send {user}', function (DripEmailer $drip, $user) {
    $drip->send(User::find($user));
});
```

### Descrições do Comando Closure
Ao definir um comando baseado em fechamento, você pode usar o método `purpose` para adicionar uma descrição ao comando. Esta descrição será 
exibida quando você executar os comandos `php artisan list` ou `php artisan help`:

```php
Artisan::command('mail:send {user}', function ($user) {
    // ...
})->purpose('Send a marketing email to a user');
```

## Definindo as expectativas de entrada
Ao escrever comandos de console, é comum coletar dados do usuário por meio de argumentos ou opções. O Laravel torna muito conveniente definir a 
entrada que você espera do usuário usando a propriedade `signature` em seus comandos. A propriedade `signature` permite definir o nome, os argumentos 
e as opções do comando em uma sintaxe única e expressiva, semelhante a uma rota.

### Argumentos
Todos os argumentos e opções fornecidos pelo usuário são colocados entre chaves. No exemplo a seguir, o comando define um argumento obrigatório `user`::

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user}';
Você também pode tornar os argumentos opcionais ou definir valores padrão para os argumentos:

// Optional argument...
mail:send {user?}

// Optional argument with default value...
mail:send {user=foo}
```

### Opções
Opções, como argumentos, são outra forma de entrada do usuário. As opções são prefixadas por dois hifens ( --) quando são fornecidas por meio da 
linha de comando. Existem dois tipos de opções: as que recebem um valor e as que não recebem. As opções que não recebem um valor servem como uma 
"chave" booleana. Vamos dar uma olhada em um exemplo desse tipo de opção:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue}';
```

Neste exemplo, a opção `--queue` pode ser especificada ao chamar o comando Artisan. Se a opção `--queue` existir, o valor desta opção será 
`true`. Caso contrário, o valor será `false`:

```bash
php artisan mail:send 1 --queue
```

### Opções com valores
A seguir, vamos dar uma olhada em uma opção que espera um valor. Se o usuário deve especificar um valor para uma opção, você deve usar o nome 
da opção com um `=` sinal:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue=}';
```

Neste exemplo, o usuário pode passar um valor para a opção assim. Se a opção não for especificada ao invocar o comando, seu valor será `null`:

```bash
php artisan mail:send 1 --queue=default
```

Você pode atribuir valores padrão às opções, especificando o valor padrão após o nome da opção. Se nenhum valor de opção for passado pelo 
usuário, o valor padrão será usado:

```php
mail:send {user} {--queue=default}
```

### Atalhos de opções
Para atribuir um atalho ao definir uma opção, você pode especificá-lo antes do nome da opção e usar o caractere `|` como um delimitador para separar 
o atalho do nome completo da opção:

```php
mail:send {user} {--Q|queue}
```

### Matrizes de entrada
Se desejar definir argumentos ou opções para esperar vários valores de entrada, você pode usar o caractere `*`. Primeiro, vamos dar uma olhada em um 
exemplo que especifica tal argumento:

```php
mail:send {user*}
```

Ao chamar este método, os argumentos `user` podem ser passados em ordem para a linha de comando. Por exemplo, o comando a seguir definirá o valor de 
`user` para uma matriz com `foo` e `bar` como seus valores:

```bash
php artisan mail:send foo bar
```

Este caractere `*` pode ser combinado com uma definição de argumento opcional para permitir zero ou mais instâncias de um argumento:

```bash
mail:send {user?*}
```

### Matrizes de opções
Ao definir uma opção que espera vários valores de entrada, cada valor de opção passado para o comando deve ser prefixado com o nome da opção:

```php
mail:send {user} {--id=*}
```

```bash
php artisan mail:send --id=1 --id=2
```

### Descrições de entrada
Você pode atribuir descrições aos argumentos e opções de entrada, separando o nome do argumento da descrição usando dois pontos. Se você precisar 
de um pouco mais de espaço para definir seu comando, sinta-se à vontade para espalhar a definição em várias linhas:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send
                        {user : The ID of the user}
                        {--queue= : Whether the job should be queued}';
```

## Comando E / S

### Recuperando entrada
Enquanto seu comando está sendo executado, você provavelmente precisará acessar os valores dos argumentos e opções aceitos por seu comando. 
Para fazer isso, você pode usar os métodos `argument` e `option`. Se um argumento ou opção não existir, `null` será retornado:

```php
/**
 * Execute the console command.
 *
 * @return int
 */
public function handle()
{
    $userId = $this->argument('user');

    //
}
```

Se você precisar recuperar todos os argumentos como um array, chame o método `arguments`:

```php
$arguments = $this->arguments();
```

As opções podem ser recuperadas tão facilmente quanto os argumentos usando o optionmétodo. Para recuperar todas as opções como uma matriz, chame o optionsmétodo:

// Retrieve a specific option...
$queueName = $this->option('queue');

// Retrieve all options as an array...
$options = $this->options();
Solicitando entrada
Além de exibir a saída, você também pode pedir ao usuário para fornecer uma entrada durante a execução do seu comando. O askmétodo solicitará ao usuário a pergunta fornecida, aceitará sua entrada e, em seguida, retornará a entrada do usuário ao seu comando:

/**
 * Execute the console command.
 *
 * @return mixed
 */
public function handle()
{
    $name = $this->ask('What is your name?');
}
O secretmétodo é semelhante a ask, mas a entrada do usuário não será visível para ele enquanto digita no console. Este método é útil ao solicitar informações confidenciais, como senhas:

$password = $this->secret('What is the password?');
Pedindo Confirmação
Se precisar pedir ao usuário uma simples confirmação "sim ou não", você pode usar o confirmmétodo. Por padrão, este método retornará false. No entanto, se o usuário inserir you yesem resposta ao prompt, o método retornará true.

if ($this->confirm('Do you wish to continue?')) {
    //
}
Se necessário, você pode especificar que o prompt de confirmação deve retornar truepor padrão, passando truecomo o segundo argumento para o confirmmétodo:

if ($this->confirm('Do you wish to continue?', true)) {
    //
}
Preenchimento Automático
O anticipatemétodo pode ser usado para fornecer autocompletar para possíveis escolhas. O usuário ainda pode fornecer qualquer resposta, independentemente das dicas de preenchimento automático:

$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
Como alternativa, você pode passar um encerramento como o segundo argumento do anticipatemétodo. O encerramento será chamado cada vez que o usuário digitar um caractere de entrada. O encerramento deve aceitar um parâmetro de string contendo a entrada do usuário até o momento e retornar um conjunto de opções para preenchimento automático:

$name = $this->anticipate('What is your address?', function ($input) {
    // Return auto-completion options...
});
Questões de múltipla escolha
Se precisar dar ao usuário um conjunto predefinido de opções ao fazer uma pergunta, você pode usar o choicemétodo. Você pode definir o índice da matriz do valor padrão a ser retornado se nenhuma opção for escolhida, passando o índice como o terceiro argumento para o método:

$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex
);
Além disso, o choicemétodo aceita o quarto e o quinto argumentos opcionais para determinar o número máximo de tentativas de selecionar uma resposta válida e se várias seleções são permitidas:

$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex,
    $maxAttempts = null,
    $allowMultipleSelections = false
);
Saída de escrita
Para enviar a saída para o console, você pode usar os line, info, comment, question, warn, e errormétodos. Cada um desses métodos usará cores ANSI apropriadas para seus fins. Por exemplo, vamos mostrar algumas informações gerais ao usuário. Normalmente, o infométodo será exibido no console como texto de cor verde:

/**
 * Execute the console command.
 *
 * @return mixed
 */
public function handle()
{
    // ...

    $this->info('The command was successful!');
}
Para exibir uma mensagem de erro, use o errormétodo. O texto da mensagem de erro normalmente é exibido em vermelho:

$this->error('Something went wrong!');
Você pode usar o linemétodo para exibir texto simples e sem cor:

$this->line('Display this on the screen');
Você pode usar o newLinemétodo para exibir uma linha em branco:

// Write a single blank line...
$this->newLine();

// Write three blank lines...
$this->newLine(3);
Mesas
O tablemétodo torna mais fácil formatar corretamente várias linhas / colunas de dados. Tudo que você precisa fazer é fornecer os nomes das colunas e os dados da tabela e o Laravel irá calcular automaticamente a largura e altura apropriadas da tabela para você:

use App\Models\User;

$this->table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
Barras de Progresso
Para tarefas de longa execução, pode ser útil mostrar uma barra de progresso que informa aos usuários o quão concluída a tarefa está. Usando o withProgressBarmétodo, o Laravel exibirá uma barra de progresso e avançará seu progresso para cada iteração sobre um determinado valor iterável:

use App\Models\User;

$users = $this->withProgressBar(User::all(), function ($user) {
    $this->performTask($user);
});
Às vezes, você pode precisar de mais controle manual sobre como uma barra de progresso é avançada. Primeiro, defina o número total de etapas pelas quais o processo irá iterar. Em seguida, avance a barra de progresso após processar cada item:

$users = App\Models\User::all();

$bar = $this->output->createProgressBar(count($users));

$bar->start();

foreach ($users as $user) {
    $this->performTask($user);

    $bar->advance();
}

$bar->finish();

Para opções mais avançadas, verifique a documentação do componente Symfony Progress Bar .


Registrando Comandos
Todos os comandos do seu console são registrados na App\Console\Kernelclasse do seu aplicativo , que é o "kernel do console" do seu aplicativo. Dentro do commandsmétodo desta classe, você verá uma chamada para o loadmétodo do kernel . O loadmétodo varrerá o app/Console/Commandsdiretório e registrará automaticamente cada comando que ele contém com o Artisan. Você está até livre para fazer chamadas adicionais ao loadmétodo para verificar outros diretórios em busca de comandos Artisan:

/**
 * Register the commands for the application.
 *
 * @return void
 */
protected function commands()
{
    $this->load(__DIR__.'/Commands');
    $this->load(__DIR__.'/../Domain/Orders/Commands');

    // ...
}
Se necessário, você pode registrar manualmente os comandos adicionando o nome da classe do comando à $commandspropriedade da sua App\Console\Kernelclasse. Quando o Artisan é inicializado, todos os comandos listados nesta propriedade serão resolvidos pelo contêiner de serviço e registrados no Artisan:

protected $commands = [
    Commands\SendEmails::class
];
Comandos de execução programática
Às vezes, você pode desejar executar um comando Artisan fora da CLI. Por exemplo, você pode desejar executar um comando Artisan de uma rota ou controlador. Você pode usar o callmétodo na Artisanfachada para fazer isso. O callmétodo aceita o nome da assinatura do comando ou o nome da classe como seu primeiro argumento e uma matriz de parâmetros de comando como o segundo argumento. O código de saída será retornado:

use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function ($user) {
    $exitCode = Artisan::call('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    //
});
Como alternativa, você pode passar todo o comando Artisan para o callmétodo como uma string:

Artisan::call('mail:send 1 --queue=default');
Passando valores de matriz
Se o seu comando define uma opção que aceita uma matriz, você pode passar uma matriz de valores para essa opção:

use Illuminate\Support\Facades\Artisan;

Route::post('/mail', function () {
    $exitCode = Artisan::call('mail:send', [
        '--id' => [5, 13]
    ]);
});
Passando Valores Booleanos
Se você precisar especificar o valor de uma opção que não aceita valores de string, como o --forcesinalizador no migrate:refreshcomando, você deve passar trueou falsecomo o valor da opção:

$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
Enfileiramento de comandos do artesão
Usando o queuemétodo na Artisanfachada, você pode até mesmo enfileirar comandos do Artisan para que sejam processados ​​em segundo plano por seus funcionários da fila . Antes de usar este método, verifique se você configurou sua fila e está executando um listener de fila:

use Illuminate\Support\Facades\Artisan;

Route::post('/user/{user}/mail', function ($user) {
    Artisan::queue('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    //
});
Usando os métodos onConnectione onQueue, você pode especificar a conexão ou fila para onde o comando Artisan deve ser enviado:

Artisan::queue('mail:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
Chamar comandos de outros comandos
Às vezes, você pode desejar chamar outros comandos de um comando existente do Artisan. Você pode fazer isso usando o callmétodo. Este callmétodo aceita o nome do comando e uma matriz de argumentos / opções de comando:

/**
 * Execute the console command.
 *
 * @return mixed
 */
public function handle()
{
    $this->call('mail:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    //
}
Se você quiser chamar outro comando de console e suprimir todas as suas saídas, você pode usar o callSilentlymétodo. O callSilentlymétodo tem a mesma assinatura do callmétodo:

$this->callSilently('mail:send', [
    'user' => 1, '--queue' => 'default'
]);
Manuseio de Sinal
O componente Symfony Console, que alimenta o console Artisan, permite que você indique quais sinais de processo (se houver) seu comando trata. Por exemplo, você pode indicar que seu comando lida com os sinais SIGINTe SIGTERM.

Para começar, você deve implementar a Symfony\Component\Console\Command\SignalableCommandInterfaceinterface em sua classe de comando Artisan. Esta interface requer que você defina dois métodos: getSubscribedSignalse handleSignal:

<?php

use Symfony\Component\Console\Command\SignalableCommandInterface;

class StartServer extends Command implements SignalableCommandInterface
{
    // ...

    /**
     * Get the list of signals handled by the command.
     *
     * @return array
     */
    public function getSubscribedSignals(): array
    {
        return [SIGINT, SIGTERM];
    }

    /**
     * Handle an incoming signal.
     *
     * @param  int  $signal
     * @return void
     */
    public function handleSignal(int $signal): void
    {
        if ($signal === SIGINT) {
            $this->stopServer();

            return;
        }
    }
}
Como você pode esperar, o getSubscribedSignalsmétodo deve retornar uma matriz dos sinais que seu comando pode manipular, enquanto o handleSignalmétodo recebe o sinal e pode responder de acordo.

Personalização de stub
Os makecomandos do console Artisan são usados ​​para criar uma variedade de classes, como controladores, trabalhos, migrações e testes. Essas classes são geradas usando arquivos "stub" que são preenchidos com valores baseados em sua entrada. No entanto, você pode querer fazer pequenas alterações nos arquivos gerados pelo Artisan. Para fazer isso, você pode usar o stub:publishcomando para publicar os stubs mais comuns em seu aplicativo para que possa personalizá-los:

php artisan stub:publish
Os stubs publicados estarão localizados em um stubsdiretório na raiz do seu aplicativo. Quaisquer alterações feitas nesses stubs serão refletidas quando você gerar suas classes correspondentes usando os makecomandos do Artisan .

Eventos
Artisan despacha três eventos ao executar comandos: Illuminate\Console\Events\ArtisanStarting, Illuminate\Console\Events\CommandStarting, e Illuminate\Console\Events\CommandFinished. O ArtisanStartingevento é despachado imediatamente quando o Artisan começa a ser executado. Em seguida, o CommandStartingevento é despachado imediatamente antes da execução de um comando. Finalmente, o CommandFinishedevento é despachado assim que um comando termina de ser executado.
