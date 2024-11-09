# Laravel Cashier (Stripe)

## Introdução

[Laravel Cashier Stripe](https://github.com/laravel/cashier-stripe) fornece uma interface expressiva e fluente para os serviços de cobrança de assinaturas [do Stripe](https://stripe.com). Ele lida com quase todo o código de cobrança de assinaturas que você teme escrever. Além do gerenciamento básico de assinaturas, o Cashier pode lidar com cupons, troca de assinaturas, "quantidades" de assinaturas, períodos de carência de cancelamento e até mesmo gerar PDFs de faturas.

## Atualizando o Cashier

Ao atualizar para uma nova versão do Cashier, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/cashier-stripe/blob/master/UPGRADE.md).

::: warning AVISO
Para evitar alterações significativas, o Cashier usa uma versão fixa da API do Stripe. O Cashier 15 utiliza a versão da API do Stripe `2023-10-16`. A versão da API do Stripe será atualizada em lançamentos menores para fazer uso dos novos recursos e melhorias do Stripe.
:::

## Instalação

Primeiro, instale o pacote Cashier para Stripe usando o gerenciador de pacotes Composer:

```shell
composer require laravel/cashier
```

Após instalar o pacote, publique as migrações do Cashier usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Então, migre seu banco de dados:

```shell
php artisan migrate
```

As migrações do Cashier adicionarão várias colunas à sua tabela `users`. Elas também criarão uma nova tabela `subscriptions` para armazenar todas as assinaturas do seu cliente e uma tabela `subscription_items` para assinaturas com vários preços.

Se desejar, você também pode publicar o arquivo de configuração do Cashier usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-config"
```

Por fim, para garantir que o Cashier manipule corretamente todos os eventos do Stripe, lembre-se de [configurar o tratamento do webhook do Cashier](#handling-stripe-webhooks).

::: warning AVISO
O Stripe recomenda que qualquer coluna usada para armazenar identificadores do Stripe seja sensível a maiúsculas e minúsculas. Portanto, você deve garantir que a ordenação de colunas para a coluna `stripe_id` esteja definida como `utf8_bin` ao usar o MySQL. Mais informações sobre isso podem ser encontradas na [documentação do Stripe](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible).
:::

## Configuração

### Modelo Faturável

Antes de usar o Cashier, adicione o trait `Billable` à sua definição de modelo faturável. Normalmente, este será o modelo `App\Models\User`. Este trait fornece vários métodos para permitir que você execute tarefas comuns de faturamento, como criar assinaturas, aplicar cupons e atualizar informações de método de pagamento:

```php
    use Laravel\Cashier\Billable;

    class User extends Authenticatable
    {
        use Billable;
    }
```

O Cashier assume que seu modelo faturável será a classe `App\Models\User` que vem com o Laravel. Se desejar alterar isso, você pode especificar um modelo diferente por meio do método `useCustomerModel`. Este método normalmente deve ser chamado no método `boot` da sua classe `AppServiceProvider`:

```php
    use App\Models\Cashier\User;
    use Laravel\Cashier\Cashier;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Cashier::useCustomerModel(User::class);
    }
```

::: warning AVISO
Se você estiver usando um modelo diferente do modelo `App\Models\User` fornecido pelo Laravel, você precisará publicar e alterar as [migrações do Cashier](#instalação) fornecidas para corresponder ao nome da tabela do seu modelo alternativo.
:::

### Chaves de API

Em seguida, você deve configurar suas chaves de API do Stripe no arquivo `.env` do seu aplicativo. Você pode recuperar suas chaves de API do Stripe no painel de controle do Stripe:

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

::: warning AVISO
Você deve garantir que a variável de ambiente `STRIPE_WEBHOOK_SECRET` esteja definida no arquivo `.env` do seu aplicativo, pois essa variável é usada para garantir que os webhooks de entrada sejam realmente do Stripe.
:::

### Configuração de moeda

A moeda padrão do Cashier é o dólar americano (USD). Você pode alterar a moeda padrão definindo a variável de ambiente `CASHIER_CURRENCY` no arquivo `.env` do seu aplicativo:

```ini
CASHIER_CURRENCY=eur
```

Além de configurar a moeda do Cashier, você também pode especificar uma localidade a ser usada ao formatar valores monetários para exibição em faturas. Internamente, o Cashier utiliza [a classe `NumberFormatter` do PHP](https://www.php.net/manual/en/class.numberformatter.php) para definir a localidade da moeda:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

::: warning AVISO
Para usar localidades diferentes de `en`, certifique-se de que a extensão PHP `ext-intl` esteja instalada e configurada no seu servidor.
:::

### Configuração de impostos

Graças ao [Stripe Tax](https://stripe.com/tax), é possível calcular impostos automaticamente para todas as faturas geradas pelo Stripe. Você pode habilitar o cálculo automático de impostos invocando o método `calculateTaxes` no método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    use Laravel\Cashier\Cashier;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Cashier::calculateTaxes();
    }
```

Depois que o cálculo de impostos for habilitado, todas as novas assinaturas e quaisquer faturas únicas geradas receberão o cálculo automático de impostos.

