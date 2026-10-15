import * as ecs from '@8thwall/ecs'

const GarzaVueloComponent = ecs.registerComponent({
  name: 'garza-vuelo-component',

  schema: {
    hotspotVuelo: ecs.eid,        // Esfera / Hotspot dedicado al vuelo
    birdModel: ecs.eid,           // Modelo 3D de la Garza
    crearCollider: ecs.boolean,   // Asigna collider automáticamente
    radioCollider: ecs.f32,       // Radio del área tocable
  },

  schemaDefaults: {
    crearCollider: true,
    radioCollider: 0.5,
  },

  add: (world, component) => {
    const {crearCollider, radioCollider, hotspotVuelo} = component.schema

    if (crearCollider && hotspotVuelo && !ecs.Collider.has(world, hotspotVuelo)) {
      ecs.Collider.set(world, hotspotVuelo, {
        shape: ecs.ColliderShape.Sphere,
        type: ecs.ColliderType.Static,
        radius: radioCollider,
        eventOnly: true,
      })
    }
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    // Tarjeta informativa 2D adaptada al vuelo
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

    const {hotspotVuelo} = schemaAttribute.get(eid)
    let isExecutingSequence = false

    // =========================================================
    // ⏱️ TIEMPOS MANUALES PARA LA SECUENCIA DE VUELO (ms)
    // =========================================================
    const FLY_DESPEGUE_DURATION = 4500  // Tiempo de aleteo inicial
    const GLIDE_DURATION = 3000        // Tiempo planeando suavemente
    const FLY_ATERRIZAJE_DURATION = 2000 // Tiempo de aleteo para frenar/aterrizar

    // ---- Estado 1: Reposo / Idle ("clearing") ----
    ecs.defineState('idle')
      .initial()
      .onEnter(() => {
        console.log('Garza en Reposo: clearing')
        const {birdModel} = schemaAttribute.get(eid)

        if (birdModel) {
          ecs.GltfModel.set(world, birdModel, {
            animationClip: 'clearing',
            loop: true,
          })
        }
      })
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaVuelo', {target: hotspotVuelo})

    // ---- Estado 2: Secuencia Aérea Fluida ----
    ecs.defineState('secuenciaVuelo')
      .onEnter(() => {
        if (isExecutingSequence) return
        isExecutingSequence = true

        const {birdModel} = schemaAttribute.get(eid)

        showInfoCard(
          'Vuelo de la Garza',
          'A diferencia de otras aves, las garzas vuelan con el cuello recogido en forma de "S" y realizan aleteos lentos intercalados con momentos de planeo.'
        )

        if (birdModel) {
          // 1. Aleteo inicial (Despegue)
          console.log(`[Vuelo 1/3] Aleteo inicial ('fly') por ${FLY_DESPEGUE_DURATION}ms`)
          ecs.GltfModel.set(world, birdModel, {
            animationClip: 'fly',
            loop: true,
          })

          // 2. Transición a Planeo (Glide)
          setTimeout(() => {
            console.log(`[Vuelo 2/3] Planeando ('glide') por ${GLIDE_DURATION}ms`)
            ecs.GltfModel.set(world, birdModel, {
              animationClip: 'glide',
              loop: true,
            })

            // 3. Recuperación de aleteo previo al aterrizaje
            setTimeout(() => {
              console.log(`[Vuelo 3/3] Recuperación de aleteo ('fly') por ${FLY_ATERRIZAJE_DURATION}ms`)
              ecs.GltfModel.set(world, birdModel, {
                animationClip: 'fly',
                loop: true,
              })

              // 4. Regreso a posarse en reposo (Clearing)
              setTimeout(() => {
                console.log("[Fin Vuelo] Regresando a 'clearing' (Idle)")
                ecs.GltfModel.set(world, birdModel, {
                  animationClip: 'clearing',
                  loop: true,
                })
                isExecutingSequence = false
              }, FLY_ATERRIZAJE_DURATION)

            }, GLIDE_DURATION)

          }, FLY_DESPEGUE_DURATION)
        }
      })
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaVuelo', {target: hotspotVuelo})
  },
})

export {GarzaVueloComponent}