# Laravel Reverb

<a name="introduction"></a>
## Introdução

 O Reverb de Laravel traz uma comunicação WebSocket em tempo real extremamente rápida e escalonável diretamente para seu aplicativo do Laravel, além disso, fornece integração perfeita com a série existente de ferramentas de transmissão de eventos do Laravel.

<a name="installation"></a>
## Instalação

 Você pode instalar o Reverb usando o comando Artesiano `install:broadcasting`:

```
php artisan install:broadcasting
```

<a name="configuration"></a>
## Configuração

 Por trás dos bastidores, o comando Artisan `install:broadcasting` será executado pelo comando `reverb:install`, que instalará o Reverb com um conjunto razoável de opções de configuração por padrão. Se desejar fazer alterações na sua configuração, pode fazê-lo através da atualização das variáveis do ambiente ou através da alteração do ficheiro de configuração `config/reverb.php`.

<a name="application-credentials"></a>
### Credenciais de aplicação

 Para estabelecer uma conexão com o Reverb, um conjunto de credenciais da "aplicação" do Reverb deve ser trocado entre o cliente e o servidor. Essas credenciais são configuradas no servidor e usadas para verificar o pedido enviado pelo cliente. Você pode definir essas credenciais usando as variáveis de ambiente a seguir:

```ini
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
```

<a name="allowed-origins"></a>
### Fontes permitidas

 Você também pode definir a origem dos pedidos do cliente atualizando o valor do parâmetro de configuração `allowed_origins` na seção `apps` do arquivo de configuração `config/reverb.php`. Todos os pedidos provenientes de uma origem não listada nas origens permitidas serão rejeitados. Você pode permitir todas as origens usando o asterisco (`*`):

```php
'apps' => [
    [
        'id' => 'my-app-id',
        'allowed_origins' => ['laravel.com'],
        // ...
    ]
]
```

