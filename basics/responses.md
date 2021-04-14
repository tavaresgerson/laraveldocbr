# Criação de Respostas

## Strings & Arrays
Todas as rotas e controladores devem retornar uma resposta a ser enviada de volta ao navegador do usuário. O Laravel oferece várias 
maneiras diferentes de retornar respostas. A resposta mais básica é retornar uma string de uma rota ou controlador. A estrutura irá 
converter automaticamente a string em uma resposta HTTP completa:

```php
Route::get('/', function () {
    return 'Hello World';
});
```

Além de retornar strings de suas rotas e controladores, você também pode retornar matrizes. A estrutura converterá automaticamente a matriz 
em uma resposta JSON:

```php
Route::get('/', function () {
    return [1, 2, 3];
});
```

> Você sabia que também pode retornar coleções do Eloquent de suas rotas ou controladores? Eles serão convertidos automaticamente para JSON. 
> Dê uma chance!

## Objetos de Resposta
Normalmente, você não retornará apenas strings ou matrizes simples de suas ações de rota. Em vez disso, você retornará instâncias
`Illuminate\Http\Response` ou visualizações completas.

Retornar uma instância `Response` completa permite que você personalize o código de status HTTP da resposta e os cabeçalhos. Uma instância `Response`
herda da classe `Symfony\Component\HttpFoundation\Response`, que fornece uma variedade de métodos para construir respostas HTTP:

```php
Route::get('/home', function () {
    return response('Hello World', 200)
                  ->header('Content-Type', 'text/plain');
});
```

#### Modelos e coleções do Eloquent
Você também pode retornar modelos e coleções do Eloquent ORM diretamente de suas rotas e controladores. Ao fazer isso, o Laravel converterá 
automaticamente os modelos e coleções em respostas JSON, respeitando os atributos ocultos do modelo:

```php
use App\Models\User;

Route::get('/user/{user}', function (User $user) {
    return $user;
});
```

### Anexar cabeçalhos às respostas
Lembre-se de que a maioria dos métodos de resposta pode ser encadeada, permitindo a construção fluente de instâncias de resposta. Por exemplo, 
você pode usar o método `header` para adicionar uma série de cabeçalhos à resposta antes de enviá-la de volta ao usuário:

```php
return response($content)
            ->header('Content-Type', $type)
            ->header('X-Header-One', 'Header Value')
            ->header('X-Header-Two', 'Header Value');
```

Ou você pode usar o método `withHeaders` para especificar uma matriz de cabeçalhos a serem adicionados à resposta:

```php
return response($content)
            ->withHeaders([
                'Content-Type' => $type,
                'X-Header-One' => 'Header Value',
                'X-Header-Two' => 'Header Value',
            ]);
```

### Middleware de controle de cache
O Laravel inclui um middleware `cache.headers`, que pode ser usado para definir rapidamente o cabeçalho `Cache-Control` de um grupo de 
rotas. Se `etag` for especificada na lista de diretivas, um hash MD5 do conteúdo da resposta será definido automaticamente como o identificador ETag:

```php
Route::middleware('cache.headers:public;max_age=2628000;etag')->group(function () {
    Route::get('/privacy', function () {
        // ...
    });

    Route::get('/terms', function () {
        // ...
    });
});
```

### Anexando Cookies às Respostas
Você pode anexar um cookie a uma instância `Illuminate\Http\Response` de saída usando o método `cookie`. Você deve passar o nome, o valor e o 
número de minutos em que o cookie deve ser considerado válido para este método:

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes
);
```

O método `cookie` também aceita mais alguns argumentos que são usados com menos frequência. Geralmente, esses argumentos têm o mesmo propósito 
e significado que os argumentos que seriam dados ao método setcookie nativo do PHP:

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
);
```

Se desejar garantir que um cookie seja enviado com a resposta de saída, mas ainda não tiver uma instância dessa resposta, você pode usar a
fachada `Cookie` para "enfileirar" os cookies e para anexar à resposta quando ela for enviada. O método `queue` aceita os argumentos necessários 
para criar uma instância de cookie. Esses cookies serão anexados à resposta de saída antes de ela ser enviada ao navegador:

```php
use Illuminate\Support\Facades\Cookie;

Cookie::queue('name', 'value', $minutes);
```

### Gerando Instâncias de Cookie
Se desejar gerar uma instância `Symfony\Component\HttpFoundation\Cookie` que pode ser anexada a uma instância de resposta posteriormente, 
pode usar o auxiliar global `cookie`. Este cookie não será enviado de volta ao cliente, a menos que seja anexado a uma instância de resposta:

