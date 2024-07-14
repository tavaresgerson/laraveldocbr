# Validação

## Introdução
O Laravel fornece várias abordagens para validar os dados recebidos pelo aplicativo. No entanto, é mais comum usar o método `validate`, disponível em todas as requisições HTTP recebidas. Também discutiremos outras abordagens de validação.

O Laravel inclui uma grande variedade de regras de validação que pode aplicar aos dados, incluindo a capacidade de validar se os valores são únicos numa determinada tabela do banco de dados. Apresentaremos detalhadamente cada uma destas regras de validação para que você esteja familiarizado com todos os recursos de validação do Laravel.

## Início rápido sobre a validação
Para saber mais sobre os recursos poderosos de validação do Laravel, vamos dar uma olhada em um exemplo completo que valide um formulário e mostre as mensagens de erro ao usuário. Ao ler este resumo geral, você poderá obter uma boa compreensão geral sobre como validar os dados da solicitação recebidos utilizando o Laravel:

### Definir as rotas
Vamos supor que tenhamos os seguintes rotas definidas no nosso ficheiro `routes/web.php`:

```php
    use App\Http\Controllers\PostController;

    Route::get('/post/create', [PostController::class, 'create']);
    Route::post('/post', [PostController::class, 'store']);
```

A rota `GET` exibirá um formulário para o usuário criar uma nova publicação de blog, enquanto a rota `POST` armazenará a nova publicação no banco de dados.

### Criando o Controller
Em seguida, vamos analisar um controlador simples que lidará com os pedidos recebidos para esses endereços. Deixaremos o método `store` vazio por enquanto:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\View\View;

    class PostController extends Controller
    {
        /**
         * Mostre o formulário para criar uma nova postagem no blog.
         */
        public function create(): View
        {
            return view('post.create');
        }

        /**
         * Armazene uma nova postagem no blog.
         */
        public function store(Request $request): RedirectResponse
        {
            // Valide e armazene a postagem do blog...

            $post = /** ... */

            return to_route('post.show', ['post' => $post->id]);
        }
    }
```

### Escrever a lógica de validação
Agora estamos prontos para preencher nosso método `store` com a lógica necessária para validar o novo post do blog. Para fazer isso, usaremos o método `validate` fornecido pelo objeto `Illuminate\Http\Request`. Se as regras de validação passarem, seu código continuará sendo executado normalmente; no entanto, se a validação falhar, uma exceção `Illuminate\Validation\ValidationException` será lançada e a resposta de erro correta será enviada automaticamente ao usuário.

Se a validação falhar durante uma requisição HTTP tradicional, uma resposta de redirecionamento para a URL anterior será gerada. Se o pedido recebido for um pedido XHR, uma resposta [JSON contendo as mensagens de erro de validação](#formato-de-resposta-de-erro-de-validação) será retornada.

Para entender melhor o método `validate`, vamos voltar para o método `store`:

```php
    /**
     * Armazene uma nova postagem no blog.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
        ]);

        // A postagem do blog é válida...

        return redirect('/posts');
    }
```

Como você pode ver, as regras de validação são passadas para o método `validate`. Não se preocupe - todas as regras de validação disponíveis estão [documentadas](#regras-de-validação-disponíveis). Novamente, se a validação falhar, a resposta correta será gerada automaticamente. Se a validação passar, o nosso controlador continuará executando normalmente.

Como alternativa, as regras de validação podem ser especificadas como um conjuntos de regras em vez de uma única string limitada por um único sinalizador "|":

```php
    $validatedData = $request->validate([
        'title' => ['required', 'unique:posts', 'max:255'],
        'body' => ['required'],
    ]);
```

Além disso, você pode usar o método `validateWithBag` para validar uma solicitação e armazenar quaisquer mensagens de erro dentro de um [saco de erros nomeado](#named-error-bags):

```php
    $validatedData = $request->validateWithBag('post', [
        'title' => ['required', 'unique:posts', 'max:255'],
        'body' => ['required'],
    ]);
```

#### Interrupção em caso de falha de validação inicial
Às vezes, vocÊ deseja parar de executar regras de validação em um atributo após a primeira falha de validação. Para fazer isso, adicione a regra `bail` ao atributo:

```php
    $request->validate([
        'title' => 'bail|required|unique:posts|max:255',
        'body' => 'required',
    ]);
```

Neste exemplo, se a regra de exclusividade no atributo `title` falhar, a regra `max` não será verificada. As regras são validadas na ordem em que são definidas.

#### Uma nota sobre atributos aninhados
Se a requisição HTTP for recebida com dados de campo "aninhado", você poderá especificar estes campos nas regras de validação usando a sintaxe de ponto:

```php
    $request->validate([
        'title' => 'required|unique:posts|max:255',
        'author.name' => 'required',
        'author.description' => 'required',
    ]);
```

Por outro lado, se o nome do campo contiver uma ponto (ou vírgula) simbólica, você poderá impedir explicitamente que este seja interpretado como sintaxe de "ponto" utilizando a sequência de backslash (\):

```php
    $request->validate([
        'title' => 'required|unique:posts|max:255',
        'v1\.0' => 'required',
    ]);
```

### Exibição dos erros de validação
Então, e se os campos de solicitações não passarem pelas regras de validação dadas? Como mencionado anteriormente, o Laravel redirecionará automaticamente o usuário para sua localização anterior. Além disso, todos os erros de validação e [entrada da requisição](/docs/requests#retrieving-old-input) serão automaticamente enviados em [flash para a sessão](/docs/session#flash-data).

Uma variável `$errors` é compartilhada com todas as visualizações da sua aplicação pelo middleware `Illuminate\View\Middleware\ShareErrorsFromSession`, que é fornecido pelo grupo de middleware `web`. Quando este middleware é aplicado, uma variável `$errors` estará sempre disponível em suas visualizações, permitindo que você assuma convenientemente que a variável `$errors` está sempre definida e pode ser usada com segurança. A variável `$errors` será uma instância de `Illuminate\Support\MessageBag`. Para mais informações sobre como trabalhar com este objeto, [confira sua documentação](#working-with-error-messages).

Assim, em nosso exemplo, o usuário será redirecionado para o método `create` do nosso controlador quando a validação falhar, permitindo-nos exibir as mensagens de erro na view:

```blade
<!-- /resources/views/post/create.blade.php -->

<h1>Create Post</h1>

@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<!-- Create Post Form -->
```

#### Personalizar as mensagens de erro
As regras de validação interna do Laravel possuem mensagens de erro localizadas no arquivo da aplicação "lang/en/validation.php". Se sua aplicação não possuir um diretório "lang", você poderá instruí-la para criar esse diretório usando o comando Artisan `lang:publish`.

No arquivo `lang/en/validation.php`, você encontrará uma entrada de tradução para cada regra de validação. Você pode alterar ou modificar essas mensagens conforme a necessidade do seu aplicativo.

Além disso, você pode copiar esse arquivo para um diretório de idiomas específico para traduzir as mensagens da sua aplicação. Para saber mais sobre a localização do Laravel, consulte o [guia completo de localização](/docs/localization).

::: warning ATENÇÃO
Por padrão, o esqueleto de aplicativo do Laravel não inclui a pasta `lang`. Se desejar personalizar os arquivos de idiomas do Laravel, você pode publicá-los através do comando Artisan `lang:publish`.
:::

#### Solicitações por XHR e validação
Neste exemplo, utilizamos um formulário tradicional para enviar os dados para o aplicativo, no entanto, muitos aplicativos recebem solicitações XHR de um front-end alimentado por JavaScript. Quando a método `validate` for utilizado durante uma solicitação XHR, o Laravel não irá gerar uma resposta de redirecionamento. Em vez disso, o Laravel gera uma [resposta JSON contendo todos os erros de validação](#formato-da-resposta-de-erro-de-validação). Esta resposta JSON será enviada com um código HTTP 422.

#### A Diretiva `@error`
Você pode usar a diretiva `@error` do [Blade](/docs/blade) para determinar rapidamente se as mensagens de erro da validação existem para um atributo específico. Dentro da diretiva `@error`, você pode ecoar a variável `$message` para mostrar a mensagem de erro:

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input id="title"
    type="text"
    name="title"
    class="@error('title') is-invalid @enderror">

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

Se você estiver usando bags de erros nomeados, poderá passar o nome da bag como segundo argumento da diretiva `@error`:

```blade
<input ... class="@error('title', 'post') is-invalid @enderror">
```

### Repopular formulários
Quando o Laravel gera uma resposta de redirecionamento devido a um erro de validação, o framework automaticamente adiciona em [flash todos os dados da requisição para a sessão](/docs/session#flash-data). Isso é feito para que você possa acessar convenientemente os dados durante a próxima requisição e preencher novamente o formulário que o usuário tentou enviar.

Para recuperar a entrada marcada em "flash" do pedido anterior, chame o método `old` em uma instância de `Illuminate\Http\Request`. O método `old` irá pegar os dados de entrada marcados em flash no [sessão](/docs/session):

```php
    $title = $request->old('title');
```

O Laravel também oferece uma função de ajuda global `old`. Se você estiver a exibir o conteúdo antigo num template [Blade](/docs/blade), é mais conveniente utilizar a função de ajuda `old` para repopular o formulário. No caso do campo não ter nenhum conteúdo anterior, será retornado um valor "null":

```blade
<input type="text" name="title" value="{{ old('title') }}">
```

<a name="a-note-on-optional-fields"></a>
### Uma nota sobre os campos opcionais

Por padrão, o Laravel inclui os middlewares `TrimStrings` e `ConvertEmptyStringsToNull` na pilha de middlewares global da sua aplicação. Como consequência disto, é comum precisar marcar os seus campos de solicitações "opcionais" como `nullable`, se não pretender que o validador considere os valores `null` como inválidos. Por exemplo:

```php
    $request->validate([
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
        'publish_at' => 'nullable|date',
    ]);
```

Neste exemplo, especificamos que o campo `publish_at` pode ser `null` ou uma representação de data válida. Se a modificação `nullable` não for adicionada à definição da regra, o validador considerará `null` como data inválida.

### Formato de resposta de erro de validação
Quando o seu aplicativo lançar uma exceção `Illuminate\Validation\ValidationException` e a requisição HTTP de entrada estiver aguardando uma resposta JSON, O Laravel irá formatar as mensagens de erro automaticamente e retornar a resposta HTTP `422 Unprocessable Entity`.

Abaixo está um exemplo do formato de resposta em JSON para erros de validação. Observe que as chaves de erro aninhadas são empilhadas no formato de notação ponto a ponto:

```json
{
    "message": "The team name must be a string. (and 4 more errors)",
    "errors": {
        "team_name": [
            "The team name must be a string.",
            "The team name must be at least 1 characters."
        ],
        "authorization.role": [
            "The selected authorization.role is invalid."
        ],
        "users.0.email": [
            "The users.0.email field is required."
        ],
        "users.2.email": [
            "The users.2.email must be a valid email address."
        ]
    }
}
```

## Validação de formulário

### Criando solicitações de formulário
Para cenários de validação mais complexos, pode ser desejável criar um "formulário de requisição". Os formulários de requisição são classes de requisições personalizadas que encapsulam a sua própria lógica de autorização e validação. Para criar essa clase você pode usar o comando `make:request` do Artisan CLI:

```shell
php artisan make:request StorePostRequest
```

A classe de solicitação de formulário gerada será colocada no diretório `app/Http/Requests`. Se esse diretório não existir, ele será criado ao executar o comando `make:request`. Cada solicitação do formulário gerada pelo Laravel possui dois métodos: `authorize` e `rules`.

Como você deve ter adivinhado, o método `authorize` é responsável por determinar se o usuário autenticado atualmente pode executar a ação representada pelo pedido, enquanto o método `rules` retorna as regras de validação que devem ser aplicadas aos dados do pedido:

```php
    /**
     * Obtenha as regras de validação que se aplicam à solicitação.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
        ];
    }
```

::: info NOTA
Você pode digitar qualquer dependência necessária na assinatura do método `rules`. Eles serão resolvidos automaticamente através do [container de serviço](/docs/container) do Laravel.
:::

Então, como são avaliadas as regras de validação? Tudo que você precisa fazer é digitar a solicitação no método do seu controlador. A solicitação de formulário recebida é validada antes que o método do controlador seja chamado, o que significa que você não precisa sobrecarregar seu controlador com nenhuma lógica de validação:

```php
    /**
     * Armazene uma nova postagem no blog.
     */
    public function store(StorePostRequest $request): RedirectResponse
    {
        // A solicitação recebida é válida...

        // Recuperar os dados de entrada validados...
        $validated = $request->validated();

        // Recuperar uma parte dos dados de entrada validados...
        $validated = $request->safe()->only(['name', 'email']);
        $validated = $request->safe()->except(['name', 'email']);

        // Armazene a postagem do blog...

        return redirect('/posts');
    }
