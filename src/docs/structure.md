# Estrutura do diretório

## Introdução

O layout padrão da estrutura do aplicativo Laravel destina-se a fornecer um excelente ponto de partida para aplicações tanto grandes quanto pequenas, mas você está livre para organizar sua aplicação como quiser. O Laravel impõe poucas restrições sobre o local onde uma determinada classe pode ser localizada - desde que o Composer possa carregá-la automaticamente.

::: info NOTA
Novo no Laravel? Confira o [Laravel Bootcamp](https://bootcamp.laravel.com) para um tour prático da estrutura enquanto orientamos você na construção de seu primeiro aplicativo Laravel.
:::

## O Diretório Principal

#### O Directório de App

O diretório `app` contém o código central do seu aplicativo e em breve exploraremos este diretório com mais detalhe. No entanto, quase todas as classes na sua aplicação serão neste diretório.

#### O diretório do Bootstrap

O diretório `bootstrap` contém o arquivo `app.php`, que inicializa o framework. Esse diretório também abriga um diretório `cache` que armazena arquivos gerados pelo framework para otimização de desempenho, como os arquivos de cache, de rotas e serviços.

#### Diretório de Configurações

O diretório "config", como o nome sugere, contém todos os ficheiros de configuração da sua aplicação. É uma boa ideia ler atentamente todos estes ficheiros e familiarizar-se com todas as opções disponíveis.

#### Diretório da Base de Dados

O diretório “database” contém as migrações do banco de dados, factories e seeds do modelo. Se você desejar, pode também usar este diretório para conter um banco de dados SQLite.

#### O diretório Público

O diretório "public" contém o arquivo "index.php", que é o ponto de entrada para todas as solicitações e configura o carregamento automático. Este diretório também armazena seus arquivos estáticos, como imagens, JavaScript e CSS.

#### O Diretório de Recursos

A pasta `resources` contém suas [visualizações](/docs/views) assim como seus assets brutos não compilados, como o CSS ou o JavaScript.

#### Diretório de Rotas

O diretório "routes" contém todas as definições de rotas para o seu aplicativo. Por padrão, os dois arquivos de rotas incluídos na estrutura do Laravel são "web.php" e "console.php".

O arquivo `web.php` contém rotas que o Laravel coloca no grupo de middlewares `web`, que fornece estado de sessão, proteção contra CSRF (Cross-Site Request Forgery) e criptografia de cookies. Se a sua aplicação não oferecer uma API estateless ou RESTful, então todas as suas rotas provavelmente serão definidas no arquivo `web.php`.

O arquivo `console.php` é onde você pode definir todos os comandos de console baseados em fechamentos. Cada fecho está vinculado a uma instância do comando, permitindo um método simples para interagir com os métodos IO de cada comando. Apesar deste arquivo não definir rotas HTTP, ele define pontos de entrada (rotas) da sua aplicação baseados em console. Você também pode agendar tarefas no arquivo `console.php`.

Opcionalmente, você poderá instalar arquivos de rotas adicionais para as rotas da API (api.php) e canais de transmissão (`channels.php`), através dos comandos do Artisan `install:api` e `install:broadcasting`.

O arquivo `api.php` contém rotas que são intencionalmente sem estado, então as requisições que entram na aplicação por meio dessas rotas serão autenticadas (via tokens) e não terão acesso ao estado da sessão.

O arquivo `channels.php` é onde você pode registrar todos os canais de transmissão de eventos que seu aplicativo suporta.

#### O diretório de Armazenamento

O diretório storage contém os registos, templates Blade compilados, sessões baseadas em ficheiros, caches de ficheiros e outros ficheiros gerados pelo framework. Este diretório está agrupado nos diretórios `app`, `framework` e `logs`. Pode ser utilizado o diretório app para armazenar quaisquer ficheiros gerados pela aplicação. O diretório `framework` é utilizado para armazenar os ficheiros gerados pelo framework e caches. Por último, o diretório `logs` contém os ficheiros de registro da aplicação.

O diretório `storage/app/public` poderá ser utilizado para armazenar arquivos gerados pelo usuário, como avatares de perfil, que devem ser acessíveis publicamente. Crie um link simbólico no diretório `public/storage`, que aponta para este diretório. Você pode criar o link utilizando o comando Artisan `php artisan storage:link`.

#### O Diretório de Teste

O diretório `tests` contém seus testes automatizados. Testes unitários [Pest](https://pestphp.com) ou [PHPUnit](https://phpunit.de/) de exemplo e testes de funcionalidade são fornecidos por padrão. Cada classe de teste deve ser terminada com a palavra "Test". Você pode executar seus testes usando os comandos `/vendor/bin/pest` ou `/vendor/bin/phpunit`. Ou, se desejar uma representação mais detalhada e bonita dos resultados do seu teste, você pode usar o comando Artisan `php artisan test`.

#### Diretório de Fornecedores

O diretório `vendor` contém as suas dependências do [Composer](https://getcomposer.org).

## O diretório de Aplicação

A maior parte do seu aplicativo está no diretório `app`. Por padrão, esse diretório é organizado em um namespace sob o nome `App` e será automaticamente carregado pelo Composer usando o [padrão de autoloading PSR-4](https://www.php-fig.org/psr/psr-4/).

Por padrão, o diretório `app` contém os diretórios `Http`, `Models` e `Providers`. No entanto, com o tempo, uma variedade de outros diretórios será gerada dentro do diretório app à medida que você usa os comandos Artisan para gerar classes. Por exemplo, o diretório `app/Console` não existirá até a execução do comando `make:command` do Artisan para gerar uma classe de comando.

Ambas os diretórios `Console` e `Http` são explicadas nas respectivas seções abaixo, mas considere o `Console` e o `Http` como uma API para o núcleo de seu aplicativo. O protocolo HTTP e o CLI fornecem ambos mecanismos para interagir com seu aplicativo, mas não contêm lógica do aplicativo. Em outras palavras, são dois modos de emitir comandos ao seu aplicativo. O diretório `Console` contém todos os seus comandos Artisan, enquanto o diretório `Http` contém seus controladores, middleware e requisições.

::: info AVISO
Muitas das classes localizadas na pasta `app` podem ser geradas pelo Artisan por meio de comandos. Para verificar os comandos disponíveis, execute o comando `php artisan list make` em seu terminal.
:::

#### O Diretório de Broadcasting

O diretório `Broadcasting` contém todas as classes de canal de transmissão da sua aplicação. Estas classes são geradas com o comando `make:channel`. Normalmente, este diretório não existe mas é criado quando cria o seu primeiro canal. Para obter mais informações sobre canais, consulte a documentação do [Broadcasting](/docs/broadcasting).

#### O diretório de Console

O diretório `Console` contém todos os comandos personalizados do Artisan para a sua aplicação. Estes comandos podem ser gerados usando o comando `make:command`.

#### Diretório de Eventos

Este diretório não existe por padrão, mas é criado para você pelos comandos `event:generate` e `make:event`. O diretório `Events` abriga [classes de eventos](/docs/events). Os eventos podem ser usados para alertar outras partes da sua aplicação sobre a ocorrência de uma determinada ação, proporcionando bastante flexibilidade e desacoplamento.

#### Diretório de Exceções

O diretório `Exceptions` contém todas as exceções personalizadas da aplicação. As exceções podem ser geradas utilizando o comando `make:exception`.

#### O Diretório HTTP

O diretório `Http` contém os controladores, middlewares e requisições de formulários. Quase toda a lógica para lidar com as entradas da aplicação será colocada nesse diretório.

#### O Diretório de Trabalhos

Este diretório não existe por padrão, mas será criado para si se executar o comando do Artisan `make:job`. O diretório `Jobs` armazena os [trabalhos que podem ser agendados](/docs/queues) da sua aplicação. Os trabalhos podem ser agendados pela sua aplicação ou executados sincrónicamente no ciclo de vida do pedido atual. Os trabalhos que são executados durante o ciclo de vida do pedido atual, por vezes, são referidos como "commands", uma vez que implementam o padrão [Command](https://en.wikipedia.org/wiki/Command_pattern).

#### O diretório de Ouvintes

Este diretório não existe por padrão, mas será criado para você ao executar os comandos de Artisan `event:generate` ou `make:listener`. O diretório `Listeners` contém as classes que controlam seus [eventos](/docs/events). Os eventos recebem uma instância do evento e executam a lógica em resposta ao evento sendo disparado. Por exemplo, um evento `UserRegistered` pode ser controlado por um ouvinte `SendWelcomeEmail`.

#### O diretório de E-mails

O diretório não existe por padrão, mas ele será criado para você ao executar o comando Artisan `make:mail`. O diretório `Mail` contém todas as suas [classes que representam emails](/docs/mail) enviados pelo seu aplicativo. Os objetos de `Mail` permitem encapsular toda a lógica de construção de um email em uma única simples classe, que pode ser enviada usando o método `Mail::send`.

#### O Diretório de Modelos

A pasta `Models` contém todas as suas classes de modelo [Eloquent](/docs/eloquent). O ORM incluído no Laravel é uma implementação do ActiveRecord simples e bonita para trabalhar com seu banco de dados. Cada tabela do banco de dados tem um correspondente "Model" que é usado para interagir com essa tabela. Os modelos permitem consultar os dados nas suas tabelas, bem como inserir novos registros na tabela.

#### O Diretório de Notificações

Este diretório não existe por padrão, mas é criado se você executar o comando Artisan `make:notification`. O diretório `Notifications` contém todas as notificações "transacionais" [notificação](/docs/notificaciones) que são enviadas pelo seu aplicativo, como por exemplo: notificações sobre eventos que ocorrem dentro do seu aplicativo. A funcionalidade de notificações do Laravel abstrai o envio de notificações através de vários drivers, tais como e-mail, Slack, mensagens de texto ou armazenamento em um banco de dados.

#### O diretório de Políticas

Este diretório não existe por padrão, mas será criado para você se executar o comando `make:policy` do Artisan. O diretório `Policies` contém as [classes de políticas de autorização](/docs/authorization) para sua aplicação. As políticas são usadas para determinar se um usuário pode executar uma determinada ação contra um recurso.

#### Diretório de Provedores

O diretório `Providers` contém todos os [provedores de serviço](/docs/providers) para o aplicativo. Os provedores de serviços inicializam o seu aplicativo vinculando serviços ao container de serviços, registrando eventos ou realizando outras tarefas para preparar o seu aplicativo para pedidos recebidos.

Em um aplicativo Laravel novo, este diretório já contém o `AppServiceProvider`. Você pode adicionar seus próprios provedores a esse diretório conforme necessário.

#### Diretório de Regras

Este diretório não existe por padrão, mas será criado para você se executar o comando `make:rule` do Artisan. O diretório `Rules` contém os objetos de regras personalizadas para a sua aplicação. As regras servem para encapsular lógicas complicadas de validação em um simples objeto. Para mais informações, consulte a [documentação sobre validação](/docs/validation).
