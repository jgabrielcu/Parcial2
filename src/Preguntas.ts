// Banco de preguntas del quiz.
// Todo el texto esta escrito SIN acentos, sin la letra n con tilde y sin
// signos de apertura, porque la fuente de los textos de la interfaz no los
// muestra (aparecen como cuadritos []).
//
// La CLAVE de cada grupo debe ser EXACTAMENTE el nombre del image target
// (pestana Targets): Colibri, Paloma, Guacamaya, Garza.
//
// IMPORTANTE: los datos son de ejemplo. Reemplazalos con la informacion de
// las fichas de las aves de la UAO.

export type Pregunta = {
  texto: string
  opciones: [string, string, string]  // siempre 3 opciones
  correcta: 0 | 1 | 2                 // posicion de la respuesta correcta (0, 1 o 2)
  dato: string                        // dato curioso que se muestra al responder
}

export const PREGUNTAS: Record<string, Pregunta[]> = {
  Colibri: [
    {
      texto: 'De que se alimenta principalmente el colibri?',
      opciones: ['Semillas', 'Nectar de flores', 'Peces'],
      correcta: 1,
      dato: 'Su pico largo y su lengua le permiten alcanzar el nectar dentro de las flores.',
    },
    {
      texto: 'Que puede hacer el colibri que casi ninguna otra ave logra?',
      opciones: ['Volar hacia atras', 'Nadar bajo el agua', 'Correr muy rapido'],
      correcta: 0,
      dato: 'Es la unica ave capaz de mantener un vuelo hacia atras.',
    },
    {
      texto: 'Que le permite al colibri quedarse quieto en el aire?',
      opciones: ['Planear con el viento', 'Aletear muy rapido', 'Colgarse de una rama'],
      correcta: 1,
      dato: 'Aletea decenas de veces por segundo para mantenerse frente a la flor.',
    },
  ],

  Paloma: [
    {
      texto: 'De que se alimenta la paloma domestica?',
      opciones: ['Semillas y granos', 'Nectar', 'Solo insectos'],
      correcta: 0,
      dato: 'Es un ave granivora: busca semillas y granos en el suelo.',
    },
    {
      texto: 'Que habilidad es famosa en las palomas?',
      opciones: ['Imitar voces humanas', 'Orientarse y volver a casa', 'Bucear'],
      correcta: 1,
      dato: 'Por su orientacion fueron usadas durante siglos como mensajeras.',
    },
    {
      texto: 'Que sonido caracteristico emite la paloma?',
      opciones: ['Arrullo', 'Silbido agudo', 'Graznido'],
      correcta: 0,
      dato: 'El arrullo se usa para comunicarse y en el cortejo.',
    },
  ],

  Guacamaya: [
    {
      texto: 'Como es el pico de la guacamaya?',
      opciones: ['Largo y delgado', 'Fuerte y curvo', 'Plano como el de un pato'],
      correcta: 1,
      dato: 'Su pico fuerte sirve para romper semillas duras y para trepar por las ramas.',
    },
    {
      texto: 'De que se alimenta principalmente?',
      opciones: ['Frutos, semillas y nueces', 'Peces', 'Animales muertos'],
      correcta: 0,
      dato: 'Las guacamayas ayudan a dispersar semillas en los bosques donde viven.',
    },
    {
      texto: 'Que habilidad tienen las guacamayas, como otros loros?',
      opciones: ['Cavar tuneles', 'Imitar sonidos y voces', 'Respirar bajo el agua'],
      correcta: 1,
      dato: 'Son muy sociales y se comunican con gritos fuertes y sonidos aprendidos.',
    },
  ],

  Garza: [
    {
      texto: 'Donde suele encontrarse la garza?',
      opciones: ['Cerca del agua y humedales', 'En el desierto', 'En cuevas'],
      correcta: 0,
      dato: 'Busca su alimento en orillas, lagunas, rios y zonas encharcadas.',
    },
    {
      texto: 'Para que le sirven sus patas largas?',
      opciones: ['Para nadar', 'Para caminar en aguas poco profundas', 'Para cavar'],
      correcta: 1,
      dato: 'Camina despacio por el agua y atrapa peces, ranas e insectos con su pico.',
    },
    {
      texto: 'Como suele llevar el cuello al volar la garza?',
      opciones: ['Recogido en forma de S', 'Estirado hacia atras', 'Escondido bajo el ala'],
      correcta: 0,
      dato: 'Al volar recoge el cuello, a diferencia de otras aves zancudas como las grullas.',
    },
  ],
}