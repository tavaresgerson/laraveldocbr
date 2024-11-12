# Precognition

<a name="introduction"></a>
## Introdução

O Laravel Precognition permite que você antecipe o resultado de uma futura solicitação HTTP. Um dos principais casos de uso do Precognition é a capacidade de fornecer validação "ao vivo" para seu aplicativo JavaScript frontend sem precisar duplicar as regras de validação de backend do seu aplicativo. O Precognition combina especialmente bem com os [starter kits](/docs/starter-kits) baseados em Inertia do Laravel.

Quando o Laravel recebe uma "solicitação precognitiva", ele executará todo o middleware da rota e resolverá as dependências do controlador da rota, incluindo a validação de [solicitações de formulário](/docs/validation#form-request-validation) - mas não executará realmente o método do controlador da rota.

<a name="live-validation"></a>
## Validação ao vivo

<a name="using-vue"></a>
### Usando o Vue

Usando o Laravel Precognition, você pode oferecer experiências de validação ao vivo para seus usuários sem precisar duplicar suas regras de validação em seu aplicativo Vue frontend. Para ilustrar como funciona, vamos criar um formulário para criar novos usuários em nosso aplicativo.

Primeiro, para habilitar o Precognition para uma rota, o middleware `HandlePrecognitiveRequests` deve ser adicionado à definição da rota. Você também deve criar uma [solicitação de formulário](/docs/validation#form-request-validation) para abrigar as regras de validação da rota:

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

Em seguida, você deve instalar os auxiliares de frontend do Laravel Precognition para Vue via NPM:

```shell
npm install laravel-precognition-vue
```

Com o pacote Laravel Precognition instalado, agora você pode criar um objeto de formulário usando a função `useForm` do Precognition, fornecendo o método HTTP (`post`), a URL de destino (`/users`) e os dados iniciais do formulário.

Então, para habilitar a validação ao vivo, invoque o método `validate` do formulário em cada evento `change` de entrada, fornecendo o nome da entrada:

```vue
<script setup>
import { useForm } from 'laravel-precognition-vue';

const form = useForm('post', '/users', {
    name: '',
    email: '',
});

const submit = () => form.submit();
</script>

<template>
    <form @submit.prevent="submit">
        <label for="name">Name</label>
        <input
            id="name"
            v-model="form.name"
            @change="form.validate('name')"
        />
        <div v-if="form.invalid('name')">
            {{ form.errors.name }}
        </div>

        <label for="email">Email</label>
        <input
            id="email"
            type="email"
            v-model="form.email"
            @change="form.validate('email')"
        />
        <div v-if="form.invalid('email')">
            {{ form.errors.email }}
        </div>

        <button :disabled="form.processing">
            Create User
        </button>
    </form>
</template>
```

Agora, conforme o formulário é preenchido pelo usuário, o Precognition fornecerá uma saída de validação ao vivo alimentada pelas regras de validação na solicitação de formulário da rota. Quando as entradas do formulário forem alteradas, uma solicitação de validação "precognitiva" debounced será enviada ao seu aplicativo Laravel. Você pode configurar o tempo limite de debounce chamando a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

Quando uma solicitação de validação estiver em andamento, a propriedade `validating` do formulário será `true`:

```html
<div v-if="form.validating">
    Validating...
</div>
```

Quaisquer erros de validação retornados durante uma solicitação de validação ou um envio de formulário preencherão automaticamente o objeto `errors` do formulário:

```html
<div v-if="form.invalid('email')">
    {{ form.errors.email }}
</div>
```

Você pode determinar se o formulário tem algum erro usando a propriedade `hasErrors` do formulário:

```html
<div v-if="form.hasErrors">
    <!-- ... -->
</div>
```

Você também pode determinar se uma entrada passou ou falhou na validação passando o nome da entrada para as funções `valid` e `invalid` do formulário, respectivamente:

```html
<span v-if="form.valid('email')">
    ✅
</span>

<span v-else-if="form.invalid('email')">
    ❌
</span>
```

::: warning AVISO
> Uma entrada de formulário só aparecer como válido ou inválido depois que ele for alterado e uma resposta de validação for recebida.

Se você estiver validando um subconjunto de entradas de um formulário com Precognition, pode ser útil limpar erros manualmente. Você pode usar a função `forgetError` do formulário para fazer isso:

```html
<input
    id="avatar"
    type="file"
    @change="(e) => {
        form.avatar = e.target.files[0]

        form.forgetError('avatar')
    }"
>
```

Claro, você também pode executar código em reação à resposta ao envio do formulário. A função `submit` do formulário retorna uma promessa de solicitação do Axios. Isso fornece uma maneira conveniente de acessar a carga útil da resposta, redefinir as entradas do formulário em um envio bem-sucedido ou lidar com uma solicitação com falha:

```js
const submit = () => form.submit()
    .then(response => {
        form.reset();

        alert('User created.');
    })
    .catch(error => {
        alert('An error occurred.');
    });
```

Você pode determinar se uma solicitação de envio de formulário está em andamento inspecionando a propriedade `processing` do formulário:

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="using-vue-and-inertia"></a>
### Usando Vue e Inertia

::: info NOTA
Se você quiser uma vantagem inicial ao desenvolver seu aplicativo Laravel com Vue e Inertia, considere usar um dos nossos [kits iniciais](/docs/starter-kits). Os kits iniciais do Laravel fornecem andaimes de autenticação de backend e frontend para seu novo aplicativo Laravel.
:::

Antes de usar o Precognition com Vue e Inertia, certifique-se de revisar nossa documentação geral sobre [usando o Precognition com Vue](#using-vue). Ao usar o Vue com Inertia, você precisará instalar a biblioteca Precognition compatível com Inertia via NPM:

```shell
npm install laravel-precognition-vue-inertia
```

Uma vez instalada, a função `useForm` do Precognition retornará um [form helper](https://inertiajs.com/forms#form-helper) do Inertia aumentado com os recursos de validação discutidos acima.

O método `submit` do auxiliar de formulário foi simplificado, removendo a necessidade de especificar o método HTTP ou URL. Em vez disso, você pode passar as [opções de visita](https://inertiajs.com/manual-visits) do Inertia como o primeiro e único argumento. Além disso, o método `submit` não retorna uma Promise como visto no exemplo do Vue acima. Em vez disso, você pode fornecer qualquer um dos [retornos de chamada de evento](https://inertiajs.com/manual-visits#event-callbacks) suportados pelo Inertia nas opções de visita fornecidas ao método `submit`:

```vue
<script setup>
import { useForm } from 'laravel-precognition-vue-inertia';

const form = useForm('post', '/users', {
    name: '',
    email: '',
});

const submit = () => form.submit({
    preserveScroll: true,
    onSuccess: () => form.reset(),
});
</script>
```

<a name="using-react"></a>
### Usando React

Usando o Laravel Precognition, você pode oferecer experiências de validação ao vivo para seus usuários sem ter que duplicar suas regras de validação em seu aplicativo React frontend. Para ilustrar como funciona, vamos construir um formulário para criar novos usuários em nosso aplicativo.

Primeiro, para habilitar o Precognition para uma rota, o middleware `HandlePrecognitiveRequests` deve ser adicionado à definição da rota. Você também deve criar uma [solicitação de formulário](/docs/validation#form-request-validation) para abrigar as regras de validação da rota:

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

Em seguida, você deve instalar os auxiliares de frontend do Laravel Precognition para React via NPM:

```shell
npm install laravel-precognition-react
```

Com o pacote Laravel Precognition instalado, agora você pode criar um objeto de formulário usando a função `useForm` do Precognition, fornecendo o método HTTP (`post`), a URL de destino (`/users`) e os dados iniciais do formulário.

Para habilitar a validação ao vivo, você deve ouvir os eventos `change` e `blur` de cada entrada. No manipulador de eventos `change`, você deve definir os dados do formulário com a função `setData`, passando o nome da entrada e o novo valor. Então, no manipulador de eventos `blur`, invoque o método `validate` do formulário, fornecendo o nome da entrada:

```jsx
import { useForm } from 'laravel-precognition-react';

export default function Form() {
    const form = useForm('post', '/users', {
        name: '',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        form.submit();
    };

    return (
        <form onSubmit={submit}>
            <label for="name">Name</label>
            <input
                id="name"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                onBlur={() => form.validate('name')}
            />
            {form.invalid('name') && <div>{form.errors.name}</div>}

            <label for="email">Email</label>
            <input
                id="email"
                value={form.data.email}
                onChange={(e) => form.setData('email', e.target.value)}
                onBlur={() => form.validate('email')}
            />
            {form.invalid('email') && <div>{form.errors.email}</div>}

            <button disabled={form.processing}>
                Create User
            </button>
        </form>
    );
};
```

Agora, conforme o formulário é preenchido pelo usuário, o Precognition fornecerá uma saída de validação ao vivo alimentada pelas regras de validação na solicitação do formulário da rota. Quando as entradas do formulário forem alteradas, uma solicitação de validação "precognitive" debounced será enviada ao seu aplicativo Laravel. Você pode configurar o tempo limite de debounce chamando a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

Quando uma solicitação de validação estiver em andamento, a propriedade `validating` do formulário será `true`:

```jsx
{form.validating && <div>Validating...</div>}
```

Quaisquer erros de validação retornados durante uma solicitação de validação ou um envio de formulário preencherão automaticamente o objeto `errors` do formulário:

```jsx
{form.invalid('email') && <div>{form.errors.email}</div>}
```

Você pode determinar se o formulário tem algum erro usando a propriedade `hasErrors` do formulário:

```jsx
{form.hasErrors && <div><!-- ... --></div>}
```

Você também pode determinar se uma entrada passou ou falhou na validação passando o nome da entrada para as funções `valid` e `invalid` do formulário, respectivamente:

```jsx
{form.valid('email') && <span>✅</span>}

{form.invalid('email') && <span>❌</span>}
```

::: warning AVISO
> Uma entrada de formulário só aparecem como válidos ou inválidos depois que são alterados e uma resposta de validação é recebida.

Se você estiver validando um subconjunto de entradas de um formulário com Precognition, pode ser útil limpar erros manualmente. Você pode usar a função `forgetError` do formulário para fazer isso:

```jsx
<input
    id="avatar"
    type="file"
    onChange={(e) => 
        form.setData('avatar', e.target.value);

        form.forgetError('avatar');
    }
>
```

Claro, você também pode executar código em reação à resposta ao envio do formulário. A função `submit` do formulário retorna uma promessa de solicitação do Axios. Isso fornece uma maneira conveniente de acessar a carga útil da resposta, redefinir as entradas do formulário em um envio de formulário bem-sucedido ou lidar com uma solicitação com falha:

```js
const submit = (e) => {
    e.preventDefault();

    form.submit()
        .then(response => {
            form.reset();

            alert('User created.');
        })
        .catch(error => {
            alert('An error occurred.');
        });
};
```

Você pode determinar se uma solicitação de envio de formulário está em andamento inspecionando a propriedade `processing` do formulário:

```html
<button disabled={form.processing}>
    Submit
</button>
```

<a name="using-react-and-inertia"></a>
### Usando React e Inertia

::: info NOTA
Se você quiser uma vantagem inicial ao desenvolver seu aplicativo Laravel com React e Inertia, considere usar um dos nossos [kits iniciais](/docs/starter-kits). Os kits iniciais do Laravel fornecem andaimes de autenticação de backend e frontend para seu novo aplicativo Laravel.
:::

Antes de usar o Precognition com React e Inertia, certifique-se de revisar nossa documentação geral sobre [usando o Precognition com React](#using-react). Ao usar o React com Inertia, você precisará instalar a biblioteca Precognition compatível com Inertia via NPM:

```shell
npm install laravel-precognition-react-inertia
```

Uma vez instalada, a função `useForm` do Precognition retornará um [form helper](https://inertiajs.com/forms#form-helper) do Inertia aumentado com os recursos de validação discutidos acima.

O método `submit` do auxiliar de formulário foi simplificado, removendo a necessidade de especificar o método HTTP ou URL. Em vez disso, você pode passar as [opções de visita](https://inertiajs.com/manual-visits) do Inertia como o primeiro e único argumento. Além disso, o método `submit` não retorna uma Promise como visto no exemplo React acima. Em vez disso, você pode fornecer qualquer um dos [retornos de chamada de evento](https://inertiajs.com/manual-visits#event-callbacks) suportados pelo Inertia nas opções de visita fornecidas ao método `submit`:

```js
import { useForm } from 'laravel-precognition-react-inertia';

const form = useForm('post', '/users', {
    name: '',
    email: '',
});

const submit = (e) => {
    e.preventDefault();

    form.submit({
        preserveScroll: true,
        onSuccess: () => form.reset(),
    });
};
```

<a name="using-alpine"></a>
### Usando Alpine e Blade

Usando o Laravel Precognition, você pode oferecer experiências de validação ao vivo para seus usuários sem ter que duplicar suas regras de validação em seu aplicativo Alpine frontend. Para ilustrar como funciona, vamos construir um formulário para criar novos usuários em nosso aplicativo.

Primeiro, para habilitar o Precognition para uma rota, o middleware `HandlePrecognitiveRequests` deve ser adicionado à definição da rota. Você também deve criar uma [solicitação de formulário](/docs/validation#form-request-validation) para abrigar as regras de validação da rota:

```php
use App\Http\Requests\CreateUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (CreateUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

Em seguida, você deve instalar os auxiliares de frontend do Laravel Precognition para Alpine via NPM:

```shell
npm install laravel-precognition-alpine
```

Então, registre o plugin Precognition com Alpine no seu arquivo `resources/js/app.js`:

```js
import Alpine from 'alpinejs';
import Precognition from 'laravel-precognition-alpine';

window.Alpine = Alpine;

Alpine.plugin(Precognition);
Alpine.start();
```

Com o pacote Laravel Precognition instalado e registrado, agora você pode criar um objeto de formulário usando a "mágica" `$form` do Precognition, fornecendo o método HTTP (`post`), a URL de destino (`/users`) e os dados iniciais do formulário.

Para habilitar a validação ao vivo, você deve vincular os dados do formulário à sua entrada relevante e, em seguida, ouvir o evento `change` de cada entrada. No manipulador de eventos `change`, você deve invocar o método `validate` do formulário, fornecendo o nome da entrada:

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '',
        email: '',
    }),
}">
    @csrf
    <label for="name">Name</label>
    <input
        id="name"
        name="name"
        x-model="form.name"
        @change="form.validate('name')"
    />
    <template x-if="form.invalid('name')">
        <div x-text="form.errors.name"></div>
    </template>

    <label for="email">Email</label>
    <input
        id="email"
        name="email"
        x-model="form.email"
        @change="form.validate('email')"
    />
    <template x-if="form.invalid('email')">
        <div x-text="form.errors.email"></div>
    </template>

    <button :disabled="form.processing">
        Create User
    </button>
</form>
```

Agora, conforme o formulário é preenchido pelo usuário, o Precognition fornecerá uma saída de validação ao vivo alimentada pelas regras de validação na solicitação do formulário da rota. Quando as entradas do formulário forem alteradas, uma solicitação de validação "precognitiva" debounced será enviada ao seu aplicativo Laravel. Você pode configurar o tempo limite de debounce chamando a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

Quando uma solicitação de validação estiver em andamento, a propriedade `validating` do formulário será `true`:

```html
<template x-if="form.validating">
    <div>Validating...</div>
</template>
```

Quaisquer erros de validação retornados durante uma solicitação de validação ou um envio de formulário preencherão automaticamente o objeto `errors` do formulário:

```html
<template x-if="form.invalid('email')">
    <div x-text="form.errors.email"></div>
</template>
```

Você pode determinar se o formulário tem algum erro usando a propriedade `hasErrors` do formulário:

```html
<template x-if="form.hasErrors">
    <div><!-- ... --></div>
</template>
```

Você também pode determinar se uma entrada passou ou falhou na validação passando o nome da entrada para as funções `valid` e `invalid` do formulário, respectivamente:

```html
<template x-if="form.valid('email')">
    <span>✅</span>
</template>

<template x-if="form.invalid('email')">
    <span>❌</span>
</template>
```

> [!WARNING]
> Uma entrada de formulário só aparecerá como válida ou inválida depois que for alterada e uma resposta de validação for recebida.

Você pode determinar se uma solicitação de envio de formulário está em andamento inspecionando a propriedade `processing` do formulário:

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="repopulating-old-form-data"></a>
#### Repopulating Old Form Data

No exemplo de criação de usuário discutido acima, estamos usando o Precognition para executar a validação ao vivo; no entanto, estamos executando um envio de formulário tradicional do lado do servidor para enviar o formulário. Portanto, o formulário deve ser preenchido com qualquer entrada "antiga" e erros de validação retornados do envio do formulário do lado do servidor:

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '{{ old('name') }}',
        email: '{{ old('email') }}',
    }).setErrors({{ Js::from($errors->messages()) }}),
}">
```

Alternativamente, se você quiser enviar o formulário via XHR, pode usar a função `submit` do formulário, que retorna uma promessa de solicitação do Axios:

```html
<form 
    x-data="{
        form: $form('post', '/register', {
            name: '',
            email: '',
        }),
        submit() {
            this.form.submit()
                .then(response => {
                    form.reset();

                    alert('User created.')
                })
                .catch(error => {
                    alert('An error occurred.');
                });
        },
    }"
    @submit.prevent="submit"
>
```

<a name="configuring-axios"></a>
### Configurando o Axios

As bibliotecas de validação do Precognition usam o cliente HTTP [Axios](https://github.com/axios/axios) para enviar solicitações ao backend do seu aplicativo. Para sua conveniência, a instância do Axios pode ser personalizada se necessário pelo seu aplicativo. Por exemplo, ao usar a biblioteca `laravel-precognition-vue`, você pode adicionar cabeçalhos de solicitação adicionais a cada solicitação de saída no arquivo `resources/js/app.js` do seu aplicativo:

```js
import { client } from 'laravel-precognition-vue';

client.axios().defaults.headers.common['Authorization'] = authToken;
```

Ou, se você já tiver uma instância do Axios configurada para seu aplicativo, você pode dizer ao Precognition para usar essa instância:

```js
import Axios from 'axios';
import { client } from 'laravel-precognition-vue';

window.axios = Axios.create()
window.axios.defaults.headers.common['Authorization'] = authToken;

client.use(window.axios)
```

::: warning AVISO
As bibliotecas do Precognition com sabor Inertia usarão apenas a instância configurada do Axios para solicitações de validação. Os envios de formulários sempre serão enviados pelo Inertia.
:::

<a name="customizing-validation-rules"></a>
## Personalizando regras de validação

É possível personalizar as regras de validação executadas durante uma solicitação precognitiva usando o método `isPrecognitive` da solicitação.

Por exemplo, em um formulário de criação de usuário, podemos querer validar que uma senha é "descomprometida" apenas no envio final do formulário. Para solicitações de validação precognitiva, simplesmente validaremos que a senha é necessária e tem no mínimo 8 caracteres. Usando o método `isPrecognitive`, podemos personalizar as regras definidas por nossa solicitação de formulário:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Obtenha as regras de validação que se aplicam à solicitação.
     *
     * @return array
     */
    protected function rules()
    {
        return [
            'password' => [
                'required',
                $this->isPrecognitive()
                    ? Password::min(8)
                    : Password::min(8)->uncompromised(),
            ],
            // ...
        ];
    }
}
```

<a name="handling-file-uploads"></a>
## Lidando com uploads de arquivos

Por padrão, o Laravel Precognition não carrega ou valida arquivos durante uma solicitação de validação precognitiva. Isso garante que arquivos grandes não sejam carregados desnecessariamente várias vezes.

Por causa desse comportamento, você deve garantir que seu aplicativo [personalize as regras de validação da solicitação de formulário correspondente](#customizing-validation-rules) para especificar que o campo é necessário apenas para envios de formulário completos:

```php
/**
 * Obtenha as regras de validação que se aplicam à solicitação.
 *
 * @return array
 */
protected function rules()
{
    return [
        'avatar' => [
            ...$this->isPrecognitive() ? [] : ['required'],
            'image',
            'mimes:jpg,png',
            'dimensions:ratio=3/2',
        ],
        // ...
    ];
}
```

Se você quiser incluir arquivos em cada solicitação de validação, você pode invocar a função `validateFiles` na sua instância de formulário do lado do cliente:

```js
form.validateFiles();
```

<a name="managing-side-effects"></a>
## Gerenciando efeitos colaterais

Ao adicionar o middleware `HandlePrecognitiveRequests` a uma rota, você deve considerar se há algum efeito colateral em _outro_ middleware que deve ser ignorado durante uma solicitação precognitiva.

Por exemplo, você pode ter um middleware que incrementa o número total de "interações" que cada usuário tem com seu aplicativo, mas você pode não querer que solicitações precognitivas sejam contadas como uma interação. Para fazer isso, podemos verificar o método `isPrecognitive` da solicitação antes de incrementar a contagem de interações:

```php
<?php

namespace App\Http\Middleware;

use App\Facades\Interaction;
use Closure;
use Illuminate\Http\Request;

class InteractionMiddleware
{
    /**
     * Lidar com uma solicitação recebida.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        if (! $request->isPrecognitive()) {
            Interaction::incrementFor($request->user());
        }

        return $next($request);
    }
}
```

<a name="testing"></a>
## Testing

Se você quiser fazer solicitações precognitivas em seus testes, o `TestCase` do Laravel inclui um auxiliar `withPrecognition` que adicionará o cabeçalho de solicitação `Precognition`.

Além disso, se você quiser afirmar que uma solicitação precognitiva foi bem-sucedida, por exemplo, não retornou nenhum erro de validação, você pode usar o método `assertSuccessfulPrecognition` na resposta:

::: code-group
```php [Pest]
it('validates registration form with precognition', function () {
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();

    expect(User::count())->toBe(0);
});
```

```php [PHPUnit]
public function test_it_validates_registration_form_with_precognition()
{
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();
    $this->assertSame(0, User::count());
}
```
:::
