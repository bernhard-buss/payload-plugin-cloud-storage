import * as AWS from '@aws-sdk/client-s3'
import { UploadedFile } from 'express-fileupload';
import { AdapterInterface } from '../plugin';

export type FileOptions = {
  bucket: string;
  acl?: 'private' | 'public-read';
}

export class S3Adapter implements AdapterInterface {
  instance: AWS.S3
  options: FileOptions

  constructor(s3Configuration: AWS.S3ClientConfig, fileOptions: FileOptions, getU) {
    this.instance = new AWS.S3(s3Configuration)
    this.options = fileOptions
  }

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