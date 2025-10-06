# 🚀 Guía de Despliegue

## Para Netlify
El archivo `public/_redirects` ya está configurado para manejar las rutas del cliente.

## Para Vercel
Crear `vercel.json` en la raíz del proyecto:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Para GitHub Pages
Crear `public/404.html` que redirija a `index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <script>
    window.location.href = '/';
  </script>
</head>
<body></body>
</html>
```

## Para Apache (.htaccess)
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]
```

## Logs de Desarrollo
Para habilitar logs de debugging en desarrollo, descomenta las líneas `console.log` en `src/services/bankService.ts`.