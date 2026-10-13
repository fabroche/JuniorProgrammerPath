---
modulo: 8
leccion: 2
tipo: lab
verificado: false
titulo: "Sesiones con código"
resumen: "Abrir la caja negra de los botones de sesión: crear y unirte a una partida con tu propio código, mostrar el código de acceso y jugar desde dos ordenadores de verdad."
duracion: 90
objetivos:
  - Leer cómo están configurados los botones de sesión que ya usas
  - Inicializar los servicios e iniciar sesión por código
  - Crear una sesión por relé y unirte a ella con su código
  - Probar la partida entre dos máquinas distintas
fuentes:
  - titulo: "Multiplayer Services SDK 2.3 · Manual"
    url: https://docs.unity3d.com/Packages/com.unity.services.multiplayer@2.3/manual/index.html
  - titulo: "Multiplayer Play Mode 1.6 · Manual"
    url: https://docs.unity3d.com/Packages/com.unity.multiplayer.playmode@1.6/manual/index.html
---

Los botones de tu escena ya te conectan por internet. Este laboratorio no añade
una capacidad nueva: sustituye algo que funciona sin que sepas cómo por algo que
has escrito tú. Hazlo en una rama, y conserva los botones originales hasta el
final para poder comparar.

::: ojo
De todo el curso, este es el laboratorio con más riesgo de no coincidir con lo
que veas. Los nombres de métodos que aparecen están comprobados contra el
paquete instalado, pero no las propiedades de cada objeto ni el comportamiento.
Apóyate en el autocompletado del editor y en la documentación de las fuentes, y
apunta cada diferencia.
:::

::: prerrequisitos
- [ ] El proyecto enlazado en **Edit → Project Settings → Services**
- [ ] La lección 8.1 leída
- [ ] Una rama nueva para este laboratorio
:::

:::: paso Leer lo que ya tienes

Abre `Assets/DefaultWidgetConfiguration.asset` en el Inspector y anota el tipo
de conexión y el número máximo de jugadores. Después selecciona en la escena los
objetos **Create Session**, **Session List** y **Leave Session** y mira qué
componentes llevan.

::: porque
Antes de sustituir algo conviene saber qué hace. Esos tres objetos son todo tu
código de conexión, y no lo escribiste tú.
:::

::: esperado
Tipo de conexión por relé y cuatro jugadores. En el fichero son
`ConnectionType: 2` y `MaxPlayers: 4`.
:::
::::

:::: paso Inicializar e iniciar sesión

Crea un script de conexión propio. Su primer método, asíncrono, tiene que
inicializar los servicios e iniciar sesión de forma anónima si no lo está ya.

```csharp
await UnityServices.InitializeAsync();
if (!AuthenticationService.Instance.IsSignedIn)
{
    await AuthenticationService.Instance.SignInAnonymouslyAsync();
}
Debug.Log($"Identidad: {AuthenticationService.Instance.PlayerId}");
```

::: porque
Ningún servicio responde a un jugador sin identidad. Los botones ya hechos lo
hacían por ti. El log sirve para el paso siguiente.
:::

::: esperado
Una línea de identidad en la consola de cada jugador.
:::
::::

:::: paso Comprobar que sois dos

Compara la identidad que imprime el editor con la de Player 2.

::: porque
La identidad anónima se guarda por dispositivo. Dos copias del juego en el mismo
ordenador pueden acabar siendo el mismo jugador para el servicio, y entonces la
segunda no se une: ya está dentro. Es el problema de los perfiles que resuelve
el autor al principio de su capítulo.
:::

::: esperado
Dos identidades distintas. Si son iguales, mira el desplegable de problemas del
final antes de seguir.
:::
::::

:::: paso Crear la sesión

Añade un método que cree una sesión por relé, y enséñale al jugador su código.

```csharp
var opciones = new SessionOptions { MaxPlayers = 4 }.WithRelayNetwork();
IHostSession sesion = await MultiplayerService.Instance.CreateSessionAsync(opciones);
```

