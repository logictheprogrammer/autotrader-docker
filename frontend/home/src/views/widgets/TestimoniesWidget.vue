<template>
  <!-- testimonials carousel -->
  <section class="section">
    <div class="container">
      <div class="row">
        <!-- section title -->
        <div class="col-12">
          <div class="section__title section__title--carousel">
            <h2>Customer reviews</h2>
          </div>
        </div>
        <!-- end section title -->

        <!-- carousel -->
        <div class="col-12">
          <div
            class="section__carousel section__carousel--content splide splide--content"
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
                  <Slide v-for="slide in 4" :key="slide">
                    <div class="splide__slide">
                      <div class="testimonial">
                        <div class="testimonial__text">
                          <p>
                            «It uses a dictionary of over 200 Latin words,
                            combined with a handful of model sentence
                            structures, to generate Lorem Ipsum which looks
                            reasonable»
                          </p>
                        </div>

                        <div class="testimonial__client">
                          <img src="/img/avatars/avatar.jpg" alt="" />
                          <p>Gene Graham</p>
                          <span>New York, USA</span>
                        </div>
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
  </section>
  <!-- end testimonials carousel -->
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
  padding: 0.7rem;
}
</style>
