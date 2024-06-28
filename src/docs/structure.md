# Estrutura do diretório

<a name="introduction"></a>
## Introdução

 O layout padrão da estrutura do aplicativo Laravel destina-se a fornecer um excelente ponto de partida para aplicações tanto grandes quanto pequenas, mas você está livre para organizar sua aplicação como quiser. O Laravel impõe poucas restrições sobre o local onde uma determinada classe pode ser localizada - desde que o Composer possa carregá-la automaticamente.

 > [!NOTA]
 O curso básico do Laravel (https://bootcamp.laravel.com) permite uma exploração prática da estrutura enquanto guiamos você na construção de sua primeira aplicação Laravel.

<a name="the-root-directory"></a>
## O Diretório Principal

<a name="the-root-app-directory"></a>
#### O Directório de Aplicativos

 O diretório `app` contém o código central do seu aplicativo e em breve exploraremos este diretório com mais detalhe. No entanto, quase todas as classes na sua aplicação serão neste diretório.

<a name="the-bootstrap-directory"></a>
#### O diretório do Bootstrap

 O diretório `bootstrap` contém o arquivo `app.php`, que inicializa o framework. Esse diretório também abriga um diretório `cache` que armazena arquivos gerados pelo framework para otimização de desempenho, como os arquivos de cache de rotas e serviços.

<a name="the-config-directory"></a>
#### Diretório de configuração

 O diretório "config", como o nome sugere, contém todos os ficheiros de configuração da sua aplicação. É uma boa ideia ler atentamente todos estes ficheiros e familiarizar-se com todas as opções disponíveis.

<a name="the-database-directory"></a>
#### Diretório da Base de Dados

 O diretório “database” contém as migrações do banco de dados, fabricação e sementes do modelo. Se você desejar, pode também usar este diretório para conter um banco de dados SQLite.

<a name="the-public-directory"></a>
#### O diretório público

 O diretório "public" contém o arquivo "index.php", que é o ponto de entrada para todas as solicitações e configura o carregamento automático. Este diretório também armazena seus ativos, como imagens, JavaScript e CSS.

<a name="the-resources-directory"></a>
#### O Diretório de Recursos

 A pasta `resources` contém suas [visualizações] (/docs/views) assim como seus ativos brutos não compilados, como o CSS ou o JavaScript.

<a name="the-routes-directory"></a>
#### Diretório de rotas

 O diretório "routes" contém todas as definições de rotas para o seu aplicativo. Por defeito, os dois arquivos de rotas incluídos na estrutura do Laravel são "web.php" e "console.php".

 O arquivo `web.php` contém rotas que o Laravel coloca no grupo de middlewares `web`, que fornece estado de sessão, proteção contra CSRF (Cross-Site Request Forgery) e criptografia de cookies. Se a sua aplicação não oferecer uma API estateless ou RESTful, então todas as suas rotas provavelmente serão definidas no arquivo `web.php`.

 O arquivo `console.php` é onde você pode definir todos os comandos de console baseados em fechamentos. Cada fecho está vinculado a uma instância do comando, permitindo um método simples para interagir com os métodos IO de cada comando. Apesar deste arquivo não definir rotas HTTP, ele define pontos de entrada (rotas) da sua aplicação baseados em console. Você também pode agendar tarefas no arquivo `console.php`.

 Opcionalmente, você poderá instalar arquivos de rotas adicionais para as rotas da API (api.php) e canais de transmissão (`channels.php`), através dos comandos do Artisan `install:api` e `install:broadcasting`.

 O arquivo `api.php` contém rotas que são intencionalmente sem estado, então as requisições que entram na aplicação por meio dessas rotas serão autenticadas (via tokens) e não terão acesso ao estado da sessão.

 O arquivo `channels.php` é onde você pode registrar todos os canais de transmissão de eventos que seu aplicativo suporta.

<a name="the-storage-directory"></a>
#### O diretório de armazenamento

 O diretório storage contém os registos, templates compilados Blade, sessões baseadas em ficheiros, caches de ficheiros e outros ficheiros gerados pelo framework. Este diretório está agrupado nos diretórios app, framework e logs. Pode ser utilizado o diretório app para armazenar quaisquer ficheiros gerados pela aplicação. O diretório framework é utilizado para armazenar os ficheiros gerados pelo framework e caches. Por último, o diretório logs contém os ficheiros de registo da aplicação.

 O diretório `storage/app/public` poderá ser utilizado para armazenar arquivos gerados pelo usuário, como avatares de perfil, que devem ser acessíveis publicamente. Crie um link simbólico no diretório `public/storage`, que aponta para este diretório. Pode criar o link utilizando o comando Artisan `php artisan storage:link`.

<a name="the-tests-directory"></a>
#### O Diretório de Teste

 O diretório `tests` contém seus testes automatizados. Testes unitários [Pest](https://pestphp.com) ou [PHPUnit](https://phpunit.de/) de exemplo e testes de funcionalidade são fornecidos por padrão. Cada classe de teste deve ser terminada com a palavra "Test". Você pode executar seus testes usando os comandos `/vendor/bin/pest` ou `/vendor/bin/phpunit`. Ou, se desejar uma representação mais detalhada e bonita dos resultados do seu teste, você pode usar o comando Artisan `php artisan test`.

<a name="the-vendor-directory"></a>
#### Diretório de fornecedores

 O diretório `vendor` contém as suas dependências do [Composer](https://getcomposer.org).

<a name="the-app-directory"></a>
## O diretório de aplicações

 A maior parte do seu aplicativo está no diretório `app`. Por padrão, esse diretório é organizado em um namespace sob o nome `App` e será automaticamente carregado pelo Composer usando o [padrão de autoloading PSR-4](https://www.php-fig.org/psr/psr-4/).

 Por padrão, o diretório `app` contém os diretórios `Http`, `Models` e `Providers`. No entanto, com o tempo, uma variedade de outros diretórios será gerada dentro do diretório app à medida que você usa as ordens Artisan para gerar classes. Por exemplo, o diretório `app/Console` não existirá até a execução da ordem `make:command` do Artisan para gerar uma classe de comando.

 Ambas as diretorias `Console` e `Http` são explicadas adicionalmente nas respectivas seções abaixo, mas considere a `Console` e a `Http` como uma API para o núcleo de seu aplicativo. O protocolo HTTP e o CLI fornecem ambos mecanismos para interagir com seu aplicativo, mas não contêm lógica do aplicativo. Em outras palavras, são dois modos de emitir comandos ao seu aplicativo. A diretoria `Console` contém todos os seus comandos Artisan, enquanto a diretoria `Http` contém seus controladores, middleware e requisições.

 > [!AVISO]
 > Muitas das classes localizadas na pasta `app` podem ser geradas pelo Artisan por meio de comandos. Para verificar os comandos disponíveis, execute o comando `php artisan list make` em seu terminal.

<a name="the-broadcasting-directory"></a>
#### O Diretório de Emissoras

 O diretório "Broadcasting" contém todas as classes de canal de transmissão da sua aplicação. Estas classes são geradas com a ordem "make:channel". Normalmente, este diretório não existe mas é criado quando cria o seu primeiro canal. Para obter mais informações sobre canais, consulte a documentação do [transferência de eventos](/docs/broadcasting).

<a name="the-console-directory"></a>
#### O diretório da consola

 O diretório `Console` contém todos os comandos personalizados do Artisan para a sua aplicação. Estes comandos podem ser gerados usando o comando `make:command`.

<a name="the-events-directory"></a>
#### Diretório de Eventos

 Este diretório não existe por padrão, mas é criado para você pelos comandos `event:generate` e `make:event`. O diretório `Events` abriga [classes de evento](/docs/events). Os eventos podem ser usados para alertar outras partes da sua aplicação sobre a ocorrência de uma determinada ação, proporcionando bastante flexibilidade e desacoplamento.

<a name="the-exceptions-directory"></a>
#### Diretório de exceções

 O diretório `Exceptions` contém todas as exceções personalizadas da aplicação. As exceções podem ser geradas utilizando o comando `make:exception`.

<a name="the-http-directory"></a>
#### O Diretório HTTP

 O diretório `Http` contém os controladores, middlewares e requisições de formulários. Quase toda a lógica para lidar com as entradas da aplicação será colocada nesse diretório.

<a name="the-jobs-directory"></a>
#### O Diretório de Empregos

 Este diretório não existe por padrão, mas será criado para si se executar o comando do Artisan `make:job`. O diretório `Jobs` armazena os [trabalhos que podem ser agendados](/docs/queues) da sua aplicação. Os trabalhos podem ser agendados pela sua aplicação ou executados sincrónicamente no ciclo de vida do pedido atual. Os trabalhos que são executados sincrónicamente durante o ciclo de vida do pedido atual, por vezes, são referidos como "comandos", uma vez que implementam o padrão [Comando](https://en.wikipedia.org/wiki/Command_pattern).

<a name="the-listeners-directory"></a>
#### O diretório de ouvinte

 Este diretório não existe por defeito, mas será criado para você ao executar os comandos de Artisan `event:generate` ou `make:listener`. O diretório `Listeners` contém as classes que controlam seus [eventos](/docs/events). Os eventos recebem uma instância do evento e executam a lógica em resposta ao evento sendo disparado. Por exemplo, um evento `UserRegistered` pode ser controlado por um ouvinte `SendWelcomeEmail`.

<a name="the-mail-directory"></a>
#### O diretório de e-mails

 O diretório não existe por padrão, mas ele será criado para você ao executar o comando Artisan `make:mail`. O diretório `Mail` contém todas as suas [classes que representam emails](/docs/mail) enviados pelo seu aplicativo. Os objetos de `Mail` permitem encapsular toda a lógica de construção de um email em uma única classe simples, que pode ser enviada usando o método `Mail::send`.

<a name="the-models-directory"></a>
#### O Diretório de Modelos

 A pasta `Models` contém todas as suas classes de modelo [Eloquent](/docs/eloquent). O ORM incluído no Laravel é uma implementação do ActiveRecord simples e bonita para trabalhar com seu banco de dados. Cada tabela do banco de dados tem um correspondente "Model" que é usado para interagir com essa tabela. Os modelos permitem consultar os dados nas suas tabelas, bem como inserir novos registros na tabela.

<a name="the-notifications-directory"></a>
#### O Diretório de notificações

 Este diretório não existe por padrão, mas é criado se você executar o comando Artisan `make:notification`. O diretório `Notifications` contém todas as notificações "transacionais" [notificação](/docs/notificaciones) que são enviadas pelo seu aplicativo, como por exemplo simples notificações sobre eventos que ocorrem dentro do seu aplicativo. A funcionalidade de notificações do Laravel abstrai o envio de notificações através de vários drivers, tais como e-mail, Slack, mensagens de texto ou armazenamento em um banco de dados.

<a name="the-policies-directory"></a>
#### O diretório de políticas

 Este diretório não existe por padrão, mas será criado para você se executar o comando `make:policy` do Artisan. O diretório `Policies` contém as [classes de políticas de autorização](/docs/authorization) para sua aplicação. As políticas são usadas para determinar se um usuário pode executar uma determinada ação contra um recurso.

<a name="the-providers-directory"></a>
#### Diretório de Provedores

 O diretório `Providers` contém todos os [provedores de serviço](/docs/providers) para o aplicativo. Os provedores de serviços inicializam o seu aplicativo vinculando serviços ao container de serviços, registando eventos ou realizando outras tarefas para preparar o seu aplicativo para pedidos recebidos.

 Em um aplicativo Laravel novo, este diretório já contém o `AppServiceProvider`. Você pode adicionar seus próprios provedores a esse diretório conforme necessário.

<a name="the-rules-directory"></a>
#### Diretório de regras

 Este diretório não existe por padrão, mas será criado para si se executar o comando "make:rule" da Artiest. O diretório "Rules" contém os objetos de regras personalizadas para a sua aplicação. As regras servem para encapsular lógicas complicadas de validação em um simples objeto. Para mais informações, consulte a [documentação sobre validação](/docs/validation).
