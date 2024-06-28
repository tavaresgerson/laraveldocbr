# Laravel Cashier (Stripe)

## Introdução

 [Laravel Cashier Stripe](https://github.com/laravel/cashier-stripe) fornece uma interface expressiva e fluent para os serviços de faturamento por assinatura do [Stripe](https://stripe.com). Ele lida quase todo o código básico de faturamento de assinatura que você está receando escrever. Além do gerenciamento básico de assinaturas, o Cashier pode lidar com cupons, troca de assinaturas, "quantidades" de assinaturas, períodos de carência para cancelamentos e até mesmo gerar PDFs da fatura.

## Melhorando o balcão de cobranças

 Ao fazer o upgrade para uma nova versão do Cashier, é importante revisar cuidadosamente [o guia de atualização](https://github.com/laravel/cashier-stripe/blob/master/UPGRADE.md).

 > [AVERIGUAR]
 > Para evitar alterações que afetem a funcionalidade, o Cashier usa uma versão fixa da API do Stripe. O Cashier 15 utiliza a versão `2023-10-16` da API do Stripe. A versão da API do Stripe será atualizada em lançamentos menores para que se possam utilizar as novas funcionalidades e melhorias disponibilizadas pela Stripe.

## Instalação

 Primeiro, instale o pacote "Cashier" para o Stripe utilizando o gerenciador de pacotes do Composer:

```shell
composer require laravel/cashier
```

 Após instalar o pacote, publique as migrações do Cashier usando a ordem de serviço `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

 Em seguida, faça a migração de seu banco de dados:

```shell
php artisan migrate
```

 As migrações da função cashier irão adicionar várias colunas à tabela "users". Elas também criarão uma nova tabela "subscriptions" para armazenar todas as assinaturas de seus clientes e uma tabela "subscription_items" para assinaturas com múltiplos preços.

 Se desejar, você também poderá publicar o arquivo de configuração do Cashier usando a ordem do Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-config"
```

 Por último, para garantir que o Cashier processa corretamente todos os eventos do Stripe, lembre-se de [configurar a manipulação de webhooks do Cashier](#manipulando-webhooks-do-stripe).

 > [!ATENÇÃO]
 [Documentação do Stripe](https://stripe.com/pt/docs/upgrades/o-que-alterações o-stripe-considera-ser-backward-compatível).

## Configuração

### Modelo com custos faturáveis

 Antes de usar o Cashier, adicione a característica `Billable` à definição do seu modelo faturável. Normalmente, esse será o modelo `App\Models\User`. Essa característica fornece vários métodos para permitir que você execute tarefas de cobrança comuns, como criar assinaturas, aplicar cupons e atualizar informações sobre métodos de pagamento:

```php
    use Laravel\Cashier\Billable;

    class User extends Authenticatable
    {
        use Billable;
    }
```

 O sistema supõe que o seu modelo faturável será a classe `App\Models\User`, que é fornecida com Laravel. Se pretender mudar isso, pode especificar um modelo diferente através do método `useCustomerModel`. Este método normalmente deve ser chamado no método `boot` da sua classe `AppServiceProvider`:

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

 > [AVISO]
 [Migração do banco de dados (#instalação)](https://www.drupal.org/docs/migrating-database/) fornecida para combinar com o nome da tabela do modelo alternativo.

### Chaves da API

 Em seguida, você deve configurar suas chaves de API do Stripe no arquivo de configuração da sua aplicação `.env`. Você pode obter as suas chaves de API Stripe na painel de controle Stripe:

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

 > [AVERTISSEMENT]
 Você deve garantir que a variável de ambiente `STRIPE_WEBHOOK_SECRET` esteja definida no arquivo `.env` do seu aplicativo, pois essa variável é usada para garantir que os webhooks recebidos são realmente do Stripe.

### Configuração de moeda

 A moeda padrão na Caixa Registadora é o dolar dos Estados Unidos (USD). Você pode alterar a moeda padrão através da definição da variável de ambiente `CASHIER_CURRENCY` dentro do arquivo `.env` da sua aplicação:

```ini
CASHIER_CURRENCY=eur
```

 Além de configurar a moeda do caixa, você também pode especificar um local para ser usado ao formatar valores em dinheiro para exibição nas faturas. Internamente, o Cashier utiliza [a classe `NumberFormatter` do PHP](https://www.php.net/manual/en/class.numberformatter.php) para definir a localização da moeda:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

 > [AVISO]
 > Para utilizar locais diferentes de "en", certifique-se se a extensão PHP `ext-intl` está instalada e configurada no seu servidor.

### Configuração Fiscal

 Graças à [Stripe Tax](https://stripe.com/tax), é possível calcular automaticamente os impostos para todas as faturas geradas pelo Stripe. Você pode ativar o cálculo automático dos impostos chamando o método `calculateTaxes` no método `boot` da classe do `App\Providers\AppServiceProvider` de sua aplicação:

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

 Uma vez ativada a cobrança de impostos, todos os novos assinantes e faturas únicas geradas receberão o cálculo automático do imposto.

 Para que esse recurso funcione corretamente, os dados de faturamento do cliente, como o nome e endereço, precisam estar sincronizados com a Stripe. Você pode usar os métodos [Sincronização de Dados de Clientes](#sincronizar-dados-de-cliente-com-a-stripe) e [Tax ID] (ID do Imposto) oferecidos pelo Cashier para fazer isso.

 > [AVISO]
 [cobranças únicas] (#single-charges) ou

### Exploração Florestal

 O comando de caixa registra permite que você especifique o canal de log a ser utilizado ao registrar erros fatais do Stripe. Você pode especificar o canal de log definindo a variável ambiental `CASHIER_LOGGER` dentro do arquivo `.env` da sua aplicação:

```ini
CASHIER_LOGGER=stack
```

 As exceções geradas por chamadas de API ao Stripe serão registradas em seu canal de registro padrão da aplicação.

### Usando modelos personalizados

 Você está livre para estender os modelos usados internamente pelo Caixa ao definir seu próprio modelo e estender o modelo do Caixa correspondente:

```php
    use Laravel\Cashier\Subscription as CashierSubscription;

    class Subscription extends CashierSubscription
    {
        // ...
    }
```

 Após definir seu modelo, você pode instruir a Cashier para usar o seu modelo personalizado por meio da classe `Laravel\Cashier\Cashier`. Normalmente, você deve informar a Cashier sobre os seus modelos personalizados no método `boot` da classe `App\Providers\AppServiceProvider` de sua aplicação:

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

## Início rápido

### Vendas de produtos

 > [!AVISO]
 [configurar o processamento dos eventos Webhook da Cashier] (#handling-stripe-webhooks).

 Oferecer faturamento de produtos e assinatura pelo aplicativo pode ser intimidante, mas com a Cashier e o [Stripe Checkout](https://stripe.com/payments/checkout), você poderá criar facilmente integrações de pagamentos modernas e robustas.

 Para cobrar os clientes por produtos únicos e não recorrentes, utilizaremos Cashier para encaminhá-los para Stripe Checkout, onde eles fornecerão seus detalhes de pagamento e confirmarão sua compra. Após o pagamento ter sido feito através do Checkout, o cliente será redirecionado a um URL de sucesso escolhido por você dentro da sua aplicação:

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

 Como você pode ver no exemplo acima, utilizaremos o método "checkout" fornecido pelo Cashier para redirecionar o cliente ao Stripe Checkout para um determinado "identificador de preço". Ao usar o Stripe, "preços" referem-se a [preços definidos para produtos específicos](https://stripe.com/docs/products-prices/how-products-and-prices-work).

 Se necessário, o método `checkout` criará automaticamente um cliente no Stripe e associará esse registro de clientes do Stripe ao usuário correspondente em seu banco de dados da aplicação. Após concluir a sessão de checkout, o cliente será redirecionado para uma página de sucesso ou cancelamento dedicada onde você poderá exibir uma mensagem informativa para o cliente.

#### Fornecer metadados ao Stripe Checkout

 Ao vender produtos, é comum manter um registo dos pedidos concluídos e produtos comprados através de modelos `Carrinho` e `Encomenda`, definidos na sua própria aplicação. Ao redirecionar os clientes para o Stripe Checkout para concluírem uma compra, pode ser necessário fornecer um identificador de encomenda existente para poder associar a compra concluída com a correspondente encomenda quando o cliente é redirecionado novamente para a sua aplicação.

 Para fazer isso, você pode fornecer uma matriz de "metadados" para o método `checkout`. Imaginemos que um pedido pendente seja criado na nossa aplicação quando o usuário iniciar o processo de checkout. Lembrando que os modelos `Cart` e `Order` neste exemplo são ilustrativos e não estão disponíveis pelo "Cashier". Você pode implementar esses conceitos com base nas necessidades da sua própria aplicação:

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

 Como você pode ver no exemplo acima, quando um usuário iniciar o processo de checkout, forneceremos todos os identificadores de preços associados do carrinho/pedido ao método `checkout`. É claro que sua aplicação é responsável por associar esses itens ao "carrinho" ou pedido conforme o usuário adiciona-os. Nós também fornecemos o ID do pedido à sessão de Checkout do Stripe via a matriz `metadata`. Finalmente, nós adicionamos a variável de template `CHECKOUT_SESSION_ID` ao caminho de sucesso da Checout. Quando o Stripe redirecionar os clientes para sua aplicação, essa variável de modelo será automaticamente preenchida com o ID da sessão de checkout.

 Em seguida, vamos construir a rota de sucesso do carrinho. Esta é a rota para a qual o usuário será redirecionado após concluir sua compra por meio do Stripe Checkout. Nesta rota, podemos recuperar o identificador da sessão Stripe Checkout e a instância de Stripe Checkout associada, a fim de acessar nossos dados fornecidos e atualizar o pedido do cliente em conformidade:

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

 Consulte a documentação do Stripe para mais informações sobre os dados contidos no objeto da sessão de checkout (https://stripe.com/docs/api/checkout/sessions/object).

### Vendas de assinaturas

 > [!ATENÇÃO]
 [configure o gerenciamento do webhook de Caixa Registradora] (#handling-stripe-webhooks "").

 A oferta de faturamento de produtos e assinaturas por meio do seu aplicativo pode ser intimidante. No entanto, graças à Cashier e ao [Stripe Checkout](https://stripe.com/payments/checkout), você poderá construir facilmente integrações de pagamento modernas e robustas.

 Para saber como vender assinaturas utilizando o Cashier e o Stripe Checkout, considere um cenário simples de um serviço de assinatura com um plano mensal (`price_basic_monthly`) e anual (`price_basic_yearly`). Estes dois preços podem ser agrupados no produto "Básico" (pro_basic) no painel do Stripe. Além disso, o nosso serviço de assinatura pode oferecer um plano Expert como `pro_expert`.

 Antes, descobrir como um cliente pode assinar nossos serviços. Obviamente, você pode imaginar que o usuário poderá clicar em um botão "assinar" para o plano Básico na página de preços do nosso aplicativo. Esse botão ou link deve direcionar o usuário a uma rota Laravel que criará a sessão Stripe Checkout para seu plano escolhido:

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

 Como pode ver no exemplo acima, redirecionaremos o cliente para uma sessão de checkout do Stripe que permitirá a subscrição ao nosso plano básico. Após um checkout bem sucedido ou cancelamento, o cliente será redirecionado novamente para a URL que fornecemos ao método `checkout`. Para saber quando sua assinatura realmente começou (dado que alguns métodos de pagamento exigem alguns segundos para processar), também precisaremos [configurar o manuseio dos webhooks do Cashier](#manuseio-de-webhooks-stripe).

 Agora que os clientes podem começar a assinatura do serviço, precisamos restringir certas partes do nosso aplicativo para que só os usuários com uma assinatura possam acessá-las. Claro, sempre podemos determinar o status atual de assinatura do usuário por meio do método `subscribed` fornecido pela característica `Billable` da Cashier:

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

 Podemos até mesmo determinar facilmente se um usuário está assinado para um produto específico ou preço:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

#### Construção de um middleware subscrito

 Para conveniência, você pode criar um [middleware](/docs/{{version}}/middleware) que determine se o pedido chegou de um usuário inscrito. Depois que este middleware tiver sido definido, você poderá facilmente atribuí-lo a uma rota para impedir que os usuários não inscritos tenham acesso à rota:

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

 Definido o middleware, você pode atribuí-lo a uma rota:

```php
    use App\Http\Middleware\Subscribed;

    Route::get('/dashboard', function () {
        // ...
    })->middleware([Subscribed::class]);
```

#### Permitindo aos clientes gerenciar seu plano de faturamento

 Claro, os clientes podem querer alterar seu plano de assinatura para outro produto ou "nível". A maneira mais fácil de permitir isso é encaminhando os clientes ao [Portal de Faturamento do Cliente da Stripe](https://stripe.com/docs/no-code/customer-portal), que fornece uma interface de usuário hospedada que permite aos clientes baixar faturas, atualizar seu método de pagamento e alterar os planos de assinatura.

 Primeiro defina um link ou botão dentro da aplicação que direcione os usuários para uma rota do Laravel, a qual vamos utilizar para iniciar uma sessão no portal de faturamento:

```blade
<a href="{{ route('billing') }}">
    Billing
</a>
```

 Em seguida, vamos definir o roteamento que inicia uma sessão no Stripe Customer Billing Portal e redireciona o usuário ao Portal. O método `redirectToBillingPortal` aceita a URL para qual os usuários devem ser redirecionados quando saírem do portal:

```php
    use Illuminate\Http\Request;

    Route::get('/billing', function (Request $request) {
        return $request->user()->redirectToBillingPortal(route('dashboard'));
    })->middleware(['auth'])->name('billing');
```

 > [!AVISO]
 > Desde que você tenha configurado o manuseio do webhook da Caixeira, a mesma irá automaticamente sincronizar as tabelas de banco de dados relacionadas à Caixeira do aplicativo, por meio do monitoramento dos webhooks provenientes do Stripe. Portanto, se um usuário cancelar sua assinatura através do Portal de Cobrança do Cliente do Stripe, a Caixeira receberá o webhook correspondente e marcará a assinatura como "cancelada" no banco de dados do aplicativo.

## Clientes

### Recuperar clientes

 Você pode recuperar um cliente pelo seu Stripe ID utilizando o método `Cashier::findBillable`. Esse método retornará uma instância do modelo cobrável:

```php
    use Laravel\Cashier\Cashier;

    $user = Cashier::findBillable($stripeId);
```

### Criando clientes

 Por vezes poderá desejar criar um cliente da Stripe sem iniciar um abono. Isto é possível através do método `createAsStripeCustomer`:

```php
    $stripeCustomer = $user->createAsStripeCustomer();
```

 Uma vez criado o cliente no Stripe, você poderá iniciar uma assinatura posteriormente. É possível fornecer um array de opções `$options` para passar quaisquer outros parâmetros [de criação de clientes suportados pela API do Stripe](https://stripe.com/docs/api/customers/create):

```php
    $stripeCustomer = $user->createAsStripeCustomer($options);
```

 Se desejar obter o objeto do cliente Stripe para um modelo faturável, poderá utilizar o método `asStripeCustomer`:

```php
    $stripeCustomer = $user->asStripeCustomer();
```

 O método `createOrGetStripeCustomer` pode ser usado se você quiser recuperar o objeto do cliente Stripe para um modelo faturável específico, mas não tem certeza se esse modelo já é um cliente no Stripe. Se ele não existir, este método cria um novo cliente:

```php
    $stripeCustomer = $user->createOrGetStripeCustomer();
```

### Atualizando clientes

 Ocasionalmente, você pode desejar atualizar o cliente do Stripe diretamente com informações adicionais. Você pode realizar isso usando o método `updateStripeCustomer`. Esse método aceita um array de [opções de atualização do cliente suportadas pelo API do Stripe](https://stripe.com/docs/api/customers/update):

```php
    $stripeCustomer = $user->updateStripeCustomer($options);
```

### Saldos

 O Stripe permite creditar ou débilizar o "saldo" de um cliente. Mais tarde, este saldo será creditado ou débilizado nas novas faturas. Para verificar o saldo total do cliente, pode utilizar o método `balance` disponível no seu modelo facturável. O método `balance` devolve uma representação de forma de string do saldo em moeda do cliente:

```php
    $balance = $user->balance();
```

 Para crédito o saldo de um cliente, pode fornecer um valor para o método `créditoBalance`. Se quiser, pode também fornecer uma descrição:

```php
    $user->creditBalance(500, 'Premium customer top-up.');
```

 Ao preencher o método `debitBalance` com um valor, você poderá descontar da conta do cliente:

```php
    $user->debitBalance(300, 'Bad usage penalty.');
```

 O método `applyBalance` cria novas transações de saldo do cliente para o cliente. Pode recuperar estes registos de transação utilizando o método `balanceTransactions`, o que pode ser útil para fornecer um log de créditos e débitos para o cliente rever:

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

### Códigos fiscais

 A função Cashier facilita o gerenciamento de códigos de identificação fiscal do cliente. Por exemplo, você pode usar o método `taxIds` para obter todas as [códigos de identificação fiscal](https://stripe.com/docs/api/customer_tax_ids/object) atribuídos a um cliente como uma coleção:

```php
    $taxIds = $user->taxIds();
```

 É possível também obter um número de identificação fiscal específico para um cliente por meio do seu identificador:

```php
    $taxId = $user->findTaxId('txi_belgium');
```

 Você pode criar um novo CPF fornecendo um tipo de [tipo](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type) e valor válidos para o método `createTaxId`:

```php
    $taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

 O método `createTaxId` adicionará imediatamente o NIF/CIF ao cliente. A verificação do NIF/CIF é também realizada pela Stripe (https://stripe.com/docs/invoicing/customer/tax-ids#validation); contudo, trata-se de um processo assíncrono. Pode ser notificado das atualizações da verificação ao subscrição do evento webhook `customer.tax_id.updated` e inspecionar o parâmetro de verificação `VAT IDs` (https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification). Consulte a documentação sobre definição de mão-de-obra webhook para mais informações sobre como lidar com webhooks.

 Você pode deletar um identificador fiscal utilizando o método `deleteTaxId`:

```php
    $user->deleteTaxId('txi_belgium');
```

### Sincronização de dados do cliente com o Stripe

 Normalmente, quando os usuários da sua aplicação atualizarem seu nome, email ou outras informações que também são armazenadas pela Stripe, você deve informar a Stripe sobre as atualizações. Dessa forma, a cópia das informações da Stripe estará sincronizada com a sua aplicação.

 Para automatizar isso, você pode definir um evento de escuta em seu modelo cobrável que reaja ao evento "atualizado" do modelo. Em seguida, no seu evento de escuta, você pode chamar o método `syncStripeCustomerDetails` no modelo:

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

 Agora, toda vez que seu modelo de cliente for atualizado, as informações serão sincronizadas com a Stripe. Para sua conveniência, o Cashier irá automaticamente sincronizar as informações do seu cliente com a Stripe na criação inicial do cliente.

 Você pode personalizar as colunas usadas para sincronizar informações de clientes com a Stripe ao substituir uma variedade de métodos fornecidos pela Cashier. Por exemplo, você pode substituir o método `stripeName` para customizar o atributo que deve ser considerado como o "nome" do cliente quando a Cashier sincroniza informações de clientes com a Stripe:

```php
    /**
     * Get the customer name that should be synced to Stripe.
     */
    public function stripeName(): string|null
    {
        return $this->company_name;
    }
```

 Da mesma forma, você pode sobrepor os métodos `stripeEmail`, `stripePhone`, `stripeAddress`, e `stripePreferredLocales`. Esses métodos sincronizarão informações com seus respectivos parâmetros do cliente ao [atualizar o objeto de cliente Stripe](https://stripe.com/docs/api/customers/update). Se você deseja assumir o controle total sobre o processo de sincronização das informações do cliente, pode substituir o método `syncStripeCustomerDetails`.

### Portal de faturas

 O Stripe oferece uma forma simples de criar um portal de faturamento (https://stripe.com/docs/billing/subscriptions/customer-portal) para que os seus clientes possam gerir as suas subscrições, métodos de pagamento e visualizar a sua história de faturação. Pode redirecionar os utilizadores para o portal de faturamento chamando a função `redirectToBillingPortal` no modelo factível do controlador ou na rota:

```php
    use Illuminate\Http\Request;

    Route::get('/billing-portal', function (Request $request) {
        return $request->user()->redirectToBillingPortal();
    });
```

 Por padrão, quando o utilizador terminar de gerir a subscrição, poderá voltar à rota inicial da sua aplicação através de um link do portal de faturamento Stripe. Pode fornecer um URL personalizado que o utilizador deve voltar visitando, passando o URL como argumento ao método `redirectToBillingPortal`:

```php
    use Illuminate\Http\Request;

    Route::get('/billing-portal', function (Request $request) {
        return $request->user()->redirectToBillingPortal(route('billing'));
    });
```

 Se você deseja gerar o URL para o portal de faturamento sem gerar uma resposta de redirecionamento HTTP, poderá invocar o método `billingPortalUrl`:

```php
    $url = $request->user()->billingPortalUrl(route('billing'));
```

## Métodos de pagamento

### Armazenar métodos de pagamento

 Para criar assinaturas ou efetuar cobranças "esporádicas" com a Stripe, você deverá armazenar um método de pagamento e recuperar seu identificador da Stripe. A abordagem utilizada para fazer isso varia consoante o objetivo de usar o método de pagamento para assinaturas ou cobranças únicas, então examinaremos os dois casos a seguir.

#### Métodos de pagamento das assinaturas

 Para armazenar informações de cartão de crédito do cliente para uso futuro por meio de uma assinatura, é necessário usar a API "Setup Intents" da Stripe para coletar os detalhes do método de pagamento do cliente de forma segura. Um "Setup Intent" indica à Stripe a intenção de cobrar o método de pagamento do cliente. O traço `Billable` de Cashier inclui o método `createSetupIntent` para criar facilmente um novo Setup Intent. Você deve invocar esse método da rota ou controlador que renderizará o formulário que coleta os detalhes do método de pagamento do seu cliente:

```php
    return view('update-payment-method', [
        'intent' => $user->createSetupIntent()
    ]);
```

 Depois de criar o Intento do Configurador e enviá-lo para a visualização, você deve anexar seu segredo ao elemento que irá coletar o método de pagamento. Por exemplo, considere este formulário "atualizar método de pagamento":

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button" data-secret="{{ $intent->client_secret }}">
    Update Payment Method
</button>
```

 Em seguida, a biblioteca Stripe.js pode ser usada para anexar um [Stripe Element](https://stripe.com/docs/stripe-js) ao formulário e coletar os dados de pagamento do cliente com segurança:

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

 Em seguida, o cartão pode ser verificado e um "identificador do método de pagamento" seguro pode ser recuperado da Stripe usando o método [`confirmCardSetup` da Stripe](https://stripe.com/docs/js/setup_intents/confirm_card_setup):

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

 Depois que o cartão for verificado pelo Stripe, você pode passar o identificador resultante `setupIntent.payment_method` para sua aplicação Laravel, onde ele poderá ser anexado ao cliente. O método de pagamento pode ser [adicionado como um novo método de pagamento](#adicionando-métodos-de-pagamento) ou [usado para atualizar o método de pagamento padrão](#atualizando-o-método-de-pagamento-padrão). Você também pode usar imediatamente o identificador do método de pagamento para [criar uma nova assinatura](#creando-assinaturas).

 > [!AVISO]
 [ver essa visão geral disponibilizada pela Stripe](https://stripe.com/docs/payments/save-and-reuse#php).

#### Formas de pagamento para faturas individuais

 Claro que, ao fazer um único cobrança contra o método de pagamento do cliente, só precisamos usar o identificador do método de pagamento uma única vez. Como as limitações da Stripe, você não pode utilizar o método de pagamento padrão armazenado de um cliente para cobranças simples. Você deve permitir que o cliente insira os detalhes do seu método de pagamento usando a biblioteca Stripe.js. Por exemplo, considere o seguinte formulário:

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button">
    Process Payment
</button>
```

 Após definir esse tipo de formulário, pode utilizar a biblioteca Stripe.js para anexar um [Stripe Element](https://stripe.com/docs/stripe-js) ao formulário e obter os dados de pagamento do cliente com segurança:

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

 Em seguida, o cartão pode ser verificado e um "identificador de método de pagamento" seguro pode ser recuperado do Stripe usando o [método `createPaymentMethod` do Stripe](https://stripe.com/docs/stripe-js/reference#stripe-create-payment-method):

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

 Se o cartão for verificado com sucesso, você poderá passar o `paymentMethod.id` para seu aplicativo Laravel e processar uma cobrança simples ([cobrança única](#single-charge)).

### Recuperação de métodos de pagamento

 O método `paymentMethods` na instância do modelo faturável retorna uma coleção de instâncias de `Laravel\Cashier\PaymentMethod`:

```php
    $paymentMethods = $user->paymentMethods();
```

 Por padrão, esse método retornará os métodos de pagamento de todos os tipos. Para recuperar métodos de pagamento de um tipo específico, você poderá passar o `tipo` como um argumento ao método:

```php
    $paymentMethods = $user->paymentMethods('sepa_debit');
```

 Para recuperar o método de pagamento padrão do cliente, pode ser utilizado o método `defaultPaymentMethod`:

```php
    $paymentMethod = $user->defaultPaymentMethod();
```

 Você pode recuperar um método de pagamento específico vinculado ao modelo faturável usando o método `findPaymentMethod`:

```php
    $paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

### Método de pagamento Presença

 Para determinar se um modelo faturável possui um método de pagamento por padrão anexado à sua conta, você deve chamar o método `hasDefaultPaymentMethod`:

```php
    if ($user->hasDefaultPaymentMethod()) {
        // ...
    }
```

 Você pode usar o método `hasPaymentMethod` para determinar se um modelo faturável tem ao menos um método de pagamento vinculado à sua conta.

```php
    if ($user->hasPaymentMethod()) {
        // ...
    }
```

 Este método determinará se o modelo com faturamento tem algum meio de pagamento em tudo. Para determinar se um meio de pagamento de um tipo específico existe para o modelo, você poderá passar o `type` como um argumento ao método:

```php
    if ($user->hasPaymentMethod('sepa_debit')) {
        // ...
    }
```

### Atualizar o método de pagamento padrão

 O método `updateDefaultPaymentMethod` pode ser usado para atualizar os dados do método de pagamento padrão do cliente. Este método aceita um identificador de método de pagamento do Stripe e atribuirá o novo método de pagamento como o método padrão da faturação:

```php
    $user->updateDefaultPaymentMethod($paymentMethod);
```

 Para sincronizar as informações do seu método de pagamento predefinido com as informações do método de pagamento por defeito do cliente no Stripe, poderá utilizar o método `updateDefaultPaymentMethodFromStripe`:

```php
    $user->updateDefaultPaymentMethodFromStripe();
```

 > [AVISO]
 > O método de pagamento padrão de um cliente só poderá ser utilizado para facturação e criação de novas subscrições. Devido a limitações impostas pela Stripe, não pode ser usada para pagamentos únicos.

### Adição de meios de pagamento

 Para adicionar um novo método de pagamento, pode ligar à metodologia `adicionaMétodoPagamento`, no modelo facturável, com o identificador do método de pagamento como parâmetro:

```php
    $user->addPaymentMethod($paymentMethod);
```

 > [!ATENÇÃO]
 [Arquivar método de pagamentos no armazenamento de métodos de pagamento] (#storing-payment-methods).

### Excluindo os métodos de pagamento

 Para remover um método de pagamento, você pode chamar o método `delete` na instância do `Laravel\Cashier\PaymentMethod` que deseja remover:

```php
    $paymentMethod->delete();
```

 O método `deletePaymentMethod` exclui um meio de pagamento específico do modelo faturável:

```php
    $user->deletePaymentMethod('pm_visa');
```

 O método `deletePaymentMethods` excluirá todas as informações sobre os métodos de pagamento para o modelo faturável:

```php
    $user->deletePaymentMethods();
```

 Por padrão, esse método exclui os métodos de pagamento de todos os tipos. Para excluir os métodos de pagamento de um tipo específico, você pode passar o `type` como um argumento para o método:

```php
    $user->deletePaymentMethods('sepa_debit');
```

 > [AVERIGOCHESE]
 > Se um usuário tiver uma assinatura ativa, seu aplicativo não deve permitir que ele exclua o método de pagamento padrão.

## Assinaturas

 As assinaturas oferecem uma forma de configurar pagamentos recorrentes para seus clientes. Os serviços de assinatura gerenciados por Meio do Cashier permitem suporte a vários preços de assinatura, quantidades de assinatura, períodos de teste e muito mais.

### Criar assinaturas

 Para criar uma assinatura, primeiro recuperar uma instância do seu modelo faturável, que geralmente será uma instância de `App\Models\User`. Depois de ter recuperado a instância do modelo, você pode usar o método `newSubscription` para criar a assinatura do modelo:

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription(
            'default', 'price_monthly'
        )->create($request->paymentMethodId);

        // ...
    });
```

 O primeiro parâmetro passado para a função `newSubscription` deve ser o tipo de assinatura interna. Se a sua aplicação tiver apenas uma única subscrição, pode chamar esta de "default" ou "primary". Este tipo de subscrição é usada exclusivamente por aplicações e não tem que ser mostrado aos utilizadores. Além disso, não deve conter espaços e não se deve alterar após a criação da subscrição. O segundo parâmetro é o preço específico ao qual o utilizador está a subscrever. Este valor deve corresponder à identificação do preço no Stripe.

 O método `create`, que aceita um identificador de método de pagamento do Stripe ([armazenando métodos de pagamento](#storing-payment-methods)) ou objeto de `PaymentMethod` do Stripe, iniciará o pedido de assinatura, bem como atualizará seu banco de dados com o ID do cliente do Stripe do modelo faturável e outras informações de cobrança relevantes.

 > [Atenção]
 > Ao passar um identificador de método de pagamento diretamente ao método de subscrição `create` também o adiciona automaticamente aos métodos de pagamento armazenados no utilizador.

#### Recolha de pagamentos recorrentes através de e-mails de fatura

 Em vez de efetuar automaticamente o pagamento recorrente dos clientes, você pode dar instruções ao Stripe para enviar um email com uma fatura para cada um deles no momento em que seus pagamentos recorrentes estiverem vencidos. Dessa forma, eles poderão pagar a fatura manualmente assim que a receberem:

```php
    $user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

 O período de tempo que o cliente tem para pagar sua conta antes do cancelamento da assinatura é determinado pela opção `days_until_due`. Por padrão, este é 30 dias; no entanto, você pode fornecer um valor específico para esta opção, se desejar:

```php
    $user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
        'days_until_due' => 30
    ]);
```

#### Quantidades

 Se pretender definir uma quantidade específica (https://stripe.com/docs/billing/subscriptions/quantities) para o preço ao criar a subscrição, deverá invocar o método `quantity` na construção da subscrição antes de criar a mesma:

```php
    $user->newSubscription('default', 'price_monthly')
         ->quantity(5)
         ->create($paymentMethod);
```

#### Detalhes adicionais

 Caso você queira especificar opções adicionais para [clientes](https://stripe.com/docs/api/customers/create) ou [assinaturas](https://stripe.com/docs/api/subscriptions/create), suportadas pelo Stripe, é possível fazer isso passando-os como o segundo e o terceiro argumento para a metodologia `criar`:

```php
    $user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
        'email' => $email,
    ], [
        'metadata' => ['note' => 'Some extra information.'],
    ]);
```

#### Cupons

 Se você gostaria de aplicar um cupom ao criar o plano de assinatura, pode usar o método `withCoupon`:

```php
    $user->newSubscription('default', 'price_monthly')
         ->withCoupon('code')
         ->create($paymentMethod);
```

 Ou se você deseja aplicar um código de promoção do [Stripe](https://stripe.com/docs/billing/subscriptions/discounts/codes), pode usar o método `withPromotionCode`:

```php
    $user->newSubscription('default', 'price_monthly')
         ->withPromotionCode('promo_code_id')
         ->create($paymentMethod);
```

 O código de promoção fornecido deve ser o identificador de API da Stripe atribuído ao código de promoção e não o código de promoção do cliente. Se necessário, pode utilizar a função `findPromotionCode` para encontrar um código de promoção com base no código de promoção exposto:

```php
    // Find a promotion code ID by its customer facing code...
    $promotionCode = $user->findPromotionCode('SUMMERSALE');

    // Find an active promotion code ID by its customer facing code...
    $promotionCode = $user->findActivePromotionCode('SUMMERSALE');
```

 No exemplo acima, o objeto `$promotionCode` retornado é uma instância do `Laravel\Cashier\PromotionCode`. Esta classe decorre um objeto subjacente de `Stripe\PromotionCode`. Você pode recuperar o cupom relacionado ao código da promoção chamando a metodologia `coupon`:

```php
    $coupon = $user->findPromotionCode('SUMMERSALE')->coupon();
```

 A instância do cupom permite determinar o valor da desconto e se o cupom representa um desconto fixo ou percentual baseado no preço:

```php
    if ($coupon->isPercentage()) {
        return $coupon->percentOff().'%'; // 21.5%
    } else {
        return $coupon->amountOff(); // $5.99
    }
```

 Você também pode obter as descontos atualmente aplicados a um cliente ou assinatura:

```php
    $discount = $billable->discount();

    $discount = $subscription->discount();
```

 As instâncias retornadas de `Laravel\Cashier\Discount` decoram uma instância subjacente do objeto `Stripe\Discount`. Você pode recuperar o cupom relacionado a esse desconto, invocando o método `coupon`:

```php
    $coupon = $subscription->discount()->coupon();
```

 Se pretender aplicar um novo código de cupão ou promoção num cliente ou assinatura, poderá fazê-lo através dos métodos `applyCoupon` ou `applyPromotionCode`:

```php
    $billable->applyCoupon('coupon_id');
    $billable->applyPromotionCode('promotion_code_id');

    $subscription->applyCoupon('coupon_id');
    $subscription->applyPromotionCode('promotion_code_id');
```

 Lembre-se de usar o Stripe API ID atribuído ao código da promoção e não o código da promoção que é apresentado aos clientes. Apenas um cupão ou código de promoção pode ser aplicado a um cliente ou assinatura em determinado momento.

 Para mais informações sobre este assunto, consulte a documentação Stripe relativamente aos cupões [aqui](https://stripe.com/docs/billing/subscriptions/coupons) e aos códigos promocionais [aqui](https://stripe.com/docs/billing/subscriptions/coupons/codes).

#### Adição de assinaturas

 Se pretender adicionar um assinatura a um cliente que já tenha um método de pagamento padrão, pode chamar o método `add` do criador da subscrição:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->newSubscription('default', 'price_monthly')->add();
```

#### Criação de subscrições a partir da interface do utilizador da Stripe

 Você também pode criar assinaturas diretamente na própria tela do painel Stripe. Nesse caso, o Cashier irá sincronizar as novas assinaturas adicionadas e atribuir a elas um tipo de `default`. Para personalizar o tipo de assinatura que será atribuída às assinaturas criadas na tela inicial do painel, defina os manipuladores de eventos dos Webhooks.

 Além disso, você só pode criar um tipo de assinatura através da plataforma do Stripe. Se o seu aplicativo disponibilizar vários tipos de assinaturas diferentes, poderá adicionar apenas um deles pelo painel do Stripe.

 Finalmente, certifique-se sempre de que uma única assinatura ativa seja adicionada por tipo de assinatura oferecida pelo seu aplicativo. Se um cliente tiver duas assinaturas "default", somente a mais recentemente adicionada será usada pela Loja, mesmo que ambas estejam sincronizadas com o banco de dados do seu aplicativo.

### Verificando o Estado da Assinatura

 Uma vez que um cliente se inscreveu na sua aplicação, você poderá verificar facilmente seu status de assinatura usando vários métodos convenientes. Primeiro, o método `subscribed` retorna `true` se o cliente tiver uma assinatura ativa, mesmo que a assinatura esteja no período experimental. O método `subscribed` aceita o tipo da assinatura como seu primeiro argumento:

```php
    if ($user->subscribed('default')) {
        // ...
    }
```

 O método `subscribed` também é uma boa opção para um [médio de rota](/docs/{{version}}/middleware), permitindo que você filtre o acesso às rotas e controles com base no status de assinatura do usuário:

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

 Se você quiser saber se o usuário ainda está em seu período de teste, pode usar o método `onTrial`. Este método é útil para determinar se deve exibir um aviso ao usuário de que ele ainda está no período de teste:

```php
    if ($user->subscription('default')->onTrial()) {
        // ...
    }
```

 O método `subscribedToProduct` pode ser utilizado para determinar se o usuário está inscrito num produto específico com base no identificador do produto Stripe. Nos produtos Stripe, os produtos são coleções de preços. Neste exemplo, vamos determinar se a assinatura padrão da aplicação do utilizador é atualmente subscrita ao produto "premium". O identificador do produto Stripe deve corresponder aos identificadores dos produtos no painel Stripe:

```php
    if ($user->subscribedToProduct('prod_premium', 'default')) {
        // ...
    }
```

 Passeando um conjunto para a metodologia `subscribedToProduct`, você pode determinar se a assinatura do usuário "default" está ativamente inscrita no produto "básico" ou "premium" da aplicação.

```php
    if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
        // ...
    }
```

 O método `subscribedToPrice` pode ser utilizado para determinar se o abono de um cliente corresponde a um determinado preço ID:

```php
    if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
        // ...
    }
```

 O método `recurring` pode ser usado para determinar se o usuário está atualmente inscrito e já não tem mais período de avaliação.

```php
    if ($user->subscription('default')->recurring()) {
        // ...
    }
```

 > [ATENÇÃO]
 > Se um usuário tiver duas assinaturas do mesmo tipo, a última assinatura será sempre retornada pelo método `subscription`. Por exemplo, um usuário pode ter dois registros de assinatura com o tipo `default`; no entanto, uma das assinaturas pode ser uma assinatura antiga e expirada, enquanto a outra é ativa e vigente. A última assinatura sempre será retornada, mas as assinaturas mais antigas permanecerão guardadas no banco de dados para análise histórica.

#### Estado do assinante cancelado

 Para determinar se o usuário era um assinante ativo anteriormente mas cancelou a sua assinatura, você pode usar o método `canceled`:

```php
    if ($user->subscription('default')->canceled()) {
        // ...
    }
```

 Você também pode determinar se um usuário cancelou sua assinatura, mas ainda está em seu período de carência até que a assinatura termine totalmente. Por exemplo, se um usuário cancela uma assinatura no dia 5 de março, que originalmente estava programada para expirar no dia 10 de março, o usuário está nesse período de carência até o dia 10 de março. Note que o método `subscribed` ainda retorna `true` durante este tempo:

```php
    if ($user->subscription('default')->onGracePeriod()) {
        // ...
    }
```

 Para determinar se o usuário cancelou sua assinatura e não está mais em seu "período de carência", você pode usar o método `ended`:

```php
    if ($user->subscription('default')->ended()) {
        // ...
    }
```

#### Estado Incompleto e Vencido

 Se um assinatura exigir uma ação de pagamento secundária após sua criação, ela será marcada como "incompleta". Estes estados da assinatura são armazenados na coluna `stripe_status` da tabela de banco de dados Cashier chamada `"subscriptions"`.

 De forma semelhante, se for necessário proceder a um pagamento secundário ao efetuar o intercâmbio de preços, a subscrição será marcada como `past_due`. Quando uma subscrição estiver nesse estado, não será ativa até que o cliente confirme o seu pagamento. Pode determinar se uma subscrição tem um pagamento incompleto usando o método `hasIncompletePayment` no modelo facturável ou numa instância de subscrição:

```php
    if ($user->hasIncompletePayment('default')) {
        // ...
    }

    if ($user->subscription('default')->hasIncompletePayment()) {
        // ...
    }
```

 Quando um assinatura estiver em pagamento parcial, direcione o utilizador para a página de confirmação de pagamentos da Caixa, transmitindo o identificador `latestPayment`. Pode utilizar o método `latestPayment` disponível na instância de subscrição para recuperar este identificador:

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    Please confirm your payment.
</a>
```

 Se você deseja que a assinatura continue ativa quando estiver em um estado "atrasado" ou "incompleto", pode usar as funções `keepPastDueSubscriptionsActive` e `keepIncompleteSubscriptionsActive`, disponíveis por meio da Cashier. Essas funções normalmente são chamadas no método `register` do seu `App\Providers\AppServiceProvider`:

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

 > [!AVISO]
 > Se o estado do abono estiver em "incompleto", não poderá ser alterado até que o pagamento seja confirmado. Por conseguinte, os métodos `swap` e `updateQuantity` lançarão uma exceção quando o abono estiver no estado "incompleto".

#### Escopo das assinaturas

 A maioria dos estados de assinatura está também disponível como escopos de consulta, para que você possa pesquisar facilmente sua base de dados por assinaturas que estejam em um determinado estado:

```php
    // Get all active subscriptions...
    $subscriptions = Subscription::query()->active()->get();

    // Get all of the canceled subscriptions for a user...
    $subscriptions = $user->subscriptions()->canceled()->get();
```

 Abaixo está uma lista completa dos escopos disponíveis:

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

### Alterações de preços

 Depois que um cliente se inscreveu no seu aplicativo, ele poderá querer trocar de assinatura em algum momento. Para trocar o preço da assinatura do usuário, informe ao método `swap` a identificação do novo preço Stripe. No caso das alterações de preços, é suposto que o cliente tenha interrompido o pagamento e deseje reativar sua assinatura, se esta já tiver sido cancelada. A identificação do novo preço deve corresponder à identificação do novo preço disponível na página de configuração Stripe:

```php
    use App\Models\User;

    $user = App\Models\User::find(1);

    $user->subscription('default')->swap('price_yearly');
```

 Se o cliente estiver em período de teste, esse período será mantido. Além disso, se houver uma quantidade para o plano pago, essa quantidade também será mantida.

 Se você preferir trocar os preços e cancelar qualquer período de teste atualmente em curso do cliente, poderá invocar o método `skipTrial`:

```php
    $user->subscription('default')
            ->skipTrial()
            ->swap('price_yearly');
```

 Caso você queira substituir os preços e faturar o cliente imediatamente em vez de esperar pelo próximo ciclo de cobrança, pode usar o método `swapAndInvoice`:

```php
    $user = User::find(1);

    $user->subscription('default')->swapAndInvoice('price_yearly');
```

#### Proratação

 Por padrão, o Stripe aplica os cargos de forma proporcional quando se alternam preços. O método `noProrate` pode ser utilizado para atualizar o preço da subscrição sem aplicar a proporcionalidade dos cargos:

```php
    $user->subscription('default')->noProrate()->swap('price_yearly');
```

 Para obter mais informações sobre a prorrogação de assinaturas, consulte a [documentação do Stripe](https://stripe.com/pt-BR/docs/billing/subscriptions/prorations).

 > [AVISO]
 > A execução do método `noProrate` antes do método `swapAndInvoice` não produzirá efeitos sobre a proporcionalidade. Sempre será emitida uma fatura.

### Quantidade de inscrições

 Por vezes as assinaturas são afetadas pela "quantidade". Por exemplo, uma aplicação de gestão de projetos pode cobrar USD $10 por mês por projeto. Pode usar os métodos `incrementQuantity` e `decrementQuantity` para incrementar ou diminuir a sua quantidade de assinaturas com facilidade:

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

 Como alternativa, você pode definir uma quantidade específica usando o método `updateQuantity`:

```php
    $user->subscription('default')->updateQuantity(10);
```

 O método `noProrate` pode ser usado para atualizar a quantidade da assinatura sem fazer a distribuição das tarifas por lotes:

```php
    $user->subscription('default')->noProrate()->updateQuantity(10);
```

 Para obter mais informações sobre quantidades de assinatura, consulte a documentação do Stripe ([Documentação do Stripe sobre quantidades de assinaturas](https://stripe.com/docs/subscriptions/quantities)).

#### Categorias de assinaturas com vários produtos

 Se o seu plano for um de [múltiplos produtos](subscriptions-with-multiple-products), você deve passar como segundo argumento da metodologia de incrementação ou diminuição a ID do preço em que deseja aumentar ou diminuir a quantidade:

```php
    $user->subscription('default')->incrementQuantity(1, 'price_chat');
```

### Assinaturas com vários produtos

 [Assinatura com múltiplos produtos](https://stripe.com/docs/billing/subscriptions/multiple-products) permite atribuir vários produtos de faturamento a uma única assinatura. Por exemplo, imagine que está construindo um aplicativo "helpdesk" de suporte ao cliente com base num preço de assinatura mensal de USD 10 mas oferecendo um produto complementar de chat em tempo real por mais USD 15 por mês. As informações das assinaturas com vários produtos são armazenadas na tabela de banco de dados `subscription_items` da Cashier.

 É possível especificar vários produtos para um determinado plano de assinatura passando uma matriz de preços como o segundo argumento do método `newSubscription`:

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

 No exemplo acima, o cliente terá dois preços vinculados à sua assinatura "padrão". Ambos os preços serão cobrados em seus respectivos intervalos de faturamento. Se necessário, você pode usar o método `quantity` para indicar uma quantidade específica para cada preço:

```php
    $user = User::find(1);

    $user->newSubscription('default', ['price_monthly', 'price_chat'])
        ->quantity(5, 'price_chat')
        ->create($paymentMethod);
```

 Se você deseja adicionar outro preço a uma assinatura existente, poderá invocar o método de subscrição "addPrice":

```php
    $user = User::find(1);

    $user->subscription('default')->addPrice('price_chat');
```

 O exemplo acima adicionará o novo preço e o cliente será cobrado por ele em seu próximo ciclo de faturamento. Se você quiser cobrar o cliente imediatamente, pode usar o método `addPriceAndInvoice`:

```php
    $user->subscription('default')->addPriceAndInvoice('price_chat');
```

 Se pretender adicionar um preço com uma quantidade específica, pode passar essa quantidade como segundo argumento dos métodos `addPrice` ou `addPriceAndInvoice`:

```php
    $user = User::find(1);

    $user->subscription('default')->addPrice('price_chat', 5);
```

 Você pode remover preços de assinaturas usando o método `removePrice`:

```php
    $user->subscription('default')->removePrice('price_chat');
```

 > [!AVISO]
 > Não pode remover o último preço de um serviço de assinatura. Em vez disso, você deve simplesmente cancelar o serviço de assinatura.

#### Troca de preços

 Você também poderá alterar os preços associados a um plano de assinatura com múltiplos produtos. Por exemplo, imagine que o cliente tenha um plano "price_basic" e um produto complementar chamado "price_chat". Se você deseja fazer upgrade do plano "price_basic" para o plano "price_pro":

```php
    use App\Models\User;

    $user = User::find(1);

    $user->subscription('default')->swap(['price_pro', 'price_chat']);
```

 Ao executar o exemplo acima, o item de subscrição subjacente com `price_basic` é apagado e o com `price_chat` é preservado. Além disso, um novo item de subscrição é criado para o `price_pro`.

 Você também pode especificar as opções do item da assinatura passando um conjunto de pares chave/valor para o método `swap`. Por exemplo, você poderá precisar especificar a quantidade e preço da assinatura:

```php
    $user = User::find(1);

    $user->subscription('default')->swap([
        'price_pro' => ['quantity' => 5],
        'price_chat'
    ]);
```

 Se pretender trocar um único preço numa subscrição, pode fazê-lo utilizando o método `swap` do próprio artigo da subscrição. Esta abordagem é particularmente útil se pretender preservar todos os metadados existentes nos outros preços da subscrição:

```php
    $user = User::find(1);

    $user->subscription('default')
            ->findItemOrFail('price_basic')
            ->swap('price_pro');
```

#### Distribuição

 Por padrão, o Stripe irá atualizar os valores quando adicionar ou remover preços de um plano com vários produtos. Se pretender efetuar uma alteração dos preços sem a necessidade de atualização do valor total do plano, deve associar a função `noProrate` à operação de preços:

```php
    $user->subscription('default')->noProrate()->removePrice('price_chat');
```

#### Quantidades

 Se desejar atualizar as quantidades dos preços de assinatura individuais, poderá fazê-lo usando os métodos de [quantidade existente](#subscription-quantity) ao passar o ID do preço como um argumento adicional para a metodologia:

```php
    $user = User::find(1);

    $user->subscription('default')->incrementQuantity(5, 'price_chat');

    $user->subscription('default')->decrementQuantity(3, 'price_chat');

    $user->subscription('default')->updateQuantity(10, 'price_chat');
```

 > [!AVISO]
 > Se um plano tiver vários preços, os atributos `stripe_price` e `quantity` no modelo `Subscription` serão `null`. Para acessar os atributos de preço individuais, você deve usar o relacionamento `items` disponível no modelo `Subscription`.

#### itens de assinatura

 Quando um plano de assinatura tiver vários preços, ele conterá diversos itens do plano armazenados na tabela `subscription_items` da base de dados. Você poderá acessar esses valores através da relação `itens` no plano de assinatura:

```php
    use App\Models\User;

    $user = User::find(1);

    $subscriptionItem = $user->subscription('default')->items->first();

    // Retrieve the Stripe price and quantity for a specific item...
    $stripePrice = $subscriptionItem->stripe_price;
    $quantity = $subscriptionItem->quantity;
```

 Você também pode recuperar um preço específico usando o método `findItemOrFail`:

```php
    $user = User::find(1);

    $subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

### Assinaturas múltiplas

 O Stripe permite que os clientes tenham várias assinaturas ao mesmo tempo. Por exemplo, você pode ser um ginásio que ofereça uma assinatura de natação e outra de levantamento de peso. Cada plano pode ter um preço diferente. Claro, os clientes devem poder se inscrever em um ou ambos os planos.

 Quando o seu aplicativo cria assinaturas, você pode fornecer um tipo de assinatura ao método `newSubscription`. O tipo pode ser qualquer string que representa o tipo de assinatura iniciada pelo usuário.

```php
    use Illuminate\Http\Request;

    Route::post('/swimming/subscribe', function (Request $request) {
        $request->user()->newSubscription('swimming')
            ->price('price_swimming_monthly')
            ->create($request->paymentMethodId);

        // ...
    });
```

 Neste exemplo, iniciámos uma assinatura mensal de natação para o cliente, no entanto, podem querer passar a um plano anual em momento posterior. Quando ajustarmos a assinatura do cliente, poderemos mudar simplesmente o preço da assinatura "natação":

```php
    $user->subscription('swimming')->swap('price_swimming_yearly');
```

 Claro que você também pode cancelar totalmente a assinatura:

```php
    $user->subscription('swimming')->cancel();
```

### Fatura por consumo

 [Faturamento por uso](https://stripe.com/docs/billing/subscriptions/metered-billing) permite cobrar clientes com base no uso do produto durante um ciclo de faturamento. Por exemplo, você pode cobrar clientes com base no número de mensagens de texto ou e-mails enviados por mês.

 Para começar a usar o faturamento por uso, primeiro você precisará criar um novo produto no painel do Stripe com um preço por uso. Depois, use o `meteredPrice` para adicionar o ID do preço por uso à assinatura de um cliente:

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription('default')
            ->meteredPrice('price_metered')
            ->create($request->paymentMethodId);

        // ...
    });
```

 Também é possível iniciar um assinatura paga através do Stripe Checkout (#checkout):

```php
    $checkout = Auth::user()
            ->newSubscription('default', [])
            ->meteredPrice('price_metered')
            ->checkout();

    return view('your-checkout-view', [
        'checkout' => $checkout,
    ]);
```

#### Relatório de uso

 A medida que seu cliente usa o aplicativo, você informará ao Stripe suas atividades, para que sejam cobradas com precisão. Para incrementar a utilização de um plano tarifado, você pode usar o método `reportUsage`:

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsage();
```

 Por padrão, uma quantidade de uso de 1 é acrescentada ao período de facturação. Alternativamente, você pode transmitir um valor específico de "uso" para acrescentar à conta do cliente referente ao período de facturação:

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsage(15);
```

 Se o seu aplicativo oferecer vários preços em uma assinatura única, você precisará usar o método `reportUsageFor` para especificar o custo que deseja relatar:

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsageFor('price_metered', 15);
```

 Às vezes, poderá ter de atualizar um uso informado anteriormente. Para o fazer, pode passar uma marcação temporal ou uma instância de `DateTimeInterface` como segundo parâmetro ao método `reportUsage`. Assim, o Stripe irá atualizar a utilização informada nessa data e hora específicas:

- Se pretender continuar a atualizar registos de uso passados, pode fazê-lo uma vez que a marcação temporal é ainda dentro do período de faturamento em curso.

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsage(5, $timestamp);
```

#### Recuperando registros de utilização

 Para recuperar o uso passado de um cliente, você pode usar o método `usageRecords` da instância de assinatura:

```php
    $user = User::find(1);

    $usageRecords = $user->subscription('default')->usageRecords();
```

 Se o seu aplicativo oferecer vários preços em uma única assinatura, você poderá usar o método `usageRecordsFor` para especificar o preço mensurado que deseja obter registros de uso:

```php
    $user = User::find(1);

    $usageRecords = $user->subscription('default')->usageRecordsFor('price_metered');
```

 As méthodes `usageRecords` e `usageRecordsFor` retornam uma instância da coleção contendo um registo associativo de registos de utilização. Pode iterar por este registo para exibir a utilização total do cliente:

```php
    @foreach ($usageRecords as $usageRecord)
        - Period Starting: {{ $usageRecord['period']['start'] }}
        - Period Ending: {{ $usageRecord['period']['end'] }}
        - Total Usage: {{ $usageRecord['total_usage'] }}
    @endforeach
```

 Para um referencial completo de todos os dados de utilização retornados e as formas de utilizar a paginação baseada em cursor do Stripe, por favor consulte [a documentação oficial da API do Stripe](https://stripe.com/docs/api/usage_records/subscription_item_summary_list).

### Impostos de assinatura

 > [AVERTISSEMENT]
 [Cálculo automático de impostos usando o Stripe Tax (Taxa de Imposto)] (#tax-configuration)

 Para especificar as alíquotas de impostos que um usuário paga em uma assinatura, você deve implementar o método `taxRates` no seu modelo faturável e retornar um array contendo os IDs das taxas de impostos do Stripe. Você pode definir essas alíquotas de impostos no [seu painel do Stripe](https://dashboard.stripe.com/test/tax-rates):

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

 O método `taxRates` permite aplicar uma taxa de imposto a um cliente por cliente, o que pode ser útil para uma base de utilizadores com abrangência de vários países e taxas de impostos.

 Se você estiver oferecendo assinaturas com vários produtos, poderá definir diferentes alíquotas de impostos para cada preço implementando um método `priceTaxRates` no seu modelo faturável:

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

 > [!AVISO]
 > O método `taxRates` só se aplica a encargos de subscrição. Se utilizar o Cashier para efetuar pagamentos "únicos", terá de especificar manualmente a taxa fiscal nesse momento.

#### Sincronização das taxas fiscais

 Ao alterar as IDs de impostos codificadas de retorno do método `taxRates`, a configuração dos impostos em quaisquer assinaturas existentes para o usuário permanecerá inalterada. Se pretender atualizar o valor dos impostos nas assinaturas existentes com os novos valores de taxRates, deve chamar o método `syncTaxRates` na instância da assinatura do usuário:

```php
    $user->subscription('default')->syncTaxRates();
```

 Isso também sincronizará os valores de impostos dos itens de uma assinatura. Se sua aplicação oferecer assinaturas com vários produtos, você deve garantir que seu modelo de cobrança implemente o método `priceTaxRates` [discutido acima](#impostos-de-assinatura).

#### Isenção Fiscal

 O sistema de caixa também oferece os métodos `isNotTaxExempt`, `isTaxExempt` e `reverseChargeApplies` para determinar se o cliente é isento de impostos. Estes métodos chamam a API Stripe para determinar o status do cliente como isento de impostos:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->isTaxExempt();
    $user->isNotTaxExempt();
    $user->reverseChargeApplies();
```

 > [AVERIGEMENTO DE ERROS]
 Estes métodos também estão disponíveis em qualquer objeto Invoice. No entanto, quando chamados no objeto Invoice, os métodos determinam o estado de isenção ao tempo do pedido da fatura.

### Inscrição Fechamento de data

 Por padrão, o ponto de ancoragem do ciclo de faturamento é a data em que a assinatura foi criada ou, se um período de avaliação for utilizado, a data de conclusão da mesma. Se pretender modificar a data de ancoragem de faturamento, poderá utilizar o método `anchorBillingCycleOn`:

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

 Para obter mais informações sobre como gerir ciclos de faturamento de subscrição, consulte a documentação [de ciclo de faturamento Stripe](https://stripe.com/docs/billing/subscriptions/billing-cycle)

### Cancelar assinaturas

 Para cancelar uma assinatura, chame o método `cancel` no objeto da assinatura do usuário:

```php
    $user->subscription('default')->cancel();
```

 Quando um assinante for cancelado, a "Cashier" definirá automaticamente a coluna `ends_at` na sua tabela de base de dados `subscriptions`. Essa coluna é utilizada para saber quando o método `subscribed` deve começar a retornar `false`.

 Por exemplo, se um cliente cancelar uma subscrição em 1º de março, mas a subscrição não terminaria até 5 de março, o método `subscribed` continuará retornando como `true` até 5 de março. Isso acontece porque normalmente o usuário pode continuar usando um aplicativo até o final do ciclo de faturamento.

 Você pode determinar se um usuário cancelou sua assinatura, mas ainda está em seu "período de carência", utilizando o método `onGracePeriod`:

```php
    if ($user->subscription('default')->onGracePeriod()) {
        // ...
    }
```

 Se você quiser cancelar um assinatura imediatamente, chame o método `cancelNow` do abono do usuário.

```php
    $user->subscription('default')->cancelNow();
```

 Se pretender cancelar imediatamente uma subscrição e faturar qualquer uso medido não facturado ou novas/pendente nota de faturação, chamar o método `cancelNowAndInvoice` na subscrição do utilizador:

```php
    $user->subscription('default')->cancelNowAndInvoice();
```

 É também possível cancelar o seu contrato em determinado momento:

```php
    $user->subscription('default')->cancelAt(
        now()->addDays(10)
    );
```

 Finalmente, você deve sempre cancelar assinaturas de usuário antes de excluir o modelo do usuário associado:

```php
    $user->subscription('default')->cancelNow();

    $user->delete();
```

### Recuperar assinaturas

 Se um cliente tiver cancelado sua assinatura e você desejar retomá-la, poderá invocar o método `resume` na assinatura. No entanto, o cliente ainda deve estar dentro do período de carência para poder retomar a assinatura:

```php
    $user->subscription('default')->resume();
```

 Se o cliente cancelar uma assinatura e, em seguida, a retomar antes de a mesma se encontrar totalmente expirada, o cliente não será imediatamente faturado. A assinatura é reativada e o cliente é faturado no ciclo de faturação original.

## Testes de assinaturas

### Com o método de pagamento "antes do envio"

 Se desejar oferecer períodos de teste aos seus clientes enquanto continua a coletar informações sobre os métodos de pagamento, deve utilizar o método `trialDays` ao criar as suas assinaturas:

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription('default', 'price_monthly')
                    ->trialDays(10)
                    ->create($request->paymentMethodId);

        // ...
    });
```

 Este método definirá a data de término do período de teste no registo de assinatura da base de dados e ordenará ao Stripe que não comece a faturar o cliente até depois desta data. Quando for utilizado o método `trialDays`, a Cashier substituirá o período de teste por padrão definido para o preço no Stripe.

 > [!AVISO]
 Se o assinante não cancelar sua assinatura antes da data de término do período experimental, ele será cobrado assim que a fase experimental terminar. Portanto, você deve certifique-se de notificar seus usuários sobre essa data.

 O método `trialUntil` permite especificar uma instância do tipo DateTime que indica o momento em que terminará o período de teste:

```php
    use Carbon\Carbon;

    $user->newSubscription('default', 'price_monthly')
                ->trialUntil(Carbon::now()->addDays(10))
                ->create($paymentMethod);
```

 Pode determinar se um utilizador está no período de avaliação através da metoda `onTrial` da instância do utilizador ou da metoda `onTrial` da instância da subscrição. Os dois exemplos abaixo são equivalentes:

```php
    if ($user->onTrial('default')) {
        // ...
    }

    if ($user->subscription('default')->onTrial()) {
        // ...
    }
```

 Você pode usar o método `endTrial` para encerrar um teste de assinatura imediatamente:

```php
    $user->subscription('default')->endTrial();
```

 Para determinar se um teste ativo já expirou, você pode usar os métodos `hasExpiredTrial`:

```php
    if ($user->hasExpiredTrial('default')) {
        // ...
    }

    if ($user->subscription('default')->hasExpiredTrial()) {
        // ...
    }
```

#### Definindo Dias de Avaliação no Stripe/Caixa

 Você pode optar por definir quantos dias de teste seus preços receberão no painel do Stripe ou passá-los sempre explicitamente usando o Cashier. Se você escolher definir os dias de teste dos seus preços no Stripe, deverá estar ciente de que novos assinantes, incluindo novos assinantes para um cliente que já teve um em um passado distante, sempre receberão um período de teste a menos que você chame explicitamente o método `skipTrial()`.

### Sem método de pagamento prévio

 Se desejar disponibilizar períodos de avaliação sem recolher as informações dos meios de pagamento do utilizador imediatamente, pode definir a coluna `trial_ends_at` no registo do utilizador para a data de término da sua avaliação. Isso é normalmente feito durante o processo de registo de utilizadores:

```php
    use App\Models\User;

    $user = User::create([
        // ...
        'trial_ends_at' => now()->addDays(10),
    ]);
```

 > [!AVISO]
 Adicione o atributo `trial_ends_at` ao modelo faturável, na definição da classe, com as informações em formato de data (conforme especificado no guia de [data emitido](/docs/{{version}}/eloquent-mutators#date-casting).

 O caixa refere-se a este tipo de teste como "teste genérico", pois não está associado a qualquer assinatura existente. O método `onTrial` na instância do modelo faturável retornará `true` se a data atual não passar o valor de `trial_ends_at`:

```php
    if ($user->onTrial()) {
        // User is within their trial period...
    }
```

 Quando estiver pronto para criar uma assinatura real para o usuário, você poderá usar a metodologia `newSubscription`, como de costume:

```php
    $user = User::find(1);

    $user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

 Para recuperar a data de finalização da versão de avaliação do usuário, pode utilizar o método `trialEndsAt`. Este método irá devolver uma instância de data Carbon se um usuário estiver em versão de avaliação ou `null` se não estiver. Pode também passar um tipo opcional de subscrição caso pretenda obter a data de finalização da versão de avaliação para uma subscrição específica, fora da subscrição por defeito:

```php
    if ($user->onTrial()) {
        $trialEndsAt = $user->trialEndsAt('main');
    }
```

 Você também poderá usar o método `onGenericTrial` caso queira saber especificamente se o usuário está dentro do período de teste "genérico" e ainda não criou uma assinatura real.

```php
    if ($user->onGenericTrial()) {
        // User is within their "generic" trial period...
    }
```

### Estender os testes

 O método `extendTrial` permite que você prorrogue o período de avaliação de um plano após este tiver sido criado. Se o período da avaliação já tiver expirado e se o cliente já estiver sendo cobrado pelo plano, você ainda poderá oferecer-lhe uma extensão do período de avaliação. O tempo gasto durante o período de avaliação será deduzido da próxima fatura do cliente:

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

## Gerenciando webhooks do Stripe

 > [!ATENÇÃO]
 O [Stripe CLI](https://stripe.com/docs/stripe-cli) para ajudar a testar webhooks durante o desenvolvimento local.

 A Stripe pode notificar seu aplicativo de vários eventos por meio de Webhooks. Por padrão, um roteamento que aponta para o controlador do Webhook da Cashier é registrado automaticamente pelo provedor de serviços da Cashier. Este controlador irá lidar com todos os pedidos de webhooks recebidos.

 Por padrão, o controlador de webhook Cashier irá automaticamente cancelar assinaturas com demasiadas cobranças falhadas (de acordo com as suas definições no Stripe), atualizações de clientes, exclusões de clientes, atualizações de subscrição e alterações de método de pagamento; contudo, como veremos em breve, poderá estender este controlador para o processar qualquer evento webhook do Stripe que pretenda.

 Para garantir que seu aplicativo pode lidar com webhooks do Stripe, certifique-se de configurar o endereço da Webhook no painel de controle do Stripe. O controlador de webhook do Cashier responde, por padrão, ao caminho de URL `/stripe/webhook`. A lista completa de todos os webhooks que você deve ativar no painel de controle do Stripe é:

 - `cliente.assinatura.criada`
 : `- customer.subscription.updated`
 - `cliente.assinatura.excluído`
 - ``customer.updated``
 - `cliente.excluído`
 - `payment_method.automatically_updated`
 - "fatura.pagamento_deve_ser_realizado"
 - `fatura.pago`

 Para conveniência, o Cashier inclui um comando de Artesão "cashier:webhook". Este comando criará um Webhook no Stripe que ouvirá todos os eventos exigidos pelo Cashier:

```shell
php artisan cashier:webhook
```

 Por padrão, o webhook criado apontará para a URL definida pela variável de ambiente `APP_URL` e ao caminho `cashier.webhook` incluído na Cashier. Você pode fornecer a opção `--url` ao invocar o comando se desejar usar um URL diferente:

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

 O webhook criado utilizará a versão da API do Stripe com a qual sua versão do Cashier é compatível. Se desejar usar uma versão diferente do Stripe, poderá fornecer a opção `--api-version`:

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

 Após a criação, o Webhook estará imediatamente ativo. Se você desejar criar o Webhook mas quiser que ele seja desativado até estar preparado para o usar, é possível fornecer a opção `--disabled` ao invocar o comando:

```shell
php artisan cashier:webhook --disabled
```

 > [ADVERTÊNCIA]
 Middleware de verificação da assinatura do Webhook.

#### Webhook e proteção contra ataques XSRF

 Como os webhook da Stripe precisam contornar a proteção de [CSRF] ({{version}}/csrf) do Laravel, você deve assegurar que o Laravel não tente validar o token CSRF para os webhooks da Stripe. Para isso, você deve excluir `stripe/*` da proteção de CSRF em seu arquivo `bootstrap/app.php`:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'stripe/*',
        ]);
    })
```

### Definindo os manipuladores de eventos de webhooks

 O serviço de caixa lida automaticamente com cancelamentos de subscrição para cobranças não-concluídas e outros eventos webhook comuns da Stripe. No entanto, se pretender gerir eventos webhook adicionais, pode fazê-lo através do monitoramento dos seguintes eventos enviados pelo serviço de caixa:

 - `Laravel\Cashier\Events\WebhookReceived`
 `- Laravel\Cashier\Events\WebhookHandled

 Ambos os eventos contêm o conteúdo completo do webhook Stripe. Por exemplo, se desejar tratar o webhook `invoice.payment_succeeded`, poderá registar um [ouvinte](/docs/{{version}}/events#defining-listeners) que irá gerir o evento:

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

### Verificando assinaturas de webhook

 Para garantir seus Webhooks você pode usar [assinaturas de Webhook do Stripe](https://stripe.com/docs/webhooks/signatures). Por conveniência, Cashier inclui automaticamente um middleware que valida se o pedido de webhook da Stripe é válido ou não.

 Para habilitar a verificação de um webhook, certifique-se que a variável ambiente `STRIPE_WEBHOOK_SECRET` esteja definida no arquivo `.env` da aplicação. O "secret" do webhook pode ser recuperado na área de trabalho da sua conta Stripe.

## Cobranças únicas

### Carregamento simples

 Se você deseja cobrar de um cliente em uma única transação, pode usar o método `charge` para uma instância de modelo faturável. Você precisará fornecer um identificador de meio de pagamento como segundo argumento ao método `charge`:

```php
    use Illuminate\Http\Request;

    Route::post('/purchase', function (Request $request) {
        $stripeCharge = $request->user()->charge(
            100, $request->paymentMethodId
        );

        // ...
    });
```

 O método `charge` aceita um array como terceiro argumento, permitindo que você passe as opções desejadas para a cobrança subjacente criada pelo Stripe. Mais informações sobre as opções disponíveis na criação de cobranças podem ser encontradas no [documentação do Stripe](https://stripe.com/docs/api/charges/create):

```php
    $user->charge(100, $paymentMethod, [
        'custom_option' => $value,
    ]);
```

 Você também pode usar o método `cobrar` sem um cliente ou usuário subjacente. Para fazer isso, invoque o método `cobrar` em uma nova instância do modelo faturável da aplicação:

```php
    use App\Models\User;

    $stripeCharge = (new User)->charge(100, $paymentMethod);
```

 O método `charge` arrojara uma exceção caso a cobrança falhe. Caso a cobrança seja bem-sucedida, um objeto do tipo `Laravel\Cashier\Payment` será retornado:

```php
    try {
        $payment = $user->charge(100, $paymentMethod);
    } catch (Exception $e) {
        // ...
    }
```

 > [AVISO]
 > O método `charge` aceita o montante do pagamento na menor unidade da moeda usada na aplicação. Por exemplo, se os clientes fizerem o pagamento em dólares americanos, os valores devem ser especificados em centavos.

### Cobrar com fatura

 Às vezes você pode precisar cobrar uma taxa única e oferecer um PDF com a fatura ao seu cliente. O método `invoicePrice` permite isso. Por exemplo, vamos fazer uma fatura de cinco novas camisetas para um cliente:

```php
    $user->invoicePrice('price_tshirt', 5);
```

 A fatura é imediatamente cobrada no método de pagamento padrão do utilizador. O método `invoicePrice` também aceita um array como terceiro argumento, que contém as opções de faturamento para o item da facturação. O quarto argumento aceite pelo método é também um array e deve conter as opções de faturamento para a própria fatura:

```php
    $user->invoicePrice('price_tshirt', 5, [
        'discounts' => [
            ['coupon' => 'SUMMER21SALE']
        ],
    ], [
        'default_tax_rates' => ['txr_id'],
    ]);
```

 Tal como acontece com `invoicePrice`, pode utilizar o método `tabPrice` para criar uma faturação única de vários itens (até 250 itens por fatura) adicionando-os à conta do cliente, podendo então facturá-lo. Por exemplo, pode facturar um cliente por cinco camisas e dois canecos:

```php
    $user->tabPrice('price_tshirt', 5);
    $user->tabPrice('price_mug', 2);
    $user->invoice();
```

 Como alternativa, você pode usar o método `invoiceFor` para cobrar um valor único do método de pagamento padrão do cliente:

```php
    $user->invoiceFor('One Time Fee', 500);
```

 Apesar de você poder utilizar o método `invoiceFor`, é recomendável que utilize os métodos `invoicePrice` e `tabPrice` com preços pré-definidos, pois assim você terá acesso a melhores analíticas e dados no seu painel do Stripe relacionado às suas vendas por produto.

 > [ATENÇÃO]
 > As funções `invoice`, `invoicePrice` e `invoiceFor` criarão uma fatura no Stripe, que tentará novamente a cobrança em caso de falha. Se não pretender que as faturas tentem novamente o pagamento após a primeira tentativa frustrada, terá de encerrá-las utilizando a API do Stripe após a primeira cobrança mal-sucedida.

### Criando intenções de pagamento

 Você pode criar uma nova intenção de pagamento Stripe invocando o método `pay` em uma instância do modelo cobrável. A chamada deste método irá criar uma intenção de pagamento que está envolta por uma instância `Laravel\Cashier\Payment`:

```php
    use Illuminate\Http\Request;

    Route::post('/pay', function (Request $request) {
        $payment = $request->user()->pay(
            $request->get('amount')
        );

        return $payment->client_secret;
    });
```

 Depois de criar o objetivo de pagamento, você poderá retornar o segredo do cliente para a frente da sua aplicação para que o usuário possa concluir o pagamento em seu navegador. Para saber mais sobre como construir fluxos de pagamentos completos usando os objetivos de pagamento do Stripe, consulte a documentação [do Stripe](https://stripe.com/docs/payments/accept-a-payment?platform=web).

 Ao usar o método `pay`, os métodos de pagamento por defeito que estiverem ativados na sua área do Stripe estarão disponíveis para o cliente. Caso pretenda limitar a utilização a alguns métodos específicos, poderá utilizar o método `payWith`:

```php
    use Illuminate\Http\Request;

    Route::post('/pay', function (Request $request) {
        $payment = $request->user()->payWith(
            $request->get('amount'), ['card', 'bancontact']
        );

        return $payment->client_secret;
    });
```

 > [ATENÇÃO]
 > As funções `pay` e `payWith` aceitam o valor do pagamento no menor denominador da moeda usada pelo seu aplicativo. Por exemplo, se os clientes estiverem a pagar em dólares norte-americanos, as quantias devem ser indicadas em centavos.

### Retirada de dinheiro

 Se você precisa reembolsar uma cobrança do Stripe, pode usar o método `refund`. Este método aceita o ID da intenção de pagamento do Stripe [#intenções-de-pagamentos-para-cobrancas-padrão (link)] como seu primeiro argumento:

```php
    $payment = $user->charge(100, $paymentMethodId);

    $user->refund($payment->id);
```

## Faturas

### Recuperando faturas

 Pode recuperar facilmente um conjunto de faturas emitidas por um modelo através do método `invoices`. O método `invoices` retorna uma coleção de instâncias do tipo `Laravel\Cashier\Invoice`:

```php
    $invoices = $user->invoices();
```

 Se pretender incluir faturas pendentes nos resultados, poderá utilizar o método `invoicesIncludingPending`:

```php
    $invoices = $user->invoicesIncludingPending();
```

 Você pode usar o método `findInvoice` para recuperar uma fatura específica por meio do seu ID:

```php
    $invoice = $user->findInvoice($invoiceId);
```

#### Exibindo informações da fatura

 Ao apresentar as faturas do cliente, pode utilizar os métodos da fatura para exibir as informações relevantes. Por exemplo, pode desejar listar todas as faturas numa tabela, permitindo ao utilizador fazer o download de qualquer uma delas:

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

### Faturas futuras

 Para recuperar o próximo faturamento de um cliente, pode utilizar o método `upcomingInvoice`:

```php
    $invoice = $user->upcomingInvoice();
```

 Da mesma forma, se o cliente tiver várias assinaturas, pode recuperar também a próxima fatura de uma determinada assinatura:

```php
    $invoice = $user->subscription('default')->upcomingInvoice();
```

### Antecipação da fatura do abonnamento

 Usando o método `previewInvoice`, você pode ter uma visualização prévia da fatura antes de fazer alterações nos preços. Isto irá permitir-lhe ver como será a fatura do cliente quando efetuada uma determinada alteração:

```php
    $invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

 Você pode passar um conjunto de preços para o método `previewInvoice`, a fim de ter uma visualização prévia das notas com vários novos preços:

```php
    $invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

### Gerando faturas em PDF

 Antes de gerar os PDFs da fatura, você deve usar o Composer para instalar a biblioteca Dompdf, que é o renderizador padrão de faturas no aplicativo Caixa.

```shell
composer require dompdf/dompdf
```

 A partir de um itinerário ou controlador, é possível utilizar o método `downloadInvoice` para gerar uma exportação em formato PDF do faturamento solicitado. Este método irá automaticamente gerar a resposta HTTP necessária para o download da fatura:

```php
    use Illuminate\Http\Request;

    Route::get('/user/invoice/{invoice}', function (Request $request, string $invoiceId) {
        return $request->user()->downloadInvoice($invoiceId);
    });
```

 Como padrão, todos os dados da fatura são derivados dos dados do cliente e da fatura armazenadas no Stripe. O nome de arquivo é baseado em seu valor de configuração `app.name`. No entanto, você pode personalizar alguns destes dados fornecendo um array como o segundo argumento ao método `downloadInvoice`. Este array permite que você personalize informações como detalhes da empresa e do produto:

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

 O método `downloadInvoice` também permite um nome de arquivo personalizado por meio do terceiro argumento. Este nome será automaticamente terminado com o ponto e finalizada com `.pdf`:

```php
    return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

#### Gerador de faturas personalizadas

 O Cashier também permite o uso de um gerador de nota fiscal personalizado. Por padrão, o Cashier usa a implementação `DompdfInvoiceRenderer`, que utiliza a biblioteca PHP [dompdf](https://github.com/dompdf) para gerar as notas fiscais do Cashier. No entanto, você pode usar qualquer tipo de renderizador implementando a interface `Laravel\Cashier\Contracts\InvoiceRenderer`. Por exemplo, talvez você queira renderizar um PDF da nota fiscal usando uma chamada API para um serviço de renderização de PDF de terceiros:

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

 Depois de implementar o contrato do formatação da fatura, você deve atualizar o valor do parâmetro `cashier.invoices.renderer` no arquivo de configuração do seu aplicativo, `config/cashier.php`. Esse parâmetro deve ser definido com o nome da classe da sua implementação personalizada do formatação.

## Checkout

 O caixa Stripe também suporta [Stripe Checkout](https://stripe.com/payments/checkout). O Stripe Checkout elimina o trabalho de implementar páginas personalizadas para aceitar pagamentos, fornecendo uma página de pagamento pré-construída e hospedada.

 A documentação a seguir contém informações sobre como começar a usar Stripe Checkout com Cashier. Para saber mais sobre o Stripe Checkout, você também deve analisar a própria documentação do [Stripe sobre Checkout](https://stripe.com/docs/payments/checkout).

### Verificação de produtos

 Você pode fazer o checkout de um produto existente que foi criado em sua área do Stripe usando o método `checkout` em um modelo factível. O método `checkout` iniciará uma nova sessão do Stripe Checkout. Como padrão, é necessário passar um ID de preço Stripe:

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout('price_tshirt');
    });
```

 Se necessário, você também pode especificar uma quantidade de produtos:

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout(['price_tshirt' => 15]);
    });
```

 Quando um cliente visita essa rota, ele será redirecionado para a página de Checkout do Stripe. Por padrão, quando o usuário conclui ou cancela uma compra com sucesso, ele será redirecionado para sua localização da rota `home`, mas você pode especificar endereços personalizados de retorno usando as opções `success_url` e `cancel_url`:

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout(['price_tshirt' => 1], [
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
    });
```

 Ao definir a opção de checkout como `success_url`, você pode instruir o Stripe a adicionar o identificador da sessão do checkout como um parâmetro de query string ao invocar seu URL. Para fazer isso, adicione a string literal `{CHECKOUT_SESSION_ID}` ao parâmetro `success_url` como um parâmetro de query string. O Stripe substituirá esse marcador por um identificador da sessão do checkout real:

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

#### Códigos de promoção

 Por padrão, o Stripe Checkout não permite [códigos de promoção reembolsáveis por utilizador](https://stripe.com/docs/billing/subscriptions/discounts/codes). Felizmente, há uma maneira fácil de ativar estes para a página Checkout. Para fazer isso, pode invocar o método `allowPromotionCodes`:

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()
            ->allowPromotionCodes()
            ->checkout('price_tshirt');
    });
```

### Checkout com carregamento único

 Você também pode fazer um pagamento simples para um produto ad-hoc que não tenha sido criado em seu painel do Stripe. Para isso, você pode usar o método `checkoutCharge` em um modelo cobrável e passar uma quantia cobrável, um nome de produto e uma opcional quantidade. Quando um cliente visitar este caminho será redirecionado para a página Checkout do Stripe:

```php
    use Illuminate\Http\Request;

    Route::get('/charge-checkout', function (Request $request) {
        return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
    });
```

 > [ATENÇÃO]
 > Ao usar o método `checkoutCharge`, a Stripe sempre cria um novo produto e preço no seu painel Stripe. Por conseguinte, recomendamos que crie os produtos de antemão no seu painel Stripe e use o método `checkout`.

### Checkouts de assinatura

 > [AVISO]
 > O uso do carrinho de compras Stripe para assinaturas requer que você ative o Webhook `customer.subscription.created` em seu painel do Stripe. Esse webhook criará o registro da assinatura em sua base de dados e armazenará todos os itens relevantes da assinatura.

 Você também pode usar o Stripe Checkout para iniciar assinaturas. Depois de definir sua assinatura com os métodos da construção de assinatura do Caixa, você pode chamar o método `checkout `. Quando um cliente visitar essa rota, ele será redirecionado para a página de Checkout do Stripe:

```php
    use Illuminate\Http\Request;

    Route::get('/subscription-checkout', function (Request $request) {
        return $request->user()
            ->newSubscription('default', 'price_monthly')
            ->checkout();
    });
```

 Assim como nas verificações de produtos, você pode personalizar o URL de sucesso e cancelamento:

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

 Claro que você também pode habilitar códigos de promoção para o checkout dos seus assinantes:

```php
    use Illuminate\Http\Request;

    Route::get('/subscription-checkout', function (Request $request) {
        return $request->user()
            ->newSubscription('default', 'price_monthly')
            ->allowPromotionCodes()
            ->checkout();
    });
```

 > [AVERTIMENTO]
 Veja a documentação da API de sessões de pagamento do Stripe ([aqui](https://stripe.com/docs/api/checkout/sessions/create)) para revisar quais parâmetros estão disponíveis.

#### Stripe Checkout e períodos de avaliação

 Claro que é possível definir um período de teste ao criar uma assinatura com o pagamento concluído utilizando Stripe Checkout.

```php
    $checkout = Auth::user()->newSubscription('default', 'price_monthly')
        ->trialDays(3)
        ->checkout();
```

 No entanto, o período de avaliação deve ser de pelo menos 48 horas, que é o tempo mínimo suportado pela versão gratuita do Stripe Checkout.

#### Assinaturas e Webhook

 Lembre-se de que o Stripe e o Cashier atualizam os estados dos assinantes por meio de Webhooks, então há uma chance de um assinante ainda não estar ativo quando o cliente retornar à aplicação após digitar suas informações de pagamento. Para lidar com esse cenário, talvez seja melhor exibir uma mensagem informando ao usuário que seu pagamento ou assinatura está pendente.

### Coletando números de identificação fiscal

 O pagamento também suporta a coleta do número de identificação fiscal do cliente. Para ativar isso em uma sessão de checkout, chame o método `collectTaxIds` ao criar a sessão:

```php
    $checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

 Quando este método for invocado, será apresentada ao cliente uma nova caixa de seleção que permite indicar se está a efetuar uma compra na qualidade de empresa. Neste caso, terá a oportunidade de preencher o seu número de identificação fiscal.

 > [AVISO]
 Se o serviço prestado na sua aplicação tiver uma [ cobrança automática de impostos](#tax-configuration), esta característica estará ativada automaticamente e não será necessário invocar o método `collectTaxIds`.

### Check-out de hóspedes

 Usando o método `Checkout::guest`, você pode iniciar sessões de checkout para convidados do seu aplicativo que não tenham uma conta:

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

 Da mesma forma que ao criar sessões de pagamento para usuários existentes, você pode utilizar os métodos adicionais disponíveis na instância `Laravel\Cashier\CheckoutBuilder` para personalizar a sessão de pagamento para hóspedes.

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

 Após o pagamento ser feito, a Stripe pode enviar um evento `checkout.session.completed` por meio do webhook. Por isso, certifique-se de [configurar seu webhook da Stripe](https://dashboard.stripe.com/webhooks) para realmente enviar esse evento para sua aplicação. Depois que o webhook for habilitado na plataforma do Stripe, você poderá [manusear o webhook com Cashier](#manuseando-os-webhooks-do-stripe). O objeto contido no payload do webhook será um [`checkout` object](https://stripe.com/docs/api/checkout/sessions/object) que você poderá inspecionar para concluir o pedido de seu cliente.

## Como lidar com pagamentos fracassados

 Por vezes, os pagamentos de subscrições ou cobranças individuais podem falhar. Quando isso acontece, o módulo `Cashier` lança uma exceção `Laravel\Cashier\Exceptions\IncompletePayment`, que informa que ocorreu um falhanço. Depois de capturar essa exceção, você tem duas opções para prosseguir.

 Primeiramente, você pode redirecionar seu cliente para a página de confirmação do pagamento dedicada, que está incluída com o Cashier. Essa página já possui uma rota associada que é registrada pelo provedor de serviços do Cashier. Assim, você pode capturar a exceção `IncompletePayment` e redirecionar o usuário para a página de confirmação do pagamento:

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

 Na página de confirmação do pagamento, o cliente será solicitado a inserir novamente as informações do cartão de crédito e executar quaisquer ações adicionais necessárias para Stripe, tais como confirmação "3D Secure". Após confirmar o seu pagamento, o utilizador será redirecionado para a URL fornecida pelo parâmetro `redirect` especificado acima. Após o redirecionamento, as variáveis de consulta `message` (cadena) e `success` (inteiro) serão adicionadas à URL. A página de pagamento atualmente suporta os seguintes tipos de métodos de pagamento:

<div class="content-list" markdown="1">

 - Cartões de crédito
 - Alipay
 - Bancontact
 - BECS débito direto
 - EPS
 - Giropay
 - iDEAL
 - Débito direto SEPA

</div>

 Como alternativa, você pode permitir que o Stripe gerencie a confirmação do pagamento por você. Nesse caso, em vez de redirecionar para a página de confirmação do pagamento, você pode [configurar os e-mails de faturação automática do Stripe](https://dashboard.stripe.com/account/billing/automatic) no seu painel do Stripe. No entanto, se uma exceção `IncompletePayment` for pega, você deve informar o usuário de que ele receberá um e-mail com instruções adicionais para confirmação do pagamento.

 Podem ocorrer exceções de pagamento para os seguintes métodos: `charge`, `invoiceFor` e `invoice` em modelos que usam a característica `Billable`. Ao interagir com assinaturas, é possível que as chamadas aos métodos `create` no `SubscriptionBuilder` e `incrementAndInvoice` e `swapAndInvoice` nos modelos `Subscription` e `SubscriptionItem` gerem exceções de pagamento incompleto.

 Para determinar se um assinatura existente tem um pagamento incompleto, você pode usar o método `hasIncompletePayment` do modelo faturável ou de uma instância de assinatura:

```php
    if ($user->hasIncompletePayment('default')) {
        // ...
    }

    if ($user->subscription('default')->hasIncompletePayment()) {
        // ...
    }
```

 Pode derivar o estado específico de um pagamento incompleto ao inspecionar a propriedade `payment` da instância de exceção:

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

### Confirmação de pagamentos

 Alguns métodos de pagamento exigem dados adicionais para confirmar os pagamentos. Por exemplo, os métodos de pagamento SEPA requerem dados adicionais no processo de pagamento. Pode fornecer esses dados ao caixa utilizando o método `withPaymentConfirmationOptions`:

```php
    $subscription->withPaymentConfirmationOptions([
        'mandate_data' => '...',
    ])->swap('price_xxx');
```

 Consulte a documentação da [API do Stripe] (https://stripe.com/pt-br/docs/api/payment_intent_objects#confirm_payment) para conhecer as opções disponíveis ao confirmar um pagamento.

## Autenticação forte do cliente

 Se a sua empresa ou um dos seus clientes estiverem sediados na Europa, terão de respeitar os regulamentos da União Europeia em matéria de Autenticação Fidedigna do Cliente (Strong Customer Authentication - SCA). Estes regulamentos foram impostos em setembro de 2019 pela União Europeia para prevenir fraudes a pagamentos. Por sorte, Stripe e Cashier estão preparados para construir aplicações conformes com o SCA.

 > [ATENÇÃO]
 Consulte o guia da Stripe sobre a PSD2 e a SCA (https://stripe.com/guides/strong-customer-authentication), bem como o seu

### Pagamentos que exigem confirmação adicional

 Os regulamentos do SCA requerem, frequentemente, uma verificação adicional para confirmar e processar um pagamento. Nesse caso, o Cashier irá lançar uma exceção `Laravel\Cashier\Exceptions\IncompletePayment` que informa que é necessária uma verificação adicional. Mais informações sobre como lidar com essas exceções podem ser encontradas na documentação sobre [lidar com pagamentos falhados].

 As telas de confirmação do pagamento apresentadas pelo Stripe ou pela Cashier podem ser adaptadas ao fluxo de pagamentos de um determinado banco ou emissor de cartão e podem incluir confirmação adicional, uma pequena cobrança temporária, autenticação por dispositivo separada ou outras formas de verificação.

#### Estado incompleto e vencido

 Quando um pagamento exigir confirmação adicional, a assinatura permanecerá em `incomplete` ou `past_due`, conforme indicado pela coluna de base de dados `stripe_status`. O Cashier ativará automaticamente a assinatura do cliente assim que a confirmação de pagamento estiver completa e sua aplicação for notificada pelo Stripe via webhook da conclusão.

 Para obter mais informações sobre os estados de "incompleto" e "vencido", consulte o nosso guia adicional sobre esses estados (#estado-incompleto-e-vencido).

### Notificações de pagamentos fora da sessão

 Como os regulamentos do SCA exigem que os clientes verifiquem ocasionalmente os seus detalhes de pagamento enquanto a sua assinatura estiver ativa, o Cashier pode enviar uma notificação ao cliente quando é necessária confirmação de pagamento fora da sessão. Por exemplo, isto poderá ocorrer aquando do renovação de uma assinatura. A notificação de pagamento no Cashier pode ser ativada definindo a variável de ambiente `CASHIER_PAYMENT_NOTIFICATION` para uma classe de notificação. Por defeito, esta notificação está desativada. O Cashier inclui naturalmente uma classe de notificação que poderá utilizar para este efeito, mas é livre de fornecer a sua própria classe de notificação se assim o pretender:

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

 Para garantir que as notificações de confirmação do pagamento fora da sessão são entregues, verifique se os [webhooks Stripe estão configurados para sua aplicação] (#handling-stripe-webhooks) e o webhook `invoice.payment_action_required` está ativado em seu painel Stripe. Além disso, seu modelo `Billable` também deve usar a característica `Illuminate\Notifications\Notifiable` do Laravel.

 > [ATENÇÃO]
 > As notificações serão enviadas mesmo quando os clientes efetuarem manualmente um pagamento que requer confirmação adicional Infelizmente, não há como o Stripe saber se o pagamento foi feito manualmente ou "fora da sessão". Mas, o cliente verá apenas uma mensagem de "Pagamento concluído" se visitar a página do pagamento após confirmar seu pagamento. O cliente não poderá confirmar acidentalmente o mesmo pagamento duas vezes e incorrer em um segundo custo acidental.

## Stripe SDK

 Muitos dos objetos de Cashier são embalagens que envolvem objetos do Stripe SDK. Se você deseja interagir diretamente com os objetos do Stripe, pode recuperá-los facilmente usando o método `asStripe`:

```php
    $stripeSubscription = $subscription->asStripeSubscription();

    $stripeSubscription->application_fee_percent = 5;

    $stripeSubscription->save();
```

 Você também pode usar o método `updateStripeSubscription` para atualizar um assinatura do Stripe diretamente:

```php
    $subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

 Você pode invocar o método `stripe` da classe `Cashier` se desejar usar o cliente diretamente, como `Stripe\StripeClient`. Por exemplo, você poderia usar este método para acessar a instância do `StripeClient` e recuperar uma lista de preços da sua conta no Stripe:

```php
    use Laravel\Cashier\Cashier;

    $prices = Cashier::stripe()->prices->all();
```

## Teste

 Ao testar um aplicativo que usa o Cashier, você pode simular os pedidos HTTP reais na API do Stripe; no entanto, isso requer implementar parcialmente o próprio comportamento do Cashier. Recomendamos, portanto, permitir que seus testes acessem a API real do Stripe. Embora seja mais lento, isso oferece maior confiança de que seu aplicativo está funcionando como esperado. Além disso, quaisquer testes lentos podem ser colocados em seu próprio grupo de teste Pest/PHPUnit.

 Ao fazer os testes, lembre-se de que o próprio Cashier já possui uma grande estrutura de teste, então você deve apenas focar nos testes do fluxo de inscrição e pagamento do seu aplicativo e não em todos os comportamentos subjacentes do Cashier.

 Para começar, adicione a versão **testing** do seu segredo do Stripe ao arquivo `phpunit.xml`:

```
    <env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

 Agora, sempre que interagir com a Cashier ao testar, serão enviadas solicitações de API reais para o ambiente de teste do Stripe. Para mais conveniência, você deve preencher antecipadamente sua conta de teste no Stripe com assinaturas/preços que poderão ser usados durante os testes.

 > [!NOTA]
 [Teste de números de cartão e tokens] (https://stripe.com/pt-BR/docs/testing), disponibilizado pela Stripe.
