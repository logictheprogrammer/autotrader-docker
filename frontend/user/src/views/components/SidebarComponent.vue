<template>
  <div class="dlabnav bg-gradient-mine-sm position-fixed">
    <div class="dlabnav-scroll">
      <ul class="metismenu mb-3" id="menu">
        <li
          class="mb-3 demo-list"
          :class="{ 'mm-active': onDemo }"
          @click="$emit('hideMenu')"
        >
          <a
            class="d-flex justify-content-between border"
            href="javascript:void(0);"
            @click="() => httpStore.setDemo(!onDemo)"
          >
            <span class="text">{{ onDemo ? 'On Demo' : 'Go Demo' }}</span>
            <MySwitchComponent
              :checked="onDemo"
              @click="() => httpStore.setDemo(!onDemo)"
            />
          </a>
        </li>
        <RouterLink
          :to="{ name: 'settings' }"
          custom
          v-slot="{ isExactActive, href }"
        >
          <li
            class="dropdown header-profile d-flex"
            :class="`${isExactActive && 'mm-active'}`"
          >
            <RouterLink
              :to="href"
              class="nav-link border"
              href="javascript:void(0);"
              @click="$emit('hideMenu')"
            >
              <img src="/images/profile/pic1.jpg" width="20" alt="" />
              <div class="header-info ms-3 ellipsis-container">
                <span class="font-w600"
                  >Hi, <b>{{ user?.username }} </b></span
                >
                <small
                  class="text-end font-w400 ellipsis-container ellipsis-text"
                  >{{ user?.email }}
                </small>
              </div>
            </RouterLink>
          </li>
        </RouterLink>
        <NavItemComponent
          v-for="item in navItems"
          :key="item.to"
          @hide-menu="$emit('hideMenu')"
          :name="item.name"
          :to="item.to"
          :parent="item.parent"
          :icon="item.icon"
          :notice="item.notice"
        />
        <li class="nav-item d-flex mt-3">
          <a
            href="javascript:void(0);"
            class="btn btn-outline-secondary"
            @click="logoutHandler"
            ><i class="bi bi-box-arrow-in-left me-2 fs-20"></i>
            <span class="logout-span">Logout </span></a
          >
        </li>
        <li class="nav-item d-flex" v-if="isAdmin">
          <a href="javascript:void(0);" class="btn" @click="authStore.goAdmin"
            ><i class="bi bi-box-arrow-up-right me-2 fs-16 mb-1"></i
            ><span class="logout-span">Go Admin </span></a
          >
        </li>
      </ul>
    </div>
  </div>
  <AlertConfirmComponent
    :is-open="openModal"
    :status="ResponseStatus.WARNING"
    title="Are you sure you want to logout?"
    message="Logout from your current session, you will need to login again to get back. Click yes to continue"
    @confirm="authStore.logout"
    @close="openModal = false"
    confirm-btn-text="Yes, Logout"
  />
</template>

<script setup lang="ts">
defineEmits(['hideMenu'])

const authStore = useAuthStore()
const httpStore = useHttpStore()

const isAdmin = computed(() => authStore.isAdmin)
const onDemo = computed(() => httpStore.onDemo)

const user = computed(() => authStore.user)
const navItems = [
  {
    name: 'Home',
    to: 'home',
    parent: false,
    icon: 'fa-solid fa-house',
  },
  {
    name: 'Notifications',
    to: 'testimonies',
    parent: false,
    icon: 'fa-solid fa-bell',
    notice: 5,
  },
  {
    name: 'My Wallet',
    to: 'wallet',
    parent: true,
    icon: 'fa-solid fa-wallet',
  },
  {
    name: 'Active Trade',
    to: 'active-trade',
    parent: false,
    icon: 'fa-solid fa-bolt',
  },
  {
    name: 'Package Plans',
    to: 'packagePlans',
    parent: false,
    icon: 'fa-solid fa-cube',
  },
  {
    name: 'Support',
    to: 'support',
    parent: false,
    icon: 'fa-solid fa-headset',
  },
  {
    name: 'Referral',
    to: 'referral',
    parent: false,
    icon: 'fa-solid fa-users',
  },
  {
    name: 'Settings',
    to: 'settings',
    parent: false,
    icon: 'fa-solid fa-gear',
  },
]

const openModal = ref(false)

const logoutHandler = () => {
  openModal.value = true
}

let scrollBar: any
onMounted(() => {
  scrollBar = new window.PerfectScrollbar('.dlabnav-scroll')
})

onBeforeUnmount(() => {
  scrollBar.destroy()
})
</script>

<style scoped></style>

<style>
@media only screen and (min-width: 768px) {
  #main-wrapper.menu-toggle .logout-span {
    display: none;
  }

  #main-wrapper.menu-toggle .demo-list {
    padding: 0;
  }
  #main-wrapper.menu-toggle .demo-list a {
    padding: 20px 0 0;
    justify-content: center !important;
    border: none !important;
    background-color: transparent !important;
  }
  #main-wrapper.menu-toggle .demo-list .text {
    display: none;
  }
}

body[data-sidebar-style='mini'] .demo-list {
  padding: 0;
}
body[data-sidebar-style='mini'] .demo-list a {
  padding: 20px 0 0;
  justify-content: center !important;
  border: none !important;
  background-color: transparent !important;
}
body[data-sidebar-style='mini'] .demo-list .text {
  display: none;
}

body[data-sidebar-style='mini'] .logout-span {
  display: none;
}
</style>
