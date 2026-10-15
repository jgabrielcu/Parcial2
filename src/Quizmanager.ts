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

    const preguntas = PREGUNTAS[nombreImageTarget] || []
    const opciones = [opcionA, opcionB, opcionC]

    // Estado propio de esta ave
    let indice = 0
    let puntaje = 0
    let activo = false      // el quiz de ESTA ave esta corriendo
    let bloqueado = false   // true mientras se muestra la retroalimentacion

    if (preguntas.length === 0) {
      console.warn('[Quiz] No hay preguntas para el target:', nombreImageTarget)
    }

    // ---------- Utilidades ----------
    const mostrar = (eid: any) => ecs.Hidden.remove(world, eid)
    const ocultar = (eid: any) => ecs.Hidden.set(world, eid, {})
    const texto = (eid: any, t: string) => ecs.Ui.set(world, eid, {text: t})

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
      texto(textoPregunta, `${indice + 1}/${preguntas.length}  ${p.texto}`)
      texto(textoFeedback, '')
      opciones.forEach((eid, i) => {
        ecs.Ui.set(world, eid, {text: p.opciones[i], background: COLOR_BASE})
      })
      actualizarPuntaje()
    }

    const terminar = () => {
      activo = false
      quizEnCurso = false
      ultimoTerminado = nombreImageTarget
      ocultar(panelQuiz)
      mostrar(panelFinal)

      const ratio = puntaje / preguntas.length
      let mensaje = 'Sigue explorando el campus, hay muchas mas aves por descubrir!'
      if (ratio === 1) mensaje = 'Perfecto! Eres un experto en aves de la UAO.'
      else if (ratio >= 0.6) mensaje = 'Muy bien! Ya conoces bastante de esta ave.'

      texto(textoFinal, `Puntaje final: ${puntaje}/${preguntas.length}\n${mensaje}`)
      sonido(sfxFinal)
    }

    const responder = (i: number) => {
      if (!activo || bloqueado) return
      bloqueado = true

      const p = preguntas[indice]
      const acerto = i === p.correcta

      if (acerto) {
        puntaje += 1
        ecs.Ui.set(world, opciones[i], {background: COLOR_OK})
        texto(textoFeedback, `Correcto! ${p.dato}`)
        sonido(sfxCorrecto)
      } else {
        ecs.Ui.set(world, opciones[i], {background: COLOR_ERROR})
        ecs.Ui.set(world, opciones[p.correcta], {background: COLOR_OK})
        texto(textoFeedback, `Casi. La respuesta era "${p.opciones[p.correcta]}". ${p.dato}`)
        sonido(sfxIncorrecto)
      }
      actualizarPuntaje()

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

    // ---------- Deteccion de image targets ----------
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
        // Si el quiz ya empezo no se interrumpe. El boton se oculta solo
        // cuando ya no se ve ninguna tarjeta.
        if (data.name === nombreImageTarget && !quizEnCurso && visibles.size === 0) {
          ocultar(botonIniciar)
        }
      }
    )

    // ---------- Botones ----------
    // Solo responde la instancia del ave que se esta viendo / que acaba de terminar.
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