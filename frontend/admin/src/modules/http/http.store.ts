import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ResponseStatus } from '@/modules/http/http.enum'
import type { AxiosResponse } from 'axios'
import type { IHttpResponse } from '@/modules/http/http.interface'
// import Cookies from 'js-cookie'

export const useHttpStore = defineStore('http', () => {
  const onDemo = ref(!!localStorage.getItem('demo'))
  const isNavigating = ref(false)
  // const CONFIG = useConfigStore()

  const post = reactive<{
    active: boolean
    triggered: boolean
    status?: ResponseStatus
    title?: string
    body?: string
  }>({ active: false, triggered: false })

  const get = reactive<{
    active: boolean
    triggered: boolean
    status?: ResponseStatus
    title?: string
    body?: string
  }>({ active: false, triggered: false })

  function setDemo(demo: boolean) {
    onDemo.value = demo

    if (demo) localStorage.setItem('demo', '1')
    else localStorage.removeItem('demo')
  }

  function setNavigating(navigating: boolean = false) {
    isNavigating.value = navigating
  }
  function setPost(
    active: boolean = false,
    triggered: boolean = false,
    status?: ResponseStatus,
    title?: string,
    body?: string
  ) {
    post.active = active
    post.status = status
    post.title = title
    post.body = body
    post.triggered = !active && triggered
  }
  function clearPost() {
    setPost()
  }
  function clearGet() {
    setGet()
  }
  function setGet(
    active: boolean = false,
    triggered: boolean = false,
    status?: ResponseStatus,
    title?: string,
    body?: string
  ) {
    get.active = active
    get.status = status
    get.title = title
    get.body = body
    get.triggered = !active && triggered
  }

  function handlePost(
    response: AxiosResponse<IHttpResponse>,
    triggered: boolean = true
  ) {
    let data: IHttpResponse

    if (response && response.data) {
      data = response.data
    } else {
      data = {
        status: ResponseStatus.ERROR,
        message: 'An unexpected error occured, please try again later.',
      }
    }

    setPost(false, triggered, data.status, data.message)
  }

  function handleGet(response: any, triggered: boolean = true) {
    let data

    if (response && response.data) {
      data = response.data
    } else {
      data = {
        status: ResponseStatus.ERROR,
        message: 'An unexpected error occured, please try again later.',
      }
    }

    setGet(false, triggered, data.status, data.message)
  }

  return {
    isNavigating,
    post,
    get,
    onDemo,
    setDemo,
    setNavigating,
    setPost,
    setGet,
    handlePost,
    handleGet,
    clearPost,
    clearGet,
  }
})
