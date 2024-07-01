# Kits iniciais

## Introdução

Para dar um início rápido na construção de sua nova aplicação Laravel, nós oferecemos kits de autenticação e aplicações iniciais. Estes kits automaticamente mapeiam a aplicação com as rotas, controladores e visualizações que você precisa para registrar e autenticar os usuários da sua aplicação.

Embora você seja bem-vindo(a) ao usar esses kits iniciais, eles não são obrigatórios. Você pode construir seu próprio aplicativo do zero simplesmente instalando uma nova cópia do Laravel. De qualquer maneira, sabemos que você criará algo legal!

## Laravel Breeze

[Laravel Breeze](https://github.com/laravel/breeze) é uma implementação simples e mínima de todos os recursos de autenticação do Laravel, incluindo login, registro, recuperação de senha, verificação de e-mail e confirmação de senha. Além disso, Breeze inclui uma página "perfil" simplificada onde o utilizador pode atualizar o nome, endereço de email e a senha.

A camada de visualização padrão do Laravel Breeze é composta por simples modelos [Blade templates](/docs/blade) com um design do [Tailwind CSS](https://tailwindcss.com). Além disso, o Breeze fornece opções de escopo baseadas no [Livewire](https://livewire.laravel.com) ou no [Inertia](https://inertiajs.com), com a opção de usar Vue ou React para o escopo baseado na Inertia.

<img src="/docs/assets/breeze-register.png">

#### Laravel Bootcamp

Se você é novo no Laravel, experimente o [Laravel Bootcamp](https://bootcamp.laravel.com). O Laravel Bootcamp guiará você na construção da sua primeira aplicação Laravel usando o Breeze. É uma excelente maneira de conhecer todas as ofertas do Laravel e do Breeze.

### Instalação

Primeiro, você deve [criar um novo aplicativo Laravel](/docs/installation). Se você criar seu aplicativo usando o [Instalador do Laravel](/docs/installation), será solicitado a instalar o Breeze durante o processo de instalação. Caso contrário, você precisará seguir as instruções de instalação manualment abaixo.

Se você já criou um novo aplicativo Laravel sem um kit inicial, pode instalar o Laravel Breeze manualmente usando o Composer:

```shell
composer require laravel/breeze --dev
```

Depois que o Composer instalar o pacote de Laravel Breeze, você deve executar o comando `breeze:install` do Artisan. Este comando publica as visualizações de autenticação, roteamento, controladores e outros recursos para seu aplicativo. O Laravel Breeze publica todo o código de sua aplicação, para que você tenha controle total sobre suas funcionalidades e implementações.

O comando `breeze:install` solicitará sua preferência de conjunto do front-end e estrutura de testes:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

### Breeze e Blade

A "pilha" padrão do Breeze é a pilha Blade, que utiliza [modelos Blade](/docs/blade) simples para renderizar o frontend do seu aplicativo. A pilha do Blade pode ser instalada invocando o comando `breeze:install` sem outros argumentos adicionais e selecionando a pilha de frontend do Blade. Após a instalação do scaffolding do Breeze, você também deve compilar os assets de front-end do seu aplicativo:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

Em seguida, você poderá acessar o endereço das suas aplicações em seu navegador da Web. Todas as rotas do Breeze estão definidas no arquivo `routes/auth.php`.

::: info NOTA
Para saber mais sobre como compilar CSS e JavaScript da sua aplicação, confira a [documentação do Vite](/docs/vite#executando-o-vite) do Laravel.
:::

<a name="breeze-and-livewire"></a>
### Breeze e Livewire

O Laravel Breeze também oferece escopo [Livewire](https://livewire.laravel.com). Ele permite que você crie UI dinâmicas e interativas usando apenas o código em PHP.

O LiveWire é uma excelente escolha para equipes que utilizam, principalmente, os modelos do Blade e procuram uma alternativa mais simples aos frameworks de SPA impulsionados por JavaScript, como o Vue e o React.

Para utilizar a pilha Livewire, você pode selecionar a Livewire front-end stack ao executar o comando Artisan `breeze:install`. Após instalado o framework Breeze, você deve rodar suas migrações de base de dados.

```shell
php artisan breeze:install

php artisan migrate
```

### Breeze e o React/Vue

O Laravel Breeze também oferece escopo de trabalho para o React e o Vue através de uma implementação de frontend [Inertia](https://inertiajs.com). A Inertia permite que você crie aplicações modernas para páginas únicas do React e do Vue usando roteamento clássico no lado do servidor e controladores.

O Inertia permite utilizar o poder do front-end dos frameworks React e Vue combinado com a produtividade incrível do backend da Laravel, além de uma compilação rápida, graças ao [Vite](https://vitejs.dev). Para utilizar a pilha Inertia, você pode selecionar as pilhas front-end do Vue ou do React ao executar o comando Artisan `breeze:install`.

Ao selecionar a pilha Vue ou React do frontend, o instalador Breeze também irá perguntar se pretende suportar o [Inertia SSR](https://inertiajs.com/server-side-rendering) ou TypeScript. Depois de instalado o framework do Breeze, recomenda-se compilar os ativos do frontend da aplicação:

```shell
php artisan breeze:install

php artisan migrate
npm install
npm run dev
```

Em seguida, você pode navegar para as URLs de `/login` ou `/register` do seu aplicativo no navegador da Web. Todos os caminhos da Breeze estão definidos na arquivo `routes/auth.php`.

### Breeze e Next.js/API

O Laravel Breeze também permite criar uma autenticação API pronta para aplicativos de JavaScript modernos, tais como os que utilizam [Next](https://nextjs.org), [Nuxt](https://nuxt.com) e outros. Para começar, escolha a pilha API como a pilha desejada ao executar o comando Artisan `breeze:install`:

```shell
php artisan breeze:install

php artisan migrate
```

Durante a instalação, o Breeze adiciona uma variável de ambiente `FRONTEND_URL` ao arquivo `.env` da sua aplicação. Este URL deve ser o URL da sua aplicação JavaScript. Normalmente, durante o desenvolvimento local, esse URL é `http://localhost:3000`. Além disso, você deve garantir que o seu `APP_URL` seja definido como `http://localhost:8000`, que é o URL padrão usado pelo comando `serve` do Artisan.

#### Implementação de Referência do Next.js

Por último, você estará pronto para combinar este servidor com a parte front-end da sua escolha. Uma referência de implementação do Next está disponível no [GitHub](https://github.com/laravel/breeze-next). Este frontend é mantido pelo Laravel e contém a mesma interface como a tradicional pilha Blade e Inertia fornecidos pelo Breeze.

## Laravel Jetstream

Embora o Laravel Breeze ofereça um ponto de partida simples e mínimo para a construção de uma aplicação Laravel, o Jetstream aumenta essas funcionalidades com recursos mais robustos e pilhas adicionais de tecnologia frontend. **Aqueles que estão começando agora com o Laravel, recomendamos aprender as noções básicas com o Laravel Breeze antes de passar ao Laravel Jetstream**.

O Jetstream fornece um excelente projeto de aplicativo para Laravel e inclui login, registro, verificação de correio eletrônico, autenticação em dois fatores, gestão de sessões, suporte a API através do Laravel Sanctum e gerenciamento de equipes opcionais. O Jetstream foi concebido utilizando [Tailwind CSS](https://tailwindcss.com) e oferece uma escolha entre um frontend de base com Livewire ou Inertia.

Documentação completa para instalar o Laravel Jetstream pode ser encontrada na [documentação oficial do Jetstream](https://jetstream.laravel.com).
