import * as ecs from '@8thwall/ecs'

const ColibriComponent = ecs.registerComponent({
  name: 'colibri-component',

  schema: {
    hotspotSphere: ecs.eid,       // Esfera / Hotspot para activar el vuelo del colibrí
    birdModel: ecs.eid,           // Modelo 3D del Colibrí
    crearCollider: ecs.boolean,   // Asigna collider automáticamente
    radioCollider: ecs.f32,       // Radio del área tocable
  },

  schemaDefaults: {
    crearCollider: true,
    radioCollider: 0.5,
  },

  add: (world, component) => {
    const {crearCollider, radioCollider, hotspotSphere} = component.schema

    if (crearCollider && hotspotSphere && !ecs.Collider.has(world, hotspotSphere)) {
      ecs.Collider.set(world, hotspotSphere, {
        shape: ecs.ColliderShape.Sphere,
        type: ecs.ColliderType.Static,
        radius: radioCollider,
        eventOnly: true,
      })
    }
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    // Tarjeta informativa 2D adaptada al Colibrí
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

    const {hotspotSphere} = schemaAttribute.get(eid)
    let isExecutingSequence = false

    // =========================================================
    // ⏱️ TIEMPOS MANUALES PARA CADA CLIP DEL COLIBRÍ (ms)
    // Modifica estos valores según la duración de tus clips GLTF
    // =========================================================
    const TAKEOFF_DURATION = 1600   // Duración de '04_Takeoff' (Despegue rápido)
    const HOVER_DURATION = 3000     // Duración de '01_Hover_Idle_Loop' (Mantenerse en el aire)
    const LANDING_DURATION = 1500   // Duración de '05_Landing' (Aterrizaje)

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
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaVuelo', {target: hotspotSphere})

    // ---- Estado 2: Secuencia de Despegue, Vuelo Estático y Aterrizaje ----
    ecs.defineState('secuenciaVuelo')
      .onEnter(() => {
        if (isExecutingSequence) return
        isExecutingSequence = true

        const {birdModel} = schemaAttribute.get(eid)

        showInfoCard(
          'Vuelo del Colibrí',
          'Son las únicas aves capaces de volar hacia atrás y mantenerse suspendidas en el aire guiñando sus alas hasta 80 veces por segundo.'
        )

        if (birdModel) {
          // 1. Despegue (04_Takeoff)
          console.log(`[Colibrí 1/3] Despegando ('04_Takeoff') por ${TAKEOFF_DURATION}ms`)
          ecs.GltfModel.set(world, birdModel, {
            animationClip: '04_Takeoff',
            loop: false,
          })

          // 2. Vuelo Estático / Suspendido (01_Hover_Idle_Loop)
          setTimeout(() => {
            console.log(`[Colibrí 2/3] Volando suspendido ('01_Hover_Idle_Loop') por ${HOVER_DURATION}ms`)
            ecs.GltfModel.set(world, birdModel, {
              animationClip: '01_Hover_Idle_Loop',
              loop: true,
            })

            // 3. Aterrizaje (05_Landing)
            setTimeout(() => {
              console.log(`[Colibrí 3/3] Aterrizando ('05_Landing') por ${LANDING_DURATION}ms`)
              ecs.GltfModel.set(world, birdModel, {
                animationClip: '05_Landing',
                loop: false,
              })

              // 4. Vuelta al posado reposado (03_Perched_Idle_Loop)
              setTimeout(() => {
                console.log("[Fin Colibrí] Regresando a '03_Perched_Idle_Loop' (Idle Posado)")
                ecs.GltfModel.set(world, birdModel, {
                  animationClip: '03_Perched_Idle_Loop',
                  loop: true,
                })
                isExecutingSequence = false
              }, LANDING_DURATION)

            }, HOVER_DURATION)

          }, TAKEOFF_DURATION)
        }
      })
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaVuelo', {target: hotspotSphere})
  },
})

export {ColibriComponent}