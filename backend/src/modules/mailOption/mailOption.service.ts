import { Service } from 'typedi'
import {
  IMailOption,
  IMailOptionObject,
  IMailOptionService,
} from '@/modules/mailOption/mailOption.interface'
import mailOptionModel from '@/modules/mailOption/mailOption.model'
import { BadRequestError, NotFoundError, ServiceError } from '@/core/apiError'
import { FilterQuery } from 'mongoose'

@Service()
export default class MailOptionService implements IMailOptionService {
  private mailOptionModel = mailOptionModel

  public async create(
    name: string,
    host: string,
    port: number,
    tls: boolean,
    secure: boolean,
    username: string,
    password: string
  ): Promise<IMailOptionObject> {
    try {
      const mailOptionExist = await this.mailOptionModel.findOne({
        $or: [{ name }, { username }],
      })

      if (mailOptionExist)
        throw new BadRequestError('Name or Username already exist')

      const mailOption = await this.mailOptionModel.create({
        name,
        host,
        port,
        tls,
        secure,
        username,
        password,
      })

      return mailOption
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Unable to create new mail option, please try again'
      )
    }
  }

  public async fetch(
    filter: FilterQuery<IMailOption>
  ): Promise<IMailOptionObject> {
    try {
      const mailOption = await this.mailOptionModel.findOne(filter)

      if (!mailOption) throw new NotFoundError('Mail Option not found')

      return mailOption
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Unable to fetch mail option, please try again'
      )
    }
  }

  public async fetchAll(
    filter: FilterQuery<IMailOption>
  ): Promise<IMailOptionObject[]> {
    try {
      const mailOptions = await this.mailOptionModel.find(filter)
      return mailOptions
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Unable to fetch mail options, please try again'
      )
    }
  }
}
