import * as ecs from '@8thwall/ecs'

const CircleHotspotComponent = ecs.registerComponent({
  name: 'circle-hotspot-component',

  schema: {
    circleCube: ecs.eid,          // Cubo "Vuelo en Círculo"
    birdModel: ecs.eid,           // Modelo 3D del ave
    crearCollider: ecs.boolean,   // Asigna collider al cubo
    radioCollider: ecs.f32,       // Tamaño del área tocable
  },

  schemaDefaults: {
    crearCollider: true,
    radioCollider: 0.5,
  },

  add: (world, component) => {
    const {crearCollider, radioCollider, circleCube} = component.schema

    // 1. Corrección del Collider: usar width, height, depth
    if (crearCollider && circleCube && !ecs.Collider.has(world, circleCube)) {
      ecs.Collider.set(world, circleCube, {
        shape: ecs.ColliderShape.Box,
        type: ecs.ColliderType.Static,
        width: radioCollider,
        height: radioCollider,
        depth: radioCollider,
        eventOnly: true,
      })
    }
  },

  stateMachine: ({world, eid, schemaAttribute}) => {
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

    // Obtener la entidad directamente para pasar el eid a target
    const {circleCube} = schemaAttribute.get(eid)
    let isPlayingSequence = false

    // ---- Estado Inicial: Reposo ----
    ecs.defineState('idle')
      .initial()
      .onEnter(() => {
        console.log('[CircleHotspot] Estado Reposo')
      })
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaCirculo', {
        target: circleCube, // 2. Corrección: pasar directamente el eid del cubo
      })

    // ---- Estado Secuencia Vuelo en Círculo ----
    ecs.defineState('secuenciaCirculo')
      .onEnter(() => {
        if (isPlayingSequence) return
        isPlayingSequence = true

        console.log('[CircleHotspot] Iniciando secuencia de vuelo en círculo...')
        const {birdModel} = schemaAttribute.get(eid)

        showInfoCard(
          'Vuelo en Círculo',
          'Las guacamayas realizan patrullajes circulares para vigilar su territorio antes de posarse.'
        )

        if (birdModel) {
          // 1. Elevación (ParrotALL_Rise)
          ecs.GltfModel.set(world, birdModel, {
            animationClip: 'ParrotALL_Rise',
            loop: false,
          })

          // 2. Vuelo en Círculo (ParrotALL_CircleFly)
          setTimeout(() => {
            console.log('[CircleHotspot] Volando en círculo...')
            ecs.GltfModel.set(world, birdModel, {
              animationClip: 'ParrotALL_CircleFly',
              loop: false,
            })

            // 3. Aterrizaje (ParrotALL_Land)
            setTimeout(() => {
              console.log('[CircleHotspot] Aterrizando...')
              ecs.GltfModel.set(world, birdModel, {
                animationClip: 'ParrotALL_Land',
                loop: false,
              })

              // 4. Reposo (ParrotALL_Idle2)
              setTimeout(() => {
                console.log('[CircleHotspot] Regreso a Idle2')
                ecs.GltfModel.set(world, birdModel, {
                  animationClip: 'ParrotALL_Idle2',
                  loop: true,
                })
                isPlayingSequence = false
              }, 1200)

            }, 3500)

          }, 1200)
        }
      })
  },
})

export {CircleHotspotComponent}