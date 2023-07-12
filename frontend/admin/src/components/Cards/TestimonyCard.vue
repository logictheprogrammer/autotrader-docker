<template>
  <div class="col-xl-4 col-lg-6 col-sm-12">
    <div class="card">
      <div class="card-body pb-0 px-4 pt-4">
        <p class="bg-background p-4 rounded-2 mb-0">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ex animi
          omnis quo quam mollitia assumenda sequi, fugit cupiditate sit dolore
          repellat tempore officia, alias debitis quisquam sed vitae beatae
          suscipit.
        </p>
      </div>
      <div
        class="card-header border-0 p-4 justify-content-start align-items-stretch gap-2"
      >
        <div class="media me-2 rounded-profile overflow-hidden">
          <img alt="image" width="50" src="/images/avatar/4.jpg" />
        </div>
        <div class="d-flex flex-column justify-content-between">
          <h2 class="card-title fw-bold">Gene Graham</h2>
          <p class="mb-0">New York, USA</p>
        </div>
      </div>
      <div class="p-3 pt-0">
        <button
          type="button"
          @click="$emit('show')"
          class="btn btn-outline-secondary w-100"
        >
          Edit<svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
