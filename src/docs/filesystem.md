# Armazenamento de arquivos

<a name="introduction"></a>
## Introdução

 O Laravel fornece uma poderosa abordagem de sistema de arquivos graças ao maravilhoso pacote PHP [Flysystem](https://github.com/thephpleague/flysystem) desenvolvido por Frank de Jonge. A integração Laravel Flysystem fornece drivers simples para trabalhar com sistemas de arquivos locais, SFTP e Amazon S3. Além disso, é incrivelmente fácil alternar essas opções de armazenamento entre sua máquina de desenvolvimento local e seu servidor de produção, pois a API permanece a mesma para cada sistema.

<a name="configuration"></a>
## Configuração

 O arquivo de configuração do sistema de arquivos Laravel está localizado em `config/filesystems.php`. Nesse arquivo, você pode configurar todos os seus "discos" de sistema de arquivos. Cada disco representa um driver e uma localização específicos para armazenamento. O arquivo contém configurações exemplares de cada driver suportado para que você possa alterá-las conforme suas preferências e credenciais de armazenamento.

 O driver local interage com arquivos armazenados localmente no servidor que executa o aplicativo do Laravel, ao passo que o driver `s3` é utilizado para gravar no serviço de armazenamento na nuvem S3 da Amazon.

 > [!NOTA]
 > Pode configurar quantos discos quiser e pode ter vários discos que utilizem o mesmo driver.

<a name="the-local-driver"></a>
### O motorista local

 Ao usar o driver `local`, todas as operações de arquivo são relativas ao diretório raiz definido no arquivo de configuração `filesystems`. Por padrão, esse valor é definido como o diretório `storage/app`. Portanto, o seguinte método iria gravar em:

```python
import os

arq_origem = "example.txt"
arq_destino = "storage/app/example.txt"

# O caminho para a origem do arquivo
arq_origem_path = os.path.join(os.getcwd(), arq_origem)

# Criação do destino do arquivo
os.rename(arq_origem_path, arq_destino)
```

```php
    use Illuminate\Support\Facades\Storage;

    Storage::disk('local')->put('example.txt', 'Contents');
```

<a name="the-public-disk"></a>
### O Disco Público

 O disco `public`, incluído no arquivo de configuração do `filesystems` da sua aplicação, destina-se a ficheiros que serão de acesso público. O disco `public`, por defeito, utiliza o driver `local` e armazena os seus ficheiros em `storage/app/public`.

 Para tornar esses arquivos acessíveis da web, você deve criar um link simbólico de `public/storage` para `storage/app/public`. Utilizar esta convenção de pasta manterá seus arquivos publicamente acessíveis em uma pasta que pode ser facilmente compartilhada entre implantações quando se utilizam sistemas de implantação sem tempo de inatividade, como o [Envoyer](https://envoyer.io).

 Para criar o link simbólico, você pode usar o comando da ferramenta "Arquivô" (`storage:link`):

```shell
php artisan storage:link
```

 Uma vez que um arquivo tenha sido armazenado e o link simbólico criado, você pode criar uma URL para os arquivos usando o helper `asset`:

```php
    echo asset('storage/file.txt');
```

 Você pode configurar link simbólicos adicionais em seu arquivo de configuração `filesystems`. Cada um dos links configurados será criado ao executar o comando `storage:link`:

```php
    'links' => [
        public_path('storage') => storage_path('app/public'),
        public_path('images') => storage_path('app/images'),
    ],
```

 O comando `storage:unlink` pode ser usado para destruir os links simbólicos configurados:

```shell
php artisan storage:unlink
```

<a name="driver-prerequisites"></a>
### Requisitos prévios do driver

<a name="s3-driver-configuration"></a>
#### Configuração do driver S3

 Antes de usar o driver S3, você precisará instalar o pacote Flysystem S3 pelo gerenciador de pacotes do Composer:

```shell
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
```

 Um array de configuração de disco S3 está localizado em seu arquivo de configuração `config/filesystems.php`. Normalmente, você deve configurar suas informações e credenciais do S3 usando as variáveis de ambiente a seguir referenciadas pelo arquivo de configuração `config/filesystems.php`:

```
AWS_ACCESS_KEY_ID=<your-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=<your-bucket-name>
AWS_USE_PATH_STYLE_ENDPOINT=false
```

 Para conveniência, essas variáveis de ambiente coincidem com a convenção de nomenclatura usada pelo AWS CLI.

<a name="ftp-driver-configuration"></a>
#### Configuração do driver de FTP

 Antes de usar o driver FTP, você precisará instalar o pacote Flysystem FTP usando o gerenciador de pacotes Composer:

```shell
composer require league/flysystem-ftp "^3.0"
```

 As integrações Flysystem do Laravel funcionam muito bem com o FTP; no entanto, a configuração de exemplo não está incluída no arquivo de configuração padrão `config/filesystems.php` do framework. Se você precisar configurar um sistema de arquivos FTP, poderá usar a configuração abaixo como exemplo:

```php
    'ftp' => [
        'driver' => 'ftp',
        'host' => env('FTP_HOST'),
        'username' => env('FTP_USERNAME'),
        'password' => env('FTP_PASSWORD'),

        // Optional FTP Settings...
        // 'port' => env('FTP_PORT', 21),
        // 'root' => env('FTP_ROOT'),
        // 'passive' => true,
        // 'ssl' => true,
        // 'timeout' => 30,
    ],
```

<a name="sftp-driver-configuration"></a>
#### Configuração do driver SFTP

 Antes de usar o driver SFTP, você precisará instalar o pacote Flysystem SFTP por meio do gerenciador de pacotes Composer:

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

 As integrações Flysystem do Laravel funcionam muito bem com o SFTP; no entanto, um exemplo de configuração não está incluído na pasta de configuração padrão `config/filesystems.php` do framework. Se você precisar configurar um sistema de arquivos SFTP, poderá usar a exemplo de configuração abaixo:

```php
    'sftp' => [
        'driver' => 'sftp',
        'host' => env('SFTP_HOST'),

        // Settings for basic authentication...
        'username' => env('SFTP_USERNAME'),
        'password' => env('SFTP_PASSWORD'),

        // Settings for SSH key based authentication with encryption password...
        'privateKey' => env('SFTP_PRIVATE_KEY'),
        'passphrase' => env('SFTP_PASSPHRASE'),

        // Settings for file / directory permissions...
        'visibility' => 'private', // `private` = 0600, `public` = 0644
        'directory_visibility' => 'private', // `private` = 0700, `public` = 0755

        // Optional SFTP Settings...
        // 'hostFingerprint' => env('SFTP_HOST_FINGERPRINT'),
        // 'maxTries' => 4,
        // 'passphrase' => env('SFTP_PASSPHRASE'),
        // 'port' => env('SFTP_PORT', 22),
        // 'root' => env('SFTP_ROOT', ''),
        // 'timeout' => 30,
        // 'useAgent' => true,
    ],
```

<a name="scoped-and-read-only-filesystems"></a>
### Arquivos de sistema e somente leitura

 Os discos de escopo permitem-lhe definir um sistema de arquivos onde todos os caminhos são automaticamente preenchidos com um determinado prefixo. Antes de criar um disco de sistema de arquivos de escopo, terá de instalar um pacote Flysystem adicional através do gerenciador de pacotes Composer:

```shell
composer require league/flysystem-path-prefixing "^3.0"
```

 Você pode criar uma instância de um disco de sistema de arquivos em um escopo específico definindo um disco que utiliza o driver `scoped`. Por exemplo, você pode criar um disco que aplique um escopo a um disco existente chamado `s3` para um prefixo de caminho especifico e, então, cada operação de arquivo com seu disco aplicará o prefixo especifico:

```php
's3-videos' => [
    'driver' => 'scoped',
    'disk' => 's3',
    'prefix' => 'path/to/videos',
],
```

 Os discos com acesso exclusivo permitem criar discos de armazenamento sem permitir operações de gravação. Antes de utilizar a opção de configuração `read-only`, terá de instalar um pacote Flysystem adicional através do gerenciador de pacotes Composer:

```shell
composer require league/flysystem-read-only "^3.0"
```

 Em seguida, você pode incluir a opção de configuração `read-only` em um ou mais dos seus arranjos de disco:

```php
's3-videos' => [
    'driver' => 's3',
    // ...
    'read-only' => true,
],
```

<a name="amazon-s3-compatible-filesystems"></a>
### Arquivos Compartíveis com o Amazon S3

 Por padrão, o arquivo de configuração do seu aplicativo `filesystems` contém uma configuração de disco para o `s3`. Além disso, você poderá utilizar esse disco para interagir com o Amazon S3 ou qualquer outro serviço compatível de armazenamento de arquivos como [MinIO](https://github.com/minio/minio) ou [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/).

 Normalmente, depois de atualizar as credenciais do disco para que correspondam às credenciais do serviço que pretende utilizar, basta atualizar o valor da opção de configuração `endpoint`. O valor desta opção é normalmente definido por meio da variável ambiental `AWS_ENDPOINT`:

```php
    'endpoint' => env('AWS_ENDPOINT', 'https://minio:9000'),
```

<a name="minio"></a>
#### MinIO

 Para que a integração do Flysystem no Laravel gere URLs corretas ao usar o MinIO, você deve definir a variável de ambiente `AWS_URL` para que corresponda à URL local da aplicação e inclui o nome do bucket no caminho da URL:

```ini
AWS_URL=http://localhost:9000/local
```

 > [Aviso]
 > A geração de URLs de armazenamento temporário através do método `temporaryUrl` não é suportada quando se utiliza o MinIO.

<a name="obtaining-disk-instances"></a>
## Obtenção de instâncias de disco

 A interface `Armazenamento` permite interagir com qualquer um dos discos configurados. Por exemplo, poderá utilizar o método `put` da interface para armazenar um avatar no disco padrão. Se chamar os métodos da interface `Armazenamento` sem primeiro chamar o método `disk`, o método será passado automaticamente ao disco padrão:

```php
    use Illuminate\Support\Facades\Storage;

    Storage::put('avatars/1', $content);
```

 Se o seu aplicativo interagir com vários discos, poderá utilizar o método `disk` na interface abstrata `Storage` para trabalhar com os ficheiros num determinado disco:

```php
    Storage::disk('s3')->put('avatars/1', $content);
```

<a name="on-demand-disks"></a>
### Discos sob demanda

 Às vezes, poderá desejar criar um disco em tempo de execução com base numa configuração específica sem esta configuração estar presente no ficheiro de configurações do sistema de arquivos da aplicação. Para efetuar isto, pode enviar uma matriz de configurações para o método `build` da facade `Storage`:

```php
use Illuminate\Support\Facades\Storage;

$disk = Storage::build([
    'driver' => 'local',
    'root' => '/path/to/root',
]);

$disk->put('image.jpg', $content);
```

<a name="retrieving-files"></a>
## Recuperação de arquivos

 O método `get` pode ser usado para recuperar o conteúdo de um ficheiro. Os conteúdos do ficheiro como cadeias brutas serão devolvidos pelo método. Recordem que os caminhos de arquivo devem ser especificados relativamente à localização "raiz" do disco:

```php
    $contents = Storage::get('file.jpg');
```

 Se o arquivo que você estiver recuperando contém JSON, pode usar o método `json` para recuperar o arquivo e decodificar seu conteúdo:

```php
    $orders = Storage::json('orders.json');
```

 O método `exists` pode ser usado para determinar se um arquivo existe em disco:

```php
    if (Storage::disk('s3')->exists('file.jpg')) {
        // ...
    }
```

 O método `missing` pode ser utilizado para determinar se um arquivo está faltando no disco:

```php
    if (Storage::disk('s3')->missing('file.jpg')) {
        // ...
    }
```

<a name="downloading-files"></a>
### Baixar arquivos

 O método `download` pode ser usado para gerar uma resposta que força o navegador do usuário a baixar o arquivo no caminho indicado. O segundo argumento do método aceita um nome de arquivo, que determinará o nome do arquivo visualizado pelo usuário ao fazer o download. Por último, você pode passar um array de cabeçalhos HTTP como terceiro argumento para o método:

```php
    return Storage::download('file.jpg');

    return Storage::download('file.jpg', $name, $headers);
```

<a name="file-urls"></a>
### URLs de arquivos

 Você pode usar o método `url` para obter o URL de um determinado arquivo. Se estiver usando o driver `local`, ele irá normalmente anexar somente `/storage` ao caminho especificado e retornará um URL relativo ao arquivo. Se estiver usando o driver `s3`, será retornada a URL remota qualificada total:

```php
    use Illuminate\Support\Facades\Storage;

    $url = Storage::url('file.jpg');
```

 Ao usar o driver `local`, todos os arquivos que devem ser publicamente acessíveis devem estar no diretório `storage/app/public`. Além disso, você deve [criar um link simbólico (#disco_público)](/#the-public-disk) em `public/storage`, com o ponteiro apontando para o diretório `storage/app/public`.

 > [AVISO]
 > Ao utilizar o driver "local", o valor de retorno do campo "url" não é codificado como URL. Por essa razão, recomendamos que você armazene seus arquivos sempre com nomes que criem URLs válidas.

<a name="url-host-customization"></a>
#### Personalização do anfitrião de URL

 Caso deseje modificar o anfitrião das URLs geradas por meio da interface de programação de aplicativos Storage, você poderá adicionar ou alterar a opção url no array de configuração do disco:

```php
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
        'throw' => false,
    ],
```

<a name="temporary-urls"></a>
### Endereços temporários

 Usando o método `temporaryUrl`, você pode criar links temporários para arquivos armazenados usando o driver `s3`. Este método aceita um caminho e uma instância de `DateTime` que especificam quando a URL deve expirar:

```php
    use Illuminate\Support\Facades\Storage;

    $url = Storage::temporaryUrl(
        'file.jpg', now()->addMinutes(5)
    );
```

 Se você precisar especificar parâmetros adicionais de solicitação [S3](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests), pode passar a matriz de parâmetros da solicitação como o terceiro argumento para o método `temporaryUrl`:

```php
    $url = Storage::temporaryUrl(
        'file.jpg',
        now()->addMinutes(5),
        [
            'ResponseContentType' => 'application/octet-stream',
            'ResponseContentDisposition' => 'attachment; filename=file2.jpg',
        ]
    );
```

 Se necessitar personalizar a criação de URLs temporárias para um disco específico do armazenamento, pode utilizar o método `buildTemporaryUrlsUsing`. Por exemplo, este método pode ser útil se existir um controlador que permita fazer download de ficheiros armazenados através de um dispositivo em que normalmente não são criadas URLs temporárias. Normalmente, é recomendável chamar o método `boot` do serviço:

```php
    <?php

    namespace App\Providers;

    use DateTime;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Facades\URL;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            Storage::disk('local')->buildTemporaryUrlsUsing(
                function (string $path, DateTime $expiration, array $options) {
                    return URL::temporarySignedRoute(
                        'files.download',
                        $expiration,
                        array_merge($options, ['path' => $path])
                    );
                }
            );
        }
    }
```

<a name="temporary-upload-urls"></a>
#### URLs de upload temporárias

 > [!AVISO]
 > A capacidade de gerar URLs de upload temporários é suportada apenas pelo driver `s3`.

 Se precisar gerar um URL temporário que possa ser usado para fazer o carregamento de um arquivo diretamente da aplicação do lado do cliente, poderá utilizar a métrica `temporaryUploadUrl`. Esta métrica aceita um caminho e uma instância de `DateTime` que especificam quando o URL deverá expirar. A métrica `temporaryUploadUrl` retorna um array associativo que pode ser desagregado no URL de upload e nas cabeçalhas que devem ser incluídas com a requisição de upload:

```php
    use Illuminate\Support\Facades\Storage;

    ['url' => $url, 'headers' => $headers] = Storage::temporaryUploadUrl(
        'file.jpg', now()->addMinutes(5)
    );
```

 Esse método é útil principalmente em ambientes sem servidor, onde o aplicativo do lado do cliente deve fazer o upload de arquivos diretamente para um sistema de armazenamento em nuvem como o Amazon S3.

<a name="file-metadata"></a>
### Metadados de arquivos

 Além de ler e escrever arquivos, o Laravel também pode fornecer informações sobre os próprios arquivos. Por exemplo, o método `size` pode ser utilizado para obter o tamanho do arquivo em bytes:

```php
    use Illuminate\Support\Facades\Storage;

    $size = Storage::size('file.jpg');
```

 O método `lastModified` retorna o valor de tempo UNIX da última vez que a pasta foi modificada:

```php
    $time = Storage::lastModified('file.jpg');
```

 O tipo MIME de um determinado arquivo pode ser obtido por meio do método `mimeType`:

```php
    $mime = Storage::mimeType('file.jpg');
```

<a name="file-paths"></a>
#### Caminhos dos arquivos

 Você pode usar o método `path` para obter o caminho do arquivo. Se você estiver usando a unidade `local`, isso retornará o caminho absoluto para o arquivo. Se você estiver usando a unidade `s3`, esse método retornará o caminho relativo ao arquivo no S3 bucket:

```php
    use Illuminate\Support\Facades\Storage;

    $path = Storage::path('file.jpg');
```

<a name="storing-files"></a>
## Armazenamento de ficheiros

 O método `put` pode ser utilizado para armazenar o conteúdo de um ficheiro num disco. Você também poderá passar um recurso do PHP ao método `put`, que usará o suporte de fluxo subjacente da Flysystem. Lembre-se de que todos os caminhos de arquivo devem ser especificados de forma relativa ao local "raiz" configurado para o disco:

```php
    use Illuminate\Support\Facades\Storage;

    Storage::put('file.jpg', $contents);

    Storage::put('file.jpg', $resource);
```

<a name="failed-writes"></a>
#### Escritas com falha

 Se o método `put` (ou outras operações de escrita) não conseguirem gravar o arquivo no disco, `false` será retornado:

```php
    if (! Storage::put('file.jpg', $contents)) {
        // The file could not be written to disk...
    }
```

 Se desejar, você pode definir a opção `throw` no array de configurações do seu disco de sistema de arquivos. Quando esta opção é definida como `true`, os métodos "escrever" como o `put` arroparão uma instância de `League\Flysystem\UnableToWriteFile` quando as operações de escrita falharem:

```php
    'public' => [
        'driver' => 'local',
        // ...
        'throw' => true,
    ],
```

<a name="prepending-appending-to-files"></a>
### Inicialização e finalização de arquivos

 Os métodos prepend() e append() permitem escrever o conteúdo no início ou no final de um arquivo:

```php
    Storage::prepend('file.log', 'Prepended Text');

    Storage::append('file.log', 'Appended Text');
```

<a name="copying-moving-files"></a>
### Copiando e movendo arquivos

 O método `copy` pode ser utilizado para copiar um arquivo existente para uma nova localização no disco. Já o método `move` permite renomear ou mover um arquivo existente para uma nova localização:

```php
    Storage::copy('old/file.jpg', 'new/file.jpg');

    Storage::move('old/file.jpg', 'new/file.jpg');
```

<a name="automatic-streaming"></a>
### Transmissão automática

 O envio de arquivos para o armazenamento reduz consideravelmente a utilização da memória. Se você deseja que o Laravel gerencie automaticamente o envio em streaming de um determinado arquivo para sua localização de armazenamento, poderá usar o método `putFile` ou `putFileAs`. Este método aceita uma instância do tipo `Illuminate\Http\File` ou `Illuminate\Http\UploadedFile` e envia automaticamente o arquivo em streaming para a sua localização desejada:

```php
    use Illuminate\Http\File;
    use Illuminate\Support\Facades\Storage;

    // Automatically generate a unique ID for filename...
    $path = Storage::putFile('photos', new File('/path/to/photo'));

    // Manually specify a filename...
    $path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
```

 Há algumas informações importantes a serem observadas sobre o método `putFile`. Observe que especificamos apenas um nome de diretório e não um nome de arquivo. O método `putFile` gerará, por padrão, um ID exclusivo para servir como o nome do arquivo. A extensão do arquivo será determinada a partir do tipo MIME do arquivo. O caminho para o arquivo será retornado pelo método `putFile`, de modo que você pode armazenar o caminho, incluindo o nome exclusivo do arquivo, em sua base de dados.

 As funcionalidades `putFile` e `putFileAs` também aceitam um argumento para especificar a "visibilidade" do arquivo armazenado. Isso é especialmente útil se você estiver armazenando o arquivo em um disco em nuvem, como o Amazon S3, e pretender que o arquivo seja acessível ao público por meio de URLs gerados:

```php
    Storage::putFile('photos', new File('/path/to/photo'), 'public');
```

<a name="file-uploads"></a>
### Arquivos de upload

 Em aplicações Web, um dos casos de uso mais comuns para o armazenamento de ficheiros é o armazenamento de ficheiros enviados por utilizadores, como fotografias e documentos. O Laravel torna muito fácil o armazenamento de ficheiros enviados através da utilização do método `store` numa instância de ficheiro submetido. Chame o método `store` com o caminho onde pretende que seja armazenado o ficheiro submetido:

```php
    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Http\Request;

    class UserAvatarController extends Controller
    {
        /**
         * Update the avatar for the user.
         */
        public function update(Request $request): string
        {
            $path = $request->file('avatar')->store('avatars');

            return $path;
        }
    }
```

 Existem algumas informações importantes a serem destacadas nesse exemplo. Note que especificamos apenas um nome de diretório, e não um nome de arquivo. Por padrão, o método `store` gera um ID exclusivo para ser usado como nome do arquivo. A extensão do arquivo será determinada examinando seu tipo MIME. O caminho completo até o arquivo será retornado pelo método `store`, que pode ser armazenado em sua base de dados, incluindo o nome de arquivo gerado automaticamente.

 Também é possível chamar o método `putFile` na faca "Storage" para executar a mesma operação de armazenamento de arquivo que acima no exemplo:

```php
    $path = Storage::putFile('avatars', $request->file('avatar'));
```

<a name="specifying-a-file-name"></a>
#### Especificando um Nome de Ficheiro

 Se você não quiser que um nome de arquivo seja atribuído automaticamente ao seu arquivo armazenado, é possível usar o método `storeAs`, que recebe como argumentos o caminho, o nome do arquivo e (opcionalmente) o disco:

```php
    $path = $request->file('avatar')->storeAs(
        'avatars', $request->user()->id
    );
```

 Também é possível usar o método `putFileAs` na interface de programa de armazenamento, que realiza a mesma operação de armazenamento de arquivos do exemplo acima:

```php
    $path = Storage::putFileAs(
        'avatars', $request->file('avatar'), $request->user()->id
    );
```

 > [!ATENÇÃO]
 > Caracteres unicode inválidos ou não imprimíveis serão automaticamente removidos dos caminhos de arquivos. Por isso, você poderá querer sanitizar seus caminhos antes de passá-los aos métodos de armazenamento de arquivo do Laravel. Os caminhos são normalizados usando o método `League\Flysystem\WhitespacePathNormalizer::normalizePath`.

<a name="specifying-a-disk"></a>
#### Especificação de um disco

 Por padrão, o método "store" desse arquivo carregado irá usar seu disco padrão. Se você preferir especificar outro disco, passe-o como segundo argumento ao método "store":

```php
    $path = $request->file('avatar')->store(
        'avatars/'.$request->user()->id, 's3'
    );
```

 Se você estiver usando o método `storeAs`, pode passar como terceiro argumento o nome do disco:

```php
    $path = $request->file('avatar')->storeAs(
        'avatars',
        $request->user()->id,
        's3'
    );
```

<a name="other-uploaded-file-information"></a>
#### Outras informações sobre o ficheiro enviado

 Para obter o nome e a extensão originais do arquivo enviado, use os métodos `getClientOriginalName` e `getClientOriginalExtension`:

```php
    $file = $request->file('avatar');

    $name = $file->getClientOriginalName();
    $extension = $file->getClientOriginalExtension();
```

 No entanto, tenha em atenção que as métodos `getClientOriginalName` e `getClientOriginalExtension` são considerados não seguros, uma vez que o nome do ficheiro e a sua extensão podem ser adulteradas por um utilizador malicioso. Por este motivo, deve preferir normalmente os métodos `hashName` e `extension` para obter um nome e uma extensão para a submissão de arquivos:

```php
    $file = $request->file('avatar');

    $name = $file->hashName(); // Generate a unique, random name...
    $extension = $file->extension(); // Determine the file's extension based on the file's MIME type...
```

<a name="file-visibility"></a>
### Visibilidade de arquivos

 Na integração Flysystem do Laravel, "visibility" é uma abstração de permissões de arquivos em várias plataformas. Os arquivos podem ser declarados como `public` ou `private`. Quando um arquivo é declarado como `public`, você está indicando que o arquivo geralmente deve ser acessível para outros usuários. Por exemplo, ao usar o driver S3, você pode recuperar URLs de arquivos públicos.

 Você pode definir a visibilidade ao escrever o arquivo através do método `put`:

```php
    use Illuminate\Support\Facades\Storage;

    Storage::put('file.jpg', $contents, 'public');
```

 Se o arquivo já tiver sido armazenado, a sua visibilidade pode ser recuperada e definida através dos métodos `getVisibility` e `setVisibility`:

```php
    $visibility = Storage::getVisibility('file.jpg');

    Storage::setVisibility('file.jpg', 'public');
```

 Ao interagir com arquivos enviados, você pode usar os métodos `storePublicly` e `storePubliclyAs` para armazenar o arquivo enviado com visibilidade pública:

```php
    $path = $request->file('avatar')->storePublicly('avatars', 's3');

    $path = $request->file('avatar')->storePubliclyAs(
        'avatars',
        $request->user()->id,
        's3'
    );
```

<a name="local-files-and-visibility"></a>
#### Arquivos locais e visibilidade

 Quando o driver "local" é utilizado, a visibilidade pública [visibilidade de arquivos (#file-visibility)](/pt/config/env_vars/FILE_VISIBILITY) se traduz em permissões `0755` para diretórios e `0644` para ficheiros. Pode modificar as correspondências das permissões no arquivo de configuração "filesystems" da aplicação:

```php
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app'),
        'permissions' => [
            'file' => [
                'public' => 0644,
                'private' => 0600,
            ],
            'dir' => [
                'public' => 0755,
                'private' => 0700,
            ],
        ],
        'throw' => false,
    ],
```

<a name="deleting-files"></a>
## Excluindo arquivos

 O método `delete` aceita um nome de arquivo único ou uma matriz de nomes de arquivos para exclusão:

```php
    use Illuminate\Support\Facades\Storage;

    Storage::delete('file.jpg');

    Storage::delete(['file.jpg', 'file2.jpg']);
```

 Se necessário, você pode especificar o disco do qual os ficheiros devem ser apagados:

```php
    use Illuminate\Support\Facades\Storage;

    Storage::disk('s3')->delete('path/file.jpg');
```

<a name="directories"></a>
## Diretórios

<a name="get-all-files-within-a-directory"></a>
#### Recuperar todos os ficheiros numa pasta

 O método `files` retorna um array de todos os arquivos num determinado diretório. Se pretender obter uma lista com todos os ficheiros num determinado diretório incluindo subdiretorios, poderá utilizar o método `allFiles`:

```php
    use Illuminate\Support\Facades\Storage;

    $files = Storage::files($directory);

    $files = Storage::allFiles($directory);
```

<a name="get-all-directories-within-a-directory"></a>
#### Obter todas as pastas dentro de uma pasta

 O método `diretories` retorna um conjunto de todas as pastas existentes num determinado diretório. Além disso, pode utilizar o método `allDirectories` para obter uma lista das pastas existentes num determinado diretório e de todos os sub-diretórios:

```php
    $directories = Storage::directories($directory);

    $directories = Storage::allDirectories($directory);
```

<a name="create-a-directory"></a>
#### Criar um Diretório

 O método `makeDirectory` irá criar o diretório especificado, incluindo quaisquer sub-diretorios necessários:

```php
    Storage::makeDirectory($directory);
```

<a name="delete-a-directory"></a>
#### Excluir uma pasta

 Por último, pode utilizar o método `deleteDirectory` para remover uma pasta e todos os seus ficheiros:

```php
    Storage::deleteDirectory($directory);
```

<a name="testing"></a>
## Testando

 O método `fake` da faceta `Storage` permite que você gerencie facilmente um disco falso que, combinado com as ferramentas de geração de arquivo da classe `Illuminate\Http\UploadedFile`, simplifica consideravelmente o teste do carregamento de arquivos. Por exemplo:

```php tab=Pest
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('albums can be uploaded', function () {
    Storage::fake('photos');

    $response = $this->json('POST', '/photos', [
        UploadedFile::fake()->image('photo1.jpg'),
        UploadedFile::fake()->image('photo2.jpg')
    ]);

    // Assert one or more files were stored...
    Storage::disk('photos')->assertExists('photo1.jpg');
    Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

    // Assert one or more files were not stored...
    Storage::disk('photos')->assertMissing('missing.jpg');
    Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

    // Assert that a given directory is empty...
    Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_albums_can_be_uploaded(): void
    {
        Storage::fake('photos');

        $response = $this->json('POST', '/photos', [
            UploadedFile::fake()->image('photo1.jpg'),
            UploadedFile::fake()->image('photo2.jpg')
        ]);

        // Assert one or more files were stored...
        Storage::disk('photos')->assertExists('photo1.jpg');
        Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

        // Assert one or more files were not stored...
        Storage::disk('photos')->assertMissing('missing.jpg');
        Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

        // Assert that a given directory is empty...
        Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');
    }
}
```

 Por padrão, o método `fake` irá excluir todos os arquivos em seu diretório temporário. Se você deseja manter esses arquivos, poderá usar o método "persistentFake". Para mais informações sobre testes de upload de arquivo, consulte a documentação de [teste de HTTP referente aos uploads de arquivos](/docs/http-tests#testing-file-uploads).

 > [!AVISO]
 [Ferramenta de extensão de GD (em inglês)](https://www.php.net/manual/en/book.image.php).

<a name="custom-filesystems"></a>
## Sistemas de arquivos personalizados

 A integração de Flysystem do Laravel providencia suporte para vários "driver" por defeito; contudo, o Flysystem não se limita a estes e tem adaptadores para muitos outros sistemas de armazenamento. Pode criar um driver personalizado caso pretenda utilizar um destes adaptadores adicionais na sua aplicação Laravel.

 Para definir um sistema de arquivos personalizado, você precisará de um adaptador Flysystem. Vamos adicionar um adaptador do Dropbox gerenciado pela comunidade ao nosso projeto:

```shell
composer require spatie/flysystem-dropbox
```

 Em seguida, você pode registrar o driver dentro do método `boot` de um dos [fornecedores de serviços da sua aplicação](/docs/providers). Para isso, use o método `extend` da facada `Storage`:

```php
    <?php

    namespace App\Providers;

    use Illuminate\Contracts\Foundation\Application;
    use Illuminate\Filesystem\FilesystemAdapter;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\ServiceProvider;
    use League\Flysystem\Filesystem;
    use Spatie\Dropbox\Client as DropboxClient;
    use Spatie\FlysystemDropbox\DropboxAdapter;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Register any application services.
         */
        public function register(): void
        {
            // ...
        }

        /**
         * Bootstrap any application services.
         */
        public function boot(): void
        {
            Storage::extend('dropbox', function (Application $app, array $config) {
                $adapter = new DropboxAdapter(new DropboxClient(
                    $config['authorization_token']
                ));

                return new FilesystemAdapter(
                    new Filesystem($adapter, $config),
                    $adapter,
                    $config
                );
            });
        }
    }
```

 O primeiro argumento do método `extend` é o nome do driver, e o segundo um closurável que recebe as variáveis `$app` e `$config`. Esse closurável deve retornar uma instância de `Illuminate\Filesystem\FilesystemAdapter`. A variável `$config` contém os valores definidos em `config/filesystems.php` para o disco especificado.

 Após a criação e registro do prestador de serviços da extensão, pode utilizar o controlador `dropbox` no seu arquivo de configuração `config/filesystems.php`.
