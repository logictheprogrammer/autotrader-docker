<template>
  <div>
    <section class="hero" id="hero">
      <div class="container">
        <div class="row row--grid">
          <div class="col-12">
            <!-- hero content (left) -->
            <div class="hero__content hero__content--left">
              <span class="hero__tagline">Aurora HTML Template</span>
              <h2 class="hero__title">Play to Earn <br />Ecosystem</h2>
              <p class="hero__text">Metaverse Aggregator & Web 3.0 Launchpad</p>
              <div class="hero__btns hero__btns--left">
                <RouterLink :to="{ name: 'signin' }" class="hero__btn">
                  <span>Login</span>
                </RouterLink>
                <RouterLink
                  :to="{ name: 'signup' }"
                  class="hero__btn hero__btn--nephrite"
                >
                  <span>Register</span>
                </RouterLink>
              </div>

              <!-- bg animation -->
              <MyCanvasComponent :size="4.0"></MyCanvasComponent>
              <!-- end bg animation -->

              <!-- game -->
              <div class="game game--hero">
                <div class="game__head">
                  <div class="game__cover">
                    <img src="/img/games/3.png" alt="" />
                  </div>

                  <div class="game__title">
                    <h3 class="game__name">
                      <a href="game.html">Realms Of Ethernity</a>
                    </h3>
                    <span class="game__blockchain">
                      Blockchains
                      <img src="/img/blockchain/3.png" alt="" />
                      <img src="/img/blockchain/5.png" alt="" />
                    </span>
                  </div>
                </div>

                <p class="game__description">
                  If you are going to use a passage of Lorem Ipsum, you need to
                  be sure there isn't anything embarrassing hidden in the middle
                  of text.
                </p>

                <ul class="game__list">
                  <li>Devices <span>Web, Android, IOS</span></li>
                  <li>
                    Free to play <span class="required">NFT Required</span>
                  </li>
                  <li>Play to earn <span class="required">Crypto</span></li>
                  <li>Status <span class="process">Presale</span></li>
                </ul>

                <a href="game.html" class="game__more"
                  ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                    /></svg
                ></a>
              </div>
              <!-- end game -->
            </div>
            <!-- end hero content -->
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
