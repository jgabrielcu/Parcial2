import * as ecs from '@8thwall/ecs'

const GarzaComponent = ecs.registerComponent({
  name: 'garza-component',

  schema: {
    hotspotSphere: ecs.eid,       // Esfera / Hotspot
    birdModel: ecs.eid,           // Modelo 3D de la Garza
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
    // Tarjeta informativa 2D
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
    // ⏱️ TIEMPOS MANUALES PARA CADA CLIP (en milisegundos)
    // Modifica estos dos valores según la duración real de tus clips GLTF
    // =========================================================
    const LOOK_DURATION = 3000  // Duración de 'look' (2.0 segundos)
    const EAT_DURATION = 7500   // Duración de 'eat' (2.5 segundos)

    // ---- Estado 1: Reposo / Idle ("clearing" en bucle infinito) ----
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
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaAlimentacion', {target: hotspotSphere})

    // ---- Estado 2: Secuencia Fija con Tiempos Manuales ----
    ecs.defineState('secuenciaAlimentacion')
      .onEnter(() => {
        if (isExecutingSequence) return
        isExecutingSequence = true

        const {birdModel} = schemaAttribute.get(eid)

        showInfoCard(
          'Comportamiento de la Garza',
          'Permanece inmóvil observando el entorno antes de lanzar su pico rápidamente para capturar a sus presas.'
        )

        if (birdModel) {
          // 1. Ejecutar 'look'
          console.log(`[Clip 1/2] Ejecutando 'look' por ${LOOK_DURATION}ms`)
          ecs.GltfModel.set(world, birdModel, {
            animationClip: 'look',
            loop: false,
          })

          // 2. Transición a 'eat' exactamente cuando termina 'look'
          setTimeout(() => {
            console.log(`[Clip 2/2] Ejecutando 'eat' por ${EAT_DURATION}ms`)
            ecs.GltfModel.set(world, birdModel, {
              animationClip: 'eat',
              loop: false,
            })

            // 3. Volver a 'clearing' (idle) exactamente cuando termina 'eat'
            setTimeout(() => {
              console.log("[Fin] Regresando a 'clearing' (Idle)")
              ecs.GltfModel.set(world, birdModel, {
                animationClip: 'clearing',
                loop: true,
              })
              isExecutingSequence = false
            }, EAT_DURATION)

          }, LOOK_DURATION)
        }
      })
      .onEvent(ecs.input.SCREEN_TOUCH_START, 'secuenciaAlimentacion', {target: hotspotSphere})
  },
})

export {GarzaComponent}