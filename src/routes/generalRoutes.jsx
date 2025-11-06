
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import DashboardTemplate from "../components/templates/DashboardTemplate";
import DashHome from "../pages/Dashboard/Home";
import Reports from "../pages/Dashboard/Reports";
import AllStudent from "../pages/Student/AllStudent";
import RegisterStudent from "../pages/Student/RegisterStudent";
import RegisterParents from "../pages/Student/RegisterParents";
import RegisterSchool from "../pages/School/RegisterSchool";
import UpdateSchool from "../pages/School/UpdateSchool";
import SingleStudent from "../pages/Student/SingleStudent";
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
            <Route path="registerStudent" element={<RegisterStudent />} />
            <Route path="registerParents" element={<RegisterParents />} />
            <Route path="registerSchool" element={<RegisterSchool />} />
            <Route path="updateSchool" element={<UpdateSchool />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};
export default GeneralRoutes;
