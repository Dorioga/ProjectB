import React from "react";

const PreviewIMG = ({ path, size }) => {
  let imgSizeClass = "";
  let aspectRatioClass = "";

  if (size === "logo") {
    imgSizeClass = "w-15 h-15";
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

  return (
    <div className="">
      <img
        src={path}
        alt="Vista previa"
        title="Vista previa"
        className={`${imgSizeClass} ${aspectRatioClass} object-cover rounded`}
      />
    </div>
  );
};

export default PreviewIMG;
