// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxtjs/supabase"],

  supabase: {
    // Pages that don't require login. Everything else redirects to /login.
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      exclude: ["/login", "/confirm"],
    },
  },

  css: ["~/assets/css/main.css"],

  app: {
    head: {
      title: "Savings Tracker",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap",
        },
      ],
    },
  },
});
