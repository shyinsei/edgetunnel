import { connect } from 'cloudflare:sockets'
import { Header, makeResponse } from './vless'
import { safeClose } from './websocket'

async function retryTCP(
  version: number,
  ws: WebSocket,
  proxyIP: string[],
  rawData: ArrayBuffer,
): Promise<Socket> {
  let counter = 0
  for (const remoteAddr of proxyIP) {
    counter++
    try {
      const socket = connectTCP(version, ws, remoteAddr, rawData)
      return socket
    } catch (err) {
      if (counter === proxyIP.length) {
        throw err
      }
      continue
    }
  }

  throw Error('failed to connect')
}

async function connectTCP(
  version: number,
  ws: WebSocket,
  address: SocketAddress | string,
  rawData: ArrayBuffer,
): Promise<Socket> {
  let messageHandler = null
  let errorHandler = null
  let closeHandler = null

  try {
    const socket = connect(address)
    const writer = socket.writable.getWriter()
    await writer.write(rawData)
    messageHandler = async (e: MessageEvent) => {
      await writer.write(e.data)
    }
    errorHandler = async () => {
      safeClose(ws)
      await socket.close()
    }
    closeHandler = async () => {
      await socket.close()
    }

    ws.addEventListener('message', messageHandler)
    ws.addEventListener('close', closeHandler)
    ws.addEventListener('error', errorHandler)

    const reader = socket.readable.getReader()
    const { value, done } = await reader.read()
    if (done || !value) {
      throw Error('connection closed')
    }
    const resp = await makeResponse(version, value)
    ws.send(resp)
    reader.releaseLock()

    return socket
  } catch (err) {
    if (messageHandler) {
      ws.removeEventListener('message', messageHandler)
    }
    if (errorHandler) {
      ws.removeEventListener('error', errorHandler)
    }
    if (closeHandler) {
      ws.removeEventListener('close', closeHandler)
    }
    throw err
  }
}

export async function processTCP(
  ws: WebSocket,
  header: Header,
  rawData: ArrayBuffer,
  proxyIP: string[],
) {
  let socket: Socket
  try {
    socket = await connectTCP(
      header.version,
      ws,
      { hostname: header.address, port: header.port },
      rawData,
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    socket = await retryTCP(header.version, ws, proxyIP, rawData)
  }

  socket.readable.pipeTo(
    new WritableStream({
      write(chunk) {
        ws.send(chunk)
      },
      abort(reason) {
        safeClose(ws, 0, reason)
      },
      close() {
        safeClose(ws)
      },
    }),
  )
}

async function sendDNSRequest(data: ArrayBuffer): Promise<ArrayBuffer> {
  return await fetch('https://cloudflare-dns.com/dns-query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/dns-message',
      Accept: 'application/dns-message',
    },
    body: data.slice(2),
  }).then(async (resp) => {
    const ab = await resp.arrayBuffer()
    const newBuffer = new ArrayBuffer(ab.byteLength + 2)
    const dataview = new DataView(newBuffer)
    dataview.setUint16(0, ab.byteLength)
    const ua = new Uint8Array(newBuffer)
    ua.set(new Uint8Array(ab), 2)
    return newBuffer
  })
}

export async function processDNS(
  version: number,
  ws: WebSocket,
  rawData: ArrayBuffer,
) {
  const resp = await sendDNSRequest(rawData)
  ws.send(await makeResponse(version, resp))

  ws.addEventListener('message', async (e) => {
    if (typeof e.data === 'string') {
      return
    }
    ws.send(await sendDNSRequest(e.data.slice(2)))
  })
  ws.addEventListener('error', (e) => {
    safeClose(ws, 0, e.error)
    console.log(e.error)
  })
}
