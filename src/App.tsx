import { BrowserRouter, Routes, Route } from "react-router-dom"
import NotFound from "./pages/NotFound"

function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* landing-page */}
                    <Route path="/" element={<></>} />
                    {/* video-kyc  */}
                    <Route path="/video-kyc" element={<></>} />
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
