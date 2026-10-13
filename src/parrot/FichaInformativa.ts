
import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'FichaInformativa',

  schema: {
    botonInfo: ecs.eid,
    ficha: ecs.eid,
  },

  add: (world, component) => {
    const {botonInfo, ficha} = component.schema

    // La ficha empieza oculta
    ecs.Hidden.set(world, ficha, {})

    let fichaVisible = false

    world.events.addListener(
      botonInfo,
      ecs.input.UI_CLICK,
      () => {
        if (fichaVisible) {
          // Si está visible, ocultarla
          ecs.Hidden.set(world, ficha, {})
          fichaVisible = false

          console.log('[Ficha] Ficha ocultada')
        } else {
          // Si está oculta, mostrarla
          ecs.Hidden.remove(world, ficha)
          fichaVisible = true

          console.log('[Ficha] Ficha mostrada')
        }
      }
    )
  },
})
