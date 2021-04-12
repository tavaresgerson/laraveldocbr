# Solicitações HTTP

## Introdução
A classe `Illuminate\Http\Request` do Laravel fornece uma maneira orientada a objetos para interagir com a solicitação HTTP atual sendo 
tratada por sua aplicação, bem como recuperar a entrada, cookies e arquivos que foram enviados com a solicitação.

## Interagindo com o pedido

### Acessando a solicitação
Para obter uma instância da solicitação HTTP atual por meio de injeção de dependência, você deve usar o type-hint da classe `Illuminate\Http\Request`
em sua closure de rota ou método do controlador. A instância de solicitação recebida será automaticamente injetada pelo contêiner de serviço Laravel:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Store a new user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $name = $request->input('name');

        //
    }
}
```

Conforme mencionado, você também pode usar o type-hint para a classe `Illuminate\Http\Request` em uma closure de rota. O contêiner de serviço injetará 
automaticamente a solicitação de entrada no encerramento quando for executado:

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    //
});
```

#### Injeção de dependência e parâmetros de rota
Se seu método de controlador também espera entrada de um parâmetro de rota, você deve listar seus parâmetros de rota após suas outras dependências. 
Por exemplo, se sua rota for definida assim:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

Você ainda pode digitar `Illuminate\Http\Request` e acessar o parâmetro `id` da rota definindo o método do controlador da seguinte forma:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the specified user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }
}
```

### Solicitar Caminho e Método

A instância `Illuminate\Http\Request` fornece uma variedade de métodos para examinar a solicitação HTTP recebida e estende a
classe `Symfony\Component\HttpFoundation\Request`. Discutiremos alguns dos métodos mais importantes a seguir.

#### Recuperando o Caminho da Solicitação
O método `path` retorna as informações do caminho da solicitação. Portanto, se a solicitação de entrada for direcionada à `http://example.com/foo/bar`, 
o método `path` retornará `foo/bar`:

```php
$uri = $request->path();
```

#### Inspecionando o Caminho/Rota da Solicitação
O método `is` permite que você verifique se o caminho da solicitação de entrada corresponde a um determinado padrão. Você pode usar o caractere `*` 
como curinga ao utilizar este método:

```php
if ($request->is('admin/*')) {
    //
}
```

Usando o método `routeIs`, você pode determinar se a solicitação de entrada corresponde a uma rota nomeada:

```php
if ($request->routeIs('admin.*')) {
    //
}
```

#### Recuperando o URL de solicitação
Para recuperar o URL completo da solicitação recebida, você pode usar os métodos `url` ou `fullUrl`. O método `url` retornará o URL sem a string de 
consulta, enquanto o método `fullUrl` inclui a string de consulta:

```php
$url = $request->url();

$urlWithQueryString = $request->fullUrl();
```

Se você deseja anexar dados da string de consulta ao URL atual, pode chamar o método `fullUrlWithQuery`. Este método mescla a matriz fornecida de 
variáveis de string de consulta com a string de consulta atual:

```php
$request->fullUrlWithQuery(['type' => 'phone']);
```

#### Recuperando o Método de Solicitação
O método `method` retornará o verbo HTTP para a solicitação. Você pode usar o método `isMethod` para verificar se o verbo HTTP corresponde a uma 
determinada string:

```php
$method = $request->method();

if ($request->isMethod('post')) {
    //
}
```

#### Solicitar cabeçalhos
Você pode recuperar um cabeçalho de solicitação da instância `Illuminate\Http\Request` usando o método `header`. Se o cabeçalho não estiver 
presente na solicitação, `null` será retornado. No entanto, o método `header` aceita um segundo argumento opcional que será retornado se o 
cabeçalho não estiver presente na solicitação:

```php
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');
```

O método `hasHeader` pode ser usado para determinar se a solicitação contém um determinado cabeçalho:

```php
if ($request->hasHeader('X-Header-Name')) {
    //
}
```

Por conveniência, o método `bearerToken` pode ser usado para recuperar um token de portador do cabeçalho `Authorization`. Se nenhum cabeçalho estiver 
presente, uma string vazia será retornada:

