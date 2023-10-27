import { activityService } from '../../../setup'

export const setActivityMock = jest
  .spyOn(activityService, 'create')
  .mockImplementation()
