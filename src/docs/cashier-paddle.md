# Laravel Cashier (Paddle)

<a name="introduction"></a>
## Introdução

 > [!AVISO]
 [Caixa Paddle 1.x](https://github.com/laravel/cashier-paddle/tree/1.x).

 [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle) fornece uma interface fácil de usar para os serviços de faturamento por assinatura do [Paddle](https://paddle.com). Ele cuida quase todo o código de cobrança por assinatura que você detesta. Além do gerenciamento básico da assinatura, Cashier também permite: troca de assinaturas, quantidades de assinaturas, pausa e cancelamento com um período de carência, dentre outros.

 Antes de iniciar a Cashier Paddle, recomendamos que você também rever os guias conceituais da Paddle e sua documentação API, disponíveis em [Conceitos guia](https://developer.paddle.com/concepts/overview) e [Documentação da API](https://developer.paddle.com/api-reference/overview).

<a name="upgrading-cashier"></a>
## Aprimorando a Caixa Registadora

 Ao atualizar para uma nova versão do Cashier, é importante que você reveja [o guia de upgrade](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md) com cuidado.

<a name="installation"></a>
## Instalação

 Primeiro, instale o pacote Cashier para Paddle usando o gerenciador de pacotes Composer:

```shell
composer require laravel/cashier-paddle
```

 Em seguida, você deve publicar os arquivos de migração do Cashier usando o comando `vendor:publish`, que é um comando do Artisan:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

 Em seguida, você deve executar as migrações de banco de dados do aplicativo. As migrações da Cashier criarão uma nova tabela `customers`. Além disso, serão criadas novas tabelas `subscriptions` e `subscription_items` para armazenar todas as assinaturas dos clientes. Por fim, será criada uma nova tabela `transactions` para armazenar todas as transações do Paddle associadas aos seus clientes:

```shell
php artisan migrate
```

 > [AVERIGEMENTO]
 [Configurando o processamento de eventos de Webhook na Caixa] (#handling-paddle-webhooks).

<a name="paddle-sandbox"></a>
### Pá de areia

 Durante o desenvolvimento local e de acolhimento, você deve [registrar uma conta Paddle Sandbox](https://sandbox-login.paddle.com/signup). Esta conta irá fornecer um ambiente embutido para teste e desenvolvimento de suas aplicações sem fazer pagamentos reais. Você pode usar os [números do cartão de teste da Paddle] (https://developer.paddle.com/concepts/payment-methods/credit-debit-card) para simular vários cenários de pagamento.

 Ao utilizar o ambiente de testes Paddle, você deve definir a variável de ambiente `PADDLE_SANDBOX` como `true` no arquivo `.env` da sua aplicação:

```ini
PADDLE_SANDBOX=true
```

 Depois que você tiver concluído o desenvolvimento de seu aplicativo, pode solicitar uma conta do vendedor do Paddle [aqui](https://paddle.com). Antes de colocar seu aplicativo em produção, o Paddle precisará aprovar o domínio do seu aplicativo.

<a name="configuration"></a>
## Configuração

<a name="billable-model"></a>
### Modelo facturável

 Antes de usar o Cashier, é necessário adicionar a trilha `Billable` à definição do modelo do usuário. Esta trilha fornece vários métodos para que você possa realizar tarefas comuns de faturamento, como criar assinaturas e atualizar informações sobre os métodos de pagamento:

```php
    use Laravel\Paddle\Billable;

    class User extends Authenticatable
    {
        use Billable;
    }
```

 Se você tiver entidades faturáveis que não sejam usuários, poderá adicionar o traço a essas classes também:

```php
    use Illuminate\Database\Eloquent\Model;
    use Laravel\Paddle\Billable;

    class Team extends Model
    {
        use Billable;
    }
```

<a name="api-keys"></a>
### Chaves da API

 Em seguida, você deve configurar suas chaves Paddle no arquivo ".env" do seu aplicativo. Você pode obter as chaves da API Paddle no painel de controle Paddle:

```ini
PADDLE_CLIENT_SIDE_TOKEN=your-paddle-client-side-token
PADDLE_API_KEY=your-paddle-api-key
PADDLE_RETAIN_KEY=your-paddle-retain-key
PADDLE_WEBHOOK_SECRET="your-paddle-webhook-secret"
PADDLE_SANDBOX=true
```

 A variável de ambiente `PADDLE_SANDBOX` deve ser definida como `true` quando você estiver usando o ambiente de sandbox do Paddle [#paddle-sandbox (em inglês)]. A variável `PADDLE_SANDBOX` deve ser definida como `false` se você estiver implantando sua aplicação em produção e estiver usando o ambiente de fornecedor ao vivo do Paddle.

 O `PADDLE_RETAIN_KEY` é opcional e só deve ser definido caso você esteja usando o Paddle com Retain.

<a name="paddle-js"></a>
### Paddle JS

Paddle relies on its own JavaScript library to initiate the Paddle checkout widget. You can load the JavaScript library by placing the `@paddleJS` Blade directive right before your application layout's closing `</head>` tag:

```blade
<head>
    ...

    @paddleJS
</head>
```

<a name="currency-configuration"></a>
### Configuração de moeda

 É possível especificar um local para ser usado ao formatar valores de dinheiro para exibição em faturas. Internamente, o Cashier utiliza a classe [NumberFormatter (formato de número) da PHP](https://www.php.net/manual/en/class.numberformatter.php) para definir o local da moeda:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

 > [!AVISO]
 > Para usar locais diferentes de "en", verifique se a extensão PHP "ext-intl" está instalada e configurada no servidor.

<a name="overriding-default-models"></a>
### Suprir Modelos Padrão

 Você pode estender os modelos usados internamente pelo Cashier definindo seu próprio modelo e estendendo o modelo de Cashier correspondente.

```php
    use Laravel\Paddle\Subscription as CashierSubscription;

    class Subscription extends CashierSubscription
    {
        // ...
    }
```

 Depois de definir seu modelo, você pode instruir o sistema de pagamento do Laravel a usar seu modelo personalizado por meio da classe `Laravel\Paddle\Cashier`. Normalmente, você deve informar o sistema de pagamento do Laravel sobre seus modelos customizados no método `boot` da classe `App\Providers\AppServiceProvider` da aplicação:

```php
    use App\Models\Cashier\Subscription;
    use App\Models\Cashier\Transaction;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Cashier::useSubscriptionModel(Subscription::class);
        Cashier::useTransactionModel(Transaction::class);
    }
```

<a name="quickstart"></a>
## Inicialização Rápida

<a name="quickstart-selling-products"></a>
### Venda de produtos

 > [!AVISO]
 [Configurar a utilização de webhooks do Paddle](#handling-paddle-webhooks).

 Oferecer faturamento de produtos e assinatura através do seu aplicativo pode ser intimidante. No entanto, graças a Cashier e [Checkout Overlay da Paddle](https://www.paddle.com/billing/checkout), você consegue facilmente criar integrações de pagamento modernas e robustas.

 Para cobrar clientes por produtos não recorrentes com um único pagamento, iremos utilizar o Cashier para cobrar os clientes com a superfície de checkout do Paddle, onde eles irão fornecer os seus dados de pagamento e confirmar a compra. Uma vez que o pagamento tenha sido feito através da superfície de checkout, o cliente será redirecionado para um URL de sucesso escolhido pelo utilizador dentro da aplicação:

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $request->user()->checkout('pri_deluxe_album')
            ->returnTo(route('dashboard'));

        return view('buy', ['checkout' => $checkout]);
    })->name('checkout');
```

 Como você pode ver no exemplo acima, utilizaremos o método fornecido por Cashier `checkout` para criar um objeto de checkout para apresentar ao cliente a "camada Paddle Checkout" para um determinado "identificador de preço". Ao usar o Paddle, os "preços" se referem aos [preços definidos para produtos específicos](https://developer.paddle.com/build/products/create-products-prices).

 Se necessário, o método `checkout` irá automaticamente criar um cliente no Paddle e vincular esse registo de clientes ao utilizador correspondente no banco de dados da sua aplicação. Após concluir a sessão de checkout, o cliente será redirecionado para uma página específica de sucesso onde poderá mostrar uma mensagem informativa ao cliente.

 Na visualização "comprar", incluiremos um botão para exibir o overlays de check-out. O componente Blade `paddle-button` está incluído no Cashier Paddle; contudo, você pode também [renderizar manualmente uma checkout de overlays](manually-rendering-an-overlay-checkout):

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy Product
</x-paddle-button>
```

<a name="providing-meta-data-to-paddle-checkout"></a>
#### Fornecimento de metadados ao Paddle Checkout

 Ao vender produtos, é comum acompanhar os pedidos concluídos e os produtos adquiridos por meio dos modelos `Cart` (Carrinho) e `Order` (Pedido), definidos pelo seu próprio aplicativo. Quando redireciona clientes para o Overlay de Checkout do Paddle para concluírem uma compra, talvez seja necessário fornecer um identificador de pedido existente para que você possa associar a compra concluída ao pedido correspondente quando o cliente voltar ao seu aplicativo.

 Para conseguir isso, você pode fornecer um conjunto de dados personalizadas para o método `checkout`. Imaginemos que uma encomenda pendente é criada no âmbito da nossa aplicação quando um utilizador começa o processo de checkout. Lembre-se de que os modelos `Cart` e `Order` neste exemplo são ilustrativos e não fornecidos pela Cashier. Você tem liberdade para implementar estes conceitos com base nas necessidades da sua aplicação:

```php    
    use App\Models\Cart;
    use App\Models\Order;
    use Illuminate\Http\Request;
    
    Route::get('/cart/{cart}/checkout', function (Request $request, Cart $cart) {
        $order = Order::create([
            'cart_id' => $cart->id,
            'price_ids' => $cart->price_ids,
            'status' => 'incomplete',
        ]);

        $checkout = $request->user()->checkout($order->price_ids)
            ->customData(['order_id' => $order->id]);

        return view('billing', ['checkout' => $checkout]);
    })->name('checkout');
```

 Como pode ver no exemplo acima, quando o utilizador inicia o processo de check-out, fornecemos todos os identificadores de preços associados do carrinho/pedido ao método `checkout`. É evidente que a sua aplicação é responsável por associar estes produtos ao "carrinho de compras" ou pedido à medida que o cliente os adiciona. Além disso, fornecemos o ID do pedido através da metodologia `customData` na Superfície de check-out Paddle.

 Obviamente, você poderá marcar a ordem como "concluída" depois que o cliente terminar o processo de checkout. Para isso, você pode usar os webhooks enviados pelo Paddle e acionados pelos eventos da Cashier para armazenar as informações das encomendas em sua base de dados.

 Para iniciar, preste atenção no evento `TransactionCompleted` transmitido pela ferramenta Cashier. Geralmente, você deve registrar o ouvinte do evento no método `boot` do `AppServiceProvider` de sua aplicação:

```php
    use App\Listeners\CompleteOrder;
    use Illuminate\Support\Facades\Event;
    use Laravel\Paddle\Events\TransactionCompleted;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(TransactionCompleted::class, CompleteOrder::class);
    }
```

 Neste exemplo, o modelo do evento de notificação 'CompleteOrder' poderá ser semelhante ao seguinte código:

```php
    namespace App\Listeners;

    use App\Models\Order;
    use Laravel\Cashier\Cashier;
    use Laravel\Cashier\Events\TransactionCompleted;

    class CompleteOrder
    {
        /**
         * Handle the incoming Cashier webhook event.
         */
        public function handle(TransactionCompleted $event): void
        {
            $orderId = $event->payload['data']['custom_data']['order_id'] ?? null;

            $order = Order::findOrFail($orderId);

            $order->update(['status' => 'completed']);
        }
    }
```

 Consulte a documentação do Paddle para mais informações sobre os dados contidos no evento [transação.completed](https://developer.paddle.com/webhooks/transactions/transaction-completed).

<a name="quickstart-selling-subscriptions"></a>
### Venda de assinaturas

 > [!NOTA]
 [Configurar o processamento de webhook no Paddle](#handling-paddle-webhooks).

 Ofertar faturamento de produtos e assinatura pelo seu aplicativo pode ser intimidador, mas, graças à [faturação da Cashier e ao Recobro Paddle](https://www.paddle.com/billing/checkout), você consegue construir facilmente integrações de pagamento modernas e robustas.

 Para aprender a vender assinaturas usando o Cashier e o Checkout Overlay da Paddle, considere um cenário simples de um serviço de assinatura com um plano básico mensal (price_basic_monthly) e anual (`price_basic_yearly`). Estes dois preços podem ser agrupados sob o produto "Basic" (`pro_basic`) em nossa área do Paddle. Além disso, nosso serviço de assinatura pode oferecer um plano Expert como `pro_expert`.

 Primeiro, descubra como um cliente pode assinar nossos serviços. Claro que você pode imaginar que o cliente poderá clicar no botão "assinar" para o plano Básico na página de preços do nosso aplicativo. Este botão irá invocar uma Paddle Checkout Overlay (Virada da Pagina de Pagamento) para seu plano escolhido. Para começar, inicie uma sessão de checkout usando o método `checkout`:

```php
    use Illuminate\Http\Request;

    Route::get('/subscribe', function (Request $request) {
        $checkout = $request->user()->checkout('price_basic_monthly')
            ->returnTo(route('dashboard'));

        return view('subscribe', ['checkout' => $checkout]);
    })->name('subscribe');
```

 Na visualização "subscribe", incluiremos um botão para exibir o Overlay do Checkout. O componente `paddle-button` Blade é incluído com Cashier Paddle; no entanto, também pode gerar manualmente um overlays de checkout:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

 Agora, quando o botão "Assinar" for clicado, o cliente poderá inserir seus dados de pagamento e iniciar seu assinatura. Para saber quando sua assinatura realmente começou (dado que alguns métodos de pagamento exigem alguns segundos para processar), você também deve [configurar o webhook do Caixa](#handling-paddle-webhooks).

 Agora que os clientes podem começar assinaturas, precisamos restringir certos trechos de nossa aplicação para que somente usuários com assinatura possam acessá-los. Claro, sempre poderemos determinar o status atual da assinatura do usuário por meio do método `subscribed` fornecido pelo traço `Billable` do Cashier:

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

 Podemos até determinar facilmente se um usuário está inscrito em um produto ou preço específico:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### Criação de uma middleware assinada

 Por conveniência, você pode criar um [middleware](/docs/middleware) que determine se o pedido está vindo de um usuário cadastrado. Depois deste middleware ser definido, você pode facilmente atribuí-lo a uma rota para impedir que os usuários não cadastrados tenham acesso à rota:

```php
    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    class Subscribed
    {
        /**
         * Handle an incoming request.
         */
        public function handle(Request $request, Closure $next): Response
        {
            if (! $request->user()?->subscribed()) {
                // Redirect user to billing page and ask them to subscribe...
                return redirect('/subscribe');
            }

            return $next($request);
        }
    }
```

 Definido o middleware, ele pode ser atribuído a uma rota:

```php
    use App\Http\Middleware\Subscribed;

    Route::get('/dashboard', function () {
        // ...
    })->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### Permitir que os Clientes gerir o seu plano de faturação

 Claro que os clientes poderão desejar mudar o seu plano de subscrição para outro produto ou "nível". No nosso exemplo acima, pretendemos permitir ao cliente mudar o seu plano de subscrição mensal para anual. Para isso precisamos implementar um botão que leve à rota abaixo:

```php
    use Illuminate\Http\Request;

    Route::put('/subscription/{price}/swap', function (Request $request, $price) {
        $user->subscription()->swap($price); // With "$price" being "price_basic_yearly" for this example.

        return redirect()->route('dashboard');
    })->name('subscription.swap');
```

 Além de trocar planos, você também precisa permitir que seus clientes cancem sua assinatura. Assim como o gerenciamento dos planos, ofereça um botão para que os usuários acessem a seguinte página:

```php
    use Illuminate\Http\Request;

    Route::put('/subscription/cancel', function (Request $request, $price) {
        $user->subscription()->cancel();

        return redirect()->route('dashboard');
    })->name('subscription.cancel');
```

 Agora o seu abono será cancelado no final do período de faturamento.

 > [!ATENÇÃO]
 > Desde que tenha configurado o processamento de webhooks do Cashier, este manterá automaticamente sincronizado os respetivos registos na base de dados da sua aplicação com a Paddle, através da análise dos webhooks recebidos. Assim, por exemplo, quando cancelar uma subscrição de um cliente através do painel de controlo da Paddle, o Cashier receberá o respetivo webhook e marcará a subscrição como "cancelada" no registo da sua aplicação.

<a name="checkout-sessions"></a>
## Sessões de check-out

 A maioria das operações para faturamento do cliente é realizada por meio de "caixas" através do [widget overlays de checkout da Paddle](https://developer.paddle.com/build/checkout/build-overlay-checkout) ou utilizando o [checkout embutido](https://developer.paddle.com/build/checkout/build-branded-inline-checkout).

 Antes de processar pagamentos no checkout usando o Paddle, você deve definir o link de pagamento [padrão](https://developer.paddle.com/build/transactions/default-payment-link#set-default-link) da sua aplicação em seu painel de configurações do checkout do Paddle.

<a name="overlay-checkout"></a>
### Verificação em cima

 Antes de exibir o widget sobreposição do carrinho de compras, você deve gerar uma sessão de pagamento usando Cashier. Uma sessão de pagamento informará ao widget de carrinho de compras a operação de faturamento que deve ser executada:

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

 O `caixeiro` inclui um componente de botão paddle [Blade component] (https://docs.dcloud.io/api/?version=2.0/#components). Você pode passar a sessão do checkout como "prop" para este componente. Então, quando o botão for clicado, o widget do checkout da Paddle será exibido:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

 Por padrão, este exibirá o widget utilizando a estética padrão do Paddle. Você pode personalizar o widget adicionando atributos suportados pelo Paddle (https://developer.paddle.com/paddlejs/html-data-attributes) ao componente como o atributo `data-theme='light'`:

```html
<x-paddle-button :url="$payLink" class="px-8 py-4" data-theme="light">
    Subscribe
</x-paddle-button>
```

 O widget de checkout do Paddle é assíncrono. Uma vez que o usuário criar uma assinatura no interior do widget, o Paddle enviará ao seu aplicativo um webhook para que você possa atualizar corretamente o estado da assinatura no banco de dados do seu aplicativo. Por isso, é importante configurar os webhooks (#configuração de webhooks) adequadamente para acomodar as alterações no estado provenientes do Paddle.

 > Atenção!
 > Depois de uma alteração no estado da subscrição, o atraso para receber a correspondente webhook é normalmente mínimo mas você deve considerar isso em sua aplicação ao ter em conta que a subscrição do seu usuário pode não estar imediatamente disponível após concluir a checkout.

<a name="manually-rendering-an-overlay-checkout"></a>
#### Exibição manual de um check-out com superposições

 Você também pode renderizar manualmente um carrinho de compras com uma cobertura sem usar os componentes internos do Laravel Blade. Para começar, gerencie a sessão do carrinho [como demonstrado nos exemplos anteriores](#carrossel-compras):

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

 Em seguida, você pode usar o Paddle.js para inicializar o checkout. Neste exemplo, criaremos um link que receberá a classe `paddle_button`. O Paddle.js detectará esta classe e exibirá o checkout com a caixa de overlays quando o link for clicado:

```blade
<?php
$items = $checkout->getItems();
$customer = $checkout->getCustomer();
$custom = $checkout->getCustomData();
?>

<a
    href='#!'
    class='paddle_button'
    data-items='{!! json_encode($items) !!}'
    @if ($customer) data-customer-id='{{ $customer->paddle_id }}' @endif
    @if ($custom) data-custom-data='{{ json_encode($custom) }}' @endif
    @if ($returnUrl = $checkout->getReturnUrl()) data-success-url='{{ $returnUrl }}' @endif
>
    Buy Product
</a>
```

<a name="inline-checkout"></a>
### Verificação Online

 Se não quiser utilizar o modelo "overlay" do carrossel de pagamento Paddle, este também disponibiliza a opção de exibição do widget inline (incorporado na página). Apesar deste método não permitir ajustar os campos HTML do carrossel, permite incorporá-lo na sua aplicação.

 Para facilitar o seu início com verificação em linha, a ferramenta de caixa inclui um componente `Blade paddle-checkout`. Para começar, você deve [gerar uma sessão de verificação](#overlay-checkout):

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

 Depois disso, você pode passar a sessão de checkout para o atributo `checkout` do componente:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" />
```

 Para ajustar a altura do componente de checkout on-line, você pode passar o atributo "height" ao componente Blade:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" height="500" />
```

 Consulte o guia do Paddle sobre Inline Checkout (https://developer.paddle.com/build/checkout/build-branded-inline-checkout) e as configurações disponíveis de checkout (https://developer.paddle.com/build/checkout/set-up-checkout-default-settings) para obter mais detalhes sobre as opções de personalização do checkout em linha.

<a name="manually-rendering-an-inline-checkout"></a>
#### Implementação manual de um carrinho de compra em linha

 Também é possível efetuar o check-out de forma manual sem recorrer a componentes Blade integrados ao Laravel. Para começar, gerencie uma sessão de check-out [como demonstrado nos exemplos anteriores](#checkout-in-line):

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

 Em seguida, você pode usar o Paddle.js para inicializar o checkout. Neste exemplo, iremos demonstrar isso usando [Alpine.js](https://github.com/alpinejs/alpine); contudo, você está livre para modificar este exemplo de acordo com sua própria pilha front-end:

```blade
<?php
$options = $checkout->options();

$options['settings']['frameTarget'] = 'paddle-checkout';
$options['settings']['frameInitialHeight'] = 366;
?>

<div class="paddle-checkout" x-data="{}" x-init="
    Paddle.Checkout.open(@json($options));
">
</div>
```

<a name="guest-checkouts"></a>
### Check-out de hóspede

 Às vezes, você pode precisar criar uma sessão de checkout para usuários que não precisem de uma conta em sua aplicação. Para fazer isso, você pode usar o método `guest`:

```php
    use Illuminate\Http\Request;
    use Laravel\Paddle\Checkout;

    Route::get('/buy', function (Request $request) {
        $checkout = Checkout::guest('pri_34567')
            ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

 Em seguida, você pode fornecer a sessão de verificação ao componente Blade [Botão Paddle (#overlay-checkout)] ou [Verificação em linha (#inline-checkout)].

<a name="price-previews"></a>
## Antevisões de preços

 O Paddle permite-lhe personalizar os preços por moeda, o que lhe permite essencialmente definir preços diferentes para países diferentes. Com o Paddle Cashier, pode recuperar todos estes preços utilizando a metodologia `previewPrices`. Esta método aceita ID de preços que você deseja recuperar:

```php
    use Laravel\Paddle\Cashier;

    $prices = Cashier::previewPrices(['pri_123', 'pri_456']);
```

 A moeda será determinada com base no endereço de protocolo de Internet do pedido; entretanto, você pode opcionalmente indicar um país específico para recuperação dos preços:

```php
    use Laravel\Paddle\Cashier;

    $prices = Cashier::previewPrices(['pri_123', 'pri_456'], ['address' => [
        'country_code' => 'BE',
        'postal_code' => '1234',
    ]]);
```

 Após recuperar os preços, você poderá exibi-los da maneira que desejar:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

 Também é possível exibir o preço do subtotal e o valor de impostos separadamente:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->subtotal() }} (+ {{ $price->tax() }} tax)</li>
    @endforeach
</ul>
```

 Para mais informações, confira a documentação da API do Paddle relativas à prévias dos preços (https://developer.paddle.com/api-reference/pricing-preview/preview-prices).

<a name="customer-price-previews"></a>
### Antevisões dos preços do cliente

 Se um usuário já for cliente e você quiser exibir os preços que se aplicam ao cliente, poderá fazer isso recuperando os preços diretamente da instância de cliente.

```php
    use App\Models\User;

    $prices = User::find(1)->previewPrices(['pri_123', 'pri_456']);
```

 Internamente, o sistema de cobrança usará o ID do cliente para recuperar os preços em sua moeda. Assim, por exemplo, um usuário morando nos Estados Unidos verá preços em dólares americanos enquanto que um usuário na Bélgica verá preços em euros. Se não houver uma correspondência de moedas disponíveis, a moeda padrão do produto será utilizada. Você pode customizar todos os preços de um produto ou plano de assinatura no painel de controle Paddle.

<a name="price-discounts"></a>
### Descontos

 Pode também escolher mostrar os preços após uma redução. Ao chamar o método `previewPrices`, fornecerá o identificador da promoção através da opção `discount_id`:

```php
    use Laravel\Paddle\Cashier;

    $prices = Cashier::previewPrices(['pri_123', 'pri_456'], [
        'discount_id' => 'dsc_123'
    ]);
```

 Em seguida, exiba os preços calculados:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

<a name="customers"></a>
## Clientes

<a name="customer-defaults"></a>
### Inadimplência do cliente

 O recurso Cashier permite definir alguns padrões úteis para os clientes ao criar sessões de faturação. Estabelecer esses padrões permite preencher previamente o endereço de e-mail e o nome do cliente para que ele possa passar imediatamente à parte de pagamento do widget de check-out. Você pode estabelecer esses padrões substituindo os seguintes métodos em seu modelo cobrável:

```php
    /**
     * Get the customer's name to associate with Paddle.
     */
    public function paddleName(): string|null
    {
        return $this->name;
    }

    /**
     * Get the customer's email address to associate with Paddle.
     */
    public function paddleEmail(): string|null
    {
        return $this->email;
    }
```

 Estes valores padrão serão utilizados para todas as ações na loja de pagamentos que geram uma sessão de checkout.

<a name="retrieving-customers"></a>
### Recuperação de clientes

 É possível obter um cliente através do seu Paddle Customer ID utilizando o método `Cashier::findBillable`. Este método retorna uma instância do modelo "billable" (faturável):

```php
    use Laravel\Cashier\Cashier;

    $user = Cashier::findBillable($customerId);
```

<a name="creating-customers"></a>
### Criação de Clientes

 Ocasionalmente, pode ser necessário criar um cliente do Paddle sem iniciar uma assinatura. Isso pode ser feito usando o método `createAsCustomer`:

```php
    $customer = $user->createAsCustomer();
```

 Uma instância de `Laravel\Paddle\Customer` é retornada. Uma vez que o cliente foi criado no Paddle, você poderá começar um assinatura em uma data posterior. É possível fornecer uma matriz opcional `$options` para passar quaisquer parâmetros de criação de clientes adicionais que sejam suportados pelo API do Paddle:

```php
    $customer = $user->createAsCustomer($options);
```

<a name="subscriptions"></a>
## Assinaturas

<a name="creating-subscriptions"></a>
### Criar subscrições

 Para criar uma assinatura, primeiro obtenha uma instância do seu modelo faturável da sua base de dados. Normalmente, isto será uma instância de `App\Models\User`. Após ter obtido a instância de modelo, pode utilizar o método `subscribe` para criar a sessão de checkout do modelo:

```php
    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $checkout = $request->user()->subscribe($premium = 12345, 'default')
            ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

 O primeiro argumento fornecido ao método `subscribe` é o preço específico do usuário que está assinando. Esse valor deve corresponder ao identificador do preço no Paddle. O método `returnTo` aceita uma URL onde o seu usuário será redirecionado após concluir com êxito o checkout. O segundo argumento passado para o método `subscribe` é o tipo "interior" da assinatura. Se a sua aplicação fornecer apenas um único plano, você pode chamar esse de `default` ou `primary`. Esse tipo de assinatura serve apenas para uso interno na aplicação e não deve ser exibido aos usuários. Além disso, não deve conter espaços e sua alteração é proibida após a criação da assinatura.

 Você também pode fornecer um conjunto de metadados personalizados com relação à assinatura usando o método `customData`:

```php
    $checkout = $request->user()->subscribe($premium = 12345, 'default')
        ->customData(['key' => 'value'])
        ->returnTo(route('home'));
```

 Uma vez que uma sessão de check-out da assinatura tenha sido criada, a sessão de check-out pode ser fornecida para o componente `paddle-button` [Blade component (Componente Blade)](#overlay-checkout), incluído no Cashier Paddle:

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

 Após o usuário concluir seu check-out, será enviado um `subscription_created` como uma webhook de Paddle. O Cashier receberá este Webhook e configurará a assinatura do cliente. Para garantir que todos os Webhooks sejam recebidos e tratados adequadamente por sua aplicação, verifique se o [processamento de Webhooks foi configurado corretamente (#tratando-paddle-webhooks).

<a name="checking-subscription-status"></a>
### Verificar o Estado da Inscrição

 Uma vez que um usuário subscreveu o seu aplicativo, poderá verificar o respetivo estado de subscrição utilizando vários métodos práticos. Primeiro, o método `subscribed` retorna `true` se o usuário tiver uma assinatura válida, mesmo que a mesma esteja atualmente em período de avaliação:

```php
    if ($user->subscribed()) {
        // ...
    }
```

 Se o seu aplicativo oferecer vários tipos de assinaturas, poderá especificar a assinatura quando você invoque o método `subscribed`:

```php
    if ($user->subscribed('default')) {
        // ...
    }
```

 O método `subscribe` também é um excelente candidato para um [middleware de rota](/docs/v1/routing.md#route-middleware), que permite filtrar o acesso a rotas e controladores com base no status de assinatura do usuário:

```php
    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    class EnsureUserIsSubscribed
    {
        /**
         * Handle an incoming request.
         *
         * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
         */
        public function handle(Request $request, Closure $next): Response
        {
            if ($request->user() && ! $request->user()->subscribed()) {
                // This user is not a paying customer...
                return redirect('billing');
            }

            return $next($request);
        }
    }
```

 Se desejar saber se o utilizador ainda está na sua fase de testes, pode usar o método `onTrial`. Este método é útil para determinar se deve exibir um aviso ao utilizador de que este ainda está a fazer o seu teste:

```php
    if ($user->subscription()->onTrial()) {
        // ...
    }
```

 O método `subscribedToPrice` pode ser utilizado para determinar se o usuário está inscrito em um plano específico com base no ID de preço do Paddle. Nesse exemplo, iremos determinar se a assinatura padrão do usuário está ativamente inscrita ao preço mensal:

```php
    if ($user->subscribedToPrice($monthly = 'pri_123', 'default')) {
        // ...
    }
```

 O método recorrente pode ser usado para determinar se o usuário está atualmente em uma assinatura ativa e não está mais dentro de seu período experimental ou num período de carência:

```php
    if ($user->subscription()->recurring()) {
        // ...
    }
```

<a name="canceled-subscription-status"></a>
#### Estado de assinatura cancelada

 Para determinar se o usuário era um assinante ativo, mas cancelou a assinatura, você pode usar o método `canceled`:

```php
    if ($user->subscription()->canceled()) {
        // ...
    }
```

 Também é possível determinar se um usuário cancelou a assinatura, mas ainda está no período de carência até que ela expire completamente. Por exemplo, se o usuário cancelar uma assinatura em 5 de março, que seria originalmente programada para expirar em 10 de março, o usuário estará nesse período de carência até 10 de março. Além disso, o método `subscribed` ainda retornará `true` durante esse período:

```php
    if ($user->subscription()->onGracePeriod()) {
        // ...
    }
```

<a name="past-due-status"></a>
#### Estado de faturamento pendente

 Se o pagamento de um abonnamento falhar, ele será marcado como "vencido". Quando o seu abono estiver neste estado, ele não será ativo até que o cliente tenha atualizado suas informações de pagamento. Pode determinar se um abono está vencido usando o método "pastDue" na instância do abono:

```php
    if ($user->subscription()->pastDue()) {
        // ...
    }
```

 Se o pagamento do abono estiver atrasado, você deve instruir o usuário a [atualizar suas informações de pagamento](#atualizando-informacoes-de-pagamento).

 Se você deseja que os assinaturas ainda sejam consideradas válidas quando estiverem "vencidas", use o método `keepPastDueSubscriptionsActive`, fornecido pelo Cashier. Normalmente, esse método deve ser chamado no método `register` do seu `AppServiceProvider`:

```php
    use Laravel\Paddle\Cashier;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        Cashier::keepPastDueSubscriptionsActive();
    }
```

 > [AVISO]
 > Quando um assinatura está em estado 'past_due' (em atraso), ela não poderá ser alterada até que os dados do pagamento sejam atualizados. Sendo assim, os métodos `swap` e `updateQuantity` irão gerar uma exceção quando a assinatura estiver no estado 'past_due'.

<a name="subscription-scopes"></a>
#### Escopo da inscrição

 A maioria dos estados de assinatura também está disponível como escopos da consulta para que você possa consultar facilmente sua base de dados para verificar as assinaturas em determinado estado:

```php
    // Get all valid subscriptions...
    $subscriptions = Subscription::query()->valid()->get();

    // Get all of the canceled subscriptions for a user...
    $subscriptions = $user->subscriptions()->canceled()->get();
```

 Uma lista completa dos escopos disponíveis está abaixo:

```php
    Subscription::query()->valid();
    Subscription::query()->onTrial();
    Subscription::query()->expiredTrial();
    Subscription::query()->notOnTrial();
    Subscription::query()->active();
    Subscription::query()->recurring();
    Subscription::query()->pastDue();
    Subscription::query()->paused();
    Subscription::query()->notPaused();
    Subscription::query()->onPausedGracePeriod();
    Subscription::query()->notOnPausedGracePeriod();
    Subscription::query()->canceled();
    Subscription::query()->notCanceled();
    Subscription::query()->onGracePeriod();
    Subscription::query()->notOnGracePeriod();
```

<a name="subscription-single-charges"></a>
### Custos da assinatura única

 As taxas únicas de assinatura permitem cobrar os assinantes com uma taxa única em cima das suas assinaturas. Você deve fornecer um ou vários ID's de preços ao invocar o método `charge`:

```php
    // Charge a single price...
    $response = $user->subscription()->charge('pri_123');

    // Charge multiple prices at once...
    $response = $user->subscription()->charge(['pri_123', 'pri_456']);
```

 O método `charge` não irá efetivamente cobrar o cliente até ao próximo período de faturação do seu serviço. Se pretender faturar o cliente imediatamente, utilize o método `chargeAndInvoice`:

```php
    $response = $user->subscription()->chargeAndInvoice('pri_123');
```

<a name="updating-payment-information"></a>
### Atualizar informações de pagamento

 O Paddle sempre salva um método de pagamento por assinatura. Se você quiser atualizar o método padrão de pagamento de uma assinatura, redirecione o cliente para a página de atualização do método de pagamento hospedado no Paddle usando o método `redirectToUpdatePaymentMethod` no modelo de assinatura:

```php
    use Illuminate\Http\Request;

    Route::get('/update-payment-method', function (Request $request) {
        $user = $request->user();

        return $user->subscription()->redirectToUpdatePaymentMethod();
    });
```

 Quando o utilizador tiver concluído a atualização das suas informações, será enviado um evento de notificação `subscription_updated` pela Paddle e os detalhes da subscrição serão atualizados no banco de dados da sua aplicação.

<a name="changing-plans"></a>
### Mudando os Planos

 Depois que um usuário subscrever para o seu aplicativo, pode ocasionalmente querer mudar para um novo plano de assinatura. Para atualizar o plano de assinatura para um usuário, você deve passar o identificador do preço da Paddle para a `swap` método de subscrição:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->subscription()->swap($premium = 'pri_456');
```

 Se você preferir trocar os planos e faturar o usuário imediatamente em vez de esperar pelo próximo ciclo de faturamento, pode usar a método `swapAndInvoice`:

```php
    $user = User::find(1);

    $user->subscription()->swapAndInvoice($premium = 'pri_456');
```

<a name="prorations"></a>
#### Apropriações

 Por padrão, a Paddle aplica cobranças proporcionais quando é feita uma troca de planos. O método `noProrate` pode ser utilizado para atualizar as assinaturas sem aplicar o cálculo proporcional:

```php
    $user->subscription('default')->noProrate()->swap($premium = 'pri_456');
```

 Caso queira desativar o faturamento progressivo e facturar os clientes imediatamente, pode utilizar a funcionalidade `swapAndInvoice`, combinada com `noProrate`:

```php
    $user->subscription('default')->noProrate()->swapAndInvoice($premium = 'pri_456');
```

 Ou, para não faturar uma alteração de subscrição ao seu cliente, você pode utilizar o método `doNotBill`:

```php
    $user->subscription('default')->doNotBill()->swap($premium = 'pri_456');
```

 Para mais informações sobre as políticas de distribuição progressiva do Paddle, consulte a documentação sobre distribuição progressiva no [site do Paddle](https://developer.paddle.com/concepts/subscriptions/proration).

<a name="subscription-quantity"></a>
### Número de assinaturas

 Às vezes as subscrições são afetadas pela "quantidade". Por exemplo, um aplicativo de gestão de projetos pode cobrar US$10 por mês para cada projeto. Para facilmente incrementar ou decrementar a quantidade da sua assinatura, use os métodos `incrementQuantity` e `decrementQuantity`:

```php
    $user = User::find(1);

    $user->subscription()->incrementQuantity();

    // Add five to the subscription's current quantity...
    $user->subscription()->incrementQuantity(5);

    $user->subscription()->decrementQuantity();

    // Subtract five from the subscription's current quantity...
    $user->subscription()->decrementQuantity(5);
```

 Alternativamente, você pode definir uma quantidade específica usando o método `updateQuantity`:

```php
    $user->subscription()->updateQuantity(10);
```

 O método `noProrate` pode ser utilizado para atualizar a quantidade da assinatura sem fazer o cálculo proporcional dos encargos.

```php
    $user->subscription()->noProrate()->updateQuantity(10);
```

<a name="quantities-for-subscription-with-multiple-products"></a>
#### Quantidades de assinaturas com vários produtos

 Se o seu pedido for um [pedido com vários produtos (#pedidos-com-varios-produtos)], deverá passar o ID do preço cuja quantidade pretende aumentar ou diminuir no segundo argumento dos métodos increment/ decrement:

```php
    $user->subscription()->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### Assinaturas com vários produtos

 O [Subscription with multiple products](https://developer.paddle.com/build/subscriptions/add-remove-products-prices-addons) permite que você atribua vários produtos de faturamento a uma única assinatura. Por exemplo, imagine que está construindo um aplicativo "helpdesk" de suporte ao cliente com um preço base de subscrição de $10 por mês, mas oferece um produto complementar de bate-papo ao vivo por mais $15 por mês.

 Ao criar sessões de check-out de assinatura, é possível especificar vários produtos para uma determinada assinatura ao passar um array de preços como o primeiro argumento do método `subscribe`:

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $checkout = $request->user()->subscribe([
            'price_monthly',
            'price_chat',
        ]);

        return view('billing', ['checkout' => $checkout]);
    });
```

 No exemplo acima, o cliente terá dois preços ligados à assinatura padrão. Os dois valores serão cobrados nos respectivos intervalos de faturamento. Se necessário, pode passar um array associativo com pares chave/valor para indicar a quantidade específica de cada preço:

```php
    $user = User::find(1);

    $checkout = $user->subscribe('default', ['price_monthly', 'price_chat' => 5]);
```

 Se você deseja adicionar outro preço a um plano existente, será necessário usar o método de substituição do plano. Ao invocar o método de substituição, deve incluir os preços e quantidades atuais do plano:

```php
    $user = User::find(1);

    $user->subscription()->swap(['price_chat', 'price_original' => 2]);
```

 O exemplo acima adicionará o novo preço, mas o cliente não será faturado pelo mesmo até que seu próximo ciclo de faturamento. Se você deseja faturar o cliente imediatamente, pode usar o método `swapAndInvoice`:

```php
    $user->subscription()->swapAndInvoice(['price_chat', 'price_original' => 2]);
```

 Você pode remover preços de assinaturas usando o método `swap` e omitindo o preço que deseja remover.

```php
    $user->subscription()->swap(['price_original' => 2]);
```

 > [AVERIGUAR]
 > Não pode remover o último preço de um abono. Em vez disso, deve simplesmente cancelar o abono.

<a name="multiple-subscriptions"></a>
### Assinaturas múltiplas

 O Paddle permite que os seus clientes tenham várias subscrições em simultâneo. Por exemplo, pode administrar um ginásio que disponibiliza subscrições de natação e musculação; cada subscrição tem preços diferentes. Claro que os clientes devem poder subscrever ambos os planos ou apenas um deles.

 Ao criar assinaturas na sua aplicação, você pode fornecer o tipo da assinatura ao método `subscribe` como o segundo argumento. O tipo é qualquer string que represente o tipo de assinatura iniciada pelo usuário:

```php
    use Illuminate\Http\Request;

    Route::post('/swimming/subscribe', function (Request $request) {
        $checkout = $request->user()->subscribe($swimmingMonthly = 'pri_123', 'swimming');

        return view('billing', ['checkout' => $checkout]);
    });
```

 Neste exemplo, iniciamos um abono mensal de natação para o cliente, mas ele poderá querer trocar por um abono anual posteriormente. Ao ajustar o abono do cliente, podemos simplesmente alterar o preço no abono "natação":

```php
    $user->subscription('swimming')->swap($swimmingYearly = 'pri_456');
```

 Naturalmente, poderá também cancelar a assinatura por completo:

```php
    $user->subscription('swimming')->cancel();
```

<a name="pausing-subscriptions"></a>
### Pausar assinaturas

 Para interromper um assinatura, chame o método `pause` no objeto de assinatura do usuário:

```php
    $user->subscription()->pause();
```

 Quando um abonnamento é pausado, o Cashier definirá automaticamente a coluna `paused_at` no seu banco de dados. Esta coluna serve para determinar quando o método `paused` deve começar a retornar `true`. Por exemplo, se um cliente pausar um abonnamento em 1º de março, mas o abonnamento não tiver sido agendado para recorrência até 5 de março, o método `paused` continuará retornando `false` até 5 de março. Isso ocorre porque normalmente um usuário pode continuar utilizando um aplicativo até o final do seu ciclo de faturamento.

 Por padrão, a interrupção ocorre no próximo período de faturamento para que o cliente possa usar o restante período pelo qual pagou. Se você quiser interromper um assinatura imediatamente, poderá usar o método `pauseNow`:

```php
    $user->subscription()->pauseNow();
```

 Usando o método `pauseUntil`, você pode pausar a assinatura até um determinado momento no tempo:

```php
    $user->subscription()->pauseUntil(now()->addMonth());
```

 Ou você pode usar o método `pauseNowUntil` para interromper imediatamente a assinatura até um determinado ponto no tempo.

```php
    $user->subscription()->pauseNowUntil(now()->addMonth());
```

 Você pode determinar se um usuário interrompeu seu assinatura, mas ainda está no período de carência usando o método `onPausedGracePeriod`:

```php
    if ($user->subscription()->onPausedGracePeriod()) {
        // ...
    }
```

 Para retomar uma assinatura interrompida, pode chamar o método `resume` na assinatura:

```php
    $user->subscription()->resume();
```

 > [AVISO]
 > Uma assinatura não pode ser modificada enquanto estiver pausada. Se pretender substituir por um plano diferente ou atualizar as quantidades, deve reiniciar a assinatura primeiro.

<a name="canceling-subscriptions"></a>
### Cancelar assinaturas

 Para cancelar uma assinatura, chame o método `cancel` da assinatura do usuário:

```php
    $user->subscription()->cancel();
```

 Quando um plano é cancelado, o Cashier definirá automaticamente a coluna `ends_at` em seu banco de dados. Essa coluna é usada para determinar quando o método `subscribed` deve começar a retornar `false`. Por exemplo, se um cliente cancelar um plano em 1º de março, mas esse plano não tiver término previsto até 5 de março, o método `subscribed` continuará retornando `true` até 5 de março. Isso é feito porque normalmente os usuários podem continuar utilizando um aplicativo até o final do ciclo de faturamento.

 É possível determinar se um usuário cancelou sua assinatura, mas ainda está em seu "período de gracia", utilizando o método `onGracePeriod`:

```php
    if ($user->subscription()->onGracePeriod()) {
        // ...
    }
```

 Se pretender cancelar um abono imediatamente, poderá chamar o método `cancelNow` do abono:

```php
    $user->subscription()->cancelNow();
```

 Para impedir o cancelamento de um assinatura durante seu período de carência, você pode usar o método `stopCancelation`:

```php
    $user->subscription()->stopCancelation();
```

 > [AVERIGUAR]
 > Não é possível retomar assinaturas do Paddle depois de o cancelamento. Se um cliente desejar retomar sua assinatura, ele terá que criar uma nova assinatura.

<a name="subscription-trials"></a>
## Testes de assinatura

<a name="with-payment-method-up-front"></a>
### Com o pagamento feito antecipadamente

 Se pretender oferecer períodos de avaliação aos seus clientes e ainda recolher os dados do método de pagamento de antemão, defina um período de avaliação no painel Paddle relativamente ao preço ao qual o cliente se inscreveu. Inicie a sessão de checkout como se normalmente fizesse:

```php
    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $checkout = $request->user()->subscribe('pri_monthly')
                    ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

 Quando o seu aplicativo receber a mensagem `subscription_created`, a Cashier definirá a data de finalização do período experimental no registo da subscrição na base de dados do seu aplicativo e envia instruções à Paddle para não iniciar as faturas ao cliente antes dessa data.

 > [!AVISO]
 > Se a assinatura do cliente não for cancelada antes da data de término do teste, será cobrado assim que o período de teste terminar, por isso você deve comunicar aos seus usuários a data de término do teste.

 Você pode determinar se o usuário está em seu período de teste com a `onTrial` do objeto usuário ou a `onTrial` do objeto assinatura. Os dois exemplos a seguir são equivalentes:

```php
    if ($user->onTrial()) {
        // ...
    }

    if ($user->subscription()->onTrial()) {
        // ...
    }
```

 Para determinar se um teste existente já expirou, pode utilizar os métodos `hasExpiredTrial`.

```php
    if ($user->hasExpiredTrial()) {
        // ...
    }

    if ($user->subscription()->hasExpiredTrial()) {
        // ...
    }
```

 Para determinar se um usuário está em teste para um tipo de assinatura específico, você pode fornecer o tipo ao método `onTrial` ou `hasExpiredTrial`:

```php
    if ($user->onTrial('default')) {
        // ...
    }

    if ($user->hasExpiredTrial('default')) {
        // ...
    }
```

<a name="without-payment-method-up-front"></a>
### Sem método de pagamento na frente

 Se pretender oferecer períodos de avaliação sem recolher antecipadamente informações sobre o método de pagamento do utilizador, pode definir a coluna `trial_ends_at` do registo do cliente associado ao seu utilizador com a data desejada para terminar a avaliação. Normalmente, isto é feito durante o registo do utilizador:

```php
    use App\Models\User;

    $user = User::create([
        // ...
    ]);

    $user->createAsCustomer([
        'trial_ends_at' => now()->addDays(10)
    ]);
```

 O termo "tentativa" usado por este caixa é um tipo de "tentativa genérica", já que não está associada a nenhum assinatura ativa. O método `onTrial` da instância de `User` retorna `true` se a data atual não estiver passada do valor de `trial_ends_at`:

```php
    if ($user->onTrial()) {
        // User is within their trial period...
    }
```

 Quando estiver pronto para criar uma assinatura real para o usuário, você poderá usar o método `subscribe`, da mesma forma que o costume:

```php
    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $checkout = $user->subscribe('pri_monthly')
            ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

 Para recuperar a data de término do teste, você pode usar o método `trialEndsAt`. Este método retorna uma instância da classe `Carbon` se um usuário estiver em fase de teste ou `null` caso contrário. Você também pode passar um tipo de assinatura opcional se desejar obter a data de término do teste para uma assinatura específica, que não o tipo padrão:

```php
    if ($user->onTrial('default')) {
        $trialEndsAt = $user->trialEndsAt();
    }
```

 Pode utilizar o método `onGenericTrial` caso pretenda saber especificamente se a conta está dentro do período de prova genérica e ainda não tenha criado uma assinatura.

```php
    if ($user->onGenericTrial()) {
        // User is within their "generic" trial period...
    }
```

<a name="extend-or-activate-a-trial"></a>
### Estender ou ativar uma avaliação

 É possível estender um período de teste existente em uma assinatura, convocando o método `extendTrial` e especificando a hora exata em que o teste deve terminar.

```php
    $user->subscription()->extendTrial(now()->addDays(5));
```

 Ou você pode ativar imediatamente uma assinatura terminando sua versão de avaliação, chamando o método `activate` na assinatura:

```php
    $user->subscription()->activate();
```

<a name="handling-paddle-webhooks"></a>
## Gerenciando Webhooks do Paddle

 O Paddle pode notificar o seu aplicativo de diversos eventos através de Webhooks. Por defeito, um route que aponta para o controlador do webhook do Cashier é registado pelo fornecedor de serviços do Cashier. Este controlador irá gerir todos os pedidos de webhook recebidos.

 Por padrão, este controlador lidará automaticamente com a cancelação de subscrições que tenham demasiadas cobranças falhadas, atualizações de subscrição e alterações no método de pagamento; no entanto, como descobriremos em breve, poderá estender este controlador para lidar com qualquer evento de rede Paddle que pretender.

 Para garantir que seu aplicativo possa lidar com os webhooks da Paddle, configure a URL do Webhook no painel de controle da Paddle. Por padrão, o controlador webhook Cashier responde ao caminho URL `/paddle/webhook`. A lista completa de todos os webhooks que você deve ativar no painel de controle da Paddle é:

 Atualizado o cliente
 - Transação concluída
 Atualizado a transação
 - Assinatura criada
 Atualização da assinatura
 - Assinatura Interrompida
 - Suspensão do Serviço

 > [!AVISO]
 Middleware de verificação de assinatura do Webhook ([Verificar assinaturas de Webhook](/docs/{{ version }} / cashier-paddle#verifying-webhook-signatures).

<a name="webhooks-csrf-protection"></a>
#### Webhook e proteção contra o ataque de cross-site request forgery (CSRF)

 Como os Webhooks do Paddle precisam contornar a proteção contra [CSRF de Laravel](/docs/csrf), você deve garantir que o Laravel não tente verificar o token CSRF para webhooks entrantes do Paddle. Para fazer isso, você deve excluir `paddle/*` da proteção contra CSRF no arquivo `bootstrap/app.php`:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'paddle/*',
        ]);
    })
```

<a name="webhooks-local-development"></a>
#### Webhook e desenvolvimento local

 Para o Paddle poder enviar seus webhooks de aplicação durante o desenvolvimento local, você precisará expor sua aplicação por meio de um serviço de compartilhamento de site, como [Ngrok](https://ngrok.com/) ou [Expose](https://expose.dev/docs/introduction). Se estiver desenvolvendo seu aplicativo localmente usando o [Sail do Laravel](/docs/sail), você poderá usar o comando de compartilhamento de site do Sail ([comandos de compartilhamento do site do Sail](/docs/sail#sharing-your-site).

<a name="defining-webhook-event-handlers"></a>
### Definindo os manipuladores de evento do Webhook

 O sistema de faturamento lida automaticamente com o cancelamento da assinatura em cobranças falhadas e outros webhooks Paddle comuns. No entanto, se tiver eventos adicionais que deseja gerenciar, poderá fazê-lo ao ouvir os seguintes eventos enviados pelo sistema de faturamento:

 - `Laravel\Paddle\Events\WebhookReceived`
 - `Laravel\Paddle\Events\WebhookHandled`

 Ambos os eventos contêm o conteúdo completo do webhook Paddle. Por exemplo, se você pretender usar o webhook `transaction.billed`, poderá registrar um [ouvinte](/docs/events#defining-listeners) para lidar com esse evento:

```php
    <?php

    namespace App\Listeners;

    use Laravel\Paddle\Events\WebhookReceived;

    class PaddleEventListener
    {
        /**
         * Handle received Paddle webhooks.
         */
        public function handle(WebhookReceived $event): void
        {
            if ($event->payload['event_type'] === 'transaction.billed') {
                // Handle the incoming event...
            }
        }
    }
```

 O sistema de caixas registra também eventos dedicados ao tipo do webhook recebido. Além do carregamento completo da Paddle, eles incluem os modelos relevantes que foram utilizados para processar o webhook, como modelo faturável, subscrição ou recibo:

<div class="content-list" markdown="1">

 - `Laravel\Paddle\Events\CustomerUpdated`
 - `Laravel\Paddle\Events\TransactionCompleted`
 - `Laravel\Paddle\Eventos\TransaçãoAtualizada`
 - `Laravel\Paddle\Events\SubscriptionCreated`
 - `Laravel\Paddle\Events\SubscriptionUpdated`
 - `Laravel\Paddle\Events\SubscriptionPaused`
 - `Laravel\Paddle\Events\SubscriptionCanceled`

</div>

 Você também pode substituir a rota de webhook integrada e padrão definindo a variável de ambiente `CASHIER_WEBHOOK` no arquivo `.env` da sua aplicação. Esse valor deve ser o URL completo para sua rota de webhook, e precisa corresponder ao URL configurado em seu painel do Paddle:

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a name="verifying-webhook-signatures"></a>
### Verificação de assinaturas de webhooks

 Para garantir seus webhooks, você pode usar as assinaturas de [webhooks do Paddle](https://developer.paddle.com/webhook-reference/verifying-webhooks). Por conveniência, o Cashier inclui automaticamente um middleware que valida se a solicitação de webhook do Paddle recebido é válida.

 Para ativar a verificação de webhooks, certifique-se de que a variável ambiental `PADDLE_WEBHOOK_SECRET` está definida no arquivo `.env` da sua aplicação. O segredo do webhook pode ser recuperado na área de trabalho de sua conta Paddle.

<a name="single-charges"></a>
## Custos unitários

<a name="charging-for-products"></a>
### Custos dos produtos

 Se pretender iniciar uma compra de um cliente, pode usar a metodologia `checkout` numa instância modelo facturável para gerar uma sessão de checkout para a compra. A metodologia `checkout` aceita uma ou várias IDs do preço. Em caso necessário, pode ser utilizada uma matriz associativa para indicar a quantidade do produto que está sendo adquirido:

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $request->user()->checkout(['pri_tshirt', 'pri_socks' => 5]);

        return view('buy', ['checkout' => $checkout]);
    });
```

 Após gerar a sessão de checkout, você poderá usar o `paddle-button` fornecido pelo Cashier [componente Blade](#overlay-checkout) para permitir que o usuário visualize o widget de checkout do Paddle e conclua a compra:

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy
</x-paddle-button>
```

 Uma sessão de checkout tem um método `customData`, permitindo que você passe quaisquer dados personalizados que desejar para a transação subjacente. Consulte [a documentação do Paddle](https://developer.paddle.com/build/transactions/custom-data) para obter mais informações sobre as opções disponíveis ao passar dados personalizados:

```php
    $checkout = $user->checkout('pri_tshirt')
        ->customData([
            'custom_option' => $value,
        ]);
```

<a name="refunding-transactions"></a>
### Retirar transações

 As transações de reembolso enviarão o valor devolvido para o método de pagamento do cliente que foi usado no momento da compra. Para fazer um reembolso numa compra efetuada na Paddle, pode utilizar a metodologia `refund` em modelo `Cashier\Paddle\Transaction`. A primeira arugmento desta metodologia é o motivo do reembolso, que poderá ser seguido por um ou vários IDs de preços a reembolsar e valores opcionais como uma matriz associativa. Pode obter as transações para um modelo faturável específico utilizando a metodologia `transactions`.

 Digamos que pretendemos reembolsar uma transação específica para os preços `pri_123` e `pri_456`. Queremos reembolsar totalmente o valor da transação relacionada com `pri_123`, mas apenas dois dólares em relação ao preço `pri_456`:

```php
    use App\Models\User;

    $user = User::find(1);

    $transaction = $user->transactions()->first();

    $response = $transaction->refund('Accidental charge', [
        'pri_123', // Fully refund this price...
        'pri_456' => 200, // Only partially refund this price...
    ]);
```

 O exemplo acima reembolsará itens específicos de uma transação. Se desejar reembolsar toda a transação, basta fornecer um motivo:

```php
    $response = $transaction->refund('Accidental charge');
```

 Para obter mais informações sobre reembolsos, consulte a documentação de reembolso da Paddle [aqui.](https://developer.paddle.com/build/transactions/create-transaction-adjustments)

 > [AVISO]
 > Reembolsos devem ser sempre aprovados por Paddle antes de processar totalmente o pedido.

<a name="crediting-transactions"></a>
### Transações de crédito

 Assim como o reembolso, é possível também efetuar créditos. O crédito irá adicionar os fundos ao saldo do cliente para utilização em compras futuras. É apenas possível efetuar créditos para transações manualmente recolhidas e não para transações automaticamente recolhidas (subscrições), uma vez que a Paddle lida com os créditos de subscrição automaticamente:

```php
    $transaction = $user->transactions()->first();

    // Credit a specific line item fully...
    $response = $transaction->credit('Compensation', 'pri_123');
```

 Para mais informações, consulte a documentação do Paddle sobre crédito em <a href="https://developer.paddle.com/build/transactions/create-transaction-adjustments">https://developer.paddle.com/build/transactions/create-transaction-adjustments</a>.

 > [!AVISO]
 > Os créditos só podem ser solicitados para transações recolhidas manualmente, as transações coletadas automaticamente são creditadas pelo próprio Paddle.

<a name="transactions"></a>
## Transações

 Pode obter facilmente uma matriz de transações de um modelo faturável através da propriedade `transactions`:

```php
    use App\Models\User;

    $user = User::find(1);

    $transactions = $user->transactions;
```

 As transações representam pagamentos pelos seus produtos e compras, acompanhados de faturas. Somente as transações concluídas são armazenadas no banco de dados do seu aplicativo.

 Ao listar as transações de um cliente, você pode usar os métodos da instância de transação para exibir as informações de pagamento relevantes. Por exemplo, você pode querer listar todas as transações em uma tabela, permitindo que o usuário baixe facilmente qualquer fatura:

```html
<table>
    @foreach ($transactions as $transaction)
        <tr>
            <td>{{ $transaction->billed_at->toFormattedDateString() }}</td>
            <td>{{ $transaction->total() }}</td>
            <td>{{ $transaction->tax() }}</td>
            <td><a href="{{ route('download-invoice', $transaction->id) }}" target="_blank">Download</a></td>
        </tr>
    @endforeach
</table>
```

 A rota `download-invoice` pode ser semelhante à seguinte:

 use Illuminate\Http\Request;
 use Laravel\Cashier\Transaction;

 Rotas:get('/faturamento/{transação}', função (pedido $request, transação $transação){
 retorna $transaction->redirectToInvoicePdf();
 )->name('fatura de download');

<a name="past-and-upcoming-payments"></a>
### Pagamentos Efetuados e Futuros

 Você pode usar os métodos `lastPayment` e `nextPayment` para recuperar e exibir os pagamentos passados ou futuros de um cliente em assinaturas recorrentes.

```php
    use App\Models\User;

    $user = User::find(1);

    $subscription = $user->subscription();

    $lastPayment = $subscription->lastPayment();
    $nextPayment = $subscription->nextPayment();
```

 Ambos os métodos retornarão uma instância de `Laravel\Paddle\Payment`. Contudo, `lastPayment` retornará `null` quando transações ainda não tenham sido sincronizadas por webhooks, enquanto `nextPayment` retornará `null` quando o ciclo de faturamento tiver terminado (por exemplo, quando um plano foi cancelado):

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a name="testing"></a>
## Teste

 Durante os testes, você deverá testar manualmente seu fluxo de cobrança para garantir que sua integração funciona conforme o esperado.

 Para testes automatizados, incluindo aqueles executados dentro de um ambiente de CI, você pode usar o [Cliente HTTP do Laravel](/docs/http-client#testing) para fingir chamadas HTTP feitas à Paddle. Embora isso não teste as respostas reais da Paddle, fornece uma maneira de testar seu aplicativo sem chamar a API da Paddle.
