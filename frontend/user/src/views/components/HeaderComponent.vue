<template>
  <NavHeaderComponent @toggle-menu="toggleMenu" />

  <!--**********************************
          Header start
      ***********************************-->
  <div class="header">
    <div class="header-content">
      <nav class="navbar navbar-expand">
        <div class="collapse navbar-collapse justify-content-between">
          <div class="header-left">
            <div class="dashboard_bar">{{ page }}</div>
          </div>
          <ul class="navbar-nav header-right">
            <li class="nav-item">
              <div
                class="bg-skin p-2 rounded-5 d-flex align-items-center gap-2"
              >
                <RouterLink
                  :to="{ name: 'wallet' }"
                  class="d-flex flex-column px-2"
                >
                  <span class="text-sharp gap-2 d-flex align-items-center"
                    ><img
                      src="/svg/crypto-icons/usdt.svg"
                      alt=""
                      class="avatar-xxs"
                      width="16"
                    />USDT
                  </span>
                  <h4 class="text-white mb-0">
                    {{ Helpers.toDollar(balance || 0) }}
                  </h4></RouterLink
                >
                <RouterLink :to="{ name: 'wallet' }" class="btn btn-primary"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-wallet"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M0 3a2 2 0 0 1 2-2h13.5a.5.5 0 0 1 0 1H15v2a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 0 12.5V3zm1 1.732V12.5A1.5 1.5 0 0 0 2.5 14h12a.5.5 0 0 0 .5-.5V5H2a1.99 1.99 0 0 1-1-.268zM1 3a1 1 0 0 0 1 1h12V2H2a1 1 0 0 0-1 1z"
                    />
                  </svg>
                  <span class="ps-1">Wallet</span></RouterLink
                >
              </div>
            </li>
            <li
              class="nav-item dropdown notification_dropdown d-sm-flex d-none"
            >
              <RouterLink
                :to="{ name: 'notifications' }"
                class="nav-link ai-icon"
              >
                <i class="fa-regular fa-bell" style="color: #4f7086"></i>
                <span class="badge light text-white bg-danger rounded-circle"
                  >.</span
                >
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </div>
  <!--**********************************
          Header end ti-comment-alt
      ***********************************-->

  <SidebarComponent @hide-menu="hideMenu" />
</template>

<script setup lang="ts">
const httpStore = useHttpStore()
const authStore = useAuthStore()
const route = useRoute()

const page = computed(() => route.meta.page)
const onDemo = computed(() => httpStore.onDemo)
const balance = computed(() =>
  !onDemo.value
    ? (authStore.user?.mainBalance || 0) +
      (authStore.user?.referralBalance || 0)
    : authStore.user?.demoBalance
)

const toggleMenu = () => {
  window.$('#main-wrapper').toggleClass('menu-toggle')
  window.$('.hamburger').toggleClass('is-active')
}
const hideMenu = () => {
  window.$('#main-wrapper').removeClass('menu-toggle')
  window.$('.hamburger').removeClass('is-active')
}
</script>

<style scoped>
.dlabnav {
  z-index: 9;
}
</style>

<style>
.header-right .notification_dropdown .nav-link .badge {
  top: -3px;
  height: 15px;
  width: 15px;
  color: transparent !important;
}

.header-right .notification_dropdown .nav-link {
  padding: 2px;
}
</style>
