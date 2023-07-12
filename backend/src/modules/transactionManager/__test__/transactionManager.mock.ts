import TransactionManagerService from '../transactionManager.service'

export const executeTransactionManagerMock = jest
  .spyOn(TransactionManagerService.prototype, 'execute')
  .mockImplementation()
