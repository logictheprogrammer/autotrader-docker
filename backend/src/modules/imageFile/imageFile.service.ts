import { NextFunction, Request, Response } from 'express'
import path from 'path'
import multer from 'multer'
import MulterSharpResizer from './multerSharpResizer'
import imageFileConfig from './imageFile.config'
import { BadRequestError } from '@/core/apiError'
import {
  ImageToUpload,
  ImageToUploadParams,
  ImageToValidate,
} from './imageFile.interface'
import { rimraf } from 'rimraf'

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

        // Setting Defaults
        for (let i = 0; i < imagesToUploadParams.length; i++) {
          const imageToUploadParams = imagesToUploadParams[i]

          imagesToUploadParams[i].getFolderName =
            imageToUploadParams.getFolderName || imageFileConfig.getFolderName

          imagesToUploadParams[i].parentFolder =
            imageToUploadParams.parentFolder || imageToUploadParams.name

          imagesToUploadParams[i].resize = imageToUploadParams.resize ||
            imageFileConfig.resize || [
              {
                height: null,
                width: null,
                name: 'default',
              },
            ]

          const uploadTo = imageFileConfig.uploadTo || 'images'

          imagesToUploadParams[i].fit =
            imageToUploadParams.fit || imageFileConfig.fit
          imagesToUploadParams[i].background =
            imageToUploadParams.background || imageFileConfig.background
          imagesToUploadParams[i].extension =
            imageToUploadParams.extension || imageFileConfig.extension

          const files = req.files as {
            [fieldname: string]: Express.Multer.File[]
          }

          const uniqueFileFolder =
            (imagesToUploadParams[i].getFolderName &&
              (await imagesToUploadParams[i].getFolderName!(
                files[imageToUploadParams.name]
              ))) ||
            crypto.randomUUID()

          imagesToUpload.push({
            name: imagesToUploadParams[i].name,
            uniqueFileFolder: uniqueFileFolder,
            background: imagesToUploadParams[i].background,
            fit: imagesToUploadParams[i].fit,
            extension: imagesToUploadParams[i].extension,
            filePath: path.join(
              process.cwd(),
              uploadTo,
              imagesToUploadParams[i].parentFolder!,
              uniqueFileFolder
            ),
            parentFolder: imagesToUploadParams[i].parentFolder!,
            sizes: imagesToUploadParams[i].resize!,
            url: `${req.protocol}://${req.get('host')}/${uploadTo.replace(
              '\\',
              '/'
            )}/${imagesToUploadParams[i].parentFolder!}/${uniqueFileFolder}`,
          })
        }

        await new MulterSharpResizer(req, imagesToUpload).resize()
      } catch (err: any) {
        return next(new Error(err))
      }
      next()
    }

  public async delete(parentFolder: string, fileFolder: string) {
    try {
      const filePath = path.join(
        process.cwd(),
        imageFileConfig.uploadTo || 'images',
        parentFolder,
        fileFolder
      )

      await rimraf(filePath)
      console.log('deleted')
    } catch (error) {
      console.log(error)
    }
  }
}
