# Instalação

## Requisitos do servidor
A estrutura do Laravel possui alguns requisitos de sistema. Todos esses requisitos são atendidos pela máquina virtual do [Laravel Homestead](https://laravel.com/docs/5.8/homestead), portanto, é altamente recomendável que você use o Homestead como seu ambiente de 
desenvolvimento local do Laravel.

No entanto, se você não estiver usando o Homestead, precisará garantir que o servidor atenda aos seguintes requisitos:

+ PHP >= 7.1.3
+ BCMath PHP Extension
+ Ctype PHP Extension
+ JSON PHP Extension
+ Mbstring PHP Extension
+ OpenSSL PHP Extension
+ PDO PHP Extension
+ Tokenizer PHP Extension
+ XML PHP Extension

## Instalando o Laravel
O Laravel utiliza o Composer para gerenciar suas dependências. Portanto, antes de usar o Laravel, verifique se o Composer está instalado 
em sua máquina.

### Usando o Laravel Installer
Primeiro, faça o download do instalador do Laravel usando o Composer:
```
composer global require laravel/installer
```
Coloque o diretório bin/ do fornecedor do sistema em seu `$PATH` para que o executável do laravel possa ser localizado pelo seu sistema. 
Este diretório existe em diferentes locais, com base no seu sistema operacional; no entanto, alguns locais comuns incluem:

+ macOS e distribuições GNU/Linux: $HOME/.composer/vendor/bin
+ Windows: %USERPROFILE%\AppData\Roaming\Composer\vendor\bin

Uma vez instalado, o comando `laravel new` criará uma nova instalação do Laravel no diretório que você especificar. Por exemplo, o 
`laravel new blog` criará um diretório chamado blog contendo uma nova instalação do Laravel com todas as dependências já instaladas:

``` 
laravel new blog
```

### Composer Create-Project
Como alternativa, você também pode instalar o Laravel pelo comando do Composer `create-project` no seu terminal:

```
composer create-project --prefer-dist laravel/laravel blog "5.8.*"
```

### Servidor de Desenvolvimento Local

Se você possui o PHP instalado localmente e gostaria de usar o servidor de desenvolvimento interno do PHP para atender seu aplicativo, 
você pode usar o comando `serve` do Artisan. Este comando iniciará um servidor de desenvolvimento em `http://localhost:8000`:

```
php artisan serve
```

Opções de desenvolvimento local mais robustas estão disponíveis via [Homestead](https://laravel.com/docs/5.8/homestead) e 
[Valet](https://laravel.com/docs/5.8/valet).

## Configurações

### Diretório Public
Depois de instalar o Laravel, você deve configurar o documento raiz / do servidor da web para ser o diretório `public`. O `index.php` 
neste diretório serve como controlador frontal para todas as solicitações HTTP que entram no seu aplicativo.

### Arquivos de configuração
Todos os arquivos de configuração da estrutura do Laravel são armazenados no diretório `config`. Cada opção está documentada, portanto, 
fique à vontade para procurar nos arquivos e se familiarizar com as opções disponíveis.

### Permissões de diretório
Após a instalação do Laravel, você pode precisar configurar algumas permissões. As pastas nos diretórios `storage` e `bootstrap/cache` 
devem ser graváveis pelo servidor da Web ou o Laravel não será executado. Se você estiver usando a máquina virtual Homestead, essas 
permissões já deverão estar definidas.

### Chave do aplicativo
A próxima coisa que você deve fazer após instalar o Laravel é definir a chave do aplicativo como uma sequência aleatória. Se você 
instalou o Laravel via Composer ou o instalador do Laravel, essa chave já foi definida pelo comando `php artisan key: generate`.

Normalmente, essa sequência deve ter 32 caracteres. A chave pode ser definida no arquivo de ambiente `.env`. Se você não renomeou o 
arquivo `.env.example` para `.env`, faça isso agora. **Se a chave do aplicativo não estiver definida, suas sessões do usuário e outros 
dados criptografados não serão seguros!**.

### Configuração Adicional
O Laravel quase não precisa de outra configuração pronta para uso. Você é livre para começar a desenvolver! No entanto, você pode 
revisar o arquivo `config/app.php` e sua documentação. Ele contém várias opções, como fuso horário e local, que você pode alterar de 
acordo com seu aplicativo.

Você também pode configurar alguns componentes adicionais do Laravel, como:

+ Cache
+ Database
+ Session

## Configuração do servidor web

### URL amigáveis

#### Apache
O Laravel inclui um arquivo `public/.htaccess` que é usado para fornecer URLs sem o controlador frontal `index.php` no caminho. Antes de servir o Laravel com o Apache, ative o módulo `mod_rewrite` para que o arquivo `.htaccess` seja aceito pelo servidor.

Se o arquivo `.htaccess` fornecido com o Laravel não funcionar com a instalação do Apache, tente esta alternativa:

```
Options +FollowSymLinks -Indexes
RewriteEngine On

RewriteCond %{HTTP:Authorization} .
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]
```

#### Nginx
Se você estiver usando o Nginx, a seguinte diretiva na configuração do seu site direcionará todas as solicitações para o controlador 
frontal `index.php`:

```
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

Ao usar [Homestead](https://laravel.com/docs/5.8/homestead) ou [Valet](https://laravel.com/docs/5.8/valet), URLs amigáveis serão 
configuradas automaticamente.
