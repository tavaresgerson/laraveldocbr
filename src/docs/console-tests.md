# Testes de console

<a name="introduction"></a>
## Introdução

Além de simplificar os testes de HTTP, o Laravel fornece uma API simples para testar os [comandos de console personalizados](/docs/{{version}}/artisan) do seu aplicativo.

<a name="success-failure-expectations"></a>
## Expectativas de sucesso/falha

Para começar, vamos explorar como fazer afirmações sobre o código de saída de um comando Artisan. Para fazer isso, usaremos o método `artisan` para invocar um comando Artisan do nosso teste. Então, usaremos o método `assertExitCode` para afirmar que o comando foi concluído com um código de saída fornecido:

::: code-group
```php [Pest]
test('console command', function () {
    $this->artisan('inspire')->assertExitCode(0);
});
```

```php [PHPUnit]
/**
 * Teste um comando de console.
 */
public function test_console_command(): void
{
    $this->artisan('inspire')->assertExitCode(0);
}
```
:::

Você pode usar o método `assertNotExitCode` para afirmar que o comando não saiu com um código de saída fornecido:

```php
    $this->artisan('inspire')->assertNotExitCode(1);
```

É claro que todos os comandos de terminal normalmente saem com um código de status `0` quando são bem-sucedidos e um código de saída diferente de zero quando não são bem-sucedidos. Portanto, para sua conveniência, você pode utilizar as asserções `assertSuccessful` e `assertFailed` para afirmar que um determinado comando saiu com um código de saída bem-sucedido ou não:

```php
    $this->artisan('inspire')->assertSuccessful();

    $this->artisan('inspire')->assertFailed();
```

<a name="input-output-expectations"></a>
## Expectativas de entrada/saída

O Laravel permite que você "zombe" facilmente da entrada do usuário para seus comandos de console usando o método `expectsQuestion`. Além disso, você pode especificar o código de saída e o texto que espera que sejam emitidos pelo comando de console usando os métodos `assertExitCode` e `expectsOutput`. Por exemplo, considere o seguinte comando de console:

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

Você pode testar este comando com o seguinte teste:

::: code-group
```php [Pest]
test('console command', function () {
    $this->artisan('question')
         ->expectsQuestion('What is your name?', 'Taylor Otwell')
         ->expectsQuestion('Which language do you prefer?', 'PHP')
         ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
         ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
         ->assertExitCode(0);
});
```

```php [PHPUnit]
/**
 * Teste um comando de console.
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
:::

Você também pode afirmar que um comando de console não gera nenhuma saída usando o método `doesntExpectOutput`:

::: code-group
```php [Pest]
test('console command', function () {
    $this->artisan('example')
         ->doesntExpectOutput()
         ->assertExitCode(0);
});
```

```php [PHPUnit]
/**
 * Teste um comando de console.
 */
public function test_console_command(): void
{
    $this->artisan('example')
            ->doesntExpectOutput()
            ->assertExitCode(0);
}
```
:::

Os métodos `expectsOutputToContain` e `doesntExpectOutputToContain` podem ser usados ​​para fazer afirmações contra uma parte da saída:

::: code-group
```php [Pest]
test('console command', function () {
    $this->artisan('example')
         ->expectsOutputToContain('Taylor')
         ->assertExitCode(0);
});
```

```php [PHPUnit]
/**
 * Teste um comando de console.
 */
public function test_console_command(): void
{
    $this->artisan('example')
            ->expectsOutputToContain('Taylor')
            ->assertExitCode(0);
}
```
:::

<a name="confirmation-expectations"></a>
#### Expectativas de confirmação

Ao escrever um comando que espera confirmação na forma de uma resposta "sim" ou "não", você pode utilizar o método `expectsConfirmation`:

```php
    $this->artisan('module:import')
        ->expectsConfirmation('Do you really wish to run this command?', 'no')
        ->assertExitCode(1);
```

<a name="table-expectations"></a>
#### Expectativas de tabela

Se seu comando exibir uma tabela de informações usando o método `table` do Artisan, pode ser trabalhoso escrever expectativas de saída para a tabela inteira. Em vez disso, você pode usar o método `expectsTable`. Este método aceita os cabeçalhos da tabela como seu primeiro argumento e os dados da tabela como seu segundo argumento:

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
## Eventos do console

Por padrão, os eventos `Illuminate\Console\Events\CommandStarting` e `Illuminate\Console\Events\CommandFinished` não são despachados durante a execução dos testes do seu aplicativo. No entanto, você pode habilitar esses eventos para uma determinada classe de teste adicionando o traço `Illuminate\Foundation\Testing\WithConsoleEvents` à classe:

::: code-group
```php [Pest]
<?php

use Illuminate\Foundation\Testing\WithConsoleEvents;

uses(WithConsoleEvents::class);

// ...
```

```php [PHPUnit]
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
:::
