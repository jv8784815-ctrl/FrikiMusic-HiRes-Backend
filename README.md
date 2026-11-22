# FrikiMusic Hi-Res Backend

Backend HTTP adaptado del addon BitChord Hi-Res para conectarse con el gestor de addons que **ya existe dentro de FrikiMusic**.

## Qué hace

- Expone un manifest compatible con el sistema de addons de FrikiMusic.
- Busca coincidencias por título/artista en varias fuentes.
- Resuelve la URL del stream y devuelve el formato y los metadatos de audio disponibles.
- Mantiene el failover entre fuentes cuando una no puede resolver una pista.
- El reproductor de FrikiMusic conserva YouTube como respaldo si no encuentra una coincidencia válida.

Fuentes incluidas por el proyecto original: Monochrome, Qobuz, Arcod, Netease y catálogo Deezer. La disponibilidad depende de cada upstream y puede cambiar. No todas las pistas son Hi-Res: la calidad real depende del stream entregado y de lo que informe la fuente.

## Endpoints

- `GET /` o `GET /manifest.json`: manifest del addon.
- `GET /health`: estado de las fuentes.
- `GET /search?q=ARTISTA%20TEMA&quality=lossless`: búsqueda.
- `GET /stream/{id}?quality=lossless`: resolución del stream.

## Ejecutar en local

Requiere Node.js 20 o superior.

```bash
npm install
npm start
```

Abre `http://localhost:8787/manifest.json`. Para probar búsqueda:

```text
http://localhost:8787/search?q=Daft%20Punk%20Get%20Lucky&quality=lossless
```

## Publicarlo en GitHub y Render

1. Descomprime este proyecto.
2. Crea un repositorio nuevo en GitHub, por ejemplo `FrikiMusic-HiRes-Backend`.
3. Copia el contenido de esta carpeta a la raíz del repositorio (no subas una carpeta contenedora adicional).
4. Desde PowerShell, dentro de esa carpeta:

```powershell
git init
git add .
git commit -m "Initial FrikiMusic Hi-Res backend"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/FrikiMusic-HiRes-Backend.git
git push -u origin main
```

5. En Render, crea **New → Web Service**, conecta ese repositorio y configura:
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node: 20 o superior
6. Espera a que termine el deploy. Render te asignará una URL parecida a `https://frikimusic-hires-backend.onrender.com`.
7. Comprueba que `https://TU-SERVICIO.onrender.com/manifest.json` devuelve un JSON con `"id": "dev.frikimusic.hires"` y `"bitchordAuth": false`.

Render documenta este flujo en [Deploy a Node.js app](https://render.com/docs/deploy-node-express-app). En el plan gratuito los servicios web pueden apagarse tras 15 minutos sin tráfico y tardan un poco en despertar.

## Conectarlo en FrikiMusic

En la app:

1. Abre **Ajustes → Addons de audio**.
2. En URL del addon pega solo la raíz del servicio, por ejemplo:

```text
https://TU-SERVICIO.onrender.com
```

También acepta la URL terminada en `/manifest.json`.
3. Pulsa **Agregar addon**.
4. Actívalo y elige la calidad deseada.

La integración Android ya estaba presente en el código fuente que compartiste: `BitChordAddonRepository` lee el manifest, busca por título/artista/duración y resuelve `/stream/{id}`; `MusicRepository` intenta el addon antes de recurrir al stream habitual. Por eso no hace falta reescribir el reproductor para conectar este backend.

## Importante

- Esta adaptación crea un backend independiente para FrikiMusic; no reutiliza ni falsifica las credenciales criptográficas de BitChord.
- El backend queda accesible públicamente en internet. No coloques claves privadas ni contraseñas aquí.
- Usa únicamente contenido al que tengas derecho de acceso y respeta las condiciones de cada proveedor y servicio upstream.
- Las URLs de audio pueden expirar o dejar de funcionar; el backend las resuelve de nuevo y la app mantiene su fallback.
- Un servicio gratuito puede dormir por inactividad; para uso continuo considera un plan siempre activo.
