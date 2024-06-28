#  Console Artisan

##  Introdução

O Artisan é o interface de linha de comando incluído no Laravel. O Artisan está na raiz da sua aplicação como um script e fornece uma série de comandos úteis que podem ajudá-lo enquanto você constrói a sua aplicação. Para ver uma lista de todos os comandos disponíveis do Artisan, utilize o comando `list`:

```shell
php artisan list
```

Todos os comandos incluem também uma tela de ajuda que descreve os argumentos e opções disponíveis. Para visualizar a tela de ajuda, anteceda o nome do comando com "help":

```shell
php artisan help migrate
```

<a name="laravel-sail"></a>
#### Onde estão as instruções do Laravel Sail?

 Se você estiver usando o [Laravel Sail](/sail) como seu ambiente de desenvolvimento local, lembre-se de usar a linha de comando `sail` para invocar os comandos do Artisan. O Sail executará seus comandos do Artisan dentro dos containers Docker do aplicativo:

```shell
./vendor/bin/sail artisan list
```

<a name="tinker"></a>
### Tinker (REPL)

 O Laravel Tinker é um poderoso REPL para o framework Laravel, impulsionado pelo pacote [PsySH](https://github.com/bobthecow/psysh).

<a name="installation"></a>
####  Instalação

 Todos os aplicativos do Laravel incluem o Tinker por padrão. No entanto, você pode instalar o Tinker usando o Composer se tiver removido o programa da sua aplicação previamente:

```shell
composer require laravel/tinker
```

::: info NOTA
[O que é o Tinkerwell?](https://tinkerwell.app)!
:::

<a name="usage"></a>
####  Uso

O Tinker permite interagir com toda a aplicação do Laravel na linha de comando, incluindo modelos Eloquent, tarefas, eventos e muito mais. Para iniciar o ambiente do Tinker, execute a ordem de serviço "tinker":

```shell
php artisan tinker
```

 Você pode publicar o arquivo de configuração do Tinker usando o comando `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

::: warning AVISO
A função de ajuda `dispatch` e o método `dispatch` na classe `Dispatchable` dependem da coleta de lixo para colocar o trabalho na fila. Sendo assim, ao usar o tinker, você deve usar a função `Bus::dispatch` ou `Queue::push` para encaminhar trabalhos.
:::

<a name="command-allow-list"></a>
####  Lista de permissão

 O Tinker utiliza uma lista de "permissões" para determinar quais comandos do Artisan podem ser executados na sua shell. Por padrão, você pode executar os comandos `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `optimize` e `up`. Se você deseja permitir mais comandos, é possível adicioná-los ao array `commands` do seu arquivo de configuração `tinker.php`:

```php
    'commands' => [
        // App\Console\Commands\ExampleCommand::class,
    ],
```

<a name="classes-that-should-not-be-aliased"></a>
####  Clases que não devem ser associadas

 Normalmente, o Tinker atribui automaticamente nomes às classes conforme interage com elas no próprio Tinker. No entanto, você pode não querer atribuir nomes a algumas classes. Você pode fazer isso listando as classes no array `dont_alias` do arquivo de configuração `tinker.php`:

```php
    'dont_alias' => [
        App\Models\User::class,
    ],
```

<a name="writing-commands"></a>
## Comandos de escrita

 Além dos comandos fornecidos com o Artisan, você pode criar seus próprios comandos personalizados. Geralmente, os comandos são armazenados no diretório `app/Console/Commands`. No entanto, você é livre para escolher seu próprio local de armazenamento desde que seus comandos possam ser carregados pelo Composer.

<a name="generating-commands"></a>
### Comandos de geração

 Para criar um novo comando, você pode usar o comando do Artisan `make:command`. Este comando irá criar uma nova classe de comando na pasta `app/Console/Commands`. Não se preocupe se essa pasta não existir em sua aplicação - ela será criada na primeira vez que você executar o comando do Artisan `make:command`:

```shell
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### Estrutura de Comando

Depois de gerar seu comando, você deve definir valores apropriados para as propriedades `signature` e `description` da classe. Estas propriedades serão usadas ao exibir seu comando na tela `list`. A propriedade `signature` também permite que você defina [expectativas de entrada do seu comando](defining-input-expectations). O método `handle` será chamado quando seu comando for executado. Você pode colocar sua lógica de comando nesse método.

 Vamos dar uma olhada em um comando de exemplo. Note que podemos solicitar quaisquer dependências necessárias por meio do método `handle` do comando. O contêiner [de serviços] Laravel ([conjunto de serviços)](/docs/{{ version }}/container) injetará automaticamente todas as dependências indicadas no tipo em sua assinatura:

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
         * Execute the console command.
         */
        public function handle(DripEmailer $drip): void
        {
            $drip->send(User::find($this->argument('user')));
        }
    }
```

 > [!NOTA]
 > Para melhor reutilização de código, é uma boa prática manter os comandos da console leves e deixar que os serviços de aplicativo assegurem suas tarefas. No exemplo acima, observe que injetamos uma classe de serviço para executar a "tarefa pesada" de enviar os e-mails.

<a name="exit-codes"></a>
####  Códigos de saída

 Se nada for retornado da função `handle` e o comando executar-se bem, o comando sairá com um código de saída `0`, indicando sucesso. No entanto, a função `handle` pode retornar opcionalmente um número inteiro para especificar manualmente o código de saída do comando:

```php
    $this->error('Something went wrong.');

    return 1;
```

 Se pretender "deixar de executar" o comando em qualquer método no contexto do comando, poderá utilizar o método fail. O método fail interrompe imediatamente a execução do comando e retorna um código de saída de 1:

```php
    $this->fail('Something went wrong.');
```

<a name="closure-commands"></a>
###  Comandos de encerramento

 Os comandos baseados em fechamento fornecem uma alternativa para a definição de comandos do console como classes. Da mesma forma que os fechamentos de rotas são uma alternativa aos controladores, pense nos fechamentos de comando como uma alternativa às classes de comando.

 Ainda que o arquivo `routes/console.php` não defina rotas HTTP, ele define pontos de entrada baseados em console na sua aplicação. Nesse arquivo, você pode definir todos os seus comandos de console com base em closures usando o método `Artisan::command`. O método `command` aceita dois argumentos: a assinatura do comando e um closure que recebe os argumentos e as opções do comando:

```php
    Artisan::command('mail:send {user}', function (string $user) {
        $this->info("Sending email to: {$user}!");
    });
```

 O fecho está associado à instância do comando subjacente, pelo que tem total acesso a todos os métodos de ajuda aos quais normalmente teria acesso numa classe de comando completa.

<a name="type-hinting-dependencies"></a>
####  Tipos e dependências de indicação

 Além de receber os argumentos e opções do comando, as regras de comandos também podem indicar dependências adicionais que você gostaria que fossem resolvidas pelo [conjunto de serviços](/docs/11.x/container):

```
    use App\Models\User;
    use App\Support\DripEmailer;

    Artisan::command('mail:send {user}', function (DripEmailer $drip, string $user) {
        $drip->send(User::find($user));
    });
```

<a name="closure-command-descriptions"></a>
####  Descrições do comando de fecho

 Ao definir um comando baseado em fechamento é possível usar o método `purpose` para adicionar uma descrição ao comando. Essa descrição será exibida quando você executar os comandos `php artisan list` ou `php artisan help`:

```php
    Artisan::command('mail:send {user}', function (string $user) {
        // ...
    })->purpose('Send a marketing email to a user');
```

<a name="isolatable-commands"></a>
###  Comandos isoláveis

 > [AVISO]
 > Para usar esse recurso, seu aplicativo deve utilizar o driver de cache `memcached`, `redis`, `dynamodb`, `database`, `file` ou `array` como driver de cache padrão da sua aplicação. Além disso, todos os servidores devem se comunicar com o mesmo servidor central de cache.

 Algumas vezes, você pode querer garantir que apenas uma única instância de um comando seja executada por vez. Para fazer isso, você pode implementar a interface `Illuminate\Contracts\Console\Isolatable` em sua classe de comando:

```php
    <?php

    namespace App\Console\Commands;

    use Illuminate\Console\Command;
    use Illuminate\Contracts\Console\Isolatable;

    class SendEmails extends Command implements Isolatable
    {
        // ...
    }
```

 Quando um comando é marcado como `Isolável`, o Laravel adicionará automaticamente uma opção `--isolada` ao comando. Se esse comando for invocado com essa opção, o Laravel irá garantir que nenhuma outra instância do mesmo comando esteja em execução. Para fazer isso, o Laravel tenta adquirir um bloqueio atômico usando o driver de cache padrão da sua aplicação. Se outras instâncias do comando estiverem em execução, ele não será executado. No entanto, o comando ainda sairá com um código de status de saída bem-sucedido:

```shell
php artisan mail:send 1 --isolated
```

 Se você desejar especificar o código de status da saída do comando que será retornado caso ele não seja capaz de executar, poderá fornecer a senha desejada através da opção `isolated`:

```shell
php artisan mail:send 1 --isolated=12
```

<a name="lock-id"></a>
####  Identificador de Bloqueio

 Por padrão, o Laravel usará o nome do comando para gerar a chave de string que será usada para obter o bloqueio atômico no cache da sua aplicação. No entanto, você pode personalizar essa chave definindo um método `isolatableId` na classe de comando Artisan, permitindo integrar os argumentos ou opções do comando à chave:

```php
/**
 * Get the isolatable ID for the command.
 */
public function isolatableId(): string
{
    return $this->argument('user');
}
```

<a name="lock-expiration-time"></a>
####  Hora de expiração do bloqueio

 Por padrão, os bloqueios de isolamento são cancelados quando o comando estiver terminado. Caso o comando seja interrompido ou incapaz de ser executado, o bloqueio será cancelado após uma hora. No entanto, você pode ajustar esse tempo no seu comando ao definir um método `isolationLockExpiresAt`:

```php
use DateTimeInterface;
use DateInterval;

/**
 * Determine when an isolation lock expires for the command.
 */
public function isolationLockExpiresAt(): DateTimeInterface|DateInterval
{
    return now()->addMinutes(5);
}
```

<a name="defining-input-expectations"></a>
##  Definindo as expetativas relativamente ao input

 Na escrita de comandos de console é comum obter dados do usuário através de argumentos ou opções. O Laravel torna muito prático o definição da informação que você espera do usuário utilizando a propriedade `signature` em seus comandos. A propriedade `signature` permite definir o nome, argumentos e opções para um comando em um único formato sintático como um URL.

<a name="arguments"></a>
###  Argumentos

 Todos os argumentos e opções fornecidos pelo usuário estão envoltos em aspas duplas. No exemplo a seguir, o comando define um único argumento obrigatório: `user`.

```php
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user}';
```

 Você também pode tornar os argumentos opcionais ou definir valores por padrão para eles:

```php
    // Optional argument...
    'mail:send {user?}'

    // Optional argument with default value...
    'mail:send {user=foo}'
```

<a name="options"></a>
###  Opções

 Opções, assim como argumentos, são outra forma de entrada do usuário. As opções têm um prefixo de dois traços (-) quando fornecidas pela linha de comando. Existem dois tipos de opção: as que recebem um valor e aquelas que não o fazem. As opções que não recebem um valor servem como "interruptor" booleano. Vamos examinar um exemplo desse tipo de opção:

```php
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user} {--queue}';
```

 Neste exemplo, a opção `--queue` pode ser especificada ao chamar o comando Artisan. Se esta opção for passada, o valor da opção será `true`. Caso contrário, o valor será `false`:

```shell
php artisan mail:send 1 --queue
```

<a name="options-with-values"></a>
#### Opções com valores

 Vamos agora analisar uma opção que espera um valor. Se o usuário tiver de especificar um valor para uma opção, deve sufixá-la com um sinal de igual (=):

```php
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user} {--queue=}';
```

 Neste exemplo, o usuário pode passar um valor para essa opção da seguinte maneira. Se não especificada ao invocar o comando, sua opção será `null` (nulo):

```shell
php artisan mail:send 1 --queue=default
```

 Você pode atribuir valores por padrão para opções ao especificar o valor padrão após o nome da opção. Se nenhum valor de opção for passado pelo usuário, será utilizado o valor padrão:

```php
    'mail:send {user} {--queue=default}'
```

<a name="option-shortcuts"></a>
####  Atalhos de opções

 Para atribuir um atalho ao definir uma opção, pode especificá-la antes do nome da mesma e utilizar o caractere "|" como separador para separar o atalho do nome completo da opção:

```php
    'mail:send {user} {--Q|queue}'
```

Quando você inicia o comando em seu terminal, os atalhos de opção devem ser precedidos por um hífen simples e não deve haver nenhum caractere `=` incluído ao especificar o valor da opção:

```shell
  php artisan mail:send 1 -Qdefault
```

<a name="input-arrays"></a>
###  Matrizes de Entrada

 Se desejar definir um argumento ou opção com vários valores esperados, pode utilizar o caractere `*`. Primeiro, vamos ver um exemplo que especifica tal argumento:

```php
    'mail:send {user*}'
```

 Ao chamar este método, os argumentos 'user' podem ser passados na linha de comando. Por exemplo, o seguinte comando definirá o valor do 'user' como um array com valores '1' e '2':

```shell
php artisan mail:send 1 2
```

 Este caractere asterisco (*) pode ser combinado com uma definição opcional de argumento para permitir zero ou mais instâncias de um argumento.

```php
    'mail:send {user?*}'
```

<a name="option-arrays"></a>
####  Opções de Matriz

 Quando você definir uma opção que espera vários valores de entrada, cada valor da opção passado ao comando deve ser prefixado com o nome da opção.

```php
    'mail:send {--id=*}'
```

 É possível invocar esse comando ao passar vários argumentos `--id`:

```shell
php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
###  Descrições do input

 Você pode atribuir descrições para os argumentos e opções de entrada, separando o nome do argumento da descrição usando um ponto. Se você precisar de um pouco de espaço extra para definir seu comando, sinta-se à vontade para espalhar a definição em várias linhas:

```php
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send
                            {user : The ID of the user}
                            {--queue : Whether the job should be queued}';
```

<a name="prompting-for-missing-input"></a>
###  Pedido de informações em falta

 Se o seu comando contiver argumentos obrigatórios, o usuário receberá uma mensagem de erro quando estes não forem fornecidos. Como alternativa, pode configurar o comando para solicitar automaticamente ao utilizador os dados quando forem faltar argumentos obrigatórios ao implementar a interface `PromptsForMissingInput`:

```php
    <?php

    namespace App\Console\Commands;

    use Illuminate\Console\Command;
    use Illuminate\Contracts\Console\PromptsForMissingInput;

    class SendEmails extends Command implements PromptsForMissingInput
    {
        /**
         * The name and signature of the console command.
         *
         * @var string
         */
        protected $signature = 'mail:send {user}';

        // ...
    }
```

 Se o Laravel precisar coletar um argumento requerido do usuário, ele irá pedir automaticamente ao usuário pelo argumento utilizando uma frase inteligente contendo o nome ou descrição do argumento. Caso você queira personalizar a pergunta usada para coleta do argumento requerido, poderá implementar o método `promptForMissingArgumentsUsing`, retornando um array de perguntas, com as informações dos nomes dos argumentos:

```php
    /**
     * Prompt for missing input arguments using the returned questions.
     *
     * @return array<string, string>
     */
    protected function promptForMissingArgumentsUsing(): array
    {
        return [
            'user' => 'Which user ID should receive the mail?',
        ];
    }
```

 Você também poderá inserir um texto de substituição usando uma sequência contendo a pergunta e seu texto de substituição:

```php
    return [
        'user' => ['Which user ID should receive the mail?', 'E.g. 123'],
    ];
```

 Se você desejar ter controle total sobre o prompt, poderá fornecer um fechamento que deverá solicitar ao usuário uma resposta e retornar o valor dela:

```php
    use App\Models\User;
    use function Laravel\Prompts\search;

    // ...

    return [
        'user' => fn () => search(
            label: 'Search for a user:',
            placeholder: 'E.g. Taylor Otwell',
            options: fn ($value) => strlen($value) > 0
                ? User::where('name', 'like', "%{$value}%")->pluck('name', 'id')->all()
                : []
        ),
    ];
```

 > [!AVERTISSEMENDO]
 A documentação abrangente de [Pedidos Laravel] (https://laravel.com/docs/5.8#prompts), inclui informações adicionais sobre os pedidos disponíveis e seu uso.

 Se você quiser solicitar ao usuário que selecione ou introduza as opções [#options], pode incluir perguntas na ordem de execução do comando. No entanto, se você desejar solicitar somente quando houver sido automaticamente solicitado os argumentos faltantes, poderá implementar o método `afterPromptingForMissingArguments`:

```php
    use Symfony\Component\Console\Input\InputInterface;
    use Symfony\Component\Console\Output\OutputInterface;
    use function Laravel\Prompts\confirm;

    // ...

    /**
     * Perform actions after the user was prompted for missing arguments.
     */
    protected function afterPromptingForMissingArguments(InputInterface $input, OutputInterface $output): void
    {
        $input->setOption('queue', confirm(
            label: 'Would you like to queue the mail?',
            default: $this->option('queue')
        ));
    }
```

<a name="command-io"></a>
##  Entrada/Saída de comandos

<a name="retrieving-input"></a>
###  Recuperando dados de entrada

 Enquanto o comando estiver sendo executado, é provável que você precise acessar os valores dos argumentos e opções aceitos pelo comando. Para fazer isso, você pode usar os métodos `argument` e `option`. Se um argumento ou uma opção não existir, será retornado `null`:

```php
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $userId = $this->argument('user');
    }
```

 Se precisar recuperar todos os argumentos como um `array`, use o método `arguments`:

```php
    $arguments = $this->arguments();
```

 As opções podem ser recuperadas da mesma forma que os argumentos usando o método `option`. Para recuperar todas as opções como um array, chame o método `options`:

```php
    // Retrieve a specific option...
    $queueName = $this->option('queue');

    // Retrieve all options as an array...
    $options = $this->options();
```

<a name="prompting-for-input"></a>
### Solicitar introdução

 > [!ATENÇÃO]
 O [Prompt de Laravel](/docs/11.x/prompts) é um pacote para adição de formulários bonitos e amigáveis ao seu aplicativo de linha de comando, com recursos semelhantes aos de um browser, incluindo texto-plano e validação.

 Além de exibir a saída, você também pode pedir para o usuário fornecer entrada durante a execução do seu comando. O método `ask` irá solicitar ao usuário uma pergunta específica e, em seguida, retornará a resposta dele ao seu comando:

```php
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $name = $this->ask('What is your name?');

        // ...
    }
