import{_ as s,c as i,o as a,a4 as n}from"./chunks/framework.nQaBHiNx.js";const g=JSON.parse('{"title":"Usando TypeScript","description":"","frontmatter":{},"headers":[],"relativePath":"docs/typescript.md","filePath":"docs/typescript.md"}'),t={name:"docs/typescript.md"},e=n(`<h1 id="usando-typescript" tabindex="-1">Usando TypeScript <a class="header-anchor" href="#usando-typescript" aria-label="Permalink to &quot;Usando TypeScript&quot;">​</a></h1><p>TypeScript é uma linguagem que estende JavaScript adicionando definições de tipo. Novos projetos React Native são direcionados ao TypeScript por padrão, mas também oferecem suporte a JavaScript e Flow.</p><h2 id="introducao-ao-typescript" tabindex="-1">Introdução ao TypeScript <a class="header-anchor" href="#introducao-ao-typescript" aria-label="Permalink to &quot;Introdução ao TypeScript&quot;">​</a></h2><p>Novos projetos criados pela <a href="/docs/environment-setup.html">CLI React Native</a> ou modelos populares como <a href="https://github.com/infinitered/ignite" target="_blank" rel="noreferrer">Ignite</a> usarão TypeScript por padrão.</p><p>O TypeScript também pode ser usado com o <a href="https://expo.io/" target="_blank" rel="noreferrer">Expo</a>, que mantém modelos TypeScript, ou solicitará que você instale e configure automaticamente o TypeScript quando um arquivo <code>.ts</code> ou <code>.tsx</code> for adicionado ao seu projeto.</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> create-expo-app</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --template</span></span></code></pre></div><h2 id="adicionando-typescript-a-um-projeto-existente" tabindex="-1">Adicionando TypeScript a um projeto existente <a class="header-anchor" href="#adicionando-typescript-a-um-projeto-existente" aria-label="Permalink to &quot;Adicionando TypeScript a um projeto existente&quot;">​</a></h2><ol><li>Adicione plug-ins TypeScript, tipos e ESLint ao seu projeto.</li></ol><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-IVbH-" id="tab-qQCSJV6" checked="checked"><label for="tab-qQCSJV6">npm</label><input type="radio" name="group-IVbH-" id="tab-qYxzhHP"><label for="tab-qYxzhHP">yarn</label></div><div class="blocks"><div class="language-bash vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -D</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @tsconfig/react-native</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @types/jest</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @types/react</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @types/react-test-renderer</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> typescript</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --dev</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @tsconfig/react-native</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @types/jest</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @types/react</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @types/react-test-renderer</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> typescript</span></span></code></pre></div></div></div><div class="info custom-block"><p class="custom-block-title"><strong>OBSERVAÇÃO</strong></p><p>Este comando adiciona a versão mais recente de cada dependência. As versões podem precisar ser alteradas para corresponder aos pacotes existentes usados pelo seu projeto. Você pode usar uma ferramenta como <a href="https://react-native-community.github.io/upgrade-helper/" target="_blank" rel="noreferrer">React Native Upgrade Helper</a> para ver as versões fornecidas pelo React Native.</p></div><ol start="2"><li>Adicione um arquivo de configuração TypeScript. Crie um <code>tsconfig.json</code> na raiz do seu projeto:</li></ol><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  &quot;extends&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@tsconfig/react-native/tsconfig.json&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><ol start="3"><li>Renomeie um arquivo JavaScript para *.tsx</li></ol><div class="warning custom-block"><p class="custom-block-title">ATENÇÃO</p><p>Você deve deixar o arquivo de ponto de entrada <code>./index.js</code> como está, caso contrário, poderá ter problemas ao agrupar uma construção de produção.</p></div><ol start="4"><li>Execute o <code>yarn tsc</code> para verificar o tipo de seus novos arquivos TypeScript.</li></ol><h2 id="usando-javascript-em-vez-de-typescript" tabindex="-1">Usando JavaScript em vez de TypeScript <a class="header-anchor" href="#usando-javascript-em-vez-de-typescript" aria-label="Permalink to &quot;Usando JavaScript em vez de TypeScript&quot;">​</a></h2><p>O React Native padroniza novos aplicativos para TypeScript, mas JavaScript ainda pode ser usado. Arquivos com extensão <code>.jsx</code> são tratados como JavaScript em vez de TypeScript e não serão verificados. Módulos JavaScript ainda podem ser importados por módulos TypeScript, junto com o inverso.</p><h2 id="como-funcionam-o-typescript-e-o-react-native" tabindex="-1">Como funcionam o TypeScript e o React Native <a class="header-anchor" href="#como-funcionam-o-typescript-e-o-react-native" aria-label="Permalink to &quot;Como funcionam o TypeScript e o React Native&quot;">​</a></h2><p>Pronto para uso, os códigos TypeScript são transformados pelo <a href="/docs/javascript-environment.html">Babel</a> durante o empacotamento. Recomendamos que você use o compilador TypeScript apenas para verificação de tipo. Este é o comportamento padrão do <code>tsc</code> para aplicativos recém-criados. Se você tiver código TypeScript existente sendo portado para React Native, há <a href="https://babeljs.io/docs/en/next/babel-plugin-transform-typescript" target="_blank" rel="noreferrer">uma ou duas advertências</a> ao usar Babel em vez de TypeScript.</p><h2 id="qual-e-a-aparencia-do-react-native-typescript" tabindex="-1">Qual é a aparência do React Native + TypeScript <a class="header-anchor" href="#qual-e-a-aparencia-do-react-native-typescript" aria-label="Permalink to &quot;Qual é a aparência do React Native + TypeScript&quot;">​</a></h2><p>Você pode fornecer uma interface para <a href="/docs/props.html">Props</a> e <a href="/docs/state.html">State</a> de um componente React via <code>React.Component&lt;Props, State&gt;</code> que fornecerá verificação de tipo e preenchimento automático do editor ao trabalhar com esse componente em JSX.</p><div class="language-tsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">tsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// components/Hello.tsx</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> React </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;react&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {Button, StyleSheet, Text, View} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;react-native&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  baseEnthusiasmLevel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Hello</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> React</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">FC</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Props</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  name,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  baseEnthusiasmLevel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">enthusiasmLevel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">setEnthusiasmLevel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> React.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">useState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    baseEnthusiasmLevel,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  );</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onIncrement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    setEnthusiasmLevel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(enthusiasmLevel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onDecrement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    setEnthusiasmLevel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      enthusiasmLevel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> enthusiasmLevel </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> :</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    );</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getExclamationMarks</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">numChars</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    numChars </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ?</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(numChars </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">join</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;!&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">View</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> style</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{styles.container}&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Text</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> style</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{styles.greeting}&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Hello {name}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        {</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getExclamationMarks</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(enthusiasmLevel)}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">View</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Button</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Increase enthusiasm&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          accessibilityLabel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;increment&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          onPress</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{onIncrement}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          color</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;blue&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Button</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Decrease enthusiasm&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          accessibilityLabel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;decrement&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          onPress</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{onDecrement}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">          color</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;red&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">View</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">View</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> styles</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> StyleSheet.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  container: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    flex: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    alignItems: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;center&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    justifyContent: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;center&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  greeting: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    fontSize: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    fontWeight: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;bold&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    margin: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> default</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Hello;</span></span></code></pre></div><p>Você pode explorar mais a sintaxe no <a href="https://www.typescriptlang.org/play?strictNullChecks=false&amp;jsx=3#code/JYWwDg9gTgLgBAJQKYEMDG8BmUIjgcilQ3wG4BYAKFEljgG8AhAVxhggDsAaOAZRgCeAGyS8AFkiQweAFSQAPaXABqwJAHcAvnGy4CRdDAC0HFDGAA3JGSpUFteILBI4ABRxgAznAC8DKnBwpiBIAFxwnjBQwBwA5hSUgQBGKJ5IAKIcMGLMnsCpIAAySFZCAPzhHMwgSUhQCZq2lGickXAAEkhCQhDhyIYAdABiAMIAPO4QXgB8vnAAFPRBKCE8KWmZ2bn5nkUlXXMADHCaAJS+s-QBcC0cbQDaSFk5eQXFpTxpMJsvO3ulAF05v0MANcqIYGYkPN1hlnts3vshKcEtdbm1OABJDhoIghLJzebnHyzL4-BG7d5deZPLavSlIuAAajgAEYUWjWvBOAARJC4pD4+B+IkXCJScn0-7U2m-RGlOCzY5lOCyinSoRwIxsuDhQ4cyicu7wWIS+RoIQrMzATgAWRQUAA1t4RVUQCMxA7PJVqrUoMTZm6PV7FXBlXAAIJQKAoATzIOeqDeFnsgYAKwgMXm+AAhPhzuF8DZDYk4EQYMwoBwFtdAmNVBoIoIRD56JFhEhPANbpCYnVNNNa4E4GM5Iomx3W+2RF3YkQpDFYgOh8OOl0evR8ARGqXV4F6MEkDu98P6KbvubLSBrXaHc6afCpVTkce92MAPRjmCD3fD+tqdQfxPOsWDYTgVz3cwYBbAAibEBVSFw1SlGCINXdA0E7PIkmAIRgEEQoUFqIQfBgmIBSFVDfxPTh3Cw1ssRxPFaVfYCbggHooFIpIhGYJAqLY98gOAsZQPYDg0OHKDYL5BC0lVR8-gEti4AwrDgBwvCCKIrpSIAE35ZismUtjaKITxPAYjhZKMmBWOAlpONIog9JMvchIgj8G0AocvIA4SDU0VFmi5CcZzmfgO3ESQYG7AwYGhK5Sx7FA+ygcIktXTARHkcJWS4IcUDw2IOExBKQG9OAYMwrI6hggrfzTXJzEwAQRk4BKsnCaraTq65NAawI5xixcMqHTAOt4YAAC8wjgAAmQ5BuHCasgAdSQYBYjEGBCySDi9PwZbAmvKBYhiPKADZloGqgzmC+xoHgAzMBQZghHgTpuggBIgA" target="_blank" rel="noreferrer">playground TypeScript</a>.</p><h2 id="onde-encontrar-conselhos-uteis" tabindex="-1">Onde encontrar conselhos úteis <a class="header-anchor" href="#onde-encontrar-conselhos-uteis" aria-label="Permalink to &quot;Onde encontrar conselhos úteis&quot;">​</a></h2><ul><li><a href="https://www.typescriptlang.org/docs/handbook/intro.html" target="_blank" rel="noreferrer">Manual TypeScript</a></li><li><a href="https://reactjs.org/docs/static-type-checking.html#typescript" target="_blank" rel="noreferrer">Documentação do React no TypeScript</a></li><li><a href="https://github.com/typescript-cheatsheets/react-typescript-cheatsheet#reacttypescript-cheatsheets" target="_blank" rel="noreferrer">React + TypeScript Cheatsheets</a> tem uma boa visão geral sobre como usar React com TypeScript</li></ul><h2 id="usando-aliases-de-caminho-personalizados-com-typescript" tabindex="-1">Usando aliases de caminho personalizados com TypeScript <a class="header-anchor" href="#usando-aliases-de-caminho-personalizados-com-typescript" aria-label="Permalink to &quot;Usando aliases de caminho personalizados com TypeScript&quot;">​</a></h2><p>Para usar aliases de caminho personalizados com TypeScript, você precisa definir os aliases de caminho para funcionarem tanto no Babel quanto no TypeScript. Veja como:</p><ol><li>Edite seu <code>tsconfig.json</code> para ter seus <a href="https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping" target="_blank" rel="noreferrer">mapeamentos de caminho personalizados</a>. Defina qualquer coisa na raiz de <code>src</code> para estar disponível sem nenhuma referência de caminho anterior e permita que qualquer arquivo de teste seja acessado usando <code>tests/File.tsx</code>:</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark has-diff vp-code"><code><span class="line"><span>{</span></span>
<span class="line diff remove"><span>  &quot;extends&quot;: &quot;@tsconfig/react-native/tsconfig.json&quot;</span></span>
<span class="line diff add"><span>  &quot;extends&quot;: &quot;@tsconfig/react-native/tsconfig.json&quot;,</span></span>
<span class="line diff add"><span>  &quot;compilerOptions&quot;: {</span></span>
<span class="line diff add"><span>    &quot;baseUrl&quot;: &quot;.&quot;,</span></span>
<span class="line diff add"><span>    &quot;paths&quot;: {</span></span>
<span class="line diff add"><span>      &quot;*&quot;: [&quot;src/*&quot;],</span></span>
<span class="line diff add"><span>      &quot;tests&quot;: [&quot;tests/*&quot;],</span></span>
<span class="line diff add"><span>      &quot;@components/*&quot;: [&quot;src/components/*&quot;],</span></span>
<span class="line diff add"><span>    },</span></span>
<span class="line diff add"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>Adicione <a href="https://github.com/tleunen/babel-plugin-module-resolver" target="_blank" rel="noreferrer">babel-plugin-module-resolver</a> como um pacote de desenvolvimento ao seu projeto:</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-7NJWz" id="tab-dXDGn2I" checked="checked"><label for="tab-dXDGn2I">npm</label><input type="radio" name="group-7NJWz" id="tab-I1OSNIQ"><label for="tab-I1OSNIQ">yarn</label></div><div class="blocks"><div class="language-bash vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --save-dev</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> babel-plugin-module-resolver</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --dev</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> babel-plugin-module-resolver</span></span></code></pre></div></div></div><p>Por fim, configure seu <code>babel.config.js</code> (observe que a sintaxe do seu <code>babel.config.js</code> é diferente do seu <code>tsconfig.json</code>):</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark has-diff vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">  presets</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">&#39;module:metro-react-native-babel-preset&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line diff add"><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">  plugins</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [ </span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    [ </span></span>
<span class="line diff add"><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">        &#39;module-resolver&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        { </span></span>
<span class="line diff add"><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">          root</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">&#39;./src&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], </span></span>
<span class="line diff add"><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">          extensions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">&#39;.ios.js&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">&#39;.android.js&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">&#39;.js&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">&#39;.ts&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">&#39;.tsx&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">&#39;.json&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], </span></span>
<span class="line diff add"><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">          alias</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span></span>
<span class="line diff add"><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">          tests</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">&#39;./tests/&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], </span></span>
<span class="line diff add"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;@components&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;./src/components&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      } </span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ] </span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ] </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,33),p=[e];function l(h,k,r,o,d,c){return a(),i("div",null,p)}const y=s(t,[["render",l]]);export{g as __pageData,y as default};
