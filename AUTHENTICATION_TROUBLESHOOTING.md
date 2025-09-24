# Solución de Problemas de Autenticación WebSocket

## Problema: "WebSocket authentication failed"

Si estás viendo este error en la consola del navegador, significa que el WebSocket se conecta correctamente pero la autenticación falla. Aquí están las posibles causas y soluciones:

### 1. **Verificar el Token de Acceso**

**Problema más común**: El token no está configurado o es inválido.

**Solución**:

1. Ve a tu perfil de Home Assistant (haz clic en tu avatar en la esquina inferior izquierda)
2. Desplázate hacia abajo hasta "Long-lived access tokens"
3. Haz clic en "Create token"
4. Dale un nombre como "Dashboard WebSocket"
5. Copia el token completo
6. Agrega el token a tu archivo `.env`:

```env
REACT_APP_HA_TOKEN=tu_token_completo_aqui
```

### 2. **Verificar la Configuración del Archivo .env**

Asegúrate de que tu archivo `.env` esté en la raíz del proyecto y tenga el formato correcto:

```env
# Home Assistant Configuration
REACT_APP_HA_URL=https://amador.freeddns.org
REACT_APP_HA_TOKEN=tu_token_aqui
REACT_APP_HA_WS_URL=wss://amador.freeddns.org
```

**Importante**:

- No uses comillas alrededor de los valores
- No dejes espacios alrededor del signo `=`
- Reinicia el servidor de desarrollo después de cambiar el `.env`

### 3. **Verificar Permisos del Token**

El token debe tener los permisos necesarios:

1. Ve a tu perfil de Home Assistant
2. En "Long-lived access tokens", haz clic en el token existente
3. Verifica que tenga permisos para:
   - Leer estados
   - Llamar servicios
   - Acceso a la API

### 4. **Verificar la URL de Home Assistant**

Asegúrate de que la URL sea correcta y accesible:

1. Abre `https://amador.freeddns.org` en tu navegador
2. Verifica que puedas acceder a Home Assistant
3. Si usas HTTPS, asegúrate de que `REACT_APP_HA_WS_URL` use `wss://`

### 5. **Usar el Componente de Debug**

En el dashboard, usa el botón "Debug Info" para verificar:

1. **Has Token**: Debe ser `true`
2. **Token Length**: Debe ser mayor a 0
3. **WebSocket URL**: Debe ser `wss://amador.freeddns.org/api/websocket`

### 6. **Verificar en la Consola del Navegador**

Después de hacer clic en "Debug Info", revisa la consola para ver:

```javascript
WebSocket Debug Info: {
  config: {
    url: "https://amador.freeddns.org",
    wsUrl: "wss://amador.freeddns.org",
    hasToken: true,
    tokenLength: 123, // Debe ser un número > 0
    tokenPreview: "eyJ0eXAiOi..." // Debe empezar con eyJ
  },
  // ...
}
```

### 7. **Problemas Comunes**

#### Error: "Auth message incorrectly formatted: extra keys not allowed @ data['id']"

**Causa**: El mensaje de autenticación WebSocket incluye un campo `id` que no está permitido.

**Solución**: Este error ha sido corregido en la versión actual del código. El mensaje de autenticación ahora se envía directamente sin un ID.

#### Token Expirado

- Los tokens de larga duración pueden expirar
- Crea un nuevo token si el actual no funciona

#### Token Mal Copiado

- Asegúrate de copiar el token completo
- No incluyas espacios al principio o al final

#### Configuración de CORS

- Si usas un dominio personalizado, verifica la configuración de CORS en Home Assistant
- Agrega tu dominio a `cors_allowed_origins` en `configuration.yaml`

#### Problemas de Red

- Verifica que puedas acceder a Home Assistant desde tu red
- Prueba la conexión con curl:
  ```bash
  curl -H "Authorization: Bearer TU_TOKEN" https://amador.freeddns.org/api/
  ```

### 8. **Pasos de Diagnóstico**

1. **Verificar configuración básica**:

   ```bash
   # En la consola del navegador
   console.log(process.env.REACT_APP_HA_URL);
   console.log(process.env.REACT_APP_HA_TOKEN);
   ```

2. **Probar la API REST**:

   ```bash
   curl -H "Authorization: Bearer TU_TOKEN" https://amador.freeddns.org/api/
   ```

3. **Verificar el WebSocket manualmente**:
   ```javascript
   // En la consola del navegador
   const ws = new WebSocket("wss://amador.freeddns.org/api/websocket");
   ws.onopen = () => {
     ws.send(
       JSON.stringify({
         type: "auth",
         access_token: "TU_TOKEN",
       })
     );
   };
   ```

### 9. **Reiniciar el Servidor**

Después de hacer cambios en el `.env`:

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar
npm start
```

### 10. **Contacto de Soporte**

Si nada de lo anterior funciona:

1. Verifica los logs de Home Assistant para errores de autenticación
2. Asegúrate de que Home Assistant esté actualizado
3. Verifica que no haya reglas de firewall bloqueando las conexiones WebSocket

---

**Nota**: El error "WebSocket authentication failed" indica que la conexión WebSocket funciona correctamente, pero el token de autenticación no es válido o no tiene los permisos necesarios.
