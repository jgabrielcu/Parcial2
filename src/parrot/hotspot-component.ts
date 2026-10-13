import * as ecs from '@8thwall/ecs'

const HotspotComponent = ecs.registerComponent({
  name: 'hotspot-component',

  schema: {
    volarSphere: ecs.eid,         // Esfera "Volar"
    birdModel: ecs.eid,           // Modelo 3D del ave
    crearCollider: ecs.boolean,   // Asigna collider a la esfera
    radioCollider: ecs.f32,       // Área tocable
  },

  schemaDefaults: {
    crearCollider: true,
    radioCollider: 0.5,
  },

  add: (world, component) => {
    const {crearCollider, radioCollider, volarSphere} = component.schema

    // Asegurar collider dinámico en la esfera de Volar
    if (crearCollider && volarSphere && !ecs.Collider.has(world, volarSphere)) {
      ecs.Collider.set(world, volarSphere, {
        shape: ecs.ColliderShape.Sphere,
        type: ecs.ColliderType.Static,
        radius: radioCollider,
        eventOnly: true,
      })
    }
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
    // Función para crear/mostrar la tarjeta informativa 2D
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

    const {volarSphere} = schemaAttribute.get(eid)

    // Variable interna para controlar si la secuencia está ejecutándose
    let isPlayingSequence = false

    // ---- Estado Único: Reposo con Disparador ----
    ecs.defineState('idle')
      .initial()
      .onEnter(() => {
        console.log('Iniciando reposo: ParrotALL_Idle2')
        const {birdModel} = schemaAttribute.get(eid)

        if (birdModel) {
          ecs.GltfModel.set(world, birdModel, {
            animationClip: 'ParrotALL_Idle2',
            loop: true,
          })
        }
      })
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaVuelo', {target: volarSphere})

    ecs.defineState('secuenciaVuelo')
      .onEnter(() => {
        if (isPlayingSequence) return
        isPlayingSequence = true

        console.log('Iniciando secuencia de vuelo...')
        const {birdModel} = schemaAttribute.get(eid)

        showInfoCard(
          'Guacamaya en Vuelo',
          'Al despegar, despliega sus alas para alcanzar altitudes de más de 500 metros en la selva.'
        )

        if (birdModel) {
          // 1. Elevación
          ecs.GltfModel.set(world, birdModel, {
            animationClip: 'ParrotALL_Rise',
            loop: false,
          })

          // 2. Vuelo (4 repeticiones)
          setTimeout(() => {
            console.log('Volando...')
            ecs.GltfModel.set(world, birdModel, {
              animationClip: 'ParrotALL_Fly',
              loop: true,
              repetitions: 4,
            })

            // 3. Aterrizaje
            setTimeout(() => {
              console.log('Aterrizando...')
              ecs.GltfModel.set(world, birdModel, {
                animationClip: 'ParrotALL_Land',
                loop: false,
              })

              // 4. Volver a Reposo (Idle2)
              setTimeout(() => {
                console.log('Regreso a Reposo')
                ecs.GltfModel.set(world, birdModel, {
                  animationClip: 'ParrotALL_Idle2',
                  loop: true,
                })
                isPlayingSequence = false
              }, 1200)

            }, 4000)

          }, 1200)
        }
      })
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaVuelo', {target: volarSphere})
  },
})

export {HotspotComponent}