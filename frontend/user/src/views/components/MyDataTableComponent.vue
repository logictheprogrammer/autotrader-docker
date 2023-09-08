<template>
  <div :class="`table-responsive ${wrap ? '' : 'text-nowrap'}`">
    <table :id="id" class="display">
      <slot></slot>
    </table>
  </div>
</template>

<script setup lang="ts">
let tableX: any
const props = defineProps<{
  ordering?: boolean
  searching?: boolean
  order?: [number, string?]
  wrap?: boolean
}>()
const id = 'data-' + Math.ceil(Math.random() * 10000)
onMounted(() => {
  tableX = window.$('#' + id).DataTable({
    ordering: props.ordering || false,
    searching: props.searching || false,
    order: props.order || [0, 'asc'],
    lengthChange: false,
    language: {
      paginate: {
        next: '<i class="fa fa-angle-double-right" aria-hidden="true"></i>',
        previous: '<i class="fa fa-angle-double-left" aria-hidden="true"></i>',
      },
    },
  })

  const element = document.querySelector(`#${id}_wrapper .display.dataTable`)!

  const parent = element.parentNode!
  const wrapper = document.createElement('div')

  wrapper.classList.add('table-container')

  // set the wrapper as child (instead of the element)
  parent.replaceChild(wrapper, element)
  // set element as child of wrapper
  wrapper.appendChild(element)
})

onBeforeUnmount(() => {
  tableX.destroy()
})
</script>

<style scoped>
table {
  width: 100% !important;
  min-width: auto !important;
}
</style>

<style>
.dataTables_wrapper .dataTables_filter {
  margin: 0;
}

.dataTables_wrapper .dataTables_filter {
  float: none;
  text-align: unset;
}

.dataTables_wrapper .dataTables_filter label {
  margin: 0.5rem 1rem;
}
</style>
