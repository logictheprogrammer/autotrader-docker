import { Response } from 'express'
import {
  BadRequestResponse,
  ForbiddenResponse,
  InternalErrorResponse,
  NotFoundResponse,
  RequestConflictResponse,
  StatusCode,
  UnauthorizedResponse,
} from './apiResponse'
import { sendMailService } from './../setup'
import { ValidationError } from 'joi'

export enum ErrorType {
  UNAUTHORIZED = '100',
  INTERNAL = '101',
  CONFLICT = '102',
  NOT_FOUND = '103',
  BAD_REQUEST = '104',
  FORBIDDEN = '105',
  INVALID_CSRF_ERROR = '106',
  SCHEMA_VALIDATION_TOKEN = '107',
  MONGOOSE_CAST_ERROR = '108',
}

export abstract class ApiError extends Error {
  public name = 'ApiError'
  constructor(
    public type: ErrorType,
    public message: string = 'error',
    public description?: string,
    public statusCode: StatusCode = StatusCode.DANGER,
    public errors?: string[]
  ) {
    super(type)

    Object.setPrototypeOf(this, ApiError.prototype)
  }

  public static handle(err: ApiError, res: Response) {
    switch (err.type) {
      case ErrorType.UNAUTHORIZED:
        return new UnauthorizedResponse(
          err.type,
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      case ErrorType.INTERNAL:
        return new InternalErrorResponse(
          err.type,
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      case ErrorType.CONFLICT:
        return new RequestConflictResponse(
          err.type,
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      case ErrorType.NOT_FOUND:
        return new NotFoundResponse(
          err.type,
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      case ErrorType.BAD_REQUEST:
      case ErrorType.MONGOOSE_CAST_ERROR:
      case ErrorType.SCHEMA_VALIDATION_TOKEN:
        return new BadRequestResponse(
          err.type,
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      case ErrorType.FORBIDDEN:
      case ErrorType.INVALID_CSRF_ERROR:
        return new ForbiddenResponse(
          err.type,
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      default: {
        const message = 'Something wrong happened.'
        return new InternalErrorResponse(ErrorType.INTERNAL, message).send(res)
      }
    }
  }

  public static notifyDeveloper(err: Error) {
    if (err) console.log('name:', err.name)
    console.log(err)
    return sendMailService.sendDeveloperErrorMail(err)
  }
}

// export class ServiceError extends Error {
//   public name = 'ServiceError'
//   public error: any

//   constructor(error: any, public message: string = 'error') {
//     let err = error
//     while (true) {
//       if (err instanceof ServiceError) err = err.error
//       else break
//     }
//     super(message)

//     this.error = err

//     Object.setPrototypeOf(this, ServiceError.prototype)
//   }
// }

export class UnauthorizedError extends ApiError {
  public name = 'UnauthorizedError'
  constructor(
    message = 'Unauthorized',
    description?: string,
    statusCode = StatusCode.DANGER
  ) {
    super(ErrorType.UNAUTHORIZED, message, description, statusCode)

    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export class InternalError extends ApiError {
  public name = 'InternalError'
  constructor(
    message = 'Something went wrong, please try again later',
    description?: string,
    statusCode = StatusCode.DANGER
  ) {
    super(ErrorType.INTERNAL, message, description, statusCode)

    Object.setPrototypeOf(this, InternalError.prototype)
  }
}

export class RequestConflictError extends ApiError {
  public name = 'RequestConflictError'
  constructor(
    message = 'Resource already exist',
    description?: string,
    statusCode = StatusCode.DANGER
  ) {
    super(ErrorType.CONFLICT, message, description, statusCode)

    Object.setPrototypeOf(this, RequestConflictError.prototype)
  }
}

export class BadRequestError extends ApiError {
  public name = 'BadRequestError'
  constructor(
    message = 'Invalid request',
    description?: string,
    statusCode = StatusCode.DANGER
  ) {
    super(ErrorType.BAD_REQUEST, message, description, statusCode)

    Object.setPrototypeOf(this, BadRequestError.prototype)
  }
}

export class NotFoundError extends ApiError {
  public name = 'NotFoundError'
  constructor(
    message = 'Resource not found',
    description?: string,
    statusCode = StatusCode.DANGER
  ) {
    super(ErrorType.NOT_FOUND, message, description, statusCode)

    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class ForbiddenError extends ApiError {
  public name = 'ForbiddenError'
  constructor(
    message = 'Permission denied',
    description?: string,
    statusCode = StatusCode.DANGER
  ) {
    super(ErrorType.FORBIDDEN, message, description, statusCode)
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

export class InvalidCsrfTokenError extends ApiError {
  public name = 'InvalidCsrfTokenError'
  constructor() {
    super(
      ErrorType.INVALID_CSRF_ERROR,
      'Invalid request token',
      undefined,
      StatusCode.DANGER
    )

    Object.setPrototypeOf(this, InvalidCsrfTokenError.prototype)
  }
}

export class SchemaValidationError extends ApiError {
  public name = 'SchemaValidationError'
  constructor(error: ValidationError) {
    const errors: string[] = []
    error.details.forEach((err) => {
      errors.push(err.message)
    })

    super(
      ErrorType.SCHEMA_VALIDATION_TOKEN,
      errors[0],
      undefined,
      StatusCode.DANGER,
      errors
    )

    Object.setPrototypeOf(this, SchemaValidationError.prototype)
  }
}

export class MongooseCastError extends ApiError {
  public name = 'MongooseCastError'
  constructor(message = 'Invalid details, please check and try again') {
    super(ErrorType.MONGOOSE_CAST_ERROR, message, undefined, StatusCode.DANGER)
    Object.setPrototypeOf(this, MongooseCastError.prototype)
  }
}
