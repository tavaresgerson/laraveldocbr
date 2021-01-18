# Estrutura de Diretório

## Introdução
A estrutura padrão do aplicativo Laravel tem como objetivo fornecer um ótimo ponto de partida para aplicativos grandes e pequenos. 
Mas você é livre para organizar seu aplicativo como quiser. O Laravel quase não impõe restrições sobre onde qualquer classe está 
localizada - desde que o Composer possa carregar automaticamente a classe.

## O diretório raiz

### O diretório App
O diretório `app` contém o código principal de seu aplicativo. Exploraremos esse diretório com mais detalhes em breve; entretanto, 
quase todas as classes em seu aplicativo estarão neste diretório.

### O diretório `bootstrap`
O diretório `bootstrap` contém o arquivo `app.php` que inicializa a estrutura. Esse diretório também contém um diretório `cache` que 
possui arquivos gerados pela estrutura para otimização de desempenho, como a rota e os arquivos de cache de serviços. Normalmente 
você não precisa modificar nenhum arquivo neste diretório.

### O diretório de configuração
O diretório `config` como o nome indica, contém todos os arquivos de configuração do seu aplicativo. É uma ótima ideia ler todos esses 
arquivos e se familiarizar com todas as opções disponíveis.

### O diretório do banco de dados
O diretório `database` contém suas migrações de banco de dados, fábricas de modelo e sementes. Se desejar, você também pode usar este diretório 
para armazenar um banco de dados SQLite.

### O diretório público
O diretório `public` contém o arquivo `index.php`, que é o ponto de entrada para todas as solicitações que entram em seu aplicativo e configura o 
carregamento automático. Este diretório também hospeda seus assets, como imagens, JavaScript e CSS.

### O diretório de recursos
O diretório `resources` contém suas visualizações bem como seus recursos brutos e não compilados, por exemplo CSS ou JavaScript. Este diretório 
também possui todos os seus arquivos de idioma.

### O diretório de rotas
O diretório `routes` contém todas as definições de rota para seu aplicativo. Por padrão, vários arquivos de rota são incluídos com Laravel: `web.php`, 
`api.php`, `console.php` e `channels.php`.

O arquivo `web.php` contém rotas que são `RouteServiceProvider` colocadas no grupo `web` de middlewares, que fornece estado de sessão, proteção CSRF e 
criptografia de cookie. Se seu aplicativo não oferece uma API RESTful sem estado, então é provável que todas as suas rotas sejam definidas no 
arquivo `web.php`.

O arquivo `api.php` contém as rotas que os `RouteServiceProvider` colocam no grupo `api` de middlewares. Essas rotas devem ser sem estado 
portanto, as solicitações que entram no aplicativo por meio dessas rotas devem ser autenticadas por meio de tokens e não terão acesso ao 
estado da sessão.

O arquivo `console.php` é onde você pode definir todos os seus comandos de console baseados em encerramento. Cada fechamento é vinculado a 
uma instância de comando, permitindo uma abordagem simples para interagir com os métodos de E/S de cada comando. Mesmo que este arquivo não 
defina rotas HTTP, ele define pontos de entrada (rotas) baseados no console em seu aplicativo.

O arquivo `channels.php` é onde você pode registrar todos os canais de transmissão de eventos que seu aplicativo suporta.

### O diretório de armazenamento
O diretório `storage` contém seus logs, modelos Blade compilados, sessões baseadas em arquivo, caches de arquivo e outros arquivos 
gerados pela estrutura. Este diretório é segregado dos diretórios `app`, `framework` e `logs`. O diretório `app` pode ser usado para 
armazenar quaisquer arquivos gerados por seu aplicativo. O diretório `framework` é usado para armazenar arquivos e caches gerados pelo 
framework. Finalmente, o diretório `logs` contém os arquivos de log do seu aplicativo.

O diretório `storage/app/public` pode ser usado para armazenar arquivos gerados pelo usuário, como avatares de perfis, que devem ser 
acessíveis ao público. Você deve criar um link simbólico em `public/storage` no qual aponta para este diretório. Você pode criar o 
link usando o comando Artisan `php artisan storage:link`.

### O diretório de testes
O diretório `tests` contém seus testes automatizados. Testes de unidade e testes de recursos do PHPUnit de exemplo são fornecidos prontos 
para uso. Cada classe de teste deve ser sufixada com a palavra `Test`. Você pode executar seus testes usando os comandos `phpunit` ou 
`php vendor/bin/phpunit` ou se desejar uma representação mais detalhada e bonita dos resultados do seu teste, você pode executar seus 
testes usando o comando Artisan `php artisan test`.

### O diretório de fornecedores
O diretório `vendor` contém suas dependências do Composer.

## O Diretório App

