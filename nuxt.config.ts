// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/mdc',
    '@nuxthub/core',
    'nuxt-auth-utils',
    'nuxt-charts',
    '@nuxtjs/google-fonts'
  ],

  runtimeConfig: {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    tursoDatabaseUrl: process.env.TURSO_DATABASE_URL,
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
    public: {
      // Variables publiques ici si besoin
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  mdc: {
    headings: {
      anchorLinks: false
    },
    highlight: {
      shikiEngine: 'javascript'
    }
  },

  experimental: {
    viewTransition: true
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  hub: {
    db: 'sqlite',
    blob: true
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // @ts-ignore - Le module google-fonts est installé
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
      'JetBrains+Mono': [400]
    },
    display: 'swap',
    preconnect: true
  }
})