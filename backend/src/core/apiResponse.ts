import { Response } from 'express'

export enum StatusCode {
  SUCCESS = '1000',
  INFO = '1001',
  WARNING = '1002',
  DANGER = '1003',
}

enum ResponseStatus {
  SUCCESS = 200,
  SUCCESS_CREATED = 201,
  BAD_REQUEST = 400,
  CONFLICT = 409,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

abstract class ApiResponse {
  constructor(
    protected statusCode: StatusCode,
    protected status: ResponseStatus,
    protected message: string,
    protected description?: string,
    protected data?: any,
    protected errors?: string[],
    protected errorType?: string
  ) {}

  public send(res: Response) {
    return res.status(this.status).json({
      status: this.statusCode,
      messsage: this.message,
      description: this.description,
      data: this.data,
      errors: this.errors,
      errorType: this.errorType,
    })
  }
}

export class NotFoundResponse extends ApiResponse {
  constructor(
    errorType: string,
    message: string,
    description?: string,
    statusCode?: StatusCode,
    errors?: string[]
  ) {
    super(
      statusCode || StatusCode.DANGER,
      ResponseStatus.NOT_FOUND,
      message,
      description,
      undefined,
      errors,
      errorType
    )
  }
}

export class BadRequestResponse extends ApiResponse {
  constructor(
    errorType: string,
    message: string,
    description?: string,
    statusCode?: StatusCode,
    errors?: string[]
  ) {
    super(
      statusCode || StatusCode.DANGER,
      ResponseStatus.BAD_REQUEST,
      message,
      description,
      undefined,
      errors,
      errorType
    )
  }
}

export class RequestConflictResponse extends ApiResponse {
  constructor(
    errorType: string,
    message: string,
    description?: string,
    statusCode?: StatusCode,
    errors?: string[]
  ) {
    super(
      statusCode || StatusCode.DANGER,
      ResponseStatus.CONFLICT,
      message,
      description,
      undefined,
      errors,
      errorType
    )
  }
}

export class UnauthorizedResponse extends ApiResponse {
  constructor(
    errorType: string,
    message: string,
    description?: string,
    statusCode?: StatusCode,
    errors?: string[]
  ) {
    super(
      statusCode || StatusCode.DANGER,
      ResponseStatus.UNAUTHORIZED,
      message,
      description,
      undefined,
      errors,
      errorType
    )
  }
}

export class ForbiddenResponse extends ApiResponse {
  constructor(
    errorType: string,
    message: string,
    description?: string,
    statusCode?: StatusCode,
    errors?: string[]
  ) {
    super(
      statusCode || StatusCode.DANGER,
      ResponseStatus.FORBIDDEN,
      message,
      description,
      undefined,
      errors,
      errorType
    )
  }
}

export class InternalErrorResponse extends ApiResponse {
  constructor(
    errorType: string,
    message: string,
    description?: string,
    statusCode?: StatusCode,
    errors?: string[]
  ) {
    super(
      statusCode || StatusCode.DANGER,
      ResponseStatus.INTERNAL_ERROR,
      message,
      description,
      undefined,
      errors,
      errorType
    )
  }
}

export class SuccessResponse extends ApiResponse {
  constructor(
    message: string,
    data?: any,
    description?: string,
    statusCode?: StatusCode
  ) {
    super(
      statusCode || StatusCode.SUCCESS,
      ResponseStatus.SUCCESS,
      message,
      description,
      data
    )
  }
}

export class SuccessCreatedResponse extends ApiResponse {
  constructor(
    message: string,
    data: any,
    description?: string,
    statusCode?: StatusCode
  ) {
    super(
      statusCode || StatusCode.SUCCESS,
      ResponseStatus.SUCCESS_CREATED,
      message,
      description,
      data
    )
  }
}
