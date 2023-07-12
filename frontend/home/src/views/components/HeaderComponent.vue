<template>
  <div>
    <header :class="`header ${showMenu && 'header--active'}`">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="header__content">
              <!-- btn -->
              <button
                :class="`header__btn ${showMenu && 'header__btn--active'}`"
                type="button"
                aria-label="header__nav"
                @click="toggleMenu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
              <!-- end btn -->

              <RouterLink :to="{ name: 'home' }" class="header__logo"
                ><img src="/img/logo.svg" alt=""
              /></RouterLink>
              <span class="header__tagline">
                {{ CONFIG.appName }} <br />{{ CONFIG.appSlogan }}
              </span>

              <!-- navigation -->
              <ul
                :class="`header__nav ${showMenu && 'header__nav--active'}`"
                id="header__nav"
              >
                <li class="dropdown header__dropdown">
                  <RouterLink :to="{ name: 'home' }" @click="closeMenu"
                    >Home</RouterLink
                  >
                </li>
                <li class="dropdown header__dropdown">
                  <RouterLink :to="{ name: 'exchange' }" @click="closeMenu"
                    >Exchange</RouterLink
                  >
                </li>
                <li class="dropdown header__dropdown">
                  <RouterLink :to="{ name: 'traders' }" @click="closeMenu"
                    >Traders</RouterLink
                  >
                </li>
                <li class="dropdown header__dropdown">
                  <RouterLink :to="{ name: 'about' }" @click="closeMenu"
                    >About</RouterLink
                  >
                </li>
                <li class="dropdown header__dropdown">
                  <RouterLink :to="{ name: 'contact' }" @click="closeMenu"
                    >Contact</RouterLink
                  >
                </li>
              </ul>
              <!-- end navigation -->

              <!-- wallet -->
              <RouterLink :to="{ name: 'signup' }" class="header__cta"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-box-arrow-in-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                  />
                </svg>
                <span>Join Now</span></RouterLink
              >
              <!-- end wallet -->
            </div>
          </div>
        </div>
      </div>
    </header>
  </div>
  <!-- wallet modal -->
  <div id="modal-wallet" class="zoom-anim-dialog mfp-hide modal">
    <button class="modal__close" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M13.41,12l6.3-6.29a1,1,0,1,0-1.42-1.42L12,10.59,5.71,4.29A1,1,0,0,0,4.29,5.71L10.59,12l-6.3,6.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l6.29,6.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z"
        />
      </svg>
    </button>

    <h4 class="modal__title">Connect Wallet</h4>

    <p class="modal__text">
      Choose one of available wallet providers or create a new wallet.
    </p>

    <a href="#" class="modal__wallet">
      <img src="/img/wallet/metamask.svg" alt="" />
      <span>MetaMask</span>
    </a>

    <a href="#" class="modal__wallet">
      <img src="/img/wallet/coinbase.svg" alt="" />
      <span>Coinbase Wallet</span>
    </a>

    <a href="#" class="modal__wallet">
      <img src="/img/wallet/walletconnect.svg" alt="" />
      <span>WalletConnect</span>
    </a>

    <a href="#" class="modal__wallet">
      <img src="/img/wallet/myetherwallet.svg" alt="" />
      <span>MyEtherWallet</span>
    </a>

    <a href="#" class="modal__wallet">
      <img src="/img/wallet/fortmatic.svg" alt="" />
      <span>Fortmatic</span>
    </a>
  </div>
  <!-- end wallet modal -->
</template>

<script setup lang="ts">
const showMenu = ref(false)
const toggleMenu = () => (showMenu.value = !showMenu.value)
const closeMenu = () => (showMenu.value = false)
</script>

<style scoped></style>
