import { NextFunction, Request, Response } from 'express'
import path from 'path'
import multer from 'multer'
import MulterSharpResizer from './multerSharpResizer'
import * as fs from 'fs-extra'
import imageFileConfig, { ImageFileSizes } from './imageFile.config'
import { BadRequestError } from '@/core/apiError'

interface ImageToValidate {
  name: string
  maxCount?: number
}

interface ImageSizes {
  name: string
  width: number | null
  height: number | null
}

interface ImageToUploadParams {
  name: string
  uniqueFileFolder?: string
  parentFolder?: string
  resize?: ImageFileSizes[]
  fit?: 'cover' | 'contain'
  background?: { r: number; g: number; b: number; alpha: number }
  defaultExtension?: string
}

export interface ImageToUpload {
  name: string
  uniqueFileFolder: string
  filePath: string
  parentFolder: string
  sizes: typeof imageFileConfig.sizes
  url: string
  fit: 'cover' | 'contain'
  background: { r: number; g: number; b: number; alpha: number }
  defaultExtension?: string
}

export default class ImageFileService {
  public static validate =
    (
      imagesToValidate: ImageToValidate[],
      maxFileSize?: number,
      mimeTypes?: string[]
    ) =>
    (req: Request, res: Response, next: NextFunction) => {
      maxFileSize = maxFileSize || imageFileConfig.maxFileSize
      mimeTypes = mimeTypes || imageFileConfig.mimeTypes

      // Setting Defaults
      imagesToValidate.forEach((imageToValidate, i) => {
        imagesToValidate[i].maxCount =
          imageToValidate.maxCount || imageFileConfig.maxCount
      })

      // Multer Fields
      const fields = imagesToValidate.map((ele) => {
        return {
          name: ele.name,
          maxCount: ele.maxCount,
        }
      })

      this._prepare(maxFileSize, mimeTypes).fields(fields)(
        req,
        res,
        (err: any) => {
          if (err) {
            return next(err)
          }
          return next()
        }
      )
    }

  private static _multerFilter =
    (mimeTypes?: string[]) => (req: Request, file: any, cb: any) => {
      if (!mimeTypes || (mimeTypes && mimeTypes.includes(file.mimetype))) {
        return cb(null, true)
      } else cb(new BadRequestError('Invalid Image format'), false)
    }

  private static _prepare = (maxFileSize?: number, mimeTypes?: string[]) =>
    multer({
      storage: multer.memoryStorage(),
      fileFilter: this._multerFilter(mimeTypes),
      limits: {
        fileSize: maxFileSize,
      },
    })

  // public resize(imageNameArr: string[], sizesArr: any) {
  public static upload =
    (imagesToUploadParams: ImageToUploadParams[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const imagesToUpload: ImageToUpload[] = []

        const uniqueFileFolder = await imageFileConfig.getFileName(req.files)
        // Setting Defaults
        imagesToUploadParams.forEach((imageToUploadParams, i) => {
          imagesToUploadParams[i].parentFolder =
            imageToUploadParams.parentFolder || imageToUploadParams.name
          imagesToUploadParams[i].resize = imageToUploadParams.resize || [
            ImageFileSizes.ORIGINAL,
          ]

          imagesToUploadParams[i].fit =
            imageToUploadParams.fit || imageFileConfig.imageFit
          imagesToUploadParams[i].background =
            imageToUploadParams.background || imageFileConfig.backgroundColor
          imagesToUploadParams[i].defaultExtension =
            imageToUploadParams.defaultExtension ||
            imageFileConfig.defaultExtension

          imagesToUpload.push({
            name: imagesToUploadParams[i].name,
            uniqueFileFolder: uniqueFileFolder,
            background: imagesToUploadParams[i].background!,
            fit: imagesToUploadParams[i].fit!,
            defaultExtension: imagesToUploadParams[i].defaultExtension,
            filePath: path.join(
              process.cwd(),
              imageFileConfig.uploadTo,
              imagesToUploadParams[i].parentFolder!,
              uniqueFileFolder
            ),
            parentFolder: imagesToUploadParams[i].parentFolder!,
            sizes: imageFileConfig.sizes.filter((obj) => {
              if (imagesToUploadParams[i].resize!.includes(obj.name))
                return true
            }),
            url: `${req.protocol}://${req.get(
              'host'
            )}/${imageFileConfig.uploadTo.replace(
              '\\',
              '/'
            )}/${imagesToUploadParams[i].parentFolder!}/${imagesToUploadParams[
              i
            ].uniqueFileFolder!}`,
          })
        })

        const resizeObject = new MulterSharpResizer(req, imagesToUpload)
        await resizeObject.resize()
        // const getDataUploaded = resizeObject.getData()
        // imageNameArr.forEach((imageName: any) => {
        //   req.body[imageName] = getDataUploaded[imageName]
        // })
      } catch (err: any) {
        console.log(err)
        return next(new Error(err))
      }
      next()
    }

  public async delete(folder: string, filename: string, sizesArr: string[]) {
    console.log('deleted')
    sizesArr.forEach((size) => {
      const filePath = path.join(
        process.cwd(),
        imageFileConfig.uploadTo,
        folder,
        size,
        filename
      )

      if (imageFileConfig.externalHosting) {
        const deleteId =
          process.env.CLOUDINARY_PROJECT +
          '/' +
          folder +
          '/' +
          size +
          '/' +
          filename.split('.').slice(0, -1).join('.')

        // v2.uploader.destroy(deleteId).then((res) => {
        //   console.log(res)
        // })
      } else {
        fs.access(filePath, (err) => {
          if (err) {
            console.log(err)
            return
          }

          fs.unlink(filePath, (err) => {
            if (err) {
              console.log(err)
              throw err
            }
          })
        })
      }
    })
  }
}
