import { useState } from "react";

import Model from "../Model";
import VegetableCellMarkers from "../markers/vegetableCellMarkers";

export default function VegetableCellScene({
  model,
  onMarkerClick,
  selectedMarker,
}) {
  const [scene, setScene] = useState(null);

  return (
    <group>
      <Model model={model} onLoaded={setScene} />

      {scene && (
        <VegetableCellMarkers
          scene={scene}
          onMarkerClick={onMarkerClick}
          selectedMarker={selectedMarker}
        />
      )}
    </group>
  );
}