```php
$token = $request->bearerToken();
```

### Solicitar endereço IP
O método `ip` pode ser usado para recuperar o endereço IP do cliente que fez a solicitação ao seu aplicativo:

```php
$ipAddress = $request->ip();
```

### Negociação de Conteúdo
O Laravel fornece vários métodos para inspecionar os tipos de conteúdo solicitados pela requisição de entrada através do cabeçalho `Accept`. Primeiro, 
o método `getAcceptableContentTypes` retornará uma matriz contendo todos os tipos de conteúdo aceitos pela solicitação:

```php
$contentTypes = $request->getAcceptableContentTypes();
```

O método `accepts` aceita uma matriz de tipos de conteúdo e retorna `true` se algum dos tipos de conteúdo for aceito pela solicitação. Caso contrário, 
`false`será devolvido:

```php
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}
```

Você pode usar o método `prefers` para determinar qual tipo de conteúdo de uma determinada matriz de tipos de conteúdo é o mais preferido pela solicitação. 
Se nenhum dos tipos de conteúdo fornecidos for aceito pela solicitação, `null` será retornado:

```php
$preferred = $request->prefers(['text/html', 'application/json']);
```

Como muitos aplicativos servem apenas HTML ou JSON, você pode usar o método `expectsJson` para determinar rapidamente se a solicitação recebida espera 
uma resposta JSON:

```php
if ($request->expectsJson()) {
    // ...
}
```

### Pedidos PSR-7
O padrão PSR-7 especifica interfaces para mensagens HTTP, incluindo solicitações e respostas. Se você gostaria de obter uma instância de um pedido 
PSR-7 ao invés de um pedido Laravel, você primeiro precisa instalar algumas bibliotecas. O Laravel usa o componente Symfony HTTP Message Bridge para 
converter solicitações e respostas típicas do Laravel em implementações compatíveis com PSR-7:

```bash
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

Depois de instalar essas bibliotecas, você pode obter uma solicitação PSR-7 usando o type-hint na interface de solicitação em sua closure de
rota ou método do controlador:

```php
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    //
});
```

> Se você retornar uma instância de resposta do PSR-7 de uma rota ou controlador, ela será automaticamente convertida de volta para uma instância de 
> resposta do Laravel e será exibida pelo framework.


## Entrada

### Recuperando entrada

#### Recuperando todos os dados de entrada
Você pode recuperar todos os dados de entrada da solicitação de entrada na estrutura de `array` usando o método `all`. Este método pode ser usado
independentemente de a solicitação de entrada ser de um formulário HTML ou uma solicitação XHR:

```php
$input = $request->all();
```

#### Recuperando um valor de entrada
Usando alguns métodos simples, você pode acessar todas as entradas do usuário de sua instância `Illuminate\Http\Request` sem se preocupar com qual 
verbo HTTP foi usado para a solicitação. Independentemente do verbo HTTP, o método `input` pode ser usado para recuperar a entrada do usuário:

```php
$name = $request->input('name');
```

Você pode passar um valor padrão como o segundo argumento para o método `input`. Este valor será retornado se o valor de entrada solicitado não 
estiver presente na solicitação:

```php
$name = $request->input('name', 'Sally');
```

Ao trabalhar com formulários que contêm entradas de matriz, use a notação de "ponto" para acessar as matrizes:

```
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

Você pode chamar o método `input` sem nenhum argumento para recuperar todos os valores de entrada como uma matriz associativa:

```php
$input = $request->input();
```

#### Recuperando entrada da string de consulta
Enquanto o método `input` recupera valores de toda a carga útil da solicitação (incluindo a string de consulta), o método `query` recupera apenas 
os valores da string de consulta:

```php
$name = $request->query('name');
```

Se os dados do valor da string de consulta solicitada não estiverem presentes, o segundo argumento para este método será retornado:

```php
$name = $request->query('name', 'Helen');
```

Você pode chamar o método `query` sem nenhum argumento para recuperar todos os valores da string de consulta como uma matriz associativa:

```php
$query = $request->query();
```

