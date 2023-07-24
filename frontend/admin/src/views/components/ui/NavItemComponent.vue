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
        <i :class="icon"></i>
        <span class="nav-text">{{ name }}</span>
        <MyBadgeComponent
          v-if="notice"
          class="text-white bg-danger notice-badge"
          >{{ notice }}
        </MyBadgeComponent>
      </RouterLink>
    </li>
  </RouterLink>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  parent: boolean
  to: string
  icon: string
  notice?: number
}>()

defineEmits(['hideMenu'])
</script>

<style scoped>
.notice-badge {
  right: 0;
  margin-right: 1rem;
  border: 2px solid #1d263b;
}
</style>
