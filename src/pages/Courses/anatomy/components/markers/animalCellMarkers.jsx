import Marker from "./Marker";

import lisosoma from "@assets/images/lisosoma.png";
import nucleo from "@assets/images/nucleo.png";
import golgi from "@assets/images/golgi.png";
import citoplasma from "@assets/images/citolplasma.png";
import endoplasmatico from "@assets/images/endoplasmatico.png";
import celulaAnimal from "@assets/images/celula_animal.png";

export default function AnimalCellMarkers({
  scene,
  onMarkerClick,
  selectedMarker,
}) {
  const markers = [
    {
      id: "lisosoma",
      title: "Lisosoma",
      subtitle: "Célula eucariota",
      position: [-0.03, 1.44, 0.01],
      image: lisosoma,
      description:
        "El lisosoma es un organelo membranoso que funciona como el sistema digestivo y de reciclaje de la célula animal. Fue descubierto por el científico Christian de Duve en 1949 y es una estructura esférica que contiene una mezcla de potentes enzimas hidrolíticas.",
      facts: [
        {
          label: "Ubicación",
          value: "Aparato de Golgi",
        },
        {
          label: "Tipo",
          value: "Organelo citoplasmático membranoso",
        },
        {
          label: "Función",
          value:
            "Heterofagia (Digestión), Autofagia (Reciclaje), Apoptosis (Autólisis)",
        },
      ],
    },
    {
      id: "nucleo",
      title: "Núcleo celular",
      subtitle: "Célula eucariota",
      image: nucleo,
      position: [0.1, 1.2, 0.08],
      description:
        "El núcleo celular es el centro de control y el organelo más prominente de la célula eucariota. Funciona como el cerebro celular, ya que custodia la información genética que determina la estructura, función y destino de todo el organismo.",
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
      position: [0.1, 1.07, 0.17],
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
      position: [0.45, 1.32, 0.07],
      image: golgi,
      description:
        "El aparato de Golgi es un organelo membranoso esencial que funciona como el centro de distribución, empaquetado y envío de moléculas de la célula. Fue descubierto por el científico Camillo Golgi en 1898 y está formado por una serie de sacos aplanados y apilados llamados dictiosomas.",
      facts: [
        {
          label: "Ubicación",
          value: "Se localiza de forma interna en el citoplasma",
        },
        {
          label: "Tipo",
          value: "Organelo citoplasmático",
        },
        {
          label: "Función",
          value:
            "Glicosilación (Modificación), Clasificación y Empaquetado, Secreción Celular",
        },
      ],
    },
    {
      id: "citoplasma",
      title: "Citoplasma",
      subtitle: "Célula eucariota",
      position: [0.75, 1.2, 0],
      image: citoplasma,
      description:
        "El citoplasma es el medio vital que llena todo el espacio interior de la célula, ubicado entre la membrana plasmática y la envoltura nuclear. No es un organelo aislado, sino el entorno fluido y estructural donde ocurren la gran mayoría de las reacciones químicas y metabólicas de la vida celular.",
      facts: [
        {
          label: "Ubicación",
          value:
            "Región interna comprendida entre la membrana celular externa y la membrana del núcleo.",
        },
        {
          label: "Tipo",
          value: "Medio o Matriz Intracelular",
        },
        {
          label: "Función",
          value:
            "Soporte y Estabilidad, Sede del Metabolismo, Tránsito Intracelular",
        },
      ],
    },
    {
      id: "endoplasmatico",
      title: "Retículo endoplasmatico liso",
      subtitle: "Célula eucariota",
      position: [0.49, 1.03, 0.3],
      image: endoplasmatico,
      description:
        "El retículo endoplasmático liso (REL) es un organelo celular membranoso caracterizado por una intrincada red de túbulos curvos e interconectados. A diferencia de su contraparte (el retículo rugoso), carece por completo de ribosomas adheridos a su superficie, lo que le otorga su característico aspecto liso bajo el microscopio electrónico.",
      facts: [
        {
          label: "Ubicación",
          value: "Distribuido por todo el citoplasma",
        },
        {
          label: "Tipo",
          value: "Organelo citoplasmático membranoso",
        },
        {
          label: "Función",
          value:
            "Síntesis y Ensamblaje de Lípidos, Detoxificación Celular, Reservorio de Calcio",
        },
      ],
    },
    {
      id: "centrosoma",
      title: "Centrosoma",
      subtitle: "Célula eucariota",
      position: [0.01, 1.03, 0.65],
      image: celulaAnimal,
      description:
        "El centrosoma es una estructura celular no membranosa que funciona como el centro organizador de microtúbulos (COAM) principal de la célula animal. Actúa como el arquitecto y director del esqueleto celular, coordinando la forma interna de la célula y el movimiento de sus componentes.",
      facts: [
        {
          label: "Ubicación",
          value: "Se localiza de forma interna en el citoplasma",
        },
        {
          label: "Tipo",
          value: "Organelo citoplasmático no membranoso",
        },
        {
          label: "Función",
          value:
            "Organización del Citoesqueleto, Formación del Huso Mitótico, Ciliogénesis (Base de Cilios y Flagelos)",
        },
      ],
    },
    {
      id: "endoplasmaticorugoso",
      title: "Retículo endoplasmatico rugoso",
      subtitle: "Célula eucariota",
      position: [0.01, 1.03, 0.48],
      image: endoplasmatico,
      description:
        'El retículo endoplasmático rugoso (RER) es un organelo celular membranoso compuesto por una red de sacos aplanados y túbulos conectados entre sí. Recibe el nombre de "rugoso" debido a la presencia masiva de ribosomas adheridos a la cara externa de sus membranas, lo que le da un aspecto tachonado bajo el microscopio electrónico.',
      facts: [
        {
          label: "Ubicación",
          value: "Se localiza en el citoplasma",
        },
        {
          label: "Tipo",
          value: "Organelo citoplasmático membranoso",
        },
        {
          label: "Función",
          value:
            "Síntesis de Proteínas de Exportación, Plegamiento y Control de Calidad, Glicosilación Inicial",
        },
      ],
    },
    {
      id: "mitocondria",
      title: "Mitocondria",
      subtitle: "Célula eucariota",
      position: [0.4, 0.99, 0.59],
      image: celulaAnimal,
      description:
        "La mitocondria es un organelo celular membranoso semiautónomo que funciona como la central energética de la célula. Su tarea principal es romper los enlaces químicos de los nutrientes para transformarlos en una moneda de energía que toda la célula pueda gastar.",
      facts: [
        {
          label: "Ubicación",
          value: "Distribuida por todo el citoplasma",
        },
        {
          label: "Tipo",
          value: "Organelo citoplasmático membranoso bioenergético",
        },
        {
          label: "Función",
          value:
            "Respiración Celular Aeróbica, Producción de ATP, Regulación de la Apoptosis",
        },
      ],
    },
    {
      id: "membrana_plasmatica",
      title: "Membrana plasmática",
      subtitle: "Célula eucariota",
      position: [0, 0.8, 0.86],
      image: celulaAnimal,
      description:
        "La membrana plasmática (o membrana celular) es la frontera biológica que delimita a la célula, separando su medio interno (citoplasma) del entorno exterior. Lejos de ser una simple barrera estática, es una estructura fluida, dinámica y altamente especializada que regula de forma estricta todo lo que entra y sale de la célula.",
      facts: [
        {
          label: "Ubicación",
          value: "Envoltura más externa de la célula animal",
        },
        {
          label: "Tipo",
          value: "Estructura limitante superficial y bicapa lipídica fluida",
        },
        {
          label: "Función",
          value:
            "Protección e Integridad, Transporte Celular Regulado, Comunicación y Señalización",
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