Para que esse recurso funcione corretamente, os detalhes de cobrança do seu cliente, como nome, endereço e ID fiscal do cliente, precisam ser sincronizados com o Stripe. Você pode usar os métodos [sincronização de dados do cliente](#syncing-customer-data-with-stripe) e [ID fiscal](#tax-ids) oferecidos pelo Cashier para fazer isso.

::: warning AVISO
Nenhum imposto é calculado para [cobranças únicas](#cobranças-únicas) ou [checkouts de cobrança única](#cobranças-únicas-checkouts).
:::

### Registro

O Cashier permite que você especifique o canal de log a ser usado ao registrar erros fatais do Stripe. Você pode especificar o canal de log definindo a variável de ambiente `CASHIER_LOGGER` dentro do arquivo `.env` do seu aplicativo:

```ini
CASHIER_LOGGER=stack
```

Exceções geradas por chamadas de API para o Stripe serão registradas por meio do canal de log padrão do seu aplicativo.

### Usando modelos personalizados

Você é livre para estender os modelos usados ​​internamente pelo Cashier definindo seu próprio modelo e estendendo o modelo correspondente do Cashier:

```php
    use Laravel\Cashier\Subscription as CashierSubscription;

    class Subscription extends CashierSubscription
    {
        // ...
    }
```

Após definir seu modelo, você pode instruir o Cashier a usar seu modelo personalizado por meio da classe `Laravel\Cashier\Cashier`. Normalmente, você deve informar o Cashier sobre seus modelos personalizados no método `boot` da classe `App\Providers\AppServiceProvider` do seu aplicativo:

```php
    use App\Models\Cashier\Subscription;
    use App\Models\Cashier\SubscriptionItem;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        Cashier::useSubscriptionModel(Subscription::class);
        Cashier::useSubscriptionItemModel(SubscriptionItem::class);
    }
```

## Início rápido

### Venda de produtos

::: info NOTA
Antes de utilizar o Stripe Checkout, você deve definir produtos com preços fixos no seu painel do Stripe. Além disso, você deve [configurar o tratamento de webhook do Cashier](#handling-stripe-webhooks).
:::

Oferecer faturamento de produtos e assinaturas por meio do seu aplicativo pode ser intimidador. No entanto, graças ao Cashier e ao [Stripe Checkout](https://stripe.com/payments/checkout), você pode facilmente criar integrações de pagamento modernas e robustas.

Para cobrar clientes por produtos não recorrentes e de cobrança única, utilizaremos o Cashier para direcionar os clientes ao Stripe Checkout, onde eles fornecerão seus detalhes de pagamento e confirmarão sua compra. Após o pagamento ter sido feito via Checkout, o cliente será redirecionado para uma URL de sucesso de sua escolha dentro do seu aplicativo:

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

Como você pode ver no exemplo acima, utilizaremos o método `checkout` fornecido pelo Cashier para redirecionar o cliente para o Stripe Checkout para um determinado "identificador de preço". Ao usar o Stripe, "preços" referem-se a [preços definidos para produtos específicos](https://stripe.com/docs/products-prices/how-products-and-prices-work).

Se necessário, o método `checkout` criará automaticamente um cliente no Stripe e conectará esse registro de cliente do Stripe ao usuário correspondente no banco de dados do seu aplicativo. Após concluir a sessão de checkout, o cliente será redirecionado para uma página dedicada de sucesso ou cancelamento, onde você pode exibir uma mensagem informativa para o cliente.

#### Fornecendo Metadados para o Stripe Checkout

Ao vender produtos, é comum manter o controle de pedidos concluídos e produtos comprados por meio dos modelos `Carrinho` e `Pedido` definidos pelo seu próprio aplicativo. Ao redirecionar clientes para o Stripe Checkout para concluir uma compra, pode ser necessário fornecer um identificador de pedido existente para que você possa associar a compra concluída ao pedido correspondente quando o cliente for redirecionado de volta para seu aplicativo.

Para fazer isso, você pode fornecer uma matriz de `metadados` para o método `checkout`. Vamos imaginar que um `Pedido` pendente é criado em nosso aplicativo quando um usuário inicia o processo de checkout. Lembre-se, os modelos `Carrinho` e `Pedido` neste exemplo são ilustrativos e não fornecidos pelo Cashier. Você é livre para implementar esses conceitos com base nas necessidades do seu próprio aplicativo:

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

Como você pode ver no exemplo acima, quando um usuário inicia o processo de checkout, forneceremos todos os identificadores de preço Stripe associados ao carrinho/pedido para o método `checkout`. Claro, seu aplicativo é responsável por associar esses itens ao "carrinho de compras" ou pedido conforme um cliente os adiciona. Também fornecemos o ID do pedido para a sessão Stripe Checkout por meio do array `metadata`. Por fim, adicionamos a variável de modelo `CHECKOUT_SESSION_ID` à rota de sucesso do Checkout. Quando o Stripe redireciona os clientes de volta para seu aplicativo, essa variável de modelo será preenchida automaticamente com o ID da sessão Checkout.

Em seguida, vamos criar a rota de sucesso do Checkout. Esta é a rota para a qual os usuários serão redirecionados após a conclusão da compra por meio do Stripe Checkout. Dentro desta rota, podemos recuperar o ID da sessão do Stripe Checkout e a instância associada do Stripe Checkout para acessar nossos metadados fornecidos e atualizar o pedido do nosso cliente adequadamente:

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

Consulte a documentação do Stripe para obter mais informações sobre os [dados contidos pelo objeto da sessão Checkout](https://stripe.com/docs/api/checkout/sessions/object).

### Venda de assinaturas

::: info NOTA
Antes de utilizar o Stripe Checkout, você deve definir produtos com preços fixos no seu painel do Stripe. Além disso, você deve [configurar o tratamento de webhook do Cashier](#handling-stripe-webhooks).
:::

Oferecer faturamento de produtos e assinaturas por meio do seu aplicativo pode ser intimidador. No entanto, graças ao Cashier e ao [Stripe Checkout](https://stripe.com/payments/checkout), você pode facilmente criar integrações de pagamento modernas e robustas.

Para aprender a vender assinaturas usando o Cashier e o Stripe Checkout, vamos considerar o cenário simples de um serviço de assinatura com um plano mensal básico (`price_basic_monthly`) e anual (`price_basic_yearly`). Esses dois preços podem ser agrupados em um produto "Básico" (`pro_basic`) em nosso painel do Stripe. Além disso, nosso serviço de assinatura pode oferecer um plano Expert como `pro_expert`.

Primeiro, vamos descobrir como um cliente pode assinar nossos serviços. Claro, você pode imaginar que o cliente pode clicar em um botão "assinar" para o plano Básico na página de preços do nosso aplicativo. Este botão ou link deve direcionar o usuário para uma rota Laravel que cria a sessão Stripe Checkout para o plano escolhido:

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

Como você pode ver no exemplo acima, redirecionaremos o cliente para uma sessão Stripe Checkout que permitirá que ele assine nosso plano Básico. Após um checkout ou cancelamento bem-sucedido, o cliente será redirecionado de volta para a URL que fornecemos para o método `checkout`. Para saber quando sua assinatura realmente começou (já que alguns métodos de pagamento exigem alguns segundos para serem processados), também precisaremos [configurar o tratamento do webhook do Cashier](#handling-stripe-webhooks).

Agora que os clientes podem iniciar assinaturas, precisamos restringir certas partes do nosso aplicativo para que apenas usuários inscritos possam acessá-las. Claro, sempre podemos determinar o status atual da assinatura de um usuário por meio do método `subscribed` fornecido pelo trait `Billable` do Cashier:

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

#### Construindo um Middleware Assinado

Por conveniência, você pode desejar criar um [middleware](/docs/middleware) que determina se a solicitação de entrada é de um usuário inscrito. Uma vez que este middleware tenha sido definido, você pode facilmente atribuí-lo a uma rota para impedir que usuários que não são inscritos acessem a rota:

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

#### Permitindo que os clientes gerenciem seus planos de cobrança

Claro, os clientes podem querer alterar seus planos de assinatura para outro produto ou "nível". A maneira mais fácil de permitir isso é direcionando os clientes para o [Portal de Faturamento do Cliente](https://stripe.com/docs/no-code/customer-portal) do Stripe, que fornece uma interface de usuário hospedada que permite aos clientes baixar faturas, atualizar seu método de pagamento e alterar planos de assinatura.

Primeiro, defina um link ou botão dentro do seu aplicativo que direcione os usuários para uma rota Laravel que utilizaremos para iniciar uma sessão do Portal de Faturamento:

```blade
<a href="{{ route('billing') }}">
    Billing
</a>
```

Em seguida, vamos definir a rota que inicia uma sessão do Portal de Faturamento do Cliente do Stripe e redireciona o usuário para o Portal. O método `redirectToBillingPortal` aceita a URL para a qual os usuários devem retornar ao sair do Portal:

```php
    use Illuminate\Http\Request;

    Route::get('/billing', function (Request $request) {
        return $request->user()->redirectToBillingPortal(route('dashboard'));
    })->middleware(['auth'])->name('billing');
```

::: info NOTA
Desde que você tenha configurado o tratamento do webhook do Cashier, o Cashier manterá automaticamente as tabelas de banco de dados relacionadas ao Cashier do seu aplicativo em sincronia, inspecionando os webhooks de entrada do Stripe. Então, por exemplo, quando um usuário cancela sua assinatura pelo Portal de Cobrança do Cliente do Stripe, o Cashier receberá o webhook correspondente e marcará a assinatura como "cancelada" no banco de dados do seu aplicativo.
:::

## Clientes

### Recuperando Clientes

Você pode recuperar um cliente pelo ID do Stripe usando o método `Cashier::findBillable`. Este método retornará uma instância do modelo faturável:

```php
    use Laravel\Cashier\Cashier;

    $user = Cashier::findBillable($stripeId);
```

### Criando clientes

Ocasionalmente, você pode desejar criar um cliente Stripe sem iniciar uma assinatura. Você pode fazer isso usando o método `createAsStripeCustomer`:

```php
    $stripeCustomer = $user->createAsStripeCustomer();
```

Depois que o cliente for criado no Stripe, você pode iniciar uma assinatura posteriormente. Você pode fornecer um array opcional `$options` para passar quaisquer [parâmetros de criação de clientes adicionais que são suportados pela API Stripe](https://stripe.com/docs/api/customers/create):

```php
    $stripeCustomer = $user->createAsStripeCustomer($options);
```

Você pode usar o método `asStripeCustomer` se quiser retornar o objeto de cliente Stripe para um modelo faturável:

```php
    $stripeCustomer = $user->asStripeCustomer();
```

O método `createOrGetStripeCustomer` pode ser usado se você quiser recuperar o objeto de cliente Stripe para um determinado modelo faturável, mas não tem certeza se o modelo faturável já é um cliente dentro do Stripe. Este método criará um novo cliente no Stripe se ainda não existir um:

```php
    $stripeCustomer = $user->createOrGetStripeCustomer();
```

### Atualizando clientes

Ocasionalmente, você pode desejar atualizar o cliente Stripe diretamente com informações adicionais. Você pode fazer isso usando o método `updateStripeCustomer`. Este método aceita uma matriz de [opções de atualização do cliente suportadas pela API Stripe](https://stripe.com/docs/api/customers/update):

```php
    $stripeCustomer = $user->updateStripeCustomer($options);
```

### Saldos

O Stripe permite que você credite ou debite o "saldo" de um cliente. Mais tarde, esse saldo será creditado ou debitado em novas faturas. Para verificar o saldo total do cliente, você pode usar o método `balance` que está disponível no seu modelo faturável. O método `balance` retornará uma representação de string formatada do saldo na moeda do cliente:

```php
    $balance = $user->balance();
```

Para creditar o saldo de um cliente, você pode fornecer um valor para o método `creditBalance`. Se desejar, você também pode fornecer uma descrição:

```php
    $user->creditBalance(500, 'Premium customer top-up.');
```

Fornecer um valor para o método `debitBalance` debitará o saldo do cliente:

```php
    $user->debitBalance(300, 'Bad usage penalty.');
```

O método `applyBalance` criará novas transações de saldo do cliente para o cliente. Você pode recuperar esses registros de transação usando o método `balanceTransactions`, que pode ser útil para fornecer um log de créditos e débitos para o cliente revisar:

```php
    // Recuperar todas as transações...
    $transactions = $user->balanceTransactions();

    foreach ($transactions as $transaction) {
        // Valor da transação...
        $amount = $transaction->amount(); // $2.31

        // Recupere a fatura relacionada quando disponível...
        $invoice = $transaction->invoice();
    }
```

### IDs fiscais

O Cashier oferece uma maneira fácil de gerenciar os IDs fiscais de um cliente. Por exemplo, o método `taxIds` pode ser usado para recuperar todos os [IDs de imposto](https://stripe.com/docs/api/customer_tax_ids/object) que são atribuídos a um cliente como uma coleção:

```php
    $taxIds = $user->taxIds();
```

Você também pode recuperar um ID de imposto específico para um cliente por seu identificador:

```php
    $taxId = $user->findTaxId('txi_belgium');
```

Você pode criar um novo ID de imposto fornecendo um [tipo](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type) e valor válidos para o método `createTaxId`:

```php
    $taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

O método `createTaxId` adicionará imediatamente o ID de IVA à conta do cliente. [A verificação de IDs de IVA também é feita pelo Stripe](https://stripe.com/docs/invoicing/customer/tax-ids#validation); no entanto, esse é um processo assíncrono. Você pode ser notificado sobre atualizações de verificação assinando o evento webhook `customer.tax_id.updated` e inspecionando [o parâmetro `verification` de IDs de IVA](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification). Para obter mais informações sobre como lidar com webhooks, consulte a [documentação sobre como definir manipuladores de webhooks](#handling-stripe-webhooks).

Você pode excluir um ID de imposto usando o método `deleteTaxId`:

```php
    $user->deleteTaxId('txi_belgium');
```

### Sincronizando dados do cliente com o Stripe

Normalmente, quando os usuários do seu aplicativo atualizam seus nomes, endereços de e-mail ou outras informações que também são armazenadas pelo Stripe, você deve informar o Stripe sobre as atualizações. Ao fazer isso, a cópia das informações do Stripe estará sincronizada com a do seu aplicativo.

Para automatizar isso, você pode definir um ouvinte de eventos no seu modelo faturável que reaja ao evento `updated` do modelo. Então, dentro do seu ouvinte de eventos, você pode invocar o método `syncStripeCustomerDetails` no modelo:

```php
    use App\Models\User;
    use function Illuminate\Events\queueable;

    /**
     * O método "inicializado" do modelo.
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

Agora, toda vez que seu modelo de cliente for atualizado, suas informações serão sincronizadas com o Stripe. Para sua conveniência, o Cashier sincronizará automaticamente as informações do seu cliente com o Stripe na criação inicial do cliente.

Você pode personalizar as colunas usadas para sincronizar informações do cliente com o Stripe substituindo uma variedade de métodos fornecidos pelo Cashier. Por exemplo, você pode substituir o método `stripeName` para personalizar o atributo que deve ser considerado o "nome" do cliente quando o Cashier sincroniza informações do cliente com o Stripe:

```php
    /**
     * Obtenha o nome do cliente que deve ser sincronizado com o Stripe.
     */
    public function stripeName(): string|null
    {
        return $this->company_name;
    }
```

Da mesma forma, você pode substituir os métodos `stripeEmail`, `stripePhone`, `stripeAddress` e `stripePreferredLocales`. Esses métodos sincronizarão as informações com seus parâmetros de cliente correspondentes ao [atualizar o objeto do cliente Stripe](https://stripe.com/docs/api/customers/update). Se você deseja ter controle total sobre o processo de sincronização de informações do cliente, pode substituir o método `syncStripeCustomerDetails`.

### Portal de cobrança

O Stripe oferece [uma maneira fácil de configurar um portal de cobrança](https://stripe.com/docs/billing/subscriptions/customer-portal) para que seu cliente possa gerenciar sua assinatura, métodos de pagamento e visualizar seu histórico de cobrança. Você pode redirecionar seus usuários para o portal de cobrança invocando o método `redirectToBillingPortal` no modelo faturável de um controlador ou rota:

```php
    use Illuminate\Http\Request;

    Route::get('/billing-portal', function (Request $request) {
        return $request->user()->redirectToBillingPortal();
    });
```

Por padrão, quando o usuário termina de gerenciar sua assinatura, ele poderá retornar à rota `home` do seu aplicativo por meio de um link no portal de cobrança do Stripe. Você pode fornecer uma URL personalizada para a qual o usuário deve retornar passando a URL como um argumento para o método `redirectToBillingPortal`:

```php
    use Illuminate\Http\Request;

    Route::get('/billing-portal', function (Request $request) {
        return $request->user()->redirectToBillingPortal(route('billing'));
    });
```

Se você quiser gerar a URL para o portal de cobrança sem gerar uma resposta de redirecionamento HTTP, você pode invocar o método `billingPortalUrl`:

```php
    $url = $request->user()->billingPortalUrl(route('billing'));
```

## Métodos de pagamento

### Armazenando métodos de pagamento

Para criar assinaturas ou realizar cobranças "únicas" com o Stripe, você precisará armazenar um método de pagamento e recuperar seu identificador do Stripe. A abordagem usada para fazer isso difere com base em se você planeja usar o método de pagamento para assinaturas ou cobranças únicas, então examinaremos ambos abaixo.

#### Métodos de pagamento para assinaturas

Ao armazenar as informações do cartão de crédito de um cliente para uso futuro por uma assinatura, a API "Setup Intents" do Stripe deve ser usada para reunir com segurança os detalhes do método de pagamento do cliente. Um "Setup Intent" indica ao Stripe a intenção de cobrar o método de pagamento de um cliente. O trait `Billable` do Cashier inclui o método `createSetupIntent` para criar facilmente um novo Setup Intent. Você deve invocar este método da rota ou controlador que renderizará o formulário que reúne os detalhes do método de pagamento do seu cliente:

```php
    return view('update-payment-method', [
        'intent' => $user->createSetupIntent()
    ]);
```

Depois de criar o Setup Intent e passá-lo para a visualização, você deve anexar seu segredo ao elemento que reunirá o método de pagamento. Por exemplo, considere este formulário "atualizar método de pagamento":

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button" data-secret="{{ $intent->client_secret }}">
    Update Payment Method
</button>
```

Em seguida, a biblioteca Stripe.js pode ser usada para anexar um [Elemento Stripe](https://stripe.com/docs/stripe-js) ao formulário e coletar com segurança os detalhes de pagamento do cliente:

```html
<script src="https://js.stripe.com/v3/"></script>

<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements();
    const cardElement = elements.create('card');

    cardElement.mount('#card-element');
</script>
```

Em seguida, o cartão pode ser verificado e um "identificador de método de pagamento" seguro pode ser recuperado do Stripe usando o [método `confirmCardSetup` do Stripe](https://stripe.com/docs/js/setup_intents/confirm_card_setup):

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
        // Exibir "error.message" para o usuário...
    } else {
        // O cartão foi verificado com sucesso...
    }
});
```

Após o cartão ter sido verificado pelo Stripe, você pode passar o identificador `setupIntent.payment_method` resultante para seu aplicativo Laravel, onde ele pode ser anexado ao cliente. O método de pagamento pode ser [adicionado como um novo método de pagamento](#adicionando-métodos-de-pagamento) ou [usado para atualizar o método de pagamento padrão](#atualizando-o-método-de-pagamento-padrão). Você também pode usar imediatamente o identificador do método de pagamento para [criar uma nova assinatura](#criando-assinaturas).

::: info NOTA
Se você quiser mais informações sobre Intenções de configuração e coleta de detalhes de pagamento do cliente, [revise esta visão geral fornecida pelo Stripe](https://stripe.com/docs/payments/save-and-reuse#php).
:::

#### Métodos de pagamento para cobranças únicas

É claro que, ao fazer uma cobrança única no método de pagamento de um cliente, precisaremos usar um identificador de método de pagamento apenas uma vez. Devido às limitações do Stripe, você não pode usar o método de pagamento padrão armazenado de um cliente para cobranças únicas. Você deve permitir que o cliente insira os detalhes do método de pagamento usando a biblioteca Stripe.js. Por exemplo, considere o seguinte formulário:

```html
<input id="card-holder-name" type="text">

<!-- Stripe Elements Placeholder -->
<div id="card-element"></div>

<button id="card-button">
    Process Payment
</button>
```

Após definir tal formulário, a biblioteca Stripe.js pode ser usada para anexar um [Elemento Stripe](https://stripe.com/docs/stripe-js) ao formulário e coletar com segurança os detalhes de pagamento do cliente:

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
        // Exibir "error.message" para o usuário...
    } else {
        // O cartão foi verificado com sucesso...
    }
});
```

Se o cartão for verificado com sucesso, você pode passar o `paymentMethod.id` para seu aplicativo Laravel e processar uma [cobrança única](#simple-charge).

### Recuperando métodos de pagamento

O método `paymentMethods` na instância do modelo faturável retorna uma coleção de instâncias `Laravel\Cashier\PaymentMethod`:

```php
    $paymentMethods = $user->paymentMethods();
```

Por padrão, este método retornará métodos de pagamento de todos os tipos. Para recuperar métodos de pagamento de um tipo específico, você pode passar o `type` como um argumento para o método:

```php
    $paymentMethods = $user->paymentMethods('sepa_debit');
```

Para recuperar o método de pagamento padrão do cliente, o método `defaultPaymentMethod` pode ser usado:

```php
    $paymentMethod = $user->defaultPaymentMethod();
```

Você pode recuperar um método de pagamento específico que esteja anexado ao modelo faturável usando o método `findPaymentMethod`:

```php
    $paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

### Presença do método de pagamento

Para determinar se um modelo faturável tem um método de pagamento padrão anexado à sua conta, invoque o método `hasDefaultPaymentMethod`:

```php
    if ($user->hasDefaultPaymentMethod()) {
        // ...
    }
```

Você pode usar o método `hasPaymentMethod` para determinar se um modelo faturável tem pelo menos um método de pagamento anexado à sua conta:

```php
    if ($user->hasPaymentMethod()) {
        // ...
    }
```

Este método determinará se o modelo faturável tem algum método de pagamento. Para determinar se um método de pagamento de um tipo específico existe para o modelo, você pode passar o `type` como um argumento para o método:

```php
    if ($user->hasPaymentMethod('sepa_debit')) {
        // ...
    }
```

### Atualizando o método de pagamento padrão

O método `updateDefaultPaymentMethod` pode ser usado para atualizar as informações do método de pagamento padrão de um cliente. Este método aceita um identificador de método de pagamento Stripe e atribuirá o novo método de pagamento como o método de pagamento de cobrança padrão:

```php
    $user->updateDefaultPaymentMethod($paymentMethod);
```

Para sincronizar suas informações de método de pagamento padrão com as informações de método de pagamento padrão do cliente no Stripe, você pode usar o método `updateDefaultPaymentMethodFromStripe`:

```php
    $user->updateDefaultPaymentMethodFromStripe();
```

::: warning AVISO
O método de pagamento padrão em um cliente só pode ser usado para faturamento e criação de novas assinaturas. Devido às limitações impostas pelo Stripe, ele não pode ser usado para cobranças únicas.
:::

### Adicionando métodos de pagamento

Para adicionar um novo método de pagamento, você pode chamar o método `addPaymentMethod` no modelo faturável, passando o identificador do método de pagamento:

```php
    $user->addPaymentMethod($paymentMethod);
```

::: info NOTA
Para saber como recuperar identificadores de método de pagamento, revise a [documentação de armazenamento de método de pagamento](#storing-payment-methods).
:::

### Excluindo métodos de pagamento

Para excluir um método de pagamento, você pode chamar o método `delete` na instância `Laravel\Cashier\PaymentMethod` que deseja excluir:

```php
    $paymentMethod->delete();
```

O método `deletePaymentMethod` excluirá um método de pagamento específico do modelo faturável:

```php
    $user->deletePaymentMethod('pm_visa');
```

O método `deletePaymentMethods` excluirá todas as informações do método de pagamento para o modelo faturável:

```php
    $user->deletePaymentMethods();
```

Por padrão, este método excluirá métodos de pagamento de todos os tipos. Para excluir métodos de pagamento de um tipo específico, você pode passar o `type` como um argumento para o método:

```php
    $user->deletePaymentMethods('sepa_debit');
```

::: warning AVISO
Se um usuário tiver uma assinatura ativa, seu aplicativo não deve permitir que ele exclua seu método de pagamento padrão.
:::

## Assinaturas

As assinaturas fornecem uma maneira de configurar pagamentos recorrentes para seus clientes. As assinaturas do Stripe gerenciadas pelo Cashier fornecem suporte para vários preços de assinatura, quantidades de assinatura, testes e muito mais.

### Criando assinaturas

Para criar uma assinatura, primeiro recupere uma instância do seu modelo faturável, que normalmente será uma instância de `App\Models\User`. Depois de recuperar a instância do modelo, você pode usar o método `newSubscription` para criar a assinatura do modelo:

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription(
            'default', 'price_monthly'
        )->create($request->paymentMethodId);

        // ...
    });
```

O primeiro argumento passado para o método `newSubscription` deve ser o tipo interno da assinatura. Se seu aplicativo oferece apenas uma única assinatura, você pode chamá-lo de `default` ou `primary`. Este tipo de assinatura é apenas para uso interno do aplicativo e não deve ser mostrado aos usuários. Além disso, ele não deve conter espaços e nunca deve ser alterado após a criação da assinatura. O segundo argumento é o preço específico que o usuário está assinando. Este valor deve corresponder ao identificador do preço no Stripe.

O método `create`, que aceita [um identificador de método de pagamento Stripe](#storing-payment-methods) ou objeto Stripe `PaymentMethod`, iniciará a assinatura e também atualizará seu banco de dados com o ID do cliente Stripe do modelo faturável e outras informações de cobrança relevantes.

::: warning AVISO
Passar um identificador de método de pagamento diretamente para o método de assinatura `create` também o adicionará automaticamente aos métodos de pagamento armazenados do usuário.
:::

#### Coletando pagamentos recorrentes por e-mails de fatura

Em vez de coletar os pagamentos recorrentes de um cliente automaticamente, você pode instruir o Stripe a enviar uma fatura por e-mail ao cliente sempre que seu pagamento recorrente vencer. Então, o cliente pode pagar manualmente a fatura assim que recebê-la. O cliente não precisa fornecer um método de pagamento adiantado ao coletar pagamentos recorrentes por meio de faturas:

```php
    $user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

O período de tempo que um cliente tem para pagar sua fatura antes que sua assinatura seja cancelada é determinado pela opção `days_until_due`. Por padrão, são 30 dias; no entanto, você pode fornecer um valor específico para esta opção, se desejar:

```php
    $user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
        'days_until_due' => 30
    ]);
```

#### Quantidades

Se você quiser definir uma [quantidade](https://stripe.com/docs/billing/subscriptions/quantities) específica para o preço ao criar a assinatura, você deve invocar o método `quantity` no criador de assinaturas antes de criar a assinatura:

```php
    $user->newSubscription('default', 'price_monthly')
         ->quantity(5)
         ->create($paymentMethod);
```

#### Detalhes adicionais

Se você quiser especificar opções adicionais de [customer](https://stripe.com/docs/api/customers/create) ou [subscription](https://stripe.com/docs/api/subscriptions/create) suportadas pelo Stripe, você pode fazer isso passando-as como o segundo e terceiro argumentos para o método `create`:

```php
    $user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
        'email' => $email,
    ], [
        'metadata' => ['note' => 'Some extra information.'],
    ]);
```

#### Cupons

Se você quiser aplicar um cupom ao criar a assinatura, você pode usar o `withCoupon` método:

```php
    $user->newSubscription('default', 'price_monthly')
         ->withCoupon('code')
         ->create($paymentMethod);
```

Ou, se você quiser aplicar um [código promocional Stripe](https://stripe.com/docs/billing/subscriptions/discounts/codes), você pode usar o método `withPromotionCode`:

```php
    $user->newSubscription('default', 'price_monthly')
         ->withPromotionCode('promo_code_id')
         ->create($paymentMethod);
```

O ID do código promocional fornecido deve ser o ID da API Stripe atribuído ao código promocional e não o código promocional voltado para o cliente. Se você precisar encontrar um ID de código promocional com base em um determinado código promocional voltado para o cliente, você pode usar o método `findPromotionCode`:

```php
    // Encontre um ID de código promocional pelo código voltado ao cliente...
    $promotionCode = $user->findPromotionCode('SUMMERSALE');

    // Encontre um ID de código promocional ativo pelo código voltado ao cliente...
    $promotionCode = $user->findActivePromotionCode('SUMMERSALE');
```

No exemplo acima, o objeto `$promotionCode` retornado é uma instância de `Laravel\Cashier\PromotionCode`. Esta classe decora um objeto `Stripe\PromotionCode` subjacente. Você pode recuperar o cupom relacionado ao código promocional invocando o método `coupon`:

```php
    $coupon = $user->findPromotionCode('SUMMERSALE')->coupon();
```

A instância do cupom permite que você determine o valor do desconto e se o cupom representa um desconto fixo ou um desconto baseado em porcentagem:

```php
    if ($coupon->isPercentage()) {
        return $coupon->percentOff().'%'; // 21.5%
    } else {
        return $coupon->amountOff(); // $5.99
    }
```

Você também pode recuperar os descontos que estão atualmente aplicados a um cliente ou assinatura:

```php
    $discount = $billable->discount();

    $discount = $subscription->discount();
```

As instâncias `Laravel\Cashier\Discount` retornadas decoram uma instância do objeto `Stripe\Discount` subjacente. Você pode recuperar o cupom relacionado a este desconto invocando o método `coupon`:

```php
    $coupon = $subscription->discount()->coupon();
```

Se você quiser aplicar um novo cupom ou código promocional a um cliente ou assinatura, você pode fazer isso através dos métodos `applyCoupon` ou `applyPromotionCode`:

```php
    $billable->applyCoupon('coupon_id');
    $billable->applyPromotionCode('promotion_code_id');

    $subscription->applyCoupon('coupon_id');
    $subscription->applyPromotionCode('promotion_code_id');
```

Lembre-se, você deve usar o Stripe API ID atribuído ao código promocional e não o código promocional voltado para o cliente. Apenas um cupom ou código promocional pode ser aplicado a um cliente ou assinatura em um determinado momento.

Para mais informações sobre este assunto, consulte a documentação do Stripe sobre [cupons](https://stripe.com/docs/billing/subscriptions/coupons) e [códigos promocionais](https://stripe.com/docs/billing/subscriptions/coupons/codes).

#### Adicionando assinaturas

Se você quiser adicionar uma assinatura a um cliente que já tem um método de pagamento padrão, você pode invocar o método `add` no criador de assinaturas:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->newSubscription('default', 'price_monthly')->add();
```

#### Criando assinaturas a partir do painel do Stripe

Você também pode criar assinaturas a partir do próprio painel do Stripe. Ao fazer isso, o Cashier sincronizará as assinaturas recém-adicionadas e atribuirá a elas um tipo de `default`. Para personalizar o tipo de assinatura que é atribuído às assinaturas criadas no painel, [defina manipuladores de eventos do webhook](#defining-webhook-event-handlers).

Além disso, você pode criar apenas um tipo de assinatura por meio do painel do Stripe. Se seu aplicativo oferece várias assinaturas que usam tipos diferentes, apenas um tipo de assinatura pode ser adicionado por meio do painel do Stripe.

Finalmente, você deve sempre se certificar de adicionar apenas uma assinatura ativa por tipo de assinatura oferecido pelo seu aplicativo. Se um cliente tiver duas assinaturas `padrão`, somente a assinatura adicionada mais recentemente será usada pelo Cashier, mesmo que ambas sejam sincronizadas com o banco de dados do seu aplicativo.

### Verificando o status da assinatura

Depois que um cliente assina seu aplicativo, você pode verificar facilmente o status da assinatura usando uma variedade de métodos convenientes. Primeiro, o método `subscribed` retorna `true` se o cliente tiver uma assinatura ativa, mesmo que a assinatura esteja atualmente em seu período de teste. O método `subscribed` aceita o tipo da assinatura como seu primeiro argumento:

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
            if ($request->user() && ! $request->user()->subscribed('default')) {
                // Este usuário não é um cliente pagante...
                return redirect('billing');
            }

            return $next($request);
        }
    }
```

Se você quiser determinar se um usuário ainda está em seu período de teste, você pode usar o método `onTrial`. Este método pode ser útil para determinar se você deve exibir um aviso ao usuário de que ele ainda está no período de teste:

```php
    if ($user->subscription('default')->onTrial()) {
        // ...
    }
```

O método `subscribedToProduct` pode ser usado para determinar se o usuário está inscrito em um determinado produto com base no identificador de um determinado produto Stripe. No Stripe, os produtos são coleções de preços. Neste exemplo, determinaremos se a assinatura `default` do usuário está ativamente inscrita no produto "premium" do aplicativo. O identificador de produto Stripe fornecido deve corresponder a um dos identificadores do seu produto no painel do Stripe:

```php
    if ($user->subscribedToProduct('prod_premium', 'default')) {
        // ...
    }
```

Ao passar uma matriz para o método `subscribedToProduct`, você pode determinar se a assinatura `default` do usuário está ativamente inscrita no produto "básico" ou "premium" do aplicativo:

```php
    if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
        // ...
    }
```

O método `subscribedToPrice` pode ser usado para determinar se a assinatura de um cliente corresponde a um determinado ID de preço:

```php
    if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
        // ...
    }
```

O método `recurring` pode ser usado para determinar se o usuário está inscrito no momento e não está mais no período de teste:

```php
    if ($user->subscription('default')->recurring()) {
        // ...
    }
```

::: warning AVISO
Se um usuário tiver duas assinaturas com o mesmo tipo, a assinatura mais recente sempre será retornada pelo método `subscription`. Por exemplo, um usuário pode ter dois registros de assinatura com o tipo `default`; no entanto, uma das assinaturas pode ser uma assinatura antiga e expirada, enquanto a outra é a assinatura atual e ativa. A assinatura mais recente sempre será retornada, enquanto assinaturas mais antigas são mantidas no banco de dados para revisão histórica.
:::

#### Status da assinatura cancelada

Para determinar se o usuário já foi um assinante ativo, mas cancelou sua assinatura, você pode usar o método `canceled`:

```php
    if ($user->subscription('default')->canceled()) {
        // ...
    }
```

Você também pode determinar se um usuário cancelou sua assinatura, mas ainda está em seu "período de carência" até que a assinatura expire totalmente. Por exemplo, se um usuário cancelar uma assinatura em 5 de março que estava originalmente programada para expirar em 10 de março, o usuário estará em seu "período de carência" até 10 de março. Observe que o método `subscribed` ainda retorna `true` durante esse tempo:

```php
    if ($user->subscription('default')->onGracePeriod()) {
        // ...
    }
```

Para determinar se o usuário cancelou sua assinatura e não está mais dentro do "período de carência", você pode usar o método `ended`:

```php
    if ($user->subscription('default')->ended()) {
        // ...
    }
```

#### Status Incompleto e Vencido

Se uma assinatura exigir uma ação de pagamento secundária após a criação, a assinatura será marcada como `incompleta`. Os status da assinatura são armazenados na coluna `stripe_status` da tabela de banco de dados `subscriptions` do Cashier.

Da mesma forma, se uma ação de pagamento secundária for necessária ao trocar preços, a assinatura será marcada como `past_due`. Quando sua assinatura estiver em qualquer um desses estados, ela não estará ativa até que o cliente confirme seu pagamento. Determinar se uma assinatura tem um pagamento incompleto pode ser feito usando o método `hasIncompletePayment` no modelo faturável ou uma instância de assinatura:

```php
    if ($user->hasIncompletePayment('default')) {
        // ...
    }

    if ($user->subscription('default')->hasIncompletePayment()) {
        // ...
    }
```

Quando uma assinatura tem um pagamento incompleto, você deve direcionar o usuário para a página de confirmação de pagamento do Cashier, passando o identificador `latestPayment`. Você pode usar o método `latestPayment` disponível na instância de assinatura para recuperar este identificador:

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    Please confirm your payment.
</a>
```

Se você quiser que a assinatura ainda seja considerada ativa quando estiver em um estado `past_due` ou `incomplete`, você pode usar os métodos `keepPastDueSubscriptionsActive` e `keepIncompleteSubscriptionsActive` fornecidos pelo Cashier. Normalmente, esses métodos devem ser chamados no método `register` do seu `App\Providers\AppServiceProvider`:

```php
    use Laravel\Cashier\Cashier;

    /**
     * Registre quaisquer serviços de aplicação.
     */
    public function register(): void
    {
        Cashier::keepPastDueSubscriptionsActive();
        Cashier::keepIncompleteSubscriptionsActive();
    }
```

::: warning ATENÇÃO
Quando uma assinatura está em um estado `incomplete`, ela não pode ser alterada até que o pagamento seja confirmado. Portanto, os métodos `swap` e `updateQuantity` lançarão uma exceção quando a assinatura estiver em um estado `incomplete`.
:::

#### Escopos de assinatura

A maioria dos estados de assinatura também estão disponíveis como escopos de consulta para que você possa consultar facilmente seu banco de dados para assinaturas que estão em um determinado estado:

```php
    // Obtenha todas as assinaturas ativas...
    $subscriptions = Subscription::query()->active()->get();

    // Obtenha todas as assinaturas canceladas de um usuário...
    $subscriptions = $user->subscriptions()->canceled()->get();
```

Uma lista completa de escopos disponíveis está disponível abaixo:

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

### Alterando preços

Depois que um cliente assina seu aplicativo, ele pode ocasionalmente querer mudar para um novo preço de assinatura. Para trocar um cliente para um novo preço, passe o identificador do preço do Stripe para o método `swap`. Ao trocar preços, presume-se que o usuário gostaria de reativar sua assinatura se ela foi cancelada anteriormente. O identificador de preço fornecido deve corresponder a um identificador de preço do Stripe disponível no painel do Stripe:

```php
    use App\Models\User;

    $user = App\Models\User::find(1);

    $user->subscription('default')->swap('price_yearly');
```

Se o cliente estiver em teste, o período de teste será mantido. Além disso, se houver uma "quantidade" para a assinatura, essa quantidade também será mantida.

Se você quiser trocar preços e cancelar qualquer período de teste em que o cliente esteja, você pode invocar o método `skipTrial`:

```php
    $user->subscription('default')
            ->skipTrial()
            ->swap('price_yearly');
```

Se você quiser trocar preços e faturar o cliente imediatamente em vez de esperar pelo próximo ciclo de cobrança, você pode usar o método `swapAndInvoice`:

```php
    $user = User::find(1);

    $user->subscription('default')->swapAndInvoice('price_yearly');
```

#### Prorrateamentos

Por padrão, o Stripe rateia as cobranças ao trocar entre preços. O método `noProrate` pode ser usado para atualizar o preço da assinatura sem ratear as cobranças:

```php
    $user->subscription('default')->noProrate()->swap('price_yearly');
```

Para mais informações sobre rateio de assinatura, consulte a [documentação do Stripe](https://stripe.com/docs/billing/subscriptions/prorations).

::: warning AVISO
Executar o método `noProrate` antes do método `swapAndInvoice` não terá efeito no rateio. Uma fatura sempre será emitida.
:::

### Quantidade de assinatura

Às vezes, as assinaturas são afetadas pela "quantidade". Por exemplo, um aplicativo de gerenciamento de projetos pode cobrar US$ 10 por mês por projeto. Você pode usar os métodos `incrementQuantity` e `decrementQuantity` para incrementar ou decrementar facilmente a quantidade da sua assinatura:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->subscription('default')->incrementQuantity();

    // Adicione cinco à quantidade atual da assinatura...
    $user->subscription('default')->incrementQuantity(5);

    $user->subscription('default')->decrementQuantity();

    // Subtraia cinco da quantidade atual da assinatura...
    $user->subscription('default')->decrementQuantity(5);
```

Alternativamente, você pode definir uma quantidade específica usando o método `updateQuantity`:

```php
    $user->subscription('default')->updateQuantity(10);
```

O método `noProrate` pode ser usado para atualizar a quantidade da assinatura sem ratear as cobranças:

```php
    $user->subscription('default')->noProrate()->updateQuantity(10);
```

Para obter mais informações sobre quantidades de assinatura, consulte a [documentação do Stripe](https://stripe.com/docs/subscriptions/quantities).

#### Quantidades para assinaturas com vários produtos

Se sua assinatura for uma [assinatura com vários produtos](#subscriptions-with-multiple-products), você deve passar o ID do preço cuja quantidade você deseja aumentar ou diminuir como o segundo argumento para os métodos de incremento/decremento:

```php
    $user->subscription('default')->incrementQuantity(1, 'price_chat');
```

### Assinaturas com vários produtos

[Assinatura com vários produtos](https://stripe.com/docs/billing/subscriptions/multiple-products) permite que você atribua vários produtos de cobrança a uma única assinatura. Por exemplo, imagine que você está criando um aplicativo de "helpdesk" de atendimento ao cliente que tem um preço de assinatura base de US$ 10 por mês, mas oferece um produto complementar de chat ao vivo por US$ 15 adicionais por mês. As informações para assinaturas com vários produtos são armazenadas na tabela de banco de dados `subscription_items` do Cashier.

Você pode especificar vários produtos para uma determinada assinatura passando uma matriz de preços como o segundo argumento para o método `newSubscription`:

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

No exemplo acima, o cliente terá dois preços anexados à sua assinatura `default`. Ambos os preços serão cobrados em seus respectivos intervalos de cobrança. Se necessário, você pode usar o método `quantity` para indicar uma quantidade específica para cada preço:

```php
    $user = User::find(1);

    $user->newSubscription('default', ['price_monthly', 'price_chat'])
        ->quantity(5, 'price_chat')
        ->create($paymentMethod);
```

Se você quiser adicionar outro preço a uma assinatura existente, você pode invocar o método `addPrice` da assinatura:

```php
    $user = User::find(1);

    $user->subscription('default')->addPrice('price_chat');
```

O exemplo acima adicionará o novo preço e o cliente será cobrado por ele em seu próximo ciclo de cobrança. Se você quiser cobrar o cliente imediatamente, você pode usar o método `addPriceAndInvoice`:

```php
    $user->subscription('default')->addPriceAndInvoice('price_chat');
```

Se você quiser adicionar um preço com uma quantidade específica, você pode passar a quantidade como o segundo argumento dos métodos `addPrice` ou `addPriceAndInvoice`:

```php
    $user = User::find(1);

    $user->subscription('default')->addPrice('price_chat', 5);
```

Você pode remover preços de assinaturas usando o método `removePrice`:

```php
    $user->subscription('default')->removePrice('price_chat');
```

::: warning AVISO
Você não pode remover o último preço de uma assinatura. Em vez disso, você deve simplesmente cancelar a assinatura.
:::

#### Trocando Preços

Você também pode alterar os preços vinculados a uma assinatura com vários produtos. Por exemplo, imagine que um cliente tem uma assinatura `price_basic` com um produto complementar `price_chat` e você deseja atualizar o cliente do preço `price_basic` para o preço `price_pro`:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->subscription('default')->swap(['price_pro', 'price_chat']);
```

Ao executar o exemplo acima, o item de assinatura subjacente com o `price_basic` é excluído e aquele com o `price_chat` é preservado. Além disso, um novo item de assinatura para o `price_pro` é criado.

Você também pode especificar opções de itens de assinatura passando uma matriz de pares de chave/valor para o método `swap`. Por exemplo, você pode precisar especificar as quantidades de preço da assinatura:

```php
    $user = User::find(1);

    $user->subscription('default')->swap([
        'price_pro' => ['quantity' => 5],
        'price_chat'
    ]);
```

Se você deseja trocar um único preço em uma assinatura, pode fazer isso usando o método `swap` no próprio item de assinatura. Essa abordagem é particularmente útil se você quiser preservar todos os metadados existentes nos outros preços da assinatura:

```php
    $user = User::find(1);

    $user->subscription('default')
            ->findItemOrFail('price_basic')
            ->swap('price_pro');
```

#### Prorrateamento

Por padrão, o Stripe rateará as cobranças ao adicionar ou remover preços de uma assinatura com vários produtos. Se você quiser fazer um ajuste de preço sem rateio, você deve encadear o método `noProrate` em sua operação de preço:

```php
    $user->subscription('default')->noProrate()->removePrice('price_chat');
```

#### Quantidades

Se você quiser atualizar quantidades em preços de assinatura individuais, você pode fazer isso usando os [métodos de quantidade existentes](#subscription-quantity) passando o ID do preço como um argumento adicional para o método:

```php
    $user = User::find(1);

    $user->subscription('default')->incrementQuantity(5, 'price_chat');

    $user->subscription('default')->decrementQuantity(3, 'price_chat');

    $user->subscription('default')->updateQuantity(10, 'price_chat');
```

::: warning AVISO
Quando uma assinatura tem vários preços, os atributos `stripe_price` e `quantity` no modelo `Subscription` serão `null`. Para acessar os atributos de preço individuais, você deve usar o relacionamento `items` disponível no modelo `Subscription`.
:::

#### Itens de assinatura

Quando uma assinatura tem vários preços, ela terá vários "itens" de assinatura armazenados na tabela `subscription_items` do seu banco de dados. Você pode acessá-los por meio do relacionamento `items` na assinatura:

```php
    use App\Models\User;

    $user = User::find(1);

    $subscriptionItem = $user->subscription('default')->items->first();

    // Recupere o preço e a quantidade do Stripe para um item específico...
    $stripePrice = $subscriptionItem->stripe_price;
    $quantity = $subscriptionItem->quantity;
```

Você também pode recuperar um preço específico usando o método `findItemOrFail`:

```php
    $user = User::find(1);

    $subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

### Várias assinaturas

O Stripe permite que seus clientes tenham várias assinaturas simultaneamente. Por exemplo, você pode administrar uma academia que oferece uma assinatura de natação e uma assinatura de levantamento de peso, e cada assinatura pode ter preços diferentes. Claro, os clientes devem poder assinar um ou ambos os planos.

Quando seu aplicativo cria assinaturas, você pode fornecer o tipo da assinatura para o método `newSubscription`. O tipo pode ser qualquer sequência que represente o tipo de assinatura que o usuário está iniciando:

```php
    use Illuminate\Http\Request;

    Route::post('/swimming/subscribe', function (Request $request) {
        $request->user()->newSubscription('swimming')
            ->price('price_swimming_monthly')
            ->create($request->paymentMethodId);

        // ...
    });
```

Neste exemplo, iniciamos uma assinatura mensal de natação para o cliente. No entanto, eles podem querer trocar para uma assinatura anual mais tarde. Ao ajustar a assinatura do cliente, podemos simplesmente trocar o preço da assinatura de `natação`:

```php
    $user->subscription('swimming')->swap('price_swimming_yearly');
```

Claro, você também pode cancelar a assinatura completamente:

```php
    $user->subscription('swimming')->cancel();
```

### Faturamento medido

[Faturamento medido](https://stripe.com/docs/billing/subscriptions/metered-billing) permite que você cobre os clientes com base no uso do produto durante um ciclo de faturamento. Por exemplo, você pode cobrar os clientes com base no número de mensagens de texto ou e-mails que eles enviam por mês.

Para começar a usar o faturamento medido, primeiro você precisa criar um novo produto no seu painel do Stripe com um preço medido. Em seguida, use `meteredPrice` para adicionar o ID do preço medido a uma assinatura do cliente:

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription('default')
            ->meteredPrice('price_metered')
            ->create($request->paymentMethodId);

        // ...
    });
```

Você também pode iniciar uma assinatura medida via [Stripe Checkout](#checkout):

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

Conforme seu cliente usa seu aplicativo, você relatará o uso dele ao Stripe para que ele possa ser cobrado com precisão. Para incrementar o uso de uma assinatura medida, você pode usar o método `reportUsage`:

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsage();
```

Por padrão, uma "quantidade de uso" de 1 é adicionada ao período de faturamento. Como alternativa, você pode passar uma quantidade específica de "uso" para adicionar ao uso do cliente para o período de cobrança:

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsage(15);
```

Se seu aplicativo oferece vários preços em uma única assinatura, você precisará usar o método `reportUsageFor` para especificar o preço medido para o qual deseja relatar o uso:

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsageFor('price_metered', 15);
```

Às vezes, pode ser necessário atualizar o uso que você relatou anteriormente. Para fazer isso, você pode passar um timestamp ou uma instância `DateTimeInterface` como o segundo parâmetro para `reportUsage`. Ao fazer isso, o Stripe atualizará o uso que foi relatado naquele momento. Você pode continuar a atualizar os registros de uso anteriores, pois a data e a hora fornecidas ainda estão dentro do período de cobrança atual:

```php
    $user = User::find(1);

    $user->subscription('default')->reportUsage(5, $timestamp);
```

#### Recuperando Registros de Uso

Para recuperar o uso anterior de um cliente, você pode usar o método `usageRecords` de uma instância de assinatura:

```php
    $user = User::find(1);

    $usageRecords = $user->subscription('default')->usageRecords();
```

Se seu aplicativo oferece vários preços em uma única assinatura, você pode usar o método `usageRecordsFor` para especificar o preço medido para o qual deseja recuperar registros de uso:

```php
    $user = User::find(1);

    $usageRecords = $user->subscription('default')->usageRecordsFor('price_metered');
```

Os métodos `usageRecords` e `usageRecordsFor` retornam uma instância Collection contendo uma matriz associativa de registros de uso. Você pode iterar sobre esta matriz para exibir o uso total de um cliente:

```php
    @foreach ($usageRecords as $usageRecord)
        - Period Starting: {{ $usageRecord['period']['start'] }}
        - Period Ending: {{ $usageRecord['period']['end'] }}
        - Total Usage: {{ $usageRecord['total_usage'] }}
    @endforeach
```

Para uma referência completa de todos os dados de uso retornados e como usar a paginação baseada em cursor do Stripe, consulte [a documentação oficial da Stripe API](https://stripe.com/docs/api/usage_records/subscription_item_summary_list).

### Impostos de assinatura

::: warning AVISO
Em vez de calcular as taxas de imposto manualmente, você pode [calcular automaticamente os impostos usando o imposto do Stripe](#tax-configuration)
:::

Para especificar as taxas de imposto que um usuário paga em uma assinatura, você deve implementar o método `taxRates` em seu modelo faturável e retornar uma matriz contendo os IDs de taxa de imposto do Stripe. Você pode definir essas taxas de imposto no [seu painel do Stripe](https://dashboard.stripe.com/test/tax-rates):

```php
    /**
     * As taxas de impostos que devem ser aplicadas às assinaturas do cliente.
     *
     * @return array<int, string>
     */
    public function taxRates(): array
    {
        return ['txr_id'];
    }
```

O método `taxRates` permite que você aplique uma taxa de imposto em uma base de cliente por cliente, o que pode ser útil para uma base de usuários que abrange vários países e taxas de imposto.

Se você estiver oferecendo assinaturas com vários produtos, poderá definir taxas de imposto diferentes para cada preço implementando um método `priceTaxRates` em seu modelo faturável:

```php
    /**
     * As taxas de impostos que devem ser aplicadas às assinaturas do cliente.
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

::: warning AVISO
O método `taxRates` se aplica apenas a cobranças de assinatura. Se você usar o Cashier para fazer cobranças "únicas", precisará especificar manualmente a taxa de imposto naquele momento.
:::

#### Sincronizando taxas de imposto

Ao alterar os IDs de taxa de imposto codificados retornados pelo método `taxRates`, as configurações de imposto em quaisquer assinaturas existentes para o usuário permanecerão as mesmas. Se desejar atualizar o valor do imposto para assinaturas existentes com os novos valores `taxRates`, você deve chamar o método `syncTaxRates` na instância de assinatura do usuário:

```php
    $user->subscription('default')->syncTaxRates();
```

Isso também sincronizará quaisquer taxas de imposto de item para uma assinatura com vários produtos. Se seu aplicativo estiver oferecendo assinaturas com vários produtos, você deve garantir que seu modelo faturável implemente o método `priceTaxRates` [discutido acima](#subscription-taxes).

#### Isenção de imposto

O Cashier também oferece os métodos `isNotTaxExempt`, `isTaxExempt` e `reverseChargeApplies` para determinar se o cliente é isento de imposto. Esses métodos chamarão a Stripe API para determinar o status de isenção de impostos de um cliente:

```php
    use App\Models\User;

    $user = User::find(1);

    $user->isTaxExempt();
    $user->isNotTaxExempt();
    $user->reverseChargeApplies();
```

::: warning AVISO
Esses métodos também estão disponíveis em qualquer objeto `Laravel\Cashier\Invoice`. No entanto, quando invocados em um objeto `Invoice`, os métodos determinarão o status de isenção no momento em que a fatura foi criada.
:::

### Data da âncora da assinatura

Por padrão, a âncora do ciclo de cobrança é a data em que a assinatura foi criada ou, se um período de teste for usado, a data em que o teste termina. Se você quiser modificar a data de ancoragem de cobrança, pode usar o método `anchorBillingCycleOn`:

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

Para obter mais informações sobre como gerenciar ciclos de cobrança de assinatura, consulte a [documentação do ciclo de cobrança do Stripe](https://stripe.com/docs/billing/subscriptions/billing-cycle)

### Cancelando assinaturas

Para cancelar uma assinatura, chame o método `cancel` na assinatura do usuário:

```php
    $user->subscription('default')->cancel();
```

Quando uma assinatura é cancelada, o Cashier definirá automaticamente a coluna `ends_at` na sua tabela de banco de dados `subscriptions`. Esta coluna é usada para saber quando o método `subscribed` deve começar a retornar `false`.

Por exemplo, se um cliente cancelar uma assinatura em 1º de março, mas a assinatura não estava programada para terminar até 5 de março, o método `subscribed` continuará retornando `true` até 5 de março. Isso é feito porque um usuário normalmente tem permissão para continuar usando um aplicativo até o fim do seu ciclo de cobrança.

Você pode determinar se um usuário cancelou sua assinatura, mas ainda está em seu "período de carência" usando o método `onGracePeriod`:

```php
    if ($user->subscription('default')->onGracePeriod()) {
        // ...
    }
```

Se você deseja cancelar uma assinatura imediatamente, chame o método `cancelNow` na assinatura do usuário:

```php
    $user->subscription('default')->cancelNow();
```

Se você deseja cancelar uma assinatura imediatamente e faturar qualquer uso medido não faturado restante ou itens de fatura de rateio novos/pendentes, chame o método `cancelNowAndInvoice` na assinatura do usuário:

```php
    $user->subscription('default')->cancelNowAndInvoice();
```

Você também pode escolher cancelar a assinatura em um momento específico:

```php
    $user->subscription('default')->cancelAt(
        now()->addDays(10)
    );
```

Finalmente, você deve sempre cancelar as assinaturas do usuário antes de excluir o modelo de usuário associado:

```php
    $user->subscription('default')->cancelNow();

    $user->delete();
```

### Retomando Assinaturas

Se um cliente cancelou sua assinatura e você deseja retomá-la, você pode invocar o método `resume` na assinatura. O cliente ainda deve estar dentro do seu "período de carência" para retomar uma assinatura:

```php
    $user->subscription('default')->resume();
```

Se o cliente cancelar uma assinatura e então retomá-la antes que a assinatura tenha expirado completamente, o cliente não será cobrado imediatamente. Em vez disso, sua assinatura será reativada e ele será cobrado no ciclo de cobrança original.

## Testes de Assinatura

### Com Método de Pagamento Antecipado

Se você gostaria de oferecer períodos de teste para seus clientes enquanto ainda coleta informações do método de pagamento antecipadamente, você deve usar o método `trialDays` ao criar suas assinaturas:

```php
    use Illuminate\Http\Request;

    Route::post('/user/subscribe', function (Request $request) {
        $request->user()->newSubscription('default', 'price_monthly')
                    ->trialDays(10)
                    ->create($request->paymentMethodId);

        // ...
    });
```

Este método definirá a data de término do período de teste no registro de assinatura dentro do banco de dados e instruirá o Stripe a não começar a cobrar o cliente até depois dessa data. Ao usar o método `trialDays`, o Cashier substituirá qualquer período de teste padrão configurado para o preço no Stripe.

::: warning AVISO
Se a assinatura do cliente não for cancelada antes da data de término do teste, ele será cobrado assim que o teste expirar, então você deve ter certeza de notificar seus usuários sobre a data de término do teste.
:::

O método `trialUntil` permite que você forneça uma instância `DateTime` que especifica quando o período de teste deve terminar:

```php
    use Carbon\Carbon;

    $user->newSubscription('default', 'price_monthly')
                ->trialUntil(Carbon::now()->addDays(10))
                ->create($paymentMethod);
```

Você pode determinar se um usuário está dentro do período de teste usando o método `onTrial` da instância do usuário ou o método `onTrial` da instância da assinatura. Os dois exemplos abaixo são equivalentes:

```php
    if ($user->onTrial('default')) {
        // ...
    }

    if ($user->subscription('default')->onTrial()) {
        // ...
    }
```

Você pode usar o método `endTrial` para encerrar imediatamente um teste de assinatura:

```php
    $user->subscription('default')->endTrial();
```

Para determinar se um teste existente expirou, você pode usar os métodos `hasExpiredTrial`:

```php
    if ($user->hasExpiredTrial('default')) {
        // ...
    }

    if ($user->subscription('default')->hasExpiredTrial()) {
        // ...
    }
```

#### Definindo dias de teste no Stripe / Cashier

Você pode escolher definir quantos dias de teste seus preços recebem no painel do Stripe ou sempre passá-los explicitamente usando o Cashier. Se você escolher definir os dias de teste do seu preço no Stripe, deve estar ciente de que novas assinaturas, incluindo novas assinaturas para um cliente que teve uma assinatura no passado, sempre receberão um período de teste, a menos que você chame explicitamente o método `skipTrial()`.

### Sem método de pagamento adiantado

Se você quiser oferecer períodos de teste sem coletar as informações do método de pagamento do usuário adiantado, você pode definir a coluna `trial_ends_at` no registro do usuário para a data de término do teste desejada. Isso normalmente é feito durante o registro do usuário:

```php
    use App\Models\User;

    $user = User::create([
        // ...
        'trial_ends_at' => now()->addDays(10),
    ]);
```

::: warning AVISO
Certifique-se de adicionar uma [cast de data](/docs/eloquent-mutators#date-casting) para o atributo `trial_ends_at` dentro da definição de classe do seu modelo faturável.
:::

O Cashier se refere a esse tipo de teste como um "teste genérico", já que ele não está vinculado a nenhuma assinatura existente. O método `onTrial` na instância do modelo faturável retornará `true` se a data atual não for posterior ao valor de `trial_ends_at`:

```php
    if ($user->onTrial()) {
        // O usuário está dentro do período de teste...
    }
```

Quando estiver pronto para criar uma assinatura real para o usuário, você pode usar o método `newSubscription` como de costume:

```php
    $user = User::find(1);

    $user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

Para recuperar a data de término do teste do usuário, você pode usar o método `trialEndsAt`. Este método retornará uma instância de data Carbon se um usuário estiver em um teste ou `null` se não estiver. Você também pode passar um parâmetro de tipo de assinatura opcional se quiser obter a data de término do teste para uma assinatura específica diferente da padrão:

```php
    if ($user->onTrial()) {
        $trialEndsAt = $user->trialEndsAt('main');
    }
```

Você também pode usar o método `onGenericTrial` se quiser saber especificamente que o usuário está dentro do período de teste "genérico" e ainda não criou uma assinatura real:

```php
    if ($user->onGenericTrial()) {
        // O usuário está dentro do período de teste "genérico"...
    }
```

### Estendendo testes

O método `extendTrial` permite que você estenda o período de teste de uma assinatura após a assinatura ter sido criada. Se o teste já tiver expirado e o cliente já estiver sendo cobrado pela assinatura, você ainda pode oferecer a ele um teste estendido. O tempo gasto dentro do período de teste será deduzido da próxima fatura do cliente:

```php
    use App\Models\User;

    $subscription = User::find(1)->subscription('default');

    // Encerre o teste daqui a 7 dias...
    $subscription->extendTrial(
        now()->addDays(7)
    );

    // Adicione mais 5 dias ao teste...
    $subscription->extendTrial(
        $subscription->trial_ends_at->addDays(5)
    );
```

## Lidando com webhooks do Stripe

::: info NOTA
Você pode usar [o Stripe CLI](https://stripe.com/docs/stripe-cli) para ajudar a testar webhooks durante o desenvolvimento local.
:::

O Stripe pode notificar seu aplicativo sobre uma variedade de eventos por meio de webhooks. Por padrão, uma rota que aponta para o controlador de webhook do Cashier é registrada automaticamente pelo provedor de serviços do Cashier. Este controlador lidará com todas as solicitações de webhook recebidas.

Por padrão, o controlador de webhook do Cashier manipulará automaticamente o cancelamento de assinaturas que tenham muitas cobranças com falha (conforme definido pelas suas configurações do Stripe), atualizações de clientes, exclusões de clientes, atualizações de assinaturas e alterações de métodos de pagamento; no entanto, como descobriremos em breve, você pode estender esse controlador para manipular qualquer evento de webhook do Stripe que desejar.

Para garantir que seu aplicativo possa manipular webhooks do Stripe, certifique-se de configurar a URL do webhook no painel de controle do Stripe. Por padrão, o controlador de webhook do Cashier responde ao caminho da URL `/stripe/webhook`. A lista completa de todos os webhooks que você deve habilitar no painel de controle do Stripe são:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `payment_method.automatically_updated`
- `invoice.payment_action_required`
- `invoice.payment_succeeded`

Para sua conveniência, o Cashier inclui um comando Artisan `cashier:webhook`. Este comando criará um webhook no Stripe que escuta todos os eventos exigidos pelo Cashier:

```shell
php artisan cashier:webhook
```

Por padrão, o webhook criado apontará para a URL definida pela variável de ambiente `APP_URL` e a rota `cashier.webhook` que está incluída no Cashier. Você pode fornecer a opção `--url` ao invocar o comando se quiser usar uma URL diferente:

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

O webhook criado usará a versão da Stripe API com a qual sua versão do Cashier é compatível. Se quiser usar uma versão diferente do Stripe, você pode fornecer a opção `--api-version`:

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

Após a criação, o webhook será imediatamente ativo. Se desejar criar o webhook, mas desativá-lo até que esteja pronto, você pode fornecer a opção `--disabled` ao invocar o comando:

```shell
php artisan cashier:webhook --disabled
```

::: warning AVISO
Certifique-se de proteger as solicitações de webhook do Stripe recebidas com o middleware [verificação de assinatura do webhook](#verifying-webhook-signatures) incluído do Cashier.
:::

#### Webhooks e proteção CSRF

Como os webhooks do Stripe precisam ignorar a [proteção CSRF](/docs/csrf) do Laravel, você deve garantir que o Laravel não tente validar o token CSRF para webhooks do Stripe recebidos. Para fazer isso, você deve excluir `stripe/*` da proteção CSRF no arquivo `bootstrap/app.php` do seu aplicativo:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'stripe/*',
        ]);
    })
```

### Definindo manipuladores de eventos do Webhook

O Casher manipula automaticamente cancelamentos de assinaturas para cobranças com falha e outros eventos comuns do webhook do Stripe. No entanto, se você tiver eventos de webhook adicionais que gostaria de manipular, você pode fazer isso ouvindo os seguintes eventos que são despachados pelo Cashier:

- `Laravel\Cashier\Events\WebhookReceived`
- `Laravel\Cashier\Events\WebhookHandled`

Ambos os eventos contêm a carga útil completa do webhook do Stripe. Por exemplo, se você deseja manipular o webhook `invoice.payment_succeeded`, você pode registrar um [listener](/docs/events#defining-listeners) que manipulará o evento:

```php
    <?php

    namespace App\Listeners;

    use Laravel\Cashier\Events\WebhookReceived;

    class StripeEventListener
    {
        /**
         * Lidar com webhooks Stripe recebidos.
         */
        public function handle(WebhookReceived $event): void
        {
            if ($event->payload['type'] === 'invoice.payment_succeeded') {
                // Lidar com o evento de entrada...
            }
        }
    }
```

### Verificando assinaturas de webhook

Para proteger seus webhooks, você pode usar [assinaturas de webhook do Stripe](https://stripe.com/docs/webhooks/signatures). Para sua conveniência, o Cashier inclui automaticamente um middleware que valida se a solicitação de webhook do Stripe recebida é válida.

Para habilitar a verificação de webhook, certifique-se de que a variável de ambiente `STRIPE_WEBHOOK_SECRET` esteja definida no arquivo `.env` do seu aplicativo. O `secret` do webhook pode ser recuperado do painel da sua conta do Stripe.

## Cobranças únicas

### Cobrança simples

Se você quiser fazer uma cobrança única contra um cliente, pode usar o método `charge` em uma instância de modelo faturável. Você precisará [fornecer um identificador de método de pagamento](#payment-methods-for-single-charges) como o segundo argumento para o método `charge`:

```php
    use Illuminate\Http\Request;

    Route::post('/purchase', function (Request $request) {
        $stripeCharge = $request->user()->charge(
            100, $request->paymentMethodId
        );

        // ...
    });
```

O método `charge` aceita uma matriz como seu terceiro argumento, permitindo que você passe quaisquer opções que desejar para a criação de cobrança subjacente do Stripe. Mais informações sobre as opções disponíveis para você ao criar cobranças podem ser encontradas na [documentação do Stripe](https://stripe.com/docs/api/charges/create):

```php
    $user->charge(100, $paymentMethod, [
        'custom_option' => $value,
    ]);
```

Você também pode usar o método `charge` sem um cliente ou usuário subjacente. Para fazer isso, invoque o método `charge` em uma nova instância do modelo faturável do seu aplicativo:

```php
    use App\Models\User;

    $stripeCharge = (new User)->charge(100, $paymentMethod);
```

O método `charge` lançará uma exceção se a cobrança falhar. Se a cobrança for bem-sucedida, uma instância de `Laravel\Cashier\Payment` será retornada do método:

```php
    try {
        $payment = $user->charge(100, $paymentMethod);
    } catch (Exception $e) {
        // ...
    }
```

::: warning AVISO
O método `charge` aceita o valor do pagamento no menor denominador da moeda usada pelo seu aplicativo. Por exemplo, se os clientes estiverem pagando em dólares americanos, os valores devem ser especificados em centavos.
:::

### Cobrar com fatura

Às vezes, você pode precisar fazer uma cobrança única e oferecer uma fatura em PDF ao seu cliente. O método `invoicePrice` permite que você faça exatamente isso. Por exemplo, vamos faturar um cliente por cinco camisas novas:

```php
    $user->invoicePrice('price_tshirt', 5);
```

A fatura será cobrada imediatamente no método de pagamento padrão do usuário. O método `invoicePrice` também aceita uma matriz como seu terceiro argumento. Esta matriz contém as opções de cobrança para o item da fatura. O quarto argumento aceito pelo método também é um array que deve conter as opções de cobrança para a fatura em si:

```php
    $user->invoicePrice('price_tshirt', 5, [
        'discounts' => [
            ['coupon' => 'SUMMER21SALE']
        ],
    ], [
        'default_tax_rates' => ['txr_id'],
    ]);
```

De forma semelhante a `invoicePrice`, você pode usar o método `tabPrice` para criar uma cobrança única para vários itens (até 250 itens por fatura) adicionando-os à "aba" do cliente e então faturando o cliente. Por exemplo, podemos faturar um cliente por cinco camisas e duas canecas:

```php
    $user->tabPrice('price_tshirt', 5);
    $user->tabPrice('price_mug', 2);
    $user->invoice();
```

Alternativamente, você pode usar o método `invoiceFor` para fazer uma cobrança "única" contra o método de pagamento padrão do cliente:

```php
    $user->invoiceFor('One Time Fee', 500);
```

Embora o método `invoiceFor` esteja disponível para você usar, é recomendado que você use os métodos `invoicePrice` e `tabPrice` com preços predefinidos. Ao fazer isso, você terá acesso a melhores análises e dados no seu painel do Stripe sobre suas vendas por produto.

::: warning AVISO
Os métodos `invoice`, `invoicePrice` e `invoiceFor` criarão uma fatura do Stripe que tentará novamente as tentativas de cobrança com falha. Se você não quiser que as faturas tentem novamente as cobranças com falha, será necessário fechá-las usando a API do Stripe após a primeira cobrança com falha.
:::

### Criando intenções de pagamento

Você pode criar uma nova intenção de pagamento do Stripe invocando o método `pay` em uma instância de modelo faturável. Chamar esse método criará uma intenção de pagamento que é encapsulada em uma instância `Laravel\Cashier\Payment`:

```php
    use Illuminate\Http\Request;

    Route::post('/pay', function (Request $request) {
        $payment = $request->user()->pay(
            $request->get('amount')
        );

        return $payment->client_secret;
    });
```

Após criar a intenção de pagamento, você pode retornar o segredo do cliente para o frontend do seu aplicativo para que o usuário possa concluir o pagamento em seu navegador. Para ler mais sobre como criar fluxos de pagamento inteiros usando intenções de pagamento do Stripe, consulte a [documentação do Stripe](https://stripe.com/docs/payments/accept-a-payment?platform=web).

Ao usar o método `pay`, os métodos de pagamento padrão habilitados no seu painel do Stripe estarão disponíveis para o cliente. Como alternativa, se você quiser permitir que apenas alguns métodos de pagamento específicos sejam usados, você pode usar o método `payWith`:

```php
    use Illuminate\Http\Request;

    Route::post('/pay', function (Request $request) {
        $payment = $request->user()->payWith(
            $request->get('amount'), ['card', 'bancontact']
        );

        return $payment->client_secret;
    });
```

::: warning AVISO
Os métodos `pay` e `payWith` aceitam o valor do pagamento no menor denominador da moeda usada pelo seu aplicativo. Por exemplo, se os clientes estiverem pagando em dólares americanos, os valores devem ser especificados em centavos.
:::

### Reembolso de cobranças

Se você precisar reembolsar uma cobrança do Stripe, você pode usar o método `refund`. Este método aceita o Stripe [ID de intenção de pagamento](#payment-methods-for-single-charges) como seu primeiro argumento:

```php
    $payment = $user->charge(100, $paymentMethodId);

    $user->refund($payment->id);
```

## Faturas

### Recuperando Faturas

Você pode recuperar facilmente uma matriz de faturas de um modelo faturável usando o método `invoices`. O método `invoices` retorna uma coleção de instâncias `Laravel\Cashier\Invoice`:

```php
    $invoices = $user->invoices();
```

Se você quiser incluir faturas pendentes nos resultados, você pode usar o método `invoicesIncludingPending`:

```php
    $invoices = $user->invoicesIncludingPending();
```

Você pode usar o método `findInvoice` para recuperar uma fatura específica por seu ID:

```php
    $invoice = $user->findInvoice($invoiceId);
```

#### Exibindo Informações da Fatura

Ao listar as faturas para o cliente, você pode usar os métodos da fatura para exibir as informações relevantes da fatura. Por exemplo, você pode desejar listar todas as faturas em uma tabela, permitindo que o usuário baixe facilmente qualquer uma delas:

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

Para recuperar a fatura futura de um cliente, você pode usar o método `upcomingInvoice`:

```php
    $invoice = $user->upcomingInvoice();
```

Da mesma forma, se o cliente tiver várias assinaturas, você também pode recuperar a fatura futura de uma assinatura específica:

```php
    $invoice = $user->subscription('default')->upcomingInvoice();
```

### Visualizando faturas de assinatura

Usando o método `previewInvoice`, você pode visualizar uma fatura antes de fazer alterações de preço. Isso permitirá que você determine como será a fatura do seu cliente quando uma determinada alteração de preço for feita:

```php
    $invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

Você pode passar uma matriz de preços para o método `previewInvoice` para visualizar faturas com vários preços novos:

```php
    $invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

### Gerando PDFs de fatura

Antes de gerar PDFs de fatura, você deve usar o Composer para instalar a biblioteca Dompdf, que é o renderizador de fatura padrão para o Cashier:

```shell
composer require dompdf/dompdf
```

De dentro de uma rota ou controlador, você pode usar o método `downloadInvoice` para gerar um download em PDF de uma determinada fatura. Este método gerará automaticamente a resposta HTTP adequada necessária para baixar a fatura:

```php
    use Illuminate\Http\Request;

    Route::get('/user/invoice/{invoice}', function (Request $request, string $invoiceId) {
        return $request->user()->downloadInvoice($invoiceId);
    });
```

Por padrão, todos os dados na fatura são derivados dos dados do cliente e da fatura armazenados no Stripe. O nome do arquivo é baseado no seu valor de configuração `app.name`. No entanto, você pode personalizar alguns desses dados fornecendo uma matriz como o segundo argumento para o método `downloadInvoice`. Esta matriz permite que você personalize informações como sua empresa e detalhes do produto:

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

O método `downloadInvoice` também permite um nome de arquivo personalizado por meio de seu terceiro argumento. Este nome de arquivo será automaticamente sufixado com `.pdf`:

```php
    return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

#### Renderizador de fatura personalizado

O Cashier também possibilita o uso de um renderizador de fatura personalizado. Por padrão, o Cashier usa a implementação `DompdfInvoiceRenderer`, que utiliza a biblioteca PHP [dompdf](https://github.com/dompdf/dompdf) para gerar as faturas do Cashier. No entanto, você pode usar qualquer renderizador que desejar implementando a interface `Laravel\Cashier\Contracts\InvoiceRenderer`. Por exemplo, você pode desejar renderizar um PDF de fatura usando uma chamada de API para um serviço de renderização de PDF de terceiros:

```php
    use Illuminate\Support\Facades\Http;
    use Laravel\Cashier\Contracts\InvoiceRenderer;
    use Laravel\Cashier\Invoice;

    class ApiInvoiceRenderer implements InvoiceRenderer
    {
        /**
         * Renderize a fatura fornecida e retorne os bytes brutos do PDF.
         */
        public function render(Invoice $invoice, array $data = [], array $options = []): string
        {
            $html = $invoice->view($data)->render();

            return Http::get('https://example.com/html-to-pdf', ['html' => $html])->get()->body();
        }
    }
```

Depois de implementar o contrato do renderizador de fatura, você deve atualizar o valor de configuração `cashier.invoices.renderer` no arquivo de configuração `config/cashier.php` do seu aplicativo. Este valor de configuração deve ser definido como o nome da classe da sua implementação de renderizador personalizado.

## Checkout

O Stripe do Cashier também fornece suporte para [Stripe Checkout](https://stripe.com/payments/checkout). O Stripe Checkout elimina a dor de implementar páginas personalizadas para aceitar pagamentos, fornecendo uma página de pagamento pré-criada e hospedada.

A documentação a seguir contém informações sobre como começar a usar o Stripe Checkout com o Cashier. Para saber mais sobre o Stripe Checkout, você também deve considerar a revisão da [própria documentação do Stripe sobre o Checkout](https://stripe.com/docs/payments/checkout).

### Checkouts de produtos

Você pode realizar um checkout para um produto existente que foi criado no seu painel do Stripe usando o método `checkout` em um modelo faturável. O método `checkout` iniciará uma nova sessão do Stripe Checkout. Por padrão, você precisa passar um Stripe Price ID:

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout('price_tshirt');
    });
```

Se necessário, você também pode especificar uma quantidade de produto:

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout(['price_tshirt' => 15]);
    });
```

Quando um cliente visita esta rota, ele será redirecionado para a página de Checkout do Stripe. Por padrão, quando um usuário conclui ou cancela uma compra com sucesso, ele será redirecionado para o local da sua rota `home`, mas você pode especificar URLs de retorno de chamada personalizadas usando as opções `success_url` e `cancel_url`:

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()->checkout(['price_tshirt' => 1], [
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
    });
```

Ao definir sua opção de checkout `success_url`, você pode instruir o Stripe a adicionar o ID da sessão de checkout como um parâmetro de string de consulta ao invocar sua URL. Para fazer isso, adicione a string literal `{CHECKOUT_SESSION_ID}` à sua string de consulta `success_url`. O Stripe substituirá este espaço reservado pelo ID da sessão de checkout real:

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

Por padrão, o Stripe Checkout não permite [códigos promocionais resgatáveis ​​pelo usuário](https://stripe.com/docs/billing/subscriptions/discounts/codes). Felizmente, há uma maneira fácil de habilitá-los para sua página de checkout. Para fazer isso, você pode invocar o método `allowPromotionCodes`:

```php
    use Illuminate\Http\Request;

    Route::get('/product-checkout', function (Request $request) {
        return $request->user()
            ->allowPromotionCodes()
            ->checkout('price_tshirt');
    });
```

### Checkouts de cobrança única

Você também pode executar uma cobrança simples para um produto ad-hoc que não foi criado no seu painel do Stripe. Para fazer isso, você pode usar o método `checkoutCharge` em um modelo faturável e passar a ele um valor cobrável, um nome de produto e uma quantidade opcional. Quando um cliente visita esta rota, ele será redirecionado para a página de Checkout do Stripe:

```php
    use Illuminate\Http\Request;

    Route::get('/charge-checkout', function (Request $request) {
        return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
    });
```

::: warning AVISO
Ao usar o método `checkoutCharge`, o Stripe sempre criará um novo produto e preço no seu painel do Stripe. Portanto, recomendamos que você crie os produtos antecipadamente no seu painel do Stripe e use o método `checkout` em vez disso.
:::

### Checkouts de assinatura

::: warning AVISO
Usar o Stripe Checkout para assinaturas requer que você habilite o webhook `customer.subscription.created` no seu painel do Stripe. Este webhook criará o registro de assinatura no seu banco de dados e armazenará todos os itens de assinatura relevantes.
:::

Você também pode usar o Stripe Checkout para iniciar assinaturas. Depois de definir sua assinatura com os métodos do construtor de assinaturas do Cashier, você pode chamar o método `checkout `. Quando um cliente visita esta rota, ele será redirecionado para a página de checkout do Stripe:

```php
    use Illuminate\Http\Request;

    Route::get('/subscription-checkout', function (Request $request) {
        return $request->user()
            ->newSubscription('default', 'price_monthly')
            ->checkout();
    });
```

Assim como com os checkouts de produtos, você pode personalizar as URLs de sucesso e cancelamento:

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

Claro, você também pode habilitar códigos promocionais para checkouts de assinatura:

```php
    use Illuminate\Http\Request;

    Route::get('/subscription-checkout', function (Request $request) {
        return $request->user()
            ->newSubscription('default', 'price_monthly')
            ->allowPromotionCodes()
            ->checkout();
    });
```

::: warning AVISO
Infelizmente, o Stripe Checkout não oferece suporte a todas as opções de cobrança de assinatura ao iniciar assinaturas. Usar o método `anchorBillingCycleOn` no criador de assinaturas, definir o comportamento de rateio ou definir o comportamento de pagamento não terá nenhum efeito durante as sessões do Stripe Checkout. Consulte [a documentação da Stripe Checkout Session API](https://stripe.com/docs/api/checkout/sessions/create) para revisar quais parâmetros estão disponíveis.
:::

#### Stripe Checkout e Períodos de Teste

Claro, você pode definir um período de teste ao criar uma assinatura que será concluída usando o Stripe Checkout:

```php
    $checkout = Auth::user()->newSubscription('default', 'price_monthly')
        ->trialDays(3)
        ->checkout();
```

No entanto, o período de teste deve ser de pelo menos 48 horas, que é o tempo mínimo de teste suportado pelo Stripe Checkout.

#### Assinaturas e Webhooks

Lembre-se, o Stripe e o Cashier atualizam os status da assinatura por meio de webhooks, então há uma possibilidade de uma assinatura ainda não estar ativa quando o cliente retornar ao aplicativo após inserir suas informações de pagamento. Para lidar com esse cenário, você pode desejar exibir uma mensagem informando ao usuário que seu pagamento ou assinatura está pendente.

### Coletando IDs fiscais

O Checkout também suporta a coleta do ID fiscal de um cliente. Para habilitar isso em uma sessão de checkout, invoque o método `collectTaxIds` ao criar a sessão:

```php
    $checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

Quando esse método é invocado, uma nova caixa de seleção estará disponível para o cliente que permite que ele indique se está comprando como uma empresa. Se sim, ele terá a oportunidade de fornecer seu número de identificação fiscal.

::: warning AVISO
Se você já configurou [cobrança automática de impostos](#tax-configuration) no provedor de serviços do seu aplicativo, esse recurso será habilitado automaticamente e não há necessidade de invocar o método `collectTaxIds`.
:::

### Checkouts de convidados

Usando o método `Checkout::guest`, você pode iniciar sessões de checkout para convidados do seu aplicativo que não têm uma "conta":

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

Da mesma forma que ao criar sessões de checkout para usuários existentes, você pode utilizar métodos adicionais disponíveis na instância `Laravel\Cashier\CheckoutBuilder` para personalizar a sessão de checkout de convidado:

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

Após a conclusão de um checkout de convidado, o Stripe pode despachar um evento de webhook `checkout.session.completed`, portanto, certifique-se de [configurar seu webhook do Stripe](https://dashboard.stripe.com/webhooks) para realmente enviar esse evento para seu aplicativo. Depois que o webhook for habilitado no painel do Stripe, você poderá [manipular o webhook com o Cashier](#handling-stripe-webhooks). O objeto contido na carga útil do webhook será um [objeto `checkout`](https://stripe.com/docs/api/checkout/sessions/object) que você pode inspecionar para atender ao pedido do seu cliente.

## Lidando com pagamentos com falha

Às vezes, os pagamentos de assinaturas ou cobranças únicas podem falhar. Quando isso acontece, o Cashier lançará uma exceção `Laravel\Cashier\Exceptions\IncompletePayment` que informa que isso aconteceu. Depois de capturar essa exceção, você tem duas opções sobre como prosseguir.

Primeiro, você pode redirecionar seu cliente para a página dedicada de confirmação de pagamento que está incluída no Cashier. Esta página já tem uma rota nomeada associada que é registrada por meio do provedor de serviços do Cashier. Então, você pode capturar a exceção `IncompletePayment` e redirecionar o usuário para a página de confirmação de pagamento:

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

Na página de confirmação de pagamento, o cliente será solicitado a inserir suas informações de cartão de crédito novamente e executar quaisquer ações adicionais exigidas pelo Stripe, como confirmação "3D Secure". Após confirmar seu pagamento, o usuário será redirecionado para a URL fornecida pelo parâmetro `redirect` especificado acima. Após o redirecionamento, as variáveis ​​de string de consulta `message` (string) e `success` (inteiro) serão adicionadas à URL. A página de pagamento atualmente suporta os seguintes tipos de método de pagamento:

- Credit Cards
- Alipay
- Bancontact
- BECS Direct Debit
- EPS
- Giropay
- iDEAL
- SEPA Direct Debit

Como alternativa, você pode permitir que o Stripe cuide da confirmação de pagamento para você. Nesse caso, em vez de redirecionar para a página de confirmação de pagamento, você pode [configurar os e-mails de cobrança automática do Stripe](https://dashboard.stripe.com/account/billing/automatic) no seu painel do Stripe. No entanto, se uma exceção `IncompletePayment` for detectada, você ainda deve informar ao usuário que ele receberá um e-mail com mais instruções de confirmação de pagamento.

Exceções de pagamento podem ser lançadas para os seguintes métodos: `charge`, `invoiceFor` e `invoice` em modelos que usam o trait `Billable`. Ao interagir com assinaturas, o método `create` no `SubscriptionBuilder` e os métodos `incrementAndInvoice` e `swapAndInvoice` nos modelos `Subscription` e `SubscriptionItem` podem lançar exceções de pagamento incompletas.

Determinar se uma assinatura existente tem um pagamento incompleto pode ser feito usando o método `hasIncompletePayment` no modelo faturável ou uma instância de assinatura:

```php
    if ($user->hasIncompletePayment('default')) {
        // ...
    }

    if ($user->subscription('default')->hasIncompletePayment()) {
        // ...
    }
```

Você pode derivar o status específico de um pagamento incompleto inspecionando a propriedade `payment` na instância de exceção:

```php
    use Laravel\Cashier\Exceptions\IncompletePayment;

    try {
        $user->charge(1000, 'pm_card_threeDSecure2Required');
    } catch (IncompletePayment $exception) {
        // Obtenha o status da intenção de pagamento...
        $exception->payment->status;

        // Verifique as condições específicas...
        if ($exception->payment->requiresPaymentMethod()) {
            // ...
        } elseif ($exception->payment->requiresConfirmation()) {
            // ...
        }
    }
```

### Confirmando pagamentos

Alguns métodos de pagamento exigem dados adicionais para confirmar os pagamentos. Por exemplo, os métodos de pagamento SEPA exigem dados adicionais de "mandato" durante o processo de pagamento. Você pode fornecer esses dados ao Cashier usando o método `withPaymentConfirmationOptions`:

```php
    $subscription->withPaymentConfirmationOptions([
        'mandate_data' => '...',
    ])->swap('price_xxx');
```

Você pode consultar a [documentação da API do Stripe](https://stripe.com/docs/api/payment_intents/confirm) para revisar todas as opções aceitas ao confirmar pagamentos.

## Autenticação Forte do Cliente

Se sua empresa ou um de seus clientes estiver na Europa, você precisará obedecer aos regulamentos de Autenticação Forte do Cliente (SCA) da UE. Esses regulamentos foram impostos em setembro de 2019 pela União Europeia para evitar fraudes de pagamento. Felizmente, Stripe e Cashier estão preparados para criar aplicativos compatíveis com SCA.

::: warning AVISO
Antes de começar, revise [o guia do Stripe sobre PSD2 e SCA](https://stripe.com/guides/strong-customer-authentication), bem como sua [documentação sobre as novas APIs SCA](https://stripe.com/docs/strong-customer-authentication).
:::

### Pagamentos que exigem confirmação adicional

Os regulamentos SCA geralmente exigem verificação extra para confirmar e processar um pagamento. Quando isso acontece, o Cashier lançará uma exceção `Laravel\Cashier\Exceptions\IncompletePayment` que informa que uma verificação extra é necessária. Mais informações sobre como lidar com essas exceções podem ser encontradas na documentação sobre [manipulação de pagamentos com falha](#handling-failed-payments).

As telas de confirmação de pagamento apresentadas pelo Stripe ou Cashier podem ser adaptadas ao fluxo de pagamento de um banco ou emissor de cartão específico e podem incluir confirmação adicional do cartão, uma pequena cobrança temporária, autenticação de dispositivo separada ou outras formas de verificação.

#### Estado Incompleto e Vencido

Quando um pagamento precisa de confirmação adicional, a assinatura permanecerá em um estado `incomplete` ou `past_due` conforme indicado pela coluna de banco de dados `stripe_status`. O Cashier ativará automaticamente a assinatura do cliente assim que a confirmação do pagamento for concluída e seu aplicativo for notificado pelo Stripe via webhook de sua conclusão.

Para obter mais informações sobre os estados `incomplete` e `past_due`, consulte [nossa documentação adicional sobre esses estados](#incomplete-and-past-due-status).

### Notificações de pagamento fora da sessão

Como os regulamentos do SCA exigem que os clientes verifiquem ocasionalmente seus detalhes de pagamento, mesmo enquanto sua assinatura estiver ativa, o Cashier pode enviar uma notificação ao cliente quando a confirmação de pagamento fora da sessão for necessária. Por exemplo, isso pode ocorrer quando uma assinatura está sendo renovada. A notificação de pagamento do Cashier pode ser habilitada definindo a variável de ambiente `CASHIER_PAYMENT_NOTIFICATION` para uma classe de notificação. Por padrão, essa notificação é desabilitada. Claro, o Cashier inclui uma classe de notificação que você pode usar para essa finalidade, mas você é livre para fornecer sua própria classe de notificação, se desejar:

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

Para garantir que as notificações de confirmação de pagamento fora da sessão sejam entregues, verifique se [os webhooks do Stripe estão configurados](#handling-stripe-webhooks) para seu aplicativo e se o webhook `invoice.payment_action_required` está habilitado em seu painel do Stripe. Além disso, seu modelo `Billable` também deve usar o trait `Illuminate\Notifications\Notifiable` do Laravel.

::: warning AVISO
As notificações serão enviadas mesmo quando os clientes estiverem fazendo manualmente um pagamento que exija confirmação adicional. Infelizmente, não há como o Stripe saber que o pagamento foi feito manualmente ou "fora da sessão". Mas, um cliente verá simplesmente uma mensagem "Pagamento bem-sucedido" se visitar a página de pagamento depois de já ter confirmado seu pagamento. O cliente não poderá confirmar acidentalmente o mesmo pagamento duas vezes e incorrer em uma segunda cobrança acidental.
:::

## Stripe SDK

Muitos dos objetos do Cashier são wrappers em torno dos objetos do Stripe SDK. Se você quiser interagir com os objetos Stripe diretamente, você pode recuperá-los convenientemente usando o método `asStripe`:

```php
    $stripeSubscription = $subscription->asStripeSubscription();

    $stripeSubscription->application_fee_percent = 5;

    $stripeSubscription->save();
```

Você também pode usar o método `updateStripeSubscription` para atualizar uma assinatura Stripe diretamente:

```php
    $subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

Você pode invocar o método `stripe` na classe `Cashier` se quiser usar o cliente `Stripe\StripeClient` diretamente. Por exemplo, você pode usar este método para acessar a instância `StripeClient` e recuperar uma lista de preços da sua conta Stripe:

```php
    use Laravel\Cashier\Cashier;

    $prices = Cashier::stripe()->prices->all();
```

## Testes

Ao testar um aplicativo que usa Cashier, você pode simular as solicitações HTTP reais para a API Stripe; no entanto, isso requer que você reimplemente parcialmente o próprio comportamento do Cashier. Portanto, recomendamos permitir que seus testes atinjam a API Stripe real. Embora isso seja mais lento, ele fornece mais confiança de que seu aplicativo está funcionando conforme o esperado e quaisquer testes lentos podem ser colocados em seu próprio grupo de testes Pest/PHPUnit.

Ao testar, lembre-se de que o próprio Cashier já tem um ótimo conjunto de testes, então você deve se concentrar apenas em testar o fluxo de assinatura e pagamento do seu próprio aplicativo e não em todo comportamento subjacente do Cashier.

Para começar, adicione a versão **testing** do seu segredo do Stripe ao seu arquivo `phpunit.xml`:

```
    <env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

Agora, sempre que você interagir com o Cashier durante o teste, ele enviará solicitações de API reais para seu ambiente de teste do Stripe. Para sua conveniência, você deve preencher previamente sua conta de teste do Stripe com assinaturas/preços que você pode usar durante o teste.

::: info NOTA
Para testar uma variedade de cenários de cobrança, como recusas e falhas de cartão de crédito, você pode usar a vasta gama de [números de cartão de teste e tokens](https://stripe.com/docs/testing) fornecidos pelo Stripe.
:::
