# Banco de dados: Semeamento

<a name="introduction"></a>
## Introdução

Laravel inclui a capacidade de semeia o seu banco de dados com dados usando as classes de sementeira. Todas as classes de sementeiras são armazenadas na pasta "database/seeders". Por padrão, uma classe de DatabaseSeeder é definida para você. A partir desta classe, você pode usar o método "call" para executar outras classes de sementeira, permitindo que você controle a ordem da semeia.

> [NOTA]
> [Proteção de atribuição em massa](/docs/eloquent#mass-assignment) é automaticamente desativado durante o plantio do banco de dados.

<a name="writing-seeders"></a>
## Redirecionamento de sementes

Para gerar um "Seeder", execute o comando 'make:seeder' [Comando do Artisan] . Todos os "Seeders" gerados pelo framework serão colocados na pasta 'database/seeders':

```shell
php artisan make:seeder UserSeeder
```

Uma classe semente contém apenas um método por padrão: "run". Este método é chamado quando o comando "db:seed" [Artisan command] é executado. Dentro do método "run", você pode inserir dados em seu banco de dados como quiser. Você pode usar o [query builder] para inserir dados manualmente ou usar o [Eloquent model factories].

Como exemplo vamos modificar a classe padrão 'DatabaseSeeder' e adicionar um comando de inserção de banco de dados no método 'run':

```php
    <?php

    namespace Database\Seeders;

    use Illuminate\Database\Seeder;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Support\Str;

    class DatabaseSeeder extends Seeder
    {
        /**
         * Run the database seeders.
         */
        public function run(): void
        {
            DB::table('users')->insert([
                'name' => Str::random(10),
                'email' => Str::random(10).'@example.com',
                'password' => Hash::make('password'),
            ]);
        }
    }
```

> (!NOTA)
> Você pode especificar qualquer dependência necessária dentro da assinatura do método "run". Eles serão automaticamente resolvidos via o contêiner de serviços do Laravel [docs / container].

<a name="using-model-factories"></a>
### Usando Model Factory

Claro, especificar manualmente os atributos para cada semente de modelo é um trabalho trabalhoso. Em vez disso, você pode usar [fábricas de modelos] ( /docs /eloquent - fábricas ) para gerar conveniente grandes quantidades de registros do banco de dados . Primeiro , revise a documentação da [fábrica de modelos] ( /docs /eloquent - fábricas ) para aprender como definir suas fábricas .

Por exemplo, vamos criar 50 usuários, cada um com uma publicação relacionada:

```php
    use App\Models\User;

    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        User::factory()
                ->count(50)
                ->hasPosts(1)
                ->create();
    }
```

<a name="calling-additional-seeders"></a>
### Chamando os semeadores extras!

Dentro da classe DatabaseSeeder, você pode usar o método call para executar as classes adicionais de sementes. Usando o método call permite-se dividir seu processo de banco de dados em vários arquivos para que nenhuma classe de sementes se torne muito grande. O método call aceita uma matriz das classes de sementes a serem executadas:

```php
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            PostSeeder::class,
            CommentSeeder::class,
        ]);
    }
```

<a name="muting-model-events"></a>
### Ajuste de Níveis Sonoros

Ao gerar sementes, você pode querer impedir que os modelos enviem eventos. Você pode fazer isso usando o atributo `WithoutModelEvents`. Quando usado, o atributo garante que nenhum evento de modelo é enviado, mesmo se as classes de semente adicionais forem executadas via o método `call`:

```php
    <?php

    namespace Database\Seeders;

    use Illuminate\Database\Seeder;
    use Illuminate\Database\Console\Seeds\WithoutModelEvents;

    class DatabaseSeeder extends Seeder
    {
        use WithoutModelEvents;

        /**
         * Run the database seeders.
         */
        public function run(): void
        {
            $this->call([
                UserSeeder::class,
            ]);
        }
    }
```

<a name="running-seeders"></a>
## Semeadores de plantio a jato

Você pode executar o Artisan comando db:seed para semente seu banco de dados. Por padrão, o comando db:seed executa a classe Database\Seeders\DatabaseSeeder, que por sua vez pode invocar outras classes de sementes. No entanto, você pode usar o parâmetro --class para especificar uma classe de semente específica para executar individualmente:

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```

Você também pode semente seu banco de dados usando o comando 'migrate:fresh' em combinação com a opção --seed, que vai fazer um reset completo em todas as tabelas e reexecutar todas as suas migrações. Esse comando é útil para reconstruir completamente seu banco de dados. A opção --seeder pode ser usada para especificar um seeder específico para executar.

```shell
php artisan migrate:fresh --seed

php artisan migrate:fresh --seed --seeder=UserSeeder 
```

<a name="forcing-seeding-production"></a>
#### Forçando os semeadores a rodar na produção

Algumas operações de sementeamento podem lhe fazer alterar ou perder dados. Para proteger você de executar comandos de sementeamento em seu banco de produção, será solicitado que confirme antes da execução dos sementeiros no ambiente 'production'. Para forçar os sementeadores a serem executados sem um prompt, utilize o parâmetro `--force`:

```shell
php artisan db:seed --force
```
