import{_ as a,c as e,o as i,a4 as s}from"./chunks/framework.nQaBHiNx.js";const o="/assets/321064922-2e21e8bb-a216-416b-9690-09a883198c52.BoFCh8E9.png",g=JSON.parse('{"title":"Publicação na Apple App Store","description":"","frontmatter":{},"headers":[],"relativePath":"docs/publishing-to-app-store.md","filePath":"docs/publishing-to-app-store.md"}'),t={name:"docs/publishing-to-app-store.md"},n=s('<h1 id="publicacao-na-apple-app-store" tabindex="-1">Publicação na Apple App Store <a class="header-anchor" href="#publicacao-na-apple-app-store" aria-label="Permalink to &quot;Publicação na Apple App Store&quot;">​</a></h1><p>O processo de publicação é igual ao de qualquer outro aplicativo iOS nativo, com algumas considerações adicionais a serem levadas em consideração.</p><div class="info custom-block"><p class="custom-block-title">Informações</p><p>Se você estiver usando o Expo, leia o guia do Expo para <a href="https://docs.expo.dev/distribution/app-stores/" target="_blank" rel="noreferrer">Implantação nas App Stores</a> para criar e enviar seu aplicativo para a Apple App Store. Este guia funciona com qualquer aplicativo React Native para automatizar o processo de implantação.</p></div><h3 id="_1-configurar-esquema-de-liberacao" tabindex="-1">1. Configurar esquema de liberação <a class="header-anchor" href="#_1-configurar-esquema-de-liberacao" aria-label="Permalink to &quot;1. Configurar esquema de liberação&quot;">​</a></h3><p>Construir um aplicativo para distribuição na App Store requer o uso do esquema <code>Release</code> no Xcode. Os aplicativos desenvolvidos para <code>Release</code> desativarão automaticamente o menu Dev no aplicativo, o que impedirá que seus usuários acessem inadvertidamente o menu em produção. Ele também agrupará o JavaScript localmente, para que você possa colocar o aplicativo em um dispositivo e testá-lo enquanto não estiver conectado ao computador.</p><p>Para configurar seu aplicativo para ser construído usando o esquema <code>Release</code>, vá para <strong>Product → Scheme → Edit Scheme</strong>. Selecione a guia <strong>Run</strong> na barra lateral e defina o menu suspenso Build Configuration como <code>Release</code>.</p><div class="one-image"><img class="rounded-shadow" src="'+o+`"></div><h3 id="dicas-profissionais" tabindex="-1">Dicas profissionais <a class="header-anchor" href="#dicas-profissionais" aria-label="Permalink to &quot;Dicas profissionais&quot;">​</a></h3><p>À medida que o tamanho do seu App Bundle aumenta, você pode começar a ver uma tela em branco piscando entre a tela inicial e a exibição da visualização do aplicativo raiz. Se for esse o caso, você pode adicionar o seguinte código a <code>AppDelegate.m</code> para manter sua tela inicial exibida durante a transição.</p><div class="language-objective-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">objective-c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // Coloque este código depois de &quot;[self.window makeKeyAndVisible]&quot; e antes de &quot;return YES;&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  UIStoryboard </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">sb </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [UIStoryboard </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">storyboardWithName:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">@&quot;LaunchScreen&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> bundle:nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  UIViewController </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vc </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [sb </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">instantiateInitialViewController</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  rootView.loadingView </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vc.view;</span></span></code></pre></div><p>O pacote estático é criado sempre que você direciona um dispositivo físico, mesmo na depuração. Se você quiser economizar tempo, desative a geração de pacotes no Debug adicionando o seguinte ao seu script de shell na fase de construção do Xcode <code>Bundle React Native code and images</code>:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [ </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">CONFIGURATION</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ==</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Debug&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ]; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">then</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SKIP_BUNDLING</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> fi</span></span></code></pre></div><h3 id="_2-construir-aplicativo-para-lancamento" tabindex="-1">2. Construir aplicativo para lançamento <a class="header-anchor" href="#_2-construir-aplicativo-para-lancamento" aria-label="Permalink to &quot;2. Construir aplicativo para lançamento&quot;">​</a></h3><p>Agora você pode criar seu aplicativo para lançamento tocando em <kbd>Cmd ⌘</kbd> + <kbd>B</kbd> ou selecionando <strong>Produto</strong> → <strong>Construir</strong> na barra de menu. Depois de criado para lançamento, você poderá distribuir o aplicativo para testadores beta e enviá-lo para a App Store.</p><div class="info custom-block"><p class="custom-block-title">Informações</p><p>Você também pode usar o <code>React Native CLI</code> para realizar esta operação usando a opção <code>--mode</code> com o valor <code>Release</code> (por exemplo, da raiz do seu projeto: <code>npm run ios -- --mode=&quot;Release&quot; </code> ou <code>yarn ios --mode Release</code>).</p></div><p>Quando terminar os testes e estiver pronto para publicar na App Store, siga este guia.</p><ul><li>Inicie seu terminal, navegue até a pasta iOS do seu aplicativo e digite <code>open .</code>.</li><li>Clique duas vezes em YOUR_APP_NAME.xcworkspace. Deve iniciar o XCode.</li><li>Clique em <code>Produto</code> → <code>Arquivo</code>. Certifique-se de configurar o dispositivo para &quot;Qualquer dispositivo iOS (arm64)&quot;.</li></ul><div class="info custom-block"><p class="custom-block-title">Observação</p><p>Verifique seu identificador de pacote e certifique-se de que seja exatamente igual ao que você criou nos identificadores no Apple Developer Dashboard.</p></div><ul><li>Após a conclusão do arquivo, na janela de arquivo, clique em <code>Distribute App</code>.</li><li>Clique em <code>App Store Connect</code> agora (se quiser publicar na App Store).</li><li>Clique em <code>Upload</code> → Certifique-se de que todas as caixas de seleção estejam marcadas, clique em <code>Next</code>.</li><li>Escolha entre <code>Automatically manage signing</code> e <code>Manually manage signing</code> com base em suas necessidades.</li><li>Clique em <code>Upload</code>.</li><li>Agora você pode encontrá-lo na App Store Connect em TestFlight.</li></ul><p>Agora preencha as informações necessárias e na seção Build, selecione a build do aplicativo e clique em <code>Save</code> → <code>Submit For Review</code>.</p><h3 id="_4-capturas-de-tela" tabindex="-1">4. Capturas de tela <a class="header-anchor" href="#_4-capturas-de-tela" aria-label="Permalink to &quot;4. Capturas de tela&quot;">​</a></h3><p>A Apple Store exige que você tenha capturas de tela dos dispositivos mais recentes. A referência para tais dispositivos pode ser encontrada <a href="https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/" target="_blank" rel="noreferrer">aqui</a>. Observe que as capturas de tela para alguns tamanhos de exibição não serão necessárias se forem fornecidas para outros tamanhos.</p>`,22),r=[n];function p(l,c,d,u,h,k){return i(),e("div",null,r)}const v=a(t,[["render",p]]);export{g as __pageData,v as default};