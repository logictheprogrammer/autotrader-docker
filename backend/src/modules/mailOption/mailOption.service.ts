import { Service } from 'typedi'
import {
  IMailOption,
  IMailOptionService,
} from '@/modules/mailOption/mailOption.interface'
import mailOptionModel from '@/modules/mailOption/mailOption.model'
import { THttpResponse } from '@/modules/http/http.type'
import AppException from '@/modules/app/app.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import HttpException from '@/modules/http/http.exception'
import AppRepository from '../app/app.repository'

@Service()
export default class MailOptionService implements IMailOptionService {
  private mailOptionRepository = new AppRepository<IMailOption>(mailOptionModel)

  private async find(
    mailOptionId: string,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IMailOption> {
    const mailOption = await this.mailOptionRepository
      .findById(mailOptionId, fromAllAccounts, userId)
      .collect()

    if (!mailOption) throw new HttpException(404, 'Mail Option not found')

    return mailOption
  }

  public create = async (
    name: string,
    host: string,
    port: number,
    tls: boolean,
    secure: boolean,
    username: string,
    password: string
  ): THttpResponse<{ mailOption: IMailOption }> => {
    try {
      await this.mailOptionRepository.ifExist(
        {
          $or: [{ name }, { username }],
        },
        'Name or Username already exist'
      )

      const mailOption = await this.mailOptionRepository
        .create({
          name,
          host,
          port,
          tls,
          secure,
          username,
          password,
        })
        .save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Mail Option created',
        data: { mailOption },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to create new mail option, please try again'
      )
    }
  }

  public get = async (mailOptionName: string): Promise<IMailOption> => {
    try {
      const mailOption = await this.mailOptionRepository
        .findOne({
          name: mailOptionName,
        })
        .collect()

      if (!mailOption) throw new HttpException(404, 'Mail Option not found')

      return mailOption
    } catch (err: any) {
      throw new AppException(err, 'Unable to get mail option, please try again')
    }
  }

  public async getAll(): Promise<IMailOption[]> {
    try {
      const mailOptions = await this.mailOptionRepository.find().collectAll()
      return mailOptions
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to get mail options, please try again'
      )
    }
  }
}
