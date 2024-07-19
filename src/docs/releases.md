# Notas da versão

## Esquema de versionamento

O Laravel e outros pacotes de primeira parte seguem o [Semantic Versioning](https://semver.org). Os principais lançamentos do framework são liberados anualmente (~Q1), enquanto que os menores e as correções podem ser liberados com tanta frequência quanto uma vez por semana. As correções e atualizações **nunca** devem incluir alterações disruptivas.

Ao referenciar o framework Laravel ou seus componentes em sua aplicação ou pacote, você deve sempre usar um limite de versão como `^11.0`, uma vez que as principais versões do Laravel incluem alterações drásticas. No entanto, nos esforçamos para garantir que a atualização para uma nova versão principal seja feita em um dia ou menos.

#### Argumentos de nome

[Argumentos com nome](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments) não estão abrangidos pelas diretrizes de compatibilidade reversa do Laravel. Podemos optar por renomear argumentos da função quando necessário, a fim de melhorar o código base do Laravel. Portanto, usar argumentos com nome ao chamar métodos do Laravel deve ser feito com cautela e com entendimento de que os nomes dos parâmetros podem mudar no futuro.

## Política de Suporte

Todas as versões do Laravel têm 18 meses de correções de erros e 2 anos para correções de falhas de segurança. Para todas as bibliotecas adicionais, incluindo a Lumen, somente o lançamento mais recente recebe correções de erros. Além disso, verifique as versões do banco de dados [suportadas pelo Laravel](/docs/database).

| Versão  | PHP (*)   |  Lançamento             | Correção de bugs até  | Corrige Falhas de Segurança Até |
|---------|-----------|-------------------------|-----------------------|---------------------------------|
| 9       | 8.0 - 8.2 | 8 de fevereiro de 2022  | 8 de agosto de 2023   | 6 de fevereiro de 2024          |
| 10      | 8.1 - 8.3 | 14 de fevereiro de 2023 | 6 agosto de 2024      | 4 de fevereiro de 2025          |
| 11      | 8.2 - 8.3 | 12 de março de 2024     | 3 de setembro de 2025 | 12 de março de 2026             |
| 12      | 8.2 - 8.3 | Q1 2025                 | Q3, 2026              | Q1, 2027                        |

_(*) Versões do PHP suportadas_

## Laravel 11

O Laravel 11 continua os melhoramentos feitos no Laravel 10.x ao introduzir uma estrutura de aplicação simplificada, limitação por segundo, roteamento para saúde, rotatividade de chave de criptografia, testes de filas melhorados, transporte de e-mail [Resend](https://resend.com), integração do validador Prompt, novos comandos do Artisan e muito mais. Além disso, o Laravel Reverb, um servidor WebSocket escalável de primeira-classe foi introduzido para oferecer capacidades robustas em tempo real para suas aplicações.

### O que há de novo no PHP 8.2

O Laravel 11.x requer uma versão mínima de PHP 8.2.

### Estrutura simplificada do aplicativo

_A estrutura simplificada da aplicação Laravel foi desenvolvida por [Taylor Otwell](https://github.com/taylorotwell) e [Nuno Maduro](https://github.com/nunomaduro)_

O Laravel 11 introduz uma estrutura de aplicação otimizada para novas aplicações Laravel, sem que seja necessário realizar quaisquer alterações em aplicações existentes. A nova estrutura de aplicação visa proporcionar uma experiência mais moderna e enxuta, mantendo muitos dos conceitos com os quais os desenvolvedores Laravel já são familiarizados. Abaixo discutimos as principais características da nova estrutura de aplicação do Laravel.

#### O Arquivo Inicial de Inicialização do Aplicativo

O arquivo `bootstrap/app.php` foi revitalizado como um arquivo de configuração da aplicação iniciada por código. A partir deste arquivo, você pode agora personalizar o roteamento da sua aplicação, middleware, provedores de serviço, gerenciamento de exceções e muito mais. Esse arquivo unifica uma variedade de configurações de comportamento de aplicação iniciadas a nível superior que estavam espalhadas pela estrutura de arquivos da sua aplicação:

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

#### Fornecedores de serviços

Em vez da estrutura de aplicativo Laravel padrão que contém cinco provedores de serviços, o Laravel 11 inclui apenas um único `AppServiceProvider`. A funcionalidade dos provedores de serviço anteriores foi incorporada ao `bootstrap/app.php`, é tratada automaticamente pelo framework ou pode ser colocada no `AppServiceProvider` do seu aplicativo.

Por exemplo, o descobrimento de eventos agora é ativado por padrão, eliminando em grande parte a necessidade do registro manual de eventos e seus escutadores. No entanto, se você precisar registrar manuamente eventos, poderá fazer isso facilmente no `AppServiceProvider`. Do mesmo modo, os vínculos de modelos de rota ou portas de autorização que tenham sido previamente registradas no `AuthServiceProvider` podem ser registradas no `AppServiceProvider`.

#### API de aceitação e roteamento de broadcast

Os arquivos de roteamento `api.php` e `channels.php` não estão mais presentes por padrão, pois muitos aplicativos não os necessitam. Em vez disso, eles podem ser criados usando comandos simples do Artisan:

```shell
php artisan install:api

php artisan install:broadcasting
```

#### Middleware

Anteriormente, os novos aplicativos Laravel incluíam nove middlewares que executavam várias funções, tais como autenticação de solicitações, redução de string de entrada e validação de token CSRF.

No Laravel 11, esses middlewares foram movidos para o próprio framework, para que não agreguem volume à estrutura da aplicação. Novos métodos para customizar o comportamento desses middlewares foram adicionados ao framework e podem ser acionados a partir do arquivo `bootstrap/app.php` da aplicação:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(
        except: ['stripe/*']
    );

    $middleware->web(append: [
        EnsureUserIsSubscribed::class,
    ])
})
```

Como todo o middleware pode ser facilmente personalizado através do arquivo `bootstrap/app.php` da aplicação, a necessidade de uma classe de "kernel" HTTP separada foi eliminada.

#### Agendamento

Usando uma nova interface `Schedule`, as tarefas programadas podem agora ser definidas diretamente no arquivo `routes/console.php` do seu aplicativo, eliminando a necessidade de uma classe "kernel" de console separada:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')->daily();
```

#### Manuseamento de exceções

Assim como o roteamento e os middlewares, agora é possível personalizar o gerenciamento de exceções na arquitetura da aplicação. Isso pode ser feito no arquivo `bootstrap/app.php` em vez de uma classe separada de gerenciador de exceções, reduzindo assim a quantidade total de arquivos incluídos numa nova aplicação Laravel:

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->dontReport(MissedFlightException::class);

    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    });
})
```

#### Classe base `Controller`

O controlador base incluído em novas aplicações Laravel foi simplificado. Não se estende mais à classe interna `Controller` do Laravel e os traits `AuthorizesRequests` e `ValidatesRequests` foram removidos, pois podem ser incluídos nos controladores individuais da sua aplicação caso necessite:

```php
<?php

