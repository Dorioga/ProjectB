import { useState } from "react";

import NumberOperationsScene from "./numberOperations/NumberOperationsScene";
import DivisionScene from "./division/DivisionScene";
import MultiplicationScene from "./multiplication/MultiplicationScene";
import AdditionScene from "./addition/AdditionScene";
import SubtractionScene from "./subtraction/SubtractionScene";
import OPERATIONS from "./operations";
import OPERATION_INFO from "./operationInfo";

import CourseViewer from "../shared/CourseViewer";
import MoreInfoButton from "../shared/MoreInfoButton";

export default function MathPage() {
  // =====================================
  // OPERACIÓN SELECCIONADA
  // =====================================

  const [operation, setOperation] = useState("addition");

  // =====================================
  // CANTIDAD DE VALORES
  // =====================================

  const [numberOfValues, setNumberOfValues] = useState(2);

  // =====================================
  // VALORES
  // =====================================

  const [values, setValues] = useState(["1", "1"]);

  // =====================================
  // EVALUACIÓN
  // =====================================

  const [evaluate, setEvaluate] = useState(false);

  const currentOperationInfo = OPERATION_INFO[operation];

  // =====================================
  // CAMBIAR OPERACIÓN
  // =====================================

  const handleOperationChange = (event) => {
    const newOperation = event.target.value;

    setOperation(newOperation);

    // División siempre tiene 2 valores
    if (newOperation === "division") {
      setNumberOfValues(2);
      setValues(["10", "2"]);
      return;
    }

    // Para las demás operaciones
    setNumberOfValues(2);
    setValues(["2", "5"]);
  };

  // =====================================
  // CAMBIAR CANTIDAD DE VALORES
  // =====================================

  const handleNumberOfValuesChange = (event) => {
    const amount = Number(event.target.value);

    setNumberOfValues(amount);

    setValues((previousValues) => {
      const newValues = [...previousValues];

      while (newValues.length < amount) {
        newValues.push("");
      }

      return newValues.slice(0, amount);
    });
  };

  // =====================================
  // CAMBIAR VALOR
  // =====================================

  const handleValueChange = (index, value) => {
    setValues((previousValues) => {
      const newValues = [...previousValues];
      newValues[index] = value;
      return newValues;
    });
  };

  // =====================================
  // ESCENA SEGÚN OPERACIÓN
  // =====================================

  const renderScene = () => {
    switch (operation) {
      case "addition":
        return (
          <AdditionScene
            key={`addition-${values.join("-")}`}
            evaluate={evaluate}
            values={values}
          />
        );

      case "subtraction":
        return (
          <SubtractionScene
            key={`subtraction-${values.join("-")}`}
            evaluate={evaluate}
            values={values}
          />
        );

      case "division":
        return (
          <DivisionScene
            key={`division-${values.join("-")}`}
            evaluate={evaluate}
            values={values}
          />
        );

      case "multiplication":
        return (
          <MultiplicationScene
            key={`multiplication-${values.join("-")}`}
            evaluate={evaluate}
            values={values}
          />
        );

      default:
        return (
          <NumberOperationsScene
            key={`${operation}-${values.join("-")}`}
            evaluate={evaluate}
            operation={operation}
            values={values}
          />
        );
    }
  };

  return (
    <CourseViewer
      title="Matemáticas"
      camera={[0, 1, 11]}
      fov={50}
      controls={{ enableRotate: false, enablePan: false, enableZoom: false }}
      panel={
        <>
          {/* Operación */}
          <label className="block mb-3">
            <span className="text-xs font-medium text-gray-600">Operación</span>

            <select
              value={operation}
              onChange={handleOperationChange}
              className="mt-1 w-full rounded-[14px] border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/30 outline-none cursor-pointer"
            >
              {Object.entries(OPERATIONS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>

          {/* Cantidad de valores */}
          {operation !== "division" && (
            <label className="block mb-3">
              <span className="text-xs font-medium text-gray-600">
                Cantidad de valores
              </span>

              <select
                value={numberOfValues}
                onChange={handleNumberOfValuesChange}
                className="mt-1 w-full rounded-[14px] border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/30 outline-none cursor-pointer"
              >
                <option value={2}>2 valores</option>
                <option value={3}>3 valores</option>
                <option value={4}>4 valores</option>
                <option value={5}>5 valores</option>
              </select>
            </label>
          )}

          {/* Valores */}
          <p className="text-xs font-medium text-[#475569] mb-1">
            {operation === "division"
              ? "Dividendo y divisor"
              : "Valores a operar"}
          </p>

          {values.map((value, index) => {
            let label = `Valor ${String.fromCharCode(65 + index)}`;

            if (operation === "division") {
              label = index === 0 ? "Dividendo" : "Divisor";
            }

            return (
              <label key={index} className="block mb-3">
                <span className="text-xs font-medium text-gray-600">
                  {label}
                </span>

                <input
                  type="number"
                  value={value}
                  onChange={(event) =>
                    handleValueChange(index, event.target.value)
                  }
                  className="mt-1 w-full rounded-[14px] border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/30 outline-none"
                />
              </label>
            );
          })}

          {/* Evaluar */}
          <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={evaluate}
              onChange={(event) => setEvaluate(event.target.checked)}
              className="w-4 h-4 accent-[#1976d2]"
            />

            <span className="text-sm text-gray-700">Evaluar ejercicio</span>
          </label>

          {/* Información */}
          <div className="mt-2 pt-3 border-t border-gray-200">
            <h4 className="font-bold text-gray-800 mb-1">
              {currentOperationInfo.title}
            </h4>

            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              {currentOperationInfo.description}
            </p>

            <MoreInfoButton href={currentOperationInfo.wikipedia} />
          </div>
        </>
      }
    >
      {renderScene()}
    </CourseViewer>
  );
}