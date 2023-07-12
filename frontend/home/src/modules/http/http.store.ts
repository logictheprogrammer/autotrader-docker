import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ResponseStatus } from '@/modules/http/http.enum'
import type { AxiosResponse } from 'axios'
import type { IHttpResponse } from './http.interface'

export const useHttpStore = defineStore('http', () => {
  const isNavigating = ref(false)
  const isRequesting = ref(false)
  const isFetching = ref(true)

  const requestTriggered = ref(false)
  const fetchedTriggered = ref(false)

  const responseStatus = ref<ResponseStatus>()
  const titleMessage = ref<string>()
  const bodyMessage = ref<string>()

  function unsetRequestTriggered() {
    requestTriggered.value = false
  }
  function unsetFetchedTriggered() {
    fetchedTriggered.value = false
  }
  function setNavigating(navigating: boolean = false) {
    isNavigating.value = navigating
  }
  function setRequesting(
    requesting: boolean = false,
    triggered: boolean = false,
    status?: ResponseStatus,
    title?: string,
    body?: string
  ) {
    isRequesting.value = requesting
    requestTriggered.value = !requesting && triggered
    responseStatus.value = status
    titleMessage.value = title
    bodyMessage.value = body
  }

  function setFetching(
    fetching: boolean = false,
    triggered: boolean = false,
    status?: ResponseStatus,
    title?: string,
    body?: string
  ) {
    isFetching.value = fetching
    fetchedTriggered.value = !fetching && triggered
    responseStatus.value = status
    titleMessage.value = title
    bodyMessage.value = body
  }

  function handleRequest(
    response: AxiosResponse<IHttpResponse>,
    triggered: boolean = true
  ) {
    let data: IHttpResponse

    if (response) {
      data = response.data
    } else {
      data = {
        status: ResponseStatus.ERROR,
        message: 'An unexpected error occured, please try again later.',
      }
    }

    setRequesting(false, triggered, data.status, data.message)
  }

  function handleFetch(response: any, triggered: boolean = true) {
    let data

    if (response) {
      data = response.data
    } else {
      data = {
        status: ResponseStatus.ERROR,
        message: 'An unexpected error occured, please try again later.',
      }
    }

    setFetching(false, triggered, data.status, data.message)
  }

  return {
    isNavigating,
    isRequesting,
    requestTriggered,
    fetchedTriggered,
    isFetching,
    responseStatus,
    titleMessage,
    bodyMessage,
    setNavigating,
    setFetching,
    unsetFetchedTriggered,
    setRequesting,
    unsetRequestTriggered,
    handleRequest,
    handleFetch,
  }
})