Busca en `sesion`, con el autocompletado, la propiedad que contiene el código
para unirse, y muéstrala en un texto del Canvas.

::: porque
Esta llamada hace los seis pasos del anfitrión del diagrama de la lección 8.1, y
además arranca el NetworkManager. Si tenías enganchado algo a
`OnServerStarted`, como la carga de la escena de selección, tiene que dispararse
igual.
:::

::: esperado
En pantalla aparece un código corto, y la partida arranca como antes: el
anfitrión pasa a la selección o ve aparecer su coche, según hasta dónde llegaste
en el módulo 7.
:::
::::

:::: paso Unirse con el código

Añade un campo de texto y un botón. Al pulsarlo, únete con lo que haya escrito.

```csharp
ISession sesion = await MultiplayerService.Instance.JoinSessionByCodeAsync(codigo);
```

Envuelve la llamada en un `try` y muestra el mensaje del error si falla.

::: porque
Un código es la forma más simple de encontrarse: no hace falta lista ni
búsqueda. Y la llamada puede fallar por motivos que el jugador entiende, como un
código mal escrito o una sesión llena, así que merece un mensaje.
:::

::: esperado
Player 2 escribe el código que muestra el anfitrión y entra. Con un código
inventado, ve un mensaje de error y sigue en el menú.
:::
::::

:::: paso Salir bien

Guarda la sesión en un campo y añade un botón para salir, que llame al método de
la sesión para abandonarla. Búscalo con el autocompletado.

Suscríbete también a los eventos de la sesión que avisan de que has sido
expulsado y de que la sesión se ha eliminado, y deja un log en cada uno.

::: porque
Es la limpieza del módulo 6 vista desde las sesiones. Los eventos de la sesión
son los que te dicen que el anfitrión ha desaparecido, de forma más directa que
los del NetworkManager.
:::

::: esperado
Tras salir, puedes crear o unirte a otra sesión sin reiniciar el juego. Si el
anfitrión se va, el cliente recibe uno de los dos eventos. Apunta cuál.
:::
::::

:::: paso Dos ordenadores de verdad

Haz un build y pásaselo a alguien en otra red, o ábrelo en otro ordenador con
otra conexión. Uno crea la sesión y le dicta el código al otro.

::: porque
Todo lo anterior lo has probado en un solo ordenador. Lo que resuelve el relé,
cruzar dos routers, no se ha puesto a prueba todavía. Y es la primera vez que
vas a notar latencia de verdad.
:::

::: esperado
Los dos jugadores se ven y corren. El coche del otro va claramente más retrasado
que en tus pruebas locales, y un choque se ve distinto en cada pantalla, como
anticipaba el laboratorio 4.2.
:::
::::

::: verificar
- [ ] Sé qué hacían los botones de sesión que venía usando
- [ ] Puedo crear una sesión y ver su código sin los botones ya hechos
- [ ] Puedo unirme escribiendo el código, y un código erróneo da un mensaje
- [ ] He jugado una partida entre dos ordenadores en redes distintas
:::

::: problema Los dos jugadores tienen la misma identidad
Hay que darle a cada copia un perfil de autenticación distinto antes de iniciar
sesión. Las opciones de inicialización de los servicios admiten un perfil, y
Multiplayer Play Mode permite distinguir en qué jugador se está ejecutando el
código. Consulta las dos páginas de las fuentes: es una interacción entre dos
paquetes y conviene seguir su documentación actual.
:::

::: problema Error de servicios no inicializados
Se está llamando a la autenticación o a las sesiones antes de que termine
`InitializeAsync`. Falta un `await`, o el método que llama no es asíncrono.
:::

::: problema La sesión se crea pero el NetworkManager no arranca
Comprueba que las opciones llevan la red por relé. Sin una opción de red, la
sesión es solo una sala: sirve para encontrarse y no conecta a nadie.
:::

::: problema Error de proyecto no enlazado o servicio no habilitado
Enlaza el proyecto en los ajustes de servicios y revisa en el panel de la nube
de Unity que los servicios multijugador están activados para él.
:::
