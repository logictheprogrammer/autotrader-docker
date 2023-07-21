<template>
  <Teleport to="#modal">
    <Transition name="modal">
      <div v-if="isModalOpen" class="custom-modal">
        <div
          @click.self="clicked"
          class="custom-modal-wrapper"
          :class="{ 'custom-clicked': staticClicked }"
        >
          <div class="custom-modal-container">
            <Form @submit="$emit('confirm')" class="custom-modal-content">
              <div class="custom-modal-header" v-if="title">
                <h5 class="custom-modal-title">{{ title }}</h5>
                <button
                  type="button"
                  @click="$emit('close')"
                  class="btn-close text-white"
                ></button>
              </div>
              <div class="custom-modal-body">
                <slot></slot>
              </div>
              <div v-if="onlyOneBtn">
                <button class="btn" type="submit">
                  {{ confirmBtnText || 'Ok' }}
                </button>
              </div>
              <div v-else class="custom-modal-footer">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="btn btn-secondary"
                >
                  {{ closeBtnText || 'Close' }}
                </button>
                <button class="btn btn-primary" type="submit">
                  {{ confirmBtnText || 'Confirm' }}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const edmit = defineEmits(['close', 'confirm'])
const props = defineProps<{
  isOpen: boolean
  onlyOneBtn?: boolean
  closeBtnText?: string
  confirmBtnText?: string
  title?: string
  closeSelf?: boolean
  class?: string
}>()

const isModalOpen = ref(false)
const isOpen = computed(() => props.isOpen)

watch(isOpen, (isOpen) => {
  if (isOpen) showModal()
  else closeModal()
})

const staticClicked = ref(false)
const clicked = () => {
  if (props.closeSelf) {
    edmit('close')
  } else {
    staticClicked.value = true
    setTimeout(() => {
      staticClicked.value = false
    }, 300)
  }
}

const closeModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    window.$('body').removeClass('modal-overflow')
  }, 500)
}

const showModal = () => {
  isModalOpen.value = true
  window.$('body').addClass('modal-overflow')
}
</script>

<style scoped>
.custom-modal {
  border-radius: 0;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  opacity: 1;
  display: block;
  transition: opacity 0.2s ease-in-out;
  z-index: 600;
}
.custom-modal-wrapper {
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.custom-modal-container {
  background-color: #1d263b;
  border-radius: 30px;
  color: white;
  max-width: 500px;
  width: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.2s ease-in-out;
  margin: 1.75rem auto;
  opacity: 1;
  max-height: calc(100vh - 5.5rem);
  display: flex;
}
.custom-modal-content {
  padding: 30px 20px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.custom-modal-body {
  overflow-y: auto;
  margin-bottom: 20px;
}
.custom-modal-wrapper.custom-clicked .custom-modal-container {
  -webkit-transform: scale(1.03);
  transform: scale(1.03);
}
.custom-modal-footer {
  margin-top: 15px;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .custom-modal-container,
.modal-leave-to .custom-modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
