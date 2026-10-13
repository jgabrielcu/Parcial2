import * as ecs from '@8thwall/ecs'

const PigeonPeckComponent = ecs.registerComponent({
  name: 'pigeon-peck-component',

  schema: {
    peckSphere: ecs.eid,          // Esfera/Hotspot para activar el picoteo
    birdModel: ecs.eid,           // Modelo 3D de la Paloma
    crearCollider: ecs.boolean,   // Asigna collider automáticamente
    radioCollider: ecs.f32,       // Radio del área tocable
  },

  schemaDefaults: {
    crearCollider: true,
    radioCollider: 0.5,
  },

  add: (world, component) => {
    const {crearCollider, radioCollider, peckSphere} = component.schema

    // Configurar collider en la esfera de activación
    if (crearCollider && peckSphere && !ecs.Collider.has(world, peckSphere)) {
      ecs.Collider.set(world, peckSphere, {
        shape: ecs.ColliderShape.Sphere,
        type: ecs.ColliderType.Static,
        radius: radioCollider,
        eventOnly: true,
      })
    }
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    // Tarjeta informativa breve sobre la alimentación/comportamiento
    const showInfoCard = (title: string, description: string) => {
      let card = document.getElementById('info-card-2d')
      if (!card) {
        card = document.createElement('div')
        card.id = 'info-card-2d'
        card.style.position = 'fixed'
        card.style.bottom = '30px'
        card.style.left = '50%'
        card.style.transform = 'translateX(-50%)'
        card.style.width = '85%'
        card.style.maxWidth = '360px'
        card.style.backgroundColor = 'rgba(15, 23, 42, 0.92)'
        card.style.color = '#ffffff'
        card.style.padding = '18px'
        card.style.borderRadius = '16px'
        card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)'
        card.style.backdropFilter = 'blur(8px)'
        card.style.zIndex = '99999'
        card.style.fontFamily = 'sans-serif'
        card.style.textAlign = 'center'

        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h3 style="margin:0; color:#38bdf8; font-size:18px;">${title}</h3>
            <button id="close-card-btn" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">✕</button>
          </div>
          <p style="margin:0; font-size:14px; color:#e2e8f0; line-height:1.4;">${description}</p>
        `
        document.body.appendChild(card)

        const closeBtn = document.getElementById('close-card-btn')
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            card.style.display = 'none'
          })
        }
      } else {
        const h3 = card.querySelector('h3')
        const p = card.querySelector('p')
        if (h3) h3.innerText = title
        if (p) p.innerText = description
        card.style.display = 'block'
      }
    }

    const {peckSphere} = schemaAttribute.get(eid)
    let isPecking = false

    // ---- Estado 1: Reposo ----
    ecs.defineState('idle')
      .initial()
      .onEnter(() => {
        console.log('Reposo Paloma: PigeonALL_Idle')
        const {birdModel} = schemaAttribute.get(eid)

        if (birdModel) {
          ecs.GltfModel.set(world, birdModel, {
            animationClip: 'PigeonALL_Idle',
            loop: true,
          })
        }
      })
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaPeck', {target: peckSphere})

    // ---- Estado 2: Secuencia Picotear (2 repeticiones -> Idle) ----
    ecs.defineState('secuenciaPeck')
      .onEnter(() => {
        if (isPecking) return
        isPecking = true

        console.log('Iniciando picoteo (PigeonALL_Peck x2)...')
        const {birdModel} = schemaAttribute.get(eid)

        showInfoCard(
          'Alimentación de la Paloma',
          'Utiliza su pico para recoger granos y semillas del suelo de forma rápida y continua.'
        )

        if (birdModel) {
          // 1. Ejecutar animación de picotear con 2 repeticiones
          ecs.GltfModel.set(world, birdModel, {
            animationClip: 'PigeonALL_Peck',
            loop: true,
            repetitions: 2,
          })

          // 2. Regresar a reposo (Ajuste estimado de duración: ~2000ms según la animación)
          setTimeout(() => {
            console.log('Finalizó el picoteo, regresando a PigeonALL_Idle...')
            ecs.GltfModel.set(world, birdModel, {
              animationClip: 'PigeonALL_Idle',
              loop: true,
            })
            isPecking = false
          }, 2000)
        }
      })
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaPeck', {target: peckSphere})
  },
})

export {PigeonPeckComponent}