---
modulo: 2
leccion: 1
tipo: concepto
titulo: "RPC y lógica de servidor"
resumen: "Cómo se le dice algo a otra máquina, y cómo se consigue que un trozo de código corra en una sola. Las dos herramientas con las que el vídeo sincroniza casi todo el juego."
duracion: 25
objetivos:
  - Distinguir el código que debe correr en todas las máquinas del que debe correr solo en el servidor
  - Escribir un RPC hacia el servidor y otro del servidor hacia todos, con la sintaxis de tu versión
  - Explicar por qué no se puede enviar un ScriptableObject por la red y qué se envía en su lugar
  - Reconocer el problema del singleton del jugador y su arreglo
video:
  - titulo: "Sync Delivery Manager"
    inicio: "00:59:11"
    fin: "01:14:12"
  - titulo: "Fix Selected Counter Visual"
    inicio: "01:14:12"
    fin: "01:20:20"
fuentes:
  - titulo: "RPC"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/message-system/rpc.html
  - titulo: "RPC params"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/message-system/rpc-params.html
  - titulo: "RPC vs NetworkVariable"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/learn/rpcvnetvar.html
  - titulo: "Serialization"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/serialization/serialization-overview.html
---

El `DeliveryManager` de *Kitchen Chaos* es el script que genera los pedidos y
comprueba si lo que entregas coincide con alguno. En un jugador es trivial. En
red plantea las dos preguntas de esta lección.

## El problema: cada máquina genera sus propios pedidos

El `DeliveryManager` tiene un temporizador y, cuando vence, elige una receta **al
azar**. Ese código corre en todas las máquinas, así que cada una elige una
receta distinta. Dos jugadores en la misma cocina ven listas de pedidos
diferentes.

::: natural
Lo aleatorio, lo que crea cosas y lo que decide quién gana tiene que pasar en
**un solo sitio**. Si pasa en todos, cada máquina vive una partida distinta.

Ese sitio es el servidor. Él decide y luego avisa a los demás de lo que ha
decidido.
:::

::: tecnico
La lógica autoritativa se protege con una guarda al principio del método:

```csharp
if (!IsServer) return;
```

Lo que queda después solo se ejecuta en la instancia del servidor. El resultado
se propaga a los clientes con un RPC o con una `NetworkVariable`.
:::

## RPC: ejecutar un método en otra máquina

::: natural
Un RPC es una llamada a un método que no se ejecuta donde la escribes, sino en
otra máquina. Tú llamas a `Tocar()` aquí y `Tocar()` se ejecuta allí.

Hay dos direcciones que se usan a todas horas:

- **Hacia el servidor**: «quiero hacer esto». Lo usa un cliente para pedir algo.
- **Del servidor hacia todos**: «ha pasado esto». Lo usa el servidor para avisar.
:::

::: tecnico
Un RPC es un método de un `NetworkBehaviour` marcado con el atributo `[Rpc]`,
que recibe como argumento a quién se envía. Netcode genera el código que
serializa los parámetros, los envía y los invoca en el destino sobre la copia
del mismo objeto.

```csharp
[Rpc(SendTo.Server)]
private void PedirEntregaRpc(int indiceReceta) { /* corre en el servidor */ }

[Rpc(SendTo.ClientsAndHost)]
private void EntregaCorrectaRpc() { /* corre en todas las máquinas con jugador */ }
```

El nombre del método tiene que terminar en `Rpc`: el compilador de Netcode da
error si no.
:::

::: hoy
El vídeo usa dos atributos distintos, `[ServerRpc]` y `[ClientRpc]`, con nombres
terminados en `ServerRpc` y `ClientRpc`. Siguen existiendo en tu versión, pero
hay uno solo que los cubre a los dos y a más destinos:

| En el vídeo | En tu versión |
|---|---|
| `[ServerRpc]` | `[Rpc(SendTo.Server)]` |
| `[ClientRpc]` | `[Rpc(SendTo.ClientsAndHost)]` |
| `[ServerRpc(RequireOwnership = false)]` | `[Rpc(SendTo.Server)]`, sin más |

