# Teste de banco de dados

<a name="introduction"></a>
## Introdução

 O Laravel fornece várias ferramentas e declarações úteis que facilitam o processo de teste do seu aplicativo. Além disso, os modelos fabricação e as sementes do Laravel tornam a criação de registros no banco de dados durante os testes com os seus modelos Eloquent da aplicação, simples e sem esforço. Todas estas funcionalidades poderosas serão analisadas na documentação seguinte.

<a name="resetting-the-database-after-each-test"></a>
### Reiniciar a base de dados após cada teste

 Antes de seguir em frente, vamos discutir como redefinir seu banco de dados após cada um dos seus testes para que os dados de um teste anterior não interfiram nos próximos testes. O traço `Illuminate\Foundation\Testing\RefreshDatabase` incluído do Laravel cuidará disso por você. Basta utilizar o traço em sua classe de teste:

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

 A característica `Illuminate\Foundation\Testing\RefreshDatabase` não migra o seu banco de dados se o esquema estiver atualizado. Em vez disso, ela somente executará o teste dentro de uma transação de banco de dados. Portanto, quaisquer registros adicionados ao banco de dados por casos de testes que não usem essa característica podem ainda existir no banco de dados.

 Se desejar reiniciar totalmente o banco de dados, use os traços `Illuminate\Foundation\Testing\DatabaseMigrations` ou `Illuminate\Foundation\Testing\DatabaseTruncation`. No entanto, essas opções são significativamente mais lentas do que a característica `RefreshDatabase`.

<a name="model-factories"></a>
## Fábricas de modelo

 Durante os testes, você poderá precisar inserir alguns registros em sua base de dados antes do início dos testes. Em vez de especificar manualmente o valor de cada coluna ao criar esses dados de teste, o Laravel permite que você defina um conjunto de atributos por padrão para cada um dos seus [modelos Eloquent](https://laravel.com/docs/{{version}}/eloquent). Isso é feito usando os [fabricantes de modelos](https://laravel.com/docs/{{version}}/eloquent-factories).

 Para saber mais sobre como criar e utilizar fábricas de modelos para criar modelos, consulte a documentação completa [sobre fábricas de modelos](/docs/{{version}}/eloquent-factories). Depois de ter definido uma fábrica de modelos, poderá utilizá-la no seu teste para criar modelos:

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
## Semeando em movimento

 Se pretender usar os [semeadores de base de dados](/docs/{{version}}/seeding) para preencher a sua base de dados durante um teste de funcionalidade, pode invocar o método `seed`. Por defeito, o método `seed` executa o `DatabaseSeeder`, que deve executar todos os outros semeadores. Como alternativa, é possível passar uma classe específica de semeador ao método `seed`:

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

 Como alternativa, você pode instruir o Laravel a atualizar automaticamente o banco de dados antes de cada teste que use a característica `RefreshDatabase`. Isso é feito definindo uma propriedade `$seed` em sua classe de teste básica:

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

 Quando a propriedade `$seed` é `true`, o teste executa a classe `Database\Seeders\DatabaseSeeder` antes de cada teste que usa a tração `RefreshDatabase`. No entanto, você pode especificar um atualizador específico que deve ser executado definindo uma propriedade `$seeder` em sua classe de teste:

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
## Alegações disponíveis

 O Laravel oferece várias afirmações de banco de dados para os seus testes de recurso [Pest](https://pestphp.com) ou [PHPUnit](https://phpunit.de). Abaixo, discutiremos cada uma dessas assertões.

<a name="assert-database-count"></a>
#### assertDatabaseCount

 Afirme que uma tabela no banco de dados contém o número indicado de registos:

```php
    $this->assertDatabaseCount('users', 5);
```

<a name="assert-database-has"></a>
#### assertaBaseDeDadosTem

 Afirme que uma tabela no banco de dados contém registros correspondentes às restrições da consulta por chave/valor indicadas.

```php
    $this->assertDatabaseHas('users', [
        'email' => 'sally@example.com',
    ]);
```

<a name="assert-database-missing"></a>
#### Assertiva "Banco de dados não encontrado"

 Afirme que uma tabela no banco de dados não contém registos correspondentes às restrições da consulta com chave/valor fornecidas:

```php
    $this->assertDatabaseMissing('users', [
        'email' => 'sally@example.com',
    ]);
```

<a name="assert-deleted"></a>
#### assertSoftDeleted

 O método `assertSoftDeleted` pode ser usado para afirmar que um modelo específico do Eloquent foi "excluído soft" (excluído de maneira temporária):

```php
    $this->assertSoftDeleted($user);
```

<a name="assert-not-deleted"></a>
#### assertNotSoftDeleted

 O método `assertNotSoftDeleted` pode ser usado para garantir que um modelo do Eloquent não foi excluído:

```php
    $this->assertNotSoftDeleted($user);
```

<a name="assert-model-exists"></a>
#### assertModelExists

 Afirme que um determinado modelo existe na base de dados:

```php
    use App\Models\User;

    $user = User::factory()->create();

    $this->assertModelExists($user);
```

<a name="assert-model-missing"></a>
#### Assert that a modelo está faltando

 Afirmar que um determinado modelo não existe no banco de dados:

```php
    use App\Models\User;

    $user = User::factory()->create();

    $user->delete();

    $this->assertModelMissing($user);
```

<a name="expects-database-query-count"></a>
#### esperaQuantidadeDeConsultasNoBancoDados

 O método `expectsDatabaseQueryCount` pode ser invocado no início de um teste para especificar o número total de consultas a serem executadas durante o teste. Se o número real de consultas executadas não coincidir exatamente com essa expectativa, o teste falhará:

```php
    $this->expectsDatabaseQueryCount(5);

    // Test...
```
