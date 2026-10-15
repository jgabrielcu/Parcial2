import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'FichaInformativa2',

  schema: {
    botonInfo: ecs.eid,  // Asigna Info2 en el Inspector
    ficha: ecs.eid,      // Asigna Imagen (1) en el Inspector
  },

  add: (world, component) => {
    const {botonInfo, ficha} = component.schema

    if (!botonInfo || !ficha) {
      console.warn('[FichaInformativa2] Debes asignar botonInfo y ficha en el Inspector.')
      return
    }

    // 1. La ficha siempre arranca oculta
    ecs.Hidden.set(world, ficha, {})
    let isFichaActive = false

    const toggleFicha = () => {
      if (isFichaActive) {
        ecs.Hidden.set(world, ficha, {})
        isFichaActive = false
        console.log('[FichaInformativa2] Ficha ocultada')
      } else {
        ecs.Hidden.remove(world, ficha)
        isFichaActive = true
        console.log('[FichaInformativa2] Ficha mostrada')
      }
    }

    // 2. Escuchar el toque sobre el botón (UI CLICK y Touch Start)
    world.events.addListener(botonInfo, ecs.input.UI_CLICK, () => {
      toggleFicha()
    })

    world.events.addListener(component.eid, ecs.input.SCREEN_TOUCH_START, (evt: any) => {
      const touchedEntity = evt.data?.target || evt.target
      if (touchedEntity === botonInfo) {
        toggleFicha()
      }
    })

    // 3. Cuando se pierde el rastreo de cualquier imagen target, cerramos la ficha automáticamente
    world.events.addListener(component.eid, 'xr:imagelost', () => {
      ecs.Hidden.set(world, ficha, {})
      isFichaActive = false
    })
  },
})