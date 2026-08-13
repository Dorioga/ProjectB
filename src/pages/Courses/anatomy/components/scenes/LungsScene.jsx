import { useState } from "react";

import Model from "../Model";
import LungsMarkers from "../markers/lungsMarkers";

export default function LungsScene({
  model,
  onMarkerClick,
  selectedMarker,
}) {
  const [scene, setScene] = useState(null);

  return (
    <group>
      <Model model={model} onLoaded={setScene} />

      {scene && (
        <LungsMarkers
          scene={scene}
          onMarkerClick={onMarkerClick}
          selectedMarker={selectedMarker}
        />
      )}
    </group>
  );
}