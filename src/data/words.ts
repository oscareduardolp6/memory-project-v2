// Sustantivos comunes en español, una palabra por token. Se deduplican al cargar.
const RAW = `
árbol hoja raíz rama flor rosa tulipán girasol margarita lirio orquídea cactus helecho musgo pasto césped semilla tronco bosque selva
jungla pradera llanura montaña colina volcán cueva valle cañón desierto oasis duna playa costa isla península bahía golfo océano mar
lago laguna río arroyo cascada pantano glaciar iceberg cumbre acantilado roca piedra arena barro tierra polvo lodo cristal diamante rubí
esmeralda zafiro perla oro plata cobre hierro bronce acero aluminio plomo carbón petróleo mármol granito ladrillo cemento madera bambú
sol luna estrella planeta cometa meteorito galaxia universo cielo nube lluvia nieve granizo relámpago trueno tormenta huracán tornado
viento brisa niebla rocío escarcha arcoíris amanecer atardecer anochecer noche mañana tarde mediodía medianoche aurora eclipse sombra luz
perro gato caballo vaca toro oveja cabra cerdo gallina gallo pollito pato ganso pavo conejo ratón rata ardilla castor hámster burro mula
león tigre leopardo jaguar pantera guepardo lince puma lobo zorro oso panda koala canguro elefante jirafa cebra hipopótamo rinoceronte
camello llama alpaca venado ciervo alce búfalo bisonte gorila chimpancé mono orangután lémur murciélago erizo topo nutria foca morsa
ballena delfín tiburón pulpo calamar medusa estrella cangrejo langosta camarón almeja ostra caracol tortuga cocodrilo caimán lagarto
iguana camaleón serpiente víbora cobra rana sapo salamandra pez salmón atún trucha sardina bacalao anguila mariposa polilla abeja avispa
hormiga mosca mosquito grillo saltamontes libélula escarabajo mariquita araña escorpión gusano lombriz luciérnaga cucaracha pulga piojo
águila halcón búho lechuza cuervo paloma gorrión canario loro perico tucán flamenco pelícano gaviota cisne pingüino avestruz colibrí
pájaro garza cigüeña buitre cóndor pavorreal golondrina urraca ruiseñor jilguero codorniz faisán dinosaurio dragón unicornio sirena
manzana pera plátano naranja limón mandarina toronja uva fresa frambuesa cereza ciruela durazno mango papaya piña sandía melón kiwi
coco guayaba granada higo dátil aguacate tomate jitomate cebolla ajo papa zanahoria lechuga espinaca brócoli coliflor col apio pepino
calabaza calabacín berenjena pimiento chile elote maíz frijol lenteja garbanzo chícharo haba arroz trigo avena cebada centeno nuez
almendra cacahuate avellana pistache castaña champiñón hongo rábano betabel nabo alcachofa espárrago perejil cilantro albahaca orégano
romero tomillo menta laurel canela vainilla clavo pimienta sal azúcar miel mermelada mantequilla queso leche yogur crema huevo pan tortilla
galleta pastel tarta pay dona churro helado chocolate caramelo chicle palomita gelatina flan natilla budín sopa caldo ensalada sándwich
hamburguesa pizza taco burrito tamal quesadilla enchilada pozole mole salsa guacamole carne pollo pescado jamón tocino salchicha chorizo
filete costilla albóndiga pasta espagueti fideo lasaña ravioles empanada croqueta tostada cereal harina aceite vinagre mostaza mayonesa
café té jugo refresco agua vino cerveza licor tequila mezcal sidra limonada horchata chocolate batido malteada
casa hogar edificio departamento rascacielos castillo palacio torre fortaleza catedral iglesia templo pirámide capilla mezquita monasterio
choza cabaña granja establo granero rancho hacienda mansión villa iglú tienda carpa puente túnel muelle puerto faro aeropuerto estación
carretera autopista calle avenida camino sendero vereda banqueta esquina glorieta plaza parque jardín huerto fuente estatua monumento
museo biblioteca escuela universidad colegio hospital clínica farmacia banco oficina fábrica taller almacén bodega mercado supermercado
tienda panadería carnicería pescadería pastelería librería papelería ferretería zapatería joyería florería restaurante cafetería bar
hotel posada cine teatro estadio gimnasio piscina alberca circo zoológico acuario feria cementerio cárcel ayuntamiento embajada
cuarto habitación recámara sala comedor cocina baño pasillo escalera ático sótano garaje cochera balcón terraza patio azotea techo tejado
pared muro piso suelo puerta ventana chimenea columna arco cúpula buzón timbre cerradura llave candado bisagra manija perilla
mesa silla sillón sofá banco taburete cama colchón almohada cobija sábana edredón cojín cuna hamaca armario ropero cajón estante repisa
librero escritorio tocador espejo alfombra tapete cortina persiana lámpara foco vela candelabro reloj cuadro marco florero maceta jarrón
estufa horno microondas refrigerador congelador licuadora batidora tostadora cafetera tetera olla sartén cacerola comal plato vaso taza
copa jarra botella cuchara tenedor cuchillo cucharón espátula colador rallador tabla servilleta mantel bandeja charola tazón frasco lata
regadera bañera tina lavabo excusado inodoro toalla jabón champú cepillo peine esponja pasta navaja rastrillo secadora lavadora plancha
escoba trapeador recogedor cubeta balde trapo basura bote bolsa caja cesta canasta baúl maleta mochila bolso cartera billetera monedero
camisa camiseta playera blusa pantalón falda vestido short traje saco chaleco chamarra abrigo suéter sudadera bufanda corbata moño
cinturón calcetín media zapato bota sandalia tenis pantufla sombrero gorra boina casco guante mitón paraguas sombrilla pañuelo delantal
pijama bata uniforme disfraz máscara anillo collar pulsera arete broche corona diadema reloj lentes gafas botón cierre bolsillo cuello
manga
cabeza cara frente ceja pestaña ojo oreja nariz boca labio diente lengua mejilla barbilla mandíbula cuello hombro brazo codo muñeca mano
dedo uña pulgar pecho espalda cintura cadera estómago ombligo pierna rodilla tobillo pie talón corazón pulmón hígado riñón cerebro hueso
músculo sangre piel cabello pelo barba bigote esqueleto cráneo columna costilla vena garganta
coche carro auto camión camioneta autobús camión taxi tren metro tranvía bicicleta motocicleta patineta patín patineta avión avioneta
helicóptero cohete nave globo dirigible barco buque bote lancha velero yate canoa kayak balsa submarino ferry carreta carruaje trineo
tractor ambulancia patrulla grúa excavadora volante llanta rueda motor freno ancla vela remo timón mástil
lápiz pluma bolígrafo marcador crayón gis pizarrón borrador sacapuntas regla compás tijeras pegamento cinta grapadora clip cuaderno
libreta libro revista periódico diccionario enciclopedia novela cuento poema carta sobre postal estampilla timbre mapa globo atlas
calendario agenda diario folleto cartel letrero etiqueta boleto billete moneda tarjeta pasaporte credencial diploma certificado
teléfono celular computadora laptop tableta teclado ratón pantalla monitor impresora cámara televisión radio bocina audífono micrófono
cable enchufe batería pila cargador antena satélite robot reloj calculadora linterna lupa telescopio microscopio brújula termómetro
martillo clavo tornillo tuerca llave desarmador pinza serrucho sierra taladro hacha pala pico rastrillo azadón manguera escalera
cuerda soga cadena alambre tubo cubo barril tanque palanca polea imán resorte rueda engranaje hélice
guitarra piano violín violonchelo arpa flauta trompeta trombón saxofón clarinete tambor batería tambora maraca pandero xilófono acordeón
armónica marimba campana silbato
pelota balón raqueta bate guante red portería canasta trampolín columpio resbaladilla sube muñeca juguete trompo yoyo papalote cometa
dado ficha naipe ajedrez rompecabezas canica burbuja globo piñata confeti serpentina regalo moño
médico doctor enfermera dentista veterinario maestro profesor alumno estudiante director abogado juez policía bombero soldado piloto
marinero capitán astronauta científico ingeniero arquitecto carpintero albañil plomero electricista mecánico panadero carnicero
cocinero chef mesero cajero vendedor granjero pescador cazador pastor jardinero cartero chofer conductor taxista periodista escritor
poeta pintor escultor músico cantante actor actriz bailarín payaso mago fotógrafo sastre costurera peluquero barbero bibliotecario
rey reina príncipe princesa emperador caballero pirata vaquero detective espía guardián vigilante ladrón héroe villano gigante enano
duende hada bruja fantasma vampiro monstruo zombi momia ogro mago
padre madre papá mamá hijo hija hermano hermana abuelo abuela tío tía primo prima sobrino sobrina nieto nieta esposo esposa novio
novia bebé niño niña joven adulto anciano vecino amigo amiga compañero familia
lunes martes miércoles jueves viernes sábado domingo enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre
diciembre primavera verano otoño invierno semana mes año siglo década segundo minuto hora día fecha cumpleaños aniversario navidad
fiesta boda vacaciones viaje excursión paseo aventura carrera partido torneo concierto desfile carnaval festival
amor odio alegría tristeza miedo enojo sorpresa calma paz guerra esperanza suerte destino sueño pesadilla recuerdo memoria idea
pensamiento secreto mentira verdad promesa deseo pregunta respuesta problema solución misterio enigma historia leyenda mito fábula
magia hechizo tesoro premio trofeo medalla corona bandera escudo espada lanza flecha arco cañón pistola bala bomba
música canción melodía ritmo baile danza pintura dibujo foto película obra arte color forma figura círculo cuadrado triángulo
rectángulo línea punto esfera pirámide cubo número letra palabra frase idioma lengua voz grito susurro eco silencio ruido sonido
fuego llama chispa humo ceniza hielo vapor calor frío electricidad energía fuerza velocidad tiempo espacio mundo país ciudad pueblo
aldea región frontera nación continente norte sur este oeste centro orilla borde fondo cima
rojo azul verde amarillo naranja morado violeta rosa blanco negro gris café marrón dorado plateado turquesa
`

export const WORDS: readonly string[] = Array.from(
  new Set(
    RAW.split(/\s+/)
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean),
  ),
)
