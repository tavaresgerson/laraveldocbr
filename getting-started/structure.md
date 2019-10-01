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
v