```

 O método `ask` também aceita um segundo argumento opcional, que especifica o valor padrão a ser retornado se nenhuma entrada do usuário for fornecida.

```php
    $name = $this->ask('What is your name?', 'Taylor');
```

 O método `secret` é semelhante ao `ask`, mas a entrada do usuário não será exibida no momento da sua digitação na consola. Este método pode ser útil quando necessitar de informações confidenciais, como as senhas:

```php
    $password = $this->secret('What is the password?');
```

<a name="asking-for-confirmation"></a>
####  Pedir confirmação

 Se necessário pedir ao usuário uma confirmação "sim/não", poderá utilizar a função `confirm`. Por padrão, esta função retorna `false`. Contudo, se o usuário inserir "y" ou "sim" como resposta à indicação, a função irá retornar `true`.

```php
    if ($this->confirm('Do you wish to continue?')) {
        // ...
    }
```

 Caso seja necessário, você pode especificar que o aviso de confirmação deve retornar `true` por padrão ao passar `true` como segundo argumento para o método `confirm`:

```php
    if ($this->confirm('Do you wish to continue?', true)) {
        // ...
    }
```

<a name="auto-completion"></a>
####  Completamento automático

 O método `anticipate` pode ser usado para dar sugestões de respostas ao utilizador. O utilizador ainda pode fornecer qualquer resposta, independentemente das dicas de preenchimento automático:

```php
    $name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
