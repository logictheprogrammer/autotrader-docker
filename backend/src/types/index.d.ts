import { doubleCsrfProtection } from '@/utils/csrf'
import { Request } from 'express'
import user from '@/modules/user/user.interface'

declare global {
  namespace Express {
    export interface Request {
      user: User
    }
  }
  namespace NodeJS {
    export interface ProcessEnv {
      DEVELOPER_EMAIL: string
      NODE_ENV: 'development' | 'production' | 'test'
      MONGO_PATH: string
      PORT: number
      JWT_SECRET: string
      CSRF_SECRET: string
      SMTP_HOST: string
      SMTP_PORT: string
      SMTP_TLS: string
      SMTP_SECURE: string
      SMTP_USERNAME: string
      SMTP_PASSWORD: string
      CRYPTO_KEY: string
      CRYPTO_IV: string
      CRYPTO_METHOD: string
    }
  }
}
