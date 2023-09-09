<template>
  <div class="row">
    <div class="col-xl-4">
      <ReferralDetailsWidget
        :total-referred="referralUsers.length"
        :total-referral-earnings="totalReferralEarnings"
      />
    </div>
    <div class="col-xl-8">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Active Referred Users</h4>
        </div>
        <EmptyResourceComponent
          v-if="referralUsersLoaded && !referralUsers?.length"
        >
          No Referral Record Found
        </EmptyResourceComponent>
        <div class="card-body pt-0 px-0" v-else>
          <TablePreview v-if="!referralUsersLoaded" :rows="8" :cols="6" />
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
                v-for="(referral, i) in referralUsers"
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
        <EmptyResourceComponent v-if="referralLoaded && !referrals?.length">
          No Referral Earnings Record Found
        </EmptyResourceComponent>
        <div class="card-body pt-0 px-0" v-else>
          <TablePreview v-if="!referralLoaded" :rows="8" :cols="6" />
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
              <tr v-for="(referral, i) in referrals" :key="referral._id">
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

// Referral Users
const referralUsers = computed(() => referralStore.referralUsers)
const referralUsersLoaded = computed(() => referralStore.referralUsersLoaded)
// fetch referrals if not fetched
if (!referralUsersLoaded.value) referralStore.fetchAllReferralUsers()

// Referral Earnings
const referrals = computed(() => referralStore.referrals)
const referralLoaded = computed(() => referralStore.loaded)
// fetch referrals if not fetched
if (!referralLoaded.value) referralStore.fetchAll()

// Referral Balance
const totalReferralEarnings = ref(0)

if (referralLoaded.value) {
  totalReferralEarnings.value = referralUsers.value.reduce((acc, ele) => {
    return acc + ele.earnings
  }, 0)
}

watch(referralUsersLoaded, () => {
  totalReferralEarnings.value = referralUsers.value.reduce((acc, ele) => {
    return acc + ele.earnings
  }, 0)
})
</script>

<style scoped></style>
