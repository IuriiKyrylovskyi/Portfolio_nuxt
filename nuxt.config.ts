// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  runtimeConfig: {
    apiSecret: '', // can be overridden by NUXT_API_SECRET environment variable
    public: {
      apiBase: '', // can be overridden by NUXT_PUBLIC_API_BASE environment variable
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@formkit/nuxt',
    '@oku-ui/motion-nuxt',
    '@nuxtjs/google-fonts',
  ],

  formkit: {
    // Experimental support for auto loading (see note):
    autoImport: true,
  },
  motion: {
    //  autoImportComponents?: boolean
    //  prefix?: string
  },
  googleFonts: {
    families: {
      'Source+Sans+Pro': [300, 400],
    },
  },
});
