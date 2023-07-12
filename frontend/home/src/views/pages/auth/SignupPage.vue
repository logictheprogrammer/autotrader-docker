<template>
  <Form
    action="#"
    class="form form--content"
    @submit="useAuthStore().register"
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
        type="text"
        class="form__input"
        name="name"
        placeholder="Name"
        :validate-on-input="true"
        :class="{ 'border-danger': errors.name }"
      />
      <span class="error-message">{{ errors.name }}</span>
    </div>

    <div class="form__group">
      <Field
        type="email"
        class="form__input"
        name="email"
        placeholder="Email"
        :validate-on-input="true"
        :class="{ 'border-danger': errors.email }"
      />
      <span class="error-message">{{ errors.email }}</span>
    </div>

    <div class="form__group">
      <Field
        type="text"
        class="form__input"
        name="username"
        placeholder="Username"
        :validate-on-input="true"
        :class="{ 'border-danger': errors.username }"
      />
      <span class="error-message">{{ errors.username }}</span>
    </div>

    <div class="form__group filter__search">
      <Field
        class="form__input filter__select"
        name="country"
        as="select"
        v-slot="{ value }"
        :validate-on-input="true"
        :class="{ 'border-danger': errors.country }"
      >
        <option value="" disabled>Select your country</option>
        <option
          class="text-black"
          v-for="country in countries"
          :key="country.code"
          :value="country.name"
          :selected="value && value.includes(country)"
        >
          {{ country.name }}
        </option>
      </Field>
      <button type="button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <span class="error-message">{{ errors.country }}</span>
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

    <div class="form__group">
      <Field
        type="text"
        class="form__input"
        :class="{ 'border-danger': errors.invite }"
        :validate-on-input="true"
        name="invite"
        placeholder="Referral Code (Optional)"
      />
      <span class="error-message">{{ errors.invite }}</span>
    </div>

    <span class="form__text mt-0 mb-3"
      >By signing up, you've agreed to our
      <RouterLink :to="{ name: 'terms' }">terms & condition</RouterLink></span
    >
    <button class="form__btn" type="submit">Sign up</button>

    <span class="form__text form__text--center"
      >Already have an account?
      <RouterLink :to="{ name: 'signin' }">Sign in!</RouterLink></span
    >
  </Form>
</template>

<script setup lang="ts">
const schema = yup.object({
  name: yup.string().min(3).max(30).required(),
  email: yup.string().required().email(),
  username: yup
    .string()
    .min(3)
    .max(30)
    .required()
    .matches(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric'),
  country: yup.string().required(),
  invite: yup.string().optional(),
  password: yup.string().min(8).required(),
  confirmPassword: yup
    .string()
    .required()
    .label('confirm password')
    .oneOf([yup.ref('password')], 'Password should match'),
})
</script>

<style scoped></style>