A maior parte do seu aplicativo está alojado no diretório `app`. Por padrão, este diretório tem o namespaces `App` e é carregado automaticamente 
pelo Composer usando o [padrão de carregamento automático PSR-4](https://www.php-fig.org/psr/psr-4/).

O diretório `app` contém uma variedade de diretórios adicionais, tais como `Console`, `Http`, e `Providers`. Pense nos diretórios `Console` e 
`Http` como fornecendo uma API no núcleo do seu aplicativo. O protocolo HTTP e a CLI são mecanismos para interagir com seu aplicativo, mas não 
contêm realmente a lógica do aplicativo. Em outras palavras, são duas maneiras de emitir comandos para seu aplicativo. O diretório `Console` contém 
todos os seus comandos Artisan, enquanto o diretório `Http` contém seus controladores, middleware e solicitações.

Uma variedade de outros diretórios serão gerados dentro do diretório `app` conforme você usa os comandos `make` do Artisan para gerar classes. 
Assim por exemplo, o diretório `app/Jobs` não existirá até que você execute o comando `make:job` do Artisan para gerar uma classe de trabalho.

> Muitas das classes do diretório `app` podem ser geradas pelo Artisan por meio de comandos. Para revisar os comandos disponíveis, execute o comando
> em seu terminal `php artisan list make`.

### O diretório Broadcasting
O diretório `Broadcasting` contém todas as classes para canal de transmissão em seu aplicativo. Essas classes são geradas usando o comando
`make:channel`. Este diretório não existe por padrão, mas será criado para você quando você criar seu primeiro canal. Para saber mais sobre 
os canais, verifique a documentação sobre transmissão de eventos.

### O diretório do Console
O diretório `Console` contém todos os comandos personalizados do Artisan para o seu aplicativo. Esses comandos podem ser gerados usando o 
comando `make:command`. Este diretório também abriga o kernel do console, que é onde seus comandos Artisan personalizados são registrados e 
suas tarefas agendadas são definidas.

### O diretório de Eventos
Este diretório não existe por padrão, mas será criado para você pelos comandos Artisan `event:generate` e `make:event`. O diretório `Events` 
abriga classes de eventos. Os eventos podem ser usados para alertar outras partes do seu aplicativo de que uma determinada ação ocorreu, 
fornecendo uma grande flexibilidade e desacoplamento.

### O diretório de Exceções
O diretório `Exceptions` contém o manipulador de exceções do seu aplicativo e também é um bom lugar para colocar quaisquer exceções lançadas 
pelo seu aplicativo. Se desejar personalizar como suas exceções são registradas ou renderizadas, você deve modificar a classe `Handler` neste diretório.

### O diretório Http
O diretório `Http` contém seus controladores, middleware e solicitações de formulário. Quase toda a lógica para lidar com as solicitações que 
entram em seu aplicativo será colocada neste diretório.

### O diretório de Trabalhos
Este diretório não existe por padrão, mas será criado para você se você executar o comando Artisan `make:job`. O diretório `Jobs` abriga os trabalhos 
que podem ser enfileirados para seu aplicativo. Os trabalhos podem ser enfileirados por seu aplicativo ou executados de forma síncrona dentro do ciclo 
de vida da solicitação atual. Os trabalhos executados de forma síncrona durante a solicitação atual são, às vezes, chamados de "comandos", pois são 
uma implementação do padrão de comando.

### O diretório de Ouvintes
Este diretório não existe por padrão, mas será criado para você se executar os comandos Artisan `event:generate` ou `make:listener`. O diretório 
Listeners contém as classes que tratam de seus eventos. Os ouvintes de eventos recebem uma instância de evento e executam a lógica em resposta ao 
evento que está sendo disparado. Por exemplo, um evento `UserRegister` pode ser tratado por um ouvinte `SendWelcomeEmail`.

### O diretório de Emails
Este diretório não existe por padrão, mas será criado para você se você executar o comando Artisan `make:mail`. O diretório `Mail` contém todas as 
suas classes que representam e-mails enviados por seu aplicativo. Os objetos de email permitem que você encapsule toda a lógica de construção de um 
email em uma única classe simples que pode ser enviada usando o método `Mail::send`.

### O diretório de Modelos
O diretório `Models` contém todas as suas classes de modelo do Eloquent. O Eloquent ORM incluído no Laravel fornece uma implementação bonita e 
simples do ActiveRecord para trabalhar com seu banco de dados. Cada tabela de banco de dados possui um "Modelo" correspondente que é usado para 
interagir com essa tabela. Os modelos permitem consultar dados em suas tabelas, bem como inserir novos registros na tabela.

### O diretório de Notificações
Este diretório não existe por padrão, mas será criado para você se você executar o comando Artisan `make:notification`. O diretório `Notifications` 
contém todas as notificações "transacionais" que são enviadas por seu aplicativo, como notificações simples sobre eventos que acontecem em seu aplicativo. 
Os recursos de notificação do Laravel resumem o envio de notificações através de uma variedade de drivers, como e-mail, Slack, SMS, ou armazenados em um 
banco de dados.

### O Diretório de Políticas
Este diretório não existe por padrão, mas será criado para você se você executar o comando Artisan `make:policy`. O diretório `Policies` contém as 
classes de política de autorização para seu aplicativo. As políticas são usadas para determinar se um usuário pode executar uma determinada ação em um recurso.

### O Diretório de Provedores
O diretório `Providers` contém todos os provedores de serviço para seu aplicativo. Os provedores de serviço inicializam seu aplicativo ligando 
serviços no contêiner de serviço, registrando eventos ou executando qualquer outra tarefa para preparar seu aplicativo para solicitações de entrada.

Em uma nova aplicação Laravel, este diretório já conterá vários provedores. Você é livre para adicionar seus próprios provedores a este diretório, 
conforme necessário.

### O Diretório de Regras
Este diretório não existe por padrão, mas será criado para você se você executar o comando Artisan `make:rule`. O diretório `Rules` contém os objetos 
de regra de validação customizados para seu aplicativo. As regras são usadas para encapsular lógica de validação complicada em um objeto simples. Para 
mais informações, verifique a documentação de validação.
