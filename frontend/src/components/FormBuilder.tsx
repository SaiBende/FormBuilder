import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

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

type AnswerType = {
  label: string;
  value: string;
};

type ResponseType = {
  _id: string;
  formId: string;
  answers: AnswerType[];
  submittedAt: string;
};

export default function FormBuilder() {
  const [fields, setFields] = useState<Field[]>([]);
  const [recent, setRecent] = useState<ResponseType[]>([]);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const addField = (type: FieldType) => {
    setFields([
      ...fields,
      {
        id: Date.now().toString() + "-" + type,
        type,
        label: `${type} field`,
        required: false,
        format: null,
      },
    ]);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const fetchRecent = async () => {
    try {
      const res = await axios.get("http://localhost:5000/forms/responses");
      if (Array.isArray(res.data.data)) {
        setRecent(res.data.data);
      } else {
        setRecent([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch recent responses");
      setRecent([]);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  // Save form → backend returns formId
 const saveForm = async () => {
  try {
    const res = await axios.post("http://localhost:5000/forms/create", schema);
    
    // ✅ backend response structure has { success, data }
    const formId = res.data?.data?._id;
    if (!formId) {
      toast.error("Form ID not found in response");
      return;
    }

    const link = `${window.location.origin}/forms/${formId}`;
    setShareLink(link);
    toast.success("Form saved successfully!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to save form");
  }
};


  // 🟢 Schema for preview
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

        {fields.length > 0 && (
          <Button onClick={saveForm} className="mt-4">
            Save Form
          </Button>
        )}

        {shareLink && (
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <p className="font-medium">Share this form:</p>
            <a
              href={shareLink}
              target="_blank"
              className="text-blue-600 underline"
            >
              {shareLink}
            </a>
          </div>
        )}
      </div>

      {/* Middle: Preview (read-only) */}
      <div className="space-y-4 col-span-1">
        <h2 className="text-xl font-bold">Preview</h2>
        <form className="space-y-4 bg-white p-4 rounded border">
          {fields.length === 0 && (
            <p className="text-gray-500 italic">No fields yet...</p>
          )}

          {fields.map((f) => (
            <div key={f.id} className="space-y-1">
              <label className="block font-medium">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              {f.type === "text" && <Input disabled placeholder="Text input" />}
              {f.type === "textarea" && (
                <Textarea disabled placeholder="Textarea input" />
              )}
              {f.type === "date" && <Input type="date" disabled />}
              {f.type === "dropdown" && (
                <select className="border p-2 rounded w-full" disabled>
                  <option>Select...</option>
                  {(f.options || []).map((opt, idx) => (
                    <option key={idx}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </form>
      </div>

      {/* Right: JSON Schema + Recent */}
      <div className="space-y-4 col-span-1">
        <h2 className="text-xl font-bold">JSON Schema</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-[300px]">
          {JSON.stringify(schema, null, 2)}
        </pre>

        <h2 className="text-xl font-bold">Recent Responses</h2>
        <div className="space-y-2 max-h-[300px] overflow-auto bg-gray-50 p-2 rounded">
          {recent.map((r) => (
            <div key={r._id} className="border rounded p-2 text-sm bg-white">
              <p className="font-semibold">Form: {r.formId}</p>
              <p className="text-xs text-gray-500">
                {new Date(r.submittedAt).toLocaleString()}
              </p>
              <div className="text-xs bg-gray-100 p-2 rounded space-y-1">
                {Array.isArray(r.answers) && r.answers.length > 0 ? (
                  r.answers.map((a, idx) => (
                    <p key={idx}>
                      <span className="font-medium">{a.label}: </span>
                      <span>{a.value}</span>
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No answers</p>
                )}
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="text-gray-500 text-sm">No responses yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
