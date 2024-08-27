# Laravel Pint

<a name="introduction"></a>
## Introdução

Laravel Pint (https://github.com/laravel/pint) é um PHP code style fixer opinado para minimalistas. O Pint foi construído sobre o PHP-CS-Fixer e torna simples garantir que seu estilo de codificação permaneça limpo e consistente.

Pint é automaticamente instalado com todas as aplicações Laravel novas para que você possa começar a utilizá-lo imediatamente. Por padrão, Pint não exige nenhuma configuração e irá consertar problemas de estilo de código em seu código seguindo o estilo de codificação do Laravel.

<a name="installation"></a>
## Instalação

O Pint está incluído nas últimas versões do framework Laravel, então a instalação é tipicamente desnecessária. Contudo, para aplicações mais antigas, você pode instalar o Laravel Pint através do Composer:

```shell
composer require laravel/pint --dev
```

<a name="running-pint"></a>
## Correr Pint

Você pode instruir o Pint a corrigir problemas com o estilo do código invocando o binário `pint` que está disponível no diretório `vendor/bin` do seu projeto.

```shell
./vendor/bin/pint
```

Você também pode executar o Pint em arquivos ou diretórios específicos:

```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```

Pint vai exibir uma lista completa de todos os arquivos que ele atualiza. Você pode visualizar ainda mais detalhes sobre as mudanças do Pint fornecendo a opção `-v` ao invocar o Pint:

```shell
./vendor/bin/pint -v
```

Se você quer que o PINT inspecione simplesmente seu código em busca de erros de estilo sem realmente alterar os arquivos, você pode usar a opção `--test`. O PINT retornará um código de saída não zero se forem encontradas alguma erros de estilo do código.

```shell
./vendor/bin/pint --test
```

Se você quiser que o Pint só altere arquivos com alterações não confirmadas de acordo com o Git, pode usar a opção `--dirty`:

```shell
./vendor/bin/pint --dirty
```

Se você gostaria que o Pint corrigisse arquivos com erros de estilo de código mas também saísse com um código de saída não zero se houver algum erro, você pode usar a opção `--repair`:

```shell
./vendor/bin/pint --repair
```

<a name="configuring-pint"></a>
## Configurando Pint

Como mencionado anteriormente, não há nenhuma configuração necessária para Pint. No entanto, se você deseja personalizar os ajustes padrão, regras ou pastas inspecionadas, você pode fazê-lo criando um arquivo `pint.json` na pasta raiz do seu projeto:

```json
{
    "preset": "laravel"
}
```

Além disso, se você quiser usar um arquivo 'pint.json' de um diretório específico, pode fornecer a opção '--config' ao invocar o Pint:

```shell
pint --config vendor/my-company/coding-style/pint.json
```

<a name="presets"></a>
### Configurações pré-definidas

Os presets definem um conjunto de regras que podem ser usadas para corrigir problemas de estilo de código em seu código. Por padrão, o Pint usa o preset 'laravel', que corrige os problemas seguindo o estilo de codificação do Laravel. No entanto, você pode especificar um preset diferente fornecendo a opção ' --preset' ao Pint:

```shell
pint --preset psr12
```

Se quiser, também é possível configurar o preset em seu arquivo `pinta.json`:

```json
{
    "preset": "psr12"
}
```

Os presets suportados pelo Pint atualmente são: `laravel`, `per`, `psr12` e `symfony`.

<a name="rules"></a>
### Regras

As regras são diretrizes de estilo que o Pint utilizará para corrigir problemas de código no seu projeto. Como mencionado acima, os modelos pré-definidos são grupos de regras pré-definidas que devem ser perfeitas para a maioria dos projetos PHP, então geralmente não se precisará se preocupar com as regras individuais que eles contêm.

No entanto, se desejar, você pode ativar ou desativar regras específicas em seu arquivo "pint.json":

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

O Pint é construído sobre [PHP-CS-Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer). Portanto, você pode usar qualquer uma de suas regras para corrigir problemas de estilo de código no seu projeto: [PHP-CS-Fixer Configurator](https://mlocati.github.io/php-cs-fixer-configurator).

<a name="excluding-files-or-folders"></a>
### Excluindo Arquivos e Pastas

Por padrão, o Pint inspeciona todos os arquivos `*.php` em seu projeto, exceto aqueles na pasta `vendor`. Se você deseja excluir mais pastas, você pode fazer isso usando a opção de configuração `excluir`:

```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```

Se você deseja excluir todos os arquivos que contêm um determinado nome de padrão, você pode fazer isso usando o parâmetro de configuração `notName`:

```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```

Se você quiser excluir um arquivo fornecendo um caminho exato para o arquivo, você pode fazer isso usando a opção de configuração 'notPath':

```json
{
    "notPath": [
        "path/to/excluded-file.php"
    ]
}
```

<a name="continuous-integration"></a>
## Integração Contínua

<a name="running-tests-on-github-actions"></a>
### Ações do GitHub

Para automatizar o linting do seu projeto com Laravel Pint, você pode configurar [Ações do GitHub](https://github.com/features/actions) para executar Pint sempre que um novo código é enviado ao GitHub. Primeiro, certifique-se de conceder "Permissões de leitura e gravação" a fluxos de trabalho dentro do GitHub em **Configurações > Ações > Geral > Permissões de fluxo de trabalho**. Em seguida, crie um arquivo ` .github/workflows/lint.yml` com o seguinte conteúdo:

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
