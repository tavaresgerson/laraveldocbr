# Desenvolvimento de Pacotes

<a name="introduction"></a>
## Introdução

Os pacotes são o principal meio de adição de funcionalidade à Laravel. Esses pacotes podem ser qualquer coisa, desde uma excelente forma de trabalhar com datas como [Carbon](https://github.com/briannesbitt/Carbon) até um pacote que permite associar arquivos a modelos Eloquent como o Spatie's [Laravel Media Library](https://github.com/spatie/laravel-medialibrary).

Existem vários tipos de pacotes. Há pacotes autônomos, que funcionam com qualquer estrutura PHP. O Carbon e o Pest são exemplos de pacotes autônomos. Qualquer um destes pacotes pode ser utilizado com o Laravel adicionando-o no arquivo `composer.json`.

Por outro lado, outros pacotes são destinados especificamente ao uso com Laravel. Esses pacotes podem incluir roteamento, controladores, visualizações e configurações voltadas especificamente para melhorar a aplicação do Laravel. Este guia aborda principalmente o desenvolvimento de pacotes que são específicos para o Laravel.

<a name="a-note-on-facades"></a>
### Uma nota sobre facades

Quando você está escrevendo um aplicativo do Laravel geralmente não importa se você usa contratos ou facades, pois ambos fornecem níveis essencialmente iguais de capacidade de teste. No entanto, ao escrever pacotes, seu pacote normalmente não terá acesso a todas as ajudas de testes do Laravel. Se você gostaria de poder escrever seus testes em um pacote como se o pacote estivesse instalada dentro de um aplicativo típico do Laravel, você pode usar o pacote [Orchestral Testbench](https://github.com/orchestral/testbench).

<a name="package-discovery"></a>
## Descoberta de pacotes

O arquivo `bootstrap/providers.php` de uma aplicação Laravel contém a lista dos provedores de serviços que devem ser carregados pelo Laravel. No entanto, em vez de exigir que os usuários adicionem manualmente seu provedor de serviço na lista, você pode definir o provedor na seção `extra` do arquivo `composer.json` do pacote para que ele seja carregado automaticamente pelo Laravel. Além dos provedores, é possível listar também quaisquer [facades](/docs/facades) que você gostaria de registrar:

```json
"extra": {
    "laravel": {
        "providers": [
            "Barryvdh\\Debugbar\\ServiceProvider"
        ],
        "aliases": {
            "Debugbar": "Barryvdh\\Debugbar\\Facade"
        }
    }
},
```

Depois que seu pacote estiver configurado para descoberta, o Laravel irá registrar automaticamente seus provedores de serviço e facades quando instalados, criando uma experiência conveniente para os usuários do seu pacote.

<a name="opting-out-of-package-discovery"></a>
#### Opção de não deteção de pacotes

Se você é um consumidor de pacote e deseja desativar o descobrimento do pacote para ele, você pode listar seu nome na seção `extra` do arquivo `composer.json` da sua aplicação:

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

Você pode desativar a descoberta de pacotes para todos os pacotes usando o caractere `*` dentro da diretiva `dont-discover` do seu aplicativo:

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "*"
        ]
    }
},
```

<a name="service-providers"></a>
## Provedores de Serviços

[Provedores de serviços](/docs/providers) são o ponto de conexão entre seu pacote e o Laravel. Um fornecedor de serviço é responsável por vincular itens ao [container de serviços](/docs/container) do Laravel e informar ao mesmo onde carregar recursos do pacote, como as visualizações, a configuração e os arquivos de idiomas.

Um provedor de serviços expande a classe `Illuminate\Support\ServiceProvider` e contém dois métodos: `register` e `boot`. A classe base `ServiceProvider` está localizada no pacote Composer `illuminate/support`, que você deve adicionar como dependência ao seu próprio pacote. Para saber mais sobre a estrutura e o objetivo dos provedores de serviços, confira a [documentação](/docs/providers).

<a name="resources"></a>
## Recursos

<a name="configuration"></a>
### Configuração

Normalmente, você precisa publicar o arquivo de configuração do seu pacote para a pasta `config` da aplicação. Isso permitirá que os usuários do seu pacote substituam facilmente as opções de configuração padrão. Para permitir que seus arquivos de configuração sejam publicados, chame o método `publishes` do método `boot` do provedor de serviço:

```php
    /**
     * Inicialize qualquer serviço de pacote.
     */
    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../config/courier.php' => config_path('courier.php'),
        ]);
    }
