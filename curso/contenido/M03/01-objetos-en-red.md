---
modulo: 3
leccion: 1
tipo: concepto
titulo: "Objetos en red: aparecer, desaparecer, emparentar"
resumen: "Cómo se crea algo que todos ven, quién puede hacerlo, cómo se refiere una máquina a un objeto de otra, y por qué emparentar objetos de red tiene reglas propias."
duracion: 30
objetivos:
  - Explicar por qué solo el servidor puede crear y destruir objetos de red
  - Describir los tres pasos de hacer aparecer un objeto para todos
  - Usar una referencia de red para nombrar un objeto en un RPC
  - Conocer la restricción de emparentado y la salida que usa el vídeo
video:
  - titulo: "Sync Pick up Objects"
    inicio: "01:20:20"
    fin: "01:35:04"
  - titulo: "Sync Kitchen Object Parent"
    inicio: "01:35:04"
    fin: "01:50:21"
  - titulo: "Sync Plates Counter"
    inicio: "01:50:21"
    fin: "01:53:39"
  - titulo: "Sync Trash Counter"
    inicio: "01:53:39"
    fin: "02:01:20"
fuentes:
  - titulo: "Object spawning"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/object-spawning.html
  - titulo: "NetworkObject"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkobject.html
  - titulo: "NetworkObject parenting"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/networkobject-parenting.html
  - titulo: "NetworkObject serialization"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/serialization/networkobject-serialization.html
  - titulo: "Object pooling"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/object-pooling.html
---

Hasta aquí el único objeto de red era el jugador, y lo creaba el NetworkManager
solo. En estos cuatro capítulos el juego empieza a crear cosas en plena partida:
un tomate al cogerlo de un contenedor, un plato cada pocos segundos. Cada una
tiene que existir en todas las máquinas.

## `Instantiate` ya no basta

::: natural
`Instantiate` crea un objeto en la máquina donde se ejecuta, y en ninguna más.
Si un cliente lo llama, solo él ve el tomate.

Para que lo vean todos hay que pedirle al servidor que lo cree, y que el
servidor lo **publique**. A publicar un objeto en la red se le llama hacerlo
aparecer, *spawn*.
:::

::: tecnico
Crear un objeto de red son tres pasos, y los tres ocurren en el servidor:

```csharp
GameObject instancia = Instantiate(prefab);
NetworkObject objetoDeRed = instancia.GetComponent<NetworkObject>();
objetoDeRed.Spawn();
```

`Spawn()` asigna el identificador de red y envía a cada cliente la orden de
instanciar ese mismo prefab. El prefab tiene que llevar `NetworkObject` y estar
en la lista de prefabs de red. Un cliente que llame a `Spawn()` recibe un error:
no tiene autoridad para crear.
:::

::: figura la-prensa
:::

Pulsa para que el servidor cree el objeto, y otra vez para que lo retire. Los
puestos no tienen pulsador: no pueden crear nada por su cuenta.

Como quien coge el tomate puede ser un cliente, el vídeo vuelve al patrón de ida
y vuelta del módulo 2:

```text
  CLIENTE                         SERVIDOR
  ───────                         ────────
  interactúa con el contenedor
        │
        └── RPC: «quiero un tomate» ──▶ Instantiate + Spawn
                                              │
                                    Netcode lo crea en todas
```

## Nombrar un objeto de otra máquina

El RPC «quiero un tomate, y dámelo a mí» necesita dos datos que no caben tal
cual: qué tipo de objeto, y quién lo va a sujetar.

::: natural
- El **tipo** es un ScriptableObject. Como en el módulo 2, se envía su posición
  en una lista que todas las máquinas tienen igual.
- El **quién** es un objeto que ya está en la red. De esos sí se puede hablar:
  cada uno tiene un número que es el mismo en todas las máquinas.
:::

::: tecnico
`NetworkObjectReference` es una estructura serializable que envuelve el
identificador de red de un `NetworkObject`. Se construye a partir del objeto y
se resuelve en destino:

