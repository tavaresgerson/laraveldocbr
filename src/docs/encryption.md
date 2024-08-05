# Criptografia

<a name="introduction"></a>
## Introdução

Os serviços de criptografia do Laravel fornecem uma interface simples e conveniente para encriptar e descriptografar texto usando o OpenSSL com AES-256 e AES-128. Todos os valores encriptados do Laravel são assinados usando um código de autenticação de mensagem (MAC), para que seu valor subjacente não possa ser modificado ou manipulado uma vez encriptado.

<a name="configuration"></a>
## Configuração

Antes de usar o encrypter do Laravel você deve definir a opção de configuração `key` em seu arquivo de configuração `config/app.php`. Este valor de configuração é influenciado pela variável de ambiente `APP_KEY`. Você deve usar o comando `php artisan key:generate` para gerar este valor, porque o comando `key:generate` irá utilizar o gerador de bytes aleatórios seguros do PHP para construir uma chave criptograficamente segura para sua aplicação. Normalmente, o valor da variável de ambiente `APP_KEY` será gerado por você durante a [instalação do Laravel](/docs/installation).

<a name="gracefully-rotating-encryption-keys"></a>
### Chaves de Criptografia Giratórias Graciosas

Se você alterar a chave de criptografia do seu aplicativo, todos os usuários autenticados serão desconectados automaticamente do seu aplicativo. Isto porque o Laravel encripta todos os cookies, incluindo os cookies de sessão. Além disso, não será mais possível descriptografar quaisquer dados que foram encriptados com sua antiga chave de criptografia.

Para mitigar esse problema, o Laravel permite que você liste suas chaves de criptografia anteriores na variável de ambiente `APP_PREVIOUS_KEYS` do seu aplicativo. Essa variável pode conter uma lista delimitada por vírgulas das suas chaves de criptografia anteriores:

```ini
APP_KEY="base64:J63qRTDLub5NuZvP+kb8YIorGS6qFYHKVo6u7179stY="
APP_PREVIOUS_KEYS="base64:2nLsGFGzyoae2ax3EF2Lyq/hH6QghBGLIq5uL+Gp8/w="
```

Quando você define esta variável de ambiente, o Laravel sempre utilizará a chave de criptografia atual ao criptografar valores. No entanto, quando os valores estão sendo descriptografados, o Laravel primeiro tentará com as chaves atuais e se a descriptografia falhar usando as chaves atuais, o Laravel tentar todas as chaves anteriores até que uma das chaves seja capaz de descriptografar o valor.

Este tipo de abordagem para descriptografar graciosamente permite que os usuários continuem usando seu aplicativo sem interrupções mesmo se sua chave de criptografia for girada.

<a name="using-the-encrypter"></a>
## Usando o Encrypter

<a name="encrypting-a-value"></a>
#### Criptografar um valor

Você pode criptografar um valor usando o `encryptString` método fornecido pela _facade_ `Crypt`. Todos os valores criptografados são criptografados com OpenSSL e o AES-256-CBC. Além disso, todos os valores criptografados são assinados com uma mensagem código de autenticação (MAC). O código integrado de autenticação de mensagens evitará a descriptografia de qualquer valor que tenha sido adulterado por usuários maliciosos:

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Crypt;

    class DigitalOceanTokenController extends Controller
    {
        /**
         * Armazene um token da API DigitalOcean para o usuário.
         */
        public function store(Request $request): RedirectResponse
        {
            $request->user()->fill([
                'token' => Crypt::encryptString($request->token),
            ])->save();

            return redirect('/secrets');
        }
    }
```

<a name="decrypting-a-value"></a>
#### Descriptografando um Valor

Você pode descriptografar valores usando o método `decryptString` fornecido pela _facade_ `Crypt`. Se o valor não puder ser decifrado adequadamente, como quando a mensagem de código de autenticação é inválida, será lançada uma exceção `Illuminate\Contracts\Encryption\DecryptException`:

```php
    use Illuminate\Contracts\Encryption\DecryptException;
    use Illuminate\Support\Facades\Crypt;

    try {
        $decrypted = Crypt::decryptString($encryptedValue);
    } catch (DecryptException $e) {
        // ...
    }
```
