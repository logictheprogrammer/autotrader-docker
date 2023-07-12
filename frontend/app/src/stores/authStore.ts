import { ref } from "vue";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", () => {
  const isRequesting = ref(false);
  const isLoading = ref(false);

  function requesting(value: boolean) {
    isRequesting.value = value;
  }
  function loading(value: boolean) {
    isLoading.value = value;
  }
  return { isLoading, isRequesting, loading, requesting };
});