```

Se a validação falhar, será gerado um redirecionamento para o endereço anterior do utilizador. Os erros também serão exibidos na sessão, de forma a estar disponíveis para visualização. Se o pedido for um pedido XHR, é enviado ao utilizador uma resposta HTTP com um código de estado 422 que inclui uma [representação JSON dos erros de validação](#formato-da-resposta-de-erro-de-validação).

::: info NOTA
Precisa adicionar validação de solicitação de formulário em tempo real ao seu frontend Laravel com tecnologia Inertia? Confira [Precognição do Laravel](/docs/precognition).
:::

#### Execução de validação adicional
Às vezes, é necessário realizar validação adicional depois que a validação inicial estiver completa. Isso pode ser feito utilizando o método `after` na requisição do formulário.

O método `after` deve retornar uma matriz de `callable` ou closures que serão invocados após a validação completa. Os chamáveis fornecidos receberão uma instância do tipo `Illuminate\Validation\Validator`, permitindo que você gere mensagens de erro adicionais, se necessário:

```php
    use Illuminate\Validation\Validator;

    /**
     * Obtenha os callables de validação "após" a solicitação.
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->somethingElseIsInvalid()) {
                    $validator->errors()->add(
                        'field',
                        'Something is wrong with this field!'
                    );
                }
            }
        ];
    }
```

Como observado anteriormente, a matriz retornada pelo método `after` também pode conter classes acionáveis (invocável). O método `__invoke` destas classes receberá uma instância da classe `Illuminate\Validation\Validator`:

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;
use Illuminate\Validation\Validator;

/**
 * Obtenha os callables de validação "após" para a solicitação.
 */
public function after(): array
{
    return [
        new ValidateUserStatus,
        new ValidateShippingTime,
        function (Validator $validator) {
            //
        }
    ];
}
```

#### Interrompendo após a primeira falha de validação
Ao adicionar uma propriedade `stopOnFirstFailure` à sua classe de requisição, você pode informar o validador que ele deve parar a validação de todos os atributos assim que houver uma única falha na validação:

```php
    /**
     * Indica se o validador deve parar na primeira falha da regra.
     *
     * @var bool
     */
    protected $stopOnFirstFailure = true;
```

#### Personalização do endereço de redirecionamento
Como discutido anteriormente, um redirecionamento será gerado para enviar o usuário de volta ao local anterior quando a validação da solicitação do formulário falhar. No entanto, você pode personalizar esse comportamento. Para fazer isso, defina uma propriedade `$redirect` em sua solicitação de formulário:

```php
    /**
     * O URI para o qual os usuários devem ser redirecionados se a validação falhar.
     *
     * @var string
     */
    protected $redirect = '/dashboard';
```

Se você pretender redirecionar os utilizadores para uma rota específica, poderá definir uma propriedade `$redirectRoute`:

```php
    /**
     * A rota para a qual os usuários devem ser redirecionados se a validação falhar.
     *
     * @var string
     */
    protected $redirectRoute = 'dashboard';
```

### Autorização em requsições de formulários
A classe do formulário de solicitação também contém um método `authorize`. Nesse método, você pode determinar se o usuário autenticado realmente tem autorização para atualizar um recurso específico. Por exemplo, você pode determinar se um usuário é realmente o proprietário de um comentário do blog que ele tenta atualizar. Muito provavelmente, você interagirá com suas [políticas de autorização](/docs/authorization) nesse método:

```php
    use App\Models\Comment;

    /**
     * Determine se o usuário está autorizado a fazer essa solicitação.
     */
    public function authorize(): bool
    {
        $comment = Comment::find($this->route('comment'));

        return $comment && $this->user()->can('update', $comment);
    }
```

Uma vez que todas as requisições de formulário estendem a classe de requisição básica do Laravel, podemos utilizar o método `user` para obter acesso ao utilizador actualmente autenticado. Note também o chamada no método `route` do exemplo acima. Este método lhe permite ter acesso aos parâmetros da URI definidos na rota que está em execução, tal como o parâmetro `{comment}` no exemplo abaixo:

```php
    Route::post('/comment/{comment}');
```

Portanto, se seu aplicativo estiver utilizando o mapeamento do modelo de rota [mapeamento do modelo de rota](/docs/routing#route-model-binding), seu código poderá ser reduzido ainda mais ao acessar o modelo resolvido como uma propriedade do pedido:

```php
    return $this->user()->can('update', $this->comment);
```

Se o método `authorize` retornar `false`, um retorno automático da resposta HTTP com código de estado 403 será feito e seu método de controlador não será executado.

Se você pretende manipular a lógica de autorização do pedido em outra parte do seu aplicativo, poderá remover o método `authorize`, ou simplesmente retornar `true`:

```php
    /**
     * Determine se o usuário está autorizado a fazer essa solicitação.
     */
    public function authorize(): bool
    {
        return true;
    }
```

::: info NOTA
Você pode digitar qualquer dependência necessária na assinatura do método `authorize`. Eles serão resolvidos automaticamente através do [container de serviço](/docs/container) do Laravel.
:::

### Personalizar as mensagens de erro
Você pode personalizar as mensagens de erro utilizadas pelo pedido do formulário, substituindo a metodologia `messages`. Essa metodologia deve retornar um array de pares de atributo/regra e suas correspondentes mensagens de erro:

```php
    /**
     * Obtenha as mensagens de erro para as regras de validação definidas.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'A title is required',
            'body.required' => 'A message is required',
        ];
    }
```

#### Personalizar atributos de validação
Muitas mensagens de erro das regras de validação interna do Laravel contêm um marcador `:attribute`. Se você quiser que o marcador `:attribute` da sua mensagem de validação seja substituído por um nome de atributo personalizado, você pode especificá-lo ao substituir o método `attributes`. Este método deve retornar uma matriz de pares de atributos/nomes:

```php
    /**
     * Obtenha atributos personalizados para erros do validador.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'email' => 'email address',
        ];
    }
```

### Preparando dados para validação
Se você precisar preparar ou higienizar qualquer dado da solicitação antes de aplicar suas regras de validação, você pode usar o método `prepareForValidation`:

```php
    use Illuminate\Support\Str;

    /**
     * Prepare os dados para validação.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug($this->slug),
        ]);
    }
```

Do mesmo modo, se você precisar normalizar os dados do pedido depois que a validação estiver completa, poderá usar o método `passedValidation`:

```php
    /**
     * Lidar com uma tentativa de validação aprovada.
     */
    protected function passedValidation(): void
    {
        $this->replace(['name' => 'Taylor']);
    }
```

## Criação manual de validadores
Se não quiser usar o método `validate` na requisição, você pode criar uma instância de validação manualmente utilizando a [facade](/docs/facades) `Validator`. O método `make` na facade gera uma nova instância do validador:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Validator;

    class PostController extends Controller
    {
        /**
         * Armazene uma nova postagem no blog.
         */
        public function store(Request $request): RedirectResponse
        {
            $validator = Validator::make($request->all(), [
                'title' => 'required|unique:posts|max:255',
                'body' => 'required',
            ]);

            if ($validator->fails()) {
                return redirect('post/create')
                            ->withErrors($validator)
                            ->withInput();
            }

            // Recuperar a entrada validada...
            $validated = $validator->validated();

            // Recuperar uma parte da entrada validada...
            $validated = $validator->safe()->only(['name', 'email']);
            $validated = $validator->safe()->except(['name', 'email']);

            // Armazene a postagem do blog...

            return redirect('/posts');
        }
    }
```

O primeiro argumento passado ao método `make` é os dados a serem validados e o segundo argumento é uma matriz de regras de validação a ser aplicada aos dados.

Depois de determinar se o processo de validação do pedido falhou ou não, você pode utilizar o método `withErrors` para apresentar as mensagens de erro na sessão. Se utilizar este método, a variável `$errors` será partilhada automaticamente com as suas views após o redirecionamento, permitindo-lhe apresentá-las facilmente ao utilizador. O método `withErrors` aceita um validador, um `MessageBag`, ou um array PHP.

#### Parar com a primeira falha de validação
O método `stopOnFirstFailure` informa ao validador de que ele deve parar a validação de todos os atributos, uma vez que tenha ocorrido uma única falha na validação:

```php
    if ($validator->stopOnFirstFailure()->fails()) {
        // ...
    }
```

