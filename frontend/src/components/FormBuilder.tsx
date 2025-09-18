import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type FieldType = "text" | "textarea" | "date" | "dropdown";

type Field = {
  id: string;
  type: FieldType;
  label: string;
  options?: string[];
  _newOption?: string;

  required?: boolean;
  format?: "email" | "number" | null;
};

export default function FormBuilder() {
  const [fields, setFields] = useState<Field[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Add new field
  const addField = (type: FieldType) => {
    setFields([
      ...fields,
      {
        id: Date.now().toString(),
        type,
        label: `${type} field`,
        required: false,
        format: null,
      },
    ]);
  };

  // Update field
  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  // Remove field
  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  // Handle preview form input change
  const handleInputChange = (id: string, value: string) => {
    setAnswers({ ...answers, [id]: value });
  };

  // Validate and submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      const value = answers[f.id] || "";

      if (f.required && !value.trim()) {
        toast.error(`${f.label} is required`);
        return;
      }

      if (f.format === "email" && value && !/^\S+@\S+\.\S+$/.test(value)) {
        toast.error(`${f.label} must be a valid email`);
        return;
      }

      if (f.format === "number" && value && isNaN(Number(value))) {
        toast.error(`${f.label} must be a number`);
        return;
      }
    }

    toast.success("Form submitted successfully!");
  };

  // 🟢 Generate JSON Schema live
  const schema = useMemo(() => {
    return {
      title: "Generated Form Schema",
      fields: fields.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        required: f.required || false,
        format: f.format || undefined,
        options: f.type === "dropdown" ? f.options || [] : undefined,
      })),
    };
  }, [fields]);

  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      {/* Left: Form Builder Controls */}
      <div className="space-y-4 col-span-1">
        <h2 className="text-xl font-bold">Form Builder</h2>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => addField("text")}>+ Text</Button>
          <Button onClick={() => addField("textarea")}>+ Textarea</Button>
          <Button onClick={() => addField("date")}>+ Date</Button>
          <Button onClick={() => addField("dropdown")}>+ Dropdown</Button>
        </div>

        <div className="space-y-4 mt-4">
          {fields.map((f) => (
            <div key={f.id} className="p-4 border rounded-lg space-y-2">
              {/* Label edit */}
              <Input
                value={f.label}
                onChange={(e) => updateField(f.id, { label: e.target.value })}
              />

              {/* Validation controls */}
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) =>
                      updateField(f.id, { required: e.target.checked })
                    }
                  />
                  Required
                </label>

                {(f.type === "text" || f.type === "textarea") && (
                  <select
                    className="border p-1 rounded"
                    value={f.format ?? ""}
                    onChange={(e) =>
                      updateField(f.id, {
                        format: e.target.value
                          ? (e.target.value as "email" | "number")
                          : null,
                      })
                    }
                  >
                    <option value="">No format</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                  </select>
                )}
              </div>

              {/* Dropdown options editor */}
              {f.type === "dropdown" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="New option"
                      value={f._newOption ?? ""}
                      onChange={(e) =>
                        updateField(f.id, { _newOption: e.target.value })
                      }
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (f._newOption && f._newOption.trim() !== "") {
                          updateField(f.id, {
                            options: [...(f.options || []), f._newOption.trim()],
                            _newOption: "",
                          });
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="space-y-1">
                    {(f.options || []).map((opt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <span>{opt}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newOpts = [...(f.options || [])];
                            newOpts.splice(idx, 1);
                            updateField(f.id, { options: newOpts });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    {(f.options || []).length === 0 && (
                      <p className="text-sm text-gray-500">No options yet.</p>
                    )}
                  </div>
                </div>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeField(f.id)}
              >
                Remove Field
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Middle: Live Preview */}
      <div className="space-y-4 col-span-1">
        <h2 className="text-xl font-bold">Preview</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div key={f.id} className="space-y-1">
              <label className="block font-medium">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              {f.type === "text" && (
                <Input
                  placeholder="Enter text"
                  value={answers[f.id] || ""}
                  onChange={(e) => handleInputChange(f.id, e.target.value)}
                />
              )}
              {f.type === "textarea" && (
                <Textarea
                  placeholder="Enter long text..."
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
                  {(f.options || []).map((opt, idx) => (
                    <option key={idx}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {fields.length > 0 && (
            <Button type="submit" className="mt-4">
              Submit Form
            </Button>
          )}
        </form>
      </div>

      {/* Right: JSON Schema View */}
      <div className="space-y-4 col-span-1">
        <h2 className="text-xl font-bold">JSON Schema</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-[500px]">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </div>
    </div>
  );
}
