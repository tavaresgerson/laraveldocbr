# Laravel Reverb

<a name="introduction"></a>
## Introdução

[Laravel Reverb](https://github.com/laravel/reverb) traz comunicação WebSocket em tempo real extremamente rápida e escalável diretamente para seu aplicativo Laravel e fornece integração perfeita com o conjunto existente de [ferramentas de transmissão de eventos](/docs/broadcasting) do Laravel.

<a name="installation"></a>
## Instalação

Você pode instalar o Reverb usando o comando Artisan `install:broadcasting`:

```
php artisan install:broadcasting
```

<a name="configuration"></a>
## Configuração

Nos bastidores, o comando Artisan `install:broadcasting` executará o comando `reverb:install`, que instalará o Reverb com um conjunto sensato de opções de configuração padrão. Se você quiser fazer alguma alteração na configuração, pode fazê-lo atualizando as variáveis ​​de ambiente do Reverb ou atualizando o arquivo de configuração `config/reverb.php`.

<a name="application-credentials"></a>
### Credenciais do aplicativo

Para estabelecer uma conexão com o Reverb, um conjunto de credenciais de "aplicativo" do Reverb deve ser trocado entre o cliente e o servidor. Essas credenciais são configuradas no servidor e são usadas para verificar a solicitação do cliente. Você pode definir essas credenciais usando as seguintes variáveis ​​de ambiente:

```ini
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
```

<a name="allowed-origins"></a>
### Origens permitidas

Você também pode definir as origens das quais as solicitações do cliente podem se originar atualizando o valor da configuração `allowed_origins` na seção `apps` do arquivo de configuração `config/reverb.php`. Quaisquer solicitações de uma origem não listada em suas origens permitidas serão rejeitadas. Você pode permitir todas as origens usando `*`:

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
### Aplicativos adicionais

Normalmente, o Reverb fornece um servidor WebSocket para o aplicativo no qual está instalado. No entanto, é possível atender mais de um aplicativo usando uma única instalação do Reverb.

Por exemplo, você pode desejar manter um único aplicativo Laravel que, via Reverb, fornece conectividade WebSocket para vários aplicativos. Isso pode ser obtido definindo vários `apps` no arquivo de configuração `config/reverb.php` do seu aplicativo:

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

Na maioria dos casos, as conexões WebSocket seguras são manipuladas pelo servidor web upstream (Nginx, etc.) antes que a solicitação seja enviada por proxy para seu servidor Reverb.

No entanto, às vezes pode ser útil, como durante o desenvolvimento local, para o servidor Reverb manipular conexões seguras diretamente. Se você estiver usando o recurso de site seguro do [Laravel Herd](https://herd.laravel.com) ou estiver usando o [Laravel Valet](/docs/valet) e tiver executado o [comando secure](/docs/valet#securing-sites) em seu aplicativo, você pode usar o certificado Herd / Valet gerado para seu site para proteger suas conexões Reverb. Para fazer isso, defina a variável de ambiente `REVERB_HOST` para o nome do host do seu site ou passe explicitamente a opção hostname ao iniciar o servidor Reverb:

```sh
php artisan reverb:start --host="0.0.0.0" --port=8080 --hostname="laravel.test"
```

Como os domínios Herd e Valet resolvem para `localhost`, executar o comando acima resultará no seu servidor Reverb sendo acessível por meio do protocolo WebSocket seguro (`wss`) em `wss://laravel.test:8080`.

Você também pode escolher manualmente um certificado definindo as opções `tls` no arquivo de configuração `config/reverb.php` do seu aplicativo. Dentro do array de opções `tls`, você pode fornecer qualquer uma das opções suportadas pelas [opções de contexto SSL do PHP](https://www.php.net/manual/en/context.ssl.php):

```php
'options' => [
    'tls' => [
        'local_cert' => '/path/to/cert.pem'
    ],
],
```

<a name="running-server"></a>
## Executando o servidor

O servidor Reverb pode ser iniciado usando o comando Artisan `reverb:start`:

```sh
php artisan reverb:start
```

Por padrão, o servidor Reverb será iniciado em `0.0.0.0:8080`, tornando-o acessível de todas as interfaces de rede.

Se você precisar especificar um host ou porta personalizado, você pode fazer isso através das opções `--host` e `--port` ao iniciar o servidor:

```sh
php artisan reverb:start --host=127.0.0.1 --port=9000
```

Alternativamente, você pode definir as variáveis ​​de ambiente `REVERB_SERVER_HOST` e `REVERB_SERVER_PORT` no arquivo de configuração `.env` do seu aplicativo.

As variáveis ​​de ambiente `REVERB_SERVER_HOST` e `REVERB_SERVER_PORT` não devem ser confundidas com `REVERB_HOST` e `REVERB_PORT`. As primeiras especificam o host e a porta nos quais executar o próprio servidor Reverb, enquanto o último par instrui o Laravel para onde enviar mensagens de transmissão. Por exemplo, em um ambiente de produção, você pode rotear solicitações do seu nome de host público do Reverb na porta `443` para um servidor Reverb operando em `0.0.0.0:8080`. Neste cenário, suas variáveis ​​de ambiente seriam definidas da seguinte forma:

```ini
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

REVERB_HOST=ws.laravel.com
REVERB_PORT=443
```

<a name="debugging"></a>
### Debugging

Para melhorar o desempenho, o Reverb não emite nenhuma informação de depuração por padrão. Se você quiser ver o fluxo de dados passando pelo seu servidor Reverb, você pode fornecer a opção `--debug` para o comando `reverb:start`:

```sh
php artisan reverb:start --debug
```

<a name="restarting"></a>
### Reiniciando

Como o Reverb é um processo de longa duração, as alterações no seu código não serão refletidas sem reiniciar o servidor por meio do comando Artisan `reverb:restart`.

O comando `reverb:restart` garante que todas as conexões sejam encerradas normalmente antes de parar o servidor. Se você estiver executando o Reverb com um gerenciador de processos como o Supervisor, o servidor será reiniciado automaticamente pelo gerenciador de processos após todas as conexões terem sido encerradas:

```sh
php artisan reverb:restart
```

<a name="monitoring"></a>
## Monitoramento

O Reverb pode ser monitorado por meio de uma integração com o [Laravel Pulse](/docs/pulse). Ao habilitar a integração do Reverb com o Pulse, você pode rastrear o número de conexões e mensagens sendo manipuladas pelo seu servidor.

Para habilitar a integração, você deve primeiro garantir que tenha [instalado o Pulse](/docs/pulse#installation). Em seguida, adicione qualquer um dos gravadores do Reverb ao arquivo de configuração `config/pulse.php` do seu aplicativo:

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

Em seguida, adicione os cartões Pulse para cada gravador ao seu [painel do Pulse](/docs/pulse#dashboard-customization):

```blade
<x-pulse>
    <livewire:reverb.connections cols="full" />
    <livewire:reverb.messages cols="full" />
    ...
</x-pulse>
```

<a name="production"></a>
## Executando o Reverb em produção

Devido à natureza de longa execução dos servidores WebSocket, pode ser necessário fazer algumas otimizações no seu servidor e ambiente de hospedagem para garantir que seu servidor Reverb possa efetivamente lidar com o número ideal de conexões para os recursos disponíveis em seu servidor.

::: info NOTA
Se seu site for gerenciado pelo [Laravel Forge](https://forge.laravel.com), você pode otimizar automaticamente seu servidor para o Reverb diretamente do painel "Aplicativo". Ao habilitar a integração do Reverb, o Forge garantirá que seu servidor esteja pronto para produção, incluindo a instalação de quaisquer extensões necessárias e o aumento do número permitido de conexões.
:::

<a name="open-files"></a>
### Arquivos abertos

Cada conexão WebSocket é mantida na memória até que o cliente ou o servidor se desconecte. Em ambientes Unix e semelhantes ao Unix, cada conexão é representada por um arquivo. No entanto, geralmente há limites no número de arquivos abertos permitidos no nível do sistema operacional e do aplicativo.

<a name="operating-system"></a>
#### Sistema operacional

Em um sistema operacional baseado em Unix, você pode determinar o número permitido de arquivos abertos usando o comando `ulimit`:

```sh
ulimit -n
```

Este comando exibirá os limites de arquivos abertos permitidos para diferentes usuários. Você pode atualizar esses valores editando o arquivo `/etc/security/limits.conf`. Por exemplo, atualizar o número máximo de arquivos abertos para 10.000 para o usuário `forge` ficaria assim:

```ini
# /etc/security/limits.conf
forge        soft  nofile  10000
forge        hard  nofile  10000
```

<a name="event-loop"></a>
### Loop de eventos

Por baixo dos panos, o Reverb usa um loop de eventos ReactPHP para gerenciar conexões WebSocket no servidor. Por padrão, esse loop de eventos é alimentado por `stream_select`, que não requer nenhuma extensão adicional. No entanto, `stream_select` é normalmente limitado a 1.024 arquivos abertos. Dessa forma, se você planeja lidar com mais de 1.000 conexões simultâneas, precisará usar um loop de eventos alternativo não vinculado às mesmas restrições.

O Reverb alternará automaticamente para um loop alimentado por `ext-uv` quando disponível. Esta extensão PHP está disponível para instalação via PECL:

```sh
pecl install uv
```

<a name="web-server"></a>
### Servidor Web

Na maioria dos casos, o Reverb é executado em uma porta não voltada para a web no seu servidor. Então, para rotear o tráfego para o Reverb, você deve configurar um proxy reverso. Supondo que o Reverb esteja sendo executado no host `0.0.0.0` e na porta `8080` e seu servidor utilize o servidor web Nginx, um proxy reverso pode ser definido para seu servidor Reverb usando a seguinte configuração de site Nginx:

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

Normalmente, os servidores web são configurados para limitar o número de conexões permitidas para evitar sobrecarga do servidor. Para aumentar o número de conexões permitidas em um servidor web Nginx para 10.000, os valores `worker_rlimit_nofile` e `worker_connections` do arquivo `nginx.conf` devem ser atualizados:

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

A configuração acima permitirá que até 10.000 workers Nginx por processo sejam gerados. Além disso, essa configuração define o limite de arquivos abertos do Nginx para 10.000.

<a name="ports"></a>
### Portas

Os sistemas operacionais baseados em Unix geralmente limitam o número de portas que podem ser abertas no servidor. Você pode ver o intervalo permitido atual por meio do seguinte comando:

```sh
 cat /proc/sys/net/ipv4/ip_local_port_range
# 32768	60999
```

A saída acima mostra que o servidor pode manipular no máximo 28.231 (60.999 - 32.768) conexões, pois cada conexão requer uma porta livre. Embora recomendemos [escalonamento horizontal](#scaling) para aumentar o número de conexões permitidas, você pode aumentar o número de portas abertas disponíveis atualizando o intervalo de portas permitidas no arquivo de configuração `/etc/sysctl.conf` do seu servidor.

<a name="process-management"></a>
### Gerenciamento de Processos

Na maioria dos casos, você deve usar um gerenciador de processos como o Supervisor para garantir que o servidor Reverb esteja em execução contínua. Se estiver usando o Supervisor para executar o Reverb, você deve atualizar a configuração `minfds` do arquivo `supervisor.conf` do seu servidor para garantir que o Supervisor consiga abrir os arquivos necessários para manipular conexões com seu servidor Reverb:

```ini
[supervisord]
...
minfds=10000
```

<a name="scaling"></a>
### Escalonamento

Se você precisar manipular mais conexões do que um único servidor permitirá, você pode escalonar seu servidor Reverb horizontalmente. Utilizando os recursos de publicação/assinatura do Redis, o Reverb consegue gerenciar conexões em vários servidores. Quando uma mensagem é recebida por um dos servidores Reverb do seu aplicativo, o servidor usará o Redis para publicar a mensagem recebida em todos os outros servidores.

Para habilitar o dimensionamento horizontal, você deve definir a variável de ambiente `REVERB_SCALING_ENABLED` como `true` no arquivo de configuração `.env` do seu aplicativo:

```env
REVERB_SCALING_ENABLED=true
```

Em seguida, você deve ter um servidor Redis central dedicado ao qual todos os servidores Reverb se comunicarão. O Reverb usará a [conexão Redis padrão configurada para seu aplicativo](/docs/redis#configuration) para publicar mensagens em todos os seus servidores Reverb.

Depois de habilitar a opção de dimensionamento do Reverb e configurar um servidor Redis, você pode simplesmente invocar o comando `reverb:start` em vários servidores que podem se comunicar com seu servidor Redis. Esses servidores Reverb devem ser colocados atrás de um balanceador de carga que distribui as solicitações recebidas uniformemente entre os servidores.
