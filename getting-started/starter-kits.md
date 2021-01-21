# Kits Iniciais

## Introdução
Para lhe dar uma vantagem inicial na construção de seu novo aplicativo Laravel, estamos felizes em oferecer autenticação e kits iniciais 
de aplicativo. Esses kits estruturam automaticamente seu aplicativo com as rotas, controladores e visualizações de que você precisa para 
registrar e autenticar os usuários de seu aplicativo.

Embora você possa usar esses kits iniciais, eles não são obrigatórios. Você é livre para construir seu próprio aplicativo do zero, simplesmente 
instalando uma nova cópia do Laravel. De qualquer forma, sabemos que você construirá algo incrível!

## Laravel Breeze
Laravel Breeze é uma implementação mínima e simples de todos os recursos de autenticação do Laravel, incluindo login, registro, redefinição de senha, 
verificação de e-mail e confirmação de senha. A camada de visão do Laravel Breeze é composta de modelos Blade simples estilizados com CSS do Tailwind. 
O Breeze oferece um excelente ponto de partida para iniciar um novo aplicativo do Laravel.

### Instalação
Primeiro, você deve criar um novo aplicativo Laravel, configurar seu banco de dados e executar as migrações de banco de dados:

```bash
curl -s https://laravel.build/example-app | bash

cd example-app

php artisan migrate
```

Depois de criar um novo aplicativo Laravel, você pode instalar o Laravel Breeze usando o Composer:

```bash
composer require laravel/breeze --dev
```

Após o Composer instalar o pacote Laravel Breeze, você pode executar o comando Artisan `breeze:install`. Este comando publica as visualizações 
de autenticação, rotas, controladores e outros recursos para seu aplicativo. O Laravel Breeze publica todo o seu código em sua aplicação para 
que você tenha total controle e visibilidade sobre seus recursos e implementação. Após a instalação do Breeze, você também deve compilar seus assets 
para que o arquivo CSS do seu aplicativo esteja disponível:

```
php artisan breeze:install

npm install

npm run dev
```

Em seguida, você pode navegar no seu aplicativo para `/login` ou `/register`. Todas as rotas do Breeze são definidas no arquivo `routes/auth.php`.


> Para aprender mais sobre como compilar CSS e JavaScript de seu aplicativo, verifique a 
> [documentação](https://laravel.com/docs/8.x/mix#running-mix) do Laravel Mix.

## Laravel Jetstream
Enquanto o Laravel Breeze oferece um ponto de partida simples e mínimo para a construção de um aplicativo Laravel, o Jetstream aumenta essa 
funcionalidade com recursos mais robustos e pilhas de tecnologia front-end adicionais. Para aqueles que são novos no Laravel, recomendamos 
aprender o Laravel Breeze antes de se formar no Laravel Jetstream.

O Jetstream oferece uma estrutura de aplicação lindamente projetada para o Laravel e inclui login, registro, verificação de e-mail, autenticação 
de dois fatores, gerenciamento de sessão, suporte de API via Laravel Sanctum e gerenciamento de equipe opcional. O Jetstream é projetado usando 
Tailwind CSS e oferece sua escolha de estrutura de front-end acionada por [Livewire](https://laravel-livewire.com/) ou [Inertia.js](https://inertiajs.com/).

A documentação completa para instalar o Laravel Jetstream pode ser encontrada 
no site [oficial do Jetstream](https://jetstream.laravel.com/2.x/introduction.html).
