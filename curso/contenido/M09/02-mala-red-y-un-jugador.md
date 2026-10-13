---
modulo: 9
leccion: 2
tipo: lab
verificado: false
titulo: "Mala red y un jugador"
resumen: "El examen final de tu juego: ponerle una conexión mala, repetir los experimentos de todo el curso, medir lo que envía y dejarlo jugable sin red."
duracion: 90
objetivos:
  - Simular latencia, variación y pérdida sobre tu juego
  - Identificar qué mecánica se degrada primero con mala red
  - Medir cuánto envía tu juego y encontrar qué gasta más
  - Arrancar la partida sin sesión ni servicios
fuentes:
  - titulo: "Multiplayer Tools 2.2 · Manual"
    url: https://docs.unity3d.com/Packages/com.unity.multiplayer.tools@2.2/manual/index.html
  - titulo: "Dealing with latency"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/learn/dealing-with-latency.html
  - titulo: "RPC"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/message-system/rpc.html
---

No añades ninguna mecánica. Miras con otros ojos las que ya tienes. Lo que salga
de aquí es una lista de lo que tu juego aguanta y lo que no, y eso es el
verdadero final del curso.

::: prerrequisitos
- [ ] El juego con carrera, tráfico en red y volante sincronizado
- [ ] La lección 9.1 leída
- [ ] Un commit limpio antes de empezar
:::

:::: paso Medir primero en buena red

Añade a la escena de la partida un objeto con el componente
**RuntimeNetStatsMonitor**. Juega una carrera con dos jugadores y apunta los
valores de envío y recepción en tres momentos: en la espera, en plena carrera
sin tráfico cerca, y con varios camiones en pantalla.

::: porque
Sin una medida de partida no sabrás si algo que cambies después lo mejora o lo
empeora. Y es la primera vez que ves cuánto cuesta cada cosa que has
sincronizado.
:::

::: esperado
Un panel sobre el juego con gráficas. Tres apuntes en tus notas. Lo esperable es
que el envío suba con el número de camiones, porque cada uno lleva un
`NetworkTransform`.
:::
::::

:::: paso Encontrar qué gasta más

Abre **Window → Analysis → Profiler**, busca los módulos de red y graba una
carrera. Localiza el objeto o el mensaje que más bytes mueve.

::: porque
El monitor dice cuánto. El perfilador dice quién. Las optimizaciones que no
empiezan por aquí suelen arreglar lo que no era el problema.
:::

::: esperado
Una respuesta concreta en tus notas: qué objeto, cuántos bytes por fotograma.
Los candidatos son el `NetworkTransform` de los camiones y tu NetworkVariable
del volante.
:::
::::

:::: paso Estropear la red

Añade el componente **Network Simulator** al objeto del NetworkManager y elige
un perfil de conexión doméstica mala. Juega una carrera con dos jugadores.

::: porque
Hasta ahora los datos tardaban menos de un milisegundo. Este es el primer
momento del curso en el que tu juego se parece a lo que vivirá un jugador real.
:::

::: esperado
El coche del otro jugador va más retrasado, y su movimiento es menos suave. Tu
propio coche responde igual que siempre: tienes la autoridad sobre él y no
depende de la red.
:::
::::

:::: paso Repetir los experimentos del curso

Con la red estropeada, repite uno a uno y anota en una tabla qué cambia:

| Experimento | Laboratorio | Con mala red |
|---|---|---|
| Conducir y mirar la copia en la otra ventana | 0.2 | |
| Tocar el claxon | 2.2 | |
| Ver aparecer y moverse los camiones | 3.2 | |
| Girar el volante con el coche parado | 4.2 | |
| Chocar dos coches | 4.2 | |
| La cuenta atrás, en las dos ventanas | 5.2 | |
| Elegir vehículo y pulsar listo | 7.2 | |

::: porque
Cada mecánica usa una herramienta distinta, y cada herramienta se degrada de una
forma. Verlas una al lado de otra bajo la misma red mala es lo que fija cuándo
usar cada una.
:::

::: esperado
Lo que dice la teoría, y que tu tabla tiene que confirmar o corregir:

- Lo que va por NetworkVariable llega tarde pero llega bien.
- Lo que va por RPC fiable llega tarde, y con pérdida puede llegar a ráfagas.
- Los choques son lo que peor queda: cada máquina choca contra una copia que
  está todavía más lejos de la real.
