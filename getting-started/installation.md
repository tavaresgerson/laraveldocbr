# Conheça o Laravel

Laravel é um framework de aplicação web com sintaxe expressiva e elegante. Uma estrutura da web fornece uma estrutura e um 
ponto de partida para a criação de seu aplicativo, permitindo que você se concentre na criação de algo incrível enquanto 
suamos nos detalhes.

O Laravel se esforça para fornecer uma experiência ao desenvolvedor de forma incrível, enquanto fornece recursos poderosos como 
injeção de dependência completa, uma camada de abstração de banco de dados expressiva, filas e tarefas agendadas, testes de unidade 
e integração e muito mais.

Quer você seja novo em PHP ou frameworks web ou tenha anos de experiência, o Laravel é um framework que pode crescer com você. Vamos 
ajudá-lo a dar os primeiros passos como desenvolvedor web ou dar-lhe um impulso à medida que leva sua experiência para o próximo nível. 
Mal podemos esperar para ver o que você constrói.

## Por que Laravel?
Há uma variedade de ferramentas e estruturas disponíveis para você ao construir um aplicativo da web. No entanto, acreditamos que o Laravel 
é a melhor escolha para construir aplicativos da web modernos e completos.

### Uma estrutura progressiva
Gostamos de chamar o Laravel de framework "progressivo". Com isso, queremos dizer que o Laravel cresce com você. Se você está apenas dando 
os primeiros passos no desenvolvimento web, a vasta biblioteca de documentação, guias e [tutoriais em vídeo](https://laracasts.com/) do 
Laravel o ajudará a aprender o básico sem ficar sobrecarregado.

Se você é um desenvolvedor sênior, o Laravel oferece ferramentas robustas para injeção de dependência, teste de unidade, filas, eventos em 
tempo real e muito mais. Laravel é ajustado para construir aplicações web profissionais e pronto para lidar com cargas de trabalho corporativas.

### Uma estrutura escalável
O Laravel é incrivelmente escalonável. Graças à natureza amigável de escalonamento do PHP e ao suporte embutido do Laravel para sistemas de cache 
rápido e distribuído como o Redis, o escalonamento horizontal com o Laravel é suave. Na verdade, os aplicativos Laravel foram facilmente escalados
para lidar com centenas de milhões de solicitações por mês.

Precisa de escalonamento extremo? Plataformas como o [Laravel Vapor](https://vapor.laravel.com/) permitem que você execute 
seu aplicativo Laravel em escala quase ilimitada na mais recente tecnologia serverless da AWS.

### Um Framework Comunitário
Laravel combina os melhores pacotes do ecossistema PHP para oferecer o framework mais robusto e amigável disponível para o desenvolvedor. 
Além disso, milhares de desenvolvedores talentosos de todo o mundo [contribuíram para a estrutura](https://github.com/laravel/framework). 
Quem sabe você até se torne um colaborador do Laravel.

## Seu primeiro projeto Laravel
Queremos que seja o mais fácil possível para começar a usar o Laravel. Existem várias opções para desenvolver e executar um projeto Laravel 
em seu próprio computador. Embora você possa desejar explorar essas opções posteriormente, o Laravel fornece o [Sail](https://laravel.com/docs/8.x/sail), 
uma solução embutida para rodar seu projeto Laravel usando o Docker.

O Docker é uma ferramenta para executar aplicativos e serviços em "contêineres" pequenos e leves que não interferem na configuração ou no 
software instalado em seu computador local. Isso significa que você não precisa se preocupar em configurar ou configurar ferramentas de 
desenvolvimento complicadas, como servidores da web e bancos de dados em seu computador pessoal. Para começar, você só precisa instalar o 
[Docker Desktop](https://www.docker.com/products/docker-desktop).

Laravel Sail é uma interface de linha de comando leve para interagir com a configuração padrão do Docker do Laravel. O Sail oferece um ótimo 
ponto de partida para construir um aplicativo Laravel usando PHP, MySQL e Redis sem a necessidade de experiência anterior com Docker.

> Já é um especialista do Docker? Não se preocupe! Tudo sobre o Sail pode ser personalizado usando o arquivo `docker-compose.yml` incluído no Laravel.

### Primeiros passos no macOS
Se você estiver desenvolvendo em um Mac e o Docker Desktop já estiver instalado, você pode usar um comando de terminal simples para criar 
um novo projeto Laravel. Por exemplo, para criar um novo aplicativo Laravel em um diretório chamado "example-app", você pode executar o seguinte 
comando em seu terminal:

```bash
curl -s https://laravel.build/example-app | bash
```

Claro, você pode alterar "app de exemplo" neste URL para o que quiser. O diretório do aplicativo Laravel será criado dentro do diretório 
de onde você executa o comando.

Após a criação do projeto, você pode navegar até o diretório do aplicativo e iniciar o Laravel Sail. O Laravel Sail fornece uma interface de 
linha de comando simples para interagir com a configuração padrão do Docker do Laravel:

```bash
cd example-app

./vendor/bin/sail up
```

Na primeira vez que você executa o comando `up` do Sail, os contêineres de aplicativos do Sail serão construídos em sua máquina. Isso 
pode levar vários minutos. Não se preocupe, as tentativas subsequentes de iniciar o Sail serão muito mais rápidas.

Depois que os contêineres do Docker do aplicativo forem iniciados, você pode acessar o aplicativo em seu navegador em: http://localhost 

> Para continuar aprendendo mais sobre o Laravel Sail, revise a [documentação](https://laravel.com/docs/8.x/sail).

### Primeiros passos no Windows

Antes de criarmos um novo aplicativo Laravel em sua máquina Windows, certifique-se de instalar o Docker Desktop. Em seguida, 
você deve garantir que o Subsistema Windows para Linux 2 (WSL2) esteja instalado e ativado. WSL permite que você execute 
executáveis binários do Linux nativamente no Windows 10. As informações sobre como instalar e habilitar WSL2 podem ser encontradas 
na documentação do [ambiente de desenvolvedor da Microsoft](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

> Após instalar e habilitar o WSL2, você deve garantir que o Docker Desktop esteja [configurado para usar o back-end WSL2](https://docs.docker.com/docker-for-windows/wsl/).

Em seguida, você está pronto para criar seu primeiro projeto Laravel. Inicie 
o [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701?rtc=1&activetab=pivot:overviewtab) e 
comece uma nova sessão de terminal para seu sistema operacional WSL2 Linux. Em seguida, você pode usar um comando de 
terminal simples para criar um novo projeto Laravel. Por exemplo, para criar um novo aplicativo Laravel em um diretório 
chamado "example-app", você pode executar o seguinte comando em seu terminal:

```bash
curl -s https://laravel.build/example-app | bash
```

Claro, você pode alterar "app de exemplo" nesta URL para o que quiser. O diretório do aplicativo Laravel será criado dentro 
do diretório de onde você executa o comando.

Após a criação do projeto, você pode navegar até o diretório do aplicativo e iniciar o Laravel Sail. O Laravel Sail fornece uma 
interface de linha de comando simples para interagir com a configuração padrão do Docker do Laravel:

```
cd example-app

./vendor/bin/sail up
```

Na primeira vez que você executa o comando `up` do Sail, os contêineres de aplicativos do Sail serão construídos em sua máquina. 
Isso pode levar vários minutos. Não se preocupe, as tentativas subsequentes de iniciar o Sail serão muito mais rápidas.

Depois que os contêineres do Docker do aplicativo forem iniciados, você pode acessar o aplicativo em seu navegador: http://localhost

> Para continuar aprendendo mais sobre o Laravel Sail, revise sua [documentação completa](https://laravel.com/docs/8.x/sail).

#### Desenvolvimento dentro da WSL2

Claro, você precisará modificar os arquivos do aplicativo Laravel que foram criados na instalação do WSL2. Para fazer isso, 
recomendamos o uso do editor de código do Visual Studio da Microsoft e sua extensão original para desenvolvimento remoto.

Uma vez que essas ferramentas são instaladas, você pode abrir qualquer projeto Laravel executando o comando `code .` do diretório raiz de 
seu aplicativo usando o Terminal do Windows.

### Primeiros passos no Linux

Se você estiver desenvolvendo no Linux e o Docker já estiver instalado, você pode usar um comando de terminal simples para criar um novo 
projeto Laravel. Por exemplo, para criar um novo aplicativo Laravel em um diretório chamado "example-app", você pode executar o seguinte 
comando em seu terminal:

```bash
curl -s https://laravel.build/example-app | bash
```

Claro, você pode alterar "app de exemplo" neste URL para o que quiser. O diretório do aplicativo Laravel será criado dentro do 
diretório de onde você executa o comando.

Após a criação do projeto, você pode navegar até o diretório do aplicativo e iniciar o Laravel Sail. O Laravel Sail fornece uma 
interface de linha de comando simples para interagir com a configuração padrão do Docker do Laravel:

```
cd example-app

./vendor/bin/sail up
```

Na primeira vez que você executa o comando `up` do Sail, os contêineres de aplicativos do Sail serão construídos em sua máquina. 
Isso pode levar vários minutos. **Não se preocupe, as tentativas subsequentes de iniciar o Sail serão muito mais rápidas.**

Depois que os contêineres do Docker do aplicativo forem iniciados, você pode acessar o aplicativo em seu navegador: http://localhost

> Para continuar aprendendo mais sobre o Laravel Sail, revise sua [documentação completa](https://laravel.com/docs/8.x/sail).

### Instalação Via Composer

Se o seu computador já possui PHP e Composer instalados, você pode criar um novo projeto Laravel usando o Composer diretamente. 
Após a criação do aplicativo, você pode iniciar o servidor de desenvolvimento local do Laravel usando o comando `serve` do Artisan CLI:

```bash
composer create-project laravel/laravel example-app

cd example-app

php artisan serve
```

#### O instalador do Laravel

Ou você pode instalar o instalador do Laravel como uma dependência global do Composer:
```bash
composer global require laravel/installer

laravel new example-app

php artisan serve
```

Certifique-se de colocar o diretório bin do fornecedor de todo o sistema do Composer em seu `$PATH` para que o `laravel` executável possa ser 
localizado em seu sistema. Este diretório existe em diferentes locais com base em seu sistema operacional; no entanto, alguns locais comuns incluem:

+ Mac OS: `$HOME/.composer/vendor/bin`
+ Windows: `%USERPROFILE%\AppData\Roaming\Composer\vendor\bin`
+ Distribuições GNU/Linux: `$HOME/.config/composer/vendor/binou$HOME/.composer/vendor/bin`

## Configuração Inicial

Todos os arquivos de configuração do framework Laravel são armazenados no diretório `config`. Cada opção é documentada portanto, sinta-se 
à vontade para examinar os arquivos e se familiarizar com as opções disponíveis.

O Laravel quase não precisa de configuração adicional fora da caixa. Você está livre para começar a desenvolver! No entanto, você pode desejar 
revisar o arquivo `config/app.php` e sua documentação. Ele contém várias opções como `timezone` e `locale` que você pode desejar alterar de acordo 
com sua aplicação.

#### Configuração baseada em ambiente

Uma vez que muitos dos valores existentes na configuração do Laravel podem variar dependendo se seu aplicativo está rodando em seu 
computador local ou em um servidor web de produção, muitos valores de configuração importantes são definidos usando o arquivo `.env` 
que existe na raiz de seu aplicativo.

Seu arquivo `.env` não deve ser adicionado ao controle de versão de seu aplicativo, uma vez que cada desenvolvedor/servidor usando 
seu aplicativo pode exigir uma configuração de ambiente diferente. Além disso, isso seria um risco de segurança no caso de um invasor 
obter acesso ao repositório.

> Para obter mais informações sobre `.env` e a configuração baseada em arquivo e ambiente, verifique a [documentação de configuração completa](https://laravel.com/docs/8.x/configuration#environment-configuration).


# Próximos passos
Agora que criou seu projeto Laravel, você pode estar se perguntando o que aprender a seguir. Em primeiro lugar, recomendamos que 
você se familiarize com o funcionamento do Laravel lendo a seguinte documentação:

Solicitar Ciclo de Vida
Configuração
Estrutura de Diretório
Container de serviço
Fachadas

A forma como você deseja usar o Laravel também determinará os próximos passos em sua jornada. Existem várias maneiras de usar o Laravel, 
e vamos explorar dois casos de uso principais para o framework abaixo.

## Pilha Completa do Framework Laravel
O Laravel pode servir como um framework full stack. Por framework "full stack" queremos dizer que você usará o Laravel para rotear 
requisições para sua aplicação e renderizar seu frontend através de [templates Blade](https://laravel.com/docs/8.x/blade) ou usando uma tecnologia híbrida de aplicação de 
página única como [Inertia.js](https://inertiajs.com/). Esta é a forma mais comum de usar o framework Laravel.

Se é assim que você planeja usar o Laravel, você pode verificar nossa documentação sobre roteamento , visualizações ou o ORM do Eloquent. 
Além disso, você pode estar interessado em aprender sobre pacotes da comunidade como Livewire e Inertia.js . Esses pacotes permitem que 
você use o Laravel como um framework full-stack enquanto desfruta de muitos dos benefícios da interface do usuário fornecidos por aplicativos 
JavaScript de página única.

Se você está usando o Laravel como um framework full stack, também encorajamos você a aprender como compilar o CSS e JavaScript de sua aplicação 
usando o Laravel Mix .

> Se você quiser começar a construir seu aplicativo, dê uma olhada em um de nossos kits oficiais para iniciantes.

## Laravel O backend da API
O Laravel também pode servir como um backend de API para um aplicativo JavaScript de página única ou aplicativo móvel. Por exemplo, você pode 
usar o Laravel como um backend de API para seu aplicativo Next.js. Neste contexto, você pode usar o Laravel para fornecer autenticação e 
armazenamento/recuperação de dados para sua aplicação, enquanto também tira proveito dos poderosos serviços do Laravel, como filas, emails, 
notificações e muito mais.

> Se é assim que você planeja usar o Laravel, verifique nossa documentação sobre roteamento, Laravel Sanctum e o Eloquent ORM.