<a name="additional-applications"></a>
### Aplicações Adicionais

 Normalmente, o Reverb fornece um servidor WebSocket para a aplicação instalada. No entanto, é possível servir mais de uma aplicação utilizando uma única instalação do Reverb.

 Por exemplo, pode pretender manter um único aplicativo Laravel que, através do Reverb, proporcione conectividade WebSocket para vários aplicações. Isto pode ser conseguido ao definir várias `apps` no ficheiro de configuração `config/reverb.php' da sua aplicação:

```php
'apps' => [
    [
        'app_id' => 'my-app-one',
        // ...
    ],
    [
        'app_id' => 'my-app-two',
        // ...
    ],
],
```

<a name="ssl"></a>
### SSL

 Na maioria dos casos, as conexões de WebSocket seguras são tratadas pelo servidor web principal (Nginx, entre outros) antes que o pedido seja encaminhado ao seu servidor Reverb.

 No entanto, às vezes pode ser útil, como no desenvolvimento local, que o servidor Reverb possa lidar diretamente com conexões seguras. Se você estiver usando a função de site seguro do [Laravel Herd's](https://herd.laravel.com) ou se você estiver usando o [Laravel Valet](/docs/valet) e tiver executado o comando [seguro] (https://herd.laravel.com/) contra seu aplicativo, você pode usar o certificado Herd / Valet gerado para seu site para proteger suas conexões Reverb. Para fazer isso, defina a variável de ambiente `REVERB_HOST` como o nome do host do seu site ou passe explicitamente a opção de nome do host ao iniciar o servidor Reverb:

```sh
php artisan reverb:start --host="0.0.0.0" --port=8080 --hostname="laravel.test"
```

 Como os domínios herd e valet são resolvidos por "localhost", executar o comando acima resultará no seu servidor Reverb sendo acessível via protocolo WebSocket seguro (`wss`) em `wss://laravel.test:8080`.

 Você também pode escolher manualmente um certificado definindo opções de `tls` no arquivo de configuração do seu aplicativo `config/reverb.php`. No interior da matriz de opções `tls`, você poderá fornecer qualquer uma das opções suportadas pelas [opções de contexto de SSL do PHP](https://www.php.net/manual/en/context.ssl.php):

```php
'options' => [
    'tls' => [
        'local_cert' => '/path/to/cert.pem'
    ],
],
```

<a name="running-server"></a>
## Executar o servidor

 O servidor Reverb pode ser iniciado utilizando o comando `reverb:start`:

```sh
php artisan reverb:start
```

 Por padrão, o servidor de rede estará configurado para começar em `0.0.0.0:8080`, tornando-o acessível através de todas as interfaces de rede.

 Se for necessário especificar um servidor ou porta personalizados, será possível fazê-lo através das opções `--host` e `--porta`, ao iniciar o servidor:

```sh
php artisan reverb:start --host=127.0.0.1 --port=9000
```

 Alternativamente, você pode definir as variáveis de ambiente `REVERB_SERVER_HOST` e `REVERB_SERVER_PORT` no arquivo de configuração do seu aplicativo `.env`.

 As variáveis de ambiente `REVERB_SERVER_HOST` e `REVERB_SERVER_PORT` não devem ser confundidas com `REVERB_HOST` e `REVERB_PORT`. A primeira especifica o host e a porta onde o próprio servidor Reverb funcionará, ao passo que as últimas instruem Laravel para informar onde enviam mensagens de transmissão. Por exemplo, em um ambiente de produção, você poderá encaminhar pedidos do nome de usuário público do Reverb na porta `443` para um servidor Reverb que funcione em `0.0.0.0:8080`. Nesse cenário, suas variáveis de ambiente seriam definidas da seguinte maneira:

```ini
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

REVERB_HOST=ws.laravel.com
REVERB_PORT=443
```

<a name="debugging"></a>
### Depuração

 Para melhorar o desempenho, o Reverb não apresenta informações de depuração por padrão. Se pretender ver a sequência de dados que passam pelo seu servidor do Reverb, poderá fornecer a opção `--debug` ao comando `reverb:start`:

```sh
php artisan reverb:start --debug
```

<a name="restarting"></a>
### Reiniciando

 Uma vez que o processo do Reverb é de longa duração, as alterações no código não serão refletidas sem reiniciar o servidor através do comando de Artiesten `reverb:restart`.

 O comando `reverb:restart` garante que todas as conexões sejam terminadas com cortesia antes de parar o servidor. Se você estiver executando Reverb com um gerenciador de processos, como Supervisor, o servidor será automaticamente reiniciado pelo gerenciador de processos depois que todas as conexões forem terminadas:

```sh
php artisan reverb:restart
```

<a name="monitoring"></a>
## Controlo

 O reverb pode ser monitorado através de uma integração com o [Laravel Pulse](/docs/pulse). Ao permitir a integração do Reverb ao Pulse, você poderá controlar as conexões e mensagens que estão sendo processadas pelo seu servidor.

 Para habilitar a integração, você deve primeiro garantir que você tenha [instalado o Pulse](/docs/pulse#installation). Em seguida, adicione qualquer gravador do Reverb ao arquivo de configuração `config/pulse.php` de seu aplicativo:

```php
use Laravel\Reverb\Pulse\Recorders\ReverbConnections;
use Laravel\Reverb\Pulse\Recorders\ReverbMessages;

'recorders' => [
    ReverbConnections::class => [
        'sample_rate' => 1,
    ],

    ReverbMessages::class => [
        'sample_rate' => 1,
    ],

    ...
],
```

 Em seguida, adicione os cartões Pulse para cada gravador ao seu painel de controle [Pulse](/docs/pulse#dashboard-customization):

```blade
<x-pulse>
    <livewire:reverb.connections cols="full" />
    <livewire:reverb.messages cols="full" />
    ...
</x-pulse>
```

<a name="production"></a>
## Executando o Reverb em produção

 Devido à duração dos servidores da WebSocket, pode ser necessário otimizar seu servidor e ambiente de hospedagem para garantir que o servidor Reverb possa lidar com um número otimizado de conexões em relação aos recursos disponíveis no servidor.

 > [!ATENÇÃO]
 [Laravel Forge](https://forge.laravel.com), você pode otimizar automaticamente seu servidor para Reverb diretamente do painel "Aplicativo". Ativando a integração com o Reverb, o Forge garantirá que seu servidor esteja pronto para produção, incluindo a instalação de extensões necessárias e aumento do número permitido de conexões.

<a name="open-files"></a>
### Abrir Arquivos

 Cada conexão WebSocket é armazenada em memória até o cliente ou o servidor se desconectar. Em ambientes Unix e Unix-like, cada conexão é representada por um arquivo. No entanto, existem limites no número de arquivos abertos permitidos tanto no nível do sistema operacional quanto do aplicativo.

<a name="operating-system"></a>
#### Sistema operativo

 No sistema operativo Unix baseado, você pode determinar o número de arquivos abertos permitidos usando o comando `ulimit`:

```sh
ulimit -n
```

 O comando exibirá os limites de arquivos em aberto permitidos para diferentes usuários. Você poderá atualizar esses valores editando o arquivo `/etc/security/limits.conf`. Por exemplo, a atualização do número máximo de arquivos em aberto para 10.000 para o usuário `forge` seria feita da seguinte forma:

```ini
# /etc/security/limits.conf
forge        soft  nofile  10000
forge        hard  nofile  10000
```

<a name="event-loop"></a>
### Efeito do evento

 No interior do motor, o Reverb utiliza um laço de eventos ReactPHP para gerir ligações WebSocket no servidor. Este laço por defeito é alimentado por `stream_select`, que não requer nenhuma extensão adicional. Contudo, `stream_select` é limitada tipicamente a 1024 ficheiros em aberto. Como tal, se pretende gerir mais de 1000 ligações concurrentes, necessitará utilizar um laço de eventos alternativo não vinculado às mesmas restrições.

 O reverb será automaticamente alterado para um loop alimentado por `ext-uv`, sempre que disponível. Esta extensão do PHP está disponível para instalação através da PECL:

```sh
pecl install uv
```

<a name="web-server"></a>
### Servidor da web

 Na maioria dos casos, o Reverb é executado em um servidor sem porta direcionada à Internet. Então, para encaminhar o tráfego para o Reverb, você deverá configurar um proxy reverso. Supondo que o Reverb esteja sendo executado na hospedagem "0.0.0.0" e a porta "8080", e seu servidor utilize o Nginx como servidor web, o seguinte site do Nginx pode ser definido para o seu servidor Reverb:

```nginx
server {
    ...

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header SERVER_PORT $server_port;
        proxy_set_header REMOTE_ADDR $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";

        proxy_pass http://0.0.0.0:8080;
    }

    ...
}
```

 Normalmente, os servidores da Web são configurados para limitar o número de conexões permitidas a fim de impedir a sobrecarga do servidor. Para aumentar o número de conexões permitidas em um servidor Nginx para 10.000, é necessário atualizar os valores `worker_rlimit_nofile` e `worker_connections` do arquivo `nginx.conf`:

```nginx
user forge;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
worker_rlimit_nofile 10000;

events {
  worker_connections 10000;
  multi_accept on;
}
```

 A configuração acima permitirá o nascimento de até 10 000 trabalhadores do Nginx por processo. Além disso, essa configuração define o limite de arquivos abertos para o Nginx em 10 000.

<a name="ports"></a>
### Portos

 Os sistemas operativos baseados no Unix limitam, por norma, o número de portas que podem ser abertas no servidor. Pode ver o intervalo atualmente permitido com o seguinte comando:

```sh
 cat /proc/sys/net/ipv4/ip_local_port_range
# 32768	60999
```

 A saída acima mostra que o servidor pode lidar com um máximo de 28.231 (60.999 - 32.768) conexões, pois cada conexão requer uma porta livre. Embora recomendamos a escalonamento horizontal (#escalonamento) para aumentar o número de conexões permitidas, você pode aumentar o número de portas livres disponíveis atualizando a faixa de portas permitida no arquivo de configuração do seu servidor `/etc/sysctl.conf`.

<a name="process-management"></a>
### Gestão de processos

 Na maioria dos casos, você deve usar um gerenciador de processos como o Supervisor para garantir que o servidor do Reverb esteja sempre funcionando. Se estiver usando o Supervisor para executar o Reverb, será necessário atualizar a configuração `minfds` do arquivo `supervisor.conf` do seu servidor para garantir que o Supervisor seja capaz de abrir os arquivos necessários para lidar com as conexões ao seu servidor Reverb:

```ini
[supervisord]
...
minfds=10000
```

<a name="scaling"></a>
### Dimensionamento

 Se você precisar gerenciar mais conexões do que permitido por um único servidor, poderá dimensionar seu servidor Reverb horizontalmente. Utilizando as capacidades de publicação/assinatura do Redis, o Reverb é capaz de gerenciar conexões em múltiplos servidores. Quando uma mensagem for recebida por um dos servidores do aplicativo Reverb, o servidor utilizará o Redis para publicar a mensagem entrando em todos os outros servidores.

 Para habilitar escalonamento horizontal, você deve definir a variável de ambiente `REVERB_SCALING_ENABLED` para `true` no arquivo de configuração do seu aplicativo `.env`:

```
REVERB_SCALING_ENABLED=true
```

 Depois, você deve ter um servidor de Redis dedicado e central, no qual todos os servidores do Reverb vão se comunicar. O Reverb usarão a conexão [Redis padrão configurada para sua aplicação](/docs/redis#configuration) para publicar mensagens em todos os seus servidores de Reverb.

 Depois de ativar a opção de escalonamento do Reverb e configurar um servidor Redis, pode simplesmente invocar o comando `reverb:start` em vários servidores capazes de se comunicarem com seu servidor Redis. Esses servidores Reverb devem ser colocados atrás de um balanceador de carga que distribui os pedidos recebidos uniformemente entre os servidores.
