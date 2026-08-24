export interface Curiosity {
  id: string;
  question: string;
  emoji: string;
  category: 'Espacio' | 'Animales' | 'Cuerpo' | 'Ciencia';
  detail: string;
}

export const YEIKON_CURIOSITIES: Curiosity[] = [
  {
    id: 'cur-1',
    question: '¿Sabías que las nubes se ven blancas por la luz?',
    emoji: '💞',
    category: 'Ciencia',
    detail: 'Las nubes dispersan toda la luz solar que reciben por igual en todas las direcciones, y como la luz del sol contiene todos los colores juntos, las percibimos blancas y esponjosas.'
  },
  {
    id: 'cur-2',
    question: '¿Sabías que la luna no produce su propia luz?',
    emoji: '💕',
    category: 'Espacio',
    detail: 'La luna es como un espejo gigante en el cielo: brilla por la noche porque refleja la luz que le llega del sol.'
  },
  {
    id: 'cur-3',
    question: '¿Sabías que el sol es una estrella gigante?',
    emoji: '💞',
    category: 'Espacio',
    detail: 'Aunque es de tamaño mediano comparado con otras estrellas del universo, el sol es gigantesco para nosotros y es la estrella que nos da luz y calor cada día.'
  },
  {
    id: 'cur-4',
    question: '¿Sabías que los gatos duermen la mayor parte del día?',
    emoji: '💓',
    category: 'Animales',
    detail: 'Los felinos duermen entre 12 y 16 horas diarias para ahorrar energía, un instinto que heredaron de sus ancestros cazadores salvajes.'
  },
  {
    id: 'cur-5',
    question: '¿Sabías que los perros reconocen miles de olores?',
    emoji: '💗',
    category: 'Animales',
    detail: 'El sentido del olfato de un perro es hasta 100,000 veces más potente que el de los humanos, pudiendo identificar rastros casi imperceptibles.'
  },
  {
    id: 'cur-6',
    question: '¿Sabías que las nubes están hechas de gotas de agua?',
    emoji: '💖',
    category: 'Ciencia',
    detail: 'Están formadas por millones de gotitas de agua diminutas o cristales de hielo tan ligeros que flotan en el aire.'
  },
  {
    id: 'cur-7',
    question: '¿Sabías que el agua cubre casi toda la tierra?',
    emoji: '💕',
    category: 'Ciencia',
    detail: 'Aproximadamente el 71% de la superficie de nuestro planeta está cubierta de agua, principalmente en los océanos.'
  },
  {
    id: 'cur-8',
    question: '¿Sabías que los peces respiran agua con sus agallas?',
    emoji: '💞',
    category: 'Animales',
    detail: 'Las agallas o branquias extraen el oxígeno disuelto en el agua y expulsan el dióxido de carbono directamente al nadar.'
  },
  {
    id: 'cur-9',
    question: '¿Sabías que los árboles producen el oxígeno que respiramos?',
    emoji: '💓',
    category: 'Ciencia',
    detail: 'A través de la fotosíntesis, los árboles absorben dióxido de carbono y liberan oxígeno limpio, actuando como los pulmones del planeta.'
  },
  {
    id: 'cur-10',
    question: '¿Sabías que las mariposas prueban comida con las patas?',
    emoji: '💗',
    category: 'Animales',
    detail: 'Tienen receptores químicos en sus patitas que les permiten saber si una hoja o flor es comestible con solo posarse sobre ella.'
  },
  {
    id: 'cur-11',
    question: '¿Sabías que las estrellas están súper lejos de la tierra?',
    emoji: '💖',
    category: 'Espacio',
    detail: 'Están a distancias tan inmensas que su luz tarda años, siglos o milenios en llegar a nuestros ojos. ¡Vemos el pasado del cosmos!'
  },
  {
    id: 'cur-12',
    question: '¿Sabías que el fuego necesita oxígeno para arder?',
    emoji: '💕',
    category: 'Ciencia',
    detail: 'Sin oxígeno, la reacción química de la combustión no puede ocurrir. Si tapas una vela encendida con un vaso, se apagará en segundos.'
  },
  {
    id: 'cur-13',
    question: '¿Sabías que la miel pura nunca se echa a perder?',
    emoji: '💞',
    category: 'Ciencia',
    detail: 'Debido a su baja humedad y alta acidez, las bacterias no pueden crecer en ella. ¡Se han encontrado frascos de miel comestible en tumbas egipcias de hace 3,000 años!'
  },
  {
    id: 'cur-14',
    question: '¿Sabías que las nutrias se agarran las manos para dormir?',
    emoji: '💓',
    category: 'Animales',
    detail: 'Se toman de las patitas en grupos mientras flotan en el agua para evitar que la corriente las separe y las aleje mientras descansan.'
  },
  {
    id: 'cur-15',
    question: '¿Sabías que los delfines duermen con un ojo abierto?',
    emoji: '💗',
    category: 'Animales',
    detail: 'Solo apagan la mitad de su cerebro a la vez para poder seguir respirando y estar alerta ante cualquier peligro del océano.'
  },
  {
    id: 'cur-16',
    question: '¿Sabías que el pulpo tiene tres corazones?',
    emoji: '💖',
    category: 'Animales',
    detail: 'Dos corazones llevan la sangre a las branquias y el tercero la bombea al resto del cuerpo. Además, ¡su sangre es azul!'
  },
  {
    id: 'cur-17',
    question: '¿Sabías que los tiburones son más viejos que los árboles?',
    emoji: '💕',
    category: 'Animales',
    detail: 'Los tiburones han existido en la Tierra desde hace unos 400 millones de años, mientras que los primeros árboles aparecieron hace unos 350 millones.'
  },
  {
    id: 'cur-18',
    question: '¿Sabías que los flamencos nacen de color gris?',
    emoji: '💞',
    category: 'Animales',
    detail: 'Nacen con plumas grisáceas. Se vuelven rosas gradualmente debido a los pigmentos de los pequeños crustáceos y algas que comen.'
  },
  {
    id: 'cur-19',
    question: '¿Sabías que las jirafas tienen la lengua azul?',
    emoji: '💓',
    category: 'Animales',
    detail: 'Su lengua es de color negro/azul oscuro y mide hasta 50 cm. Este color oscuro la protege de las quemaduras del sol mientras comen hojas altas.'
  },
  {
    id: 'cur-20',
    question: '¿Sabías que un rayo es más caliente que el sol?',
    emoji: '💗',
    category: 'Ciencia',
    detail: 'La descarga de un rayo puede alcanzar los 30,000 grados Celsius, una temperatura cinco veces mayor que la superficie del sol.'
  },
  {
    id: 'cur-21',
    question: '¿Sabías que el hielo flota porque es menos denso?',
    emoji: '💞',
    category: 'Ciencia',
    detail: 'Al congelarse, las moléculas de agua se expanden y forman una estructura que ocupa más volumen, haciéndolo más ligero que el agua líquida.'
  },
  {
    id: 'cur-22',
    question: '¿Sabías que la tierra gira sobre su propio eje?',
    emoji: '💕',
    category: 'Espacio',
    detail: 'Gira a gran velocidad completando una vuelta cada 24 horas, lo que produce la transición constante entre el día y la noche.'
  },
  {
    id: 'cur-23',
    question: '¿Sabías que las montañas crecen muy lentamente?',
    emoji: '💞',
    category: 'Ciencia',
    detail: 'Debido al choque de las placas tectónicas bajo el suelo, algunas cordilleras como el Himalaya se elevan unos pocos milímetros cada año.'
  },
  {
    id: 'cur-24',
    question: '¿Sabías que los desiertos se vuelven fríos de noche?',
    emoji: '💓',
    category: 'Ciencia',
    detail: 'Al no haber humedad ni nubes que retengan el calor acumulado durante el día, la temperatura del suelo desértico cae drásticamente al ponerse el sol.'
  },
  {
    id: 'cur-25',
    question: '¿Sabías que el olor a lluvia viene de bacterias?',
    emoji: '💗',
    category: 'Ciencia',
    detail: 'Este olor tan agradable (llamado petricor) es causado por una sustancia química liberada por bacterias del suelo al contacto con las gotas de agua.'
  },
  {
    id: 'cur-26',
    question: '¿Sabías que las auroras son luces en el cielo?',
    emoji: '💖',
    category: 'Espacio',
    detail: 'Se producen cuando partículas cargadas de energía solar chocan con el campo magnético de la Tierra, creando cortinas de luz verde y rosa.'
  },
  {
    id: 'cur-27',
    question: '¿Sabías que el viento nace por diferencias de calor?',
    emoji: '💕',
    category: 'Ciencia',
    detail: 'El sol calienta unas zonas de la Tierra más que otras. El aire caliente sube y el aire frío se desplaza para ocupar su lugar, creando el viento.'
  },
  {
    id: 'cur-28',
    question: '¿Sabías que la gravedad nos mantiene pegados al suelo?',
    emoji: '💞',
    category: 'Ciencia',
    detail: 'La inmensa masa de la Tierra ejerce una fuerza de atracción invisible sobre todo lo que tiene cerca, evitando que salgamos flotando al espacio.'
  },
  {
    id: 'cur-29',
    question: '¿Sabías que la luna causa las mareas del mar?',
    emoji: '💓',
    category: 'Ciencia',
    detail: 'La gravedad de la luna atrae el agua de los océanos hacia ella mientras la Tierra gira, creando el flujo constante de marea alta y baja.'
  },
  {
    id: 'cur-30',
    question: '¿Sabías que el panda gigante solo come bambú?',
    emoji: '💗',
    category: 'Animales',
    detail: 'El 99% de su dieta diaria consiste en hojas y tallos de bambú, llegando a masticar hasta 12 horas al día para obtener suficientes nutrientes.'
  },
  {
    id: 'cur-31',
    question: '¿Sabías que un caracol puede dormir tres años?',
    emoji: '💖',
    category: 'Animales',
    detail: 'Si el clima es extremo (muy seco o frío), el caracol puede entrar en un estado de hibernación prolongado dentro de su concha para sobrevivir.'
  },
  {
    id: 'cur-32',
    question: '¿Sabías que el colibrí mueve sus alas súper rápido?',
    emoji: '💕',
    category: 'Animales',
    detail: 'Puede batir sus alas entre 50 y 80 veces por segundo, lo que le permite quedarse suspendido en el aire y volar hacia atrás.'
  },
  {
    id: 'cur-33',
    question: '¿Sabías que las manzanas flotan en el agua?',
    emoji: '💞',
    category: 'Ciencia',
    detail: 'Esto se debe a que el 25% del volumen de una manzana es simplemente aire atrapado en su interior, lo que la hace menos densa que el agua.'
  },
  {
    id: 'cur-34',
    question: '¿Sabías que las estrellas de mar no tienen cerebro?',
    emoji: '💓',
    category: 'Animales',
    detail: 'No tienen cerebro centralizado ni sangre. Tienen un sistema nervioso simple y bombean agua de mar a través de su cuerpo para moverse.'
  },
  {
    id: 'cur-35',
    question: '¿Sabías que los koalas tienen huellas dactilares?',
    emoji: '💗',
    category: 'Animales',
    detail: 'Sus huellas digitales son tan idénticas a las de los humanos que incluso bajo el microscopio es difícil distinguirlas.'
  },
  {
    id: 'cur-36',
    question: '¿Sabías que los camellos guardan grasa en sus jorobas?',
    emoji: '💖',
    category: 'Animales',
    detail: 'No almacenan agua en ellas; almacenan grasa que utilizan como fuente de energía cuando pasan largos días sin encontrar alimento.'
  },
  {
    id: 'cur-37',
    question: '¿Sabías que los búhos no pueden mover sus ojos?',
    emoji: '💕',
    category: 'Animales',
    detail: 'Tienen ojos tubulares inmóviles. Para compensar, pueden girar su cabeza de manera asombrosa hasta 270 grados en ambas direcciones.'
  },
  {
    id: 'cur-38',
    question: '¿Sabías que las hormigas no tienen pulmones?',
    emoji: '💞',
    category: 'Animales',
    detail: 'Respiran a través de pequeños orificios a los lados de su cuerpo llamados espiráculos, que transportan el oxígeno por tubos diminutos.'
  },
  {
    id: 'cur-39',
    question: '¿Sabías que los elefantes no pueden saltar?',
    emoji: '💓',
    category: 'Animales',
    detail: 'Debido a su enorme peso y a la estructura anatómica de sus patas y articulaciones, son el único mamífero terrestre incapaz de despegar las cuatro patas del suelo.'
  },
  {
    id: 'cur-40',
    question: '¿Sabías que la ballena azul es el animal más grande?',
    emoji: '💗',
    category: 'Animales',
    detail: 'Puede medir más de 30 metros de largo y pesar hasta 180 toneladas. ¡Solo su lengua pesa tanto como un elefante adulto!'
  },
  {
    id: 'cur-41',
    question: '¿Sabías que las cebras tienen rayas únicas?',
    emoji: '💖',
    category: 'Animales',
    detail: 'El patrón de rayas de cada cebra es completamente individual, como las huellas dactilares de una persona. Les ayuda a reconocerse entre sí.'
  },
  {
    id: 'cur-42',
    question: '¿Sabías que los mosquitos buscan el sudor humano?',
    emoji: '💕',
    category: 'Animales',
    detail: 'Se sienten atraídos por el dióxido de carbono que exhalamos y el olor del ácido láctico y el calor de nuestro sudor corporal.'
  },
  {
    id: 'cur-43',
    question: '¿Sabías que los pingüinos eligen pareja para siempre?',
    emoji: '💞',
    category: 'Animales',
    detail: 'Muchas especies de pingüinos son monógamas. Para cortejar, el macho le regala a la hembra la piedrecita más perfecta que puede encontrar.'
  },
  {
    id: 'cur-44',
    question: '¿Sabías que las abejas se comunican bailando?',
    emoji: '💓',
    category: 'Animales',
    detail: 'Realizan una coreografía en forma de ocho (llamada danza del meneo) para indicar a sus compañeras de colmena la dirección exacta y distancia de las flores.'
  },
  {
    id: 'cur-45',
    question: '¿Sabías que los perezosos se mueven muy lento?',
    emoji: '💗',
    category: 'Animales',
    detail: 'Tienen un metabolismo extremadamente lento. Se desplazan a una velocidad promedio de apenas 2 metros por minuto.'
  },
  {
    id: 'cur-46',
    question: '¿Sabías que los camaleones mueven los ojos independientes?',
    emoji: '💖',
    category: 'Animales',
    detail: 'Cada ojo puede girar y enfocar por separado, lo que les da una visión completa de 360 grados sin necesidad de mover la cabeza.'
  },
  {
    id: 'cur-47',
    question: '¿Sabías que el caballito de mar macho incuba los huevos?',
    emoji: '💕',
    category: 'Animales',
    detail: 'La hembra deposita los huevos en una bolsa en el abdomen del macho, quien los fertiliza, cuida y da a luz tras unas semanas.'
  },
  {
    id: 'cur-48',
    question: '¿Sabías que los cocodrilos no sacan la lengua?',
    emoji: '💞',
    category: 'Animales',
    detail: 'Tienen una membrana resistente que mantiene su lengua sujeta al paladar superior, impidiéndoles sacarla fuera de sus fauces.'
  },
  {
    id: 'cur-49',
    question: '¿Sabías que las ardillas olvidan sus nueces enterradas?',
    emoji: '💓',
    category: 'Animales',
    detail: 'Esconden miles de nueces y bellotas bajo tierra como reserva. Al olvidar dónde las pusieron, ¡ayudan a plantar millones de nuevos árboles!'
  },
  {
    id: 'cur-50',
    question: '¿Sabías que la luz del sol tarda ocho minutos en llegar?',
    emoji: '💗',
    category: 'Espacio',
    detail: 'El sol está a unos 150 millones de kilómetros de nosotros. La luz viaja tan rápido que recorre esa inmensa distancia en unos 8 minutos y 20 segundos.'
  },
  {
    id: 'cur-51',
    question: '¿Sabías que en el espacio no hay sonido?',
    emoji: '💖',
    category: 'Espacio',
    detail: 'El sonido necesita un medio (como el aire o el agua) para propagarse por vibración. En el vacío absoluto del espacio, todo es silencio total.'
  },
  {
    id: 'cur-52',
    question: '¿Sabías que saturno tiene anillos de hielo y roca?',
    emoji: '💕',
    category: 'Espacio',
    detail: 'Sus impresionantes anillos están compuestos por billones de fragmentos que van desde granos microscópicos de polvo hasta rocas del tamaño de montañas.'
  },
  {
    id: 'cur-53',
    question: '¿Sabías que jupiter es el planeta mas grande?',
    emoji: '💞',
    category: 'Espacio',
    detail: 'Es un gigante gaseoso tan colosal que en su interior podrían caber más de 1,300 planetas del tamaño de la Tierra.'
  },
  {
    id: 'cur-54',
    question: '¿Sabías que venus gira en sentido contrario?',
    emoji: '💓',
    category: 'Espacio',
    detail: 'Casi todos los planetas giran en el mismo sentido, pero Venus gira sobre sí mismo al revés, por lo que allí el sol sale por el oeste y se pone por el este.'
  },
  {
    id: 'cur-55',
    question: '¿Sabías que el cuerpo humano tiene más de doscientos huesos?',
    emoji: '💗',
    category: 'Cuerpo',
    detail: 'Al nacer tenemos unos 300 huesos blandos que se van uniendo. En la edad adulta, nos quedamos con un total de 206 huesos fuertes.'
  },
  {
    id: 'cur-56',
    question: '¿Sabías que la piel es el organo mas grande del cuerpo?',
    emoji: '💖',
    category: 'Cuerpo',
    detail: 'La piel nos protege de microbios, regula nuestra temperatura y nos permite sentir texturas. ¡Pesa unos 4 a 5 kilos en total!'
  },
  {
    id: 'cur-57',
    question: '¿Sabías que las pestañas protegen tus ojos del polvo?',
    emoji: '💕',
    category: 'Cuerpo',
    detail: 'Actúan como un escudo protector, atrapando partículas de polvo, arena y sudor para evitar que dañen la sensible superficie de los ojos.'
  },
  {
    id: 'cur-58',
    question: '¿Sabías que la saliva ayuda a sentir el sabor?',
    emoji: '💞',
    category: 'Cuerpo',
    detail: 'Para que las papilas gustativas reconozcan los sabores de la comida, esta debe disolverse primero en los líquidos de la saliva.'
  },
  {
    id: 'cur-59',
    question: '¿Sabías que los dientes son más duros que los huesos?',
    emoji: '💓',
    category: 'Cuerpo',
    detail: 'El esmalte dental que recubre la superficie de los dientes es la sustancia mineral más dura y resistente de todo nuestro organismo.'
  },
  {
    id: 'cur-60',
    question: '¿Sabías que parpadear mantiene limpios los ojos?',
    emoji: '💗',
    category: 'Cuerpo',
    detail: 'Parpadeamos unas 15 veces por minuto en promedio para esparcir lágrimas, manteniendo el ojo húmedo y libre de cualquier impureza.'
  },
  {
    id: 'cur-61',
    question: '¿Sabías que el pelo protege la cabeza del frío?',
    emoji: '💖',
    category: 'Cuerpo',
    detail: 'El cabello actúa como un aislante térmico natural que retiene el calor de nuestra cabeza y la protege de los dañinos rayos del sol.'
  },
  {
    id: 'cur-62',
    question: '¿Sabías que el sudor refresca la piel caliente?',
    emoji: '💕',
    category: 'Cuerpo',
    detail: 'Cuando sube la temperatura corporal, las glándulas liberan sudor que al evaporarse sobre la piel enfría el cuerpo de manera muy eficiente.'
  },
  {
    id: 'cur-63',
    question: '¿Sabías que las huellas de tus dedos son únicas?',
    emoji: '💞',
    category: 'Cuerpo',
    detail: 'Nadie en el mundo entero, ni siquiera los gemelos idénticos, comparte los mismos patrones de líneas y espirales en la punta de los dedos.'
  },
  {
    id: 'cur-64',
    question: '¿Sabías que dormir ayuda a fijar tus recuerdos?',
    emoji: '💓',
    category: 'Cuerpo',
    detail: 'Mientras duermes profundamente, el cerebro procesa, organiza y almacena toda la información importante que aprendiste durante el día.'
  },
  {
    id: 'cur-65',
    question: '¿Sabías que los oídos ayudan a mantener el equilibrio?',
    emoji: '💗',
    category: 'Cuerpo',
    detail: 'Dentro del oído interno hay canales llenos de líquido y pequeños cilios sensores que le indican al cerebro tu posición exacta para no caerte.'
  },
  {
    id: 'cur-66',
    question: '¿Sabías que las plantas necesitan luz para crecer?',
    emoji: '💖',
    category: 'Ciencia',
    detail: 'Usan la luz solar como energía para transformar el agua y el aire en su propio alimento mediante el asombroso proceso de fotosíntesis.'
  },
  {
    id: 'cur-67',
    question: '¿Sabías que el mar es salado por los minerales?',
    emoji: '💕',
    category: 'Ciencia',
    detail: 'El agua de lluvia disuelve los minerales de las rocas terrestres y los ríos los arrastran hacia el océano, donde se han acumulado durante eones.'
  },
  {
    id: 'cur-68',
    question: '¿Sabías que las nubes negras tienen mucha agua?',
    emoji: '💞',
    category: 'Ciencia',
    detail: 'Son nubes muy altas y densas cargadas de agua. Al ser tan gruesas, la luz del sol no puede atravesarlas, haciéndolas lucir grises o negras.'
  },
  {
    id: 'cur-69',
    question: '¿Sabías que el granizo es hielo que cae del cielo?',
    emoji: '💓',
    category: 'Ciencia',
    detail: 'Se forma en tormentas cuando fuertes corrientes de aire empujan las gotas de lluvia hacia zonas de la atmósfera tan frías que se congelan en capas.'
  },
  {
    id: 'cur-70',
    question: '¿Sabías que los volcanes botan magma de la tierra?',
    emoji: '💗',
    category: 'Ciencia',
    detail: 'El magma es roca fundida a altísima temperatura que sube desde las profundidades de la Tierra. Cuando sale al exterior se le llama lava.'
  },
  {
    id: 'cur-71',
    question: '¿Sabías que los terremotos ocurren por placas tectonicas?',
    emoji: '💖',
    category: 'Ciencia',
    detail: 'La corteza de la Tierra está rota en enormes piezas llamadas placas tectónicas. Cuando rozan o chocan entre sí, liberan energía que hace temblar el suelo.'
  },
  {
    id: 'cur-72',
    question: '¿Sabías que los ríos siempre corren hacia el mar?',
    emoji: '💕',
    category: 'Ciencia',
    detail: 'Por la fuerza de la gravedad, el agua de las montañas busca siempre el camino más bajo posible, terminando casi siempre en los océanos.'
  },
  {
    id: 'cur-73',
    question: '¿Sabías que el arcoíris sale por la luz y el agua?',
    emoji: '💞',
    category: 'Ciencia',
    detail: 'Las gotas de lluvia actúan como prismas diminutos. Al cruzarlas, la luz blanca del sol se separa y despliega todos sus bellos colores.'
  },
  {
    id: 'cur-74',
    question: '¿Sabías que la nieve se crea con gotas congeladas?',
    emoji: '💓',
    category: 'Ciencia',
    detail: 'Cuando el vapor de agua en las nubes se congela a temperaturas bajo cero, forma cristales de hielo geométricos perfectos que caen como copos.'
  },
  {
    id: 'cur-75',
    question: '¿Sabías que la capa de ozono protege del sol?',
    emoji: '💗',
    category: 'Espacio',
    detail: 'Es un escudo gaseoso invisible en la atmósfera superior que absorbe la mayor parte de la radiación ultravioleta perjudicial del sol.'
  },
  {
    id: 'cur-76',
    question: '¿Sabías que dentro de las cuevas no cambia el clima?',
    emoji: '💖',
    category: 'Ciencia',
    detail: 'Al estar aisladas bajo tierra, la temperatura dentro de las cuevas profundas se mantiene estable y constante durante todo el año.'
  },
  {
    id: 'cur-77',
    question: '¿Sabías que el agua se evapora con el calor?',
    emoji: '💕',
    category: 'Ciencia',
    detail: 'El calor agita las moléculas del agua líquida hasta que se convierten en un gas invisible llamado vapor de agua que sube al cielo.'
  },
  {
    id: 'cur-78',
    question: '¿Sabías que los glaciares son ríos de hielo lento?',
    emoji: '💞',
    category: 'Ciencia',
    detail: 'Son acumulaciones masivas de nieve compactada durante milenios que fluyen muy lentamente ladera abajo debido a su propio peso inmenso.'
  },
  {
    id: 'cur-79',
    question: '¿Sabías que la tierra funciona como un imán gigante?',
    emoji: '💓',
    category: 'Espacio',
    detail: 'Tiene un núcleo de hierro líquido en movimiento que genera un potente campo magnético a su alrededor, lo que hace funcionar a las brújulas.'
  },
  {
    id: 'cur-80',
    question: '¿Sabías que los océanos están llenos de vida?',
    emoji: '💗',
    category: 'Ciencia',
    detail: 'Albergan desde plancton microscópico hasta los gigantescos cetáceos. Se estima que más del 80% de las especies marinas aún no han sido descubiertas.'
  },
  {
    id: 'cur-81',
    question: '¿Sabías que las estrellas fugaces son restos de roca?',
    emoji: '💖',
    category: 'Espacio',
    detail: 'Son fragmentos de polvo y roca espacial (meteoroides) que entran a gran velocidad en la atmósfera terrestre y se queman por fricción, brillando.'
  },
  {
    id: 'cur-82',
    question: '¿Sabías que los dinosaurios vivieron hace millones de años?',
    emoji: '💕',
    category: 'Ciencia',
    detail: 'Gobernaron la Tierra durante unos 165 millones de años en la era Mesozoica, hasta su misteriosa extinción hace unos 66 millones de años.'
  },
  {
    id: 'cur-83',
    question: '¿Sabías que las tortugas de mar viven muchos años?',
    emoji: '💞',
    category: 'Animales',
    detail: 'Tienen un metabolismo pausado y pueden vivir más de 80 o 100 años en el mar libre, viajando miles de millas por los océanos.'
  },
  {
    id: 'cur-84',
    question: '¿Sabías que los patos tienen plumas impermeables?',
    emoji: '💓',
    category: 'Animales',
    detail: 'Tienen una glándula cerca de la cola que produce un aceite especial. Se lo esparcen por el plumaje con el pico para evitar mojarse y poder flotar.'
  },
  {
    id: 'cur-85',
    question: '¿Sabías que los perros ven mejor en la penumbra?',
    emoji: '💗',
    category: 'Animales',
    detail: 'Tienen una capa especial reflectante detrás de la retina llamada tapetum lucidum que duplica la luz disponible en la oscuridad.'
  },
  {
    id: 'cur-86',
    question: '¿Sabías que los conejos mueven las orejas para oír?',
    emoji: '💖',
    category: 'Animales',
    detail: 'Sus grandes orejas giran de forma independiente para detectar ruidos muy leves de posibles depredadores en cualquier dirección.'
  },
  {
    id: 'cur-87',
    question: '¿Sabías que las ranas pueden respirar por la piel?',
    emoji: '💕',
    category: 'Animales',
    detail: 'Tienen una piel húmeda, delgada y permeable que les permite absorber oxígeno directamente del agua y del aire que las rodea.'
  },
  {
    id: 'cur-88',
    question: '¿Sabías que las serpientes no tienen patas?',
    emoji: '💞',
    category: 'Animales',
    detail: 'Se desplazan mediante la ondulación lateral de sus cuerpos flexibles apoyándose en las escamas fuertes de su abdomen.'
  },
  {
    id: 'cur-89',
    question: '¿Sabías que los murciélagos vuelan con sus alas de piel?',
    emoji: '💓',
    category: 'Animales',
    detail: 'Son los únicos mamíferos capaces de volar de verdad. Sus alas están hechas de una delgada membrana elástica de piel estirada sobre sus dedos largos.'
  },
  {
    id: 'cur-90',
    question: '¿Sabías que las medusas no tienen corazón?',
    emoji: '💗',
    category: 'Animales',
    detail: 'No tienen corazón, cerebro, huesos ni sangre. Su cuerpo es 95% agua y tienen una red nerviosa muy simple.'
  },
  {
    id: 'cur-91',
    question: '¿Sabías que los cangrejos caminan de lado?',
    emoji: '💖',
    category: 'Animales',
    detail: 'La articulación de sus patas está diseñada para doblarse solo hacia arriba y abajo, lo que les resulta mucho más ágil y rápido para correr de lado.'
  },
  {
    id: 'cur-92',
    question: '¿Sabías que los pulpos pueden cambiar de color?',
    emoji: '💕',
    category: 'Animales',
    detail: 'Tienen células de pigmento especiales llamadas cromatóforos en su piel, lo que les permite mimetizarse perfectamente con las rocas y corales en segundos.'
  },
  {
    id: 'cur-93',
    question: '¿Sabías que los lobos se comunican aullando?',
    emoji: '💞',
    category: 'Animales',
    detail: 'Aúllan para reunir a la manada, advertir a intrusos de su territorio o simplemente para celebrar que están juntos.'
  },
  {
    id: 'cur-94',
    question: '¿Sabías que los osos duermen mucho en invierno?',
    emoji: '💓',
    category: 'Animales',
    detail: 'Entran en un letargo profundo para conservar energía durante los meses más fríos del año, cuando la comida en la naturaleza es escasa.'
  },
  {
    id: 'cur-95',
    question: '¿Sabías que las ovejas producen lana suave?',
    emoji: '💗',
    category: 'Animales',
    detail: 'Su denso plumón de lana crece constantemente para protegerlas de la humedad y el frío extremo de los prados.'
  },
  {
    id: 'cur-96',
    question: '¿Sabías que los caballos pueden dormir de pie?',
    emoji: '💖',
    category: 'Animales',
    detail: 'Tienen un mecanismo de bloqueo en las articulaciones de sus patas que les permite relajar por completo los músculos sin llegar a caerse.'
  },
  {
    id: 'cur-97',
    question: '¿Sabías que las vacas tienen varios compartimentos estomacales?',
    emoji: '💕',
    category: 'Animales',
    detail: 'Tienen un estómago dividido en 4 secciones (rumen, retículo, omaso y abomaso) para fermentar y digerir adecuadamente la hierba dura que comen.'
  },
  {
    id: 'cur-98',
    question: '¿Sabías que las gallinas no pueden volar muy alto?',
    emoji: '💞',
    category: 'Animales',
    detail: 'Sus alas cortas y cuerpo pesado las limitan a dar pequeños planeos de corta distancia, ideales para subir a ramas bajas o vallas para protegerse.'
  },
  {
    id: 'cur-99',
    question: '¿Sabías que los loros aprenden a imitar voces?',
    emoji: '💓',
    category: 'Animales',
    detail: 'Tienen un órgano vocal llamado siringe muy desarrollado y son aves muy sociables que repiten sonidos para integrarse y comunicarse con su entorno.'
  },
  {
    id: 'cur-100',
    question: '¿Sabías que la naturaleza está llena de sorpresas?',
    emoji: '💗',
    category: 'Ciencia',
    detail: 'Cada rincón de nuestro mundo, desde los mares profundos hasta los bosques altos, alberga millones de misterios y bellezas listos para descubrir.'
  }
];
