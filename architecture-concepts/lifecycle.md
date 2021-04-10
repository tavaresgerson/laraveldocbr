# Ciclo de Requisições

## Introdução
Ao usar qualquer ferramenta no "mundo real", você se sentirá mais confiante se compreender como essa ferramenta funciona. Com o desenvolvimento de 
aplicativos não é diferente. Quando você entende como suas ferramentas de desenvolvimento funcionam, você se sente mais confortável e confiante em usá-las.

O objetivo deste documento é dar a você uma boa visão geral de como o framework Laravel funciona. Ao conhecer melhor a estrutura geral, tudo parece menos 
"mágico" e você terá mais confiança ao construir seus aplicativos. Se você não entender todos os termos imediatamente, não desanime! Tente obter uma 
compreensão básica do que está acontecendo e seu conhecimento aumentará à medida que você explorar outras seções da documentação.

## Visão geral do ciclo de vida

### Primeiros passos
O ponto de entrada para todas as solicitações para um aplicativo Laravel é o arquivo `public/index.php`. Todas as solicitações são direcionadas a este 
arquivo pela configuração do seu servidor web (Apache/Nginx). O arquivo `index.php` não contém muito código. Em vez disso, é um ponto de partida para 
carregar o resto da estrutura.

O arquivo `index.php` carrega a definição do autoloader gerada pelo Composer, e então recupera uma instância do aplicativo Laravel em `bootstrap/app.php`. 
A primeira ação realizada pelo próprio Laravel é criar uma instância do [container](https://laravel.com/docs/8.x/container) de aplicação/serviço.

### Kernels HTTP/Console
Em seguida, a solicitação de entrada é enviada para o kernel HTTP ou kernel do console, dependendo do tipo de solicitação que está entrando no aplicativo. 
Esses dois kernels servem como o local central por onde passam todas as solicitações. Por enquanto, vamos nos concentrar apenas no kernel HTTP, que está 
localizado em `app/Http/Kernel.php`.

O kernel HTTP estende a classe `Illuminate\Foundation\Http\Kernel`, que define um array de `bootstrappers` que será executado antes que a solicitação seja 
executada. Esses bootstrappers configuram o tratamento de erros, configuram o registro, detectam o ambiente do aplicativo e executam outras tarefas que 
precisam ser feitas antes que a solicitação seja realmente tratada. Normalmente, essas classes lidam com a configuração interna do Laravel com a qual você 
não precisa se preocupar.

O kernel HTTP também define uma lista de middleware HTTP pela qual todas as solicitações devem passar antes de serem tratadas pelo aplicativo. Esses middleware 
lidam com a leitura e gravação da sessão HTTP, determinando se o aplicativo está em modo de manutenção, verificando o token CSRF e muito mais. Falaremos mais 
sobre isso em breve.

A assinatura do método para o método `handle` do kernel HTTP é bastante simples: ele recebe a `Request` e retorna a `Response`. Pense no kernel como uma grande 
caixa preta que representa todo o seu aplicativo. Alimente-o com solicitações HTTP e ele retornará respostas HTTP.

### Provedores de Serviço
Uma das ações de inicialização do kernel mais importantes é carregar os provedores de serviço para seu aplicativo. Todos os provedores de serviço do aplicativo 
são configurados na matriz `providers` do arquivo `config/app.php` de configuração.

O Laravel irá iterar através desta lista de provedores e instanciar cada um deles. Depois de instanciar os provedores, o método `register` será chamado em todos 
os provedores. Então, uma vez que todos os provedores tenham sido registrados, o método `boot` será chamado em cada provedor.

Os provedores de serviços são responsáveis por inicializar todos os vários componentes da estrutura, como banco de dados, fila, validação e componentes de 
roteamento. Essencialmente, todos os principais recursos oferecidos pelo Laravel são inicializados e configurados por um provedor de serviços. Uma vez que 
eles inicializam e configuram muitos recursos oferecidos pelo framework, os provedores de serviços são o aspecto mais importante de todo o processo de 
inicialização do Laravel.

Você pode estar se perguntando por que o método `register` de cada provedor de serviços é chamado antes de chamar o método `boot` em qualquer provedor de serviços. 
A resposta é simples. Ao chamar o método `register` de cada provedor de serviço primeiro, os provedores de serviço podem depender de cada ligação de contêiner sendo 
registrada e disponível no momento em que o método `boot` é executado.

### Roteamento
Um dos provedores de serviços mais importantes em seu aplicativo é o `App\Providers\RouteServiceProvider`. Este provedor de serviços carrega os arquivos de rota 
contidos no diretório `routes` do seu aplicativo . Vá em frente, abra o arquivo `RouteServiceProvider` e veja como funciona!

Assim que o aplicativo for inicializado e todos os provedores de serviço forem registrados, o `Request` será entregue ao roteador para envio. O roteador enviará a 
solicitação para uma rota ou controlador, bem como executará qualquer middleware específico de rota.

O middleware fornece um mecanismo conveniente para filtrar ou examinar solicitações HTTP que entram em seu aplicativo. Por exemplo, o Laravel inclui um middleware 
que verifica se o usuário do seu aplicativo está autenticado. Se o usuário não estiver autenticado, o middleware redirecionará o usuário para a tela de login. No 
entanto, se o usuário for autenticado, o middleware permitirá que a solicitação prossiga no aplicativo. Alguns middleware são atribuídos a todas as rotas dentro do 
aplicativo, como aqueles definidos na propriedade `$middleware` do seu kernel HTTP, enquanto alguns são atribuídos apenas a rotas ou grupos de rotas específicos. 
Você pode aprender mais sobre middleware lendo a documentação completa do [middleware](https://laravel.com/docs/8.x/middleware).

Se a solicitação passar por todo o middleware atribuído à rota correspondida, a rota ou método do controlador será executado e a resposta retornada pela rota ou 
método do controlador será enviada de volta pela cadeia de middleware da rota.

### Finalizando
Uma vez que a rota ou o método do controlador retornam uma resposta, a resposta viajará de volta para fora através do middleware da rota, dando ao aplicativo a 
chance de modificar ou examinar a resposta de saída.

Finalmente, uma vez que a resposta viaja de volta pelo middleware, o método `handle` do kernel HTTP retorna o objeto de resposta e o arquivo `index.php` chama o 
método `send` na resposta retornada. O método `send` envia o conteúdo da resposta ao navegador da web do usuário. E assim terminamos nossa jornada por todo o ciclo de 
vida das solicitações do Laravel!

## Foco em Provedores de Serviços
Os provedores de serviços são realmente a chave para inicializar um aplicativo Laravel. A instância do aplicativo é criada, os provedores de serviço são registrados
e a solicitação é entregue ao aplicativo inicializado. É realmente simples!

Ter um bom conhecimento de como um aplicativo Laravel é construído e inicializado através de provedores de serviços é muito valioso. Os provedores de serviço padrão 
do seu aplicativo são armazenados no diretório `app/Providers`.

Por padrão, o `AppServiceProviders` tem poucas coisas. Este provedor é um ótimo lugar para adicionar bootstrapping e ligações de contêineres de serviços do seu 
próprio aplicativo. Para aplicativos grandes, você pode desejar criar vários provedores de serviço, cada um com inicialização mais granular para serviços 
específicos usados por seu aplicativo.
