import { useGeneralStore } from "@/stores/generalStore";
import { createRouter, createWebHistory } from "vue-router";
import HomeLayout from "@/HomeLayout.vue";
import HomeView from "@/views/HomeView.vue";
const PlansView = () => import("@/views/PlansView.vue");
const ActivePackageView = () => import("@/views/ActivePackageView.vue");
const AffiliateView = () => import("@/views/AffiliateView.vue");
const TestimoniesView = () => import("@/views/TestimoniesView.vue");
const SupportView = () => import("@/views/SupportView.vue");
const SettingsView = () => import("@/views/SettingsView.vue");
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
        path: "/active-trade",
        name: "active-trade",
        component: ActivePackageView,
        meta: {
          page: "Active Trade",
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
        name: "support",
        component: SupportView,
        meta: {
          page: "Support",
          hideBreadcrumb: true,
        },
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
        component: SettingsView,
        meta: {
          page: "Profile Settings",
        },
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
