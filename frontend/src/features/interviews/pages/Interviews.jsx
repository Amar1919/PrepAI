import { useEffect, useState } from "react";
import { getInterviewHistory } from "../services/interviewService";
import InterviewGenerator from "../components/InterviewGenerator";
import InterviewHistory from "../components/InterviewHistory";
import InterviewPractice from "../components/InterviewPractice";
import { ListSkeleton } from "../../../shared/components/Skeleton";

function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const res = await getInterviewHistory();
      setInterviews(res.data.interviews);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleGenerated = (interview) => {
    setInterviews((prev) => [interview, ...prev]);
    setSelected(interview);
  };

  const handleDeleted = (id) => {
    setInterviews((prev) => prev.filter((i) => i._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  return (
    <div className="space-y-5">
      <InterviewGenerator onGenerated={handleGenerated} />

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="section-title mb-4">Your Interviews</h2>
          {loading ? (
            <ListSkeleton rows={3} />
          ) : (
            <InterviewHistory
              interviews={interviews}
              onSelect={setSelected}
              onDeleted={handleDeleted}
              selectedId={selected?._id}
            />
          )}
        </div>

        <div className="card p-5 lg:col-span-3">
          <h2 className="section-title mb-4">Practice</h2>
          <InterviewPractice interview={selected} />
        </div>
      </div>
    </div>
  );
}

export default Interviews;
