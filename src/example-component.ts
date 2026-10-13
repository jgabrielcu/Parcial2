import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'example-component',
  schema: {
    menuOverlay: ecs.eid, // Contenedor 'Marco' que tiene todos los textos e interfaz
    startButton: ecs.eid, // Objeto 'Botón' o 'Explora'
  },
  add: (world, component) => {
    console.log('Script activado correctamente.')

    const { menuOverlay, startButton } = component.schema

    const hideStartScreen = () => {
      console.log('Ocultando menú de inicio...')
      
      // Oculta el contenedor padre 'Marco' (y a todos sus hijos) en el mundo ECS
      if (menuOverlay) {
        ecs.Hidden.set(world, menuOverlay, {})
      }
    }

    // Listener de clic/touch en ECS
    if (startButton) {
      world.events.addListener(startButton, 'click', hideStartScreen)
      world.events.addListener(startButton, 'touchend', hideStartScreen)
    }
  },
})