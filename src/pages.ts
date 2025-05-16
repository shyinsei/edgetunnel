export function index(): Response {
  const indexPage = `<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>`

  return new Response(indexPage, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  })
}

export function notFound(): Response {
  const text = `<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.28.0</center>
</body>
</html>`

  return new Response(text, {
    status: 404,
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  })
}
