// Banco de preguntas del quiz.
// La CLAVE de cada grupo debe ser EXACTAMENTE el nombre del image target
// (pestaña Targets): Colibri, Paloma, Guacamaya, Garza.
//
// IMPORTANTE: los datos de abajo son de ejemplo. Reemplázalos con la
// información de la base de datos de aves de la UAO (especie exacta, hábitat, etc.).

export type Pregunta = {
  texto: string
  opciones: [string, string, string]  // siempre 3 opciones
  correcta: 0 | 1 | 2                 // índice de la opción correcta (0, 1 o 2)
  dato: string                        // dato curioso que se muestra al responder
}

export const PREGUNTAS: Record<string, Pregunta[]> = {
  Colibri: [
    {
      texto: '¿De qué se alimenta principalmente el colibrí?',
      opciones: ['Semillas', 'Néctar de flores', 'Peces'],
      correcta: 1,
      dato: 'Su pico largo y su lengua le permiten alcanzar el néctar dentro de las flores.',
    },
    {
      texto: '¿Qué puede hacer el colibrí que casi ninguna otra ave logra?',
      opciones: ['Volar hacia atrás', 'Nadar bajo el agua', 'Correr muy rápido'],
      correcta: 0,
      dato: 'Es la única ave capaz de mantener un vuelo hacia atrás.',
    },
    {
      texto: '¿Qué hace posible que el colibrí se quede quieto en el aire?',
      opciones: ['Planear con el viento', 'Aletear muy rápido', 'Colgarse de una rama'],
      correcta: 1,
      dato: 'Aletea decenas de veces por segundo para mantenerse suspendido frente a la flor.',
    },
  ],

  Paloma: [
    {
      texto: '¿De qué se alimenta la paloma doméstica?',
      opciones: ['Semillas y granos', 'Néctar', 'Insectos únicamente'],
      correcta: 0,
      dato: 'Es un ave granívora: busca semillas y granos en el suelo.',
    },
    {
      texto: '¿Qué habilidad es famosa en las palomas?',
      opciones: ['Imitar voces humanas', 'Orientarse y volver a casa', 'Bucear'],
      correcta: 1,
      dato: 'Por su orientación fueron usadas durante siglos como mensajeras.',
    },
    {
      texto: '¿Qué sonido característico emite la paloma?',
      opciones: ['Arrullo', 'Silbido agudo', 'Graznido'],
      correcta: 0,
      dato: 'El arrullo se usa para comunicarse y en el cortejo.',
    },
  ],

  Guacamaya: [
    {
      texto: '¿Qué caracteriza el pico de la guacamaya?',
      opciones: ['Es largo y delgado', 'Es fuerte y curvo', 'Es plano como el de un pato'],
      correcta: 1,
      dato: 'Su pico fuerte le sirve para romper semillas duras y trepar por las ramas.',
    },
    {
      texto: '¿De qué se alimenta principalmente?',
      opciones: ['Frutos, semillas y nueces', 'Peces', 'Carroña'],
      correcta: 0,
      dato: 'Las guacamayas ayudan a dispersar semillas en los bosques donde viven.',
    },
    {
      texto: '¿Qué habilidad tienen las guacamayas, como otros loros?',
      opciones: ['Cavar túneles', 'Imitar sonidos y voces', 'Respirar bajo el agua'],
      correcta: 1,
      dato: 'Son muy sociales y se comunican con gritos fuertes y sonidos aprendidos.',
    },
  ],

  Garza: [
    {
      texto: '¿Dónde suele encontrarse la garza?',
      opciones: ['Cerca del agua y humedales', 'En el desierto', 'En cuevas'],
      correcta: 0,
      dato: 'Busca su alimento en orillas, lagunas, ríos y zonas encharcadas.',
    },
    {
      texto: '¿Para qué le sirven sus patas largas?',
      opciones: ['Para nadar', 'Para caminar en aguas poco profundas', 'Para cavar'],
      correcta: 1,
      dato: 'Camina despacio por el agua y atrapa peces, ranas e insectos con su pico.',
    },
    {
      texto: '¿Cómo suele volar la garza con el cuello?',
      opciones: ['Recogido en forma de S', 'Estirado hacia atrás', 'Escondido bajo el ala'],
      correcta: 0,
      dato: 'Al volar recoge el cuello, a diferencia de otras aves zancudas como las grullas.',
    },
  ],
}