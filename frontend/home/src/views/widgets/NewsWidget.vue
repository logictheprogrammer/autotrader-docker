<template>
  <div>
    <!-- news carousel -->
    <section class="section pt-0">
      <div class="container">
        <div class="row">
          <!-- section title -->
          <div class="col-12">
            <div class="section__title section__title--carousel">
              <h2><a href="blog.html">Latest News</a></h2>
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
                        <div class="post">
                          <a href="javascript:;" class="post__img">
                            <img src="/img/posts/1.jpg" alt="" />
                          </a>

                          <div class="post__content">
                            <a href="#" class="post__category">NFT</a>
                            <h3 class="post__title">
                              <a href="javascript:;"
                                >How to Create Your 1st Crypto NFTs</a
                              >
                            </h3>
                            <div class="post__meta">
                              <span class="post__date"
                                ><svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M15,11H13V7a1,1,0,0,0-2,0v5a1,1,0,0,0,1,1h3a1,1,0,0,0,0-2ZM12,2A10,10,0,1,0,22,12,10.01114,10.01114,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8.00917,8.00917,0,0,1,12,20Z"
                                  />
                                </svg>
                                2 hours ago</span
                              >
                              <span class="post__views"
                                ><svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M21.92,11.6C19.9,6.91,16.1,4,12,4S4.1,6.91,2.08,11.6a1,1,0,0,0,0,.8C4.1,17.09,7.9,20,12,20s7.9-2.91,9.92-7.6A1,1,0,0,0,21.92,11.6ZM12,18c-3.17,0-6.17-2.29-7.9-6C5.83,8.29,8.83,6,12,6s6.17,2.29,7.9,6C18.17,15.71,15.17,18,12,18ZM12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,14Z"
                                  />
                                </svg>
                                18</span
                              >
                            </div>
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
    <!-- end news carousel -->
  </div>
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
.post__title {
  text-align: start;
}

.carousel__slide {
  padding: 0.7rem;
}
</style>

<style>
.carousel__pagination-button::after {
  display: block;
  height: 4px;
  width: 10px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.12);
  transition: 0.5s ease;
  opacity: 1;
  margin: 0;
}

.carousel__pagination-button--active::after {
  transform: scale(1);
  width: 20px;
  background-color: #aa72ce;
}
</style>