### Redirecionamento automático
Se você pretender criar uma instância de validação manualmente, mas beneficiar das redirecionamentos automáticos do método `validate` na requisição HTTP, você pode chamar o método `validate` numa instância existente de validador. No caso de falhar a validação, o usuário será automaticamente redirecionado ou, no caso de um pedido XHR, é retornada uma [resposta JSON](#formato-de-resposta-de-erro-de-validação):

```php
    Validator::make($request->all(), [
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ])->validate();
```

Você pode usar o método `validateWithBag` para armazenar as mensagens de erro em um [conjunto de erros com nome](#conjuntos-de-erros-com-nome) se a validação falhar:

```php
    Validator::make($request->all(), [
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ])->validateWithBag('post');
```

### Bag de erros nomeados
Se você tiver vários formulários em uma única página, poderá querer nomear o `MessageBag` contendo os erros de validação, permitindo que você retire as mensagens de erro para um formulário específico. Para isso, passe um nome como o segundo argumento ao método `withErrors`:

```php
    return redirect('register')->withErrors($validator, 'login');
```

Você poderá, então, acessar as instâncias de `MessageBag` denominadas a partir da variável `$errors`:

```blade
{{ $errors->login->first('email') }}
```

### Personalizar as mensagens de erro
Se necessário, você pode fornecer mensagens de erro personalizadas para uma instância validadora usar em vez das mensagens de erro padrão oferecidas pelo Laravel. Há várias maneiras de especificar mensagens customizadas. Em primeiro lugar, você pode passar as mensagens personalizadas como o terceiro argumento do método `Validator::make`:

```php
    $validator = Validator::make($input, $rules, $messages = [
        'required' => 'The :attribute field is required.',
    ]);
```

Neste exemplo, o espaço reservado `:attribute` será substituído pelo nome real do campo em validação. Você também pode utilizar outros espaços reservados em mensagens de validação. Por exemplo:

```php
    $messages = [
        'same' => 'The :attribute and :other must match.',
        'size' => 'The :attribute must be exactly :size.',
        'between' => 'The :attribute value :input is not between :min - :max.',
        'in' => 'The :attribute must be one of the following types: :values',
    ];
```

#### Especificando uma mensagem personalizada para um determinado atributo
Às vezes você pode desejar especificar uma mensagem de erro personalizada apenas para um determinado atributo. Poderá fazê-lo utilizando a notação de "ponto". Você deve especificar primeiro o nome do atributo, seguido da regra:

```php
    $messages = [
        'email.required' => 'We need to know your email address!',
    ];
```

#### Especificação de valores personalizados de atributos
Muitas mensagens de erro embutidas no Laravel incluem um marcador `:attribute`, que é substituído pelo nome do campo ou atributo sob validação. Para personalizar os valores usados para substituir esses marcadores para campos específicos, pode ser passado uma matriz de atributos personalizados como o quarto argumento ao método `Validator::make`:

```php
    $validator = Validator::make($input, $rules, $messages, [
        'email' => 'email address',
    ]);
```

### Realização de validação adicional
Às vezes você precisa executar uma validação adicional depois que a validação inicial estiver concluída. Você pode fazer isso usando o método `after` do validador. O método `after` aceita uma closure ou uma matriz de objetos passíveis de serem chamados, que serão chamados depois que a validação estiver concluída. Os objetos passíveis de serem chamados receberão uma instância da classe `Illuminate\Validation\Validator`, permitindo que você gere mensagens de erro adicionais, se necessário:

```php
    use Illuminate\Support\Facades\Validator;

    $validator = Validator::make(/* ... */);

    $validator->after(function ($validator) {
        if ($this->somethingElseIsInvalid()) {
            $validator->errors()->add(
                'field', 'Something is wrong with this field!'
            );
        }
    });

    if ($validator->fails()) {
        // ...
    }
```

Como observado, o método `after` também aceita um array de chamáveis, o que é particularmente conveniente se sua lógica de "validação após" estiver encapsulada em classes invocáveis, as quais receberão uma instância do tipo `Illuminate\Validation\Validator`, por meio do seu método `__invoke`:

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;

$validator->after([
    new ValidateUserStatus,
    new ValidateShippingTime,
    function ($validator) {
        // ...
    },
]);
```

## Trabalhando com entrada validada
Após confirmar os dados de uma requisição usando um formulário ou uma instância manualmente criada do objeto `Validator`, é possível recuperar os dados da requisição que foram efetivamente validados. Isto pode ser realizado de várias maneiras: primeiramente, você pode chamar o método `validated` em uma requisição de formulário ou uma instância do objeto `Validator`. Este método retorna um array com os dados que foram validados:

```php
    $validated = $request->validated();

    $validated = $validator->validated();
```

Como alternativa, você pode chamar o método `safe` de uma solicitação de formulário ou instância do validador. Este método retorna uma instância de `Illuminate\Support\ValidatedInput`. Esse objeto permite acessar os métodos `only`, `except`, e `all` para recuperar um subconjunto dos dados validados ou todo o array de dados validados:

```php
    $validated = $request->safe()->only(['name', 'email']);

    $validated = $request->safe()->except(['name', 'email']);

    $validated = $request->safe()->all();
```

Além disso, a instância `Illuminate\Support\ValidatedInput` pode ser iterada e utilizada como um array.

```php
    // Os dados validados podem ser iterados...
    foreach ($request->safe() as $key => $value) {
        // ...
    }

    // Os dados validados podem ser acessados ​​como um array...
    $validated = $request->safe();

    $email = $validated['email'];
```

Se desejar adicionar campos adicionais aos dados validados, você pode chamar a método `merge`:

```php
    $validated = $request->safe()->merge(['name' => 'Taylor Otwell']);
```

Se desejar recuperar os dados validados como uma instância de coleção ([collections](/docs/collections)), poderá chamar o método `collect`:

```php
    $collection = $request->safe()->collect();
```

## Trabalhando com mensagens de erro
Após chamar o método `errors` em uma instância do tipo `Validator`, você receberá uma instância da classe `Illuminate\Support\MessageBag`. Ela tem vários métodos convenientes para trabalhar com mensagens de erro. A variável `$errors`, automaticamente disponível para todas as views, também é uma instância do tipo `MessageBag`.


#### Recuperação da primeira mensagem de erro para um campo
Para obter a primeira mensagem de erro para um determinado campo, utilize o método `first`:

```php
    $errors = $validator->errors();

    echo $errors->first('email');
```

#### Recuperar todas as mensagens de erro para um campo
Se você precisar recuperar um conjunto de todos ass mensagens para um determinado campo, use o método "get":

```php
    foreach ($errors->get('email') as $message) {
        // ...
    }
```

Se você estiver a validar um campo do formulário numa matriz, você pode recuperar todas as mensagens para cada um dos elementos da matriz utilizando o caractere `*`:

```php
    foreach ($errors->get('attachments.*') as $message) {
        // ...
    }
```

#### Recuperar todas as mensagens de erro para todos os campos
Para recuperar uma matriz de todas as mensagens em todos os campos, utilize o método `all`:

```php
    foreach ($errors->all() as $message) {
        // ...
    }
```

#### Determinar se há mensagens para um campo
O método `has` pode ser utilizado para verificar se algumas mensagens de erro estão definidas para um campo específico:

```php
    if ($errors->has('email')) {
        // ...
    }
```

### Especificando mensagens personalizadas em arquivos de idiomas
Cada regra de validação interna do Laravel tem uma mensagem de erro que está localizada no arquivo `en/validation.php` da sua aplicação. Se a sua aplicação não possuir um diretório `lang`, você poderá instruir o Laravel a criar esse diretório usando o comando do Artisan `lang:publish`.

No arquivo `lang/en/validation.php`, você encontra uma entrada de tradução para cada regra de validação, sendo que o código pode ser alterado ou modificado com base nas necessidades do aplicativo.

Além disso, você pode copiar este arquivo para um diretório de idiomas para traduzir as mensagens do seu aplicativo. Para obter mais informações sobre localização no Laravel, confira a documentação completa em [localização](/docs/localization).

::: warning ATENÇÃO
Por padrão, o esqueleto de aplicativo do Laravel não inclui a pasta `lang`. Se você pretender personalizar os ficheiros de idiomas do Laravel, você pode publicá-los através do comando Artisan `lang:publish`.
:::

#### Mensagens personalizadas para atributos específicos
Você pode personalizar as mensagens de erro usadas para combinações de atributos e regras dentro dos arquivos da linguagem de validação do seu aplicativo. Para fazer isso, adicione suas personalizações de mensagem ao array `custom` do arquivo de linguagem `lang/xx/validation.php`:

```php
    'custom' => [
        'email' => [
            'required' => 'We need to know your email address!',
            'max' => 'Your email address is too long!'
        ],
    ],
```

### Especificando atributos em ficheiros de idiomas
Muitas mensagens de erros integradas no Laravel incluem um marcador `:attribute`, que é substituído pelo nome do campo ou atributo sob validação. Se pretender que a porção `:attribute` da sua mensagem de validação seja substituída por um valor personalizado, você pode especificar o nome do atributo personalizado no array `attributes` do seu ficheiro de idioma `lang/xx/validation.php`:

```php
    'attributes' => [
        'email' => 'email address',
    ],
```

::: warning ATENÇÃO
Por padrão, o esqueleto de aplicação do Laravel não inclui a pasta `lang`. Se você pretender personalizar os ficheiros de idioma do Laravel, poderá publicá-los através do comando "lang:publish" do Artisan.
:::

### Especificando valores em arquivos de idiomas
Algumas das mensagens de erro das regras de validação interna do Laravel possuem um sinalizador `:value`, que é substituído pelo valor atual do atributo da requisição. No entanto, você pode precisar, por vezes, de substituir o bloco `:value` de sua mensagem de validação por uma representação personalizada do valor. Por exemplo, considere a seguinte regra que especifica que um número de cartão de crédito é necessário se o `payment_type` tiver um valor igual a `cc`:

```php
    Validator::make($request->all(), [
        'credit_card_number' => 'required_if:payment_type,cc'
    ]);
```

Se a regra de validação falhar, produzirá a seguinte mensagem de erro:

```
The credit card number field is required when payment type is cc.
```

Em vez de exibir `cc` como o valor do tipo de pagamento, você pode especificar uma representação de valor mais amigável em seu arquivo de idioma `lang/xx/validation.php` definindo um array `values`:

```php
    'values' => [
        'payment_type' => [
            'cc' => 'credit card'
        ],
    ],
```

::: warning ATENÇÃO
Por padrão, o esqueleto da aplicação Laravel não inclui o diretório `lang`. Se você quiser personalizar os arquivos de linguagem do Laravel, você pode publicá-los através do comando `lang:publish` Artisan.
:::

Após definir esse valor, a regra de validação produz o seguinte erro:

```
The credit card number field is required when payment type is credit card.
```

## Regras de validação disponíveis
Abaixo está uma lista de todas as regras disponíveis de validação e sua função:

<style>
.collection-method-list > p {
    columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
}

.collection-method-list a {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>

<div class="collection-method-list" markdown="1">

- [Accepted](#rule-accepted)
- [Accepted If](#rule-accepted-if)
- [Active URL](#rule-active-url)
- [After (Date)](#rule-after)
- [After Or Equal (Date)](#rule-after-or-equal)
- [Alpha](#rule-alpha)
- [Alpha Dash](#rule-alpha-dash)
- [Alpha Numeric](#rule-alpha-num)
- [Array](#rule-array)
- [Ascii](#rule-ascii)
- [Bail](#rule-bail)
- [Before (Date)](#rule-before)
- [Before Or Equal (Date)](#rule-before-or-equal)
- [Between](#rule-between)
- [Boolean](#rule-boolean)
- [Confirmed](#rule-confirmed)
- [Contains](#rule-contains)
- [Current Password](#rule-current-password)
- [Date](#rule-date)
- [Date Equals](#rule-date-equals)
- [Date Format](#rule-date-format)
- [Decimal](#rule-decimal)
- [Declined](#rule-declined)
- [Declined If](#rule-declined-if)
- [Different](#rule-different)
- [Digits](#rule-digits)
- [Digits Between](#rule-digits-between)
- [Dimensions (Image Files)](#rule-dimensions)
- [Distinct](#rule-distinct)
- [Doesnt Start With](#rule-doesnt-start-with)
- [Doesnt End With](#rule-doesnt-end-with)
- [Email](#rule-email)
- [Ends With](#rule-ends-with)
- [Enum](#rule-enum)
- [Exclude](#rule-exclude)
- [Exclude If](#rule-exclude-if)
- [Exclude Unless](#rule-exclude-unless)
- [Exclude With](#rule-exclude-with)
- [Exclude Without](#rule-exclude-without)
- [Exists (Database)](#rule-exists)
- [Extensions](#rule-extensions)
- [File](#rule-file)
- [Filled](#rule-filled)
- [Greater Than](#rule-gt)
- [Greater Than Or Equal](#rule-gte)
- [Hex Color](#rule-hex-color)
- [Image (File)](#rule-image)
- [In](#rule-in)
- [In Array](#rule-in-array)
- [Integer](#rule-integer)
- [IP Address](#rule-ip)
- [JSON](#rule-json)
- [Less Than](#rule-lt)
- [Less Than Or Equal](#rule-lte)
- [List](#rule-list)
- [Lowercase](#rule-lowercase)
- [MAC Address](#rule-mac)
- [Max](#rule-max)
- [Max Digits](#rule-max-digits)
- [MIME Types](#rule-mimetypes)
- [MIME Type By File Extension](#rule-mimes)
- [Min](#rule-min)
- [Min Digits](#rule-min-digits)
- [Missing](#rule-missing)
- [Missing If](#rule-missing-if)
- [Missing Unless](#rule-missing-unless)
- [Missing With](#rule-missing-with)
- [Missing With All](#rule-missing-with-all)
- [Multiple Of](#rule-multiple-of)
- [Not In](#rule-not-in)
- [Not Regex](#rule-not-regex)
- [Nullable](#rule-nullable)
- [Numeric](#rule-numeric)
- [Present](#rule-present)
- [Present If](#rule-present-if)
- [Present Unless](#rule-present-unless)
- [Present With](#rule-present-with)
- [Present With All](#rule-present-with-all)
- [Prohibited](#rule-prohibited)
- [Prohibited If](#rule-prohibited-if)
- [Prohibited Unless](#rule-prohibited-unless)
- [Prohibits](#rule-prohibits)
- [Regular Expression](#rule-regex)
- [Required](#rule-required)
- [Required If](#rule-required-if)
- [Required If Accepted](#rule-required-if-accepted)
- [Required If Declined](#rule-required-if-declined)
- [Required Unless](#rule-required-unless)
- [Required With](#rule-required-with)
- [Required With All](#rule-required-with-all)
- [Required Without](#rule-required-without)
- [Required Without All](#rule-required-without-all)
- [Required Array Keys](#rule-required-array-keys)
- [Same](#rule-same)
- [Size](#rule-size)
- [Sometimes](#validating-when-present)
- [Starts With](#rule-starts-with)
- [String](#rule-string)
- [Timezone](#rule-timezone)
- [Unique (Database)](#rule-unique)
- [Uppercase](#rule-uppercase)
- [URL](#rule-url)
- [ULID](#rule-ulid)
- [UUID](#rule-uuid)

</div>

<a name="rule-accepted"></a>
#### accepted
O campo em validação deve ser `"yes"`, `"on"`, `1`, `"1"`, `true` ou `"true"`. Isso é útil para a aceitação de termos de serviço e campos similares.

<a name="rule-accepted-if"></a>
#### accepted_if:anotherfield,value,...
O campo em validação deve ser definido como `"yes"`, `"on"`, `1`, `"1"` ou `true`, se outro campo estiver em validação e for igual a um valor especificado. Isso é útil para validar a aceitação dos "Termos de Serviço", por exemplo.

<a name="rule-active-url"></a>
#### active_url
O campo em fase de validação deve possuir um registo válido A ou AAAA, de acordo com a função `dns_get_record` do PHP. O nome host da URL fornecida é extraído através da função `parse_url` antes de ser passado para a `dns_get_record`.

<a name="rule-after"></a>
#### after:_date_
O campo que você está tentando validar deve ter um valor após uma determinada data. As datas serão enviadas para a função PHP `strtotime` para conversão em uma instância do tipo DateTime válida:

```php
    'start_date' => 'required|date|after:tomorrow'
```

Em vez de passar uma string de data para ser avaliada por `strtotime`, você pode especificar outro campo para comparar com a data:

```php
    'finish_date' => 'required|date|after:start_date'
```

#### after\_or\_equal:_data_
O campo em validação deve ser um valor que seja maior ou igual ao da data fornecida. Para mais informações, consulte a regra [after](#rule-after).

<a name="rule-alpha"></a>
#### alpha

O campo em validação deve conter apenas caracteres alfabéticos Unicode contidos em [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=) e [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=).

Para restringir essa regra de validação a caracteres da faixa ASCII (`a-z` e `A-Z`), você pode fornecer a opção `ascii` à regra de validação.

```php
'username' => 'alpha:ascii',
```

<a name="rule-alpha-dash"></a>
#### alpha_dash

O campo sob validação deve ser inteiramente formado por caracteres alfanuméricos Unicode contidos em [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [`\p{N}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=), assim como traços ASCII (`-`) e sublinhados ASCII ( `_` ).

Para limitar essa regra de validação a caracteres na gama ASCII (de `a-z` e `A-Z`), você pode fornecer a opção `ascii` à regra de validação:

```php
'username' => 'alpha_dash:ascii',
```

<a name="rule-alpha-num"></a>
#### alfa_num
O campo sob validação deve conter somente caracteres alfanuméricos Unicode contidos em [`\p{L}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [`\p{M}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=) e [`\p{N}`](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=).

Para restringir esta regra de validação a caracteres no intervalo ASCII (`a-z` e `A-Z`), você pode fornecer a opção `ascii` à regra de validação:

```php
'username' => 'alpha_num:ascii',
```

<a name="rule-array"></a>
#### array
O campo em validação deve ser um `array` de código PHP.

Se forem fornecidos valores adicionais à regra array, cada chave no array de entrada deve estar presente na lista de valores fornecida à regra. No exemplo a seguir, a chave `admin` do array de entrada é inválida uma vez que não está incluída na lista de valores fornecidos à regra `array`:

```php
    use Illuminate\Support\Facades\Validator;

    $input = [
        'user' => [
            'name' => 'Taylor Otwell',
            'username' => 'taylorotwell',
            'admin' => true,
        ],
    ];

    Validator::make($input, [
        'user' => 'array:name,username',
    ]);
```

Em geral, você deve sempre especificar as chaves de matriz que podem estar presente em sua matriz.

<a name="rule-ascii"></a>
#### ASCII
O campo em fase de validação deve ser inteiramente constituído por caracteres de 7 bits ASCII.

<a name="rule-bail"></a>
#### bail
Para parar de executar as regras de validação do campo após o primeiro erro de validação.

Enquanto a regra `bail` só parará de validar um campo específico quando ela encontrar uma falha, a regra `stopOnFirstFailure` informa o validador que ele deve parar de validar todos os atributos assim que houver uma única falha:

```php
    if ($validator->stopOnFirstFailure()->fails()) {
        // ...
    }
```

<a name="rule-before"></a>
#### before:_date_
O campo sob validação deve ser um valor anterior à data especificada. As datas serão passadas para a função PHP `strtotime` com o objetivo de serem convertidas em uma instância da classe DateTime válida. Além disso, tal como na regra [`after`](#rule-after), pode ser fornecido o nome de um outro campo sob validação como valor para a chave `date`.

<a name="rule-before-or-equal"></a>
#### before\_or\_equal:_date_
O campo sob validação deve ser um valor que precede ou é igual à data especificada. As datas são passadas para a função PHP `strtotime` para conversão em uma instância válida do tipo DateTime. Além disso, assim como a regra [`after`](#rule-after), o nome de outro campo sob validação pode ser fornecido no valor da data.

<a name="rule-between"></a>
#### between:_min_,_max_
O campo sob validação deve ter um tamanho entre o especificado no campo _min_ e _max_ (inclusive). Strings, números, arrays e arquivos são avaliados da mesma maneira que as regras [`size`](#rule-size)

<a name="rule-boolean"></a>
#### boolean
O campo em validação precisa ser capaz de ser convertido para um booleano, que são aceitos como `true`, `false`, `1`, `0`, `"1"` e `"0"`.

<a name="rule-confirmed"></a>
#### confirmed
O campo em validação deve ter um campo correspondente de `{field}_confirmation`. Por exemplo, se o campo em validação for `password`, um campo `password_confirmation` correspondente deverá estar presente na entrada.

<a name="rule-contains"></a>
#### contains:_foo_,_bar_,...
O campo em validação deve ser uma matriz que contém todos os valores de parâmetros fornecidos.

<a name="rule-current-password"></a>
#### current_password
O campo sob validação deve corresponder à senha do usuário autenticado. Você pode especificar um [guarda de autenticação](/docs/authentication) usando o primeiro parâmetro da regra:

```php
    'password' => 'current_password:api'
```

<a name="rule-date"></a>
#### date
O campo em validação deve ser uma data válida e absoluta de acordo com a função PHP `strtotime`.

<a name="rule-date-equals"></a>
#### date_equals:_date_
O campo em validação deve ser igual à data especificada. As datas são passadas para a função `strtotime` do PHP, que as converte em uma instância de tipo `DateTime` válida.

<a name="rule-date-format"></a>
#### date_format:_format_,...
O campo em validação deve corresponder a um dos _formatos_ fornecidos. Você deve usar o `date` ou `date_format` ao validar um campo, não ambos. Esta regra de validação suporta todos os formatos suportados pela classe [DateTime](https://www.php.net/manual/en/class.datetime.php) do PHP.

<a name="rule-decimal"></a>
#### decimal:_min_,_max_
O campo em fase de validação deve ser numérico e deve conter o número especificado de casas decimais:

```php
    // Deve ter exatamente duas casas decimais (9,99)...
    'price' => 'decimal:2'

    // Deve ter entre 2 e 4 casas decimais...
    'price' => 'decimal:2,4'
```

<a name="rule-declined"></a>
#### declined
O campo em validação deve ser `"no"`, `"off"`, `0`, `"0"`, `false`, ou `"false"`.

<a name="rule-declined-if"></a>
#### declined_if:anotherfield,value,...
 O campo em validação deve ser `"sim"`, `"on"`, `"1"`, `"true"`, `"true"` ou `1` se outro campo for igual ao valor especificado.

<a name="rule-different"></a>
#### different:_field_
O campo em validação deve ter um valor diferente de _field_

<a name="rule-digits"></a>
#### digits:_value_
O número inteiro sob validação deve ter um comprimento exato de _value_ (_valor_).

<a name="rule-digits-between"></a>
#### digits_between:_min_,_max_
A validação do inteiro deve ter um comprimento entre os valores especificados em _min_ e _max_.

<a name="rule-dimensions"></a>
#### dimensions
O arquivo em validação deve ser uma imagem com as restrições de dimensão, conforme especificado pelos parâmetros da regra:

```php
    'avatar' => 'dimensions:min_width=100,min_height=200'
```

As restrições disponíveis são as seguintes: _min\_width_, _max\_width_, _min\_height_, _max\_height_, _width_, _height_, _ratio_.

O critério de restrição para _ratio_ deve ser representado pela divisão entre largura e altura. Isso pode ser especificado como uma fração, como `3/2`, ou um número flutuante, como `1.5`:

```php
    'avatar' => 'dimensions:ratio=3/2'
```

Como essa regra requer vários argumentos, você pode usar o método `Rule::dimensions` para construir a regra de maneira mais fluente:

```php
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'avatar' => [
            'required',
            Rule::dimensions()->maxWidth(1000)->maxHeight(500)->ratio(3 / 2),
        ],
    ]);
```

<a name="rule-distinct"></a>
#### distinct
Ao validar matrizes, o campo sob validação não pode possuir qualquer valor duplicado:

```php
    'foo.*.id' => 'distinct'
```

O `distinct` usa em modo padrão, comparações de variáveis "suficientemente próximas". Se quiser usar comparações "estritas", você pode adicionar o parâmetro `strict` à definição da regra de validação:

```php
    'foo.*.id' => 'distinct:strict'
```

Você pode adicionar "ignore_case" aos argumentos da regra de validação para fazer com que a regra ignore diferenças de capitalização:

```php
    'foo.*.id' => 'distinct:ignore_case'
```

<a name="rule-doesnt-start-with"></a>
#### doesnt_start_with:_foo_,_bar_,...
O campo que está sendo validado não pode começar com um dos valores fornecidos.

<a name="rule-doesnt-end-with"></a>
#### doesnt_end_with:_foo_,_bar_,...
O campo em validação não pode terminar com um dos valores apresentados.

<a name="rule-email"></a>
#### email
O campo sob validação deve ser formatado como um endereço de e-mail. Esta regra de validação utiliza o pacote [`egulias/email-validator`](https://github.com/egulias/EmailValidator) para validar o endereço de e-mail. Por padrão, a validação `RFCValidation` é aplicada, mas também podem ser aplicados outros estilos de validação:

```php
    'email' => 'email:rfc,dns'
```

O exemplo acima irá aplicar as validações `RFCValidation` e `DNSCheckValidation`. Aqui está uma lista completa de estilos de validação que você pode aplicar:

- `rfc`: `RFCValidation`
- `strict`: `NoRFCWarningsValidation`
- `dns`: `DNSCheckValidation`
- `spoof`: `SpoofCheckValidation`
- `filter`: `FilterEmailValidation`
- `filter_unicode`: `FilterEmailValidation::unicode()`

O validador `filter`, que utiliza a função `filter_var` do PHP, está presente no Laravel e era o comportamento padrão de validação de emails no Laravel antes da versão 5.8.

::: warning ATENÇÃO
Os validadores `dns` e `spoof` requerem a extensão PHP `intl`.
:::

<a name="rule-ends-with"></a>
#### ends_with:_foo_,_bar_,...
O campo em validação deve terminar com um dos valores indicados.

<a name="rule-enum"></a>
#### enum
A regra `Enum` é uma regra baseada em classe que valida se o campo sob validação contém um valor enum válido. A regra `Enum` aceita o nome do enum como único argumento de seu construtor. Para avaliação de valores primitivos, deve ser fornecido ao recurso `Enum`:

```php
    use App\Enums\ServerStatus;
    use Illuminate\Validation\Rule;

    $request->validate([
        'status' => [Rule::enum(ServerStatus::class)],
    ]);
```

Os métodos `only` e `except` da regra `Enum` podem ser utilizados para limitar quais casos do enum devem ser considerados válidos:

```php
    Rule::enum(ServerStatus::class)
        ->only([ServerStatus::Pending, ServerStatus::Active]);

    Rule::enum(ServerStatus::class)
        ->except([ServerStatus::Pending, ServerStatus::Active]);
```

O método `when` pode ser utilizado para modificar de forma condicional a regra do `Enum`:

```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

Rule::enum(ServerStatus::class)
    ->when(
        Auth::user()->isAdmin(),
        fn ($rule) => $rule->only(...),
        fn ($rule) => $rule->only(...),
    );
```

<a name="rule-exclude"></a>
#### exclude
O campo sob validação será excluído dos dados da requisição retornado pelos métodos `validate` e `validated`.

<a name="rule-exclude-if"></a>
#### exclude_if:_anotherfield_,_value_
O campo sob validação será excluído dos dados do pedido retornado pelos métodos `validate` e `validated`, se o campo _anotherfield_ for igual a _value_

Se for necessária uma lógica de exclusão condicional complexa, você pode utilizar o método `Rule::excludeIf`. Este método aceita um booleano ou um closure. Ao passar um closure, ele deve retornar `true` ou `false` para indicar se o campo sob validação deve ser excluído:

```php
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($request->all(), [
        'role_id' => Rule::excludeIf($request->user()->is_admin),
    ]);

    Validator::make($request->all(), [
        'role_id' => Rule::excludeIf(fn () => $request->user()->is_admin),
    ]);
```

<a name="rule-exclude-unless"></a>
#### exclude_unless:_anotherfield_,_value_
O campo sob validação será excluído dos dados solicitados devolvidos pelos métodos `validate` e `validated` a menos que o campo `_anotherfield_` seja igual ao `_value_`. Se `_value_` for `null` (`exclude_unless:name,null`), o campo sob validação será excluído, exceto se o campo da comparação for `null` ou estiver faltando nos dados de solicitação.

<a name="rule-exclude-with"></a>
#### exclude_with:_anotherfield_
O campo sob validação será excluído dos dados da solicitação retornada pelos métodos `validate` e `validated`, se o campo `_anotherfield_` estiver presente.

<a name="rule-exclude-without"></a>
#### exclude_without:_anotherfield_
O campo sob validação será excluído dos dados de requisição retornados pelos métodos `validate` e `validated` se o campo `_anotherfield_` não estiver presente.

<a name="rule-exists"></a>
#### exists:_table_,_column_
O campo em validação deve existir numa determinada tabela de base de dados.

<a name="basic-usage-of-exists-rule"></a>
#### Uso Básico da Regra de Existência

```php
    'state' => 'exists:states'
```

Se não for especificado o nome de campo, será utilizada a opção `column`. Assim, neste caso, a regra irá validar se existe um registo na tabela da base de dados `states`, com um valor do campo correspondente ao valor do atributo `state` no pedido.

<a name="specifying-a-custom-column-name"></a>
#### Especificando um Nome de Coluna Personalizado

Você pode especificar explicitamente o nome da coluna de base de dados que deve ser usado pela regra de validação colocando-o após o nome da tabela de banco de dados:

```php
    'state' => 'exists:states,abbreviation'
```

Às vezes é necessário especificar uma ligação de base de dados específica para utilização da consulta `exists`. O procedimento é o seguinte: antecede o nome da tabela com o nome da ligação:

```php
    'email' => 'exists:connection.staff,email'
```

Em vez de especificar o nome da tabela diretamente, você pode especificar o modelo Eloquent que deve ser usado para determinar o nome da tabela:

```php
    'user_id' => 'exists:App\Models\User,id'
```

Se você deseja personalizar a consulta executada pela regra de validação, pode usar a classe `Rule` para definir a regra com facilidade. Nesse exemplo, também especificaremos as regras de validação como um array em vez de usar o caractere `|` para delimitar elas:

```php
    use Illuminate\Database\Query\Builder;
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'email' => [
            'required',
            Rule::exists('staff')->where(function (Builder $query) {
                return $query->where('account_id', 1);
            }),
        ],
    ]);
```

Você pode especificar explicitamente o nome da coluna de banco de dados que deve ser usado pela regra `exists` gerada pelo método `Rule::exists`, fornecendo o nome da coluna como segundo argumento para o método `exists`:

```php
    'state' => Rule::exists('states', 'abbreviation'),
```

<a name="rule-extensions"></a>
#### extensions:_foo_,_bar_,...
O arquivo em fase de validação deve ter uma extensão atribuída pelo usuário que corresponda a uma das extensões listadas:

```php
    'photo' => ['required', 'extensions:jpg,png'],
```

::: warning ATENÇÃO
Você nunca deve confiar na validação de um arquivo apenas pela extensão atribuída pelo usuário. Esta regra normalmente sempre deve ser usada em combinação com as regras [`mimes`](#rule-mimes) ou [`mimetypes`](#rule-mimetypes).
:::

<a name="rule-file"></a>
#### file
O campo em validação deve ser um arquivo submetido com sucesso.

<a name="rule-filled"></a>
#### filled
O campo em validação não pode ficar em branco quando ele estiver presente.

<a name="rule-gt"></a>
#### gt:_field_

 O campo em validação deve ser maior que o campo ou valor especificado. Os dois campos devem ter o mesmo tipo. As strings, números, matrizes e arquivos são avaliados utilizando as mesmas convenções da regra [tamanho](#rule-size).

<a name="rule-gte"></a>
#### gt:_field_
O campo sob validação deve ser maior ou igual ao dado _field_ ou _value_. Os dois campos devem ser do mesmo tipo. As strings, números, arrays e arquivos são avaliados de acordo com as mesmas convenções das regras [`size`](#rule-size).

<a name="rule-hex-color"></a>
#### hex_color
O campo sob validação deve conter um valor de cor válido no formato [hexadecimal](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color).

<a name="rule-image"></a>
#### image
O arquivo que você está tentando validar deve ser um tipo de imagem (JPG, JPEG, PNG, BMP, GIF, SVG ou WEBP).

<a name="rule-in"></a>
#### in:_foo_,_bar_,...
O campo sob validação deve estar incluído na lista de valores dada. Dado que esta regra requer frequentemente o `implode` de um array, a função `Rule::in` pode ser utilizada para construir a regra de forma fluente:

```php
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'zones' => [
            'required',
            Rule::in(['first-zone', 'second-zone']),
        ],
    ]);
```

Quando a regra "in" é combinada com a regra "array", cada valor do array de entrada tem que estar presente na lista de valores fornecidos à regra "in". No exemplo a seguir, o código aeroportuário "LAS" no array de entrada é inválido uma vez que não está incluído na lista de códigos de aeroportos fornecida à regra "in":

```php
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    $input = [
        'airports' => ['NYC', 'LAS'],
    ];

    Validator::make($input, [
        'airports' => [
            'required',
            'array',
        ],
        'airports.*' => Rule::in(['NYC', 'LIT']),
    ]);
```

<a name="rule-in-array"></a>
#### in_array:_anotherfield_.*
O campo sob validação deve estar presente nos valores do campo "__anotherfield_"

<a name="rule-integer"></a>
#### inteiro
O campo de validação deve conter um número inteiro.

::: warning ATENÇÃO
Esta regra de validação não verifica se a entrada é do tipo de variável "inteira", apenas se a entrada é de um tipo aceito pela regra `FILTER_VALIDATE_INT` do PHP. Se você precisar validar a entrada como sendo um número, use esta regra em combinação com [a regra de validação `numérica`](#rule-numeric).
:::

<a name="rule-ip"></a>
#### ip
O campo em validação deve ser um endereço de IP.

<a name="ipv4"></a>
#### IPv4
O campo sob validação deve ser um endereço de IPv4.

<a name="ipv6"></a>
#### IPv6
O campo em validação tem de conter um endereço IPv6.

<a name="rule-json"></a>
#### Json
O campo sob validação deve ser uma string JSON válida.

<a name="rule-lt"></a>
#### lt:_field_
O campo em validação deve ser menor que o dado no campo. Os dois campos devem ter o mesmo tipo. As strings, números, arrays e arquivos são avaliados usando as mesmas convenções da regra ["size"](#rule-size).

<a name="rule-lte"></a>
#### lte:_field_
O campo sob validação deve ser menor que ou igual ao campo especificado _field_. Os dois campos devem pertencer ao mesmo tipo. As strings, números, arrays e arquivos são avaliados usando as mesmas convenções da regra [`size`](#rule-size).

<a name="rule-lowercase"></a>
#### lowercase
O campo em validação deve estar em minúsculas.

<a name="rule-list"></a>
#### list
O campo em validação deve ser uma matriz e, para que seja considerada um, as chaves devem ser números consecutivos de 0 a `count($array) - 1`.

<a name="rule-mac"></a>
#### mac_address
O campo em validação deve ser um endereço de hardware (MAC).

<a name="rule-max"></a>
#### max:_value_
O campo em validação deve ser inferior ou igual ao valor máximo. As strings, números, arrays e arquivos são avaliados da mesma forma que na regra [size](#rule-size).

<a name="rule-max-digits"></a>
#### max_digits:_value_
O inteiro a ser validado deve ter um comprimento máximo de _value_.

<a name="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...
 O arquivo em validação deve coincidir com um dos tipos de MIME indicados:

```php
    'video' => 'mimetypes:video/avi,video/mpeg,video/quicktime'
```

Para determinar o tipo MIME do arquivo carregado, seu conteúdo será lido e a estrutura tentará adivinhar o tipo MIME. Este pode ser diferente do fornecido pelo cliente.

<a name="rule-mimes"></a>
#### mimes:_foo_,_bar_,...
O arquivo em validação deve ter um tipo MIME correspondente a uma das extensões listadas:

```php
    'photo' => 'mimes:jpg,bmp,png'
```

Mesmo que você só precise especificar as extensões, essa regra realmente valida o tipo de MIME do arquivo lendo o conteúdo do arquivo e adivinhando seu tipo de MIME. Um catálogo completo com os tipos de MIME e suas correspondentes extensões pode ser encontrado em:

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="mime-types-and-extensions"></a>
#### Tipos e extensões do MIME

Esta regra de validação não verifica se existe concordância entre o tipo MIME e a extensão atribuída pelo usuário ao arquivo. Por exemplo, a regra de validação `mimes:png` considera um arquivo que contenha conteúdo válido para uma imagem PNG como sendo um arquivo com uma extensão válida para uma imagem PNG, mesmo se o nome do arquivo for `photo.txt`. Se pretender validar a extensão atribuída pelo usuário ao arquivo, pode usar a regra [`extensions`](#rule-extensions).

<a name="rule-min"></a>
#### min:_value_
O campo em validação deve ter um valor mínimo. As strings, números, matrizes e arquivos são avaliados da mesma forma que na regra [size](#rule-size).

<a name="rule-min-digits"></a>
#### min_digits:_value_
O inteiro a ser validado deve ter um comprimento mínimo de _value_.

<a name="rule-multiple-of"></a>
#### multiple_of:_value_
O campo em validação deve ser um múltiplo de _value_

<a name="rule-missing"></a>
#### missing
O campo sob validação não pode estar presente nos dados de entrada.

<a name="rule-missing-if"></a>
#### missing_if:_anotherfield_,_value_,...
O campo sob validação não pode estar presente se o campo __anotherfield__ for igual a qualquer _value_.

<a name="rule-missing-unless"></a>
#### missing_unless:_anotherfield_,_value_
O campo em validação não pode ser presente, a menos que o campo _anotherfield_ seja igual ao valor _value_.

<a name="rule-missing-with"></a>
### missing_with:_foo_,_bar_,...
O campo sob validação não deve estar presente _apenas se_ qualquer outro campo especificado estiver presente.

<a name="rule-missing-with-all"></a>
 ## missing_with_all:_foo_,_bar_,...
O campo em validação não pode estar presente _somente se_ todos os outros campos especificados estiverem presentes.

<a name="rule-not-in"></a>
#### not_in:_foo_,_bar_,...
O campo sob validação não pode ser incluído na lista de valores especificada. O método `Rule::notIn` pode ser usado para construir a regra da forma mais fluída possível:

```php
    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'toppings' => [
            'required',
            Rule::notIn(['sprinkles', 'cherries']),
        ],
    ]);
```

<a name="rule-not-regex"></a>
#### not_regex:_pattern_
O campo sob validação não deve corresponder à expressão regular indicada.

Internamente, essa regra utiliza a função PHP `preg_match`. O padrão especificado deve respeitar o mesmo formato exigido pelo `preg_match` e, portanto, também inclui os delimitadores válidos. Por exemplo: `'email' => 'not_regex:/^.+$/i'`.

::: warning ATENÇÃO
Ao utilizar os padrões de `regex`/ `not_regex`, pode ser necessário especificar suas regras de validação utilizando um array em vez do delimitador `||`, especialmente se a expressão regular conter um caractere `|`.
:::

<a name="rule-nullable"></a>
#### nullable
O campo sob validação pode estar `null`.

<a name="rule-numeric"></a>
#### numeric
O campo em validação deve ser [numérico](https://www.php.net/manual/en/function.is-numeric.php).

<a name="rule-present"></a>
#### present
O campo em validação deve existir nos dados de entrada.

<a name="rule-present-if"></a>
#### present_if:_anotherfield_,_value_,...
Se o campo for igual a algum valor, é necessário que o campo em fase de validação esteja presente.

<a name="rule-present-unless"></a>
#### present_unless:_anotherfield_,_value_
O campo sob validação deve estar presente, a menos que o campo _anotherfield_ seja igual a qualquer valor.

<a name="rule-present-with"></a>
#### present_with:_foo_,_bar_,...
O campo sob validação só deve estar presente se existir algum dos demais campos especificados.

<a name="rule-present-with-all"></a>
#### present_with_all:_foo_,_bar_,...
O campo em fase de validação só pode estar presente _se todos_ os outros campos especificados estiverem presentes.

<a name="rule-prohibited"></a>
#### prohibited
O campo em validação está faltando ou está vazio. Um campo é considerado vazio se preencher um dos seguintes critérios:

- O valor é `null`.
- O valor é uma string vazia.
- O valor é um array vazio ou um objeto `Countable` vazio.
- O valor é um ficheiro que foi carregado com um caminho vazio.

<a name="rule-prohibited-if"></a>
#### prohibited_if:_anotherfield_,_value_,...
O campo em validação deverá estar ausente ou vazio se o campo _anotherfield_ for igual a qualquer _value_. Um campo estará "vazio" se atender a um dos seguintes critérios:

 - O valor é `null`.
 - O valor é uma string vazia.
 - O valor é um vetor vazio ou um objeto contável vazio.
 - O valor é um arquivo carregado com um caminho vazio.

Se for necessário uma lógica complexa de proibição condicional, você poderá utilizar o método `Rule::prohibitedIf`. Esse método aceita um booleano ou uma closure. Quando é dado uma closure, esse deve retornar `true` ou `false` para indicar se o campo em questão deverá ser proibido:

```php
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($request->all(), [
        'role_id' => Rule::prohibitedIf($request->user()->is_admin),
    ]);

    Validator::make($request->all(), [
        'role_id' => Rule::prohibitedIf(fn () => $request->user()->is_admin),
    ]);
```

<a name="rule-prohibited-unless"></a>
#### prohibited_unless:_anotherfield_,_value_,...
O campo em validação deve estar faltando ou vazio, a menos que o campo _anotherfield_ seja igual ao valor qualquer. Um campo é considerado "vazio" se cumprir um dos seguintes critérios:

- O valor é "nulo".
- O valor é um vazio de caracteres.
- O valor é um conjunto ou objeto contável vazio.
- O valor é um arquivo submetido com um caminho vazio.

<a name="rule-prohibits"></a>
#### prohibits:_anotherfield_,...
Se o campo em processo de validação não estiver faltando ou vazio, todos os campos do campo _anotherfield_ devem estar faltando ou vazios. Um campo é "vazio" se atender a um dos seguintes critérios:

- O valor é `nulo`.
- O valor é um string vazio.
- O valor é um array vazio ou um objeto contável (Countable) vazio.
- O valor é um arquivo enviado com um caminho vazio.

<a name="rule-regex"></a>
#### regex:_pattern_
O campo em validação deve corresponder ao padrão informado.

Internamente, essa regra utiliza a função PHP `preg_match`. O padrão especificado deve obedecer à mesma formatação exigida pela `preg_match` e, portanto, também inclui os delimitadores válidos. Por exemplo: `'email' => 'regex:/^.+@.+$/i'`.

::: warning ATENÇÃO
Ao usar os padrões `regex`/ `not_regex`, pode ser necessário especificar regras em uma matriz ao invés de utilizar os símbolos de delimitadores `|`. Isto, principalmente, se a expressão regular conter o caractere `|`.
:::

<a name="rule-required"></a>
#### required
O campo em fase de validação deve estar presente nos dados de entrada e não pode ficar vazio. Um campo considera-se "vazio" se atender a um dos seguintes critérios:

- O valor é nulo.
- O valor é um vazio de caracteres.
- O valor é um vetor vazio ou objeto contável vazio.
- O valor é um arquivo enviado sem caminho.

<a name="rule-required-if"></a>
#### required_if:_anotherfield_,_value_,...
O campo de validação não pode ser omitido e não pode ficar em branco se o campo _anotherfield_ for igual a qualquer um dos _value_ .

Se você pretender construir uma condição mais complexa para a regra `required_if`, pode utilizar o método `Rule::requiredIf`. Este método aceita um booleano ou um closure. Quando passado um closure, esse deve devolver `true` ou `false` para indicar se o campo em fase de validação é obrigatório:

```php
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($request->all(), [
        'role_id' => Rule::requiredIf($request->user()->is_admin),
    ]);

    Validator::make($request->all(), [
        'role_id' => Rule::requiredIf(fn () => $request->user()->is_admin),
    ]);
```

<a name="rule-required-if-accepted"></a>
#### required_if_accepted:_anotherfield_,...
O campo de validação tem que estar presente e não pode ficar em branco se o campo _anotherfield_ tiver um valor igual a `"yes"`, `"on"`, `1`, `"1"`, `true`, ou `"true"`.

<a name="rule-required-if-declined"></a>
#### required_if_declined:_anotherfield_,...
O campo em validação deve ser presente e não pode estar vazio se o campo _anotherfield_ tiver um valor igual a `"no"`, `"off"`, `0`, `"0"`, `false`, ou `"false"`.

<a name="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

O campo em validação deve estar presente e não pode ser deixado vazio, exceto se o campo _anotherfield_ for igual a qualquer valor. Isso também significa que o campo _anotherfield_ deve estar presente nos dados da solicitação, exceto se o valor for `null`. Se o valor for `null` (`required_unless:name,null`), será exigido que o campo em validação esteja presente, exceto se o campo de comparação estiver `null` ou não estiver presentes nos dados da solicitação.

<a name="rule-required-with"></a>
#### requerido:_foo_,_bar_,...
O campo sob validação deve estar presente e não em branco _somente se__ algum dos demais campos especificados estiver presente e não em branco.

<a name="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...
O campo em validação não pode estar vazio _apenas se_ todos os demais campos especificados estiverem presentes e não estiverem vazios.

<a name="rule-required-without"></a>
#### necessário_sempre: _foo, _bar_, ...
O campo sob validação deve estar presente e não ser vazio apenas se qualquer um dos outros campos especificados estiverem em branco ou ausentes.

<a name="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...
O campo sob validação só poderá estar presente e não ser deixado em branco quando todos os demais campos especificados estiverem vazios ou faltarem.

<a name="rule-required-array-keys"></a>
#### required_array_keys:_foo_,_bar_,...
O campo em fase de validação deve ser um array e deve conter pelo menos as chaves especificadas.

<a name="rule-same"></a>
#### same:_field_
O campo especificado deve corresponder ao campo que está a ser validado.

<a name="rule-size"></a>
#### size:_value_
O campo sob validação deve ter um tamanho correspondente ao valor passado. Para dados de string, o valor corresponde ao número de caracteres. Para dados numéricos, o valor corresponde a um determinado valor inteiro (o atributo também precisa ter uma regra `numeric` ou `integer`). Para um array, o tamanho corresponde ao `count` do array. Para arquivos, o tamanho corresponde ao tamanho em kilobytes. Vejamos alguns exemplos:

```php
    // Valide que uma string tem exatamente 12 caracteres...
    'title' => 'size:12';

    // Valide que um número inteiro fornecido é igual a 10...
    'seats' => 'integer|size:10';

    // Valide que um array tem exatamente 5 elementos...
    'tags' => 'array|size:5';

    // Valide se um arquivo enviado tem exatamente 512 kilobytes...
    'image' => 'file|size:512';
```

<a name="rule-starts-with"></a>
#### starts_with:_foo_,_bar_,...
O campo submetido à validação deve iniciar com um dos valores indicados.

<a name="rule-string"></a>
#### string
O campo em validação deve ser um tipo de dado. Para permitir que o campo tenha valor nulo, atribua a regra "nulo permitido" ao campo.

<a name="rule-timezone"></a>
#### timezone
O campo sob validação deve ser um identificador de fuso horário válido, de acordo com o método `DateTimeZone::listIdentifiers`.

Os argumentos [aceitos pelo método `DateTimeZone::listIdentifiers`](https://www.php.net/manual/en/datetimezone.listidentifiers.php) também podem ser fornecidos a essa regra de validação:

```php
    'timezone' => 'required|timezone:all';

    'timezone' => 'required|timezone:Africa';

    'timezone' => 'required|timezone:per_country,US';
```

<a name="rule-unique"></a>
#### unique:_table_,_column_
O campo em validação não deve existir na tabela de banco de dados fornecida.

 **Especificação de um nome personalizado para uma tabela/coluna**

Em vez de especificar o nome da tabela diretamente, você pode especificar o modelo Eloquent que deve ser usado para determinar o nome da tabela:

```php
    'email' => 'unique:App\Models\User,email_address'
```

A opção `column` permite especificar a coluna correspondente do banco de dados. Se não for especificada, será utilizado o nome do campo em causa para efeitos de validação.

```php
    'email' => 'unique:users,email_address'
```

**Definir uma conexão de banco de dados personalizada**

Ocasionalmente, você poderá precisar definir uma conexão personalizada para consultas de banco de dados feitas pelo validador. Para fazer isso, preencha o nome da conexão no início do nome da tabela:

```php
    'email' => 'unique:connection.users,email_address'
```

**Forçando uma regra única a ignorar um determinado ID:**

Às vezes, você pode desejar ignorar um determinado identificador durante a validação única. Por exemplo, considere uma tela de "atualização do perfil" que inclui o nome do usuário, endereço de e-mail e localização. Provavelmente, você vai querer verificar se o endereço de e-mail é exclusivo. No entanto, se o usuário mudou apenas o campo de nome, mas não o campo do e-mail, você não quer que um erro de validação seja exibido porque o usuário já é proprietário do endereço de e-mail em questão.

Para instruir o validador a ignorar o ID do usuário, vamos usar a classe `Rule` para definir a regra de forma fluida. Neste exemplo, também especificaremos as regras de validação como um array ao invés de utilizarmos o caractere `|` para delimitar as regras:

```php
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'email' => [
            'required',
            Rule::unique('users')->ignore($user->id),
        ],
    ]);
```

::: warning ATENÇÃO
Você nunca deve passar nenhuma entrada de solicitação controlada pelo usuário para o método `ignore`. Em vez disso, você deve passar apenas um ID exclusivo gerado pelo sistema, como um ID de incremento automático ou UUID de uma instância do modelo Eloquent. Caso contrário, seu aplicativo ficará vulnerável a um ataque de injeção de SQL.
:::

Em vez de passar o valor da chave do modelo para o método `ignore`, você pode também passar a instância completa do modelo. O Laravel extrai automaticamente a chave do modelo:

```php
    Rule::unique('users')->ignore($user)
```

Se o nome da coluna do campo primário do seu modelo for diferente de `id`, você poderá especificar esse nome ao chamar o método `ignore`:

```php
    Rule::unique('users')->ignore($user->id, 'user_id')
```

Por padrão, a regra `unique` verifica se o valor da coluna coincide com o nome do atributo que está sendo validado. No entanto, você pode passar um nome de coluna diferente como segundo argumento ao método `unique`:

```php
    Rule::unique('users', 'email_address')->ignore($user->id)
```

**Adicionando Cláusulas Adicionais "Where":**

Você pode especificar condições de consulta adicionais personalizando a consulta usando o método `where`. Por exemplo, vamos adicionar uma condição de consulta que limitará a consulta para buscar apenas registros com um valor na coluna `account_id` de 1:

```php
    'email' => Rule::unique('users')->where(fn (Builder $query) => $query->where('account_id', 1))
```

<a name="rule-uppercase"></a>
#### uppercase
O campo em validação deve ser de letras maiúsculas.

<a name="rule-url"></a>
#### url
O campo em validação deve ser um URL válido.

Se você quiser especificar os protocolos de URL que devem ser considerados válidos, você pode indicá-los como parâmetros da regra de validação:

```php
'url' => 'url:http,https',

'game' => 'url:minecraft,steam',
```

<a name="rule-ulid"></a>
#### ulid
O campo em validação deve ser um [Identificador Universal, Lexicograficamente Classificável e Único](https://github.com/ulid/spec)(ULID).

<a name="rule-uuid"></a>
#### uuid
O campo em validação deve ser um identificador universal exclusivo (UUID) com o formato conforme definido pela RFC 4122 (versão 1,3, 4 ou 5).

<a name="conditionally-adding-rules"></a>
## Regras com Adição Condicional

#### Ignorar validação em campos com determinados valores
Você pode ocasionalmente querer não validar um determinado campo se outro campo tiver um valor específico. Isso pode ser feito usando a regra de validação `exclude_if`. Nesse exemplo, os campos `appointment_date` e `doctor_name` não serão validados se o campo `has_appointment` tiver um valor falso:

```php
    use Illuminate\Support\Facades\Validator;

    $validator = Validator::make($data, [
        'has_appointment' => 'required|boolean',
        'appointment_date' => 'exclude_if:has_appointment,false|required|date',
        'doctor_name' => 'exclude_if:has_appointment,false|required|string',
    ]);
```

Como alternativa, você pode usar a regra `exclude_unless` para não validar um determinado campo se outro campo tiver um valor específico:

```php
    $validator = Validator::make($data, [
        'has_appointment' => 'required|boolean',
        'appointment_date' => 'exclude_unless:has_appointment,true|required|date',
        'doctor_name' => 'exclude_unless:has_appointment,true|required|string',
    ]);
```

<a name="validating-when-present"></a>
#### Validação quando presente

Em algumas situações, você pode desejar executar verificações de validação em um campo **somente** se esse campo estiver presente nos dados sendo validados. Para isso, adicione a regra `sometimes` à lista de regras:

```php
    $v = Validator::make($data, [
        'email' => 'sometimes|required|email',
    ]);
```

No exemplo acima, o campo `email` só será validado pelo método de validação se estiver presente no array `$data`.

::: info NOTA
Se você estiver tentando validar um campo que deveria estar sempre presente, mas pode estar vazio, verifique [esta nota sobre campos opcionais](#a-note-on-optional-fields).
:::

#### Validação condicional complexa
Por vezes, pode ser desejável adicionar regras de validação com base numa lógica condicional mais complexa. Por exemplo, você pode querer que um determinado campo só esteja disponível se outro tiver um valor superior a 100. Ou, talvez precise que dois campos tenham um determinado valor apenas quando outro campo estiver presente. A adição destas regras de validação não tem de ser difícil. Primeiro, crie uma instância de `Validator` com as suas regras _estáticas_ que nunca mudam:

```php
    use Illuminate\Support\Facades\Validator;

    $validator = Validator::make($request->all(), [
        'email' => 'required|email',
        'games' => 'required|numeric',
    ]);
```

Vamos assumir que nosso aplicativo da web é para colecionadores de jogos. Se um colecionador de jogos se registrar no nosso aplicativo e tiver mais de 100 jogos, queremos que ele explique por que ele possui tantos jogos. Por exemplo, talvez eles tenham uma loja de revenda de jogos ou talvez apenas gostem de colecioná-los. Para adicionar este requisito condicionalmente, podemos usar o método `sometimes` na instância da validação.

```php
    use Illuminate\Support\Fluent;

    $validator->sometimes('reason', 'required|max:500', function (Fluent $input) {
        return $input->games >= 100;
    });
```

O primeiro argumento passado ao método `sometimes` é o nome do campo que pretendemos validar condicionalmente. O segundo argumento é uma lista das regras que pretendemos adicionar. Se o closure fornecido como o terceiro argumento retornar `true`, as regras serão adicionadas. Este método torna fácil construir validações condicionais complexas. Você pode até adicionar validações condicionais para vários campos de uma só vez:

```php
    $validator->sometimes(['reason', 'cost'], 'required', function (Fluent $input) {
        return $input->games >= 100;
    });
```

::: info NOTA
O parâmetro `$input` passado para o seu encerramento será uma instância de `Illuminate\Support\Fluent` e pode ser usado para acessar sua entrada e arquivos em validação.
:::

<a name="complex-conditional-array-validation"></a>
#### Validação de matriz condicional complexa

Às vezes você pode querer validar um campo com base em outro campo no mesmo array aninhado cujo índice desconhece. Nestas situações, permita que sua função receba um segundo argumento, que será o item atual do array sendo validado:

```php
    $input = [
        'channels' => [
            [
                'type' => 'email',
                'address' => 'abigail@example.com',
            ],
            [
                'type' => 'url',
                'address' => 'https://example.com',
            ],
        ],
    ];

    $validator->sometimes('channels.*.address', 'email', function (Fluent $input, Fluent $item) {
        return $item->type === 'email';
    });

    $validator->sometimes('channels.*.address', 'url', function (Fluent $input, Fluent $item) {
        return $item->type !== 'email';
    });
```

Tal como o parâmetro `$input` passado à função de closure, o parâmetro `$item` é uma instância do `Illuminate\Support\Fluent`, quando os dados dos atributos são um array; caso contrário, trata-se de uma string.

## Validação de matrizes

Conforme discutido na documentação da regra de validação [de arrays](#rule-array), a regra `array` aceita uma lista com as chaves permitidas para os arrays. Se estiverem presentes qualquer chave adicional dentro do array, a validação falhará:

```php
    use Illuminate\Support\Facades\Validator;

    $input = [
        'user' => [
            'name' => 'Taylor Otwell',
            'username' => 'taylorotwell',
            'admin' => true,
        ],
    ];

    Validator::make($input, [
        'user' => 'array:name,username',
    ]);
```

Em geral, você deve sempre especificar as chaves do array que estão autorizadas a estar presentes em seu array. Caso contrário, os métodos `validate` e `validated` do validator retornarão todos os dados validados, incluindo o array e todas as suas chaves, mesmo se essas chaves não tenham sido validadas por outras regras de validação em arrays aninhados.

<a name="validating-nested-array-input"></a>
### Validação de entrada em matriz aninhada

A validação de campos de formulário baseados em matrizes não precisa ser uma dor de cabeça. Você pode usar "notação de ponto" para validar atributos dentro de uma matriz. Por exemplo, se a requisição HTTP for recebida com um campo `photos[profile]`, você poderá validá-la da seguinte maneira:

```php
    use Illuminate\Support\Facades\Validator;

    $validator = Validator::make($request->all(), [
        'photos.profile' => 'required|image',
    ]);
```

Você também poderá validar cada elemento de um array. Por exemplo, para validar que cada e-mail em um campo de entrada de um determinado array seja exclusivo, você poderá fazer o seguinte:

```php
    $validator = Validator::make($request->all(), [
        'person.*.email' => 'email|unique:users',
        'person.*.first_name' => 'required_with:person.*.last_name',
    ]);
```

Da mesma forma, você pode usar o caractere `*` ao especificar [mensagens de validação personalizadas em seus arquivos de idioma](#custom-messages-for-specific-attributes), facilitando o uso de uma única mensagem de validação para campos baseados em array:

```php
    'custom' => [
        'person.*.email' => [
            'unique' => 'Each person must have a unique email address',
        ]
    ],
```

#### Acessando dados de array aninhado
Às vezes você poderá precisar acessar o valor de um determinado elemento do array em nível de subarray para atribuir regras de validação ao atributo. Para isso, você pode utilizar o método `Rule::forEach`. O método `forEach` aceita uma closure que será invocada para cada iteração da validação do array e recebe o valor do atributo e o nome de atributo explícito totalmente expandido. O closure deve retornar uma matriz com as regras a atribuir ao elemento do array:

```php
    use App\Rules\HasPermission;
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;

    $validator = Validator::make($request->all(), [
        'companies.*.id' => Rule::forEach(function (string|null $value, string $attribute) {
            return [
                Rule::exists(Company::class, 'id'),
                new HasPermission('manage-company', $value),
            ];
        }),
    ]);
```

### Índices e posições de mensagens de erro
Para validar matrizes, você pode querer referenciar o índice ou posição de um item específico que falhou na validação dentro da mensagem de erro exibida em sua aplicação. Para fazer isso, você pode incluir os marcadores `:index` (começa em `0`) e `:position` (começa em `1`), como mostrado abaixo:

```php
    use Illuminate\Support\Facades\Validator;

    $input = [
        'photos' => [
            [
                'name' => 'BeachVacation.jpg',
                'description' => 'A photo of my beach vacation!',
            ],
            [
                'name' => 'GrandCanyon.jpg',
                'description' => '',
            ],
        ],
    ];

    Validator::validate($input, [
        'photos.*.description' => 'required',
    ], [
        'photos.*.description.required' => 'Please describe photo #:position.',
    ]);
```

Se o exemplo acima for aplicado, a validação falhará e o usuário receberá o seguinte erro: _"Please describe photo #2."_

Se necessário, você pode fazer referência a índices e posições mais profundamente aninhados através de "segundo-índice", "segunda-posição", "terceira-índice" e assim por diante.

```php
    'photos.*.attributes.*.string' => 'Invalid attribute for photo #:second-position.',
```

<a name="validating-files"></a>
## Validação de arquivos

O Laravel fornece várias regras de validação que podem ser usadas para validar arquivos submetidos, como `mimes`, `image`, `min`, e `max`. Apesar de você poder especificar essas regras individualmente ao validar os arquivos, o Laravel também oferece um construtor fluido de regras de validação que pode ser útil:

```php
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rules\File;

    Validator::validate($input, [
        'attachment' => [
            'required',
            File::types(['mp3', 'wav'])
                ->min(1024)
                ->max(12 * 1024),
        ],
    ]);
```

Se o seu aplicativo aceitar imagens enviadas por utilizadores, poderá usar a metodologia de construtor `image` da regra `File` para indicar que o ficheiro carregado deve ser uma imagem. Além disso, a regra `dimensions` pode ser utilizada para limitar as dimensões da imagem:

```php
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rule;
    use Illuminate\Validation\Rules\File;

    Validator::validate($input, [
        'photo' => [
            'required',
            File::image()
                ->min(1024)
                ->max(12 * 1024)
                ->dimensions(Rule::dimensions()->maxWidth(1000)->maxHeight(500)),
        ],
    ]);
```

::: info NOTA
Mais informações sobre a validação de dimensões de imagens podem ser encontradas na [documentação de regras de dimensão](#rule-dimensions).
:::

#### Tamanhos dos arquivos
Para conveniência, o tamanho mínimo e máximo do arquivo podem ser especificados como uma string com um sufixo que indica as unidades de tamanho do arquivo. Os sufixos `kb`, `mb`, `gb` e `tb` são suportados:

```php
File::image()
    ->min('1kb')
    ->max('10mb')
```

#### Tipos de Arquivo
Mesmo que você só precise especificar as extensões ao invocar o método `types`, esse método realmente valida o tipo MIME do arquivo lendo o conteúdo e adivinhando seu tipo MIME. Uma lista completa de tipos MIME e suas correspondentes extensões pode ser encontrado no seguinte endereço:

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

## Validação de senhas
Para garantir que as senhas tenham um nível de complexidade adequada, você pode usar o objeto da regra `Password` do Laravel:

```php
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Validation\Rules\Password;

    $validator = Validator::make($request->all(), [
        'password' => ['required', 'confirmed', Password::min(8)],
    ]);
```

O objeto de regra `Password` permite personalizar facilmente os requisitos de complexidade de senhas para a sua aplicação, especificando que as senhas precisam conter, pelo menos, uma letra, um número, um símbolo ou caracteres com maiúsculas e minúsculas:

```php
    // Requer pelo menos 8 caracteres...
    Password::min(8)

    // Exigir pelo menos uma carta...
    Password::min(8)->letters()

    // Exigir pelo menos uma letra maiúscula e uma minúscula...
    Password::min(8)->mixedCase()

    // Exigir pelo menos um número...
    Password::min(8)->numbers()

    // Requer pelo menos um símbolo...
    Password::min(8)->symbols()
```

Além disso, você pode garantir que uma senha não foi comprometida num vazamento de informações públicas usando o método "sem risco":

```php
    Password::min(8)->uncompromised()
```

Internamente, o objeto de regra `Password` utiliza o modelo [k-Anonymity](https://pt.wikipedia.org/wiki/K-anonymity) para determinar se uma senha foi exposta através do serviço [haveibeenpwned.com](https://haveibeenpwned.com), sem sacrificar a privacidade ou segurança do usuário.

Por padrão, se uma senha aparecer pelo menos uma vez em um vazamento de dados, ela será considerada comprometida. Você pode personalizar esse limite usando o primeiro argumento do método `uncompromised`:

```php
    // Certifique-se de que a senha apareça menos de 3 vezes no mesmo vazamento de dados...
    Password::min(8)->uncompromised(3);
```

Claro que você pode concatenar todos os métodos nos exemplos acima:

```php
    Password::min(8)
        ->letters()
        ->mixedCase()
        ->numbers()
        ->symbols()
        ->uncompromised()
```

<a name="defining-default-password-rules"></a>
#### Definir as regras de palavra-passe padrão

Pode ser útil especificar as regras de validação padrão para senhas num único local da aplicação. Isto pode ser feito facilmente utilizando o método `Password::defaults`, que aceita um closure. O closure enviado ao método `defaults` deve retornar a configuração padrão da regra de Senha. Normalmente, a regra `defaults` deve ser chamada dentro do método `boot` de um dos provedores de serviços da aplicação:

```php
use Illuminate\Validation\Rules\Password;

/**
 * Inicialize qualquer serviço de aplicativo.
 */
public function boot(): void
{
    Password::defaults(function () {
        $rule = Password::min(8);

        return $this->app->isProduction()
                    ? $rule->mixedCase()->uncompromised()
                    : $rule;
    });
}
```

Depois, quando você desejar aplicar as regras padrão a uma senha específica em fase de validação, poderá chamar o método `defaults` sem argumentos:

```php
    'password' => ['required', Password::defaults()],
```

Ocasionalmente, você pode desejar anexar regras de validação adicionais às suas regras padrão de validação de senha. Você pode usar o método `rules` para fazer isso:

```php
    use App\Rules\ZxcvbnRule;

    Password::defaults(function () {
        $rule = Password::min(8)->rules([new ZxcvbnRule]);

        // ...
    });
```

<a name="custom-validation-rules"></a>
## Regras de validação personalizadas

<a name="using-rule-objects"></a>
### Usando objetos de regras

O Laravel fornece uma variedade de regras de validação úteis; no entanto, pode ser necessário especificar algumas regras personalizadas. Uma forma de registrar as suas próprias regras é utilizando objetos de regra. Para criar um novo objeto de regra, você pode usar o comando `make:rule` do Artisan. Iremos utilizar este comando para gerar uma regra que verifique se uma string está em maiúsculas. O Laravel irá colocar a nova regra no diretório `app/Rules`. Se este diretório não existir, o Laravel o criará quando executar o comando do Artisan para criar sua regra:

```shell
php artisan make:rule Uppercase
```

Uma vez criada a regra, estamos prontos para definir o seu comportamento. Um objeto de regra contém um único método chamado `validate`. Este método recebe o nome do atributo, o valor e um callback que deve ser invocada em caso de falha com uma mensagem de erro da validação:

```php
    <?php

    namespace App\Rules;

    use Closure;
    use Illuminate\Contracts\Validation\ValidationRule;

    class Uppercase implements ValidationRule
    {
        /**
         * Execute a regra de validação.
         */
        public function validate(string $attribute, mixed $value, Closure $fail): void
        {
            if (strtoupper($value) !== $value) {
                $fail('The :attribute must be uppercase.');
            }
        }
    }
```

Definida uma regra, pode ser associada a um validador, através de uma instância do objeto de regra com as suas outras regras de validação:

```php
    use App\Rules\Uppercase;

    $request->validate([
        'name' => ['required', 'string', new Uppercase],
    ]);
```

#### Traduzindo Mensagens de Validação
Em vez de fornecer uma mensagem de erro literal para o fechamento `$fail`, você também pode fornecer um [chave de strings para tradução](/docs/localization) e instruir o Laravel a traduzir a mensagem de erro:

```php
    if (strtoupper($value) !== $value) {
        $fail('validation.uppercase')->translate();
    }
```

Se necessário, você pode fornecer substitutos de marcador e a linguagem preferida como o primeiro e segundo argumento para o método `translate`:

```php
    $fail('validation.location')->translate([
        'value' => $this->value,
    ], 'fr')
```

#### Acesso a dados adicionais
Se sua classe de regra de validação personalizada precisar acessar todos os dados que estão sendo validados, ela poderá implementar a interface `Illuminate\Contracts\Validation\DataAwareRule`. Essa interface exige que você defina um método chamado `setData`. Esse método será automaticamente invocado pelo Laravel (antes do processo de validação) com todos os dados submetidos à validação:

```php
    <?php

    namespace App\Rules;

    use Illuminate\Contracts\Validation\DataAwareRule;
    use Illuminate\Contracts\Validation\ValidationRule;

    class Uppercase implements DataAwareRule, ValidationRule
    {
        /**
         * Todos os dados em validação.
         *
         * @var array<string, mixed>
         */
        protected $data = [];

        // ...

        /**
         * Defina os dados em validação.
         *
         * @param  array<string, mixed>  $data
         */
        public function setData(array $data): static
        {
            $this->data = $data;

            return $this;
        }
    }
```

Ou se a regra de validação exigir o acesso à instância do controlador que executa a validação, você poderá implementar a interface `ValidatorAwareRule`:

```php
    <?php

    namespace App\Rules;

    use Illuminate\Contracts\Validation\ValidationRule;
    use Illuminate\Contracts\Validation\ValidatorAwareRule;
    use Illuminate\Validation\Validator;

    class Uppercase implements ValidationRule, ValidatorAwareRule
    {
        /**
         * A instância do validador.
         *
         * @var \Illuminate\Validation\Validator
         */
        protected $validator;

        // ...

        /**
         * Defina o validador atual.
         */
        public function setValidator(Validator $validator): static
        {
            $this->validator = $validator;

            return $this;
        }
    }
```

<a name="using-closures"></a>
### Usando closures

Se você necessitar apenas da funcionalidade de uma regra personalizada em toda aplicação, poderá utilizar uma closure em vez de um objeto de regra. A closure recebe o nome do atributo, o valor do atributo e um callback `$fail`, que deve ser chamado se a validação falhar:

```php
    use Illuminate\Support\Facades\Validator;
    use Closure;

    $validator = Validator::make($request->all(), [
        'title' => [
            'required',
            'max:255',
            function (string $attribute, mixed $value, Closure $fail) {
                if ($value === 'foo') {
                    $fail("The {$attribute} is invalid.");
                }
            },
        ],
    ]);
```

### Regras implícitas
Por padrão, quando um atributo a ser validado não está presente ou contém uma string vazia, as regras de validação normais (incluindo as personalizadas) não são executadas. Por exemplo, a regra [`unique`](#rule-unique) não é executada contra uma string vazia:

```php
    use Illuminate\Support\Facades\Validator;

    $rules = ['name' => 'unique:users,name'];

    $input = ['name' => ''];

    Validator::make($input, $rules)->passes(); // true
```

Para que uma regra personalizada seja executada mesmo quando um atributo estiver vazio, é necessário que a regra indique que o atributo é obrigatório. Você pode usar o comando `make:rule` do Artisan com a opção `--implicit` para gerar rapidamente um novo objeto de regra implícita:

```shell
php artisan make:rule Uppercase --implicit
```

::: warning ATENÇÃO
Um atributo "implícito" implica apenas que o atributo é necessário, mas cabe ao programador decidir se um atributo ausente ou vazio é considerado inválido.
:::