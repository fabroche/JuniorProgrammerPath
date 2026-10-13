---
modulo: 2
leccion: 2
tipo: lab
verificado: false
titulo: "El claxon y el tráfico"
resumen: "Tu primer RPC, de ida y vuelta, y la primera lógica que solo corre en el servidor. Termina con el tráfico visible solo para el anfitrión, a propósito."
duracion: 60
objetivos:
  - Escribir un RPC hacia el servidor y otro del servidor hacia todos
  - Comprobar en la consola de cada jugador dónde se ejecuta cada método
  - Poner el generador de tráfico bajo una guarda de servidor
  - Ver con tus ojos por qué decidir en el servidor no basta para que los demás lo vean
fuentes:
  - titulo: "RPC"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/message-system/rpc.html
  - titulo: "RPC params"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/message-system/rpc-params.html
  - titulo: "NetworkBehaviour"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkbehaviour.html
---

Dos partes. La primera es un claxon: pequeño, sin consecuencias, y con el
recorrido completo de un RPC. La segunda toca el tráfico y deja el juego a
medias de forma deliberada: el módulo 3 lo termina.

::: prerrequisitos
- [ ] El banco de la lección 0.2 funcionando
- [ ] La lección 2.1 leída
- [ ] Un commit limpio antes de empezar
:::

::: ojo
Tu copia de trabajo tiene `CarWithWheelsSpawn.cs` modificado sin confirmar: la
clase se llama `c` en vez de `CarWithWheelsSpawn`. Parece una tecla suelta.
Revísalo antes de empezar la segunda parte, porque el nombre de la clase tiene
que coincidir con el del fichero para que Unity conserve el componente.
:::

## Primera parte: el claxon

:::: paso Crear el script del claxon

Crea `Assets/Scripts/Multiplayer/VehicleHorn.cs`. Tiene que heredar de
`NetworkBehaviour` y leer una tecla **solo en la copia del dueño**.

```csharp
using Unity.Netcode;
using UnityEngine;
using UnityEngine.InputSystem;

namespace Multiplayer
{
    public class VehicleHorn : NetworkBehaviour
    {
        private void Update()
        {
            if (!IsOwner) return;
            if (Keyboard.current == null) return;
            if (!Keyboard.current.hKey.wasPressedThisFrame) return;

            // aquí va la llamada del paso siguiente
        }
    }
}
```

Añádelo al prefab `Vehicle_NetworkObject`.

::: porque
El `Update` corre en todas las copias del coche. Sin la guarda de `IsOwner`,
pulsar la tecla haría sonar el claxon de todos los coches que hay en tu máquina,
que es el mismo fallo de los dos jugadores obedeciendo a un teclado.
:::

::: esperado
El proyecto compila. Todavía no pasa nada al pulsar H.
:::
::::

:::: paso Pedírselo al servidor

Escribe un método marcado con `[Rpc(SendTo.Server)]` que de momento solo deje un
log, y llámalo desde el `Update`.

```csharp
[Rpc(SendTo.Server)]
private void PedirClaxonRpc()
{
    Debug.Log($"[servidor] el coche de {OwnerClientId} pide tocar el claxon");
}
```

::: porque
Es la mitad de ida del patrón. El cliente no hace sonar nada: se lo pide al
servidor. Hacerlo en dos pasos te deja ver cada tramo por separado en la
consola.
:::

::: esperado
Pulsa H en la ventana del **cliente**. El log aparece en la consola del
**anfitrión**, no en la del cliente.

Pulsa H en la ventana del anfitrión. El log aparece también en la suya: el
anfitrión es el servidor, así que el RPC se ejecuta ahí mismo.
:::
::::

:::: paso Que el servidor avise a todos

Escribe el segundo método, con `[Rpc(SendTo.ClientsAndHost)]`, y llámalo desde
el primero.

```csharp
[Rpc(SendTo.ClientsAndHost)]
private void TocarClaxonRpc()
{
    Debug.Log($"[{NetworkManager.LocalClientId}] suena el claxon del coche de {OwnerClientId}");
}
```

::: porque
Es la mitad de vuelta. El servidor es el único que habla con todos, así que el
aviso sale de él. Fíjate en que el método se ejecuta sobre **la copia de ese
mismo coche** en cada máquina: por eso `OwnerClientId` vale lo mismo en todas y
`LocalClientId` cambia.
:::

::: esperado
Al pulsar H en cualquiera de las dos ventanas, aparece una línea en **las dos**
consolas. El número entre corchetes es distinto en cada una; el del coche es el
mismo.
:::
::::

:::: paso Darle un efecto que se vea

Sustituye el log del segundo método por algo perceptible. Lo más simple, sin
buscar un sonido: un `AudioSource` con cualquier clip, o agrandar el coche un
instante.

