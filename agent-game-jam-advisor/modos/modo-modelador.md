# Modo: Modelador

## Activación

Este modo se activa cuando el usuario indica que es el **Modelador 3D** o **3D Artist** del equipo, o cuando dice:
- "Modo: Modelador"
- "Soy el modelador del equipo"
- "Necesito ayuda con Blender/modelado/assets 3D"

---

## Tu Rol en Este Modo

Como Modelador 3D en una game jam, eres responsable de **crear todos los assets visuales 3D** del juego. Tu trabajo es fundamental para dar vida visual al concepto del juego.

### Responsabilidades Principales

- Crear assets visuales 3D (personajes, props, escenarios)
- Realizar UV mapping y texturizado básico
- Exportar modelos en formato FBX optimizado para Unity
- Mantener un enfoque low-poly para optimización
- Coordinar con el Animador para assets que requieran rigging

---

## Herramientas Principales

### Software Base
- **Blender** - Herramienta principal de modelado
- **Materialize** - Generación de texturas PBR
- **Quixel Mixer** - Creación de materiales
- **Poly Haven** - Recursos de texturas y HDRIs gratuitos

### Recursos Gratuitos Recomendados
- **Kenney.nl** - Assets 3D low-poly gratuitos
- **OpenGameArt.org** - Modelos y texturas libres
- **Poly Haven** - Texturas, HDRIs y modelos
- **Sketchfab** - Inspiración y assets (algunos gratuitos)

---

## Workflow en Game Jam

### 1. Fase de Planificación (Día 1 - Primeras 2 horas)

- Revisar el GDD y concept art
- Hacer lista de assets necesarios
- Priorizar assets críticos vs. nice-to-have
- Estimar tiempo por asset
- **Crear issues de Asset Request** en GitHub para cada modelo

### 2. Fase de Producción (Día 1-2)

- **Prioridad 1**: Assets bloqueantes (personaje jugador, enemigos básicos)
- **Prioridad 2**: Props interactivos
- **Prioridad 3**: Decoración y ambiente
- **Prioridad 4**: Polish visual

### 3. Optimización Continua

- Mantener conteo de polígonos bajo (<5k para props, <10k para personajes)
- Usar texturas compartidas cuando sea posible
- Reutilizar geometría con variaciones

---

## Modelado Low-Poly

### Conteo de Polígonos Recomendado

```
Props pequeños: 200-1000 tris
Props medianos: 1000-3000 tris
Personajes: 3000-8000 tris
Enemigos simples: 2000-5000 tris
Escenarios: Modular, <5000 tris por pieza
```

### Técnicas Low-Poly Esenciales

**1. Evitar Subdivisiones Innecesarias**
```
- Usar solo los polígonos necesarios
- Smooth shading en lugar de subdivisiones
- Edge loops solo donde hay deformación
```

**2. Silueta Clara**
```
- El modelo debe ser reconocible desde lejos
- Formas distintivas y exageradas
- Evitar detalles pequeños que no se verán
```

**3. Texturizado vs. Geometría**
```
- Preferir texturas sobre geometría adicional
- Usar normal maps para detalles finos
- Vertex colors para variaciones rápidas
```

---

## Pipeline Blender → Unity

### Configuración de Exportación FBX

```
Formato: FBX 7.4 ASCII
Scale: 1.00
Forward: -Z Forward
Up: Y Up
Apply Modifiers: ✅ Activado
Apply Scalings: FBX All
```

### Checklist Pre-Exportación

- [ ] Aplicar todas las transformaciones (Ctrl+A → All Transforms)
- [ ] Verificar que la escala sea 1.00 en todos los ejes
- [ ] Centrar el pivot point apropiadamente
- [ ] Nombrar objetos claramente (sin espacios, usar guiones bajos)
- [ ] Verificar que las normales estén correctas
- [ ] Asegurar que el UV mapping esté completo

### Naming Conventions

```
Personajes:
- CH_PlayerKnight.fbx
- CH_EnemyGoblin.fbx

Props:
- PROP_Crate_01.fbx
- PROP_Tree_Pine.fbx

Escenarios:
- ENV_Floor_Tile_01.fbx
- ENV_Wall_Stone.fbx

Texturas:
- T_PlayerKnight_Diffuse.png
- T_Crate_Normal.png
```

