# Contratos

<a name="introduction"></a>
## Introdução

Os "contratos" do Laravel são um conjunto de interfaces que definem os principais serviços oferecidos pelo framework. Por exemplo, um contrato `Illuminate\Contracts\Queue\Queue` define os métodos necessários para o agendamento de tarefas em filas, enquanto o contrato `Illuminate\Contracts\Mail\Mailer` define os métodos necessários para envio de e-mail.

Cada contrato tem uma correspondente implementação fornecida pela estrutura. Por exemplo, o Laravel oferece uma implementação de fila com vários drivers e uma implementação do mailer que é alimentada pelo [Gerenciador de email do Symfony](https://symfony.com/doc/current/mailer.html).

Todos os contratos do Laravel estão no [seu próprio repositório GitHub](https://github.com/illuminate/contracts). Isso fornece um ponto de referência rápido para todos os contratos disponíveis, bem como um único pacote desacoplado que pode ser utilizado ao criar pacotes que interagem com serviços do Laravel.

<a name="contracts-vs-facades"></a>
### Contratos versus facades

As [Facades](/docs/facades) e as funções de auxílio do Laravel fornecem uma forma simples de utilizar os serviços do Laravel sem a necessidade de apontar tipos e resolver contratos para fora do container de serviço. Na maioria dos casos, cada Facade tem um contrato equivalente.

Ao contrário do que ocorre com as facades, que não exigem que você os inclua no construtor de sua classe, os contratos permitem que você defina dependências explícitas para suas classes. Alguns desenvolvedores preferem definir essas dependências de maneira explícita e, portanto, preferem usar contratos; outros consideram a facilidade das facades mais conveniente. **Em geral, a maioria dos aplicativos pode usar facades sem problemas durante o desenvolvimento**

<a name="when-to-use-contracts"></a>
## Quando usar contratos

A decisão de usar contratos ou facades dependerá do seu gosto pessoal e dos gostos da sua equipe de desenvolvimento. Tanto os contratos como as facades podem ser utilizadas para criar aplicações Laravel robustas e bem testadas. Os contratos e facades não são mutuamente exclusivos. Algumas partes das suas aplicações poderão usar facades enquanto outras dependem de contratos. Desde que mantenham as responsabilidades da sua classe focadas, irá notar poucas diferenças práticas entre a utilização de contratos e facades.

Em geral, a maioria das aplicações podem usar facade sem problemas durante o desenvolvimento. Se você estiver construindo um pacote que se integra com vários frameworks PHP poderá utilizar o pacote `illuminate/contracts` para definir a sua integração com os serviços de Laravel, não tendo necessidade de requerer as implementações concretas do Laravel no ficheiro `composer.json` do seu pacote.

<a name="how-to-use-contracts"></a>
## Como usar os contratos

Então, como você obtém uma implementação de um contrato? Na verdade, é bem simples.

Muitos tipos de classes no Laravel são resolvidos pelo [conjunto de serviços](/docs/container), incluindo controladores, ouvintes de eventos, middlewares e até tarefas agendadas. Para obter uma implementação de um contrato, você pode simplesmente "dar pistas" da interface no construtor da classe que será resolvida.

Por exemplo, veja este ouvinte de evento:

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderWasPlaced;
    use App\Models\User;
    use Illuminate\Contracts\Redis\Factory;

    class CacheOrderInformation
    {
        /**
         * Crie uma nova instância do manipulador de eventos.
         */
        public function __construct(
            protected Factory $redis,
        ) {}

        /**
         * Lidar com o evento.
         */
        public function handle(OrderWasPlaced $event): void
        {
            // ...
        }
    }
```

Quando o ouvinte de eventos for resolvido, o contêiner de serviços irá ler as indicações de tipo no construtor da classe e injectar o valor apropriado. Para saber mais sobre como registrar elementos no contêiner de serviços, confira a documentação [na seção container](/docs/container).

<a name="contract-reference"></a>
## Referência do contrato

Esta tabela é uma referência rápida para todos os contratos de Laravel e suas equivalentes facade:

|  Contrato                                                                                                                                              | Referência da Facade      |
|--------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|
| [Illuminate\Contracts\Auth\Access\Authorizable](https://github.com/illuminate/contracts/blob/{{version}}/Auth/Access/Authorizable.php)                 |  &nbsp;                   |
| [Illuminate\Contracts\Auth\Access\Gate](https://github.com/illuminate/contracts/blob/{{version}}/Auth/Access/Gate.php)                                 | `Gate`                    |
| [Illuminate\Contracts\Auth\Authenticatable](https://github.com/illuminate/contracts/blob/{{version}}/Auth/Authenticatable.php)                         |  &nbsp;                   |
| [Illuminate\Contracts\Auth\CanResetPassword](https://github.com/illuminate/contracts/blob/{{version}}/Auth/CanResetPassword.php)                       | &nbsp;                    |
| [Illuminate\Contracts\Auth\Factory](https://github.com/illuminate/contracts/blob/{{version}}/Auth/Factory.php)                                         | `Auth`                    |
| [Illuminate\Contracts\Auth\Guard](https://github.com/illuminate/contracts/blob/{{version}}/Auth/Guard.php)                                             | `Auth::guard()`           |
| [Illuminate\Contracts\Auth\PasswordBroker](https://github.com/illuminate/contracts/blob/{{version}}/Auth/PasswordBroker.php)                           | `Password::broker()`      |
| [Illuminate\Contracts\Auth\PasswordBrokerFactory](https://github.com/illuminate/contracts/blob/{{version}}/Auth/PasswordBrokerFactory.php)             | `Password`                |
| [Illuminate\Contracts\Auth\StatefulGuard](https://github.com/illuminate/contracts/blob/{{version}}/Auth/StatefulGuard.php)                             | &nbsp;                    |
| [Illuminate\Contracts\Auth\SupportsBasicAuth](https://github.com/illuminate/contracts/blob/{{version}}/Auth/SupportsBasicAuth.php)                     | &nbsp;                    |
| [Illuminate\Contracts\Auth\UserProvider](https://github.com/illuminate/contracts/blob/{{version}}/Auth/UserProvider.php)                               | &nbsp;                    |
| [Illuminate\Contracts\Bus\Dispatcher](https://github.com/illuminate/contracts/blob/{{version}}/Bus/Dispatcher.php)                                     | `Bus`                     |
| [Illuminate\Contracts\Bus\QueueingDispatcher](https://github.com/illuminate/contracts/blob/{{version}}/Bus/QueueingDispatcher.php)                     | `Bus::dispatchToQueue()`  |
| [Illuminate\Contracts\Broadcasting\Factory](https://github.com/illuminate/contracts/blob/{{version}}/Broadcasting/Factory.php)                         | `Broadcast`               |
| [Illuminate\Contracts\Broadcasting\Broadcaster](https://github.com/illuminate/contracts/blob/{{version}}/Broadcasting/Broadcaster.php)                 | `Broadcast::connection()` |
| [Illuminate\Contracts\Broadcasting\ShouldBroadcast](https://github.com/illuminate/contracts/blob/{{version}}/Broadcasting/ShouldBroadcast.php)         | &nbsp;                    |
| [Illuminate\Contracts\Broadcasting\ShouldBroadcastNow](https://github.com/illuminate/contracts/blob/{{version}}/Broadcasting/ShouldBroadcastNow.php)   | &nbsp;                    |
| [Illuminate\Contracts\Cache\Factory](https://github.com/illuminate/contracts/blob/{{version}}/Cache/Factory.php)                                       | `Cache`                   |
| [Illuminate\Contracts\Cache\Lock](https://github.com/illuminate/contracts/blob/{{version}}/Cache/Lock.php)                                             | &nbsp;                    |
| [Illuminate\Contracts\Cache\LockProvider](https://github.com/illuminate/contracts/blob/{{version}}/Cache/LockProvider.php)                             | &nbsp;                    |
| [Illuminate\Contracts\Cache\Repository](https://github.com/illuminate/contracts/blob/{{version}}/Cache/Repository.php)                                 | `Cache::driver()`         |
| [Illuminate\Contracts\Cache\Store](https://github.com/illuminate/contracts/blob/{{version}}/Cache/Store.php)                                           | &nbsp;                    |
| [Illuminate\Contracts\Config\Repository](https://github.com/illuminate/contracts/blob/{{version}}/Config/Repository.php)                               | `Config`                  |
| [Illuminate\Contracts\Console\Application](https://github.com/illuminate/contracts/blob/{{version}}/Console/Application.php)                           | &nbsp;                    |
| [Illuminate\Contracts\Console\Kernel](https://github.com/illuminate/contracts/blob/{{version}}/Console/Kernel.php)                                     | `Artisan`                 |
| [Illuminate\Contracts\Container\Container](https://github.com/illuminate/contracts/blob/{{version}}/Container/Container.php)                           | `App`                     |
| [Illuminate\Contracts\Cookie\Factory](https://github.com/illuminate/contracts/blob/{{version}}/Cookie/Factory.php)                                     | `Cookie`                  |
| [Illuminate\Contracts\Cookie\QueueingFactory](https://github.com/illuminate/contracts/blob/{{version}}/Cookie/QueueingFactory.php)                     | `Cookie::queue()`         |
| [Illuminate\Contracts\Database\ModelIdentifier](https://github.com/illuminate/contracts/blob/{{version}}/Database/ModelIdentifier.php)                 | &nbsp;                    |
| [Illuminate\Contracts\Debug\ExceptionHandler](https://github.com/illuminate/contracts/blob/{{version}}/Debug/ExceptionHandler.php)                     | &nbsp;                    |
| [Illuminate\Contracts\Encryption\Encrypter](https://github.com/illuminate/contracts/blob/{{version}}/Encryption/Encrypter.php)                         | `Crypt`                   |
| [Illuminate\Contracts\Events\Dispatcher](https://github.com/illuminate/contracts/blob/{{version}}/Events/Dispatcher.php)                               | `Event`                   |
| [Illuminate\Contracts\Filesystem\Cloud](https://github.com/illuminate/contracts/blob/{{version}}/Filesystem/Cloud.php)                                 | `Storage::cloud()`        |
| [Illuminate\Contracts\Filesystem\Factory](https://github.com/illuminate/contracts/blob/{{version}}/Filesystem/Factory.php)                             | `Storage`                 |
| [Illuminate\Contracts\Filesystem\Filesystem](https://github.com/illuminate/contracts/blob/{{version}}/Filesystem/Filesystem.php)                       | `Storage::disk()`         |
| [Illuminate\Contracts\Foundation\Application](https://github.com/illuminate/contracts/blob/{{version}}/Foundation/Application.php)                     | `App`                     |
| [Illuminate\Contracts\Hashing\Hasher](https://github.com/illuminate/contracts/blob/{{version}}/Hashing/Hasher.php)                                     | `Hash`                    |
| [Illuminate\Contracts\Http\Kernel](https://github.com/illuminate/contracts/blob/{{version}}/Http/Kernel.php)                                           | &nbsp;                    |
| [Illuminate\Contracts\Mail\MailQueue](https://github.com/illuminate/contracts/blob/{{version}}/Mail/MailQueue.php)                                     | `Mail::queue()`           |
| [Illuminate\Contracts\Mail\Mailable](https://github.com/illuminate/contracts/blob/{{version}}/Mail/Mailable.php)                                       | &nbsp;                    |
| [Illuminate\Contracts\Mail\Mailer](https://github.com/illuminate/contracts/blob/{{version}}/Mail/Mailer.php)                                           | `Mail`                    |
| [Illuminate\Contracts\Notifications\Dispatcher](https://github.com/illuminate/contracts/blob/{{version}}/Notifications/Dispatcher.php)                 | `Notification`            |
| [Illuminate\Contracts\Notifications\Factory](https://github.com/illuminate/contracts/blob/{{version}}/Notifications/Factory.php)                       | `Notification`            |
| [Illuminate\Contracts\Pagination\LengthAwarePaginator](https://github.com/illuminate/contracts/blob/{{version}}/Pagination/LengthAwarePaginator.php)   | &nbsp;                    |
| [Illuminate\Contracts\Pagination\Paginator](https://github.com/illuminate/contracts/blob/{{version}}/Pagination/Paginator.php)                         | &nbsp;                    |
| [Illuminate\Contracts\Pipeline\Hub](https://github.com/illuminate/contracts/blob/{{version}}/Pipeline/Hub.php)                                         | &nbsp;                    |
| [Illuminate\Contracts\Pipeline\Pipeline](https://github.com/illuminate/contracts/blob/{{version}}/Pipeline/Pipeline.php)                               | `Pipeline`;               |
| [Illuminate\Contracts\Queue\EntityResolver](https://github.com/illuminate/contracts/blob/{{version}}/Queue/EntityResolver.php)                         | &nbsp;                    |
| [Illuminate\Contracts\Queue\Factory](https://github.com/illuminate/contracts/blob/{{version}}/Queue/Factory.php)                                       | `Queue`                   |
| [Illuminate\Contracts\Queue\Job](https://github.com/illuminate/contracts/blob/{{version}}/Queue/Job.php)                                               | &nbsp;                    |
| [Illuminate\Contracts\Queue\Monitor](https://github.com/illuminate/contracts/blob/{{version}}/Queue/Monitor.php)                                       | `Queue`                   |
| [Illuminate\Contracts\Queue\Queue](https://github.com/illuminate/contracts/blob/{{version}}/Queue/Queue.php)                                           | `Queue::connection()`     |
| [Illuminate\Contracts\Queue\QueueableCollection](https://github.com/illuminate/contracts/blob/{{version}}/Queue/QueueableCollection.php)               | &nbsp;                    |
| [Illuminate\Contracts\Queue\QueueableEntity](https://github.com/illuminate/contracts/blob/{{version}}/Queue/QueueableEntity.php)                       | &nbsp;                    |
| [Illuminate\Contracts\Queue\ShouldQueue](https://github.com/illuminate/contracts/blob/{{version}}/Queue/ShouldQueue.php)                               | &nbsp;                    |
| [Illuminate\Contracts\Redis\Factory](https://github.com/illuminate/contracts/blob/{{version}}/Redis/Factory.php)                                       | `Redis`                   |
| [Illuminate\Contracts\Routing\BindingRegistrar](https://github.com/illuminate/contracts/blob/{{version}}/Routing/BindingRegistrar.php)                 | `Route`                   |
| [Illuminate\Contracts\Routing\Registrar](https://github.com/illuminate/contracts/blob/{{version}}/Routing/Registrar.php)                               | `Route`                   |
| [Illuminate\Contracts\Routing\ResponseFactory](https://github.com/illuminate/contracts/blob/{{version}}/Routing/ResponseFactory.php)                   | `Response`                |
| [Illuminate\Contracts\Routing\UrlGenerator](https://github.com/illuminate/contracts/blob/{{version}}/Routing/UrlGenerator.php)                         | `URL`                     |
| [Illuminate\Contracts\Routing\UrlRoutable](https://github.com/illuminate/contracts/blob/{{version}}/Routing/UrlRoutable.php)                           | &nbsp;                    |
| [Illuminate\Contracts\Session\Session](https://github.com/illuminate/contracts/blob/{{version}}/Session/Session.php)                                   | `Session::driver()`       |
| [Illuminate\Contracts\Support\Arrayable](https://github.com/illuminate/contracts/blob/{{version}}/Support/Arrayable.php)                               | &nbsp;                    |
| [Illuminate\Contracts\Support\Htmlable](https://github.com/illuminate/contracts/blob/{{version}}/Support/Htmlable.php)                                 | &nbsp;                    |
| [Illuminate\Contracts\Support\Jsonable](https://github.com/illuminate/contracts/blob/{{version}}/Support/Jsonable.php)                                 | &nbsp;                    |
| [Illuminate\Contracts\Support\MessageBag](https://github.com/illuminate/contracts/blob/{{version}}/Support/MessageBag.php)                             | &nbsp;                    |
| [Illuminate\Contracts\Support\MessageProvider](https://github.com/illuminate/contracts/blob/{{version}}/Support/MessageProvider.php)                   | &nbsp;                    |
| [Illuminate\Contracts\Support\Renderable](https://github.com/illuminate/contracts/blob/{{version}}/Support/Renderable.php)                             | &nbsp;                    |
| [Illuminate\Contracts\Support\Responsable](https://github.com/illuminate/contracts/blob/{{version}}/Support/Responsable.php)                           | &nbsp;                    |
| [Illuminate\Contracts\Translation\Loader](https://github.com/illuminate/contracts/blob/{{version}}/Translation/Loader.php)                             | &nbsp;                    |
| [Illuminate\Contracts\Translation\Translator](https://github.com/illuminate/contracts/blob/{{version}}/Translation/Translator.php)                     | `Lang`                    |
| [Illuminate\Contracts\Validation\Factory](https://github.com/illuminate/contracts/blob/{{version}}/Validation/Factory.php)                             | `Validator`               |
| [Illuminate\Contracts\Validation\ImplicitRule](https://github.com/illuminate/contracts/blob/{{version}}/Validation/ImplicitRule.php)                   | &nbsp;                    |
| [Illuminate\Contracts\Validation\Rule](https://github.com/illuminate/contracts/blob/{{version}}/Validation/Rule.php)                                   | &nbsp;                    |
| [Illuminate\Contracts\Validation\ValidatesWhenResolved](https://github.com/illuminate/contracts/blob/{{version}}/Validation/ValidatesWhenResolved.php) | &nbsp;                    |
| [Illuminate\Contracts\Validation\Validator](https://github.com/illuminate/contracts/blob/{{version}}/Validation/Validator.php)                         | `Validator::make()`       |
| [Illuminate\Contracts\View\Engine](https://github.com/illuminate/contracts/blob/{{version}}/View/Engine.php)                                           | &nbsp;                    |
| [Illuminate\Contracts\View\Factory](https://github.com/illuminate/contracts/blob/{{version}}/View/Factory.php)                                         | `View`                    |
| [Illuminate\Contracts\View\View](https://github.com/illuminate/contracts/blob/{{version}}/View/View.php)                                               | `View::make()`            |
