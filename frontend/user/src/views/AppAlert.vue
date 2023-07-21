<template>
  <ModalComponent
    :is-open="isOpen"
    @confirm="closeModal"
    @close="closeModal"
    :only-one-btn="true"
    :close-self="true"
    confirm-btn-text="Close"
  >
    <div class="overflow-hidden">
      <SuccessAlertIcon
        v-if="httpStore.post.status === ResponseStatus.SUCCESS"
      />
      <InfoAlertIcon v-if="httpStore.post.status === ResponseStatus.INFO" />
      <WarningAlertIcon
        v-if="httpStore.post.status === ResponseStatus.WARNING"
      />
      <DangerAlertIcon v-if="httpStore.post.status === ResponseStatus.ERROR" />
    </div>
    <h2 class="text-center text-lower text-gray mb-3">
      {{ httpStore.post.title }}
    </h2>
    <p class="text-center">
      {{ httpStore.post.body }}
    </p>
  </ModalComponent>
</template>

<script setup lang="ts">
const httpStore = useHttpStore()

const isOpen = ref(false)

let autoClose: any

const postTriggered = computed(() => httpStore.post.triggered)

const closeModal = () => {
  httpStore.untriggerPost()
}

watch(isOpen, (currentValue) => {
  if (currentValue) {
    autoClose = setTimeout(() => {
      closeModal()
    }, 7000)
  } else {
    clearTimeout(autoClose)
  }
})

watch(postTriggered, (currentValue) => {
  isOpen.value = currentValue
})
</script>

<style scoped></style>
