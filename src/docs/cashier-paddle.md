# Laravel Cashier (Paddle)

<a name="introduction"></a>
## Introdução

::: warning AVISO
Esta documentação é para a integração do Cashier Paddle 2.x com o Paddle Billing. Se você ainda estiver usando o Paddle Classic, você deve usar o [Cashier Paddle 1.x](https://github.com/laravel/cashier-paddle/tree/1.x).
:::

[O Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle) fornece uma interface expressiva e fluente para os serviços de cobrança de assinatura do [Paddle](https://paddle.com). Ele lida com quase todo o código de cobrança de assinatura clichê que você está temendo. Além do gerenciamento básico de assinatura, o Cashier pode lidar com: troca de assinaturas, "quantidades" de assinatura, pausa de assinatura, períodos de carência de cancelamento e muito mais.

Antes de se aprofundar no Cashier Paddle, recomendamos que você também revise os [guias de conceito](https://developer.paddle.com/concepts/overview) e a [documentação da API](https://developer.paddle.com/api-reference/overview) do Paddle.

<a name="upgrading-cashier"></a>
## Atualizando o Cashier

Ao atualizar para uma nova versão do Cashier, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md).

<a name="installation"></a>
## Instalação

Primeiro, instale o pacote Cashier para Paddle usando o gerenciador de pacotes Composer:

```shell
composer require laravel/cashier-paddle
```

Em seguida, você deve publicar os arquivos de migração do Cashier usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Então, você deve executar as migrações de banco de dados do seu aplicativo. As migrações do Cashier criarão uma nova tabela `customers`. Além disso, novas tabelas `subscriptions` e `subscription_items` serão criadas para armazenar todas as assinaturas do seu cliente. Por fim, uma nova tabela `transactions` será criada para armazenar todas as transações do Paddle associadas aos seus clientes:

```shell
php artisan migrate
```

::: warning AVISO
Para garantir que o Cashier manipule corretamente todos os eventos do Paddle, lembre-se de [configurar o tratamento do webhook do Cashier](#handling-paddle-webhooks).
:::

<a name="paddle-sandbox"></a>
### Paddle Sandbox

Durante o desenvolvimento local e de preparação, você deve [registrar uma conta do Paddle Sandbox](https://sandbox-login.paddle.com/signup). Esta conta fornecerá um ambiente de sandbox para testar e desenvolver seus aplicativos sem fazer pagamentos reais. Você pode usar os [números de cartão de teste](https://developer.paddle.com/concepts/payment-methods/credit-debit-card) do Paddle para simular vários cenários de pagamento.

Ao usar o ambiente Paddle Sandbox, você deve definir a variável de ambiente `PADDLE_SANDBOX` como `true` no arquivo `.env` do seu aplicativo:

```ini
PADDLE_SANDBOX=true
```

Após terminar de desenvolver seu aplicativo, você pode [solicitar uma conta de fornecedor Paddle](https://paddle.com). Antes que seu aplicativo seja colocado em produção, o Paddle precisará aprovar o domínio do seu aplicativo.

<a name="configuration"></a>
## Configuração

<a name="billable-model"></a>
### Modelo Faturável

Antes de usar o Cashier, você deve adicionar o traço `Billable` à definição do seu modelo de usuário. Este traço fornece vários métodos para permitir que você execute tarefas comuns de cobrança, como criar assinaturas e atualizar informações de método de pagamento:

```php
    use Laravel\Paddle\Billable;

    class User extends Authenticatable
    {
        use Billable;
    }
```

Se você tiver entidades faturáveis ​​que não sejam usuários, você também pode adicionar o traço a essas classes:

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

Em seguida, você deve configurar suas chaves do Paddle no arquivo `.env` do seu aplicativo. Você pode recuperar suas chaves de API do Paddle no painel de controle do Paddle:

```ini
PADDLE_CLIENT_SIDE_TOKEN=your-paddle-client-side-token
PADDLE_API_KEY=your-paddle-api-key
PADDLE_RETAIN_KEY=your-paddle-retain-key
PADDLE_WEBHOOK_SECRET="your-paddle-webhook-secret"
PADDLE_SANDBOX=true
```

A variável de ambiente `PADDLE_SANDBOX` deve ser definida como `true` quando você estiver usando [o ambiente Sandbox do Paddle](#paddle-sandbox). A variável `PADDLE_SANDBOX` deve ser definida como `false` se você estiver implantando seu aplicativo em produção e estiver usando o ambiente de fornecedor ativo do Paddle.

O `PADDLE_RETAIN_KEY` é opcional e só deve ser definido se você estiver usando o Paddle com [Retain](https://developer.paddle.com/paddlejs/retain).

<a name="paddle-js"></a>
### Paddle JS

O Paddle depende de sua própria biblioteca JavaScript para iniciar o widget de checkout do Paddle. Você pode carregar a biblioteca JavaScript colocando a diretiva Blade `@paddleJS` logo antes da tag `</head>` de fechamento do layout do seu aplicativo:

```blade
<head>
    ...

    @paddleJS
</head>
```

<a name="currency-configuration"></a>
### Configuração de moeda

Você pode especificar uma localidade a ser usada ao formatar valores monetários para exibição em faturas. Internamente, o Cashier utiliza [a classe `NumberFormatter` do PHP](https://www.php.net/manual/en/class.numberformatter.php) para definir a localidade da moeda:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

::: warning AVISO
Para usar localidades diferentes de `en`, certifique-se de que a extensão PHP `ext-intl` esteja instalada e configurada no seu servidor.
:::

<a name="overriding-default-models"></a>
### Substituindo modelos padrão

Você tem liberdade para estender os modelos usados ​​internamente pelo Cashier definindo seu próprio modelo e estendendo o modelo correspondente do Cashier:

```php
    use Laravel\Paddle\Subscription as CashierSubscription;

    class Subscription extends CashierSubscription
    {
        // ...
    }
```

Após definir seu modelo, você pode instruir o Cashier a usar seu modelo personalizado por meio da classe `Laravel\Paddle\Cashier`. Normalmente, você deve informar o Cashier sobre seus modelos personalizados no método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    use App\Models\Cashier\Subscription;
    use App\Models\Cashier\Transaction;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Cashier::useSubscriptionModel(Subscription::class);
        Cashier::useTransactionModel(Transaction::class);
    }
```

<a name="quickstart"></a>
## Início rápido

<a name="quickstart-selling-products"></a>
### Vendendo produtos

::: info NOTA
Antes de utilizar o Paddle Checkout, você deve definir produtos com preços fixos no seu painel Paddle. Além disso, você deve [configurar o tratamento de webhook do Paddle](#handling-paddle-webhooks).
:::

Oferecer faturamento de produtos e assinaturas por meio do seu aplicativo pode ser intimidador. No entanto, graças ao Cashier e ao [Paddle's Checkout Overlay](https://www.paddle.com/billing/checkout), você pode facilmente criar integrações de pagamento modernas e robustas.

Para cobrar clientes por produtos não recorrentes e de cobrança única, utilizaremos o Cashier para cobrar clientes com o Paddle's Checkout Overlay, onde eles fornecerão seus detalhes de pagamento e confirmarão sua compra. Depois que o pagamento for feito por meio do Checkout Overlay, o cliente será redirecionado para uma URL de sucesso de sua escolha em seu aplicativo:

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $request->user()->checkout('pri_deluxe_album')
            ->returnTo(route('dashboard'));

        return view('buy', ['checkout' => $checkout]);
    })->name('checkout');
```

Como você pode ver no exemplo acima, utilizaremos o método `checkout` fornecido pelo Cashier para criar um objeto de checkout para apresentar ao cliente o Paddle Checkout Overlay para um determinado "identificador de preço". Ao usar o Paddle, "preços" referem-se a [preços definidos para produtos específicos](https://developer.paddle.com/build/products/create-products-prices).

Se necessário, o método `checkout` criará automaticamente um cliente no Paddle e conectará esse registro de cliente do Paddle ao usuário correspondente no banco de dados do seu aplicativo. Após concluir a sessão de checkout, o cliente será redirecionado para uma página de sucesso dedicada, onde você pode exibir uma mensagem informativa para o cliente.

Na visualização `buy`, incluiremos um botão para exibir a sobreposição de checkout. O componente Blade `paddle-button` está incluído no Cashier Paddle; no entanto, você também pode [renderizar manualmente um checkout de sobreposição](#manually-rendering-an-overlay-checkout):

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy Product
</x-paddle-button>
```

<a name="providing-meta-data-to-paddle-checkout"></a>
#### Fornecendo Metadados para Paddle Checkout

Ao vender produtos, é comum manter o controle de pedidos concluídos e produtos comprados por meio dos modelos `Cart` e `Order` definidos pelo seu próprio aplicativo. Ao redirecionar clientes para o Paddle's Checkout Overlay para concluir uma compra, pode ser necessário fornecer um identificador de pedido existente para que você possa associar a compra concluída ao pedido correspondente quando o cliente for redirecionado de volta para seu aplicativo.

Para fazer isso, você pode fornecer uma matriz de dados personalizados para o método `checkout`. Vamos imaginar que um `Order` pendente é criado em nosso aplicativo quando um usuário inicia o processo de checkout. Lembre-se, os modelos `Cart` e `Order` neste exemplo são ilustrativos e não fornecidos pelo Cashier. Você é livre para implementar esses conceitos com base nas necessidades do seu próprio aplicativo:

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

Como você pode ver no exemplo acima, quando um usuário inicia o processo de checkout, forneceremos todos os identificadores de preço Paddle associados ao carrinho/pedido para o método `checkout`. Claro, seu aplicativo é responsável por associar esses itens ao "carrinho de compras" ou pedido conforme um cliente os adiciona. Também fornecemos o ID do pedido para o Paddle Checkout Overlay por meio do método `customData`.

Claro, você provavelmente desejará marcar o pedido como "concluído" assim que o cliente tiver concluído o processo de checkout. Para fazer isso, você pode ouvir os webhooks despachados pelo Paddle e gerados por meio de eventos pelo Cashier para armazenar informações do pedido em seu banco de dados.

Para começar, ouça o evento `TransactionCompleted` despachado pelo Cashier. Normalmente, você deve registrar o ouvinte de eventos no método `boot` do `AppServiceProvider` do seu aplicativo:

```php
    use App\Listeners\CompleteOrder;
    use Illuminate\Support\Facades\Event;
    use Laravel\Paddle\Events\TransactionCompleted;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Event::listen(TransactionCompleted::class, CompleteOrder::class);
    }
```

Neste exemplo, o ouvinte `CompleteOrder` pode se parecer com o seguinte:

```php
    namespace App\Listeners;

    use App\Models\Order;
    use Laravel\Cashier\Cashier;
    use Laravel\Cashier\Events\TransactionCompleted;

    class CompleteOrder
    {
        /**
         * Manipule o evento de webhook do Caixa de entrada.
         */
        public function handle(TransactionCompleted $event): void
        {
            $orderId = $event->payload['data']['custom_data']['order_id'] ?? null;

            $order = Order::findOrFail($orderId);

            $order->update(['status' => 'completed']);
        }
    }
```

Consulte a documentação do Paddle para obter mais informações sobre os [dados contidos pelo evento `transaction.completed`](https://developer.paddle.com/webhooks/transactions/transaction-completed).

<a name="quickstart-selling-subscriptions"></a>
### Vendendo assinaturas

::: info NOTA
Antes de utilizar o Paddle Checkout, você deve definir produtos com preços fixos no seu painel do Paddle. Além disso, você deve [configurar o tratamento de webhook do Paddle](#handling-paddle-webhooks).
:::

Oferecer faturamento de produtos e assinaturas por meio do seu aplicativo pode ser intimidador. No entanto, graças ao Cashier e ao [Paddle's Checkout Overlay](https://www.paddle.com/billing/checkout), você pode facilmente criar integrações de pagamento modernas e robustas.

Para aprender a vender assinaturas usando o Cashier e o Paddle's Checkout Overlay, vamos considerar o cenário simples de um serviço de assinatura com um plano mensal básico (`price_basic_monthly`) e anual (`price_basic_yearly`). Esses dois preços podem ser agrupados em um produto "Básico" (`pro_basic`) em nosso painel Paddle. Além disso, nosso serviço de assinatura pode oferecer um plano Expert como `pro_expert`.

Primeiro, vamos descobrir como um cliente pode assinar nossos serviços. Claro, você pode imaginar que o cliente pode clicar em um botão "assinar" para o plano Básico na página de preços do nosso aplicativo. Este botão invocará um Paddle Checkout Overlay para o plano escolhido. Para começar, vamos iniciar uma sessão de checkout por meio do método `checkout`:

```php
    use Illuminate\Http\Request;

    Route::get('/subscribe', function (Request $request) {
        $checkout = $request->user()->checkout('price_basic_monthly')
            ->returnTo(route('dashboard'));

        return view('subscribe', ['checkout' => $checkout]);
    })->name('subscribe');
```

Na visualização `subscribe`, incluiremos um botão para exibir a sobreposição de checkout. O componente Blade `paddle-button` está incluído no Cashier Paddle; no entanto, você também pode [renderizar manualmente um checkout de sobreposição](#manually-rendering-an-overlay-checkout):

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Agora, quando o botão Subscribe for clicado, o cliente poderá inserir seus detalhes de pagamento e iniciar sua assinatura. Para saber quando sua assinatura realmente começou (já que alguns métodos de pagamento exigem alguns segundos para serem processados), você também deve [configurar o tratamento do webhook do Cashier](#handling-paddle-webhooks).

Agora que os clientes podem iniciar assinaturas, precisamos restringir certas partes do nosso aplicativo para que apenas usuários inscritos possam acessá-las. Claro, sempre podemos determinar o status de assinatura atual de um usuário por meio do método `subscribed` fornecido pelo traço `Billable` do Cashier:

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
#### Construindo um Middleware Assinado

Por conveniência, você pode criar um [middleware](/docs/middleware) que determina se a solicitação de entrada é de um usuário inscrito. Depois que esse middleware for definido, você pode facilmente atribuí-lo a uma rota para impedir que usuários não inscritos acessem a rota:

```php
    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    class Subscribed
    {
        /**
         * Lidar com uma solicitação recebida.
         */
        public function handle(Request $request, Closure $next): Response
        {
            if (! $request->user()?->subscribed()) {
                // Redirecione o usuário para a página de cobrança e peça para ele assinar...
                return redirect('/subscribe');
            }

            return $next($request);
        }
    }
```

Depois que o middleware for definido, você pode atribuí-lo a uma rota:

```php
    use App\Http\Middleware\Subscribed;

    Route::get('/dashboard', function () {
        // ...
    })->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### Permitindo que os clientes gerenciem seu plano de cobrança

É claro que os clientes podem querer alterar seu plano de assinatura para outro produto ou "nível". Em nosso exemplo acima, gostaríamos de permitir que o cliente alterasse seu plano de uma assinatura mensal para uma assinatura anual. Para isso, você precisará implementar algo como um botão que leva à rota abaixo:

```php
    use Illuminate\Http\Request;

    Route::put('/subscription/{price}/swap', function (Request $request, $price) {
        $user->subscription()->swap($price); // With "$price" being "price_basic_yearly" for this example.

        return redirect()->route('dashboard');
    })->name('subscription.swap');
```

Além de trocar planos, você também precisará permitir que seus clientes cancelem suas assinaturas. Assim como na troca de planos, forneça um botão que leva à seguinte rota:

```php
    use Illuminate\Http\Request;

    Route::put('/subscription/cancel', function (Request $request, $price) {
        $user->subscription()->cancel();

        return redirect()->route('dashboard');
    })->name('subscription.cancel');
```

E agora sua assinatura será cancelada no final do período de cobrança.

::: info NOTA
Contanto que você tenha configurado o tratamento de webhook do Cashier, o Cashier manterá automaticamente as tabelas de banco de dados relacionadas ao Cashier do seu aplicativo em sincronia, inspecionando os webhooks de entrada do Paddle. Então, por exemplo, quando você cancela a assinatura de um cliente por meio do painel do Paddle, o Cashier receberá o webhook correspondente e marcará a assinatura como "cancelada" no banco de dados do seu aplicativo.
:::

<a name="checkout-sessions"></a>
## Sessões de Checkout

A maioria das operações para faturar clientes é realizada usando "checkouts" via [widget Checkout Overlay](https://developer.paddle.com/build/checkout/build-overlay-checkout) do Paddle ou utilizando [checkout inline](https://developer.paddle.com/build/checkout/build-branded-inline-checkout).

Antes de processar pagamentos de checkout usando o Paddle, você deve definir o [link de pagamento padrão](https://developer.paddle.com/build/transactions/default-payment-link#set-default-link) do seu aplicativo no painel de configurações de checkout do Paddle.

<a name="overlay-checkout"></a>
### Checkout Overlay

Antes de exibir o widget Checkout Overlay, você deve gerar uma sessão de checkout usando o Cashier. Uma sessão de checkout informará o widget de checkout sobre a operação de cobrança que deve ser realizada:

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

O caixa inclui um `paddle-button` [componente Blade](/docs/blade#components). Você pode passar a sessão de checkout para este componente como um "prop". Então, quando este botão for clicado, o widget de checkout do Paddle será exibido:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Por padrão, isso exibirá o widget usando o estilo padrão do Paddle. Você pode personalizar o widget adicionando [atributos suportados pelo Paddle](https://developer.paddle.com/paddlejs/html-data-attributes) como o atributo `data-theme='light'` ao componente:

```html
<x-paddle-button :url="$payLink" class="px-8 py-4" data-theme="light">
    Subscribe
</x-paddle-button>
```

O widget de checkout do Paddle é assíncrono. Depois que o usuário cria uma assinatura dentro do widget, o Paddle enviará um webhook ao seu aplicativo para que você possa atualizar corretamente o estado da assinatura no banco de dados do seu aplicativo. Portanto, é importante que você [configure os webhooks](#handling-paddle-webhooks) corretamente para acomodar as mudanças de estado do Paddle.

::: warning AVISO
Após uma mudança de estado da assinatura, o atraso para receber o webhook correspondente é normalmente mínimo, mas você deve levar isso em conta no seu aplicativo, considerando que a assinatura do seu usuário pode não estar imediatamente disponível após a conclusão do checkout.
:::

<a name="manually-rendering-an-overlay-checkout"></a>
#### Renderizando manualmente um checkout de sobreposição

Você também pode renderizar manualmente um checkout de sobreposição sem usar os componentes Blade integrados do Laravel. Para começar, gere a sessão de checkout [conforme demonstrado nos exemplos anteriores](#overlay-checkout):

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Em seguida, você pode usar o Paddle.js para inicializar o checkout. Neste exemplo, criaremos um link que é atribuído à classe `paddle_button`. O Paddle.js detectará essa classe e exibirá o checkout de sobreposição quando o link for clicado:

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
### Checkout em linha

Se você não quiser usar o widget de checkout estilo "overlay" do Paddle, o Paddle também fornece a opção de exibir o widget em linha. Embora essa abordagem não permita que você ajuste nenhum dos campos HTML do checkout, ela permite que você incorpore o widget em seu aplicativo.

Para facilitar o início do checkout em linha, o Cashier inclui um componente Blade `paddle-checkout`. Para começar, você deve [gerar uma sessão de checkout](#overlay-checkout):

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Então, você pode passar a sessão de checkout para o atributo `checkout` do componente:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" />
```

Para ajustar a altura do componente de checkout em linha, você pode passar o atributo `height` para o componente Blade:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" height="500" />
```

Consulte o [guia sobre checkout em linha](https://developer.paddle.com/build/checkout/build-branded-inline-checkout) e as [configurações de checkout disponíveis](https://developer.paddle.com/build/checkout/set-up-checkout-default-settings) do Paddle para obter mais detalhes sobre as opções de personalização do checkout em linha.

<a name="manually-rendering-an-inline-checkout"></a>
#### Renderizando manualmente um checkout em linha

Você também pode renderizar manualmente um checkout em linha sem usar os componentes Blade integrados do Laravel. Para começar, gere a sessão de checkout [conforme demonstrado nos exemplos anteriores](#inline-checkout):

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $user->checkout('pri_34567')
            ->returnTo(route('dashboard'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Em seguida, você pode usar Paddle.js para inicializar o checkout. Neste exemplo, demonstraremos isso usando [Alpine.js](https://github.com/alpinejs/alpine); no entanto, você está livre para modificar este exemplo para sua própria pilha de frontend:

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
### Checkouts de convidados

Às vezes, pode ser necessário criar uma sessão de checkout para usuários que não precisam de uma conta com seu aplicativo. Para fazer isso, você pode usar o método `guest`:

```php
    use Illuminate\Http\Request;
    use Laravel\Paddle\Checkout;

    Route::get('/buy', function (Request $request) {
        $checkout = Checkout::guest('pri_34567')
            ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Então, você pode fornecer a sessão de checkout para os componentes [botão Paddle](#overlay-checkout) ou [checkout inline](#inline-checkout) Blade.

<a name="price-previews"></a>
## Prévias de preço

O Paddle permite que você personalize preços por moeda, essencialmente permitindo que você configure preços diferentes para países diferentes. O Cashier Paddle permite que você recupere todos esses preços usando o método `previewPrices`. Este método aceita os IDs de preço para os quais você deseja recuperar preços:

```php
    use Laravel\Paddle\Cashier;

    $prices = Cashier::previewPrices(['pri_123', 'pri_456']);
```

A moeda será determinada com base no endereço IP da solicitação; no entanto, você pode opcionalmente fornecer um país específico para recuperar preços para:

```php
    use Laravel\Paddle\Cashier;

    $prices = Cashier::previewPrices(['pri_123', 'pri_456'], ['address' => [
        'country_code' => 'BE',
        'postal_code' => '1234',
    ]]);
```

Após recuperar os preços, você pode exibi-los como desejar:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

Você também pode exibir o preço do subtotal e o valor do imposto separadamente:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->subtotal() }} (+ {{ $price->tax() }} tax)</li>
    @endforeach
</ul>
```

Para mais informações, [confira a documentação da API do Paddle sobre as prévias de preços](https://developer.paddle.com/api-reference/pricing-preview/preview-prices).

<a name="customer-price-previews"></a>
### Prévias de preços do cliente

Se um usuário já for um cliente e você quiser exibir os preços que se aplicam a esse cliente, você pode fazer isso recuperando os preços diretamente da instância do cliente:

```php
    use App\Models\User;

    $prices = User::find(1)->previewPrices(['pri_123', 'pri_456']);
```

Internamente, o Cashier usará o ID do cliente do usuário para recuperar os preços em sua moeda. Então, por exemplo, um usuário que mora nos Estados Unidos verá os preços em dólares americanos, enquanto um usuário na Bélgica verá os preços em euros. Se nenhuma moeda correspondente for encontrada, a moeda padrão do produto será usada. Você pode personalizar todos os preços de um produto ou plano de assinatura no painel de controle do Paddle.

<a name="price-discounts"></a>
### Descontos

Você também pode escolher exibir os preços após um desconto. Ao chamar o método `previewPrices`, você fornece o ID do desconto por meio da opção `discount_id`:

```php
    use Laravel\Paddle\Cashier;

    $prices = Cashier::previewPrices(['pri_123', 'pri_456'], [
        'discount_id' => 'dsc_123'
    ]);
```

Então, exiba os preços calculados:

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
### Padrões do cliente

O Cashier permite que você defina alguns padrões úteis para seus clientes ao criar sessões de checkout. Definir esses padrões permite que você preencha previamente o endereço de e-mail e o nome de um cliente para que ele possa passar imediatamente para a parte de pagamento do widget de checkout. Você pode definir esses padrões substituindo os seguintes métodos em seu modelo faturável:

```php
    /**
     * Obtenha o nome do cliente para associar ao Paddle.
     */
    public function paddleName(): string|null
    {
        return $this->name;
    }

    /**
     * Obtenha o endereço de e-mail do cliente para associar ao Paddle.
     */
    public function paddleEmail(): string|null
    {
        return $this->email;
    }
```

Esses padrões serão usados ​​para cada ação no Cashier que gera uma [sessão de checkout](#checkout-sessions).

<a name="retrieving-customers"></a>
### Recuperando clientes

Você pode recuperar um cliente pelo ID do cliente Paddle usando o método `Cashier::findBillable`. Este método retornará uma instância do modelo faturável:

```php
    use Laravel\Cashier\Cashier;

    $user = Cashier::findBillable($customerId);
```

<a name="creating-customers"></a>
### Criando clientes

Ocasionalmente, você pode desejar criar um cliente Paddle sem iniciar uma assinatura. Você pode fazer isso usando o método `createAsCustomer`:

```php
    $customer = $user->createAsCustomer();
```

Uma instância de `Laravel\Paddle\Customer` é retornada. Depois que o cliente for criado no Paddle, você pode iniciar uma assinatura em uma data posterior. Você pode fornecer um array opcional `$options` para passar quaisquer [parâmetros de criação de clientes adicionais que sejam suportados pela API Paddle](https://developer.paddle.com/api-reference/customers/create-customer):

```php
    $customer = $user->createAsCustomer($options);
```

<a name="subscriptions"></a>
## Assinaturas

<a name="creating-subscriptions"></a>
### Criando Assinaturas

Para criar uma assinatura, primeiro recupere uma instância do seu modelo faturável do seu banco de dados, que normalmente será uma instância de `App\Models\User`. Depois de recuperar a instância do modelo, você pode usar o método `subscribe` para criar a sessão de checkout do modelo:

```php
    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $checkout = $request->user()->subscribe($premium = 12345, 'default')
            ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

O primeiro argumento fornecido ao método `subscribe` é o preço específico que o usuário está assinando. Este valor deve corresponder ao identificador do preço no Paddle. O método `returnTo` aceita uma URL para a qual seu usuário será redirecionado após concluir com sucesso o checkout. O segundo argumento passado para o método `subscribe` deve ser o "tipo" interno da assinatura. Se seu aplicativo oferecer apenas uma única assinatura, você pode chamar isso de `default` ou `primary`. Este tipo de assinatura é apenas para uso interno do aplicativo e não deve ser exibido aos usuários. Além disso, ele não deve conter espaços e nunca deve ser alterado após a criação da assinatura.

Você também pode fornecer uma matriz de metadados personalizados sobre a assinatura usando o método `customData`:

```php
    $checkout = $request->user()->subscribe($premium = 12345, 'default')
        ->customData(['key' => 'value'])
        ->returnTo(route('home'));
```

Depois que uma sessão de checkout de assinatura for criada, a sessão de checkout pode ser fornecida ao `paddle-button` [componente Blade](#overlay-checkout) que está incluído no Cashier Paddle:

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Após o usuário concluir o checkout, um webhook `subscription_created` será despachado do Paddle. O caixa receberá este webhook e configurará a assinatura para seu cliente. Para garantir que todos os webhooks sejam recebidos e manipulados adequadamente por seu aplicativo, certifique-se de ter [configurado o manuseio do webhook](#handling-paddle-webhooks) adequadamente.

<a name="checking-subscription-status"></a>
### Verificando o status da assinatura

Depois que um usuário é inscrito em seu aplicativo, você pode verificar o status da assinatura usando uma variedade de métodos convenientes. Primeiro, o método `subscribed` retorna `true` se o usuário tiver uma assinatura válida, mesmo que a assinatura esteja atualmente dentro do período de teste:

```php
    if ($user->subscribed()) {
        // ...
    }
```

Se seu aplicativo oferece várias assinaturas, você pode especificar a assinatura ao invocar o método `subscribed`:

```php
    if ($user->subscribed('default')) {
        // ...
    }
```

O método `subscribed` também é um ótimo candidato para um [middleware de rota](/docs/middleware), permitindo que você filtre o acesso a rotas e controladores com base no status da assinatura do usuário:

```php
    <?php

    namespace App\Http\Middleware;

    use Closure;
    use Illuminate\Http\Request;
    use Symfony\Component\HttpFoundation\Response;

    class EnsureUserIsSubscribed
    {
        /**
         * Lidar com uma solicitação recebida.
         *
         * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
         */
        public function handle(Request $request, Closure $next): Response
        {
            if ($request->user() && ! $request->user()->subscribed()) {
                // Este usuário não é um cliente pagante...
                return redirect('billing');
            }

            return $next($request);
        }
    }
```

Se você quiser determinar se um usuário ainda está dentro do período de teste, você pode usar o método `onTrial`. Este método pode ser útil para determinar se você deve exibir um aviso ao usuário de que ele ainda está no período de teste:

```php
    if ($user->subscription()->onTrial()) {
        // ...
    }
```

O método `subscribedToPrice` pode ser usado para determinar se o usuário está inscrito em um determinado plano com base em um determinado ID de preço do Paddle. Neste exemplo, determinaremos se a assinatura `default` do usuário está ativamente inscrita no preço mensal:

```php
    if ($user->subscribedToPrice($monthly = 'pri_123', 'default')) {
        // ...
    }
```

O método `recurring` pode ser usado para determinar se o usuário está atualmente em uma assinatura ativa e não está mais em seu período de teste ou em um período de carência:

```php
    if ($user->subscription()->recurring()) {
        // ...
    }
```

<a name="canceled-subscription-status"></a>
#### Status de assinatura cancelada

Para determinar se o usuário já foi um assinante ativo, mas cancelou sua assinatura, você pode usar o método `canceled`:

```php
    if ($user->subscription()->canceled()) {
        // ...
    }
```

Você também pode determinar se um usuário cancelou sua assinatura, mas ainda está em seu "período de carência" até que a assinatura expire completamente. Por exemplo, se um usuário cancelar uma assinatura em 5 de março que estava originalmente programada para expirar em 10 de março, o usuário estará em seu "período de carência" até 10 de março. Além disso, o método `subscribed` ainda retornará `true` durante esse período:

```php
    if ($user->subscription()->onGracePeriod()) {
        // ...
    }
```

<a name="past-due-status"></a>
#### Status de vencido

Se um pagamento falhar para uma assinatura, ele será marcado como `past_due`. Quando sua assinatura estiver neste estado, ela não estará ativa até que o cliente atualize suas informações de pagamento. Você pode determinar se uma assinatura está vencida usando o método `pastDue` na instância da assinatura:

```php
    if ($user->subscription()->pastDue()) {
        // ...
    }
```

Quando uma assinatura está vencida, você deve instruir o usuário a [atualizar suas informações de pagamento](#updating-payment-information).

Se você quiser que as assinaturas ainda sejam consideradas válidas quando estiverem `past_due`, você pode usar o método `keepPastDueSubscriptionsActive` fornecido pelo Cashier. Normalmente, esse método deve ser chamado no método `register` do seu `AppServiceProvider`:

```php
    use Laravel\Paddle\Cashier;

    /**
     * Registre quaisquer serviços de aplicação.
     */
    public function register(): void
    {
        Cashier::keepPastDueSubscriptionsActive();
    }
```

::: warning ATENÇÃO
Quando uma assinatura está em um estado `past_due`, ela não pode ser alterada até que as informações de pagamento sejam atualizadas. Portanto, os métodos `swap` e `updateQuantity` lançarão uma exceção quando a assinatura estiver em um estado `past_due`.
:::

<a name="subscription-scopes"></a>
#### Escopos de assinatura

A maioria dos estados de assinatura também estão disponíveis como escopos de consulta para que você possa consultar facilmente seu banco de dados para assinaturas que estão em um determinado estado:

```php
    // Obtenha todas as assinaturas válidas...
    $subscriptions = Subscription::query()->valid()->get();

    // Obtenha todas as assinaturas canceladas de um usuário...
    $subscriptions = $user->subscriptions()->canceled()->get();
```

Uma lista completa de escopos disponíveis está disponível abaixo:

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
### Cobranças únicas de assinatura

As cobranças únicas de assinatura permitem que você cobre dos assinantes uma cobrança única sobre suas assinaturas. Você deve fornecer um ou vários IDs de preço ao invocar o método `charge`:

```php
    // Cobrar um preço único...
    $response = $user->subscription()->charge('pri_123');

    // Cobrar vários preços de uma só vez...
    $response = $user->subscription()->charge(['pri_123', 'pri_456']);
```

O método `charge` não cobrará realmente o cliente até o próximo intervalo de cobrança de sua assinatura. Se você quiser cobrar o cliente imediatamente, você pode usar o método `chargeAndInvoice` em vez disso:

```php
    $response = $user->subscription()->chargeAndInvoice('pri_123');
```

<a name="updating-payment-information"></a>
### Atualizando informações de pagamento

O Paddle sempre salva um método de pagamento por assinatura. Se você quiser atualizar o método de pagamento padrão para uma assinatura, você deve redirecionar seu cliente para a página de atualização do método de pagamento hospedado do Paddle usando o método `redirectToUpdatePaymentMethod` no modelo de assinatura:

```php
    use Illuminate\Http\Request;

    Route::get('/update-payment-method', function (Request $request) {
        $user = $request->user();

        return $user->subscription()->redirectToUpdatePaymentMethod();
    });
```

Quando um usuário terminar de atualizar suas informações, um webhook `subscription_updated` será despachado pelo Paddle e os detalhes da assinatura serão atualizados no banco de dados do seu aplicativo.

<a name="changing-plans"></a>
### Alterando Planos

Depois que um usuário assina seu aplicativo, ele pode ocasionalmente querer mudar para um novo plano de assinatura. Para atualizar o plano de assinatura de um usuário, você deve passar o identificador do preço do Paddle para o método `swap` da assinatura:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->subscription()->swap($premium = 'pri_456');
```

Se você quiser trocar de plano e faturar o usuário imediatamente em vez de esperar pelo próximo ciclo de cobrança, você pode usar o método `swapAndInvoice`:

```php
    $user = User::find(1);

    $user->subscription()->swapAndInvoice($premium = 'pri_456');
```

<a name="prorations"></a>
#### Prorrateios

Por padrão, o Paddle rateia as cobranças ao alternar entre planos. O método `noProrate` pode ser usado para atualizar as assinaturas sem ratear as cobranças:

```php
    $user->subscription('default')->noProrate()->swap($premium = 'pri_456');
```

Se você quiser desabilitar o rateio e faturar os clientes imediatamente, você pode usar o método `swapAndInvoice` em combinação com `noProrate`:

```php
    $user->subscription('default')->noProrate()->swapAndInvoice($premium = 'pri_456');
```

Ou, para não cobrar seu cliente por uma alteração de assinatura, você pode utilizar o método `doNotBill`:

```php
    $user->subscription('default')->doNotBill()->swap($premium = 'pri_456');
```

Para mais informações sobre as políticas de rateio do Paddle, consulte a [documentação de rateio](https://developer.paddle.com/concepts/subscriptions/proration) do Paddle.

<a name="subscription-quantity"></a>
### Quantidade de assinatura

Às vezes, as assinaturas são afetadas pela "quantidade". Por exemplo, um aplicativo de gerenciamento de projetos pode cobrar US$ 10 por mês por projeto. Para aumentar ou diminuir facilmente a quantidade da sua assinatura, use os métodos `incrementQuantity` e `decrementQuantity`:

```php
    $user = User::find(1);

    $user->subscription()->incrementQuantity();

    // Adicione cinco à quantidade atual da assinatura...
    $user->subscription()->incrementQuantity(5);

    $user->subscription()->decrementQuantity();

    // Subtraia cinco da quantidade atual da assinatura...
    $user->subscription()->decrementQuantity(5);
```

Alternativamente, você pode definir uma quantidade específica usando o método `updateQuantity`:

```php
    $user->subscription()->updateQuantity(10);
```

O método `noProrate` pode ser usado para atualizar a quantidade da assinatura sem ratear as cobranças:

```php
    $user->subscription()->noProrate()->updateQuantity(10);
```

<a name="quantities-for-subscription-with-multiple-products"></a>
#### Quantidades para assinaturas com vários produtos

Se sua assinatura for uma [assinatura com vários produtos](#subscriptions-with-multiple-products), você deve passar o ID do preço cuja quantidade você deseja aumentar ou diminuir como o segundo argumento para os métodos de incremento/decremento:

```php
    $user->subscription()->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### Assinaturas com vários produtos

[Assinatura com vários produtos](https://developer.paddle.com/build/subscriptions/add-remove-products-prices-addons) permite que você atribua vários produtos de cobrança a uma única assinatura. Por exemplo, imagine que você está criando um aplicativo de "helpdesk" de atendimento ao cliente que tem um preço de assinatura base de US$ 10 por mês, mas oferece um produto complementar de chat ao vivo por US$ 15 adicionais por mês.

Ao criar sessões de checkout de assinatura, você pode especificar vários produtos para uma determinada assinatura passando uma matriz de preços como o primeiro argumento para o método `subscribe`:

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

No exemplo acima, o cliente terá dois preços anexados à sua assinatura `default`. Ambos os preços serão cobrados em seus respectivos intervalos de cobrança. Se necessário, você pode passar uma matriz associativa de pares de chave/valor para indicar uma quantidade específica para cada preço:

```php
    $user = User::find(1);

    $checkout = $user->subscribe('default', ['price_monthly', 'price_chat' => 5]);
```

Se você quiser adicionar outro preço a uma assinatura existente, você deve usar o método `swap` da assinatura. Ao invocar o método `swap`, você também deve incluir os preços e quantidades atuais da assinatura:

```php
    $user = User::find(1);

    $user->subscription()->swap(['price_chat', 'price_original' => 2]);
```

O exemplo acima adicionará o novo preço, mas o cliente não será cobrado por ele até o próximo ciclo de cobrança. Se você quiser cobrar o cliente imediatamente, você pode usar o método `swapAndInvoice`:

```php
    $user->subscription()->swapAndInvoice(['price_chat', 'price_original' => 2]);
```

Você pode remover preços de assinaturas usando o método `swap` e omitindo o preço que você quer remover:

```php
    $user->subscription()->swap(['price_original' => 2]);
```

::: warning AVISO
Você não pode remover o último preço de uma assinatura. Em vez disso, você deve simplesmente cancelar a assinatura.
:::

<a name="multiple-subscriptions"></a>
### Assinaturas múltiplas

O Paddle permite que seus clientes tenham várias assinaturas simultaneamente. Por exemplo, você pode administrar uma academia que oferece uma assinatura de natação e uma assinatura de levantamento de peso, e cada assinatura pode ter preços diferentes. Claro, os clientes devem ser capazes de assinar um ou ambos os planos.

Quando seu aplicativo cria assinaturas, você pode fornecer o tipo da assinatura para o método `subscribe` como o segundo argumento. O tipo pode ser qualquer string que represente o tipo de assinatura que o usuário está iniciando:

```php
    use Illuminate\Http\Request;

    Route::post('/swimming/subscribe', function (Request $request) {
        $checkout = $request->user()->subscribe($swimmingMonthly = 'pri_123', 'swimming');

        return view('billing', ['checkout' => $checkout]);
    });
```

Neste exemplo, iniciamos uma assinatura mensal de natação para o cliente. No entanto, eles podem querer trocar para uma assinatura anual mais tarde. Ao ajustar a assinatura do cliente, podemos simplesmente trocar o preço da assinatura `natação`:

```php
    $user->subscription('swimming')->swap($swimmingYearly = 'pri_456');
```

Claro, você também pode cancelar a assinatura completamente:

```php
    $user->subscription('swimming')->cancel();
```

<a name="pausing-subscriptions"></a>
### Pausando Assinaturas

Para pausar uma assinatura, chame o método `pause` na assinatura do usuário:

```php
    $user->subscription()->pause();
```

Quando uma assinatura é pausada, o Cashier define automaticamente a coluna `paused_at` no seu banco de dados. Esta coluna é usada para determinar quando o método `paused` deve começar a retornar `true`. Por exemplo, se um cliente pausar uma assinatura em 1º de março, mas a assinatura não estava programada para ocorrer novamente até 5 de março, o método `paused` continuará a retornar `false` até 5 de março. Isso ocorre porque um usuário normalmente tem permissão para continuar usando um aplicativo até o final do ciclo de cobrança.

Por padrão, a pausa acontece no próximo intervalo de cobrança para que o cliente possa usar o restante do período pelo qual pagou. Se você quiser pausar uma assinatura imediatamente, você pode usar o método `pauseNow`:

```php
    $user->subscription()->pauseNow();
```

Usando o método `pauseUntil`, você pode pausar a assinatura até um momento específico no tempo:

```php
    $user->subscription()->pauseUntil(now()->addMonth());
```

Ou você pode usar o método `pauseNowUntil` para pausar imediatamente a assinatura até um determinado ponto no tempo:

```php
    $user->subscription()->pauseNowUntil(now()->addMonth());
```

Você pode determinar se um usuário pausou sua assinatura, mas ainda está em seu "período de carência" usando o método `onPausedGracePeriod`:

```php
    if ($user->subscription()->onPausedGracePeriod()) {
        // ...
    }
```

Para retomar uma assinatura pausada, você pode invocar o método `resume` na assinatura:

```php
    $user->subscription()->resume();
```

::: warning AVISO
Uma assinatura não pode ser modificada enquanto estiver pausada. Se você quiser trocar para um plano diferente ou atualizar quantidades, você deve retomar a assinatura primeiro.
:::

<a name="canceling-subscriptions"></a>
### Cancelando Assinaturas

Para cancelar uma assinatura, chame o método `cancel` na assinatura do usuário:

```php
    $user->subscription()->cancel();
```

Quando uma assinatura é cancelada, o Cashier definirá automaticamente a coluna `ends_at` no seu banco de dados. Esta coluna é usada para determinar quando o método `subscribed` deve começar a retornar `false`. Por exemplo, se um cliente cancelar uma assinatura em 1º de março, mas a assinatura não estava programada para terminar até 5 de março, o método `subscribed` continuará a retornar `true` até 5 de março. Isso é feito porque um usuário normalmente tem permissão para continuar usando um aplicativo até o final do seu ciclo de cobrança.

Você pode determinar se um usuário cancelou sua assinatura, mas ainda está em seu "período de carência" usando o método `onGracePeriod`:

```php
    if ($user->subscription()->onGracePeriod()) {
        // ...
    }
```

Se você deseja cancelar uma assinatura imediatamente, você pode chamar o método `cancelNow` na assinatura:

```php
    $user->subscription()->cancelNow();
```

Para impedir que uma assinatura em seu período de carência seja cancelada, você pode invocar o método `stopCancelation`:

```php
    $user->subscription()->stopCancelation();
```

::: warning AVISO
As assinaturas do Paddle não podem ser retomadas após o cancelamento. Se seu cliente deseja retomar sua assinatura, ele terá que criar uma nova assinatura.
:::

<a name="subscription-trials"></a>
## Testes de assinatura

<a name="with-payment-method-up-front"></a>
### Com método de pagamento adiantado

Se você quiser oferecer períodos de teste aos seus clientes enquanto ainda coleta informações sobre o método de pagamento adiantado, você deve usar o tempo de teste definido no painel do Paddle no preço que seu cliente está assinando. Em seguida, inicie a sessão de checkout normalmente:

```php
    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $checkout = $request->user()->subscribe('pri_monthly')
                    ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Quando seu aplicativo receber o evento `subscription_created`, o Cashier definirá a data de término do período de teste no registro de assinatura no banco de dados do seu aplicativo, bem como instruirá o Paddle a não começar a cobrar o cliente até depois dessa data.

::: warning AVISO
Se a assinatura do cliente não for cancelada antes da data de término do teste, ele será cobrado assim que o teste expirar, então você deve ter certeza de notificar seus usuários sobre a data de término do teste.
:::

Você pode determinar se o usuário está em seu período de teste usando o método `onTrial` da instância do usuário ou o método `onTrial` da instância da assinatura. Os dois exemplos abaixo são equivalentes:

```php
    if ($user->onTrial()) {
        // ...
    }

    if ($user->subscription()->onTrial()) {
        // ...
    }
```

Para determinar se um teste existente expirou, você pode usar os métodos `hasExpiredTrial`:

```php
    if ($user->hasExpiredTrial()) {
        // ...
    }

    if ($user->subscription()->hasExpiredTrial()) {
        // ...
    }
```

Para determinar se um usuário está em teste para um tipo de assinatura específico, você pode fornecer o tipo para os métodos `onTrial` ou `hasExpiredTrial`:

```php
    if ($user->onTrial('default')) {
        // ...
    }

    if ($user->hasExpiredTrial('default')) {
        // ...
    }
```

<a name="without-payment-method-up-front"></a>
### Sem método de pagamento adiantado

Se você quiser oferecer períodos de teste sem coletar as informações do método de pagamento do usuário adiantado, você pode definir a coluna `trial_ends_at` no registro do cliente anexado ao seu usuário para a data de término do teste desejada. Isso normalmente é feito durante o registro do usuário:

```php
    use App\Models\User;

    $user = User::create([
        // ...
    ]);

    $user->createAsCustomer([
        'trial_ends_at' => now()->addDays(10)
    ]);
```

O Casher se refere a esse tipo de teste como um "teste genérico", já que não está vinculado a nenhuma assinatura existente. O método `onTrial` na instância `User` retornará `true` se a data atual não for posterior ao valor de `trial_ends_at`:

```php
    if ($user->onTrial()) {
        // O usuário está dentro do período de teste...
    }
```

Quando estiver pronto para criar uma assinatura real para o usuário, você pode usar o método `subscribe` como de costume:

```php
    use Illuminate\Http\Request;

    Route::get('/user/subscribe', function (Request $request) {
        $checkout = $user->subscribe('pri_monthly')
            ->returnTo(route('home'));

        return view('billing', ['checkout' => $checkout]);
    });
```

Para recuperar a data de término do teste do usuário, você pode usar o método `trialEndsAt`. Este método retornará uma instância de data Carbon se um usuário estiver em um teste ou `null` se não estiver. Você também pode passar um parâmetro de tipo de assinatura opcional se quiser obter a data de término do teste para uma assinatura específica diferente da padrão:

```php
    if ($user->onTrial('default')) {
        $trialEndsAt = $user->trialEndsAt();
    }
```

Você pode usar o método `onGenericTrial` se quiser saber especificamente que o usuário está dentro do período de teste "genérico" e ainda não criou uma assinatura real:

```php
    if ($user->onGenericTrial()) {
        // O usuário está dentro do período de teste "genérico"...
    }
```

<a name="extend-or-activate-a-trial"></a>
### Estender ou ativar um teste

Você pode estender um período de teste existente em uma assinatura invocando o método `extendTrial` e especificando o momento em que o teste deve terminar:

```php
    $user->subscription()->extendTrial(now()->addDays(5));
```

Ou você pode ativar imediatamente uma assinatura encerrando seu teste chamando o método `activate` na assinatura:

```php
    $user->subscription()->activate();
```

<a name="handling-paddle-webhooks"></a>
## Lidando com webhooks do Paddle

O Paddle pode notificar seu aplicativo sobre uma variedade de eventos por meio de webhooks. Por padrão, uma rota que aponta para o controlador de webhook do Cashier é registrada pelo provedor de serviços do Cashier. Este controlador manipulará todas as solicitações de webhook recebidas.

Por padrão, este controlador manipulará automaticamente o cancelamento de assinaturas que tenham muitas cobranças com falha, atualizações de assinatura e alterações de método de pagamento; no entanto, como descobriremos em breve, você pode estender esse controlador para manipular qualquer evento de webhook do Paddle que desejar.

Para garantir que seu aplicativo possa manipular webhooks do Paddle, certifique-se de [configurar a URL do webhook no painel de controle do Paddle](https://vendors.paddle.com/alerts-webhooks). Por padrão, o controlador de webhook do Cashier responde ao caminho da URL `/paddle/webhook`. A lista completa de todos os webhooks que você deve habilitar no painel de controle do Paddle são:

- Cliente atualizado
- Transação concluída
- Transação atualizada
- Assinatura criada
- Assinatura atualizada
- Assinatura pausada
- Assinatura cancelada

::: warning AVISO
Certifique-se de proteger as solicitações recebidas com o middleware [verificação de assinatura de webhook](/docs/cashier-paddle#verifying-webhook-signatures) incluído do Cashier.
:::

<a name="webhooks-csrf-protection"></a>
#### Webhooks e proteção CSRF

Como os webhooks do Paddle precisam ignorar a [proteção CSRF](/docs/csrf) do Laravel, você deve garantir que o Laravel não tente verificar o token CSRF para webhooks Paddle de entrada. Para fazer isso, você deve excluir `paddle/*` da proteção CSRF no arquivo `bootstrap/app.php` do seu aplicativo:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'paddle/*',
        ]);
    })
```

<a name="webhooks-local-development"></a>
#### Webhooks e desenvolvimento local

Para que o Paddle possa enviar os webhooks do seu aplicativo durante o desenvolvimento local, você precisará expor seu aplicativo por meio de um serviço de compartilhamento de sites, como [Ngrok](https://ngrok.com/) ou [Expose](https://expose.dev/docs/introduction). Se você estiver desenvolvendo seu aplicativo localmente usando [Laravel Sail](/docs/sail), você pode usar o [comando de compartilhamento de site](/docs/sail#sharing-your-site) do Sail.

<a name="defining-webhook-event-handlers"></a>
### Definindo manipuladores de eventos de webhook

O Cashier manipula automaticamente o cancelamento de assinaturas em cobranças com falha e outros webhooks comuns do Paddle. No entanto, se você tiver eventos de webhook adicionais que gostaria de manipular, você pode fazer isso ouvindo os seguintes eventos que são despachados pelo Cashier:

- `Laravel\Paddle\Events\WebhookReceived`
- `Laravel\Paddle\Events\WebhookHandled`

Ambos os eventos contêm a carga útil completa do webhook do Paddle. Por exemplo, se você deseja manipular o webhook `transaction.billed`, você pode registrar um [listener](/docs/events#defining-listeners) que manipulará o evento:

```php
    <?php

    namespace App\Listeners;

    use Laravel\Paddle\Events\WebhookReceived;

    class PaddleEventListener
    {
        /**
         * Manipule os webhooks Paddle recebidos.
         */
        public function handle(WebhookReceived $event): void
        {
            if ($event->payload['event_type'] === 'transaction.billed') {
                // Lidar com o evento de entrada...
            }
        }
    }
```

O caixa também emite eventos dedicados ao tipo de webhook recebido. Além da carga útil completa do Paddle, eles também contêm os modelos relevantes que foram usados ​​para processar o webhook, como o modelo faturável, a assinatura ou o recibo:

<div class="content-list" markdown="1">

- `Laravel\Paddle\Events\CustomerUpdated`
- `Laravel\Paddle\Events\TransactionCompleted`
- `Laravel\Paddle\Events\TransactionUpdated`
- `Laravel\Paddle\Events\SubscriptionCreated`
- `Laravel\Paddle\Events\SubscriptionUpdated`
- `Laravel\Paddle\Events\SubscriptionPaused`
- `Laravel\Paddle\Events\SubscriptionCanceled`

</div>

Você também pode substituir a rota padrão do webhook integrado definindo a variável de ambiente `CASHIER_WEBHOOK` no seu aplicativo Arquivo `.env`. Este valor deve ser a URL completa para sua rota de webhook e precisa corresponder à URL definida no seu painel de controle do Paddle:

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a name="verifying-webhook-signatures"></a>
### Verificando assinaturas de webhook

Para proteger seus webhooks, você pode usar [as assinaturas de webhook do Paddle](https://developer.paddle.com/webhook-reference/verifying-webhooks). Para sua conveniência, o Cashier inclui automaticamente um middleware que valida se a solicitação de webhook do Paddle recebida é válida.

Para habilitar a verificação de webhook, certifique-se de que a variável de ambiente `PADDLE_WEBHOOK_SECRET` esteja definida no arquivo `.env` do seu aplicativo. O segredo do webhook pode ser recuperado do painel da sua conta do Paddle.

<a name="single-charges"></a>
## Cobranças Únicas

<a name="charging-for-products"></a>
### Cobrança por Produtos

Se você quiser iniciar uma compra de produto para um cliente, você pode usar o método `checkout` em uma instância de modelo faturável para gerar uma sessão de checkout para a compra. O método `checkout` aceita um ou vários IDs de preço. Se necessário, uma matriz associativa pode ser usada para fornecer a quantidade do produto que está sendo comprado:

```php
    use Illuminate\Http\Request;

    Route::get('/buy', function (Request $request) {
        $checkout = $request->user()->checkout(['pri_tshirt', 'pri_socks' => 5]);

        return view('buy', ['checkout' => $checkout]);
    });
```

Após gerar a sessão de checkout, você pode usar o `paddle-button` fornecido pelo Cashier [componente Blade](#overlay-checkout) para permitir que o usuário visualize o widget de checkout Paddle e conclua a compra:

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy
</x-paddle-button>
```

Uma sessão de checkout tem um método `customData`, permitindo que você passe quaisquer dados personalizados que desejar para a criação da transação subjacente. Consulte [a documentação do Paddle](https://developer.paddle.com/build/transactions/custom-data) para saber mais sobre as opções disponíveis para você ao passar dados personalizados:

```php
    $checkout = $user->checkout('pri_tshirt')
        ->customData([
            'custom_option' => $value,
        ]);
```

<a name="refunding-transactions"></a>
### Transações de Reembolso

As transações de reembolso retornarão o valor reembolsado para o método de pagamento do seu cliente que foi usado no momento da compra. Se você precisar reembolsar uma compra do Paddle, poderá usar o método `refund` em um modelo `Cashier\Paddle\Transaction`. Este método aceita um motivo como o primeiro argumento, um ou mais IDs de preço para reembolsar com valores opcionais como uma matriz associativa. Você pode recuperar as transações para um determinado modelo faturável usando o método `transactions`.

Por exemplo, imagine que queremos reembolsar uma transação específica para os preços `pri_123` e `pri_456`. Queremos reembolsar integralmente `pri_123`, mas reembolsar apenas dois dólares para `pri_456`:

```php
    use App\Models\User;

    $user = User::find(1);

    $transaction = $user->transactions()->first();

    $response = $transaction->refund('Accidental charge', [
        'pri_123', // Reembolsar integralmente esse preço...
        'pri_456' => 200, // Reembolsar apenas parcialmente este preço...
    ]);
```

O exemplo acima reembolsa itens de linha específicos em uma transação. Se você quiser reembolsar a transação inteira, basta fornecer um motivo:

```php
    $response = $transaction->refund('Accidental charge');
```

Para obter mais informações sobre reembolsos, consulte [a documentação de reembolso do Paddle](https://developer.paddle.com/build/transactions/create-transaction-adjustments).

::: warning AVISO
Os reembolsos devem sempre ser aprovados pelo Paddle antes do processamento completo.
:::

<a name="crediting-transactions"></a>
### Creditando Transações

Assim como o reembolso, você também pode creditar transações. Creditar transações adicionará os fundos ao saldo do cliente para que ele possa ser usado em compras futuras. Creditar transações só pode ser feito para transações coletadas manualmente e não para transações coletadas automaticamente (como assinaturas), pois o Paddle lida com créditos de assinatura automaticamente:

```php
    $transaction = $user->transactions()->first();

    // Creditar totalmente um item de linha específico...
    $response = $transaction->credit('Compensation', 'pri_123');
```

Para mais informações, [veja a documentação do Paddle sobre crédito](https://developer.paddle.com/build/transactions/create-transaction-adjustments).

::: warning AVISO
Os créditos só podem ser aplicados para transações coletadas manualmente. As transações coletadas automaticamente são creditadas pelo próprio Paddle.
:::
<a name="transactions"></a>
## Transações

Você pode recuperar facilmente uma matriz de transações de um modelo faturável por meio da propriedade `transactions`:

```php
    use App\Models\User;

    $user = User::find(1);

    $transactions = $user->transactions;
```

As transações representam pagamentos para seus produtos e compras e são acompanhadas por faturas. Apenas transações concluídas são armazenadas no banco de dados do seu aplicativo.

Ao listar as transações para um cliente, você pode usar os métodos da instância da transação para exibir as informações de pagamento relevantes. Por exemplo, você pode desejar listar todas as transações em uma tabela, permitindo que o usuário baixe facilmente qualquer uma das faturas:

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

A rota `download-invoice` pode se parecer com o seguinte:

```php
use Illuminate\Http\Request;
use Laravel\Cashier\Transaction;

Route::get('/download-invoice/{transaction}', function (Request $request, Transaction $transaction) {
return $transaction->redirectToInvoicePdf();
})->name('download-invoice');
```

<a name="past-and-upcoming-payments"></a>
### Pagamentos Passados ​​e Futuros

Você pode usar os métodos `lastPayment` e `nextPayment` para recuperar e exibir os pagamentos passados ​​ou futuros de um cliente para assinaturas recorrentes:

```php
    use App\Models\User;

    $user = User::find(1);

    $subscription = $user->subscription();

    $lastPayment = $subscription->lastPayment();
    $nextPayment = $subscription->nextPayment();
```

Ambos os métodos retornarão uma instância de `Laravel\Paddle\Payment`; no entanto, `lastPayment` retornará `null` quando as transações ainda não tiverem sido sincronizadas por webhooks, enquanto `nextPayment` retornará `null` quando o ciclo de cobrança tiver terminado (como quando uma assinatura foi cancelada):

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a name="testing"></a>
## Teste

Ao testar, você deve testar manualmente seu fluxo de cobrança para garantir que sua integração funcione conforme o esperado.

Para testes automatizados, incluindo aqueles executados em um ambiente de CI, você pode usar [o cliente HTTP do Laravel](/docs/http-client#testing) para falsificar chamadas HTTP feitas ao Paddle. Embora isso não teste as respostas reais do Paddle, ele fornece uma maneira de testar seu aplicativo sem realmente chamar a API do Paddle.
