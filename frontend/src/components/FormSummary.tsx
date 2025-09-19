import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

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

export default function FormSummary() {
  const [responses, setResponses] = useState<ResponseType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResponses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/forms/responses");
      if (Array.isArray(res.data.data)) {
        setResponses(res.data.data);
      } else {
        setResponses([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch responses");
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  
  const totalResponses = responses.length;

  const lastSubmitted = totalResponses
    ? new Date(
        Math.max(...responses.map((r) => new Date(r.submittedAt).getTime()))
      ).toLocaleString()
    : "N/A";

  // Unique forms count
  const uniqueForms = useMemo(() => {
    const ids = new Set(responses.map((r) => r.formId));
    return ids.size;
  }, [responses]);

  

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold"> Form Summary</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500 text-sm">Total Responses</p>
            <p className="text-xl font-bold">{totalResponses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500 text-sm">Unique Forms</p>
            <p className="text-xl font-bold">{uniqueForms}</p>
          </CardContent>
        </Card>

      

        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500 text-sm">Last Submitted At</p>
            <p className="text-md font-semibold">{lastSubmitted}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Responses */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Responses</h2>
        {loading ? (
          <p>Loading...</p>
        ) : responses.length === 0 ? (
          <p className="text-gray-500">No responses yet</p>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-auto">
            {responses.slice(0, 5).map((r) => (
              <Card key={r._id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Form ID: {r.formId}</span>
                    <span>{new Date(r.submittedAt).toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    {Array.isArray(r.answers) && r.answers.length > 0 ? (
                      r.answers.map((a, idx) => (
                        <p key={idx}>
                          <span className="font-medium">{a.label}: </span>
                          {a.value}
                        </p>
                      ))
                    ) : (
                      <p className="italic text-gray-500">No answers</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
