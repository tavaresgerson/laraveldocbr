# Agrupamento de Ativos (Vite)

<a name="introduction"></a>
## Introdução

 [Vite](https://vitejs.dev) é uma ferramenta de compilação de frontend moderno que oferece um ambiente de desenvolvimento extremamente rápido e integra os seus códigos em ativos prontos para produção. Normalmente, ao construir aplicativos com o Laravel, você usará o Vite para integrar arquivos CSS e JavaScript do seu aplicativo em ativos prontos para a produção

 O Laravel é totalmente integrado com o Vite, fornecendo um plug-in oficial e uma diretiva Blade para carregar seus ativos para desenvolvimento e produção.

 > [!AVISO]
 [Sítio web do Laravel Mixed](https://laravel-mix.com/). Se quiseres mudar para o Vite, por favor consulta os nossos

<a name="vite-or-mix"></a>
#### Escolha entre o Vite e o Laravel Mix

 Antes de migrar para o Vite, os novos aplicativos Laravel utilizavam [Mix](https://laravel-mix.com/), que é alimentado pelo [webpack](https://webpack.js.org/) ao agrupar ativos. O Vite se concentra em fornecer uma experiência mais rápida e produtiva para a criação de aplicações JavaScript ricas. Se você estiver desenvolvendo um Single Page Application (SPA), incluindo aqueles desenvolvidos com ferramentas como [Inertia](https://inertiajs.com/), o Vite será a escolha perfeita.

 O Vite também funciona bem com aplicativos tradicionais renderizados do lado do servidor com "pingos" de JavaScript, incluindo aqueles que utilizam [Livewire](https://livewire.laravel.com). No entanto, ele carece de algumas características suportadas pelo Laravel Mix, como a capacidade de copiar ativos arbitrários no compilado que não são referenciados diretamente em seu aplicativo JavaScript.

<a name="migrating-back-to-mix"></a>
#### Migração para o Mix

 Você iniciou um novo aplicativo Laravel usando nosso escopo Vite, mas precisa voltar ao Laravel Mix e webpack? Não há problema. Consulte nosso [guia oficial sobre a migração do Vite para o Mix] (https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-vite-to-laravel-mix).

<a name="installation"></a>
## Instalação e configuração

 > [!AVISO]
 Os [Kits de Inicialização](/docs/starter-kits) já incluem todo este suporte e são o meio mais rápido para começar a trabalhar com Laravel e Vite.

<a name="installing-node"></a>
### Instalando o Node

 Você precisa certificar-se de que o Node.js (16+) e o NPM estão instalados antes de executar o Vite e o plugin Laravel:

```sh
node -v
npm -v
```

 Você pode instalar facilmente a versão mais recente do Node e NPM usando instaladores gráficos simples no [site oficial do Node](https://nodejs.org/en/download/). Se você estiver usando o [Laravel Sail](https://laravel.com/docs/sail), poderá invocar o Node e o NPM por meio do Sail:

```sh
./vendor/bin/sail node -v
./vendor/bin/sail npm -v
```

<a name="installing-vite-and-laravel-plugin"></a>
### Instalando o Vite e o plugin do Laravel

 Em uma instalação recente do Laravel, você encontrará um arquivo `package.json` na raiz da estrutura de diretórios da aplicação. O arquivo padrão `package.json` já inclui tudo que é necessário para começar a usar o Vite e o plugin Laravel. Você pode instalar as dependências front-end da sua aplicação por meio do NPM:

```sh
npm install
```

<a name="configuring-vite"></a>
### Configurando o Vite

 O Vite é configurado por meio de um arquivo `vite.config.js` na raiz do seu projeto. É livre para personalizar este arquivo de acordo com suas necessidades, e você também pode instalar outros plugins que o aplicativo exija, como `@vitejs/plugin-vue` ou `@vitejs/plugin-react`.

 O plugin Laravel Vite exige que você especifique os pontos de entrada para a sua aplicação. Estes podem ser arquivos JavaScript ou CSS e incluem linguagens pré-processadas como TypeScript, JSX, TSX e Sass.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css',
            'resources/js/app.js',
        ]),
    ],
});
```

 Se você estiver construindo um SPA (aplicativo de página inicial), incluindo aplicativos construídos usando Inertia, o Vite funciona melhor sem pontos de entrada do CSS:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css', // [tl! remove]
            'resources/js/app.js',
        ]),
    ],
});
```

 Em vez disso, você deve importar seu CSS via JavaScript. Normalmente isto seria feito no arquivo `resources/js/app.js` do aplicativo:

```js
import './bootstrap';
import '../css/app.css'; // [tl! add]
```

 O plug-in do Laravel também suporta vários pontos de entrada e opções avançadas de configuração, como [pontos de entrada SSR (Serviço em Nuvem)](#ssr).

<a name="working-with-a-secure-development-server"></a>
#### Trabalhando com um servidor de desenvolvimento seguro

 Se o servidor web de desenvolvimento do usuário estiver servindo a aplicação por meio do HTTPS, poderá ocorrer problemas para se conectar ao servidor de desenvolvimento Vite.

 Se estiver a utilizar o [Laravel Herd](https://herd.laravel.com) e proteger o site ou se estiver a utilizar o [Laravel Valet](/docs/valet) e executado o comando [seguro](/docs/valet#securing-sites) contra a aplicação, o plugin Laravel Vite irá detectar automaticamente e usar o certificado TLS gerado.

 Se você proteger o site usando um servidor que não combina com o nome do diretório do aplicativo, poderá especificar manualmente o host no arquivo `vite.config.js` do seu aplicativo:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            detectTls: 'my-app.test', // [tl! add]
        }),
    ],
});
```

 Para utilizar outro servidor web, é necessário gerar um certificado de confiança e configurá-lo manualmente no Vite.

```js
// ...
import fs from 'fs'; // [tl! add]

const host = 'my-app.test'; // [tl! add]

