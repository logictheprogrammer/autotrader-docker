<template>
  <!-- roadmap -->
  <section class="section section--light" id="roadmap">
    <div class="container">
      <div class="row">
        <!-- section title -->
        <div class="col-12">
          <div class="section__title section__title--carousel">
            <h2>Roadmap</h2>
          </div>
        </div>
        <!-- end section title -->

        <!-- carousel -->
        <div class="col-12">
          <div
            class="section__carousel section__carousel--block splide splide--block"
          >
            <CarouselControlComponent
              :onNext="goNext"
              :onPrev="goPrev"
            ></CarouselControlComponent>
            <div class="splide__track">
              <div class="splide__list">
                <Carousel
                  :items-to-show="1"
                  :wrap-around="true"
                  ref="myCarousel"
                  :breakpoints="breakpoints"
                >
                  <Slide v-for="slide in 5" :key="slide">
                    <div class="splide__slide">
                      <div class="roadmap roadmap--active">
                        <h3 class="roadmap__title">2021 Q4</h3>
                        <ul class="roadmap__list">
                          <li>Project start</li>
                          <li>Tiers system</li>
                          <li>Tokenomics</li>
                          <li>Seed round</li>
                          <li>Aggregator – MVP</li>
                        </ul>
                      </div>
                    </div>
                  </Slide>
                  <template #addons>
                    <Pagination />
                  </template>
                </Carousel>
              </div>
            </div>
          </div>
        </div>
        <!-- end carousel -->
      </div>
    </div>

    <MyCanvasComponent></MyCanvasComponent>
  </section>
  <!-- end roadmap -->
</template>

<script setup lang="ts">
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination } from 'vue3-carousel'

const myCarousel = ref()

const breakpoints = {
  767: {
    itemsToShow: 2,
    snapAlign: 'start',
  },
  1199: {
    itemsToShow: 3,
    snapAlign: 'start',
  },
}

const goNext = () => {
  myCarousel.value.next()
}

const goPrev = () => {
  myCarousel.value.prev()
}
</script>

<style scoped>
.carousel__slide {
  justify-content: start;
}

.carousel__pagination {
  margin-top: 2rem;
}
</style>
