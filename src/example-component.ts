
import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'example-component',

  schema: {
    menuOverlay: ecs.eid,
    startButton: ecs.eid,
  },

  add: (world, component) => {
    const {menuOverlay, startButton} = component.schema

    // Estado persistente mientras esta instancia exista.
    let menuCerrado = false

    const ocultarMenu = () => {
      if (menuCerrado) return

      menuCerrado = true
      ecs.Hidden.set(world, menuOverlay, {})
      console.log('[Portada] Cerrada por el usuario')
    }

    // La portada empieza visible.
    ecs.Hidden.remove(world, menuOverlay)

    world.events.addListener(
      startButton,
      ecs.input.UI_CLICK,
      ocultarMenu
    )

    // Si cambia el target, no volver a mostrar la portada.
    world.events.addListener(
      world.events.globalId,
      'reality.imagefound',
      () => {
        if (menuCerrado) {
          ecs.Hidden.set(world, menuOverlay, {})
        }
      }
    )
  },
})
