# Strings

<a name="introduction"></a>
## Introdução

O Laravel inclui uma variedade de funções para manipular valores de string. Muitas destas funções são usadas pelo próprio framework; no entanto, você tem liberdade para utilizá-las em suas aplicações caso ache isso conveniente.

<a name="available-methods"></a>
## Métodos disponíveis

<a name="strings-method-list"></a>
### Strings

- [\__](#method-__)
- [class_basename](#method-class-basename)
- [e](#method-e)
- [preg_replace_array](#method-preg-replace-array)
- [Str::after](#method-str-after)
- [Str::afterLast](#method-str-after-last)
- [Str::apa](#method-str-apa)
- [Str::ascii](#method-str-ascii)
- [Str::before](#method-str-before)
- [Str::beforeLast](#method-str-before-last)
- [Str::between](#method-str-between)
- [Str::betweenFirst](#method-str-between-first)
- [Str::camel](#method-camel-case)
- [Str::charAt](#method-char-at)
- [Str::contains](#method-str-contains)
- [Str::containsAll](#method-str-contains-all)
- [Str::endsWith](#method-ends-with)
- [Str::excerpt](#method-excerpt)
- [Str::finish](#method-str-finish)
- [Str::headline](#method-str-headline)
- [Str::inlineMarkdown](#method-str-inline-markdown)
- [Str::is](#method-str-is)
- [Str::isAscii](#method-str-is-ascii)
- [Str::isJson](#method-str-is-json)
- [Str::isUlid](#method-str-is-ulid)
- [Str::isUrl](#method-str-is-url)
- [Str::isUuid](#method-str-is-uuid)
- [Str::kebab](#method-kebab-case)
- [Str::lcfirst](#method-str-lcfirst)
- [Str::length](#method-str-length)
- [Str::limit](#method-str-limit)
- [Str::lower](#method-str-lower)
- [Str::markdown](#method-str-markdown)
- [Str::mask](#method-str-mask)
- [Str::orderedUuid](#method-str-ordered-uuid)
- [Str::padBoth](#method-str-padboth)
- [Str::padLeft](#method-str-padleft)
- [Str::padRight](#method-str-padright)
- [Str::password](#method-str-password)
- [Str::plural](#method-str-plural)
- [Str::pluralStudly](#method-str-plural-studly)
- [Str::position](#method-str-position)
- [Str::random](#method-str-random)
- [Str::remove](#method-str-remove)
- [Str::repeat](#method-str-repeat)
- [Str::replace](#method-str-replace)
- [Str::replaceArray](#method-str-replace-array)
- [Str::replaceFirst](#method-str-replace-first)
- [Str::replaceLast](#method-str-replace-last)
- [Str::replaceMatches](#method-str-replace-matches)
- [Str::replaceStart](#method-str-replace-start)
- [Str::replaceEnd](#method-str-replace-end)
- [Str::reverse](#method-str-reverse)
- [Str::singular](#method-str-singular)
- [Str::slug](#method-str-slug)
- [Str::snake](#method-snake-case)
- [Str::squish](#method-str-squish)
- [Str::start](#method-str-start)
- [Str::startsWith](#method-starts-with)
- [Str::studly](#method-studly-case)
- [Str::substr](#method-str-substr)
- [Str::substrCount](#method-str-substrcount)
- [Str::substrReplace](#method-str-substrreplace)
- [Str::swap](#method-str-swap)
- [Str::take](#method-take)
- [Str::title](#method-title-case)
- [Str::toBase64](#method-str-to-base64)
- [Str::toHtmlString](#method-str-to-html-string)
- [Str::trim](#method-str-trim)
- [Str::ltrim](#method-str-ltrim)
- [Str::rtrim](#method-str-rtrim)
- [Str::ucfirst](#method-str-ucfirst)
- [Str::ucsplit](#method-str-ucsplit)
- [Str::upper](#method-str-upper)
- [Str::ulid](#method-str-ulid)
- [Str::unwrap](#method-str-unwrap)
- [Str::uuid](#method-str-uuid)
- [Str::wordCount](#method-str-word-count)
- [Str::wordWrap](#method-str-word-wrap)
- [Str::words](#method-str-words)
- [Str::wrap](#method-str-wrap)
- [str](#method-str)
- [trans](#method-trans)
- [trans_choice](#method-trans-choice)

<a name="fluent-strings-method-list"></a>
### Strings Fluentes

- [after](#method-fluent-str-after)
- [afterLast](#method-fluent-str-after-last)
- [apa](#method-fluent-str-apa)
- [append](#method-fluent-str-append)
- [ascii](#method-fluent-str-ascii)
- [basename](#method-fluent-str-basename)
- [before](#method-fluent-str-before)
- [beforeLast](#method-fluent-str-before-last)
- [between](#method-fluent-str-between)
- [betweenFirst](#method-fluent-str-between-first)
- [camel](#method-fluent-str-camel)
- [charAt](#method-fluent-str-char-at)
- [classBasename](#method-fluent-str-class-basename)
- [contains](#method-fluent-str-contains)
- [containsAll](#method-fluent-str-contains-all)
- [dirname](#method-fluent-str-dirname)
- [endsWith](#method-fluent-str-ends-with)
- [excerpt](#method-fluent-str-excerpt)
- [exactly](#method-fluent-str-exactly)
- [explode](#method-fluent-str-explode)
- [finish](#method-fluent-str-finish)
- [headline](#method-fluent-str-headline)
- [inlineMarkdown](#method-fluent-str-inline-markdown)
- [is](#method-fluent-str-is)
- [isAscii](#method-fluent-str-is-ascii)
- [isEmpty](#method-fluent-str-is-empty)
- [isNotEmpty](#method-fluent-str-is-not-empty)
- [isJson](#method-fluent-str-is-json)
- [isUlid](#method-fluent-str-is-ulid)
- [isUrl](#method-fluent-str-is-url)
- [isUuid](#method-fluent-str-is-uuid)
- [kebab](#method-fluent-str-kebab)
- [lcfirst](#method-fluent-str-lcfirst)
- [length](#method-fluent-str-length)
- [limit](#method-fluent-str-limit)
- [lower](#method-fluent-str-lower)
- [markdown](#method-fluent-str-markdown)
- [mask](#method-fluent-str-mask)
- [match](#method-fluent-str-match)
- [matchAll](#method-fluent-str-match-all)
- [isMatch](#method-fluent-str-is-match)
- [newLine](#method-fluent-str-new-line)
- [padBoth](#method-fluent-str-padboth)
- [padLeft](#method-fluent-str-padleft)
- [padRight](#method-fluent-str-padright)
- [pipe](#method-fluent-str-pipe)
- [plural](#method-fluent-str-plural)
- [position](#method-fluent-str-position)
- [prepend](#method-fluent-str-prepend)
- [remove](#method-fluent-str-remove)
- [repeat](#method-fluent-str-repeat)
- [replace](#method-fluent-str-replace)
- [replaceArray](#method-fluent-str-replace-array)
- [replaceFirst](#method-fluent-str-replace-first)
- [replaceLast](#method-fluent-str-replace-last)
- [replaceMatches](#method-fluent-str-replace-matches)
- [replaceStart](#method-fluent-str-replace-start)
- [replaceEnd](#method-fluent-str-replace-end)
- [scan](#method-fluent-str-scan)
- [singular](#method-fluent-str-singular)
- [slug](#method-fluent-str-slug)
- [snake](#method-fluent-str-snake)
- [split](#method-fluent-str-split)
- [squish](#method-fluent-str-squish)
- [start](#method-fluent-str-start)
- [startsWith](#method-fluent-str-starts-with)
- [stripTags](#method-fluent-str-strip-tags)
- [studly](#method-fluent-str-studly)
- [substr](#method-fluent-str-substr)
- [substrReplace](#method-fluent-str-substrreplace)
- [swap](#method-fluent-str-swap)
- [take](#method-fluent-str-take)
- [tap](#method-fluent-str-tap)
- [test](#method-fluent-str-test)
- [title](#method-fluent-str-title)
- [toBase64](#method-fluent-str-to-base64)
- [trim](#method-fluent-str-trim)
- [ltrim](#method-fluent-str-ltrim)
- [rtrim](#method-fluent-str-rtrim)
- [ucfirst](#method-fluent-str-ucfirst)
- [ucsplit](#method-fluent-str-ucsplit)
- [unwrap](#method-fluent-str-unwrap)
- [upper](#method-fluent-str-upper)
- [when](#method-fluent-str-when)
- [whenContains](#method-fluent-str-when-contains)
- [whenContainsAll](#method-fluent-str-when-contains-all)
- [whenEmpty](#method-fluent-str-when-empty)
- [whenNotEmpty](#method-fluent-str-when-not-empty)
- [whenStartsWith](#method-fluent-str-when-starts-with)
- [whenEndsWith](#method-fluent-str-when-ends-with)
- [whenExactly](#method-fluent-str-when-exactly)
- [whenNotExactly](#method-fluent-str-when-not-exactly)
- [whenIs](#method-fluent-str-when-is)
- [whenIsAscii](#method-fluent-str-when-is-ascii)
- [whenIsUlid](#method-fluent-str-when-is-ulid)
- [whenIsUuid](#method-fluent-str-when-is-uuid)
- [whenTest](#method-fluent-str-when-test)
- [wordCount](#method-fluent-str-word-count)
- [words](#method-fluent-str-words)

<a name="strings"></a>
## Strings

<a name="method-__"></a>
#### `__()`

A função `__` traduz a frase ou chave de tradução fornecida, utilizando os seus arquivos de [idiomas](/docs/localization):

```php
    echo __('Welcome to our application');

    echo __('messages.welcome');
```

Se a chave de tradução ou a string especificada não existirem, a função `__` retornará o valor fornecido. Assim, usando o exemplo acima, a função `__` retornaria `messages.welcome` se essa chave de tradução não existir.

<a name="method-class-basename"></a>
#### `class_basename()`

A função `class_basename` retorna o nome da classe com o namespace da mesma removido:

```php
    $class = class_basename('Foo\Bar\Baz');

    // Baz
```

<a name="method-e"></a>
#### `e()`

A função `e` executa a função `htmlspecialchars` do PHP com a opção `double_encode`, definida como `true` por padrão:

```php
    echo e('<html>foo</html>');

    // &lt;html&gt;foo&lt;/html&gt;
```

<a name="method-preg-replace-array"></a>
#### `preg_replace_array()`

A função `preg_replace_array` substitui o padrão dado na string seqüencialmente usando um array:

```php
    $string = 'The event will take place between :start and :end';

    $replaced = preg_replace_array('/:[a-z_]+/', ['8:30', '9:00'], $string);

    // O evento acontecerá entre 8h30 e 9h00
```

<a name="method-str-after"></a>
#### `Str::after()`

O método `Str::after` retorna tudo o que está depois do valor especificado numa string. A string inteira será retornada se não existir o valor:

```php
    use Illuminate\Support\Str;

    $slice = Str::after('This is my name', 'This is');

    // ' my name'
```

<a name="method-str-after-last"></a>
#### `Str::afterLast()`

O método `Str::afterLast` retorna tudo após o último caractere que aparece na string. Se o valor não existir, a string inteira será retornada:

```php
    use Illuminate\Support\Str;

    $slice = Str::afterLast('App\Http\Controllers\Controller', '\\');

    // 'Controller'
```

<a name="method-str-apa"></a>
#### `Str::apa()`

O método `Str::apa` converte a string dada para maiúsculas, de acordo com as regras [do APA](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case):

```php
    use Illuminate\Support\Str;

    $title = Str::apa('Creating A Project');

    // 'Creating a Project'
```

<a name="method-str-ascii"></a>
#### `Str::ascii()`

O método `Str::ascii` tentará traduzir a string em um valor ASCII:

```php
    use Illuminate\Support\Str;

    $slice = Str::ascii('û');

    // 'u'
```

<a name="method-str-before"></a>
#### Str::before()

O método `Str::before` retorna tudo que está antes do valor especificado numa string:

```php
    use Illuminate\Support\Str;

    $slice = Str::before('This is my name', 'my name');

    // 'This is '
```

<a name="method-str-before-last"></a>
#### `Str::beforeLast()`

O método `Str::beforeLast` retorna tudo o que aparece antes da última ocorrência do valor indicado numa string.

```php
    use Illuminate\Support\Str;

    $slice = Str::beforeLast('This is my name', 'is');

    // 'This '
```

<a name="method-str-between"></a>
#### `Str::between()`

O método `Str::between` retorna o trecho de uma string entre dois valores:

```php
    use Illuminate\Support\Str;

    $slice = Str::between('This is my name', 'This', 'name');

    // ' is my '
```

<a name="method-str-between-first"></a>
#### `Str::betweenFirst()`

O método `Str::betweenFirst` retorna a menor parte possível de uma string entre dois valores:

```php
    use Illuminate\Support\Str;

    $slice = Str::betweenFirst('[a] bc [d]', '[', ']');

    // 'a'
```

<a name="method-camel-case"></a>
#### `Str::camel()`

O método `Str::camel` converte a string fornecida para `camelCase`:

```php
    use Illuminate\Support\Str;

    $converted = Str::camel('foo_bar');

    // 'fooBar'
```

<a name="method-char-at"></a>

#### `Str::charAt()`

O método `Str::charAt` retorna o caractere na posição especificada. Se a posição for inválida, é retornado `false`:

```php
    use Illuminate\Support\Str;

    $character = Str::charAt('This is my name.', 6);

    // 's'
```

<a name="method-str-contains"></a>
#### `Str::contains()`

O método `Str::contains` determina se a string fornecida contém o valor fornecido. Esse método é sensível às maiúsculas e minúsculas (case-sensitive):

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
#### `Str::containsAll()`

O método `Str::containsAll` verifica se a string fornecida contém todos os valores num determinado array:

```php
    use Illuminate\Support\Str;

    $containsAll = Str::containsAll('This is my name', ['my', 'name']);

    // true
```

<a name="method-ends-with"></a>
#### `Str::endsWith()`

O método `Str::endsWith` determina se a string em questão termina com o valor passado como argumento:

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
#### `Str::excerpt()`

O método `Str::excerpt` extrai um trecho de uma determinada string que corresponde à primeira ocorrência de uma frase nessa string:

```php
    use Illuminate\Support\Str;

    $excerpt = Str::excerpt('This is my name', 'my', [
        'radius' => 3
    ]);

    // '...is my na...'
```

A opção `radius`, com o padrão `100`, permite definir o número de caracteres que devem aparecer em cada lado da string truncada.

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
#### `Str::finish()`

O método `Str::finish` adiciona uma única instância do valor dado a uma string se este já não terminar com esse valor:

```php
    use Illuminate\Support\Str;

    $adjusted = Str::finish('this/string', '/');

    // this/string/

    $adjusted = Str::finish('this/string/', '/');

    // this/string/
```

<a name="method-str-headline"></a>
#### ``Str::headline()``

O método `Str::headline` converte strings delimitadas por maiúsculas, hifens ou traços de assinatura em uma string com espaçamento entre palavras e a primeira letra de cada palavra em maiúscula:

```php
    use Illuminate\Support\Str;

    $headline = Str::headline('steve_jobs');

    // Steve Jobs

    $headline = Str::headline('EmailNotificationSent');

    // Email Notification Sent
```

<a name="method-str-inline-markdown"></a>
#### `Str::inlineMarkdown()`

O método `Str::inlineMarkdown` converte o Markdown do GitHub em HTML inline usando [CommonMark](https://commonmark.thephpleague.com/). No entanto, ao contrário do método `markdown`, ele não encadeia todo o HTML gerado num elemento de nível de bloco:

```php
    use Illuminate\Support\Str;

    $html = Str::inlineMarkdown('**Laravel**');

    // <strong>Laravel</strong>
```

#### Segurança no Markdown

Por padrão, o Markdown suporta HTML bruto, que expõe vulnerabilidades de Cross-Site Scripting (XSS) quando usado com input do usuário bruto. Conforme a [documentação de segurança do CommonMark](https://commonmark.thephpleague.com/security/), você pode usar a opção `html_input` para escapar ou remover o HTML bruto, e a opção `allow_unsafe_links` para especificar se é permitido links inseguros. Se você precisa permitir um pouco de HTML bruto, deve passar seu Markdown compilado por uma sanitização de HTML:

```php
    use Illuminate\Support\Str;
    
    Str::inlineMarkdown('Inject: <script>alert("Hello XSS!");</script>', [
        'html_input' => 'strip',
        'allow_unsafe_links' => false,
    ]);
    
    // Inject: alert(&quot;Hello XSS!&quot;);
```

<a name="method-str-is"></a>
#### `Str::is()`

O método `Str::is` verifrica se uma determinada string corresponde ou não a um determinado padrão. Os asteriscos podem ser utilizados como valores de substituição:

```php
    use Illuminate\Support\Str;

    $matches = Str::is('foo*', 'foobar');

    // true

    $matches = Str::is('baz*', 'foobar');

    // false
```

<a name="method-str-is-ascii"></a>
#### `Str::isAscii()`

O método `Str::isAscii` permite verificar se uma determinada string é ASCII de 7 bits:

```php
    use Illuminate\Support\Str;

    $isAscii = Str::isAscii('Taylor');

    // true

    $isAscii = Str::isAscii('ü');

    // false
```

<a name="method-str-is-json"></a>
#### `Str::isJson()`

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
#### `Str::isUrl()`

O método `Str::isUrl` determina se o texto fornecido é uma URL válida:

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
#### `Str::isUlid()`

O método `Str::isUlid` determina se uma determinada string é um ULID válido:

```php
    use Illuminate\Support\Str;

    $isUlid = Str::isUlid('01gd6r360bp37zj17nxb55yv40');

    // true

    $isUlid = Str::isUlid('laravel');

    // false
```

<a name="method-str-is-uuid"></a>
#### `Str::isUuid()`

O método `Str::isUuid` verifica se uma determinada string é um UUID válido:

```php
    use Illuminate\Support\Str;

    $isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de');

    // true

    $isUuid = Str::isUuid('laravel');

    // false
```

<a name="method-kebab-case"></a>
#### `Str::kebab()`

O método `Str::kebab` converte a string dada para o estilo `kebab-case`:

```php
    use Illuminate\Support\Str;

    $converted = Str::kebab('fooBar');

    // foo-bar
```

<a name="method-str-lcfirst"></a>
#### `Str::lcfirst()`

O método `Str::lcfirst` retorna a string dada com o primeiro caractere minúsculo:

```php
    use Illuminate\Support\Str;

    $string = Str::lcfirst('Foo Bar');

    // foo Bar
```

<a name="method-str-length"></a>
#### `str::length()`

O método `Str::length` retorna o comprimento da string indicada:

```php
    use Illuminate\Support\Str;

    $length = Str::length('Laravel');

    // 7
```

<a name="method-str-limit"></a>
#### `Str::limit()`

O método `Str::limit` trunca a string dada até um comprimento especificado:

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
#### `Str::lower()`

O método `Str::lower` converte uma string para minúsculas:

```php
    use Illuminate\Support\Str;

    $converted = Str::lower('LARAVEL');

    // laravel
```

<a name="method-str-markdown"></a>
#### `Str::markdown()`

O método `Str::markdown` converte o formato de texto do GitHub para Markdown em HTML usando o [CommonMark](https://commonmark.thephpleague.com/):

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

Por padrão, o Markdown suporta HTML bruto, o que irá expor vulnerabilidades de Cross-Site Scripting (XSS) quando usado com entrada do utilizador bruta. Conforme a [documentação de Segurança CommonMark](https://commonmark.thephpleague.com/security/), você pode usar a opção `html_input` para esconder ou remover o HTML bruto, e a opção `allow_unsafe_links` para especificar se permite links inseguros. Se necessário, você deverá passar a sua marcação do Markdown compilada através de um HTML Purifier:

```php
    use Illuminate\Support\Str;

    Str::markdown('Inject: <script>alert("Hello XSS!");</script>', [
        'html_input' => 'strip',
        'allow_unsafe_links' => false,
    ]);

    // <p>Inject: alert(&quot;Hello XSS!&quot;);</p>
```

<a name="method-str-mask"></a>
#### `Str::mask()`

O método `Str::mask` mascara uma parte de uma string com um caractere repetido e pode ser usado para ofuscar segmentos de strings, como endereços de e-mail e números de telefone:

```php
    use Illuminate\Support\Str;

    $string = Str::mask('taylor@example.com', '*', 3);

    // tay***************
```

Se necessário, forneça um número negativo como o terceiro argumento para o método `mask`, que instruirá o método a começar a mascarar na distância fornecida a partir do final da string:

```php
    $string = Str::mask('taylor@example.com', '*', -15, 3);

    // tay***@example.com
```

<a name="method-str-ordered-uuid"></a>
#### `Str::orderedUuid()`

O método `Str::orderedUuid` gera um UUID de "_timestamps first_" que pode ser armazenado de forma eficiente em uma coluna de banco de dados com índice. Cada UUID gerado por este método será ordenado após os UUIDs gerados anteriormente pelo método:

```php
    use Illuminate\Support\Str;

    return (string) Str::orderedUuid();
```

<a name="method-str-padboth"></a>
#### `Str::padBoth()`

O método `Str::padBoth` encapsula a função `str_pad` do PHP, preenchendo ambos os lados de uma string com outra string até que a string final atinja o comprimento desejado:

```php
    use Illuminate\Support\Str;

    $padded = Str::padBoth('James', 10, '_');

    // '__James___'

    $padded = Str::padBoth('James', 10);

    // '  James   '
```

<a name="method-str-padleft"></a>
#### `Str::padLeft()`

O método `Str::padLeft` encapsula a função `str_pad` do PHP, preenchendo o lado esquerdo de uma string com outra string até que a string final atinja o comprimento desejado:

```php
    use Illuminate\Support\Str;

    $padded = Str::padLeft('James', 10, '-=');

    // '-=-=-James'

    $padded = Str::padLeft('James', 10);

    // '     James'
```

<a name="method-str-padright"></a>
#### `Str::padRight()`

O método `Str::padRight` encapsula a função `str_pad` do PHP, preenchendo o lado direito de uma string com outra string até que a string final atinja o comprimento desejado:

```php
    use Illuminate\Support\Str;

    $padded = Str::padRight('James', 10, '-');

    // 'James-----'

    $padded = Str::padRight('James', 10);

    // 'James     '
```

<a name="method-str-password"></a>
#### `Str::password()`

O método `Str::password` pode ser usado para gerar uma senha segura e aleatória de determinado tamanho. A senha consistirá em combinações de letras, números, símbolos e espaços. As senhas por padrão têm 32 caracteres:

```php

    use Illuminate\Support\Str;

    $password = Str::password();

    // 'EbJo2vE-AS:U,$%_gkrV4n,q~1xy/-_4'

    $password = Str::password(12);

    // 'qwuar>#V|i]N'
```

<a name="method-str-plural"></a>
#### Str::plural()

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
#### `Str::pluralStudly()`

O método `Str::pluralStudly` converte uma string de palavra singular formatada em _studly caps case_ para sua forma plural. Esta função suporta [qualquer uma das linguagens suportadas pelo pluralizador do Laravel](/docs/localization#pluralization-language):

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
#### `Str::position()`

O método `Str::position` retorna a posição da primeira ocorrência de uma substrings em uma string. Se a substring não existe na string especificada, `false` é retornado:

```php
    use Illuminate\Support\Str;

    $position = Str::position('Hello, World!', 'Hello');

    // 0

    $position = Str::position('Hello, World!', 'W');

    // 7
```

<a name="method-str-random"></a>
#### `Str::random()`

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
#### `Str::remover()`

O método `Str::remove` remove o valor ou os valores dados da string:

```php
    use Illuminate\Support\Str;

    $string = 'Peter Piper picked a peck of pickled peppers.';

    $removed = Str::remove('e', $string);

    // Ptr Pipr pickd a pck of pickld ppprs.
```

Você também pode passar um terceiro argumento `false` para o método `remove`, caso queira ignorar os casos ao remover as strings.

<a name="method-str-repeat"></a>
#### `Str::repeat()`

O método `Str::repeat` repete a string dada:

```php
use Illuminate\Support\Str;

$string = 'a';

$repeat = Str::repeat($string, 5);

// aaaaa
```

<a name="method-str-replace"></a>
#### Str::replace()

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
#### `Str::replaceArray()`

O método `Str::replaceArray` substitui um determinado valor na string de forma seqüencial usando uma matriz:

```php
    use Illuminate\Support\Str;

    $string = 'The event will take place between ? and ?';

    $replaced = Str::replaceArray('?', ['8:30', '9:00'], $string);

    // O evento acontecerá entre 8h30 e 9h00
```

<a name="method-str-replace-first"></a>
#### `Str::replaceFirst()`

O método `Str::replaceFirst` substitui a primeira ocorrência de um determinado valor em uma string:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceFirst('the', 'a', 'the quick brown fox jumps over the lazy dog');

    // a quick brown fox jumps over the lazy dog
```

<a name="method-str-replace-last"></a>
#### `Str::replaceLast()`

O método `Str::replaceLast` substitui a última ocorrência de um determinado valor em uma string:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceLast('the', 'a', 'the quick brown fox jumps over the lazy dog');

    // the quick brown fox jumps over a lazy dog
```

<a name="method-str-replace-matches"></a>
#### `str::replaceMatches()`

O método `Str::replaceMatches` substitui todas as partes de uma string que corresponde a um padrão pela string de substituição fornecida:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceMatches(
        pattern: '/[^A-Za-z0-9]++/',
        replace: '',
        subject: '(+1) 501-555-1000'
    )

    // '15015551000'
```

O método `replaceMatches` também aceita um closure que será invocado com cada parte da string correspondente ao padrão fornecido, permitindo que você execute a lógica de substituição dentro do closure e retorne o valor substituído:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceMatches('/\d/', function (array $matches) {
        return '['.$matches[0].']';
    }, '123');

    // '[1][2][3]'
```

<a name="method-str-replace-start"></a>
#### `Str::replaceStart()`

O método `Str::replaceStart` substitui a primeira ocorrência do valor especificado apenas se o valor aparecer no início da string:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceStart('Hello', 'Laravel', 'Hello World');

    // Laravel World

    $replaced = Str::replaceStart('World', 'Laravel', 'Hello World');

    // Hello World
```

<a name="method-str-replace-end"></a>
#### `Str::replaceEnd()`

O método `Str::replaceEnd` substitui a última ocorrência do valor indicado somente se este estiver no final da string:

```php
    use Illuminate\Support\Str;

    $replaced = Str::replaceEnd('World', 'Laravel', 'Hello World');

    // Hello Laravel

    $replaced = Str::replaceEnd('Hello', 'Laravel', 'Hello World');

    // Hello World
```

<a name="method-str-reverse"></a>
#### `Str::reverse()`

O método `Str::reverse` inverte a ordem das letras da string passada como parâmetro:

```php
    use Illuminate\Support\Str;

    $reversed = Str::reverse('Hello World');

    // dlroW olleH
```

<a name="method-str-singular"></a>
#### `Str::singular()`

O método `Str::singular` converte uma string para sua forma singular. Essa função suporta [qualquer uma das linguagens suportadas pelo pluralizador do Laravel](/docs/localization#pluralization-language):

```php
    use Illuminate\Support\Str;

    $singular = Str::singular('cars');

    // car

    $singular = Str::singular('children');

    // child
```

<a name="method-str-slug"></a>
#### Str::slug()

O método `Str::slug` gera um "_slug_" amigável da string fornecida:

```php
    use Illuminate\Support\Str;

    $slug = Str::slug('Laravel 5 Framework', '-');

    // laravel-5-framework
```

<a name="method-snake-case"></a>
#### `Str::snake()`

O método `Str::snake` converte a string dada em notação `snake_case`.

```php
    use Illuminate\Support\Str;

    $converted = Str::snake('fooBar');

    // foo_bar

    $converted = Str::snake('fooBar', '-');

    // foo-bar
```

<a name="method-str-squish"></a>
#### `Str::squish()`

O método `Str::squish` remove todos os espaços em branco não necessários de uma string, incluindo os entre palavras:

```php
    use Illuminate\Support\Str;

    $string = Str::squish('    laravel    framework    ');

    // laravel framework
```

<a name="method-str-start"></a>
#### `Str::start()`

O método `Str::start` adiciona uma única instância do valor dado a uma string, se não começar com ele.

```php
    use Illuminate\Support\Str;

    $adjusted = Str::start('this/string', '/');

    // /this/string

    $adjusted = Str::start('/this/string', '/');

    // /this/string
```

<a name="method-starts-with"></a>
#### `Str::startsWith()`

O método `Str::startsWith` verifica se a string fornecida começa com o valor indicado:

```php
    use Illuminate\Support\Str;

    $result = Str::startsWith('This is my name', 'This');

    // true
```

Se um array de possíveis valores for passado, o método `startsWith` retornará `true` se a string começar com qualquer um dos valores apresentados:

```php
    $result = Str::startsWith('This is my name', ['This', 'That', 'There']);

    // true
```

<a name="method-studly-case"></a>
#### Str::studly()

O método `Str::studly` converte a string em `StudlyCase`:

```php
    use Illuminate\Support\Str;

    $converted = Str::studly('foo_bar');

    // FooBar
```

<a name="method-str-substr"></a>
#### `Str::substr()`

O método `Str::substr` retorna a parte da string especificada pelos parâmetros `start` e `length`:

```php
    use Illuminate\Support\Str;

    $converted = Str::substr('The Laravel Framework', 4, 7);

    // Laravel
```

<a name="method-str-substrcount"></a>
#### `Str::substrCount()`

O método `Str::substrCount` retorna o número de ocorrências de um valor especificado numa determinada string:

```php
    use Illuminate\Support\Str;

    $count = Str::substrCount('If you like ice cream, you will like snow cones.', 'like');

    // 2
```

<a name="method-str-substrreplace"></a>
#### `Str::substrReplace()`

O método `Str::substrReplace` substitui texto dentro de uma parte de uma string, começando na posição especificada pelo terceiro argumento e substituindo o número de caracteres especificado pelo quarto argumento. Passar `0` para o quarto argumento do método irá inserir a string na posição especificada sem substituir nenhum dos caracteres existentes na string:

```php
    use Illuminate\Support\Str;

    $result = Str::substrReplace('1300', ':', 2);
    // 13:

    $result = Str::substrReplace('1300', ':', 2, 0);
    // 13:00
```

<a name="method-str-swap"></a>
#### Str::swap()

O método `Str::swap` substitui vários valores na string fornecida utilizando a função `strtr` do PHP:

```php
    use Illuminate\Support\Str;

    $string = Str::swap([
        'Tacos' => 'Burritos',
        'great' => 'fantastic',
    ], 'Tacos are great!');

    // Burritos are fantastic!
```

<a name="method-take"></a>
#### `Str::take()`

O método `Str::take` retorna um número especificado de caracteres do início de uma string:

```php
    use Illuminate\Support\Str;

    $taken = Str::take('Build something amazing!', 5);

    // Build
```

<a name="method-title-case"></a>
#### `Str::title()`

O método `Str::title` converte a string fornecida para `Title Case`:

```php
    use Illuminate\Support\Str;

    $converted = Str::title('a nice title uses the correct case');

    // A Nice Title Uses The Correct Case
```

<a name="method-str-to-base64"></a>
#### `Str::toBase64()`

O método `Str::toBase64` converte a string dada para o formato Base64:

```php
    use Illuminate\Support\Str;

    $base64 = Str::toBase64('Laravel');

    // TGFyYXZlbA==
```

<a name="method-str-to-html-string"></a>
#### `Str::toHtmlString()`

O método `Str::toHtmlString` converte a instância da string em uma instância de `Illuminate\Support\HtmlString`, podendo ser exibida nos modelos Blade:

```php
    use Illuminate\Support\Str;

    $htmlString = Str::of('Nuno Maduro')->toHtmlString();
```

<a name="method-str-trim"></a>
#### `Str::trim()`

O método `Str::trim` elimina espaços em branco (ou outros caracteres) no início e no fim da string dada. Diferente da função nativa de PHP, o método `Str::trim` também remove espaços em branco unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::trim(' foo bar ');

    // 'foo bar'
```

<a name="method-str-ltrim"></a>
#### `Str::ltrim()`

O método `Str::ltrim` remove os espaços em branco (ou outros caracteres) que aparecem no início da string fornecida. Diferente da função nativa `ltrim` do PHP, o método `Str::ltrim` também remove os espaços reservados Unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::ltrim('  foo bar  ');

    // 'foo bar  '
```

<a name="method-str-rtrim"></a>
#### `Str::rtrim()`

O método `Str::rtrim` remove espaços em branco (ou outros caracteres) do final da string fornecida. Diferentemente da função nativa `rtrim` do PHP, o método `Str::rtrim` também remove caracteres de espaço em branco unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::rtrim('  foo bar  ');

    // '  foo bar'
```

<a name="method-str-ucfirst"></a>
#### `Str::ucfirst()`

O método `Str::ucfirst` retorna a string dada com o primeiro caractere maiúsculo:

```php
    use Illuminate\Support\Str;

    $string = Str::ucfirst('foo bar');

    // Foo bar
```

<a name="method-str-ucsplit"></a>
#### `Str::ucsplit()`

O método `Str::ucsplit` divide a string em um array com caracteres maiúsculos:

```php
    use Illuminate\Support\Str;

    $segments = Str::ucsplit('FooBar');

    // [0 => 'Foo', 1 => 'Bar']
```

<a name="method-str-upper"></a>
#### `Str::upper()`

O método `Str::upper` converte a string em maiúsculas:

```php
    use Illuminate\Support\Str;

    $string = Str::upper('laravel');

    // LARAVEL
```

<a name="method-str-ulid"></a>
#### `Str::ulid()`

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
#### `Str::unwrap()`

O método `Str::unwrap` remove as letras iniciais e finais de uma string dada:

```php
    use Illuminate\Support\Str;

    Str::unwrap('-Laravel-', '-');

    // Laravel

    Str::unwrap('{framework: "Laravel"}', '{', '}');

    // framework: "Laravel"
```

<a name="method-str-uuid"></a>
#### `Str::uuid()`

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
#### `Str::wordCount()`

O método `Str::wordCount` retorna o número de palavras que uma string possui:

```php
use Illuminate\Support\Str;

Str::wordCount('Hello, world!'); // 2
```

<a name="method-str-word-wrap"></a>
#### `Str::wordWrap()`

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
#### `Str::words()`

O método `Str::words` limita o número de palavras numa string. Pode ser passada uma string adicional a este método através do terceiro argumento para especificar qual string deve ser anexada à extremidade da string truncada:

```php
    use Illuminate\Support\Str;

    return Str::words('Perfectly balanced, as all things should be.', 3, ' >>>');

    // Perfectly balanced, as >>>
```

<a name="method-str-wrap"></a>
#### `Str::wrap()`

O método `Str::wrap` envolve a string dada em um ou mais pares de strings:

```php
    use Illuminate\Support\Str;

    Str::wrap('Laravel', '"');

    // "Laravel"

    Str::wrap('is', before: 'This ', after: ' Laravel!');

    // This is Laravel!
```

<a name="method-str"></a>
#### `str()`

A função `str` retorna uma nova instância de `Illuminate\Support\Stringable` da string especificada, que é equivalente ao método `Str::of`.

```php
    $string = str('Taylor')->append(' Otwell');

    // 'Taylor Otwell'
```

Se nenhum argumento for fornecido à função `str`, a função retorna uma instância padrão do `Illuminate\Support\Str`:

```php
    $snake = str()->snake('FooBar');

    // 'foo_bar'
```

<a name="method-trans"></a>
#### `trans()`

A função `trans` traduz a chave de tradução fornecida usando seus [arquivos de idioma](/docs/localization):

```php
    echo trans('messages.welcome');
```

Se a chave de tradução especificada não existir, a função `trans` retornará a chave fornecida. Assim, usando o exemplo acima, a função `trans` retornaria `messages.welcome` se a chave de tradução não existir.

<a name="method-trans-choice"></a>
#### `trans_choice()`

A função `trans_choice` traduz a chave de tradução fornecida com inflexão:

```php
    echo trans_choice('messages.notifications', $unreadCount);
```

Se a chave de tradução especificada não existir, a função `trans_choice` retornará a chave fornecida. Então, usando o exemplo acima, a função `trans_choice` retornaria `messages.notifications` se a chave de tradução não existir.

<a name="fluent-strings"></a>
## Strings fluentes

As cadeias ativas oferecem uma interface mais fluida e baseada em objetos para o trabalho com valores de cadeia, permitindo que você junte várias operações de cadeia usando uma sintaxe mais legível do que as operações tradicionais.

<a name="method-fluent-str-after"></a>
#### `after`

O método `after` retorna tudo o que aparece após o valor indicado numa string. A string inteira será retornada se o valor não estiver presente na string:

```php
    use Illuminate\Support\Str;

    $slice = Str::of('This is my name')->after('This is');

    // ' my name'
```

<a name="method-fluent-str-after-last"></a>
#### `afterLast`

O método `afterLast` retorna tudo depois da última ocorrência do valor especificado numa string. A cadeia inteira é retornada se o valor não existir na cadeia:

```php
    use Illuminate\Support\Str;

    $slice = Str::of('App\Http\Controllers\Controller')->afterLast('\\');

    // 'Controller'
```

<a name="method-fluent-str-apa"></a>
#### ``apa``

O método `apa` converte a string fornecida para maiúsculas de acordo com as diretrizes do [APA](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case):

```php
    use Illuminate\Support\Str;

    $converted = Str::of('a nice title uses the correct case')->apa();

    // A Nice Title Uses the Correct Case
```

<a name="method-fluent-str-append"></a>
#### `append`

O método `append` adiciona os valores dados à string:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Taylor')->append(' Otwell');

    // 'Taylor Otwell'
```

<a name="method-fluent-str-ascii"></a>
#### `ascii`

O método `ascii` irá tentar traduzir a string para um valor ASCII:

```php
    use Illuminate\Support\Str;

    $string = Str::of('ü')->ascii();

    // 'u'
```

<a name="method-fluent-str-basename"></a>
#### `basename`

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
#### `before`

O método `before` retorna tudo antes do valor fornecido em uma string:

```php
    use Illuminate\Support\Str;

    $slice = Str::of('This is my name')->before('my name');

    // 'This is '
```

<a name="method-fluent-str-before-last"></a>
#### `beforeLast`

O método `beforeLast` retorna tudo antes da última ocorrência do valor especificado em uma string.

```php
    use Illuminate\Support\Str;

    $slice = Str::of('This is my name')->beforeLast('is');

    // 'This '
```

<a name="method-fluent-str-between"></a>
#### `between`

O método `entre` retorna o trecho de uma string entre dois valores:

```php
    use Illuminate\Support\Str;

    $converted = Str::of('This is my name')->between('This', 'name');

    // ' is my '
```

<a name="method-fluent-str-between-first"></a>
#### `betweenFirst`

O método `betweenFirst` retorna a menor porção possível de uma string entre dois valores:

```php
    use Illuminate\Support\Str;

    $converted = Str::of('[a] bc [d]')->betweenFirst('[', ']');

    // 'a'
```

<a name="method-fluent-str-camel"></a>
#### `camel`

O método `camel` converte a string dada para `camelCase`:

```php
    use Illuminate\Support\Str;

    $converted = Str::of('foo_bar')->camel();

    // 'fooBar'
```

<a name="method-fluent-str-char-at"></a>
#### `charAt`

O método `charAt` retorna o caractere na posição especificada. Se a posição estiver fora dos limites do array, `false` é retornado:

```php
    use Illuminate\Support\Str;

    $character = Str::of('This is my name.')->charAt(6);

    // 's'
```

<a name="method-fluent-str-class-basename"></a>
#### classBasename

O método `classBasename` retorna o nome de classe da classe especificada, com o namespace da classe removido:

```php
    use Illuminate\Support\Str;

    $class = Str::of('Foo\Bar\Baz')->classBasename();

    // 'Baz'
```

<a name="method-fluent-str-contains"></a>
#### `contains`

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
#### `containsAll`

O método `containsAll` determina se a string fornecida contém todas as valores do array:

```php
    use Illuminate\Support\Str;

    $containsAll = Str::of('This is my name')->containsAll(['my', 'name']);

    // true
```

<a name="method-fluent-str-dirname"></a>
#### `dirname`

O método `dirname` retorna a parte do diretório pai da string fornecida:

```php
    use Illuminate\Support\Str;

    $string = Str::of('/foo/bar/baz')->dirname();

    // '/foo/bar'
```

Se necessário, você pode especificar quantos níveis de pasta pretende remover da string:

```php
    use Illuminate\Support\Str;

    $string = Str::of('/foo/bar/baz')->dirname(2);

    // '/foo'
```

<a name="method-fluent-str-excerpt"></a>
#### `excerpt`

O método `excerpt` extrai um trecho da string que corresponde à primeira instância de uma frase nela contida:

```php
    use Illuminate\Support\Str;

    $excerpt = Str::of('This is my name')->excerpt('my', [
        'radius' => 3
    ]);

    // '...is my na...'
```

A opção `radius`, que tem por padrão o valor `100`, permite definir o número de caracteres que devem aparecer a cada lado da string truncado.

Além disso, é possível usar a opção `omission` para alterar a string que será adicionada antes e depois da string truncada.

```php
    use Illuminate\Support\Str;

    $excerpt = Str::of('This is my name')->excerpt('name', [
        'radius' => 3,
        'omission' => '(...) '
    ]);

    // '(...) my name'
```

<a name="method-fluent-str-ends-with"></a>
#### `endsWith`

O método `endsWith` determina se uma string termina com o valor especificado:

```php
    use Illuminate\Support\Str;

    $result = Str::of('This is my name')->endsWith('name');

    // true
```

Você também pode passar uma matriz de valores para determinar se a string fornecida termina com algum dos valores da matriz:

```php
    use Illuminate\Support\Str;

    $result = Str::of('This is my name')->endsWith(['name', 'foo']);

    // true

    $result = Str::of('This is my name')->endsWith(['this', 'foo']);

    // false
```

<a name="method-fluent-str-exactly"></a>
#### `exactly`

O método `exactly` determina se a string especificada corresponde exatamente à outra string:

```php
    use Illuminate\Support\Str;

    $result = Str::of('Laravel')->exactly('Laravel');

    // true
```

<a name="method-fluent-str-explode"></a>
#### `explode`

O método `explode` divide a string pelo delimitador fornecido e retorna uma coleção contendo cada seção da string dividida:

```php
    use Illuminate\Support\Str;

    $collection = Str::of('foo bar baz')->explode(' ');

    // collect(['foo', 'bar', 'baz'])
```

<a name="method-fluent-str-finish"></a>
#### `finish`

O método `finish` adiciona uma única instância do valor indicado a uma string se esta não terminar com esse valor:

```php
    use Illuminate\Support\Str;

    $adjusted = Str::of('this/string')->finish('/');

    // this/string/

    $adjusted = Str::of('this/string/')->finish('/');

    // this/string/
```

<a name="method-fluent-str-headline"></a>
#### `headline`

O método `headline` converte uma sequência de letras separadas por hifens ou sublinhados para uma sequência espaçada com as primeiras letras maiúsculas das palavras:

```php
    use Illuminate\Support\Str;

    $headline = Str::of('taylor_otwell')->headline();

    // Taylor Otwell

    $headline = Str::of('EmailNotificationSent')->headline();

    // Email Notification Sent
```

<a name="method-fluent-str-inline-markdown"></a>
#### ``inlineMarkdown``

O método `inlineMarkdown` converte o Markdown com sabor do GitHub em HTML inline usando [CommonMark](https://commonmark.thephpleague.com/). No entanto, diferentemente do método `markdown`, ele não encapsula todo o HTML gerado em um elemento de nível de bloco:

```php
    use Illuminate\Support\Str;

    $html = Str::of('**Laravel**')->inlineMarkdown();

    // <strong>Laravel</strong>
```

#### Segurança no Markdown

Por padrão, o Markdown suporta HTML bruto, o que irá expor vulnerabilidades de Cross-Site Scripting (XSS) quando usado com entrada bruta do usuário. Conforme a [documentação do CommonMark Security](https://commonmark.thephpleague.com/security/), você pode usar a opção `html_input` para escapar ou remover HTML bruto, e a opção `allow_unsafe_links` para especificar se deve permitir links não seguros. Se você precisar permitir algum HTML bruto, você deve passar seu Markdown compilado por um Purificador de HTML:

```php
    use Illuminate\Support\Str;

    Str::of('Inject: <script>alert("Hello XSS!");</script>')->inlineMarkdown([
        'html_input' => 'strip',
        'allow_unsafe_links' => false,
    ]);

    // Inject: alert(&quot;Hello XSS!&quot;);
```

<a name="method-fluent-str-is"></a>
#### “is”

O método `is` verifica se uma determinada string corresponde a um padrão especificado. Os asteriscos podem ser utilizados como valores de substituição.

```php
    use Illuminate\Support\Str;

    $matches = Str::of('foobar')->is('foo*');

    // true

    $matches = Str::of('foobar')->is('baz*');

    // false
```

<a name="method-fluent-str-is-ascii"></a>
#### `isAscii`

O método `isAscii` determina se uma determinada string é uma string ASCII.

```php
    use Illuminate\Support\Str;

    $result = Str::of('Taylor')->isAscii();

    // true

    $result = Str::of('ü')->isAscii();

    // false
```

<a name="method-fluent-str-is-empty"></a>
#### `isEmpty`

O método `isEmpty` determina se a string fornecida está vazia:

```php
    use Illuminate\Support\Str;

    $result = Str::of('  ')->trim()->isEmpty();

    // true

    $result = Str::of('Laravel')->trim()->isEmpty();

    // false
```

<a name="method-fluent-str-is-not-empty"></a>
#### `isNotEmpty`.

O método `isNotEmpty` determina se a string fornecida não está vazia:

```php
    use Illuminate\Support\Str;

    $result = Str::of('  ')->trim()->isNotEmpty();

    // false

    $result = Str::of('Laravel')->trim()->isNotEmpty();

    // true
```

<a name="method-fluent-str-is-json"></a>
#### `isJson`

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
#### `isUlid`

O método `isUlid` determina se uma string é um ULID:

```php
    use Illuminate\Support\Str;

    $result = Str::of('01gd6r360bp37zj17nxb55yv40')->isUlid();

    // true

    $result = Str::of('Taylor')->isUlid();

    // false
```

<a name="method-fluent-str-is-url"></a>
#### `isUrl`

O método `isUrl` verifica se uma determinada string é um endereço de URL:

```php
    use Illuminate\Support\Str;

    $result = Str::of('http://example.com')->isUrl();

    // true

    $result = Str::of('Taylor')->isUrl();

    // false
```

O método `isUrl` considera uma grande variedade de protocolos como válidos. No entanto, você pode especificar os protocolos que devem ser considerados válidos facultando-os ao método `isUrl`:

```php
    $result = Str::of('http://example.com')->isUrl(['http', 'https']);
```

<a name="method-fluent-str-is-uuid"></a>
#### `isUuid`

O método `isUuid` verifica se uma determinada string é um GUID (Identificador global único):

```php
    use Illuminate\Support\Str;

    $result = Str::of('5ace9ab9-e9cf-4ec6-a19d-5881212a452c')->isUuid();

    // true

    $result = Str::of('Taylor')->isUuid();

    // false
```

<a name="method-fluent-str-kebab"></a>
#### `kebab`

O método `kebab` converte a string fornecida para `kebab-case`:

```php
    use Illuminate\Support\Str;

    $converted = Str::of('fooBar')->kebab();

    // foo-bar
```

<a name="method-fluent-str-lcfirst"></a>
#### `lcfirst`

O método `lcfirst` retorna a string indicada com o primeiro caractere minúscula:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Foo Bar')->lcfirst();

    // foo Bar
```

<a name="method-fluent-str-length"></a>
#### `length`

O método `length` retorna o comprimento do valor dado:

```php
    use Illuminate\Support\Str;

    $length = Str::of('Laravel')->length();

    // 7
```

<a name="method-fluent-str-limit"></a>
#### `limit`

O método `limit` trunca a string para a comprimento especificado.

```php
    use Illuminate\Support\Str;

    $truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20);

    // The quick brown fox...
```

Também é possível passar um segundo argumento para mudar a string que será anexada ao final da string truncada.

```php
    use Illuminate\Support\Str;

    $truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20, ' (...)');

    // The quick brown fox (...)
```

<a name="method-fluent-str-lower"></a>
#### `lower`

O método `lower` converte a string dada para letras minúsculas:

```php
    use Illuminate\Support\Str;

    $result = Str::of('LARAVEL')->lower();

    // 'laravel'
```

<a name="method-fluent-str-markdown"></a>
#### `markdown`

O método `markdown` converte o Markdown com estilo do GitHub em HTML:

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

Por padrão, o Markdown suporta HTML bruto, o que irá expor vulnerabilidades de Cross-Site Scripting (XSS) quando usado com entrada bruta do usuário. Conforme a [documentação do CommonMark Security](https://commonmark.thephpleague.com/security/), você pode usar a opção `html_input` para escapar ou remover HTML bruto, e a opção `allow_unsafe_links` para especificar se deve permitir links não seguros. Se você precisar permitir algum HTML bruto, você deve passar seu Markdown compilado por um Purificador de HTML:

```php
    use Illuminate\Support\Str;

    Str::of('Inject: <script>alert("Hello XSS!");</script>')->markdown([
        'html_input' => 'strip',
        'allow_unsafe_links' => false,
    ]);

    // <p>Inject: alert(&quot;Hello XSS!&quot;);</p>
```

<a name="method-fluent-str-mask"></a>
#### `mask`

O método `mask` mascara uma parte de uma string com um caractere repetido e pode ser usado para ofuscar segmentos de strings, como endereços de e-mail e números de telefone:

```php
    use Illuminate\Support\Str;

    $string = Str::of('taylor@example.com')->mask('*', 3);

    // tay***************
```

Se necessário, você pode fornecer números negativos como o terceiro ou quarto argumento para o método `mask`, que instruirá o método a começar a mascarar na distância fornecida a partir do final da string:

```php
    $string = Str::of('taylor@example.com')->mask('*', -15, 3);

    // tay***@example.com

    $string = Str::of('taylor@example.com')->mask('*', 4, -4);

    // tayl**********.com
```

<a name="method-fluent-str-match"></a>
#### `match`

O método `match` retornará a parte de uma string que corresponde a um determinado padrão de expressão regular:

```php
    use Illuminate\Support\Str;

    $result = Str::of('foo bar')->match('/bar/');

    // 'bar'

    $result = Str::of('foo bar')->match('/foo (.*)/');

    // 'bar'
```

<a name="method-fluent-str-match-all"></a>
#### `matchAll`

O método `matchAll` retorna uma coleção que contém as porções de uma string que correspondem a um padrão de expressão regular especificado:

```php
    use Illuminate\Support\Str;

    $result = Str::of('bar foo bar')->matchAll('/bar/');

    // collect(['bar', 'bar'])
```

Se você especificar um grupo correspondente dentro da expressão, o Laravel retornará uma coleção dos primeiros _matchs_ do primeiro grupo correspondente:

```php
    use Illuminate\Support\Str;

    $result = Str::of('bar fun bar fly')->matchAll('/f(\w*)/');

    // collect(['un', 'ly']);
```

Se não forem encontradas correspondências, será devolvido um conjunto vazio.

<a name="method-fluent-str-is-match"></a>
#### `isMatch`

O método `isMatch` retornará `true` se a string corresponder a uma expressão regular fornecida:

```php
    use Illuminate\Support\Str;

    $result = Str::of('foo bar')->isMatch('/foo (.*)/');

    // true

    $result = Str::of('laravel')->isMatch('/foo (.*)/');

    // false
```

<a name="method-fluent-str-new-line"></a>
#### `newLine`

O método `newLine` adiciona um caractere de "fim da linha" ao final de uma string.

```php
    use Illuminate\Support\Str;

    $padded = Str::of('Laravel')->newLine()->append('Framework');

    // 'Laravel
    //  Framework'
```

<a name="method-fluent-str-padboth"></a>
#### `padBoth`

O método `padBoth` envolve a função PHP `str_pad`, que alinha os lados de uma string com outra até que o resultado final atinja um comprimento desejado:

```php
    use Illuminate\Support\Str;

    $padded = Str::of('James')->padBoth(10, '_');

    // '__James___'

    $padded = Str::of('James')->padBoth(10);

    // '  James   '
```

<a name="method-fluent-str-padleft"></a>
#### `padLeft`

O método `padLeft` encapsula a função `str_pad` do PHP, preenchendo o lado esquerdo de uma string com outra string até que a string final atinja o comprimento desejado:

```php
    use Illuminate\Support\Str;

    $padded = Str::of('James')->padLeft(10, '-=');

    // '-=-=-James'

    $padded = Str::of('James')->padLeft(10);

    // '     James'
```

<a name="method-fluent-str-padright"></a>
#### `padRight`

O método `padRight` envolve a função PHP `str_pad`, preenchendo o lado direito de uma string com outra string até que a string final atinja o comprimento desejado.

```php
    use Illuminate\Support\Str;

    $padded = Str::of('James')->padRight(10, '-');

    // 'James-----'

    $padded = Str::of('James')->padRight(10);

    // 'James     '
```

<a name="method-fluent-str-pipe"></a>
#### `pipe`

O método `pipe` permite que você transforme a string passando seu valor atual para o _callable_ fornecido:

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
#### `plural`

O método `plural` converte uma string de palavra singular para sua forma plural. Esta função suporta [qualquer uma das linguagens suportadas pelo pluralizador do Laravel](/docs/localization#pluralization-language):

```php
    use Illuminate\Support\Str;

    $plural = Str::of('car')->plural();

    // cars

    $plural = Str::of('child')->plural();

    // children
```

Você pode fornecer um inteiro como segundo parâmetro da função para recuperar a forma singular ou plural da string:

```php
    use Illuminate\Support\Str;

    $plural = Str::of('child')->plural(2);

    // children

    $plural = Str::of('child')->plural(1);

    // child
```

<a name="method-fluent-str-position"></a>
#### `position`

O método `position` retorna a posição da primeira ocorrência de uma substring em uma string. Se a substring não existir dentro da string, `false` será retornado:

```php
    use Illuminate\Support\Str;

    $position = Str::of('Hello, World!')->position('Hello');

    // 0

    $position = Str::of('Hello, World!')->position('W');

    // 7
```

<a name="method-fluent-str-prepend"></a>
#### "prepend"

O método `prepend` adiciona os valores dados no início da string:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Framework')->prepend('Laravel ');

    // Laravel Framework
```

<a name="method-fluent-str-remove"></a>
#### `remove`

O método `remove` remove o valor ou um array de valores da string:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Arkansas is quite beautiful!')->remove('quite');

    // Arkansas is beautiful!
```

Você também pode passar `false` como um segundo parâmetro para ignorar maiúsculas e minúsculas ao remover strings.

<a name="method-fluent-str-repeat"></a>
#### `repetir`

O método `repeat` repete a string passada como parâmetro:

```php
use Illuminate\Support\Str;

$repeated = Str::of('a')->repeat(5);

// aaaaa
```

<a name="method-fluent-str-replace"></a>
#### `replace`

O método `replace` substitui uma string especificada dentro da string:

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
#### `replaceArray`

O método `replaceArray` substitui um valor especificado na sequência da string utilizando uma matriz.

```php
    use Illuminate\Support\Str;

    $string = 'The event will take place between ? and ?';

    $replaced = Str::of($string)->replaceArray('?', ['8:30', '9:00']);

    // O evento acontecerá entre 8h30 e 9h00
```

<a name="method-fluent-str-replace-first"></a>
#### `replaceFirst`

O método `replaceFirst` substitui a primeira ocorrência de um determinado valor numa string:

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceFirst('the', 'a');

    // a quick brown fox jumps over the lazy dog
```

<a name="method-fluent-str-replace-last"></a>
#### `replaceLast`

O método `replaceLast` substitui a última ocorrência de um determinado valor em uma string:

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceLast('the', 'a');

    // the quick brown fox jumps over a lazy dog
```

<a name="method-fluent-str-replace-matches"></a>
#### `replaceMatches`

O método `replaceMatches` substitui todas as partes de uma string que correspondam a um padrão com a string de substituição indicada:

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('(+1) 501-555-1000')->replaceMatches('/[^A-Za-z0-9]++/', '')

    // '15015551000'
```

O método `replaceMatches` também aceita um closure que é invocado com cada parte da string correspondente ao padrão fornecido, permitindo a execução da lógica de substituição dentro do closure e o retorno do valor substituído:

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('123')->replaceMatches('/\d/', function (array $matches) {
        return '['.$matches[0].']';
    });

    // '[1][2][3]'
```

<a name="method-fluent-str-replace-start"></a>
#### `replaceStart`

O método `replaceStart` substitui o primeiro valor dado apenas se este aparecer no início da cadeia:

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('Hello World')->replaceStart('Hello', 'Laravel');

    // Laravel World

    $replaced = Str::of('Hello World')->replaceStart('World', 'Laravel');

    // Hello World
```

<a name="method-fluent-str-replace-end"></a>
#### `replaceEnd`

O método `replaceEnd` substitui a última ocorrência do valor fornecido, somente se o valor aparecer no final da string.

```php
    use Illuminate\Support\Str;

    $replaced = Str::of('Hello World')->replaceEnd('World', 'Laravel');

    // Hello Laravel

    $replaced = Str::of('Hello World')->replaceEnd('Hello', 'Laravel');

    // Hello World
```

<a name="method-fluent-str-scan"></a>
#### `scan`

O método `scan` analisa o conteúdo de uma string numa coleção, com base em um formato suportado pela função [`sscanf` do PHP](https://www.php.net/manual/en/function.sscanf.php):

```php
    use Illuminate\Support\Str;

    $collection = Str::of('filename.jpg')->scan('%[^.].%s');

    // collect(['filename', 'jpg'])
```

<a name="method-fluent-str-singular"></a>
#### `singular`

O método singular converte uma string para sua forma singular. Esta função suporta qualquer um dos idiomas suportados pelo pluralizador do Laravel:

```php
    use Illuminate\Support\Str;

    $singular = Str::of('cars')->singular();

    // car

    $singular = Str::of('children')->singular();

    // child
```

<a name="method-fluent-str-slug"></a>
#### `slug`

O método `slug` gera um "_slug_" amigável à URL a partir da string fornecida:

```php
    use Illuminate\Support\Str;

    $slug = Str::of('Laravel Framework')->slug('-');

    // laravel-framework
```

<a name="method-fluent-str-snake"></a>
#### `snake`

O método `snake` converte a string dada para o formato "_case\_sensitive_":

```php
    use Illuminate\Support\Str;

    $converted = Str::of('fooBar')->snake();

    // foo_bar
```

<a name="method-fluent-str-split"></a>
#### `split`

O método `split` divide uma string em vários elementos, utilizando um padrão regex:

```php
    use Illuminate\Support\Str;

    $segments = Str::of('one, two, three')->split('/[\s,]+/');

    // collect(["one", "two", "three"])
```

<a name="method-fluent-str-squish"></a>
#### `squish`

O método `squish` remove todos os espaços em branco estranhos de uma string, incluindo espaços em branco estranhos entre palavras:

```php
    use Illuminate\Support\Str;

    $string = Str::of('    laravel    framework    ')->squish();

    // laravel framework
```

<a name="method-fluent-str-start"></a>
#### `start`

O método `start` adiciona uma única instância do valor fornecido a uma string se ela ainda não começar com esse valor:

```php
    use Illuminate\Support\Str;

    $adjusted = Str::of('this/string')->start('/');

    // /this/string

    $adjusted = Str::of('/this/string')->start('/');

    // /this/string
```

<a name="method-fluent-str-starts-with"></a>
#### `startsWith`

O método `startsWith` determina se a string fornecida começa com o valor especificado:

```php
    use Illuminate\Support\Str;

    $result = Str::of('This is my name')->startsWith('This');

    // true
```

<a name="method-fluent-str-strip-tags"></a>
#### `stripTags`

O método `stripTags` remove todos os marcadores HTML e PHP de uma string:

```php
    use Illuminate\Support\Str;

    $result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags();

    // Taylor Otwell

    $result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags('<b>');

    // Taylor <b>Otwell</b>
```

<a name="method-fluent-str-studly"></a>
#### `studly`

O método `studly` converte a string em um `StudlyCase`:

```php
    use Illuminate\Support\Str;

    $converted = Str::of('foo_bar')->studly();

    // FooBar
```

<a name="method-fluent-str-substr"></a>
#### `substr`

O método `substr` retorna a porção da string especificada pelos parâmetros de início e tamanho fornecidos:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Laravel Framework')->substr(8);

    // Framework

    $string = Str::of('Laravel Framework')->substr(8, 5);

    // Frame
```

<a name="method-fluent-str-substrreplace"></a>
#### `substrReplace`

O método `substrReplace` substitui texto dentro de uma parte de uma string, começando na posição especificada pelo segundo argumento e substituindo o número de caracteres especificado pelo terceiro argumento. Passar `0` para o terceiro argumento do método irá inserir a string na posição especificada sem substituir nenhum dos caracteres existentes na string:

```php
    use Illuminate\Support\Str;

    $string = Str::of('1300')->substrReplace(':', 2);

    // 13:

    $string = Str::of('The Framework')->substrReplace(' Laravel', 3, 0);

    // The Laravel Framework
```

<a name="method-fluent-str-swap"></a>
#### `swap`

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
#### `take`

O método `take` retorna um número especificado de caracteres do início da cadeia:

```php
    use Illuminate\Support\Str;

    $taken = Str::of('Build something amazing!')->take(5);

    // Build
```

<a name="method-fluent-str-tap"></a>
#### `tap`

O método `tap` passa a string para o closure fornecido, permitindo que você examine e interaja com a string sem afetar a string em si. A string original é retornada pelo método `tap` independentemente do que é retornado pelo closure:

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
#### "test"

O método `test` determina se uma string corresponde ao padrão de expressão regular indicado:

```php
    use Illuminate\Support\Str;

    $result = Str::of('Laravel Framework')->test('/Laravel/');

    // true
```

<a name="method-fluent-str-title"></a>
#### "title"

O método `title` converte a frase dada para `Title Case`:

```php
    use Illuminate\Support\Str;

    $converted = Str::of('a nice title uses the correct case')->title();

    // A Nice Title Uses The Correct Case
```

<a name="method-fluent-str-to-base64"></a>
#### `toBase64()`

O método `toBase64` converte a string dada para Base64:

```php
    use Illuminate\Support\Str;

    $base64 = Str::of('Laravel')->toBase64();

    // TGFyYXZlbA==
```

<a name="method-fluent-str-trim"></a>
#### `trim`

O método `trim` corta a string dada. Diferentemente da função nativa `trim` do PHP, o método `trim` do Laravel também remove caracteres de espaço em branco unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::of('  Laravel  ')->trim();

    // 'Laravel'

    $string = Str::of('/Laravel/')->trim('/');

    // 'Laravel'
```

<a name="method-fluent-str-ltrim"></a>
#### `ltrim`

O método `ltrim` remove o lado esquerdo da string. Diferente do que acontece com a função nativa de PHP, o `ltrim` de Laravel remove também os caracteres espaços reservados unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::of('  Laravel  ')->ltrim();

    // 'Laravel  '

    $string = Str::of('/Laravel/')->ltrim('/');

    // 'Laravel/'
```

<a name="method-fluent-str-rtrim"></a>
#### `rtrim`

O método `rtrim` corta o lado direito da string fornecida. Diferentemente da função nativa `rtrim` do PHP, o método `rtrim` do Laravel também remove caracteres de espaço em branco unicode:

```php
    use Illuminate\Support\Str;

    $string = Str::of('  Laravel  ')->rtrim();

    // '  Laravel'

    $string = Str::of('/Laravel/')->rtrim('/');

    // '/Laravel'
```

<a name="method-fluent-str-ucfirst"></a>
#### `ucfirst`

O método `ucfirst` retorna a string fornecida com o primeiro caractere em maiúscula:

```php
    use Illuminate\Support\Str;

    $string = Str::of('foo bar')->ucfirst();

    // Foo bar
```
<a name="method-fluent-str-ucsplit"></a>
#### `ucsplit`

O método `ucsplit` divide a string fornecida em uma coleção por caracteres maiúsculos:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Foo Bar')->ucsplit();

    // collect(['Foo', 'Bar'])
```

<a name="method-fluent-str-unwrap"></a>
#### `unwrap`

O método `unwrap` remove as frases especificadas do começo e do final de uma determinada frase:

```php
    use Illuminate\Support\Str;

    Str::of('-Laravel-')->unwrap('-');

    // Laravel

    Str::of('{framework: "Laravel"}')->unwrap('{', '}');

    // framework: "Laravel"
```

<a name="method-fluent-str-upper"></a>
#### `upper`

O método `upper` converte a string indicada para letras maiúsculas:

```php
    use Illuminate\Support\Str;

    $adjusted = Str::of('laravel')->upper();

    // LARAVEL
```

<a name="method-fluent-str-when"></a>
#### `when`

O método `when` invoca o closure fornecido se uma condição fornecida for `true`. O closure receberá a instância de string _fluent_:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('Taylor')
                    ->when(true, function (Stringable $string) {
                        return $string->append(' Otwell');
                    });

    // 'Taylor Otwell'
```

Se necessário, você pode passar outro closure como o terceiro parâmetro para o método `when`. Este closure será executado se o parâmetro de condição for avaliado como `false`.

<a name="method-fluent-str-when-contains"></a>
#### `whenContains`

O método `whenContains` invoca o closure fornecido se a string contiver o valor fornecido. O closure receberá a instância da string _fluent_:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('tony stark')
                ->whenContains('tony', function (Stringable $string) {
                    return $string->title();
                });

    // 'Tony Stark'
```

Se necessário, você pode passar outro closure como o terceiro parâmetro para o método `when`. Este closure será executado se a string não contiver o valor fornecido.

Você também pode passar um array de valores para determinar se a string fornecida contém algum dos valores no array:

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
#### `whenContainsAll`

O método `whenContainsAll` invoca o closure fornecido se a string contiver todas as substrings fornecidas. O closure receberá a instância da string _fluent_:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('tony stark')
                    ->whenContainsAll(['tony', 'stark'], function (Stringable $string) {
                        return $string->title();
                    });

    // 'Tony Stark'
```

Se necessário, você pode passar outra função como terceiro parâmetro para o método `when`. Essa função será executada se o valor da variável `condition` avaliar como `false`.

<a name="method-fluent-str-when-empty"></a>
#### `whenEmpty`

O método `whenEmpty` chama o closure especificado se a string estiver vazia. Se o closure retornar um valor, esse valor será também retornado pelo método `whenEmpty`. Se o closure não retornar um valor, será retornada uma string de texto _fluent_:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('  ')->whenEmpty(function (Stringable $string) {
        return $string->trim()->prepend('Laravel');
    });

    // 'Laravel'
```

<a name="method-fluent-str-when-not-empty"></a>
#### `whenNotEmpty`

O método `whenNotEmpty` chama o closure indicado se a string não estiver vazia. Se o closure retornar um valor, esse valor também será retornado pelo método `whenNotEmpty`. Se o closure não retornar um valor, será retornada uma instância da string _fluent_:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('Framework')->whenNotEmpty(function (Stringable $string) {
        return $string->prepend('Laravel ');
    });

    // 'Laravel Framework'
```

<a name="method-fluent-str-when-starts-with"></a>
#### `whenStartsWith`

O método `whenStartsWith` chama o closure fornecido se a string começar com a substring fornecida. O closure recebe a instância de string _fluent_:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('disney world')->whenStartsWith('disney', function (Stringable $string) {
        return $string->title();
    });

    // 'Disney World'
```

<a name="method-fluent-str-when-ends-with"></a>
#### `whenEndsWith`,

O método `whenEndsWith` invoca o closure fornecido se a string terminar com a substring fornecida. O closure receberá a instância da string fluente:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('disney world')->whenEndsWith('world', function (Stringable $string) {
        return $string->title();
    });

    // 'Disney World'
```

<a name="method-fluent-str-when-exactly"></a>
#### `whenExactly`

O método `whenExactly` invoca o closure fornecido se a string corresponder exatamente à string fornecida. O closure receberá a instância da string fluente:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('laravel')->whenExactly('laravel', function (Stringable $string) {
        return $string->title();
    });

    // 'Laravel'
```

<a name="method-fluent-str-when-not-exactly"></a>
#### `whenNotExactly`

O método `whenNotExactly` invoca o closure fornecido se a string não corresponder exatamente à string fornecida. O closure receberá a instância de string _fluent_:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('framework')->whenNotExactly('laravel', function (Stringable $string) {
        return $string->title();
    });

    // 'Framework'
```

<a name="method-fluent-str-when-is"></a>
#### `whenIs`

O método `whenIs` invoca o closure fornecido se a string corresponder a um padrão fornecido. Asteriscos podem ser usados ​​como valores curinga. O closure receberá a instância da string _fluent_:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('foo/bar')->whenIs('foo/*', function (Stringable $string) {
        return $string->append('/baz');
    });

    // 'foo/bar/baz'
```

<a name="method-fluent-str-when-is-ascii"></a>
#### `whenIsAscii`

O método `whenIsAscii` executa o closure indicado se a string for ASCII de 7 bits. O closure recebe uma instância da string _fluent_:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('laravel')->whenIsAscii(function (Stringable $string) {
        return $string->title();
    });

    // 'Laravel'
```

<a name="method-fluent-str-when-is-ulid"></a>
#### `whenIsUlid`

O método `whenIsUlid` chama o closure indicado se a string for um ULID válido. O closure receberá a instância de string _fluent_:

```php
    use Illuminate\Support\Str;

    $string = Str::of('01gd6r360bp37zj17nxb55yv40')->whenIsUlid(function (Stringable $string) {
        return $string->substr(0, 8);
    });

    // '01gd6r36'
```

<a name="method-fluent-str-when-is-uuid"></a>
#### `whenIsUuid`

O método `whenIsUuid` chama o closure indicado se a string for um UUID válido. O closure recebe a instância de string _fluent_:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->whenIsUuid(function (Stringable $string) {
        return $string->substr(0, 8);
    });

    // 'a0a2a2d2'
```

<a name="method-fluent-str-when-test"></a>
#### `whenTest`

O método `whenTest` invoca o closure fornecido se a string corresponder à expressão regular fornecida. O closure receberá a instância de string fluente:

```php
    use Illuminate\Support\Str;
    use Illuminate\Support\Stringable;

    $string = Str::of('laravel framework')->whenTest('/laravel/', function (Stringable $string) {
        return $string->title();
    });

    // 'Laravel Framework'
```

<a name="method-fluent-str-word-count"></a>
#### ``wordCount``

O método `wordCount` retorna o número de palavras que uma string contém:

```php
use Illuminate\Support\Str;

Str::of('Hello, world!')->wordCount(); // 2
```

<a name="method-fluent-str-words"></a>
#### `words`

O método `words` limita o número de palavras em uma string. Se necessário, você pode especificar uma string adicional que será anexada à string truncada:

```php
    use Illuminate\Support\Str;

    $string = Str::of('Perfectly balanced, as all things should be.')->words(3, ' >>>');

    // Perfectly balanced, as >>>
```
