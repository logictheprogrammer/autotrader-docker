<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex">
        <div class="row" style="flex: 1">
          <div class="col-md-6 col-lg-4">
            <div
              class="py-3 text-center rounded border-bottom border-left border-3 border-dark"
            >
              <span class="fs-20 text-sharp font-w500 d-block mb-2"
                >Main Balance</span
              >
              <span class="text-num text-black fs-36 font-w500"
                >$63,644.98</span
              >
            </div>
          </div>
          <div class="col-md-6 col-lg-4 d-none d-md-block">
            <div
              class="py-3 text-center rounded border-bottom border-left border-3 border-danger"
            >
              <span class="fs-20 text-sharp font-w500 d-block mb-2"
                >Unsettled Balance</span
              >
              <span class="text-num text-black fs-36 font-w500">$7,412.66</span>
            </div>
          </div>
          <div class="col-md-6 col-lg-4 d-none d-lg-block">
            <div
              class="py-3 text-center rounded border-bottom border-left border-3 border-dark"
            >
              <span class="fs-20 text-sharp font-w500 d-block mb-2"
                >Affiliate Balance</span
              >
              <span class="text-num text-black fs-36 font-w500">$7,412.66</span>
            </div>
          </div>
        </div>
        <div class="dropdown mb-auto d-lg-none">
          <a
            href="javascript:void(0);"
            class="btn-link position-absolute"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style="right: 2px"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                stroke="#575757"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
                stroke="#575757"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
                stroke="#575757"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </a>
          <div class="dropdown-menu dropdown-menu-left" style="">
            <div class="m-3">
              <span class="fs-18 text-sharp font-w500 d-block"
                >Unsettled Balance</span
              >
              <span class="text-num text-black fs-24 font-w500"
                >$63,644.98</span
              >
            </div>
            <div class="m-3">
              <span class="fs-18 text-sharp font-w500 d-block"
                >Affiliate Balance</span
              >
              <span class="text-num text-black fs-24 font-w500"
                >$63,644.98</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
