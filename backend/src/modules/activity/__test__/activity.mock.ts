import ActivityService from '../activity.service'

export const setActivityMock = jest
  .spyOn(ActivityService.prototype, 'set')
  .mockImplementation()
