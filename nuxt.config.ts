// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      stravaClientId: process.env.NUXT_STRAVA_CLIENT_ID,
      stravaClientSecret: process.env.NUXT_STRAVA_CLIENT_SECRET,
      stravaScope: process.env.NUXT_STRAVA_SCOPE,
      stravaCallbackUrl: process.env.NUXT_STRAVA_CALLBACK_URL,
      stravaOauthUrl: process.env.NUXT_STRAVA_OAUTH_URL,
    },
  }
})
