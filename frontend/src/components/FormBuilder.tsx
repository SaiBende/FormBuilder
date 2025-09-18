import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FieldType = "text" | "textarea" | "date" | "dropdown";

type Field = {
  id: string;
  type: FieldType;
  label: string;
  options?: string[]; // only for dropdown
  _newOption?: string; // temporary input state for dropdown
};

export default function FormBuilder() {
  const [fields, setFields] = useState<Field[]>([]);

  // Add new field
  const addField = (type: FieldType) => {
    setFields([
      ...fields,
      { id: Date.now().toString(), type, label: `${type} field` },
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

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      {/* Left: Form Builder Controls */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Form Builder</h2>

        {/* Add field buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => addField("text")}>+ Text</Button>
          <Button onClick={() => addField("textarea")}>+ Textarea</Button>
          <Button onClick={() => addField("date")}>+ Date</Button>
          <Button onClick={() => addField("dropdown")}>+ Dropdown</Button>
        </div>

        {/* List of added fields */}
        <div className="space-y-4 mt-4">
          {fields.map((f) => (
            <div key={f.id} className="p-4 border rounded-lg space-y-2">
              {/* Label edit */}
              <Input
                value={f.label}
                onChange={(e) => updateField(f.id, { label: e.target.value })}
              />

              {/* Dropdown options editor */}
              {f.type === "dropdown" && (
                <div className="space-y-2">
                  {/* Add option input */}
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

                  {/* Show current options */}
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

              {/* Remove field button */}
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

      {/* Right: Live Preview */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Preview</h2>
        <form className="space-y-4">
          {fields.map((f) => (
            <div key={f.id} className="space-y-1">
              <label className="block font-medium">{f.label}</label>
              {f.type === "text" && <Input placeholder="Enter text" />}
              {f.type === "textarea" && (
                <Textarea placeholder="Enter long text..." />
              )}
              {f.type === "date" && <Input type="date" />}
              {f.type === "dropdown" && (
                <select className="border p-2 rounded w-full">
                  {(f.options || []).map((opt, idx) => (
                    <option key={idx}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </form>
      </div>
    </div>
  );
}
