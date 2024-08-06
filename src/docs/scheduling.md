# Agendamento de Tarefas

<a name="introduction"></a>
## Introdução

No passado, você pode ter escrito uma entrada de configuração do *crontab* para cada tarefa que necessitava ser agendada no seu servidor. No entanto, isso rapidamente se torna um incômodo porque a programação da sua tarefa não está mais sob controle de código e você deve fazer login com SSH em seu servidor para visualizar suas entradas *crontab* existentes ou adicionar entradas adicionais.

O agendador de comandos do Laravel oferece uma nova abordagem para gerenciar tarefas agendadas em seu servidor. O agendador permite que você defina sua programação de comando de forma fluida e expressiva dentro da própria aplicação Laravel. Ao usar o agendador, é necessário apenas uma única entrada *_cron_* no seu servidor. Sua tarefa de programação normalmente é definida no arquivo `routes/console.php` da sua aplicação.

<a name="defining-schedules"></a>
## Definição de padrões

Em sua aplicação, você pode definir todas as suas tarefas agendadas no arquivo `routes/console.php`. Para começar vamos ver um exemplo. Neste exemplo programamos uma execução de código todos os dias à meia-noite. Dentro do closure executaremos uma consulta ao banco de dados para apagar uma tabela:

```php
    <?php

    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Schedule;

    Schedule::call(function () {
        DB::table('recent_users')->delete();
    })->daily();
```

