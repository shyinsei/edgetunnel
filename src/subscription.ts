function generateServerList(hostname: string): Set<string> {
  const hosts = [
    hostname,
    'icook.hk',
    'japan.com',
    'malaysia.com',
    'russia.com',
    'singapore.com',
    'www.visa.com',
    'www.csgo.com',
    'www.shopify.com',
    'www.whatismyip.com',
    'www.ipget.net',
    'freeyx.cloudflare88.eu.org',
    'cloudflare.182682.xyz',
    'cfip.cfcdn.vip',
    'cf.0sm.com',
    'cloudflare-ip.mofashi.ltd',
    'cf.090227.xyz',
    'cf.zhetengsha.eu.org',
    'cloudflare.9jy.cc',
    'cf.zerone-cdn.pp.ua',
    'cfip.1323123.xyz',
    'cdn.tzpro.xyz',
    'cf.877771.xyz',
    'cnamefuckxxs.yuchen.icu',
    'cfip.xxxxxxxx.tk',
  ]

  return new Set(hosts)
}

const ports = [443, 8443, 2053, 2096, 2087, 2083]

export function normal(hostname: string, uuid: string): string {
  const result: string[] = []

  const hostList = generateServerList(hostname)
  hostList.forEach((host) => {
    ports.forEach((port) => {
      const url = new URL(
        `vless://${uuid}@${host}:${port}?encryption=none&security=tls&sni=${hostname}&fp=chrome&type=ws&host=${hostname}#${host}-${port}-${hostname}`,
      )
      url.searchParams.set('path', '/ws?ed=4096')

      result.push(url.toString())
    })
  })

  return result.join('\n')
}

export function base64(hostname: string, uuid: string): string {
  return btoa(normal(hostname, uuid))
}
