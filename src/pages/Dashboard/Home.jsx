import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashHome = () => {
  return (
    <div className="h-full gap-6 flex flex-col text-text">
      {/* --- Encabezado --- */}
      <h1 className="text-2xl font-bold">Dashboard Principal</h1>

      {/* --- Tarjetas de Estadísticas --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Estudiantes" value="370" />
        <StatCard title="Grados Activos" value="6" />
        <StatCard title="Jornadas" value="2" />
        <StatCard title="Nuevos Registros (Hoy)" value="12" />
      </div>

      {/* --- Gráfico y Actividad Reciente --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        {/* Gráfico */}
        <div className="lg:col-span-2 bg-background p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Estudiantes por Grado</h3>
          <div className="h-64 md:h-80">
            {/* Asegúrate de tener recharts instalado: npm install recharts */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#3b82f6" name="Estudiantes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Actividad Reciente</h3>
          <ul className="space-y-4">
            {recentActivity.map((activity, index) => (
              <li
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <div>
                  <p className="font-medium">{activity.name}</p>
                  <p className="text-xs text-text-secondary">
                    {activity.grade}
                  </p>
                </div>
                <span className="text-xs text-text-secondary">
                  {activity.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashHome;
// --- Datos de ejemplo ---
const studentData = [
  { grade: "6°", students: 65 },
  { grade: "7°", students: 58 },
  { grade: "8°", students: 72 },
  { grade: "9°", students: 68 },
  { grade: "10°", students: 55 },
  { grade: "11°", students: 52 },
];

const recentActivity = [
  { name: "JESUS GABRIEL CHARRIS AVILA", grade: "6° B", time: "hace 5 min" },
  { name: "MARIA FERNANDA PEREZ", grade: "8° A", time: "hace 1 hora" },
  { name: "CARLOS ANDRES GOMEZ", grade: "10° C", time: "hace 3 horas" },
  { name: "ANA SOFIA DIAZ", grade: "7° B", time: "ayer" },
];

// --- Componentes del Dashboard ---

const StatCard = ({ title, value, icon }) => (
  <div className="bg-background p-4 rounded-lg shadow">
    <div className="flex items-center">
      {icon && <div className="mr-4 text-blue-500">{icon}</div>}
      <div>
        <p className="text-sm text-text-secondary">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);
