import { parseUUID } from './utils'

export interface Header {
  version: number
  uuid: string
  command: Command
  address: string
  port: number
}

export enum Command {
  TCP = 1,
  UDP = 2,
  MUX = 3,
}

export interface ReadHeaderResponse {
  header: Header
  rawData: ArrayBuffer
}

export function readHeader(buffer: ArrayBuffer): ReadHeaderResponse {
  const view = new DataView(buffer)
  const version = view.getUint8(0)
  const uuid = parseUUID(new Uint8Array(buffer.slice(1, 17)))
  const optLength = view.getUint8(17)
  const command = view.getUint8(18 + optLength)
  if (command !== Command.TCP && command !== Command.UDP && Command.MUX) {
    throw Error(`invalid command ${command}`)
  }

  const portIndex = 18 + optLength + 1
  const remotePort = view.getUint16(portIndex)
  const addressType = view.getUint8(portIndex + 2)

  let remoteAddress = '',
    addressLength: number,
    addressValueIndex: number
  switch (addressType) {
    case 1:
      addressLength = 4
      addressValueIndex = portIndex + 3
      remoteAddress = new Uint8Array(
        buffer.slice(addressValueIndex, addressValueIndex + addressLength),
      ).join('.')
      break
    case 2:
      addressLength = view.getUint8(portIndex + 3)
      addressValueIndex = portIndex + 4
      remoteAddress = new TextDecoder().decode(
        buffer.slice(addressValueIndex, addressValueIndex + addressLength),
      )
      break
    case 3:
      addressLength = 16
      addressValueIndex = portIndex + 3
      remoteAddress = Array.from({ length: 8 }, (_, i) =>
        view.getUint16(addressValueIndex + i * 2).toString(16),
      ).join(':')
      break
    default:
      throw Error(`invalid address type ${addressType}`)
  }

  return {
    header: {
      version,
      uuid,
      command,
      address: remoteAddress,
      port: remotePort,
    },
    rawData: buffer.slice(addressValueIndex + addressLength),
  }
}

export async function makeResponse(
  version: number,
  rawData: ArrayBuffer,
): Promise<ArrayBuffer> {
  const header = new Uint8Array([version, 0]).buffer
  return await new Blob([header, rawData]).arrayBuffer()
}
