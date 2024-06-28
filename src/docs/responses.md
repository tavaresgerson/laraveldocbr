# Respostas da HTTP

<a name="creating-responses"></a>
## Criando respostas

<a name="strings-arrays"></a>
#### Strings e Matrizes

 Todos os rotas e controladores devem retornar uma resposta para ser enviada de volta ao navegador do usuário. O Laravel fornece várias maneiras diferentes de retornar respostas. A resposta mais básica é retornar uma string de uma rota ou controller. O framework converterá automaticamente a string em uma resposta completa HTTP:

```php
    Route::get('/', function () {
        return 'Hello World';
    });
```

 Além de retornar strings das rotas e controladores, você também poderá retornar matrizes. O framework converte automaticamente a matriz em um arquivo de resposta JSON:

```php
    Route::get('/', function () {
        return [1, 2, 3];
    });
```

 > [!ATENÇÃO]
 [Coleções Eloquentes](/docs/eloquent-collections) em seus roteadores ou controladores? Elas serão automaticamente convertidas para JSON. Experimente!

<a name="response-objects"></a>
#### Objetos de resposta

 Normalmente, você não estará retornando apenas string simples ou matrizes de suas ações de rota. Em vez disso, você estará retornando instâncias completas do `Illuminate\Http\Response` ou [visualizações](/docs/views).

 O retorno de uma instância completa do tipo `Response` permite personalizar o código de estado HTTP e as cabeçalhos da resposta. Uma instância do tipo `Response` herda do tipo `Symfony\Component\HttpFoundation\Response`, que fornece vários métodos para a construção de respostas HTTP:

```php
    Route::get('/home', function () {
        return response('Hello World', 200)
                      ->header('Content-Type', 'text/plain');
    });
```

<a name="eloquent-models-and-collections"></a>
#### Modelos e coleções eloqüentes

 Você também pode retornar os modelos e coleções de [Eloquent ORM](/docs/eloquent) diretamente dos seus roteadores e controladores. Quando o fizer, o Laravel converterá automaticamente os modelos e as coleções para respostas JSON enquanto respeita os atributos ocultados do modelo:

```php
    use App\Models\User;

    Route::get('/user/{user}', function (User $user) {
        return $user;
    });
```

<a name="attaching-headers-to-responses"></a>
### Anexando cabeçalhos às respostas

 Tenha em mente que a maioria dos métodos de resposta são acionáveis permitindo uma construção fluida de instâncias de respostas. Por exemplo, você pode usar o método `header` para adicionar uma série de cabeçalhos à sua resposta antes de enviá-la ao usuário:

```php
    return response($content)
                ->header('Content-Type', $type)
                ->header('X-Header-One', 'Header Value')
                ->header('X-Header-Two', 'Header Value');
```

 Alternativamente, você pode usar o método `withHeaders` para especificar um array de cabeçalhos que serão adicionados à resposta:

```php
    return response($content)
                ->withHeaders([
                    'Content-Type' => $type,
                    'X-Header-One' => 'Header Value',
                    'X-Header-Two' => 'Header Value',
                ]);
```

<a name="cache-control-middleware"></a>
#### Middleware de controlo de cache

 O Laravel inclui um middleware chamado `cache.headers`, que pode ser usado para definir rapidamente a diretiva `Cache-Control` para um grupo de rotas. As directivas devem ser fornecidas utilizando o equivalente "caixa baixa" da correspondente diretiva de cache-control e separadas por vírgula. Se a palavra "etag" estiver especificada na lista de diretivas, um hash MD5 do conteúdo da resposta será automaticamente definido como o identificador ETag:

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

<a name="attaching-cookies-to-responses"></a>
### Anexação de cookies em respostas

 É possível anexar um cookie à uma instância `Illuminate\Http\Response` de saída utilizando o método `cookie`. Deve ser passado ao método o nome, valor e número de minutos durante os quais o cookie deve ser considerado válido:

