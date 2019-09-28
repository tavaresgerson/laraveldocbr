# Notas de versão

## Esquema de versão

O esquema de versão do Laravel mantém a seguinte convenção: paradigma.maior.menor. Os principais lançamentos de estrutura são lançados a cada seis meses (fevereiro e agosto), enquanto os lançamentos menores podem ser lançados sempre que a cada semana. Versões menores nunca devem conter alterações de última hora.

Ao referenciar a estrutura do Laravel ou seus componentes a partir de seu aplicativo ou pacote, você deve sempre usar uma restrição de versão como 5.8.*, Pois as principais versões do Laravel incluem alterações recentes. No entanto, nos esforçamos para garantir que você possa atualizar para uma nova versão principal em um dia ou menos.

As versões de mudança de paradigma são separadas por muitos anos e representam mudanças fundamentais na arquitetura e nas convenções da estrutura. Atualmente, não há liberação de mudança de paradigma em desenvolvimento.


## Política de Suporte

Para versões LTS, como o Laravel 5.5, são fornecidas correções de bugs por 2 anos e correções de segurança por 3 anos. Esses lançamentos fornecem a janela mais longa de suporte e manutenção. Para liberações gerais, são fornecidas correções de erros por 6 meses e correções de segurança por 1 ano. Para todas as bibliotecas adicionais, incluindo o Lumen, apenas a versão mais recente recebe correções de bugs.

| Versão    | Release                   | Correções de bugs até         | Correções de segurança até    |
|-----------|---------------------------|-------------------------------|-------------------------------|
| 5.0       | 04 de fevereiro de 2015   | 04 de agosto de 2015          | 04 de fevereiro de 2016       |
| 5.1 (LTS) | 09 de junho de 2015       | 09 de junho de 2017           | 09 de junho de 2018           |
| 5.2       | 21 de dezembro de 2015    | 21 de junho de 2016           | 21 de dezembro de 2016        |
| 5.3       | 23 de agosto de 2016      | 23 de fevereiro de 2017       | 23 de agosto de 2017          |
| 5.4       | 24 de janeiro de 2017     | 24 de julho de 2017           | 24 de janeiro de 2018         |
| 5.5 (LTS) | 30 de agosto de 2017      | 30 de agosto de 2019          | 30 de agosto de 2020          |
| 5.6       | 07 de fevereiro de 2018   | 07 de agosto de 2018          | 07 de fevereiro de 2019       |
| 5.7       | 04 de setembro de 2018    | 04 de março de 2019           | 04 de setembro de 2019        |
| 5.8       | 26 de fevereiro de 2019   | 26 de agosto de 2019          | 26 de setembro de 2020        |

## Laravel 5.8

O Laravel 5.8 continua com as melhorias feitas no Laravel 5.7, introduzindo relacionamentos com o Eloquent de um por um, validação aprimorada de email, registro automático de políticas de autorização com base em convenções, cache do DynamoDB e drivers de sessão, configuração aprimorada do fuso horário do agendador, suporte para a atribuição de vários protetores de autenticação para broadcast de canais, conformidade com o driver de cache PSR-16, melhorias no comando `artisan serve`, suporte ao PHPUnit 8.0, suporte ao Carbon 2.0, suporte ao Pheanstalk 4.0 e uma variedade de outras correções de bugs e melhorias de usabilidade.


## Relacionamento Eloquent `HasOneThrough`

O Eloquent agora fornece suporte para o tipo de relacionamento `hasOneThrough`. Por exemplo, imagine um modelo `hasOne` de Fornecedor, com um modelo de Conta e um modelo de Conta, com um modelo de Histórico de Conta. Você pode usar um relacionamento `hasOneThrough` para acessar o histórico da conta de um fornecedor por meio do modelo de conta:

 
```php
/**
 * Obtêm o histórico da conta do fornecedor.
 */
public function accountHistory()
{
    return $this->hasOneThrough(AccountHistory::class, Account::class);
}
```

## Descoberta automática de políticas de modelo

Ao usar o Laravel 5.7, a política de autorização correspondente de cada modelo precisava ser registrada explicitamente no `AuthServiceProvider` do seu aplicativo:

```php
/**
 * Os mapeamentos de política para o aplicativo.
 *
 * @var array
 */
protected $policies = [
    'App\User' => 'App\Policies\UserPolicy',
];
```
O Laravel 5.8 introduz a descoberta automática de políticas de modelo, desde que o modelo e a política sigam as convenções de 
nomenclatura padrão do Laravel. Especificamente, as políticas devem estar em um diretório de `Policies` abaixo do diretório 
que contém os modelos. Portanto, por exemplo, os modelos podem ser colocados no diretório do aplicativo, enquanto as 
políticas podem ser colocadas no diretório `app/Policies`. Além disso, o nome da política deve corresponder ao nome do modelo 
e ter um sufixo de Política (Policies). Portanto, um modelo de `User` corresponderia a uma classe UserPolicy.

