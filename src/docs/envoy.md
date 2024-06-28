# Enviado do Laravel

<a name="introduction"></a>
## Introdução

 O [Laravel Envoy](https://github.com/laravel/envoy) é uma ferramenta para executar tarefas comuns que são executadas em servidores remotos. Usando a sintaxe de estilo [Blade](/docs/blade), você pode configurar facilmente tarefas para implantação, comandos Artisan e mais. Atualmente, o Envoy suporta apenas os sistemas operacionais Mac e Linux. No entanto, é possível obter suporte a Windows usando o [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

<a name="installation"></a>
## Instalação

 Primeiro, instale o Envoy no seu projeto usando o gerenciador de pacotes do Composer:

```shell
composer require laravel/envoy --dev
```

 Depois que o Envoy estiver instalado, o binário do Envoy ficará disponível no diretório `vendor/bin` de sua aplicação:

```shell
php vendor/bin/envoy
```

<a name="writing-tasks"></a>
## Tarefas de escrita

<a name="defining-tasks"></a>
### Definir tarefas

 As tarefas são os blocos de construção básicos do Envoy. Elas definem os comandos shell que devem ser executados nos servidores remotos quando a tarefa é acionada. Por exemplo, você poderá definir uma tarefa que execute o comando `php artisan queue:restart` em todos os servidores de trabalho da fila do aplicativo.

 Todas as tarefas do Envoy devem ser definidas em um arquivo `./views/Envoy.blade.php` na raiz da sua aplicação. Abaixo, é mostrado um exemplo de como começar:

```blade
@servers(['web' => ['user@192.168.1.1'], 'workers' => ['user@192.168.1.2']])

@task('restart-queues', ['on' => 'workers'])
    cd /home/user/example.com
    php artisan queue:restart
@endtask
```

 Como você pode ver, uma matriz de `@servers` é definida no início do arquivo, permitindo que você faça referência a esses servidores por meio da opção `on` nas declarações das tarefas. A declaração `@servers` deve ser sempre colocada em uma única linha. Dentro de suas declarações `@task`, coloque os comandos do shell que devem ser executados nos servidores quando a tarefa for invocada.

<a name="local-tasks"></a>
#### Tarefas locais

 Você pode forçar um script a ser executado no seu computador local especificando o endereço de IP do servidor como `127.0.0.1`:

```blade
@servers(['localhost' => '127.0.0.1'])
```

<a name="importing-envoy-tasks"></a>
#### Importação de tarefas do Envoy

 Usando a diretiva `@import`, você pode importar outros arquivos do Envoy para que suas histórias e tarefas sejam adicionadas às suas. Depois que os arquivos forem importados, você poderá executar as tarefas deles como se elas tivessem sido definidas em seu próprio arquivo do Envoy:

```blade
@import('vendor/package/Envoy.blade.php')
```

<a name="multiple-servers"></a>
### Múltiplos servidores

 O Envoy permite executar uma tarefa em vários servidores com facilidade. Primeiro, adicione servidores adicionais à sua declaração `@servers`. Cada servidor deve receber um nome exclusivo. Depois de definir os servidores adicionais, você pode listar cada servidor no array `on` da tarefa:

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2']])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a name="parallel-execution"></a>
#### Execução paralela

 Por padrão, as tarefas são executadas em cada servidor sequencialmente. Ou seja, uma tarefa só terminará de ser executada no primeiro servidor após o início da execução do segundo servidor. Se pretender executar simultaneamente a mesma tarefa em vários servidores, inclua a opção `parallel` na sua declaração de tarefas:

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2'], 'parallel' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a name="setup"></a>
### Configuração

 Por vezes, poderá precisar de executar um código PHP arbitrário antes do início das tarefas do Envoy. Poderá utilizar a diretiva `@setup` para definir um bloco de código PHP que deve ser executado antes das tarefas:

```php
@setup
    $now = new DateTime;
@endsetup
```

 Se você precisar usar outros arquivos de PHP antes da execução do seu aplicativo, pode utilizar a diretiva `@include` no topo do arquivo `Envoy.blade.php`:

```blade
@include('vendor/autoload.php')

@task('restart-queues')
    # ...
@endtask
```

<a name="variables"></a>
### Variáveis

 Se necessário, é possível passar argumentos para tarefas do Envoy ao especificá-los na linha de comando ao invocar o Envoy:

```shell
php vendor/bin/envoy run deploy --branch=master
```

 Você pode usar a sintaxe "echo" do Blade para acessar as opções dentro de suas tarefas. Também é possível definir declarações `if` e loops dentro das suas tarefas. Por exemplo, vamos verificar a presença da variável `$branch` antes de executar o comando "git pull":

```blade
@servers(['web' => ['user@192.168.1.1']])

@task('deploy', ['on' => 'web'])
    cd /home/user/example.com

    @if ($branch)
        git pull origin {{ $branch }}
    @endif

    php artisan migrate --force
@endtask
```

<a name="stories"></a>
### Histórias

 As histórias agrupam um conjunto de tarefas com um único nome conveniente. Por exemplo, uma história "deploy" pode executar as tarefas "update-code" e "install-dependencies", listando os nomes das tarefas dentro da sua definição:

```blade
@servers(['web' => ['user@192.168.1.1']])

@story('deploy')
    update-code
    install-dependencies
@endstory

@task('update-code')
    cd /home/user/example.com
    git pull origin master
@endtask

@task('install-dependencies')
    cd /home/user/example.com
    composer install
@endtask
```

 Depois que a história for escrita, você poderá invocá-la da mesma maneira como você invocaria uma tarefa:

```shell
php vendor/bin/envoy run deploy
```

<a name="completion-hooks"></a>
### Ganchos

 Quando ocorre a execução de tarefas e histórias, vários ganchos são executados. Os tipos de gancho suportados pelo Envoy são `@before`, `@after`, `@error`, `@success` e `@finished`. Todo o código desses ganchos é interpretado como PHP e executado localmente, não nos servidores remotos com os quais suas tarefas interagem.

 Você pode definir quantos hooks desejar de cada um deles, eles serão executados na ordem em que aparecem no script do Envoy.

<a name="hook-before"></a>
#### `@antecedente`

 Antes de cada execução da tarefa, todos os ganchos `@before`, registrados em seu roteiro do Envoy serão executados. Os ganchos `@before` recebem o nome da tarefa a ser executada:

```blade
@before
    if ($task === 'deploy') {
        // ...
    }
@endbefore
```

<a name="completion-after"></a>
#### `@after`

 Após a execução de cada tarefa, os ganchos "@after" registrados no seu script do Envoy serão executados. Os ganchos "@after" recebem o nome da tarefa que foi executada:

```blade
@after
    if ($task === 'deploy') {
        // ...
    }
@endafter
```

<a name="completion-error"></a>
#### `@erro`

 Após o fracasso de uma tarefa (saída com um código de estado maior que `0`), todos os ganchos `@error` registrados no seu script do Envoy irão executar. Os ganchos `@error` recebem o nome da tarefa que foi executada:

```blade
@error
    if ($task === 'deploy') {
        // ...
    }
@enderror
```

<a name="completion-success"></a>
#### `@sucesso`

 Se todas as tarefas tiverem sido executadas sem erros, todos os ganchos `@success`, registrados no script do Envoy serão executados:

```blade
@success
    // ...
@endsuccess
```

<a name="completion-finished"></a>
#### @terminado

 Após a execução de todas as tarefas (independentemente do status da saída), serão executados todos os `hooks @finished`. Os `hooks @finished` recebem o código de status da tarefa concluída, que pode ser `null` ou um número `integer` maior ou igual a `0`:

```blade
@finished
    if ($exitCode > 0) {
        // There were errors in one of the tasks...
    }
@endfinished
```

<a name="running-tasks"></a>
## Tarefas em execução

 Para executar uma tarefa ou história definida no arquivo `Envoy.blade.php` da aplicação, execute o comando `run` do Envoy, informando o nome da tarefa ou história a ser executada. O Envoy irá executar a tarefa e exibirá a saída dos servidores remotos enquanto a tarefa estiver sendo executada:

```shell
php vendor/bin/envoy run deploy
```

<a name="confirming-task-execution"></a>
### Confirmar a execução da tarefa

 Se você deseja que um aviso de confirmação seja exibido antes do início da execução de uma determinada tarefa em seus servidores, é necessário adicionar a diretiva `confirm` à sua declaração de tarefa. Esta opção é particularmente útil para operações destrutivas:

```blade
@task('deploy', ['on' => 'web', 'confirm' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate
@endtask
```

<a name="notifications"></a>
## Notificações

<a name="slack"></a>
### Slack

 O Envoy permite enviar notificações para o [Slack](https://slack.com) após a execução de cada tarefa. A diretiva `@slack` aceita um URL de hook do Slack e um canal/nome de usuário. Você pode obter seu URL de Webhook ao criar uma integração "Incoming WebHooks" em seu painel de controle do Slack.

 Deve passar o URL completo do Webhook como primeiro argumento dado à diretiva `@slack`. O segundo argumento deve ser um nome de canal (`#canal`) ou o nome do utilizador:

```blade
@finished
    @slack('webhook-url', '#bots')
@endfinished
```

 Por padrão, as notificações do Envoy enviarão uma mensagem para o canal de notificação descrevendo a tarefa que foi executada. No entanto, é possível substituir essa mensagem por sua própria mensagem personalizada ao passar um terceiro argumento à diretiva `@slack`:

```blade
@finished
    @slack('webhook-url', '#bots', 'Hello, Slack.')
@endfinished
```

<a name="discord"></a>
### O Discord

 O Envoy também suporta o envio de notificações para o [Discord](https://discord.com) após a execução da tarefa. A diretiva `@discord` aceita uma URL do hook e uma mensagem do Discord. Você pode recuperar sua URL de Webhook criando um "Webhook" em suas configurações do servidor e escolhendo qual canal o webhook deve postar. É necessário passar a URL completa do Webhook para a diretiva `@discord`:

```blade
@finished
    @discord('discord-webhook-url')
@endfinished
```

<a name="telegram"></a>
### Telegram

 O Envoy também permite o envio de notificações para [Telegram](https://telegram.org) após a execução de cada tarefa. A diretiva `@telegram` aceita um ID do Bot e um ID da chat. Você pode obter seu ID do Bot criando um novo bot usando o [BotFather](https://t.me/botfather). Pode obter um ID de Chat válido usando o [@username_to_id_bot](https://t.me/username_to_id_bot). Você deve passar o ID completo do Bot e do Chat na diretiva `@telegram`:

```blade
@finished
    @telegram('bot-id','chat-id')
@endfinished
```

<a name="microsoft-teams"></a>
### O Microsoft Teams

 O Envoy também suporta enviar notificações para o [Microsoft Teams](https://www.microsoft.com/en-us/microsoft-teams) após a execução de cada tarefa. A diretiva `@microsoftTeams` aceita um Webhook do Microsoft Teams (obrigatório), uma mensagem, cor do tema (sucesso, informação, aviso e erro) e uma matriz de opções. Você pode obter o seu Webhook do Microsoft Teams criando um novo [Webhook entrante](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook). O API do Microsoft Teams tem muitos outros atributos para personalizar sua caixa de mensagens, como título, resumo e seções. Você pode encontrar mais informações na [documentação do Microsoft Teams](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL#example-of-connector-message). Você deve passar o URL completo do Webhook para a diretiva `@microsoftTeams`:

```blade
@finished
    @microsoftTeams('webhook-url')
@endfinished
```
