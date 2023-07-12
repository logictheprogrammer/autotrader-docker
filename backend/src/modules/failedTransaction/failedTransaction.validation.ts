import { FailedTransactionStatus } from '@/modules/failedTransaction/failedTransaction.enum'
import Joi from 'joi'

const updateStatus = Joi.object({
  status: Joi.string()
    .valid(...Object.values(FailedTransactionStatus))
    .required(),
})

export default { updateStatus }
