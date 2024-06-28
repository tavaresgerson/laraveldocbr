import{_ as a}from"./chunks/289088717-bc864112-bd55-43b6-8369-9d78e896376e.CT8xxMv0.js";import{_ as e,c as o,o as s,a4 as i}from"./chunks/framework.nQaBHiNx.js";const t="/assets/289078069-79daecf4-41df-45e4-bdfd-34120ecb2d9b.DqQEPRQ3.png",n="/assets/289086561-8042a459-ead2-4b1a-ba59-41b673d9b7d8.DDX45esF.png",f=JSON.parse('{"title":"iOS","description":"","frontmatter":{},"headers":[],"relativePath":"docs/environment-setup/mac-os/ios.md","filePath":"docs/environment-setup/mac-os/ios.md"}'),r={name:"docs/environment-setup/mac-os/ios.md"},c=i(`<h1 id="ios" tabindex="-1">iOS <a class="header-anchor" href="#ios" aria-label="Permalink to &quot;iOS&quot;">​</a></h1><h2 id="instalando-dependencias" tabindex="-1">Instalando dependências <a class="header-anchor" href="#instalando-dependencias" aria-label="Permalink to &quot;Instalando dependências&quot;">​</a></h2><p>Você precisará de Node, Watchman, interface de linha de comando React Native, Xcode e CocoaPods.</p><p>Embora você possa usar qualquer editor de sua escolha para desenvolver seu aplicativo, você precisará instalar o Xcode para configurar as ferramentas necessárias para construir seu aplicativo React Native para iOS.</p><h2 id="node-e-watchman" tabindex="-1">Node e Watchman <a class="header-anchor" href="#node-e-watchman" aria-label="Permalink to &quot;Node e Watchman&quot;">​</a></h2><p>Recomendamos instalar o Node e o Watchman usando o Homebrew. Execute os seguintes comandos em um Terminal após instalar o Homebrew:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">brew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> node</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">brew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> watchman</span></span></code></pre></div><p>Se você já instalou o Node em seu sistema, certifique-se de que seja o Node 18 ou mais recente.</p><p><a href="https://facebook.github.io/watchman" target="_blank" rel="noreferrer">Watchman</a> é uma ferramenta do Facebook para observar mudanças no sistema de arquivos. É altamente recomendável instalá-lo para melhor desempenho.</p><h2 id="xcode" tabindex="-1">Xcode <a class="header-anchor" href="#xcode" aria-label="Permalink to &quot;Xcode&quot;">​</a></h2><p>A maneira mais fácil de instalar o Xcode é através da <a href="https://itunes.apple.com/us/app/xcode/id497799835?mt=12" target="_blank" rel="noreferrer">Mac App Store</a>. A instalação do Xcode também instalará o Simulador iOS e todas as ferramentas necessárias para construir seu aplicativo iOS.</p><p>Se você já instalou o Xcode em seu sistema, certifique-se de que seja a versão 10 ou mais recente.</p><h3 id="ferramentas-de-linha-de-comando" tabindex="-1">Ferramentas de linha de comando <a class="header-anchor" href="#ferramentas-de-linha-de-comando" aria-label="Permalink to &quot;Ferramentas de linha de comando&quot;">​</a></h3><p>Você também precisará instalar as ferramentas de linha de comando do Xcode. Abra o Xcode e escolha <strong>Settings...</strong> (ou <strong>Preferences...</strong>) no menu Xcode. Vá para o painel Locais e instale as ferramentas selecionando a versão mais recente no menu suspenso Ferramentas de linha de comando.</p><p><img src="`+t+`" alt="image"></p><h3 id="instalando-um-simulador-ios-no-xcode" tabindex="-1">Instalando um simulador iOS no Xcode <a class="header-anchor" href="#instalando-um-simulador-ios-no-xcode" aria-label="Permalink to &quot;Instalando um simulador iOS no Xcode&quot;">​</a></h3><p>Para instalar um simulador, abra <strong>Xcode &gt; Settings...</strong> (ou <strong>Preferences...</strong>) e selecione a aba <strong>Platforms</strong> (ou <strong>Components</strong>). Selecione um simulador com a versão correspondente do iOS que você deseja usar.</p><p>Se você estiver usando o Xcode versão 14.0 ou superior para instalar um simulador, abra <strong>Xcode &gt; Settings &gt; Platforms</strong>, clique no ícone &quot;<strong>+</strong>&quot; e selecione a opção <strong>iOS…</strong>.</p><h2 id="cocoapods" tabindex="-1">CocoaPods <a class="header-anchor" href="#cocoapods" aria-label="Permalink to &quot;CocoaPods&quot;">​</a></h2><p><a href="https://cocoapods.org/" target="_blank" rel="noreferrer">CocoaPods</a> é um dos sistemas de gerenciamento de dependências disponíveis para iOS. CocoaPods é uma <a href="https://en.wikipedia.org/wiki/RubyGems" target="_blank" rel="noreferrer">gem</a> Ruby. Você pode instalar CocoaPods usando a versão do Ruby fornecida com a versão mais recente do macOS.</p><p>Para obter mais informações, visite o guia de <a href="https://guides.cocoapods.org/using/getting-started.html" target="_blank" rel="noreferrer">primeiros passos do CocoaPods</a>.</p><h2 id="interface-de-linha-de-comando-nativa-do-react" tabindex="-1">Interface de linha de comando nativa do React <a class="header-anchor" href="#interface-de-linha-de-comando-nativa-do-react" aria-label="Permalink to &quot;Interface de linha de comando nativa do React&quot;">​</a></h2><p>React Native possui uma interface de linha de comando integrada. Em vez de instalar e gerenciar uma versão específica da CLI globalmente, recomendamos que você acesse a versão atual em tempo de execução usando <code>npx</code>, que acompanha o Node.js. Com <code>npx react-native &lt;command&gt;</code>, a versão estável atual da CLI será baixada e executada no momento em que o comando for executado.</p><h2 id="criando-um-novo-aplicativo" tabindex="-1">Criando um novo aplicativo <a class="header-anchor" href="#criando-um-novo-aplicativo" aria-label="Permalink to &quot;Criando um novo aplicativo&quot;">​</a></h2><div class="warning custom-block"><p class="custom-block-title">Atenção!</p><p>Se você instalou anteriormente o pacote global <code>react-native-cli</code>, remova-o, pois pode causar problemas inesperados:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> uninstall</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -g</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> react-native-cli</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @react-native-community/cli</span></span></code></pre></div></div><p>Você pode usar a interface de linha de comando integrada do React Native para gerar um novo projeto. Vamos criar um novo projeto React Native chamado &quot;AwesomeProject&quot;:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> react-native@latest</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> init</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> AwesomeProject</span></span></code></pre></div><p>Isso não é necessário se você estiver integrando o React Native em um aplicativo existente, se você &quot;expulsou&quot; da Expo ou se estiver adicionando suporte a iOS ao projeto React Native existente (consulte <a href="/docs/integration-with-existing-apps.html">Integração com aplicativos existentes</a>). Você também pode usar uma CLI de terceiros para iniciar seu aplicativo React Native, como <a href="https://github.com/infinitered/ignite" target="_blank" rel="noreferrer">Ignite CLI</a>.</p><div class="info custom-block"><p class="custom-block-title"><strong>INFORMAÇÕES</strong></p><p>Se você estiver tendo problemas com o iOS, tente reinstalar as dependências executando:</p><ul><li><code>cd ios</code> para navegar até a pasta ios.</li><li><code>bundle install</code> para instalar o <a href="https://bundler.io/" target="_blank" rel="noreferrer">Bundler</a></li><li><code>bundle exec pod install</code> para instalar as dependências do iOS gerenciadas pelo CocoaPods.</li></ul></div><h2 id="opcional-usando-uma-versao-ou-modelo-especifico" tabindex="-1">[Opcional] Usando uma versão ou modelo específico <a class="header-anchor" href="#opcional-usando-uma-versao-ou-modelo-especifico" aria-label="Permalink to &quot;[Opcional] Usando uma versão ou modelo específico&quot;">​</a></h2><p>Se quiser iniciar um novo projeto com uma versão específica do React Native, você pode usar o argumento <code>--version</code>:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> react-native@X.XX.X</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> init</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> AwesomeProject</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --version</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> X.XX.X</span></span></code></pre></div><p>Você também pode iniciar um projeto com um modelo React Native personalizado com o argumento <code>--template</code>.</p><div class="info custom-block"><p class="custom-block-title"><strong>Nota</strong></p><p>Se o comando acima estiver falhando, você pode ter uma versão antiga do <code>react-native</code> ou <code>react-native-cli</code> instalada globalmente no seu PC. Tente desinstalar o cli e execute-o usando <code>npx</code>.</p></div><h2 id="opcional-configurando-seu-ambiente" tabindex="-1">[Opcional] Configurando seu ambiente <a class="header-anchor" href="#opcional-configurando-seu-ambiente" aria-label="Permalink to &quot;[Opcional] Configurando seu ambiente&quot;">​</a></h2><p>A partir do React Native versão 0.69, é possível configurar o ambiente Xcode usando o arquivo <code>.xcode.env</code> fornecido pelo template.</p><p>O arquivo <code>.xcode.env</code> contém uma variável de ambiente para exportar o caminho para o executável do node na variável <code>NODE_BINARY</code>. Esta é a abordagem sugerida para dissociar a infraestrutura de construção da versão do sistema do <code>node</code>. Você deve customizar esta variável com seu próprio caminho ou seu próprio gerenciador de versão de <code>node</code>, se for diferente do padrão.</p><p>Além disso, é possível adicionar qualquer outra variável de ambiente e originar o arquivo <code>.xcode.env</code> nas fases do script de construção. Caso você precise executar um script que requeira algum ambiente específico, esta é a abordagem sugerida: permite desacoplar as fases de construção de um ambiente específico.</p><div class="info custom-block"><p class="custom-block-title"><strong>INFORMAÇÕES</strong></p><p>Se você já estiver usando <a href="https://nvm.sh/" target="_blank" rel="noreferrer">NVM</a> (um comando que ajuda a instalar e alternar entre versões do Node.js) e <a href="https://ohmyz.sh/" target="_blank" rel="noreferrer">zsh</a>, você pode querer mover o código que inicializa o NVM de seu <code>~/.zshrc</code> para um arquivo <code>~/.zshenv</code> para ajudar o Xcode a encontre seu executável Node:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> NVM_DIR</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$HOME</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/.nvm&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-s</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$NVM_DIR</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/nvm.sh&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ] &amp;&amp; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">\\.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$NVM_DIR</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/nvm.sh&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # Isso carrega o nvm</span></span></code></pre></div><p>Você também pode querer garantir que toda a &quot;fase de construção do script de shell&quot; do seu projeto Xcode esteja usando <code>/bin/zsh</code> como seu shell.</p></div><h2 id="executando-seu-aplicativo-react-native" tabindex="-1">Executando seu aplicativo React Native <a class="header-anchor" href="#executando-seu-aplicativo-react-native" aria-label="Permalink to &quot;Executando seu aplicativo React Native&quot;">​</a></h2><h3 id="etapa-1-iniciar-o-metro" tabindex="-1">Etapa 1: iniciar o Metro <a class="header-anchor" href="#etapa-1-iniciar-o-metro" aria-label="Permalink to &quot;Etapa 1: iniciar o Metro&quot;">​</a></h3><p><a href="https://facebook.github.io/metro/" target="_blank" rel="noreferrer">Metro</a> é a ferramenta de construção JavaScript para React Native. Para iniciar o servidor de desenvolvimento Metro, execute o seguinte na pasta do projeto:</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-9CllC" id="tab-_z2NMgh" checked="checked"><label for="tab-_z2NMgh">npm</label><input type="radio" name="group-9CllC" id="tab-PXhSNDD"><label for="tab-PXhSNDD">yarn</label></div><div class="blocks"><div class="language-bash vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> start</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> start</span></span></code></pre></div></div></div><div class="info custom-block"><p class="custom-block-title"><strong>OBSERVAÇÃO</strong></p><p>Se você estiver familiarizado com desenvolvimento web, o Metro é semelhante a empacotadores como Vite e webpack, mas foi projetado de ponta a ponta para React Native. Por exemplo, Metro usa <a href="https://babel.dev/" target="_blank" rel="noreferrer">Babel</a> para transformar sintaxe como JSX em JavaScript executável.</p></div><h3 id="etapa-2-inicie-seu-aplicativo" tabindex="-1">Etapa 2: inicie seu aplicativo <a class="header-anchor" href="#etapa-2-inicie-seu-aplicativo" aria-label="Permalink to &quot;Etapa 2: inicie seu aplicativo&quot;">​</a></h3><p>Deixe o Metro Bundler rodar em seu próprio terminal. Abra um novo terminal dentro da pasta do projeto React Native. Execute o seguinte:</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-LFMT_" id="tab-60loAr7" checked="checked"><label for="tab-60loAr7">npm</label><input type="radio" name="group-LFMT_" id="tab-txt58Hd"><label for="tab-txt58Hd">yarn</label></div><div class="blocks"><div class="language-bash vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ios</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ios</span></span></code></pre></div></div></div><p>Você deverá ver seu novo aplicativo em execução no iOS Simulator em breve.</p><p><img src="`+n+'" alt="image"></p><p>Esta é uma maneira de executar seu aplicativo. Você também pode executá-lo diretamente no Xcode.</p><div class="info custom-block"><p class="custom-block-title">Ajuda</p><p>Se você não conseguir fazer isso funcionar, consulte a página <a href="/docs/troubleshooting.html">Solução de problemas</a>.</p></div><h2 id="executando-em-um-dispositivo" tabindex="-1">Executando em um dispositivo <a class="header-anchor" href="#executando-em-um-dispositivo" aria-label="Permalink to &quot;Executando em um dispositivo&quot;">​</a></h2><p>O comando acima executará automaticamente seu aplicativo no iOS Simulator por padrão. Se você deseja executar o aplicativo em um dispositivo iOS físico real, siga as instruções <a href="/docs/running-on-device.html">aqui</a>.</p><h3 id="modificando-seu-aplicativo" tabindex="-1">Modificando seu aplicativo <a class="header-anchor" href="#modificando-seu-aplicativo" aria-label="Permalink to &quot;Modificando seu aplicativo&quot;">​</a></h3><p>Agora que você executou o aplicativo com sucesso, vamos modificá-lo.</p><ul><li>Abra <code>App.tsx</code> no editor de texto de sua preferência e edite algumas linhas.</li><li>Pressione <code>Cmd ⌘</code> + <code>R</code> no seu simulador iOS para recarregar o aplicativo e ver suas alterações!</li></ul><h2 id="e-isso" tabindex="-1">É isso! <a class="header-anchor" href="#e-isso" aria-label="Permalink to &quot;É isso!&quot;">​</a></h2><p>Parabéns! Você executou e modificou com sucesso seu primeiro aplicativo React Native.</p><p><img src="'+a+'" alt="image"></p><h2 id="e-agora" tabindex="-1">E agora? <a class="header-anchor" href="#e-agora" aria-label="Permalink to &quot;E agora?&quot;">​</a></h2><ul><li>Se você deseja adicionar este novo código React Native a um aplicativo existente, consulte o <a href="/docs/integration-with-existing-apps.html">guia de integração</a>.</li></ul><p>Se você estiver curioso para saber mais sobre o React Native, confira a <a href="https://reactnative.dev/docs/getting-started.md" target="_blank" rel="noreferrer">Introdução ao React Native</a>.</p>',62),d=[c];function l(p,h,u,m,v,g){return s(),o("div",null,d)}const F=e(r,[["render",l]]);export{f as __pageData,F as default};
