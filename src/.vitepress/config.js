import sidebar from "./sidebar";

export default {
  // site-level options
  title: 'Laravel 11.x',
  description: 'The PHP Framework for Web Artisans',
  lang: 'pt-BR',
  head: [
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
    ],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ],
    [
      'link',
      { href: 'https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,100..900;1,100..900&display=swap', rel: 'stylesheet' }
    ],
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  ignoreDeadLinks: true,
  sitemap: {
    hostname: 'https://v11-docs.laravel.tavares.in'
  },
  themeConfig: {
    returnToTopLabel: 'Retornar ao Topo',
    lightModeSwitchTitle: 'Trocar para tema claro',
    darkModeSwitchTitle: 'Trocar para tema escuro',
    darkModeSwitchLabel: 'Aparência',
    editLink: {
      pattern: ({ filePath }) => {
        return `https://github.com/tavaresgerson/laraveldocbr/edit/11.x/src/docs/${filePath}`
      },
      text: 'Corrigir isso no GitHub'
    },
    outline: {
      label: 'Nesta página',
      level: 'deep'
    },
    // theme-level options
    logo: { light: '/header_logo.svg', dark: '/header_logo.svg' },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/facebook/react-native' },
    ],
    search: {
      provider: 'local',
      options: {
        placeholder: 'Pesquisar',
      }
    },
    docFooter: {
      prev: 'Página anterior',
      next: 'Próxima página'
    },
    sidebar: sidebar
  },
}