import { Request, Response, NextFunction } from 'express'

type AsyncMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>

export default (asyncMiddleware: AsyncMiddleware) =>
  (req: Request, res: Response, next: NextFunction) => {
    asyncMiddleware(req, res, next).catch(next)
  }
