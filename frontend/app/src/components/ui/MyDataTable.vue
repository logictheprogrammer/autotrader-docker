<template>
  <div class="table-responsive">
    <table :id="id" class="display" style="min-width: 845px">
      <slot></slot>
    </table>
  </div>
</template>

<script setup lang="ts">
let tableX: any;
const props = defineProps(["ordering"]);
const id =
  "data-" +
  Math.ceil(Math.random() * 10000000000) +
  "-" +
  Math.ceil(Math.random() * 100000);
onMounted(() => {
  tableX = window.$("#" + id).DataTable({
    ordering: props.ordering || false,
    searching: false,
    lengthChange: false,
    language: {
      paginate: {
        next: '<i class="fa fa-angle-double-right" aria-hidden="true"></i>',
        previous: '<i class="fa fa-angle-double-left" aria-hidden="true"></i>',
      },
    },
  });
});

onBeforeUnmount(() => {
  tableX.destroy();
});
</script>

<style scoped></style>
