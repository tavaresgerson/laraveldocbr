# Deployment

## Introdução

Quando estiver pronto para distribuir o seu aplicativo Laravel à produção, existem algumas coisas importantes a ter em atenção para garantir que o aplicativo funciona da forma mais eficiente possível. Neste documento, discutimos alguns pontos de partida que podem ajudar a distribuir com sucesso o seu aplicativo Laravel.

## Requisitos do servidor

O framework Laravel exige alguns requisitos mínimos do seu sistema. Verifique se o servidor Web tem as seguintes versões e extensões mínimas de PHP:

- PHP >= 8.2
- Ctype PHP
- cURL PHP
- DOM PHP
- Fileinfo PHP
- Filter PHP
- Hash PHP 
- Mbstring PHP
- OpenSSL PHP
- PCRE PHP 
- PDO PHP 
- Session PHP 
- Tokenizer PHP
- XML PHP

## Configuração do servidor

### NGINX

Se estiver a implementar a sua aplicação num servidor que execute o Nginx, poderá utilizar o seguinte ficheiro de configuração como ponto de partida para configurar o seu servidor web. Provavelmente, este ficheiro terá de ser personalizado com base na configuração do seu servidor. **Se pretender assistência na gestão do seu servidor, poderá recorrer a um serviço de gestão e implementação de servidores Laravel como o [Laravel Forge](https://forge.laravel.com).**

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

### FrankenPHP

O [FrankenPHP](https://frankenphp.dev/) também pode ser usado para hospedar seu aplicativo Laravel. O FrankenPHP é um servidor de aplicativos PHP moderno escrito em Go. Para servir um aplicativo PHP do Laravel utilizando o FrankenPHP, você pode invocar seu comando `php-server` da seguinte maneira:

```shell
frankenphp php-server -r public/
```

Para aproveitar recursos mais poderosos suportados pelo FrankenPHP, como a integração com o Laravel Octane, HTTP/3, compressão moderna ou a capacidade de empacotar aplicações do Laravel como binários autônomos, consulte a documentação do FrankenPHP para o Laravel no site [FrankenPHP's Laravel documentation](https://frankenphp.dev/docs/laravel/).

### Permissões do diretório

O Laravel precisará escrever nas pastas `bootstrap/cache` e `storage`, portanto, você deve garantir que o proprietário do processo do servidor web tenha permissão para escrever nessas pastas.

## Otimização

Ao implementar sua aplicação na produção, uma série de arquivos deve ser armazenado em cache, incluindo a configuração, eventos, rotas e visualizações. O Laravel fornece um único comando do Artisan `optimize` que permite o armazenamento destes arquivos em cache. Este comando normalmente é acionado como parte do processo de implementação da sua aplicação:

```shell
php artisan optimize
```

O método `optimize:clear` pode ser usado para remover todos os arquivos do cache gerados pelo comando `optimize`:

```shell
php artisan optimize:clear
```

Na documentação a seguir, discutiremos cada um dos comandos de otimização detalhada que são executados pelo comando `optimize`.

### Configuração de Armazenamento em Cache

Ao implantar seu aplicativo na produção, você deve certificar-se de executar o comando do Artisan `config:cache` durante seu processo de implementação:

```shell
php artisan config:cache
```

Este comando combina todos os arquivos de configuração do Laravel em um único arquivo, que é armazenado em cache, reduzindo consideravelmente a quantidade de vezes que o framework precisa se conectar ao sistema de arquivos para carregar seus valores de configuração.

::: info AVISO
Se você executar o comando `config:cache` durante seu processo de implantação, certifique-se que está chamando a função `env` somente a partir de dentro dos seus arquivos de configuração. Uma vez que a configuração foi armazenada em cache, o arquivo `.env` não será mais carregado e todas as chamadas à função `env` para variáveis `.env` retornarão `null`.
:::

### Armazenamento em cache de eventos

Deve armazenar em cache os mapeamentos de evento a um ouvinte identificados automaticamente no seu aplicativo durante o processo de implantação. Isso pode ser realizado ao invocar a ordem `event:cache` do Artisan durante a implantação:

```shell
php artisan event:cache
```

### Armazenar rotas

Se estiver a construir um aplicativo grande com vários caminhos, deve certificar-se de executar o comando `route:cache` do Artisan durante o processo de implementação:

```shell
php artisan route:cache
```

Este comando reduz todas as suas inscrições de rota em uma única chamada de método dentro de um arquivo de cache, melhorando o desempenho da inscrição de rota quando se registram centenas de rotas.

### Memorização das visualizações

Ao implementar sua aplicação em produção, certifique-se de executar o comando Artisan `view:cache` durante seu processo de implementação:

```shell
php artisan view:cache
```

Esse comando pré-compila todas as suas visualizações do Blade para que elas não sejam compiladas conforme necessário, o que melhora o desempenho de cada solicitação que retorna uma visualização.

## Modo de Depuração

A opção `debug` em seu arquivo de configuração `config/app.php` determina quais informações sobre um erro serão realmente exibidas ao usuário. Por padrão, esta opção respeita o valor da variável de ambiente `APP_DEBUG`, que está armazenada no arquivo `.env` do aplicativo.

::: warning ATENÇÃO
**No ambiente de produção, este valor deve ser sempre `false`. Se a variável `APP_DEBUG` estiver definida como `true` na produção, corre-se o risco de expor valores sensíveis da aplicação aos finais utilizadores.**
:::

## Rota de Integridade

O Laravel inclui uma rota de verificação de integridade que pode ser usada para monitorar o estado da aplicação. Na produção, essa rota pode ser usada para informar o estado da sua aplicação a um sistema de monitoramento do tempo de atividade, balanceador de carga ou sistema de orquestração, como o Kubernetes.

Por padrão, a rota de verificação da integridade é servida em `/up` e retorna uma resposta HTTP 200 se o aplicativo iniciou-se sem exceções. Caso contrário, será enviado um resposta HTTP 500. Você pode configurar o URI desta rota no ficheiro `bootstrap/app`, da aplicação:

```php
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up', // [tl! remove]
        health: '/status', // [tl! add]
    )
```

Quando uma requisição HTTP é feita para este roteamento, o Laravel envia também um evento `Illuminate\Foundation\Events\DiagnosingHealth`, permitindo que você faça verificações de saúde adicionais relevantes à aplicação. Em um [ouvinte](/docs/events) para este evento, é possível verificar o status do banco de dados ou cache da sua aplicação. Se você detectar algum problema com a aplicação, pode simplesmente lançar uma exceção a partir do ouvinte.

## Implementação fácil com o Forge/Vapor

#### Laravel Forge

Se você não estiver pronto para gerenciar sua própria configuração de servidor ou não se sentir à vontade para configurar todos os vários serviços necessários para executar uma aplicação Laravel robusta, o [Laravel Forge](https://forge.laravel.com) é uma excelente alternativa.

O Laravel Forge pode criar servidores em vários fornecedores de infraestrutura, como DigitalOcean, Linode e AWS, entre outros. Além disso, o Forge instala e gere todas as ferramentas necessárias para construir aplicações robustas com Laravel, tais como Nginx, MySQL, Redis, Memcached e Beanstalk, entre outras.

::: info NOTA
Quer um guia completo para implantação com Laravel Forge? Confira o [Laravel Bootcamp](https://bootcamp.laravel.com/deploying) e o Forge nesta [série de vídeos disponíveis no Laracasts](https://laracasts.com/series/learn-laravel-forge-2022-edition).
:::

#### Laravel Vapor

Se você gostaria de uma plataforma de implantação totalmente sem servidor, com escala automática ajustada para o Laravel, confira o [Laravel Vapor](https://vapor.laravel.com). O Laravel Vapor é uma plataforma de implantação sem servidor para o Laravel, executado pela AWS. Inicie sua infraestrutura do Laravel na Vapor e se apaixone pela simplicidade escalável de um sistema sem servidor. O Laravel Vapor foi ajustado pelos criadores do Laravel para funcionar perfeitamente com o framework, permitindo que você siga escrevendo seus aplicativos do Laravel exatamente como está acostumado.
