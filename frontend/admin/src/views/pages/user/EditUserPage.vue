<template>
  <div class="card">
    <div class="card-body">
      <div class="profile-tab">
        <div class="custom-tab-1">
          <ul class="nav nav-tabs border-2 border-dark d-flex text-nowrap">
            <li class="nav-item" style="flex: 1">
              <a
                href="#my-profile"
                data-bs-toggle="tab"
                class="nav-link show active rounded-top m-0 text-center"
                >Update Profile</a
              >
            </li>
            <li class="nav-item" style="flex: 1">
              <a
                href="#change-email"
                data-bs-toggle="tab"
                class="nav-link rounded-top m-0 text-center"
                >Change Email</a
              >
            </li>
            <li class="nav-item" style="flex: 1">
              <a
                href="#update-password"
                data-bs-toggle="tab"
                class="nav-link rounded-top m-0 text-center"
                >Change Password</a
              >
            </li>
          </ul>
          <div class="tab-content">
            <div id="my-profile" class="tab-pane fade active show">
              <div class="pt-3">
                <div class="settings-form">
                  <Form
                    :validation-schema="updateProfileSchema"
                    v-slot="{ errors }"
                    @submit="userStore.updateUserProfile"
                  >
                    <Field type="hidden" name="userId" :value="user?._id" />
                    <div class="row">
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Name</label>
                        <Field
                          type="text"
                          placeholder="Name"
                          class="form-control"
                          name="name"
                          :value="user?.name"
                          :validate-on-input="true"
                        />
                        <span class="error-message">{{ errors.name }}</span>
                      </div>
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Username</label>
                        <Field
                          type="text"
                          placeholder="Username"
                          class="form-control"
                          name="username"
                          :value="user?.username"
                          :validate-on-input="true"
                        />
                        <span class="error-message">{{ errors.username }}</span>
                      </div>
                    </div>
                    <div class="row">
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Country</label>
                        <input
                          type="text"
                          placeholder="Country"
                          class="form-control"
                          :value="user?.country"
                          disabled
                        />
                      </div>
                    </div>
                    <div class="text-center mt-2">
                      <button class="btn btn-primary" type="submit">
                        Save
                      </button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
            <div id="change-email" class="tab-pane fade">
              <div class="pt-3">
                <div class="settings-form">
                  <Form
                    :validation-schema="updateEmailSchema"
                    v-slot="{ errors }"
                    @submit="userStore.updateUserEmail"
                  >
                    <Field type="hidden" name="userId" :value="user?._id" />
                    <div class="row">
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Email</label>
                        <Field
                          name="email"
                          type="email"
                          placeholder="Email"
                          class="form-control"
                          :value="user?.email"
                          :validate-on-input="true"
                        />
                        <span class="error-message">{{ errors.email }}</span>
                      </div>
                    </div>
                    <div class="text-center mt-2">
                      <button class="btn btn-primary" type="submit">
                        Save
                      </button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
            <div id="update-password" class="tab-pane fade">
              <div class="pt-3">
                <div class="settings-form">
                  <Form
                    :validation-schema="updatePasswordSchema"
                    v-slot="{ errors }"
                    @submit="authStore.updateUserPassword"
                  >
                    <Field type="hidden" name="userId" :value="user?._id" />
                    <div class="row">
                      <div class="mb-3 col-md-6">
                        <label class="form-label">New Password</label>
                        <Field
                          type="password"
                          placeholder="New Password"
                          class="form-control"
                          name="password"
                          :validate-on-input="true"
                        />
                        <span class="error-message">{{ errors.password }}</span>
                      </div>
                      <div class="mb-3 col-md-6">
                        <label class="form-label">Confirm Password</label>
                        <Field
                          type="password"
                          placeholder="Confirm Password"
                          class="form-control"
                          name="confirmPassword"
                          :validate-on-input="true"
                        />
                        <span class="error-message">{{
                          errors.confirmPassword
                        }}</span>
                      </div>
                    </div>
                    <div class="text-center mt-2">
                      <button class="btn btn-primary" type="submit">
                        Save
                      </button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()
const httpStore = useHttpStore()
const usersLoaded = computed(() => userStore.loaded)

if (!usersLoaded.value) {
  await userStore.fetchAll()
  httpStore.setPost(false)
}

const userId = route.params.userId as string
const user = computed(() => userStore.findById(userId))

const updateProfileSchema = yup.object({
  name: yup.string().min(3).max(30).required(),
  username: yup
    .string()
    .min(3)
    .max(30)
    .required()
    .matches(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric'),
})

const updateEmailSchema = yup.object({
  email: yup.string().required().email(),
})

const updatePasswordSchema = yup.object({
  password: yup.string().min(8).required(),
  confirmPassword: yup
    .string()
    .required()
    .label('confirm password')
    .oneOf([yup.ref('password')], 'Password should match'),
})
</script>

<style scoped></style>
