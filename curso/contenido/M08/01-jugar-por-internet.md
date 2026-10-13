---
modulo: 8
leccion: 1
tipo: concepto
titulo: "Jugar por internet: encontrarse y conectarse"
resumen: "Dos problemas distintos que suelen confundirse: cómo descubre un jugador que existe una partida, y cómo llegan los datos de una casa a otra sin abrir puertos."
duracion: 35
objetivos:
  - Separar el problema de encontrarse del problema de conectarse
  - Explicar qué resuelve un servicio de salas y qué resuelve un relé
  - Traducir los pasos del vídeo, con Lobby y Relay por separado, a las sesiones de tu versión
  - Saber qué tiene que ocurrir antes de poder usar cualquier servicio de Unity
video:
  - titulo: "Lobby"
    inicio: "04:37:34"
    fin: "05:35:30"
  - titulo: "Relay"
    inicio: "05:35:30"
    fin: "05:51:42"
  - titulo: "Game Server Hosting (Multiplay), Matchmaker, Vivox"
    inicio: "05:51:42"
    fin: "05:55:09"
fuentes:
  - titulo: "Multiplayer Services SDK 2.3 · Manual"
    url: https://docs.unity3d.com/Packages/com.unity.services.multiplayer@2.3/manual/index.html
  - titulo: "Network topologies"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/network-topologies.html
  - titulo: "Client-server topology"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/client-server.html
---

Es el tramo más largo del vídeo, casi hora y cuarto, y el que más ha cambiado
desde 2023. Las ideas siguen valiendo todas. El código, casi ninguno: lo que el
autor monta a mano con dos servicios, tu versión lo hace con uno. Por eso esta
lección separa con cuidado el qué del cómo.

## Dos problemas, no uno

Hasta aquí, conectar dos jugadores en una misma máquina no tenía misterio. Por
internet aparecen dos obstáculos que no tienen nada que ver entre sí.

::: natural
**Encontrarse.** Tu amigo quiere unirse a tu partida. ¿Cómo sabe que existe?
¿Cómo la distingue de las de otros? Hace falta un tablón de anuncios donde las
partidas se apuntan y la gente las busca, o un código que tú le dictas.

**Conectarse.** Aunque sepa que existe, su ordenador no puede llamar al tuyo. Tu
router no deja entrar conexiones que no has pedido tú. Hace falta un
intermediario al que los dos podáis llamar, y que pase los datos de uno a otro.
:::

::: tecnico
El primer problema es de **descubrimiento**, y lo resuelve un servicio de salas:
un registro en la nube de partidas con nombre, aforo, visibilidad y datos
asociados, consultable y con códigos de acceso.

El segundo es de **conectividad**. La mayoría de los jugadores están detrás de
un NAT, que no admite conexiones entrantes sin redirección de puertos. Un relé
es un servidor público al que tanto el anfitrión como los clientes abren
conexiones **salientes**, que el NAT sí permite, y que reenvía los paquetes
entre ellos.
:::

::: clave
El relé no es el servidor del juego. No ejecuta tu código ni decide nada: solo
pasa paquetes. El servidor sigue siendo el anfitrión, en casa de un jugador. Lo
que cambia es el camino que recorren los datos, y con él la latencia: cada
mensaje hace una parada más.
:::

## Antes de nada: servicios y sesión iniciada

Cualquier servicio de Unity exige lo mismo, y el vídeo empieza por ahí:

1. El proyecto enlazado a un proyecto de la nube de Unity.
2. Inicializar los servicios al arrancar.
3. Iniciar sesión, aunque sea de forma anónima: el servicio necesita distinguir
   a cada jugador.

::: ojo
El autor se encuentra con un problema que también es tuyo. Al probar con varias
copias del juego en un mismo ordenador, todas inician sesión con la misma
identidad anónima, porque se guarda por dispositivo, y el servicio las trata
como un solo jugador. Lo arregla dándole a cada copia un perfil distinto al
inicializar. Con Multiplayer Play Mode pasa lo mismo si nadie lo evita.
:::

## Lo que el vídeo monta a mano

Con el servicio de salas, el autor escribe un gestor que hace todo esto:

- Crear una sala con nombre, aforo y visibilidad pública o privada.
- Unirse de tres formas: rápida a la primera con hueco, por código, o
  eligiéndola de una lista.
