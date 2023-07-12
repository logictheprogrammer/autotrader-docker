<template>
  <RouterLink
    v-if="children"
    :to="{ name: to }"
    custom
    v-slot="{ isExactActive, href, isActive }"
  >
    <li
      :class="parent && isActive ? 'mm-active' : isExactActive && 'mm-active'"
    >
      <a
        aria-expanded="false"
        :class="`has-arrow ai-icon ${
          parent && isActive ? 'mm-active' : isExactActive ? 'mm-active' : ''
        }`"
      >
        <i class="flaticon-025-dashboard"></i>
        <span class="nav-text">{{ name }}</span>
      </a>
      <ul aria-expanded="false" class="rounded mt-2">
        <RouterLink
          v-for="child in children"
          :to="{ name: child.to }"
          custom
          v-slot="{ isExactActive, href, isActive }"
        >
          <li
            :class="
              parent && isActive ? 'mm-active' : isExactActive && 'mm-active'
            "
          >
            <RouterLink
              :to="href"
              :class="isExactActive ? 'mm-active' : ''"
              @click="$emit('hideMenu')"
            >
              <span>{{ child.name }}</span>
            </RouterLink>
          </li>
        </RouterLink>
      </ul>
    </li>
  </RouterLink>
  <RouterLink
    :to="{ name: to }"
    custom
    v-slot="{ isExactActive, href, isActive }"
    v-else
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
defineProps<{
  name: string;
  to: string;
  parent: boolean;
  children?: { name: string; to: string }[];
}>();

defineEmits(["hideMenu"]);
</script>

<style scoped></style>
