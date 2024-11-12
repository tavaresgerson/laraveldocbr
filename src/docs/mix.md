# Laravel Mix

<a name="introduction"></a>
## Introdução

[Laravel Mix](https://github.com/laravel-mix/laravel-mix), um pacote desenvolvido pelo criador do [Laracasts](https://laracasts.com) Jeffrey Way, fornece uma API fluente para definir etapas de construção do [webpack](https://webpack.js.org) para seu aplicativo Laravel usando vários pré-processadores CSS e JavaScript comuns.

Em outras palavras, o Mix torna fácil compilar e minimizar os arquivos CSS e JavaScript do seu aplicativo. Por meio de encadeamento de métodos simples, você pode definir fluentemente seu pipeline de ativos. Por exemplo:

```js
mix.js('resources/js/app.js', 'public/js')
.postCss('resources/css/app.css', 'public/css');
```

Se você já ficou confuso e sobrecarregado sobre como começar com o webpack e a compilação de ativos, você vai adorar o Laravel Mix. No entanto, você não é obrigado a usá-lo ao desenvolver seu aplicativo; você é livre para usar qualquer ferramenta de pipeline de ativos que desejar, ou até mesmo nenhuma.

::: info NOTA
O Vite substituiu o Laravel Mix em novas instalações do Laravel. Para a documentação do Mix, visite o site [oficial do Laravel Mix](https://laravel-mix.com/). Se você quiser mudar para o Vite, consulte nosso [guia de migração do Vite](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite).
:::