#### Recuperando valores de entrada JSON
Ao enviar solicitações JSON para seu aplicativo, você pode acessar os dados JSON por meio do método `input`, desde que o cabeçalho `Content-Type` 
da solicitação esteja definido corretamente para `application/json`. Você pode até usar a sintaxe de "ponto" para recuperar valores aninhados em 
matrizes JSON:

```php
$name = $request->input('user.name');
```

#### Recuperando Valores Booleanos de Entrada
Ao lidar com elementos HTML como caixas de seleção, seu aplicativo pode receber valores "verdadeiros" que são, na verdade, strings. Por exemplo, 
"verdadeiro" ou "ativado". Por conveniência, você pode usar o método `boolean` para recuperar esses valores como booleanos. O método `boolean` 
retorna `true` para 1, "1", true, "true", "on" e "yes". Todos os outros valores retornarão false:

```php
$archived = $request->boolean('archived');
```

#### Recuperando entrada por meio de propriedades dinâmicas
Você também pode acessar a entrada do usuário usando propriedades dinâmicas na instância `Illuminate\Http\Request`. Por exemplo, se um dos formulários do 
seu aplicativo contém um campo `name`, você pode acessar o valor do campo da seguinte forma:

```php
$name = $request->name;
```

Ao usar propriedades dinâmicas, o Laravel irá primeiro procurar pelo valor do parâmetro na carga útil da solicitação. Se não estiver presente, o Laravel 
irá procurar o campo nos parâmetros da rota combinada.

#### Recuperando uma parte dos dados de entrada
Se você precisar recuperar um subconjunto dos dados de entrada, poderá usar os métodos `only` e `except`. Ambos os métodos aceitam uma lista única de `array` 
ou dinâmica de argumentos:

```php
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

> O método `only` retorna todos os pares de chave/valor que você solicitar; no entanto, ele não retornará pares de chave/valor que não 
> estejam presentes na solicitação.


### Determinando se a entrada está presente
Você pode usar o método `has` para determinar se um valor está presente na solicitação. O método `has` retorna `true` se o valor estiver presente na 
solicitação:

```php
if ($request->has('name')) {
    //
}
```

Quando fornecido uma matriz, o método `has` determinará se todos os valores especificados estão presentes:

```php
if ($request->has(['name', 'email'])) {
    //
}
```
O método `whenHas` executará a closure fornecida se um valor estiver presente na solicitação:

```php
$request->whenHas('name', function ($input) {
    //
});
```

O método `hasAny` retorna `true` se algum dos valores especificados estiver presente:

```php
if ($request->hasAny(['name', 'email'])) {
    //
}
```

Se você deseja determinar se um valor está presente na solicitação e não está vazio, você pode usar o método `filled`:

```php
if ($request->filled('name')) {
    //
}
```

O método `whenFilled` executará a closure fornecida se um valor estiver presente na solicitação e não estiver vazio:

```php
$request->whenFilled('name', function ($input) {
    //
});
```

Para determinar se uma determinada chave está ausente da solicitação, você pode usar o método `missing`:

```php
if ($request->missing('name')) {
    //
}
```

### Entrada Antiga
O Laravel permite que você mantenha a entrada de uma solicitação durante a próxima solicitação. Esse recurso é particularmente útil para preencher 
novamente os formulários após a detecção de erros de validação. No entanto, se você estiver usando os recursos de validação incluídos no Laravel, é 
possível que você não precise usar manualmente esses métodos de flash de entrada de sessão diretamente, já que alguns dos recursos de validação embutidos 
do Laravel os chamarão automaticamente.

#### Entrada flash para a sessão
O método `flash` na classe `Illuminate\Http\Request` atualizará a entrada atual para a sessão para que esteja disponível durante a próxima solicitação do 
usuário ao aplicativo:

```php
$request->flash();
```

Você também pode usar os métodos `flashOnly` e `flashExcept` para enviar um subconjunto dos dados da solicitação para a sessão. Esses métodos são úteis 
para manter informações confidenciais, como senhas, fora da sessão:

```php
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