:::
::::

:::: paso Subir la apuesta

Cambia a un perfil de red móvil antigua, o pon valores a mano parecidos a los
del vídeo: 50 ms de retraso, 50 de variación y 10 % de pérdida. Repite solo los
experimentos que antes aguantaron bien.

::: porque
Buscar el punto en el que algo deja de funcionar dice más que comprobar que
funciona en un caso.
:::

::: esperado
Una frase en tus notas por cada mecánica: «aguanta hasta aquí» o «se rompe a
partir de aquí».
:::
::::

:::: paso Un RPC que puede perderse

El claxon es un aviso que a nadie le importa perder. Cambia su entrega a no
fiable:

```csharp
[Rpc(SendTo.Everyone, Delivery = RpcDelivery.Unreliable)]
```

Con el 10 % de pérdida, tócalo veinte veces y cuenta cuántas suena en la otra
ventana.

::: porque
Es la decisión de la lección 9.1 aplicada. Y contarlo convierte «puede perderse»
en un número.
:::

::: esperado
Suena en la otra ventana menos de veinte veces, en torno a las que deja pasar la
pérdida que hayas configurado. Decide si te vale y déjalo como prefieras.
:::
::::

:::: paso Jugar sin red

Añade al menú un botón de un jugador que arranque la partida sin crear ninguna
sesión: `NetworkManager.Singleton.StartHost()` directamente, y cargar la escena
de la partida.

Antes de pulsarlo, desconecta el ordenador de internet.

::: porque
Un jugador solo es un anfitrión sin clientes. Si tus guardas están bien puestas,
todo el juego funciona sin tocar nada. Si algo falla aquí, has encontrado un
sitio donde el código daba por hecho que había servicios o un segundo jugador.
:::

::: esperado
Sin internet: el coche aparece, hay tráfico, la carrera arranca al pulsar
«listo» y termina con el tiempo. Cada cosa que no funcione es un hallazgo.
Apúntalo con el motivo.
:::
::::

:::: paso Quitar lo que no debe salir

Desactiva el simulador de red y el monitor de estadísticas, o déjalos en un
objeto que solo exista en el editor.

::: porque
El simulador no actúa en un build final, pero un monitor de estadísticas a la
vista de los jugadores no es lo que quieres enseñar.
:::

::: esperado
El juego vuelve a comportarse como al principio del laboratorio.
:::
::::

::: verificar
- [ ] Tengo medidas de envío en buena red, antes de tocar nada
- [ ] Sé qué objeto o mensaje gasta más ancho de banda
- [ ] He rellenado la tabla de experimentos con mala red
- [ ] He decidido si el claxon es fiable o no, con un número delante
- [ ] El juego arranca y se puede terminar una carrera sin internet
:::

::: problema No encuentro los componentes Network Simulator ni RuntimeNetStatsMonitor
Pertenecen al paquete Multiplayer Tools. Comprueba en el Package Manager que
sigue instalado; en tu `manifest.json` figura la versión 2.2.12.
:::

::: problema El simulador no parece hacer nada
Comprueba que está en el mismo objeto que el NetworkManager y su transporte, y
que el perfil elegido no es el vacío. Solo actúa en el editor y en builds de
desarrollo.
:::

::: problema En un jugador no aparece el coche
Si quitaste el `PlayerPrefab` en el módulo 7, el coche lo crea tu código al
cargar la escena de partida. El botón de un jugador tiene que pasar por el mismo
camino, o crear el vehículo él.
:::

::: problema En un jugador sale un error de servicios
Algún script inicializa los servicios o consulta la sesión al arrancar. En el
modo de un jugador no hay ni lo uno ni lo otro: esa llamada tiene que quedar
solo en el camino multijugador.
:::

## Y ahora

Has recorrido el vídeo entero. Tu juego tiene movimiento, tráfico, estado de
partida, selección, sesiones por internet y un modo sin red, y de cada pieza
sabes por qué está hecha así.

Lo que queda es tu backlog. Los issues abiertos del repositorio son un buen
siguiente paso, y varios han cambiado de forma al añadir la red: el pool de
camiones, el estado al reciclarlos, y lo que hayas decidido sobre los choques.
