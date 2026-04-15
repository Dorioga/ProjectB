import { useCallback, useEffect, useMemo, useState } from "react";
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
import useSchool from "../../lib/hooks/useSchool";
import useAuth from "../../lib/hooks/useAuth";
import useTeacher from "../../lib/hooks/useTeacher";
import { getCurrentTheme } from "../../utils/themeManager";
import Loader from "../../components/atoms/Loader";
import AlertTable from "../../components/molecules/AlertTable";

const DashHome = () => {
  const { reload } = useStudent();
  const { fetchAllStudents, fetchStudentAlerts } = useSchool();
  const { idInstitution, rol, idDocente, imgSchool } = useAuth();
  const { getAllStudentTeacher } = useTeacher();

  const isTeacher = Boolean(idDocente); // antiguo patrón usado en otros componentes

  const [allStudents, setAllStudents] = useState([]);
  const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(false);
  const [studentAlerts, setStudentAlerts] = useState([]);

  // Selectors state
  const [selectedSede, setSelectedSede] = useState("");
  const [selectedJourney, setSelectedJourney] = useState("todas"); // label used to filter student.journey
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedBeca, setSelectedBeca] = useState("");

  const loadAlerts = useCallback(async () => {
    // solo cargamos alertas cuando rol es 3
    if (!(rol === 3 || rol === "3")) return;

    try {
      const raw = await fetchStudentAlerts();
      setStudentAlerts(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Home - error loading alerts:", err);
    }
  }, [fetchStudentAlerts, rol]);

  // Cargar estudiantes del contexto y la lista completa desde el servicio al montar
  useEffect(() => {
    reload();
    const loadAll = async () => {
      setIsLoadingAllStudents(true);
      try {
        let arr = [];

        if (isTeacher && idDocente) {
          // cuando el usuario es docente pedimos solo sus estudiantes
          const payload = { idTeacher: Number(idDocente) };
          const res = await getAllStudentTeacher(payload);
          arr = Array.isArray(res) ? res : (res?.data ?? []);
          console.log("Home - getAllStudentTeacher response:", arr);
        } else if (idInstitution) {
          const res = await fetchAllStudents({ institucion: idInstitution });
          arr = Array.isArray(res) ? res : (res?.data ?? []);
          console.log("Home - fetchAllStudents response:", arr);
        }

        setAllStudents(arr);
      } catch (err) {
        console.error("Home - error loading students:", err);
        // fallback: dejar allStudents como []
      } finally {
        setIsLoadingAllStudents(false);
      }
    };

    loadAll();
  }, [
    reload,
    fetchAllStudents,
    idInstitution,
    isTeacher,
    idDocente,
    getAllStudentTeacher,
  ]);

  // Fuente de datos para la UI: preferimos `allStudents` (fetchAllStudents); si está vacío, usar lista vacía
  const sourceStudents = useMemo(() => {
    return Array.isArray(allStudents) && allStudents.length > 0
      ? allStudents
      : [];
  }, [allStudents]);

  // Extraer jornadas únicas de la fuente
  const jornadas = useMemo(() => {
    const set = new Set();
    (sourceStudents || []).forEach((student) => {
      const jLabel = (
        student?.nombre_jornada_estudiante ||
        student?.nombre_jornada ||
        ""
      )
        .toString()
        .trim();
      if (jLabel) set.add(jLabel);
    });
    return Array.from(set);
  }, [sourceStudents]);

  // Extraer sedes únicas (para SedeSelect `data` prop)
  const sedesFromStudents = useMemo(() => {
    const map = new Map();
    (sourceStudents || []).forEach((s) => {
      const rawId = s?.id_sede ?? s?.idSede ?? s?.school_id;
      const name = (s?.nombre_sede || s?.name_school || s?.school || "")
        .toString()
        .trim();
      // Usar nombre como clave si no hay id; admitir id === 0
      const key =
        rawId !== null && rawId !== undefined && rawId !== ""
          ? String(rawId)
          : name;
      if (name) map.set(key, { id: key, name });
    });
    return Array.from(map.values());
  }, [sourceStudents]);

  // Extraer grados únicos para un selector (dedupe por nombre)
  const gradesFromStudents = useMemo(() => {
    const map = new Map();
    (sourceStudents || []).forEach((s) => {
      const name = (s?.nombre_grado ?? String(s.grade_scholar ?? s.grade ?? ""))
        .toString()
        .trim();
      const id = String(s?.id_grado ?? s?.idGrado ?? "").trim();
      const key = name.toLowerCase();
      if (name && !map.has(key)) map.set(key, { id: id || name, name });
    });
    return Array.from(map.values()).sort((a, b) => {
      const na = Number(a.name);
      const nb = Number(b.name);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.name.localeCompare(b.name);
    });
  }, [sourceStudents]);

  // Extraer grupos únicos para un selector independiente — si hay `selectedGrade`, limitar a ese grado
  const groupsFromStudents = useMemo(() => {
    const set = new Set();
    (sourceStudents || []).forEach((s) => {
      const gradeName = (s?.nombre_grado ?? s?.grade_scholar ?? s?.grade ?? "")
        .toString()
        .trim();
      if (selectedGrade && gradeName !== String(selectedGrade).trim()) return;
      const g = (s?.grupo ?? s?.group ?? "").toString().trim();
      if (g) set.add(g);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [sourceStudents, selectedGrade]);

  // Extraer status_beca únicos (para el nuevo select)
  const becaStatuses = useMemo(() => {
    const set = new Set();
    (sourceStudents || []).forEach((s) => {
      const b = (
        s?.status_beca ??
        s?.statusBeca ??
        s?.estado_beca ??
        s?.beca_status ??
        ""
      )
        .toString()
        .trim();
      if (b) set.add(b);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [sourceStudents]);

  // Filtrar estudiantes por los selectores (sede, jornada, grado)
  const filteredStudents = useMemo(() => {
    return (sourceStudents || []).filter((student) => {
      // Sede filter (usar id_sede / nombre_sede cuando estén disponibles)
      if (selectedSede) {
        const sid = String(
          student.id_sede ?? student.idSede ?? student.school_id ?? "",
        ).trim();
        const sName = String(
          student.nombre_sede || student.name_school || student.school || "",
        )
          .trim()
          .toLowerCase();
        const sel = String(selectedSede).trim();
        if (sid) {
          // Comparar primero por id; si no coincide, comparar por nombre
          if (sid !== sel && sName !== sel.toLowerCase()) return false;
        } else {
          if (!sName.includes(sel.toLowerCase())) return false;
        }
      }

      // Jornada filter (probar varios campos de jornada / nombre de jornada)
      if (selectedJourney && selectedJourney !== "todas") {
        const sj = String(
          student.journey ||
            student.jornada ||
            student.nombre_jornada_estudiante ||
            student.nombre_jornada ||
            "",
        )
          .trim()
          .toLowerCase();
        if (sj !== String(selectedJourney).trim().toLowerCase()) return false;
      }

      // Grado filter (comparar por nombre — fallback por id si no hay nombre)
      if (selectedGrade) {
        const selected = String(selectedGrade).trim();
        const sgName = String(
          student.nombre_grado ?? student.grade_scholar ?? student.grade ?? "",
        ).trim();
        const sgId = String(student.id_grado ?? student.idGrado ?? "").trim();
        if (sgName) {
          if (sgName !== selected) return false;
        } else if (sgId) {
          if (sgId !== selected) return false;
        } else {
          return false;
        }
      }

      // Grupo filter (separado)
      if (selectedGroup) {
        const sg = String(student.grupo ?? student.group ?? "").trim();
        if (!sg || sg !== String(selectedGroup).trim()) return false;
      }

      // Beca filter (status_beca)
      if (selectedBeca) {
        const sb = String(
          student.status_beca ??
            student.statusBeca ??
            student.estado_beca ??
            student.beca_status ??
            "",
        ).trim();
        if (!sb || sb !== String(selectedBeca).trim()) return false;
      }

      return true;
    });
  }, [
    sourceStudents,
    selectedSede,
    selectedJourney,
    selectedGrade,
    selectedGroup,
    selectedBeca,
  ]);

  // Calcular datos para el gráfico basado en estudiantes filtrados por los selectores
  const studentData = useMemo(() => {
    const gradeCount = {};

    filteredStudents.forEach((student) => {
      const grade =
        (student.nombre_grado ?? student.grade_scholar ?? student.grade) || "";
      const journey =
        student.nombre_jornada_estudiante ||
        student.nombre_jornada ||
        student.journey ||
        student.jornada ||
        "";

      if (grade) {
        if (!gradeCount[grade]) {
          gradeCount[grade] = {
            grade: `${grade}°`,
            MAÑANA: 0,
            TARDE: 0,
            total: 0,
          };
        }

        const j = String(journey || "").toUpperCase();
        if (j === "MAÑANA" || j === "MAÑAN A") {
          gradeCount[grade].MAÑANA++;
        } else if (j === "TARDE") {
          gradeCount[grade].TARDE++;
        }
        gradeCount[grade].total++;
      }
    });

    return Object.values(gradeCount).sort(
      (a, b) => Number(a.grade) - Number(b.grade),
    );
  }, [filteredStudents]);

  if (rol === 5 || rol === "5" || rol === 6 || rol === "6") {
    return (
      <div
        className="h-full w-full"
        style={{
          backgroundImage: `url(${imgSchool})`,
          backgroundColor: "rgba(240,244,248,0.5)", // ligero fondo semi-transparente
          backgroundSize: "40% auto", // más pequeña que el contenedor
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.5, // transparencia total del div
        }}
      />
    );
  }

  return (
    <div className=" p-6  h-full gap-4 flex flex-col">
      {isLoadingAllStudents && (
        <Loader message="Cargando estudiantes..." size={96} />
      )}
      {/* --- Encabezado con selector de jornada --- */}

      <div className="grid grid-cols-1 2xl:grid-cols-5 justify-between items-center gap-4 bg-primary text-surface p-3 rounded-lg">
        <h1 className="text-2xl font-bold  xl:col-span-1">Panel principal</h1>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full items-center gap-3 xl:col-span-4">
          <div className="col-span-1">
            <label className="text-sm font-medium">Sede</label>
            <select
              value={selectedSede}
              onChange={(e) => setSelectedSede(e.target.value)}
              className="w-full p-2 border rounded-lg bg-input text-black bg-surface"
            >
              <option value="">Todas las sedes</option>
              {sedesFromStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="text-sm font-medium">Jornada</label>
            <select
              value={selectedJourney === "todas" ? "" : selectedJourney}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedJourney(val || "todas");
              }}
              className="w-full p-2 border rounded-lg bg-input text-black bg-surface"
            >
              <option value="">Todas</option>
              {jornadas.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="text-sm font-medium">Grado</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedGroup("");
              }}
              className="w-full p-2 border rounded-lg bg-input text-black bg-surface"
            >
              <option value="">Todos</option>
              {gradesFromStudents.map((g) => (
                <option key={g.name} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="text-sm font-medium">Grupo</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full p-2 border rounded-lg bg-input text-black bg-surface"
            >
              <option value="">Todos</option>
              {groupsFromStudents.map((gr) => (
                <option key={gr} value={gr}>
                  {gr}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="text-sm font-medium">Beca</label>
            <select
              value={selectedBeca}
              onChange={(e) => setSelectedBeca(e.target.value)}
              className="w-full p-2 border rounded-lg bg-input text-black bg-surface"
            >
              <option value="">Todos</option>
              {becaStatuses.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 ">
            <label className="text-sm font-medium text-white">Filtro </label>
            <button
              onClick={() => {
                setSelectedSede("");
                setSelectedJourney("todas");
                setSelectedGrade("");
                setSelectedGroup("");
                setSelectedBeca("");
              }}
              className="p-2 w-full rounded-lg bg-secondary text-surface "
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* --- Tarjetas de Estadísticas --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de estudiantes"
          value={`${filteredStudents.length} / ${sourceStudents.length}`}
        />
        <StatCard title="Grados Activos" value={studentData.length} />
        <StatCard title="Jornadas" value={jornadas.length} />
        <StatCard
          title="Jornada actual"
          value={selectedJourney === "todas" ? "Todas" : selectedJourney}
        />
      </div>

      {/* --- Gráfico y Tabla --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                  fill={getCurrentTheme()["color-primary"] || "#131a27"}
                  name="Tarde"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de Resumen por Grado */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Resumen por grado</h3>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm rounded-lg ">
              <thead className="bg-secondary text-surface rounded-lg ">
                <tr className="rounded-lg">
                  <th className="p-2 text-left rounded-tl-lg">Grado</th>
                  {selectedJourney === "todas" && (
                    <>
                      <th className="p-2 text-center">Mañana</th>
                      <th className="p-2 text-center">Tarde</th>
                    </>
                  )}
                  <th className="p-2 text-center rounded-tr-lg">Total</th>
                </tr>
              </thead>
              <tbody className="">
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
      {/* --- Alertas Documentales --- */}
      {(rol === "3" || rol === "2" || rol === "4") && (
        <AlertTable alerts={studentAlerts} onRefresh={loadAlerts} />
      )}
    </div>
  );
};

export default DashHome;

// --- Componentes del Dashboard ---

const StatCard = ({ title, value, icon }) => (
  <div className="bg-background p-4 rounded-lg shadow bg-secondary">
    <div className="flex items-center ">
      {icon && <div className="mr-4 text-blue-500">{icon}</div>}
      <div className="text-center w-full">
        <p className="text-sm text-surface">{title}</p>
        <p className="text-2xl font-bold text-surface">{value}</p>
      </div>
    </div>
  </div>
);
