# Sistema de Gestión de Rifas

Proyecto web simple para gestionar participantes y pagos de rifas usando Firebase Firestore.

## Archivos principales

- `index.html` - Estructura de la interfaz.
- `assets/css/style.css` - Estilos visuales.
- `assets/js/script.js` - Lógica de aplicación y conexión con Firebase.

## Características

- Inicio de sesión básico con contraseña `admin`
- Registro de participantes con número de rifa
- Visualización de pagos pendientes y finalizados
- Actualización de cuotas y eliminación de participantes
- Exportación de participantes finalizados a CSV

## Requisitos

- Navegador moderno con soporte para módulos ES
- Servidor local para evitar restricciones de `file://`

## Ejecución local

Desde la carpeta del proyecto, usa uno de estos comandos:

```bash
# Python 3
python3 -m http.server 8000

# Node.js si tienes instalado http-server
npx http-server .
```

Luego abre en el navegador:

```text
http://localhost:8000
```

## Firebase

Este proyecto usa Firebase Firestore.

### Configuración

La configuración de Firebase está en `script.js`:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `measurementId`

### Reglas temporales de Firestore

Si usaste reglas con fecha de expiración, como:

```js
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 6, 5);
    }
  }
}
```

estas reglas ya no funcionan porque la fecha ya pasó. Eso bloquea el acceso desde la app.

Para desarrollo rápido, puedes usar el archivo local `firestore.rules` incluido en este proyecto:

```js
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> Importante: esta regla es solo para pruebas locales. En producción debes usar reglas con seguridad real.

## GitHub

- Branch principal: `main`
- Branch de desarrollo: `development`

## Notas

- Si Firebase no carga, revisa la consola del navegador.
- Usa `Live Server` o un servidor local para evitar errores de módulo.
