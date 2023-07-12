<template>
  <div>
    <!-- sponsors -->
    <section class="section section--light">
      <div class="container" id="awards">
        <div class="row no-gutters">
          <!-- section title -->
          <div
            class="col-12 col-md-10 offset-md-1 col-lg-6 offset-lg-0 align-self-center"
          >
            <div class="section__title section__title--grid-right">
              <strong>Award Winning</strong>
              <h2>Some Of Our <br />Major Archievements</h2>
              <p>
                The point of using Lorem Ipsum is that it has a more-or-less
                normal distribution of letters, as opposed to using 'Content
                here, content here', making it look like readable English.
              </p>
              <p>
                There are many variations of passages of Lorem Ipsum available,
                but the majority have suffered alteration in some form.
              </p>
              <RouterLink
                :to="{ name: 'signup' }"
                class="section__btn section__btn--grid"
                ><span>Join Us</span></RouterLink
              >
            </div>
          </div>
          <!-- end section title -->

          <!-- sponsors -->
          <div class="col-12 col-lg-6 align-self-center">
            <ul class="sponsors sponsors--small">
              <li>
                <a href="javascript:;">
                  <img
                    src="/img/awards/award-best-ctrader.png"
                    width="56"
                    alt=""
                  />
                  <span>
                    <div class="text-center">Best cTrader Broker</div>
                    <div class="text-center">Best cTrader</div>
                  </span>
                </a>
              </li>
              <li>
                <a href="javascript:;">
                  <img
                    src="/img/awards/award-best-fx-trading.png"
                    width="56"
                    alt=""
                  />
                  <span>
                    <div class="text-center">Best Technology</div>
                    <div class="text-center">Corporate</div>
                    <div class="text-center">Leadership</div>
                  </span>
                </a>
              </li>
              <li>
                <a href="javascript:;">
                  <img
                    src="/img/awards/award-best-crypto.png"
                    width="56"
                    alt=""
                  />
                  <span>
                    <div class="text-center">Best Crypto</div>
                    <div class="text-center">Platform</div>
                  </span>
                </a>
              </li>
              <li>
                <a href="javascript:;">
                  <img
                    src="/img/awards/award-best-trade-diamond.png"
                    width="56"
                    alt=""
                  />
                  <span>
                    <div class="text-center">Best FX</div>
                    <div class="text-center">Trading</div>
                    <div class="text-center">Platform 2018</div>
                  </span>
                </a>
              </li>
              <li>
                <a href="javascript:;">
                  <img
                    src="/img/awards/award-copy-trading-plat.png"
                    width="56"
                    alt=""
                  />
                  <span>
                    <div class="text-center">Best Trade</div>
                    <div class="text-center">Execution</div>
                  </span>
                </a>
              </li>
              <li>
                <a href="javascript:;">
                  <img
                    src="/img/awards/award-leadership.png"
                    width="56"
                    alt=""
                  />
                  <span>
                    <div class="text-center">Best Copy</div>
                    <div class="text-center">Trading</div>
                    <div class="text-center">Platform</div>
                  </span>
                </a>
              </li>
              <li>
                <a href="javascript:;">
                  <img src="/img/awards/best-retail.png" width="56" alt="" />
                  <span>
                    <div class="text-center">Best Retail</div>
                    <div class="text-center">Platform</div>
                  </span>
                </a>
              </li>
              <li>
                <a href="javascript:;">
                  <img
                    src="/img/awards/best_forex_broker.png"
                    width="56"
                    alt=""
                  />
                  <span>
                    <div class="text-center">Best Forex</div>
                    <div class="text-center">Broker</div>
                  </span>
                </a>
              </li>
            </ul>
          </div>
          <!-- end sponsors -->
        </div>
      </div>

      <MyCanvasComponent></MyCanvasComponent>
    </section>
    <!-- end sponsors -->
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
