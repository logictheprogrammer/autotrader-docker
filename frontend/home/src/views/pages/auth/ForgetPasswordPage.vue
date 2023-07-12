<template>
  <Form
    action="#"
    class="form form--content"
    :validation-schema="schema"
    v-slot="{ errors }"
    @submit="forgetPassword"
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

    <button class="form__btn" type="submit">Send</button>

    <span class="form__text form__text--center">
      Dont have an account?
      <RouterLink :to="{ name: 'signup' }">Sign up!</RouterLink>
    </span>
  </Form>
</template>

<script setup lang="ts">
const schema = yup.object({
  account: yup.string().required().label('username or email'),
})

const forgetPassword = (form: any) => {
  console.log(form)
}
</script>

<style scoped></style>