#### Entrada com flash e depois redirecionando
Uma vez que você deseje atualizar a entrada para a sessão e, em seguida, redirecionar para a página anterior, você pode facilmente encadear a entrada 
com um redirecionamento usando o método `withInput`:

```php
return redirect('form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('form')->withInput(
    $request->except('password')
);
```

#### Recuperando dados antigos
Para recuperar a entrada atualizada da solicitação anterior, invoque o método `old` em uma instância de `Illuminate\Http\Request`. O método `old` 
extrairá os dados de entrada previamente atualizados da sessão:

```php
$username = $request->old('username');
```

O Laravel também fornece um auxiliar global chamado `old`. Se você estiver exibindo uma entrada antiga em um template Blade, é mais conveniente usar 
o auxiliar `old` para preencher novamente o formulário. Se nenhuma entrada antiga existir para o campo fornecido `null` será retornado:

```html
<input type="text" name="username" value="{{ old('username') }}">
```

### Cookies

#### Recuperando Cookies de Solicitações
Todos os cookies criados pelo framework Laravel são criptografados e assinados com um código de autenticação, o que significa que serão considerados 
inválidos caso tenham sido alterados pelo cliente. Para recuperar um valor de cookie da solicitação, use o método `cookie` em uma
instância `Illuminate\Http\Request`:

```php
$value = $request->cookie('name');
```

### Ajuste e normalização de entrada
Por padrão, o Laravel inclui o middleware `App\Http\Middleware\TrimStrings` e `App\Http\Middleware\ConvertEmptyStringsToNull` na pilha de middleware global 
do seu aplicativo. Esses middlewares são listados na pilha de middleware global pela classe `App\Http\Kernel`. Esse middleware cortará automaticamente todos 
os campos de string de entrada na solicitação, bem como converterá quaisquer campos de string vazios em `null`. Isso permite que você não precise se preocupar 
com essas questões de normalização em suas rotas e controladores.

Se desejar desativar esse comportamento, você pode remover os dois middlewares da pilha de middleware de seu aplicativo removendo-os da propriedade
`$middleware` de sua classe `App\Http\Kernel`.

## Arquivos

### Recuperando arquivos carregados
Você pode recuperar arquivos carregados de uma instância `Illuminate\Http\Request` usando o método `file` ou usando propriedades dinâmicas. O método `file`
retorna uma instância da classe `Illuminate\Http\UploadedFile`, que estende a classe PHP `SplFileInfo` e fornece uma variedade de métodos para interagir 
com o arquivo:

```php
$file = $request->file('photo');

$file = $request->photo;
```

Você pode determinar se um arquivo está presente na solicitação usando o método `hasFile`:

```php
if ($request->hasFile('photo')) {
    //
}
```

#### Validando uploads bem-sucedidos
Além de verificar se o arquivo está presente, você pode verificar se não houve problemas para enviar o arquivo por meio do método `isValid`:

```php
if ($request->file('photo')->isValid()) {
    //
}
```

#### Caminhos e extensões de arquivo
A classe `UploadedFile` também contém métodos para acessar o caminho totalmente qualificado do arquivo e sua extensão. O método `extension` tentará 
adivinhar a extensão do arquivo com base em seu conteúdo. Esta extensão pode ser diferente da extensão fornecida pelo cliente:

```php
$path = $request->photo->path();

$extension = $request->photo->extension();
```

#### Outros métodos de arquivo
Existem vários outros métodos disponíveis nas instâncias `UploadedFile`. Verifique a documentação da API para a classe para obter mais informações sobre 
esses métodos.

#### Armazenando arquivos carregados
Para armazenar um arquivo carregado, você normalmente usará um de seus sistemas de arquivos configurados. A classe `UploadedFile` tem um método `store` 
que moverá um arquivo carregado para um de seus discos, que pode ser um local em seu sistema de arquivos ou um local de armazenamento em nuvem como Amazon S3.

O método `store` aceita o caminho onde o arquivo deve ser armazenado em relação ao diretório raiz configurado do sistema de arquivos. Este caminho não 
deve conter um nome de arquivo, pois um ID exclusivo será gerado automaticamente para servir como o nome do arquivo.

