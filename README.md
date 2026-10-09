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

## GitHub + Firebase

- Branch principal: `main`
- Branch de desarrollo: `development`
- El proyecto ya está configurado para desplegar desde GitHub a Firebase Hosting.
- Se agregaron workflows en `.github/workflows/` para despliegue automático al hacer push a `main` y previews en pull requests.

### Secret necesario en GitHub

En el repositorio de GitHub, agrega este secret:

```bash
FIREBASE_SERVICE_ACCOUNT_RIFAS_PRO_800BB
```

Debe contener el JSON del service account de Firebase del proyecto `rifas-pro-800bb`.

## Notas

- Si Firebase no carga, revisa la consola del navegador.
- Usa `Live Server` o un servidor local para evitar errores de módulo.
