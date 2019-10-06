# Ciclo de Requisições

## Introdução
Ao usar qualquer ferramenta no "mundo real", você se sente mais confiante se entender como essa ferramenta 
funciona. O desenvolvimento de aplicativos não é diferente. Ao entender como suas ferramentas de desenvolvimento 
funcionam, você se sente mais confortável e confiante ao usá-las.

O objetivo deste documento é fornecer uma boa visão geral de alto nível de como a estrutura do Laravel funciona. 
Ao conhecer melhor a estrutura geral, tudo parece menos "mágico" e você ficará mais confiante ao criar seus 
aplicativos. Se você não entender todos os termos imediatamente, não desanime! Apenas tente obter uma compreensão 
básica do que está acontecendo, e seu conhecimento aumentará à medida que você explora outras seções da documentação.

## Visão geral do ciclo de vida

### Primeiras coisas
O ponto de entrada para todas as solicitações de um aplicativo Laravel é o arquivo `public/index.php`. Todas as 
solicitações são direcionadas para esse arquivo pela configuração do servidor da web (Apache/Nginx). O arquivo 
`index.php` não contém muito código. Pelo contrário, é um ponto de partida para carregar o restante da estrutura.

O arquivo `index.php` carrega a definição do autoloader gerado pelo Composer e recupera uma instância 
do aplicativo Laravel do script `bootstrap/app.php`. A primeira ação realizada pelo próprio Laravel é criar uma 
instância do contêiner de aplicativos/serviços.

## Kernels HTTP / Console
Em seguida, a solicitação recebida é enviada ao kernel HTTP ou ao console, dependendo do tipo de solicitação que 
está entrando no aplicativo. Esses dois kernels servem como o local central pelo qual todas as solicitações fluem. 
Por enquanto, vamos nos concentrar no kernel HTTP, localizado em `app/Http/Kernel.php`.

O kernel HTTP estende a classe `Illuminate\Foundation\Http\Kernel`, que define uma matriz de bootstrappers que serão 
executados antes da execução da solicitação. Esses bootstrappers configuram o tratamento de erros, configuram o log, 
detectam o [ambiente do aplicativo](https://laravel.com/docs/5.8/configuration#environment-configuration) e executam outras tarefas que precisam ser realizadas antes que a solicitação seja
realmente tratada.

O kernel HTTP também define uma lista de [middleware](https://laravel.com/docs/5.8/middleware) HTTP que todas as solicitações devem passar antes de serem 
tratadas pelo aplicativo. Esses middlewares lidam com a leitura e gravação da [sessão HTTP](https://laravel.com/docs/5.8/session), determinando se o 
aplicativo está no modo de manutenção, verificando o [token CSRF](https://laravel.com/docs/5.8/csrf) e muito mais.

A assinatura do método para o método de manipulação do kernel HTTP é bastante simples: receba um `Request` e 
retorne um `Response`. Pense no Kernel como uma grande caixa preta que representa todo o seu aplicativo. Alimente 
solicitações HTTP e ele retornará respostas HTTP.

### Provedores de Serviço (Service Providers)
Uma das ações mais importantes de inicialização do Kernel é carregar os [provedores de serviços](https://laravel.com/docs/5.8/providers) para seu aplicativo. 
Todos os provedores de serviços do aplicativo estão configurados na matriz de provedores do arquivo de configuração
`config/app.php`. Primeiro, o método de registro será chamado em todos os provedores e, depois que todos os provedores 
forem registrados, o método de inicialização será chamado.

Os provedores de serviços são responsáveis por inicializar todos os vários componentes da estrutura, como os componentes 
de banco de dados, fila, validação e roteamento. Como eles inicializam e configuram todos os recursos oferecidos pela 
estrutura, os provedores de serviços são o aspecto mais importante de todo o processo de inicialização do Laravel.

### Pedido de Despacho
Depois que o aplicativo for inicializado e todos os provedores de serviços estiverem registrados, o `Request` será 
entregue ao roteador para envio. O roteador enviará a solicitação para uma rota ou controlador, além de executar qualquer 
middleware específico da rota.


## Foco nos provedores de serviços
Os provedores de serviços são realmente a chave para inicializar um aplicativo Laravel. A instância do aplicativo é 
criada, os provedores de serviços são registrados e a solicitação é entregue ao aplicativo de inicialização. É 
realmente assim tão simples!

Ter uma compreensão firme de como um aplicativo Laravel é criado e inicializado por meio de provedores de serviços 
é muito valioso. Os provedores de serviços padrão do seu aplicativo são armazenados no diretório `app/Providers`.

Por padrão, o `AppServiceProvider` está bastante vazio. Esse provedor é um ótimo local para adicionar ligações de 
contêiner de serviço e autoinicialização do seu aplicativo. Para aplicativos grandes, convém criar vários provedores 
de serviços, cada um com um tipo mais granular de inicialização.
