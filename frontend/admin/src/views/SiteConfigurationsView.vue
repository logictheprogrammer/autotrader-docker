<template>
  <div class="card mb-5">
    <div class="card-body">
      <div class="profile-tab">
        <div class="custom-tab-1">
          <ul class="nav nav-tabs border-2 border-dark d-flex text-nowrap">
            <li class="nav-item" style="flex: 1">
              <a
                href="#configurations"
                data-bs-toggle="tab"
                class="nav-link show active rounded-top m-0 text-center"
                >Configurations</a
              >
            </li>
            <li class="nav-item" style="flex: 1">
              <a
                href="#social-links"
                data-bs-toggle="tab"
                class="nav-link rounded-top m-0 text-center"
                >Links & Social</a
              >
            </li>
          </ul>
          <div class="tab-content">
            <div id="configurations" class="tab-pane fade active show">
              <div class="pt-3">
                <div class="settings-form">
                  <form>
                    <div class="row">
                      <div class="mb-3 col-md-6">
                        <div class="form-check ps-0">
                          <label
                            class="form-check-label d-flex justify-content-between bg-background px-4 py-3 rounded-pill shadow pointer"
                            for="check1"
                          >
                            <span>Livechat</span>
                            <input
                              type="checkbox"
                              class="form-check-input"
                              id="check1"
                              value=""
                              checked
                            />
                          </label>
                        </div>
                      </div>
                      <div class="mb-3 col-md-6">
                        <div class="form-check ps-0">
                          <label
                            class="form-check-label d-flex justify-content-between bg-background px-4 py-3 rounded-pill shadow pointer"
                            for="check2"
                          >
                            <span>Whatsapp Chat</span>
                            <input
                              type="checkbox"
                              class="form-check-input"
                              id="check2"
                              value=""
                              checked
                            />
                          </label>
                        </div>
                      </div>
                      <div class="mb-3 col-md-6">
                        <div class="form-check ps-0">
                          <label
                            class="form-check-label d-flex justify-content-between bg-background px-4 py-3 rounded-pill shadow pointer"
                            for="check3"
                          >
                            <span>Popup testimonies</span>
                            <input
                              type="checkbox"
                              class="form-check-input"
                              id="check3"
                              value=""
                              checked
                            />
                          </label>
                        </div>
                      </div>
                      <div class="mb-3 col-md-6">
                        <div class="form-check ps-0">
                          <label
                            class="form-check-label d-flex justify-content-between bg-background px-4 py-3 rounded-pill shadow pointer"
                            for="check4"
                          >
                            <span>Email Notifications</span>
                            <input
                              type="checkbox"
                              class="form-check-input"
                              id="check4"
                              value=""
                              checked
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div class="text-center mt-2">
                      <button class="btn btn-primary" type="button">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div id="social-links" class="tab-pane fade">
              <div class="pt-3">
                <div class="settings-form">
                  <form>
                    <div class="row">
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Notifications Email</label>
                        <input
                          type="email"
                          placeholder="Notifications Email"
                          class="form-control"
                        />
                      </div>
                      <div class="mb-3 col-md-6">
                        <label class="form-label">WhatsApp Link</label>
                        <input
                          type="email"
                          placeholder="WhatsApp Link"
                          class="form-control"
                        />
                      </div>
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Facebook Link</label>
                        <input
                          type="email"
                          placeholder="Facebook Link"
                          class="form-control"
                        />
                      </div>
                    </div>
                    <div class="text-center mt-2">
                      <button class="btn btn-primary" type="button">
                        Update
                      </button>
                    </div>
                  </form>
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

<style scoped></style>