```php
$cookie = cookie('name', 'value', $minutes);

return response('Hello World')->cookie($cookie);
```

### Expirando os cookies mais cedo
Você pode remover um cookie expirando-o por meio do método `withoutCookie` de uma resposta de saída:

```php
return response('Hello World')->withoutCookie('name');
```

Se você ainda não tem uma instância da resposta de saída, pode usar o método Cookieda fachada queuepara expirar um cookie:

```php
Cookie::queue(Cookie::forget('name'));
```

### Cookies e criptografia
Por padrão, todos os cookies gerados pelo Laravel são criptografados e assinados para que não possam ser modificados ou lidos pelo cliente. 
Se desejar desativar a criptografia para um subconjunto de cookies gerados por seu aplicativo, você pode usar a propriedade `$except` do
middleware `App\Http\Middleware\EncryptCookiesmiddleware`, que está localizada no diretório `app/Http/Middleware`:

```php
/**
 * The names of the cookies that should not be encrypted.
 *
 * @var array
 */
protected $except = [
    'cookie_name',
];
```

### Redireciona
As respostas de redirecionamento são instâncias da classe `Illuminate\Http\RedirectResponse` e contêm os cabeçalhos adequados necessários 
para redirecionar o usuário para outro URL. Existem várias maneiras de gerar uma instância `RedirectResponse`. O método mais simples é usar 
o auxiliar global `redirect`:

```php
Route::get('/dashboard', function () {
    return redirect('home/dashboard');
});
```

Às vezes, você pode querer redirecionar o usuário para o local anterior, como quando um formulário enviado é inválido. Você pode fazer isso usando 
a função auxiliar global `back`. Como esse recurso utiliza a sessão, certifique-se de que a rota que chama a função `back` esteja usando o grupo `web` 
de middleware:

```php
Route::post('/user/profile', function () {
    // Validate the request...

    return back()->withInput();
});
```

## Redirecionando para rotas nomeadas
Quando você chama o auxiliar `redirect` sem parâmetros, uma instância de `Illuminate\Routing\Redirector` é retornada, permitindo que você chame 
qualquer método na instância `Redirector`. Por exemplo, para gerar um `RedirectResponse` numa rota nomeada, você pode usar o método `route`:

```php
return redirect()->route('login');
```

Se sua rota tiver parâmetros, você pode passá-los como o segundo argumento para o método `route`:

```php
// For a route with the following URI: /profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

### Preenchendo parâmetros por meio de modelos do Eloquent
Se você está redirecionando para uma rota com um parâmetro "ID" que está sendo preenchido a partir de um modelo do Eloquent, você pode 
passar o próprio modelo. O ID será extraído automaticamente:

```php
// For a route with the following URI: /profile/{id}

return redirect()->route('profile', [$user]);
```

Se desejar personalizar o valor que é colocado no parâmetro de rota, você pode especificar a coluna na definição do parâmetro de rota 
(`/profile/{id:slug}`) ou pode substituir o método `getRouteKey` em seu modelo do Eloquent:

```php
/**
 * Get the value of the model's route key.
 *
 * @return mixed
 */
public function getRouteKey()
{
    return $this->slug;
}
```

### Redirecionando para ações do controlador
Você também pode gerar redirecionamentos para ações do controlador. Para fazer isso, passe o controlador e o nome da ação para o método `action`:

```php
use App\Http\Controllers\UserController;

return redirect()->action([UserController::class, 'index']);
```

Se sua rota de controlador requer parâmetros, você pode passá-los como o segundo argumento para o metodo `action`:

```php
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

### Redirecionando para domínios externos
Às vezes, você pode precisar redirecionar para um domínio fora de seu aplicativo. Você pode fazer isso chamando o método `away`, que cria um 
`RedirectResponse` sem qualquer codificação de URL adicional, validação ou verificação:

```php
return redirect()->away('https://www.google.com');
```

### Redirecionando com dados de sessão atualizados
O redirecionamento para um novo URL e a transferência dos dados para a sessão geralmente são feitos ao mesmo tempo. Normalmente, isso é 
feito após a execução bem-sucedida de uma ação, quando você envia uma mensagem de sucesso para a sessão. Por conveniência, você pode criar uma
instância `RedirectResponse` e dados flash para a sessão em uma única cadeia de métodos fluente:

