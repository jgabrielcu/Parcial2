import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'rotacion-modelo-component',

  schema: {
    velocidad: ecs.f32,
  },

  schemaDefaults: {
    velocidad: 10,
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    ecs.defineState('default')
      .initial()
      .listen(world.events.globalId, ecs.input.SCREEN_TOUCH_MOVE, (e) => {
        const {velocidad} = schemaAttribute.get(eid)

        const movimiento = e.data.change.x
        const angulos = ecs.math.vec3.xyz(
          0,
          movimiento * velocidad * world.time.delta,
          0
        )

        const rotacion = ecs.math.quat.pitchYawRollDegrees(angulos)

        world.transform.rotateLocal(eid, rotacion)
      })
  },
})

