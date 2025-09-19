import { BrowserRouter, Routes, Route } from "react-router-dom";
import FormBuilder from "./components/FormBuilder";
import FormResponse from "./components/FormResponse";
import FormSummary from "./components/FormSummary";
import { Toaster } from "sonner";

function App() {
  return (
    <>   
    <h1 className="text-2xl font-bold text-center mb-6"> Dynamic Form App </h1>
    <BrowserRouter>
     
      <Routes>
       
        {/* Form creation */}
        <Route path="/" element={<FormBuilder />} />

        {/* Fill a form by ID */}
        <Route path="/forms/:id" element={<FormResponse />} />

        {/* View summary of responses */}
        <Route path="/summary" element={<FormSummary />} />
        
      </Routes>
    </BrowserRouter>
    <Toaster />
    </>
  );
}

export default App;
