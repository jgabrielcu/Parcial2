import * as ecs from '@8thwall/ecs'
import {PREGUNTAS} from './Preguntas'

// Colores de la interfaz
const COLOR_BASE = '#2B3A55'
const COLOR_OK = '#2E9E5B'
const COLOR_ERROR = '#C0392B'

// Tiempo (ms) que se muestra la retroalimentacion antes de pasar a la siguiente pregunta
const TIEMPO_FEEDBACK = 2500

// ---------------------------------------------------------------
// Estado COMPARTIDO entre todas las instancias del componente
// (una instancia por ave, todas usando la misma interfaz).
// ---------------------------------------------------------------
const visibles = new Set<string>()            // image targets que se estan viendo ahora
let quizEnCurso = false                       // hay un quiz corriendo (de cualquier ave)
let ultimoTerminado: string | null = null     // ave cuyo quiz termino ultimo (para "Reintentar")

ecs.registerComponent({
  name: 'QuizManager',

  schema: {
    // Debe coincidir con el nombre del image target y con la clave en preguntas.ts
    nombreImageTarget: ecs.string,

    // Elementos de interfaz (UI) creados en el Studio
    botonIniciar: ecs.eid,
    panelQuiz: ecs.eid,
    textoPregunta: ecs.eid,
    opcionA: ecs.eid,
    opcionB: ecs.eid,
    opcionC: ecs.eid,
    textoFeedback: ecs.eid,
    textoPuntaje: ecs.eid,
    panelFinal: ecs.eid,
    textoFinal: ecs.eid,
    botonReintentar: ecs.eid,

    // Efectos de sonido
    sfx: ecs.eid,
    sfxCorrecto: ecs.string,
    sfxIncorrecto: ecs.string,
    sfxFinal: ecs.string,
  },

  schemaDefaults: {
    nombreImageTarget: '',
    sfxCorrecto: 'assets/sfx_correcto.mp3',
    sfxIncorrecto: 'assets/sfx_incorrecto.mp3',
    sfxFinal: 'assets/sfx_final.mp3',
  },

  add: (world, component) => {
    const {
      nombreImageTarget, botonIniciar, panelQuiz, textoPregunta,
      opcionA, opcionB, opcionC, textoFeedback, textoPuntaje,
      panelFinal, textoFinal, botonReintentar, sfx,
      sfxCorrecto, sfxIncorrecto, sfxFinal,
    } = component.schema

    // ---------- Diagnóstico: eids sin asignar ----------
    const campos = {
      botonIniciar, panelQuiz, textoPregunta, opcionA, opcionB, opcionC,
      textoFeedback, textoPuntaje, panelFinal, textoFinal, botonReintentar, sfx,
    }
    const faltantes = Object.entries(campos).filter(([, v]) => !v).map(([k]) => k)
    if (faltantes.length > 0) {
      console.error(`[Quiz:${nombreImageTarget}] FALTA asignar en el Studio:`, faltantes.join(', '))
      return  // sin esto, los Ui.set sobre un eid vacío rompen el layout
    }

    const preguntas = PREGUNTAS[nombreImageTarget] || []
    const opciones = [opcionA, opcionB, opcionC]

    // Estado propio de esta ave
    let indice = 0
    let puntaje = 0
    let activo = false      // el quiz de ESTA ave está corriendo
    let bloqueado = false   // true mientras se muestra la retroalimentación

    if (preguntas.length === 0) {
      console.warn('[Quiz] No hay preguntas para el target:', nombreImageTarget)
    }

    // ---------- Utilidades ----------
    const paso = (nombre: string, fn: () => void) => {
      try {
        fn()
      } catch (e) {
        console.error(`[Quiz:${nombreImageTarget}] falló en:`, nombre, e)
      }
    }

    const mostrar = (eid: any) => ecs.Hidden.remove(world, eid)
    const ocultar = (eid: any) => ecs.Hidden.set(world, eid, {})

    // Nunca mandamos undefined ni '' al texto (el layout puede fallar al medirlo)
    const texto = (eid: any, t: string) => {
      const limpio = t === undefined || t === null || t === '' ? ' ' : String(t)
      ecs.Ui.set(world, eid, {text: limpio})
    }

    const sonido = (url: string) => {
      ecs.Audio.set(world, sfx, {
        url,
        volume: 1,
        loop: false,
        paused: false,
        positional: false,
      })
    }

    const actualizarPuntaje = () => {
      texto(textoPuntaje, `Puntaje: ${puntaje}/${preguntas.length}`)
    }

    // ---------- Flujo del quiz ----------
    const mostrarPregunta = () => {
      const p = preguntas[indice]
      bloqueado = false
      console.log('[Quiz] mostrando pregunta', indice, p)

      paso('texto pregunta', () => texto(textoPregunta, `${indice + 1}/${preguntas.length}  ${p.texto}`))
      paso('limpiar feedback', () => texto(textoFeedback, ' '))
      opciones.forEach((eid, i) => {
        paso(`opcion ${i}`, () => {
          ecs.Ui.set(world, eid, {text: p.opciones[i] ?? ' ', background: COLOR_BASE})
        })
      })
      paso('puntaje', actualizarPuntaje)
    }

    const terminar = () => {
      activo = false
      quizEnCurso = false
      ultimoTerminado = nombreImageTarget
      ocultar(panelQuiz)
      mostrar(panelFinal)

      const ratio = preguntas.length > 0 ? puntaje / preguntas.length : 0
      let mensaje = 'Sigue explorando el campus, hay muchas mas aves por descubrir!'
      if (ratio === 1) mensaje = 'Perfecto! Eres un experto en aves de la UAO.'
      else if (ratio >= 0.6) mensaje = 'Muy bien! Ya conoces bastante de esta ave.'

      paso('texto final', () => texto(textoFinal, `Puntaje final: ${puntaje}/${preguntas.length}\n${mensaje}`))
      paso('sonido final', () => sonido(sfxFinal))
    }

    const responder = (i: number) => {
      console.log('[Quiz] toque en opcion', i, 'activo:', activo, 'bloqueado:', bloqueado)
      if (!activo || bloqueado) return
      bloqueado = true

      const p = preguntas[indice]
      console.log('[Quiz] pregunta actual:', p)
      const acerto = i === p.correcta
      if (acerto) puntaje += 1

      paso('color opcion elegida', () => {
        ecs.Ui.set(world, opciones[i], {background: acerto ? COLOR_OK : COLOR_ERROR})
      })
      if (!acerto) {
        paso('color opcion correcta', () => {
          ecs.Ui.set(world, opciones[p.correcta], {background: COLOR_OK})
        })
      }
      paso('feedback', () => {
        texto(
          textoFeedback,
          acerto
            ? `Correcto! ${p.dato ?? ''}`
            : `Casi. La respuesta era "${p.opciones[p.correcta]}". ${p.dato ?? ''}`
        )
      })
      paso('puntaje', actualizarPuntaje)
      paso('sonido', () => sonido(acerto ? sfxCorrecto : sfxIncorrecto))

      setTimeout(() => {
        indice += 1
        if (indice >= preguntas.length) terminar()
        else mostrarPregunta()
      }, TIEMPO_FEEDBACK)
    }

    const iniciar = () => {
      if (preguntas.length === 0 || quizEnCurso) return
      quizEnCurso = true
      ultimoTerminado = null
      indice = 0
      puntaje = 0
      activo = true
      ocultar(botonIniciar)
      ocultar(panelFinal)
      mostrar(panelQuiz)
      mostrarPregunta()
    }

    // ---------- Estado inicial ----------
    ocultar(botonIniciar)
    ocultar(panelQuiz)
    ocultar(panelFinal)

    // ---------- Detección de image targets ----------
    world.events.addListener(
      world.events.globalId,
      'reality.imagefound',
      (event) => {
        const data = event.data as {name: string}
        visibles.add(data.name)
        if (data.name === nombreImageTarget && !quizEnCurso) {
          ocultar(panelFinal)
          mostrar(botonIniciar)
        }
      }
    )

    world.events.addListener(
      world.events.globalId,
      'reality.imagelost',
      (event) => {
        const data = event.data as {name: string}
        visibles.delete(data.name)
        // Si el quiz ya empezó no se interrumpe. El botón se oculta solo
        // cuando ya no se ve ninguna tarjeta.
        if (data.name === nombreImageTarget && !quizEnCurso && visibles.size === 0) {
          ocultar(botonIniciar)
        }
      }
    )

    // ---------- Botones ----------
    world.events.addListener(botonIniciar, ecs.input.UI_CLICK, () => {
      if (visibles.has(nombreImageTarget)) iniciar()
    })
    world.events.addListener(botonReintentar, ecs.input.UI_CLICK, () => {
      if (ultimoTerminado === nombreImageTarget) iniciar()
    })
    world.events.addListener(opcionA, ecs.input.UI_CLICK, () => responder(0))
    world.events.addListener(opcionB, ecs.input.UI_CLICK, () => responder(1))
    world.events.addListener(opcionC, ecs.input.UI_CLICK, () => responder(2))
  },
})