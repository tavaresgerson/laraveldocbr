# Laravel Envoy

<a name="introduction"></a>
## Introdução

O [Laravel Envoy](https://github.com/laravel/envoy) é uma ferramenta para executar tarefas comuns em seus servidores remotos. Usando a sintaxe do [Blade](/docs/blade), você pode configurar facilmente as tarefas de implantação, os comandos Artisan e muito mais. Atualmente, o Envoy apenas suporta os sistemas operacionais Mac e Linux. No entanto, o suporte ao Windows é possível usando o [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

<a name="installation"></a>
## Instalação

Primeiro, instale o Envoy em seu projeto usando o pacote Composer:

```shell
composer require laravel/envoy --dev
```

Uma vez que o Envoy foi instalado, o binário do Envoy estará disponível na pasta 'vendor/bin' da sua aplicação:

```shell
php vendor/bin/envoy
```

<a name="writing-tasks"></a>
## Tarefas de Redação

<a name="defining-tasks"></a>
### Definir Tarefas

Tarefas são os blocos de construção básicos do Envoy. As tarefas definem os comandos de shell que devem ser executados em seus servidores remotos quando a tarefa é invocada. Por exemplo, você pode definir uma tarefa que executa o comando "php artisan queue:restart" em todos os servidores dos trabalhadores da fila do seu aplicativo.

Todos os seus Envoy tarefas devem ser definidas em um arquivo 'Envoy.blade.php' na raiz do seu aplicativo. Aqui está um exemplo para começar:

```blade
@servers(['web' => ['user@192.168.1.1'], 'workers' => ['user@192.168.1.2']])

@task('restart-queues', ['on' => 'workers'])
    cd /home/user/example.com
    php artisan queue:restart
@endtask
```

Como você pode ver, um array de `@servers` é definido na parte superior do arquivo, permitindo que se faça referência a esses servidores via a opção `on` das suas declarações de tarefa. A declaração `@server` deve sempre ser colocada em uma única linha. Dentro de suas declarações `@task`, deves colocar os comandos de shell para executar quando a tarefa for invocada nos seus servidores.

<a name="local-tasks"></a>
#### Tarefas locais

Você pode forçar um script a executar em seu computador local especificando o endereço do servidor como '127.0.0.1':

```blade
@servers(['localhost' => '127.0.0.1'])
```

<a name="importing-envoy-tasks"></a>
#### Importar tarefas do enviado

Usando a diretiva @import você pode importar outros arquivos do Envoy para que seus histórias e tarefas sejam adicionadas às suas. Após os arquivos terem sido importados você pode executar as tarefas contidas neles como se fossem definidas em seu próprio arquivo Envoy:

```blade
@import('vendor/package/Envoy.blade.php')
```

<a name="multiple-servers"></a>
### Servidores múltiplos

Envio permite que você execute facilmente uma tarefa em vários servidores. Primeiro, adicione mais servidores à sua declaração '@servers'. Cada servidor deve ser atribuído um nome único. Depois de definir os seus servidores adicionais você pode listar cada um dos servidores na matriz 'em' da tarefa:

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2']])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a name="parallel-execution"></a>
#### Execução Paralela

Por padrão, as tarefas serão executadas de forma serial em cada servidor. Em outras palavras, uma tarefa terminará sua execução no primeiro servidor antes de passar para o segundo servidor. Se você gostaria de executar uma tarefa em vários servidores em paralelo, adicione a opção "paralelo" na declaração da tarefa:

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

Às vezes, você pode precisar executar código de php arbitrário antes de executar suas tarefas do Envoy. Você pode usar o `diretiva @setup` para definir um bloco de código de php que deve ser executado antes de suas tarefas:

```php
@setup
    $now = new DateTime;
@endsetup
```

Se você precisar incluir outros arquivos PHP antes da sua tarefa ser executada, você pode usar a diretiva `@include` no topo do seu arquivo Envoy.blade.php:

```blade
@include('vendor/autoload.php')

@task('restart-queues')
    # ...
@endtask
```

<a name="variables"></a>
### Variáveis

Se necessário, você pode passar argumentos para as tarefas do Envoy especificando-os na linha de comando ao invocar o Envoy:

```shell
php vendor/bin/envoy run deploy --branch=master
```

Você pode acessar as opções dentro de suas tarefas usando a sintaxe "echo" do Blade. Você também pode definir as instruções "if" e "loop" do Blade dentro de suas tarefas. Por exemplo, vamos verificar se a variável `$branch` está definida antes de executar o comando `git pull`:

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
### Contos

As histórias agrupam um conjunto de tarefas sob um único e conveniente nome. Por exemplo, uma história " implantar" pode executar as tarefas " atualização de código " e " instalação de dependências " ao listar os nomes das tarefas dentro de sua definição:

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

Uma vez que a história tenha sido escrita, pode invocá-la da mesma forma como invocaria uma tarefa:

```shell
php vendor/bin/envoy run deploy
```

<a name="completion-hooks"></a>
### Ganchos

Quando tarefas e histórias são executadas, um número de ganchos é executado. Os tipos de gancho suportados por Envoy são @before, @after, @error, @success e @finished. Todo o código nos ganchos é interpretado como PHP e executado localmente, não nos servidores remotos com os quais suas tarefas interagem.

Você pode definir quantos de cada um desses ganchos que você quiser. Eles serão executados na ordem em que eles aparecem no seu script do Envoy.

<a name="hook-before"></a>
#### 'antes de'

Antes de cada execução de tarefa, todos os ganchos do `@before` registrados no seu script do Envoy executarão. Os ganchos do `@before` recebem o nome da tarefa que será executada:

```blade
@before
    if ($task === 'deploy') {
        // ...
    }
@endbefore
```

<a name="completion-after"></a>
#### `@after`

Depois de cada execução de tarefa, todos os ganchos `@after` registrados em seu script Envoy serão executados. Os ganchos `@after` recebem o nome da tarefa que foi executada:

```blade
@after
    if ($task === 'deploy') {
        // ...
    }
@endafter
```

<a name="completion-error"></a>
#### 'erro'

Após cada falha de uma tarefa (saída com um código de status maior que 0), todos os ganchos `@error` registrados no seu script do Envoy serão executados. Os ganchos `@error` recebem o nome da tarefa que foi executada:

```blade
@error
    if ($task === 'deploy') {
        // ...
    }
@enderror
```

<a name="completion-success"></a>
#### `@sucesso`

Se todas as tarefas foram executadas sem erros, todos os ganchos `@success` registrados no seu script do Envoy serão executados:

```blade
@success
    // ...
@endsuccess
```

<a name="completion-finished"></a>
#### '@acabou'

Após a execução de todas as tarefas (independentemente do status de saída), todos os ganchos `@finished` serão executados. Os ganchos `@finished` recebem o código de status da tarefa concluída, que pode ser nulo ou inteiro maior ou igual a 0:

```blade
@finished
    if ($exitCode > 0) {
        // There were errors in one of the tasks...
    }
@endfinished
```

<a name="running-tasks"></a>
## Tarefas em execução

Para executar uma tarefa ou história definida no seu arquivo 'Envoy.blade.php', execute o comando de 'Envoy', passando o nome da tarefa ou história que você gostaria de executar. Envoy executará a tarefa e exibirá o resultado dos seus servidores remotos conforme a tarefa é executada.

```shell
php vendor/bin/envoy run deploy
```

<a name="confirming-task-execution"></a>
### Confirmando a execução da tarefa

Se você gostaria de ter um prompt de confirmação antes de executar uma tarefa em seus servidores, você deve adicionar o 'confirm' diretivo à sua declaração da tarefa. Esta opção é particularmente útil para operações destrutivas:

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

O Envoy suporta enviar notificações para o [Slack](https://slack.com) após cada tarefa ser executada. A diretiva `slack` aceita uma URL do gancho e um nome de canal/usuário. Você pode obter sua URL do gancho criando um "Webhook Entrante" na sua mesa de controle do Slack.

Você deve passar todo o URL do gancho como o primeiro argumento fornecido para a diretiva `@slack`. O segundo argumento fornecido para a diretiva `@slack` deve ser um nome de canal (`` #canal ``) ou um nome de usuário (`` @usuário ``:

```blade
@finished
    @slack('webhook-url', '#bots')
@endfinished
```

Por padrão, notificações do Envoy enviarão uma mensagem ao canal de notificação descrevendo a tarefa executada. No entanto, você pode sobrescrever esta mensagem com sua mensagem personalizada passando um terceiro argumento para o diretivo `@slack`:

```blade
@finished
    @slack('webhook-url', '#bots', 'Hello, Slack.')
@endfinished
```

<a name="discord"></a>
### Discordar

O Envoy também suporta enviar notificações para o [Discord](https://discord.com) após cada tarefa ser executada. A diretiva `@discord` aceita uma URL do gancho Discord e uma mensagem. Você pode recuperar sua URL do webhook criando um "Webhook" em suas Configurações do Servidor e escolhendo qual canal o webhook deve publicar:

```blade
@finished
    @discord('discord-webhook-url')
@endfinished
```

<a name="telegram"></a>
### Telegramas

Envio também suporta o envio de notificações para [Telegram](https://telegram.org) após cada tarefa ser executada. A diretiva `@telegram` aceita um ID do Telegram Bot e um ID da Sala. Você pode obter seu ID do Bot criando um novo bot usando [BotFather](https://t.me/botfather). Você pode obter um ID de sala válido usando [@username_to_id_bot](https://t.me/username_to_id_bot). Você deve passar o ID do Bot inteiro e o ID da Sala para a diretiva `@telegram`:

```blade
@finished
    @telegram('bot-id','chat-id')
@endfinished
```

<a name="microsoft-teams"></a>
### Microsoft Teams

Envio também suporta o envio de notificações para [Microsoft Teams](https://www.microsoft.com/en-us/microsoft-teams) após cada tarefa ser executada. A diretiva `@microsoftTeams` aceita um webhook do Microsoft Teams (obrigatório), uma mensagem, uma cor temática (sucesso, informação, aviso, erro) e uma matriz de opções. Você pode recuperar seu webhook do Microsoft Teams criando um novo [webhook de entrada](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook). A API do Microsoft Teams possui muitos outros atributos para personalizar sua caixa de mensagem, como título, resumo e seções. Você pode encontrar mais informações na [documentação do Microsoft Teams](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL#example-of-connector-message).

```blade
@finished
    @microsoftTeams('webhook-url')
@endfinished
```
