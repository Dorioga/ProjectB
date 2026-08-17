import cellModel from "@assets/models/celula_vegetal.glb?url";
import cellImage from "@assets/images/celula_vegetal.png";

export default {
  id: "vegetable_cell",

  name: "Célula Vegetal",

  category: "Célula eucariota",

  image: cellImage,

  file: cellModel,

  scale: 11.2,

  position: [0.1, 0.1, 0],

  rotation: [0, 13, 0],

  summary:
    "Una célula vegetal es el tipo de célula eucariota de la que están compuestos muchos tejidos vegetales. A menudo, es descrita con los rasgos de una célula del parénquima. Pero sus características no pueden generalizarse con el resto de las células meristemáticas o adultas de una planta y menos aún a las de los muy diversos organismos imprecisamente llamados vegetales.",

  wikipedia:
    "https://es.wikipedia.org/wiki/C%C3%A9lula_vegetal",

  facts: [
    {
      label: "Tipo Celular",
      value: "Eucariota",
    },
    {
      label: "Estructura",
      value: "Pared celular de celulosa",
    },
    {
      label: "Tamaño Promedio",
      value: "Entre 10 y 100 micrómetros",
    },
    {
      label: "Tipo de Nutrición",
      value: "Autótrofa",
    },
    {
      label: "Mecanismo de División",
      value: "Mitosis",
    },
  ],
};
