
import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'AudioAve',

  schema: {
    boton: ecs.eid,
    reproductor: ecs.eid,
    audioUrl: ecs.string,
    nombreImageTarget: ecs.string,
  },

  schemaDefaults: {
    audioUrl: 'assets/canto_ave1.mp3',
    nombreImageTarget: '',
  },

  add: (world, component) => {
    const {
      boton,
      reproductor,
      audioUrl,
      nombreImageTarget,
    } = component.schema

    console.log('[AudioAve] Componente iniciado')
    console.log('[AudioAve] Archivo:', audioUrl)

    // Asignar explícitamente el MP3 al reproductor.
    ecs.Audio.set(world, reproductor, {
      url: audioUrl,
      volume: 1,
      loop: false,
      paused: true,
      pitch: 1,
      positional: false,
    })

    // Ocultar el botón al comenzar.
    ecs.Hidden.set(world, boton, {})

    // Mostrarlo al detectar la imagen correspondiente.
    world.events.addListener(
      world.events.globalId,
      'reality.imagefound',
      (event) => {
        const data = event.data as {name: string}
        console.log('[AudioAve] Imagen detectada:', data.name)

        if (data.name === nombreImageTarget) {
          ecs.Hidden.remove(world, boton)
        }
      }
    )

    // Ocultar el botón y detener el audio al perder la imagen.
    world.events.addListener(
      world.events.globalId,
      'reality.imagelost',
      (event) => {
        const data = event.data as {name: string}

        if (data.name === nombreImageTarget) {
          ecs.Hidden.set(world, boton, {})
          ecs.Audio.set(world, reproductor, {
            paused: true,
          })
        }
      }
    )

    // Reproducir al pulsar el botón.
    world.events.addListener(
      boton,
      ecs.input.UI_CLICK,
      () => {
        console.log('[AudioAve] Botón pulsado')

        ecs.Audio.set(world, reproductor, {
          url: audioUrl,
          volume: 1,
          loop: false,
          paused: false,
          positional: false,
        })
      }
    )
  },
})
