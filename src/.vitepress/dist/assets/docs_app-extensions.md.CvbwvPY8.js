import{_ as e,c as a,o as s,a4 as o}from"./chunks/framework.nQaBHiNx.js";const x=JSON.parse('{"title":"Extensões de aplicativos","description":"","frontmatter":{},"headers":[],"relativePath":"docs/app-extensions.md","filePath":"docs/app-extensions.md"}'),t={name:"docs/app-extensions.md"},i=o('<h1 id="extensoes-de-aplicativos" tabindex="-1">Extensões de aplicativos <a class="header-anchor" href="#extensoes-de-aplicativos" aria-label="Permalink to &quot;Extensões de aplicativos&quot;">​</a></h1><p>As extensões de aplicativo permitem fornecer funcionalidade e conteúdo personalizados fora do aplicativo principal. Existem diferentes tipos de extensões de aplicativos no iOS, e todas elas são abordadas no <a href="https://developer.apple.com/library/content/documentation/General/Conceptual/ExtensibilityPG/index.html#//apple_ref/doc/uid/TP40014214-CH20-SW1" target="_blank" rel="noreferrer">Guia de programação de extensões de aplicativos</a>. Neste guia, abordaremos brevemente como você pode aproveitar as vantagens das extensões de aplicativos no iOS.</p><h2 id="uso-de-memoria-em-extensoes" tabindex="-1">Uso de memória em extensões <a class="header-anchor" href="#uso-de-memoria-em-extensoes" aria-label="Permalink to &quot;Uso de memória em extensões&quot;">​</a></h2><p>Como essas extensões são carregadas fora da sandbox normal do aplicativo, é altamente provável que várias dessas extensões de aplicativo sejam carregadas simultaneamente. Como seria de esperar, essas extensões têm pequenos limites de uso de memória. Tenha isso em mente ao desenvolver suas extensões de aplicativo. É sempre altamente recomendável testar seu aplicativo em um dispositivo real, ainda mais ao desenvolver extensões de aplicativo: com muita frequência, os desenvolvedores descobrem que sua extensão funciona bem no simulador iOS, apenas para receber relatórios de usuários de que sua extensão não está carregando em dispositivos reais.</p><p>É altamente recomendável que você assista à palestra de Conrad Kramer sobre <a href="https://www.youtube.com/watch?v=GqXMqn6MXrM" target="_blank" rel="noreferrer">Uso de memória em extensões</a> para saber mais sobre esse tópico.</p><h3 id="widget-today" tabindex="-1">Widget Today <a class="header-anchor" href="#widget-today" aria-label="Permalink to &quot;Widget Today&quot;">​</a></h3><p>O limite de memória de um widget Hoje é de 16 MB. Acontece que as implementações do widget Today usando React Native podem não funcionar de maneira confiável porque o uso de memória tende a ser muito alto. Você pode saber se o widget Today está excedendo o limite de memória se exibir a mensagem &#39;Não é possível carregar&#39;:</p><p><img src="https://github.com/tavaresgerson/reactnativedocbr/assets/22455192/f3da10aa-01c1-413a-b65f-d3fe8b3a127c" alt="image"></p><p>Sempre teste suas extensões de aplicativo em um dispositivo real, mas esteja ciente de que isso pode não ser suficiente, especialmente ao lidar com o widget Today. As compilações configuradas para depuração têm maior probabilidade de exceder os limites de memória, enquanto as compilações configuradas para versão não falham imediatamente. É altamente recomendável que você use <a href="https://developer.apple.com/library/content/documentation/DeveloperTools/Conceptual/InstrumentsUserGuide/index.html" target="_blank" rel="noreferrer">Instrumentos do Xcode</a> para analisar seu uso de memória no mundo real, pois é muito provável que sua compilação configurada para lançamento está muito próxima do limite de 16 MB. Em situações como essas, você pode ultrapassar rapidamente o limite de 16 MB executando operações comuns, como buscar dados de uma API.</p><p>Para experimentar os limites das implementações do widget React Native Today, tente estender o projeto de exemplo em <a href="https://github.com/matejkriz/react-native-today-widget/" target="_blank" rel="noreferrer">react-native-today-widget</a>.</p><h3 id="outras-extensoes-de-aplicativos" tabindex="-1">Outras extensões de aplicativos <a class="header-anchor" href="#outras-extensoes-de-aplicativos" aria-label="Permalink to &quot;Outras extensões de aplicativos&quot;">​</a></h3><p>Outros tipos de extensões de aplicativo têm limites de memória maiores que o widget Today. Por exemplo, as extensões de teclado personalizado são limitadas a 48 MB e as extensões de compartilhamento são limitadas a 120 MB. Implementar essas extensões de aplicativo com React Native é mais viável. Um exemplo de prova de conceito é <a href="https://github.com/andrewsardone/react-native-ios-share-extension" target="_blank" rel="noreferrer">react-native-ios-share-extension</a>.</p>',12),r=[i];function n(d,m,l,p,c,u){return s(),a("div",null,r)}const h=e(t,[["render",n]]);export{x as __pageData,h as default};
