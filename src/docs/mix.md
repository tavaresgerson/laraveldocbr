# Laravel Mix

<a name="introduction"></a>
## Introdução

O [Laravel Mix](https://github.com/laravel-mix/laravel-mix), um pacote criado pelo criador do [Laracasts](https://laracasts.com), Jeffrey Way, fornece uma API fluida para definir as etapas de construção do [webpack](https://webpack.js.org) em seu aplicativo Laravel utilizando diversos pré-processadores CSS e JavaScript comuns.

Em outras palavras, o Mix facilita para você compilar e minimizar os arquivos CSS e JavaScript da sua aplicação. Através de métodos encadeados simples, você pode definir facilmente a sua linha de produção de ativos. Por exemplo:

```js
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css');
```

Se você já foi confuso e sobrecarregado em relação a começar com webpack e compilação de ativos, você vai adorar o Laravel Mix. No entanto, você não precisa usá-lo enquanto desenvolve seu aplicativo; você é livre para usar qualquer ferramenta de pipeline de ativos que desejar ou até mesmo nenhuma.

> [NOTA]
> O Vite substituiu o Laravel Mix em novas instalações do Laravel. Para documentação do Mix, visite o site [oficial do Laravel Mix](https://laravel-mix.com/). Se você gostaria de trocar para o Vite, veja a nossa  [guia de migração do Vite](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite).
