import { FileChecksum } from "./file_checksum"
import { BlobRecord } from "./blob_record"
import { BlobUpload } from "./blob_upload"

let id = 0

export class DirectUpload {
  constructor(file, url, region, bucket, folder, delegate) {
    this.id = ++id
    this.file = file
    this.url = url
    this.region = region
    this.bucket = bucket
    this.folder = folder
    this.delegate = delegate
  }

  create(callback) {
    FileChecksum.create(this.file, (error, checksum) => {
      if (error) {
        callback(error)
        return
      }

      const blob = new BlobRecord(this.file, checksum, this.url, this.region, this.bucket, this.folder)
      notify(this.delegate, "directUploadWillCreateBlobWithXHR", blob.xhr)

      blob.create(error => {
        if (error) {
          callback(error)
        } else {
          const upload = new BlobUpload(blob)
          notify(this.delegate, "directUploadWillStoreFileWithXHR", upload.xhr)
          upload.create(error => {
            if (error) {
              callback(error)
            } else {
              callback(null, blob.toJSON())
            }
          })
        }
      })
    })
  }
}

function notify(object, methodName, ...messages) {
  if (object && typeof object[methodName] == "function") {
    return object[methodName](...messages)
  }
}
