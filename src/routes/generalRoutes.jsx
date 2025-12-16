import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import DashboardTemplate from "../components/templates/DashboardTemplate";
import DashHome from "../pages/Dashboard/Home";
import Reports from "../pages/Dashboard/Reports";
import AllStudent from "../pages/Student/AllStudent";
import RegisterStudent from "../pages/Student/RegisterStudent";
import RegisterParents from "../pages/Student/RegisterParents";
import ManageSchool from "../pages/School/ManageSchool";
import SingleStudent from "../pages/Student/SingleStudent";
import SearchStudents from "../pages/Student/SearchStudents";
import Auditory from "../pages/Dashboard/Auditory";
import RegisterAsignature from "../pages/GradeRecords/RegisterAsignature";
import RegisterRecords from "../pages/GradeRecords/RegisterRecords";
import RegisterTeacher from "../pages/Teacher/RegisterTeacher";
import RegisterGrade from "../pages/School/RegisterGrade";
const GeneralRoutes = () => {
  return (
    <div id="body" className="w-full h-screen flex flex-col ">
      <div className="flex grow">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="dashboard" element={<DashboardTemplate />}>
            <Route path="home" element={<DashHome />} />
            <Route path="studentSchool" element={<AllStudent />} />
            <Route path="singleStudent" element={<SingleStudent />} />
            <Route path="searchStudents" element={<SearchStudents />} />
            <Route path="registerStudent" element={<RegisterStudent />} />
            <Route path="registerParents" element={<RegisterParents />} />
            <Route
              path="registerSchool"
              element={<Navigate to="../manageSchool/register" replace />}
            />
            <Route
              path="updateSchool"
              element={<Navigate to="../manageSchool/update" replace />}
            />
            <Route path="manageSchool/:mode" element={<ManageSchool />} />
            <Route path="reports" element={<Reports />} />
            <Route path="auditory" element={<Auditory />} />
            <Route path="registerAsignature" element={<RegisterAsignature />} />
            <Route path="registerRecords" element={<RegisterRecords />} />
            <Route path="registerTeacher" element={<RegisterTeacher />} />
            <Route path="registerGrade" element={<RegisterGrade />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};
export default GeneralRoutes;
