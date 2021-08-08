import uploadHook from './uploadHook'
import { AdapterInterface, UploadedFile } from '../adapter'
import { mock as mockInterface } from 'jest-mock-extended'

describe('uploadHook', () => {
  let adapter: AdapterInterface

  beforeEach(() => {
    adapter = mockInterface<AdapterInterface>()
  })

  const testFile = mockInterface<UploadedFile>({
    name: 'test.image'
  })

  it('can make a hook that calls adapters upload method', () => {
    const initializedHook = uploadHook(adapter)
    const req = {
      files: {
        file: testFile
      }
    }

    initializedHook({
      // @ts-ignore
      req
    })

    expect(adapter.upload).toBeCalledWith(testFile)
    expect(adapter.upload).toBeCalledTimes(1)
  })

  it('can fetch first file from array of files', () => {
    const initializedHook = uploadHook(adapter)

    const testFile2 = mockInterface<UploadedFile>({
      name: 'test.image'
    })

    const req = {
      files: {
        file: [
          testFile2,
          testFile,
        ]
      }
    }

    initializedHook({
      // @ts-ignore
      req
    })

    expect(adapter.upload).toBeCalledWith(testFile2)
    expect(adapter.upload).toBeCalledTimes(1)
  })

  it('can process req.payloadUploadSizes', () => {
    const initializedHook = uploadHook(adapter)
    const req = {
      files: {
        file: testFile
      },
      payloadUploadSizes: {
        mobile: 'fake buffer'
      }
    }

    const data = {
      sizes: {
        mobile: {
          filename: 'resize.image',
          mimeType: 'image'
        }
      }
    }

    // @ts-ignore
    initializedHook({ data, req })

    expect(adapter.upload).toBeCalledWith(testFile)
    expect(adapter.upload).toBeCalledWith({
      name: 'resize.image',
      mimetype: 'image',
      data: 'fake buffer'
    })
    expect(adapter.upload).toBeCalledTimes(2)
  })

  it('does nothing if no uploaded file', () => {
    const initializedHook = uploadHook(adapter)
    const req = {
    }

    // @ts-ignore
    initializedHook({ req })

    expect(adapter.upload).not.toBeCalled()
  })
})