```

 Como alternativa, você pode passar um closura como o segundo argumento ao método `anticipate`. O closura será chamado a cada vez que o usuário digitar um caractere. O closura deve aceitar um parâmetro de tipo string contendo as entradas do usuário até agora e retornar um array de opções para auto-completar:

```php
    $name = $this->anticipate('What is your address?', function (string $input) {
        // Return auto-completion options...
    });
```

<a name="multiple-choice-questions"></a>
####  Perguntas de Escolha Múltipla

 Se você precisar fornecer ao usuário um conjunto predefinido de opções quando fazer uma pergunta, poderá usar o método `choice`. Pode definir o índice do array para a opção padrão a ser retornada se nenhuma opção for escolhida, passando o índice como o terceiro argumento ao método:

```php
    $name = $this->choice(
        'What is your name?',
        ['Taylor', 'Dayle'],
        $defaultIndex
    );
```

 Além disso, o método `choice` aceita quatro e cinco argumentos opcionais para determinar o número máximo de tentativas para selecionar uma resposta válida e se permitem várias seleções:

```php
    $name = $this->choice(
        'What is your name?',
        ['Taylor', 'Dayle'],
        $defaultIndex,
        $maxAttempts = null,
        $allowMultipleSelections = false
    );
```

<a name="writing-output"></a>
###  Saída do script

 Para enviar saída para a consola, pode utilizar os métodos `line`, `info`, `comment`, `question`, `warn` e `error`. Cada um destes métodos irá usar cores ANSI apropriadas para o seu objetivo. Por exemplo, vamos mostrar algumas informações gerais ao utilizador. Normalmente, o método `info` irá mostrar na consola como texto colorido verde:

```php
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        // ...

        $this->info('The command was successful!');
    }
