# Redirecionamentos de HTTP

<a name="creating-redirects"></a>
## Criar reencaminhamentos

 As respostas de redirecionamento são instâncias da classe `Illuminate\Http\RedirectResponse`, e contêm os cabeçalhos adequados necessários para redirecionar o usuário para outro URL. Há várias maneiras de gerar uma instância de `RedirectResponse`. O método mais simples é usar o auxiliar global `redirect`:

```php
    Route::get('/dashboard', function () {
        return redirect('/home/dashboard');
    });
```

 Às vezes, pode ser necessário redirecionar o usuário para a sua localização anterior, como por exemplo quando um formulário submetido for inválido. Pode fazê-lo utilizando a função de ajuda global `back`. Uma vez que este recurso utiliza as [sessões](/docs/v1/pt-BR/session), certifique-se de que a rota que chama a função `back` utilize o grupo de middleware `web` ou tenha aplicado todo o middleware `session`:

```php
    Route::post('/user/profile', function () {
        // Validate the request...

        return back()->withInput();
    });
```

<a name="redirecting-named-routes"></a>
## Redirecionamento para rotas com nomes

 Quando você chama o helper `redirect` sem parâmetros, uma instância do objeto `Illuminate\Routing\Redirector` é devolvida, permitindo que você chame qualquer método da instância `Redirector`. Por exemplo, para gerar uma resposta `RedirectResponse` para uma rota nomeada, você pode usar o método `route`:

```php
    return redirect()->route('login');
```

 Se sua rota tiver parâmetros, você pode passá-los como o segundo argumento ao método `route`:

```php
    // For a route with the following URI: profile/{id}

    return redirect()->route('profile', ['id' => 1]);
```

 Por conveniência, o Laravel também oferece a função global `to_route`:

```php
    return to_route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### População de parâmetros via modelos da Eloquent

 Se você estiver redirecionando para uma rota com um parâmetro "ID", que está sendo preenchido a partir de um modelo Eloquent, você pode passar o próprio modelo. O ID será extraído automaticamente:

```php
    // For a route with the following URI: profile/{id}

    return redirect()->route('profile', [$user]);
```

 Se você gostaria de personalizar o valor que é colocado no parâmetro de rota, você deve substituir a metodologia `getRouteKey` do seu modelo Eloquent:

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
## Redirecionando para ações de controladores

 Você também pode criar redirecionamentos para ações do [controlador] (/). Para isso, informe o nome do controlador e da ação no método `action`:

```php
    use App\Http\Controllers\HomeController;

    return redirect()->action([HomeController::class, 'index']);
```

 Se a rota do seu controlador exigir parâmetros, você pode passá-los como o segundo argumento para o método `action`:

```php
    return redirect()->action(
        [UserController::class, 'profile'], ['id' => 1]
    );
```

<a name="redirecting-with-flashed-session-data"></a>
## Redirecionamento com dados de sessão exibidos

 O redirecionamento para uma nova URL e o [flash de dados para a sessão](/docs/session#flash-data) são normalmente realizados ao mesmo tempo. Normalmente, isto é feito após ter executado com sucesso uma ação quando flasha uma mensagem de sucesso na sessão. Para maior conveniência, poderá criar uma instância `RedirectResponse` e flashar dados para a sessão num único método fluente:

```php
    Route::post('/user/profile', function () {
        // Update the user's profile...

        return redirect('/dashboard')->with('status', 'Profile updated!');
    });
```

 Você pode usar o método `withInput` fornecido pela instância de `RedirectResponse` para enviar os dados de entrada da solicitação atual para a sessão antes de redirecionar o usuário para um novo local. Depois que os dados de entrada tiverem sido enviados para a sessão, você poderá recuperá-los facilmente durante a próxima solicitação:

```php
    return back()->withInput();
```

 Após encaminhar o usuário para a página desejada, você poderá mostrar uma mensagem exibida no [sessão] (/) utilizando a sintaxe Blade (/docs/blade). Por exemplo:

```blade
    @if (session('status'))
        <div class="alert alert-success">
            {{ session('status') }}
        </div>
    @endif
```