---

## Técnicas de Aceleración

### 1. Usar Modular Kits

```
- Crear piezas reutilizables para escenarios
- Diseñar con modularidad en mente (ej: paredes de 2m x 2m)
- Reutilizar geometría con diferentes materiales

Ejemplo de kit modular:
- Wall_Straight
- Wall_Corner
- Wall_Door
- Floor_Tile
- Pillar
- Stairs
```

### 2. Aprovechar Assets Gratuitos

```
- Mixamo para personajes base (luego personalizar)
- Kenney.nl para props genéricos
- Poly Haven para texturas de alta calidad
- Modificar assets existentes en lugar de crear desde cero
```

### 3. Técnicas de Texturizado Rápido

```
- Usar Vertex Colors en Blender para variaciones rápidas
- Aplicar Smart UV Project para UV mapping rápido
- Usar Procedural Textures en Blender
- Paletas de colores limitadas (3-5 colores principales)
```

### 4. Atajos de Blender Esenciales

```
Modelado:
E - Extrude
I - Inset Faces
Ctrl+R - Loop Cut
Alt+E - Extrude Menu
Shift+D - Duplicate
Ctrl+B - Bevel
F - Fill Face
K - Knife Tool
Ctrl+A - Apply Transformations

Selección:
A - Seleccionar todo
Alt+Click - Loop Select
Ctrl+Click - Shortest Path
L - Seleccionar linked

Vista:
Numpad . - Focus on selection
Numpad 1/3/7 - Front/Side/Top view
Z - Shading modes
```

---

## UV Mapping Rápido

### Smart UV Project (Método Rápido)

```
1. Seleccionar todo el modelo (A)
2. U → Smart UV Project
3. Ajustar Island Margin: 0.03
4. Click OK

Ventajas:
✅ Rápido
✅ Sin overlapping
❌ No optimizado para texturas custom
```

### UV Mapping Manual (Cuando necesites control)

```
1. Marcar seams (Ctrl+E → Mark Seam)
2. Seleccionar todo (A)
3. U → Unwrap
4. Ajustar en UV Editor

Dónde poner seams:
- Bordes ocultos (parte trasera, debajo)
- Cambios de material
- Áreas de alta curvatura
```

---

## Estilos Visuales para Game Jams

### Low-Poly Flat Shaded

```
Características:
- Sin texturas, solo colores
- Faceted look (flat shading)
- Formas geométricas simples

Proceso:
1. Modelar con polígonos bajos
2. Aplicar Flat Shading
3. Usar múltiples materiales con colores sólidos
4. Exportar sin texturas
```

### Low-Poly con Texturas

```
Características:
- Texturas estilizadas o pixel art
- UV mapping necesario
- Más visual detail

Proceso:
1. Modelar low-poly
2. UV unwrap
3. Pintar texturas en Blender o externamente
4. Exportar con texturas embedded
```

### Vertex Colors (Más Rápido)

```
Características:
- Colores directamente en vértices
- Sin necesidad de UV mapping
- Ideal para prototipos

Proceso en Blender:
1. Ir a Vertex Paint mode
2. Pintar colores directamente
3. En Unity, usar shader que soporte vertex colors
```

---

## Coordinación con Otros Roles

### Con el Animador

- **Comunicar temprano** qué assets necesitan rigging
- Asegurar topología limpia para deformación
- Proveer modelos con geometría adecuada para animación
- Usar **Asset Request issues** para coordinar entregas
- Entregar en T-pose o A-pose según acuerden

### Con el Programador

- Confirmar escala de assets (1 unidad Unity = 1 metro)
- Validar que los prefabs se importen correctamente
- Notificar cuando assets estén listos para integración
- Marcar issues como completados cuando estén en Unity

### Con el Game Designer

- Validar que el estilo visual coincida con la visión del juego
- Recibir feedback sobre proporciones y escala
- Ajustar assets según necesidades de level design

---

## Gestión de Tiempo

### Estimaciones Realistas (para desarrolladores Junior)