namespace App\Http\Controllers;

abstract class Controller
{
    //
}
```

#### Padrões de Aplicação

Por padrão, novas aplicações Laravel utilizam o SQLite para armazenamento de bases de dados e o driver `database` para sessões, cache e fila do Laravel. Isso permite que você comece a criar sua aplicação imediatamente após a criação da nova aplicação Laravel sem ser necessário instalar software adicional ou criar migrações de banco de dados adicionais.

Além disso, ao longo do tempo, os drivers de banco de dados para esses serviços Laravel tornaram-se robustos o suficiente para uso em produção em muitos contextos de aplicativo; portanto, eles oferecem uma escolha sensata e unificada tanto para aplicativos locais quanto para a produção.

<a name="reverb"></a>
### Laravel Reverb

 _O Laravel Reverb foi desenvolvido por [Joe Dixon](https://github.com/joedixon)._

 O [Laravel Reverb](https://reverb.laravel.com) fornece uma comunicação WebSocket em tempo real extremamente rápida e escalável para o seu aplicativo Laravel, assim como integração perfeita com a suíte de ferramentas de transmissão de eventos do Laravel, como o Laravel Echo.

```shell
php artisan reverb:start
```

Além disso, o Reverb suporta escalonamento horizontal através de capacidades de publicação/assinatura do Redis, permitindo que você distribua seu tráfego WebSocket por meio de vários servidores Reverb no backend, todos apoiando um único aplicativo com alta demanda.

Para mais informações sobre o Laravel Reverb, consulte a documentação completa [aqui](/docs/reverb).

### Limitação por segundo de velocidade de transferência

_O limite por segundo foi contribuído por [Tim MacDonald](https://github.com/timacdonald)._

O Laravel agora suporta limitação por taxas em "segundos" para todos os limitadores de taxas, incluindo aqueles para solicitações HTTP e tarefas priorizadas. Anteriormente, os limitadores de taxas do Laravel tinham um grau de granularidade em "minutos":

```php
RateLimiter::for('invoices', function (Request $request) {
    return Limit::perSecond(1);
});
```

Para mais informações sobre o limite de taxas em Laravel, confira a documentação do recurso de [limitação de taxa] (/docs/routing#rate-limiting).

### Roteamento de saúde

_O roteamento de saúde foi contribuído por [Taylor Otwell](https://github.com/taylorotwell)._

Novas aplicações em Laravel 11 incluem uma diretiva de roteamento `health`, que instrui o Laravel a definir um simples ponto final de verificação de saúde que pode ser invocado por sistemas de monitorização de saúde de aplicações terceiras ou sistemas de orquestração, como o Kubernetes. Por predefinição, este caminho é servido em `/up`:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

Quando solicitações HTTP são feitas para esta rota, o Laravel também envia um evento `DiagnosingHealth`, permitindo que você faça verificações de saúde adicionais, que sejam relevantes para seu aplicativo.

### Rotação elegante da chave de criptografia

_A rotação elegante de chaves de encriptação foi contribuiu por [Taylor Otwell](https://github.com/taylorotwell)._

Como o Laravel encripta todos os cookies, incluindo o cookie de sessão do seu aplicativo, essencialmente todas as requisições para uma aplicação Laravel dependem de encriptação. No entanto, como isso acontece, a alteração da chave de encriptação da sua aplicação fará com que todos os utilizadores saiam da sua aplicação. Além disso, o decodificar dados que foram encriptados pela chave de encriptação anterior torna-se impossível.

O Laravel permite que você defina chaves de criptografia anteriores da aplicação como uma lista delimitada por vírgula por meio da variável de ambiente `APP_PREVIOUS_KEYS`.

Ao cifrar valores, o Laravel sempre usará a chave de cifragem "atual", que está dentro da variável de ambiente `APP_KEY`. Ao decodificar valores, primeiro o Laravel tentará a chave atual. Se a decodificação falhar com a chave atual, o Laravel tentará todas as chaves anteriores até que uma consiga decodificar o valor.

Essa abordagem à descriptografia permite que os usuários continuem utilizando o aplicativo sem interrupções, mesmo se a chave de criptografia for alterada.

Para obter mais informações sobre criptografia no Laravel, confira a documentação de [criptografia](/docs/encryption).

### Recuperação automática de senhas

_A funcionalidade de redefinição automática da senha foi proposta por [Stephen Rees-Carter](https://github.com/valorin)._

O algoritmo padrão de hashing da senha no Laravel é o bcrypt. O "factor de trabalho" dos hashes bcrypt pode ser ajustado no arquivo de configuração `config/hashing.php` ou na variável de ambiente `BCRYPT_ROUNDS`.

Normalmente, o fator de trabalho do bcrypt deve ser aumentado ao longo do tempo, à medida que o poder de processamento da CPU/GPU aumentar. Se você aumentar o fator de trabalho do bcrypt para sua aplicação, o Laravel agora irá reprocessar as senhas dos usuários automaticamente quando os usuários se autenticarem em sua aplicação.

### Prompt de Validação

_O prompt de validação foi contribuído por [Andrea Marco Sartori](https://github.com/cerbero90)._

O [Laravel Prompts](/docs/prompts) é um pacote para adição de formulários bonitos e fáceis de usar às suas aplicações da linha de comando, com funcionalidades semelhantes aos navegadores, tais como texto de localização e validação.

O Laravel Prompts suporta a validação de entradas através de closures:

```php
$name = text(
    label: 'What is your name?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

Contudo, isto pode tornar-se demorado quando se trata de muitos tipos de dados ou cenários complexos de validação. Por conseguinte, na versão 11 do Laravel, poderá utilizar a capacidade completa do [validator](/docs/validation) para validar as informações inseridas:

```php
$name = text('What is your name?', validate: [
    'name' => 'required|min:3|max:255',
]);
```

### Teste de interação em filas

_O teste de interação em fila foi contribuído por [Taylor Otwell](https://github.com/taylorotwell)._

Anteriormente, tentar verificar se uma tarefa agendada foi concluída, excluída ou falhou manualmente era incômodo e demandava a definição de fakes e stubs personalizados. No entanto, no Laravel 11, você pode testar facilmente essas interações da fila usando o método `withFakeQueueInteractions`:

```php
use App\Jobs\ProcessPodcast;

$job = (new ProcessPodcast)->withFakeQueueInteractions();

$job->handle();

$job->assertReleased(delay: 30);
```

Para mais informações sobre testes de tarefas agendadas, consulte a documentação da [filas](/docs/queues#testando).

### Novos comandos do Artisan

_Os comandos de criação da classe Artisan foram fornecidos por [Taylor Otwell](https://github.com/taylorotwell)._

Foram adicionados novos comandos do Artisan para criar rapidamente classes, enumerações, interfaces e características.

```shell
php artisan make:class
php artisan make:enum
php artisan make:interface
php artisan make:trait
```

### Melhorias nos moldes do modelo

_Melhorias no modelo foram contribuídas por [Nuno Maduro](https://github.com/nunomaduro)._

O Laravel 11 suporta definição de cast dos seus modelos usando um método em vez da propriedade. Isso permite uma definição simplificada e fluente do cast, especialmente quando se usam casts com argumentos:

```php
    /**
     * Obtenha os atributos que devem ser lançados.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => AsCollection::using(OptionCollection::class),
                      // AsEncryptedCollection::using(OptionCollection::class),
                      // AsEnumArrayObject::using(OptionEnum::class),
                      // AsEnumCollection::using(OptionEnum::class),
        ];
    }
```

Para obter mais informações sobre o mapeamento de atributos, consulte a documentação do [Eloquent](/docs/eloquent-mutators/#mapeamento-de-atributo)

### A função `once`

_O ajudante `once` foi contribuído por [Taylor Otwell](https://github.com/taylorotwell) e [Nuno Maduro](https://github.com/nunomaduro)._

A função auxiliar `once` executa o valor de retorno do callback e armazena em memória, para toda a duração da solicitação. Quaisquer chamadas subsequentes para a função `once` com o mesmo callback vai retornar o resultado previamente armazenado:

```php
    function random(): int
    {
        return once(function () {
            return random_int(1, 1000);
        });
    }

    random(); // 123
    random(); // 123 (resultado armazenado em cache)
    random(); // 123 (resultado armazenado em cache)
```

Para mais informações sobre o operador de ajuda `once`, consulte a documentação de [help](https://www.twproject.com/docs/concepts/help/).

### Melhor desempenho ao testar com bancos de dados em memória

_As melhorias do desempenho dos testes de banco de dados em memória foram contribuídas por [Anders Jenbo](https://github.com/AJenbo)._

O Laravel 11 oferece um significativo aumento de velocidade quando se utiliza o banco de dados SQLite `:memory:` durante os testes. Para isso, o Laravel agora mantém uma referência ao objeto PDO do PHP e a reutiliza nas conexões, reduzindo frequentemente pela metade o tempo total da execução dos testes.

### Suporte melhorado para o MariaDB

_O apoio melhorado ao MariaDB foi doado pelos seguintes contribuidores: [Jonas Staudenmeir](https://github.com/staudenmeir) e [Julius Kiekbusch](https://github.com/Jubeki)._

O Laravel 11 inclui suporte melhorado para o MariaDB. Nos lançamentos anteriores do Laravel, era possível usar o MariaDB através do driver MySQL do Laravel. No entanto, o Laravel 11 agora inclui um driver dedicado ao MariaDB que fornece melhores predefinições para este sistema de banco de dados.

Para obter mais informações sobre os controladores de banco de dados do Laravel, consulte a [documentação de banco de dados](/docs/database).

### Inspecionando bancos de dados e operações de esquema aprimoradas

_As operações de esquema e a análise de banco de dados foram contribuídas por [Hafez Divandari](https://github.com/hafezdivandari)._

O Laravel 11 providencia operações e métodos de inspeção adicionais do esquema de base de dados, incluindo a renomeação, alteração e remoção nativa de colunas. Além disso, são fornecidos tipos espaciais avançados, nomes de esquemas não padrão e métodos de esquema nativos para manipular tabelas, views, colunas, índices e chaves estrangeiras:

```php
    use Illuminate\Support\Facades\Schema;

    $tables = Schema::getTables();
    $views = Schema::getViews();
    $columns = Schema::getColumns('users');
    $indexes = Schema::getIndexes('users');
    $foreignKeys = Schema::getForeignKeys('users');
```
