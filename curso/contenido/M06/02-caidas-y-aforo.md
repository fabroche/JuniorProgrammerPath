---
modulo: 6
leccion: 2
tipo: lab
verificado: false
titulo: "Caídas y aforo"
resumen: "Provocar las tres situaciones incómodas en tu juego, mirar qué pasa de verdad, y decidir qué hace en cada una: se va un cliente, se va el anfitrión, y alguien llega tarde."
duracion: 60
objetivos:
  - Registrar qué eventos recibe cada máquina cuando alguien se desconecta
  - Limpiar el estado por jugador que guarda tu gestor de carrera
  - Avisar al cliente cuando el anfitrión desaparece
  - Decidir y aplicar una política para quien llega con la carrera empezada
fuentes:
  - titulo: "Connection approval"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/connection-approval.html
  - titulo: "NetworkManager"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkmanager.html
  - titulo: "Multiplayer Services SDK 2.3 · Manual"
    url: https://docs.unity3d.com/Packages/com.unity.services.multiplayer@2.3/manual/index.html
---

Este laboratorio empieza mirando y termina decidiendo. La primera mitad es un
registro: antes de arreglar una desconexión hay que saber qué te cuenta el
sistema cuando ocurre. En tu proyecto eso tiene una capa más que en el vídeo,
porque la conexión la gestionan las sesiones de los servicios de Unity.

::: prerrequisitos
- [ ] El laboratorio 5.2 terminado: existe `RaceManager` con su diccionario de listos
- [ ] La lección 6.1 leída
- [ ] Un commit limpio antes de empezar
:::

:::: paso Poner un registro de conexiones

Crea un `MonoBehaviour` de diagnóstico en la escena que se suscriba a
`NetworkManager.Singleton.OnConnectionEvent` y escriba en el log, en cada
máquina: quién soy, qué tipo de evento es y el identificador que trae.

```csharp
private void AlConectar(NetworkManager manager, ConnectionEventData datos)
{
    Debug.Log($"[{manager.LocalClientId}] {datos.EventType} · cliente {datos.ClientId}");
}
```

Los tipos posibles son `ClientConnected`, `ClientDisconnected`, `PeerConnected`
y `PeerDisconnected`.

::: porque
El vídeo razona sobre qué identificador llega en cada caso con una versión
antigua. En vez de fiarte de él o de esta lección, lo mides. Este registro es la
herramienta de todo el laboratorio, y se queda en el proyecto.
:::

::: esperado
Al crear la sesión y unirse el cliente, aparecen líneas en las dos consolas.
Apunta cuáles salen en cada una: es tu tabla de referencia.
:::
::::

:::: paso Se va el cliente

Con dos jugadores en plena carrera, cierra Player 2. Mira la consola del
anfitrión y la escena.

Predice antes: ¿qué le pasa al coche del cliente? ¿Y a los camiones?

::: porque
Tu prefab de vehículo tiene `DontDestroyWithOwner` desactivado: el coche es del
cliente y se va con él. Los camiones son del servidor y no dependen de nadie.
:::

::: esperado
En el anfitrión: una línea de desconexión con el identificador del cliente, y su
coche desaparece de la escena. Los camiones siguen.
:::
::::

:::: paso Limpiar lo que el servidor guardaba de él

Tu `RaceManager` tiene un diccionario de quién está listo. Reproduce el fallo:
dos jugadores en la sala de espera, uno pulsa «listo», el otro se desconecta sin
pulsar. ¿Arranca la carrera?

Después arréglalo: al desconectarse alguien, quita su entrada y vuelve a
comprobar si están todos listos.

::: porque
Es la pausa eterna del vídeo, con otro nombre. El estado que el servidor guarda
por cliente no se limpia solo, y deja la partida esperando a alguien que ya no
está.
:::

::: esperado
Antes del arreglo: la carrera no arranca nunca, o arranca según cómo recorras la
lista de conectados. Compruébalo con un log dentro del bucle: ¿figura todavía el
que se acaba de ir? Es el aviso de la lección 6.1 sobre el orden.

Después: al irse el que no estaba listo, la carrera arranca para el que queda.
:::
::::

:::: paso Se va el anfitrión

