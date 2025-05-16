import { Env } from '.'
import { processDNS, processTCP } from './outbound'
import { base64ToArrayBuffer, contains } from './utils'
import { Command, readHeader } from './vless'

export async function handleWebSocket(
  request: Request,
  env: Env,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctx: ExecutionContext,
): Promise<Response> {
  const [client, server] = Object.values(new WebSocketPair())
  server.accept()

  getHeader(server, request.headers.get('sec-websocket-protocol')).then(
    async (headerData) => {
      const { header, rawData } = readHeader(headerData)
      const uuids = env.UUID.split(',').filter((v) => v !== '')
      if (!contains(uuids, header.uuid)) {
        throw Error(`invalid user ${header.uuid}`)
      }

      switch (header.command) {
        case Command.TCP: {
          const proxyIP = env.PROXY_IP.split(',').filter((v) => v !== '')
          return await processTCP(server, header, rawData, proxyIP)
        }
        case Command.UDP:
          if (header.port !== 53) {
            throw Error('unsupported UDP')
          }
          return await processDNS(header.version, server, rawData)
        default:
          throw Error('unsupported transport')
      }
    },
  )

  return new Response(null, {
    status: 101,
    webSocket: client,
  })
}

function getHeader(socket: WebSocket, ed: string | null): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    if (ed) {
      try {
        const buf = base64ToArrayBuffer(ed)
        return resolve(buf)
      } catch (e) {
        return reject(e)
      }
    }

    const errorHandler = (e: ErrorEvent) => {
      safeClose(socket)
      reject(e.error)
    }
    const closeHandler = () => reject('WebSocket was closed')
    const messageHandler = (e: MessageEvent) => {
      if (typeof e.data === 'string') {
        safeClose(socket)
        return reject('invalid data')
      }

      socket.removeEventListener('error', errorHandler)
      socket.removeEventListener('close', closeHandler)
      socket.removeEventListener('message', messageHandler)
      resolve(e.data)
    }

    socket.addEventListener('error', errorHandler)
    socket.addEventListener('close', closeHandler)
    socket.addEventListener('message', messageHandler)
  })
}

export function safeClose(socket: WebSocket, code?: number, reason?: string) {
  if (
    socket.readyState === WebSocket.READY_STATE_OPEN ||
    socket.readyState === WebSocket.READY_STATE_CLOSING
  ) {
    socket.close(code, reason)
  }
}
