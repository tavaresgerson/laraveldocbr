# Precognição

<a name="introduction"></a>
## Introdução

 O recurso de Anticipação do Laravel permite que você antecipe o resultado de uma solicitação futura HTTP. Um dos principais casos de uso é a capacidade de fornecer validação "ao vivo" para seu aplicativo JavaScript front-end sem precisar duplicar as regras de validação do back-end do aplicativo. O recurso de Anticipação combina muito bem com os [estilos iniciais](/docs/{{ version}}/starter-kits) baseados em Inertia do Laravel.

 Quando o Laravel recebe uma "solicitação precognitiva", ele executará todos os middlewares da rota e resolverá as dependências do controlador da rota, incluindo a validação de solicitações [de formulário](/docs/validation#form-request-validation) - mas não executará realmente o método do controlador da rota.

<a name="live-validation"></a>
## Validação em Tempo Real

<a name="using-vue"></a>
### Usando o Vue

 Usando o Laravel Precognition, você poderá oferecer experiências de validação ao vivo aos seus usuários sem a necessidade de duplicar suas regras de validação em sua aplicação Vue frontend. Para ilustrar como isso funciona, vamos construir um formulário para criação de novos usuários dentro da nossa aplicação.

 Primeiro, para habilitar Precognition em uma rota, o middleware `HandlePrecognitiveRequests` deve ser adicionado à definição da rota. Você também deverá criar um [pedido com formulário](/docs/validation#form-request-validation) para armazenar as regras de validação da rota:

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

 Em seguida, você deverá instalar os helpers para o front-end do Laravel Precognition por meio do NPM:

```shell
npm install laravel-precognition-vue
```

 Com o pacote Laravel Precognition instalado, você pode criar um objeto de formulário usando a função `useForm` do Precognition, fornecendo o método HTTP (`post`), a URL de destino (/) e os dados iniciais do formulário.

 Em seguida, para habilitar validação em tempo real, invoca o método `validate` do formulário no evento de alteração da entrada, fornecendo o nome da entrada:

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

 Agora que o formulário é preenchido pelo usuário, Precognition fornecerá uma saída de validação ao vivo com base nas regras de validação do pedido do formulário da rota. Quando os dados do formulário forem alterados, um pedido de validação "precognitiva" retardada será enviado para a aplicação Laravel. Você pode configurar o tempo limite de retardo chamando a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

 Quando um pedido de validação estiver em andamento, a propriedade `validating` do formulário será definida como `verdadeira`:

```html
<div v-if="form.validating">
    Validating...
</div>
```

 Quaisquer erros de validação retornados durante um pedido de validação ou o envio de um formulário serão automaticamente inseridos no objeto "erros" do mesmo:

```html
<div v-if="form.invalid('email')">
    {{ form.errors.email }}
</div>
```

 Você pode determinar se a página tem erros usando o valor da propriedade `hasErrors`:

```html
<div v-if="form.hasErrors">
    <!-- ... -->
</div>
```

 Você também pode determinar se uma entrada passou ou não a validação, passando o nome da entrada para as funções `valid` e `invalid` do formulário, respectivamente:

```html
<span v-if="form.valid('email')">
    ✅
</span>

<span v-else-if="form.invalid('email')">
    ❌
</span>
```

 > [AVISO]
 > Uma entrada do formulário só será classificada como válida ou inválida quando tiver sido alterada e uma resposta da validação for recebida.

 Se você estiver validadando um subconjunto de entradas do formulário com o Precognition, talvez seja útil apagar manualmente os erros. Para fazer isso, use a função `forgetError` do formulário:

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

 Claro que você também pode executar códigos em reação à resposta da submissão do formulário. A função `submit` do form retorna uma promessa de solicitação do Axios, o que proporciona uma maneira conveniente para acessar o payload da resposta, reiniciar as entradas do formulário na caso de sucesso ou lidar com um pedido falhado:

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

 Você pode determinar se um pedido de submissão de formulário está em curso, inspecionando a propriedade `processing` do formulário:

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="using-vue-and-inertia"></a>
### Usando o Vue e a Inertia

 > [!ATENÇÃO]
 [Kits iniciais](https://laravel.com/docs/starter-kits) oferecem escadas de autenticação de back-end e front-end para seu novo aplicativo Laravel.

 Antes de utilizar o Precognition com Vue e Inertia, revisar a nossa documentação geral sobre [utilizar o Precognition com Vue] (#using-vue). Ao utilizar o Vue com a Inertia, será necessário instalar a biblioteca Precognition compatível com a Inertia através do NPM:

```shell
npm install laravel-precognition-vue-inertia
```

 Depois de instalado, a função `useForm` do Precognition retornará um auxiliar de formulário Inertia [assistente de formulários](https://inertiajs.com/forms#form-helper) aumentado com os recursos de validação mencionados acima.

 O método de ajuda do formulário 'submit' foi simplificado, eliminando a necessidade de especificar o método HTTP ou URL. Em vez disso, você pode passar as opções da visita da Inertia como primeiro e único argumento. Além disso, o método 'submit' não retorna uma promessa conforme visto no exemplo do Vue acima. Você pode fornecer qualquer um dos [eventos de callback suportados pela Inertia](https://inertiajs.com/manual-visits#event-callbacks) nas opções da visita dadas ao método 'submit':

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
### Usando o React

 Usando o Laravel Precognition, você pode oferecer experiências de validação ao vivo para seus usuários sem precisar duplicar suas regras de validação em seu aplicativo front-end React. Para ilustrar como funciona, criaremos um formulário para a criação de novos usuários dentro do nosso aplicativo.

 Primeiro, para habilitar Precognition para uma rota, o middleware `HandlePrecognitiveRequests` deve ser adicionado à definição da rota. Além disso, é necessário criar um [form request (requerimento em formulário)](/docs/validation#form-request-validation) para armazenar as regras de validação da rota:

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

 Em seguida você deve instalar os auxiliares front-end do Laravel Precognition para o React através do NPM:

```shell
npm install laravel-precognition-react
```

 Com o pacote Laravel Precognition instalado, agora você pode criar um objeto de formulário usando a função `useForm` do Precognition, fornecendo o método HTTP (`post`), a URL de destino (`/users`) e os dados iniciais do formulário.

 Para ativar a validação ao vivo, você deve ouvir o evento `change` e `blur` de cada entrada. No controlador do evento `change`, você deve definir os dados do formulário com a função `setData`, passando o nome da entrada e seu novo valor. Em seguida, no controlador do evento `blur`, chame o método `validate` do formulário, fornecendo o nome da entrada:

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

 Agora, enquanto o formulário é preenchido pelo usuário, o Precognition fornecerá uma saída de validação em tempo real movida pelas regras de validação do pedido do formulário da rota. Quando as entradas do formulário forem alteradas, um pedido "precognitivo" de validação será enviado para a aplicação Laravel. É possível configurar o tempo de atraso de debounce chamando a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

 Quando um pedido de validação estiver em andamento, a propriedade `validating` do formulário será `true`:

```jsx
{form.validating && <div>Validating...</div>}
```

 Quaisquer erros de validação retornados durante um pedido de validação ou o envio de um formulário preencherão automaticamente o objeto `erros` do formulário:

```jsx
{form.invalid('email') && <div>{form.errors.email}</div>}
```

 Você pode determinar se o formulário possui erros usando a propriedade `hasErrors` do formulário:

```jsx
{form.hasErrors && <div><!-- ... --></div>}
```

 Você também poderá determinar se uma entrada passou ou não a validação ao passar o nome da entrada para as funções "valid" e "invalid" do formulário, respectivamente:

```jsx
{form.valid('email') && <span>✅</span>}

{form.invalid('email') && <span>❌</span>}
```

 > [AVERTISSEMENTO]
 > Somente uma entrada de formulário será considerada válida ou inválida depois que ela tiver sido alterada e uma resposta da validação tiver sido recebida.

 Se você estiver valendo um subconjunto de entradas do formulário com a Precognition, pode ser útil apagar manualmente os erros. Você poderá usar a função `forgetError` do formulário para fazer isso:

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

 Claro que você também pode executar código em reação à resposta ao envio do formulário. A função `submit` do form retorna uma promessa de solicitação Axios. Isso fornece uma maneira conveniente para acessar o payload da resposta, reiniciar as entradas do formulário no sucesso do envio do formulário ou para lidar com um pedido falhado:

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

 Você pode determinar se uma solicitação de envio de formulário está em execução inspecionando a propriedade "processing" do formulário:

```html
<button disabled={form.processing}>
    Submit
</button>
```

<a name="using-react-and-inertia"></a>
### Usando o React e a Inertia

 > [!NOTA]
 [Kits de iniciação](/docs/starter-kits) Kits de inicialização do Laravel providenciam um esqueleto para a autenticação tanto no backend quanto no frontend de uma nova aplicação do Laravel.

 Antes de usar o Precognition com o React e a Inertia, leia nossa documentação geral sobre [o uso do Precognion com o React] (#using-react). Ao utilizar o React com a Inertia, você precisará instalar a biblioteca Precognion compatível com a Inertia via NPM:

```shell
npm install laravel-precognition-react-inertia
```

 Depois de instalado, a função `useForm` do Precognition irá retornar um auxiliar de formulário Inertia [ajudante do formulário](https://inertiajs.com/forms#form-helper) aumentado com os recursos de validação discutidos acima.

 O método de ajuda do formulário `submit` foi otimizado, removendo a necessidade de especificar o método HTTP ou URL. Em vez disso, você pode passar as opções [de visita Inertia](https://inertiajs.com/manual-visits) como primeiro e único argumento. Além disso, o método `submit` não retorna um Promise, conforme visto no exemplo de React acima. Em vez disso, você pode fornecer qualquer um dos [eventos de callbacks suportados por Inertia](https://inertiajs.com/manual-visits#event-callbacks) nas opções de visita dadas ao método `submit`:

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
### Usando a Alpine e a Blade

 Com o Laravel Precognition, você pode oferecer experiências de validação ao vivo para seus usuários sem precisar duplicar suas regras de validação em seu aplicativo Alpine front-end. Para ilustrar como ele funciona, construiremos um formulário para a criação de novos usuários em nossa aplicação.

 Primeiro, para habilitar Precognition em uma rota, o middleware `HandlePrecognitiveRequests` deve ser adicionado à definição da rota. Você também deve criar um [pedido de formulário](/docs/validation#pedido-de-formulário) para armazenar as regras de validação da rota:

```php
use App\Http\Requests\CreateUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (CreateUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

 Em seguida, você deve instalar os auxiliares de front-end Laravel Precognition para o Alpine por meio do NPM:

```shell
npm install laravel-precognition-alpine
```

 Em seguida, registre o plug-in de Precognition com o Alpine no arquivo `resources/js/app.js`:

```js
import Alpine from 'alpinejs';
import Precognition from 'laravel-precognition-alpine';

window.Alpine = Alpine;

Alpine.plugin(Precognition);
Alpine.start();
```

 Com o pacote Precognition instalado e registrado, pode criar agora um objeto de formulário utilizando a "mágica" `$form` da Precognition, fornecendo o método HTTP (`post`), a URL alvo (`/users`) e os dados iniciais do formulário.

 Para ativar a validação ao vivo, você deve vincular os dados do formulário aos seus respectivos dados de entrada. Em seguida, escute o evento `change` em cada entrada. No manipulador do evento `change`, você deve invocar o método `validate` do formulário, fornecendo o nome da entrada:

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

 Agora que o formulário é preenchido pelo usuário, Precognition fornecerá saída de validação ao vivo alimentada pelas regras de validação no pedido do formulário da rota. Quando as entradas do formulário forem alteradas, um pedido de validação "precognitiva" debouncado será enviado para o seu aplicativo Laravel. Você pode configurar o tempo de intervalo com a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

 Quando um pedido de validação estiver em andamento, a propriedade "validating" do formulário será definida como "true":

```html
<template x-if="form.validating">
    <div>Validating...</div>
</template>
```

 Quaisquer erros de validação retornados durante uma solicitação de validação ou um envio de formulário serão preenchidos automaticamente no objeto `erros` do formulário:

```html
<template x-if="form.invalid('email')">
    <div x-text="form.errors.email"></div>
</template>
```

 Você pode verificar se há erros no formulário usando a propriedade `hasErrors` do formulário:

```html
<template x-if="form.hasErrors">
    <div><!-- ... --></div>
</template>
```

 Você também pode determinar se uma entrada passou ou falhou a validação ao enviar o nome da entrada às funções `valid` e `invalid` do formulário, respectivamente:

```html
<template x-if="form.valid('email')">
    <span>✅</span>
</template>

<template x-if="form.invalid('email')">
    <span>❌</span>
</template>
```

 > [ATENÇÃO]
 > Um campo de entrada só aparecerá como válido ou inválido quando o mesmo tiver sido alterado e uma resposta de validação for recebida.

 Você pode determinar se um pedido de submissão está em andamento inspecionando a propriedade `processing` do formulário:

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="repopulating-old-form-data"></a>
#### Repovoar dados antigos de formulário

 No exemplo de criação do usuário discutido acima, estamos usando o Precognition para executar a validação ao vivo. Porém, estamos executando uma submissão tradicional de formulários no lado do servidor para enviar o formulário. Portanto, o formulário deve ser preenchido com qualquer input "antigo" e os erros de validação retornados pela submissão do formulário no lado do servidor:

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '{{ old('name') }}',
        email: '{{ old('email') }}',
    }).setErrors({{ Js::from($errors->messages()) }}),
}">
```

 Em alternativa, se você quiser enviar o formulário por meio de XHR, pode usar a função `submit` do formulário, que retorna uma promessa de solicitação do Axios:

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

 As bibliotecas de validação Precognition usam o [Axios](https://github.com/axios/axios) como cliente HTTP para enviar solicitações para o servidor da sua aplicação. Por conveniência, a instância Axios pode ser personalizada se for necessário pela sua aplicação. Por exemplo, ao utilizar a biblioteca `laravel-precognition-vue`, poderá adicionar cabeçalhos de solicitação adicionais a cada solicitação de saída no ficheiro `app.js` do seu servidor:

```js
import { client } from 'laravel-precognition-vue';

client.axios().defaults.headers.common['Authorization'] = authToken;
```

 Ou se você já tiver uma instância do Axios configurada para sua aplicação, poderá informar ao Precognition que deverá utilizar essa instância em vez disso:

```js
import Axios from 'axios';
import { client } from 'laravel-precognition-vue';

window.axios = Axios.create()
window.axios.defaults.headers.common['Authorization'] = authToken;

client.use(window.axios)
```

 > [AVERIGUE-SE]
 As bibliotecas com Precog (Precognition) tem a capacidade de só usar a instância do Axios para solicitações de validação, enquanto as submissões em formulários serão sempre enviadas por Inertia.

<a name="customizing-validation-rules"></a>
## Personalizar as regras de validação

 É possível personalizar as regras de validação executadas durante um pedido prenhecativo utilizando o método `isPrecognitive` do pedido.

 Por exemplo, em um formulário de criação do usuário, talvez queiramos validar uma senha como "inviolável" somente na submissão final do formulário. Para solicitações de validação pré-cognitivas, nós apenas validaremos se a senha é exigida e tem pelo menos 8 caracteres. Usando o método `isPrecognitive`, podemos personalizar as regras definidas pela solicitação do formulário:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
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
## Gerenciando uploads de arquivos

 Por padrão, o Laravel Preview não faz o upload ou valida arquivos durante um pedido de validação prévia. Isso garante que grandes arquivos não sejam carregados várias vezes sem necessidade.

 Como essa é a sua conduta, você deve garantir que seu aplicativo (#customizing-validation-rules) personalize as regras de validação do formulário correspondente para especificar que o campo só seja obrigatório em envio de formulários completos:

```php
/**
 * Get the validation rules that apply to the request.
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

 Se você deseja incluir arquivos em todas as solicitações de validação, poderá invocar a função `validateFiles` na instância do seu formulário no lado do cliente:

```js
form.validateFiles();
```

<a name="managing-side-effects"></a>
## Gerenciando Efeitos Colaterais

 Ao adicionar o middleware `HandlePrecognitiveRequests` a uma rota, você deve considerar se existem efeitos colaterais em outro middleware que deverão ser ignorados durante um pedido prenheante.

 Por exemplo, você pode ter uma middleware que aumente o número total de "interações" realizadas por cada usuário com seu aplicativo. No entanto, talvez não seja desejável contar as solicitações precognitivas como uma interação. Para isso, podemos verificar o método `isPrecognitive` do pedido antes de incrementarmos a contagem das interações:

```php
<?php

namespace App\Http\Middleware;

use App\Facades\Interaction;
use Closure;
use Illuminate\Http\Request;

class InteractionMiddleware
{
    /**
     * Handle an incoming request.
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
## Teste

 Se você quiser fazer requisições pré-cognitivas em seus testes, o `TestCase` do Laravel inclui uma ajuda `withPrecognition` que adicionará a cabeçalho de solicitação `Precognition`.

 Além disso, se pretender afirmar que um pedido prévio foi bem-sucedido, por exemplo, não devolveu quaisquer erros de validação, pode utilizar o método `assertSuccessfulPrecognition` no nível da resposta:

```php tab=Pest
it('validates registration form with precognition', function () {
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();

    expect(User::count())->toBe(0);
});
```

```php tab=PHPUnit
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
