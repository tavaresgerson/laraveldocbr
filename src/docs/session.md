# Sessões

## Introdução
Uma vez que as aplicações baseadas em HTTP não conservam o estado das informações do utilizador, as sessões permitem armazenar informações sobre o utilizador entre requisições de forma a poderem ser acessadas em pedidos subsequentes.

O Laravel é entregue com uma variedade de sessão backends que são acessados por meio de uma API expressiva e unificada. A inclusão de suporte para backends populares como [Memcached](https://memcached.org), [Redis](https://redis.io) e bancos de dados está incluída.

### Configuração
O arquivo de configuração da sessão do seu aplicativo está armazenado em `config/session.php`. Reverifique as opções disponíveis neste arquivo. Por padrão, o Laravel é configurado para usar o driver de sessões do "banco de dados".

A opção de configuração do `driver` da sessão define onde os dados das sessões serão armazenados para cada solicitação. O Laravel inclui vários "drivers":

 - `file`: as sessões são armazenadas em `storage/framework/sessões`.
 - `cookie` – as sessões são armazenadas em cookies criptografados e seguros.
 - `database` - as sessões são armazenadas num banco de dados relacional.
 - `memcached` ou `redis`: as sessões são armazenadas em um desses servidores rápidos baseados em cache.
 - `dynamodb` - as sessões são armazenadas no DynamoDB da AWS.
 - `array` - As sessões são armazenadas num array PHP e não serão persistidas.

::: warning ATENÇÃO
O driver de array é usado principalmente durante [testes](/docs/testing) e evita que os dados armazenados na sessão sejam persistidos.
:::

### Pré-requisitos de um driver

#### Banco de dados
Para usar o driver de sessão `database`, é necessário que você tenha uma tabela de banco de dados para conter os dados da sessão. Normalmente, isso está incluído na migração de banco de dados padrão do Laravel chamada `0001_01_01_000000_create_users_table.php`. No entanto, se você não tiver uma tabela `sessions` por algum motivo, poderá usar o comando Artisan `make:session-table` para gerar esta migração:

```shell
php artisan make:session-table

php artisan migrate
```

#### Redis
Antes de usar sessões do Redis com o Laravel, você precisará instalar a extensão PHP PhpRedis por meio da PECL ou instalar o pacote `predis/predis` (~1.0) por meio do Composer. Para obter mais informações sobre como configurar o Redis, consulte a [Documentação Redis](/docs/redis#configuracao) do Laravel.

::: info NOTA
A variável de ambiente `SESSION_CONNECTION`, ou a opção `connection` no arquivo de configuração `session.php`, pode ser usada para especificar qual conexão Redis é usada para armazenamento de sessão.
:::

## Interagir com a sessão

### Recuperando dados
Existem duas maneiras de trabalhar com dados de sessão em Laravel: o recurso auxiliar global `session` e por meio de uma instância do tipo `Request`. Primeiro, vejamos como acessar a sessão por meio de uma instância do tipo `Request`, que pode ser indicada na closure de rotas ou métodos do controlador. Lembre-se de que as dependências dos métodos do controlador são injetadas automaticamente através do [conjunto de serviços Laravel](/docs/container):

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use Illuminate\View\View;

    class UserController extends Controller
    {
        /**
         * Mostre o perfil do usuário fornecido.
         */
        public function show(Request $request, string $id): View
        {
            $value = $request->session()->get('key');

            // ...

            $user = $this->users->find($id);

            return view('user.profile', ['user' => $user]);
        }
    }
```

Quando recuperar um item da sessão, você poderá também passar um valor padrão como o segundo argumento ao método `get`. Este valor será devolvido se a chave especificada não existir na sessão. Se for passado um bloco de código como o valor padrão para o método `get` e a chave solicitada não existir, é executado o bloco de código e retorna-se o resultado:

```php
    $value = $request->session()->get('key', 'default');

    $value = $request->session()->get('key', function () {
        return 'default';
    });
```

#### O assistente de sessão global
Você também pode usar as funções PHP globais `session` para recuperar e armazenar dados na sessão. Quando o auxiliar `session` é chamado com um único argumento de string, ele retorna o valor da chave da sessão. Se o auxiliar for chamado com uma lista de pares de chaves/valores, esses valores serão armazenados na sessão:

```php
    Route::get('/home', function () {
        // Recuperar um dado da sessão...
        $value = session('key');

        // Especificando um valor padrão...
        $value = session('key', 'default');

        // Armazene um dado na sessão...
        session(['key' => 'value']);
    });
```

::: info NOTA
Há pouca diferença prática entre usar a sessão por meio de uma instância de solicitação HTTP e usar o auxiliar global `session`. Ambos os métodos são [testáveis](/docs/testing) através do método `assertSessionHas` que está disponível em todos os seus casos de teste.
:::

#### Recuperar todos os dados da sessão
Se você quiser recuperar todos os dados da sessão, poderá usar o método `all`:

```php
    $data = $request->session()->all();
```

#### Recuperar uma parte dos dados de sessão
Os métodos `only` e `except` podem ser utilizados para recuperar um subconjunto dos dados da sessão:

```php
    $data = $request->session()->only(['username', 'email']);

    $data = $request->session()->except(['username', 'email']);
```

#### Determinar se um item existe na sessão
Para determinar se um objeto está presente na sessão é possível usar o método `has`. O método `has` retorna `true` quando o objeto está presente e não é `null`:

```php
    if ($request->session()->has('users')) {
        // ...
    }
```

Para determinar se um item está presente na sessão, mesmo que seu valor seja `null`, você pode usar o método `exists`:

```php
    if ($request->session()->exists('users')) {
        // ...
    }
```

Para determinar se um elemento não está presente na sessão, você pode usar o método `missing`. O método `missing` retorna `verdadeiro` se o elemento estiver faltando:

```php
    if ($request->session()->missing('users')) {
        // ...
    }
```

### Armazenar dados
Para armazenar dados na sessão, normalmente você utilizará o método `put` da instância de solicitação ou o recurso auxiliar global `session`:

```php
    // Por meio de uma instância de solicitação...
    $request->session()->put('key', 'value');

    // Através do auxiliar global de "sessão"...
    session(['key' => 'value']);
```

#### Adicionando valores de array na sessão
É possível utilizar o método `push` para adicionar um novo valor em uma variável de sessão que seja um tipo de matriz. Por exemplo, se a chave `user.teams` fornecer uma lista de nomes de equipes, pode ser efetuada a sua expansão desta forma:

```php
    $request->session()->push('user.teams', 'developers');
```

#### Recuperar e excluir um item
O método `pull` recupera e exclui um elemento da sessão em uma única instrução:

```php
    $value = $request->session()->pull('key', 'default');
```

#### Aumentar e diminuir os valores da sessão
Se os dados da sessão incluírem um número inteiro que você deseja incrementar ou decrementar, você poderá usar os métodos `increment` e `decrement`:

```php
    $request->session()->increment('count');

    $request->session()->increment('count', $incrementBy = 2);

    $request->session()->decrement('count');

    $request->session()->decrement('count', $decrementBy = 2);
```

### Dados do Flash
Às vezes você pode desejar armazenar itens na sessão para a próxima requisição . Você pode fazer isso usando o método `flash`. Dados armazenados na sessão com este método estarão disponíveis imediatamente e durante o pedido subsequente. Após o pedido HTTP subsequente, os dados "flash" serão excluídos. Os dados "flash" são úteis principalmente para mensagens de status de curto prazo:

```php
    $request->session()->flash('status', 'Task was successful!');
```

Se você precisar persistir seus dados Flash para vários pedidos, você pode usar o método `reflash`, que manterá todos os dados Flash por mais uma requisição. Se você só precisa manter um tipo específico de dado Flash, poderá usar o método `keep`:

```php
    $request->session()->reflash();

    $request->session()->keep(['username', 'email']);
```

Para persistir dados de flash somente para o pedido atual, você pode usar o método `now`:

```php
    $request->session()->now('status', 'Task was successful!');
```

### Excluir dados
O método `forget` removerá um dado da sessão. Para remover todos os dados de uma sessão, você poderá usar o método `flush`:

```php
    // Esqueça uma única chave...
    $request->session()->forget('name');

    // Esqueça várias chaves...
    $request->session()->forget(['name', 'status']);

    $request->session()->flush();
```

### Regenerando o identificador de sessão
A regeneração do identificador da sessão é feita frequentemente para evitar que usuários maliciosos explorem um ataque de [fixação de sessão](https://owasp.org/www-community/attacks/Session_fixation) em seu aplicativo.

O Laravel regenera automaticamente o identificador de sessão durante a autenticação se você estiver usando um dos [Kits iniciais da aplicação Laravel](/docs/starter-kits) ou [Laravel Fortify](/docs/fortify). No entanto, se for preciso regenerar manualmente o identificador de sessão, é possível usar o método `regenerate`:

```php
    $request->session()->regenerate();
```

Se você precisar gerar um novo identificador de sessão e remover todos os dados da sessão em uma única declaração, poderá usar o método `invalidate`:

```php
    $request->session()->invalidate();
```

## Bloqueio de sessão

::: warning ATENÇÃO
Para utilizar o bloqueio de sessão, seu aplicativo deve usar um driver de cache que suporte [bloqueios atômicos](/docs/cache#atomic-locks). Atualmente, esses drivers de cache incluem os drivers `memcached`, `dynamodb`, `redis`, `database`, `file` e `array`. Além disso, você não pode usar o driver de sessão `cookie`.
:::

Por padrão, o Laravel permite que os pedidos usem a mesma sessão para serem executados simultaneamente. Então, por exemplo, se você usar uma biblioteca de HTTP em JavaScript para fazer dois pedidos ao seu aplicativo, ambos serão executados ao mesmo tempo. Para muitas aplicações, isso não é um problema; entretanto, a perda de dados da sessão pode ocorrer num pequeno subconjunto de aplicações que fizerem requisições concorrentes para dois pontos finais diferentes do aplicativo, sendo ambos responsáveis por gravar os dados na sessão.

Para evitar esse problema, o Laravel fornece uma funcionalidade que permite limitar solicitações concorrentes para uma sessão específica. Para começar, você pode simplesmente adicionar a definição da rota ao método `block`. Nesse exemplo, uma solicitação entrando no endpoint "/profile" irá bloquear a sessão. Enquanto esse bloqueio estiver sendo mantido, todas as solicitações entrantes nos endpoints "/profile" ou "/order", que compartilham o mesmo identificador de sessão, esperarão que a primeira solicitação termine sua execução antes de continuarem:

```php
    Route::post('/profile', function () {
        // ...
    })->block($lockSeconds = 10, $waitSeconds = 10)

    Route::post('/order', function () {
        // ...
    })->block($lockSeconds = 10, $waitSeconds = 10)
```

O método `block` aceita dois argumentos opcionais. O primeiro argumento aceito pelo método `block` é o número máximo de segundos durante os quais a sessão deve permanecer bloqueada antes de ser liberada. Logo, se o pedido for executado e terminar antes desse tempo, o bloqueio será liberado mais cedo.

O segundo argumento aceito pelo método `block` é o número de segundos que o pedido deve esperar para tentar obter um bloqueio de sessão. Será lançado uma exceção `Illuminate\Contracts\Cache\LockTimeoutException` se o pedido não conseguir obter um bloqueio de sessão dentro do período especificado em segundos.

Se nenhum destes argumentos for passado, o bloqueio será feito por um período máximo de 10 segundos. As requisições irão aguardar por um período máximo de 10 segundos enquanto tentam obter um bloqueio:

```php
    Route::post('/profile', function () {
        // ...
    })->block()
```

## Adicionando drivers de sessão personalizados

### Implementação do driver
Se nenhum dos drivers de sessão existentes atenderem às suas necessidades, o Laravel permite que você crie seu próprio driver de sessão. O driver de sessão personalizado deve implementar a `SessionHandlerInterface` incorporada ao PHP. Essa interface contém apenas alguns métodos simples. Uma implementação de MongoDB simples, chamada de "stub", é mostrada a seguir:

```php
    <?php

    namespace App\Extensions;

    class MongoSessionHandler implements \SessionHandlerInterface
    {
        public function open($savePath, $sessionName) {}
        public function close() {}
        public function read($sessionId) {}
        public function write($sessionId, $data) {}
        public function destroy($sessionId) {}
        public function gc($lifetime) {}
    }
```

::: info NOTA
O Laravel não vem com um diretório para conter suas extensões. Você é livre para colocá-los onde quiser. Neste exemplo, criamos um diretório `Extensions` para hospedar o `MongoSessionHandler`.
:::

Uma vez que a finalidade destes métodos não é compreendida facilmente, vamos ver rapidamente o que cada um deles faz:

- O método `open` é normalmente utilizado em sistemas de armazenamento de sessões baseados em arquivos. Uma vez que o Laravel inclui um driver de sessão `file`, é muito raro ter necessidade de preencher este método. Pode se deixar vazio.
 - O método `close`, assim como o método `open`, geralmente pode ser desconsiderado. Para a maioria dos drivers não é necessário.
 - O método `read` deve retornar a versão em string dos dados de sessão associada ao `$sessionId` informado. Não é necessário realizar nenhuma serialização ou outra codificação ao recuperar ou armazenar os dados da sessão em seu driver, pois o Laravel irá realizar a serialização por você.
 - O método `write` deverá escrever a string `$data` associado ao `$sessionId` para um sistema persistente de armazenamento, como MongoDB ou outro sistema de seu interesse. Novamente, não deve ser efetuada nenhuma serialização - Laravel já lidou com isso para você.
 - O método `destroy` deve remover os dados associados ao `$sessionId` do armazenamento persistente.
 - O método `gc` deve destruir todos os dados de sessão mais antigos do que o valor da variável `$lifetime`, que é um timestamp UNIX. Para sistemas com auto-expiração, como Memcached e Redis, este método pode ficar vazio.

### Registrar o driver
Depois que seu driver for implementado, você estará pronto para registrá-lo com o Laravel. Para adicionar drivers adicionais ao back-end de sessão do Laravel, é possível usar a método `extend` disponibilizado pela [facade](/docs/facades) `Session`. Você deve chamar a método `extend` no método `boot` de um [service provider](~/providers/). Isso pode ser feito tanto no existente `App\Providers\AppServiceProvider`, quanto criando um novo provedor:

```php
    <?php

    namespace App\Providers;

    use App\Extensions\MongoSessionHandler;
    use Illuminate\Contracts\Foundation\Application;
    use Illuminate\Support\Facades\Session;
    use Illuminate\Support\ServiceProvider;

    class SessionServiceProvider extends ServiceProvider
    {
        /**
         * Registre quaisquer serviços do aplicativo.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Inicialize qualquer serviço do aplicativo.
         */
        public function boot(): void
        {
            Session::extend('mongo', function (Application $app) {
                // Retornar uma implementação de SessionHandlerInterface...
                return new MongoSessionHandler;
            });
        }
    }
```

Depois que o driver de sessão tiver sido registrado, você pode especificar o driver `mongo` como seu driver de sessão de aplicativo usando a variável de ambiente `SESSION_DRIVER` ou na configuração do arquivo de configuração `config/session.php` da aplicação.
