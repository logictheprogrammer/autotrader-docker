<template>
  <NavHeaderComponent @toggle-menu="toggleMenu" />

  <!--**********************************
          Header start
      ***********************************-->
  <div class="header">
    <div class="header-content">
      <nav class="navbar navbar-expand">
        <div class="collapse navbar-collapse justify-content-between">
          <div class="header-left">
            <div class="dashboard_bar">{{ page }}</div>
          </div>
          <ul class="navbar-nav header-right">
            <li class="nav-item">
              <div
                class="bg-skin p-2 rounded-5 d-flex align-items-center gap-2"
              >
                <RouterLink
                  :to="{ name: 'wallet' }"
                  class="d-flex flex-column px-2"
                >
                  <span class="text-sharp gap-2 d-flex align-items-center"
                    ><img
                      src="/svg/crypto-icons/usdt.svg"
                      alt=""
                      class="avatar-xxs"
                      width="16"
                    />USDT
                  </span>
                  <h4 class="text-white mb-0">
                    {{ Helpers.toDollar(balance || 0) }}
                  </h4></RouterLink
                >
                <RouterLink :to="{ name: 'wallet' }" class="btn btn-primary"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-wallet"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M0 3a2 2 0 0 1 2-2h13.5a.5.5 0 0 1 0 1H15v2a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 0 12.5V3zm1 1.732V12.5A1.5 1.5 0 0 0 2.5 14h12a.5.5 0 0 0 .5-.5V5H2a1.99 1.99 0 0 1-1-.268zM1 3a1 1 0 0 0 1 1h12V2H2a1 1 0 0 0-1 1z"
                    />
                  </svg>
                  <span class="ps-1">Wallet</span></RouterLink
                >
              </div>
            </li>
            <li
              class="nav-item dropdown notification_dropdown d-sm-flex d-none"
            >
              <a
                class="nav-link ai-icon"
                href="javascript:void(0);"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i class="fa-regular fa-bell" style="color: #4f7086"></i>
                <span class="badge light text-white bg-danger rounded-circle"
                  >.</span
                >
              </a>
              <div class="dropdown-menu dropdown-menu-end">
                <div
                  id="dlab_W_Notification1"
                  class="widget-media dlab-scroll p-3"
                  style="height: 380px"
                >
                  <ul class="timeline">
                    <li>
                      <div class="timeline-panel">
                        <div class="media me-2">
                          <img
                            alt="image"
                            width="50"
                            src="/images/avatar/1.jpg"
                          />
                        </div>
                        <div class="media-body">
                          <h6 class="mb-1">Dr sultads Send you Photo</h6>
                          <small class="d-block">29 July 2020 - 02:26 PM</small>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div class="timeline-panel">
                        <div class="media me-2 media-info">KG</div>
                        <div class="media-body">
                          <h6 class="mb-1">Resport created successfully</h6>
                          <small class="d-block">29 July 2020 - 02:26 PM</small>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div class="timeline-panel">
                        <div class="media me-2 media-success">
                          <i class="fa fa-home"></i>
                        </div>
                        <div class="media-body">
                          <h6 class="mb-1">Reminder : Treatment Time!</h6>
                          <small class="d-block">29 July 2020 - 02:26 PM</small>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div class="timeline-panel">
                        <div class="media me-2">
                          <img
                            alt="image"
                            width="50"
                            src="/images/avatar/1.jpg"
                          />
                        </div>
                        <div class="media-body">
                          <h6 class="mb-1">Dr sultads Send you Photo</h6>
                          <small class="d-block">29 July 2020 - 02:26 PM</small>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div class="timeline-panel">
                        <div class="media me-2 media-danger">KG</div>
                        <div class="media-body">
                          <h6 class="mb-1">Resport created successfully</h6>
                          <small class="d-block">29 July 2020 - 02:26 PM</small>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div class="timeline-panel">
                        <div class="media me-2 media-primary">
                          <i class="fa fa-home"></i>
                        </div>
                        <div class="media-body">
                          <h6 class="mb-1">Reminder : Treatment Time!</h6>
                          <small class="d-block">29 July 2020 - 02:26 PM</small>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <a class="all-notification" href="javascript:void(0);"
                  >See all notifications <i class="ti-arrow-end"></i
                ></a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </div>
  <!--**********************************
          Header end ti-comment-alt
      ***********************************-->

  <SidebarComponent @hide-menu="hideMenu" />
</template>

<script setup lang="ts">
const httpStore = useHttpStore()
const authStore = useAuthStore()
const route = useRoute()

const page = computed(() => route.meta.page)
const onDemo = computed(() => httpStore.onDemo)
const balance = computed(() =>
  !onDemo.value ? authStore.user?.mainBalance : authStore.user?.demoBalance
)

const toggleMenu = () => {
  window.$('#main-wrapper').toggleClass('menu-toggle')
  window.$('.hamburger').toggleClass('is-active')
}
const hideMenu = () => {
  window.$('#main-wrapper').removeClass('menu-toggle')
  window.$('.hamburger').removeClass('is-active')
}
</script>

<style scoped>
.dlabnav {
  z-index: 9;
}
</style>

<style>
.header-right .notification_dropdown .nav-link .badge {
  top: -3px;
  height: 15px;
  width: 15px;
  color: transparent !important;
}

.header-right .notification_dropdown .nav-link {
  padding: 2px;
}
</style>
