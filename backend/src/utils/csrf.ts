import { doubleCsrf } from 'csrf-csrf'

const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: 'x-csrf-token',
})

export { doubleCsrfProtection }
