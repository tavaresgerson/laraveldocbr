# Programação de Tarefas

<a name="introduction"></a>
## Introdução

 No passado, você pode ter escrito uma entrada de configuração crontab para cada tarefa que necessitava ser agendada em seu servidor. Porém, isso rapidamente se torna um incômodo porque a programação da sua tarefa não está mais sob controle de origem e você deve fazer login com SSH em seu servidor para visualizar suas entradas crontab existentes ou adicionar entradas adicionais.

 O agendador de comandos do Laravel oferece uma nova abordagem para gerenciar tarefas agendadas em seu servidor. O agendador permite que você defina sua programação de comando de forma fluente e expressiva dentro da própria aplicação Laravel. Ao usar o agendador, é necessário apenas uma única entrada cronno no seu servidor. Sua tarefa de programação normalmente é definida no arquivo `routes/console.php` da sua aplicação.

<a name="defining-schedules"></a>
## Definição de padrões

 Pode definir todas as suas tarefas agendadas no ficheiro `routes/console.php` da aplicação. Para começar, vamos ver um exemplo. Neste exemplo, programamos uma execução de código todos os dias à meia-noite. No interior do código fechado executaremos uma consulta ao banco de dados para apagar uma tabela:

```php
    <?php

    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Schedule;

    Schedule::call(function () {
        DB::table('recent_users')->delete();
    })->daily();
```

 Além de agendamento usando closures, você pode também agendar [objetos invocáveis](https://secure.php.net/manual/en/language.oop5.magic.php#object.invoke). Os objetos invocáveis são classes PHP simples que contêm um método `__invoke`:

```php
    Schedule::call(new DeleteRecentUsers)->daily();
```

 Se você preferir reservar o arquivo `routes/console.php` para definições de comandos somente, poderá usar o método `withSchedule` no arquivo `bootstrap/app.php` da sua aplicação para definir as tarefas agendadas. Esse método aceita um closure que recebe uma instância do programador:

```php
    use Illuminate\Console\Scheduling\Schedule;

    ->withSchedule(function (Schedule $schedule) {
        $schedule->call(new DeleteRecentUsers)->daily();
    })
```

 Se pretender visualizar uma visão geral das tarefas planeadas e a hora prevista da sua execução, pode utilizar o comando do Artisan `schedule:list`:

```bash
php artisan schedule:list
```

<a name="scheduling-artisan-commands"></a>
### Planeamento de comandos de artesão

 Além da agendamento de fechamentos, você também poderá agendar comandos [Artisan](/docs/artisan) e comandos do sistema. Por exemplo, você pode usar o método `command` para agendar um comando Artisan usando o nome ou a classe do comando.

 Quando forem agendados comandos de Artesão utilizando o nome da classe do comando, poderá ser enviado um conjunto de argumentos adicionais que devem ser fornecidos ao comando na sequência da sua execução:

```php
    use App\Console\Commands\SendEmailsCommand;
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('emails:send Taylor --force')->daily();

    Schedule::command(SendEmailsCommand::class, ['Taylor', '--force'])->daily();
```

<a name="scheduling-artisan-closure-commands"></a>
#### Programar comandos de closure do artesão

 Se você quiser agendar um comando do tipo "Artisan" definido por meio de uma chave, poderá utilizar os métodos relacionados à programação após a definição do comando:

```php
    Artisan::command('delete:recent-users', function () {
        DB::table('recent_users')->delete();
    })->purpose('Delete recent users')->daily();
```

 Se você precisar passar argumentos ao comando de closure, poderá fornec-los para o método `schedule`:

```php
    Artisan::command('emails:send {user} {--force}', function ($user) {
        // ...
    })->purpose('Send emails to the specified user')->schedule(['Taylor', '--force'])->daily();
```

<a name="scheduling-queued-jobs"></a>
### Agendamento de tarefas pendentes

 O método `job` pode ser usado para agendar um trabalho de [fila de espera](/docs/queues). Este método proporciona uma forma conveniente de agendar trabalhos em fila de espera sem ter que usar o método `call` para definir os fechos a serem agendados:

```php
    use App\Jobs\Heartbeat;
    use Illuminate\Support\Facades\Schedule;

    Schedule::job(new Heartbeat)->everyFiveMinutes();
```

 Um segundo e um terceiro argumentos opcionais podem ser passados à função `job` que especificam o nome da fila e a ligação de fila que devem ser utilizadas para encaminhar a tarefa:

```php
    use App\Jobs\Heartbeat;
    use Illuminate\Support\Facades\Schedule;

    // Dispatch the job to the "heartbeats" queue on the "sqs" connection...
    Schedule::job(new Heartbeat, 'heartbeats', 'sqs')->everyFiveMinutes();
```

<a name="scheduling-shell-commands"></a>
### Agendando comandos de shell

 O método `exec` pode ser utilizado para emitir um comando ao sistema operativo.

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::exec('node /home/forge/script.js')->daily();
```

<a name="schedule-frequency-options"></a>
### Opções de Frecuência do Horário

 Vimos alguns exemplos de como você pode configurar uma tarefa para ser executada em intervalos especificados. No entanto, existem muitas outras frequências de programação de tarefas que você pode atribuir a uma tarefa:

<div class="overflow-auto">

|  Método |  Descrição |
|-----------------------------------------------|-------------|
|  ->`cron('* * * * *');` |  Executar a tarefa em um cron personalizado |
|  ->everySecond(); |  Execute a tarefa a cada segundo |
|  ->everyTwoSeconds(); |  Executar a tarefa a cada dois segundos |
|  ->everyFiveSeconds(); |  Executar a tarefa a cada cinco segundos |
|  ->everyTenSeconds(); |  Executar a tarefa a cada dez segundos |
|  `->everyFifteenSeconds(); |  Execute a tarefa a cada quinze segundos |
|  ->everyTwentySeconds(); |  Execute a tarefa a cada vinte segundos |
|  ->everyThirtySeconds(); |  Execute a tarefa a cada trinta segundos |
|  `->everyMinute(); |  Executar a tarefa a cada minuto |
|  ->everyTwoMinutes(); |  Executar a tarefa a cada dois minutos |
|  `-> everyThreeMinutes(); |  Executar a tarefa a cada três minutos |
|  ->everyFourMinutes(); |  Execute a tarefa a cada quatro minutos |
|  ->everyFiveMinutes(); |  Execute a tarefa a cada cinco minutos |
|  ->`everyTenMinutes()`; |  Executar a tarefa a cada dez minutos |
|  ->everyFifteenMinutes(); |  Executar a tarefa a cada de quinze minutos |
|  ->everyThirtyMinutes(); |  Executar a tarefa a cada trinta minutos |
|  `->hora ();` |  Execute a tarefa a cada hora |
|  ->horaDiariamente(17); |  Execute a tarefa a cada hora em 17 minutos passados da hora |
|  `->everyOddHour($minutos = 0);` |  Execute a tarefa a cada uma hora que termine num número ímpar |
|  `->everyTwoHours($minutes = 0); |  Execute a tarefa a cada duas horas |
|  `->everyThreeHours($minutes = 0);` |  Execute a tarefa a cada três horas |
|  ->everyFourHours($minutos = 0); |  Execute a tarefa a cada quatro horas |
|  ->everySixHours($minutos = 0); |  Executar a tarefa a cada seis horas |
|  ->daily(); |  Execute a tarefa todos os dias à meia-noite |
|  `->dailyAt('13:00');` |  Executar a tarefa todos os dias às 13h. |
|  `->twiceDaily(1, 13); |  Execute a tarefa diariamente às 1:00 e às 13:00 |
|  ->twiceDailyAt(1, 13, 15); |  Execute a tarefa diariamente às 01:15 e 13:15. |
|  -> semanal(); |  Execute a tarefa todas as segundas-feiras às 00h00 |
|  `->weeklyOn(1, '8:00');` |  Executar a tarefa todas as segundas-feiras às 8:00. |
|  `->monthly();` |  Executar a tarefa no primeiro dia de cada mês às 00:00 |
|  `->monthlyOn(4, "15:00");` |  Executar a tarefa todo mês às 15h do dia 4 |
|  `->twiceMonthly(1, 16, '13:00');` |  Execute a tarefa mensalmente no dia 1º e dia 16 às 13:00. |
|  `->lastDayOfMonth(‘15:00’);` |  Execute a tarefa no último dia do mês às 15:00. |
|  `->trimestral();` |  Executar a tarefa no primeiro dia de cada trimestre às 00:00 |
|  `->quartalAnualmente(4,'14:00');` |  Execute a tarefa trimestralmente no dia 4, às 14:00. |
|  ->yearly(); |  Execute a tarefa no primeiro dia de cada ano, às 00h00. |
|  ->anual(6, 1, '17:00'); |  Executar a tarefa todos os anos no dia 1º de junho às 17h. |
|  `->timezone("America/New_York");` |  Define a zona horária para a tarefa |

</div>

 Estes métodos podem ser combinados com restrições adicionais para criar cronogramas ainda mais otimizados que apenas rodam em certos dias da semana. Por exemplo, você pode agendar um comando para ser executado semanalmente às segundas-feiras:

```php
    use Illuminate\Support\Facades\Schedule;

    // Run once per week on Monday at 1 PM...
    Schedule::call(function () {
        // ...
    })->weekly()->mondays()->at('13:00');

    // Run hourly from 8 AM to 5 PM on weekdays...
    Schedule::command('foo')
              ->weekdays()
              ->hourly()
              ->timezone('America/Chicago')
              ->between('8:00', '17:00');
```

 Uma lista de restrições adicionais no calendário pode ser encontrada abaixo:

<div class="overflow-auto">

|  Método |  Descrição |
|-------------|-------------|
|  ->weekdays(); |  Limite a tarefa aos dias úteis |
|  ->fins de semana(); |  Limitar a tarefa aos finais de semana |
|  ->domingos(); |  Limite a tarefa para domingo |
|  ->``mondays;` |  Limite a tarefa para o dia da semana, segunda-feira |
|  ->`terças-feiras(); |  Limite a tarefa para terça-feira |
|  `->quartas-feiras();` |  Limite a tarefa para quarta-feira |
|  `-> quintas-feiras();` |  Limite a tarefa para quinta-feira |
|  ->fridays(); |  Limite a tarefa para sexta-feira |
|  `-> sábados(); |  Limite a tarefa ao sábado |
|  ->dias (matriz |  misturado;)` |  Limite a tarefa para dias específicos |
|  ->entre($startTime, $endTime); |  Limite a execução da tarefa entre os horários de início e fim |
|  `->unlessBetween($startTime, $endTime);` |  Limitar a tarefa para que não seja executada entre os horários de início e término |
|  `->quando(Fechamento;)` |  Limite a tarefa com base em um teste de veracidade |
|  `->environments($env); |  Limite a tarefa para ambientes específicos |

</div>

<a name="day-constraints"></a>
#### Restrições do dia

 O método `days` pode ser utilizado para limitar a execução de uma tarefa a determinados dias da semana. Por exemplo, você pode agendar um comando para executar sempre às segundas e sextas-feiras:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('emails:send')
                    ->hourly()
                    ->days([0, 3]);
```

 Como alternativa, você pode usar as constantes disponíveis na classe `Illuminate\Console\Scheduling\Schedule` ao definir os dias em que uma tarefa deve ser executada.

```php
    use Illuminate\Support\Facades;
    use Illuminate\Console\Scheduling\Schedule;

    Facades\Schedule::command('emails:send')
                    ->hourly()
                    ->days([Schedule::SUNDAY, Schedule::WEDNESDAY]);
```

<a name="between-time-constraints"></a>
#### Entre Limitações de Tempo

 O método `entre` permite limitar a execução de uma tarefa em função da hora do dia:

```php
    Schedule::command('emails:send')
                        ->hourly()
                        ->between('7:00', '22:00');
```

 Do mesmo modo, o método `unlessBetween` pode ser utilizado para excluir a execução de uma tarefa durante um período de tempo:

```php
    Schedule::command('emails:send')
                        ->hourly()
                        ->unlessBetween('23:00', '4:00');
```

<a name="truth-test-constraints"></a>
#### Restrições do teste de veracidade

 O método `when` pode ser usado para limitar a execução de uma tarefa com base no resultado de um determinado teste lógico. Em outras palavras, se o closure for retornar `true`, a tarefa será executada apenas se nenhuma outra condição limitante impedir que ela seja executada:

```php
    Schedule::command('emails:send')->daily()->when(function () {
        return true;
    });
```

 O método `skip` pode ser visto como o inverso do `when`. Se este retornar `true`, a tarefa agendada não será executada.

```php
    Schedule::command('emails:send')->daily()->skip(function () {
        return true;
    });
```

 Ao usar métodos com `when` em cadeia, o comando agendado somente será executado se todas as condições do `when` retornarem `true`.

<a name="environment-constraints"></a>
#### Restrições Ambientais

 O método `environments` permite executar tarefas apenas nos ambientes especificados (conforme definido pela variável de ambiente `APP_ENV`):

```php
    Schedule::command('emails:send')
                ->daily()
                ->environments(['staging', 'production']);
```

<a name="timezones"></a>
### Fuso horário

 Com o método `timezone`, você pode especificar que a hora da tarefa agendada deve ser interpretada no fuso horário desejado.

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('report:generate')
             ->timezone('America/New_York')
             ->at('2:00')
```

 Se você estiver atribuindo repetidamente o mesmo fuso horário para todas as suas tarefas agendadas, pode especificar qual fuso horário deve ser atribuído a todas as agendas definindo uma opção `schedule_timezone` no arquivo de configuração do aplicativo, chamado `app`:

```php
    'timezone' => env('APP_TIMEZONE', 'UTC'),

    'schedule_timezone' => 'America/Chicago',
```

 > [AVISO]
 > Lembre-se de que alguns fusos horários utilizam o horário de verão. Quando ocorrem mudanças no horário de verão, a tarefa agendada pode ser executada duas vezes ou até não ser executada. Por esse motivo, recomendamos evitar a programação por fusos horários sempre que possível.

<a name="preventing-task-overlaps"></a>
### Evitar sobreposições de tarefas

 Por padrão, as tarefas agendadas serão executadas mesmo se a instância anterior da tarefa estiver ainda em execução. Para impedir isto, você pode usar o método `withoutOverlapping`:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('emails:send')->withoutOverlapping();
```

 Neste exemplo, o comando [Artisan command] (/docs/artisan) `emails:send` será executado a cada minuto, caso esteja parado. O método `withoutOverlapping` é especialmente útil para tarefas que variam drasticamente no tempo de execução, evitando a previsão exata do tempo necessário para a execução da tarefa em questão.

 Caso necessário, você pode especificar o número de minutos que devem ser transcorridos antes do vencimento da restrição "sem sobreposição". Por padrão, a restrição expira após 24 horas.

```php
    Schedule::command('emails:send')->withoutOverlapping(10);
```

 Ao utilizar o método `withoutOverlapping`, atrás das cortinas, é utilizada a cache da sua aplicação para obter os bloqueios. Se necessário, pode ser feito o limpeza destes bloqueios usando o comando Artisan `schedule:clear-cache`. Normalmente, só se torna necessário fazer este procedimento caso uma tarefa fique retida devido a um problema de servidor inesperado.

<a name="running-tasks-on-one-server"></a>
### Tarefas em execução num servidor

 > [AVISO]
 > Para utilizar esse recurso, seu aplicativo deve usar o driver de cache `database`, `memcached`, `dynamodb` ou `redis` como driver de cache por padrão. Além disso, todos os servidores devem estar se comunicando com o mesmo servidor de cache central.

 Se o agendador da sua aplicação estiver em execução em vários servidores, poderá limitar uma tarefa agendada à execução num único servidor. Por exemplo, suponha que tenha uma tarefa programada para criar um novo relatório todas as sextas-feiras à noite. Se o agendador de tarefas estiver em execução em três servidores operacionais, a tarefa programada será executada nesses três servidores e gerará o relatório três vezes. Isto não é bom!

 Para indicar que a tarefa deverá ser executada em apenas um servidor, utilize o método `onOneServer` ao definir a tarefa agendada. O primeiro servidor a receber a tarefa bloqueia o trabalho por meio de um bloqueio atômico para impedir que outros servidores executem a mesma tarefa ao mesmo tempo:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('report:generate')
                    ->fridays()
                    ->at('17:00')
                    ->onOneServer();
```

<a name="naming-unique-jobs"></a>
#### Nomes de tarefas em servidor único

 Às vezes você pode precisar agendar o mesmo trabalho para ser despachado com diferentes parâmetros, e, ainda assim, instruir Laravel a rodar cada variação do trabalho em um único servidor. Para fazer isso, você pode atribuir a cada definição de agendamento um nome exclusivo pelo método `name`:

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

 Da mesma forma, as interrupções programadas devem ser nomeadas se for pretendido executá-las em um servidor específico:

```php
Schedule::call(fn () => User::resetApiRequestCount())
    ->name('reset-api-request-count')
    ->daily()
    ->onOneServer();
```

<a name="background-tasks"></a>
### Tarefas de fundo

 Por padrão, várias tarefas programadas para serem executadas ao mesmo tempo são executadas sequencialmente de acordo com a ordem em que foram definidas no método `schedule`. Se as tarefas demoram muito tempo, é possível que as subsequentes sejam iniciadas bem mais tarde do que o esperado. Se você preferir que elas sejam executadas em segundo plano para que todas possam ser executadas simultaneamente, pode usar o método `runInBackground`:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('analytics:report')
             ->daily()
             ->runInBackground();
```

 > [ATENÇÃO]
 > O método `runInBackground` só pode ser utilizado para planificar tarefas através dos métodos `command` e `exec`.

<a name="maintenance-mode"></a>
### Modo de Manutenção

 As tarefas agendadas do seu aplicativo não serão executadas quando o aplicativo estiver em [modo de manutenção](/docs/configuration#maintenance-mode), pois não queremos que suas tarefas interfiram com a manutenção incompleta que você pode estar realizando no servidor. No entanto, se você desejar forçar uma tarefa para ser executada mesmo em modo de manutenção, poderá chamar o método `evenInMaintenanceMode` ao definir a tarefa:

```php
    Schedule::command('emails:send')->evenInMaintenanceMode();
```

<a name="running-the-scheduler"></a>
## Executando o Programador

 Agora que você aprendeu como definir tarefas agendadas, discutiremos sobre como executá-las em nosso servidor. O comando `schedule:run` do Artisan avaliará todas as suas tarefas agendadas e determinará se elas precisam ser executadas de acordo com o horário atual do servidor.

 Portanto, ao usar o agendador do Laravel, basta adicionar uma única entrada de configuração de cron para nosso servidor que execute o comando `schedule:run` a cada minuto. Se você não souber como adicionar entradas de crons em seu servidor, considere usar um serviço como [Laravel Forge](https://forge.laravel.com), que poderá gerenciar as entradas de cron para você:

```shell
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

<a name="sub-minute-scheduled-tasks"></a>
### Tarefas programadas com menos de um minuto

 Na maioria dos sistemas operacionais, os trabalhos de cron são limitados a serem executados no máximo uma vez por minuto. No entanto, o agendador do Laravel permite que você agende tarefas para serem executadas em intervalos mais frequentes, até mesmo uma única vez por segundo:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::call(function () {
        DB::table('recent_users')->delete();
    })->everySecond();
```

 Se tarefas com duração inferior a um minuto forem definidas no seu aplicativo, o comando `schedule:run` continuará em execução até ao final do minuto corrente, em vez de ser interrompido imediatamente. Isto permite que o comando invoque todas as tarefas necessárias durante todo o minuto.

 Como as tarefas de menos de um minuto que demorem mais do que o esperado para serem executadas poderão atrasar a execução de tarefas subseqüentes de menos de um minuto, recomenda-se que todas as tarefas subseqüentes agendem processamentos em segundo plano ou gerenciamento de tarefas reais:

```php
    use App\Jobs\DeleteRecentUsers;

    Schedule::job(new DeleteRecentUsers)->everyTenSeconds();

    Schedule::command('users:delete')->everyTenSeconds()->runInBackground();
```

<a name="interrupting-sub-minute-tasks"></a>
#### Interromper tarefas de menos de um minuto

 Como o comando "schedule:run" é executado durante toda a minuto de invocação quando as tarefas são definidas para subminutos, você talvez precise interromper o comando ao implantar seu aplicativo. Caso contrário, uma instância do comando "schedule:run", que já esteja sendo executada, continuará a usar o código anteriormente implementado em sua aplicação até o final do minuto atual.

 Para interromper chamadas em andamento do comando `schedule:run`, você pode adicionar o comando `schedule:interrupt` ao script de implantação da sua aplicação. Esse comando deve ser invocado depois que a sua aplicação estiver terminada:

```shell
php artisan schedule:interrupt
```

<a name="running-the-scheduler-locally"></a>
### Executando o Agendador Localmente

 Normalmente, você não adiciona uma entrada cron de agendador à sua máquina de desenvolvimento local. Em vez disso, você pode usar o comando `schedule:work` do Artisan. Este comando será executado em primeiro plano e invocará o agendador a cada minuto até que você termine o comando:

```shell
php artisan schedule:work
```

<a name="task-output"></a>
## Saída da tarefa

 O agendador do Laravel disponibiliza vários métodos convenientes para trabalhar com o resultado gerado por tarefas programadas. Primeiro, pode enviar-se o resultado para um ficheiro através do método `sendOutputTo` para posterior análise:

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('emails:send')
             ->daily()
             ->sendOutputTo($filePath);
```

 Se você quiser anexar o resultado da saída para um arquivo específico, poderá usar o método `appendOutputTo`:

```php
    Schedule::command('emails:send')
             ->daily()
             ->appendOutputTo($filePath);
```

 Usando o método `emailOutputTo`, é possível enviar por e-mail os resultados de uma tarefa para um endereço de e-mail escolhido. Antes de enviar o resultado de uma tarefa, você deve configurar os serviços de e-mail do Laravel:

```php
    Schedule::command('report:generate')
             ->daily()
             ->sendOutputTo($filePath)
             ->emailOutputTo('taylor@example.com');
```

 Se você quiser enviar um e-mail com o resultado apenas se o comando do sistema ou da Artisan programado terminar com um código de saída diferente de zero, use o método `emailOutputOnFailure`:

```php
    Schedule::command('report:generate')
             ->daily()
             ->emailOutputOnFailure('taylor@example.com');
```

 > [AVERTISSEMENT]
 > Os métodos `emailOutputTo`, `emailOutputOnFailure`, `sendOutputTo`, e `appendOutputTo` são exclusivos dos métodos `command` e `exec`.

<a name="task-hooks"></a>
## Ganchos de tarefas

 Usando os métodos `before` e `after`, você pode especificar códigos a serem executados antes e depois da tarefa agendada ser executada.

```php
    use Illuminate\Support\Facades\Schedule;

    Schedule::command('emails:send')
             ->daily()
             ->before(function () {
                 // The task is about to execute...
             })
             ->after(function () {
                 // The task has executed...
             });
```

 Os métodos `onSuccess` e `onFailure` permitem especificar um código que será executado se o trabalho agendado for bem sucedido ou falhar. Um erro indica que o comando de sistema ou Artisan terminou com um código de saída diferente de zero:

```php
    Schedule::command('emails:send')
             ->daily()
             ->onSuccess(function () {
                 // The task succeeded...
             })
             ->onFailure(function () {
                 // The task failed...
             });
```

 Se houver saída disponível a partir de seu comando, você poderá acessá-la em seus loops `after`, `onSuccess` ou `onFailure` tipando uma instância `Illuminate\Support\Stringable` como o argumento `$output` da definição do closure do seu loop:

```php
    use Illuminate\Support\Stringable;

    Schedule::command('emails:send')
             ->daily()
             ->onSuccess(function (Stringable $output) {
                 // The task succeeded...
             })
             ->onFailure(function (Stringable $output) {
                 // The task failed...
             });
```

<a name="pinging-urls"></a>
#### Pingue URL

 Usando os métodos `pingBefore` e `thenPing`, o agendador pode fazer um ping a uma URL indicada antes ou depois de executar uma tarefa. Este método é útil para notificar um serviço externo, como [Envoyer](https://envoyer.io), que sua tarefa agendada está começando ou terminou:

```php
    Schedule::command('emails:send')
             ->daily()
             ->pingBefore($url)
             ->thenPing($url);
```

 Os métodos `pingBeforeIf` e `thenPingIf` podem ser utilizados para enviar uma requisição HTTP GET a um endereço URL só se o estado atual for verdadeiro:

```php
    Schedule::command('emails:send')
             ->daily()
             ->pingBeforeIf($condition, $url)
             ->thenPingIf($condition, $url);
```

 Os métodos `pingOnSuccess` e `pingOnFailure` podem ser usados para enviar um ping para um URL especificado somente se a tarefa for bem-sucedida ou falhar. Um fracasso indica que o comando de sistema ou do Artisan agendado terminou com código de saída diferente de zero:

```php
    Schedule::command('emails:send')
             ->daily()
             ->pingOnSuccess($successUrl)
             ->pingOnFailure($failureUrl);
```

<a name="events"></a>
## Eventos

 O Laravel dispensa uma variedade de [eventos](/docs/events) durante o processo de agendamento. Você pode [definir ouvinte](/docs/events) para qualquer um dos seguintes eventos:

|  Nome do evento |
|-------------|
|  "Illuminate\\Conso\\Eventos\\ScheduledTaskStarting" |
|  `Illuminate\\Console\\Events\\ScheduledTaskFinished` |
|  Illuminate\Console\Eventos\TarefaDeFundoProgramadaTerminada |
|  Illuminate\Console\Eventos\TarefaProgramadaIgnorada |
|  Evento de tarefa agendada falhada do Illuminate\Console |
