import Cryptograph from '@/core/cryptograph'
import path from 'path'

export enum ImageFileSizes {
  ORIGINAL = 'original',
  ITEM_VIEW = 'item-view',
  ITEM_HERO = 'item-hero',
  ITEM_COVER = 'item-cover',
  ITEM_PROFILE = 'item-profile',
  COVER_MAIN = 'cover-main',
  COVER_PROFILE = 'cover-profile',
  COVER_CARD = 'cover-card',
  COVER_MENU = 'cover-menu',
  PROFILE_MAIN = 'profile-main',
  PROFILE_CARD = 'profile-card',
  PROFILE_NAV = 'profile-nav',
  PROFILE_ICON = 'profile-icon',
}

export default {
  sizes: [
    { name: ImageFileSizes.ORIGINAL, width: null, height: null },
    { name: ImageFileSizes.ITEM_VIEW, width: 1742, height: 980 },
    { name: ImageFileSizes.ITEM_HERO, width: 940, height: 640 },
    { name: ImageFileSizes.ITEM_COVER, width: 370, height: 415 },
    { name: ImageFileSizes.ITEM_PROFILE, width: 100, height: 100 },
    { name: ImageFileSizes.COVER_MAIN, width: 1920, height: 320 },
    { name: ImageFileSizes.COVER_PROFILE, width: 600, height: 100 },
    { name: ImageFileSizes.COVER_CARD, width: 340, height: 100 },
    { name: ImageFileSizes.COVER_MENU, width: 240, height: 42 },
    { name: ImageFileSizes.PROFILE_MAIN, width: 164, height: 164 },
    { name: ImageFileSizes.PROFILE_CARD, width: 100, height: 100 },
    { name: ImageFileSizes.PROFILE_NAV, width: 50, height: 50 },
    { name: ImageFileSizes.PROFILE_ICON, width: 24, height: 24 },
  ],
  mimeTypes: ['image/png', 'image/jpg', 'image/jpeg'],
  maxCount: undefined,
  maxFileSize: 11485760,
  uploadTo: path.join('src', 'images1'),
  imageFit: 'cover' as 'cover' | 'contain',
  backgroundColor: { r: 255, g: 255, b: 255, alpha: 1 },
  externalHosting: false,
  imageHost: '',
  folderAsTemp: true,
  defaultExtension: 'png',
  afterResize: async (imageDetails: any) => {},
  getFileName: async (object: any) => {
    return Cryptograph.randomUUID()
  },
}
