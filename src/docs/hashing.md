# Hashing

<a name="introduction"></a>
## Introdução

A [facade](docs/facades) `Hash` do Laravel fornece a encriptação de senha segura do Bcrypt e Argon2 para armazenar as senhas do usuário. Se você estiver usando um dos [Kit Inicializador de Aplicação Laravel](docs/starter-kits), o Bcrypt será usado por padrão para registro e autenticação.

O bcrypt é uma ótima opção para fazer hash de senhas porque seu "fator trabalho" é ajustável, o que significa que o tempo que se leva para gerar um hash pode ser aumentado conforme a potência do hardware aumenta. Quando fazemos hash de senha, devemos ir com calma. Quanto mais tempo um algoritmo demora para fazer hash de uma senha, mais tempo os usuários maliciosos demoram para gerar a "_rainbow tables_" de todos os possíveis valores de hash de string que podem ser usados em ataques de força bruta contra aplicativos.

<a name="configuration"></a>
## Configuração

Por padrão, o Laravel utiliza o `bcrypt` como driver de hashamento ao criptografar dados. No entanto, vários outros drivers de hashamento são suportados, incluindo [Argon2](https://en.wikipedia.org/wiki/Argon2) e [argon2id](https://en.wikipedia.org/wiki/Argon2).

Você pode especificar o driver de hash da sua aplicação usando a variável de ambiente `HASH_DRIVER`. Mas se você quer personalizar todas as opções do driver de hash do Laravel, você deve publicar o arquivo de configuração completo de `hashing` usando o comando `config:publish` do Artisan.

```bash
php artisan config:publish hashing
```

<a name="basic-usage"></a>
## Uso Básico

<a name="hashing-passwords"></a>
### Criptografia de senhas

Você pode hashear uma senha chamando o método `make` da facade `Hash`:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Hash;

    class PasswordController extends Controller
    {
        /**
         * Atualize a senha do usuário.
         */
        public function update(Request $request): RedirectResponse
        {
            // Valide o novo comprimento da senha...

            $request->user()->fill([
                'password' => Hash::make($request->newPassword)
            ])->save();

            return redirect('/profile');
        }
    }
```

<a name="adjusting-the-bcrypt-work-factor"></a>
#### Ajustando o fator de trabalho do bcrypt

Se você estiver usando o algoritmo Bcrypt, o método `make` permite que você gerencie o fator de trabalho do algoritmo usando a opção `rounds`; contudo, o fator de trabalho padrão gerenciado pelo Laravel é aceitável para a maioria das aplicações.

```php
    $hashed = Hash::make('password', [
        'rounds' => 12,
    ]);
```

<a name="adjusting-the-argon2-work-factor"></a>
#### Ajustando o Fator de Trabalho do Argon 2

Se estiver usando o algoritmo Argon2, o método `make` permite gerenciar o fator de trabalho do algoritmo com as opções `memory`, `time` e `threads`; no entanto, os valores padrão gerenciados pelo Laravel são aceitáveis para a maioria das aplicações:

```php
    $hashed = Hash::make('password', [
        'memory' => 1024,
        'time' => 2,
        'threads' => 2,
    ]);
```

:::info NOTA
Para mais informações sobre essas opções, por favor, veja a documentação oficial do PHP sobre o hash de Argon (https://secure.php.net/manual/pt_BR/function.password-hash.php).

<a name="verifying-that-a-password-matches-a-hash"></a>
### Verificando se uma Senha Combina com um Hash

O método `check` fornecido pelo facade `Hash` permite verificar se uma determinada string de texto corresponde a um determinado hash.

```php
    if (Hash::check('plain-text', $hashedPassword)) {
        // As senhas correspondem...
    }
```

<a name="determining-if-a-password-needs-to-be-rehashed"></a>
### Determine se uma Senha Precisa Ser Re-escrita

O método `needsRehash` fornecido pela facade `Hash` permite que você determine se o fator de trabalho usado pelo _hasher_ mudou desde que a senha foi encriptada. Algumas aplicações escolhem executar essa verificação durante o processo de autenticação da aplicação:

```php
    if (Hash::needsRehash($hashed)) {
        $hashed = Hash::make('plain-text');
    }
```

<a name="hash-algorithm-verification"></a>
## Verificação de Algoritmos Hash

Para evitar manipulação de algoritmo de hash, o método `Hash::check` do Laravel verificará primeiro se o hash fornecido foi gerado usando o algoritmo de hash selecionado pela aplicação. Se os algoritmos forem diferentes, uma exceção `RuntimeException` será lançada.

Aqui está o comportamento esperado para a maioria das aplicações, onde o algoritmo de hash não deve ser alterado e diferentes algoritmos podem indicar um ataque malicioso. No entanto, se você precisar suportar vários algoritmos de hash dentro da sua aplicação, como quando migrando de um algoritmo para outro, você pode desativar a verificação do algoritmo de hash ao definir a variável de ambiente `HASH_VERIFY` para `false`:

```ini
HASH_VERIFY=false
```
