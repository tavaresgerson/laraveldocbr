# Banco de dados: Semeamento

<a name="introduction"></a>
## Introdução

O Laravel inclui a capacidade de semear o seu banco de dados com dados usando as classes de *seed*. Todas as classes de *seeds* são armazenadas na pasta `database/seeders`. Por padrão, uma classe de `DatabaseSeeder` é definida para você. A partir desta classe, você pode usar o método `call` para executar outras classes de semear, permitindo que você controle a ordem de popular o banco de dados.

::: info NOTA
[Proteção de atribuição em massa](/docs/eloquent#mass-assignment) é automaticamente desativado durante o semeamento do banco de dados.
:::

<a name="writing-seeders"></a>
## Redirecionamento de *seeds*

Para gerar um *seeder*, execute o comando `make:seeder` [no Artisan](/docs/artisan) . Todos os *seeders* gerados pelo framework serão colocados na pasta `database/seeders`:

```shell
php artisan make:seeder UserSeeder
```

Uma classe *seed* contém apenas um método por padrão: `run`. Este método é chamado quando o comando `db:seed` do [Artisan](/docs/artisan) é executado. Dentro do método `run` você pode inserir dados em seu banco de dados como quiser. Você pode usar o [query builder](/docs/queries) para inserir dados manualmente ou usar o [Eloquent Factories](/docs/eloquent-factories).

Como exemplo vamos modificar a classe padrão `DatabaseSeeder` e adicionar um comando de inserção de banco de dados no método `run`:

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
         * Execute os seeders do banco de dados.
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

::: info NOTA
Você pode especificar qualquer dependência necessária dentro da assinatura do método `run`. Eles serão automaticamente resolvidos via o [contêiner de serviços](/docs/container) do Laravel.
:::

<a name="using-model-factories"></a>
### Usando Model Factory

Claro, especificar manualmente os atributos para cada semente de modelo é trabalhoso. Em vez disso, você pode usar a [Fábrica de Modelos](/docs/eloquent-factories) para gerar convenientemente grandes quantidades de registros de banco de dados. Primeiro, revise a [documentação da Fábrica de Modelos](/docs/eloquent-factories) para aprender como definir suas *factories*.

Por exemplo, vamos criar 50 usuários, cada um com uma postagem relacionada:

```php
    use App\Models\User;

    /**
     * Execute os seeders do banco de dados.
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

Dentro da classe `DatabaseSeeder`, você pode usar o método `call` para executar as classes adicionais de sementes. Usando o método `call` é possível dividir seu processo de banco de dados em vários arquivos para que nenhuma classe de sementes se torne muito grande. O método `call` aceita uma matriz das classes de *seeds* a serem executadas:

```php
    /**
     * Execute os seeders do banco de dados.
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
### Silenciando Eventos de Modelo

Ao gerar sementes, você pode querer impedir que os modelos disparem eventos. Você pode fazer isso usando o atributo `WithoutModelEvents`. Quando usado, o atributo garante que nenhum evento de modelo é emitido, mesmo se as classes de semente adicionais forem executadas via o método `call`:

```php
    <?php

    namespace Database\Seeders;

    use Illuminate\Database\Seeder;
    use Illuminate\Database\Console\Seeds\WithoutModelEvents;

    class DatabaseSeeder extends Seeder
    {
        use WithoutModelEvents;

        /**
         * Execute os seeders do banco de dados.
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
## Executando as *Seeds*

Você pode executar no Artisan o comando `db:seed` para popular seu banco de dados. Por padrão, o comando `db:seed` executa a classe `Database\Seeders\DatabaseSeeder`, que por sua vez pode invocar outras classes de sementes. No entanto, você pode usar o parâmetro `--class` para especificar uma classe de semente específica para ser executada individualmente:

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```

Você também pode popular seu banco de dados usando o comando `migrate:fresh` em combinação com a opção `--seed`, que vai fazer um *reset* completo em todas as tabelas e reexecutar todas as suas migrações. Esse comando é útil para reconstruir completamente seu banco de dados. A opção `--seeder` pode ser usada para especificar um *seeder* específico para executar.

```shell
php artisan migrate:fresh --seed

php artisan migrate:fresh --seed --seeder=UserSeeder 
```

<a name="forcing-seeding-production"></a>
#### Forçando as *seeds* a executar em produção

Algumas operações de semeamento podem lhe fazer alterar ou perder dados. Para proteger você de executar comandos de semeamento em seu banco de produção, será solicitado que confirme antes da execução em ambiente *production*. Para forçar que as *seeds* sejam executadas sem um prompt, utilize o parâmetro `--force`:

```shell
php artisan db:seed --force
```
