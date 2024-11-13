export default [
    {
        text: 'Prólogo',
        collapsed: false,
        items: [
            { text: 'Notas da Versão', link: '/docs/releases.md' },
            { text: 'Guia de atualização', link: '/docs/upgrade.md' },
            { text: 'Guia de Contribuição', link: '/docs/contributions.md' },
        ]
    },
    {
      text: 'Começando',
      collapsed: false,
      items: [
        { text: 'Instalação', link: '/docs/installation.md' },
        { text: 'Configuração', link: '/docs/configuration.md' },
        { text: 'Estrutura de Diretórios', link: '/docs/structure.md' },
        { text: 'Frontend', link: '/docs/frontend.md' },
        { text: 'Starter Kits', link: '/docs/starter-kits.md' },
        { text: 'Deployment', link: '/docs/deployment.md' },
      ]
    },
    {
      text: 'Conceitos de Arquitetura',
      collapsed: false,
      items: [
        { text: 'Ciclo de Vida', link: '/docs/lifecycle.md' },
        { text: 'Containers', link: '/docs/container.md' },
        { text: 'Provedores de serviços', link: '/docs/providers.md' },
        { text: 'Facades', link: '/docs/facades.md' },
      ]
    },
    {
      text: 'O básico',
      collapsed: false,
      items: [
        { text: 'Roteamento', link: '/docs/routing.md' },
        { text: 'Middleware', link: '/docs/middleware.md' },
        { text: 'CSRF Protection', link: '/docs/csrf.md' },
        { text: 'Controladores', link: '/docs/controllers.md' },
        { text: 'Requisições', link: '/docs/requests.md' },
        { text: 'Respostas', link: '/docs/responses.md' },
        { text: 'Views (visualizações)', link: '/docs/views.md' },
        { text: 'Templates Blade', link: '/docs/blade.md' },
        { text: 'Pacote de ativos', link: '/docs/vite.md' },
        { text: 'URL Generation', link: '/docs/urls.md' },
        { text: 'Sessões', link: '/docs/session.md' },
        { text: 'Validação', link: '/docs/validation.md' },
        { text: 'Error Handling', link: '/docs/errors.md' },
        { text: 'Logging', link: '/docs/logging.md' },
      ]
    },
    {
      text: 'Indo mais fundo',
      collapsed: false,
      items: [
        { text: 'Artisan Console', link: '/docs/artisan.md' },
        { text: 'Broadcasting', link: '/docs/broadcasting.md' },
        { text: 'Cache', link: '/docs/cache.md' },
        { text: 'Coleções', link: '/docs/collections.md' },
        { text: 'Contexto', link: '/docs/context.md' },
        { text: 'Contratos', link: '/docs/contracts.md' },
        { text: 'Eventos', link: '/docs/events.md' },
        { text: 'Armazenamento de arquivos', link: '/docs/filesystem.md' },
        { text: 'Auxiliares', link: '/docs/helpers.md' },
        { text: 'HTTP Client', link: '/docs/http-client.md' },
        { text: 'Localização', link: '/docs/localization.md' },
        { text: 'E-Mail', link: '/docs/mail.md' },
        { text: 'Notificações', link: '/docs/notifications.md' },
        { text: 'Desenvolvimento de Pacotes', link: '/docs/packages.md' },
        { text: 'Processos', link: '/docs/processes.md' },
        { text: 'Filas', link: '/docs/queues.md' },
        { text: 'Rate Limiting', link: '/docs/rate-limiting.md' },
        { text: 'Strings', link: '/docs/strings.md' },
        { text: 'Agendamento de Tarefas', link: '/docs/scheduling.md' },
      ]
    },
    {
      text: 'Segurança',
      collapsed: false,
      items: [
        { text: 'Autenticação', link: '/docs/authentication.md' },
        { text: 'Autorização', link: '/docs/authorization.md' },
        { text: 'Verificação de Email', link: '/docs/verification.md' },
        { text: 'Encriptação', link: '/docs/encryption.md' },
        { text: 'Hashing', link: '/docs/hashing.md' },
        { text: 'Redefinir Senhas', link: '/docs/passwords.md' },
      ]
    },
    {
      text: 'Base de dados',
      collapsed: false,
      items: [
        { text: 'Início rápido', link: '/docs/database.md' },
        { text: 'Query Builder', link: '/docs/queries.md' },
        { text: 'Paginação', link: '/docs/pagination.md' },
        { text: 'Migrações', link: '/docs/migrations.md' },
        { text: 'Semear', link: '/docs/seeding.md' },
        { text: 'Redis', link: '/docs/redis.md' },
      ]
    },
    {
      text: 'Eloquent ORM',
      collapsed: false,
      items: [
        { text: 'Início rápido', link: '/docs/eloquent.md' },
        { text: 'Relacionamentos', link: '/docs/eloquent-relationships.md' },
        { text: 'Coleções', link: '/docs/eloquent-collections.md' },
        { text: 'Mutators/Casts', link: '/docs/eloquent-mutators.md' },
        { text: 'Recursos da API', link: '/docs/eloquent-resources.md' },
        { text: 'Serialização', link: '/docs/eloquent-serialization.md' },
        { text: 'Fábricas', link: '/docs/eloquent-factories.md' },
      ]
    },
    {
      text: 'Teste',
      collapsed: false,
      items: [
        { text: 'Getting Started', link: '/docs/testing.md' },
        { text: 'HTTP Tests', link: '/docs/http-tests.md' },
        { text: 'Console Tests', link: '/docs/console-tests.md' },
        { text: 'Browser Tests', link: '/docs/dusk.md' },
        { text: 'Database', link: '/docs/database-testing.md' },
        { text: 'Mocking', link: '/docs/mocking.md' },
      ]
    },
    {
      text: 'Pacotes',
      collapsed: false,
      items: [
        { text: 'Breeze', link: '/docs/starter-kits#laravel-breeze.md' },
        { text: 'Cashier (Stripe)', link: '/docs/billing.md' },
        { text: 'Cashier (Paddle)', link: '/docs/cashier-paddle.md' },
        { text: 'Dusk', link: '/docs/dusk.md' },
        { text: 'Envoy', link: '/docs/envoy.md' },
        { text: 'Fortify', link: '/docs/fortify.md' },
        { text: 'Folio', link: '/docs/folio.md' },
        { text: 'Homestead', link: '/docs/homestead.md' },
        { text: 'Horizon', link: '/docs/horizon.md' },
        { text: 'Jetstream', link: 'https://jetstream.laravel.com.md' },
        { text: 'Mix', link: '/docs/mix.md' },
        { text: 'Octane', link: '/docs/octane.md' },
        { text: 'Passport', link: '/docs/passport.md' },
        { text: 'Pennant', link: '/docs/pennant.md' },
        { text: 'Pint', link: '/docs/pint.md' },
        { text: 'Precognition', link: '/docs/precognition.md' },
        { text: 'Prompts', link: '/docs/prompts.md' },
        { text: 'Pulse', link: '/docs/pulse.md' },
        { text: 'Reverb', link: '/docs/reverb.md' },
        { text: 'Sail', link: '/docs/sail.md' },
        { text: 'Sanctum', link: '/docs/sanctum.md' },
        { text: 'Scout', link: '/docs/scout.md' },
        { text: 'Socialite', link: '/docs/socialite.md' },
        { text: 'Telescope', link: '/docs/telescope.md' },
        { text: 'Valet', link: '/docs/valet.md' },
      ]
    }
]
