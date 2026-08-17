import Marker from "./Marker";

import nucleo from "@assets/images/nucleo.png";
import golgi from "@assets/images/golgi.png";
import citoplasma from "@assets/images/citoplasma_vegetal.png";
import reticuloEndoplasmatico from "@assets/images/reticuloendoplasmatico.png";
import celulaVegetal from "@assets/images/celula_vegetal.png";

export default function VegetableCellMarkers({
  scene,
  onMarkerClick,
  selectedMarker,
}) {
  const markers = [
    {
      id: "vacuola",
      title: "Vacuola",
      subtitle: "Célula eucariota",
      position: [0.23, 0.82, 0.35],
      image: celulaVegetal,
      description:
        "La vacuola es un organelo membranoso que funciona como el compartimento multifuncional de almacenamiento y control de presión de la célula. Aunque está presente tanto en células animales como vegetales, su tamaño, número y relevancia varían de forma drástica entre ambos tipos celulares.",
      facts: [
        {
          label: "Ubicación",
          value: "Dispersas en el citoplasma",
        },
        {
          label: "Tipo",
          value: "Organelo citoplasmático membranoso de almacenamiento",
        },
        {
          label: "Función",
          value:
            "Turgencia Celular, Almacenamiento y Reserva, Manejo de Desechos y Digestión, Regulación Osmótica",
        },
      ],
    },
    {
      id: "nucleo",
      title: "Núcleo celular",
      subtitle: "Célula eucariota",
      image: nucleo,
      position: [0.1, 1.1, -0.5],
      description:
        "El núcleo celular de la célula vegetal es el centro de control genético y administrativo de la planta. Comparte la misma función rectora que el núcleo de la célula animal, pero se adapta a un entorno celular condicionado por una gran presión interna y por procesos metabólicos únicos como la fotosíntesis.",
      facts: [
        {
          label: "Ubicación",
          value: "Centro del citoplasma",
        },
        {
          label: "Tipo",
          value: "Organelo rector membranoso",
        },
        {
          label: "Función",
          value:
            "Almacenamiento Genético, Transcripción y Expresión, Réplica del ADN",
        },
      ],
    },
    {
      id: "nucleolo",
      title: "Nucleolo",
      subtitle: "Célula eucariota",
      image: nucleo,
      position: [0, 1.05, -0.31],
      description:
        "El nucléolo es una región densa y especializada que se encuentra dentro del núcleo celular. No cuenta con una membrana propia que lo separe del resto del interior nuclear; en su lugar, es un conglomerado de ARN y proteínas que se organiza alrededor de las zonas del ADN que contienen las instrucciones para fabricar ribosomas",
      facts: [
        {
          label: "Ubicación",
          value: "Interior del núcleo celular",
        },
        {
          label: "Tipo",
          value: "componente subcelular",
        },
        {
          label: "Función",
          value: "Biogénesis de Ribosomas, Exportación de Subunidades",
        },
      ],
    },
    {
      id: "golgi",
      title: "Aparato de Golgi",
      subtitle: "Célula eucariota",
      position: [0.45, 0.82, 0.07],
      image: golgi,
      description:
        "El aparato de Golgi en la célula vegetal (frecuentemente denominado dictiosoma) es el centro metabólico encargado de la síntesis de polisacáridos estructurales y del empaquetamiento de macromoléculas. A diferencia del sistema centralizado de los animales, el Golgi vegetal opera como una red descentralizada y móvil altamente especializada para la construcción de la planta.",
      facts: [
        {
          label: "Ubicación",
          value: "Descentralizado. No forma un único complejo",
        },
        {
          label: "Tipo",
          value: "Organelo citoplasmático",
        },
        {
          label: "Función",
          value:
            "Fábrica de la Pared Celular, Maduración de Glicoproteínas, Secreción y Citocinesis",
        },
      ],
    },
    {
      id: "citoplasma",
      title: "Citoplasma",
      subtitle: "Célula eucariota",
      position: [0.75, 0.83, 0],
      image: citoplasma,
      description:
        "El citoplasma de la célula vegetal es el entorno fluido y estructural donde se llevan a cabo las reacciones metabólicas esenciales de la planta. Aunque comparte la base acuosa del citoplasma animal, el citoplasma vegetal está fuertemente condicionado por la presencia de la gran vacuola central y los cloroplastos, lo que altera su espacio físico y genera dinámicas de movimiento únicas.",
      facts: [
        {
          label: "Ubicación",
          value:
            "Región interna comprendida entre la membrana plasmática y la envoltura nuclear",
        },
        {
          label: "Tipo",
          value: "Medio celular acuoso",
        },
        {
          label: "Función",
          value:
            "Soporte Dinámico de Organelos, Sede del Metabolismo Primario, Vía de Conexión Simplástica",
        },
      ],
    },
    {
      id: "endoplasmaticovege",
      title: "Retículo endoplasmatico",
      subtitle: "Célula eucariota",
      position: [0.06, 0.91, 0.3],
      image: reticuloEndoplasmatico,
      description:
        "El retículo endoplasmático (RE) en la célula vegetal es una red tridimensional continua de túbulos membranosos y sacos aplanados que se extiende por todo el citoplasma. A diferencia del RE animal, el de las plantas está íntimamente conectado con la pared celular a través de los plasmodesmos, formando una superautopista de comunicación y transporte que une a todas las células de la planta",
      facts: [
        {
          label: "Ubicación",
          value:
            "Altamente dinámico. Se extiende desde la envoltura externa del núcleo hasta la periferia celular",
        },
        {
          label: "Tipo",
          value: "Organelo citoplasmático membranoso interconectado",
        },
        {
          label: "Función",
          value:
            "Autopista de Comunicación, Síntesis y Almacenamiento Especializado, Plataforma de Biogénesis",
        },
      ],
    },
    {
      id: "cloroplasto",
      title: "Cloroplasto",
      subtitle: "Célula eucariota",
      position: [0.5, 1, -0.3],
      image: celulaVegetal,
      description:
        "El cloroplasto es un organelo celular membranoso semiautónomo que funciona como la central fotosintética de la célula vegetal. Su tarea principal es capturar la energía lumínica del sol y utilizarla para fijar el dióxido de carbono, transformándolo en azúcares que sirven de alimento para la planta y liberando oxígeno a la atmósfera.",
      facts: [
        {
          label: "Ubicación",
          value: "Distribuido por el citoplasma de las células expuestas a la luz",
        },
        {
          label: "Tipo",
          value: "Organelo citoplasmático membranoso bioenergético",
        },
        {
          label: "Función",
          value:
            "Fotosíntesis, Biosíntesis de Ácidos Grasos y Aminoácidos, Asimilación de Nutrientes Inorgánicos",
        },
      ],
    },
    {
      id: "mitocondria",
      title: "Mitocondria",
      subtitle: "Célula eucariota",
      position: [-0.43, 0.94, 0.06],
      image: celulaVegetal,
      description:
        "La mitocondria de la célula vegetal es el organelo membranoso semiautónomo encargado de la respiración celular y la producción de ATP en las plantas. Aunque cumple la misma función energética básica que la mitocondria animal, la variante vegetal posee un genoma mucho más grande y complejo, y trabaja en un balance metabólico perfecto con los cloroplastos para mantener viva a la planta durante el día y la noche.",
      facts: [
        {
          label: "Ubicación",
          value: "Distribuida por todo el citoplasma periférico",
        },
        {
          label: "Tipo",
          value: "Organelo citoplasmático membranoso bioenergético",
        },
        {
          label: "Función",
          value:
            "Respiración Celular Nocturna y Basal, Cooperación Metabólica (Fotorrespiración), Flexibilidad Metabólica Única",
        },
      ],
    },
    {
      id: "membrana_plasmatica",
      title: "Membrana plasmática",
      subtitle: "Célula eucariota",
      position: [0.5, 1, 0.69],
      image: celulaVegetal,
      description:
        "La membrana plasmática de la célula vegetal es la barrera lipídica y proteica dinámica que encierra directamente al citoplasma. Aunque comparte la misma base molecular que la membrana animal, la variante vegetal opera en condiciones físicas extremas debido a la enorme presión de agua interna (turgencia) y se encuentra íntimamente unida y coordinada con la pared celular rígida que la rodea externamente.",
      facts: [
        {
          label: "Ubicación",
          value: "Se localiza de forma interna en la periferia celular",
        },
        {
          label: "Tipo",
          value: "Estructura limitante superficial y bicapa lipídica fluida",
        },
        {
          label: "Función",
          value:
            "Soporte de la Presión de Turgencia, Anclaje y Síntesis de la Pared Exterior, Percepción de Señales y Defensa",
        },
      ],
    },
  ];

  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          scene={scene}
          position={marker.position}
          title={marker.title}
          onClick={() => onMarkerClick(marker)}
          selected={selectedMarker?.id === marker.id}
        />
      ))}
    </>
  );
}
