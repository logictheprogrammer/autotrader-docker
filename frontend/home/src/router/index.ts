import { useHttpStore } from '@/modules/http/http.store'
import { createRouter, createWebHistory } from 'vue-router'
import HomeLayout from '@/views/layouts/HomeLayout.vue'
import HomePage from '@/views/pages/HomePage.vue'
const AboutPage = () => import('@/views/pages/AboutPage.vue')
const ContactPage = () => import('@/views/pages/ContactPage.vue')
const PrivacyPage = () => import('@/views/pages/PrivacyPage.vue')
const TermsPage = () => import('@/views/pages/TermsPage.vue')
const ExchangePage = () => import('@/views/pages/ExchangePage.vue')
const TradersPage = () => import('@/views/pages/TradersPage.vue')
const AuthLayout = () => import('@/views/layouts/AuthLayout.vue')
const SignupPage = () => import('@/views/pages/auth/SignupPage.vue')
const SigninPage = () => import('@/views/pages/auth/SigninPage.vue')
const ForgetPasswordPage = () =>
  import('@/views/pages/auth/ForgetPasswordPage.vue')
const ResetPasswordPage = () =>
  import('@/views/pages/auth/ResetPasswordPage.vue')
const VerifyEmailPage = () => import('@/views/pages/auth/VerifyEmailPage.vue')
const ErrorLayout = () => import('@/views/layouts/ErrorLayout.vue')
const Error404Page = () => import('@/views/pages/error/Error404Page.vue')
const Error500Page = () => import('@/views/pages/error/Error500Page.vue')

const routes = [
  {
    path: '/',
    component: HomeLayout,
    children: [
      {
        path: '/',
        name: 'home',
        component: HomePage,
      },
      {
        path: '/about',
        name: 'about',
        component: AboutPage,
      },
      {
        path: '/contact',
        name: 'contact',
        component: ContactPage,
      },
      {
        path: '/privacy',
        name: 'privacy',
        component: PrivacyPage,
      },
      {
        path: '/terms',
        name: 'terms',
        component: TermsPage,
      },
      {
        path: '/exchange',
        name: 'exchange',
        component: ExchangePage,
      },
      {
        path: '/traders',
        name: 'traders',
        component: TradersPage,
      },
    ],
  },
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: '/signup',
        name: 'signup',
        component: SignupPage,
      },
      {
        path: '/signin',
        name: 'signin',
        component: SigninPage,
      },
      {
        path: '/forget-password',
        name: 'forget-password',
        component: ForgetPasswordPage,
      },
      {
        path: '/reset-password/:key/:token',
        name: 'reset-password',
        component: ResetPasswordPage,
      },
      {
        path: '/verify-email/:key/:token',
        name: 'verify-email',
        component: VerifyEmailPage,
      },
    ],
  },
  {
    path: '/',
    component: ErrorLayout,
    children: [
      {
        path: '/:NotFound(.*)*',
        name: '404',
        component: Error404Page,
      },
      {
        path: '/:NotFound(.*)*',
        name: '500',
        component: Error500Page,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 100,
      }
    }
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  useHttpStore().setNavigating(true)
  next()
})

router.beforeResolve(async (to, from, next) => {
  setTimeout(() => {
    useHttpStore().setNavigating(false)
  }, 500)
  next()
})

export default router
