import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'AudioAve',

  schema: {
    boton: ecs.eid,              // Botón de Canto asignado en el Inspector
    reproductor: ecs.eid,         // Entidad contenedora o target del ave
    audioUrl: ecs.string,         // Ruta del archivo de audio (ej. assets/sonidos/paloma.mp3)
    nombreImageTarget: ecs.string, // Nombre del objetivo de imagen
  },

  schemaDefaults: {
    audioUrl: '',
    nombreImageTarget: '',
  },

  add: (world, component) => {
    const {boton, audioUrl} = component.schema

    if (!boton || !audioUrl) {
      console.warn('[AudioAve] Falta configurar el botón o la URL de audio en el Inspector.')
      return
    }

    // Instancia de audio única para ESTE componente
    const audio = new Audio(audioUrl)

    // Detener y reiniciar audio si se presiona el botón exacto
    const playAudio = () => {
      audio.currentTime = 0
      audio.play().catch((err) => {
        console.warn('[AudioAve] Error al reproducir audio:', err)
      })
    }

    // Escuchador 1: UI Click de 8th Wall Studio (específico para el botón asignado)
    world.events.addListener(boton, ecs.input.UI_CLICK, () => {
      playAudio()
    })

    // Escuchador 2: Verificación de Toque Táctil en pantalla
    world.events.addListener(component.eid, ecs.input.SCREEN_TOUCH_START, (evt: any) => {
      const touchedEntity = evt.data?.target || evt.target
      if (touchedEntity === boton) {
        playAudio()
      }
    })
  },
})