```

 Para exibir uma mensagem de erro, utilize o método `error`. O texto da mensagem de erro é exibido normalmente em vermelho:

```php
    $this->error('Something went wrong!');
```

 Pode utilizar o método `line` para apresentar um texto puro e não colorido:

```php
    $this->line('Display this on the screen');
```

 Você pode usar o método `newLine` para exibir uma nova linha em branco:

```php
    // Write a single blank line...
    $this->newLine();

    // Write three blank lines...
    $this->newLine(3);
```

<a name="tables"></a>
####  Tabelas

 O método `table` facilita o formatação correta de várias linhas/colunas de dados. Só é necessário indicar os nomes das colunas e os seus respectivos dados, sendo que o Laravel cuidará de tudo o mais.
 O Excel calculará automaticamente o comprimento e largura apropriados da tabela para você:

```php
    use App\Models\User;

    $this->table(
        ['Name', 'Email'],
        User::all(['name', 'email'])->toArray()
    );
```

<a name="progress-bars"></a>
####  Barras de progresso

 Para tarefas que demoram mais tempo, pode ser útil mostrar uma barra de progresso que informe os usuários do grau de conclusão da tarefa. Usando o método `withProgressBar`, Laravel exibirá uma barra de progresso e avançará sua progressão para cada iteração sobre um determinado valor iterável:

```php
    use App\Models\User;

    $users = $this->withProgressBar(User::all(), function (User $user) {
        $this->performTask($user);
    });
