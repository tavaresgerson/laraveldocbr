# Guia de contribuição

## Relatório de erros

Para encorajar a colaboração ativa, o Laravel incentiva fortemente solicitações pull, não apenas relatórios de bugs. As solicitações pull só serão revisadas quando marcadas como "prontas para revisão" (não no estado "rascunho") e todos os testes de novos recursos forem aprovados. Solicitações pull persistentes e inativas deixadas no estado "rascunho" serão encerradas após alguns dias.

No entanto, se submeter um relatório de falhas, o seu problema deve conter um título e uma descrição clara do mesmo. Deverá também incluir o máximo de informações relevantes possíveis bem como um exemplo de código que demonstre o problema. O objetivo deste tipo de relatório é facilitar a replicação do bug por si mesmo - e por outros, assim como permitir o desenvolvimento da correção para o problema.

Lembre-se, relatórios de erros são criados na esperança que outros com o mesmo problema possam colaborar com você para resolvê-lo. Não espere que o relatório de bug irá automaticamente ver qualquer atividade ou que os outros se precipitarão para consertá-lo. Criando um relatório de bugs serve para ajudar a si mesmo e aos outros começarem a caminhada da correção do problema. Se você quiser contribuir, poderá ajudar consertando [qualquer erro listado em nossos controles de problemas](https://github.com/issues?q=is%3Aopen+is%3Aissue+label%3Abug+user%3Alaravel). Você deve estar autenticado no GitHub para visualizar todos os problemas do Laravel.

Se você ver avisos incorretos de DocBlock, PHPStan ou no IDE ao usar o Laravel, não crie um problema no GitHub. Em vez disso, envie uma solicitação de integração para corrigir o problema.

O código-fonte do Laravel é gerenciado no GitHub e existem repositórios para cada um dos projetos do Laravel:

- [Laravel Application](https://github.com/laravel/laravel)
- [Laravel Art](https://github.com/laravel/art)
- [Laravel Documentation](https://github.com/laravel/docs)
- [Laravel Dusk](https://github.com/laravel/dusk)
- [Laravel Cashier Stripe](https://github.com/laravel/cashier)
- [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle)
- [Laravel Echo](https://github.com/laravel/echo)
- [Laravel Envoy](https://github.com/laravel/envoy)
- [Laravel Folio](https://github.com/laravel/folio)
- [Laravel Framework](https://github.com/laravel/framework)
- [Laravel Homestead](https://github.com/laravel/homestead) ([Build Scripts](https://github.com/laravel/settler))
- [Laravel Horizon](https://github.com/laravel/horizon)
- [Laravel Jetstream](https://github.com/laravel/jetstream)
- [Laravel Passport](https://github.com/laravel/passport)
- [Laravel Pennant](https://github.com/laravel/pennant)
- [Laravel Pint](https://github.com/laravel/pint)
- [Laravel Prompts](https://github.com/laravel/prompts)
- [Laravel Reverb](https://github.com/laravel/reverb)
- [Laravel Sail](https://github.com/laravel/sail)
- [Laravel Sanctum](https://github.com/laravel/sanctum)
- [Laravel Scout](https://github.com/laravel/scout)
- [Laravel Socialite](https://github.com/laravel/socialite)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [Laravel Website](https://github.com/laravel/laravel.com-next)

## Perguntas de suporte

Os rastreadores de problemas do GitHub da Laravel não têm como objetivo fornecer assistência ou suporte ao Laravel. Em vez disso, utilize um dos seguintes canais:

- [Discussões do GitHub](https://github.com/laravel/framework/discussions)
- [Fóruns do Laracasts](https://laracasts.com/discuss)
- [Fóruns do Laravel.io](https://laravel.io/forum)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/laravel)
- [Discord](https://discord.gg/laravel)
- [Larachat](https://larachat.co)
- [IRC](https://web.libera.chat/?nick=artisan&channels=#laravel)

## Discussão sobre o desenvolvimento do núcleo

Você pode propor novas funcionalidades ou melhorias de comportamento do Laravel existente na [área de discussão do GitHub](https://github.com/laravel/framework/discussions) do repositório do framework Laravel. Se você propor uma nova funcionalidade, certifique-se de que está disposto a implementar pelo menos algum código que seria necessário para completar a funcionalidade.

Uma discussão informal sobre bugs, novas funcionalidades e implementação de funções existentes ocorre no canal `#internals` do servidor [Laravel Discord](https://discord.gg/laravel). Taylor Otwell, o mantenedor do Laravel, está presente normalmente nesse canal durante a semana das 8h às 17h (UTC-06:00 ou America/Chicago), e esporadicamente presente no canal em outros horários.

## Quais branchs?

**Todas** as propostas de correções de erros devem ser enviados para a versão mais recente que suporte correções (atualmente, o "10.x"). Nunca deve enviar-se corrigentes de erros para a ramificação `master`, exceto se forem correções de funcionalidades exclusivas da próxima versão.

**Os recursos menores que são totalmente compatíveis com a versão atual** podem ser enviados para o ramo estável mais recente (atualmente `11.x`).

**Principais** novidades ou funcionalidades que tenham impacto em mudanças devem ser sempre enviadas para a ramificação `master`, que contém o próximo lançamento.

## Assets compilados

Se você estiver enviando uma alteração que afetará um arquivo compilado, como a maioria dos arquivos em `resources/css` ou `resources/js` do repositório `laravel/laravel`, não envie os arquivos compilados. Devido ao seu grande tamanho, eles não podem ser revisados de forma realista por um mantenedor. Isso poderia ser explorado como uma maneira de injetar código malicioso no Laravel. Para impedir isto de forma defensiva, todos os arquivos compilados serão gerados e enviados pelos mantenedores do Laravel.

## Vulnerabilidades de segurança

Se você descobrir uma vulnerabilidade de segurança no Laravel, envie um email para Taylor Otwell em <a href="mailto:taylor@laravel.com">taylor@laravel.com</a>. Todas as vulnerabilidades de segurança serão prontamente resolvidas.

## Estilo de codificação

Laravel segue o padrão de codificação [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) e o padrão de auto-inicialização [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md).

### PHPDoc

Abaixo está um exemplo de um bloco de documentação do Laravel válido. Note que o atributo `@param` é seguido por dois espaços, o tipo do argumento, mais dois espaços e finalmente o nome da variável:

```php
    /**
     * Registre uma ligação com o contêiner.
     *
     * @param  string|array  $abstract
     * @param  \Closure|string|null  $concrete
     * @param  bool  $shared
     * @return void
     *
     * @throws \Exception
     */
    public function bind($abstract, $concrete = null, $shared = false)
    {
        // ...
    }
```

 Quando os atributos `@param` ou `@return` são redundantes devido ao uso de tipos nativos, eles podem ser removidos:

```php
    /**
     * Execute um trabalho.
     */
    public function handle(AudioProcessor $processor): void
    {
        //
    }
```

 Entretanto, quando o tipo nativo for genérico, especifique o tipo genérico através do uso dos atributos `@param` ou `@return`:

```php
    /**
     * Obtenha os anexos da mensagem.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorage('/path/to/file'),
        ];
    }
```

### StyleCI

Não se preocupe se o seu código estiver com estilo imperfeito! O [StyleCI](https://styleci.io/) integrará automaticamente quaisquer correções de estilo no repositório Laravel depois que as pull requests forem incorporadas. Isto permite-nos concentrar-nos nos conteúdos da contribuição e não no estilo do código.

## Código de Conduta

O código de conduta do Laravel é derivado do código de conduta do Ruby. Quaisquer violações ao código de conduta podem ser relatadas a Taylor Otwell (taylor@laravel.com):

- Os participantes respeitarão as opiniões divergentes.
- Os participantes devem assegurar que a sua linguagem e as suas ações não contêm ataques pessoais nem comentários pessoais depreciativos.
- Ao interpretar as palavras e ações dos outros, os participantes devem sempre presumir boas intenções.
– O comportamento que pode ser razoavelmente considerado assédio não será tolerado.
