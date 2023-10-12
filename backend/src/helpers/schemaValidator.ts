import { HttpResponseStatus } from '@/modules/http/http.enum'
import { Request, Response, NextFunction, RequestHandler } from 'express'
import Joi from 'joi'

export default (schema: Joi.Schema): RequestHandler => {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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
      res.status(400).json({
        status: HttpResponseStatus.ERROR,
        message: errors[0],
        data: { status: 400, message: errors[0], errors },
      })
    }
  }
}