::: porque
Un RPC sirve para avisos de un instante: un sonido, una chispa, una animación de
golpe. Es exactamente el uso que el vídeo le da a los RPC de «entrega correcta».
:::

::: esperado
El efecto se ve o se oye en las dos ventanas, sobre el coche correcto en cada
una.
:::
::::

:::: paso El atajo

Ahora que has visto los dos tramos, prueba a quitar el método del servidor y
dejar uno solo con `[Rpc(SendTo.Everyone)]`, llamado directamente desde el
`Update`.

::: porque
En tu versión un cliente puede dirigir un RPC a todos; Netcode lo encamina por
el servidor sin que tú escribas el salto. Es más corto, y pierde algo: el
servidor ya no tiene ocasión de decir que no. Para un claxon da igual. Para
«he ganado la carrera» no.
:::

::: esperado
Mismo comportamiento que antes, con un método menos. Decide cuál de las dos
versiones dejas y apunta por qué.
:::
::::

## Segunda parte: el tráfico

:::: paso Ver el problema antes de arreglarlo

Sin cambiar nada, entra en Play con dos jugadores y mira el tráfico de los
camiones en las dos ventanas.

Responde: ¿los camiones de una ventana son los mismos que los de la otra? ¿Qué
pasaría si su posición o su carril salieran de un `Random`?

::: porque
Tu generador es un `MonoBehaviour` sin red. Cada máquina ejecuta el suyo, así
que hay dos tráficos independientes que por casualidad se parecen. Es el
`DeliveryManager` del vídeo generando recetas distintas en cada máquina.
:::

::: esperado
Hay camiones en las dos ventanas, pero ninguno es un objeto de red: no tienen
`NetworkObject` y no existen fuera de la máquina que los creó. Si chocas con uno
en tu ventana, en la otra tu coche choca con algo que allí puede no estar.
:::
::::

:::: paso Que solo genere el servidor

En el generador, haz que `FixedUpdate` no saque camiones salvo que esta máquina
sea el servidor.

El generador no es un `NetworkBehaviour`, así que no tiene `IsServer`. Puedes
preguntárselo al `NetworkManager`:

```csharp
NetworkManager manager = NetworkManager.Singleton;
if (manager == null || !manager.IsServer) return;
```

::: porque
Es la guarda de servidor de la lección 2.1. Lo que crea cosas tiene que pasar en
un solo sitio. Preguntar al singleton te evita convertir el pool entero en
`NetworkBehaviour` solo para saber en qué máquina estás.
:::

::: esperado
- En la ventana del anfitrión hay tráfico.
- En la ventana del cliente **no hay ningún camión**.
- Antes de crear la sesión tampoco hay tráfico en ninguna: sin sesión nadie es
  servidor.
:::
::::

:::: paso Entender por qué el cliente no ve nada

No lo arregles todavía. Responde en tus notas:

1. El servidor ya decide el tráfico. ¿Qué le falta para que el cliente lo vea?
2. ¿Serviría un RPC que dijera «he sacado un camión»? ¿Qué le pasaría a un
   jugador que entrara un minuto después?

::: porque
Decidir en el servidor es la mitad del trabajo. La otra mitad es que el
resultado exista en las demás máquinas, y para objetos enteros eso no se hace
con RPC sino haciéndolos aparecer en red. Es el módulo 3.
:::

::: esperado
1. Que los camiones sean objetos de red: prefab con `NetworkObject`, registrado,
   y creado por el servidor con `Spawn`.
2. Un RPC serviría para los que están conectados en ese momento. El que llega
   tarde se perdería todos los camiones anteriores.
:::
::::

::: verificar
- [ ] Al pulsar H en el cliente, el primer log sale en la consola del anfitrión
- [ ] El efecto del claxon se percibe en las dos ventanas
- [ ] Sé explicar qué pierdo con `SendTo.Everyone` frente a los dos pasos
- [ ] El tráfico solo existe en la ventana del anfitrión, y sé por qué
:::

::: problema Error de compilación: Rpc method must end with 'Rpc' suffix
El nombre del método marcado con `[Rpc]` tiene que terminar en `Rpc`. Es una
comprobación del compilador de Netcode.
:::

::: problema Pulso H y no sale ningún log
Comprueba que el script está en el prefab que usa el NetworkManager como
jugador, que hereda de `NetworkBehaviour` y no de `MonoBehaviour`, y que la
ventana en la que pulsas tiene el foco.
:::

::: problema El tráfico desaparece también en el anfitrión
La guarda se evalúa antes de que exista la sesión. Comprueba que has creado la
sesión, y que la condición es `!manager.IsServer` y no `!manager.IsClient`.
:::

::: nota
El juego queda a medias al terminar: el cliente conduce por una carretera vacía.
Déjalo así, en su rama. El laboratorio 3.2 empieza exactamente aquí.
:::
