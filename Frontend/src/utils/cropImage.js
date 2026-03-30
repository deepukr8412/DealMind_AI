export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid CORS issues
    image.src = url
  })

export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // Set canvas size to match the bounding box
  canvas.width = image.width
  canvas.height = image.height

  // Draw image
  ctx.drawImage(image, 0, 0)

  // Extract the cropped image data
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  // Create new canvas to hold the cropped image
  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')

  if (!croppedCtx) {
    return null
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  // Draw the cropped image data to the new canvas
  croppedCtx.putImageData(data, 0, 0)

  // As Base64 string
  // return croppedCanvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve) => {
    croppedCanvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/jpeg')
  })
}
