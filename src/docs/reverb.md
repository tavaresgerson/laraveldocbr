# Reverb do Laravel

<a name="introduction"></a>
## Introdução

O [Laravel Reverb](https://github.com/laravel/reverb) traz comunicação com Websocket em tempo real, rápida e escalável diretamente para sua aplicação Laravel, e oferece integração perfeita com os [eventos de transmissão existentes](/docs/broadcasting).

<a name="installation"></a>
## Instalação

Você pode instalar o "reverb" usando o comando do "artisan": "install:broadcasting"

```
php artisan install:broadcasting
```

<a name="configuration"></a>
## Configuração

Por trás das cenas, o comando 'artisan install:broadcasting' executará o comando 'reverb:install', que instalará o reverb com um conjunto de opções de configuração padrão sensíveis. Se você gostaria de fazer qualquer alteração na configuração, você pode fazê-lo atualizando as variáveis ​​de ambiente do reverb ou atualizando o arquivo de configuração 'config/reverb.php'.

<a name="application-credentials"></a>
### Credenciais de aplicação

Para estabelecer uma conexão com o reverb, um conjunto de credenciais de "aplicação" do reverb devem ser trocadas entre o cliente e servidor. Estas credenciais são configuradas no servidor e usadas para verificar a requisição do cliente. Você pode definir essas credenciais usando as seguintes variáveis de ambiente:

```ini
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
```

<a name="allowed-origins"></a>
### Origens Permitidas

Você também pode definir as origens das quais os pedidos do cliente podem ser originados, atualizando o valor de 'allowed_origins' configuração dentro da seção 'apps' no arquivo de configuração 'config/reverb.php'. Todos os pedidos de uma origem não listada em suas origens permitidas serão rejeitados. Você pode permitir todas as origens usando '*':

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

Tipicamente, o reverb fornece um servidor WebSocket para o aplicativo em que é instalado. No entanto, é possível atender mais de um aplicativo usando uma única instalação do Reverb.

Por exemplo, você pode manter um aplicativo Laravel único que fornece conectividade de Websocket para vários aplicativos, através do Reverb. Isso pode ser feito definindo vários apps na configuração 'apps' no arquivo de configuração 'config/reverb.php':

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

Na maioria dos casos, conexões WebSocket seguras são manipuladas pelo servidor upstream (Nginx, etc.) antes de serem encaminhadas para o seu servidor reverb.

Porém, em certos casos, pode ser útil a servidor de reverberar lidar com conexões seguras diretamente, tal como durante o desenvolvimento local. Se estiver usando o recurso de [site seguro](https://herd.laravel.com) do Herd ou o Valet e já executou o comando [seguro] contra sua aplicação, você pode usar o certificado gerado pelo Herd/Valet para seus sites de reverberar suas conexões seguras. Para tanto, basta definir a variável ambiental `REVERB_HOST` com o nome de host do seu site ou passar explicitamente a opção de nome de host ao iniciar o servidor de reverberar:

```sh
php artisan reverb:start --host="0.0.0.0" --port=8080 --hostname="laravel.test"
```

Como os domínios herdados e valet resolvem para localhost, executar o comando acima fará com que seu servidor de reverb seja acessado através do protocolo seguro WebSocket (wss) em wss://laravel.test:8080.

Você também pode escolher manualmente um certificado ao definir as opções "TLS" no arquivo de configuração do seu aplicativo, em "config/reverb.php". Dentro da matriz de opções "TLS", você pode fornecer qualquer uma das opções suportadas pelo contexto SSL PHP: [context.ssl.php](https://www.php.net/manual/en/context.ssl.php).

```php
'options' => [
    'tls' => [
        'local_cert' => '/path/to/cert.pem'
    ],
],
```

<a name="running-server"></a>
## Executando o servidor

O servidor de reverberação pode ser iniciado usando o comando Artisan reverb: start:

```sh
php artisan reverb:start
```

Por padrão, o servidor de Reverb será iniciado na porta 0.0.0.0:8080, tornando-o acessível a partir de todas as interfaces de rede.

Se você precisar especificar um host ou porta personalizados, você pode fazer isso usando as opções `--host` e `--port` ao iniciar o servidor:

```sh
php artisan reverb:start --host=127.0.0.1 --port=9000
```

Alternativamente, você pode definir as variáveis de ambiente `REVERB_SERVER_HOST` e `REVERB_SERVER_PORT` no arquivo `.env` da configuração do seu aplicativo.

As variáveis de ambiente REVERB_SERVER_HOST e REVERB_SERVER_PORT não devem ser confundidas com o par REVERB_HOST:REVERB_PORT. O primeiro par especifica o host e a porta em que o servidor de reverb deve ser executado, enquanto o segundo par instrui Laravel sobre onde enviar mensagens de transmissão. Por exemplo, num ambiente de produção, você pode encaminhar as requisições do nome de host público do Reverb na porta 443 para um servidor de Reverb em execução na porta 8080. Neste cenário, suas variáveis de ambiente ficariam definidas como:

```ini
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

REVERB_HOST=ws.laravel.com
REVERB_PORT=443
```

<a name="debugging"></a>
### Depuração

Para melhorar o desempenho, o reverb não produz nenhuma informação de depuração por padrão. Se você gostaria de ver a sequência de dados passando pelo seu servidor reverb, você pode fornecer a opção `--debug` para o comando 'reverb: start':

```sh
php artisan reverb:start --debug
```

<a name="restarting"></a>
### Reiniciando...

Como o reverb é um processo de longa duração, as alterações no código não serão refletidas sem reiniciar o servidor usando o comando Artisan reverb: restart.

O comando "reverb:restart" garante que todas as conexões são terminadas graciosamente antes de o servidor parar. Se você estiver executando o reverb com um gerenciador de processos como Supervisor, o servidor será automaticamente reiniciado pelo gerenciador de processos após todos os processos terem sido terminados:

```sh
php artisan reverb:restart
```

<a name="monitoring"></a>
## Monitoramento

Reverb pode ser monitorado via uma integração com o [Laravel Pulse]( /docs/pulse ). Ao ativar a integração do pulse de reverb, você pode acompanhar o número de conexões e mensagens sendo manipuladas pelo seu servidor.

Para habilitar a integração, você deve primeiro garantir que [Pulse está instalado](/docs/pulse#instalação). Em seguida, adicione qualquer um dos gravadores de Reverb no arquivo de configuração do seu aplicativo em `config/pulse.php`:

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

Em seguida adicione as cartas "Pulse" para cada gravador em seu [Painel de Controle "Pulse"]('/docs/pulse#dashboard-customization'):

```blade
<x-pulse>
    <livewire:reverb.connections cols="full" />
    <livewire:reverb.messages cols="full" />
    ...
</x-pulse>
```

<a name="production"></a>
## Reverb em Produção

Devido a natureza de longa duração dos servidores WebSocket, você pode precisar fazer algumas otimizações em seu servidor e ambiente hospedagem para garantir que seu servidor Reverb possa lidar com o número ideal de conexões com os recursos disponíveis em seu servidor.

> [NOTA]
> Se o seu site é gerenciado pelo [Laravel Forge](https://forge.laravel.com), você pode otimizar automaticamente o servidor para Reverb diretamente do painel "Aplicativos". Ao habilitar a integração do Reverb, o Forge garantirá que seu servidor esteja pronto para produção, incluindo instalar quaisquer extensões necessárias e aumentar o número de conexões permitidas.

<a name="open-files"></a>
### Arquivos Abertos

Cada conexão WebSocket é mantida na memória até que um cliente ou servidor se desconecte. Em sistemas Unix e semelhantes, cada conexão é representada por um arquivo. No entanto, existem frequentemente limitações ao número de arquivos abertos permitidos, tanto no nível do sistema operacional quanto no nível da aplicação.

<a name="operating-system"></a>
#### Sistema Operacional

Em um sistema operacional baseado em Unix, você pode determinar o número de arquivos abertos permitidos usando o comando 'ulimit':

```sh
ulimit -n
```

Esse comando exibirá as limitações de arquivo aberto para diferentes usuários. Você pode atualizar esses valores editando o arquivo `/etc/security/limits.conf`. Por exemplo, se você atualizasse o número máximo de arquivos abertos para 10.000 para o usuário `forge`, ficaria assim:

```ini
# /etc/security/limits.conf
forge        soft  nofile  10000
forge        hard  nofile  10000
```

<a name="event-loop"></a>
### Loop de Eventos

Abaixo do capô, o Reverb usa um loop de eventos ReactPHP para gerenciar conexões WebSocket no servidor. Por padrão, este loop de eventos é alimentado por "stream_select", que não requer extensões adicionais. No entanto, "stream_select" geralmente está limitado a 1024 arquivos abertos. Portanto, se você planeja lidar com mais de 1.000 conexões simultâneas, você precisará usar um loop de eventos alternativo não vinculado às mesmas restrições.

O reverb irá automaticamente mudar para um loop alimentado pelo ext-uv quando disponível. Essa extensão do PHP está disponível para instalar via PECL:

```sh
pecl install uv
```

<a name="web-server"></a>
### Servidor web

Em grande parte dos casos, o Reverb é executado numa porta não-web em seu servidor. Assim, para redirecionar o tráfego de rede para o Reverb, você deve configurar um servidor reverso. Assumindo que o Reverb está rodando na host 0.0.0.0 e a porta 8080, e seu servidor utiliza Nginx como servidor web, um servidor reverso pode ser definido para seu servidor do Reverb usando a seguinte configuração:

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

Tipicamente, os servidores são configurados para limitar o número de conexões permitidas para evitar sobrecarregar o servidor. Para aumentar o número de conexões permitidas em um servidor web Nginx para 10.000, as configurações `worker_rlimit_nofile` e `worker_connections` do arquivo `nginx.conf` precisam ser atualizadas:

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

A configuração acima permitirá até 10.000 trabalhadores do Nginx por processo para serem criados. Além disso, esta configuração define o limite de arquivos abertos do Nginx a 10.000.

<a name="ports"></a>
### Portos

Os sistemas operacionais baseados em Unix geralmente limitam o número de portas que podem ser abertas no servidor. Você pode ver o intervalo atual permitido usando o seguinte comando:

```sh
 cat /proc/sys/net/ipv4/ip_local_port_range
# 32768	60999
```

O output acima mostra que o servidor pode lidar com um máximo de 28,231 (60,999 - 32,768) conexões desde cada conexão requer uma porta livre. Embora recomendemos a [escala horizontal](#escala) para aumentar o número de conexões permitidas, você pode aumentar o número de portas abertas disponíveis atualizando a faixa de portas permitidas no arquivo de configuração ` /etc/sysctl.conf` do seu servidor .

<a name="process-management"></a>
### Gestão de processos

Em quase todos os casos você deve usar um process manager como o Supervisor para garantir que o servidor do Reverb esteja sempre em execução. Se estiver usando o Supervisor para executar o Reverb, atualize a configuração 'minfds' do arquivo de configuração do seu servidor 'supervisor.conf' para garantir que o Supervisor é capaz de abrir os arquivos necessários para lidar com as conexões ao seu servidor do Reverb:

```ini
[supervisord]
...
minfds=10000
```

<a name="scaling"></a>
### Escalada

Se você precisar lidar com mais conexões do que um único servidor permitir, você pode dimensionar seu servidor Reverb horizontalmente. Utilizando as capacidades de publicação/assinatura do Redis, o Reverb é capaz de gerenciar conexões em vários servidores. Quando uma mensagem é recebida por um dos seus servidores Reverb do aplicativo, o servidor usará o Redis para publicar a mensagem recebida em todos os outros servidores.

Para habilitar a escalação horizontal, você deve definir o `REVERB_SCALING_ENABLED` em seu arquivo `.env` de configuração do aplicativo para "verdadeiro".

```env
REVERB_SCALING_ENABLED=true
```

Em seguida, você deve ter um servidor Redis dedicado e central que todas as máquinas de reverberação se comunicarão. A reverberação utilizará a [conexão padrão do Redis configurada para seu aplicativo] (https://docs/redis#configuration) para publicar mensagens em todos os seus servidores de reverberação.

Uma vez que você tenha habilitado a opção de escala do reverb e configurado um servidor redis, você pode simplesmente invocar o comando `reverb:start` em vários servidores capazes de se comunicar com seu servidor redis. Esses servidores reverb devem estar atrás de um balanceador de carga que distribua as solicitações recebidas igualmente entre os servidores.
