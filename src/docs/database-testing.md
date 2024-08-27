# Teste de Banco de Dados

<a name="introduction"></a>
## Introdução

O framework Laravel oferece uma variedade de ferramentas e afirmações para facilitar a teste dos aplicativos guiados por banco de dados. Além disso, os modelos e "seeders" do Laravel model factories facilitam muito criar registros de testes usando seus Eloquent models e relacionamentos em sua aplicação. Discutiremos todas essas funcionalidades poderosas na documentação seguinte.

<a name="resetting-the-database-after-each-test"></a>
### Reiniciando o Banco de Dados Após Cada Teste

Antes de prosseguir, vamos discutir como redefinir seu banco de dados após cada um dos seus testes para que os dados de um teste anterior não interfiram nos testes subsequentes. O Laravel's included `Illuminate\Foundation\Testing\RefreshDatabase` trait cuidará disso para você. Basta usar o trait na sua classe de teste:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('basic example', function () {
    $response = $this->get('/');

    // ...
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic functional test example.
     */
    public function test_basic_example(): void
    {
        $response = $this->get('/');

        // ...
    }
}
```

A trait 'Illuminate\Foundation\Testing\RefreshDatabase' não migra seu banco de dados se o esquema estiver atualizado. Em vez disso, ele executará apenas a consulta dentro de uma transação de banco de dados. Portanto, qualquer registro adicionado ao banco de dados por testes que não utilizam esta trait pode ainda existir no banco de dados.

Se você quiser redefinir o banco de dados totalmente, você pode usar os traços `Illuminate\Foundation\Testing\DatabaseMigrations` ou `Illuminate\Foundation\Testing\DatabaseTruncation`, mas ambas as opções são significativamente mais lentas do que o traço `RefreshDatabase`.

<a name="model-factories"></a>
## Fábricas de Modelo

Ao testar, você pode precisar inserir alguns registros no seu banco de dados antes de executar sua prova. Em vez de especificar manualmente o valor de cada coluna ao criar esses dados de prova, Laravel permite que você defina um conjunto de atributos padrão para cada um dos seus [modelos Eloquent](/docs/{{version}}/eloquent) usando [fábricas de modelos](/docs/{{version}}/eloquent-factories).

Para aprender mais sobre o modelo de fábricas e modelos para criar modelos, consulte [documentação completa da fábrica do modelo](/docs/ {{versão}} /eloquent -fábricas) . Depois que você definiu um modelo de fábrica, você pode usar a fábrica dentro seu teste para criar modelos:

```php tab=Pest
use App\Models\User;

test('models can be instantiated', function () {
    $user = User::factory()->create();

    // ...
});
```

```php tab=PHPUnit
use App\Models\User;

public function test_models_can_be_instantiated(): void
{
    $user = User::factory()->create();

    // ...
}
```

<a name="running-seeders"></a>
## Seeding

Se você gostaria de usar o [semeadores de banco de dados](/docs/{{version}}/seeding) para povoar seu banco de dados durante um teste de recurso, você pode invocar o método "seed". Por padrão, o método "seed" irá executar o "DatabaseSeeder", que deve executar todos os seus outros semeadores. Em alternativa, passe um nome de classe específico do semeador ao método "seed":

```php tab=Pest
<?php

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('orders can be created', function () {
    // Run the DatabaseSeeder...
    $this->seed();

    // Run a specific seeder...
    $this->seed(OrderStatusSeeder::class);

    // ...

    // Run an array of specific seeders...
    $this->seed([
        OrderStatusSeeder::class,
        TransactionStatusSeeder::class,
        // ...
    ]);
});
```

```php tab=PHPUnit
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
     * Test creating a new order.
     */
    public function test_orders_can_be_created(): void
    {
        // Run the DatabaseSeeder...
        $this->seed();

        // Run a specific seeder...
        $this->seed(OrderStatusSeeder::class);

        // ...

        // Run an array of specific seeders...
        $this->seed([
            OrderStatusSeeder::class,
            TransactionStatusSeeder::class,
            // ...
        ]);
    }
}
```

Alternativamente, você pode instruir o Laravel para semeia de banco de dados automaticamente antes cada teste que usa a característica 'RefreshDatabase'. Você pode fazer isso definindo uma propriedade '$seed' sua classe de teste base.

```php
    <?php

    namespace Tests;

    use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

    abstract class TestCase extends BaseTestCase
    {
        /**
         * Indicates whether the default seeder should run before each test.
         *
         * @var bool
         */
        protected $seed = true;
    }
```

Quando o `seed` é definido como 'verdadeiro', o teste irá executar a classe `Database\Seeders\DatabaseSeeder` antes de cada teste que utiliza o trait `RefreshDatabase`. No entanto, você pode especificar um seeder específico para ser executado definindo uma propriedade `$seeder` na sua classe de teste:

```php
    use Database\Seeders\OrderStatusSeeder;

    /**
     * Run a specific seeder before each test.
     *
     * @var string
     */
    protected $seeder = OrderStatusSeeder::class;
```

<a name="available-assertions"></a>
## Averões disponíveis

Laravel fornece diversas afirmações de banco para seus testes de recursos [Pest](https://pestphp.com) ou [PHPUnit](https://phpunit.de). Discutiremos cada um dessas afirmações abaixo.

<a name="assert-database-count"></a>
#### assertDatabaseCount

Afirmar que uma tabela no banco de dados contém o número dado de registros:

```php
    $this->assertDatabaseCount('users', 5);
```

<a name="assert-database-has"></a>
#### assertDatabaseHas

Afirme que uma tabela no banco de dados contém registros correspondentes às restrições da consulta de chave / valor fornecida:

```php
    $this->assertDatabaseHas('users', [
        'email' => 'sally@example.com',
    ]);
```

<a name="assert-database-missing"></a>
#### assertDatabaseMissing

Afirmar que uma tabela no banco de dados não contém registros correspondentes às restrições de consulta do par chave/valor especificado:

```php
    $this->assertDatabaseMissing('users', [
        'email' => 'sally@example.com',
    ]);
```

<a name="assert-deleted"></a>
#### assertSoftDeleted

O método assertSoftDeleted pode ser usado para afirmar que um modelo Eloquent foi "deletado suavemente":

```php
    $this->assertSoftDeleted($user);
```

<a name="assert-not-deleted"></a>
#### assertNotSoftDeleted

O método `assertNotSoftDeleted` pode ser usado para afirmar que um modelo Eloquent específico não tem sido "soft deleted":

```php
    $this->assertNotSoftDeleted($user);
```

<a name="assert-model-exists"></a>
#### assertModeloExiste

Afirme que um modelo dado existe no banco de dados:

```php
    use App\Models\User;

    $user = User::factory()->create();

    $this->assertModelExists($user);
```

<a name="assert-model-missing"></a>
#### assertModelMissing

Afirmar que um determinado modelo não existe no banco de dados:

```php
    use App\Models\User;

    $user = User::factory()->create();

    $user->delete();

    $this->assertModelMissing($user);
```

<a name="expects-database-query-count"></a>
#### espera-se DatabaseQueryCount

O método "expectsDatabaseQueryCount" pode ser invocado no início do seu teste para especificar o número total de consultas ao banco de dados que você espera serem executadas durante o teste. Se a quantidade real de consultas executadas não corresponder exatamente esta expectativa, o teste falhará:

```php
    $this->expectsDatabaseQueryCount(5);

    // Test...
```
