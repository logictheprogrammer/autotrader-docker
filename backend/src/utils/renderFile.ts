import path from 'path'
import ejs from 'ejs'

const renderFile = async (file: string, payload: object) => {
  const pathArr = file.split('/')
  pathArr[pathArr.length - 1] += '.ejs'

  return await ejs.renderFile(
    path.join(__dirname, '..', 'templates', ...pathArr),
    payload
  )
}

export default renderFile
