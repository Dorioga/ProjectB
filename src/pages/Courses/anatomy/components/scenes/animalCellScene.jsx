import { useState } from "react";

import Model from "../Model";
import AnimalCellMarkers from "../markers/animalCellMarkers";

export default function AnimalCellScene({
  model,
  onMarkerClick,
  selectedMarker,
}) {
  const [scene, setScene] = useState(null);

  return (
    <group>
      <Model model={model} onLoaded={setScene} />

      {scene && (
        <AnimalCellMarkers
          scene={scene}
          onMarkerClick={onMarkerClick}
          selectedMarker={selectedMarker}
        />
      )}
    </group>
  );
}
