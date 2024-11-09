# Laravel Envoy

<a name="introduction"></a>
## Introdução

[Laravel Envoy](https://github.com/laravel/envoy) é uma ferramenta para executar tarefas comuns que você executa em seus servidores remotos. Usando a sintaxe de estilo [Blade](/docs/blade), você pode facilmente configurar tarefas para implantação, comandos Artisan e muito mais. Atualmente, o Envoy suporta apenas os sistemas operacionais Mac e Linux. No entanto, o suporte ao Windows pode ser obtido usando [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

<a name="installation"></a>
## Instalação

Primeiro, instale o Envoy em seu projeto usando o gerenciador de pacotes do Composer:

```shell
composer require laravel/envoy --dev
```

Depois que o Envoy for instalado, o binário do Envoy estará disponível no diretório `vendor/bin` do seu aplicativo:

```shell
php vendor/bin/envoy
```

<a name="writing-tasks"></a>
## Escrevendo tarefas

<a name="defining-tasks"></a>
### Definindo tarefas

As tarefas são o bloco de construção básico do Envoy. As tarefas definem os comandos de shell que devem ser executados em seus servidores remotos quando a tarefa é invocada. Por exemplo, você pode definir uma tarefa que executa o comando `php artisan queue:restart` em todos os servidores de trabalho de fila do seu aplicativo.

Todas as suas tarefas do Envoy devem ser definidas em um arquivo `Envoy.blade.php` na raiz do seu aplicativo. Aqui está um exemplo para você começar:

```blade
@servers(['web' => ['user@192.168.1.1'], 'workers' => ['user@192.168.1.2']])

@task('restart-queues', ['on' => 'workers'])
    cd /home/user/example.com
    php artisan queue:restart
@endtask
```

Como você pode ver, uma matriz de `@servers` é definida no topo do arquivo, permitindo que você faça referência a esses servidores por meio da opção `on` de suas declarações de tarefa. A declaração `@servers` deve sempre ser colocada em uma única linha. Dentro de suas declarações `@task`, você deve colocar os comandos shell que devem ser executados em seus servidores quando a tarefa for invocada.

<a name="local-tasks"></a>
#### Tarefas locais

Você pode forçar um script a ser executado no seu computador local especificando o endereço IP do servidor como `127.0.0.1`:

```blade
@servers(['localhost' => '127.0.0.1'])
```

<a name="importing-envoy-tasks"></a>
#### Importando tarefas do Envoy

Usando a diretiva `@import`, você pode importar outros arquivos do Envoy para que suas histórias e tarefas sejam adicionadas às suas. Após os arquivos terem sido importados, você pode executar as tarefas que eles contêm como se estivessem definidas no seu próprio arquivo do Envoy:

```blade
@import('vendor/package/Envoy.blade.php')
```

<a name="multiple-servers"></a>
### Vários servidores

O Envoy permite que você execute facilmente uma tarefa em vários servidores. Primeiro, adicione servidores adicionais à sua declaração `@servers`. Cada servidor deve receber um nome exclusivo. Depois de definir seus servidores adicionais, você pode listar cada um dos servidores no array `on` da tarefa:

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

Por padrão, as tarefas serão executadas em cada servidor em série. Em outras palavras, uma tarefa terminará de ser executada no primeiro servidor antes de prosseguir para a execução no segundo servidor. Se você quiser executar uma tarefa em vários servidores em paralelo, adicione a opção `parallel` à sua declaração de tarefa:

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

Às vezes, você pode precisar executar código PHP arbitrário antes de executar suas tarefas do Envoy. Você pode usar a diretiva `@setup` para definir um bloco de código PHP que deve ser executado antes de suas tarefas:

```php
@setup
    $now = new DateTime;
@endsetup
```

Se você precisar exigir outros arquivos PHP antes que sua tarefa seja executada, você pode usar a diretiva `@include` no topo do seu arquivo `Envoy.blade.php`:

```blade
@include('vendor/autoload.php')

@task('restart-queues')
    # ...
@endtask
```

<a name="variables"></a>
### Variáveis

Se necessário, você pode passar argumentos para tarefas do Envoy especificando-os na linha de comando ao invocar o Envoy:

```shell
php vendor/bin/envoy run deploy --branch=master
```

Você pode acessar as opções dentro de suas tarefas usando a sintaxe "echo" do Blade. Você também pode definir instruções e loops `if` do Blade dentro de suas tarefas. Por exemplo, vamos verificar a presença da variável `$branch` antes de executar o comando `git pull`:

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

As histórias agrupam um conjunto de tarefas sob um único nome conveniente. Por exemplo, uma história `deploy` pode executar as tarefas `update-code` e `install-dependencies` listando os nomes das tarefas dentro de sua definição:

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

Depois que a história for escrita, você pode invocá-la da mesma forma que invocaria uma tarefa:

```shell
php vendor/bin/envoy run deploy
```

<a name="completion-hooks"></a>
### Ganchos

Quando tarefas e histórias são executadas, vários ganchos são executados. Os tipos de ganchos suportados pelo Envoy são `@before`, `@after`, `@error`, `@success` e `@finished`. Todo o código nesses ganchos é interpretado como PHP e executado localmente, não nos servidores remotos com os quais suas tarefas interagem.

Você pode definir quantos desses ganchos quiser. Eles serão executados na ordem em que aparecem no seu script Envoy.

<a name="hook-before"></a>
#### `@before`

Antes da execução de cada tarefa, todos os ganchos `@before` registrados no seu script Envoy serão executados. Os ganchos `@before` recebem o nome da tarefa que será executada:

```blade
@before
    if ($task === 'deploy') {
        // ...
    }
@endbefore
```

<a name="completion-after"></a>
#### `@after`

Após a execução de cada tarefa, todos os ganchos `@after` registrados no seu script Envoy serão executados. Os ganchos `@after` recebem o nome da tarefa que foi executada:

```blade
@after
    if ($task === 'deploy') {
        // ...
    }
@endafter
```

<a name="completion-error"></a>
#### `@error`

Após cada falha de tarefa (sai com um código de status maior que `0`), todos os ganchos `@error` registrados no seu script Envoy serão executados. Os ganchos `@error` recebem o nome da tarefa que foi executada:

```blade
@error
    if ($task === 'deploy') {
        // ...
    }
@enderror
```

<a name="completion-success"></a>
#### `@success`

Se todas as tarefas foram executadas sem erros, todos os ganchos `@success` registrados no seu script Envoy serão executados:

```blade
@success
    // ...
@endsuccess
```

<a name="completion-finished"></a>
#### `@finished`

Após todas as tarefas terem sido executadas (independentemente do status de saída), todos os ganchos `@finished` serão executados. Os ganchos `@finished` recebem o código de status da tarefa concluída, que pode ser `null` ou um `integer` maior ou igual a `0`:

```blade
@finished
    if ($exitCode > 0) {
        // There were errors in one of the tasks...
    }
@endfinished
```

<a name="running-tasks"></a>
## Executando tarefas

Para executar uma tarefa ou história definida no arquivo `Envoy.blade.php` do seu aplicativo, execute o comando `run` do Envoy, passando o nome da tarefa ou história que você gostaria de executar. O Envoy executará a tarefa e exibirá a saída dos seus servidores remotos enquanto a tarefa estiver em execução:

```shell
php vendor/bin/envoy run deploy
```

<a name="confirming-task-execution"></a>
### Confirmando a execução da tarefa

Se você quiser ser solicitado a confirmar antes de executar uma determinada tarefa em seus servidores, adicione a diretiva `confirm` à sua declaração de tarefa. Esta opção é particularmente útil para operações destrutivas:

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

O Envoy oferece suporte ao envio de notificações para [Slack](https://slack.com) após cada tarefa ser executada. A diretiva `@slack` aceita uma URL de hook do Slack e um nome de canal/usuário. Você pode recuperar sua URL de webhook criando uma integração "Incoming WebHooks" no seu painel de controle do Slack.

Você deve passar a URL inteira do webhook como o primeiro argumento fornecido à diretiva `@slack`. O segundo argumento dado à diretiva `@slack` deve ser um nome de canal (`#channel`) ou um nome de usuário (`@user`):

```blade
@finished
    @slack('webhook-url', '#bots')
@endfinished
```

Por padrão, as notificações do Envoy enviarão uma mensagem ao canal de notificação descrevendo a tarefa que foi executada. No entanto, você pode substituir esta mensagem com sua própria mensagem personalizada passando um terceiro argumento para a diretiva `@slack`:

```blade
@finished
    @slack('webhook-url', '#bots', 'Hello, Slack.')
@endfinished
```

<a name="discord"></a>
### Discord

O Envoy também suporta o envio de notificações para [Discord](https://discord.com) após cada tarefa ser executada. A diretiva `@discord` aceita uma URL de hook do Discord e uma mensagem. Você pode recuperar sua URL de webhook criando um "Webhook" nas suas Configurações do Servidor e escolhendo em qual canal o webhook deve ser postado. Você deve passar o URL do Webhook inteiro para a diretiva `@discord`:

```blade
@finished
    @discord('discord-webhook-url')
@endfinished
```

<a name="telegram"></a>
### Telegram

O Envoy também suporta o envio de notificações para o [Telegram](https://telegram.org) após cada tarefa ser executada. A diretiva `@telegram` aceita um ID de bot do Telegram e um ID de bate-papo. Você pode recuperar seu ID de bot criando um novo bot usando [BotFather](https://t.me/botfather). Você pode recuperar um ID de bate-papo válido usando [@username_to_id_bot](https://t.me/username_to_id_bot). Você deve passar o ID do bot e o ID do chat inteiros para a diretiva `@telegram`:

```blade
@finished
    @telegram('bot-id','chat-id')
@endfinished
```

<a name="microsoft-teams"></a>
### Microsoft Teams

O Envoy também oferece suporte ao envio de notificações para o [Microsoft Teams](https://www.microsoft.com/en-us/microsoft-teams) após cada tarefa ser executada. A diretiva `@microsoftTeams` aceita um Teams Webhook (obrigatório), uma mensagem, cor do tema (sucesso, informação, aviso, erro) e uma série de opções. Você pode recuperar seu Teams Webhook criando um novo [incoming webhook](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook). A API do Teams tem muitos outros atributos para personalizar sua caixa de mensagem, como título, resumo e seções. Você pode encontrar mais informações na [documentação do Microsoft Teams](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL#example-of-connector-message). Você deve passar a URL inteira do Webhook para a diretiva `@microsoftTeams`:

```blade
@finished
    @microsoftTeams('webhook-url')
@endfinished
```
