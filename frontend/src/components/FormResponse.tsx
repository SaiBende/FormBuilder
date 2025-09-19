import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

type FieldType = {
  id: string;
  label: string;
  type: "text" | "textarea" | "date" | "dropdown";
  required?: boolean;
  options?: string[];
};

type FormSchema = {
  _id: string;
  title: string;
  fields: FieldType[];
};

export default function FormResponse() {
  const { id } = useParams(); // formId from URL
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // ✅ Fetch form schema
  useEffect(() => {
    axios
      .get(`http://localhost:5000/forms/${id}`)
      .then((res) => {
        if (res.data.success) {
          setSchema(res.data.data);
        } else {
          toast.error("Form not found");
        }
      })
      .catch(() => toast.error("Failed to load form"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleInputChange = (fid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fid]: value }));
  };

  // ✅ Validation before submit
  const validateForm = () => {
    if (!schema) return false;

    for (const field of schema.fields) {
      const value = answers[field.id]?.trim() || "";

      if (field.required && !value) {
        toast.error(`"${field.label}" is required`);
        return false;
      }

      // Example: email format validation
      if (field.type === "text" && field.label.toLowerCase().includes("email")) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          toast.error("Invalid email address");
          return false;
        }
      }
    }

    return true;
  };

  // ✅ Submit response
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schema) return;

    if (!validateForm()) return;

    const payload = {
      formId: schema._id,
      answers: schema.fields.map((f) => ({
        label: f.label,
        value: answers[f.id] || "",
      })),
      submittedAt: new Date().toISOString(),
    };

    try {
      await axios.post("http://localhost:5000/forms/submit", payload);
      toast.success("Response submitted!");
      setAnswers({});
    } catch (err) {
      toast.error("Failed to submit response");
    }
  };

  if (loading) return <p className="p-6">Loading form...</p>;
  if (!schema || !Array.isArray(schema.fields))
    return <p className="p-6 text-red-500">Form not available</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">{schema.title}</h1>
      <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
        {schema.fields.map((f) => (
          <div key={f.id}>
            <label className="block font-medium">
              {f.label} {f.required && <span className="text-red-500">*</span>}
            </label>

            {f.type === "text" && (
              <Input
                value={answers[f.id] || ""}
                onChange={(e) => handleInputChange(f.id, e.target.value)}
              />
            )}

            {f.type === "textarea" && (
              <Textarea
                value={answers[f.id] || ""}
                onChange={(e) => handleInputChange(f.id, e.target.value)}
              />
            )}

            {f.type === "date" && (
              <Input
                type="date"
                value={answers[f.id] || ""}
                onChange={(e) => handleInputChange(f.id, e.target.value)}
              />
            )}

            {f.type === "dropdown" && (
              <select
                className="border p-2 rounded w-full"
                value={answers[f.id] || ""}
                onChange={(e) => handleInputChange(f.id, e.target.value)}
              >
                <option value="">Select...</option>
                {f.options?.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
