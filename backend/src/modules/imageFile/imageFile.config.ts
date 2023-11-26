import Cryptograph from '@/core/cryptograph'
import path from 'path'
import { ImageFileConfig } from './imageFile.interface'
import { FitEnum } from './imageFile.enum'

const imageFileConfig: ImageFileConfig = {
  mimeTypes: ['image/png', 'image/jpg', 'image/jpeg'],
  maxFileSize: 11485760,
  uploadTo: path.join('src', 'images'),
  fit: FitEnum.cover,
  background: { r: 255, g: 255, b: 255, alpha: 1 },
  extension: 'png',
  resize: [{ height: null, width: null, name: 'default' }],
  getFolderName: async (files) => {
    return Cryptograph.randomUUID()
  },
  afterEachFileResized: async (imageDetails) => {
    console.log(imageDetails)
  },
  done: async ({ imagesDetails, imagesUploaded, request }) => {},
}

export default imageFileConfig
