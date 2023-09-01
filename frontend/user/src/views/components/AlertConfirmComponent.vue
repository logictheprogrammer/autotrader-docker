<template>
  <ModalComponent
    :is-open="isOpen"
    @confirm="$emit('confirm')"
    @close="$emit('close')"
    :confirm-btn-text="`${confirmBtnText ? confirmBtnText : 'Yes, Continue'}`"
    :close-btn-text="`${closeBtnText ? closeBtnText : 'No, Close'}`"
  >
    <div class="overflow-hidden">
      <SuccessAlertIcon v-if="status === ResponseStatus.SUCCESS" />
      <InfoAlertIcon v-if="status === ResponseStatus.INFO" />
      <WarningAlertIcon v-if="status === ResponseStatus.WARNING" />
      <ErrorAlertIcon v-if="status === ResponseStatus.ERROR" />
      <DangerAlertIcon v-if="status === ResponseStatus.DANGER" />
    </div>
    <h2 class="text-center text-lower text-sharp mb-3">
      {{ title }}
    </h2>
    <p class="text-center fs-16">
      {{ message }}
    </p>
  </ModalComponent>
</template>

<script setup lang="ts">
import type { ResponseStatus } from '@/modules/http/http.enum'
import ErrorAlertIcon from './alert-icons/ErrorAlertIcon.vue'

defineProps<{
  status: ResponseStatus
  title: string
  isOpen: boolean
  message?: string
  confirmBtnText?: string
  closeBtnText?: string
}>()

defineEmits(['confirm', 'close'])
</script>

<style scoped></style>
