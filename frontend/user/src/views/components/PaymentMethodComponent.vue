<template>
  <div class="payment-form form">
    <div class="payment-type d-block">
      <div class="row g-2">
        <div class="col-6 col-md-3">
          <input
            type="radio"
            name="radio3"
            id="credit"
            value="credit"
            checked
          /><label
            class="credit-label payment-cards overflow-hidden text-nowrap"
            for="credit"
            ><span class="d-block">New card</span
            ><img src="/svg/crypto-icons/usdt.svg" alt="visa"
          /></label>
        </div>
        <div class="col-6 col-md-3">
          <input type="radio" name="radio3" id="debit" value="debit" /><label
            class="debit-label payment-cards overflow-hidden text-nowrap"
            for="debit"
            ><span class="d-block">Debit Card</span
            ><img src="/svg/crypto-icons/btc.svg" alt="Debitcard"
          /></label>
        </div>
        <div class="col-6 col-md-3">
          <input type="radio" name="radio3" id="paypal" value="paypal" /><label
            class="paypal-label payment-cards overflow-hidden text-nowrap"
            for="paypal"
            ><span class="d-block">Paypal</span
            ><img src="/svg/crypto-icons/eth.svg" alt="paypal"
          /></label>
        </div>
        <div class="col-6 col-md-3">
          <input type="radio" name="radio3" id="amex" value="amex" /><label
            class="amex-label payment-cards overflow-hidden text-nowrap"
            for="amex"
            ><span class="d-block">Amex</span
            ><img src="/svg/crypto-icons/ltc.svg" alt="amexg1096"
          /></label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.payment-type {
  display: flex;
}

.payment-type input {
  display: none;
}

.payment-cards {
  position: relative;
  color: #707894;
  background-color: transparent;
  font-size: 26px;
  text-align: center;
  height: 87px;
  line-height: 46px;
  display: block;
  font-size: 16px;
  cursor: pointer;
  border: 2px solid var(--background);
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 12px;
  font-weight: 400;
  margin-bottom: 0;
}

.payment-cards img {
  position: absolute;
  top: 37px;
  opacity: 0.8;
  height: 32px;
  margin: 0 auto;
  justify-content: center;
  text-align: center;
  left: 0;
  right: 0;
}

input:checked + label.payment-cards {
  border-color: var(--primary) !important;
  position: relative !important;
  display: block !important;
  border-width: 2px;
  color: var(--primary);
}

.form input:checked + label:after {
  content: '';
  width: 20px;
  height: 20px;
  line-height: 17px;
  border-style: solid;
  border-width: 0 35px 35px 0px;
  border-color: var(--primary) var(--primary) transparent;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
}

.form input:checked + label:after {
  content: '';
  width: 20px;
  height: 20px;
  line-height: 17px;
  border-style: solid;
  border-width: 0 35px 35px 0px;
  border-color: var(--primary) var(--primary) transparent;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
}

.form input:checked + label:before {
  content: '\2713';
  z-index: 999;
  position: absolute;
  top: -11px;
  right: 4px;
  font-size: 14px;
  color: #ffffff;
}
</style>
