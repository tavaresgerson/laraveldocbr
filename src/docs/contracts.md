# Contratos

<a name="introduction"></a>
## Introdução

 Os "contratos" do Laravel são um conjunto de interfaces que definem os principais serviços oferecidos pelo framework. Por exemplo, um contrato `Illuminate\Contracts\Queue\Queue` define os métodos necessários para o agendamento de tarefas em filas, enquanto o contrato `Illuminate\Contracts\Mail\Mailer` define os métodos necessários para envio de e-mail.

 Cada contrato tem uma correspondente implementação fornecida pela estrutura. Por exemplo, o Laravel oferece uma implementação de fila com vários drivers e uma implementação do mailer que é alimentada pelo [Gerenciador de email do Symfony](https://symfony.com/doc/current/mailer.html).

 Todos os contratos do Laravel estão no [seu próprio repositório GitHub](https://github.com/illuminate/contracts). Isso fornece um ponto de referência rápido para todos os contratos disponíveis, bem como um único pacote desacoplado que pode ser utilizado ao criar pacotes que interagem com serviços do Laravel.

<a name="contracts-vs-facades"></a>
### Contratos versus fachadas

 Os [Facade's](/docs/facades) e as funções de auxílio do Laravel fornecem uma forma simples de utilizar os serviços do Laravel sem a necessidade de apontar tipos e resolver contratos para fora do container de serviço. Na maioria dos casos, cada Facade tem um contrato equivalente.

 Ao contrário do que ocorre com as facadas, que não exigem que você os inclua no construtor de sua classe, os contratos permitem que você defina dependências explícitas para suas classes. Alguns desenvolvedores preferem definir essas dependências de maneira explícita e, portanto, preferem usar contratos; outros consideram a facilidade das facadas mais conveniente. **Em geral, a maioria dos aplicativos pode usar facilidades sem problemas durante o desenvolvimento**

<a name="when-to-use-contracts"></a>
## Quando usar contratos

 A decisão de usar contratos ou facadas dependerá do seu gosto pessoal e dos gostos da sua equipa de desenvolvimento. Tanto os contratos como as facadas podem ser utilizados para criar aplicações Laravel robustas e bem testadas. Os contratos e facadas não são mutuamente exclusivos. Algumas partes das suas aplicações poderão usar facadas enquanto outras dependem de contratos. Desde que mantenham as responsabilidades da sua classe focalizadas, irá notar poucas diferenças práticas entre a utilização de contratos e facadas.

 Em geral, a maioria das aplicações podem usar facade sem problemas durante o desenvolvimento. Se estiver a construir um pacote que se integra com vários frameworks PHP poderá utilizar o pacote `illuminate/contracts` para definir a sua integração com os serviços de Laravel, não tendo necessidade de requerer as implementações concretas do Laravel no ficheiro `composer.json` do seu pacote.

<a name="how-to-use-contracts"></a>
## Como usar os contratos

 Então, como você obtém uma implementação de um contrato? Na verdade, é bem simples.

 Muitos tipos de classes no Laravel são resolvidos pelo [conjunto de serviços](/docs/container), incluindo controladores, escutas de eventos, middlewares e até tarefas agendadas. Para obter uma implementação de um contrato, você pode simplesmente "dar pistas" da interface no construtor da classe que será resolvida.

 Por exemplo, veja este evento de escuta:

```php
    <?php

    namespace App\Listeners;

    use App\Events\OrderWasPlaced;
    use App\Models\User;
    use Illuminate\Contracts\Redis\Factory;

    class CacheOrderInformation
    {
        /**
         * Create a new event handler instance.
         */
        public function __construct(
            protected Factory $redis,
        ) {}

        /**
         * Handle the event.
         */
        public function handle(OrderWasPlaced $event): void
        {
            // ...
        }
    }
```

 Quando o event listener for resolvido, o contêiner de serviços irá ler as indicações de tipo no construtor da classe e injectar o valor apropriado. Para saber mais sobre como registrar elementos no contêiner de serviços, confira sua documentação (na seção /docs/container).

<a name="contract-reference"></a>
## Referência do contrato

 Esta tabela é uma referência rápida para todos os contratos de Laravel e suas equivalentes facade:

|  Contrato |  Referências Facade |
|--------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|
|  [Illuminate\Contracts\Auth\Access\Authorizable](https://github.com/illuminate/contracts/blob/Auth/Access/Authorizable.php) |  &nbsp; |
|  [Illuminate\Contracts\Auth\Access\Gate](https://github.com/illuminate/contracts/blob/Auth/Access/Gate.php) |  "Portão" |
|  [Illuminate\Contracts\Auth\Authenticatable](https://github.com/illuminate/contracts/blob/Auth/Authenticatable.php) |  &nbsp; |
|  [Illuminate\Contracts\Auth\CanResetPassword](https://github.com/illuminate/contracts/blob/Auth/CanResetPassword.php) |  &nbsp; |
|  [Illuminate\Contracts\Auth\Factory](https://github.com/illuminate/contracts/blob/Auth/Factory.php) |  ``Auth'' |
|  [Illuminate\Contracts\Auth\Guard](https://github.com/illuminate/contracts/blob/Auth/Guard.php) |  `Auth::guard()` |
|  [Illuminate\Contracts\Auth\PasswordBroker](https://github.com/illuminate/contracts/blob/Auth/PasswordBroker.php) |  `senha`::`corretor (a) `(obrigatório)` |
|  [Illuminate\Contracts\Auth\PasswordBrokerFactory](https:/ /github.com/ illuminate/contracts/blob/{{ version }}/Auth/PasswordBrokerFactory.php) |  `` Senha`` |
|  [Illuminate\Contracts\Auth\StatefulGuard](https:/github.com/illuminate/contracts/blob/Auth/StatefulGuard.php) |  Nenhum |
|  [Illuminate\Contracts\Auth\SupportsBasicAuth](https://github.com/illuminate/contracts/blob/Auth/SupportsBasicAuth.php) |  |
|  [Illuminate\Contracts\Auth\UserProvider](https://github.com/illuminate/contracts/blob/Auth/UserProvider.php) |  &nbsp; |
|  [Illuminate\Contracts\Bus\Dispatcher](https:/github.com/illuminate/contracts/blob/Bus/Dispatcher.php) |  "Autocarro" |
|  [Illuminate\Contracts\Bus\QueueingDispatcher](https://github.com/illuminate/contracts/blob/Bus/QueueingDispatcher.php) |  `Bus::dispatchToQueue()` |
|  [Illuminate\Contracts\Broadcasting\Factory](https://github.com/illuminate/contracts/blob/Broadcasting/Factory.php) |  `Difusão` |
|  [Illuminate\Contracts\Broadcasting\Broadcaster](https:/ /github.com/illuminate/contracts/blob/Broadcasting/Broadcaster.php) |  `Broadcast::connection()` |
|  [Illuminate\\Contracts\\Broadcasting\\ShouldBroadcast](https://github.com/illuminate/contracts/blob/Broadcasting/ShouldBroadcast.php) |  &nbsp; |
|  [Illuminate\Contracts\Broadcasting\ShouldBroadcastNow](https://github.com/illuminate/contracts/blob/Broadcasting/ShouldBroadcastNow.php) |  &nbsp; |
|  [Illuminate\Contracts\Cache\Factory](https:/github.com/illuminate/contracts/blob/Cache/Factory.php) |  `Arquivo de cache` |
|  [Illuminate\Contracts\Cache\Lock](https://github.com/illuminate/contracts/blob/Cache/Lock.php) |  |
|  [Illuminate\Contracts\Cache\LockProvider](https://github.com/illuminate/contracts/blob/Cache/LockProvider.php) |  E&nbsp; |
|  [Illuminate\Contracts\Cache\Repository](https://github.com/illuminate/contracts/blob/Cache/Repository.php) |  `Cache::driver()` |
|  [Illuminate\Contracts\Cache\Store](https://github.com/illuminate/contracts/blob/Cache/Store.php) |  &nbsp; |
|  [Illuminate\Contracts\Config\Repository](https://github.com/illuminate/contracts/blob/Config/Repository.php) |  ``Configurações'' |
|  [Illuminate\Contracts\Console\Application](https://github.com/illuminate/contracts/blob/Console/Application.php) |  &nbsp; |
|  [Illuminate\Contracts\Console\Kernel](https://github.com/illuminate/contracts/blob/Console/Kernel.php) |  "Artesão" |
|  [Illuminate\Contracts\Container\Container](https://github.com/illuminate/contracts/blob/Container/Container.php) |  "Aplicativo" |
|  [Illuminate\Contracts\Cookie\Factory](https://github.com/illuminate/contracts/blob/Cookie/Factory.php) |  "Cookie" |
|  [Illuminate\Contracts\Cookie\QueueingFactory](https:/github.com/illuminate/contracts/blob/Cookie/QueueingFactory.php) |  `Cookie::queue()` |
|  [Illuminate\\Contracts\\Database\\ModelIdentifier](https://github.com/illuminate/contracts/blob/Database/ModelIdentifier.php) |  &nbsp; |
|  [Illuminate\Contracts\Debug\ExceptionHandler](https://github.com/illuminate/contracts/blob/Debug/ExceptionHandler.php) |  |
|  [Illuminate\Contracts\Encryption\Encrypter](https://github.com/illuminate/contracts/blob/Encryption/Encrypter.php) |  ``Criptografia'' |
|  [Illuminate\Contracts\Events\Dispatcher](https://github.com/illuminate/contracts/blob/Events/Dispatcher.php) |  "Evento" |
|  [Illuminate\Contratos\Arquivos\Nuvem](https://github.com/illuminate/contratos/blob/{{versão}}/Arquivos/Nuvem.php) |  `Armazenamento em nuvem():` |
|  [Illuminate\\Contracts\\Filesystem\\Factory](https://github.com/illuminate/contracts/blob/Filesystem/Factory.php) |  `Armazenamento` |
|  [Illuminate\Contracts\Filesystem\Filesystem] (https:/ /github.com/illuminate/contracts/blob/Filesystem/Filesystem.php) |  `Armazenamento::disk()` |
|  [Illuminate\Contracts\Foundation\Application](https://github.com/illuminate/contracts/blob/Foundation/Application.php) |  "Aplicativo" |
|  [Illuminate\Contracts\Hashing\Hasher](https://github.com/illuminate/contracts/blob/Hashing/Hasher.php) |  ``Hash'' |
|  [Illuminate\\Contracts\\Http\\Kernel](https://github.com/illuminate/contracts/blob/Http/Kernel.php) |  &nbsp; |
|  [Illuminate\Contracts\Mail\MailQueue](https://github.com/illuminate/contracts/blob/Mail/MailQueue.php) |  `Mail: queue ()` |
|  [Illuminate\Contracts\Mail\Mailable](https://github.com/illuminate/contracts/blob/Mail/Mailable.php) |  &nbsp; |
|  [Illuminate\Contracts\Mail\Mailer](https://github.com/illuminate/contracts/blob/Mail/Mailer.php) |  "Mensagem" |
|  [Illuminate\Contracts\Notifications\Dispatcher](https://github.com/illuminate/contracts/blob/Notifications/Dispatcher.php) |  “Notificação” |
|  [Illuminate\Contracts\Notificações\Fábrica](https://github.com/illuminate/contracts/blob/Notificações/Factory.php) |  `Notificação` |
|  [Illuminate\Contracts\Pagination\LengthAwarePaginator](https://github.com/illuminate/contracts/blob/Pagination/LengthAwarePaginator.php) |  &nbsp; |
|  [Illuminate\Contracts\Pagination\Paginator](https://github.com/illuminate/contracts/blob/Pagination/Paginator.php) |  &nbsp; |
|  [Illuminate\Contracts\Pipeline\Hub](https://github.com/illuminate/contracts/blob/Pipeline/Hub.php) |  &nbsp; |
|  [Illuminate\Contracts\Pipeline\Pipeline](https:/ /github.com/illuminate/contracts/blob/Pipeline/Pipeline.php) |  ``Transportadoras aéreas``, |
|  [Illuminate\Contracts\Queue\EntityResolver](https://github.com/illuminate/contracts/blob/Queue/EntityResolver.php) |  &nbsp; |
|  [Illuminate\Contracts\Queue\Factory](https://github.com/illuminate/contracts/blob/Queue/Factory.php) |  Fila |
|  [Illuminate\Contracts\Queue\Job](https://github.com/illuminate/contracts/blob/Queue/Job.php) |  |
|  [Illuminate\Contracts\Queue\Monitor](https://github.com/illuminate/contracts/blob/Queue/Monitor.php) |  "Fila" |
|  [Illuminate\Contracts\Queue\Queue](https://github.com/illuminate/contracts/blob/Queue/Queue.php) |  `Queue::connection()` |
|  [Illuminate\Contracts\Queue\QueueableCollection](https://github.com/illuminate/contracts/blob/Queue/QueueableCollection.php) |  E aí? |
|  [Illuminate\\Contracts\\Queue\\QueueableEntity](https://github.com/illuminate/contracts/blob/Queue/QueueableEntity.php) |  E&nbsp; |
|  [Illuminate\\Contracts\\Queue\\ShouldQueue](https://github.com/illuminate/contracts/blob/Queue/ShouldQueue.php) |  e |
|  [Illuminate\Contracts\Redis\Factory](https://github.com/illuminate/contracts/blob/Redis/Factory.php) |  `Redis` |
|  [Illuminate\Contracts\Routing\BindingRegistrar](https://github.com/illuminate/contracts/blob/Routing/BindingRegistrar.php) |  "Percurso" |
|  [Illuminate\Contracts\Routing\Registrar](https://github.com/illuminate/contracts/blob/Routing/Registrar.php) |  "Itinerário" |
|  [Illuminate\Contracts\Routing\ResponseFactory](https://github.com/illuminate/contracts/blob/Routing/ResponseFactory.php) |  ``Resposta'' |
|  [Illuminate\Contracts\Routing\UrlGenerator](https://github.com/illuminate/contracts/blob/Routing/UrlGenerator.php) |  `URL` |
|  [Illuminate\Contracts\Routing\UrlRoutable](https://github.com/illuminate/contracts/blob/Routing/UrlRoutable.php) |  |
|  [Illuminate\Contracts\Session\Session] (https://github.com/illuminate/contracts/blob/Session/Session.php) |  `Session::driver()` |
|  [Illuminate\Contracts\Support\Arrayable](https://github.com/illuminate/contracts/blob/Support/Arrayable.php) |  &nbsp; |
|  [Illuminate\Contracts\Support\Htmlable](https://github.com/illuminate/contracts/blob/Support/Htmlable.php) |  &nbsp; |
|  [Illuminate\Contracts\Support\Jsonable](https://github.com/illuminate/contracts/blob/Support/Jsonable.php) |  &nbsp; |
|  [Illuminate\Contracts\Support\MessageBag](https://github.com/illuminate/contracts/blob/Support/MessageBag.php) |  E aí? |
|  [Illuminate\Contracts\Support\MessageProvider](https://github.com/illuminate/contracts/blob/Support/MessageProvider.php) |  &nbsp; |
|  [Illuminate\Contracts\Support\Renderable](https:/github.com/illuminate/contracts/blob/Support/Renderable.php) |  &nbsp; |
|  [Illuminate\\Contracts\\Support\\Responsável](https://github.com/illuminate/contracts/blob/Support/Responsável.php) |  &nbsp; |
|  [Illuminate\Contracts\Translation\Loader](https://github.com/illuminate/contracts/blob/Translation/Loader.php) |  &nbsp; |
|  [Illuminate\Contracts\Translation\Translator](https://github.com/illuminate/contracts/blob/Translation/Translator.php) |  `Idioma` |
|  [Illuminate\Contracts\Validation\Factory](https://github.com/illuminate/contracts/blob/Validation/Factory.php) |  Validador |
|  [Illuminate\Contracts\Validation\ImplicitRule](https://github.com/illuminate/contracts/blob/Validation/ImplicitRule.php) |  &nbsp; |
|  [Illuminate\Contracts\Validation\Rule](https://github.com/illuminate/contracts/blob/Validation/Rule.php) |  &nbsp; |
|  [Illuminate\Contracts\Validation\ValidatesWhenResolved](https://github.com/illuminate/contracts/blob/Validation/ValidatesWhenResolved.php) |  |
|  [Illuminate\Contracts\Validation\Validator](https://github.com/illuminate/contracts/blob/Validation/Validator.php) |  `Validator::make()` |
|  [Illuminate\Contracts\View\Engine](https://github.com/illuminate/contracts/blob/View/Engine.php) |  E&nbsp; |
|  [Illuminate\Contracts\View\Factory](https://github.com/illuminate/contracts/blob/View/Factory.php) |  `Exibir` |
|  [Illuminate\Contracts\View\View](https://github.com/illuminate/contracts/blob/View/View.php) |  `View::make()` |
