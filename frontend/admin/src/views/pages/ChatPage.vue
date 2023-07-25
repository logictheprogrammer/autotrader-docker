<template>
  <div class="chatbox active rounded-4">
    <div class="custom-tab-1">
      <div class="tab-content">
        <div class="tab-pane fade active show" id="chat" role="tabpanel">
          <div class="card chat dlab-chat-history-box">
            <div class="card-header chat-list-header text-center">
              <RouterLink
                :to="{ name: 'support' }"
                class="dlab-chat-history-back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  width="18px"
                  height="18px"
                  viewBox="0 0 24 24"
                  version="1.1"
                >
                  <g
                    stroke="none"
                    stroke-width="1"
                    fill="none"
                    fill-rule="evenodd"
                  >
                    <polygon points="0 0 24 0 24 24 0 24" />
                    <rect
                      fill="#000000"
                      opacity="0.3"
                      transform="translate(15.000000, 12.000000) scale(-1, 1) rotate(-90.000000) translate(-15.000000, -12.000000) "
                      x="14"
                      y="7"
                      width="2"
                      height="10"
                      rx="1"
                    />
                    <path
                      d="M3.7071045,15.7071045 C3.3165802,16.0976288 2.68341522,16.0976288 2.29289093,15.7071045 C1.90236664,15.3165802 1.90236664,14.6834152 2.29289093,14.2928909 L8.29289093,8.29289093 C8.67146987,7.914312 9.28105631,7.90106637 9.67572234,8.26284357 L15.6757223,13.7628436 C16.0828413,14.136036 16.1103443,14.7686034 15.7371519,15.1757223 C15.3639594,15.5828413 14.7313921,15.6103443 14.3242731,15.2371519 L9.03007346,10.3841355 L3.7071045,15.7071045 Z"
                      fill="#000000"
                      fill-rule="nonzero"
                      transform="translate(9.000001, 11.999997) scale(-1, -1) rotate(90.000000) translate(-9.000001, -11.999997) "
                    />
                  </g>
                </svg>
              </RouterLink>
              <div>
                <h6 class="mb-1">Chat with Khelesh</h6>
                <p class="mb-0 text-success">Online</p>
              </div>
              <div class="dropdown">
                <a
                  href="javascript:void(0);"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    width="18px"
                    height="18px"
                    viewBox="0 0 24 24"
                    version="1.1"
                  >
                    <g
                      stroke="none"
                      stroke-width="1"
                      fill="none"
                      fill-rule="evenodd"
                    >
                      <rect x="0" y="0" width="24" height="24" />
                      <circle fill="#000000" cx="5" cy="12" r="2" />
                      <circle fill="#000000" cx="12" cy="12" r="2" />
                      <circle fill="#000000" cx="19" cy="12" r="2" />
                    </g></svg
                ></a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li class="dropdown-item">
                    <i class="fa fa-user-circle text-primary me-2"></i> View
                    profile
                  </li>
                  <li class="dropdown-item">
                    <i class="fa fa-users text-primary me-2"></i> Add to
                    btn-close friends
                  </li>
                  <li class="dropdown-item">
                    <i class="fa fa-plus text-primary me-2"></i> Add to group
                  </li>
                  <li class="dropdown-item">
                    <i class="fa fa-ban text-primary me-2"></i> Block
                  </li>
                </ul>
              </div>
            </div>
            <div class="card-body msg_card_body mb-5 pb-4">
              <div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/1.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
                <div class="msg_cotainer">
                  Hi, how are you samim?
                  <span class="msg_time">8:40 AM, Today</span>
                </div>
              </div>
              <div class="d-flex justify-content-end mb-4">
                <div class="msg_cotainer_send">
                  Hi Khalid i am good tnx how about you?
                  <span class="msg_time_send">8:55 AM, Today</span>
                </div>
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/2.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
              </div>
              <div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/1.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
                <div class="msg_cotainer">
                  I am good too, thank you for your chat template
                  <span class="msg_time">9:00 AM, Today</span>
                </div>
              </div>
              <div class="d-flex justify-content-end mb-4">
                <div class="msg_cotainer_send">
                  You are welcome
                  <span class="msg_time_send">9:05 AM, Today</span>
                </div>
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/2.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
              </div>
              <div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/1.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
                <div class="msg_cotainer">
                  I am looking for your next templates
                  <span class="msg_time">9:07 AM, Today</span>
                </div>
              </div>
              <div class="d-flex justify-content-end mb-4">
                <div class="msg_cotainer_send">
                  Ok, thank you have a good day
                  <span class="msg_time_send">9:10 AM, Today</span>
                </div>
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/2.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
              </div>
              <div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/1.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
                <div class="msg_cotainer">
                  Bye, see you
                  <span class="msg_time">9:12 AM, Today</span>
                </div>
              </div>
              <div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/1.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
                <div class="msg_cotainer">
                  Hi, how are you samim?
                  <span class="msg_time">8:40 AM, Today</span>
                </div>
              </div>
              <div class="d-flex justify-content-end mb-4">
                <div class="msg_cotainer_send">
                  Hi Khalid i am good tnx how about you?
                  <span class="msg_time_send">8:55 AM, Today</span>
                </div>
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/2.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
              </div>
              <div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/1.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
                <div class="msg_cotainer">
                  I am good too, thank you for your chat template
                  <span class="msg_time">9:00 AM, Today</span>
                </div>
              </div>
              <div class="d-flex justify-content-end mb-4">
                <div class="msg_cotainer_send">
                  You are welcome
                  <span class="msg_time_send">9:05 AM, Today</span>
                </div>
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/2.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
              </div>
              <div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/1.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
                <div class="msg_cotainer">
                  I am looking for your next templates
                  <span class="msg_time">9:07 AM, Today</span>
                </div>
              </div>
              <div class="d-flex justify-content-end mb-4">
                <div class="msg_cotainer_send">
                  Ok, thank you have a good day
                  <span class="msg_time_send">9:10 AM, Today</span>
                </div>
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/2.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
              </div>
              <div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                  <img
                    src="/images/avatar/1.jpg"
                    class="rounded-circle user_img_msg"
                    alt=""
                  />
                </div>
                <div class="msg_cotainer">
                  Bye, see you
                  <span class="msg_time">9:12 AM, Today</span>
                </div>
              </div>
            </div>
            <div class="card-footer type_msg bg-skin">
              <div class="input-group gap-3">
                <textarea
                  class="form-control px-3"
                  placeholder="Type your message..."
                ></textarea>
                <div class="input-group-append">
                  <button type="button" class="btn btn-primary">
                    <i class="fa fa-location-arrow"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.chatbox {
  width: auto;
  height: auto;
  position: static;
}

.dlab-chat-history-box {
  position: relative;
  margin-bottom: 0;
}
.msg_card_body {
  position: static;
  overflow-y: auto;
  height: calc(100vh - 256px);
}

@media only screen and (max-width: 1199px) {
  .msg_card_body {
    height: calc(100vh - 240px);
  }
}

@media only screen and (max-width: 768px) {
  .msg_card_body {
    height: calc(100vh - 220px);
  }
}

.card-footer {
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
}
</style>
