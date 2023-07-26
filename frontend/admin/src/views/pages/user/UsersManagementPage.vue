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
                    <a class="dropdown-item border-bottom" href="javascript:;"
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
    :is-open="openModal"
    :status="modalInfo.status"
    :title="modalInfo.title"
    :message="modalInfo.message"
    @confirm="updateUserStatus"
    @close="openModal = false"
  />
</template>

<script setup lang="ts">
import { ResponseStatus } from '@/modules/http/http.enum'
import { UserStatus } from '@/modules/user/user.enum'
import type { IUser } from '@/modules/user/user.interface'

const userStore = useUserStore()
const usersLoaded = computed(() => userStore.loaded)
const users = computed(() => userStore.users)

if (!usersLoaded.value) userStore.fetchAll()

const selectedUser = reactive<{
  _id?: string
  status?: UserStatus
  username?: string
}>({})

const modalInfo = reactive<{
  status: ResponseStatus
  title: string
  message: string
}>({ status: ResponseStatus.INFO, title: '', message: '' })

const openModal = ref(false)

const userStatusHandler = (user: IUser) => {
  selectedUser._id = user._id
  selectedUser.status =
    user.status !== UserStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.SUSPENDED
  selectedUser.username = user.username

  if (selectedUser.status === UserStatus.ACTIVE) {
    modalInfo.status = ResponseStatus.INFO
    modalInfo.title = `Do you really wants to unsuspend ${user.username}?`
    modalInfo.message =
      'Unsuspending this user, will permit him to access this platform and perform regular task.'
  } else {
    modalInfo.status = ResponseStatus.WARNING
    modalInfo.title = `Do you really wants to suspend ${user.username}?`
    modalInfo.message =
      'Suspending this user, will prevent him from accessing this platform until he has been unsuspended.'
  }

  openModal.value = true
}

const updateUserStatus = () => {
  openModal.value = false
  userStore.updateUserStatus(selectedUser._id, selectedUser.status)
}
</script>

<style scoped></style>
