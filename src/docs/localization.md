# Localização

<a name="introduction"></a>
## Introdução

 > [!NOTA]
 > Por padrão, o esqueleto de aplicativo do Laravel não inclui a diretoria `lang`. Se você gostaria de personalizar os arquivos de idiomas do Laravel, você pode publicá-los através do comando Artisan `lang:publish`.

 As funcionalidades de localização do Laravel fornecem uma forma conveniente de recuperar as strings em vários idiomas, o que permite dar suporte a múltiplos idiomas na aplicação.

 O Laravel disponibiliza duas formas de gerir frases de tradução. Em primeiro lugar, é possível armazenar frases numa língua em ficheiros no diretório `lang` da aplicação. Neste diretório podem existir subdiretórios para cada língua suportada pela aplicação. Este é o método utilizado pelo Laravel para gerir frases de tradução para recursos internos do Laravel, como mensagens de erros de validação:

```
    /lang
        /en
            messages.php
        /es
            messages.php
```

 Ou, as sequências de tradução podem ser definidas dentro dos arquivos JSON que estão localizados no diretório `lang`. Nesta abordagem, cada idioma suportado pela sua aplicação terá um ficheiro JSON correspondente neste diretório. Recomendamos esta abordagem para aplicações com muitas sequências de tradução:

```
    /lang
        en.json
        es.json
```

 Vamos abordar cada uma das formas de gerir as frases a traduzir nesta documentação.

<a name="publishing-the-language-files"></a>
### Publicando os ficheiros de linguagem

 Por padrão, o esqueleto de aplicativo do Laravel não inclui a pasta `lang`. Se você deseja personalizar os arquivos de idioma do Laravel ou criar seus próprios, deve incorporar a pasta `lang` através do comando `lang:publish` da arteficeiro. O comando `lang:publish` irá incorporar a pasta `lang` em seu aplicativo e publicar o conjunto padrão de arquivos de idioma usados pelo Laravel:

```shell
php artisan lang:publish
```

<a name="configuring-the-locale"></a>
### Configurando a Linguagem e o País/Região

 A linguagem padrão da sua aplicação é armazenada na opção de configuração `locale` do arquivo de configuração `config/app.php`, o que normalmente é definido usando a variável de ambiente `APP_LOCALE`. É possível modificar esse valor para atender às necessidades da sua aplicação.

 É também possível configurar uma "linguagem de recurso", que será usada quando a linguagem padrão não incluir a frase de tradução especificada. Tal como na linguagem padrado, a linguagem de recurso é igualmente configurada no ficheiro de configuração `config/app.php`, cujo valor é normalmente definido utilizando a variável do ambiente `APP_FALLBACK_LOCALE`.

 Você pode modificar o idioma padrão para uma única solicitação HTTP em tempo de execução usando o método `setLocale`, disponibilizado pela interface `App`:

```php
    use Illuminate\Support\Facades\App;

    Route::get('/greeting/{locale}', function (string $locale) {
        if (! in_array($locale, ['en', 'es', 'fr'])) {
            abort(400);
        }

        App::setLocale($locale);

        // ...
    });
```

<a name="determining-the-current-locale"></a>
#### Determinar o local atual

 Você pode usar os métodos `currentLocale` e `isLocale` da faca `App` para determinar o local atual ou verificar se o local é um valor específico:

```php
    use Illuminate\Support\Facades\App;

    $locale = App::currentLocale();

    if (App::isLocale('en')) {
        // ...
    }
```

<a name="pluralization-language"></a>
### Linguagem de pluralização

 Você pode instruir o "pluralizer" do Laravel, que é usado pelo Eloquent e por outras partes do framework para converter strings singulares para strings plurais, a usar um idioma diferente de inglês. Isso pode ser realizado invocando o método `useLanguage` dentro do método `boot` de um dos provedores de serviços da sua aplicação. Os idiomas suportados atualmente pelo pluralizer são: "francês", "norueguês-bokmal", "português", "espanhol" e "turco":

