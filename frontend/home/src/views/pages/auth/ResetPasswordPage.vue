<template>
  <Form
    action="#"
    class="form form--content"
    @submit="useAuthStore().resetPassword"
    :validation-schema="schema"
    v-slot="{ errors }"
  >
    <div class="form__logo-wrap">
      <RouterLink :to="{ name: 'home' }"
        ><img src="/img/logo.svg" alt=""
      /></RouterLink>
      <span class="form__tagline">
        {{ CONFIG.appName }} <br />{{ CONFIG.appSlogan }}
      </span>
    </div>

    <div class="form__group">
      <Field
        type="password"
        class="form__input"
        name="password"
        placeholder="Password"
        :validate-on-input="true"
        :class="{ 'border-danger': errors.password }"
      />
      <span class="error-message">{{ errors.password }}</span>
    </div>

    <div class="form__group">
      <Field
        type="password"
        class="form__input"
        :class="{ 'border-danger': errors.confirmPassword }"
        :validate-on-input="true"
        name="confirmPassword"
        placeholder="Confirm Password"
      />
      <span class="error-message">{{ errors.confirmPassword }}</span>
    </div>
    <Field type="hidden" name="key" :value="key" />
    <Field type="hidden" name="verifyToken" :value="token" />
    <button class="form__btn" type="submit">Save</button>

    <span class="form__text form__text--center"
      >Ohh i remembered my password,
      <RouterLink :to="{ name: 'signin' }">Sign in!</RouterLink></span
    >
  </Form>
</template>

<script setup lang="ts">
const schema = yup.object({
  password: yup.string().min(8).required(),
  confirmPassword: yup
    .string()
    .required()
    .label('confirm password')
    .oneOf([yup.ref('password')], 'Password should match'),
})

const params = useRoute().params
const key = params.key as string
const token = params.token as string
</script>

<style scoped></style>
