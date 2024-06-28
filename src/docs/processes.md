# Procedimentos

<a name="introduction"></a>
## Introdução

 O Laravel fornece uma API expressiva e mínima em torno do componente [Process (Componente Processo) Symfony](https://symfony.com/doc/7.0/components/process.html), permitindo que você invoque processos externos da sua aplicação Laravel de maneira conveniente. As características de processamento no Laravel se concentram nos casos de uso mais comuns e em uma excelente experiência do usuário para o desenvolvedor.

<a name="invoking-processes"></a>
## Chamar processos

 Para invocar um processo, você pode usar os métodos `run` e `start`, oferecidos pela interface de facade do `Process`. O método `run` irá invocar um processo e aguardar a execução desse processo. Por outro lado, o método `start` é usado para a execução assíncrona. Nesta documentação, analisaremos as duas abordagens. Primeiro, vamos ver como invocar um processo básico e síncrono e inspecionar seu resultado:

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

return $result->output();
```

 É claro que a instância `Illuminate\Contracts\Process\ProcessResult`, retornada pela função `run`, oferece uma variedade de métodos úteis para inspeção do resultado do processo.

```php
$result = Process::run('ls -la');

$result->successful();
$result->failed();
$result->exitCode();
$result->output();
$result->errorOutput();
```

<a name="throwing-exceptions"></a>
#### Lançar exceções

 Se você tiver um resultado do processo e desejar lançar uma instância de Illuminate\Process\Exceptions\ProcessFailedException se o código de saída for maior que zero (indicando falha), poderá utilizar os métodos `throw` e `throwIf`. Caso o processo não tenha falhado, a instância do resultado do processo será retornada:

```php
$result = Process::run('ls -la')->throw();

$result = Process::run('ls -la')->throwIf($condition);
```

<a name="process-options"></a>
### Opções do processo

 Claro que você pode precisar personalizar o comportamento de um processo antes de invocá-lo. Felizmente, o Laravel permite ajustar várias características do processo, como o diretório de trabalho, tempo limite e variáveis ambientais.

<a name="working-directory-path"></a>
#### Caminho do diretório de trabalho

 Você pode usar o método `path` para especificar o diretório de trabalho do processo. Se este método não for invocado, o processo herdará o diretório de trabalho do script PHP atualmente sendo executado:

```php
$result = Process::path(__DIR__)->run('ls -la');
```

<a name="input"></a>
#### Entrada

 Você pode fornecer um input através da "entrada padrão" do processo usando o método `input`:

```php
$result = Process::input('Hello World')->run('cat');
```

<a name="timeouts"></a>
#### Tempo de Inatividade

 Por padrão, os processos vão arrojara uma instância de `Illuminate\Process\Exceptions\ProcessTimedOutException` após a execução durante mais de 60 segundos. No entanto, pode personalizar este comportamento através do método `timeout`:

```php
$result = Process::timeout(120)->run('bash import.sh');
```

 Ou, se você deseja desativar completamente o tempo de espera do processo, poderá invocar o método `forever`:

```php
$result = Process::forever()->run('bash import.sh');
```

 Ao especificar um limite máximo de tempo (em segundos) para o processo rodar sem retornar nenhum resultado, pode ser utilizada a função `idleTimeout`:

```php
$result = Process::timeout(60)->idleTimeout(30)->run('bash import.sh');
```

<a name="environment-variables"></a>
#### Variáveis Ambientais

 As variáveis de ambiente podem ser fornecidas ao processo através do método `env`. O processo invocado também herdará todas as variáveis de ambiente definidas pelo seu sistema:

```php
$result = Process::forever()
            ->env(['IMPORT_PATH' => __DIR__])
            ->run('bash import.sh');
```

 Se pretender remover uma variável de ambiente herdada do processo invocado, pode fornecer esta variável com um valor de `false`:

```php
$result = Process::forever()
            ->env(['LOAD_PATH' => false])
            ->run('bash import.sh');
```

<a name="tty-mode"></a>
#### Modo TTY

 O método `tty` pode ser utilizado para ativar o modo TTY do seu processo. Esse recurso conecta a entrada e saída do processo à sua programação, permitindo que seja aberto um editor como Vim ou Nano no contexto do seu processo:

```php
Process::forever()->tty()->run('vim');
```

<a name="process-output"></a>
### Saída do processo

 Como discutido anteriormente, é possível ter acesso ao conteúdo de saída utilizando os métodos `output` (stdout) e `errorOutput` (stderr) sobre o resultado do processo:

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

echo $result->output();
echo $result->errorOutput();
```

 No entanto, a saída também pode ser capturada em tempo real através da passagem de um fecho como segundo argumento ao método `run`. O fecho recebe dois argumentos: o "tipo" de saída ("stdout" ou "stderr") e o próprio string de saída:

```php
$result = Process::run('ls -la', function (string $type, string $output) {
    echo $output;
});
```

 O Laravel também oferece os métodos `seeInOutput` e `seeInErrorOutput`, que fornecem uma maneira prática de determinar se uma determinada string estava contida na saída do processo:

```php
if (Process::run('ls -la')->seeInOutput('laravel')) {
    // ...
}
```

<a name="disabling-process-output"></a>
#### Desativar a saída do processo

 Se o seu processo estiver produzindo uma quantidade significativa de saída que você não está interessado em, é possível economizar memória desativando a recuperação de saída totalmente. Para fazer isso, chame o método `quietly` ao criar o processo:

```php
use Illuminate\Support\Facades\Process;

$result = Process::quietly()->run('bash import.sh');
```

<a name="process-pipelines"></a>
### Oleodutos

 Às vezes, pode ser desejável que a saída de um processo seja a entrada de outro processo. Isto é frequentemente designado por "piping" (encaminhamento) da saída de um processo para outro. O método `pipe` disponibilizado pelas fachadas `Process` permite uma execução fácil dos processos encaminhados: o método `pipe` executará os processos encaminhados em modo síncrono e retornará o resultado do último processo na pipeline:

```php
use Illuminate\Process\Pipe;
use Illuminate\Support\Facades\Process;

$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
});

if ($result->successful()) {
    // ...
}
```

 Se você não precisa personalizar os processos individuais que compõem o pipeline, poderá simplesmente passar um array de comandos para o método `pipe`:

```php
$result = Process::pipe([
    'cat example.txt',
    'grep -i "laravel"',
]);
```

 O resultado do processo pode ser coletado em tempo real passando um fecho como o segundo argumento para a função pipe. O fecho receberá dois argumentos: "type" de saída (stdout ou stderr) e a própria string de saída:

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
}, function (string $type, string $output) {
    echo $output;
});
```

 O Laravel também permite que você atribua chaves de string para cada processo dentro de um pipeline via o método `as`. Essa chave também será passada ao fechamento do resultado fornecido ao método `pipe`, permitindo determinar a qual processo o output pertence:

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->as('first')->command('cat example.txt');
    $pipe->as('second')->command('grep -i "laravel"');
})->start(function (string $type, string $output, string $key) {
    // ...
});
```

