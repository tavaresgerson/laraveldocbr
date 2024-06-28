import{_ as s,c as a,o as i,a4 as e}from"./chunks/framework.nQaBHiNx.js";const m=JSON.parse('{"title":"Comunicação entre nativo e React Native","description":"","frontmatter":{},"headers":[],"relativePath":"docs/communication-android.md","filePath":"docs/communication-android.md"}'),t={name:"docs/communication-android.md"},n=e(`<h1 id="comunicacao-entre-nativo-e-react-native" tabindex="-1">Comunicação entre nativo e React Native <a class="header-anchor" href="#comunicacao-entre-nativo-e-react-native" aria-label="Permalink to &quot;Comunicação entre nativo e React Native&quot;">​</a></h1><p>Em <a href="/docs/integration-with-existing-apps.html">Guia de integração com aplicativos existentes</a> e <a href="/docs/native-components-android.html">Guia de componentes de UI nativos</a> aprendemos como incorporar o React Native em um componente nativo e vice-versa. Quando misturamos componentes nativos e React Native, eventualmente encontraremos a necessidade de comunicação entre esses dois mundos. Algumas maneiras de conseguir isso já foram mencionadas em outros guias. Este artigo resume as técnicas disponíveis.</p><h2 id="introducao" tabindex="-1">Introdução <a class="header-anchor" href="#introducao" aria-label="Permalink to &quot;Introdução&quot;">​</a></h2><p>O React Native é inspirado no React, então a ideia básica do fluxo de informações é semelhante. O fluxo no React é unidirecional. Mantemos uma hierarquia de componentes, na qual cada componente depende apenas de seu pai e de seu próprio estado interno. Fazemos isso com propriedades: os dados são passados ​​de um pai para seus filhos de cima para baixo. Se um componente ancestral depende do estado de seu descendente, deve-se transmitir um retorno de chamada a ser usado pelo descendente para atualizar o ancestral.</p><p>O mesmo conceito se aplica ao React Native. Contanto que estejamos construindo nosso aplicativo exclusivamente dentro da estrutura, podemos direcioná-lo com propriedades e retornos de chamada. Mas, quando misturamos componentes React Native e nativos, precisamos de alguns mecanismos específicos entre linguagens que nos permitam passar informações entre eles.</p><h2 id="propriedades" tabindex="-1">Propriedades <a class="header-anchor" href="#propriedades" aria-label="Permalink to &quot;Propriedades&quot;">​</a></h2><p>As propriedades são a forma mais direta de comunicação entre componentes. Portanto, precisamos de uma maneira de passar propriedades tanto de nativo para React Native quanto de React Native para nativo.</p><h3 id="passando-propriedades-de-native-para-react-native" tabindex="-1">Passando propriedades de Native para React Native <a class="header-anchor" href="#passando-propriedades-de-native-para-react-native" aria-label="Permalink to &quot;Passando propriedades de Native para React Native&quot;">​</a></h3><p>Você pode passar propriedades para o aplicativo React Native fornecendo uma implementação personalizada de <code>ReactActivityDelegate</code> em sua atividade principal. Esta implementação deve substituir <code>getLaunchOptions</code> para retornar um <code>Bundle</code> com as propriedades desejadas.</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-u84Dr" id="tab-aJKj3Hz" checked="checked"><label for="tab-aJKj3Hz">Java</label><input type="radio" name="group-u84Dr" id="tab-xfq9v1E"><label for="tab-xfq9v1E">Kotlin</label></div><div class="blocks"><div class="language-java vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MainActivity</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ReactActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  protected</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ReactActivityDelegate </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createReactActivityDelegate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ReactActivityDelegate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getMainComponentName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      protected</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Bundle </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getLaunchOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Bundle initialProperties </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Bundle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; imageList </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(Arrays.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">asList</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                &quot;https://dummyimage.com/600x400/ffffff/000000.png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                &quot;https://dummyimage.com/600x400/000000/ffffff.png&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        initialProperties.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">putStringArrayList</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;images&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, imageList);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> initialProperties;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    };</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MainActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> : </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ReactActivity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createReactActivityDelegate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(): </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ReactActivityDelegate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> : </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ReactActivityDelegate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mainComponentName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            override</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> fun</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getLaunchOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(): </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Bundle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> imageList </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> arrayListOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://dummyimage.com/600x400/ffffff/000000.png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://dummyimage.com/600x400/000000/ffffff.png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                val</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> initialProperties </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Bundle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">apply</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">putStringArrayList</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;images&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, imageList) }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> initialProperties</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div></div></div><div class="language-tsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">tsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> React </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;react&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {View, Image} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;react-native&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> default</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ImageBrowserApp</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> React</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  renderImage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">imgURI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{uri: imgURI}} /&gt;;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  render</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">View</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;{</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.props.images.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.renderImage)}&lt;/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">View</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><code>ReactRootView</code> fornece uma propriedade de leitura e gravação <code>appProperties</code>. Depois que <code>appProperties</code> for definido, o aplicativo React Native será renderizado novamente com novas propriedades. A atualização só é realizada quando as novas propriedades atualizadas diferem das anteriores.</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-gZ_Iu" id="tab-COed7D4" checked="checked"><label for="tab-COed7D4">Java</label><input type="radio" name="group-gZ_Iu" id="tab-H4wsgow"><label for="tab-H4wsgow">Kotlin</label></div><div class="blocks"><div class="language-java vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Bundle updatedProps </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> mReactRootView.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAppProperties</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; imageList </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ArrayList&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(Arrays.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">asList</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;https://dummyimage.com/600x400/ff0000/000000.png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;https://dummyimage.com/600x400/ffffff/ff0000.png&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">updatedProps.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">putStringArrayList</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;images&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, imageList);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mReactRootView.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setAppProperties</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(updatedProps);</span></span></code></pre></div><div class="language-kotlin vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">kotlin</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> updatedProps: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Bundle</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> reactRootView.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAppProperties</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> imageList </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> arrayListOf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://dummyimage.com/600x400/ff0000/000000.png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://dummyimage.com/600x400/ffffff/ff0000.png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div></div></div><p>Não há problema em atualizar propriedades a qualquer momento. No entanto, as atualizações devem ser realizadas no thread principal. Você usa o getter em qualquer thread.</p><p>Não há como atualizar apenas algumas propriedades por vez. Sugerimos que você o crie em seu próprio wrapper.</p><div class="info custom-block"><p class="custom-block-title">Nota</p><p>Atualmente, a função JS <code>componentWillUpdateProps</code> do componente RN de nível superior não será chamada após uma atualização de prop. No entanto, você pode acessar os novos adereços na função <code>componentDidMount</code>.</p></div><h3 id="passando-propriedades-do-react-native-para-native" tabindex="-1">Passando propriedades do React Native para Native <a class="header-anchor" href="#passando-propriedades-do-react-native-para-native" aria-label="Permalink to &quot;Passando propriedades do React Native para Native&quot;">​</a></h3><p>O problema de exposição de propriedades de componentes nativos é abordado em detalhes <a href="/docs/native-components-android.html">neste artigo</a>. Resumindo, as propriedades que devem ser refletidas em JavaScript precisam ser expostas como um método setter anotado com <code>@ReactProp</code> e, em seguida, usá-las no React Native como se o componente fosse um componente React Native comum.</p><h3 id="limites-de-propriedades" tabindex="-1">Limites de propriedades <a class="header-anchor" href="#limites-de-propriedades" aria-label="Permalink to &quot;Limites de propriedades&quot;">​</a></h3><p>A principal desvantagem das propriedades entre linguagens é que elas não suportam retornos de chamada, o que nos permitiria lidar com ligações de dados de baixo para cima. Imagine que você tem uma pequena visualização RN que deseja remover da visualização pai nativa como resultado de uma ação JS. Não há como fazer isso com adereços, pois as informações precisariam ir de baixo para cima.</p><p>Embora tenhamos uma variedade de retornos de chamada entre linguagens (<a href="/docs/native-modules-android.html">descritos aqui</a>), esses retornos de chamada nem sempre são o que precisamos. O principal problema é que eles não devem ser passados ​​como propriedades. Em vez disso, esse mecanismo nos permite acionar uma ação nativa de JS e manipular o resultado dessa ação em JS.</p><h2 id="outras-formas-de-interacao-entre-idiomas-eventos-e-modulos-nativos" tabindex="-1">Outras formas de interação entre idiomas (eventos e módulos nativos) <a class="header-anchor" href="#outras-formas-de-interacao-entre-idiomas-eventos-e-modulos-nativos" aria-label="Permalink to &quot;Outras formas de interação entre idiomas (eventos e módulos nativos)&quot;">​</a></h2><p>Conforme declarado no capítulo anterior, o uso de propriedades apresenta algumas limitações. Às vezes, as propriedades não são suficientes para conduzir a lógica do nosso aplicativo e precisamos de uma solução que dê mais flexibilidade. Este capítulo cobre outras técnicas de comunicação disponíveis no React Native. Eles podem ser usados ​​para comunicação interna (entre JS e camadas nativas no RN), bem como para comunicação externa (entre RN e a parte &#39;nativa pura&#39; do seu aplicativo).</p><p>React Native permite que você execute chamadas de função em vários idiomas. Você pode executar código nativo personalizado de JS e vice-versa. Infelizmente, dependendo do lado em que trabalhamos, alcançamos o mesmo objetivo de maneiras diferentes. Para nativo - usamos mecanismo de eventos para agendar a execução de uma função manipuladora em JS, enquanto para React Native chamamos diretamente métodos exportados por módulos nativos.</p><h3 id="chamando-funcoes-react-native-a-partir-de-nativos-eventos" tabindex="-1">Chamando funções React Native a partir de nativos (eventos) <a class="header-anchor" href="#chamando-funcoes-react-native-a-partir-de-nativos-eventos" aria-label="Permalink to &quot;Chamando funções React Native a partir de nativos (eventos)&quot;">​</a></h3><p>Os eventos são descritos em detalhes <a href="/docs/native-components-android.html">neste artigo</a>. Observe que o uso de eventos não nos dá garantias sobre o tempo de execução, pois o evento é tratado em um thread separado.</p><p>Os eventos são poderosos porque nos permitem alterar os componentes do React Native sem precisar de uma referência a eles. No entanto, existem algumas armadilhas nas quais você pode cair ao usá-los:</p><ul><li>Como os eventos podem ser enviados de qualquer lugar, eles podem introduzir dependências do tipo espaguete em seu projeto.</li><li>Os eventos compartilham namespace, o que significa que você pode encontrar algumas colisões de nomes. As colisões não serão detectadas estaticamente, o que as torna difíceis de depurar.</li><li>Se você usar várias instâncias do mesmo componente React Native e quiser distingui-las da perspectiva do seu evento, provavelmente precisará introduzir identificadores e passá-los junto com os eventos (você pode usar o <code>reactTag</code> da visualização nativa como um identificador).</li></ul><h3 id="chamando-funcoes-nativas-do-react-native-modulos-nativos" tabindex="-1">Chamando funções nativas do React Native (módulos nativos) <a class="header-anchor" href="#chamando-funcoes-nativas-do-react-native-modulos-nativos" aria-label="Permalink to &quot;Chamando funções nativas do React Native (módulos nativos)&quot;">​</a></h3><p>Módulos nativos são classes Java/Kotlin disponíveis em JS. Normalmente, uma instância de cada módulo é criada por ponte JS. Eles podem exportar funções e constantes arbitrárias para React Native. Eles foram abordados em detalhes <a href="/docs/native-modules-android.html">neste artigo</a>.</p><div class="warning custom-block"><p class="custom-block-title">Aviso</p><p>Todos os módulos nativos compartilham o mesmo namespace. Cuidado com colisões de nomes ao criar novos.</p></div>`,31),p=[n];function o(l,r,h,d,k,c){return i(),a("div",null,p)}const g=s(t,[["render",o]]);export{m as __pageData,g as default};