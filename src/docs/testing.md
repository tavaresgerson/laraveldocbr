# Teste: Começando

<a name="introduction"></a>
## Introdução

O Laravel foi construído com testes em mente. De fato, suporte para testes com [Pest](https://pestphp.com) e [PHPUnit](https://phpunit.de) está incluído por padrão, e um arquivo `phpunit.xml` já foi configurado para sua aplicação. O framework também oferece métodos de ajuda convenientes que permitem testar suas aplicações de forma expressiva.

Por padrão seu diretório "tests" da aplicação contém duas subdiretórios: "Feature" e "Unit". Testes unitários são testes que se concentram em uma pequena parte isolada do código. Na verdade, na maioria dos casos de testes unitários provavelmente se concentrarão em um único método. Os testes dentro do seu diretório "unit" não inicializam o Laravel app, portanto eles não podem acessar o banco de dados da aplicação ou outros serviços do framework.

Os testes de recurso podem testar uma parte maior do seu código, incluindo como vários objetos interagem entre si ou até mesmo uma solicitação HTTP completa para um ponto final JSON. **Geralmente, a maioria dos seus testes deve ser de recursos. Esses tipos de testes fornecem mais confiança de que o sistema como um todo está funcionando conforme pretendido.**

Um arquivo 'ExampleTest.php' é fornecido em ambas as pastas de teste de Recursos e Unidade. Depois de instalar um novo aplicativo Laravel, execute o comando 'vendor/bin/pest', 'vendor/bin/phpunit' ou 'php artisan test' para executar seus testes.

<a name="environment"></a>
## Meio ambiente

Ao executar testes, o Laravel automaticamente define o [ambiente de configuração](/docs/configuration#environment-configuration) para 'testing' devido às variáveis de ambiente definidas no arquivo phpunit.xml. O Laravel também configura automaticamente a sessão e o cache para o driver 'array' para que nenhum dado da sessão ou do cache sejam persistidos durante os testes.

Você é livre para definir outros valores de configuração de teste ambiente como necessário. Variáveis de ambiente do `teste` podem ser configuradas no arquivo `phpunit.xml` da sua aplicação, mas certifique-se de limpar seu cache de configuração usando o comando Artisan `config:clear` antes de executar seus testes!

<a name="the-env-testing-environment-file"></a>
#### Arquivo de ambiente .env.testing

Além disso, você pode criar um arquivo `.env.testing` na raiz do seu projeto. Este arquivo será usado em vez do arquivo `.env` quando executar testes do Pest e do PHPUnit ou executar comandos do Artisan com a opção `--env=testing`.

<a name="creating-tests"></a>
## Criando testes

Para criar um novo caso de teste, utilize o comando `make:test` do Artisan. Por padrão, os testes serão colocados no diretório `tests/Feature`:

```shell
php artisan make:test UserTest
```

Se você gostaria de criar um teste dentro do diretório "testes/Unidade", pode usar a opção "--unidade" quando executar o comando "fazer:teste":

```shell
php artisan make:test UserTest --unit
```

> Nota:
> Test stubs podem ser personalizados usando [publicação de stub](https://docs/artisan#stub-customization)

Uma vez que o teste foi gerado, você pode definir o teste como normalmente faria usando Pest ou PHPUnit. Para executar os seus testes, execute o comando `vendor/bin/pest`, `vendor/bin/phpunit` ou `php artisan test` do seu terminal:

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

> [AVISO]
> Se você define seus próprios métodos 'setup'/'teardown' dentro de uma classe de teste, tenha a certeza de chamar os respectivos métodos 'parent::setup()'/'parent::teardown()' da classe pai. Geralmente, você deve invocar 'parent::setup()' no início do seu próprio método 'setup', e 'parent::teardown()' no final do seu método 'teardown'.

<a name="running-tests"></a>
## Teste de desempenho

Como mencionado anteriormente, depois de ter escrito os testes, você pode executá-los usando 'pest' ou 'phpunit':

```shell tab=Pest
./vendor/bin/pest
```

```shell tab=PHPUnit
./vendor/bin/phpunit
```

Além dos comandos 'pest' ou 'phpunit', você pode usar o comando 'test' do Artisan para executar seus testes. O executor de testes do Artisan fornece relatórios detalhados para facilitar o desenvolvimento e a depuração:

```shell
php artisan test
```

Quaisquer argumentos que podem ser passados para o comando `pest` ou `phpunit` também podem ser passados ao comando `arteson test`:

```shell
php artisan test --testsuite=Feature --stop-on-failure
```

<a name="running-tests-in-parallel"></a>
### Testes em Paralelo

Por padrão, Laravel e Pest / PHPUnit executam testes sequencialmente dentro de um único processo. No entanto, você pode reduzir significativamente o tempo necessário para executar seus testes ao executar testes simultaneamente em vários processos. Para começar, você deve instalar o pacote "brianium/paratest" como uma dependência "dev" usando Composer. Em seguida, inclua a opção "--parallel" ao executar o comando "test" Artisan:

```shell
composer require brianium/paratest --dev

php artisan test --parallel
```

Por padrão o Laravel irá criar tantos processos quanto as núcleos da CPU disponíveis na sua máquina. Porém você pode ajustar a quantidade de processos usando a opção `--processes`:

```shell
php artisan test --parallel --processes=4
```

> ¡[ADVERTENCIA]
> Ao executar testes em paralelo, algumas opções do Pest / PHPUnit (como `--do-not-cache-result`) podem não estar disponíveis.

<a name="parallel-testing-and-databases"></a>
#### Testes Paralelos e Bancos de Dados

Enquanto você configurou uma conexão de banco de dados principal, o Laravel lida automaticamente com a criação e migração do teste de um banco de dados para cada processo paralelo que está executando seus testes. Os bancos de dados de teste serão sufixados com um token de processo que é exclusivo por processo. Por exemplo, se você tiver dois processos paralelos de teste, o Laravel criará e utilizará bancos de dados de teste `seu_db_teste_1` e `seu_db_teste_2`.

Por padrão, os bancos de dados de teste persistem entre as chamadas ao comando artisan test, para que eles possam ser reutilizados por chamadas subsequentes. Contudo, você pode recriá-los usando a opção --recreate-databases:

```shell
php artisan test --parallel --recreate-databases
```

<a name="parallel-testing-hooks"></a>
#### Hooks de Teste Paralelo

Às vezes você pode precisar preparar os recursos certos usados pelos testes de sua aplicação para que eles possam ser utilizados com segurança por vários processos de teste.

Usando o fachada ParallelTesting, você pode especificar código para ser executado no processo de configuração e encerramento de um caso de teste ou processo. As variáveis fechamentos fornecidas recebem as variáveis $token e $testCase que contêm, respectivamente, o token do processo e o caso de teste atual:

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
#### Acessando o Token de Teste Paralelo

Se você gostaria de acessar o "token" atual do processo paralelo de qualquer outro local no seu código de teste da aplicação, você pode usar o método `token`. Este token é um identificador de string único para um processo de teste individual e pode ser usado para segmentar recursos entre processos paralelos de testes. Por exemplo, Laravel anexa automaticamente este token ao final dos bancos de dados criados por cada processo paralelo de teste:

```php
    $token = ParallelTesting::token();
```

<a name="reporting-test-coverage"></a>
### Relatório de Cobertura do Teste

> [¡ADVERTENCIA!]
> Esta funcionalidade requer [Xdebug] (https://xdebug.org) ou [PCOVER].

Ao executar seus testes de aplicação, você pode querer determinar se suas casos de testes realmente estão cobrindo o código da aplicação e quanta aplicação é usada ao executar seus testes. Para conseguir isso, você pode fornecer a opção `--coverage` quando invocar o comando `test`:

```shell
php artisan test --coverage
```

<a name="enforcing-a-minimum-coverage-threshold"></a>
#### Ajustando um Limite Mínimo de Cobertura

Você pode usar a opção `--min` para definir um limite mínimo de cobertura de teste para sua aplicação. O conjunto de testes falhará se esse limite não for atendido:

```shell
php artisan test --coverage --min=80.3
```

<a name="profiling-tests"></a>
### Testes de Análise Psicológica

O Artisan também inclui um mecanismo conveniente para listar os testes mais lentos de sua aplicação. Invocar o comando `test` com a opção `--profile` vai apresentar uma lista dos 10 testes mais lentos, permitindo que você investigue quais testes podem ser melhorados para acelerar seu conjunto de testes:

```shell
php artisan test --profile
```
