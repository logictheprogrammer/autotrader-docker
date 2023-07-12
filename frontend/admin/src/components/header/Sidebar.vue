<template>
  <div class="dlabnav bg-gradient-mine-sm">
    <div class="dlabnav-scroll">
      <ul class="metismenu mb-3" id="menu">
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
    name: "Dashboard",
    to: "home",
    parent: false,
  },
  {
    name: "Users Management",
    to: "users",
    parent: false,
  },
  {
    name: "Purchased Packages",
    to: "purchased-packages",
    parent: false,
  },
  {
    name: "Package Plans",
    to: "plans",
    parent: false,
  },
  {
    name: "Support",
    to: "support",
    parent: true,
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
    name: "Referral Settings",
    to: "referral-settings",
    parent: false,
  },
  {
    name: "Deposit Methods",
    to: "deposit-methods",
    parent: false,
  },
  {
    name: "Withdrawal Methods",
    to: "withdrawal-methods",
    parent: false,
  },
  {
    name: "Site Configurations",
    to: "site-configurations",
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
