import heartImage from "@assets/images/heart.png";

export default {
  id: "heart",

  name: "Corazón",

  category: "Sistema cardiovascular",

  image: heartImage,

  file: "https://www.nexusplataforma.com/storage/modelos/heart.glb",

  scale: 12,

  position: [0, 0.1, 0],

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