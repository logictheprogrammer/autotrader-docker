<template>
  <Form
    action="#"
    class="form form--content"
    :validation-schema="schema"
    v-slot="{ errors }"
    @submit="useAuthStore().login"
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
        name="account"
        type="text"
        class="form__input"
        placeholder="Username or Email"
        :validate-on-input="true"
      />
      <span class="error-message">{{ errors.account }}</span>
    </div>

    <div class="form__group">
      <Field
        name="password"
        type="password"
        class="form__input"
        placeholder="Password"
        :validate-on-input="true"
      />
      <span class="error-message">{{ errors.password }}</span>
    </div>

    <button class="form__btn" type="submit">Sign in</button>

    <span class="form__text form__text--center">
      Dont have an account?
      <RouterLink :to="{ name: 'signup' }">Sign up!</RouterLink>
      <br />
      <RouterLink :to="{ name: 'forget-password' }"
        >Forget Password?</RouterLink
      >
    </span>
  </Form>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/auth.store'

const schema = yup.object({
  account: yup.string().required().label('username or email'),
  password: yup.string().required(),
})

// const signin = (form: any) => {
//   console.log(form)
// }
</script>

<style scoped></style>
