---
modulo: 0
leccion: 2
tipo: lab
verificado: false
titulo: "Dos jugadores en tu máquina"
resumen: "Montar el banco de pruebas del curso: anfitrión y cliente a la vez, en tu ordenador, para mirar cada cambio desde los dos lados."
duracion: 30
objetivos:
  - Arrancar un segundo jugador con Multiplayer Play Mode sin hacer un build
  - Crear una sesión como anfitrión y unirte como cliente
  - Encontrar en el Inspector qué copia de cada coche es de quién
  - Comprobar con tus manos que una copia ajena no obedece a tu teclado
fuentes:
  - titulo: "Multiplayer Play Mode 1.6 · Manual"
    url: https://docs.unity3d.com/Packages/com.unity.multiplayer.playmode@1.6/manual/index.html
  - titulo: "NetworkObject"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkobject.html
  - titulo: "Ownership"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/ownership.html
---

Todo lo que venga después se comprueba igual: dos jugadores, y mirar desde los
dos. Este laboratorio deja esa rutina montada. No escribes código.

::: hoy
En el vídeo cada prueba es un build: compilar el juego, abrir el ejecutable y
compararlo con el editor. Tú tienes instalado Multiplayer Play Mode 1.6.3, que
abre un segundo jugador como una ventana más del editor, sin compilar nada.
:::

::: prerrequisitos
- [ ] La rama `multiplayer-player-sync` abierta en Unity, con la escena `Prototype 1`
- [ ] Conexión a internet: los botones de sesión de tu escena usan los servicios de Unity
- [ ] La lección 0.1 leída
:::

:::: paso Activar un segundo jugador

En el menú **Window → Multiplayer → Multiplayer Play Mode**, marca la casilla de
**Player 2**. Espera a que termine de prepararse.

::: porque
Necesitas dos procesos, porque un juego en red son dos juegos enteros que se
hablan. Un solo editor en Play nunca te enseña un fallo de sincronización: en él
solo existe una copia de cada cosa.
:::

::: esperado
Se abre una segunda ventana con la vista de juego de Player 2. Comparte tu
proyecto: no es una copia de la carpeta, así que no hay nada que mantener
sincronizado a mano.
:::
::::

:::: paso Crear la sesión y unirte

Pulsa **Play** en el editor. En tu ventana pulsa **Create Session**. En la
ventana de Player 2 elige esa sesión en **Session List** y únete.

::: porque
Quien crea la sesión arranca como anfitrión: es servidor y cliente a la vez.
Quien se une es solo cliente. Tener uno de cada es lo que te deja ver la
diferencia.
:::

::: esperado
Dos coches en la escena, visibles en las dos ventanas. Cada ventana tiene su
cámara siguiendo a un coche distinto.
:::
::::

:::: paso Mirar desde los dos lados

Conduce en tu ventana y mira el mismo coche en la de Player 2. Luego haz clic en
la ventana de Player 2, conduce ahí, y mira en la tuya.

::: porque
El anfitrión no tiene retraso consigo mismo. Un fallo puede no verse nunca desde
él y verse siempre desde el cliente, así que la costumbre es mirar las dos
direcciones.
:::

::: esperado
Los dos coches se mueven en las dos ventanas. La copia va un poco por detrás del
original, como en la figura de la lección 0.1.
:::
::::

:::: paso Encontrar al dueño en el Inspector

Con el juego en marcha, en la **Hierarchy** del editor selecciona cada uno de
los dos coches y mira su componente **NetworkObject**, y debajo su
`TransportController`.

::: porque
La lección 0.1 afirma que hay una copia por máquina y que `IsOwner` es lo único
que las distingue. Aquí lo ves sin fiarte de nadie.
:::

::: esperado
En el editor, que es el anfitrión:

- Un coche es tuyo: su controlador está activado.
- El otro es la copia del coche del cliente: su controlador está **desactivado**.
  Lo apagó tu `VehicleOwnership` en `OnNetworkSpawn`.
- Los dos tienen identificador de red y dueño distintos.
:::
::::

:::: paso Forzar una copia a obedecerte

Sin parar el juego, selecciona en el editor la copia del coche del cliente y
**activa a mano** su controlador en el Inspector. Conduce.

Antes de hacerlo, escribe tu predicción: ¿se moverá esa copia en tu ventana? ¿Y
en la de Player 2?

::: porque
Es el experimento que justifica la línea `controller.enabled = IsOwner`. Verlo
fallar una vez enseña más que leer por qué está ahí.
:::

::: esperado
Lo que dice la teoría, y que tienes que confirmar: tus teclas intentan mover las
dos copias a la vez en tu ventana, pero la del cliente no te pertenece. Su
posición la decide su dueño, y lo que llegue de él la devuelve a su sitio. En la
ventana de Player 2 su coche no debería enterarse de nada.

Anota lo que veas de verdad. Si no coincide, es justo lo que hay que entender.
:::
::::

::: verificar
- [ ] Player 2 arranca sin hacer un build
- [ ] Sé cuál de las dos ventanas es el anfitrión y cuál el cliente
- [ ] He visto en el Inspector el controlador desactivado en la copia ajena
- [ ] He hecho el experimento del último paso y he anotado el resultado
:::

::: problema La sesión no aparece en Session List
Los botones de tu escena crean y listan sesiones a través de los servicios de
Unity, no por red local. Comprueba que el proyecto está enlazado en
**Edit → Project Settings → Services** y que hay conexión. Pulsa de nuevo el
botón de refrescar de la lista.
:::

::: problema Player 2 se queda preparándose mucho rato
La primera activación tarda porque monta su propia carpeta de trabajo. Las
siguientes son rápidas. Si no termina, desmarca la casilla, espera y vuelve a
marcarla.
:::

::: problema Los dos coches aparecen uno encima del otro
No es un fallo de red: los dos nacen en el mismo punto. Conduce uno y se
separan. El reparto de puntos de salida se trata en el módulo 5.
:::

Con esto queda montado el banco. En el módulo 1 cambias quién tiene la autoridad
sobre el movimiento y ves qué se rompe.