O método `store` também aceita um segundo argumento opcional para o nome do disco que deve ser usado para armazenar o arquivo. O método retornará o caminho 
do arquivo relativo à raiz do disco:

```php
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

Se você não quiser que um nome de arquivo seja gerado automaticamente, você pode usar o método `storeAs`, que aceita o caminho, o nome do arquivo e o nome
do disco como seus argumentos:

```php
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

> Para mais informações sobre armazenamento de arquivos no Laravel, verifique a documentação completa de armazenamento de arquivos.


## Configurando proxies confiáveis
Ao executar seus aplicativos atrás de um balanceador de carga que encerra certificados TLS/SSL, você pode perceber que seu aplicativo às vezes 
não gera links HTTPS ao usar o auxiliar `url`. Normalmente, isso ocorre porque o tráfego do seu aplicativo está sendo encaminhado do balanceador de 
carga na porta 80 e não sabe que deve gerar links seguros.

Para resolver isso, você pode usar o middleware `App\Http\Middleware\TrustProxies` que está incluído em seu aplicativo Laravel, que permite a você personalizar
rapidamente os balanceadores de carga ou proxies que devem ser confiáveis para seu aplicativo. Seus proxies confiáveis devem ser listados como uma 
matriz na propriedade `$proxies` deste middleware. Além de configurar os proxies confiáveis, você pode configurar o proxy `$headers` que deve ser confiável:

```php
<?php

namespace App\Http\Middleware;

use Fideloper\Proxy\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
    /**
     * The trusted proxies for this application.
     *
     * @var string|array
     */
    protected $proxies = [
        '192.168.1.1',
        '192.168.1.2',
    ];

    /**
     * The headers that should be used to detect proxies.
     *
     * @var int
     */
    protected $headers = Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO;
}
```

Se você estiver usando o AWS Elastic Load Balancing, seu valor `$headers` deve ser `Request::HEADER_X_FORWARDED_AWS_ELB`. Para obter mais informações 
sobre as constantes que podem ser usadas na propriedade `$headers`, verifique a documentação do Symfony sobre proxies confiáveis.


### Confiar em todos os proxies
Se você estiver usando o Amazon AWS ou outro provedor de balanceador de carga de "nuvem", pode não saber os endereços IP de seus balanceadores reais. 
Nesse caso, você pode usar `*` para confiar em todos os proxies:

```php
/**
 * The trusted proxies for this application.
 *
 * @var string|array
 */
protected $proxies = '*';
```

## Configurando hosts confiáveis
Por padrão, o Laravel irá responder a todas as solicitações que recebe, independentemente do conteúdo do `Host` no cabeçalho da solicitação HTTP . 
Além disso, o valor `Host` do cabeçalho será usado ao gerar URLs absolutos para seu aplicativo durante uma solicitação da web.

Normalmente, você deve configurar seu servidor web, como Nginx ou Apache, para enviar apenas solicitações ao seu aplicativo que correspondam a um 
determinado nome de host. No entanto, se você não tem a capacidade de personalizar seu servidor web diretamente e precisa instruir o Laravel a 
responder apenas a determinados nomes de host, você pode fazer isso habilitando o middleware `App\Http\Middleware\TrustHosts` para sua aplicação.

O middleware `TrustHosts` já está incluído na pilha `$middleware` de seu aplicativo; no entanto, você deve descomentar para que se torne ativo. 
Dentro do métod `hosts` deste middleware , você pode especificar os nomes de host aos quais seu aplicativo deve responder. Solicitações de entrada 
com outros cabeçalhos `Host` de valor serão rejeitadas:

```php
/**
 * Get the host patterns that should be trusted.
 *
 * @return array
 */
public function hosts()
{
    return [
        'laravel.test',
        $this->allSubdomainsOfApplicationUrl(),
    ];
}
```

O método auxiliar `allSubdomainsOfApplicationUrl` retornará uma expressão regular correspondendo a todos os subdomínios do valor `app.url` de configuração
do seu aplicativo. Este método auxiliar fornece uma maneira conveniente de permitir todos os subdomínios do seu aplicativo ao construir um aplicativo que 
utiliza subdomínios curinga.
