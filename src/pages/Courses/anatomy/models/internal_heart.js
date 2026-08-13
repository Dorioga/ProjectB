import internalHeartModel from "@assets/models/internal_heart.glb?url";
import internalHeartImage from "@assets/images/internalheart.png";

export default {
  id: "internal_heart",
  name: "Corazón",
  category: "Sistema cardiovascular",
  image: internalHeartImage,
  file: internalHeartModel,
  scale: 4.2,
  position: [0, 0.2, 0],
  rotation: [0, 0, 0],
  summary:
    "El corazón es un órgano muscular encargado de bombear la sangre a través del sistema circulatorio. Gracias a sus contracciones rítmicas suministra oxígeno y nutrientes a los tejidos y permite eliminar productos de desecho del organismo.",

  wikipedia:
    "https://es.wikipedia.org/wiki/Corazón",

  facts: [
    {
      label: "Sistema",
      value: "Cardiovascular",
    },
    {
      label: "Ubicación",
      value: "Mediastino",
    },
    {
      label: "Peso",
      value: "250–350 g",
    },
    {
      label: "Cavidades",
      value: "4",
    },
    {
      label: "Frecuencia",
      value: "60–100 lpm",
    },
  ],
};