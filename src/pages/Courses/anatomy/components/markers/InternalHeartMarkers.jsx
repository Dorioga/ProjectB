import Marker from "./Marker";

export default function InternalHeartMarkers({
  scene,
  onMarkerClick,
  selectedMarker,
}) {
  const markers = [
    {
      id: "Auricula_izquierda",
      title: "Aurícula izquierda",
      position: [0.37, 1.16, 0.22],
      description:
        "Es la cámara del corazón que recibe sangre desoxigenada del cuerpo.",
    },
    {
      id: "Orificio_vena_cava_superior",
      title: "Orificio de la vena cava superior",
      position: [-0.25, 1.15, 0.2],
      description:
        "Es la abertura por donde la vena cava superior transporta sangre desoxigenada desde la parte superior del cuerpo hacia la aurícula derecha del corazón.",
    },
    {
      id: "Arteria_pulmonar_izquierda",
      title: "Arteria pulmonar izquierda",
      position: [0.2, 1.38, 0.15],
      description:
        "Es la arteria que transporta sangre desoxigenada desde el corazón hacia los pulmones.",
    },
    {
      id: "Valvula_tricuspide",
      title: "Válvula tricúspide",
      position: [-0.08, 0.71, 0.32],
      description:
        "Es la válvula que controla el flujo de sangre desde el ventrículo izquierdo hacia la aurícula izquierda.",
    },
    {
      id: "Válvula_pulmonar",
      title: "Válvula pulmonar",
      position: [0.07, 1.1, 0.25],
      description:
        "Es la válvula que controla el flujo de sangre desde el ventrículo derecho hacia los pulmones.",
    },
    {
      id: "Tabique_interventricular",
      title: "Tabique interventricular",
      position: [0.2, 0.6, 0.41],
      description:
        "Es la estructura que separa los ventrículos izquierdo y derecho del corazón.",
    },
    {
      id: "Apex",
      title: "Apex",
      position: [0.2, 0.28, 0.5],
      description:
        "Es la punta del corazón, formada principalmente por el ventrículo izquierdo.",
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