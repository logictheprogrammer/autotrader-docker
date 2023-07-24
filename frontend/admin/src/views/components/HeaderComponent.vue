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
            <li class="nav-item dropdown notification_dropdown d-flex">
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
const route = useRoute()

const page = computed(() => route.meta.page)

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
