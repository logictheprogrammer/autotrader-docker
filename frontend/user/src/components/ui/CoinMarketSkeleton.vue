<template>
  <div
    class="overflow-hidden"
    style="
      border: 3px solid var(--background);
      border-radius: 1.5rem;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      min-width: 285px;
    "
  >
    <div
      style="
        display: flex;
        padding: 12px 0px;
        background-color: var(--background);
      "
      class="skeleton-box"
    >
      <div
        style="
          width: 33%;
          display: flex;
          justify-content: center;
          align-items: center;
        "
        class="opacity-0"
      >
        <img
          style="width: 46px; height: 46px"
          src="https://s2.coinmarketcap.com/static/img/coins/64x64/1.png"
        />
      </div>
      <div
        class="opacity-0"
        style="width: 67%; border: none; text-align: left; line-height: 1.4"
      >
        <span style="font-size: 18px" class="text-white">Bitcoin (BTC)</span>
        <br />
        <span style="font-size: 16px">
          <span style="font-size: 20px; font-weight: 500">20,104.76</span>
          <span style="font-size: 14px; font-weight: 500">USD</span>
          <span style="margin-left: 6px; font-weight: 500"
            ><span style="color: #d94040">(-7.73%)</span> <br /><span
              style="font-size: 14px; color: rgba(var(--primary-rgb), 0.5)"
              >20,104.76 USD
            </span>
          </span>
        </span>
      </div>
    </div>
    <div
      style="border-top: 2px solid var(--background); clear: both"
      class="skeleton-box"
    >
      <div
        style="
          text-align: center;
          float: left;
          width: 33%;
          font-size: 12px;
          padding: 12px 0;
          border-right: 3px solid var(--background);
          line-height: 1em;
        "
        class="opacity-0"
      >
        RANK <br /><br />
        <span style="font-size: 18px" class="text-white">1</span>
      </div>
      <div
        style="
          text-align: center;
          float: left;
          width: 33%;
          font-size: 12px;
          padding: 12px 0 16px 0;
          border-right: 3px solid var(--background);
          line-height: 1em;
        "
        class="opacity-0"
      >
        MARKET CAP <br /><br />
        <span class="text-white">
          $388.28 B <span style="font-size: 12px">USD</span></span
        >
      </div>
      <div
        style="
          text-align: center;
          float: left;
          width: 33%;
          font-size: 12px;
          padding: 12px 0 16px 0;
          line-height: 1em;
        "
        class="opacity-0"
      >
        VOLUME <br /><br />
        <span style="font-size: 16px" class="text-white"
          >$34.54 B <span style="font-size: 12px">USD</span></span
        >
      </div>
    </div>
    <div
      style="
        border-top: 2px solid var(--background);
        text-align: center;
        clear: both;
        font-size: 12px;
        font-style: italic;
        padding: 8px 0;
        background-color: var(--background);
      "
    ></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.skeleton-box {
  position: relative;
  overflow: hidden;
}
.skeleton-box::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(255, 255, 255, 0.3) 60%,
    rgba(255, 255, 255, 0)
  );
  -webkit-animation: shimmer 2s infinite;
  animation: shimmer 2s infinite;
  content: "";
}
@-webkit-keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
