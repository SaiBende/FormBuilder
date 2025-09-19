import './App.css'
import FormBuilder from './components/FormBuilder';
import FormSummary from './components/FormSummary';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { useState } from 'react';

function App() {
  const [page, setPage] = useState<"builder" | "summary">("builder");

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Dynamic Form App
      </h1>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <Button
          onClick={() => setPage("builder")}
          className={` ${page === "builder" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Form Builder
        </Button>
        <Button
          onClick={() => setPage("summary")}
          className={`rounded ${page === "summary" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Summary
        </Button>
      </div>

      {/* Conditional Render */}
      {page === "builder" ? <FormBuilder /> : <FormSummary />}

      <Toaster />
    </div>
  )
}

export default App
