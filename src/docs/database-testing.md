# Teste de banco de dados

<a name="introduction"></a>
## Introdução

O Laravel fornece uma variedade de ferramentas e asserções úteis para facilitar o teste de seus aplicativos baseados em banco de dados. Além disso, as fábricas de modelos e seeders do Laravel facilitam a criação de registros de banco de dados de teste usando os modelos e relacionamentos Eloquent do seu aplicativo. Discutiremos todos esses recursos poderosos na documentação a seguir.

<a name="resetting-the-database-after-each-test"></a>
### Redefinindo o banco de dados após cada teste

Antes de prosseguir muito mais, vamos discutir como redefinir seu banco de dados após cada um dos seus testes para que os dados de um teste anterior não interfiram nos testes subsequentes. O trait `Illuminate\Foundation\Testing\RefreshDatabase` incluído no Laravel cuidará disso para você. Basta usar o traço na sua classe de teste:

::: code-group
```php [Pest]
<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('basic example', function () {
    $response = $this->get('/');

    // ...
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Um exemplo básico de teste funcional.
     */
    public function test_basic_example(): void
    {
        $response = $this->get('/');

        // ...
    }
}
```
:::

O traço `Illuminate\Foundation\Testing\RefreshDatabase` não migra seu banco de dados se seu esquema estiver atualizado. Em vez disso, ele executará o teste somente dentro de uma transação de banco de dados. Portanto, quaisquer registros adicionados ao banco de dados por casos de teste que não usam esse traço ainda podem existir no banco de dados.

Se você quiser redefinir totalmente o banco de dados, você pode usar os traços `Illuminate\Foundation\Testing\DatabaseMigrations` ou `Illuminate\Foundation\Testing\DatabaseTruncation`. No entanto, ambas as opções são significativamente mais lentas do que o traço `RefreshDatabase`.

<a name="model-factories"></a>
## Fábricas de Modelos

Ao testar, você pode precisar inserir alguns registros em seu banco de dados antes de executar seu teste. Em vez de especificar manualmente o valor de cada coluna ao criar esses dados de teste, o Laravel permite que você defina um conjunto de atributos padrão para cada um dos seus [modelos Eloquent](/docs/eloquent) usando [model factories](/docs/eloquent-factories).

Para saber mais sobre como criar e utilizar model factories para criar modelos, consulte a [documentação completa do model factory](/docs/eloquent-factories). Depois de definir um model factory, você pode utilizar o factory dentro do seu teste para criar modelos:

::: code-group
```php [Pest]
use App\Models\User;

test('models can be instantiated', function () {
    $user = User::factory()->create();

    // ...
});
```

```php [PHPUnit]
use App\Models\User;

public function test_models_can_be_instantiated(): void
{
    $user = User::factory()->create();

    // ...
}
```
:::

<a name="running-seeders"></a>
## Executando Seeders

Se você quiser usar [database seeders](/docs/seeding) para preencher seu banco de dados durante um teste de recurso, você pode invocar o método `seed`. Por padrão, o método `seed` executará o `DatabaseSeeder`, que deve executar todos os seus outros seeders. Como alternativa, você passa um nome de classe de seeder específico para o método `seed`:

::: code-group
```php [Pest]
<?php

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('orders can be created', function () {
    // Execute o DatabaseSeeder...
    $this->seed();

    // Execute um semeador específico...
    $this->seed(OrderStatusSeeder::class);

    // ...

    // Execute uma série de seeders específicos...
    $this->seed([
        OrderStatusSeeder::class,
        TransactionStatusSeeder::class,
        // ...
    ]);
});
```

```php [PHPUnit]
<?php

namespace Tests\Feature;

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Teste a criação de um novo pedido.
     */
    public function test_orders_can_be_created(): void
    {
        // Execute o DatabaseSeeder...
        $this->seed();

        // Execute um semeador específico...
        $this->seed(OrderStatusSeeder::class);

        // ...

        // Execute uma série de seeders específicos...
        $this->seed([
            OrderStatusSeeder::class,
            TransactionStatusSeeder::class,
            // ...
        ]);
    }
}
```
:::

Como alternativa, você pode instruir o Laravel a semear automaticamente o banco de dados antes de cada teste que usa o trait `RefreshDatabase`. Você pode fazer isso definindo uma propriedade `$seed` na sua classe de teste base:

```php
    <?php

    namespace Tests;

    use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

    abstract class TestCase extends BaseTestCase
    {
        /**
         * Indica se o semeador padrão deve ser executado antes de cada teste.
         *
         * @var bool
         */
        protected $seed = true;
    }
```

Quando a propriedade `$seed` for `true`, o teste executará a classe `Database\Seeders\DatabaseSeeder` antes de cada teste que usa o trait `RefreshDatabase`. No entanto, você pode especificar um seeder específico que deve ser executado definindo uma propriedade `$seeder` na sua classe de teste:

```php
    use Database\Seeders\OrderStatusSeeder;

    /**
     * Execute um semeador específico antes de cada teste.
     *
     * @var string
     */
    protected $seeder = OrderStatusSeeder::class;
```

<a name="available-assertions"></a>
## Asserções disponíveis

O Laravel fornece várias asserções de banco de dados para seus testes de recursos [Pest](https://pestphp.com) ou [PHPUnit](https://phpunit.de). Discutiremos cada uma dessas asserções abaixo.

<a name="assert-database-count"></a>
#### assertDatabaseCount

Afirma que uma tabela no banco de dados contém o número fornecido de registros:

```php
    $this->assertDatabaseCount('users', 5);
```

<a name="assert-database-has"></a>
#### assertDatabaseHas

Afirma que uma tabela no banco de dados contém registros que correspondem às restrições de consulta de chave/valor fornecidas:

```php
    $this->assertDatabaseHas('users', [
        'email' => 'sally@example.com',
    ]);
```

<a name="assert-database-missing"></a>
#### assertDatabaseMissing

Afirma que uma tabela no banco de dados não contém registros que correspondem às restrições de consulta de chave/valor fornecidas:

```php
    $this->assertDatabaseMissing('users', [
        'email' => 'sally@example.com',
    ]);
```

<a name="assert-deleted"></a>
#### assertSoftDeleted

O método `assertSoftDeleted` pode ser usado para afirmar uma determinada O modelo Eloquent foi "removido":

```php
    $this->assertSoftDeleted($user);
```

<a name="assert-not-deleted"></a>
#### assertNotSoftDeleted

O método `assertNotSoftDeleted` pode ser usado para afirmar que um determinado modelo Eloquent não foi "removido":

```php
    $this->assertNotSoftDeleted($user);
```

<a name="assert-model-exists"></a>
#### assertModelExists

Afirme que um determinado modelo existe no banco de dados:

```php
    use App\Models\User;

    $user = User::factory()->create();

    $this->assertModelExists($user);
```

<a name="assert-model-missing"></a>
#### assertModelMissing

Afirme que um determinado modelo não existe no banco de dados:

```php
    use App\Models\User;

    $user = User::factory()->create();

    $user->delete();

    $this->assertModelMissing($user);
```

<a name="expects-database-query-count"></a>
#### expectsDatabaseQueryCount

O método `expectsDatabaseQueryCount` pode ser invocado no início do seu teste para especificar o número total de consultas de banco de dados que você espera que sejam executadas durante o teste. Se o número real de consultas executadas não corresponder exatamente a essa expectativa, o teste falhará:

```php
    $this->expectsDatabaseQueryCount(5);

    // Teste...
```
