import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", () => {
  const isFetching = ref(false);
  const data = ref<{
    email?: string;
    address?: string;
    phone?: string;
    whatsApp?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    telegram?: string;
    discord?: string;
    linkedIn?: string;
    onLiveChat?: boolean;
    onWhatsApp?: boolean;
    onTestimonies?: boolean;
  }>({});
  function fetching(value: boolean) {
    isFetching.value = value;
  }
  return { isFetching, fetching, data };
});
