# Home Assistant Dashboard

Un dashboard moderno para Home Assistant con diseño Liquid Glass inspirado en iOS, construido con React y TypeScript.

## Características

- 🎨 **Diseño Liquid Glass**: Inspirado en la documentación de Apple
- 🏠 **Áreas Organizadas**: Cocina y Comedor con sus respectivas entidades
- 🌡️ **Sensor de Clima**: Componente reutilizable para temperatura y humedad
- 🧹 **Control de Aspiradora**: Funcionalidad completa con controles avanzados
- 📺 **Reproductor Multimedia**: Control completo del televisor
- 💡 **Luces y Switches**: Control intuitivo de iluminación
- 📱 **Responsive**: Optimizado para todos los dispositivos
- ⚡ **Tiempo Real**: Actualizaciones automáticas cada 30 segundos

## Entidades Soportadas

### Cocina

- `light.cocina_tira_led` - Tira LED
- `sensor.cocina_termometro_temperature` - Temperatura
- `sensor.cocina_termometro_humidity` - Humedad

### Comedor

- `light.globo_comedor` - Globo del comedor
- `switch.velador` - Velador
- `media_player.televisor_2` - Televisor
- `vacuum.enzo` - Aspiradora

## Configuración

1. **Clonar el repositorio**:

   ```bash
   git clone <tu-repositorio>
   cd home-assistant-dashboard
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Copia el archivo `env.example` y renómbralo a `.env`:

   ```bash
   cp env.example .env
   ```

   Edita el archivo `.env` con tus datos de Home Assistant:

   ```env
   REACT_APP_HA_URL=http://192.168.1.100:8123
   REACT_APP_HA_TOKEN=tu_long_lived_access_token_aqui
   REACT_APP_HA_WS_URL=ws://192.168.1.100:8123/api/websocket
   ```

4. **Obtener un token de acceso**:

   - Ve a tu instancia de Home Assistant
   - Perfil de usuario → Tokens de acceso
   - Crear token → Copia el token generado

5. **Ejecutar la aplicación**:
   ```bash
   npm start
   ```

## Funcionalidades

### Sensor de Temperatura y Humedad

- Muestra temperatura y humedad en una sola card
- Indicador de nivel de confort
- Colores dinámicos según los valores
- Componente reutilizable para otras áreas

### Control de Aspiradora

- Iniciar/pausar limpieza
- Enviar a la base
- Localizar aspiradora
- Control de velocidad del ventilador
- Indicador de batería
- Estado en tiempo real

### Reproductor Multimedia

- Control de encendido/apagado
- Reproducir/pausar
- Control de volumen
- Información del contenido actual
- Barra de progreso
- Navegación de pistas

### Luces y Switches

- Control de encendido/apagado
- Indicador de brillo para luces
- Estados visuales claros
- Animaciones suaves

## Tecnologías Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos
- **Axios** - Cliente HTTP
- **CSS3** - Estilos con efectos glassmorphism

## Estructura del Proyecto

```
src/
├── components/
│   ├── cards/           # Cards específicas para cada tipo de entidad
│   ├── ui/              # Componentes de interfaz reutilizables
│   ├── AreaSection.tsx  # Sección de área
│   └── Dashboard.tsx    # Componente principal
├── services/
│   └── homeAssistantApi.ts  # Cliente API de Home Assistant
├── types/
│   └── homeAssistant.ts     # Tipos TypeScript
├── styles/
│   └── globals.css          # Estilos globales
└── App.tsx
```

## Personalización

### Agregar Nuevas Áreas

Edita el array `areas` en `src/components/Dashboard.tsx`:

```typescript
const areas: Area[] = [
  {
    id: "nueva_area",
    name: "Nueva Área",
    entities: {
      lights: ["light.nueva_luz"],
      switches: ["switch.nuevo_switch"],
      sensors: ["sensor.nuevo_sensor"],
      mediaPlayers: ["media_player.nuevo_media"],
      vacuums: ["vacuum.nueva_aspiradora"],
    },
  },
];
```

### Modificar Entidades

Actualiza las entidades en el array `areas` con los IDs correctos de tu Home Assistant.

## Solución de Problemas

### Error de Conexión

- Verifica que Home Assistant esté ejecutándose
- Confirma que la URL y el token sean correctos
- Asegúrate de que el token tenga permisos suficientes

### Entidades No Encontradas

- Verifica que los IDs de las entidades sean correctos
- Confirma que las entidades existan en tu Home Assistant
- Revisa los logs de la consola del navegador

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
