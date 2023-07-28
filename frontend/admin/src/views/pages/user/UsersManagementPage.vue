<template>
  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Users Management</h4>
        </div>
        <EmptyResourceComponent v-if="usersLoaded && !users?.length">
          No Users Found
        </EmptyResourceComponent>
        <div v-else class="card-body pt-0 px-0 text-nowrap">
          <TablePreview v-if="!usersLoaded" :rows="8" :cols="10" searching />
          <MyDataTableComponent v-else ordering searching :order="[1, 'asc']">
            <thead class="bg-background">
              <tr>
                <th class="text-sharp">Action</th>
                <th class="text-sharp">No</th>
                <th class="text-sharp">Name</th>
                <th class="text-sharp">Username</th>
                <th class="text-sharp">Email</th>
                <th class="text-sharp">Country</th>
                <th class="text-sharp">Main Balance</th>
                <th class="text-sharp">Referral Balance</th>
                <th class="text-sharp text-center">Referral Code</th>
                <th class="text-sharp text-center">Role</th>
                <th class="text-sharp text-center">Status</th>
                <th class="text-sharp text-center">Verifield</th>
                <th class="text-sharp">Registered</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, i) in users" :key="user._id">
                <td>
                  <MyDropdownComponent>
                    <a
                      v-if="user.role < UserRole.ADMIN"
                      class="dropdown-item border-bottom"
                      href="javascript:;"
                      ><i class="bi bi-box-arrow-in-right fs-16 me-2"></i>
                      Login</a
                    >
                    <RouterLink
                      v-if="user.role < UserRole.ADMIN"
                      :to="{ name: 'edit-user', params: { userId: user._id } }"
                      class="dropdown-item border-bottom"
                      href="javascript:;"
                      ><i class="bi bi-pencil-square me-2"></i> Edit</RouterLink
                    >
                    <a class="dropdown-item border-bottom" href="javascript:;"
                      ><i class="bi bi-envelope me-2"></i> Email</a
                    >
                    <a
                      class="dropdown-item border-bottom"
                      href="javascript:;"
                      @click="() => fundUserHandler(user)"
                      ><i class="bi bi-cash me-2"></i> Credit / Debit</a
                    >
                    <a
                      v-if="
                        user.role < UserRole.ADMIN ||
                        user.status !== UserStatus.ACTIVE
                      "
                      class="dropdown-item border-bottom"
                      href="javascript:;"
                      @click="() => userStatusHandler(user)"
                      ><i
                        :class="`bi bi-${
                          user.status === UserStatus.ACTIVE ? 'slash' : 'check'
                        }-circle me-2`"
                      ></i>
                      {{
                        user.status === UserStatus.ACTIVE
                          ? 'Suspend'
                          : 'Unsuspend'
                      }}</a
                    >
                    <a
                      v-if="user.role < UserRole.ADMIN"
                      class="dropdown-item"
                      href="javascript:;"
                      ><i class="bi bi-trash me-2"></i>Delete</a
                    >
                  </MyDropdownComponent>
                </td>
                <td>{{ i + 1 }}</td>
                <td>{{ Helpers.toTitleCase(user.name) }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>{{ Helpers.toTitleCase(user.country) }}</td>
                <td>{{ Helpers.toDollar(user.mainBalance) }}</td>
                <td>{{ Helpers.toDollar(user.referralBalance) }}</td>
                <td class="text-center">{{ user.refer }}</td>
                <td class="text-center">{{ Helpers.toUserRole(user.role) }}</td>
                <td class="text-center">
                  <span
                    :class="`badge light badge-${
                      Helpers.toUserStatus(user.status)[1]
                    }`"
                    >{{ Helpers.toUserStatus(user.status)[0] }}
                  </span>
                </td>
                <td class="text-center">{{ user.verifield ? 'Yes' : 'No' }}</td>
                <td>{{ user.createdAt }}</td>
              </tr>
            </tbody>
          </MyDataTableComponent>
        </div>
      </div>
    </div>
  </div>

  <AlertConfirmComponent
    :is-open="openAlertModal"
    :status="alertModalInfo.status"
    :title="alertModalInfo.title"
    :message="alertModalInfo.message"
    @confirm="updateUserStatus"
    @close="openAlertModal = false"
  />

  <ModalComponent
    :is-open="openFundUserModel"
    v-slot="{ errors }"
    :validation-schema="updateEmailSchema"
    @confirm="(data:any) => console.log(data)"
    @close="() => (openFundUserModel = false)"
  >
    <div class="w-100">
      <h2
        class="text-center text-lower text-sharp mb-4 border-bottom border-2 pb-3"
      >
        Credit or debit: {{ selectedUser?.username }}
      </h2>
      <div class="mb-3">
        <AccountTypeComponent />
      </div>
      <div class="mb-3">
        <label class="form-label text-sharp text-center w-100">Amount</label>
        <Field
          name="amount"
          type="number"
          placeholder="Amount"
          class="form-control"
          :validate-on-input="true"
        />
        <span class="error-message">{{ errors.amount }}</span>
      </div>
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
import { ResponseStatus } from '@/modules/http/http.enum'
import { UserStatus } from '@/modules/user/user.enum'
import type { IUser } from '@/modules/user/user.interface'

const userStore = useUserStore()
const usersLoaded = computed(() => userStore.loaded)
const users = computed(() => userStore.users)
const openAlertModal = ref(false)
const openFundUserModel = ref(false)

if (!usersLoaded.value) userStore.fetchAll()
const updateEmailSchema = yup.object({
  amount: yup
    .number()
    .typeError('Amount is required')
    .not([0], 'Amount cannot be 0')
    .required('Amount is required'),
})

const selectedUser = ref<IUser>()

const alertModalInfo = reactive<{
  status: ResponseStatus
  title: string
  message: string
}>({ status: ResponseStatus.INFO, title: '', message: '' })

const userStatusHandler = (user: IUser) => {
  selectedUser.value = user
  selectedUser.value._id = user._id
  selectedUser.value.status =
    user.status !== UserStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.SUSPENDED
  selectedUser.value.username = user.username

  if (selectedUser.value.status === UserStatus.ACTIVE) {
    alertModalInfo.status = ResponseStatus.INFO
    alertModalInfo.title = `Do you really wants to unsuspend ${user.username}?`
    alertModalInfo.message =
      'Unsuspending this user, will permit him to access this platform and perform regular task.'
  } else {
    alertModalInfo.status = ResponseStatus.WARNING
    alertModalInfo.title = `Do you really wants to suspend ${user.username}?`
    alertModalInfo.message =
      'Suspending this user, will prevent him from accessing this platform until he has been unsuspended.'
  }

  openAlertModal.value = true
}

const updateUserStatus = () => {
  if (!selectedUser.value) return
  openAlertModal.value = false
  userStore.updateUserStatus(selectedUser.value._id, selectedUser.value.status)
}

const fundUserHandler = (user: IUser) => {
  selectedUser.value = user
  openFundUserModel.value = true
}
</script>

<style scoped></style>
