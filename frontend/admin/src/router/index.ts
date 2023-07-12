import { useGeneralStore } from "@/stores/generalStore";
import { createRouter, createWebHistory } from "vue-router";
import HomeLayout from "@/HomeLayout.vue";
import HomeView from "@/views/HomeView.vue";
const PlansView = () => import("@/views/PlansView.vue");
const UsersView = () => import("@/views/UsersView.vue");
const PurchasedPackagesView = () => import("@/views/PurchasedPackagesView.vue");
const AffiliateView = () => import("@/views/AffiliateView.vue");
const TestimoniesView = () => import("@/views/TestimoniesView.vue");
const SupportLayout = () => import("@/views/SupportLayout.vue");
const SupportView = () => import("@/views/SupportView.vue");
const ChatView = () => import("@/views/ChatView.vue");
const SettingsLayout = () => import("@/views/SettingsLayout.vue");
const ReferralSettingsView = () => import("@/views/ReferralSettingsView.vue");
const DepositMethodsView = () => import("@/views/DepositMethodsView.vue");
const WithdrawalMethodsView = () => import("@/views/WithdrawalMethodsView.vue");
const SiteConfigurationsView = () =>
  import("@/views/SiteConfigurationsView.vue");
const WalletLayout = () => import("@/views/WalletLayout.vue");
const WalletView = () => import("@/views/WalletView.vue");
const DepositView = () => import("@/views/DepositView.vue");
const TransferView = () => import("@/views/TransferView.vue");
const WithdrawView = () => import("@/views/WithdrawView.vue");
const ErrorLayout = () => import("@/ErrorLayout.vue");

const routes = [
  {
    path: "/",
    component: HomeLayout,
    children: [
      {
        path: "/",
        name: "home",
        component: HomeView,
        meta: {
          page: "Dashboard",
          hideBreadcrumb: true,
        },
      },
      {
        path: "/users",
        name: "users",
        component: UsersView,
        meta: {
          page: "Users Management",
        },
      },
      {
        path: "/purchased-packages",
        name: "purchased-packages",
        component: PurchasedPackagesView,
        meta: {
          page: "Purchased Packages",
        },
      },
      {
        path: "/plans",
        name: "plans",
        component: PlansView,
        meta: {
          page: "Packages",
        },
      },
      {
        path: "/support",
        component: SupportLayout,
        children: [
          {
            path: "",
            name: "support",
            component: SupportView,
            meta: {
              page: "Support",
              hideBreadcrumb: true,
            },
          },
          {
            path: ":userId",
            name: "chat",
            component: ChatView,
            meta: {
              page: "Support",
              hideBreadcrumb: true,
            },
          },
        ],
      },
      {
        path: "/affiliate",
        name: "affiliate",
        component: AffiliateView,
        meta: {
          page: "Affiliate Program",
        },
      },
      {
        path: "/testimonies",
        name: "testimonies",
        component: TestimoniesView,
        meta: {
          page: "Testimonies",
        },
      },
      {
        path: "/settings",
        name: "settings",
        component: SettingsLayout,
        children: [
          {
            path: "referral-settings",
            name: "referral-settings",
            component: ReferralSettingsView,
            meta: {
              page: "Referral Settings",
            },
          },
          {
            path: "deposit-methods",
            name: "deposit-methods",
            component: DepositMethodsView,
            meta: {
              page: "Deposit Methods",
            },
          },
          {
            path: "withdrawal-methods",
            name: "withdrawal-methods",
            component: WithdrawalMethodsView,
            meta: {
              page: "Withdrawal Methods",
            },
          },
          {
            path: "site-configurations",
            name: "site-configurations",
            component: SiteConfigurationsView,
            meta: {
              page: "Site Configurations",
            },
          },
        ],
      },
      {
        path: "/wallet",
        component: WalletLayout,
        children: [
          {
            path: "",
            name: "wallet",
            component: WalletView,
            meta: {
              page: "My Wallet",
            },
          },
          {
            path: "deposit",
            name: "deposit",
            component: DepositView,
            meta: {
              page: "Deposit",
              breadcrumb: [{ name: "Wallet", to: "wallet" }],
            },
          },
          {
            path: "withdraw",
            name: "withdraw",
            component: WithdrawView,
            meta: {
              page: "Withdraw",
              breadcrumb: [{ name: "Wallet", to: "wallet" }],
            },
          },
          {
            path: "transfer",
            name: "transfer",
            component: TransferView,
            meta: {
              page: "Transfer",
              breadcrumb: [{ name: "Wallet", to: "wallet" }],
            },
          },
        ],
      },
    ],
  },
  {
    path: "/:NotFound(.*)*",
    component: ErrorLayout,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
        top: 100,
      };
    }
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  useGeneralStore().requesting(true);
  next();
});

router.beforeResolve(async (to, from, next) => {
  useGeneralStore().requesting(false);
  next();
});

export default router;
