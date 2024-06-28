# Laravel Pint

<a name="introduction"></a>
## Introdução

 [Laravel Pint](https://github.com/laravel/pint) é um correutor de estilo de código PHP opiniativo para minimalistas, construído em cima do PHP-CS-Fixer e que permite garantir o estilo de codificação limpo e consistente.

 O Pint é instalado automaticamente em todas as novas aplicações Laravel para que possa utilizá-lo imediatamente. Por padrão, o Pint não requer nenhuma configuração e corrigirá os problemas de estilo de código do seu código ao seguir o estilo de codificação opinativo da Laravel.

<a name="installation"></a>
## Instalação

 O Pint está incluído nos últimos lançamentos do framework Laravel; portanto, a instalação normalmente não é necessária. No entanto, para aplicações mais antigas, você poderá instalar o Laravel Pint por meio do Composer:

```shell
composer require laravel/pint --dev
```

<a name="running-pint"></a>
## Correndo Pint

 Você pode instruir o Pint a corrigir problemas de estilo do código, invocando o binário `pint` disponível no diretório `vendor/bin` do seu projeto:

```shell
./vendor/bin/pint
```

 Você também pode executar o Pint em arquivos ou diretórios específicos:

```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```

 O Pint exibirá uma lista completa de todos os arquivos que atualizou. É possível ver mais detalhes sobre as alterações do Pint ao fornecer a opção `-v` ao executar o programa:

```shell
./vendor/bin/pint -v
```

 Se você quiser que o Pint simplesmente inspecione seu código em busca de erros sem realmente alterar os arquivos, poderá usar a opção `--test`. O Pint retornará um código de saída diferente de zero caso sejam encontrados erros no estilo do código:

```shell
./vendor/bin/pint --test
```

 Se desejar que o Pint modifique somente os arquivos com alterações não sincronizadas de acordo com o Git, você poderá usar a opção `--dirty`:

```shell
./vendor/bin/pint --dirty
```

 Se você gostaria que o Pint consertasse qualquer arquivo com erros de estilo de código, mas também saísse com um código de saída diferente de zero se houver algum erro consertado, poderá usar a opção `--repair`:

```shell
./vendor/bin/pint --repair
```

<a name="configuring-pint"></a>
## Configurando o Pint

 Conforme mencionado anteriormente, Pint não exige nenhuma configuração. No entanto, se você quiser personalizar os presets, regras ou pastas inspecionadas, poderá fazer isso criando um arquivo `pint.json` no diretório raiz do seu projeto:

```json
{
    "preset": "laravel"
}
```

 Além disso, se você quiser usar um arquivo `pint.json` de um diretório específico, poderá fornecer a opção `--config` ao invocar o Pint:

```shell
pint --config vendor/my-company/coding-style/pint.json
```

<a name="presets"></a>
### Predefinições

 Presets define um conjunto de regras que podem ser usadas para corrigir problemas do estilo do código em seu programa. Por padrão, o Pint utiliza o preset `laravel`, que corrige os problemas seguindo o estilo de codificação opinativo do Laravel. No entanto, você pode especificar um preset diferente fornecendo a opção `--preset` ao Pint:

```shell
pint --preset psr12
```

 Se desejar, você também pode definir o preset no arquivo do seu projeto `pint.json`:

```json
{
    "preset": "psr12"
}
```

 Atualmente, os presets suportados pelo Pint são: `laravel`, `per`, `psr12` e `symfony`.

<a name="rules"></a>
### Regras

 As diretrizes de estilo são orientações que o Pint usará para resolver problemas de estilo do seu código. Como mencionado anteriormente, presets são grupos predefinidos de regras, ideais para a maioria dos projetos PHP, por isso, normalmente você não precisa se preocupar com as regras individuais neles contidas.

 No entanto, se pretender, pode ativar ou desativar regras específicas no seu arquivo `pint.json`:

```json
{
    "preset": "laravel",
    "rules": {
        "simplified_null_return": true,
        "braces": false,
        "new_with_braces": {
            "anonymous_class": false,
            "named_class": false
        }
    }
}
```

 O Pint é baseado no [PHP-CS-Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer). Sendo assim, pode utilizar qualquer uma das suas regras para corrigir problemas de estilo de código no seu projeto: [Configurador PHP-CS-Fixer](https://mlocati.github.io/php-cs-fixer-configurator).

<a name="excluding-files-or-folders"></a>
### Excluindo arquivos/pastas

 Por padrão, o Pint inspecionará todos os arquivos `.php` em seu projeto, exceto aqueles localizados no diretório `vendor`. Se você deseja excluir outras pastas, poderá fazer isso usando a opção de configuração `exclude`:

```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```

 Se você deseja excluir todos os arquivos que contenham um determinado padrão de nome, poderá fazer isso usando a opção de configuração `notName`:

```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```

 Se pretender excluir um ficheiro fornecendo o caminho para o mesmo, pode fazê-lo através da opção de configuração `notPath`:

```json
{
    "notPath": [
        "path/to/excluded-file.php"
    ]
}
```

<a name="continuous-integration"></a>
## Integração contínua

<a name="running-tests-on-github-actions"></a>
### Ações do GitHub

 Para automatizar o linting do seu projeto com Laravel Pint, você pode configurar [GitHub Actions](https://github.com/features/actions) para rodar Pint sempre que um novo código for pushado no GitHub. Primeiro, certifique-se de conceder "Permissões de fluxo de trabalho" a fluxos dentro do GitHub em **Configurações > Ações > Geral > Permissões de fluxo de trabalho**. Em seguida, crie um arquivo `.github/workflows/lint.yml` com o seguinte conteúdo:

```yaml
name: Fix Code Style

on: [push]

jobs:
  lint:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: true
      matrix:
        php: [8.3]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php }}
          extensions: json, dom, curl, libxml, mbstring
          coverage: none

      - name: Install Pint
        run: composer global require laravel/pint

      - name: Run Pint
        run: pint

      - name: Commit linted files
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "Fixes coding style"
```
