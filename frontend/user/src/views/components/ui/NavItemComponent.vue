<template>
  <RouterLink
    :to="{ name: to }"
    custom
    v-slot="{ isExactActive, href, isActive }"
  >
    <li
      :class="parent && isActive ? 'mm-active' : isExactActive && 'mm-active'"
    >
      <RouterLink
        :to="href"
        :class="
          'ai-icon ' + parent && isActive
            ? 'mm-active'
            : isExactActive
            ? 'mm-active'
            : ''
        "
        aria-expanded="false"
        @click="$emit('hideMenu')"
      >
        <i class="flaticon-025-dashboard"></i>
        <span class="nav-text">{{ name }}</span>
      </RouterLink>
    </li>
  </RouterLink>
</template>

<script setup lang="ts">
defineProps(["name", "to", "parent"]);

defineEmits(["hideMenu"]);
</script>

<style scoped></style>