```

 Às vezes, você pode precisar de mais controle manual sobre como um indicador de andamento é avançado. Primeiro defina o número total de etapas que o processo vai percorrer e depois avance o indicador de andamento após o processamento de cada item:

```php
    $users = App\Models\User::all();

    $bar = $this->output->createProgressBar(count($users));

    $bar->start();

    foreach ($users as $user) {
        $this->performTask($user);

        $bar->advance();
    }

    $bar->finish();
```

::: info NOTA
 [Documentação da componente de barra de progresso do Symfony](https://symfony.com/doc/7.0/components/console/helpers/progressbar.html).
:::

<a name="registering-commands"></a>
## Registo de comandos

Por padrão, o Laravel registra automaticamente todos os comandos na pasta `app/Console/Commands`. No entanto, você pode instruir o Laravel a procurar por comandos da ArtiSan noutras pastas no arquivo `bootstrap/app.php` do seu aplicativo usando o método `withCommands`:

```php
    ->withCommands([
        __DIR__.'/../app/Domain/Orders/Commands',
    ])
```

Se necessário, também poderá registar comandos manualmente fornecendo o nome da classe do comando ao método `withCommands`:

```php
    use App\Domain\Orders\Commands\SendEmails;

    ->withCommands([
        SendEmails::class,
    ])
