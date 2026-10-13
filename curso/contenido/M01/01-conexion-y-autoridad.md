---
modulo: 1
leccion: 1
tipo: concepto
titulo: "Conexión y autoridad: quién mueve el coche"
resumen: "La decisión que más pesa en un juego en red: si el movimiento lo decide el servidor o el dueño del objeto. Qué gana y qué pierde cada opción."
duracion: 25
objetivos:
  - Enumerar lo mínimo que hace falta para que un objeto exista en red
  - Explicar qué significa que el movimiento sea autoritativo del servidor o del dueño
  - Predecir qué le pasa a un cliente que mueve un objeto sobre el que no tiene autoridad
  - Elegir entre las dos opciones según el tipo de juego
video:
  - titulo: "Install Netcode and basic Setup"
    inicio: "00:22:37"
    fin: "00:42:26"
  - titulo: "Sync Player Movement, Client Vs Server Auth"
    inicio: "00:42:26"
    fin: "00:54:20"
  - titulo: "Sync Player Animations"
    inicio: "00:54:20"
    fin: "00:59:11"
fuentes:
  - titulo: "NetworkManager"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkmanager.html
  - titulo: "NetworkObject"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkobject.html
  - titulo: "NetworkBehaviour"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkbehaviour.html
  - titulo: "Ownership"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/ownership.html
  - titulo: "Client-server topology"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/client-server.html
---

En estos tres capítulos el autor instala Netcode, hace aparecer un jugador por
cada conexión y sincroniza su movimiento y sus animaciones. Tú ya tienes eso
hecho. Lo que te llevas de aquí es entender la decisión que tomaste sin saberlo
al configurar el `NetworkTransform`.

## Lo mínimo para existir en red

::: natural
Para que algo se vea en todas las máquinas hacen falta cuatro cosas:

1. Un **NetworkManager** en la escena, que es quien conecta.
2. Que el objeto sea un **prefab** y lleve un **NetworkObject**.
3. Que ese prefab esté **apuntado en una lista** que conocen todas las máquinas.
4. Que alguien lo haga aparecer. Para el jugador, lo hace el NetworkManager solo
   cada vez que entra alguien.
:::

::: tecnico
El `NetworkManager` instancia su `PlayerPrefab` por cada cliente aprobado y le
asigna ese cliente como dueño. El prefab necesita un `NetworkObject` y estar
registrado en una lista de prefabs de red: al crear un objeto, el servidor no
envía el objeto, envía un identificador del prefab, y cada cliente instancia el
suyo a partir de su copia local.

En tu proyecto esa lista es `Assets/DefaultNetworkPrefabs.asset`.
:::

::: hoy
En el vídeo la lista de prefabs está dentro del propio NetworkManager, y el
autor avisa de que en la siguiente versión pasaría a un objeto aparte. Es el
`DefaultNetworkPrefabs` que tú ya tienes.

También instala Quantum Console para leer los logs dentro de un build. Con
Multiplayer Play Mode no hace falta: cada jugador tiene su consola en el editor.
:::

## El primer fallo: los dos jugadores obedecen al mismo teclado

Con el jugador apareciendo en las dos máquinas, el autor pulsa una tecla y se
mueven los dos personajes a la vez. No es un fallo de red. Es que el script de
movimiento se ejecuta en todas las copias, y todas leen el mismo teclado.

Lo arregla con una línea al principio del `Update` del jugador:

```csharp
if (!IsOwner) return;
```

Es lo mismo que hace tu `VehicleOwnership` con `controller.enabled = IsOwner`,
resuelto en otro sitio. Él corta dentro del script; tú apagas el componente
entero desde fuera, y así `TransportController` sigue sin saber nada de red.

## Sincronizar el movimiento: quién tiene la última palabra

::: natural
Un `NetworkTransform` copia la posición y la rotación de un objeto a las demás
máquinas. La pregunta es **desde cuál**.

- Si manda el **servidor**, él mueve el objeto y los demás solo miran. Un
  cliente no puede mover ni su propio coche: tiene que pedírselo al servidor.
- Si manda el **dueño**, cada jugador mueve su coche y se lo cuenta a los demás.
:::

