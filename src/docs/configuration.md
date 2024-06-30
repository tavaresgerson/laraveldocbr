# Configuração

## Introdução

Todos os arquivos de configuração do framework Laravel estão armazenados na pasta "config". Cada opção tem sua documentação. Por isso, você pode navegar pelos arquivos e ficar familiarizado com as opções disponíveis.

Estes arquivos de configuração permitem que você configure informações como suas conexões com o banco de dados e seus servidores de e-mail, bem como vários outros valores de configuração principais, tais como seu horário de aplicação e chave de criptografia.

#### O comando "about"

O Laravel permite mostrar um resumo da configuração da sua aplicação, dos controladores e do ambiente através do comando `about`, no Artisan.

```shell
php artisan about
```

Se você estiver interessado apenas em uma seção específica da saída do resumo do aplicativo, poderá filtrar essa seção usando a opção `--only`:

```shell
php artisan about --only=environment
```

Ou você pode usar o comando `config:show` do assistente para explorar os valores de um arquivo de configuração específico em detalhes.

```shell
php artisan config:show database
```

## Configuração de ambiente

Muitas vezes é útil ter valores de configuração diferentes com base no ambiente onde o aplicativo está sendo executado. Por exemplo, você pode querer usar um gerador de cache diferente localmente que no servidor de produção.

