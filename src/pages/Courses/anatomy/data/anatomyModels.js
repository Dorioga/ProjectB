import heart from "../models/heart";
import internalHeart from "../models/internal_heart";
import brain from "../models/brain";
import midBrain from "../models/mid_brain";
import lungs from "../models/lungs";

import HeartScene from "../components/scenes/HeartScene";
import InternalHeartScene from "../components/scenes/InternalHeartScene";
import BrainScene from "../components/scenes/BrainScene";
import MidBrainScene from "../components/scenes/MidBrainScene";
import LungsScene from "../components/scenes/LungsScene";

const anatomyModels = [
  {
    id: "heart",
    name: "Corazón",
    category: "Sistema cardiovascular",
    model: heart,
    scene: HeartScene,
  },
  {
    id: "internal-heart",
    name: "Corazón (Vista interna)",
    category: "Sistema cardiovascular",
    model: internalHeart,
    scene: InternalHeartScene,
  },
  {
    id: "brain",
    name: "Cerebro",
    category: "Sistema nervioso",
    model: brain,
    scene: BrainScene,
  },
  {
    id: "mid-brain",
    name: "Cerebro (Corte coronal)",
    category: "Sistema nervioso",
    model: midBrain,
    scene: MidBrainScene,
  },
  {
    id: "lungs",
    name: "Pulmones",
    category: "Sistema respiratorio",
    model: lungs,
    scene: LungsScene,
  },
];

export default anatomyModels;