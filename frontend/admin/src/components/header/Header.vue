<template>
  <NavHeader @toggle-menu="toggleMenu"></NavHeader>

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
            <li class="nav-item dropdown notification_dropdown">
              <a
                class="nav-link ai-icon"
                href="javascript:void(0);"
                role="button"
                data-bs-toggle="dropdown"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12.638 4.9936V2.3C12.638 1.5824 13.2484 1 14.0006 1C14.7513 1 15.3631 1.5824 15.3631 2.3V4.9936C17.3879 5.2718 19.2805 6.1688 20.7438 7.565C22.5329 9.2719 23.5384 11.5872 23.5384 14V18.8932L24.6408 20.9966C25.1681 22.0041 25.1122 23.2001 24.4909 24.1582C23.8709 25.1163 22.774 25.7 21.5941 25.7H15.3631C15.3631 26.4176 14.7513 27 14.0006 27C13.2484 27 12.638 26.4176 12.638 25.7H6.40705C5.22571 25.7 4.12888 25.1163 3.50892 24.1582C2.88759 23.2001 2.83172 22.0041 3.36039 20.9966L4.46268 18.8932V14C4.46268 11.5872 5.46691 9.2719 7.25594 7.565C8.72068 6.1688 10.6119 5.2718 12.638 4.9936ZM14.0006 7.5C12.1924 7.5 10.4607 8.1851 9.18259 9.4045C7.90452 10.6226 7.18779 12.2762 7.18779 14V19.2C7.18779 19.4015 7.13739 19.6004 7.04337 19.7811C7.04337 19.7811 6.43703 20.9381 5.79662 22.1588C5.69171 22.3603 5.70261 22.6008 5.82661 22.7919C5.9506 22.983 6.16996 23.1 6.40705 23.1H21.5941C21.8298 23.1 22.0492 22.983 22.1732 22.7919C22.2972 22.6008 22.3081 22.3603 22.2031 22.1588C21.5627 20.9381 20.9564 19.7811 20.9564 19.7811C20.8624 19.6004 20.8133 19.4015 20.8133 19.2V14C20.8133 12.2762 20.0953 10.6226 18.8172 9.4045C17.5391 8.1851 15.8073 7.5 14.0006 7.5Z"
                    fill="#4f7086"
                  />
                </svg>
                <span class="badge light text-white bg-primary rounded-circle"
                  >1</span
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
            <li class="nav-item dropdown notification_dropdown">
              <a class="nav-link bell bell-link" href="javascript:void(0);">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M27 7.88883C27 5.18897 24.6717 3 21.8 3C17.4723 3 10.5277 3 6.2 3C3.3283 3 1 5.18897 1 7.88883V23.7776C1 24.2726 1.31721 24.7174 1.80211 24.9069C2.28831 25.0963 2.8473 24.9912 3.2191 24.6417C3.2191 24.6417 5.74629 22.2657 7.27769 20.8272C7.76519 20.3688 8.42561 20.1109 9.11591 20.1109H21.8C24.6717 20.1109 27 17.922 27 15.2221V7.88883ZM24.4 7.88883C24.4 6.53951 23.2365 5.44441 21.8 5.44441C17.4723 5.44441 10.5277 5.44441 6.2 5.44441C4.7648 5.44441 3.6 6.53951 3.6 7.88883V20.8272L5.4382 19.0989C6.4132 18.1823 7.73661 17.6665 9.11591 17.6665H21.8C23.2365 17.6665 24.4 16.5726 24.4 15.2221V7.88883ZM7.5 15.2221H17.9C18.6176 15.2221 19.2 14.6745 19.2 13.9999C19.2 13.3252 18.6176 12.7777 17.9 12.7777H7.5C6.7824 12.7777 6.2 13.3252 6.2 13.9999C6.2 14.6745 6.7824 15.2221 7.5 15.2221ZM7.5 10.3333H20.5C21.2176 10.3333 21.8 9.7857 21.8 9.11104C21.8 8.43638 21.2176 7.88883 20.5 7.88883H7.5C6.7824 7.88883 6.2 8.43638 6.2 9.11104C6.2 9.7857 6.7824 10.3333 7.5 10.3333Z"
                    fill="#4f7086"
                  ></path>
                </svg>
                <span class="badge light text-white bg-primary rounded-circle"
                  >5</span
                >
              </a>
            </li>
            <li class="nav-item d-sm-flex d-none">
              <a href="javascript:void(0);" class="btn btn-outline-secondary"
                ><span>Logout </span
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-box-arrow-in-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"
                  ></path>
                  <path
                    fill-rule="evenodd"
                    d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                  ></path></svg
              ></a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </div>
  <!--**********************************
          Header end ti-comment-alt
      ***********************************-->

  <Sidebar @hide-menu="hideMenu"></Sidebar>
</template>

<script setup lang="ts">
const page = computed(() => useRoute().meta.page);

const toggleMenu = () => {
  window.$("#main-wrapper").toggleClass("menu-toggle");
  window.$(".hamburger").toggleClass("is-active");
};
const hideMenu = () => {
  window.$("#main-wrapper").removeClass("menu-toggle");
  window.$(".hamburger").removeClass("is-active");
};
</script>

<style scoped>
.dlabnav {
  z-index: 9;
}
</style>
