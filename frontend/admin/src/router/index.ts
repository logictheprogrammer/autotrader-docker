import { createRouter, createWebHistory } from 'vue-router'
import HomeLayout from '@/views/layouts/HomeLayout.vue'
import HomePage from '@/views/pages/HomePage.vue'
const PackagePlansPage = () => import('@/views/pages/PackagePlansPage.vue')
const UsersPage = () => import('@/views/pages/UsersPage.vue')
const PurchasedPackagesPage = () =>
  import('@/views/pages/PurchasedPackagesPage.vue')
const ReferralPage = () => import('@/views/pages/ReferralPage.vue')
const TestimoniesPage = () => import('@/views/pages/TestimoniesPage.vue')
const SupportLayout = () => import('@/views/layouts/SupportLayout.vue')
const SupportPage = () => import('@/views/pages/SupportPage.vue')
const ChatPage = () => import('@/views/pages/ChatPage.vue')
const SettingsLayout = () => import('@/views/layouts/SettingsLayout.vue')
const ReferralSettingsPage = () =>
  import('@/views/pages/ReferralSettingsPage.vue')
const DepositMethodsPage = () => import('@/views/pages/DepositMethodsPage.vue')
const WithdrawalMethodsPage = () =>
  import('@/views/pages/WithdrawalMethodsPage.vue')
const SiteConfigurationsPage = () =>
  import('@/views/pages/SiteConfigurationsPage.vue')
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
          page: 'Dashboard',
          hideBreadcrumb: true,
        },
      },
      {
        path: '/users',
        name: 'users',
        component: UsersPage,
        meta: {
          page: 'Users Management',
        },
      },
      {
        path: '/purchased-packages',
        name: 'purchased-packages',
        component: PurchasedPackagesPage,
        meta: {
          page: 'Purchased Packages',
        },
      },
      {
        path: '/plans',
        name: 'plans',
        component: PackagePlansPage,
        meta: {
          page: 'Packages',
        },
      },
      {
        path: '/support',
        component: SupportLayout,
        children: [
          {
            path: '',
            name: 'support',
            component: SupportPage,
            meta: {
              page: 'Support',
              hideBreadcrumb: true,
            },
          },
          {
            path: ':userId',
            name: 'chat',
            component: ChatPage,
            meta: {
              page: 'Support',
              hideBreadcrumb: true,
            },
          },
        ],
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
        path: '/testimonies',
        name: 'testimonies',
        component: TestimoniesPage,
        meta: {
          page: 'Testimonies',
        },
      },
      {
        path: '/settings',
        name: 'settings',
        component: SettingsLayout,
        children: [
          {
            path: 'referral-settings',
            name: 'referral-settings',
            component: ReferralSettingsPage,
            meta: {
              page: 'Referral Settings',
            },
          },
          {
            path: 'deposit-methods',
            name: 'deposit-methods',
            component: DepositMethodsPage,
            meta: {
              page: 'Deposit Methods',
            },
          },
          {
            path: 'withdrawal-methods',
            name: 'withdrawal-methods',
            component: WithdrawalMethodsPage,
            meta: {
              page: 'Withdrawal Methods',
            },
          },
          {
            path: 'site-configurations',
            name: 'site-configurations',
            component: SiteConfigurationsPage,
            meta: {
              page: 'Site Configurations',
            },
          },
        ],
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