```php
    return response('Hello World')->cookie(
        'name', 'value', $minutes
    );
```

 O método `cookie` também aceita alguns argumentos que são menos usados. Normalmente, esses argumentos têm o mesmo propósito e significado dos argumentos passados ao [método nativo de PHP setcookie](https://secure.php.net/manual/en/function.setcookie.php):

```php
    return response('Hello World')->cookie(
        'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
    );
```

 Se desejar garantir que um cookie seja enviado com a resposta, mas ainda não tiver uma instância dessa resposta, poderá utilizar a faceta `Cookie` para "enviar" cookies para anexação à resposta quando esta for enviada. O método `queue` aceita os argumentos necessários para criar uma instância de cookie. Esses cookies serão anexados à resposta antes de serem enviados ao navegador:

```php
    use Illuminate\Support\Facades\Cookie;

    Cookie::queue('name', 'value', $minutes);
```

<a name="generating-cookie-instances"></a>
#### Gerar instâncias de cookie

 Se você deseja gerar uma instância de `Symfony\Component\HttpFoundation\Cookie`, que pode ser anexada a uma instância de resposta posteriormente, poderá utilizar o helper global `cookie`. Este cookie não será enviado de volta ao cliente se não estiver anexado a uma instância de resposta:

```php
    $cookie = cookie('name', 'value', $minutes);

    return response('Hello World')->cookie($cookie);
```

<a name="expiring-cookies-early"></a>
#### Expiração precoce de cookies

 Você pode excluir um cookie ao expirá-lo por meio do método `withoutCookie` de uma resposta enviada:

```php
    return response('Hello World')->withoutCookie('name');
```

 Se você ainda não tiver uma instância da resposta de saída, pode usar o método `expire` da fachada `Cookie` para expirar um cookie:

```php
    Cookie::expire('name');
```

<a name="cookies-and-encryption"></a>
### Cookies e Criptografia

 Por padrão, devido ao middleware Illuminate\Cookie\Middleware\EncryptCookies, todos os cookies gerados pelo Laravel são encriptados e assinados para que não possam ser lidos ou modificados por um cliente. Se desejar inabilitar a encriptação para um subconjunto de cookies gerado pela aplicação, pode utilizar o método encryptCookies no ficheiro bootstrap/app.php da aplicação:

```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: [
            'cookie_name',
        ]);
    })
```

<a name="redirects"></a>
## Reencaminhamentos

 As respostas de redirecionamento são exemplos da classe `Illuminate\Http\RedirectResponse` e contêm os cabeçalhos necessários para redirecionar o usuário para outro URL. Existem várias maneiras de gerar uma instância `RedirectResponse`. O método mais simples é usar a ajuda global `redirect`:

```php
    Route::get('/dashboard', function () {
        return redirect('home/dashboard');
    });
```

 Às vezes, pode desejar redirecionar o utilizador para a página que o visitou anteriormente, por exemplo, quando um formulário submetido não for válido. Para tal, utilize a função auxiliar global `back`. Uma vez que esta funcionalidade utiliza a sessão, certifique-se de que a rota que chama a função `back` utiliza o grupo de middlewares `web`:

```php
    Route::post('/user/profile', function () {
        // Validate the request...

        return back()->withInput();
    });
```

<a name="redirecting-named-routes"></a>
### Redirecionamento para rotas com nome

 Se chamar o helper `redirect` sem parâmetros, uma instância do `Illuminate\Routing\Redirector` é devolvida. Você pode chamar qualquer método desta instância. Por exemplo, para gerar uma resposta de redirecionamento para uma rota com nome, você pode usar o método `route`:

```php
    return redirect()->route('login');
```

 Se o seu caminho tiver parâmetros, você pode passá-los como segundo argumento ao método `route`:

```php
    // For a route with the following URI: /profile/{id}

    return redirect()->route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### População de Parâmetros por Meio de Modelos Eloquent

 Se você estiver sendo redirecionado para uma rota com um parâmetro "ID", que esteja sendo preenchido a partir de um modelo Eloquent, pode ser enviado o próprio modelo. O ID será extraído automaticamente:

```php
    // For a route with the following URI: /profile/{id}

    return redirect()->route('profile', [$user]);
```

 Se você quiser personalizar o valor que é colocado no parâmetro de rota, pode especificar a coluna na definição do parâmetro da rota (`/profile/{id:slug}`) ou substituir a chave da rota da sua classe Eloquent.

```php
    /**
     * Get the value of the model's route key.
     */
    public function getRouteKey(): mixed
    {
        return $this->slug;
    }
```

<a name="redirecting-controller-actions"></a>
### Redirecionamento para ações de controlador

 Você também pode gerar redirecionamentos para ações do [controlador] (/ docs/ controllers). Para fazer isso, passe o nome do controlador e da ação ao método "action":

```php
    use App\Http\Controllers\UserController;

    return redirect()->action([UserController::class, 'index']);
```

 Se o roteamento do seu controlador exigir parâmetros, você pode passá-los como segundo argumento ao método `action`:

```php
    return redirect()->action(
        [UserController::class, 'profile'], ['id' => 1]
    );
```

<a name="redirecting-external-domains"></a>
### Redirecionamento para domínios externos

 Às vezes é necessário redirecionar para um domínio fora da aplicação. Para fazer isso, você deve chamar o método `away`, que cria uma resposta de redirecionamento sem nenhuma codificação adicional, validação ou verificação:

```php
    return redirect()->away('https://www.google.com');
```

<a name="redirecting-with-flashed-session-data"></a>
### Redirecionamento com dados de sessão carregados

 Geralmente, o redirecionamento para uma nova URL e o flash de dados à sessão (/docs/session#flash-data) são feitos simultaneamente. Normalmente, isto é feito após a realização com sucesso de uma ação quando se envia um aviso de êxito à sessão. Para mais conveniência, você pode criar uma instância `RedirectResponse` e flasher os dados à sessão em uma única cadeia de métodos fluentes:

```php
    Route::post('/user/profile', function () {
        // ...

        return redirect('dashboard')->with('status', 'Profile updated!');
    });
```

 Após o redirecionamento do usuário, você pode exibir a mensagem exibida na [sessão](/docs/session). Por exemplo, utilizando a [syntaxe Blade](https://laravel.com/docs/5.3/blade):

```php
    @if (session('status'))
        <div class="alert alert-success">
            {{ session('status') }}
        </div>
    @endif
```

<a name="redirecting-with-input"></a>
#### Redirecionamento com entrada

 Você pode usar o método `withInput`, fornecido pela instância de `RedirectResponse` para transferir os dados de entrada do pedido atual para a sessão antes de redirecionar o usuário para um novo local. Isso é normalmente feito se o usuário encontrou um erro de validação. Uma vez que os dados da entrada tenham sido transferidos para a sessão, você pode recuperá-los facilmente [durante o próximo pedido](/docs/requests#retrieving-old-input) para repopular o formulário:

```php
    return back()->withInput();
```

<a name="other-response-types"></a>
## Outros tipos de resposta

 O `helper response` pode ser usado para gerar outros tipos de instâncias de resposta. Quando o `helper response` é chamado sem argumentos, uma implementação do contrato `Illuminate\Contracts\Routing\ResponseFactory` é retornada. Esse contrato fornece vários métodos úteis para gerar respostas.

<a name="view-responses"></a>
### Visualizar respostas

 Se você precisar de controle sobre o status da resposta e das cabeçalhos, mas também quiser retornar um [visualização](/docs/views) como conteúdo de resposta, você deve usar o método `view`:

```php
    return response()
                ->view('hello', $data, 200)
                ->header('Content-Type', $type);
```

 Naturalmente, se você não precisa passar um código de status ou cabeçalhos personalizados da web, é possível usar a função de ajuda global `view`.

<a name="json-responses"></a>
### Respostas em formato JSON

 O método `json` definirá automaticamente a cabeçalho `Content-Type` como `application/json`, além de converter o array fornecido para um formato JSON usando a função PHP `json_encode`:

```php
    return response()->json([
        'name' => 'Abigail',
        'state' => 'CA',
    ]);
```

 Se desejar criar uma resposta JSONP, pode utilizar o método `json` em combinação com o método `withCallback`:

```php
    return response()
                ->json(['name' => 'Abigail', 'state' => 'CA'])
                ->withCallback($request->input('callback'));
```

<a name="file-downloads"></a>
### Downloads de arquivos

 O método `download` pode ser usado para gerar uma resposta que force o navegador do utilizador a fazer o download do ficheiro no caminho especificado. O segundo argumento do método aceita um nome de arquivo, que determinará qual é o nome apresentado ao utilizador quando este faz o download do ficheiro. Por último, pode ser passado uma matriz de cabeçalhos HTTP como o terceiro argumento:

```php
    return response()->download($pathToFile);

    return response()->download($pathToFile, $name, $headers);
```

 > [!AVISO]
 > O Symfony HttpFoundation, que gere transferências de ficheiros, exige que o nome dos ficheiros a serem baixados seja um nome de arquivo ASCII.

<a name="streamed-downloads"></a>
#### Transmissões de download

 Às vezes você pode querer transformar o retorno da string de uma operação em um download, sem ter que escrever o conteúdo da operação no disco. Nesse caso, você pode usar a método `streamDownload`. Este método aceita um callback, o nome do arquivo e um array opcional de cabeçalhos como argumentos:

```php
    use App\Services\GitHub;

    return response()->streamDownload(function () {
        echo GitHub::api('repo')
                    ->contents()
                    ->readme('laravel', 'laravel')['contents'];
    }, 'laravel-readme.md');
```

<a name="file-responses"></a>
### Respostas de Arquivo

 O método `file` pode ser utilizado para exibir um arquivo como uma imagem ou PDF diretamente no navegador do usuário, em vez de iniciar o download. Esse método aceita o caminho absoluto do arquivo como primeiro argumento e um array de cabeçalhos como segundo argumento:

```php
    return response()->file($pathToFile);

    return response()->file($pathToFile, $headers);
```

<a name="response-macros"></a>
## Macro de Resposta

 Se desejar definir uma resposta personalizada que possa reutilizar em vários de seus rotas e controladores, você pode usar o método `macro` na interface `Response`. Normalmente, é necessário chamar esse método no método `boot` de um dos provedores do seu aplicativo, como o provedor de serviços `App\Providers\AppServiceProvider`:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Response;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            Response::macro('caps', function (string $value) {
                return Response::make(strtoupper($value));
            });
        }
    }
```

 A função `macro` aceita um nome como seu primeiro argumento e uma cláusula de encerramento como o segundo argumento. A cláusula da macro será executada ao chamar o nome da macro a partir de uma implementação do `ResponseFactory` ou o auxílio `response`:

```php
    return response()->caps('foo');
```
