# Kits iniciais

<a name="introduction"></a>
## Introdução

Para dar a você uma vantagem inicial na construção de seu novo aplicativo Laravel, temos o prazer de oferecer kits iniciais de autenticação e aplicativo. Esses kits automaticamente estruturam seu aplicativo com as rotas, controladores e visualizações necessárias para registrar e autenticar os usuários do seu aplicativo.

Embora você possa usar esses kits iniciais, eles não são obrigatórios. Você é livre para construir seu próprio aplicativo do zero, simplesmente instalando uma cópia nova do Laravel. De qualquer forma, sabemos que você construirá algo ótimo!

<a name="laravel-breeze"></a>
## Laravel Breeze

[Laravel Breeze](https://github.com/laravel/breeze) é uma implementação mínima e simples de todos os [recursos de autenticação](/docs/authentication) do Laravel, incluindo login, registro, redefinição de senha, verificação de e-mail e confirmação de senha. Além disso, o Breeze inclui uma página de "perfil" simples onde o usuário pode atualizar seu nome, endereço de e-mail e senha.

A camada de visualização padrão do Laravel Breeze é composta de [modelos Blade](/docs/blade) simples estilizados com [Tailwind CSS](https://tailwindcss.com). Além disso, o Breeze fornece opções de andaimes baseadas em [Livewire](https://livewire.laravel.com) ou [Inertia](https://inertiajs.com), com a opção de usar Vue ou React para o andaime baseado em Inertia.

<img src="https://laravel.com/img/docs/breeze-register.png">

#### Laravel Bootcamp

Se você é novo no Laravel, sinta-se à vontade para pular para o [Laravel Bootcamp](https://bootcamp.laravel.com). O Laravel Bootcamp o guiará pela construção do seu primeiro aplicativo Laravel usando o Breeze. É uma ótima maneira de fazer um tour por tudo o que o Laravel e o Breeze têm a oferecer.

<a name="laravel-breeze-installation"></a>
### Instalação

Primeiro, você deve [criar um novo aplicativo Laravel](/docs/installation). Se você criar seu aplicativo usando o [instalador Laravel](/docs/installation#creating-a-laravel-project), você será solicitado a instalar o Laravel Breeze durante o processo de instalação. Caso contrário, você precisará seguir as instruções de instalação manual abaixo.

Se você já criou um novo aplicativo Laravel sem um kit inicial, você pode instalar manualmente o Laravel Breeze usando o Composer:

```shell
composer require laravel/breeze --dev
```

Após o Composer instalar o pacote Laravel Breeze, você deve executar o comando Artisan `breeze:install`. Este comando publica as visualizações de autenticação, rotas, controladores e outros recursos para seu aplicativo. O Laravel Breeze publica todo o seu código para seu aplicativo para que você tenha controle total e visibilidade sobre seus recursos e implementação.

O comando `breeze:install` solicitará sua pilha de frontend e estrutura de teste preferidas:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

<a name="breeze-and-blade"></a>
### Breeze e Blade

A "pilha" padrão do Breeze é a pilha Blade, que utiliza [modelos Blade](/docs/blade) simples para renderizar o frontend do seu aplicativo. A pilha Blade pode ser instalada invocando o comando `breeze:install` sem outros argumentos adicionais e selecionando a pilha de frontend Blade. Após a instalação do scaffolding do Breeze, você também deve compilar os ativos de frontend do seu aplicativo:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

Em seguida, você pode navegar até as URLs `/login` ou `/register` do seu aplicativo no seu navegador da web. Todas as rotas do Breeze são definidas no arquivo `routes/auth.php`.

::: info NOTA
Para saber mais sobre como compilar o CSS e o JavaScript do seu aplicativo, confira a [documentação do Vite](/docs/vite#running-vite) do Laravel.
:::

<a name="breeze-and-livewire"></a>
### Breeze e Livewire

O Laravel Breeze também oferece [Livewire](https://livewire.laravel.com) scaffolding. O Livewire é uma maneira poderosa de construir UIs front-end dinâmicas e reativas usando apenas PHP.

O Livewire é uma ótima opção para equipes que usam principalmente modelos Blade e estão procurando uma alternativa mais simples para estruturas SPA orientadas a JavaScript, como Vue e React.

Para usar a pilha Livewire, você pode selecionar a pilha frontend Livewire ao executar o comando Artisan `breeze:install`. Após a instalação do scaffolding do Breeze, você deve executar suas migrações de banco de dados:

```shell
php artisan breeze:install

php artisan migrate
```

<a name="breeze-and-inertia"></a>
### Breeze e React / Vue

O Laravel Breeze também oferece scaffolding React e Vue por meio de uma implementação de frontend [Inertia](https://inertiajs.com). O Inertia permite que você crie aplicativos React e Vue modernos de página única usando roteamento e controladores clássicos do lado do servidor.

O Inertia permite que você aproveite o poder do frontend do React e do Vue combinado com a incrível produtividade do backend do Laravel e a compilação rápida do [Vite](https://vitejs.dev). Para usar uma pilha Inertia, você pode selecionar as pilhas de frontend Vue ou React ao executar o comando Artisan `breeze:install`.

Ao selecionar a pilha de frontend Vue ou React, o instalador do Breeze também solicitará que você determine se deseja suporte a [Inertia SSR](https://inertiajs.com/server-side-rendering) ou TypeScript. Após a instalação do scaffolding do Breeze, você também deve compilar os ativos de frontend do seu aplicativo:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

Em seguida, você pode navegar até as URLs `/login` ou `/register` do seu aplicativo no seu navegador da web. Todas as rotas do Breeze são definidas no arquivo `routes/auth.php`.

<a name="breeze-and-next"></a>
### Breeze e Next.js / API

O Laravel Breeze também pode criar uma API de autenticação pronta para autenticar aplicativos JavaScript modernos, como os alimentados por [Next](https://nextjs.org), [Nuxt](https://nuxt.com) e outros. Para começar, selecione a pilha de API como sua pilha desejada ao executar o comando Artisan `breeze:install`:

```shell
php artisan breeze:install

php artisan migrate
```

Durante a instalação, o Breeze adicionará uma variável de ambiente `FRONTEND_URL` ao arquivo `.env` do seu aplicativo. Esta URL deve ser a URL do seu aplicativo JavaScript. Normalmente será `http://localhost:3000` durante o desenvolvimento local. Além disso, você deve garantir que seu `APP_URL` esteja definido como `http://localhost:8000`, que é a URL padrão usada pelo comando Artisan `serve`.

<a name="next-reference-implementation"></a>
#### Implementação de referência Next.js

Finalmente, você está pronto para parear este backend com o frontend de sua escolha. Uma implementação de referência Next do frontend Breeze está [disponível no GitHub](https://github.com/laravel/breeze-next). Este frontend é mantido pelo Laravel e contém a mesma interface de usuário que as pilhas Blade e Inertia tradicionais fornecidas pelo Breeze.

<a name="laravel-jetstream"></a>
## Laravel Jetstream

Enquanto o Laravel Breeze fornece um ponto de partida simples e mínimo para construir um aplicativo Laravel, o Jetstream aumenta essa funcionalidade com recursos mais robustos e pilhas de tecnologia de frontend adicionais. **Para aqueles que são novos no Laravel, recomendamos aprender as manhas com o Laravel Breeze antes de graduar para o Laravel Jetstream.**

O Jetstream fornece um andaime de aplicativo lindamente projetado para o Laravel e inclui login, registro, verificação de e-mail, autenticação de dois fatores, gerenciamento de sessão, suporte de API via Laravel Sanctum e gerenciamento de equipe opcional. O Jetstream é projetado usando [Tailwind CSS](https://tailwindcss.com) e oferece sua escolha de andaimes frontend [Livewire](https://livewire.laravel.com) ou [Inertia](https://inertiajs.com).

A documentação completa para instalar o Laravel Jetstream pode ser encontrada na [documentação oficial do Jetstream](https://jetstream.laravel.com).