<a name="asynchronous-processes"></a>
## Processos assíncronos

 Enquanto o método `run` invoca processos em modo síncrono, é possível utilizar o método `start` para invocar um processo asincrônico. Isso permite que a sua aplicação continue executando outras tarefas enquanto o processo é executado como processo de fundo. Após o processo ter sido iniciado, você pode utilizar o método `running` para determinar se ele ainda está sendo executado:

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    // ...
}

$result = $process->wait();
```

 Como você deve ter notado, é possível invocar o método `wait` para aguardar até que o processo termine de ser executado e obter uma instância do resultado do processo:

```php
$process = Process::timeout(120)->start('bash import.sh');

// ...

$result = $process->wait();
```

<a name="process-ids-and-signals"></a>
### ID dos processos e sinais

 O método `id` pode ser utilizado para recuperar o identificador de processo atribuído pelo sistema operativo do processo em execução.

```php
$process = Process::start('bash import.sh');

return $process->id();
```

 É possível utilizar o método `signal` para enviar um "sinal" ao processo em execução. Consulte a lista de constantes predefinidas no [documentação do PHP](https://www.php.net/manual/en/pcntl.constants.php):

```php
$process->signal(SIGUSR2);
```

<a name="asynchronous-process-output"></a>
### Saída de processo assíncrona

 Enquanto um processo assíncrono estiver em execução, poderá aceder a todo o resultado atual utilizando os métodos `output` e `errorOutput`. No entanto, poderá utilizar os métodos `latestOutput` e `latestErrorOutput` para aceder ao resultado do processo que se verificou desde a última recuperação de resultados:

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    echo $process->latestOutput();
    echo $process->latestErrorOutput();

    sleep(1);
}
```

 Tal como a metoda `run`, o código de saída também pode ser recolhido em tempo real a partir de processos assíncronos através da passagem de um fecho como segundo argumento à metodologia `start`. O fecho recebe dois argumentos: "tipo" de saída (stdout ou stderr) e o texto do próprio código de saída:

