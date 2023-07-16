<template>
  <!--**********************************
        Footer start
    ***********************************-->
  <div class="footer">
    <div class="copyright">
      <p>
        Copyright © {{ config.siteName }}.com
        {{ year }}
      </p>
    </div>
  </div>
  <!--**********************************
          Footer end
      ***********************************-->
</template>

<script setup lang="ts">
import config from "@/data/config";
const year = new Date().getFullYear();
</script>

<style scoped></style>
