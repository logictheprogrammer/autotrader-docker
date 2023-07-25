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
            ><span class="logout-span">Logout </span
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              class="bi bi-box-arrow-in-right"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"
              ></path>
              <path
                fill-rule="evenodd"
                d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
              ></path></svg
          ></a>
        </li>
        <li class="nav-item d-flex" v-if="isAdmin">
          <a href="javascript:void(0);" class="btn" @click="authStore.goAdmin"
            ><span class="logout-span">Go Admin </span
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              class="bi bi-box-arrow-in-right"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"
              ></path>
              <path
                fill-rule="evenodd"
                d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
              ></path></svg
          ></a>
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
