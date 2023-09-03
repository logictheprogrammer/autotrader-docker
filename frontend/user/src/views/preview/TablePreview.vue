<template>
  <table class="tg w-100">
    <tr>
      <td class="tg-cly1" v-if="searching">
        <div class="line m-0"></div>
      </td>
    </tr>
    <tr>
      <th v-for="col in cols" :key="col" class="tg-cly1">
        <div class="line"></div>
      </th>
    </tr>
    <tr v-for="row in rows" :key="row">
      <td class="tg-cly1" v-for="col in cols" :key="col">
        <div class="line"></div>
      </td>
    </tr>
  </table>
</template>

<script setup lang="ts">
defineProps<{
  rows: number
  cols: number
  searching?: boolean
}>()
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

tr {
  border-bottom: 1px solid #2e2e42;
}

.tg {
  border-collapse: collapse;
  border-spacing: 0;
  border-color: #ccc;
}

.tg td:first-child,
.tg th:first-child {
  padding-left: 1rem;
}

.tg td {
  font-family: Arial, sans-serif;
  font-size: 14px;
  padding: 20px 5px;
  border-style: solid;
  border-width: 0px;
  overflow: hidden;
  word-break: normal;
  border-color: #1d263b;
  color: #333;
  background-color: #1d263b;
}

.tg th {
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: normal;
  padding: 20px 5px;
  border-style: solid;
  border-width: 0px;
  overflow: hidden;
  word-break: normal;
  border-color: #141a2a;
  color: #333;
  background-color: #141a2a;
}

.line {
  float: left;
  width: 100px;
  height: 16px;
  margin: 10px 0;
  border-radius: 7px;
  background-image: linear-gradient(
    90deg,
    #545466 0px,
    #515161 40px,
    #3d3d4e 80px
  );
  background-size: 600px;
  animation: shine-lines 2s infinite ease-out;
}

@keyframes shine-lines {
  0% {
    background-position: -100px;
  }
  40%,
  100% {
    background-position: 140px;
  }
}
</style>
