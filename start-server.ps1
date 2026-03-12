# Simple HTTP Server for Portfolio
$port = 8080
$root = $PSScriptRoot

Write-Host "Starting server on http://localhost:$port" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $localPath = $request.Url.LocalPath
    if ($localPath -eq "/") {
        $localPath = "/index.html"
    }
    
    $filePath = Join-Path $root $localPath.TrimStart('/')
    
    if (Test-Path $filePath -PathType Leaf) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $extension = [System.IO.Path]::GetExtension($filePath)
        
        # Set content type
        $contentType = "text/html"
        switch ($extension) {
            ".css" { $contentType = "text/css" }
            ".js" { $contentType = "application/javascript" }
            ".jpg" { $contentType = "image/jpeg" }
            ".jpeg" { $contentType = "image/jpeg" }
            ".png" { $contentType = "image/png" }
            ".pdf" { $contentType = "application/pdf" }
        }
        
        $response.ContentType = $contentType
        $response.ContentLength64 = $content.Length
        $response.StatusCode = 200
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
        $response.ContentType = "text/plain"
        $response.StatusCode = 404
        $response.ContentLength64 = $notFound.Length
        $response.OutputStream.Write($notFound, 0, $notFound.Length)
    }
    
    $response.Close()
}





