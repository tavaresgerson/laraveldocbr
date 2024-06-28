# Teste do console

<a name="introduction"></a>
## Introdução

 Além de simplificar os testes do HTTP, o Laravel oferece uma API simples para testar comandos personalizados do console da aplicação.

<a name="success-failure-expectations"></a>
## Esperanças de sucesso/fracasso

 Para começar, vamos explorar como fazer afirmações referentes ao código de saída de um comando Artisan. Para isso, usaremos o método `artisan` para invocar um comando do Artisan em nosso teste. Então, usaremos o método `assertExitCode` para garantir que o comando foi concluído com um determinado código de saída:

```php tab=Pest
test('console command', function () {
    $this->artisan('inspire')->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('inspire')->assertExitCode(0);
}
```

 Você pode usar o método `assertNotExitCode` para garantir que o comando não saiu com um determinado código de saída:

```php
    $this->artisan('inspire')->assertNotExitCode(1);
```

 Obviamente, todos os comandos de terminal normalmente saem com um código de status `0` (é bem-sucedido) e um código de saída diferente de zero quando é inválido. Portanto, para conveniência, você pode utilizar as afirmações `assertSuccessful` e `assertFailed` para garantir que determinado comando saiu com um código de status bem-sucedido ou não:

```php
    $this->artisan('inspire')->assertSuccessful();

    $this->artisan('inspire')->assertFailed();
```

<a name="input-output-expectations"></a>
## Espera de Entrada/Saída

 O Laravel permite-lhe "mockar" facilmente a entrada de utilizador nos comandos do console através do método `expectsQuestion`. Além disso, pode especificar o código de saída e texto esperado para ser emitido pelo comando do console utilizando os métodos `assertExitCode` e `expectsOutput`. Por exemplo:

```php
    Artisan::command('question', function () {
        $name = $this->ask('What is your name?');

        $language = $this->choice('Which language do you prefer?', [
            'PHP',
            'Ruby',
            'Python',
        ]);

        $this->line('Your name is '.$name.' and you prefer '.$language.'.');
    });
```

 É possível verificar este comando com o seguinte teste:

```php tab=Pest
test('console command', function () {
    $this->artisan('question')
         ->expectsQuestion('What is your name?', 'Taylor Otwell')
         ->expectsQuestion('Which language do you prefer?', 'PHP')
         ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
         ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
         ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('question')
         ->expectsQuestion('What is your name?', 'Taylor Otwell')
         ->expectsQuestion('Which language do you prefer?', 'PHP')
         ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
         ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
         ->assertExitCode(0);
}
```

 Você também poderá assegurar que um comando de console não gera nenhum resultado utilizando o método `doesntExpectOutput`:

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
         ->doesntExpectOutput()
         ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('example')
            ->doesntExpectOutput()
            ->assertExitCode(0);
}
```

 Os métodos `expectsOutputToContain` e `doesntExpectOutputToContain` podem ser utilizados para fazer asserções em relação a uma parte do resultado da execução.

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
         ->expectsOutputToContain('Taylor')
         ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('example')
            ->expectsOutputToContain('Taylor')
            ->assertExitCode(0);
}
```

<a name="confirmation-expectations"></a>
#### Esperanças de confirmação

 Ao escrever um comando que espera uma confirmação na forma de uma resposta "sim" ou "não", você pode utilizar o método `expectsConfirmation`:

```php
    $this->artisan('module:import')
        ->expectsConfirmation('Do you really wish to run this command?', 'no')
        ->assertExitCode(1);
```

<a name="table-expectations"></a>
#### Expectativas da tabela

 Se o comando exibir uma tabela de informações usando o método `table` do Artisan, pode ser complicado escrever expectativas de saída para toda a tabela. Em vez disso, você pode usar o método `expectsTable`. Este método aceita os cabeçalhos da tabela como seu primeiro argumento e os dados da tabela como segundo argumento:

```php
    $this->artisan('users:all')
        ->expectsTable([
            'ID',
            'Email',
        ], [
            [1, 'taylor@example.com'],
            [2, 'abigail@example.com'],
        ]);
```

<a name="console-events"></a>
## Eventos da consola

 Por padrão, os eventos Illuminate\Console\Events\CommandStarting e Illuminate\Console\Events\CommandFinished não são disparados enquanto a aplicação está em execução. No entanto, pode ativar estes eventos para uma determinada classe de teste, adicionando o traço Illuminate\Foundation\Testing\WithConsoleEvents à mesma:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\WithConsoleEvents;

uses(WithConsoleEvents::class);

// ...
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\WithConsoleEvents;
use Tests\TestCase;

class ConsoleEventTest extends TestCase
{
    use WithConsoleEvents;

    // ...
}
```
