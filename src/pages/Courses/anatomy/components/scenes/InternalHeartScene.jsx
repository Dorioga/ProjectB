import { useState } from "react";

import Model from "../Model";
import InternalHeartMarkers from "../markers/InternalHeartMarkers";

export default function InternalHeartScene({
  model,
  onMarkerClick,
  selectedMarker,
}) {
  const [scene, setScene] = useState(null);

  return (
    <group>
      <Model model={model} onLoaded={setScene} />

      {scene && (
        <InternalHeartMarkers
          scene={scene}
          onMarkerClick={onMarkerClick}
          selectedMarker={selectedMarker}
        />
      )}
    </group>
  );
}