# Funcionamento com hashing

<a name="introduction"></a>
## Introdução

 O `Hash` Laravel [facade] (http://laravel.com/docs/5.0/facades) oferece a funcionalidade de hashing segura Bcrypt e Argon2 para armazenamento de senhas do usuário. Se você estiver usando um dos [kits iniciais da aplicação Laravel] (http://laravel.com/docs/5.0/starter-kits), o Bcrypt será usado por padrão para cadastro e autenticação.

 O Bcrypt é uma excelente escolha para criptografar senhas porque o seu "fator de trabalho" é ajustável, o que significa que o tempo necessário para gerar um hash pode ser aumentado à medida que o poder do hardware aumenta. Quando se trata de criptografia de senhas, lentidão é positiva. Quanto mais demorado for um algoritmo na criação de um hash, maior será a dificuldade dos utilizadores mal-intencionados em gerar "tabelas arco-íris" de todos os valores possíveis da string hash que poderiam ser usadas nos ataques brutos contra as aplicações.

<a name="configuration"></a>
## Configuração

 Por padrão, o Laravel usa o driver de hashing `bcrypt` para gerar hashes de dados. No entanto, existem vários outros drivers de hashing suportados, incluindo [`argon`](https://en.wikipedia.org/wiki/Argon2) e [`argon2id`](https://en.wikipedia.org/wiki/Argon2).

 Você pode especificar o driver de hashing da aplicação usando a variável de ambiente `HASH_DRIVER`. Mas se você quiser personalizar todas as opções do driver de hashing do Laravel, publique o arquivo de configuração completo "hashing" usando o comando Artisan `config:publish`:

```bash
php artisan config:publish hashing
```

<a name="basic-usage"></a>
## Uso Básico

<a name="hashing-passwords"></a>
### Comentários de senhas

 Você pode criptografar uma senha chamando o método `make` na fachada `Hash`:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Hash;

    class PasswordController extends Controller
    {
        /**
         * Update the password for the user.
         */
        public function update(Request $request): RedirectResponse
        {
            // Validate the new password length...

            $request->user()->fill([
                'password' => Hash::make($request->newPassword)
            ])->save();

            return redirect('/profile');
        }
    }
```

<a name="adjusting-the-bcrypt-work-factor"></a>
#### Ajustar o fator de trabalho do Bcrypt

 Se você estiver usando o algoritmo Bcrypt, a método `make` permite gerenciar o fator de trabalho do algoritmo utilizando a opção `rounds`. No entanto, o fator de trabalho padrão administrado pelo Laravel é aceitável para a maioria dos aplicativos:

```php
    $hashed = Hash::make('password', [
        'rounds' => 12,
    ]);
```

<a name="adjusting-the-argon2-work-factor"></a>
#### Ajustar o fator de trabalho do Argon2

 Se você estiver usando o algoritmo Argon2, a função make permite que gere o fator de trabalho do algoritmo usando as opções memory, time e threads; no entanto, os valores padrão administrados pelo Laravel são aceitáveis para a maioria dos aplicativos:

```php
    $hashed = Hash::make('password', [
        'memory' => 1024,
        'time' => 2,
        'threads' => 2,
    ]);
```

 > [!NOTA]
 [Documentação oficial do PHP sobre a função de hashing Argon](https://secure.php.net/manual/pt_BR/function.password-hash.php).

<a name="verifying-that-a-password-matches-a-hash"></a>
### Verificação de se uma senha coincide com um hash

 O método `check`, fornecido pela fachada `Hash`, permite verificar se uma determinada cadeia de texto plano corresponde a um determinado hash:

```php
    if (Hash::check('plain-text', $hashedPassword)) {
        // The passwords match...
    }
```

<a name="determining-if-a-password-needs-to-be-rehashed"></a>
### Determinar se uma senha precisa ser reprocessada

 O método `needsRehash`, fornecido pela interface de trabalho `Hash`, permite determinar se o fator de trabalho usado pelo algoritmo de criptografia foi alterado desde que a senha foi transformada. Em alguns casos, as aplicações realizam esta verificação durante o processo de autenticação da aplicação:

```php
    if (Hash::needsRehash($hashed)) {
        $hashed = Hash::make('plain-text');
    }
```

<a name="hash-algorithm-verification"></a>
## Verificação de algoritmo de hash

 Para impedir uma manipulação do algoritmo de hashing, o método Laravel `Hash::check` verifica se o hash fornecido foi gerado usando o algoritmo de hashing selecionado pela aplicação. Se os algoritmos forem diferentes, será lançada uma exceção `RuntimeException`.

 Este é o comportamento esperado para a maioria dos aplicativos. Não se deve esperar que o algoritmo de hashing mude e diferentes algoritmos podem indicar um ataque malicioso. No entanto, se for necessário suportar vários algoritmos hash dentro da aplicação, como na migração de um para outro, você pode desativar a verificação do algoritmo hash ao definir a variável de ambiente `HASH_VERIFY` para `false`:

```ini
HASH_VERIFY=false
```
