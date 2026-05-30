import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/Login/ForgotPassword";
import RequireAuth from "../components/RequireAuth";
import DashboardTemplate from "../components/templates/DashboardTemplate";
import DashHome from "../pages/Dashboard/Home";
import RegisterUser from "../pages/Dashboard/RegisterUser";
import AllStudent from "../pages/Student/AllStudent";
import RegisterParents from "../pages/Student/RegisterParents";
import SearchStudents from "../pages/Student/SearchStudents";
import ManageLogro from "../pages/Teacher/ManageLogro";
import ManageTeacher from "../pages/Teacher/ManageTeacher";
import ManageStudent from "../pages/Student/ManageStudent";
import ManageSchools from "../pages/School/ManageSchools";
import ProfileSchoolPage from "../pages/School/ProfileSchoolPage";
import ManageSedes from "../pages/School/ManageSedes";
import ManageAsignature from "../pages/School/ManageAsignature";
import ManageGrade from "../pages/School/ManageGrade";
import ProfileTeacherPage from "../pages/Teacher/ProfileTeacherPage";
import ManageAssistance from "../pages/Teacher/ManageAssistance";
import ControlAsistencia from "../pages/Teacher/ControlAsistencia";
import ManageNote from "../pages/Teacher/ManageNote";
import StudentNotes from "../pages/Student/StudentNotes";
import ProfileStudentPage from "../pages/Student/ProfileStudentPage";
import ManageObserver from "../pages/Student/ManageObserver";
import AssistenceStudent from "../pages/Student/AssistenceStudent";
import ReserveSpot from "../components/templates/ReserveSpot";
import ManageDBA from "../pages/Teacher/ManageDBA";
import ManageBoletin from "../pages/School/ManageBoletin";
import Slots from "../pages/Dashboard/Slots";
import ControlNotas from "../pages/Dashboard/ControlNotas";
import ControlAccesoSalida from "../pages/School/ControlAccesoSalida";

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
            <Route path="home" element={<DashHome />} />
            <Route path="registerUser" element={<RegisterUser />} />
            <Route path="studentSchool" element={<AllStudent />} />
            <Route path="searchStudents" element={<SearchStudents />} />
            <Route path="profileSchool" element={<ProfileSchoolPage />} />
            <Route path="profileTeacher" element={<ProfileTeacherPage />} />
            <Route path="profileStudent" element={<ProfileStudentPage />} />
            <Route path="registerParents" element={<RegisterParents />} />
            <Route path="reserveSpot" element={<ReserveSpot />} />
            <Route path="manageTeacher" element={<ManageTeacher />} />
            <Route path="manageLogro" element={<ManageLogro />} />
            <Route path="manageStudent" element={<ManageStudent />} />
            <Route path="manageSchools" element={<ManageSchools />} />
            <Route path="manageSedes" element={<ManageSedes />} />
            <Route path="manageAsignature" element={<ManageAsignature />} />
            <Route path="manageGrade" element={<ManageGrade />} />
            <Route path="manageAssistance" element={<ManageAssistance />} />
            <Route path="controlAsistencia" element={<ControlAsistencia />} />
            <Route path="manageNote" element={<ManageNote />} />
            <Route path="studentNotes" element={<StudentNotes />} />
            <Route path="assistenceStudent" element={<AssistenceStudent />} />
            <Route path="manageObserver" element={<ManageObserver />} />
            <Route path="manageDBA" element={<ManageDBA />} />
            <Route path="manageBoletin" element={<ManageBoletin />} />
            <Route path="slots" element={<Slots />} />
            <Route path="controlNotas" element={<ControlNotas />} />
            <Route
              path="controlAccesoSalida"
              element={<ControlAccesoSalida />}
            />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default GeneralRoutes;
