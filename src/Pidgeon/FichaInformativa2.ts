import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'FichaInformativa2',

  schema: {
    botonInfo: ecs.eid,  // Entidad del Botón "Info2"
    ficha: ecs.eid,      // GameObject/Entidad de la Ficha ("Imagen (1)")
  },

  add: (world, component) => {
    const {botonInfo, ficha} = component.schema

    if (!botonInfo || !ficha) {
      console.warn('[FichaInformativa2] Falta asignar botonInfo o ficha en el Inspector.')
      return
    }

    // 1. Desactivar / Ocultar el GameObject de la Ficha al iniciar la escena
    ecs.Hidden.set(world, ficha, {})
    let isFichaActive = false

    // Función interna para activar / desactivar el GameObject
    const toggleGameObject = () => {
      if (isFichaActive) {
        // Desactivar GameObject
        ecs.Hidden.set(world, ficha, {})
        isFichaActive = false
        console.log('[Ficha] GameObject desactivado')
      } else {
        // Activar GameObject
        ecs.Hidden.remove(world, ficha)
        isFichaActive = true
        console.log('[Ficha] GameObject activado')
      }
    }

    // 2. Escuchar el evento de activación al presionar el botón
    world.events.addListener(component.eid, ecs.input.SCREEN_TOUCH_START, (evt: any) => {
      const touchedEntity = evt.data?.target || evt.target

      // Si se hizo clic sobre el botón Info2
      if (touchedEntity === botonInfo) {
        toggleGameObject()
      }
    })

    // Escuchador secundario para UI nativa de 8th Wall Studio
    world.events.addListener(botonInfo, ecs.input.UI_CLICK, () => {
      toggleGameObject()
    })
  },
})