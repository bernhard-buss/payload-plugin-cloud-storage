import { Config } from 'payload/config'
import { UploadedFile } from 'express-fileupload'
import { Field } from 'payload/types'
import { GetAdminThumbnail } from 'payload/dist/uploads/types'
import uploadHook from './hooks/uploadHook'
import deleteHook from './hooks/deleteHook'
export interface AdapterInterface {
  upload(filename: string, file: UploadedFile): Promise<void>;
  delete(filename: string): Promise<void>;
}

export type S3PluginCollectionModifiers = {
  fields?: Field[],
  adminThumbnail?: string | GetAdminThumbnail | undefined
}

const cloudStorage = (
  adapter: AdapterInterface,
  uploadCollectionModifiers?: S3PluginCollectionModifiers
) => {
  return (incommingConfig: Config): Config => {
    if (!incommingConfig.collections) {
      return incommingConfig
    }

    const config: Config = {
      ...incommingConfig,
      collections: incommingConfig.collections.map(collection => {
        if (typeof collection.upload === 'object') {
          if (Array.isArray(uploadCollectionModifiers?.fields) && uploadCollectionModifiers?.fields.length) {
            collection.fields = [
              ...collection.fields,
              ...uploadCollectionModifiers.fields
            ]
          }

          const {
            beforeChange = [],
            afterDelete = [],
          } = collection.hooks || {}

          collection.hooks = {
            ...collection.hooks,
            beforeChange: [
              ...beforeChange,
              uploadHook(adapter),
            ],
            afterDelete: [
              ...afterDelete,
              deleteHook(adapter),
            ],
          }

          if (uploadCollectionModifiers?.adminThumbnail && typeof collection?.upload?.adminThumbnail === 'undefined') {
            collection.upload.adminThumbnail = uploadCollectionModifiers.adminThumbnail
          }
        }

        return collection
      }),
    }

    return config
  }
}

export default cloudStorage
