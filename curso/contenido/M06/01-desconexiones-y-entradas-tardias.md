---
modulo: 6
leccion: 1
tipo: concepto
titulo: "Desconexiones y entradas tardías"
resumen: "Lo que distingue un prototipo de un juego: qué pasa cuando alguien se cae a mitad, cuando se cae el anfitrión, y cuando alguien intenta entrar con la partida empezada."
duracion: 25
objetivos:
  - Reaccionar a la desconexión de un cliente y limpiar lo que dejó
  - Distinguir la caída de un cliente de la caída del anfitrión
  - Explicar por qué entrar tarde desincroniza lo que se envió por RPC
  - Aceptar o rechazar una conexión con la aprobación de conexiones
video:
  - titulo: "Handle Disconnects"
    inicio: "03:11:16"
    fin: "03:20:20"
  - titulo: "Handle Late Joins"
    inicio: "03:20:20"
    fin: "03:29:44"
fuentes:
  - titulo: "Connection approval"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/connection-approval.html
  - titulo: "NetworkManager"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkmanager.html
  - titulo: "Spawning synchronization"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/spawning-synchronization.html
  - titulo: "RPC vs NetworkVariable"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/learn/rpcvnetvar.html
---

Todo lo anterior supone que los jugadores entran antes de empezar y se quedan
hasta el final. Estos dos capítulos quitan esa suposición.

## Se va un cliente

::: natural
Cuando un jugador se desconecta, su personaje desaparece solo. Pero todo lo
demás que el juego sabía de él se queda: lo que llevaba en las manos, su
casilla de «estoy listo», su pausa.

Hay que enterarse de que se ha ido y recoger.
:::

::: tecnico
`NetworkManager.OnClientDisconnectCallback` se invoca con el identificador del
cliente desconectado. El objeto de jugador se destruye con su dueño salvo que
tenga activado `DontDestroyWithOwner`. Los demás objetos de red de los que fuera
dueño siguen esa misma opción, objeto por objeto.

El estado que el servidor guardaba por cliente, como los diccionarios del
módulo 5, hay que limpiarlo a mano en ese callback.
:::

El vídeo encuentra aquí los dos fallos que anunciaba el módulo anterior:

- **La pausa eterna.** Si el único jugador en pausa se va, su entrada del
  diccionario sigue en verdadero. El arreglo es volver a evaluar la pausa al
  desconectarse alguien.
- **El orden del aviso.** Cuando salta el callback, el cliente que se va
  **todavía figura** en la lista de conectados. Si recalculas en ese momento, lo
  cuentas. El autor lo resuelve aplazando el recálculo al fotograma siguiente.

::: ojo
El segundo es de los que hacen perder una tarde. Un callback de «se ha ido»
no garantiza que las listas internas ya reflejen que se ha ido. Si tu limpieza
depende de la lista de conectados, compruébalo con un log antes de fiarte.
:::

## Se va el anfitrión

::: natural
Si el que se cae es el anfitrión, no se ha ido un jugador: se ha ido el
servidor. No queda nadie que decida, así que la partida se acaba para todos.

Lo mínimo es decírselo a los jugadores en vez de dejarlos mirando un juego
congelado.
:::

::: tecnico
En cliente-servidor no hay migración de anfitrión: al cerrarse el servidor, los
clientes quedan desconectados. El vídeo lo detecta en el cliente comparando el
identificador recibido en el callback con `NetworkManager.ServerClientId`, y
muestra una pantalla de «el anfitrión se ha desconectado» con un botón para
volver al menú.

Antes de cargar el menú llama a `NetworkManager.Shutdown()`, y lo hace en
**todos** los sitios desde los que se puede salir de la partida. Un
NetworkManager que sigue vivo al volver al menú es una fuente clásica de
errores al iniciar la siguiente partida.
:::

::: hoy
Tu versión añade `OnConnectionEvent`, un único evento que distingue entre que
se conecte o desconecte el cliente local y que lo haga otro par. También expone
`NetworkManager.DisconnectReason`, un texto con el motivo que el servidor puede
enviar al echar a alguien.

Además, tú no arrancas el NetworkManager a mano: lo hace el sistema de sesiones
de los servicios multijugador, que tiene sus propios eventos de «un jugador ha
salido» y «te han sacado de la sesión». El laboratorio empieza por averiguar qué
recibes de verdad en cada caso.
:::

## Entrar tarde

::: natural
Alguien se une con la partida a medias. ¿Qué ve?

- Los objetos de red que existen: sí, todos.
- El valor actual de cada NetworkVariable: sí.
- Lo que se avisó con un RPC antes de que llegara: **no**.

Los pedidos pendientes del vídeo se enviaron con RPC. El que entra tarde ve una
cocina con una lista de pedidos vacía mientras los demás tienen tres.
:::

::: tecnico
Al aprobar un cliente, el servidor le sincroniza los `NetworkObject` publicados
y el estado actual de sus `NetworkVariable`. Los RPC no se almacenan: son
mensajes de un instante, entregados a quien estuviera conectado al enviarlos.

Para que un estado enviado por RPC llegue a quien entra tarde, hay que
reenviárselo al conectarse, o haberlo modelado como NetworkVariable desde el
principio.
:::

El autor explica por qué usó RPC para los pedidos aun sabiendo esto: una receta
es un ScriptableObject y no cabe en una NetworkVariable tal cual. Habría que
guardar su posición en la lista. No lo rehace, y toma otra decisión.

::: clave
Entrar tarde no siempre hay que resolverlo. Se puede **prohibir**. El vídeo
decide que nadie entra con la partida empezada, y con eso el problema de los
pedidos desaparece sin escribir una línea de sincronización. Es una decisión de
diseño legítima, y muchas veces la correcta.
:::

## La aprobación de conexiones

::: natural
Por defecto el servidor acepta a todo el que llama. Se puede poner un portero:
una función que mira cada intento de conexión y dice sí o no, con un motivo.
:::

::: tecnico
Con la aprobación activada en el NetworkManager, el servidor invoca
`ConnectionApprovalCallback` por cada cliente que intenta entrar:

```csharp
private void AlAprobar(NetworkManager.ConnectionApprovalRequest peticion,
                       NetworkManager.ConnectionApprovalResponse respuesta)
{
    if (partidaEmpezada)
    {
        respuesta.Approved = false;
        respuesta.Reason = "La partida ya ha empezado";
        return;
    }
    respuesta.Approved = true;
    respuesta.CreatePlayerObject = true;
}
```

No es un evento sino un delegado: se asigna, no se suma. Y al aprobar hay que
poner `CreatePlayerObject` en verdadero, o el cliente entra sin personaje.
:::

El vídeo rechaza en dos casos: partida empezada y sala llena. El texto de
`Reason` llega al cliente rechazado, que puede mostrarlo en vez de un genérico
«no se pudo conectar».

::: vocabulario
Entrada tardía (*late join*)
: Conectarse con la partida ya empezada.

Aprobación de conexiones
: Una función del servidor que acepta o rechaza cada intento de conexión.

Migración de anfitrión
: Que otro jugador pase a ser el servidor cuando el anfitrión se va. Netcode no
  la hace en cliente-servidor.
:::

En el laboratorio provocas las tres situaciones en tu juego y decides qué hace
en cada una.
