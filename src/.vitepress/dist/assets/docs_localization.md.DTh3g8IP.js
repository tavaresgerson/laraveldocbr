import{_ as e,c as n,m as s,a,t as o,a4 as i,o as t}from"./chunks/framework.nQaBHiNx.js";const y=JSON.parse('{"title":"Localização","description":"","frontmatter":{},"headers":[],"relativePath":"docs/localization.md","filePath":"docs/localization.md"}'),p={name:"docs/localization.md"},l=i(`<h1 id="localizacao" tabindex="-1">Localização <a class="header-anchor" href="#localizacao" aria-label="Permalink to &quot;Localização&quot;">​</a></h1><h2 id="introducao" tabindex="-1">Introdução <a class="header-anchor" href="#introducao" aria-label="Permalink to &quot;Introdução&quot;">​</a></h2><div class="info custom-block"><p class="custom-block-title">NOTA</p><p>Por padrão, o esqueleto de aplicativo do Laravel não inclui o diretório <code>lang</code>. Se você gostaria de personalizar os arquivos de idiomas do Laravel, você pode publicá-los através do comando Artisan <code>lang:publish</code>.</p></div><p>As funcionalidades de localização do Laravel fornecem uma forma conveniente de recuperar as strings em vários idiomas, o que permite dar suporte a múltiplos idiomas na aplicação.</p><p>O Laravel disponibiliza duas formas de gerir frases de tradução. Em primeiro lugar, é possível armazenar frases numa língua em arquivos no diretório <code>lang</code> da aplicação. Neste diretório podem existir subdiretórios para cada língua suportada pela aplicação. Este é o método utilizado pelo Laravel para gerir frases de tradução para recursos internos do Laravel, como mensagens de erros de validação:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>    /lang</span></span>
<span class="line"><span>        /en</span></span>
<span class="line"><span>            messages.php</span></span>
<span class="line"><span>        /es</span></span>
<span class="line"><span>            messages.php</span></span></code></pre></div><p>Ou, as sequências de tradução podem ser definidas dentro dos arquivos JSON que estão localizados no diretório <code>lang</code>. Nesta abordagem, cada idioma suportado pela sua aplicação terá um ficheiro JSON correspondente neste diretório. Recomendamos esta abordagem para aplicações com muitas sequências de tradução:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>    /lang</span></span>
<span class="line"><span>        en.json</span></span>
<span class="line"><span>        es.json</span></span></code></pre></div><p>Vamos abordar cada uma das formas de gerir as frases para tradução nesta documentação.</p><p><a name="publishing-the-language-files"></a></p><h3 id="publicando-os-arquivos-de-idioma" tabindex="-1">Publicando os arquivos de idioma <a class="header-anchor" href="#publicando-os-arquivos-de-idioma" aria-label="Permalink to &quot;Publicando os arquivos de idioma&quot;">​</a></h3><p>Por padrão, o esqueleto de aplicativo do Laravel não inclui a pasta <code>lang</code>. Se você deseja personalizar os arquivos de idioma do Laravel ou criar seus próprios, deve incorporar na pasta <code>lang</code> através do comando <code>lang:publish</code> do Artisan. O comando <code>lang:publish</code> irá incorporar a pasta <code>lang</code> em seu aplicativo e publicar o conjunto padrão de arquivos de idioma usados pelo Laravel:</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">php</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> artisan</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> lang:publish</span></span></code></pre></div><p><a name="configuring-the-locale"></a></p><h3 id="configurando-a-linguagem-e-o-pais-regiao" tabindex="-1">Configurando a Linguagem e o País/Região <a class="header-anchor" href="#configurando-a-linguagem-e-o-pais-regiao" aria-label="Permalink to &quot;Configurando a Linguagem e o País/Região&quot;">​</a></h3><p>O idioma padrão para seu aplicativo é armazenado na opção de configuração <code>locale</code> do arquivo de configuração <code>config/app.php</code>, que normalmente é definida usando a variável de ambiente <code>APP_LOCALE</code>. Você é livre para modificar esse valor para atender às necessidades do seu aplicativo.</p><p>Você também pode configurar um &quot;idioma fallback&quot;, que será usado quando o idioma padrão não contiver uma determinada string de tradução. Assim como o idioma padrão, o idioma fallback também é configurado no arquivo de configuração <code>config/app.php</code>, e seu valor é normalmente definido usando a variável de ambiente <code>APP_FALLBACK_LOCALE</code>.</p><p>Você pode modificar o idioma padrão para uma única solicitação HTTP em tempo de execução usando o método <code>setLocale</code> fornecido pela fachada <code>App</code>:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Support\\Facades\\App</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    Route</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/greeting/{locale}&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $locale) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> in_array</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">($locale, [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;en&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;es&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;fr&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">])) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">            abort</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">400</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        App</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setLocale</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">($locale);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    });</span></span></code></pre></div><p><a name="determining-the-current-locale"></a></p><h4 id="determinar-o-local-atual" tabindex="-1">Determinar o local atual <a class="header-anchor" href="#determinar-o-local-atual" aria-label="Permalink to &quot;Determinar o local atual&quot;">​</a></h4><p>Você pode usar os métodos <code>currentLocale</code> e <code>isLocale</code> da facade <code>App</code> para determinar o local atual ou verificar se o local é um valor específico:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Support\\Facades\\App</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    $locale </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> App</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">currentLocale</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">App</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isLocale</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;en&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span></code></pre></div><p><a name="pluralization-language"></a></p><h3 id="linguagem-de-pluralizacao" tabindex="-1">Linguagem de pluralização <a class="header-anchor" href="#linguagem-de-pluralizacao" aria-label="Permalink to &quot;Linguagem de pluralização&quot;">​</a></h3><p>Você pode instruir o &quot;pluralizer&quot; do Laravel, que é usado pelo Eloquent e por outras partes do framework para converter strings singulares para strings plurais, a usar um idioma diferente de inglês. Isso pode ser realizado invocando o método <code>useLanguage</code> dentro do método <code>boot</code> de um dos provedores de serviços da sua aplicação. Os idiomas suportados atualmente pelo pluralizer são: <code>french</code>, <code>norwegian-bokmal</code>, <code>portuguese</code>, <code>spanish</code>, e <code>turkish</code>:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Support\\Pluralizer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * Inicialize qualquer serviço de aplicativo.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> boot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        Pluralizer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">useLanguage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;spanish&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);     </span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ...     </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span></code></pre></div><div class="warning custom-block"><p class="custom-block-title">ATENÇÃO</p><p>Se você personalizar o idioma do pluralizador, deverá definir explicitamente os <a href="/docs/eloquent.html#table-names">nomes das tabelas</a> do seu modelo Eloquent.</p></div><p><a name="defining-translation-strings"></a></p><h2 id="definindo-strings-de-traducao" tabindex="-1">Definindo strings de tradução <a class="header-anchor" href="#definindo-strings-de-traducao" aria-label="Permalink to &quot;Definindo strings de tradução&quot;">​</a></h2><p><a name="using-short-keys"></a></p><h3 id="usando-chaves-curtas" tabindex="-1">Usando chaves curtas <a class="header-anchor" href="#usando-chaves-curtas" aria-label="Permalink to &quot;Usando chaves curtas&quot;">​</a></h3><p>Normalmente, as mensagens de tradução são armazenadas em arquivos dentro do diretório <code>lang</code>. Dentro desse diretório, deve haver um subdiretório para cada idioma suportado pelo seu aplicativo. Esse é o mesmo método utilizado pelo Laravel para gerenciar as mensagens de tradução de recursos internos, como mensagens de erros de validação:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>    /lang</span></span>
<span class="line"><span>        /en</span></span>
<span class="line"><span>            messages.php</span></span>
<span class="line"><span>        /es</span></span>
<span class="line"><span>            messages.php</span></span></code></pre></div><p>Todos os arquivos de linguagens retornam uma matriz de strings com chaves. Por exemplo:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;?</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">php</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // lang/en/messages.php</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &#39;welcome&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;Welcome to our application!&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ];</span></span></code></pre></div><div class="warning custom-block"><p class="custom-block-title">ATENÇÃO</p><p>Para línguas que diferem por território, você deve nomear os diretórios de idiomas conforme a norma ISO 15897. Por exemplo, &quot;en_GB&quot; é mais adequado para inglês britânico do que &quot;en-gb&quot;.</p></div><p><a name="using-translation-strings-as-keys"></a></p><h3 id="usando-strings-de-traducao-como-chaves" tabindex="-1">Usando strings de tradução como chaves <a class="header-anchor" href="#usando-strings-de-traducao-como-chaves" aria-label="Permalink to &quot;Usando strings de tradução como chaves&quot;">​</a></h3><p>Para aplicações com um elevado número de frases traduzíveis, a definição de cada frase com uma &quot;chave curta&quot; torna-se confusa no que diz respeito à referência das chaves nas vistas e é pesada porque se terá de criar continuamente novas chaves para todas as frases traduzíveis suportadas pela aplicação.</p><p>Por este motivo, o Laravel fornece suporte para definir strings de tradução usando o &quot;default&quot; (padrão) tradução da string como chave. Arquivos de linguagem que usam strings de tradução como chaves são armazenados como arquivos JSON no diretório <code>lang</code>. Por exemplo, se o seu aplicativo tiver uma tradução em espanhol, você deve criar um arquivo <code>es.json</code>:</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;I love programming.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Me encanta programar.&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="conflitos-de-chave-arquivo" tabindex="-1">Conflitos de chave/arquivo <a class="header-anchor" href="#conflitos-de-chave-arquivo" aria-label="Permalink to &quot;Conflitos de chave/arquivo&quot;">​</a></h4><p>Não é aconselhável definir chaves de strings de tradução que entrarem em conflito com outros nomes de arquivos de tradução. Por exemplo, traduzir <code>__(&#39;Action&#39;)</code>, no contexto da localização &quot;NL&quot;, enquanto existe um ficheiro <code>nl/action.php</code> mas não existe um ficheiro <code>nl.json</code>, pode resultar na informação de todo o conteúdo do ficheiro <code>nl/action.php</code> ser retornada pelo tradutor.</p><p><a name="retrieving-translation-strings"></a></p><h2 id="recuperacao-de-strings-de-traducao" tabindex="-1">Recuperação de strings de tradução <a class="header-anchor" href="#recuperacao-de-strings-de-traducao" aria-label="Permalink to &quot;Recuperação de strings de tradução&quot;">​</a></h2><p>Você pode recuperar as frases de tradução dos seus arquivos de linguagem utilizando a função de auxiliar <code>__</code>. Se estiver a utilizar &quot;<em>short keys</em>&quot; (chaves-curtas) para definir as suas frases de tradução, deve passar o arquivo que contém a chave e a própria chave à função <code>__</code>, utilizando a sintaxe de ponto. Por exemplo, vamos recuperar a frase de tradução &quot;<em>welcome</em>&quot; do arquivo de linguagem &quot;lang/en/messages.php&quot;:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    echo</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> __</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;messages.welcome&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>Se a string de tradução especificada não existir, a função <code>__</code> retornará o nome da chave da tradução. Portanto, usando o exemplo acima, a função <code>__</code> retorna <code>messages.welcome</code> se a string de tradução não existir.</p><p>Se você estiver usando suas <a href="#using-translation-strings-as-keys">cadeias de tradução padrão como chaves de tradução</a>, você deverá passar a tradução padrão de sua cadeia para a função <code>__</code>:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    echo</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> __</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;I love programming.&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>Mais uma vez, se a cadeia de tradução não existir, a função <code>__</code> irá retornar o nome da chave da cadeia de tradução que foi passada.</p>`,52),r=s("a",{href:"/docs/blade.html"},"Blade",-1),d=i(`<div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {{ </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">__</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;messages.welcome&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) }}</span></span></code></pre></div><p><a name="replacing-parameters-in-translation-strings"></a></p><h3 id="substituir-os-parametros-nas-strings-de-traducao" tabindex="-1">Substituir os parâmetros nas strings de tradução <a class="header-anchor" href="#substituir-os-parametros-nas-strings-de-traducao" aria-label="Permalink to &quot;Substituir os parâmetros nas strings de tradução&quot;">​</a></h3><p>Se desejar, você pode definir marcadores em suas mensagens de tradução. Todos os marcadores começam com o sinal <code>:</code>. Por exemplo, você pode definir uma mensagem de boas-vindas com um nome de marcador:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;welcome&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;Welcome, :name&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span></code></pre></div><p>Para substituir os marcadores no processo de recuperação da string de tradução, você pode passar um array com as substituições como segundo argumento para a função <code>__</code>:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    echo</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> __</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;messages.welcome&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;name&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;dayle&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]);</span></span></code></pre></div><p>Se o marcador contiver todas as letras maiúsculas ou apenas a primeira letra maiúscula, o valor será traduzido para maiúsculo de acordo com isso:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;welcome&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;Welcome, :NAME&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Welcome, DAYLE</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;goodbye&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;Goodbye, :Name&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Goodbye, Dayle</span></span></code></pre></div><p><a name="object-replacement-formatting"></a></p><h4 id="formatacao-de-substituicao-de-objeto" tabindex="-1">Formatação de substituição de objeto <a class="header-anchor" href="#formatacao-de-substituicao-de-objeto" aria-label="Permalink to &quot;Formatação de substituição de objeto&quot;">​</a></h4><p>Se você tentar fornecer um objeto como placeholder de tradução, o método <code>__toString</code> do objeto será invocado. O método <a href="https://www.php.net/manual/en/language.oop5.magic.php#object.tostring" target="_blank" rel="noreferrer"><code>__toString</code></a> é um dos métodos &quot;mágicos&quot; incorporadas do PHP. Porém, às vezes você pode não ter controle sobre o método <code>__toString</code> de uma determinada classe, como por exemplo quando a classe que está interagindo pertence a uma biblioteca de terceiros.</p><p>Nestes casos, o Laravel permite que você registre um handler de formatação personalizado para esse tipo particular de objeto. Para fazer isso, você deve invocar o método <code>stringable</code> do translator. A método <code>stringable</code> aceita um closure, que deve indicar o tipo de objeto responsável pelo formato. Normalmente, o método <code>stringable</code> deve ser invocado dentro do método <code>boot</code>, na classe <code>AppServiceProvider</code> do seu aplicativo:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Support\\Facades\\Lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Money\\Money</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * Inicialize qualquer serviço de aplicativo.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> boot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        Lang</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">stringable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Money</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $money) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $money</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">formatTo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;en_GB&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span></code></pre></div><p><a name="pluralization"></a></p><h3 id="pluralizacao" tabindex="-1">Pluralização <a class="header-anchor" href="#pluralizacao" aria-label="Permalink to &quot;Pluralização&quot;">​</a></h3><p>A formação de formas plurais é um problema complexo pois diferentes línguas possuem várias regras para formação de formas plurais. No entanto, o Laravel permite-lhe traduzir strings de maneira diferente com base nas suas próprias definições. Usando a sintaxe <code>|</code>, é possível distinguir as formas singular e plural numa mesma string:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;apples&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;There is one apple|There are many apples&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span></code></pre></div><p>É claro que a pluralização é suportada quando se usam como <a href="#using-translation-strings-as-keys">strings chaves de tradução</a>:</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;There is one apple|There are many apples&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Hay una manzana|Hay muchas manzanas&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>Você também poderá criar regras de pluralização mais complexas, que especifiquem cadeias de tradução para vários intervalos de valores.</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;apples&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;{0} There are none|[1,19] There are some|[20,*] There are many&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span></code></pre></div><p>Após definir uma cadeia de tradução que possui opções de pluralização, é possível usar a função <code>trans_choice</code> para recuperar a linha correspondente ao valor de &quot;count&quot;. Neste exemplo, pois o valor de &quot;count&quot; é superior a um, a forma plural da cadeia de tradução é retornada:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    echo</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> trans_choice</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;messages.apples&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>Você também pode definir atributos de substituição em strings para a pluralização. Estes espaços reservados podem ser substituídos passando um array como terceiro argumento à função <code>trans_choice</code>:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;minutes_ago&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;{1} :value minute ago|[2,*] :value minutes ago&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    echo</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> trans_choice</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;time.minutes_ago&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;value&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]);</span></span></code></pre></div><p>Para exibir o valor inteiro que foi passado para a função <code>trans_choice</code>, você pode usar o marcador de lugar-comum interno &quot;:&quot;count&quot;:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;apples&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;{0} There are none|{1} There is one|[2,*] There are :count&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span></code></pre></div><p><a name="overriding-package-language-files"></a></p><h2 id="substituindo-arquivos-de-idioma-do-pacote" tabindex="-1">Substituindo arquivos de idioma do pacote <a class="header-anchor" href="#substituindo-arquivos-de-idioma-do-pacote" aria-label="Permalink to &quot;Substituindo arquivos de idioma do pacote&quot;">​</a></h2><p>Alguns pacotes podem ser enviados com seus próprios arquivos de idiomas. Em vez de alterar os arquivos principais do pacote para ajustar essas linhas, você poderá substituí-las colocando arquivos na pasta <code>lang/vendor/{package}/{locale}</code>.</p><p>Por exemplo, se você precisar substituir as frases de tradução em <code>messages.php</code> para um pacote chamado <code>skyrim/hearthfire</code>, você deve colocar o arquivo de idiomas em: <code>lang/vendor/hearthfire/en/messages.php</code>. Neste arquivo, só devem ser definidas as frases de tradução que desejam substituir. As frases de tradução não substituídas ainda serão carregadas a partir dos arquivos de idiomas originais do pacote.</p>`,32);function h(c,k,u,g,m,E){return t(),n("div",null,[l,s("p",null,[a("Se você estiver usando o motor de template "),r,a(", pode usar a sintaxe "),s("code",null,o(),1),a(" para mostrar a string de caracteres de tradução.")]),d])}const F=e(p,[["render",h]]);export{y as __pageData,F as default};
