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
        v-if="httpStore.responseStatus === ResponseStatus.SUCCESS"
      />
      <InfoAlertIcon v-if="httpStore.responseStatus === ResponseStatus.INFO" />
      <WarningAlertIcon
        v-if="httpStore.responseStatus === ResponseStatus.WARNING"
      />
      <DangerAlertIcon
        v-if="httpStore.responseStatus === ResponseStatus.ERROR"
      />
    </div>
    <h2 class="text-center text-lower text-gray mb-3">
      {{ httpStore.titleMessage }}
    </h2>
    <p class="text-center">
      {{ httpStore.bodyMessage }}
    </p>
  </ModalComponent>
</template>

<script setup lang="ts">
const httpStore = useHttpStore()

const isOpen = ref(false)

let autoClose: any

const requestTriggered = computed(() => httpStore.requestTriggered)

const closeModal = () => {
  httpStore.unsetRequestTriggered()
}

watch(isOpen, (currentValue) => {
  if (currentValue) {
    autoClose = setTimeout(() => {
      closeModal()
    }, 5000)
  } else {
    clearTimeout(autoClose)
  }
})

watch(requestTriggered, (currentValue) => {
  isOpen.value = currentValue
})
</script>

<style scoped></style>