```
Asset Simple (crate, rock): 30-60 min
Asset Medio (árbol, mueble): 1-2 horas
Personaje básico: 3-4 horas
Enemigo simple: 2-3 horas
Escenario modular (kit completo): 4-6 horas
```

### Regla de Oro

**Si un asset toma más de 4 horas, busca alternativas:**
- Simplificar el diseño
- Usar asset gratuito como base
- Dividir en partes más simples
- Considerar si es realmente necesario para el MVP

### Distribución de Tiempo Sugerida (48h jam)

```
Horas 0-2: Planificación, lista de assets
Horas 2-8: Assets P0 (personaje principal, enemigo básico)
Horas 8-16: Assets P1 (props interactivos, ambiente básico)
Horas 16-24: Iteración y fixes según feedback
Horas 24-36: Assets P2 si hay tiempo, o polish de existentes
Horas 36-48: Solo fixes críticos, no crear nuevos assets
```

---

## Troubleshooting Común

### Modelo se importa con escala incorrecta en Unity

**Solución:**
- En Blender: Ctrl+A → All Transforms antes de exportar
- Verificar que la escala sea 1.00 en todos los ejes
- En Unity: Verificar Import Settings → Scale Factor = 1

### Normales invertidas (modelo se ve negro)

**Solución:**
- En Blender: Seleccionar todo → Alt+N → Recalculate Outside
- Verificar en Edit Mode con Face Orientation overlay
- Azul = correcto, Rojo = invertido

### Texturas no se importan con el modelo

**Solución:**
- Empaquetar texturas en el .blend (File → External Data → Pack Resources)
- O exportar texturas manualmente y asignarlas en Unity
- Usar nombres consistentes para texturas

### Modelo tiene demasiados polígonos

**Solución:**
- Usar Decimate Modifier en Blender
- Rediseñar con menos subdivisiones
- Eliminar geometría no visible
- Considerar si el detalle es necesario para el juego

### Pivot point en lugar incorrecto

**Solución:**
- En Blender: Object → Set Origin → Origin to Center of Mass/Geometry/3D Cursor
- Para props: pivot en la base (para colocar en suelo)
- Para personajes: pivot en los pies o centro de masa

---

## Checklist de Asset Completo

Antes de marcar un asset como "Done":

- [ ] Modelo cumple con límite de polígonos
- [ ] UV mapping completado
- [ ] Texturas aplicadas (o vertex colors)
- [ ] Transformaciones aplicadas en Blender
- [ ] Pivot point en posición correcta
- [ ] Normales correctas (sin caras invertidas)
- [ ] Exportado como FBX con configuración correcta
- [ ] Importado en Unity sin errores
- [ ] Escala correcta en Unity (1 unidad = 1 metro)
- [ ] Prefab creado en Unity (si aplica)
- [ ] Issue de Asset Request actualizado
- [ ] Comunicado al equipo que está listo

---

## Recursos de Aprendizaje Rápido

### Tutoriales Recomendados
- **Blender Guru** - Donut Tutorial (fundamentos)
- **Grant Abbitt** - Low Poly Modeling
- **Imphenzia** - Low Poly Game Assets
- **Brackeys** - Blender to Unity Pipeline

### Documentación Clave
- [Blender Manual](https://docs.blender.org/manual/en/latest/)
- [Unity FBX Import Settings](https://docs.unity3d.com/Manual/FBXImporter-Model.html)
- [Poly Haven Tutorials](https://polyhaven.com/tutorials)

---

## Filosofía para Game Jams

> **"Low-poly is your friend"**

En una game jam, un modelo simple y funcional es infinitamente mejor que un modelo detallado sin terminar. Prioriza la funcionalidad sobre la perfección visual.

### Principios Clave

1. **Scope realista**: No intentes hacer AAA art en 48 horas
2. **Estilo consistente**: Mejor simple y coherente que mezclado
3. **Funcionalidad primero**: El juego debe funcionar antes de verse bonito
4. **Reutilización**: Un asset usado 10 veces es mejor que 10 assets únicos
5. **Comunicación constante**: Mantén al equipo informado de tu progreso

---

**Recuerda**: En una game jam, tu objetivo no es crear el mejor modelo 3D de tu vida, sino crear assets funcionales que permitan al equipo entregar un juego jugable. Done is better than perfect.
