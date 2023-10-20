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

export enum ErrorType {
  UNAUTHORIZED = 'UnauthorizedError',
  INTERNAL = 'InternalError',
  CONFLICT = 'RequestConflictError',
  NOT_FOUND = 'NotFoundError',
  BAD_REQUEST = 'BadRequestError',
  FORBIDDEN = 'ForbiddenError',
}

export abstract class ApiError extends Error {
  constructor(
    public type: ErrorType,
    public message: string = 'error',
    public description: string = '',
    public statusCode: StatusCode = StatusCode.DANGER,
    public errors?: string[]
  ) {
    super(message)
  }

  public static handle(err: ApiError, res: Response) {
    switch (err.type) {
      case ErrorType.UNAUTHORIZED:
        return new UnauthorizedResponse(
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      case ErrorType.INTERNAL:
        return new InternalErrorResponse(
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      case ErrorType.CONFLICT:
        return new RequestConflictResponse(
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      case ErrorType.NOT_FOUND:
        return new NotFoundResponse(
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      case ErrorType.BAD_REQUEST:
        return new BadRequestResponse(
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      case ErrorType.FORBIDDEN:
        return new ForbiddenResponse(
          err.message,
          err.description,
          err.statusCode,
          err.errors
        ).send(res)
      default: {
        const message = 'Something wrong happened.'
        return new InternalErrorResponse(message).send(res)
      }
    }
  }

  public static notifyDeveloper(err: any) {
    console.log(err)
    return sendMailService.sendDeveloperErrorMail(err)
  }
}

export class ServiceError extends Error {
  constructor(public error: any, public message: string = 'error') {
    super(message)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    message = 'Unauthorized',
    description = '',
    statusCode = StatusCode.DANGER,
    errors?: string[]
  ) {
    super(ErrorType.UNAUTHORIZED, message, description, statusCode, errors)
  }
}

export class InternalError extends ApiError {
  constructor(
    message = 'Something went wrong, please try again later',
    description = '',
    statusCode = StatusCode.DANGER,
    errors?: string[]
  ) {
    super(ErrorType.INTERNAL, message, description, statusCode, errors)
  }
}

export class RequestConflictError extends ApiError {
  constructor(
    message = 'Resource already exist',
    description = '',
    statusCode = StatusCode.DANGER,
    errors?: string[]
  ) {
    super(ErrorType.CONFLICT, message, description, statusCode, errors)
  }
}

export class BadRequestError extends ApiError {
  constructor(
    message = 'Invalid request',
    description = '',
    statusCode = StatusCode.DANGER,
    errors?: string[]
  ) {
    super(ErrorType.BAD_REQUEST, message, description, statusCode, errors)
  }
}

export class NotFoundError extends ApiError {
  constructor(
    message = 'Resource not found',
    description = '',
    statusCode = StatusCode.DANGER,
    errors?: string[]
  ) {
    super(ErrorType.NOT_FOUND, message, description, statusCode, errors)
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    message = 'Permission denied',
    description = '',
    statusCode = StatusCode.DANGER,
    errors?: string[]
  ) {
    super(ErrorType.FORBIDDEN, message, description, statusCode, errors)
  }
}
