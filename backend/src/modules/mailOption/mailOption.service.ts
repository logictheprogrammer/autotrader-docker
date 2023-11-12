import { Service } from 'typedi'
import {
  IMailOption,
  IMailOptionObject,
  IMailOptionService,
} from '@/modules/mailOption/mailOption.interface'
import { NotFoundError, RequestConflictError } from '@/core/apiError'
import { FilterQuery } from 'mongoose'
import MailOptionModel from '@/modules/mailOption/mailOption.model'

@Service()
export default class MailOptionService implements IMailOptionService {
  private mailOptionModel = MailOptionModel

  public async create(
    name: string,
    host: string,
    port: number,
    tls: boolean,
    secure: boolean,
    username: string,
    password: string
  ): Promise<IMailOptionObject> {
    const mailOptionExist = await this.mailOptionModel.findOne({
      $or: [{ name }, { username }],
    })

    if (mailOptionExist)
      throw new RequestConflictError('Name or Username already exist')

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
  }

  public async fetch(
    filter: FilterQuery<IMailOption>
  ): Promise<IMailOptionObject> {
    const mailOption = await this.mailOptionModel.findOne(filter)

    if (!mailOption) throw new NotFoundError('Mail Option not found')
    mailOption.password = mailOption.getPassword()

    return mailOption
  }

  public async fetchAll(
    filter: FilterQuery<IMailOption>
  ): Promise<IMailOptionObject[]> {
    const mailOptions = await this.mailOptionModel.find(filter)
    return mailOptions
  }

  public async count(filter: FilterQuery<IMailOption>): Promise<number> {
    return await this.mailOptionModel.count(filter)
  }
}
