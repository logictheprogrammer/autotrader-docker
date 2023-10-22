import { RequestHandler } from 'express'
import Joi from 'joi'
import asyncHandler from './asyncHandler'

export default (schema: Joi.Schema): RequestHandler => {
  return asyncHandler(async function (req, res, next): Promise<void> {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    }
    const value = await schema.validateAsync(req.body, validationOptions)
    req.body = value
    next()
  })
}
