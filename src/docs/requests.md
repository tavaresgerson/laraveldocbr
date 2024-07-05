# Requisições

## Introdução
A classe `Illuminate\Http\Request` do Laravel fornece uma forma" objeto-orientada" para interagir com a solicitação atual que sua aplicação está processando, além de permitir recuperar os dados enviados, cookies e arquivos.

## Interagindo com a requisição

### Acessar a requisição
Para obter uma instância da solicitação atual via injeção de dependência, você deve sugerir o tipo `Illuminate\Http\Request` da sua chave na closure da rota ou método do controlador. A instância da solicitação será injectada automaticamente pelo [conjunto de serviços](/docs/container) do Laravel:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * Armazene um novo usuário.
         */
        public function store(Request $request): RedirectResponse
        {
            $name = $request->input('name');

            // Armazene o usuário...

            return redirect('/users');
        }
    }
```

Como mencionado, você pode fazer a tipagem para a classe `Illuminate\Http\Request` em uma closure de rota. O contêiner de serviços injetará automaticamente a requisição na closure quando este for executado:

```php
    use Illuminate\Http\Request;

    Route::get('/', function (Request $request) {
        // ...
    });
```

#### Injeção de dependência e parâmetros da rota
Se o seu método de controle também estiver esperando uma entrada de um parâmetro da rota, você deve listar os seus parâmetros de rota depois das suas outras dependências. Por exemplo, se a sua rota for definida assim:

```php
    use App\Http\Controllers\UserController;

    Route::put('/user/{id}', [UserController::class, 'update']);
```

Você ainda poderá fazer uma sugestão de tipo para o `Illuminate\Http\Request` e acessar seu parâmetro de rota `id` definindo sua método do controlador da seguinte maneira:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * Atualizar o usuário especificado.
         */
        public function update(Request $request, string $id): RedirectResponse
        {
            // Atualizar o usuário...

            return redirect('/users');
        }
    }
```

### Caminho de solicitação, host e método
A instância de `Illuminate\Http\Request`, fornece uma variedade de métodos para examinar o pedido HTTP que chega e estende a classe `Symfony\Component\HttpFoundation\Request`. Iremos discutir alguns dos mais importantes métodos abaixo.

#### Recuperar o caminho da solicitação
O método `path` retorna informações sobre o caminho do requerimento. Então, se a requisição recebida tiver como destino `http://example.com/foo/bar`, o método `path` retornará `foo/bar`:

```php
    $uri = $request->path();
```

#### Inspecionar o caminho da requisição/rota
O método `is` permite verificar se o caminho do pedido recebido coincide com um padrão específico. Você pode usar o caractere "*" como um marcador de posição quando utiliza este método:

```php
    if ($request->is('admin/*')) {
        // ...
    }
```

