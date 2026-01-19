import { BrowserRouter, Routes, Route } from "react-router-dom"
import NotFound from "./pages/NotFound"
import PatientKyc from "./pages/PatientKyc"
import Landing from "./pages/Landing"

function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* landing-page */}
                    <Route path="/" element={<Landing/>} />
                    {/* video-kyc  */}
                    <Route path="/video-kyc" element={<PatientKyc/>} />
                    {/* video-kyc-hospital */}
                    <Route path="/video-kyc-hospital" element={<></>}/>
                    {/* thank-you */}
                    <Route path="/thank-you" element={<></>}/>
                    {/* not found page */}
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