Se você desejar fornecer sua própria lógica de descoberta de política, poderá registrar um retorno de chamada personalizado usando o método `Gate::guessPolicyNamesUsing`. Normalmente, esse método deve ser chamado no `AuthServiceProvider` do seu aplicativo:

``` php
use Illuminate\Support\Facades\Gate;

Gate::guessPolicyNamesUsing(function ($modelClass) {
    // retorna a classe da política...
});
```

> Quaisquer políticas mapeadas explicitamente no seu `AuthServiceProvider` prevalecerão sobre possíveis políticas descobertas 
> automaticamente.

## Conformidade com o cache PSR-16

Para permitir um tempo de expiração mais granular ao armazenar itens e fornecer conformidade com o padrão de cache PSR-16, o 
tempo de vida útil do item em cache mudou de minutos para segundos. Os métodos `put`, `putMany`, `add`, `remember` e 
`setDefaultCacheTime` da classe `Illuminate\Cache\Repository` e suas classes estendidas, bem como o método `put` de cada 
armazenamento em cache foram atualizados com esse comportamento alterado. Consulte a [PR]
(https://github.com/laravel/framework/pull/27276) relacionada para obter mais informações.

Se você estiver passando um número inteiro para qualquer um desses métodos, atualize seu código para garantir que agora está 
passando o número de segundos que deseja que o item permaneça no cache. Como alternativa, você pode passar uma instância 
`DateTime` indicando quando o item deve expirar:

``` php
// Laravel 5.7 - Armazenar item por 30 minutos...
Cache::put('foo', 'bar', 30);

// Laravel 5.8 - Armazenar item for 30 seconds...
Cache::put('foo', 'bar', 30);

// Laravel 5.7 / 5.8 - Armazenar item for 30 seconds...
Cache::put('foo', 'bar', now()->addSeconds(30));
```

## Multiplos protetores de Broadcast

Nas versões anteriores do Laravel, os canais de transmissão privada e de presença autenticavam o usuário por meio da proteção de autenticação padrão do seu aplicativo. A partir do Laravel 5.8, agora você pode atribuir vários guardas que devem autenticar a solicitação recebida:

``` php
Broadcast::channel('channel', function() {
    // ...
}, ['guards' => ['web', 'admin']])
```

## Token Guard Token Hashing
O token guard do Laravel, fornece uma autenticação básica de API, agora suporta o armazenamento de tokens de API como hashes 
SHA-256. Isso fornece segurança aprimorada ao armazenar tokens de texto sem formatação. Para saber mais sobre tokens de 
hash, consulte a documentação completa de [autenticação da API](https://laravel.com/docs/5.8/api-authentication).

> Nota: Enquanto o Laravel é fornecido com uma proteção de autenticação simples, baseada em token, é altamente recomendável 
> que você considere usar o [Laravel Passport](https://laravel.com/docs/5.8/passport) para aplicativos de produção robustos 
> que oferecem autenticação API.

## Validação aprimorada de email
O Laravel 5.8 introduz melhorias na lógica subjacente de validação de email do validador, adotando o pacote `egulias/email-validator` 
utilizado pelo SwiftMailer. A lógica anterior de validação de email do Laravel considerava ocasionalmente emails válidos, como 
`example@bär.se`, como inválidos.

## Fuso horário do agendador padrão
O Laravel permite que você personalize o fuso horário de uma tarefa agendada usando o método de fuso horário:

``` php
$schedule->command('inspire')
         ->hourly()
         ->timezone('America/Chicago');
```

No entanto, isso pode se tornar complicado e repetitivo se você estiver especificando o mesmo fuso horário para todas as suas tarefas agendadas. Por esse motivo, agora você pode definir um método `scheduleTimezone` no arquivo `app/Console/Kernel.php`. Este método deve retornar o fuso horário padrão que deve ser atribuído a todas as tarefas agendadas:

``` php
/**
 * Obtenha o fuso horário que deve ser usado por padrão para eventos agendados.
 *
 * @return \DateTimeZone|string|null
 */
protected function scheduleTimezone()
{
    return 'America/Chicago';
}
```

## Eventos de Tabela Intermediária/Modelo Dinâmico
Nas versões anteriores do Laravel, os [eventos do modelo Eloquent](https://laravel.com/docs/5.8/eloquent#events) não eram despachados ao 
anexar, desanexar ou sincronizar modelos personalizados de tabela intermediária/"pivô" de um relacionamento muitos para muitos. Ao usar 
modelos de [tabela intermediária personalizados](https://laravel.com/docs/5.8/eloquent-relationships#defining-custom-intermediate-table-
models) no Laravel 5.8, os eventos de modelo aplicáveis serão despachados agora.

## Melhorias na chamada do artisan
O Laravel permite invocar o Artisan através do método Artisan::call. Nas versões anteriores do Laravel, as opções do comando são 
passadas através de uma matriz como o segundo argumento para o método:

``` php
use Illuminate\Support\Facades\Artisan;

Artisan::call('migrate:install', ['database' => 'foo']);
```

No entanto, o Laravel 5.8 permite passar o comando inteiro, incluindo opções, como o primeiro argumento de string para o método:

``` php
Artisan::call('migrate:install --database=foo');
```

## Métodos auxiliares de teste de Mock/Spy
Para tornar os objetos de simulação mais convenientes, novos métodos de `mock` e `spy` foram adicionados à classe de caso de teste base 
do Laravel. Esses métodos vinculam automaticamente a classe simulada no contêiner. Por exemplo:

``` php
// Laravel 5.7
$this->instance(Service::class, Mockery::mock(Service::class, function ($mock) {
    $mock->shouldReceive('process')->once();
}));

// Laravel 5.8
$this->mock(Service::class, function ($mock) {
    $mock->shouldReceive('process')->once();
});
```
## Preservação de chave de recurso do Eloquent
Ao retornar uma coleção de recursos Eloquent de uma rota, o Laravel redefine as chaves da coleção para que elas estejam em ordem 
numérica simples:

``` php
use App\User;
use App\Http\Resources\User as UserResource;

Route::get('/user', function () {
    return UserResource::collection(User::all());
});
```

Ao usar o Laravel 5.8, agora você pode adicionar uma propriedade `preserveKeys` à sua classe de recurso, indicando se as chaves de 
coleção devem ser preservadas. Por padrão, e para manter a consistência com as versões anteriores do Laravel, as chaves serão 
redefinidas por padrão:

``` php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class User extends JsonResource
{
    /**
     * Indicates if the resource's collection keys should be preserved.
     *
     * @var bool
     */
    public $preserveKeys = true;
}
```

Quando a propriedade `preserveKeys` estiver configurada como `true`, as chaves de coleção serão preservadas:

``` php
use App\User;
use App\Http\Resources\User as UserResource;

Route::get('/user', function () {
    return UserResource::collection(User::all()->keyBy->id);
});
```

## Método de ordem `orWhere` do Eloquente
Nas versões anteriores do Laravel, a combinação de vários escopos do modelo Eloquent por meio de um operador `or` exigia o uso de retornos de chamada Closure:

``` php
// Métodos scopePopular e scopeActive definidos no modelo de usuário...
$users = App\User::popular()->orWhere(function (Builder $query) {
    $query->active();
})->get();
```

O Laravel 5.8 apresenta um método "de alta ordem" `orWhere` que permite encadear fluentemente esses escopos sem o uso de Closures:

``` php
$users = App\User::popular()->orWhere->active()->get();
```

## Melhorias no Artisan
Nas versões anteriores do Laravel, o comando `serve` do Artisan atenderia seu aplicativo na porta `8000`. Se outro processo de comando `serve` já estivesse atendendo nessa porta, uma tentativa de atender um segundo aplicativo via `serve` falharia. A partir do Laravel 5.8, o `serve` agora procurará portas disponíveis até a porta `8009`, permitindo que você atenda a vários aplicativos ao mesmo tempo.

## Mapeamento de arquivo blade
Ao compilar modelos do Blade, o Laravel agora adiciona um comentário na parte superior do arquivo compilado que contém o caminho para o modelo original do Blade.

## DynamoDB Cache/Session Drivers
O Laravel 5.8 apresenta os drivers de cache e sessão do [DynamoDB](https://aws.amazon.com/dynamodb/). O DynamoDB é um banco de dados NoSQL sem servidor fornecido pelo Amazon Web Services. A configuração padrão para o driver de cache dynamodb pode ser encontrada no [arquivo de configuração de cache](https://github.com/laravel/laravel/blob/master/config/cache.php) do Laravel 5.8.

## Suporte ao Carbon 2.0 
O Laravel 5.8 fornece suporte para a versão `~2.0` da biblioteca de manipulação de datas do Carbon.

## Suporte para Pheanstalk 4.0
O Laravel 5.8 fornece suporte para a versão `~4.0` da biblioteca de filas Pheanstalk. Se você estiver usando a biblioteca Pheanstalk em seu aplicativo, atualize sua biblioteca para a versão `~4.0` via Composer.
