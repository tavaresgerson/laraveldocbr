# Precompreensão

<a name="introduction"></a>
## Introdução

Laravel Precognition permite antecipar o resultado de uma futura solicitação HTTP. Um dos principais casos de uso da Precognition é a capacidade de fornecer validação "live" para sua aplicação JavaScript frontal, sem precisar duplicar as regras de validação do backend da sua aplicação. A Precognition combina especialmente bem com kits de [iniciantes] baseados em Inertia do Laravel.

Quando o Laravel recebe um "pedido precognitivo", ele executará todos os middleware de rota e resolverá as dependências do controlador de rota, incluindo a validação de [formulários de solicitação](/docs/{{version}}/validation#form-request-validation) - mas não executará realmente o método de controlador de rota.

<a name="live-validation"></a>
## Validação ao vivo

<a name="using-vue"></a>
### Usando o Vue

Com o Laravel Precognition, você pode oferecer experiências de validação em tempo real aos seus usuários sem precisar duplicar suas regras de validação no seu aplicativo Vue frontend. Para ilustrar como isso funciona, vamos construir um formulário para criar novos usuários dentro do nosso aplicativo.

Primeiro, para habilitar precognição para uma rota, o `HandlePrecognitiveRequests` middleware deve ser adicionado à definição da rota. Você também deve criar um [formulário de solicitação](/docs/{{version}}/validation#form-request-validation) para armazenar as regras de validação da rota:

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

Em seguida, você deve instalar o Laravel Precognition front-end helpers para Vue via NPM:

```shell
npm install laravel-precognition-vue
```

Com o pacote Precognition do Laravel instalado, você pode criar um objeto de formulário usando a função `useForm` do Precognition e fornecendo o método HTTP (post), a URL alvo (usuários) e os dados iniciais do formulário.

Então, para habilitar a validação em tempo real, invoque o método 'validate' do formulário no evento 'change' de cada entrada, fornecendo o nome da entrada.

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

Agora, já que o formulário é preenchido pelo usuário, Precognition fornecerá saída de validação em tempo real alimentada pelas regras de validação no pedido de formulário da rota. Quando os dados do formulário são alterados, um pedido de validação precognitiva "debounced" será enviado para seu aplicativo Laravel. Você pode configurar o tempo limite debounce chamando a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

Ao fazer uma requisição de validação em voo, a propriedade "validando" do formulário será "verdadeira":

```html
<div v-if="form.validating">
    Validating...
</div>
```

Qualquer erro de validação retornado durante uma solicitação de validação ou envio de formulário irá preencher automaticamente o objeto de erros do formulário:

```html
<div v-if="form.invalid('email')">
    {{ form.errors.email }}
</div>
```

Você pode determinar se há algum erro no formulário usando a propriedade 'hasErrors':

```html
<div v-if="form.hasErrors">
    <!-- ... -->
</div>
```

Você também pode determinar se uma entrada passou ou falhou na validação passando o nome da entrada para as funções 'valid' e 'invalid' do formulário, respectivamente.

```html
<span v-if="form.valid('email')">
    ✅
</span>

<span v-else-if="form.invalid('email')">
    ❌
</span>
```

> [ALERTA]
> Um campo de entrada só será reconhecido como válido ou inválido depois que ele for alterado e uma resposta de validação tiver sido recebida.

Se você está validando um subconjunto de entradas do formulário com Precognition, pode ser útil limpar manualmente erros. Você pode usar a função 'forgetError' do formulário para alcançar isso:

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

É claro que também você pode executar código em reação à resposta ao envio do formulário. A função 'submit' do formulário retorna uma promessa Axios de solicitação. Isso fornece um modo conveniente para acessar o payload da resposta, redefinir os campos do formulário no envio bem sucedido ou lidar com uma solicitação malsucedida:

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

Você pode determinar se uma solicitação de envio do formulário está em vôo, inspecionando a propriedade "processamento" do formulário:

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="using-vue-and-inertia"></a>
### Usando Vue e Inertia

> NOTA!
> Se você gostaria de ter uma vantagem ao desenvolver seu aplicativo Laravel com Vue e Inertia, considere usar um dos nossos [Kits Starter] (/docs/ {{versão}} / Kits Starter). Os kits de início do Laravel fornecem estruturas de autenticação backend e frontend para o seu novo aplicativo Laravel.

Antes de usar o Precognition com o Vue e o Inertia, tenha a certeza de revisar nossa documentação geral sobre [usando o Precognition com o Vue](#usando-vue). Quando usando o Vue com o Inertia, você precisará instalar a biblioteca do Precognition compatível com o Inertia via NPM:

```shell
npm install laravel-precognition-vue-inertia
```

Uma vez instalado, a função 'useForm' do Precognition retornará um [auxiliar de formulário](https://inertiajs.com/forms#form-helper) da Inertia com os recursos de validação discutidos acima.

O método 'submit' do helper foi simplificado, removendo a necessidade de especificar o método HTTP ou URL. Em vez disso, você pode passar as [opções de visita](https://inertiajs.com/manual-visits) da Inertia como o primeiro e único argumento. Além disso, o método 'submit' não retorna uma Promessa como visto no exemplo Vue acima. Em vez disso, você pode fornecer qualquer um dos [callbacks de eventos](https://inertiajs.com/manual-visits#event-callbacks) suportados pela Inertia nas opções de visita passadas para o método 'submit':

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

Usando o Laravel Precognition, você pode oferecer experiências de validação ao vivo para seus usuários sem precisar duplicar as regras de validação no seu aplicativo front-end React. Para ilustrar como isso funciona, vamos construir um formulário para criar novos usuários dentro do nosso aplicativo.

Primeiro, para habilitar o precognição para uma rota, o `HandlePrecognitiveRequests` middleware deve ser adicionado à definição da rota. Você também deve criar um [formulário de solicitação](/docs/{{version}}/validation#form-request-validation) para abrigar as regras de validação da rota:

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

Em seguida, você deve instalar os ajuda-a-front-end de precognição do Laravel para React através do npm:

```shell
npm install laravel-precognition-react
```

Com o pacote Precognition instalado no Laravel, você pode criar um objeto de formulário usando a função 'useForm' do Precognition, fornecendo o método HTTP (post), o URL alvo (usuários) e os dados iniciais do formulário.

Para habilitar a validação ao vivo, você deve escutar o evento 'change' e 'blur' de cada entrada. No manipulador do evento 'change', você deve definir os dados do formulário com a função 'setData', passando o nome da entrada e o novo valor. Em seguida, no manipulador do evento 'blur', invoque o método 'validate' do formulário, fornecendo o nome da entrada:

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

Agora, como o formulário é preenchido pelo usuário, a Precognition fornecerá uma saída de validação em tempo real com base nas regras de validação no formulário da rota de solicitação. Quando os campos do formulário são alterados, um pedido de validação "precognitiva" será enviado para sua aplicação Laravel. Você pode configurar o tempo limite de debounce chamando a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

Quando uma solicitação de validação está em andamento, a propriedade 'validando' do formulário será 'verdadeira':

```jsx
{form.validating && <div>Validating...</div>}
```

Quaisquer erros de validação retornados durante uma solicitação de validação ou envio de formulário serão preenchidos automaticamente no objeto 'erros' do formulário.

```jsx
{form.invalid('email') && <div>{form.errors.email}</div>}
```

Você pode determinar se o formulário tem algum erro usando a propriedade 'hasErrors':

```jsx
{form.hasErrors && <div><!-- ... --></div>}
```

Você também pode determinar se uma entrada passou ou falhou na validação passando o nome da entrada para as funções 'valid' e 'invalid' do formulário, respectivamente:

```jsx
{form.valid('email') && <span>✅</span>}

{form.invalid('email') && <span>❌</span>}
```

> [!ALERTA]
> Um campo de entrada só aparecerá como válido ou inválido depois que ele foi alterado e uma resposta de validação foi recebida.

Se você está validando um subconjunto dos dados inseridos em uma forma com o Precognition, pode ser útil limpar manualmente os erros. Você pode usar a função "forError" da forma para conseguir isso.

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

Claro, você também pode executar código como resposta à resposta do envio do formulário. A função 'submit' do formulário retorna uma promessa Axios. Isso fornece um meio conveniente de acessar a carga da resposta, redefinir as entradas do formulário em um envio bem-sucedido ou lidar com um pedido malsucedido:

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

Você pode determinar se um pedido de envio do formulário está em vôo, inspecionando a propriedade 'processamento' do formulário.

```html
<button disabled={form.processing}>
    Submit
</button>
```

<a name="using-react-and-inertia"></a>
### Usando React e Inertia.js

> Nota!
> Se você deseja um pontapé inicial ao desenvolver seu aplicativo Laravel com React e Inertia, considere usar uma de nossas [caixas de início](/docs/{{version}}/starter-kits). As caixas de início do Laravel fornecem autenticação de back-end e front-end para o seu novo aplicativo Laravel.

Antes de usar o Precognition com React e Inertia, certifique-se de revisar nossa documentação geral sobre [usando Precognition com React](#usando-react). Ao usar React com Inertia, você precisará instalar a biblioteca Precognition compatível com Inertia por meio do NPM:

```shell
npm install laravel-precognition-react-inertia
```

Uma vez que a função 'useForm' do Precognition é instalada, ela retornará um [auxiliar de formulário](https://inertiajs.com/forms#form-helper) da Inertia com os recursos de validação discutidos acima.

O método 'submit' do helper foi simplificado, eliminando a necessidade de especificar o método HTTP ou URL. Em vez disso, você pode passar as [opções de visita](https://inertiajs.com/manual-visits) do Inertia como o primeiro e único argumento. Além disso, o método 'submit' não retorna uma Promessa conforme visto no exemplo React acima. Em vez disso, você pode fornecer qualquer um dos [callbacks de evento](https://inertiajs.com/manual-visits#event-callbacks) suportados do Inertia nas opções de visita passadas para o método 'submit':

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
### Usando o Alpine e o Blade

Usando o Laravel Precognition, você pode oferecer experiências de validação em tempo real aos seus usuários sem precisar duplicar as regras de validação no seu aplicativo Alpine front-end. Para ilustrar como funciona, vamos construir um formulário para a criação de novos usuários dentro do nosso aplicativo.

Primeiro, para habilitar a Precognição para uma rota, o `HandlePrecognitiveRequests` middleware deve ser adicionado à definição da rota. Você também precisa criar um [formulário de solicitação](/docs/{{version}}/validation#form-request-validation) para armazenar as regras de validação da rota:

```php
use App\Http\Requests\CreateUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (CreateUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

Em seguida, instale os auxílios do Laravel Precognition Frontend para Alpine via NPM:

```shell
npm install laravel-precognition-alpine
```

Em seguida, registre o plugin precognição com Alpino no seu arquivo "recursos/js/app.js":

```js
import Alpine from 'alpinejs';
import Precognition from 'laravel-precognition-alpine';

window.Alpine = Alpine;

Alpine.plugin(Precognition);
Alpine.start();
```

Com o pacote Laravel Precognition instalado e registrado, agora você pode criar um objeto de formulário usando o "mago" $form do Precognition, fornecendo a metoda HTTP ( `post`), o URL alvo ( `/users`) e os dados iniciais do formulário.

Para permitir a validação em tempo real, você deve vincular os dados do formulário ao campo de entrada relevante e depois escutar o evento 'change' de cada entrada. No manipulador do evento 'change', você deve invocar o método 'validate' do formulário, fornecendo o nome da entrada:

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

Agora, quando o formulário é preenchido pelo usuário, o Precognition fornecerá um output de validação em tempo real alimentado pelas regras de validação no pedido do modelo de rota. Quando as entradas do formulário são alteradas, uma solicitação de "validação precognitiva" será enviada à sua aplicação Laravel. Você pode configurar o tempo limite da debounce chamando a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

Quando um pedido de validação está em voo, a propriedade 'validando' do formulário será 'verdadeira':

```html
<template x-if="form.validating">
    <div>Validating...</div>
</template>
```

Qualquer erro de validação retornado durante uma solicitação de validação ou submissão do formulário irá preencher automaticamente o objeto 'erros' do formulário.

```html
<template x-if="form.invalid('email')">
    <div x-text="form.errors.email"></div>
</template>
```

Você pode determinar se a forma tem algum erro usando a propriedade `hasErrors` da forma:

```html
<template x-if="form.hasErrors">
    <div><!-- ... --></div>
</template>
```

Você também pode determinar se uma entrada passou ou não no processo de validação passando o nome da entrada para as funções "valid" e "invalid", respectivamente:

```html
<template x-if="form.valid('email')">
    <span>✅</span>
</template>

<template x-if="form.invalid('email')">
    <span>❌</span>
</template>
```

> ¡¡ALERTA!
> Um campo de entrada só será mostrado como válido ou inválido depois que ele tiver sido alterado e uma resposta de validação tenha sido recebida.

Você pode determinar se uma solicitação de envio do formulário está em voo inspecionando a propriedade 'processamento' do formulário.

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="repopulating-old-form-data"></a>
#### Repovoando dados da forma antiga

No exemplo de criação do usuário acima discutido, estamos usando precognição para realizar validação ao vivo; no entanto, estamos realizando uma submissão de formulário tradicional do lado do servidor para enviar o formulário. Então, o formulário deve ser preenchido com qualquer "entrada antiga" e erros de validação retornados da submissão do formulário do lado do servidor:

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '{{ old('name') }}',
        email: '{{ old('email') }}',
    }).setErrors({{ Js::from($errors->messages()) }}),
}">
```

Alternativamente, se você gostaria de enviar o formulário via XHR você pode usar a função 'submit' do formulário, que retorna uma promessa de solicitação Axios:

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
### Configurando Axios

As bibliotecas de validação precognitivas usam o cliente HTTP Axios para enviar solicitações ao back-end do seu aplicativo. Para conveniência, a instância Axios pode ser personalizada se necessário pelo seu aplicativo. Por exemplo, quando usando a biblioteca `laravel-precognition-vue`, você pode adicionar cabeçalhos de solicitação adicionais a cada solicitação saída no arquivo `resources/js/app.js` do seu aplicativo:

```js
import { client } from 'laravel-precognition-vue';

client.axios().defaults.headers.common['Authorization'] = authToken;
```

Ou, se você já tiver uma instância Axios configurada para sua aplicação, você pode dizer ao PreCognition que utilize essa instância em vez disso:

```js
import Axios from 'axios';
import { client } from 'laravel-precognition-vue';

window.axios = Axios.create()
window.axios.defaults.headers.common['Authorization'] = authToken;

client.use(window.axios)
```

> [!AVISO]
> As bibliotecas do precognição com sabor de inércia usarão apenas a instância Axios configurada para solicitações de validação. As submissões de formulário sempre serão enviadas pelo inércia.

<a name="customizing-validation-rules"></a>
## Personalizando as regras de validação

É possível personalizar as regras de validação executadas durante um pedido precognitivo usando o método `isPrecognitive` do pedido.

Por exemplo, no formulário de criação de usuário, podemos querer validar que uma senha é "incompromissada" apenas na final do envio. Para as solicitações de validação precognitiva, nós vamos simplesmente validar que a senha é necessária e tem um mínimo de 8 caracteres. Usando o método 'isPrecognitive', podemos personalizar as regras definidas pelo nosso formulário de solicitação:

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
## Manipulação de Upload de Arquivos

Por padrão o Laravel Precognition não realiza upload ou validação de arquivos durante uma requisição de precognição. Isso garante que grandes arquivos não sejam carregados desnecessariamente diversas vezes.

Por causa desse comportamento, você deve garantir que sua aplicação [personalize as regras de validação do formulário correspondente](#personalizando-regras-de-validação) para especificar o campo como apenas necessário para envios completos do formulário:

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

Se você gostaria de incluir arquivos em cada solicitação de validação, você pode invocar a função `validateFiles` na sua instância do formulário no lado do cliente:

```js
form.validateFiles();
```

<a name="managing-side-effects"></a>
## Gerenciando Efeitos Colaterais

Ao adicionar o middleware 'HandlePrecognitiveRequests' a uma rota, considere se há algum efeito colateral no _outras middleware que deve ser pular durante um pedido preconceptivo.

Por exemplo, você pode ter um middleware que incrementa o número total de "interações" cada usuário tem com seu aplicativo, mas você não deseja que as solicitações precognitivas sejam contadas como interações. Para alcançar isso, podemos verificar a solicitação's `isPrecognitive` método antes de incrementar o contador de interação:

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
## Testando...

Se você gostaria de fazer solicitações precognitivas em seus testes, o 'TestCase' do Laravel inclui um "helper" chamado "withPrecognition", que acrescenta o cabeçalho "Precognition".

Além disso, se você gostaria de afirmar que uma solicitação precognitiva foi bem sucedida (por exemplo, não retorna nenhum erro de validação), você pode usar o método `assertSuccessfulPrecognition` na resposta:

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
