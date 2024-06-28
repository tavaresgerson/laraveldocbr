# Criptografia

<a name="introduction"></a>
## Introdução

 Os serviços de criptografia do Laravel fornecem uma interface simples e conveniente para criptografar e descriptografar texto por meio do OpenSSL, usando as criptografias AES-256 e AES-128. Todos os valores encriptados pelo Laravel são assinados utilizando um código de autenticação de mensagens (MAC), para que o seu valor subjacente não possa ser modificado ou adulterado, uma vez encriptados.

<a name="configuration"></a>
## Configuração

 Antes de usar o encriptador do Laravel, você deve definir a opção de configuração `key` no arquivo de configuração `config/app.php`. Esse valor é gerado pela variável ambiente `APP_KEY`. Você deve usar o comando `php artisan key:generate` para gerar este valor, pois o comando `key:generate` usará o gerador seguro de bytes do PHP para criar uma chave segura para sua aplicação. Normalmente, a variável ambiente `APP_KEY` é gerada automaticamente durante a instalação do Laravel.

<a name="gracefully-rotating-encryption-keys"></a>
### Geração de chaves de criptografia com giro elegante

 Se você alterar a chave de criptografia do seu aplicativo, todas as sessões autenticadas do usuário serão desconectadas do seu aplicativo porque todos os cookies, inclusive os cookies de sessão, são encriptados por Laravel. Além disso, não será mais possível descriptografar quaisquer dados que tenham sido encriptados com sua chave de criptografia anterior.

 Para minimizar este problema, o Laravel permite-lhe indicar as suas chaves de encriptação anteriores na variável de ambiente `APP_PREVIOUS_KEYS` da aplicação. Esta variável pode conter uma lista com vírgula entre as várias chaves de encriptação anteriores:

```ini
APP_KEY="base64:J63qRTDLub5NuZvP+kb8YIorGS6qFYHKVo6u7179stY="
APP_PREVIOUS_KEYS="base64:2nLsGFGzyoae2ax3EF2Lyq/hH6QghBGLIq5uL+Gp8/w="
```

 Quando você define esta variável de ambiente, o Laravel usará sempre a chave de cifragem "atual" para cifrar valores, mas, ao descifrar valores, o Laravel tentará primeiro a chave atual e se o processo de descifragem falhar com essa chave, o Laravel testará todas as chaves anteriores até que uma das chaves consiga descifrar o valor.

 Essa abordagem de descriptografia elegante permite que os usuários continuem utilizando seu aplicativo sem interrupções, mesmo se sua chave de criptografia tiver sido alterada.

<a name="using-the-encrypter"></a>
## Usando o Gerenciador de senhas

<a name="encrypting-a-value"></a>
#### Encriptação de um valor

 Pode criptografar um valor utilizando o método `encryptString`, fornecido pela fachada `Crypt`. Todos os valores são encriptados usando a cifra AES-256-CBC, e assinado com um código de autenticação de mensagens (MAC). O código de autenticação integrado impedirá a decodificação dos valores alterados por utilizadores maliciosos.

```php
    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Crypt;

    class DigitalOceanTokenController extends Controller
    {
        /**
         * Store a DigitalOcean API token for the user.
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
#### Decodificar um valor

 Você pode descriptografar valores usando o método `decryptString`, fornecido pela faca do `Crypt`. Se um valor não puder ser descritografado adequadamente, tal como quando a chave de autenticação do mensagem estiver inválida, uma `Illuminate\Contracts\Encryption\DecryptException` (Exceção de Descriptografia) será lançada:

```php
    use Illuminate\Contracts\Encryption\DecryptException;
    use Illuminate\Support\Facades\Crypt;

    try {
        $decrypted = Crypt::decryptString($encryptedValue);
    } catch (DecryptException $e) {
        // ...
    }
```
