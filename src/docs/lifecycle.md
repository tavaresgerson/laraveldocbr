# Ciclo de Vida

## Introdução

Ao usar uma ferramenta no "mundo real", você se sente mais confiante quando entende como aquele instrumento funciona. O desenvolvimento de aplicativos não é diferente. Quando você compreende o funcionamento das ferramentas de desenvolvimento, se sente mais confortável e seguro ao utilizá-las.

O objetivo deste documento é dar-lhe uma boa visão geral do funcionamento do framework Laravel. Conhecendo melhor o conjunto global de recursos, tudo parecerá menos "mágico" e você estará mais confiante ao criar suas aplicações. Se não entender alguns termos imediatamente, não se desespere! Tente ter uma noção básica do que está a acontecer e sua experiência crescerá à medida que explorar outros conteúdos da documentação.

## Visão geral do ciclo de vida

### Primeiros passos

O ponto de entrada para todas as solicitações na aplicação Laravel é o arquivo `public/index.php`. Todas as solicitações são encaminhadas para este arquivo pela configuração do servidor web (Apache/Nginx). O arquivo `index.php` não contém muitos códigos, ele simplesmente serve como ponto de partida para carregar o restante do framework.

O arquivo `index.php` carrega a definição do autoloader gerado pelo Composer e, em seguida, recupera uma instância da aplicação Laravel de `bootstrap/app.php`. A primeira ação realizada pelo próprio Laravel é criar uma instância da aplicação/[container de serviços](/docs/container).

### Kernel HTTP/Console

Em seguida, o pedido recebido é enviado ao kernel de HTTP ou ao kernel do console, utilizando os métodos `handleRequest` ou `handleCommand` da instância da aplicação, dependendo do tipo de pedido que entra na aplicação. Estes dois kernels servem como localização central através da qual todos os pedidos fluem. Por enquanto, vamos nos concentrar apenas no kernel HTTP, uma instância do `Illuminate\Foundation\Http\Kernel`.

O kernel HTTP define um array de `bootstrappers` que serão executados antes da execução do pedido. Esses bootstrappers configuram o controle de erros, configuram a logon, [detectam o ambiente da aplicação](/docs/configuration#environment-configuration), e realizam outras tarefas que precisam ser feitas antes que o pedido seja realmente processado. Normalmente, essas classes controlam a configuração interna do Laravel com as quais você não tem necessariamente que se preocupar.

O kernel HTTP também é responsável por passar o pedido através da pilha de middleware do aplicativo. Esses middlewares lidam com a leitura e escrita na sessão [HTTP](/docs/session), determinando se o aplicativo está em modo de manutenção, [verificando o token CSRF](/docs/csrf) e muito mais. Falaremos melhor sobre isso brevemente.

A assinatura do método `handle` para o kernel do HTTP é bastante simples. Ela recebe um `Request` e retorna uma `Response`. Pense no kernel como sendo uma grande caixa preta que representa toda a sua aplicação. Forneça-lhe solicitações HTTP e ele irá retornar respostas HTTP.

### Prestadores de serviços

Uma das ações de inicialização do kernel mais importantes é carregar os [provedores de serviço](/docs/providers) para sua aplicação. Os provedores de serviços são responsáveis por inicializar todos os vários componentes do framework, tais como o componente de banco de dados, fila, validação e roteamento.

O Laravel irá iterar esta lista de provedores e instanciar cada um deles. Após a instânciação dos provedores, o método `register` será chamado em todos eles. Em seguida, depois que todos os provedores tiverem sido registrados, o método `boot` será chamado em cada provedor. Isso é necessário para que os provedores de serviços possam depender da vinculação a todo contêiner estar registrada e disponível no momento em que seu método `boot` for executado.

Em essência, todos os recursos principais oferecidos pelo Laravel são iniciados e configurados por um Service Provider. Como eles inicializam e configuram muitos dos recursos oferecidos pelo framework, os serviços provedores são o aspecto mais importante de todo o processo de inicialização do Laravel.

Apesar de o framework usar internamente dezenas de provedores de serviços, você também tem a opção de criar os seus próprios. É possível encontrar uma lista dos provedores de serviços definidos pelo usuário ou de terceiros que sua aplicação está usando no arquivo `bootstrap/providers.php`.

### Roteamento

Depois que o aplicativo for inicializado e todos os provedores de serviços forem registrados, a `Request` será entregue ao roteador para despacho. O roteador despachará a solicitação para uma rota ou controlador, bem como executará qualquer middleware específico da rota.

Os middlewares fornecem um mecanismo conveniente para filtrar ou examinar os pedidos HTTP que entram na sua aplicação. Por exemplo, o Laravel inclui um middleware que verifica se o usuário da sua aplicação está autenticado. Se o usuário não estiver autenticado, o middleware redirecionará o usuário para a tela de login. No entanto, se o usuário estiver autenticado, o middleware permitirá que a solicitação avance mais na aplicação. Alguns middlewares são atribuídos a todas as rotas da aplicação, como `PreventRequestsDuringMaintenance`, enquanto outros apenas são atribuídos a rotas específicas ou grupos de rotas. Você pode saber mais sobre o middleware lendo a documentação completa de [middlewares](/docs/middleware).

Se o pedido passar por todos os middlewares atribuídos da rota combinada, a rota ou o método do controlador serão executados e a resposta retornada pelo método da rota ou do controlador será enviada de volta pela cadeia de middlewares da rota.

### Finalizando

Depois que o método do controlador ou da rota retornar uma resposta, esta será enviada para a frente, passando pelo middleware do caminho, dando à aplicação a chance de modificar ou analisar a resposta enviada.

Por fim, uma vez que a resposta retorne ao middleware, o método `handle` do núcleo HTTP devolve o objeto de resposta para o `handleRequest` da instância da aplicação, e este método chama o método `send` no objeto de resposta retornado. O método `send` envia o conteúdo da resposta ao navegador do usuário. Agora completámos a nossa jornada através do ciclo de vida de solicitação completo do Laravel!

## Concentre-se nos provedores de serviços

Os provedores de serviços são verdadeiramente a chave para iniciar uma aplicação Laravel. A instância da aplicação é criada, os provedores de serviços são registrados e o pedido é entregue à aplicação inicializada. É tão simples assim!

Dominar a construção e inicialização de uma aplicação Laravel através de fornecedores de serviços é muito útil. Os fornecedores de serviço personalizados da sua aplicação são armazenados no diretório `app/Providers`.

Por padrão, o `AppServiceProvider` é bastante vazio. Este provedor é um ótimo lugar para adicionar os próprios recursos de inicialização da aplicação e vinculamentos do contêiner de serviço. Para aplicações grandes, você pode querer criar vários provedores de serviços, cada um com inicialização mais granular para serviços específicos utilizados por sua aplicação.
