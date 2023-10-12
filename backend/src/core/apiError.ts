import { Response } from 'express'
import {
  BadRequestResponse,
  ForbiddenResponse,
  InternalErrorResponse,
  NotFoundResponse,
  RequestConflictResponse,
  UnauthorizedResponse,
} from './apiResponse'

export enum ErrorType {
  UNAUTHORIZED = 'UnauthorizedError',
  INTERNAL = 'InternalError',
  CONFLICT = 'RequestConflictError',
  NOT_FOUND = 'NotFoundError',
  BAD_REQUEST = 'BadRequestError',
  FORBIDDEN = 'ForbiddenError',
}

export abstract class ApiError extends Error {
  constructor(public type: ErrorType, public message: string = 'error') {
    super(message)
  }

  public static handle(err: ApiError, res: Response) {
    switch (err.type) {
      case ErrorType.UNAUTHORIZED:
        return new UnauthorizedResponse(err.message).send(res)
      case ErrorType.INTERNAL:
        return new InternalErrorResponse(err.message).send(res)
      case ErrorType.CONFLICT:
        return new RequestConflictResponse(err.message).send(res)
      case ErrorType.NOT_FOUND:
        return new NotFoundResponse(err.message).send(res)
      case ErrorType.BAD_REQUEST:
        return new BadRequestResponse(err.message).send(res)
      case ErrorType.FORBIDDEN:
        return new ForbiddenResponse(err.message).send(res)
      default: {
        const message = 'Something wrong happened.'
        return new InternalErrorResponse(message).send(res)
      }
    }
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(ErrorType.UNAUTHORIZED, message)
  }
}

export class InternalError extends ApiError {
  constructor(message = 'Internal error') {
    super(ErrorType.INTERNAL, message)
  }
}

export class RequestConflictError extends ApiError {
  constructor(message = 'Resource Already Exist') {
    super(ErrorType.CONFLICT, message)
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(ErrorType.BAD_REQUEST, message)
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found') {
    super(ErrorType.NOT_FOUND, message)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Permission denied') {
    super(ErrorType.FORBIDDEN, message)
  }
}