Usando o método `routeIs`, você pode determinar se o pedido recebido correspondeu a uma [rota nomeada](/docs/routing#named-routes):

```php
    if ($request->routeIs('admin.*')) {
        // ...
    }
```

#### Recuperando o URL da solicitação
Para recuperar o endereço completo da solicitação recebida, você pode utilizar os métodos `url` ou `fullUrl`. O primeiro retorna o URL sem a string de consulta. Já o segundo a inclui:

```php
    $url = $request->url();

    $urlWithQueryString = $request->fullUrl();
```

 Se você gostaria de anexar dados de strings de consulta ao URL atual, pode chamar o método `fullUrlWithQuery`. Este método combina a matriz de variáveis de consulta fornecida com a consulta atual:

```php
    $request->fullUrlWithQuery(['type' => 'phone']);
```

 Se você quiser obter o endereço atual da página web sem um parâmetro de string de consulta especificado, poderá utilizar o método `fullUrlWithoutQuery`:

```php
$request->fullUrlWithoutQuery(['type']);
```

#### Recuperando o host da solicitação
Você pode obter o "host" do pedido recebido através dos métodos `host`, `httpHost` e `schemeAndHttpHost`:

```php
    $request->host();
    $request->httpHost();
    $request->schemeAndHttpHost();
```

#### Recuperando o método de solicitação
O método `method` retornará o verbo HTTP para a requisição. Você pode usar o método `isMethod` para verificar se o verbo HTTP coincide com uma determinada string:

```php
    $method = $request->method();

    if ($request->isMethod('post')) {
        // ...
    }
```

### Cabeçalhos de requisições
Você pode recuperar uma cabeçalho da solicitação usando a instância `Illuminate\Http\Request` com o método `header`. Se o cabeçalho não estiver presente na solicitação, um `null` será devolvido. No entanto, o método `header` aceita um segundo argumento opcional que será retornado se o cabeçalho não estiver presente na solicitação:

```php
    $value = $request->header('X-Header-Name');

    $value = $request->header('X-Header-Name', 'default');
```

 O método `hasHeader` pode ser usado para determinar se o pedido contém um cabeçalho específico:

```php
    if ($request->hasHeader('X-Header-Name')) {
        // ...
    }
```

Para comodidade, o método `bearerToken` pode ser usado para recuperar um token no cabeçalho `Authorization`. Se não houver esse cabeçalho, será retornada uma string vazia:

```php
    $token = $request->bearerToken();
```

### Endereço de IP
O método `ip` pode ser usado para recuperar o endereço IP do cliente que fez a solicitação para sua aplicação.

```php
    $ipAddress = $request->ip();
```

Se pretender recuperar um conjunto de endereços IP, incluindo todos os endereços IP de clientes que tenham sido reencaminhados por proxy, você pode utilizar o método `ips`. O endereço IP do "cliente original" será o último da matriz:

```php
    $ipAddresses = $request->ips();
```

Em geral, os endereços de IP devem ser considerados como dados confidenciais e controlados pelo usuário, para fins de informação apenas.

### Negociação de Conteúdo
O Laravel disponibiliza vários métodos para inspecionar os tipos de conteúdos solicitados através da entrada do cabeçalho `Accept`. Primeiro, o método `getAcceptableContentTypes` irá retornar um array contendo todos os tipos de conteúdo aceites pela requisição:

```php
    $contentTypes = $request->getAcceptableContentTypes();
```

O método `accepts` aceita um array de tipos de conteúdos e retorna `true` se qualquer tipo de conteúdo for aceite pelo pedido. Caso contrário, será retornado `false`:

```php
    if ($request->accepts(['text/html', 'application/json'])) {
        // ...
    }
```

Você pode utilizar o método `prefers` para determinar que tipo de conteúdo é o mais preferido pela solicitação dentro de um determinado conjunto de tipos de conteúdos. Se nenhum dos tipos de conteúdo for aceite, será retornado `null`:

```php
    $preferred = $request->prefers(['text/html', 'application/json']);
```

Visto que muitas aplicações servem apenas o HTML ou JSON, você pode utilizar o método `expectsJson`, para determinar rapidamente se a solicitação recebida espera uma resposta em JSON:

```php
    if ($request->expectsJson()) {
        // ...
    }
```

### Requisições PSR-7
O padrão [PSR-7](https://www.php-fig.org/psr/psr-7/) especifica as interfaces para mensagens HTTP, incluindo pedidos e respostas. Se você deseja obter uma instância de um pedido PSR-7 ao invés de um request do Laravel, primeiro precisará instalar algumas bibliotecas. O Laravel usa o componente *Symfony HTTP Message Bridge* para converter os pedidos e respostas comuns do Laravel em implementações compatíveis com o PSR-7:

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

Depois de instalar essas bibliotecas, você pode obter uma requisição PSR-7 ao indicar o tipo da interface do pedido na closure da rota ou no método do controlador:

```php
    use Psr\Http\Message\ServerRequestInterface;

    Route::get('/', function (ServerRequestInterface $request) {
        // ...
    });
```

::: info NOTA
Se você retornar uma instância de resposta do tipo PSR-7 de uma rota ou controlador, ela será convertida automaticamente para uma instância da classe `Response` do framework e exibida pelo mesmo.

## Entrada

### Obtenção de entrada

#### Recuperando todos os dados da entrada
É possível recuperar todos os dados de entrada do pedido recebido como um `array`, usando o método `all`. Esse método pode ser usado independentemente se o pedido for enviado por meio de um formulário HTML ou se é um pedido XHR:

```php
    $input = $request->all();
```

Usando o método `collect`, você pode recuperar todos os dados de entrada do pedido recebido como uma [collection](/docs/collections)):

```php
    $input = $request->collect();
```

O método `collect` permite também recuperar um subconjunto do input de solicitação recebida como uma coleção:

```php
    $request->collect('users')->each(function (string $user) {
        // ...
    });
```

#### Recuperar um valor de entrada
Usando alguns métodos simples, você pode acessar todos os dados enviados pelo usuário da sua instância de `Illuminate\Http\Request`, sem se preocupar com qual verbete HTTP foi utilizado para a requisição. Independentemente do verbete HTTP, o método `input` pode ser utilizado para recuperar as informações enviadas pelo usuário:

```php
    $name = $request->input('name');
```

Você pode definir um valor padrão como segundo parâmetro do método `input`. Este valor será retornado se o valor de entrada solicitado não estiver presente no pedido:

```php
    $name = $request->input('name', 'Sally');
```

 Ao trabalhar com formulários que contêm entradas em matrizes, use a notação de "ponto" para acessar as matrizes.

```php
    $name = $request->input('products.0.name');

    $names = $request->input('products.*.name');
```

Você pode chamar o método `input` sem nenhum argumento para recuperar todos os valores de entrada como um array associação:

```php
    $input = $request->input();
```

#### Recuperando entradas a partir da string de consulta
Enquanto o método `input` recupera valores de toda a carga da requisição (incluindo a string de consulta), o método `query` recuperará apenas os valores da string de consulta.

```php
    $name = $request->query('name');
```

Se os dados de consulta solicitada não estiverem presentes, o segundo argumento deste método será retornado:

```php
    $name = $request->query('name', 'Helen');
```

 Você pode chamar o método `query` sem nenhum argumento para obter todos os valores de uma string como um array associativo:

```php
    $query = $request->query();
```

#### Recuperando valores de entrada em JSON
Ao enviar requisições do tipo JSON para a sua aplicação, é possível aceder aos dados em formato JSON através do método `input`, desde que o cabeçalho `Content-Type` da requisição esteja devidamente definido como `application/json`. Você pode também recorrer à sintaxe "ponto" (.) para recuperar valores aninhados em matrizes ou objetos JSON:

```php
    $name = $request->input('user.name');
```

#### Recuperando valores de entrada em Stringable
Em vez de recuperar os dados de entrada do pedido como um primitivo `string`, você pode usar o método `string` para recuperar os dados de solicitação como uma instância do tipo [`Illuminate\Support\Stringable`](/docs/helpers#fluent-strings):

```php
    $name = $request->string('name')->trim();
```

#### Recuperando valores de entradas booleanas
Ao lidar com elementos HTML como caixas de seleção, é possível que a sua aplicação receba valores "verdadeiros" que são, na realidade, strings. Por exemplo, "true", "on" ou "1". Para conveniência, você pode usar o método `boolean` para recuperar esses valores como booleanos. O método `boolean` retorna "true" para 1, "1", `true`, "true", "on" e "yes". Todos os outros valores retornam "false":

```php
    $archived = $request->boolean('archived');
```

#### Recuperando valores de entrada de data
Para comodidade, os valores de entrada contendo datas/horários podem ser recuperados com a instância `Carbon`, usando o método `date`. Se a solicitação não conter um valor de entrada com o nome especificado, `null` será retornado:

```php
    $birthday = $request->date('birthday');
```

O segundo e o terceiro argumentos aceitos pelo método `date` podem ser usados para especificar o formato do dia e o fuso horário, respectivamente:

```php
    $elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');
```

Se o valor for apresentado mas tiver um formato inválido, uma `InvalidArgumentException` será lançada; portanto, recomenda-se a validação do input antes de se executar o método `date`.

#### Recuperando valores de entrada do tipo ENUM
Valores de entrada que correspondam a [Enumeradores do PHP](https://www.php.net/manual/en/language.types.enumerations.php) também podem ser recuperados a partir da requisição. Se a requisição não contiver um valor de entrada com o nome dado ou se o enumerador não possuir um valor secundário que corresponda ao valor de entrada, será retornado `null`. O método `enum` aceita o nome do valor de entrada e a classe de enum como os seus argumentos primeiro e segundo:

```php
    use App\Enums\Status;

    $status = $request->enum('status', Status::class);
```

#### Obtenção de entrada através de propriedades dinâmicas
Também é possível acessar os dados do usuário utilizando propriedades dinâmicas na instância de `Illuminate\Http\Request`. Por exemplo, se um formulário da sua aplicação contiver um campo com o nome "name", você poderá acessar seu valor assim:

```php
    $name = $request->name;
```

Ao usar propriedades dinâmicas, o Laravel primeiro procurará o valor do parâmetro no payload da solicitação. Se não estiver presente, o Laravel procurará pelo campo nos parâmetros da rota correspondente.

#### Recuperação de uma parte dos dados de entrada
Se você precisar recuperar um subconjunto dos dados de entrada, poderá utilizar os métodos `only` e `except`. Ambos estes métodos aceitam um único array ou uma lista dinâmica de argumentos.

```php
    $input = $request->only(['username', 'password']);

    $input = $request->only('username', 'password');

    $input = $request->except(['credit_card']);

    $input = $request->except('credit_card');
```

::: warning ATENÇÃO
O método `only` retorna todas as pares de chave/valor solicitados; contudo não retorna os pares que não estão presentes na requisição.
:::

### Campos presentes na entrada
É possível usar o método `has` para determinar se um valor está presente na requisição. O método `has` retorna `true` se o valor estiver presente na requisição.

```php
    if ($request->has('name')) {
        // ...
    }
```

Se for dado um array, o método `has` determinará se todos os valores especificados estão presentes:

```php
    if ($request->has(['name', 'email'])) {
        // ...
    }
```

O método `hasAny()` retorna `true` se qualquer um dos valores especificados estiver presente:

```php
    if ($request->hasAny(['name', 'email'])) {
        // ...
    }
```

 O método `whenHas` vai executar a closure especificada se houver um valor na requisição:

```php
    $request->whenHas('name', function (string $input) {
        // ...
    });
```

Uma segunda chave closure pode ser passada para o método `whenHas`, que será executado se o valor especificado não estiver presente na solicitação:

```php
    $request->whenHas('name', function (string $input) {
        // O valor "name" está presente ...
    }, function () {
        // O valor "name" não está presente...
    });
```

 Se você quiser determinar se um valor está presente na requisição e não é um texto vazio, você pode usar o método `filled`:

```php
    if ($request->filled('name')) {
        // ...
    }
```

O método `anyFilled` retorna `true` se qualquer um dos valores especificados não for uma string vazia:

```php
    if ($request->anyFilled(['name', 'email'])) {
        // ...
    }
```

O método `whenFilled` executará a closure fornecida se existir um valor no pedido e esse não ser um texto vazio:

```php
    $request->whenFilled('name', function (string $input) {
        // ...
    });
```

É possível passar uma segunda ação para o método `whenFilled`, que será executada se o valor especificado não for "preenchido":

```php
    $request->whenFilled('name', function (string $input) {
        // O valor "name" é preenchido...
    }, function () {
        // O valor "name" não está preenchido...
    });
```

Para determinar se uma chave específica está ausente do pedido, você pode usar os métodos `missing` e `whenMissing`:

```php
    if ($request->missing('name')) {
        // ...
    }

    $request->whenMissing('name', function () {
        // O valor "name" está faltando...
    }, function () {
        // O valor "nome" está presente ...
    });
```

### Mesclar informações adicionais
Às vezes, você pode precisar mesclar manualmente um input adicional ao dado de entrada existente do pedido. Para fazer isso, use o método `merge`. Se uma determinada chave de input já existir no pedido, ela será substituída pelos dados fornecidos ao método `merge`:

```php
    $request->merge(['votes' => 0]);
```

O método `mergeIfMissing` pode ser usado para unir a requisição de entrada, se as chaves correspondentes já não existirem nos dados de entrada do pedido.

```php
    $request->mergeIfMissing(['votes' => 0]);
```

### Entrada antiga
O Laravel permite manter os dados de um pedido durante o próximo pedido. Esta funcionalidade é particularmente útil para re-preencher formulários após deteção de erros de validação. No entanto, se estiver a utilizar as funções de [validação](/docs/validation) incluídas no Laravel, poderá não precisar usar directamente esses métodos de envio de dados em flash no servidor de sessão, uma vez que alguns dos dispositivos de validação incorporados chamam esses métodos automaticamente.

#### Dados de entrada no flash da sessão
O método `flash` da classe `Illuminate\Http\Request` armazenará os dados atuais do input na sessão, para que sejam disponibilizados ao utilizador durante o seu próximo pedido à aplicação:

```php
    $request->flash();
```

Você também pode usar os métodos `flashOnly` e `flashExcept` para inserir uma sub-relação de dados da requisição na sessão. Estes métodos são úteis para manter informações confidenciais como senhas fora da sessão:

```php
    $request->flashOnly(['username', 'email']);

    $request->flashExcept('password');
```

#### Flash dos dados e redirecionamento
Como geralmente você quer enviar informações para a sessão e então redirecioná-la para a página anterior, você pode facilmente concatenar o envio de informação com um redirecionamento usando o método `withInput`:

```php
    return redirect('form')->withInput();

    return redirect()->route('user.create')->withInput();

    return redirect('form')->withInput(
        $request->except('password')
    );
```

#### Recuperando entradas antigas
Para recuperar a os dados enviados pela requisição anterior, invoque o método `old` em uma instância de `Illuminate\Http\Request`. O método `old` irá extrair os dados da entrada enviada anteriormente da [sessão](/docs/session):

```php
    $username = $request->old('username');
```

O Laravel também oferece um helper global chamado "old". Se você estiver exibindo um campo antigo dentro de um modelo [Blade](/docs/blade), é mais conveniente usar o auxiliar "old" para repopular o formulário. Caso não exista nenhum input antigo para o campo especificado, ele retornará `null`:

```php
    <input type="text" name="username" value="{{ old('username') }}">
```

### Cookies

#### Recuperar cookies a partir de requisições
Todos os cookies criados pelo Laravel estão encriptados e assinados com um código de autenticação, o que significa que eles serão considerados inválidos se forem alterados por um cliente. Para recuperar um valor de cookie a partir do pedido, use o método `cookie` numa instância de `Illuminate\Http\Request`:

```php
    $value = $request->cookie('name');
```

## Corte e normalização de entrada
Por padrão, o Laravel inclui os middlewares `Illuminate\Foundation\Http\Middleware\TrimStrings` e `Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull` na pilha global de middlewares da aplicação. Esses middlewares automaticamente removem as espaços em branco de todos os campos de string recebidos, além de converter quaisquer campos vazios para `null`. Isso permite que você não se preocupe com essas considerações de normalização nas suas rotas e controladores.

#### Desativação de normalização de entrada
Se pretender desativar esse comportamento para todos os pedidos, poderá remover os dois middlewares da pilha de middlewares da aplicação ao invocar a método `$middleware->remove` no ficheiro `bootstrap/app.php` da sua aplicação:

```php
    use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
    use Illuminate\Foundation\Http\Middleware\TrimStrings;

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->remove([
            ConvertEmptyStringsToNull::class,
            TrimStrings::class,
        ]);
    })
```

Se pretende desativar o corte de strings e a conversão em string vazia para um subconjunto de requisições à aplicação, poderá utilizar os métodos de middleware `trimStrings` e `convertEmptyStringsToNull` na arquivo `bootstrap/app.php` da sua aplicação. Ambos os métodos aceitam um array de closures que devem retornar `true` ou `false` para indicar se a normalização do input deve ser ignorada:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->convertEmptyStringsToNull(except: [
            fn (Request $request) => $request->is('admin/*'),
        ]);

        $middleware->trimStrings(except: [
            fn (Request $request) => $request->is('admin/*'),
        ]);
    })
```

## Arquivos

### Recuperação de arquivos enviados
É possível recuperar arquivos carregados de uma instância `Illuminate\Http\Request` usando o método `file` ou usando propriedades dinâmicas. O método `file` retorna uma instância da classe `Illuminate\Http\UploadedFile`, que é a extensão da classe PHP `SplFileInfo` e fornece vários métodos para interação com o arquivo:

```php
    $file = $request->file('photo');

    $file = $request->photo;
```

É possível determinar se um arquivo está presente na requisição usando o método `hasFile`:

```php
    if ($request->hasFile('photo')) {
        // ...
    }
```

#### Validação de uploads bem-sucedidos
Além de verificar se o arquivo está presente, você pode verificar se houve problemas ao fazer o upload do arquivo através da métrica `isValid`:

```php
    if ($request->file('photo')->isValid()) {
        // ...
    }
```

#### Caminhos de arquivos e extensões
A classe `UploadedFile` contém também métodos para acessar ao caminho completo do ficheiro e à sua extensão. O método `extension` tenta adivinhar a extensão do ficheiro com base no seu conteúdo. Esta extensão pode diferir daquela fornecida pelo cliente:

```php
    $path = $request->photo->path();

    $extension = $request->photo->extension();
```

#### Outros métodos de arquivo
Existem vários outros métodos disponíveis nas instâncias de `UploadedFile`. Consulte a [documentação da API para essa classe](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php) para mais informações sobre esses métodos.

### Armazenamento de arquivos enviados
Normalmente, para armazenar um arquivo carregado você usa um dos [sistemas de arquivos](/docs/filesystem) configurados. A classe `UploadedFile` possui o método `store`, que move um arquivo carregado para um de seus dispositivos, que pode ser uma localização em seu sistema de arquivos local ou em um local de armazenamento na nuvem, como o Amazon S3.

O método `store` aceita o caminho relativo ao diretório raiz configurado no sistema de arquivos, onde o ficheiro deve ser armazenado. Este caminho não pode conter um nome de arquivo, uma vez que um ID exclusivo é automaticamente gerado para servir como nome de arquivo.

O método store também aceita um segundo argumento opcional para o nome do disco que deve ser usado para armazenar o arquivo. O método retorna o caminho do arquivo relativo a raiz do disco:

```php
    $path = $request->photo->store('images');

    $path = $request->photo->store('images', 's3');
```

Se você não quiser que um nome de arquivo seja gerado automaticamente, poderá usar o método `storeAs`, que aceita como argumentos o caminho, o nome do arquivo e o nome do disco:

```php
    $path = $request->photo->storeAs('images', 'filename.jpg');

    $path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

::: info NOTA
Para mais informações sobre armazenamento de arquivos no Laravel, confira a [documentação de armazenamento de arquivos](/docs/filesystem) completa.
:::

## Configurando proxies confiáveis
Ao executar seus aplicativos por trás de um balanceador de carga que encerra certificados TLS/SSL, você pode notar que seu aplicativo às vezes não gera links HTTPS ao usar o auxiliar `url`. Normalmente, isso ocorre porque o tráfego do seu aplicativo está sendo encaminhado do seu balanceador de carga na porta 80 e não sabe que deve gerar links seguros.

Para resolver isso, você pode ativar o middleware `Illuminate\Http\Middleware\TrustProxies`, que está incluído em seu aplicativo Laravel, permitindo que você personalize rapidamente os balanceadores de carga ou proxies que devem ser confiáveis pelo seu aplicativo. Seus proxies confiáveis devem ser especificados usando o método `trustProxies` do middleware no arquivo `bootstrap/app.php`:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: [
            '192.168.1.1',
            '192.168.1.2',
        ]);
    })