Para facilitar isso, o Laravel utiliza a biblioteca PHP [DotEnv](https://github.com/vlucas/phpdotenv). Em uma nova instalação do Laravel, o diretório raiz de seu aplicativo contará com um arquivo `.env.example` que define muitas variáveis de ambiente comuns. Durante o processo de instalação do Laravel, esse arquivo será copiado automaticamente para `.env`.

O arquivo `.env` padrão do Laravel contém alguns valores de configuração comuns que podem diferir dependendo se seu aplicativo está rodando localmente ou em um servidor web de produção. Esses valores são então lidos pelos arquivos de configuração dentro da pasta `config` usando a função `env` do Laravel.

Se você estiver desenvolvendo em equipe, poderá querer continuar incluindo e atualizando o arquivo `.env.example` com a aplicação. Ao colocar valores de substituição no arquivo de configuração de exemplo, outros desenvolvedores da sua equipe poderão visualizar claramente as variáveis de ambiente necessárias para executar seu aplicativo.

::: info NOTA
Qualquer variável no seu arquivo `.env` pode ser substituída por variáveis de ambiente externas, como variáveis de ambiente a nível do servidor ou sistema.
:::

#### Segurança do arquivo de ambiente

Seu arquivo `.env` não deve ser adicionado para o controle de versão da aplicação, já que cada desenvolvedor/servidor usando sua aplicação poderia requerer uma configuração diferente do ambiente. Além disso, isto seria um risco de segurança no caso em que um invasor tenha acesso ao repositório do controle de versão, já que quaisquer credenciais confidenciais seriam expostas.

No entanto, é possível criptografar seu arquivo de ambiente usando a criptografia interna do Laravel (criptografia de arquivos de ambiente). Arquivos de ambiente criptografados podem ser colocados em controle de versão com segurança.

#### Arquivos adicionais de ambiente

Antes de carregar as variáveis de ambiente do aplicativo, o Laravel verifica se uma variável de ambiente `APP_ENV` foi fornecida externamente ou se o argumento `--env` do CLI foi especificado. Nestes casos, o Laravel tenta carregar um arquivo `.env.[APP_ENV]`, caso exista. Caso ele não exista, será carregado o arquivo padrão `.env`.

### Tipos de variáveis de ambiente

Normalmente, todas as variáveis de um arquivo `.env` são interpretadas como strings. Por isso foram criados alguns valores reservados para permitir que o tipo retornado pela função `env()` seja mais abrangente:

| Valor do arquivo `.env`   | Valor de `env()`  |
|---------------------------|-------------------|
| `true`                    | `(bool) true`     |
| (`true`)                  | `(bool) true`     |
| `false`                   | `(bool) false`    |
| (`false`)                 | `(bool) falso`    |
| `empty`                   | `(string) ''`     |
| (`empty`)                 | `(string) ''`     |
| `null`                    | `(null) null`     |
| (`null`)                  | `(null) null`     |

Se for necessário definir uma variável de ambiente com um valor que contenha espaços, o procedimento é o seguinte: encerra o valor entre aspas duplas:

```ini
APP_NAME="My Application"
```

### Recuperação da configuração de ambiente

Todas as variáveis listadas no arquivo `.env` serão carregadas para o `$_ENV` PHP super-global quando sua aplicação receber um pedido. No entanto, você pode usar a função `env` para recuperar valores dessas variáveis em seus arquivos de configuração. De fato, se você revisar os arquivos de configuração do Laravel, notará que muitas das opções já estão usando essa função:

```php
    'debug' => env('APP_DEBUG', false),
```

O segundo valor passado à função `env` é o "valor padrão". Este será devolvido caso não exista nenhuma variável do ambiente para a chave especificada.

### Determinação do Ambiente Atual

O ambiente atual do aplicativo é determinado através da variável `APP_ENV` do seu arquivo `.env`. Você pode acessar este valor através do método `environment` no `App` [facade](/docs/facades):

```php
    use Illuminate\Support\Facades\App;

    $environment = App::environment();
```

Você também pode usar os argumentos para a chamada do método `environment` para determinar se o ambiente coincide com um dado valor. O método irá retornar `true` caso o ambiente coincida com qualquer um dos valores passados:

```php
    if (App::environment('local')) {
        // O ambiente é local
    }

    if (App::environment(['local', 'staging'])) {
        // O ambiente é local OU de preparação...
    }
```

::: info NOTA
A deteção atual do ambiente de aplicação pode ser substituída definindo uma variável de ambiente `APP_ENV` no nível do servidor.
::: 

### Encriptar ficheiros do ambiente

Nunca armazene arquivos de ambiente sem criptografia em um controle de origem. No entanto, o Laravel permite que você encrie seus arquivos de ambiente para que eles possam ser adicionados com segurança ao controle de origem com o restante da aplicação.

#### Encriptação

Para criptografar um ficheiro de ambiente, pode utilizar o comando `env:encrypt`:

```shell
php artisan env:encrypt
```

A execução do comando `env:encrypt` irá criptografar seu arquivo `.env` e colocará o conteúdo criptografado num arquivo `.env.encrypted`. A chave de decodificação é apresentada no comando de saída e deve ser armazenada em um gerenciador de senhas seguro. Caso deseje fornecer a sua própria chave de criptografia, poderá utilizar a opção `--key` ao invocar o comando:

```shell
php artisan env:encrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

::: info NOTA
O comprimento da chave fornecida deve corresponder ao comprimento da chave exigida pela cifra de criptografia usada. Por padrão, o Laravel usará a cifra `AES-256-CBC` que requer uma chave de 32 caracteres. Você é livre para usar qualquer cifra suportada pelo [encrypter](/docs/encryption) do Laravel passando a opção `--cipher` ao invocar o comando.
:::

Se o seu aplicativo tiver vários arquivos de ambiente, como `.env` e `.env.staging`, você poderá especificar o arquivo do ambiente que deve ser encriptado ao fornecer o nome do ambiente por meio da opção `--env`:

```shell
php artisan env:encrypt --env=staging
```

#### Decodificação

Para descriptografar um arquivo de ambiente, você pode usar o comando `env:decrypt`. Este comando requer uma chave de descriptografia. O Laravel vai recuperá-la da variável de ambiente `LARAVEL_ENV_ENCRYPTION_KEY`:

```shell
php artisan env:decrypt
```

Ou o código pode ser fornecido diretamente ao comando através da opção `--key`:

```shell
php artisan env:decrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

Quando o comando `env:decrypt` é invocado, o Laravel irá descriptografar o conteúdo do arquivo `.env.encrypted` e colocará o conteúdo descriptografado no arquivo `.env`.

A opção `--cipher` pode ser fornecida ao comando `env:decrypt` para usar um código de criptografia personalizado:

```shell
php artisan env:decrypt --key=qUWuNRdfuImXcKxZ --cipher=AES-128-CBC
```

Se o seu aplicativo possuir vários arquivos de ambiente, como por exemplo `.env` e `.env.staging`, você poderá especificar qual o arquivo que será descriptografado passando o nome do ambiente através da opção `--env`:

```shell
php artisan env:decrypt --env=staging
```

Para sobrescrever um ficheiro de ambiente existente, pode fornecer a opção `--force` ao comando `env:decrypt`:

```shell
php artisan env:decrypt --force
```

## Acesso aos valores da configuração

Para aceder facilmente aos valores da sua configuração através da facade `Config` ou da função global `config` de qualquer local da aplicação. Os valores da configuração podem ser acedidos utilizando a sintaxe "ponto", que inclui o nome do ficheiro e da opção à qual pretende aceder. Pode especificar um valor padrão, sendo este devolvido se não existir uma opção na configuração:

```php
    use Illuminate\Support\Facades\Config;

    $value = Config::get('app.timezone');

    $value = config('app.timezone');

    // Recuperar um valor padrão se o valor de configuração não existir...
    $value = config('app.timezone', 'Asia/Seoul');
```

Para definir valores de configuração em tempo de execução, você pode chamar o método `set` da facade `Config` ou passar um array para a função `config`:

```php
    Config::set('app.timezone', 'America/Chicago');

    config(['app.timezone' => 'America/Chicago']);
```

Para auxiliar na análise estática, a interface `Config` também oferece métodos de recuperação da configuração tipados. Se o valor obtido na configuração não for do tipo esperado, uma exceção será lançada:

```php
    Config::string('config-key');
    Config::integer('config-key');
    Config::float('config-key');
    Config::boolean('config-key');
    Config::array('config-key');
```

## Armazenamento em cache da configuração

Para acelerar seu aplicativo, você deve armazenar todos os seus arquivos de configuração em um único arquivo usando o comando `config:cache` do Artisan. Isso combinará todas as opções de configuração para o aplicativo em um único arquivo, que poderá ser carregado rapidamente pelo framework.

Normalmente, você deve executar o comando `php artisan config:cache` como parte do seu processo de implantação de produção. Não execute esse comando durante o desenvolvimento local, pois as opções da configuração precisarão ser alteradas frequentemente durante o desenvolvimento do aplicativo.

Uma vez que a configuração tenha sido salva em cache, o arquivo de configuração do seu aplicativo (.env) não será mais carregado pelo framework durante solicitações ou comandos Artisan; portanto, a função `env` somente retornará variáveis externas do nível do sistema.

Por esse motivo, você deve se certificar de que está chamando apenas a função `env` dos arquivos de configuração (`config`) da sua aplicação. Você pode ver muitos exemplos disso, analisando os arquivos de configuração padrão do Laravel. Os valores de configuração podem ser acessados em qualquer lugar na sua aplicação usando a função `config` descrita acima.

 O comando `config:clear` pode ser usado para apagar a configuração em cache:

```shell
php artisan config:clear
```

::: info NOTA
Se você executar o comando `config:cache` durante seu processo de implantação, certifique-se de chamar somente a função `env` dos arquivos de configuração. Uma vez que a configuração tenha sido armazenada em cache, o arquivo `.env` não será carregado; portanto, a função `env` retornará apenas as variáveis de ambiente externos de nível do sistema.
:::

## Publicação de configuração

A maioria dos arquivos de configuração do Laravel já são publicados no diretório `config` da sua aplicação; contudo, alguns ficheiros de configuração como o `cors.php` e o `view.php` não são publicados por padrão, uma vez que a maioria das aplicações nunca vão precisar alterá-los.

No entanto, poderá usar o comando do Artisan `config:publish` para publicar os ficheiros de configuração que não são publicados por padrão.

```shell
php artisan config:publish

php artisan config:publish --all
```

## Modo de Depuração

A opção `debug` no arquivo de configuração `config/app.php` determina quantas informações sobre um erro são realmente exibidas ao usuário. Por padrão, essa opção é definida para respeitar o valor da variável ambiental `APP_DEBUG`, armazenada no arquivo `.env`.

::: info NOTA
Para o desenvolvimento local, você deve definir a variável de ambiente `APP_DEBUG` para `true`. **No seu ambiente de produção, este valor sempre deve ser `false`. Se a variável for definida como `true` em um ambiente de produção, você correrá o risco de expor valores confidenciais da configuração aos usuários finais do aplicativo.**
:::

## Modo de manutenção

Quando seu aplicativo estiver em modo de manutenção, uma exibição personalizada será apresentada para todas as solicitações em sua aplicação. Isso permite que o usuário "desative" sua aplicação enquanto ela está sendo atualizada ou quando você está fazendo a manutenção. A verificação do modo de manutenção está incluída na pilha padrão de middleware para sua aplicação. Se a aplicação estiver em modo de manutenção, uma instância `Symfony\Component\HttpKernel\Exception\HttpException` será lançada com um código de status de 503.

Para habilitar o modo de manutenção, siga os passos abaixo:

```shell
php artisan down
```

Se você quiser que o cabeçalho HTTP de `Refresh` seja enviado com todas as respostas em modo de manutenção, pode fornecer a opção `refresh` ao invocar o comando `down`. O cabeçalho `Refresh` instruirá o navegador a atualizar automaticamente a página após um número especificado de segundos:

```shell
php artisan down --refresh=15
```

Você também pode fornecer uma opção `retry` ao comando `down`, que será definida como o valor do cabeçalho HTTP `Retry-After`:

```shell
php artisan down --retry=60
```

#### Ignorar o modo de manutenção

Para permitir que o modo de manutenção seja ignorado utilizando um token secreto, você pode usar a opção `secret` para especificar um token de contornamento do modo de manutenção:

```shell
php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"
```

Depois de colocar o aplicativo no modo de manutenção, você poderá navegar até a URL do aplicativo que corresponda ao token e o Laravel emitirá um cookie para ignorar o modo de manutenção em seu navegador:

```shell
https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515
```

Se você gostaria que o Laravel gerasse o token secreto para você, pode usar a opção `with-secret`. O segredo será exibido assim que a aplicação estiver em modo de manutenção:

```shell
php artisan down --with-secret
```

Ao aceder a esta rota oculta, será redirecionado para a rota `/` da aplicação. Uma vez emitido o cookie ao seu navegador, poderá navegar na aplicação normalmente como se ela não estivesse em modo de manutenção.

::: info NOTA
O nome do seu modo de manutenção deve conter tipicamente caracteres alfanuméricos e opcionalmente traços. Evite o uso de caracteres que possuam um significado especial em URLs, como por exemplo `?` ou `&`.
:::

#### Modo de manutenção em vários servidores

Por padrão, o Laravel determina se seu aplicativo está em modo de manutenção usando um sistema baseado em arquivo. Isso significa que para ativar o modo de manutenção, é necessário executar o comando `php artisan down` em cada servidor que hospeda seu aplicativo.

Como alternativa, o Laravel oferece um método com base em cache para gerenciar o modo de manutenção. Este método exige a execução do comando `php artisan down` em apenas um servidor. Para usar esta abordagem, modifique a configuração "driver" no arquivo `config/app.php` da sua aplicação para `cache`. Em seguida, selecione uma memória de cache `store` que seja acessível por todos os seus servidores. Isso garante que o status do modo de manutenção é consistentemente mantido em todos os servidores:

```php
'maintenance' => [
    'driver' => 'cache',
    'store' => 'database',
],
```

#### Implementação do modo de manutenção antes da renderização

Se você utilizar o comando `php artisan down` durante a implantação, seus usuários podem encontrar erros se acessarem a aplicação enquanto suas dependências do Composer ou outros componentes de infraestrutura estiverem em atualização. Isso ocorre porque uma parte significativa do framework Laravel deve iniciar para determinar que seu aplicativo está no modo de manutenção e renderizar a exibição de manutenção usando o mecanismo de modelagem.

Por este motivo, o Laravel permite-lhe renderizar previamente uma página de modo de manutenção que será retornada no início do ciclo de requisições. Esta vista é renderizada antes da carga de quaisquer outras dependências da aplicação. Pode pre-renderizar um modelo à sua escolha, utilizando a opção `render` do comando `down`:

```shell
php artisan down --render="errors::503"
```

#### Redirecionamento de solicitações do Modo de Manutenção

No modo de manutenção, o Laravel exibirá a visualização do modo de manutenção para todos os endereços da URL de aplicação que o usuário tentar acessar. Se desejar, pode instruir o Laravel para redirecionar todas as solicitações para um URL específica. Isto poderá ser feito através da opção `redirect`. Por exemplo, você pode pretender redirecionar todas as solicitações para o URI `/`:

```shell
php artisan down --redirect=/
```

#### Desativando o Modo de Manutenção

Para desativar o modo de manutenção, utilize o comando `up`:

```shell
php artisan up
```

::: info NOTA
É possível personalizar o modelo padrão de modo de manutenção definindo seu próprio modelo no `resources/views/errors/503.blade.php`.
:::

#### Modo de Manutenção e Filas

Enquanto seu aplicativo estiver em modo de manutenção, nenhum trabalho agendado será executado. Os trabalhos retornarão ao funcionamento normal assim que o aplicativo sair do modo de manutenção.

#### Alternativas ao Modo de Manutenção

Como o modo de manutenção exige que seu aplicativo tenha vários segundos de inatividade, considere alternativas como [Laravel Vapor](https://vapor.laravel.com) e [Envoyer](https://envoyer.io) para realizar uma implantação com tempo de inatividade zero com Laravel.
