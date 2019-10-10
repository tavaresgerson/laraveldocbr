# Contratos

## Introdução

Os contratos do Laravel são um conjunto de interfaces que definem os principais serviços fornecidos pela estrutura. Por exemplo, 
um contrato `Illuminate\Contracts\Queue\Queue` define os métodos necessários para trabalhos em fila, enquanto o contrato 
`Illuminate\Contracts\Mail\Mailer` define os métodos necessários para o envio de email.

Cada contrato tem uma implementação correspondente fornecida pela estrutura. Por exemplo, o Laravel fornece uma implementação de 
fila com uma variedade de drivers e uma implementação de mala direta com tecnologia `SwiftMailer`.

Todos os contratos do Laravel vivem em seu próprio repositório GitHub. Isso fornece um ponto de referência rápida para todos os 
contratos disponíveis, além de um único pacote desacoplado que pode ser utilizado pelos desenvolvedores de pacotes.

## Contratos vs. Facades
As facades e funções auxiliares do Laravel fornecem uma maneira simples de utilizar os serviços do Laravel sem a necessidade de 
digitar dicas e resolver contratos fora do contêiner de serviço. Na maioria dos casos, cada facade tem um contrato equivalente.

Diferentemente das facades, que não exigem que você as use no construtor de sua classe, os contratos permitem definir dependências 
explícitas para suas classes. Alguns desenvolvedores preferem definir explicitamente suas dependências dessa maneira e, portanto, 
preferem usar contratos, enquanto outros desenvolvedores desfrutam da conveniência de fachadas.