export default defineConfig({
    // ...
    server: { // [tl! add]
        host, // [tl! add]
        hmr: { host }, // [tl! add]
        https: { // [tl! add]
            key: fs.readFileSync(`/path/to/${host}.key`), // [tl! add]
            cert: fs.readFileSync(`/path/to/${host}.crt`), // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

 Se você não conseguir gerar um certificado confiável para seu sistema, poderá instalar e configurar o plugin [`@vitejs/plugin-basic-ssl`](https://github.com/vitejs/vite-plugin-basic-ssl). Quando usar certificados não confiáveis, será necessário aceitar a aviso do certificado para o servidor de desenvolvimento do Vite no seu navegador seguindo o link "Local" em sua consola ao executar o comando `npm run dev`.

<a name="configuring-hmr-in-sail-on-wsl2"></a>
#### Executando o Servidor de Desenvolvimento em Sail na WSL2

 Quando você estiver executando o servidor de desenvolvimento do Vite dentro do [Laravel Sail](/docs/sail) no Windows Subsystem for Linux 2 (WSL2), deve adicionar a seguinte configuração ao arquivo `vite.config.js` para garantir que o navegador possa se comunicar com o servidor de desenvolvimento:

```js
// ...

export default defineConfig({
    // ...
    server: { // [tl! add:start]
        hmr: {
            host: 'localhost',
        },
    }, // [tl! add:end]
});
```

 Se as alterações no seu arquivo não estiverem a ser refletidas no browser enquanto o servidor de desenvolvimento está em execução, poderá também precisar de configurar a opção [`server.watch.usePolling`] (https://vitejs.dev/config/server-options.html#server-watch) do Vite.

<a name="loading-your-scripts-and-styles"></a>
### Carregando os seus scripts e estilos

With your Vite entry points configured, you may now reference them in a `@vite()` Blade directive that you add to the `<head>` of your application's root template:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

 Se você estiver importando seu CSS através do JavaScript, será necessário incluir o ponto de entrada do JavaScript:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    @vite('resources/js/app.js')
</head>
```

 A diretiva `@vite` irá detectar automaticamente o servidor de desenvolvimento do Vite e injetará o cliente Vite para ativar a substituição de módulos em tempo de execução. No modo de compilação, a diretiva carrega seus ativos compilados e com versão, incluindo qualquer CSS importado.

 Se necessário, você também pode especificar o caminho de construção de seus ativos compilados ao invocar a diretiva `@vite`:

```blade
<!doctype html>
<head>
    {{-- Given build path is relative to public path. --}}

    @vite('resources/js/app.js', 'vendor/courier/build')
</head>
```

<a name="inline-assets"></a>
#### Ativos On-Line

 Às vezes pode ser necessário incluir o conteúdo bruto dos recursos, em vez de fazer um link para a versão do recurso. Por exemplo, você poderá precisar incluir o conteúdo do recurso diretamente na página ao passar conteúdo HTML para um gerador de PDF. Pode exportar o conteúdo dos recursos Vite usando o método `content` providenciado pela interface "Vite":

```blade
@use('Illuminate\Support\Facades\Vite')

<!doctype html>
<head>
    {{-- ... --}}

    <style>
        {!! Vite::content('resources/css/app.css') !!}
    </style>
    <script>
        {!! Vite::content('resources/js/app.js') !!}
    </script>
</head>
```

<a name="running-vite"></a>
## Executando o Vite

 Há duas maneiras de executar o Vite. O desenvolvedor pode executar o servidor via o comando `dev`, que é útil enquanto ele está trabalhando em seu código localmente. O servidor de desenvolvimento deteta automaticamente alterações nos seus ficheiros e reflecte-as imediatamente nas janelas do browser abertas.

 Ou, ao executar o comando `build`, você versa e integra os recursos da sua aplicação e os prepara para serem enviados à produção:

```shell
# Run the Vite development server...
npm run dev

# Build and version the assets for production...
npm run build
```

 Se você estiver executando o servidor de desenvolvimento em [Sail](/docs/sail) no WSL2, poderá ser necessário algumas opções de configuração adicionais (#Configurando HMR em Sail no WSL2).

<a name="working-with-scripts"></a>
## Trabalhando com JavaScript

<a name="aliases"></a>
### Alias

 Por padrão, o plug-in do Laravel fornece um alias comum para ajudá-lo a começar seu trabalho e importar os ativos de forma conveniente.

```js
{
    '@' => '/resources/js'
}
```

 Você pode sobrescrever o alias `'@'` adicionando seu próprio ao arquivo de configuração `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel(['resources/ts/app.tsx']),
    ],
    resolve: {
        alias: {
            '@': '/resources/ts',
        },
    },
});
```

<a name="vue"></a>
### Vue

 Se você quiser construir seu front-end usando o framework Vue, será necessário instalar também o plug-in `@vitejs/plugin-vue`:

```sh
npm install --save-dev @vitejs/plugin-vue
```

 Em seguida, você poderá incluir o plug-in em seu arquivo de configuração `vite.config.js`. Existem algumas opções adicionais que serão necessárias ao usar o plug-in do Vue com Laravel:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.js']),
        vue({
            template: {
                transformAssetUrls: {
                    // The Vue plugin will re-write asset URLs, when referenced
                    // in Single File Components, to point to the Laravel web
                    // server. Setting this to `null` allows the Laravel plugin
                    // to instead re-write asset URLs to point to the Vite
                    // server instead.
                    base: null,

                    // The Vue plugin will parse absolute URLs and treat them
                    // as absolute paths to files on disk. Setting this to
                    // `false` will leave absolute URLs un-touched so they can
                    // reference assets in the public directory as expected.
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

 > [!ATENÇÃO]
 [Kits de Início](/docs/starter-kits) já incluem a configuração adequada para Laravel, Vue e Vite.

<a name="react"></a>
### Reação

 Se você gostaria de construir o seu frontend usando o framework React (https://reactjs.org/), então será necessário instalar também o plug-in '@vitejs/plugin-react':

```sh
npm install --save-dev @vitejs/plugin-react
```

 Em seguida, você pode incluir o plug-in em seu arquivo de configuração `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.jsx']),
        react(),
    ],
});
```

 Será necessário garantir que qualquer arquivo contendo JSX tenha uma extensão de `.jsx` ou `.tsx`, lembrando-se de atualizar o ponto de entrada, caso seja necessário, como mostrado acima [Configurando Vite].

 Você também precisará incluir a diretiva de Blade adicional `@viteReactRefresh`, ao lado da sua diretiva existente `@vite`.

```blade
@viteReactRefresh
@vite('resources/js/app.jsx')
```

 A diretiva `@viteReactRefresh` deve ser chamada antes da diretiva `@vite`.

 > [!NOTA]
 Os kits inicias (/docs/starter-kits) já incluem a configuração adequada do Laravel, React e Vite.

<a name="inertia"></a>
### Inércia

 O plug-in Laravel Vite fornece uma conveniente função `resolvePageComponent` para ajudá-lo a resolver os componentes de páginas Inertia. Abaixo, é mostrado um exemplo do utilizador da assistência com Vue 3; no entanto, pode também utiliza-la noutros frameworks como o React:

```js
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
  resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
  setup({ el, App, props, plugin }) {
    return createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
});
```

 > [!NOTA]
 Os kits [Iniciante](/docs/starter-kits) já incluem a configuração correta de Laravel, Inertia e Vite.

<a name="url-processing"></a>
### Processamento de URL

 Ao usar o Vite e fazer referência a ativos no HTML, CSS ou JS da sua aplicação, há alguns pontos a ter em consideração. Primeiro, se você fizer referência a um ativo com um caminho absoluto, o Vite não irá incluir o ativo na compilação; portanto, certifique-se de que o ativo esteja disponível no seu diretório público.

 Ao fazer referência a caminhos de ativos relativos, deve ter em atenção que os caminhos são relativos ao ficheiro onde estão referenciados. Quaisquer ativos referenciados por meio de um caminho relativo serão reescritos, versados e agrupados pelo Vite.

 Considere a seguinte estrutura de projeto:

```nothing
public/
  taylor.png