```

Quando o comando "artisan" for executado, todos os comandos em sua aplicação serão resolvidos pelo [conjunto de serviços](/docs/11.x/container) e registrados no "Artisan".

<a name="programmatically-executing-commands"></a>
##  Executando comandos de maneira programática

Por vezes pode pretender executar um comando Artisan fora da CLI. Por exemplo, pretende executar um comando Artisan a partir de uma rota ou controlador. Pode usar o método `call` na faceta `Artisan` para realizar isto. O método `call` aceita como primeiro argumento o nome da assinatura do comando ou o nome da classe, e um array de parâmetros do comando como segundo argumento. O código de saída é retornado:

```php
    use Illuminate\Support\Facades\Artisan;

    Route::post('/user/{user}/mail', function (string $user) {
        $exitCode = Artisan::call('mail:send', [
            'user' => $user, '--queue' => 'default'
        ]);

        // ...
    });
```

Como alternativa, você pode passar o comando completo do Artisan para o método `call`, como uma cadeia de caracteres:

```php
    Artisan::call('mail:send 1 --queue=default');
```

<a name="passing-array-values"></a>
####  Transmitir valores de matriz

 Se o seu comando definir uma opção que aceite um conjunto de valores, poderá passar um conjunto destes para essa opção.

```php
    use Illuminate\Support\Facades\Artisan;

    Route::post('/mail', function () {
        $exitCode = Artisan::call('mail:send', [
            '--id' => [5, 13]
        ]);
    });
