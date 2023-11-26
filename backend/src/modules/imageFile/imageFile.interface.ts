import { Request } from 'express'
import { FitEnum } from './imageFile.enum'

export interface ImageToValidate {
  name: string
  maxCount?: number
}

export interface ImageSizes {
  name: string
  width: number | null
  height: number | null
}

export interface ImageToUploadParams {
  name: string
  parentFolder?: string
  resize?: ImageSizes[]
  fit?: FitEnum
  background?: { r: number; g: number; b: number; alpha: number }
  extension?: string
  getFolderName?(files: Express.Multer.File[]): Promise<string>
}

export interface ImageToUpload {
  name: string
  uniqueFileFolder: string
  filePath: string
  parentFolder: string
  sizes: ImageSizes[]
  url: string
  fit?: FitEnum
  background?: { r: number; g: number; b: number; alpha: number }
  extension?: string
}

export interface FileToResize {
  file: Express.Multer.File
  index: number
  imageOption: ImageToUpload
}

export interface ImageDetails {
  foldername: string
  filename: string
  field: string
  path: string
  url: string
  extension: string
}

export interface ImageFileConfig {
  mimeTypes?: string[]
  maxCount?: number
  maxFileSize?: number
  resize?: ImageSizes[]
  uploadTo?: string
  fit?: FitEnum
  background?: { r: number; g: number; b: number; alpha: number }
  extension?: string
  afterEachFileResized?(imageDetails: ImageDetails): Promise<void>
  done?(result: {
    imagesUploaded: ImageToUpload[]
    imagesDetails: ImageDetails[]
    request: Request
  }): Promise<void>
  getFolderName?(files: Express.Multer.File[]): Promise<string>
}