resources/
  js/
    Pages/
      Welcome.vue
  images/
    abigail.png
```

 O exemplo a seguir demonstra como o Vite tratará as URLs relativas e absolutas:

```html
<!-- This asset is not handled by Vite and will not be included in the build -->
<img src="/taylor.png">

<!-- This asset will be re-written, versioned, and bundled by Vite -->
<img src="../../images/abigail.png">
```

<a name="working-with-stylesheets"></a>
## Trabalhando com folhas de estilo

 Pode saber mais sobre o suporte de CSS do Vite na documentação do [Vite](https://vitejs.dev/guide/features.html#css). Se estiver a utilizar os plug-ins PostCSS como o [Tailwind](https://tailwindcss.com), pode criar um ficheiro `postcss.config.js` na raiz do seu projeto, e o Vite aplica-o automaticamente:

```js
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

 > [!ATENÇÃO]
 [Kits iniciais](/docs/starter-kits) já incluem a configuração adequada para o uso do Tailwind, PostCSS e Vite. Ou, se você deseja usar Tailwind e Laravel sem fazer uso de um dos nossos kits inicias, confira

<a name="working-with-blade-and-routes"></a>
## Trabalhando com lâminas e rotas

<a name="blade-processing-static-assets"></a>
### Processando ativos estáticos com o Vite

 Quando for referenciar ativos em seu código JavaScript ou CSS, o Vite os processa e gera versões automaticamente. Além disso, ao criar aplicativos baseados em Blade, o Vite também pode processar e gerar versões de ativos estáticos que você referenciou apenas em modelos Blade.

 No entanto, para conseguir isso, você precisa informar o Vite dos seus ativos ao importá-los no ponto de entrada do aplicativo. Por exemplo, se você quiser processar e fazer a versão de todas as imagens armazenadas em `resources/images` e de todos os fontes armazenados em `resources/fonts`, você deve adicionar o seguinte no ponto de entrada do aplicativo em `resources/js/app.js`:

```js
import.meta.glob([
  '../images/**',
  '../fonts/**',
]);
```

 Esses recursos serão agora processados pelo Vite ao executar o comando `npm run build`. É possível então referenciá-los em modelos Blade usando o método `Vite::asset`, que retornará o URL com a versão do recurso:

```blade
<img src="{{ Vite::asset('resources/images/logo.png') }}">
```

