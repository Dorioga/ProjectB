import { useState } from "react";

import Model from "../Model";
import MidBrainMarkers from "../markers/MidBrainMarkers";

export default function MidBrainScene({
  model,
  onMarkerClick,
  selectedMarker,
}) {
  const [scene, setScene] = useState(null);

  return (
    <group>
      <Model model={model} onLoaded={setScene} />

      {scene && (
        <MidBrainMarkers
          scene={scene}
          onMarkerClick={onMarkerClick}
          selectedMarker={selectedMarker}
        />
      )}
    </group>
  );
}