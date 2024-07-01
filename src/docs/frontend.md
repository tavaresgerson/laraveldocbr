# Frontend

## Introdução

O Laravel é um framework de back-end que disponibiliza todas as características necessárias para criar aplicações web modernas, tais como roteamento [routing](/docs/routing), validação [validation](/docs/validation), armazenamento temporário [caching](/docs/cache), fila de tarefas [queues](/docs/queues), armazenamento de ficheiros [filesystem] e muito mais. Acreditamos, no entanto, que é importante oferecer aos desenvolvedores uma experiência completa, incluindo abordagens poderosas para a construção do front-end da aplicação.

Existem dois métodos principais para desenvolver o front-end ao construir uma aplicação com Laravel, e a abordagem escolhida dependerá se você quer criar seu front-end utilizando PHP ou frameworks JavaScript como Vue e React. Abaixo, discutiremos essas duas opções para que você possa tomar uma decisão informada sobre qual é o melhor método de desenvolvimento do front-end para sua aplicação.

## Usando o PHP

### PHP e Blade

No passado, a maioria dos aplicativos em PHP gerava HTML para o navegador utilizando simples modelos HTML intercalados com declarações `echo` do PHP que renderizavam dados obtidos de uma base de dados durante o pedido.

```php
<div>
    <?php foreach ($users as $user): ?>
        Hello, <?php echo $user->name; ?> <br />
    <?php endforeach; ?>
</div>
```

No Laravel, a abordagem de renderização HTML continua disponível através das [visualizações](/docs/views) e do Blade. O Blade é uma linguagem de templates extremamente leve que inclui uma sintaxe curta para exibição de dados, iteração sobre os mesmos e muito mais:

```blade
<div>
    @foreach ($users as $user)
        Hello, {{ $user->name }} <br />
    @endforeach
</div>
```

Ao construir aplicações desta forma, os formulários de submissão e outras interações da página normalmente recebem um novo documento HTML do servidor e toda a página é re-renderizada pelo navegador. Até hoje, muitas aplicações podem ser perfeitamente adequadas ao uso de templates simples Blade para construir seus frontends desta maneira.

#### Crescentes expectativas

No entanto, como as expectativas dos usuários em relação a aplicações web amadureceram, muitos programadores sentiram a necessidade de criar interfaces mais dinâmicas e interações com um aspeto mais sofisticado. Por conseguinte, alguns programadores optaram por iniciar o desenvolvimento da interface do seu aplicativo utilizando frameworks JavaScript como Vue e React.

