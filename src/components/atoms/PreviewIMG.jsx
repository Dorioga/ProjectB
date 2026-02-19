import React, { useEffect, useState } from "react";

const PreviewIMG = ({ path, size }) => {
  const [src, setSrc] = useState(path || "/logo-school.svg");

  useEffect(() => {
    setSrc(path || "/logo-school.svg");
  }, [path]);

  let imgSizeClass = "";
  let aspectRatioClass = "";

  if (size === "logo") {
    imgSizeClass = "w-20 h-20";
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
    if (src !== "/logo-school.svg") setSrc("/logo-school.svg");
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
