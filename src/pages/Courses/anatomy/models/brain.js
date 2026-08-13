import brainModel from "@assets/models/brain.glb?url";
import brainImage from "@assets/images/brain.png";

export default {
  id: "brain",

  name: "Cerebro",

  category: "Sistema nervioso",

  image: brainImage,

  file: brainModel,

  scale: 8.2,

  position: [0.1, 0.1, 0],

  rotation: [0, 0, 0],

  summary:
    "El cerebro es el órgano principal del sistema nervioso, encargado de controlar y coordinar las funciones del cuerpo. Es el centro de los procesos mentales, como el pensamiento, la memoria y la percepción.",

  wikipedia:
    "https://es.wikipedia.org/wiki/Cerebro",

  facts: [
    {
      label: "Sistema",
      value: "Nervioso",
    },
    {
      label: "Ubicación",
      value: "Cranio",
    },
    {
      label: "Peso",
      value: "1,300–1,400 g",
    },
    {
      label: "Hemisferio derecho",
      value: "El Holístico",
    },
    {
      label: "Hemisferio izquierdo",
      value: "El Analítico",
    },
  ],
};