Outros, que preferem utilizar a linguagem do backend com a qual estão familiarizados, desenvolveram soluções que permitem construir UIs de aplicações web modernas, enquanto ainda usam principalmente a sua linguagem de backend escolhida. Por exemplo, no ecossistema [Rails](https://rubyonrails.org/) isto tem estimulado a criação de bibliotecas como [Turbo](https://turbo.hotwired.dev/), [Hotwire](https://hotwired.dev/) e [Stimulus](https://stimulus.hotwired.dev/).

No ecossistema Laravel, a necessidade de criar front-end modernos e dinâmicos com o uso principal do PHP levou à criação do [Laravel Livewire](https://livewire.laravel.com) e [Alpine.js](https://alpinejs.dev/).

### Livewire

[Laravel Livewire](https://livewire.laravel.com) é um framework para construção de Frontend com Laravel que parecem dinâmicos, modernos e vivos, assim como os Frontend construídos com os modernos frameworks JavaScript como Vue e React.

Ao usar o Livewire, você criará "componentes" do Livewire que renderizarão uma parte discreta de sua interface gráfica e irá expor métodos e dados que podem ser invocados e interagidos com no frontend de seu aplicativo. Por exemplo, um simples "Counter" poderia ficar assim:

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;

class Counter extends Component
{
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }

    public function render()
    {
        return view('livewire.counter');
    }
}
```

E, o modelo correspondente para a contagem seria escrito assim:

```blade
<div>
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>
```

Como você pode ver, o Livewire permite que você escreva novos atributos HTML, como `wire:click`, que conectam a interface do usuário e o backend da sua aplicação Laravel. Além disso, é possível renderizar o estado atual de seu componente usando expressões simples Blade.

Para muitos, o Livewire revolucionou o desenvolvimento de frente com Laravel, permitindo que permaneçam no conforto do Laravel enquanto constroem aplicações da web dinâmicas e modernas. Normalmente, os programadores que utilizam o Livewire também utiliza [Alpine.js](https://alpinejs.dev/) para "espalhar" JavaScript apenas onde for necessário no frontend, por exemplo, para renderizar uma janela de diálogo.

Se você é novo no Laravel, recomendamos se familiarizar com o uso básico de [Visualizações](/docs/views) e [Blade](/docs/blade). Em seguida, consulte a documentação oficial do Laravel Livewire para saber como levar seu aplicativo ao próximo nível com componentes interativos de Livewire.

### Kits de Iniciação

Se você deseja criar seu front-end usando PHP e o Livewire, pode utilizar nossos Breeze ou Jetstream com o [pacotes de iniciação (starter kits)](/docs/starter-kits) para começar o desenvolvimento da aplicação. Esses pacotes fornecem a estrutura para o backend e frontend da aplicação usando [Blade](/docs/blade) e [Tailwind](https://tailwindcss.com), permitindo que você inicie a criação de sua próxima grande ideia.

## Usando o Vue/React

Embora seja possível construir front-ends modernos usando Laravel e Livewire, muitos desenvolvedores ainda preferem aproveitar a força de um framework JavaScript como Vue ou React. Isso permite que os desenvolvedores se beneficiem do rico ecossistema de pacotes e ferramentas disponíveis no NPM.

No entanto, sem ferramentas adicionais, combinar o Laravel com Vue ou React nos deixaria diante de vários problemas complicados, como encaminhamento no lado do cliente, hidratação e autenticação de dados. O encaminhamento no lado do cliente é frequentemente simplificado através da utilização de estruturas Vue / React opiniativas, tais como [Nuxt](https://nuxt.com/) e [Next](https://nextjs.org/); contudo, a hidratação e autenticação de dados continuam sendo problemas complicados e onerosos quando combinamos um framework back-end, como o Laravel, com esses frameworks front-end.

Além disso, os desenvolvedores são obrigados a manter dois repositórios de código separados, frequentemente precisando coordenar manutenção, versões e implantações em ambos os repositórios. Embora esses problemas não sejam insuperáveis, não cremos que seja uma forma produtiva ou prazerosa para desenvolver aplicações.

### Inércia

Felizmente, o Laravel oferece o melhor dos dois mundos. O [Inertia](https://inertiajs.com) preenche a lacuna entre seu aplicativo do Laravel e seu frontend moderno Vue ou React, permitindo que você crie um frontend completo e moderno usando Vue ou React enquanto aproveita as rotas e controladores do Laravel para roteamento, hidratação de dados e autenticação — tudo dentro de um único repositório de código. Com essa abordagem, você poderá desfrutar do poder total tanto da ferramenta Laravel quanto da Vue/React sem restringir as capacidades das ferramentas.

Depois de instalar o Inertia em seu aplicativo Laravel, você escreverá rotas e controladores como normalmente faria, porém, ao invés de retornar um modelo do Blade no controleador, você retornará uma página do Inertia:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Mostrar o perfil de um determinado usuário.
     */
    public function show(string $id): Response
    {
        return Inertia::render('Users/Profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

Uma página Inertia corresponde a um componente Vue ou React, normalmente armazenado na pasta `resources/js/Pages` da sua aplicação. Os dados fornecidos à página através do método `Inertia::render` serão utilizados para "hidratar" os componentes da página:

```vue
<script setup>
import Layout from '@/Layouts/Authenticated.vue';
import { Head } from '@inertiajs/vue3';

const props = defineProps(['user']);
</script>

<template>
    <Head title="User Profile" />

    <Layout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                Profile
            </h2>
        </template>

        <div class="py-12">
            Hello, {{ user.name }}
        </div>
    </Layout>
</template>
```

Como você pode ver, o Inertia permite que você alavanque todo o poder do Vue ou do React ao construir seu frontend, proporcionando, ao mesmo tempo, uma ponte leve entre seu backend com base em Laravel e seu frontend com base em JavaScript.

#### Impressão no lado do servidor

Se você está preocupado com o uso do Inertia porque sua aplicação requer renderização do lado do servidor, não se preocupe. O Inertia oferece [suporte a renderização no lado do servidor](https://inertiajs.com/server-side-rendering). E, ao implantar sua aplicação por meio do [Laravel Forge](https://forge.laravel.com), é fácil garantir que o processo de renderização no lado do servidor do Inertia esteja sempre funcionando.

### Kits iniciais

Se pretender construir a sua interface de utilizador usando a Inertia e o Vue/React, pode tirar partido dos nossos kits iniciais: Breeze ou Jetstream para acelerar o desenvolvimento da sua aplicação. Ambos os kits iniciais ajudam-no a montar o backend e a autenticação da interface de utilizador da aplicação com a Inertia, Vue/React, Tailwind e Vite para que possa começar a criar a próxima grande ideia.

## Agrupamento de Ativos

Independentemente de você escolher desenvolver o seu front-end utilizando Blade e Livewire ou Vue/React e Inertia, é provável que precise agrupar os CSS da aplicação em assets preparados para produção. Claro, se optar por criar a interface do usuário da sua aplicação com Vue ou React, também precisará agrupar seus componentes em assets de JavaScript prontos para o navegador.

Por padrão, o Laravel utiliza [Vite](https://vitejs.dev) para agrupar seus assets. O Vite proporciona um tempo de compilação rápido e uma substituição instantânea dos módulos durante o desenvolvimento local (HMR). Em todas as novas aplicações do Laravel, incluindo aquelas usando os nossos [kits iniciais](/docs/starter-kits), você encontrará um arquivo `vite.config.js` que carrega nosso leve plugin Vite do Laravel, o que torna o Vite uma experiência gratificante ao ser usado com aplicações do Laravel.

A maneira mais rápida de começar a trabalhar com Laravel e Vite é iniciar o desenvolvimento do seu aplicativo usando [Laravel Breeze](/docs/starter-kits#laravel-breeze), nosso kit inicial mais simples, que ajuda a criar seu aplicativo fornecendo um modelo de autenticação no frontend e backend.

::: info NOTA
Para documentação mais detalhada sobre a utilização do Vite com Laravel, consulte nossa [documentação dedicada sobre agrupamento e compilação de seus assets](/docs/vite).
:::
