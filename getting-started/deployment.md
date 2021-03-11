# Publicação

## Introdução
Quando você estiver pronto para implantar seu aplicativo Laravel em produção, há algumas coisas importantes que você pode fazer para 
garantir que seu aplicativo seja executado da maneira mais eficiente possível. Neste documento, cobriremos alguns ótimos pontos de 
partida para garantir que seu aplicativo Laravel seja implementado corretamente.

## Requisitos do servidor
O framework Laravel possui alguns requisitos de sistema. Você deve garantir que seu servidor da web tenha as mínimas extensões e versão PHP:

* PHP >= 7.3
* Extensão BCMath PHP
* Extensão PHP Ctype
* Extensão Fileinfo PHP
* Extensão JSON PHP
* Extensão PHP Mbstring
* Extensão OpenSSL PHP
* Extensão PDO PHP
* Extensão Tokenizer PHP
* Extensão XML PHP

## Configuração do Servidor

### Nginx
Se você estiver implantando seu aplicativo em um servidor que esteja executando o Nginx, poderá usar o seguinte arquivo de configuração como 
ponto de partida para configurar seu servidor web. Provavelmente, este arquivo precisará ser personalizado dependendo da configuração do seu 
servidor. Se você deseja assistência no gerenciamento considere usar um serviço de implantação e gerenciamento de servidor Laravel original, 
como o [Laravel Forge](https://forge.laravel.com/).

Certifique-se de que, como a configuração abaixo, o seu servidor web direcione todas as solicitações para o arquivo `public/index.php` do seu aplicativo. 
Você nunca deve tentar mover o arquivo `index.php` para a raiz do seu projeto, pois servir o aplicativo da raiz do projeto irá expor muitos arquivos de 
configuração confidenciais:

```
server {
    listen 80;
    server_name example.com;
    root /srv/example.com/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
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
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

## Otimização

### Otimização do Autoloader

Ao implantar para produção, certifique-se de otimizar o mapa do autoloader de classe do Composer para que este possa encontrar rapidamente 
o arquivo apropriado para carregar para uma determinada classe:

```bash
composer install --optimize-autoloader --no-dev
```

> Além de otimizar o autoloader, você deve sempre se certificar de incluir um arquivo `composer.lock` no repositório de controle 
> de origem do seu projeto. As dependências do seu projeto podem ser instaladas muito mais rápido quando o `composer.lock`
> está presente.
 
### Otimizando o carregamento da configuração
Ao implantar seu aplicativo para produção, você deve certificar-se de executar o comando Artisan `config:cache` durante o processo de implantação:

```bash
php artisan config:cache
```

Este comando combinará todos os arquivos de configuração do Laravel em um único arquivo em cache, o que reduz bastante o número de viagens que o 
framework deve fazer ao sistema de arquivos ao carregar seus valores de configuração.

> Se você executar o comando `config:cache` durante o processo de implantação, certifique-se de que está apenas chamando a função `env` de dentro 
> dos arquivos de configuração. Depois que a configuração for armazenada em cache, o arquivo `.env` não será carregado e todas as chamadas para a 
> função `env` para as váriaveis `.env` serão retornadas `null`.
 
### Otimizando o carregamento da rota
Se você estiver construindo um grande aplicativo com muitas rotas, certifique-se de que tenha executado o comando Artisan `route:cache` durante o 
processo de implantação:

```bash
php artisan route:cache
```

Este comando reduz todos os seus registros de rota em uma única chamada de método dentro de um arquivo em cache, melhorando o desempenho do registro 
de rota ao registrar centenas de rotas.

### Otimizando o carregamento de visualização
Ao implantar seu aplicativo para produção, você deve certificar-se de executar o comando Artisan `view:cache` durante o processo de implantação:

```bash
php artisan view:cache
```

Este comando pré-compila todas as suas Blade para que não sejam compiladas sob demanda, melhorando o desempenho de cada solicitação que retorna uma 
view.

## Modo de depuração
A opção de depuração em seu arquivo de configuração `config/app.php` determina quanta informação sobre um erro é realmente exibida para o usuário. 
Por padrão, esta opção é definida para respeitar o valor da variável de ambiente `APP_DEBUG` que é armazenada em seu arquivo `.env`.

Em seu ambiente de produção, esse valor deve ser sempre false. Se a várivel `APP_DEBUG` for definida como `true` em produção, você corre o risco de expor 
valores de configuração confidenciais aos usuários finais de seu aplicativo.

## Implantando com Forge/Vapor

### Laravel Forge
Se você ainda não está pronto para gerenciar a configuração do seu próprio servidor ou não está confortável em configurar todos os vários 
serviços necessários para rodar um aplicativo Laravel robusto, o Laravel Forge é uma alternativa maravilhosa.

Laravel Forge pode criar servidores em vários provedores de infraestrutura, como DigitalOcean, Linode, AWS e muito mais. Além disso, o Forge 
instala e gerencia todas as ferramentas necessárias para construir aplicativos Laravel robustos, como Nginx, MySQL, Redis, Memcached, 
Beanstalk e muito mais.

### Laravel Vapor
Se você deseja uma plataforma de implantação totalmente sem servidor e com escalonamento automático ajustada para o Laravel, dê uma olhada no 
[Laravel Vapor](https://vapor.laravel.com/). Laravel Vapor é uma plataforma de implantação sem servidor para Laravel, desenvolvida pela AWS. Lance sua infraestrutura Laravel 
no Vapor e apaixone-se pela simplicidade escalonável sem servidor. O Laravel Vapor foi ajustado pelos criadores do Laravel para funcionar 
perfeitamente com o framework, para que você possa continuar escrevendo seus aplicativos Laravel exatamente como está acostumado.