```

<a name="passing-boolean-values"></a>
####  Transmitindo valores booleanos

 Se você precisar especificar o valor de uma opção que não aceita valores de string, como a opção `--force` no comando `migrate:refresh`, você deve passar `true` ou `false` como o valor da opção:

```php
    $exitCode = Artisan::call('migrate:refresh', [
        '--force' => true,
    ]);
```

<a name="queueing-artisan-commands"></a>
####  Ordem de Funcionamento de Comandos Artesanais

 Usando o método `queue` da facade `Artisan`, você pode até mesmo agendar comandos do `Artisan` para serem processados no background pelos [trabalhadores de filas](/docs/11.x/queues). Antes de usar este método, certifique-se que você tenha configurado a fila e está executando um receptor da fila:

```php
    use Illuminate\Support\Facades\Artisan;

    Route::post('/user/{user}/mail', function (string $user) {
        Artisan::queue('mail:send', [
            'user' => $user, '--queue' => 'default'
        ]);

        // ...
    });
```

 Usando as funcionalidades `onConnection` e `onQueue`, pode especificar a conexão ou fila para onde o comando Artisan deverá ser enviado.

```php
    Artisan::queue('mail:send', [
        'user' => 1, '--queue' => 'default'
    ])->onConnection('redis')->onQueue('commands');
```

### Chamar comandos a partir de outros comandos

Às vezes, você pode querer chamar outros comandos de um comando existente no Artisan. Você pode fazer isso usando o método `call`. Este método aceita o nome do comando e uma matriz de argumentos / opções para o comando:

```php
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->call('mail:send', [
            'user' => 1, '--queue' => 'default'
        ]);

        // ...
    }
```

Se você deseja chamar um comando de outra console e suprimir todo o seu conteúdo, poderá usar o método `callSilently`. O método `callSilently` possui a mesma assinatura do método `call`:

```php
$this->callSilently('mail:send', [
  'user' => 1, '--queue' => 'default'
]);
```

## Processamento de sinais

Como você provavelmente já sabe, os sistemas operacionais permitem o envio de sinais para processos em execução. Por exemplo, o sinal `SIGTERM` é utilizado pelos sistemas operacionais para solicitar o término de um programa. Se você quiser ouvir sinais no seu comando Artisan console e executar código quando eles ocorrerem, pode usar o método `trap`:

```php
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->trap(SIGTERM, fn () => $this->shouldKeepRunning = false);

        while ($this->shouldKeepRunning) {
            // ...
        }
    }
```

 Para ouvir vários sinais ao mesmo tempo, você pode passar uma matriz de sinais para o método `trap`:

```php
    $this->trap([SIGTERM, SIGQUIT], function (int $signal) {
        $this->shouldKeepRunning = false;

        dump($signal); // SIGTERM / SIGQUIT
    });
```

## Personalização de stubs

Os comandos `make` do console de artesão são utilizados para criar várias classes como controladores, tarefas, migrações e testes. Essas classes são geradas com base em arquivos "stub" que contêm valores baseados na sua entrada. No entanto, pode ser necessário fazer pequenas alterações nos arquivos gerados pelo Artisan. Para fazer isso, você pode usar o comando `stub:publish` para publicar os stubs mais comuns em sua aplicação para que seja possível personalizá-los:

```shell
php artisan stub:publish
```

As stubs publicadas estarão localizadas dentro do diretório `stubs`, na raiz de seu aplicativo. Todas as alterações feitas nessas stubs serão refletidas quando você gerar suas classes correspondentes usando os comandos do Artisan `make`.

## Eventos

O módulo Artisan envia três eventos ao executar comandos: `Illuminate\Console\Events\ArtisanStarting`, `Illuminate\Console\Events\CommandStarting` e `Illuminate\Console\Events\CommandFinished`. O evento `Illuminate\Console\Events\ArtisanStarting` é enviado imediatamente quando o módulo Artisan é iniciado. Em seguida, o evento `Illuminate\Console\Events\CommandStarting` é enviado antes da execução de um comando e, por último, o evento `Illuminate\Console\Events\CommandFinished` é enviado assim que um comando terminar a sua execução.
