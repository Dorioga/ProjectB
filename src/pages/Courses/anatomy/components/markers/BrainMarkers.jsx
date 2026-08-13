import Marker from "./Marker";

import lobuloFrontal from "@assets/images/lobulo_frontal.png";
import lobuloTemporal from "@assets/images/lobulo_temporal.png";
import lobuloOccipital from "@assets/images/lobulo_occipital.png";
import lobuloParietal from "@assets/images/lobulo_parietal.png";
import cerebelo from "@assets/images/cerebelo.png";
import bulboRaquideo from "@assets/images/bulbo_raquideo.png";

export default function BrainMarkers({ scene, onMarkerClick, selectedMarker }) {
  const markers = [
    {
      id: "Lobulo_frontal",
      title: "Lóbulo frontal",
      subtitle: "Sistema nervioso",
      position: [0.37, 1.26, 0.95],
      image: lobuloFrontal,
      description:
        "El lóbulo frontal es el más grande de los cuatro lóbulos del cerebro humano. Ocupa aproximadamente el tercio anterior de la corteza cerebral, ubicándose justo detrás de la frente.Es considerado el centro del mando ejecutivo del cerebro, ya que alberga las funciones cognitivas más complejas y avanzadas que diferencian a los humanos de otros animales.",
      facts: [
        {
          label: "Ubicación",
          value: "Parte delantera del cráneo",
        },
        {
          label: "Tipo",
          value: "Corteza cerebral",
        },
        {
          label: "Función",
          value:
            "Funciones Ejecutivas, Control del Movimiento, Producción del Lenguaje",
        },
      ],
    },
    {
      id: "lobulo_temporal",
      title: "Lóbulo temporal",
      subtitle: "Sistema nervioso",
      image: lobuloTemporal,
      position: [0.72, 1.1, 0.27],
      description:
        "El lóbulo temporal es uno de los cuatro lóbulos principales de la corteza cerebral. Se ubica en los laterales inferiores del cerebro, aproximadamente a la altura de las orejas, y se encarga de procesar la información sensorial compleja.",
      facts: [
        {
          label: "Ubicación",
          value: "parte inferior y lateral de cada hemisferio cerebral",
        },
        {
          label: "Tipo",
          value: "Corteza cerebral",
        },
        {
          label: "Función",
          value: "Audición, Memoria, Reconocimiento, Emociones",
        },
      ],
    },
    {
      id: "lobulo_occipital",
      title: "Lóbulo occipital",
      subtitle: "Sistema nervioso",
      image: lobuloOccipital,
      position: [0.6, 0.6, -0.8],
      description:
        "El lóbulo occipital es el más pequeño de los cuatro lóbulos principales de la corteza cerebral. Se encuentra en la parte posterior del cráneo, justo por encima del cerebelo.Su función principal y casi exclusiva es el procesamiento de la información visual. No vemos directamente con los ojos; los ojos captan la luz, pero es el lóbulo occipital el que interpreta esas señales para construir las imágenes que percibes.",
      facts: [
        {
          label: "Ubicación",
          value: "Zona posterior del cerebro",
        },
        {
          label: "Tipo",
          value: "Corteza cerebral",
        },
        {
          label: "Función",
          value:
            "Realiza un mapeo básico de la imagen: detecta líneas, bordes, orientaciones y destellos de luz.",
        },
      ],
    },
    {
      id: "lobulo_parietal",
      title: "Lóbulo parietal",
      subtitle: "Sistema nervioso",
      image: lobuloParietal,
      position: [0.65, 1.32, -0.55],
      description:
        "El lóbulo parietal es uno de los cuatro lóbulos principales del cerebro y se ubica en la zona superior y trasera de la cabeza. Su función principal es actuar como el gran centro de procesamiento sensorial del cuerpo, integrando la información del tacto, el dolor, la temperatura y la posición de los músculos",
      facts: [
        {
          label: "Ubicación",
          value: "Parte más alta de la cabeza",
        },
        {
          label: "Tipo",
          value: "Corteza cerebral",
        },
        {
          label: "Función",
          value: "Procesa información sensorial y contribuye en la percepción espacial",
        },
      ],
    },
    {
      id: "cerebelo",
      title: "Cerebelo",
      subtitle: "Sistema nervioso",
      image: cerebelo,
      position: [0.55, 0.3, -0.47],
      description:
        'El cerebelo es una estructura del tamaño de una nuez con forma de "pequeño cerebro" (eso significa su nombre en latín) ubicada en la parte posterior e inferior del cráneo. Aunque representa solo el 10% del peso total del cerebro, contiene más del 50% de todas las neuronas del sistema nervioso.',
      facts: [
        {
          label: "Ubicación",
          value: "Parte posterior e inferior de la cavidad craneal",
        },
        {
          label: "Tipo",
          value: "Órgano",
        },
        {
          label: "Función",
          value:
            "Coordinación motora, Equilibrio y postura, Tono muscular, Aprendizaje motor, Funciones cognitivas",
        },
      ],
    },
    {
      id: "bulbo_raquideo",
      title: "Bulbo raquídeo",
      subtitle: "Sistema nervioso",
      image: bulboRaquideo,
      position: [0.18, 0.3, -0.1],
      description:
        'El bulbo raquídeo (también llamado médula oblongada) es la estructura más baja del tronco del encéfalo. Es el "conmutador de supervivencia" del cuerpo, ya que conecta directamente el cerebro con la médula espinal y controla las funciones vitales que te mantienen vivo de forma automática.',
      facts: [
        {
          label: "Ubicación",
          value: "Se encuentra en la parte más baja de la nuca, justo en la base del cráneo.",
        },
        {
          label: "Tipo",
          value: "Estructura nerviosa del tronco del encéfalo",
        },
        {
          label: "Función",
          value:
            "Centro cardiovascular, Centro respiratorio, Reflejos de protección",
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