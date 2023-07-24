<template>
  <div class="row">
    <div class="col-xl-12 col-xxl-4">
      <div class="card bg-blue action-card">
        <div class="card-body text-white">
          <img src="/images/pattern/circle.png" class="mb-4" alt="" />
          <div class="row">
            <div class="col-sm-6 col-xl-12 text-center">
              <h2 class="text-white fs-36">$8,571.93</h2>
              <p class="fs-16">Main Balance</p>
            </div>
            <div class="col-sm-6 col-xl-12 text-center">
              <h2 class="text-white fs-36">$8,571.93</h2>
              <p class="fs-16">Referrals Balance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-xl-12 col-xxl-8">
      <div class="card">
        <div class="card-body">
          <div class="settings-form">
            <form>
              <div class="row mt-4">
                <div class="mb-3 col-12">
                  <label class="form-label">Withdraw From</label>
                  <AccountType></AccountType>
                </div>
                <div class="mb-3">
                  <label class="form-label">Currency</label>
                  <PaymentMethod></PaymentMethod>
                </div>
                <div class="mb-3 col-12">
                  <label class="form-label">Wallet Address</label>
                  <input
                    type="text"
                    placeholder="Wallet Address"
                    class="form-control"
                  />
                </div>
                <div class="mb-3 col-12">
                  <label class="form-label">Amount</label>
                  <input
                    type="number"
                    placeholder="Amount"
                    class="form-control"
                  />
                </div>
                <div class="text-center mt-3">
                  <button class="btn btn-primary" type="button">
                    Request Withdraw
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
