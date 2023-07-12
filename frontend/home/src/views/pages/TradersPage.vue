<template>
  <ArticleHeaderComponent title="Crypto Miners" head="section__head">
    <BreadcrumbComponent title="Miners"></BreadcrumbComponent>
  </ArticleHeaderComponent>
  <!-- filter -->
  <div class="filter">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="filter__content">
            <form action="#" class="filter__search">
              <input type="text" placeholder="Search..." />
              <button type="button" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M21.71,20.29,18,16.61A9,9,0,1,0,16.61,18l3.68,3.68a1,1,0,0,0,1.42,0A1,1,0,0,0,21.71,20.29ZM11,18a7,7,0,1,1,7-7A7,7,0,0,1,11,18Z"
                  />
                </svg>
              </button>
            </form>

            <div class="filter__wrap">
              <MySelectComponent :options="blockchains"></MySelectComponent>
              <MySelectComponent :options="blockchains"></MySelectComponent>
              <MySelectComponent :options="blockchains"></MySelectComponent>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- end filter -->
  <!-- aggregator -->
  <section class="container pb-5">
    <!-- games -->
    <div class="container">
      <div class="row row--grid">
        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/1.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">Tank Metaverse</a>
                </h3>
                <span class="game__blockchain">
                  Blockchains
                  <img src="/img/blockchain/1.png" alt="" />
                  <img src="/img/blockchain/2.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              If you are going to use a passage of Lorem Ipsum, you need to be
              sure there isn't anything embarrassing hidden in the middle of
              text.
            </p>

            <ul class="game__list">
              <li>Devices <span>Web, Android, IOS</span></li>
              <li>Free to play <span class="required">NFT Required</span></li>
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
        </div>
        <!-- end game -->

        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/2.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">Synergy Land</a>
                </h3>
                <span class="game__blockchain">
                  Blockchain
                  <img src="/img/blockchain/4.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>

            <ul class="game__list">
              <li>Devices <span>Windows, MAC, Linux</span></li>
              <li>Free to play <span class="true">Yes</span></li>
              <li>Play to earn <span class="required">NFT & Crypto</span></li>
              <li>Status <span class="true">Live</span></li>
            </ul>

            <a href="game.html" class="game__more"
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                /></svg
            ></a>
          </div>
        </div>
        <!-- end game -->

        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/3.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">Space Falcon</a>
                </h3>
                <span class="game__blockchain">
                  Blockchains
                  <img src="/img/blockchain/3.png" alt="" />
                  <img src="/img/blockchain/5.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              If you are going to use a passage of Lorem Ipsum, you need to be
              sure there isn't anything embarrassing hidden in the middle of
              text.
            </p>

            <ul class="game__list">
              <li>Devices <span>Android, IOS, Windows, MAC</span></li>
              <li>Free to play <span class="true">Yes</span></li>
              <li>Play to earn <span class="required">NFT</span></li>
              <li>Status <span class="process">Alpha</span></li>
            </ul>

            <a href="game.html" class="game__more"
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                /></svg
            ></a>
          </div>
        </div>
        <!-- end game -->

        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/4.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">Battle Arena</a>
                </h3>
                <span class="game__blockchain">
                  Blockchain
                  <img src="/img/blockchain/6.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>

            <ul class="game__list">
              <li>Devices <span>Android, Windows</span></li>
              <li>Free to play <span class="true">Yes</span></li>
              <li>Play to earn <span class="required">NFT & Crypto</span></li>
              <li>Status <span class="true">Live</span></li>
            </ul>

            <a href="game.html" class="game__more"
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                /></svg
            ></a>
          </div>
        </div>
        <!-- end game -->

        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/5.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">Open Era</a>
                </h3>
                <span class="game__blockchain">
                  Blockchains
                  <img src="/img/blockchain/3.png" alt="" />
                  <img src="/img/blockchain/7.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              If you are going to use a passage of Lorem Ipsum, you need to be
              sure there isn't anything embarrassing hidden in the middle of
              text.
            </p>

            <ul class="game__list">
              <li>Devices <span>Web, Android, IOS</span></li>
              <li>Free to play <span class="required">NFT Required</span></li>
              <li>Play to earn <span class="required">Crypto</span></li>
              <li>Status <span class="process">Beta</span></li>
            </ul>

            <a href="game.html" class="game__more"
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                /></svg
            ></a>
          </div>
        </div>
        <!-- end game -->

        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/6.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">Immortal Arena</a>
                </h3>
                <span class="game__blockchain">
                  Blockchains
                  <img src="/img/blockchain/1.png" alt="" />
                  <img src="/img/blockchain/4.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>

            <ul class="game__list">
              <li>Devices <span>Web</span></li>
              <li>Free to play <span class="true">Yes</span></li>
              <li>Play to earn <span class="required">NFT</span></li>
              <li>Status <span class="process">Development</span></li>
            </ul>

            <a href="game.html" class="game__more"
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                /></svg
            ></a>
          </div>
        </div>
        <!-- end game -->

        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/7.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">Monster NFT</a>
                </h3>
                <span class="game__blockchain">
                  Blockchains
                  <img src="/img/blockchain/1.png" alt="" />
                  <img src="/img/blockchain/7.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              If you are going to use a passage of Lorem Ipsum, you need to be
              sure there isn't anything embarrassing hidden in the middle of
              text.
            </p>

            <ul class="game__list">
              <li>Devices <span>Web, Android, IOS</span></li>
              <li>Free to play <span class="required">NFT Required</span></li>
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
        </div>
        <!-- end game -->

        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/8.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">X World Games</a>
                </h3>
                <span class="game__blockchain">
                  Blockchain
                  <img src="/img/blockchain/5.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>

            <ul class="game__list">
              <li>Devices <span>Windows, MAC, Linux</span></li>
              <li>Free to play <span class="true">Yes</span></li>
              <li>Play to earn <span class="required">NFT & Crypto</span></li>
              <li>Status <span class="true">Live</span></li>
            </ul>

            <a href="game.html" class="game__more"
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                /></svg
            ></a>
          </div>
        </div>
        <!-- end game -->

        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/9.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">Gunstar Metaverse</a>
                </h3>
                <span class="game__blockchain">
                  Blockchains
                  <img src="/img/blockchain/4.png" alt="" />
                  <img src="/img/blockchain/6.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              If you are going to use a passage of Lorem Ipsum, you need to be
              sure there isn't anything embarrassing hidden in the middle of
              text.
            </p>

            <ul class="game__list">
              <li>Devices <span>Android, IOS, Windows, MAC</span></li>
              <li>Free to play <span class="true">Yes</span></li>
              <li>Play to earn <span class="required">NFT</span></li>
              <li>Status <span class="process">Alpha</span></li>
            </ul>

            <a href="game.html" class="game__more"
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                /></svg
            ></a>
          </div>
        </div>
        <!-- end game -->

        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/10.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">Titan Hunters</a>
                </h3>
                <span class="game__blockchain">
                  Blockchain
                  <img src="/img/blockchain/1.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>

            <ul class="game__list">
              <li>Devices <span>Android, Windows</span></li>
              <li>Free to play <span class="true">Yes</span></li>
              <li>Play to earn <span class="required">NFT & Crypto</span></li>
              <li>Status <span class="true">Live</span></li>
            </ul>

            <a href="game.html" class="game__more"
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                /></svg
            ></a>
          </div>
        </div>
        <!-- end game -->

        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/11.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">MetaSoccer</a>
                </h3>
                <span class="game__blockchain">
                  Blockchains
                  <img src="/img/blockchain/4.png" alt="" />
                  <img src="/img/blockchain/5.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              If you are going to use a passage of Lorem Ipsum, you need to be
              sure there isn't anything embarrassing hidden in the middle of
              text.
            </p>

            <ul class="game__list">
              <li>Devices <span>Web, Android, IOS</span></li>
              <li>Free to play <span class="required">NFT Required</span></li>
              <li>Play to earn <span class="required">Crypto</span></li>
              <li>Status <span class="process">Beta</span></li>
            </ul>

            <a href="game.html" class="game__more"
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                /></svg
            ></a>
          </div>
        </div>
        <!-- end game -->

        <!-- game -->
        <div class="col-12 col-md-6 col-xl-4">
          <div class="game">
            <div class="game__head">
              <div class="game__cover">
                <img src="/img/games/12.png" alt="" />
              </div>

              <div class="game__title">
                <h3 class="game__name">
                  <a href="game.html">Realms Of Ethernity</a>
                </h3>
                <span class="game__blockchain">
                  Blockchains
                  <img src="/img/blockchain/2.png" alt="" />
                  <img src="/img/blockchain/6.png" alt="" />
                </span>
              </div>
            </div>

            <p class="game__description">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>

            <ul class="game__list">
              <li>Devices <span>Web</span></li>
              <li>Free to play <span class="true">Yes</span></li>
              <li>Play to earn <span class="required">NFT</span></li>
              <li>Status <span class="process">Development</span></li>
            </ul>

            <a href="game.html" class="game__more"
              ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                /></svg
            ></a>
          </div>
        </div>
        <!-- end game -->
      </div>

      <!-- paginator -->
      <div class="row">
        <div class="col-12">
          <div class="paginator">
            <span class="paginator__pages">12 from 169</span>

            <ul class="paginator__list">
              <li>
                <a href="#"
                  ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M17,11H9.41l3.3-3.29a1,1,0,1,0-1.42-1.42l-5,5a1,1,0,0,0-.21.33,1,1,0,0,0,0,.76,1,1,0,0,0,.21.33l5,5a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L9.41,13H17a1,1,0,0,0,0-2Z"
                    /></svg
                ></a>
              </li>
              <li class="active"><a href="#">1</a></li>
              <li><a href="#">2</a></li>
              <li><a href="#">3</a></li>
              <li><a href="#">4</a></li>
              <li>
                <a href="#"
                  ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
                    /></svg
                ></a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- end paginator -->
    </div>
    <!-- end games -->
  </section>
  <!-- end aggregator -->
</template>

<script setup lang="ts">
const blockchains = [
  {
    value: 1,
    name: 'Avalanche',
  },
  {
    value: 2,
    name: 'Binance',
  },
  {
    value: 3,
    name: 'Bitcoin',
  },
  {
    value: 12,
    name: 'Avalanche',
  },
  {
    value: 22,
    name: 'Binance',
  },
  {
    value: 32,
    name: 'Bitcoin',
  },
  {
    value: 13,
    name: 'Avalanche',
  },
  {
    value: 23,
    name: 'Binance',
  },
  {
    value: 33,
    name: 'Bitcoin',
  },
]
</script>

<style scoped></style>
