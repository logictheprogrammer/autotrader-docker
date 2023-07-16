<template>
  <div class="dlabnav bg-gradient-mine-sm">
    <div class="dlabnav-scroll">
      <ul class="metismenu mb-3" id="menu">
        <li class="dropdown header-profile">
          <a
            class="nav-link"
            href="javascript:void(0);"
            role="button"
            data-bs-toggle="dropdown"
          >
            <img src="/images/profile/pic1.jpg" width="20" alt="" />
            <div class="header-info ms-3">
              <span class="font-w600">Hi,<b>William</b></span>
              <small class="text-end font-w400">william@gmail.com</small>
            </div>
          </a>
          <div class="dropdown-menu dropdown-menu-end">
            <a href="app-profile.html" class="dropdown-item ai-icon">
              <svg
                id="icon-user1"
                xmlns="http://www.w3.org/2000/svg"
                class="text-primary"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span class="ms-2">Profile </span>
            </a>
            <a href="email-inbox.html" class="dropdown-item ai-icon">
              <svg
                id="icon-inbox"
                xmlns="http://www.w3.org/2000/svg"
                class="text-success"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                ></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span class="ms-2">Inbox </span>
            </a>
            <a href="page-error-404.html" class="dropdown-item ai-icon">
              <svg
                id="icon-logout"
                xmlns="http://www.w3.org/2000/svg"
                class="text-danger"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span class="ms-2">Logout </span>
            </a>
          </div>
        </li>
        <NavItem
          v-for="item in navItems"
          :key="item.to"
          @hide-menu="$emit('hideMenu')"
          :name="item.name"
          :to="item.to"
          :parent="item.parent"
        ></NavItem>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(["hideMenu"]);

const navItems = [
  {
    name: "Home",
    to: "home",
    parent: false,
  },
  {
    name: "My Wallet",
    to: "wallet",
    parent: true,
  },
  {
    name: "Active Trade",
    to: "active-trade",
    parent: false,
  },
  {
    name: "Packages",
    to: "plans",
    parent: false,
  },
  {
    name: "Support",
    to: "support",
    parent: false,
  },
  {
    name: "Testimonies",
    to: "testimonies",
    parent: false,
  },
  {
    name: "Affiliate",
    to: "affiliate",
    parent: false,
  },
  {
    name: "Settings",
    to: "settings",
    parent: false,
  },
];

let scrollBar: any;
onMounted(() => {
  scrollBar = new window.PerfectScrollbar(".dlabnav-scroll");
});

onBeforeUnmount(() => {
  scrollBar.destroy();
});
</script>

<style scoped></style>
