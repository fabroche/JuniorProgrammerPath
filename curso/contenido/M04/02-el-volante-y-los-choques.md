---
modulo: 4
leccion: 2
tipo: lab
verificado: false
titulo: "El volante y los choques"
resumen: "Cerrar tu issue 16: las ruedas delanteras giran en todas las copias gracias a una NetworkVariable que escribe el dueño. Y un experimento con dos coches chocando."
duracion: 70
objetivos:
  - Declarar una NetworkVariable con permiso de escritura para el dueño
  - Escribirla solo desde la copia propia y leerla en todas
  - Mantener funcionando sin red los objetos que no son de red
  - Observar cómo resuelve cada máquina un choque entre dos jugadores
fuentes:
  - titulo: "NetworkVariable"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/networkvariable.html
  - titulo: "Ownership"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/ownership.html
  - titulo: "Physics"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/physics.html
---

Tu issue 16 describe el problema mejor que cualquier ejemplo inventado: el giro
del volante sale del teclado, el teclado solo existe en la máquina del dueño, y
ese dato nunca cruza la red. Además no se puede deducir del movimiento, porque
un coche parado no gira aunque el volante esté a tope.

::: prerrequisitos
- [ ] El banco de la lección 0.2 funcionando
- [ ] La lección 4.1 leída y el issue 16 releído
- [ ] Un commit limpio antes de empezar
:::

## Primera parte: el volante

:::: paso Decidir entre RPC y NetworkVariable

Antes de escribir nada, aplica la pregunta de la lección 4.1 al giro del
volante y anota la respuesta: si un jugador se conecta ahora, ¿necesita saber
cómo está el volante de tu coche?

::: porque
La herramienta se elige por el tipo de dato, no por costumbre. Hacer la pregunta
antes evita sincronizar un estado con avisos, que es el error más común.
:::

::: esperado
Sí lo necesita: es un estado que dura, no un suceso. Y cambia de forma continua
mientras giras. Es una NetworkVariable.
:::
::::

:::: paso Exponer el dato en el controlador

`_smoothedHorizontalInput` es `protected` en `TransportController`. Añade un
getter público, junto a `Speed` y `MaxSpeed`.

::: porque
El componente de red va a vivir fuera del controlador, como `VehicleOwnership`,
y necesita leer el giro. Así `TransportController` sigue sin saber que existe la
red.
:::

::: esperado
Compila. Nada cambia en el juego.
:::
::::

:::: paso Crear el componente que lo comparte

Crea un `NetworkBehaviour` nuevo en `Assets/Scripts/Multiplayer/`, con la
variable que propone el issue:

```csharp
public NetworkVariable<float> SteeringInput = new NetworkVariable<float>(
    0f,
    NetworkVariableReadPermission.Everyone,
    NetworkVariableWritePermission.Owner);
```

En su `Update`, **solo si es el dueño**, copia el giro del controlador a
`SteeringInput.Value`. Añádelo al prefab del vehículo.

::: porque
El permiso `Owner` es lo que deja escribir a un cliente. Sin él solo podría el
servidor, que no conoce el teclado de nadie. Y la guarda de `IsOwner` no es
opcional: una copia sin permiso que intente escribir provoca un error.
:::

::: esperado
Compila y no hay errores en la consola de ninguno de los dos jugadores al
conducir. Todavía no se ve nada nuevo: nadie lee el valor.
:::
::::

:::: paso Leerlo en las ruedas

En `WheelsVisual`, añade una referencia **opcional** al componente nuevo y úsala
en lugar del `0f` fijo:

```csharp
wheels.Rotate(speed, controller.MaxSpeed, 0f);
```

Si la referencia es nula, sigue pasando cero.

::: porque
`WheelsVisual` lo usan también los camiones de tráfico, que no tienen volante de
jugador. La referencia opcional mantiene el script funcionando para ellos sin
que tengan que cargar con un componente que no necesitan. Está en las notas del
propio issue.
:::

::: esperado
En tu ventana, las ruedas delanteras de tu coche giran al pulsar izquierda y
derecha. En la ventana del otro jugador, las ruedas de **tu** coche giran igual.
:::
::::

