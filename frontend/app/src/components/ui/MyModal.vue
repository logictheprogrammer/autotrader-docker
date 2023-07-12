<template>
  <Teleport to="#modal">
    <Transition>
      <div v-if="isModalOpen">
        <Form @submit="$emit('confirm')">
          <div
            class="modal fade show d-block"
            @click.self="closeSelf && $emit('close')"
          >
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header" v-if="title">
                  <h5 class="modal-title">{{ title }}</h5>
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="btn-close text-white"
                  ></button>
                </div>
                <div class="modal-body">
                  <slot></slot>
                </div>
                <div class="text-center mb-4" v-if="oneBtn">
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="btn btn-outline-secondary"
                  >
                    {{ closeBtn || "Ok" }}
                  </button>
                </div>
                <div v-if="!oneBtn" :class="`modal-footer`">
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="btn btn-outline-danger"
                  >
                    {{ closeBtn || "Close" }}
                  </button>
                  <button class="btn btn-outline-primary">
                    {{ confirmBtn || "Confirm" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Form>
        <div class="modal-backdrop fade show"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Form } from "vee-validate";

defineEmits(["close", "confirm"]);
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  oneBtn: Boolean,
  closeBtn: String,
  confirmBtn: String,
  title: String,
  closeSelf: Boolean,
});

const isModalOpen = ref(false);
const isOpen = computed(() => props.isOpen);

watch(isOpen, (isOpen) => {
  if (isOpen) showModal();
  else closeModal();
});

const closeModal = () => {
  isModalOpen.value = false;
  window.$("body").removeClass("overflow-hidden-modal");
};

const showModal = () => {
  isModalOpen.value = true;
  window.$("body").addClass("overflow-hidden-modal");
};
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
