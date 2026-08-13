import Marker from "./Marker";

import carina from "@assets/images/carina.png";
import traquea from "@assets/images/traquea.png";
import lobuloSuperior from "@assets/images/lobulo superior.png";
import bronquiosSecundarios from "@assets/images/bronquios_secundarios.png";
import bronquioPrincipal from "@assets/images/bronquio_principal.png";
import bronquiosSegmentarios from "@assets/images/bronquios_segmentarios.png";

export default function LungsMarkers({
  scene,
  onMarkerClick,
  selectedMarker,
}) {
  const markers = [
    {
      id: "Carina",
      title: "Carina",
      subtitle: "Sistema respiratorio",
      position: [0.1, 1.26, 0.12],
      image: carina,
      description:
        "La carina traqueal es una cresta de cartílago ubicada en la parte baja de la tráquea, justo en el punto donde esta se divide en los bronquios principales derecho e izquierdo. Ayuda a dirigir el aire, es muy sensible para activar la tos y sirve de guía clave en medicina",
      facts: [
        {
          label: "Ubicación",
          value: "Al final de la tráquea",
        },
        {
          label: "Tipo",
          value: "Cartílago",
        },
        {
          label: "Función",
          value: "Paso del aire, Reflejo de la tos",
        },
      ],
    },
    {
      id: "traquea",
      title: "Tráquea",
      subtitle: "Sistema respiratorio",
      image: traquea,
      position: [0.1, 1.56, 0.12],
      description:
        "La tráquea es un tubo cartilaginoso y membranoso del aparato respiratorio que conecta la laringe con los bronquios. Mide entre 10 y 15 cm de largo en humanos. Su función principal es permitir el paso del aire hacia y desde los pulmones.",
      facts: [
        {
          label: "Ubicación",
          value: "Desde el cuello hasta el tórax",
        },
        {
          label: "Tipo",
          value: "Cartílago",
        },
        {
          label: "Función",
          value: "Conducción de aire, Filtración y defensa, Protección estructural",
        },
      ],
    },
    {
      id: "lobulo_superior",
      title: "Lóbulo superior",
      subtitle: "Sistema respiratorio",
      image: lobuloSuperior,
      position: [-0.23, 1.54, 0.14],
      description:
        "El lóbulo superior forma parte de la anatomía respiratoria. El pulmón derecho consta de tres lóbulos (superior, medio e inferior), mientras que el izquierdo tiene dos lóbulos (superior e inferior), siendo el superior izquierdo el que incluye la língula, una estructura que rodea al corazón.",
      facts: [
        {
          label: "Ubicación",
          value: "Región más alta del tórax",
        },
        {
          label: "Tipo",
          value: "Tejido pulmonar exocrino",
        },
        {
          label: "Función",
          value:
            "Oxigenación de la sangre, Eliminación de desechos, Defensa inmunológica, Filtrado de aire",
        },
      ],
    },
    {
      id: "bronquios_secundarios",
      title: "Bronquios secundarios",
      subtitle: "Sistema respiratorio",
      image: bronquiosSecundarios,
      position: [-0.16, 1.133, 0.27],
      description:
        "Los bronquios secundarios, también denominados bronquios lobulares, son la primera ramificación de los bronquios principales. Su función es canalizar el aire hacia cada uno de los lóbulos pulmonares. El pulmón derecho tiene tres (superior, medio e inferior), mientras que el izquierdo tiene dos (superior e inferior).",
      facts: [
        {
          label: "Ubicación",
          value: "Interior del tórax",
        },
        {
          label: "Tipo",
          value: "Bronquios intrapulmonare",
        },
        {
          label: "Función",
          value:
            "Conducción del aire, Ventilación lobular, Defensa inmunológica, Limpieza mucociliar, Regulación del flujo",
        },
      ],
    },
    {
      id: "bronquio_principal",
      title: "Bronquio principal",
      subtitle: "Sistema respiratorio",
      image: bronquioPrincipal,
      position: [0.28, 1.133, 0.27],
      description:
        "Los bronquios principales (o bronquios fuentes) son las dos primeras vías aéreas que nacen de la bifurcación de la tráquea en una estructura interna llamada carina traqueal. Tienen la función vital de conducir el oxígeno inspirado hacia el interior de cada pulmón y facilitar la salida del dióxido de carbono.",
      facts: [
        {
          label: "Ubicación",
          value: "Nacen en el tórax",
        },
        {
          label: "Tipo",
          value: "Órganos tubulares",
        },
        {
          label: "Función",
          value:
            "Conducción de aire, Purificación y limpieza, Acondicionamiento del aire, Defensa inmunológica",
        },
      ],
    },
    {
      id: "bronquios_segmentarios",
      title: "Bronquios segmentarios",
      subtitle: "Sistema respiratorio",
      image: bronquiosSegmentarios,
      position: [0.45, 0.8, 0.36],
      description:
        "Los bronquios segmentarios (también llamados bronquios terciarios) son las ramificaciones que nacen de la división de los bronquios lobares (secundarios). Su función es llevar aire de forma exclusiva a una zona anatómica y funcional independiente del pulmón llamada segmento broncopulmonar.",
      facts: [
        {
          label: "Ubicación",
          value: "Interior de los pulmones",
        },
        {
          label: "Tipo",
          value: "Conductos",
        },
        {
          label: "Función",
          value:
            "Distribución zonal del aire, Regulación del flujo aéreo, Continuidad de la depuración mucociliar, Aislamiento funcional",
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