:::: paso La prueba que antes era imposible

Con el coche **parado**, mantén pulsada una dirección y mira la copia en la otra
ventana.

::: porque
Es justo el caso que el issue declara irresoluble deduciendo del movimiento: un
coche parado no rota, así que no hay nada que deducir. Si aquí las ruedas giran
en la copia, el dato está viajando de verdad y no se está adivinando.
:::

::: esperado
Las ruedas delanteras de la copia giran con el coche parado, igual que en el
original.
:::
::::

:::: paso Medir lo que cuesta

El giro está suavizado, así que cambia en casi todos los fotogramas mientras
giras. Responde:

1. ¿Cuántas veces por segundo se envía como mucho?
2. ¿Qué pasa con los valores intermedios dentro de un mismo tick?
3. ¿Se envía algo mientras vas recto?

::: porque
Es la contrapartida de la lección 4.1: una NetworkVariable no envía cada
escritura, envía el último valor de cada tick. Aquí eso es lo que quieres.
:::

::: esperado
1. 30, el `TickRate` de tu NetworkManager.
2. Se pierden. Solo llega el último, y para un volante da igual.
3. No: si el valor no cambia, no se envía.
:::
::::

## Segunda parte: los choques

:::: paso Chocar y mirar desde los dos lados

Con dos jugadores, lanza un coche contra el otro, primero despacio y luego a
toda velocidad. Mira el mismo choque en las dos ventanas.

Anota para cada caso: ¿se atraviesan? ¿Se empujan? ¿Ven lo mismo las dos
ventanas?

::: porque
Cada máquina manda sobre su coche y solo tiene del otro una copia retrasada. El
choque que ve cada una es contra esa copia, no contra el coche real. Es la
decisión de diseño que el autor plantea en el último capítulo del módulo.
:::

::: esperado
No hay un resultado único que predecir aquí: depende de los colliders y del
`Rigidbody` de tu prefab, y de la velocidad. Lo que sí debería cumplirse es que
las dos ventanas **no coinciden del todo**, y que la diferencia crece con la
velocidad. Apunta lo que veas: es el material de partida si decides arreglarlo.
:::
::::

:::: paso Decidir qué quieres

No implementes nada. Elige y justifica en tus notas una de estas tres:

1. **Atravesarse.** Los jugadores no chocan entre sí. Es lo más simple y lo que
   hacen muchos juegos de carreras en línea.
2. **Bloquearse cada uno.** Como en el vídeo: cada dueño trata las copias ajenas
   como obstáculos al moverse.
3. **Que decida el servidor.** Autoridad del servidor sobre el movimiento, con
   todo lo que vimos que cuesta en el laboratorio 1.2.

::: porque
El autor lo llama «una pregunta de diseño opcional», y lo es: ninguna de las
tres es un fallo. Elegir sabiendo lo que cuesta cada una es el resultado del
laboratorio.
:::

::: esperado
Una decisión razonada, y si quieres, un issue nuevo en tu backlog con ella.
:::
::::

::: verificar
- [ ] Las ruedas delanteras giran en la copia de mi coche que ve el otro jugador
- [ ] Giran también con el coche parado
- [ ] Los camiones de tráfico siguen funcionando sin el componente nuevo
- [ ] He visto un choque desde las dos ventanas y he elegido qué hacer con ellos
- [ ] El issue 16 se puede cerrar
:::

::: problema Error al escribir la variable: el cliente no tiene permiso
O falta `NetworkVariableWritePermission.Owner` en el constructor, o falta la
guarda de `IsOwner` antes de asignar `.Value`, y está intentando escribir una
copia que no es la dueña.
:::

::: problema Las ruedas giran en mi ventana pero no en la del otro
`WheelsVisual` está leyendo el giro del controlador directamente en vez de la
NetworkVariable. En la copia remota el controlador está apagado y su giro vale
siempre cero.
:::

::: problema Los camiones dan un error de referencia nula
`WheelsVisual` está usando la referencia sin comprobar si existe. Los camiones
no llevan el componente.
:::