La tercera fila importa. Un `[ServerRpc]` antiguo solo lo puede invocar el dueño
del objeto, y por eso el autor escribe `RequireOwnership = false` cada vez que
un jugador llama a un objeto que no es suyo. El `[Rpc]` nuevo lo puede invocar
cualquiera por defecto. Para restringirlo se usa
`InvokePermission = RpcInvokePermission.Owner`. `RequireOwnership` está marcado
como obsoleto.
:::

Los destinos que más vas a usar:

| Destino | Dónde se ejecuta |
|---|---|
| `SendTo.Server` | Solo en el servidor |
| `SendTo.ClientsAndHost` | En todas las máquinas con jugador |
| `SendTo.Everyone` | En todas, incluido un servidor dedicado |
| `SendTo.NotOwner` | En todas menos la del dueño del objeto |
| `SendTo.Owner` | Solo en la del dueño |

## El patrón de ida y vuelta

Entregar un plato en el vídeo queda así, y el mismo dibujo se repite en casi
todos los mostradores:

```text
  CLIENTE                    SERVIDOR                     TODOS
  ───────                    ────────                     ─────
  pulsa «entregar»
        │
        └── RPC al servidor ──▶ comprueba la receta
                                 decide: correcta
                                      │
                                      └── RPC a todos ──▶ quitan el pedido
                                                          de la lista y
                                                          suena el acierto
```

::: figura el-aviso
:::

Pulsa en uno de los dos puestos. La cápsula no va de un puesto al otro: sube a
la caja, y de la caja baja a los dos.

::: clave
El cliente no cambia nada por su cuenta: **pide**. El servidor decide y
**avisa**. Lo que cambia la partida ocurre en el aviso, que se ejecuta en todas
las máquinas a la vez, incluida la del que pidió.
:::

## Lo que no cabe en un RPC

::: natural
Un RPC viaja por un cable. Solo puedes meter datos: números, textos cortos,
vectores. No puedes meter «esa receta de ahí», porque esa receta es un objeto
que vive en la memoria de tu máquina y en la otra no significa nada.
:::

::: tecnico
Los parámetros de un RPC deben ser serializables por Netcode: primitivos,
enumerados, tipos de Unity como `Vector3`, estructuras que implementen
`INetworkSerializable` y referencias de red como `NetworkObjectReference`. Una
referencia a un `ScriptableObject` o a un `MonoBehaviour` no lo es.
:::

El autor se topa con esto al enviar la receta elegida. Su solución es la
estándar: todas las máquinas tienen la misma lista de recetas en el mismo orden,
así que el servidor envía **la posición en la lista**, un `int`, y cada cliente
busca la receta en su copia.

::: ojo
Un RPC es un aviso de un instante. Quien se conecta después no lo recibe. Si un
jugador entra con la partida empezada, no sabrá qué pedidos hay, porque los
avisos de esos pedidos ya pasaron. El autor lo deja pendiente a propósito y
vuelve a ello en el módulo 6.
:::

## El jugador ya no es único

El segundo capítulo arregla algo que rompe en cuanto hay dos jugadores. El juego
resaltaba el mostrador que el jugador tiene delante usando `Player.Instance`, un
singleton. Con dos jugadores no hay «el» jugador.

El arreglo tiene dos partes:

1. El singleton pasa a ser `LocalInstance`, y solo lo asigna la copia que es
   dueña, dentro de `OnNetworkSpawn`.
2. Como el jugador aparece más tarde que la escena, los mostradores no pueden
   suscribirse a él en su `Start`. El jugador lanza un evento estático al
   aparecer, y quien lo necesite se engancha entonces.

Tú resolviste el mismo problema con la cámara, por el otro lado: en vez de que
la cámara espere un evento, el coche propio la busca al aparecer con
`FindFirstObjectByType` y se le presenta. Las dos formas responden a lo mismo:
el objeto de la escena y el del jugador no nacen a la vez.

::: vocabulario
RPC
: Llamada a un método que se ejecuta en otra máquina. Es un aviso puntual.

Lógica de servidor
: Código que solo debe ejecutarse en la instancia del servidor, protegido con
  `if (!IsServer) return;`.

Serializar
: Convertir un dato en bytes para enviarlo, y reconstruirlo al llegar.
:::

En el laboratorio escribes tu primer RPC, un claxon, y pones el tráfico bajo la
guarda del servidor para ver qué pasa cuando solo él decide.
