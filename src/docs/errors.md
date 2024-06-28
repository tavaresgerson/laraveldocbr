# Lidando com erros

<a name="introduction"></a>
## Introdução

 Quando iniciar um novo projeto Laravel, o processamento de erros e exceções já está configurado para você; no entanto, a qualquer momento, poderá utilizar o método `withExceptions` no `bootstrap/app.php` da aplicação para gerir como as exceções são reportadas e renderizadas pela sua aplicação.

 O objeto `$exceptions`, disponibilizado para o fecho `withExceptions`, é uma instância de `Illuminate\Foundation\Configuration\Exceptions` e é responsável pela gestão do tratamento de exceções na sua aplicação. Durante a documentação, aprofundaremos esta questão.

<a name="configuration"></a>
## Configuração

 A opção `debug` do seu arquivo de configuração `config/app.php` determina quantas informações sobre um erro são realmente exibidas ao usuário. Por padrão, esta opção é definida para respeitar o valor da variável ambiental `APP_DEBUG`, que é armazenada em seu arquivo `.env`.

 Durante o desenvolvimento local, você deve definir a variável de ambiente `APP_DEBUG` como `true`. **No ambiente de produção, esse valor sempre deve ser `false`. Se o valor for definido como `true` em um ambiente de produção, os usuários finais da aplicação correm o risco de terem acesso a valores de configuração confidenciais.**

<a name="handling-exceptions"></a>
## Manuseando exceções

