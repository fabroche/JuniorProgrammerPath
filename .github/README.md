# GitHub Configuration for Game Jam

## Issue Templates

Este proyecto incluye 4 templates de issues optimizados para game jams:

- **Feature Request** - Nuevas funcionalidades
- **Bug Report** - Reportar errores
- **Asset Request** - Solicitar assets (3D, audio, animaciones)
- **Design Task** - Tareas de diseño y testing

## Labels

### Setup Automático

Ejecuta el script de setup para crear todos los labels:

```bash
.github/scripts/setup-labels.sh
```

**Requisitos:**
- GitHub CLI instalado: `gh --version`
- Autenticado: `gh auth login`

### Labels Incluidos

**Tipo:**
- `feature` - Nueva funcionalidad
- `bug` - Error o bug
- `art` - Assets y arte
- `design` - Diseño de gameplay

**Estado:**
- `ready` - Lista para trabajar
- `in-progress` - En desarrollo
- `blocked` - Bloqueado
- `needs-testing` - Requiere testing

**Prioridad:**
- `P0-critical` - Bloqueante para MVP
- `P1-high` - Importante para MVP
- `P2-medium` - Mejora significativa
- `P3-low` - Nice to have

**Rol:**
- `programmer` - Tarea de programación
- `modeler` - Modelado 3D
- `animator` - Animación
- `game-designer` - Game design

## Workflow

1. Crear issue usando templates
2. Asignar prioridad (P0-P3)
3. Asignar rol
4. Trabajar en orden de prioridad
5. Marcar como `in-progress`
6. Cuando esté listo: `needs-testing`
7. Cerrar cuando esté testeado y aprobado
