import{_ as a,c as i,o as s,a4 as e}from"./chunks/framework.nQaBHiNx.js";const u=JSON.parse('{"title":"Comunicação entre nativo e React Native","description":"","frontmatter":{},"headers":[],"relativePath":"docs/communication-ios.md","filePath":"docs/communication-ios.md"}'),o={name:"docs/communication-ios.md"},t=e(`<h1 id="comunicacao-entre-nativo-e-react-native" tabindex="-1">Comunicação entre nativo e React Native <a class="header-anchor" href="#comunicacao-entre-nativo-e-react-native" aria-label="Permalink to &quot;Comunicação entre nativo e React Native&quot;">​</a></h1><p>Em [Guia de integração com aplicativos existentes](integração com aplicativos existentes) e <a href="/docs/native-components-ios.html">Guia de componentes de UI nativos</a> aprendemos como incorporar o React Native em um componente nativo e vice-versa. Quando misturamos componentes nativos e React Native, eventualmente encontraremos a necessidade de comunicação entre esses dois mundos. Algumas maneiras de conseguir isso já foram mencionadas em outros guias. Este artigo resume as técnicas disponíveis.</p><h2 id="introducao" tabindex="-1">Introdução <a class="header-anchor" href="#introducao" aria-label="Permalink to &quot;Introdução&quot;">​</a></h2><p>O React Native é inspirado no React, então a ideia básica do fluxo de informações é semelhante. O fluxo no React é unidirecional. Mantemos uma hierarquia de componentes, na qual cada componente depende apenas de seu pai e de seu próprio estado interno. Fazemos isso com propriedades: os dados são passados ​​de um pai para seus filhos de cima para baixo. Se um componente ancestral depende do estado de seu descendente, deve-se transmitir um retorno de chamada a ser usado pelo descendente para atualizar o ancestral.</p><p>O mesmo conceito se aplica ao React Native. Contanto que estejamos construindo nosso aplicativo exclusivamente dentro da estrutura, podemos direcioná-lo com propriedades e retornos de chamada. Mas, quando misturamos componentes React Native e nativos, precisamos de alguns mecanismos específicos entre linguagens que nos permitam passar informações entre eles.</p><h2 id="propriedades" tabindex="-1">Propriedades <a class="header-anchor" href="#propriedades" aria-label="Permalink to &quot;Propriedades&quot;">​</a></h2><p>As propriedades são a forma mais direta de comunicação entre componentes. Portanto, precisamos de uma maneira de passar propriedades tanto de nativo para React Native quanto de React Native para nativo.</p><h3 id="passando-propriedades-de-native-para-react-native" tabindex="-1">Passando propriedades de Native para React Native <a class="header-anchor" href="#passando-propriedades-de-native-para-react-native" aria-label="Permalink to &quot;Passando propriedades de Native para React Native&quot;">​</a></h3><p>Para incorporar uma visualização React Native em um componente nativo, usamos <code>RCTRootView</code>. <code>RCTRootView</code> é um <code>UIView</code> que contém um aplicativo React Native. Ele também fornece uma interface entre o lado nativo e o aplicativo hospedado.</p><p><code>RCTRootView</code> possui um inicializador que permite passar propriedades arbitrárias para o aplicativo React Native. O parâmetro <code>initialProperties</code> deve ser uma instância de <code>NSDictionary</code>. O dicionário é convertido internamente em um objeto JSON que o componente JS de nível superior pode referenciar.</p><div class="language-objective-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objective-c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">NSArray</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">imageList </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> @[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;https://dummyimage.com/600x400/ffffff/000000.png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                       @&quot;https://dummyimage.com/600x400/000000/ffffff.png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">NSDictionary</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">props </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> @{</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;images&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> : imageList};</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">RCTRootView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rootView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [[RCTRootView </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">alloc</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">initWithBridge:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bridge</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">                                                 moduleName:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;ImageBrowserApp&quot;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">                                          initialProperties:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">props];</span></span></code></pre></div><div class="language-tsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">tsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> React </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;react&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {View, Image} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;react-native&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> default</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ImageBrowserApp</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> React</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  renderImage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">imgURI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{uri: imgURI}} /&gt;;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  render</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">View</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;{</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.props.images.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.renderImage)}&lt;/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">View</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><code>RCTRootView</code> também fornece uma propriedade de leitura e gravação <code>appProperties</code>. Depois que <code>appProperties</code> for definido, o aplicativo React Native será renderizado novamente com novas propriedades. A atualização só é realizada quando as novas propriedades atualizadas diferem das anteriores.</p><div class="language-objective-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objective-c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">NSArray</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">imageList </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> @[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;https://dummyimage.com/600x400/ff0000/000000.png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                       @&quot;https://dummyimage.com/600x400/ffffff/ff0000.png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rootView.appProperties </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> @{</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;images&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> : imageList};</span></span></code></pre></div><p>Não há problema em atualizar propriedades a qualquer momento. No entanto, as atualizações devem ser realizadas no thread principal. Você usa o getter em qualquer thread.</p><div class="info custom-block"><p class="custom-block-title">Observação</p><p>Atualmente, há um problema conhecido em que, ao definir appProperties durante a inicialização da ponte, a alteração pode ser perdida. Consulte <a href="https://github.com/facebook/react-native/issues/20115" target="_blank" rel="noreferrer">https://github.com/facebook/react-native/issues/20115</a> para obter mais informações.</p></div><p>Não há como atualizar apenas algumas propriedades por vez. Sugerimos que você o crie em seu próprio wrapper.</p><h3 id="passando-propriedades-do-react-native-para-native" tabindex="-1">Passando propriedades do React Native para Native <a class="header-anchor" href="#passando-propriedades-do-react-native-para-native" aria-label="Permalink to &quot;Passando propriedades do React Native para Native&quot;">​</a></h3><p>O problema de exposição de propriedades de componentes nativos é abordado em detalhes <a href="./native-components-ios.html#properties">neste artigo</a>. Resumindo, exporte propriedades com a macro <code>RCT_CUSTOM_VIEW_PROPERTY</code> em seu componente nativo personalizado e, em seguida, use-as no React Native como se o componente fosse um componente React Native comum.</p><h3 id="limites-de-propriedades" tabindex="-1">Limites de propriedades <a class="header-anchor" href="#limites-de-propriedades" aria-label="Permalink to &quot;Limites de propriedades&quot;">​</a></h3><p>A principal desvantagem das propriedades entre linguagens é que elas não suportam retornos de chamada, o que nos permitiria lidar com ligações de dados de baixo para cima. Imagine que você tem uma pequena visualização RN que deseja remover da visualização pai nativa como resultado de uma ação JS. Não há como fazer isso com adereços, pois as informações precisariam ir de baixo para cima.</p><p>Embora tenhamos uma variedade de retornos de chamada entre idiomas (<a href="./native-modules-ios.html#callbacks">descritos aqui</a>), esses retornos de chamada nem sempre são o que precisamos. O principal problema é que eles não devem ser passados ​​como propriedades. Em vez disso, esse mecanismo nos permite acionar uma ação nativa de JS e manipular o resultado dessa ação em JS.</p><h2 id="outras-formas-de-interacao-entre-linguagens-eventos-e-modulos-nativos" tabindex="-1">Outras formas de interação entre linguagens (eventos e módulos nativos) <a class="header-anchor" href="#outras-formas-de-interacao-entre-linguagens-eventos-e-modulos-nativos" aria-label="Permalink to &quot;Outras formas de interação entre linguagens (eventos e módulos nativos)&quot;">​</a></h2><p>Conforme declarado no capítulo anterior, o uso de propriedades apresenta algumas limitações. Às vezes, as propriedades não são suficientes para conduzir a lógica do nosso aplicativo e precisamos de uma solução que dê mais flexibilidade. Este capítulo cobre outras técnicas de comunicação disponíveis no React Native. Eles podem ser usados ​​para comunicação interna (entre JS e camadas nativas no RN), bem como para comunicação externa (entre RN e a parte &#39;nativa pura&#39; do seu aplicativo).</p><p>React Native permite que você execute chamadas de função em vários idiomas. Você pode executar código nativo personalizado de JS e vice-versa. Infelizmente, dependendo do lado em que trabalhamos, alcançamos o mesmo objetivo de maneiras diferentes. Para nativo - usamos mecanismo de eventos para agendar a execução de uma função manipuladora em JS, enquanto para React Native chamamos diretamente métodos exportados por módulos nativos.</p><h3 id="chamando-funcoes-react-native-a-partir-de-nativos-eventos" tabindex="-1">Chamando funções React Native a partir de nativos (eventos) <a class="header-anchor" href="#chamando-funcoes-react-native-a-partir-de-nativos-eventos" aria-label="Permalink to &quot;Chamando funções React Native a partir de nativos (eventos)&quot;">​</a></h3><p>Os eventos são descritos detalhadamente <a href="/docs/native-components-ios.html">neste artigo</a>. Observe que o uso de eventos não nos dá garantias sobre o tempo de execução, pois o evento é tratado em um thread separado.</p><p>Os eventos são poderosos porque nos permitem alterar os componentes do React Native sem precisar de uma referência a eles. No entanto, existem algumas armadilhas nas quais você pode cair ao usá-los:</p><ul><li>Como os eventos podem ser enviados de qualquer lugar, eles podem introduzir dependências do tipo espaguete em seu projeto.</li><li>Os eventos compartilham namespace, o que significa que você pode encontrar algumas colisões de nomes. As colisões não serão detectadas estaticamente, o que as torna difíceis de depurar.</li><li>Se você usar várias instâncias do mesmo componente React Native e quiser distingui-las da perspectiva do seu evento, provavelmente precisará introduzir identificadores e passá-los junto com os eventos (você pode usar o <code>reactTag</code> da visualização nativa como um identificador).</li></ul><p>O padrão comum que usamos ao incorporar nativo no React Native é tornar o RCTViewManager do componente nativo um delegado para as visualizações, enviando eventos de volta ao JavaScript por meio da ponte. Isso mantém as chamadas de eventos relacionadas em um só lugar.</p><h3 id="chamando-funcoes-nativas-do-react-native-modulos-nativos" tabindex="-1">Chamando funções nativas do React Native (módulos nativos) <a class="header-anchor" href="#chamando-funcoes-nativas-do-react-native-modulos-nativos" aria-label="Permalink to &quot;Chamando funções nativas do React Native (módulos nativos)&quot;">​</a></h3><p>Módulos nativos são classes Objective-C disponíveis em JS. Normalmente, uma instância de cada módulo é criada por ponte JS. Eles podem exportar funções e constantes arbitrárias para React Native. Eles foram abordados em detalhes <a href="/docs/native-modules-ios.html">neste artigo</a>.</p><p>O fato de os módulos nativos serem singletons limita o mecanismo no contexto de incorporação. Digamos que temos um componente React Native incorporado em uma visualização nativa e queremos atualizar a visualização pai nativa. Usando o mecanismo de módulo nativo, exportaríamos uma função que não apenas recebe os argumentos esperados, mas também um identificador da visão nativa pai. O identificador seria usado para recuperar uma referência à visualização pai a ser atualizada. Dito isto, precisaríamos manter um mapeamento dos identificadores para as visualizações nativas no módulo.</p><p>Embora esta solução seja complexa, ela é usada em <code>RCTUIManager</code>, que é uma classe interna do React Native que gerencia todas as visualizações do React Native.</p><p>Módulos nativos também podem ser usados ​​para expor bibliotecas nativas existentes ao JS. A <a href="https://github.com/michalchudziak/react-native-geolocation" target="_blank" rel="noreferrer">biblioteca de geolocalização</a> é um exemplo vivo da ideia.</p><div class="warning custom-block"><p class="custom-block-title">Cuidado</p><p>Todos os módulos nativos compartilham o mesmo namespace. Cuidado com colisões de nomes ao criar novos.</p></div><h2 id="fluxo-de-calculo-de-layout" tabindex="-1">Fluxo de cálculo de layout <a class="header-anchor" href="#fluxo-de-calculo-de-layout" aria-label="Permalink to &quot;Fluxo de cálculo de layout&quot;">​</a></h2><p>Ao integrar o nativo e o React Native, também precisamos de uma maneira de consolidar dois sistemas de layout diferentes. Esta seção aborda problemas comuns de layout e fornece uma breve descrição dos mecanismos para resolvê-los.</p><h3 id="layout-de-um-componente-nativo-incorporado-no-react-native" tabindex="-1">Layout de um componente nativo incorporado no React Native <a class="header-anchor" href="#layout-de-um-componente-nativo-incorporado-no-react-native" aria-label="Permalink to &quot;Layout de um componente nativo incorporado no React Native&quot;">​</a></h3><p>Este caso é abordado <a href="/docs/native-components-ios.html">neste artigo</a>. Para resumir, como todas as nossas visualizações de react nativas são subclasses de <code>UIView</code>, a maioria dos atributos de estilo e tamanho funcionarão como você esperaria imediatamente.</p><h3 id="layout-de-um-componente-react-native-incorporado-no-nativo" tabindex="-1">Layout de um componente React Native incorporado no nativo <a class="header-anchor" href="#layout-de-um-componente-react-native-incorporado-no-nativo" aria-label="Permalink to &quot;Layout de um componente React Native incorporado no nativo&quot;">​</a></h3><h4 id="react-native-com-tamanho-fixo" tabindex="-1">React Native com tamanho fixo <a class="header-anchor" href="#react-native-com-tamanho-fixo" aria-label="Permalink to &quot;React Native com tamanho fixo&quot;">​</a></h4><p>O cenário geral é quando temos um aplicativo React Native com tamanho fixo, que é conhecido pelo lado nativo. Em particular, uma visualização React Native em tela inteira se enquadra neste caso. Se quisermos uma visualização raiz menor, podemos definir explicitamente o quadro do RTRRootView.</p><p>Por exemplo, para criar um aplicativo RN com 200 pixels (lógicos) de altura e largura da visualização de hospedagem ampla, poderíamos fazer:</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-DPfNO" id="tab-njAc6v0" checked="checked"><label for="tab-njAc6v0">SomeViewController.m</label></div><div class="blocks"><div class="language-objective-c vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">objective-c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)viewDidLoad</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  [...]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  RCTRootView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rootView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [[RCTRootView </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">alloc</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">initWithBridge:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bridge</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">                                                   moduleName:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">appName</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">                                            initialProperties:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">props];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  rootView.frame </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> CGRectMake</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.view.width, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.view </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">addSubview:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rootView];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></div></div><p>Quando temos uma visualização raiz de tamanho fixo, precisamos respeitar seus limites no lado JS. Em outras palavras, precisamos garantir que o conteúdo do React Native possa estar contido na visualização raiz de tamanho fixo. A maneira mais fácil de garantir isso é usar o layout Flexbox. Se você usar posicionamento absoluto e os componentes do React estiverem visíveis fora dos limites da visualização raiz, você obterá sobreposição com visualizações nativas, fazendo com que alguns recursos se comportem de forma inesperada. Por exemplo, &#39;TouchableHighlight&#39; não destacará seus toques fora dos limites da visualização raiz.</p><p>Não há problema em atualizar dinamicamente o tamanho da visualização raiz, redefinindo sua propriedade de quadro. React Native cuidará do layout do conteúdo.</p><h4 id="react-native-com-tamanho-flexivel" tabindex="-1">React Native com tamanho flexível <a class="header-anchor" href="#react-native-com-tamanho-flexivel" aria-label="Permalink to &quot;React Native com tamanho flexível&quot;">​</a></h4><p>Em alguns casos, gostaríamos de renderizar conteúdo de tamanho inicialmente desconhecido. Digamos que o tamanho será definido dinamicamente em JS. Temos duas soluções para este problema.</p><ol><li>Você pode agrupar sua visualização React Native em um componente <code>ScrollView</code>. Isso garante que seu conteúdo estará sempre disponível e não se sobreporá às visualizações nativas.</li><li>React Native permite determinar, em JS, o tamanho do aplicativo RN e fornecê-lo ao proprietário da hospedagem <code>RCTRootView</code>. O proprietário é então responsável por reorganizar as subvisualizações e manter a IU consistente. Conseguimos isso com os modos de flexibilidade do <code>RCTRootView</code>.</li></ol><p><code>RCTRootView</code> suporta 4 modos de flexibilidade de tamanhos diferentes:</p><div class="language-objective-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objective-c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">typedef</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NS_ENUM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">NSInteger</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, RCTRootViewSizeFlexibility) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  RCTRootViewSizeFlexibilityNone </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  RCTRootViewSizeFlexibilityWidth,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  RCTRootViewSizeFlexibilityHeight,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  RCTRootViewSizeFlexibilityWidthAndHeight,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span></code></pre></div><p><code>RCTRootViewSizeFlexibilityNone</code> é o valor padrão, o que torna fixo o tamanho da visualização raiz (mas ainda pode ser atualizado com <code>setFrame:</code>). Os outros três modos nos permitem rastrear as atualizações de tamanho do conteúdo do React Native. Por exemplo, definir o modo como <code>RCTRootViewSizeFlexibilityHeight</code> fará com que o React Native meça a altura do conteúdo e passe essa informação de volta ao delegado de <code>RCTRootView</code>. Uma ação arbitrária pode ser executada dentro do delegado, incluindo a configuração do quadro da visualização raiz, para que o conteúdo se ajuste. O delegado é chamado somente quando o tamanho do conteúdo é alterado.</p><div class="warning custom-block"><p class="custom-block-title">Cuidado</p><p>Tornar uma dimensão flexível em JS e nativo leva a um comportamento indefinido. Por exemplo - não torne flexível a largura de um componente React de nível superior (com <code>flexbox</code>) enquanto estiver usando <code>RCTRootViewSizeFlexibilityWidth</code> na hospedagem <code>RCTRootView</code>.</p></div><p>Vejamos um exemplo.</p><div class="language-objective-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objective-c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">instancetype</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)initWithFrame:(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CGRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)frame</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  [...]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  _rootView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [[RCTRootView </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">alloc</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">initWithBridge:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bridge</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  moduleName:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;FlexibilityExampleApp&quot;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  initialProperties:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@{}];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  _rootView.delegate </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  _rootView.sizeFlexibility </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> RCTRootViewSizeFlexibilityHeight;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  _rootView.frame </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> CGRectMake</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">self</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.frame.size.width, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#pragma mark</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;"> - RCTRootViewDelegate</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)rootViewDidChangeIntrinsicSize:(RCTRootView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)rootView</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  CGRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> newFrame </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rootView.frame;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  newFrame.size </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rootView.intrinsicContentSize;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  rootView.frame </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> newFrame;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>No exemplo, temos uma visualização <code>FlexibleSizeExampleView</code> que contém uma visualização raiz. Criamos a visualização raiz, inicializamos e definimos o delegado. O delegado cuidará das atualizações de tamanho. Em seguida, definimos a flexibilidade de tamanho da visualização raiz para <code>RCTRootViewSizeFlexibilityHeight</code>, o que significa que o método <code>rootViewDidChangeIntrinsicSize:</code> será chamado toda vez que o conteúdo do React Native mudar sua altura. Finalmente, definimos a largura e a posição da visualização raiz. Observe que definimos a altura também, mas isso não tem efeito, pois tornamos a altura dependente de RN.</p><p>Você pode verificar o código-fonte completo do exemplo <a href="https://github.com/facebook/react-native/blob/main/packages/rn-tester/RNTester/NativeExampleViews/FlexibleSizeExampleView.mm" target="_blank" rel="noreferrer">aqui</a>.</p><p>Não há problema em alterar dinamicamente o modo de flexibilidade de tamanho da visualização raiz. Alterar o modo de flexibilidade de uma visualização raiz agendará um recálculo do layout e o método delegado <code>rootViewDidChangeIntrinsicSize:</code> será chamado assim que o tamanho do conteúdo for conhecido.</p><div class="info custom-block"><p class="custom-block-title">Observação</p><p>O cálculo do layout do React Native é executado em um thread separado, enquanto as atualizações da visualização da UI nativa são feitas no thread principal. Isso pode causar inconsistências temporárias na interface do usuário entre o nativo e o React Native. Este é um problema conhecido e nossa equipe está trabalhando na sincronização de atualizações de IU provenientes de diferentes fontes.</p></div><div class="info custom-block"><p class="custom-block-title">Observação</p><p>O React Native não executa nenhum cálculo de layout até que a visualização raiz se torne uma subvisão de algumas outras visualizações. Se você deseja ocultar a visualização React Native até que suas dimensões sejam conhecidas, adicione a visualização raiz como uma subvisualização e torne-a inicialmente oculta (use a propriedade <code>hidden</code> de <code>UIView</code>). Em seguida, altere sua visibilidade no método delegado.</p></div>`,61),n=[t];function r(p,l,d,h,c,k){return s(),i("div",null,n)}const E=a(o,[["render",r]]);export{u as __pageData,E as default};
