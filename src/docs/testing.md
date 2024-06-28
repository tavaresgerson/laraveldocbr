# Teste: Começando

<a name="introduction"></a>
## Introdução

 O Laravel foi construído com o teste em mente. Na verdade, o suporte para testes com [Pest](https://pestphp.com) e [PHPUnit](https://phpunit.de) está incluso no pacote e um arquivo `phpunit.xml` já está configurado para sua aplicação. Além disso, o framework vem com métodos de auxílio que permitem testar sua aplicação de maneira expressiva.

 Por padrão, o diretório `tests` da sua aplicação contém dois diretórios: `Feature` e `Unit`. Os testes unitários visam uma pequena parte isolada do seu código. Na verdade, a maioria dos testes unitários provavelmente se concentra em um único método. Os testes dentro do diretório de teste "Unit" não iniciam sua aplicação Laravel e, portanto, não conseguem acessar o banco de dados da aplicação ou outros serviços do framework.

 Os testes de recursos podem testar uma parte maior do seu código, incluindo a interação entre vários objetos ou até mesmo um pedido HTTP completo para um endpoint JSON. Geralmente, a maioria dos seus testes deve ser feita através de recursos. Esses tipos de teste fornecem mais confiança de que seu sistema como um todo está funcionando conforme pretendido.

 Uma arquivo chamado `ExampleTest.php` está disponível nas pastas de testes de recursos e unidades, após a instalação de uma nova aplicação Laravel, execute os comandos `vendor/bin/pest`, `vendor/bin/phpunit` ou `php artisan test` para executar seus testes.

<a name="environment"></a>
## Ambiente

 Ao executar os testes, o Laravel definirá automaticamente o ambiente de [configuração](/docs/configuration#environment-configuration) em `testing` devido às variáveis do ambiente definidas no arquivo `phpunit.xml`. O Laravel também configura automaticamente a sessão e o cache para a unidade de transporte `array`, de modo que nenhum dado da sessão ou do cache será mantido durante os testes.

 Você tem liberdade para definir outros valores de configuração do ambiente de testes conforme necessário. As variáveis de ambiente `testing` podem ser configuradas no arquivo `phpunit.xml` da sua aplicação, mas é preciso limpar o cache de configurações usando o comando `config:clear` do Artisan antes de executar os testes!

<a name="the-env-testing-environment-file"></a>
#### O arquivo de ambiente `.env.testing`

 Além disso, você pode criar um arquivo `.env.testing` na raiz do seu projeto. Esse arquivo será usado em vez do arquivo `.env` ao executar testes Pest e PHPUnit ou ao executar comandos Artisan com a opção `--env=testing`.

<a name="creating-tests"></a>
## Criando testes

 Para criar um novo caso de teste, utilize o comando `make:test`. Por padrão, os testes serão colocados no diretório `tests/Feature`:

```shell
php artisan make:test UserTest
```

 Se você quiser criar um teste na diretoria `tests/Unit`, pode usar a opção `--unit` ao executar o comando `make:test`:

```shell
php artisan make:test UserTest --unit
```

 > [!AVISO]
 [Editor de modelo] (//docs/artisan/#stub-customization).

 Depois que o teste foi gerado, você poderá executar como normalmente faria usando Pest ou PHPUnit. Para executar os seus testes, execute o comando `vendor/bin/pest`, `vendor/bin/phpunit` ou `php artisan test` em seu terminal:

```php tab=Pest
<?php

test('basic', function () {
    expect(true)->toBeTrue();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $this->assertTrue(true);
    }
}
```

 > [AVERIGUAR]
 > Se você definir suas próprias métodos `setUp` / `tearDown` dentro de uma classe de teste, lembre-se de chamar os respectivos métodos `parent::setUp()` / `parent::tearDown()` da classe pai. Normalmente, você deve invocar o `parent::setUp()` no início do próprio método `setUp` e o `parent::tearDown()` no final do próprio método `tearDown`.

<a name="running-tests"></a>
## Executando testes

 Como mencionado anteriormente, uma vez que os testes tenham sido escritos, pode executá-los usando o `pest` ou o `phpunit`:

```shell tab=Pest
./vendor/bin/pest
```

```shell tab=PHPUnit
./vendor/bin/phpunit
```

 Além dos comandos "pest" ou "phpunit", você pode usar o comando "test" do Artisan para executar seus testes. O gerenciador de teste do Artisan fornece relatórios detalhados de testes, facilitando o desenvolvimento e a depuração:

```shell
php artisan test
```

 Qualquer argumento que possa ser passado aos comandos `pest` ou `phpunit` pode também ser passado ao comando Artisan `test`:

```shell
php artisan test --testsuite=Feature --stop-on-failure
```

<a name="running-tests-in-parallel"></a>
### Executar testes em paralelo

 Por padrão, o Laravel e o Pest/PHPUnit executam seus testes sequencialmente em um único processo. No entanto, você pode reduzir consideravelmente o tempo de execução dos testes se esses forem executados simultaneamente em vários processos. Para começar, instale o pacote Composer `brianium/paratest` como dependência "dev". Inclua a opção `--parallel` ao executar o comando Artisan `test`:

```shell
composer require brianium/paratest --dev

php artisan test --parallel
```

 Por padrão, o Laravel irá criar tantos processos quantas são as CPUs disponíveis na máquina. No entanto, você poderá ajustar este número usando a opção `--processes`:

```shell
php artisan test --parallel --processes=4
```

 > [!AVISO]
 > Ao executar testes em paralelo, algumas opções do Pest/PHPUnit (como `--do-not-cache-results`) podem não estar disponíveis.

<a name="parallel-testing-and-databases"></a>
#### Teste em paralelo e bancos de dados

 Enquanto você tiver configurado uma conexão à base de dados primária, o Laravel gerencia automaticamente a criação e migração de uma base de dados de teste para cada processo paralelo que esteja executando seus testes. As bases de dados de teste terão um símbolo exclusivo por processo. Por exemplo, se você tiver dois processos paralelos de teste, o Laravel criará e usará as bases de dados de teste `your_db_test_1` e `your_db_test_2`.

 Por padrão, os bancos de dados de teste persistem entre chamadas do comando "test" do Artisan para que possam ser usados novamente nas invocações subseqüentes. No entanto, você pode recriá-los usando a opção `--recreate-databases`:

```shell
php artisan test --parallel --recreate-databases
```

<a name="parallel-testing-hooks"></a>
#### Ganchos de teste paralelos

 Ocasionalmente, você poderá precisar preparar alguns recursos utilizados pelos testes do seu aplicativo para que eles possam ser utilizados de maneira segura por vários processos de teste.

 Usando a facade `ParallelTesting`, você pode especificar o código a ser executado no `setUp` e `tearDown` de um processo ou caso de teste. Os fechos fornecidos recebem as variáveis `$token` e `$testCase`, que contêm os tokens do processo e o caso de teste atual, respectivamente:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Artisan;
    use Illuminate\Support\Facades\ParallelTesting;
    use Illuminate\Support\ServiceProvider;
    use PHPUnit\Framework\TestCase;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            ParallelTesting::setUpProcess(function (int $token) {
                // ...
            });

            ParallelTesting::setUpTestCase(function (int $token, TestCase $testCase) {
                // ...
            });

            // Executed when a test database is created...
            ParallelTesting::setUpTestDatabase(function (string $database, int $token) {
                Artisan::call('db:seed');
            });

            ParallelTesting::tearDownTestCase(function (int $token, TestCase $testCase) {
                // ...
            });

            ParallelTesting::tearDownProcess(function (int $token) {
                // ...
            });
        }
    }
```

<a name="accessing-the-parallel-testing-token"></a>
#### Acesso ao token de teste paralelo

 Se você deseja usar o "token" do processo paralelo atual de qualquer outro local em seu código de teste na aplicação, poderá usar a metodologia `token`. Este token é um identificador único da string para um processo de teste individual e pode ser usado para segmentar recursos entre processos de testes paralelos. Por exemplo, o Laravel adiciona automaticamente este token ao final dos bancos de dados de testes criados por cada processo de testes paralelo:

```php
    $token = ParallelTesting::token();
```

<a name="reporting-test-coverage"></a>
### Relatório de cobertura do teste

 > [ADVERTÊNCIA]
 [Xdebug](https://xdebug.org) ou

 Ao executar seus testes de aplicação, você pode querer determinar se os casos de teste estão realmente cobrindo o código da aplicação e quantos trechos do código da aplicação são utilizados ao executar os testes. Para fazer isso, basta fornecer a opção `--coverage` quando você invoca o comando `test`:

```shell
php artisan test --coverage
```

<a name="enforcing-a-minimum-coverage-threshold"></a>
#### Aplicação de um limite mínimo de cobertura

 Você pode usar a opção `--min` para definir um limite mínimo de cobertura de testes para o seu aplicativo. O conjunto de teste falhará se esse limite não for atingido:

```shell
php artisan test --coverage --min=80.3
```

<a name="profiling-tests"></a>
### Teste de Perfiling

 O executável de testes Artisan inclui também um mecanismo conveniente para listar os testes mais lentos da sua aplicação. Inicie o comando `test` com a opção `--profile` para obter uma lista dos seus dez testes mais lentos, permitindo que você investigue facilmente quais testes podem ser otimizados para acelerar seu conjunto de testes:

```shell
php artisan test --profile
```
