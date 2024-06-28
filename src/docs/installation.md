# Instalação

<a name="meet-laravel"></a>
## Conheça o Laravel

 O Laravel é um framework para aplicações Web com uma sintaxe elegante e expressiva. Um framework de aplicação Web fornece uma estrutura e ponto de partida para a criação da sua aplicação, permitindo-lhe concentrar-se na criação do seu projeto fantástico enquanto nós cuidamos dos detalhes.

 O Laravel visa fornecer uma experiência incrível para desenvolvedores ao mesmo tempo em que oferece recursos poderosos como injeção de dependências completa, um expressivo nível de abstração do banco de dados, filas e tarefas agendadas, testes unitários e integração, entre outros.

 Se você é novo em frameworks PHP ou tem anos de experiência, o Laravel é um framework que cresce com você. Nós te ajudaremos a dar seus primeiros passos como web developer ou te dando um impulso quando você levar sua expertise para o próximo nível. Mal podemos esperar para ver o que você criará.

 > [!ATENÇÃO]
 O Curso Introdutório de Laravel (https://bootcamp.laravel.com) é um guia prático para aprender o framework enquanto montamos nossa primeira aplicação Laravel.

<a name="why-laravel"></a>
### Por que usar Laravel?

 Há uma variedade de ferramentas e estruturas disponíveis para você ao criar um aplicativo da Web. No entanto, acreditamos que o Laravel é a melhor escolha para construção de aplicações Web completas e modernas.

#### Uma estrutura progressiva

 Nos gosta de chamar Laravel de um "progressivo" framework (mecanismo). Isto significa que o Laravel cresce consigo. Se estiver a dar os primeiros passos no desenvolvimento web, a vasta biblioteca de documentação, guias e [tutorials em vídeo](https://laracasts.com) do Laravel irão ajudá-lo(a) a aprender as coisas sem ficar sobrecarregado(a).

 Se você é um desenvolvedor experiente, o Laravel oferece ferramentas robustas para [injeção de dependência](/docs/container), [teste unidade](/docs/testing), [filas](/docs/queues), [eventos em tempo real](/docs/broadcasting) e muito mais. O Laravel é desenvolvido especificamente para a construção de aplicativos web profissionais, pronto para lidar com cargas de trabalho corporativas.

#### Um quadro escalável

 O Laravel é extremamente escalonável. Graças à natureza escalonável do PHP e o suporte incorporado ao Laravel para sistemas de cache distribuídos rápidos, como o Redis, a escalabilidade horizontal com o Laravel é fácil. Na verdade, os aplicativos Laravel têm sido facilmente dimensionados para lidar com centenas de milhões de solicitações por mês.

 Precisa de escalonamento extremo? Plataformas como o [Laravel Vapor](https://vapor.laravel.com) permitem executar uma aplicação Laravel em quase qualquer escala com a mais recente tecnologia sem servidor da AWS.

#### Quadro comunitário

 O Laravel combina os melhores pacotes do ecossistema PHP para disponibilizar o mais robusto e amigável framework disponível. Além disso, milhares de desenvolvedores talentosos em todo o mundo contribuíram [para a estrutura](https://github.com/laravel/framework). Talvez até você seja um colaborador do Laravel.

<a name="creating-a-laravel-project"></a>
## Criando um Projeto Laravel

 Antes de criar o seu primeiro projeto Laravel, certifique-se de que a sua máquina local tenha o PHP e o Composer instalados. Se estiver a desenvolver em macOS ou Windows, pode instalar o PHP, o Composer, o Node.js e o NPM em alguns minutos através do [Laravel Herd](https://getcomposer.org).

 Depois de instalar o PHP e o Composer, você pode criar um novo projeto do Laravel através do comando `create-project` do Composer:

```nothing
composer create-project laravel/laravel example-app
```

 Ou você pode criar novos projetos do Laravel instalando globalmente o [instalador Laravel](https://github.com/laravel/installer) por meio de Composer:

```nothing
composer global require laravel/installer

laravel new example-app
```

 Depois que o projeto tiver sido criado, inicie o servidor de desenvolvimento local do Laravel usando a linha de comando `serve` do Laravel Artisan:

```nothing
cd example-app

php artisan serve
```

 Depois de iniciar o servidor de desenvolvimento do Artisan, sua aplicação estará disponível em seu navegador na URL [http://localhost:8000](http://localhost:8000). Próximo, você está pronto para [iniciar seus próximos passos no ecossistema Laravel](#next-steps) Obviamente, você também pode querer [configurar um banco de dados] (#databases-and-migrations).

 > [!NOTA]
 [Kits de inícios](/docs/starter-kits) de Laravel disponibilizam um muro e uma autenticação frontal para a sua nova aplicação Laravel.

<a name="initial-configuration"></a>
## Configuração Inicial

 Todos os arquivos de configuração do Laravel estão no diretório "config". Cada opção está documentada, então você pode conferir livremente quais são as opções disponíveis e como elas funcionam.

 A maioria das configurações do Laravel não são necessárias. Você pode começar a desenvolver sem nenhuma alteração no seu software. No entanto, você poderá revisar o arquivo `config/app.php` e sua documentação. Ele contém vários parâmetros, como `timezone` e `locale`, que você poderá mudar conforme necessário para seu aplicativo.

<a name="environment-based-configuration"></a>
### Configuração baseada em ambiente

 Uma vez que muitos valores das opções de configuração do Laravel podem variar dependendo se seu aplicativo está sendo executado em sua máquina local ou em um servidor web de produção, vários valores importantes de configuração são definidos utilizando o arquivo `.env` existente na raiz da sua aplicação.

 O arquivo `.env` não deve ser commitido no controle de origem da sua aplicação, uma vez que cada desenvolvedor/servidor pode exigir uma configuração do ambiente diferente. Além disso, isto constituiria um risco para a segurança caso um invasor obtivesse acesso ao repositório de controle de origem, já que seriam expostas qualquer credencial confidencial.

 > [!ATENÇÃO]
 [documentação de configuração] (/) docs/configuration#environment-configuration).

<a name="databases-and-migrations"></a>
### Bancos de dados e Migrações

 Agora que você criou sua aplicação do Laravel, provavelmente quer armazenar alguns dados em um banco de dados. Por padrão, o arquivo de configuração `.env` da sua aplicação especifica que o Laravel estará interagindo com um banco de dados SQLite.

 Durante a criação do projeto, o Laravel criou um arquivo `database/database.sqlite`, e executou as migrações necessárias para criar as tabelas de banco de dados da aplicação.

 Se preferir usar um outro driver de banco de dados, como o MySQL ou PostgreSQL, pode atualizar o seu ficheiro de configuração do tipo `.env` para utilizar o banco de dados adequado. Por exemplo, se pretender utilizar o MySQL, atualize as variáveis `DB_*` do seu ficheiro de configuração do tipo `.env`, da seguinte forma:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

 Se você escolher usar um banco de dados que não o SQLite, será preciso criar o banco e executar as migrações do seu aplicativo:

```shell
php artisan migrate
```

 > [!AVISO]
 [Herd Pro](https://herd.laravel.com/#plans).

<a name="directory-configuration"></a>
### Configuração do diretório

 O Laravel deve sempre ser servido a partir da raiz do diretório "web" configurado para o seu servidor web. Você não deveria tentar servir uma aplicação Laravel a partir de um subdiretório do diretório "web". Tentar fazer isso poderia expor arquivos sensíveis presentes dentro da sua aplicação.

<a name="local-installation-using-herd"></a>
## Instalação local usando o Herd

 O [Laravel Herd](https://herd.laravel.com) é um ambiente de desenvolvimento nativo para macOS e Windows com velocidade incrível, baseado em Laravel e PHP. O Herd inclui tudo que você precisa para começar a desenvolver com o Laravel, incluindo PHP e Nginx.

 Depois que o Herd estiver instalado, você estará pronto para começar a programação com Laravel. O Herd inclui ferramentas de linha de comando para `php`, `composer`, `laravel`, `expose`, `node`, `npm` e `nvm`.

 > [!ATENÇÃO]
 O [Herd Pro](https://herd.laravel.com/#plans) melhora a funcionalidade do Herd com recursos poderosos adicionais, como a capacidade de criar e gerenciar bancos de dados locais MySQL, Postgres e Redis, bem como visualização local de e-mails e monitoramento de logs.

<a name="herd-on-macos"></a>
### Herd no MacOS

 Se você estiver desenvolvendo em macOS, poderá baixar o instalador do Herd no site [Herd Laravel](https://herd.laravel.com). O instalador faz o download da última versão do PHP e configura seu Mac para sempre rodar o Nginx (https://www.nginx.com/) em segundo plano.

 O Herd para macOS usa o [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq) para suportar diretórios "estacionados". Qualquer aplicação Laravel num diretório estacionado é automaticamente servida pelo Herd. Por defeito, o Herd cria um diretório estacionado em `~/Herd` e pode aceder a qualquer aplicação Laravel neste diretório no domínio `.test` usando o nome do diretório.

 Depois de instalar o Herd, a maneira mais rápida de criar um novo projeto Laravel é usando o Laravel CLI, que está incluso com o Herd:

```nothing
cd ~/Herd
laravel new my-app
cd my-app
herd open
```

 Claro que você pode sempre gerenciar seus diretórios estacionados e outras configurações do PHP através da interface de usuário (UI) do Herd, que pode ser aberto no menu do Herd na área de notificação do sistema.

 Você pode aprender mais sobre o Herd acessando a documentação do mesmo (https://herd.laravel.com/docs).

<a name="herd-on-windows"></a>
### Herd no Windows

 Pode descarregar o instalador Windows de Herd em [o site da Herd](https://herd.laravel.com/windows). Terminado o procedimento de instalação, pode iniciar a aplicação para concluir o processo de integração e ter acesso à interface gráfica do utilizador (UI) da Herd pela primeira vez.

 O Herd UI é acessível ao clicar com o botão esquerdo do rato no ícone de bandeja do sistema Herd. Um clique direito abre o menu rápido com acesso a todas as ferramentas que você precisa diariamente.

 Durante a instalação, o Herd cria um diretório "estacionado" no seu diretório pessoal em `%USERPROFILE%\Herd`. Qualquer aplicação Laravel num diretório estacionado é servida automaticamente pelo Herd, e pode aceder a qualquer aplicação Laravel neste diretório na área de domínio `.test` utilizando o nome do diretório.

 Depois de instalar o Herd, a maneira mais rápida de criar um novo projeto do Laravel é usando o Laravel CLI, que vem com Herd. Para começar, abra o Powershell e execute os seguintes comandos:

```nothing
cd ~\Herd
laravel new my-app
cd my-app
herd open
```

 Você pode aprender mais sobre o Herd conferindo a documentação do mesmo em [Herd para Windows](https://herd.laravel.com/docs/windows).

<a name="docker-installation-using-sail"></a>
## Instalação do Docker usando Sail

 Queremos que seja o mais fácil possível começar com Laravel independentemente do seu sistema operativo preferido. Por isso, existem várias opções para desenvolver e executar um projeto Laravel na sua máquina local. Embora você possa querer explorar essas opções posteriormente, o Laravel fornece [Sail] (https://laravel.com/docs/sail), uma solução integrada de execução do seu projeto Laravel usando [Docker](https://www.docker.com).

 Docker é uma ferramenta para executar aplicativos e serviços em pequenos "contenedores" leves que não interferem nos softwares ou configurações instalados na sua máquina local. Isto significa que você não precisa se preocupar com a configuração nem com o setup de ferramentas complicadas de desenvolvimento, como servidores da web e bancos de dados em sua máquina local. Para começar é só instalar o [Docker Desktop](https://www.docker.com/products/docker-desktop).

 O Laravel Sail é uma interface de linha de comando leve para interagir com a configuração do Docker padrão da Laravel. Ele fornece um excelente ponto de partida para a criação de aplicativos usando PHP, MySQL e Redis sem exigir experiência prévia em Docker.

 > [!ATENÇÃO]
 > Já é um especialista em Docker? Não se preocupe! Tudo sobre o Sail pode ser personalizado usando o arquivo docker-compose.yml incluído no Laravel.

<a name="sail-on-macos"></a>
### Navegação no MacOS

 Se estiver a desenvolver num Mac e o [Docker Desktop](https://www.docker.com/products/docker-desktop) já está instalado, poderá utilizar um comando simples no terminal para criar um novo projeto Laravel. Por exemplo, se pretender criar uma aplicação Laravel em "example-app", pode executar o seguinte comando no seu terminal:

```shell
curl -s "https://laravel.build/example-app" | bash
```

 Obviamente, você pode alterar "example-app" neste URL para qualquer coisa que desejar - apenas certifique-se de que o nome da aplicação contenha apenas caracteres alfanuméricos, vírgulas e sublinhados. O diretório da aplicação Laravel será criado dentro do diretório no qual você executar o comando.

 A instalação da "Sail" pode levar vários minutos, ao passo que os contêineres de aplicação são construídos na sua máquina local.

 Depois que o projeto tiver sido criado, você poderá navegar para o diretório da aplicação e iniciar o Laravel Sail. O Laravel Sail fornece uma interface gráfica simples para interagir com a configuração Docker padrão do Laravel:

```shell
cd example-app

./vendor/bin/sail up
```

 Depois que os contêineres do Docker da aplicação forem iniciados, você deve executar as migrações de banco de dados de sua aplicação:

```shell
./vendor/bin/sail artisan migrate
```

 Finalmente, você pode acessar o aplicativo em seu navegador na internet em: http://localhost.

 > [!AVISO]
 [Documentação completa](/docs/sail).

<a name="sail-on-windows"></a>
### Navegue no Windows

 Antes de criarmos uma nova aplicação Laravel na sua máquina Windows, certifique-se de instalar o Docker Desktop [Docker](https://www.docker.com/products/docker-desktop). De seguida, deve assegurar que o Subsystema Windows para Linux 2 (WSL2) está instalado e ativado. O WSL permite-lhe executar um programa binário Linux nativamente na sua máquina Windows 10. Informações sobre a instalação e ativação do WSL2 podem ser encontradas no [Documentação Ambiente Desenvolvedor da Microsoft](https://docs.microsoft.com/pt-br/windows/wsl/install-win10).

 > [!NOTA]
 [configurado para usar o servidor do WSL2] (https://docs.docker.com/docker-for-windows/wsl/).

 Em seguida, você estará pronto para criar seu primeiro projeto do Laravel. Inicie o [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701?rtc=1&activetab=pivot:overviewtab) e inicie uma nova sessão de terminal para seu sistema operacional Linux WSL2. Em seguida, você pode usar um comando simples no terminal para criar um novo projeto do Laravel. Por exemplo, se quiser criar uma nova aplicação do Laravel em uma pasta chamada "example-app", poderá executar o seguinte comando no seu terminal:

```shell
curl -s https://laravel.build/example-app | bash
```

 Claro, você pode mudar "example-app" neste URL para qualquer nome que preferir. Só precisa garantir que o nome da aplicação contenha apenas caracteres alfanuméricos, traços e sublinhados. O diretório de aplicativo do Laravel será criado dentro do diretório no qual você executou a ordem.

 A instalação do Sail pode demorar vários minutos enquanto os contêineres de aplicativos são construídos na máquina local.

 Depois que o projeto tiver sido criado, você pode navegar até o diretório da aplicação e iniciar o Laravel Sail. O Laravel Sail oferece uma interface de linha de comando simples para interagir com a configuração padrão do Docker do Laravel:

```shell
cd example-app

./vendor/bin/sail up
```

 Uma vez iniciados os contêineres do aplicativo no Docker, você deve executar as migrações de banco de dados de seu aplicativo:

```shell
./vendor/bin/sail artisan migrate
```

 Por último, você poderá acessar o aplicativo em seu navegador da Web no endereço: http://localhost.

 > [!ATENÇÃO]
 [Documentação completa](/docs/sail).

#### Desenvolvimento no âmbito da WSL2

 Claro, você terá que poder modificar os arquivos da aplicação Laravel criados dentro de sua instalação do WSL2. Para isso, recomendamos o editor [Visual Studio Code](https://code.visualstudio.com) e a extensão para [Desenvolvimento Remoto](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack), disponibilizada pela Microsoft.

 Depois que essas ferramentas forem instaladas, você poderá abrir qualquer projeto Laravel executando o comando `code .` a partir do diretório raiz de sua aplicação usando o Windows Terminal.

<a name="sail-on-linux"></a>
### Navegar no Linux

 Se você estiver desenvolvendo no Linux e o [Docker Compose](https://docs.docker.com/compose/install/) já estiver instalado, poderá usar um comando simples em seu terminal para criar um novo projeto Laravel.

 Primeiramente, caso você esteja utilizando o Docker Desktop para Linux, você deverá executar o seguinte comando. Caso não esteja usando o Docker Desktop para Linux, pode pular esse passo:

```shell
docker context use default
```

 Então, para criar um novo aplicativo do Laravel em um diretório chamado "example-app", você pode executar o seguinte comando no seu terminal:

```shell
curl -s https://laravel.build/example-app | bash
```

 Naturalmente, você pode alterar "example-app" neste URL para qualquer coisa que queira — basta ter certeza de que o nome da aplicação contém somente caracteres alfanuméricos, traços e sublinhados. O diretório da aplicação Laravel será criado dentro do diretório do comando executado.

 A instalação do Sail pode levar vários minutos enquanto os contêineres de aplicativos do Sail são construídos em sua máquina local.

 Depois que o projeto tiver sido criado, você poderá navegar até o diretório da aplicação e iniciar o Laravel Sail. O Laravel Sail oferece uma interface simples do linha de comando para interagir com a configuração Docker padrão do Laravel:

```shell
cd example-app

./vendor/bin/sail up
```

 Uma vez iniciados os contêineres de Docker do seu aplicativo, execute as migrações do banco de dados da sua aplicação:

```shell
./vendor/bin/sail artisan migrate
```

 Por fim, pode aceder à aplicação no seu navegador na URL: http://localhost/.

 > [!NOTA]
 [Documentação completa](/docs/sail)

<a name="choosing-your-sail-services"></a>
### Escolhendo os serviços de vela

 Ao criar um novo aplicativo Laravel através do Sail, pode usar a variável de consulta `with` para escolher os serviços que devem ser configurados no ficheiro `docker-compose.yml` do seu novo aplicativo. Os serviços disponíveis incluem:

- mysql
- pgsql
- mariadb
- redis
- memcached
- meilisearch
- typesense
- minio
- selenium
e mailpit

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis" | bash
```

 Se você não especificar quais serviços gostaria de ter configurado, será utilizada uma pilha padrão formada por `mysql`, `redis`, `meilisearch`, `mailpit` e `selenium`.

 Você pode instruir o Sail para instalar um padrão [Devcontainer](/docs/sail#using-devcontainers), adicionando o parâmetro `devcontainer` na URL:

```shell
curl -s "https://laravel.build/example-app?with=mysql,redis&devcontainer" | bash
```

<a name="ide-support"></a>
## Suporte do IDE

 Você pode usar qualquer editor de códigos que desejar ao desenvolver aplicativos Laravel; no entanto, o [PhpStorm](https://www.jetbrains.com/phpstorm/laravel/) oferece suporte extenso para Laravel e seu ecossistema, incluindo o [Laravel Pint](https://www.jetbrains.com/help/phpstorm/using-laravel-pint.html).

 Além disso, o plugin [Laravel Idea](https://laravel-idea.com/) do PhpStorm da comunidade disponibiliza várias ajudas no IDE, incluindo geração de código, conclusão de sintaxe Eloquent, conclusão de regras de validação e muito mais.

<a name="next-steps"></a>
## Passos seguintes

 Agora que você criou seu projeto em Laravel, pode estar se perguntando o que aprender depois. Primeiro, recomendamos muito familiarizar-se com o funcionamento do Laravel lendo a documentação abaixo:

<div class="content-list" markdown="1">

 [ Ciclo de solicitações](/docs/lifecycle)
 [Configuração](/docs/configuration)
 Estrutura do diretório (/)
 [Frontend](/docs/frontend)
 [Caixa de Serviço]()
 [ Fachadas](/docs/facades)

</div>

 Como você pretende usar o Laravel também dirá quais serão as próximas etapas em sua jornada. Existem vários tipos de maneiras de usar o Laravel e, abaixo, exploraremos dois casos principais de uso do framework.

 > [!AVISO]
 O curso "Iniciando com o Laravel" (https://bootcamp.laravel.com) apresenta um passeio prático do framework enquanto ajudamos você a criar sua primeira aplicação Laravel.

<a name="laravel-the-fullstack-framework"></a>
### O Laravel é um framework completo

 O Laravel pode funcionar como um framework de "full stack". Por meio de "framework de full stack" queremos dizer que você irá usar o Laravel para encaminhar solicitações à sua aplicação e renderizar seu frontend por meio de [modelos Blade](/docs/blade) ou uma tecnologia híbrida de aplicativo single-page como [Inertia](https://inertiajs.com). Esta é a maneira mais comum de usar o Laravel, e, na nossa opinião, a forma mais produtiva de usar o Laravel.

 Se essa for a forma como você planeja usar o Laravel, talvez se interesse pela nossa documentação sobre desenvolvimento front-end [/docs/frontend](https://laravel.com/docs/5.6/frontend), roteamento [/docs/routing](https://laravel.com/docs/5.6/routing), exibições [/docs/views](https://laravel.com/docs/5.6/views) ou ORM [Eloquent] (/docs/eloquent). Além disso, você pode se interessar em aprender sobre pacotes da comunidade, como o Livewire ([https://livewire.laravel.com](https://livewire.laravel.com)) e o Inertia ([https://inertiajs.com](https://inertiajs.com)). Esses pacotes permitem que você use o Laravel como um framework full-stack, aproveitando os benefícios da interface de usuário fornecidos por aplicativos JavaScript com página única.

 Se você estiver usando o Laravel como um framework completo, também incentivamos muito que aprenda a compilar o seu CSS e JavaScript da aplicação usando o Vite.

 > [!ATENÇÃO]
 [Kits de início de aplicativos] (/docs/starter-kits).

<a name="laravel-the-api-backend"></a>
### O Backend da API do Laravel

 O Laravel também pode funcionar como um servidor de API para uma aplicação móvel ou JavaScript single-page. Por exemplo, você pode usar o Laravel como um servidor de API para a sua aplicação [Next.js](https://nextjs.org). Neste contexto, você pode usar o Laravel para fornecer autenticação e armazenamento / recuperação de dados para a sua aplicação, aproveitando também os serviços poderosos do Laravel, tais como filas, emails, notificações e muito mais.

 Se este for o plano de trabalho com Laravel, poderá consultar a documentação sobre [roteamento (en)](/docs/routing), [Laravel Sanctum](/docs/sanctum) e o [ORM Eloquent (en)](/docs/eloquent).

 > [!ATENÇÃO]
 [Pilha de APIs](/docs/starter-kits#breeze-and-next), bem como um
