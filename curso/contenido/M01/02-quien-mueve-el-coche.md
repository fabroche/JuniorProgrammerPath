---
modulo: 1
leccion: 2
tipo: lab
verificado: false
titulo: "Quién mueve el coche"
resumen: "Cambiar la autoridad del movimiento de tu coche, ver al cliente quedarse clavado, y dejarlo como estaba sabiendo por qué."
duracion: 35
objetivos:
  - Localizar el modo de autoridad en tu prefab de vehículo
  - Reproducir el fallo del cliente que pulsa y no se mueve
  - Recortar lo que el NetworkTransform envía a lo que tu coche de verdad cambia
  - Razonar qué haría falta para que mandara el servidor
fuentes:
  - titulo: "NetworkTransform"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/helper/networktransform.html
  - titulo: "Ownership"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/ownership.html
---

No vas a mejorar nada en este laboratorio. Vas a romper el movimiento a
propósito, mirarlo roto, y arreglarlo. Al terminar el proyecto queda igual que
al empezar, salvo un ajuste de ancho de banda.

::: prerrequisitos
- [ ] El banco de la lección 0.2 funcionando: anfitrión en el editor, cliente en Player 2
- [ ] Un commit limpio antes de empezar, para poder volver atrás
:::

:::: paso Ver qué tienes configurado

Abre el prefab `Assets/Course Library/Vehicles/Prefabs/Vehicle_NetworkObject`.
En su componente **NetworkTransform** busca **Authority Mode**.

::: porque
Es la decisión de la lección 1.1, y la tomaste al montar el prefab. Antes de
cambiarla conviene saber de dónde partes.
:::

::: esperado
`Authority Mode` está en **Owner**. En el fichero del prefab es la línea
`AuthorityMode: 1`.
:::
::::

:::: paso Darle la autoridad al servidor

Cambia `Authority Mode` a **Server**. No toques nada más. Entra en Play, crea la
sesión en el editor y únete desde Player 2.

Escribe antes tu predicción para cada una de estas cuatro combinaciones:

| Conduce | Se mira en | ¿Se mueve? |
|---|---|---|
| Anfitrión | Su ventana | |
| Anfitrión | Ventana del cliente | |
| Cliente | Su ventana | |
| Cliente | Ventana del anfitrión | |

::: porque
Tu `VehicleOwnership` sigue activando el controlador solo en el dueño. Pero
ahora el `NetworkTransform` solo acepta el movimiento que venga del servidor.
Las dos reglas chocan en un caso concreto, y encontrarlo es el laboratorio.
:::

::: esperado
Según el vídeo y la documentación, que tienes que confirmar:

- El coche del anfitrión se mueve en las dos ventanas. El anfitrión es el
  servidor, así que tiene autoridad sobre todo.
- El coche del cliente **no avanza**, o avanza y vuelve a su sitio. Su
  controlador lee el teclado y mueve el transform, pero el cliente no tiene
  autoridad, y lo que llega del servidor lo devuelve.
- En la ventana del anfitrión, el coche del cliente no se mueve nunca.
:::
::::

:::: paso Devolverle la autoridad al dueño

Vuelve a poner `Authority Mode` en **Owner** y repite la prueba.

::: porque
Para tu juego la autoridad del dueño es la elección correcta, por lo mismo que
razona el autor: cooperativo, sin nada que ganar con trampas, y la respuesta al
volante es lo primero que se nota.
:::

::: esperado
Los dos coches se mueven en las dos ventanas, como antes de empezar.
:::
::::

:::: paso Enviar solo lo que cambia

En el mismo `NetworkTransform`, revisa las casillas de sincronización de
posición, rotación y escala. Desmarca las que tu coche no cambia nunca.

Para decidirlo, lee `CarWithWheelsController.Turn()` y
`TransportController.Move()` y responde: ¿sobre qué eje rota el coche? ¿Cambia
su escala alguna vez?

::: porque
Cada casilla marcada es un dato que se compara y se envía 30 veces por segundo
por cada vehículo. El autor hace este recorte en el vídeo nada más añadir el
componente: su jugador no salta, así que no envía la altura.
:::

::: esperado
- `Turn()` rota solo alrededor de `Vector3.up`: las rotaciones X y Z sobran.
- Nada cambia la escala: sus tres casillas sobran.
- La posición Y depende de tu escena. Si el suelo es plano, sobra. Si hay
  rampas, o si este prefab lo usa también el avión, hace falta.

Tras el cambio el coche se ve exactamente igual en las dos ventanas.
:::
::::

:::: paso Pensar el otro camino

Sin escribir código, responde por escrito en tus notas:

1. Si quisieras autoridad del servidor, ¿qué tendría que enviar el cliente: su
   posición, o sus teclas?
2. ¿En qué máquina se ejecutaría entonces `Accelerate()`?
3. ¿Qué notaría el jugador al pulsar acelerar con 200 ms de retraso?

::: porque
Es el tercer experimento del vídeo, el que el autor escribe y luego deshace.
Para hacerlo hace falta un RPC, que es el tema del módulo 2. Llegar con la
pregunta ya pensada hace que el RPC responda a algo.
:::

::: esperado
1. Las teclas. Si enviara la posición, el servidor volvería a fiarse de él.
2. En el servidor, que es quien tendría la autoridad sobre el transform.
3. Que el coche tarda en responder: la tecla va, el servidor mueve, y el
   resultado vuelve.
:::
::::

::: verificar
- [ ] He visto al coche del cliente quedarse sin avanzar con la autoridad en Server
- [ ] `Authority Mode` vuelve a estar en Owner
- [ ] El `NetworkTransform` solo sincroniza los ejes que el coche cambia
- [ ] Puedo explicar por qué con autoridad del servidor el cliente envía teclas y no posiciones
:::

::: problema Con Server el coche del cliente sí se mueve
Comprueba que cambiaste el prefab que está registrado como `PlayerPrefab` en el
NetworkManager y no otro parecido: hay un `Tank_NetworkObject` al lado. Y que
saliste de Play antes de cambiarlo.
:::

::: problema Tras desmarcar ejes el coche se hunde o se inclina en la copia
Has desmarcado un eje que sí cambia. Vuelve a marcar la posición Y, que es la
candidata más probable.
:::

El módulo 2 trae la pieza que faltaba en el último paso: cómo se le dice algo al
servidor.
