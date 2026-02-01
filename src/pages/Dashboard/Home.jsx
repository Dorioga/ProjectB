import { useEffect, useMemo, useState } from "react";
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
import useStudent from "../../lib/hooks/useStudent";
import { getCurrentTheme } from "../../utils/themeManager";

const DashHome = () => {
  const { students, reload } = useStudent();
  const [selectedJourney, setSelectedJourney] = useState("todas");

  // Cargar estudiantes cuando se monta el componente
  useEffect(() => {
    reload();
  }, [reload]);

  // Extraer jornadas únicas de los estudiantes
  const jornadas = useMemo(() => {
    const uniqueJourneys = [
      ...new Set(students.map((student) => student.journey)),
    ].filter(Boolean);
    return uniqueJourneys;
  }, [students]);

  // Filtrar estudiantes por jornada seleccionada
  const filteredStudents = useMemo(() => {
    if (selectedJourney === "todas") {
      return students;
    }
    return students.filter((student) => student.journey === selectedJourney);
  }, [students, selectedJourney]);

  // Calcular datos para el gráfico basado en estudiantes filtrados por jornada
  const studentData = useMemo(() => {
    const gradeCount = {};

    filteredStudents.forEach((student) => {
      const grade = student.grade_scholar;
      const journey = student.journey;

      if (grade) {
        if (!gradeCount[grade]) {
          gradeCount[grade] = {
            grade: `${grade}°`,
            MAÑANA: 0,
            TARDE: 0,
            total: 0,
          };
        }

        if (journey === "MAÑANA" || journey === "Mañana") {
          gradeCount[grade].MAÑANA++;
        } else if (journey === "TARDE" || journey === "Tarde") {
          gradeCount[grade].TARDE++;
        }
        gradeCount[grade].total++;
      }
    });

    return Object.values(gradeCount).sort(
      (a, b) => parseInt(a.grade) - parseInt(b.grade),
    );
  }, [filteredStudents]);

  return (
    <div className="h-full gap-6 flex flex-col text-text overflow-auto">
      {/* --- Encabezado con selector de jornada --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Panel principal</h1>

        <div className="flex items-center gap-2">
          <label htmlFor="journey-select" className="text-sm font-medium">
            Jornada:
          </label>
          <select
            id="journey-select"
            value={selectedJourney}
            onChange={(e) => setSelectedJourney(e.target.value)}
            className="border p-2 rounded bg-input"
          >
            <option value="todas">Todas las jornadas</option>
            {jornadas.map((journey) => (
              <option key={journey} value={journey}>
                {journey}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Tarjetas de Estadísticas --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de estudiantes"
          value={filteredStudents.length + " / " + students.length}
        />
        <StatCard title="Grados Activos" value={studentData.length} />
        <StatCard title="Jornadas" value={jornadas.length} />
        <StatCard
          title="Jornada actual"
          value={selectedJourney === "todas" ? "Todas" : selectedJourney}
        />
      </div>

      {/* --- Gráfico y Tabla --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Apilado */}
        <div className="lg:col-span-2 bg-background p-6 rounded-lg shadow flex flex-col">
          <h3 className="font-semibold mb-4">
            Estudiantes por grado y jornada (apilado)
            {selectedJourney !== "todas" && ` - ${selectedJourney}`}
          </h3>
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                {/* stackId="a" hace que las barras se apilen */}
                <Bar
                  dataKey="MAÑANA"
                  stackId="a"
                  fill={getCurrentTheme()["color-secondary"] || "#ff9300"}
                  name="Mañana"
                />
                <Bar
                  dataKey="TARDE"
                  stackId="a"
                  fill={getCurrentTheme()["color-primary"] || "#0141a3"}
                  name="Tarde"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de Resumen por Grado */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Resumen por grado</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary text-surface">
                <tr>
                  <th className="p-2 text-left">Grado</th>
                  {selectedJourney === "todas" && (
                    <>
                      <th className="p-2 text-center">Mañana</th>
                      <th className="p-2 text-center">Tarde</th>
                    </>
                  )}
                  <th className="p-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {studentData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-semibold">{item.grade}</td>
                    {selectedJourney === "todas" && (
                      <>
                        <td className="p-2 text-center">{item.MAÑANA}</td>
                        <td className="p-2 text-center">{item.TARDE}</td>
                      </>
                    )}
                    <td className="p-2 text-center font-bold">{item.total}</td>
                  </tr>
                ))}
                {studentData.length > 0 && (
                  <tr className="bg-gray-100 font-bold">
                    <td className="p-2">Total</td>
                    {selectedJourney === "todas" && (
                      <>
                        <td className="p-2 text-center">
                          {studentData.reduce(
                            (sum, item) => sum + item.MAÑANA,
                            0,
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {studentData.reduce(
                            (sum, item) => sum + item.TARDE,
                            0,
                          )}
                        </td>
                      </>
                    )}
                    <td className="p-2 text-center">
                      {filteredStudents.length}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashHome;

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
