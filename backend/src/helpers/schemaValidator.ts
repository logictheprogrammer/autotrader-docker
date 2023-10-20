import { RequestHandler } from 'express'
import Joi from 'joi'
import asyncHandler from './asyncHandler'
import { BadRequestError } from '@/core/apiError'
import { StatusCode } from '@/core/apiResponse'

export default (schema: Joi.Schema): RequestHandler => {
  return asyncHandler(async function (req, res, next): Promise<void> {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    }
    try {
      const value = await schema.validateAsync(req.body, validationOptions)
      req.body = value
      next()
    } catch (e: any) {
      const errors: string[] = []
      e.details.forEach((error: Joi.ValidationErrorItem) => {
        errors.push(error.message)
      })

      throw new BadRequestError(
        errors[0],
        'Please fill all details correclty',
        StatusCode.DANGER,
        errors
      )
    }
  })
}
