import Marker from "./Marker";

import aorta from "@assets/images/aorta.png";
import venaCavaSuperior from "@assets/images/Vena_cava_superior.png";
import arteriaPulmonarIzquierda from "@assets/images/Arteria_pulmonar_izquierda.png";
import tronco from "@assets/images/Tronco.png";
import venasPulmonaresIzquierdas from "@assets/images/Venas_pulmonares_izquierdas.png";

export default function HeartMarkers({ scene, onMarkerClick, selectedMarker }) {
  const markers = [
    {
      id: "Aorta",
      title: "Aorta",
      subtitle: "Sistema cardiovascular",
      position: [-0.07, 1.4, 0.19],
      image: aorta,
      description:
        "La aorta es una arteria elástica que parte de la porción superior del ventrículo izquierdo, su pared es flexible y extensible. Cuando el ventrículo izquierdo del corazón se contrae en la sístole y propulsa la sangre hacia la aorta, esta se expande. Este estiramiento produce la energía potencial que ayuda a mantener la presión sanguínea durante la diástole, momento durante el cual se produce la retracción de la pared de la aorta.",
      facts: [
        {
          label: "Ubicación",
          value: "Ventrículo izquierdo del corazón",
        },
        {
          label: "Tipo",
          value: "Arteria",
        },
        {
          label: "Función",
          value: "Transporta y distribuye sangre oxigenada a todo el cuerpo",
        },
      ],
    },
    {
      id: "Vena_cava_superior",
      title: "Vena cava superior",
      subtitle: "Sistema cardiovascular",
      image: venaCavaSuperior,
      position: [-0.26, 1.6, 0.08],
      description:
        "La vena cava superior es una de las dos venas más importantes del cuerpo humano. Es un tronco venoso o vena de gran calibre que recoge la sangre de la cabeza, el cuello, los miembros superiores y el tórax. Se inicia en la unión de las dos venas braquiocefálicas, pasa directamente hacia abajo y desemboca en la aurícula derecha. A través de la vena cava superior retorna la sangre de todas las estructuras que quedan por encima del músculo diafragma, con excepción de los pulmones y el corazón.",
      facts: [
        {
          label: "Ubicación",
          value:
            "Se inicia en la unión de las dos venas braquiocefálicas y desemboca en la aurícula derecha",
        },
        {
          label: "Tipo",
          value: "Vena",
        },
        {
          label: "Función",
          value:
            "Recoge la sangre de la cabeza, el cuello, los miembros superiores y el tórax",
        },
      ],
    },
    {
      id: "Arteria_pulmonar_izquierda",
      title: "Arteria pulmonar izquierda",
      subtitle: "Sistema cardiovascular",
      image: arteriaPulmonarIzquierda,
      position: [0.3, 1.44, 0.17],
      description:
        "Es una rama corta del tronco pulmonar que transporta sangre pobre en oxígeno desde el ventrículo derecho del corazón directamente hacia el pulmón izquierdo. Cruza por encima del bronquio principal izquierdo y se divide en el hilio pulmonar para permitir el intercambio de gases",
      facts: [
        {
          label: "Ubicación",
          value: "Región del mediastino medio",
        },
        {
          label: "Tipo",
          value: "Arteria",
        },
        {
          label: "Función",
          value: "Conduce sangre desoxigenada hacia el pulmón izquierdo",
        },
      ],
    },
    {
      id: "Tronco_braquiocefálico",
      title: "Tronco braquiocefálico",
      subtitle: "Sistema cardiovascular",
      position: [-0.03, 1.8, 0],
      image: tronco,
      description:
        "El tronco braquiocefálico (o arteria innominada) es la arteria más grande que nace del arco de la aorta. Su función principal es llevar sangre oxigenada hacia el lado derecho de la cabeza, el cuello y el brazo derecho",
      facts: [
        {
          label: "Ubicación",
          value: "Ventrículo izquierdo del corazón",
        },
        {
          label: "Tipo",
          value: "Arteria",
        },
        {
          label: "Función",
          value:
            "Nace en la cara superior del arco de la aorta, siendo la primera de sus tres grandes ramas",
        },
      ],
    },
    {
      id: "Arteria_carótida_común_izquierda",
      title: "Arteria carótida común izquierda",
      subtitle: "Sistema cardiovascular",
      position: [0.07, 1.8, 0],
      image: tronco,
      description:
        "La arteria carótida común izquierda es una arteria fundamental que nace directamente del arco de la aorta. Su función principal es transportar sangre oxigenada hacia el lado izquierdo de la cabeza y el cuello.",
      facts: [
        {
          label: "Ubicación",
          value: "Nace directamente del arco aórtico",
        },
        {
          label: "Tipo",
          value: "Arteria",
        },
        {
          label: "Función",
          value:
            "Transportar sangre altamente oxigenada desde el corazón hacia el lado izquierdo de la cabeza",
        },
      ],
    },
    {
      id: "Arteria_subclavia_izquierda",
      title: "Arteria subclavia izquierda",
      subtitle: "Sistema cardiovascular",
      position: [0.16, 1.8, -0.01],
      image: tronco,
      description:
        "La arteria subclavia izquierda es una arteria de gran calibre que nace directamente del arco de la aorta. Su función principal es suministrar sangre oxigenada al miembro superior izquierdo (brazo) y a partes del tórax, el cuello y el cerebro.",
      facts: [
        {
          label: "Ubicación",
          value:
            "Se origina en el mediastino superior, por detrás de la carótida izquierda, y asciende verticalmente",
        },
        {
          label: "Tipo",
          value: "Arteria",
        },
        {
          label: "Función",
          value: "Justo después de la arteria carótida común izquierda",
        },
      ],
    },
    {
      id: "Venas_pulmonares_izquierdas",
      title: "Venas pulmonares superiores e inferiores izquierdas",
      subtitle: "Sistema cardiovascular",
      image: venasPulmonaresIzquierdas,
      position: [0.57, 1.32, 0.026],
      description:
        "Las venas pulmonares superiores e inferiores izquierdas son cuatro vasos sanguíneos esenciales (dos superiores y dos inferiores, correspondientes a cada pulmón) que cumplen una función única y crítica en el cuerpo: transportan sangre ya oxigenada desde los pulmones de regreso al corazón.A diferencia de la gran mayoría de las venas del cuerpo, estas venas transportan sangre arterial (rica en oxígeno y baja en dióxido de carbono) tras completarse el proceso de hematosis (intercambio de gases)",
      facts: [
        {
          label: "Ubicación",
          value:
            "Se forma por la unión de las venas que recogen la sangre del lóbulo superior del pulmón izquierdo y de la língula",
        },
        {
          label: "Tipo",
          value: "Vena",
        },
        {
          label: "Función",
          value: "Transportan sangre ya oxigenada desde los pulmones de regreso al corazón",
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