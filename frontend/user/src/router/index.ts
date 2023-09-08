import { createRouter, createWebHistory } from 'vue-router'
import HomeLayout from '@/views/layouts/HomeLayout.vue'
import HomePage from '@/views/pages/HomePage.vue'
const PackagePlansPage = () => import('@/views/pages/PackagePlansPage.vue')
const ActiveTradePage = () => import('@/views/pages/ActiveTradePage.vue')
const ReferralPage = () => import('@/views/pages/ReferralPage.vue')
const NotificationPage = () => import('@/views/pages/NotificationPage.vue')
const SupportPage = () => import('@/views/pages/SupportPage.vue')
const SettingsPage = () => import('@/views/pages/SettingsPage.vue')
const WalletLayout = () => import('@/views/layouts/WalletLayout.vue')
const WalletPage = () => import('@/views/pages/WalletPage.vue')
const DepositPage = () => import('@/views/pages/DepositPage.vue')
const TransferPage = () => import('@/views/pages/TransferPage.vue')
const WithdrawPage = () => import('@/views/pages/WithdrawPage.vue')
const ErrorLayout = () => import('@/views/layouts/ErrorLayout.vue')

const routes = [
  {
    path: '/',
    component: HomeLayout,
    children: [
      {
        path: '/',
        name: 'home',
        component: HomePage,
        meta: {
          page: `Welcome Back Friend!`,
          hideBreadcrumb: true,
        },
      },
      {
        path: '/active-trade',
        name: 'active-trade',
        component: ActiveTradePage,
        meta: {
          page: 'Active Trade',
        },
      },
      {
        path: '/packagePlans',
        name: 'packagePlans',
        component: PackagePlansPage,
        meta: {
          page: 'Package Plans',
        },
      },
      {
        path: '/support',
        name: 'support',
        component: SupportPage,
        meta: {
          page: 'Support',
        },
      },
      {
        path: '/referral',
        name: 'referral',
        component: ReferralPage,
        meta: {
          page: 'Referral Program',
        },
      },
      {
        path: '/notifications',
        name: 'notifications',
        component: NotificationPage,
        meta: {
          page: 'Notifications',
        },
      },
      {
        path: '/settings',
        name: 'settings',
        component: SettingsPage,
        meta: {
          page: 'Profile Settings',
        },
      },
      {
        path: '/wallet',
        component: WalletLayout,
        children: [
          {
            path: '',
            name: 'wallet',
            component: WalletPage,
            meta: {
              page: 'My Wallet',
            },
          },
          {
            path: 'deposit',
            name: 'deposit',
            component: DepositPage,
            meta: {
              page: 'Deposit',
              breadcrumb: [{ name: 'Wallet', to: 'wallet' }],
            },
          },
          {
            path: 'withdraw',
            name: 'withdraw',
            component: WithdrawPage,
            meta: {
              page: 'Withdraw',
              breadcrumb: [{ name: 'Wallet', to: 'wallet' }],
            },
          },
          {
            path: 'transfer',
            name: 'transfer',
            component: TransferPage,
            meta: {
              page: 'Transfer',
              breadcrumb: [{ name: 'Wallet', to: 'wallet' }],
            },
          },
        ],
      },
    ],
  },
  {
    path: '/:NotFound(.*)*',
    component: ErrorLayout,
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
