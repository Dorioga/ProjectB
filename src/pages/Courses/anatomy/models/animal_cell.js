import cellModel from "@assets/models/celula_animal.glb?url";
import cellImage from "@assets/images/celula_animal.png";

export default {
  id: "animal_cell",

  name: "Célula Animal",

  category: "Célula eucariota",

  image: cellImage,

  file: cellModel,

  scale: 11.2,

  position: [0.1, 0.1, 0],

  rotation: [0, 0, 0],

  summary:
    "Una célula animal es un tipo de célula eucariota que forma los tejidos de los animales. Contiene un núcleo definido que guarda el ADN, membrana plasmática, citoplasma y diversos orgánulos que producen energía y procesan sustancias, a diferencia de las plantas, no tiene pared celular ni cloroplastos.",

  wikipedia:
    "https://es.wikipedia.org/wiki/C%C3%A9lula_animal",

  facts: [
    {
      label: "Tipo Celular",
      value: "Eucariota",
    },
    {
      label: "Ubicación",
      value: "Cranio",
    },
    {
      label: "Tamaño Promedio",
      value: "Entre 10 y 30 micrómetros",
    },
    {
      label: "Tipo de Nutrición",
      value: "Heterótrofa",
    },
    {
      label: "Mecanismo de División",
      value: "Mitosis",
    },
  ],
};
