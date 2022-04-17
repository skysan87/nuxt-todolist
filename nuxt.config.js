import packageInfo from './package.json'

export default {
  ssr: false,
  target: 'static',
  env: {
    app_version: packageInfo.version,
    ROOT_PATH: '/today/list'
  },
  /*
  ** Headers of the page
  */
  head: {
    title: 'What to do Today',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'robots', name: 'robots', content: 'noindex' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    '@/assets/css/tailwind.css',
    '@/assets/css/common.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '@/plugins/fontawesome', ssr: false },
    { src: '@/plugins/v-calendar', ssr: false }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxtjs/device'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt-community/dotenv-module
    ['@nuxtjs/dotenv',
      {
        filename: process.env.NODE_ENV === 'production'
          ? './config/.env.production'
          : './config/.env.develop'
      }
    ],
    '@nuxtjs/toast',
    '@nuxtjs/style-resources'
  ],
  router: {
    // middleware: 全てのページで有効になる
    middleware: ['authentication']
  },
  /*
  ** Build configuration
  */
  build: {
    analyze: false,
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  },
  toast: {
    position: 'top-right',
    duration: 3000
  }
}
