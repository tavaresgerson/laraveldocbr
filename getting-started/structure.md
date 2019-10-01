# Estrutura de pastas

## Introdução
A estrutura padrão de aplicativos do Laravel visa fornecer um excelente ponto de partida para aplicativos 
grandes e pequenos. Mas você é livre para organizar seu aplicativo da maneira que desejar. O Laravel não 
impõe quase nenhuma restrição sobre onde uma determinada classe está localizada - desde que o Composer 
possa carregar automaticamente a classe.

### Onde está o diretório de models?
Ao iniciar o Laravel, muitos desenvolvedores ficam confusos com a falta de um diretório de modelos. 
No entanto, a falta desse diretório é intencional. Achamos a palavra "models" ambígua, pois significa 
muitas coisas diferentes para muitas pessoas diferentes. Alguns desenvolvedores se referem ao "model" 
de um aplicativo como a totalidade de toda a sua lógica de negócios, enquanto outros se referem a "models" 
como classes que interagem com um banco de dados relacional.

Por esse motivo, optamos por colocar modelos Eloquent no diretório do aplicativo por padrão e permitimos 
que o desenvolvedor os coloque em outro lugar, se assim o desejar.

## O diretório raiz

### O diretório de aplicativos
O diretório do aplicativo contém o código principal do seu aplicativo. Exploraremos este diretório com mais 
detalhes em breve; no entanto, quase todas as classes no seu aplicativo estarão neste diretório.

### O Diretório de Bootstrap
O diretório de inicialização (`bootstrap`) contém o arquivo `app.php` que inicializa a estrutura. Esse diretório
também abriga um diretório de cache que contém arquivos gerados pela estrutura para otimização do 
desempenho, como os arquivos de cache de rota e de serviços.

### O diretório de configuração
O diretório `config`, como o nome indica, contém todos os arquivos de configuração do seu aplicativo. 
É uma ótima idéia ler todos esses arquivos e familiarizar-se com todas as opções disponíveis.

### O Diretório de Banco de Dados
O diretório `database` contém migrações, *model factory* e *seeds* do banco de dados. Se desejar, 
você também pode usar este diretório para armazenar um banco de dados SQLite.

### O Diretório Público
O diretório `public` contém o arquivo `index.php`, que é o ponto de entrada para todas as solicitações 
que entram no seu aplicativo e configura o carregamento automático. Esse diretório também abriga seus 
*assets*, como imagens, JavaScript e CSS.

### O Diretório de Recursos
O diretório `resources` contém suas visualizações, bem como ativos brutos, não compilados, como LESS, 
SASS ou JavaScript. Este diretório também abriga todos os seus arquivos de idioma.

### O diretório de rotas
O diretório de rotas contém todas as definições de rota para o seu aplicativo. Por padrão, 
vários arquivos de rota estão incluídos no Laravel: `web.php`, `api.php`, `console.php` e `channels.php`.

