import { Service } from 'typedi'
import {
  IMailOption,
  IMailOptionService,
} from '@/modules/mailOption/mailOption.interface'
import mailOptionModel from '@/modules/mailOption/mailOption.model'
import ServiceQuery from '@/modules/service/service.query'
import { THttpResponse } from '@/modules/http/http.type'
import ServiceException from '@/modules/service/service.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import HttpException from '@/modules/http/http.exception'

@Service()
export default class MailOptionService implements IMailOptionService {
  private mailOptionModel = new ServiceQuery<IMailOption>(mailOptionModel)

  private async find(
    mailOptionId: string,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IMailOption> {
    const mailOption = await this.mailOptionModel.findById(
      mailOptionId,
      fromAllAccounts,
      userId
    )

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
      await this.mailOptionModel.ifExist(
        {
          $or: [{ name }, { username }],
        },
        'Name or Username already exist'
      )

      const mailOption = await this.mailOptionModel.self.create({
        name,
        host,
        port,
        tls,
        secure,
        username,
        password,
      })
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Mail Option created',
        data: { mailOption },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to create new mail option, please try again'
      )
    }
  }

  public get = async (mailOptionName: string): Promise<IMailOption> => {
    try {
      const mailOption = await this.mailOptionModel.findOne({
        name: mailOptionName,
      })

      if (!mailOption) throw new HttpException(404, 'Mail Option not found')

      return mailOption
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to get mail option, please try again'
      )
    }
  }

  public async getAll(): Promise<IMailOption[]> {
    try {
      const mailOptions = await this.mailOptionModel.find()
      return mailOptions
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to get mail options, please try again'
      )
    }
  }
}