```php
    use Illuminate\Support\Pluralizer;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Pluralizer::useLanguage('spanish');     

        // ...     
    }
```

 > [AVISO]
 [Nomes de Tabelas](/docs/eloquent#table-names).

<a name="defining-translation-strings"></a>
## Definindo cordas de tradução

<a name="using-short-keys"></a>
### Usando teclas curtas

 Normalmente, as mensagens de tradução são armazenadas em arquivos dentro do diretório `lang`. Dentro desse diretório, deve haver um subdiretório para cada idioma suportado pelo seu aplicativo. Esse é o mesmo método utilizado pelo Laravel para gerenciar as mensagens de tradução de recursos internos, como mensagens de erros de validação:

```
    /lang
        /en
            messages.php
        /es
            messages.php
```

 Todas as ficheiros de linguagens retornam uma matriz de strings com chaves. Por exemplo:

```php
    <?php

    // lang/en/messages.php

    return [
        'welcome' => 'Welcome to our application!',
    ];
```

 > [ATENÇÃO]
 > Para línguas que diferem por território, você deve nomear os diretórios de idiomas conforme a norma ISO 15897. Por exemplo, "en_GB" é mais adequado para inglês britânico do que "en-gb".

<a name="using-translation-strings-as-keys"></a>
### Usar cadeias de tradução como chaves

 Para aplicações com um elevado número de frases traduzíveis, a definição de cada frase com uma "chave curta" torna-se confusa no que diz respeito à referência das chaves nas vistas e é pesada porque se terá de criar continuamente novas chaves para todas as frases traduzíveis suportadas pela aplicação.

 Por este motivo, Laravel fornece suporte para definir strings de tradução usando a "default" (padrão) tradução da string como chave. Arquivos de linguagem que usam strings de tradução como chaves são armazenados como arquivos JSON no diretório `lang`. Por exemplo, se o seu aplicativo tiver uma tradução em espanhol, você deve criar um arquivo `es.json`:

```json
{
    "I love programming.": "Me encanta programar."
}
```

#### Conflitos de chave/arquivo

 Não é aconselhável definir chaves de strings de tradução que entrarem em conflito com outros nomes de arquivos de tradução. Por exemplo, traduzir `__('Action')`, no contexto da localização "NL", enquanto existe um ficheiro `nl/action.php` mas não existe um ficheiro `nl.json`, pode resultar na informação de todo o conteúdo do ficheiro `nl/action.php` ser retornada pelo tradutor.

<a name="retrieving-translation-strings"></a>
## Recuperação de cadeias de tradução

 Pode recuperar as frases de tradução dos seus arquivos de linguagem utilizando a função de ajuda `__`. Se estiver a utilizar "teclas abreviadas" para definir as suas frases de tradução, deve passar o ficheiro que contém a chave e a própria chave à função `__", utilizando sintaxe ponto. Por exemplo, vamos recuperar a frase de tradução "welcome" do arquivo de linguagem "lang/en/messages.php":

```php
    echo __('messages.welcome');
```

 Se a string de tradução especificada não existir, a função `__` retornará o nome da chave da tradução. Portanto, usando o exemplo acima, a função `__` retorna `messages.welcome` se a string de tradução não existir.

 Se você estiver usando suas [cadeias de tradução padrão como chaves de tradução] (#usando-cadeias-de-traducao-como-chaves), deverá passar a tradução padrão de sua cadeia para a função `__`<br />

```php
    echo __('I love programming.');
```

 Mais uma vez, se a cadeia de tradução não existir, a função `__` irá retornar o nome da chave da cadeia de tradução que foi passada.

 Se você estiver usando o motor de plantão [Blade] (/docs/blade), pode usar a sintaxe `{{ }}` para mostrar a cadeia de caracteres de tradução.

```php
    {{ __('messages.welcome') }}
```

<a name="replacing-parameters-in-translation-strings"></a>
### Substituir os parâmetros nas cordas de tradução

 Se desejar, pode definir marcadores em suas mensagens de tradução. Todos os marcadores começam com o sinal `:`. Por exemplo, você pode definir uma mensagem de boas-vindas com um nome de marcador:

```php
    'welcome' => 'Welcome, :name',
```

 Para substituir os marcadores no processo de recuperação da string de tradução, você pode passar um array com as substituições como segundo argumento para a função `__`:

```php
    echo __('messages.welcome', ['name' => 'dayle']);
```

 Se o marcador contiver todas as letras maiúsculas ou apenas a primeira letra maiúscula, o valor traduzido será maiusculado de acordo com isso:

```php
    'welcome' => 'Welcome, :NAME', // Welcome, DAYLE
    'goodbye' => 'Goodbye, :Name', // Goodbye, Dayle
```

<a name="object-replacement-formatting"></a>
#### Formatação de substituição de objetos

 Se você tentar fornecer um objeto como lugar-tenode tradução, o método `__toString` do objeto será invocado. O método [`__toString`](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) é uma das "mágicas" métodos incorporadas do PHP. Porém, às vezes você pode não ter controle sobre o método `__toString` de uma determinada classe, como por exemplo quando a classe que está interagindo pertence a uma biblioteca de terceiros.

 Nestes casos, o Laravel permite que você registre um handler de formatação personalizado para esse tipo particular de objeto. Para fazer isso, você deve invocar a metodologia `stringable` do translator. A metodologia `stringable` aceita um fechamento, que deve indicar o tipo de objeto responsável pelo formato. Normalmente, a metodologia `stringable` deve ser invocada dentro da metodologia `boot`, na classe `AppServiceProvider` do seu aplicativo:

```php
    use Illuminate\Support\Facades\Lang;
    use Money\Money;

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Lang::stringable(function (Money $money) {
            return $money->formatTo('en_GB');
        });
    }
