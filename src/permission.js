import router from './router'
import store from '@/store'
import { getToken } from '@/utils/authToken'

// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 路由访问权限
import { initializePermission, hasPermission } from '@/utils/permission'

// 进度条配置
NProgress.configure({ showSpinner: false })

// 白名单
const whiteList = ['/login', '/authredirect', '/401', '/dashboard', '/404']

// 路由权限控制
router.beforeEach((to, from, next) => {
  NProgress.start()

  if (!store.getters.permission ||
       store.getters.permission.length < 1 ||
       store.getters.addRouters.length < 1) {
    initializePermission(1).then((addRouters) => {
      // 动态添加可访问路由表
      router.addRoutes(addRouters)
      next({ ...to, replace: true })
      NProgress.done()
    })
    return
  }

  if (whiteList.indexOf(to.path) !== -1) {
    next()
    NProgress.done()
    return
  }

  if (!getToken()) {
    next('/login')
    NProgress.done()
    return
  }

  if (to.path === '/login') {
    next({ path: '/' })
    NProgress.done()
    return
  }

  if (hasPermission(to.path)) {
    next()
  } else {
    next({ path: '/401', replace: true, query: { noGoBack: true }})
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
