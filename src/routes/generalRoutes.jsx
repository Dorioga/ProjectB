import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/Login/ForgotPassword";
import RequireAuth from "../components/RequireAuth";
import DashboardTemplate from "../components/templates/DashboardTemplate";
import ReserveSpot from "../components/templates/ReserveSpot";

import Loader from "../components/atoms/Loader";

const DashHome = lazy(() => import("../pages/Dashboard/Home"));
const RegisterUser = lazy(() => import("../pages/Dashboard/RegisterUser"));
const AllStudent = lazy(() => import("../pages/Student/AllStudent"));
const RegisterParents = lazy(() => import("../pages/Student/RegisterParents"));
const SearchStudents = lazy(() => import("../pages/Student/SearchStudents"));
const ManageLogro = lazy(() => import("../pages/Teacher/ManageLogro"));
const ManageTeacher = lazy(() => import("../pages/Teacher/ManageTeacher"));
const ManageStudent = lazy(() => import("../pages/Student/ManageStudent"));
const ManageSchools = lazy(() => import("../pages/School/ManageSchools"));
const ProfileSchoolPage = lazy(
  () => import("../pages/School/ProfileSchoolPage"),
);
const ManageSedes = lazy(() => import("../pages/School/ManageSedes"));
const ManageAsignature = lazy(() => import("../pages/School/ManageAsignature"));
const ManageGrade = lazy(() => import("../pages/School/ManageGrade"));
const ProfileTeacherPage = lazy(
  () => import("../pages/Teacher/ProfileTeacherPage"),
);
const ManageAssistance = lazy(
  () => import("../pages/Teacher/ManageAssistance"),
);
const ControlAsistencia = lazy(
  () => import("../pages/Teacher/ControlAsistencia"),
);
const ManageNote = lazy(() => import("../pages/Teacher/ManageNote"));
const StudentNotes = lazy(() => import("../pages/Student/StudentNotes"));
const ProfileStudentPage = lazy(
  () => import("../pages/Student/ProfileStudentPage"),
);
const ManageObserver = lazy(() => import("../pages/Student/ManageObserver"));
const AssistenceStudent = lazy(
  () => import("../pages/Student/AssistenceStudent"),
);
const ManageDBA = lazy(() => import("../pages/Teacher/ManageDBA"));
const ManageBoletin = lazy(() => import("../pages/School/ManageBoletin"));
const Slots = lazy(() => import("../pages/Dashboard/Slots"));
const ControlNotas = lazy(() => import("../pages/Dashboard/ControlNotas"));
const ControlAccesoSalida = lazy(
  () => import("../pages/School/ControlAccesoSalida"),
);
const ProfileNoteSedePage = lazy(
  () => import("../pages/Teacher/ProfileNoteSedePage"),
);

const SuspenseFallback = () => (
  <div className="flex items-center justify-center h-full w-full">
    <Loader message="Cargando..." />
  </div>
);

const GeneralRoutes = () => {
  return (
    <div id="body" className="w-full h-screen flex flex-col ">
      <div className="flex grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reserveSpot" element={<ReserveSpot />} />
          <Route
            path="dashboard"
            element={
              <RequireAuth>
                <DashboardTemplate />
              </RequireAuth>
            }
          >
            <Route
              path="home"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <DashHome />
                </Suspense>
              }
            />
            <Route
              path="registerUser"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <RegisterUser />
                </Suspense>
              }
            />
            <Route
              path="studentSchool"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <AllStudent />
                </Suspense>
              }
            />
            <Route
              path="searchStudents"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <SearchStudents />
                </Suspense>
              }
            />
            <Route
              path="profileSchool"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ProfileSchoolPage />
                </Suspense>
              }
            />
            <Route
              path="profileTeacher"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ProfileTeacherPage />
                </Suspense>
              }
            />
            <Route
              path="profileStudent"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ProfileStudentPage />
                </Suspense>
              }
            />
            <Route
              path="registerParents"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <RegisterParents />
                </Suspense>
              }
            />
            <Route path="reserveSpot" element={<ReserveSpot />} />
            <Route
              path="manageTeacher"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageTeacher />
                </Suspense>
              }
            />
            <Route
              path="manageLogro"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageLogro />
                </Suspense>
              }
            />
            <Route
              path="manageStudent"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageStudent />
                </Suspense>
              }
            />
            <Route
              path="manageSchools"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageSchools />
                </Suspense>
              }
            />
            <Route
              path="manageSedes"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageSedes />
                </Suspense>
              }
            />
            <Route
              path="manageAsignature"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageAsignature />
                </Suspense>
              }
            />
            <Route
              path="manageGrade"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageGrade />
                </Suspense>
              }
            />
            <Route
              path="manageAssistance"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageAssistance />
                </Suspense>
              }
            />
            <Route
              path="controlAsistencia"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ControlAsistencia />
                </Suspense>
              }
            />
            <Route
              path="manageNote"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageNote />
                </Suspense>
              }
            />
            <Route
              path="studentNotes"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <StudentNotes />
                </Suspense>
              }
            />
            <Route
              path="assistenceStudent"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <AssistenceStudent />
                </Suspense>
              }
            />
            <Route
              path="manageObserver"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageObserver />
                </Suspense>
              }
            />
            <Route
              path="manageDBA"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageDBA />
                </Suspense>
              }
            />
            <Route
              path="manageBoletin"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ManageBoletin />
                </Suspense>
              }
            />
            <Route
              path="slots"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <Slots />
                </Suspense>
              }
            />
            <Route
              path="controlNotas"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ControlNotas />
                </Suspense>
              }
            />
            <Route
              path="controlAccesoSalida"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ControlAccesoSalida />
                </Suspense>
              }
            />
            <Route
              path="profileNoteSede"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ProfileNoteSedePage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default GeneralRoutes;
