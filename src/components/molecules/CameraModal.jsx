import { Aperture, Save } from "lucide-react";
import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import Modal from "../atoms/Modal";
import SimpleButton from "../atoms/SimpleButton";

const CameraModal = ({ isOpen, onClose, onImageCapture }) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  const savePhoto = () => {
    if (image && onImageCapture) {
      // Convertir base64 a File object
      fetch(image)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `photo_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onImageCapture(file, image); // Envía tanto el File como la preview
        });
    }
    setImage(null);
    onClose();
  };

  const handleClose = () => {
    setImage(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tomar Foto con Cámara">
      <div className="grid grid-cols-2 gap-4 bg-white text-center">
        <h1 className="text-3xl font-bold col-span-2">Foto Estudiante</h1>
        <div className="grid grid-cols-1 xl:grid-cols-2 col-span-2 gap-2 place-items-center">
          <div className="grid grid-cols-1 place-items-center gap-4">
            <h2 className="text-2xl text-center font-semibold">Cámara</h2>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.8}
              width={320}
              height={240}
              className="w-full"
            />
          </div>
          {image && (
            <div className="grid grid-cols-1 gap-4 h-full place-items-center text-center xl:place-items-start">
              <h2 className="text-2xl text-center font-semibold w-full">
                Vista Previa
              </h2>
              <img
                src={image}
                alt="Foto tomada"
                className="aspect-4/3 w-3/5 xl:w-full"
              />
            </div>
          )}
        </div>

        <SimpleButton
          onClick={capture}
          msj="Tomar Foto"
          bg="bg-accent"
          icon="Aperture"
          text="text-white"
        />
        <SimpleButton
          onClick={savePhoto}
          disabled={!image}
          msj="Guardar Foto"
          icon="Save"
          bg={image ? "bg-primary" : "bg-gray-400"}
          text="text-white"
        />
      </div>
    </Modal>
  );
};

export default CameraModal;
