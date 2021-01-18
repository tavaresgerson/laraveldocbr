# Configuração

## Introdução

Todos os arquivos de configuração do framework Laravel são armazenados no diretório `config`. Cada opção é documentada, portanto, 
sinta-se à vontade para examinar os arquivos e se familiarizar com as opções disponíveis.

Esses arquivos de configuração permitem que você configure coisas como as informações de conexão do banco de dados, as informações do 
servidor de e-mail, bem como vários outros valores de configuração básicos, como o fuso horário do aplicativo e a chave de criptografia.

## Configuração de Ambiente
Geralmente é útil ter diferentes valores de configuração com base no ambiente em que o aplicativo está sendo executado. Por exemplo, 
você pode desejar usar um driver de cache diferente localmente do que você usa em seu servidor de produção.

Para tornar isso mais fácil, o Laravel utiliza a biblioteca [DotEnv](https://github.com/vlucas/phpdotenv) PHP. Em uma nova instalação do 
Laravel, o diretório raiz de seu aplicativo conterá um arquivo `.env.example` que define muitas variáveis de ambiente comuns. Durante o 
processo de instalação do Laravel, este arquivo será automaticamente copiado para `.env`.

O arquivo `.env` padrão do Laravel contém alguns valores de configuração comuns que podem diferir dependendo se sua aplicação está 
rodando localmente ou em um servidor web de produção. Esses valores são então recuperados de vários arquivos de configuração do 
Laravel dentro do diretório `config` usando a função `env` do Laravel.

Se você estiver desenvolvendo com uma equipe, talvez queira continuar incluindo um arquivo `.env.example` com seu aplicativo. Colocando 
valores de espaço reservado no arquivo de configuração de exemplo, outros desenvolvedores de sua equipe podem ver claramente quais 
variáveis de ambiente são necessárias para executar seu aplicativo.

> Qualquer variável em seu arquivo `.env` pode ser substituída por variáveis de ambiente externas, como variáveis de ambiente no 
> nível do servidor ou no nível do sistema.

### Segurança de arquivos do ambiente
Seu arquivo `.env` não deve ser comprometido com o controle de origem de seu aplicativo, uma vez que cada desenvolvedor/servidor 
usando seu aplicativo pode exigir uma configuração de ambiente diferente. Além disso, isso seria um risco de segurança no caso de 
um invasor obter acesso ao repositório de controle de origem, uma vez que quaisquer credenciais confidenciais seriam expostas.

### Tipos de variáveis de ambiente
Todas as variáveis em seus arquivos `.env` são normalmente analisadas como strings, então alguns valores reservados foram criados 
para permitir que você retorne uma gama mais ampla de tipos da função `env()`:

| .env Valor    | env() Valor   |
|---------------|---------------|
| true	        | (bool) true   |
| (true)	    | (bool) true   |
| false	        | (bool) false  |
| (false)	    | (bool) false  |
| empty	        | (string) ''   |
| (empty)	    | (string) ''   |
| null	        | (null) null   |
| (null)	    | (null) null   |

Se precisar definir uma variável de ambiente com um valor que contenha espaços, você pode fazer isso colocando o valor entre aspas duplas:

```
APP_NAME="My Application"
```

## Recuperando a configuração do ambiente
Todas as variáveis listadas neste arquivo serão carregadas na superglobal `$_ENV` do PHP quando seu aplicativo receber uma solicitação. 
No entanto, você pode usar o auxiliar `env` para recuperar valores dessas variáveis em seus arquivos de configuração. Na verdade, se você 
revisar os arquivos de configuração do Laravel, notará que muitas das opções já estão usando este auxiliar:
```php
'debug' => env('APP_DEBUG', false),
```

O segundo valor passado para a função `env` é o "valor padrão". Este valor será retornado se nenhuma variável de ambiente existir 
para a chave fornecida.

## Determinando o ambiente atual
O ambiente do aplicativo atual é determinado pela variável `APP_ENV` do seu arquivo `.env`. Você pode acessar esse valor por meio do 
método `environment` na facade `App`:

```php
use Illuminate\Support\Facades\App;

$environment = App::environment();
```

Você também pode passar argumentos para o método `environment` para determinar se o ambiente corresponde a um determinado valor. O método 
retornará `true` se o ambiente corresponder a qualquer um dos valores fornecidos:

```php
if (App::environment('local')) {
    // O ambiente é local
}

if (App::environment(['local', 'staging'])) {
    // O ambiente é local OU simulado...
}
```

> A detecção de ambiente do aplicativo atual pode ser substituída pela definição de uma variável de ambiente `APP_ENV` no nível do servidor.

## Acessando Valores de Configuração
Você pode acessar facilmente seus valores de configuração usando a configfunção auxiliar global de qualquer lugar em seu aplicativo. Os valores 
de configuração podem ser acessados através da sintaxe de "ponto", que inclui o nome do arquivo e a opção que você deseja acessar. Um valor padrão 
também pode ser especificado e será retornado se a opção de configuração não existir:

```php
$value = config('app.timezone');

// Recupere um valor padrão se o valor de configuração não existir...
$value = config('app.timezone', 'Asia/Seoul');
```

Para definir os valores de configuração em tempo de execução, passe uma matriz para o auxiliar `config`:
```php
config(['app.timezone' => 'America/Chicago']);
```

## Cache de configuração
Para aumentar a velocidade do seu aplicativo, você deve armazenar em cache todos os seus arquivos de configuração em um único arquivo 
usando o comando Artisan `config:cache`. Isso combinará todas as opções de configuração de seu aplicativo em um único arquivo que pode 
ser carregado rapidamente pela estrutura.

Normalmente, você deve executar o comando `php artisan config:cache` como parte do processo de implantação de produção. O comando não deve 
ser executado durante o desenvolvimento local, pois as opções de configuração freqüentemente precisarão ser alteradas durante o 
desenvolvimento de seu aplicativo.

> Se você executar o comando `config:cache` durante o processo de implantação, deve ter certeza de que está apenas chamando a função `env` 
> de dentro dos arquivos de configuração. Depois que a configuração for armazenada em cache, o arquivo `.env` não será carregado e todas as 
> chamadas para a função `env` serão retornadas `null`.

## Modo de depuração
A opção `debug` em seu arquivo `config/app.php` de configuração determina quanta informação sobre um erro é realmente exibida para o 
usuário. Por padrão, essa opção é definida para respeitar o valor da variável de ambiente `APP_DEBUG`, que é armazenado em seu arquivo `.env`.

Para desenvolvimento local, você deve definir a variável de ambiente `APP_DEBUG` como true. Em seu ambiente de produção, esse valor deve ser 
sempre `false`. Se a variável for definida como `true` em produção, você corre o risco de expor valores de configuração confidenciais aos 
usuários finais de seu aplicativo.

## Modo de manutenção
Quando seu aplicativo está em modo de manutenção, uma visualização personalizada será exibida para todas as solicitações em seu aplicativo. 
Isso torna mais fácil "desabilitar" seu aplicativo durante a atualização ou durante a manutenção. Uma verificação do modo de manutenção está 
incluída na pilha de middleware padrão para seu aplicativo. Se o aplicativo estiver em modo de manutenção, uma `MaintenanceModeException`
será lançado com um código de status de 503.

Para ativar o modo de manutenção, execute o comando Artisan `down`:

```
php artisan down
```

Você também pode fornecer uma opção `retry` para o comando `down`, que será definido como o valor `Retry-After` no cabeçalho HTTP:

```
php artisan down --retry=60
```

#### Ignorando o modo de manutenção
Mesmo no modo de manutenção, você pode usar a opção `secret` e especificar um token de desvio do modo de manutenção:
```
php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"
```

Após colocar o aplicativo em modo de manutenção, você pode navegar até a URL do aplicativo correspondente a este token e o 
Laravel irá emitir um cookie de desvio do modo de manutenção para o seu navegador:
```
https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515
```

Ao acessar esta rota oculta, você será redirecionado para a rota `/` do aplicativo. Assim que o cookie for emitido para o seu navegador, 
você poderá navegar no aplicativo normalmente como se ele não estivesse em modo de manutenção.

#### Pré-renderizando a visualização do modo de manutenção
Se você utilizar o comando `php artisan down` durante a implantação, seus usuários ainda podem ocasionalmente encontrar erros se acessarem 
o aplicativo enquanto as dependências do Composer ou outros componentes de infraestrutura estão sendo atualizados. Isso ocorre porque uma 
parte significativa do framework Laravel deve inicializar para determinar se sua aplicação está em modo de manutenção e renderizar a visualização 
do modo de manutenção usando o motor de templates.

Por esta razão, o Laravel permite que você pré-renderize uma visualização do modo de manutenção que será retornada no início do ciclo de 
solicitação. Esta visualização é renderizada antes que qualquer uma das dependências do seu aplicativo seja carregada. Você pode pré-renderizar 
um modelo de sua escolha usando a opção `render` do comando `down`:

```
php artisan down --render="errors::503"
```

#### Redirecionando solicitações de modo de manutenção
Enquanto estiver no modo de manutenção, o Laravel irá mostrar a visão do modo de manutenção para todos os URLs da aplicação que o usuário 
tentar acessar. Se desejar, você pode instruir o Laravel a redirecionar todas as solicitações para uma URL específica. Isso pode ser feito 
usando a redirectopção. Por exemplo, você pode redirecionar todas as solicitações para o URI `/`:

```
php artisan down --redirect=/
```

#### Desativando o modo de manutenção
Para desativar o modo de manutenção, use o comando `up`:

```
php artisan up
```

> Você pode personalizar o modelo de modo de manutenção padrão, definindo seu próprio modelo em `resources/views/errors/503.blade.php`.

#### Modo de manutenção e filas
Enquanto seu aplicativo está no modo de manutenção, nenhum [trabalho na fila](https://laravel.com/docs/8.x/queues) será tratado. Os trabalhos continuarão a ser tratados 
normalmente quando o aplicativo sair do modo de manutenção.

#### Alternativas ao modo de manutenção
Já que o modo de manutenção requer que seu aplicativo tenha vários segundos de tempo de inatividade, considere alternativas como o 
[Laravel Vapor](https://vapor.laravel.com/) e [Envoyer](https://envoyer.io/) para realizar a implantação de tempo de inatividade zero com o Laravel.