```

<a name="pluralization"></a>
### Pluralização

 A formação de formas plurais é um problema complexo pois diferentes línguas possuem várias regras para formação de formas plurais. No entanto, o Laravel permite-lhe traduzir strings de maneira diferente com base nas suas próprias definições. Usando a sintaxe "|", é possível distinguir as formas singular e plural numa mesma string:

```php
    'apples' => 'There is one apple|There are many apples',
```

 É claro que a pluralização é suportada quando se usam como chaves (keys) [cadeias de tradução]():

```json
{
    "There is one apple|There are many apples": "Hay una manzana|Hay muchas manzanas"
}
```

 Você também poderá criar regras de pluralização mais complexas, que especifiquem cadeias de tradução para vários intervalos de valores.

```php
    'apples' => '{0} There are none|[1,19] There are some|[20,*] There are many',
```

 Após definir uma cadeia de tradução que possui opções de pluralização, é possível usar a função `trans_choice` para recuperar a linha correspondente ao valor de "count". Neste exemplo, pois o valor de "count" é superior a um, a forma plural da cadeia de tradução é retornada:

```php
    echo trans_choice('messages.apples', 10);
```

 Você também pode definir atributos de substituição em strings para a pluralização. Estes espaços reservados podem ser substituídos passando um array como terceiro argumento à função `trans_choice`:

```php
    'minutes_ago' => '{1} :value minute ago|[2,*] :value minutes ago',

    echo trans_choice('time.minutes_ago', 5, ['value' => 5]);
```

 Para exibir o valor inteiro que foi passado para a função `trans_choice`, você pode usar o marcador de lugar-comum interno ":"count":

```php
    'apples' => '{0} There are none|{1} There is one|[2,*] There are :count',
```

<a name="overriding-package-language-files"></a>
## Supersar arquivos de idiomas de pacotes

 Alguns pacotes podem ser enviados com seus próprios arquivos de idiomas. Em vez de alterar os arquivos principais do pacote para ajustar essas linhas, você poderá substituí-las colocando arquivos na pasta `lang/vendor/{package}/{locale}`.

 Por exemplo, se você precisar substituir as frases de tradução em `messages.php` para um pacote chamado `skyrim/hearthfire`, você deve colocar o arquivo de idiomas em: `lang/vendor/hearthfire/en/messages.php`. Neste arquivo, só devem ser definidas as frases de tradução que desejam substituir. As frases de tradução não substituídas ainda serão carregadas a partir dos arquivos de idiomas originais do pacote.