<a name="reporting-exceptions"></a>
### Relatório de exceções

 No Laravel, o relato de exceções é utilizado para registar exceções ou enviá-las a um serviço externo [Sentry](https://github.com/getsentry/sentry-laravel) ou [Flare](https://flareapp.io). Por padrão, as exceções serão registradas com base na sua configuração de [registo](/docs/logging). No entanto, pode registar exceções da forma que pretender.

 Se você precisar reportar tipos diferentes de exceções de maneiras distintas, poderá usar o método `report` da exceção em seu aplicativo `bootstrap/app.php`, para registrar um fecho que deve ser executado quando uma exceção do tipo especificado for reportada. O Laravel definirá o tipo de exceção que o fecho irá reportar, examinando a indicação do tipo no fecho:

```php
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->report(function (InvalidOrderException $e) {
            // ...
        });
    })
```

 Quando você registrar uma callback de relatório personalizada de exceções usando o método `report`, o Laravel ainda registrará a exceção usando a configuração padrão de logs da aplicação. Se você deseja impedir que a exceção se propague para a pilha de registros padrão, você pode usar o método `stop` ao definir sua callback de relatório ou retornar `false` da callback:

```php
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->report(function (InvalidOrderException $e) {
            // ...
        })->stop();

        $exceptions->report(function (InvalidOrderException $e) {
            return false;
        });
    })
```

 > [!NOTA]
 [Exceções que devem ser comunicadas] (Razões para as quais devem ser comunicadas as exceções).

<a name="global-log-context"></a>
#### Conteúdo global do registo

 Se disponível, o Laravel adiciona automaticamente o ID do usuário atual aos mensagens de log das exceções como dados contextuais. Pode definir os seus próprios dados contextuais globais utilizando o método `context` da exceção no arquivo `bootstrap/app.php`. Esta informação será incluída nos logs das suas exceções:

```php
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->context(fn () => [
            'foo' => 'bar',
        ]);
    })
```

<a name="exception-log-context"></a>
#### Aparência do registo de exceções

 Apesar de adicionar um contexto para cada mensagem do registo poder ser útil, algumas exceções podem ter contextos exclusivos que pretende incluir nos seus logs. Definição da metodologia `context` em uma das suas aplicações permite-lhe especificar quais dados relevantes para essa exceção devem ser adicionados ao registo da mesma:

```php
    <?php

    namespace App\Exceptions;

    use Exception;

    class InvalidOrderException extends Exception
    {
        // ...

        /**
         * Get the exception's context information.
         *
         * @return array<string, mixed>
         */
        public function context(): array
        {
            return ['order_id' => $this->orderId];
        }
    }
```

<a name="the-report-helper"></a>
#### O Auxiliar de Relatório

 Às vezes, é necessário informar uma exceção, mas continuar processando o pedido atual. A função auxiliar `report` permite que você informe uma exceção rapidamente sem renderizar uma página de erro para o usuário:

```php
    public function isValid(string $value): bool
    {
        try {
            // Validate the value...
        } catch (Throwable $e) {
            report($e);

            return false;
        }
    }
```

<a name="deduplicating-reported-exceptions"></a>
#### Remover duplicações de exceções comunicadas

 Se estiver a usar a função `report` em todo o seu programa, poderá ocasionalmente informar a mesma exceção várias vezes, criando entradas duplicadas nos registos.

 Se você deseja garantir que uma única exceção seja relatada apenas uma vez, pode invocar o método de exceção `dontReportDuplicates` no arquivo `bootstrap/app.php` da sua aplicação:

```php
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->dontReportDuplicates();
    })
```

 Agora, quando a ajuda `report` é invocada com a mesma instância de uma exceção, somente a primeira chamada será relatada:

```php
$original = new RuntimeException('Whoops!');

report($original); // reported

try {
    throw $original;
} catch (Throwable $caught) {
    report($caught); // ignored
}

report($original); // ignored
report($caught); // ignored
```

<a name="exception-log-levels"></a>
### Níveis de log de exceções

 Quando as mensagens são escritas nos logs da aplicação ([logs](/docs/logging), elas são escritas em um nível de log [especificado](/docs/logging#log-levels), que indica a gravidade ou importância da mensagem sendo registrada.

 Conforme observado acima, mesmo ao registrar uma devolução de chamada de relato de exceções personalizadas usando o método `report`, o Laravel ainda irá registrar a exceção usando a configuração padrão de registro da aplicação; entretanto, uma vez que o nível do log pode influenciar os canais em que as mensagens são registradas, é possível configurar o nível de registro para determinadas exceções.

 Para realizar esta operação, pode utilizar o método de exceção `level` no arquivo do aplicativo `bootstrap/app.php`. Este método recebe o tipo da exceção como seu primeiro parâmetro e o nível de registo como segundo parâmetro:

```php
    use PDOException;
    use Psr\Log\LogLevel;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->level(PDOException::class, LogLevel::CRITICAL);
    })
```

<a name="ignoring-exceptions-by-type"></a>
### Ignorando exceções por tipo

 Ao construir o seu aplicativo, poderá haver alguns tipos de exceções que nunca pretende relatar. Para ignorar estas exceções, pode utilizar a metodologia `dontReport` na arquivo do aplicativo `bootstrap/app.php`. Quaisquer classes fornecidas a esta função não serão relatadas; contudo poderá ainda incluir lógica de renderização personalizada:

```php
    use App\Exceptions\InvalidOrderException;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->dontReport([
            InvalidOrderException::class,
        ]);
    })
```

 Internamente, o Laravel ignora alguns tipos de erros automaticamente, como as exceções resultantes de erros HTTP 404 ou respostas HTTP 419 geradas por tokens CSRF inválidos. Caso queira instruir o Laravel para parar de ignorar um determinado tipo de exceção, poderá usar o método `stopIgnoring` da classe Exception no arquivo "bootstrap/app.php" do seu aplicativo:

```php
    use Symfony\Component\HttpKernel\Exception\HttpException;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->stopIgnoring(HttpException::class);
    })
```

<a name="rendering-exceptions"></a>
### Exceções de renderização

 Por padrão, o gerenciador de exceções do Laravel converte as exceções em respostas HTTP para você. No entanto, você pode registrar um fechamento personalizado de renderização para exceções de um determinado tipo. Para isso, use a método `render` da classe Exceção em seu arquivo `bootstrap/app.php`.

 O encerramento passado para o método `render` deve retornar uma instância de `Illuminate\Http\Response`, que pode ser gerada através da função auxiliar `response`. A plataforma Laravel determinará que tipo de exceção o fecho renderiza ao analisar a indicação do tipo no encerramento:

```php
    use App\Exceptions\InvalidOrderException;
    use Illuminate\Http\Request;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (InvalidOrderException $e, Request $request) {
            return response()->view('errors.invalid-order', [], 500);
        });
    })
```

 É possível também utilizar o método `render` para redefinir o comportamento de renderização para exceções incorporadas do Laravel ou Symfony, como por exemplo, `NotFoundHttpException`. Se o fechamento fornecido ao método `render` não retornar um valor, será utilizado a renderização padrão da exceção do Laravel:

```php
    use Illuminate\Http\Request;
    use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Record not found.'
                ], 404);
            }
        });
    })
```

<a name="rendering-exceptions-as-json"></a>
#### Transformação de exceções em formato JSON

 Ao renderizar uma exceção, o Laravel determinará automaticamente se a exceção deve ser renderizada como resposta de um pedido em formato HTML ou JSON, com base no cabeçalho `Accept` do pedido. Se pretender personalizar a forma como é determinada a exibição de respostas de exceções em HTML ou JSON pelo Laravel, pode utilizar o método `shouldRenderJsonWhen`:

```php
    use Illuminate\Http\Request;
    use Throwable;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            if ($request->is('admin/*')) {
                return true;
            }

            return $request->expectsJson();
        });
    })
```

<a name="customizing-the-exception-response"></a>
#### Personalizar a resposta a exceções

 Raramente você poderá precisar personalizar toda a resposta HTTP gerada pelo gerenciador de exceções do Laravel. Para fazer isso, você pode registrar um fechamento de customização da resposta usando o método `respond`:

```php
    use Symfony\Component\HttpFoundation\Response;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (Response $response) {
            if ($response->getStatusCode() === 419) {
                return back()->with([
                    'message' => 'The page expired, please try again.',
                ]);
            }

            return $response;
        });
    })
```

<a name="renderable-exceptions"></a>
### Exceções notificáveis e executáveis

 Em vez de definir comportamentos personalizados de relatório e renderização no arquivo `bootstrap/app.php` da sua aplicação, você pode definir os métodos `report` e `render` diretamente nas exceções de sua aplicação. Quando estes métodos existirem, eles serão automaticamente acionados pelo framework:

```php
    <?php

    namespace App\Exceptions;

    use Exception;
    use Illuminate\Http\Request;
    use Illuminate\Http\Response;

    class InvalidOrderException extends Exception
    {
        /**
         * Report the exception.
         */
        public function report(): void
        {
            // ...
        }

        /**
         * Render the exception into an HTTP response.
         */
        public function render(Request $request): Response
        {
            return response(/* ... */);
        }
    }
```

 Se a sua exceção estender uma exceção que já seja executável, como uma exceção incorporada do Laravel ou Symfony, poderá devolver `false` na métrica `render` para renderizar a resposta HTTP padrão da exceção:

```php
    /**
     * Render the exception into an HTTP response.
     */
    public function render(Request $request): Response|bool
    {
        if (/** Determine if the exception needs custom rendering */) {

            return response(/* ... */);
        }

        return false;
    }
```

 Se a lógica de relatório personalizada da sua exceção estiver disponível somente quando certas condições forem atendidas, você pode precisar instruir o Laravel para que relate algumas vezes as suas exceções usando a configuração padrão do gerenciamento de exceções. Para fazer isso, você poderá retornar `false` da metodologia `report` da sua exceção:

```php
    /**
     * Report the exception.
     */
    public function report(): bool
    {
        if (/** Determine if the exception needs custom reporting */) {

            // ...

            return true;
        }

        return false;
    }
```

 > [!OBSERVAÇÃO]
 O [conteúdo do conteúdo de serviço](/docs/container).

<a name="throttling-reported-exceptions"></a>
### Reporte de exceções que limitam a largura de banda

 Se o seu aplicativo relatar um número muito grande de exceções, você pode querer limitar o número de exceções que são realmente registradas ou enviadas ao serviço externo do seu aplicativo para rastreamento de erros.

 Para selecionar um valor aleatório para a frequência das exceções, você pode usar o método de exceção `throttle` no arquivo do aplicativo `bootstrap/app.php`. O método `throttle` recebe uma função que deve retornar uma instância da classe `Lottery`:

```php
    use Illuminate\Support\Lottery;
    use Throwable;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->throttle(function (Throwable $e) {
            return Lottery::odds(1, 1000);
        });
    })
```

 É também possível amostrar condicionalmente com base no tipo da exceção. Se pretender somente amostras de instâncias de uma classe de exceção específica, poderá devolver apenas uma `Lottery` para essa classe:

```php
    use App\Exceptions\ApiMonitoringException;
    use Illuminate\Support\Lottery;
    use Throwable;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->throttle(function (Throwable $e) {
            if ($e instanceof ApiMonitoringException) {
                return Lottery::odds(1, 1000);
            }
        });
    })
```

 Você também pode controlar as exceções registradas ou enviadas para um serviço externo de rastreamento de erros ao retornar uma instância `Limit` em vez de uma `Lottery`. Isso é útil se você quiser proteger contra súbitas ondas de exceções inundando seus logs, por exemplo, quando um serviço de terceiros usado pelo seu aplicativo está down:

```php
    use Illuminate\Broadcasting\BroadcastException;
    use Illuminate\Cache\RateLimiting\Limit;
    use Throwable;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->throttle(function (Throwable $e) {
            if ($e instanceof BroadcastException) {
                return Limit::perMinute(300);
            }
        });
    })
```

 Por padrão, os limites utilizam a classe da exceção como o nome do limite de taxa. Você pode personalizar isso especificando seu próprio nome usando o método `by` no `Limit`:

```php
    use Illuminate\Broadcasting\BroadcastException;
    use Illuminate\Cache\RateLimiting\Limit;
    use Throwable;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->throttle(function (Throwable $e) {
            if ($e instanceof BroadcastException) {
                return Limit::perMinute(300)->by($e->getMessage());
            }
        });
    })
```

 É claro que você poderá retornar uma mistura de instâncias `Lottery` e `Limit` para diferentes exceções:

```php
    use App\Exceptions\ApiMonitoringException;
    use Illuminate\Broadcasting\BroadcastException;
    use Illuminate\Cache\RateLimiting\Limit;
    use Illuminate\Support\Lottery;
    use Throwable;

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->throttle(function (Throwable $e) {
            return match (true) {
                $e instanceof BroadcastException => Limit::perMinute(300),
                $e instanceof ApiMonitoringException => Lottery::odds(1, 1000),
                default => Limit::none(),
            };
        });
    })
```

<a name="http-exceptions"></a>
## Exceções de HTTP

 Existem algumas exceções que descrevem códigos de erro do servidor HTTP. Por exemplo, pode ser um erro "página não encontrada" (404), um erro "não autorizado" (401) ou até mesmo um erro 500 gerado pelo desenvolvedor. Para gerar uma resposta assim em qualquer lugar do seu aplicativo, você pode usar o `abort` auxiliar:

```php
    abort(404);
```

<a name="custom-http-error-pages"></a>
### Páginas de erro personalizadas para HTTP

 O Laravel facilita a exibição de páginas personalizadas de erro para vários códigos de estado HTTP. Por exemplo, para personalizar a página de erro para o código 404, crie um modelo de visualização `resources/views/errors/404.blade.php`. Esse modelo será exibido para todos os erros gerados por sua aplicação. Os modelos nessa pasta devem ter nomes que correspondam ao código de estado HTTP a eles relacionados. A instância da classe `Symfony\Component\HttpKernel\Exception\HttpException`, lançada pela função `abort`, será passada para o modelo como uma variável `$exception`:

```php
    <h2>{{ $exception->getMessage() }}</h2>
```

 Você pode publicar os modelos padrão de página de erro do Laravel usando o comando "Artisan" `vendor: publish`. Depois que os modelos forem publicados, você poderá personalizá-los da forma que preferir:

```shell
php artisan vendor:publish --tag=laravel-errors
```

<a name="fallback-http-error-pages"></a>
#### Páginas de erro por defeito do protocolo HTTP

 Também é possível definir uma página de erro como "reserva" para uma determinada série de códigos de estado HTTP. Essa página será renderizada se não existir uma página correspondente ao código de estado HTTP específico que ocorreu. Defina um modelo `4xx.blade.php` e um modelo `5xx.blade.php`, no diretório `resources/views/errors`, da aplicação.

 Ao definir as páginas de erro de recurso, elas não afetarão as respostas de erros `404`, `500` e `503`, uma vez que o Laravel possui páginas internas dedicadas para estes códigos. Para personalizar as páginas renderizadas para esses códigos, você deve definir uma página de erro personalizada individualmente para cada um deles.