- Mantener viva la sala: si el anfitrión no envía una señal cada pocos
  segundos, el servicio la da por abandonada y la oculta.
- Refrescar la lista cada cierto tiempo, respetando los límites de peticiones
  del servicio.
- Salir, expulsar a un jugador, y borrar la sala cuando empieza la partida.
- Sincronizar el nombre de cada jugador, añadiéndolo a sus datos del módulo 7.

Con el relé, otros cuatro pasos encadenados:

```text
  ANFITRIÓN                                        CLIENTE
  ─────────                                        ───────
  1. pide una plaza al relé
  2. pide el código de esa plaza
  3. guarda el código en los datos de la sala ───▶ 4. lee el código de la sala
  5. configura el transporte con la plaza          5. pide entrar con el código
  6. arranca como anfitrión                        6. configura el transporte
                                                   7. arranca como cliente
```

El punto 3 es el que une los dos servicios: la sala sirve para encontrarse, y
dentro lleva guardada la dirección del relé, que sirve para conectarse.

## Lo que tienes tú

::: hoy
Tu proyecto no tiene instalados los paquetes de salas y de relé por separado.
Tiene `com.unity.services.multiplayer` 2.3.3, que los reúne bajo un solo
concepto, la **sesión**.

| En el vídeo | En tu versión |
|---|---|
| Crear sala, pedir plaza al relé, guardar el código, configurar el transporte y arrancar | `CreateSessionAsync` con la opción de red por relé |
| Unirse por código y configurar el transporte | `JoinSessionByCodeAsync` |
| Listar salas | `QuerySessionsAsync` |
| Señal periódica del anfitrión | La gestiona la sesión |
| Arrancar el NetworkManager a mano | Lo arranca la sesión |

Y ya lo estás usando. Los botones **Create Session** y **Session List** de tu
escena son componentes ya hechos que llaman a esto, configurados en
`DefaultWidgetConfiguration`: tipo de conexión por relé y cuatro jugadores como
máximo. Llevas todo el curso jugando a través de un relé sin haber escrito una
línea.
:::

::: natural
Una sesión es la partida vista desde fuera: tiene nombre, aforo, un código para
entrar, y una lista de quién está. Crearla o unirse a ella se ocupa, por
debajo, de encontrarse, de conectarse y de arrancar la red.
:::

::: tecnico
`MultiplayerService.Instance.CreateSessionAsync(opciones)` devuelve la sesión
como anfitrión. Las opciones llevan nombre, `MaxPlayers`, `IsPrivate`, `IsLocked`
y contraseña, y un método de extensión elige la red: `WithRelayNetwork()` para
relé, o conexión directa. La sesión expone eventos de entrada y salida de
jugadores, de expulsión y de eliminación, que sustituyen a parte de los
callbacks del NetworkManager del módulo 6.
:::

## Lo que el vídeo solo menciona

El último capítulo es un repaso de tres minutos a servicios que no usa:

- **Servidores dedicados.** Un servidor en la nube que no es ningún jugador.
  Quita la ventaja del anfitrión y permite que la partida sobreviva a que
  alguien se vaya. Cuesta dinero por hora de servidor.
- **Emparejamiento.** En vez de elegir sala, el jugador pulsa «jugar» y el
  servicio lo junta con otros de nivel parecido.
- **Voz y texto.** Chat entre jugadores. Tienes instalado el paquete, Vivox,
  sin usar.

::: ojo
La oferta de servicios de Unity ha cambiado bastante desde que se grabó el
vídeo, y el alojamiento de servidores dedicados en particular. Antes de
planificar nada sobre uno de ellos, comprueba en la documentación actual que
sigue existiendo y en qué condiciones.
:::

::: vocabulario
Sala (*lobby*)
: Registro en la nube de una partida a la que otros pueden unirse.

Relé (*relay*)
: Servidor intermediario que reenvía paquetes entre jugadores que no pueden
  conectarse directamente.

NAT
: Lo que hace tu router para que varios aparatos compartan una dirección. De
  paso, bloquea las conexiones entrantes.

Sesión
: En tu versión, la partida vista desde fuera: reúne sala, conexión y arranque
  de la red.
:::

En el laboratorio sustituyes los botones ya hechos por tu propio código, para
entender qué hacían, y añades entrar con un código.
