<template>
  <table :id="id" class="display" style="min-width: 845px">
    <slot></slot>
  </table>
</template>

<script setup lang="ts">
let tableX: any;
const props = defineProps<{
  ordering?: boolean;
  searching?: boolean;
  lengthChange?: boolean;
  paging?: boolean;
  info?: boolean;
}>();
console.log(props.info);
const id =
  "data-" +
  Math.ceil(Math.random() * 1000000000) +
  "-" +
  Math.ceil(Math.random() * 1000000000);
onMounted(() => {
  tableX = window.$("#" + id).DataTable({
    info: !props.info,
    paging: !props.paging,
    ordering: props.ordering,
    searching: props.searching,
    lengthChange: props.lengthChange,
    language: {
      paginate: {
        next: '<i class="fa fa-angle-double-right" aria-hidden="true"></i>',
        previous: '<i class="fa fa-angle-double-left" aria-hidden="true"></i>',
      },
    },
  });

  const element = document.querySelector(`#${id}_wrapper .display.dataTable`)!;

  const parent = element.parentNode!;
  const wrapper = document.createElement("div");

  wrapper.classList.add("table-container");

  // set the wrapper as child (instead of the element)
  parent.replaceChild(wrapper, element);
  // set element as child of wrapper
  wrapper.appendChild(element);
});

onBeforeUnmount(() => {
  tableX.destroy();
});
</script>

<style scoped></style>
