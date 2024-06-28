# Cordas

<a name="introduction"></a>
## Introdução

 O Laravel inclui uma variedade de funções para manipular valores de string. Muitas destas funções são usadas pelo próprio framework; no entanto, você tem liberdade para utilizá-las em suas aplicações caso ache isso conveniente.

<a name="available-methods"></a>
## Métodos disponíveis

<style>
 .collection-method-list > p {
 colunas: 10,8 em 3; -moz-colunas: 10,8 em 3; -webkit-colunas: 10,8 em 3;
 }

 .collection-method-list a {
 display: bloqueado;
 overflow: oculto;
 text-overflow: elipsoide;
 espaço-preenchimento: não;
 }
</style>

<a name="strings-method-list"></a>
### Cordas

<div class="collection-method-list" markdown="1">

 [\__ (#método __)](/métodos/)
 [class_basename](#método-class-basename)
 [e] (#método-e:e)
 [preg_replace_array (# método preg_replace_array)]
 [Str::after (# método Str - after)]
 [Str::afterLast](#método-str-depois-do-ultimo)
 [Str::apa (#método Str::apa)]
 [Str::ascii (#método Str::ascii)]
 [Str::before(#method-str-before)]
 [Str::beforeLast](#method-str-before-last)
 [Str::between (#Método str::entre)]
 [Str::betweenFirst (#método Str - entre o primeiro e o último)](/method-str-between-first/)
 [Str::camel (#método em caixa baixa)]
 [Str::charAt (#método char-at)]
 [Str::contains (#método Str::contains)]
 [Str::containsAll (#Método str_contains_all)]
 [Str::endsWith (#método ends-with)
 [Str::excerpt](#method-excerpt)
 [Str::finish](#method-str-finish)
 [Str::headline (#método Str: headline)](/method-str-headline)
 [Str::inlineMarkdown](#método-str-inline-markdown)
 [Str::is (#método Str::is)]
 [Str::isAscii (#método Str: isAscii)
 [Str::isJson(#método str->is-JSON)
 [Str::isUlid (#method-str-is-ulid)]
 [Str::isUrl (#method_Str_is_URL)](/method/Str_is_URL)
 [Str::isUuid](#método Str.isUuid)
 [Str::kebab (#método de caixa baixa)](kebab_case/)
 [Str::lcfirst (#método Str::lcfirst)](https://www.rubyguides.com/2015/07/13/characters/)
 [Str::length (#método Str - length)](/pt-br/metodos/#methode-str-length)
 [Str::limit (#método str-limite)](/method/str-limit)
 [Str::lower(#Método str::lower)]
 [Str::markdown](#method-str-markdown)
 [Str::mask (#método Str - Máscara)](/pt/api/#método:Str:mask)
 [Str::orderedUuid (#método Str - orderedUuid)]
 [Str::padBoth (#método Str::padBoth)](/)
 [Str::padLeft (#método str::padLeft)](/pt/methode/str::padLeft)
 [Str::padRight (#método str::padRight)]
 [Str::password (#método Str::password)]
 [Str::plural (#method-str-plural)]
 [Str::pluralStudly (#método str.pluralStudly)]
 [Str::position](#method-str-position)
 [Str::random (#Método str: random)]
 [Str::remove(#método Str - remove)](/método/str-remove)
 [Str::repeat (#método Str::repeat)]
 [Str::substituir (#Método Str::substituir)]
 [Str::replaceArray](#método-str-substituir-matriz)
 [Str::replaceFirst](#método-str-replace-first)
 [Str::substituirÚltimo](#method-str-substituir-ultimo)
 [Str::replaceMatches (#método Str::replaceMatches)]
 [Str::replaceStart](#método-str-substituir-a-partida)
 [Str::replaceEnd (#método Str::replaceEnd)]
 [Str::reverse (#method Str::reverse)](/method-str-reverse)
 [Str::singular (#método Str: singular)]
 [Str::slug](#método-str-slug)
 [Str::snake (#método em caixa baixa sibilante)](/method-snake-case)
 [Str::squish (#método str–squish)](
 [Str::start(#método Str::start)](
 [Str::startsWith (#método starts-with)]
 [Str::studly (#método studly-caso)]
 [Str::substr (#método Str--substr)]
 [Str::substrCount (#método Str - substrCount)](/methods/289-Str/410-substrCount/)
 [Str::substrReplace (#método Str - substrReplace)](/pt/api/intl/str/#método:Str/substrReplace "Método str_substrReplace")
 [Str::swap(#método str - swap)](/method-str-swap/)
 [Str::take (#método take)]
 [Str::title (#method-title-case)]
 [Str::toBase64 (#Método str::toBase64)]
 [Str::toHtmlString (#método str - to HTML string)
 [Str::trim(#method_str_trim)]
 [Str::ltrim(#method-str-ltrim)]
 [Str::rtrim (#método Str::rtrim)]
 [Str::ucfirst (#método Str::ucfirst)]
 [Str::ucsplit (#método Str::ucsplit)]
 [Str::upper](#método-str-upper)
 [Str::ulid](#método-str-ulid)
 [Str::unwrap (#method Str::unwrap)]
 [Str::uuid (#method-str-uuid)]
 [Str::wordCount (#método Str - contagem de palavras)]
 [Str::wordWrap(# método str: wordWrap)]
 [Str::words (#método str::words)]
 [Str::wrap](#método-str-wrap)
 [int](#method-int)
 [trans](#method-trans)
 [trans_choice (#método-trans-choice)]

</div>

<a name="fluent-strings-method-list"></a>
### Cordas Fluentes

<div class="collection-method-list" markdown="1">

 [depois de](#método-fluente-str-depois)
 [após o último](#método-fluent-str-após-o-último)
 [apa](#method-fluent-str-apa)
 [anexar](#method-fluent-str-append)
 [ascii (#método fluent-str-ascii)]
 [nome_base](#método-fluent-str-basename)
 [antes](#method-fluent-str-before)
 [anterior ao último](#método-fluent-str-anterior-ao-último)
 [entre](#method-fluent-str-between)
 [entreOPrimeiro](#método-fluent-str-entre-o-primeiro)
 [caminhão de carga](#método-fluent-str-camel)
 [charAt](#método-fluente-str-char-at)
 [classBasename (#método fluent-str-class-basename)
 [contém (#método fluent-str-contém)](/method-fluent-str-contains/)
 [contaTodo](#método-fluent-str-containstodo)
 [dirname](#método-fluente-str-dirname)
 [termina com](#método-fluente-str-termina-com)
 [trecho](#método-fluent-str-excerpt)
 [exactamente (#method-fluent-str-exactly)
 [explodir](#método fluent-str-explodir)
 [terminar](#método-fluent-str-finish)
 [título da seção] (#method-fluent-section-title)
 [inlineMarkdown (#método fluent-str-inline-markdown)](
 [é](#método fluent-str-is)
 [éAscii (#método fluent str isAscii)](/pt/api/#método-fluent-str-is-ascii)
 [isEmpty("#método-fluente-str-é-vazio)]
 [éNãoVazio](#método-fluente-checar-se-se-o-string-não-estiver-vazia)
 [é um JSON?](#método-fluent-str-is-json)
 [isUlid (#method-fluent-str-is-ulid)
 [é um URL?](#método-fluente-str-é-um-url)
 [isUuid(#method-fluent-str-is-uuid)]
 [cebolla rosti](#method-fluent-str-cebollarosti)
 [lcfirst(#método - fluent(String, lcFirst))]
 [tamanho (#method-fluent-str-length)](/method-fluent-str-length)
 [limite] (#método fluent--fluxo-de-estados-limitado)
 [mais baixo (#método fluent-str-mais-baixo)](/method-fluent-str-mais-baixo)
 [Markdown](#método-fluent-str-markdown)
 [máscara de caracteres especial] (###method-fluent-str-mask)
 [correspondência](#método-fluent-str-match)
 [matchAll(#method-fluent-str-match-all)]
 [isMatch](#method-fluent-str-is-match)
 [nova linha](#method-fluent-str-new-line)
 [padBoth](#método-fluente-str-padboth)
 [padLeft](#method-fluent-str-padleft)
 [padRight(#method-fluent-str-padright)]
 [tubo](#método-fluent-str-pipe)
 [plural (#method-fluent-str-plural)
 [posição (##método-fluent-str-position)
 [inserir atrás](#método-fluent-str-insert)
 [remover o método fluent_str_remove ().](!#method-fluent-str-remove "")
 [repetir](##method-fluent-str-repeat)
 [substituir ocorre no método fluente str_replace]
 [substituirArray(#método fluent - str_replace_array)]
 [substituirPrimeiro(#método fluente str.substituirPrimeiro)
 [substituirÚltima](#método-fluent-str-substituir-ultima)
 [substituir correspondências](#método-fluent-str-substituircorrespondencias)
 [substituirInicio](#método-fluent-str-substituirinicio)
 [replaceEnd(#Método fluent Str.replaceEnd)]
 [escaneamento](#método-fluent-str-scan)
 [singular (#method-fluent-str-singular)]
 [slug (#método fluent_str_slug)]
 [cobra](#método-fluent-str-snake)
 [dividir](#método fluent str split)
 [squish](#method-fluent-str-squish)
 [iniciar (##método fluent-str-start)
 [começaCom (###method-fluent-str-starts-with)]
 [stripTags](#method-fluent-str-strip-tags)
 [studly](#method-fluent-str-studly)
 [substr](#método fluent-str-substr)
 [substituir substring](#método-fluente-str-substituisubstring)
 [trocar](#método-fluent-str-trocar)
 [usar o método fluent Str::take](https://www.php.net/manual/en/language.types.string.php#98172)
 [toque no](#método-fluent-str-tap)
 [teste (#método fluent str test)](/method-fluent-str-test)
 [Título (#método fluent str title)](/method/fluent_string_title/)
 [toBase64] (#méthode fluent str to base64)
 [trim (#método fluent-str-trim)](/método-fluent-str-trim)
 [lttrim(#method-fluent-str-ltrim)]
 [rtrim(#método fluent-str-rtrim)]
 [ucfirst](#method-fluent-str-ucfirst)
 [ucsplit(#método fluent str ucsplit)]
 [desfazer o desfazimento de membros](#method-fluent-str-unwind
 [maior](#method-fluent-str-major)
 [quando](#método-fluent-str-quando)
 [#método fluent str when_contains]
 [quandoContémTudo (#método fluent - String - quandoContémTudo)](/api/String/#método-Fluent-String-quandoContaTudo)
 [quando vazio (#método fluent str quando vazio?)]
 [quandoNãoEstiverVazio](#metodo-fluent-str-quando-nao-estiver-vazio)
 [#método fluent("str"): #metodo quando começa com (#método when_starts_with)
 [#method-fluent-str-when-ends-with]
 [#method-fluent-str-when-exactly]
 [#metodo-fluente-str-quando-não-é-exatamente]
 [#whenIs (##method fluent str when-is)]
 [whenIsAscii(#method-fluent-str-when-is-ascii)]
 [whenIsUlid (#method-fluent-str-when-is-ulid)
 [whenIsUuid (#method-fluent-str-when-is-uuid)]
 [#whenTest(#methodFluentStrWhenTest)]
 [conta_palavras](#método-fluent-str-word-count)
 [palavras](#método-fluent-str-words)

</div>

<a name="strings"></a>
## Cordas

<a name="method-__"></a>
#### `__()` {.collection-method}

 A função `__` traduz a frase ou chave de tradução fornecida, utilizando os seus arquivos de linguagem (/docs/localization):

```php
    echo __('Welcome to our application');

    echo __('messages.welcome');
```

 Se a chave de tradução ou a cadeia especificada não existirem, a função `__` retornará o valor fornecido. Assim, usando o exemplo acima, a função `__` retornaria `messages.welcome` se essa chave de tradução não existir.

<a name="method-class-basename"></a>
#### `class_basename()` {.collection-method}

 A função `class_basename` retorna o nome da classe com o namespace da mesma removido:

```php
    $class = class_basename('Foo\Bar\Baz');

    // Baz
```

<a name="method-e"></a>
#### `e()` {.collection-method}

 A função `e` executa a função `htmlspecialchars` do PHP com a opção `double_encode`, definida como `true` por padrão:

```php
    echo e('<html>foo</html>');

    // &lt;html&gt;foo&lt;/html&gt;
```

<a name="method-preg-replace-array"></a>
#### `preg_replace_array()` {.collection-method}

 A função `preg_replace_array` substitui o padrão dado na string seqüencialmente usando um array:

```php
    $string = 'The event will take place between :start and :end';

    $replaced = preg_replace_array('/:[a-z_]+/', ['8:30', '9:00'], $string);

    // The event will take place between 8:30 and 9:00
```

<a name="method-str-after"></a>
#### `Str::after()` {.metodo de coleção}

 O método Str::after retorna tudo o que está depois do valor especificado numa string. A string inteira será retornada se não existir o valor na string:

```php
    use Illuminate\Support\Str;

    $slice = Str::after('This is my name', 'This is');

    // ' my name'
```

<a name="method-str-after-last"></a>
#### `Str::afterLast()` {.collection-method}

 O método `Str::afterLast` retorna tudo após o último caractere que aparece na string. Se o valor não existir, a string inteira será retornada:

```php
    use Illuminate\Support\Str;

    $slice = Str::afterLast('App\Http\Controllers\Controller', '\\');

    // 'Controller'
```

<a name="method-str-apa"></a>
#### `Str::apa()` {.collection-method}

 O método Str::apa converte a string dada para maiúsculas, de acordo com as regras [do APA](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case):

```php
    use Illuminate\Support\Str;

    $title = Str::apa('Creating A Project');

    // 'Creating a Project'
```

<a name="method-str-ascii"></a>
#### `Str::ascii()`{.collection-method}

 O método `Str::ascii` tentará traduzir a string em um valor ASCII:

```php
    use Illuminate\Support\Str;

    $slice = Str::ascii('û');

    // 'u'
```

<a name="method-str-before"></a>
#### Str::before() {.collection-method}

 O método `Str::before` retorna tudo que está antes do valor especificado numa cadeia de caracteres:

```php
    use Illuminate\Support\Str;

    $slice = Str::before('This is my name', 'my name');

    // 'This is '
```

<a name="method-str-before-last"></a>
#### `Str::beforeLast()` {.coletor-método}

 O método `Str::beforeLast` retorna tudo o que aparece antes da última ocorrência do valor indicado numa string.

```php
    use Illuminate\Support\Str;

    $slice = Str::beforeLast('This is my name', 'is');

    // 'This '
```

<a name="method-str-between"></a>
#### `Str::between()` {.collection-method}

 O método `Str::between` retorna o trecho de uma string entre dois valores:

```php
    use Illuminate\Support\Str;

    $slice = Str::between('This is my name', 'This', 'name');

    // ' is my '
```

<a name="method-str-between-first"></a>
#### `Str::betweenFirst()` {.collection-method}

 O método Str::betweenFirst retorna a menor parte possível de uma string entre dois valores:

```php
    use Illuminate\Support\Str;

    $slice = Str::betweenFirst('[a] bc [d]', '[', ']');

    // 'a'
```

<a name="method-camel-case"></a>
#### `Str::camel()` {.collection-method}

 O método Str::camel converte a string fornecida para "camel case":

```php
    use Illuminate\Support\Str;

    $converted = Str::camel('foo_bar');

    // 'fooBar'
```

<a name="method-char-at"></a>

#### `Str::charAt()` {.collection-method}

 O método `Str::charAt` retorna o caractere na posição especificada. Se a posição for inválida, é retornado `false`:

```php
    use Illuminate\Support\Str;

    $character = Str::charAt('This is my name.', 6);

    // 's'
```

<a name="method-str-contains"></a>
#### `Str::contains()` {.collection-method}

 O método `Str::contains` determina se a string fornecida contém o valor fornecido. Esse método é sensível às maiúsculas e minúsculas.

```php
    use Illuminate\Support\Str;

    $contains = Str::contains('This is my name', 'my');

    // true
```

 Você também pode passar uma matriz de valores para determinar se a string contém algum dos valores na matriz:

```php
    use Illuminate\Support\Str;

    $contains = Str::contains('This is my name', ['my', 'foo']);

    // true
```

<a name="method-str-contains-all"></a>
#### `Str::contémTudo()` {.collection-method}

 O método `Str::containsAll` verifica se a string fornecida contém todos os valores num determinado array.

```php
    use Illuminate\Support\Str;

    $containsAll = Str::containsAll('This is my name', ['my', 'name']);

    // true
```

<a name="method-ends-with"></a>
#### `Str::endsWith()` (método da coleção)

 O método Str::endsWith determina se a string em questão termina com o valor passado como argumento:

```php
    use Illuminate\Support\Str;

    $result = Str::endsWith('This is my name', 'name');

    // true
```


 Você também pode passar um array de valores para determinar se a string fornecida termina com qualquer valor do array:

```php
    use Illuminate\Support\Str;

    $result = Str::endsWith('This is my name', ['name', 'foo']);

    // true

    $result = Str::endsWith('This is my name', ['this', 'foo']);

    // false
```

<a name="method-excerpt"></a>
#### `Str::excerpt()` {.collection-method}

 O método `Str::excerpt` extrai um trecho de uma determinada string que corresponde à primeira ocorrência de uma frase nessa string:

```php
    use Illuminate\Support\Str;

    $excerpt = Str::excerpt('This is my name', 'my', [
        'radius' => 3
    ]);

    // '...is my na...'
```

 A opção `radius`, com o padrão `100`, permite definir o número de caracteres que devem aparecer em cada lado da cadeia truncada.

 Você pode usar a opção `omission` para definir a string que será adicionada e removida da string truncada:

```php
    use Illuminate\Support\Str;

    $excerpt = Str::excerpt('This is my name', 'name', [
        'radius' => 3,
        'omission' => '(...) '
    ]);

    // '(...) my name'
```

<a name="method-str-finish"></a>
#### `Str::finalizar()` {.collection-method}

 O método Str::finish adiciona uma única instância do valor dado a uma string se este já não terminar com esse valor:

```php
    use Illuminate\Support\Str;

    $adjusted = Str::finish('this/string', '/');

    // this/string/

    $adjusted = Str::finish('this/string/', '/');

    // this/string/
```

<a name="method-str-headline"></a>
#### ``Str::headline()`` {.collection-method}

 O método `Str::headline` converte strings delimitadas por maiúsculas, hifens ou traços de assinatura em uma string com espaçamento entre palavras e a primeira letra de cada palavra em maiúscula:

```php
    use Illuminate\Support\Str;

    $headline = Str::headline('steve_jobs');

    // Steve Jobs

    $headline = Str::headline('EmailNotificationSent');

    // Email Notification Sent
```

<a name="method-str-inline-markdown"></a>
#### `Str::inlineMarkdown()` {.collection-método}

 O método `Str::inlineMarkdown` converte o Markdown do GitHub em HTML inline usando [CommonMark](https://commonmark.thephpleague.com/). No entanto, ao contrário do método `markdown`, ele não encadeia todo o HTML gerado num elemento de nível de bloco:

```php
    use Illuminate\Support\Str;

    $html = Str::inlineMarkdown('**Laravel**');

    // <strong>Laravel</strong>
```

#### Segurança no Markdown

 Por padrão, o Markdown suporta HTML bruto, que expõe vulnerabilidades de Cross-Site Scripting (XSS) quando usado com input do usuário bruto. Conforme a [documentação de segurança do CommonMark](https://commonmark.thephpleague.com/security/), você pode usar a opção `html_input` para escapar ou remover o HTML bruto, e a opção `allow_unsafe_links` para especificar se é permitido links inseguros. Se você precisa permitir um pouco de HTML bruto, deve passar seu Markdown compilado por uma limpeza de HTML:

```php
    use Illuminate\Support\Str;
    
    Str::inlineMarkdown('Inject: <script>alert("Hello XSS!");</script>', [
        'html_input' => 'strip',
        'allow_unsafe_links' => false,
    ]);
    
    // Inject: alert(&quot;Hello XSS!&quot;);
```

<a name="method-str-is"></a>
#### `Str::is()` {.collection-method}

 O método `Str::is` determina se uma determinada string corresponde ou não a um determinado padrão. Os asteriscos podem ser utilizados como valores de substituição:

```php
    use Illuminate\Support\Str;

    $matches = Str::is('foo*', 'foobar');

    // true

    $matches = Str::is('baz*', 'foobar');

    // false
```

<a name="method-str-is-ascii"></a>
#### `Str::isAscii()` {.collection-method}

 O método `Str::isAscii` permite determinar se uma determinada string é ASCII de 7 bits:

```php
    use Illuminate\Support\Str;

    $isAscii = Str::isAscii('Taylor');

    // true

    $isAscii = Str::isAscii('ü');

    // false
```

<a name="method-str-is-json"></a>
#### `Str::isJson()` {.collection-method}

 O método `Str::isJson` determina se a string fornecida é um código JSON válido:

```php
    use Illuminate\Support\Str;

    $result = Str::isJson('[1,2,3]');

    // true

    $result = Str::isJson('{"first": "John", "last": "Doe"}');

    // true

    $result = Str::isJson('{first: "John", last: "Doe"}');

    // false
```

<a name="method-str-is-url"></a>
#### `Str::isUrl()`{.collection-method}

 O método `Str::isUrl` determina se o texto fornecido é um URL válido:

```php
    use Illuminate\Support\Str;

    $isUrl = Str::isUrl('http://example.com');

    // true

    $isUrl = Str::isUrl('laravel');

    // false
```

 O método `isUrl` considera uma ampla gama de protocolos como válidos. No entanto, você pode especificar os protocolos que devem ser considerados válidos fornecendo-os ao método `isUrl`:

```php
    $isUrl = Str::isUrl('http://example.com', ['http', 'https']);
```

<a name="method-str-is-ulid"></a>
#### `Str::isUlid()` {.collection-method}

 O método `Str::isUlid` determina se uma determinada cadeia de caracteres é um ULID válido:

```php
    use Illuminate\Support\Str;

    $isUlid = Str::isUlid('01gd6r360bp37zj17nxb55yv40');

    // true

    $isUlid = Str::isUlid('laravel');

    // false
```

<a name="method-str-is-uuid"></a>
#### `Str::isUuid()` {.collection-method}

 O método `Str::isUuid` determina se uma determinada string é um UUID válido:

```php
    use Illuminate\Support\Str;

    $isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de');

    // true

    $isUuid = Str::isUuid('laravel');

    // false
```

<a name="method-kebab-case"></a>
#### `Str::kebab()` {.collection-method}

 O método `Str::kebab` converte a string dada para um caso kebab:

```php
    use Illuminate\Support\Str;

    $converted = Str::kebab('fooBar');

    // foo-bar
```

<a name="method-str-lcfirst"></a>
#### `Str::lcfirst()` {.collection-method}

 O método `Str::lcfirst` retorna a string dada com o primeiro caractere sublinhado:

```php
    use Illuminate\Support\Str;

    $string = Str::lcfirst('Foo Bar');

    // foo Bar
```

<a name="method-str-length"></a>
#### `str::length()` {.collection-method}

 O método `Str::length` retorna o comprimento da string indicada:

```php
    use Illuminate\Support\Str;

    $length = Str::length('Laravel');

    // 7
```

<a name="method-str-limit"></a>
#### `Str::limit()` {.collection-method}

 O método Str::limit trunca a string dada até um comprimento especificado:

```php
    use Illuminate\Support\Str;

    $truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20);

    // The quick brown fox...
```

 Você pode passar um terceiro argumento para a método para alterar a string que será adicionada ao final da string truncada.

```php
    use Illuminate\Support\Str;

    $truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20, ' (...)');

    // The quick brown fox (...)
```

<a name="method-str-lower"></a>
#### `Str::lower()` {.collection-method}

 O método Str::lower converte uma string para minusculas:

```php
    use Illuminate\Support\Str;

    $converted = Str::lower('LARAVEL');

    // laravel
```

<a name="method-str-markdown"></a>
#### `Str::markdown()` {.collection-method}

 O método Str::markdown converte o formato de texto do GitHub para Markdown em HTML usando o CommonMark (https://commonmark.thephpleague.com/):

```php
    use Illuminate\Support\Str;

    $html = Str::markdown('# Laravel');

    // <h1>Laravel</h1>

    $html = Str::markdown('# Taylor <b>Otwell</b>', [
        'html_input' => 'strip',
    ]);

    // <h1>Taylor Otwell</h1>
```

#### Segurança no uso do Markdown

 Por padrão, o Markdown suporta HTML bruto, o que exporá vulnerabilidades de Scripting de Sítio Remoto (XSS) quando usado com entrada do utilizador bruta. Conforme a [documentação de Segurança CommonMark](https://commonmark.thephpleague.com/security/), você pode usar a opção `html_input` para esconder ou remover o HTML bruto, e a opção `allow_unsafe_links` para especificar se permitem ligações inseguras. Se necessário, deverá passar a sua marcação do Markdown compilada através de um HTML Purifier:

```php
    use Illuminate\Support\Str;

    Str::markdown('Inject: <script>alert("Hello XSS!");</script>', [
        'html_input' => 'strip',
        'allow_unsafe_links' => false,
    ]);

    // <p>Inject: alert(&quot;Hello XSS!&quot;);</p>
```

<a name="method-str-mask"></a>
#### `Str::mask()` {.collection-method}

 O método Str::mask masca uma porção de uma string com um caractere repetido e pode ser utilizado para obscurecer segmentos de strings, como endereços de correio eletrónico e números de telemóvel:

```php
    use Illuminate\Support\Str;

    $string = Str::mask('taylor@example.com', '*', 3);

    // tay***************
```

 Caso necessário, você pode fornecer um número negativo como o terceiro parâmetro do método `mask`, que direcionará o método a iniciar a mascaragem a uma certa distância da extremidade da string:

```php
    $string = Str::mask('taylor@example.com', '*', -15, 3);

    // tay***@example.com
```

<a name="method-str-ordered-uuid"></a>
#### `Str::orderedUuid()` {.collection-method}

 O método `Str::orderedUuid` gera um UUID de "timestamps primeiro" que pode ser armazenado de forma eficiente em uma coluna de banco de dados com índice. Cada UUID gerado por este método será ordenado após os UUIDs gerados anteriormente pelo método:

```php
    use Illuminate\Support\Str;

    return (string) Str::orderedUuid();
```

<a name="method-str-padboth"></a>
#### `Str::padBoth()` {.collection-method}

 O método `Str::padBoth` envolve a função `str_pad` do PHP e pega os dois lados de uma string com outra string até que a string final atinja o comprimento desejado:

```php
    use Illuminate\Support\Str;

    $padded = Str::padBoth('James', 10, '_');

    // '__James___'

    $padded = Str::padBoth('James', 10);

    // '  James   '
```

<a name="method-str-padleft"></a>
#### `Str::padLeft()` {.collection-method}

 O método `Str::padLeft` envolve a função PHP `str_pad`, que realiza o padrão na parte esquerda de uma cadeia de caracteres com outra cadeia até atingir o comprimento desejado da última cadeia:

```php
    use Illuminate\Support\Str;

    $padded = Str::padLeft('James', 10, '-=');

    // '-=-=-James'

    $padded = Str::padLeft('James', 10);

    // '     James'
```

<a name="method-str-padright"></a>
#### `Str::padRight()`{.collection-method}

 O método Str::padRight envolve o uso da função str_pad do PHP e alinha os caracteres diretamente à direita de uma cadeia até que esta atinja o comprimento desejado.

```php
    use Illuminate\Support\Str;

    $padded = Str::padRight('James', 10, '-');

    // 'James-----'

    $padded = Str::padRight('James', 10);

    // 'James     '
```

<a name="method-str-password"></a>
#### `Str::password()` {.collection-method}

 O método Str::password pode ser usado para gerar uma senha segura e aleatória de determinada formação. A senha consistirá em combinações de letras, números, símbolos e espaços. As senhas por padrão têm 32 caracteres:

```php

    use Illuminate\Support\Str;

    $password = Str::password();

    // 'EbJo2vE-AS:U,$%_gkrV4n,q~1xy/-_4'

    $password = Str::password(12);

    // 'qwuar>#V|i]N'
```

<a name="method-str-plural"></a>
#### Str::plural() {.collection-method}

 O método `Str::plural` converte uma string de palavra singular para sua forma plural. Esta função suporta as [línguas que o pluralizador do Laravel suporta](/docs/localization#pluralização-de-idioma):

```php
    use Illuminate\Support\Str;

    $plural = Str::plural('car');

    // cars

    $plural = Str::plural('child');

    // children
```

 Você pode fornecer um número inteiro como segundo argumento da função para recuperar a forma singular ou plural da string:

```php
    use Illuminate\Support\Str;

    $plural = Str::plural('child', 2);

    // children

    $singular = Str::plural('child', 1);

    // child
```

<a name="method-str-plural-studly"></a>
#### `Str::pluralStudly()` {.collection-method}

 O método `Str::pluralStudly` converte uma string de palavra singular formatada no caso studly caps para sua forma plural. Esta função suporta [qualquer um dos idiomas suportados pelo pluralizer do Laravel](/docs/localization#pluralization-language):

```php
    use Illuminate\Support\Str;

    $plural = Str::pluralStudly('VerifiedHuman');

    // VerifiedHumans

    $plural = Str::pluralStudly('UserFeedback');

    // UserFeedback
```

 Você pode fornecer um inteiro como segundo argumento à função para recuperar a forma singular ou plural da string.

```php
    use Illuminate\Support\Str;

    $plural = Str::pluralStudly('VerifiedHuman', 2);

    // VerifiedHumans

    $singular = Str::pluralStudly('VerifiedHuman', 1);

    // VerifiedHuman
```

<a name="method-str-position"></a>
#### `Str::position()` {.collection-method}

 O método `Str::position` retorna a posição da primeira ocorrência de uma substrings em uma cadeia de caracteres. Se a substring não existe na cadeia de caracteres especificada, `false` é retornado:

```php
    use Illuminate\Support\Str;

    $position = Str::position('Hello, World!', 'Hello');

    // 0

    $position = Str::position('Hello, World!', 'W');

    // 7
```

<a name="method-str-random"></a>
#### `Str::random()` {.collection-method}

 O método `Str::random` gera uma string aleatória da extensão especificada. Esta função utiliza a função `random_bytes` do PHP:

```php
    use Illuminate\Support\Str;

    $random = Str::random(40);
```

 Durante os testes, pode ser útil "inventar" o valor retornado pelo método `Str::random`. Para fazer isso, você pode usar o método `createRandomStringsUsing`:

```php
    Str::createRandomStringsUsing(function () {
        return 'fake-random-string';
    });
```

 Para instruir o método `random` a retornar as gerações de cadeias aleatórias normalmente, você pode invocar o método `createRandomStringsNormally`:

```php
    Str::createRandomStringsNormally();
```

<a name="method-str-remove"></a>
#### `Str::remover()` {.collection-method}

 O método `Str::remove` remove o valor ou os valores dados da string:

```php
    use Illuminate\Support\Str;

    $string = 'Peter Piper picked a peck of pickled peppers.';

    $removed = Str::remove('e', $string);

    // Ptr Pipr pickd a pck of pickld ppprs.
```

 Você também pode passar um terceiro argumento de `falso` para o método `remove`, caso queira ignorar os casos ao remover as string.

<a name="method-str-repeat"></a>
#### `Str::repeat()` {.collection-method}

 O método `Str::repeat` repete a string dada:

```php
use Illuminate\Support\Str;

$string = 'a';

$repeat = Str::repeat($string, 5);

// aaaaa
```

<a name="method-str-replace"></a>
#### Str::replace() {.collection-method}

 O método `Str::replace` substitui uma determinada string no meio de uma string:

```php
    use Illuminate\Support\Str;

    $string = 'Laravel 10.x';

    $replaced = Str::replace('10.x', '11.x', $string);

    // Laravel 11.x
```

 O método `replace` também aceita um argumento `caseSensitive`. Por padrão, o método `replace` é sensível às maiúsculas e minúsculas.

```php
    Str::replace('Framework', 'Laravel', caseSensitive: false);
```

<a name="method-str-replace-array"></a>
#### `Str::replaceArray()` {.collection-method}

 O método `Str::replaceArray` substitui um determinado valor na string de forma seqüencial usando uma matriz:

```php
    use Illuminate\Support\Str;

    $string = 'The event will take place between ? and ?';

    $replaced = Str::replaceArray('?', ['8:30', '9:00'], $string);

    // The event will take place between 8:30 and 9:00
```

<a name="method-str-replace-first"></a>
#### `Str::substituirPorTerceiro()` {.collection-method}

 O método Str::replaceFirst substitui a primeira ocorrência de um determinado valor em uma string:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceFirst('the', 'a', 'the quick brown fox jumps over the lazy dog');

    // a quick brown fox jumps over the lazy dog
```

<a name="method-str-replace-last"></a>
#### `Str::replaceLast()` {.collection-method}

 O método `Str::replaceLast` substitui a última ocorrência de um determinado valor em uma string:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceLast('the', 'a', 'the quick brown fox jumps over the lazy dog');

    // the quick brown fox jumps over a lazy dog
```

<a name="method-str-replace-matches"></a>
#### `str::replaceMatches()` {.collection-method}

 O método Str::replaceMatches substitui todas as porções de uma cadeia que correspondam a um padrão, com a cadeia de substituição indicada:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceMatches(
        pattern: '/[^A-Za-z0-9]++/',
        replace: '',
        subject: '(+1) 501-555-1000'
    )

    // '15015551000'
```

 A metodologia `replaceMatches` também aceita um fecho de função que será invocado com cada parte da string correspondente ao padrão fornecido. Isto permite-lhe executar a lógica de substituição no seio do fecho e retornar o valor substituído:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceMatches('/\d/', function (array $matches) {
        return '['.$matches[0].']';
    }, '123');

    // '[1][2][3]'
```

<a name="method-str-replace-start"></a>
#### `Str::replaceStart()` {.collection-method}

 O método `Str::replaceStart` substitui a primeira ocorrência do valor especificado apenas se o valor aparecer no início da cadeia de caracteres:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceStart('Hello', 'Laravel', 'Hello World');

    // Laravel World

    $replaced = Str::replaceStart('World', 'Laravel', 'Hello World');

    // Hello World
```

<a name="method-str-replace-end"></a>
#### `Str::replaceEnd()` {.collection-method}

 O método `Str::replaceEnd` substitui a última ocorrência do valor indicado somente se este estiver no final da cadeia de caracteres:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceEnd('World', 'Laravel', 'Hello World');

    // Hello Laravel

    $replaced = Str::replaceEnd('Hello', 'Laravel', 'Hello World');

    // Hello World
```

<a name="method-str-reverse"></a>
#### `Str::reverse()` {.collection-method}

 O método `Str::reverse` inverte a ordem das letras da string passada como parâmetro:

```php
    use Illuminate\Support\Str;

    $reversed = Str::reverse('Hello World');

    // dlroW olleH
```

<a name="method-str-singular"></a>
#### `Str::singular()` {.collection-method}

 O método Str::singular converte uma string para sua forma singular. Essa função suporta [qualquer uma das linguagens suportadas pelo pluralizador do Laravel]:

```php
    use Illuminate\Support\Str;

    $singular = Str::singular('cars');

    // car

    $singular = Str::singular('children');

    // child
```

<a name="method-str-slug"></a>
#### Str::slug() {.collection-method}

 O método Str::slug gera um "slug" amigável do site da cadeia de caracteres fornecida:

```php
    use Illuminate\Support\Str;

    $slug = Str::slug('Laravel 5 Framework', '-');

    // laravel-5-framework
```

<a name="method-snake-case"></a>
#### `Str::snake()` {.collection-method}

 O método Str::snake converte a string dada em notação case sensível.

```php
    use Illuminate\Support\Str;

    $converted = Str::snake('fooBar');

    // foo_bar

    $converted = Str::snake('fooBar', '-');

    // foo-bar
```

<a name="method-str-squish"></a>
#### `Str::squish()` {.collection-method}

 O método `Str::squish` remove todos os espaços em branco não necessários de uma string, incluindo os entre palavras:

```php
    use Illuminate\Support\Str;

    $string = Str::squish('    laravel    framework    ');

    // laravel framework
```

<a name="method-str-start"></a>
#### `Str::start()` {.collection-method}

 O método `Str::start` adiciona uma única instância do valor dado a uma cadeia de caracteres, se não começar com ele.

```php
    use Illuminate\Support\Str;

    $adjusted = Str::start('this/string', '/');

    // /this/string

    $adjusted = Str::start('/this/string', '/');

    // /this/string
```

<a name="method-starts-with"></a>
#### `Str::startsWith()` {.collection-method}

 O método `Str::startsWith` verifica se a string fornecida começa com o valor indicado:

```php
    use Illuminate\Support\Str;

    $result = Str::startsWith('This is my name', 'This');

    // true
```

 Se um array de valores possíveis for passado, o método `startsWith` retornará `verdadeiro` se a string começar com qualquer um dos valores apresentados:

```php
    $result = Str::startsWith('This is my name', ['This', 'That', 'There']);

    // true
```

<a name="method-studly-case"></a>
#### Str::studly() {.collection-método}

 O método `Str::studly` converte a string em `StudlyCase`:

```php
    use Illuminate\Support\Str;

    $converted = Str::studly('foo_bar');

    // FooBar
```

<a name="method-str-substr"></a>
#### `Str::substr()` {.collection-method}

 O método Str::substr retorna a porção da cadeia de caracteres especificada pelos parâmetros início e comprimento:

```php
    use Illuminate\Support\Str;

    $converted = Str::substr('The Laravel Framework', 4, 7);

    // Laravel
```

<a name="method-str-substrcount"></a>
#### `Str::substrCount()` {.collection-method}

 O método `Str::substrCount` retorna o número de ocurrências de um valor especificado numa determinada string.

```php
    use Illuminate\Support\Str;

    $count = Str::substrCount('If you like ice cream, you will like snow cones.', 'like');

    // 2
```

<a name="method-str-substrreplace"></a>
#### `Str::substituirRaiz()` {.collection-method}

 O método `Str::substrReplace` substitui texto dentro de uma porção de uma string, começando na posição especificada pelo terceiro argumento e substituindo o número de caracteres especificado pelo quarto argumento. A passagem de `0` ao quarto argumento do método irá inserir a string na posição especificada sem substituir quaisquer dos caracteres existentes na string:

```php
    use Illuminate\Support\Str;

    $result = Str::substrReplace('1300', ':', 2);
    // 13:

    $result = Str::substrReplace('1300', ':', 2, 0);
    // 13:00
```

<a name="method-str-swap"></a>
#### Str::swap() {.collection-method}

 O método Str::swap substitui vários valores na string fornecida utilizando a função strtr do PHP:

```php
    use Illuminate\Support\Str;

    $string = Str::swap([
        'Tacos' => 'Burritos',
        'great' => 'fantastic',
    ], 'Tacos are great!');

    // Burritos are fantastic!
```

<a name="method-take"></a>
#### `Str::take()` {.collection-method}

 O método `Str::take` retorna um número especificado de caracteres do início de uma cadeia de caracteres:

```php
    use Illuminate\Support\Str;

    $taken = Str::take('Build something amazing!', 5);

    // Build
```

<a name="method-title-case"></a>
#### `Str::título()` {.coleção-método}

 O método `Str::title` converte a cadeia de caracteres especificada para letra maiúscula:

```php
    use Illuminate\Support\Str;

    $converted = Str::title('a nice title uses the correct case');

    // A Nice Title Uses The Correct Case
```

<a name="method-str-to-base64"></a>
#### `Str::toBase64()` {.collection-method}

 O método `Str::toBase64` converte a string dada para o formato Base64:

```php
    use Illuminate\Support\Str;

    $base64 = Str::toBase64('Laravel');

    // TGFyYXZlbA==
```

<a name="method-str-to-html-string"></a>
#### `Str::toHtmlString()`{.collection-método}

 O método `Str::toHtmlString` converte a instância da string em uma instância de `Illuminate\Support\HtmlString`, podendo ser exibida nos modelos Blade:

```php
    use Illuminate\Support\Str;

    $htmlString = Str::of('Nuno Maduro')->toHtmlString();
```

<a name="method-str-trim"></a>
#### `Str::trim()` {.collection-method}

 O método `Str::trim` elimina espaços em branco (ou outros caracteres) do início e do fim da string dada. Diferente da função nativa de PHP, o método `Str::trim` também remove espaços em branco unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::trim(' foo bar ');

    // 'foo bar'
```

<a name="method-str-ltrim"></a>
#### `Str::ltrim()` {.collection-method}

 O método Str::ltrim remove os espaços em branco (ou outros caracteres) que aparecem no início da string fornecida. Diferente da função nativa ltrim do PHP, o método Str::ltrim também remove os espaços reservados Unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::ltrim('  foo bar  ');

    // 'foo bar  '
```

<a name="method-str-rtrim"></a>
#### Str::rtrim () {método de coleção}

 O método `Str::rtrim` remove espaços em branco (ou outros caracteres) do final da cadeia de carácter fornecida. Diferente da função nativa `rtrim` do PHP, o método `Str::rtrim` também remove espaços em branco unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::rtrim('  foo bar  ');

    // '  foo bar'
```

<a name="method-str-ucfirst"></a>
#### Str::ucfirst() {.collection-method}

 O método Str::ucfirst retorna a string dada com o primeiro caractere inicializado:

```php
    use Illuminate\Support\Str;

    $string = Str::ucfirst('foo bar');

    // Foo bar
```

<a name="method-str-ucsplit"></a>
#### `Str::ucsplit()` {.collection-method}

 O método `Str::ucsplit` divide a string em um array com caracteres maiúsculos:

```php
    use Illuminate\Support\Str;

    $segments = Str::ucsplit('FooBar');

    // [0 => 'Foo', 1 => 'Bar']
```

<a name="method-str-upper"></a>
#### `Str::upper()` {.collection-method}

 O método `Str::upper` converte a string em maiúsculas:

```php
    use Illuminate\Support\Str;

    $string = Str::upper('laravel');

    // LARAVEL
```

<a name="method-str-ulid"></a>
#### `Str::ulid()` {.collection-method}

 O método `Str::ulid` gera um identificador único de tempo ordenado e compacto conhecido como ULID:

```php
    use Illuminate\Support\Str;

    return (string) Str::ulid();
    
    // 01gd6r360bp37zj17nxb55yv40
```

 Se você quiser recuperar uma instância da classe `Illuminate\Support\Carbon`, que representa a data e hora em que o ULID especificado foi criado, poderá usar o método `createFromId` fornecido pela integração do Carbon no Laravel:

```php
    use Illuminate\Support\Carbon;
    use Illuminate\Support\Str;

    $date = Carbon::createFromId((string) Str::ulid());
```

 Durante o teste, talvez seja útil "inventar" um valor que será retornado pelo método `Str::ulid`. Para fazer isso, você pode usar o método `createUlidsUsing`:

```php
    use Symfony\Component\Uid\Ulid;

    Str::createUlidsUsing(function () {
        return new Ulid('01HRDBNHHCKNW2AK4Z29SN82T9');
    });
```

 Para instruir o método `ulid` a retornar normalmente os ULIDs, você pode invocar o método `createUlidsNormally`:

```php
    Str::createUlidsNormally();
```

<a name="method-str-unwrap"></a>
#### `Str::unwrap()` {.collection-method}

 O método `Str::unwrap` remove as letras iniciais e finais de uma string dada:

```php
    use Illuminate\Support\Str;

    Str::unwrap('-Laravel-', '-');

    // Laravel

    Str::unwrap('{framework: "Laravel"}', '{', '}');

    // framework: "Laravel"
```

<a name="method-str-uuid"></a>
#### `Str::uuid()` {.collection-method}

 O método `Str::uuid` gera um UUID (versão 4):

```php
    use Illuminate\Support\Str;

    return (string) Str::uuid();
```

 Durante o teste, talvez seja útil "inventar" um valor que será retornado pelo método `Str::uuid`. Para fazer isso, você pode usar o método `createUuidsUsing`:

```php
    use Ramsey\Uuid\Uuid;

    Str::createUuidsUsing(function () {
        return Uuid::fromString('eadbfeac-5258-45c2-bab7-ccb9b5ef74f9');
    });
```

 Para instruir o método `uuid` a retornar para gerar UUIDs normalmente, você pode invocar o método `createUuidsNormally`:

```php
    Str::createUuidsNormally();
```

<a name="method-str-word-count"></a>
#### `Str::wordCount()` {.collection-method}

 O método `Str::wordCount` retorna o número de palavras que uma string possui:

```php
use Illuminate\Support\Str;

Str::wordCount('Hello, world!'); // 2
```

<a name="method-str-word-wrap"></a>
#### `Str::wordWrap()` {.collection-method}

 O método `Str::wordWrap` envolve uma cadeia para um número dado de caracteres:

```php
    use Illuminate\Support\Str;

    $text = "The quick brown fox jumped over the lazy dog."

    Str::wordWrap($text, characters: 20, break: "<br />\n");

    /*
    The quick brown fox<br />
    jumped over the lazy<br />
    dog.
    */
```

<a name="method-str-words"></a>
#### `Str::words()` {.collection-method}

 O método `Str::words` limita o número de palavras numa string. Pode ser passada uma string adicional a este método através do terceiro argumento para especificar qual string deve ser anexada à extremidade da string truncada:

```php
    use Illuminate\Support\Str;

    return Str::words('Perfectly balanced, as all things should be.', 3, ' >>>');

    // Perfectly balanced, as >>>
```

<a name="method-str-wrap"></a>
#### `Str::wrap()` {.collection-method}

 O método Str::wrap envolve a string dada em um ou mais pares de strings:

```php
    use Illuminate\Support\Str;

    Str::wrap('Laravel', '"');

    // "Laravel"

    Str::wrap('is', before: 'This ', after: ' Laravel!');

    // This is Laravel!
```

<a name="method-str"></a>
#### `str()`{.collection-method}

 A função `str` retorna uma nova instância de `Illuminate\Support\Stringable` da string especificada, que é equivalente ao método `Str::of`.

```php
    $string = str('Taylor')->append(' Otwell');

    // 'Taylor Otwell'
```

 Se nenhum argumento for fornecido à função `str`, a função retorna uma instância do padrão `Illuminate\Support\Str`:

```php
    $snake = str()->snake('FooBar');

    // 'foo_bar'
```

<a name="method-trans"></a>
#### `trans()` {.collection-method}

 A função `trans` traduz a chave de tradução especificada usando seus arquivos de [linguagem](/docs/localization):

```php
    echo trans('messages.welcome');
```

 Se a chave de tradução especificada não existir, a função `trans` retornará a chave fornecida. Assim, usando o exemplo acima, a função `trans` retornaria `messages.welcome` se a chave de tradução não existir.

<a name="method-trans-choice"></a>
#### `trans_choice()` {.collection-method}

 A função `trans_choice` traduz a chave de tradução fornecida com inflexão:

```php
    echo trans_choice('messages.notifications', $unreadCount);
```

 Se a chave de tradução especificada não existir, a função `trans_choice` retornará a chave dada. Assim, considerando o exemplo acima, a função `trans_choice` retornaria `messages.notifications` se a chave de tradução não existir.

<a name="fluent-strings"></a>
## Cordas fluentes

 As cadeias ativas oferecem uma interface mais fluida e baseada em objetos para o trabalho com valores de cadeia, permitindo que você junte várias operações de cadeia usando uma sintaxe mais legível do que as operações tradicionais.

<a name="method-fluent-str-after"></a>
#### `depois de` {.método da coleção}

 O método `after` retorna tudo o que aparece após o valor indicado numa string. A string inteira será retornada se o valor não estiver presente na string:

```php
    use Illuminate\Support\Str;

    $slice = Str::of('This is my name')->after('This is');

    // ' my name'
```

<a name="method-fluent-str-after-last"></a>
#### `afterLast` {.método da coleção}

 O método `afterLast` retorna tudo depois da última ocorrência do valor especificado numa cadeia de caracteres. A cadeia inteira é retornada se o valor não existir na cadeia:

```php
    use Illuminate\Support\Str;

    $slice = Str::of('App\Http\Controllers\Controller')->afterLast('\\');

    // 'Controller'
```

<a name="method-fluent-str-apa"></a>
#### ``apa`` {.collection-method}

 O método `apa` converte a string fornecida para maiúsculas de acordo com as diretrizes do [APA](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case):

```php
    use Illuminate\Support\Str;

    $converted = Str::of('a nice title uses the correct case')->apa();

    // A Nice Title Uses the Correct Case
```

<a name="method-fluent-str-append"></a>
#### `anexar` {.collection-method}

 O método `append` adiciona os valores dados à string:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Taylor')->append(' Otwell');

    // 'Taylor Otwell'
```

<a name="method-fluent-str-ascii"></a>
#### `ascii` {.collection-method}

 O método `ascii` irá tentar translitar a string para um valor ASCII:

```php
    use Illuminate\Support\Str;

    $string = Str::of('ü')->ascii();

    // 'u'
```

<a name="method-fluent-str-basename"></a>
#### `basename`{.method-collection}

 O método `basename` retorna o componente do nome seguido da string dada:

```php
    use Illuminate\Support\Str;

    $string = Str::of('/foo/bar/baz')->basename();

    // 'baz'
```

 Se necessário, você pode fornecer uma "extensão", que será removida do componente posterior:

```php
    use Illuminate\Support\Str;

    $string = Str::of('/foo/bar/baz.jpg')->basename('.jpg');

    // 'baz'
```

<a name="method-fluent-str-before"></a>
#### `antes de` {.método da coleção}

 O método "before" retorna tudo antes do valor fornecido em uma string:

```php
    use Illuminate\Support\Str;

    $slice = Str::of('This is my name')->before('my name');

    // 'This is '
```

<a name="method-fluent-str-before-last"></a>
#### `anterior ao último` {.collection-method}

 O método `beforeLast` retorna tudo antes da última ocorrência do valor especificado em uma string.

```php
    use Illuminate\Support\Str;

    $slice = Str::of('This is my name')->beforeLast('is');

    // 'This '
```

<a name="method-fluent-str-between"></a>
#### `entre` {.collection-method}

 O método `entre` retorna o trecho de uma string entre dois valores:

```php
    use Illuminate\Support\Str;

    $converted = Str::of('This is my name')->between('This', 'name');

    // ' is my '
```

<a name="method-fluent-str-between-first"></a>
#### `entre primeiro` {.collection-method}

 O método `betweenFirst` retorna uma porção do valor mínimo entre dois valores numa string:

```php
    use Illuminate\Support\Str;

    $converted = Str::of('[a] bc [d]')->betweenFirst('[', ']');

    // 'a'
```

<a name="method-fluent-str-camel"></a>
#### `camelo` {.collection-method}

 O método `camel` converte a string dada para `camelCase`:

```php
    use Illuminate\Support\Str;

    $converted = Str::of('foo_bar')->camel();

    // 'fooBar'
```

<a name="method-fluent-str-char-at"></a>
#### `charAt` {.método de coleção}

 O método `charAt` retorna o caractere na posição especificada. Se a posição estiver fora dos limites do array, `false` é retornado:

```php
    use Illuminate\Support\Str;

    $character = Str::of('This is my name.')->charAt(6);

    // 's'
```

<a name="method-fluent-str-class-basename"></a>
#### classBasename {.collection-method}

 O método `classBasename` retorna o nome de classe da classe especificada, com o namespace da classe removido:

```php
    use Illuminate\Support\Str;

    $class = Str::of('Foo\Bar\Baz')->classBasename();

    // 'Baz'
```

<a name="method-fluent-str-contains"></a>
#### `contém` {.collection-method}

 O método `contains` determina se a string indicada contém o valor especificado. Esse método é sensível às maiúsculas e minúsculas:

```php
    use Illuminate\Support\Str;

    $contains = Str::of('This is my name')->contains('my');

    // true
```

 Você também pode passar uma matriz de valores para determinar se a string contém algum valor da matriz:

```php
    use Illuminate\Support\Str;

    $contains = Str::of('This is my name')->contains(['my', 'foo']);

    // true
```

<a name="method-fluent-str-contains-all"></a>
#### `containsAll` {.collection-method}

 O método `containsAll` determina se a string fornecida contém todas as valores do array:

```php
    use Illuminate\Support\Str;

    $containsAll = Str::of('This is my name')->containsAll(['my', 'name']);

    // true
```

<a name="method-fluent-str-dirname"></a>
#### `dirname` {.collection-method}

 O método `dirname` retorna a parte da diretoria-pai do valor fornecido como argumento:

```php
    use Illuminate\Support\Str;

    $string = Str::of('/foo/bar/baz')->dirname();

    // '/foo/bar'
```

 Se necessário, pode especificar quantos níveis de pasta pretende remover da string:

```php
    use Illuminate\Support\Str;

    $string = Str::of('/foo/bar/baz')->dirname(2);

    // '/foo'
```

<a name="method-fluent-str-excerpt"></a>
#### `resumo` {.método de coleta}

 O método `excerpt` extrai um trecho da string que corresponde à primeira instância de uma frase nela contida:

```php
    use Illuminate\Support\Str;

    $excerpt = Str::of('This is my name')->excerpt('my', [
        'radius' => 3
    ]);

    // '...is my na...'
```

 A opção `radius`, que tem por padrão o valor `100`, permite definir o número de caracteres que devem aparecer a cada lado do string truncatado.

 Além disso, é possível usar a opção "omissão" para alterar a string que será adicionada antes e depois da string truncada.

```php
    use Illuminate\Support\Str;

    $excerpt = Str::of('This is my name')->excerpt('name', [
        'radius' => 3,
        'omission' => '(...) '
    ]);

    // '(...) my name'
```

<a name="method-fluent-str-ends-with"></a>
#### `termina com` {.collection-method}

 O método `endsWith` determina se uma string termina com o valor especificado:

```php
    use Illuminate\Support\Str;

    $result = Str::of('This is my name')->endsWith('name');

    // true
```

 Você também pode passar um array de valores para determinar se a cadeia terminada com qualquer valor do array:

```php
    use Illuminate\Support\Str;

    $result = Str::of('This is my name')->endsWith(['name', 'foo']);

    // true

    $result = Str::of('This is my name')->endsWith(['this', 'foo']);

    // false
```

<a name="method-fluent-str-exactly"></a>
#### `exatamente` {.collection-method}

 O método `exactly` determina se a cadeia de caracteres especificada corresponde exatamente à outra cadeia de caracteres:

```php
    use Illuminate\Support\Str;

    $result = Str::of('Laravel')->exactly('Laravel');

    // true
```

<a name="method-fluent-str-explode"></a>
#### ``detonar``{.collection-method}

 O método `explode` divide a string pelo divisor indicado e retorna uma coleção contendo cada seção da string dividida.

```php
    use Illuminate\Support\Str;

    $collection = Str::of('foo bar baz')->explode(' ');

    // collect(['foo', 'bar', 'baz'])
```

<a name="method-fluent-str-finish"></a>
#### `concluir` {.collection-method}

 O método `finish` adiciona uma única instância do valor indicado a uma cadeia de caracteres se esta não terminar com esse valor:

```php
    use Illuminate\Support\Str;

    $adjusted = Str::of('this/string')->finish('/');

    // this/string/

    $adjusted = Str::of('this/string/')->finish('/');

    // this/string/
```

<a name="method-fluent-str-headline"></a>
#### `Título` {.collection-method}

 O método `headline` converte uma sequência de letras separadas por hifens ou sublinhados para uma sequência espaçada com as primeiras letras maiúsculas das palavras:

```php
    use Illuminate\Support\Str;

    $headline = Str::of('taylor_otwell')->headline();

    // Taylor Otwell

    $headline = Str::of('EmailNotificationSent')->headline();

    // Email Notification Sent
```

<a name="method-fluent-str-inline-markdown"></a>
#### ``inlineMarkdown`` {.collection-method}

 O método `inlineMarkdown` converte o GitHub Flavored Markdown em HTML inline utilizando [CommonMark](https://commonmark.thephpleague.com/). No entanto, ao contrário do que acontece com o método `markdown`, ele não encadeia todo o HTML gerado num elemento de nível bloco:

```php
    use Illuminate\Support\Str;

    $html = Str::of('**Laravel**')->inlineMarkdown();

    // <strong>Laravel</strong>
```

#### Segurança no Markdown

 Por padrão, o Markdown suporta HTML bruto, que expõe vulnerabilidades de injeção de scripts (XSS) quando usado com input do usuário bruto. Conforme a documentação de segurança [CommonMark](https://commonmark.thephpleague.com/security/), você pode usar a opção `html_input` para escapar ou remover HTML bruto, e a opção `allow_unsafe_links` para especificar se permite links inseguros. Se precisar permitir algum HTML bruto, deve passar seu Markdown compilado através de um purificador de HTML:

```php
    use Illuminate\Support\Str;

    Str::of('Inject: <script>alert("Hello XSS!");</script>')->inlineMarkdown([
        'html_input' => 'strip',
        'allow_unsafe_links' => false,
    ]);

    // Inject: alert(&quot;Hello XSS!&quot;);
```

<a name="method-fluent-str-is"></a>
#### “é” {.collection-method}

 O método `is` determina se uma determinada string corresponde a um padrão especificado. Os asteriscos podem ser utilizados como valores de substituição.

```php
    use Illuminate\Support\Str;

    $matches = Str::of('foobar')->is('foo*');

    // true

    $matches = Str::of('foobar')->is('baz*');

    // false
```

<a name="method-fluent-str-is-ascii"></a>
#### `isAscii` {.collection-method}

 O método `isAscii` determina se uma determinada cadeia de caracteres é uma cadeia de caracteres ASCII.

```php
    use Illuminate\Support\Str;

    $result = Str::of('Taylor')->isAscii();

    // true

    $result = Str::of('ü')->isAscii();

    // false
```

<a name="method-fluent-str-is-empty"></a>
#### `isEmpty` {método da coleção}

 O método `isEmpty` determina se a string fornecida está vazia:

```php
    use Illuminate\Support\Str;

    $result = Str::of('  ')->trim()->isEmpty();

    // true

    $result = Str::of('Laravel')->trim()->isEmpty();

    // false
```

<a name="method-fluent-str-is-not-empty"></a>
#### `não está vazio`.

 O método `isNotEmpty` determina se a string fornecida não está vazia:

```php
    use Illuminate\Support\Str;

    $result = Str::of('  ')->trim()->isNotEmpty();

    // false

    $result = Str::of('Laravel')->trim()->isNotEmpty();

    // true
```

<a name="method-fluent-str-is-json"></a>
#### `isJson` {.collection-method}

 O método `isJson` determina se uma determinada string é um JSON válido:

```php
    use Illuminate\Support\Str;

    $result = Str::of('[1,2,3]')->isJson();

    // true

    $result = Str::of('{"first": "John", "last": "Doe"}')->isJson();

    // true

    $result = Str::of('{first: "John", last: "Doe"}')->isJson();

    // false
```

<a name="method-fluent-str-is-ulid"></a>
#### `isUlid` {.collection-method}

 O método `isUlid` determina se uma determinada cadeia é um ULID:

```php
    use Illuminate\Support\Str;

    $result = Str::of('01gd6r360bp37zj17nxb55yv40')->isUlid();

    // true

    $result = Str::of('Taylor')->isUlid();

    // false
```

<a name="method-fluent-str-is-url"></a>
#### `isUrl` {.collection-method}

 O método `isUrl` determina se uma determinada string é um endereço de URL:

```php
    use Illuminate\Support\Str;

    $result = Str::of('http://example.com')->isUrl();

    // true

    $result = Str::of('Taylor')->isUrl();

    // false
```

 O método `isUrl` considera uma grande variedade de protocolos como válidos. No entanto, pode especificar os protocolos que devem ser considerados válidos facultando-os ao método `isUrl`:

```php
    $result = Str::of('http://example.com')->isUrl(['http', 'https']);
```

<a name="method-fluent-str-is-uuid"></a>
#### `isUuid` {.collection-method}

 O método `isUuid` determina se uma determinada string é um GUID (Identificador global único):

```php
    use Illuminate\Support\Str;

    $result = Str::of('5ace9ab9-e9cf-4ec6-a19d-5881212a452c')->isUuid();

    // true

    $result = Str::of('Taylor')->isUuid();

    // false
```

<a name="method-fluent-str-kebab"></a>
#### `kebab` {.collection-method}

 O método `kebab` converte a string dada para `caixa baixa`:

```php
    use Illuminate\Support\Str;

    $converted = Str::of('fooBar')->kebab();

    // foo-bar
```

<a name="method-fluent-str-lcfirst"></a>
#### `lcfirst` {.collection-method}

 O método `lcfirst` retorna a string indicada com o primeiro caractere minúscula:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Foo Bar')->lcfirst();

    // foo Bar
```

<a name="method-fluent-str-length"></a>
#### `tamanho` {.metodo de coleção}

 O método `length` retorna o comprimento do nome dado:

```php
    use Illuminate\Support\Str;

    $length = Str::of('Laravel')->length();

    // 7
```

<a name="method-fluent-str-limit"></a>
#### `limite` {. método de criação de coleções}

 O método `limit` trunca a cadeia especificada para a comprimento especificado.

```php
    use Illuminate\Support\Str;

    $truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20);

    // The quick brown fox...
```

 Também é possível passar um segundo argumento para mudar a cadeia de caracteres que será anexada ao final da cadeia truncada.

```php
    use Illuminate\Support\Str;

    $truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20, ' (...)');

    // The quick brown fox (...)
```

<a name="method-fluent-str-lower"></a>
#### `abaixo` {.collection-method}

 O método `lower` converte a cadeia dada para letras minúsculas:

```php
    use Illuminate\Support\Str;

    $result = Str::of('LARAVEL')->lower();

    // 'laravel'
```

<a name="method-fluent-str-markdown"></a>
#### `markdown` {.collection-method}

 O método `markdown` converte o Markdown com gosto do GitHub em HTML:

```php
    use Illuminate\Support\Str;

    $html = Str::of('# Laravel')->markdown();

    // <h1>Laravel</h1>

    $html = Str::of('# Taylor <b>Otwell</b>')->markdown([
        'html_input' => 'strip',
    ]);

    // <h1>Taylor Otwell</h1>
```

#### Sistema de segurança do Markdown

 Por padrão, o Markdown suporta HTML bruto, que expõe vulnerabilidades de injeção de código (XSS) quando utilizado com input do utilizador bruto. Conforme a documentação [de segurança CommonMark](https://commonmark.thephpleague.com/security/), pode usar a opção `html_input` para escrever ou remover HTML bruto e a opção `allow_unsafe_links` para especificar se permite links inseguros. Se necessitar permitir HTML bruto, deve passar o seu Markdown compilado através de um purificador HTML:

```php
    use Illuminate\Support\Str;

    Str::of('Inject: <script>alert("Hello XSS!");</script>')->markdown([
        'html_input' => 'strip',
        'allow_unsafe_links' => false,
    ]);

    // <p>Inject: alert(&quot;Hello XSS!&quot;);</p>
```

<a name="method-fluent-str-mask"></a>
#### `mascarar` {.método da coleção}

 O método `mask` utiliza um caractere repetido para mascarar uma porção da cadeia de caracteres e pode ser usado para ocultar fragmentos das string, como endereços de e-mail e números de telefone:

```php
    use Illuminate\Support\Str;

    $string = Str::of('taylor@example.com')->mask('*', 3);

    // tay***************
```

 Se necessário, você pode fornecer números negativos como o terceiro ou quarto argumento ao método `mascarar`, que instruirá o método a começar com a máscara à distância dada do fim da string.

```php
    $string = Str::of('taylor@example.com')->mask('*', -15, 3);

    // tay***@example.com

    $string = Str::of('taylor@example.com')->mask('*', 4, -4);

    // tayl**********.com
```

<a name="method-fluent-str-match"></a>
#### `match` {.metodo de coleção}

 O método `match` retornará o troço de uma string que corresponda ao padrão dado numa expressão regular:

```php
    use Illuminate\Support\Str;

    $result = Str::of('foo bar')->match('/bar/');

    // 'bar'

    $result = Str::of('foo bar')->match('/foo (.*)/');

    // 'bar'
```

<a name="method-fluent-str-match-all"></a>
#### `matchAll` {.collection-method}

 O método `matchAll` retorna uma coleção que contém as porções de uma string que correspondem a um padrão de expressão regular especificado:

```php
    use Illuminate\Support\Str;

    $result = Str::of('bar foo bar')->matchAll('/bar/');

    // collect(['bar', 'bar'])
```

 Se você especificar um grupo correspondente dentro da expressão, o Laravel retornará uma coleção dos primeiros matchs do primeiro grupo correspondente:

```php
    use Illuminate\Support\Str;

    $result = Str::of('bar fun bar fly')->matchAll('/f(\w*)/');

    // collect(['un', 'ly']);
```

 Se não forem encontradas correspondências, será devolvido um conjunto vazio.

<a name="method-fluent-str-is-match"></a>
#### `isMatch`{.collection-method}

 O método `isMatch` retorna `true` se a string corresponda a um determinado padrão de expressão regular:

```php
    use Illuminate\Support\Str;

    $result = Str::of('foo bar')->isMatch('/foo (.*)/');

    // true

    $result = Str::of('laravel')->isMatch('/foo (.*)/');

    // false
```

<a name="method-fluent-str-new-line"></a>
#### `linha nova` {método de coleção}

 O método `newLine` adiciona um caractere de "fim da linha" ao final de uma string.

```php
    use Illuminate\Support\Str;

    $padded = Str::of('Laravel')->newLine()->append('Framework');

    // 'Laravel
    //  Framework'
```

<a name="method-fluent-str-padboth"></a>
#### `padBoth` {.collection-method}

 O método `padBoth` envolve a função PHP `str_pad`, que alinha os lados de uma string com outra até que o resultado final atinja um comprimento desejado.

```php
    use Illuminate\Support\Str;

    $padded = Str::of('James')->padBoth(10, '_');

    // '__James___'

    $padded = Str::of('James')->padBoth(10);

    // '  James   '
```

<a name="method-fluent-str-padleft"></a>
#### `padLeft` {.collection-method}

 O método `padLeft` é um wrapper para o PHP `str_pad`, usado para empurrar conteúdo na parte esquerda de uma string até que este alcance o comprimento desejado:

```php
    use Illuminate\Support\Str;

    $padded = Str::of('James')->padLeft(10, '-=');

    // '-=-=-James'

    $padded = Str::of('James')->padLeft(10);

    // '     James'
```

<a name="method-fluent-str-padright"></a>
#### `padRight` {.collection-method}

 O método `padRight` envolve a função PHP `str_pad`, embalando o lado direito de uma string com outra string até que a string final atinja o comprimento desejado.

```php
    use Illuminate\Support\Str;

    $padded = Str::of('James')->padRight(10, '-');

    // 'James-----'

    $padded = Str::of('James')->padRight(10);

    // 'James     '
```

<a name="method-fluent-str-pipe"></a>
#### `pipe` {.collection-method}

 O método pipe permite-lhe transformar a string através da passagem do seu valor atual para o comando chamável especificado.

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $hash = Str::of('Laravel')->pipe('md5')->prepend('Checksum: ');

    // 'Checksum: a5c95b86291ea299fcbe64458ed12702'

    $closure = Str::of('foo')->pipe(function (Stringable $str) {
        return 'bar';
    });

    // 'bar'
```

<a name="method-fluent-str-plural"></a>
#### `plural` {.collection-method}

 O método `plural` converte uma palavra singulada para sua forma plural. Essa função suporta [qualquer uma das linguagens suportadas pelo sistema de pluralização do Laravel](/docs/localization#pluralization-language):

```php
    use Illuminate\Support\Str;

    $plural = Str::of('car')->plural();

    // cars

    $plural = Str::of('child')->plural();

    // children
```

 Você pode fornecer um inteiro como segundo parâmetro da função para recuperar a forma singulare ou plural da string:

```php
    use Illuminate\Support\Str;

    $plural = Str::of('child')->plural(2);

    // children

    $plural = Str::of('child')->plural(1);

    // child
```

<a name="method-fluent-str-position"></a>
#### `position` {.collection-method}

 O método `position` retorna a posição da primeira ocorrência de uma sub-string em uma string. Se a sub-string não existir na string, `false` é retornado:

```php
    use Illuminate\Support\Str;

    $position = Str::of('Hello, World!')->position('Hello');

    // 0

    $position = Str::of('Hello, World!')->position('W');

    // 7
```

<a name="method-fluent-str-prepend"></a>
#### "prepend"{.collection-method}

 O método `prepend` adiciona os valores dados no início da cadeia de caracteres:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Framework')->prepend('Laravel ');

    // Laravel Framework
```

<a name="method-fluent-str-remove"></a>
#### remove {.collection-method}

 O método `remove` remove o valor ou um array de valores da string:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Arkansas is quite beautiful!')->remove('quite');

    // Arkansas is beautiful!
```

 Também é possível usar o valor `false` como segundo parâmetro para ignorar o caso na remoção das string.

<a name="method-fluent-str-repeat"></a>
#### `repetir` {.método de coleção}

 O método `repeat` repete a string passada como parâmetro:

```php
use Illuminate\Support\Str;

$repeated = Str::of('a')->repeat(5);

// aaaaa
```

<a name="method-fluent-str-replace"></a>
#### ``replace`` {método da coleção}

 O método replace substitui uma string especificada dentro da string:

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('Laravel 6.x')->replace('6.x', '7.x');

    // Laravel 7.x
```

 O método `replace` também aceita um argumento `caseSensitive`. Por padrão, o método `replace` é sensível à minúsculas e maiúsculas.

```php
    $replaced = Str::of('macOS 13.x')->replace(
        'macOS', 'iOS', caseSensitive: false
    );
```

<a name="method-fluent-str-replace-array"></a>
#### `replaceArray`{.collection-method}

 O método `replaceArray` substitui um valor especificado na sequência da string utilizando uma matriz.

```php
    use Illuminate\Support\Str;

    $string = 'The event will take place between ? and ?';

    $replaced = Str::of($string)->replaceArray('?', ['8:30', '9:00']);

    // The event will take place between 8:30 and 9:00
```

<a name="method-fluent-str-replace-first"></a>
#### `substituirPorPrimeiro` {.metodo-de-colecao}

 O método `replaceFirst` substitui a primeira ocorrência de um determinado valor numa string:

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceFirst('the', 'a');

    // a quick brown fox jumps over the lazy dog
```

<a name="method-fluent-str-replace-last"></a>
#### `substituirÚltimo` {.methododecoleção}

 O método `replaceLast` substitui a última ocorrência de um determinado valor em uma cadeia de caracteres:

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceLast('the', 'a');

    // the quick brown fox jumps over a lazy dog
```

<a name="method-fluent-str-replace-matches"></a>
#### replaceMatches {.collection-method}

 O método replaceMatches substitui todas as partes de uma string que correspondam a um padrão com a cadeia de caracteres de substituição indicada:

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('(+1) 501-555-1000')->replaceMatches('/[^A-Za-z0-9]++/', '')

    // '15015551000'
```

 O método replaceMatches também aceita um fechamento que é invocado com cada parte da string correspondente ao padrão fornecido, permitindo a execução da lógica de substituição dentro do fechamento e o retorno do valor substituído:

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('123')->replaceMatches('/\d/', function (array $matches) {
        return '['.$matches[0].']';
    });

    // '[1][2][3]'
```

<a name="method-fluent-str-replace-start"></a>
#### `replaceStart` {.collection-method}

 O método `replaceStart` substitui o primeiro valor dado apenas se este aparecer no início da cadeia:

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('Hello World')->replaceStart('Hello', 'Laravel');

    // Laravel World

    $replaced = Str::of('Hello World')->replaceStart('World', 'Laravel');

    // Hello World
```

<a name="method-fluent-str-replace-end"></a>
#### `replaceEnd` {.collection-method}

 O método `replaceEnd` substitui a última ocorrência do valor fornecido, somente se o valor aparecer no final da cadeia de caracteres.

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('Hello World')->replaceEnd('World', 'Laravel');

    // Hello Laravel

    $replaced = Str::of('Hello World')->replaceEnd('Hello', 'Laravel');

    // Hello World
```

<a name="method-fluent-str-scan"></a>
#### `scan` {.collection-method}

 O método `scan` analisa o conteúdo de uma string numa coleção, com base em um formato suportado pela função [`sscanf` da PHP](https://www.php.net/manual/en/function.sscanf.php):

```php
    use Illuminate\Support\Str;

    $collection = Str::of('filename.jpg')->scan('%[^.].%s');

    // collect(['filename', 'jpg'])
```

<a name="method-fluent-str-singular"></a>
#### `singular` {.collection-método}

 O método singular converte uma string para sua forma singular. Esta função suporta qualquer um dos idiomas suportados pelo pluralizador de Laravel:

```php
    use Illuminate\Support\Str;

    $singular = Str::of('cars')->singular();

    // car

    $singular = Str::of('children')->singular();

    // child
```

<a name="method-fluent-str-slug"></a>
#### `slug` {.collection-method}

```php
The `slug` method generates a URL friendly "slug" from the given string:

    use Illuminate\Support\Str;

    $slug = Str::of('Laravel Framework')->slug('-');

    // laravel-framework
```

<a name="method-fluent-str-snake"></a>
#### ``snake`` {.collection-method}

 O método `snake` converte a string dada para o formato "case_sensitive":

```php
    use Illuminate\Support\Str;

    $converted = Str::of('fooBar')->snake();

    // foo_bar
```

<a name="method-fluent-str-split"></a>
#### `split` {.method da coleção}

 O método `split` divide uma string em vários elementos, utilizando um padrão regex:

```php
    use Illuminate\Support\Str;

    $segments = Str::of('one, two, three')->split('/[\s,]+/');

    // collect(["one", "two", "three"])
```

<a name="method-fluent-str-squish"></a>
#### `squish` {.collection-method}

 O método `squish` remove todo o espaço em branco estranho de uma string, incluindo o espaço em branco estranho entre as palavras:

```php
    use Illuminate\Support\Str;

    $string = Str::of('    laravel    framework    ')->squish();

    // laravel framework
```

<a name="method-fluent-str-start"></a>
#### `iniciar` {.metodo de recolha}

 O método `start` adiciona uma única instância do valor passado ao final de uma cadeia de caracteres se o mesmo ainda não começar por esse valor:

```php
    use Illuminate\Support\Str;

    $adjusted = Str::of('this/string')->start('/');

    // /this/string

    $adjusted = Str::of('/this/string')->start('/');

    // /this/string
```

<a name="method-fluent-str-starts-with"></a>
#### `startsWith` {.collection-method}

 O método `startsWith` determina se a string fornecida começa com o valor especificado:

```php
    use Illuminate\Support\Str;

    $result = Str::of('This is my name')->startsWith('This');

    // true
```

<a name="method-fluent-str-strip-tags"></a>
#### `stripTags` {.collection-method}

 O método stripTags remove todos os marcadores HTML e PHP de uma string:

```php
    use Illuminate\Support\Str;

    $result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags();

    // Taylor Otwell

    $result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags('<b>');

    // Taylor <b>Otwell</b>
```

<a name="method-fluent-str-studly"></a>
#### `studly` {.collection-method}

 O método `studly` converte a string em um `StudlyCase`:

```php
    use Illuminate\Support\Str;

    $converted = Str::of('foo_bar')->studly();

    // FooBar
```

<a name="method-fluent-str-substr"></a>
#### `substr` {.metodo de coleção}

 O método `substr` retorna a porção da string especificada pelos parâmetros de início e tamanho fornecidos:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Laravel Framework')->substr(8);

    // Framework

    $string = Str::of('Laravel Framework')->substr(8, 5);

    // Frame
```

<a name="method-fluent-str-substrreplace"></a>
#### `substrReplace` {.collection-method}

 O método `substrReplace` substitui texto em uma parte de uma string, a partir da posição especificada pelo segundo argumento e substituindo o número de caracteres especificado pelo terceiro argumento. A passagem de `0` para o terceiro argumento do método inserirá na posição especificada a string sem substituir nenhum dos caracteres existentes na string:

```php
    use Illuminate\Support\Str;

    $string = Str::of('1300')->substrReplace(':', 2);

    // 13:

    $string = Str::of('The Framework')->substrReplace(' Laravel', 3, 0);

    // The Laravel Framework
```

<a name="method-fluent-str-swap"></a>
#### `trocar` {.collection-method}

 O método `swap` substitui múltiplos valores na string utilizando a função `strtr` do PHP:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Tacos are great!')
        ->swap([
            'Tacos' => 'Burritos',
            'great' => 'fantastic',
        ]);

    // Burritos are fantastic!
```

<a name="method-fluent-str-take"></a>
#### `pegar` {.collection-method}

 O método `take` retorna um número especificado de caracteres do início da cadeia:

```php
    use Illuminate\Support\Str;

    $taken = Str::of('Build something amazing!')->take(5);

    // Build
```

<a name="method-fluent-str-tap"></a>
#### `tap` {.collection-method}

 O método `tap` passa a string para o bloco de construção indicado, permitindo que você analise e interaja com a string sem afetar a própria string. A string original é retornada pelo método `tap`, independentemente do que for retornado pelo bloco de construção:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('Laravel')
        ->append(' Framework')
        ->tap(function (Stringable $string) {
            dump('String after append: '.$string);
        })
        ->upper();

    // LARAVEL FRAMEWORK
```

<a name="method-fluent-str-test"></a>
#### "teste" {. collection-method}

 O método `test` determina se uma string corresponde ao padrão de expressão regular indicado:

```php
    use Illuminate\Support\Str;

    $result = Str::of('Laravel Framework')->test('/Laravel/');

    // true
```

<a name="method-fluent-str-title"></a>
#### "título" {.collection-method}

 O método `title` converte a frase dada para "Mais Nome do Autor" (Title Case):

```php
    use Illuminate\Support\Str;

    $converted = Str::of('a nice title uses the correct case')->title();

    // A Nice Title Uses The Correct Case
```

<a name="method-fluent-str-to-base64"></a>
#### `toBase64()` {.collection-method}

 O método `toBase64` converte a cadeia de caracteres dada para Base64:

```php
    use Illuminate\Support\Str;

    $base64 = Str::of('Laravel')->toBase64();

    // TGFyYXZlbA==
```

<a name="method-fluent-str-trim"></a>
#### `trim` {.collection-method}

 O método `trim` limpa a string especificada. Diferente da função nativa do PHP para `trim`, o método `trim` do Laravel também remove espaços em branco unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::of('  Laravel  ')->trim();

    // 'Laravel'

    $string = Str::of('/Laravel/')->trim('/');

    // 'Laravel'
```

<a name="method-fluent-str-ltrim"></a>
#### `ltrim` {.collection-method}

 O método `ltrim` remove o lado esquerdo da string. Diferente do que acontece com a função nativa de PHP, o `ltrim` de Laravel remove também os caracteres espaços reservados unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::of('  Laravel  ')->ltrim();

    // 'Laravel  '

    $string = Str::of('/Laravel/')->ltrim('/');

    // 'Laravel/'
```

<a name="method-fluent-str-rtrim"></a>
#### `rtrim` {.collection-method}

 O método `rtrim` remove o caractere de espaço em branco da direita do texto dado. Ao contrário da função nativa PHP, o método `rtrim` também remove caracteres em espaços unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::of('  Laravel  ')->rtrim();

    // '  Laravel'

    $string = Str::of('/Laravel/')->rtrim('/');

    // '/Laravel'
```

<a name="method-fluent-str-ucfirst"></a>
#### `ucfirst` {.collection-method}

 O método `ucfirst` retorna uma cópia da string dada com o primeiro caractere maiusculizado:

```php
    use Illuminate\Support\Str;

    $string = Str::of('foo bar')->ucfirst();

    // Foo bar
```
<a name="method-fluent-str-ucsplit"></a>
#### `ucsplit` {.collection-method}

 O método `ucsplit` divide a string especificada em uma coleção por caracteres maiúsculos:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Foo Bar')->ucsplit();

    // collect(['Foo', 'Bar'])
```

<a name="method-fluent-str-unwrap"></a>
#### `desembalar` {.collection-method}

 O método `unwrap` remove as frases especificadas do começo e do final de uma determinada frase:

```php
    use Illuminate\Support\Str;

    Str::of('-Laravel-')->unwrap('-');

    // Laravel

    Str::of('{framework: "Laravel"}')->unwrap('{', '}');

    // framework: "Laravel"
```

<a name="method-fluent-str-upper"></a>
#### `teto` {.método de coleção}

 O método `upper` converte a string indicada para letras maiúsculas:

```php
    use Illuminate\Support\Str;

    $adjusted = Str::of('laravel')->upper();

    // LARAVEL
```

<a name="method-fluent-str-when"></a>
#### `quando` {.collection-method}

 O método `when` chama o bloco fornecido se uma determinada condição estiver verdadeira. Esse bloco recebe a instância da cadeia fluente:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('Taylor')
                    ->when(true, function (Stringable $string) {
                        return $string->append(' Otwell');
                    });

    // 'Taylor Otwell'
```

 Se necessário, você pode passar outro fechamento como o terceiro parâmetro do método `quando`. Esse fechamento será executado se o parâmetro condição avaliar como `falso`

<a name="method-fluent-str-when-contains"></a>
#### ``quandoContém'' {. método da coleção}

 O método `whenContains` chama o fecho especificado se a string contiver o valor especificado. O fecho recebe uma instância da string em curso como parâmetro:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('tony stark')
                ->whenContains('tony', function (Stringable $string) {
                    return $string->title();
                });

    // 'Tony Stark'
```

 Se necessário, é possível enviar outra expressão de closura como terceiro parâmetro para a função `when`. Essa expressão será executada se o valor da string não estiver presente nessa mesma string.

 Você também pode passar um array de valores para determinar se a string fornecida contém qualquer valor no array:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('tony stark')
                ->whenContains(['tony', 'hulk'], function (Stringable $string) {
                    return $string->title();
                });

    // Tony Stark
```

<a name="method-fluent-str-when-contains-all"></a>
#### `quandoContémTodos` {.collection-method}

 O método `whenContainsAll` chama a closura fornecida se a string conter todas as strings dadas. A closura irá receber a instância de string fluente:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('tony stark')
                    ->whenContainsAll(['tony', 'stark'], function (Stringable $string) {
                        return $string->title();
                    });

    // 'Tony Stark'
```

 Se necessário, você pode passar outra função como terceiro parâmetro para o método `when`. Essa função será executada se o valor da variável `condition` avaliar como `falso`.

<a name="method-fluent-str-when-empty"></a>
#### whenEmpty {.collection-method}

 O método `whenEmpty` chama o fechamento especificado se a string estiver vazia. Se o fechamento retornar um valor, esse valor será também retornado pelo método `whenEmpty`. Se o fechamento não retornar um valor, será retornada uma instância de cadeia de texto fluent:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('  ')->whenEmpty(function (Stringable $string) {
        return $string->trim()->prepend('Laravel');
    });

    // 'Laravel'
```

<a name="method-fluent-str-when-not-empty"></a>
#### `quandoNotEmpty` {.collection-method}

 O método `whenNotEmpty` chama o fecho indicado se a cadeia de caracteres não estiver vazia. Se o fecho retornar um valor, esse valor também será retornado pelo método `whenNotEmpty`. Se o fecho não retornar um valor, será retornada uma instância da cadeia de caracteres fluente:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('Framework')->whenNotEmpty(function (Stringable $string) {
        return $string->prepend('Laravel ');
    });

    // 'Laravel Framework'
```

<a name="method-fluent-str-when-starts-with"></a>
#### `whenStartsWith` {.collection-method}

 O método `whenStartsWith` chama o fechamento fornecido se a string começar com a substring fornecida. O fechamento recebe a instância de string fluente:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('disney world')->whenStartsWith('disney', function (Stringable $string) {
        return $string->title();
    });

    // 'Disney World'
```

<a name="method-fluent-str-when-ends-with"></a>
#### `quandoTerminaCom`, {.collection-method}

 O método `whenEndsWith` chama o bloco de código fornecido se a string terminar com a sub-string especificada. O bloco receberá como argumento uma instância da classe FluentString:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('disney world')->whenEndsWith('world', function (Stringable $string) {
        return $string->title();
    });

    // 'Disney World'
```

<a name="method-fluent-str-when-exactly"></a>
#### `quandoExatamente` {.collection-method}

 O método `whenExactly` chama o fecho fornecido se a string coincidir exatamente com a string dada. O fecho recebe a instância de string fluente:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('laravel')->whenExactly('laravel', function (Stringable $string) {
        return $string->title();
    });

    // 'Laravel'
```

<a name="method-fluent-str-when-not-exactly"></a>
#### `quandoNãoExatamente` {.collection-method}

 O método `whenNotExactly` é chamado ao se deparar com uma string que não coincide exatamente com a string fornecida, sendo o fechamento recebido como parâmetro:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('framework')->whenNotExactly('laravel', function (Stringable $string) {
        return $string->title();
    });

    // 'Framework'
```

<a name="method-fluent-str-when-is"></a>
#### `whenIs` {.collection-method}

 O método whenIs chama o fechamento especificado se a string corresponder ao padrão indicado. Os asteriscos podem ser usados como valores de marcador. O fechamento receberá uma instância da string fluente:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('foo/bar')->whenIs('foo/*', function (Stringable $string) {
        return $string->append('/baz');
    });

    // 'foo/bar/baz'
```

<a name="method-fluent-str-when-is-ascii"></a>
#### `whenIsAscii` {.collection-method}

 O método `whenIsAscii` executa o fechamento indicado se a string for ASCII de 7 bits. O fechamento recebe uma instância da string fluente:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('laravel')->whenIsAscii(function (Stringable $string) {
        return $string->title();
    });

    // 'Laravel'
```

<a name="method-fluent-str-when-is-ulid"></a>
#### `whenIsUlid` {.collection-method}

 O método `whenIsUlid` chama o fecho indicado se a string for um ULID válido. O fecho receberá a instância de string fluente:

```php
    use Illuminate\Support\Str;

    $string = Str::of('01gd6r360bp37zj17nxb55yv40')->whenIsUlid(function (Stringable $string) {
        return $string->substr(0, 8);
    });

    // '01gd6r36'
```

<a name="method-fluent-str-when-is-uuid"></a>
#### `whenIsUuid` {.collection-method}

 O método `whenIsUuid` chama o encerramento indicado se a string for um UUID válido. O encerramento recebe a instância de string fluente:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->whenIsUuid(function (Stringable $string) {
        return $string->substr(0, 8);
    });

    // 'a0a2a2d2'
```

<a name="method-fluent-str-when-test"></a>
#### `quandoTest` {.collection-method}

 O método `whenTest` chama o bloco fechado especificado se a cadeia for igual à expressão regular especificada. O bloco recebe uma instância da classe de strings fluent:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('laravel framework')->whenTest('/laravel/', function (Stringable $string) {
        return $string->title();
    });

    // 'Laravel Framework'
```

<a name="method-fluent-str-word-count"></a>
#### ``wordCount`` {.collection-method}

 O método `wordCount` retorna o número de palavras que uma string contém:

```php
use Illuminate\Support\Str;

Str::of('Hello, world!')->wordCount(); // 2
```

<a name="method-fluent-str-words"></a>
#### `palavras` {.collection-method}

 O método `words` limita o número de palavras em uma string. Se necessário, você pode especificar uma string adicional que será anexada à string trunca:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Perfectly balanced, as all things should be.')->words(3, ' >>>');

    // Perfectly balanced, as >>>
```
