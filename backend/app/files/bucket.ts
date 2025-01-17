import { Storage } from '@google-cloud/storage'
import Env from '#start/env'

const storage = new Storage({
  keyFilename: './keyfile.json',
})
const bucket = storage.bucket(Env.get('BUCKET_NAME'))

export default bucket
