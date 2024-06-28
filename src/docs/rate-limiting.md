# Limitação de taxas

<a name="introduction"></a>
## Introdução

 O Laravel inclui uma abordagem simples de limitação do número de solicitações que, em conjunto com o [cache] da sua aplicação, fornece um método fácil para limitar as ações durante um período especificado.

 > [!AVISO]
 [Documentação de middleware de limitação de velocidade] (routing#rate-limiting).

<a name="cache-configuration"></a>
### Configuração do cache

 Normalmente, o limitador de taxa utiliza seu cache de aplicativo por padrão definido pela chave `default` no arquivo de configuração do cache da sua aplicação. No entanto, você pode especificar qual driver de cache o limitador de taxa deve usar, definindo a chave `limiter` no arquivo de configuração do cache da sua aplicação:

```php
    'default' => env('CACHE_STORE', 'database'),

    'limiter' => 'redis',
```

<a name="basic-usage"></a>
## Uso Básico

 A face `Illuminate\Support\Facades\RateLimiter` permite interagir com o limitador de velocidade. O método mais simples oferecido pelo limitador é o método `attempt`, que limita a velocidade de um determinado callback por um número específico de segundos.

 O método `attempt` retorna `false` quando o callback não tem mais tentativas disponíveis; de outro modo, o método `attempt` irá retornar o resultado do callback ou `true`. O primeiro argumento aceito pelo método `attempt` é uma "chave" para limitador de velocidade, que pode ser qualquer string escolhida pela sua aplicação e representa a ação com limite de velocidade:

```php
    use Illuminate\Support\Facades\RateLimiter;

    $executed = RateLimiter::attempt(
        'send-message:'.$user->id,
        $perMinute = 5,
        function() {
            // Send message...
        }
    );

    if (! $executed) {
      return 'Too many messages sent!';
    }
```

 Se necessário, pode fornecer um quarto argumento ao método `attempt`, que é a "taxa de degradação" ou o número de segundos até os atempados disponíveis serem reiniciados. Por exemplo, pode modificar o exemplo acima para permitir cinco tentativas a cada dois minutos:

```php
    $executed = RateLimiter::attempt(
        'send-message:'.$user->id,
        $perTwoMinutes = 5,
        function() {
            // Send message...
        },
        $decayRate = 120,
    );
```

<a name="manually-incrementing-attempts"></a>
### Incrementando as tentativas manualmente

 Se você quiser interagir manualmente com o limitador de taxa, existem vários outros métodos disponíveis. Por exemplo, é possível invocar o método `tooManyAttempts` para determinar se uma determinada chave do limitador de taxa atingiu seu número máximo de tentativas permitidas por minuto:

```php
    use Illuminate\Support\Facades\RateLimiter;

    if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
        return 'Too many attempts!';
    }

    RateLimiter::increment('send-message:'.$user->id);

    // Send message...
```

 Como alternativa, você pode usar o método `remaining` para recuperar o número de tentativas restantes em uma determinada chave. Se houver mais tentativas possíveis para a chave, você poderá invocar o método `increment` para incrementar o número total de tentativas:

```php
    use Illuminate\Support\Facades\RateLimiter;

    if (RateLimiter::remaining('send-message:'.$user->id, $perMinute = 5)) {
        RateLimiter::increment('send-message:'.$user->id);

        // Send message...
    }
```

 Se você desejar incrementar o valor de uma chave específica do limitador de taxa em mais que um, poderá fornecer a quantia desejada ao método `increment`:

```php
    RateLimiter::increment('send-message:'.$user->id, amount: 5);
```

<a name="determining-limiter-availability"></a>
#### Determinar a disponibilidade de limitadores

 Quando um código de chave não tem mais tentativas disponíveis, o método `availableIn` retorna o número de segundos que restam até as próximas tentativas estarão disponíveis:

```php
    use Illuminate\Support\Facades\RateLimiter;

    if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
        $seconds = RateLimiter::availableIn('send-message:'.$user->id);

        return 'You may try again in '.$seconds.' seconds.';
    }

    RateLimiter::increment('send-message:'.$user->id);

    // Send message...
```

<a name="clearing-attempts"></a>
### Tentativas de compensação

 Você pode redefinir o número de tentativas para uma determinada chave do limite máximo usando o método `clear`. Por exemplo, você pode redefinir o número de tentativas quando um determinado mensagem é lida pelo receptor:

```php
    use App\Models\Message;
    use Illuminate\Support\Facades\RateLimiter;

    /**
     * Mark the message as read.
     */
    public function read(Message $message): Message
    {
        $message->markAsRead();

        RateLimiter::clear('send-message:'.$message->user_id);

        return $message;
    }
```
