import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"
import Login from "./pages/Login"
import PublicRoute from "./routes/PublicRoutes"
// import ProtectedRoute from "./routes/ProtectedRoutes"
import Landing from "./pages/Landing"
import Dashboard from "./pages/Dashboard"
import SideBar from "./components/Sidebar"
import Header from "./components/Header"
import NotFound from "./pages/NotFound"
import PatientDetails from "./pages/PatientDetails"
import SinglePatientDetails from "./pages/SinglePatientDetails"
import ResetPassword from "./pages/ResetPassword"
import HospitalDetails from "./pages/HospitalDetails"
import TransactionDetails from "./pages/TransactionDetails"

function Layout() {
    return (
        <div className="flex items-start overflow-hidden">
            <SideBar/>
            <div>
                <Header/>
                <Outlet />
            </div>
        </div>
    )
}

function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* landing page */}
                    <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                    {/* login page */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>}/>
                    {/* rest of the pages */}
                    <Route element={<PublicRoute><Layout /></PublicRoute>}>
                        <Route path="/dashboard" element={<Dashboard/>} />
                        <Route path="/patient-details" element={<PatientDetails/>} />
                        <Route path="/patient-details/booking-details" element={<SinglePatientDetails/>} />
                        <Route path="/transaction-details" element={<TransactionDetails/>} />
                        <Route path="/hospital-details" element={<HospitalDetails/>} />
                        <Route path="/reset-password" element={<ResetPassword/>} />
                    </Route>
                    {/* not found page */}
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