```

Além da configuração dos proxies confiáveis, você pode também configurar os cabeçalhos de Proxy que devem ser confiados:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(headers: Request::HEADER_X_FORWARDED_FOR |
            Request::HEADER_X_FORWARDED_HOST |
            Request::HEADER_X_FORWARDED_PORT |
            Request::HEADER_X_FORWARDED_PROTO |
            Request::HEADER_X_FORWARDED_AWS_ELB
        );
    })
```

::: info NOTA
Se você estiver usando o AWS Elastic Load Balancing, o valor `headers` deverá ser `Request::HEADER_X_FORWARDED_AWS_ELB`. Se o seu balanceador de carga usar o cabeçalho `Forwarded` padrão de [RFC 7239](https://www.rfc-editor.org/rfc/rfc7239#section-4), o valor de `headers` deverá ser `Request::HEADER_FORWARDED `. Para obter mais informações sobre as constantes que podem ser usadas no valor `headers`, consulte a documentação do Symfony sobre [confiar em proxies](https://symfony.com/doc/7.0/deployment/proxies.html).
:::

#### Confiar em todos os proxies
Se você estiver usando o Amazon AWS ou outro provedor de balanceador de carga "na nuvem", poderá não conhecer os endereços IP dos seus balanceadores. Nesse caso, poderá usar `*` para confiar em todos os proxy:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');
    })
