import { config } from 'dotenv'

// Charge .env.example (obligatoire pour que process.env ait les variables)
config({ path: '.env.example' })

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
    // Session (obligatoire pour nuxt-auth-utils)
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,

    // DeepSeek AI
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,

    // OAuth Providers - À la racine (attendu par nuxt-auth-utils)
    NUXT_OAUTH_GITHUB_CLIENT_ID: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
    NUXT_OAUTH_GITHUB_CLIENT_SECRET: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
    NUXT_OAUTH_GOOGLE_CLIENT_ID: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
    NUXT_OAUTH_GOOGLE_CLIENT_SECRET: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,

    // Turso Database
    tursoDatabaseUrl: process.env.TURSO_DATABASE_URL,
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,

    // Variables publiques (accessibles côté client)
    public: {
      appName: 'EduAI',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    }
  },

  // Configuration de nuxt-auth-utils
  auth: {
    session: {
      // Durée de session : 7 jours
      maxAge: 60 * 60 * 24 * 7,
    },
    providers: {
      github: {
        // Activer GitHub OAuth
        enabled: true,
      },
      google: {
        // Activer Google OAuth
        enabled: true,
      },
    },
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
    },
    // Compression des réponses
    compressPublicAssets: true,
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
  },

  // Optimisations Vite
  vite: {
    build: {
      target: 'esnext',
    },
    optimizeDeps: {
      include: ['zod', 'bcryptjs'],
    },
  },
})