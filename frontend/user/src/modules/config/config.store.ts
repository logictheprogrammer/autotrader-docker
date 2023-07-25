import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  const onProduction = import.meta.env.PROD
  const appName = 'Aurora'
  const appSlogan = 'Invest Smarter'
  const appUrl = onProduction ? '' : 'http://localhost:5173'
  const email = 'contact@aurora.com'
  const address = '221B Baker St, Marylebone'
  const phone = '+123 456 7890'
  const whatsApp = ''
  const facebook = ''
  const twitter = ''
  const instagram = ''
  const telegram = ''
  const discord = ''
  const linkedIn = ''
  const liveChat = ''

  const activeLiveChat = false
  const activeWhatsApp = false
  const activeTestimonies = false

  return {
    onProduction,
    appName,
    appSlogan,
    appUrl,
    email,
    address,
    phone,
    whatsApp,
    facebook,
    twitter,
    instagram,
    telegram,
    discord,
    linkedIn,
    liveChat,
    activeLiveChat,
    activeWhatsApp,
    activeTestimonies,
  }
})

export default computed(() => useConfigStore())
