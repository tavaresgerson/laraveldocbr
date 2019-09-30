# Configuração

## Introdução

Todos os arquivos de configuração da estrutura do Laravel são armazenados no diretório config. Cada opção está documentada, 
portanto, fique à vontade para procurar nos arquivos e se familiarizar com as opções disponíveis.

## Configuração do ambiente

Geralmente, é útil ter valores de configuração diferentes com base no ambiente em que o aplicativo está sendo executado. Por 
exemplo, você pode querer usar um driver de cache diferente localmente em seu servidor de produção.

Para tornar isso fácil, o Laravel utiliza a biblioteca PHP [DotEnv](https://github.com/vlucas/phpdotenv) de Vance Lucas. Em uma 
nova instalação do Laravel, o diretório raiz do seu aplicativo conterá um arquivo `.env.example`. Se você instalar o Laravel 
via Composer, esse arquivo será automaticamente renomeado para `.env`. Caso contrário, você deve renomear o arquivo 
manualmente.

O arquivo .env não deve ser adicionado ao o controle de versão do aplicativo, pois cada desenvolvedor/servidor que usa o 
aplicativo pode exigir uma configuração de ambiente diferente. Além disso, isso seria um risco de segurança no caso de um 
invasor obter acesso ao seu repositório de controle de versão, uma vez que quaisquer credenciais confidenciais seriam expostas.

Se estiver desenvolvendo com uma equipe, convém continuar incluindo um arquivo `.env.example` com seu aplicativo. Ao colocar 
valores de espaço reservado no arquivo de configuração de exemplo, outros desenvolvedores da sua equipe podem ver claramente 
quais variáveis de ambiente são necessárias para executar seu aplicativo. Você também pode criar um arquivo `.env.testing`. 
Este arquivo substituirá o arquivo `.env` ao executar testes do PHPUnit ou executar comandos do Artisan com a 
opção `--env=testing`.

> Qualquer variável em seu arquivo `.env` pode ser substituída por variáveis de ambiente externas, como variáveis de ambiente 
> no nível do servidor ou no nível do sistema.

## Tipos de variáveis de ambiente
Todas as variáveis em seus arquivos `.env` são analisadas como seqüências de caracteres, portanto, alguns valores reservados 
foram criados para permitir que você retorne uma variedade maior de tipos da função `env()`:

| .env Value  | env() Value |
|-------------|-------------|
| true        | (bool) true |
| (true)      | (bool) true |
| false       | (bool) false|
| (false)     | (bool) false|
| empty       | (string) '' |
| (empty)     | (string) '' |
| null        | (null) null |
| (null)      | (null) null |

Se você precisar definir uma variável de ambiente com um valor que contenha espaços, coloque-o entre aspas duplas.

```
APP_NAME="My Application"
```

## Recuperando a configuração do ambiente
Todas as variáveis listadas neste arquivo serão carregadas na super global `$_ENV` do PHP quando seu aplicativo receber uma 
solicitação. No entanto, você pode usar o helper `env` para recuperar valores dessas variáveis em seus arquivos de 
configuração. De fato, se você revisar os arquivos de configuração do Laravel, notará várias das opções que já estão usando 
este auxiliar:

``` php
'debug' => env('APP_DEBUG', false),
```

O segundo valor passado para a função `env` é o "valor padrão". Este valor será usado se nenhuma variável de ambiente existir 
para a chave especificada.

# Determinando o ambiente atual
O ambiente atual do aplicativo é determinado através da variável `APP_ENV` do seu arquivo `.env`. Você pode acessar esse 
valor através do método de ambiente na [facade](https://laravel.com/docs/5.8/facades) do aplicativo:

``` php
$environment = App::environment();
```

Você também pode passar argumentos para o método do ambiente para verificar se o ambiente corresponde a um determinado valor. O método retornará true se o ambiente corresponder a qualquer um dos valores fornecidos:

``` php
if (App::environment('local')) {
    // O ambiente é local
}

if (App::environment(['local', 'staging'])) {
    // O ambiente é local ou de preparação...
}
```
> A detecção do ambiente de aplicativo atual pode ser substituída por uma variável de ambiente `APP_ENV` no nível do
> servidor. Isso pode ser útil quando você precisar compartilhar o mesmo aplicativo para diferentes 
> configurações de ambiente, para poder configurar um determinado host para corresponder a um determinado 
> ambiente nas configurações do servidor.

## Ocultando variáveis de ambiente de páginas de depuração
Quando uma exceção é detectada e a variável de ambiente `APP_DEBUG` for verdadeira, a página de depuração mostrará todas as 
variáveis de ambiente e seu conteúdo. Em alguns casos, você pode ocultar certas variáveis. Você pode fazer isso atualizando a 
opção `debug_blacklist` no seu arquivo de configuração `config/app.php`.

Algumas variáveis estão disponíveis nas variáveis de ambiente e nos dados do servidor/solicitação. Portanto, pode ser 
necessário incluí-los na lista negra para `$_ENV` e `$ _SERVER`:

``` php
return [

    // ...

    'debug_blacklist' => [
        '_ENV' => [
            'APP_KEY',
            'DB_PASSWORD',
        ],

        '_SERVER' => [
            'APP_KEY',
            'DB_PASSWORD',
        ],

        '_POST' => [
            'password',
        ],
    ],
];
```

Acessando valores de configuração
Você pode acessar facilmente seus valores de configuração usando a função auxiliar de configuração global de qualquer lugar 
no seu aplicativo. Os valores de configuração podem ser acessados usando a sintaxe "ponto", que inclui o nome do arquivo e a 
opção que você deseja acessar. Um valor padrão também pode ser especificado e será retornado se a opção de configuração não 
existir:

``` php
$value = config('app.timezone');
```

Para definir valores de configuração em tempo de execução, passe uma matriz para o auxiliar de configuração:

``` php
config(['app.timezone' => 'America/Chicago']);
```

## Cache de configuração
Para dar ao seu aplicativo um aumento de velocidade, você deve armazenar em cache todos os seus arquivos de configuração em 
um único arquivo usando o comando do Artisan `config:cache`. Isso combinará todas as opções de configuração para
seu aplicativo em um único arquivo que será carregado rapidamente pela estrutura.

Você normalmente deve executar o comando `php artisan config:cache` como parte de sua rotina de implantação de produção. O 
comando não deve ser executado durante o desenvolvimento local, pois as opções de configuração frequentemente precisam ser 
alteradas durante o desenvolvimento do aplicativo.

> Se você executar o comando `config:cache`  durante o processo de implantação, verifique se está chamando apenas a função 
> `env` de seus arquivos de configuração. Depois que a configuração tiver sido armazenada em cache, o arquivo `.env` 
> não será carregado e todas as chamadas para a função `env` retornarão `null`.

## Modo de manutenção
Quando seu aplicativo estiver no modo de manutenção, uma exibição personalizada será exibida para todas as solicitações 
do seu aplicativo. Isso facilita a "desativação" do seu aplicativo enquanto ele está sendo atualizado ou quando você 
está realizando manutenção. Uma verificação do modo de manutenção está incluída na pilha de middleware padrão 
para seu aplicativo. Se o aplicativo estiver no modo de manutenção, uma `MaintenanceModeException` será lançada com um 
código de status 503.

Para ativar o modo de manutenção, execute o comando Artisan `down`:

```
php artisan down
```

Você também pode fornecer opções de mensagem e nova tentativa para o comando `down`. O valor da mensagem pode ser 
usado para exibir ou registrar uma mensagem personalizada, enquanto o valor de nova tentativa será definido como 
o valor do cabeçalho HTTP `Retry-After` após:

```
php artisan down --message="Upgrading Database" --retry=60
```

Mesmo no modo de manutenção, endereços IP ou redes específicos podem ter permissão para acessar o aplicativo usando a opção de permissão do comando:

```
php artisan down --allow=127.0.0.1 --allow=192.168.0.0/16
```

Para desativar o modo de manutenção, use o comando `up`:

```
php artisan up
```

> Você pode personalizar o modelo do modo de manutenção padrão, definindo seu próprio modelo em resources 
> `/views/errors/503.blade.php`

### Modo de manutenção e filas
Enquanto seu aplicativo estiver no modo de manutenção, nenhum [trabalho na fila](https://laravel.com/docs/5.8/queues) 
será tratado. Os trabalhos continuarão sendo tratados normalmente quando o aplicativo estiver fora do modo de manutenção.

### Alternativas ao modo de manutenção
Como o modo de manutenção exige que seu aplicativo tenha vários segundos de inatividade, considere alternativas 
como o [Envoyer](https://envoyer.io/) para realizar a implantação de tempo de inatividade zero com o Laravel.
