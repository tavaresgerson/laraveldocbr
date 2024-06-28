# Base de dados: Semeando

<a name="introduction"></a>
## Introdução

 O Laravel inclui a capacidade de ativar sua base de dados com dados usando classes de sementes. Todas as classes de sementes são armazenadas no diretório `database/seeders`. Por padrão, uma classe `DatabaseSeeder` é definida para você. A partir dessa classe, você pode usar o método `call` para executar outras classes de sementes, permitindo que controle a ordem de sementeamento.

 > [!NOTA]
 A proteção contra atribuições em massa (/docs/eloquent#mass-assignment) é automaticamente desativada durante o início de dados do banco de dados.

<a name="writing-seeders"></a>
## Escritor de Sementes

 Para gerar um seeder, execute o comando `make:seeder`. Todos os seaders gerados pelo framework serão colocados no diretório `database/seeders`:

```shell
php artisan make:seeder UserSeeder
```

 Por padrão, uma classe de semente contém apenas um método: `run`. Esse método é chamado quando o comando [Artisan comandos] (/docs/artisan) é executado. Dentro do método `run`, você pode inserir dados na sua base de dados da maneira que quiser. Você pode usar o [construtor de consultas] (/docs/queries) para inserir manualmente os dados ou usar os fatorias [de modelo Eloquent] (/docs/eloquent-factories).

 Como exemplo, vamos modificar o seeder padrão `DatabaseSeeder` e adicionar uma instrução de inserção no método `run`:

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

 > [!AVISO]
 [ container de serviço] (/)

<a name="using-model-factories"></a>
### Usando ferramentas de fábrica de modelos

 Claro que especificar manualmente os atributos para cada semente de modelo é demorado. Em vez disso, você pode usar as [fabricas do modelo](/docs/eloquent-factories) para gerar convenientemente grandes quantidades de registros no banco de dados. Primeiro, reveja a documentação da [fabrica do modelo] (/) para saber como definir suas fabrias.

 Por exemplo, vamos criar 50 usuários que cada um tem uma publicação relacionada:

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
### Chamando semeadeiras adicionais

 No decorrer da classe `DatabaseSeeder`, você pode usar a metodologia `call` para executar outras classes de semente. O uso da metodologia `call` permite que você organize o processo de semente de banco de dados em vários arquivos, evitando que qualquer classe seja muito grande; a metodologia `call` aceita uma matriz com as classes que devem ser executadas:

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
### Silenciando eventos do modelo

 Enquanto está a executar as sementes, pode pretender impedir que os modelos enviem eventos. Pode conseguir isso utilizando a tração `WithoutModelEvents`. Quando é utilizado, a tração `WithoutModelEvents` garante que nenhum evento do modelo seja enviado, mesmo que as classes de semente adicionais sejam executadas através da métrica `call`:

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
## Semeando correndo

 Pode executar o comando `db:seed` do Artisan para semeie sua base de dados. Por padrão, o comando `db:seed` executa a classe `Database\Seeders\DatabaseSeeder`, que pode, por sua vez, invocar outras classes de semente. No entanto, você pode usar a opção `--class" para especificar uma classe de semente individualmente:

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```

 Você também poderá semear sua base de dados usando o comando `migrate:fresh` em combinação com a opção `--seed`, que excluirá todas as tabelas e serão reexecutadas todas suas migrações. Este comando é útil para completamente reconstruir sua base de dados. A opção `--seeder` poderá ser usada para especificar um adicional, o qual será executado:

```shell
php artisan migrate:fresh --seed

php artisan migrate:fresh --seed --seeder=UserSeeder 
```

<a name="forcing-seeding-production"></a>
#### Fazer com que os seeders funcionem em produção

 Algumas operações de sementeamento poderão fazer com que você altere ou perca dados. Para proteger contra a execução de comandos de sementeamento contra o banco de dados de produção, será solicitada confirmação antes do início da operação de sementeamento no ambiente `production`. Se quiser que a operação seja iniciada sem um pedido de confirmação, utilize a bandeira `--force`:

```shell
php artisan db:seed --force
```
