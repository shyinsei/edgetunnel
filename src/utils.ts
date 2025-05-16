export function base64ToArrayBuffer(str: string): ArrayBuffer {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  const binaryStr = atob(str)
  const buffer = new ArrayBuffer(binaryStr.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < binaryStr.length; i++) {
    view[i] = binaryStr.charCodeAt(i)
  }

  return buffer
}

export function parseUUID(arr: Uint8Array): string {
  const byteToHex = Array.from({ length: 256 }, (_, i) =>
    (i + 0x100).toString(16).slice(1),
  )

  return [
    byteToHex[arr[0]],
    byteToHex[arr[1]],
    byteToHex[arr[2]],
    byteToHex[arr[3]],
    '-',
    byteToHex[arr[4]],
    byteToHex[arr[5]],
    '-',
    byteToHex[arr[6]],
    byteToHex[arr[7]],
    '-',
    byteToHex[arr[8]],
    byteToHex[arr[9]],
    '-',
    byteToHex[arr[10]],
    byteToHex[arr[11]],
    byteToHex[arr[12]],
    byteToHex[arr[13]],
    byteToHex[arr[14]],
    byteToHex[arr[15]],
  ]
    .join('')
    .toLowerCase()
}

export function contains<T>(elems: T[], value: T): boolean {
  for (const elem of elems) {
    if (elem === value) {
      return true
    }
  }
  return false
}
