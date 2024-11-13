import{_ as i,c as a,o as s,a4 as e}from"./chunks/framework.nQaBHiNx.js";const m=JSON.parse('{"title":"Verificação por e-mail","description":"","frontmatter":{},"headers":[],"relativePath":"docs/verification.md","filePath":"docs/verification.md"}'),n={name:"docs/verification.md"},t=e(`<h1 id="verificacao-por-e-mail" tabindex="-1">Verificação por e-mail <a class="header-anchor" href="#verificacao-por-e-mail" aria-label="Permalink to &quot;Verificação por e-mail&quot;">​</a></h1><p><a name="introduction"></a></p><h2 id="introducao" tabindex="-1">Introdução <a class="header-anchor" href="#introducao" aria-label="Permalink to &quot;Introdução&quot;">​</a></h2><p>Muitos aplicativos da web exigem que os usuários verifiquem seus endereços de e-mail antes de usar o aplicativo. Em vez de forçá-lo a reimplementar esse recurso manualmente para cada aplicativo que você cria, o Laravel fornece serviços convenientes incorporados para enviar e verificar solicitações de verificação de e-mail.</p><div class="info custom-block"><p class="custom-block-title">NOTA</p><p>Quer começar rápido? Instale um dos <a href="https://laravel.com/docs/starter-kits" target="_blank" rel="noreferrer">Kit de Início Laravel</a> em um novo aplicativo Laravel. Os kits de início cuidarão do seu sistema completo de autenticação, incluindo suporte para verificação por e-mail.</p></div><p><a name="model-preparation"></a></p><h3 id="preparacao-do-modelo" tabindex="-1">Preparação do Modelo <a class="header-anchor" href="#preparacao-do-modelo" aria-label="Permalink to &quot;Preparação do Modelo&quot;">​</a></h3><p>Antes de começar, verifique se o seu modelo <code>App\\Models\\User</code> implementa o contrato <code>Illuminate\\Contracts\\Auth\\MustVerifyEmail</code>:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    &lt;?</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">php</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    namespace</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> App\\Models</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Contracts\\Auth\\MustVerifyEmail</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Foundation\\Auth\\User</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> as</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Authenticatable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Notifications\\Notifiable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> User</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Authenticatable</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> implements</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MustVerifyEmail</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Notifiable</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span></code></pre></div><p>Uma vez que esta interface tenha sido adicionada ao seu modelo, os novos usuários registrados serão automaticamente enviados um e-mail contendo um link de verificação de conta. Isso acontece sem problemas porque o Laravel registra automaticamente o <code>Illuminate\\Auth\\Listeners\\SendEmailVerificationNotification</code> <a href="/docs/events.html">ouvinte</a> para o evento <code>Illuminate\\Auth\\Events\\Registered</code>.</p><p>Se você está implementando manualmente a inscrição dentro do seu aplicativo em vez de usar um <a href="/docs/starter-kits.html">Kit de Início</a>, você deve garantir que o evento <code>Illuminate\\Auth\\Events\\Registered</code> é enviado após uma inscrição bem sucedida.</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Auth\\Events\\Registered</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    event</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Registered</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">($user));</span></span></code></pre></div><p><a name="database-preparation"></a></p><h3 id="preparacao-do-banco-de-dados" tabindex="-1">Preparação do banco de dados <a class="header-anchor" href="#preparacao-do-banco-de-dados" aria-label="Permalink to &quot;Preparação do banco de dados&quot;">​</a></h3><p>Em seguida, sua tabela de usuários deve conter uma coluna de e-mail verificada em que você armazena a data e hora que o endereço de e-mail do usuário foi verificado. Geralmente isso está incluído na migração padrão do banco de dados <code>0001_01_01_000000_create_users_table.php</code> do Laravel</p><p><a name="verification-routing"></a></p><h2 id="rotas" tabindex="-1">Rotas <a class="header-anchor" href="#rotas" aria-label="Permalink to &quot;Rotas&quot;">​</a></h2><p>Para implementar adequadamente a verificação de e-mail, três rotas serão necessárias. Primeiro, uma rota será necessária para exibir uma notificação ao usuário que ele deve clicar no link de verificação de e-mail no e-mail enviado pelo Laravel após o registro.</p><p>Em segundo lugar, uma rota será necessária para lidar com as requisições geradas quando o usuário clicar no link de verificação de e-mail no e-mail.</p><p>Terceiro, uma rota será necessária para reenviar um link de verificação se o usuário acidentalmente perder o primeiro link de verificação.</p><p><a name="the-email-verification-notice"></a></p><h3 id="notificacao-de-verificacao-de-e-mail" tabindex="-1">Notificação de verificação de e-mail <a class="header-anchor" href="#notificacao-de-verificacao-de-e-mail" aria-label="Permalink to &quot;Notificação de verificação de e-mail&quot;">​</a></h3><p>Como mencionado anteriormente, uma rota deve ser definida que retornará uma visão instruindo o usuário a clicar no link de verificação de e-mail enviado pelo Laravel após o registro. Esta visão será exibida aos usuários quando eles tentarem acessar outras partes do aplicativo sem verificar primeiro seu endereço de e-mail. Lembre-se, o link é automaticamente enviado para o usuário desde que seu modelo <code>App\\Models\\User</code> implemente a interface <code>MustVerifyEmail</code>:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    Route</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/email/verify&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> view</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;auth.verify-email&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    })</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">middleware</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;auth&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;verification.notice&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>A rota que retorna o aviso de verificação de e-mail deve ser nomeada <code>verification.notice</code>. É importante que a rota receba esse nome exato, pois o middleware <code>verified</code> <a href="#protecting-routes">incluído com o Laravel</a> redirecionará automaticamente para esse nome de rota se um usuário não tiver verificado seu endereço de e-mail.</p><div class="info custom-block"><p class="custom-block-title">NOTA</p><p>Ao implementar manualmente a verificação de e-mail, você é obrigado a definir o conteúdo da visualização do aviso de verificação de conta por si mesmo. Se você gostaria de um modelo pré-definido com todas as visualizações necessárias para autenticação e verificação de contas, verifique os <a href="/docs/starter-kits.html">kits iniciais de aplicativos Laravel</a>.</p></div><p><a name="the-email-verification-handler"></a></p><h3 id="o-manipulador-de-verificacao-de-e-mail" tabindex="-1">O manipulador de verificação de e-mail <a class="header-anchor" href="#o-manipulador-de-verificacao-de-e-mail" aria-label="Permalink to &quot;O manipulador de verificação de e-mail&quot;">​</a></h3><p>Em seguida, precisamos definir uma rota que irá lidar com as solicitações geradas quando o usuário clicar no link de verificação por e-mail enviado a ele. Esta rota deve ser chamada <code>verification.verify</code> e deve ter os middlewares <code>auth</code> e <code>signed</code>:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Foundation\\Auth\\EmailVerificationRequest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    Route</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/email/verify/{id}/{hash}&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">EmailVerificationRequest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $request) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        $request</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fulfill</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> redirect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/home&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    })</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">middleware</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;auth&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;signed&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">])</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;verification.verify&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>Antes de prosseguir, vamos examinar mais de perto essa rota. Primeiro, você perceberá que estamos usando um tipo de solicitação <code>EmailVerificationRequest</code> em vez do tipo de solicitação padrão <code>Illuminate\\Http\\Request</code>. O <code>EmailVerificationRequest</code> é um <a href="/docs/validation.html#form-request-validation">tipo de solicitação de formulário</a> incluído no Laravel. Esta solicitação cuidará automaticamente da validação dos parâmetros <code>id</code> e <code>hash</code> da solicitação.</p><p>Em seguida, podemos prosseguir diretamente para chamar o método <code>fulfill</code> na solicitação. Este método chamará <code>markEmailAsVerified</code> no usuário autenticado e enviará o evento <code>Illuminate\\Auth\\Events\\Verified</code>. O método <code>markEmailAsVerified</code> está disponível no modelo padrão <code>App\\Models\\User</code> via a classe base <code>Illuminate\\Foundation\\Auth\\User</code>. Uma vez que o endereço de e-mail do usuário tenha sido verificado, você pode redirecioná-lo para onde quiser.</p><p><a name="resending-the-verification-email"></a></p><h3 id="enviando-o-email-de-verificacao-novamente" tabindex="-1">Enviando o email de verificação novamente <a class="header-anchor" href="#enviando-o-email-de-verificacao-novamente" aria-label="Permalink to &quot;Enviando o email de verificação novamente&quot;">​</a></h3><p>Às vezes um usuário pode confundir ou acidentalmente excluir o e-mail de verificação de endereço. Para resolver isso, você pode definir uma rota para permitir que o usuário solicite que o e-mail de verificação seja re-enviado. Em seguida, você pode fazer um pedido dessa rota colocando um botão simples de envio de formulário dentro da <a href="#the-email-verification-notice">verificação de notificação por e-mail</a>:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Http\\Request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    Route</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">post</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/email/verification-notification&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">Request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $request) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        $request</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">user</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sendEmailVerificationNotification</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> back</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">with</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;message&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Verification link sent!&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    })</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">middleware</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;auth&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;throttle:6,1&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">])</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;verification.send&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p><a name="protecting-routes"></a></p><h3 id="protegendo-rotas" tabindex="-1">Protegendo Rotas <a class="header-anchor" href="#protegendo-rotas" aria-label="Permalink to &quot;Protegendo Rotas&quot;">​</a></h3><p>O middleware <a href="/docs/middleware.html">Route middleware</a> pode ser utilizado para permitir somente usuários verificados ao acessar um determinado recurso. O Laravel inclui um alias chamado <code>verified</code> do middleware <a href="/docs/middleware.html#middleware-alias">middleware alias</a>, que é uma abreviação da classe middleware <code>Illuminate\\Auth\\Middleware\\EnsureEmailIsVerified</code>. Como o Laravel já registra automaticamente este alias, tudo o que você precisa fazer é anexar o middleware <code>verified</code> a uma definição de rota. Normalmente, esse middleware é associado ao middleware <code>auth</code>:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    Route</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/profile&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Somente usuários verificados podem acessar esta rota...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    })</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">middleware</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">([</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;auth&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;verified&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]);</span></span></code></pre></div><p>Se um usuário não verificado tenta acessar uma rota que tem sido atribuída a este middleware, ele será automaticamente redirecionado para a <a href="/docs/routing.html#named-routes">rota nomeada</a> <code>verification.notice</code>.</p><p><a name="customization"></a></p><h2 id="personalizacao" tabindex="-1">Personalização <a class="header-anchor" href="#personalizacao" aria-label="Permalink to &quot;Personalização&quot;">​</a></h2><p><a name="verification-email-customization"></a></p><h4 id="personalizacao-da-verificacao-por-e-mail" tabindex="-1">Personalização da verificação por e-mail <a class="header-anchor" href="#personalizacao-da-verificacao-por-e-mail" aria-label="Permalink to &quot;Personalização da verificação por e-mail&quot;">​</a></h4><p>Embora a notificação padrão de verificação por e-mail deva satisfazer as exigências da maioria dos aplicativos, o Laravel permite que você personalize como a mensagem do e-mail de verificação é construída.</p><p>Para começar, passe um closure para o método <code>toMailUsing</code> fornecido pela classe <code>Illuminate\\Auth\\Notifications\\VerifyEmail</code> da notificação. O closure receberá a instância do modelo que está recebendo a notificação, assim como a URL de verificação de e-mail com assinatura que o usuário deve visitar para verificar seu endereço de e-mail. O closure deve retornar uma instância de <code>Illuminate\\Notifications\\Messages\\MailMessage</code>. Normalmente, você chama o método <code>toMailUsing</code> do método <code>boot</code> da classe <code>AppServiceProvider</code> do seu aplicativo:</p><div class="language-php vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">php</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Auth\\Notifications\\VerifyEmail</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Illuminate\\Notifications\\Messages\\MailMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * Inicialize qualquer serviço de aplicativo.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> boot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ...</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        VerifyEmail</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toMailUsing</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $notifiable, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> $url) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> MailMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                -&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">subject</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Verify Email Address&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                -&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">line</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Click the button below to verify your email address.&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                -&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">action</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Verify Email Address&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, $url);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span></code></pre></div><div class="info custom-block"><p class="custom-block-title">NOTA</p><p>Para aprender mais sobre notificações por e-mail, consulte a documentação de notificações <a href="/docs/notifications.html#mail-notifications">pelo e-mail</a>.</p></div><p><a name="events"></a></p><h2 id="eventos" tabindex="-1">Eventos <a class="header-anchor" href="#eventos" aria-label="Permalink to &quot;Eventos&quot;">​</a></h2><p>Ao usar o <a href="/docs/starter-kits.html">Laravel Starter Kits</a>, o Laravel envia um evento <code>Illuminate\\Auth\\Events\\Verified</code> durante o processo de verificação de e-mail. Se você estiver lidando manualmente com a verificação de e-mail para sua aplicação, poderá enviar manualmente esses eventos após a conclusão da verificação.</p>`,52),l=[t];function o(r,p,h,d,k,c){return s(),a("div",null,l)}const u=i(n,[["render",o]]);export{m as __pageData,u as default};
