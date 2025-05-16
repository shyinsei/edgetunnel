import { Router } from 'itty-router'
import { index, notFound } from './pages'
import { handleWebSocket } from './websocket'
import { contains } from './utils'
import { base64, normal } from './subscription'

const router = Router()

export interface Env {
  UUID: string
  PROXY_IP: string
}

router
  .get('/', () => index())
  .get('/sub/:uuid', (request, env: Env) => {
    const uuid = request.params['uuid']
    const correctUUID = env.UUID.split(',').filter((v) => v !== '')
    if (!contains(correctUUID, uuid)) {
      return notFound()
    }

    const url = new URL(request.url)

    if (url.searchParams.get('base64')) {
      return new Response(base64(url.hostname, uuid), {
        status: 200,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
        },
      })
    } else {
      return new Response(normal(url.hostname, uuid), {
        status: 200,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
        },
      })
    }
  })
  .get('*', async (request: Request, env: Env, ctx: ExecutionContext) => {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return notFound()
    }

    return await handleWebSocket(request, env, ctx)
  })

export default router
