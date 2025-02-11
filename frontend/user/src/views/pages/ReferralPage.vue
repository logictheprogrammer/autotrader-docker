<template>
  <div class="row">
    <div class="col-xl-4">
      <ReferralDetailsWidget
        :total-referred="referredUsers.length"
        :total-referral-earnings="totalReferralEarnings"
      />
    </div>
    <div class="col-xl-8">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Active Referred Users</h4>
        </div>
        <EmptyResourceComponent
          v-if="activeReferralsLoaded && !activeReferrals?.length"
        >
          No Referral Record Found
        </EmptyResourceComponent>
        <div class="card-body pt-0 px-0" v-else>
          <TablePreview v-if="!activeReferralsLoaded" :rows="8" :cols="6" />
          <MyDataTableComponent v-else>
            <thead class="bg-background">
              <tr>
                <th class="text-sharp d-none">Sort</th>
                <th class="text-sharp">User</th>
                <th class="text-sharp">Earnings</th>
                <th class="text-sharp">Referred</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(referral, i) in activeReferrals"
                :key="referral.user._id"
              >
                <td class="d-none">{{ i + 1 }}</td>
                <td>{{ Helpers.toTitleCase(referral.user.username) }}</td>

                <td>{{ Helpers.toDollar(referral.earnings) }}</td>
                <td>{{ Helpers.toNiceDate(referral.user.createdAt) }}</td>
              </tr>
            </tbody>
          </MyDataTableComponent>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Referral Earnings History</h4>
        </div>
        <EmptyResourceComponent
          v-if="activeReferralsLoaded && !referralEarnings?.length"
        >
          No Referral Earnings Record Found
        </EmptyResourceComponent>
        <div class="card-body pt-0 px-0" v-else>
          <TablePreview v-if="!activeReferralsLoaded" :rows="8" :cols="6" />
          <MyDataTableComponent v-else>
            <thead class="bg-background">
              <tr>
                <th class="text-sharp d-none">Sort</th>
                <th class="text-sharp">User</th>
                <th class="text-sharp">Type</th>
                <th class="text-sharp">rate</th>
                <th class="text-sharp">Credited</th>
                <th class="text-sharp">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(referral, i) in referralEarnings" :key="referral._id">
                <td class="d-none">{{ i + 1 }}</td>
                <td>{{ Helpers.toTitleCase(referral.user.username) }}</td>
                <td>{{ Helpers.toTitleCase(referral.type) }}</td>
                <td>{{ referral.rate + '%' }}</td>
                <td>{{ Helpers.toDollar(referral.amount) }}</td>
                <td>{{ Helpers.toNiceDate(referral.updatedAt) }}</td>
              </tr>
            </tbody>
          </MyDataTableComponent>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const referralStore = useReferralStore()

// Referred Users
const referredUsers = computed(() => referralStore.referredUsers)
const referredUsersLoaded = computed(() => referralStore.referredUsersLoaded)
// fetch referred users if not fetched
if (!referredUsersLoaded.value) referralStore.fetchAllReferredUsers()

// Referral Earnings
const referralEarnings = computed(() => referralStore.referralEarnings)
const referralEarningsLoaded = computed(
  () => referralStore.referralEarningsLoaded
)
// fetch referrals if not fetched
if (!referralEarningsLoaded.value) referralStore.fetchAllReferralEarnings()

// Active Referrals
const activeReferrals = computed(() => referralStore.activeReferrals)
const activeReferralsLoaded = computed(
  () => referralStore.activeReferralsLoaded
)
// fetch referrals if not fetched
if (!activeReferralsLoaded.value) referralStore.fetchAllActiveReferrals()

// Referral Balance
const totalReferralEarnings = computed(() =>
  activeReferrals.value.reduce((acc, ele) => {
    return acc + ele.earnings
  }, 0)
)
</script>

<style scoped></style>
