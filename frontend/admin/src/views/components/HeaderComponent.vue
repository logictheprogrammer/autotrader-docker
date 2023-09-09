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
            <li class="nav-item dropdown notification_dropdown d-flex">
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
const route = useRoute()

const page = computed(() => route.meta.page)

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
