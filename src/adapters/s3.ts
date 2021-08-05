import * as AWS from '@aws-sdk/client-s3'
import { UploadedFile } from 'express-fileupload';
import { AdapterInterface, getEndpointUrl } from '../adapter';

export type FileOptions = {
  bucket: string;
  endpointUrl: string;
  acl?: 'private' | 'public-read';
}

export default class S3Adapter implements AdapterInterface {
  instance: AWS.S3
  options: FileOptions
  getEndpointUrlRef: getEndpointUrl

  constructor(s3Configuration: AWS.S3ClientConfig, fileOptions: FileOptions, getEndpoint: getEndpointUrl) {
    this.instance = new AWS.S3(s3Configuration)
    this.options = fileOptions
    this.getEndpointUrlRef = getEndpoint
  }

  getEndpointUrl(data: { [key: string]: unknown; }) {
    if (typeof data?.filename === 'string') {
      return `${this.options.endpointUrl}/${data.filename}`
    }

    return ''
  };

  async upload(filename: string, file: UploadedFile): Promise<void> {
    await this.instance.putObject({
      Bucket: this.options.bucket,
      Key: String(filename),
      Body: file.data,
      ACL: this.options.acl,
      ContentType: file.mimetype,
    })
  }

  async delete(filename: string): Promise<void> {
    await this.instance.deleteObject({
      Bucket: process.env.SPACES_NAME,
      Key: String(filename),
    })
  }
}