O arquivo `web.php` contém rotas que o `RouteServiceProvider` coloca no grupo de middleware da web, 
que fornece o estado da sessão, a proteção [CSRF](https://pt.wikipedia.org/wiki/Cross-site_request_forgery) 
e a criptografia de cookies. Se seu aplicativo. não oferecer uma API RESTful [stateless](https://pt.wikipedia.org/wiki/Protocolo_sem_estado), 
todas as suas rotas provavelmente serão definidas no arquivo `web.php`.

O arquivo `api.php` contém rotas que o `RouteServiceProvider` coloca no grupo de middleware da API, 
que fornece limitação de taxa. Essas rotas devem ser sem estado, portanto, as solicitações que 
entram no aplicativo por essas rotas devem ser autenticadas por tokens e não terão acesso ao estado da sessão.

O arquivo `console.php` é onde você pode definir todos os seus comandos do console baseados em Closure. 
Cada Closure está vinculado a uma instância de comando, permitindo uma abordagem simples para interagir 
com os métodos de E/S de cada comando. Mesmo que esse arquivo não defina rotas HTTP, ele define pontos 
de entrada (rotas) baseados no console em seu aplicativo.

O arquivo `channels.php` é onde você pode registrar todos os canais de transmissão de eventos que seu aplicativo suporta.

### O diretório de armazenamento
O diretório de armazenamento contém seus modelos de blade compilados, sessões baseadas em arquivo, 
caches de arquivo e outros arquivos gerados pela estrutura. Esse diretório é separado em `app`, `framework` e `logs`. 
O diretório `app` pode ser usado para armazenar todos os arquivos gerados pelo seu aplicativo. O diretório 
`framework` pode ser usado para armazenar arquivos e caches gerados pelo framework. Por fim, 
o diretório `logs` contém os arquivos de log do seu aplicativo.

O diretório `storage/app/public` pode ser usado para armazenar arquivos gerados pelo usuário, 
como avatares de perfil, que devem estar acessíveis ao público. Você deve criar um link 
simbólico em `public/storage` que aponte para esse diretório. Você pode criar o link 
usando o comando `php artisan storage:link`.

### O Diretório de Testes
O diretório `tests` contém seus testes automatizados. Um exemplo de teste é o [`PHPUnit`](https://phpunit.de/) 
e é fornecido imediatamente na instalação. Cada classe de teste deve ter o sufixo da 
palavra Teste. Você pode executar seus testes usando os comandos `phpunit` ou `php vendor/bin/phpunit`.

### O Diretório vendor
O diretório `vendor` contém suas dependências do Composer.

## O diretório App
A maioria do seu aplicativo está alojada no diretório do `app`. Por padrão, esse diretório está no namespace 
`App` e é carregado automaticamente pelo Composer usando o padrão de [carregamento automático PSR-4](https://www.php-fig.org/psr/psr-4/).

O diretório do aplicativo contém uma variedade de diretórios adicionais, como `Console`, `Http` e `Providers`. 
Pense nos diretórios `Console` e `Http` como fornecendo uma API no núcleo do seu aplicativo. O protocolo HTTP 
e a CLI são mecanismos para interagir com seu aplicativo, mas na verdade não contêm lógica de aplicativo. 
Em outras palavras, são duas maneiras de emitir comandos para o seu aplicativo. O diretório `Console` contém 
todos os seus comandos do `Artisan`, enquanto o diretório `Http` contém seus controladores, middleware e requests.

Uma variedade de outros diretórios será gerada dentro do diretório do aplicativo conforme você usa os comandos 
`make` do Artisan para gerar classes. Portanto, por exemplo, o diretório `app/Jobs` não existirá até você 
executar o comando do Artisan `make:job` para gerar uma classe de job.

> Muitas das classes no diretório do `app` podem ser geradas pelo Artisan por meio de comandos. 
> Para revisar os comandos disponíveis, execute o comando `php artisan list make` no seu terminal.

### O Diretório Broadcast
O diretório `broadcasting` contém todas as classes de canal de transmissão para seu aplicativo. 
Essas classes são geradas usando o comando `make:channel`. Esse diretório não existe por padrão, 
mas será criado para você quando você criar seu primeiro canal. Para saber mais sobre os canais, 
consulte a documentação sobre [transmissão de eventos](https://laravel.com/docs/5.8/broadcasting).

### O diretório Console
O diretório do console contém todos os comandos personalizados do Artisan para seu aplicativo. 
Esses comandos podem ser gerados usando o comando `make:command`. Esse diretório também abriga 
o `kernel` do console, onde são registrados os comandos personalizados do Artisan e definidas 
as [tarefas agendadas](https://laravel.com/docs/5.8/scheduling).

### O Diretório Events
Esse diretório não existe por padrão, mas será criado para você pelo Artisan com os comandos 
`event:generate` e `make:event`. O diretório Events abriga classes de eventos. Os eventos podem 
ser usados para alertar outras partes do seu aplicativo que uma determinada ação ocorreu, 
fornecendo uma grande flexibilidade e desacoplamento.

### O diretório de exceções
O diretório `Exceptions` contém o manipulador de exceções do aplicativo e também é um bom local 
para colocar as exceções lançadas pelo aplicativo. Se você deseja personalizar como suas exceções 
são registradas ou renderizadas, modifique a classe Handler neste diretório.

### O Diretório Http
O diretório `Http` contém seus controladores, middleware e requests de formulário. Quase 
toda a lógica para lidar com solicitações que entram no seu aplicativo será colocada neste diretório.

### O Diretório de Jobs
Esse diretório não existe por padrão, mas será criado se você executar o comando do Artisan `make:job`.
O diretório Jobs abriga os trabalhos na fila do seu aplicativo. Os trabalhos podem ser enfileirados pelo 
seu aplicativo ou executados de forma síncrona no ciclo de vida da solicitação atual. Às vezes, as tarefas 
executadas de forma síncrona durante a solicitação atual são chamadas de "comandos", pois são uma 
implementação do padrão de comando.

### O Diretório de `Listeners`
Esse diretório não existe por padrão, mas será criado se você executar o `event:generate` 
ou `make:listener` no Artisan. O diretório Listeners contém as classes que manipulam seus 
[eventos](https://laravel.com/docs/5.8/events). Os ouvintes de eventos recebem uma instância 
de evento e executam a lógica em resposta ao evento que está sendo disparado. Por exemplo, 
um evento `UserRegistered` pode ser tratado por um ouvinte `SendWelcomeEmail`.

### O Diretório de Email
Esse diretório não existe por padrão, mas será criado para você se você executar o comando no 
Artisan `make:mail`. O diretório Mail contém todas as suas classes que representam os emails 
enviados pelo seu aplicativo. Os objetos Mail permitem que você encapsule toda a lógica da 
criação de um email em uma classe única e simples que possa ser enviada usando o método Mail :: send.

### O diretório de notificações
Esse diretório não existe por padrão, mas será criado se você executar o comando 
Artisan `make:notification`. O diretório de Notificações contém todas as notificações 
"transacionais" enviadas pelo seu aplicativo, como notificações simples sobre eventos que 
ocorrem no seu aplicativo. A notificação do Laravel apresenta resumos enviando notificações 
através de uma variedade de drivers, como email, Slack, SMS ou armazenados em um banco de dados.

### O Diretório de Políticas
Esse diretório não existe por padrão, mas será criado para você se você executar o 
comando Artisan `make:policy`. O diretório `Policies` contém as classes de política de 
autorização para seu aplicativo. As políticas são usadas para determinar se um usuário 
pode executar uma determinada ação contra um recurso. Para mais informações, consulte 
a [documentação da autorização](https://laravel.com/docs/5.8/authorization).

### O Diretório de Fornecedores
O diretório `Providers` contém todos os provedores de serviços para seu aplicativo. Os provedores de 
serviços inicializam seu aplicativo vinculando serviços no contêiner de serviço, registrando eventos 
ou executando outras tarefas para preparar seu aplicativo para solicitações de entrada.

Em um novo aplicativo Laravel, esse diretório já conterá vários provedores. Você pode adicionar 
seus próprios provedores a esse diretório, conforme necessário.

### O diretório de regras
Esse diretório não existe por padrão, mas será criado executar o comando do Artisan 
`make:rule`. O diretório `Rules` contém os objetos de regra de validação personalizados 
para seu aplicativo. As regras são usadas para encapsular a lógica de validação complicada em 
um objeto simples. Para mais informações, consulte a [documentação de validação](https://laravel.com/docs/5.8/validation).
