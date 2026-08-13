import { useState } from "react";

import Model from "../Model";
import BrainMarkers from "../markers/BrainMarkers";

export default function BrainScene({
  model,
  onMarkerClick,
  selectedMarker,
}) {
  const [scene, setScene] = useState(null);

  return (
    <group>
      <Model model={model} onLoaded={setScene} />

      {scene && (
        <BrainMarkers
          scene={scene}
          onMarkerClick={onMarkerClick}
          selectedMarker={selectedMarker}
        />
      )}
    </group>
  );
}