---
modulo: 9
leccion: 1
tipo: concepto
titulo: "Depurar y cerrar: mala red, medidas y un jugador"
resumen: "Tu juego funciona porque lo has probado en la mejor red posible: tu propio ordenador. Cómo estropearla a propósito, qué medir, y por qué conviene poder jugar sin red."
duracion: 25
objetivos:
  - Nombrar las tres formas en que una red real se desvía de la ideal
  - Explicar qué significa que un RPC sea fiable o no, y cuándo conviene cada cosa
  - Saber qué herramienta responde a cada pregunta sobre el tráfico de red
  - Entender el modo de un jugador como un anfitrión sin clientes
video:
  - titulo: "Multiplayer Debug Tools"
    inicio: "05:55:09"
    fin: "06:07:43"
  - titulo: "Singleplayer Option"
    inicio: "06:07:43"
    fin: "06:11:16"
  - titulo: "Gamepad Test"
    inicio: "06:11:16"
    fin: "06:15:19"
  - titulo: "Final Game"
    inicio: "06:15:19"
    fin: "06:18:12"
  - titulo: "CONGRATULATIONS"
    inicio: "06:18:12"
    fin: "06:20:02"
fuentes:
  - titulo: "Multiplayer Tools 2.2 · Manual"
    url: https://docs.unity3d.com/Packages/com.unity.multiplayer.tools@2.2/manual/index.html
  - titulo: "Dealing with latency"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/learn/dealing-with-latency.html
  - titulo: "RPC"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/message-system/rpc.html
  - titulo: "Multiplayer Play Mode 1.6 · Manual"
    url: https://docs.unity3d.com/Packages/com.unity.multiplayer.playmode@1.6/manual/index.html
---

Todo lo que has comprobado en este curso lo has comprobado con los dos jugadores
en la misma máquina. Los datos tardaban menos de un milisegundo, llegaban todos
y llegaban en orden. Ningún jugador real tendrá esa red.

## Las tres formas de una mala red

::: natural
Una conexión real falla de tres maneras, y cada una rompe cosas distintas:

- **Retraso.** Los datos tardan. Tu coche responde al instante, pero el del otro
  va por detrás, y cuanto más rápido vais, más lejos está de donde lo ves.
- **Variación.** No tardan siempre lo mismo. Un dato llega en 20 milisegundos y
  el siguiente en 100. Los movimientos que deberían ser suaves van a tirones.
- **Pérdida.** Algunos datos no llegan nunca.
:::

::: tecnico
Son la latencia, el *jitter* y la pérdida de paquetes. Los paquetes viajan de
forma independiente y pueden seguir rutas distintas, así que también pueden
llegar desordenados.

La interpolación del `NetworkTransform` existe para absorber la variación:
mantiene las copias un poco en el pasado para tener siempre dos datos entre los
que moverse. Es el tick de retraso extra de la figura de la lección 0.1.
:::

## Fiable o no fiable

La pérdida conecta con una opción de los RPC que hasta ahora no hacía falta
mirar.

::: natural
Un mensaje **fiable** se reenvía hasta que llega. Nunca se pierde, pero si uno
se atasca, los que van detrás esperan.

Uno **no fiable** se envía una vez. Si se pierde, se perdió, y nadie espera por
él.
:::

::: tecnico
El atributo `[Rpc]` tiene un campo `Delivery`, con `RpcDelivery.Reliable` por
defecto y `RpcDelivery.Unreliable` como alternativa. Con entrega fiable y
pérdida de paquetes, la retransmisión introduce esperas que afectan a los
mensajes encolados detrás.
:::

| El mensaje es | Entrega |
|---|---|
| «He cruzado la meta», «estoy listo» | Fiable: perderlo rompe la partida |
| Un claxon, una chispa, un sonido de paso | No fiable: si se pierde, nadie lo echa de menos |

::: clave
La pregunta es la del autor: **¿pasa algo si este mensaje no llega?** Si la
respuesta es no, hacerlo fiable solo añade esperas cuando la red va mal.
:::

## Estropear la red a propósito

::: natural
No hace falta una mala conexión para probar con una. Hay una herramienta que
retiene, desordena y tira los datos antes de enviarlos, según lo que le pidas.
:::

