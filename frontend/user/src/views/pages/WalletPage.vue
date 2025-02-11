<template>
  <GeneralWalletBalanceComponent
    :main-balance="authStore.user?.mainBalance || 0"
    :referral-balance="authStore.user?.referralBalance || 0"
    :bonus-balance="authStore.user?.bonusBalance || 0"
    :profit="authStore.user?.profit || 0"
  />
  <div class="d-flex justify-content-center gap-3">
    <RouterLink :to="{ name: 'deposit' }" class="btn btn-success-2"
      >Deposit</RouterLink
    >
    <RouterLink :to="{ name: 'withdraw' }" class="btn btn-secondary"
      >Withdraw</RouterLink
    >
    <RouterLink :to="{ name: 'transfer' }" class="btn btn-primary"
      >Transfer</RouterLink
    >
  </div>
  <div class="card mt-4">
    <div class="card-header">
      <h4 class="card-title">Transaction History</h4>
    </div>
    <EmptyResourceComponent v-if="transactionLoaded && !transactions?.length">
      No Transaction Record Found
    </EmptyResourceComponent>
    <div class="card-body pt-0 px-0" v-else>
      <TablePreview v-if="!transactionLoaded" :rows="8" :cols="6" />
      <MyDataTableComponent v-else>
        <thead class="bg-background">
          <tr>
            <th class="text-sharp d-none">Sort</th>
            <th class="text-sharp">Type</th>
            <th class="text-sharp">Amount</th>
            <th class="text-sharp">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transaction, i) in transactions" :key="transaction._id">
            <td class="d-none">{{ i + 1 }}</td>
            <td>{{ Helpers.toTitleCase(transaction.title) }}</td>
            <td>{{ Helpers.toDollar(transaction.amount) }}</td>
            <td>{{ Helpers.toNiceDate(transaction.updatedAt) }}</td>
          </tr>
        </tbody>
      </MyDataTableComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

const transactionStore = useTransactionStore()
const transactions = computed(() => transactionStore.transactions)
const transactionLoaded = computed(() => transactionStore.loaded)
// fetch transaction s if not fetched
if (!transactionLoaded.value) transactionStore.fetchAll()
</script>

<style scoped></style>
