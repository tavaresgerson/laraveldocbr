# Laravel Pint

<a name="introduction"></a>
## Introdução

[Laravel Pint](https://github.com/laravel/pint) é um fixador de estilo de código PHP opinativo para minimalistas. O Pint é construído sobre o PHP-CS-Fixer e simplifica a garantia de que seu estilo de código permaneça limpo e consistente.

O Pint é instalado automaticamente com todos os novos aplicativos Laravel para que você possa começar a usá-lo imediatamente. Por padrão, o Pint não requer nenhuma configuração e corrigirá problemas de estilo de código em seu código seguindo o estilo de codificação opinativo do Laravel.

<a name="installation"></a>
## Instalação

O Pint está incluído em versões recentes do framework Laravel, portanto, a instalação geralmente é desnecessária. No entanto, para aplicativos mais antigos, você pode instalar o Laravel Pint via Composer:

```shell
composer require laravel/pint --dev
```

<a name="running-pint"></a>
## Executando o Pint

Você pode instruir o Pint a corrigir problemas de estilo de código invocando o binário `pint` que está disponível no diretório `vendor/bin` do seu projeto:

```shell
./vendor/bin/pint
```

Você também pode executar o Pint em arquivos ou diretórios específicos:

```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```

O Pint exibirá uma lista completa de todos os arquivos que ele atualiza. Você pode ver ainda mais detalhes sobre as alterações do Pint fornecendo a opção `-v` ao invocar o Pint:

```shell
./vendor/bin/pint -v
```

Se você quiser que o Pint simplesmente inspecione seu código em busca de erros de estilo sem realmente alterar os arquivos, você pode usar a opção `--test`. O Pint retornará um código de saída diferente de zero se algum erro de estilo de código for encontrado:

```shell
./vendor/bin/pint --test
```

Se você quiser que o Pint modifique apenas os arquivos que têm alterações não confirmadas de acordo com o Git, você pode usar a opção `--dirty`:

```shell
./vendor/bin/pint --dirty
```

Se você quiser que o Pint corrija quaisquer arquivos com erros de estilo de código, mas também saia com um código de saída diferente de zero se algum erro for corrigido, você pode usar a opção `--repair`:

```shell
./vendor/bin/pint --repair
```

<a name="configuring-pint"></a>
## Configurando o Pint

Como mencionado anteriormente, o Pint não requer nenhuma configuração. No entanto, se você deseja personalizar as predefinições, regras ou pastas inspecionadas, você pode fazer isso criando um arquivo `pint.json` no diretório raiz do seu projeto:

```json
{
    "preset": "laravel"
}
```

Além disso, se você deseja usar um `pint.json` de um diretório específico, você pode fornecer a opção `--config` ao invocar o Pint:

```shell
pint --config vendor/my-company/coding-style/pint.json
```

<a name="presets"></a>
### Predefinições

Predefinições definem um conjunto de regras que podem ser usadas para corrigir problemas de estilo de código no seu código. Por padrão, o Pint usa a predefinição `laravel`, que corrige problemas seguindo o estilo de codificação opinativo do Laravel. No entanto, você pode especificar uma predefinição diferente fornecendo a opção `--preset` para o Pint:

```shell
pint --preset psr12
```

Se desejar, você também pode definir a predefinição no arquivo `pint.json` do seu projeto:

```json
{
    "preset": "psr12"
}
```

As predefinições atualmente suportadas pelo Pint são: `laravel`, `per`, `psr12` e `symfony`.

<a name="rules"></a>
### Regras

As regras são diretrizes de estilo que o Pint usará para corrigir problemas de estilo de código no seu código. Como mencionado acima, as predefinições são grupos predefinidos de regras que devem ser perfeitos para a maioria dos projetos PHP, então você normalmente não precisará se preocupar com as regras individuais que elas contêm.

No entanto, se desejar, você pode habilitar ou desabilitar regras específicas no seu arquivo `pint.json`:

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

O Pint é construído em cima do [PHP-CS-Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer). Portanto, você pode usar qualquer uma de suas regras para corrigir problemas de estilo de código no seu projeto: [PHP-CS-Fixer Configurator](https://mlocati.github.io/php-cs-fixer-configurator).

<a name="excluding-files-or-folders"></a>
### Excluindo arquivos/pastas

Por padrão, o Pint inspecionará todos os arquivos `.php` no seu projeto, exceto aqueles no diretório `vendor`. Se desejar excluir mais pastas, você pode fazer isso usando a opção de configuração `exclude`:

```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```

Se desejar excluir todos os arquivos que contêm um determinado padrão de nome, você pode fazer isso usando a opção de configuração `notName`:

```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```

Se desejar excluir um arquivo fornecendo um caminho exato para o arquivo, você pode fazer isso usando a opção de configuração `notPath`:

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

Para automatizar o linting do seu projeto com o Laravel Pint, você pode configurar [Ações do GitHub](https://github.com/features/actions) para executar o Pint sempre que um novo código for enviado ao GitHub. Primeiro, certifique-se de conceder "permissões de leitura e gravação" para fluxos de trabalho no GitHub em **Configurações > Ações > Geral > Permissões de fluxo de trabalho**. Em seguida, crie um arquivo `.github/workflows/lint.yml` com o seguinte conteúdo:

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
