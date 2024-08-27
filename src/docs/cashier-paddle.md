# Laravel Cashier (Paddle)

<a name="introduction"></a>
## Introdução

> [!ALERTA]
> Esta documentação é para a integração do Cashier Paddle com o paddle faturamento se você ainda usa o paddle clássico use [cashier paddle 1.x](https://github.com/laravel/cashier-paddle/tree/1.x)

O [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle) fornece uma interface fluente e expressiva para os serviços de cobrança por assinatura do [Paddle](https://paddle.com). Ele manipula a maior parte do código de cobrança por assinatura que você está temendo. Além da gestão básica de assinaturas, o Cashier pode lidar com: troca de assinaturas, "quantidades" de assinatura, pausa de assinaturas, períodos de cancelamento, e muito mais.

Antes de usar a Caneta do Caixa, recomendamos que também revise os [Guia Conceituais](https://developer.paddle.com/concepts/overview) e a documentação da [API](https://developer.paddle.com/api-reference/overview) do Paddle.

<a name="upgrading-cashier"></a>
## Estoque de Caixa

Ao fazer o Upgrade para uma nova versão do Cashier, é importante que você revise atentamente [a documentação do Upgrade](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md).

<a name="installation"></a>
## Instalação

Primeiro instale o pacote do "Cashier" para o Paddle usando o Composer Package Manager:

```shell
composer require laravel/cashier-paddle
```

Em seguida, você deve publicar os arquivos de migração do Cashier usando o comando Artisan 'vendor:publish':

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Em seguida você deve executar as migrações do seu banco de dados de sua aplicação. As migrações do Cashier irão criar uma nova tabela chamada 'customers'. Além disso, novas tabelas 'subscriptions' e 'subscription_items' serão criadas para armazenar todas as assinaturas dos seus clientes. Finalmente, uma nova tabela 'transactions' será criada para armazenar todas transações do Paddle associadas aos seus clientes:

```shell
php artisan migrate
```

> (!AVISO)
> Para garantir que o Contador de Dinheiro manipule corretamente todos os eventos do Paddle, lembre-se de configurar a [manipulação de webhook do Contador de Dinheiro](#configurando-o-contador-de-dinheiro)

<a name="paddle-sandbox"></a>
### Pădle sandbox

Durante o desenvolvimento local e de palco, você deve [registrar uma conta SandBox do Paddle](https://sandbox-login.paddle.com/signup). Esta conta fornecerá um ambiente sandbox para testar e desenvolver seus aplicativos sem fazer pagamentos reais. Você pode usar os números da [cartão de teste] do Paddle para simular vários cenários de pagamento.

Ao usar o ambiente Paddle Sandbox, você deve definir a variável de ambiente PADDLE_SANDBOX para "verdadeiro" dentro do arquivo .env da sua aplicação:

```ini
PADDLE_SANDBOX=true
```

Após você terminar de desenvolver sua aplicação, você pode [pedir uma conta Paddle](https://paddle.com). Antes da sua aplicação entrar em produção, o Paddle precisará aprovar seu domínio de aplicação.

<a name="configuration"></a>
## Configuração

<a name="billable-model"></a>
### Modelo faturável

Antes de usar o Checkout, você precisa adicionar o atributo `Billable` à sua definição do modelo do usuário. Este atributo fornece vários métodos para permitir que você execute tarefas comuns de cobrança, como criar assinaturas e atualizar informações sobre métodos de pagamento:

```php
    use Laravel\Paddle\Billable;

    class User extends Authenticatable
    {
        use Billable;
    }
```

Se você tiver entidades cobráveis que não sejam usuários, você também pode adicionar a traça para essas classes:

```php
    use Illuminate\Database\Eloquent\Model;
    use Laravel\Paddle\Billable;

    class Team extends Model
    {
        use Billable;
    }
```

<a name="api-keys"></a>
### Chaves de API

Em seguida, você deve configurar suas chaves do Paddle em seu arquivo .env de sua aplicação. Você pode buscar as chaves da API do Paddle no painel de controle do Paddle:

```ini
PADDLE_CLIENT_SIDE_TOKEN=your-paddle-client-side-token
PADDLE_API_KEY=your-paddle-api-key
PADDLE_RETAIN_KEY=your-paddle-retain-key
PADDLE_WEBHOOK_SECRET="your-paddle-webhook-secret"
PADDLE_SANDBOX=true
```

A variável de ambiente `PADDLE_SANDBOX` deve ser definida como `true` quando estiver usando [ambiente de Sandbox do Paddle](#paddle-sandbox). A variável `PADDLE_SANDBOX` deve ser definida como `false` se você estiver implantando seu aplicativo para produção e for usar o ambiente de fornecedor ao vivo do Paddle.

O 'PADDLE_RETAIN_KEY' é opcional e só deve ser definido se estiver usando o Paddle com [Retain] (https://developer.paddle.com/paddlejs/retain).

<a name="paddle-js"></a>
### Remo JS

Paddle relies on its own JavaScript library to initiate the Paddle checkout widget. You can load the JavaScript library by placing the `@paddleJS` Blade directive right before your application layout's closing `</head>` tag:

```blade
<head>
    ...

    @paddleJS
</head>
```

<a name="currency-configuration"></a>
### Configuração de moeda

Você pode especificar um idioma a ser usado quando estiver formatando valores monetários para serem exibidos em notas fiscais. Internamente, o Cashier utiliza a classe [NumberFormatter](https://www.php.net/manual/en/class.numberformatter.php) do PHP para definir o local da moeda:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [AVISO]
> Para usar idiomas que não sejam o inglês ("en"), garanta que a extensão "ext-intl" esteja instalada e configurada no servidor.

<a name="overriding-default-models"></a>
### Substituindo modelos padrão.

Você está livre para estender os modelos usados internamente pelo Caixa por definir seu próprio modelo e estender o modelo correspondente do Caixa.

```php
    use Laravel\Paddle\Subscription as CashierSubscription;

    class Subscription extends CashierSubscription
    {
        // ...
    }
```

Depois de definir seu modelo, você pode instruir o Caixa para usar seu modelo personalizado através da classe 'Laravel\Paddle\Cashier'. Tipicamente, você deve informar ao Caixa sobre seus modelos personalizados no método 'boot' da classe 'App\Providers\AppServiceProvider' do seu aplicativo.

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
## Início Rápido

<a name="quickstart-selling-products"></a>
### Vender Produtos

> Nota:
> Antes de utilizar o checkout do Paddle, você deve definir produtos com preços fixos em seu painel do Paddle. Além disso, você deve [configurar a manipulação dos webhooks do Paddle](#configurando-a-manipulação-dos-webhooks-do-paddle).

Oferta de faturamento de produtos e assinaturas por meio do seu aplicativo pode ser intimidante. No entanto, graças ao Caixeiro e [Checkout Overlay Paddle](https://www.paddle.com/billing/checkout), você pode facilmente criar integrações de pagamento modernas e robustas.

Para cobrar clientes para produtos de pagamento único, não recorrentes, vamos utilizar o Cashier para cobrar os clientes com o Paddle Checkout Overlay, onde eles fornecerão seus detalhes de pagamento e confirmarão sua compra. Uma vez que o pagamento foi feito através do Checkout Overlay, o cliente será redirecionado a uma URL de sucesso de sua escolha dentro do seu aplicativo:

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $request->user()->checkout('pri_deluxe_album')
            ->returnTo(route('dashboard'));

        return view('buy', ['checkout' => $checkout]);
    })->name('checkout');
```

Como você pode ver no exemplo acima, utilizaremos o método de checkout fornecido pelo Caixa para criar um objeto de checkout que apresentará a sobreposição de checkout do Paddle ao cliente para um determinado "identificador de preço". Ao usar o Paddle, "preços" referem-se aos [ preços definidos para produtos específicos](https://developer.paddle.com/build/products/create-products-prices).

Se necessário, o `checkout` método irá criar automaticamente um cliente em Paddle e conectar esse registro de cliente Paddle com o usuário correspondente no banco de dados do seu aplicativo. Após concluir a sessão de checkout, o cliente será redirecionado para uma página de sucesso dedicada onde você pode exibir uma mensagem informativa ao cliente.

Na `compra` visão, incluiremos um botão para exibir a sobreposição de checkout. O componente Blade `paddle-button` é incluído com o Cashier Paddle; no entanto, você também pode [renderizar manualmente uma sobreposição de checkout](#renderização manual de uma sobreposição de checkout):

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy Product
</x-paddle-button>
```

<a name="providing-meta-data-to-paddle-checkout"></a>
#### Fornecendo dados Meta para Paddle Checkout

Ao vender produtos, é comum rastrear pedidos concluídos e itens comprados através de modelos 'Cart' e 'Order', definidos pelo seu próprio aplicativo. Ao redirecionar os clientes para a sobreposição de checkout do Paddle para concluir uma compra, você pode precisar fornecer um identificador de pedido existente para que possa associar a compra concluída ao pedido correspondente quando o cliente for redirecionado de volta ao seu aplicativo.

Para isso, você pode fornecer um array de dados personalizados ao método "checkout". Vamos imaginar que uma "pedido" em "pendente" é criada dentro do nosso aplicativo quando o usuário inicia o processo de checkout. Lembre-se, os modelos "Cart" e "Order" neste exemplo são apenas ilustrativos e não fornecidos pelo Cashier. Você pode implementar esses conceitos a partir das necessidades do seu próprio aplicativo:

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

Como você pode ver no exemplo acima, quando um usuário começa o processo de checkout, forneceremos todos os identificadores de preço do Paddle associados ao carrinho / pedido para o método de checkout. É claro que seu aplicativo é responsável por associar esses itens com o "carrinho" ou pedido à medida que eles são adicionados pelo cliente. Também fornecemos o ID do pedido para a sobreposição de checkout do Paddle através do método customData .

Claro, provavelmente você vai querer marcar o pedido como completo uma vez que o cliente tenha finalizado o processo de checkout. Para isso, você pode escutar os webhooks enviados pelo Paddle e acionados via eventos por Cashier para armazenar as informações do pedido em seu banco de dados.

Para começar, escute o evento 'TransactionCompleted' enviado pelo atendente de caixa. Normalmente você deve registrar o ouvinte do evento no método 'boot' do 'AppServiceProvider' da sua aplicação:

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

Em este exemplo o ouvinte `CompleteOrder` talvez pareça assim:

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

Por favor, verifique a documentação do Paddle para mais informações sobre o [dados contidos no evento 'transaction.completed'].

<a name="quickstart-selling-subscriptions"></a>
### Vender Assinaturas

> [!Nota]
> Antes de utilizar o checkout com Paddle, você deve definir os produtos com preços fixos no painel do Paddle. Além disso, você deve configurar [o tratamento de webhooks do Paddle](#Tratamento_de_Webhooks_do_Paddle)

Oferecer cobrança de produtos e assinaturas através de seu aplicativo pode ser intimidante. No entanto, graças ao Cashier e o [Checkout Overlay da Paddle](https://www.paddle.com/billing/checkout), você pode criar integrações modernas e robustas de pagamento facilmente.

Para aprender como vender assinaturas usando Cashier e Paddle' Checkout Overlay, vamos considerar um cenário simples de um serviço de assinatura com planos mensais ( `price_basic_monthly`) e anuais ( `price_basic_yearly`). Esses dois preços poderiam ser agrupados em um "Produto Básico" ( `pro_basic`) no painel do Paddle. Além disso, nosso serviço de assinatura pode oferecer um plano "Especialista" como o `pro_expert`.

Primeiro, vamos descobrir como um cliente pode se inscrever para nossos serviços. Claro, você pode imaginar que o cliente pode clicar em um botão "assinar" no plano Básico na página de preços da nossa aplicação. Este botão invocará uma sobreposição Paddle Checkout para seu plano escolhido. Para começar, vamos iniciar uma sessão de checkout via o método `checkout`:

```php
    use Illuminate\Http\Request;

    Route::get('/subscribe', function (Request $request) {
        $checkout = $request->user()->checkout('price_basic_monthly')
            ->returnTo(route('dashboard'));

        return view('subscribe', ['checkout' => $checkout]);
    })->name('subscribe');
```

No `subscribe` a exibição, incluiremos um botão para exibir o Checkout Overlay. O componente da lâmina `paddle-button` é incluído com Paddle Caixeiro; no entanto, você também pode [manualmente renderizar uma sobreposição de checkout](#manualmente-renderizando-uma-sobreposição-de-checkout):

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Agora, quando o botão "Assinar" é clicado, o cliente será capaz de inserir seus dados para pagamento e iniciar sua assinatura. Para saber quando a assinatura começou (desde que alguns métodos de pagamento exigem alguns segundos para processar), você também deve configurar a [manipulação do webhook do caixa](# manipulação-de-webhooks-do-paddles).

Agora que os clientes podem iniciar assinaturas, precisamos restringir certas partes de nosso aplicativo para que apenas usuários inscritos possam acessá-las. Claro, podemos sempre determinar o estado atual da assinatura de um usuário usando o método `subscribed` fornecido pela característica `Billable` do Cashier.

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

Podemos até determinar facilmente se um usuário está assinando um produto ou preço específico:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### Construção de Middleware Assinado

Para conveniência, você pode criar um [middleware](/docs/{{version}}/middleware) que determina se o pedido de entrada é de um usuário inscrito. Depois de ter definido esse middleware, você pode facilmente atribuí-lo a uma rota para impedir que usuários não inscritos acessem a rota:

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

Uma vez que o middleware tenha sido definido, você pode atribuí-lo a uma rota:

```php
    use App\Http\Middleware\Subscribed;

    Route::get('/dashboard', function () {
        // ...
    })->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### Permite que os Clientes gerenciem seus planos de cobrança

Claro, os clientes podem querer mudar seu plano de assinatura por outro produto ou “nível”. No nosso exemplo acima, queremos permitir que o cliente troque seu plano de uma assinatura mensal para uma anual. Para isso você precisará implementar algo como um botão que leva a rota abaixo:

```php
    use Illuminate\Http\Request;

    Route::put('/subscription/{price}/swap', function (Request $request, $price) {
        $user->subscription()->swap($price); // With "$price" being "price_basic_yearly" for this example.

        return redirect()->route('dashboard');
    })->name('subscription.swap');
```

Além de trocar planos você também precisa permitir que seus clientes cancelem suas assinaturas. Assim como nas trocas de planos, forneça um botão que leva para o seguinte caminho:

```php
    use Illuminate\Http\Request;

    Route::put('/subscription/cancel', function (Request $request, $price) {
        $user->subscription()->cancel();

        return redirect()->route('dashboard');
    })->name('subscription.cancel');
```

E agora sua assinatura será cancelada no final do período de cobrança.

> Nota!
> Desde que você tenha configurado o tratamento de webhook do Cashier, o Cashier manterá automaticamente suas tabelas de banco de dados relacionadas ao Cashier em sincronia inspecionando os webhooks entrante do Paddle. Assim, por exemplo, quando você cancela uma assinatura de um cliente através do painel do Paddle, o Cashier receberá o webhook correspondente e marcará a assinatura como "cancelada" no banco de dados da sua aplicação.

<a name="checkout-sessions"></a>
## Check-out Sessões

A maioria das operações de cobrança ao cliente são realizadas usando "checkouts" via Paddle's [Checkout Overlay widget](https://developer.paddle.com/build/checkout/build-overlay-checkout) ou por meio da utilização de  [inline checkout](https://developer.paddle.com/build/checkout/build-branded-inline-checkout).

Antes de processar os pagamentos do checkout usando Paddle, você deve definir o [link padrão da pagamento](https://developer.paddle.com/build/transactions/default-payment-link#set-default-link) da sua aplicação em sua página do painel de configurações do checkout.

<a name="overlay-checkout"></a>
### Checkout com sobreposição

Antes de exibir o widget Checkout Overlay, você precisa gerar uma sessão de checkout usando o Cashier. Uma sessão de checkout informará o widget de checkout sobre a operação de faturamento que deve ser executada:

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Caixa inclui um botão "Paddle" [componente da lâmina]/. Você pode passar a sessão de checkout para este componente como uma "prop". Então, quando esse botão é clicado, o widget de checkout do Paddle será exibido:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Por padrão, isso exibirá o widget usando o estilo padrão do Paddle. Você pode personalizar o widget adicionando atributos suportados pelo Paddle como o atributo 'data-theme=light' ao componente:

```html
<x-paddle-button :url="$payLink" class="px-8 py-4" data-theme="light">
    Subscribe
</x-paddle-button>
```

O check out do paddle é asincrono. Uma vez que o usuário cria uma assinatura dentro do widget, o paddle enviará seu aplicativo um webhook para atualizar a assinatura no banco de dados do aplicativo. Portanto, é importante configurar corretamente [webhooks do paddle](# lidando com webhooks) para acomodar alterações de estado do paddle.

> [Aviso!]
> Após uma alteração no estado da assinatura, o atraso para receber o webhook correspondente é tipicamente mínimo mas você deve considerar isso em sua aplicação por considerar que a assinatura do seu usuário não pode estar imediatamente disponível após completar o checkout.

<a name="manually-rendering-an-overlay-checkout"></a>
#### Renderizando manualmente um Overlay Checkout

Você também pode renderizar manualmente uma sobreposição de checkout sem usar os componentes Blade internos do Laravel. Para começar, gere a sessão de checkout [como mostrado nos exemplos anteriores](#overlay-checkout):

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

A seguir, você pode usar Paddle.js para inicializar o checkout. Neste exemplo, criaremos um link com a classe 'paddle_button'. O Paddle.js irá detectar esta classe e mostrará uma sobreposição de checkout quando o link for clicado:

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
### Comprar Agora

Se você não quiser usar o "overlay" do Paddle checkout widget, ele também fornece a opção de exibir o widget embutido na página da loja. Embora esta abordagem não permita ajustar os campos HTML do checkout, ela permite que você embuta o widget no seu aplicativo.

Para facilitar o início com o pagamento de rodapé, o Caixeiro inclui um componente "Blade" chamado "Paddle Checkout". Para começar, você deve [gerar uma sessão de checkout](#overlay-checkout):

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Então, você pode passar a sessão de check-out para o atributo 'checkout' do componente:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" />
```

Para ajustar a altura do componente de checkout em linha, você pode passar o atributo `height` para o componente Blade:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" height="500" />
```

Para mais detalhes sobre as opções de personalização do Checkout Inline, por favor consulte o [Guia do Paddle para Checkout Inline](https://developer.paddle.com/build/checkout/build-branded-inline-checkout) e o [Configurações disponíveis para Checkout](https://developer.paddle.com/build/checkout/set-up-checkout-default-settings).

<a name="manually-rendering-an-inline-checkout"></a>
#### Renderização manual de um checkout inline

Você também pode renderizar manualmente um checkout embutido sem usar componentes pré-construídos de Laravel. Para começar, gere a sessão do checkout [como demonstrado nos exemplos anteriores](#checkout-embutido):

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Em seguida, você pode usar o Paddle.js para inicializar o checkout. Neste exemplo, vamos demonstrar isso usando [Alpine.js](https://github.com/alpinejs/alpine); no entanto, você é livre para modificar este exemplo para sua própria pilha de front-end:

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
### Sair com o hóspede

Às vezes, você pode precisar criar uma sessão de checkout para usuários que não necessitam de um perfil com seu aplicativo. Para tanto, você pode usar o método `guest`:

```php
    use Illuminate\Http\Request;
    use Laravel\Paddle\Checkout;

    Route::get('/buy', function (Request $request) {
        $checkout = Checkout::guest('pri_34567')
            ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Então você pode fornecer a sessão de checkout para o componente da lâmina [Paddle button](#overlay-checkout) ou [inline checkout](#inline-checkout).

<a name="price-previews"></a>
## Previsões de Preços

O Paddle permite que você personalize os preços por moeda, essencialmente permitindo que você configure diferentes preços para diferentes países. O caixa do Paddle permite que você recupere todos esses preços usando o método "previewPrices". Este método aceita os IDs de preço que você deseja recuperar os preços para:

```php
    use Laravel\Paddle\Cashier;

    $prices = Cashier::previewPrices(['pri_123', 'pri_456']);
```

A moeda será determinada com base no endereço IP da solicitação; no entanto, você pode fornecer de forma opcional um país específico para obter os preços:

```php
    use Laravel\Paddle\Cashier;

    $prices = Cashier::previewPrices(['pri_123', 'pri_456'], ['address' => [
        'country_code' => 'BE',
        'postal_code' => '1234',
    ]]);
```

Depois de obter os preços, você pode mostrá-los como quiser.

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

Você pode também exibir o preço parcial e o valor do imposto separadamente:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->subtotal() }} (+ {{ $price->tax() }} tax)</li>
    @endforeach
</ul>
```

Para mais informações, [verifique a documentação da API do Paddle sobre preço de pré-visualização](https://developer.paddle.com/api-reference/pricing-preview/preview-prices).

<a name="customer-price-previews"></a>
### Preços de clientes à vista

Se um usuário já for um cliente e você gostaria de exibir os preços que se aplicam a esse cliente, pode fazê-lo recuperando os preços diretamente da instância do cliente.

```php
    use App\Models\User;

    $prices = User::find(1)->previewPrices(['pri_123', 'pri_456']);
```

Internamente, o caixa usará o ID do cliente para recuperar os preços em sua moeda. Por exemplo, um usuário que mora nos Estados Unidos verá os preços em dólares americanos enquanto um usuário na Bélgica verá os preços em euros. Se nenhuma moeda correspondente puder ser encontrada, a moeda padrão do produto será usada. Você pode personalizar todos os preços de um produto ou plano de assinatura no painel de controle da Paddle.

<a name="price-discounts"></a>
### Descontos

Você também pode optar por exibir os preços após um desconto. Ao chamar o método `previewPrices`, você fornece a ID do desconto usando o parâmetro "discount_id":

```php
    use Laravel\Paddle\Cashier;

    $prices = Cashier::previewPrices(['pri_123', 'pri_456'], [
        'discount_id' => 'dsc_123'
    ]);
```

Então, mostre os preços calculados:

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
### Cliente em falta

O Cashier permite que você defina alguns valores padrão para seus clientes ao criar sessões de checkout. Ao definir esses padrões, o endereço e o nome do cliente são preenchidos automaticamente para permitir uma transição rápida para a etapa de pagamento do widget de checkout. Você pode definir esses padrões sobrescrevendo os seguintes métodos no seu modelo cobrável:

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

Estes padrões serão usados para cada ação no Caixa que gera um [sessão de checkout](#sessao-de-checkout).

<a name="retrieving-customers"></a>
### Recuperando Clientes

Você pode recuperar um cliente pelo seu ID do Paddle usando o método `Cashier::findBillable`. Este método retornará uma instância do modelo faturável:

```php
    use Laravel\Cashier\Cashier;

    $user = Cashier::findBillable($customerId);
```

<a name="creating-customers"></a>
### Criando Clientes

Ocasionalmente, você pode desejar criar um cliente Paddle sem iniciar uma assinatura. Você pode realizar isso usando o método `createAsCustomer`:

```php
    $customer = $user->createAsCustomer();
```

Uma instância de 'Laravel\Paddle\Customer' é retornada. Uma vez que o cliente tenha sido criado no Paddle, você pode começar uma assinatura em uma data posterior. Você pode fornecer um array opcional `$options` para passar quaisquer parâmetros adicionais [da criação do cliente compatíveis com a API do Paddle](https://developer.paddle.com/api-reference/customers/create-customer):

```php
    $customer = $user->createAsCustomer($options);
```

<a name="subscriptions"></a>
## Assinaturas

<a name="creating-subscriptions"></a>
### Criando Assinaturas

Para criar uma assinatura, primeiro recupere um instância do seu modelo faturável a partir do seu banco de dados, que normalmente será um instância de “App\Models\User”. Depois de recuperar o modelo, você pode usar o método “subscribe” para criar a sessão de checkout do modelo.

```php
    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $checkout = $request->user()->subscribe($premium = 12345, 'default')
            ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

O primeiro argumento dado ao método "subscribe" é o preço específico pelo qual o usuário está se inscrevendo. Este valor deve corresponder à identificação do preço no Paddle. O método "returnTo" aceita uma URL a que seu usuário será redirecionado após concluir com sucesso o checkout. O segundo argumento passado para o método "subscribe" deve ser o tipo interno de assinatura. Se seu aplicativo oferece apenas uma assinatura, você pode chamá-lo de "padrao" ou "principal". Este tipo de assinatura é apenas para uso interno do aplicativo e não deve ser exibido aos usuários. Além disso, ele não deve conter espaços e nunca deve ser alterado após a criação da assinatura.

Você também pode fornecer uma matriz de metadados personalizados em relação à assinatura usando o método `customData`:

```php
    $checkout = $request->user()->subscribe($premium = 12345, 'default')
        ->customData(['key' => 'value'])
        ->returnTo(route('home'));
```

Uma vez que uma sessão de checkout tenha sido criada, ela pode ser fornecida ao botão "paga-botão" [componente do Blade] que é incluído com o Cashier Paddle.

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Após o usuário concluir sua compra, a plataforma Paddle enviará um webhook “subscription_created”. O Cashier receberá este webhook e configurará a assinatura do cliente. Para garantir que todos os webhooks sejam adequadamente recebidos e processados pelo seu aplicativo, certifique-se de configurar corretamente [a manipulação de webhooks da Paddle](#manipulacao-de-webhooks-da-paddle).

<a name="checking-subscription-status"></a>
### Verificando status de assinatura.

Uma vez que um usuário está inscrito em seu aplicativo, você pode verificar seu estado de inscrição usando uma variedade de métodos convenientes. Primeiro, o método " subscribed" retorna 'verdadeiro' se o usuário tiver uma assinatura válida, mesmo que a assinatura esteja atualmente em período de teste:

```php
    if ($user->subscribed()) {
        // ...
    }
```

Se seu aplicativo oferece múltiplas assinaturas, você pode especificar a assinatura ao invocar o método 'assinado':

```php
    if ($user->subscribed('default')) {
        // ...
    }
```

O método 'subscribed' também é uma excelente candidata para um [roteiro middleware](/docs/{{version}}/middleware), permitindo filtrar o acesso aos roteiros e controladores com base no estado de assinatura do usuário:

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

Se você gostaria de determinar se um usuário ainda está em seu período experimental, você pode usar o método ``onTrial``. Este método pode ser útil para determinar se você deve exibir uma mensagem de aviso para o usuário que eles ainda estão em seu período experimental:

```php
    if ($user->subscription()->onTrial()) {
        // ...
    }
```

O método `subscribedToPrice` pode ser usado para determinar se o usuário está subscrito a um plano específico com base em uma determinada identificação de preço do Paddle. Neste exemplo, vamos determinar se a assinatura padrão do usuário está ativa e subscrita ao preço mensal:

```php
    if ($user->subscribedToPrice($monthly = 'pri_123', 'default')) {
        // ...
    }
```

O método "recurring" pode ser usado para determinar se o usuário está atualmente com uma assinatura ativa e não mais dentro de seu período de teste ou período de carência.

```php
    if ($user->subscription()->recurring()) {
        // ...
    }
```

<a name="canceled-subscription-status"></a>
#### Status de Assinatura Cancelada

Para determinar se o usuário era uma vez um assinante ativo mas cancelou sua assinatura, você pode usar o método `cancelado`:

```php
    if ($user->subscription()->canceled()) {
        // ...
    }
```

Você também pode determinar se um usuário cancelou a assinatura, mas ainda está no seu "período de carência" até que a assinatura expire totalmente. Por exemplo, se um usuário cancelar uma assinatura em 5 de março que foi originalmente programado para expirar em 10 de março, o usuário está no seu "período de carência" até 10 de março. Além disso, o `assinado` método ainda retornará verdadeiro durante esse tempo:

```php
    if ($user->subscription()->onGracePeriod()) {
        // ...
    }
```

<a name="past-due-status"></a>
#### Status de pagamento atrasado

Se uma assinatura falhar para uma cobrança, ela será marcada como 'passado o prazo'. Quando sua assinatura está nesse estado, ele não estará ativo até que o cliente tenha atualizado suas informações de pagamento. Você pode determinar se uma assinatura está atrasada usando o método 'pastDue' na instância da assinatura:

```php
    if ($user->subscription()->pastDue()) {
        // ...
    }
```

Quando um usuário tem uma assinatura atrasada, você deve instruí-lo a [atualizar suas informações de pagamento](#atualizando-informações-de-pagamento).

Se você quiser que as assinaturas ainda sejam consideradas válidas quando estão "pagas", você pode usar o método `keepPastDueSubscriptionsActive` fornecido peloCashier. Normalmente, este método deve ser chamado no método `register` de sua `AppServiceProvider`:

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

> [Aviso]
> Quando uma assinatura está em um estado "past-due", não pode ser alterada até que as informações de pagamento sejam atualizadas. Portanto, os métodos 'swap' e 'updateQuantity' lançam uma exceção quando a assinatura está em um estado "past-due".

<a name="subscription-scopes"></a>
#### Assinaturas de escopos

A maioria dos estados de assinatura também estão disponíveis como escopos de consulta para que você possa facilmente consultar seu banco de dados para assinaturas que são em um determinado estado.

```php
    // Get all valid subscriptions...
    $subscriptions = Subscription::query()->valid()->get();

    // Get all of the canceled subscriptions for a user...
    $subscriptions = $user->subscriptions()->canceled()->get();
```

Uma lista completa de escopos disponíveis está disponível abaixo.

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
### Assinaturas Únicas de Carga

Cargas de assinatura permitem que você carregue assinantes com uma cobrança única, além de suas assinaturas. Você deve fornecer um ou vários IDs de preço ao invocar o método 'carga':

```php
    // Charge a single price...
    $response = $user->subscription()->charge('pri_123');

    // Charge multiple prices at once...
    $response = $user->subscription()->charge(['pri_123', 'pri_456']);
```

O método 'charge' não vai realmente cobrar o cliente até que o próximo intervalo de cobrança da sua assinatura. Se você quer faturar o cliente imediatamente, você pode usar o método 'chargeAndInvoice' em vez disso:

```php
    $response = $user->subscription()->chargeAndInvoice('pri_123');
```

<a name="updating-payment-information"></a>
### Atualização de informações de pagamento

O pagamento sempre salva um método de pagamento por assinatura. Se você quiser atualizar o método de pagamento padrão para uma assinatura, você deve redirecionar o cliente para a página de atualização do método de pagamento hospedado usando o `redirectToUpdatePaymentMethod` na assinatura do modelo:

```php
    use Illuminate\Http\Request;

    Route::get('/update-payment-method', function (Request $request) {
        $user = $request->user();

        return $user->subscription()->redirectToUpdatePaymentMethod();
    });
```

Quando um usuário tem terminado de atualizar as suas informações, uma webhook 'subscription_updated' será enviada pelo Paddle e os detalhes da assinatura serão atualizados no seu banco de dados.

<a name="changing-plans"></a>
### Mudando de planos

Depois que o usuário se inscrever em seu aplicativo, eles podem ocasionalmente querer trocar para um novo plano de assinatura. Para atualizar o plano de assinatura de um usuário, você deve passar a identificação do preço da Paddle para o método 'swap' da assinatura:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->subscription()->swap($premium = 'pri_456');
```

Se você gostaria de trocar planos e imediatamente faturar o usuário em vez de esperar por seu próximo ciclo de cobrança, você pode usar o método `swapAndInvoice`:

```php
    $user = User::find(1);

    $user->subscription()->swapAndInvoice($premium = 'pri_456');
```

<a name="prorations"></a>
#### Ressarcimentos

Por padrão, o Paddle repõe as cobranças quando se passa de um plano para outro. O método 'noProrate' pode ser usado para atualizar as assinaturas sem repassar as cobranças:

```php
    $user->subscription('default')->noProrate()->swap($premium = 'pri_456');
```

Se você quiser desativar a proração e faturar os clientes imediatamente, você pode usar o método 'swapAndInvoice' em combinação com 'noProrate':

```php
    $user->subscription('default')->noProrate()->swapAndInvoice($premium = 'pri_456');
```

Ou, para não faturar ao cliente por uma alteração de assinatura, você pode utilizar o método `doNotBill`:

```php
    $user->subscription('default')->doNotBill()->swap($premium = 'pri_456');
```

Para mais informações sobre as políticas de proração do Paddle, veja a documentação da proração do [prorazamento] (https://desenvolvedor.paddle.com/Conceitos/assinaturas/proração) .

<a name="subscription-quantity"></a>
### Quantidade de Assinatura

Às vezes as assinaturas são afetadas pela "quantidade". Por exemplo, um aplicativo de gerenciamento de projetos pode cobrar $ 10 por mês por projeto. Para incrementar ou decrementar facilmente a quantidade da sua assinatura, use os métodos `incrementQuantity` e `decrementQuantity`:

```php
    $user = User::find(1);

    $user->subscription()->incrementQuantity();

    // Add five to the subscription's current quantity...
    $user->subscription()->incrementQuantity(5);

    $user->subscription()->decrementQuantity();

    // Subtract five from the subscription's current quantity...
    $user->subscription()->decrementQuantity(5);
```

Alternativamente, você pode definir uma quantidade específica usando o método 'updateQuantity':

```php
    $user->subscription()->updateQuantity(10);
```

O método 'noProrate' pode ser usado para atualizar a quantidade da assinatura sem prorratar as cobranças:

```php
    $user->subscription()->noProrate()->updateQuantity(10);
```

<a name="quantities-for-subscription-with-multiple-products"></a>
#### Quantidades para Assinaturas com Produtos Múltiplos

Se sua assinatura é um [assinatura com vários produtos](#assinaturas-com-varios-produtos) você deve passar o ID do preço de quantia que deseja aumentar ou diminuir como segundo argumento no método incrementar / diminuir.

```php
    $user->subscription()->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### Assinaturas com vários produtos

[Inscrição com vários produtos](https://developer.paddle.com/build/subscriptions/add-remove-products-prices-addons) permitem atribuir vários produtos de cobrança a uma única assinatura. Por exemplo, imagine que você está construindo um aplicativo "helpdesk" de atendimento ao cliente que oferece um preço base de assinatura de US$ 10 por mês, mas também oferece um produto suplementar de bate-papo em tempo real pelo valor adicional de US$ 15 por mês.

Ao criar sessões de check-out de assinatura você pode especificar vários produtos para uma determinada assinatura passando um array de preços como o primeiro argumento do método 'subscribe':

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

No exemplo acima, o cliente terá dois preços anexados à sua assinatura padrão. Ambos os preços serão cobrados em seus intervalos de faturamento respectivos. Se necessário, você pode passar uma matriz associativa com pares de chave / valor para indicar uma quantidade específica para cada preço:

```php
    $user = User::find(1);

    $checkout = $user->subscribe('default', ['price_monthly', 'price_chat' => 5]);
```

Se você deseja acrescentar outro preço a um subscroção existente, você deve utilizar o método 'swap' da assinatura. Ao invocar o método 'swap', você também deve incluir os preços e quantidades atuais da assinatura:

```php
    $user = User::find(1);

    $user->subscription()->swap(['price_chat', 'price_original' => 2]);
```

O exemplo acima acrescentará o novo preço, mas o cliente não será cobrado até a próxima data de cobrança. Se você gostaria que cobrasse o cliente imediatamente você pode usar o método 'swapAndInvoice':

```php
    $user->subscription()->swapAndInvoice(['price_chat', 'price_original' => 2]);
```

Você pode remover preços de assinaturas usando o método 'swap' e omitindo o preço que você deseja remover:

```php
    $user->subscription()->swap(['price_original' => 2]);
```

> [!ALERTA]
> Você não pode remover o último preço de uma assinatura. Em vez disso, você deve simplesmente cancelar a assinatura.

<a name="multiple-subscriptions"></a>
### Assinaturas Múltiplas

O Paddle permite que seus clientes tenham múltiplas assinaturas ao mesmo tempo. Por exemplo, você pode gerenciar uma academia que oferece um plano de natação e um plano de musculação, cada um com preços diferentes. Claro, os clientes devem ser capazes de se inscrever em qualquer ou ambos os planos.

Ao sua aplicação criar assinaturas, você pode fornecer o tipo da assinatura para a função subscribe como segundo argumento. O tipo pode ser qualquer string que represente o tipo de assinatura o usuário está iniciando:

```php
    use Illuminate\Http\Request;

    Route::post('/swimming/subscribe', function (Request $request) {
        $checkout = $request->user()->subscribe($swimmingMonthly = 'pri_123', 'swimming');

        return view('billing', ['checkout' => $checkout]);
    });
```

Neste exemplo, começamos um plano de associação mensal para o cliente. No entanto, eles podem querer mudar para uma associação anual em algum momento posterior. Ao ajustar a associação do cliente, podemos simplesmente trocar o preço na associação "natação":

```php
    $user->subscription('swimming')->swap($swimmingYearly = 'pri_456');
```

Claro, também pode cancelar a assinatura de vez:

```php
    $user->subscription('swimming')->cancel();
```

<a name="pausing-subscriptions"></a>
### Atrasos em Assinaturas

Para pausar uma assinatura, chame o método `pause` na assinatura do usuário:

```php
    $user->subscription()->pause();
```

Quando uma assinatura é pausada, o Cashier irá automaticamente definir a coluna `paused_at` no seu banco de dados. Esta coluna é usada para determinar quando o método `paused` deve começar a retornar `true`. Por exemplo, se um cliente pausa uma assinatura em 1º de março, mas a assinatura não foi programada para recorrer até 5 de março, o método `paused` continuará retornando `false` até 5 de março. Isto é porque normalmente é permitido que os usuários utilizem a aplicação até o fim do seu ciclo faturamento.

Por padrão, o pausa acontece no próximo intervalo de cobrança para que o cliente possa usar o restante do período pelo qual pagou. Se quiser pausar uma assinatura imediatamente, você pode usar o método 'pauseNow':

```php
    $user->subscription()->pauseNow();
```

Usando o método `pauseUntil`, você pode pausar a assinatura até um momento específico no tempo:

```php
    $user->subscription()->pauseUntil(now()->addMonth());
```

Ou, você pode usar o método `pauseNowUntil` para imediatamente pausar o subscricão até um ponto de tempo especificado:

```php
    $user->subscription()->pauseNowUntil(now()->addMonth());
```

Você pode determinar se um usuário pausou sua assinatura, mas ainda está no "período de carência" usando o método `onPausedGracePeriod`:

```php
    if ($user->subscription()->onPausedGracePeriod()) {
        // ...
    }
```

Para retomar uma assinatura em pausa, você pode invocar o método `resume` na assinatura:

```php
    $user->subscription()->resume();
```

> ¡ADVERTENCIA!
> Uma assinatura não pode ser modificada enquanto estiver em pausa. Se quiser alternar para um plano diferente ou atualizar as quantidades, você deve primeiro retomar a assinatura.

<a name="canceling-subscriptions"></a>
### Cancelamento de Assinaturas

Para cancelar uma assinatura, chame o método 'cancel' na assinatura do usuário:

```php
    $user->subscription()->cancel();
```

Quando uma assinatura é cancelada, o Caixa automaticamente define a coluna `ends_at` no seu banco de dados. Esta coluna é usada para determinar quando o método 'assinado' deve começar a retornar 'falso'. Por exemplo, se um cliente cancelar sua assinatura em 1o de março, mas a assinatura não estava programada para terminar até 5 de março, o método 'assinado' continuará a retornar 'verdadeiro' até 5 de março. Isto é feito porque um usuário geralmente pode continuar usando uma aplicação até o final do seu ciclo de cobrança.

Você pode determinar se um usuário cancelou sua assinatura mas ainda está no período de carência usando o método `onGracePeriod`:

```php
    if ($user->subscription()->onGracePeriod()) {
        // ...
    }
```

Se você deseja cancelar uma assinatura imediatamente, pode chamar o método 'cancelNow' na assinatura:

```php
    $user->subscription()->cancelNow();
```

Para parar um assinatura em seu período de carência de cancelamento, você pode invocar o método `stopCancelation`:

```php
    $user->subscription()->stopCancelation();
```

> [!Alerta]
> As assinaturas da Paddle não podem ser retomadas após a cancelamento. Se o cliente quiser retomar sua assinatura, ele terá que criar uma nova.

<a name="subscription-trials"></a>
## Testes de assinatura

<a name="with-payment-method-up-front"></a>
### Com Método de Pagamento Antecipado

Se você gostaria de oferecer períodos de teste para seus clientes e ainda coletar informações sobre o método de pagamento antecipadamente, você deve configurar um período de teste na tela do Paddle no preço ao qual seu cliente está se inscrevendo. Em seguida, inicie a sessão de checkout como de costume:

```php
    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $checkout = $request->user()->subscribe('pri_monthly')
                    ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Quando seu aplicativo recebe o evento "subscription_created", o Cashier irá definir a data de término do período de teste no registro da assinatura dentro do banco de dados do seu aplicativo e instruirá o Paddle a não iniciar a cobrança do cliente até após essa data.

> ¡¡ALERTA!
> Se o cliente não cancelar sua assinatura antes da data final do teste eles serão cobrados assim que o teste expirar, então você deve ter certeza de notificar seus usuários sobre a data final do teste.

Você pode determinar se o usuário está no período de teste usando tanto o método 'onTrial' da instância do usuário ou o método 'onTrial' da instância da assinatura. As duas exemplos abaixo são equivalentes:

```php
    if ($user->onTrial()) {
        // ...
    }

    if ($user->subscription()->onTrial()) {
        // ...
    }
```

Para determinar se um teste existente já expirou, você pode usar o método `hasExpiredTrial`:

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
### Sem Método de Pagamento Antecipado

Se quiser oferecer períodos de teste sem coletar informações sobre o método de pagamento do usuário antes, você pode definir a coluna 'trial_ends_at' no registro do cliente vinculado ao seu usuário para a data desejada do término do período de teste. Isso geralmente é feito durante o registro do usuário:

```php
    use App\Models\User;

    $user = User::create([
        // ...
    ]);

    $user->createAsCustomer([
        'trial_ends_at' => now()->addDays(10)
    ]);
```

O "Cashier" refere-se a este tipo de teste como um "teste genérico", pois ele não está vinculado a nenhuma assinatura existente. O método "onTrial" na instância "User" retornará "true" se a data atual for inferior ao valor de "trial_ends_at":

```php
    if ($user->onTrial()) {
        // User is within their trial period...
    }
```

Uma vez que você está pronto para criar uma assinatura real para o usuário, você pode usar o método 'subscribe' como de costume:

```php
    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $checkout = $user->subscribe('pri_monthly')
            ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Para recuperar a data de término da versão experimental do usuário, você pode usar o método 'trialEndsAt'. Este método retornará uma instância de Carbon se um usuário estiver em um teste ou 'null' se não estiver. Você também pode passar um parâmetro opcional tipo de assinatura se quiser obter a data de término da versão experimental para uma assinatura específica, além da padrão:

```php
    if ($user->onTrial('default')) {
        $trialEndsAt = $user->trialEndsAt();
    }
```

Você pode usar o método 'onGenericTrial' se quiser saber especificamente que o usuário está dentro de seu período de "teste genérico" e não criou uma assinatura real ainda:

```php
    if ($user->onGenericTrial()) {
        // User is within their "generic" trial period...
    }
```

<a name="extend-or-activate-a-trial"></a>
### Estender ou Ativar um Teste Gratuito

Você pode estender um período de teste existente em uma assinatura invocando o método `extendTrial` e especificando o momento no tempo que o teste deve terminar.

```php
    $user->subscription()->extendTrial(now()->addDays(5));
```

Ou você pode ativar imediatamente uma assinatura terminando seu teste por chamar o método 'ativar' na assinatura:

```php
    $user->subscription()->activate();
```

<a name="handling-paddle-webhooks"></a>
## Manipulando Webhooks do Paddle

O Paddle pode notificar seu aplicativo de uma variedade de eventos através de Webhooks. Por padrão, uma rota que aponta para o controlador do webhook do Cashier é registrada pelo provedor do serviço do Cashier. Este controlador irá lidar com todas as solicitações do webhook recebidas.

Por padrão, este controlador irá lidar automaticamente com cancelamentos de assinaturas que têm cobranças falhadas repetidas, atualizações de assinatura e alterações do método de pagamento; no entanto, como descobriremos logo abaixo, você pode estender esse controlador para lidar com qualquer evento webhook da Paddle que você deseja.

Para garantir que seu aplicativo possa lidar com webhooks do Paddle, certifique-se de [configurar a URL do webhook no painel de controle do Paddle](https://vendors.paddle.com/alerts-webhooks). Por padrão, o controlador do webhook do Cashier responde ao caminho da URL `/paddle/webhook`. A lista completa de todos os webhooks que você deve habilitar no painel de controle do Paddle são:

Cliente Atualizado
- Transação Concluída
- Transação Atualizada
- Assinatura Criada
- Assinatura Atualizada
- Assinatura pausada
Assinatura Cancelada

> [!AVISO]
> Tenha certeza de que você protege as requisições com a verificação de assinatura do webhook do Caixeiro [verificando assinaturas de webhook]/docs/{{version}}/.

<a name="webhooks-csrf-protection"></a>
#### Webhooks e Proteção CSRF

Como os webhooks do Paddle precisam contornar a proteção [CSRF] do Laravel (/docs/{{version}}/csrf), você deve garantir que o Laravel não tente verificar o token CSRF para os webhooks do Paddle. Para fazer isso, você deve excluir `paddle/*` da proteção CSRF no arquivo `bootstrap/app.php` do seu aplicativo:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'paddle/*',
        ]);
    })
```

<a name="webhooks-local-development"></a>
#### Webhooks e Desenvolvimento Local

Para que a Paddle possa enviar seus webhooks de aplicativo durante o desenvolvimento local, você precisará expor seu aplicativo por meio de um serviço compartilhador de sites, como [Ngrok](https://ngrok.com/) ou [Expose](https://expose.dev/docs/introduction). Se você estiver desenvolvendo seu aplicativo localmente usando [Laravel Sail](/docs/{{version}}/sail), você pode usar o comando de compartilhamento de site do Sail ([site sharing command](/docs/{{version}}/sail#sharing-your-site)).

<a name="defining-webhook-event-handlers"></a>
### Definindo Webhooks de Manipulação de Eventos

O atendente de caixa lida automaticamente com a anulação da assinatura no caso de cobrança fracassada e outros eventos comuns do Paddle. No entanto, se você tiver eventos webhooks adicionais que gostaria de lidar, pode fazê-lo ouvindo os seguintes eventos enviados pelo atendente de caixa:

- 'Laravel\Paddle\Events\WebhookReceived'
- `Laravel\Paddle\Events\WebhookHandled`

Ambos os eventos contêm o payload completo do webhook Paddle. Por exemplo, se você quiser lidar com o webhook 'transaction.billed', você pode registrar um [ouvinte](/docs/{{version}}/events#definição de ouvintes) que irá lidar com o evento:

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

O caixa também emite eventos dedicados ao tipo do webhook recebido. Além da carga completa do Paddle, eles também contêm os modelos relevantes que foram usados para processar o webhook, como o modelo de cobrança, a assinatura ou a recibo.

<div class="content-list" markdown="1">

- 'Laravel\Paddle\Events\CustomerUpdated'
- `Laravel/Paddle/Events/TransactionCompleted`
Laravel/Paddle/Events/TransactionUpdated
"Laravel/Paddle/Events/SubscriptionCreated"
- 'Laravel/Paddle/Events/SubscriptionUpdated'
- 'Laravel/Paddle/Events/SubscriptionPaused'
Laravel/Paddle/Events/SubscriptionCanceled

</div>

Você também pode substituir a rota padrão do webhook interna por definir a variável de ambiente "CASHIER_WEBHOOK" no arquivo ".env" da sua aplicação. Esse valor deve ser a URL completa para a rota do webhook e precisa corresponder à URL configurada no painel de controle do Paddle:

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a name="verifying-webhook-signatures"></a>
### Verificando assinaturas de Webhooks

Para garantir suas Webhooks, você pode usar as [Assinaturas de Webhook do Paddle](https://developer.paddle.com/webhook-reference/verifying-webhooks). Para mais conveniência, o Cashier automaticamente inclui um middleware que valida se a solicitação de webhook do Paddle que está chegando é válida.

Para habilitar a verificação de webhook, certifique-se de definir a variável de ambiente 'PADDLE_WEBHOOK_SECRET' no arquivo '.env' do seu aplicativo. O segredo do webhook pode ser obtido da sua conta Paddle dashboard.

<a name="single-charges"></a>
## Cargas Únicas

<a name="charging-for-products"></a>
### Empréstimo de Produtos

Se você quiser iniciar uma compra de produto para um cliente, pode usar o método "checkout" em uma instância de modelo cobrável para gerar uma sessão de checkout para a compra. O método "checkout" aceita um ou vários IDs de preço. Se necessário, uma matriz associativa pode ser usada para fornecer a quantidade do produto sendo comprado:

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $request->user()->checkout(['pri_tshirt', 'pri_socks' => 5]);

        return view('buy', ['checkout' => $checkout]);
    });
```

Depois de gerar a sessão de pagamento, você pode usar o botão fornecido pelo Caixa para permitir que o usuário veja o widget do Pagamento e conclua a compra:

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy
</x-paddle-button>
```

Uma sessão de checkout tem um método `customData`, permitindo que você passe qualquer dados personalizado desejado para a criação subjacente da transação. Por favor consulte [a documentação do Paddle](https://developer.paddle.com/build/transactions/custom-data) para aprender mais sobre as opções disponíveis para você quando passando dados personalizados:

```php
    $checkout = $user->checkout('pri_tshirt')
        ->customData([
            'custom_option' => $value,
        ]);
```

<a name="refunding-transactions"></a>
### Refundações de Transações

Ao realizar o reembolso de uma transação, o valor será devolvido para o método de pagamento do cliente que foi utilizado no momento da compra. Se você precisa reembolsar uma transação Paddle, você pode utilizar a 'refund' em um modelo 'Cashier\Paddle\Transaction'. Esse método aceita o motivo como o primeiro argumento, um ou mais IDs de preços para reembolso com valores opcionais em uma matriz associativa. Você pode recuperar as transações de um modelo cobrável específico usando o método 'transactions'.

Por exemplo, imagine que queremos estornar uma transação específica para os preços 'pri_123' e 'pri_456'. Queremos estornar totalmente o 'pri_123', mas apenas devolver 2 dólares para o 'pri_456':

```php
    use App\Models\User;

    $user = User::find(1);

    $transaction = $user->transactions()->first();

    $response = $transaction->refund('Accidental charge', [
        'pri_123', // Fully refund this price...
        'pri_456' => 200, // Only partially refund this price...
    ]);
```

O exemplo acima reembolsa itens específicos em uma transação. Se você deseja reembolsar a transação inteira, basta fornecer um motivo:

```php
    $response = $transaction->refund('Accidental charge');
```

Para mais informações sobre os reembolsos, por favor consulte [a documentação de reembolso do Paddle](https://developer.paddle.com/build/transactions/create-transaction-adjustments).

> [AVISO]
> Os reembolsos devem ser sempre aprovados pela Paddle antes de processar completamente.

<a name="crediting-transactions"></a>
### Transações de crédito

Assim como em reembolsos, você também pode fazer a liberação de transações. A liberação de transações acrescenta os fundos no saldo do cliente para que ele possa ser utilizado para compras futuras. A liberação de transações só pode ser feita para transações coletadas manualmente e não para transações coletadas automaticamente (como assinaturas) porque o Paddle libera as assinaturas automaticamente:

```php
    $transaction = $user->transactions()->first();

    // Credit a specific line item fully...
    $response = $transaction->credit('Compensation', 'pri_123');
```

Para mais informações, veja a documentação do Paddle sobre créditos (https://developer.paddle.com/build/transactions/create-transaction-adjustments).

> [AVERTÊNCIA]
> Os créditos só podem ser aplicados manualmente para transações coletadas manualmente. As transações coletadas automaticamente são creditadas pelo próprio Paddle.

<a name="transactions"></a>
## Transações

Você pode facilmente recuperar uma matriz de transações de um modelo cobrável através da propriedade "transações":

```php
    use App\Models\User;

    $user = User::find(1);

    $transactions = $user->transactions;
```

Transações representam pagamentos para seus produtos e compras e são acompanhadas de notas fiscais. Apenas as transações concluídas são armazenadas no banco de dados do seu aplicativo.

Quando estiver listando as transações de um cliente, você pode usar os métodos da classe Transaction para exibir as informações pagas. Por exemplo, você talvez queira listar todas as transações em uma tabela, permitindo ao usuário baixar facilmente qualquer um dos recibos:

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

A rota de download-fatura pode parecer o seguinte:

use Illuminate\Http\Request;
use Laravel\Cashier\Transaction;

Route::get('/download-invoice/{transação}', função (Solicitação $solicitação, Transação $transação) {
return $transaction->redirectToInvoicePdf();
}->nome('download-invoice');

<a name="past-and-upcoming-payments"></a>
### Pagamentos Passados e Futuros

Você pode usar os métodos lastPayment e nextPayment para recuperar e exibir pagamentos passados ou futuros de assinaturas recorrentes.

```php
    use App\Models\User;

    $user = User::find(1);

    $subscription = $user->subscription();

    $lastPayment = $subscription->lastPayment();
    $nextPayment = $subscription->nextPayment();
```

Ambos os métodos retornam uma instância de Laravel\Paddle\Payment; No entanto, "lastPayment" retornará um valor nulo quando as transações ainda não tiverem sido sincronizadas pelo webhook, enquanto "nextPayment" retornará um valor nulo quando o ciclo de cobrança tiver terminado (como quando uma assinatura é cancelada):

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a name="testing"></a>
## Teste

Ao testar, você deve testar manualmente o fluxo de cobrança para ter certeza de que a integração funciona conforme esperado.

Para testes automatizados, incluindo aqueles executados dentro de um ambiente CI, você pode usar [Laravel' HTTP Client](/docs/{{version}}/http-client#testing) para simular chamadas HTTP feitas ao Paddle. Embora isso não teste as respostas reais do Paddle, fornece uma maneira de testar seu aplicativo sem realmente chamar a API do Paddle.
