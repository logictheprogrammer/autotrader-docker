import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Plan } from "@/types/plan";
import { DUMMY_PLANS } from "@/data/dummyPlans";

export const usePlanStore = defineStore("plan", () => {
  const isFetching = ref(false);
  const isPosting = ref(false);
  const plans = ref<Plan[]>(DUMMY_PLANS);

  function fetching(value: boolean) {
    isFetching.value = value;
  }
  function posting(value: boolean) {
    isPosting.value = value;
  }

  return { isFetching, isPosting, plans, fetching, posting };
});
