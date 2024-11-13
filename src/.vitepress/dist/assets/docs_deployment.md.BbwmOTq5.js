import{_ as a,c as s,o as e,a4 as i}from"./chunks/framework.nQaBHiNx.js";const u=JSON.parse('{"title":"Deployment","description":"","frontmatter":{},"headers":[],"relativePath":"docs/deployment.md","filePath":"docs/deployment.md"}'),o={name:"docs/deployment.md"},n=i(`<h1 id="deployment" tabindex="-1">Deployment <a class="header-anchor" href="#deployment" aria-label="Permalink to &quot;Deployment&quot;">​</a></h1><h2 id="introducao" tabindex="-1">Introdução <a class="header-anchor" href="#introducao" aria-label="Permalink to &quot;Introdução&quot;">​</a></h2><p>Quando estiver pronto para distribuir o seu aplicativo Laravel à produção, existem algumas coisas importantes a ter em atenção para garantir que o aplicativo funciona da forma mais eficiente possível. Neste documento, discutimos alguns pontos de partida que podem ajudar a distribuir com sucesso o seu aplicativo Laravel.</p><h2 id="requisitos-do-servidor" tabindex="-1">Requisitos do servidor <a class="header-anchor" href="#requisitos-do-servidor" aria-label="Permalink to &quot;Requisitos do servidor&quot;">​</a></h2><p>O framework Laravel exige alguns requisitos mínimos do seu sistema. Verifique se o servidor Web tem as seguintes versões e extensões mínimas de PHP:</p><ul><li>PHP &gt;= 8.2</li><li>Ctype PHP</li><li>cURL PHP</li><li>DOM PHP</li><li>Fileinfo PHP</li><li>Filter PHP</li><li>Hash PHP</li><li>Mbstring PHP</li><li>OpenSSL PHP</li><li>PCRE PHP</li><li>PDO PHP</li><li>Session PHP</li><li>Tokenizer PHP</li><li>XML PHP</li></ul><h2 id="configuracao-do-servidor" tabindex="-1">Configuração do servidor <a class="header-anchor" href="#configuracao-do-servidor" aria-label="Permalink to &quot;Configuração do servidor&quot;">​</a></h2><h3 id="nginx" tabindex="-1">NGINX <a class="header-anchor" href="#nginx" aria-label="Permalink to &quot;NGINX&quot;">​</a></h3><p>Se estiver a implementar a sua aplicação num servidor que execute o Nginx, poderá utilizar o seguinte ficheiro de configuração como ponto de partida para configurar o seu servidor web. Provavelmente, este ficheiro terá de ser personalizado com base na configuração do seu servidor. <strong>Se pretender assistência na gestão do seu servidor, poderá recorrer a um serviço de gestão e implementação de servidores Laravel como o <a href="https://forge.laravel.com" target="_blank" rel="noreferrer">Laravel Forge</a>.</strong></p><p>Verifique se o servidor web direciona todas as solicitações para o arquivo <code>public/index.php</code> do aplicativo, conforme a configuração abaixo. Nunca tente mover o arquivo <code>index.php</code> para a raiz do projeto, pois isso exporia vários arquivos de configuração sensíveis à Internet pública:</p><div class="language-nginx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">nginx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">server</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    listen </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    listen </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[::]:80;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    server_name </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">example.com;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    root </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/srv/example.com/public;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    add_header </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">X-Frame-Options </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;SAMEORIGIN&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    add_header </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">X-Content-Type-Options </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;nosniff&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    index </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">index.php;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    charset </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">utf-8;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    location</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> / </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        try_files </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$uri $uri/ /index.php?$query_string;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    location</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;"> /favicon.ico </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> access_log </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">off</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> log_not_found </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">off</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    location</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;"> /robots.txt  </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> access_log </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">off</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> log_not_found </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">off</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    error_page </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">404</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /index.php;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    location</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ~</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;"> \\.php$ </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        fastcgi_pass </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">unix:/var/run/php/php8.2-fpm.sock;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        fastcgi_param </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">SCRIPT_FILENAME $realpath_root$fastcgi_script_name;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        include </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fastcgi_params;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        fastcgi_hide_header </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">X-Powered-By;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    location</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ~</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;"> /\\.(?!well-known).* </span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        deny </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">all</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="frankenphp" tabindex="-1">FrankenPHP <a class="header-anchor" href="#frankenphp" aria-label="Permalink to &quot;FrankenPHP&quot;">​</a></h3><p>O <a href="https://frankenphp.dev/" target="_blank" rel="noreferrer">FrankenPHP</a> também pode ser usado para hospedar seu aplicativo Laravel. O FrankenPHP é um servidor de aplicativos PHP moderno escrito em Go. Para servir um aplicativo PHP do Laravel utilizando o FrankenPHP, você pode invocar seu comando <code>php-server</code> da seguinte maneira:</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">frankenphp</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> php-server</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -r</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> public/</span></span></code></pre></div><p>Para aproveitar recursos mais poderosos suportados pelo FrankenPHP, como a integração com o Laravel Octane, HTTP/3, compressão moderna ou a capacidade de empacotar aplicações do Laravel como binários autônomos, consulte a documentação do FrankenPHP para o Laravel no site <a href="https://frankenphp.dev/docs/laravel/" target="_blank" rel="noreferrer">FrankenPHP&#39;s Laravel documentation</a>.</p><h3 id="permissoes-do-diretorio" tabindex="-1">Permissões do diretório <a class="header-anchor" href="#permissoes-do-diretorio" aria-label="Permalink to &quot;Permissões do diretório&quot;">​</a></h3><p>O Laravel precisará escrever nas pastas <code>bootstrap/cache</code> e <code>storage</code>, portanto, você deve garantir que o proprietário do processo do servidor web tenha permissão para escrever nessas pastas.</p><h2 id="otimizacao" tabindex="-1">Otimização <a class="header-anchor" href="#otimizacao" aria-label="Permalink to &quot;Otimização&quot;">​</a></h2><p>Ao implementar sua aplicação na produção, uma série de arquivos deve ser armazenado em cache, incluindo a configuração, eventos, rotas e visualizações. O Laravel fornece um único comando do Artisan <code>optimize</code> que permite o armazenamento destes arquivos em cache. Este comando normalmente é acionado como parte do processo de implementação da sua aplicação:</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">php</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> artisan</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> optimize</span></span></code></pre></div><p>O método <code>optimize:clear</code> pode ser usado para remover todos os arquivos do cache gerados pelo comando <code>optimize</code>:</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">php</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> artisan</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> optimize:clear</span></span></code></pre></div><p>Na documentação a seguir, discutiremos cada um dos comandos de otimização detalhada que são executados pelo comando <code>optimize</code>.</p><h3 id="configuracao-de-armazenamento-em-cache" tabindex="-1">Configuração de Armazenamento em Cache <a class="header-anchor" href="#configuracao-de-armazenamento-em-cache" aria-label="Permalink to &quot;Configuração de Armazenamento em Cache&quot;">​</a></h3><p>Ao implantar seu aplicativo na produção, você deve certificar-se de executar o comando do Artisan <code>config:cache</code> durante seu processo de implementação:</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">php</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> artisan</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config:cache</span></span></code></pre></div><p>Este comando combina todos os arquivos de configuração do Laravel em um único arquivo, que é armazenado em cache, reduzindo consideravelmente a quantidade de vezes que o framework precisa se conectar ao sistema de arquivos para carregar seus valores de configuração.</p><div class="info custom-block"><p class="custom-block-title">AVISO</p><p>Se você executar o comando <code>config:cache</code> durante seu processo de implantação, certifique-se que está chamando a função <code>env</code> somente a partir de dentro dos seus arquivos de configuração. Uma vez que a configuração foi armazenada em cache, o arquivo <code>.env</code> não será mais carregado e todas as chamadas à função <code>env</code> para variáveis <code>.env</code> retornarão <code>null</code>.</p></div><h3 id="armazenamento-em-cache-de-eventos" tabindex="-1">Armazenamento em cache de eventos <a class="header-anchor" href="#armazenamento-em-cache-de-eventos" aria-label="Permalink to &quot;Armazenamento em cache de eventos&quot;">​</a></h3><p>Deve armazenar em cache os mapeamentos de evento a um ouvinte identificados automaticamente no seu aplicativo durante o processo de implantação. Isso pode ser realizado ao invocar a ordem <code>event:cache</code> do Artisan durante a implantação:</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">php</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> artisan</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> event:cache</span></span></code></pre></div><h3 id="armazenar-rotas" tabindex="-1">Armazenar rotas <a class="header-anchor" href="#armazenar-rotas" aria-label="Permalink to &quot;Armazenar rotas&quot;">​</a></h3><p>Se estiver a construir um aplicativo grande com vários caminhos, deve certificar-se de executar o comando <code>route:cache</code> do Artisan durante o processo de implementação:</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">php</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> artisan</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> route:cache</span></span></code></pre></div><p>Este comando reduz todas as suas inscrições de rota em uma única chamada de método dentro de um arquivo de cache, melhorando o desempenho da inscrição de rota quando se registram centenas de rotas.</p><h3 id="memorizacao-das-visualizacoes" tabindex="-1">Memorização das visualizações <a class="header-anchor" href="#memorizacao-das-visualizacoes" aria-label="Permalink to &quot;Memorização das visualizações&quot;">​</a></h3><p>Ao implementar sua aplicação em produção, certifique-se de executar o comando Artisan <code>view:cache</code> durante seu processo de implementação:</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">php</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> artisan</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> view:cache</span></span></code></pre></div><p>Esse comando pré-compila todas as suas visualizações do Blade para que elas não sejam compiladas conforme necessário, o que melhora o desempenho de cada solicitação que retorna uma visualização.</p><h2 id="modo-de-depuracao" tabindex="-1">Modo de Depuração <a class="header-anchor" href="#modo-de-depuracao" aria-label="Permalink to &quot;Modo de Depuração&quot;">​</a></h2><p>A opção <code>debug</code> em seu arquivo de configuração <code>config/app.php</code> determina quais informações sobre um erro serão realmente exibidas ao usuário. Por padrão, esta opção respeita o valor da variável de ambiente <code>APP_DEBUG</code>, que está armazenada no arquivo <code>.env</code> do aplicativo.</p><div class="warning custom-block"><p class="custom-block-title">ATENÇÃO</p><p><strong>No ambiente de produção, este valor deve ser sempre <code>false</code>. Se a variável <code>APP_DEBUG</code> estiver definida como <code>true</code> na produção, corre-se o risco de expor valores sensíveis da aplicação aos finais utilizadores.</strong></p></div><h2 id="rota-de-integridade" tabindex="-1">Rota de Integridade <a class="header-anchor" href="#rota-de-integridade" aria-label="Permalink to &quot;Rota de Integridade&quot;">​</a></h2><p>O Laravel inclui uma rota de verificação de integridade que pode ser usada para monitorar o estado da aplicação. Na produção, essa rota pode ser usada para informar o estado da sua aplicação a um sistema de monitoramento do tempo de atividade, balanceador de carga ou sistema de orquestração, como o Kubernetes.</p><p>Por padrão, a rota de verificação da integridade é servida em <code>/up</code> e retorna uma resposta HTTP 200 se o aplicativo iniciou-se sem exceções. Caso contrário, será enviado um resposta HTTP 500. Você pode configurar o URI desta rota no ficheiro <code>bootstrap/app</code>, da aplicação:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    -&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">withRouting</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        web</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">__DIR__</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/../routes/web.php&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        commands</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">__DIR__</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/../routes/console.php&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        health</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/up&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// [tl! remove]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        health</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/status&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// [tl! add]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    )</span></span></code></pre></div><p>Quando uma requisição HTTP é feita para este roteamento, o Laravel envia também um evento <code>Illuminate\\Foundation\\Events\\DiagnosingHealth</code>, permitindo que você faça verificações de saúde adicionais relevantes à aplicação. Em um <a href="/docs/events.html">ouvinte</a> para este evento, é possível verificar o status do banco de dados ou cache da sua aplicação. Se você detectar algum problema com a aplicação, pode simplesmente lançar uma exceção a partir do ouvinte.</p><h2 id="implementacao-facil-com-o-forge-vapor" tabindex="-1">Implementação fácil com o Forge/Vapor <a class="header-anchor" href="#implementacao-facil-com-o-forge-vapor" aria-label="Permalink to &quot;Implementação fácil com o Forge/Vapor&quot;">​</a></h2><h4 id="laravel-forge" tabindex="-1">Laravel Forge <a class="header-anchor" href="#laravel-forge" aria-label="Permalink to &quot;Laravel Forge&quot;">​</a></h4><p>Se você não estiver pronto para gerenciar sua própria configuração de servidor ou não se sentir à vontade para configurar todos os vários serviços necessários para executar uma aplicação Laravel robusta, o <a href="https://forge.laravel.com" target="_blank" rel="noreferrer">Laravel Forge</a> é uma excelente alternativa.</p><p>O Laravel Forge pode criar servidores em vários fornecedores de infraestrutura, como DigitalOcean, Linode e AWS, entre outros. Além disso, o Forge instala e gere todas as ferramentas necessárias para construir aplicações robustas com Laravel, tais como Nginx, MySQL, Redis, Memcached e Beanstalk, entre outras.</p><div class="info custom-block"><p class="custom-block-title">NOTA</p><p>Quer um guia completo para implantação com Laravel Forge? Confira o <a href="https://bootcamp.laravel.com/deploying" target="_blank" rel="noreferrer">Laravel Bootcamp</a> e o Forge nesta <a href="https://laracasts.com/series/learn-laravel-forge-2022-edition" target="_blank" rel="noreferrer">série de vídeos disponíveis no Laracasts</a>.</p></div><h4 id="laravel-vapor" tabindex="-1">Laravel Vapor <a class="header-anchor" href="#laravel-vapor" aria-label="Permalink to &quot;Laravel Vapor&quot;">​</a></h4><p>Se você gostaria de uma plataforma de implantação totalmente sem servidor, com escala automática ajustada para o Laravel, confira o <a href="https://vapor.laravel.com" target="_blank" rel="noreferrer">Laravel Vapor</a>. O Laravel Vapor é uma plataforma de implantação sem servidor para o Laravel, executado pela AWS. Inicie sua infraestrutura do Laravel na Vapor e se apaixone pela simplicidade escalável de um sistema sem servidor. O Laravel Vapor foi ajustado pelos criadores do Laravel para funcionar perfeitamente com o framework, permitindo que você siga escrevendo seus aplicativos do Laravel exatamente como está acostumado.</p>`,54),r=[n];function t(l,p,d,h,c,k){return e(),s("div",null,r)}const g=a(o,[["render",t]]);export{u as __pageData,g as default};