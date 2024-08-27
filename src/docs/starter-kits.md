# Kits de Início

<a name="introduction"></a>
## Introdução

Para te dar um começo para construir sua aplicação Laravel nova, estamos felizes em oferecer kits de autenticação e kit de aplicação iniciadores. Estes kits automaticamente "esboçam" a sua aplicação com as rotas, controladores e visualizações que você precisa para registrar e autenticar seus usuários da aplicação.

Embora você seja bem-vindo para usar esses "kits iniciais", eles não são obrigatórios. Você é livre para construir seu próprio aplicativo do zero simplesmente instalando uma cópia fresca de Laravel. De qualquer forma, nós sabemos que você vai construir algo grande!

<a name="laravel-breeze"></a>
## Laravel Breeze

[Laravel Breeze](https://github.com/laravel/breeze) é uma implementação mínima e simples de todos os recursos de autenticação do Laravel, incluindo login, registro, redefinição de senha, verificação de e-mail e confirmação de senha. Além disso, Breeze inclui uma página "perfil" simples na qual o usuário pode atualizar seu nome, endereço de e-mail e senha.

A camada de vista padrão do Laravel Breeze é composta por modelos simples [Blade](/docs/{{version}}/blade) com estilo [Tailwind CSS](https://tailwindcss.com). Além disso, o Breeze fornece opções de estruturação baseadas no [Livewire](https://livewire.laravel.com) ou [Inertia](https://inertiajs.com), com a escolha de usar Vue ou React para a estruturação baseada em Inertia.

<img src="https://laravel.com/img/docs/breeze-register.png">

#### Laravel Bootcamp

Se você é novo em Laravel, sinta-se à vontade para mergulhar no [bootcamp de Laravel](https://bootcamp.laravel.com). O Bootcamp Laravel o guiará na criação do seu primeiro aplicativo Laravel com Breeze. É uma ótima maneira de fazer um passeio por tudo que Laravel e Breeze têm a oferecer.

<a name="laravel-breeze-installation"></a>
### Instalação

Primeiro você deve [criar um novo aplicativo Laravel](/docs/{{version}}/installation). Se você criar seu aplicativo usando o [instalador Laravel](/docs/{{version}}/installation#creating-a-laravel-project), durante o processo de instalação você será solicitado a instalar Laravel Breeze. Caso contrário, você precisará seguir as instruções de instalação manual abaixo.

Se você já criou uma nova aplicação Laravel sem um Kit Starter, pode instalar manualmente o Laravel Breeze usando o Composer:

```shell
composer require laravel/breeze --dev
```

Após a instalação do pacote Laravel Breeze pelo Composer, você deve executar o comando `breeze:install` Artisan. Este comando publica as views de autenticação, rotas, controllers e outros recursos para sua aplicação. Laravel Breeze publica todo seu código em sua aplicação para que você tenha controle total sobre seus recursos e implementação.

O comando breeze:install irá solicitar você a escolher sua pilha de interface do usuário preferida e o framework de teste:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

<a name="breeze-and-blade"></a>
### Brisa e Lâmina

A pilha padrão Breeze é a pilha Blade, que utiliza modelos simples [Blade templates](/docs/{{version}}/blade) para renderizar o frontend da sua aplicação. A pilha Blade pode ser instalada invocando o comando `breeze:install` sem nenhum argumento adicional e selecionando a pilha de frontend Blade. Depois da estruturação do Breeze ter sido instalada você também deve compilar os ativos do frontend da sua aplicação:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

Em seguida, você pode navegar para sua aplicação ' / login' ou ' / registrar' URLs em seu navegador da Web. Todas as rotas do Breeze são definidas no arquivo 'routes/auth.php'.

> Nota!
> Para aprender a compilar o CSS e o JavaScript de seu aplicativo Laravel, consulte a documentação do Vite em [Vite documentation](/docs/{{version}}/vite#running-vite).

<a name="breeze-and-livewire"></a>
### Breeze e Livewire

Laravel Breeze também oferece [scaffolding do Livewire](https://livewire.laravel.com). O Livewire é uma maneira poderosa de construir interfaces dinâmicas e reativas apenas usando PHP.

Livewire é um ótimo ajuste para equipes que usam principalmente modelos de lâmina e procuram uma alternativa mais simples para os frameworks SPA impulsionados por JavaScript, como Vue e React.

Para usar o stack Livewire, você pode selecionar a pilha de front-end Livewire quando executar o comando Artisan `breeze:install`. Depois de instalar o esquema do Breeze, você deve executar suas migrações de banco de dados:

```shell
php artisan breeze:install

php artisan migrate
```

<a name="breeze-and-inertia"></a>
### Breeze e React / Vue

Laravel Breeze também oferece estrutura React e Vue via uma implementação [Inertia](https://inertiajs.com) frontend. Inertia permite construir aplicações React modernas e de página única usando o roteamento clássico e o controle dos lados do servidor.

A inércia permite que você aproveite o poder do React e do Vue combinados com a incrível produtividade de back-end do Laravel e compilação [Vite](https://vitejs.dev) lightning-fast. Para usar uma pilha Inertia, você pode selecionar as pilhas front-end do Vue ou do React ao executar o comando Artisan `breeze:install`.

Ao selecionar a pilha Vue ou React, o instalador Breeze também solicitará que você determine se deseja [SSR de Inertia](https://inertiajs.com/server-side-rendering) ou suporte TypeScript. Após a instalação do scaffolding Breeze, você também deve compilar os ativos do frontend do seu aplicativo:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

Em seguida, você navega para os URLs `/login` ou `/register` da sua aplicação no seu navegador da web. Todas as rotas do Breeze estão definidas dentro do arquivo `routes/auth.php`.

<a name="breeze-and-next"></a>
### Breeze e Next.js / API

Laravel Breeze pode criar também uma API de autenticação pronta para autenticar aplicações JavaScript modernas, como aquelas que são alimentadas por Next [Nextjs.org], Nuxt [Nuxt.com] e outros. Para começar, selecione a pilha API desejada ao executar o comando Artisan `breeze:install`:

```shell
php artisan breeze:install

php artisan migrate
```

Durante a instalação, Breeze acrescentará um `FRONTEND_URL` à variável de ambiente do seu arquivo `.env`. Essa URL deve ser a da sua aplicação JavaScript. Normalmente será `http://localhost:3000` durante o desenvolvimento local. Além disso, você deve garantir que sua `APP_URL` esteja configurada para `http://localhost:8000`, que é a URL padrão utilizada pelo comando `serve` do Artisan.

<a name="next-reference-implementation"></a>
#### Implementação de referência do Next.js

Por fim, você está pronto para emparelhar este backend com a interface de usuário do seu front-end favorito. Uma referência de implementação do Next da interface de usuário Breeze está [disponível no GitHub](https://github.com/laravel/breeze-next). Esta interface de usuário é mantida pelo Laravel e contém a mesma interface de usuário do stack Blade tradicional e Inertia fornecido pelo Breeze.

<a name="laravel-jetstream"></a>
## Laravel Jetstream

O Laravel Breeze fornece um ponto de partida simples e mínimo para construir uma aplicação do Laravel, mas o Jetstream complementa a funcionalidade com recursos mais robustos e pilhas tecnológicas front-end adicionais. **Para quem é novo no Laravel, recomendamos aprender as cordas com o Laravel Breeze antes de passar para o Laravel Jetstream.**

O JetStream fornece um framework de aplicativos bem projetado para o Laravel e inclui login, registro, verificação por e-mail, autenticação de dois fatores, gerenciamento de sessões, suporte à API via Laravel Sanctum, além de gerenciamento de equipe opcional. O JetStream é projetado usando [Tailwind CSS](https://tailwindcss.com) e oferece sua escolha entre [Livewire](https://livewire.laravel.com) ou [Inertia](https://inertiajs.com) como front-end scaffolding.

A documentação completa para instalar o Laravel Jetstream pode ser encontrada na [documentação oficial do Jetstream](https://jetstream.laravel.com).
