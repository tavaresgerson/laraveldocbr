import{_ as a,c as s,o as i,a4 as e}from"./chunks/framework.nQaBHiNx.js";const g=JSON.parse('{"title":"Imagens","description":"","frontmatter":{},"headers":[],"relativePath":"docs/images.md","filePath":"docs/images.md"}'),n={name:"docs/images.md"},o=e(`<h1 id="imagens" tabindex="-1">Imagens <a class="header-anchor" href="#imagens" aria-label="Permalink to &quot;Imagens&quot;">​</a></h1><h2 id="recursos-de-imagem-estatica" tabindex="-1">Recursos de imagem estática <a class="header-anchor" href="#recursos-de-imagem-estatica" aria-label="Permalink to &quot;Recursos de imagem estática&quot;">​</a></h2><p>React Native fornece uma maneira unificada de gerenciar imagens e outros ativos de mídia em seus aplicativos Android e iOS. Para adicionar uma imagem estática ao seu aplicativo, coloque-a em algum lugar da árvore do código-fonte e referencie-a assim:</p><div class="language-jsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">require</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;./my-icon.png&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)} /&gt;</span></span></code></pre></div><p>O nome da imagem é resolvido da mesma forma que os módulos JS são resolvidos. No exemplo acima, o bundler procurará <code>my-icon.png</code> na mesma pasta do componente que o requer.</p><p>Você pode usar os sufixos <code>@2x</code> e <code>@3x</code> para fornecer imagens para diferentes densidades de tela. Se você tiver a seguinte estrutura de arquivos:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>.</span></span>
<span class="line"><span>├── button.js</span></span>
<span class="line"><span>└── img</span></span>
<span class="line"><span>    ├── check.png</span></span>
<span class="line"><span>    ├── check@2x.png</span></span>
<span class="line"><span>    └── check@3x.png</span></span></code></pre></div><p>...e o código <code>button.js</code> contém:</p><div class="language-jsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">require</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;./img/check.png&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)} /&gt;</span></span></code></pre></div><p>...o empacotador agrupará e exibirá a imagem correspondente à densidade da tela do dispositivo. Por exemplo, <code>check@2x.png</code> será usado em um iPhone 7, enquanto <code>check@3x.png</code> será usado em um iPhone 7 Plus ou Nexus 5. Se não houver imagem que corresponda à densidade da tela, a melhor opção mais próxima será ser selecionado.</p><p>No Windows, talvez seja necessário reiniciar o empacotador se você adicionar novas imagens ao seu projeto.</p><p>Aqui estão alguns benefícios que você obtém:</p><ol><li>Mesmo sistema em Android e iOS.</li><li>As imagens ficam na mesma pasta do seu código JavaScript. Os componentes são independentes.</li><li>Nenhum namespace global, ou seja, você não precisa se preocupar com colisões de nomes.</li><li>Somente as imagens realmente usadas serão empacotadas em seu aplicativo.</li><li>Adicionar e alterar imagens não requer recompilação do aplicativo, você pode atualizar o simulador normalmente.</li><li>O empacotador conhece as dimensões da imagem, não há necessidade de duplicá-la no código.</li><li>As imagens podem ser distribuídas por meio de pacotes <a href="https://www.npmjs.com/" target="_blank" rel="noreferrer">npm</a>.</li></ol><p>Para que isso funcione, o nome da imagem em <code>require</code> deve ser conhecido estaticamente.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>// BOM</span></span>
<span class="line"><span>&lt;Image source={require(&#39;./my-icon.png&#39;)} /&gt;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// RUIM</span></span>
<span class="line"><span>const icon = this.props.active</span></span>
<span class="line"><span>  ? &#39;my-icon-active&#39;</span></span>
<span class="line"><span>  : &#39;my-icon-inactive&#39;;</span></span>
<span class="line"><span>&lt;Image source={require(&#39;./&#39; + icon + &#39;.png&#39;)} /&gt;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// BOM</span></span>
<span class="line"><span>const icon = this.props.active</span></span>
<span class="line"><span>  ? require(&#39;./my-icon-active.png&#39;)</span></span>
<span class="line"><span>  : require(&#39;./my-icon-inactive.png&#39;);</span></span>
<span class="line"><span>&lt;Image source={icon} /&gt;;</span></span></code></pre></div><p>Observe que as fontes de imagem exigidas desta forma incluem informações de tamanho (largura, altura) da imagem. Se você precisar dimensionar a imagem dinamicamente (ou seja, via flex), pode ser necessário definir manualmente <code>{width: undefined, height: undefined}</code> no atributo de estilo.</p><h2 id="recursos-estaticos-sem-imagem" tabindex="-1">Recursos estáticos sem imagem <a class="header-anchor" href="#recursos-estaticos-sem-imagem" aria-label="Permalink to &quot;Recursos estáticos sem imagem&quot;">​</a></h2><p>A sintaxe <code>require</code> descrita acima também pode ser usada para incluir estaticamente arquivos de áudio, vídeo ou documentos em seu projeto. Os tipos de arquivo mais comuns são suportados, incluindo <code>.mp3</code>, <code>.wav</code>, <code>.mp4</code>, <code>.mov</code>, <code>.html</code> e <code>.pdf</code>. Consulte os <a href="https://github.com/facebook/metro/blob/master/packages/metro-config/src/defaults/defaults.js#L14-L44" target="_blank" rel="noreferrer">padrões do bundler</a> para obter a lista completa.</p><p>Você pode adicionar suporte para outros tipos adicionando uma <a href="https://metrobundler.dev/docs/configuration#resolver-options" target="_blank" rel="noreferrer">opção de resolvedor assetsExts</a> em sua configuração Metro.</p><p>Uma ressalva é que os vídeos devem usar posicionamento absoluto em vez de <code>flexGrow</code>, uma vez que as informações de tamanho não são transmitidas atualmente para ativos que não sejam de imagem. Essa limitação não ocorre para vídeos vinculados diretamente ao Xcode ou à pasta Assets para Android.</p><h2 id="imagens-dos-recursos-do-aplicativo-hibrido" tabindex="-1">Imagens dos recursos do aplicativo híbrido <a class="header-anchor" href="#imagens-dos-recursos-do-aplicativo-hibrido" aria-label="Permalink to &quot;Imagens dos recursos do aplicativo híbrido&quot;">​</a></h2><p>Se você estiver construindo um aplicativo híbrido (algumas UIs no React Native, algumas UIs no código da plataforma), você ainda poderá usar imagens que já estão incluídas no aplicativo.</p><p>Para imagens incluídas nos catálogos de ativos do Xcode ou na pasta drawable do Android, use o nome da imagem sem a extensão:</p><div class="language-jsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{uri: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;app_icon&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  style</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{width: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">40</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, height: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">40</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span></code></pre></div><p>Para imagens na pasta de ativos do Android, use o esquema <code>assets:/</code>:</p><div class="language-jsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{uri: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;asset:/app_icon.png&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  style</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{width: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">40</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, height: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">40</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span></code></pre></div><p>Essas abordagens não fornecem verificações de segurança. Cabe a você garantir que essas imagens estejam disponíveis no aplicativo. Além disso, você deve especificar as dimensões da imagem manualmente.</p><h2 id="imagens-de-rede" tabindex="-1">Imagens de rede <a class="header-anchor" href="#imagens-de-rede" aria-label="Permalink to &quot;Imagens de rede&quot;">​</a></h2><p>Muitas das imagens que você exibirá em seu aplicativo não estarão disponíveis em tempo de compilação ou você desejará carregar algumas dinamicamente para manter o tamanho binário baixo. Ao contrário dos recursos estáticos, você precisará especificar manualmente as dimensões da sua imagem. É altamente recomendável que você use https também para atender aos <a href="/docs/publishing-to-app-store.html">requisitos de segurança de transporte de aplicativos no iOS</a>.</p><div class="language-jsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// BOM</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{uri: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://reactjs.org/logo-og.png&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">       style</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{width: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">400</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, height: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">400</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}} /&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// RUIM</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{uri: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://reactjs.org/logo-og.png&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}} /&gt;</span></span></code></pre></div><h2 id="solicitacoes-de-rede-para-imagens" tabindex="-1">Solicitações de rede para imagens <a class="header-anchor" href="#solicitacoes-de-rede-para-imagens" aria-label="Permalink to &quot;Solicitações de rede para imagens&quot;">​</a></h2><p>Se você quiser definir coisas como HTTP-Verb, Headers ou Body junto com a solicitação de imagem, você pode fazer isso definindo estas propriedades no objeto de origem:</p><div class="language-jsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    uri: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://reactjs.org/logo-og.png&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    method: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;POST&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    headers: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      Pragma: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;no-cache&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    body: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Your Body goes here&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  style</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{width: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">400</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, height: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">400</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span></code></pre></div><h2 id="uri-com-dados" tabindex="-1">URI com dados <a class="header-anchor" href="#uri-com-dados" aria-label="Permalink to &quot;URI com dados&quot;">​</a></h2><p>Às vezes, você pode obter dados de imagem codificados de uma chamada da API REST. Você pode usar o esquema uri <code>&#39;data:&#39;</code> para usar essas imagens. Da mesma forma que para os recursos de rede, você precisará especificar manualmente as dimensões da sua imagem.</p><blockquote><p><strong>INFORMAÇÕES</strong> Isso é recomendado apenas para imagens muito pequenas e dinâmicas, como ícones em uma lista de um banco de dados.</p></blockquote><div class="language-jsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// inclua pelo menos largura e altura!</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  style</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    width: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">51</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    height: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">51</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    resizeMode: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;contain&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    uri: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAAEXRFWHRTb2Z0d2FyZQBwbmdjcnVzaEB1SfMAAABQSURBVGje7dSxCQBACARB+2/ab8BEeQNhFi6WSYzYLYudDQYGBgYGBgYGBgYGBgYGBgZmcvDqYGBgmhivGQYGBgYGBgYGBgYGBgYGBgbmQw+P/eMrC5UTVAAAAABJRU5ErkJggg==&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span></code></pre></div><h3 id="controle-de-cache-somente-ios" tabindex="-1">Controle de cache (somente iOS) <a class="header-anchor" href="#controle-de-cache-somente-ios" aria-label="Permalink to &quot;Controle de cache (somente iOS)&quot;">​</a></h3><p>Em alguns casos, você pode querer exibir uma imagem apenas se ela já estiver no cache local, ou seja, um espaço reservado de baixa resolução até que uma resolução mais alta esteja disponível. Em outros casos, você não se importa se a imagem está desatualizada e está disposto a exibi-la para economizar largura de banda. A propriedade de origem do cache fornece controle sobre como a camada de rede interage com o cache.</p><ul><li><code>default</code>: use a estratégia padrão das plataformas nativas.</li><li><code>reload</code>: os dados do URL serão carregados da fonte de origem. Nenhum dado de cache existente deve ser usado para atender a uma solicitação de carregamento de URL.</li><li><code>force-cache</code>: Os dados existentes em cache serão usados para atender à solicitação, independentemente de sua idade ou data de expiração. Se não houver dados existentes no cache correspondente à solicitação, os dados serão carregados da fonte de origem.</li><li><code>only-if-cached</code>: os dados de cache existentes serão usados para atender a uma solicitação, independentemente de sua idade ou data de expiração. Se não houver dados existentes no cache correspondentes a uma solicitação de carregamento de URL, nenhuma tentativa será feita para carregar os dados da fonte de origem e o carregamento será considerado como tendo falhado.</li></ul><div class="language-jsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    uri: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://reactjs.org/logo-og.png&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    cache: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;only-if-cached&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }}</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  style</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{width: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">400</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, height: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">400</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span></code></pre></div><h2 id="imagens-do-sistema-de-arquivos-local" tabindex="-1">Imagens do sistema de arquivos local <a class="header-anchor" href="#imagens-do-sistema-de-arquivos-local" aria-label="Permalink to &quot;Imagens do sistema de arquivos local&quot;">​</a></h2><p>Consulte <a href="https://github.com/react-native-community/react-native-cameraroll" target="_blank" rel="noreferrer">CameraRoll</a> para obter um exemplo de uso de recursos locais que estão fora de <code>Images.xcassets</code>.</p><h3 id="melhor-imagem-do-rolo-da-camera" tabindex="-1">Melhor imagem do rolo da câmera <a class="header-anchor" href="#melhor-imagem-do-rolo-da-camera" aria-label="Permalink to &quot;Melhor imagem do rolo da câmera&quot;">​</a></h3><p>O iOS salva vários tamanhos para a mesma imagem no rolo da câmera. É muito importante escolher aquele que seja o mais próximo possível por motivos de desempenho. Você não gostaria de usar a imagem de 3264x2448 com qualidade total como fonte ao exibir uma miniatura de 200x200. Se houver uma correspondência exata, o React Native irá escolhê-la, caso contrário, usará a primeira que for pelo menos 50% maior para evitar desfoque ao redimensionar de um tamanho próximo. Tudo isso é feito por padrão, então você não precisa se preocupar em escrever o código tedioso (e sujeito a erros) para fazer isso sozinho.</p><h2 id="por-que-nao-dimensionar-tudo-automaticamente" tabindex="-1">Por que não dimensionar tudo automaticamente? <a class="header-anchor" href="#por-que-nao-dimensionar-tudo-automaticamente" aria-label="Permalink to &quot;Por que não dimensionar tudo automaticamente?&quot;">​</a></h2><p>No navegador, se você não fornecer um tamanho para uma imagem, o navegador renderizará um elemento 0x0, fará o download da imagem e, em seguida, renderizará a imagem com base no tamanho correto. O grande problema com esse comportamento é que sua IU vai pular conforme as imagens são carregadas, o que torna a experiência do usuário muito ruim. Isso é chamado de <a href="https://web.dev/cls/" target="_blank" rel="noreferrer">mudança cumulativa de layou</a>t.</p><p>No React Native esse comportamento não é implementado intencionalmente. É mais trabalhoso para o desenvolvedor saber antecipadamente as dimensões (ou proporção) da imagem remota, mas acreditamos que isso leva a uma melhor experiência do usuário. Imagens estáticas carregadas do pacote de aplicativos por meio da sintaxe <code>require(&#39;./my-icon.png&#39;)</code> podem ser dimensionadas automaticamente porque suas dimensões estão disponíveis imediatamente no momento da montagem.</p><p>Por exemplo, o resultado de <code>require(&#39;./my-icon.png&#39;)</code> pode ser:</p><div class="language-jsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;__packager_asset&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;uri&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;my-icon.png&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;width&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">591</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;height&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">573</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="fonte-como-um-objeto" tabindex="-1">Fonte como um objeto <a class="header-anchor" href="#fonte-como-um-objeto" aria-label="Permalink to &quot;Fonte como um objeto&quot;">​</a></h2><p>No React Native, uma decisão interessante é que o atributo <code>src</code> é denominado <code>source</code> e não aceita uma string, mas um objeto com um atributo <code>uri</code>.</p><div class="language-jsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Image</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{uri: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;something.jpg&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}} /&gt;</span></span></code></pre></div><p>Do lado da infraestrutura, a razão é que nos permite anexar metadados a este objeto. Por exemplo, se você estiver usando <code>require(&#39;./my-icon.png&#39;)</code>, adicionamos informações sobre sua localização e tamanho reais (não confie neste fato, pois pode mudar no futuro!). Isso também é uma prova futura, por exemplo, podemos querer oferecer suporte a sprites em algum momento, em vez de gerar <code>{uri: ...}</code>, podemos gerar <code>{uri: ..., crop: {left: 10, top: 50, width: 20, height: 40}}</code> e suporta sprites de forma transparente em todos os sites de chamada existentes.</p><p>Do lado do usuário, isso permite anotar o objeto com atributos úteis, como a dimensão da imagem, para calcular o tamanho em que ela será exibida. Sinta-se à vontade para usá-lo como sua estrutura de dados para armazenar mais informações sobre sua imagem .</p><h2 id="imagem-de-fundo-via-aninhamento" tabindex="-1">Imagem de fundo via aninhamento <a class="header-anchor" href="#imagem-de-fundo-via-aninhamento" aria-label="Permalink to &quot;Imagem de fundo via aninhamento&quot;">​</a></h2><p>Uma solicitação de recurso comum de desenvolvedores familiarizados com a web é a imagem de fundo. Para lidar com esse caso de uso, você pode usar o componente <code>&lt;ImageBackground&gt;</code>, que possui os mesmos adereços de <code>&lt;Image&gt;</code>, e adicionar quaisquer filhos que você gostaria de colocar em camadas sobre ele.</p><p>Talvez você não queira usar <code>&lt;ImageBackground&gt;</code> em alguns casos, pois a implementação é básica. Consulte a <a href="/docs/imagebackground.html">documentação do <code>&lt;ImageBackground&gt;</code></a> para obter mais informações e crie seu próprio componente personalizado quando necessário.</p><div class="language-jsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">ImageBackground</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">style</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{{width: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;100%&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, height: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;100%&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}}&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;Inside&lt;/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">ImageBackground</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>Observe que você deve especificar alguns atributos de estilo de largura e altura.</p><h2 id="estilo-arredondado-do-ios" tabindex="-1">Estilo arredondado do iOS <a class="header-anchor" href="#estilo-arredondado-do-ios" aria-label="Permalink to &quot;Estilo arredondado do iOS&quot;">​</a></h2><p>Observe que as seguintes propriedades de estilo de raio de borda específicas de canto podem ser ignoradas pelo componente de imagem do iOS:</p><ul><li><code>borderTopLeftRadius</code></li><li><code>borderTopRightRadius</code></li><li><code>borderBottomLeftRadius</code></li><li><code>borderBottomRightRadius</code></li></ul><h2 id="decodificacao-fora-do-thread" tabindex="-1">Decodificação fora do thread <a class="header-anchor" href="#decodificacao-fora-do-thread" aria-label="Permalink to &quot;Decodificação fora do thread&quot;">​</a></h2><p>A decodificação de imagens pode levar mais do que um quadro. Esta é uma das principais fontes de queda de quadros na web porque a decodificação é feita na thread principal. No React Native, a decodificação da imagem é feita em uma thread diferente. Na prática, você já precisa cuidar do caso quando a imagem ainda não foi baixada, portanto, exibir o espaço reservado para mais alguns quadros enquanto ela é decodificada não requer nenhuma alteração de código.</p><h2 id="configurando-limites-de-cache-de-imagens-do-ios" tabindex="-1">Configurando limites de cache de imagens do iOS <a class="header-anchor" href="#configurando-limites-de-cache-de-imagens-do-ios" aria-label="Permalink to &quot;Configurando limites de cache de imagens do iOS&quot;">​</a></h2><p>No iOS, expomos uma API para substituir os limites de cache de imagem padrão do React Native. Isso deve ser chamado de dentro do seu código AppDelegate nativo (por exemplo, dentro de <code>didFinishLaunchingWithOptions</code>).</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>RCTSetImageCacheLimits(4*1024*1024, 200*1024*1024);</span></span></code></pre></div><p><strong>Parâmetros</strong></p><table><thead><tr><th>NOME</th><th>TIPO</th><th>OBRIGATÓRIO</th><th>DESCRIÇÃO</th></tr></thead><tbody><tr><td><code>imageSizeLimit</code></td><td><code>number</code></td><td>Sim</td><td>Limite de tamanho do cache de imagem.</td></tr><tr><td><code>totalCostLimit</code></td><td><code>number</code></td><td>Sim</td><td>Limite total de custo do cache.</td></tr></tbody></table><p>No exemplo de código acima, o limite de tamanho da imagem é definido como 4 MB e o limite de custo total é definido como 200 MB.</p>`,71),t=[o];function d(p,r,l,h,c,k){return i(),s("div",null,t)}const u=a(n,[["render",d]]);export{g as __pageData,u as default};