import * as fs from 'fs-extra'
import sharp from 'sharp'
import { Request } from 'express'
import path from 'path'
import imageFileConfig from './imageFile.config'
import {
  FileToResize,
  ImageDetails,
  ImageToUpload,
} from './imageFile.interface'

export default class MulterSharpResizer {
  private imagesDetails: ImageDetails[] = []

  constructor(private req: Request, private imagesToUpload: ImageToUpload[]) {}

  public async resize() {
    if (this.req.files) {
      const files = this.req.files as {
        [fieldname: string]: Express.Multer.File[]
      }

      const filesToResize: FileToResize[] = []

      this.imagesToUpload.forEach((imageToUpload, index) => {
        if (files[imageToUpload.name]) {
          files[imageToUpload.name].forEach((file, i) => {
            filesToResize.push({
              file,
              index: i,
              imageOption: imageToUpload,
            })
          })

          // attaching the total images of the fieldname to the path
          this.imagesToUpload[index].url = `${imageToUpload.url}-${
            files[imageToUpload.name].length
          }`
          this.imagesToUpload[index].uniqueFileFolder = `${
            imageToUpload.uniqueFileFolder
          }-${files[imageToUpload.name].length}`
          this.imagesToUpload[index].filePath = `${imageToUpload.filePath}-${
            files[imageToUpload.name].length
          }`
        }
      })

      await Promise.all(
        filesToResize.map(async (fileToResize) => {
          await this._resizeImage(
            fileToResize.file,
            fileToResize.imageOption,
            fileToResize.index
          )
        })
      ).then(async () => {
        imageFileConfig.done &&
          (await imageFileConfig.done({
            imagesUploaded: this.imagesToUpload,
            imagesDetails: this.imagesDetails,
            request: this.req,
          }))
      })
    }
  }

  private async _resizeImage(
    file: Express.Multer.File,
    imageOption: ImageToUpload,
    index: number
  ) {
    await Promise.all(
      imageOption.sizes.map((size) => {
        const extension = imageOption.extension || file.mimetype.split('/')[1]

        const filename = `${size.name}.${extension}`

        const filePath = path.join(imageOption.filePath, index.toString())

        fs.mkdirsSync(filePath)

        const imageDetails: ImageDetails = {
          field: file.fieldname,
          foldername: imageOption.uniqueFileFolder,
          filename,
          path: filePath,
          url: `${imageOption.url}/${index}/${filename}`,
          extension,
        }

        this.imagesDetails.push(imageDetails)

        return sharp(file.buffer)
          .resize(size.width, size.height, {
            fit: imageOption.fit,
            background: imageOption.background,
          })
          .toFile(path.join(filePath, filename))
          .then(async () => {
            imageFileConfig.afterEachFileResized &&
              (await imageFileConfig.afterEachFileResized(imageDetails))
          })
          .catch((err) => {
            console.log(err)
          })
      })
    )
  }
}
