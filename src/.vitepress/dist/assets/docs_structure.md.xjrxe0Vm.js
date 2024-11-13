import{_ as e,c as o,o as a,a4 as r}from"./chunks/framework.nQaBHiNx.js";const v=JSON.parse('{"title":"Estrutura do diretório","description":"","frontmatter":{},"headers":[],"relativePath":"docs/structure.md","filePath":"docs/structure.md"}'),i={name:"docs/structure.md"},d=r('<h1 id="estrutura-do-diretorio" tabindex="-1">Estrutura do diretório <a class="header-anchor" href="#estrutura-do-diretorio" aria-label="Permalink to &quot;Estrutura do diretório&quot;">​</a></h1><h2 id="introducao" tabindex="-1">Introdução <a class="header-anchor" href="#introducao" aria-label="Permalink to &quot;Introdução&quot;">​</a></h2><p>O layout padrão da estrutura do aplicativo Laravel destina-se a fornecer um excelente ponto de partida para aplicações tanto grandes quanto pequenas, mas você está livre para organizar sua aplicação como quiser. O Laravel impõe poucas restrições sobre o local onde uma determinada classe pode ser localizada - desde que o Composer possa carregá-la automaticamente.</p><div class="info custom-block"><p class="custom-block-title">NOTA</p><p>Novo no Laravel? Confira o <a href="https://bootcamp.laravel.com" target="_blank" rel="noreferrer">Laravel Bootcamp</a> para um tour prático da estrutura enquanto orientamos você na construção de seu primeiro aplicativo Laravel.</p></div><h2 id="o-diretorio-principal" tabindex="-1">O Diretório Principal <a class="header-anchor" href="#o-diretorio-principal" aria-label="Permalink to &quot;O Diretório Principal&quot;">​</a></h2><h4 id="o-directorio-de-app" tabindex="-1">O Directório de App <a class="header-anchor" href="#o-directorio-de-app" aria-label="Permalink to &quot;O Directório de App&quot;">​</a></h4><p>O diretório <code>app</code> contém o código central do seu aplicativo e em breve exploraremos este diretório com mais detalhe. No entanto, quase todas as classes na sua aplicação serão neste diretório.</p><h4 id="o-diretorio-do-bootstrap" tabindex="-1">O diretório do Bootstrap <a class="header-anchor" href="#o-diretorio-do-bootstrap" aria-label="Permalink to &quot;O diretório do Bootstrap&quot;">​</a></h4><p>O diretório <code>bootstrap</code> contém o arquivo <code>app.php</code>, que inicializa o framework. Esse diretório também abriga um diretório <code>cache</code> que armazena arquivos gerados pelo framework para otimização de desempenho, como os arquivos de cache, de rotas e serviços.</p><h4 id="diretorio-de-configuracoes" tabindex="-1">Diretório de Configurações <a class="header-anchor" href="#diretorio-de-configuracoes" aria-label="Permalink to &quot;Diretório de Configurações&quot;">​</a></h4><p>O diretório &quot;config&quot;, como o nome sugere, contém todos os ficheiros de configuração da sua aplicação. É uma boa ideia ler atentamente todos estes ficheiros e familiarizar-se com todas as opções disponíveis.</p><h4 id="diretorio-da-base-de-dados" tabindex="-1">Diretório da Base de Dados <a class="header-anchor" href="#diretorio-da-base-de-dados" aria-label="Permalink to &quot;Diretório da Base de Dados&quot;">​</a></h4><p>O diretório “database” contém as migrações do banco de dados, factories e seeds do modelo. Se você desejar, pode também usar este diretório para conter um banco de dados SQLite.</p><h4 id="o-diretorio-publico" tabindex="-1">O diretório Público <a class="header-anchor" href="#o-diretorio-publico" aria-label="Permalink to &quot;O diretório Público&quot;">​</a></h4><p>O diretório &quot;public&quot; contém o arquivo &quot;index.php&quot;, que é o ponto de entrada para todas as solicitações e configura o carregamento automático. Este diretório também armazena seus arquivos estáticos, como imagens, JavaScript e CSS.</p><h4 id="o-diretorio-de-recursos" tabindex="-1">O Diretório de Recursos <a class="header-anchor" href="#o-diretorio-de-recursos" aria-label="Permalink to &quot;O Diretório de Recursos&quot;">​</a></h4><p>A pasta <code>resources</code> contém suas <a href="/docs/views.html">visualizações</a> assim como seus assets brutos não compilados, como o CSS ou o JavaScript.</p><h4 id="diretorio-de-rotas" tabindex="-1">Diretório de Rotas <a class="header-anchor" href="#diretorio-de-rotas" aria-label="Permalink to &quot;Diretório de Rotas&quot;">​</a></h4><p>O diretório &quot;routes&quot; contém todas as definições de rotas para o seu aplicativo. Por padrão, os dois arquivos de rotas incluídos na estrutura do Laravel são &quot;web.php&quot; e &quot;console.php&quot;.</p><p>O arquivo <code>web.php</code> contém rotas que o Laravel coloca no grupo de middlewares <code>web</code>, que fornece estado de sessão, proteção contra CSRF (Cross-Site Request Forgery) e criptografia de cookies. Se a sua aplicação não oferecer uma API estateless ou RESTful, então todas as suas rotas provavelmente serão definidas no arquivo <code>web.php</code>.</p><p>O arquivo <code>console.php</code> é onde você pode definir todos os comandos de console baseados em fechamentos. Cada fecho está vinculado a uma instância do comando, permitindo um método simples para interagir com os métodos IO de cada comando. Apesar deste arquivo não definir rotas HTTP, ele define pontos de entrada (rotas) da sua aplicação baseados em console. Você também pode agendar tarefas no arquivo <code>console.php</code>.</p><p>Opcionalmente, você poderá instalar arquivos de rotas adicionais para as rotas da API (api.php) e canais de transmissão (<code>channels.php</code>), através dos comandos do Artisan <code>install:api</code> e <code>install:broadcasting</code>.</p><p>O arquivo <code>api.php</code> contém rotas que são intencionalmente sem estado, então as requisições que entram na aplicação por meio dessas rotas serão autenticadas (via tokens) e não terão acesso ao estado da sessão.</p><p>O arquivo <code>channels.php</code> é onde você pode registrar todos os canais de transmissão de eventos que seu aplicativo suporta.</p><h4 id="o-diretorio-de-armazenamento" tabindex="-1">O diretório de Armazenamento <a class="header-anchor" href="#o-diretorio-de-armazenamento" aria-label="Permalink to &quot;O diretório de Armazenamento&quot;">​</a></h4><p>O diretório storage contém os registos, templates Blade compilados, sessões baseadas em ficheiros, caches de ficheiros e outros ficheiros gerados pelo framework. Este diretório está agrupado nos diretórios <code>app</code>, <code>framework</code> e <code>logs</code>. Pode ser utilizado o diretório app para armazenar quaisquer ficheiros gerados pela aplicação. O diretório <code>framework</code> é utilizado para armazenar os ficheiros gerados pelo framework e caches. Por último, o diretório <code>logs</code> contém os ficheiros de registro da aplicação.</p><p>O diretório <code>storage/app/public</code> poderá ser utilizado para armazenar arquivos gerados pelo usuário, como avatares de perfil, que devem ser acessíveis publicamente. Crie um link simbólico no diretório <code>public/storage</code>, que aponta para este diretório. Você pode criar o link utilizando o comando Artisan <code>php artisan storage:link</code>.</p><h4 id="o-diretorio-de-teste" tabindex="-1">O Diretório de Teste <a class="header-anchor" href="#o-diretorio-de-teste" aria-label="Permalink to &quot;O Diretório de Teste&quot;">​</a></h4><p>O diretório <code>tests</code> contém seus testes automatizados. Testes unitários <a href="https://pestphp.com" target="_blank" rel="noreferrer">Pest</a> ou <a href="https://phpunit.de/" target="_blank" rel="noreferrer">PHPUnit</a> de exemplo e testes de funcionalidade são fornecidos por padrão. Cada classe de teste deve ser terminada com a palavra &quot;Test&quot;. Você pode executar seus testes usando os comandos <code>/vendor/bin/pest</code> ou <code>/vendor/bin/phpunit</code>. Ou, se desejar uma representação mais detalhada e bonita dos resultados do seu teste, você pode usar o comando Artisan <code>php artisan test</code>.</p><h4 id="diretorio-de-fornecedores" tabindex="-1">Diretório de Fornecedores <a class="header-anchor" href="#diretorio-de-fornecedores" aria-label="Permalink to &quot;Diretório de Fornecedores&quot;">​</a></h4><p>O diretório <code>vendor</code> contém as suas dependências do <a href="https://getcomposer.org" target="_blank" rel="noreferrer">Composer</a>.</p><h2 id="o-diretorio-de-aplicacao" tabindex="-1">O diretório de Aplicação <a class="header-anchor" href="#o-diretorio-de-aplicacao" aria-label="Permalink to &quot;O diretório de Aplicação&quot;">​</a></h2><p>A maior parte do seu aplicativo está no diretório <code>app</code>. Por padrão, esse diretório é organizado em um namespace sob o nome <code>App</code> e será automaticamente carregado pelo Composer usando o <a href="https://www.php-fig.org/psr/psr-4/" target="_blank" rel="noreferrer">padrão de autoloading PSR-4</a>.</p><p>Por padrão, o diretório <code>app</code> contém os diretórios <code>Http</code>, <code>Models</code> e <code>Providers</code>. No entanto, com o tempo, uma variedade de outros diretórios será gerada dentro do diretório app à medida que você usa os comandos Artisan para gerar classes. Por exemplo, o diretório <code>app/Console</code> não existirá até a execução do comando <code>make:command</code> do Artisan para gerar uma classe de comando.</p><p>Ambas os diretórios <code>Console</code> e <code>Http</code> são explicadas nas respectivas seções abaixo, mas considere o <code>Console</code> e o <code>Http</code> como uma API para o núcleo de seu aplicativo. O protocolo HTTP e o CLI fornecem ambos mecanismos para interagir com seu aplicativo, mas não contêm lógica do aplicativo. Em outras palavras, são dois modos de emitir comandos ao seu aplicativo. O diretório <code>Console</code> contém todos os seus comandos Artisan, enquanto o diretório <code>Http</code> contém seus controladores, middleware e requisições.</p><div class="info custom-block"><p class="custom-block-title">AVISO</p><p>Muitas das classes localizadas na pasta <code>app</code> podem ser geradas pelo Artisan por meio de comandos. Para verificar os comandos disponíveis, execute o comando <code>php artisan list make</code> em seu terminal.</p></div><h4 id="o-diretorio-de-broadcasting" tabindex="-1">O Diretório de Broadcasting <a class="header-anchor" href="#o-diretorio-de-broadcasting" aria-label="Permalink to &quot;O Diretório de Broadcasting&quot;">​</a></h4><p>O diretório <code>Broadcasting</code> contém todas as classes de canal de transmissão da sua aplicação. Estas classes são geradas com o comando <code>make:channel</code>. Normalmente, este diretório não existe mas é criado quando cria o seu primeiro canal. Para obter mais informações sobre canais, consulte a documentação do <a href="/docs/broadcasting.html">Broadcasting</a>.</p><h4 id="o-diretorio-de-console" tabindex="-1">O diretório de Console <a class="header-anchor" href="#o-diretorio-de-console" aria-label="Permalink to &quot;O diretório de Console&quot;">​</a></h4><p>O diretório <code>Console</code> contém todos os comandos personalizados do Artisan para a sua aplicação. Estes comandos podem ser gerados usando o comando <code>make:command</code>.</p><h4 id="diretorio-de-eventos" tabindex="-1">Diretório de Eventos <a class="header-anchor" href="#diretorio-de-eventos" aria-label="Permalink to &quot;Diretório de Eventos&quot;">​</a></h4><p>Este diretório não existe por padrão, mas é criado para você pelos comandos <code>event:generate</code> e <code>make:event</code>. O diretório <code>Events</code> abriga <a href="/docs/events.html">classes de eventos</a>. Os eventos podem ser usados para alertar outras partes da sua aplicação sobre a ocorrência de uma determinada ação, proporcionando bastante flexibilidade e desacoplamento.</p><h4 id="diretorio-de-excecoes" tabindex="-1">Diretório de Exceções <a class="header-anchor" href="#diretorio-de-excecoes" aria-label="Permalink to &quot;Diretório de Exceções&quot;">​</a></h4><p>O diretório <code>Exceptions</code> contém todas as exceções personalizadas da aplicação. As exceções podem ser geradas utilizando o comando <code>make:exception</code>.</p><h4 id="o-diretorio-http" tabindex="-1">O Diretório HTTP <a class="header-anchor" href="#o-diretorio-http" aria-label="Permalink to &quot;O Diretório HTTP&quot;">​</a></h4><p>O diretório <code>Http</code> contém os controladores, middlewares e requisições de formulários. Quase toda a lógica para lidar com as entradas da aplicação será colocada nesse diretório.</p><h4 id="o-diretorio-de-trabalhos" tabindex="-1">O Diretório de Trabalhos <a class="header-anchor" href="#o-diretorio-de-trabalhos" aria-label="Permalink to &quot;O Diretório de Trabalhos&quot;">​</a></h4><p>Este diretório não existe por padrão, mas será criado para si se executar o comando do Artisan <code>make:job</code>. O diretório <code>Jobs</code> armazena os <a href="/docs/queues.html">trabalhos que podem ser agendados</a> da sua aplicação. Os trabalhos podem ser agendados pela sua aplicação ou executados sincrónicamente no ciclo de vida do pedido atual. Os trabalhos que são executados durante o ciclo de vida do pedido atual, por vezes, são referidos como &quot;commands&quot;, uma vez que implementam o padrão <a href="https://en.wikipedia.org/wiki/Command_pattern" target="_blank" rel="noreferrer">Command</a>.</p><h4 id="o-diretorio-de-ouvintes" tabindex="-1">O diretório de Ouvintes <a class="header-anchor" href="#o-diretorio-de-ouvintes" aria-label="Permalink to &quot;O diretório de Ouvintes&quot;">​</a></h4><p>Este diretório não existe por padrão, mas será criado para você ao executar os comandos de Artisan <code>event:generate</code> ou <code>make:listener</code>. O diretório <code>Listeners</code> contém as classes que controlam seus <a href="/docs/events.html">eventos</a>. Os eventos recebem uma instância do evento e executam a lógica em resposta ao evento sendo disparado. Por exemplo, um evento <code>UserRegistered</code> pode ser controlado por um ouvinte <code>SendWelcomeEmail</code>.</p><h4 id="o-diretorio-de-e-mails" tabindex="-1">O diretório de E-mails <a class="header-anchor" href="#o-diretorio-de-e-mails" aria-label="Permalink to &quot;O diretório de E-mails&quot;">​</a></h4><p>O diretório não existe por padrão, mas ele será criado para você ao executar o comando Artisan <code>make:mail</code>. O diretório <code>Mail</code> contém todas as suas <a href="/docs/mail.html">classes que representam emails</a> enviados pelo seu aplicativo. Os objetos de <code>Mail</code> permitem encapsular toda a lógica de construção de um email em uma única simples classe, que pode ser enviada usando o método <code>Mail::send</code>.</p><h4 id="o-diretorio-de-modelos" tabindex="-1">O Diretório de Modelos <a class="header-anchor" href="#o-diretorio-de-modelos" aria-label="Permalink to &quot;O Diretório de Modelos&quot;">​</a></h4><p>A pasta <code>Models</code> contém todas as suas classes de modelo <a href="/docs/eloquent.html">Eloquent</a>. O ORM incluído no Laravel é uma implementação do ActiveRecord simples e bonita para trabalhar com seu banco de dados. Cada tabela do banco de dados tem um correspondente &quot;Model&quot; que é usado para interagir com essa tabela. Os modelos permitem consultar os dados nas suas tabelas, bem como inserir novos registros na tabela.</p><h4 id="o-diretorio-de-notificacoes" tabindex="-1">O Diretório de Notificações <a class="header-anchor" href="#o-diretorio-de-notificacoes" aria-label="Permalink to &quot;O Diretório de Notificações&quot;">​</a></h4><p>Este diretório não existe por padrão, mas é criado se você executar o comando Artisan <code>make:notification</code>. O diretório <code>Notifications</code> contém todas as notificações &quot;transacionais&quot; <a href="/docs/notificaciones.html">notificação</a> que são enviadas pelo seu aplicativo, como por exemplo: notificações sobre eventos que ocorrem dentro do seu aplicativo. A funcionalidade de notificações do Laravel abstrai o envio de notificações através de vários drivers, tais como e-mail, Slack, mensagens de texto ou armazenamento em um banco de dados.</p><h4 id="o-diretorio-de-politicas" tabindex="-1">O diretório de Políticas <a class="header-anchor" href="#o-diretorio-de-politicas" aria-label="Permalink to &quot;O diretório de Políticas&quot;">​</a></h4><p>Este diretório não existe por padrão, mas será criado para você se executar o comando <code>make:policy</code> do Artisan. O diretório <code>Policies</code> contém as <a href="/docs/authorization.html">classes de políticas de autorização</a> para sua aplicação. As políticas são usadas para determinar se um usuário pode executar uma determinada ação contra um recurso.</p><h4 id="diretorio-de-provedores" tabindex="-1">Diretório de Provedores <a class="header-anchor" href="#diretorio-de-provedores" aria-label="Permalink to &quot;Diretório de Provedores&quot;">​</a></h4><p>O diretório <code>Providers</code> contém todos os <a href="/docs/providers.html">provedores de serviço</a> para o aplicativo. Os provedores de serviços inicializam o seu aplicativo vinculando serviços ao container de serviços, registrando eventos ou realizando outras tarefas para preparar o seu aplicativo para pedidos recebidos.</p><p>Em um aplicativo Laravel novo, este diretório já contém o <code>AppServiceProvider</code>. Você pode adicionar seus próprios provedores a esse diretório conforme necessário.</p><h4 id="diretorio-de-regras" tabindex="-1">Diretório de Regras <a class="header-anchor" href="#diretorio-de-regras" aria-label="Permalink to &quot;Diretório de Regras&quot;">​</a></h4><p>Este diretório não existe por padrão, mas será criado para você se executar o comando <code>make:rule</code> do Artisan. O diretório <code>Rules</code> contém os objetos de regras personalizadas para a sua aplicação. As regras servem para encapsular lógicas complicadas de validação em um simples objeto. Para mais informações, consulte a <a href="/docs/validation.html">documentação sobre validação</a>.</p>',63),s=[d];function t(c,n,p,l,m,u){return a(),o("div",null,s)}const b=e(i,[["render",t]]);export{v as __pageData,b as default};
