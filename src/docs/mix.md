# Laravel Mix

<a name="introduction"></a>
## Introdução

 [Laravel Mix](https://github.com/laravel-mix/laravel-mix), um pacote desenvolvido pelo criador do Laracasts ([Laracasts](https://laracasts.com) Jeffrey Way), fornece uma API fluente para a definição de etapas de construção [do webpack](https://webpack.js.org) para sua aplicação Laravel usando vários processadores comuns de CSS e JavaScript.

 Em outras palavras, o Mix facilita a compilação e minificação de arquivos CSS e JavaScript da aplicação. Através de um método simples, você pode definir seu pipeline de ativos com fluidez, por exemplo:

```js
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css');
```

 Se você já ficou confuso e incomodado com o uso do webpack para compilação de recursos (assets), vai adorar o Laravel Mix. No entanto, não é obrigatório utilizá-lo ao desenvolver a aplicação; você pode usar qualquer outro mecanismo ou até mesmo nenhum para esse fim.

 > [!ATENÇÃO]
 [Guia Oficial do Laravel Mix](https://laravel-mix.com/). Se você deseja mudar para o Vite, por favor consulte nossa
