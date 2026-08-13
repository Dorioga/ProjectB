import { useState } from "react";

import Model from "../Model";
import HeartMarkers from "../markers/HeartMarkers";

export default function HeartScene({
  model,
  onMarkerClick,
  selectedMarker,
}) {
  const [scene, setScene] = useState(null);

  return (
    <group>
      <Model model={model} onLoaded={setScene} />

      {scene && (
        <HeartMarkers
          scene={scene}
          onMarkerClick={onMarkerClick}
          selectedMarker={selectedMarker}
        />
      )}
    </group>
  );
}