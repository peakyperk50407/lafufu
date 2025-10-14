param(
  [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
Write-Host "Serving $root at http://localhost:$Port/"

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()

function Get-ContentType($path) {
  switch -Regex ($path) {
    '\\.html$' { return 'text/html; charset=utf-8' }
    '\\.css$'  { return 'text/css; charset=utf-8' }
    '\\.js$'   { return 'application/javascript; charset=utf-8' }
    '\\.png$'  { return 'image/png' }
    '\\.(jpg|jpeg)$' { return 'image/jpeg' }
    '\\.webp$' { return 'image/webp' }
    '\\.svg$'  { return 'image/svg+xml' }
    default     { return 'application/octet-stream' }
  }
}

try {
  while ($true) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $relPath = [System.Web.HttpUtility]::UrlDecode($request.Url.LocalPath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = 'index.html' }
    $path = Join-Path $root $relPath

    if (Test-Path -LiteralPath $path) {
      try {
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $response.Headers.Add('Cache-Control','no-cache')
        $response.ContentType = Get-ContentType $path
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      } catch {
        $response.StatusCode = 500
        $err = [System.Text.Encoding]::UTF8.GetBytes("Server error: $($_.Exception.Message)")
        $response.ContentLength64 = $err.Length
        $response.OutputStream.Write($err, 0, $err.Length)
      }
    } else {
      $response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
      $response.ContentLength64 = $msg.Length
      $response.OutputStream.Write($msg, 0, $msg.Length)
    }

    $response.OutputStream.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
}