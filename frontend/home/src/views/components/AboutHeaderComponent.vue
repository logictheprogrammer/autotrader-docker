<template>
  <div>
    <section class="section section--pb0 section--first">
      <div class="container">
        <div class="row">
          <!-- breadcrumb -->
          <div class="col-12">
            <slot></slot>
          </div>
          <!-- end breadcrumb -->

          <!-- section title -->
          <div class="col-12 mb-4">
            <div
              class="section__title section__title--left section__title--page"
            >
              <h1>{{ CONFIG.appName }} – {{ CONFIG.appSlogan }}</h1>

              <p>
                Many desktop publishing packages and
                <a href="#">web page</a> editors now use Lorem Ipsum as their
                default model text, and a search for 'lorem ipsum' will uncover
                many web sites still in their infancy. Various versions have
                evolved over the years, sometimes by accident, sometimes on
                purpose.
              </p>

              <p>
                All the Lorem Ipsum generators on the <b>Internet</b> tend to
                repeat predefined chunks as necessary, making this the first
                true generator on the Internet. It uses a dictionary of over 200
                Latin words, combined with a handful of model sentence
                structures, to generate Lorem Ipsum which looks reasonable. The
                generated Lorem Ipsum is therefore always free from repetition,
                injected humour, or non-characteristic words etc.
              </p>
            </div>
          </div>
          <!-- end section title -->

          <slot name="steps"></slot>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