```php
Route::post('/user/profile', function () {
    // ...

    return redirect('dashboard')->with('status', 'Profile updated!');
});
```

Depois que o usuário é redirecionado, você pode exibir a mensagem instantânea da sessão. Por exemplo, usando a sintaxe Blade:

```php
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

### Redirecionando com entrada
Você pode usar o método `withInputm` fornecido pela instância `RedirectResponse` para atualizar os dados de entrada da solicitação atual para 
a sessão antes de redirecionar o usuário para um novo local. Isso normalmente é feito se o usuário encontrou um erro de validação. Uma vez que 
a entrada foi enviada para a sessão, você pode recuperá-la facilmente durante a próxima solicitação para preencher novamente o formulário:

```php
return back()->withInput();
```

## Outros Tipos de Resposta
O auxiliar `response` pode ser usado para gerar outros tipos de instâncias de resposta. Quando o auxiliar `response` é chamado sem argumentos, 
uma implementação do contrato `Illuminate\Contracts\Routing\ResponseFactory` é retornada. Este contrato fornece vários métodos úteis para gerar 
respostas.

### Ver Respostas
Se você precisa de controle sobre o status e os cabeçalhos da resposta, mas também precisa retornar uma visualização como o conteúdo da resposta, 
você deve usar o método `view`:

```php
return response()
            ->view('hello', $data, 200)
            ->header('Content-Type', $type);
```

Claro, se você não precisa passar um código de status HTTP personalizado ou cabeçalhos personalizados, você pode usar a função auxiliar global `view`.

### Respostas JSON
O método `json` definirá automaticamente o cabeçalho `Content-Type` como `application/json`, bem como converter a matriz fornecida em JSON 
usando a função PHP `json_encode`:

```php
return response()->json([
    'name' => 'Abigail',
    'state' => 'CA',
]);
```

Se desejar criar uma resposta JSONP, você pode usar o método `json` em combinação com o método `withCallback`:

```php
return response()
            ->json(['name' => 'Abigail', 'state' => 'CA'])
            ->withCallback($request->input('callback'));
```

### Downloads de arquivos
O método `download` pode ser usado para gerar uma resposta que força o navegador do usuário a baixar o arquivo no caminho fornecido. 
O método `download` aceita um nome de arquivo como o segundo argumento para o método, que determinará o nome do arquivo que é visto pelo 
usuário que faz o download do arquivo. Finalmente, você pode passar uma matriz de cabeçalhos HTTP como o terceiro argumento para o método:

```php
return response()->download($pathToFile);

return response()->download($pathToFile, $name, $headers);
```

> Symfony HttpFoundation, que gerencia os downloads de arquivos, requer que o arquivo baixado tenha um nome de arquivo ASCII.


### Downloads de streaming
Às vezes, você pode querer transformar a resposta da string de uma determinada operação em uma resposta para download, sem ter que gravar o 
conteúdo da operação no disco. Você pode usar o método `streamDownload` neste cenário. Este método aceita um retorno de chamada, nome de arquivo 
e uma matriz opcional de cabeçalhos como seus argumentos:

```php
use App\Services\GitHub;

return response()->streamDownload(function () {
    echo GitHub::api('repo')
                ->contents()
                ->readme('laravel', 'laravel')['contents'];
}, 'laravel-readme.md');
```

### Respostas de arquivo
O método `file` pode ser usado para exibir um arquivo, como uma imagem ou PDF, diretamente no navegador do usuário, em vez de iniciar um download. 
Este método aceita o caminho para o arquivo como seu primeiro argumento e uma matriz de cabeçalhos como seu segundo argumento:

```php
return response()->file($pathToFile);

return response()->file($pathToFile, $headers);
```

### Macros de Resposta
Se desejar definir uma resposta personalizada que possa ser reutilizada em uma variedade de suas rotas e controladores, você pode usar o método `macro` 
na fachada `Response`. Normalmente, você deve chamar esse método a partir do método `boot` de um dos provedores de serviços do seu aplicativo, como o
provedor de serviços `App\Providers\AppServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Response::macro('caps', function ($value) {
            return Response::make(strtoupper($value));
        });
    }
}
```

A função `macro` aceita um nome como seu primeiro argumento e um encerramento como seu segundo argumento. O fechamento da macro será executado ao 
chamar o nome da macro a partir de uma implementação `ResponseFactory` ou do auxiliar `response`:

```php
return response()->caps('foo');
```