```

Agora, quando os usuários do seu pacote executarem o comando `vendor:publish` do Laravel, seu arquivo será copiado para a localização de publicação especificada. Depois que sua configuração tiver sido publicada, seus valores podem ser acessados como se fossem um arquivo de configuração qualquer:

```php
    $value = config('courier.option');
```

::: warning ATENÇÃO
Você não deve definir closures em seus arquivos de configuração. Eles não podem ser serializados corretamente quando os usuários executam o comando `config:cache` no Artisan.
:::

<a name="default-package-configuration"></a>
#### Configuração padrão do pacote

Também é possível fundir seu próprio arquivo de configuração do pacote com a cópia publicada da aplicação, permitindo que seus usuários definam apenas as opções que desejam substituir na cópia publicada do arquivo de configuração. Para fundir os valores do arquivo de configuração, utilize o método `mergeConfigFrom` dentro do método `register` do provedor de serviços.

O método `mergeConfigFrom` aceita o caminho para o arquivo de configuração do seu pacote como seu primeiro argumento e o nome da cópia do aplicativo do arquivo de configuração como seu segundo argumento:

```php
    /**
     * Registre quaisquer serviços de aplic_assets_.
     */
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/courier.php', 'courier'
        );
    }
```

::: warning ATENÇÃO
Esse método somente mescla o primeiro nível da matriz de configurações. Se os usuários definirem parcialmente uma matriz de configuração multidimensional, as opções ausentes não serão mescladas.
:::

<a name="routes"></a>
### Rotas

Se o seu pacote contiver rotas, você poderá carregá-las usando o método `loadRoutesFrom`. Este método automaticamente determinará se as rotas da aplicação estão em cache e não carregará o arquivo de rotas se já estiverem disponíveis no cache:

```php
    /**
     * Inicialize qualquer serviço de pacote.
     */
    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }
```

<a name="migrations"></a>
### Migrações

Se o seu pacote incluir [migrações de base de dados](/docs/migrations), poderá utilizar a método `publishesMigrations` para informar ao Laravel que determinado diretório ou arquivo contém migrações. Quando o Laravel publica as migrações, atualiza automaticamente a marcação da data e hora no nome dos arquivos:

```php
    /**
     * Inicialize qualquer serviço de pacote.
     */
    public function boot(): void
    {
        $this->publishesMigrations([
            __DIR__.'/../database/migrations' => database_path('migrations'),
        ]);
    }
```

<a name="language-files"></a>
### Arquivos de idiomas

Se o seu pacote conter [arquivos de idiomas](/docs/localization), você pode usar o método `loadTranslationsFrom` para informar ao Laravel como carregá-los. Por exemplo, se o nome do seu pacote for `courier`, você deve adicionar o seguinte ao método `boot` de seu provedor de serviços:

```php
    /**
     * Inicialize qualquer serviço de pacote.
     */
    public function boot(): void
    {
        $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');
    }
```

As linhas de tradução do pacote são referenciadas usando a convenção de sintaxe `package::file.line`. Então, você pode carregar a linha `welcome` do pacote `courier` do arquivo `messages`, da seguinte forma:

```php
    echo trans('courier::messages.welcome');
```

É possível registrar arquivos de tradução em formato JSON para o seu pacote através do método `loadJsonTranslationsFrom`. Este método aceita como parâmetro o caminho ao diretório que contém os arquivos de tradução JSON do seu pacote:

```php
/**
 * Inicialize qualquer serviço de pacote.
 */
