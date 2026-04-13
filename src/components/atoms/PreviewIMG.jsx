import React, { useEffect, useState } from "react";

const PreviewIMG = ({ path, size }) => {
  const [src, setSrc] = useState(path || "/2.png");

  useEffect(() => {
    setSrc(path || "/2.png");
  }, [path]);

  let imgSizeClass = "";
  let aspectRatioClass = "";

  if (size === "logo") {
    imgSizeClass = " w-23 h-23 landscape:w-25  landscape:h-25";
    aspectRatioClass = "aspect-square"; // 1:1
  } else if (size === "carnet") {
    imgSizeClass = "w-65 h-65";
    aspectRatioClass = "aspect-square";
  } else if (size === "profile") {
    imgSizeClass = "w-48 h-48";
    aspectRatioClass = "aspect-square"; // 1:1
  } else if (size === "card") {
    imgSizeClass = "w-full";
    aspectRatioClass = "aspect-[4/3]"; // 4:3
  } else if (size === "banner") {
    imgSizeClass = "w-full";
    aspectRatioClass = "aspect-[16/9]"; // 16:9
  }

  const handleError = () => {
    // fallback to built-in svg logo when original source fails
    if (src !== "/2.png") setSrc("/2.png");
  };

  return (
    <div className="">
      <img
        src={src}
        alt="Vista previa"
        title="Vista previa"
        onError={handleError}
        className={`${imgSizeClass} ${aspectRatioClass} object-cover rounded`}
      />
    </div>
  );
};

export default PreviewIMG;
