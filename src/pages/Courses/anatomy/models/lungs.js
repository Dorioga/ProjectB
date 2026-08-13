import lungsModel from "@assets/models/lungs.glb?url";
import lungsImage from "@assets/images/pulmon.png";

export default {
  id: "lungs",

  name: "Pulmones",

  category: "Sistema respiratorio",

  image: lungsImage,

  file: lungsModel,

  scale: 6.2,

  position: [0.1, 0.1, 0],

  rotation: [0, 0, 0],

  summary:
    "Los pulmones son estructuras anatómicas pertenecientes al sistema respiratorio, se ubican en la cavidad torácica, a ambos lados del mediastino. Debido al espacio ocupado por el corazón, el pulmón derecho es más grande que su homólogo izquierdo.",

  wikipedia:
    "https://es.wikipedia.org/wiki/Pulmón",

  facts: [
    {
      label: "Sistema",
      value: "Respiratorio",
    },
    {
      label: "Ubicación",
      value: "Cavidad torácica",
    },
    {
      label: "Peso",
      value: "Derecho aprox 600gr, izquierdo alrededor de 550g.",
    },
    {
      label: "Región",
      value: "Cavidad torácica",
    },
  ],
};