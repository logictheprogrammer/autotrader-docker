<template>
  <div class="col-xl-4 col-lg-6 col-sm-12">
    <div class="card">
      <div
        class="card-header border-0 pb-0 justify-content-start align-items-stretch gap-2"
      >
        <div class="media me-2 rounded-profile overflow-hidden">
          <img alt="image" width="50" src="/images/avatar/4.jpg" />
        </div>
        <div class="d-flex flex-column justify-content-between">
          <h2 class="card-title fw-bold">{{ investment.planObject.name }}</h2>
          <div class="d-flex gap-2 align-items-center">
            <p class="mb-0">{{ investment.planObject.engine }}</p>
            <span
              :class="`badge light badge-${Helpers.toStatus(
                investment.status
              )}`"
              >{{ Helpers.toTitleCase(investment.status) }}
            </span>
          </div>
        </div>
      </div>
      <div class="card-body pb-0">
        <p>
          {{ investment.description }}
        </p>
      </div>
      <hr class="mt-2" />
      <div class="card-body pt-0">
        <ul>
          <li class="text-white mb-2 d-flex gap-2 align-items-center">
            Assets:
            <div class="ms-3 fs-5 avatar-group1">
              <a
                v-for="asset in investment.planObject.assets.slice().reverse()"
                :key="asset._id"
                class="avatar-group-item1"
                href="javascript: void(0);"
                ><img
                  :src="`/icons/crypto-svg/${asset.logo}`"
                  class=""
                  :alt="`${asset.name}`"
                  width="24"
              /></a>
            </div>
          </li>
          <li class="text-white mb-2">
            Time Remaining:
            <span class="ms-3 fw-bold text-cyan2 fs-5">
              {{ timeRemaining }}
            </span>
          </li>

          <li class="text-white mb-2">
            Amount Invested:
            <span class="ms-3 fw-bold text-primary fs-5"
              >{{ Helpers.toDollar(investment.amount) }}
            </span>
          </li>
          <li class="text-white mb-2">
            Profit Earned:
            <span class="ms-3 fw-bold text-success fs-5">
              {{ Helpers.toDollar(0.4) }}
            </span>
          </li>
          <li class="text-white mb-2">
            Expected Profit:
            <span class="ms-3 fw-bold text-success fs-5">
              {{
                Helpers.toDollar(
                  (investment.minProfit * investment.amount) / 100
                )
              }}
              -
              {{
                Helpers.toDollar(
                  (investment.maxProfit * investment.amount) / 100
                )
              }}
            </span>
          </li>
        </ul>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IInvestment } from '@/modules/investment/investment.interface'

const props = defineProps<{
  investment: IInvestment
}>()

const timeRemaining = ref(
  Helpers.timeRemaining(
    new Date(props.investment.createdAt).getTime() + props.investment.duration
  )
)

const timeRemainingTimer = setInterval(() => {
  timeRemaining.value = Helpers.timeRemaining(
    new Date(props.investment.createdAt).getTime() + props.investment.duration
  )
}, 60000)

onBeforeUnmount(() => {
  clearInterval(timeRemainingTimer)
})
</script>

<style>
.avater-group1 {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}

.avatar-group1 .avatar-group-item1 {
  margin-left: -12px;
  border: 2px solid #1d263b;
  border-radius: 50%;
  -webkit-transition: all 0.2s;
  transition: all 0.2s;
  display: inline-block;
}
</style>