::: tecnico
El simulador de red aplica latencia, variación y pérdida a los paquetes del
transporte. Solo actúa en el editor y en builds de desarrollo, nunca en un build
final.
:::

::: hoy
En el vídeo es una sección del componente de transporte, el *Debug Simulator*,
con tres campos. En tu versión es un componente aparte, **Network Simulator**,
del paquete Multiplayer Tools 2.2.12 que tienes instalado. Trae perfiles ya
hechos con nombre, como banda ancha doméstica, satélite o distintas generaciones
de red móvil, además de valores a mano.

El autor prueba con 50 ms de retraso, 50 de variación y un 10 % de pérdida, y lo
describe como una conexión bastante mala.
:::

::: ojo
No hay valores correctos universales. Un juego por turnos funciona con medio
segundo de retraso; uno de carreras se resiente con mucho menos. Lo que se
busca al simular no es que todo vaya perfecto, sino descubrir **qué se rompe
primero** y decidir si importa.
:::

## Medir

Tres herramientas, tres preguntas distintas:

| Pregunta | Herramienta |
|---|---|
| ¿Cuánto estoy enviando ahora mismo? | El monitor de estadísticas en pantalla, dentro del juego |
| ¿Qué objeto o qué mensaje gasta más? | El perfilador de Unity, en sus módulos de red |
| ¿Qué ha pasado y en qué orden? | Los logs, uno por jugador |

::: natural
El monitor es un panel sobre el juego con contadores: bytes enviados y
recibidos, número de RPC, y lo que quieras añadir. Sirve para ver de un vistazo
si algo se dispara, por ejemplo al aparecer el tráfico.
:::

::: tecnico
`RuntimeNetStatsMonitor` es un componente de Multiplayer Tools que dibuja
gráficas y contadores en ejecución. El perfilador desglosa el tráfico por
objeto de red y por tipo de mensaje, fotograma a fotograma, y es donde se
encuentra una NetworkVariable que cambia más de la cuenta o un RPC enviado en
cada `Update`.
:::

## Un jugador

::: natural
Si el diseño lo permite, un juego multijugador debería poder jugarse sin red:
sin sesión, sin servicios, sin internet. El autor lo defiende y lo añade al
final.

Lo interesante es cómo: **no reescribe nada**. Un jugador solo es un anfitrión
al que no se une nadie.
:::

::: tecnico
El modo de un jugador arranca el NetworkManager como anfitrión con el transporte
apuntando a la dirección local, y limita el aforo a uno. Todo el código de red
sigue ejecutándose: `IsServer` e `IsOwner` valen verdadero, los RPC se entregan
en el mismo proceso, y las NetworkVariable funcionan. No hace falta ningún
servicio en la nube.

El menú ofrece dos botones. El de un jugador salta la sala y la selección.
:::

::: clave
Es la recompensa de haber puesto bien las guardas durante todo el curso. Si cada
decisión está tras `IsServer` y cada entrada de teclado tras `IsOwner`, el juego
de un jugador sale gratis, porque el anfitrión cumple las dos.
:::

## El cierre del vídeo

Los últimos capítulos prueban el juego con mando y repasan el resultado. No
traen técnica nueva. Sí una idea que el autor repite desde el principio y que
vale como resumen del curso:

- **¿Dónde se decide?** En el servidor, o en el dueño si se lo has prestado.
- **¿Es un suceso o un estado?** RPC o NetworkVariable.
- **¿Lo tiene que ver todo el mundo?** Si no, no lo sincronices.
- **¿Qué pasa con quien llega tarde, y con quien se va?**

Con esas cuatro preguntas se sincroniza cualquier mecánica nueva.

::: vocabulario
Latencia
: El tiempo que tarda un dato en llegar.

Variación (*jitter*)
: Cuánto cambia esa latencia de un dato al siguiente.

Pérdida de paquetes
: El porcentaje de datos que no llegan.

Entrega fiable
: El mensaje se reenvía hasta confirmar que llegó.
:::

En el último laboratorio le pones a tu juego una mala conexión y repites los
experimentos de todo el curso para ver qué aguanta.
