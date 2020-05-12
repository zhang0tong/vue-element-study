module.exports = {
  chainWebpack: config => {
    config.set('externals', {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      axios: 'axios',
      echarts: 'echarts',
      nprogress: 'NProgress',
      'vue-quill-editor': 'VueQuillEditor'
    })
  }
}