```

## Configure hospedeiros confiáveis
Por padrão, o Laravel responde a todos os pedidos que recebe, independentemente do conteúdo do cabeçalho de solicitação do `Host`. Além disso, o valor do cabeçalho `Host` é utilizado para gerar URLs absolutas para a sua aplicação durante uma solicitação web.

Normalmente você deve configurar seu servidor web, como o Nginx ou Apache, para enviar apenas requisições à sua aplicação que correspondam a um determinado hostname. No entanto, se você não tiver permissão de personalizar diretamente seu servidor web e precisar instruir o Laravel a responder apenas a determinados hosts, você pode fazer isso ativando o middleware `Illuminate\Http\Middleware\TrustHosts` na sua aplicação.

Para ativar o middleware `TrustHosts`, você deve chamar a método do middleware `trustHosts` no arquivo `bootstrap/app.php` do seu aplicativo. Usando o argumento `at` desse método, é possível especificar os nomes de domínio aos quais sua aplicação responderá. Pedidos recebidos com outros cabeçalhos `Host` serão rejeitados:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustHosts(at: ['laravel.test']);
    })
```

Por padrão, os pedidos que vêm de subdomínios do endereço da aplicação também são automaticamente confiáveis. Se você deseja desativar esse comportamento, poderá usar o argumento `subdomains`:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustHosts(at: ['laravel.test'], subdomains: false);
    })
```
