import{_ as e,c as a,o,a4 as r}from"./chunks/framework.nQaBHiNx.js";const h=JSON.parse('{"title":"Atualização rápida","description":"","frontmatter":{},"headers":[],"relativePath":"docs/fast-refresh.md","filePath":"docs/fast-refresh.md"}'),s={name:"docs/fast-refresh.md"},t=r('<h1 id="atualizacao-rapida" tabindex="-1">Atualização rápida <a class="header-anchor" href="#atualizacao-rapida" aria-label="Permalink to &quot;Atualização rápida&quot;">​</a></h1><p>Fast Refresh é um recurso do React Native que permite obter feedback quase instantâneo sobre alterações em seus componentes React. A atualização rápida está habilitada por padrão e você pode alternar &quot;Enable Fast Refresh&quot; no <a href="/docs/debugging.html">menu React Native Dev</a>. Com a Atualização rápida ativada, a maioria das edições deve ficar visível em um ou dois segundos.</p><h2 id="como-funciona" tabindex="-1">Como funciona <a class="header-anchor" href="#como-funciona" aria-label="Permalink to &quot;Como funciona&quot;">​</a></h2><ul><li>Se você editar um módulo que exporta apenas componentes React, o Fast Refresh atualizará o código apenas para esse módulo e renderizará novamente seu componente. Você pode editar qualquer coisa nesse arquivo, incluindo estilos, lógica de renderização, manipuladores de eventos ou efeitos.</li><li>Se você editar um módulo com exportações que não sejam componentes do React, o Fast Refresh executará novamente esse módulo e os outros módulos que o importam. Portanto, se <code>Button.js</code> e <code>Modal.js</code> importarem <code>Theme.js</code>, a edição de <code>Theme.js</code> atualizará ambos os componentes.</li><li>Finalmente, se você editar um arquivo importado por módulos fora da árvore React, o Fast Refresh voltará a fazer uma recarga completa. Você pode ter um arquivo que renderiza um componente React, mas também exporta um valor que é importado por um componente não React. Por exemplo, talvez seu componente também exporte uma constante e um módulo utilitário não React a importe. Nesse caso, considere migrar a constante para um arquivo separado e importá-la para ambos os arquivos. Isso reativará o funcionamento do Fast Refresh. Outros casos geralmente podem ser resolvidos de maneira semelhante.</li></ul><h2 id="resiliencia-a-erros" tabindex="-1">Resiliência a erros <a class="header-anchor" href="#resiliencia-a-erros" aria-label="Permalink to &quot;Resiliência a erros&quot;">​</a></h2><p>Se você cometer um erro de sintaxe durante uma sessão de atualização rápida, poderá corrigi-lo e salvar o arquivo novamente. A caixa vermelha desaparecerá. Módulos com erros de sintaxe são impedidos de serem executados, portanto você não precisará recarregar o aplicativo.</p><p>Se você cometer um erro de tempo de execução durante a inicialização do módulo (por exemplo, digitando <code>Style.create</code> em vez de <code>StyleSheet.create</code>), a sessão de atualização rápida continuará depois que o erro for corrigido. A caixa vermelha desaparecerá e o módulo será atualizado.</p><p>Se você cometer um erro que leve a um erro de tempo de execução dentro do seu componente, a sessão de atualização rápida também continuará após a correção do erro. Nesse caso, o React remontará seu aplicativo usando o código atualizado.</p><p>Se você tiver <a href="https://reactjs.org/docs/error-boundaries.html" target="_blank" rel="noreferrer">limites de erro</a> em seu aplicativo (o que é uma boa ideia para falhas normais na produção), eles tentarão renderizar novamente na próxima edição após uma caixa vermelha. Nesse sentido, ter um limite de erro pode impedir que você seja sempre expulso da tela raiz do aplicativo. No entanto, lembre-se de que os limites de erro não devem ser muito granulares. Eles são usados pelo React em produção e devem sempre ser projetados intencionalmente.</p><h2 id="limitacoes" tabindex="-1">Limitações <a class="header-anchor" href="#limitacoes" aria-label="Permalink to &quot;Limitações&quot;">​</a></h2><p>O Fast Refresh tenta preservar o estado React local no componente que você está editando, mas somente se for seguro fazê-lo. Aqui estão alguns motivos pelos quais você pode ver o estado local sendo redefinido a cada edição de um arquivo:</p><ul><li>O estado local não é preservado para componentes de classe (apenas componentes de função e Hooks preservam o estado).</li><li>O módulo que você está editando pode ter outras exportações além de um componente React.</li><li>Às vezes, um módulo exportaria o resultado da chamada de um componente de ordem superior como <code>createNavigationContainer(MyScreen)</code>. Se o componente retornado for uma classe, o estado será redefinido.</li></ul><p>No longo prazo, à medida que mais da sua base de código se move para componentes de função e ganchos, você pode esperar que o estado seja preservado em mais casos.</p><h2 id="dicas" tabindex="-1">Dicas <a class="header-anchor" href="#dicas" aria-label="Permalink to &quot;Dicas&quot;">​</a></h2><ul><li>A atualização rápida preserva o estado local do React nos componentes de função (e hooks) por padrão.</li><li>Às vezes, você pode querer forçar a redefinição do estado e a remontagem de um componente. Por exemplo, isso pode ser útil se você estiver ajustando uma animação que só acontece na montagem. Para fazer isso, você pode adicionar <code>// @refresh reset</code> em qualquer lugar do arquivo que está editando. Esta diretiva é local para o arquivo e instrui o Fast Refresh a remontar os componentes definidos nesse arquivo em cada edição.</li></ul><h2 id="atualizacao-rapida-e-ganchos" tabindex="-1">Atualização rápida e ganchos <a class="header-anchor" href="#atualizacao-rapida-e-ganchos" aria-label="Permalink to &quot;Atualização rápida e ganchos&quot;">​</a></h2><p>Quando possível, a Atualização Rápida tenta preservar o estado do seu componente entre as edições. Em particular, useState e useRef preservam seus valores anteriores, desde que você não altere seus argumentos ou a ordem das chamadas do Hook.</p><p>Ganchos com dependências — como <code>useEffect</code>, <code>useMemo</code> e <code>useCallback</code> — sempre serão atualizados durante o Fast Refresh. Sua lista de dependências será ignorada enquanto a atualização rápida estiver acontecendo.</p><p>Por exemplo, quando você edita <code>useMemo(() =&gt; x * 2, [x])</code> para <code>useMemo(() =&gt; x * 10, [x])</code>, ele será executado novamente mesmo que <code>x</code> (a dependência) não tenha mudado. Se o React não fizesse isso, sua edição não seria refletida na tela!</p><p>Às vezes, isso pode levar a resultados inesperados. Por exemplo, mesmo um <code>useEffect</code> com uma matriz vazia de dependências ainda seria executado novamente uma vez durante a Atualização Rápida. No entanto, escrever código resiliente a uma nova execução ocasional de <code>useEffect</code> é uma boa prática, mesmo sem o Fast Refresh. Isso torna mais fácil para você introduzir posteriormente novas dependências nele.</p>',20),i=[t];function d(n,c,u,m,l,p){return o(),a("div",null,i)}const f=e(s,[["render",d]]);export{h as __pageData,f as default};