Além de agendamento usando closures, você pode também agendar [objetos invocáveis](https://secure.php.net/manual/pt_BR/language.oop5.magic.php#object.invoke). Os objetos invocáveis são classes PHP simples que contêm um método `__invoke`:

```php
    Schedule::call(new DeleteRecentUsers)->daily();
```

Se você preferir reservar o arquivo `routes/console.php` somente para definições de comandos, poderá usar o método `withSchedule` no arquivo `bootstrap/app.php` da sua aplicação para definir as tarefas agendadas. Esse método aceita um closure que recebe uma instância do programador:

```php
    use Illuminate\Console\Scheduling\Schedule;

    ->withSchedule(function (Schedule $schedule) {
        $schedule->call(new DeleteRecentUsers)->daily();
    })
```

Se quiser ver uma visão geral das tarefas planejadas e a hora em que devem ser executadas, você pode usar o comando Artisan `schedule:list`.

```bash
php artisan schedule:list
```

<a name="scheduling-artisan-commands"></a>
### Agendando Comandos Artisan

Além do agendamento de closures, você também pode agendar comandos [Artisan](/docs/artisan) e comandos do sistema. Por exemplo, você pode usar o método `command` para agendar um comando Artisan usando o nome ou a classe do comando.

Quando for definido comandos de Artisan utilizando o nome da classe do comando, será possível enviar um conjunto de argumentos adicionais que deverão ser passados ao comando na sequência da sua execução.

```php
    use App\Console\Commands\SendEmailsCommand;
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('emails:send Taylor --force')->daily();

    Schedule::command(SendEmailsCommand::class, ['Taylor', '--force'])->daily();
```

<a name="scheduling-artisan-closure-commands"></a>
#### Agendamento de comandos closure do Artisan

Se você quiser agendar um comando Artisan definido por um closure, você pode encadear os métodos relacionados ao agendamento após a definição do comando:

```php
    Artisan::command('delete:recent-users', function () {
        DB::table('recent_users')->delete();
    })->purpose('Delete recent users')->daily();
```

Se você precisar passar argumentos para o closure, poderá fornecê-los para o método `schedule()`:

```php
    Artisan::command('emails:send {user} {--force}', function ($user) {
        // ...
    })->purpose('Send emails to the specified user')->schedule(['Taylor', '--force'])->daily();
```

<a name="scheduling-queued-jobs"></a>
### Agendamento de filas de trabalho

A função `job` pode ser usada para agendar um trabalho na fila de espera. Este método permite um agendamento de trabalhos conveniente, sem a necessidade de usar a função `call` para definir quais são as chamadas que serão programadas:

```php
    use App\Jobs\Heartbeat;
    use Illuminate\Support\Facades\Schedule;

    Schedule::job(new Heartbeat)->everyFiveMinutes();
```

Segundo e terceiro argumentos opcionais podem ser fornecidos ao método `job`, que especifica o nome da fila e a conexão da fila que devem ser usados ​​para enfileirar o trabalho:

```php
    use App\Jobs\Heartbeat;
    use Illuminate\Support\Facades\Schedule;

    // Despachar o trabalho para a fila "heartbeats" na conexão "sqs"...
    Schedule::job(new Heartbeat, 'heartbeats', 'sqs')->everyFiveMinutes();
```

<a name="scheduling-shell-commands"></a>
### Agendando comandos shell

O método `exec` é usado para executar um comando no sistema operacional:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::exec('node /home/forge/script.js')->daily();
```

<a name="schedule-frequency-options"></a>
### Opções de frequência de agendamento

Vimos alguns exemplos de como você pode configurar uma tarefa para ser executada em intervalos especificados. No entanto, existem muitas outras frequências de programação de tarefas que você pode atribuir a uma tarefa:

| Método                              | Descrição                                                     |
|-------------------------------------|---------------------------------------------------------------|
| `->_cron_('* * * * *');`              | Executa a tarefa em um agendamento _cron_ personalizado         |
| `->everySecond();`                  | Executa a tarefa a cada segundo                               |
| `->everyTwoSeconds();`              | Executa a tarefa a cada dois segundos                         |
| `->everyFiveSeconds();`             | Executa a tarefa a cada cinco segundos                        |
| `->everyTenSeconds();`              | Executa a tarefa a cada dez segundos                          |
| `->everyFifteenSeconds();`          | Executa a tarefa a cada quinze segundos                       |
| `->everyTwentySeconds();`           | Executa a tarefa a cada vinte segundos                        |
| `->everyThirtySeconds();`           | Executa a tarefa a cada trinta segundos                       |
| `->everyMinute();`                  | Executa a tarefa a cada minuto                                |
| `->everyTwoMinutes();`              | Executa a tarefa a cada dois minutos                          |
| `->everyThreeMinutes();`            | Executar a tarefa a cada três minutos                         |
| `->everyFourMinutes();`             | Executar a tarefa a cada quatro minutos                       |
| `->everyFiveMinutes();`             | Executar a tarefa a cada cinco minutos                        |
| `->everyTenMinutes();`              | Executar a tarefa a cada dez minutos                          |
| `->everyFifteenMinutes();`          | Executar a tarefa a cada quinze minutos                       |
| `->everyThirtyMinutes();`           | Executar a tarefa a cada trinta minutos                       |
| `->hourly();`                       | Executar a tarefa a cada hora                                 |
| `->hourlyAt(17);`                   | Executar a tarefa a cada hora 17 minutos após a hora          |
| `->everyOddHour($minutes = 0);`     | Executar a tarefa a cada hora ímpar                           |
| `->everyTwoHours($minutes = 0);`    | Executar a tarefa a cada duas horas                           |
| `->everyThreeHours($minutes = 0);`  | Executar a tarefa a cada três horas                           |
| `->everyFourHours($minutes = 0);`   | Executar a tarefa a cada quatro horas                         |
| `->everySixHours($minutes = 0);`    | Executar a tarefa a cada seis horas                           |
| `->daily();`                        | Executar a tarefa todos os dias à meia-noite                  |
| `->dailyAt('13:00');`               | Executar a tarefa todos os dias às 13:00                      |
| `->twiceDaily(1, 13);`              | Executar a tarefa diariamente à 1:00 e 13:00                  |
| `->twiceDailyAt(1, 13, 15);`        | Executar a tarefa diariamente à 1:15 e 13:15                  |
| `->weekly();`                       | Executar a tarefa todos os domingos às 00:00                  |
| `->weeklyOn(1, '8:00');`            | Executar a tarefa toda semana na segunda-feira às 8:00        |
| `->monthly();`                      | Executar a tarefa no primeiro dia de cada mês às 00:00        |
| `->monthlyOn(4, '15:00');`          | Executar a tarefa todo mês no dia 4 às 15:00                  |
| `->twiceMonthly(1, 16, '13:00');`   | Executar a tarefa mensalmente nos dias 1º e 16 às 13:00       |
| `->lastDayOfMonth('15:00');`        | Executar a tarefa no último dia do mês às 15:00               |
| `->quarterly();`                    | Executar a tarefa no primeiro dia de cada trimestre às 00:00  |
| `->quarterlyOn(4, '14:00');`        | Execute a tarefa todo trimestre no dia 4 às 14:00             |
| `->yearly();`                       | Execute a tarefa no primeiro dia de cada ano às 00:00         |
| `->yearlyOn(6, 1, '17:00');`        | Execute a tarefa todo ano no dia 1º de junho às 17:00         |
| `->timezone('America/New_York');`   | Defina o fuso horário para a tarefa                           |

Esses métodos podem ser combinados com restrições adicionais para criar cronogramas ainda mais otimizados que rodam apenas em determinados dias da semana. Por exemplo, você pode agendar uma tarefa para ser executada semanalmente aos domingos:

```php
    use Illuminate\Support\Facades\Schedule;

    // Execute uma vez por semana, na segunda-feira, às 13h...
    Schedule::call(function () {
        // ...
    })->weekly()->mondays()->at('13:00');

    // Execute de hora em hora, das 8h às 17h, durante a semana...
    Schedule::command('foo')
              ->weekdays()
              ->hourly()
              ->timezone('America/Chicago')
              ->between('8:00', '17:00');
```

Uma lista das outras restrições, no calendário, é mostrada a seguir:

| Método                                    | Descrição                                                                     |
|-------------------------------------------|-------------------------------------------------------------------------------|
| `->weekdays();`                           | Limitar a tarefa a dias úteis                                                 |
| `->weekends();`                           | Limitar a tarefa a fins de semana                                             |
| `->sundays();`                            | Limitar a tarefa a domingo                                                    |
| `->mondays();`                            | Limitar a tarefa a segunda-feira                                              |
| `->tuesdays();`                           | Limitar a tarefa a terça-feira                                                |
| `->wednesdays();`                         | Limitar a tarefa a quarta-feira                                               |
| `->thursdays();`                          | Limitar a tarefa a quinta-feira                                               |
| `->fridays();`                            | Limitar a tarefa a sexta-feira                                                |
| `->saturdays();`                          | Limitar a tarefa a sábado                                                     |
| `->days(array\|mixed);`                   | Limitar a tarefa a dias específicos                                           |
| `->between($startTime, $endTime);`        | Limitar a tarefa a ser executada entre os horários de início e término        |
| `->unlessBetween($startTime, $endTime);`  | Limitar a tarefa para não ser executada entre os horários de início e término |
| `->when(Closure);`                        | Limitar a tarefa com base em um teste de verdade                              |
| `->environments($env);`                   | Limitar a tarefa a ambientes específicos                                      |

<a name="day-constraints"></a>
#### Restrições diárias

O método `days` permite que você limite a execução de uma tarefa a dias específicos da semana. Por exemplo, você pode agendar uma tarefa para ser executada apenas aos domingos e quintas-feiras:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('emails:send')
                    ->hourly()
                    ->days([0, 3]);
```

Como alternativa, você pode usar as constantes disponíveis na classe `Illuminate\Console\Scheduling\Schedule` quando estiver definindo os dias em que uma tarefa deve ser executada.

```php
    use Illuminate\Support\Facades;
    use Illuminate\Console\Scheduling\Schedule;

    Facades\Schedule::command('emails:send')
                    ->hourly()
                    ->days([Schedule::SUNDAY, Schedule::WEDNESDAY]);
```

<a name="between-time-constraints"></a>
#### Entre limitações de tempo

O método `between` permite limitar a execução de uma tarefa em função da hora do dia:

```php
    Schedule::command('emails:send')
                        ->hourly()
                        ->between('7:00', '22:00');
```

Da mesma forma, o método `unlessBetween()` pode ser usado para excluir a execução de uma tarefa por um certo período de tempo:

```php
    Schedule::command('emails:send')
                        ->hourly()
                        ->unlessBetween('23:00', '4:00');
```

<a name="truth-test-constraints"></a>
#### Restrições do teste da verdade

O método `when()` pode ser usado para limitar a execução de uma tarefa em função do resultado de um determinado teste lógico. Em outras palavras, se o _closure_ retornar 'verdadeiro', a tarefa será executada apenas se nenhuma outra condição limitadora impedir que seja executada.

```php
    Schedule::command('emails:send')->daily()->when(function () {
        return true;
    });
```

O método `skip` pode ser considerado como um inverso de `when`. Se esse último retorna `true`, a tarefa agendada não é executada.

```php
    Schedule::command('emails:send')->daily()->skip(function () {
        return true;
    });
```

Ao utilizar os comandos `when` encadeados, o comando agendado somente será executado quando todas as condições `when` forem verdadeiras (`true`).

<a name="environment-constraints"></a>
#### Restrições de ambiente

O método `environments` permite executar tarefas apenas nos ambientes especificadas (conforme definido pela [variável de ambiente](/docs/configuration#environment-configuration) `APP_ENV`):

```php
    Schedule::command('emails:send')
                ->daily()
                ->environments(['staging', 'production']);
```

<a name="timezones"></a>
### Fuso horário

Com o método `timezone` você pode especificar que a hora do trabalho agendado deve ser interpretada no fuso horário desejado:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('report:generate')
             ->timezone('America/New_York')
             ->at('2:00')
```

Se estiver atribuindo repetidamente o mesmo fuso horário para todas as suas tarefas agendadas, pode especificar que fuso horário deve ser usado para todas as tarefas definindo a opção `schedule_timezone` em seu arquivo de configuração `app`, no diretório da sua aplicação.

```php
    'timezone' => env('APP_TIMEZONE', 'UTC'),

    'schedule_timezone' => 'America/Chicago',
```

::: warning ATENÇÃO
Lembre-se de que alguns fusos horários usam o horário de verão. Quando ocorrem alterações no horário de verão, uma tarefa agendada pode ser executada duas vezes ou nem executar. É por isso que recomendamos evitar a programação por fuso horário sempre que possível.
:::

<a name="preventing-task-overlaps"></a>
### Prevenindo sobreposição de tarefas

Por padrão, as tarefas agendadas serão executadas mesmo se a instância anterior da tarefa estiver ainda em execução. Para evitar isso, você pode usar o método `withoutOverlapping`.

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('emails:send')->withoutOverlapping();
```

Neste exemplo, o comando [Artisan](/docs/artisan) `emails:send` será executado a cada minuto enquanto estiver inativo. O método `withoutOverlapping` é especialmente útil para tarefas que variam drasticamente no tempo de execução, evitando a previsão exata do tempo necessário para a execução da tarefa em questão.

Se necessário, você pode especificar o número de minutos que devem passar antes do vencimento da restrição "Sem sobreposição". Por padrão, a restrição expira depois de 24 horas.

```php
    Schedule::command('emails:send')->withoutOverlapping(10);
```

Ao utilizar o método `withoutOverlapping`, nos bastidores, é utilizado o [cache](/docs/cache) do seu aplicativo para obter os bloqueios. Se necessário, pode ser feito a limpeza destes bloqueios utilizando o comando Artisan `schedule:clear-cache`. Normalmente só se torna necessário fazer este procedimento caso uma tarefa fique retida devido a um problema de servidor inesperado.

<a name="running-tasks-on-one-server"></a>
### Tarefas em execução em um servidor

::: warning ATENÇÃO
Para usar este recurso, seu aplicativo deve utilizar o driver de cache `database`, `memcached`, `dynamodb`, ou `redis` como um driver de cache padrão. Além disso, todos os servidores devem estar se comunicando com o mesmo servidor de cache central.
:::

Se o agendador da sua aplicação estiver em funcionamento em vários servidores, você pode limitar uma tarefa agendada para ser executada em um único servidor. Por exemplo, considere que tenha uma tarefa agendada para criar um novo relatório todas as sextas-feiras à noite. Se o agendador de tarefas estiver em execução em três servidores operacionais, a tarefa agendada será executada nesses três servidores e criará o relatório três vezes. Isso não é bom!

Para indicar que a tarefa deve ser executada em apenas um servidor, use o método `onOneServer` ao definir a tarefa agendada. O primeiro servidor a receber a tarefa bloqueia o trabalho por meio de um bloqueio atômico para impedir que outros servidores executem a mesma tarefa ao mesmo tempo:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('report:generate')
                    ->fridays()
                    ->at('17:00')
                    ->onOneServer();
```

<a name="naming-unique-jobs"></a>
#### Nomeando tarefas em um servidor

Às vezes, você pode precisar agendar o mesmo trabalho para ser despachado com parâmetros diferentes, enquanto ainda instrui o Laravel a executar cada permutação do job em um único servidor. Para fazer isso, você pode atribuir a cada definição de agendamento um nome exclusivo por meio do método `name`:

```php
Schedule::job(new CheckUptime('https://laravel.com'))
            ->name('check_uptime:laravel.com')
            ->everyFiveMinutes()
            ->onOneServer();

Schedule::job(new CheckUptime('https://vapor.laravel.com'))
            ->name('check_uptime:vapor.laravel.com')
            ->everyFiveMinutes()
            ->onOneServer();
```

Da mesma forma, as interrupções programadas devem ser nomeadas se for pretendido executá-las num servidor específico:

```php
Schedule::call(fn () => User::resetApiRequestCount())
    ->name('reset-api-request-count')
    ->daily()
    ->onOneServer();
```

<a name="background-tasks"></a>
### Tarefas em background

Por padrão, várias tarefas programadas para serem executadas ao mesmo tempo são executadas sequencialmente de acordo com a ordem em que foram definidas no método `schedule`. Se as tarefas demoram muito tempo, é possível que as subsequentes sejam iniciadas bem mais tarde do que o esperado. Se você preferir que elas sejam executadas em segundo plano para que todas possam ser executadas simultaneamente, poderá usar o método `runInBackground`:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('analytics:report')
             ->daily()
             ->runInBackground();
```

::: warning ATENÇÃO
O método `runInBackground` só pode ser usado ao agendar tarefas por meio dos métodos `command` e `exec`.
:::

<a name="maintenance-mode"></a>
### Modo manutenção

Tarefas agendadas do seu aplicativo não serão executadas quando estiver em [modo manutenção](/docs/configuration#maintenance-mode) porque nós não queremos que suas tarefas interfiram com uma manutenção incompleta que você pode estar realizando no servidor. No entanto, se você quiser forçar uma tarefa para ser executada mesmo em modo de manutenção, você pode chamar o método `evenInMaintenanceMode` ao definir a tarefa:

```php
    Schedule::command('emails:send')->evenInMaintenanceMode();
```

<a name="running-the-scheduler"></a>
## Executando o agendador

Agora que você aprendeu a definir tarefas agendadas, vamos falar sobre como executar essas tarefas no servidor. O comando `schedule:run` do Artisan irá analisar todas as suas tarefas agendadas e determinar se eles precisam ser executados de acordo com o horário atual do servidor.

Por isso, ao utilizar o agendador do Laravel, basta acrescentar uma única entrada de configuração de _cron_ para nosso servidor executar o comando `schedule:run` a cada minuto. Se você não souber como adicionar entradas de crons em seu servidor, considere usar um serviço como [Laravel Forge](https://forge.laravel.com), que poderá gerenciar as entradas de _cron_ por você:

```shell
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

<a name="sub-minute-scheduled-tasks"></a>
### Tarefas programadas com menos de 1 minuto

Na maioria dos sistemas operacionais, as tarefas agendadas são limitadas para ser executadas um máximo de uma vez por minuto. Contudo, o agendador do Laravel permite que você agende trabalhos para serem executados em intervalos mais frequentes, inclusive uma única vez por segundo:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::call(function () {
        DB::table('recent_users')->delete();
    })->everySecond();
```

Se houver trabalhos com duração inferior a 1 minuto definidos no seu aplicativo, o comando `schedule:run` continuará rodando pelo restante do minuto atual em vez de interromper imediatamente. Isso possibilita que o comando invoque todos os trabalhos necessários durante todo o minuto.

Como tarefas de menos de um minuto que demoram mais do que o esperado para serem executadas podem atrasar a execução de tarefas de menos de um minuto posteriores, é recomendável que todas as tarefas de menos de um minuto despachem trabalhos enfileirados ou comandos em segundo plano para lidar com o processamento real da tarefa:

```php
    use App\Jobs\DeleteRecentUsers;

    Schedule::job(new DeleteRecentUsers)->everyTenSeconds();

    Schedule::command('users:delete')->everyTenSeconds()->runInBackground();
```

<a name="interrupting-sub-minute-tasks"></a>
#### Interrompa tarefas menores que 1 minuto

Como o comando `schedule:run` é executado durante todo o minuto de invocação quando as tarefas são definidas para subminutos, você talvez precise interromper o comando ao implantar seu aplicativo. Caso contrário, uma instância do comando `schedule:run`, que já esteja sendo executado, continuará a usar o código anteriormente implementado em sua aplicação até o final do minuto atual.

Para interromper chamadas em andamento do comando `schedule:run`, você pode acrescentar o comando `schedule:interrupt` no script de implantação de seu aplicativo. Esse comando deve ser convocado depois de seu aplicativo terminar:

```shell
php artisan schedule:interrupt
```

<a name="running-the-scheduler-locally"></a>
### Executando o Agendador localmente

Normalmente, você não acrescenta um _cron_ ao seu computador local. Em vez disso, você pode usar o comando `schedule:work` do Artisan. Esse comando executa-se no plano de fundo e invoca o agendador a cada minuto até que você conclua o comando:

```shell
php artisan schedule:work
```

<a name="task-output"></a>
## Saída de tarefa

O agendador do Laravel disponibiliza diversos métodos convenientes para trabalhar com os resultados gerados por tarefas programadas. Primeiro, é possível enviar o resultado para um arquivo usando o método `sendOutputTo()` para análise posterior:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('emails:send')
             ->daily()
             ->sendOutputTo($filePath);
```

Se quiser anexá-lo a uma saída específica, use o método `appendOutputTo`:

```php
    Schedule::command('emails:send')
             ->daily()
             ->appendOutputTo($filePath);
```

Usando o método `emailOutputTo`, é possível enviar os resultados de uma tarefa para qualquer endereço de e-mail. Antes de enviar os resultados de uma tarefa, você deve configurar os serviços de e-mail do Laravel:

```php
    Schedule::command('report:generate')
             ->daily()
             ->sendOutputTo($filePath)
             ->emailOutputTo('taylor@example.com');
```

Se você deseja enviar a saída por e-mail somente se o comando programado do Artisan ou do sistema terminar com um código de saída diferente de zero, use o método `emailOutputOnFailure`:

```php
    Schedule::command('report:generate')
             ->daily()
             ->emailOutputOnFailure('taylor@example.com');
```

::: warning ATENÇÃO
Os métodos `emailOutputTo`, `emailOutputOnFailure`, `sendOutputTo` e `appendOutputTo` são exclusivos dos métodos `command` e `exec`.
:::

<a name="task-hooks"></a>
## Ganchos de tarefas

Usando os métodos `before` e `after`, você pode especificar códigos para serem executados antes e depois da tarefa agendada ser executada.

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('emails:send')
             ->daily()
             ->before(function () {
                 // A tarefa está prestes a ser executada...
             })
             ->after(function () {
                 // A tarefa foi executada...
             });
```

Os métodos `onSuccess` e `onFailure` permitem especificar um código a ser executado quando o trabalho agendado é realizado com sucesso ou falha. Um erro indica que o comando do sistema ou Artisan terminou com um código de saída diferente de zero:

```php
    Schedule::command('emails:send')
             ->daily()
             ->onSuccess(function () {
                 // A tarefa foi bem-sucedida...
             })
             ->onFailure(function () {
                 // A tarefa falhou...
             });
```

Se houver saída disponível a partir de sua instância, você pode acessá-la em seus _hooks_ `after`, `onSuccess` ou `onFailure` tipando uma instância `Illuminate\Support\Stringable` como o argumento `$output` na definição do seu _hook_:

```php
    use Illuminate\Support\Stringable;

    Schedule::command('emails:send')
             ->daily()
             ->onSuccess(function (Stringable $output) {
                 // A tarefa foi bem-sucedida...
             })
             ->onFailure(function (Stringable $output) {
                 // A tarefa falhou...
             });
```

<a name="pinging-urls"></a>
#### Ping em URLs

Usando os métodos `pingBefore` e `thenPing`, o agendador pode fazer um ping a uma URL indicada antes ou depois de executar uma tarefa. Este método é útil para notificar um serviço externo, como [Envoyer](https://envoyer.io), que sua tarefa agendada está começando ou terminou:

```php
    Schedule::command('emails:send')
             ->daily()
             ->pingBefore($url)
             ->thenPing($url);
```

Os métodos `pingBeforeIf` e `thenPingIf` são usados para fazer requisições HTTP GET a uma URL somente se o estado atual for `true`.

```php
    Schedule::command('emails:send')
             ->daily()
             ->pingBeforeIf($condition, $url)
             ->thenPingIf($condition, $url);
```

Os métodos `pingOnSuccess` e `pingOnFailure` podem ser usados para enviar um ping a uma URL especificada somente se a tarefa for bem-sucedida ou falhar. Uma falha indica que o comando do sistema ou Artisan agendado terminou com código de saída diferente de zero:

```php
    Schedule::command('emails:send')
             ->daily()
             ->pingOnSuccess($successUrl)
             ->pingOnFailure($failureUrl);
```

<a name="events"></a>
## Eventos

Laravel fornece um conjunto de [eventos](/docs/events) durante a fase de agendamento. Você pode definir um ouvinte para qualquer um dos seguintes eventos:

| Nome do evento                                              |
|-------------------------------------------------------------|
| `Illuminate\Console\Events\ScheduledTaskStarting`           |
| `Illuminate\Console\Events\ScheduledTaskFinished`           |
| `Illuminate\Console\Events\ScheduledBackgroundTaskFinished` |
| `Illuminate\Console\Events\ScheduledTaskSkipped`            |
| `Illuminate\Console\Events\ScheduledTaskFailed`             |