Ahora al revés: con dos jugadores, sal del modo Play en el editor, que es el
anfitrión, y mira la ventana de Player 2 y su consola.

::: porque
Sin anfitrión no hay servidor. La partida ha terminado para el cliente, y lo
peor que puede pasar es que no se entere.
:::

::: esperado
Anota qué evento recibe el cliente y con qué identificador. Anota también qué
hace la interfaz de sesión de tu escena, que tiene sus propios eventos: el
sistema de sesiones avisa cuando te sacan de una o cuando se elimina.

No hay una respuesta única que dar aquí por adelantado. Lo que veas es lo que
tu juego tiene que gestionar.
:::
::::

:::: paso Decírselo al jugador

Con lo que has observado, haz que el cliente muestre un mensaje cuando pierde al
anfitrión, en vez de quedarse con la escena congelada. Un texto en el Canvas y
un botón para volver al estado inicial es suficiente.

::: porque
Es la pantalla de «el anfitrión se ha desconectado» del vídeo. No arregla nada,
pero convierte un cuelgue aparente en algo que el jugador entiende.
:::

::: esperado
Al caer el anfitrión, el cliente ve el mensaje. Al pulsar el botón, puede crear
o unirse a otra sesión sin reiniciar el juego.
:::
::::

:::: paso Llegar tarde: decidir

En el laboratorio 5.2 viste que quien entra con la carrera empezada puede
conducir. Elige una política y anótala:

1. **Se permite.** Entra y corre lo que queda.
2. **Entra como espectador.** Su coche no responde hasta la siguiente carrera.
3. **Se rechaza.** No entra hasta que acabe.

::: porque
El vídeo elige rechazar, y con eso se ahorra sincronizar los pedidos a quien
llega tarde. Tú no tienes ese problema: todo tu estado de partida va en
NetworkVariable. Puedes elegir por diseño y no por necesidad.
:::

::: esperado
Una decisión anotada. Si es la primera, has terminado.
:::
::::

:::: paso Llegar tarde: aplicar

Según lo que hayas elegido:

- **Espectador:** una condición más en `VehicleOwnership`, que ya decide si el
  controlador responde.
- **Rechazar:** activa la aprobación de conexiones en el NetworkManager y asigna
  `ConnectionApprovalCallback`. Rechaza con un motivo si el estado no es
  `WaitingForPlayers`.

Si vas por la aprobación, pon un log dentro del callback antes de nada.

::: porque
Tú no arrancas el NetworkManager: lo hace el sistema de sesiones. Antes de
construir sobre el callback, comprueba que se invoca en tu configuración. Y el
límite de jugadores ya lo tienes en otro sitio: `MaxPlayers: 4` en
`DefaultWidgetConfiguration`, que la sesión aplica antes de que nadie llegue al
NetworkManager.
:::

::: esperado
Con espectador: quien entra tarde ve la carrera y no puede conducir hasta la
siguiente.

Con rechazo: el log del callback aparece en el anfitrión, y el cliente que
intenta entrar a mitad no entra. Recuerda poner `CreatePlayerObject` en
verdadero al aprobar, o los que sí entran lo harán sin coche.
:::
::::

::: verificar
- [ ] Tengo una tabla de qué evento recibe cada máquina en cada caso
- [ ] Si se va un jugador que no estaba listo, la carrera no se queda esperándolo
- [ ] El cliente recibe un mensaje cuando cae el anfitrión
- [ ] He decidido qué pasa con quien llega tarde, y está aplicado
:::

::: problema El callback de aprobación no se invoca nunca
Comprueba que la casilla de aprobación de conexiones está activada en el
NetworkManager y que el delegado se asigna antes de crear la sesión. Si aun así
no salta, la sesión está gestionando la conexión por su cuenta: usa la política
de espectador, que no depende de ello.
:::

::: problema Tras caer el anfitrión no puedo crear otra sesión
El NetworkManager del cliente sigue activo. Hay que cerrarlo, y salir de la
sesión, antes de empezar otra.
:::

::: problema Los que entran aprobados no tienen coche
Falta `respuesta.CreatePlayerObject = true` en la rama que aprueba.
:::
