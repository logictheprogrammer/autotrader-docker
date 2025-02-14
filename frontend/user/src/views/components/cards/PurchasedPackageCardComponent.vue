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
          <h2 class="card-title fw-bold">
            {{ investment.plan?.name || 'Unknown' }}
          </h2>
          <div class="d-flex gap-2 align-items-center">
            <p class="mb-0">{{ investment.plan?.engine || 'Unknown' }}</p>
            <span
              :class="`badge light badge-${Helpers.toStatus(
                investment.status
              )}`"
              >{{ Helpers.toTitleCase(investment.status) }}
            </span>
          </div>
        </div>
      </div>
      <hr class="mt-2" />
      <div class="card-body pt-0">
        <ul>
          <li class="text-white mb-2 d-flex gap-2 align-items-center">
            Assets:
            <div class="ms-3 fs-5 avatar-group1">
              <a
                v-for="asset in investment.assets.slice().reverse()"
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
            Amount Invested:
            <span class="ms-3 fw-bold text-primary fs-5"
              >{{ Helpers.toDollar(investment.amount) }}
            </span>
          </li>
          <li class="text-white mb-2">
            Profit
            {{
              investment.status === InvestmentStatus.COMPLETED
                ? 'Received'
                : 'Accumulated'
            }}:
            <span
              :class="`ms-3 fw-bold ${
                investment.status === InvestmentStatus.SUSPENDED
                  ? 'text-warning'
                  : 'text-success'
              }  fs-5`"
            >
              {{
                investment.status === InvestmentStatus.COMPLETED
                  ? Helpers.toDollar(expectedProfit + investment.extraProfit)
                  : Helpers.toDollar(profitEarned)
              }}
            </span>
          </li>
          <!-- <li class="text-white mb-2">
            Expected Profit:
            <span class="ms-3 fw-bold text-cyan2 fs-5">
              {{ Helpers.toDollar(expectedProfit) }}
            </span>
          </li> -->
        </ul>
        <hr class="mt-3 mb-2" />
        <p class="text-center mb-0">
          {{
            investment.status === InvestmentStatus.COMPLETED
              ? 'Investment Completed'
              : investment.status === InvestmentStatus.SUSPENDED
              ? 'Investment suspended, contact support for more information'
              : 'This Investment Will Complete In'
          }}
        </p>
        <vue-countdown
          :time="timeRemaining"
          v-slot="{ days, hours, minutes, seconds }"
        >
          <div class="d-flex gap-2 mt-2">
            <div
              v-if="days"
              class="w-100 d-flex gap-2 flex-column justify-content-center align-items-center"
            >
              <button
                :disabled="investment.status === InvestmentStatus.SUSPENDED"
                :class="`btn light ${
                  investment.status === InvestmentStatus.SUSPENDED
                    ? ' opacity-50'
                    : ''
                } btn-dark px-3 w-100 fw-bold`"
                title="Days"
              >
                {{
                  investment.status === InvestmentStatus.RUNNING
                    ? daysLeft
                    : investment.status === InvestmentStatus.COMPLETED
                    ? 0
                    : days
                }}
              </button>
              <span class="fw-bold">Days</span>
            </div>
            <div
              class="w-100 d-flex gap-2 flex-column justify-content-center align-items-center"
            >
              <button
                :disabled="investment.status === InvestmentStatus.SUSPENDED"
                :class="`btn light ${
                  investment.status === InvestmentStatus.SUSPENDED
                    ? ' opacity-50'
                    : ''
                } btn-dark px-3 w-100 fw-bold`"
                title="Hours"
              >
                {{
                  investment.status === InvestmentStatus.RUNNING
                    ? hours
                    : investment.status === InvestmentStatus.COMPLETED
                    ? 0
                    : hoursLeft
                }}
              </button>
              <span class="fw-bold">Hours</span>
            </div>
            <div
              class="w-100 d-flex gap-2 flex-column justify-content-center align-items-center"
            >
              <button
                :disabled="investment.status === InvestmentStatus.SUSPENDED"
                :class="`btn light ${
                  investment.status === InvestmentStatus.SUSPENDED
                    ? ' opacity-50'
                    : ''
                } btn-dark px-3 w-100 fw-bold`"
                title="Minutes"
              >
                {{
                  investment.status === InvestmentStatus.RUNNING
                    ? minutes
                    : investment.status === InvestmentStatus.COMPLETED
                    ? 0
                    : minutesLeft
                }}
              </button>
              <span class="fw-bold">Minutes</span>
            </div>
            <div
              v-if="!days"
              class="w-100 d-flex gap-2 flex-column justify-content-center align-items-center"
            >
              <button
                :disabled="investment.status === InvestmentStatus.SUSPENDED"
                :class="`btn light ${
                  investment.status === InvestmentStatus.SUSPENDED
                    ? ' opacity-50'
                    : ''
                } btn-dark px-3 w-100 fw-bold`"
                title="Seconds"
              >
                {{
                  investment.status === InvestmentStatus.RUNNING
                    ? seconds
                    : investment.status === InvestmentStatus.COMPLETED
                    ? 0
                    : secondsLeft
                }}
              </button>
              <span class="fw-bold">Seconds</span>
            </div>
          </div>
        </vue-countdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IInvestment } from '@/modules/investment/investment.interface'

const props = defineProps<{
  investment: IInvestment
}>()

const expectedProfit = computed(() => {
  return (
    ((props.investment.plan?.potentialPercentageProfit || 250) *
      props.investment.amount) /
    100
  )
})

const runTime = computed(() => {
  return (
    props.investment.runTime +
    (props.investment.status === InvestmentStatus.RUNNING
      ? new Date().getTime() - new Date(props.investment.resumeTime).getTime()
      : 0)
  )
})

const profitEarned = computed(() => {
  return (
    (expectedProfit.value * runTime.value) / props.investment.expectedRunTime +
    props.investment.extraProfit
  )
})

const timeRemaining = computed(() => {
  return props.investment.expectedRunTime - runTime.value
})

const daysLeft = computed(() => {
  return Math.floor(timeRemaining.value / (1000 * 60 * 60 * 24))
})

const hoursLeft = computed(() => {
  return Math.floor(
    (timeRemaining.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )
})

const minutesLeft = computed(() => {
  return Math.floor((timeRemaining.value % (1000 * 60 * 60)) / (1000 * 60))
})

const secondsLeft = computed(() => {
  return Math.floor((timeRemaining.value % (1000 * 60)) / 1000)
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
