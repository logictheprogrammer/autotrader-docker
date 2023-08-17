import { ITransfer } from '../../transfer/transfer.interface'
import {
  userA,
  userA_id,
  userB,
  userB_id,
  userC,
  userC_id,
} from '../../user/__test__/user.payload'
import { TransferStatus } from '../transfer.enum'
import { UserAccount } from '../../user/user.enum'
import {
  transferSettingsA,
  transferSettingsB,
} from '../../transferSettings/__test__/transferSettings.payload'

export const transferA_id = '9145de5d5b1f5b3a5c1b539a'

export const transferA = {
  fromUser: userA_id,
  fromUserObject: userA,
  toUser: userB_id,
  toUserObject: userB,
  account: UserAccount.MAIN_BALANCE,
  amount: 1000,
  fee: transferSettingsA.fee,
  status: TransferStatus.PENDING,
}

export const transferB_id = '9145de5d5b1f5b3a5c1b539b'

export const transferB = {
  fromUser: userB_id,
  fromUserObject: userB,
  toUser: userC_id,
  toUserObject: userC,
  account: UserAccount.MAIN_BALANCE,
  amount: 3000,
  fee: transferSettingsB.fee,
  status: TransferStatus.PENDING,
}

// @ts-ignore
export const transferModelReturn: ITransfer = {
  save: jest.fn(),
  toObject: jest.fn().mockReturnValue({
    _id: 'transfer id',
    // @ts-ignore
    collection: {
      name: 'transfer',
    },
  }),
  _id: 'transfer id',
  // @ts-ignore
  collection: {
    name: 'transfer',
  },
}

// @ts-ignore
export const transferAObj: ITransferObject = {
  ...transferA,
  // @ts-ignore
  _id: transferA_id,
}

// @ts-ignore
export const transferBObj: ITransferObject = {
  ...transferB,
  // @ts-ignore
  _id: transferB_id,
}

export const transferInstance = {
  model: transferModelReturn,
  onFailed: 'delete transfer',
  async callback() {},
}
