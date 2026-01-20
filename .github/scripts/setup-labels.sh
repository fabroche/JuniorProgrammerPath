#!/bin/bash
# Script para crear labels de GitHub para game jam workflow
# Requiere: GitHub CLI (gh) instalado y autenticado

set -e

echo "🏷️  Configurando labels de GitHub..."

# Función para crear o actualizar label
create_label() {
    local name=$1
    local color=$2
    local description=$3

    if gh label list | grep -q "^${name}"; then
        echo "  ↻ Actualizando: $name"
        gh label edit "$name" --color "$color" --description "$description"
    else
        echo "  ✓ Creando: $name"
        gh label create "$name" --color "$color" --description "$description"
    fi
}

# Labels de tipo de issue
create_label "feature" "0075ca" "Nueva funcionalidad o mecánica"
create_label "bug" "d73a4a" "Error o comportamiento incorrecto"
create_label "art" "a371f7" "Assets, modelos, animaciones"
create_label "design" "0e8a16" "Diseño de gameplay, level design"

# Labels de estado
create_label "ready" "bfdadc" "Lista para trabajar"
create_label "in-progress" "fbca04" "En desarrollo activo"
create_label "blocked" "e99695" "Bloqueado por dependencia"
create_label "needs-testing" "d4c5f9" "Implementado, requiere testing"

# Labels de prioridad
create_label "P0-critical" "b60205" "Bloqueante, debe estar en MVP"
create_label "P1-high" "d93f0b" "Importante para MVP"
create_label "P2-medium" "fbca04" "Mejora significativa"
create_label "P3-low" "0e8a16" "Nice to have"

# Labels de rol
create_label "programmer" "1d76db" "Tarea de programación"
create_label "modeler" "5319e7" "Tarea de modelado 3D"
create_label "animator" "c2e0c6" "Tarea de animación"
create_label "game-designer" "006b75" "Tarea de game design"

echo ""
echo "✅ Labels configurados correctamente!"
echo ""
echo "Para ver todos los labels:"
echo "  gh label list"
