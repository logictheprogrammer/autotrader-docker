import * as fs from 'fs-extra'
import sharp from 'sharp'
import { Request } from 'express'
import { UploadedFile } from 'express-fileupload'
import path from 'path'
import imageFileConfig from './imageFile.config'
import { ImageToUpload } from './imageFile.service'

// v2.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_KEY,
//   api_secret: process.env.CLOUDINARY_SECRET,
//   secure: true,
// })

enum FitEnum {
  contain = 'contain',
  cover = 'cover',
  fill = 'fill',
  inside = 'inside',
  outside = 'outside',
}

interface FileToResize {
  file: Express.Multer.File
  index: number
  imageOption: ImageToUpload
}

interface ImageDetails {
  foldername: string
  filename: string
  field: string
  path: string
}

////////

interface MulterSharpResizerOptions {
  filename: string | { [key: string]: string }
  sizes: { path: string; width: number | null; height: number | null }[]
  paths: string[]
  url: string
  options: { fit: FitEnum; background: { r: number; g: number; b: number } }
}

interface ImagePath {
  path: string
  folder: string
  name: string
  fullPath: string
}

// interface CloudinaryOptions {
//   use_filename: boolean
//   unique_filename: boolean
//   overwrite: boolean
//   folder: string
// }

export default class MulterSharpResizer {
  private imagesDetails: ImageDetails[] = []
  private ext?: string
  private name?: string
  private path?: string
  private data: any[] = []
  private tmpName?: string
  private tmpField?: string
  private _imagePaths: ImagePath[] = []

  // @ts-ignore
  private options: {
    filename: string | { [key: string]: string }
    sizes: { path: string; width: number | null; height: number | null }[]
    paths: string[]
    url: string
    options: { fit: FitEnum; background: { r: number; g: number; b: number } }
  }

  // constructor(private req: Request, private options: MulterSharpResizerOptions) {
  // this.options = options
  // const finalFilename = {}
  // const finalPaths: string[] = []
  // Object.keys(this.options.filename).forEach((val, i) => {
  //   //@ts-ignore
  //   if (this.req.files[val]) {
  //     //@ts-ignore
  //     finalFilename[val] = this.options.filename[val]
  //     finalPaths.push(this.options.paths[i])
  //   }
  // })
  // this.options.filename = finalFilename
  // this.options.paths = finalPaths
  // }

  constructor(private req: Request, private imagesToUpload: ImageToUpload[]) {
    // console.log(this.req.files)
  }

  isUploadedFile(obj: any): obj is UploadedFile {
    return (
      obj &&
      typeof obj.name === 'string' &&
      typeof obj.mv === 'function' &&
      typeof obj.data === 'string' &&
      typeof obj.tempFilePath === 'string'
    )
  }

  async resize() {
    if (this.req.files) {
      const files = this.req.files! as {
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
          this.imagesToUpload[index].url = `${imageToUpload.url}_${
            files[imageToUpload.name].length
          }`
          this.imagesToUpload[index].uniqueFileFolder = `${
            imageToUpload.uniqueFileFolder
          }_${files[imageToUpload.name].length}`
          this.imagesToUpload[index].filePath = `${imageToUpload.filePath}_${
            files[imageToUpload.name].length
          }`
        }
      })

      await Promise.all(
        filesToResize.map(async (fileToResize) => {
          await this.resizeImage(
            fileToResize.file,
            fileToResize.imageOption,
            fileToResize.index
          )
        })
      ).then(() => {
        if (imageFileConfig.folderAsTemp) {
          this.imagesToUpload.forEach(({ filePath }) => {
            this.deleteTempFiles(filePath)
          })
        }
      })
    }
  }

  getData() {
    if (this.req.files) {
      if (!Array.isArray(this.req.files)) {
        return this.removeProps(this.getDataWithFields(), 'field')
      } else {
        for (let i = 0; i < this.req.files.length - 1; i++) {
          const files = this.imagesDetails.splice(0, this.options.sizes.length)
          this.data.push(...files)
        }
      }
    }

    this.data.push(...this.imagesDetails)

    return this.data.map((f) =>
      this.renameKeys(
        this.options.sizes.map((s) => s.path),
        f
      )
    )
  }

  renameKeys(keys: string[], obj: any) {
    return Object.keys(obj).reduce((acc, key, index) => {
      this.tmpName = obj[key].name
      this.tmpField = obj[key].field
      delete obj[key].name
      delete obj[key].field
      return {
        ...acc,
        name: this.tmpName,
        field: this.tmpField,
        ...{ [keys[index]]: obj[key] },
      }
    }, {})
  }

  async resizeImage(
    file: Express.Multer.File,
    imageOption: ImageToUpload,
    index: number
  ) {
    await Promise.all(
      imageOption.sizes.map((size) => {
        const extension =
          imageOption.defaultExtension || file.mimetype.split('/')[1]

        const filename = `${size.name}.${extension}`

        const filePath = path.join(imageOption.filePath, index.toString())

        fs.mkdirsSync(filePath)

        const imageDetails: ImageDetails = {
          field: file.fieldname,
          foldername: imageOption.uniqueFileFolder,
          filename,
          path: filePath,
        }

        this.imagesDetails.push(imageDetails)

        return sharp(file.buffer)
          .resize(size.width, size.height, {
            fit: imageOption.fit,
            background: imageOption.background,
          })
          .toFile(path.join(filePath, filename))
          .then(async () => {
            await imageFileConfig.afterResize(imageDetails)
          })
          .catch((err) => {
            console.log(err)
          })
      })
    )
  }

  async deleteTempFiles(foldername: string) {
    fs.access(foldername, (err) => {
      if (err) {
        return
      }
      fs.unlink(foldername, (err) => {
        if (err) {
          console.log(err)
          throw err
        }
        console.log('Deleted')
      })
    })
  }

  getDataWithFields() {
    for (const p in this.req.files) {
      // @ts-ignore
      if (Array.isArray(this.req.files[p])) {
        // @ts-ignore
        for (let i = 0; i < this.req.files[p].length; i++) {
          // @ts-ignore
          this.data.push({ ...this.files.splice(0, this.options.sizes.length) })
        }
      } else {
        // @ts-ignore
        this.data.push({ ...this.files.splice(0, this.options.sizes.length) })
      }
    }

    return this.groupByFields(
      this.data.map((f) =>
        this.renameKeys({ ...this.options.sizes.map((s, i) => s.path) }, f)
      ),
      'field'
    )
  }

  groupByFields(array: any[], prop: string) {
    return array.reduce(function (r, a) {
      r[a[prop]] = r[a[prop]] || []
      r[a[prop]].push(a)
      return r
    }, Object.create(null))
  }

  removeProps(obj: any, propToDelete: string) {
    for (const property in obj) {
      if (typeof obj[property] == 'object') {
        delete obj.property
        let newData = this.removeProps(obj[property], propToDelete)
        obj[property] = newData
      } else {
        if (property === propToDelete) {
          delete obj[property]
        }
      }
    }
    return obj
  }
}
