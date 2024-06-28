# Implementação

<a name="introduction"></a>
## Introdução

 Quando estiver pronto para distribuir o seu aplicativo Laravel à produção, existem algumas coisas importantes a ter em atenção para garantir que o aplicativo funciona da forma mais eficiente possível. Neste documento, discutimos alguns pontos de partida que podem ajudar a distribuir com sucesso o seu aplicativo Laravel.

<a name="server-requirements"></a>
## Requisitos do servidor

 O framework Laravel exige alguns requisitos mínimos do seu sistema. Verifique se o servidor Web tem as seguintes versões e extensões mínimas de PHP:

<div class="content-list" markdown="1">

 - PHP >= 8.2
 - Ctype PHP Extension
 - a extensão cURL para PHP
 - Extensão para o DOM e PHP
 - Expansão de arquivos do Fileinfo em PHP
 - Filtro de extensão PHP
 - Extensão de Hash PHP
 - extensão Mbstring PHP
 - extensão OpenSSL para o PHP
 - PCRE, extensão PHP
 - extensão de PHP com código Pdo
 - extensão PHP para sessões
 - Expansão de tokenizador no PHP
 - Extensão XML PHP

</div>

<a name="server-configuration"></a>
## Configuração do servidor

<a name="nginx"></a>
### NGINX

 Se estiver a implementar a sua aplicação num servidor que execute o Nginx, poderá utilizar o seguinte ficheiro de configuração como ponto de partida para configurar o seu servidor web. Provavelmente, este ficheiro terá de ser personalizado com base na configuração do seu servidor. **Se pretender assistência na gestão do seu servidor, poderá recorrer a um serviço de gestão e implementação de servidores Laravel da primeira parte como o [Laravel Forge](https://forge.laravel.com).**

 Verifique se o servidor web direciona todas as solicitações para o arquivo `public/index.php` do aplicativo, conforme a configuração abaixo. Nunca tente mover o arquivo `index.php` para a raiz do projeto, pois isso exporia vários arquivos de configuração sensíveis à Internet pública:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com;
    root /srv/example.com/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

<a name="frankenphp"></a>
### FrankenPHP

 O [FrankenPHP](https://frankenphp.dev/) também pode ser usado para hospedar seu aplicativo Laravel. O FrankenPHP é um servidor de aplicativos PHP moderno escrito em Go. Para servir um aplicativo PHP do Laravel utilizando o FrankenPHP, você pode invocar seu comando `php-server` da seguinte maneira:

```shell
frankenphp php-server -r public/
```

 Para aproveitar recursos mais poderosos suportados pelo FrankenPHP, como a integração com o Laravel Octane, HTTP/3, compressão moderna ou a capacidade de empacotar aplicações do Laravel como binários autônomos, consulte a documentação do FrankenPHP para o Laravel no site [FrankenPHP's Laravel documentation](https://frankenphp.dev/docs/laravel/).

<a name="directory-permissions"></a>
### Permissões do diretório

 O Laravel precisará escrever nas diretórias `bootstrap/cache` e `storage`, portanto, você deve garantir que o proprietário do processo do servidor web tenha permissão para escrever nessas pastas.

<a name="optimization"></a>
## Otimização

 Ao implementar sua aplicação na produção, uma série de arquivos deve ser armazenado em cache, incluindo a configuração, eventos, rotas e visualizações. O Laravel fornece um único comando do Artisan `optimize` que permite o armazenamento destes arquivos em cache. Este comando normalmente é acionado como parte do processo de implementação da sua aplicação:

```shell
php artisan optimize
```

 O método `optimize:clear` pode ser usado para remover todos os arquivos do cache gerados pelo comando `optimize`:

```shell
php artisan optimize:clear
```

 Na documentação a seguir, discutiremos cada um dos comandos de otimização detalhada que são executados pelo comando `otimizar`.

<a name="optimizing-configuration-loading"></a>
### Configuração de Armazenamento em Cache

 Ao implantar seu aplicativo na produção, você deve certificar-se de executar o comando do Artisan `config:cache` durante seu processo de implementação:

```shell
php artisan config:cache
```

 Este comando combina todos os arquivos de configuração do Laravel em um único arquivo, que é armazenado em cache, reduzindo consideravelmente a quantidade de vezes que o framework precisa se conectar ao sistema de arquivos para carregar seus valores de configuração.

 > [AVISO]
 > Se você executar o comando `config:cache` durante seu processo de implantação, certifique-se que está chamando a função `env` somente a partir dentro dos seus arquivos de configuração. Uma vez que a configuração foi armazenada em cache, o arquivo `.env` não será mais carregado e todas as chamadas à função `env` para variáveis `.env` retornarão `null`.

<a name="caching-events"></a>
### Armazenamento em cache de eventos

 Deve armazenar em cache os mapeamentos de evento a um ouvinte identificados automaticamente no seu aplicativo durante o processo de implantação. Isso pode ser realizado ao invocar a ordem `event:cache` do Artisan durante a implantação:

```shell
php artisan event:cache
```

<a name="optimizing-route-loading"></a>
### Armazenar rotas

 Se estiver a construir um aplicativo grande com vários caminhos, deve certificar-se de executar o comando `route:cache` da Artisan durante o processo de implementação:

```shell
php artisan route:cache
```

 Este comando reduz todas as suas inscrições de rota em uma única chamada de método dentro de um arquivo de cache, melhorando o desempenho da inscrição de rota quando se inscrevem centenas de rotas.

<a name="optimizing-view-loading"></a>
### Memorização das visualizações

 Ao implementar sua aplicação em produção, certifique-se de executar o comando Artisan `view:cache` durante seu processo de implementação:

```shell
php artisan view:cache
```

 Esse comando pré-compila todas as suas vistas do Blade para que elas não sejam compiladas conforme necessário, o que melhora o desempenho de cada solicitação que retorna uma vista.

<a name="debug-mode"></a>
## Modo de Depuração

 A opção `debug` em seu arquivo de configuração `config/app.php` determina quais informações sobre um erro serão realmente exibidas ao usuário. Por padrão, esta opção respeita o valor da variável de ambiente `APP_DEBUG`, que está armazenada no arquivo `.env` do aplicativo.

 > [AVERIGUE TODAS AS CONSEQUÊNCIAS E RISCOS!
 > **No ambiente de produção, este valor deve ser sempre `false`. Se a variável `APP_DEBUG` estiver definida como `true` na produção, corre-se o risco de expor valores sensíveis da aplicação aos finais utilizadores.**

<a name="the-health-route"></a>
## O Caminho da Saúde

 O Laravel inclui uma rota de verificação de integridade que pode ser usada para monitorar o estado da aplicação. Na produção, essa rota pode ser usada para informar o estado da sua aplicação a um sistema de monitoramento do tempo de atividade, balanceador de carga ou sistema de orquestração, como o Kubernetes.

 Por padrão, a rota de verificação da integridade é servida em `/up` e retorna um resposta HTTP 200 se o aplicativo iniciou-se sem exceções. Caso contrário, será enviado um resposta HTTP 500. Pode configurar o URI desta rota no ficheiro `bootstrap/app`, da aplicação:

```php
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up', // [tl! remove]
        health: '/status', // [tl! add]
    )
```

 Quando uma requisição HTTP é feita para este roteamento, o Laravel envia também um evento `Illuminate\Foundation\Events\DiagnosingHealth`, permitindo que você faça verificações de saúde adicionais relevantes à aplicação. Em um [ouvinte](/docs/{{version}}/events) para este evento, é possível verificar o status do banco de dados ou cache da sua aplicação. Se você detectar algum problema com a aplicação, pode simplesmente lançar uma exceção a partir do ouvinte.

<a name="deploying-with-forge-or-vapor"></a>
## Implementação fácil com o Forge/Vapor

<a name="laravel-forge"></a>
#### Laravel Forge

 Se você não estiver pronto para gerenciar sua própria configuração de servidor ou não se sentir à vontade para configurar todos os vários serviços necessários para executar uma aplicação Laravel robusta, o [Laravel Forge](https://forge.laravel.com) é uma excelente alternativa.

 O Laravel Forge pode criar servidores em vários fornecedores de infraestrutura, como DigitalOcean, Linode e AWS, entre outros. Além disso, o Forge instala e gere todas as ferramentas necessárias para construir aplicações robustas com Laravel, tais como Nginx, MySQL, Redis, Memcached e Beanstalk, entre outras.

 > [!ATENÇÃO]
 [Curso introdutório ao Laravel](https://bootcamp.laravel.com/deploying) e o Forge

<a name="laravel-vapor"></a>
#### Laravel Vapor

 Se você gostaria de uma plataforma de implantação totalmente sem servidor, com escala automática ajustada para o Laravel, confira o [Laravel Vapor](https://vapor.laravel.com). O Laravel Vapor é uma plataforma de implantação sem servidor para o Laravel, executado pela AWS. Inicie sua infraestrutura do Laravel na Vapor e se apaixone pela simplicidade escalável de um sistema sem servidor. O Laravel Vapor foi ajustado pelos criadores do Laravel para funcionar perfeitamente com o framework, permitindo que você siga escrevendo seus aplicativos do Laravel exatamente como está acostumado.
