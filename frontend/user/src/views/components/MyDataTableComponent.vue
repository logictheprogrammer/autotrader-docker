<template>
  <div class="table-responsive">
    <table :id="id" class="display" style="min-width: 845px">
      <slot></slot>
    </table>
  </div>
</template>

<script setup lang="ts">
let tableX: any
const props = defineProps(['ordering'])
const id = 'data-' + Math.ceil(Math.random() * 10000)
onMounted(() => {
  tableX = window.$('#' + id).DataTable({
    ordering: props.ordering || false,
    searching: false,
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

<style scoped></style>
