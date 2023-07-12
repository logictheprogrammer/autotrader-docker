<template>
  <div class="row" v-if="page === 1">
    <div class="col-xl-12 col-xxl-4">
      <div class="card bg-blue action-card">
        <div class="card-body text-white">
          <img src="/images/pattern/circle.png" class="mb-4" alt="" />
          <div class="row">
            <div class="col-12 text-center">
              <h2 class="text-white fs-36">$8,571.93</h2>
              <p class="fs-16">Current Balance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-xl-12 col-xxl-8">
      <div class="card">
        <div class="card-body py-4">
          <div class="settings-form">
            <form>
              <PaymentMethod></PaymentMethod>
              <div class="row mt-4">
                <div class="mb-3 col-12">
                  <label class="form-label">Amount</label>
                  <input
                    type="number"
                    placeholder="Amount"
                    class="form-control"
                  />
                </div>
                <div class="text-center mt-2">
                  <button class="btn btn-primary" type="button">Pay Now</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" v-else>
    <div class="card-header">
      <h4 class="card-title">Make Payment and Confirm</h4>
    </div>
    <div class="card-body">
      <p class="fs-18 text-center mx-auto mb-4" style="max-width: 490px">
        SEND <span class="fw-bold text-info">$ 1,000</span> TO THE WALLET
        ADDRESS BELOW OR SCAN THE QR CODE WITH YOUR WALLET APP
      </p>
      <div class="row">
        <div class="col-lg-5 mb-3 mb-lg-0">
          <div
            class="d-flex justify-content-center align-items-center h-100 flex-column"
          >
            <div class="bg-background p-4 rounded">
              <div class="p-2 bg-skin rounded-2">
                <MyQRCode></MyQRCode>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-7">
          <div class="mb-3">
            <label class="form-label">Coin Name</label>
            <input
              type="text"
              placeholder="Coin Name"
              class="form-control"
              value="Bitcoin - (BTC)"
              readonly
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Network</label>
            <input
              type="text"
              placeholder="Coin Network"
              class="form-control"
              value="Trc20"
              readonly
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Wallet Address</label>
            <input
              type="text"
              placeholder="Wallet Address"
              class="form-control"
              value="hsdgsfsiufsidufd"
              readonly
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Amount</label>
            <input
              type="text"
              placeholder="Amount"
              class="form-control"
              value="$ 3000"
              readonly
            />
          </div>
        </div>
        <div class="col-lg-5">
          <p class="text-info mt-3 text-primary text-center">
            Awaiting payment...
          </p>
        </div>
      </div>

      <div class="d-flex justify-content-center gap-3 mt-3">
        <RouterLink :to="{ name: 'withdraw' }" class="btn btn-secondary"
          >Go Back</RouterLink
        >
        <RouterLink :to="{ name: 'deposit' }" class="btn btn-primary"
          >Confirm</RouterLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const page = ref(1);
</script>

<style scoped></style>