public function boot(): void
{
    $this->loadJsonTranslationsFrom(__DIR__.'/../lang');
}
```

<a name="publishing-language-files"></a>
#### Publicando arquivos de idioma

Se pretender publicar os arquivos de idiomas do seu pacote no diretório `lang/vendor` da aplicação, você pode utilizar o método `publishes` do provedor de serviços. O método `publishes` aceita um array de caminhos de pacotes e locais de publicação desejados. Por exemplo, se pretender publicar os arquivos de idiomas para o pacote `courier`, você pode executar o seguinte:

```php
    /**
     * Inicialize qualquer serviço de pacote.
     */
    public function boot(): void
    {
        $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');

        $this->publishes([
            __DIR__.'/../lang' => $this->app->langPath('vendor/courier'),
        ]);
    }
```

Agora, quando os usuários do seu pacote executarem o comando Artisan `vendor:publish` do Laravel, os arquivos de idioma do seu pacote serão publicados no local de publicação especificado.

<a name="views"></a>
### Visualizações

Para registrar as [_views_](/docs/views) do seu pacote com Laravel, você precisa informar a localização das _views_ para o Laravel. Isso pode ser feito usando o método `loadViewsFrom` do provedor de serviços. O método `loadViewsFrom` aceita dois argumentos: o caminho dos modelos de visualização e o nome do seu pacote. Por exemplo, se o nome do seu pacote for `courier`, você adicionaria o seguinte ao método `boot` do provedor de serviços:

```php
    /**
     * Inicialize qualquer serviço de pacote.
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
    }
```

As _views_ de um pacote são referenciados usando a convenção de sintaxe `package::view`. Então, assim que seu caminho da _view_ é registrado em um provedor de serviços, você poderá carregar o visualizador `dashboard` do pacote `courier` desta forma:

```php
    Route::get('/dashboard', function () {
        return view('courier::dashboard');
    });
```

<a name="overriding-package-views"></a>
#### Substituindo _views_ de pacotes

Quando você usa o método `loadViewsFrom`, o Laravel registra duas localizações para suas _views_: a pasta de `recursos/views/vendor` da aplicação e a pasta que especificou. Então, como exemplo, o Laravel verifica se uma versão personalizada da _view_ foi colocada na pasta `resources/views/vendor/courier` pelo desenvolvedor. Em seguida, se a _view_ não tiver sido personalizada, o Laravel procurará pela pasta de _views_ do pacote especificado em sua chamada para `loadViewsFrom`. Isso torna fácil para os usuários de pacotes customizarem/substituírem as _views_ do seu pacote.

<a name="publishing-views"></a>
#### Visualização de publicações

Se você pretender disponibilizar as suas _views_ para publicação no diretório de recursos da aplicação `'resources/views/vendor'`, poderá utilizar o método `'publishes'` do provedor. O método `publishes` aceita uma matriz com os caminhos das _views_ do pacote e os locais de publicação pretendidos:

```php
    /**
     * Inicialize os serviços do pacote.
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');

        $this->publishes([
            __DIR__.'/../resources/views' => resource_path('views/vendor/courier'),
        ]);
    }
```

Agora, quando os usuários de seu pacote executarem o comando do Laravel `vendor:publish`, as _views_ do pacote serão copiadas para a localização de publicação especificada.

<a name="view-components"></a>
### Visualizar componentes

Se você estiver construindo um pacote que utiliza componentes Blade ou colocando componentes em diretórios não convencionais, precisará registrar manualmente sua classe de componente e seu alias do HTML tag para que o Laravel saiba onde encontrar o componente. Tipicamente, registre seus componentes no método `boot` do provedor de serviço do seu pacote:

```php
    use Illuminate\Support\Facades\Blade;
    use VendorPackage\View\Components\AlertComponent;

    /**
     * Inicialize os serviços do seu pacote.
     */
    public function boot(): void
    {
        Blade::component('package-alert', AlertComponent::class);
    }
```

Depois que o componente tiver sido registrado, ele poderá ser utilizado através de seu alias de tag:

```blade
<x-package-alert/>
```

<a name="autoloading-package-components"></a>
#### Autoloading de Componentes do pacote

Alternativamente, você pode usar o método `componentNamespace` para carregar componentes por convenção. Por exemplo, um pacote com os nomes de classe `Nightshade` e `ColorPicker`, que residem no namespace `Nightshade\Views\Components`, seriam:

```php
    use Illuminate\Support\Facades\Blade;

    /**
     * Inicialize os serviços do seu pacote.
     */
    public function boot(): void
    {
        Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
    }
