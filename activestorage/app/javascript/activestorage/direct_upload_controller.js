import { DirectUpload } from "./direct_upload"
import { dispatchEvent } from "./helpers"

export class DirectUploadController {
  constructor(input, file, hiddenInput) {
    this.input = input
    this.region = input.getAttribute("data-region")
    this.bucket = input.getAttribute("data-bucket")
    this.folder = input.getAttribute("data-folder")
    this.file = file
    this.hiddenInput = hiddenInput
    this.directUpload = new DirectUpload(this.file, this.url, this.region, this.bucket, this.folder, this)
    this.dispatch("initialize")
  }

  start(callback) {
    this.dispatch("start")
    this.directUpload.create((error, attributes) => {
      if (error) {
        this.dispatchError(error)
      } else {
        this.hiddenInput.name = this.input.name
        this.hiddenInput.value = attributes.signed_id
      }
      this.dispatch("end")
      callback(error)
    })
  }

  uploadRequestDidProgress(event) {
    const progress = event.loaded / event.total * 100
    if (progress) {
      this.dispatch("progress", { progress })
    }
  }

  get url() {
    return this.input.getAttribute("data-direct-upload-url")
  }

  dispatch(name, detail = {}) {
    detail.file = this.file
    detail.id = this.directUpload.id
    return dispatchEvent(this.input, `direct-upload:${name}`, { detail })
  }

  dispatchError(error) {
    const event = this.dispatch("error", { error })
    if (!event.defaultPrevented) {
      alert(error)
    }
  }

  // DirectUpload delegate

  directUploadWillCreateBlobWithXHR(xhr) {
    this.dispatch("before-blob-request", { xhr })
  }

  directUploadWillStoreFileWithXHR(xhr) {
    this.dispatch("before-storage-request", { xhr })
    xhr.upload.addEventListener("progress", event => this.uploadRequestDidProgress(event))
  }
}