::: tecnico
`NetworkTransform` tiene un modo de autoridad con dos valores, `Server` y
`Owner`. Solo la instancia con autoridad escribe el transform y lo replica; en
las demás, el componente sobrescribe el transform local con lo recibido,
interpolando.

Si una instancia sin autoridad cambia el transform, su cambio no se envía a
nadie y el siguiente dato recibido lo pisa.
:::

::: figura quien-manda
:::

Mueve el puntero para empujar tu coche y pulsa para cambiar la palanca de la
caja. Con el servidor al mando, fíjate en el reloj de la caja: no se mueve,
porque al servidor no le ha llegado nada, y tu coche vuelve a esa posición.

El autor lo demuestra en este orden, y merece la pena verlo en el vídeo:

1. Pone un `NetworkTransform` normal. El anfitrión se mueve y se sincroniza. El
   cliente pulsa teclas, su animación de andar se reproduce, y **no se mueve**.
2. Lo cambia por una versión con autoridad de cliente. Los dos se mueven.
3. Vuelve al normal y hace que el cliente envíe sus teclas al servidor para que
   sea él quien mueva el personaje. Los dos se mueven, y manda el servidor.

::: hoy
Para el paso 2 el autor copia de la documentación un script, `ClientNetworkTransform`,
que hereda de `NetworkTransform` y cambia una sola cosa. En tu versión no hace
falta: el propio componente tiene el desplegable **Authority Mode**. En tu
prefab `Vehicle_NetworkObject` está en `Owner`.

Lo mismo vale para las animaciones: en el vídeo hay un `OwnerNetworkAnimator`
copiado aparte, y hoy `NetworkAnimator` trae su propio modo de autoridad.
:::

## Qué se gana y qué se pierde

| | Manda el servidor | Manda el dueño |
|---|---|---|
| Respuesta al pulsar | Con retraso: la tecla viaja, el servidor mueve, y vuelve | Inmediata |
| Trampas | Difíciles: el servidor valida cada movimiento | Fáciles: el cliente dice dónde está y se le cree |
| Código | Más: hay que enviar la intención y aplicarla en el servidor | Menos: el movimiento se queda como estaba |
| Choques entre jugadores | Coherentes: los resuelve uno solo | Cada uno ve una versión; hay que decidir cuál vale |

::: clave
El autor elige autoridad del cliente para todo el curso, y lo razona: es un
juego cooperativo, nadie gana nada haciendo trampas, y la respuesta inmediata
importa más. Tu juego de vehículos está en el mismo caso, y es lo que tienes
configurado.

Un juego competitivo con algo en juego elige lo contrario y paga el precio en
código, normalmente añadiendo predicción en el cliente para disimular el
retraso.
:::

::: ojo
Autoridad del dueño no significa que el servidor desaparezca. Sigue siendo el
único que puede crear y destruir objetos de red, y por él pasan todos los datos.
Solo ha prestado una decisión: dónde está ese objeto.
:::

## Animaciones

El capítulo corto que cierra el módulo aplica la misma idea a las animaciones:
un componente que replica los parámetros del `Animator`, con la misma pregunta
de quién manda.

Tu proyecto no usa `Animator` en los vehículos. Lo equivalente son las ruedas, y
tu `WheelsVisual` ya lo resuelve sin red: deduce el giro de lo que el coche se
desplaza, que es un dato que sí llega a todas las copias. Donde eso no alcanza
es en el volante, y de ahí sale el módulo 4.

::: vocabulario
Autoridad del servidor
: Solo el servidor cambia el estado. Los clientes envían intenciones.

Autoridad del dueño
: El cliente dueño de un objeto cambia su estado y lo replica. También se llama
  autoridad del cliente.

Interpolación
: Mover la copia suavemente entre los datos recibidos en vez de saltar de uno a
  otro. Por eso la copia va siempre un poco por detrás.

Prefab de red
: Un prefab con `NetworkObject`, registrado en la lista que comparten todas las
  máquinas.
:::

En el laboratorio cambias el modo de autoridad de tu coche y reproduces el paso
1 del vídeo: el cliente que pulsa y no se mueve.
