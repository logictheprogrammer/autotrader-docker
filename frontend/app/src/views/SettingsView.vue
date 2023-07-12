<template>
  <div class="card mb-5">
    <div class="card-body">
      <div class="profile-tab">
        <div class="custom-tab-1">
          <ul class="nav nav-tabs border-2 border-dark d-flex text-nowrap">
            <li class="nav-item" style="flex: 1">
              <a
                href="#my-profile"
                data-bs-toggle="tab"
                class="nav-link show active rounded-top m-0 text-center"
                >Profile Settings</a
              >
            </li>
            <li class="nav-item" style="flex: 1">
              <a
                href="#update-password"
                data-bs-toggle="tab"
                class="nav-link rounded-top m-0 text-center"
                >Update Password</a
              >
            </li>
          </ul>
          <div class="tab-content">
            <div id="my-profile" class="tab-pane fade active show">
              <div class="pt-3">
                <div class="settings-form">
                  <form>
                    <div class="row">
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Name</label>
                        <input
                          type="text"
                          placeholder="Name"
                          class="form-control"
                        />
                      </div>
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Username</label>
                        <input
                          type="text"
                          placeholder="Username"
                          class="form-control"
                        />
                      </div>
                    </div>
                    <div class="row">
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Email</label>
                        <input
                          type="email"
                          placeholder="Email"
                          class="form-control"
                          disabled
                        />
                      </div>
                      <div class="mb-3 col-md-6">
                        <label class="form-label">State</label>
                        <select
                          class="form-control default-select wide"
                          id="inputState"
                        >
                          <option selected>Choose...</option>
                          <option>Option 1</option>
                          <option>Option 2</option>
                          <option>Option 3</option>
                        </select>
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
            <div id="update-password" class="tab-pane fade">
              <div class="pt-3">
                <div class="settings-form">
                  <form>
                    <div class="row">
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Current Password</label>
                        <input
                          type="password"
                          placeholder="Current Password"
                          class="form-control"
                        />
                      </div>
                      <div class="mb-3 col-md-6">
                        <label class="form-label">New Password</label>
                        <input
                          type="password"
                          placeholder="New Password"
                          class="form-control"
                        />
                      </div>
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Confirm Password</label>
                        <input
                          type="password"
                          placeholder="Confirm Password"
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
        <!-- Modal -->
        <div class="modal fade" id="replyModal">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Post Reply</h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div class="modal-body">
                <form>
                  <textarea class="form-control" rows="4">Message</textarea>
                </form>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-danger light"
                  data-bs-dismiss="modal"
                >
                  btn-close
                </button>
                <button type="button" class="btn btn-primary">Reply</button>
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