<a name="blade-refreshing-on-save"></a>
### Reload no Armazenar

 Quando o aplicativo é desenvolvido usando renderização tradicional de servidor com Blade, Vite pode melhorar seu fluxo de trabalho de desenvolvimento atualizando automaticamente o navegador quando você faz alterações nos arquivos de visualizações do aplicativo. Para começar, basta especificar a opção `refresh` como `true`.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: true,
        }),
    ],
});
```

 Se a opção refresh estiver definida como true, a salvação dos arquivos nas seguintes pastas ativa o browser para refrescar todas as páginas ao ser executado o comando npm run dev:

 - `app/View/Components/**`
 - `lang/**`
 - `resources/lang/**`
 - `resources/views/**`
 - `routes/**`

 Assistir ao diretório `routes/**` é útil se você estiver utilizando o [Ziggy](https://github.com/tighten/ziggy) para gerar links de rota no front-end da sua aplicação.

 Se estes caminhos padrão não atenderem às suas necessidades, pode especificar uma lista de seus próprios caminhos para monitoração:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: ['resources/views/**'],
        }),
    ],
});
```

 Na área interna, o plugin Laravel Vite utiliza o pacote [`vite-plugin-full-reload`](https://github.com/ElMassimo/vite-plugin-full-reload), que oferece algumas opções de configuração avançadas para otimizar esse comportamento do recarregamento completo. Se você precisa deste nível de personalização, pode fornecer uma definição `config`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: [{
                paths: ['path/to/watch/**'],
                config: { delay: 300 }
            }],
        }),
    ],
});
```

<a name="blade-aliases"></a>
### Alias

 É comum em aplicações JavaScript criar [alias para diretórios referenciados regularmente](#aliases). Mas é também possível criar alias de utilização no Blade, através do método `macro` na classe `Illuminate\Support\Facades\Vite`. Normalmente, os "máscaras" devem ser definidos dentro do método `boot` de um [provedor de serviço](/docs/providers):

```php
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::macro('image', fn (string $asset) => $this->asset("resources/images/{$asset}"));
    }
```

 Uma vez definida uma macro, você poderá invocá-la dentro de seus modelos. Por exemplo, podemos usar a macro `image`, definida acima, para fazer referência a um recurso localizado em `resources/images/logo.png`:

```blade
<img src="{{ Vite::image('logo.png') }}" alt="Laravel Logo">
```

<a name="custom-base-urls"></a>
## URLs de base personalizadas

 Se os ativos compilados com o Vite estiverem implantados em um domínio diferente da sua aplicação, por exemplo, via CDN, você deve especificar a variável de ambiente `ASSET_URL` no arquivo `.env` do seu aplicativo:

```env
ASSET_URL=https://cdn.example.com
```

 Depois de configurar o URL do ativo, todos os novos URLs dos seus ativos terão um prefixo com o valor especificado:

```nothing
https://cdn.example.com/build/assets/app.9dce8d17.js
```

 Lembre-se que [endereços absolutos não são reescritos pelo Vite (# url-processing)], portanto eles não serão pré-fixados.

<a name="environment-variables"></a>
## Variáveis de ambiente

 Você pode inserir variáveis de ambiente no seu JavaScript, ao antepor-lhes `VITE_` no arquivo `.env` da aplicação.

```env
VITE_SENTRY_DSN_PUBLIC=http://example.com
```

 Pode aceder às variáveis de ambiente injetadas através do objeto `import.meta.env`:

```js
import.meta.env.VITE_SENTRY_DSN_PUBLIC
```

<a name="disabling-vite-in-tests"></a>
## Desativar o Vite em testes

 A integração com o Vite do Laravel tentará resolver seus ativos ao executar seus testes, o que exige que você execute o servidor de desenvolvimento do Vite ou compilado seus ativos.

 Caso você prefira simular falta de dependência do Vite durante os testes, pode chamar o método `withoutVite`, que está disponível para quaisquer testes que sejam extensões da classe `TestCase` do Laravel:

```php tab=Pest
test('without vite example', function () {
    $this->withoutVite();

    // ...
});
```

```php tab=PHPUnit
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_without_vite_example(): void
    {
        $this->withoutVite();

        // ...
    }
}
```

 Se você deseja desativar o Vite para todos os testes, pode chamar o método `withoutVite` do método `setUp` na sua classe base `TestCase`:

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void// [tl! add:start]
    {
        parent::setUp();

        $this->withoutVite();
    }// [tl! add:end]
}
```

<a name="ssr"></a>
## Renderização do lado do servidor (SSR)

 O plugin Vite do Laravel permite configurar o renderizado no servidor com facilidade. Para começar, crie um ponto de entrada SSR em `resources/js/ssr.js` e especifique o ponto de entrada passando uma opção de configuração ao plugin Laravel:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            ssr: 'resources/js/ssr.js',
        }),
    ],
});
```

 Para garantir que você não se esqueça de reconstruir o ponto de entrada do SSR, recomendamos aumentar o script "build" no `package.json` da sua aplicação para criar a compilação de SSR:

```json
"scripts": {
     "dev": "vite",
     "build": "vite build" // [tl! remove]
     "build": "vite build && vite build --ssr" // [tl! add]
}
```

 Depois, para criar e iniciar o servidor de SSR, você pode executar os seguintes comandos:

```sh
npm run build
node bootstrap/ssr/ssr.js
```

 Se você estiver usando o [SSR com Inércia](https://inertiajs.com/server-side-rendering), poderá usar o comando de Artisan `inertia:start-ssr` para iniciar o servidor SSR:

```sh
php artisan inertia:start-ssr
```

 > [!ATENÇÃO]
 Os [Kits de Iniciação](/docs/starter-kits) já incluem o Laravel, a Inertia SSR e as configurações do Vite adequadas.

<a name="script-and-style-attributes"></a>
## Atributos do script e tag de estilo

<a name="content-security-policy-csp-nonce"></a>
### Política de segurança do conteúdo (CSP) Nonce

 Se pretender incluir um atributo [`nonce`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) nos seus marcadores de script e estilo, como parte da sua [política de segurança do conteúdo](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), pode gerar ou especificar um nonce através do método `useCspNonce` num middleware personalizado:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class AddContentSecurityPolicyHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Vite::useCspNonce();

        return $next($request)->withHeaders([
            'Content-Security-Policy' => "script-src 'nonce-".Vite::cspNonce()."'",
        ]);
    }
}
```

 Depois de invocar o método `useCspNonce`, o Laravel incluirá automaticamente os atributos `nonce` em todos os scripts e etiquetas estilísticas gerados.

 Se necessitar de especificar o nonce em outro lugar, incluindo a diretiva [Ziggy `@route`] (https://github.com/tighten/ziggy#using-routes-with-a-content-security-policy) incluída nos starter kits do Laravel, pode recuperá-lo utilizando o método `cspNonce`:

```blade
@routes(nonce: Vite::cspNonce())
```

 Se você já tem um nonce que gostaria de usar com Laravel, poderá enviar o nonce para o método `useCspNonce`:

```php
Vite::useCspNonce($nonce);
```

<a name="subresource-integrity-sri"></a>
### Integridade de sub-recursos (SRI)

 Se o seu manifesto do Vite incluir hashes de `integridade` para seus ativos, o Laravel adicionará automaticamente o atributo `integrity` em qualquer tag de script e estilo que gerar com a finalidade de impor [a integridade dos recursos subjacentes](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). O Vite não inclui, por padrão, o hash de `integridade` em seu manifesto. Porém, você pode ativá-lo instalando o plugin do NPM [`vite-plugin-manifest-sri`](https://www.npmjs.com/package/vite-plugin-manifest-sri):

```shell
npm install --save-dev vite-plugin-manifest-sri
```

 Você pode então habilitar esse plugin em seu arquivo `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import manifestSRI from 'vite-plugin-manifest-sri';// [tl! add]

export default defineConfig({
    plugins: [
        laravel({
            // ...
        }),
        manifestSRI(),// [tl! add]
    ],
});
```

 Se necessário, você também poderá personalizar a chave do manifesto onde a chave de integridade pode ser encontrada:

```php
use Illuminate\Support\Facades\Vite;

Vite::useIntegrityKey('custom-integrity-key');
```

 Se você deseja desativar completamente esse rastreamento automático, pode passar `false` ao método `useIntegrityKey`:

```php
Vite::useIntegrityKey(false);
```

<a name="arbitrary-attributes"></a>
### Atributos arbitrários

 Se precisar de incluir atributos adicionais nas etiquetas <script> e <style>, tais como o atributo <span>[`data-turbo-track`](https://turbo.hotwired.dev/handbook/drive#reloading-when-assets-change)](https://turbo.hotwired.dev/handbook/drive#reloading-when-assets-change), pode especificá-los através dos métodos <span>useScriptTagAttributes</span> e <span>useStyleTagAttributes</span>. Normalmente, estes métodos devem ser invocados a partir de um <span>fornecedor de serviços</span>/[providers](/docs/providers):

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes([
    'data-turbo-track' => 'reload', // Specify a value for the attribute...
    'async' => true, // Specify an attribute without a value...
    'integrity' => false, // Exclude an attribute that would otherwise be included...
]);

Vite::useStyleTagAttributes([
    'data-turbo-track' => 'reload',
]);
```

 Se você precisar adicionar atributos sob condição, poderá passar um callback que receberá o caminho de origem do recurso, seu URL, o fragmento do manifesto e o próprio manifesto completo:

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $src === 'resources/js/app.js' ? 'reload' : false,
]);

Vite::useStyleTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $chunk && $chunk['isEntry'] ? 'reload' : false,
]);
```

 > [ADVERTÊNCIA]
 > Os argumentos `$chunk` e `$manifest` serão `null` enquanto o servidor de desenvolvimento do Vite estiver em execução.

<a name="advanced-customization"></a>
## Personalização Avançada

 De série, o plugin do Laravel para Vite usa convenções inteligentes que funcionam para a maioria dos aplicativos. No entanto, por vezes pode ser necessário personalizar o comportamento de Vite. Para permitir opções adicionais de personalização, oferecemos os seguintes métodos e opções que podem ser usados no lugar da diretiva `@vite` do Blade:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    {{
        Vite::useHotFile(storage_path('vite.hot')) // Customize the "hot" file...
            ->useBuildDirectory('bundle') // Customize the build directory...
            ->useManifestFilename('assets.json') // Customize the manifest filename...
            ->withEntryPoints(['resources/js/app.js']) // Specify the entry points...
            ->createAssetPathsUsing(function (string $path, ?bool $secure) { // Customize the backend path generation for built assets...
                return "https://cdn.example.com/{$path}";
            })
    }}
</head>
```

 Na pasta `vite.config.js`, especifique a mesma configuração:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            hotFile: 'storage/vite.hot', // Customize the "hot" file...
            buildDirectory: 'bundle', // Customize the build directory...
            input: ['resources/js/app.js'], // Specify the entry points...
        }),
    ],
    build: {
      manifest: 'assets.json', // Customize the manifest filename...
    },
});
```

<a name="correcting-dev-server-urls"></a>
### Corrigindo as URLs do servidor de desenvolvimento

 Alguns plug-ins do ecossistema Vite presumem que as URLs que começam com um ponto e traço irão sempre apontar para o servidor de desenvolvimento Vite. No entanto, devido à natureza da integração Laravel, não é esse o caso.

 Por exemplo, o plug-in `vite-imagetools` exibe URL's como as seguintes enquanto o Vite está servindo seus recursos:

```html
<img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520">
```

 O plugin `vite-imagetools` espera que a URL de saída seja interceptada pelo Vite e o plugin pode, então, lidar com todas as URLs que começam por `/@imagetools`. Se você estiver usando plugins que esperam esse comportamento, será necessário corrigir manualmente as URLs. Isso pode ser feito em seu arquivo `vite.config.js`, usando a opção `transformOnServe`.

 Neste exemplo específico, preenchemos o caminho para o servidor `dev` a todas as ocorrências de `/@imagetools` no código gerado:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            transformOnServe: (code, devServerUrl) => code.replaceAll('/@imagetools', devServerUrl+'/@imagetools'),
        }),
        imagetools(),
    ],
});
```

 Agora, enquanto a Vite está servindo ativos, ela irá gerar URLs que apontam para o servidor de desenvolvimento da Vite:

```html
- <img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! remove] -->
+ <img src="http://[::1]:5173/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! add] -->
```