```php
$process = Process::start('bash import.sh', function (string $type, string $output) {
    echo $output;
});

$result = $process->wait();
```

<a name="concurrent-processes"></a>
## Processos concorrentes

 O Laravel também facilita o gerenciamento de um pool de processos assíncronos concorrentes, permitindo que você execute muitas tarefas simultaneamente. Para começar, invoque o método `pool`, que aceita um closure que recebe uma instância do `Illuminate\Process\Pool`.

 Dentro deste fechamento, você pode definir os processos que pertencem à rede. Uma vez que um grupo de processo seja iniciado através do método `start`, você poderá acessar a coleção de processos em execução via o método `running`:

```php
use Illuminate\Process\Pool;
use Illuminate\Support\Facades\Process;

$pool = Process::pool(function (Pool $pool) {
    $pool->path(__DIR__)->command('bash import-1.sh');
    $pool->path(__DIR__)->command('bash import-2.sh');
    $pool->path(__DIR__)->command('bash import-3.sh');
})->start(function (string $type, string $output, int $key) {
    // ...
});

while ($pool->running()->isNotEmpty()) {
    // ...
}

$results = $pool->wait();
```

 Como podem verificar, é possível aguardar a execução dos processos da piscina e resolver os respectivos resultados através do método `wait`. O método `wait` retorna um objeto de acesso a um array que permite o acesso à instância do resultado do processo de cada processo na piscina, identificado pelo seu nome-chave:

```php
$results = $pool->wait();

echo $results[0]->output();
```

 Ou pode ser usado o método `concurrently`, para iniciar um grupo de processos assíncrono e aguardar seus resultados imediatamente. Isso permite uma sintaxe particularmente expressiva, combinada com as capacidades do PHP em destruturar arrays:

```php
[$first, $second, $third] = Process::concurrently(function (Pool $pool) {
    $pool->path(__DIR__)->command('ls -la');
    $pool->path(app_path())->command('ls -la');
    $pool->path(storage_path())->command('ls -la');
});

echo $first->output();
```

<a name="naming-pool-processes"></a>
### Nomes para processos de pool

 Acessar os resultados do processo de pool através de uma chave numérica não é muito expressivo; portanto, o Laravel permite que você assigne chaves string a cada processo dentro de um pool por meio do método `as`. Essa chave também será passada para o fecho fornecido ao método `start`, permitindo determinar a qual processo o output pertence:

```php
$pool = Process::pool(function (Pool $pool) {
    $pool->as('first')->command('bash import-1.sh');
    $pool->as('second')->command('bash import-2.sh');
    $pool->as('third')->command('bash import-3.sh');
})->start(function (string $type, string $output, string $key) {
    // ...
});

$results = $pool->wait();

return $results['first']->output();
```

<a name="pool-process-ids-and-signals"></a>
### Identificação de processos e sinais

 Dado que o método `running` do conjunto de processos fornece uma coleção de todos os processos invocados no interior da secção, podem ser acedidos facilmente os identificadores dos processos em conjunto:

```php
$processIds = $pool->running()->each->id();
```

 E, por comodidade, você pode invocar o método `signal` em um pool de processos para enviar um sinal para todos os processos dentro do pool:

```php
$pool->signal(SIGUSR2);
```

<a name="testing"></a>
## Teste

 Muitos serviços do Laravel fornecem funcionalidades que o ajudam a escrever testes de maneira fácil e expressiva, e o serviço Processo do Laravel não é exceção. O método `fake` da facade Process permite instruir o Laravel a retornar resultados falsos quando os processos são invocados.

<a name="faking-processes"></a>
### Falsificação de processos

 Para explorar a capacidade do Laravel de simular processos, imaginemos uma rota que invoque um processo:

```php
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    Process::run('bash import.sh');

    return 'Import complete!';
});
```

 Ao testar essa rota, podemos instruir o Laravel a retornar um resultado de processo falso e bem-sucedido para todos os processos invocados chamando o método `fake` na facade `Process` sem argumentos. Além disso, podemos até [assegurar](#asserções-disponíveis) que determinado processo foi "executado":

```php tab=Pest
<?php

use Illuminate\Process\PendingProcess;
use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Facades\Process;

test('process is invoked', function () {
    Process::fake();

    $response = $this->get('/import');

    // Simple process assertion...
    Process::assertRan('bash import.sh');

    // Or, inspecting the process configuration...
    Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
        return $process->command === 'bash import.sh' &&
               $process->timeout === 60;
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Process\PendingProcess;
use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_process_is_invoked(): void
    {
        Process::fake();

        $response = $this->get('/import');

        // Simple process assertion...
        Process::assertRan('bash import.sh');

        // Or, inspecting the process configuration...
        Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
            return $process->command === 'bash import.sh' &&
                   $process->timeout === 60;
        });
    }
}
```

 Como foi discutido, invocar o método `fake` na faca do `Process` dará instruções para Laravel retornar sempre um processo bem-sucedido sem saída. No entanto, é possível especificar a saída e o código de término dos processos simulados através do método `result` da faca `Process`:

```php
Process::fake([
    '*' => Process::result(
        output: 'Test output',
        errorOutput: 'Test error output',
        exitCode: 1,
    ),
]);
```

<a name="faking-specific-processes"></a>
### Falsificação de processos específicos

 Como você pode ter notado em um exemplo anterior, a faca `Process` permite que você especifique resultados falsos diferentes por processo ao passar uma matriz para o método `fake`.

 As chaves da matriz devem representar padrões de comandos que você deseja simular e seus resultados associados. O caractere asterisco (*) pode ser usado como um caractere de substituta. Qualquer comando do processo que não foi falsificado, na verdade, será invocado. Você pode usar o método `result` da facade `Process` para construir resultados fictícios/falsos para esses comandos:

```php
Process::fake([
    'cat *' => Process::result(
        output: 'Test "cat" output',
    ),
    'ls *' => Process::result(
        output: 'Test "ls" output',
    ),
]);
```

 Se você não precisa personalizar o código de saída ou a saída de erro de um processo fictício, poderá ser mais conveniente especificar os resultados do processo fictício como cadeias de caracteres simples.

```php
Process::fake([
    'cat *' => 'Test "cat" output',
    'ls *' => 'Test "ls" output',
]);
```

<a name="faking-process-sequences"></a>
### Falsificação de sequências de processos

 Se o código que você está testando solicitar vários processos com o mesmo comando, poderá ser interessante atribuir um resultado diferente a cada invocação do processo. Você pode fazer isso usando o método `sequence` da faca Process:

```php
Process::fake([
    'ls *' => Process::sequence()
                ->push(Process::result('First invocation'))
                ->push(Process::result('Second invocation')),
]);
```

<a name="faking-asynchronous-process-lifecycles"></a>
### Fingindo ciclos de vida assíncronos

 Até agora, abordamos principalmente processos de falsificação invocados de maneira síncrona através do método `run`. No entanto, se você estiver tentando testar códigos que interagem com processos assíncronos invocados via `start`, pode ser necessário um enfoque mais sofisticado para descrever seus falsificadores.

 Por exemplo, imaginemos a seguinte rota que interage com um processo assíncrono:

```php
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    $process = Process::start('bash import.sh');

    while ($process->running()) {
        Log::info($process->latestOutput());
        Log::info($process->latestErrorOutput());
    }

    return 'Done';
});
```

 Para simular corretamente esse processo, precisamos ser capazes de descrever quantas vezes o método `running` deve retornar `true`. Além disso, podemos querer especificar várias linhas de saída que devem ser retornadas em sequência. Para fazer isso, podemos usar o método `describe` da faca do Process:

```php
Process::fake([
    'bash import.sh' => Process::describe()
            ->output('First line of standard output')
            ->errorOutput('First line of error output')
            ->output('Second line of standard output')
            ->exitCode(0)
            ->iterations(3),
]);
```

 Vamos entender melhor o exemplo acima. Usando os métodos `output` e `errorOutput`, podemos especificar várias linhas de saída que serão retornadas em sequência. O método `exitCode` pode ser usado para especificar a códigos de saída final do processo falsificado. Finalmente, o método `iterations` pode ser usado para especificar quantas vezes o método `running` deve retornar como `true`.

<a name="available-assertions"></a>
### Declarações disponíveis

 Como [discutido anteriormente](#falsificando-processos), o Laravel disponibiliza várias declarações de processo para os testes funcionais. A seguir, discutiremos cada uma destas afirmações.

<a name="assert-process-ran"></a>
####

 Afirmar que um determinado processo foi invocado:

```php
use Illuminate\Support\Facades\Process;

Process::assertRan('ls -la');
```

 O método `assertRan` também aceita um bloco de código que recebe uma instância do processo e o resultado do processo, permitindo inspecionar as opções configuradas no processo. Se esse bloco retornar "true", a afirmação será considerada como "passada":

```php
Process::assertRan(fn ($process, $result) =>
    $process->command === 'ls -la' &&
    $process->path === __DIR__ &&
    $process->timeout === 60
);
```

 O `$process` enviado para o fecho `assertRan` é uma instância do `Illuminate\Process\PendingProcess`, enquanto que o `$result` é uma instância de `Illuminate\Contracts\Process\ProcessResult`.

<a name="assert-process-didnt-run"></a>
#### Assertiva que não foi executada

 Afirmar que um determinado processo não foi invocado:

```php
use Illuminate\Support\Facades\Process;

Process::assertDidntRun('ls -la');
```

 Assim como o método `assertRan`, o método `assertDidntRun` também aceita um bloco de closures que receberá uma instância de processo e um resultado do processo, permitindo que você inspecione as opções configuradas do processo. Se este bloco retornar `true`, a afirmação "falhará":

```php
Process::assertDidntRun(fn (PendingProcess $process, ProcessResult $result) =>
    $process->command === 'ls -la'
);
```

<a name="assert-process-ran-times"></a>
#### assertaNumVetor de vezes

 Aserta que um determinado processo foi invocado uma determinada quantidade de vezes:

```php
use Illuminate\Support\Facades\Process;

Process::assertRanTimes('ls -la', times: 3);
```

 O método `assertRanTimes` também aceita um bloqueio, que receberá uma instância de um processo e um resultado do processo, permitindo inspecionar as opções do processo. Se este bloqueio retornar `true` e o processo tiver sido invocado o número especificado de vezes, a afirmação "passará":

```php
Process::assertRanTimes(function (PendingProcess $process, ProcessResult $result) {
    return $process->command === 'ls -la';
}, times: 3);
```

<a name="preventing-stray-processes"></a>
### Evitar processos em execução paralela

 Se você quiser garantir que todos os processos invocados foram falsificados em seu teste individual ou na suite de testes completa, pode chamar o método `preventStrayProcesses`. Após a chamada deste método, qualquer processo que não tenha um resultado correspondente será falsificado e lançará uma exceção, ao invés de iniciar o processo real:

```php
    use Illuminate\Support\Facades\Process;

    Process::preventStrayProcesses();

    Process::fake([
        'ls *' => 'Test output...',
    ]);

    // Fake response is returned...
    Process::run('ls -la');

    // An exception is thrown...
    Process::run('bash import.sh');
```