```

Isso permitirá o uso de componentes do pacote pelo namespace do fornecedor usando a sintaxe `package-name::`:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

O Blade detectará automaticamente a classe que está vinculada a este componente colocando o nome do componente em pascal-case. Subdiretórios também são suportados usando a notação "dot".

<a name="anonymous-components"></a>
#### Componentes anônimos

Se o seu pacote conter componentes anônimos, estes devem ser colocados num diretório `components`, no diretório de _views_ do seu pacote (como especificado pelo método [`loadViewsFrom`](#views)). Você pode assim renderizá-los utilizando um prefixo com o nome do componente:

```blade
<x-courier::alert />
```

<a name="about-artisan-command"></a>
### _About_ do comando Artisan

O comando `about` embutido do Laravel fornece uma síntese do ambiente e da configuração da aplicação. Os pacotes podem enviar informações adicionais para a saída deste comando através da classe `AboutCommand`. Normalmente, essas informações podem ser adicionadas na seu provedor de serviço no pacote:

```php
    use Illuminate\Foundation\Console\AboutCommand;

    /**
     * Inicialize qualquer serviço de aplicativo.
     */
    public function boot(): void
    {
        AboutCommand::add('My Package', fn () => ['Version' => '1.0.0']);
    }
```

<a name="commands"></a>
## Comandos

Para registrar comandos do pacote Artisan no Laravel, você pode usar o método `commands`. Este método espera um array de nomes das classes dos commandos. Depois que os comandos forem registrados, você poderá executá-los usando a CLI do [Artisan](/docs/artisan):

```php
    use Courier\Console\Commands\InstallCommand;
    use Courier\Console\Commands\NetworkCommand;

    /**
     * Inicialize qualquer serviço de pacote.
     */
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                InstallCommand::class,
                NetworkCommand::class,
            ]);
        }
    }
```

<a name="public-assets"></a>
## _Assets_ públicos

Seu pacote pode conter recursos como JavaScript, CSS e imagens. Para publicar esses recursos no diretório `public` da aplicação, use o método `publishes` do provedor de serviço. Nesse exemplo, também será adicionado um marcador de grupo de recurso `public`, que pode ser usado para facilitar a publicação de grupos relacionados de recursos:

```php
    /**
     * Inicialize qualquer serviço de pacote.
     */
    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../public' => public_path('vendor/courier'),
        ], 'public');
    }
```

Agora, quando os usuários de um pacote executarem o comando `vendor:publish`, seus _assets_ serão copiados para o local especificado. Como é necessário que os usuários substituam todos os _assets_ sempre que o pacote for atualizado, você pode usar a opção `--force`:

```shell
php artisan vendor:publish --tag=public --force
```

<a name="publishing-file-groups"></a>
## Publicando grupos de arquivos

Talvez você queira publicar grupos de _assets_ e recursos do pacote separadamente. Por exemplo, talvez você queira permitir aos seus usuários publicarem os arquivos de configuração do seu pacote sem ser forçado a publicar os _assets_ do pacote. Você pode fazer isso "marcando" (_taggning_) quando chamar o método `publishes` a partir de um provedor de serviços do pacote. Nesse exemplo, vamos usar tags para definir dois grupos de publicação para o pacote `courier` (`courier-config` e `courier-migrations`) no método `boot` do provedor de serviços do pacote:

```php
    /**
     * Inicialize qualquer serviço de pacote.
     */
    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../config/package.php' => config_path('package.php')
        ], 'courier-config');

        $this->publishesMigrations([
            __DIR__.'/../database/migrations/' => database_path('migrations')
        ], 'courier-migrations');
    }
```

Agora os usuários podem publicar esses grupos separadamente, referenciando a tag deles ao executarem o comando `vendor:publish`:

```shell
php artisan vendor:publish --tag=courier-config
```
