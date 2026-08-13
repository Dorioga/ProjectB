import Marker from "./Marker";

import amigdala from "@assets/images/amigdala.png";
import caudado from "@assets/images/caudado.png";
import materiaBlanca from "@assets/images/materia_blanca.png";
import globoPalido from "@assets/images/globo_palido.png";
import hipotalamo from "@assets/images/hipotalamo.png";
import arteriaBasilar from "@assets/images/arteria_basilar.png";

export default function MidbrainMarkers({
  scene,
  onMarkerClick,
  selectedMarker,
}) {
  const markers = [
    {
      id: "Amigdala",
      title: "Amígdala",
      subtitle: "Sistema nervioso",
      position: [0.38, 1.1, 0.65],
      image: amigdala,
      description:
        "La amígdala cerebral es un conjunto de pequeños núcleos con forma de almendra situados en lo profundo de los lóbulos temporales. Forma parte del sistema límbico y funciona como la principal alarma del cuerpo, encargada de procesar emociones básicas, gestionar el miedo y activar la respuesta de supervivencia",
      facts: [
        {
          label: "Ubicación",
          value: "Zona interna del lóbulo temporal, justo delante del hipocampo",
        },
        {
          label: "Tipo",
          value: "Núcleos",
        },
        {
          label: "Función",
          value: "Detección de amenazas, Memoria emocional, Regulación social",
        },
      ],
    },
    {
      id: "Caudado",
      title: "Núcleo caudado",
      subtitle: "Sistema nervioso",
      image: caudado,
      position: [-0.3, 1.5, 0.5],
      description:
        "El núcleo caudado es una estructura de forma de C situada en el centro del cerebro. Forma parte de los ganglios basales y ayuda a controlar el movimiento, la memoria, el aprendizaje y las emociones",
      facts: [
        {
          label: "Ubicación",
          value: "parte inferior y lateral de cada hemisferio cerebral",
        },
        {
          label: "Tipo",
          value: "Núcleo basal",
        },
        {
          label: "Función",
          value: "Control del movimiento, Memoria, Aprendizaje, Emociones",
        },
      ],
    },
    {
      id: "Materia_blanca",
      title: "Materia blanca",
      subtitle: "Sistema nervioso",
      image: materiaBlanca,
      position: [0.05, 1.25, 0.54],
      description:
        "Tejido profundo compuesto por axones mielinizados que actúa como una red de comunicación. Conecta distintas áreas de la sustancia gris y acelera la transmisión de señales eléctricas.",
      facts: [
        {
          label: "Ubicación",
          value: "Zonas internas o subcorticales del cerebro",
        },
        {
          label: "Tipo",
          value: "Tejido nervioso",
        },
        {
          label: "Función",
          value: "Conectividad, Velocidad",
        },
      ],
    },
    {
      id: "Globo_palido",
      title: "Globo pálido",
      subtitle: "Sistema nervioso",
      image: globoPalido,
      position: [-0.25, 1, 0.5],
      description:
        "Ees una estructura de sustancia gris que forma parte de los ganglios basales, un grupo de núcleos ubicados en lo profundo del cerebro.A diferencia del hipotálamo (que controla las hormonas y la supervivencia), el globo pálido es un componente esencial del sistema motor voluntario. Su función principal es refinar, suavizar y automatizar los movimientos que decidimos hacer.",
      facts: [
        {
          label: "Ubicación",
          value: "En lo profundo del cerebro",
        },
        {
          label: "Tipo",
          value: "Núcleo cerebral",
        },
        {
          label: "Función",
          value: "Freno del movimiento innecesario, Ajuste de la postura, Automatización",
        },
      ],
    },
    {
      id: "Hipotalamo",
      title: "Hipotálamo",
      subtitle: "Sistema nervioso",
      image: hipotalamo,
      position: [0.09, 0.95, 0.49],
      description:
        "El hipotálamo es una pequeña pero crucial región del cerebro profundo encargada de mantener la homeostasis del organismo, actuando como el centro de control que conecta el sistema nervioso con el sistema endocrino.",
      facts: [
        {
          label: "Ubicación",
          value:
            "Se localiza en el diencéfalo, justo debajo del tálamo y por encima de la hipófisis",
        },
        {
          label: "Tipo",
          value: "Órgano",
        },
        {
          label: "Función",
          value:
            "Control térmico, Hambre y sed, Ciclo circadiano, Sistema autónomo, Emociones y líbido",
        },
      ],
    },
    {
      id: "Arteria_basilar",
      title: "Arteria basilar",
      subtitle: "Sistema nervioso",
      image: arteriaBasilar,
      position: [0.1, 0.6, 0.27],
      description:
        "La arteria basilar es el vaso sanguíneo principal de la circulación cerebral posterior, el cual se forma por la confluencia de las dos arterias vertebrales en la base del tronco encefálico. Es una estructura fundamental que proporciona sangre rica en oxígeno a zonas críticas para la supervivencia, tales como el tronco del encéfalo, el cerebelo y los lóbulos occipitales.",
      facts: [
        {
          label: "Ubicación",
          value:
            "Nace en la unión medulopontina y asciende por la línea media del tronco encefálico hasta el surco basilar del puente",
        },
        {
          label: "Tipo",
          value: "Arteria",
        },
        {
          label: "Función",
          value:
            "Suministra el flujo circulatorio para automatismos vitales controlados por el tallo cerebral como la respiración, la frecuencia cardíaca y el ciclo del sueño.",
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