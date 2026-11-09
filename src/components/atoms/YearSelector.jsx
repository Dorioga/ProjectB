import React from "react";

const YEAR_OPTIONS = [2026, 2027];

const YearSelector = ({
  name = "anio",
  label = "Año",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Selecciona un año",
  className = "w-full p-2 border rounded bg-surface",
  disabled = false,
  options = YEAR_OPTIONS,
}) => (
  <div>
    {label && (
      <label htmlFor={name} className={labelClassName}>
        {label}
      </label>
    )}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      aria-label={label}
    >
      <option value="">{placeholder}</option>
      {options.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  </div>
);

export default YearSelector;
