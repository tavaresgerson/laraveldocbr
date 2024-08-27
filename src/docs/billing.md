# Laravel Cashier (Stripe)

## Introdução

O Cashier do Laravel oferece uma interface expressiva e fluente para os serviços de cobrança por assinatura do Stripe. Ele lida com quase todo o código da cobrança por assinatura que você tem medo de escrever. Além da gestão básica de assinaturas, o Cashier pode lidar com cupons, troca de assinatura, "quantidades" de assinatura, períodos de cancelamento e até mesmo gerar PDFs de faturas.

## Melhorar caixa

Ao atualizar para uma nova versão do Cashier, é importante revisar cuidadosamente [o guia de atualização](https://github.com/laravel/cashier-stripe/blob/master/UPGRADE.md).

> [ALERTA!]
> Para evitar mudanças que causem problemas, o Cashier utiliza uma versão fixa da API do Stripe. O Cashier 15 utiliza a versão `2023-10-16` da API do Stripe. A API do Stripe será atualizada nas versões menores para permitir o uso de novos recursos e melhorias.

## Instalação

Primeiro, instale o pacote do Casher para Stripe usando o Composer (gerenciador de pacotes).

```shell
composer require laravel/cashier
```

Após instalar o pacote, publique as migrações de Caixeiro usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Em seguida, migre seu banco de dados:

```shell
php artisan migrate
```

A migração do caixa adicionará várias colunas à sua tabela 'usuários'. Também criará uma nova tabela 'assinaturas' para armazenar todas as assinaturas dos clientes e uma tabela 'item de assinatura' para assinaturas com vários preços.

Se desejar você também pode publicar o arquivo de configuração do Cashier usando o comando artisan 'vendor:publish':

```shell
php artisan vendor:publish --tag="cashier-config"
```

Por fim, para garantir que o Gerente de Caixa manipule todos os eventos do Stripe corretamente, lembre-se de configurar a manipulação dos webhooks do Gerente de Caixa.

> [AVERTÊNCIA]
> A Stripe recomenda que qualquer coluna usada para armazenar identificadores Stripe seja insensível a maiúsculas e minúsculas. Portanto, você deve garantir que a colação da coluna `stripe_id` esteja definida como `utf8_bin` ao usar o MySQL. Mais informações sobre isso podem ser encontradas na [documentação da Stripe](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible).

## Configuração

### Modelo Cobrável

Antes de usar o sistema de pagamento, adicione o atributo `Billable` à definição do modelo faturável. Geralmente isso será o modelo 'App\Models\User'. Este atributo fornece vários métodos para permitir que você execute tarefas comuns de cobrança, como a criação de assinaturas, aplicação de cupons e atualização das informações do método de pagamento:

```php
    use Laravel\Cashier\Billable;

    class User extends Authenticatable
    {
        use Billable;
    }
```

O atendente assume que seu modelo faturável será a classe 'App\Models\User' que acompanha o Laravel. Se você deseja mudar isso, pode especificar um modelo diferente via o método 'useCustomerModel'. Este método deve ser normalmente chamado no método 'boot' de sua classe 'AppServiceProvider':

```php
    use App\Models\Cashier\User;
    use Laravel\Cashier\Cashier;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Cashier::useCustomerModel(User::class);
    }
```

> ¡ADVERTENCIA!
> Se você estiver usando um modelo diferente do fornecido 'App/Models/User', precisará publicar e alterar as migrações fornecidas para combinar o nome da tabela com o seu modelo alternativo.

### Chaves de API

Em seguida, você deve configurar suas chaves da API do Stripe no arquivo .env de seu aplicativo. Você pode recuperar as chaves da API do Stripe no painel de controle do Stripe:

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

> [!ALERTA]
> Você deve garantir que a variável de ambiente 'STRIPE_WEBHOOK_SECRET' esteja definida no arquivo '.env' do seu aplicativo, já que esta variável é usada para se certificar que os webhooks recebidos são, na verdade, originados por Stripe.

### Configuração de Moeda

A moeda padrão do caixa é o dólar americano (USD). Você pode alterar a moeda padrão definindo a variável de ambiente 'CASHIER_CURRENCY' dentro do arquivo '.env' da sua aplicação:

```ini
CASHIER_CURRENCY=eur
```

Além de configurar a moeda do caixa, você também pode especificar um idioma para ser usado ao formatar os valores em dinheiro para exibição nas faturas. Internamente, o Cashier utiliza a [classe `NumberFormatter` do PHP](https://www.php.net/manual/pt_BR/class.numberformatter.php) para definir a localidade da moeda:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [AVISO]
> Para utilizar outros idiomas que não o inglês ("en"), certifique-se de ter instalado a extensão "ext-intl" do PHP em seu servidor e configurado.

### Configuração de Imposto

Graças ao [Stripe Tax](https://stripe.com/tax), é possível calcular automaticamente os impostos para todas as faturas geradas pelo Stripe. Você pode ativar o cálculo automático de impostos invocando o método `calculateTaxes` no método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    use Laravel\Cashier\Cashier;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Cashier::calculateTaxes();
    }
```

Uma vez que a tributação foi ativada, qualquer nova assinatura e qualquer fatura única gerada receberá uma tributação automática.

Para que esse recurso funcione corretamente, os detalhes de cobrança do cliente, como nome, endereço e ID fiscal, precisam ser sincronizados com o Stripe. Você pode usar os métodos [sincronização de dados do cliente](#sincronizando-dados-do-cliente-com-stripe) e [ID Fiscal](#ids-fiscais) oferecidos pelo Cashier para realizar isso.

> ¡[ADVERTENCIA]
> Nenhum imposto é calculado para [pagamentos únicos](#pagamento_unico) ou [pagamentos únicos de checkout](#pagamento_unico_checkout).

### Registro de acesso a arquivos

O Cashier permite especificar o canal de log a ser usado quando um erro fatal do Stripe é registrado. Você pode especificar o canal de log definindo a variável de ambiente `CASHIER_LOGGER` dentro do arquivo `.env` da sua aplicação:

```ini
CASHIER_LOGGER=stack
```

exceções que são geradas por chamadas de API para Stripe serão registradas através do canal de registro padrão do seu aplicativo.

### Usando Modelos Personalizados

Você é livre para estender os modelos usados internamente pelo Caixa por definir seu próprio modelo e estender o modelo correspondente do Caixa:

```php
    use Laravel\Cashier\Subscription as CashierSubscription;

    class Subscription extends CashierSubscription
    {
        // ...
    }
```

Depois de definir seu modelo, você pode instruir o Cashier para usar seu modelo personalizado usando a classe "Laravel\Cashier\Cashier". Normalmente, você deve informar ao Cashier sobre seus modelos personalizados no método 'boot' da classe de provedores de aplicativos 'App\Providers\AppServiceProvider':

```php
    use App\Models\Cashier\Subscription;
    use App\Models\Cashier\SubscriptionItem;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Cashier::useSubscriptionModel(Subscription::class);
        Cashier::useSubscriptionItemModel(SubscriptionItem::class);
    }
```

## Introdução Rápida

### Vender Produtos

> [NOTA]
> Antes de usar o Stripe Checkout, você deve definir os Produtos com Preços Fixos no seu painel do Stripe. Além disso, você deve [configurar a manipulação de webhooks do Caixeiro](#configuração-de-webhooks-do-stripe).

Oferecer faturamento de produtos e assinaturas através do seu aplicativo pode ser intimidante. No entanto, graças ao Caixeiro e o checkout [Stripe](https://stripe.com/pt-br/checkout), você pode facilmente construir integrações de pagamento modernas e robustas.

Para cobrar clientes por produtos de uso único e não recorrentes, usaremos o Caixa para direcionar os clientes à Stripe Checkout, onde eles fornecerão seus detalhes de pagamento e confirmarão sua compra. Uma vez que o pagamento for feito via Checkout, o cliente será redirecionado para uma URL de sucesso de sua escolha dentro do seu aplicativo:

```php
    use Illuminate\Http\Request;
    
    Route::get('/checkout', function (Request $request) {
        $stripePriceId = 'price_deluxe_album';

        $quantity = 1;

        return $request->user()->checkout([$stripePriceId => $quantity], [
            'success_url' => route('checkout-success'),
            'cancel_url' => route('checkout-cancel'),
        ]);
    })->name('checkout');

    Route::view('/checkout/success', 'checkout.success')->name('checkout-success');
    Route::view('/checkout/cancel', 'checkout.cancel')->name('checkout-cancel');
```

Como você pode ver no exemplo acima, vamos utilizar o método de pagamento fornecido pelo Cashier para redirecionar o cliente ao checkout do Stripe para um determinado identificador de preço. Quando usar o Stripe, "preços" se referem a [preços definidos para produtos específicos](https://stripe.com/docs/products-prices/how-products-and-prices-work).

Se necessário, o método 'checkout' criará automaticamente um cliente no Stripe e conectará esse registro de cliente do Stripe ao usuário correspondente no banco de dados da sua aplicação. Após concluir a sessão de checkout, o cliente será redirecionado para uma página específica de sucesso ou cancelamento, na qual você poderá exibir uma mensagem informativa ao cliente.

#### Fornecendo Meta Dados para Stripe Checkout

Quando vender produtos, é comum acompanhar pedidos concluídos e produtos comprados via "Carrinho" e "Pedido", modelos definidos pelo seu próprio aplicativo. Ao redirecionar os clientes ao Stripe Checkout para finalizar uma compra, você pode precisar fornecer um identificador de pedido existente para que a compra concluída possa ser associada à ordem correspondente quando o cliente for redirecionado de volta ao seu aplicativo.

Para fazer isso, você pode fornecer uma matriz de metadados para o método 'checkout'. Vamos imaginar que um pedido pendente é criado dentro do nosso aplicativo quando o usuário inicia o processo de checkout. Lembre-se, os modelos 'Cart' e 'Order' neste exemplo são ilustrativos e não fornecidos pelo Cashier. Você está livre para implementar esses conceitos com base nas necessidades do seu próprio aplicativo:

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

        return $request->user()->checkout($order->price_ids, [
            'success_url' => route('checkout-success').'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('checkout-cancel'),
            'metadata' => ['order_id' => $order->id],
        ]);
    })->name('checkout');
```

Como você pode ver no exemplo acima, quando um usuário inicia o processo de checkout, forneceremos todos os identificadores de preço associados do carrinho/pedido para o método `checkout`. Claro, seu aplicativo é responsável por associar esses itens com o "carrinho de compras" ou pedido conforme os clientes os adicionam. Também fornecemos o ID da ordem para a sessão Stripe Checkout via o array `metadata`. Finalmente, adicionamos a variável de modelo `CHECKOUT_SESSION_ID` para a rota de sucesso do checkout. Quando o Stripe redireciona os clientes de volta para seu aplicativo, essa variável de modelo será preenchida automaticamente com o ID da sessão de checkout.

A seguir vamos construir a rota de checkout bem-sucedido. Esta é a rota para a qual os usuários serão redirecionados após o seu pedido ter sido concluído via Stripe Checkout. Dentro desta rota, podemos obter a ID da sessão do Stripe Checkout e a instância do Stripe Checkout associada a fim de acessar nosso metadados fornecido e atualizar o pedido do cliente:

```php
    use App\Models\Order;
    use Illuminate\Http\Request;
    use Laravel\Cashier\Cashier;

    Route::get('/checkout/success', function (Request $request) {
        $sessionId = $request->get('session_id');

        if ($sessionId === null) {
            return;
        }

        $session = Cashier::stripe()->checkout->sessions->retrieve($sessionId);

        if ($session->payment_status !== 'paid') {
            return;
        }

        $orderId = $session['metadata']['order_id'] ?? null;

        $order = Order::findOrFail($orderId);

        $order->update(['status' => 'completed']);

        return view('checkout-success', ['order' => $order]);
    })->name('checkout-success');
```

Por favor, consulte a documentação do Stripe para mais informações sobre o [dados contidos no objeto da sessão de checkout](https://stripe.com/docs/api/checkout/sessions/object)

### Venda de Assinaturas

> Nota!
> Antes de utilizar Checkout Stripe, você deve definir os Produtos com preços fixos no seu painel do Stripe. Além disso, você deve configurar [o tratamento de webhooks do Cashier](#tratamento-de-webhook-do-stripe)

Oferecer faturamento de produtos e assinaturas em sua aplicação pode ser intimidante. No entanto, graças a Cashier e [Checkout Stripe](https://stripe.com/payments/checkout), você pode facilmente construir integrações de pagamento modernas e robustas.

Para aprender como vender assinaturas usando o Checkout do Caixeiro e o Stripe Checkout, vamos considerar um cenário simples de um serviço de assinatura com planos básicos mensais ( `price_basic_monthly`) e anuais ( `price_basic_yearly`). Estes dois preços poderiam ser agrupados sob um "Produto Básico" ( `pro_basic`) em nosso painel do Stripe. Além disso, o nosso serviço de assinatura pode oferecer um plano "Especialista" como `pro_expert`.

Primeiro vamos descobrir como um cliente pode se inscrever em nossos serviços. Claro, você pode imaginar que o cliente pode clicar em um botão "assinar" para o plano Básico na página de preços do nosso aplicativo. Este botão ou link deve direcionar o usuário a uma rota Laravel que cria a sessão de Checkout Stripe para seu plano escolhido:

```php
    use Illuminate\Http\Request;
    
    Route::get('/subscription-checkout', function (Request $request) {
        return $request->user()
            ->newSubscription('default', 'price_basic_monthly')
            ->trialDays(5)
            ->allowPromotionCodes()
            ->checkout([
                'success_url' => route('your-success-route'),
                'cancel_url' => route('your-cancel-route'),
            ]);
    });
```

Como você pode ver no exemplo acima, redirecionaremos o cliente para uma sessão Stripe Checkout, permitindo que se inscreva em nosso plano básico. Após um checkout ou cancelamento bem-sucedido, o cliente será redirecionado de volta para a URL fornecida ao método `checkout`. Para saber quando sua assinatura realmente começou (já que alguns métodos de pagamento exigem alguns segundos para processar), também precisamos configurar [gerenciar webhooks do Stripe](#gerenciando-webhooks-stripe).

Agora que os clientes podem iniciar assinaturas, precisamos restringir certas partes do nosso aplicativo para que apenas usuários inscritos possam acessá-las. É claro que podemos sempre determinar o status de assinatura atual de um usuário via o método "subscribed" fornecido pela característica "Billable" da Cashier:

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

Podemos até determinar se um usuário está inscrito em um produto ou preço específico:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

#### Construindo um Middleware Assinatura

Para conveniência, você pode criar um [middleware](/docs/{{version}}/middleware) que verifica se a requisição é de um usuário assinado. Uma vez este middleware definido, você pode atribuí-lo facilmente a uma rota para evitar usuários que não assinaram acessar a rota:

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
                return redirect('/billing');
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

#### Permitindo que os Clientes gerenciem seus planos de cobrança

Claro, os clientes podem querer mudar seu plano de assinatura para outro produto ou "nível". A maneira mais fácil de permitir isso é direcionando os clientes para o [Portal de Cobrança do Cliente](https://stripe.com/docs/no-code/customer-portal) da Stripe, que fornece uma interface de usuário hospedada que permite que os clientes baixem faturas, atualizem seu método de pagamento e alterem planos de assinatura.

Primeiro, defina um link ou botão dentro de sua aplicação que direcione os usuários para uma rota do Laravel que utilizaremos para iniciar uma sessão no portal de cobrança.

```blade
<a href="{{ route('billing') }}">
    Billing
</a>
```

A seguir vamos definir o caminho que inicia uma sessão do Portais de Cobrança da Stripe e redireciona o usuário ao Portal. O método `redirectToBillingPortal` aceita a URL que os usuários devem ser retornados quando saem do Portal:

```php
    use Illuminate\Http\Request;

    Route::get('/billing', function (Request $request) {
        return $request->user()->redirectToBillingPortal(route('dashboard'));
    })->middleware(['auth'])->name('billing');
```

> [!NOTA]
> Desde que você configurou o tratamento do webhook de Cashier, o Cashier manterá automaticamente suas tabelas de banco de dados relacionados a Cashier sincronizados ao inspecionar os webhooks que entram do Stripe. Então, por exemplo, quando um usuário cancela sua assinatura através da Portaria de Cobrança de Clientes do Stripe, o Cashier receberá o webhook correspondente e marcará a assinatura como "cancelada" no banco de dados da aplicação.

## Clientes

### Atendimento ao cliente

Você pode recuperar um cliente pelo seu ID do Stripe usando o método `Cashier::findBillable`. Este método retornará uma instância do modelo de cobrável:

```php
    use Laravel\Cashier\Cashier;

    $user = Cashier::findBillable($stripeId);
```

### Criando Clientes

Ocasionalmente, você pode querer criar um cliente do Stripe sem iniciar uma assinatura. Você pode alcançar isso usando o método `createAsStripeCustomer`:

```php
    $stripeCustomer = $user->createAsStripeCustomer();
```

Uma vez que o cliente tenha sido criado em Stripe, você pode iniciar uma assinatura mais tarde. Você pode fornecer um opcional `US$ opções` matriz para passar em qualquer [parâmetros adicionais de criação do cliente suportados pelo API Stripe](https://stripe.com/docs/api/customers/create):

```php
    $stripeCustomer = $user->createAsStripeCustomer($options);
```

Você pode usar o método `asStripeCustomer` se quiser retornar o objeto do cliente Stripe para um modelo cobrável:

```php
    $stripeCustomer = $user->asStripeCustomer();
```

O método `createOrGetStripeCustomer` pode ser usado se você gostaria de obter o objeto Stripe do cliente para um modelo faturável específico, mas não tem certeza se o modelo faturável já é um cliente dentro do Stripe. Este método criará um novo cliente no Stripe, caso ele ainda não exista:

```php
    $stripeCustomer = $user->createOrGetStripeCustomer();
```

### Atualizando Clientes

Ocasionalmente, você pode querer atualizar diretamente o cliente do Stripe com informações adicionais. Você pode realizar isso usando o método `updateStripeCustomer`. Este método aceita um array de [opções de atualização do cliente suportadas pelo Stripe API](https://stripe.com/docs/api/customers/update):

```php
    $stripeCustomer = $user->updateStripeCustomer($options);
```

### Balanças

A Stripe permite que você crie um saldo na conta de um cliente, e mais tarde esse saldo será creditado ou debitado em faturas novas. Para verificar o saldo total do cliente você pode usar o método "balance" que está disponível no seu modelo de cobrança. O método "balance" retornará uma representação formatada da conta em moeda:

```php
    $balance = $user->balance();
```

Para creditar o saldo de um cliente, você pode fornecer um valor para o método 'creditarSaldo'. Se desejar, também pode fornecer uma descrição:

```php
    $user->creditBalance(500, 'Premium customer top-up.');
```

Fornecer um valor para o método `debitBalance` debitará o saldo do cliente:

```php
    $user->debitBalance(300, 'Bad usage penalty.');
```

O método 'applyBalance' criará transações de balanço novas para o cliente, e pode-se recuperar os registros dessas transações usando o método 'balanceTransactions', que pode ser útil para fornecer um registro de créditos e débitos para o cliente revisar.

```php
    // Retrieve all transactions...
    $transactions = $user->balanceTransactions();

    foreach ($transactions as $transaction) {
        // Transaction amount...
        $amount = $transaction->amount(); // $2.31

        // Retrieve the related invoice when available...
        $invoice = $transaction->invoice();
    }
```

### CTPs

O caixa oferece uma forma fácil de gerenciar o ID fiscal do cliente. Por exemplo, o método 'taxIds' pode ser usado para obter todos os IDs fiscais atribuídos ao cliente como uma coleção:

```php
    $taxIds = $user->taxIds();
```

Você também pode recuperar um número específico de identificação de imposto para o cliente por seu identificador:

```php
    $taxId = $user->findTaxId('txi_belgium');
```

Você pode criar um novo ID de imposto fornecendo um valor válido para o método `createTaxId`:

```php
    $taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

O método `createTaxId` adicionará imediatamente o ID de VAT à conta do cliente. [A verificação do ID de VAT também é feita pelo Stripe](https://stripe.com/docs/invoicing/customer/tax-ids#validation); contudo, este é um processo assíncrono. Você pode ser notificado das atualizações da verificação ao assinar o webhook `customer.tax_id.updated` e inspecionar [o parâmetro `verification` do ID de VAT](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification). Para mais informações sobre manipulação de webhooks, consulte a [documentação sobre definições de manipuladores de webhook](#handling-stripe-webhooks).

Você pode apagar um ID de imposto usando o método 'apagarTaxId':

```php
    $user->deleteTaxId('txi_belgium');
```

### Sincronizando dados do cliente com o Stripe

tipicamente, quando os usuários do seu aplicativo atualizam seus nome, endereço de e-mail ou outra informação que também é armazenada por Stripe, você deve informar a stripe sobre as atualizações. Ao fazê-lo, a cópia da informação armazenada no Stripe será sincronizada com o seu aplicativo.

Para automatizar isso, você pode definir um ouvinte de eventos no seu modelo faturável que reage ao evento 'updated' do modelo. Em seguida, dentro de seu ouvinte de eventos, você pode invocar o método 'syncStripeCustomerDetails' no modelo:

```php
    use App\Models\User;
    use function Illuminate\Events\queueable;

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::updated(queueable(function (User $customer) {
            if ($customer->hasStripeId()) {
                $customer->syncStripeCustomerDetails();
            }
        }));
    }
```

Agora, toda vez que seu modelo de cliente é atualizado, suas informações serão sincronizadas com o Stripe. Para maior conveniência, o Gerente irá sincronizar automaticamente as informações do cliente com o Stripe na criação inicial do cliente.

Você pode personalizar as colunas utilizadas para sincronização de informações do cliente com o Stripe, sobrescrevendo uma variedade de métodos fornecidos pelo Cashier. Por exemplo, você pode sobrescrever o método `stripeName` para personalizar o atributo que deve ser considerado como "nome" do cliente quando o Cashier sincroniza as informações do cliente com o Stripe:

```php
    /**
     * Get the customer name that should be synced to Stripe.
     */
    public function stripeName(): string|null
    {
        return $this->company_name;
    }
```

Da mesma forma você pode sobrescrever os métodos 'stripeEmail', 'stripePhone', 'stripeAddress' e 'stripePreferredLocales'. Esses métodos sincronizarão as informações com os parâmetros do cliente correspondente quando [atualizando o objeto do cliente Stripe](https://stripe.com/docs/api/customers/update). Se quiser ter total controle sobre o processo de sincronização das informações do cliente, você pode sobrescrever o método 'syncStripeCustomerDetails'.

### Portal de cobrança

O Stripe oferece [uma maneira fácil de configurar um portal de cobrança](https://stripe.com/docs/billing/subscriptions/customer-portal) para que seus clientes possam gerenciar suas assinaturas, métodos de pagamento e visualizar sua história de cobrança. Você pode redirecionar seus usuários ao portal de cobrança invocando o método `redirectToBillingPortal` no modelo faturável a partir de um controlador ou rota:

```php
    use Illuminate\Http\Request;

    Route::get('/billing-portal', function (Request $request) {
        return $request->user()->redirectToBillingPortal();
    });
```

Por padrão, quando o usuário terminar de gerenciar sua assinatura, ele poderá voltar para a rota "home" do seu aplicativo via um link dentro do portal de cobrança Stripe. Você pode fornecer uma URL personalizada que o usuário deve retornar passando a URL como argumento para o método `redirectToBillingPortal`:

```php
    use Illuminate\Http\Request;

    Route::get('/billing-portal', function (Request $request) {
        return $request->user()->redirectToBillingPortal(route('billing'));
    });
```

Se quiser gerar a URL para o portal de cobrança sem gerar uma resposta de redirecionamento HTTP, você pode invocar o método `billingPortalUrl`:

```php
    $url = $request->user()->billingPortalUrl(route('billing'));
```

## Métodos de Pagamento

### Armazenando Métodos de Pagamento

Para criar assinaturas ou realizar "taxas únicas" com Stripe você precisará armazenar um método de pagamento e recuperar sua identificação a partir do Stripe. A abordagem utilizada para alcançar isso difere baseado em se você planeja usar o método de pagamento para assinaturas ou taxas únicas, então examinaremos ambos abaixo.

#### Métodos de Pagamento para Assinaturas

Ao armazenar informações do cartão de crédito do cliente para uso futuro por uma assinatura, o Stripe API "Configurações Intents" deve ser usado para coletar com segurança os detalhes do método de pagamento do cliente. Um "Intento de Configuração" indica ao Stripe a intenção de cobrar um método de pagamento do cliente. A característica `Billable` do caixa inclui o método `createSetupIntent` para criar facilmente uma nova Configuração Intento. Você deve invocar este método da rota ou controlador que renderizará o formulário que coleta os detalhes do método de pagamento do seu cliente:

```php
    return view('update-payment-method', [
        'intent' => $user->createSetupIntent()
    ]);
```

Após a criação do Intent de Configuração e passá-lo para o View, você deve anexar seu segredo ao elemento que irá coletar o método de pagamento. Por exemplo, considere este formulário "atualizar forma de pagamento":

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button" data-secret="{{ $intent->client_secret }}">
    Update Payment Method
</button>
```

A biblioteca Stripe.js pode ser usada para anexar um [Elemento Stripe](https://stripe.com/docs/stripe-js) ao formulário e coletar com segurança os detalhes de pagamento do cliente:

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

Em seguida, o cartão pode ser verificado e um "identificador do método de pagamento" seguro é obtido usando o método [Stripe 'confirmCardSetup' method](https://stripe.com/docs/js/setup_intents/confirm_card_setup):

```js
const cardHolderName = document.getElementById('card-holder-name');
const cardButton = document.getElementById('card-button');
const clientSecret = cardButton.dataset.secret;

cardButton.addEventListener('click', async (e) => {
    const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: { name: cardHolderName.value }
            }
        }
    );

    if (error) {
        // Display "error.message" to the user...
    } else {
        // The card has been verified successfully...
    }
});
```

Depois que o cartão for verificado pelo Stripe, você pode passar o identificador resultante de "setupIntent.payment_method" para sua aplicação Laravel, onde ele pode ser anexado ao cliente. O método de pagamento pode ser [adicionado como um novo método de pagamento](#add-payment-methods) ou [usado para atualizar o método de pagamento padrão](#updating-the-default-payment-method). Você também pode usar imediatamente o identificador do método de pagamento para [criar uma nova assinatura](#creating-subscriptions).

> Nota!
> Se quiser mais informações sobre Setups de Intenções e coleta de detalhes de pagamento do cliente, por favor [ revise este resumo fornecido pelo Stripe](https://stripe.com/docs/payments/save-and-reuse#php)

#### Métodos de Pagamento para Cargas Únicas

Claro, quando você faz um pagamento único contra uma forma de pagamento do cliente, precisaremos apenas usar um identificador da forma de pagamento uma vez. Devido a limitações do Stripe, você não pode usar o método de pagamento padrão armazenado de um cliente para pagamentos únicos. Você precisa permitir que o usuário insira os detalhes de sua forma de pagamento usando a biblioteca Stripe.js. Por exemplo, considere o seguinte formulário:

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button">
    Process Payment
</button>
```

Após definir tal forma, é possível usar a biblioteca Stripe.js para anexar um [elemento stripe](https://stripe.com/docs/stripe-js) na forma e coletar de forma segura os detalhes do pagamento do cliente:

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

Em seguida, o cartão pode ser verificado e um "identificador do método de pagamento seguro" pode ser buscado na Stripe usando [o método `createPaymentMethod` da Stripe](https://stripe.com/docs/stripe-js/reference#stripe-create-payment-method):

```js
const cardHolderName = document.getElementById('card-holder-name');
const cardButton = document.getElementById('card-button');

cardButton.addEventListener('click', async (e) => {
    const { paymentMethod, error } = await stripe.createPaymentMethod(
        'card', cardElement, {
            billing_details: { name: cardHolderName.value }
        }
    );

    if (error) {
        // Display "error.message" to the user...
    } else {
        // The card has been verified successfully...
    }
});
```

Se o cartão for verificado com sucesso, você pode passar o `paymentMethod.id` para sua aplicação Laravel e processar uma [ cobrança simples](#simple-charge).

### Recuperação dos Métodos de Pagamento

O método `paymentMethods` na instância do modelo faturável retorna uma coleção de instâncias de `Laravel\Cashier\PaymentMethod`.

```php
    $paymentMethods = $user->paymentMethods();
```

Por padrão, esse método retornará métodos de pagamento de todos os tipos. Para obter métodos de pagamento de um tipo específico, você pode passar o parâmetro 'tipo' no método:

```php
    $paymentMethods = $user->paymentMethods('sepa_debit');
```

Para recuperar o método de pagamento padrão do cliente, pode-se utilizar o método 'defaultPaymentMethod':

```php
    $paymentMethod = $user->defaultPaymentMethod();
```

Você pode recuperar um método de pagamento específico que está anexado ao modelo faturável usando o método `findPaymentMethod`:

```php
    $paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

### Presença de Método de Pagamento

Para determinar se um modelo de faturamento tem um método de pagamento padrão anexado à sua conta, invoque o método `hasDefaultPaymentMethod`:

```php
    if ($user->hasDefaultPaymentMethod()) {
        // ...
    }
```

Você pode usar o método `hasPaymentMethod` para determinar se um modelo faturável tem pelo menos um método de pagamento anexado à sua conta.

```php
    if ($user->hasPaymentMethod()) {
        // ...
    }
```

Este método determinará se o modelo de cobrança tem algum método de pagamento de qualquer tipo. Para determinar se um método de pagamento de um determinado tipo existe para o modelo, você pode passar 'tipo' como argumento para o método:

```php
    if ($user->hasPaymentMethod('sepa_debit')) {
        // ...
    }
```

### Atualizando o Método de Pagamento Padrão

O método 'updateDefaultPaymentMethod' pode ser utilizado para atualizar a informação do método de pagamento padrão de um cliente. Este método aceita um identificador da forma de pagamento Stripe e irá atribuir o novo método de pagamento como o padrão de cobrança:

```php
    $user->updateDefaultPaymentMethod($paymentMethod);
```

Para sincronizar as informações do seu método de pagamento padrão com o cliente com as informações do método padrão de pagamento do Stripe, você pode usar o método `updateDefaultPaymentMethodFromStripe`:

```php
    $user->updateDefaultPaymentMethodFromStripe();
```

> [!ALERTA!]
> O pagamento padrão em um cliente só pode ser usado para faturamento e criação de novas assinaturas. Devido às limitações impostas pelo Stripe, ele não pode ser usado para cobranças únicas.

### Adicionando Métodos de Pagamento

Para adicionar um novo método de pagamento, você pode chamar o método `addPaymentMethod` no modelo faturável, passando o identificador do método de pagamento:

```php
    $user->addPaymentMethod($paymentMethod);
```

> Nota:
> Para aprender como recuperar os identificadores do método de pagamento, por favor revise a documentação do [armazenamento do método de pagamento](#storing-payment-methods).

### Excluindo Métodos de Pagamento

Para excluir um método de pagamento, você pode chamar o método `delete` na instância do `Laravel\Cashier\PaymentMethod` que deseja excluir:

```php
    $paymentMethod->delete();
```

O método `deletePaymentMethod` irá excluir um método de pagamento específico do modelo de cobrança.

```php
    $user->deletePaymentMethod('pm_visa');
```

A função 'deletePaymentMethods' irá excluir todas as informações de métodos de pagamento para o modelo cobrável:

```php
    $user->deletePaymentMethods();
```

Por padrão, este método irá excluir os métodos de pagamento de todo tipo. Para excluir métodos de pagamento de um tipo específico você pode passar o 'tipo' como argumento para o método:

```php
    $user->deletePaymentMethods('sepa_debit');
```

> [ALERTA]
> Se um usuário tem uma assinatura ativa, sua aplicação não deve permitir que eles excluam seu método de pagamento padrão.

## Assinaturas

Assinaturas fornecem uma maneira de configurar pagamentos recorrentes para seus clientes. As assinaturas do Stripe gerenciadas pelo Cashier oferecem suporte a vários preços e quantidades de assinatura, testes, e mais.

### Criando Assinaturas

Para criar uma assinatura, primeiro recupere um modelo de cobrança, que normalmente será um usuário do tipo App \ Models \ User . Uma vez que você recuperou o modelo de instância, você pode usar o método newSubscription para criar a assinatura do modelo.

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription(
            'default', 'price_monthly'
        )->create($request->paymentMethodId);

        // ...
    });
```

O primeiro argumento passado para o método `newSubscription` deve ser o tipo interno da assinatura. Se a sua aplicação só oferece uma assinatura, você pode chamar isso de "padrão" ou "principal". Este tipo de assinatura é apenas para uso interno do aplicativo e não deve ser mostrado aos usuários. Além disso, ele não deve conter espaços e nunca deve ser alterado depois que a assinatura for criada. O segundo argumento é o preço específico pelo qual o usuário está se inscrevendo. Este valor deve corresponder ao identificador do preço na Stripe.

O método 'create', que aceita um [identificador do método de pagamento Stripe](#storing-payment-methods) ou objeto 'Stripe PaymentMethod', iniciará a assinatura, atualizando seu banco de dados com a ID do cliente Stripe e outras informações de cobrança relevantes.

> [AVERTENÇÃO]
> Passar um identificador de pagamento diretamente para o método de assinatura 'criar' também adicionará automaticamente para os métodos de pagamento armazenados do usuário.

#### Coleta de pagamentos recorrentes por e-mails de faturas

Em vez de coletar automaticamente os pagamentos recorrentes do cliente, você pode instruir o Stripe para enviar uma fatura para o cliente sempre que o pagamento recorrente estiver em dia. Então, o cliente pode pagar manualmente a fatura quando a receber. O cliente não precisa fornecer um método de pagamento com antecedência ao coletar pagamentos recorrentes por meio de faturas:

```php
    $user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

O tempo que o cliente tem para pagar sua fatura antes do cancelamento de sua assinatura é determinado pela opção "days_until_due". Por padrão, é de 30 dias. No entanto, você pode fornecer um valor específico para esta opção caso queira:

```php
    $user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
        'days_until_due' => 30
    ]);
```

#### Quantidades

Se você gostaria de definir um [valor] específico para o preço ao criar a assinatura, você deve invocar o método "quantity" no construtor de assinaturas antes da criação da assinatura.

```php
    $user->newSubscription('default', 'price_monthly')
         ->quantity(5)
         ->create($paymentMethod);
```

#### Detalhes Adicionais

Se você gostaria de especificar opções adicionais [cliente](https://stripe.com/docs/api/customers/create) ou  [assinatura](https://stripe.com/docs/api/subscriptions/create) suportadas pelo Stripe, você pode fazer isso passando-os como o segundo e terceiro argumentos para o método "criar":

```php
    $user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
        'email' => $email,
    ], [
        'metadata' => ['note' => 'Some extra information.'],
    ]);
```

#### Cupons

Se você gostaria de aplicar um cupom quando criar a assinatura, você pode usar o método `withCoupon`:

```php
    $user->newSubscription('default', 'price_monthly')
         ->withCoupon('code')
         ->create($paymentMethod);
```

Ou, se você gostaria de aplicar um [código promocional do Stripe](https://stripe.com/docs/billing/subscriptions/discounts/codes), você pode usar o método withPromotionCode:

```php
    $user->newSubscription('default', 'price_monthly')
         ->withPromotionCode('promo_code_id')
         ->create($paymentMethod);
```

O código promocional fornecido deve ser o ID da API Stripe atribuído ao código promocional e não o código promocional de frente do cliente. Se você precisar encontrar um ID de código promocional com base em um código promocional de frente do cliente fornecido, você pode usar o método `findPromotionCode`:

```php
    // Find a promotion code ID by its customer facing code...
    $promotionCode = $user->findPromotionCode('SUMMERSALE');

    // Find an active promotion code ID by its customer facing code...
    $promotionCode = $user->findActivePromotionCode('SUMMERSALE');
```

No exemplo acima, o objeto retornado `$promotionCode` é uma instância de `Laravel/Cashier/PromotionCode`. Esta classe decora um objeto subjacente `Stripe\PromotionCode`. Você pode recuperar o cupom associado ao código promocional invocando o método `coupon`:

```php
    $coupon = $user->findPromotionCode('SUMMERSALE')->coupon();
```

A instância do cupom permite determinar o valor da desconto e se o cupom representa um desconto fixo ou percentual:

```php
    if ($coupon->isPercentage()) {
        return $coupon->percentOff().'%'; // 21.5%
    } else {
        return $coupon->amountOff(); // $5.99
    }
```

Você também pode recuperar os descontos aplicados atualmente ao cliente ou assinatura:

```php
    $discount = $billable->discount();

    $discount = $subscription->discount();
```

As instâncias retornadas do `Laravel/Cashier/Discount` decoram um objeto de instância subjacente do `Stripe/Discount`. Você pode recuperar o cupom associado a esta desconto invocando o método `coupon`:

```php
    $coupon = $subscription->discount()->coupon();
```

Se você quiser aplicar um novo cupom ou código promocional para um cliente ou assinatura, você pode fazer isso através dos métodos `applyCoupon` ou `applyPromotionCode`:

```php
    $billable->applyCoupon('coupon_id');
    $billable->applyPromotionCode('promotion_code_id');

    $subscription->applyCoupon('coupon_id');
    $subscription->applyPromotionCode('promotion_code_id');
```

Lembre-se de usar o Stripe API ID atribuído ao código promocional e não o código do cliente. Apenas um cupom ou código promocional pode ser aplicado a um cliente ou assinatura por vez.

Para mais informações sobre esse assunto, consulte a documentação do Stripe em relação a [cupons](https://stripe.com/docs/billing/subscriptions/coupons) e [códigos promocionais](https://stripe.com/docs/billing/subscriptions/coupons/codes).

#### Adicionando Assinaturas

Se você deseja adicionar uma assinatura para um cliente que já tem um método de pagamento padrão, você pode invocar o método 'add' no construtor da assinatura.

```php
    use App\Models\User;

    $user = User::find(1);

    $user->newSubscription('default', 'price_monthly')->add();
```

#### Criando Assinaturas pelo Painel do Stripe

Você também pode criar assinaturas diretamente no painel Stripe. Quando você o fizer, o Cashier sincronizará as assinaturas recém-adicionadas e atribuirá a elas um tipo de "padrão". Para personalizar o tipo de assinatura que é atribuído às assinaturas criadas diretamente no painel, [defina manipuladores de eventos webhook](#definindo-manipuladores-de-eventos-webhook).

Além disso, você só pode criar um tipo de assinatura no painel do Stripe. Se seu aplicativo oferece vários assinaturas que usam tipos diferentes, apenas um tipo de assinatura pode ser adicionado através do painel do Stripe.

Finalmente, você deve sempre fazer com que apenas uma assinatura ativa seja adicionada por tipo de assinatura que sua aplicação oferece. Se um cliente tiver duas assinaturas 'padrão', apenas a mais recentemente adicionada será usada pelo Cashier, apesar de ambas poderiam ser sincronizadas com seu banco de dados da aplicação.

### Verificando o status da assinatura...

Uma vez que o cliente se inscreve no seu aplicativo, você pode verificar facilmente seu status de assinatura usando uma variedade de métodos convenientes. Primeiro, o método 'assinado' retorna 'verdadeiro' se o cliente tiver uma assinatura ativa, mesmo que a assinatura esteja atualmente em seu período de teste. O método 'assinado' aceita o tipo da assinatura como o primeiro argumento:

```php
    if ($user->subscribed('default')) {
        // ...
    }
```

O método `subscribed` também faz um ótimo candidato para um [Middleware de rota](/docs/{{version}}/middleware) , permitindo que você filtre o acesso a rotas e controladores com base no status de assinatura do usuário.

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
            if ($request->user() && ! $request->user()->subscribed('default')) {
                // This user is not a paying customer...
                return redirect('billing');
            }

            return $next($request);
        }
    }
```

Se você gostaria de determinar se um usuário ainda está no seu período experimental, você pode usar o método "onTrial". Este método pode ser útil para determinar se você deve exibir uma mensagem de aviso ao usuário que ele ainda está no período experimental.

```php
    if ($user->subscription('default')->onTrial()) {
        // ...
    }
```

O método 'subscribedToProduct' pode ser usado para determinar se o usuário está inscrito em um produto específico baseado no identificador de um determinado produto do Stripe. Em uma Stripe, os produtos são coleções de preços. Neste exemplo, vamos determinar se a assinatura padrão do usuário é ativamente assinada para o "produto premium" da aplicação. O identificador do produto fornecido deve corresponder a um dos identificadores do seu produto no painel Stripe:

```php
    if ($user->subscribedToProduct('prod_premium', 'default')) {
        // ...
    }
```

Ao passar uma matriz para o método `subscribedToProduct`, você pode determinar se a assinatura padrão do usuário está ativamente assinada com o produto "básico" ou "premium" da aplicação.

```php
    if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
        // ...
    }
```

O método 'subscribedToPrice' pode ser usado para determinar se uma assinatura do cliente corresponde a um determinado ID de preço:

```php
    if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
        // ...
    }
```

O método `recurring` pode ser usado para determinar se o usuário está atualmente inscrito e não mais em sua fase de teste:

```php
    if ($user->subscription('default')->recurring()) {
        // ...
    }
```

> [!ALERTA]
> Se um usuário tem duas assinaturas do mesmo tipo, a assinatura mais recente será sempre retornada pelo método `subscription`. Por exemplo, o usuário pode ter duas assinaturas com o tipo de "default"; no entanto, uma dessas assinaturas pode ser velha e expirada, enquanto que a outra é atual e ativa. A assinatura mais recente será sempre retornada, enquanto as assinaturas mais antigas são mantidas no banco de dados para revisão histórica.

#### Assinatura Cancelada

Para determinar se o usuário foi uma vez um assinante ativo mas cancelou sua assinatura, você pode usar o método `cancellado`:

```php
    if ($user->subscription('default')->canceled()) {
        // ...
    }
```

Você também pode determinar se um usuário cancelou sua assinatura mas ainda está no período de carência até que a assinatura termine totalmente. Por exemplo, se um usuário cancela uma assinatura em 5 de março, originalmente programado para expirar em 10 de março, o usuário está em seu período de carência até 10 de março. Observe que o método `assinado` ainda retorna verdadeiro durante este tempo:

```php
    if ($user->subscription('default')->onGracePeriod()) {
        // ...
    }
```

Para determinar se o usuário cancelou sua assinatura e não está mais em período de carência, você pode usar o método 'ended':

```php
    if ($user->subscription('default')->ended()) {
        // ...
    }
```

#### Status Incompleto e Passado do Prazo

Se uma assinatura exigir uma ação de pagamento secundário após a criação, a assinatura será marcada como "incompleta". Os estados de assinaturas são armazenados na coluna "stripe_status" da tabela de assinaturas do "Cashier".

Da mesma forma, se uma ação de pagamento secundário for necessária quando as trocas os preços, o assinatura será marcada como 'passado-o-tempo'. Quando sua assinatura está em qualquer um desses estados ele não estará ativo até que o cliente tenha confirmado seu pagamento. Determinar se uma assinatura tem um pagamento incompleto pode ser alcançado usando o método `hasIncompletePayment` no modelo faturável ou em uma instância de assinatura:

```php
    if ($user->hasIncompletePayment('default')) {
        // ...
    }

    if ($user->subscription('default')->hasIncompletePayment()) {
        // ...
    }
```

Quando uma assinatura tiver um pagamento incompleto, você deve direcionar o usuário para a página de confirmação de pagamento do tesoureiro passando o identificador `latestPayment`. Você pode utilizar o método `latestPayment` disponível na instância da assinatura para recuperar este identificador:

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    Please confirm your payment.
</a>
```

Se você gostaria que a assinatura ainda fosse considerada ativa quando estiver em um estado 'past_due' ou 'incomplete', você pode usar os métodos 'keepPastDueSubscriptionsActive' e 'keepIncompleteSubscriptionsActive' fornecidos pelo Cashier. Geralmente, esses métodos devem ser chamados no método 'register' do seu provedor de 'App\Providers\AppServiceProvider':

```php
    use Laravel\Cashier\Cashier;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        Cashier::keepPastDueSubscriptionsActive();
        Cashier::keepIncompleteSubscriptionsActive();
    }
```

> ¡¡ALERTA!
> Quando uma assinatura está em um estado 'incompleto', não pode ser alterada até que o pagamento seja confirmado. Portanto, os métodos 'swap' e 'updateQuantity' lançarão uma exceção quando a assinatura estiver em um estado 'incompleto'.

#### Assinatura de Escopo

A maioria dos estados de assinatura também estão disponíveis como escopos de consulta, para que você possa facilmente consultar o banco de dados para obter assinaturas que são em um determinado estado:

```php
    // Get all active subscriptions...
    $subscriptions = Subscription::query()->active()->get();

    // Get all of the canceled subscriptions for a user...
    $subscriptions = $user->subscriptions()->canceled()->get();
```

Uma lista completa de escopos disponíveis está abaixo.

```php
    Subscription::query()->active();
    Subscription::query()->canceled();
    Subscription::query()->ended();
    Subscription::query()->incomplete();
    Subscription::query()->notCanceled();
    Subscription::query()->notOnGracePeriod();
    Subscription::query()->notOnTrial();
    Subscription::query()->onGracePeriod();
    Subscription::query()->onTrial();
    Subscription::query()->pastDue();
    Subscription::query()->recurring();
```

### Alterações de preço

Depois de um cliente se inscrever no seu aplicativo, eles podem ocasionalmente querer mudar para uma nova taxa de assinatura. Para trocar o cliente para uma nova taxa, passe o identificador da taxa do Stripe para o método 'swap'. Quando as taxas são trocadas, pressupõe-se que o usuário gostaria de reativar sua assinatura se ela foi previamente cancelada. O identificador de preço fornecido deve corresponder a um identificador de preço do Stripe disponível no painel do Stripe:

```php
    use App\Models\User;

    $user = App\Models\User::find(1);

    $user->subscription('default')->swap('price_yearly');
```

Se o cliente estiver em teste, o período de teste será mantido. Além disso, se uma "quantidade" existir para a assinatura, essa quantidade também será mantida.

Se você gostaria de trocar os preços e anular qualquer teste o cliente está atualmente em, você pode invocar o método `skipTrial`:

```php
    $user->subscription('default')
            ->skipTrial()
            ->swap('price_yearly');
```

Se você quiser trocar os preços e emitir uma fatura imediatamente em vez de esperar até o próximo ciclo de cobrança do cliente, você pode usar o método swapAndInvoice:

```php
    $user = User::find(1);

    $user->subscription('default')->swapAndInvoice('price_yearly');
```

#### Proporcionais

Por padrão, o Stripe aplica taxas de forma proporcional quando se troca entre preços. O método 'noProrate' pode ser usado para atualizar o preço da assinatura sem aplicar a taxa de forma proporcional:

```php
    $user->subscription('default')->noProrate()->swap('price_yearly');
```

Para mais informações sobre a divisão de assinaturas, consulte a documentação da Stripe.

> [!Aviso]
> Executar o método `noProrate` antes do `swapAndInvoice` não terá nenhum efeito na divisão. Será sempre emitido uma nota fiscal.

### Quantidade de Assinatura

Em alguns casos as assinaturas são afetadas pela "quantidade". Por exemplo, uma aplicação de gerenciamento de projetos pode cobrar $10 por mês por projeto. Você pode utilizar os métodos `incrementQuantity` e `decrementQuantity` para facilmente incrementar ou decrementar sua quantidade de assinatura:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->subscription('default')->incrementQuantity();

    // Add five to the subscription's current quantity...
    $user->subscription('default')->incrementQuantity(5);

    $user->subscription('default')->decrementQuantity();

    // Subtract five from the subscription's current quantity...
    $user->subscription('default')->decrementQuantity(5);
```

Alternativamente, você pode definir uma quantidade específica usando o método updateQuantity:

```php
    $user->subscription('default')->updateQuantity(10);
```

O método `noProrate` pode ser usado para atualizar a quantidade da assinatura sem fazer prorrata das cobranças:

```php
    $user->subscription('default')->noProrate()->updateQuantity(10);
```

Para mais informações sobre quantidades de assinatura, consulte a documentação do Stripe em [https://stripe.com/docs/subscriptions/quantities].

#### Quantidades para Assinaturas com Múltiplos Produtos

Se sua assinatura é uma [assinatura com vários produtos](#assinaturas-com-múltiplos-produtos) você deve passar o ID do preço cuja quantidade deseja aumentar ou diminuir como segundo argumento para os métodos de incremento e decremento:

```php
    $user->subscription('default')->incrementQuantity(1, 'price_chat');
```

### Assinaturas Com Múltiplos Produtos

[Assinaturas com vários produtos](https://stripe.com/docs/billing/subscriptions/multiple-products) permitem que você atribua vários produtos de cobrança a uma única assinatura. Por exemplo, imagine que você está construindo um aplicativo "helpdesk" de atendimento ao cliente que tem um preço de assinatura base de US$ 10 por mês mas oferece um produto adicional de bate-papo ao vivo para mais US$ 15 por mês. Informações para assinaturas com vários produtos são armazenadas na tabela 'subscription_items' do banco de dados do Cashier.

Você pode especificar vários produtos para uma assinatura ao passar um array de preços como o segundo argumento do método "newSubscription":

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription('default', [
            'price_monthly',
            'price_chat',
        ])->create($request->paymentMethodId);

        // ...
    });
```

No exemplo acima, o cliente terá dois preços associados à sua assinatura "padrão". Ambos os preços serão cobrados em intervalos de cobrança respectivos. Se necessário, você pode usar o método "quantidade" para indicar uma quantidade específica para cada preço:

```php
    $user = User::find(1);

    $user->newSubscription('default', ['price_monthly', 'price_chat'])
        ->quantity(5, 'price_chat')
        ->create($paymentMethod);
```

Se você gostaria de adicionar um preço a uma assinatura existente, você pode invocar o método 'addPrice' da assinatura.

```php
    $user = User::find(1);

    $user->subscription('default')->addPrice('price_chat');
```

O exemplo acima adicionará o novo preço e o cliente será cobrado por isso no próximo ciclo de cobrança. Se você quiser cobrar ao cliente imediatamente você pode usar o método `addPriceAndInvoice`:

```php
    $user->subscription('default')->addPriceAndInvoice('price_chat');
```

Se você gostaria de acrescentar um preço com uma quantidade específica, você pode passar a quantidade como o segundo argumento dos métodos `addPrice` ou `addPriceAndInvoice`:

```php
    $user = User::find(1);

    $user->subscription('default')->addPrice('price_chat', 5);
```

Você pode remover os preços das assinaturas usando o método `removePrice`:

```php
    $user->subscription('default')->removePrice('price_chat');
```

> [Aviso]
> Você não pode remover o último preço de uma assinatura. Em vez disso, você deve simplesmente cancelar a assinatura.

#### Troca de Preços

Você também pode alterar os preços ligados a uma assinatura com vários produtos. Por exemplo, imagine um cliente tenha uma "assinatura básica" com um produto adicional de "preço chat" e você deseja atualizar o cliente do "preço básico" para o "preço pro":

```php
    use App\Models\User;

    $user = User::find(1);

    $user->subscription('default')->swap(['price_pro', 'price_chat']);
```

Ao executar o exemplo acima, o item subjacente de assinatura com o "price_basic" é excluído e o item com o "price_chat" é preservado. Além disso, um novo item de assinatura para o "price_pro" é criado.

Você também pode especificar as opções de item de assinatura passando uma matriz de pares chave-valor para o método 'swap'. Por exemplo, você talvez precise especificar as quantidades dos preços da assinatura:

```php
    $user = User::find(1);

    $user->subscription('default')->swap([
        'price_pro' => ['quantity' => 5],
        'price_chat'
    ]);
```

Se você deseja trocar um único preço em uma assinatura, você pode fazer isso usando o método 'swap' no item de assinatura em si. Este método é especialmente útil se você gostaria de manter todo o metadado existente sobre os outros preços da assinatura:

```php
    $user = User::find(1);

    $user->subscription('default')
            ->findItemOrFail('price_basic')
            ->swap('price_pro');
```

#### Proporcionalidade

Por padrão, o Stripe irá aplicar uma cobrança proporcional quando você adicionar ou remover preços de um subscriptor com vários produtos. Se você gostaria de fazer uma alteração de preço sem a aplicação de proração, você deve ligar o método `noProrate` à sua operação de preço:

```php
    $user->subscription('default')->noProrate()->removePrice('price_chat');
```

#### Quantidades

Se você gostaria de atualizar quantidades em preços de assinatura individuais, você pode fazê-lo usando os [métodos de quantidade existentes](#quantidade-de-assinatura) passando o ID do preço como um argumento adicional para o método:

```php
    $user = User::find(1);

    $user->subscription('default')->incrementQuantity(5, 'price_chat');

    $user->subscription('default')->decrementQuantity(3, 'price_chat');

    $user->subscription('default')->updateQuantity(10, 'price_chat');
```

> [ALERTA]
> Quando uma assinatura tem vários preços o atributo 'stripe_price' e 'quantity' no modelo 'Subscription' será nulo. Para acessar os atributos de preço individuais você deve usar a relação 'items' disponível no modelo 'Subscription'.

#### Itens de assinatura

Quando uma assinatura tem vários preços, ela terá vários itens de assinaturas armazenados na tabela subscription_items no seu banco de dados. Você pode acessar esses itens através da relação 'items' na assinatura.

```php
    use App\Models\User;

    $user = User::find(1);

    $subscriptionItem = $user->subscription('default')->items->first();

    // Retrieve the Stripe price and quantity for a specific item...
    $stripePrice = $subscriptionItem->stripe_price;
    $quantity = $subscriptionItem->quantity;
```

Você também pode recuperar um preço específico usando o método findItemOrFail():

```php
    $user = User::find(1);

    $subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

### Assinaturas Múltiplas

A Stripe permite que seus clientes possam ter múltiplas assinaturas ao mesmo tempo. Por exemplo, você pode executar uma academia que oferece uma assinatura de natação e uma assinatura de musculação, e cada assinatura pode ter diferentes preços. Claro, os clientes devem ser capazes de se inscrever em ambos ou qualquer um dos planos.

Ao criar suas assinaturas, você pode fornecer o tipo de assinatura ao método "newSubscription". O tipo pode ser qualquer string que representa o tipo de assinatura o usuário está iniciando:

```php
    use Illuminate\Http\Request;

    Route::post('/swimming/subscribe', function (Request $request) {
        $request->user()->newSubscription('swimming')
            ->price('price_swimming_monthly')
            ->create($request->paymentMethodId);

        // ...
    });
```

Neste exemplo, iniciamos uma assinatura mensal para o cliente. No entanto, eles podem querer mudar para uma assinatura anual em algum momento. Ao ajustar a assinatura do cliente, podemos simplesmente trocar os preços na assinatura "natação":

```php
    $user->subscription('swimming')->swap('price_swimming_yearly');
```

Claro, você também pode cancelar a assinatura toda:

```php
    $user->subscription('swimming')->cancel();
```

### Contagem métrica

O [faturamento medido](https://stripe.com/docs/billing/subscriptions/metered-billing) permite que você cobre dos clientes com base no uso do produto durante um ciclo de faturamento. Por exemplo, você pode cobrar dos clientes com base na quantidade de mensagens ou emails que eles enviam por mês.

Para começar usando o cobrança por uso, primeiro você precisa criar um novo produto no painel do Stripe com um preço cobrado por uso. Em seguida, utilize o `meteredPrice` para adicionar o ID de preço cobrado por uso à assinatura do cliente:

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription('default')
            ->meteredPrice('price_metered')
            ->create($request->paymentMethodId);

        // ...
    });
```

Você também pode iniciar uma assinatura com cobrança automática usando o [Stripe Checkout](#checkout):

```php
    $checkout = Auth::user()
            ->newSubscription('default', [])
            ->meteredPrice('price_metered')
            ->checkout();

    return view('your-checkout-view', [
        'checkout' => $checkout,
    ]);
```

#### Relatório de Uso

Quando o seu cliente utilizar o aplicativo você irá notificar ao Stripe para que ele possa ser cobrado de forma precisa. Para incrementar o uso de uma assinatura medidora você pode usar o método 'reportUsage':

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsage();
```

Por padrão, um “quantidade de utilização” de 1 é adicionada ao período de cobrança. Alternativamente, você pode passar uma quantidade específica de “utilização” para acrescentar à utilização do cliente no período de cobrança:

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsage(15);
```

Se sua aplicação oferece vários preços em uma única assinatura, você precisará usar o método `reportUsageFor` para especificar qual preço de medição deseja relatar os dados de uso:

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsageFor('price_metered', 15);
```

Às vezes você pode precisar atualizar o uso que você havia reportado anteriormente. Para fazer isso, você pode passar um timestamp ou uma instância `DateTimeInterface` como o segundo parâmetro para reportUsage. Quando fizer isso, a Stripe irá atualizar o uso que foi reportado no momento dado. Você pode continuar a atualizar registros de uso anteriores até que a data e hora dada ainda esteja dentro do período de cobrança atual:

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsage(5, $timestamp);
```

#### Recuperando Registros de Uso

Para recuperar o histórico de uso de um cliente, você pode usar o método `usageRecords` da assinatura:

```php
    $user = User::find(1);

    $usageRecords = $user->subscription('default')->usageRecords();
```

Se sua aplicação oferece vários preços em um único plano de assinatura, você pode usar o método "usageRecordsFor" para especificar o preço medido que deseja obter registros de uso para:

```php
    $user = User::find(1);

    $usageRecords = $user->subscription('default')->usageRecordsFor('price_metered');
```

As métodos `usageRecords` e `usageRecordsFor` retornam uma instância de `Collection`, contendo um array associativo com os registros de uso. Você pode iterar sobre este array para exibir o total de uso do cliente:

```php
    @foreach ($usageRecords as $usageRecord)
        - Period Starting: {{ $usageRecord['period']['start'] }}
        - Period Ending: {{ $usageRecord['period']['end'] }}
        - Total Usage: {{ $usageRecord['total_usage'] }}
    @endforeach
```

Para uma referência completa de todos os dados de uso retornados e como usar a paginação baseada em cursor do Stripe, consulte [a documentação oficial da API do Stripe](https://stripe.com/docs/api/usage_records/subscription_item_summary_list).

### Taxas de assinatura

> [Aviso!]
> Em vez de calcular as Taxas de Imposto manualmente, você pode [calcular automaticamente os impostos usando a Tasa de Imposto do Stripe](#taxa-configuração)

Para especificar as taxas de impostos que um usuário paga em uma assinatura, você deve implementar o método `taxRates` no seu modelo faturável e retornar uma matriz contendo os IDs da taxa de imposto do Stripe. Você pode definir essas taxas de impostos na [sua conta do Stripe](https://dashboard.stripe.com/test/tax-rates):

```php
    /**
     * The tax rates that should apply to the customer's subscriptions.
     *
     * @return array<int, string>
     */
    public function taxRates(): array
    {
        return ['txr_id'];
    }
```

A função `taxrates` permite que você aplique uma taxa de imposto em um cliente por vez, o que pode ser útil para um usuário base de vários países e taxas de impostos diferentes.

Se você está oferecendo assinaturas com vários produtos, você pode definir diferentes taxas de impostos para cada preço implementando um método `priceTaxRates` no seu modelo faturável:

```php
    /**
     * The tax rates that should apply to the customer's subscriptions.
     *
     * @return array<string, array<int, string>>
     */
    public function priceTaxRates(): array
    {
        return [
            'price_monthly' => ['txr_id'],
        ];
    }
```

> [Aviso]
> O método 'taxRates' só se aplica a taxas de assinatura. Se você usar o Casher para fazer "carregar" de uma única vez, será preciso especificar manualmente a taxa de imposto no momento.

#### Sincronizando as taxas do imposto

Ao alterar as IDs de taxa codificadas no método de "taxrates", as configurações de impostos das assinaturas existentes do usuário permanecerão as mesmas. Se você quiser atualizar o valor de imposto para as assinaturas existentes com os novos valores de "taxrates", você deve chamar o método 'syncTaxRates' na instância da assinatura do usuário:

```php
    $user->subscription('default')->syncTaxRates();
```

Isso também sincronizará as taxas de impostos para itens para uma assinatura com vários produtos. Se o seu aplicativo oferece assinaturas com vários produtos, você deve garantir que seu modelo faturável implemente o método `priceTaxRates` [discutido acima](#tarifas-de-assinatura).

#### Alívio fiscal

O atendente também oferece os métodos 'isNotTaxExempt', 'isTaxExempt' e 'reverseCharge Applies' para determinar se o cliente é isento de impostos. Esses métodos chamarão a API do Stripe para determinar o estado da isenção fiscal do cliente:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->isTaxExempt();
    $user->isNotTaxExempt();
    $user->reverseChargeApplies();
```

> [!ALERTA]
> Estes métodos também estão disponíveis em qualquer objeto Invoice de Laravel/Caixa. No entanto, quando invocado em um objeto Invoice, os métodos determinarão o status da isenção na hora que a fatura foi criada.

### Assinatura Data de Lançamento

Por padrão, o ciclo de cobrança é ancorado na data em que o serviço foi criado ou, se um teste gratuito estiver sendo usado, na data do fim do teste. Se quiser modificar a data da âncora do ciclo de cobrança, você pode usar o método `anchorBillingCycleOn`:

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $anchor = Carbon::parse('first day of next month');

        $request->user()->newSubscription('default', 'price_monthly')
                    ->anchorBillingCycleOn($anchor->startOfDay())
                    ->create($request->paymentMethodId);

        // ...
    });
```

Para mais informações sobre como gerenciar os ciclos de cobrança das assinaturas, consulte a documentação de ciclo de cobrança do Stripe em [Stripe billing cycle documentation](https://stripe.com/docs/billing/subscriptions/billing-cycle).

### Cancelamento de Assinaturas

Para cancelar uma assinatura, chame o método `cancel` da assinatura do usuário:

```php
    $user->subscription('default')->cancel();
```

Ao cancelar uma assinatura, o caixa irá automaticamente definir a coluna "ends_at" na tabela de banco de dados de assinaturas. Essa coluna é usada para saber quando o método "assinado" deve começar retornando "falso".

Por exemplo, se um cliente cancelar uma assinatura em 1º de março, mas a assinatura não teria sido marcada para acabar até 5 de março, o método "assinado" continuará retornando "verdadeiro" até 5 de março. Isso ocorre porque um usuário é tipicamente permitido continuar usando um aplicativo até o final do seu ciclo de cobrança.

Você pode determinar se um usuário cancelou sua assinatura mas ainda está no seu "período de carência" usando o método `onGracePeriod`:

```php
    if ($user->subscription('default')->onGracePeriod()) {
        // ...
    }
```

Se quiser anular uma assinatura imediatamente, chame o método 'cancelNow' na assinatura do usuário.

```php
    $user->subscription('default')->cancelNow();
```

Se você quiser cancelar uma assinatura imediatamente e faturar quaisquer usos medidos não faturados ou itens de fatura de nova / pendente, chame o método `cancelNowAndInvoice` da assinatura do usuário.

```php
    $user->subscription('default')->cancelNowAndInvoice();
```

Você também pode escolher cancelar a assinatura em um momento específico do tempo:

```php
    $user->subscription('default')->cancelAt(
        now()->addDays(10)
    );
```

Finalmente, você sempre deve cancelar as assinaturas dos usuários antes de excluir o modelo do usuário associado:

```php
    $user->subscription('default')->cancelNow();

    $user->delete();
```

### Resumindo Assinaturas

Se um cliente cancelou sua assinatura e você deseja restaurá-la, você pode invocar o método de "restaurar" na assinatura. O cliente deve ainda estar dentro do seu período de carência para poder restaurar uma assinatura.

```php
    $user->subscription('default')->resume();
```

Se o cliente cancelar uma assinatura e depois reativá-la antes que a assinatura tenha terminado, ele não será cobrado imediatamente. Em vez disso, sua assinatura será reativada e eles serão cobrados no ciclo de cobrança original.

## Testes de Assinatura

### Com pagamento antecipado do método

Se você deseja oferecer períodos de teste para seus clientes enquanto ainda coleta informações sobre o método de pagamento antecipadamente, você deve usar o `trialDays` ao criar suas assinaturas:

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription('default', 'price_monthly')
                    ->trialDays(10)
                    ->create($request->paymentMethodId);

        // ...
    });
```

Este método irá definir a data de término do período experimental no registro de assinatura dentro do banco de dados e instruir o Stripe a não começar a cobrança do cliente até após essa data. Quando se usa o método `trialDays`, o Cashier irá substituir qualquer período de teste padrão configurado para o preço em Stripe.

> ¡Atenção!
> Se o cliente não cancelar sua assinatura antes do término do período de teste ele será cobrado assim que terminar o período de testes, então você deve ter certeza de notificar seus usuários sobre a data em que seu teste terminará.

O método `trialUntil` permite que você forneça um objeto `DateTime` que especifique quando o período de teste deve terminar.

```php
    use Carbon\Carbon;

    $user->newSubscription('default', 'price_monthly')
                ->trialUntil(Carbon::now()->addDays(10))
                ->create($paymentMethod);
```

Você pode determinar se um usuário está dentro de sua fase de teste usando o método 'onTrial' da instância do usuário ou o método 'onTrial' da instância da assinatura. Os dois exemplos abaixo são equivalentes.

```php
    if ($user->onTrial('default')) {
        // ...
    }

    if ($user->subscription('default')->onTrial()) {
        // ...
    }
```

Você pode usar o método `endTrial` para acabar imediatamente uma avaliação de assinatura:

```php
    $user->subscription('default')->endTrial();
```

Para determinar se um teste existente já expirou, você pode usar os métodos `hasExpiredTrial`:

```php
    if ($user->hasExpiredTrial('default')) {
        // ...
    }

    if ($user->subscription('default')->hasExpiredTrial()) {
        // ...
    }
```

#### Definindo dias de teste em Stripe / Caixa

Você pode escolher definir quantos dias de teste seus preços recebem no painel da Stripe ou sempre passar-lhes explicitamente usando Cashier. Se você optar por definir seus dias de teste de preços na Stripe, deve estar ciente de que novas assinaturas, incluindo novas assinaturas para um cliente que tinha uma assinatura no passado, receberão sempre um período de teste a menos que você chame explicitamente o método `skipTrial()`.

### Sem método de pagamento antecipado

Se você gostaria de oferecer períodos de teste sem coletar as informações do método de pagamento do usuário, você pode definir a coluna "trial_ends_at" na conta do usuário para sua data final de teste desejada. Isso é tipicamente feito durante o registro do usuário:

```php
    use App\Models\User;

    $user = User::create([
        // ...
        'trial_ends_at' => now()->addDays(10),
    ]);
```

> ！[AVISO]
> Certifique-se de adicionar um [cast date](/docs/{{version}}/eloquent-mutators#date-casting) para o atributo 'trial_ends_at' dentro da definição de classe do seu modelo cobrável.

Caixa refere-se a este tipo de teste como um "teste genérico", já que ele não está vinculado à qualquer assinatura existente. O método `onTrial` na instância do modelo cobrável retornará `verdadeiro` se a data atual não passou o valor de `trial_ends_at`:

```php
    if ($user->onTrial()) {
        // User is within their trial period...
    }
```

Uma vez que você está pronto para criar uma assinatura real para o usuário, você pode usar o método 'newSubscription' como de costume:

```php
    $user = User::find(1);

    $user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

Para recuperar a data de término do teste do usuário, você pode usar o método 'trialEndsAt'. Esse método retornará uma instância de Carbon se um usuário estiver em um período experimental ou 'nulo' caso contrário. Você também pode passar um parâmetro opcional tipo de assinatura para obter a data de término do teste para uma assinatura específica diferente da padrão:

```php
    if ($user->onTrial()) {
        $trialEndsAt = $user->trialEndsAt('main');
    }
```

Você também pode usar o método `onGenericTrial` se quiser saber especificamente que o usuário está dentro do período de teste "geralmente" e ainda não criou uma assinatura real.

```php
    if ($user->onGenericTrial()) {
        // User is within their "generic" trial period...
    }
```

### Estendendo as tentativas

O método `extendTrial` permite a você estender o período de teste de uma assinatura depois que ela tenha sido criada. Se o período de teste já tiver terminado e o cliente já estiver sendo cobrado pela assinatura, você ainda pode oferecer-lhes um período de teste estendido. O tempo gasto no período de teste será deduzido da próxima fatura do cliente:

```php
    use App\Models\User;

    $subscription = User::find(1)->subscription('default');

    // End the trial 7 days from now...
    $subscription->extendTrial(
        now()->addDays(7)
    );

    // Add an additional 5 days to the trial...
    $subscription->extendTrial(
        $subscription->trial_ends_at->addDays(5)
    );
```

## Manipulando Webhooks do Stripe

> ！注意！
> Você pode usar [o Stripe CLI](https://stripe.com/docs/stripe-cli) para ajudar a testar webhooks durante o desenvolvimento local.

A Stripe pode notificar seu aplicativo de uma variedade de eventos por meio de webhooks. Por padrão, um endpoint apontado para o controlador webhook do Cashier está automaticamente registrado pelo provedor de serviços do Cashier. Este controlador lidará com todas as solicitações recebidas webhook.

Por padrão, o controlador do webhook do caixa cuidará automaticamente da cancelamento de assinaturas que têm muito cobranças com falha (como definido por suas configurações do Stripe), atualizações do cliente, exclusões de clientes, atualizações de assinatura e alterações no método de pagamento; no entanto, como logo descobriremos, você pode estender este controlador para lidar com qualquer evento webhook do Stripe que você goste.

Para garantir que seu aplicativo possa lidar com os webhooks do Stripe, certifique-se de configurar a URL do webhook no painel do Stripe. Por padrão, o controlador de webhook do Cashier responde ao caminho da URL `/stripe/webhook`. A lista completa de todos os webhooks que você deve ativar no painel do Stripe são:

- 'cliente.assinatura.criada'
- 'cliente.assinatura.atualizado'
"cliente.assinatura.exclusa"
- 'cliente.atualizado'
"cliente.deletado"
- `payment_method. automáticamente_atualizado`
`invoice.payment_action_required`
- 'invoice.payment_succeeded'

Para conveniência, o Cashier inclui um comando `cashier:webhook`. Este comando criará um webhook no Stripe que escutará todos os eventos necessários pelo Cashier.

```shell
php artisan cashier:webhook
```

Por padrão, o webhook criado irá apontar para o URL definido pela variável de ambiente APP_URL e a rota cashier.webhook que é incluída com o Cashier. Você pode fornecer a opção --url ao invocar o comando se quiser utilizar um URL diferente:

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

O gancho criado utilizará a versão da API do Stripe que o seu Cashier é compatível com. Se você gostaria de utilizar uma versão diferente do Stripe, você pode fornecer a opção ' --api-version ':

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

Após a criação, o webhook estará imediatamente ativo. Se você deseja criar o webhook mas quer que ele fique desativado até quando estiver pronto, você pode fornecer a opção `--disabled` ao invocar o comando:

```shell
php artisan cashier:webhook --disabled
```

> ¡¡ALERTA!
> Certifique-se de proteger as solicitações do webhook do Stripe com o middleware [verificação de assinatura de webhook](#verificando-assinaturas-de-webhook) incluído do Cashier.

#### Webhooks e Proteção CSRF

Como os webhooks do Stripe precisam contornar a proteção contra CSRF do Laravel ([CSRF]( "/docs/{{version}}/csrf")), você deve garantir que o Laravel não tente validar o token CSRF para os webhooks do Stripe em entrada. Para fazer isso, você deve excluir `stripe/*` da proteção CSRF no arquivo bootstrap/app.php de sua aplicação:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'stripe/*',
        ]);
    })
```

### Definindo manipuladores de eventos webhook

O atendente de caixa manipula automaticamente as cancelamentos de assinatura para cobranças malsucedidas e outros eventos webhooks comuns da Stripe. No entanto, se você tem eventos webhook adicionais que deseja manipular, você pode fazer isso ouvindo os seguintes eventos enviados pelo Cashier:

- 'Laravel/Cashier/Events/WebhookReceived'
- `Laravel\Cashier\Events\WebhookHandled`

Ambos os eventos contêm a carga total da web hook do Stripe. Por exemplo, se você deseja lidar com a web hook "invoice.payment_succeeded", você pode registrar um [ouvinte](/docs/{{version}}/events#definindo-ouvintes) que irá tratar o evento:

```php
    <?php

    namespace App\Listeners;

    use Laravel\Cashier\Events\WebhookReceived;

    class StripeEventListener
    {
        /**
         * Handle received Stripe webhooks.
         */
        public function handle(WebhookReceived $event): void
        {
            if ($event->payload['type'] === 'invoice.payment_succeeded') {
                // Handle the incoming event...
            }
        }
    }
```

### Verificando Assinaturas de Webhook

Para proteger suas Webhooks, você pode usar as [assinaturas de Webhook do Stripe](https://stripe.com/docs/webhooks/signatures). Por conveniência, o Cashier automaticamente inclui um middleware que valida se a solicitação de Webhooks do Stripe que está chegando é válida.

Para ativar a verificação de webhook, certifique-se de que a variável de ambiente `STRIPE_WEBHOOK_SECRET` está definida no arquivo `.env` do seu aplicativo. O 'segredo' do webhook poderá ser obtido na tela do painel da sua conta Stripe.

## Carga única

### Carga simples

Se você gostaria de fazer um pagamento único por conta do cliente, você pode usar o método `charge` em uma instância do modelo faturável. Você vai precisar fornecer um identificador de método de pagamento ([prover um identificador de método de pagamento](#payment-methods-for-single-charges)) como o segundo argumento para o método `charge`:

```php
    use Illuminate\Http\Request;

    Route::post('/purchase', function (Request $request) {
        $stripeCharge = $request->user()->charge(
            100, $request->paymentMethodId
        );

        // ...
    });
```

O método 'charge' aceita uma matriz como seu terceiro argumento, permitindo que você passe qualquer opção desejada para a criação de cobranças subjacentes do Stripe. Mais informações sobre as opções disponíveis ao criar cargas podem ser encontradas na documentação do Stripe em https://stripe.com/docs/api/charges/create:

```php
    $user->charge(100, $paymentMethod, [
        'custom_option' => $value,
    ]);
```

Você também pode usar o método 'carregar' sem um cliente subjacente ou usuário. Para fazer isso, invoque o método 'carregar' em uma nova instância do modelo de cobrança do seu aplicativo:

```php
    use App\Models\User;

    $stripeCharge = (new User)->charge(100, $paymentMethod);
```

O método 'charge' irá lançar uma exceção se a cobrança falhar. Se a cobrança for bem sucedida, um objeto de 'Laravel\Cashier\Payment' será retornado do método:

```php
    try {
        $payment = $user->charge(100, $paymentMethod);
    } catch (Exception $e) {
        // ...
    }
```

> [ALERTA]
> O método 'carga' aceita a quantia de pagamento no menor denominador da moeda utilizada por seu aplicativo. Por exemplo, se os clientes estiverem pagando em dólares americanos, as quantias devem ser especificadas em centavos.

### Carregar com fatura

Às vezes você pode precisar fazer uma cobrança única e oferecer um PDF de fatura ao cliente. O método `invoicePrice` permite que faça isso. Por exemplo, vamos emitir uma fatura para o cliente por cinco camisas novas:

```php
    $user->invoicePrice('price_tshirt', 5);
```

A fatura será imediatamente cobrada pelo método de pagamento padrão do usuário. O `invoicePrice` também aceita uma matriz como seu terceiro argumento. Esta matriz contém as opções de cobrança para o item da fatura. A quarta e última opção de cobrança aceita por este método é uma matriz que deve conter as opções de cobrança para a fatura em si:

```php
    $user->invoicePrice('price_tshirt', 5, [
        'discounts' => [
            ['coupon' => 'SUMMER21SALE']
        ],
    ], [
        'default_tax_rates' => ['txr_id'],
    ]);
```

Da mesma forma que `invoicePrice`, você pode usar o método 'tabPrice' para criar uma cobrança única para vários itens (até 250 itens por fatura) adicionando-os ao "bar" do cliente e depois cobrindo o cliente. Por exemplo, poderíamos cobrar um cliente por cinco camisas e dois copos:

```php
    $user->tabPrice('price_tshirt', 5);
    $user->tabPrice('price_mug', 2);
    $user->invoice();
```

Alternativamente você pode usar o método `invoiceFor` para fazer uma "taxa única" contra o método padrão de pagamento do cliente:

```php
    $user->invoiceFor('One Time Fee', 500);
```

Embora o método `invoiceFor` esteja disponível para você usar, é recomendado que utilize os métodos `invoicePrice` e `tabPrice` com preços pré-definidos. Ao fazê-lo, você terá acesso a melhores análises e dados dentro do seu painel Stripe de vendas por produto.

> [Aviso]
> O método 'invoice', 'invoicePrice' e 'invoiceFor' criarão uma fatura Stripe que fará novas tentativas de cobrança em caso de falha na cobrança. Se você não quiser que as faturas façam novas tentativas em caso de falha na cobrança, será necessário fechá-las usando a API do Stripe após o primeiro erro.

### Criando Payment Intent

Você pode criar uma nova intenção de pagamento do Stripe invocando o método "pay" em uma instância de modelo cobrável. A invocação desse método criará uma intenção de pagamento que será envolta por um objeto Laravel\Cashier\Payment:

```php
    use Illuminate\Http\Request;

    Route::post('/pay', function (Request $request) {
        $payment = $request->user()->pay(
            $request->get('amount')
        );

        return $payment->client_secret;
    });
```

Após criar a intenção de pagamento, você pode retornar o segredo do cliente para a interface do seu aplicativo para que o usuário possa completar o pagamento em seu navegador. Para ler mais sobre a criação de fluxos de pagamento inteiros usando intenções de pagamento do Stripe, por favor consulte a [documentação do Stripe](https://stripe.com/docs/payments/accept-a-payment?platform=web).

Ao utilizar o método de pagamento `pagar`, os métodos padrão habilitados no seu painel do Stripe estarão disponíveis para o cliente. Alternativamente, se você só deseja permitir alguns métodos específicos de pagamento a serem utilizados, você pode usar o método `pagarCom`:

```php
    use Illuminate\Http\Request;

    Route::post('/pay', function (Request $request) {
        $payment = $request->user()->payWith(
            $request->get('amount'), ['card', 'bancontact']
        );

        return $payment->client_secret;
    });
```

> [ALERTA]
> O método `pay` e o método `payWith` aceitam a quantia do pagamento no menor denominador da moeda utilizada por seu aplicativo. Por exemplo, se os clientes estão pagando em dólares norte-americanos, as quantidades devem ser especificadas em centavos.

### Resgate de Taxas

Se você precisa reembolsar uma cobrança do Stripe, você pode usar o método "refund". Este método aceita a Stripe [ID da intenção de pagamento](#payment-methods-for-single-charges) como seu primeiro argumento.

```php
    $payment = $user->charge(100, $paymentMethodId);

    $user->refund($payment->id);
```

## Faturas

### Recuperação de Faturas

Você pode facilmente recuperar uma matriz de faturas de um modelo cobrável usando o método `faturas`. O método `faturas` retorna uma coleção de instâncias de `Laravel/Cashier\Invoice`:

```php
    $invoices = $user->invoices();
```

Se você quiser incluir faturas pendentes nos resultados, utilize o método 'invoicesIncludingPending':

```php
    $invoices = $user->invoicesIncludingPending();
```

Você pode usar o método `findInvoice` para buscar uma nota fiscal específica pelo seu ID:

```php
    $invoice = $user->findInvoice($invoiceId);
```

#### Exibindo informações de nota fiscal

Ao listar as faturas do cliente, você pode usar os métodos da fatura para mostrar informações relevantes sobre esta. Por exemplo, você pode querer listar cada fatura em uma tabela, permitindo que o usuário baixe facilmente qualquer delas:

```php
    <table>
        @foreach ($invoices as $invoice)
            <tr>
                <td>{{ $invoice->date()->toFormattedDateString() }}</td>
                <td>{{ $invoice->total() }}</td>
                <td><a href="/user/invoice/{{ $invoice->id }}">Download</a></td>
            </tr>
        @endforeach
    </table>
```

### Faturas a pagar

Para recuperar a próxima fatura para um cliente, você pode usar o método 'upcomingInvoice':

```php
    $invoice = $user->upcomingInvoice();
```

Da mesma forma, se o cliente tiver múltiplas assinaturas, você também pode recuperar a próxima fatura para uma assinatura específica:

```php
    $invoice = $user->subscription('default')->upcomingInvoice();
```

### Visualizar faturas de assinatura

Usando o método 'previewInvoice', você pode visualizar uma fatura antes de fazer alterações nos preços. Isso permitirá que você saiba como sua fatura aparecerá quando uma alteração de preço específica for feita:

```php
    $invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

Você pode passar um array de preços para o método `previewInvoice`, para visualizar faturas com vários novos preços:

```php
    $invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

### Geração de PDF da Fatura

Antes de gerar arquivos PDF da fatura, você deve usar o Composer para instalar a biblioteca Dompdf, que é o renderizador padrão de faturamento do Cashier:

```shell
composer require dompdf/dompdf
```

Dentro de uma rota ou controlador, você pode usar o método `downloadInvoice` para gerar um arquivo em formato PDF do faturamento desejado. O método vai gerar automaticamente a resposta HTTP apropriada necessária para baixar o faturamento:

```php
    use Illuminate\Http\Request;

    Route::get('/user/invoice/{invoice}', function (Request $request, string $invoiceId) {
        return $request->user()->downloadInvoice($invoiceId);
    });
```

Por padrão, todos os dados da fatura são derivados dos dados do cliente e da fatura armazenados no Stripe. O nome de arquivo é baseado na configuração 'app.name'. No entanto, você pode personalizar alguns desses dados fornecendo um array como o segundo argumento para o método 'downloadInvoice'. Este array permite que você personalize informações, tais como seus detalhes de empresa e produto:

```php
    return $request->user()->downloadInvoice($invoiceId, [
        'vendor' => 'Your Company',
        'product' => 'Your Product',
        'street' => 'Main Str. 1',
        'location' => '2000 Antwerp, Belgium',
        'phone' => '+32 499 00 00 00',
        'email' => 'info@example.com',
        'url' => 'https://example.com',
        'vendorVat' => 'BE123456789',
    ]);
```

O método `downloadInvoice` também permite um nome de arquivo personalizado através de seu terceiro argumento. Este nome de arquivo será automaticamente sufixado com ``.pdf`:

```php
    return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

#### Renderizador de faturas personalizadas

O caixa também permite usar um renderizador de fatura personalizado. Por padrão, o Cashier usa a implementação do `DompdfInvoiceRenderer`, que utiliza a biblioteca PHP [dompdf](https://github.com/dompdf/dompdf) para gerar as faturas do Cashier. No entanto, você pode usar qualquer renderizador desejado implementando a interface `Laravel\Cashier\Contracts\InvoiceRenderer`. Por exemplo, você pode optar por renderizar uma fatura em PDF usando uma chamada de API para um serviço de renderização de PDF de terceiros:

```php
    use Illuminate\Support\Facades\Http;
    use Laravel\Cashier\Contracts\InvoiceRenderer;
    use Laravel\Cashier\Invoice;

    class ApiInvoiceRenderer implements InvoiceRenderer
    {
        /**
         * Render the given invoice and return the raw PDF bytes.
         */
        public function render(Invoice $invoice, array $data = [], array $options = []): string
        {
            $html = $invoice->view($data)->render();

            return Http::get('https://example.com/html-to-pdf', ['html' => $html])->get()->body();
        }
    }
```

Uma vez que você tenha implementado o contrato do renderizador de faturas, você deve atualizar o valor de configuração `cashier.invoices.renderer` no arquivo de configuração do seu aplicativo 'config/cashier.php'. Este valor de configuração deve ser definido para a classe de implementação do seu renderizador personalizado.

## Checkout

O Stripe também oferece suporte ao [Checkout do Stripe](https://stripe.com/payments/checkout). O Checkout tira o sofrimento de implementar páginas personalizadas para aceitar pagamentos fornecendo uma página pré-construída hospedada.

A documentação abaixo contém informações sobre como começar a utilizar o Checkout do Stripe com o Cashier. Para saber mais sobre o Checkout do Stripe, você também deve considerar revisar [a documentação própria da Stripe sobre Checkout](https://stripe.com/docs/payments/checkout).

### Verificação dos Produtos

Você pode fazer um checkout para um produto existente que foi criado dentro do seu painel do Stripe usando o método de checkout em um modelo cobrável. O método de checkout iniciará uma nova sessão de checkout do Stripe. Por padrão, é necessário passar um ID de preço do Stripe:

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout('price_tshirt');
    });
```

Se necessário, você também pode especificar uma quantidade de produto.

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout(['price_tshirt' => 15]);
    });
```

Quando um cliente visita esta rota ele será redirecionado para a página de checkout do Stripe. Por padrão, quando um usuário completa ou cancela uma compra com sucesso ele será redirecionado para a localização da rota 'home', mas você pode especificar URLs personalizadas usando as opções "success_url" e "cancel_url":

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout(['price_tshirt' => 1], [
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
    });
```

Quando definindo sua opção `success_url`, você pode instruir a Stripe para adicionar o ID da sessão do checkout como um parâmetro de string de consulta ao invocar seu URL. Para fazer isso, adicione a string literal ` {CHECKOUT_SESSION_ID}` à sua string de consulta `success_url`. A Stripe irá substituir esse espaço reservado pelo ID real da sessão de checkout:

```php
    use Illuminate\Http\Request;
    use Stripe\Checkout\Session;
    use Stripe\Customer;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout(['price_tshirt' => 1], [
            'success_url' => route('checkout-success').'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('checkout-cancel'),
        ]);
    });

    Route::get('/checkout-success', function (Request $request) {
        $checkoutSession = $request->user()->stripe()->checkout->sessions->retrieve($request->get('session_id'));

        return view('checkout.success', ['checkoutSession' => $checkoutSession]);
    })->name('checkout-success');
```

#### Códigos promocionais

Por padrão o Stripe Checkout não permite [códigos promocionais utilizáveis pelo usuário](https://stripe.com/docs/billing/subscriptions/discounts/codes). Felizmente, há uma maneira fácil de permitir essas funcionalidades para sua página de checkout. Para tanto, você pode invocar o método `allowPromotionCodes`:

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()
            ->allowPromotionCodes()
            ->checkout('price_tshirt');
    });
```

### Acompanhamento de Custos Único

Você também pode fazer um pagamento simples para um produto ad hoc que não foi criado em seu painel do Stripe. Para isso, você pode usar o método `checkoutCharge` em um modelo cobrável e passar-lhe uma quantia cobrável, um nome de produto e uma quantidade opcional. Quando um cliente visita esta rota, ele será redirecionado para a página Checkout do Stripe:

```php
    use Illuminate\Http\Request;

    Route::get('/charge-checkout', function (Request $request) {
        return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
    });
```

> ¡[ADVERTENCIA]
> Ao utilizar o método checkoutCharge, a Stripe sempre criará um novo produto e preço em seu painel da Stripe. Por isso, recomendamos que você crie os produtos com antecedência no seu painel da Stripe e utilize o método checkout em vez.

### Checkout de Assinatura

> ¡ALERTA!
> Para usar Stripe Checkout para assinaturas, você precisa ativar o webhook 'customer.subscription.created' no seu painel do Stripe. Este webhook criará a registro de assinatura em seu banco de dados e armazenará todos os itens de assinatura relevantes.

Você também pode usar checkout do stripe para iniciar assinaturas. Após definir sua assinatura com métodos de construtor de assinaturas do caixa, você pode chamar o método de checkout. Quando um cliente visita esta rota eles serão redirecionados para a página de checkout do stripe:

```php
    use Illuminate\Http\Request;

    Route::get('/subscription-checkout', function (Request $request) {
        return $request->user()
            ->newSubscription('default', 'price_monthly')
            ->checkout();
    });
```

Assim como nas configurações de checkout do produto, você pode personalizar as URLs de sucesso e cancelamento:

```php
    use Illuminate\Http\Request;

    Route::get('/subscription-checkout', function (Request $request) {
        return $request->user()
            ->newSubscription('default', 'price_monthly')
            ->checkout([
                'success_url' => route('your-success-route'),
                'cancel_url' => route('your-cancel-route'),
            ]);
    });
```

Claro, você também pode ativar códigos promocionais para os checkouts de assinatura:

```php
    use Illuminate\Http\Request;

    Route::get('/subscription-checkout', function (Request $request) {
        return $request->user()
            ->newSubscription('default', 'price_monthly')
            ->allowPromotionCodes()
            ->checkout();
    });
```

> [ALERTA]
> Infelizmente o checkout do Stripe não suporta todas as opções de cobrança de assinatura quando o início das assinaturas. Usando o método `anchorBillingCycleOn` no construtor de assinaturas, definindo a política de prorratação ou a configuração do comportamento de pagamento não terá nenhum efeito durante as sessões de checkout do Stripe. Consulte [a documentação da API da sessão do checkout](https://stripe.com/docs/api/checkout/sessions/create) para revisar quais parâmetros estão disponíveis.

#### Checkout e Testes Gratuitos da Stripe

É claro que você pode definir um período de teste ao criar uma assinatura que será completada usando Stripe Checkout:

```php
    $checkout = Auth::user()->newSubscription('default', 'price_monthly')
        ->trialDays(3)
        ->checkout();
```

Contudo, o período de teste deve ser de pelo menos 48 horas, que é a quantidade mínima de tempo de teste suportado por checkout da Stripe.

#### Assinaturas e Webhooks

Lembre-se, o Stripe e o Cashier atualizam os status de assinatura através de webhooks, então há uma possibilidade da assinatura ainda não estar ativa quando o cliente retornar ao aplicativo após inserir suas informações de pagamento. Para lidar com este cenário, você pode querer exibir uma mensagem informando o usuário que sua assinatura ou pagamento está pendente.

### Coleta de Identificação Fiscal

O Checkout também suporta coletar a ID do Imposto do Cliente. Para habilitar isso em uma sessão de checkout, invoque o método `collectTaxIds` durante a criação da sessão:

```php
    $checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

Ao invocar este método, um novo campo de seleção será disponibilizado para o cliente que permitirá que eles indiquem se estão comprando como empresa. Se sim, teremos a oportunidade de fornecer seu número de identificação fiscal.

> ¡¡ALERTA!
> Se você já configurou a cobrança automática de impostos em seu provedor de serviço então esse recurso será habilitado automaticamente e não é necessário invocar o método `collectTaxIds`.

### Acompanhamentos de hóspedes

Usando o método `Checkout::guest`, você pode iniciar sessões de checkout para convidados do seu aplicativo que não possuem uma "conta".

```php
    use Illuminate\Http\Request;
    use Laravel\Cashier\Checkout;

    Route::get('/product-checkout', function (Request $request) {
        return Checkout::guest()->create('price_tshirt', [
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
    });
```

Semelhante a quando está criando sessão de checkout para usuários existentes, você pode utilizar métodos adicionais disponíveis na instância do `Laravel\Cashier\CheckoutBuilder` para personalizar a sessão de checkout do convidado:

```php
    use Illuminate\Http\Request;
    use Laravel\Cashier\Checkout;

    Route::get('/product-checkout', function (Request $request) {
        return Checkout::guest()
            ->withPromotionCode('promo-code')
            ->create('price_tshirt', [
                'success_url' => route('your-success-route'),
                'cancel_url' => route('your-cancel-route'),
            ]);
    });
```

Depois que uma saída do checkout tenha sido concluída, o Stripe pode enviar um evento de webhook `checkout.session.completed`, portanto, certifique-se de configurar seu webhook Stripe para realmente enviar este evento para seu aplicativo. Uma vez que o webhook tenha sido habilitado no painel do Stripe, você pode [manipular o webhook com o Cashier](#handling-stripe-webhooks). O objeto contido na carga útil do webhook será um objeto de checkout que você pode inspecionar a fim de preencher o pedido do cliente.

## Tratando pagamentos falhados

Às vezes, pagamentos por assinaturas ou cargas únicas podem falhar. Quando isso acontece, o Cashier lançará uma exceção `Laravel\Cashier\Exceptions\IncompletePayment` que informa que esse problema ocorreu. Depois de capturar essa exceção, você tem duas opções de como proceder.

Primeiro, você pode redirecionar o cliente para a página de confirmação de pagamento específica incluída com Cashier. Esta página já tem uma rota associada que é registrada via provedor do serviço de Caixeiro. Então, você pode pegar a exceção `IncompletePayment` e redirecionar o usuário para a página de confirmação de pagamento:

```php
    use Laravel\Cashier\Exceptions\IncompletePayment;

    try {
        $subscription = $user->newSubscription('default', 'price_monthly')
                                ->create($paymentMethod);
    } catch (IncompletePayment $exception) {
        return redirect()->route(
            'cashier.payment',
            [$exception->payment->id, 'redirect' => route('home')]
        );
    }
```

Na página de confirmação do pagamento o cliente será solicitado a inserir suas informações do cartão de crédito novamente e realizar quaisquer ações adicionais necessárias pelo Stripe, tais como "3D Secure" de confirmação. Após confirmar o seu pagamento, o usuário será redirecionado para a URL fornecida pelo parâmetro "redirect" especificado acima. Ao ser redirecionado, as variáveis de string de consulta 'message' (string) e 'success' (integer) serão adicionadas à URL. A página de pagamento atualmente suporta os seguintes tipos de métodos de pagamento:

<div class="content-list" markdown="1">

- Cartões de Crédito
Alipay
Bancontact
- BECS Débito Direto
- EPS
- GiroPay
iDEAL
SEPA Direct Debit

</div>

Alternativamente, você poderia deixar o Stripe lidar com a confirmação de pagamento para você. Neste caso, em vez de redirecionar para a página de confirmação de pagamento, você pode configurar os e-mails automáticos de cobrança do Stripe no seu painel da Stripe. No entanto, se uma exceção de 'Pagamento Incompleto' for pega, você deve ainda informar o usuário que ele receberá um e-mail com instruções adicionais para a confirmação do pagamento.

Exceções de pagamento podem ser lançadas para os seguintes métodos: 'charge', 'invoiceFor' e 'invoice' em modelos usando o atributo 'Billable'. Ao interagir com assinaturas, os métodos 'create' no 'SubscriptionBuilder', e 'incrementAndInvoice' e 'swapAndInvoice' nos modelos 'Subscription' e 'SubscriptionItem', podem lançar exceções de pagamento incompletas.

Para determinar se uma assinatura existente tem pagamento incompleto, você pode usar o método `hasIncompletePayment` no modelo Billable ou numa instância de assinatura:

```php
    if ($user->hasIncompletePayment('default')) {
        // ...
    }

    if ($user->subscription('default')->hasIncompletePayment()) {
        // ...
    }
```

Você pode derivar o estado específico de um pagamento incompleto inspecionando a propriedade 'payment' na instância da exceção:

```php
    use Laravel\Cashier\Exceptions\IncompletePayment;

    try {
        $user->charge(1000, 'pm_card_threeDSecure2Required');
    } catch (IncompletePayment $exception) {
        // Get the payment intent status...
        $exception->payment->status;

        // Check specific conditions...
        if ($exception->payment->requiresPaymentMethod()) {
            // ...
        } elseif ($exception->payment->requiresConfirmation()) {
            // ...
        }
    }
```

### Confirmando pagamentos

Alguns métodos de pagamento exigem dados adicionais para confirmar os pagamentos. Por exemplo, os métodos de pagamento SEPA exigem dados adicionais "mandato" durante o processo de pagamento. Você pode fornecer esses dados ao caixa usando o método com opções de confirmação de pagamento.

```php
    $subscription->withPaymentConfirmationOptions([
        'mandate_data' => '...',
    ])->swap('price_xxx');
```

Você pode consultar a documentação da Stripe para ver todas as opções aceitas ao confirmar pagamentos.

## Autenticação de Cliente Forte

Se o seu negócio ou um de seus clientes está baseado na Europa, você precisará cumprir as regulamentações do Ato de Autenticação Forte do Cliente (SCA) da UE. Essas regulamentações foram impostas em setembro de 2019 pela União Europeia para evitar fraudes em pagamentos. Felizmente, o Stripe e o Cashier estão preparados para construir aplicações compatíveis com o SCA.

> (!ALERTA)
> Antes de começar, revise o guia do Stripe sobre PSD2 eSCA [https://stripe.com/guides/strong-customer-authentication] assim como a documentação do SCA [https://stripe.com/docs/strong-customer-authentication].

### Pagamentos que exigem confirmação adicional

Regras SCA geralmente exigem verificação extra para confirmar e processar um pagamento. Quando isso acontece, o Cashier lançará uma exceção `Laravel\Cashier\Exceptions\IncompletePayment` que informa que a verificação extra é necessária. Mais informações sobre como lidar com essas exceções podem ser encontradas na documentação em [Tratando pagamentos malsucedidos](#tratando-pagamentos-malsucedidos).

A confirmação de pagamento apresentada por Stripe ou Cartão pode ser adaptada a um fluxo de pagamento específico de um banco ou emissor de cartão e pode incluir verificação adicional de cartão, uma pequena cobrança temporária, autenticação separada do dispositivo ou outros tipos de verificação.

#### Estado Incompleto e Atrasado

Quando um pagamento precisa de confirmação adicional, a assinatura permanecerá em um estado 'incompleto' ou 'pago atrasado', indicado por sua coluna de banco de dados 'stripe_status'. O caixa ativará automaticamente a assinatura do cliente assim que a confirmação do pagamento for concluída e seu aplicativo for notificado pelo Stripe via webhook de sua conclusão.

Para obter mais informações sobre estados "incompletos" e "prazes passados", veja [nossa documentação adicional sobre esses estados](#incomplete-and-past-due-status).

### Notificações de Pagamento fora do período

Como as regras do SCA exigem que os clientes verifiquem ocasionalmente os detalhes de pagamento, mesmo enquanto sua assinatura estiver ativa, o Caixa pode enviar uma notificação ao cliente quando a confirmação de pagamento fora da sessão for necessária. Por exemplo, isso pode ocorrer quando uma assinatura está sendo renovada. Você pode habilitar a notificação do pagamento do caixa definindo a variável ambiental `CASHIER_PAYMENT_NOTIFICATION` para uma classe de notificação. Por padrão, essa notificação é desativada. Claro, o Caixa inclui uma classe de notificação que você pode usar para esse propósito, mas você está livre para fornecer sua própria classe de notificação se desejar:

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

Para garantir que as notificações de confirmação de pagamento fora do período de sessão sejam entregues, verifique se [webhooks do Stripe estão configurados](#handling-stripe-webhooks) para seu aplicativo e o webhook `invoice.payment_action_required` está habilitado no painel do Stripe. Além disso, seu modelo `Billable` também deve usar a trait `Illuminate\Notifications\Notifiable` do Laravel.

> [ALERTA]
> As notificações serão enviadas mesmo quando os clientes estiverem fazendo um pagamento manual que requer uma confirmação extra. Infelizmente, não há como o Stripe saber se o pagamento foi feito manualmente ou fora da sessão. Mas, o cliente simplesmente verá a mensagem "Pagamento Realizado com Sucesso" se visitar a página de pagamento depois já ter confirmado seu pagamento. O cliente não será permitido confirmar duas vezes o mesmo pagamento e pagar uma segunda vez sem querer.

## Stripe SDK

Muitos dos objetos do Caixeiro são envoltos de objetos do Stripe SDK. Se você gostaria de interagir diretamente com os objetos do Stripe, você pode facilmente obtê-los usando o método 'asStripe':

```php
    $stripeSubscription = $subscription->asStripeSubscription();

    $stripeSubscription->application_fee_percent = 5;

    $stripeSubscription->save();
```

Você também pode usar o método `updateStripeSubscription` para atualizar diretamente uma assinatura do Stripe:

```php
    $subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

Você pode invocar o método 'stripe' na classe 'Cashier' se quiser usar o cliente 'Stripe\StripeClient' diretamente. Por exemplo, você poderia usar este método para acessar a instância do 'StripeClient' e obter uma lista de preços de sua conta Stripe:

```php
    use Laravel\Cashier\Cashier;

    $prices = Cashier::stripe()->prices->all();
```

## Teste de tradução

Ao testar um aplicativo que utiliza o Cashier, você pode simular os requisições HTTP reais para a Stripe API; contudo, isso requer que você re-implemente parcialmente o comportamento do próprio Cashier. Por isso, recomendamos permitir que seus testes acessem a API real da Stripe. Embora seja mais lento, isso oferece mais confiança de que seu aplicativo está funcionando conforme esperado e qualquer teste lento pode ser colocado em seu próprio grupo de testes do Pest/ PHPUnit.

Ao fazer testes, lembre-se que o próprio Caixa já possui uma excelente suíte de testes, portanto você deve se concentrar em apenas testar o fluxo de assinatura e pagamento do seu próprio aplicativo e não cada comportamento subjacente do Caixa.

Para começar, adicione a versão de **teste** do seu segredo Stripe no arquivo `phpunit.xml`:

```
    <env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

Agora, sempre que interagir com o caixa durante os testes, ele enviará solicitações de API reais para seu ambiente de teste do Stripe. Para conveniência, você deve preencher seu conta de teste do Stripe com assinaturas / preços que você pode usar durante o teste.

> Nota:
> Para testar uma variedade de cenários de cobrança, tais como o fato do cartão de crédito ser recusado e falhas, você pode usar a grande gama de [números de testes e tokens](https://stripe.com/docs/testing) fornecidos pelo Stripe.
