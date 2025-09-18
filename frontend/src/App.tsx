
import './App.css'
import FormBuilder from './components/FormBuilder';
import { Toaster } from './components/ui/sonner';

function App() {
  

  return (
    <>
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold text-center ">Dynamic Form Builder</h1>
      <FormBuilder />
      <Toaster/>
    </div>
    </>
  )
}

export default App