```csharp
[Rpc(SendTo.Server)]
private void PedirObjetoRpc(int indiceTipo, NetworkObjectReference quien)
{
    if (!quien.TryGet(out NetworkObject destinatario)) return;
    // ...
}
```

`TryGet` devuelve `false` si el objeto ya no existe en esta máquina, cosa
posible: entre el envío y la llegada puede haber sido destruido.
:::

## Destruir también es cosa del servidor

La papelera del vídeo destruye lo que le eches. La regla es simétrica a la de
crear: solo el servidor retira un objeto de la red.

::: natural
Un cliente no borra un objeto de red: le pide al servidor que lo haga. El
servidor lo quita y desaparece en todas las máquinas a la vez.
:::

::: tecnico
`NetworkObject.Despawn(bool destroy = true)` retira el objeto de la red en todos
los clientes. Con `destroy` en `true`, además destruye el GameObject. Con
`false`, el objeto sigue existiendo en el servidor, fuera de la red, y puede
volver a publicarse con `Spawn()`: es la base de un pool en red.

Llamar a `Destroy` sobre un objeto de red desde un cliente es un error.
:::

::: ojo
El autor añade un detalle fácil de pasar por alto. Antes de destruir el objeto,
el servidor envía un RPC a todos para que **suelten la referencia**: el
mostrador y el jugador guardan «tengo este objeto», y si el objeto desaparece
sin avisar se quedan apuntando a algo que ya no existe.
:::

## Emparentar: la restricción que cambia el diseño

En un jugador, coger un tomate era hacerlo hijo de un punto de la mano del
personaje. En red eso falla, y es el capítulo más largo del módulo.

::: natural
Un objeto de red solo puede colgar de **otro objeto de red**, y directamente de
él. El punto de la mano es un hijo cualquiera del jugador, sin identidad en la
red, así que el tomate no puede colgar de ahí.
:::

::: tecnico
El padre de un `NetworkObject` debe ser otro `NetworkObject` ya publicado, o
ninguno. No se admite como padre un transform hijo que no tenga su propio
`NetworkObject`. El cambio de padre lo hace el servidor, o el dueño si el objeto
tiene activado `AllowOwnerToParent`, con `TrySetParent`.
:::

El autor no pelea con la restricción: **deja de emparentar**. El tomate se queda
suelto en la escena y lleva un script que, en cada `LateUpdate`, copia la
posición y la rotación del punto que debe seguir. Quién sigue a quién se decide
con un RPC a todos, que lleva una referencia de red al jugador o al mostrador.

::: clave
Cuando una regla de la red choca con cómo lo hacías en un jugador, a menudo lo
más barato no es buscar la forma de cumplir la regla, sino cambiar el diseño
para no necesitarla. «Seguir a» sustituye a «ser hijo de», y funciona igual en
todas las máquinas porque cada una lo calcula por su cuenta.
:::

## Crear con un temporizador

El mostrador de platos saca uno cada pocos segundos. Es el `DeliveryManager`
otra vez: el temporizador corre solo en el servidor, y un RPC avisa a todos de
que hay un plato más para que lo dibujen.

Ahí los platos visibles no son objetos de red: son un dibujo que cada máquina
hace al recibir el aviso. Solo se crea un plato de verdad cuando alguien lo
coge.

::: clave
No todo lo que se ve tiene que ser un objeto de red. Un objeto de red cuesta:
identificador, mensajes, sincronización. Lo que es decoración derivada de un
dato puede dibujarlo cada máquina sola.
:::

::: vocabulario
Hacer aparecer (*spawn*)
: Publicar un objeto ya instanciado para que exista en todas las máquinas.

Retirar (*despawn*)
: Quitarlo de la red. Puede destruirlo o dejarlo vivo en el servidor.

Referencia de red
: Un dato serializable que identifica un objeto de red, para nombrarlo en un RPC.

Prefab de red
: Prefab con `NetworkObject`, registrado en la lista que comparten las máquinas.
:::

En el laboratorio conviertes tus camiones en objetos de red y el cliente vuelve
a ver tráfico.
