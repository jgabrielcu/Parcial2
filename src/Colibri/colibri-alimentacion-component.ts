import * as ecs from '@8thwall/ecs'

const ColibriAlimentacionComponent = ecs.registerComponent({
  name: 'colibri-alimentacion-component',

  schema: {
    hotspotFlor: ecs.eid,         // Esfera / Hotspot ubicado cerca de la flor o del colibrí
    birdModel: ecs.eid,           // Modelo 3D del Colibrí
    crearCollider: ecs.boolean,   // Asigna collider automáticamente
    radioCollider: ecs.f32,       // Radio del área tocable
  },

  schemaDefaults: {
    crearCollider: true,
    radioCollider: 0.5,
  },

  add: (world, component) => {
    const {crearCollider, radioCollider, hotspotFlor} = component.schema

    if (crearCollider && hotspotFlor && !ecs.Collider.has(world, hotspotFlor)) {
      ecs.Collider.set(world, hotspotFlor, {
        shape: ecs.ColliderShape.Sphere,
        type: ecs.ColliderType.Static,
        radius: radioCollider,
        eventOnly: true,
      })
    }
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    // Tarjeta informativa 2D adaptada a la alimentación del Colibrí
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

    const {hotspotFlor} = schemaAttribute.get(eid)
    let isExecutingSequence = false

    // =========================================================
    // ⏱️ TIEMPOS MANUALES PARA LA ALIMENTACIÓN DEL COLIBRÍ (ms)
    // =========================================================
    const TAKEOFF_DURATION = 1200          // Duración de '04_Takeoff'
    const FLOWER_FEEDING_DURATION = 3500   // Duración de '06_Flower_Feeding'
    const LANDING_DURATION = 1500          // Duración de '05_Landing'

    // ---- Estado 1: Reposo Posado ("03_Perched_Idle_Loop") ----
    ecs.defineState('idle')
      .initial()
      .onEnter(() => {
        console.log('Colibrí posado: 03_Perched_Idle_Loop')
        const {birdModel} = schemaAttribute.get(eid)

        if (birdModel) {
          ecs.GltfModel.set(world, birdModel, {
            animationClip: '03_Perched_Idle_Loop',
            loop: true,
          })
        }
      })
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaAlimentacion', {target: hotspotFlor})

    // ---- Estado 2: Secuencia de Despegue, Alimentación en Flor y Aterrizaje ----
    ecs.defineState('secuenciaAlimentacion')
      .onEnter(() => {
        if (isExecutingSequence) return
        isExecutingSequence = true

        const {birdModel} = schemaAttribute.get(eid)

        showInfoCard(
          'Alimentación Nectarívora',
          'Los colibríes consumen el doble de su peso corporal en néctar cada día, usando su larga lengua extensible para extraerlo rápidamente mientras se mantienen suspendidos.'
        )

        if (birdModel) {
          // 1. Despegue (04_Takeoff)
          console.log(`[Colibrí Flor 1/3] Despegando ('04_Takeoff') por ${TAKEOFF_DURATION}ms`)
          ecs.GltfModel.set(world, birdModel, {
            animationClip: '04_Takeoff',
            loop: false,
          })

          // 2. Alimentación en la flor (06_Flower_Feeding)
          setTimeout(() => {
            console.log(`[Colibrí Flor 2/3] Alimentándose en flor ('06_Flower_Feeding') por ${FLOWER_FEEDING_DURATION}ms`)
            ecs.GltfModel.set(world, birdModel, {
              animationClip: '06_Flower_Feeding',
              loop: true,
            })

            // 3. Aterrizaje (05_Landing)
            setTimeout(() => {
              console.log(`[Colibrí Flor 3/3] Aterrizando ('05_Landing') por ${LANDING_DURATION}ms`)
              ecs.GltfModel.set(world, birdModel, {
                animationClip: '05_Landing',
                loop: false,
              })

              // 4. Vuelta al posado reposado (03_Perched_Idle_Loop)
              setTimeout(() => {
                console.log("[Fin Colibrí Flor] Regresando a '03_Perched_Idle_Loop' (Idle Posado)")
                ecs.GltfModel.set(world, birdModel, {
                  animationClip: '03_Perched_Idle_Loop',
                  loop: true,
                })
                isExecutingSequence = false
              }, LANDING_DURATION)

            }, FLOWER_FEEDING_DURATION)

          }, TAKEOFF_DURATION)
        }
      })
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaAlimentacion', {target: hotspotFlor})
  },
})

export {ColibriAlimentacionComponent}